const InputType = Object.freeze({
  TEXT: 'TEXT',
  PHOTO: 'PHOTO',
  PDF: 'PDF',
  PLAN: 'PLAN',
  MEASURE: 'MEASURE',
  OCR: 'OCR',
  VOICE: 'VOICE',
  IMPORT: 'IMPORT'
});

class InputPayload {
  constructor({
    id,
    type,
    rawValue,
    source = null,
    metadata = {},
    timestamp = new Date().toISOString()
  } = {}) {
    this.id = id || createId('input');
    this.type = type;
    this.rawValue = rawValue;
    this.source = source || type;
    this.metadata = metadata || {};
    this.timestamp = timestamp;
  }
}

class NormalizedInput {
  constructor({
    id,
    inputId,
    type,
    text = null,
    files = [],
    metadata = {},
    timestamp = new Date().toISOString()
  } = {}) {
    this.id = id || createId('normalized');
    this.inputId = inputId;
    this.type = type;
    this.text = text;
    this.files = Array.isArray(files) ? [...files] : [files];
    this.metadata = metadata || {};
    this.timestamp = timestamp;
  }
}

class ExtractedKnowledge {
  constructor({
    id,
    key,
    value,
    confidence = 1,
    source,
    rawValue = value,
    metadata = {},
    timestamp = new Date().toISOString()
  } = {}) {
    this.id = id || createId('knowledge');
    this.key = key;
    this.value = value;
    this.confidence = clampConfidence(confidence);
    this.source = source;
    this.rawValue = rawValue;
    this.metadata = metadata || {};
    this.timestamp = timestamp;
  }
}

class InputEngine {
  normalizeInput(payload) {
    const inputPayload = payload instanceof InputPayload ? payload : new InputPayload(payload);
    this.validatePayload(inputPayload);

    switch (inputPayload.type) {
      case InputType.TEXT:
      case InputType.OCR:
      case InputType.VOICE:
        return new NormalizedInput({
          inputId: inputPayload.id,
          type: inputPayload.type,
          text: String(inputPayload.rawValue),
          metadata: {
            ...inputPayload.metadata,
            source: inputPayload.source
          },
          timestamp: inputPayload.timestamp
        });
      case InputType.MEASURE:
        return new NormalizedInput({
          inputId: inputPayload.id,
          type: inputPayload.type,
          text: null,
          metadata: {
            ...inputPayload.metadata,
            source: inputPayload.source,
            measure: inputPayload.rawValue
          },
          timestamp: inputPayload.timestamp
        });
      case InputType.PHOTO:
      case InputType.PDF:
      case InputType.PLAN:
      case InputType.IMPORT:
        return new NormalizedInput({
          inputId: inputPayload.id,
          type: inputPayload.type,
          files: Array.isArray(inputPayload.rawValue) ? inputPayload.rawValue : [inputPayload.rawValue],
          metadata: {
            ...inputPayload.metadata,
            source: inputPayload.source
          },
          timestamp: inputPayload.timestamp
        });
      default:
        throw new Error(`Unsupported input type: ${inputPayload.type}`);
    }
  }

  extractKnowledge(normalizedInput) {
    const input = normalizedInput instanceof NormalizedInput ? normalizedInput : new NormalizedInput(normalizedInput);

    if (input.type === InputType.TEXT) {
      return extractPairsFromText(input.text).map(({ key, value, rawValue }) => new ExtractedKnowledge({
        key,
        value,
        confidence: 1,
        source: input.metadata.source || InputType.TEXT,
        rawValue,
        metadata: {
          inputId: input.inputId,
          normalizedInputId: input.id
        },
        timestamp: input.timestamp
      }));
    }

    if (input.type === InputType.MEASURE) {
      const measure = input.metadata.measure;
      if (!measure || typeof measure !== 'object' || !measure.key) {
        return [];
      }

      return [new ExtractedKnowledge({
        key: measure.key,
        value: measure.value,
        confidence: measure.confidence ?? 1,
        source: input.metadata.source || InputType.MEASURE,
        rawValue: measure,
        metadata: {
          inputId: input.inputId,
          normalizedInputId: input.id
        },
        timestamp: input.timestamp
      })];
    }

    return [];
  }

  process(payload) {
    const normalizedInput = this.normalizeInput(payload);
    const extractedKnowledge = this.extractKnowledge(normalizedInput);

    return {
      normalizedInput,
      extractedKnowledge
    };
  }

  validatePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Input payload is required');
    }

    if (!Object.values(InputType).includes(payload.type)) {
      throw new Error(`Invalid input type: ${payload.type}`);
    }

    if (payload.rawValue === undefined || payload.rawValue === null) {
      throw new Error('Input payload rawValue is required');
    }

    if ((payload.type === InputType.TEXT || payload.type === InputType.OCR || payload.type === InputType.VOICE) && typeof payload.rawValue !== 'string') {
      throw new Error(`${payload.type} input rawValue must be a string`);
    }

    if (payload.type === InputType.MEASURE && (typeof payload.rawValue !== 'object' || Array.isArray(payload.rawValue))) {
      throw new Error('MEASURE input rawValue must be an object');
    }

    return true;
  }
}

function extractPairsFromText(text = '') {
  return String(text)
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex <= 0) {
        return null;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();

      if (!key || !rawValue) {
        return null;
      }

      return {
        key,
        rawValue,
        value: parseValue(rawValue)
      };
    })
    .filter(Boolean);
}

function parseValue(rawValue) {
  const trimmed = String(rawValue).trim();

  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === 'true';
  }

  const normalizedNumber = trimmed.replace(',', '.');
  if (/^-?\d+(\.\d+)?$/.test(normalizedNumber)) {
    return Number(normalizedNumber);
  }

  return trimmed;
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
  InputEngine,
  InputPayload,
  NormalizedInput,
  ExtractedKnowledge,
  InputType
};