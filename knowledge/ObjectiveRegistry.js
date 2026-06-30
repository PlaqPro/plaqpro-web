const fs = require('node:fs');
const path = require('node:path');
const { KnowledgeSchema, KnowledgeSource } = require('../core/KnowledgeSchema');

const objectivesDirectory = path.join(__dirname, 'objectives');

function listObjectives() {
  return fs
    .readdirSync(objectivesDirectory)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => {
      const objective = readObjectiveFile(fileName);
      validateObjective(objective);

      return {
        id: objective.id,
        key: objective.key,
        label: objective.label,
        description: objective.description || '',
        file: fileName
      };
    })
    .sort((left, right) => left.key.localeCompare(right.key));
}

function loadObjective(id) {
  const fileNames = fs.readdirSync(objectivesDirectory).filter((fileName) => fileName.endsWith('.json'));

  for (const fileName of fileNames) {
    const objective = readObjectiveFile(fileName);
    if (objective.id === id || objective.key === id) {
      validateObjective(objective);
      return objective;
    }
  }

  throw new Error(`Atlas objective not found: ${id}`);
}

function buildSchema(objective) {
  validateObjective(objective);

  return new KnowledgeSchema({
    id: objective.id,
    name: objective.label || objective.key,
    requirements: objective.requirements
  });
}

function validateObjective(objective) {
  if (!objective || typeof objective !== 'object') {
    throw new Error('Atlas objective must be an object');
  }

  if (!objective.id) {
    throw new Error('Atlas objective id is required');
  }

  if (!objective.key) {
    throw new Error('Atlas objective key is required');
  }

  if (!Array.isArray(objective.requirements)) {
    throw new Error('Atlas objective requirements must be an array');
  }

  const seenKeys = new Set();
  const knownSources = Object.values(KnowledgeSource);

  objective.requirements.forEach((requirement) => {
    if (!requirement.key) {
      throw new Error('Atlas objective requirement key is required');
    }

    if (seenKeys.has(requirement.key)) {
      throw new Error(`Duplicate Atlas objective requirement key: ${requirement.key}`);
    }

    seenKeys.add(requirement.key);

    if (typeof requirement.required !== 'boolean') {
      throw new Error(`Requirement required must be boolean: ${requirement.key}`);
    }

    if (!Array.isArray(requirement.acceptedSources)) {
      throw new Error(`Requirement acceptedSources must be an array: ${requirement.key}`);
    }

    requirement.acceptedSources.forEach((source) => {
      if (!knownSources.includes(source)) {
        throw new Error(`Invalid knowledge source "${source}" in requirement ${requirement.key}`);
      }
    });

    if (!Array.isArray(requirement.validationRules)) {
      throw new Error(`Requirement validationRules must be an array: ${requirement.key}`);
    }

    if (!Array.isArray(requirement.dependsOn)) {
      throw new Error(`Requirement dependsOn must be an array: ${requirement.key}`);
    }

    if (!Array.isArray(requirement.defaultQuestions)) {
      throw new Error(`Requirement defaultQuestions must be an array: ${requirement.key}`);
    }
  });

  return true;
}

function readObjectiveFile(fileName) {
  const filePath = path.join(objectivesDirectory, fileName);
  const content = fs.readFileSync(filePath, 'utf8').trimStart();

  return JSON.parse(content);
}

module.exports = {
  listObjectives,
  loadObjective,
  buildSchema,
  validateObjective
};
