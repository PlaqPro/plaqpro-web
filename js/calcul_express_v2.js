/**
 * PlaqPro+ — Calcul Express V2
 * Point d entree unique : chantier → profil → ST → corps metiers → pieces → metrages → resultat
 * Architecture validee 02/06/2026
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 */

/* global App, DB */

const CalcExpressV2 = {

  // ── Etat courant ──────────────────────────────────────────
  _chantier:      null,
  _profil:        null,   // particulier | pro | ao
  _sousTraitants: [],
  _corpsActifs:   [],
  _pieces:        [],     // [{ nom, corps, surface, ouvrages }]
  _resultats:     [],

  // ── Liste corps de metiers disponibles ────────────────────
  CORPS: [
    { id: 'plaquisterie', label: 'Plaquisterie',  icone: '🧱' },
    { id: 'peinture',     label: 'Peinture',       icone: '🎨' },
    { id: 'electricite',  label: 'Electricite',    icone: '⚡' },
    { id: 'plomberie',    label: 'Plomberie',      icone: '🔧' },
    { id: 'maconnerie',   label: 'Maconnerie',     icone: '🏗' },
    { id: 'paysagisme',   label: 'Paysagisme',     icone: '🌿' },
  ],

  // ── Pieces par profil ─────────────────────────────────────
  PIECES_PROFIL: {
    particulier: ['Salon', 'Sejour', 'Cuisine', 'Chambre 1', 'Chambre 2',
                  'Salle de bain', 'WC', 'Entree', 'Couloir', 'Garage'],
    pro:         ['Bureau 1', 'Bureau 2', 'Salle de reunion', 'Hall',
                  'Couloir', 'Depot', 'Local technique', 'Sanitaires'],
    ao:          [], // genere depuis lots DPGF
  },

  // ── Point d entree ────────────────────────────────────────
  init(containerId) {
    this._containerId = containerId;
    this._container = document.getElementById(containerId);
    if (!this._container) return;
    this._reset();
    this._renderEtape('chantier');
  },

  _reset() {
    this._chantier      = null;
    this._profil        = null;
    this._sousTraitants = [];
    this._corpsActifs   = [];
    this._pieces        = [];
    this._resultats     = [];
  },

  // ── Rendu etapes (a implementer) ─────────────────────────
  _renderEtape(etape) {
    // TODO : etape chantier, profil, st, corps, pieces, metrage, resultat
    if (!this._container) return;
    this._container.innerHTML = '<p style="color:var(--text-secondary)">CalcExpressV2 — etape : ' + etape + '</p>';
  },

  // ── Calcul ouvrage (moteur arriere-plan) ─────────────────
  _calcOuvrage(codeOuvrage, quantite) {
    // TODO : lire OUVRAGES_TYPES + OUVRAGES_COMPOSITION + MASTER_MATERIAUX
    // Retourner { coutMat, coutMO, coutST, marge, prixVente, gain }
    return null;
  },

  // ── Sous-total ────────────────────────────────────────────
  _sousTotal() {
    return this._resultats.reduce((acc, r) => acc + (r.gain || 0), 0);
  },

};

window.CalcExpressV2 = CalcExpressV2;
