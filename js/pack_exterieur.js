/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Pack Extérieur & Paysagisme
//  pack_exterieur.js
// ============================================================

Pages.exterieur = function() {
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="ext-hero">
      <div class="ext-hero-inner">
        <div class="ext-hero-icon">🌿</div>
        <div>
          <h1 class="ext-hero-title">Pack Extérieur &amp; Paysagisme</h1>
          <p class="ext-hero-sub">Terrassement, maçonnerie ext., clôtures, revêtements, paysagisme — ratios professionnels</p>
        </div>
      </div>
    </div>

    <div class="calc-grid">

      <!-- PANNEAU SAISIE -->
      <div class="calc-panel">
        <div class="calc-tabs">
          <button class="calc-tab active" data-tab="terrassement" onclick="Exterieur.switchTab('terrassement',this)">
            <span class="calc-tab-icon">🚜</span> Terrassement
          </button>
          <button class="calc-tab" data-tab="maconnerie" onclick="Exterieur.switchTab('maconnerie',this)">
            <span class="calc-tab-icon">🧱</span> Maçonnerie ext.
          </button>
          <button class="calc-tab" data-tab="clotures" onclick="Exterieur.switchTab('clotures',this)">
            <span class="calc-tab-icon">🚧</span> Clôtures
          </button>
          <button class="calc-tab" data-tab="revetements" onclick="Exterieur.switchTab('revetements',this)">
            <span class="calc-tab-icon">🪨</span> Revêtements
          </button>
          <button class="calc-tab" data-tab="paysagisme" onclick="Exterieur.switchTab('paysagisme',this)">
            <span class="calc-tab-icon">🌱</span> Paysagisme
          </button>
        </div>

        <!-- TAB TERRASSEMENT -->
        <div id="ext-tab-terrassement" class="calc-form active">
          <div class="calc-section-title">📐 Dimensions</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface</label>
              <div class="calc-input-wrap">
                <input type="number" id="ter-surface" value="50" min="1" step="0.5" oninput="Exterieur.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Profondeur</label>
              <div class="calc-input-wrap">
                <input type="number" id="ter-profondeur" value="0.30" min="0.05" step="0.05" oninput="Exterieur.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">⚙️ Options</div>
          <div class="calc-check-group">
            <label class="calc-check">
              <input type="checkbox" id="ter-remblai" checked onchange="Exterieur.compute()">
              <span>Remblai grave 0/31.5 (big bags 1 m³)</span>
            </label>
            <label class="calc-check">
              <input type="checkbox" id="ter-geotextile" checked onchange="Exterieur.compute()">
              <span>Géotextile 2 m large (+ 10 % recouvrement)</span>
            </label>
            <label class="calc-check">
              <input type="checkbox" id="ter-compactage" checked onchange="Exterieur.compute()">
              <span>Compactage (1 passage tracteur / 50 m²)</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="ter-marge-mat" value="25" min="0" max="100" oninput="Exterieur.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="ter-marge-mo" value="20" min="0" max="100" oninput="Exterieur.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB MAÇONNERIE EXT. -->
        <div id="ext-tab-maconnerie" class="calc-form">
          <div class="calc-section-title">⚙️ Type d'ouvrage</div>
          <div class="calc-radio-group">
            <label class="calc-radio">
              <input type="radio" name="mac-ouvrage" value="muret" checked onchange="Exterieur.compute()">
              <span>Muret parpaing (longueur × hauteur)</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="mac-ouvrage" value="enduit" onchange="Exterieur.compute()">
              <span>Enduit façade monocouche (m²)</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="mac-ouvrage" value="beton_des" onchange="Exterieur.compute()">
              <span>Béton désactivé (m²)</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="mac-ouvrage" value="escalier" onchange="Exterieur.compute()">
              <span>Escalier béton (nb marches × largeur)</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="mac-ouvrage" value="fondations" onchange="Exterieur.compute()">
              <span>Fondations filantes (ml × profondeur)</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">📐 Dimensions</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label id="mac-label-dim1">Longueur / Surface</label>
              <div class="calc-input-wrap">
                <input type="number" id="mac-dim1" value="10" min="0.5" step="0.5" oninput="Exterieur.compute()">
                <span class="calc-unit" id="mac-unit1">ml</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label id="mac-label-dim2">Hauteur / Épaisseur</label>
              <div class="calc-input-wrap">
                <input type="number" id="mac-dim2" value="1.00" min="0.05" step="0.05" oninput="Exterieur.compute()">
                <span class="calc-unit" id="mac-unit2">m</span>
              </div>
            </div>
          </div>
          <div id="mac-dim3-row" class="calc-input-row" style="margin-top:12px;display:none">
            <div class="calc-input-group">
              <label id="mac-label-dim3">Nb marches</label>
              <div class="calc-input-wrap">
                <input type="number" id="mac-dim3" value="6" min="1" step="1" oninput="Exterieur.compute()">
                <span class="calc-unit" id="mac-unit3">u</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="mac-marge-mat" value="30" min="0" max="100" oninput="Exterieur.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="mac-marge-mo" value="20" min="0" max="100" oninput="Exterieur.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB CLÔTURES & PORTAILS -->
        <div id="ext-tab-clotures" class="calc-form">
          <div class="calc-section-title">📐 Dimensions clôture</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Longueur</label>
              <div class="calc-input-wrap">
                <input type="number" id="clo-longueur" value="30" min="1" step="0.5" oninput="Exterieur.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Hauteur</label>
              <div class="calc-input-wrap">
                <input type="number" id="clo-hauteur" value="1.50" min="0.5" step="0.10" oninput="Exterieur.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">⚙️ Type de clôture</div>
          <div class="calc-radio-group">
            <label class="calc-radio">
              <input type="radio" name="clo-type" value="grillage" checked onchange="Exterieur.compute()">
              <span>Grillage soudé galvanisé 1,5 m</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="clo-type" value="panneau" onchange="Exterieur.compute()">
              <span>Panneau rigide gris (2 m/panneau)</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="clo-type" value="bois" onchange="Exterieur.compute()">
              <span>Lames bois pin traité</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="clo-type" value="alu" onchange="Exterieur.compute()">
              <span>Lames aluminium lakées</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">🚪 Portail</div>
          <div class="calc-check-group">
            <label class="calc-check">
              <input type="checkbox" id="clo-portail" onchange="Exterieur.compute()">
              <span>Inclure un portail aluminium</span>
            </label>
          </div>
          <div class="calc-input-row" style="margin-top:10px">
            <div class="calc-input-group">
              <label>Largeur portail</label>
              <div class="calc-input-wrap">
                <input type="number" id="clo-portail-l" value="3.00" min="1" step="0.5" oninput="Exterieur.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Type</label>
              <select id="clo-portail-type" class="form-control" onchange="Exterieur.compute()">
                <option value="battant">Battant (2 vantaux)</option>
                <option value="coulissant">Coulissant motorisé</option>
              </select>
            </div>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="clo-marge-mat" value="25" min="0" max="100" oninput="Exterieur.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="clo-marge-mo" value="20" min="0" max="100" oninput="Exterieur.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB REVÊTEMENTS -->
        <div id="ext-tab-revetements" class="calc-form">
          <div class="calc-section-title">⚙️ Type de revêtement</div>
          <div class="calc-radio-group">
            <label class="calc-radio">
              <input type="radio" name="rev-type" value="terrasse_bois" checked onchange="Exterieur.compute()">
              <span>Terrasse bois pin traité</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="rev-type" value="terrasse_comp" onchange="Exterieur.compute()">
              <span>Terrasse composite</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="rev-type" value="dallage_beton" onchange="Exterieur.compute()">
              <span>Dallage béton 40×40</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="rev-type" value="dallage_pierre" onchange="Exterieur.compute()">
              <span>Dallage pierre naturelle</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="rev-type" value="gravillons" onchange="Exterieur.compute()">
              <span>Allée gravillons décoratifs 8/16</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">📐 Surface</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface</label>
              <div class="calc-input-wrap">
                <input type="number" id="rev-surface" value="30" min="1" step="0.5" oninput="Exterieur.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🩹 Options</div>
          <div class="calc-check-group">
            <label class="calc-check">
              <input type="checkbox" id="rev-sable" checked onchange="Exterieur.compute()">
              <span>Sable de pose (3 cm → m³)</span>
            </label>
            <label class="calc-check">
              <input type="checkbox" id="rev-bordures" onchange="Exterieur.compute()">
              <span>Bordures béton T2 (périmètre)</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="rev-marge-mat" value="30" min="0" max="100" oninput="Exterieur.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="rev-marge-mo" value="20" min="0" max="100" oninput="Exterieur.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB PAYSAGISME -->
        <div id="ext-tab-paysagisme" class="calc-form">
          <div class="calc-section-title">🌾 Pelouse (semis)</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface pelouse</label>
              <div class="calc-input-wrap">
                <input type="number" id="pay-gazon" value="100" min="0" step="5" oninput="Exterieur.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🌿 Haie</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Longueur haie</label>
              <div class="calc-input-wrap">
                <input type="number" id="pay-haie" value="0" min="0" step="1" oninput="Exterieur.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🌳 Arbres &amp; Arbustes</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Nombre d'arbres / arbustes</label>
              <div class="calc-input-wrap">
                <input type="number" id="pay-arbres" value="0" min="0" step="1" oninput="Exterieur.compute()">
                <span class="calc-unit">u</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🍂 Paillage</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface à pailler</label>
              <div class="calc-input-wrap">
                <input type="number" id="pay-paillage" value="0" min="0" step="1" oninput="Exterieur.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">💧 Arrosage automatique</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Nb zones</label>
              <div class="calc-input-wrap">
                <input type="number" id="pay-zones" value="0" min="0" step="1" oninput="Exterieur.compute()">
                <span class="calc-unit">zones</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>ml tuyau / zone</label>
              <div class="calc-input-wrap">
                <input type="number" id="pay-tuyau-zone" value="20" min="5" step="5" oninput="Exterieur.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="pay-marge-mat" value="30" min="0" max="100" oninput="Exterieur.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="pay-marge-mo" value="20" min="0" max="100" oninput="Exterieur.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PANNEAU RÉSULTATS -->
      <div>
        <div class="calc-results">
          <div class="calc-results-header">
            <span class="calc-results-title">📊 Estimation matériaux</span>
            <div style="display:flex;gap:8px">
              <button class="btn btn-secondary btn-sm" onclick="Exterieur.copier()" title="Copier">📋 Copier</button>
              <button class="btn btn-primary btn-sm" onclick="Exterieur.creerDevis()">📄 Créer devis</button>
            </div>
          </div>
          <div id="ext-results-body" style="padding:16px">
            <div class="calc-empty">
              <div style="font-size:36px;margin-bottom:12px">🌿</div>
              <div style="color:var(--text-tertiary);font-size:14px">Renseignez les paramètres pour obtenir l'estimation</div>
            </div>
          </div>
        </div>

        <!-- Alertes réglementaires -->
        <div class="calc-results" style="margin-top:16px">
          <div class="calc-results-header">
            <span class="calc-results-title">⚠️ Alertes réglementaires</span>
          </div>
          <div id="ext-alertes" style="padding:14px">
            <div style="font-size:13px;color:var(--text-tertiary)">Calculez pour voir les alertes applicables.</div>
          </div>
        </div>

        <!-- Ratios de référence -->
        <div class="calc-results" style="margin-top:16px">
          <div class="calc-results-header">
            <span class="calc-results-title">📏 Ratios de référence</span>
          </div>
          <div style="padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${[
              ['Terre excavée','10 m³/camion'],
              ['Compactage','1 passage / 50 m²'],
              ['Grave 0/31.5','Big bag 1 m³ ≈ 1,5 T'],
              ['Géotextile','+ 10 % recouvrement'],
              ['Poteaux clôture','1 tous les 2,5 m'],
              ['Béton scellement','0,03 m³ / poteau'],
              ['Enduit monocouche','25 kg/m²'],
              ['Sable de pose','3 cm = 0,03 m/m²'],
              ['Dalles béton 40×40','6,25 u/m²'],
              ['Gazon — semis','30 g/m²'],
              ['Haie — plants','1 plant / 50 cm'],
              ['Paillage 70L','≈ 2 m²/sac'],
              ['Terre végétale','3 sacs/arbre'],
              ['Engrais starter','30 g/m²'],
            ].map(([l, v]) => `
              <div class="ratio-item">
                <span class="ratio-label">${l}</span>
                <span class="ratio-value">${v}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>

    </div>
  `;

  Exterieur._injectStyles();
  setTimeout(() => Exterieur.compute(), 50);
  return div;
};

// ============================================================
//  MOTEUR DE CALCUL EXTÉRIEUR
// ============================================================
var Exterieur = {

  _tab: 'terrassement',
  _lastResult: null,

  PRIX: {
    // Terrassement
    BIGBAG_GRAVE:     45.00,  // €/big bag 1 m³
    GEOTEXTILE_ML:     1.80,  // €/ml (2 m large)
    EVAC_CAMION:     120.00,  // €/camion 10 m³

    // Maçonnerie ext.
    PARPAING_20:       1.20,  // €/u
    MORTIER_SAC25:     9.50,  // €/sac 25 kg
    ENDUIT_MONO_SAC:  18.00,  // €/sac 25 kg
    BETON_DES_M2:     45.00,  // €/m² kit désactivé
    CIMENT_SAC25:      8.50,  // €/sac 25 kg
    GRAVIER_SAC25:     4.50,  // €/sac 25 kg gravier béton
    SABLE_SAC25:       4.20,  // €/sac 25 kg
    FERRAILLAGE_KG:    1.20,  // €/kg HA
    BETON_SCELL_SAC:   8.50,  // €/sac 25 kg (scellement poteaux)

    // Clôtures & portails
    POTEAU_ALU:       18.00,  // €/u 60×60 H2m
    GRILLAGE_ML:       8.50,  // €/ml grillage 1,5m
    PANNEAU_RIG_U:    28.00,  // €/u panneau 2m
    LAME_BOIS_ML:     12.00,  // €/ml lame bois traité
    LAME_ALU_ML:      18.00,  // €/ml lame alu
    PORTAIL_BATT:    450.00,  // €/u battant 3m
    PORTAIL_COUL:    890.00,  // €/u coulissant motorisé
    FIXATIONS_PCT:     0.08,  // forfait 8 % matériaux

    // Revêtements
    TERRASSE_BOIS_M2: 35.00,  // €/m²
    TERRASSE_COMP_M2: 55.00,  // €/m²
    DALLE_BET_U:       3.20,  // €/u 40×40
    DALLE_PIE_M2:     65.00,  // €/m² pierre naturelle
    GRAVIER_DEC_SAC:   8.50,  // €/sac 25 kg décoratif 8/16
    BORDURE_T2_U:      3.80,  // €/u bordure béton T2

    // Paysagisme
    GAZON_KG:         12.00,  // €/kg graines
    ENGRAIS_KG:        3.50,  // €/kg starter
    PLANT_HAIE_U:      4.50,  // €/u plant haie
    ARBUSTE_U:        18.00,  // €/u arbuste
    TERRE_VEG_SAC:     5.20,  // €/sac 40 L
    PAILLAGE_SAC:      8.90,  // €/sac 70 L
    TUYAU_ARROS_ML:    2.20,  // €/ml tuyau arrosage
    CONNECTEUR_U:      8.00,  // €/u connecteur / raccord
  },

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
  sel(id) {
    const el = document.getElementById(id);
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

  // ── Onglets ───────────────────────────────────────────────
  switchTab(tab, btn) {
    this._tab = tab;
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-form').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    const form = document.getElementById('ext-tab-' + tab);
    if (form) form.classList.add('active');
    this.compute();
  },

  // ── Dispatch ──────────────────────────────────────────────
  compute() {
    let result;
    switch (this._tab) {
      case 'terrassement': result = this._calcTerrassement(); break;
      case 'maconnerie':   result = this._calcMaconnerie();   break;
      case 'clotures':     result = this._calcClotures();     break;
      case 'revetements':  result = this._calcRevetements();  break;
      case 'paysagisme':   result = this._calcPaysagisme();   break;
    }
    this._renderResults(result);
    this._renderAlertes(result);
  },

  // ── TERRASSEMENT ──────────────────────────────────────────
  _calcTerrassement() {
    const surface    = this.v('ter-surface', 50);
    const profondeur = this.v('ter-profondeur', 0.30);
    const avecRemblai  = this.checked('ter-remblai');
    const avecGeo      = this.checked('ter-geotextile');
    const avecCompact  = this.checked('ter-compactage');
    const margeMat     = this.v('ter-marge-mat', 25) / 100;
    const margeMO      = this.v('ter-marge-mo', 20) / 100;

    const volTerre  = surface * profondeur;
    const nbCamions = Math.ceil(volTerre / 10);
    const pEvac     = nbCamions * this.PRIX.EVAC_CAMION;

    let coutMat = pEvac;
    let hMO     = volTerre * 0.5; // 0,5 h/m³ terrassement manuel
    const items = [
      { icon: '🚛', nom: `Évacuation terre (${this.fmtN(volTerre, 1)} m³)`, qte: `${nbCamions} camion${nbCamions > 1 ? 's' : ''} × 10 m³`, prix: pEvac },
    ];

    if (avecCompact) {
      const nbPass = Math.ceil(surface / 50);
      const hComp  = nbPass * 0.5;
      hMO += hComp;
      items.push({ icon: '🚜', nom: 'Compactage tracteur', qte: `${nbPass} passage${nbPass > 1 ? 's' : ''} (1/50 m²)`, prix: hComp * this.tauxMO() });
    }

    if (avecRemblai) {
      const nbBigBags = Math.ceil(volTerre * 0.9); // facteur compaction ~0,9
      const pRemblai  = nbBigBags * this.PRIX.BIGBAG_GRAVE;
      coutMat += pRemblai;
      items.push({ icon: '🪨', nom: 'Grave 0/31.5 (big bags 1 m³)', qte: `${nbBigBags} big bag${nbBigBags > 1 ? 's' : ''}`, prix: pRemblai });
    }

    if (avecGeo) {
      const m2Geo = surface * 1.10;
      const mlGeo = Math.ceil(m2Geo / 2); // rouleau 2 m large
      const pGeo  = mlGeo * this.PRIX.GEOTEXTILE_ML;
      coutMat += pGeo;
      items.push({ icon: '🧵', nom: 'Géotextile 2 m large (+ 10 % recouvrement)', qte: `${mlGeo} ml (${this.fmtN(m2Geo, 0)} m²)`, prix: pGeo });
    }

    const coutMO = hMO * this.tauxMO();
    const sections = [{
      titre: `Terrassement — ${this.fmtN(surface)} m² × ${this.fmtN(profondeur, 2)} m = ${this.fmtN(volTerre, 1)} m³`,
      items,
    }];
    return { sections, coutMat, coutMO, margeMat, margeMO, hMO, _profondeur: profondeur };
  },

  // ── MAÇONNERIE EXT. ──────────────────────────────────────
  _calcMaconnerie() {
    const ouvrage  = this.radio('mac-ouvrage') || 'muret';
    const dim1     = this.v('mac-dim1', 10);
    const dim2     = this.v('mac-dim2', 1.00);
    const dim3     = this.v('mac-dim3', 6);
    const margeMat = this.v('mac-marge-mat', 30) / 100;
    const margeMO  = this.v('mac-marge-mo', 20) / 100;

    let sections = [], coutMat = 0, coutMO = 0, hMO = 0;
    let _alertBeton = false;

    // Mise à jour labels dynamiques
    const labels = {
      muret:      { l1: 'Longueur', u1: 'ml', l2: 'Hauteur',     u2: 'm',  dim3: false },
      enduit:     { l1: 'Surface',  u1: 'm²', l2: 'Épaisseur',   u2: 'mm', dim3: false },
      beton_des:  { l1: 'Surface',  u1: 'm²', l2: 'Épaisseur',   u2: 'cm', dim3: false },
      escalier:   { l1: 'Largeur',  u1: 'm',  l2: 'Haut. marche',u2: 'm',  dim3: true, l3: 'Nb marches', u3: 'u' },
      fondations: { l1: 'Longueur', u1: 'ml', l2: 'Profondeur',  u2: 'm',  dim3: false },
    };
    const lbl = labels[ouvrage];
    if (lbl) {
      const l1 = document.getElementById('mac-label-dim1'); if (l1) l1.textContent = lbl.l1;
      const u1 = document.getElementById('mac-unit1');      if (u1) u1.textContent = lbl.u1;
      const l2 = document.getElementById('mac-label-dim2'); if (l2) l2.textContent = lbl.l2;
      const u2 = document.getElementById('mac-unit2');      if (u2) u2.textContent = lbl.u2;
      const d3row = document.getElementById('mac-dim3-row');
      if (d3row) d3row.style.display = lbl.dim3 ? 'grid' : 'none';
      if (lbl.dim3) {
        const l3 = document.getElementById('mac-label-dim3'); if (l3) l3.textContent = lbl.l3;
        const u3 = document.getElementById('mac-unit3');      if (u3) u3.textContent = lbl.u3;
      }
    }

    if (ouvrage === 'muret') {
      const surface   = dim1 * dim2;
      const nbBlocs   = Math.ceil(surface * 10 * 1.05);
      const pBlocs    = nbBlocs * this.PRIX.PARPAING_20;
      const sacsMort  = Math.ceil(surface * 30 / 25);
      const pMortier  = sacsMort * this.PRIX.MORTIER_SAC25;
      coutMat = pBlocs + pMortier;
      hMO     = surface * 0.70;
      sections = [{ titre: `Muret parpaing — ${this.fmtN(dim1)} ml × ${this.fmtN(dim2)} m = ${this.fmtN(surface)} m²`, items: [
        { icon: '🧱', nom: 'Parpaing 20 cm (+ 5 % casse)', qte: `${nbBlocs} u`, prix: pBlocs },
        { icon: '🪣', nom: 'Mortier joints (sacs 25 kg)', qte: `${sacsMort} sacs`, prix: pMortier },
      ]}];

    } else if (ouvrage === 'enduit') {
      const surface  = dim1; // m² direct
      const sacsEnd  = Math.ceil(surface * 25 / 25); // 25 kg/m², sac 25 kg
      const pEnduit  = sacsEnd * this.PRIX.ENDUIT_MONO_SAC;
      coutMat = pEnduit;
      hMO     = surface * 0.45;
      sections = [{ titre: `Enduit façade monocouche — ${this.fmtN(surface)} m²`, items: [
        { icon: '🖌️', nom: 'Enduit monocouche (sacs 25 kg)', qte: `${sacsEnd} sacs (${this.fmtN(surface * 25, 0)} kg)`, prix: pEnduit },
      ]}];

    } else if (ouvrage === 'beton_des') {
      const surface = dim1;
      const pBeton  = surface * this.PRIX.BETON_DES_M2;
      coutMat = pBeton;
      hMO     = surface * 0.35;
      _alertBeton = true;
      sections = [{ titre: `Béton désactivé — ${this.fmtN(surface)} m²`, items: [
        { icon: '🪨', nom: 'Béton désactivé (kit tout-en-un)', qte: `${this.fmtN(surface)} m²`, prix: pBeton },
      ]}];

    } else if (ouvrage === 'escalier') {
      // dim1=largeur marche(m), dim2=hauteur marche(m), dim3=nb marches
      const largeur   = dim1;
      const nbMarches = Math.round(dim3);
      const vol       = nbMarches * 0.05 * largeur; // chaque marche ≈ 0,05 m³
      const sacsCim   = Math.ceil(vol * 350 / 25);
      const sacsGrav  = Math.ceil(vol * 1200 / 25);
      const sacsSab   = Math.ceil(vol * 700 / 25);
      const pCim      = sacsCim  * this.PRIX.CIMENT_SAC25;
      const pGrav     = sacsGrav * this.PRIX.GRAVIER_SAC25;
      const pSab      = sacsSab  * this.PRIX.SABLE_SAC25;
      const kgFerr    = vol * 100; // 100 kg/m³
      const pFerr     = kgFerr * this.PRIX.FERRAILLAGE_KG;
      coutMat = pCim + pGrav + pSab + pFerr;
      hMO     = nbMarches * 2.0;
      sections = [{ titre: `Escalier béton — ${nbMarches} marches × ${this.fmtN(largeur)} m = ${this.fmtN(vol, 2)} m³`, items: [
        { icon: '🏗️', nom: 'Ciment CEM II (sacs 25 kg)', qte: `${sacsCim} sacs`, prix: pCim },
        { icon: '🪨', nom: 'Gravier béton (sacs 25 kg)', qte: `${sacsGrav} sacs`, prix: pGrav },
        { icon: '🏖️', nom: 'Sable (sacs 25 kg)', qte: `${sacsSab} sacs`, prix: pSab },
        { icon: '🔩', nom: 'Ferraillage HA (100 kg/m³)', qte: `${this.fmtN(kgFerr, 0)} kg`, prix: pFerr },
      ]}];

    } else if (ouvrage === 'fondations') {
      // dim1=longueur(ml), dim2=profondeur(m), section = 0,60 m standard
      const longueur    = dim1;
      const profondeur  = dim2;
      const largSection = 0.60;
      const vol         = longueur * largSection * profondeur;
      const sacsCim     = Math.ceil(vol * 350 / 25);
      const sacsGrav    = Math.ceil(vol * 1200 / 25);
      const sacsSab     = Math.ceil(vol * 700 / 25);
      const pCim        = sacsCim  * this.PRIX.CIMENT_SAC25;
      const pGrav       = sacsGrav * this.PRIX.GRAVIER_SAC25;
      const pSab        = sacsSab  * this.PRIX.SABLE_SAC25;
      const kgFerr      = vol * 100;
      const pFerr       = kgFerr * this.PRIX.FERRAILLAGE_KG;
      coutMat = pCim + pGrav + pSab + pFerr;
      hMO     = vol * 3.5;
      sections = [{ titre: `Fondations filantes — ${this.fmtN(longueur)} ml × 0,60 m × ${this.fmtN(profondeur, 2)} m = ${this.fmtN(vol, 2)} m³`, items: [
        { icon: '🏗️', nom: 'Ciment CEM II (sacs 25 kg)', qte: `${sacsCim} sacs`, prix: pCim },
        { icon: '🪨', nom: 'Gravier béton (sacs 25 kg)', qte: `${sacsGrav} sacs`, prix: pGrav },
        { icon: '🏖️', nom: 'Sable (sacs 25 kg)', qte: `${sacsSab} sacs`, prix: pSab },
        { icon: '🔩', nom: 'Ferraillage HA (100 kg/m³)', qte: `${this.fmtN(kgFerr, 0)} kg`, prix: pFerr },
      ]}];
    }

    coutMO = hMO * this.tauxMO();
    return { sections, coutMat, coutMO, margeMat, margeMO, hMO, _alertBeton };
  },

  // ── CLÔTURES & PORTAILS ──────────────────────────────────
  _calcClotures() {
    const longueur    = this.v('clo-longueur', 30);
    const hauteur     = this.v('clo-hauteur', 1.50);
    const typeClo     = this.radio('clo-type') || 'grillage';
    const avecPortail = this.checked('clo-portail');
    const portailL    = this.v('clo-portail-l', 3.0);
    const portailType = this.sel('clo-portail-type') || 'battant';
    const margeMat    = this.v('clo-marge-mat', 25) / 100;
    const margeMO     = this.v('clo-marge-mo', 20) / 100;

    // Poteaux : 1 tous les 2,5 m + 1 au départ
    const nbPoteaux  = Math.ceil(longueur / 2.5) + 1;
    const pPoteaux   = nbPoteaux * this.PRIX.POTEAU_ALU;

    // Béton de scellement : 0,03 m³/poteau → sac 25 kg ≈ 0,012 m³
    const volScell  = nbPoteaux * 0.03;
    const sacsScell = Math.ceil(volScell / 0.012);
    const pScell    = sacsScell * this.PRIX.BETON_SCELL_SAC;

    let pCloture = 0, libelleRev = '';
    if (typeClo === 'grillage') {
      pCloture = longueur * this.PRIX.GRILLAGE_ML;
      libelleRev = `Grillage soudé 1,5 m — ${this.fmtN(longueur)} ml`;
    } else if (typeClo === 'panneau') {
      const nbPanneaux = Math.ceil(longueur / 2);
      pCloture = nbPanneaux * this.PRIX.PANNEAU_RIG_U;
      libelleRev = `Panneaux rigides gris — ${nbPanneaux} u`;
    } else if (typeClo === 'bois') {
      pCloture = longueur * this.PRIX.LAME_BOIS_ML;
      libelleRev = `Lames bois traité — ${this.fmtN(longueur)} ml`;
    } else if (typeClo === 'alu') {
      pCloture = longueur * this.PRIX.LAME_ALU_ML;
      libelleRev = `Lames aluminium — ${this.fmtN(longueur)} ml`;
    }

    const pFixations = (pCloture + pPoteaux) * this.PRIX.FIXATIONS_PCT;

    let coutMat = pPoteaux + pScell + pCloture + pFixations;
    const items = [
      { icon: '🏗️', nom: 'Poteaux aluminium 60×60 H2m', qte: `${nbPoteaux} u (1/2,5 ml)`, prix: pPoteaux },
      { icon: '🪣', nom: `Béton scellement (sacs 25 kg, ${this.fmtN(volScell, 2)} m³)`, qte: `${sacsScell} sacs`, prix: pScell },
      { icon: '🚧', nom: libelleRev, qte: libelleRev, prix: pCloture },
      { icon: '🔩', nom: 'Fixations (boulons, fils, agrafes) — 8 %', qte: 'Forfait', prix: pFixations },
    ];

    if (avecPortail) {
      const pPortail = portailType === 'coulissant' ? this.PRIX.PORTAIL_COUL : this.PRIX.PORTAIL_BATT;
      coutMat += pPortail;
      items.push({ icon: '🚪', nom: `Portail alu ${portailType} ${this.fmtN(portailL)} m`, qte: '1 u', prix: pPortail });
    }

    const hMO  = longueur * 0.5 + nbPoteaux * 0.25;
    const coutMO = hMO * this.tauxMO();
    const sections = [{ titre: `Clôture ${typeClo} — ${this.fmtN(longueur)} ml × H ${this.fmtN(hauteur)} m`, items }];
    return { sections, coutMat, coutMO, margeMat, margeMO, hMO, _hauteurCloture: hauteur };
  },

  // ── REVÊTEMENTS EXTÉRIEURS ────────────────────────────────
  _calcRevetements() {
    const typeRev   = this.radio('rev-type') || 'terrasse_bois';
    const surface   = this.v('rev-surface', 30);
    const avecSable = this.checked('rev-sable');
    const avecBord  = this.checked('rev-bordures');
    const margeMat  = this.v('rev-marge-mat', 30) / 100;
    const margeMO   = this.v('rev-marge-mo', 20) / 100;

    const surfCh = surface * 1.10; // + 10 % chute
    let pRev = 0, libRev = '', hMO_u = 0.30;

    if (typeRev === 'terrasse_bois') {
      pRev    = surfCh * this.PRIX.TERRASSE_BOIS_M2;
      libRev  = `Bois pin traité (+ 10 % chute) — ${this.fmtN(surfCh, 1)} m²`;
      hMO_u   = 0.40;
    } else if (typeRev === 'terrasse_comp') {
      pRev    = surfCh * this.PRIX.TERRASSE_COMP_M2;
      libRev  = `Composite (+ 10 % chute) — ${this.fmtN(surfCh, 1)} m²`;
      hMO_u   = 0.40;
    } else if (typeRev === 'dallage_beton') {
      const nbDalles = Math.ceil(surface / 0.16 * 1.05); // 40×40 = 0,16 m², +5 % casse
      pRev    = nbDalles * this.PRIX.DALLE_BET_U;
      libRev  = `Dalles béton 40×40 (+ 5 % casse) — ${nbDalles} u`;
      hMO_u   = 0.45;
    } else if (typeRev === 'dallage_pierre') {
      pRev    = surfCh * this.PRIX.DALLE_PIE_M2;
      libRev  = `Pierre naturelle (+ 10 % chute) — ${this.fmtN(surfCh, 1)} m²`;
      hMO_u   = 0.55;
    } else if (typeRev === 'gravillons') {
      const sacsGrav = Math.ceil(surface * 0.05 * 1500 / 25); // 5 cm, ρ 1 500 kg/m³, sac 25 kg
      pRev    = sacsGrav * this.PRIX.GRAVIER_DEC_SAC;
      libRev  = `Gravier décoratif 8/16 (5 cm) — ${sacsGrav} sacs`;
      hMO_u   = 0.20;
    }

    let coutMat = pRev;
    const items = [{ icon: '🪨', nom: libRev, qte: libRev, prix: pRev }];

    if (avecSable) {
      const sacsSable = Math.ceil(surface * 0.03 * 1600 / 25); // 3 cm, ρ 1 600 kg/m³
      const pSable    = sacsSable * this.PRIX.SABLE_SAC25;
      coutMat += pSable;
      items.push({ icon: '🏖️', nom: 'Sable de pose (3 cm)', qte: `${sacsSable} sacs (${this.fmtN(surface * 0.03, 2)} m³)`, prix: pSable });
    }

    if (avecBord) {
      const perim  = 4 * Math.sqrt(surface); // périmètre estimé (carré)
      const nbBord = Math.ceil(perim);
      const pBord  = nbBord * this.PRIX.BORDURE_T2_U;
      coutMat += pBord;
      items.push({ icon: '🧱', nom: 'Bordures béton T2', qte: `${nbBord} u (≈ ${this.fmtN(perim, 0)} ml)`, prix: pBord });
    }

    const hMO  = surface * hMO_u;
    const coutMO = hMO * this.tauxMO();
    const sections = [{ titre: `Revêtement — ${this.fmtN(surface)} m²`, items }];
    return { sections, coutMat, coutMO, margeMat, margeMO, hMO };
  },

  // ── PAYSAGISME ────────────────────────────────────────────
  _calcPaysagisme() {
    const m2Gazon  = this.v('pay-gazon', 0);
    const mlHaie   = this.v('pay-haie', 0);
    const nbArbres = this.v('pay-arbres', 0);
    const m2Paill  = this.v('pay-paillage', 0);
    const nbZones  = this.v('pay-zones', 0);
    const mlZone   = this.v('pay-tuyau-zone', 20);
    const margeMat = this.v('pay-marge-mat', 30) / 100;
    const margeMO  = this.v('pay-marge-mo', 20) / 100;

    let coutMat = 0, coutMO = 0;
    const items = [];

    if (m2Gazon > 0) {
      const kgGraine  = Math.ceil(m2Gazon * 0.030); // 30 g/m²
      const kgEngrais = Math.ceil(m2Gazon * 0.030);
      const pGraine   = kgGraine  * this.PRIX.GAZON_KG;
      const pEngrais  = kgEngrais * this.PRIX.ENGRAIS_KG;
      coutMat += pGraine + pEngrais;
      coutMO  += m2Gazon * 0.10 * this.tauxMO();
      items.push({ icon: '🌾', nom: 'Graines gazon (30 g/m²)', qte: `${kgGraine} kg`, prix: pGraine });
      items.push({ icon: '🌿', nom: 'Engrais starter (30 g/m²)', qte: `${kgEngrais} kg`, prix: pEngrais });
    }

    if (mlHaie > 0) {
      const nbPlants = Math.ceil(mlHaie / 0.50) + 1; // 1 plant / 50 cm
      const pPlants  = nbPlants * this.PRIX.PLANT_HAIE_U;
      coutMat += pPlants;
      coutMO  += nbPlants * 0.25 * this.tauxMO();
      items.push({ icon: '🌿', nom: 'Plants de haie (1/50 cm)', qte: `${nbPlants} u`, prix: pPlants });
    }

    if (nbArbres > 0) {
      const pArbres   = nbArbres * this.PRIX.ARBUSTE_U;
      const nbSacsTer = nbArbres * 3;
      const pTerre    = nbSacsTer * this.PRIX.TERRE_VEG_SAC;
      coutMat += pArbres + pTerre;
      coutMO  += nbArbres * 0.50 * this.tauxMO();
      items.push({ icon: '🌳', nom: 'Arbres / arbustes', qte: `${nbArbres} u`, prix: pArbres });
      items.push({ icon: '🏔️', nom: 'Terre végétale 40 L (3 sacs/arbre)', qte: `${nbSacsTer} sacs`, prix: pTerre });
    }

    if (m2Paill > 0) {
      const nbSacs = Math.ceil(m2Paill / 2); // 1 sac 70 L ≈ 2 m² à 4 cm
      const pPaill = nbSacs * this.PRIX.PAILLAGE_SAC;
      coutMat += pPaill;
      coutMO  += m2Paill * 0.05 * this.tauxMO();
      items.push({ icon: '🍂', nom: 'Paillage végétal 70 L (≈ 2 m²/sac)', qte: `${nbSacs} sac${nbSacs > 1 ? 's' : ''}`, prix: pPaill });
    }

    if (nbZones > 0) {
      const mlTotal = nbZones * mlZone;
      const pTuyau  = mlTotal * this.PRIX.TUYAU_ARROS_ML;
      const pConn   = nbZones * this.PRIX.CONNECTEUR_U;
      coutMat += pTuyau + pConn;
      coutMO  += mlTotal * 0.05 * this.tauxMO();
      items.push({ icon: '💧', nom: `Tuyau arrosage (${nbZones} zones × ${mlZone} ml)`, qte: `${mlTotal} ml`, prix: pTuyau });
      items.push({ icon: '🔌', nom: 'Connecteurs / raccords par zone', qte: `${nbZones} u`, prix: pConn });
    }

    if (!items.length) return null;

    const sections = [{ titre: 'Aménagement paysager', items }];
    return { sections, coutMat, coutMO, margeMat, margeMO, hMO: coutMO / this.tauxMO() };
  },

  // ── RENDU RÉSULTATS ──────────────────────────────────────
  _renderResults(res) {
    const body = document.getElementById('ext-results-body');
    if (!body) return;

    if (!res) {
      body.innerHTML = `<div class="calc-empty">
        <div style="font-size:36px;margin-bottom:12px">🌿</div>
        <div style="color:var(--text-tertiary);font-size:14px">Renseignez les paramètres pour obtenir l'estimation</div>
      </div>`;
      return;
    }

    const { sections, coutMat, coutMO, margeMat, margeMO } = res;
    const tva      = DB.getRatio('TVA_TRAVAUX') || 0.10;
    const totalHT  = coutMat * (1 + margeMat) + coutMO * (1 + margeMO);
    const totalTTC = totalHT * (1 + tva);

    this._lastResult = { ...res, totalHT, totalTTC };

    let html = '';
    sections.forEach(section => {
      html += `<div class="res-section">${section.titre}</div>`;
      section.items.forEach(item => {
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
          <span class="res-fin-label">Matériaux facturés (+${Math.round(margeMat * 100)} %)</span>
          <span class="res-fin-value">${this.fmt(coutMat * (1 + margeMat))} €</span>
        </div>
        <div class="res-fin-row">
          <span class="res-fin-label">MO facturée (+${Math.round(margeMO * 100)} %)</span>
          <span class="res-fin-value">${this.fmt(coutMO * (1 + margeMO))} €</span>
        </div>
        <div class="res-fin-row">
          <span class="res-fin-label">TVA ${Math.round(tva * 100)} %</span>
          <span class="res-fin-value">${this.fmt(totalHT * tva)} €</span>
        </div>
        <div class="res-fin-total">
          <span class="label">TOTAL TTC</span>
          <span class="value">${this.fmt(totalTTC)} €</span>
        </div>
      </div>`;

    body.innerHTML = html;
  },

  // ── ALERTES RÉGLEMENTAIRES ────────────────────────────────
  _renderAlertes(res) {
    const el = document.getElementById('ext-alertes');
    if (!el) return;

    const alertes = [];

    if (this._tab === 'terrassement' && res?._profondeur > 0.5) {
      alertes.push({ emoji: '📋', couleur: '#F7A64F', texte: 'Terrassement > 0,5 m — déclaration préalable de travaux obligatoire (Art. R421-12 CU)' });
    }
    if (this._tab === 'clotures' && res?._hauteurCloture > 2) {
      alertes.push({ emoji: '🏛️', couleur: '#F75B5B', texte: 'Clôture > 2 m — permis de construire requis selon règlement PLU local' });
    }
    if (this._tab === 'maconnerie' && res?._alertBeton) {
      alertes.push({ emoji: '⏱️', couleur: '#4F8EF7', texte: 'Béton désactivé — attendre minimum 24 h avant toute circulation piétonne, 48 h pour véhicules' });
    }
    if (this._tab === 'paysagisme') {
      alertes.push({ emoji: '🌡️', couleur: '#A78BFA', texte: 'Plantations — éviter toute mise en terre par gel (température < 0 °C). Période idéale : oct.–nov. ou mars–avr.' });
    }

    if (!alertes.length) {
      el.innerHTML = '<div style="font-size:13px;color:var(--text-tertiary)">Aucune alerte réglementaire pour cette configuration.</div>';
      return;
    }

    el.innerHTML = alertes.map(a => `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;
           background:${a.couleur}15;border:1px solid ${a.couleur}38;border-radius:var(--r-md);margin-bottom:8px">
        <span style="font-size:18px;flex-shrink:0">${a.emoji}</span>
        <span style="font-size:13px;color:var(--text-primary);line-height:1.4">${a.texte}</span>
      </div>`).join('');
  },

  // ── COPIER ────────────────────────────────────────────────
  copier() {
    if (!this._lastResult) return;
    const r = this._lastResult;
    let text = 'ESTIMATION EXTÉRIEUR & PAYSAGISME — PlaqPro\n' + '='.repeat(44) + '\n';
    r.sections.forEach(s => {
      text += `\n${s.titre}\n`;
      s.items.forEach(i => { text += `  ${i.nom}: ${i.qte} — ${this.fmt(i.prix)} €\n`; });
    });
    text += '\n' + '─'.repeat(44) + '\n';
    text += `Matériaux HT achat : ${this.fmt(r.coutMat)} €\n`;
    text += `Main d'œuvre HT : ${this.fmt(r.coutMO)} €\n`;
    text += `TOTAL TTC : ${this.fmt(r.totalTTC)} €\n`;
    navigator.clipboard.writeText(text)
      .then(() => App.toast('Résultat copié !'))
      .catch(() => App.toast('Copie non disponible', 'error'));
  },

  // ── CRÉER DEVIS ──────────────────────────────────────────
  creerDevis() {
    if (!this._lastResult) { App.toast('Calculez d\'abord une estimation', 'error'); return; }
    const clients   = DB.clients;
    const chantiers = DB.chantiers;
    if (!clients.length) { App.toast('Créez d\'abord un client', 'error'); return; }

    const r = this._lastResult;
    document.getElementById('modal-title').textContent = '📄 Créer devis extérieur';
    const body   = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="calc-input-group">
          <label>Client</label>
          <select id="ext-dv-client" style="width:100%;background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px">
            <option value="">— Sélectionnez un client —</option>
            ${clients.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
          </select>
        </div>
        <div class="calc-input-group">
          <label>Chantier</label>
          <select id="ext-dv-chantier" style="width:100%;background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px">
            <option value="">— Sélectionnez un chantier —</option>
            ${chantiers.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
          </select>
        </div>
        <div class="calc-input-group">
          <label>Objet du devis</label>
          <input type="text" id="ext-dv-objet" value="Travaux extérieurs et paysagisme"
            style="width:100%;background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px">
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
    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Exterieur._validerDevis()">📄 Créer le devis</button>`;
    document.getElementById('modal').classList.add('active');
  },

  _validerDevis() {
    const clientId   = parseInt(document.getElementById('ext-dv-client')?.value);
    const chantierId = parseInt(document.getElementById('ext-dv-chantier')?.value) || null;
    const objet      = document.getElementById('ext-dv-objet')?.value.trim() || 'Travaux extérieurs';
    if (!clientId) { App.toast('Sélectionnez un client', 'error'); return; }

    const r   = this._lastResult;
    const tva = DB.getRatio('TVA_TRAVAUX') || 0.10;
    const lignes = [];

    r.sections.forEach(section => {
      section.items.forEach(item => {
        lignes.push({
          designation:  item.nom,
          quantite:     1,
          unite:        'ff',
          prixUnitaire: item.prix * (1 + r.margeMat),
          tva,
          total:        item.prix * (1 + r.margeMat),
        });
      });
    });

    if (r.coutMO > 0) {
      lignes.push({
        designation:  'Main d\'œuvre extérieur / paysagisme',
        quantite:     Math.round(r.hMO * 10) / 10 || 1,
        unite:        'h',
        prixUnitaire: this.tauxMO() * (1 + r.margeMO),
        tva,
        total:        r.coutMO * (1 + r.margeMO),
      });
    }

    const config  = DB.getConfig();
    const prefix  = config.prefixeDevis || 'DEV-';
    const year    = new Date().getFullYear();
    const num     = (DB.devis.length || 0) + 1;
    const numero  = `${prefix}${year}-${String(num).padStart(4, '0')}`;

    const devis = DB.addDevis({
      numero, objet, clientId, chantierId,
      date:     new Date().toISOString().slice(0, 10),
      validite: 30,
      statut:   'Brouillon',
      lignes,
      totalHT:  r.totalHT,
      totalTTC: r.totalTTC,
      notes:    'Devis généré depuis le Pack Extérieur & Paysagisme PlaqPro.',
    });

    App.closeModal();
    App.toast(`Devis ${devis.numero} créé !`);
    App.navigate('devis');
  },

  // ── STYLES ────────────────────────────────────────────────
  _injectStyles() {
    if (!document.getElementById('calc-styles')) {
      const s = document.createElement('style');
      s.id = 'calc-styles';
      s.textContent = `
        .calc-grid{display:grid;grid-template-columns:1fr;gap:16px;align-items:start}
        @media(min-width:1400px){.calc-grid{grid-template-columns:1fr 1fr}}
        .calc-panel{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-xl);overflow:hidden;backdrop-filter:blur(12px)}
        .calc-tabs{display:flex;flex-wrap:wrap;border-bottom:1px solid var(--glass-border);background:rgba(255,255,255,0.02);padding:8px 8px 0;gap:4px}
        .calc-tab{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:var(--r-md) var(--r-md) 0 0;font-family:var(--font);font-size:13px;font-weight:500;color:var(--text-secondary);background:none;border:1px solid transparent;border-bottom:none;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0}
        .calc-tab:hover{color:var(--text-primary);background:var(--glass-bg-md)}
        .calc-tab.active{color:var(--accent);background:var(--glass-bg-strong);border-color:var(--glass-border-md);font-weight:600}
        .calc-tab-icon{font-size:15px}
        .calc-form{display:none;padding:20px}.calc-form.active{display:block}
        .calc-section-title{font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--glass-border)}
        .calc-input-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .calc-input-group{display:flex;flex-direction:column;gap:5px}
        .calc-input-group label{font-size:12px;font-weight:500;color:var(--text-secondary)}
        .calc-input-wrap{display:flex;align-items:center;background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);overflow:hidden;transition:border-color .15s}
        .calc-input-wrap:focus-within{border-color:var(--accent)}
        .calc-input-wrap input{flex:1;background:none;border:none;outline:none;padding:9px 12px;color:var(--text-primary);font-family:var(--font-mono);font-size:14px;min-width:0}
        .calc-unit{padding:9px 12px;font-size:12px;color:var(--text-tertiary);background:var(--bg-tertiary);border-left:1px solid var(--glass-border);white-space:nowrap}
        .calc-radio-group,.calc-check-group{display:flex;flex-direction:column;gap:8px}
        .calc-radio,.calc-check{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--r-md);background:var(--glass-bg);border:1px solid var(--glass-border);cursor:pointer;transition:all .15s;font-size:13px;color:var(--text-secondary)}
        .calc-radio:hover,.calc-check:hover{border-color:var(--glass-border-md);color:var(--text-primary)}
        .calc-radio input,.calc-check input{width:15px;height:15px;accent-color:var(--accent);flex-shrink:0}
        .calc-results{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-xl);overflow:hidden}
        .calc-results-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--glass-border)}
        .calc-results-title{font-size:14px;font-weight:700;color:var(--text-primary)}
        .calc-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center}
        .res-section{font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.08em;padding:14px 4px 6px;border-bottom:1px solid var(--glass-border);margin-bottom:8px}
        .res-material{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:var(--r-md);margin-bottom:6px;background:var(--glass-bg);border:1px solid var(--glass-border);transition:border-color .15s}
        .res-material:hover{border-color:var(--glass-border-md)}
        .res-mat-left{display:flex;align-items:center;gap:10px}
        .res-mat-icon{font-size:18px;width:28px;text-align:center;flex-shrink:0}
        .res-mat-name{font-size:13px;font-weight:500;color:var(--text-primary)}
        .res-mat-qty{font-size:12px;color:var(--text-secondary);margin-top:2px;font-family:var(--font-mono)}
        .res-mat-right{text-align:right}
        .res-mat-prix{font-size:14px;font-weight:700;color:var(--text-primary);font-family:var(--font-mono)}
        .res-mat-unit{font-size:11px;color:var(--text-tertiary)}
        .res-financier{margin-top:14px;background:linear-gradient(135deg,rgba(79,142,247,.08),rgba(45,212,160,.05));border:1px solid rgba(79,142,247,.2);border-radius:var(--r-lg);overflow:hidden}
        .res-fin-row{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--glass-border);font-size:13px}
        .res-fin-row:last-child{border-bottom:none}
        .res-fin-label{color:var(--text-secondary)}.res-fin-value{font-family:var(--font-mono);font-weight:600;color:var(--text-primary)}
        .res-fin-total{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:rgba(79,142,247,.12)}
        .res-fin-total .label{font-size:13px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.05em}
        .res-fin-total .value{font-size:22px;font-weight:800;color:var(--text-primary);font-family:var(--font-mono)}
        .ratio-item{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-md);padding:10px 14px;display:flex;justify-content:space-between;align-items:center}
        .ratio-label{font-size:12px;color:var(--text-secondary)}.ratio-value{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--accent)}
        .mt-16{margin-top:16px}
      `;
      document.head.appendChild(s);
    }

    if (!document.getElementById('ext-styles')) {
      const s = document.createElement('style');
      s.id = 'ext-styles';
      s.textContent = `
        .ext-hero {
          background: linear-gradient(135deg, rgba(45,212,160,.15) 0%, rgba(34,197,94,.10) 50%, rgba(79,142,247,.06) 100%);
          border: 1px solid rgba(45,212,160,.22);
          border-radius: var(--r-xl);
          padding: 24px 28px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .ext-hero::before {
          content: '';
          position: absolute;
          top: -50%; right: -10%;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(45,212,160,.18), transparent 70%);
          pointer-events: none;
        }
        .ext-hero-inner { display: flex; align-items: center; gap: 16px; }
        .ext-hero-icon  { font-size: 40px; line-height: 1; }
        .ext-hero-title { font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; margin: 0; }
        .ext-hero-sub   { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
      `;
      document.head.appendChild(s);
    }
  },
};
