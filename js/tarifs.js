// ============================================================
//  PLAQPRO WEB — Gestion tarifaire multi-enseignes
//  tarifs.js
// ============================================================

// ── Enseignes disponibles ─────────────────────────────────────
const ENSEIGNES = [
  { id: 'LM',   nom: 'Leroy Merlin',   logo: '🟦', type: 'gms',  region: 'national' },
  { id: 'BD',   nom: 'Brico Dépôt',    logo: '🟧', type: 'gms',  region: 'national' },
  { id: 'BM',   nom: 'Bricomarché',    logo: '🟩', type: 'gms',  region: 'national' },
  { id: 'GED',  nom: 'Gédimat',        logo: '🔴', type: 'pro',  region: 'national' },
  { id: 'CHAU', nom: 'Chausson',       logo: '🔵', type: 'pro',  region: 'national' },
  { id: 'GIR',  nom: 'Girardin',       logo: '🟤', type: 'pro',  region: 'rhone-alpes' },
  { id: 'LPI',  nom: 'LPI',            logo: '⚫', type: 'pro',  region: 'rhone-alpes' },
  { id: 'REX',  nom: 'Rexel',          logo: '🔶', type: 'pro',  region: 'national' },
  { id: 'SON',  nom: 'Sonepar',        logo: '🔷', type: 'pro',  region: 'national' },
  { id: 'WUR',  nom: 'Würth',          logo: '🟥', type: 'pro',  region: 'national' },
  { id: 'PP',   nom: 'Point P',        logo: '🟨', type: 'pro',  region: 'national' },
  { id: 'MAN',  nom: 'Manutan',        logo: '🟪', type: 'pro',  region: 'national' },
  { id: 'NEG',  nom: 'Tarif négocié',  logo: '🤝', type: 'nego', region: 'perso', protege: true },
  { id: 'FOUR', nom: 'Fournisseur perso', logo: '📋', type: 'perso', region: 'perso', protege: true },
];

// ── Enseignes valides pour une famille de produit ─────────────
// Utilise ENSEIGNES_PAR_FAMILLE (défini dans produits_complet.js)
// Toujours inclut NEG + FOUR (tarifs protégés personnels)
function getEnseignesParFamille(famille) {
  const perso = ENSEIGNES.filter(e => e.type === 'nego' || e.type === 'perso');
  if (typeof ENSEIGNES_PAR_FAMILLE === 'undefined') return ENSEIGNES;
  const ids = ENSEIGNES_PAR_FAMILLE[famille];
  if (!ids || !ids.length) return perso.length ? perso : ENSEIGNES;
  return [
    ...ENSEIGNES.filter(e => ids.includes(e.id)),
    ...perso,
  ];
}

// ── Gestion des tarifs multi-enseignes ────────────────────────
const Tarifs = {

  KEY_TARIFS: 'plaqpro_tarifs_multi',

  // Récupérer tous les tarifs enregistrés
  getTous() {
    try { return JSON.parse(localStorage.getItem(this.KEY_TARIFS) || '[]'); }
    catch { return []; }
  },

  // Enregistrer
  save(tarifs) {
    localStorage.setItem(this.KEY_TARIFS, JSON.stringify(tarifs));
  },

  // Ajouter/mettre à jour un tarif
  // protege = true → jamais mis à jour automatiquement
  set(ref, enseigneId, prix, options = {}) {
    const tarifs = this.getTous();
    const idx = tarifs.findIndex(t => t.ref === ref && t.enseigneId === enseigneId);
    const enseigne = ENSEIGNES.find(e => e.id === enseigneId);
    const entry = {
      ref, enseigneId,
      prix: parseFloat(prix),
      dateMAJ: new Date().toISOString().split('T')[0],
      protege: options.protege || enseigne?.protege || false,
      source:  options.source || enseigneId,
      note:    options.note || '',
      statut:  options.statut || 'valide', // valide | devis_encours | negocie
    };
    if (idx >= 0) tarifs[idx] = entry;
    else tarifs.push(entry);
    this.save(tarifs);
    return entry;
  },

  // Supprimer un tarif
  supprimer(ref, enseigneId) {
    const tarifs = this.getTous().filter(t => !(t.ref === ref && t.enseigneId === enseigneId));
    this.save(tarifs);
  },

  // Tarifs d'une référence toutes enseignes
  getPourRef(ref) {
    return this.getTous().filter(t => t.ref === ref);
  },

  // Meilleur prix pour une ref (non protégé en priorité)
  getMeilleurPrix(ref) {
    const tarifs = this.getPourRef(ref).filter(t => t.statut === 'valide');
    if (!tarifs.length) return null;
    return tarifs.reduce((min, t) => t.prix < min.prix ? t : min, tarifs[0]);
  },

  // Prix négocié/fournisseur (protégé)
  getPrixNegocie(ref) {
    return this.getTous().find(t => t.ref === ref && t.protege && t.statut === 'valide') || null;
  },

  // Prix effectif à utiliser (négocié en priorité, sinon meilleur)
  getPrixEffectif(ref) {
    const nego = this.getPrixNegocie(ref);
    if (nego) return nego;
    const best = this.getMeilleurPrix(ref);
    if (best) return best;
    // Fallback sur la base produits
    const p = DB.getProduitByRef(ref);
    return p ? { ref, prix: p.prixHT, enseigneId: 'DB', source: 'Base', protege: false } : null;
  },

  // Mise à jour groupée (saute les protégés)
  mettreAJourBatch(mises_a_jour) {
    let ok = 0, skip = 0;
    mises_a_jour.forEach(({ ref, enseigneId, prix }) => {
      const existing = this.getTous().find(t => t.ref === ref && t.enseigneId === enseigneId);
      if (existing?.protege) { skip++; return; }
      this.set(ref, enseigneId, prix);
      ok++;
    });
    return { ok, skip };
  },
};

// ── Page gestion des tarifs ───────────────────────────────────
Pages.tarifs = function() {
  const div = document.createElement('div');

  const tousLesTarifs = Tarifs.getTous();
  const produits = DB.produits;

  div.innerHTML = `
    <!-- Barre de recherche -->
    <div class="flex gap-12 mb-16 items-center" style="flex-wrap:wrap">
      <div style="flex:1;min-width:280px;display:flex;align-items:center;gap:10px;
        background:var(--glass-bg-md);border:1px solid var(--glass-border-md);
        border-radius:var(--r-full);padding:0 16px;
        box-shadow:0 2px 12px rgba(0,0,0,0.3)">
        <span style="font-size:18px;opacity:.6">🔍</span>
        <input type="text" id="tarif-search"
          style="flex:1;height:44px;background:none;border:none;outline:none;
            font-family:var(--font);font-size:15px;color:var(--text-primary)"
          placeholder="Référence, produit, enseigne... (3 lettres)"
          oninput="GestTarifs.rechercher(this.value)">
      </div>

      <!-- Filtre enseigne -->
      <select id="tarif-enseigne-filtre" class="form-control" style="width:180px"
        onchange="GestTarifs.filtrer()">
        <option value="">Toutes enseignes</option>
        ${ENSEIGNES.map(e => `<option value="${e.id}">${e.logo} ${e.nom}</option>`).join('')}
      </select>

      <!-- Filtre statut -->
      <select id="tarif-statut-filtre" class="form-control" style="width:160px"
        onchange="GestTarifs.filtrer()">
        <option value="">Tous statuts</option>
        <option value="valide">✅ Validés</option>
        <option value="negocie">🤝 Négociés</option>
        <option value="devis_encours">📝 Devis en cours</option>
        <option value="protege">🔒 Protégés</option>
      </select>

      <button class="btn btn-primary" onclick="GestTarifs.modalSaisirTarif()">+ Saisir tarif</button>
      <button class="btn btn-warning" onclick="GestTarifs.mettreAJourPrix()">🔄 Mettre à jour les prix</button>
        <button class="btn btn-secondary" onclick="GestTarifs.exporterCSV()">⬇ Exporter CSV</button>
    </div>

    <!-- Légende protections -->
    <div class="flex gap-8 mb-16" style="flex-wrap:wrap">
      <div class="tarif-badge tarif-valide">✅ Tarif catalogue</div>
      <div class="tarif-badge tarif-negocie">🤝 Tarif négocié (protégé)</div>
      <div class="tarif-badge tarif-perso">📋 Fournisseur perso (protégé)</div>
      <div class="tarif-badge tarif-devis">📝 Devis en cours</div>
      <div style="font-size:12px;color:var(--text-tertiary);align-self:center">
        🔒 = jamais mis à jour automatiquement
      </div>
    </div>

    <!-- Tableau des tarifs -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Grille tarifaire multi-enseignes</span>
        <span id="tarif-count" style="font-size:13px;color:var(--text-tertiary)">
          ${tousLesTarifs.length} tarif(s) enregistré(s)
        </span>
      </div>
      <div id="tarifs-table-wrap" class="table-wrap">
        ${GestTarifs.renderTable(tousLesTarifs, produits)}
      </div>
    </div>

    <!-- Comparateur de prix -->
    <div class="card mt-16">
      <div class="card-header">
        <span class="card-title">📊 Comparateur de prix par référence</span>
      </div>
      <div class="card-body">
        <div class="flex gap-12 mb-16">
          <select id="comp-ref" class="form-control" style="width:320px"
            onchange="GestTarifs.comparer(this.value)">
            <option value="">— Sélectionner une référence —</option>
            ${produits.map(p => `<option value="${p.reference}">${p.reference} — ${p.designation}</option>`).join('')}
          </select>
        </div>
        <div id="comp-result"></div>
      </div>
    </div>
  `;

  // Styles
  if (!document.getElementById('tarif-styles')) {
    const style = document.createElement('style');
    style.id = 'tarif-styles';
    style.textContent = `
      .tarif-badge {
        padding: 4px 12px; border-radius: var(--r-full);
        font-size: 12px; font-weight: 600;
      }
      .tarif-valide  { background: var(--green-dim);  color: var(--green);  border: 1px solid rgba(45,212,160,.2); }
      .tarif-negocie { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(79,142,247,.2); }
      .tarif-perso   { background: var(--purple-dim); color: var(--purple); border: 1px solid rgba(167,139,250,.2); }
      .tarif-devis   { background: var(--orange-dim); color: var(--orange); border: 1px solid rgba(247,166,79,.2); }

      .tarif-lock { color: var(--accent); font-size: 13px; }

      .comp-bar-wrap {
        display: flex; align-items: center; gap: 12px;
        padding: 8px 0; border-bottom: 1px solid var(--glass-border);
      }
      .comp-enseigne { width: 130px; font-size: 13px; font-weight: 600; flex-shrink: 0; }
      .comp-bar-bg {
        flex: 1; height: 24px; background: var(--glass-bg);
        border-radius: var(--r-full); overflow: hidden;
        border: 1px solid var(--glass-border);
      }
      .comp-bar-fill {
        height: 100%; border-radius: var(--r-full);
        background: linear-gradient(90deg, var(--accent), var(--green));
        transition: width .4s cubic-bezier(.22,1,.36,1);
        display: flex; align-items: center; justify-content: flex-end;
        padding-right: 8px;
      }
      .comp-prix {
        width: 90px; text-align: right;
        font-family: var(--font-mono); font-size: 14px; font-weight: 700;
        flex-shrink: 0;
      }
      .comp-badge { font-size: 10px; flex-shrink: 0; }
    `;
    document.head.appendChild(style);
  }

  return div;
};

// ── Moteur de la page tarifs ──────────────────────────────────
const GestTarifs = {

  _query: '',
  _enseigne: '',
  _statut: '',

  iconEns(id) {
    return ENSEIGNES.find(e => e.id === id)?.logo || '📦';
  },
  nomEns(id) {
    return ENSEIGNES.find(e => e.id === id)?.nom || id;
  },

  renderTable(tarifs, produits) {
    if (!tarifs.length) return `
      <div class="empty-state">
        <div class="empty-state-icon">💰</div>
        <div class="empty-state-title">Aucun tarif enregistré</div>
        <div class="empty-state-text">Cliquez sur "+ Saisir tarif" pour commencer</div>
      </div>`;

    return `<table>
      <thead><tr>
        <th>Référence</th><th>Désignation</th><th>Enseigne</th>
        <th style="text-align:right">Prix HT</th>
        <th>Date MAJ</th><th>Statut</th><th></th>
      </tr></thead>
      <tbody>
        ${tarifs.map(t => {
          const prod = produits.find(p => p.reference === t.ref);
          const ens  = ENSEIGNES.find(e => e.id === t.enseigneId);
          const basePrix = prod?.prixHT || 0;
          const ecart = basePrix > 0 ? ((t.prix - basePrix) / basePrix * 100) : 0;
          const ecartColor = ecart > 5 ? 'var(--red)' : ecart < -2 ? 'var(--green)' : 'var(--text-tertiary)';

          return `<tr>
            <td class="font-mono" style="font-size:12px;color:var(--text-tertiary)">${t.ref}</td>
            <td style="font-weight:500">${prod?.designation || t.ref}
              ${t.note ? '<br><span style="font-size:11px;color:var(--text-tertiary)">' + t.note + '</span>' : ''}
            </td>
            <td>
              <span style="font-weight:600">${ens?.logo || '📦'} ${ens?.nom || t.enseigneId}</span>
            </td>
            <td style="text-align:right">
              <span style="font-family:var(--font-mono);font-weight:700;font-size:15px">${new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2}).format(t.prix)} €</span>
              ${basePrix > 0 ? '<br><span style="font-size:11px;color:' + ecartColor + '">' + (ecart >= 0 ? '+' : '') + ecart.toFixed(1) + '% vs base</span>' : ''}
            </td>
            <td style="font-size:12px;color:var(--text-tertiary)">${t.dateMAJ || '—'}</td>
            <td>
              ${t.protege ? '<span class="tarif-badge tarif-negocie">🔒 Protégé</span>' :
                t.statut === 'devis_encours' ? '<span class="tarif-badge tarif-devis">📝 Devis</span>' :
                '<span class="tarif-badge tarif-valide">✅ Valide</span>'}
            </td>
            <td>
              <button class="btn btn-ghost btn-sm" onclick="GestTarifs.modalEditTarif('${t.ref}','${t.enseigneId}')">✏️</button>
              ${!t.protege ? '<button class="btn btn-danger btn-sm" onclick="GestTarifs.supprimerTarif(\''+t.ref+'\',\''+t.enseigneId+'\')">✕</button>' : ''}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  },

  rechercher(q) {
    this._query = q.toLowerCase().trim();
    this.filtrer();
  },

  filtrer() {
    this._enseigne = document.getElementById('tarif-enseigne-filtre')?.value || '';
    this._statut   = document.getElementById('tarif-statut-filtre')?.value || '';

    let tarifs = Tarifs.getTous();
    const produits = DB.produits;

    if (this._query.length >= 2) {
      tarifs = tarifs.filter(t => {
        const prod = produits.find(p => p.reference === t.ref);
        return t.ref.toLowerCase().includes(this._query) ||
          (prod?.designation || '').toLowerCase().includes(this._query) ||
          (prod?.categorie   || '').toLowerCase().includes(this._query) ||
          t.enseigneId.toLowerCase().includes(this._query) ||
          this.nomEns(t.enseigneId).toLowerCase().includes(this._query);
      });
    }

    if (this._enseigne) tarifs = tarifs.filter(t => t.enseigneId === this._enseigne);

    if (this._statut) {
      if (this._statut === 'protege') tarifs = tarifs.filter(t => t.protege);
      else tarifs = tarifs.filter(t => t.statut === this._statut && !t.protege);
    }

    const wrap = document.getElementById('tarifs-table-wrap');
    if (wrap) wrap.innerHTML = this.renderTable(tarifs, produits);

    const cnt = document.getElementById('tarif-count');
    if (cnt) cnt.textContent = tarifs.length + ' tarif(s)';
  },

  comparer(ref) {
    const el = document.getElementById('comp-result');
    if (!el || !ref) return;

    const tarifs = Tarifs.getPourRef(ref);
    const prod   = DB.getProduitByRef(ref);
    if (!tarifs.length && !prod) {
      el.innerHTML = '<div class="text-secondary" style="padding:12px">Aucun tarif pour cette référence</div>';
      return;
    }

    // Filtrer par enseignes pertinentes pour la famille du produit
    const enseignesOk = getEnseignesParFamille(prod?.categorie || '').map(e => e.id);
    let tous = tarifs.filter(t => !enseignesOk.length || enseignesOk.includes(t.enseigneId));

    // Ajouter le prix de base si pas dans les tarifs
    if (prod && !tous.find(t => t.enseigneId === 'DB')) {
      tous.push({ ref, enseigneId: 'DB', prix: prod.prixHT, source: 'Base PlaqPro', protege: false, statut: 'valide' });
    }

    // Trier par prix
    tous.sort((a, b) => a.prix - b.prix);
    const maxPrix = Math.max(...tous.map(t => t.prix));

    el.innerHTML = `
      <div style="margin-bottom:8px;font-size:13px;font-weight:600;color:var(--text-secondary)">
        ${prod?.designation || ref} — Comparaison des prix
      </div>
      ${tous.map((t, i) => {
        const ens  = ENSEIGNES.find(e => e.id === t.enseigneId);
        const pct  = maxPrix > 0 ? (t.prix / maxPrix * 100) : 100;
        const best = i === 0;
        return `
        <div class="comp-bar-wrap">
          <div class="comp-enseigne">
            ${ens?.logo || '📦'} ${ens?.nom || t.enseigneId}
            ${t.protege ? '<span style="font-size:10px;color:var(--accent)"> 🔒</span>' : ''}
          </div>
          <div class="comp-bar-bg">
            <div class="comp-bar-fill" style="width:${pct}%;background:${best ? 'linear-gradient(90deg,var(--green),#1ab578)' : 'linear-gradient(90deg,var(--accent),var(--accent-hover))'}">
            </div>
          </div>
          <div class="comp-prix" style="color:${best ? 'var(--green)' : 'var(--text-primary)'}">
            ${new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2}).format(t.prix)} €
          </div>
          <div class="comp-badge">
            ${best ? '<span class="tarif-badge tarif-valide" style="font-size:10px">🏆 Meilleur</span>' : ''}
            ${t.statut === 'devis_encours' ? '<span class="tarif-badge tarif-devis" style="font-size:10px">📝 Devis</span>' : ''}
          </div>
        </div>`;
      }).join('')}
    `;
  },

  modalSaisirTarif(refPreselect) {
    const d = document.createElement('div');
    d.innerHTML = `
      <div class="form-row mb-16">
        <div class="form-group">
          <label class="form-label">Référence produit *</label>
          <input class="form-control" id="tf-ref" list="tf-ref-list"
            placeholder="BA13S, PARF48..."
            value="${refPreselect || ''}" oninput="GestTarifs.autoFillNom(this.value)">
          <datalist id="tf-ref-list">
            ${DB.produits.map(p => '<option value="' + p.reference + '">' + p.designation + '</option>').join('')}
          </datalist>
        </div>
        <div class="form-group">
          <label class="form-label">Désignation</label>
          <input class="form-control" id="tf-nom" placeholder="Auto-rempli...">
        </div>
      </div>

      <div class="form-row mb-16">
        <div class="form-group">
          <label class="form-label">Enseigne *</label>
          <select class="form-control" id="tf-enseigne" onchange="GestTarifs.onEnseigneChange(this.value)">
            <option value="">— Sélectionner —</option>
            ${ENSEIGNES.map(e => '<option value="' + e.id + '">' + e.logo + ' ' + e.nom + (e.protege ? ' 🔒' : '') + '</option>').join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Prix HT (€) *</label>
          <div style="display:flex;align-items:center;gap:0;border:1px solid var(--glass-border-md);border-radius:var(--r-md);overflow:hidden;box-shadow:inset 0 1px 3px rgba(0,0,0,.3)">
            <input type="number" class="form-control" id="tf-prix" step="0.01" placeholder="0.00"
              style="border:none;box-shadow:none;border-radius:0">
            <span style="padding:0 12px;color:var(--text-tertiary);font-size:13px;background:var(--glass-bg);border-left:1px solid var(--glass-border);height:40px;display:flex;align-items:center">€ HT</span>
          </div>
        </div>
      </div>

      <div class="form-group mb-16" id="tf-protege-wrap" style="display:none">
        <div style="background:var(--accent-dim);border:1px solid rgba(79,142,247,.2);border-radius:var(--r-md);padding:12px 14px">
          <div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:4px">🔒 Tarif protégé</div>
          <div style="font-size:12px;color:var(--text-secondary)">
            Ce tarif ne sera jamais mis à jour automatiquement. Seule une modification manuelle peut le changer.
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Statut</label>
          <select class="form-control" id="tf-statut">
            <option value="valide">✅ Validé (catalogue)</option>
            <option value="negocie">🤝 Tarif négocié</option>
            <option value="devis_encours">📝 Devis en cours (non validé)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Note / référence fournisseur</label>
          <input class="form-control" id="tf-note" placeholder="ex: Remise -15%, réf. PRO-123...">
        </div>
      </div>

      <div id="tf-compare-block" style="margin-top:16px"></div>
    `;

    App.openModal('Saisir un tarif', d, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="GestTarifs.sauvegarderTarif()">Enregistrer</button>
    `);

    if (refPreselect) this.autoFillNom(refPreselect);
  },

  autoFillNom(ref) {
    const prod = DB.getProduitByRef(ref);
    const nomEl = document.getElementById('tf-nom');
    if (nomEl && prod) nomEl.value = prod.designation;

    // Mettre à jour les enseignes disponibles selon la famille du produit
    const ensEl = document.getElementById('tf-enseigne');
    if (ensEl && prod) {
      const enseignes = getEnseignesParFamille(prod.categorie || '');
      const currentVal = ensEl.value;
      ensEl.innerHTML = '<option value="">— Sélectionner —</option>' +
        enseignes.map(e =>
          '<option value="' + e.id + '">' + e.logo + ' ' + e.nom + (e.protege ? ' 🔒' : '') + '</option>'
        ).join('');
      if (currentVal) ensEl.value = currentVal;
    }

    // Afficher le prix de base actuel
    const block = document.getElementById('tf-compare-block');
    if (block && prod) {
      const tarifs = Tarifs.getPourRef(ref);
      if (tarifs.length) {
        const best = tarifs.reduce((m, t) => t.prix < m.prix ? t : m, tarifs[0]);
        block.innerHTML = `
          <div style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-md);padding:10px 14px;font-size:12px">
            <span style="color:var(--text-tertiary)">Prix actuel en base : </span>
            <strong style="color:var(--accent)">${new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2}).format(prod.prixHT)} €</strong>
            <span style="color:var(--text-tertiary);margin-left:12px">· Meilleur tarif enregistré : </span>
            <strong style="color:var(--green)">${new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2}).format(best.prix)} € (${this.nomEns(best.enseigneId)})</strong>
          </div>`;
      }
    }
  },

  onEnseigneChange(id) {
    const ens = ENSEIGNES.find(e => e.id === id);
    const wrap = document.getElementById('tf-protege-wrap');
    if (wrap) wrap.style.display = ens?.protege ? 'block' : 'none';
  },

  sauvegarderTarif(refEdit, ensEdit) {
    const ref      = (document.getElementById('tf-ref')?.value || '').trim().toUpperCase();
    const ensId    = document.getElementById('tf-enseigne')?.value;
    const prixStr  = document.getElementById('tf-prix')?.value;
    const statut   = document.getElementById('tf-statut')?.value || 'valide';
    const note     = document.getElementById('tf-note')?.value || '';

    if (!ref || !ensId || !prixStr) {
      App.toast('Référence, enseigne et prix obligatoires', 'error');
      return;
    }

    const prix = parseFloat(prixStr);
    if (isNaN(prix) || prix <= 0) {
      App.toast('Prix invalide', 'error');
      return;
    }

    const ens = ENSEIGNES.find(e => e.id === ensId);
    Tarifs.set(ref, ensId, prix, {
      protege: ens?.protege || false,
      statut, note,
    });

    // Optionnel : mettre à jour le prix dans la base produits si pas protégé
    if (!ens?.protege && statut === 'valide') {
      const prod = DB.getProduitByRef(ref);
      if (prod) {
        DB.updateProduit(prod.id, { prixHT: prix, source: ensId });
      }
    }

    App.closeModal();
    App.toast('Tarif enregistré !');
    App.navigate('tarifs');
  },

  modalEditTarif(ref, ensId) {
    const t = Tarifs.getTous().find(t => t.ref === ref && t.enseigneId === ensId);
    if (!t) return;
    this.modalSaisirTarif(ref);
    setTimeout(() => {
      const ensEl = document.getElementById('tf-enseigne');
      const prixEl = document.getElementById('tf-prix');
      const statutEl = document.getElementById('tf-statut');
      const noteEl = document.getElementById('tf-note');
      if (ensEl) ensEl.value = ensId;
      if (prixEl) prixEl.value = t.prix;
      if (statutEl) statutEl.value = t.statut || 'valide';
      if (noteEl) noteEl.value = t.note || '';
      this.onEnseigneChange(ensId);
    }, 100);
  },

  supprimerTarif(ref, ensId) {
    if (!confirm('Supprimer ce tarif ?')) return;
    Tarifs.supprimer(ref, ensId);
    App.toast('Tarif supprimé');
    App.navigate('tarifs');
  },

  exporterCSV() {
    const tarifs  = Tarifs.getTous();
    const produits = DB.produits;
    let csv = 'Référence;Désignation;Enseigne;Prix HT;Date MAJ;Statut;Protégé;Note\n';
    tarifs.forEach(t => {
      const prod = produits.find(p => p.reference === t.ref);
      csv += [
        t.ref,
        '"' + (prod?.designation || t.ref) + '"',
        this.nomEns(t.enseigneId),
        t.prix.toString().replace('.', ','),
        t.dateMAJ || '',
        t.statut || 'valide',
        t.protege ? 'Oui' : 'Non',
        '"' + (t.note || '') + '"',
      ].join(';') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'PlaqPro_Tarifs_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    App.toast('Export CSV téléchargé !');
  },
};

// ── Initialiser la grille avec les prix de la base produits ──
function initTarifsDepuisBase() {
  const existants = Tarifs.getTous();
  if (existants.length > 0) return; // déjà initialisé

  const produits = DB.produits;
  let count = 0;

  // Prix de référence par enseigne (basés sur les tarifs pro connus)
  const coefEnseignes = {
    'LM':   1.05,  // Leroy Merlin +5%
    'BD':   1.00,  // Brico Dépôt ref
    'BM':   1.08,  // Bricomarché +8%
    'GED':  0.94,  // Gédimat pro -6%
    'CHAU': 0.92,  // Chausson pro -8%
    'GIR':  0.91,  // Girardin pro -9%
    'LPI':  0.90,  // LPI pro -10%
    'REX':  0.88,  // Rexel pro -12%
    'SON':  0.89,  // Sonepar pro -11%
    'WUR':  0.95,  // Würth -5%
    'PP':   0.93,  // Point P -7%
    'MAN':  0.92,  // Manutan pro -8%
  };

  produits.forEach(p => {
    if (!p.prixHT || p.prixHT <= 0) return;
    // Utiliser uniquement les enseignes pertinentes pour cette famille
    const enseignesValides = getEnseignesParFamille(p.categorie || '');
    const enseignesProd = enseignesValides
      .filter(e => !e.protege && coefEnseignes[e.id])
      .slice(0, 4)
      .map(e => e.id);
    if (!enseignesProd.length) return;
    enseignesProd.forEach(ensId => {
      const coef = coefEnseignes[ensId] || 1;
      // Variation aléatoire ±3% pour simuler réalité
      const variation = 0.97 + Math.random() * 0.06;
      const prix = Math.round(p.prixHT * coef * variation * 100) / 100;
      Tarifs.set(p.reference, ensId, prix, {
        protege: false,
        statut: 'valide',
        note: 'Prix indicatif — à mettre à jour',
      });
      count++;
    });
  });

  console.log('PlaqPro — ' + count + ' tarifs initialisés depuis la base');
}

// Appeler à l'init
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initTarifsDepuisBase, 800);
});

// ── Bouton mise à jour manuelle ───────────────────────────────
GestTarifs.mettreAJourPrix = function() {
  const nbProteges = Tarifs.getTous().filter(t => t.protege).length;
  const msg = 'Mettre à jour tous les prix catalogue depuis la base produits ?\n\n' +
    '✅ Prix catalogue → recalculés\n' +
    '🔒 Tarifs protégés (' + nbProteges + ') → inchangés\n\n' +
    'Cette opération simule une mise à jour depuis les distributeurs.';

  if (!confirm(msg)) return;

  const produits = DB.produits;
  const coefEnseignes = {
    'LM': 1.05, 'BD': 1.00, 'BM': 1.08,
    'GED': 0.94, 'CHAU': 0.92, 'GIR': 0.91,
    'LPI': 0.90, 'REX': 0.88, 'SON': 0.89,
    'WUR': 0.95, 'PP': 0.93, 'MAN': 0.92,
  };

  let mises_a_jour = [];
  produits.forEach(p => {
    if (!p.prixHT || p.prixHT <= 0) return;
    const enseignesValides = getEnseignesParFamille(p.categorie || '');
    enseignesValides
      .filter(e => !e.protege && coefEnseignes[e.id])
      .forEach(e => {
        const coef = coefEnseignes[e.id];
        const variation = 0.98 + Math.random() * 0.04; // ±2%
        const prix = Math.round(p.prixHT * coef * variation * 100) / 100;
        mises_a_jour.push({ ref: p.reference, enseigneId: e.id, prix });
      });
  });

  const result = Tarifs.mettreAJourBatch(mises_a_jour);
  App.toast('✅ ' + result.ok + ' prix mis à jour · 🔒 ' + result.skip + ' protégés conservés');
  App.navigate('tarifs');
};
