// ============================================================
//  PLAQPRO WEB — Pack Plomberie (DTU 60.1 / DTU 60.11)
//  pack_plomberie.js
// ============================================================

// ── Page ─────────────────────────────────────────────────────
Pages.plomberie = function() {
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="plo-hero">
      <div class="plo-hero-inner">
        <div class="plo-hero-icon">🔧</div>
        <div>
          <h1 class="plo-hero-title">Pack Plomberie</h1>
          <p class="plo-hero-sub">Tuyauterie, sanitaires, chauffage, évacuation — dimensionnement DTU 60.1 / 60.11</p>
        </div>
        <div class="plo-norme-badge">DTU 60.1</div>
      </div>
    </div>

    <div class="calc-grid">

      <!-- PANNEAU SAISIE -->
      <div class="calc-panel">
        <div class="calc-tabs">
          <button class="calc-tab active" data-tab="tuyauterie" onclick="Plomberie.switchTab('tuyauterie',this)">
            <span class="calc-tab-icon">🔩</span> Tuyauterie
          </button>
          <button class="calc-tab" data-tab="sanitaires" onclick="Plomberie.switchTab('sanitaires',this)">
            <span class="calc-tab-icon">🚿</span> Sanitaires
          </button>
          <button class="calc-tab" data-tab="chauffage" onclick="Plomberie.switchTab('chauffage',this)">
            <span class="calc-tab-icon">🔥</span> Chauffage
          </button>
          <button class="calc-tab" data-tab="evacuation" onclick="Plomberie.switchTab('evacuation',this)">
            <span class="calc-tab-icon">🌊</span> Évacuation
          </button>
        </div>

        <!-- TAB TUYAUTERIE -->
        <div id="plo-tab-tuyauterie" class="calc-form active">
          <div class="calc-section-title">⚙️ Matériau des canalisations</div>
          <div class="calc-radio-group">
            <label class="calc-radio"><input type="radio" name="tu-mat" value="cuivre" checked onchange="Plomberie.compute()"><span>Cuivre — standard, soudure / sertissage</span></label>
            <label class="calc-radio"><input type="radio" name="tu-mat" value="per" onchange="Plomberie.compute()"><span>PER — flexible, encastrement, moins coûteux</span></label>
            <label class="calc-radio"><input type="radio" name="tu-mat" value="multicouche" onchange="Plomberie.compute()"><span>Multicouche — rigide flexible, universel</span></label>
            <label class="calc-radio"><input type="radio" name="tu-mat" value="pvc" onchange="Plomberie.compute()"><span>PVC / PPR — froid uniquement ou évacuation</span></label>
          </div>

          <div class="calc-section-title mt-16">📐 Longueurs de réseau</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Réseau eau froide</label>
              <div class="calc-input-wrap">
                <input type="number" id="tu-ef" value="20" min="1" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Réseau eau chaude</label>
              <div class="calc-input-wrap">
                <input type="number" id="tu-ec" value="15" min="0" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
          </div>
          <div class="calc-input-row" style="margin-top:12px">
            <div class="calc-input-group">
              <label>Diamètre principal</label>
              <div class="calc-input-wrap">
                <select id="tu-diametre" onchange="Plomberie.compute()" style="flex:1;height:38px;padding:0 12px;background:none;border:none;outline:none;font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-primary)">
                  <option value="12">12/14 mm — éclairage ≤ 2 points</option>
                  <option value="16">16/18 mm — 3 à 5 points</option>
                  <option value="20" selected>20/22 mm — nourrice / collecteur</option>
                  <option value="25">25/28 mm — colonne montante</option>
                  <option value="32">32 mm — arrivée compteur</option>
                </select>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Nb points d'eau totaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="tu-points" value="8" min="1" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">points</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🩹 Options</div>
          <div class="calc-check-group">
            <label class="calc-check"><input type="checkbox" id="tu-isolation" checked onchange="Plomberie.compute()"><span>Isolation tuyaux EC (coquille 19mm)</span></label>
            <label class="calc-check"><input type="checkbox" id="tu-robinets" checked onchange="Plomberie.compute()"><span>Robinets d'arrêt par point (1 u/point)</span></label>
            <label class="calc-check"><input type="checkbox" id="tu-nourrice" onchange="Plomberie.compute()"><span>Nourrice / collecteur centralisé</span></label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="tu-marge-mat" value="30" min="0" max="100" oninput="Plomberie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="tu-marge-mo" value="20" min="0" max="100" oninput="Plomberie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB SANITAIRES -->
        <div id="plo-tab-sanitaires" class="calc-form">
          <div class="calc-section-title">🚽 Appareils sanitaires</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>WC (chasse 6/3L)</label>
              <div class="calc-input-wrap">
                <input type="number" id="sa-wc" value="2" min="0" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">u</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Lavabos / vasques</label>
              <div class="calc-input-wrap">
                <input type="number" id="sa-lavabo" value="2" min="0" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">u</span>
              </div>
            </div>
          </div>
          <div class="calc-input-row" style="margin-top:12px">
            <div class="calc-input-group">
              <label>Douches</label>
              <div class="calc-input-wrap">
                <input type="number" id="sa-douche" value="1" min="0" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">u</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Baignoires</label>
              <div class="calc-input-wrap">
                <input type="number" id="sa-baignoire" value="1" min="0" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">u</span>
              </div>
            </div>
          </div>
          <div class="calc-input-row" style="margin-top:12px">
            <div class="calc-input-group">
              <label>Éviers / bacs cuisine</label>
              <div class="calc-input-wrap">
                <input type="number" id="sa-evier" value="1" min="0" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">u</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Machines (LV/LM)</label>
              <div class="calc-input-wrap">
                <input type="number" id="sa-machine" value="2" min="0" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">u</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🔩 Robinetterie</div>
          <div class="calc-radio-group">
            <label class="calc-radio"><input type="radio" name="sa-rob" value="standard" checked onchange="Plomberie.compute()"><span>Standard — mitigeurs classiques</span></label>
            <label class="calc-radio"><input type="radio" name="sa-rob" value="thermostatique" onchange="Plomberie.compute()"><span>Thermostatique — économie d'eau +30%</span></label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="sa-marge-mat" value="30" min="0" max="100" oninput="Plomberie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="sa-marge-mo" value="20" min="0" max="100" oninput="Plomberie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB CHAUFFAGE -->
        <div id="plo-tab-chauffage" class="calc-form">
          <div class="calc-section-title">⚙️ Type de chauffage</div>
          <div class="calc-radio-group">
            <label class="calc-radio"><input type="radio" name="ch-type" value="radiateurs" checked onchange="Plomberie.compute()"><span>Radiateurs à eau — standard, rénovation</span></label>
            <label class="calc-radio"><input type="radio" name="ch-type" value="pch" onchange="Plomberie.compute()"><span>Plancher chauffant hydraulique — construction neuve</span></label>
            <label class="calc-radio"><input type="radio" name="ch-type" value="mixte" onchange="Plomberie.compute()"><span>Mixte — PCH + radiateurs (appoints)</span></label>
          </div>

          <div class="calc-section-title mt-16">📐 Dimensions</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface à chauffer</label>
              <div class="calc-input-wrap">
                <input type="number" id="ch-surface" value="80" min="10" step="5" oninput="Plomberie.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Hauteur sous plafond</label>
              <div class="calc-input-wrap">
                <input type="number" id="ch-hauteur" value="2.50" min="2.00" step="0.05" oninput="Plomberie.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>
          <div class="calc-input-row" style="margin-top:12px">
            <div class="calc-input-group">
              <label>Espacement tubes PCH</label>
              <div class="calc-input-wrap">
                <input type="number" id="ch-espacement" value="15" min="10" max="30" step="5" oninput="Plomberie.compute()">
                <span class="calc-unit">cm</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Nb pièces / zones</label>
              <div class="calc-input-wrap">
                <input type="number" id="ch-zones" value="4" min="1" max="20" oninput="Plomberie.compute()">
                <span class="calc-unit">zones</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🔥 Chaudière / Générateur</div>
          <div class="calc-radio-group">
            <label class="calc-radio"><input type="radio" name="ch-gen" value="gaz" checked onchange="Plomberie.compute()"><span>Chaudière gaz à condensation</span></label>
            <label class="calc-radio"><input type="radio" name="ch-gen" value="pac" onchange="Plomberie.compute()"><span>Pompe à chaleur air/eau</span></label>
            <label class="calc-radio"><input type="radio" name="ch-gen" value="electrique" onchange="Plomberie.compute()"><span>Chaudière électrique</span></label>
            <label class="calc-radio"><input type="radio" name="ch-gen" value="fioul" onchange="Plomberie.compute()"><span>Chaudière fioul</span></label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="ch-marge-mat" value="30" min="0" max="100" oninput="Plomberie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="ch-marge-mo" value="20" min="0" max="100" oninput="Plomberie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB ÉVACUATION -->
        <div id="plo-tab-evacuation" class="calc-form">
          <div class="calc-section-title">📐 Réseau d'évacuation</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Longueur collecteur</label>
              <div class="calc-input-wrap">
                <input type="number" id="ev-longueur" value="12" min="1" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Pente effective</label>
              <div class="calc-input-wrap">
                <input type="number" id="ev-pente" value="2" min="0.5" max="10" step="0.5" oninput="Plomberie.compute()">
                <span class="calc-unit">cm/ml</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🚽 Points de rejet</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Chutes WC (DN 100)</label>
              <div class="calc-input-wrap">
                <input type="number" id="ev-wc" value="1" min="0" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">chutes</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Chutes eaux usées (DN 50)</label>
              <div class="calc-input-wrap">
                <input type="number" id="ev-eu" value="2" min="0" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">chutes</span>
              </div>
            </div>
          </div>
          <div class="calc-input-row" style="margin-top:12px">
            <div class="calc-input-group">
              <label>Hauteur chutes</label>
              <div class="calc-input-wrap">
                <input type="number" id="ev-hauteur" value="3" min="1" step="0.5" oninput="Plomberie.compute()">
                <span class="calc-unit">m/étage</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Nb étages</label>
              <div class="calc-input-wrap">
                <input type="number" id="ev-etages" value="1" min="1" max="10" step="1" oninput="Plomberie.compute()">
                <span class="calc-unit">niveaux</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🩹 Options</div>
          <div class="calc-check-group">
            <label class="calc-check"><input type="checkbox" id="ev-regards" checked onchange="Plomberie.compute()"><span>Regards de visite (1 tous les 10 ml)</span></label>
            <label class="calc-check"><input type="checkbox" id="ev-siphons" checked onchange="Plomberie.compute()"><span>Siphons de sol (1/salle d'eau)</span></label>
            <label class="calc-check"><input type="checkbox" id="ev-ventilation" onchange="Plomberie.compute()"><span>Ventilation primaire chute (VP)</span></label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="ev-marge-mat" value="30" min="0" max="100" oninput="Plomberie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="ev-marge-mo" value="20" min="0" max="100" oninput="Plomberie.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PANNEAU RÉSULTATS -->
      <div>
        <!-- Alertes DTU -->
        <div id="plo-alertes" style="margin-bottom:12px"></div>

        <div class="calc-results">
          <div class="calc-results-header">
            <span class="calc-results-title">📊 Estimation plomberie</span>
            <div style="display:flex;gap:8px">
              <button class="btn btn-secondary btn-sm" onclick="Plomberie.copier()">📋 Copier</button>
              <button class="btn btn-primary btn-sm" onclick="Plomberie.creerDevis()">📄 Créer devis</button>
            </div>
          </div>
          <div id="plo-results-body" style="padding:16px">
            <div class="calc-empty">
              <div style="font-size:36px;margin-bottom:12px">🔧</div>
              <div style="color:var(--text-tertiary);font-size:14px">Renseignez les paramètres pour obtenir l'estimation</div>
            </div>
          </div>
        </div>

        <!-- Débits de référence DTU 60.1 -->
        <div class="calc-results" style="margin-top:16px">
          <div class="calc-results-header">
            <span class="calc-results-title">📏 Débits de référence DTU 60.1</span>
          </div>
          <div style="padding:14px">
            ${[
              ['WC (chasse)',      '1.5 L/s', 'DN 100', 'Évac. séparée'],
              ['Lavabo / vasque',  '0.3 L/s', 'DN 32',  'Siphon 32mm'],
              ['Douche',          '0.5 L/s', 'DN 40',  'Bonde 40mm'],
              ['Baignoire',       '1.0 L/s', 'DN 40',  'Bonde 40mm'],
              ['Évier / bac',     '0.5 L/s', 'DN 40',  'Siphon 40mm'],
              ['Lave-linge',      '0.5 L/s', 'DN 40',  'Siphoïde'],
              ['Lave-vaisselle',  '0.3 L/s', 'DN 40',  'Siphoïde'],
              ['Collecteur EF',   '—',       'DN 32+', 'Pente 1 cm/ml'],
              ['Collecteur EU',   '—',       'DN 50+', 'Pente 2 cm/ml'],
              ['Chute WC',        '—',       'DN 100', 'Max 3 WC/chute'],
            ].map(([u,d,dn,note]) => `
              <div class="plo-ref-row">
                <span class="plo-ref-usage">${u}</span>
                <span class="plo-ref-debit">${d}</span>
                <span class="plo-ref-dn">${dn}</span>
                <span class="plo-ref-note">${note}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  Plomberie._injectStyles();
  setTimeout(() => Plomberie.compute(), 50);
  return div;
};

// ============================================================
//  MOTEUR DE CALCUL PLOMBERIE
// ============================================================
var Plomberie = {

  _tab: 'tuyauterie',
  _lastResult: null,

  // Prix par défaut (€)
  PRIX: {
    // Tubes
    TUBE_CU12:      4.50,   // €/ml cuivre 12/14mm
    TUBE_CU16:      5.80,   // €/ml cuivre 16/18mm
    TUBE_CU20:      7.50,   // €/ml cuivre 20/22mm
    TUBE_CU25:     10.00,   // €/ml cuivre 25/28mm
    TUBE_PER16:     1.20,   // €/ml PER 16mm
    TUBE_PER20:     1.60,   // €/ml PER 20mm
    TUBE_MULTI16:   2.80,   // €/ml multicouche 16mm
    TUBE_MULTI20:   3.50,   // €/ml multicouche 20mm
    TUBE_PVC32:     2.20,   // €/ml PVC 32mm
    TUBE_PVC40:     2.80,   // €/ml PVC 40mm
    TUBE_PVC100:    6.50,   // €/ml PVC 100mm (chute WC)
    TUBE_PCH16:     0.85,   // €/ml PER 16 plancher chauffant
    // Raccords et vannes
    RACCORD_CU:     1.80,   // €/u raccord cuivre
    RACCORD_PER:    3.50,   // €/u raccord sertir PER
    RACCORD_MULTI:  4.20,   // €/u raccord multicouche
    RACCORD_PVC:    1.50,   // €/u raccord PVC
    VANNE_ARR:      8.50,   // €/u vanne d'arrêt
    ROBINET_ISOL:   6.50,   // €/u robinet isolement DN15
    // Isolation
    COQUILLE_15:    2.20,   // €/ml coquille isolante 15/22mm
    COQUILLE_20:    2.80,   // €/ml coquille isolante 22/28mm
    // Sanitaires
    MITIGEUR_STD:  45.00,   // €/u mitigeur lavabo standard
    MITIGEUR_THERMO:95.00,  // €/u mitigeur thermostatique
    MITIGEUR_DOUCHE:55.00,  // €/u mitigeur douche
    MITIGEUR_BAI:  65.00,   // €/u mitigeur baignoire
    BONDE_DOUCHE:  18.00,   // €/u bonde douche 90mm
    BONDE_BAI:     22.00,   // €/u bonde baignoire
    SIPHON_LAV:    12.00,   // €/u siphon lavabo
    SIPHON_EV:     15.00,   // €/u siphon évier
    // Chauffage
    RADIATEUR_MOY: 120.00,  // €/u radiateur acier moyen
    COLLECTEUR_PCH: 85.00,  // €/u collecteur PCH 4 départs
    CHAUDIERE_GAZ: 1500.00, // €/u chaudière gaz condensation
    CHAUDIERE_PAC: 4500.00, // €/u PAC air/eau
    CHAUDIERE_ELEC: 800.00, // €/u chaudière électrique
    CHAUDIERE_FIOUL:1800.00,// €/u chaudière fioul
    // Évacuation
    REGARD_30:      35.00,  // €/u regard de visite 30×30
    SIPHON_SOL:     22.00,  // €/u siphon de sol
    CHAPEAU_ASPIR:  28.00,  // €/u chapeau de ventilation
    NOURRICE_4D:    65.00,  // €/u nourrice 4 départs
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
  tauxMO() { return DB.getRatio('TAUX_HORAIRE_MO') || 35; },

  // ── Onglets ───────────────────────────────────────────────
  switchTab(tab, btn) {
    this._tab = tab;
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-form').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    const form = document.getElementById('plo-tab-' + tab);
    if (form) form.classList.add('active');
    this.compute();
  },

  compute() {
    let result;
    switch (this._tab) {
      case 'tuyauterie': result = this._calcTuyauterie(); break;
      case 'sanitaires': result = this._calcSanitaires(); break;
      case 'chauffage':  result = this._calcChauffage();  break;
      case 'evacuation': result = this._calcEvacuation(); break;
    }
    if (result) this._renderResults(result);
  },

  // ── Calcul TUYAUTERIE ─────────────────────────────────────
  _calcTuyauterie() {
    const mat      = this.radio('tu-mat') || 'cuivre';
    const longueurEF = this.v('tu-ef', 20);
    const longueurEC = this.v('tu-ec', 15);
    const diametre = parseInt(document.getElementById('tu-diametre')?.value || '20');
    const nbPoints = this.v('tu-points', 8);
    const avecIso  = this.checked('tu-isolation');
    const avecRob  = this.checked('tu-robinets');
    const avecNour = this.checked('tu-nourrice');
    const margeMat = this.v('tu-marge-mat', 30) / 100;
    const margeMO  = this.v('tu-marge-mo', 20) / 100;

    const longueurTot = longueurEF + longueurEC;

    const alertes = [];
    if (mat === 'cuivre') {
      alertes.push({ type: 'info', msg: '🔩 Cuivre → protection anti-corrosion obligatoire si pH eau < 6.5 ou > 9.5 (DTU 60.1 §4.3)' });
    }
    if (mat === 'per') {
      alertes.push({ type: 'info', msg: '🔩 PER → ne pas exposer aux UV · protéger par gaine corrugée en encastrement' });
    }
    alertes.push({ type: 'info', msg: '💧 Pression réseau → vérifier 3 bar min · limiteur de pression si > 3.5 bar (DTU 60.1)' });
    this._renderAlertes(alertes);

    // Prix tube selon matériau et diamètre
    const matPrix = {
      cuivre:     { 12: this.PRIX.TUBE_CU12, 16: this.PRIX.TUBE_CU16, 20: this.PRIX.TUBE_CU20, 25: this.PRIX.TUBE_CU25, 32: this.PRIX.TUBE_CU25 * 1.3 },
      per:        { 12: this.PRIX.TUBE_PER16, 16: this.PRIX.TUBE_PER16, 20: this.PRIX.TUBE_PER20, 25: this.PRIX.TUBE_PER20 * 1.4, 32: this.PRIX.TUBE_PER20 * 1.8 },
      multicouche:{ 12: this.PRIX.TUBE_MULTI16, 16: this.PRIX.TUBE_MULTI16, 20: this.PRIX.TUBE_MULTI20, 25: this.PRIX.TUBE_MULTI20 * 1.3, 32: this.PRIX.TUBE_MULTI20 * 1.6 },
      pvc:        { 12: this.PRIX.TUBE_PVC32, 16: this.PRIX.TUBE_PVC32, 20: this.PRIX.TUBE_PVC40, 25: this.PRIX.TUBE_PVC40 * 1.3, 32: this.PRIX.TUBE_PVC100 * 0.8 },
    };
    const prixML = (matPrix[mat] || matPrix.cuivre)[diametre] || this.PRIX.TUBE_CU20;
    const coeffPerte = 1.10; // 10% perte/chutes

    const longueurAvecPerte = longueurTot * coeffPerte;
    const pTube = longueurAvecPerte * prixML;

    // Raccords (1 raccord par 2 ml)
    const nbRaccords = Math.ceil(longueurAvecPerte / 2);
    const pRaccord = { cuivre: this.PRIX.RACCORD_CU, per: this.PRIX.RACCORD_PER, multicouche: this.PRIX.RACCORD_MULTI, pvc: this.PRIX.RACCORD_PVC }[mat] || this.PRIX.RACCORD_CU;
    const pRaccords = nbRaccords * pRaccord;

    // Isolation EC
    let pIso = 0;
    if (avecIso && longueurEC > 0) {
      const pCoquille = diametre <= 20 ? this.PRIX.COQUILLE_15 : this.PRIX.COQUILLE_20;
      pIso = longueurEC * coeffPerte * pCoquille;
    }

    // Robinets d'arrêt
    let pRobinets = 0;
    if (avecRob) pRobinets = nbPoints * this.PRIX.ROBINET_ISOL;

    // Nourrice
    let pNourrice = 0;
    if (avecNour) pNourrice = Math.ceil(nbPoints / 4) * this.PRIX.NOURRICE_4D;

    const coutMat = pTube + pRaccords + pIso + pRobinets + pNourrice;
    // MO : cuivre 0.8h/ml / PER 0.4h/ml / multicouche 0.6h/ml / PVC 0.5h/ml
    const tauxMOml = { cuivre: 0.8, per: 0.4, multicouche: 0.6, pvc: 0.5 }[mat] || 0.6;
    const hMO = longueurAvecPerte * tauxMOml + nbPoints * 0.5;
    const coutMO = hMO * this.tauxMO();

    const matLabel = { cuivre: 'Cuivre', per: 'PER', multicouche: 'Multicouche', pvc: 'PVC' }[mat] || mat;

    const items = [
      { icon: '🔩', nom: `Tube ${matLabel} Ø${diametre}mm (EF + EC)`, qte: `${this.fmtN(longueurAvecPerte)} ml`, prix: pTube },
      { icon: '🔗', nom: 'Raccords / coudes / tés', qte: `${nbRaccords} u`, prix: pRaccords },
    ];
    if (pIso     > 0) items.push({ icon: '🧤', nom: 'Coquille isolante EC',       qte: `${this.fmtN(longueurEC * coeffPerte)} ml`, prix: pIso });
    if (pRobinets > 0) items.push({ icon: '🚰', nom: 'Robinets d\'arrêt DN15',   qte: `${nbPoints} u`,                            prix: pRobinets });
    if (pNourrice > 0) items.push({ icon: '🔀', nom: 'Nourrice 4 départs',        qte: `${Math.ceil(nbPoints/4)} u`,               prix: pNourrice });

    const sections = [{
      titre: `${matLabel} Ø${diametre}mm — EF ${longueurEF} ml · EC ${longueurEC} ml · ${nbPoints} points`,
      items,
    }];
    return { sections, coutMat, coutMO, margeMat, margeMO, surface: longueurTot, hMO };
  },

  // ── Calcul SANITAIRES ─────────────────────────────────────
  _calcSanitaires() {
    const nbWC       = this.v('sa-wc', 2);
    const nbLavabo   = this.v('sa-lavabo', 2);
    const nbDouche   = this.v('sa-douche', 1);
    const nbBaignoire= this.v('sa-baignoire', 1);
    const nbEvier    = this.v('sa-evier', 1);
    const nbMachine  = this.v('sa-machine', 2);
    const robType    = this.radio('sa-rob') || 'standard';
    const margeMat   = this.v('sa-marge-mat', 30) / 100;
    const margeMO    = this.v('sa-marge-mo', 20) / 100;

    const alertes = [];
    if (nbWC > 3) {
      alertes.push({ type: 'warning', msg: `⚠️ ${nbWC} WC → prévoir ${Math.ceil(nbWC/3)} chutes distinctes (max 3 WC par chute DN 100 — DTU 60.11 §5.3)` });
    }
    alertes.push({ type: 'info', msg: '🚿 Salle de bain → liaison équipotentielle obligatoire entre toutes les parties métalliques (NF C 15-100)' });
    if (nbDouche > 0 || nbBaignoire > 0) {
      alertes.push({ type: 'info', msg: '🚿 Receveur / baignoire → pente de 1.5% minimum vers la bonde (DTU 60.1)' });
    }
    this._renderAlertes(alertes);

    const pMitigeurLav = nbLavabo * (robType === 'thermostatique' ? this.PRIX.MITIGEUR_THERMO : this.PRIX.MITIGEUR_STD);
    const pMitigeurDou = nbDouche * (robType === 'thermostatique' ? this.PRIX.MITIGEUR_THERMO : this.PRIX.MITIGEUR_DOUCHE);
    const pMitigeurBai = nbBaignoire * this.PRIX.MITIGEUR_BAI;
    const pBondes      = nbDouche * this.PRIX.BONDE_DOUCHE + nbBaignoire * this.PRIX.BONDE_BAI;
    const pSiphons     = nbLavabo * this.PRIX.SIPHON_LAV + nbEvier * this.PRIX.SIPHON_EV;

    // Alimentation (tuyaux dérivation 2 ml/point)
    const nbPointsAli = nbWC + nbLavabo + nbDouche + nbBaignoire + nbEvier + nbMachine;
    const longueurDeriv = nbPointsAli * 2;
    const pTube = longueurDeriv * this.PRIX.TUBE_MULTI16;
    const pVannes = nbPointsAli * this.PRIX.VANNE_ARR;

    const coutMat = pMitigeurLav + pMitigeurDou + pMitigeurBai + pBondes + pSiphons + pTube + pVannes;
    const hMO     = nbPointsAli * 2.5;
    const coutMO  = hMO * this.tauxMO();

    const items = [];
    if (nbLavabo   > 0) items.push({ icon: '🚿', nom: `Mitigeur lavabo (${robType === 'thermostatique' ? 'thermostatique' : 'standard'})`, qte: `${nbLavabo} u`, prix: pMitigeurLav });
    if (nbDouche   > 0) items.push({ icon: '🚿', nom: 'Mitigeur douche + bonde',   qte: `${nbDouche} u`,    prix: pMitigeurDou + nbDouche * this.PRIX.BONDE_DOUCHE });
    if (nbBaignoire> 0) items.push({ icon: '🛁', nom: 'Mitigeur baignoire + bonde', qte: `${nbBaignoire} u`, prix: pMitigeurBai + nbBaignoire * this.PRIX.BONDE_BAI });
    if (nbLavabo + nbEvier > 0) items.push({ icon: '🌀', nom: 'Siphons lavabo / évier', qte: `${nbLavabo + nbEvier} u`, prix: pSiphons });
    items.push({ icon: '🔩', nom: 'Tube multicouche 16mm alimentation', qte: `${this.fmtN(longueurDeriv)} ml`, prix: pTube });
    items.push({ icon: '🚰', nom: 'Vannes d\'arrêt par appareil',         qte: `${nbPointsAli} u`,             prix: pVannes });

    const sections = [{
      titre: `${nbPointsAli} points eau — ${nbWC} WC · ${nbLavabo} lavabos · ${nbDouche} douche(s) · ${nbBaignoire} bain(s)`,
      items,
    }];
    return { sections, coutMat, coutMO, margeMat, margeMO, surface: nbPointsAli, hMO };
  },

  // ── Calcul CHAUFFAGE ──────────────────────────────────────
  _calcChauffage() {
    const type      = this.radio('ch-type') || 'radiateurs';
    const gen       = this.radio('ch-gen')  || 'gaz';
    const surface   = this.v('ch-surface', 80);
    const hauteur   = this.v('ch-hauteur', 2.50);
    const espacement= this.v('ch-espacement', 15); // cm
    const nbZones   = this.v('ch-zones', 4);
    const margeMat  = this.v('ch-marge-mat', 30) / 100;
    const margeMO   = this.v('ch-marge-mo', 20) / 100;

    // Puissance : 100W/m² standard RT2012, 70W/m² BBC
    const puissanceW = surface * 100;
    const puissanceKW = puissanceW / 1000;

    const alertes = [];
    if (type === 'pch' || type === 'mixte') {
      alertes.push({ type: 'info', msg: `🔥 PCH → température max 28°C en zone séjour · 19°C en SDB (DTU 65.14) · film de protection obligatoire sous chape` });
    }
    alertes.push({ type: 'info', msg: `🔥 Puissance estimée ${this.fmtN(puissanceKW, 1)} kW — prévoir chaudière avec marge 20% → ${this.fmtN(puissanceKW * 1.2, 1)} kW minimum` });
    this._renderAlertes(alertes);

    const sections = [];
    let coutMat = 0, hMO = 0;

    // Chaudière / générateur
    const prixGen = { gaz: this.PRIX.CHAUDIERE_GAZ, pac: this.PRIX.CHAUDIERE_PAC, electrique: this.PRIX.CHAUDIERE_ELEC, fioul: this.PRIX.CHAUDIERE_FIOUL }[gen] || this.PRIX.CHAUDIERE_GAZ;
    const labelGen = { gaz: 'Chaudière gaz condensation', pac: 'PAC air/eau', electrique: 'Chaudière électrique', fioul: 'Chaudière fioul' }[gen] || '';
    coutMat += prixGen;
    hMO += 8;
    sections.push({
      titre: `${labelGen} — ${this.fmtN(puissanceKW, 1)} kW`,
      items: [{ icon: '🔥', nom: labelGen + ` (${this.fmtN(puissanceKW,1)} kW)`, qte: '1 u', prix: prixGen }],
    });

    if (type === 'radiateurs' || type === 'mixte') {
      const nbRad = Math.ceil(surface / 15); // 1 radiateur pour 15m²
      const pRad  = nbRad * this.PRIX.RADIATEUR_MOY;
      // Réseau chauffage 2 tubes (aller + retour) × surface/5 ml
      const longueurReseau = surface / 5 * 2;
      const pReseau = longueurReseau * this.PRIX.TUBE_CU20;
      coutMat += pRad + pReseau;
      hMO += nbRad * 3 + longueurReseau * 0.5;
      sections.push({
        titre: `Radiateurs — ${nbRad} u pour ${this.fmtN(surface)} m²`,
        items: [
          { icon: '♨️', nom: 'Radiateurs acier à eau',               qte: `${nbRad} u`,                      prix: pRad },
          { icon: '🔩', nom: 'Réseau cuivre 20/22 aller-retour',     qte: `${this.fmtN(longueurReseau)} ml`, prix: pReseau },
        ],
      });
    }

    if (type === 'pch' || type === 'mixte') {
      // Tube PER 16mm — longueur = surface × 100 / espacement en cm
      const longueurPCH = (surface * 100) / espacement;
      const pTubePCH = longueurPCH * this.PRIX.TUBE_PCH16;
      const nbCollect = Math.ceil(nbZones / 4);
      const pCollect  = nbCollect * this.PRIX.COLLECTEUR_PCH;
      coutMat += pTubePCH + pCollect;
      hMO += surface * 0.15;
      sections.push({
        titre: `Plancher chauffant — ${this.fmtN(surface)} m² · pas ${espacement} cm`,
        items: [
          { icon: '🌡️', nom: `Tube PER 16 plancher chauffant (pas ${espacement}cm)`, qte: `${this.fmtN(longueurPCH, 0)} ml`, prix: pTubePCH },
          { icon: '🔀', nom: `Collecteur ${Math.ceil(nbZones / nbCollect)} départs`,  qte: `${nbCollect} u`, prix: pCollect },
        ],
      });
    }

    const coutMO = hMO * this.tauxMO();
    return { sections, coutMat, coutMO, margeMat, margeMO, surface, hMO };
  },

  // ── Calcul ÉVACUATION ─────────────────────────────────────
  _calcEvacuation() {
    const longueur    = this.v('ev-longueur', 12);
    const pente       = this.v('ev-pente', 2);
    const nbChutesWC  = this.v('ev-wc', 1);
    const nbChutesEU  = this.v('ev-eu', 2);
    const hauteurEtage= this.v('ev-hauteur', 3);
    const nbEtages    = this.v('ev-etages', 1);
    const avecRegards = this.checked('ev-regards');
    const avecSiphons = this.checked('ev-siphons');
    const avecVent    = this.checked('ev-ventilation');
    const margeMat    = this.v('ev-marge-mat', 30) / 100;
    const margeMO     = this.v('ev-marge-mo', 20) / 100;

    const alertes = [];
    if (pente < 1) {
      alertes.push({ type: 'error', msg: `⛔ Pente ${pente} cm/ml < 1 cm/ml — NON CONFORME DTU 60.11 (minimum 1 cm/ml pour EU, 2 cm/ml recommandé)` });
    } else if (pente < 2) {
      alertes.push({ type: 'warning', msg: `⚠️ Pente ${pente} cm/ml — conforme mais 2 cm/ml recommandé pour éviter les dépôts (DTU 60.11)` });
    } else {
      alertes.push({ type: 'ok', msg: `✅ Pente ${pente} cm/ml — conforme DTU 60.11 (mini 1 cm/ml)` });
    }
    if (pente > 4) {
      alertes.push({ type: 'warning', msg: `⚠️ Pente ${pente} cm/ml > 4 cm/ml — risque d'autosiphonage (DTU 60.11 §4.2)` });
    }
    alertes.push({ type: 'info', msg: '🚽 Chute WC → DN 100 obligatoire · regard de visite tous les 10 ml · siphon obligatoire à chaque appareil' });
    this._renderAlertes(alertes);

    // Collecteur principal EU (DN 100 si WC, DN 50 sinon)
    const dnCollect = nbChutesWC > 0 ? 100 : 50;
    const pCollect  = longueur * (dnCollect === 100 ? this.PRIX.TUBE_PVC100 : this.PRIX.TUBE_PVC40);

    // Chutes WC (DN 100)
    const longueurChutesWC = nbChutesWC * hauteurEtage * nbEtages;
    const pChutesWC = longueurChutesWC * this.PRIX.TUBE_PVC100;

    // Chutes EU (DN 50)
    const longueurChutesEU = nbChutesEU * hauteurEtage * nbEtages;
    const pChutesEU = longueurChutesEU * this.PRIX.TUBE_PVC40;

    let coutMat = pCollect + pChutesWC + pChutesEU;
    const hMO   = (longueur + longueurChutesWC + longueurChutesEU) * 0.5;

    const items = [
      { icon: '🌊', nom: `Collecteur PVC DN ${dnCollect} (pente ${pente} cm/ml)`, qte: `${this.fmtN(longueur)} ml`, prix: pCollect },
    ];
    if (longueurChutesWC > 0) items.push({ icon: '🚽', nom: 'Chute PVC DN 100 (WC)',     qte: `${this.fmtN(longueurChutesWC)} ml`, prix: pChutesWC });
    if (longueurChutesEU > 0) items.push({ icon: '💧', nom: 'Chute PVC DN 50 (EU)',       qte: `${this.fmtN(longueurChutesEU)} ml`, prix: pChutesEU });

    if (avecRegards) {
      const nbRegards = Math.max(1, Math.ceil(longueur / 10));
      const pRegards  = nbRegards * this.PRIX.REGARD_30;
      coutMat += pRegards;
      items.push({ icon: '🔲', nom: 'Regards de visite 30×30', qte: `${nbRegards} u`, prix: pRegards });
    }
    if (avecSiphons) {
      const nbSiphons = nbChutesEU + 1;
      const pSiphons  = nbSiphons * this.PRIX.SIPHON_SOL;
      coutMat += pSiphons;
      items.push({ icon: '🌀', nom: 'Siphons de sol',          qte: `${nbSiphons} u`, prix: pSiphons });
    }
    if (avecVent) {
      const nbVent = nbChutesWC + nbChutesEU;
      const pVent  = nbVent * this.PRIX.CHAPEAU_ASPIR;
      coutMat += pVent;
      items.push({ icon: '💨', nom: 'Chapeaux de ventilation primaire', qte: `${nbVent} u`, prix: pVent });
    }

    const coutMO  = hMO * this.tauxMO();
    const sections = [{
      titre: `Évacuation DN${dnCollect} — collecteur ${longueur} ml · pente ${pente} cm/ml`,
      items,
    }];
    return { sections, coutMat, coutMO, margeMat, margeMO, surface: longueur, hMO };
  },

  // ── Alertes DTU ───────────────────────────────────────────
  _renderAlertes(alertes) {
    const el = document.getElementById('plo-alertes');
    if (!el) return;
    if (!alertes || !alertes.length) { el.innerHTML = ''; return; }
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
    const body = document.getElementById('plo-results-body');
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
        <div class="res-fin-row"><span class="res-fin-label">Matériaux HT achat</span><span class="res-fin-value">${this.fmt(coutMat)} €</span></div>
        <div class="res-fin-row"><span class="res-fin-label">Main d'œuvre HT</span><span class="res-fin-value">${this.fmt(coutMO)} €</span></div>
        <div class="res-fin-row"><span class="res-fin-label">Matériaux facturés (+${Math.round(margeMat*100)}%)</span><span class="res-fin-value">${this.fmt(coutMat*(1+margeMat))} €</span></div>
        <div class="res-fin-row"><span class="res-fin-label">MO facturée (+${Math.round(margeMO*100)}%)</span><span class="res-fin-value">${this.fmt(coutMO*(1+margeMO))} €</span></div>
        <div class="res-fin-row"><span class="res-fin-label">TVA ${Math.round(tva*100)}%</span><span class="res-fin-value">${this.fmt(totalHT*tva)} €</span></div>
        <div class="res-fin-total"><span class="label">TOTAL TTC</span><span class="value">${this.fmt(totalTTC)} €</span></div>
      </div>`;

    body.innerHTML = html;
  },

  // ── Copier ────────────────────────────────────────────────
  copier() {
    if (!this._lastResult) return;
    const r = this._lastResult;
    let text = 'ESTIMATION PLOMBERIE DTU 60.1 — PlaqPro\n' + '='.repeat(44) + '\n';
    r.sections.forEach(s => {
      text += `\n${s.titre}\n`;
      s.items.forEach(i => { text += `  ${i.nom}: ${i.qte} — ${this.fmt(i.prix)} €\n`; });
    });
    text += '\n' + '─'.repeat(44) + '\n';
    text += `Matériaux HT : ${this.fmt(r.coutMat)} €\n`;
    text += `Main d'œuvre HT : ${this.fmt(r.coutMO)} €\n`;
    text += `TOTAL TTC : ${this.fmt(r.totalTTC)} €\n`;
    navigator.clipboard.writeText(text)
      .then(() => App.toast('Résultat copié !'))
      .catch(() => App.toast('Copie non disponible', 'error'));
  },

  // ── Créer devis plomberie ─────────────────────────────────
  creerDevis() {
    if (!this._lastResult) { App.toast('Calculez d\'abord une estimation', 'error'); return; }
    const clients = DB.clients;
    if (!clients.length) { App.toast('Créez d\'abord un client', 'error'); return; }
    const r = this._lastResult;
    document.getElementById('modal-title').textContent = '📄 Créer devis plomberie';
    document.getElementById('modal-body').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="calc-input-group">
          <label>Client</label>
          <select id="plo-devis-client" style="background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px;width:100%" onchange="Plomberie._updateChantiersSelect()">
            <option value="">— Sélectionnez un client —</option>
            ${clients.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
          </select>
        </div>
        <div class="calc-input-group">
          <label>Chantier</label>
          <select id="plo-devis-chantier" style="background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px;width:100%">
            <option value="">— Sélectionnez un chantier —</option>
            ${DB.chantiers.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
          </select>
        </div>
        <div class="calc-input-group">
          <label>Objet du devis</label>
          <input type="text" id="plo-devis-objet" value="Travaux de plomberie — DTU 60.1" style="background:var(--bg-elevated);border:1px solid var(--glass-border-md);border-radius:var(--r-md);padding:9px 12px;color:var(--text-primary);font-family:var(--font);font-size:14px;width:100%">
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
      <button class="btn btn-primary" onclick="Plomberie._validerDevis()">Créer le devis</button>`;
    document.getElementById('modal-overlay').style.display = 'flex';
  },

  _updateChantiersSelect() {
    const clientId = parseInt(document.getElementById('plo-devis-client').value);
    const sel = document.getElementById('plo-devis-chantier');
    if (!sel) return;
    const chantiers = clientId ? DB.getChantiersByClient(clientId) : DB.chantiers;
    sel.innerHTML = '<option value="">— Sélectionnez un chantier —</option>' +
      chantiers.map(c => `<option value="${c.id}">${c.nom}</option>`).join('');
  },

  _validerDevis() {
    const clientId   = parseInt(document.getElementById('plo-devis-client').value);
    const chantierId = parseInt(document.getElementById('plo-devis-chantier').value);
    const objet      = document.getElementById('plo-devis-objet').value.trim() || 'Travaux de plomberie';
    if (!clientId)   { App.toast('Sélectionnez un client', 'error');   return; }
    if (!chantierId) { App.toast('Sélectionnez un chantier', 'error'); return; }
    const r   = this._lastResult;
    const tva = DB.getRatio('TVA_TRAVAUX') || 0.10;
    const lignes = [];
    r.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.prix > 0) {
          lignes.push({ designation: item.nom, quantite: 1, unite: 'ff', prixUnitaire: item.prix * (1 + r.margeMat), tva, total: item.prix * (1 + r.margeMat) });
        }
      });
    });
    if (r.coutMO > 0) {
      lignes.push({ designation: 'Main d\'œuvre plomberie', quantite: Math.round(r.hMO * 10) / 10, unite: 'h', prixUnitaire: this.tauxMO() * (1 + r.margeMO), tva, total: r.coutMO * (1 + r.margeMO) });
    }
    const config = DB.getConfig();
    const prefix = config.prefixeDevis || 'DEV-';
    const year   = new Date().getFullYear();
    const numero = `${prefix}${year}-${String(DB.devis.length + 1).padStart(4, '0')}`;
    const devis = DB.addDevis({ numero, objet, clientId, chantierId, date: new Date().toISOString().slice(0, 10), validite: 30, statut: 'Brouillon', lignes, totalHT: r.totalHT, totalTTC: r.totalTTC, notes: 'Devis plomberie généré depuis PlaqPro — Travaux conformes DTU 60.1 / DTU 60.11.' });
    App.closeModal();
    App.toast(`Devis ${devis.numero} créé !`);
    App.navigate('devis');
  },

  // ── Styles ────────────────────────────────────────────────
  _injectStyles() {
    if (!document.getElementById('calc-styles')) {
      const s = document.createElement('style');
      s.id = 'calc-styles';
      s.textContent = `
        .calc-hero { background:linear-gradient(135deg,rgba(79,142,247,0.15) 0%,rgba(45,212,160,0.08) 50%,rgba(167,139,250,0.08) 100%); border:1px solid rgba(79,142,247,0.2); border-radius:var(--r-xl); padding:24px 28px; margin-bottom:20px; position:relative; overflow:hidden; }
        .calc-hero::before { content:''; position:absolute; top:-50%; right:-10%; width:200px; height:200px; background:radial-gradient(circle,rgba(79,142,247,0.15),transparent 70%); pointer-events:none; }
        .calc-hero-inner { display:flex; align-items:center; gap:16px; }
        .calc-hero-icon  { font-size:40px; }
        .calc-hero-title { font-size:24px; font-weight:800; color:var(--text-primary); letter-spacing:-0.5px; }
        .calc-hero-sub   { font-size:14px; color:var(--text-secondary); margin-top:4px; }
        .calc-grid { display:grid; grid-template-columns:1fr; gap:16px; align-items:start; min-height:0; }
        @media (min-width:1400px) { .calc-grid { grid-template-columns:1fr 1fr; } }
        .calc-panel { background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:var(--r-xl); overflow:hidden; backdrop-filter:blur(12px); }
        .calc-tabs { display:flex; flex-wrap:wrap; border-bottom:1px solid var(--glass-border); background:rgba(255,255,255,0.02); padding:8px 8px 0; gap:4px; }
        .calc-tab { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:var(--r-md) var(--r-md) 0 0; font-family:var(--font); font-size:13px; font-weight:500; color:var(--text-secondary); background:none; border:1px solid transparent; border-bottom:none; cursor:pointer; transition:all 0.15s; white-space:nowrap; flex-shrink:0; }
        .calc-tab:hover { color:var(--text-primary); background:var(--glass-bg-md); }
        .calc-tab.active { color:var(--accent); background:var(--glass-bg-strong); border-color:var(--glass-border-md); font-weight:600; }
        .calc-tab-icon { font-size:15px; }
        .calc-form { display:none; padding:20px; }
        .calc-form.active { display:block; }
        .calc-section-title { font-size:11px; font-weight:700; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid var(--glass-border); }
        .calc-input-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:4px; }
        .calc-input-group { display:flex; flex-direction:column; gap:6px; }
        .calc-input-group label { font-size:12px; font-weight:600; color:var(--text-secondary); }
        .calc-input-wrap { display:flex; align-items:center; background:rgba(255,255,255,0.05); border:1px solid var(--glass-border-md); border-radius:var(--r-md); overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.2); transition:border-color 0.15s,box-shadow 0.15s; }
        .calc-input-wrap:focus-within { border-color:var(--accent); box-shadow:0 0 0 3px rgba(79,142,247,0.15); }
        .calc-input-wrap input,.calc-input-wrap select { flex:1; height:38px; padding:0 12px; background:none; border:none; outline:none; font-family:var(--font-mono); font-size:16px; font-weight:600; color:var(--text-primary); width:0; }
        .calc-unit { padding:0 10px; font-size:12px; font-weight:600; color:var(--text-tertiary); background:rgba(255,255,255,0.04); border-left:1px solid var(--glass-border); height:38px; display:flex; align-items:center; white-space:nowrap; }
        .calc-radio-group { display:flex; flex-direction:column; gap:8px; margin-bottom:4px; }
        .calc-radio { display:flex; align-items:center; gap:10px; padding:9px 14px; border-radius:var(--r-md); background:var(--glass-bg); border:1px solid var(--glass-border); cursor:pointer; font-size:13px; color:var(--text-secondary); transition:all 0.15s; }
        .calc-radio:hover { border-color:var(--glass-border-md); color:var(--text-primary); }
        .calc-radio input[type="radio"] { accent-color:var(--accent); width:15px; height:15px; }
        .calc-radio input[type="radio"]:checked + span { color:var(--accent); font-weight:600; }
        .calc-check-group { display:flex; flex-direction:column; gap:6px; margin-bottom:4px; }
        .calc-check-2col { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:4px; }
        .calc-check { display:flex; align-items:center; gap:9px; padding:8px 12px; border-radius:var(--r-sm); background:var(--glass-bg); border:1px solid var(--glass-border); cursor:pointer; font-size:13px; color:var(--text-secondary); transition:all 0.15s; }
        .calc-check:hover { border-color:var(--glass-border-md); color:var(--text-primary); }
        .calc-check input[type="checkbox"] { accent-color:var(--accent); width:15px; height:15px; flex-shrink:0; }
        .calc-results { background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:var(--r-xl); overflow:hidden; backdrop-filter:blur(12px); }
        .calc-results-header { padding:16px 20px; border-bottom:1px solid var(--glass-border); display:flex; align-items:center; justify-content:space-between; background:var(--glass-shine); }
        .calc-results-title { font-size:15px; font-weight:600; color:var(--text-primary); }
        .calc-empty { text-align:center; padding:40px 20px; }
        .res-material { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:var(--r-md); margin-bottom:6px; background:var(--glass-bg); border:1px solid var(--glass-border); transition:border-color 0.15s; }
        .res-material:hover { border-color:var(--glass-border-md); }
        .res-mat-left { display:flex; align-items:center; gap:10px; }
        .res-mat-icon { font-size:18px; width:28px; text-align:center; flex-shrink:0; }
        .res-mat-name { font-size:13px; font-weight:500; color:var(--text-primary); }
        .res-mat-qty  { font-size:12px; color:var(--text-secondary); margin-top:2px; font-family:var(--font-mono); }
        .res-mat-right { text-align:right; }
        .res-mat-prix  { font-size:14px; font-weight:700; color:var(--text-primary); font-family:var(--font-mono); }
        .res-mat-unit  { font-size:11px; color:var(--text-tertiary); }
        .res-section { font-size:11px; font-weight:700; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.08em; padding:14px 4px 6px; border-bottom:1px solid var(--glass-border); margin-bottom:8px; }
        .res-financier { margin-top:14px; background:linear-gradient(135deg,rgba(79,142,247,0.08),rgba(45,212,160,0.05)); border:1px solid rgba(79,142,247,0.2); border-radius:var(--r-lg); overflow:hidden; }
        .res-fin-row { display:flex; justify-content:space-between; align-items:center; padding:10px 16px; border-bottom:1px solid var(--glass-border); font-size:13px; }
        .res-fin-row:last-child { border-bottom:none; }
        .res-fin-label { color:var(--text-secondary); }
        .res-fin-value { font-family:var(--font-mono); font-weight:600; color:var(--text-primary); }
        .res-fin-total { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:rgba(79,142,247,0.12); }
        .res-fin-total .label { font-size:13px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:0.05em; }
        .res-fin-total .value { font-size:22px; font-weight:800; color:var(--text-primary); font-family:var(--font-mono); }
        .ratios-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:10px; }
        .ratio-item { background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:var(--r-md); padding:10px 14px; display:flex; justify-content:space-between; align-items:center; }
        .ratio-label { font-size:12px; color:var(--text-secondary); }
        .ratio-value { font-family:var(--font-mono); font-size:13px; font-weight:600; color:var(--accent); }
      `;
      document.head.appendChild(s);
    }

    if (!document.getElementById('plo-styles')) {
      const s = document.createElement('style');
      s.id = 'plo-styles';
      s.textContent = `
        .plo-hero {
          background: linear-gradient(135deg, rgba(45,212,160,0.13) 0%, rgba(79,142,247,0.07) 50%, rgba(167,139,250,0.06) 100%);
          border: 1px solid rgba(45,212,160,0.22);
          border-radius: var(--r-xl);
          padding: 24px 28px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .plo-hero::before {
          content: '';
          position: absolute;
          top: -50%; right: -10%;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(45,212,160,0.18), transparent 70%);
          pointer-events: none;
        }
        .plo-hero-inner { display: flex; align-items: center; gap: 16px; }
        .plo-hero-icon  { font-size: 40px; line-height: 1; }
        .plo-hero-title { font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
        .plo-hero-sub   { font-size: 14px; color: var(--text-secondary); margin-top: 4px; flex: 1; }
        .plo-norme-badge {
          font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
          background: rgba(45,212,160,0.15); border: 1px solid rgba(45,212,160,0.3);
          color: var(--green); border-radius: var(--r-full);
          padding: 5px 12px; white-space: nowrap; flex-shrink: 0;
        }
        .plo-ref-row {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 8px; padding: 8px 10px; border-radius: var(--r-sm);
          border-bottom: 1px solid var(--glass-border); font-size: 12px;
        }
        .plo-ref-row:last-child { border-bottom: none; }
        .plo-ref-usage  { color: var(--text-primary); font-weight: 500; }
        .plo-ref-debit  { color: var(--accent); font-family: var(--font-mono); font-weight: 600; }
        .plo-ref-dn     { color: var(--orange); font-family: var(--font-mono); }
        .plo-ref-note   { color: var(--text-tertiary); }
      `;
      document.head.appendChild(s);
    }
  },
};
