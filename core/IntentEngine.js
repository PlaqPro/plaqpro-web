const fs = require('node:fs');
const path = require('node:path');

class IntentEngine {
  constructor({ catalogPath = path.join(__dirname, '..', 'knowledge', 'intents', 'intents.json') } = {}) {
    this.catalogPath = catalogPath;
    this.catalog = null;
  }

  loadCatalog(catalog = null) {
    if (catalog) {
      this.catalog = normalizeCatalog(catalog);
      return this.catalog;
    }

    const rawCatalog = fs.readFileSync(this.catalogPath, 'utf8');
    this.catalog = normalizeCatalog(JSON.parse(rawCatalog));
    return this.catalog;
  }

  detectIntent(text) {
    return this.getBestMatch(text);
  }

  getBestMatch(text) {
    const catalog = this.catalog || this.loadCatalog();
    const normalizedText = normalizeText(text);

    if (!normalizedText) {
      return null;
    }

    const matches = catalog.intents
      .map((intent) => scoreIntent(intent, normalizedText))
      .sort((left, right) => right.confidence - left.confidence || right.score - left.score);

    const bestMatch = matches[0] || null;

    if (!bestMatch || bestMatch.confidence < bestMatch.confidenceThreshold) {
      return null;
    }

    return bestMatch;
  }
}

function normalizeCatalog(catalog) {
  const intents = Array.isArray(catalog) ? catalog : catalog && catalog.intents;

  if (!Array.isArray(intents)) {
    throw new Error('Intent catalog must contain intents[]');
  }

  return {
    intents: intents.map((intent) => normalizeIntent(intent))
  };
}

function normalizeIntent(intent) {
  if (!intent || typeof intent !== 'object') {
    throw new Error('Intent must be an object');
  }

  const requiredFields = ['id', 'label', 'linkedObjective'];
  requiredFields.forEach((field) => {
    if (!intent[field]) {
      throw new Error(`Intent ${field} is required`);
    }
  });

  return {
    id: intent.id,
    label: intent.label,
    examples: normalizeStringList(intent.examples),
    keywords: normalizeStringList(intent.keywords),
    linkedObjective: intent.linkedObjective,
    confidenceThreshold: normalizeThreshold(intent.confidenceThreshold)
  };
}

function scoreIntent(intent, normalizedText) {
  const normalizedExamples = intent.examples.map((example) => normalizeText(example));
  const normalizedKeywords = intent.keywords.map((keyword) => normalizeText(keyword));
  const words = new Set(normalizedText.split(' ').filter(Boolean));
  let score = 0;
  const reasons = [];

  if (normalizeText(intent.linkedObjective) === normalizedText || normalizeText(intent.id) === normalizedText) {
    score += 10;
    reasons.push('objective');
  }

  normalizedExamples.forEach((example) => {
    if (example && normalizedText === example) {
      score += 8;
      reasons.push('exact_example');
      return;
    }

    if (example && (normalizedText.includes(example) || example.includes(normalizedText))) {
      score += 4;
      reasons.push('partial_example');
    }
  });

  normalizedKeywords.forEach((keyword) => {
    if (!keyword) {
      return;
    }

    if (normalizedText.includes(keyword)) {
      score += keyword.includes(' ') ? 3 : 2;
      reasons.push(`keyword:${keyword}`);
      return;
    }

    if (words.has(keyword)) {
      score += 2;
      reasons.push(`word:${keyword}`);
    }
  });

  const maxScore = 10;
  const confidence = Math.min(1, score / maxScore);

  return {
    id: intent.id,
    label: intent.label,
    linkedObjective: intent.linkedObjective,
    confidence,
    confidenceThreshold: intent.confidenceThreshold,
    score,
    reasons
  };
}

function normalizeStringList(value) {
  if (!value) {
    return [];
  }

  return (Array.isArray(value) ? value : [value])
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim());
}

function normalizeThreshold(value) {
  const threshold = Number(value);

  if (!Number.isFinite(threshold)) {
    return 0.35;
  }

  return Math.max(0, Math.min(1, threshold));
}

function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

module.exports = {
  IntentEngine
};