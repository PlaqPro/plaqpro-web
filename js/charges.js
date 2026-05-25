/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO+ — Module Coefficient de Charge
//  Calcul charges statiques + dynamiques + rapport PDF
//  Référence : Eurocode 1 — EN 1991-1-1
// ============================================================

Pages.charges = function() {
  const div = document.createElement('div');

  // Injection style
  if (!document.getElementById('style-charges')) {
    const s = document.createElement('style');
    s.id = 'style-charges';
    s.textContent = `
      .ch-hero { background: linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; color: #fff; }
      .ch-hero h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      .ch-hero p { font-size: 13px; opacity: .8; margin: 0; }
      .ch-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media(max-width:768px){ .ch-grid { grid-template-columns: 1fr; } }
      .ch-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 20px; }
      .ch-section { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary); padding-bottom: 8px;
        border-bottom: 1px solid var(--border); margin: 16px 0 12px; }
      .ch-section:first-child { margin-top: 0; }
      .ch-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
      .ch-row-3 { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 8px; align-items: end; margin-bottom: 8px; }
      .ch-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
      .ch-input-wrap { position: relative; }
      .ch-input-wrap input { width: 100%; padding: 8px 36px 8px 10px;
        background: var(--bg-primary); border: 1px solid var(--border);
        border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px; }
      .ch-input-wrap .ch-unit { position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
        font-size: 11px; color: var(--text-tertiary); pointer-events: none; }
      .ch-verdict { border-radius: var(--radius-lg); padding: 20px; margin-bottom: 16px; text-align: center; }
      .ch-verdict.ok { background: rgba(16,185,129,.15); border: 2px solid #10b981; }
      .ch-verdict.warn { background: rgba(245,158,11,.15); border: 2px solid #f59e0b; }
      .ch-verdict.fail { background: rgba(239,68,68,.15); border: 2px solid #ef4444; }
      .ch-verdict-icon { font-size: 36px; margin-bottom: 8px; }
      .ch-verdict-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
      .ch-verdict-sub { font-size: 13px; opacity: .8; }
      .ch-stat { display: flex; justify-content: space-between; align-items: center;
        padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
      .ch-stat:last-child { border: none; }
      .ch-stat-val { font-weight: 700; color: var(--accent); }
      .ch-add-btn { background: var(--bg-primary); border: 1px dashed var(--border);
        border-radius: var(--radius-sm); padding: 8px; width: 100%; cursor: pointer;
        color: var(--text-tertiary); font-size: 12px; margin-top: 6px; }
      .ch-add-btn:hover { border-color: var(--accent); color: var(--accent); }
      .ch-remove { background: none; border: none; color: #ef4444; cursor: pointer;
        font-size: 16px; padding: 4px 8px; border-radius: var(--radius-sm); }
      .ch-remove:hover { background: rgba(239,68,68,.1); }
      .ch-plancher-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
      .ch-plancher-btn { padding: 10px 6px; border: 2px solid var(--border);
        border-radius: var(--radius-md); background: var(--bg-primary); cursor: pointer;
        text-align: center; font-size: 11px; color: var(--text-secondary); transition: all .2s; }
      .ch-plancher-btn.active { border-color: var(--accent); background: rgba(79,142,247,.1); color: var(--accent); font-weight: 600; }
      .ch-plancher-btn .ch-pb-icon { font-size: 20px; display: block; margin-bottom: 4px; }
    `;
    document.head.appendChild(s);
  }

  div.innerHTML = `
    <div class="ch-hero">
      <h1>⚖️ Coefficient de Charge</h1>
      <p>Calcul charges statiques + dynamiques — Eurocode 1 (EN 1991-1-1)</p>
    </div>

    <div class="ch-grid">

      <!-- ── PANNEAU SAISIE ── -->
      <div class="ch-panel">

        <div class="ch-section">📐 Zone à analyser</div>
        <div class="ch-row">
          <div>
            <div class="ch-label">Longueur</div>
            <div class="ch-input-wrap">
              <input type="number" id="ch-long" value="20" min="1" step="0.5" oninput="Charges.compute()">
              <span class="ch-unit">m</span>
            </div>
          </div>
          <div>
            <div class="ch-label">Largeur</div>
            <div class="ch-input-wrap">
              <input type="number" id="ch-larg" value="10" min="1" step="0.5" oninput="Charges.compute()">
              <span class="ch-unit">m</span>
            </div>
          </div>
        </div>
        <div class="ch-row">
          <div>
            <div class="ch-label">Hauteur libre</div>
            <div class="ch-input-wrap">
              <input type="number" id="ch-haut" value="5" min="1" step="0.5" oninput="Charges.compute()">
              <span class="ch-unit">m</span>
            </div>
          </div>
          <div>
            <div class="ch-label">Coefficient sécurité (γ)</div>
            <div class="ch-input-wrap">
              <input type="number" id="ch-gamma" value="1.35" min="1" max="2" step="0.05" oninput="Charges.compute()">
              <span class="ch-unit">—</span>
            </div>
          </div>
        </div>

        <div class="ch-section">🏗 Type de plancher existant</div>
        <div class="ch-plancher-grid" id="ch-plancher-grid">
          <button class="ch-plancher-btn active" data-type="beton" data-capacite="500" onclick="Charges.selectPlancher(this)">
            <span class="ch-pb-icon">🏢</span>Dalle béton<br><small>≤ 500 kg/m²</small>
          </button>
          <button class="ch-plancher-btn" data-type="beton-arme" data-capacite="1000" onclick="Charges.selectPlancher(this)">
            <span class="ch-pb-icon">🏭</span>Béton armé<br><small>≤ 1 000 kg/m²</small>
          </button>
          <button class="ch-plancher-btn" data-type="metal" data-capacite="800" onclick="Charges.selectPlancher(this)">
            <span class="ch-pb-icon">⚙️</span>Métallique<br><small>≤ 800 kg/m²</small>
          </button>
          <button class="ch-plancher-btn" data-type="bois" data-capacite="200" onclick="Charges.selectPlancher(this)">
            <span class="ch-pb-icon">🪵</span>Bois<br><small>≤ 200 kg/m²</small>
          </button>
          <button class="ch-plancher-btn" data-type="mezzanine" data-capacite="350" onclick="Charges.selectPlancher(this)">
            <span class="ch-pb-icon">🔩</span>Mezzanine<br><small>≤ 350 kg/m²</small>
          </button>
          <button class="ch-plancher-btn" data-type="inconnu" data-capacite="0" onclick="Charges.selectPlancher(this)">
            <span class="ch-pb-icon">❓</span>Inconnu<br><small>À étudier</small>
          </button>
        </div>

        <div class="ch-section">📦 Charges statiques</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:10px">
          Rayonnages, machines, stocks, équipements fixes
        </div>
        <div id="ch-statiques"></div>
        <button class="ch-add-btn" onclick="Charges.addStatique()">+ Ajouter une charge statique</button>

        <div class="ch-section">🚜 Charges dynamiques</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:10px">
          Chariots élévateurs, transpalettes, engins — coefficient d'impact appliqué automatiquement
        </div>
        <div id="ch-dynamiques"></div>
        <button class="ch-add-btn" onclick="Charges.addDynamique()">+ Ajouter une charge dynamique</button>

      </div>

      <!-- ── PANNEAU RÉSULTATS ── -->
      <div class="ch-panel">

        <div class="ch-section">📊 Résultats</div>
        <div id="ch-verdict">
          <div style="text-align:center;color:var(--text-tertiary);padding:40px 0;font-size:13px">
            Renseignez les charges pour voir l'analyse
          </div>
        </div>

        <div id="ch-stats" style="display:none">
          <div class="ch-section">🔢 Détail des calculs</div>
          <div id="ch-stats-body"></div>

          <div class="ch-section" style="margin-top:20px">💡 Recommandations</div>
          <div id="ch-recommandations" style="font-size:13px;line-height:1.6;color:var(--text-secondary)"></div>

          <div style="margin-top:20px;display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-primary" onclick="Charges.exportPDF()">
              📄 Exporter rapport PDF
            </button>
            <button class="btn btn-secondary" onclick="Charges.reset()">
              🔄 Nouvelle analyse
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  setTimeout(() => {
    Charges._statiques = [
      { label: 'Rayonnages métalliques', poids: 150, surface: 100 },
      { label: 'Stock palettes', poids: 800, surface: 50 },
    ];
    Charges._dynamiques = [
      { label: 'Chariot élévateur', poids: 3500, coeff: 2.0 },
    ];
    Charges._plancherCapacite = 500;
    Charges._plancherType = 'Dalle béton';
    Charges.renderStatiques();
    Charges.renderDynamiques();
    Charges.compute();
  }, 50);

  return div;
};

// ── Objet Charges ─────────────────────────────────────────────
const Charges = {
  _statiques: [],
  _dynamiques: [],
  _plancherCapacite: 500,
  _plancherType: 'Dalle béton',

  selectPlancher(btn) {
    document.querySelectorAll('.ch-plancher-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this._plancherCapacite = parseFloat(btn.dataset.capacite) || 0;
    this._plancherType = btn.querySelector('small') ? btn.innerText.split('\n')[0].trim() : btn.dataset.type;
    this.compute();
  },

  addStatique() {
    this._statiques.push({ label: 'Charge statique', poids: 500, surface: 10 });
    this.renderStatiques();
    this.compute();
  },

  addDynamique() {
    this._dynamiques.push({ label: 'Engin', poids: 2000, coeff: 1.5 });
    this.renderDynamiques();
    this.compute();
  },

  removeStatique(i) {
    this._statiques.splice(i, 1);
    this.renderStatiques();
    this.compute();
  },

  removeDynamique(i) {
    this._dynamiques.splice(i, 1);
    this.renderDynamiques();
    this.compute();
  },

  renderStatiques() {
    const el = document.getElementById('ch-statiques');
    if (!el) return;
    el.innerHTML = this._statiques.map((s, i) => `
      <div class="ch-row-3" id="ch-st-${i}">
        <div>
          <div class="ch-label">Désignation</div>
          <input class="form-control" style="font-size:12px" value="${s.label}"
            oninput="Charges._statiques[${i}].label=this.value">
        </div>
        <div>
          <div class="ch-label">Poids (kg)</div>
          <input type="number" class="form-control" style="font-size:12px" value="${s.poids}" min="0"
            oninput="Charges._statiques[${i}].poids=+this.value;Charges.compute()">
        </div>
        <div>
          <div class="ch-label">Surface (m²)</div>
          <input type="number" class="form-control" style="font-size:12px" value="${s.surface}" min="0.1" step="0.5"
            oninput="Charges._statiques[${i}].surface=+this.value;Charges.compute()">
        </div>
        <button class="ch-remove" onclick="Charges.removeStatique(${i})">✕</button>
      </div>
    `).join('');
  },

  renderDynamiques() {
    const el = document.getElementById('ch-dynamiques');
    if (!el) return;
    const coeffLabels = { 1.2:'1.2 — Transpalette', 1.5:'1.5 — Chariot léger', 2.0:'2.0 — Chariot élévateur', 2.5:'2.5 — Engin lourd' };
    el.innerHTML = this._dynamiques.map((d, i) => `
      <div class="ch-row-3" id="ch-dy-${i}">
        <div>
          <div class="ch-label">Désignation</div>
          <input class="form-control" style="font-size:12px" value="${d.label}"
            oninput="Charges._dynamiques[${i}].label=this.value">
        </div>
        <div>
          <div class="ch-label">Poids (kg)</div>
          <input type="number" class="form-control" style="font-size:12px" value="${d.poids}" min="0" step="100"
            oninput="Charges._dynamiques[${i}].poids=+this.value;Charges.compute()">
        </div>
        <div>
          <div class="ch-label">Coeff. impact</div>
          <select class="form-control" style="font-size:12px"
            onchange="Charges._dynamiques[${i}].coeff=+this.value;Charges.compute()">
            ${Object.entries(coeffLabels).map(([v,l]) =>
              `<option value="${v}" ${d.coeff==v?'selected':''}>${l}</option>`
            ).join('')}
          </select>
        </div>
        <button class="ch-remove" onclick="Charges.removeDynamique(${i})">✕</button>
      </div>
    `).join('');
  },

  compute() {
    const long  = parseFloat(document.getElementById('ch-long')?.value) || 0;
    const larg  = parseFloat(document.getElementById('ch-larg')?.value) || 0;
    const gamma = parseFloat(document.getElementById('ch-gamma')?.value) || 1.35;
    const surface = long * larg;
    if (surface <= 0) return;

    let chargeStatKgM2 = 0;
    this._statiques.forEach(s => {
      if (s.surface > 0) chargeStatKgM2 += s.poids / s.surface;
    });

    let chargeDynKgM2 = 0;
    this._dynamiques.forEach(d => {
      if (surface > 0) chargeDynKgM2 += (d.poids * d.coeff) / surface;
    });

    const chargeCaract  = chargeStatKgM2 + chargeDynKgM2;
    const chargeDesign  = chargeCaract * gamma;
    const capacite      = this._plancherCapacite;

    let verdict, cssClass, icon, recommandations;
    if (capacite === 0) {
      verdict = 'Capacité inconnue — expertise requise';
      cssClass = 'warn';
      icon = '❓';
      recommandations = "Le type de plancher sélectionné nécessite une expertise structurelle préalable. Faites appel à un bureau d'études avant toute installation.";
    } else if (chargeDesign <= capacite * 0.8) {
      verdict = 'Plancher conforme — charges acceptables';
      cssClass = 'ok';
      icon = '✅';
      recommandations = `La charge de calcul (${Math.round(chargeDesign)} kg/m²) représente ${Math.round(chargeDesign/capacite*100)}% de la capacité nominale. Marge de sécurité suffisante. Aucune intervention structurelle nécessaire.`;
    } else if (chargeDesign <= capacite) {
      verdict = 'Limite atteinte — surveillance recommandée';
      cssClass = 'warn';
      icon = '⚠️';
      recommandations = `La charge de calcul (${Math.round(chargeDesign)} kg/m²) dépasse 80% de la capacité nominale. Recommandations : répartir les charges sur une surface plus grande, limiter la circulation des engins lourds, faire vérifier la structure par un bureau d'études.`;
    } else {
      verdict = 'Dépassement — renforcement obligatoire';
      cssClass = 'fail';
      icon = '❌';
      recommandations = `ATTENTION : La charge de calcul (${Math.round(chargeDesign)} kg/m²) dépasse la capacité nominale du plancher (${capacite} kg/m²). Renforcement structurel obligatoire avant toute exploitation. Consultez impérativement un bureau d'études structure.`;
    }

    document.getElementById('ch-verdict').innerHTML = `
      <div class="ch-verdict ${cssClass}">
        <div class="ch-verdict-icon">${icon}</div>
        <div class="ch-verdict-title">${verdict}</div>
        <div class="ch-verdict-sub">Charge de calcul : ${Math.round(chargeDesign)} kg/m² / Capacité : ${capacite > 0 ? capacite + ' kg/m²' : 'inconnue'}</div>
      </div>
    `;

    document.getElementById('ch-stats').style.display = 'block';
    document.getElementById('ch-stats-body').innerHTML = `
      <div class="ch-stat"><span>Surface analysée</span><span class="ch-stat-val">${surface} m²</span></div>
      <div class="ch-stat"><span>Charge statique</span><span class="ch-stat-val">${Math.round(chargeStatKgM2)} kg/m²</span></div>
      <div class="ch-stat"><span>Charge dynamique (avec coeff. impact)</span><span class="ch-stat-val">${Math.round(chargeDynKgM2)} kg/m²</span></div>
      <div class="ch-stat"><span>Charge caractéristique (Qk)</span><span class="ch-stat-val">${Math.round(chargeCaract)} kg/m²</span></div>
      <div class="ch-stat"><span>Coefficient de sécurité γ</span><span class="ch-stat-val">${gamma}</span></div>
      <div class="ch-stat" style="font-weight:700"><span>Charge de calcul (Qd = Qk × γ)</span><span class="ch-stat-val" style="font-size:16px">${Math.round(chargeDesign)} kg/m²</span></div>
      <div class="ch-stat"><span>Capacité plancher (${this._plancherType})</span><span class="ch-stat-val">${capacite > 0 ? capacite + ' kg/m²' : 'inconnue'}</span></div>
      <div class="ch-stat"><span>Taux de charge</span><span class="ch-stat-val">${capacite > 0 ? Math.round(chargeDesign/capacite*100) + '%' : '—'}</span></div>
    `;
    document.getElementById('ch-recommandations').innerHTML = recommandations;

    this._lastResult = { long, larg, surface, gamma, chargeStatKgM2, chargeDynKgM2,
      chargeCaract, chargeDesign, capacite, verdict, cssClass, recommandations };
  },

  exportPDF() {
    const r = this._lastResult;
    if (!r) return;
    const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    const entreprise = config.nom || 'AATB';
    const adresse = config.adresse || '';
    const date = new Date().toLocaleDateString('fr-FR');

    const verdictColor = r.cssClass === 'ok' ? '#10b981' : r.cssClass === 'warn' ? '#f59e0b' : '#ef4444';
    const verdictIcon  = r.cssClass === 'ok' ? '✅' : r.cssClass === 'warn' ? '⚠️' : '❌';

    const lignesStatiques = this._statiques.map(s =>
      `<tr><td>${s.label}</td><td>${s.poids} kg</td><td>${s.surface} m²</td><td><b>${Math.round(s.poids/s.surface)} kg/m²</b></td></tr>`
    ).join('');

    const lignesDynamiques = this._dynamiques.map(d =>
      `<tr><td>${d.label}</td><td>${d.poids} kg</td><td>× ${d.coeff}</td><td><b>${Math.round(d.poids*d.coeff/r.surface)} kg/m²</b></td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Rapport Coefficient de Charge — ${entreprise}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a2e; margin: 0; padding: 30px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start;
        padding-bottom: 20px; border-bottom: 3px solid #4F8EF7; margin-bottom: 24px; }
      .header-title { font-size: 22px; font-weight: 800; color: #4F8EF7; }
      .header-sub { font-size: 12px; color: #666; margin-top: 4px; }
      .header-right { text-align: right; font-size: 12px; color: #666; }
      .verdict-box { border-radius: 8px; padding: 16px 20px; margin: 20px 0;
        border: 2px solid ${verdictColor}; background: ${verdictColor}18; }
      .verdict-title { font-size: 18px; font-weight: 700; color: ${verdictColor}; }
      .verdict-sub { font-size: 13px; color: #444; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th { background: #4F8EF7; color: #fff; padding: 8px 10px; text-align: left; font-size: 12px; }
      td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
      tr:nth-child(even) td { background: #f8f9ff; }
      .section-title { font-size: 13px; font-weight: 700; color: #4F8EF7;
        text-transform: uppercase; letter-spacing: .05em; margin: 20px 0 8px;
        padding-bottom: 4px; border-bottom: 1px solid #4F8EF7; }
      .recap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
      .recap-item { background: #f8f9ff; border-radius: 6px; padding: 10px 14px; }
      .recap-label { font-size: 11px; color: #888; margin-bottom: 2px; }
      .recap-value { font-size: 16px; font-weight: 700; color: #1a1a2e; }
      .recommandations { background: #fffbeb; border-left: 4px solid ${verdictColor};
        padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 12px; line-height: 1.7; }
      .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd;
        font-size: 11px; color: #888; display: flex; justify-content: space-between; }
      .ref { font-size: 11px; color: #888; font-style: italic; margin-top: 8px; }
      @media print { body { padding: 15px; } }
    </style></head><body>
    <div class="header">
      <div>
        <div class="header-title">⚖️ Rapport Coefficient de Charge</div>
        <div class="header-sub">Analyse structurelle — Eurocode 1 (EN 1991-1-1)</div>
      </div>
      <div class="header-right"><b>${entreprise}</b><br>${adresse}<br>Date : ${date}</div>
    </div>
    <div class="verdict-box">
      <div class="verdict-title">${verdictIcon} ${r.verdict}</div>
      <div class="verdict-sub">Charge de calcul : <b>${Math.round(r.chargeDesign)} kg/m²</b> — Capacité plancher : <b>${r.capacite > 0 ? r.capacite + ' kg/m²' : 'inconnue'}</b> — Taux : <b>${r.capacite > 0 ? Math.round(r.chargeDesign/r.capacite*100) + '%' : '—'}</b></div>
    </div>
    <div class="section-title">Zone analysée</div>
    <div class="recap-grid">
      <div class="recap-item"><div class="recap-label">Dimensions</div><div class="recap-value">${r.long} × ${r.larg} m</div></div>
      <div class="recap-item"><div class="recap-label">Surface totale</div><div class="recap-value">${r.surface} m²</div></div>
      <div class="recap-item"><div class="recap-label">Type de plancher</div><div class="recap-value">${this._plancherType}</div></div>
      <div class="recap-item"><div class="recap-label">Coeff. sécurité (γ)</div><div class="recap-value">${r.gamma}</div></div>
    </div>
    <div class="section-title">Charges statiques</div>
    <table><thead><tr><th>Désignation</th><th>Poids total</th><th>Surface</th><th>Charge linéaire</th></tr></thead>
    <tbody>${lignesStatiques || '<tr><td colspan="4" style="color:#888;font-style:italic">Aucune charge statique</td></tr>'}</tbody></table>
    <div class="section-title">Charges dynamiques</div>
    <table><thead><tr><th>Désignation</th><th>Poids engin</th><th>Coeff. impact</th><th>Charge ramenée au m²</th></tr></thead>
    <tbody>${lignesDynamiques || '<tr><td colspan="4" style="color:#888;font-style:italic">Aucune charge dynamique</td></tr>'}</tbody></table>
    <div class="section-title">Récapitulatif des calculs</div>
    <table><tbody>
      <tr><td>Charge statique totale</td><td><b>${Math.round(r.chargeStatKgM2)} kg/m²</b></td></tr>
      <tr><td>Charge dynamique totale (avec coeff. impact)</td><td><b>${Math.round(r.chargeDynKgM2)} kg/m²</b></td></tr>
      <tr><td>Charge caractéristique Qk</td><td><b>${Math.round(r.chargeCaract)} kg/m²</b></td></tr>
      <tr><td>Coefficient de sécurité γ (Eurocode)</td><td><b>${r.gamma}</b></td></tr>
      <tr style="background:#4F8EF720"><td><b>Charge de calcul Qd = Qk × γ</b></td><td><b style="font-size:15px">${Math.round(r.chargeDesign)} kg/m²</b></td></tr>
    </tbody></table>
    <div class="section-title">Recommandations</div>
    <div class="recommandations">${r.recommandations}</div>
    <div class="ref">Référence normative : Eurocode 1 — Actions sur les structures — EN 1991-1-1 : Poids volumiques, poids propres et surcharges d'exploitation des bâtiments.</div>
    <div class="footer">
      <span>Rapport généré par PlaqPro+ — ${entreprise}</span>
      <span>Document établi à titre indicatif — Ne remplace pas une expertise structurelle certifiée</span>
    </div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  },

  reset() {
    this._statiques = [];
    this._dynamiques = [];
    this.renderStatiques();
    this.renderDynamiques();
    document.getElementById('ch-verdict').innerHTML = '<div style="text-align:center;color:var(--text-tertiary);padding:40px 0;font-size:13px">Renseignez les charges pour voir l\'analyse</div>';
    document.getElementById('ch-stats').style.display = 'none';
  }
};
