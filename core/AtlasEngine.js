class ProjectState {
  constructor({
    id,
    type = 'project',
    value = null,
    confidence = 0,
    source = 'system',
    status = 'draft',
    timestamp = new Date().toISOString(),
    objective = null,
    knowledge = [],
    unknowns = [],
    eventsLog = []
  } = {}) {
    this.id = id || createId('project');
    this.type = type;
    this.value = value;
    this.confidence = clampConfidence(confidence);
    this.source = source;
    this.status = status;
    this.timestamp = timestamp;
    this.objective = objective;
    this.knowledge = knowledge;
    this.unknowns = unknowns;
    this.eventsLog = eventsLog;
  }
}

class KnowledgeItem {
  constructor({
    id,
    type = 'knowledge',
    value,
    confidence = 1,
    source = 'user',
    status = 'active',
    timestamp = new Date().toISOString()
  } = {}) {
    this.id = id || createId('knowledge');
    this.type = type;
    this.value = value;
    this.confidence = clampConfidence(confidence);
    this.source = source;
    this.status = status;
    this.timestamp = timestamp;
  }
}

class UnknownItem {
  constructor({
    id,
    type = 'unknown',
    value,
    confidence = 0,
    source = 'user',
    status = 'open',
    timestamp = new Date().toISOString(),
    priority = 3,
    reason = null
  } = {}) {
    this.id = id || createId('unknown');
    this.type = type;
    this.value = value;
    this.confidence = clampConfidence(confidence);
    this.source = source;
    this.status = status;
    this.timestamp = timestamp;
    this.priority = normalizePriority(priority);
    this.reason = reason;
  }
}

class Question {
  constructor({
    id,
    type = 'question',
    value,
    confidence = 0,
    source = 'atlas',
    status = 'open',
    timestamp = new Date().toISOString(),
    priority = 3,
    reason = null,
    unknownId = null
  } = {}) {
    this.id = id || createId('question');
    this.type = type;
    this.value = value;
    this.confidence = clampConfidence(confidence);
    this.source = source;
    this.status = status;
    this.timestamp = timestamp;
    this.priority = normalizePriority(priority);
    this.reason = reason;
    this.unknownId = unknownId;
  }
}

class AtlasEngine {
  constructor() {
    this.project = null;
  }

  newProject(value = null, options = {}) {
    this.project = new ProjectState({
      ...options,
      value,
      status: options.status || 'active'
    });

    this.logEvent('newProject', 'Project created', {
      projectId: this.project.id,
      value: this.project.value,
      status: this.project.status
    });

    return this.project;
  }

  setObjective(value, options = {}) {
    this.ensureProject();

    this.project.objective = new KnowledgeItem({
      type: 'objective',
      value,
      confidence: options.confidence ?? 1,
      source: options.source || 'user',
      status: options.status || 'active'
    });

    this.logEvent('setObjective', 'Objective set', {
      objectiveId: this.project.objective.id,
      value: this.project.objective.value,
      confidence: this.project.objective.confidence
    });

    this.refreshProjectConfidence();
    return this.project.objective;
  }

  addKnowledge(value, options = {}) {
    this.ensureProject();

    const item = new KnowledgeItem({
      ...options,
      value,
      type: options.type || 'knowledge'
    });

    this.project.knowledge.push(item);
    this.logEvent('addKnowledge', 'Knowledge added', {
      knowledgeId: item.id,
      type: item.type,
      value: item.value,
      confidence: item.confidence
    });

    this.refreshProjectConfidence();
    return item;
  }

  addUnknown(value, options = {}) {
    this.ensureProject();

    const item = new UnknownItem({
      ...options,
      value,
      type: options.type || 'unknown',
      priority: options.priority ?? 3,
      reason: options.reason ?? null
    });

    this.project.unknowns.push(item);
    this.logEvent('addUnknown', 'Unknown added', {
      unknownId: item.id,
      value: item.value,
      priority: item.priority,
      reason: item.reason
    });

    this.refreshProjectConfidence();
    return item;
  }

  resolveUnknown(id, resolution, options = {}) {
    this.ensureProject();

    const unknown = this.project.unknowns.find((item) => item.id === id);
    if (!unknown) {
      throw new Error(`Unknown item not found: ${id}`);
    }

    unknown.status = options.status || 'resolved';
    unknown.confidence = clampConfidence(options.confidence ?? 1);
    unknown.source = options.source || unknown.source;

    const knowledge = this.addKnowledge(resolution, {
      type: options.knowledgeType || 'resolved_unknown',
      confidence: unknown.confidence,
      source: unknown.source,
      status: 'active'
    });

    this.logEvent('resolveUnknown', 'Unknown resolved', {
      unknownId: unknown.id,
      knowledgeId: knowledge.id,
      resolution,
      confidence: unknown.confidence
    });

    this.refreshProjectConfidence();
    return { unknown, knowledge };
  }

  getUnknowns(status = 'open') {
    this.ensureProject();

    if (status === 'all') {
      return [...this.project.unknowns];
    }

    return this.project.unknowns.filter((item) => item.status === status);
  }

  getKnowledge() {
    this.ensureProject();
    return [...this.project.knowledge];
  }

  getConfidence() {
    this.ensureProject();
    return this.project.confidence;
  }

  getEventsLog() {
    this.ensureProject();
    return [...this.project.eventsLog];
  }

  isReady() {
    this.ensureProject();
    return Boolean(this.project.objective) && this.getUnknowns('open').length === 0 && this.getConfidence() >= 0.75;
  }

  nextQuestion() {
    this.ensureProject();

    const unknown = this.getUnknowns('open').sort((left, right) => right.priority - left.priority)[0];
    if (!unknown) {
      return null;
    }

    return new Question({
      value: `Quelle est la valeur de "${unknown.value}" ?`,
      confidence: unknown.confidence,
      priority: unknown.priority,
      reason: unknown.reason,
      unknownId: unknown.id
    });
  }

  generateSummary() {
    this.ensureProject();

    return {
      id: this.project.id,
      objective: this.project.objective ? this.project.objective.value : null,
      knowledgeCount: this.project.knowledge.length,
      unknownCount: this.getUnknowns('all').length,
      openUnknownCount: this.getUnknowns('open').length,
      confidence: this.getConfidence(),
      ready: this.isReady(),
      status: this.project.status,
      eventCount: this.project.eventsLog.length,
      timestamp: new Date().toISOString()
    };
  }

  logEvent(type, message, payload = {}) {
    this.ensureProject();

    const event = {
      id: createId('event'),
      type,
      message,
      payload,
      timestamp: new Date().toISOString()
    };

    this.project.eventsLog.push(event);
    return event;
  }

  ensureProject() {
    if (!this.project) {
      throw new Error('Atlas project not initialized');
    }
  }

  refreshProjectConfidence() {
    this.ensureProject();

    const previousStatus = this.project.status;
    const knowledgeConfidence = average(this.project.knowledge.map((item) => item.confidence));
    const objectiveConfidence = this.project.objective ? this.project.objective.confidence : 0;
    const openUnknowns = this.project.unknowns.filter((item) => item.status === 'open').length;
    const unknownPenalty = Math.min(openUnknowns * 0.15, 0.6);
    const confidenceSources = [knowledgeConfidence, objectiveConfidence].filter((value) => value > 0);
    const baseConfidence = average(confidenceSources);

    this.project.confidence = clampConfidence(baseConfidence - unknownPenalty);
    this.project.status = Boolean(this.project.objective) && openUnknowns === 0 && this.project.confidence >= 0.75 ? 'ready' : 'active';

    if (this.project.status !== previousStatus) {
      this.logEvent('refreshProjectConfidence', 'Project status changed', {
        from: previousStatus,
        to: this.project.status,
        confidence: this.project.confidence
      });
    }
  }
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function clampConfidence(value) {
  if (Number.isNaN(Number(value))) {
    return 0;
  }

  return Math.max(0, Math.min(1, Number(value)));
}

function normalizePriority(value) {
  if (Number.isNaN(Number(value))) {
    return 3;
  }

  return Number(value);
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

module.exports = {
  AtlasEngine,
  ProjectState,
  KnowledgeItem,
  UnknownItem,
  Question
};
