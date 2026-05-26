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

// ── Module Charges & Coûts — Rétro-calcul ─────────────────────────────────────
Pages.chargesCouts = function() {
  const div = document.createElement('div');
  const charges = JSON.parse(localStorage.getItem('plaqpro_charges') || '{}');

  if (!document.getElementById('style-chargescouts')) {
    const s = document.createElement('style');
    s.id = 'style-chargescouts';
    s.textContent = `
      .cc-hero { background: linear-gradient(135deg,#059669 0%,#10b981 100%);
        border-radius:var(--radius-lg);padding:28px;margin-bottom:24px;color:#fff; }
      .cc-hero h1 { font-size:22px;font-weight:800;margin-bottom:4px; }
      .cc-hero p  { font-size:13px;opacity:.85; }
      .cc-grid { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
      @media(max-width:768px){ .cc-grid { grid-template-columns:1fr; } }
      .cc-panel { background:var(--bg-secondary);border:1px solid var(--border);
        border-radius:var(--radius-lg);padding:22px; }
      .cc-section { font-size:11px;font-weight:700;text-transform:uppercase;
        letter-spacing:.08em;color:var(--text-tertiary);padding-bottom:8px;
        border-bottom:1px solid var(--border);margin:16px 0 12px; }
      .cc-section:first-child { margin-top:0; }
      .cc-row { display:flex;align-items:center;justify-content:space-between;
        padding:8px 0;border-bottom:1px solid var(--border);gap:12px; }
      .cc-row:last-child { border:none; }
      .cc-label { font-size:13px;color:var(--text-secondary);flex:1; }
      .cc-input { width:120px;padding:6px 10px;background:var(--bg-primary);
        border:1px solid var(--border);border-radius:var(--radius-sm);
        color:var(--text-primary);font-size:13px;text-align:right; }
      .cc-input:focus { outline:none;border-color:#10b981; }
      .cc-unit { font-size:12px;color:var(--text-tertiary);width:40px;text-align:left; }
      .cc-result { background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);
        border-radius:var(--radius-lg);padding:22px;margin-top:20px; }
      .cc-result-title { font-size:14px;font-weight:700;color:#10b981;margin-bottom:16px; }
      .cc-kpi-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:12px; }
      @media(max-width:600px){ .cc-kpi-grid { grid-template-columns:1fr; } }
      .cc-kpi { background:var(--bg-secondary);border:1px solid var(--border);
        border-radius:var(--radius-md);padding:16px;text-align:center; }
      .cc-kpi-val { font-size:28px;font-weight:900;letter-spacing:-0.03em;
        color:#10b981;margin-bottom:4px; }
      .cc-kpi-val.warn { color:#f59e0b; }
      .cc-kpi-val.danger { color:#ef4444; }
      .cc-kpi-label { font-size:11px;color:var(--text-tertiary);text-transform:uppercase;
        letter-spacing:0.06em; }
      .cc-alert { border-radius:var(--radius-md);padding:12px 16px;font-size:12px;
        margin-top:12px;line-height:1.6; }
      .cc-alert.ok     { background:rgba(16,185,129,0.08);border-left:3px solid #10b981; }
      .cc-alert.warn   { background:rgba(245,158,11,0.08);border-left:3px solid #f59e0b; }
      .cc-alert.danger { background:rgba(239,68,68,0.08);border-left:3px solid #ef4444; }
      .cc-retroalc { background:rgba(79,142,247,0.06);border:1px solid rgba(79,142,247,0.2);
        border-radius:var(--radius-lg);padding:22px;margin-bottom:20px; }
      .cc-retroalc-title { font-size:15px;font-weight:700;color:var(--accent);margin-bottom:16px; }
    `;
    document.head.appendChild(s);
  }

  const d = {
    caAnnuel:       charges.caAnnuel       || 0,
    resultatNet:    charges.resultatNet     || 0,
    nbSalaries:     charges.nbSalaries      || 1,
    heuresAn:       charges.heuresAn        || 1600,
    vehicule:       charges.vehicule        || 0,
    outillage:      charges.outillage       || 0,
    local:          charges.local           || 0,
    assurances:     charges.assurances      || 0,
    telephone:      charges.telephone       || 0,
    comptable:      charges.comptable       || 0,
    autresCharges:  charges.autresCharges   || 0,
    margePercent:   charges.margePercent    || 35,
    coeffMateriaux: charges.coeffMateriaux  || 1.20,
  };

  function _calcul(data) {
    const charges_totales = data.caAnnuel - data.resultatNet;
    const heures_totales  = data.nbSalaries * data.heuresAn;
    const cout_horaire    = heures_totales > 0 ? charges_totales / heures_totales : 0;
    const prix_vente_min  = cout_horaire * (1 + data.margePercent / 100);
    const taux_charges    = data.caAnnuel > 0 ? (charges_totales / data.caAnnuel * 100) : 0;
    const productivite    = heures_totales > 0 ? data.caAnnuel / heures_totales : 0;
    return { charges_totales, heures_totales, cout_horaire, prix_vente_min, taux_charges, productivite };
  }

  function _fmt(n)  { return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(n); }
  function _fmtE(n) { return _fmt(n) + ' €'; }

  function _renderResultat(data) {
    const el = document.getElementById('cc-resultats');
    if (!el) return;
    const r = _calcul(data);
    let alertClass = 'ok', alertMsg = '';
    if (r.taux_charges > 80) {
      alertClass = 'danger';
      alertMsg = '🔴 Taux de charges > 80% — rentabilité très faible. Revoir les prix de vente.';
    } else if (r.taux_charges > 65) {
      alertClass = 'warn';
      alertMsg = '⚠️ Taux de charges élevé (' + _fmt(r.taux_charges) + '%). Marge insuffisante.';
    } else if (r.taux_charges > 0) {
      alertMsg = '✅ Taux de charges correct (' + _fmt(r.taux_charges) + '%). Structure financière saine.';
    }
    el.innerHTML = `
      <div class="cc-result">
        <div class="cc-result-title">📊 Résultats du rétro-calcul</div>
        <div class="cc-kpi-grid">
          <div class="cc-kpi">
            <div class="cc-kpi-val ${r.cout_horaire > 60 ? 'warn' : ''}">${_fmt(r.cout_horaire)} €</div>
            <div class="cc-kpi-label">Coût horaire réel</div>
          </div>
          <div class="cc-kpi">
            <div class="cc-kpi-val">${_fmt(r.prix_vente_min)} €</div>
            <div class="cc-kpi-label">Tarif horaire min.</div>
          </div>
          <div class="cc-kpi">
            <div class="cc-kpi-val ${r.taux_charges > 70 ? 'danger' : r.taux_charges > 55 ? 'warn' : ''}">${_fmt(r.taux_charges)} %</div>
            <div class="cc-kpi-label">Taux de charges</div>
          </div>
          <div class="cc-kpi">
            <div class="cc-kpi-val">${_fmtE(r.charges_totales)}</div>
            <div class="cc-kpi-label">Charges totales/an</div>
          </div>
          <div class="cc-kpi">
            <div class="cc-kpi-val">${_fmt(r.heures_totales)} h</div>
            <div class="cc-kpi-label">Heures facturables/an</div>
          </div>
          <div class="cc-kpi">
            <div class="cc-kpi-val">${_fmt(r.productivite)} €</div>
            <div class="cc-kpi-label">CA/heure produite</div>
          </div>
        </div>
        ${alertMsg ? `<div class="cc-alert ${alertClass}" style="margin-top:16px">${alertMsg}</div>` : ''}
        <div style="margin-top:16px;padding:14px;background:var(--bg-primary);border-radius:var(--radius-md);font-size:13px;line-height:1.8">
          <strong>💡 Pour vos devis :</strong><br>
          • Main d'œuvre : <strong>${_fmt(r.prix_vente_min)} €/h minimum</strong><br>
          • Matériaux : prix achat × <strong>${_fmt(data.coeffMateriaux)}</strong> (coeff. ${_fmt((data.coeffMateriaux-1)*100)}% marge)<br>
          • Seuil rentabilité journée 8h : <strong>${_fmtE(r.prix_vente_min * 8)}</strong>
        </div>
      </div>
    `;
    if (typeof DB !== 'undefined') {
      const cfg = DB.getConfig();
      cfg.coutHoraire      = r.cout_horaire;
      cfg.prixVenteHoraire = r.prix_vente_min;
      cfg.coeffMateriaux   = data.coeffMateriaux;
      DB.saveConfig(cfg);
    }
  }

  div.innerHTML = `
    <div class="cc-hero">
      <h1>💰 Mes Charges & Coûts</h1>
      <p>Rétro-calcul depuis votre réel — pour des devis rentables</p>
    </div>

    <div class="cc-retroalc">
      <div class="cc-retroalc-title">📈 Rétro-calcul depuis votre activité réelle</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
        <div>
          <div class="cc-row">
            <span class="cc-label">💼 CA annuel HT</span>
            <input type="number" class="cc-input" id="cc-ca" value="${d.caAnnuel}" placeholder="180000" oninput="CHG.recalculer()">
            <span class="cc-unit">€/an</span>
          </div>
          <div class="cc-row">
            <span class="cc-label">✅ Résultat net</span>
            <input type="number" class="cc-input" id="cc-rn" value="${d.resultatNet}" placeholder="35000" oninput="CHG.recalculer()">
            <span class="cc-unit">€/an</span>
          </div>
        </div>
        <div>
          <div class="cc-row">
            <span class="cc-label">👥 Nombre de salariés</span>
            <input type="number" class="cc-input" id="cc-sal" value="${d.nbSalaries}" min="1" max="50" oninput="CHG.recalculer()">
            <span class="cc-unit">pers.</span>
          </div>
          <div class="cc-row">
            <span class="cc-label">⏱️ Heures travaillées/an/pers.</span>
            <input type="number" class="cc-input" id="cc-h" value="${d.heuresAn}" placeholder="1600" oninput="CHG.recalculer()">
            <span class="cc-unit">h</span>
          </div>
        </div>
      </div>
    </div>

    <div class="cc-grid">
      <div class="cc-panel">
        <div class="cc-section">🚗 Charges fixes mensuelles</div>
        <div class="cc-row"><span class="cc-label">Véhicule (leasing + assurance + carburant)</span>
          <input type="number" class="cc-input" id="cc-veh" value="${d.vehicule}" oninput="CHG.recalculer()">
          <span class="cc-unit">€/mois</span></div>
        <div class="cc-row"><span class="cc-label">Outillage & amortissement</span>
          <input type="number" class="cc-input" id="cc-out" value="${d.outillage}" oninput="CHG.recalculer()">
          <span class="cc-unit">€/mois</span></div>
        <div class="cc-row"><span class="cc-label">Local / stockage / entrepôt</span>
          <input type="number" class="cc-input" id="cc-loc" value="${d.local}" oninput="CHG.recalculer()">
          <span class="cc-unit">€/mois</span></div>
        <div class="cc-row"><span class="cc-label">Assurances (RC Pro + décennale)</span>
          <input type="number" class="cc-input" id="cc-ass" value="${d.assurances}" oninput="CHG.recalculer()">
          <span class="cc-unit">€/mois</span></div>
        <div class="cc-row"><span class="cc-label">Téléphone + internet</span>
          <input type="number" class="cc-input" id="cc-tel" value="${d.telephone}" oninput="CHG.recalculer()">
          <span class="cc-unit">€/mois</span></div>
        <div class="cc-row"><span class="cc-label">Expert-comptable</span>
          <input type="number" class="cc-input" id="cc-cpt" value="${d.comptable}" oninput="CHG.recalculer()">
          <span class="cc-unit">€/mois</span></div>
        <div class="cc-row"><span class="cc-label">Autres charges fixes</span>
          <input type="number" class="cc-input" id="cc-aut" value="${d.autresCharges}" oninput="CHG.recalculer()">
          <span class="cc-unit">€/mois</span></div>
      </div>

      <div class="cc-panel">
        <div class="cc-section">⚙️ Paramètres devis</div>
        <div class="cc-row"><span class="cc-label">Marge bénéficiaire souhaitée</span>
          <input type="number" class="cc-input" id="cc-marge" value="${d.margePercent}" min="0" max="100" oninput="CHG.recalculer()">
          <span class="cc-unit">%</span></div>
        <div class="cc-row"><span class="cc-label">Coefficient matériaux</span>
          <input type="number" class="cc-input" id="cc-coeff" value="${d.coeffMateriaux}" min="1" max="3" step="0.05" oninput="CHG.recalculer()">
          <span class="cc-unit">×</span></div>
        <div style="margin-top:12px;padding:12px;background:var(--bg-primary);border-radius:var(--radius-md);font-size:12px;color:var(--text-tertiary);line-height:1.7">
          <strong style="color:var(--text-primary)">ℹ️ Coefficient matériaux</strong><br>
          1.20 = vous vendez les matériaux 20% plus cher que votre prix d'achat.<br>
          Couvre : transport, stockage, pertes, marge commerciale.
        </div>
        <div class="cc-section" style="margin-top:20px">📅 Référence heures</div>
        <div style="font-size:12px;color:var(--text-tertiary);line-height:1.8;padding:10px;background:var(--bg-primary);border-radius:var(--radius-md)">
          Référence France artisan :<br>
          • 218 jours travaillés/an (hors congés, jours fériés)<br>
          • ~7.3h productives/jour = <strong>1600h/an</strong><br>
          • Auto-entrepreneur : souvent 1400-1800h selon activité
        </div>
        <div class="cc-section" style="margin-top:20px">💾 Actions</div>
        <div style="display:flex;gap:8px;flex-direction:column">
          <button class="btn btn-primary" onclick="CHG.sauvegarder()" style="width:100%">💾 Sauvegarder mes paramètres</button>
          <button class="btn btn-secondary" onclick="CHG.reinitialiser()" style="width:100%">🔄 Réinitialiser</button>
        </div>
      </div>
    </div>

    <div id="cc-resultats"></div>
  `;

  window.CHG = {
    getData() {
      return {
        caAnnuel:       parseFloat(document.getElementById('cc-ca')?.value)    || 0,
        resultatNet:    parseFloat(document.getElementById('cc-rn')?.value)    || 0,
        nbSalaries:     parseInt(document.getElementById('cc-sal')?.value)     || 1,
        heuresAn:       parseFloat(document.getElementById('cc-h')?.value)     || 1600,
        vehicule:       parseFloat(document.getElementById('cc-veh')?.value)   || 0,
        outillage:      parseFloat(document.getElementById('cc-out')?.value)   || 0,
        local:          parseFloat(document.getElementById('cc-loc')?.value)   || 0,
        assurances:     parseFloat(document.getElementById('cc-ass')?.value)   || 0,
        telephone:      parseFloat(document.getElementById('cc-tel')?.value)   || 0,
        comptable:      parseFloat(document.getElementById('cc-cpt')?.value)   || 0,
        autresCharges:  parseFloat(document.getElementById('cc-aut')?.value)   || 0,
        margePercent:   parseFloat(document.getElementById('cc-marge')?.value) || 35,
        coeffMateriaux: parseFloat(document.getElementById('cc-coeff')?.value) || 1.20,
      };
    },
    recalculer() { _renderResultat(this.getData()); },
    sauvegarder() {
      const data = this.getData();
      localStorage.setItem('plaqpro_charges', JSON.stringify(data));
      this.recalculer();
      App.toast('✅ Paramètres sauvegardés !', 'success');
    },
    reinitialiser() {
      if (!confirm('Réinitialiser tous les paramètres ?')) return;
      localStorage.removeItem('plaqpro_charges');
      App.navigate('chargesCouts');
      App.toast('Paramètres réinitialisés', 'success');
    },
  };

  setTimeout(() => _renderResultat(d), 50);
  return div;
};
