/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Page Mémo chantier (checklist & notes)
// ============================================================

Pages.memo = function(params) {
  params = params || {};
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="flex justify-between items-center mb-16" style="flex-wrap:wrap;gap:12px">
      <select class="form-control" id="sel-ch-memo" style="width:300px"
        onchange="PageMemo.charger(this.value)">
        <option value="">— Sélectionner un chantier —</option>
        ${DB.chantiers.map(c => {
          const cl = DB.getClient(c.clientId);
          return '<option value="' + c.id + '"' + (params.chantierId == c.id ? ' selected' : '') + '>'
            + c.nom + (cl ? ' · ' + cl.nom : '') + '</option>';
        }).join('')}
      </select>
      <button class="btn btn-primary" onclick="PageMemo.modalAjouter()">+ Nouvelle tâche</button>
    </div>
    <div id="memo-content"></div>
  `;

  if (params.chantierId) setTimeout(() => PageMemo.charger(params.chantierId), 60);
  return div;
};

const PageMemo = {

  _chantierId: null,
  _KEY: 'plaqpro_memo',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this._KEY) || '[]'); } catch { return []; }
  },

  save(items) {
    localStorage.setItem(this._KEY, JSON.stringify(items));
  },

  getByChantier(id) {
    return this.getAll().filter(t => t.chantierId === parseInt(id));
  },

  charger(id) {
    this._chantierId = parseInt(id);
    if (!id) return;

    const taches = this.getByChantier(id);
    const container = document.getElementById('memo-content');
    if (!container) return;

    const nb     = taches.length;
    const faites = taches.filter(t => t.fait).length;
    const pct    = nb ? Math.round(faites / nb * 100) : 0;

    const cats = ['Préparation', 'Matériaux', 'Chantier', 'Finitions', 'Administratif', 'Autre'];
    const parCat = {};
    cats.forEach(c => { parCat[c] = taches.filter(t => t.categorie === c); });

    container.innerHTML = `
      <!-- Barre de progression -->
      <div class="card mb-16">
        <div class="card-body" style="padding:16px 20px">
          <div class="flex justify-between items-center mb-8">
            <span style="font-size:14px;font-weight:600">${faites} / ${nb} tâches complétées</span>
            <span style="font-size:14px;font-weight:700;color:var(--${pct===100?'green':'accent'})">${pct}%</span>
          </div>
          <div style="height:6px;background:var(--glass-bg-md);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${pct===100?'var(--green)':'var(--accent)'};border-radius:3px;transition:width .3s ease"></div>
          </div>
        </div>
      </div>

      <!-- Tâches par catégorie -->
      ${cats.map(cat => {
        const items = parCat[cat];
        if (!items.length) return '';
        return `
        <div class="card mb-16">
          <div class="card-header">
            <span class="card-title">${PageMemo._iconCat(cat)} ${cat}</span>
            <span class="badge badge-gray">${items.filter(t=>t.fait).length}/${items.length}</span>
          </div>
          <div style="padding:8px 12px">
            ${items.map(t => `
            <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 8px;border-bottom:1px solid var(--glass-border);cursor:pointer"
              onclick="PageMemo.toggleFait(${t.id})">
              <span style="font-size:18px;flex-shrink:0;margin-top:1px">${t.fait ? '✅' : '⬜'}</span>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:500;${t.fait?'text-decoration:line-through;color:var(--text-tertiary)':''}">${t.titre}</div>
                ${t.note ? '<div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">' + t.note + '</div>' : ''}
              </div>
              <div style="display:flex;gap:4px;flex-shrink:0">
                ${t.urgence ? '<span class="badge badge-red" style="font-size:11px">Urgent</span>' : ''}
                <button class="btn btn-danger btn-sm" style="padding:3px 8px;font-size:11px"
                  onclick="event.stopPropagation();PageMemo.supprimer(${t.id})">✕</button>
              </div>
            </div>`).join('')}
          </div>
        </div>`;
      }).join('')}

      ${nb === 0 ? `<div class="card"><div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-title">Aucune tâche pour ce chantier</div>
        <div class="empty-state-text">Ajoutez des tâches à ne pas oublier</div>
        <button class="btn btn-primary" onclick="PageMemo.modalAjouter()">+ Nouvelle tâche</button>
      </div></div>` : ''}

      <!-- Bouton ajout rapide en bas -->
      ${nb > 0 ? `<div style="text-align:center;margin-top:8px">
        <button class="btn btn-primary" onclick="PageMemo.modalAjouter()">+ Nouvelle tâche</button>
      </div>` : ''}
    `;
  },

  _iconCat(cat) {
    return { Préparation:'📋', Matériaux:'📦', Chantier:'🔨', Finitions:'✨', Administratif:'📄', Autre:'📌' }[cat] || '📌';
  },

  toggleFait(id) {
    const items = this.getAll();
    const idx   = items.findIndex(t => t.id === id);
    if (idx === -1) return;
    items[idx].fait = !items[idx].fait;
    this.save(items);
    this.charger(this._chantierId);
  },

  supprimer(id) {
    if (!confirm('Supprimer cette tâche ?')) return;
    this.save(this.getAll().filter(t => t.id !== id));
    App.toast('Tâche supprimée');
    this.charger(this._chantierId);
  },

  modalAjouter() {
    const d = document.createElement('div');
    const cats = ['Préparation', 'Matériaux', 'Chantier', 'Finitions', 'Administratif', 'Autre'];
    d.innerHTML = `
      <div class="form-group">
        <label class="form-label">Chantier *</label>
        <select class="form-control" id="m-ch">
          ${DB.chantiers.map(c => '<option value="'+c.id+'"'+(c.id===this._chantierId?' selected':'')+'>'+c.nom+'</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tâche *</label>
        <input class="form-control" id="m-titre" placeholder="Ex: Commander les rails M48, Relancer le client...">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Catégorie</label>
          <select class="form-control" id="m-cat">
            ${cats.map(c => '<option>'+c+'</option>').join('')}
          </select>
        </div>
        <div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:4px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
            <input type="checkbox" id="m-urgence" style="accent-color:var(--red);width:15px;height:15px">
            Marquer comme urgent
          </label>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Note (optionnel)</label>
        <textarea class="form-control" id="m-note" placeholder="Détails supplémentaires..." style="min-height:60px"></textarea>
      </div>
    `;
    App.openModal('Nouvelle tâche', d, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="PageMemo.sauvegarder()">Ajouter</button>
    `);
  },

  sauvegarder() {
    const chId  = parseInt(document.getElementById('m-ch')?.value);
    const titre = document.getElementById('m-titre')?.value.trim();
    if (!chId || !titre) { App.toast('Chantier et tâche obligatoires', 'error'); return; }

    const items = this.getAll();
    const id    = items.length ? Math.max(...items.map(t => t.id)) + 1 : 1;
    items.push({
      id,
      chantierId: chId,
      titre,
      categorie: document.getElementById('m-cat')?.value || 'Autre',
      note:      document.getElementById('m-note')?.value || '',
      urgence:   document.getElementById('m-urgence')?.checked || false,
      fait:      false,
      createdAt: new Date().toISOString(),
    });
    this.save(items);
    App.closeModal();
    App.toast('Tâche ajoutée !');
    if (chId === this._chantierId) this.charger(this._chantierId);
  },
};
