/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Métrage Paysagisme
//  metrage_paysagisme.js
// ============================================================

(function() {
  'use strict';

  const MetragePaysagisme = {
    FOISONNEMENT: {
      meuble: 1.15,
      argileux: 1.25,
      pierreux: 1.35,
      beton: 1.50,
      remblai: 1.10,
    },

    _container: null,
    _containerId: null,
    _options: {},
    _tab: 'rectangle',
    _lastResult: { valeur: 0, unite: 'm2', type: 'rectangle' },

    rectangle(l, w) {
      return round2(Math.max(0, n(l, 0)) * Math.max(0, n(w, 0)));
    },

    lineaireSegmente(segments) {
      segments = Array.isArray(segments) ? segments : [];
      const longueurTotale = segments.reduce((sum, s) => sum + Math.max(0, n(s.longueur, 0)), 0);
      const surface = segments.reduce((sum, s) => {
        return sum + Math.max(0, n(s.longueur, 0)) * Math.max(0, n(s.largeur, 0));
      }, 0);
      return { longueurTotale: round2(longueurTotale), surface: round2(surface) };
    },

    volume(surface, profondeur, coefFoisonnement) {
      const volumeNet = Math.max(0, n(surface, 0)) * Math.max(0, n(profondeur, 0));
      const coef = Math.max(1, n(coefFoisonnement, 1));
      return { volumeNet: round2(volumeNet), volumeFoisonne: round2(volumeNet * coef) };
    },

    pente(surfaceProjetee, anglePercent) {
      const surface = Math.max(0, n(surfaceProjetee, 0));
      const angle = Math.atan(Math.max(0, n(anglePercent, 0)) / 100);
      const facteurCorrection = 1 / Math.cos(angle);
      return {
        surfaceReelle: round2(surface * facteurCorrection),
        facteurCorrection: round4(facteurCorrection),
      };
    },

    mur(longueur, hauteur, ouvertures) {
      ouvertures = Array.isArray(ouvertures) ? ouvertures : [];
      const surfaceBrute = Math.max(0, n(longueur, 0)) * Math.max(0, n(hauteur, 0));
      const surfaceOuvertures = ouvertures.reduce((sum, o) => {
        if (o.surface !== undefined) return sum + Math.max(0, n(o.surface, 0));
        return sum + Math.max(0, n(o.largeur, 0)) * Math.max(0, n(o.hauteur, 0)) * Math.max(1, n(o.quantite, 1));
      }, 0);
      return round2(Math.max(0, surfaceBrute - surfaceOuvertures));
    },

    bac(segments, largeur, hauteur) {
      segments = Array.isArray(segments) ? segments : [];
      const longueurTotale = this.lineaireSegmente(segments.map(s => ({ longueur: s.longueur, largeur: 0 }))).longueurTotale;
      const l = Math.max(0, n(largeur, 0));
      const h = Math.max(0, n(hauteur, 0));
      const surface = longueurTotale * l;
      const volume = surface * h;
      return {
        surface: round2(surface),
        volume: round2(volume),
        perimetre: round2(longueurTotale),
      };
    },

    cercle(rayon) {
      const r = Math.max(0, n(rayon, 0));
      return {
        surface: round2(Math.PI * r * r),
        perimetre: round2(2 * Math.PI * r),
      };
    },

    m2ToRouleaux(surface, largeurRouleau) {
      const largeur = Math.max(0.1, n(largeurRouleau, 0.4));
      return Math.ceil(Math.max(0, n(surface, 0)) / largeur);
    },

    m3ToTonnes(volume, densiteKgM3) {
      return round2(Math.max(0, n(volume, 0)) * Math.max(0, n(densiteKgM3, 1600)) / 1000);
    },

    m3ToSacs(volume, capaciteSacM3) {
      const capacite = Math.max(0.001, n(capaciteSacM3, 0.05));
      return Math.ceil(Math.max(0, n(volume, 0)) / capacite);
    },

    surfaceToGeotextile(surface, recouvrement) {
      return round2(Math.max(0, n(surface, 0)) * (1 + Math.max(0, n(recouvrement, 10)) / 100));
    },

    init(containerId, options) {
      this._containerId = containerId;
      this._container = document.getElementById(containerId);
      this._options = options || {};
      if (!this._container) {
        toast('Conteneur métrage introuvable', 'error');
        return;
      }
      this._container.innerHTML = this.getHTML();
      this._bind();
      this._compute();
    },

    getHTML(containerId) {
      const html = this._buildHTML();
      if (containerId) {
        this.init(containerId, this._options);
      }
      return html;
    },

    _buildHTML() {
      return `
        <div class="card metrage-paysagisme" style="display:flex;flex-direction:column;gap:16px">
          <div>
            <h2 style="margin:0 0 4px;color:var(--text)">Métrage paysagisme</h2>
            <p style="margin:0;color:var(--text-secondary,var(--text));font-size:13px">Calculs surfaces, volumes, pentes, murs, bacs et conversions terrain.</p>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${tabBtn('rectangle', 'Rectangle', this._tab)}
            ${tabBtn('segments', 'Segments', this._tab)}
            ${tabBtn('volume', 'Volume', this._tab)}
            ${tabBtn('pente', 'Pente', this._tab)}
            ${tabBtn('mur', 'Mur', this._tab)}
            ${tabBtn('bac', 'Bac', this._tab)}
          </div>

          <div data-mp-panel="rectangle">${panelRectangle()}</div>
          <div data-mp-panel="segments" style="display:none">${panelSegments()}</div>
          <div data-mp-panel="volume" style="display:none">${panelVolume(this.FOISONNEMENT)}</div>
          <div data-mp-panel="pente" style="display:none">${panelPente()}</div>
          <div data-mp-panel="mur" style="display:none">${panelMur()}</div>
          <div data-mp-panel="bac" style="display:none">${panelBac()}</div>

          <div data-mp-result style="border:1px solid var(--border);background:var(--bg-card);border-radius:var(--r-md,8px);padding:12px"></div>

          <div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn-primary" data-mp-action="use">Utiliser ce résultat</button>
          </div>
        </div>
      `;
    },

    _bind() {
      if (!this._container) return;
      this._container.addEventListener('click', event => {
        const target = event.target.closest('[data-mp-tab],[data-mp-action]');
        if (!target) return;
        if (target.hasAttribute('data-mp-tab')) {
          this._tab = target.getAttribute('data-mp-tab');
          this._renderTabs();
          this._compute();
        }
        if (target.getAttribute('data-mp-action') === 'add-segment') this._addSegment('segments');
        if (target.getAttribute('data-mp-action') === 'add-bac-segment') this._addSegment('bac');
        if (target.getAttribute('data-mp-action') === 'add-ouverture') this._addOuverture();
        if (target.getAttribute('data-mp-action') === 'remove-row') {
          const row = target.closest('[data-mp-row]');
          if (row) row.remove();
          this._compute();
        }
        if (target.getAttribute('data-mp-action') === 'use') this._useResult();
      });
      this._container.addEventListener('input', () => this._compute());
      this._container.addEventListener('change', () => this._compute());
    },

    _renderTabs() {
      this._container.querySelectorAll('[data-mp-tab]').forEach(btn => {
        btn.className = btn.getAttribute('data-mp-tab') === this._tab ? 'btn btn-primary' : 'btn btn-secondary';
      });
      this._container.querySelectorAll('[data-mp-panel]').forEach(panel => {
        panel.style.display = panel.getAttribute('data-mp-panel') === this._tab ? '' : 'none';
      });
    },

    _compute() {
      if (!this._container) return;
      let html = '';
      let result = { valeur: 0, unite: 'm2', type: this._tab };

      if (this._tab === 'rectangle') {
        const surface = this.rectangle(v(this._container, 'rect-l'), v(this._container, 'rect-w'));
        result = { valeur: surface, unite: 'm2', type: 'rectangle' };
        html = resultHTML('Surface rectangle', surface, 'm²', conversionsSurface(surface));
      }

      if (this._tab === 'segments') {
        const calc = this.lineaireSegmente(readSegments(this._container, 'segments'));
        result = { valeur: calc.surface, unite: 'm2', type: 'segments' };
        html = resultHTML('Linéaire segmenté', calc.surface, 'm²', [
          ['Longueur totale', `${fmt(calc.longueurTotale)} ml`],
        ].concat(conversionsSurface(calc.surface)));
      }

      if (this._tab === 'volume') {
        const coef = this.FOISONNEMENT[this._field('vol-sol')] || 1.15;
        const calc = this.volume(v(this._container, 'vol-surface'), v(this._container, 'vol-prof'), coef);
        result = { valeur: calc.volumeFoisonne, unite: 'm3', type: 'volume' };
        html = resultHTML('Volume terrassement', calc.volumeFoisonne, 'm³', [
          ['Volume net', `${fmt(calc.volumeNet)} m³`],
          ['Coef. foisonnement', coef],
          ['Tonnes estimées', `${fmt(this.m3ToTonnes(calc.volumeFoisonne, v(this._container, 'vol-densite')))} t`],
          ['Sacs 50 L', `${this.m3ToSacs(calc.volumeFoisonne, 0.05)} sacs`],
        ]);
      }

      if (this._tab === 'pente') {
        const calc = this.pente(v(this._container, 'pente-surface'), v(this._container, 'pente-pct'));
        result = { valeur: calc.surfaceReelle, unite: 'm2', type: 'pente' };
        html = resultHTML('Surface réelle en pente', calc.surfaceReelle, 'm²', [
          ['Facteur correction', calc.facteurCorrection],
        ].concat(conversionsSurface(calc.surfaceReelle)));
      }

      if (this._tab === 'mur') {
        const surface = this.mur(v(this._container, 'mur-l'), v(this._container, 'mur-h'), readOuvertures(this._container));
        result = { valeur: surface, unite: 'm2', type: 'mur' };
        html = resultHTML('Surface nette mur', surface, 'm²', conversionsSurface(surface));
      }

      if (this._tab === 'bac') {
        const calc = this.bac(readSegments(this._container, 'bac'), v(this._container, 'bac-largeur'), v(this._container, 'bac-hauteur'));
        result = { valeur: calc.volume, unite: 'm3', type: 'bac' };
        html = resultHTML('Bac / jardinière', calc.volume, 'm³', [
          ['Surface au sol', `${fmt(calc.surface)} m²`],
          ['Périmètre / longueur', `${fmt(calc.perimetre)} ml`],
          ['Terre en sacs 50 L', `${this.m3ToSacs(calc.volume, 0.05)} sacs`],
          ['Tonnes terre estimées', `${fmt(this.m3ToTonnes(calc.volume, 1200))} t`],
        ]);
      }

      this._lastResult = result;
      const out = this._container.querySelector('[data-mp-result]');
      if (out) out.innerHTML = html;
    },

    _field(name) {
      const el = this._container ? this._container.querySelector(`[data-mp-field="${name}"]`) : null;
      return el ? el.value : '';
    },

    _addSegment(kind) {
      const tbody = this._container.querySelector(`[data-mp-${kind}-rows]`);
      if (!tbody) return;
      const index = tbody.querySelectorAll('[data-mp-row]').length + 1;
      tbody.insertAdjacentHTML('beforeend', segmentRow(index, kind));
      this._compute();
    },

    _addOuverture() {
      const tbody = this._container.querySelector('[data-mp-ouverture-rows]');
      if (!tbody) return;
      const index = tbody.querySelectorAll('[data-mp-row]').length + 1;
      tbody.insertAdjacentHTML('beforeend', ouvertureRow(index));
      this._compute();
    },

    _useResult() {
      if (this._options && typeof this._options.onResult === 'function') {
        this._options.onResult(this._lastResult.valeur, this._lastResult.unite, this._lastResult.type);
      }
    },
  };

  function panelRectangle() {
    return grid([
      numberField('rect-l', 'Longueur (m)', 10),
      numberField('rect-w', 'Largeur (m)', 5),
    ]);
  }

  function panelSegments() {
    return `
      <div class="calc-section-title">Segments</div>
      ${segmentTable('segments')}
      <button type="button" class="btn btn-secondary" data-mp-action="add-segment" style="margin-top:8px">Ajouter un segment</button>
    `;
  }

  function panelVolume(foisonnement) {
    return grid([
      numberField('vol-surface', 'Surface (m²)', 20),
      numberField('vol-prof', 'Profondeur (m)', 0.3, '0.01'),
      selectField('vol-sol', 'Type de sol', Object.keys(foisonnement)),
      numberField('vol-densite', 'Densité (kg/m³)', 1600, '10'),
    ]);
  }

  function panelPente() {
    return grid([
      numberField('pente-surface', 'Surface projetée (m²)', 20),
      numberField('pente-pct', 'Pente (%)', 10, '0.5'),
    ]);
  }

  function panelMur() {
    return `
      ${grid([
        numberField('mur-l', 'Longueur mur (m)', 10),
        numberField('mur-h', 'Hauteur mur (m)', 2),
      ])}
      <div class="calc-section-title">Ouvertures à déduire</div>
      <div style="overflow:auto">${ouvertureTable()}</div>
      <button type="button" class="btn btn-secondary" data-mp-action="add-ouverture" style="margin-top:8px">Ajouter une ouverture</button>
    `;
  }

  function panelBac() {
    return `
      ${grid([
        numberField('bac-largeur', 'Largeur bac (m)', 0.5, '0.01'),
        numberField('bac-hauteur', 'Hauteur utile (m)', 0.6, '0.01'),
      ])}
      <div class="calc-section-title">Longueurs du bac</div>
      ${segmentTable('bac')}
      <button type="button" class="btn btn-secondary" data-mp-action="add-bac-segment" style="margin-top:8px">Ajouter un segment</button>
    `;
  }

  function segmentTable(kind) {
    return `
      <table style="width:100%;border-collapse:collapse;min-width:420px">
        <thead><tr><th>#</th><th>Longueur (m)</th><th>Largeur (m)</th><th></th></tr></thead>
        <tbody data-mp-${kind}-rows>
          ${segmentRow(1, kind)}
          ${kind === 'segments' ? segmentRow(2, kind) : ''}
        </tbody>
      </table>
    `;
  }

  function segmentRow(index, kind) {
    return `
      <tr data-mp-row>
        <td style="padding:6px;color:var(--text)">${index}</td>
        <td style="padding:6px"><input type="number" min="0" step="0.01" value="${index === 1 ? 5 : 3}" data-mp-${kind}-longueur style="${inputStyle()}"></td>
        <td style="padding:6px"><input type="number" min="0" step="0.01" value="${kind === 'bac' ? 0 : 1}" data-mp-${kind}-largeur style="${inputStyle()}"></td>
        <td style="padding:6px;text-align:right"><button type="button" class="btn btn-secondary btn-sm" data-mp-action="remove-row">Supprimer</button></td>
      </tr>
    `;
  }

  function ouvertureTable() {
    return `
      <table style="width:100%;border-collapse:collapse;min-width:460px">
        <thead><tr><th>#</th><th>Largeur</th><th>Hauteur</th><th>Quantité</th><th></th></tr></thead>
        <tbody data-mp-ouverture-rows>${ouvertureRow(1)}</tbody>
      </table>
    `;
  }

  function ouvertureRow(index) {
    return `
      <tr data-mp-row>
        <td style="padding:6px;color:var(--text)">${index}</td>
        <td style="padding:6px"><input type="number" min="0" step="0.01" value="0" data-mp-ouv-largeur style="${inputStyle()}"></td>
        <td style="padding:6px"><input type="number" min="0" step="0.01" value="0" data-mp-ouv-hauteur style="${inputStyle()}"></td>
        <td style="padding:6px"><input type="number" min="1" step="1" value="1" data-mp-ouv-qte style="${inputStyle()}"></td>
        <td style="padding:6px;text-align:right"><button type="button" class="btn btn-secondary btn-sm" data-mp-action="remove-row">Supprimer</button></td>
      </tr>
    `;
  }

  function readSegments(container, kind) {
    return Array.from(container.querySelectorAll(`[data-mp-${kind}-rows] [data-mp-row]`)).map(row => ({
      longueur: v(row, `${kind}-longueur`, true),
      largeur: v(row, `${kind}-largeur`, true),
    }));
  }

  function readOuvertures(container) {
    return Array.from(container.querySelectorAll('[data-mp-ouverture-rows] [data-mp-row]')).map(row => ({
      largeur: v(row, 'ouv-largeur', true),
      hauteur: v(row, 'ouv-hauteur', true),
      quantite: v(row, 'ouv-qte', true),
    }));
  }

  function conversionsSurface(surface) {
    return [
      ['Gazon rouleau 0,40 m²/u', `${MetragePaysagisme.m2ToRouleaux(surface, 0.4)} rouleaux`],
      ['Géotextile +10%', `${fmt(MetragePaysagisme.surfaceToGeotextile(surface, 10))} m²`],
    ];
  }

  function resultHTML(label, value, unite, extras) {
    extras = extras || [];
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-size:12px;color:var(--text-secondary,var(--text))">${escapeHtml(label)}</div>
          <div style="font-size:28px;font-weight:900;color:var(--accent)">${fmt(value)} ${escapeHtml(unite)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-top:10px">
        ${extras.map(item => `<div style="border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:8px;background:var(--bg-card)"><div style="font-size:11px;color:var(--text-secondary,var(--text))">${escapeHtml(item[0])}</div><strong style="color:var(--text)">${escapeHtml(item[1])}</strong></div>`).join('')}
      </div>
    `;
  }

  function grid(fields) {
    return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px">${fields.join('')}</div>`;
  }

  function numberField(name, label, value, step) {
    return `<label class="calc-input-group"><span>${escapeHtml(label)}</span><input type="number" min="0" step="${escapeAttr(step || '0.01')}" value="${escapeAttr(value)}" data-mp-field="${escapeAttr(name)}" style="${inputStyle()}"></label>`;
  }

  function selectField(name, label, values) {
    return `<label class="calc-input-group"><span>${escapeHtml(label)}</span><select data-mp-field="${escapeAttr(name)}" style="${inputStyle()}">${values.map(v => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('')}</select></label>`;
  }

  function tabBtn(type, label, active) {
    return `<button type="button" class="btn ${active === type ? 'btn-primary' : 'btn-secondary'}" data-mp-tab="${escapeAttr(type)}">${escapeHtml(label)}</button>`;
  }

  function v(container, name, attrMode) {
    const selector = attrMode ? `[data-mp-${name}]` : `[data-mp-field="${name}"]`;
    const el = container.querySelector(selector);
    return el ? n(el.value, 0) : 0;
  }

  function inputStyle() {
    return 'background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:9px 12px;color:var(--text);width:100%';
  }

  function toast(message, type) {
    if (window.App && typeof window.App.toast === 'function') window.App.toast(message, type || 'success');
  }

  function fmt(value) {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n(value, 0));
  }

  function n(value, def) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : (def || 0);
  }

  function round2(value) {
    return Math.round((value || 0) * 100) / 100;
  }

  function round4(value) {
    return Math.round((value || 0) * 10000) / 10000;
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

  window.MetragePaysagisme = MetragePaysagisme;
})();
