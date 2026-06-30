const assert = require('node:assert/strict');
const {
  AtlasEngine,
  ProjectState,
  KnowledgeItem,
  UnknownItem,
  Question
} = require('../AtlasEngine');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test('ensureProject leve une erreur sans projet', () => {
  const engine = new AtlasEngine();

  assert.throws(() => engine.getKnowledge(), /Atlas project not initialized/);
  assert.throws(() => engine.getUnknowns(), /Atlas project not initialized/);
});

test('creation projet', () => {
  const engine = new AtlasEngine();
  const project = engine.newProject('Chantier test');

  assert.ok(project instanceof ProjectState);
  assert.equal(project.type, 'project');
  assert.equal(project.value, 'Chantier test');
  assert.equal(project.status, 'active');
  assert.deepEqual(project.eventsLog[0].payload.value, 'Chantier test');
});

test('journal evenement projet cree', () => {
  const engine = new AtlasEngine();
  engine.newProject('Projet journalise');
  const events = engine.getEventsLog();

  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'newProject');
  assert.equal(events[0].message, 'Project created');
  assert.equal(events[0].payload.value, 'Projet journalise');
});

test('ajout connaissances', () => {
  const engine = new AtlasEngine();
  engine.newProject();
  const item = engine.addKnowledge('Surface connue', { confidence: 0.9, source: 'test' });

  assert.ok(item instanceof KnowledgeItem);
  assert.equal(item.value, 'Surface connue');
  assert.equal(item.confidence, 0.9);
  assert.equal(item.source, 'test');
  assert.equal(engine.getKnowledge().length, 1);
});

test('journal ajout connaissance', () => {
  const engine = new AtlasEngine();
  engine.newProject();
  const item = engine.addKnowledge('Support BA13', { confidence: 0.85 });
  const event = engine.getEventsLog().find((entry) => entry.type === 'addKnowledge');

  assert.ok(event);
  assert.equal(event.payload.knowledgeId, item.id);
  assert.equal(event.payload.value, 'Support BA13');
});

test('ajout inconnues', () => {
  const engine = new AtlasEngine();
  engine.newProject();
  const item = engine.addUnknown('Type de support', {
    priority: 5,
    reason: 'Conditionne le type de fixation'
  });
  const question = engine.nextQuestion();

  assert.ok(item instanceof UnknownItem);
  assert.equal(item.priority, 5);
  assert.equal(item.reason, 'Conditionne le type de fixation');
  assert.equal(engine.getUnknowns().length, 1);
  assert.ok(question instanceof Question);
  assert.equal(question.unknownId, item.id);
});

test('resolution inconnues', () => {
  const engine = new AtlasEngine();
  engine.newProject();
  const unknown = engine.addUnknown('Support');
  const result = engine.resolveUnknown(unknown.id, 'Support placo', { confidence: 0.8 });

  assert.equal(result.unknown.status, 'resolved');
  assert.equal(result.unknown.confidence, 0.8);
  assert.equal(result.knowledge.value, 'Support placo');
  assert.equal(engine.getUnknowns().length, 0);
  assert.equal(engine.getUnknowns('all').length, 1);
});

test('journal resolution inconnue', () => {
  const engine = new AtlasEngine();
  engine.newProject();
  const unknown = engine.addUnknown('Hauteur');
  const result = engine.resolveUnknown(unknown.id, '2.5m', { confidence: 0.95 });
  const event = engine.getEventsLog().find((entry) => entry.type === 'resolveUnknown');

  assert.ok(event);
  assert.equal(event.payload.unknownId, unknown.id);
  assert.equal(event.payload.knowledgeId, result.knowledge.id);
  assert.equal(event.payload.resolution, '2.5m');
});

test('nextQuestion choisit inconnue prioritaire', () => {
  const engine = new AtlasEngine();
  engine.newProject();
  engine.addUnknown('Couleur peinture', { priority: 2 });
  const urgent = engine.addUnknown('Support plafond', { priority: 9, reason: 'Impacte le chiffrage' });
  engine.addUnknown('Delai client', { priority: 4 });
  const question = engine.nextQuestion();

  assert.equal(question.unknownId, urgent.id);
  assert.equal(question.priority, 9);
  assert.equal(question.reason, 'Impacte le chiffrage');
});

test('question contient reason et priority', () => {
  const engine = new AtlasEngine();
  engine.newProject();
  const unknown = engine.addUnknown('Etat du support', {
    priority: 7,
    reason: 'Determine la preparation'
  });
  const question = engine.nextQuestion();

  assert.ok(question instanceof Question);
  assert.equal(question.unknownId, unknown.id);
  assert.equal(question.priority, 7);
  assert.equal(question.reason, 'Determine la preparation');
});

test('calcul confiance', () => {
  const engine = new AtlasEngine();
  engine.newProject();
  engine.setObjective('Faire un devis', { confidence: 1 });
  engine.addKnowledge('Surface 42m2', { confidence: 0.8 });
  engine.addUnknown('Hauteur');

  assert.equal(engine.getConfidence(), 0.75);
});

test('projet pret', () => {
  const engine = new AtlasEngine();
  engine.newProject();
  engine.setObjective('Calculer le prix', { confidence: 1 });
  engine.addKnowledge('Surface 20m2', { confidence: 0.9 });
  engine.addKnowledge('Pose standard', { confidence: 0.9 });

  assert.equal(engine.isReady(), true);
  assert.equal(engine.nextQuestion(), null);
  assert.equal(engine.generateSummary().ready, true);
});
