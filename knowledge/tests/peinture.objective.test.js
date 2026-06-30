const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { AtlasEngine } = require('../../core/AtlasEngine');
const { KnowledgeSource } = require('../../core/KnowledgeSchema');
const { DiagnosticEngine, DiagnosticActionType } = require('../../core/DiagnosticEngine');
const { buildSchema, loadObjective, validateObjective } = require('../ObjectiveRegistry');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function loadRawObjective() {
  const objectivePath = path.join(__dirname, '..', 'objectives', 'peinture.json');
  return JSON.parse(fs.readFileSync(objectivePath, 'utf8'));
}

const requiredKeys = [
  'surface_murs',
  'surface_plafonds',
  'type_support',
  'etat_support',
  'nombre_couches',
  'finition_peinture'
];

const allowedSources = ['USER', 'PHOTO', 'PLAN', 'PDF', 'MEASURE', 'AI', 'ESTIMATED'];

test('objectif peinture charge un KnowledgeSchema via ObjectiveRegistry', () => {
  const objective = loadRawObjective();
  const loadedObjective = loadObjective('peinture');
  const schema = buildSchema(loadedObjective);

  assert.equal(objective.key, 'peinture');
  assert.equal(loadedObjective.id, 'objective_peinture_v1');
  assert.equal(schema.listRequirements().length, 16);
  assert.equal(validateObjective(loadedObjective), true);
});

test('requirements obligatoires peinture', () => {
  const schema = buildSchema(loadObjective('peinture'));

  requiredKeys.forEach((key) => {
    const requirement = schema.getRequirement(key);

    assert.ok(requirement, `Requirement obligatoire manquant: ${key}`);
    assert.equal(requirement.required, true);
  });
});

test('sources peinture valides', () => {
  const objective = loadObjective('peinture');
  const knownSources = Object.values(KnowledgeSource);

  objective.requirements.forEach((requirement) => {
    requirement.acceptedSources.forEach((source) => {
      assert.equal(knownSources.includes(source), true, `Source inconnue: ${source}`);
      assert.equal(allowedSources.includes(source), true, `Source interdite pour peinture: ${source}`);
    });
  });
});

test('diagnostic peinture suggere les actions manquantes puis devient pret', () => {
  const schema = buildSchema(loadObjective('peinture'));
  const atlas = new AtlasEngine();

  atlas.newProject('Diagnostic peinture');
  atlas.setObjective('peinture', { confidence: 1 });
  atlas.addKnowledge(60, { type: 'surface_murs', confidence: 1, source: KnowledgeSource.MEASURE });
  atlas.addKnowledge('support connu', { type: 'type_support', confidence: 1, source: KnowledgeSource.USER });
  atlas.addKnowledge('etat correct', { type: 'etat_support', confidence: 1, source: KnowledgeSource.PHOTO });

  const firstReport = new DiagnosticEngine(atlas, schema).generateReport();
  const missingKeys = firstReport.missingItems.map((item) => item.key);
  const blockingKeys = firstReport.blockingItems.map((item) => item.key);
  const actionsByTarget = Object.fromEntries(
    firstReport.suggestedActions.map((action) => [action.targetRequirementKey, action.type])
  );

  assert.equal(missingKeys.includes('surface_murs'), false);
  assert.equal(missingKeys.includes('type_support'), false);
  assert.equal(missingKeys.includes('etat_support'), false);
  assert.equal(blockingKeys.includes('surface_plafonds'), true);
  assert.equal(blockingKeys.includes('nombre_couches'), true);
  assert.equal(blockingKeys.includes('finition_peinture'), true);
  assert.equal(missingKeys.includes('couleur_souhaitee'), true);
  assert.equal(actionsByTarget.surface_plafonds, DiagnosticActionType.MEASURE);
  assert.equal(actionsByTarget.nombre_couches, DiagnosticActionType.ASK_USER);
  assert.equal(actionsByTarget.finition_peinture, DiagnosticActionType.ASK_USER);
  assert.equal(firstReport.ready, false);

  atlas.addKnowledge(20, { type: 'surface_plafonds', confidence: 1, source: KnowledgeSource.MEASURE });
  atlas.addKnowledge(2, { type: 'nombre_couches', confidence: 1, source: KnowledgeSource.USER });
  atlas.addKnowledge('mat', { type: 'finition_peinture', confidence: 1, source: KnowledgeSource.USER });

  const secondReport = new DiagnosticEngine(atlas, schema).generateReport();

  assert.equal(secondReport.blockingItems.length, 0);
  assert.equal(secondReport.ready, true);
});
