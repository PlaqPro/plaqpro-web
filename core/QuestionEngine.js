class UserQuestion {
  constructor({
    id,
    requirementKey,
    label,
    question,
    reason = null,
    priority = 3,
    expectedAnswerType = 'text',
    acceptedSources = [],
    actionType = null
  } = {}) {
    this.id = id || createId('question');
    this.requirementKey = requirementKey;
    this.label = label;
    this.question = question;
    this.reason = reason;
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

        return new UserQuestion({
          requirementKey: action.targetRequirementKey,
          label,
          question: this.buildQuestion(label, merged),
          reason: action.reason || missingItem.reason || null,
          priority: action.priority ?? missingItem.priority ?? 3,
          expectedAnswerType: this.inferExpectedAnswerType(merged),
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

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = {
  QuestionEngine,
  UserQuestion
};