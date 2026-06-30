const { AtlasEngine } = require('./AtlasEngine');
const { ConversationEngine } = require('./ConversationEngine');
const { DiagnosticEngine } = require('./DiagnosticEngine');
const { QuestionEngine } = require('./QuestionEngine');

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

  getStatus() {
    this.currentDiagnosticReport = this.currentDiagnosticReport || this.generateDiagnosticReport();

    return {
      ready: this.currentDiagnosticReport.ready,
      status: this.currentDiagnosticReport.status,
      confidence: this.currentDiagnosticReport.confidence,
      missingCount: this.currentDiagnosticReport.missingItems.length,
      blockingCount: this.currentDiagnosticReport.blockingItems.length,
      currentQuestion: this.currentQuestion || this.conversationEngine.getCurrentQuestion()
    };
  }

  getSummary() {
    this.currentDiagnosticReport = this.currentDiagnosticReport || this.generateDiagnosticReport();

    return {
      atlas: this.atlasEngine.generateSummary(),
      conversation: this.conversationEngine.getConversationSummary(),
      diagnostic: this.currentDiagnosticReport,
      status: this.getStatus()
    };
  }

  generateDiagnosticReport() {
    const diagnosticEngine = this.diagnosticEngineFactory(this.atlasEngine, this.knowledgeSchema);
    return diagnosticEngine.generateReport();
  }
}

module.exports = {
  AtlasSessionOrchestrator
};