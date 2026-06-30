const { AtlasEngine } = require('./AtlasEngine');
const { KnowledgeSchema, KnowledgeSource } = require('./KnowledgeSchema');

const DiagnosticActionType = Object.freeze({
  ASK_USER: 'ASK_USER',
  TAKE_PHOTO: 'TAKE_PHOTO',
  IMPORT_PLAN: 'IMPORT_PLAN',
  IMPORT_PDF: 'IMPORT_PDF',
  MEASURE: 'MEASURE',
  CONFIRM: 'CONFIRM',
  ESTIMATE: 'ESTIMATE'
});

class DiagnosticReport {
  constructor({
    projectId,
    objective = null,
    confidence = 0,
    ready = false,
    status = 'unknown',
    missingItems = [],
    blockingItems = [],
    suggestedActions = [],
    generatedAt = new Date().toISOString()
  } = {}) {
    this.projectId = projectId;
    this.objective = objective;
    this.confidence = confidence;
    this.ready = Boolean(ready);
    this.status = status;
    this.missingItems = missingItems;
    this.blockingItems = blockingItems;
    this.suggestedActions = suggestedActions;
    this.generatedAt = generatedAt;
  }
}

class DiagnosticMissingItem {
  constructor({
    id,
    key,
    label,
    priority = 3,
    reason = null,
    required = false,
    acceptedSources = []
  } = {}) {
    this.id = id || createId('missing');
    this.key = key;
    this.label = label || key;
    this.priority = normalizePriority(priority);
    this.reason = reason;
    this.required = Boolean(required);
    this.acceptedSources = Array.isArray(acceptedSources) ? [...acceptedSources] : [];
  }
}

class DiagnosticAction {
  constructor({
    id,
    type,
    label,
    reason = null,
    priority = 3,
    targetRequirementKey
  } = {}) {
    this.id = id || createId('action');
    this.type = type;
    this.label = label;
    this.reason = reason;
    this.priority = normalizePriority(priority);
    this.targetRequirementKey = targetRequirementKey;
  }
}

class DiagnosticEngine {
  constructor(atlasEngine, knowledgeSchema) {
    if (!(atlasEngine instanceof AtlasEngine)) {
      throw new Error('DiagnosticEngine requires an AtlasEngine instance');
    }

    if (!(knowledgeSchema instanceof KnowledgeSchema)) {
      throw new Error('DiagnosticEngine requires a KnowledgeSchema instance');
    }

    this.atlasEngine = atlasEngine;
    this.knowledgeSchema = knowledgeSchema;
  }

  generateReport() {
    const missingItems = this.getMissingItems();
    const blockingItems = this.getBlockingItems(missingItems);
    const suggestedActions = this.getSuggestedActions(missingItems);
    const summary = this.atlasEngine.generateSummary();

    return new DiagnosticReport({
      projectId: summary.id,
      objective: summary.objective,
      confidence: summary.confidence,
      ready: this.isReady(blockingItems),
      status: summary.status,
      missingItems,
      blockingItems,
      suggestedActions
    });
  }

  getMissingItems() {
    const knowledgeMap = this.createKnowledgeMap();
    const values = this.createValuesMap(knowledgeMap);

    return this.knowledgeSchema
      .listRequirements()
      .filter((requirement) => requirement.isApplicable(values))
      .filter((requirement) => !knowledgeMap.has(requirement.key))
      .map((requirement) => new DiagnosticMissingItem({
        key: requirement.key,
        label: requirement.label,
        priority: requirement.priority,
        reason: requirement.description || null,
        required: requirement.required,
        acceptedSources: requirement.acceptedSources
      }));
  }

  getBlockingItems(missingItems = this.getMissingItems()) {
    return missingItems.filter((item) => item.required);
  }

  getSuggestedActions(missingItems = this.getMissingItems()) {
    return missingItems
      .map((item) => this.createActionForMissingItem(item))
      .sort((left, right) => right.priority - left.priority);
  }

  isReady(blockingItems = this.getBlockingItems()) {
    return this.atlasEngine.isReady() && blockingItems.length === 0;
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

  createActionForMissingItem(item) {
    const source = item.acceptedSources[0] || KnowledgeSource.USER;
    const type = actionTypeForSource(source);

    return new DiagnosticAction({
      type,
      label: labelForAction(type, item),
      reason: item.reason || `Missing knowledge: ${item.label}`,
      priority: item.priority,
      targetRequirementKey: item.key
    });
  }
}

function actionTypeForSource(source) {
  const actionsBySource = {
    [KnowledgeSource.USER]: DiagnosticActionType.ASK_USER,
    [KnowledgeSource.PHOTO]: DiagnosticActionType.TAKE_PHOTO,
    [KnowledgeSource.PLAN]: DiagnosticActionType.IMPORT_PLAN,
    [KnowledgeSource.PDF]: DiagnosticActionType.IMPORT_PDF,
    [KnowledgeSource.MEASURE]: DiagnosticActionType.MEASURE,
    [KnowledgeSource.ESTIMATED]: DiagnosticActionType.ESTIMATE,
    [KnowledgeSource.OCR]: DiagnosticActionType.CONFIRM,
    [KnowledgeSource.AI]: DiagnosticActionType.CONFIRM,
    [KnowledgeSource.IMPORT]: DiagnosticActionType.CONFIRM,
    [KnowledgeSource.CALCULATED]: DiagnosticActionType.CONFIRM
  };

  return actionsBySource[source] || DiagnosticActionType.CONFIRM;
}

function labelForAction(type, item) {
  const labelsByType = {
    [DiagnosticActionType.ASK_USER]: `Demander: ${item.label}`,
    [DiagnosticActionType.TAKE_PHOTO]: `Prendre une photo: ${item.label}`,
    [DiagnosticActionType.IMPORT_PLAN]: `Importer un plan: ${item.label}`,
    [DiagnosticActionType.IMPORT_PDF]: `Importer un PDF: ${item.label}`,
    [DiagnosticActionType.MEASURE]: `Mesurer: ${item.label}`,
    [DiagnosticActionType.CONFIRM]: `Confirmer: ${item.label}`,
    [DiagnosticActionType.ESTIMATE]: `Estimer: ${item.label}`
  };

  return labelsByType[type] || `Completer: ${item.label}`;
}

function isEmptyValue(value) {
  return value === null || value === undefined || value === '';
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
  DiagnosticEngine,
  DiagnosticReport,
  DiagnosticMissingItem,
  DiagnosticAction,
  DiagnosticActionType
};
