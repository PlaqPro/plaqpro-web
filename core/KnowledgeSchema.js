const KnowledgeSource = Object.freeze({
  USER: 'USER',
  PHOTO: 'PHOTO',
  PLAN: 'PLAN',
  PDF: 'PDF',
  MEASURE: 'MEASURE',
  OCR: 'OCR',
  AI: 'AI',
  IMPORT: 'IMPORT',
  CALCULATED: 'CALCULATED',
  ESTIMATED: 'ESTIMATED'
});

const KnowledgeValidationType = Object.freeze({
  REQUIRED: 'required',
  NUMBER: 'number',
  TEXT: 'text',
  BOOLEAN: 'boolean',
  ENUM: 'enum',
  RANGE: 'range',
  REGEX: 'regex',
  CUSTOM: 'custom'
});

class KnowledgeValidation {
  constructor({
    id,
    type,
    value = null,
    message = null,
    params = {},
    validator = null
  } = {}) {
    this.id = id || createId('validation');
    this.type = type;
    this.value = value;
    this.message = message;
    this.params = params;
    this.validator = validator;
  }

  validate(value, context = {}) {
    switch (this.type) {
      case KnowledgeValidationType.REQUIRED:
        return !isEmptyValue(value);
      case KnowledgeValidationType.NUMBER:
        return typeof value === 'number' && Number.isFinite(value);
      case KnowledgeValidationType.TEXT:
        return typeof value === 'string' && value.trim().length > 0;
      case KnowledgeValidationType.BOOLEAN:
        return typeof value === 'boolean';
      case KnowledgeValidationType.ENUM:
        return Array.isArray(this.value) && this.value.includes(value);
      case KnowledgeValidationType.RANGE:
        return validateRange(value, this.value || this.params);
      case KnowledgeValidationType.REGEX:
        return validateRegex(value, this.value || this.params.pattern);
      case KnowledgeValidationType.CUSTOM:
        return typeof this.validator === 'function' ? Boolean(this.validator(value, context)) : true;
      default:
        return true;
    }
  }
}

class KnowledgeRule {
  constructor({
    id,
    key,
    dependsOn,
    description = null,
    condition = null
  } = {}) {
    this.id = id || createId('rule');
    this.key = key;
    this.dependsOn = Array.isArray(dependsOn) ? dependsOn : dependsOn ? [dependsOn] : [];
    this.description = description;
    this.condition = condition;
  }

  isSatisfiedBy(values = {}) {
    if (typeof this.condition === 'function') {
      return Boolean(this.condition(values));
    }

    return this.dependsOn.every((dependencyKey) => !isEmptyValue(values[dependencyKey]));
  }
}

class KnowledgeRequirement {
  constructor({
    id,
    key,
    label,
    description = '',
    required = false,
    priority = 3,
    category = 'general',
    acceptedSources = [],
    validationRules = [],
    dependsOn = [],
    confidenceWeight = 1,
    defaultQuestions = []
  } = {}) {
    if (!key) {
      throw new Error('KnowledgeRequirement key is required');
    }

    this.id = id || createId('requirement');
    this.key = key;
    this.label = label || key;
    this.description = description;
    this.required = Boolean(required);
    this.priority = normalizePriority(priority);
    this.category = category;
    this.acceptedSources = normalizeAcceptedSources(acceptedSources);
    this.validationRules = validationRules.map((rule) => normalizeValidation(rule));
    this.dependsOn = dependsOn.map((rule) => normalizeRule(rule, key));
    this.confidenceWeight = normalizeWeight(confidenceWeight);
    this.defaultQuestions = Array.isArray(defaultQuestions) ? [...defaultQuestions] : [defaultQuestions];
  }

  isApplicable(values = {}) {
    return this.dependsOn.every((rule) => rule.isSatisfiedBy(values));
  }

  acceptsSource(source) {
    if (!source || this.acceptedSources.length === 0) {
      return true;
    }

    return this.acceptedSources.includes(source);
  }
}

class KnowledgeSchema {
  constructor({ id, name = 'Atlas Knowledge Schema', requirements = [] } = {}) {
    this.id = id || createId('schema');
    this.name = name;
    this.requirements = [];

    requirements.forEach((requirement) => this.addRequirement(requirement));
  }

  addRequirement(requirement) {
    const normalizedRequirement = requirement instanceof KnowledgeRequirement
      ? requirement
      : new KnowledgeRequirement(requirement);

    if (this.getRequirement(normalizedRequirement.key)) {
      throw new Error(`KnowledgeRequirement already exists: ${normalizedRequirement.key}`);
    }

    this.requirements.push(normalizedRequirement);
    return normalizedRequirement;
  }

  removeRequirement(key) {
    const initialLength = this.requirements.length;
    this.requirements = this.requirements.filter((requirement) => requirement.key !== key);
    return this.requirements.length !== initialLength;
  }

  getRequirement(key) {
    return this.requirements.find((requirement) => requirement.key === key) || null;
  }

  listRequirements() {
    return [...this.requirements].sort((left, right) => right.priority - left.priority);
  }

  validate(values = {}, sources = {}) {
    const errors = [];
    const warnings = [];

    this.requirements.forEach((requirement) => {
      if (!requirement.isApplicable(values)) {
        return;
      }

      const value = values[requirement.key];
      const source = sources[requirement.key];

      if (requirement.required && isEmptyValue(value)) {
        errors.push(createValidationIssue(requirement, 'required', `${requirement.label} is required`));
        return;
      }

      if (!isEmptyValue(value) && !requirement.acceptsSource(source)) {
        errors.push(createValidationIssue(requirement, 'source', `${requirement.label} source is not accepted`, { source }));
      }

      requirement.validationRules.forEach((rule) => {
        if (!isEmptyValue(value) && !rule.validate(value, { values, sources, requirement })) {
          errors.push(createValidationIssue(
            requirement,
            rule.type,
            rule.message || `${requirement.label} failed ${rule.type} validation`,
            { validationId: rule.id }
          ));
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

function normalizeValidation(rule) {
  if (rule instanceof KnowledgeValidation) {
    return rule;
  }

  if (typeof rule === 'string') {
    return new KnowledgeValidation({ type: rule });
  }

  return new KnowledgeValidation(rule);
}

function normalizeRule(rule, key) {
  if (rule instanceof KnowledgeRule) {
    return rule;
  }

  if (typeof rule === 'string') {
    return new KnowledgeRule({ key, dependsOn: [rule] });
  }

  return new KnowledgeRule({ key, ...rule });
}

function normalizeAcceptedSources(sources) {
  const sourceList = Array.isArray(sources) ? sources : [sources];
  const allowedSources = Object.values(KnowledgeSource);

  return sourceList.filter((source) => {
    if (!source) {
      return false;
    }

    if (!allowedSources.includes(source)) {
      throw new Error(`Unknown knowledge source: ${source}`);
    }

    return true;
  });
}

function normalizePriority(priority) {
  const normalized = Number(priority);
  if (!Number.isFinite(normalized)) {
    return 3;
  }

  return Math.max(1, Math.min(5, normalized));
}

function normalizeWeight(weight) {
  const normalized = Number(weight);
  if (!Number.isFinite(normalized)) {
    return 1;
  }

  return Math.max(0, normalized);
}

function validateRange(value, range = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false;
  }

  const min = range.min ?? Number.NEGATIVE_INFINITY;
  const max = range.max ?? Number.POSITIVE_INFINITY;
  return value >= min && value <= max;
}

function validateRegex(value, pattern) {
  if (typeof value !== 'string') {
    return false;
  }

  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return regex.test(value);
}

function createValidationIssue(requirement, type, message, extra = {}) {
  return {
    requirementId: requirement.id,
    key: requirement.key,
    type,
    message,
    ...extra
  };
}

function isEmptyValue(value) {
  return value === null || value === undefined || value === '';
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = {
  KnowledgeSchema,
  KnowledgeRequirement,
  KnowledgeSource,
  KnowledgeRule,
  KnowledgeValidation,
  KnowledgeValidationType
};
