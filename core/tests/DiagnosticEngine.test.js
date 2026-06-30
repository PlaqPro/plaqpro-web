const assert = require('node:assert/strict');
const { AtlasEngine } = require('../AtlasEngine');
const { KnowledgeSchema, KnowledgeSource } = require('../KnowledgeSchema');
const {
  DiagnosticEngine,
  DiagnosticReport,
  DiagnosticMissingItem,
  DiagnosticAction,
  DiagnosticActionType
} = require('../DiagnosticEngine');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function createAtlas() {
  const atlas = new AtlasEngine();
  atlas.newProject('Projet diagnostic');
  atlas.setObjective('Diagnostiquer la completude', { confidence: 1 });
  return atlas;
}

test('diagnostic projet pret', () => {
  const atlas = createAtlas();
  const schema = new KnowledgeSchema();
  schema.addRequirement({ key: 'surface', label: 'Surface', required: true });
  atlas.addKnowledge(42, { type: 'surface', confidence: 0.9, source: KnowledgeSource.MEASURE });

  const diagnostic = new DiagnosticEngine(atlas, schema);
  const report = diagnostic.generateReport();

  assert.ok(report instanceof DiagnosticReport);
  assert.equal(report.ready, true);
  assert.equal(report.missingItems.length, 0);
  assert.equal(report.blockingItems.length, 0);
});

test('diagnostic projet incomplet', () => {
  const atlas = createAtlas();
  const schema = new KnowledgeSchema();
  schema.addRequirement({ key: 'surface', label: 'Surface', required: true, priority: 5 });

  const report = new DiagnosticEngine(atlas, schema).generateReport();

  assert.equal(report.ready, false);
  assert.equal(report.missingItems.length, 1);
  assert.equal(report.suggestedActions.length, 1);
});

test('requirement obligatoire manquant', () => {
  const atlas = createAtlas();
  const schema = new KnowledgeSchema();
  schema.addRequirement({ key: 'height', label: 'Hauteur', required: true });

  const diagnostic = new DiagnosticEngine(atlas, schema);
  const blockingItems = diagnostic.getBlockingItems();

  assert.equal(blockingItems.length, 1);
  assert.ok(blockingItems[0] instanceof DiagnosticMissingItem);
  assert.equal(blockingItems[0].key, 'height');
  assert.equal(blockingItems[0].required, true);
});

test('requirement optionnel manquant', () => {
  const atlas = createAtlas();
  const schema = new KnowledgeSchema();
  schema.addRequirement({ key: 'comment', label: 'Commentaire', required: false });

  const diagnostic = new DiagnosticEngine(atlas, schema);
  const missingItems = diagnostic.getMissingItems();
  const blockingItems = diagnostic.getBlockingItems(missingItems);

  assert.equal(missingItems.length, 1);
  assert.equal(blockingItems.length, 0);
});

test('actions suggerees selon source USER', () => {
  const atlas = createAtlas();
  const schema = new KnowledgeSchema();
  schema.addRequirement({
    key: 'customerChoice',
    label: 'Choix client',
    acceptedSources: [KnowledgeSource.USER]
  });

  const action = new DiagnosticEngine(atlas, schema).getSuggestedActions()[0];

  assert.ok(action instanceof DiagnosticAction);
  assert.equal(action.type, DiagnosticActionType.ASK_USER);
  assert.equal(action.targetRequirementKey, 'customerChoice');
});

test('actions suggerees selon source PHOTO', () => {
  const atlas = createAtlas();
  const schema = new KnowledgeSchema();
  schema.addRequirement({
    key: 'visualState',
    label: 'Etat visuel',
    acceptedSources: [KnowledgeSource.PHOTO]
  });

  const action = new DiagnosticEngine(atlas, schema).getSuggestedActions()[0];

  assert.equal(action.type, DiagnosticActionType.TAKE_PHOTO);
  assert.equal(action.targetRequirementKey, 'visualState');
});

test('actions triees par priorite', () => {
  const atlas = createAtlas();
  const schema = new KnowledgeSchema();
  schema.addRequirement({ key: 'low', label: 'Faible', priority: 1, acceptedSources: [KnowledgeSource.USER] });
  schema.addRequirement({ key: 'high', label: 'Forte', priority: 5, acceptedSources: [KnowledgeSource.PDF] });
  schema.addRequirement({ key: 'medium', label: 'Moyenne', priority: 3, acceptedSources: [KnowledgeSource.MEASURE] });

  const actions = new DiagnosticEngine(atlas, schema).getSuggestedActions();

  assert.deepEqual(actions.map((action) => action.targetRequirementKey), ['high', 'medium', 'low']);
  assert.deepEqual(actions.map((action) => action.priority), [5, 3, 1]);
});

test('confidence reprise depuis AtlasEngine', () => {
  const atlas = createAtlas();
  const schema = new KnowledgeSchema();
  atlas.addKnowledge('Donnee connue', { type: 'known', confidence: 0.8 });

  const report = new DiagnosticEngine(atlas, schema).generateReport();

  assert.equal(report.confidence, atlas.getConfidence());
});
