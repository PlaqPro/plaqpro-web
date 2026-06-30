const assert = require('node:assert/strict');
const { AtlasEngine } = require('../../core/AtlasEngine');
const { KnowledgeSchema, KnowledgeSource } = require('../../core/KnowledgeSchema');
const { DiagnosticEngine, DiagnosticActionType } = require('../../core/DiagnosticEngine');
const {
  listObjectives,
  loadObjective,
  buildSchema,
  validateObjective
} = require('../ObjectiveRegistry');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test('liste contient doublage', () => {
  const objectives = listObjectives();
  const doublage = objectives.find((objective) => objective.key === 'doublage');

  assert.ok(doublage);
  assert.equal(doublage.id, 'objective_doublage_v1');
  assert.equal(doublage.label, 'Doublage');
});

test('chargement doublage', () => {
  const objective = loadObjective('doublage');

  assert.equal(objective.key, 'doublage');
  assert.equal(objective.requirements.length, 12);
  assert.equal(validateObjective(objective), true);
});

test('conversion en KnowledgeSchema', () => {
  const objective = loadObjective('objective_doublage_v1');
  const schema = buildSchema(objective);

  assert.ok(schema instanceof KnowledgeSchema);
  assert.equal(schema.getRequirement('surface_murs').required, true);
  assert.equal(schema.getRequirement('marque_preferee').required, false);
});

test('erreur si objectif inconnu', () => {
  assert.throws(() => loadObjective('objectif_inconnu'), /Atlas objective not found/);
});

test('erreur si source invalide', () => {
  const objective = loadObjective('doublage');
  const invalidObjective = {
    ...objective,
    requirements: objective.requirements.map((requirement) => ({ ...requirement }))
  };

  invalidObjective.requirements[0].acceptedSources = ['USER', 'INVALID_SOURCE'];

  assert.throws(() => validateObjective(invalidObjective), /Invalid knowledge source/);
});

test('DiagnosticEngine fonctionne avec le schema charge', () => {
  const objective = loadObjective('doublage');
  const schema = buildSchema(objective);
  const atlas = new AtlasEngine();

  atlas.newProject('Objectif doublage via registry');
  atlas.setObjective('doublage', { confidence: 1 });
  atlas.addKnowledge(20, { type: 'surface_murs', confidence: 1, source: KnowledgeSource.MEASURE });
  atlas.addKnowledge('support connu', { type: 'type_support', confidence: 1, source: KnowledgeSource.USER });

  const report = new DiagnosticEngine(atlas, schema).generateReport();
  const actionByTarget = Object.fromEntries(
    report.suggestedActions.map((action) => [action.targetRequirementKey, action.type])
  );

  assert.equal(report.ready, false);
  assert.equal(report.blockingItems.some((item) => item.key === 'hauteur_sous_plafond'), true);
  assert.equal(actionByTarget.hauteur_sous_plafond, DiagnosticActionType.MEASURE);
});
