/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO+ — Déperditions Thermiques & Épaisseur Isolant
//  Calcul U, R, déperditions pièce — RE2020
// ============================================================

Pages.thermique = function() {
  const div = document.createElement('div');

  if (!document.getElementById('style-thermique')) {
    const s = document.createElement('style');
    s.id = 'style-thermique';
    s.textContent = `
      .th-hero { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; color: #fff; }
      .th-hero h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      .th-hero p  { font-size: 13px; opacity: .8; margin: 0; }
      .th-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media(max-width:768px){ .th-grid { grid-template-columns: 1fr; } }
      .th-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 20px; }
      .th-section { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary); padding-bottom: 8px;
        border-bottom: 1px solid var(--border); margin: 16px 0 12px; }
      .th-section:first-child { margin-top: 0; }
      .th-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
      .th-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
      .th-input-wrap { position: relative; margin-bottom: 4px; }
      .th-input-wrap input, .th-input-wrap select {
        width: 100%; padding: 8px 40px 8px 10px;
        background: var(--bg-primary); border: 1px solid var(--border);
        border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px; }
      .th-input-wrap .th-unit { position: absolute; right: 8px; top: 50%;
        transform: translateY(-50%); font-size: 11px; color: var(--text-tertiary); pointer-events: none; }
      .th-stat { display: flex; justify-content: space-between; align-items: center;
        padding: 9px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
      .th-stat:last-child { border: none; }
      .th-stat-val { font-weight: 700; color: var(--accent); }
      .th-stat-val.ok   { color: #10b981; }
      .th-stat-val.warn { color: #f59e0b; }
      .th-stat-val.fail { color: #ef4444; }
      .th-paroi-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 8px;
        align-items: end; margin-bottom: 8px; }
      .th-paroi-head { font-size: 11px; color: var(--text-tertiary); font-weight: 600; margin-bottom: 4px; }
      .th-add-btn { background: var(--bg-primary); border: 1px dashed var(--border);
        border-radius: var(--radius-sm); padding: 8px; width: 100%; cursor: pointer;
        color: var(--text-tertiary); font-size: 12px; margin-top: 6px; }
      .th-add-btn:hover { border-color: #0ea5e9; color: #0ea5e9; }
      .th-remove { background: none; border: none; color: #ef4444; cursor: pointer;
        font-size: 16px; padding: 4px 8px; border-radius: var(--radius-sm); }
      .th-isolant-card { border: 2px solid var(--border); border-radius: var(--radius-md);
        padding: 12px; margin-bottom: 8px; }
      .th-isolant-card.ok   { border-color: #10b981; background: rgba(16,185,129,.06); }
      .th-isolant-card.warn { border-color: #f59e0b; background: rgba(245,158,11,.06); }
      .th-isolant-card.fail { border-color: #ef4444; background: rgba(239,68,68,.06); }
      .th-verdict { border-radius: var(--radius-md); padding: 16px; margin-bottom: 14px; text-align: center; }
      .th-verdict.ok   { background: rgba(16,185,129,.1);  border: 2px solid #10b981; }
      .th-verdict.warn { background: rgba(245,158,11,.1);  border: 2px solid #f59e0b; }
      .th-verdict.fail { background: rgba(239,68,68,.1);   border: 2px solid #ef4444; }
    `;
    document.head.appendChild(s);
  }

  // Isolants courants avec lambda (W/m·K)
  const ISOLANTS = [
    { nom:'Laine de verre (LV)',        lambda:0.032, unite:'mm', re2020:true  },
    { nom:'Laine de roche (LR)',        lambda:0.035, unite:'mm', re2020:true  },
    { nom:'Polystyrène expansé (PSE)',  lambda:0.038, unite:'mm', re2020:true  },
    { nom:'Polystyrène extrudé (XPS)',  lambda:0.033, unite:'mm', re2020:true  },
    { nom:'Polyuréthane (PUR)',         lambda:0.025, unite:'mm', re2020:true  },
    { nom:'Ouate de cellulose',         lambda:0.040, unite:'mm', re2020:true  },
    { nom:'Fibre de bois',              lambda:0.042, unite:'mm', re2020:true  },
    { nom:'Liège expansé',             lambda:0.045, unite:'mm', re2020:false },
    { nom:'Laine de chanvre',           lambda:0.040, unite:'mm', re2020:true  },
  ];

  // Parois types avec U de base (W/m²·K)
  const PAROIS_DEFAUT = [
    { nom:'Mur extérieur', surface:20, u:0.35, type:'mur' },
    { nom:'Plancher bas',  surface:24, u:0.25, type:'plancher' },
    { nom:'Toiture/Combles', surface:24, u:0.15, type:'toiture' },
    { nom:'Fenêtres double vitrage', surface:4, u:1.4, type:'vitrage' },
  ];

  div.innerHTML = `
    <div class="th-hero">
      <h1>🌡️ Déperditions Thermiques & Isolant</h1>
      <p>Calcul des déperditions par paroi — Épaisseur isolant RE2020</p>
    </div>

    <div class="th-grid">
      <div class="th-panel">

        <div class="th-section">🏠 Conditions climatiques</div>
        <div class="th-row">
          <div>
            <div class="th-label">Température intérieure</div>
            <div class="th-input-wrap">
              <input type="number" id="th-ti" value="20" min="15" max="26" step="1" oninput="Therm.compute()">
              <span class="th-unit">°C</span>
            </div>
          </div>
          <div>
            <div class="th-label">Température extérieure base</div>
            <div class="th-input-wrap">
              <input type="number" id="th-te" value="-7" min="-20" max="10" step="1" oninput="Therm.compute()">
              <span class="th-unit">°C</span>
            </div>
          </div>
        </div>
        <div class="th-row">
          <div>
            <div class="th-label">Zone climatique</div>
            <div class="th-input-wrap">
              <select id="th-zone" onchange="Therm.setZone()">
                <option value="H1a">H1a — Nord (−12°C)</option>
                <option value="H1b">H1b — Nord-Est (−15°C)</option>
                <option value="H1c">H1c — Île-de-France (−10°C)</option>
                <option value="H2a" selected>H2a — Centre-Ouest (−7°C)</option>
                <option value="H2b">H2b — Centre (−8°C)</option>
                <option value="H2c">H2c — Rhône-Alpes (−7°C)</option>
                <option value="H2d">H2d — Méditerranée (−4°C)</option>
                <option value="H3">H3 — DROM-COM (0°C)</option>
              </select>
            </div>
          </div>
          <div>
            <div class="th-label">Type de bâtiment</div>
            <div class="th-input-wrap">
              <select id="th-batiment" onchange="Therm.compute()">
                <option value="logement">Logement</option>
                <option value="bureau">Bureau</option>
                <option value="erp">ERP</option>
              </select>
            </div>
          </div>
        </div>

        <div class="th-section">🧱 Parois (surfaces & coefficients U)</div>
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin-bottom:6px">
          <div class="th-paroi-head">Paroi</div>
          <div class="th-paroi-head">Surface m²</div>
          <div class="th-paroi-head">U W/m²·K</div>
          <div></div>
        </div>
        <div id="th-parois"></div>
        <button class="th-add-btn" onclick="Therm.addParoi()">+ Ajouter une paroi</button>

        <div class="th-section">🔥 Calcul épaisseur isolant</div>
        <div class="th-row">
          <div>
            <div class="th-label">Type d'isolant</div>
            <div class="th-input-wrap">
              <select id="th-isolant" onchange="Therm.compute()">
                ${ISOLANTS.map((iso,i) => `<option value="${i}">${iso.nom} (λ=${iso.lambda})</option>`).join('')}
              </select>
            </div>
          </div>
          <div>
            <div class="th-label">R cible (résistance voulue)</div>
            <div class="th-input-wrap">
              <input type="number" id="th-r-cible" value="4.5" min="1" max="10" step="0.1" oninput="Therm.compute()">
              <span class="th-unit">m²·K/W</span>
            </div>
          </div>
        </div>

      </div>

      <div class="th-panel">
        <div class="th-section">📊 Résultats</div>
        <div id="th-verdict-box"></div>
        <div id="th-resultats">
          <div style="text-align:center;color:var(--text-tertiary);padding:30px 0;font-size:13px">
            Renseignez les parois pour voir les résultats
          </div>
        </div>
        <div id="th-actions" style="display:none;margin-top:16px">
          <button class="btn btn-primary" style="width:100%;margin-bottom:8px" onclick="Therm.exportPDF()">
            📄 Exporter rapport PDF
          </button>
          <button class="btn btn-secondary" style="width:100%" onclick="Therm.reset()">
            🔄 Réinitialiser
          </button>
        </div>
      </div>
    </div>
  `;

  window.Therm._isolants = ISOLANTS;
  window.Therm._parois = PAROIS_DEFAUT.map(p => ({...p}));

  setTimeout(() => {
    Therm.renderParois();
    Therm.compute();
  }, 50);

  return div;
};

const Therm = {
  _parois: [],
  _isolants: [],

  setZone() {
    const zones = { H1a:-12, H1b:-15, H1c:-10, H2a:-7, H2b:-8, H2c:-7, H2d:-4, H3:0 };
    const zone = document.getElementById('th-zone')?.value;
    const el = document.getElementById('th-te');
    if (el && zones[zone] !== undefined) { el.value = zones[zone]; this.compute(); }
  },

  addParoi() {
    this._parois.push({ nom:'Nouvelle paroi', surface:10, u:0.3, type:'mur' });
    this.renderParois();
    this.compute();
  },

  removeParoi(i) {
    this._parois.splice(i, 1);
    this.renderParois();
    this.compute();
  },

  renderParois() {
    const el = document.getElementById('th-parois');
    if (!el) return;
    el.innerHTML = this._parois.map((p, i) => `
      <div class="th-paroi-row">
        <input class="form-control" style="font-size:12px" value="${p.nom}"
          oninput="Therm._parois[${i}].nom=this.value">
        <input type="number" class="form-control" style="font-size:12px" value="${p.surface}" min="0.1" step="0.5"
          oninput="Therm._parois[${i}].surface=+this.value;Therm.compute()">
        <input type="number" class="form-control" style="font-size:12px" value="${p.u}" min="0.05" max="5" step="0.01"
          oninput="Therm._parois[${i}].u=+this.value;Therm.compute()">
        <button class="th-remove" onclick="Therm.removeParoi(${i})">✕</button>
      </div>
    `).join('');
  },

  compute() {
    const ti = parseFloat(document.getElementById('th-ti')?.value) || 20;
    const te = parseFloat(document.getElementById('th-te')?.value) || -7;
    const deltaT = ti - te;
    const isolantIdx = parseInt(document.getElementById('th-isolant')?.value) || 0;
    const rCible = parseFloat(document.getElementById('th-r-cible')?.value) || 4.5;
    const isolant = this._isolants[isolantIdx];

    if (!isolant || this._parois.length === 0) return;

    // Calcul déperditions par paroi
    let depTotale = 0;
    const details = this._parois.map(p => {
      const dep = p.u * p.surface * deltaT;
      depTotale += dep;
      return { ...p, dep, depM2: p.u * deltaT };
    });

    // Puissance chauffage estimée (majoration 20% ponts thermiques)
    const puissanceChauffage = depTotale * 1.2;

    // Épaisseur isolant pour atteindre R cible
    const epaisseurMm = Math.ceil(rCible * isolant.lambda * 1000);

    // U après isolation (mur béton 20cm U=1.5 + isolant)
    const uApresIso = 1 / (rCible + 0.17); // 0.17 = Rsi + Rse

    // Exigences RE2020 par zone
    const re2020 = {
      mur:      { label:'Mur extérieur',    uMax:0.36 },
      plancher: { label:'Plancher bas',     uMax:0.25 },
      toiture:  { label:'Toiture/Combles', uMax:0.15 },
      vitrage:  { label:'Vitrage',          uMax:1.30 },
    };

    // Verdict global
    const nonConformes = this._parois.filter(p => {
      const req = re2020[p.type];
      return req && p.u > req.uMax;
    });
    const verdictCls = nonConformes.length === 0 ? 'ok' : nonConformes.length <= 1 ? 'warn' : 'fail';
    const verdictTxt = nonConformes.length === 0
      ? '✅ Toutes les parois respectent la RE2020'
      : `⚠️ ${nonConformes.length} paroi(s) non conforme(s) RE2020`;

    // Affichage
    document.getElementById('th-verdict-box').innerHTML = `
      <div class="th-verdict ${verdictCls}">
        <div style="font-size:16px;font-weight:700">${verdictTxt}</div>
        <div style="font-size:13px;opacity:.8;margin-top:4px">
          Déperditions totales : <b>${Math.round(depTotale)} W</b> — Puissance chauffage estimée : <b>${Math.round(puissanceChauffage)} W</b>
        </div>
      </div>
    `;

    document.getElementById('th-resultats').innerHTML = `
      <div class="th-section" style="margin-top:0">🧱 Déperditions par paroi</div>
      ${details.map(p => {
        const req = re2020[p.type];
        const conforme = !req || p.u <= req.uMax;
        const cls = conforme ? 'ok' : 'fail';
        return `
        <div class="th-isolant-card ${cls}">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700;font-size:13px">${p.nom}</div>
              <div style="font-size:11px;color:var(--text-tertiary)">
                U = ${p.u} W/m²·K — Surface : ${p.surface} m²
                ${req ? ` — RE2020 : U ≤ ${req.uMax} <span style="font-weight:600;color:${conforme?'#10b981':'#ef4444'}">${conforme?'✅':'❌'}</span>` : ''}
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:18px;font-weight:800;color:var(--accent)">${Math.round(p.dep)} W</div>
              <div style="font-size:10px;color:var(--text-tertiary)">${Math.round(p.depM2)} W/m²</div>
            </div>
          </div>
        </div>`;
      }).join('')}

      <div class="th-section">🧊 Épaisseur isolant recommandée</div>
      <div class="th-isolant-card ok">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700">${isolant.nom}</div>
            <div style="font-size:11px;color:var(--text-tertiary)">λ = ${isolant.lambda} W/m·K — R cible = ${rCible} m²·K/W</div>
            <div style="font-size:11px;color:var(--text-tertiary)">U après isolation ≈ ${uApresIso.toFixed(3)} W/m²·K</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:28px;font-weight:900;color:#0ea5e9">${epaisseurMm} mm</div>
            <div style="font-size:10px;color:var(--text-tertiary)">épaisseur</div>
          </div>
        </div>
      </div>

      <div class="th-section">📊 Récapitulatif</div>
      <div class="th-stat"><span>ΔT (Ti − Te)</span><span class="th-stat-val">${deltaT} °C</span></div>
      <div class="th-stat"><span>Déperditions totales</span><span class="th-stat-val">${Math.round(depTotale)} W</span></div>
      <div class="th-stat"><span>Puissance chauffage estimée (+20% PT)</span><span class="th-stat-val">${Math.round(puissanceChauffage)} W (${(puissanceChauffage/1000).toFixed(2)} kW)</span></div>
      <div class="th-stat"><span>Épaisseur isolant ${isolant.nom}</span><span class="th-stat-val">${epaisseurMm} mm</span></div>
      <div class="th-stat"><span>Parois non conformes RE2020</span>
        <span class="th-stat-val ${nonConformes.length===0?'ok':'fail'}">${nonConformes.length === 0 ? 'Aucune ✅' : nonConformes.length + ' paroi(s) ❌'}</span>
      </div>
    `;

    this._lastResult = { ti, te, deltaT, details, depTotale, puissanceChauffage,
      epaisseurMm, isolant, rCible, uApresIso, nonConformes, verdictTxt, verdictCls };
    document.getElementById('th-actions').style.display = 'block';
  },

  exportPDF() {
    const r = this._lastResult;
    if (!r) return;
    const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    const entreprise = config.nom || 'AATB';
    const date = new Date().toLocaleDateString('fr-FR');
    const verdictColor = r.verdictCls === 'ok' ? '#10b981' : r.verdictCls === 'warn' ? '#f59e0b' : '#ef4444';

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Rapport Thermique — ${entreprise}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;margin:0;padding:30px}
      .header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #0ea5e9;margin-bottom:24px}
      .header-title{font-size:22px;font-weight:800;color:#0ea5e9}
      .verdict{border-radius:8px;padding:14px 20px;margin-bottom:20px;border:2px solid ${verdictColor};background:${verdictColor}15}
      .verdict-title{font-size:16px;font-weight:700;color:${verdictColor}}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th{background:#0ea5e9;color:#fff;padding:8px 10px;text-align:left;font-size:12px}
      td{padding:8px 10px;border-bottom:1px solid #eee;font-size:12px}
      tr:nth-child(even) td{background:#f0f9ff}
      .section-title{font-size:13px;font-weight:700;color:#0ea5e9;text-transform:uppercase;
        letter-spacing:.05em;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #0ea5e9}
      .isolant-box{background:#f0f9ff;border:2px solid #0ea5e9;border-radius:8px;
        padding:14px;text-align:center;margin:16px 0}
      .isolant-ep{font-size:40px;font-weight:900;color:#0ea5e9}
      .footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#888;display:flex;justify-content:space-between}
      @media print{body{padding:15px}}
    </style></head><body>
    <div class="header">
      <div><div class="header-title">🌡️ Rapport Déperditions Thermiques</div>
        <div style="font-size:12px;color:#666;margin-top:4px">Calcul RE2020 — Épaisseur isolant</div></div>
      <div style="text-align:right;font-size:12px;color:#666"><b>${entreprise}</b><br>Date : ${date}</div>
    </div>
    <div class="verdict">
      <div class="verdict-title">${r.verdictTxt}</div>
      <div style="font-size:12px;color:#444;margin-top:4px">
        Déperditions : <b>${Math.round(r.depTotale)} W</b> — Puissance chauffage estimée : <b>${Math.round(r.puissanceChauffage)} W</b> — ΔT : <b>${r.deltaT}°C</b>
      </div>
    </div>
    <div class="section-title">Déperditions par paroi</div>
    <table><thead><tr><th>Paroi</th><th>Surface</th><th>U W/m²·K</th><th>RE2020</th><th>Déperdition</th></tr></thead>
    <tbody>${r.details.map(p => `
      <tr><td><b>${p.nom}</b></td><td>${p.surface} m²</td><td>${p.u}</td>
        <td>${p.u <= 0.36 ? '✅' : '❌'}</td>
        <td><b>${Math.round(p.dep)} W</b></td></tr>
    `).join('')}
    <tr style="background:#e0f2fe"><td colspan="4"><b>Total déperditions</b></td><td><b>${Math.round(r.depTotale)} W</b></td></tr>
    <tr style="background:#e0f2fe"><td colspan="4"><b>Puissance chauffage (+20% ponts thermiques)</b></td><td><b>${Math.round(r.puissanceChauffage)} W</b></td></tr>
    </tbody></table>
    <div class="isolant-box">
      <div style="font-size:13px;color:#666">Épaisseur ${r.isolant.nom} pour R = ${r.rCible} m²·K/W</div>
      <div class="isolant-ep">${r.epaisseurMm} mm</div>
      <div style="font-size:12px;color:#666">U après isolation ≈ ${r.uApresIso.toFixed(3)} W/m²·K — λ = ${r.isolant.lambda} W/m·K</div>
    </div>
    <div class="footer">
      <span>PlaqPro+ — ${entreprise}</span>
      <span>Référence : RE2020 — Arrêté du 4 août 2021</span>
    </div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  },

  reset() {
    this._parois = [
      { nom:'Mur extérieur', surface:20, u:0.35, type:'mur' },
      { nom:'Plancher bas',  surface:24, u:0.25, type:'plancher' },
      { nom:'Toiture/Combles', surface:24, u:0.15, type:'toiture' },
      { nom:'Fenêtres double vitrage', surface:4, u:1.4, type:'vitrage' },
    ];
    this.renderParois();
    this.compute();
  }
};
