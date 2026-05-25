/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO+ — Temps Chantier h/m²
//  Ratios professionnels par corps de métier
// ============================================================

Pages.tempsChantier = function() {
  const div = document.createElement('div');

  if (!document.getElementById('style-temps')) {
    const s = document.createElement('style');
    s.id = 'style-temps';
    s.textContent = `
      .tc-hero { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; color: #fff; }
      .tc-hero h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      .tc-hero p  { font-size: 13px; opacity: .8; margin: 0; }
      .tc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media(max-width:768px){ .tc-grid { grid-template-columns: 1fr; } }
      .tc-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 20px; }
      .tc-section { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary); padding-bottom: 8px;
        border-bottom: 1px solid var(--border); margin: 16px 0 12px; }
      .tc-section:first-child { margin-top: 0; }
      .tc-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
      .tc-input-wrap { position: relative; margin-bottom: 8px; }
      .tc-input-wrap input, .tc-input-wrap select {
        width: 100%; padding: 8px 40px 8px 10px;
        background: var(--bg-primary); border: 1px solid var(--border);
        border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px; }
      .tc-input-wrap .tc-unit { position: absolute; right: 8px; top: 50%;
        transform: translateY(-50%); font-size: 11px; color: var(--text-tertiary); pointer-events: none; }
      .tc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 6px; }
      .tc-tache-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 8px;
        align-items: end; margin-bottom: 8px; font-size: 12px; }
      .tc-tache-head { font-size: 11px; color: var(--text-tertiary); font-weight: 600; margin-bottom: 4px; }
      .tc-add-btn { background: var(--bg-primary); border: 1px dashed var(--border);
        border-radius: var(--radius-sm); padding: 8px; width: 100%; cursor: pointer;
        color: var(--text-tertiary); font-size: 12px; margin-top: 6px; }
      .tc-add-btn:hover { border-color: #8b5cf6; color: #8b5cf6; }
      .tc-remove { background: none; border: none; color: #ef4444; cursor: pointer;
        font-size: 16px; padding: 4px 8px; }
      .tc-stat { display: flex; justify-content: space-between; align-items: center;
        padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
      .tc-stat:last-child { border: none; }
      .tc-stat-val { font-weight: 700; font-size: 15px; color: var(--accent); }
      .tc-corps-tag { display: inline-block; padding: 3px 8px; border-radius: 20px;
        font-size: 11px; font-weight: 600; margin-right: 4px; margin-bottom: 4px; }
      .tc-gauge-wrap { margin: 8px 0; }
      .tc-gauge-label { display: flex; justify-content: space-between; font-size: 12px;
        color: var(--text-secondary); margin-bottom: 4px; }
      .tc-gauge-bg { height: 10px; background: var(--bg-primary); border-radius: 5px;
        overflow: hidden; border: 1px solid var(--border); }
      .tc-gauge-fill { height: 100%; border-radius: 5px; }
    `;
    document.head.appendChild(s);
  }

  // Ratios professionnels h/m² ou h/unité
  const RATIOS = [
    // Placo
    { id:'cloison_simple',  label:'Cloison M48 1×BA13',      corps:'Plaquiste',    ratio:0.35, unite:'h/m²',  desc:'Pose ossature + plaque + joint' },
    { id:'cloison_double',  label:'Cloison M70 2×BA13',      corps:'Plaquiste',    ratio:0.55, unite:'h/m²',  desc:'Ossature + 2 plaques + joint' },
    { id:'doublage',        label:'Doublage collé BA13',      corps:'Plaquiste',    ratio:0.25, unite:'h/m²',  desc:'Encollage + pose + joint' },
    { id:'plafond_ba13',    label:'Plafond suspendu BA13',    corps:'Plaquiste',    ratio:0.45, unite:'h/m²',  desc:'Ossature T47 + plaque + joint' },
    { id:'joint_q4',        label:'Finition joint Q4',        corps:'Plaquiste',    ratio:0.20, unite:'h/m²',  desc:'Bandes + 3 passes enduit' },
    // Peinture
    { id:'peinture_2c',     label:'Peinture 2 couches',       corps:'Peintre',      ratio:0.15, unite:'h/m²',  desc:'Sous-couche + finition' },
    { id:'peinture_3c',     label:'Peinture 3 couches',       corps:'Peintre',      ratio:0.22, unite:'h/m²',  desc:'Impression + 2 couches finition' },
    { id:'papier_peint',    label:'Papier peint',             corps:'Peintre',      ratio:0.35, unite:'h/m²',  desc:'Encollage + pose + raccords' },
    { id:'enduit_lisse',    label:'Enduit lissé',             corps:'Peintre',      ratio:0.40, unite:'h/m²',  desc:'2 passes enduit + ponçage' },
    // Carrelage
    { id:'carrelage_sol',   label:'Carrelage sol ≤ 60×60',   corps:'Carreleur',    ratio:0.55, unite:'h/m²',  desc:'Ragréage + pose + joint' },
    { id:'carrelage_mur',   label:'Faïence murale',           corps:'Carreleur',    ratio:0.65, unite:'h/m²',  desc:'Préparation + pose + joint' },
    { id:'carrelage_grand', label:'Grand format > 60×60',    corps:'Carreleur',    ratio:0.80, unite:'h/m²',  desc:'Pose délicate + découpes' },
    // Électricité
    { id:'prise_elec',      label:'Prise / Interrupteur',    corps:'Électricien',  ratio:0.50, unite:'h/u',   desc:'Câblage + pose + test' },
    { id:'point_lumiere',   label:'Point lumineux',          corps:'Électricien',  ratio:0.75, unite:'h/u',   desc:'Câblage + boite + test' },
    { id:'tableau_elec',    label:'Tableau électrique',      corps:'Électricien',  ratio:8.0,  unite:'h/u',   desc:'Pose + câblage + test complet' },
    // Plomberie
    { id:'sanitaire',       label:'Appareil sanitaire',      corps:'Plombier',     ratio:3.0,  unite:'h/u',   desc:'Raccordement eau + évacuation' },
    { id:'tuyau_cu',        label:'Tuyauterie cuivre',       corps:'Plombier',     ratio:0.50, unite:'h/ml',  desc:'Pose + soudure + fixation' },
    { id:'radiateur',       label:'Radiateur',               corps:'Plombier',     ratio:2.5,  unite:'h/u',   desc:'Pose + raccordement + purge' },
    // Maçonnerie
    { id:'parpaing',        label:'Mur parpaings',           corps:'Maçon',        ratio:1.20, unite:'h/m²',  desc:'Pose + jointoiement' },
    { id:'enduit_facade',   label:'Enduit façade',           corps:'Maçon',        ratio:0.60, unite:'h/m²',  desc:'Gobetis + corps + finition' },
    { id:'dalle_beton',     label:'Dalle béton',             corps:'Maçon',        ratio:0.80, unite:'h/m²',  desc:'Coffrage + coulage + finition' },
  ];

  const CORPS_COLORS = {
    'Plaquiste':   '#4F8EF7',
    'Peintre':     '#10b981',
    'Carreleur':   '#f59e0b',
    'Électricien': '#ef4444',
    'Plombier':    '#06b6d4',
    'Maçon':       '#8b5cf6',
  };

  div.innerHTML = `
    <div class="tc-hero">
      <h1>⏱️ Temps Chantier — Ratios Professionnels</h1>
      <p>Estimez votre temps de main d'œuvre par tâche et par corps de métier</p>
    </div>

    <div class="tc-grid">
      <div class="tc-panel">

        <div class="tc-section">⚙️ Paramètres équipe</div>
        <div class="tc-row">
          <div>
            <div class="tc-label">Nb compagnons</div>
            <div class="tc-input-wrap">
              <input type="number" id="tc-nb-comp" value="2" min="1" max="20" oninput="TC.compute()">
              <span class="tc-unit">pers</span>
            </div>
          </div>
          <div>
            <div class="tc-label">Heures / jour</div>
            <div class="tc-input-wrap">
              <input type="number" id="tc-h-jour" value="8" min="4" max="12" step="0.5" oninput="TC.compute()">
              <span class="tc-unit">h</span>
            </div>
          </div>
        </div>
        <div class="tc-row">
          <div>
            <div class="tc-label">Coeff. aléas chantier</div>
            <div class="tc-input-wrap">
              <select id="tc-aleas" onchange="TC.compute()">
                <option value="1.0">1.0 — Conditions idéales</option>
                <option value="1.15" selected>1.15 — Conditions normales</option>
                <option value="1.30">1.30 — Chantier difficile</option>
                <option value="1.50">1.50 — Conditions très difficiles</option>
              </select>
            </div>
          </div>
          <div>
            <div class="tc-label">Taux horaire MO</div>
            <div class="tc-input-wrap">
              <input type="number" id="tc-taux-mo" value="45" min="20" max="120" step="1" oninput="TC.compute()">
              <span class="tc-unit">€/h</span>
            </div>
          </div>
        </div>

        <div class="tc-section">📋 Tâches du chantier</div>
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;margin-bottom:6px">
          <div class="tc-tache-head">Tâche</div>
          <div class="tc-tache-head">Quantité</div>
          <div class="tc-tache-head">Unité</div>
          <div class="tc-tache-head">h/u</div>
          <div></div>
        </div>
        <div id="tc-taches"></div>

        <div style="margin-top:10px">
          <div class="tc-label">Ajouter depuis les ratios :</div>
          <select id="tc-ratio-select" class="form-control" style="font-size:12px;margin-bottom:6px">
            ${RATIOS.map((r,i) => `<option value="${i}">[${r.corps}] ${r.label} — ${r.ratio} ${r.unite}</option>`).join('')}
          </select>
          <button class="tc-add-btn" onclick="TC.addFromRatio()">+ Ajouter cette tâche</button>
        </div>

      </div>

      <div class="tc-panel">
        <div class="tc-section">📊 Résultats</div>
        <div id="tc-resultats">
          <div style="text-align:center;color:var(--text-tertiary);padding:40px 0;font-size:13px">
            Ajoutez des tâches pour voir l'estimation
          </div>
        </div>
        <div id="tc-actions" style="display:none;margin-top:16px">
          <button class="btn btn-primary" style="width:100%;margin-bottom:8px" onclick="TC.exportPDF()">
            📄 Exporter rapport PDF
          </button>
          <button class="btn btn-secondary" style="width:100%" onclick="TC.reset()">
            🔄 Réinitialiser
          </button>
        </div>
      </div>
    </div>
  `;

  window.TC._ratios = RATIOS;
  window.TC._corpsColors = CORPS_COLORS;
  window.TC._taches = [
    { label:'Cloison M48 1×BA13', corps:'Plaquiste', qte:50, unite:'m²', ratio:0.35 },
    { label:'Peinture 2 couches',  corps:'Peintre',   qte:80, unite:'m²', ratio:0.15 },
  ];

  setTimeout(() => { TC.renderTaches(); TC.compute(); }, 50);
  return div;
};

const TC = {
  _ratios: [],
  _corpsColors: {},
  _taches: [],
  _last: null,

  addFromRatio() {
    const idx = parseInt(document.getElementById('tc-ratio-select')?.value) || 0;
    const r = this._ratios[idx];
    if (!r) return;
    const unite = r.unite.replace('h/','');
    this._taches.push({ label:r.label, corps:r.corps, qte:10, unite, ratio:r.ratio });
    this.renderTaches();
    this.compute();
  },

  removeTache(i) {
    this._taches.splice(i, 1);
    this.renderTaches();
    this.compute();
  },

  renderTaches() {
    const el = document.getElementById('tc-taches');
    if (!el) return;
    el.innerHTML = this._taches.map((t, i) => `
      <div class="tc-tache-row">
        <input class="form-control" style="font-size:11px" value="${t.label}"
          oninput="TC._taches[${i}].label=this.value">
        <input type="number" class="form-control" style="font-size:11px" value="${t.qte}" min="0" step="0.5"
          oninput="TC._taches[${i}].qte=+this.value;TC.compute()">
        <input class="form-control" style="font-size:11px" value="${t.unite}"
          oninput="TC._taches[${i}].unite=this.value">
        <input type="number" class="form-control" style="font-size:11px" value="${t.ratio}" min="0.01" step="0.01"
          oninput="TC._taches[${i}].ratio=+this.value;TC.compute()">
        <button class="tc-remove" onclick="TC.removeTache(${i})">✕</button>
      </div>
    `).join('');
  },

  compute() {
    const nbComp = parseFloat(document.getElementById('tc-nb-comp')?.value) || 2;
    const hJour  = parseFloat(document.getElementById('tc-h-jour')?.value)  || 8;
    const aleas  = parseFloat(document.getElementById('tc-aleas')?.value)   || 1.15;
    const tauxMO = parseFloat(document.getElementById('tc-taux-mo')?.value) || 45;

    if (this._taches.length === 0) return;

    // Calcul par tâche
    const details = this._taches.map(t => {
      const hBrut  = t.qte * t.ratio;
      const hTotal = hBrut * aleas;
      const cout   = hTotal * tauxMO;
      return { ...t, hBrut, hTotal, cout };
    });

    const totalHBrut  = details.reduce((s,t) => s + t.hBrut, 0);
    const totalHTotal = details.reduce((s,t) => s + t.hTotal, 0);
    const totalCout   = details.reduce((s,t) => s + t.cout, 0);
    const totalJours  = totalHTotal / (nbComp * hJour);

    // Regroupement par corps
    const parCorps = {};
    details.forEach(t => {
      if (!parCorps[t.corps]) parCorps[t.corps] = { h:0, cout:0 };
      parCorps[t.corps].h    += t.hTotal;
      parCorps[t.corps].cout += t.cout;
    });

    const fmt  = n => n.toLocaleString('fr-FR', {maximumFractionDigits:1});
    const fmtE = n => n.toLocaleString('fr-FR', {maximumFractionDigits:0}) + ' €';

    document.getElementById('tc-resultats').innerHTML = `
      <div style="background:rgba(139,92,246,.1);border:2px solid #8b5cf6;border-radius:var(--radius-lg);
        padding:16px;text-align:center;margin-bottom:16px">
        <div style="font-size:12px;color:var(--text-secondary)">Durée estimée chantier</div>
        <div style="font-size:36px;font-weight:900;color:#8b5cf6">${fmt(totalJours)} j</div>
        <div style="font-size:13px;color:var(--text-secondary)">
          ${fmt(totalHTotal)} h totales — ${nbComp} compagnon${nbComp>1?'s':''} × ${hJour}h/j
        </div>
        <div style="font-size:14px;font-weight:700;color:#8b5cf6;margin-top:8px">
          Coût MO estimé : ${fmtE(totalCout)}
        </div>
      </div>

      <div class="tc-section" style="margin-top:0">👷 Par corps de métier</div>
      ${Object.entries(parCorps).map(([corps, data]) => {
        const color = this._corpsColors[corps] || '#888';
        const pct = (data.h / totalHTotal * 100).toFixed(0);
        return `
        <div class="tc-gauge-wrap">
          <div class="tc-gauge-label">
            <span><span class="tc-corps-tag" style="background:${color}20;color:${color}">${corps}</span></span>
            <span style="font-weight:600">${fmt(data.h)} h — ${fmtE(data.cout)}</span>
          </div>
          <div class="tc-gauge-bg">
            <div class="tc-gauge-fill" style="width:${pct}%;background:${color}"></div>
          </div>
        </div>`;
      }).join('')}

      <div class="tc-section">📋 Détail par tâche</div>
      ${details.map(t => {
        const color = this._corpsColors[t.corps] || '#888';
        return `
        <div style="display:flex;justify-content:space-between;align-items:center;
          padding:8px 0;border-bottom:1px solid var(--border);font-size:12px">
          <div>
            <span class="tc-corps-tag" style="background:${color}20;color:${color}">${t.corps}</span>
            <span style="font-weight:600">${t.label}</span>
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">
              ${t.qte} ${t.unite} × ${t.ratio} h/${t.unite} × coeff.${aleas}
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:12px">
            <div style="font-weight:700">${fmt(t.hTotal)} h</div>
            <div style="font-size:11px;color:var(--text-tertiary)">${fmtE(t.cout)}</div>
          </div>
        </div>`;
      }).join('')}

      <div class="tc-section">📊 Récapitulatif</div>
      <div class="tc-stat"><span>Heures brutes</span><span class="tc-stat-val">${fmt(totalHBrut)} h</span></div>
      <div class="tc-stat"><span>Coefficient aléas (×${aleas})</span><span class="tc-stat-val">${fmt(totalHTotal)} h</span></div>
      <div class="tc-stat"><span>Équipe : ${nbComp} pers. × ${hJour}h/j</span><span class="tc-stat-val">${fmt(totalJours)} jours</span></div>
      <div class="tc-stat"><span>Taux horaire MO</span><span class="tc-stat-val">${tauxMO} €/h</span></div>
      <div class="tc-stat" style="font-weight:700"><span>Coût MO total estimé</span><span class="tc-stat-val">${fmtE(totalCout)}</span></div>
    `;

    this._last = { nbComp, hJour, aleas, tauxMO, details, totalHBrut, totalHTotal, totalCout, totalJours, parCorps };
    document.getElementById('tc-actions').style.display = 'block';
  },

  exportPDF() {
    const r = this._last;
    if (!r) return;
    const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    const entreprise = config.nom || 'AATB';
    const date = new Date().toLocaleDateString('fr-FR');
    const fmt  = n => n.toLocaleString('fr-FR', {maximumFractionDigits:1});
    const fmtE = n => n.toLocaleString('fr-FR', {maximumFractionDigits:0}) + ' €';

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Rapport Temps Chantier — ${entreprise}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;margin:0;padding:30px}
      .header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #8b5cf6;margin-bottom:24px}
      .header-title{font-size:22px;font-weight:800;color:#8b5cf6}
      .result-box{background:#f5f3ff;border:2px solid #8b5cf6;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px}
      .result-jours{font-size:48px;font-weight:900;color:#8b5cf6}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th{background:#8b5cf6;color:#fff;padding:8px 10px;text-align:left;font-size:12px}
      td{padding:8px 10px;border-bottom:1px solid #eee;font-size:12px}
      tr:nth-child(even) td{background:#f5f3ff}
      .section-title{font-size:13px;font-weight:700;color:#8b5cf6;text-transform:uppercase;
        letter-spacing:.05em;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #8b5cf6}
      .footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#888;display:flex;justify-content:space-between}
      @media print{body{padding:15px}}
    </style></head><body>
    <div class="header">
      <div><div class="header-title">⏱️ Rapport Temps Chantier</div>
        <div style="font-size:12px;color:#666;margin-top:4px">Estimation main d'œuvre — Ratios professionnels</div></div>
      <div style="text-align:right;font-size:12px;color:#666"><b>${entreprise}</b><br>Date : ${date}</div>
    </div>
    <div class="result-box">
      <div style="font-size:13px;color:#666">Durée estimée chantier</div>
      <div class="result-jours">${fmt(r.totalJours)} j</div>
      <div style="font-size:13px;color:#444">${fmt(r.totalHTotal)} h — ${r.nbComp} compagnon${r.nbComp>1?'s':''} × ${r.hJour}h/j</div>
      <div style="font-size:16px;font-weight:700;color:#8b5cf6;margin-top:8px">Coût MO : ${fmtE(r.totalCout)}</div>
    </div>
    <div class="section-title">Détail par tâche</div>
    <table><thead><tr><th>Tâche</th><th>Corps</th><th>Qté</th><th>Ratio</th><th>Heures</th><th>Coût MO</th></tr></thead>
    <tbody>${r.details.map(t => `
      <tr><td><b>${t.label}</b></td><td>${t.corps}</td>
        <td>${t.qte} ${t.unite}</td><td>${t.ratio} h/${t.unite}</td>
        <td><b>${fmt(t.hTotal)} h</b></td><td>${fmtE(t.cout)}</td></tr>
    `).join('')}
    <tr style="background:#ede9fe"><td colspan="4"><b>TOTAL</b></td>
      <td><b>${fmt(r.totalHTotal)} h</b></td><td><b>${fmtE(r.totalCout)}</b></td></tr>
    </tbody></table>
    <div class="section-title">Récapitulatif</div>
    <table><tbody>
      <tr><td>Heures brutes</td><td><b>${fmt(r.totalHBrut)} h</b></td></tr>
      <tr><td>Coefficient aléas</td><td><b>×${r.aleas}</b></td></tr>
      <tr><td>Heures totales</td><td><b>${fmt(r.totalHTotal)} h</b></td></tr>
      <tr><td>Durée chantier (${r.nbComp} pers. × ${r.hJour}h)</td><td><b>${fmt(r.totalJours)} jours</b></td></tr>
      <tr><td>Taux horaire MO</td><td><b>${r.tauxMO} €/h</b></td></tr>
      <tr style="background:#ede9fe"><td><b>Coût MO total</b></td><td><b>${fmtE(r.totalCout)}</b></td></tr>
    </tbody></table>
    <div class="footer">
      <span>PlaqPro+ — ${entreprise}</span>
      <span>Ratios indicatifs — à ajuster selon conditions chantier</span>
    </div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  },

  reset() {
    this._taches = [];
    this.renderTaches();
    document.getElementById('tc-resultats').innerHTML =
      '<div style="text-align:center;color:var(--text-tertiary);padding:40px 0;font-size:13px">Ajoutez des tâches pour voir l\'estimation</div>';
    document.getElementById('tc-actions').style.display = 'none';
  }
};
