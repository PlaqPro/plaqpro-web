/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Pack Électricité (NF C 15-100)
//  pack_electricite.js
// ============================================================

// ── Page ─────────────────────────────────────────────────────
Pages.electricite = function() {
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="elec-hero">
      <div class="elec-hero-inner">
        <div class="elec-hero-icon">⚡</div>
        <div>
          <h1 class="elec-hero-title">Pack Électricité</h1>
          <p class="elec-hero-sub">Dimensionnement NF C 15-100 — tableaux, câblage, éclairage, prises, mise à la terre</p>
        </div>
        <div class="elec-norme-badge">NF C 15-100</div>
      </div>
    </div>

    <div class="calc-grid">

      <!-- PANNEAU SAISIE -->
      <div class="calc-panel">
        <div class="calc-tabs">
          <button class="calc-tab active" data-tab="tableau" onclick="Electricite.switchTab('tableau',this)">
            <span class="calc-tab-icon">🗂️</span> Tableau
          </button>
          <button class="calc-tab" data-tab="cablage" onclick="Electricite.switchTab('cablage',this)">
            <span class="calc-tab-icon">🔌</span> Câblage
          </button>
          <button class="calc-tab" data-tab="eclairage" onclick="Electricite.switchTab('eclairage',this)">
            <span class="calc-tab-icon">💡</span> Éclairage
          </button>
          <button class="calc-tab" data-tab="prises" onclick="Electricite.switchTab('prises',this)">
            <span class="calc-tab-icon">🔋</span> Prises
          </button>
          <button class="calc-tab" data-tab="terre" onclick="Electricite.switchTab('terre',this)">
            <span class="calc-tab-icon">🌍</span> Terre
          </button>
        </div>

        <!-- TAB TABLEAU ÉLECTRIQUE -->
        <div id="elec-tab-tableau" class="calc-form active">
          <div class="calc-section-title">🏠 Logement</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface totale</label>
              <div class="calc-input-wrap">
                <input type="number" id="tb-surface" value="80" min="10" step="5" oninput="Electricite.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Nb de pièces</label>
              <div class="calc-input-wrap">
                <input type="number" id="tb-pieces" value="4" min="1" max="20" step="1" oninput="Electricite.compute()">
                <span class="calc-unit">pièces</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">⚡ Équipements électriques</div>
          <div class="calc-check-2col">
            <label class="calc-check"><input type="checkbox" id="tb-lave-linge" checked onchange="Electricite.compute()"><span>Lave-linge (20A)</span></label>
            <label class="calc-check"><input type="checkbox" id="tb-seche-linge" onchange="Electricite.compute()"><span>Sèche-linge (20A)</span></label>
            <label class="calc-check"><input type="checkbox" id="tb-lave-vaisselle" checked onchange="Electricite.compute()"><span>Lave-vaisselle (20A)</span></label>
            <label class="calc-check"><input type="checkbox" id="tb-four" checked onchange="Electricite.compute()"><span>Four encastré (32A)</span></label>
            <label class="calc-check"><input type="checkbox" id="tb-induction" onchange="Electricite.compute()"><span>Plaques induction (32A)</span></label>
            <label class="calc-check"><input type="checkbox" id="tb-clim" onchange="Electricite.compute()"><span>Climatisation (20A)</span></label>
            <label class="calc-check"><input type="checkbox" id="tb-vmc" checked onchange="Electricite.compute()"><span>VMC (2A)</span></label>
            <label class="calc-check"><input type="checkbox" id="tb-chauffe-eau" checked onchange="Electricite.compute()"><span>Chauffe-eau (20A)</span></label>
            <label class="calc-check"><input type="checkbox" id="tb-garage" onchange="Electricite.compute()"><span>Circuit garage/ext. (16A)</span></label>
            <label class="calc-check"><input type="checkbox" id="tb-piscine" onchange="Electricite.compute()"><span>Piscine / spa (32A)</span></label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="tb-marge-mat" value="30" min="0" max="100" oninput="Electricite.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="tb-marge-mo" value="20" min="0" max="100" oninput="Electricite.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB CÂBLAGE -->
        <div id="elec-tab-cablage" class="calc-form">
          <div class="calc-section-title">📐 Paramètres du circuit</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Longueur du circuit</label>
              <div class="calc-input-wrap">
                <input type="number" id="ca-longueur" value="15" min="1" step="1" oninput="Electricite.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Puissance totale</label>
              <div class="calc-input-wrap">
                <input type="number" id="ca-puissance" value="2000" min="100" step="100" oninput="Electricite.compute()">
                <span class="calc-unit">W</span>
              </div>
            </div>
          </div>
          <div class="calc-input-row" style="margin-top:12px">
            <div class="calc-input-group">
              <label>Tension</label>
              <div class="calc-input-wrap">
                <input type="number" id="ca-tension" value="230" min="110" max="400" oninput="Electricite.compute()">
                <span class="calc-unit">V</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Nb circuits identiques</label>
              <div class="calc-input-wrap">
                <input type="number" id="ca-nb" value="1" min="1" max="20" oninput="Electricite.compute()">
                <span class="calc-unit">circuits</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">⚙️ Type de circuit</div>
          <div class="calc-radio-group">
            <label class="calc-radio">
              <input type="radio" name="ca-type" value="eclairage" onchange="Electricite.compute()">
              <span>Éclairage — 1.5 mm² · 10A max</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="ca-type" value="prises" checked onchange="Electricite.compute()">
              <span>Prises courant — 2.5 mm² · 16A max</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="ca-type" value="cuisine" onchange="Electricite.compute()">
              <span>Cuisine spécialisée — 6 mm² · 32A max</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="ca-type" value="auto" onchange="Electricite.compute()">
              <span>Auto — section calculée selon puissance</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">🩹 Options</div>
          <div class="calc-check-group">
            <label class="calc-check"><input type="checkbox" id="ca-gaine" checked onchange="Electricite.compute()"><span>Inclure gaines ICTA</span></label>
            <label class="calc-check"><input type="checkbox" id="ca-boites" checked onchange="Electricite.compute()"><span>Inclure boîtes de dérivation (1/5ml)</span></label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="ca-marge-mat" value="30" min="0" max="100" oninput="Electricite.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="ca-marge-mo" value="20" min="0" max="100" oninput="Electricite.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB ÉCLAIRAGE -->
        <div id="elec-tab-eclairage" class="calc-form">
          <div class="calc-section-title">🏠 Pièce à éclairer</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface</label>
              <div class="calc-input-wrap">
                <input type="number" id="ec-surface" value="20" min="1" step="0.5" oninput="Electricite.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Hauteur plafond</label>
              <div class="calc-input-wrap">
                <input type="number" id="ec-hauteur" value="2.50" min="1.80" step="0.05" oninput="Electricite.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">💡 Type de pièce</div>
          <div class="calc-radio-group">
            <label class="calc-radio"><input type="radio" name="ec-type" value="sejour" checked onchange="Electricite.compute()"><span>Séjour / Salon — 100 lux</span></label>
            <label class="calc-radio"><input type="radio" name="ec-type" value="cuisine" onchange="Electricite.compute()"><span>Cuisine / Bureau — 300 lux</span></label>
            <label class="calc-radio"><input type="radio" name="ec-type" value="chambre" onchange="Electricite.compute()"><span>Chambre — 150 lux</span></label>
            <label class="calc-radio"><input type="radio" name="ec-type" value="sdb" onchange="Electricite.compute()"><span>Salle de bain — 200 lux</span></label>
            <label class="calc-radio"><input type="radio" name="ec-type" value="couloir" onchange="Electricite.compute()"><span>Couloir / Dégagement — 75 lux</span></label>
          </div>

          <div class="calc-section-title mt-16">🔦 Interrupteurs</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Nb entrées / accès</label>
              <div class="calc-input-wrap">
                <input type="number" id="ec-entrees" value="1" min="1" max="4" step="1" oninput="Electricite.compute()">
                <span class="calc-unit">accès</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Nb pièces identiques</label>
              <div class="calc-input-wrap">
                <input type="number" id="ec-nb" value="1" min="1" max="20" oninput="Electricite.compute()">
                <span class="calc-unit">pièces</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="ec-marge-mat" value="30" min="0" max="100" oninput="Electricite.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="ec-marge-mo" value="20" min="0" max="100" oninput="Electricite.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB PRISES & POINTS -->
        <div id="elec-tab-prises" class="calc-form">
          <div class="calc-section-title">🔌 Type de pièce</div>
          <div class="calc-radio-group">
            <label class="calc-radio"><input type="radio" name="pr-type" value="sejour" checked onchange="Electricite.compute()"><span>Séjour — 5 prises min NF C 15-100</span></label>
            <label class="calc-radio"><input type="radio" name="pr-type" value="chambre" onchange="Electricite.compute()"><span>Chambre — 3 prises min</span></label>
            <label class="calc-radio"><input type="radio" name="pr-type" value="cuisine" onchange="Electricite.compute()"><span>Cuisine — 6 prises (dont 4 plan de travail)</span></label>
            <label class="calc-radio"><input type="radio" name="pr-type" value="bureau" onchange="Electricite.compute()"><span>Bureau — 5 prises + 2 RJ45</span></label>
            <label class="calc-radio"><input type="radio" name="pr-type" value="sdb" onchange="Electricite.compute()"><span>Salle de bain — 1 prise rasoir zone 3</span></label>
            <label class="calc-radio"><input type="radio" name="pr-type" value="couloir" onchange="Electricite.compute()"><span>Couloir / WC — 1 prise</span></label>
          </div>

          <div class="calc-section-title mt-16">📡 Points de communication</div>
          <div class="calc-check-2col">
            <label class="calc-check"><input type="checkbox" id="pr-rj45" onchange="Electricite.compute()"><span>Prise RJ45</span></label>
            <label class="calc-check"><input type="checkbox" id="pr-tv" onchange="Electricite.compute()"><span>Prise TV (coaxiale)</span></label>
            <label class="calc-check"><input type="checkbox" id="pr-tel" onchange="Electricite.compute()"><span>Prise téléphone</span></label>
          </div>

          <div class="calc-section-title mt-16">📐 Dimensions pour câblage</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Distance moy. au tableau</label>
              <div class="calc-input-wrap">
                <input type="number" id="pr-dist" value="10" min="1" step="1" oninput="Electricite.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Nb pièces identiques</label>
              <div class="calc-input-wrap">
                <input type="number" id="pr-nb" value="1" min="1" max="20" oninput="Electricite.compute()">
                <span class="calc-unit">pièces</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="pr-marge-mat" value="30" min="0" max="100" oninput="Electricite.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="pr-marge-mo" value="20" min="0" max="100" oninput="Electricite.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB MISE À LA TERRE -->
        <div id="elec-tab-terre" class="calc-form">
          <div class="calc-section-title">🌍 Type de sol</div>
          <div class="calc-radio-group">
            <label class="calc-radio"><input type="radio" name="te-sol" value="argile" checked onchange="Electricite.compute()"><span>Argile / limon — ρ = 30 Ω·m</span></label>
            <label class="calc-radio"><input type="radio" name="te-sol" value="terre" onchange="Electricite.compute()"><span>Terre végétale — ρ = 50 Ω·m</span></label>
            <label class="calc-radio"><input type="radio" name="te-sol" value="calcaire" onchange="Electricite.compute()"><span>Calcaire / gravier — ρ = 200 Ω·m</span></label>
            <label class="calc-radio"><input type="radio" name="te-sol" value="sableux" onchange="Electricite.compute()"><span>Sableux / granitique — ρ = 500 Ω·m</span></label>
          </div>

          <div class="calc-section-title mt-16">📐 Configuration</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Longueur piquet</label>
              <div class="calc-input-wrap">
                <input type="number" id="te-longueur" value="2" min="0.5" step="0.5" oninput="Electricite.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Nb piquets</label>
              <div class="calc-input-wrap">
                <input type="number" id="te-nb-piquets" value="1" min="1" max="10" oninput="Electricite.compute()">
                <span class="calc-unit">u</span>
              </div>
            </div>
          </div>
          <div class="calc-input-row" style="margin-top:12px">
            <div class="calc-input-group">
              <label>Longueur câble de terre</label>
              <div class="calc-input-wrap">
                <input type="number" id="te-cable" value="8" min="1" step="1" oninput="Electricite.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🔒 Différentiels 30 mA</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Circuits à protéger</label>
              <div class="calc-input-wrap">
                <input type="number" id="te-diff" value="4" min="1" max="20" oninput="Electricite.compute()">
                <span class="calc-unit">circuits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PANNEAU RÉSULTATS -->
      <div>
        <!-- Alertes NF C 15-100 -->
        <div id="elec-alertes" style="margin-bottom:12px"></div>

        <div class="calc-results">
          <div class="calc-results-header">
            <span class="calc-results-title">📊 Estimation électricité</span>
            <div style="display:flex;gap:8px">
              <button class="btn btn-secondary btn-sm" onclick="Electricite.copier()">📋 Copier</button>
              <button class="btn btn-primary btn-sm" onclick="Electricite.creerDevis()">📄 Créer devis</button>
            </div>
          </div>
          <div id="elec-results-body" style="padding:16px">
            <div class="calc-empty">
              <div style="font-size:36px;margin-bottom:12px">⚡</div>
              <div style="color:var(--text-tertiary);font-size:14px">Renseignez les paramètres pour obtenir l'estimation</div>
            </div>
          </div>
        </div>

        <!-- Sections câble -->
        <div class="calc-results" style="margin-top:16px">
          <div class="calc-results-header">
            <span class="calc-results-title">📏 Sections câbles NF C 15-100</span>
          </div>
          <div style="padding:14px">
            ${[
              ['Éclairage','1.5 mm²','10A','Disj. 10A'],
              ['Prises courant','2.5 mm²','16A','Disj. 16A'],
              ['Lave-linge / LV','2.5 mm²','20A','Disj. 20A'],
              ['Chauffe-eau','2.5 mm²','20A','Disj. 20A'],
              ['Four encastré','6 mm²','32A','Disj. 32A'],
              ['Plaques induction','6 mm²','32A','Disj. 32A'],
              ['Climatisation','2.5 mm²','20A','Disj. 20A'],
              ['VMC','1.5 mm²','2A','Disj. 2A'],
            ].map(([u,s,i,d]) => `
              <div class="elec-ref-row">
                <span class="elec-ref-usage">${u}</span>
                <span class="elec-ref-section">${s}</span>
                <span class="elec-ref-int">${i}</span>
                <span class="elec-ref-disj">${d}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  Electricite._injectStyles();
  setTimeout(() => Electricite.compute(), 50);
  return div;
};

// ============================================================
//  MOTEUR DE CALCUL ÉLECTRICITÉ
// ============================================================
var Electricite = {

  _tab: 'tableau',
  _lastResult: null,

  // Prix par défaut (€)
  PRIX: {
    CAB_15:    0.85,   // €/ml câble H07V-U 1.5mm²
    CAB_25:    1.20,   // €/ml câble H07V-U 2.5mm²
    CAB_4:     1.80,   // €/ml câble H07V-U 4mm²
    CAB_6:     2.50,   // €/ml câble H07V-U 6mm²
    CAB_10:    3.80,   // €/ml câble H07V-U 10mm²
    ICTA16:    0.45,   // €/ml gaine ICTA 16mm
    ICTA20:    0.60,   // €/ml gaine ICTA 20mm
    DISJ10:    7.50,   // €/u disjoncteur 10A
    DISJ16:    8.50,   // €/u disjoncteur 16A
    DISJ20:    9.50,   // €/u disjoncteur 20A
    DISJ32:    12.00,  // €/u disjoncteur 32A
    DISJ_GEN:  45.00,  // €/u disjoncteur général
    DIFF30MA:  25.00,  // €/u différentiel 30mA type A
    TAB13:     35.00,  // €/u tableau 13 modules
    TAB26:     55.00,  // €/u tableau 26 modules
    TAB52:     90.00,  // €/u tableau 52 modules
    PRISE2PT:  4.50,   // €/u prise 2P+T
    INTER_S:   3.50,   // €/u interrupteur simple
    VA_VT:     5.50,   // €/u va-et-vient
    SPOT_LED:  12.00,  // €/u spot LED 10W 800lm
    BOITE_DER: 2.80,   // €/u boîte de dérivation Ø60
    PIQUET_T:  18.00,  // €/u piquet de terre cuivré 2m
    CAB_TERRE: 1.20,   // €/ml câble de terre vert/jaune 16mm²
    PRISE_RJ45: 8.50,  // €/u prise RJ45 Cat.6
    PRISE_TV:  6.50,   // €/u prise TV coaxiale
  },

  // ── Helpers ───────────────────────────────────────────────
  v(id, def) {
    const el = document.getElementById(id);
    return el ? (parseFloat(el.value) || def) : def;
  },

  checked(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
  },

  radio(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  },

  fmt(n) {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
  },

  fmtN(n, d) {
    d = d !== undefined ? d : 1;
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n || 0);
  },

  tauxMO() {
    return DB.getRatio('TAUX_HORAIRE_MO') || 35;
  },

  // Section câble selon intensité
  _sectionPourIntensité(iA) {
    if (iA <= 10)  return { section: 1.5, ref: 'CAB_15', label: '1.5 mm²', iMax: 10 };
    if (iA <= 16)  return { section: 2.5, ref: 'CAB_25', label: '2.5 mm²', iMax: 16 };
    if (iA <= 25)  return { section: 4,   ref: 'CAB_4',  label: '4 mm²',   iMax: 25 };
    if (iA <= 32)  return { section: 6,   ref: 'CAB_6',  label: '6 mm²',   iMax: 32 };
    return             { section: 10,  ref: 'CAB_10', label: '10 mm²',  iMax: 50 };
  },

  _prixCable(ref) { return this.PRIX[ref] || 1.0; },

  // Chute de tension (cuivre, monophasé aller-retour)
  _chuteTension(longueurML, intensiteA, sectionMm2) {
    const rho = 0.023; // Ω·mm²/m pour cuivre
    const deltaU = (2 * rho * longueurML * intensiteA) / sectionMm2;
    return (deltaU / 230) * 100; // %
  },

  // ── Onglets ───────────────────────────────────────────────
  switchTab(tab, btn) {
    this._tab = tab;
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-form').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    const form = document.getElementById('elec-tab-' + tab);
    if (form) form.classList.add('active');
    this.compute();
  },

  // ── Dispatch ─────────────────────────────────────────────
  compute() {
    let result;
    switch (this._tab) {
      case 'tableau':   result = this._calcTableau();   break;
      case 'cablage':   result = this._calcCablage();   break;
      case 'eclairage': result = this._calcEclairage(); break;
      case 'prises':    result = this._calcPrises();    break;
      case 'terre':     result = this._calcTerre();     break;
    }
    if (result) this._renderResults(result);
  },

  // ── Calcul TABLEAU ÉLECTRIQUE ─────────────────────────────
  _calcTableau() {
    const surface  = this.v('tb-surface', 80);
    const pieces   = this.v('tb-pieces', 4);
    const margeMat = this.v('tb-marge-mat', 30) / 100;
    const margeMO  = this.v('tb-marge-mo', 20) / 100;

    const alertes = [];
    const circuits = [];

    // Circuits éclairage : 1 circuit pour 8 points, 1.5mm², 10A
    const nbCircEcl = Math.max(1, Math.ceil(pieces / 3));
    for (let i = 0; i < nbCircEcl; i++) {
      circuits.push({ label: `Éclairage circuit ${i+1}`, intensite: 10, section: 1.5, disj: 'DISJ10' });
    }

    // Circuits prises : 1 circuit pour ~8 prises, 2.5mm², 16A
    const nbPrisesEst = Math.ceil(surface * 0.5);
    const nbCircPrises = Math.max(1, Math.ceil(nbPrisesEst / 8));
    for (let i = 0; i < nbCircPrises; i++) {
      circuits.push({ label: `Prises circuit ${i+1}`, intensite: 16, section: 2.5, disj: 'DISJ16' });
    }

    // Équipements spécialisés
    const equip = [
      { id: 'tb-lave-linge',    label: 'Lave-linge',    A: 20, disj: 'DISJ20' },
      { id: 'tb-seche-linge',   label: 'Sèche-linge',   A: 20, disj: 'DISJ20' },
      { id: 'tb-lave-vaisselle',label: 'Lave-vaisselle', A: 20, disj: 'DISJ20' },
      { id: 'tb-four',          label: 'Four encastré',  A: 32, disj: 'DISJ32' },
      { id: 'tb-induction',     label: 'Induction',      A: 32, disj: 'DISJ32' },
      { id: 'tb-clim',          label: 'Climatisation',  A: 20, disj: 'DISJ20' },
      { id: 'tb-vmc',           label: 'VMC',            A: 10, disj: 'DISJ10' },
      { id: 'tb-chauffe-eau',   label: 'Chauffe-eau',    A: 20, disj: 'DISJ20' },
      { id: 'tb-garage',        label: 'Garage / ext.',  A: 16, disj: 'DISJ16' },
      { id: 'tb-piscine',       label: 'Piscine / spa',  A: 32, disj: 'DISJ32' },
    ];

    equip.forEach(e => {
      if (this.checked(e.id)) {
        circuits.push({ label: e.label, intensite: e.A, section: e.A <= 16 ? 2.5 : (e.A <= 25 ? 4 : 6), disj: e.disj });
      }
    });

    // Alertes contextuelles
    if (this.checked('tb-four') || this.checked('tb-induction')) {
      alertes.push({ type: 'warning', msg: '⚠️ Circuit cuisine → disjoncteur 32A et câble 6mm² obligatoires (NF C 15-100 art. 771)' });
    }
    alertes.push({ type: 'info', msg: '📋 Tableau → réserve 20% disjoncteurs obligatoire — prévoir modules supplémentaires' });
    alertes.push({ type: 'info', msg: '🔌 Mise à la terre → vérification obligatoire avant CONSUEL (résistance < 100Ω)' });
    this._renderAlertes(alertes);

    // Réserve 20%
    const nbCircTotal = circuits.length;
    const nbReserve   = Math.ceil(nbCircTotal * 0.20);
    const nbModules   = nbCircTotal + nbReserve + 2; // +2 différentiels

    // Tableau recommandé
    let tableau, prixTab;
    if (nbModules <= 13) {
      tableau = 'Tableau 13 modules'; prixTab = this.PRIX.TAB13;
    } else if (nbModules <= 26) {
      tableau = 'Tableau 26 modules'; prixTab = this.PRIX.TAB26;
    } else {
      tableau = 'Tableau 52 modules'; prixTab = this.PRIX.TAB52;
    }

    // Puissance totale → disjoncteur général
    const puissanceW = circuits.reduce((s, c) => s + c.intensite * 230, 0);
    const iGen = puissanceW / 230;
    let iDisjGen;
    if (iGen <= 15)  iDisjGen = 15;
    else if (iGen <= 30) iDisjGen = 30;
    else if (iGen <= 45) iDisjGen = 45;
    else iDisjGen = 60;

    // Différentiels (1 pour 8 circuits)
    const nbDiff = Math.max(2, Math.ceil(circuits.length / 8));

    // Coût matériaux
    const nbDisj10 = circuits.filter(c => c.disj === 'DISJ10').length;
    const nbDisj16 = circuits.filter(c => c.disj === 'DISJ16').length;
    const nbDisj20 = circuits.filter(c => c.disj === 'DISJ20').length;
    const nbDisj32 = circuits.filter(c => c.disj === 'DISJ32').length;

    const pDisj10 = nbDisj10 * this.PRIX.DISJ10;
    const pDisj16 = nbDisj16 * this.PRIX.DISJ16;
    const pDisj20 = nbDisj20 * this.PRIX.DISJ20;
    const pDisj32 = nbDisj32 * this.PRIX.DISJ32;
    const pDiff   = nbDiff   * this.PRIX.DIFF30MA;
    const pDisjGen = this.PRIX.DISJ_GEN;

    const coutMat = prixTab + pDisjGen + pDisj10 + pDisj16 + pDisj20 + pDisj32 + pDiff;
    const hMO     = nbCircTotal * 2;
    const coutMO  = hMO * this.tauxMO();

    const itemsDisj = [];
    if (nbDisj10 > 0) itemsDisj.push({ icon: '🔵', nom: 'Disjoncteur 10A (éclairage/VMC)', qte: `${nbDisj10} u`, prix: pDisj10 });
    if (nbDisj16 > 0) itemsDisj.push({ icon: '🟢', nom: 'Disjoncteur 16A (prises)', qte: `${nbDisj16} u`, prix: pDisj16 });
    if (nbDisj20 > 0) itemsDisj.push({ icon: '🟡', nom: 'Disjoncteur 20A (spécialisé)', qte: `${nbDisj20} u`, prix: pDisj20 });
    if (nbDisj32 > 0) itemsDisj.push({ icon: '🔴', nom: 'Disjoncteur 32A (four/induction)', qte: `${nbDisj32} u`, prix: pDisj32 });

    const sections = [
      {
        titre: `${tableau} — ${nbCircTotal} circuits + ${nbReserve} réserves (${nbModules} modules)`,
        items: [
          { icon: '🗂️', nom: tableau,              qte: '1 u', prix: prixTab },
          { icon: '⚡', nom: `Disjoncteur général ${iDisjGen}A`, qte: '1 u', prix: pDisjGen },
          { icon: '🛡️', nom: `Différentiel 30mA type A`,        qte: `${nbDiff} u`, prix: pDiff },
          ...itemsDisj,
        ],
      },
    ];

    return { sections, coutMat, coutMO, margeMat, margeMO, surface, hMO,
      meta: { nbCircuits: nbCircTotal, iDisjGen, nbModules } };
  },

  // ── Calcul CÂBLAGE ────────────────────────────────────────
  _calcCablage() {
    const longueur  = this.v('ca-longueur', 15);
    const puissance = this.v('ca-puissance', 2000);
    const tension   = this.v('ca-tension', 230);
    const nbCirc    = this.v('ca-nb', 1);
    const typeCirc  = this.radio('ca-type') || 'prises';
    const avecGaine = this.checked('ca-gaine');
    const avecBoites= this.checked('ca-boites');
    const margeMat  = this.v('ca-marge-mat', 30) / 100;
    const margeMO   = this.v('ca-marge-mo', 20) / 100;

    const intensite = puissance / tension;
    const alertes = [];

    let secObj;
    if (typeCirc === 'eclairage')  secObj = { section: 1.5, ref: 'CAB_15', label: '1.5 mm²', iMax: 10 };
    else if (typeCirc === 'prises') secObj = { section: 2.5, ref: 'CAB_25', label: '2.5 mm²', iMax: 16 };
    else if (typeCirc === 'cuisine') secObj = { section: 6, ref: 'CAB_6', label: '6 mm²', iMax: 32 };
    else secObj = this._sectionPourIntensité(intensite);

    const chute = this._chuteTension(longueur, intensite, secObj.section);
    if (chute > 3) {
      alertes.push({ type: 'error', msg: `⛔ Chute de tension ${this.fmtN(chute, 1)}% > 3% max — passer à la section supérieure` });
      const secSup = this._sectionPourIntensité(intensite * 1.5);
      secObj = secSup;
    } else if (chute > 2) {
      alertes.push({ type: 'warning', msg: `⚠️ Chute de tension ${this.fmtN(chute, 1)}% — limite recommandée 2% (max NF 3%)` });
    } else {
      alertes.push({ type: 'ok', msg: `✅ Chute de tension ${this.fmtN(chute, 1)}% — conforme NF C 15-100 (max 3%)` });
    }

    if (typeCirc === 'eclairage') alertes.push({ type: 'info', msg: '💡 Circuit éclairage → maximum 8 points lumineux par circuit' });
    if (typeCirc === 'prises')    alertes.push({ type: 'info', msg: '🔌 Circuit prises → maximum 8 prises par circuit 16A' });
    this._renderAlertes(alertes);

    const longueurTot = longueur * nbCirc;
    const pCable = longueurTot * this._prixCable(secObj.ref);

    let pGaine = 0, longueurGaine = 0;
    if (avecGaine) {
      longueurGaine = longueurTot * 1.20;
      pGaine = longueurGaine * (secObj.section <= 2.5 ? this.PRIX.ICTA16 : this.PRIX.ICTA20);
    }

    let nbBoites = 0, pBoites = 0;
    if (avecBoites) {
      nbBoites = Math.ceil(longueurTot / 5);
      pBoites = nbBoites * this.PRIX.BOITE_DER;
    }

    const coutMat = pCable + pGaine + pBoites;
    const hMO     = longueurTot * 0.25;
    const coutMO  = hMO * this.tauxMO();

    const items = [
      { icon: '🔌', nom: `Câble H07V-U ${secObj.label} (${nbCirc} circuit${nbCirc>1?'s':''})`, qte: `${this.fmtN(longueurTot)} ml`, prix: pCable },
    ];
    if (avecGaine)  items.push({ icon: '🧵', nom: `Gaine ICTA ${secObj.section <= 2.5 ? '16':'20'}mm`, qte: `${this.fmtN(longueurGaine)} ml`, prix: pGaine });
    if (avecBoites) items.push({ icon: '📦', nom: 'Boîtes de dérivation Ø60', qte: `${nbBoites} u`, prix: pBoites });

    const sections = [{
      titre: `Circuit ${secObj.label} — I=${this.fmtN(intensite,1)}A · ${this.fmtN(longueur)} ml × ${nbCirc} circuit${nbCirc>1?'s':''}`,
      items,
    }];

    return { sections, coutMat, coutMO, margeMat, margeMO, surface: longueurTot, hMO };
  },

  // ── Calcul ÉCLAIRAGE ──────────────────────────────────────
  _calcEclairage() {
    const surface   = this.v('ec-surface', 20);
    const hauteur   = this.v('ec-hauteur', 2.50);
    const type      = this.radio('ec-type') || 'sejour';
    const entrees   = this.v('ec-entrees', 1);
    const nbPieces  = this.v('ec-nb', 1);
    const margeMat  = this.v('ec-marge-mat', 30) / 100;
    const margeMO   = this.v('ec-marge-mo', 20) / 100;

    const lux = { sejour: 100, cuisine: 300, chambre: 150, sdb: 200, couloir: 75 }[type] || 100;
    const label = { sejour: 'Séjour', cuisine: 'Cuisine/Bureau', chambre: 'Chambre', sdb: 'Salle de bain', couloir: 'Couloir' }[type] || '';

    const alertes = [];
    if (type === 'sdb') {
      alertes.push({ type: 'warning', msg: '🚿 Salle de bain → zones 0/1/2 — matériel IPX4 minimum, IP44 en zone 1, luminaires étanches obligatoires' });
    }
    if (type === 'cuisine') {
      alertes.push({ type: 'info', msg: '🍳 Cuisine → prévoir éclairage plan de travail séparé (300 lux minimum NF EN 12464)' });
    }
    this._renderAlertes(alertes);

    // Flux lumineux total (lm) = lux × surface × coefficient d'utilisation 0.8
    const fluxTotal = lux * surface / 0.8;
    // Spot LED 10W = 800 lm
    const nbSpots = Math.ceil(fluxTotal / 800) * nbPieces;
    const pSpots  = nbSpots * this.PRIX.SPOT_LED;

    // Interrupteurs / va-et-vient
    let nbInter = 0, pInter = 0, nbVaVt = 0, pVaVt = 0;
    if (entrees <= 1) {
      nbInter = 1 * nbPieces;
      pInter  = nbInter * this.PRIX.INTER_S;
    } else {
      nbVaVt = entrees * nbPieces;
      pVaVt  = nbVaVt * this.PRIX.VA_VT;
    }

    // Câble alimentation 1.5mm²
    const longueurCab = (Math.sqrt(surface) * 2 + 3) * nbPieces;
    const pCable      = longueurCab * this.PRIX.CAB_15;

    // Gaine ICTA 16mm
    const pGaine = longueurCab * 1.20 * this.PRIX.ICTA16;

    const coutMat = pSpots + pInter + pVaVt + pCable + pGaine;
    const hMO     = (nbSpots * 0.5) + ((nbInter + nbVaVt) * 0.5);
    const coutMO  = hMO * this.tauxMO();

    const items = [
      { icon: '💡', nom: `Spot LED 10W 800lm (${lux} lux · ${label})`, qte: `${nbSpots} u`, prix: pSpots },
    ];
    if (nbInter > 0) items.push({ icon: '🔘', nom: 'Interrupteur simple', qte: `${nbInter} u`, prix: pInter });
    if (nbVaVt > 0)  items.push({ icon: '↔️', nom: 'Va-et-vient (double entrée)', qte: `${nbVaVt} u`, prix: pVaVt });
    items.push({ icon: '🔌', nom: 'Câble 1.5mm² alimentation', qte: `${this.fmtN(longueurCab)} ml`, prix: pCable });
    items.push({ icon: '🧵', nom: 'Gaine ICTA 16mm', qte: `${this.fmtN(longueurCab*1.20)} ml`, prix: pGaine });

    const sections = [{
      titre: `Éclairage ${label} — ${this.fmtN(surface)} m² · ${lux} lux · ${nbPieces} pièce${nbPieces>1?'s':''}`,
      items,
    }];

    return { sections, coutMat, coutMO, margeMat, margeMO, surface: surface * nbPieces, hMO };
  },

  // ── Calcul PRISES & POINTS ────────────────────────────────
  _calcPrises() {
    const type    = this.radio('pr-type') || 'sejour';
    const avecRJ45= this.checked('pr-rj45');
    const avecTV  = this.checked('pr-tv');
    const avecTel = this.checked('pr-tel');
    const dist    = this.v('pr-dist', 10);
    const nbPieces= this.v('pr-nb', 1);
    const margeMat= this.v('pr-marge-mat', 30) / 100;
    const margeMO = this.v('pr-marge-mo', 20) / 100;

    const configs = {
      sejour:  { label: 'Séjour',      nbPrises: 5,  nbTV: 1 },
      chambre: { label: 'Chambre',     nbPrises: 3,  nbTV: 0 },
      cuisine: { label: 'Cuisine',     nbPrises: 6,  nbTV: 0 },
      bureau:  { label: 'Bureau',      nbPrises: 5,  nbTV: 0 },
      sdb:     { label: 'Salle de bain', nbPrises: 1, nbTV: 0 },
      couloir: { label: 'Couloir / WC', nbPrises: 1, nbTV: 0 },
    };
    const cfg = configs[type] || configs.sejour;

    const alertes = [];
    if (type === 'sdb') {
      alertes.push({ type: 'warning', msg: '🚿 Salle de bain → prise rasoir zone 3 uniquement · transformateur de sécurité TBTS · IP44 minimum' });
    }
    if (type === 'cuisine') {
      alertes.push({ type: 'info', msg: '🍳 Cuisine → 4 prises min sur plan de travail · circuit dédié 20A pour chaque gros appareil' });
    }
    this._renderAlertes(alertes);

    const nbPrises = cfg.nbPrises * nbPieces;
    const pPrises  = nbPrises * this.PRIX.PRISE2PT;

    let nbRJ45 = 0, pRJ45 = 0, nbTV = 0, pTV = 0;
    if (avecRJ45) { nbRJ45 = 1 * nbPieces; pRJ45 = nbRJ45 * this.PRIX.PRISE_RJ45; }
    if (avecTV || cfg.nbTV > 0) {
      nbTV = Math.max(cfg.nbTV, avecTV ? 1 : 0) * nbPieces;
      pTV  = nbTV * this.PRIX.PRISE_TV;
    }

    // Câble 2.5mm² + gaine ICTA
    const longueurCab = (dist + 3) * 2 * nbPieces * nbPrises / nbPieces;
    const pCable = longueurCab * this.PRIX.CAB_25;
    const pGaine = longueurCab * 1.20 * this.PRIX.ICTA16;

    const coutMat = pPrises + pRJ45 + pTV + pCable + pGaine;
    const hMO     = (nbPrises + nbRJ45 + nbTV) * 0.8;
    const coutMO  = hMO * this.tauxMO();

    const items = [
      { icon: '🔌', nom: `Prise 2P+T (${cfg.label} · NF C 15-100)`, qte: `${nbPrises} u`, prix: pPrises },
    ];
    if (pRJ45 > 0) items.push({ icon: '🌐', nom: 'Prise RJ45 Cat.6', qte: `${nbRJ45} u`, prix: pRJ45 });
    if (pTV   > 0) items.push({ icon: '📺', nom: 'Prise TV coaxiale', qte: `${nbTV} u`, prix: pTV });
    items.push({ icon: '🔌', nom: 'Câble H07V-U 2.5mm²', qte: `${this.fmtN(longueurCab)} ml`, prix: pCable });
    items.push({ icon: '🧵', nom: 'Gaine ICTA 16mm', qte: `${this.fmtN(longueurCab*1.20)} ml`, prix: pGaine });

    const sections = [{
      titre: `${cfg.label} × ${nbPieces} — ${nbPrises} prises + communication`,
      items,
    }];

    return { sections, coutMat, coutMO, margeMat, margeMO, surface: nbPieces * dist, hMO };
  },

  // ── Calcul MISE À LA TERRE ────────────────────────────────
  _calcTerre() {
    const sol       = this.radio('te-sol') || 'argile';
    const longueur  = this.v('te-longueur', 2);
    const nbPiquets = this.v('te-nb-piquets', 1);
    const longueurCab = this.v('te-cable', 8);
    const nbDiff    = this.v('te-diff', 4);
    const margeMat  = this.v('tb-marge-mat', 30) / 100;
    const margeMO   = this.v('tb-marge-mo', 20) / 100;

    const rhoSols = { argile: 30, terre: 50, calcaire: 200, sableux: 500 };
    const rho     = rhoSols[sol] || 50;

    // Résistance piquet (formule simplifiée)
    const diam   = 0.014; // 14mm diamètre piquet cuivré standard
    const R1 = (rho / (2 * Math.PI * longueur)) * Math.log(4 * longueur / diam);
    const Rtot = R1 / nbPiquets; // piquets en parallèle

    const alertes = [];
    alertes.push({ type: 'info', msg: '🔌 Mise à la terre → vérification obligatoire avant CONSUEL (résistance < 100 Ω)' });
    if (Rtot > 100) {
      alertes.push({ type: 'error', msg: `⛔ Résistance estimée ${this.fmtN(Rtot, 0)} Ω > 100 Ω — ajouter des piquets ou changer d'emplacement` });
    } else if (Rtot > 50) {
      alertes.push({ type: 'warning', msg: `⚠️ Résistance estimée ${this.fmtN(Rtot, 0)} Ω — conforme (< 100Ω) mais amélioration recommandée` });
    } else {
      alertes.push({ type: 'ok', msg: `✅ Résistance estimée ${this.fmtN(Rtot, 0)} Ω — excellente mise à la terre (< 50Ω)` });
    }
    alertes.push({ type: 'info', msg: '🛡️ Différentiel 30mA type A obligatoire sur tous les circuits (NF C 15-100 art. 531)' });
    this._renderAlertes(alertes);

    const pPiquets = nbPiquets * this.PRIX.PIQUET_T;
    const pCable   = longueurCab * this.PRIX.CAB_TERRE;
    const pDiff    = nbDiff * this.PRIX.DIFF30MA;

    const coutMat = pPiquets + pCable + pDiff;
    const hMO     = nbPiquets * 1.5 + 2;
    const coutMO  = hMO * this.tauxMO();

    const verifs = [
      '✓ Disjoncteur différentiel 30mA type A sur chaque rangée',
      '✓ Mise à la terre sur toutes les prises 2P+T',
      '✓ Liaison équipotentielle principale (LPM)',
      '✓ Liaison équipotentielle salle de bain (LES)',
      '✓ Réserve 20% sur tableau électrique',
      '✓ Protection contre les surtensions (parafoudre si zone exposée)',
    ];

    const sections = [
      {
        titre: `Mise à la terre — ${nbPiquets} piquet${nbPiquets>1?'s':''} ${longueur}m · R≈${this.fmtN(Rtot,0)} Ω`,
        items: [
          { icon: '⚡', nom: `Piquet cuivré Ø14mm ${longueur}m`, qte: `${nbPiquets} u`, prix: pPiquets },
          { icon: '🟡', nom: 'Câble de terre vert/jaune 16mm²',  qte: `${this.fmtN(longueurCab)} ml`, prix: pCable },
          { icon: '🛡️', nom: 'Différentiel 30mA type A',         qte: `${nbDiff} u`, prix: pDiff },
        ],
      },
      {
        titre: '📋 Vérifications CONSUEL obligatoires',
        items: verifs.map(v => ({ icon: '✅', nom: v, qte: '', prix: 0 })),
      },
    ];

    return { sections, coutMat, coutMO, margeMat, margeMO, surface: nbPiquets, hMO };
  },

  // ── Alertes contextuelles NF C 15-100 ────────────────────
  _renderAlertes(alertes) {
    const el = document.getElementById('elec-alertes');
    if (!el || !alertes.length) { if (el) el.innerHTML = ''; return; }

    const couleurs = {
      error:   { bg: 'rgba(247,91,91,0.12)',   border: 'rgba(247,91,91,0.3)',   text: '#F75B5B' },
      warning: { bg: 'rgba(247,166,79,0.12)',  border: 'rgba(247,166,79,0.3)',  text: '#F7A64F' },
      ok:      { bg: 'rgba(45,212,160,0.10)',  border: 'rgba(45,212,160,0.25)', text: '#2DD4A0' },
      info:    { bg: 'rgba(79,142,247,0.10)',  border: 'rgba(79,142,247,0.25)', text: '#4F8EF7' },
    };

    el.innerHTML = alertes.map(a => {
      const c = couleurs[a.type] || couleurs.info;
      return `<div style="background:${c.bg};border:1px solid ${c.border};border-radius:var(--r-md);padding:10px 14px;margin-bottom:8px;font-size:13px;color:${c.text}">${a.msg}</div>`;
    }).join('');
  },

  // ── Rendu résultats ───────────────────────────────────────
  _renderResults(res) {
    const body = document.getElementById('elec-results-body');
    if (!body) return;

    const { sections, coutMat, coutMO, margeMat, margeMO } = res;
    const tva      = DB.getRatio('TVA_TRAVAUX') || 0.10;
    const totalHT  = coutMat * (1 + margeMat) + coutMO * (1 + margeMO);
    const totalTTC = totalHT * (1 + tva);

    this._lastResult = { ...res, totalHT, totalTTC };

    let html = '';
    sections.forEach(section => {
      html += `<div class="res-section">${section.titre}</div>`;
      section.items.forEach(item => {
        if (item.prix === 0) {
          html += `
            <div class="res-material" style="opacity:0.75">
              <div class="res-mat-left">
                <div class="res-mat-icon">${item.icon || '📦'}</div>
                <div><div class="res-mat-name">${item.nom}</div></div>
              </div>
            </div>`;
        } else {
          html += `
            <div class="res-material">
              <div class="res-mat-left">
                <div class="res-mat-icon">${item.icon || '📦'}</div>
                <div>
                  <div class="res-mat-name">${item.nom}</div>
                  <div class="res-mat-qty">${item.qte}</div>
                </div>
              </div>
              <div class="res-mat-right">
                <div class="res-mat-prix">${this.fmt(item.prix)} €</div>
                <div class="res-mat-unit">HT achat</div>
              </div>
            </div>`;
        }
      });
    });

    html += `
      <div class="res-financier">
        <div class="res-fin-row">
          <span class="res-fin-label">Matériaux HT achat</span>
          <span class="res-fin-value">${this.fmt(coutMat)} €</span>
        </div>
        <div class="res-fin-row">
          <span class="res-fin-label">Main d'œuvre HT</span>
          <span class="res-fin-value">${this.fmt(coutMO)} €</span>
        </div>
        <div class="res-fin-row">
          <span class="res-fin-label">Matériaux facturés (+${Math.round(margeMat*100)}%)</span>
          <span class="res-fin-value">${this.fmt(coutMat * (1 + margeMat))} €</span>
        </div>
        <div class="res-fin-row">
          <span class="res-fin-label">MO facturée (+${Math.round(margeMO*100)}%)</span>
          <span class="res-fin-value">${this.fmt(coutMO * (1 + margeMO))} €</span>
        </div>
        <div class="res-fin-row">
          <span class="res-fin-label">TVA ${Math.round(tva*100)}%</span>
          <span class="res-fin-value">${this.fmt(totalHT * tva)} €</span>
        </div>
        <div class="res-fin-total">
          <span class="label">TOTAL TTC</span>
          <span class="value">${this.fmt(totalTTC)} €</span>
        </div>
      </div>`;

    body.innerHTML = html;
  },

  // ── Copier ────────────────────────────────────────────────
  copier() {
    if (!this._lastResult) return;
    const r = this._lastResult;
    let text = 'ESTIMATION ÉLECTRICITÉ NF C 15-100 — PlaqPro\n' + '='.repeat(46) + '\n';
    r.sections.forEach(s => {
      text += `\n${s.titre}\n`;
      s.items.forEach(i => {
        if (i.prix > 0) text += `  ${i.nom}: ${i.qte} — ${this.fmt(i.prix)} €\n`;
        else text += `  ${i.nom}\n`;
      });
    });
    text += '\n' + '─'.repeat(46) + '\n';
    text += `Matériaux HT : ${this.fmt(r.coutMat)} €\n`;
    text += `Main d'œuvre HT : ${this.fmt(r.coutMO)} €\n`;
    text += `TOTAL TTC : ${this.fmt(r.totalTTC)} €\n`;
    navigator.clipboard.writeText(text)
      .then(() => App.toast('Résultat copié !'))
      .catch(() => App.toast('Copie non disponible', 'error'));
  },

  // ── Créer devis électricité ───────────────────────────────
  creerDevis() {
    if (!this._lastResult) { App.toast('Calculez d\'abord une estimation', 'error'); return; }
    const clients = DB.clients;
    if (!clients.length) { App.toast('Créez d\'abord un client', 'error'); return; }

    const r = this._lastResult;
    document.getElementById('modal-title').textContent = '📄 Créer devis électricité';

    document.getElementById('modal-body').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="calc-input-group">
          <label>Client</label>
          <select id="elec-devis-client" style="background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px;width:100%" onchange="Electricite._updateChantiersSelect()">
            <option value="">— Sélectionnez un client —</option>
            ${clients.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
          </select>
        </div>
        <div class="calc-input-group">
          <label>Chantier</label>
          <select id="elec-devis-chantier" style="background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px;width:100%">
            <option value="">— Sélectionnez un chantier —</option>
            ${DB.chantiers.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
          </select>
        </div>
        <div class="calc-input-group">
          <label>Objet du devis</label>
          <input type="text" id="elec-devis-objet" value="Installation électrique NF C 15-100" style="background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px;width:100%">
        </div>
        <div style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-md);padding:12px;font-size:13px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="color:var(--text-secondary)">Total HT estimé</span>
            <span style="font-family:var(--font-mono);font-weight:600">${this.fmt(r.totalHT)} €</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-secondary)">Total TTC</span>
            <span style="font-family:var(--font-mono);font-weight:700;color:var(--accent)">${this.fmt(r.totalTTC)} €</span>
          </div>
        </div>
      </div>`;

    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Electricite._validerDevis()">Créer le devis</button>`;

    document.getElementById('modal-overlay').style.display = 'flex';
  },

  _updateChantiersSelect() {
    const clientId = parseInt(document.getElementById('elec-devis-client').value);
    const sel = document.getElementById('elec-devis-chantier');
    if (!sel) return;
    const chantiers = clientId ? DB.getChantiersByClient(clientId) : DB.chantiers;
    sel.innerHTML = '<option value="">— Sélectionnez un chantier —</option>' +
      chantiers.map(c => `<option value="${c.id}">${c.nom}</option>`).join('');
  },

  _validerDevis() {
    const clientId   = parseInt(document.getElementById('elec-devis-client').value);
    const chantierId = parseInt(document.getElementById('elec-devis-chantier').value);
    const objet      = document.getElementById('elec-devis-objet').value.trim() || 'Installation électrique';

    if (!clientId)   { App.toast('Sélectionnez un client', 'error');   return; }
    if (!chantierId) { App.toast('Sélectionnez un chantier', 'error'); return; }

    const r   = this._lastResult;
    const tva = DB.getRatio('TVA_TRAVAUX') || 0.10;

    const lignes = [];
    r.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.prix > 0) {
          lignes.push({
            designation:  item.nom,
            quantite:     1,
            unite:        'ff',
            prixUnitaire: item.prix * (1 + r.margeMat),
            tva,
            total:        item.prix * (1 + r.margeMat),
          });
        }
      });
    });

    if (r.coutMO > 0) {
      lignes.push({
        designation:  'Main d\'œuvre électricité',
        quantite:     Math.round(r.hMO * 10) / 10,
        unite:        'h',
        prixUnitaire: this.tauxMO() * (1 + r.margeMO),
        tva,
        total:        r.coutMO * (1 + r.margeMO),
      });
    }

    const config = DB.getConfig();
    const prefix = config.prefixeDevis || 'DEV-';
    const year   = new Date().getFullYear();
    const num    = DB.devis.length + 1;
    const numero = `${prefix}${year}-${String(num).padStart(4, '0')}`;

    const devis = DB.addDevis({
      numero, objet, clientId, chantierId,
      date:      new Date().toISOString().slice(0, 10),
      validite:  30,
      statut:    'Brouillon',
      lignes,
      totalHT:   r.totalHT,
      totalTTC:  r.totalTTC,
      notes:     'Devis électricité généré depuis PlaqPro — Installation conforme NF C 15-100.',
    });

    App.closeModal();
    App.toast(`Devis ${devis.numero} créé !`);
    App.navigate('devis');
  },

  // ── Styles ────────────────────────────────────────────────
  _injectStyles() {
    // Styles calc-* partagés (identiques à calculateur.js — injectés une seule fois)
    if (!document.getElementById('calc-styles')) {
      const s = document.createElement('style');
      s.id = 'calc-styles';
      s.textContent = `
        .calc-hero {
          background: linear-gradient(135deg, rgba(79,142,247,0.15) 0%, rgba(45,212,160,0.08) 50%, rgba(167,139,250,0.08) 100%);
          border: 1px solid rgba(79,142,247,0.2);
          border-radius: var(--r-xl);
          padding: 24px 28px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .calc-hero::before {
          content: '';
          position: absolute;
          top: -50%; right: -10%;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(79,142,247,0.15), transparent 70%);
          pointer-events: none;
        }
        .calc-hero-inner { display: flex; align-items: center; gap: 16px; }
        .calc-hero-icon  { font-size: 40px; }
        .calc-hero-title { font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
        .calc-hero-sub   { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }

        .calc-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
          min-height: 0;
        }
        @media (min-width: 1400px) {
          .calc-grid { grid-template-columns: 1fr 1fr; }
        }

        .calc-panel {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-xl);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        .calc-tabs {
          display: flex;
          flex-wrap: wrap;
          border-bottom: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.02);
          padding: 8px 8px 0;
          gap: 4px;
        }
        .calc-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--r-md) var(--r-md) 0 0;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          background: none;
          border: 1px solid transparent;
          border-bottom: none;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .calc-tab:hover { color: var(--text-primary); background: var(--glass-bg-md); }
        .calc-tab.active {
          color: var(--accent);
          background: var(--glass-bg-strong);
          border-color: var(--glass-border-md);
          font-weight: 600;
        }
        .calc-tab-icon { font-size: 15px; }

        .calc-form { display: none; padding: 20px; }
        .calc-form.active { display: block; }

        .calc-section-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--glass-border);
        }

        .calc-input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 4px;
        }
        .calc-input-group { display: flex; flex-direction: column; gap: 6px; }
        .calc-input-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }

        .calc-input-wrap {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border-md);
          border-radius: var(--r-md);
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .calc-input-wrap:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(79,142,247,0.15);
        }
        .calc-input-wrap input {
          flex: 1;
          height: 38px;
          padding: 0 12px;
          background: none;
          border: none;
          outline: none;
          font-family: var(--font-mono);
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          width: 0;
        }
        .calc-unit {
          padding: 0 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-tertiary);
          background: rgba(255,255,255,0.04);
          border-left: 1px solid var(--glass-border);
          height: 38px;
          display: flex;
          align-items: center;
          white-space: nowrap;
        }

        .calc-radio-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; }
        .calc-radio {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 14px; border-radius: var(--r-md);
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          cursor: pointer; font-size: 13px; color: var(--text-secondary);
          transition: all 0.15s;
        }
        .calc-radio:hover { border-color: var(--glass-border-md); color: var(--text-primary); }
        .calc-radio input[type="radio"] { accent-color: var(--accent); width: 15px; height: 15px; }
        .calc-radio input[type="radio"]:checked + span { color: var(--accent); font-weight: 600; }

        .calc-check-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
        .calc-check-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 4px; }
        .calc-check {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 12px; border-radius: var(--r-sm);
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          cursor: pointer; font-size: 13px; color: var(--text-secondary);
          transition: all 0.15s;
        }
        .calc-check:hover { border-color: var(--glass-border-md); color: var(--text-primary); }
        .calc-check input[type="checkbox"] { accent-color: var(--accent); width: 15px; height: 15px; flex-shrink: 0; }

        .calc-results {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-xl);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .calc-results-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--glass-shine);
        }
        .calc-results-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .calc-empty { text-align: center; padding: 40px 20px; }

        .res-material {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: var(--r-md);
          margin-bottom: 6px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          transition: border-color 0.15s;
        }
        .res-material:hover { border-color: var(--glass-border-md); }
        .res-mat-left { display: flex; align-items: center; gap: 10px; }
        .res-mat-icon { font-size: 18px; width: 28px; text-align: center; flex-shrink: 0; }
        .res-mat-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .res-mat-qty  { font-size: 12px; color: var(--text-secondary); margin-top: 2px; font-family: var(--font-mono); }
        .res-mat-right { text-align: right; }
        .res-mat-prix  { font-size: 14px; font-weight: 700; color: var(--text-primary); font-family: var(--font-mono); }
        .res-mat-unit  { font-size: 11px; color: var(--text-tertiary); }

        .res-section {
          font-size: 11px; font-weight: 700;
          color: var(--text-tertiary); text-transform: uppercase;
          letter-spacing: 0.08em; padding: 14px 4px 6px;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 8px;
        }
        .res-financier {
          margin-top: 14px;
          background: linear-gradient(135deg, rgba(79,142,247,0.08), rgba(45,212,160,0.05));
          border: 1px solid rgba(79,142,247,0.2);
          border-radius: var(--r-lg);
          overflow: hidden;
        }
        .res-fin-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          border-bottom: 1px solid var(--glass-border);
          font-size: 13px;
        }
        .res-fin-row:last-child { border-bottom: none; }
        .res-fin-label { color: var(--text-secondary); }
        .res-fin-value { font-family: var(--font-mono); font-weight: 600; color: var(--text-primary); }
        .res-fin-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: rgba(79,142,247,0.12);
        }
        .res-fin-total .label { font-size: 13px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; }
        .res-fin-total .value { font-size: 22px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono); }

        .ratios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        .ratio-item {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-md);
          padding: 10px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ratio-label { font-size: 12px; color: var(--text-secondary); }
        .ratio-value { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--accent); }
      `;
      document.head.appendChild(s);
    }

    // Styles spécifiques Pack Électricité
    if (!document.getElementById('elec-styles')) {
      const s = document.createElement('style');
      s.id = 'elec-styles';
      s.textContent = `
        .elec-hero {
          background: linear-gradient(135deg, rgba(255,220,60,0.12) 0%, rgba(247,166,79,0.07) 50%, rgba(79,142,247,0.06) 100%);
          border: 1px solid rgba(255,220,60,0.22);
          border-radius: var(--r-xl);
          padding: 24px 28px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .elec-hero::before {
          content: '';
          position: absolute;
          top: -50%; right: -10%;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(255,220,60,0.15), transparent 70%);
          pointer-events: none;
        }
        .elec-hero-inner { display: flex; align-items: center; gap: 16px; }
        .elec-hero-icon  { font-size: 40px; line-height: 1; }
        .elec-hero-title { font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
        .elec-hero-sub   { font-size: 14px; color: var(--text-secondary); margin-top: 4px; flex: 1; }
        .elec-norme-badge {
          font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
          background: rgba(79,142,247,0.15); border: 1px solid rgba(79,142,247,0.3);
          color: var(--accent); border-radius: var(--r-full);
          padding: 5px 12px; white-space: nowrap; flex-shrink: 0;
        }
        .elec-ref-row {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 8px; padding: 8px 10px; border-radius: var(--r-sm);
          border-bottom: 1px solid var(--glass-border); font-size: 12px;
        }
        .elec-ref-row:last-child { border-bottom: none; }
        .elec-ref-usage   { color: var(--text-primary); font-weight: 500; }
        .elec-ref-section { color: var(--accent); font-family: var(--font-mono); font-weight: 600; }
        .elec-ref-int     { color: var(--orange); font-family: var(--font-mono); }
        .elec-ref-disj    { color: var(--text-tertiary); }
      `;
      document.head.appendChild(s);
    }
  },
};
