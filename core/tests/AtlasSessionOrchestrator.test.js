const assert = require('node:assert/strict');
const { AtlasEngine } = require('../AtlasEngine');
const { ConversationEngine } = require('../ConversationEngine');
const { DiagnosticEngine } = require('../DiagnosticEngine');
const { QuestionEngine } = require('../QuestionEngine');
const { AtlasSessionOrchestrator, NextAction } = require('../AtlasSessionOrchestrator');
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
  assert.ok(status.progress);
  assert.ok(status.nextAction);
  assert.ok(status.summary);
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

test('progression 0 %', () => {
  const { orchestrator } = createOrchestrator();
  const status = orchestrator.start('doublage');

  assert.equal(status.progress.completionPercent, 0);
  assert.equal(status.progress.completedRequirements.length, 0);
  assert.equal(status.progress.remainingRequirements.length, 6);
  assert.equal(status.progress.blockingRequirements.length, 6);
});

test('progression intermediaire', () => {
  const { orchestrator } = createOrchestrator();
  orchestrator.start('doublage');
  const question = orchestrator.generateNextQuestion();
  orchestrator.submitAnswer({ value: answerForQuestion(question), source: sourceForQuestion(question), confidence: 1 });

  const progress = orchestrator.getProgress();

  assert.equal(progress.completionPercent, 17);
  assert.equal(progress.completedRequirements.length, 1);
  assert.equal(progress.remainingRequirements.length, 5);
  assert.equal(progress.blockingRequirements.length, 5);
});

test('progression 100 %', () => {
  const { orchestrator } = createOrchestrator();
  completeRequiredRequirements(orchestrator);

  const progress = orchestrator.getProgress();

  assert.equal(progress.completionPercent, 100);
  assert.equal(progress.completedRequirements.length, 6);
  assert.equal(progress.remainingRequirements.length, 0);
  assert.equal(progress.blockingRequirements.length, 0);
});

test('prochaine action correcte', () => {
  const { orchestrator } = createOrchestrator();
  orchestrator.start('doublage');
  const nextAction = orchestrator.getNextAction();
  const remainingActions = orchestrator.getRemainingActions();

  assert.ok(nextAction instanceof NextAction);
  assert.equal(nextAction.blocking, true);
  assert.equal(nextAction.origin, 'diagnostic');
  assert.equal(nextAction.priority, 5);
  assert.equal(nextAction.type, 'MEASURE');
  assert.equal(nextAction.label, 'Mesurer: Surface des murs');
  assert.deepEqual(remainingActions[0], nextAction);
});

test('aucune action lorsque projet termine', () => {
  const { orchestrator } = createOrchestrator();
  completeRequiredRequirements(orchestrator);

  assert.equal(orchestrator.getStatus().ready, true);
  assert.equal(orchestrator.getNextAction(), null);
  assert.deepEqual(orchestrator.getRemainingActions(), []);
  assert.equal(orchestrator.getStatus().nextAction, null);
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
  assert.equal(status.progress.completionPercent, 100);
  assert.equal(status.nextAction, null);
  assert.equal(orchestrator.getSummary().diagnostic.ready, true);
});

test('aucun moteur existant modifie inutilement', () => {
  const { atlasEngine, conversationEngine, orchestrator } = createOrchestrator();
  orchestrator.start('doublage');

  assert.ok(atlasEngine instanceof AtlasEngine);
  assert.ok(conversationEngine instanceof ConversationEngine);
  assert.equal(typeof atlasEngine.addKnowledge, 'function');
  assert.equal(typeof conversationEngine.recordAnswer, 'function');
  assert.equal(typeof orchestrator.getProgress, 'function');
});

function completeRequiredRequirements(orchestrator) {
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
}

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

