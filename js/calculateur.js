/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Calculateur Express "Chantier au pied levé"
//  A ajouter dans app.js : Pages.calculateur()
//  Et dans la sidebar : { page: 'calculateur', icon: '⚡', label: 'Calcul Express' }
// ============================================================

// ── Ajouter dans la navigation (sidebar) ─────────────────────
// Dans App.renderSidebar(), après { page: 'metrages' ... } :
// { page: 'calculateur', icon: '⚡', label: 'Calcul Express' },

// ── Page Calculateur Express ──────────────────────────────────
Pages.calculateur = function() {
  const div = document.createElement('div');

  div.innerHTML = `
    <!-- En-tête -->
    <div class="calc-hero">
      <div class="calc-hero-inner">
        <div class="calc-hero-icon">⚡</div>
        <div>
          <h1 class="calc-hero-title">Calcul Express</h1>
          <p class="calc-hero-sub">Estimez vos besoins en matériaux en 30 secondes — ratios professionnels intégrés</p>
        </div>
      </div>
    </div>

    <!-- Grille principale -->
    <div class="calc-grid">

      <!-- ── PANNEAU SAISIE ────────────────────────────── -->
      <div class="calc-panel">

        <!-- Tabs tâches -->
        <div class="calc-tabs">
          <button class="calc-tab active" data-tab="cloison" onclick="Calc.switchTab('cloison', this)">
            <span class="calc-tab-icon">🧱</span> Cloison
          </button>
          <button class="calc-tab" data-tab="doublage" onclick="Calc.switchTab('doublage', this)">
            <span class="calc-tab-icon">🏠</span> Doublage
          </button>
          <button class="calc-tab" data-tab="plafond" onclick="Calc.switchTab('plafond', this)">
            <span class="calc-tab-icon">⬆</span> Plafond
          </button>
          <button class="calc-tab" data-tab="peinture" onclick="Calc.switchTab('peinture', this)">
            <span class="calc-tab-icon">🎨</span> Peinture
          </button>
          <button class="calc-tab" data-tab="complet" onclick="Calc.switchTab('complet', this)">
            <span class="calc-tab-icon">🏗</span> Chantier complet
          </button>
          <button class="calc-tab" data-tab="multipacks" onclick="Calc.switchTab('multipacks', this)">
            <span class="calc-tab-icon">🔧</span> Multi-packs
          </button>
          <button class="calc-tab" data-tab="pay-terrain" onclick="Calc.switchTab('pay-terrain', this)">
            <span class="calc-tab-icon">⛏</span> Terrain & Sol
          </button>
          <button class="calc-tab" data-tab="pay-vegetal" onclick="Calc.switchTab('pay-vegetal', this)">
            <span class="calc-tab-icon">🌿</span> Végétal
          </button>
          <button class="calc-tab" data-tab="pay-mo" onclick="Calc.switchTab('pay-mo', this)">
            <span class="calc-tab-icon">👷</span> Main d'œuvre
          </button>
        </div>

        <!-- ── TAB CLOISON ── -->
        <div id="tab-cloison" class="calc-form active">
          <div class="calc-section-title">📐 Dimensions de la cloison</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Longueur totale</label>
              <div class="calc-input-wrap">
                <input type="number" id="cl-longueur" value="10" min="0.5" step="0.5" oninput="Calc.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Hauteur sous plafond</label>
              <div class="calc-input-wrap">
                <input type="number" id="cl-hauteur" value="2.60" min="1" step="0.05" oninput="Calc.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">⚙️ Type de cloison</div>
          <div class="calc-radio-group">
            <label class="calc-radio"><input type="radio" name="cl-type" value="48" checked onchange="Calc.compute()"><span>M48 — Standard</span></label>
            <label class="calc-radio"><input type="radio" name="cl-type" value="70" onchange="Calc.compute()"><span>M70 — Acoustique</span></label>
            <label class="calc-radio"><input type="radio" name="cl-type" value="98" onchange="Calc.compute()"><span>M98 — Haute perf.</span></label>
          </div>

          <div class="calc-section-title mt-16">🧩 Options</div>
          <div class="calc-check-group">
            <label class="calc-check"><input type="checkbox" id="cl-iso" onchange="Calc.compute()"><span>Avec isolation laine de verre</span></label>
            <label class="calc-check"><input type="checkbox" id="cl-double" onchange="Calc.compute()"><span>Double plaquage (phonique)</span></label>
            <label class="calc-check"><input type="checkbox" id="cl-joint" checked onchange="Calc.compute()"><span>Inclure jointage</span></label>
          </div>

          <div class="calc-section-title mt-16">💰 Tarification</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="cl-marge-mat" value="30" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="cl-marge-mo" value="20" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── TAB DOUBLAGE ── -->
        <div id="tab-doublage" class="calc-form">
          <div class="calc-section-title">📐 Surface à doubler</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface murs</label>
              <div class="calc-input-wrap">
                <input type="number" id="db-surface" value="30" min="1" step="0.5" oninput="Calc.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Hauteur</label>
              <div class="calc-input-wrap">
                <input type="number" id="db-hauteur" value="2.50" min="1" step="0.05" oninput="Calc.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>
          <div class="calc-section-title mt-16">🧩 Type d'isolation</div>
          <div class="calc-radio-group">
            <label class="calc-radio"><input type="radio" name="db-iso" value="45" checked onchange="Calc.compute()"><span>LV 45mm — Th32</span></label>
            <label class="calc-radio"><input type="radio" name="db-iso" value="100" onchange="Calc.compute()"><span>LV 100mm — Th32</span></label>
            <label class="calc-radio"><input type="radio" name="db-iso" value="lr50" onchange="Calc.compute()"><span>LR 50mm — Acoustique</span></label>
          </div>
          <div class="calc-section-title mt-16">💰 Marges</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="db-marge-mat" value="30" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="db-marge-mo" value="20" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── TAB PLAFOND ── -->
        <div id="tab-plafond" class="calc-form">
          <div class="calc-section-title">📐 Surface du plafond</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Longueur pièce</label>
              <div class="calc-input-wrap">
                <input type="number" id="pf-longueur" value="6" min="1" step="0.5" oninput="Calc.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Largeur pièce</label>
              <div class="calc-input-wrap">
                <input type="number" id="pf-largeur" value="4" min="1" step="0.5" oninput="Calc.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>
          <div class="calc-section-title mt-16">⚙️ Type de plafond</div>
          <div class="calc-radio-group">
            <label class="calc-radio"><input type="radio" name="pf-type" value="suspendu" checked onchange="Calc.compute()"><span>Plafond suspendu (ossature F530)</span></label>
            <label class="calc-radio"><input type="radio" name="pf-type" value="direct" onchange="Calc.compute()"><span>Fixation directe</span></label>
          </div>
          <div class="calc-check-group mt-8">
            <label class="calc-check"><input type="checkbox" id="pf-iso" checked onchange="Calc.compute()"><span>Avec isolation (laine de verre 100mm)</span></label>
          </div>
          <div class="calc-section-title mt-16">💰 Marges</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="pf-marge-mat" value="30" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="pf-marge-mo" value="20" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── TAB PEINTURE ── -->
        <div id="tab-peinture" class="calc-form">
          <div class="calc-section-title">📐 Surfaces</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Surface murs</label>
              <div class="calc-input-wrap">
                <input type="number" id="pe-murs" value="50" min="0" step="1" oninput="Calc.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Surface plafond</label>
              <div class="calc-input-wrap">
                <input type="number" id="pe-plafond" value="20" min="0" step="1" oninput="Calc.compute()">
                <span class="calc-unit">m²</span>
              </div>
            </div>
          </div>
          <div class="calc-section-title mt-16">🎨 Paramètres</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Nombre de couches</label>
              <div class="calc-input-wrap">
                <input type="number" id="pe-couches" value="2" min="1" max="4" oninput="Calc.compute()">
                <span class="calc-unit">c</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Rendement peinture</label>
              <div class="calc-input-wrap">
                <input type="number" id="pe-rendement" value="10" min="5" max="20" oninput="Calc.compute()">
                <span class="calc-unit">m²/L</span>
              </div>
            </div>
          </div>
          <div class="calc-check-group mt-8">
            <label class="calc-check"><input type="checkbox" id="pe-appret" checked onchange="Calc.compute()"><span>Inclure apprêt (1 couche, rendement ×1.2)</span></label>
            <label class="calc-check"><input type="checkbox" id="pe-boiseries" onchange="Calc.compute()"><span>Boiseries / huisseries (ajouter 15%)</span></label>
          </div>
          <div class="calc-section-title mt-16">💰 Marges</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="pe-marge-mat" value="30" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="pe-marge-mo" value="20" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── TAB CHANTIER COMPLET ── -->
        <div id="tab-complet" class="calc-form">
          <div class="calc-section-title">📐 Métrés de la pièce / zone</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Longueur</label>
              <div class="calc-input-wrap">
                <input type="number" id="cp-long" value="6" min="1" step="0.5" oninput="Calc.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Largeur</label>
              <div class="calc-input-wrap">
                <input type="number" id="cp-larg" value="4" min="1" step="0.5" oninput="Calc.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
          </div>
          <div class="calc-input-row mt-8">
            <div class="calc-input-group">
              <label>Hauteur</label>
              <div class="calc-input-wrap">
                <input type="number" id="cp-haut" value="2.60" min="1" step="0.05" oninput="Calc.compute()">
                <span class="calc-unit">m</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Ml de cloisons intérieures</label>
              <div class="calc-input-wrap">
                <input type="number" id="cp-cloisons" value="8" min="0" step="0.5" oninput="Calc.compute()">
                <span class="calc-unit">ml</span>
              </div>
            </div>
          </div>

          <div class="calc-section-title mt-16">🧩 Prestations incluses</div>
          <div class="calc-check-2col">
            <label class="calc-check"><input type="checkbox" id="cp-cloison" checked onchange="Calc.compute()"><span>Cloisons M48</span></label>
            <label class="calc-check"><input type="checkbox" id="cp-joint" checked onchange="Calc.compute()"><span>Jointage Q2</span></label>
            <label class="calc-check"><input type="checkbox" id="cp-iso" onchange="Calc.compute()"><span>Isolation LV 45mm</span></label>
            <label class="calc-check"><input type="checkbox" id="cp-plafond" onchange="Calc.compute()"><span>Plafond suspendu</span></label>
            <label class="calc-check"><input type="checkbox" id="cp-peinture" checked onchange="Calc.compute()"><span>Peinture murs (2 couches)</span></label>
            <label class="calc-check"><input type="checkbox" id="cp-peinture-plaf" onchange="Calc.compute()"><span>Peinture plafond</span></label>
          </div>

          <div class="calc-section-title mt-16">💰 Marges globales</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="cp-marge-mat" value="30" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="cp-marge-mo" value="20" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── TAB MULTI-PACKS ── -->
        <div id="tab-multipacks" class="calc-form">
          <div class="calc-section-title">🔧 Combiner plusieurs corps de métier</div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:14px">
            Sélectionnez les packs à inclure et renseignez la surface / quantité pour chacun.
          </div>

          <div id="mp-packs">

            <!-- Cloison -->
            <div class="mp-pack" id="mp-cloison-wrap" style="border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:10px">
              <label class="calc-check" style="margin-bottom:8px">
                <input type="checkbox" id="mp-cloison" onchange="Calc.compute()">
                <span style="font-weight:600">🧱 Cloisons (M48)</span>
              </label>
              <div class="calc-input-row" style="margin:0">
                <div class="calc-input-group">
                  <label>Linéaire cloisons</label>
                  <div class="calc-input-wrap">
                    <input type="number" id="mp-cl-long" value="10" min="0" step="0.5" oninput="Calc.compute()">
                    <span class="calc-unit">ml</span>
                  </div>
                </div>
                <div class="calc-input-group">
                  <label>Hauteur</label>
                  <div class="calc-input-wrap">
                    <input type="number" id="mp-cl-h" value="2.60" min="1" step="0.05" oninput="Calc.compute()">
                    <span class="calc-unit">m</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Électricité -->
            <div class="mp-pack" style="border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:10px">
              <label class="calc-check" style="margin-bottom:8px">
                <input type="checkbox" id="mp-elec" onchange="Calc.compute()">
                <span style="font-weight:600">⚡ Électricité</span>
              </label>
              <div class="calc-input-row" style="margin:0">
                <div class="calc-input-group">
                  <label>Nb prises</label>
                  <div class="calc-input-wrap">
                    <input type="number" id="mp-el-prises" value="8" min="0" oninput="Calc.compute()">
                    <span class="calc-unit">u</span>
                  </div>
                </div>
                <div class="calc-input-group">
                  <label>Nb points lumière</label>
                  <div class="calc-input-wrap">
                    <input type="number" id="mp-el-lumiere" value="4" min="0" oninput="Calc.compute()">
                    <span class="calc-unit">u</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Carrelage -->
            <div class="mp-pack" style="border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:10px">
              <label class="calc-check" style="margin-bottom:8px">
                <input type="checkbox" id="mp-carrelage" onchange="Calc.compute()">
                <span style="font-weight:600">🔲 Carrelage / sol</span>
              </label>
              <div class="calc-input-row" style="margin:0">
                <div class="calc-input-group">
                  <label>Surface sol</label>
                  <div class="calc-input-wrap">
                    <input type="number" id="mp-ca-sol" value="20" min="0" step="0.5" oninput="Calc.compute()">
                    <span class="calc-unit">m²</span>
                  </div>
                </div>
                <div class="calc-input-group">
                  <label>Prix carrelage</label>
                  <div class="calc-input-wrap">
                    <input type="number" id="mp-ca-prix" value="25" min="0" step="0.5" oninput="Calc.compute()">
                    <span class="calc-unit">€/m²</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Peinture -->
            <div class="mp-pack" style="border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:10px">
              <label class="calc-check" style="margin-bottom:8px">
                <input type="checkbox" id="mp-peinture" onchange="Calc.compute()">
                <span style="font-weight:600">🎨 Peinture</span>
              </label>
              <div class="calc-input-row" style="margin:0">
                <div class="calc-input-group">
                  <label>Surface murs</label>
                  <div class="calc-input-wrap">
                    <input type="number" id="mp-pe-murs" value="50" min="0" step="1" oninput="Calc.compute()">
                    <span class="calc-unit">m²</span>
                  </div>
                </div>
                <div class="calc-input-group">
                  <label>Nb couches</label>
                  <div class="calc-input-wrap">
                    <input type="number" id="mp-pe-couches" value="2" min="1" max="4" oninput="Calc.compute()">
                    <span class="calc-unit">c</span>
                  </div>
                </div>
              </div>
            </div>

          </div><!-- /mp-packs -->

          <!-- ── ARTICLES LIBRES MULTI-PACKS ── -->
          <div class="calc-section-title mt-16">🔍 Ajouter des articles</div>
          <div style="position:relative;margin-bottom:8px">
            <input class="form-control" id="mp-search-produit"
              placeholder="Chercher dans la base tarifaire (3 lettres min.)…"
              oninput="Calc.searchProduit(this.value)" style="font-size:13px">
            <div id="mp-search-drop" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:200;
                 background:var(--bg-secondary);border:1px solid var(--border);border-radius:0 0 var(--r-md) var(--r-md);
                 max-height:200px;overflow-y:auto;box-shadow:var(--shadow-lg)"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 56px 80px auto;gap:6px;align-items:end;margin-bottom:8px">
            <div>
              <label class="calc-section-title" style="margin-bottom:3px;padding-bottom:0;border:none">Désignation *</label>
              <input class="form-control" id="mp-ligne-desig" placeholder="Désignation libre…" style="font-size:12px">
            </div>
            <div>
              <label class="calc-section-title" style="margin-bottom:3px;padding-bottom:0;border:none">Qté</label>
              <input type="number" class="form-control" id="mp-ligne-qte" value="1" min="0" step="0.1" style="font-size:12px">
            </div>
            <div>
              <label class="calc-section-title" style="margin-bottom:3px;padding-bottom:0;border:none">PU HT €</label>
              <input type="number" class="form-control" id="mp-ligne-pu" value="0" min="0" step="0.01" style="font-size:12px">
            </div>
            <button class="btn btn-secondary btn-sm" onclick="Calc.addMpLigne()" style="height:38px;white-space:nowrap">+ Ajouter</button>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px" id="mp-corps-btns">
            <span style="font-size:11px;color:var(--text-tertiary);align-self:center">Corps :</span>
            ${['Plaquiste','Peintre','Électricien','Plombier','Maçon','Autre'].map((c,i) =>
              `<button class="mp-corps-btn${i===0?' active':''}" data-corps="${c}" onclick="Calc.selectMpCorps(this,'${c}')">${c}</button>`
            ).join('')}
          </div>
          <div id="mp-lignes-table" style="display:none;margin-bottom:14px">
            <div class="calc-section-title">📋 Lignes saisies</div>
            <div id="mp-lignes-body"></div>
            <div id="mp-sous-totaux" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px"></div>
          </div>

          <div class="calc-section-title mt-16">💰 Marge globale</div>
          <div class="calc-input-row">
            <div class="calc-input-group">
              <label>Marge matériaux</label>
              <div class="calc-input-wrap">
                <input type="number" id="mp-marge-mat" value="30" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
            <div class="calc-input-group">
              <label>Marge MO</label>
              <div class="calc-input-wrap">
                <input type="number" id="mp-marge-mo" value="20" min="0" max="100" oninput="Calc.compute()">
                <span class="calc-unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── TAB PAYSAGISME — TERRAIN & SOL ── -->
        <div id="tab-pay-terrain" class="calc-form">
          <div class="calc-section-title">📐 Surface du terrain</div>
          <div id="polygone-container"></div>
          <div class="calc-input-group">
            <label>Longueur (m)</label>
            <div class="calc-input-wrap">
              <input type="number" id="pt-longueur" value="20" min="1" step="0.5" oninput="Calc.compute()">
              <span class="calc-unit">m</span>
            </div>
          </div>
          <div class="calc-input-group">
            <label>Largeur (m)</label>
            <div class="calc-input-wrap">
              <input type="number" id="pt-largeur" value="15" min="1" step="0.5" oninput="Calc.compute()">
              <span class="calc-unit">m</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">⛏ Terrassement</div>
          <div class="calc-input-group">
            <label>Profondeur (m)</label>
            <div class="calc-input-wrap">
              <input type="number" id="pt-profondeur" value="0.30" min="0.05" step="0.05" oninput="Calc.compute()">
              <span class="calc-unit">m</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">🪨 Béton désactivé</div>
          <label class="calc-check"><input type="checkbox" id="pt-beton" onchange="Calc.compute()"><span>Inclure béton désactivé</span></label>
          <div class="calc-input-group">
            <label>Épaisseur (cm)</label>
            <div class="calc-input-wrap">
              <input type="number" id="pt-beton-ep" value="12" min="5" max="30" oninput="Calc.compute()">
              <span class="calc-unit">cm</span>
            </div>
          </div>
          <div class="calc-input-group">
            <label>Dosage ciment</label>
            <div class="calc-input-wrap">
              <input type="number" id="pt-beton-dosage" value="350" min="200" max="450" oninput="Calc.compute()">
              <span class="calc-unit">kg/m³</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">💧 Résine drainante</div>
          <label class="calc-check"><input type="checkbox" id="pt-resine" onchange="Calc.compute()"><span>Inclure résine drainante</span></label>
          <div class="calc-input-group">
            <label>Épaisseur (cm)</label>
            <div class="calc-input-wrap">
              <input type="number" id="pt-resine-ep" value="5" min="3" max="15" oninput="Calc.compute()">
              <span class="calc-unit">cm</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">🌱 Mélange terre/sable</div>
          <label class="calc-check"><input type="checkbox" id="pt-melange" onchange="Calc.compute()"><span>Inclure mélange terre/sable</span></label>
          <div class="calc-input-group">
            <label>Ratio sable (%)</label>
            <div class="calc-input-wrap">
              <input type="number" id="pt-melange-ratio" value="30" min="0" max="100" oninput="Calc.compute()">
              <span class="calc-unit">%</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">💰 Marges</div>
          <div class="calc-input-group">
            <label>Marge mat.</label>
            <div class="calc-input-wrap">
              <input type="number" id="pt-marge-mat" value="30" min="0" max="100" oninput="Calc.compute()">
              <span class="calc-unit">%</span>
            </div>
          </div>
          <div class="calc-input-group">
            <label>Marge MO</label>
            <div class="calc-input-wrap">
              <input type="number" id="pt-marge-mo" value="20" min="0" max="100" oninput="Calc.compute()">
              <span class="calc-unit">%</span>
            </div>
          </div>
        </div>

        <!-- ── TAB PAYSAGISME — VÉGÉTAL ── -->
        <div id="tab-pay-vegetal" class="calc-form">
          <div class="calc-section-title">📐 Surface totale (m²)</div>
          <div class="calc-input-group">
            <label>Surface</label>
            <div class="calc-input-wrap">
              <input type="number" id="pv-surface" value="100" min="1" step="1" oninput="Calc.compute()">
              <span class="calc-unit">m²</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">🌱 Gazon</div>
          <label class="calc-check"><input type="checkbox" id="pv-gazon" onchange="Calc.compute()"><span>Inclure gazon</span></label>
          <label class="calc-radio"><input type="radio" name="pv-gazon-type" value="rouleau" checked onchange="Calc.compute()"><span>Rouleau (posé au m²)</span></label>
          <label class="calc-radio"><input type="radio" name="pv-gazon-type" value="semis" onchange="Calc.compute()"><span>Semis (g/m²)</span></label>
          <div class="calc-input-group">
            <label>Grammage semis</label>
            <div class="calc-input-wrap">
              <input type="number" id="pv-gazon-semis" value="35" min="20" max="60" oninput="Calc.compute()">
              <span class="calc-unit">g/m²</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">🌳 Plantation</div>
          <label class="calc-check"><input type="checkbox" id="pv-plantation" onchange="Calc.compute()"><span>Inclure plantation</span></label>
          <div class="calc-input-group">
            <label>Nombre de plants</label>
            <div class="calc-input-wrap">
              <input type="number" id="pv-nb-plants" value="20" min="1" oninput="Calc.compute()">
              <span class="calc-unit">plants</span>
            </div>
          </div>
          <div class="calc-input-group">
            <label>Prix / plant HT</label>
            <div class="calc-input-wrap">
              <input type="number" id="pv-prix-plant" value="15" min="1" step="0.5" oninput="Calc.compute()">
              <span class="calc-unit">€</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">🍂 Paillage</div>
          <label class="calc-check"><input type="checkbox" id="pv-paillage" onchange="Calc.compute()"><span>Inclure paillage</span></label>
          <div class="calc-input-group">
            <label>Épaisseur</label>
            <div class="calc-input-wrap">
              <input type="number" id="pv-paillage-ep" value="8" min="3" max="20" oninput="Calc.compute()">
              <span class="calc-unit">cm</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">💰 Marges</div>
          <div class="calc-input-group">
            <label>Marge mat.</label>
            <div class="calc-input-wrap">
              <input type="number" id="pv-marge-mat" value="30" min="0" max="100" oninput="Calc.compute()">
              <span class="calc-unit">%</span>
            </div>
          </div>
          <div class="calc-input-group">
            <label>Marge MO</label>
            <div class="calc-input-wrap">
              <input type="number" id="pv-marge-mo" value="20" min="0" max="100" oninput="Calc.compute()">
              <span class="calc-unit">%</span>
            </div>
          </div>
        </div>

        <!-- ── TAB PAYSAGISME — MAIN D'ŒUVRE ── -->
        <div id="tab-pay-mo" class="calc-form">
          <div class="calc-section-title">👷 Équipe salariée</div>
          <div class="calc-input-group">
            <label>Nb salariés</label>
            <div class="calc-input-wrap">
              <input type="number" id="pm-nb-salaries" value="4" min="1" max="10" oninput="Calc.compute()">
              <span class="calc-unit">pers.</span>
            </div>
          </div>
          <div class="calc-input-group">
            <label>Heures / salarié</label>
            <div class="calc-input-wrap">
              <input type="number" id="pm-h-salarie" value="8" min="1" max="12" oninput="Calc.compute()">
              <span class="calc-unit">h</span>
            </div>
          </div>
          <div class="calc-input-group">
            <label>Taux horaire chargé</label>
            <div class="calc-input-wrap">
              <input type="number" id="pm-taux-salarie" value="35" min="15" max="100" step="0.5" oninput="Calc.compute()">
              <span class="calc-unit">€/h</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">🚜 Mini-pelle</div>
          <label class="calc-check"><input type="checkbox" id="pm-minipelle" onchange="Calc.compute()"><span>Inclure mini-pelle</span></label>
          <div class="calc-input-group">
            <label>Heures mini-pelle</label>
            <div class="calc-input-wrap">
              <input type="number" id="pm-h-pelle" value="4" min="0.5" step="0.5" oninput="Calc.compute()">
              <span class="calc-unit">h</span>
            </div>
          </div>
          <div class="calc-input-group">
            <label>Coût horaire pelle</label>
            <div class="calc-input-wrap">
              <input type="number" id="pm-cout-pelle" value="90" min="30" max="300" oninput="Calc.compute()">
              <span class="calc-unit">€/h</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">🤝 Sous-traitants</div>
          <label class="calc-check"><input type="checkbox" id="pm-st1" onchange="Calc.compute()"><span>Marbrier / Ardoise</span></label>
          <div class="calc-input-group">
            <label>Forfait marbrier HT</label>
            <div class="calc-input-wrap">
              <input type="number" id="pm-forfait-st1" value="1500" min="0" step="100" oninput="Calc.compute()">
              <span class="calc-unit">€</span>
            </div>
          </div>
          <label class="calc-check"><input type="checkbox" id="pm-st2" onchange="Calc.compute()"><span>Électricien extérieur</span></label>
          <div class="calc-input-group">
            <label>Forfait électricien HT</label>
            <div class="calc-input-wrap">
              <input type="number" id="pm-forfait-st2" value="800" min="0" step="100" oninput="Calc.compute()">
              <span class="calc-unit">€</span>
            </div>
          </div>
          <label class="calc-check"><input type="checkbox" id="pm-st3" onchange="Calc.compute()"><span>Plombier extérieur</span></label>
          <div class="calc-input-group">
            <label>Forfait plombier HT</label>
            <div class="calc-input-wrap">
              <input type="number" id="pm-forfait-st3" value="600" min="0" step="100" oninput="Calc.compute()">
              <span class="calc-unit">€</span>
            </div>
          </div>
          <div class="calc-section-title mt-16">💰 Marge MO</div>
          <div class="calc-input-group">
            <label>Marge MO</label>
            <div class="calc-input-wrap">
              <input type="number" id="pm-marge-mo" value="20" min="0" max="100" oninput="Calc.compute()">
              <span class="calc-unit">%</span>
            </div>
          </div>
        </div>

      </div><!-- /calc-panel -->

      <!-- ── PANNEAU RÉSULTATS ──────────────────────────── -->
      <div class="calc-results" id="calc-results">
        <div class="calc-results-header">
          <span class="calc-results-title">📋 Résultats</span>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-secondary" onclick="Calc.copier()">📋 Copier</button>
            <button class="btn btn-sm btn-primary" onclick="Calc.sauvegarderDevis()">💾 Créer devis</button>
          </div>
        </div>
        <div style="margin-bottom:16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);padding-bottom:6px;border-bottom:1px solid var(--border);margin-bottom:10px">🧠 Assistant qualité & conformité</div>
          <div id="calc-alertes-regles" style="font-size:12px"></div>
        </div>
        <div id="calc-results-body">
          <!-- Rempli dynamiquement -->
          <div class="calc-empty">
            <div style="font-size:36px;margin-bottom:12px;opacity:.4">⚡</div>
            <div style="color:var(--text-tertiary);font-size:14px">Modifiez les paramètres pour voir les résultats</div>
          </div>
        </div>
      </div>

    </div><!-- /calc-grid -->

    <!-- ── Ratios professionnels affichés ────────────────── -->
    <div class="card mt-16">
      <div class="card-header">
        <span class="card-title">📊 Ratios professionnels utilisés</span>
        <button class="btn btn-ghost btn-sm" onclick="Pages.editRatios()">✏️ Modifier</button>
      </div>
      <div class="card-body">
        <div class="ratios-grid" id="ratios-display"></div>
      </div>
    </div>

  `;

  // CSS inline spécifique au calculateur
  if (!document.getElementById('calc-styles')) {
    const style = document.createElement('style');
    style.id = 'calc-styles';
    style.textContent = `
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
        top: -50%;
        right: -10%;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(79,142,247,0.15), transparent 70%);
        pointer-events: none;
      }
      .calc-hero-inner { display: flex; align-items: center; gap: 16px; }
      .calc-hero-icon { font-size: 40px; }
      .calc-hero-title { font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
      .calc-hero-sub { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }

      .calc-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        align-items: start;
        min-height: 0;
      }

      @media (min-width: 1400px) {
        .calc-grid {
          grid-template-columns: 1fr 1fr;
        }
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

      /* RÉSULTATS */
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

      #calc-results-body { padding: 16px; }

      .calc-empty { text-align: center; padding: 40px 20px; }

      /* Ligne de résultat matériau */
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

      /* Séparateur de section */
      .res-section {
        font-size: 11px; font-weight: 700;
        color: var(--text-tertiary); text-transform: uppercase;
        letter-spacing: 0.08em; padding: 14px 4px 6px;
        border-bottom: 1px solid var(--glass-border);
        margin-bottom: 8px;
      }

      /* Récap financier */
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

      /* Ratios grid */
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

      .mp-corps-btn {
        padding: 4px 10px; border-radius: var(--r-sm); font-size: 11px; font-weight: 600;
        background: var(--glass-bg); border: 1px solid var(--glass-border);
        color: var(--text-secondary); cursor: pointer; transition: all .15s; font-family: var(--font);
      }
      .mp-corps-btn:hover { border-color: var(--glass-border-md); color: var(--text-primary); }
      .mp-corps-btn.active { background: rgba(79,142,247,0.12); border-color: rgba(79,142,247,0.4); color: var(--accent); }
    `;
    document.head.appendChild(style);
  }

  // Initialiser après rendu
  setTimeout(() => {
    Calc.init();
    Calc.renderRatios();
  }, 50);

  return div;
};

// ============================================================
//  MOTEUR DE CALCUL EXPRESS
// ============================================================
const Calc = {

  currentTab: 'cloison',

  switchTab(tab, btn) {
    if (tab === 'pay-terrain' && typeof PolygoneMetrage !== 'undefined') {
      setTimeout(() => PolygoneMetrage.init('polygone-container', {
        onSurface: (s) => { Calc._surfacePoly = s; if (Calc.currentTab === 'pay-terrain') Calc.compute(); }
      }), 50);
    }
    this.currentTab = tab;
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-form').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    const form = document.getElementById('tab-' + tab);
    if (form) form.classList.add('active');
    this.compute();
  },

  init() {
    this.compute();
  },

  v(id, def = 0) {
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

  r(key) { return DB.getRatio(key) || 0; },

  fmt(n) { return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0); },
  fmtN(n, d = 1) { return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n || 0); },

  // Prix unitaires depuis DB
  prix(ref) { return DB.getPrixByRef(ref) || this.prixDefaut(ref); },

  prixDefaut(ref) {
    const defaults = {
      'PARF48': 1.65, 'PARF70': 2.10, 'PARF98': 2.80,
      'PAMON48': 2.45, 'PAMON70': 3.20, 'PAMON98': 4.10,
      'BA13S': 8.50, 'BA13H': 11.20,
      'VIS_TF35': 6.90, 'BANDE_PLA': 4.20, 'ENDUIT_F': 18.50,
      'LV45': 3.80, 'LV100': 5.60, 'LR50': 6.40,
      'RONDRON': 8.20, 'SUSPVIS': 0.85, 'OSSOSS': 3.80, 'CORNIERE': 1.90,
      'DULUX_BM15': 2.80, 'PLC_BMAT': 2.20, 'APPR_GYP': 3.20,
    };
    return defaults[ref] || 0;
  },

  tauxMO() { return this.r('TAUX_HORAIRE_MO') || 35; },

  // ── Calcul principal ───────────────────────────────────────
  compute() {
    const tab = this.currentTab;
    let result;

    if (tab === 'cloison')       result = this.calcCloison();
    else if (tab === 'doublage')   result = this.calcDoublage();
    else if (tab === 'plafond')    result = this.calcPlafond();
    else if (tab === 'peinture')   result = this.calcPeinture();
    else if (tab === 'complet')    result = this.calcComplet();
    else if (tab === 'multipacks')  result = this.calcMultiPacks();
    else if (tab === 'pay-terrain') result = this.calcPayTerrain();
    else if (tab === 'pay-vegetal') result = this.calcPayVegetal();
    else if (tab === 'pay-mo')      result = this.calcPayMO();

    if (result) this.renderResults(result);
  },

  // ── Calcul CLOISON ────────────────────────────────────────
  calcCloison() {
    const longueur = this.v('cl-longueur', 10);
    const hauteur  = this.v('cl-hauteur', 2.60);
    const type     = this.radio('cl-type') || '48';
    const avecIso  = this.checked('cl-iso');
    const doublePlaq = this.checked('cl-double');
    const avecJoint  = this.checked('cl-joint');
    const margeMat = this.v('cl-marge-mat', 30) / 100;
    const margeMO  = this.v('cl-marge-mo', 20) / 100;

    const surface = longueur * hauteur;
    const coeff   = doublePlaq ? 2 : 1;

    // Rails (sol + plafond)
    const railsML  = longueur * 2;
    const railRef  = `PARF${type}`;
    const pRail    = this.prix(railRef);

    // Montants
    const montants = Math.ceil(longueur * 1.67) + 1;
    const montRef  = `PAMON${type}`;
    const pMont    = this.prix(montRef);

    // Plaques (2 faces × coeff)
    const plaques  = Math.ceil(surface / 2.7 * 2 * coeff * 1.10) + 2;
    const pPlaq    = this.prix('BA13S');

    // Vis
    const vis      = Math.ceil(plaques * 25 / 500);  // boites de 500
    const pVis     = this.prix('VIS_TF35');

    // Isolation
    let isoM2 = 0, pIso = 0;
    if (avecIso) { isoM2 = surface * 1.05; pIso = this.prix('LV45'); }

    // MO cloison
    const hMO      = surface * 0.5 * coeff;

    // Jointage
    let bandesML = 0, enduitKg = 0, hJoint = 0;
    let pBande = 0, pEnduit = 0;
    if (avecJoint) {
      bandesML  = surface * 1.1 * coeff;
      enduitKg  = surface * 0.35 * coeff;
      hJoint    = surface * 0.2 * coeff;
      pBande    = this.prix('BANDE_PLA');
      pEnduit   = this.prix('ENDUIT_F') / 25;
    }

    const coutMat = (railsML * pRail) + (montants * pMont) + (plaques * pPlaq) +
                    (vis * pVis) + (isoM2 * pIso) + (bandesML * pBande) + (enduitKg * pEnduit);
    const coutMO  = (hMO + hJoint) * this.tauxMO();

    const materiaux = [
      { icon: '🔩', nom: `Rails ${railRef}`, ref: railRef, qte: this.fmtN(railsML) + ' ml', prix: railsML * pRail },
      { icon: '📏', nom: `Montants ${montRef}`, ref: montRef, qte: montants + ' u', prix: montants * pMont },
      { icon: '🟫', nom: 'Plaques BA13 Standard', ref: 'BA13S', qte: plaques + ' u', prix: plaques * pPlaq },
      { icon: '🔧', nom: 'Vis TF 3.5×35 (boites)', ref: 'VIS_TF35', qte: vis + ' boites', prix: vis * pVis },
    ];

    if (avecIso) materiaux.push({ icon: '🌀', nom: 'Laine de verre 45mm', ref: 'LV45', qte: this.fmtN(isoM2) + ' m²', prix: isoM2 * pIso });

    const sections = [{ titre: `Cloison M${type} — ${this.fmtN(longueur)} ml × ${this.fmtN(hauteur)} m (${this.fmtN(surface)} m²)`, items: materiaux }];

    if (avecJoint) {
      sections.push({ titre: 'Jointage', items: [
        { icon: '📜', nom: 'Bandes à plâtre 50mm', ref: 'BANDE_PLA', qte: this.fmtN(bandesML) + ' ml', prix: bandesML * pBande },
        { icon: '🪣', nom: 'Enduit de finition Toupret', ref: 'ENDUIT_F', qte: this.fmtN(enduitKg) + ' kg', prix: enduitKg * pEnduit },
      ]});
    }

    return { sections, coutMat, coutMO, margeMat, margeMO, surface, hMO: hMO + hJoint };
  },

  // ── Calcul DOUBLAGE ───────────────────────────────────────
  calcDoublage() {
    const surface  = this.v('db-surface', 30);
    const margeMat = this.v('db-marge-mat', 30) / 100;
    const margeMO  = this.v('db-marge-mo', 20) / 100;
    const isoType  = this.radio('db-iso') || '45';

    const plaques  = Math.ceil(surface / 2.7 * 1.10) + 1;
    const pPlaq    = this.prix('BA13S');
    const vis      = Math.ceil(plaques * 20 / 500);
    const pVis     = this.prix('VIS_TF35');

    let isoRef, pIso;
    if (isoType === 'lr50') { isoRef = 'LR50'; pIso = this.prix('LR50'); }
    else if (isoType === '100') { isoRef = 'LV100'; pIso = this.prix('LV100'); }
    else { isoRef = 'LV45'; pIso = this.prix('LV45'); }

    const isoM2    = surface * 1.05;
    const bandesML = surface * 1.1;
    const enduitKg = surface * 0.35;
    const pBande   = this.prix('BANDE_PLA');
    const pEnduit  = this.prix('ENDUIT_F') / 25;
    const hMO      = surface * 0.45;
    const hJoint   = surface * 0.2;

    const coutMat  = (plaques * pPlaq) + (vis * pVis) + (isoM2 * pIso) + (bandesML * pBande) + (enduitKg * pEnduit);
    const coutMO   = (hMO + hJoint) * this.tauxMO();

    const sections = [{
      titre: `Doublage — ${this.fmtN(surface)} m²`,
      items: [
        { icon: '🌀', nom: `Isolation ${isoRef}`, ref: isoRef, qte: this.fmtN(isoM2) + ' m²', prix: isoM2 * pIso },
        { icon: '🟫', nom: 'Plaques BA13 Standard', ref: 'BA13S', qte: plaques + ' u', prix: plaques * pPlaq },
        { icon: '🔧', nom: 'Vis (boites)', ref: 'VIS_TF35', qte: vis + ' boites', prix: vis * pVis },
        { icon: '📜', nom: 'Bandes à plâtre', ref: 'BANDE_PLA', qte: this.fmtN(bandesML) + ' ml', prix: bandesML * pBande },
        { icon: '🪣', nom: 'Enduit de finition', ref: 'ENDUIT_F', qte: this.fmtN(enduitKg) + ' kg', prix: enduitKg * pEnduit },
      ]
    }];

    return { sections, coutMat, coutMO, margeMat, margeMO, surface, hMO: hMO + hJoint };
  },

  // ── Calcul PLAFOND ────────────────────────────────────────
  calcPlafond() {
    const longueur = this.v('pf-longueur', 6);
    const largeur  = this.v('pf-largeur', 4);
    const typePF   = this.radio('pf-type') || 'suspendu';
    const avecIso  = this.checked('pf-iso');
    const margeMat = this.v('pf-marge-mat', 30) / 100;
    const margeMO  = this.v('pf-marge-mo', 20) / 100;

    const surface  = longueur * largeur;
    const perim    = 2 * (longueur + largeur);

    const plaques  = Math.ceil(surface / 2.7 * 1.10) + 1;
    const pPlaq    = this.prix('BA13S');
    const bandesML = surface * 1.1;
    const enduitKg = surface * 0.35;
    const pBande   = this.prix('BANDE_PLA');
    const pEnduit  = this.prix('ENDUIT_F') / 25;
    const vis      = Math.ceil(plaques * 20 / 500);
    const pVis     = this.prix('VIS_TF35');

    let items = [
      { icon: '🟫', nom: 'Plaques BA13 Standard', ref: 'BA13S', qte: plaques + ' u', prix: plaques * pPlaq },
      { icon: '🔧', nom: 'Vis (boites)', ref: 'VIS_TF35', qte: vis + ' boites', prix: vis * pVis },
      { icon: '📜', nom: 'Bandes à plâtre', ref: 'BANDE_PLA', qte: this.fmtN(bandesML) + ' ml', prix: bandesML * pBande },
      { icon: '🪣', nom: 'Enduit de finition', ref: 'ENDUIT_F', qte: this.fmtN(enduitKg) + ' kg', prix: enduitKg * pEnduit },
    ];

    let ossaturePrix = 0;
    if (typePF === 'suspendu') {
      const ossML    = surface / 0.6 * 3.75;
      const secML    = surface / 0.9 * 3;
      const suspentes = Math.ceil(surface / (0.9 * 0.9));
      const corML    = perim;
      const pOss     = this.prix('OSSOSS');
      const pCorn    = this.prix('CORNIERE');
      const pSusp    = this.prix('SUSPVIS');
      ossaturePrix   = (ossML * pOss) + (secML * 2.60) + (suspentes * pSusp) + (corML * pCorn);
      items = [
        { icon: '⚙️', nom: 'Ossature F530 principale', ref: 'OSSOSS', qte: this.fmtN(ossML) + ' ml', prix: ossML * pOss },
        { icon: '📐', nom: 'Ossature F47 secondaire', ref: 'OSSF47', qte: this.fmtN(secML) + ' ml', prix: secML * 2.60 },
        { icon: '🔗', nom: 'Suspentes à fourche', ref: 'SUSPVIS', qte: suspentes + ' u', prix: suspentes * pSusp },
        { icon: '📏', nom: 'Cornière périmétrique', ref: 'CORNIERE', qte: this.fmtN(corML) + ' ml', prix: corML * pCorn },
        ...items
      ];
    }

    if (avecIso) {
      const isoM2 = surface * 1.05;
      const pIso  = this.prix('LV100');
      items.push({ icon: '🌀', nom: 'Laine de verre 100mm', ref: 'LV100', qte: this.fmtN(isoM2) + ' m²', prix: isoM2 * pIso });
    }

    const coutMat = items.reduce((s, i) => s + (i.prix || 0), 0);
    const hMO     = surface * (typePF === 'suspendu' ? 0.7 : 0.4) + surface * 0.2;
    const coutMO  = hMO * this.tauxMO();

    return {
      sections: [{ titre: `Plafond ${typePF} — ${this.fmtN(surface)} m² (${longueur}×${largeur}m)`, items }],
      coutMat, coutMO, margeMat, margeMO, surface, hMO
    };
  },

  // ── Calcul PEINTURE ───────────────────────────────────────
  calcPeinture() {
    const surfMurs    = this.v('pe-murs', 50);
    const surfPlafond = this.v('pe-plafond', 20);
    const nbCouches   = this.v('pe-couches', 2);
    const rendement   = this.v('pe-rendement', 10);
    const avecAppret  = this.checked('pe-appret');
    const avecBois    = this.checked('pe-boiseries');
    const margeMat    = this.v('pe-marge-mat', 30) / 100;
    const margeMO     = this.v('pe-marge-mo', 20) / 100;

    const coeffBois = avecBois ? 1.15 : 1;
    const surfTot   = (surfMurs + surfPlafond) * coeffBois;

    const litresPeinture = (surfTot * nbCouches) / rendement;
    const pPeinture = this.prix('DULUX_BM15');

    let litresAppret = 0, pAppret = 0;
    if (avecAppret) {
      litresAppret = surfTot / (rendement * 1.2);
      pAppret      = this.prix('APPR_GYP');
    }

    const hMO    = surfTot * 0.18 * nbCouches + (avecAppret ? surfTot * 0.12 : 0);
    const coutMat = (litresPeinture * pPeinture) + (litresAppret * pAppret);
    const coutMO  = hMO * this.tauxMO();

    const items = [
      { icon: '🎨', nom: 'Peinture murs/plafond', ref: 'DULUX_BM15', qte: this.fmtN(litresPeinture) + ' L', prix: litresPeinture * pPeinture },
    ];
    if (avecAppret) items.push({ icon: '🫙', nom: 'Apprêt Gyproc', ref: 'APPR_GYP', qte: this.fmtN(litresAppret) + ' L', prix: litresAppret * pAppret });

    return {
      sections: [{ titre: `Peinture — Murs ${this.fmtN(surfMurs)} m² + Plafond ${this.fmtN(surfPlafond)} m² × ${nbCouches} couches`, items }],
      coutMat, coutMO, margeMat, margeMO, surface: surfTot, hMO
    };
  },

  // ── Calcul CHANTIER COMPLET ───────────────────────────────
  calcComplet() {
    const long     = this.v('cp-long', 6);
    const larg     = this.v('cp-larg', 4);
    const haut     = this.v('cp-haut', 2.60);
    const mlClois  = this.v('cp-cloisons', 8);
    const margeMat = this.v('cp-marge-mat', 30) / 100;
    const margeMO  = this.v('cp-marge-mo', 20) / 100;

    const perim    = 2 * (long + larg);
    const surfMurs = perim * haut;
    const surfPlaf = long * larg;
    const surfClois = mlClois * haut;

    const sections = [];
    let totalMat = 0, totalMO = 0;

    // CLOISONS
    if (this.checked('cp-cloison') && mlClois > 0) {
      const rails   = mlClois * 2;
      const monts   = Math.ceil(mlClois * 1.67) + 1;
      const plaqs   = Math.ceil(surfClois / 2.7 * 2 * 1.10) + 2;
      const vis_b   = Math.ceil(plaqs * 25 / 500);
      const matCl   = rails * this.prix('PARF48') + monts * this.prix('PAMON48') + plaqs * this.prix('BA13S') + vis_b * this.prix('VIS_TF35');
      const moCl    = surfClois * 0.5 * this.tauxMO();
      totalMat += matCl; totalMO += moCl;
      sections.push({ titre: `🧱 Cloisons M48 — ${mlClois} ml`, items: [
        { icon: '🔩', nom: 'Rails PARF48', qte: this.fmtN(rails) + ' ml', prix: rails * this.prix('PARF48') },
        { icon: '📏', nom: 'Montants PAMON48', qte: monts + ' u', prix: monts * this.prix('PAMON48') },
        { icon: '🟫', nom: 'Plaques BA13', qte: plaqs + ' u', prix: plaqs * this.prix('BA13S') },
        { icon: '🔧', nom: 'Vis (boites)', qte: vis_b + ' boites', prix: vis_b * this.prix('VIS_TF35') },
      ]});
    }

    // ISOLATION
    if (this.checked('cp-iso')) {
      const isoM2 = surfClois * 1.05;
      const mat   = isoM2 * this.prix('LV45');
      const mo    = surfClois * 0.15 * this.tauxMO();
      totalMat += mat; totalMO += mo;
      sections.push({ titre: '🌀 Isolation LV 45mm', items: [
        { icon: '🌀', nom: 'Laine de verre Isover 45mm', qte: this.fmtN(isoM2) + ' m²', prix: mat },
      ]});
    }

    // PLAFOND
    if (this.checked('cp-plafond')) {
      const ossML = surfPlaf / 0.6 * 3.75;
      const susp  = Math.ceil(surfPlaf / 0.81);
      const plaqs = Math.ceil(surfPlaf / 2.7 * 1.10);
      const mat   = ossML * this.prix('OSSOSS') + susp * this.prix('SUSPVIS') + plaqs * this.prix('BA13S');
      const mo    = surfPlaf * 0.7 * this.tauxMO();
      totalMat += mat; totalMO += mo;
      sections.push({ titre: `⬆ Plafond suspendu — ${this.fmtN(surfPlaf)} m²`, items: [
        { icon: '⚙️', nom: 'Ossature F530', qte: this.fmtN(ossML) + ' ml', prix: ossML * this.prix('OSSOSS') },
        { icon: '🔗', nom: 'Suspentes', qte: susp + ' u', prix: susp * this.prix('SUSPVIS') },
        { icon: '🟫', nom: 'Plaques BA13', qte: plaqs + ' u', prix: plaqs * this.prix('BA13S') },
      ]});
    }

    // JOINTAGE
    if (this.checked('cp-joint')) {
      const surf  = (this.checked('cp-cloison') ? surfClois * 2 : 0) + (this.checked('cp-plafond') ? surfPlaf : 0);
      const band  = surf * 1.1;
      const end   = surf * 0.35;
      const mat   = band * this.prix('BANDE_PLA') + end * (this.prix('ENDUIT_F') / 25);
      const mo    = surf * 0.2 * this.tauxMO();
      if (surf > 0) {
        totalMat += mat; totalMO += mo;
        sections.push({ titre: `🖌 Jointage Q2 — ${this.fmtN(surf)} m²`, items: [
          { icon: '📜', nom: 'Bandes à plâtre 50mm', qte: this.fmtN(band) + ' ml', prix: band * this.prix('BANDE_PLA') },
          { icon: '🪣', nom: 'Enduit de finition Toupret', qte: this.fmtN(end) + ' kg', prix: end * (this.prix('ENDUIT_F') / 25) },
        ]});
      }
    }

    // PEINTURE MURS
    if (this.checked('cp-peinture')) {
      const litres = surfMurs * 2 / 10;
      const mat    = litres * this.prix('DULUX_BM15');
      const mo     = surfMurs * 0.18 * 2 * this.tauxMO();
      totalMat += mat; totalMO += mo;
      sections.push({ titre: `🎨 Peinture murs — ${this.fmtN(surfMurs)} m²`, items: [
        { icon: '🎨', nom: 'Peinture murs (2 couches)', qte: this.fmtN(litres) + ' L', prix: mat },
      ]});
    }

    // PEINTURE PLAFOND
    if (this.checked('cp-peinture-plaf')) {
      const litres = surfPlaf * 2 / 13;
      const mat    = litres * this.prix('PLC_BMAT');
      const mo     = surfPlaf * 0.18 * 2 * this.tauxMO();
      totalMat += mat; totalMO += mo;
      sections.push({ titre: `☁️ Peinture plafond — ${this.fmtN(surfPlaf)} m²`, items: [
        { icon: '🎨', nom: 'Peinture plafond blanc mat', qte: this.fmtN(litres) + ' L', prix: mat },
      ]});
    }

    return { sections, coutMat: totalMat, coutMO: totalMO, margeMat, margeMO, surface: surfMurs + surfPlaf };
  },

  // ── Calcul MULTI-PACKS ────────────────────────────────────
  calcMultiPacks() {
    const margeMat = this.v('mp-marge-mat', 30) / 100;
    const margeMO  = this.v('mp-marge-mo', 20) / 100;
    const sections = [];
    let totalMat = 0, totalMO = 0;

    // Cloisons
    if (this.checked('mp-cloison')) {
      const lon = this.v('mp-cl-long', 10);
      const h   = this.v('mp-cl-h', 2.60);
      const surf = lon * h;
      const rails   = lon * 2;
      const montants = Math.ceil(lon * 1.67) + 1;
      const plaques  = Math.ceil(surf / 2.7 * 2 * 1.10) + 2;
      const mat = rails * this.prix('PARF48') + montants * this.prix('PAMON48') + plaques * this.prix('BA13S');
      const mo  = surf * 0.5 * this.tauxMO();
      totalMat += mat; totalMO += mo;
      sections.push({ titre: `🧱 Cloisons M48 — ${this.fmtN(lon)} ml × ${this.fmtN(h)} m`, items: [
        { icon:'🧱', nom:'Rails + Montants + Plaques BA13', qte: this.fmtN(plaques)+' plaques', prix: mat },
        { icon:'👷', nom:'MO pose cloisons', qte: this.fmtN(surf*0.5,1)+' h', prix: mo },
      ]});
    }

    // Électricité
    if (this.checked('mp-elec')) {
      const prises   = this.v('mp-el-prises', 8);
      const lumieres = this.v('mp-el-lumiere', 4);
      const mlCable  = (prises * 4 + lumieres * 3);
      const mat = mlCable * this.prix('CAB_25') + prises * this.prix('PRISE2PT') + lumieres * this.prix('INTER_S');
      const mo  = (prises * 0.75 + lumieres * 0.5) * this.tauxMO();
      totalMat += mat; totalMO += mo;
      sections.push({ titre: `⚡ Électricité — ${prises} prises, ${lumieres} points lumière`, items: [
        { icon:'⚡', nom:'Câbles + prises + interrupteurs', qte: this.fmtN(mlCable,0)+' ml câble', prix: mat },
        { icon:'👷', nom:'MO câblage', qte: this.fmtN(prises*0.75+lumieres*0.5,1)+' h', prix: mo },
      ]});
    }

    // Carrelage
    if (this.checked('mp-carrelage')) {
      const surf  = this.v('mp-ca-sol', 20);
      const prixM2 = this.v('mp-ca-prix', 25);
      const colle  = Math.ceil(surf / 4);
      const joints = Math.ceil(surf / 5);
      const mat = surf * prixM2 + colle * this.prix('COLLE_FL') + joints * this.prix('JOINT_G');
      const mo  = surf * 1.2 * this.tauxMO();
      totalMat += mat; totalMO += mo;
      sections.push({ titre: `🔲 Carrelage — ${this.fmtN(surf)} m²`, items: [
        { icon:'🔲', nom:'Carrelage + colle + joints', qte: this.fmtN(surf)+' m²', prix: mat },
        { icon:'👷', nom:'MO pose carrelage', qte: this.fmtN(surf*1.2,1)+' h', prix: mo },
      ]});
    }

    // Peinture
    if (this.checked('mp-peinture')) {
      const surf    = this.v('mp-pe-murs', 50);
      const couches = this.v('mp-pe-couches', 2);
      const litres  = surf * couches / 10;
      const mat     = litres * this.prix('DULUX_BM15');
      const mo      = surf * 0.18 * couches * this.tauxMO();
      totalMat += mat; totalMO += mo;
      sections.push({ titre: `🎨 Peinture — ${this.fmtN(surf)} m² (${couches} couches)`, items: [
        { icon:'🎨', nom:'Peinture murs', qte: this.fmtN(litres,1)+' L', prix: mat },
        { icon:'👷', nom:'MO peinture', qte: this.fmtN(surf*0.18*couches,1)+' h', prix: mo },
      ]});
    }

    // Inclure les lignes manuelles
    if (this._mpLignes && this._mpLignes.length) {
      const byCorp = {};
      this._mpLignes.forEach(l => {
        if (!byCorp[l.corps]) byCorp[l.corps] = { total: 0, items: [] };
        byCorp[l.corps].total += l.total;
        byCorp[l.corps].items.push(l);
      });
      Object.entries(byCorp).forEach(([corps, g]) => {
        totalMat += g.total;
        sections.push({ titre: `📋 ${corps} — Articles libres`, items: g.items.map(l => ({
          icon: '📦', nom: l.desig, qte: `${l.qte} × ${this.fmt(l.pu)} €`, prix: l.total
        }))});
      });
    }

    if (!sections.length) return null;
    return { sections, coutMat: totalMat, coutMO: totalMO, margeMat, margeMO };
  },

  // ── Multi-packs : articles libres ─────────────────────────
  _mpLignes: [],
  _mpCorps: 'Plaquiste',

  selectMpCorps(btn, corps) {
    this._mpCorps = corps;
    document.querySelectorAll('.mp-corps-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  },

  searchProduit(q) {
    const drop = document.getElementById('mp-search-drop');
    if (!drop) return;
    if (!q || q.length < 2) { drop.style.display = 'none'; return; }
    const catalogue = (typeof ProdMoteur !== 'undefined' && ProdMoteur.PRODUITS)
      ? ProdMoteur.PRODUITS
      : (typeof window.PRODUITS_COMPLET !== 'undefined' ? window.PRODUITS_COMPLET : []);
    const dbProd = (typeof DB !== 'undefined' && DB.produits) ? DB.produits : [];
    const all = [...catalogue, ...dbProd];
    const s = q.toLowerCase();
    const matches = all.filter(p =>
      (p.nom || p.designation || '').toLowerCase().includes(s) ||
      (p.ref || p.reference || '').toLowerCase().includes(s) ||
      (p.sfam || p.fam || p.famille || p.categorie || '').toLowerCase().includes(s)
    ).slice(0, 14);
    if (!matches.length) { drop.style.display = 'none'; return; }
    drop.innerHTML = matches.map(p => {
      const nom   = p.nom || p.designation || '';
      const ref   = p.ref || p.reference || '';
      const prix  = parseFloat(p.prix || p.prixHT || 0);
      const unite = p.unite || 'u';
      const safeNom = nom.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      const safeRef = ref.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return `<div style="padding:8px 12px;cursor:pointer;border-bottom:0.5px solid var(--border);
                font-size:12px;display:flex;justify-content:space-between;align-items:center"
                onmousedown="Calc.selectProduit('${safeRef}','${safeNom}','${unite}',${prix})"
                onmouseover="this.style.background='var(--bg-tertiary)'"
                onmouseout="this.style.background=''"
              >
        <div>
          <span style="font-weight:600">${nom}</span>
          <span style="color:var(--text-tertiary);margin-left:6px;font-size:11px">${ref}</span>
        </div>
        <span style="color:var(--accent);font-family:var(--font-mono)">${prix.toFixed(2)} €/${unite}</span>
      </div>`;
    }).join('');
    drop.style.display = 'block';
  },

  selectProduit(ref, nom, unite, prix) {
    const drop  = document.getElementById('mp-search-drop');
    const desig = document.getElementById('mp-ligne-desig');
    const pu    = document.getElementById('mp-ligne-pu');
    const inp   = document.getElementById('mp-search-produit');
    if (drop)  drop.style.display = 'none';
    if (inp)   inp.value = '';
    if (desig) { desig.value = nom; desig.focus(); }
    if (pu)    pu.value = prix.toFixed(2);
  },

  addMpLigne() {
    const desig = document.getElementById('mp-ligne-desig')?.value.trim();
    const qte   = parseFloat(document.getElementById('mp-ligne-qte')?.value) || 1;
    const pu    = parseFloat(document.getElementById('mp-ligne-pu')?.value)  || 0;
    if (!desig) { typeof App !== 'undefined' && App.toast('Saisissez une désignation', 'error'); return; }
    this._mpLignes.push({ desig, qte, pu, corps: this._mpCorps, total: qte * pu });
    this._renderMpLignes();
    const d = document.getElementById('mp-ligne-desig');
    const q = document.getElementById('mp-ligne-qte');
    const p = document.getElementById('mp-ligne-pu');
    if (d) d.value = ''; if (q) q.value = '1'; if (p) p.value = '0';
    this.compute();
  },

  removeMpLigne(i) {
    this._mpLignes.splice(i, 1);
    this._renderMpLignes();
    this.compute();
  },

  _renderMpLignes() {
    const body  = document.getElementById('mp-lignes-body');
    const table = document.getElementById('mp-lignes-table');
    const stEl  = document.getElementById('mp-sous-totaux');
    if (!body) return;
    if (!this._mpLignes.length) { if (table) table.style.display = 'none'; return; }
    if (table) table.style.display = 'block';

    body.innerHTML = `<table style="width:100%;font-size:12px;border-collapse:collapse">
      <thead><tr style="border-bottom:1px solid var(--border)">
        <th style="padding:5px 8px;text-align:left;color:var(--text-tertiary);font-weight:700;text-transform:uppercase;font-size:10px">Désignation</th>
        <th style="padding:5px 8px;color:var(--text-tertiary);font-weight:700;text-transform:uppercase;font-size:10px">Corps</th>
        <th style="padding:5px 8px;text-align:right;color:var(--text-tertiary);font-weight:700;text-transform:uppercase;font-size:10px">Qté</th>
        <th style="padding:5px 8px;text-align:right;color:var(--text-tertiary);font-weight:700;text-transform:uppercase;font-size:10px">PU HT</th>
        <th style="padding:5px 8px;text-align:right;color:var(--text-tertiary);font-weight:700;text-transform:uppercase;font-size:10px">Total HT</th>
        <th style="width:28px"></th>
      </tr></thead>
      <tbody>
        ${this._mpLignes.map((l, i) => `
        <tr style="border-bottom:0.5px solid var(--border)">
          <td style="padding:5px 8px">${l.desig}</td>
          <td style="padding:5px 8px"><span style="font-size:10px;padding:1px 5px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:4px;color:var(--text-secondary)">${l.corps}</span></td>
          <td style="padding:5px 8px;text-align:right;font-family:var(--font-mono)">${l.qte}</td>
          <td style="padding:5px 8px;text-align:right;font-family:var(--font-mono)">${l.pu.toFixed(2)} €</td>
          <td style="padding:5px 8px;text-align:right;font-family:var(--font-mono);font-weight:700;color:var(--accent)">${l.total.toFixed(2)} €</td>
          <td style="padding:5px 4px"><button style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);font-size:14px;line-height:1" onclick="Calc.removeMpLigne(${i})">✕</button></td>
        </tr>`).join('')}
      </tbody>
    </table>`;

    if (stEl) {
      const byCorp = {};
      this._mpLignes.forEach(l => { byCorp[l.corps] = (byCorp[l.corps] || 0) + l.total; });
      stEl.innerHTML = Object.entries(byCorp).map(([c, t]) =>
        `<div style="padding:4px 10px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:6px;font-size:11px">
          <span style="color:var(--text-secondary)">${c}</span>
          <span style="font-family:var(--font-mono);font-weight:700;color:var(--accent);margin-left:5px">${t.toFixed(2)} €</span>
        </div>`
      ).join('');
    }
  },

  // ── Rendu des résultats ────────────────────────────────────
  renderResults(res) {
    const body = document.getElementById('calc-results-body');
    if (!body) return;

    const { sections, coutMat, coutMO, margeMat, margeMO } = res;
    const totalHT  = coutMat * (1 + margeMat) + coutMO * (1 + margeMO);
    const tva      = DB.getRatio('TVA_TRAVAUX') || 0.10;
    const totalTTC = totalHT * (1 + tva);

    // Stocker pour export
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

    // Récap financier
    html += `
      <div class="res-financier">
        <div class="res-fin-row">
          <span class="res-fin-label">Matériaux HT</span>
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

    // Alertes moteur de règles
    const inputRegles = {
      hauteur: parseFloat(document.getElementById('cl-hauteur')?.value) || 2.6,
      surface: (parseFloat(document.getElementById('cl-longueur')?.value)||0) * (parseFloat(document.getElementById('cl-hauteur')?.value)||0),
      ossature: document.querySelector('input[name="cl-type"]:checked')?.value === '48' ? 'M48' : 'M70',
      isolation: false,
      finition: 'Q3',
    };
    const ctxRegles = ReglesEngine.executer('placo', 'cloison', inputRegles);
    const alertesDiv = document.getElementById('calc-alertes-regles');
    if (alertesDiv) alertesDiv.innerHTML = ReglesEngine.renderAlertes(ctxRegles);
  },

  // ── Affichage des ratios ───────────────────────────────────
  renderRatios() {
    const el = document.getElementById('ratios-display');
    if (!el) return;
    const r = DB.getRatios();
    const affichage = [
      { label: 'Rails / ml cloison', value: r.RAILS_ML_PAR_ML_CLOISON + ' ml', },
      { label: 'Montants / ml', value: r.MONTANTS_PAR_ML + ' u/ml' },
      { label: 'Plaques / m²', value: r.PLAQUES_PAR_M2 + ' u/m²' },
      { label: 'Vis / plaque', value: r.VIS_PAR_PLAQUE + ' u' },
      { label: 'Bandes / m²', value: r.BANDES_PAR_M2_JOINT + ' ml/m²' },
      { label: 'Enduit / m²', value: r.ENDUIT_KG_PAR_M2 + ' kg/m²' },
      { label: 'MO jointage Q2', value: r.HEURES_JOINT_PAR_M2_Q2 + ' h/m²' },
      { label: 'Taux horaire MO', value: r.TAUX_HORAIRE_MO + ' €/h' },
      { label: 'Rendement peinture', value: r.PEINTURE_RENDEMENT_DEFAUT + ' m²/L' },
      { label: 'MO peinture', value: r.HEURES_PEINTURE_PAR_M2 + ' h/m²' },
      { label: 'Coeff. perte plaques', value: r.COEFF_PERTE_PLAQUE },
    ];
    el.innerHTML = affichage.map(r => `
      <div class="ratio-item">
        <span class="ratio-label">${r.label}</span>
        <span class="ratio-value">${r.value}</span>
      </div>
    `).join('');
  },

  // ── Copier le résultat ────────────────────────────────────
  copier() {
    if (!this._lastResult) return;
    const r = this._lastResult;
    let text = 'ESTIMATION PLAQPRO\n';
    text += '='.repeat(40) + '\n';
    r.sections.forEach(s => {
      text += `\n${s.titre}\n`;
      s.items.forEach(i => { text += `  ${i.nom}: ${i.qte} — ${this.fmt(i.prix)} €\n`; });
    });
    text += '\n' + '─'.repeat(40) + '\n';
    text += `Matériaux HT : ${this.fmt(r.coutMat)} €\n`;
    text += `Main d'œuvre HT : ${this.fmt(r.coutMO)} €\n`;
    text += `TOTAL TTC : ${this.fmt(r.totalTTC)} €\n`;
    navigator.clipboard.writeText(text).then(() => App.toast('Résultat copié !'));
  },

  // ── Créer un devis depuis le résultat → lance le wizard ──
  sauvegarderDevis() {
    if (!this._lastResult) { App.toast('Aucun résultat à enregistrer', 'error'); return; }
    DevisWizard.show(this._lastResult);
  },
};

// ============================================================
//  DEVIS WIZARD — Flux Calcul Express → Devis Complet
// ============================================================
var DevisWizard = {

  _state: {},

  // ── Point d'entrée ────────────────────────────────────────
  show(result) {
    this._state = {
      step: 1,
      result,
      clientId:    null,
      chantierId:  null,
      typeChantier: 'interieur',
      corpsAdditionnels: [],
      margeGlobal: result.margeMat ? Math.round(result.margeMat * 100) : 30,
      tvaRate:     10,
      sauvegarderMetres: false,
      _newClientData:   null,
      _newChantierData: null,
    };
    this._injectStyles();
    this._renderOverlay();
  },

  // ── Overlay principal ─────────────────────────────────────
  _renderOverlay() {
    let ov = document.getElementById('dw-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'dw-overlay';
      ov.style.cssText = 'position:fixed;inset:0;z-index:19000;display:flex;align-items:center;justify-content:center;background:rgba(8,10,18,0.88);backdrop-filter:blur(6px)';
      document.body.appendChild(ov);
    }
    ov.innerHTML = `
      <div id="dw-modal" style="background:var(--bg-primary);border:1px solid rgba(79,142,247,0.2);border-radius:20px;width:min(700px,96vw);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.7)">
        <!-- Header -->
        <div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px;flex-shrink:0">
          <div style="flex:1">
            <div style="font-size:17px;font-weight:900;color:var(--text-primary)">💾 Créer un devis</div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">Calcul Express → Devis Complet</div>
          </div>
          <button onclick="DevisWizard.close()" style="background:transparent;border:none;color:var(--text-tertiary);font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color .2s" onmouseenter="this.style.color='var(--text-primary)'" onmouseleave="this.style.color='var(--text-tertiary)'">✕</button>
        </div>
        <!-- Progress bar -->
        ${this._buildProgress()}
        <!-- Body -->
        <div id="dw-body" style="flex:1;overflow-y:auto;padding:24px"></div>
        <!-- Footer -->
        <div id="dw-footer" style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;flex-wrap:wrap"></div>
      </div>`;
    this._renderStep();
  },

  _buildProgress() {
    const steps = [
      { n: 1, label: 'Résumé' },
      { n: 2, label: 'Client & Chantier' },
      { n: 3, label: 'Corps métier' },
      { n: 4, label: 'Finaliser' },
    ];
    const s = this._state.step;
    const items = steps.map(st => {
      const done    = st.n < s;
      const active  = st.n === s;
      const col     = done ? '#2DD4A0' : active ? '#4F8EF7' : 'var(--text-tertiary)';
      const bg      = done ? 'rgba(45,212,160,0.15)' : active ? 'rgba(79,142,247,0.15)' : 'var(--bg-tertiary)';
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex:1">
          <div style="width:32px;height:32px;border-radius:50%;background:${bg};border:2px solid ${col};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:${col};transition:all .3s">
            ${done ? '✓' : st.n}
          </div>
          <div style="font-size:11px;color:${active ? 'var(--text-primary)' : 'var(--text-tertiary)'};font-weight:${active ? '700' : '400'};text-align:center">${st.label}</div>
        </div>`;
    });
    const line = `<div style="flex:1;height:2px;background:linear-gradient(90deg,${s > 1 ? '#2DD4A0' : 'var(--border)'},${s > 2 ? '#2DD4A0' : 'var(--border)'});margin-top:14px;transition:background .3s"></div>`;
    let html = '<div style="display:flex;align-items:flex-start;padding:16px 28px 0;gap:0">';
    items.forEach((item, i) => {
      html += item;
      if (i < items.length - 1) html += line;
    });
    html += '</div>';
    return html;
  },

  _renderStep() {
    const body   = document.getElementById('dw-body');
    const footer = document.getElementById('dw-footer');
    if (!body || !footer) return;
    const s = this._state.step;
    if      (s === 1) { body.innerHTML = this._buildStep1(); footer.innerHTML = this._footerStep1(); }
    else if (s === 2) { body.innerHTML = this._buildStep2(); footer.innerHTML = this._footerStep2(); this._bindStep2(); }
    else if (s === 3) { body.innerHTML = this._buildStep3(); footer.innerHTML = this._footerStep3(); }
    else if (s === 4) { body.innerHTML = this._buildStep4(); footer.innerHTML = this._footerStep4(); }
  },

  _goStep(n) {
    this._state.step = n;
    const prog = document.querySelector('#dw-modal > div:nth-child(2)');
    if (prog) prog.outerHTML = this._buildProgress(); // rebuild progress
    // Re-render full overlay to update progress
    this._renderOverlay();
  },

  close() {
    const ov = document.getElementById('dw-overlay');
    if (ov) ov.remove();
  },

  // ── ÉTAPE 1 — Résumé calcul ───────────────────────────────
  _buildStep1() {
    const r = this._state.result;
    const { sections = [], coutMat = 0, coutMO = 0, margeMat = 0.3, margeMO = 0.2 } = r;
    const totalHT  = coutMat * (1 + margeMat) + coutMO * (1 + margeMO);
    const totalTTC = totalHT * (1 + this._state.tvaRate / 100);

    // Table matériaux
    let rows = '';
    sections.forEach(sec => {
      rows += `<tr><td colspan="3" style="padding:8px 10px 4px;font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.06em;background:var(--bg-tertiary)">${sec.titre}</td></tr>`;
      sec.items.forEach(item => {
        rows += `<tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
          <td style="padding:7px 10px;font-size:13px;color:var(--text-primary)">${item.icon || '📦'} ${item.nom}</td>
          <td style="padding:7px 10px;font-size:12px;color:var(--text-secondary);text-align:center">${item.qte}</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;color:var(--text-primary);text-align:right">${Calc.fmt(item.prix)} €</td>
        </tr>`;
      });
    });

    // Proposition sauvegarde métrés
    const hasDims = document.getElementById('cl-longueur') || document.getElementById('db-longueur');
    const metresBanner = hasDims ? `
      <div style="margin-top:16px;padding:12px 14px;background:rgba(45,212,160,0.08);border:1px solid rgba(45,212,160,0.2);border-radius:10px;display:flex;align-items:center;gap:10px">
        <input type="checkbox" id="dw-save-metres" style="width:16px;height:16px;accent-color:#2DD4A0" ${this._state.sauvegarderMetres ? 'checked' : ''} onchange="DevisWizard._state.sauvegarderMetres=this.checked">
        <label for="dw-save-metres" style="font-size:13px;color:var(--text-secondary);cursor:pointer">📐 Enregistrer ces dimensions comme métrés dans le chantier</label>
      </div>` : '';

    return `
      <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:16px">✅ Voici votre estimation :</div>
      <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:16px">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:var(--bg-tertiary)">
            <th style="padding:8px 10px;text-align:left;font-size:11px;color:var(--text-tertiary);font-weight:700;text-transform:uppercase">Matériau</th>
            <th style="padding:8px 10px;text-align:center;font-size:11px;color:var(--text-tertiary);font-weight:700;text-transform:uppercase">Qté</th>
            <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-tertiary);font-weight:700;text-transform:uppercase">Prix HT</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div style="background:var(--bg-secondary);border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:7px">
        <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:var(--text-secondary)">Matériaux HT</span><span style="font-weight:600">${Calc.fmt(coutMat)} €</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:var(--text-secondary)">Main d'œuvre HT</span><span style="font-weight:600">${Calc.fmt(coutMO)} €</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding-top:7px;border-top:1px solid var(--border)"><span style="color:var(--text-secondary)">Total HT client</span><span style="font-weight:700;color:var(--text-primary)">${Calc.fmt(totalHT)} €</span></div>
        <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:900"><span style="color:var(--text-primary)">Total TTC estimé</span><span style="color:var(--accent)">${Calc.fmt(totalTTC)} €</span></div>
      </div>
      ${metresBanner}`;
  },

  _footerStep1() {
    return `<button class="btn btn-secondary" onclick="DevisWizard.close()">Annuler</button>
            <button class="btn btn-primary" onclick="DevisWizard._goStep(2)">Continuer → Client & Chantier</button>`;
  },

  // ── ÉTAPE 2 — Client & Chantier ───────────────────────────
  _buildStep2() {
    const clients   = (DB.clients  || []);
    const chantiers = (DB.chantiers || []);

    const clientOpts = clients.map(c => `<option value="${c.id}" ${c.id == this._state.clientId ? 'selected' : ''}>${c.nom || c.prenom + ' ' + (c.nom||'')}</option>`).join('');
    const chanOpts   = chantiers.map(c => `<option value="${c.id}" ${c.id == this._state.chantierId ? 'selected' : ''}>${c.nom || c.adresse || ('Chantier #' + c.id)}</option>`).join('');

    return `
      <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:18px">👤 Pour quel client et chantier ?</div>

      <!-- Client -->
      <div style="margin-bottom:20px">
        <label style="font-size:13px;font-weight:700;color:var(--text-secondary);display:block;margin-bottom:8px">Client</label>
        <div style="display:flex;gap:8px">
          <select id="dw-client-sel" style="flex:1;padding:9px 12px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;font-size:13px" onchange="DevisWizard._onClientChange(this.value)">
            <option value="">— Sélectionner un client —</option>
            ${clientOpts}
          </select>
          <button class="btn btn-secondary" style="white-space:nowrap;font-size:12px" onclick="DevisWizard._showNewClientForm()">+ Nouveau</button>
        </div>
        <div id="dw-new-client-form" style="display:none;margin-top:10px;background:var(--bg-secondary);border:1px solid rgba(79,142,247,0.2);border-radius:10px;padding:14px">
          <div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:10px">Nouveau client</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <input type="text"  id="dw-nc-nom"   placeholder="Nom *" style="padding:7px 10px;background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border);border-radius:7px;font-size:13px">
            <input type="tel"   id="dw-nc-tel"   placeholder="Téléphone" style="padding:7px 10px;background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border);border-radius:7px;font-size:13px">
          </div>
          <input type="email" id="dw-nc-email" placeholder="Email" style="width:100%;box-sizing:border-box;padding:7px 10px;background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border);border-radius:7px;font-size:13px;margin-bottom:8px">
          <button class="btn btn-primary" style="font-size:12px" onclick="DevisWizard._creerClient()">Créer & sélectionner</button>
        </div>
      </div>

      <!-- Chantier -->
      <div style="margin-bottom:20px">
        <label style="font-size:13px;font-weight:700;color:var(--text-secondary);display:block;margin-bottom:8px">Chantier</label>
        <div style="display:flex;gap:8px">
          <select id="dw-chantier-sel" style="flex:1;padding:9px 12px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;font-size:13px" onchange="DevisWizard._state.chantierId=this.value">
            <option value="">— Sélectionner un chantier —</option>
            ${chanOpts}
          </select>
          <button class="btn btn-secondary" style="white-space:nowrap;font-size:12px" onclick="DevisWizard._showNewChantierForm()">+ Nouveau</button>
        </div>
        <div id="dw-new-chantier-form" style="display:none;margin-top:10px;background:var(--bg-secondary);border:1px solid rgba(45,212,160,0.2);border-radius:10px;padding:14px">
          <div style="font-size:12px;font-weight:700;color:#2DD4A0;margin-bottom:10px">Nouveau chantier</div>
          <input type="text" id="dw-nch-nom"     placeholder="Nom du chantier *" style="width:100%;box-sizing:border-box;padding:7px 10px;background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border);border-radius:7px;font-size:13px;margin-bottom:8px">
          <input type="text" id="dw-nch-adresse" placeholder="Adresse" style="width:100%;box-sizing:border-box;padding:7px 10px;background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border);border-radius:7px;font-size:13px;margin-bottom:8px">
          <button class="btn btn-primary" style="font-size:12px" onclick="DevisWizard._creerChantier()">Créer & sélectionner</button>
        </div>
      </div>

      <!-- Type chantier -->
      <div>
        <label style="font-size:13px;font-weight:700;color:var(--text-secondary);display:block;margin-bottom:8px">Type de chantier</label>
        <div style="display:flex;gap:8px">
          <button id="dw-type-int" class="dw-type-btn ${this._state.typeChantier === 'interieur' ? 'active' : ''}" onclick="DevisWizard._setType('interieur')">🏠 Intérieur</button>
          <button id="dw-type-ext" class="dw-type-btn ${this._state.typeChantier === 'exterieur' ? 'active' : ''}" onclick="DevisWizard._setType('exterieur')">🌿 Extérieur</button>
        </div>
      </div>`;
  },

  _bindStep2() {
    if (this._state.clientId) {
      const sel = document.getElementById('dw-client-sel');
      if (sel) sel.value = this._state.clientId;
    }
    if (this._state.chantierId) {
      const sel = document.getElementById('dw-chantier-sel');
      if (sel) sel.value = this._state.chantierId;
    }
  },

  _footerStep2() {
    return `<button class="btn btn-secondary" onclick="DevisWizard._goStep(1)">← Retour</button>
            <button class="btn btn-primary" onclick="DevisWizard._validateStep2()">Continuer → Corps métier</button>`;
  },

  _validateStep2() {
    const cSel  = document.getElementById('dw-client-sel');
    const chSel = document.getElementById('dw-chantier-sel');
    if (cSel)  this._state.clientId    = cSel.value  || null;
    if (chSel) this._state.chantierId  = chSel.value || null;
    this._goStep(3);
  },

  _onClientChange(val) {
    this._state.clientId = val || null;
    document.getElementById('dw-new-client-form').style.display = 'none';
  },

  _showNewClientForm() {
    const f = document.getElementById('dw-new-client-form');
    if (f) f.style.display = f.style.display === 'none' ? '' : 'none';
  },

  _showNewChantierForm() {
    const f = document.getElementById('dw-new-chantier-form');
    if (f) f.style.display = f.style.display === 'none' ? '' : 'none';
  },

  _creerClient() {
    const nom   = document.getElementById('dw-nc-nom')?.value.trim()   || '';
    const tel   = document.getElementById('dw-nc-tel')?.value.trim()   || '';
    const email = document.getElementById('dw-nc-email')?.value.trim() || '';
    if (!nom) { App.toast('Saisissez un nom', 'error'); return; }
    const client = { nom, tel, email, createdAt: new Date().toISOString() };
    DB.add(DB.KEYS.clients, client);
    this._state.clientId = client.id;
    App.toast('Client ' + nom + ' créé !', 'success');
    this._goStep(2);
  },

  _creerChantier() {
    const nom     = document.getElementById('dw-nch-nom')?.value.trim()     || '';
    const adresse = document.getElementById('dw-nch-adresse')?.value.trim() || '';
    if (!nom) { App.toast('Saisissez un nom de chantier', 'error'); return; }
    const chantier = { nom, adresse, statut: 'En attente', clientId: this._state.clientId || null, createdAt: new Date().toISOString() };
    DB.add(DB.KEYS.chantiers, chantier);
    this._state.chantierId = chantier.id;
    App.toast('Chantier ' + nom + ' créé !', 'success');
    this._goStep(2);
  },

  _setType(type) {
    this._state.typeChantier = type;
    document.querySelectorAll('.dw-type-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('dw-type-' + (type === 'interieur' ? 'int' : 'ext'))?.classList.add('active');
  },

  // ── ÉTAPE 3 — Corps de métier ─────────────────────────────
  _CORPS: [
    { id: 'electricite', icon: '⚡', label: 'Électricité', desc: 'Câblage, prises, éclairage',       baseHT: 1800 },
    { id: 'plomberie',   icon: '🔧', label: 'Plomberie',   desc: 'Salle de bain, cuisine, évacuations', baseHT: 2200 },
    { id: 'peinture',    icon: '🎨', label: 'Peinture',    desc: 'Préparation, sous-couche, finition',  baseHT: 800  },
    { id: 'maconnerie',  icon: '🧱', label: 'Maçonnerie',  desc: 'Démolition, ouvertures, seuils',      baseHT: 1500 },
    { id: 'carrelage',   icon: '🔲', label: 'Carrelage',   desc: 'Pose carrelage sol et mur',           baseHT: 950  },
    { id: 'exterieur',   icon: '🌿', label: 'Extérieur',   desc: 'Terrasse, clôture, aménagement',      baseHT: 1200 },
  ],

  _buildStep3() {
    const sel = this._state.corpsAdditionnels;
    const cards = this._CORPS.map(c => {
      const active = sel.includes(c.id);
      return `
        <div class="dw-corps-card ${active ? 'active' : ''}" id="dw-corps-${c.id}" onclick="DevisWizard._toggleCorps('${c.id}')">
          <div style="font-size:28px;margin-bottom:6px">${c.icon}</div>
          <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${c.label}</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:3px;line-height:1.4">${c.desc}</div>
          <div style="margin-top:8px;font-size:11px;font-weight:600;color:${active ? '#2DD4A0' : 'var(--text-tertiary)'}">~${Calc.fmt(c.baseHT)} € HT</div>
          <div class="dw-corps-check">${active ? '✓' : '+'}</div>
        </div>`;
    }).join('');

    return `
      <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:6px">🔧 Ajouter d'autres prestations ?</div>
      <div style="font-size:13px;color:var(--text-tertiary);margin-bottom:18px">Cochez les corps de métier à inclure dans votre devis. Vous pourrez ajuster les prix à l'étape suivante.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">
        ${cards}
      </div>
      ${sel.length ? `<div style="margin-top:14px;padding:10px 14px;background:rgba(45,212,160,0.08);border:1px solid rgba(45,212,160,0.2);border-radius:8px;font-size:13px;color:#2DD4A0">${sel.length} corps de métier ajouté${sel.length > 1 ? 's' : ''}</div>` : '<div style="margin-top:14px;font-size:13px;color:var(--text-tertiary)">Aucun — le devis n\'inclura que les travaux de plâtrerie calculés.</div>'}`;
  },

  _footerStep3() {
    return `<button class="btn btn-secondary" onclick="DevisWizard._goStep(2)">← Retour</button>
            <button class="btn btn-primary" onclick="DevisWizard._goStep(4)">Continuer → Finaliser</button>`;
  },

  _toggleCorps(id) {
    const arr = this._state.corpsAdditionnels;
    const idx = arr.indexOf(id);
    if (idx >= 0) arr.splice(idx, 1);
    else          arr.push(id);
    // Re-render corps section only
    const body = document.getElementById('dw-body');
    if (body) body.innerHTML = this._buildStep3();
  },

  // ── ÉTAPE 4 — Finaliser ───────────────────────────────────
  _buildStep4() {
    const r    = this._state.result;
    const marge = this._state.margeGlobal;
    const tva   = this._state.tvaRate;

    // Construire sections
    let totalBaseHT = r.totalHT || 0;
    const corpsHtml = this._state.corpsAdditionnels.map(id => {
      const c = this._CORPS.find(x => x.id === id);
      if (!c) return '';
      const adjusted = c.baseHT * (1 + marge / 100);
      totalBaseHT += c.baseHT;
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">
          <div style="font-size:13px;color:var(--text-primary)">${c.icon} ${c.label}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="number" class="dw-input" style="width:82px;text-align:right" value="${c.baseHT}" min="0" step="50"
              oninput="DevisWizard._updateCorpsPrice('${c.id}', this.value)">
            <span style="font-size:12px;color:var(--text-tertiary)">€ HT</span>
          </div>
        </div>`;
    }).join('');

    const margeApplied = totalBaseHT * (1 + marge / 100);
    const tvaMt        = margeApplied * (tva / 100);
    const totalTTC     = margeApplied + tvaMt;

    const clientNom    = this._getClientNom();
    const chantierNom  = this._getChantierNom();

    return `
      <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:18px">🎉 Votre devis est prêt !</div>

      ${clientNom || chantierNom ? `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        ${clientNom  ? `<div style="padding:5px 12px;background:rgba(79,142,247,0.1);border:1px solid rgba(79,142,247,0.2);border-radius:20px;font-size:12px;color:#4F8EF7">👤 ${clientNom}</div>` : ''}
        ${chantierNom? `<div style="padding:5px 12px;background:rgba(45,212,160,0.1);border:1px solid rgba(45,212,160,0.2);border-radius:20px;font-size:12px;color:#2DD4A0">🏗 ${chantierNom}</div>` : ''}
      </div>` : ''}

      <!-- Sections récap -->
      <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:16px">
        <div style="padding:8px 12px;background:var(--bg-tertiary);font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.06em">🧱 Plâtrerie (Calcul Express)</div>
        <div style="padding:9px 12px;display:flex;justify-content:space-between">
          <span style="font-size:13px;color:var(--text-primary)">Matériaux + Main d'œuvre</span>
          <span style="font-size:13px;font-weight:600">${Calc.fmt(r.totalHT || 0)} € HT</span>
        </div>
        ${corpsHtml}
      </div>

      <!-- Marges & TVA -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div>
          <label style="font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:5px">Marge globale (%)</label>
          <div style="display:flex;align-items:center;gap:6px">
            <input type="range" id="dw-marge-range" min="0" max="80" value="${marge}" style="flex:1;accent-color:var(--accent)"
              oninput="DevisWizard._updateMarge(this.value)">
            <span id="dw-marge-val" style="font-size:14px;font-weight:700;color:var(--accent);min-width:38px">${marge}%</span>
          </div>
        </div>
        <div>
          <label style="font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:5px">TVA applicable</label>
          <div style="display:flex;gap:6px">
            <button id="dw-tva10" class="dw-tva-btn ${tva === 10 ? 'active' : ''}" onclick="DevisWizard._setTVA(10)">10% Rénovation</button>
            <button id="dw-tva20" class="dw-tva-btn ${tva === 20 ? 'active' : ''}" onclick="DevisWizard._setTVA(20)">20% Neuf</button>
          </div>
        </div>
      </div>

      <!-- Totaux finaux -->
      <div id="dw-totaux" style="background:var(--bg-secondary);border-radius:10px;padding:14px 16px">
        ${this._buildTotaux(totalBaseHT, marge, tva)}
      </div>`;
  },

  _buildTotaux(baseHT, marge, tva) {
    const apMarge = baseHT * (1 + marge / 100);
    const tvaMt   = apMarge * (tva / 100);
    const ttc     = apMarge + tvaMt;
    return `
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span style="color:var(--text-secondary)">Total base HT</span><span>${Calc.fmt(baseHT)} €</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span style="color:var(--text-secondary)">Après marge (${marge}%)</span><span>${Calc.fmt(apMarge)} €</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px"><span style="color:var(--text-secondary)">TVA ${tva}%</span><span>${Calc.fmt(tvaMt)} €</span></div>
      <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:900;padding-top:8px;border-top:1px solid var(--border)"><span style="color:var(--text-primary)">TOTAL TTC</span><span style="color:var(--accent)">${Calc.fmt(ttc)} €</span></div>`;
  },

  _footerStep4() {
    return `
      <button class="btn btn-secondary" onclick="DevisWizard._goStep(3)">← Retour</button>
      <button class="btn btn-secondary" onclick="DevisWizard._imprimer()" style="font-size:13px">🖨 Imprimer</button>
      <button class="btn btn-secondary" onclick="DevisWizard._finaliser(true)" style="font-size:13px">📧 Enregistrer & Envoyer</button>
      <button class="btn btn-primary"   onclick="DevisWizard._finaliser(false)">💾 Enregistrer</button>`;
  },

  _updateMarge(val) {
    this._state.margeGlobal = parseInt(val);
    document.getElementById('dw-marge-val').textContent = val + '%';
    this._refreshTotaux();
  },

  _setTVA(rate) {
    this._state.tvaRate = rate;
    document.querySelectorAll('.dw-tva-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('dw-tva' + rate)?.classList.add('active');
    this._refreshTotaux();
  },

  _updateCorpsPrice(id, val) {
    const c = this._CORPS.find(x => x.id === id);
    if (c) c.baseHT = parseFloat(val) || 0;
    this._refreshTotaux();
  },

  _refreshTotaux() {
    const r     = this._state.result;
    const marge = this._state.margeGlobal;
    const tva   = this._state.tvaRate;
    let total   = r.totalHT || 0;
    this._state.corpsAdditionnels.forEach(id => {
      const c = this._CORPS.find(x => x.id === id);
      if (c) total += c.baseHT;
    });
    const el = document.getElementById('dw-totaux');
    if (el) el.innerHTML = this._buildTotaux(total, marge, tva);
  },

  // ── Finaliser ─────────────────────────────────────────────
  _finaliser(sendAfter) {
    const r       = this._state.result;
    const marge   = this._state.margeGlobal / 100;
    const tva     = this._state.tvaRate / 100;
    const config  = DB.getConfig ? DB.getConfig() : {};
    const numero  = (config.prefixeDevis || 'DEV-') + String(DB.nextId(DB.KEYS.devis)).padStart(4, '0');

    const lignes = [];
    // Lignes plâtrerie
    (r.sections || []).forEach(sec => {
      sec.items.forEach(item => {
        lignes.push({
          designation: item.nom, quantite: 1, unite: 'ens',
          prixUnitaire: (item.prix || 0) * (1 + marge),
          tva: this._state.tvaRate,
        });
      });
    });
    // Lignes corps additionnels
    this._state.corpsAdditionnels.forEach(id => {
      const c = this._CORPS.find(x => x.id === id);
      if (c) lignes.push({
        designation: c.label + ' — ' + c.desc, quantite: 1, unite: 'ens',
        prixUnitaire: c.baseHT * (1 + marge),
        tva: this._state.tvaRate,
      });
    });

    const totalHT  = lignes.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0);
    const totalTTC = totalHT * (1 + tva);

    const devis = {
      numero, date: new Date().toISOString().slice(0, 10),
      statut:    'Brouillon',
      clientId:  this._state.clientId   || null,
      chantierId:this._state.chantierId || null,
      type:      this._state.typeChantier,
      lignes, totalHT, totalTTC, montantTVA: totalHT * tva, tva,
      source: 'Calcul Express',
    };
    DB.addDevis(devis);

    // Enregistrer métrés si demandé
    if (this._state.sauvegarderMetres && this._state.chantierId) {
      this._sauvegarderMetres(devis.chantierId);
    }

    this.close();
    App.toast('Devis ' + numero + ' créé !', 'success');

    if (sendAfter) {
      setTimeout(() => App.navigate('devis', { chantierId: devis.chantierId }), 400);
    } else {
      setTimeout(() => App.navigate('devis'), 300);
    }
  },

  _imprimer() {
    App.toast('Enregistrez d\'abord le devis pour l\'imprimer', 'info');
    this._finaliser(false);
  },

  _sauvegarderMetres(chantierId) {
    // Essayer de lire les dimensions saisies dans le calc actif
    const dims = {};
    ['cl-longueur','cl-hauteur','db-longueur','db-hauteur','pf-longueur','pf-largeur'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value) dims[id] = parseFloat(el.value);
    });
    if (!Object.keys(dims).length) return;
    const metrage = {
      chantierId, nom: 'Métrés Calcul Express',
      dims, createdAt: new Date().toISOString(),
    };
    DB.add(DB.KEYS.metrages || 'metrages', metrage);
  },

  // ── Helpers ───────────────────────────────────────────────
  _getClientNom() {
    if (!this._state.clientId) return '';
    const c = (DB.clients || []).find(x => x.id == this._state.clientId);
    return c ? (c.nom || c.prenom || '') : '';
  },

  _getChantierNom() {
    if (!this._state.chantierId) return '';
    const c = (DB.chantiers || []).find(x => x.id == this._state.chantierId);
    return c ? (c.nom || c.adresse || '') : '';
  },

  // ── Styles ────────────────────────────────────────────────
  _injectStyles() {
    if (document.getElementById('dw-styles')) return;
    const s = document.createElement('style');
    s.id = 'dw-styles';
    s.textContent = `
      .dw-type-btn { padding:8px 16px; border-radius:8px; border:1px solid var(--border); background:transparent; color:var(--text-secondary); font-size:13px; cursor:pointer; transition:all .2s; }
      .dw-type-btn:hover, .dw-type-btn.active { background:rgba(79,142,247,0.15); border-color:var(--accent); color:var(--accent); font-weight:600; }
      .dw-corps-card { position:relative; background:var(--bg-secondary); border:2px solid var(--border); border-radius:12px; padding:14px; cursor:pointer; transition:all .22s; text-align:center; }
      .dw-corps-card:hover { border-color:rgba(79,142,247,0.4); transform:translateY(-2px); }
      .dw-corps-card.active { border-color:#2DD4A0; background:rgba(45,212,160,0.07); }
      .dw-corps-check { position:absolute; top:8px; right:8px; width:20px; height:20px; border-radius:50%; background:var(--bg-tertiary); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:11px; color:var(--text-tertiary); }
      .dw-corps-card.active .dw-corps-check { background:#2DD4A0; border-color:#2DD4A0; color:#fff; font-weight:700; }
      .dw-tva-btn { flex:1; padding:7px 8px; border-radius:7px; border:1px solid var(--border); background:transparent; color:var(--text-secondary); font-size:12px; cursor:pointer; transition:all .2s; text-align:center; }
      .dw-tva-btn.active { background:rgba(79,142,247,0.15); border-color:var(--accent); color:var(--accent); font-weight:700; }
      .dw-input { background:var(--bg-tertiary); color:var(--text-primary); border:1px solid var(--border); border-radius:6px; padding:5px 7px; font-size:12px; outline:none; transition:border-color .2s; }
      .dw-input:focus { border-color:var(--accent); }
    `;
    document.head.appendChild(s);
  },

  // ── Paysagisme : TERRAIN & SOL ────────────────────────────
  calcPayTerrain() {
    const surfacePoly = this._surfacePoly || 0;
    const longueur = this.v('pt-longueur', 20);
    const largeur  = this.v('pt-largeur', 15);
    const surface  = surfacePoly > 0 ? surfacePoly : longueur * largeur;
    const profond  = this.v('pt-profondeur', 0.30);
    const margeMat = this.v('pt-marge-mat', 30) / 100;
    const margeMO  = this.v('pt-marge-mo', 20) / 100;

    const sections = [];
    let coutMat = 0, coutMO = 0;

    // Terrassement
    const volTerra = surface * profond;
    const hTerra   = volTerra * 0.8;
    coutMO += hTerra * 45;
    sections.push({
      titre: `⛏ Terrassement — ${this.fmtN(surface)} m² × ${profond} m = ${this.fmtN(volTerra)} m³`,
      items: [{ icon: '⛏', nom: 'Main-d\'œuvre terrassement', ref: '', qte: this.fmtN(hTerra) + ' h', prix: hTerra * 45 }]
    });

    // Béton désactivé
    if (document.getElementById('pt-beton')?.checked) {
      const ep       = this.v('pt-beton-ep', 12) / 100;
      const dosage   = this.v('pt-beton-dosage', 350);
      const volBeton = surface * ep;
      const ciment   = volBeton * dosage;
      const gravier  = volBeton * 1800;
      const pCiment  = 8 / 35;
      const pGravier = 25 / 1000;
      const matBeton = ciment * pCiment + gravier * pGravier;
      const hBeton   = surface * 2;
      coutMat += matBeton;
      coutMO  += hBeton * 45;
      sections.push({
        titre: `🪨 Béton désactivé — ${this.fmtN(surface)} m² × ${ep * 100} cm`,
        items: [
          { icon: '🪨', nom: 'Ciment', ref: '', qte: this.fmtN(Math.ceil(ciment / 35)) + ' sacs 35kg', prix: ciment * pCiment },
          { icon: '🚛', nom: 'Gravier béton', ref: '', qte: this.fmtN(Math.ceil(gravier / 1000)) + ' t', prix: gravier * pGravier },
          { icon: '👷', nom: 'MO coulage + finition désactivée', ref: '', qte: this.fmtN(hBeton) + ' h', prix: hBeton * 45 },
        ]
      });
    }

    // Résine drainante
    if (document.getElementById('pt-resine')?.checked) {
      const epR     = this.v('pt-resine-ep', 5);
      const matRes  = surface * 30;
      const hRes    = surface * 0.5;
      coutMat += matRes;
      coutMO  += hRes * 45;
      sections.push({
        titre: `💧 Résine drainante — ${this.fmtN(surface)} m² × ${epR} cm`,
        items: [
          { icon: '💧', nom: 'Résine drainante + granulats', ref: '', qte: this.fmtN(surface) + ' m²', prix: matRes },
          { icon: '👷', nom: 'MO application résine', ref: '', qte: this.fmtN(hRes) + ' h', prix: hRes * 45 },
        ]
      });
    }

    // Mélange terre/sable
    if (document.getElementById('pt-melange')?.checked) {
      const ratio   = this.v('pt-melange-ratio', 30) / 100;
      const volS    = volTerra * ratio;
      const volT    = volTerra * (1 - ratio);
      const matMel  = volS * 25 + volT * 35;
      coutMat += matMel;
      sections.push({
        titre: `🌱 Mélange terre/sable — ${Math.round(ratio * 100)}% sable`,
        items: [
          { icon: '🏖', nom: 'Sable', ref: '', qte: this.fmtN(volS) + ' m³', prix: volS * 25 },
          { icon: '🌱', nom: 'Terre végétale', ref: '', qte: this.fmtN(volT) + ' m³', prix: volT * 35 },
        ]
      });
    }

    if (!sections.length) return null;
    return { sections, coutMat, coutMO, margeMat, margeMO, surface };
  },

  // ── Paysagisme : VÉGÉTAL ──────────────────────────────────
  calcPayVegetal() {
    const surface  = this.v('pv-surface', 100);
    const margeMat = this.v('pv-marge-mat', 30) / 100;
    const margeMO  = this.v('pv-marge-mo', 20) / 100;

    const sections = [];
    let coutMat = 0, coutMO = 0;

    // Gazon
    if (document.getElementById('pv-gazon')?.checked) {
      const type = this.radio('pv-gazon-type') || 'rouleau';
      if (type === 'rouleau') {
        const mat = surface * 4.5;
        const h   = surface * 0.15;
        coutMat += mat; coutMO += h * 40;
        sections.push({
          titre: `🌱 Gazon rouleau — ${this.fmtN(surface)} m²`,
          items: [
            { icon: '🌱', nom: 'Gazon rouleau', ref: '', qte: this.fmtN(surface) + ' m²', prix: mat },
            { icon: '👷', nom: 'MO pose', ref: '', qte: this.fmtN(h) + ' h', prix: h * 40 },
          ]
        });
      } else {
        const g = this.v('pv-gazon-semis', 35);
        const kg = surface * g / 1000;
        const mat = kg * 8;
        const h   = surface * 0.05;
        coutMat += mat; coutMO += h * 40;
        sections.push({
          titre: `🌱 Gazon semis — ${this.fmtN(surface)} m² × ${g} g/m²`,
          items: [
            { icon: '🌾', nom: 'Semences gazon', ref: '', qte: this.fmtN(kg) + ' kg', prix: mat },
            { icon: '👷', nom: 'MO semis', ref: '', qte: this.fmtN(h) + ' h', prix: h * 40 },
          ]
        });
      }
    }

    // Plantation
    if (document.getElementById('pv-plantation')?.checked) {
      const nb  = this.v('pv-nb-plants', 20);
      const pu  = this.v('pv-prix-plant', 15);
      const mat = nb * pu;
      const h   = nb * 0.25;
      coutMat += mat; coutMO += h * 40;
      sections.push({
        titre: `🌳 Plantation — ${nb} plants`,
        items: [
          { icon: '🌳', nom: 'Plants (pépinière / Willemse)', ref: '', qte: nb + ' plants', prix: mat },
          { icon: '👷', nom: 'MO plantation', ref: '', qte: this.fmtN(h) + ' h', prix: h * 40 },
        ]
      });
    }

    // Paillage
    if (document.getElementById('pv-paillage')?.checked) {
      const ep  = this.v('pv-paillage-ep', 8) / 100;
      const vol = surface * ep;
      const mat = vol * 35;
      const h   = surface * 0.05;
      coutMat += mat; coutMO += h * 40;
      sections.push({
        titre: `🍂 Paillage — ${this.fmtN(surface)} m² × ${ep * 100} cm = ${this.fmtN(vol)} m³`,
        items: [
          { icon: '🍂', nom: 'Paillage bois / écorce', ref: '', qte: this.fmtN(vol) + ' m³', prix: mat },
          { icon: '👷', nom: 'MO épandage', ref: '', qte: this.fmtN(h) + ' h', prix: h * 40 },
        ]
      });
    }

    if (!sections.length) return null;
    return { sections, coutMat, coutMO, margeMat, margeMO, surface };
  },

  // ── Paysagisme : MAIN D'ŒUVRE ─────────────────────────────
  calcPayMO() {
    const nbSal   = this.v('pm-nb-salaries', 4);
    const hSal    = this.v('pm-h-salarie', 8);
    const taux    = this.v('pm-taux-salarie', 35);
    const margeMO = this.v('pm-marge-mo', 20) / 100;

    const sections = [];
    let coutMat = 0, coutMO = 0;

    // Salariés
    const totalSal = nbSal * hSal * taux;
    coutMO += totalSal;
    sections.push({
      titre: `👷 Équipe — ${nbSal} salarié(s) × ${hSal}h × ${taux}€/h`,
      items: [{ icon: '👷', nom: `MO salariés (${nbSal} pers.)`, ref: '', qte: (nbSal * hSal) + ' h total', prix: totalSal }]
    });

    // Mini-pelle
    if (document.getElementById('pm-minipelle')?.checked) {
      const hP = this.v('pm-h-pelle', 4);
      const cP = this.v('pm-cout-pelle', 90);
      coutMO += hP * cP;
      sections.push({
        titre: `🚜 Mini-pelle — ${hP}h × ${cP}€/h`,
        items: [{ icon: '🚜', nom: 'Location mini-pelle + opérateur', ref: '', qte: hP + ' h', prix: hP * cP }]
      });
    }

    // Sous-traitants
    const stDefs = [
      { cbId: 'pm-st1', valId: 'pm-forfait-st1', icon: '🪨', nom: 'Marbrier / Ardoise', def: 1500 },
      { cbId: 'pm-st2', valId: 'pm-forfait-st2', icon: '⚡', nom: 'Électricien extérieur', def: 800 },
      { cbId: 'pm-st3', valId: 'pm-forfait-st3', icon: '🚿', nom: 'Plombier extérieur', def: 600 },
    ];
    const stItems = [];
    stDefs.forEach(st => {
      if (document.getElementById(st.cbId)?.checked) {
        const f = this.v(st.valId, st.def);
        stItems.push({ icon: st.icon, nom: st.nom + ' (forfait)', ref: '', qte: '1 forfait', prix: f });
        coutMat += f;
      }
    });
    if (stItems.length) sections.push({ titre: '🤝 Sous-traitants', items: stItems });

    if (!sections.length) return null;
    return { sections, coutMat, coutMO, margeMat: 0, margeMO, surface: 0 };
  },
};
