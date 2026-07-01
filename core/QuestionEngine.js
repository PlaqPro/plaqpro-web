class UserQuestion {
  constructor({
    id,
    requirementKey,
    label,
    question,
    reason = null,
    impact = null,
    example = null,
    priority = 3,
    expectedAnswerType = 'text',
    acceptedSources = [],
    actionType = null
  } = {}) {
    this.id = id || createId('question');
    this.requirementKey = requirementKey;
    this.label = label;
    this.question = question;
    this.reason = reason || buildDefaultReason(label);
    this.impact = impact || buildDefaultImpact({ label });
    this.example = example || buildDefaultExample(expectedAnswerType);
    this.priority = normalizePriority(priority);
    this.expectedAnswerType = expectedAnswerType;
    this.acceptedSources = Array.isArray(acceptedSources) ? [...acceptedSources] : [];
    this.actionType = actionType;
  }
}

class QuestionEngine {
  constructor(diagnosticReport) {
    if (!diagnosticReport || typeof diagnosticReport !== 'object') {
      throw new Error('QuestionEngine requires a diagnostic report');
    }

    this.diagnosticReport = diagnosticReport;
  }

  generateQuestions() {
    const missingItems = Array.isArray(this.diagnosticReport.missingItems) ? this.diagnosticReport.missingItems : [];
    const actions = Array.isArray(this.diagnosticReport.suggestedActions) ? this.diagnosticReport.suggestedActions : [];

    return actions
      .map((action) => {
        const missingItem = missingItems.find((item) => item.key === action.targetRequirementKey) || {};
        const merged = { ...missingItem, ...action };
        const label = missingItem.label || normalizeLabel(action.label) || action.targetRequirementKey;
        const expectedAnswerType = this.inferExpectedAnswerType(merged);

        return new UserQuestion({
          requirementKey: action.targetRequirementKey,
          label,
          question: this.buildQuestion(label, merged),
          reason: this.buildReason(label, merged),
          impact: this.buildImpact(label, merged),
          example: this.buildExample(expectedAnswerType, merged),
          priority: action.priority ?? missingItem.priority ?? 3,
          expectedAnswerType,
          acceptedSources: missingItem.acceptedSources || action.acceptedSources || [],
          actionType: action.type || null
        });
      })
      .sort((left, right) => right.priority - left.priority);
  }

  getNextQuestion() {
    return this.generateQuestions()[0] || null;
  }

  getQuestionsByPriority(priority = null) {
    const questions = this.generateQuestions();

    if (priority === null || priority === undefined) {
      return questions;
    }

    return questions.filter((question) => question.priority === Number(priority));
  }

  inferExpectedAnswerType(item = {}) {
    if (item.type === 'TAKE_PHOTO') {
      return 'photo';
    }

    if (item.type === 'IMPORT_PLAN') {
      return 'plan';
    }

    if (item.type === 'IMPORT_PDF') {
      return 'pdf';
    }

    const validationTypes = normalizeValidationTypes(item.validationRules);

    if (validationTypes.includes('enum')) {
      return 'enum';
    }

    if (validationTypes.includes('range')) {
      return 'range';
    }

    if (validationTypes.includes('number')) {
      return 'number';
    }

    if (validationTypes.includes('boolean')) {
      return 'boolean';
    }

    if (validationTypes.includes('text') || validationTypes.includes('regex')) {
      return 'text';
    }

    if (item.type === 'MEASURE') {
      return 'measure';
    }

    return 'text';
  }

  buildQuestion(label, item = {}) {
    const defaultQuestions = Array.isArray(item.defaultQuestions) ? item.defaultQuestions : [];
    const firstDefaultQuestion = defaultQuestions.find((question) => typeof question === 'string' && question.trim());

    if (firstDefaultQuestion) {
      return firstDefaultQuestion;
    }

    return `Quelle est la valeur de ${label} ?`;
  }

  buildReason(label, item = {}) {
    if (typeof item.reason === 'string' && item.reason.trim()) {
      return item.reason;
    }

    if (typeof item.description === 'string' && item.description.trim()) {
      return item.description;
    }

    return buildDefaultReason(label);
  }

  buildImpact(label, item = {}) {
    if (typeof item.impact === 'string' && item.impact.trim()) {
      return item.impact;
    }

    if (item.required) {
      return `Sans cette information, le diagnostic reste bloque sur ${label}.`;
    }

    return buildDefaultImpact({ label });
  }

  buildExample(expectedAnswerType, item = {}) {
    if (typeof item.example === 'string' && item.example.trim()) {
      return item.example;
    }

    return buildDefaultExample(expectedAnswerType, item);
  }
}

function normalizeValidationTypes(validationRules = []) {
  if (!Array.isArray(validationRules)) {
    return [];
  }

  return validationRules
    .map((rule) => (typeof rule === 'string' ? rule : rule && rule.type))
    .filter(Boolean);
}

function normalizeLabel(label) {
  if (typeof label !== 'string') {
    return null;
  }

  const parts = label.split(':');
  return (parts.length > 1 ? parts.slice(1).join(':') : label).trim();
}

function normalizePriority(priority) {
  const normalized = Number(priority);
  if (!Number.isFinite(normalized)) {
    return 3;
  }

  return normalized;
}

function buildDefaultReason(label) {
  return `J'en ai besoin pour completer l'information ${label || 'demandee'}.`;
}

function buildDefaultImpact({ label } = {}) {
  return `Sans cette information, le diagnostic reste incomplet${label ? ` pour ${label}` : ''}.`;
}

function buildDefaultExample(expectedAnswerType, item = {}) {
  if (expectedAnswerType === 'number' || expectedAnswerType === 'range' || expectedAnswerType === 'measure') {
    return '2,50 m';
  }

  if (expectedAnswerType === 'boolean') {
    return 'oui';
  }

  if (expectedAnswerType === 'enum') {
    const enumRule = Array.isArray(item.validationRules)
      ? item.validationRules.find((rule) => rule && rule.type === 'enum' && Array.isArray(rule.value))
      : null;
    return enumRule && enumRule.value.length > 0 ? String(enumRule.value[0]) : 'option proposee';
  }

  if (expectedAnswerType === 'photo') {
    return 'photo du support';
  }

  if (expectedAnswerType === 'plan') {
    return 'plan du chantier';
  }

  if (expectedAnswerType === 'pdf') {
    return 'document PDF';
  }

  return 'valeur renseignee';
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = {
  QuestionEngine,
  UserQuestion
};
