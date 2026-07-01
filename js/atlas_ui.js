(function() {
  "use strict";

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
    return String(value || "").trim().toLowerCase();
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

  function addMessage(role, content) {
    state.history.push({ id: createId("msg"), role, content, timestamp: new Date().toISOString() });
    renderConversation();
  }

  function getRequiredMissing() {
    return state.requirements
      .filter((requirement) => requirement.required && !state.knowledge.has(requirement.key))
      .sort((a, b) => (b.priority || 3) - (a.priority || 3));
  }

  function getOptionalMissing() {
    return state.requirements
      .filter((requirement) => !requirement.required && !state.knowledge.has(requirement.key))
      .sort((a, b) => (b.priority || 3) - (a.priority || 3));
  }

  function getConfidence() {
    const required = state.requirements.filter((requirement) => requirement.required);
    if (required.length === 0) return 100;
    const completed = required.filter((requirement) => state.knowledge.has(requirement.key)).length;
    return Math.round((completed / required.length) * 100);
  }

  function buildQuestion(requirement) {
    return {
      id: createId("question"),
      requirementKey: requirement.key,
      label: requirement.label,
      question: (requirement.defaultQuestions && requirement.defaultQuestions[0]) || `Pouvez-vous préciser : ${requirement.label} ?`,
      reason: requirement.description || "Information nécessaire au diagnostic.",
      priority: requirement.priority || 3,
      acceptedSources: requirement.acceptedSources || ["USER"]
    };
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
    addMessage("assistant", state.currentQuestion.question);
    renderDiagnostic();
  }

  async function startSession(rawObjective) {
    const objective = normalizeObjective(rawObjective);
    const objectivePath = OBJECTIVES[objective];

    if (!objectivePath) {
      addMessage("system", "Objectif inconnu. Choisissez doublage, peinture ou carrelage.");
      renderDiagnostic();
      return;
    }

    submit.disabled = true;

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
      conversation.appendChild(item);
    });

    conversation.scrollTop = conversation.scrollHeight;
  }

  function renderDiagnostic() {
    const requiredMissing = getRequiredMissing();
    const optionalMissing = getOptionalMissing();
    const confidence = getConfidence();
    const knownItems = Array.from(state.knowledge.values());
    const statusText = state.ready ? "Prêt" : "En cours";

    diagnostic.innerHTML = "";

    if (!state.started) {
      const empty = document.createElement("p");
      empty.className = "atlas-empty";
      empty.textContent = "Choisissez un objectif pour lancer le diagnostic.";
      diagnostic.appendChild(empty);
      return;
    }

    const status = document.createElement("div");
    status.className = `atlas-status${state.ready ? " ready" : ""}`;
    status.textContent = `${statusText} - Confiance ${confidence}%`;
    diagnostic.appendChild(status);

    const known = document.createElement("div");
    known.innerHTML = `<strong>Connaissances obtenues</strong><ul>${knownItems.map((item) => `<li>${escapeHtml(item.key)} : ${escapeHtml(String(item.value))}</li>`).join("") || "<li>Aucune pour le moment</li>"}</ul>`;
    diagnostic.appendChild(known);

    const missing = document.createElement("div");
    missing.innerHTML = `<strong>Informations obligatoires manquantes</strong><ul>${requiredMissing.map((item) => `<li>${escapeHtml(item.label)} (${escapeHtml(item.key)})</li>`).join("") || "<li>Aucune</li>"}</ul>`;
    diagnostic.appendChild(missing);

    const optional = document.createElement("div");
    optional.innerHTML = `<strong>Informations encore estimées</strong><ul>${optionalMissing.map((item) => `<li>${escapeHtml(item.label)}</li>`).join("") || "<li>Aucune information optionnelle demandée</li>"}</ul>`;
    diagnostic.appendChild(optional);

    if (state.currentQuestion) {
      const action = document.createElement("div");
      action.innerHTML = `<strong>Prochaine action</strong><p>${escapeHtml(state.currentQuestion.acceptedSources.map((source) => SOURCE_LABELS[source] || source).join(", "))}</p>`;
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
