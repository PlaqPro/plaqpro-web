/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Diagnostic chantier exterieur
//  diagnostic_chantier.js
// ============================================================

(function() {
  'use strict';

  const STORAGE_KEY = 'plaqpro_diagnostic_chantier_courant';

  const DEFAULT_DIAGNOSTIC = {
    accesVehicule: 'facile',
    distanceCamion: 10,
    stationnementPossible: true,
    largeurPassage: 1.2,
    typeSol: 'meuble',
    reseauxVisibles: false,
    pente: 0,
    mitoyennete: false,
    voisinageSensible: false,
    presencePiscine: false,
    vegetationAProteger: false,
    accesEau: true,
    accesElectricite: true,
  };

  const DiagnosticChantier = {
    _container: null,
    _containerId: null,
    _diagnostic: clone(DEFAULT_DIAGNOSTIC),

    init() {
      this._diagnostic = Object.assign({}, DEFAULT_DIAGNOSTIC, loadDiagnostic());
      return this;
    },

    getHTML(containerId) {
      this.init();
      const html = this._buildHTML();
      if (containerId) {
        this._containerId = containerId;
        this._container = document.getElementById(containerId);
        if (this._container) {
          this._container.innerHTML = html;
          this._bind();
          this._syncForm();
          this._renderEvaluation();
        }
      }
      return html;
    },

    calcCoefficient(diagnostic) {
      diagnostic = Object.assign({}, DEFAULT_DIAGNOSTIC, diagnostic || {});
      let coefficient = 1.0;

      if (diagnostic.accesVehicule === 'moyen') coefficient += 0.15;
      if (diagnostic.accesVehicule === 'difficile') coefficient += 0.3;
      if (n(diagnostic.distanceCamion, 0) > 25) coefficient += 0.1;
      if (n(diagnostic.largeurPassage, 0) > 0 && n(diagnostic.largeurPassage, 0) < 0.9) coefficient += 0.15;
      if (!diagnostic.stationnementPossible) coefficient += 0.15;

      if (diagnostic.typeSol === 'pierreux' || diagnostic.typeSol === 'racines') coefficient += 0.3;
      if (diagnostic.typeSol === 'argileux' || diagnostic.typeSol === 'humide') coefficient += 0.2;
      if (diagnostic.typeSol === 'remblai') coefficient += 0.15;

      const pente = n(diagnostic.pente, 0);
      if (pente > 15) coefficient += 0.4;
      else if (pente > 10) coefficient += 0.2;

      if (diagnostic.mitoyennete) coefficient += 0.1;
      if (diagnostic.voisinageSensible) coefficient += 0.1;
      if (diagnostic.presencePiscine) coefficient += 0.1;
      if (diagnostic.vegetationAProteger) coefficient += 0.1;
      if (!diagnostic.accesEau) coefficient += 0.05;
      if (!diagnostic.accesElectricite) coefficient += 0.05;

      coefficient = Math.min(2.5, coefficient);
      const alertes = buildAlertes(diagnostic);
      const tempsInstallation = Math.round((1.5 * coefficient + alertes.length * 0.25) * 100) / 100;

      return {
        coefficient: round2(coefficient),
        alertes,
        tempsInstallation,
      };
    },

    getDiagnostic() {
      return clone(this._diagnostic);
    },

    reset() {
      this._diagnostic = clone(DEFAULT_DIAGNOSTIC);
      clearDiagnostic();
      this._syncForm();
      this._renderEvaluation();
      if (window.App && typeof window.App.toast === 'function') {
        window.App.toast('Diagnostic chantier reinitialise', 'success');
      }
    },

    getAlertes() {
      return buildAlertes(this._diagnostic);
    },

    _buildHTML() {
      return `
        <div class="card diagnostic-chantier" style="display:flex;flex-direction:column;gap:16px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word;overflow:visible">
          <div>
            <h2 style="margin:0 0 4px;color:var(--text)">Diagnostic chantier exterieur</h2>
            <p style="margin:0;color:var(--text-secondary,var(--text));font-size:13px">Evaluation initiale acces, sol, reseaux et contraintes avant chiffrage paysagisme.</p>
          </div>

          <div>
            <div class="calc-section-title">Acces chantier</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
              <div class="calc-input-group">
                <label>Acces vehicule</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  ${radio('accesVehicule', 'facile', 'Facile')}
                  ${radio('accesVehicule', 'moyen', 'Moyen')}
                  ${radio('accesVehicule', 'difficile', 'Difficile')}
                </div>
              </div>
              ${numberField('distanceCamion', 'Distance camion -> zone travaux (m)', 10, '0.5')}
              ${numberField('largeurPassage', 'Largeur passage (m)', 1.2, '0.1')}
              ${checkField('stationnementPossible', 'Stationnement possible')}
            </div>
          </div>

          <div>
            <div class="calc-section-title">Nature du sol</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
              <div class="calc-input-group">
                <label>Type de sol</label>
                <select data-diag-field="typeSol" style="${inputStyle()}">
                  <option value="meuble">Meuble</option>
                  <option value="argileux">Argileux</option>
                  <option value="pierreux">Pierreux</option>
                  <option value="racines">Racines</option>
                  <option value="remblai">Remblai</option>
                  <option value="humide">Humide</option>
                </select>
              </div>
              ${checkField('reseauxVisibles', 'Presence de reseaux visibles')}
              ${numberField('pente', 'Pente estimee (%)', 0, '0.5')}
            </div>
          </div>

          <div>
            <div class="calc-section-title">Contraintes</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
              ${checkField('mitoyennete', 'Mitoyennete')}
              ${checkField('voisinageSensible', 'Voisinage sensible')}
              ${checkField('presencePiscine', 'Presence piscine/bassin')}
              ${checkField('vegetationAProteger', 'Vegetation a proteger')}
              ${checkField('accesEau', 'Acces eau sur chantier')}
              ${checkField('accesElectricite', 'Acces electricite sur chantier')}
            </div>
          </div>

          <div>
            <div class="calc-section-title">Evaluation automatique</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:12px">
                <div style="font-size:12px;color:var(--text-secondary,var(--text))">Coefficient difficulte</div>
                <div data-diag-coef style="font-size:24px;font-weight:800;color:var(--accent)">1.00</div>
              </div>
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:12px">
                <div style="font-size:12px;color:var(--text-secondary,var(--text))">Temps installation</div>
                <div data-diag-temps style="font-size:24px;font-weight:800;color:var(--accent)">1.50 h</div>
              </div>
            </div>
            <div data-diag-alertes style="display:flex;flex-direction:column;gap:8px;margin-top:12px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word"></div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn-secondary" data-diag-action="reset">Reinitialiser</button>
          </div>
        </div>
      `;
    },

    _bind() {
      if (!this._container) return;
      this._container.addEventListener('input', event => {
        this._readField(event.target);
        this._renderEvaluation();
      });
      this._container.addEventListener('change', event => {
        this._readField(event.target);
        this._renderEvaluation();
      });
      this._container.addEventListener('click', event => {
        const target = event.target.closest('[data-diag-action]');
        if (!target) return;
        if (target.getAttribute('data-diag-action') === 'reset') this.reset();
      });
    },

    _readField(input) {
      if (!input || !input.hasAttribute('data-diag-field')) return;
      const key = input.getAttribute('data-diag-field');
      if (input.type === 'checkbox') this._diagnostic[key] = input.checked;
      else if (input.type === 'radio') {
        if (input.checked) this._diagnostic[key] = input.value;
      } else if (input.type === 'number') this._diagnostic[key] = n(input.value, 0);
      else this._diagnostic[key] = input.value;
      saveDiagnostic(this._diagnostic);
    },

    _syncForm() {
      if (!this._container) return;
      this._container.querySelectorAll('[data-diag-field]').forEach(input => {
        const key = input.getAttribute('data-diag-field');
        const value = this._diagnostic[key];
        if (input.type === 'checkbox') input.checked = !!value;
        else if (input.type === 'radio') input.checked = input.value === value;
        else input.value = value;
      });
    },

    _renderEvaluation() {
      if (!this._container) return;
      const evaluation = this.calcCoefficient(this._diagnostic);
      const coefEl = this._container.querySelector('[data-diag-coef]');
      const tempsEl = this._container.querySelector('[data-diag-temps]');
      const alertesEl = this._container.querySelector('[data-diag-alertes]');

      if (coefEl) {
        coefEl.textContent = evaluation.coefficient.toFixed(2);
        coefEl.style.color = evaluation.coefficient >= 1.6 ? '#F59E0B' : 'var(--accent)';
        if (evaluation.coefficient >= 2) coefEl.style.color = '#EF4444';
      }
      if (tempsEl) tempsEl.textContent = `${evaluation.tempsInstallation.toFixed(2)} h`;
      if (alertesEl) {
        alertesEl.innerHTML = evaluation.alertes.length
          ? evaluation.alertes.map(alerte => `
              <div style="border:1px solid ${alerte.indexOf('DICT') !== -1 || alerte.indexOf('Pente') !== -1 ? '#EF4444' : '#F59E0B'};background:${alerte.indexOf('DICT') !== -1 || alerte.indexOf('Pente') !== -1 ? 'rgba(239,68,68,0.10)' : 'rgba(245,158,11,0.12)'};color:var(--text);border-radius:var(--r-md,8px);padding:10px 12px;font-size:13px;font-weight:600">${escapeHtml(alerte)}</div>
            `).join('')
          : '<div style="border:1px solid var(--border);background:var(--bg-card);color:var(--text-secondary,var(--text));border-radius:var(--r-md,8px);padding:10px 12px;font-size:13px">Aucune alerte critique active.</div>';
      }
    },
  };

  function buildAlertes(diagnostic) {
    diagnostic = Object.assign({}, DEFAULT_DIAGNOSTIC, diagnostic || {});
    const alertes = [];
    const pente = n(diagnostic.pente, 0);

    if (!diagnostic.reseauxVisibles) {
      alertes.push('⚠️ Réseaux non localisés — DICT obligatoire avant travaux');
    }
    if (pente > 15) {
      alertes.push('⚠️ Pente > 15% — risque évacuation eaux, devis majoré');
    }
    if (diagnostic.mitoyennete) {
      alertes.push('⚠️ Mitoyenneté — protection voisin obligatoire');
    }
    if (diagnostic.typeSol === 'pierreux' || diagnostic.typeSol === 'racines') {
      alertes.push('⚠️ Sol pierreux/racines — durée terrassement x2');
    }

    return alertes;
  }

  function radio(name, value, label) {
    return `
      <label style="display:flex;align-items:center;gap:6px;color:var(--text);font-size:13px">
        <input type="radio" name="diag-${escapeAttr(name)}" value="${escapeAttr(value)}" data-diag-field="${escapeAttr(name)}">
        ${escapeHtml(label)}
      </label>
    `;
  }

  function checkField(name, label) {
    return `
      <label style="display:flex;align-items:center;gap:8px;color:var(--text);font-size:13px;padding:9px 0">
        <input type="checkbox" data-diag-field="${escapeAttr(name)}">
        ${escapeHtml(label)}
      </label>
    `;
  }

  function numberField(name, label, value, step) {
    return `
      <div class="calc-input-group">
        <label>${escapeHtml(label)}</label>
        <input type="number" min="0" step="${escapeAttr(step || '1')}" value="${escapeAttr(value)}" data-diag-field="${escapeAttr(name)}" style="${inputStyle()}">
      </div>
    `;
  }

  function inputStyle() {
    return 'background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:9px 12px;color:var(--text)';
  }

  function n(value, def) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : (def || 0);
  }

  function round2(value) {
    return Math.round((value || 0) * 100) / 100;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadDiagnostic() {
    try {
      const raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveDiagnostic(diagnostic) {
    try {
      if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(diagnostic || {}));
    } catch (e) {}
  }

  function clearDiagnostic() {
    try {
      if (window.localStorage) window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  DiagnosticChantier.init();
  window.DiagnosticChantier = DiagnosticChantier;
})();
