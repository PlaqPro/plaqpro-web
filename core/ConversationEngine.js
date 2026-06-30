class ConversationSession {
  constructor({
    id,
    startedAt = new Date().toISOString(),
    updatedAt = startedAt,
    status = 'active',
    history = [],
    context = new ConversationContext()
  } = {}) {
    this.id = id || createId('session');
    this.startedAt = startedAt;
    this.updatedAt = updatedAt;
    this.status = status;
    this.history = history;
    this.context = context instanceof ConversationContext ? context : new ConversationContext(context);
  }
}

class ConversationMessage {
  constructor({
    id,
    role,
    type = 'information',
    content = '',
    timestamp = new Date().toISOString(),
    question = null,
    answer = null,
    information = null,
    warning = null,
    confirmation = null,
    error = null
  } = {}) {
    this.id = id || createId('message');
    this.role = role;
    this.system = role === 'system';
    this.assistant = role === 'assistant';
    this.user = role === 'user';
    this.type = type;
    this.question = question;
    this.answer = answer;
    this.information = information;
    this.warning = warning;
    this.confirmation = confirmation;
    this.error = error;
    this.content = content;
    this.timestamp = timestamp;
  }
}

class ConversationAnswer {
  constructor({
    requirementKey,
    value,
    confidence = 1,
    source = 'user',
    validated = false,
    rawValue = value
  } = {}) {
    this.requirementKey = requirementKey;
    this.value = value;
    this.confidence = clampConfidence(confidence);
    this.source = source;
    this.validated = Boolean(validated);
    this.rawValue = rawValue;
  }
}

class ConversationContext {
  constructor({
    currentQuestion = null,
    lastAnswer = null,
    pendingRequirements = [],
    completedRequirements = []
  } = {}) {
    this.currentQuestion = currentQuestion;
    this.lastAnswer = lastAnswer instanceof ConversationAnswer || lastAnswer === null
      ? lastAnswer
      : new ConversationAnswer(lastAnswer);
    this.pendingRequirements = [...pendingRequirements];
    this.completedRequirements = [...completedRequirements];
  }
}

class ConversationEngine {
  constructor() {
    this.session = null;
  }

  startSession(options = {}) {
    this.session = new ConversationSession(options);
    return this.session;
  }

  closeSession(status = 'closed') {
    this.ensureSession();
    this.session.status = status;
    this.touchSession();
    return this.session;
  }

  addAssistantMessage(content, options = {}) {
    return this.addMessage({
      ...options,
      role: 'assistant',
      content,
      type: options.type || 'information'
    });
  }

  addUserMessage(content, options = {}) {
    return this.addMessage({
      ...options,
      role: 'user',
      content,
      type: options.type || 'information'
    });
  }

  recordAnswer(answer) {
    this.ensureSession();

    const conversationAnswer = answer instanceof ConversationAnswer ? answer : new ConversationAnswer(answer);
    this.session.context.lastAnswer = conversationAnswer;

    this.addMessage({
      role: 'user',
      type: 'answer',
      content: String(conversationAnswer.rawValue ?? ''),
      answer: conversationAnswer
    });

    return conversationAnswer;
  }

  confirmAnswer(requirementKey = null) {
    this.ensureSession();

    const answer = this.session.context.lastAnswer;
    if (!answer) {
      throw new Error('No answer to confirm');
    }

    if (requirementKey && answer.requirementKey !== requirementKey) {
      throw new Error(`Answer requirement mismatch: ${requirementKey}`);
    }

    answer.validated = true;
    moveRequirement(answer.requirementKey, this.session.context.pendingRequirements, this.session.context.completedRequirements);

    this.addMessage({
      role: 'assistant',
      type: 'confirmation',
      content: `Answer confirmed for ${answer.requirementKey}`,
      confirmation: answer
    });

    return answer;
  }

  rejectAnswer(reason = null) {
    this.ensureSession();

    const answer = this.session.context.lastAnswer;
    if (!answer) {
      throw new Error('No answer to reject');
    }

    answer.validated = false;

    this.addMessage({
      role: 'assistant',
      type: 'error',
      content: reason || `Answer rejected for ${answer.requirementKey}`,
      error: {
        requirementKey: answer.requirementKey,
        reason
      }
    });

    return answer;
  }

  getHistory() {
    this.ensureSession();
    return [...this.session.history];
  }

  getCurrentQuestion() {
    this.ensureSession();
    return this.session.context.currentQuestion;
  }

  setCurrentQuestion(question) {
    this.ensureSession();
    this.session.context.currentQuestion = question;

    const requirementKey = question && question.requirementKey;
    if (requirementKey && !this.session.context.pendingRequirements.includes(requirementKey)) {
      this.session.context.pendingRequirements.push(requirementKey);
    }

    this.touchSession();
    return this.session.context.currentQuestion;
  }

  getConversationSummary() {
    this.ensureSession();

    return {
      id: this.session.id,
      status: this.session.status,
      startedAt: this.session.startedAt,
      updatedAt: this.session.updatedAt,
      messageCount: this.session.history.length,
      currentQuestion: this.session.context.currentQuestion,
      lastAnswer: this.session.context.lastAnswer,
      pendingRequirements: [...this.session.context.pendingRequirements],
      completedRequirements: [...this.session.context.completedRequirements]
    };
  }

  addMessage(messageData) {
    this.ensureSession();

    const message = messageData instanceof ConversationMessage ? messageData : new ConversationMessage(messageData);
    this.session.history.push(message);
    this.touchSession();
    return message;
  }

  touchSession() {
    this.session.updatedAt = new Date().toISOString();
  }

  ensureSession() {
    if (!this.session) {
      throw new Error('Conversation session not initialized');
    }
  }
}

function moveRequirement(requirementKey, pendingRequirements, completedRequirements) {
  if (!requirementKey) {
    return;
  }

  const pendingIndex = pendingRequirements.indexOf(requirementKey);
  if (pendingIndex >= 0) {
    pendingRequirements.splice(pendingIndex, 1);
  }

  if (!completedRequirements.includes(requirementKey)) {
    completedRequirements.push(requirementKey);
  }
}

function clampConfidence(value) {
  if (Number.isNaN(Number(value))) {
    return 0;
  }

  return Math.max(0, Math.min(1, Number(value)));
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = {
  ConversationEngine,
  ConversationSession,
  ConversationMessage,
  ConversationAnswer,
  ConversationContext
};