const assert = require('node:assert/strict');
const {
  ConversationEngine,
  ConversationSession,
  ConversationMessage,
  ConversationAnswer,
  ConversationContext
} = require('../ConversationEngine');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test('Creation session', () => {
  const engine = new ConversationEngine();
  const session = engine.startSession();

  assert.ok(session instanceof ConversationSession);
  assert.ok(session.context instanceof ConversationContext);
  assert.equal(session.status, 'active');
  assert.deepEqual(session.history, []);
});

test('Ajout messages', () => {
  const engine = new ConversationEngine();
  engine.startSession();
  const assistantMessage = engine.addAssistantMessage('Bonjour');
  const userMessage = engine.addUserMessage('Salut');

  assert.ok(assistantMessage instanceof ConversationMessage);
  assert.equal(assistantMessage.assistant, true);
  assert.equal(userMessage.user, true);
  assert.equal(engine.getHistory().length, 2);
});

test('Historique', () => {
  const engine = new ConversationEngine();
  engine.startSession();
  engine.addAssistantMessage('Question');
  engine.addUserMessage('Reponse');

  const history = engine.getHistory();

  assert.equal(history.length, 2);
  assert.equal(history[0].content, 'Question');
  assert.equal(history[1].content, 'Reponse');
});

test('Question courante', () => {
  const engine = new ConversationEngine();
  engine.startSession();
  const question = {
    requirementKey: 'surface',
    question: 'Quelle est la surface ?'
  };

  engine.setCurrentQuestion(question);

  assert.deepEqual(engine.getCurrentQuestion(), question);
  assert.deepEqual(engine.session.context.pendingRequirements, ['surface']);
});

test('Reponse enregistree', () => {
  const engine = new ConversationEngine();
  engine.startSession();
  const answer = engine.recordAnswer({
    requirementKey: 'surface',
    value: 42,
    rawValue: '42 m2',
    confidence: 0.8,
    source: 'user'
  });

  assert.ok(answer instanceof ConversationAnswer);
  assert.equal(answer.value, 42);
  assert.equal(answer.rawValue, '42 m2');
  assert.equal(answer.validated, false);
  assert.equal(engine.session.context.lastAnswer, answer);
  assert.equal(engine.getHistory().at(-1).type, 'answer');
});

test('Confirmation', () => {
  const engine = new ConversationEngine();
  engine.startSession();
  engine.setCurrentQuestion({ requirementKey: 'surface', question: 'Surface ?' });
  engine.recordAnswer({ requirementKey: 'surface', value: 42 });
  const answer = engine.confirmAnswer('surface');

  assert.equal(answer.validated, true);
  assert.deepEqual(engine.session.context.pendingRequirements, []);
  assert.deepEqual(engine.session.context.completedRequirements, ['surface']);
  assert.equal(engine.getHistory().at(-1).type, 'confirmation');
});

test('Refus', () => {
  const engine = new ConversationEngine();
  engine.startSession();
  engine.recordAnswer({ requirementKey: 'surface', value: null, confidence: 0.1 });
  const answer = engine.rejectAnswer('Valeur illisible');

  assert.equal(answer.validated, false);
  assert.equal(engine.getHistory().at(-1).type, 'error');
  assert.equal(engine.getHistory().at(-1).error.reason, 'Valeur illisible');
});

test('Resume conversation', () => {
  const engine = new ConversationEngine();
  const session = engine.startSession();
  engine.setCurrentQuestion({ requirementKey: 'surface', question: 'Surface ?' });
  engine.addAssistantMessage('Surface ?');
  engine.recordAnswer({ requirementKey: 'surface', value: 42 });
  engine.confirmAnswer('surface');
  engine.closeSession();

  const summary = engine.getConversationSummary();

  assert.equal(summary.id, session.id);
  assert.equal(summary.status, 'closed');
  assert.equal(summary.messageCount, 3);
  assert.deepEqual(summary.pendingRequirements, []);
  assert.deepEqual(summary.completedRequirements, ['surface']);
});

test('Validation session requise', () => {
  const engine = new ConversationEngine();

  assert.throws(() => engine.getHistory(), /Conversation session not initialized/);
});