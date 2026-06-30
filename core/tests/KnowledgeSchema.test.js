const assert = require('node:assert/strict');
const {
  KnowledgeSchema,
  KnowledgeRequirement,
  KnowledgeSource,
  KnowledgeRule,
  KnowledgeValidation,
  KnowledgeValidationType
} = require('../KnowledgeSchema');

function test(name, callback) {
  try {
    callback();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test('creation schema', () => {
  const schema = new KnowledgeSchema({ name: 'Schema test' });

  assert.ok(schema.id);
  assert.equal(schema.name, 'Schema test');
  assert.deepEqual(schema.listRequirements(), []);
});

test('ajout besoin', () => {
  const schema = new KnowledgeSchema();
  const requirement = schema.addRequirement({
    key: 'height',
    label: 'Hauteur',
    description: 'Hauteur a mesurer',
    required: true,
    priority: 5,
    category: 'geometry',
    acceptedSources: [KnowledgeSource.USER, KnowledgeSource.MEASURE],
    validationRules: [KnowledgeValidationType.NUMBER],
    confidenceWeight: 2,
    defaultQuestions: ['Quelle est la hauteur ?']
  });

  assert.ok(requirement instanceof KnowledgeRequirement);
  assert.equal(requirement.key, 'height');
  assert.equal(requirement.priority, 5);
  assert.equal(schema.getRequirement('height'), requirement);
});

test('suppression', () => {
  const schema = new KnowledgeSchema();
  schema.addRequirement({ key: 'surface', label: 'Surface' });

  assert.equal(schema.removeRequirement('surface'), true);
  assert.equal(schema.getRequirement('surface'), null);
  assert.equal(schema.removeRequirement('surface'), false);
});

test('validation', () => {
  const schema = new KnowledgeSchema();
  schema.addRequirement({
    key: 'surface',
    label: 'Surface',
    required: true,
    validationRules: [
      KnowledgeValidationType.NUMBER,
      new KnowledgeValidation({ type: KnowledgeValidationType.RANGE, value: { min: 1, max: 500 } })
    ]
  });

  assert.equal(schema.validate({ surface: 42 }).valid, true);

  const missing = schema.validate({});
  assert.equal(missing.valid, false);
  assert.equal(missing.errors[0].type, 'required');

  const outOfRange = schema.validate({ surface: 900 });
  assert.equal(outOfRange.valid, false);
  assert.equal(outOfRange.errors[0].type, 'range');
});

test('dependances', () => {
  const schema = new KnowledgeSchema();
  schema.addRequirement({ key: 'hasCeiling', label: 'Plafond', validationRules: [KnowledgeValidationType.BOOLEAN] });
  schema.addRequirement({
    key: 'height',
    label: 'Hauteur',
    required: true,
    dependsOn: [
      new KnowledgeRule({
        key: 'height',
        dependsOn: ['hasCeiling'],
        description: 'La hauteur est demandee si un plafond existe',
        condition: (values) => values.hasCeiling === true
      })
    ],
    validationRules: [KnowledgeValidationType.NUMBER]
  });

  assert.equal(schema.validate({ hasCeiling: false }).valid, true);

  const result = schema.validate({ hasCeiling: true });
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].key, 'height');
  assert.equal(result.errors[0].type, 'required');
});

test('sources autorisees', () => {
  const schema = new KnowledgeSchema();
  schema.addRequirement({
    key: 'planSurface',
    label: 'Surface plan',
    acceptedSources: [KnowledgeSource.PLAN, KnowledgeSource.PDF],
    validationRules: [KnowledgeValidationType.NUMBER]
  });

  assert.equal(schema.validate({ planSurface: 25 }, { planSurface: KnowledgeSource.PLAN }).valid, true);

  const result = schema.validate({ planSurface: 25 }, { planSurface: KnowledgeSource.PHOTO });
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].type, 'source');
});

test('validations enum regex custom', () => {
  const schema = new KnowledgeSchema();
  schema.addRequirement({
    key: 'finish',
    label: 'Finition',
    validationRules: [new KnowledgeValidation({ type: KnowledgeValidationType.ENUM, value: ['mat', 'satin'] })]
  });
  schema.addRequirement({
    key: 'reference',
    label: 'Reference',
    validationRules: [new KnowledgeValidation({ type: KnowledgeValidationType.REGEX, value: /^REF-[0-9]+$/ })]
  });
  schema.addRequirement({
    key: 'confidence',
    label: 'Confiance',
    validationRules: [new KnowledgeValidation({
      type: KnowledgeValidationType.CUSTOM,
      validator: (value) => value >= 0.5
    })]
  });

  assert.equal(schema.validate({ finish: 'mat', reference: 'REF-12', confidence: 0.8 }).valid, true);
  assert.equal(schema.validate({ finish: 'brillant', reference: 'REF-12', confidence: 0.8 }).valid, false);
  assert.equal(schema.validate({ finish: 'mat', reference: 'BAD', confidence: 0.8 }).valid, false);
  assert.equal(schema.validate({ finish: 'mat', reference: 'REF-12', confidence: 0.2 }).valid, false);
});
