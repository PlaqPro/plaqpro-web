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

test('creation projet', () => {
  const engine = new AtlasEngine();
  const project = engine.newProject('Chantier test');

  assert.ok(project instanceof ProjectState);
  assert.equal(project.type, 'project');
  assert.equal(project.value, 'Chantier test');
  assert.equal(project.status, 'active');
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

test('ajout inconnues', () => {
  const engine = new AtlasEngine();
  engine.newProject();
  const item = engine.addUnknown('Type de support');
  const question = engine.nextQuestion();

  assert.ok(item instanceof UnknownItem);
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
