/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Matériel Paysagisme
//  materiel_paysagisme.js
// ============================================================

(function() {
  'use strict';

  const STORAGE_KEY = 'plaqpro_materiel_paysagisme';
  const JOURS_AN = 220;
  const HEURES_JOUR = 7;

  const PARC_DEFAUT = [
    { id: 'mini_pelle', nom: 'Mini-pelle', valeur: 45000, dureeAmort: 10, entretienAnnuel: 2000, carburant: '8 L/h' },
    { id: 'camion_benne', nom: 'Camion benne', valeur: 35000, dureeAmort: 8, entretienAnnuel: 1500, carburant: '12 L/100km' },
    { id: 'remorque', nom: 'Remorque', valeur: 3500, dureeAmort: 15, entretienAnnuel: 200, carburant: '' },
    { id: 'betoniere_350l', nom: 'Bétonière 350L', valeur: 800, dureeAmort: 8, entretienAnnuel: 100, carburant: '' },
    { id: 'nettoyeur_hp', nom: 'Nettoyeur HP', valeur: 1200, dureeAmort: 6, entretienAnnuel: 150, carburant: '' },
    { id: 'plaque_vibrante', nom: 'Plaque vibrante', valeur: 1500, dureeAmort: 10, entretienAnnuel: 100, carburant: '' },
    { id: 'outillage_divers', nom: 'Outillage divers', valeur: 5000, dureeAmort: 5, entretienAnnuel: 500, carburant: '' },
  ];

  const MaterielPaysagisme = {
    PARC_DEFAUT,
    _parc: [],
    _container: null,
    _containerId: null,

    init() {
      this._parc = mergeParc(PARC_DEFAUT, load());
      return this;
    },

    getAll() {
      this._ensureLoaded();
      return this._parc.map(clone);
    },

    get(id) {
      this._ensureLoaded();
      const item = this._parc.find(m => m.id === id);
      return item ? clone(item) : null;
    },

    update(id, data) {
      this._ensureLoaded();
      const index = this._parc.findIndex(m => m.id === id);
      if (index < 0) return null;
      this._parc[index] = normalize(Object.assign({}, this._parc[index], data || {}, { id }));
      save(this._parc);
      this._render();
      toast('Matériel mis à jour', 'success');
      return clone(this._parc[index]);
    },

    calcCoutJournalier(materiel) {
      materiel = normalize(materiel || {});
      const amortissement = n(materiel.valeur, 0) / Math.max(1, n(materiel.dureeAmort, 1) * JOURS_AN);
      const entretienJournalier = n(materiel.entretienAnnuel, 0) / JOURS_AN;
      const coutJournalier = amortissement + entretienJournalier;
      const coutHoraire = coutJournalier / HEURES_JOUR;
      return {
        coutJournalier: round2(coutJournalier),
        coutHoraire: round2(coutHoraire),
        detail: [
          `Amortissement : ${money(amortissement)}/jour`,
          `Entretien : ${money(entretienJournalier)}/jour`,
          `Base : ${JOURS_AN} jours/an, ${HEURES_JOUR} h/jour`,
        ],
      };
    },

    calcCoutChantier(materiels, joursParMateriel) {
      this._ensureLoaded();
      const lignes = Array.isArray(materiels) ? materiels : [];
      const detailParMateriel = lignes.map(ligne => {
        const item = this.get(ligne.id);
        if (!item) return null;
        const cout = this.calcCoutJournalier(item);
        const jours = n(ligne.jours, joursParMateriel && joursParMateriel[ligne.id] ? joursParMateriel[ligne.id] : 0);
        const heures = n(ligne.heures, 0);
        const totalJours = jours * cout.coutJournalier;
        const totalHeures = heures * cout.coutHoraire;
        const total = totalJours + totalHeures;
        return {
          id: item.id,
          nom: item.nom,
          jours,
          heures,
          coutJournalier: cout.coutJournalier,
          coutHoraire: cout.coutHoraire,
          cout: round2(total),
        };
      }).filter(Boolean);
      return {
        coutTotal: round2(detailParMateriel.reduce((sum, item) => sum + item.cout, 0)),
        detailParMateriel,
      };
    },

    getHTML(containerId) {
      this._ensureLoaded();
      const html = this._buildHTML();
      if (containerId) {
        this._containerId = containerId;
        this._container = document.getElementById(containerId);
        if (this._container) {
          this._container.innerHTML = html;
          this._bind();
          this._renderChantierTotal();
        }
      }
      return html;
    },

    _ensureLoaded() {
      if (!this._parc.length) this.init();
    },

    _buildHTML() {
      return `
        <div class="card materiel-paysagisme" style="display:flex;flex-direction:column;gap:16px">
          <div>
            <h2 style="margin:0 0 4px;color:var(--text)">Parc matériel paysagisme</h2>
            <p style="margin:0;color:var(--text-secondary,var(--text));font-size:13px">Amortissement, entretien et coût journalier du matériel possédé.</p>
          </div>

          <div class="calc-section-title">Parc matériel</div>
          <div style="overflow:auto;border:1px solid var(--border);border-radius:var(--r-md,8px);background:var(--bg-card)">
            <table style="width:100%;border-collapse:collapse;min-width:840px">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border)">Nom</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Valeur</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Amort./jour</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Entretien/jour</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Coût/jour</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Coût/heure</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Action</th>
                </tr>
              </thead>
              <tbody>
                ${this._parc.map(item => this._rowHTML(item)).join('')}
              </tbody>
            </table>
          </div>

          <div class="calc-section-title">Calcul chantier</div>
          <div style="overflow:auto;border:1px solid var(--border);border-radius:var(--r-md,8px);background:var(--bg-card)">
            <table style="width:100%;border-collapse:collapse;min-width:680px">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border)">Utiliser</th>
                  <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border)">Matériel</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Jours</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Heures</th>
                </tr>
              </thead>
              <tbody>
                ${this._parc.map(item => chantierRow(item)).join('')}
              </tbody>
            </table>
          </div>
          <div data-matp-total style="border:1px solid var(--border);background:var(--bg-card);border-radius:var(--r-md,8px);padding:12px"></div>
        </div>
      `;
    },

    _rowHTML(item) {
      const cout = this.calcCoutJournalier(item);
      const amort = n(item.valeur, 0) / Math.max(1, n(item.dureeAmort, 1) * JOURS_AN);
      const entretien = n(item.entretienAnnuel, 0) / JOURS_AN;
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid var(--border);color:var(--text)">${escapeHtml(item.nom)}</td>
          <td style="padding:8px;border-bottom:1px solid var(--border);text-align:right;color:var(--text)">${money(item.valeur)}</td>
          <td style="padding:8px;border-bottom:1px solid var(--border);text-align:right;color:var(--text)">${money(amort)}</td>
          <td style="padding:8px;border-bottom:1px solid var(--border);text-align:right;color:var(--text)">${money(entretien)}</td>
          <td style="padding:8px;border-bottom:1px solid var(--border);text-align:right;color:var(--accent);font-weight:800">${money(cout.coutJournalier)}</td>
          <td style="padding:8px;border-bottom:1px solid var(--border);text-align:right;color:var(--text)">${money(cout.coutHoraire)}</td>
          <td style="padding:8px;border-bottom:1px solid var(--border);text-align:right"><button type="button" class="btn btn-secondary btn-sm" data-matp-action="edit" data-id="${escapeAttr(item.id)}">Modifier</button></td>
        </tr>
      `;
    },

    _bind() {
      if (!this._container) return;
      this._container.addEventListener('input', () => this._renderChantierTotal());
      this._container.addEventListener('change', () => this._renderChantierTotal());
      this._container.addEventListener('click', event => {
        const target = event.target.closest('[data-matp-action]');
        if (!target) return;
        if (target.getAttribute('data-matp-action') === 'edit') this._modalEdit(target.getAttribute('data-id'));
      });
    },

    _modalEdit(id) {
      const item = this.get(id);
      if (!item) return;
      const title = document.getElementById('modal-title');
      const body = document.getElementById('modal-body');
      const footer = document.getElementById('modal-footer');
      const overlay = document.getElementById('modal-overlay');
      if (!title || !body || !footer || !overlay) {
        toast('Modal PlaqPro indisponible', 'error');
        return;
      }
      title.textContent = `Modifier ${item.nom}`;
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${field('matp-edit-nom', 'Nom', item.nom, 'text')}
          ${field('matp-edit-valeur', 'Valeur (€)', item.valeur)}
          ${field('matp-edit-duree', 'Durée amortissement (ans)', item.dureeAmort)}
          ${field('matp-edit-entretien', 'Entretien annuel (€)', item.entretienAnnuel)}
          ${field('matp-edit-carburant', 'Carburant / note', item.carburant || '', 'text')}
        </div>
      `;
      footer.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
        <button type="button" class="btn btn-primary" onclick="MaterielPaysagisme._saveEdit('${escapeAttr(item.id)}')">Enregistrer</button>
      `;
      overlay.style.display = 'flex';
    },

    _saveEdit(id) {
      this.update(id, {
        nom: value('matp-edit-nom'),
        valeur: n(value('matp-edit-valeur'), 0),
        dureeAmort: n(value('matp-edit-duree'), 1),
        entretienAnnuel: n(value('matp-edit-entretien'), 0),
        carburant: value('matp-edit-carburant'),
      });
      if (window.App && typeof window.App.closeModal === 'function') window.App.closeModal();
    },

    _render() {
      if (!this._container) return;
      this._container.innerHTML = this._buildHTML();
      this._bind();
      this._renderChantierTotal();
    },

    _collectChantier() {
      if (!this._container) return [];
      return Array.from(this._container.querySelectorAll('[data-matp-use]')).filter(input => input.checked).map(input => {
        const id = input.getAttribute('data-matp-use');
        return {
          id,
          jours: n(this._container.querySelector(`[data-matp-jours="${cssEscape(id)}"]`)?.value, 0),
          heures: n(this._container.querySelector(`[data-matp-heures="${cssEscape(id)}"]`)?.value, 0),
        };
      });
    },

    _renderChantierTotal() {
      const total = this.calcCoutChantier(this._collectChantier());
      const node = this._container ? this._container.querySelector('[data-matp-total]') : null;
      if (!node) return;
      node.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
          <div>
            <div style="font-size:12px;color:var(--text-secondary,var(--text))">Résumé coût matériel chantier</div>
            <div style="font-size:26px;font-weight:900;color:var(--accent)">${money(total.coutTotal)}</div>
          </div>
          <div style="font-size:12px;color:var(--text-secondary,var(--text))">${total.detailParMateriel.length} matériel(s) sélectionné(s)</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;margin-top:8px">
          ${total.detailParMateriel.map(item => `<div style="display:flex;justify-content:space-between;color:var(--text);font-size:13px"><span>${escapeHtml(item.nom)} (${item.jours} j / ${item.heures} h)</span><strong>${money(item.cout)}</strong></div>`).join('')}
        </div>
      `;
    },
  };

  function mergeParc(defaults, stored) {
    const map = {};
    defaults.forEach(item => { map[item.id] = normalize(item); });
    stored.forEach(item => { if (item && item.id) map[item.id] = normalize(Object.assign({}, map[item.id] || {}, item)); });
    return Object.keys(map).map(id => map[id]);
  }

  function load() {
    try {
      const raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items || []));
  }

  function normalize(item) {
    return {
      id: String(item.id || slug(item.nom || 'materiel')),
      nom: String(item.nom || 'Matériel'),
      valeur: n(item.valeur, 0),
      dureeAmort: Math.max(1, n(item.dureeAmort, 1)),
      entretienAnnuel: n(item.entretienAnnuel, 0),
      carburant: String(item.carburant || ''),
    };
  }

  function chantierRow(item) {
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid var(--border)"><input type="checkbox" data-matp-use="${escapeAttr(item.id)}"></td>
        <td style="padding:8px;border-bottom:1px solid var(--border);color:var(--text)">${escapeHtml(item.nom)}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);text-align:right"><input type="number" min="0" step="0.5" value="0" data-matp-jours="${escapeAttr(item.id)}" style="${inputStyle()}"></td>
        <td style="padding:8px;border-bottom:1px solid var(--border);text-align:right"><input type="number" min="0" step="0.5" value="0" data-matp-heures="${escapeAttr(item.id)}" style="${inputStyle()}"></td>
      </tr>
    `;
  }

  function field(id, label, val, type) {
    return `<label class="calc-input-group"><span>${escapeHtml(label)}</span><input id="${escapeAttr(id)}" type="${escapeAttr(type || 'number')}" value="${escapeAttr(val)}" style="${inputStyle()}"></label>`;
  }

  function value(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function money(value) {
    if (window.Calculs && typeof window.Calculs.fmt === 'function') return window.Calculs.fmt(value || 0);
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value || 0);
  }

  function inputStyle() {
    return 'background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text);width:100%';
  }

  function toast(message, type) {
    if (window.App && typeof window.App.toast === 'function') window.App.toast(message, type || 'success');
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

  function slug(value) {
    return String(value || 'materiel').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
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

  MaterielPaysagisme.init();
  window.MaterielPaysagisme = MaterielPaysagisme;
})();
