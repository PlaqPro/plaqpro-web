const assert = require('node:assert/strict');
const { AtlasEngine } = require('../AtlasEngine');
const { KnowledgeSchema, KnowledgeSource } = require('../KnowledgeSchema');
const { DiagnosticEngine, DiagnosticActionType } = require('../DiagnosticEngine');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test('flux complet du noyau Atlas', () => {
  const atlas = new AtlasEngine();
  atlas.newProject('Projet integration');
  atlas.setObjective('Verifier la completude du projet', { confidence: 1 });

  const schema = new KnowledgeSchema();
  schema.addRequirement({
    key: 'knownRequired',
    label: 'Connaissance deja presente',
    required: true,
    priority: 4,
    acceptedSources: [KnowledgeSource.USER]
  });
  schema.addRequirement({
    key: 'missingRequired',
    label: 'Connaissance obligatoire manquante',
    required: true,
    priority: 5,
    acceptedSources: [KnowledgeSource.MEASURE]
  });
  schema.addRequirement({
    key: 'missingOptional',
    label: 'Connaissance optionnelle manquante',
    required: false,
    priority: 3,
    acceptedSources: [KnowledgeSource.PHOTO]
  });
  schema.addRequirement({
    key: 'knownOptional',
    label: 'Connaissance optionnelle presente',
    required: false,
    priority: 2,
    acceptedSources: [KnowledgeSource.PDF]
  });

  atlas.addKnowledge('valeur connue', {
    type: 'knownRequired',
    confidence: 1,
    source: KnowledgeSource.USER
  });
  atlas.addKnowledge('document importe', {
    type: 'knownOptional',
    confidence: 1,
    source: KnowledgeSource.PDF
  });

  const firstDiagnostic = new DiagnosticEngine(atlas, schema);
  const firstReport = firstDiagnostic.generateReport();
  const firstMissingKeys = firstReport.missingItems.map((item) => item.key);
  const firstBlockingKeys = firstReport.blockingItems.map((item) => item.key);
  const firstActionsByTarget = Object.fromEntries(
    firstReport.suggestedActions.map((action) => [action.targetRequirementKey, action.type])
  );

  assert.equal(firstMissingKeys.includes('knownRequired'), false);
  assert.equal(firstMissingKeys.includes('knownOptional'), false);
  assert.deepEqual(firstBlockingKeys, ['missingRequired']);
  assert.equal(firstMissingKeys.includes('missingOptional'), true);
  assert.equal(firstActionsByTarget.missingRequired, DiagnosticActionType.MEASURE);
  assert.equal(firstActionsByTarget.missingOptional, DiagnosticActionType.TAKE_PHOTO);
  assert.equal(firstReport.ready, false);

  atlas.addKnowledge(12, {
    type: 'missingRequired',
    confidence: 1,
    source: KnowledgeSource.MEASURE
  });
  atlas.addKnowledge('photo ajoutee', {
    type: 'missingOptional',
    confidence: 1,
    source: KnowledgeSource.PHOTO
  });

  const secondReport = new DiagnosticEngine(atlas, schema).generateReport();

  assert.equal(secondReport.missingItems.length, 0);
  assert.equal(secondReport.blockingItems.length, 0);
  assert.equal(secondReport.suggestedActions.length, 0);
  assert.equal(secondReport.ready, true);
  assert.equal(atlas.isReady(), true);
});
