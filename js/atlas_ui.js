(function() {
  "use strict";

  const INTENTS_CATALOG = "knowledge/intents/intents.json";

  const OBJECTIVES = {
    doublage: "knowledge/objectives/doublage.json",
    peinture: "knowledge/objectives/peinture.json",
    carrelage: "knowledge/objectives/carrelage.json"
  };

  const SOURCE_LABELS = {
    USER: "réponse utilisateur",
    PHOTO: "photo",
    PLAN: "plan",
    PDF: "PDF",
    MEASURE: "mesure",
    AI: "analyse assistée",
    ESTIMATED: "estimation"
  };

  const state = {
    objective: null,
    objectiveLabel: null,
    requirements: [],
    knowledge: new Map(),
    currentQuestion: null,
    history: [],
    started: false,
    ready: false
  };

  const form = document.getElementById("atlas-form");
  const input = document.getElementById("atlas-input");
  const submit = document.getElementById("atlas-submit");
  const conversation = document.getElementById("atlas-conversation");
  const diagnostic = document.getElementById("atlas-diagnostic");

  if (!form || !input || !submit || !conversation || !diagnostic) {
    return;
  }

  function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function normalizeObjective(value) {
    return normalizeIntentText(value);
  }

  function normalizeIntentText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  async function loadIntentCatalog() {
    const response = await fetch(INTENTS_CATALOG);

    if (!response.ok) {
      throw new Error(`Impossible de charger ${INTENTS_CATALOG}`);
    }

    const catalog = await response.json();
    return Array.isArray(catalog.intents) ? catalog.intents : [];
  }

  async function resolveObjectiveFromInput(rawValue) {
    const directObjective = normalizeObjective(rawValue);

    if (OBJECTIVES[directObjective]) {
      return directObjective;
    }

    const intents = await loadIntentCatalog();
    const match = getBestIntentMatch(rawValue, intents);

    return match ? match.linkedObjective : null;
  }

  function getBestIntentMatch(text, intents) {
    const normalizedText = normalizeIntentText(text);

    if (!normalizedText) {
      return null;
    }

    const matches = intents
      .map((intent) => scoreIntent(intent, normalizedText))
      .sort((left, right) => right.confidence - left.confidence || right.score - left.score);
    const bestMatch = matches[0] || null;

    if (!bestMatch || bestMatch.confidence < bestMatch.confidenceThreshold) {
      return null;
    }

    return bestMatch;
  }

  function scoreIntent(intent, normalizedText) {
    const examples = Array.isArray(intent.examples) ? intent.examples : [];
    const keywords = Array.isArray(intent.keywords) ? intent.keywords : [];
    const words = new Set(normalizedText.split(" ").filter(Boolean));
    let score = 0;

    if (normalizeIntentText(intent.linkedObjective) === normalizedText || normalizeIntentText(intent.id) === normalizedText) {
      score += 10;
    }

    examples.map(normalizeIntentText).forEach((example) => {
      if (!example) return;
      if (example === normalizedText) {
        score += 8;
      } else if (normalizedText.includes(example) || example.includes(normalizedText)) {
        score += 4;
      }
    });

    keywords.map(normalizeIntentText).forEach((keyword) => {
      if (!keyword) return;
      if (normalizedText.includes(keyword)) {
        score += keyword.includes(" ") ? 3 : 2;
      } else if (words.has(keyword)) {
        score += 2;
      }
    });

    return {
      id: intent.id,
      label: intent.label,
      linkedObjective: intent.linkedObjective,
      confidence: Math.min(1, score / 10),
      confidenceThreshold: Number.isFinite(Number(intent.confidenceThreshold)) ? Number(intent.confidenceThreshold) : 0.35,
      score
    };
  }

  function normalizeAnswer(requirement, rawValue) {
    const value = String(rawValue || "").trim();
    const rules = requirement.validationRules || [];
    const hasNumberRule = rules.some((rule) => rule.type === "number" || rule.type === "range");
    const hasBooleanRule = rules.some((rule) => rule.type === "boolean");

    if (hasNumberRule) {
      const normalized = Number(value.replace(",", "."));
      return Number.isFinite(normalized) ? normalized : value;
    }

    if (hasBooleanRule) {
      const lowered = value.toLowerCase();
      if (["oui", "yes", "true", "1"].includes(lowered)) return true;
      if (["non", "no", "false", "0"].includes(lowered)) return false;
    }

    return value;
  }

  function addMessage(role, content, details = null) {
    state.history.push({ id: createId("msg"), role, content, details, timestamp: new Date().toISOString() });
    renderConversation();
  }

  function getRequiredRequirements() {
    return state.requirements.filter((requirement) => requirement.required);
  }

  function getRequiredMissing() {
    return getRequiredRequirements()
      .filter((requirement) => !state.knowledge.has(requirement.key))
      .sort((a, b) => (b.priority || 3) - (a.priority || 3));
  }

  function getOptionalMissing() {
    return state.requirements
      .filter((requirement) => !requirement.required && !state.knowledge.has(requirement.key))
      .sort((a, b) => (b.priority || 3) - (a.priority || 3));
  }

  function getConfidence() {
    const required = getRequiredRequirements();
    if (required.length === 0) return 100;
    const completed = required.filter((requirement) => state.knowledge.has(requirement.key)).length;
    return Math.round((completed / required.length) * 100);
  }

  function getProgress() {
    const required = getRequiredRequirements();
    const completedRequirements = required
      .filter((requirement) => state.knowledge.has(requirement.key))
      .map((requirement) => requirement.key);
    const remainingRequirements = required
      .filter((requirement) => !state.knowledge.has(requirement.key))
      .map((requirement) => requirement.key);
    const blockingRequirements = [...remainingRequirements];
    const completionPercent = required.length === 0
      ? 100
      : Math.round((completedRequirements.length / required.length) * 100);

    return {
      completionPercent,
      completedRequirements,
      remainingRequirements,
      blockingRequirements
    };
  }

  function getNextAction() {
    if (state.ready || !state.currentQuestion) {
      return null;
    }

    return {
      type: "ASK_USER",
      label: `Répondre : ${state.currentQuestion.label}`,
      description: state.currentQuestion.reason,
      priority: state.currentQuestion.priority,
      origin: "diagnostic",
      blocking: true
    };
  }

  function getStatus() {
    const progress = getProgress();
    const nextAction = getNextAction();
    const confidence = getConfidence();
    const blocked = state.started && !state.ready && !nextAction && progress.blockingRequirements.length > 0;
    const badge = state.ready ? "Prêt" : blocked ? "Bloqué" : "Diagnostic en cours";

    return {
      ready: state.ready,
      status: blocked ? "blocked" : state.ready ? "ready" : "in_progress",
      confidence,
      progress,
      nextAction,
      summary: {
        objective: state.objectiveLabel || state.objective,
        ready: state.ready,
        confidence,
        completionPercent: progress.completionPercent,
        completedRequirements: progress.completedRequirements.length,
        remainingRequirements: progress.remainingRequirements.length,
        blockingRequirements: progress.blockingRequirements.length,
        nextActionLabel: nextAction ? nextAction.label : null,
        badge
      }
    };
  }

  function buildQuestion(requirement) {
    const expectedAnswerType = inferExpectedAnswerType(requirement);

    return {
      id: createId("question"),
      requirementKey: requirement.key,
      label: requirement.label,
      question: (requirement.defaultQuestions && requirement.defaultQuestions[0]) || `Pouvez-vous préciser : ${requirement.label} ?`,
      reason: requirement.description || `J'en ai besoin pour compléter ${requirement.label}.`,
      impact: buildImpact(requirement),
      example: buildExample(expectedAnswerType, requirement),
      priority: requirement.priority || 3,
      expectedAnswerType,
      acceptedSources: requirement.acceptedSources || ["USER"]
    };
  }

  function inferExpectedAnswerType(requirement) {
    const rules = requirement.validationRules || [];
    const types = rules.map((rule) => rule && rule.type).filter(Boolean);
    const acceptedSources = requirement.acceptedSources || [];

    if (types.includes("enum")) return "enum";
    if (types.includes("range")) return "range";
    if (types.includes("number")) return "number";
    if (types.includes("boolean")) return "boolean";
    if (acceptedSources.includes("PHOTO")) return "photo";
    if (acceptedSources.includes("PLAN")) return "plan";
    if (acceptedSources.includes("PDF")) return "pdf";
    if (acceptedSources.includes("MEASURE")) return "measure";
    return "text";
  }

  function buildImpact(requirement) {
    if (requirement.required) {
      return `Sans cette information, le diagnostic reste bloqué sur ${requirement.label}.`;
    }

    return `Sans cette information, le diagnostic reste moins précis pour ${requirement.label}.`;
  }

  function buildExample(expectedAnswerType, requirement) {
    if (["number", "range", "measure"].includes(expectedAnswerType)) return "2,50 m";
    if (expectedAnswerType === "boolean") return "oui";

    if (expectedAnswerType === "enum") {
      const enumRule = (requirement.validationRules || []).find((rule) => rule && rule.type === "enum" && Array.isArray(rule.value));
      return enumRule && enumRule.value.length > 0 ? String(enumRule.value[0]) : "option proposée";
    }

    if (expectedAnswerType === "photo") return "photo du support";
    if (expectedAnswerType === "plan") return "plan du chantier";
    if (expectedAnswerType === "pdf") return "document PDF";
    return "valeur renseignée";
  }

  function askNextQuestion() {
    const missing = getRequiredMissing();
    state.ready = missing.length === 0;

    if (state.ready) {
      state.currentQuestion = null;
      input.placeholder = "Diagnostic terminé";
      submit.textContent = "Diagnostic terminé";
      submit.disabled = true;
      addMessage("assistant", "Diagnostic terminé. Les informations obligatoires sont présentes.");
      renderDiagnostic();
      return;
    }

    state.currentQuestion = buildQuestion(missing[0]);
    input.value = "";
    input.placeholder = "Votre réponse";
    submit.textContent = "Répondre";
    addMessage("assistant", state.currentQuestion.question, { question: state.currentQuestion });
    renderDiagnostic();
  }

  async function startSession(rawObjective) {
    submit.disabled = true;

    let objective = null;

    try {
      objective = await resolveObjectiveFromInput(rawObjective);
    } catch (error) {
      addMessage("system", error.message || "Chargement des intentions impossible.");
      renderDiagnostic();
      submit.disabled = false;
      return;
    }

    const objectivePath = objective ? OBJECTIVES[objective] : null;

    if (!objectivePath) {
      addMessage("system", "Je n’ai pas encore reconnu l’objectif. Essayez : doublage, peinture ou carrelage.");
      renderDiagnostic();
      submit.disabled = false;
      return;
    }

    try {
      const response = await fetch(objectivePath);
      if (!response.ok) {
        throw new Error(`Impossible de charger ${objectivePath}`);
      }

      const objectiveData = await response.json();
      state.objective = objective;
      state.objectiveLabel = objectiveData.label || objective;
      state.requirements = Array.isArray(objectiveData.requirements) ? objectiveData.requirements : [];
      state.knowledge.clear();
      state.history = [];
      state.started = true;
      state.ready = false;

      addMessage("user", rawObjective);
      addMessage("assistant", `Objectif ${state.objectiveLabel} chargé. Je prépare le diagnostic.`);
      askNextQuestion();
    } catch (error) {
      addMessage("system", error.message || "Chargement impossible.");
      renderDiagnostic();
    } finally {
      submit.disabled = false;
    }
  }

  function submitAnswer(rawAnswer) {
    if (!state.currentQuestion) return;

    const requirement = state.requirements.find((item) => item.key === state.currentQuestion.requirementKey);
    if (!requirement) return;

    const value = normalizeAnswer(requirement, rawAnswer);
    state.knowledge.set(requirement.key, {
      id: createId("knowledge"),
      key: requirement.key,
      type: requirement.category || "objective",
      value,
      confidence: 1,
      source: "USER",
      status: "confirmed",
      timestamp: new Date().toISOString()
    });

    addMessage("user", rawAnswer);
    askNextQuestion();
  }

  function renderConversation() {
    conversation.innerHTML = "";

    if (state.history.length === 0) {
      const empty = document.createElement("p");
      empty.className = "atlas-empty";
      empty.textContent = "La conversation apparaîtra ici.";
      conversation.appendChild(empty);
      return;
    }

    state.history.forEach((message) => {
      const item = document.createElement("article");
      item.className = `atlas-message ${message.role}`;

      const label = document.createElement("strong");
      label.textContent = message.role === "user" ? "Vous" : message.role === "system" ? "Atlas" : "Atlas";

      const content = document.createElement("span");
      content.textContent = message.content;

      item.append(label, content);

      if (message.details && message.details.question) {
        item.appendChild(renderQuestionDetails(message.details.question));
      }

      conversation.appendChild(item);
    });

    conversation.scrollTop = conversation.scrollHeight;
  }

  function renderQuestionDetails(question) {
    const details = document.createElement("div");
    details.className = "atlas-question-details";

    const rows = [
      ["Question", question.question],
      ["Pourquoi", question.reason],
      ["Exemple", question.example]
    ];

    rows.forEach(([title, value]) => {
      if (!value) return;
      const row = document.createElement("p");
      row.className = "atlas-question-detail";
      const strong = document.createElement("strong");
      strong.textContent = title;
      const span = document.createElement("span");
      span.textContent = value;
      row.append(strong, span);
      details.appendChild(row);
    });

    return details;
  }

  function renderProgress(status) {
    const section = document.createElement("section");
    section.className = "atlas-progress";

    const header = document.createElement("div");
    header.className = "atlas-progress-header";

    const title = document.createElement("strong");
    title.textContent = `${status.progress.completionPercent}%`;

    const badge = document.createElement("span");
    badge.className = `atlas-state-badge ${status.status}`;
    badge.textContent = status.summary.badge;

    header.append(title, badge);

    const track = document.createElement("div");
    track.className = "atlas-progress-track";
    track.setAttribute("aria-label", "Progression Atlas");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", String(status.progress.completionPercent));
    track.setAttribute("role", "progressbar");

    const fill = document.createElement("div");
    fill.className = "atlas-progress-fill";
    fill.style.width = `${status.progress.completionPercent}%`;
    track.appendChild(fill);

    const meta = document.createElement("div");
    meta.className = "atlas-progress-meta";

    const remaining = document.createElement("span");
    remaining.textContent = `${status.progress.remainingRequirements.length} information${status.progress.remainingRequirements.length > 1 ? "s" : ""} restante${status.progress.remainingRequirements.length > 1 ? "s" : ""}`;

    const action = document.createElement("span");
    action.textContent = status.nextAction ? status.nextAction.label : "Aucune action restante";

    meta.append(remaining, action);
    section.append(header, track, meta);

    return section;
  }

  function renderDiagnostic() {
    const requiredMissing = getRequiredMissing();
    const optionalMissing = getOptionalMissing();
    const knownItems = Array.from(state.knowledge.values());
    const status = getStatus();

    diagnostic.innerHTML = "";

    if (!state.started) {
      const empty = document.createElement("p");
      empty.className = "atlas-empty";
      empty.textContent = "Choisissez un objectif pour lancer le diagnostic.";
      diagnostic.appendChild(empty);
      return;
    }

    diagnostic.appendChild(renderProgress(status));

    const known = document.createElement("div");
    known.innerHTML = `<strong>Connaissances obtenues</strong><ul>${knownItems.map((item) => `<li>${escapeHtml(item.key)} : ${escapeHtml(String(item.value))}</li>`).join("") || "<li>Aucune pour le moment</li>"}</ul>`;
    diagnostic.appendChild(known);

    const missing = document.createElement("div");
    missing.innerHTML = `<strong>Informations obligatoires manquantes</strong><ul>${requiredMissing.map((item) => `<li>${escapeHtml(item.label)} (${escapeHtml(item.key)})</li>`).join("") || "<li>Aucune</li>"}</ul>`;
    diagnostic.appendChild(missing);

    const optional = document.createElement("div");
    optional.innerHTML = `<strong>Informations encore estimées</strong><ul>${optionalMissing.map((item) => `<li>${escapeHtml(item.label)}</li>`).join("") || "<li>Aucune information optionnelle demandée</li>"}</ul>`;
    diagnostic.appendChild(optional);

    if (status.nextAction) {
      const action = document.createElement("div");
      action.innerHTML = `<strong>Prochaine action</strong><p>${escapeHtml(status.nextAction.description || status.nextAction.label)}</p>`;
      diagnostic.appendChild(action);
    }
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    if (!state.started) {
      startSession(value);
      return;
    }

    submitAnswer(value);
  });

  renderConversation();
  renderDiagnostic();
})();
