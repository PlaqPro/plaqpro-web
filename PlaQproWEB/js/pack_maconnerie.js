// ============================================================
//  PLAQPRO WEB — Pack Maçonnerie
//  pack_maconnerie.js
// ============================================================

// ── Page ─────────────────────────────────────────────────────
Pages.maconnerie = function() {
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="mac-hero">
      <div class="mac-hero-inner">
        <div class="mac-hero-icon">🧱</div>
        <div>
          <h1 class="mac-hero-title">Pack Maçonnerie</h1>
          <p class="mac-hero-sub">Calculez vos besoins en parpaings, béton, enduit et fondations — ratios professionnels</p>
        </div>
      </div>
    </div>

    <div class="calc-grid">

      <!-- PANNEAU SAISIE -->
      <div class="calc-panel">
        <div class="calc-tabs">
          <button class="calc-tab active" data-tab="parpaings" onclick="Maconnerie.switchTab('parpaings',this)">
            <span class="calc-tab-icon">🧱</span> Parpaings / Briques
          </button>
          <button class="calc-tab" data-tab="beton" onclick="Maconnerie.switchTab('beton',this)">
            <span class="calc-tab-icon">🪣</span> Béton / Chape
          </button>
          <button class="calc-tab" data-tab="enduit" onclick="Maconnerie.switchTab('enduit',this)">
            <span class="calc-tab-icon">🖌️</span> Enduit Façade
          </button>
          <button class="calc-tab" data-tab="fondations" onclick="Maconnerie.switchTab('fondations',this)">
            <span class="calc-tab-icon">⬇️</span> Fondations
          </button>
        </div>

        <!-- TAB PARPAINGS -->
        <div id="mac-tab-parpaings" class="calc-form active">
          <div class="calc-section-title">📐 Dimensions du mur</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Longueur totale</label>
              <div class="calc-input-wrap">
                <input type="number" id="pp-longueur" value="10" min="0.5" step="0.5" oninput="Maconnerie.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Hauteur</label>
              <div class="calc-input-wrap">
                <input type="number" id="pp-hauteur" value="2.50" min="0.5" step="0.05" oninput="Maconnerie.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">⚙️ Type de maçonnerie</div>
          <div class="calc-radio-group">
            <label class="calc-radio">
              <input type="radio" name="pp-type" value="parpaing20" checked onchange="Maconnerie.compute()">
              <span>Parpaing 20 cm — 10 u/m²</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="pp-type" value="parpaing15" onchange="Maconnerie.compute()">
              <span>Parpaing 15 cm — 10 u/m²</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="pp-type" value="monomur" onchange="Maconnerie.compute()">
              <span>Brique monomur — 8 u/m²</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">🩹 Options</div>
          <div class="calc-check-group">
            <label class="calc-check">
              <input type="checkbox" id="pp-enduit-liais" checked onchange="Maconnerie.compute()">
              <span>Inclure enduit de liaison (gobetis)</span>
            </label>
            <label class="calc-check">
              <input type="checkbox" id="pp-joints" checked onchange="Maconnerie.compute()">
              <span>Inclure mortier de joints</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="pp-marge-mat" value="30" min="0" max="100" oninput="Maconnerie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="pp-marge-mo" value="20" min="0" max="100" oninput="Maconnerie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB BÉTON/CHAPE -->
        <div id="mac-tab-beton" class="calc-form">
          <div class="calc-section-title">⚙️ Mode</div>
          <div class="calc-radio-group">
            <label class="calc-radio">
              <input type="radio" name="bt-mode" value="beton" checked onchange="Maconnerie.compute()">
              <span>Béton coulé (fondations, poteaux, linteaux)</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="bt-mode" value="chape" onchange="Maconnerie.compute()">
              <span>Chape (sol intérieur)</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">📐 Dimensions</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface</label>
              <div class="calc-input-wrap">
                <input type="number" id="bt-surface" value="20" min="1" step="0.5" oninput="Maconnerie.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Épaisseur</label>
              <div class="calc-input-wrap">
                <input type="number" id="bt-epaisseur" value="0.20" min="0.05" step="0.01" oninput="Maconnerie.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:6px;padding:0 2px">
            Pour une chape de 5 cm → saisir 0.05. Pour un dallage de 20 cm → 0.20
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="bt-marge-mat" value="30" min="0" max="100" oninput="Maconnerie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="bt-marge-mo" value="20" min="0" max="100" oninput="Maconnerie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB ENDUIT FAÇADE -->
        <div id="mac-tab-enduit" class="calc-form">
          <div class="calc-section-title">📐 Surface à enduire</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface façade</label>
              <div class="calc-input-wrap">
                <input type="number" id="en-surface" value="80" min="1" step="0.5" oninput="Maconnerie.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">⚙️ Type d'enduit</div>
          <div class="calc-radio-group">
            <label class="calc-radio">
              <input type="radio" name="en-type" value="monocouche" checked onchange="Maconnerie.compute()">
              <span>Monocouche — 25 kg/m² en 1 passe</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="en-type" value="traditionnel" onchange="Maconnerie.compute()">
              <span>Traditionnel 3 couches — gobetis + corps + finition</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">🩹 Options</div>
          <div class="calc-check-group">
            <label class="calc-check">
              <input type="checkbox" id="en-peinture" onchange="Maconnerie.compute()">
              <span>Ajouter peinture façade (2 couches)</span>
            </label>
            <label class="calc-check">
              <input type="checkbox" id="en-echafaudage" onchange="Maconnerie.compute()">
              <span>Inclure échafaudage (forfait 4 €/m²)</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="en-marge-mat" value="30" min="0" max="100" oninput="Maconnerie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="en-marge-mo" value="20" min="0" max="100" oninput="Maconnerie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB FONDATIONS -->
        <div id="mac-tab-fondations" class="calc-form">
          <div class="calc-section-title">📐 Dimensions des fouilles</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Longueur</label>
              <div class="calc-input-wrap">
                <input type="number" id="fo-longueur" value="12" min="1" step="0.5" oninput="Maconnerie.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Largeur semelle</label>
              <div class="calc-input-wrap">
                <input type="number" id="fo-largeur" value="0.60" min="0.20" step="0.05" oninput="Maconnerie.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>
          <div class="calc-input-row" style="margin-top:12px">
            <div class="calc-input-group">
              <label>Profondeur</label>
              <div class="calc-input-wrap">
                <input type="number" id="fo-profondeur" value="0.50" min="0.20" step="0.05" oninput="Maconnerie.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Nb semelles isolées</label>
              <div class="calc-input-wrap">
                <input type="number" id="fo-nb-semelles" value="0" min="0" step="1" oninput="Maconnerie.compute()">
                <span class="calc-unit">u</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🩹 Options</div>
          <div class="calc-check-group">
            <label class="calc-check">
              <input type="checkbox" id="fo-ferraillage" checked onchange="Maconnerie.compute()">
              <span>Inclure ferraillage (100 kg/m³)</span>
            </label>
            <label class="calc-check">
              <input type="checkbox" id="fo-coffrage" onchange="Maconnerie.compute()">
              <span>Inclure coffrage (forfait 8 €/m²)</span>
            </label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="fo-marge-mat" value="30" min="0" max="100" oninput="Maconnerie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="fo-marge-mo" value="20" min="0" max="100" oninput="Maconnerie.compute()">
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
              <button class="btn btn-secondary btn-sm" onclick="Maconnerie.copier()" title="Copier">📋 Copier</button>
              <button class="btn btn-primary btn-sm" onclick="Maconnerie.creerDevis()">📄 Créer devis</button>
            </div>
          </div>
          <div id="mac-results-body" style="padding:16px">
            <div class="calc-empty">
              <div style="font-size:36px;margin-bottom:12px">🧱</div>
              <div style="color:var(--text-tertiary);font-size:14px">Renseignez les dimensions pour obtenir l'estimation</div>
            </div>
          </div>
        </div>

        <!-- Ratios maçonnerie -->
        <div class="calc-results" style="margin-top:16px">
          <div class="calc-results-header">
            <span class="calc-results-title">📏 Ratios de référence</span>
          </div>
          <div style="padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px" id="mac-ratios">
            ${[
              ['Parpaing 20 cm', '10 u/m²'],
              ['Parpaing 15 cm', '10 u/m²'],
              ['Brique monomur', '8 u/m²'],
              ['Mortier joints', '30 kg/m²'],
              ['Sable maçon', '45 kg/m²'],
              ['Ciment / m³ béton', '350 kg'],
              ['Sable / m³ béton', '700 kg'],
              ['Gravier / m³ béton', '1 200 kg'],
              ['Chape / cm épaisseur', '20 kg/m²'],
              ['Enduit monocouche', '25 kg/m²'],
              ['Gobetis (1re couche)', '15 kg/m²'],
              ['Corps d\'enduit', '20 kg/m²'],
              ['Finition enduit', '8 kg/m²'],
              ['Ferraillage fond.', '100 kg/m³'],
            ].map(([l,v]) => `
              <div class="ratio-item">
                <span class="ratio-label">${l}</span>
                <span class="ratio-value">${v}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  Maconnerie._injectStyles(div);

  setTimeout(() => Maconnerie.compute(), 50);

  return div;
};

// ============================================================
//  MOTEUR DE CALCUL MAÇONNERIE
// ============================================================
var Maconnerie = {

  _tab: 'parpaings',
  _lastResult: null,

  // Prix par défaut (€)
  PRIX: {
    PARPAING_20:      1.20,   // €/u
    PARPAING_15:      0.85,   // €/u
    BRIQUE_MONO:      4.50,   // €/u
    MORTIER_SAC25:    9.50,   // €/sac 25 kg (mortier joint)
    CIMENT_SAC25:     8.50,   // €/sac 25 kg
    SABLE_SAC25:      4.20,   // €/sac 25 kg
    GRAVIER_SAC25:    4.50,   // €/sac 25 kg
    ENDUIT_MONO_SAC:  18.00,  // €/sac 25 kg
    ENDUIT_CORP_SAC:  15.00,  // €/sac 25 kg
    ENDUIT_FIN_SAC:   14.00,  // €/sac 25 kg
    FERRAILLAGE_KG:   1.20,   // €/kg (HA 10-12)
    COFFRAGE_M2:      8.00,   // €/m² (forfait)
    PEINTURE_FAC_L:   2.80,   // €/L
    ECHAF_M2:         4.00,   // €/m² (forfait)
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

  // ── Onglets ───────────────────────────────────────────────
  switchTab(tab, btn) {
    this._tab = tab;
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-form').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    const form = document.getElementById('mac-tab-' + tab);
    if (form) form.classList.add('active');
    this.compute();
  },

  // ── Dispatch calcul ───────────────────────────────────────
  compute() {
    let result;
    switch (this._tab) {
      case 'parpaings':  result = this._calcParpaings();  break;
      case 'beton':      result = this._calcBeton();      break;
      case 'enduit':     result = this._calcEnduit();     break;
      case 'fondations': result = this._calcFondations(); break;
    }
    if (result) this._renderResults(result);
  },

  // ── Calcul PARPAINGS / BRIQUES ────────────────────────────
  _calcParpaings() {
    const longueur   = this.v('pp-longueur', 10);
    const hauteur    = this.v('pp-hauteur', 2.50);
    const type       = this.radio('pp-type') || 'parpaing20';
    const avecEnduit = this.checked('pp-enduit-liais');
    const avecMortier = this.checked('pp-joints');
    const margeMat   = this.v('pp-marge-mat', 30) / 100;
    const margeMO    = this.v('pp-marge-mo', 20) / 100;

    const surface = longueur * hauteur;

    const configs = {
      parpaing20: { label: 'Parpaing 20 cm', uParM2: 10, prixU: this.PRIX.PARPAING_20, hMO: 0.70 },
      parpaing15: { label: 'Parpaing 15 cm', uParM2: 10, prixU: this.PRIX.PARPAING_15, hMO: 0.65 },
      monomur:    { label: 'Brique monomur', uParM2: 8,  prixU: this.PRIX.BRIQUE_MONO,  hMO: 0.50 },
    };
    const cfg = configs[type];

    // Blocs (coeff perte 5%)
    const nbBlocs = Math.ceil(surface * cfg.uParM2 * 1.05);
    const prixBlocs = nbBlocs * cfg.prixU;

    // Mortier de joints (30 kg/m²) → sacs 25 kg
    let nbMortierSacs = 0, prixMortier = 0;
    if (avecMortier) {
      const kgMortier = surface * 30;
      nbMortierSacs = Math.ceil(kgMortier / 25);
      prixMortier = nbMortierSacs * this.PRIX.MORTIER_SAC25;
      // Sable (45 kg/m²) inclus dans le ratio mortier prêt
    }

    // Enduit de liaison gobetis (5 kg/m²)
    let nbEnduitSacs = 0, prixEnduit = 0;
    if (avecEnduit) {
      const kgEnduit = surface * 5;
      nbEnduitSacs = Math.ceil(kgEnduit / 25);
      prixEnduit = nbEnduitSacs * this.PRIX.ENDUIT_CORP_SAC;
    }

    // MO
    const hMO = surface * cfg.hMO;
    const coutMO = hMO * this.tauxMO();

    const coutMat = prixBlocs + prixMortier + prixEnduit;

    const items = [
      { icon: '🧱', nom: cfg.label, qte: `${nbBlocs} u (${this.fmtN(surface)} m²)`, prix: prixBlocs },
    ];
    if (avecMortier) items.push(
      { icon: '🪣', nom: 'Mortier joint (sacs 25 kg)', qte: `${nbMortierSacs} sacs`, prix: prixMortier }
    );
    if (avecEnduit) items.push(
      { icon: '🖌️', nom: 'Enduit de liaison gobetis', qte: `${nbEnduitSacs} sacs`, prix: prixEnduit }
    );

    const sections = [{
      titre: `${cfg.label} — ${this.fmtN(longueur)} ml × ${this.fmtN(hauteur)} m = ${this.fmtN(surface)} m²`,
      items,
    }];

    return { sections, coutMat, coutMO, margeMat, margeMO, surface, hMO };
  },

  // ── Calcul BÉTON / CHAPE ──────────────────────────────────
  _calcBeton() {
    const mode      = this.radio('bt-mode') || 'beton';
    const surface   = this.v('bt-surface', 20);
    const epaisseur = this.v('bt-epaisseur', 0.20);
    const margeMat  = this.v('bt-marge-mat', 30) / 100;
    const margeMO   = this.v('bt-marge-mo', 20) / 100;

    let sections = [], coutMat = 0, coutMO = 0, hMO = 0;

    if (mode === 'beton') {
      const vol = surface * epaisseur; // m³

      // Ratios / m³ : 350 kg ciment + 700 kg sable + 1200 kg gravier
      const kgCiment  = vol * 350;
      const kgSable   = vol * 700;
      const kgGravier = vol * 1200;

      const sacsCiment  = Math.ceil(kgCiment / 25);
      const sacsSable   = Math.ceil(kgSable / 25);
      const sacsGravier = Math.ceil(kgGravier / 25);

      const pCiment  = sacsCiment  * this.PRIX.CIMENT_SAC25;
      const pSable   = sacsSable   * this.PRIX.SABLE_SAC25;
      const pGravier = sacsGravier * this.PRIX.GRAVIER_SAC25;

      coutMat = pCiment + pSable + pGravier;

      // MO : 3 h/m³ (gâchage manuel) ou 1.5 h/m³ (toupie)
      hMO = vol * 3;
      coutMO = hMO * this.tauxMO();

      sections = [{
        titre: `Béton — ${this.fmtN(surface)} m² × ${this.fmtN(epaisseur, 2)} m = ${this.fmtN(vol, 2)} m³`,
        items: [
          { icon: '🏗️', nom: `Ciment CEM II (sacs 25 kg)`, qte: `${sacsCiment} sacs (${this.fmtN(kgCiment, 0)} kg)`, prix: pCiment },
          { icon: '🏖️', nom: `Sable 0/4 (sacs 25 kg)`,    qte: `${sacsSable} sacs (${this.fmtN(kgSable, 0)} kg)`,   prix: pSable },
          { icon: '🪨', nom: `Gravier 4/16 (sacs 25 kg)`, qte: `${sacsGravier} sacs (${this.fmtN(kgGravier, 0)} kg)`, prix: pGravier },
        ],
      }];

    } else {
      // CHAPE : 20 kg/m² par cm d'épaisseur
      const epCm = epaisseur * 100;
      const kgTotal = surface * epCm * 20;
      const sacsCiment = Math.ceil(kgTotal * 0.30 / 25); // ~30% ciment
      const sacsSable  = Math.ceil(kgTotal * 0.70 / 25); // ~70% sable

      const pCiment = sacsCiment * this.PRIX.CIMENT_SAC25;
      const pSable  = sacsSable  * this.PRIX.SABLE_SAC25;

      coutMat = pCiment + pSable;

      // MO chape : 0.25 h/m²
      hMO = surface * 0.25;
      coutMO = hMO * this.tauxMO();

      sections = [{
        titre: `Chape — ${this.fmtN(surface)} m² × ${this.fmtN(epCm, 0)} cm = ${this.fmtN(kgTotal, 0)} kg`,
        items: [
          { icon: '🏗️', nom: `Ciment CEM II (sacs 25 kg)`, qte: `${sacsCiment} sacs`, prix: pCiment },
          { icon: '🏖️', nom: `Sable 0/4 (sacs 25 kg)`,    qte: `${sacsSable} sacs`,  prix: pSable },
        ],
      }];
    }

    return { sections, coutMat, coutMO, margeMat, margeMO, surface, hMO };
  },

  // ── Calcul ENDUIT FAÇADE ──────────────────────────────────
  _calcEnduit() {
    const surface      = this.v('en-surface', 80);
    const type         = this.radio('en-type') || 'monocouche';
    const avecPeinture = this.checked('en-peinture');
    const avecEchaf    = this.checked('en-echafaudage');
    const margeMat     = this.v('en-marge-mat', 30) / 100;
    const margeMO      = this.v('en-marge-mo', 20) / 100;

    let coutMat = 0, hMO = 0;
    const sections = [];

    if (type === 'monocouche') {
      // 25 kg/m²
      const kg = surface * 25;
      const sacs = Math.ceil(kg / 25);
      const prix = sacs * this.PRIX.ENDUIT_MONO_SAC;
      coutMat += prix;
      hMO += surface * 0.35;
      sections.push({
        titre: `Enduit monocouche — ${this.fmtN(surface)} m²`,
        items: [
          { icon: '🖌️', nom: 'Enduit monocouche (sacs 25 kg)', qte: `${sacs} sacs (${this.fmtN(kg, 0)} kg)`, prix },
        ],
      });
    } else {
      // TRADITIONNEL 3 COUCHES
      // Gobetis : 15 kg/m²
      const kgGob  = surface * 15;
      const sacsGob = Math.ceil(kgGob / 25);
      const pGob   = sacsGob * this.PRIX.ENDUIT_CORP_SAC;

      // Corps d'enduit : 20 kg/m²
      const kgCorps  = surface * 20;
      const sacsCorps = Math.ceil(kgCorps / 25);
      const pCorps   = sacsCorps * this.PRIX.ENDUIT_CORP_SAC;

      // Finition : 8 kg/m²
      const kgFin  = surface * 8;
      const sacsFin = Math.ceil(kgFin / 25);
      const pFin   = sacsFin * this.PRIX.ENDUIT_FIN_SAC;

      coutMat += pGob + pCorps + pFin;
      hMO += surface * 0.60;

      sections.push({
        titre: `Enduit traditionnel 3 couches — ${this.fmtN(surface)} m²`,
        items: [
          { icon: '1️⃣', nom: 'Gobetis (1re couche · 15 kg/m²)',   qte: `${sacsGob} sacs`, prix: pGob },
          { icon: '2️⃣', nom: 'Corps d\'enduit (2e couche · 20 kg/m²)', qte: `${sacsCorps} sacs`, prix: pCorps },
          { icon: '3️⃣', nom: 'Finition (3e couche · 8 kg/m²)',    qte: `${sacsFin} sacs`, prix: pFin },
        ],
      });
    }

    // Option peinture façade
    if (avecPeinture) {
      const litres = (surface * 2) / 10; // rendement 10 m²/L, 2 couches
      const prix   = litres * this.PRIX.PEINTURE_FAC_L;
      coutMat += prix;
      hMO += surface * 0.18 * 2;
      sections.push({
        titre: '🎨 Peinture façade (2 couches)',
        items: [{ icon: '🎨', nom: 'Peinture façade', qte: `${this.fmtN(litres)} L`, prix }],
      });
    }

    // Option échafaudage
    if (avecEchaf) {
      const prix = surface * this.PRIX.ECHAF_M2;
      coutMat += prix;
      sections.push({
        titre: '🏗️ Échafaudage (forfait)',
        items: [{ icon: '🏗️', nom: 'Échafaudage (location/montage)', qte: `${this.fmtN(surface)} m²`, prix }],
      });
    }

    const coutMO = hMO * this.tauxMO();
    return { sections, coutMat, coutMO, margeMat, margeMO, surface, hMO };
  },

  // ── Calcul FONDATIONS ─────────────────────────────────────
  _calcFondations() {
    const longueur    = this.v('fo-longueur', 12);
    const largeur     = this.v('fo-largeur', 0.60);
    const profondeur  = this.v('fo-profondeur', 0.50);
    const nbSemelles  = this.v('fo-nb-semelles', 0);
    const avecFerr    = this.checked('fo-ferraillage');
    const avecCoffr   = this.checked('fo-coffrage');
    const margeMat    = this.v('fo-marge-mat', 30) / 100;
    const margeMO     = this.v('fo-marge-mo', 20) / 100;

    // Volume filante + semelles isolées (0.60×0.60×0.40 par défaut)
    const volFilante  = longueur * largeur * profondeur;
    const volSemelles = nbSemelles * 0.60 * 0.60 * 0.40;
    const volTotal    = volFilante + volSemelles;

    // Béton : 350 kg ciment + 700 kg sable + 1200 kg gravier / m³
    const kgCiment  = volTotal * 350;
    const kgSable   = volTotal * 700;
    const kgGravier = volTotal * 1200;

    const sacsCiment  = Math.ceil(kgCiment / 25);
    const sacsSable   = Math.ceil(kgSable / 25);
    const sacsGravier = Math.ceil(kgGravier / 25);

    const pCiment  = sacsCiment  * this.PRIX.CIMENT_SAC25;
    const pSable   = sacsSable   * this.PRIX.SABLE_SAC25;
    const pGravier = sacsGravier * this.PRIX.GRAVIER_SAC25;

    let coutMat = pCiment + pSable + pGravier;
    let hMO = volTotal * 4; // 4 h/m³ (coffrage + coulage + vibration)

    const itemsBeton = [
      { icon: '🏗️', nom: `Ciment CEM II (sacs 25 kg)`, qte: `${sacsCiment} sacs (${this.fmtN(kgCiment, 0)} kg)`, prix: pCiment },
      { icon: '🏖️', nom: `Sable 0/4 (sacs 25 kg)`,    qte: `${sacsSable} sacs (${this.fmtN(kgSable, 0)} kg)`,   prix: pSable },
      { icon: '🪨', nom: `Gravier 4/16 (sacs 25 kg)`, qte: `${sacsGravier} sacs (${this.fmtN(kgGravier, 0)} kg)`, prix: pGravier },
    ];

    const sections = [{
      titre: `Béton fondations — ${this.fmtN(volTotal, 2)} m³ (filante ${this.fmtN(volFilante, 2)} m³${nbSemelles > 0 ? ` + ${nbSemelles} semelles` : ''})`,
      items: itemsBeton,
    }];

    // Ferraillage (100 kg/m³)
    if (avecFerr) {
      const kgFerr = volTotal * 100;
      const pFerr  = kgFerr * this.PRIX.FERRAILLAGE_KG;
      coutMat += pFerr;
      hMO += volTotal * 2; // 2 h/m³ pour pose aciers
      sections.push({
        titre: '🔩 Ferraillage (100 kg/m³)',
        items: [{ icon: '🔩', nom: 'Aciers HA (barres, treillis)', qte: `${this.fmtN(kgFerr, 0)} kg`, prix: pFerr }],
      });
    }

    // Coffrage
    if (avecCoffr) {
      const surfCoffr = longueur * profondeur * 2; // 2 faces
      const pCoffr    = surfCoffr * this.PRIX.COFFRAGE_M2;
      coutMat += pCoffr;
      sections.push({
        titre: '🪵 Coffrage',
        items: [{ icon: '🪵', nom: 'Coffrage (fourniture + pose)', qte: `${this.fmtN(surfCoffr)} m²`, prix: pCoffr }],
      });
    }

    const coutMO = hMO * this.tauxMO();
    return { sections, coutMat, coutMO, margeMat, margeMO, surface: longueur * largeur, hMO };
  },

  // ── Rendu résultats ───────────────────────────────────────
  _renderResults(res) {
    const body = document.getElementById('mac-results-body');
    if (!body) return;

    const { sections, coutMat, coutMO, margeMat, margeMO } = res;
    const tva       = DB.getRatio('TVA_TRAVAUX') || 0.10;
    const totalHT   = coutMat * (1 + margeMat) + coutMO * (1 + margeMO);
    const totalTTC  = totalHT * (1 + tva);

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
    let text = 'ESTIMATION MAÇONNERIE — PlaqPro\n' + '='.repeat(40) + '\n';
    r.sections.forEach(s => {
      text += `\n${s.titre}\n`;
      s.items.forEach(i => { text += `  ${i.nom}: ${i.qte} — ${this.fmt(i.prix)} €\n`; });
    });
    text += '\n' + '─'.repeat(40) + '\n';
    text += `Matériaux HT : ${this.fmt(r.coutMat)} €\n`;
    text += `Main d'œuvre HT : ${this.fmt(r.coutMO)} €\n`;
    text += `TOTAL TTC : ${this.fmt(r.totalTTC)} €\n`;
    navigator.clipboard.writeText(text).then(() => App.toast('Résultat copié !')).catch(() => App.toast('Copie non disponible', 'error'));
  },

  // ── Créer devis maçonnerie ────────────────────────────────
  creerDevis() {
    if (!this._lastResult) { App.toast('Calculez d\'abord une estimation', 'error'); return; }

    const clients   = DB.clients;
    const chantiers = DB.chantiers;
    if (!clients.length) { App.toast('Créez d\'abord un client', 'error'); return; }

    const r = this._lastResult;

    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    document.getElementById('modal-title').textContent = '📄 Créer devis maçonnerie';
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="calc-input-group">
          <label>Client</label>
          <select id="mac-devis-client" style="background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px;width:100%" onchange="Maconnerie._updateChantiersSelect()">
            <option value="">— Sélectionnez un client —</option>
            ${clients.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
          </select>
        </div>
        <div class="calc-input-group">
          <label>Chantier</label>
          <select id="mac-devis-chantier" style="background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px;width:100%">
            <option value="">— Sélectionnez un chantier —</option>
            ${chantiers.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
          </select>
        </div>
        <div class="calc-input-group">
          <label>Objet du devis</label>
          <input type="text" id="mac-devis-objet" value="Travaux de maçonnerie" style="background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px;width:100%">
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
      <button class="btn btn-primary" onclick="Maconnerie._validerDevis()">Créer le devis</button>`;

    document.getElementById('modal-overlay').style.display = 'flex';
  },

  _updateChantiersSelect() {
    const clientId = parseInt(document.getElementById('mac-devis-client').value);
    const sel = document.getElementById('mac-devis-chantier');
    if (!sel) return;
    const chantiers = clientId ? DB.getChantiersByClient(clientId) : DB.chantiers;
    sel.innerHTML = '<option value="">— Sélectionnez un chantier —</option>' +
      chantiers.map(c => `<option value="${c.id}">${c.nom}</option>`).join('');
  },

  _validerDevis() {
    const clientId   = parseInt(document.getElementById('mac-devis-client').value);
    const chantierId = parseInt(document.getElementById('mac-devis-chantier').value);
    const objet      = document.getElementById('mac-devis-objet').value.trim() || 'Travaux de maçonnerie';

    if (!clientId)   { App.toast('Sélectionnez un client', 'error');   return; }
    if (!chantierId) { App.toast('Sélectionnez un chantier', 'error'); return; }

    const r = this._lastResult;
    const tva = DB.getRatio('TVA_TRAVAUX') || 0.10;

    // Construire les lignes du devis depuis les sections calculées
    const lignes = [];
    r.sections.forEach(section => {
      section.items.forEach(item => {
        lignes.push({
          designation: item.nom,
          quantite:    1,
          unite:       'ff',
          prixUnitaire: item.prix * (1 + r.margeMat),
          tva:          tva,
          total:        item.prix * (1 + r.margeMat),
        });
      });
      // Ligne MO si applicable
    });

    // Ajouter MO globale
    if (r.coutMO > 0) {
      lignes.push({
        designation:  'Main d\'œuvre maçonnerie',
        quantite:     Math.round(r.hMO * 10) / 10,
        unite:        'h',
        prixUnitaire: this.tauxMO() * (1 + r.margeMO),
        tva:          tva,
        total:        r.coutMO * (1 + r.margeMO),
      });
    }

    const config = DB.getConfig();
    const prefix = config.prefixeDevis || 'DEV-';
    const devisExistants = DB.devis;
    const year = new Date().getFullYear();
    const num  = devisExistants.length + 1;
    const numero = `${prefix}${year}-${String(num).padStart(4, '0')}`;

    const devis = DB.addDevis({
      numero,
      objet,
      clientId,
      chantierId,
      date:      new Date().toISOString().slice(0, 10),
      validite:  30,
      statut:    'Brouillon',
      lignes,
      totalHT:   r.totalHT,
      totalTTC:  r.totalTTC,
      notes:     `Devis généré depuis le Pack Maçonnerie PlaqPro.`,
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

    // Styles spécifiques Pack Maçonnerie
    if (!document.getElementById('mac-styles')) {
      const s = document.createElement('style');
      s.id = 'mac-styles';
      s.textContent = `
        .mac-hero {
          background: linear-gradient(135deg, rgba(247,166,79,0.15) 0%, rgba(247,91,91,0.06) 50%, rgba(79,142,247,0.06) 100%);
          border: 1px solid rgba(247,166,79,0.22);
          border-radius: var(--r-xl);
          padding: 24px 28px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .mac-hero::before {
          content: '';
          position: absolute;
          top: -50%; right: -10%;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(247,166,79,0.18), transparent 70%);
          pointer-events: none;
        }
        .mac-hero-inner { display: flex; align-items: center; gap: 16px; }
        .mac-hero-icon  { font-size: 40px; line-height: 1; }
        .mac-hero-title { font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
        .mac-hero-sub   { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
      `;
      document.head.appendChild(s);
    }
  },
};
