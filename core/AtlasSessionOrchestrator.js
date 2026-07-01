const { AtlasEngine } = require('./AtlasEngine');
const { ConversationEngine } = require('./ConversationEngine');
const { DiagnosticEngine } = require('./DiagnosticEngine');
const { QuestionEngine } = require('./QuestionEngine');

class NextAction {
  constructor({
    type,
    label,
    description = null,
    priority = 3,
    origin = 'diagnostic',
    blocking = false
  } = {}) {
    this.type = type;
    this.label = label;
    this.description = description;
    this.priority = normalizePriority(priority);
    this.origin = normalizeOrigin(origin);
    this.blocking = Boolean(blocking);
  }
}

class AtlasSessionOrchestrator {
  constructor({
    atlasEngine,
    conversationEngine,
    diagnosticEngineFactory,
    questionEngineFactory,
    knowledgeSchema
  } = {}) {
    if (!knowledgeSchema) {
      throw new Error('AtlasSessionOrchestrator requires a knowledgeSchema');
    }

    this.atlasEngine = atlasEngine || new AtlasEngine();
    this.conversationEngine = conversationEngine || new ConversationEngine();
    this.diagnosticEngineFactory = diagnosticEngineFactory || ((atlas, schema) => new DiagnosticEngine(atlas, schema));
    this.questionEngineFactory = questionEngineFactory || ((diagnosticReport) => new QuestionEngine(diagnosticReport));
    this.knowledgeSchema = knowledgeSchema;
    this.currentDiagnosticReport = null;
    this.currentQuestion = null;
  }

  start(objective) {
    this.atlasEngine.newProject(objective);
    this.atlasEngine.setObjective(objective, { confidence: 1 });
    this.conversationEngine.startSession();
    this.conversationEngine.addAssistantMessage(`Session started for ${objective}`, {
      type: 'information',
      information: { objective }
    });
    this.currentDiagnosticReport = this.generateDiagnosticReport();

    return this.getStatus();
  }

  generateNextQuestion() {
    this.currentDiagnosticReport = this.generateDiagnosticReport();

    if (this.currentDiagnosticReport.ready) {
      this.currentQuestion = null;
      this.conversationEngine.setCurrentQuestion(null);
      return null;
    }

    const questionEngine = this.questionEngineFactory(this.currentDiagnosticReport);
    const question = questionEngine.getNextQuestion();

    this.currentQuestion = question;

    if (question) {
      this.conversationEngine.setCurrentQuestion(question);
      this.conversationEngine.addAssistantMessage(question.question, {
        type: 'question',
        question
      });
    }

    return question;
  }

  submitAnswer(answer) {
    if (!answer || typeof answer !== 'object') {
      throw new Error('AtlasSessionOrchestrator requires an answer object');
    }

    const currentQuestion = this.conversationEngine.getCurrentQuestion();
    const requirementKey = answer.requirementKey || (currentQuestion && currentQuestion.requirementKey);

    if (!requirementKey) {
      throw new Error('Answer requirementKey is required');
    }

    const value = answer.value;
    const confidence = answer.confidence ?? 1;
    const source = answer.source || 'user';
    const rawValue = answer.rawValue ?? value;

    this.conversationEngine.recordAnswer({
      requirementKey,
      value,
      confidence,
      source,
      rawValue
    });

    this.atlasEngine.addKnowledge(value, {
      type: requirementKey,
      confidence,
      source
    });

    this.conversationEngine.confirmAnswer(requirementKey);
    this.currentDiagnosticReport = this.generateDiagnosticReport();

    return this.getStatus();
  }

  getNextAction() {
    this.currentDiagnosticReport = this.currentDiagnosticReport || this.generateDiagnosticReport();

    if (this.currentDiagnosticReport.ready) {
      return null;
    }

    return this.getRemainingActions()[0] || null;
  }

  getRemainingActions() {
    this.currentDiagnosticReport = this.currentDiagnosticReport || this.generateDiagnosticReport();

    if (this.currentDiagnosticReport.ready) {
      return [];
    }

    const blockingKeys = new Set(this.currentDiagnosticReport.blockingItems.map((item) => item.key));

    return this.currentDiagnosticReport.suggestedActions
      .map((action) => new NextAction({
        type: action.type,
        label: action.label,
        description: action.reason || null,
        priority: action.priority,
        origin: blockingKeys.has(action.targetRequirementKey) ? 'diagnostic' : 'requirement',
        blocking: blockingKeys.has(action.targetRequirementKey)
      }))
      .sort((left, right) => right.priority - left.priority);
  }

  getProgress() {
    this.currentDiagnosticReport = this.currentDiagnosticReport || this.generateDiagnosticReport();

    const knowledgeMap = this.createKnowledgeMap();
    const values = this.createValuesMap(knowledgeMap);
    const applicableRequiredRequirements = this.knowledgeSchema
      .listRequirements()
      .filter((requirement) => requirement.required)
      .filter((requirement) => requirement.isApplicable(values));

    const completedRequirements = applicableRequiredRequirements
      .filter((requirement) => knowledgeMap.has(requirement.key))
      .map((requirement) => requirement.key);
    const remainingRequirements = applicableRequiredRequirements
      .filter((requirement) => !knowledgeMap.has(requirement.key))
      .map((requirement) => requirement.key);
    const blockingRequirements = this.currentDiagnosticReport.blockingItems.map((item) => item.key);
    const completionPercent = applicableRequiredRequirements.length === 0
      ? 100
      : Math.round((completedRequirements.length / applicableRequiredRequirements.length) * 100);

    return {
      completionPercent,
      completedRequirements,
      remainingRequirements,
      blockingRequirements
    };
  }

  getStatus() {
    this.currentDiagnosticReport = this.currentDiagnosticReport || this.generateDiagnosticReport();

    const progress = this.getProgress();
    const nextAction = this.getNextAction();
    const summary = this.createStatusSummary(progress, nextAction);

    return {
      ready: this.currentDiagnosticReport.ready,
      status: this.currentDiagnosticReport.status,
      confidence: this.currentDiagnosticReport.confidence,
      missingCount: this.currentDiagnosticReport.missingItems.length,
      blockingCount: this.currentDiagnosticReport.blockingItems.length,
      currentQuestion: this.currentQuestion || this.conversationEngine.getCurrentQuestion(),
      progress,
      nextAction,
      summary
    };
  }

  getSummary() {
    this.currentDiagnosticReport = this.currentDiagnosticReport || this.generateDiagnosticReport();

    return {
      atlas: this.atlasEngine.generateSummary(),
      conversation: this.conversationEngine.getConversationSummary(),
      diagnostic: this.currentDiagnosticReport,
      progress: this.getProgress(),
      nextAction: this.getNextAction(),
      status: this.getStatus()
    };
  }

  generateDiagnosticReport() {
    const diagnosticEngine = this.diagnosticEngineFactory(this.atlasEngine, this.knowledgeSchema);
    return diagnosticEngine.generateReport();
  }

  createKnowledgeMap() {
    const knowledgeMap = new Map();

    this.atlasEngine.getKnowledge().forEach((item) => {
      if (!isEmptyValue(item.value)) {
        knowledgeMap.set(item.type, item);
      }
    });

    return knowledgeMap;
  }

  createValuesMap(knowledgeMap) {
    const values = {};

    knowledgeMap.forEach((item, key) => {
      values[key] = item.value;
    });

    return values;
  }

  createStatusSummary(progress, nextAction) {
    return {
      objective: this.currentDiagnosticReport.objective,
      ready: this.currentDiagnosticReport.ready,
      confidence: this.currentDiagnosticReport.confidence,
      completionPercent: progress.completionPercent,
      completedRequirements: progress.completedRequirements.length,
      remainingRequirements: progress.remainingRequirements.length,
      blockingRequirements: progress.blockingRequirements.length,
      nextActionLabel: nextAction ? nextAction.label : null
    };
  }
}

function normalizePriority(priority) {
  const normalized = Number(priority);
  if (!Number.isFinite(normalized)) {
    return 3;
  }

  return normalized;
}

function normalizeOrigin(origin) {
  const allowedOrigins = ['requirement', 'diagnostic', 'conversation'];
  return allowedOrigins.includes(origin) ? origin : 'diagnostic';
}

function isEmptyValue(value) {
  return value === null || value === undefined || value === '';
}

module.exports = {
  AtlasSessionOrchestrator,
  NextAction
};
