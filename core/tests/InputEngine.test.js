const assert = require('node:assert/strict');
const {
  InputEngine,
  InputPayload,
  NormalizedInput,
  ExtractedKnowledge,
  InputType
} = require('../InputEngine');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test('normalisation texte', () => {
  const engine = new InputEngine();
  const normalized = engine.normalizeInput({
    type: InputType.TEXT,
    rawValue: 'hauteur_sous_plafond: 2.50',
    source: 'USER'
  });

  assert.ok(normalized instanceof NormalizedInput);
  assert.equal(normalized.type, InputType.TEXT);
  assert.equal(normalized.text, 'hauteur_sous_plafond: 2.50');
  assert.equal(normalized.metadata.source, 'USER');
});

test('extraction key:value depuis texte', () => {
  const engine = new InputEngine();
  const result = engine.process({
    type: InputType.TEXT,
    rawValue: 'hauteur_sous_plafond: 2.50',
    source: 'USER'
  });

  assert.equal(result.extractedKnowledge.length, 1);
  assert.ok(result.extractedKnowledge[0] instanceof ExtractedKnowledge);
  assert.equal(result.extractedKnowledge[0].key, 'hauteur_sous_plafond');
  assert.equal(result.extractedKnowledge[0].value, 2.5);
});

test('extraction multiple depuis texte', () => {
  const engine = new InputEngine();
  const result = engine.process({
    type: InputType.TEXT,
    rawValue: 'surface_murs: 42; type_support: placo\npresence_ouvertures: true',
    source: 'USER'
  });

  assert.deepEqual(result.extractedKnowledge.map((item) => item.key), [
    'surface_murs',
    'type_support',
    'presence_ouvertures'
  ]);
  assert.equal(result.extractedKnowledge[0].value, 42);
  assert.equal(result.extractedKnowledge[2].value, true);
});

test('extraction mesure', () => {
  const engine = new InputEngine();
  const result = engine.process({
    type: InputType.MEASURE,
    rawValue: { key: 'surface_sol', value: 35, confidence: 0.9 },
    source: 'MEASURE'
  });

  assert.equal(result.extractedKnowledge.length, 1);
  assert.equal(result.extractedKnowledge[0].key, 'surface_sol');
  assert.equal(result.extractedKnowledge[0].value, 35);
  assert.equal(result.extractedKnowledge[0].confidence, 0.9);
});

test('photo acceptee sans extraction', () => {
  const engine = new InputEngine();
  const result = engine.process({
    type: InputType.PHOTO,
    rawValue: 'photo-001.jpg',
    source: 'PHOTO'
  });

  assert.equal(result.normalizedInput.type, InputType.PHOTO);
  assert.deepEqual(result.normalizedInput.files, ['photo-001.jpg']);
  assert.deepEqual(result.extractedKnowledge, []);
});

test('erreur payload invalide', () => {
  const engine = new InputEngine();

  assert.throws(() => engine.validatePayload(null), /Input payload is required/);
  assert.throws(() => engine.validatePayload({ type: 'BAD', rawValue: 'x' }), /Invalid input type/);
  assert.throws(() => engine.validatePayload({ type: InputType.TEXT, rawValue: 12 }), /TEXT input rawValue must be a string/);
});

test('source et confidence presentes', () => {
  const engine = new InputEngine();
  const result = engine.process({
    type: InputType.TEXT,
    rawValue: 'type_support: beton',
    source: 'USER'
  });
  const knowledge = result.extractedKnowledge[0];

  assert.equal(knowledge.source, 'USER');
  assert.equal(knowledge.confidence, 1);
});

test('process retourne normalizedInput + extractedKnowledge', () => {
  const engine = new InputEngine();
  const result = engine.process(new InputPayload({
    type: InputType.TEXT,
    rawValue: 'largeur_joint: 3',
    source: 'USER'
  }));

  assert.ok(result.normalizedInput instanceof NormalizedInput);
  assert.equal(Array.isArray(result.extractedKnowledge), true);
  assert.equal(result.extractedKnowledge[0].key, 'largeur_joint');
});