/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Assistant IA (Groq API)
//  assistant_ia.js
// ============================================================

const AssistantIA = {

  MODEL:    'llama-3.1-8b-instant',
  _open:    false,
  _loading: false,
  _history: [],
  _listenersController: null,


  SYSTEM: `Tu es un assistant conseil en Plâtrerie et peinture intégré dans PlaqPro+.
Tu réponds aux questions sur les matériaux, normes DTU, conseils de pose, et choix de produits.
IMPORTANT : Tu ne calcules JAMAIS de quantités toi-même. Pour tout calcul de plaques, rails, peinture ou autres quantités, tu dis toujours : 'Utilisez le Calcul Express de PlaqPro+ pour obtenir un résultat précis avec les bons ratios professionnels.'
Tu réponds en français, de façon courte et pratique.`,

  setSynthese(texte) {
    try { sessionStorage.setItem('plaqpro_synthese_chiffrage', texte); } catch(e) {}
    // Si un champ description existe dans l'UI, le remplir
    const champ = document.getElementById('dm-ia-descriptif') ||
                  document.getElementById('ia-input') ||
                  document.getElementById('assistant-description') ||
                  document.getElementById('ia-description') ||
                  document.querySelector('[data-ia-description]');
    if (champ) champ.value = texte;
  },

  // ── Initialisation ────────────────────────────────────────
  init() {
    this._injectStyles();
    this._buildWidget();
    this._checkGroq();
  },

  // ── Vérification clé Groq ─────────────────────────────────
  _checkGroq() {
    const key = localStorage.getItem('plaqpro_groq_key') || '';
    this._setStatus(key ? 'online' : 'offline');
  },

  _setStatus(s) {
    const dot = document.getElementById('ia-status-dot');
    const lbl = document.getElementById('ia-status-lbl');
    if (!dot || !lbl) return;
    if (s === 'online') {
      dot.style.background = 'var(--ia-green)';
      dot.style.boxShadow  = '0 0 6px var(--ia-green)';
      lbl.textContent      = 'En ligne';
    } else {
      dot.style.background = '#A78BFA';
      dot.style.boxShadow  = '0 0 6px #A78BFA';
      lbl.textContent      = 'Version Pro';
    }
  },

  // ── Construction du widget ────────────────────────────────
  _buildWidget() {
    this._resetListeners();
    document.getElementById('ia-toggle-btn')?.remove();
    document.getElementById('ia-window')?.remove();
    const btn = document.createElement('button');
    btn.id = 'ia-toggle-btn';
    btn.innerHTML = '🤖';
    btn.title = 'Assistant IA PlaqPro+';
    document.body.appendChild(btn);

    const win = document.createElement('div');
    win.id = 'ia-window';
    win.innerHTML = `
      <div id="ia-header">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">🤖</span>
          <div>
            <div style="font-weight:700;font-size:14px;color:#F0F2F8">Assistant PlaqPro+</div>
            <div style="display:flex;align-items:center;gap:5px;margin-top:2px">
              <span id="ia-status-dot" style="width:7px;height:7px;border-radius:50%;background:#4E5770;display:inline-block"></span>
              <span id="ia-status-lbl" style="font-size:11px;color:#8892AA">Vérification…</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="ia-hdr-btn" onclick="AssistantIA.clearHistory()" title="Effacer">🗑</button>
          <button class="ia-hdr-btn" onclick="AssistantIA.toggle()" title="Fermer">✕</button>
        </div>
      </div>

      <div id="ia-messages">
        <div class="ia-msg ia-msg-bot">
          <div class="ia-bubble">
            Bonjour ! Je suis votre assistant conseil en Plâtrerie.<br>
            Posez-moi vos questions sur les matériaux, normes DTU ou techniques de pose. 💬
            <div style="background:rgba(245,158,11,0.08);border:0.5px solid rgba(245,158,11,0.3);border-radius:8px;padding:10px 14px;font-size:11px;color:#f59e0b;margin-top:8px;line-height:1.6">
⚠️ <strong>Assistant d'aide à la décision</strong> — Les suggestions fournies sont indicatives et doivent être vérifiées par un professionnel qualifié. PlaqPro+ ne saurait être tenu responsable des décisions prises sur la base de ces informations.
</div>
          </div>
        </div>
      </div>

      <div id="ia-input-row">
        <div id="ia-hint" style="display:none"></div>
        <textarea id="ia-input" placeholder="Ex: Quelle vis utiliser pour du BA13 sur ossature ?" rows="1"></textarea>
        <button id="ia-send-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(win);

    this._bindWidgetListeners();
  },

  _resetListeners() {
    if (this._listenersController) this._listenersController.abort();
    this._listenersController = new AbortController();
  },

  _bindWidgetListeners() {
    const signal = this._listenersController.signal;
    const toggleBtn = document.getElementById('ia-toggle-btn');
    const sendBtn = document.getElementById('ia-send-btn');
    const ta = document.getElementById('ia-input');
    if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggle(), { signal });
    if (sendBtn) sendBtn.addEventListener('click', () => this.send(), { signal });
    if (!ta) return;
    ta.addEventListener('keydown', e => this._onKey(e), { signal });
    ta.addEventListener('input', () => {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }, { signal });
  },

  // ── Toggle ────────────────────────────────────────────────
  toggle() {
    this._open = !this._open;
    const win = document.getElementById('ia-window');
    const btn = document.getElementById('ia-toggle-btn');
    win.classList.toggle('ia-open', this._open);
    btn.classList.toggle('ia-btn-active', this._open);
    btn.innerHTML = this._open ? '✕' : '🤖';
    if (this._open) {
      this._checkGroq();
      try {
        const synthese = sessionStorage.getItem('plaqpro_synthese_chiffrage');
        if (synthese) {
          const inp = document.getElementById('ia-input');
          if (inp && !inp.value) inp.value = synthese;
          if (inp && inp.value === synthese) {
            const hint = document.getElementById('ia-hint');
            if (hint) {
              hint.textContent = '💡 Synthèse de votre chiffrage pré-remplie — posez vos questions ou lancez l\'analyse';
              hint.style.display = 'block';
            }
          }
        }
      } catch(e) {}
      setTimeout(() => document.getElementById('ia-input')?.focus(), 200);
    }
  },

  // ── Envoi message ─────────────────────────────────────────
  async send() {
    if (this._loading) return;
    const input = document.getElementById('ia-input');
    const text  = input.value.trim();
    if (!text) return;

    const gc = groqConfig();
    if (!gc) { this._promptCle(); return; }
    const { url: endpoint, headers } = gc;

    input.value = '';
    input.style.height = 'auto';

    this._addMessage('user', esc(text));
    this._history.push({ role: 'user', content: text });

    this._loading = true;
    document.getElementById('ia-send-btn').disabled = true;
    const thinkingId = this._addMessage('bot', '<span class="ia-typing"><span></span><span></span><span></span></span>', true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model:    this.MODEL,
          messages: [
            { role: 'system', content: this.SYSTEM },
            ...this._history.slice(-10)
          ],
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${response.status}`);
      }

      const data   = await response.json();
      const reply  = data.choices?.[0]?.message?.content?.trim() || '';
      const bubble = document.getElementById(thinkingId);
      if (bubble) bubble.innerHTML = this._formatMD(reply);
      this._history.push({ role: 'assistant', content: reply });

    } catch (err) {
      const bubble = document.getElementById(thinkingId);
      if (bubble) bubble.innerHTML = `<span style="color:#F75B5B">⚠ Erreur : ${esc(err.message)}</span>`;
    }

    this._loading = false;
    document.getElementById('ia-send-btn').disabled = false;
    document.getElementById('ia-input')?.focus();
    this._scrollBottom();
  },

  // ── Formatage Markdown basique ────────────────────────────
  _formatMD(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/`(.+?)`/g,       '<code>$1</code>')
      .replace(/^### (.+)$/gm,   '<h4>$1</h4>')
      .replace(/^## (.+)$/gm,    '<h3>$1</h3>')
      .replace(/^- (.+)$/gm,     '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s,'<ul>$1</ul>')
      .replace(/\n\n/g,          '<br><br>')
      .replace(/\n/g,            '<br>');
  },

  // ── Helpers ───────────────────────────────────────────────
  _cleanJsonGroq(raw) {
    const brut = String(raw || '');
    console.warn('[AssistantIA] Réponse Groq brute:', brut);
    let text = (brut.match(/\{[\s\S]*\}/) || [''])[0]
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    if (!text) return '';
    text = text.replace(/[\u2018\u2019]/g, "'");
    let out = '';
    let inString = false;
    let escaped = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (escaped) {
        out += ch;
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        out += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        if (!inString) {
          inString = true;
          out += ch;
          continue;
        }
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j++;
        if (j >= text.length || /[,}\]:]/.test(text[j])) {
          inString = false;
          out += ch;
        } else {
          out += '\\"';
        }
        continue;
      }
      out += ch;
    }
    return out;
  },

  parseJsonGroq(raw) {
    try {
      const direct = (String(raw || '').match(/\{[\s\S]*\}/) || [''])[0];
      if (direct) return JSON.parse(direct);
    } catch (errDirect) {
      // Deuxième chance avec nettoyage fin.
    }
    try {
      const cleaned = this._cleanJsonGroq(raw);
      if (cleaned) return JSON.parse(cleaned);
    } catch (errClean) {
      console.warn('[AssistantIA] Analyse JSON partielle après échec nettoyage:', errClean.message);
    }
    return {
      synthese: 'Analyse indisponible',
      resume: 'Analyse partielle',
      postes: [],
      sections: [],
      alertes: ['Analyse partielle : certaines informations IA n’ont pas pu être interprétées.'],
      recommandations: [],
      _analysePartielle: true,
    };
  },

  _addMessage(role, html, isTemp = false) {
    const id  = 'ia-msg-' + Date.now();
    const div = document.createElement('div');
    div.className = `ia-msg ia-msg-${role === 'user' ? 'user' : 'bot'}`;
    div.innerHTML = `<div class="ia-bubble" id="${id}">${html}</div>`;
    document.getElementById('ia-messages').appendChild(div);
    this._scrollBottom();
    return id;
  },

  _scrollBottom() {
    const el = document.getElementById('ia-messages');
    if (el) el.scrollTop = el.scrollHeight;
  },

  _onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  },

  clearHistory() {
    this._history = [];
    const msgs = document.getElementById('ia-messages');
    if (msgs) msgs.innerHTML = `
      <div class="ia-msg ia-msg-bot">
        <div class="ia-bubble">Conversation effacée. Comment puis-je vous aider ? 💬</div>
      </div>`;
  },

  _promptCle() {
    this._addMessage('bot', `<div style="padding:20px;max-width:340px;margin:0 auto">
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:40px;margin-bottom:8px">🤖</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:4px">Activez l'Assistant IA</div>
      <div style="font-size:13px;color:var(--text-secondary)">Clé Groq gratuite — 2 minutes pour l'obtenir</div>
    </div>
    <div style="background:rgba(79,142,247,.08);border:1px solid rgba(79,142,247,.3);border-radius:8px;padding:14px;margin-bottom:16px;font-size:12px">
      <div style="font-weight:700;margin-bottom:8px;color:var(--accent)">📋 Comment obtenir votre clé gratuite :</div>
      <div style="line-height:1.8">
        1️⃣ Cliquez sur le lien ci-dessous<br>
        2️⃣ Créez un compte gratuit (email suffit)<br>
        3️⃣ Cliquez "Create API Key"<br>
        4️⃣ Copiez la clé et collez-la ici<br>
        <span style="color:#10b981;font-weight:600">✅ Gratuit — 14 400 requêtes/jour</span>
      </div>
    </div>
    <a href="https://console.groq.com/keys" target="_blank"
      style="display:block;background:var(--accent);color:#fff;text-align:center;padding:10px;border-radius:6px;font-weight:600;font-size:13px;text-decoration:none;margin-bottom:14px">
      🔗 Obtenir ma clé gratuite sur console.groq.com →
    </a>
    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px;font-weight:600">🔑 Collez votre clé ici :</div>
    <input type="password" id="ia-groq-input" placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
      style="width:100%;padding:10px;border:1px solid var(--border);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);font-size:13px;margin-bottom:10px;box-sizing:border-box">
    <button onclick="AssistantIA.validerCle()"
      style="width:100%;background:var(--accent);color:#fff;border:none;padding:12px;border-radius:6px;font-weight:700;font-size:14px;cursor:pointer">
      ✅ Activer l'Assistant IA
    </button>
    <div style="text-align:center;margin-top:10px;font-size:11px;color:var(--text-tertiary)">
      🔒 Votre clé est stockée uniquement sur votre appareil
    </div>
  </div>`);
    setTimeout(() => document.getElementById('ia-groq-input')?.focus(), 100);
  },

  validerCle() {
    const input = document.getElementById('ia-groq-input');
    const cle = (input?.value || '').trim();
    if (!cle.startsWith('gsk_') || cle.length < 20) {
      App.toast('❌ Clé invalide — elle doit commencer par gsk_ et faire au moins 20 caractères', 'error');
      return;
    }
    // Sauvegarder dans tous les emplacements utilisés par PlaqPro+
    localStorage.setItem('plaqpro_groq_key', cle);
    localStorage.setItem('groq_api_key', cle);
    localStorage.setItem('plaqpro_groq', cle);
    var config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    config.groqApiKey = cle;
    config.groqKey    = cle;
    config.apiKeyGroq = cle;
    localStorage.setItem('plaqpro_config', JSON.stringify(config));
    // Rafraîchir l'assistant
    AssistantIA._cle = cle;
    const wrap = document.getElementById('ia-wrap');
    if (wrap) { wrap.innerHTML = ''; AssistantIA.init(wrap); }
  },

  // ── Styles ────────────────────────────────────────────────
  _injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
      :root {
        --ia-bg:     rgba(13,15,20,0.97);
        --ia-border: rgba(255,255,255,0.10);
        --ia-accent: #4F8EF7;
        --ia-green:  #2DD4A0;
        --ia-user:   rgba(79,142,247,0.18);
        --ia-bot:    rgba(255,255,255,0.05);
      }

      #ia-toggle-btn {
        position: fixed; bottom: 20px; right: 20px; top: auto; z-index: 5;
        width: 42px; height: 42px; border-radius: 50%;
        background: var(--card-bg, #1e1e2e);
        border: 1px solid var(--accent, #4f8ef7);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 20px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s ease;
      }
      #ia-toggle-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 10px 32px rgba(79,142,247,0.6); }
      #ia-toggle-btn.ia-btn-active { background: rgba(30,35,50,0.95); font-size: 18px; }

      #ia-window {
        position: fixed; bottom: 96px; right: 88px; z-index: 8999;
        width: 380px; height: 520px;
        background: var(--ia-bg);
        border: 1px solid var(--ia-border);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
        display: flex; flex-direction: column;
        opacity: 0; pointer-events: none;
        transform: translateY(16px) scale(0.96);
        transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        backdrop-filter: blur(24px);
        overflow: hidden;
      }
      #ia-window.ia-open { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }

      #ia-header {
        padding: 14px 16px;
        border-bottom: 1px solid var(--ia-border);
        background: rgba(255,255,255,0.03);
        display: flex; align-items: center; justify-content: space-between;
        flex-shrink: 0;
      }
      .ia-hdr-btn {
        width: 28px; height: 28px; border-radius: 8px;
        background: rgba(255,255,255,0.06); border: 1px solid var(--ia-border);
        color: #8892AA; font-size: 13px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.15s;
      }
      .ia-hdr-btn:hover { background: rgba(255,255,255,0.12); color: #F0F2F8; }

      #ia-messages {
        flex: 1; overflow-y: auto; padding: 14px 12px;
        display: flex; flex-direction: column; gap: 10px;
        scroll-behavior: smooth;
      }
      #ia-messages::-webkit-scrollbar { width: 4px; }
      #ia-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

      .ia-msg { display: flex; }
      .ia-msg-user  { justify-content: flex-end; }
      .ia-msg-bot   { justify-content: flex-start; }

      .ia-bubble {
        max-width: 88%; padding: 10px 14px;
        border-radius: 16px; font-size: 13px; line-height: 1.55;
        color: #F0F2F8; word-break: break-word;
      }
      .ia-msg-user .ia-bubble {
        background: var(--ia-user);
        border: 1px solid rgba(79,142,247,0.25);
        border-bottom-right-radius: 4px;
      }
      .ia-msg-bot .ia-bubble {
        background: var(--ia-bot);
        border: 1px solid var(--ia-border);
        border-bottom-left-radius: 4px;
      }
      .ia-bubble code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 12px; }
      .ia-bubble strong { color: #fff; }
      .ia-bubble h3,h4 { margin: 6px 0 3px; font-size: 13px; color: var(--ia-accent); }
      .ia-bubble ul { padding-left: 16px; margin: 4px 0; }
      .ia-bubble li { margin-bottom: 2px; }

      .ia-cursor { display: inline-block; animation: ia-blink 0.8s infinite; color: var(--ia-accent); }
      @keyframes ia-blink { 0%,100%{opacity:1} 50%{opacity:0} }

      .ia-typing { display: inline-flex; gap: 4px; align-items: center; padding: 2px 0; }
      .ia-typing span {
        width: 7px; height: 7px; border-radius: 50%;
        background: #4E5770; animation: ia-dot 1.2s infinite;
      }
      .ia-typing span:nth-child(2) { animation-delay: 0.2s; }
      .ia-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes ia-dot { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }

      #ia-input-row {
        display: grid; grid-template-columns: 1fr 38px; align-items: flex-end; gap: 8px;
        padding: 10px 12px;
        border-top: 1px solid var(--ia-border);
        background: rgba(255,255,255,0.02);
        flex-shrink: 0;
      }
      #ia-hint {
        grid-column: 1 / -1;
        color: var(--ia-accent);
        font-size: 11px;
        line-height: 1.35;
        padding: 0 2px 2px;
      }
      #ia-input {
        flex: 1; background: rgba(255,255,255,0.06);
        border: 1px solid var(--ia-border);
        border-radius: 12px; padding: 9px 12px;
        color: #F0F2F8; font-size: 13px; font-family: inherit;
        resize: none; outline: none; line-height: 1.4;
        min-height: 38px; max-height: 120px;
        transition: border-color 0.15s;
      }
      #ia-input:focus { border-color: var(--ia-accent); }
      #ia-input::placeholder { color: #4E5770; }
      #ia-send-btn {
        width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
        background: linear-gradient(135deg, #5B9BFF, #3B7DE8);
        border: none; color: white; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.15s; box-shadow: 0 3px 10px rgba(79,142,247,0.35);
      }
      #ia-send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(79,142,247,0.5); }
      #ia-send-btn:disabled { opacity: 0.4; cursor: default; }

      @media (max-width: 480px) {
        #ia-window { width: calc(100vw - 20px); right: 10px; bottom: 80px; }
        #ia-toggle-btn { bottom: 20px; right: 20px; top: auto; }
      }
    `;
    document.head.appendChild(s);
  },
};

document.addEventListener('DOMContentLoaded', () => AssistantIA.init());
