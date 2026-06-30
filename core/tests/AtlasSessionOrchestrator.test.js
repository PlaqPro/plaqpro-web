const assert = require('node:assert/strict');
const { AtlasEngine } = require('../AtlasEngine');
const { ConversationEngine } = require('../ConversationEngine');
const { DiagnosticEngine } = require('../DiagnosticEngine');
const { QuestionEngine } = require('../QuestionEngine');
const { AtlasSessionOrchestrator } = require('../AtlasSessionOrchestrator');
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

function createOrchestrator() {
  const atlasEngine = new AtlasEngine();
  const conversationEngine = new ConversationEngine();
  const knowledgeSchema = buildSchema(loadObjective('doublage'));

  return {
    atlasEngine,
    conversationEngine,
    orchestrator: new AtlasSessionOrchestrator({
      atlasEngine,
      conversationEngine,
      knowledgeSchema,
      diagnosticEngineFactory: (atlas, schema) => new DiagnosticEngine(atlas, schema),
      questionEngineFactory: (report) => new QuestionEngine(report)
    })
  };
}

test('demarre une session avec objectif', () => {
  const { atlasEngine, conversationEngine, orchestrator } = createOrchestrator();
  const status = orchestrator.start('doublage');

  assert.equal(atlasEngine.project.value, 'doublage');
  assert.equal(atlasEngine.project.objective.value, 'doublage');
  assert.equal(conversationEngine.session.status, 'active');
  assert.equal(status.ready, false);
});

test('genere une premiere question', () => {
  const { orchestrator } = createOrchestrator();
  orchestrator.start('doublage');
  const question = orchestrator.generateNextQuestion();

  assert.ok(question);
  assert.ok(question.requirementKey);
  assert.ok(question.question);
});

test('enregistre la question dans ConversationEngine', () => {
  const { conversationEngine, orchestrator } = createOrchestrator();
  orchestrator.start('doublage');
  const question = orchestrator.generateNextQuestion();

  assert.equal(conversationEngine.getCurrentQuestion(), question);
  assert.equal(conversationEngine.getHistory().at(-1).type, 'question');
});

test('submitAnswer ajoute une connaissance dans AtlasEngine', () => {
  const { atlasEngine, orchestrator } = createOrchestrator();
  orchestrator.start('doublage');
  const question = orchestrator.generateNextQuestion();

  orchestrator.submitAnswer({ value: 'valeur test', source: 'user', confidence: 1 });

  const knowledge = atlasEngine.getKnowledge().find((item) => item.type === question.requirementKey);
  assert.ok(knowledge);
  assert.equal(knowledge.value, 'valeur test');
});

test('le diagnostic se met a jour', () => {
  const { orchestrator } = createOrchestrator();
  orchestrator.start('doublage');
  const before = orchestrator.getStatus();
  orchestrator.generateNextQuestion();
  orchestrator.submitAnswer({ value: 'valeur test', source: 'user', confidence: 1 });
  const after = orchestrator.getStatus();

  assert.equal(after.missingCount < before.missingCount, true);
});

test('boucle jusqu a projet pret', () => {
  const { orchestrator } = createOrchestrator();
  orchestrator.start('doublage');

  let guard = 0;
  while (!orchestrator.getStatus().ready && guard < 20) {
    const question = orchestrator.generateNextQuestion();

    if (!question) {
      break;
    }

    orchestrator.submitAnswer({
      value: answerForQuestion(question),
      source: sourceForQuestion(question),
      confidence: 1
    });
    guard += 1;
  }

  const status = orchestrator.getStatus();

  assert.equal(status.ready, true);
  assert.equal(status.blockingCount, 0);
  assert.equal(orchestrator.getSummary().diagnostic.ready, true);
});

test('aucun moteur existant modifie inutilement', () => {
  const { atlasEngine, conversationEngine, orchestrator } = createOrchestrator();
  orchestrator.start('doublage');

  assert.ok(atlasEngine instanceof AtlasEngine);
  assert.ok(conversationEngine instanceof ConversationEngine);
  assert.equal(typeof atlasEngine.addKnowledge, 'function');
  assert.equal(typeof conversationEngine.recordAnswer, 'function');
});

function answerForQuestion(question) {
  if (question.expectedAnswerType === 'number' || question.expectedAnswerType === 'range' || question.expectedAnswerType === 'measure') {
    return 10;
  }

  if (question.expectedAnswerType === 'boolean') {
    return true;
  }

  return 'valeur renseignee';
}

function sourceForQuestion(question) {
  if (question.acceptedSources.includes('MEASURE')) {
    return 'MEASURE';
  }

  if (question.acceptedSources.includes('PHOTO')) {
    return 'PHOTO';
  }

  return 'USER';
}