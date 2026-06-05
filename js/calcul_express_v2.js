/**
 * PlaqPro+ — Calcul Express V2
 * Flux : chantier + client → profil → sous-traitants → corps métiers → pièces → Métrage → résultat
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
  _bindController: null,

  // ── Corps disponibles ─────────────────────────────────────
  CORPS: [
    { id: 'plaquisterie', label: 'Plâtrerie', icone: '🧱' },
    { id: 'peinture',     label: 'Peinture',     icone: '🎨' },
    { id: 'electricite',  label: 'Électricité',  icone: '⚡' },
    { id: 'plomberie',    label: 'Plomberie',    icone: '🔧' },
    { id: 'maconnerie',   label: 'Maçonnerie',   icone: '🏗' },
    { id: 'paysagisme',   label: 'Paysagisme',   icone: '🌿' },
  ],

  // ── Pièces par profil ─────────────────────────────────────
  PIECES_PROFIL: {
    particulier: ['Buanderie', 'Cave', 'Chambre 1', 'Chambre 2', 'Chambre 3',
                  'Couloir', 'Cuisine', 'Entrée', 'Garage', 'Salon',
                  'Salle de bain', 'Séjour', 'WC'],
    pro: [
      'Accueil',
      'Bureau',
      'Couloir',
      'Dépôt',
      'Espace commun',
      'Espace pause',
      'Hall',
      'Local informatique',
      'Local technique',
      'Salle de conférence',
      'Salle de réunion',
      'Sanitaires',
      'Show-room',
    ],
    ao:          [],
  },

  // ── Appareillage par corps (électricité + plomberie) ─────
  APPAREILLAGE: {
    electricite: [
      { id:'prise_simple',    label:'Prise simple',            icone:'🔌', cat:'Prises' },
      { id:'prise_double',    label:'Prise double',            icone:'🔌', cat:'Prises' },
      { id:'prise_double_usb',label:'Prise double + USB',      icone:'🔌', cat:'Prises' },
      { id:'prise_20a',       label:'Prise 20A (cuisine)',     icone:'🔌', cat:'Prises' },
      { id:'prise_etanche',   label:'Prise étanche ext.',      icone:'🔌', cat:'Prises' },
      { id:'prise_rj45',      label:'Prise RJ45',              icone:'🌐', cat:'Prises' },
      { id:'inter_simple',    label:'Interrupteur simple',     icone:'💡', cat:'Commandes' },
      { id:'inter_vv',        label:'Va-et-vient',             icone:'💡', cat:'Commandes' },
      { id:'inter_double',    label:'Interrupteur double',     icone:'💡', cat:'Commandes' },
      { id:'variateur',       label:'Variateur',               icone:'💡', cat:'Commandes' },
      { id:'inter_etanche',   label:'Interrupteur étanche',    icone:'💡', cat:'Commandes' },
      { id:'point_dcl',       label:'Point lumineux DCL',      icone:'🔆', cat:'Éclairage' },
      { id:'spot_encastre',   label:'Spot encastré',           icone:'🔆', cat:'Éclairage' },
      { id:'applique',        label:'Applique murale',         icone:'🔆', cat:'Éclairage' },
      { id:'hublot_ext',      label:'Hublot extérieur',        icone:'🔆', cat:'Éclairage' },
      { id:'tableau_13m',     label:'Tableau 13 modules',      icone:'⚡', cat:'Tableau' },
      { id:'tableau_26m',     label:'Tableau 26 modules',      icone:'⚡', cat:'Tableau' },
      { id:'disjoncteur',     label:'Disjoncteur différentiel',icone:'⚡', cat:'Tableau' },
      { id:'vmc',             label:'VMC simple flux',         icone:'💨', cat:'Divers' },
      { id:'chauffe_eau',     label:'Chauffe-eau électrique',  icone:'🌡', cat:'Divers' },
    ],
    plomberie: [
      { id:'wc_standard',     label:'WC standard',             icone:'🚽', cat:'Sanitaires' },
      { id:'wc_suspendu',     label:'WC suspendu',             icone:'🚽', cat:'Sanitaires' },
      { id:'lavabo',          label:'Lavabo',                  icone:'🚿', cat:'Sanitaires' },
      { id:'evier_1bac',      label:'Évier 1 bac',             icone:'🚿', cat:'Sanitaires' },
      { id:'evier_2bacs',     label:'Évier 2 bacs',            icone:'🚿', cat:'Sanitaires' },
      { id:'douche_receveur', label:'Receveur douche',         icone:'🚿', cat:'Sanitaires' },
      { id:'douche_italienne',label:"Douche à l'italienne",    icone:'🚿', cat:'Sanitaires' },
      { id:'baignoire',       label:'Baignoire',               icone:'🛁', cat:'Sanitaires' },
      { id:'baignoire_balneo',label:'Baignoire balnéo',        icone:'🛁', cat:'Sanitaires' },
      { id:'lave_linge',      label:'Arrivée lave-linge',      icone:'🔧', cat:'Raccordements' },
      { id:'lave_vaisselle',  label:'Arrivée lave-vaisselle',  icone:'🔧', cat:'Raccordements' },
      { id:'robinet_ext',     label:'Robinet extérieur',       icone:'🔧', cat:'Raccordements' },
      { id:'mitigeur_lavabo', label:'Mitigeur lavabo',         icone:'🔧', cat:'Robinetterie' },
      { id:'mitigeur_douche', label:'Mitigeur douche',         icone:'🔧', cat:'Robinetterie' },
      { id:'mitigeur_evier',  label:'Mitigeur évier',          icone:'🔧', cat:'Robinetterie' },
      { id:'nourrice',        label:'Nourrice distribution',   icone:'🔧', cat:'Divers' },
      { id:'vanne_arret',     label:"Vanne d'arrêt",           icone:'🔧', cat:'Divers' },
    ],
  },

  // ── Linéaires neuf par corps ──────────────────────────────
  LINEAIRES: {
    electricite: [
      { id:'cable_15',  label:'Câble 1.5mm² (éclairage)', unite:'ml', placeholder:'ex: 80' },
      { id:'cable_25',  label:'Câble 2.5mm² (prises)',    unite:'ml', placeholder:'ex: 120' },
      { id:'gaine_irl', label:'Gaine IRL (optionnel)',    unite:'ml', placeholder:'ex: 60' },
    ],
    plomberie: [
      { id:'per_16',    label:'Alimentation PER 16',      unite:'ml', placeholder:'ex: 25' },
      { id:'per_20',    label:'Alimentation PER 20',      unite:'ml', placeholder:'ex: 15' },
      { id:'pvc_40',    label:'Évacuation PVC 40',        unite:'ml', placeholder:'ex: 12' },
      { id:'pvc_100',   label:'Évacuation PVC 100',       unite:'ml', placeholder:'ex: 8' },
    ],
  },

  // ── Lieux par corps de métier (prioritaire sur profil) ────
  LIEUX_CORPS: {
    paysagisme:  ['Aire de jeux', 'Allée', 'Bassin / pièce d\'eau', 'Clôture',
                  'Haie', 'Jardin arrière', 'Jardin avant', 'Massif fleuri',
                  'Parking', 'Pelouse', 'Potager', 'Talus', 'Terrasse', 'Zone boisée'],
    maconnerie_int: {
      pieces: ['Chambre', 'Couloir', 'Cuisine', 'Entrée', 'Salle de bain', 'Salon', 'Séjour'],
      prestations: ['Cloison briques', 'Cloison brique de verre', 'Mur porteur', 'Doublage'],
    },
    maconnerie_ext: {
      zones: ['Façade', 'Mur de clôture', 'Mur pignon', 'Soubassement', 'Terrasse béton'],
      prestations: ['Enduit façade', 'Ravalement', 'Parpaing', 'Brique de parement'],
    },
    electricite: ['Cave', 'Chambre 1', 'Chambre 2', 'Cuisine', 'Extérieur',
                  'Garage', 'Salle de bain', 'Salon', 'Séjour', 'Tableau principal',
                  'Tableau secondaire'],
    plomberie:   ['Buanderie', 'Cave', 'Chaufferie', 'Cuisine', 'Extérieur',
                  'Garage', 'Salle de bain 1', 'Salle de bain 2', 'WC'],
  },

  PRESTATIONS_PAYSAGISME: {
    'Aire de jeux':         ['OUV_AIRE_JEUX_SOL','OUV_GAZON_ROULEAU','OUV_TERRASSEMENT_PREP'],
    'Allée':                ['OUV_ALLEE_GRAVIERS','OUV_ALLEE_DALLAGE','OUV_BORDURE_JARDIN'],
    "Bassin / pièce d'eau": ['OUV_BASSIN_PREFAB','OUV_TERRASSEMENT_PREP'],
    'Clôture':              ['OUV_CLOTURE_BETON','OUV_CLOTURE_BOIS','OUV_HAIE_PLANTATION'],
    'Haie':                 ['OUV_HAIE_PLANTATION','OUV_TERRASSEMENT_PREP'],
    'Jardin arrière':       ['OUV_GAZON_ROULEAU','OUV_MASSIF_PAILLAGE','OUV_TERRASSEMENT_PREP','OUV_BORDURE_JARDIN'],
    'Jardin avant':         ['OUV_GAZON_ROULEAU','OUV_MASSIF_PAILLAGE','OUV_TERRASSEMENT_PREP','OUV_BORDURE_JARDIN'],
    'Massif fleuri':        ['OUV_MASSIF_PAILLAGE','OUV_BORDURE_JARDIN','OUV_TERRASSEMENT_PREP'],
    'Parking':              ['OUV_PARKING_STABILISE','OUV_ALLEE_DALLAGE','OUV_TERRASSE_BETON_DESACTIVE'],
    'Pelouse':              ['OUV_GAZON_ROULEAU','OUV_TERRASSEMENT_PREP','OUV_TALUS_ENGAZONNEMENT'],
    'Potager':              ['OUV_POTAGER_CARRE','OUV_TERRASSEMENT_PREP','OUV_BORDURE_JARDIN'],
    'Talus':                ['OUV_TALUS_ENGAZONNEMENT','OUV_HAIE_PLANTATION','OUV_TERRASSEMENT_PREP'],
    'Terrasse':             ['OUV_TERRASSE_BETON_DESACTIVE','OUV_ALLEE_DALLAGE','OUV_BORDURE_JARDIN'],
    'Zone boisée':          ['OUV_HAIE_PLANTATION','OUV_TERRASSEMENT_PREP','OUV_MASSIF_PAILLAGE'],
    'Terrasse extérieure':      ['OUV_TERRASSE_BETON_DESACTIVE','OUV_ALLEE_DALLAGE','OUV_BORDURE_JARDIN'],
    'Aire de stationnement':    ['OUV_PARKING_STABILISE','OUV_ALLEE_DALLAGE','OUV_TERRASSEMENT_PREP'],
    'Clôture périmétrique':     ['OUV_CLOTURE_BETON','OUV_CLOTURE_BOIS','OUV_HAIE_PLANTATION'],
    'Espace vert commun':       ['OUV_GAZON_ROULEAU','OUV_MASSIF_PAILLAGE','OUV_TERRASSEMENT_PREP'],
    'Façade végétalisée':       ['OUV_HAIE_PLANTATION','OUV_MASSIF_PAILLAGE','OUV_TERRASSEMENT_PREP'],
    'Accès principal':          ['OUV_ALLEE_GRAVIERS','OUV_ALLEE_DALLAGE','OUV_BORDURE_JARDIN'],
    'Zone de livraison':        ['OUV_PARKING_STABILISE','OUV_ALLEE_DALLAGE','OUV_TERRASSEMENT_PREP'],
    'Zone de stockage extérieur':['OUV_DALLE_BETON_12CM','OUV_TERRASSEMENT_PREP','OUV_PARKING_STABILISE'],
  },

  // ── Obtenir la liste de lieux pour un corps + profil ──────
  _getLieux(corpsId, profil) {
    if (corpsId === 'maconnerie') {
      if (profil === 'pro') {
        const key = (this._corpsConfig[corpsId] || {}).lieuxKey || 'maconnerie_ext';
        return key === 'maconnerie_int'
          ? {
              pieces: ['Cage d\'escalier', 'Cloison de séparation', 'Couloir', 'Hall d\'entrée',
                       'Local technique', 'Mur coupe-feu', 'Mur porteur', 'Sas d\'entrée'],
              prestations: ['Cloison briques', 'Cloison brique de verre', 'Mur porteur', 'Doublage'],
            }
          : {
              zones: ['Bardage façade', 'Clôture périmétrique', 'Dalle extérieure',
                      'Façade principale', 'Mur de soutènement', 'Portail entrée',
                      'Quai de chargement', 'Voirie interne'],
              prestations: ['Enduit façade', 'Ravalement', 'Parpaing', 'Brique de parement'],
            };
      }
      const key = (this._corpsConfig[corpsId] || {}).lieuxKey || 'maconnerie_ext';
      return this.LIEUX_CORPS[key] || [];
    }
    if (corpsId === 'electricite') {
      return profil === 'pro'
        ? ['Accueil', 'Bureau', 'Couloir', 'Dépôt', 'Espace commun', 'Espace pause',
           'Hall', 'Local informatique', 'Local technique', 'Salle de conférence',
           'Salle de réunion', 'Sanitaires', 'Show-room', 'Tableau divisionnaire',
           'Tableau général']
        : this.LIEUX_CORPS.electricite;
    }
    if (corpsId === 'plomberie') {
      return profil === 'pro'
        ? ['Espace pause', 'Local technique', 'Sanitaires hommes',
           'Sanitaires femmes', 'Sanitaires PMR', 'Salle de pause',
           'Cuisine professionnelle', 'Buanderie', 'Local nettoyage']
        : this.LIEUX_CORPS.plomberie;
    }
    if (corpsId === 'paysagisme') {
      return profil === 'pro'
        ? ['Accès principal', 'Aire de stationnement', 'Clôture périmétrique',
           'Espace vert commun', 'Façade végétalisée', 'Parking',
           'Terrasse extérieure', 'Zone de livraison', 'Zone de stockage extérieur']
        : this.LIEUX_CORPS.paysagisme;
    }
    if (this.LIEUX_CORPS[corpsId]) return this.LIEUX_CORPS[corpsId];
    return this.PIECES_PROFIL[profil] || this.PIECES_PROFIL.particulier;
  },

  _getOuvragePrestation(prestation) {
    const map = {
      'Cloison briques': 'OUV_MUR_PARPAING_20',
      'Cloison brique de verre': 'OUV_MUR_PARPAING_20',
      'Mur porteur': 'OUV_MUR_PARPAING_20',
      'Doublage': 'OUV_MUR_PARPAING_20',
      'Soubassement': 'OUV_MUR_PARPAING_20',
      'Enduit façade': 'OUV_ENDUIT_MONOCOUCHE',
      'Ravalement': 'OUV_ENDUIT_MONOCOUCHE',
      'Parpaing': 'OUV_MUR_PARPAING_20',
      'Brique de parement': 'OUV_MUR_PARPAING_20',
      'Béton banché': 'OUV_MUR_PARPAING_20',
      'Terrasse béton': 'OUV_DALLE_BETON_12CM',
    };
    return map[prestation] || null;
  },

  // ── Entrée ────────────────────────────────────────────────
  init(containerId) {
    this._containerId = containerId;
    this._container   = document.getElementById(containerId);
    if (!this._container) return;
    if (this._chiffrageCharge) {
      if (this._bindController) this._bindController.abort();
      this._bindController = null;
      this._renderEtape('resume');
      this._chiffrageCharge = false;
      return;
    }
    this._chantier      = { nom: '', clientId: null, adresse: '' };
    this._profil        = null;
    this._sousTraitants = [];
    this._corpsActifs   = [];
    this._pieces        = [];
    this._resultats     = {};
    if (this._bindController) this._bindController.abort();
    this._bindController = null;
    this._corpsEnCours  = 0;
    this._pieceEnCours  = null;
    this._corpsConfig   = {};
    this._chiffrageEnModification = false;
    this._renderEtape('chantier');
  },

  chargerChiffrage(chiffrageId) {
    const liste = JSON.parse(localStorage.getItem('plaqpro_chiffrages') || '[]');
    const c = chiffrageId
      ? liste.find(x => x.id === chiffrageId)
      : liste[0];
    if (!c) return false;
    // Restaurer l'état complet
    this._chantier    = c.chantier    || { nom:'', clientId:null, adresse:'' };
    this._corpsActifs = c.corpsActifs || [];
    this._pieces      = (c.pieces     || []).map(p => {
      const piece = {
        ...p,
        quantites: p.quantites || {},
      };
      if ((piece.corps === 'electricite' || piece.corps === 'plomberie') &&
          parseFloat(piece.surface) > 0 &&
          (!piece.quantites || !Object.keys(piece.quantites).length)) {
        piece.quantites = { _total: piece.surface };
        piece.nbPoints = piece.surface;
      }
      return piece;
    });
    this._lastResume  = c.resume      || {};
    if (c.devisId && !this._lastResume.devisId) this._lastResume.devisId = c.devisId;
    this._profil      = c.profil      || 'particulier';
    this._corpsConfig = c.corpsConfig || {};
    // Démarrer à l'étape résumé pour review
    this._corpsEnCours = 0;
    this._etapeEnCours = 'resume';
    this._chiffrageCharge = true;
    this._chiffrageEnModification = true;
    return true;
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
      typeCorps:     () => this._renderTypeCorps(),
      appareillage:  () => this._renderAppareillage(),
      metrage:       () => this._renderMetrage(),
      resume:        () => this._renderResume(),
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
    const clients    = (typeof DB.getClients === 'function' ? DB.getClients() : DB.getAll(DB.KEYS.clients)).filter(c => c.actif !== false);
    const chantiers  = DB.getAll(DB.KEYS.chantiers).filter(c => c.actif !== false);
    const chantierId = this._chantier.chantierId;

    const optChantier = chantiers.map(c =>
      `<option value="${c.id}" ${c.id == chantierId ? 'selected' : ''}>${this._esc(c.nom || c.libelle || '')}</option>`
    ).join('');
    const optClient = clients.map(c =>
      `<option value="${c.id}" ${c.id == this._chantier.clientId ? 'selected' : ''}>${this._esc(c.nom || c.raisonSociale || '')}</option>`
    ).join('');

    const inputStyle = 'width:100%;padding:11px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;font-size:.95rem;box-sizing:border-box;outline:none';
    const row = (label, field) => `
      <div style="display:grid;grid-template-columns:minmax(130px,30%) 1fr;gap:16px;align-items:center">
        <label style="font-size:.9rem;font-weight:650;color:#fff">${label}</label>
        <div>${field}</div>
      </div>`;

    this._html(`
      <div style="background:var(--bg,#0f0f1a);padding:24px;border-radius:0;color:#fff">
        <h2 style="margin:0 0 22px;font-size:1.15rem;font-weight:750;color:#fff">Nouveau chiffrage</h2>
        <div style="display:flex;flex-direction:column;gap:16px">
          ${row('Chantier existant', `
            <div style="display:flex;gap:12px;align-items:center">
            <select id="cex-chantier-id"
              style="${inputStyle}">
              <option value="">-- Nouveau chantier --</option>
              ${optChantier}
            </select>
              <button type="button" data-cex-action="nouveau-chantier" style="white-space:nowrap;font-size:.85rem;color:var(--accent,#22d3ee);background:none;border:none;cursor:pointer;padding:0">+ Créer un chantier</button>
            </div>
          `)}
          ${row('Client *', `
            <div style="display:flex;gap:12px;align-items:center">
              <select id="cex-client-select" style="${inputStyle}">
                <option value="">-- Sélectionner un client --</option>
                ${optClient}
              </select>
              <button type="button" data-cex-action="nouveau-client" style="white-space:nowrap;font-size:.85rem;color:var(--accent,#22d3ee);background:none;border:none;cursor:pointer;padding:0">+ Nouveau client</button>
            </div>
          `)}
          ${row('Nom du chantier *', `
            <input id="cex-nom-chantier" type="text" placeholder="ex : Rénovation villa Martin" value="${this._esc(this._chantier.nom)}" style="${inputStyle}">
          `)}
          ${row('Adresse', `
            <input id="cex-adresse" type="text" placeholder="ex : 12 rue des Acacias, Lyon" value="${this._esc(this._chantier.adresse)}" style="${inputStyle}">
          `)}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:24px">
          ${this._btn('✕ Annuler', 'chantier-annuler', 'secondary')}
          ${this._btn('Suivant →', 'chantier-suivant')}
        </div>
      </div>
    `);

    const sel = this._container.querySelector('#cex-chantier-id');
    if (sel) {
      sel.addEventListener('change', () => {
        const id = sel.value;
        const ch = id ? DB.getChantier(parseInt(id)) : null;
        this._chantier.chantierId = id || null;
        if (ch) {
          this._chantier.nom      = ch.nom || ch.libelle || '';
          this._chantier.clientId = ch.clientId || null;
          this._chantier.adresse  = ch.adresse || ch.ville || '';
          const clientSelect = document.getElementById('cex-client-select');
          const nomInput     = document.getElementById('cex-nom-chantier');
          const adresseInput = document.getElementById('cex-adresse');
          if (clientSelect) clientSelect.value = ch.clientId || '';
          if (nomInput) nomInput.value = ch.nom || ch.libelle || '';
          if (adresseInput) adresseInput.value = ch.adresse || ch.ville || '';
          const cli = DB.getClient(parseInt(ch.clientId));
          if (cli && cli.type) {
            this._profil = cli.type === 'particulier' ? 'particulier' : 'pro';
          } else {
            this._profil = null;
          }
        } else {
          this._chantier.chantierId = null;
        }
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
    const traites = this._corpsActifs.filter(id =>
      this._pieces.some(p => p.corps === id && p.surface)
    );
    const cards = this.CORPS.map(c => {
      const traite = traites.includes(c.id);
      return `<div data-cex-corps="${c.id}" style="flex:1;min-width:130px;padding:16px;border-radius:10px;border:2px solid ${traite ? '#16a34a' : 'var(--border,#e2e8f0)'};background:${traite ? 'rgba(22,163,74,.06)' : 'var(--bg-card,#1e2530)'};cursor:pointer;text-align:center;position:relative">
        ${traite ? '<div style="position:absolute;top:8px;right:8px;color:#16a34a;font-size:1rem">✓</div>' : ''}
        <div style="font-size:1.8rem;margin-bottom:6px">${c.icone}</div>
        <div style="font-weight:600;font-size:.9rem">${c.label}</div>
        <div style="font-size:.75rem;margin-top:4px;color:${traite ? '#16a34a' : 'var(--text-secondary,#666)'}">${traite ? 'Traité — cliquer pour modifier' : 'Cliquer pour chiffrer'}</div>
      </div>`;
    }).join('');

    const nbTraites = traites.length;
    const btnTerminer = nbTraites > 0 ? this._btn('Terminer le devis →', 'corps-terminer') : '';

    this._html(`
      ${this._progressBar('corps')}
      ${this._card(`
        <h2 style="margin:0 0 6px;font-size:1.1rem;font-weight:700">Corps de métiers</h2>
        <p style="margin:0 0 16px;font-size:.85rem;color:var(--text-secondary,#666)">Cliquez sur un corps pour saisir les Métrage — revenez ici pour en chiffrer un autre</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
          ${cards}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          ${this._btn('← Retour', 'corps-retour', 'secondary')}
          <div style="display:flex;gap:8px;align-items:center">
            ${nbTraites > 0 ? `<span style="font-size:.85rem;color:#16a34a">${nbTraites} corps traité${nbTraites>1?'s':''}</span>` : ''}
            ${btnTerminer}
          </div>
        </div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 5 : Pièces par corps de métier ─────────────────
  _renderPieces() {
    const corps = this.CORPS.find(c => c.id === this._corpsActifs[this._corpsEnCours]);
    if (!corps) return;
    const lieuxConfig = this._getLieux(corps ? corps.id : '', this._profil);
    const listePieces = Array.isArray(lieuxConfig) ? lieuxConfig : (lieuxConfig.pieces || lieuxConfig.zones || []);
    const prestationsMaconnerie = (!Array.isArray(lieuxConfig) && lieuxConfig.prestations) ? lieuxConfig.prestations : [];
    const piecesExistantes = this._pieces.filter(p => p.corps === corps.id);

    const piecesPlaco = corps.id === 'peinture'
      ? this._pieces.filter(p => p.corps === 'plaquisterie' && (p.surface_sol || p.surface))
      : [];

    const corpsId = corps.id;
    const isUnite = ['electricite','plomberie'].includes(corpsId);
    const isMaconnerie = corps.id === 'maconnerie';
    const items = listePieces.map(nom => {
      const sel  = piecesExistantes.find(p => p.nom === nom);
      const p = sel || {};
      const estElecPlomb = (corpsId === 'electricite' || corpsId === 'plomberie');
      const nbPts = estElecPlomb
        ? Object.values(p.quantites || {}).reduce((s,v) => s + (parseInt(v) || 0), 0)
        : 0;
      const dejaFait = (parseFloat(p.surface) || 0) > 0 || (parseFloat(p.nbPoints) || 0) > 0 || nbPts > 0;
      const valeurAffichee = estElecPlomb
        ? (nbPts > 0 ? nbPts + ' pts' : '')
        : ((parseFloat(p.surface) || 0) > 0 ? p.surface + ' m²' : '');
      const badge = valeurAffichee
        ? `<span style="background:var(--success,#22c55e);color:#fff;border-radius:12px;padding:2px 8px;font-size:11px;margin-left:8px">✅ ${valeurAffichee}</span>`
        : '';
      const prestBadge = p.prestation
        ? `<span style="background:var(--accent,#4f8ef7);color:#fff;border-radius:12px;padding:2px 8px;font-size:11px;margin-left:4px">${this._esc(p.prestation)}</span>`
        : '';
      const tacheBadge = p.tachePaysagisme && typeof BddV2 !== 'undefined'
        ? `<span style="background:var(--accent,#4f8ef7);color:#fff;border-radius:12px;padding:2px 8px;font-size:11px;margin-left:4px">${this._esc(((BddV2.getOuvrage(p.tachePaysagisme) || { designation: p.tachePaysagisme }).designation))}</span>`
        : '';
      const badges = badge + prestBadge + tacheBadge;
      if (isMaconnerie) {
        const ouvert = this._pieceMaconnerieSelection === nom;
        const selectPrestation = ouvert ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">
            <select id="cex-maconnerie-prestation" data-cex-prestation-piece="${this._esc(nom)}" style="flex:1;min-width:220px;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.9rem;box-sizing:border-box">
              <option value="">-- Prestation à chiffrer --</option>
              ${prestationsMaconnerie.map(prestation => '<option value="' + this._esc(prestation) + '" ' + (sel && sel.prestation === prestation ? 'selected' : '') + '>' + prestation + '</option>').join('')}
            </select>
            ${this._btn('Chiffrer', 'maconnerie-prestation-valider')}
          </div>` : '';
        return `<div style="padding:12px 16px;border-radius:8px;border:2px solid ${sel ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'};background:${sel ? 'rgba(37,99,235,.06)' : 'var(--bg-card,#1e2530)'}">
          <div data-cex-piece="${this._esc(nom)}" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between">
            <span style="font-weight:500;font-size:.9rem;display:flex;align-items:center;flex-wrap:wrap">${nom}${badges}</span>
            ${sel || dejaFait ? '<span style="font-size:.8rem;color:var(--accent,#2563eb)">✓</span>' : '<span style="font-size:.8rem;color:var(--text-secondary,#666)">Choisir prestation</span>'}
          </div>
          ${selectPrestation}
        </div>`;
      }
      return `<div data-cex-piece="${this._esc(nom)}" style="padding:12px 16px;border-radius:8px;border:2px solid ${sel ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'};background:${sel ? 'rgba(37,99,235,.06)' : 'var(--bg-card,#1e2530)'};cursor:pointer;display:flex;align-items:center;justify-content:space-between">
        <span style="font-weight:500;font-size:.9rem;display:flex;align-items:center;flex-wrap:wrap">${nom}${badges}</span>
        ${sel || dejaFait ? '<span style="font-size:.8rem;color:var(--accent,#2563eb)">✓</span>' : ''}
      </div>`;
    }).join('');

    const progress = `${this._corpsEnCours + 1} / ${this._corpsActifs.length}`;
    const isLast   = this._corpsEnCours === this._corpsActifs.length - 1;

    this._html(`
      ${this._progressBar('pieces')}
      ${this._card(`
        <div style="position:sticky;top:0;z-index:10;background:var(--bg,#0f0f1a);padding:12px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.1));display:flex;align-items:center;gap:10px;margin:-16px -16px 16px">
          <span style="font-size:1.5rem">${corps.icone}</span>
          <h2 style="margin:0;font-size:1.1rem;font-weight:700">${corps.label} — Pièces à chiffrer</h2>
          <span style="margin-left:auto;font-size:.8rem;color:var(--text-secondary,#666);background:var(--bg-secondary,#f8f9fa);padding:4px 10px;border-radius:20px">${progress}</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
            ${this._btn('← Retour', 'pieces-retour', 'secondary')}
            ${this._btn('↩ Retour corps de métiers', 'pieces-vers-corps')}
          </div>
        </div>
        <p style="margin:0 0 16px;font-size:.85rem;color:var(--text-secondary,#666)">Sélectionnez les pièces à traiter — cliquez pour les Métrage</p>
        ${piecesPlaco.length > 0 ? `
        <div style="background:rgba(37,99,235,.08);border:1px solid var(--accent,#2563eb);border-radius:8px;padding:12px 16px;margin-bottom:12px">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">
            <div>
              <div style="font-size:.85rem;font-weight:600;color:var(--accent,#2563eb)">📐 Surfaces Plâtrerie disponibles</div>
              <div style="font-size:.8rem;color:var(--text-secondary,#666)">${piecesPlaco.length} pièce${piecesPlaco.length>1?'s':''} avec Métrage</div>
            </div>
            <button type="button" data-cex-action="import-placo" style="padding:7px 14px;border-radius:7px;border:none;background:var(--accent,#2563eb);color:#fff;font-size:.8rem;font-weight:600;cursor:pointer">Importer</button>
          </div>
          <div style="font-size:.8rem;font-weight:600;color:var(--text-secondary,#666);margin-bottom:6px">Que peindre ?</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${['murs','plafond','murs_et_plafond'].map(opt => {
              const labels = {murs:'Murs uniquement',plafond:'Plafond uniquement',murs_et_plafond:'Murs + Plafond'};
              const sel = (this._corpsConfig['peinture']||{}).zone === opt;
              return '<button type="button" data-cex-peinture-zone="' + opt + '" style="padding:6px 12px;border-radius:6px;border:2px solid ' + (sel?'var(--accent,#2563eb)':'var(--border,#e2e8f0)') + ';background:' + (sel?'rgba(37,99,235,.1)':'transparent') + ';color:#fff;font-size:.8rem;cursor:pointer">' + labels[opt] + '</button>';
            }).join('')}
          </div>
        </div>` : ''}
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
          ${items}
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
          <input id="cex-piece-libre" type="text" placeholder="Autre pièce / lieu..." style="flex:1;padding:9px 14px;border-radius:8px;border:1px solid var(--border,#e2e8f0);font-size:.9rem;background:var(--bg-card,#1e2530);color:var(--text-main,#fff)">
          <button type="button" data-cex-action="piece-libre-add" style="padding:9px 16px;border-radius:8px;border:none;background:var(--accent,#2563eb);color:#fff;font-weight:600;cursor:pointer">+ Ajouter</button>
        </div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 5b : Type chantier corps (Réno/Neuf) + linéaires ─
  _renderTypeCorps() {
    const corpsId = this._corpsActifs[this._corpsEnCours];
    const corps   = this.CORPS.find(c => c.id === corpsId);
    if (!['electricite','plomberie','maconnerie'].includes(corpsId)) {
      this._renderEtape('pieces');
      return;
    }
    const typeActuel     = (this._corpsConfig[corpsId] || {}).type || null;
    const lineaires      = this.LINEAIRES[corpsId] || [];
    const configActuelle = this._corpsConfig[corpsId] || {};

    const btnType = (id, label, icone, desc) =>
      `<div data-cex-type-corps="${id}" style="flex:1;min-width:160px;padding:16px;border-radius:10px;border:2px solid ${typeActuel===id?'var(--accent,#2563eb)':'var(--border,#e2e8f0)'};background:${typeActuel===id?'rgba(37,99,235,.06)':'var(--bg-card,#1e2530)'};cursor:pointer;text-align:center">
        <div style="font-size:1.6rem;margin-bottom:6px">${icone}</div>
        <div style="font-weight:700;margin-bottom:4px">${label}</div>
        <div style="font-size:.8rem;color:var(--text-secondary,#666)">${desc}</div>
      </div>`;

    const choixMaconnerie = corpsId === 'maconnerie';
    const titreType = choixMaconnerie ? 'Maçonnerie — Type' : corps ? corps.label + ' — Type de travaux' : 'Type de travaux';
    const champsLineaires = typeActuel === 'neuf' ? `
      <div style="margin-top:16px">
        <div style="font-size:.85rem;font-weight:600;color:var(--text-secondary,#666);margin-bottom:10px">Linéaires (depuis votre relevé sur place)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          ${lineaires.map(l => `
            <div>
              <label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">${l.label} (${l.unite})</label>
              <input id="cex-lin-${l.id}" type="number" min="0" step="1" value="${configActuelle[l.id]||''}" placeholder="${l.placeholder}"
                style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.9rem;box-sizing:border-box">
            </div>`).join('')}
        </div>
      </div>` : '';

    this._html(`
      ${this._progressBar('pieces')}
      ${this._card(`
        <div style="position:sticky;top:0;z-index:10;background:var(--bg,#0f0f1a);padding:12px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.1));display:flex;align-items:center;gap:10px;margin:-16px -16px 16px">
          <span style="font-size:1.4rem">${corps ? corps.icone : ''}</span>
          <h2 style="margin:0;font-size:1.1rem;font-weight:700">${corps ? corps.label : ''} — Type de travaux</h2>
          <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
            ${this._btn('← Retour', 'type-corps-retour', 'secondary')}
            ${typeActuel ? this._btn('Suivant — Sélectionner les pièces →', 'type-corps-suivant') : '<span style="font-size:.85rem;color:var(--text-secondary,#666);align-self:center">Choisissez un type pour continuer</span>'}
          </div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:4px">
          ${choixMaconnerie
            ? btnType('int', 'Intérieure', '🏠', 'Cloisons, enduits, dalles, linteaux') + btnType('ext', 'Extérieure', '🏗', 'Façades, murs, clôtures, fondations')
            : btnType('reno', 'Rénovation', '🔄', 'Remplacement appareillage existant') + btnType('neuf', 'Neuf / Création', '🆕', 'Câblage complet + appareillage')}
        </div>
        ${champsLineaires}
      `)}
    `);
    this._bind();
  },

  // ── Étape 6b : Appareillage par pièce (élec/plomberie) ───
  _renderAppareillage() {
    const p = this._pieceEnCours;
    if (!p) { this._renderEtape('pieces'); return; }
    const corps     = this.CORPS.find(c => c.id === p.corps);
    const liste     = this.APPAREILLAGE[p.corps] || [];
    const quantites = p.quantites || {};
    const cats      = [...new Set(liste.map(a => a.cat))];

    const sections = cats.map(cat => {
      const items = liste.filter(a => a.cat === cat).map(a => {
        const q = parseInt(quantites[a.id]) || 0;
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border,rgba(255,255,255,.08))">
          <span style="font-size:1.1rem;width:24px">${a.icone}</span>
          <span style="flex:1;font-size:.9rem">${a.label}</span>
          <div style="display:flex;align-items:center;gap:6px">
            <button type="button" data-cex-app-moins="${a.id}" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--border,#e2e8f0);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:1rem;line-height:1">−</button>
            <span id="cex-app-q-${a.id}" style="min-width:28px;text-align:center;font-weight:700;font-size:.95rem;color:${q>0?'#16a34a':'#fff'}">${q}</span>
            <button type="button" data-cex-app-plus="${a.id}" style="width:28px;height:28px;border-radius:6px;border:none;background:var(--accent,#2563eb);color:#fff;cursor:pointer;font-size:1rem;line-height:1">+</button>
          </div>
        </div>`;
      }).join('');
      return `<div style="margin-bottom:16px">
        <div style="font-size:.8rem;font-weight:700;color:var(--text-secondary,#666);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${cat}</div>
        ${items}
      </div>`;
    }).join('');

    const total = Object.values(quantites).reduce((s, v) => s + v, 0);

    this._html(`
      ${this._progressBar('metrage')}
      ${this._card(`
        <div style="position:sticky;top:0;z-index:10;background:var(--bg,#0f0f1a);padding:12px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.1));display:flex;align-items:center;gap:10px;margin:-16px -16px 16px">
          <span style="font-size:1.4rem">${corps ? corps.icone : ''}</span>
          <div>
            <h2 style="margin:0;font-size:1rem;font-weight:700">${this._esc(p.nom)}</h2>
            <div style="font-size:.8rem;color:var(--text-secondary,#666)">${corps ? corps.label : ''}${p.prestation ? ' · ' + this._esc(p.prestation) : ''}</div>
          </div>
          ${total > 0 ? `<span style="margin-left:auto;font-size:.9rem;color:#16a34a;font-weight:700">${total} point${total>1?'s':''}</span>` : ''}
          <div style="${total > 0 ? '' : 'margin-left:auto;'}display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
            ${this._btn('← Retour', 'app-retour', 'secondary')}
            ${this._btn('✓ Valider', 'app-valider')}
          </div>
        </div>
        <div style="background:var(--accent,#4f8ef7);border-radius:10px;padding:12px;margin-bottom:16px">
          <p style="color:#fff;margin:0;font-size:14px">
            ⚡ Saisissez le nombre de points par type. Le total sera calculé automatiquement.
          </p>
        </div>
        <div style="max-height:400px;overflow-y:auto">${sections}</div>
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

    const isPlaco   = p.corps === 'plaquisterie';
    const needsHSP  = isPlaco || (p.corps === 'maconnerie' && (this._corpsConfig['maconnerie'] || {}).lieuxKey === 'maconnerie_int');
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
        ${needsHSP ? `
        <div style="flex:1;min-width:120px">
          <label style="font-size:.8rem;color:#f59e0b;font-weight:700;display:block;margin-bottom:4px">Hauteur sous plafond (m) *</label>
          <input id="cex-m-hsp" type="number" min="1.5" max="6" step="0.05" value="${p.hsp||''}" placeholder="ex: 2.50"
            style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid #f59e0b;background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box">
        </div>` : ''}
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

    const champLibre = mode === 'libre' ? `
      <div style="margin-top:12px">
        <p style="font-size:13px;color:var(--text-muted,#888);margin-bottom:8px">
          Cliquez pour poser des points. Double-clic pour fermer la forme.
        </p>
        <canvas id="cex-canvas-libre" width="340" height="260"
          style="border:2px solid var(--accent,#4f8ef7);border-radius:8px;background:var(--card-bg,#1e1e2e);cursor:crosshair;touch-action:none">
        </canvas>
        <p style="font-size:13px;margin-top:8px">
          Surface calculée : <strong id="cex-canvas-surface">${p.surface && p.mode === 'libre' ? p.surface + ' m²' : '0 m²'}</strong>
        </p>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button type="button" id="cex-canvas-fermer"
            style="padding:8px 16px;border-radius:8px;background:var(--accent,#4f8ef7);color:#fff;border:none;cursor:pointer;flex:1">
            ✓ Fermer la forme
          </button>
          <button type="button" id="cex-canvas-reset"
            style="padding:8px 12px;border-radius:8px;background:transparent;border:1px solid var(--border,rgba(255,255,255,.2));color:var(--text-muted,#888);cursor:pointer">
            Effacer
          </button>
        </div>
        <input type="hidden" id="cex-surface-libre" value="${p.surface && p.mode === 'libre' ? p.surface : 0}">
      </div>` : '';
    const champs = mode === 'forme-l' ? champL : champRect;
    const prestsPays = p.corps === 'paysagisme'
      ? (this.PRESTATIONS_PAYSAGISME[p.nom] || ['OUV_GAZON_ROULEAU'])
          .map(code => {
            const ouv = (typeof BddV2 !== 'undefined' && BddV2.estChargee()) ? BddV2.getOuvrage(code) : null;
            const label = ouv ? ouv.designation : code;
            const sel = (p.tachePaysagisme||'') === code ? 'selected' : '';
            return `<option value="${code}" ${sel}>${this._esc(label)}</option>`;
          }).join('')
      : '';

    const champPaysagisme = p.corps === 'paysagisme' ? `
      <div style="background:var(--card-bg,#1e1e2e);border:1px solid var(--accent,#4f8ef7);border-radius:10px;padding:14px;margin-bottom:16px">
        <p style="font-weight:700;color:var(--accent,#4f8ef7);margin:0 0 10px 0">🌿 Prestation sur ${this._esc(p.nom)}</p>
        <select id="cex-pays-tache" style="width:100%;padding:10px;border-radius:8px;background:#fff;color:#222;border:none;font-size:15px">
          <option value="">-- Choisir --</option>
          ${prestsPays}
        </select>
      </div>` : '';

    this._html(`
      ${this._progressBar('metrage')}
      ${this._card(`
        <div style="position:sticky;top:0;z-index:10;background:var(--bg,#0f0f1a);padding:12px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.1));display:flex;align-items:center;gap:10px;margin:-16px -16px 16px">
          <span style="font-size:1.4rem">${corps ? corps.icone : ''}</span>
          <div>
            <h2 style="margin:0;font-size:1rem;font-weight:700">${this._esc(p.nom)}</h2>
            <div style="font-size:.8rem;color:var(--text-secondary,#666)">${corps ? corps.label : ''}</div>
          </div>
          ${p.surface ? `<span style="margin-left:auto;font-size:.9rem;color:#16a34a;font-weight:700">${p.surface} m²</span>` : ''}
          <div style="${p.surface ? '' : 'margin-left:auto;'}display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
            ${this._btn('← Retour', 'metrage-retour', 'secondary')}
            ${this._btn('✓ Valider la surface', 'metrage-valider').replace('<button ', '<button id="cex-metrage-valider" ')}
          </div>
        </div>
        ${champPaysagisme}
        <div style="display:flex;gap:8px;margin-bottom:16px">
          ${btnMode('rectangle','Rectangle','▬')}
          ${btnMode('forme-l','Forme en L','⌐')}
          ${btnMode('libre','Dessin libre','✏️')}
        </div>
        ${mode === 'libre' ? champLibre : champs}
      `)}
    `);

    const preview = () => {
      const el = this._container.querySelector('#cex-m-preview');
      if (!el) return;
      let s = 0;
      if (mode === 'rectangle') {
        const l   = parseFloat((this._container.querySelector('#cex-m-l') || {}).value) || 0;
        const w   = parseFloat((this._container.querySelector('#cex-m-w') || {}).value) || 0;
        const hsp = parseFloat((this._container.querySelector('#cex-m-hsp') || {}).value) || 0;
        s = Math.round(l * w * 100) / 100;
        if (hsp && l && w && el) {
          const murs = Math.round((2*l + 2*w) * hsp * 100) / 100;
          el.innerHTML = `→ Sol : ${s} m² · Murs : ${murs} m² · Plafond : ${s} m²`;
          return;
        }
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
    const btnValider = this._container.querySelector('#cex-metrage-valider');
    if (btnValider) {
      const sel = this._container.querySelector('#cex-pays-tache');
      btnValider.disabled = p.corps === 'paysagisme' && (!sel || !sel.value);
      if (p.corps === 'paysagisme' && sel) {
        sel.addEventListener('change', () => { btnValider.disabled = !sel.value; });
      }
    }
    this._bind();
    const canvas = this._container.querySelector('#cex-canvas-libre');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let points = [];
      let closed = false;

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!points.length) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(pt => ctx.lineTo(pt.x, pt.y));
        if (closed) ctx.closePath();
        ctx.strokeStyle = '#4f8ef7';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (closed) {
          ctx.fillStyle = 'rgba(79,142,247,0.15)';
          ctx.fill();
        }
        points.forEach(pt => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#4f8ef7';
          ctx.fill();
        });
      };

      const calcSurface = () => {
        if (points.length < 3) return 0;
        let area = 0;
        for (let i = 0; i < points.length; i++) {
          const j = (i + 1) % points.length;
          area += points[i].x * points[j].y;
          area -= points[j].x * points[i].y;
        }
        const scale = 10 / 340;
        return Math.abs(area / 2) * scale * scale;
      };

      const fermerForme = () => {
        closed = true;
        const surf = calcSurface().toFixed(1);
        draw();
        const el = this._container.querySelector('#cex-canvas-surface');
        if (el) el.textContent = surf + ' m²';
        const inp = this._container.querySelector('#cex-surface-libre');
        if (inp) inp.value = surf;
        if (this._pieceEnCours) this._pieceEnCours.surface = parseFloat(surf);
        const fermerBtn = this._container.querySelector('#cex-canvas-fermer');
        if (fermerBtn) {
          fermerBtn.textContent = '✅ Forme fermée — ' + surf + ' m²';
          fermerBtn.disabled = true;
        }
      };

      const getPos = e => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      };

      canvas.addEventListener('click', e => {
        if (closed) return;
        points.push(getPos(e));
        draw();
      });

      canvas.addEventListener('dblclick', () => {
        if (points.length < 3) return;
        fermerForme();
      });

      canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        if (closed) return;
        points.push(getPos(e));
        if (points.length >= 3) {
          const first = points[0];
          const last = points[points.length - 1];
          const dist = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
          if (dist < 30) {
            points.pop();
            fermerForme();
            return;
          }
        }
        draw();
      }, { passive: false });

      const fermerBtn = this._container.querySelector('#cex-canvas-fermer');
      if (fermerBtn) {
        fermerBtn.addEventListener('click', () => {
          if (points.length < 3) {
            if (typeof App !== 'undefined' && App.toast) {
              App.toast('Posez au moins 3 points pour fermer la forme', 'warning');
            }
            return;
          }
          fermerForme();
        });
      }

      const resetBtn = this._container.querySelector('#cex-canvas-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          points = [];
          closed = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const el = this._container.querySelector('#cex-canvas-surface');
          if (el) el.textContent = '0 m²';
          const inp = this._container.querySelector('#cex-surface-libre');
          if (inp) inp.value = '0';
          if (this._pieceEnCours) this._pieceEnCours.surface = 0;
          const fermerBtn = this._container.querySelector('#cex-canvas-fermer');
          if (fermerBtn) {
            fermerBtn.textContent = '✓ Fermer la forme';
            fermerBtn.disabled = false;
          }
        });
      }
    }
  },

  // ── Mapping corps → BDD V2 ───────────────────────────────
  CORPS_BDD: {
    plaquisterie: { label: 'Plâtrerie', ouvrageDefaut: 'OUV_CLOISON_BA13_M48' },
    peinture:     { label: 'Peinture',     ouvrageDefaut: 'OUV_PEINTURE_MURS_2_COUCHES' },
    electricite:  { label: 'Electricite',  ouvrageDefaut: null },
    plomberie:    { label: 'Plomberie',    ouvrageDefaut: null },
    maconnerie:   { label: 'Maconnerie',   ouvrageDefaut: 'OUV_MUR_PARPAING_20' },
    paysagisme:   { label: 'Paysagisme',   ouvrageDefaut: null },
  },

  // ── Calcul prix réel via BddV2 (fallback forfait) ────────
  _calcCorps(corpsId, surface, piece) {
    if (corpsId === 'maconnerie' && piece && piece.prestation) {
      const ouvragePrestation = this._getOuvragePrestation(piece.prestation);
      if (ouvragePrestation && typeof BddV2 !== 'undefined' && BddV2.estChargee()) {
        return BddV2.calcPrixVente(ouvragePrestation, surface);
      }
    }
    if (corpsId === 'paysagisme' && piece && piece.tachePaysagisme) {
      if (typeof BddV2 !== 'undefined' && BddV2.estChargee()) {
        return BddV2.calcPrixVente(piece.tachePaysagisme, surface);
      }
    }
    const bdd = this.CORPS_BDD[corpsId];
    if (!bdd || !bdd.ouvrageDefaut) {
      const coutMat   = surface * 8;
      const coutMO    = surface * 0.65 * 45;
      const prixVente = (coutMat + coutMO) * 1.30;
      return { coutMat, coutMO, prixVente, gain: prixVente - coutMat - coutMO };
    }
    if (typeof BddV2 === 'undefined' || !BddV2.estChargee()) {
      console.warn('[CalcExpressV2] BddV2 non chargée — forfait pour', bdd.ouvrageDefaut);
      const coutMat   = surface * 8;
      const coutMO    = surface * 0.65 * 45;
      const prixVente = (coutMat + coutMO) * 1.30;
      return { coutMat, coutMO, prixVente, gain: prixVente - coutMat - coutMO };
    }
    return BddV2.calcPrixVente(bdd.ouvrageDefaut, surface);
  },

  // ── Étape 7 : Résumé final ────────────────────────────────
  _renderResume() {
    const fmt = v => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v);
    let gainTotal = 0, coutTotal = 0;

    const lignes = this._corpsActifs.map(corpsId => {
      const corps  = this.CORPS.find(c => c.id === corpsId);
      const pieces = this._pieces.filter(p => p.corps === corpsId && p.surface);
      const config = this._corpsConfig[corpsId] || {};
      let coutCorps = 0, gainCorps = 0, detail = [];

      pieces.forEach(p => {
        const estElecPlomb = (corpsId === 'electricite' || corpsId === 'plomberie');

        // Pour élec/plomberie : utiliser quantites{} directement
        if (estElecPlomb) {
          const quantites = p.quantites || {};
          const nbPoints = Object.values(quantites).reduce((s,v) => s+(parseFloat(v)||0), 0);
          if (!nbPoints) {
            detail.push(p.nom + ' · ⚠️ aucun point saisi');
            return;
          }
          const r = this._calcCorps(corpsId, nbPoints, p);
          coutCorps += r.coutMat + r.coutMO;
          gainCorps += r.gain;
          const uniteAff = ' pts';
          detail.push(p.nom + ' · ' + nbPoints + uniteAff + ' → ' + fmt(r.prixVente));
          return;
        }

        // Autres corps : surface normale
        const surface = parseFloat(p.surface) || 0;
        if (!surface) return;
        const r = this._calcCorps(corpsId, surface, p);
        coutCorps += r.coutMat + r.coutMO;
        gainCorps += r.gain;
        const uniteAff = ' m²';
        detail.push(p.nom + (p.prestation ? ' · ' + p.prestation : '') + ' · ' + surface + uniteAff + ' → ' + fmt(r.prixVente));
      });

      if (config.type === 'neuf') {
        const PRIX = {cable_15:1.8,cable_25:2.4,gaine_irl:1.2,per_16:3.5,per_20:4.8,pvc_40:6.0,pvc_100:12.0};
        Object.entries(config).forEach(([k,v]) => {
          if (k==='type'||k==='lieuxKey'||!PRIX[k]) return;
          const c = v * PRIX[k], pv = c * 1.35;
          coutCorps += c; gainCorps += pv - c;
          detail.push(k.replace('_',' ') + ' · ' + v + ' ml → ' + fmt(pv));
        });
      }

      gainTotal += gainCorps; coutTotal += coutCorps;
      return { corps, gainCorps, coutCorps, detail };
    }).filter(l => l.gainCorps > 0);

    const pvTotal = coutTotal + gainTotal;
    this._lastResume = { corpsData: lignes, coutTotal, gainTotal, pvTotal };

    // Synthèse automatique pour analyse IA
    const lignesTexte = (lignes || []).map(l => {
      const corpsId = l.corps && l.corps.id ? l.corps.id : '';
      const corpsLabel = l.corps && l.corps.label ? l.corps.label : corpsId;
      const unite = (corpsId === 'electricite' || corpsId === 'plomberie') ? 'pts' : 'm²';
      return corpsLabel + ' — ' + l.detail.join(', ') + ' (' + unite + ')';
    });
    const profil = this._profil || 'particulier';
    const typeChantier = (this._corpsConfig || {});
    const synthese = [
      'Chiffrage ' + (profil === 'pro' ? 'professionnel' : 'particulier'),
      'Corps de métiers : ' + (this._corpsActifs || []).join(', '),
      ...lignesTexte,
      'Prix vente estimé HT : ' + pvTotal.toFixed(0) + ' €',
      'Gain estimé : ' + gainTotal.toFixed(0) + ' €',
    ].join('. ');
    this._lastResume.synthese = synthese;
    // Stocker pour que l'assistant IA puisse la lire
    try {
      sessionStorage.setItem('plaqpro_synthese_chiffrage', synthese);
    } catch(e) {}

    const lignesHTML = lignes.map(l => `
      <div style="padding:12px 0;border-bottom:1px solid var(--border,rgba(255,255,255,.08))">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-weight:600">${l.corps ? l.corps.icone + ' ' + l.corps.label : ''}</span>
          <span style="color:#16a34a;font-weight:700">+${fmt(l.gainCorps)}</span>
        </div>
        <div style="font-size:.78rem;color:var(--text-secondary,#666)">${l.detail.join(' · ')}</div>
        ${this._chiffrageEnModification && l.corps && l.corps.id ? `<button type="button" data-cex-action="modifier-corps" data-corps="${l.corps.id}" style="font-size:12px;padding:4px 10px;border-radius:6px;background:transparent;border:1px solid var(--border,rgba(255,255,255,.2));color:var(--text-muted,#888);cursor:pointer;margin-top:4px">✏️ Modifier ce corps</button>` : ''}
      </div>`).join('');

    this._html(`
      <div style="padding:4px 0 16px">
        <h1 style="margin:0 0 4px;font-size:1.2rem;font-weight:800">⚡ Résumé du chiffrage</h1>
        <p style="margin:0;font-size:.85rem;color:var(--text-secondary,#666)">Chantier : <strong>${this._esc(this._chantier.nom || '')}</strong></p>
      </div>
      <div style="background:linear-gradient(135deg,rgba(37,99,235,.12),rgba(22,163,74,.08));border:2px solid #16a34a;border-radius:14px;padding:24px;text-align:center;margin-bottom:20px">
        <div style="font-size:.85rem;color:var(--text-secondary,#666);margin-bottom:6px">Votre gain estimé</div>
        <div style="font-size:3rem;font-weight:900;color:#16a34a;line-height:1">${fmt(gainTotal)}</div>
        <div style="font-size:.8rem;color:var(--text-secondary,#666);margin-top:8px">Prix de vente : ${fmt(pvTotal)} HT · Coût direct : ${fmt(coutTotal)}</div>
      </div>
      ${this._card(`
        <h3 style="margin:0 0 12px;font-size:.9rem;font-weight:700">Détail par corps</h3>
        ${lignesHTML || '<p style="color:var(--text-secondary,#666);font-size:.85rem">Aucune surface saisie</p>'}
      `)}
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:space-between;margin-top:16px">
        ${this._btn('← Modifier', 'resume-retour', 'secondary')}
        <div style="display:flex;gap:8px">
          ${this._btn('💾 Sauvegarder le chiffrage', 'resume-sauver')}
          ${this._btn('📄 Générer et enregistrer le devis', 'resume-devis')}
          ${this._btn("🛒 Liste d'achat", 'resume-achat')}
        </div>
      </div>
      <div id="cex-resume-container" style="margin-top:16px"></div>
    `);
    this._bind();
  },

  // ── Gestion événements ────────────────────────────────────
  _bind() {
    // Annuler le listener précédent s'il existe
    if (this._bindController) this._bindController.abort();
    this._bindController = new AbortController();
    const signal = this._bindController.signal;

    document.addEventListener('click', e => {
      if (!this._container || !this._container.contains(e.target)) return;

      // Actions boutons
      const btn = e.target.closest('[data-cex-action]');
      if (btn) {
        const action = btn.dataset.cexAction;
        if (action === 'chantier-suivant') {
          const chantierId = (this._container.querySelector('#cex-chantier-id') || {}).value;
          const nom     = ((this._container.querySelector('#cex-nom-chantier') || {}).value || '').trim();
          const client  = (this._container.querySelector('#cex-client-select') || {}).value;
          const adresse = ((this._container.querySelector('#cex-adresse') || {}).value || '').trim();
          if (!client) { if (typeof App !== 'undefined' && App.toast) App.toast('Sélectionnez un client', 'warning'); return; }
          if (!nom) { if (typeof App !== 'undefined' && App.toast) App.toast('Saisissez un nom de chantier', 'warning'); return; }
          const cliSelectionne = DB.getClient(parseInt(client));
          this._profil = cliSelectionne && cliSelectionne.type
            ? (cliSelectionne.type === 'particulier' ? 'particulier' : 'pro')
            : null;
          if (chantierId) {
            this._chantier = { nom, clientId: client || null, chantierId, adresse };
            if (!this._profil) {
              if (cliSelectionne && !cliSelectionne.type) {
                if (typeof App !== 'undefined' && App.toast) App.toast("⚠️ Ce client n'a pas de type renseigné — veuillez compléter sa fiche", 'warning');
                setTimeout(() => { if (typeof App !== 'undefined') App.navigate('clients'); }, 1800);
                return;
              }
            }
            this._renderEtape('profil');
            return;
          }
          const nouveau = DB.addChantier({ nom, clientId: parseInt(client), adresse });
          this._chantier = { nom, clientId: client || null, chantierId: nouveau ? nouveau.id : null, adresse };
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
        if (action === 'corps-retour')   this._renderEtape('sousTraitants');
        if (action === 'corps-terminer') { this._renderEtape('resume'); return; }
        if (action === 'corps-suivant') {
          if (!this._corpsActifs.length) { if (typeof App !== 'undefined' && App.toast) App.toast('Sélectionnez au moins un corps de métier', 'warning'); return; }
          this._corpsEnCours = 0;
          this._renderEtape('pieces');
        }
        if (action === 'creer-st')       { if (typeof App !== 'undefined') App.navigate('sousTraitants'); }
        if (action === 'nouveau-client')   { if (typeof App !== 'undefined') App.navigate('clients'); }
        if (action === 'nouveau-chantier') { if (typeof App !== 'undefined') App.navigate('chantiers'); }
        if (action === 'app-retour')  { this._renderEtape('pieces'); return; }
        if (action === 'app-valider') {
          const p = this._pieceEnCours;
          if (p) {
            const total = Object.values(p.quantites || {}).reduce((s,v) => s+v, 0);
            p.nbPoints = total;
            p.surface  = total;
            if (p.corps === 'paysagisme') {
              p.tachePaysagisme = (document.getElementById('cex-pays-tache') || {}).value || 'OUV_GAZON_ROULEAU';
            }
          }
          this._renderEtape('pieces');
          return;
        }
        if (action === 'metrage-retour')  { this._renderEtape('pieces'); return; }
        if (action === 'metrage-valider') {
          const p    = this._pieceEnCours;
          const mode = p ? (p.mode || 'rectangle') : 'rectangle';
          let s = 0;
          if (mode === 'rectangle') {
            const l   = parseFloat((this._container.querySelector('#cex-m-l') || {}).value) || 0;
            const w   = parseFloat((this._container.querySelector('#cex-m-w') || {}).value) || 0;
            const hsp = parseFloat((this._container.querySelector('#cex-m-hsp') || {}).value) || 0;
            s = Math.round(l * w * 100) / 100;
            if (p) {
              p.longueur = l; p.largeur = w;
              if (hsp) {
                p.hsp          = hsp;
                p.surface_sol  = s;
                p.surface_murs = Math.round((2 * l + 2 * w) * hsp * 100) / 100;
              }
            }
          } else if (mode === 'forme-l') {
            const l1 = parseFloat((this._container.querySelector('#cex-m-l1') || {}).value) || 0;
            const w1 = parseFloat((this._container.querySelector('#cex-m-w1') || {}).value) || 0;
            const l2 = parseFloat((this._container.querySelector('#cex-m-l2') || {}).value) || 0;
            const w2 = parseFloat((this._container.querySelector('#cex-m-w2') || {}).value) || 0;
            s = Math.round((l1 * w1 + l2 * w2) * 100) / 100;
            if (p) { p.l1=l1; p.w1=w1; p.l2=l2; p.w2=w2; }
          } else if (mode === 'libre') {
            const inp = this._container.querySelector('#cex-surface-libre');
            s = inp && parseFloat(inp.value) > 0 ? parseFloat(inp.value) : 0;
            if (p && s > 0) {
              p.surface = s;
              p.mode = 'libre';
            }
          }
          if (!s) { if (typeof App !== 'undefined' && App.toast) App.toast('Saisissez les dimensions', 'warning'); return; }
          if (p) {
            p.surface = s;
            p.mode = mode;
            if (p.corps === 'paysagisme') {
              p.tachePaysagisme = (document.getElementById('cex-pays-tache') || {}).value || 'OUV_GAZON_ROULEAU';
            }
          }
          this._renderEtape('pieces');
          return;
        }
        if (action === 'resume-retour') { this._renderEtape('corps'); return; }
        if (action === 'modifier-corps') {
          const corpsId = btn.dataset.corps;
          const idx = this._corpsActifs.indexOf(corpsId);
          if (idx !== -1) {
            this._corpsEnCours = idx;
            this._renderEtape('pieces');
          }
          return;
        }
        if (action === 'resume-sauver') {
          const chiffrage = {
            id:          'chiffrage_' + Date.now(),
            date:        new Date().toISOString(),
            chantier:    this._chantier    || {},
            corpsActifs: this._corpsActifs || [],
            corpsConfig: this._corpsConfig || {},
            profil:      this._profil      || 'particulier',
            pieces:      this._pieces      || [],
            resume:      this._lastResume  || {},
          };
          try {
            const liste = JSON.parse(localStorage.getItem('plaqpro_chiffrages') || '[]');
            liste.unshift(chiffrage);
            localStorage.setItem('plaqpro_chiffrages', JSON.stringify(liste));
            if (typeof App !== 'undefined' && App.toast) App.toast('💾 Chiffrage sauvegardé (pas le devis)', 'success');
          } catch(e) {
            if (typeof App !== 'undefined' && App.toast) App.toast('Erreur sauvegarde', 'error');
          }
          return;
        }
        if (action === 'resume-devis') {
          if (!this._corpsActifs || !this._corpsActifs.length) {
            if (typeof App !== 'undefined' && App.toast) App.toast('Aucun corps actif à devis', 'warning'); return;
          }
          DevisMulti._state = DevisMulti._newState();
          DevisMulti._state.clientId   = (this._chantier && this._chantier.clientId)   || '';
          DevisMulti._state.chantierId = (this._chantier && this._chantier.chantierId) || '';
          DevisMulti._state.objet      = 'Chiffrage ' + ((this._chantier && this._chantier.nom) || 'sans nom');
          this._corpsActifs.forEach(corpsId => {
            const corps = this.CORPS.find(c => c.id === corpsId);
            if (!corps) return;
            const pcs = (this._pieces || []).filter(p => {
              if (p.corps !== corpsId) return false;
              if (corpsId === 'electricite' || corpsId === 'plomberie') {
                return Object.values(p.quantites || {}).reduce((s,v) => s+(parseFloat(v)||0), 0) > 0;
              }
              return parseFloat(p.surface) > 0;
            });
            pcs.forEach(p => {
              const surf = (corpsId === 'electricite' || corpsId === 'plomberie')
                ? Object.values(p.quantites || {}).reduce((s,v) => s+(parseFloat(v)||0), 0)
                : parseFloat(p.surface);
              const r    = this._calcCorps(corpsId, surf, p);
              const dims = [];
              if (p.longueur && p.largeur) dims.push(p.longueur + 'm × ' + p.largeur + 'm');
              if (p.hsp) dims.push('HSP ' + p.hsp + 'm');
              if (p.prestation) dims.push(p.prestation);
              if (p.tachePaysagisme && typeof BddV2 !== 'undefined') {
                const ouv = BddV2.getOuvrage(p.tachePaysagisme);
                if (ouv) dims.push(ouv.designation);
              }
              const estElecPlomb = (corpsId === 'electricite' || corpsId === 'plomberie');
              if (estElecPlomb && p.quantites) {
                const details = Object.entries(p.quantites)
                  .filter(([k,v]) => v > 0)
                  .map(([k,v]) => k.replace(/_/g,' ') + ' ×' + v)
                  .join(', ');
                if (details) dims.push(details);
              }
              const designation = p.nom + (dims.length ? ' — ' + dims.join(' | ') : '');
              const uniteDevis = (corpsId === 'electricite' || corpsId === 'plomberie') ? 'u' : 'm²';
              const nbLignesAvant = (() => {
                const s = DevisMulti._state.sections.find(s => s.key === corpsId);
                return s ? s.lignes.length : 0;
              })();
              DevisMulti._ajouterSectionAvecSurface(
                corpsId, corps.icone || '🔧', corps.label,
                surf, uniteDevis, designation
              );
              const sec = DevisMulti._state.sections.find(s => s.key === corpsId);
              if (sec && sec.lignes.length > nbLignesAvant) {
                sec.lignes[nbLignesAvant].prix = surf > 0 ? Math.round(r.prixVente / surf) : 0;
              }
              if (r.coutMat > 0 || r.coutMO > 0) {
                DevisMulti._ajouterSectionAvecSurface(
                  corpsId, '', '',
                  1, 'forfait',
                  '  └ Dont mat. ' + fmt(r.coutMat) + ' + MO ' + fmt(r.coutMO)
                );
                const secD = DevisMulti._state.sections.find(s => s.key === corpsId);
                if (secD && secD.lignes.length) {
                  secD.lignes[secD.lignes.length - 1].prix = 0;
                }
              }
            });
            // Linéaires neuf élec/plomberie
            if (corpsId === 'electricite' || corpsId === 'plomberie') {
              const configLin = this._corpsConfig[corpsId] || {};
              if (configLin.type === 'neuf') {
                const PRIX_ML = {cable_15:1.8,cable_25:2.4,gaine_irl:1.2,per_16:3.5,per_20:4.8,pvc_40:6.0,pvc_100:12.0};
                Object.entries(configLin).forEach(([k, v]) => {
                  if (k === 'type' || k === 'lieuxKey' || !PRIX_ML[k] || !v) return;
                  const qteML = parseFloat(v) || 0;
                  if (!qteML) return;
                  const prixU = Math.round(PRIX_ML[k] * 1.35);
                  const label = k.replace(/_/g, ' ');
                  const nbAvantLin = (() => {
                    const s = DevisMulti._state.sections.find(s => s.key === corpsId);
                    return s ? s.lignes.length : 0;
                  })();
                  DevisMulti._ajouterSectionAvecSurface(
                    corpsId, corps.icone || '🔧', corps.label,
                    qteML, 'ml', label
                  );
                  const sec3 = DevisMulti._state.sections.find(s => s.key === corpsId);
                  if (sec3 && sec3.lignes.length > nbAvantLin) {
                    sec3.lignes[nbAvantLin].prix = prixU;
                  }
                });
              }
            }
          });
          // Enregistrer silencieusement sans reset ni navigation
          const stateAvant = DevisMulti._state;
          if (!stateAvant.clientId) {
            // Tenter de récupérer clientId depuis this._chantier
            if (this._chantier && this._chantier.clientId) {
              DevisMulti._state.clientId   = this._chantier.clientId;
              DevisMulti._state.chantierId = this._chantier.id || this._chantier.chantierId || '';
            }
          }
          const devisIdExistant = this._lastResume && this._lastResume.devisId;
          if (devisIdExistant) {
            if (!confirm('Êtes-vous sûr de remplacer l\'ancien devis ? Cette action est irréversible.')) {
              return;
            }
            // Supprimer l'ancien devis avant d'en créer un nouveau
            const liste = JSON.parse(localStorage.getItem(DB.KEYS.devis) || '[]')
              .filter(d => String(d.id) !== String(devisIdExistant));
            localStorage.setItem(DB.KEYS.devis, JSON.stringify(liste));
          }
          const idDevis = DevisMulti.enregistrerSilencieux();
          if (idDevis) {
            DevisMulti._state._devisId = idDevis;
            this._lastResume = this._lastResume || {};
            this._lastResume.devisId = idDevis;
            const chiffrageSource = {
              id:          'chiffrage_' + Date.now(),
              date:        new Date().toISOString(),
              devisId:     idDevis,
              chantier:    this._chantier    || {},
              corpsActifs: this._corpsActifs || [],
              corpsConfig: this._corpsConfig || {},
              profil:      this._profil      || 'particulier',
              pieces:      this._pieces      || [],
              resume:      this._lastResume  || {},
            };
            try {
              const liste = JSON.parse(localStorage.getItem('plaqpro_chiffrages') || '[]');
              liste.unshift(chiffrageSource);
              localStorage.setItem('plaqpro_chiffrages', JSON.stringify(liste));
            } catch(e) {}
            if (typeof App !== 'undefined' && App.toast) App.toast('✅ Devis enregistré — visible dans Devis', 'success');
          } else {
            // Diagnostic précis
            const s = DevisMulti._state;
            const nbLignes = (s.sections||[]).reduce((t,sec)=>t+(sec.lignes||[]).length,0);
            const msg = !s.clientId ? '⚠️ Client manquant — devis non enregistré'
                      : !nbLignes   ? '⚠️ Devis vide — aucune ligne'
                      : '⚠️ Erreur enregistrement devis';
            if (typeof App !== 'undefined' && App.toast) App.toast(msg, 'error');
            // Ne pas naviguer si échec
            return;
          }
          if (typeof AssistantIA !== 'undefined' && this._lastResume && this._lastResume.synthese) {
            AssistantIA.setSynthese && AssistantIA.setSynthese(this._lastResume.synthese);
          }
          // Naviguer vers devis_complet pour visualiser
          if (typeof App !== 'undefined' && App.navigate) App.navigate('devis_complet');
          return;
        }
        if (action === 'resume-achat') {
          if (typeof ListeAchatV2 !== 'undefined') {
            ListeAchatV2.render('cex-resume-container', this._pieces, this._corpsActifs, this._corpsConfig);
          } else {
            if (typeof App !== 'undefined' && App.toast) App.toast('Module liste achat non disponible', 'warning');
          }
          return;
        }
        if (action === 'type-corps-retour') { this._renderEtape('corps'); return; }
        if (action === 'type-corps-suivant') {
          const corpsId = this._corpsActifs[this._corpsEnCours];
          if (!this._corpsConfig[corpsId]) this._corpsConfig[corpsId] = {};
          const lin = this.LINEAIRES[corpsId] || [];
          lin.forEach(l => {
            const val = parseFloat((this._container.querySelector('#cex-lin-' + l.id) || {}).value) || 0;
            if (val) this._corpsConfig[corpsId][l.id] = val;
          });
          if (corpsId === 'maconnerie') {
            const t = this._corpsConfig[corpsId].type;
            this._corpsConfig[corpsId].lieuxKey = t === 'int' ? 'maconnerie_int' : 'maconnerie_ext';
          }
          this._renderEtape('pieces');
          return;
        }
        if (action === 'import-placo') {
          const piecesPlaco = this._pieces.filter(p => p.corps === 'plaquisterie' && (p.surface_sol || p.surface));
          piecesPlaco.forEach(pp => {
            const exist = this._pieces.find(p => p.corps === 'peinture' && p.nom === pp.nom);
            if (!exist) {
              this._pieces.push({
                nom:          pp.nom,
                corps:        'peinture',
                surface:      pp.surface_sol || pp.surface || 0,
                surface_sol:  pp.surface_sol || pp.surface || 0,
                surface_murs: pp.surface_murs || 0,
                hsp:          pp.hsp || 2.50,
                longueur:     pp.longueur,
                largeur:      pp.largeur,
                mode:         'rectangle',
                depuis_placo: true,
              });
            }
          });
          if (typeof App !== 'undefined' && App.toast) App.toast('✅ ' + piecesPlaco.length + ' pièce(s) importée(s) depuis Plâtrerie', 'success');
          this._renderEtape('pieces');
          return;
        }
        if (action === 'pieces-retour')        this._renderEtape('corps');
        if (action === 'pieces-vers-corps')    { this._renderEtape('corps'); return; }
        if (action === 'corps-precedent')      { this._corpsEnCours--; this._renderEtape('pieces'); }
        if (action === 'corps-suivant-pieces') { this._corpsEnCours++; this._renderEtape('pieces'); }
        if (action === 'pieces-terminer')      { this._renderEtape('resume'); return; }
        if (action === 'maconnerie-prestation-valider') {
          const select = this._container.querySelector('#cex-maconnerie-prestation');
          const prestation = (select ? select.value : '').trim();
          const nom = select ? select.dataset.cexPrestationPiece : '';
          const corpsId = this._corpsActifs[this._corpsEnCours];
          if (!prestation) { if (typeof App !== 'undefined' && App.toast) App.toast('Choisissez une prestation de maçonnerie', 'warning'); return; }
          let pieceMac = this._pieces.find(p => p.nom === nom && p.corps === corpsId);
          if (!pieceMac) {
            pieceMac = { nom, corps: corpsId, surface: null, mode: 'rectangle', quantites: {} };
            this._pieces.push(pieceMac);
          }
          pieceMac.prestation = prestation;
          this._pieceMaconnerieSelection = nom;
          this._pieceEnCours = pieceMac;
          this._renderEtape('metrage');
          return;
        }
        if (action === 'piece-libre-add') {
          const input = this._container.querySelector('#cex-piece-libre');
          const val   = (input ? input.value : '').trim();
          if (!val) return;
          const corpsId = this._corpsActifs[this._corpsEnCours];
          if (!this._pieces.find(p => p.nom === val && p.corps === corpsId)) {
            this._pieces.push({ nom: val, corps: corpsId, surface: null, quantites: {} });
          }
          if (input) input.value = '';
          this._renderEtape('pieces');
        }
        return;
      }

      // Zone peinture (hors bloc btn)
      const zoneBtn = e.target.closest('[data-cex-peinture-zone]');
      if (zoneBtn) {
        if (!this._corpsConfig['peinture']) this._corpsConfig['peinture'] = {};
        this._corpsConfig['peinture'].zone = zoneBtn.dataset.cexPeintureZone;
        this._renderEtape('pieces');
        return;
      }

      // Sélection profil
      const profil = e.target.closest('[data-cex-profil]');
      if (profil) {
        this._profil = profil.dataset.cexProfil;
        this._renderEtape('profil');
        return;
      }

      // Boutons +/- appareillage
      const btnPlus  = e.target.closest('[data-cex-app-plus]');
      const btnMoins = e.target.closest('[data-cex-app-moins]');
      if ((btnPlus || btnMoins) && this._pieceEnCours) {
        const id = btnPlus ? btnPlus.dataset.cexAppPlus : btnMoins.dataset.cexAppMoins;
        if (!this._pieceEnCours.quantites) this._pieceEnCours.quantites = {};
        const q = this._pieceEnCours.quantites[id] || 0;
        this._pieceEnCours.quantites[id] = btnPlus ? q + 1 : Math.max(0, q - 1);
        const el = this._container.querySelector('#cex-app-q-' + id);
        if (el) el.textContent = this._pieceEnCours.quantites[id];
        return;
      }

      // Sélection type corps (réno/neuf)
      const typeCorps = e.target.closest('[data-cex-type-corps]');
      if (typeCorps) {
        const corpsId = this._corpsActifs[this._corpsEnCours];
        if (!this._corpsConfig[corpsId]) this._corpsConfig[corpsId] = {};
        const choix = typeCorps.dataset.cexTypeCorps;
        this._corpsConfig[corpsId].type = choix;
        if (corpsId === 'maconnerie') {
          this._corpsConfig[corpsId].lieuxKey = choix === 'int' ? 'maconnerie_int' : 'maconnerie_ext';
        }
        this._renderEtape('pieces');
        return;
      }

      // Sélection mode métrage
      const modeBtn = e.target.closest('[data-cex-mode]');
      if (modeBtn && this._pieceEnCours) {
        this._pieceEnCours.mode = modeBtn.dataset.cexMode;
        this._renderEtape('metrage');
        return;
      }

      // Clic prestation maçonnerie → sélectionner + ouvrir métrage
      const prestationBtn = e.target.closest('[data-cex-prestation]');
      if (prestationBtn) {
        const nom = prestationBtn.dataset.cexPrestationPiece;
        const prestation = prestationBtn.dataset.cexPrestation;
        const corpsId = this._corpsActifs[this._corpsEnCours];
        let pieceMac = this._pieces.find(p => p.nom === nom && p.corps === corpsId);
        if (!pieceMac) {
          pieceMac = { nom, corps: corpsId, surface: null, mode: 'rectangle', quantites: {} };
          this._pieces.push(pieceMac);
        }
        pieceMac.prestation = prestation;
        this._pieceMaconnerieSelection = nom;
        this._pieceEnCours = pieceMac;
        this._renderEtape('metrage');
        return;
      }

      // Clic pièce → sélectionner + ouvrir métrage
      const piece = e.target.closest('[data-cex-piece]');
      if (piece) {
        const nom     = piece.dataset.cexPiece;
        const corpsId = this._corpsActifs[this._corpsEnCours];
        if (corpsId === 'maconnerie') {
          this._pieceMaconnerieSelection = nom;
          this._renderEtape('pieces');
          return;
        }
        const idx     = this._pieces.findIndex(p => p.nom === nom && p.corps === corpsId);
        if (idx >= 0) {
          this._pieceEnCours = this._pieces[idx];
        } else {
          const newPiece = { nom, corps: corpsId, surface: null, mode: 'rectangle', quantites: {} };
          this._pieces.push(newPiece);
          this._pieceEnCours = newPiece;
        }
        if (['electricite','plomberie'].includes(this._pieceEnCours.corps)) {
          this._renderEtape('appareillage');
        } else {
          this._renderEtape('metrage');
        }
        return;
      }

      // Clic corps → typeCorps si élec/plomberie, sinon pièces directement
      const corps = e.target.closest('[data-cex-corps]');
      if (corps) {
        const id = corps.dataset.cexCorps;
        if (!this._corpsActifs.includes(id)) this._corpsActifs.push(id);
        this._corpsEnCours = this._corpsActifs.indexOf(id);
        if (['electricite','plomberie','maconnerie'].includes(id)) {
          this._renderEtape('typeCorps');
        } else {
          this._renderEtape('pieces');
        }
        return;
      }
    }, { signal });
  },

};

window.CalcExpressV2 = CalcExpressV2;
