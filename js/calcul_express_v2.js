/**
 * PlaqPro+ — Calcul Express V2
 * Flux : chantier + client → profil → sous-traitants → corps métiers → pièces → métrages → résultat
 * Architecture validée 02/06/2026
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 */
/* global App, DB, BddV2 */

const CalcExpressV2 = {

  // ── État ──────────────────────────────────────────────────
  _containerId:   null,
  _container:     null,
  _etape:         null,
  _chantier:      { nom: '', clientId: null, adresse: '' },
  _profil:        null,
  _sousTraitants: [],
  _corpsActifs:   [],
  _pieces:        [],
  _resultats:     {},

  // ── Corps disponibles ─────────────────────────────────────
  CORPS: [
    { id: 'plaquisterie', label: 'Plaquisterie', icone: '🧱' },
    { id: 'peinture',     label: 'Peinture',     icone: '🎨' },
    { id: 'electricite',  label: 'Électricité',  icone: '⚡' },
    { id: 'plomberie',    label: 'Plomberie',    icone: '🔧' },
    { id: 'maconnerie',   label: 'Maçonnerie',   icone: '🏗' },
    { id: 'paysagisme',   label: 'Paysagisme',   icone: '🌿' },
  ],

  // ── Pièces par profil ─────────────────────────────────────
  PIECES_PROFIL: {
    particulier: ['Salon', 'Séjour', 'Cuisine', 'Chambre 1', 'Chambre 2',
                  'Chambre 3', 'Salle de bain', 'WC', 'Entrée', 'Couloir', 'Garage', 'Buanderie'],
    pro:         ['Bureau 1', 'Bureau 2', 'Bureau 3', 'Salle de réunion', 'Hall',
                  'Couloir', 'Dépôt', 'Local technique', 'Sanitaires', 'Accueil', 'Espace commun'],
    ao:          [],
  },

  // ── Entrée ────────────────────────────────────────────────
  init(containerId) {
    this._containerId = containerId;
    this._container   = document.getElementById(containerId);
    if (!this._container) return;
    this._chantier      = { nom: '', clientId: null, adresse: '' };
    this._profil        = null;
    this._sousTraitants = [];
    this._corpsActifs   = [];
    this._pieces        = [];
    this._resultats     = {};
    this._corpsEnCours  = 0;
    this._pieceEnCours  = null;
    this._renderEtape('chantier');
  },

  // ── Dispatcher étapes ─────────────────────────────────────
  _renderEtape(etape) {
    this._etape = etape;
    if (!this._container) return;
    const renders = {
      chantier:      () => this._renderChantier(),
      profil:        () => this._renderProfil(),
      sousTraitants: () => this._renderSousTraitants(),
      corps:         () => this._renderCorps(),
      pieces:        () => this._renderPieces(),
      metrage:       () => this._renderMetrage(),
    };
    if (renders[etape]) renders[etape]();
  },

  // ── Helpers UI ────────────────────────────────────────────
  _html(h) { this._container.innerHTML = h; },

  _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  _progressBar(etapeActive) {
    const etapes = ['chantier','profil','sousTraitants','corps','pieces','metrage'];
    const labels = ['Chantier','Profil','Sous-traitants','Travaux','Pièces','Métrage'];
    const idx    = etapes.indexOf(etapeActive);
    const steps  = labels.map((l, i) => {
      const done   = i < idx;
      const active = i === idx;
      const color  = done || active ? 'var(--accent,#2563eb)' : 'var(--border,#ddd)';
      const fw     = active ? '700' : done ? '600' : '400';
      const op     = done || active ? '1' : '0.45';
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;opacity:${op}">
        <div style="width:28px;height:28px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700">${done ? '✓' : i+1}</div>
        <span style="font-size:11px;font-weight:${fw};color:var(--text-secondary,#666)">${l}</span>
      </div>
      ${i < labels.length-1 ? `<div style="flex:1;height:2px;background:${done ? 'var(--accent,#2563eb)' : 'var(--border,#ddd)'};margin-top:14px"></div>` : ''}`;
    }).join('');
    return `<div style="display:flex;align-items:flex-start;gap:0;margin-bottom:24px;padding:16px;background:var(--bg-card,#1e2530);border:1px solid var(--border,#2a3240);border-radius:10px">${steps}</div>`;
  },

  _card(content) {
    return `<div style="background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:24px;margin-bottom:16px">${content}</div>`;
  },

  _btn(label, action, style) {
    const s = style || 'primary';
    const bg    = s === 'primary' ? 'var(--accent,#2563eb)' : 'rgba(255,255,255,.12)';
    const color = s === 'primary' ? '#fff' : '#fff';
    const border= s === 'primary' ? 'none' : '1px solid rgba(255,255,255,.35)';
    return `<button type="button" data-cex-action="${action}" style="padding:10px 22px;border-radius:8px;border:${border};background:${bg};color:${color};font-weight:600;cursor:pointer;font-size:.9rem">${label}</button>`;
  },

  // ── Étape 1 : Chantier + Client ───────────────────────────
  _renderChantier() {
    const clients    = DB.getAll(DB.KEYS.clients).filter(c => c.actif !== false);
    const chantiers  = DB.getAll(DB.KEYS.chantiers).filter(c => c.actif !== false);
    const chantierId = this._chantier.chantierId;
    const chanExist  = chantiers.find(c => c.id == chantierId);

    const optChantier = chantiers.map(c =>
      `<option value="${c.id}" ${c.id == chantierId ? 'selected' : ''}>${this._esc(c.nom || c.libelle || '')}</option>`
    ).join('');
    const optClient = clients.map(c =>
      `<option value="${c.id}" ${c.id == this._chantier.clientId ? 'selected' : ''}>${this._esc(c.nom || c.raisonSociale || '')}</option>`
    ).join('');

    const clientExist = chanExist ? clients.find(c => c.id == chanExist.clientId) : null;
    const champsNouveaux = chanExist ? `
      <div style="background:rgba(37,99,235,.06);border:1px solid var(--accent,#2563eb);border-radius:8px;padding:12px 16px;font-size:.9rem;display:flex;flex-direction:column;gap:4px">
        <div style="font-weight:700">${this._esc(chanExist.nom || chanExist.libelle || '')}</div>
        ${clientExist ? `<div style="font-size:.85rem;color:var(--accent,#2563eb)">👤 ${this._esc(clientExist.nom || clientExist.raisonSociale || '')}</div>` : ''}
        <div style="color:var(--text-secondary,#666);font-size:.8rem">${this._esc(chanExist.adresse || chanExist.ville || '')}</div>
      </div>` : `
      <div>
        <label style="font-size:.85rem;font-weight:600;color:var(--text-secondary,#666);display:block;margin-bottom:6px">Client *</label>
        <select id="cex-client-id" style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--border,#e2e8f0);font-size:.95rem;box-sizing:border-box;background:var(--bg-card,#1e2530);color:var(--text-main,#fff)">
          <option value="">-- Sélectionner un client --</option>
          ${optClient}
        </select>
        <button type="button" data-cex-action="nouveau-client" style="margin-top:8px;font-size:.8rem;color:var(--accent,#2563eb);background:none;border:none;cursor:pointer;padding:0">+ Nouveau client</button>
      </div>
      <div>
        <label style="font-size:.85rem;font-weight:600;color:var(--text-secondary,#666);display:block;margin-bottom:6px">Nom du chantier *</label>
        <input id="cex-chantier-nom" type="text" placeholder="ex : Rénovation villa Martin" value="${this._esc(this._chantier.nom)}"
          style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--border,#e2e8f0);font-size:.95rem;box-sizing:border-box;background:var(--bg-card,#1e2530);color:var(--text-main,#fff)">
      </div>
      <div>
        <label style="font-size:.85rem;font-weight:600;color:var(--text-secondary,#666);display:block;margin-bottom:6px">Adresse</label>
        <input id="cex-chantier-adresse" type="text" placeholder="ex : 12 rue des Acacias, Lyon" value="${this._esc(this._chantier.adresse)}"
          style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--border,#e2e8f0);font-size:.95rem;box-sizing:border-box;background:var(--bg-card,#1e2530);color:var(--text-main,#fff)">
      </div>`;

    this._html(`
      ${this._progressBar('chantier')}
      ${this._card(`
        <h2 style="margin:0 0 16px;font-size:1.1rem;font-weight:700">Nouveau chiffrage</h2>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div>
            <label style="font-size:.85rem;font-weight:600;color:var(--text-secondary,#666);display:block;margin-bottom:6px">Chantier existant</label>
            <select id="cex-chantier-id"
              style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--border,#e2e8f0);font-size:.95rem;box-sizing:border-box;background:var(--bg-card,#1e2530);color:var(--text-main,#fff)">
              <option value="">-- Nouveau chantier --</option>
              ${optChantier}
            </select>
            ${!chanExist ? `<button type="button" data-cex-action="nouveau-chantier" style="margin-top:8px;font-size:.8rem;color:var(--accent,#2563eb);background:none;border:none;cursor:pointer;padding:0">+ Créer un chantier</button>` : ''}
          </div>
          ${champsNouveaux}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:20px">
          ${this._btn('✕ Annuler', 'chantier-annuler', 'secondary')}
          ${this._btn('Suivant →', 'chantier-suivant')}
        </div>
      `)}
    `);

    const sel = this._container.querySelector('#cex-chantier-id');
    if (sel) {
      sel.addEventListener('change', () => {
        const id = sel.value;
        const ch = DB.getAll(DB.KEYS.chantiers).find(c => c.id == id);
        this._chantier.chantierId = id || null;
        if (ch) {
          this._chantier.nom      = ch.nom || ch.libelle || '';
          this._chantier.clientId = ch.clientId || null;
          this._chantier.adresse  = ch.adresse || ch.ville || '';
          const cli = DB.getAll(DB.KEYS.clients).find(c => c.id == ch.clientId);
          if (cli && cli.type) {
            this._profil = cli.type === 'particulier' ? 'particulier' : 'pro';
          } else {
            this._profil = null;
          }
        } else {
          this._chantier.nom      = '';
          this._chantier.clientId = null;
          this._chantier.adresse  = '';
          this._profil            = null;
        }
        this._renderChantier();
      });
    }
    this._bind();
  },

  // ── Étape 2 : Profil ──────────────────────────────────────
  _renderProfil() {
    const profils = [
      { id: 'particulier', label: 'Particulier',      icone: '🏠', desc: 'Maison, appartement, villa' },
      { id: 'pro',         label: 'Pro / Entreprise',  icone: '🏢', desc: 'Bureaux, dépôts, locaux' },
      { id: 'ao',          label: "Appel d'offres",    icone: '📋', desc: 'DPGF, marchés publics' },
    ];
    const cards = profils.map(p => {
      const sel = this._profil === p.id;
      return `<div data-cex-profil="${p.id}" style="flex:1;min-width:140px;padding:18px;border-radius:10px;border:2px solid ${sel ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'};background:${sel ? 'rgba(37,99,235,.06)' : 'var(--bg-card,#fff)'};cursor:pointer;text-align:center;transition:border .15s">
        <div style="font-size:2rem;margin-bottom:8px">${p.icone}</div>
        <div style="font-weight:700;margin-bottom:4px">${p.label}</div>
        <div style="font-size:.8rem;color:var(--text-secondary,#666)">${p.desc}</div>
      </div>`;
    }).join('');

    this._html(`
      ${this._progressBar('profil')}
      ${this._card(`
        <h2 style="margin:0 0 6px;font-size:1.1rem;font-weight:700">Type de chantier</h2>
        <p style="margin:0 0 8px;font-size:.85rem;color:var(--text-secondary,#666)">Chantier : <strong>${this._esc(this._chantier.nom)}</strong></p>
        ${this._profil && this._chantier.chantierId ? `<div style="font-size:.8rem;color:#16a34a;margin-bottom:12px">✓ Type détecté depuis le client — vous pouvez modifier si besoin</div>` : ''}
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          ${cards}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:20px">
          ${this._btn('← Retour', 'profil-retour', 'secondary')}
          ${this._btn('Suivant →', 'profil-suivant')}
        </div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 3 : Sous-traitants ──────────────────────────────
  _renderSousTraitants() {
    const sts = DB.getAll(DB.KEYS.sousTraitants).filter(s => s.actif !== false);

    const listeST = sts.map(s => {
      const sel   = this._sousTraitants.includes(s.id);
      const alert = !s.rcPro || !s.decennale;
      return `<label style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;border:1px solid var(--border,#e2e8f0);cursor:pointer;background:var(--bg-card,#fff)">
        <input type="checkbox" data-cex-st="${s.id}" ${sel ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer">
        <span style="flex:1;font-size:.9rem;font-weight:500">${this._esc(s.nom || s.raisonSociale || '')}</span>
        ${alert ? '<span style="font-size:.75rem;color:#ef4444;font-weight:600">⚠️ RC/décennale manquante</span>' : '<span style="font-size:.75rem;color:#16a34a">✓ Assurances OK</span>'}
        ${s.margePercent ? `<span style="font-size:.75rem;color:var(--text-secondary,#666)">${s.margePercent}% marge</span>` : ''}
      </label>`;
    }).join('');

    this._html(`
      ${this._progressBar('sousTraitants')}
      ${this._card(`
        <h2 style="margin:0 0 6px;font-size:1.1rem;font-weight:700">Sous-traitants</h2>
        <p style="margin:0 0 16px;font-size:.85rem;color:var(--text-secondary,#666)">Faites-vous appel à des sous-traitants sur ce chantier ?</p>
        ${sts.length === 0
          ? '<p style="color:var(--text-secondary,#666);font-size:.9rem;margin:0 0 12px">Aucun sous-traitant enregistré.</p>'
          : `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${listeST}</div>`
        }
        <button type="button" data-cex-action="creer-st" style="font-size:.85rem;color:var(--accent,#2563eb);background:none;border:1px solid var(--accent,#2563eb);border-radius:6px;cursor:pointer;padding:6px 14px">+ Créer un sous-traitant</button>
        <div style="display:flex;justify-content:space-between;margin-top:20px">
          ${this._btn('← Retour', 'st-retour', 'secondary')}
          ${this._btn('Suivant →', 'st-suivant')}
        </div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 4 : Corps de métiers ────────────────────────────
  _renderCorps() {
    const cards = this.CORPS.map(c => {
      const sel = this._corpsActifs.includes(c.id);
      return `<div data-cex-corps="${c.id}" style="flex:1;min-width:130px;padding:16px;border-radius:10px;border:2px solid ${sel ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'};background:${sel ? 'rgba(37,99,235,.06)' : 'var(--bg-card,#fff)'};cursor:pointer;text-align:center">
        <div style="font-size:1.8rem;margin-bottom:6px">${c.icone}</div>
        <div style="font-weight:600;font-size:.9rem">${c.label}</div>
        ${sel ? '<div style="font-size:.75rem;color:var(--accent,#2563eb);margin-top:4px">✓ Sélectionné</div>' : ''}
      </div>`;
    }).join('');

    const btnSuivant = this._corpsActifs.length > 0
      ? this._btn('Commencer le chiffrage →', 'corps-suivant')
      : '<button style="padding:10px 22px;border-radius:8px;border:none;background:var(--border,#ddd);color:var(--text-secondary,#999);font-weight:600;font-size:.9rem;cursor:not-allowed">Sélectionner au moins 1 corps</button>';

    this._html(`
      ${this._progressBar('corps')}
      ${this._card(`
        <h2 style="margin:0 0 6px;font-size:1.1rem;font-weight:700">Corps de métiers</h2>
        <p style="margin:0 0 16px;font-size:.85rem;color:var(--text-secondary,#666)">Sélectionnez les travaux à chiffrer sur ce chantier</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
          ${cards}
        </div>
        <div style="display:flex;justify-content:space-between">
          ${this._btn('← Retour', 'corps-retour', 'secondary')}
          ${btnSuivant}
        </div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 5 : Pièces par corps de métier ─────────────────
  _renderPieces() {
    const corps = this.CORPS.find(c => c.id === this._corpsActifs[this._corpsEnCours]);
    if (!corps) return;
    const listePieces = this.PIECES_PROFIL[this._profil] || this.PIECES_PROFIL.particulier;
    const piecesExistantes = this._pieces.filter(p => p.corps === corps.id);

    const items = listePieces.map(nom => {
      const sel = piecesExistantes.find(p => p.nom === nom);
      return `<div data-cex-piece="${this._esc(nom)}" style="padding:12px 16px;border-radius:8px;border:2px solid ${sel ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'};background:${sel ? 'rgba(37,99,235,.06)' : 'var(--bg-card,#1e2530)'};cursor:pointer;display:flex;align-items:center;justify-content:space-between">
        <span style="font-weight:500;font-size:.9rem">${nom}</span>
        ${sel ? `<span style="font-size:.8rem;color:var(--accent,#2563eb)">✓ ${sel.surface ? sel.surface + ' m²' : 'à métrager'}</span>` : ''}
      </div>`;
    }).join('');

    const progress = `${this._corpsEnCours + 1} / ${this._corpsActifs.length}`;
    const isLast   = this._corpsEnCours === this._corpsActifs.length - 1;

    this._html(`
      ${this._progressBar('pieces')}
      ${this._card(`
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <span style="font-size:1.5rem">${corps.icone}</span>
          <h2 style="margin:0;font-size:1.1rem;font-weight:700">${corps.label} — Pièces à chiffrer</h2>
          <span style="margin-left:auto;font-size:.8rem;color:var(--text-secondary,#666);background:var(--bg-secondary,#f8f9fa);padding:4px 10px;border-radius:20px">${progress}</span>
        </div>
        <p style="margin:0 0 16px;font-size:.85rem;color:var(--text-secondary,#666)">Sélectionnez les pièces à traiter — cliquez pour les métrager</p>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
          ${items}
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
          <input id="cex-piece-libre" type="text" placeholder="Autre pièce / lieu..." style="flex:1;padding:9px 14px;border-radius:8px;border:1px solid var(--border,#e2e8f0);font-size:.9rem;background:var(--bg-card,#1e2530);color:var(--text-main,#fff)">
          <button type="button" data-cex-action="piece-libre-add" style="padding:9px 16px;border-radius:8px;border:none;background:var(--accent,#2563eb);color:#fff;font-weight:600;cursor:pointer">+ Ajouter</button>
        </div>
        <div style="display:flex;justify-content:space-between">
          ${this._btn('← Retour', 'pieces-retour', 'secondary')}
          <div style="display:flex;gap:8px">
            ${this._corpsEnCours > 0 ? this._btn('← Corps précédent', 'corps-precedent', 'secondary') : ''}
            ${isLast ? this._btn('Voir le résumé →', 'pieces-terminer') : this._btn('Corps suivant →', 'corps-suivant-pieces')}
          </div>
        </div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 6 : Métrage par pièce ──────────────────────────
  _renderMetrage() {
    const p = this._pieceEnCours;
    if (!p) { this._renderEtape('pieces'); return; }
    const corps = this.CORPS.find(c => c.id === p.corps);
    const mode  = p.mode || 'rectangle';

    const btnMode = (id, label, icone) =>
      `<button type="button" data-cex-mode="${id}" style="flex:1;padding:10px;border-radius:8px;border:2px solid ${mode===id?'var(--accent,#2563eb)':'var(--border,#e2e8f0)'};background:${mode===id?'rgba(37,99,235,.06)':'var(--bg-card,#1e2530)'};cursor:pointer;color:#fff;font-size:.85rem;font-weight:${mode===id?'700':'400'}">
        <div style="font-size:1.3rem;margin-bottom:4px">${icone}</div>${label}
      </button>`;

    const champRect = `
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px">
        <div style="flex:1;min-width:120px">
          <label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">Longueur (m)</label>
          <input id="cex-m-l" type="number" min="0" step="0.1" value="${p.longueur||''}" placeholder="ex: 5.5"
            style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box">
        </div>
        <div style="flex:1;min-width:120px">
          <label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">Largeur (m)</label>
          <input id="cex-m-w" type="number" min="0" step="0.1" value="${p.largeur||''}" placeholder="ex: 3.8"
            style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box">
        </div>
      </div>
      <div id="cex-m-preview" style="font-size:.9rem;color:var(--accent,#2563eb);font-weight:600;min-height:22px"></div>`;

    const champL = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
        <div><label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">Longueur 1 (m)</label>
          <input id="cex-m-l1" type="number" min="0" step="0.1" value="${p.l1||''}" placeholder="ex: 6" style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box"></div>
        <div><label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">Largeur 1 (m)</label>
          <input id="cex-m-w1" type="number" min="0" step="0.1" value="${p.w1||''}" placeholder="ex: 4" style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box"></div>
        <div><label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">Longueur 2 (m)</label>
          <input id="cex-m-l2" type="number" min="0" step="0.1" value="${p.l2||''}" placeholder="ex: 3" style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box"></div>
        <div><label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">Largeur 2 (m)</label>
          <input id="cex-m-w2" type="number" min="0" step="0.1" value="${p.w2||''}" placeholder="ex: 2" style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box"></div>
      </div>
      <div id="cex-m-preview" style="font-size:.9rem;color:var(--accent,#2563eb);font-weight:600;min-height:22px"></div>`;

    const champs = mode === 'forme-l' ? champL : champRect;

    this._html(`
      ${this._progressBar('metrage')}
      ${this._card(`
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <span style="font-size:1.4rem">${corps ? corps.icone : ''}</span>
          <div>
            <h2 style="margin:0;font-size:1rem;font-weight:700">${this._esc(p.nom)}</h2>
            <div style="font-size:.8rem;color:var(--text-secondary,#666)">${corps ? corps.label : ''}</div>
          </div>
          ${p.surface ? `<span style="margin-left:auto;font-size:.9rem;color:#16a34a;font-weight:700">${p.surface} m²</span>` : ''}
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px">
          ${btnMode('rectangle','Rectangle','▬')}
          ${btnMode('forme-l','Forme en L','⌐')}
          ${btnMode('libre','Dessin libre','✏️')}
        </div>
        ${mode === 'libre'
          ? `<p style="color:var(--text-secondary,#666);font-size:.85rem">Le canvas polygonal sera disponible ici — utilisez Rectangle ou Forme en L pour l'instant.</p>`
          : champs}
        <div style="display:flex;justify-content:space-between;margin-top:16px">
          ${this._btn('← Retour', 'metrage-retour', 'secondary')}
          ${this._btn('✓ Valider la surface', 'metrage-valider')}
        </div>
      `)}
    `);

    const preview = () => {
      const el = this._container.querySelector('#cex-m-preview');
      if (!el) return;
      let s = 0;
      if (mode === 'rectangle') {
        const l = parseFloat((this._container.querySelector('#cex-m-l') || {}).value) || 0;
        const w = parseFloat((this._container.querySelector('#cex-m-w') || {}).value) || 0;
        s = Math.round(l * w * 100) / 100;
      } else if (mode === 'forme-l') {
        const l1 = parseFloat((this._container.querySelector('#cex-m-l1') || {}).value) || 0;
        const w1 = parseFloat((this._container.querySelector('#cex-m-w1') || {}).value) || 0;
        const l2 = parseFloat((this._container.querySelector('#cex-m-l2') || {}).value) || 0;
        const w2 = parseFloat((this._container.querySelector('#cex-m-w2') || {}).value) || 0;
        s = Math.round((l1 * w1 + l2 * w2) * 100) / 100;
      }
      el.textContent = s > 0 ? '→ Surface : ' + s + ' m²' : '';
    };
    this._container.querySelectorAll('input[type="number"]').forEach(i => i.addEventListener('input', preview));
    preview();
    this._bind();
  },

  // ── Gestion événements ────────────────────────────────────
  _bind() {
    document.addEventListener('click', e => {
      if (!this._container || !this._container.contains(e.target)) return;

      // Actions boutons
      const btn = e.target.closest('[data-cex-action]');
      if (btn) {
        const action = btn.dataset.cexAction;
        if (action === 'chantier-suivant') {
          const chantierId = (this._container.querySelector('#cex-chantier-id') || {}).value;
          if (chantierId) {
            if (!this._profil) {
              const cli = DB.getAll(DB.KEYS.clients).find(c => c.id == this._chantier.clientId);
              if (cli && !cli.type) {
                if (typeof App !== 'undefined' && App.toast) App.toast("⚠️ Ce client n'a pas de type renseigné — veuillez compléter sa fiche", 'warning');
                setTimeout(() => { if (typeof App !== 'undefined') App.navigate('clients'); }, 1800);
                return;
              }
            }
            this._renderEtape('profil');
            return;
          }
          const nom     = ((this._container.querySelector('#cex-chantier-nom') || {}).value || '').trim();
          const client  = (this._container.querySelector('#cex-client-id') || {}).value;
          const adresse = ((this._container.querySelector('#cex-chantier-adresse') || {}).value || '').trim();
          if (!nom) { if (typeof App !== 'undefined' && App.toast) App.toast('Saisissez un nom de chantier', 'warning'); return; }
          this._chantier = { nom, clientId: client || null, chantierId: null, adresse };
          this._renderEtape('profil');
        }
        if (action === 'chantier-annuler') { if (typeof App !== 'undefined') App.navigate('dashboard'); return; }
        if (action === 'profil-retour')  this._renderEtape('chantier');
        if (action === 'profil-suivant') {
          if (!this._profil) { if (typeof App !== 'undefined' && App.toast) App.toast('Choisissez un type de chantier', 'warning'); return; }
          this._renderEtape('sousTraitants');
        }
        if (action === 'st-retour')  this._renderEtape('profil');
        if (action === 'st-suivant') {
          this._sousTraitants = [];
          this._container.querySelectorAll('[data-cex-st]:checked').forEach(cb => {
            this._sousTraitants.push(parseInt(cb.dataset.cexSt));
          });
          this._renderEtape('corps');
        }
        if (action === 'corps-retour')  this._renderEtape('sousTraitants');
        if (action === 'corps-suivant') {
          if (!this._corpsActifs.length) { if (typeof App !== 'undefined' && App.toast) App.toast('Sélectionnez au moins un corps de métier', 'warning'); return; }
          this._corpsEnCours = 0;
          this._renderEtape('pieces');
        }
        if (action === 'creer-st')       { if (typeof App !== 'undefined') App.navigate('sousTraitants'); }
        if (action === 'nouveau-client')   { if (typeof App !== 'undefined') App.navigate('clients'); }
        if (action === 'nouveau-chantier') { if (typeof App !== 'undefined') App.navigate('chantiers'); }
        if (action === 'metrage-retour')  { this._renderEtape('pieces'); return; }
        if (action === 'metrage-valider') {
          const p    = this._pieceEnCours;
          const mode = p ? (p.mode || 'rectangle') : 'rectangle';
          let s = 0;
          if (mode === 'rectangle') {
            const l = parseFloat((this._container.querySelector('#cex-m-l') || {}).value) || 0;
            const w = parseFloat((this._container.querySelector('#cex-m-w') || {}).value) || 0;
            s = Math.round(l * w * 100) / 100;
            if (p) { p.longueur = l; p.largeur = w; }
          } else if (mode === 'forme-l') {
            const l1 = parseFloat((this._container.querySelector('#cex-m-l1') || {}).value) || 0;
            const w1 = parseFloat((this._container.querySelector('#cex-m-w1') || {}).value) || 0;
            const l2 = parseFloat((this._container.querySelector('#cex-m-l2') || {}).value) || 0;
            const w2 = parseFloat((this._container.querySelector('#cex-m-w2') || {}).value) || 0;
            s = Math.round((l1 * w1 + l2 * w2) * 100) / 100;
            if (p) { p.l1=l1; p.w1=w1; p.l2=l2; p.w2=w2; }
          }
          if (!s) { if (typeof App !== 'undefined' && App.toast) App.toast('Saisissez les dimensions', 'warning'); return; }
          if (p) { p.surface = s; p.mode = mode; }
          this._renderEtape('pieces');
          return;
        }
        if (action === 'pieces-retour')        this._renderEtape('corps');
        if (action === 'corps-precedent')      { this._corpsEnCours--; this._renderEtape('pieces'); }
        if (action === 'corps-suivant-pieces') { this._corpsEnCours++; this._renderEtape('pieces'); }
        if (action === 'pieces-terminer')      { if (typeof App !== 'undefined' && App.toast) App.toast('Résumé — à implémenter', 'success'); }
        if (action === 'piece-libre-add') {
          const input = this._container.querySelector('#cex-piece-libre');
          const val   = (input ? input.value : '').trim();
          if (!val) return;
          const corpsId = this._corpsActifs[this._corpsEnCours];
          if (!this._pieces.find(p => p.nom === val && p.corps === corpsId)) {
            this._pieces.push({ nom: val, corps: corpsId, surface: null });
          }
          if (input) input.value = '';
          this._renderEtape('pieces');
        }
        return;
      }

      // Sélection profil
      const profil = e.target.closest('[data-cex-profil]');
      if (profil) {
        this._profil = profil.dataset.cexProfil;
        this._renderEtape('profil');
        return;
      }

      // Sélection mode métrage
      const modeBtn = e.target.closest('[data-cex-mode]');
      if (modeBtn && this._pieceEnCours) {
        this._pieceEnCours.mode = modeBtn.dataset.cexMode;
        this._renderEtape('metrage');
        return;
      }

      // Clic pièce → sélectionner + ouvrir métrage
      const piece = e.target.closest('[data-cex-piece]');
      if (piece) {
        const nom     = piece.dataset.cexPiece;
        const corpsId = this._corpsActifs[this._corpsEnCours];
        const idx     = this._pieces.findIndex(p => p.nom === nom && p.corps === corpsId);
        if (idx >= 0) {
          this._pieceEnCours = this._pieces[idx];
        } else {
          const newPiece = { nom, corps: corpsId, surface: null, mode: 'rectangle' };
          this._pieces.push(newPiece);
          this._pieceEnCours = newPiece;
        }
        this._renderEtape('metrage');
        return;
      }

      // Toggle corps de métier
      const corps = e.target.closest('[data-cex-corps]');
      if (corps) {
        const id  = corps.dataset.cexCorps;
        const idx = this._corpsActifs.indexOf(id);
        if (idx >= 0) this._corpsActifs.splice(idx, 1);
        else this._corpsActifs.push(id);
        this._renderCorps();
        return;
      }
    });
  },

};

window.CalcExpressV2 = CalcExpressV2;
