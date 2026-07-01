const assert = require('node:assert/strict');
const { IntentEngine } = require('../IntentEngine');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function createEngine() {
  return new IntentEngine();
}

test('loadCatalog charge les intentions', () => {
  const catalog = createEngine().loadCatalog();

  assert.equal(Array.isArray(catalog.intents), true);
  assert.equal(catalog.intents.length, 3);
  assert.ok(catalog.intents.find((intent) => intent.id === 'doublage'));
  assert.ok(catalog.intents.find((intent) => intent.id === 'peinture'));
  assert.ok(catalog.intents.find((intent) => intent.id === 'carrelage'));
});

test('detectIntent reconnait doublage depuis phrase naturelle', () => {
  const match = createEngine().detectIntent('Je dois isoler les murs');

  assert.ok(match);
  assert.equal(match.linkedObjective, 'doublage');
  assert.equal(match.confidence >= match.confidenceThreshold, true);
});

test('detectIntent reconnait peinture', () => {
  const match = createEngine().detectIntent('Je veux repeindre les plafonds et les murs');

  assert.ok(match);
  assert.equal(match.linkedObjective, 'peinture');
});

test('detectIntent reconnait carrelage', () => {
  const match = createEngine().detectIntent('poser du carrelage au sol');

  assert.ok(match);
  assert.equal(match.linkedObjective, 'carrelage');
});

test('getBestMatch accepte objectif direct', () => {
  const match = createEngine().getBestMatch('doublage');

  assert.ok(match);
  assert.equal(match.linkedObjective, 'doublage');
});

test('intent inconnue retourne null', () => {
  const match = createEngine().detectIntent('je veux planter un arbre');

  assert.equal(match, null);
});

test('loadCatalog accepte catalogue injecte', () => {
  const engine = createEngine();
  engine.loadCatalog({
    intents: [
      {
        id: 'test',
        label: 'Test',
        examples: ['faire un test'],
        keywords: ['test'],
        linkedObjective: 'test_objective',
        confidenceThreshold: 0.2
      }
    ]
  });

  assert.equal(engine.detectIntent('faire un test').linkedObjective, 'test_objective');
});
