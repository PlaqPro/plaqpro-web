/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Calculatrice flottante
//  calculatrice.js
// ============================================================

var Calculatrice = {

  _open:          false,
  _currentValue:  '0',
  _operator:      null,
  _previousValue: null,
  _shouldReset:   false,
  _expression:    '',
  _justEquals:    false,
  _history:       [],
  _keyHandler:    null,

  // ── Init ──────────────────────────────────────────────────
  init() {
    this._injectStyles();
    this._buildWidget();
  },

  // ── Styles ────────────────────────────────────────────────
  _injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #calc-window {
        position: fixed; bottom: 28px; right: 90px; z-index: 8999;
        width: 288px;
        background: rgba(18,21,32,0.96);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 20px;
        box-shadow: 0 20px 64px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4);
        overflow: hidden;
        opacity: 0; pointer-events: none;
        transform: translateY(16px) scale(0.96);
        transition: opacity 0.22s ease, transform 0.22s ease;
        display: flex; flex-direction: column;
      }
      #calc-window.calc-open { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }

      #calc-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 14px 10px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
      }

      .calc-hdr-btn {
        background: rgba(255,255,255,0.07); border: none; border-radius: 8px;
        width: 28px; height: 28px; cursor: pointer; font-size: 13px;
        color: #8892AA; transition: background 0.15s;
        display: flex; align-items: center; justify-content: center;
      }
      .calc-hdr-btn:hover { background: rgba(255,255,255,0.13); color: #F0F2F8; }

      #calc-display {
        padding: 14px 16px 10px;
        text-align: right;
        min-height: 72px;
        display: flex; flex-direction: column; justify-content: flex-end;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      #calc-expr {
        font-size: 12px; color: #4E5770; font-family: 'JetBrains Mono', monospace;
        min-height: 16px; word-break: break-all;
        transition: opacity 0.15s;
      }
      #calc-result {
        font-size: 32px; font-weight: 700; color: #F0F2F8;
        font-family: 'JetBrains Mono', monospace;
        line-height: 1.1; margin-top: 2px;
        transition: font-size 0.1s;
        word-break: break-all;
      }

      #calc-keys {
        display: grid; grid-template-columns: repeat(4, 1fr);
        gap: 6px; padding: 10px 10px 8px;
      }

      .calc-key {
        height: 58px; border-radius: 12px; border: none; cursor: pointer;
        font-size: 18px; font-weight: 600;
        background: rgba(255,255,255,0.06);
        color: #F0F2F8;
        transition: background 0.12s, transform 0.08s;
        display: flex; align-items: center; justify-content: center;
        user-select: none;
      }
      .calc-key:hover  { background: rgba(255,255,255,0.11); }
      .calc-key:active { transform: scale(0.93); }

      .calc-key-fn {
        background: rgba(255,255,255,0.1);
        color: #8892AA; font-size: 16px;
      }
      .calc-key-fn:hover { background: rgba(255,255,255,0.16); color: #F0F2F8; }

      .calc-key-op {
        background: rgba(45,212,160,0.12);
        color: #2DD4A0; font-size: 20px;
      }
      .calc-key-op:hover  { background: rgba(45,212,160,0.22); }
      .calc-key-op.active { background: #2DD4A0; color: #0D1A15; }

      .calc-key-eq {
        background: linear-gradient(135deg, #2DD4A0, #1aab80);
        color: #0D1A15; font-size: 20px;
      }
      .calc-key-eq:hover { background: linear-gradient(135deg, #3ae0ab, #22c992); }

      .calc-key-zero { grid-column: span 2; justify-content: flex-start; padding-left: 22px; }

      #calc-history {
        border-top: 1px solid rgba(255,255,255,0.06);
        padding: 8px 12px 0;
        max-height: 116px; overflow-y: auto;
      }
      #calc-history::-webkit-scrollbar { width: 3px; }
      #calc-history::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      #calc-history-label {
        font-size: 10px; text-transform: uppercase; letter-spacing: .08em;
        color: #4E5770; margin-bottom: 4px;
      }

      #calc-footer {
        padding: 8px 10px 12px;
        display: flex; justify-content: flex-end;
        border-top: 1px solid rgba(255,255,255,0.05);
      }

      @media (max-width: 480px) {
        #calc-window { right: 10px; bottom: 80px; width: calc(100vw - 20px); }
      }
    `;
    document.head.appendChild(style);
  },

  // ── Widget DOM ────────────────────────────────────────────
  _buildWidget() {
    const win = document.createElement('div');
    win.id = 'calc-window';
    win.innerHTML = `
      <div id="calc-header">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">🧮</span>
          <span style="font-weight:700;font-size:14px;color:#F0F2F8">Calculatrice</span>
        </div>
        <div style="display:flex;gap:5px">
          <button class="calc-hdr-btn" onclick="Calculatrice.resetHistory()" title="Effacer l\'historique">🗑</button>
          <button class="calc-hdr-btn" onclick="Calculatrice.toggle()">✕</button>
        </div>
      </div>

      <div id="calc-display">
        <div id="calc-expr"></div>
        <div id="calc-result">0</div>
      </div>

      <div id="calc-keys">
        <button class="calc-key calc-key-fn" onclick="Calculatrice.clear()">C</button>
        <button class="calc-key calc-key-fn" onclick="Calculatrice.toggleSign()">±</button>
        <button class="calc-key calc-key-fn" onclick="Calculatrice.percent()">%</button>
        <button class="calc-key calc-key-op" id="calc-op-÷" onclick="Calculatrice.setOperator('÷')">÷</button>

        <button class="calc-key" onclick="Calculatrice.digit('7')">7</button>
        <button class="calc-key" onclick="Calculatrice.digit('8')">8</button>
        <button class="calc-key" onclick="Calculatrice.digit('9')">9</button>
        <button class="calc-key calc-key-op" id="calc-op-×" onclick="Calculatrice.setOperator('×')">×</button>

        <button class="calc-key" onclick="Calculatrice.digit('4')">4</button>
        <button class="calc-key" onclick="Calculatrice.digit('5')">5</button>
        <button class="calc-key" onclick="Calculatrice.digit('6')">6</button>
        <button class="calc-key calc-key-op" id="calc-op-−" onclick="Calculatrice.setOperator('−')">−</button>

        <button class="calc-key" onclick="Calculatrice.digit('1')">1</button>
        <button class="calc-key" onclick="Calculatrice.digit('2')">2</button>
        <button class="calc-key" onclick="Calculatrice.digit('3')">3</button>
        <button class="calc-key calc-key-op" id="calc-op-+" onclick="Calculatrice.setOperator('+')">+</button>

        <button class="calc-key calc-key-zero" onclick="Calculatrice.digit('0')">0</button>
        <button class="calc-key" onclick="Calculatrice.dot()">.</button>
        <button class="calc-key calc-key-eq" onclick="Calculatrice.equals()">=</button>
      </div>

      <div id="calc-history">
        <div id="calc-history-label">Historique</div>
        <div id="calc-history-list">
          <div style="font-size:11px;color:var(--text-tertiary);padding:4px 0">Aucun calcul</div>
        </div>
      </div>

      <div id="calc-footer">
        <button class="btn btn-secondary btn-sm" onclick="Calculatrice.copyResult()">📋 Copier le résultat</button>
      </div>
    `;
    document.body.appendChild(win);
  },

  // ── Toggle ────────────────────────────────────────────────
  toggle() {
    this._open = !this._open;
    const win = document.getElementById('calc-window');
    win.classList.toggle('calc-open', this._open);

    if (this._open) {
      this._updateDisplay();
      this._updateHistory();
      this._attachKeyboard();
    } else {
      this._detachKeyboard();
    }
  },

  // ── Clavier ───────────────────────────────────────────────
  _attachKeyboard() {
    this._keyHandler = (e) => {
      if (!Calculatrice._open) return;
      if (['0','1','2','3','4','5','6','7','8','9'].includes(e.key)) { Calculatrice.digit(e.key); e.preventDefault(); }
      else if (e.key === '.')          { Calculatrice.dot();              e.preventDefault(); }
      else if (e.key === '+')          { Calculatrice.setOperator('+');   e.preventDefault(); }
      else if (e.key === '-')          { Calculatrice.setOperator('−');   e.preventDefault(); }
      else if (e.key === '*')          { Calculatrice.setOperator('×');   e.preventDefault(); }
      else if (e.key === '/')          { Calculatrice.setOperator('÷');   e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === '=') { Calculatrice.equals(); e.preventDefault(); }
      else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') { Calculatrice.clear(); e.preventDefault(); }
      else if (e.key === 'Backspace')  { Calculatrice._backspace();       e.preventDefault(); }
      else if (e.key === '%')          { Calculatrice.percent();          e.preventDefault(); }
    };
    document.addEventListener('keydown', this._keyHandler);
  },

  _detachKeyboard() {
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
  },

  // ── Opérations ────────────────────────────────────────────
  digit(d) {
    if (this._shouldReset) {
      this._currentValue = d === '0' ? '0' : d;
      this._shouldReset  = false;
    } else {
      if (this._currentValue === '0' || this._currentValue === '-0') {
        this._currentValue = this._currentValue.startsWith('-') ? '-' + d : d;
      } else if (this._currentValue.replace('-', '').length < 13) {
        this._currentValue += d;
      }
    }
    this._justEquals = false;
    this._updateDisplay();
  },

  dot() {
    if (this._shouldReset) {
      this._currentValue = '0.';
      this._shouldReset  = false;
      this._justEquals   = false;
    } else if (!this._currentValue.includes('.')) {
      this._currentValue += '.';
    }
    this._updateDisplay();
  },

  setOperator(op) {
    if (this._operator && !this._shouldReset) {
      const result = this._compute(this._previousValue, this._operator, this._currentValue);
      if (result === 'Erreur') { this._showError(); return; }
      this._currentValue  = this._numStr(result);
      this._expression    = this._fmtNum(result) + ' ' + op;
      this._previousValue = this._currentValue;
    } else {
      this._expression    = this._fmtNum(this._currentValue) + ' ' + op;
      this._previousValue = this._currentValue;
    }
    this._operator    = op;
    this._shouldReset = true;
    this._justEquals  = false;
    this._highlightOp(op);
    this._updateDisplay();
  },

  equals() {
    if (!this._operator || this._shouldReset) return;
    const result = this._compute(this._previousValue, this._operator, this._currentValue);
    const exprStr = this._fmtNum(this._previousValue) + ' ' + this._operator + ' ' + this._fmtNum(this._currentValue);

    if (result === 'Erreur') { this._showError(); return; }

    const entry = { expr: exprStr, result: this._fmtNum(result) };
    this._history.unshift(entry);
    if (this._history.length > 5) this._history.pop();

    this._expression    = exprStr + ' =';
    this._currentValue  = this._numStr(result);
    this._previousValue = null;
    this._operator      = null;
    this._shouldReset   = true;
    this._justEquals    = true;
    this._highlightOp(null);
    this._updateDisplay();
    this._updateHistory();
  },

  clear() {
    this._currentValue  = '0';
    this._operator      = null;
    this._previousValue = null;
    this._shouldReset   = false;
    this._expression    = '';
    this._justEquals    = false;
    this._highlightOp(null);
    this._updateDisplay();
  },

  toggleSign() {
    if (this._currentValue === '0') return;
    this._currentValue = this._currentValue.startsWith('-')
      ? this._currentValue.slice(1)
      : '-' + this._currentValue;
    this._updateDisplay();
  },

  percent() {
    const n = parseFloat(this._currentValue);
    if (isNaN(n)) return;
    this._currentValue = this._numStr(n / 100);
    this._justEquals   = false;
    this._updateDisplay();
  },

  _backspace() {
    if (this._shouldReset || this._justEquals) { this.clear(); return; }
    if (this._currentValue.length <= 1 || (this._currentValue.length === 2 && this._currentValue.startsWith('-'))) {
      this._currentValue = '0';
    } else {
      this._currentValue = this._currentValue.slice(0, -1);
    }
    this._updateDisplay();
  },

  resetHistory() {
    this._history = [];
    this._updateHistory();
  },

  copyResult() {
    const el  = document.getElementById('calc-result');
    const raw = el ? el.textContent.replace(/\s/g, '').replace(',', '.') : '0';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(raw).then(() => { if (window.App) App.toast('Résultat copié !'); });
    } else {
      const ta = document.createElement('textarea');
      ta.value = raw; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      if (window.App) App.toast('Résultat copié !');
    }
  },

  // ── Calcul ────────────────────────────────────────────────
  _compute(a, op, b) {
    a = parseFloat(a); b = parseFloat(b);
    if (isNaN(a) || isNaN(b)) return 'Erreur';
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 'Erreur';
    }
    return b;
  },

  // ── Formatage ─────────────────────────────────────────────
  _numStr(n) {
    if (n === 'Erreur') return 'Erreur';
    // Round to avoid floating-point noise
    const r = Math.round(n * 1e10) / 1e10;
    return String(r);
  },

  _fmtNum(v) {
    if (v === 'Erreur') return 'Erreur';
    const n = parseFloat(v);
    if (isNaN(n)) return String(v);
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 10 });
  },

  _fmtDisplay(v) {
    if (v === 'Erreur') return 'Erreur ÷0';
    // During active entry keep raw (shows '3.' when user typed decimal)
    if (!this._justEquals && !this._shouldReset) return v;
    return this._fmtNum(v);
  },

  // ── Rendu ─────────────────────────────────────────────────
  _updateDisplay() {
    const exprEl   = document.getElementById('calc-expr');
    const resultEl = document.getElementById('calc-result');
    if (!exprEl || !resultEl) return;

    exprEl.textContent   = this._expression;
    const txt = this._fmtDisplay(this._currentValue);
    resultEl.textContent = txt;

    const len = txt.replace(/\s/g, '').length;
    resultEl.style.fontSize = len > 12 ? '18px' : len > 9 ? '22px' : len > 6 ? '26px' : '32px';
  },

  _updateHistory() {
    const list = document.getElementById('calc-history-list');
    if (!list) return;
    if (!this._history.length) {
      list.innerHTML = '<div style="font-size:11px;color:var(--text-tertiary);padding:4px 0">Aucun calcul</div>';
      return;
    }
    list.innerHTML = this._history.map((h, i) => `
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,0.05);
                  font-size:11px;color:${i === 0 ? '#F0F2F8' : '#4E5770'}">
        <span style="font-family:'JetBrains Mono',monospace">${h.expr}</span>
        <strong style="color:#2DD4A0;font-family:'JetBrains Mono',monospace;margin-left:8px;flex-shrink:0">${h.result}</strong>
      </div>
    `).join('');
  },

  _highlightOp(activeOp) {
    ['÷', '×', '−', '+'].forEach(op => {
      const btn = document.getElementById('calc-op-' + op);
      if (btn) btn.classList.toggle('active', op === activeOp);
    });
  },

  _showError() {
    this._currentValue  = 'Erreur';
    this._operator      = null;
    this._previousValue = null;
    this._shouldReset   = true;
    this._expression    = '';
    this._highlightOp(null);
    this._updateDisplay();
  },
};

document.addEventListener('DOMContentLoaded', () => Calculatrice.init());
