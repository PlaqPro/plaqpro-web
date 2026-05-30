/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Équipe Paysagisme
//  equipe_paysagisme.js
// ============================================================

(function() {
  'use strict';

  const STORAGE_KEY = 'plaqpro_equipe_paysagisme';

  const PROFILS_DEFAUT = {
    chef_equipe: { nom: 'Chef d’équipe', tauxHoraire: 42 },
    ouvrier_qualifie: { nom: 'Ouvrier qualifié', tauxHoraire: 35 },
    manoeuvre: { nom: 'Manœuvre', tauxHoraire: 28 },
    apprenti: { nom: 'Apprenti', tauxHoraire: 18 },
  };

  const SALARIES_EXEMPLE = [
    { id: 1, nom: 'Martin', prenom: 'Lucas', profil: 'chef_equipe', tauxHoraire: 42, competences: ['terrassement', 'maçonnerie', 'lecture plans'], affectations: [] },
    { id: 2, nom: 'Bernard', prenom: 'Karim', profil: 'ouvrier_qualifie', tauxHoraire: 35, competences: ['béton', 'VRD', 'parement'], affectations: [] },
    { id: 3, nom: 'Morel', prenom: 'Hugo', profil: 'manoeuvre', tauxHoraire: 28, competences: ['manutention', 'nettoyage', 'plantation'], affectations: [] },
    { id: 4, nom: 'Petit', prenom: 'Noah', profil: 'apprenti', tauxHoraire: 18, competences: ['préparation', 'arrosage', 'aide pose'], affectations: [] },
  ];

  const EquipePaysagisme = {
    PROFILS_DEFAUT,
    _salaries: [],
    _container: null,
    _containerId: null,

    init() {
      const stored = load();
      this._salaries = stored.length ? stored.map(normalizeSalarie) : SALARIES_EXEMPLE.map(normalizeSalarie);
      if (!stored.length) save(this._salaries);
      return this;
    },

    getSalaries() {
      this._ensureLoaded();
      return this._salaries.map(clone);
    },

    addSalarie(data) {
      this._ensureLoaded();
      const salarie = normalizeSalarie(Object.assign({}, data || {}, { id: nextId(this._salaries) }));
      this._salaries.push(salarie);
      save(this._salaries);
      this._render();
      toast('Salarié ajouté', 'success');
      return clone(salarie);
    },

    updateSalarie(id, data) {
      this._ensureLoaded();
      const index = this._salaries.findIndex(s => String(s.id) === String(id));
      if (index < 0) return null;
      this._salaries[index] = normalizeSalarie(Object.assign({}, this._salaries[index], data || {}, { id: this._salaries[index].id }));
      save(this._salaries);
      this._render();
      toast('Salarié mis à jour', 'success');
      return clone(this._salaries[index]);
    },

    deleteSalarie(id) {
      this._ensureLoaded();
      const next = this._salaries.filter(s => String(s.id) !== String(id));
      if (next.length === this._salaries.length) return false;
      this._salaries = next;
      save(this._salaries);
      this._render();
      toast('Salarié supprimé', 'success');
      return true;
    },

    calcCoutJournee(salarie, heures) {
      const taux = n(salarie && salarie.tauxHoraire, profilTaux(salarie && salarie.profil));
      const h = n(heures, 7);
      return round2(taux * h);
    },

    calcCoutEquipe(affectations) {
      this._ensureLoaded();
      const details = (Array.isArray(affectations) ? affectations : []).map(aff => {
        const salarie = this._salaries.find(s => String(s.id) === String(aff.salarieId));
        if (!salarie) return null;
        const heures = n(aff.heures, 0);
        return {
          salarieId: salarie.id,
          nom: `${salarie.prenom} ${salarie.nom}`.trim(),
          profil: salarie.profil,
          heures,
          tauxHoraire: salarie.tauxHoraire,
          cout: this.calcCoutJournee(salarie, heures),
        };
      }).filter(Boolean);
      return {
        totalMO: round2(details.reduce((sum, item) => sum + item.cout, 0)),
        detail: details,
      };
    },

    getDisponibilites(semaine) {
      this._ensureLoaded();
      return this._salaries.map(salarie => ({
        salarieId: salarie.id,
        nom: `${salarie.prenom} ${salarie.nom}`.trim(),
        profil: salarie.profil,
        affectations: (salarie.affectations || []).filter(a => !semaine || a.semaine === semaine),
      }));
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
          this._renderTotal();
        }
      }
      return html;
    },

    _ensureLoaded() {
      if (!this._salaries.length) this.init();
    },

    _buildHTML() {
      return `
        <div class="card equipe-paysagisme" style="display:flex;flex-direction:column;gap:16px">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
            <div>
              <h2 style="margin:0 0 4px;color:var(--text)">Équipe paysagisme</h2>
              <p style="margin:0;color:var(--text-secondary,var(--text));font-size:13px">Salariés, taux horaires chargés, compétences et coût main-d’œuvre chantier.</p>
            </div>
            <button type="button" class="btn btn-primary" data-eqp-action="add">Ajouter</button>
          </div>

          <div class="calc-section-title">Salariés</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
            ${this._salaries.map(s => this._cardSalarie(s)).join('')}
          </div>

          <div class="calc-section-title">Calcul MO chantier</div>
          <div style="overflow:auto;border:1px solid var(--border);border-radius:var(--r-md,8px);background:var(--bg-card)">
            <table style="width:100%;border-collapse:collapse;min-width:640px">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border)">Affecter</th>
                  <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border)">Salarié</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Taux</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Heures</th>
                </tr>
              </thead>
              <tbody>${this._salaries.map(s => chantierRow(s)).join('')}</tbody>
            </table>
          </div>
          <div data-eqp-total style="border:1px solid var(--border);background:var(--bg-card);border-radius:var(--r-md,8px);padding:12px"></div>
        </div>
      `;
    },

    _cardSalarie(salarie) {
      return `
        <div class="card" style="border:1px solid var(--border);background:var(--bg-card);display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;gap:8px">
            <div>
              <div style="font-weight:800;color:var(--text)">${escapeHtml(salarie.prenom)} ${escapeHtml(salarie.nom)}</div>
              <div style="font-size:12px;color:var(--text-secondary,var(--text))">${escapeHtml(profilNom(salarie.profil))}</div>
            </div>
            <strong style="color:var(--accent)">${money(salarie.tauxHoraire)}/h</strong>
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            ${salarie.competences.map(c => `<span style="border:1px solid var(--border);border-radius:999px;padding:3px 7px;font-size:11px;color:var(--text);background:rgba(255,255,255,0.04)">${escapeHtml(c)}</span>`).join('')}
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button type="button" class="btn btn-secondary btn-sm" data-eqp-action="edit" data-id="${escapeAttr(salarie.id)}">Modifier</button>
            <button type="button" class="btn btn-secondary btn-sm" data-eqp-action="delete" data-id="${escapeAttr(salarie.id)}">Supprimer</button>
          </div>
        </div>
      `;
    },

    _bind() {
      if (!this._container) return;
      this._container.addEventListener('input', () => this._renderTotal());
      this._container.addEventListener('change', () => this._renderTotal());
      this._container.addEventListener('click', event => {
        const target = event.target.closest('[data-eqp-action]');
        if (!target) return;
        const action = target.getAttribute('data-eqp-action');
        const id = target.getAttribute('data-id');
        if (action === 'add') this._modalEdit();
        if (action === 'edit') this._modalEdit(id);
        if (action === 'delete') this.deleteSalarie(id);
      });
    },

    _modalEdit(id) {
      const salarie = id ? this._salaries.find(s => String(s.id) === String(id)) : null;
      const title = document.getElementById('modal-title');
      const body = document.getElementById('modal-body');
      const footer = document.getElementById('modal-footer');
      const overlay = document.getElementById('modal-overlay');
      if (!title || !body || !footer || !overlay) {
        toast('Modal PlaqPro indisponible', 'error');
        return;
      }
      title.textContent = salarie ? 'Modifier salarié' : 'Ajouter salarié';
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${field('eqp-prenom', 'Prénom', salarie ? salarie.prenom : '', 'text')}
          ${field('eqp-nom', 'Nom', salarie ? salarie.nom : '', 'text')}
          <label class="calc-input-group">
            <span>Profil</span>
            <select id="eqp-profil" style="${inputStyle()}" onchange="document.getElementById('eqp-taux').value = EquipePaysagisme.PROFILS_DEFAUT[this.value].tauxHoraire">
              ${Object.keys(PROFILS_DEFAUT).map(key => `<option value="${escapeAttr(key)}"${salarie && salarie.profil === key ? ' selected' : ''}>${escapeHtml(PROFILS_DEFAUT[key].nom)}</option>`).join('')}
            </select>
          </label>
          ${field('eqp-taux', 'Taux horaire chargé (€)', salarie ? salarie.tauxHoraire : PROFILS_DEFAUT.ouvrier_qualifie.tauxHoraire)}
          ${field('eqp-competences', 'Compétences (séparées par virgules)', salarie ? salarie.competences.join(', ') : '', 'text')}
        </div>
      `;
      footer.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
        <button type="button" class="btn btn-primary" onclick="EquipePaysagisme._saveModal(${id ? `'${escapeAttr(id)}'` : 'null'})">Enregistrer</button>
      `;
      overlay.style.display = 'flex';
    },

    _saveModal(id) {
      const data = {
        prenom: value('eqp-prenom'),
        nom: value('eqp-nom'),
        profil: value('eqp-profil'),
        tauxHoraire: n(value('eqp-taux'), PROFILS_DEFAUT.ouvrier_qualifie.tauxHoraire),
        competences: value('eqp-competences').split(',').map(s => s.trim()).filter(Boolean),
      };
      if (id) this.updateSalarie(id, data);
      else this.addSalarie(data);
      if (window.App && typeof window.App.closeModal === 'function') window.App.closeModal();
    },

    _collectAffectations() {
      if (!this._container) return [];
      return Array.from(this._container.querySelectorAll('[data-eqp-use]')).filter(input => input.checked).map(input => {
        const id = input.getAttribute('data-eqp-use');
        return { salarieId: id, heures: n(this._container.querySelector(`[data-eqp-heures="${cssEscape(id)}"]`)?.value, 0) };
      });
    },

    _renderTotal() {
      const total = this.calcCoutEquipe(this._collectAffectations());
      const node = this._container ? this._container.querySelector('[data-eqp-total]') : null;
      if (!node) return;
      node.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
          <div>
            <div style="font-size:12px;color:var(--text-secondary,var(--text))">Résumé équipe affectée</div>
            <div style="font-size:26px;font-weight:900;color:var(--accent)">${money(total.totalMO)}</div>
          </div>
          <div style="font-size:12px;color:var(--text-secondary,var(--text))">${total.detail.length} salarié(s) sélectionné(s)</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;margin-top:8px">
          ${total.detail.map(item => `<div style="display:flex;justify-content:space-between;color:var(--text);font-size:13px"><span>${escapeHtml(item.nom)} · ${item.heures} h</span><strong>${money(item.cout)}</strong></div>`).join('')}
        </div>
      `;
    },

    _render() {
      if (!this._container) return;
      this._container.innerHTML = this._buildHTML();
      this._bind();
      this._renderTotal();
    },
  };

  function chantierRow(salarie) {
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid var(--border)"><input type="checkbox" data-eqp-use="${escapeAttr(salarie.id)}"></td>
        <td style="padding:8px;border-bottom:1px solid var(--border);color:var(--text)">${escapeHtml(salarie.prenom)} ${escapeHtml(salarie.nom)}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);text-align:right;color:var(--text)">${money(salarie.tauxHoraire)}/h</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);text-align:right"><input type="number" min="0" step="0.5" value="7" data-eqp-heures="${escapeAttr(salarie.id)}" style="${inputStyle()}"></td>
      </tr>
    `;
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

  function normalizeSalarie(data) {
    const profil = PROFILS_DEFAUT[data.profil] ? data.profil : 'ouvrier_qualifie';
    return {
      id: data.id,
      nom: String(data.nom || '').trim() || 'Nom',
      prenom: String(data.prenom || '').trim() || 'Prénom',
      profil,
      tauxHoraire: n(data.tauxHoraire, PROFILS_DEFAUT[profil].tauxHoraire),
      competences: Array.isArray(data.competences) ? data.competences.map(String) : [],
      affectations: Array.isArray(data.affectations) ? data.affectations : [],
    };
  }

  function nextId(items) {
    return (items || []).reduce((max, item) => Math.max(max, n(item.id, 0)), 0) + 1;
  }

  function profilNom(profil) {
    return PROFILS_DEFAUT[profil] ? PROFILS_DEFAUT[profil].nom : profil;
  }

  function profilTaux(profil) {
    return PROFILS_DEFAUT[profil] ? PROFILS_DEFAUT[profil].tauxHoraire : 35;
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

  EquipePaysagisme.init();
  window.EquipePaysagisme = EquipePaysagisme;
})();
