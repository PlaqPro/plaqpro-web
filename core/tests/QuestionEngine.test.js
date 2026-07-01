const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { AtlasEngine } = require('../AtlasEngine');
const { KnowledgeSource } = require('../KnowledgeSchema');
const { DiagnosticEngine, DiagnosticActionType } = require('../DiagnosticEngine');
const { QuestionEngine, UserQuestion } = require('../QuestionEngine');
const { buildSchema, loadObjective } = require('../../knowledge/ObjectiveRegistry');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function createDoublageReport() {
  const atlas = new AtlasEngine();
  const schema = buildSchema(loadObjective('doublage'));

  atlas.newProject('Questions doublage');
  atlas.setObjective('doublage', { confidence: 1 });
  atlas.addKnowledge(45, { type: 'surface_murs', confidence: 1, source: KnowledgeSource.MEASURE });
  atlas.addKnowledge('support connu', { type: 'type_support', confidence: 1, source: KnowledgeSource.USER });

  return new DiagnosticEngine(atlas, schema).generateReport();
}

test('generation depuis diagnostic doublage', () => {
  const report = createDoublageReport();
  const questions = new QuestionEngine(report).generateQuestions();
  const keys = questions.map((question) => question.requirementKey);

  assert.equal(questions.length, report.suggestedActions.length);
  assert.ok(questions[0] instanceof UserQuestion);
  assert.equal(keys.includes('surface_murs'), false);
  assert.equal(keys.includes('hauteur_sous_plafond'), true);
});

test('priorite respectee', () => {
  const report = {
    suggestedActions: [
      { type: DiagnosticActionType.ASK_USER, label: 'Basse', priority: 1, targetRequirementKey: 'low' },
      { type: DiagnosticActionType.ASK_USER, label: 'Haute', priority: 5, targetRequirementKey: 'high' },
      { type: DiagnosticActionType.ASK_USER, label: 'Moyenne', priority: 3, targetRequirementKey: 'medium' }
    ],
    missingItems: []
  };

  const questions = new QuestionEngine(report).generateQuestions();

  assert.deepEqual(questions.map((question) => question.requirementKey), ['high', 'medium', 'low']);
});

test('getNextQuestion retourne la plus prioritaire', () => {
  const report = createDoublageReport();
  const engine = new QuestionEngine(report);
  const questions = engine.generateQuestions();

  assert.equal(engine.getNextQuestion().priority, questions[0].priority);
  assert.equal(engine.getNextQuestion().requirementKey, questions[0].requirementKey);
});

test('defaultQuestions utilisees', () => {
  const report = {
    suggestedActions: [
      {
        type: DiagnosticActionType.ASK_USER,
        label: 'Surface',
        priority: 3,
        targetRequirementKey: 'surface',
        defaultQuestions: ['Quelle surface faut-il retenir ?']
      }
    ],
    missingItems: []
  };

  const question = new QuestionEngine(report).getNextQuestion();

  assert.equal(question.question, 'Quelle surface faut-il retenir ?');
});


test('reason impact example presents', () => {
  const report = createDoublageReport();
  const question = new QuestionEngine(report).getNextQuestion();

  assert.equal(typeof question.reason, 'string');
  assert.equal(question.reason.length > 0, true);
  assert.equal(typeof question.impact, 'string');
  assert.equal(question.impact.length > 0, true);
  assert.equal(typeof question.example, 'string');
  assert.equal(question.example.length > 0, true);
});

test('example adapte au type attendu', () => {
  const report = {
    suggestedActions: [
      {
        type: DiagnosticActionType.ASK_USER,
        label: 'Choix finition',
        priority: 3,
        targetRequirementKey: 'finition',
        validationRules: [{ type: 'enum', value: ['mat', 'satin'] }]
      }
    ],
    missingItems: []
  };

  const question = new QuestionEngine(report).getNextQuestion();

  assert.equal(question.expectedAnswerType, 'enum');
  assert.equal(question.example, 'mat');
});

test('UI affiche correctement les informations compactes', () => {
  const uiPath = path.join(__dirname, '..', '..', 'js', 'atlas_ui.js');
  const uiSource = fs.readFileSync(uiPath, 'utf8');

  assert.match(uiSource, /Question/);
  assert.match(uiSource, /Pourquoi/);
  assert.match(uiSource, /Exemple/);
  assert.match(uiSource, /atlas-question-detail/);
});
test('expectedAnswerType number', () => {
  const engine = new QuestionEngine({ suggestedActions: [], missingItems: [] });

  assert.equal(engine.inferExpectedAnswerType({ validationRules: [{ type: 'number' }] }), 'number');
});

test('expectedAnswerType boolean', () => {
  const engine = new QuestionEngine({ suggestedActions: [], missingItems: [] });

  assert.equal(engine.inferExpectedAnswerType({ validationRules: [{ type: 'boolean' }] }), 'boolean');
});

test('expectedAnswerType enum', () => {
  const engine = new QuestionEngine({ suggestedActions: [], missingItems: [] });

  assert.equal(engine.inferExpectedAnswerType({ validationRules: [{ type: 'enum', value: ['a', 'b'] }] }), 'enum');
});

test('action PHOTO donne expectedAnswerType photo', () => {
  const report = {
    suggestedActions: [
      {
        type: DiagnosticActionType.TAKE_PHOTO,
        label: 'Photo support',
        priority: 4,
        targetRequirementKey: 'photo_support'
      }
    ],
    missingItems: []
  };

  const question = new QuestionEngine(report).getNextQuestion();

  assert.equal(question.expectedAnswerType, 'photo');
  assert.equal(question.actionType, DiagnosticActionType.TAKE_PHOTO);
});
