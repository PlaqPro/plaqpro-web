const assert = require('node:assert/strict');
const { AtlasEngine } = require('../../core/AtlasEngine');
const { KnowledgeSource } = require('../../core/KnowledgeSchema');
const { DiagnosticEngine, DiagnosticActionType } = require('../../core/DiagnosticEngine');
const { buildSchema, listObjectives, loadObjective, validateObjective } = require('../ObjectiveRegistry');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

const requiredKeys = [
  'surface_sol',
  'type_support',
  'etat_support',
  'type_carrelage',
  'format_carrelage',
  'type_pose',
  'largeur_joint'
];

const allowedSources = ['USER', 'PHOTO', 'PLAN', 'PDF', 'MEASURE', 'AI', 'ESTIMATED'];

test('objectif carrelage charge via ObjectiveRegistry', () => {
  const objective = loadObjective('carrelage');
  const schema = buildSchema(objective);

  assert.equal(objective.id, 'objective_carrelage_v1');
  assert.equal(objective.key, 'carrelage');
  assert.equal(schema.listRequirements().length, 17);
  assert.equal(validateObjective(objective), true);
});

test('requirements obligatoires carrelage', () => {
  const schema = buildSchema(loadObjective('carrelage'));

  requiredKeys.forEach((key) => {
    const requirement = schema.getRequirement(key);

    assert.ok(requirement, `Requirement obligatoire manquant: ${key}`);
    assert.equal(requirement.required, true);
  });
});

test('sources carrelage valides', () => {
  const objective = loadObjective('carrelage');
  const knownSources = Object.values(KnowledgeSource);

  objective.requirements.forEach((requirement) => {
    requirement.acceptedSources.forEach((source) => {
      assert.equal(knownSources.includes(source), true, `Source inconnue: ${source}`);
      assert.equal(allowedSources.includes(source), true, `Source interdite pour carrelage: ${source}`);
    });
  });
});

test('diagnostic carrelage suggere les actions manquantes puis devient pret', () => {
  const schema = buildSchema(loadObjective('carrelage'));
  const atlas = new AtlasEngine();

  atlas.newProject('Diagnostic carrelage');
  atlas.setObjective('carrelage', { confidence: 1 });
  atlas.addKnowledge(35, { type: 'surface_sol', confidence: 1, source: KnowledgeSource.MEASURE });
  atlas.addKnowledge('support connu', { type: 'type_support', confidence: 1, source: KnowledgeSource.USER });
  atlas.addKnowledge('support plan', { type: 'etat_support', confidence: 1, source: KnowledgeSource.PHOTO });

  const firstReport = new DiagnosticEngine(atlas, schema).generateReport();
  const missingKeys = firstReport.missingItems.map((item) => item.key);
  const blockingKeys = firstReport.blockingItems.map((item) => item.key);
  const actionsByTarget = Object.fromEntries(
    firstReport.suggestedActions.map((action) => [action.targetRequirementKey, action.type])
  );

  assert.equal(missingKeys.includes('surface_sol'), false);
  assert.equal(missingKeys.includes('type_support'), false);
  assert.equal(missingKeys.includes('etat_support'), false);
  assert.equal(blockingKeys.includes('type_carrelage'), true);
  assert.equal(blockingKeys.includes('format_carrelage'), true);
  assert.equal(blockingKeys.includes('type_pose'), true);
  assert.equal(blockingKeys.includes('largeur_joint'), true);
  assert.equal(missingKeys.includes('ragreage'), true);
  assert.equal(actionsByTarget.type_carrelage, DiagnosticActionType.ASK_USER);
  assert.equal(actionsByTarget.format_carrelage, DiagnosticActionType.ASK_USER);
  assert.equal(actionsByTarget.type_pose, DiagnosticActionType.ASK_USER);
  assert.equal(actionsByTarget.largeur_joint, DiagnosticActionType.ASK_USER);
  assert.equal(firstReport.ready, false);

  atlas.addKnowledge('gres cerame', { type: 'type_carrelage', confidence: 1, source: KnowledgeSource.USER });
  atlas.addKnowledge('60x60', { type: 'format_carrelage', confidence: 1, source: KnowledgeSource.USER });
  atlas.addKnowledge('pose droite', { type: 'type_pose', confidence: 1, source: KnowledgeSource.USER });
  atlas.addKnowledge(3, { type: 'largeur_joint', confidence: 1, source: KnowledgeSource.MEASURE });

  const secondReport = new DiagnosticEngine(atlas, schema).generateReport();

  assert.equal(secondReport.blockingItems.length, 0);
  assert.equal(secondReport.ready, true);
});

test('ObjectiveRegistry liste doublage peinture et carrelage', () => {
  const objectiveKeys = listObjectives().map((objective) => objective.key);

  assert.equal(objectiveKeys.includes('doublage'), true);
  assert.equal(objectiveKeys.includes('peinture'), true);
  assert.equal(objectiveKeys.includes('carrelage'), true);
});