const readline = require('node:readline');
const { AtlasEngine } = require('../core/AtlasEngine');
const { ConversationEngine } = require('../core/ConversationEngine');
const { DiagnosticEngine } = require('../core/DiagnosticEngine');
const { QuestionEngine } = require('../core/QuestionEngine');
const { InputEngine, InputType } = require('../core/InputEngine');
const { AtlasSessionOrchestrator } = require('../core/AtlasSessionOrchestrator');
const { buildSchema, loadObjective } = require('../knowledge/ObjectiveRegistry');

async function runAtlasDemo({ ask, write = process.stdout.write.bind(process.stdout) } = {}) {
  const inputEngine = new InputEngine();

  write('==================================\n');
  write('ATLAS\n');
  write('Assistant de preparation chantier\n');
  write('==================================\n\n');
  write('Bonjour.\n\n');
  write('Je vais preparer votre chantier.\n\n');
  write('Quel est votre objectif ?\n\n');

  const objectiveKey = String(await ask('> ')).trim();
  const objective = loadObjective(objectiveKey);
  const knowledgeSchema = buildSchema(objective);
  const atlasEngine = new AtlasEngine();
  const conversationEngine = new ConversationEngine();
  const orchestrator = new AtlasSessionOrchestrator({
    atlasEngine,
    conversationEngine,
    knowledgeSchema,
    diagnosticEngineFactory: (atlas, schema) => new DiagnosticEngine(atlas, schema),
    questionEngineFactory: (report) => new QuestionEngine(report)
  });

  orchestrator.start(objective.key);

  let guard = 0;
  while (!orchestrator.getStatus().ready && guard < 100) {
    const question = orchestrator.generateNextQuestion();

    if (!question) {
      break;
    }

    write(`\n${question.question}\n\n`);
    const rawAnswer = await ask('> ');
    const processed = inputEngine.process({
      type: InputType.TEXT,
      rawValue: `${question.requirementKey}: ${rawAnswer}`,
      source: inferSource(question)
    });
    const knowledge = processed.extractedKnowledge[0];

    if (!knowledge) {
      write('Je n\'ai pas pu structurer cette reponse. Reformulons.\n');
      continue;
    }

    orchestrator.submitAnswer({
      requirementKey: knowledge.key,
      value: knowledge.value,
      confidence: knowledge.confidence,
      source: knowledge.source,
      rawValue: knowledge.rawValue
    });
    guard += 1;
  }

  const summary = orchestrator.getSummary();
  const knowledge = atlasEngine.getKnowledge();
  const estimatedKnowledge = knowledge.filter((item) => String(item.source).toUpperCase() === 'ESTIMATED');

  write('\n==================================\n');
  write('Diagnostic termine\n\n');
  write('Confiance :\n');
  write(`${summary.diagnostic.confidence}\n\n`);
  write('Connaissances obtenues :\n');
  write(formatKnowledge(knowledge));
  write('\nInformations encore estimees :\n');
  write(formatKnowledge(estimatedKnowledge));
  write('\nResume du projet\n');
  write(JSON.stringify({
    objective: summary.atlas.objective,
    ready: summary.diagnostic.ready,
    status: summary.diagnostic.status,
    missingItems: summary.diagnostic.missingItems.map((item) => item.key),
    blockingItems: summary.diagnostic.blockingItems.map((item) => item.key),
    messages: summary.conversation.messageCount
  }, null, 2));
  write('\n==================================\n');

  return summary;
}

function inferSource(question) {
  const sources = Array.isArray(question.acceptedSources) ? question.acceptedSources : [];

  if (question.expectedAnswerType === 'measure' && sources.includes('MEASURE')) {
    return 'MEASURE';
  }

  if (sources.includes('USER')) {
    return 'USER';
  }

  return sources[0] || 'USER';
}

function formatKnowledge(items) {
  if (!items.length) {
    return '- aucune\n';
  }

  return items.map((item) => `- ${item.type}: ${item.value} (${item.source})`).join('\n') + '\n';
}

function createReadlineAsk() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return {
    ask: (prompt) => new Promise((resolve) => rl.question(prompt, resolve)),
    close: () => rl.close()
  };
}

async function runCli() {
  const { ask, close } = createReadlineAsk();

  try {
    await runAtlasDemo({ ask });
  } finally {
    close();
  }
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  runAtlasDemo
};