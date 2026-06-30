const assert = require('node:assert/strict');
const { runAtlasDemo } = require('../atlas-demo');

function test(name, callback) {
  Promise.resolve()
    .then(callback)
    .then(() => console.log(`OK ${name}`))
    .catch((error) => {
      console.error(`FAIL ${name}`);
      throw error;
    });
}

function createScriptedAsk(answers) {
  const queue = [...answers];

  return async () => {
    if (!queue.length) {
      throw new Error('No scripted answer available');
    }

    return queue.shift();
  };
}

test('conversation complete simulee sans saisie clavier', async () => {
  const output = [];
  const summary = await runAtlasDemo({
    ask: createScriptedAsk([
      'doublage',
      '42',
      '2.5',
      'support existant',
      'doublage colle',
      'true',
      'laine minerale'
    ]),
    write: (chunk) => output.push(chunk)
  });
  const rendered = output.join('');

  assert.equal(summary.diagnostic.ready, true);
  assert.equal(summary.diagnostic.blockingItems.length, 0);
  assert.ok(rendered.includes('ATLAS'));
  assert.ok(rendered.includes('Diagnostic termine'));
  assert.ok(rendered.includes('Connaissances obtenues'));
});