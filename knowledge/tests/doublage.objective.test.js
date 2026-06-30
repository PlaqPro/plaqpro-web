const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { AtlasEngine } = require('../../core/AtlasEngine');
const { KnowledgeSchema, KnowledgeSource } = require('../../core/KnowledgeSchema');
const { DiagnosticEngine, DiagnosticActionType } = require('../../core/DiagnosticEngine');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function loadObjective() {
  const objectivePath = path.join(__dirname, '..', 'objectives', 'doublage.json');
  return JSON.parse(fs.readFileSync(objectivePath, 'utf8'));
}

function createSchema(objective) {
  return new KnowledgeSchema({
    id: objective.id,
    name: objective.label,
    requirements: objective.requirements
  });
}

const requiredKeys = [
  'surface_murs',
  'hauteur_sous_plafond',
  'type_support',
  'presence_ouvertures',
  'type_doublage',
  'isolant_prevu'
];

const allowedSources = ['USER', 'PHOTO', 'PLAN', 'PDF', 'MEASURE', 'AI', 'ESTIMATED'];

test('objectif doublage charge un KnowledgeSchema valide', () => {
  const objective = loadObjective();
  const schema = createSchema(objective);

  assert.equal(objective.key, 'doublage');
  assert.equal(schema.listRequirements().length, 12);

  requiredKeys.forEach((key) => {
    const requirement = schema.getRequirement(key);

    assert.ok(requirement, `Requirement obligatoire manquant dans le schema: ${key}`);
    assert.equal(requirement.required, true);
  });
});

test('sources doublage valides', () => {
  const objective = loadObjective();
  const allKnownSources = Object.values(KnowledgeSource);

  objective.requirements.forEach((requirement) => {
    requirement.acceptedSources.forEach((source) => {
      assert.equal(allKnownSources.includes(source), true, `Source inconnue: ${source}`);
      assert.equal(allowedSources.includes(source), true, `Source interdite pour doublage: ${source}`);
    });
  });
});

test('diagnostic doublage suggere les actions manquantes puis devient pret', () => {
  const objective = loadObjective();
  const schema = createSchema(objective);
  const atlas = new AtlasEngine();

  atlas.newProject('Diagnostic doublage');
  atlas.setObjective('doublage', { confidence: 1 });
  atlas.addKnowledge(42, { type: 'surface_murs', confidence: 1, source: KnowledgeSource.MEASURE });
  atlas.addKnowledge('support existant', { type: 'type_support', confidence: 1, source: KnowledgeSource.USER });
  atlas.addKnowledge(true, { type: 'presence_ouvertures', confidence: 1, source: KnowledgeSource.PHOTO });

  const firstReport = new DiagnosticEngine(atlas, schema).generateReport();
  const missingKeys = firstReport.missingItems.map((item) => item.key);
  const blockingKeys = firstReport.blockingItems.map((item) => item.key);
  const actionsByTarget = Object.fromEntries(
    firstReport.suggestedActions.map((action) => [action.targetRequirementKey, action.type])
  );

  assert.equal(missingKeys.includes('surface_murs'), false);
  assert.equal(missingKeys.includes('type_support'), false);
  assert.equal(missingKeys.includes('presence_ouvertures'), false);
  assert.equal(blockingKeys.includes('hauteur_sous_plafond'), true);
  assert.equal(blockingKeys.includes('type_doublage'), true);
  assert.equal(blockingKeys.includes('isolant_prevu'), true);
  assert.equal(missingKeys.includes('piece_concernee'), true);
  assert.equal(actionsByTarget.hauteur_sous_plafond, DiagnosticActionType.MEASURE);
  assert.equal(actionsByTarget.type_doublage, DiagnosticActionType.ASK_USER);
  assert.equal(actionsByTarget.isolant_prevu, DiagnosticActionType.ASK_USER);
  assert.equal(firstReport.ready, false);

  atlas.addKnowledge(2.5, { type: 'hauteur_sous_plafond', confidence: 1, source: KnowledgeSource.MEASURE });
  atlas.addKnowledge('solution choisie', { type: 'type_doublage', confidence: 1, source: KnowledgeSource.USER });
  atlas.addKnowledge('isolant choisi', { type: 'isolant_prevu', confidence: 1, source: KnowledgeSource.USER });

  const secondReport = new DiagnosticEngine(atlas, schema).generateReport();

  assert.equal(secondReport.blockingItems.length, 0);
  assert.equal(secondReport.ready, true);
});
