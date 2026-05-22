/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO+ — Dimensionnement Linteau
//  Calcul portée, charge, section béton/métal
// ============================================================

Pages.linteau = function() {
  const div = document.createElement('div');

  if (!document.getElementById('style-linteau')) {
    const s = document.createElement('style');
    s.id = 'style-linteau';
    s.textContent = `
      .lt-hero { background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; color: #fff; }
      .lt-hero h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      .lt-hero p  { font-size: 13px; opacity: .8; margin: 0; }
      .lt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media(max-width:768px){ .lt-grid { grid-template-columns: 1fr; } }
      .lt-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 20px; }
      .lt-section { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary); padding-bottom: 8px;
        border-bottom: 1px solid var(--border); margin: 16px 0 12px; }
      .lt-section:first-child { margin-top: 0; }
      .lt-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
      .lt-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
      .lt-input-wrap { position: relative; margin-bottom: 4px; }
      .lt-input-wrap input, .lt-input-wrap select {
        width: 100%; padding: 8px 40px 8px 10px;
        background: var(--bg-primary); border: 1px solid var(--border);
        border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px; }
      .lt-input-wrap .lt-unit { position: absolute; right: 8px; top: 50%;
        transform: translateY(-50%); font-size: 11px; color: var(--text-tertiary); pointer-events: none; }
      .lt-stat { display: flex; justify-content: space-between; align-items: center;
        padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
      .lt-stat:last-child { border: none; }
      .lt-stat-val { font-weight: 700; font-size: 15px; color: var(--accent); }
      .lt-verdict { border-radius: var(--radius-lg); padding: 20px; margin-bottom: 16px; text-align: center; }
      .lt-verdict.ok   { background: rgba(16,185,129,.1);  border: 2px solid #10b981; }
      .lt-verdict.warn { background: rgba(245,158,11,.1);  border: 2px solid #f59e0b; }
      .lt-verdict.fail { background: rgba(239,68,68,.1);   border: 2px solid #ef4444; }
      .lt-solution-card { border: 2px solid var(--border); border-radius: var(--radius-md);
        padding: 14px; margin-bottom: 10px; }
      .lt-solution-card.ok   { border-color: #10b981; background: rgba(16,185,129,.06); }
      .lt-solution-card.warn { border-color: #f59e0b; background: rgba(245,158,11,.06); }
      .lt-type-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 12px; }
      .lt-type-btn { padding: 10px 6px; border: 2px solid var(--border);
        border-radius: var(--radius-md); background: var(--bg-primary); cursor: pointer;
        text-align: center; font-size: 11px; color: var(--text-secondary); transition: all .2s; }
      .lt-type-btn.active { border-color: #0d9488; background: rgba(13,148,136,.1); color: #0d9488; font-weight: 600; }
      .lt-type-btn .lt-type-icon { font-size: 20px; display: block; margin-bottom: 4px; }
    `;
    document.head.appendChild(s);
  }

  div.innerHTML = `
    <div class="lt-hero">
      <h1>🏗️ Dimensionnement Linteau</h1>
      <p>Calcul portée, charge, section béton préfab ou IPN acier — Eurocode 2</p>
    </div>

    <div class="lt-grid">
      <div class="lt-panel">

        <div class="lt-section">📐 Ouverture</div>
        <div class="lt-row">
          <div>
            <div class="lt-label">Largeur ouverture</div>
            <div class="lt-input-wrap">
              <input type="number" id="lt-portee" value="1.20" min="0.5" max="6" step="0.05" oninput="Linteau.compute()">
              <span class="lt-unit">m</span>
            </div>
          </div>
          <div>
            <div class="lt-label">Appui chaque côté</div>
            <div class="lt-input-wrap">
              <input type="number" id="lt-appui" value="0.20" min="0.10" max="0.50" step="0.05" oninput="Linteau.compute()">
              <span class="lt-unit">m</span>
            </div>
          </div>
        </div>

        <div class="lt-section">🏠 Charges</div>
        <div class="lt-row">
          <div>
            <div class="lt-label">Charge permanente G</div>
            <div class="lt-input-wrap">
              <input type="number" id="lt-g" value="5" min="0" max="50" step="0.5" oninput="Linteau.compute()">
              <span class="lt-unit">kN/m</span>
            </div>
          </div>
          <div>
            <div class="lt-label">Charge variable Q</div>
            <div class="lt-input-wrap">
              <input type="number" id="lt-q" value="2.5" min="0" max="30" step="0.5" oninput="Linteau.compute()">
              <span class="lt-unit">kN/m</span>
            </div>
          </div>
        </div>
        <div class="lt-row">
          <div>
            <div class="lt-label">Nb niveaux au-dessus</div>
            <div class="lt-input-wrap">
              <input type="number" id="lt-niveaux" value="1" min="0" max="10" step="1" oninput="Linteau.compute()">
              <span class="lt-unit">niv</span>
            </div>
          </div>
          <div>
            <div class="lt-label">Largeur mur reprise</div>
            <div class="lt-input-wrap">
              <input type="number" id="lt-larg-mur" value="0.20" min="0.10" max="0.50" step="0.05" oninput="Linteau.compute()">
              <span class="lt-unit">m</span>
            </div>
          </div>
        </div>

        <div class="lt-section">🧱 Type de mur</div>
        <div class="lt-type-grid">
          <button class="lt-type-btn active" data-type="parpaing" onclick="Linteau.selectType(this)">
            <span class="lt-type-icon">🧱</span>Parpaing<br><small>20cm</small>
          </button>
          <button class="lt-type-btn" data-type="brique" onclick="Linteau.selectType(this)">
            <span class="lt-type-icon">🏠</span>Brique<br><small>20cm</small>
          </button>
          <button class="lt-type-btn" data-type="beton" onclick="Linteau.selectType(this)">
            <span class="lt-type-icon">🏢</span>Béton<br><small>armé</small>
          </button>
          <button class="lt-type-btn" data-type="ossature" onclick="Linteau.selectType(this)">
            <span class="lt-type-icon">🔩</span>Ossature<br><small>bois/métal</small>
          </button>
          <button class="lt-type-btn" data-type="pierre" onclick="Linteau.selectType(this)">
            <span class="lt-type-icon">🪨</span>Pierre<br><small>maçonnée</small>
          </button>
          <button class="lt-type-btn" data-type="agglo" onclick="Linteau.selectType(this)">
            <span class="lt-type-icon">⬛</span>Agglo<br><small>plein</small>
          </button>
        </div>

        <div class="lt-section">🔧 Type de linteau</div>
        <div class="lt-label">Matériau préféré</div>
        <div class="lt-input-wrap">
          <select id="lt-materiau" onchange="Linteau.compute()">
            <option value="beton">Béton préfabriqué</option>
            <option value="ipn">IPN Acier</option>
            <option value="bois">Bois lamellé collé</option>
            <option value="tous">Tous (comparaison)</option>
          </select>
        </div>

      </div>

      <div class="lt-panel">
        <div class="lt-section">📊 Résultats</div>
        <div id="lt-verdict-box"></div>
        <div id="lt-resultats">
          <div style="text-align:center;color:var(--text-tertiary);padding:40px 0;font-size:13px">
            Renseignez les paramètres pour voir les résultats
          </div>
        </div>
        <div id="lt-actions" style="display:none;margin-top:16px">
          <button class="btn btn-primary" style="width:100%;margin-bottom:8px" onclick="Linteau.exportPDF()">
            📄 Exporter rapport PDF
          </button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => Linteau.compute(), 50);
  return div;
};

const Linteau = {
  _typeMur: 'parpaing',
  _linteauxBeton: [
    { ref:'L15-160', l:1.50, h:160, b:120, q_max:12, poids:8.6  },
    { ref:'L20-160', l:2.00, h:160, b:120, q_max:10, poids:11.5 },
    { ref:'L20-200', l:2.00, h:200, b:120, q_max:15, poids:14.4 },
    { ref:'L25-200', l:2.50, h:200, b:120, q_max:12, poids:18.0 },
    { ref:'L25-240', l:2.50, h:240, b:120, q_max:18, poids:21.6 },
    { ref:'L30-240', l:3.00, h:240, b:120, q_max:15, poids:25.9 },
    { ref:'L30-280', l:3.00, h:280, b:120, q_max:20, poids:30.2 },
    { ref:'L35-280', l:3.50, h:280, b:120, q_max:16, poids:35.3 },
    { ref:'L40-320', l:4.00, h:320, b:120, q_max:18, poids:46.1 },
    { ref:'L50-400', l:5.00, h:400, b:120, q_max:16, poids:72.0 },
  ],
  _linteauxIPN: [
    { ref:'IPN 80',  h:80,  q_max_3m:8,  q_max_4m:4,  q_max_5m:0  },
    { ref:'IPN 100', h:100, q_max_3m:14, q_max_4m:8,  q_max_5m:5  },
    { ref:'IPN 120', h:120, q_max_3m:22, q_max_4m:13, q_max_5m:8  },
    { ref:'IPN 140', h:140, q_max_3m:33, q_max_4m:20, q_max_5m:12 },
    { ref:'IPN 160', h:160, q_max_3m:47, q_max_4m:28, q_max_5m:18 },
    { ref:'IPN 180', h:180, q_max_3m:65, q_max_4m:39, q_max_5m:25 },
    { ref:'IPN 200', h:200, q_max_3m:87, q_max_4m:53, q_max_5m:34 },
  ],

  selectType(btn) {
    document.querySelectorAll('.lt-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this._typeMur = btn.dataset.type;
    this.compute();
  },

  compute() {
    const portee   = parseFloat(document.getElementById('lt-portee')?.value)   || 1.20;
    const appui    = parseFloat(document.getElementById('lt-appui')?.value)     || 0.20;
    const g        = parseFloat(document.getElementById('lt-g')?.value)         || 5;
    const q        = parseFloat(document.getElementById('lt-q')?.value)         || 2.5;
    const niveaux  = parseFloat(document.getElementById('lt-niveaux')?.value)   || 1;
    const largMur  = parseFloat(document.getElementById('lt-larg-mur')?.value)  || 0.20;
    const materiau = document.getElementById('lt-materiau')?.value || 'beton';

    const ltotal = portee + 2 * appui;
    const qELS = g + q;
    const qELU = 1.35 * g + 1.5 * q;
    const MEls = (qELS * portee * portee) / 8;
    const MElu = (qELU * portee * portee) / 8;
    const fAdm = portee / 500 * 1000;

    const solutionsBeton = this._linteauxBeton.filter(l =>
      l.l >= ltotal && l.q_max >= qELS
    ).slice(0, 3);

    const getQmax = (ipn, p) => {
      if (p <= 3) return ipn.q_max_3m;
      if (p <= 4) return ipn.q_max_4m;
      return ipn.q_max_5m;
    };
    const solutionsIPN = this._linteauxIPN.filter(ipn =>
      getQmax(ipn, portee) >= qELS
    ).slice(0, 3);

    const bLVL = largMur * 1000;
    const hLVLmin = Math.ceil(portee * 1000 / 10);
    const hLVL = Math.max(hLVLmin, 120);

    const verdictCls = (solutionsBeton.length > 0 || solutionsIPN.length > 0) ? 'ok' : 'fail';
    const verdictTxt = verdictCls === 'ok'
      ? `✅ ${solutionsBeton.length + solutionsIPN.length} solution(s) trouvée(s)`
      : '❌ Portée trop importante — consulter un bureau d\'études';

    document.getElementById('lt-verdict-box').innerHTML = `
      <div class="lt-verdict ${verdictCls}">
        <div style="font-size:16px;font-weight:700">${verdictTxt}</div>
        <div style="font-size:12px;opacity:.8;margin-top:4px">
          Charge ELS : <b>${qELS.toFixed(1)} kN/m</b> — Charge ELU : <b>${qELU.toFixed(1)} kN/m</b> — Moment max : <b>${MElu.toFixed(1)} kN·m</b>
        </div>
      </div>
    `;

    let html = `
      <div style="margin-bottom:16px">
        <div class="lt-stat"><span>Portée libre</span><span class="lt-stat-val">${portee} m</span></div>
        <div class="lt-stat"><span>Longueur totale linteau</span><span class="lt-stat-val">${ltotal.toFixed(2)} m</span></div>
        <div class="lt-stat"><span>Charge ELS (G+Q)</span><span class="lt-stat-val">${qELS.toFixed(1)} kN/m</span></div>
        <div class="lt-stat"><span>Charge ELU (1.35G+1.5Q)</span><span class="lt-stat-val">${qELU.toFixed(1)} kN/m</span></div>
        <div class="lt-stat"><span>Moment fléchissant ELU</span><span class="lt-stat-val">${MElu.toFixed(2)} kN·m</span></div>
        <div class="lt-stat"><span>Flèche admissible (L/500)</span><span class="lt-stat-val">${fAdm.toFixed(1)} mm</span></div>
      </div>
    `;

    if (materiau === 'beton' || materiau === 'tous') {
      html += `<div style="font-size:12px;font-weight:700;color:#0d9488;margin-bottom:8px">🧱 Linteaux béton préfabriqués</div>`;
      if (solutionsBeton.length > 0) {
        solutionsBeton.forEach((l, i) => {
          html += `
          <div class="lt-solution-card ok">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-weight:700;font-size:14px">${l.ref} ${i===0?'⭐ Recommandé':''}</div>
                <div style="font-size:11px;color:var(--text-tertiary)">
                  L=${l.l}m — h=${l.h}mm — b=${l.b}mm — Q max=${l.q_max} kN/m — ${l.poids} kg/ml
                </div>
              </div>
              <div style="text-align:right;font-size:20px;font-weight:800;color:#0d9488">✅</div>
            </div>
          </div>`;
        });
      } else {
        html += `<div style="color:#ef4444;font-size:12px;margin-bottom:12px">❌ Aucun linteau béton standard pour ces paramètres</div>`;
      }
    }

    if (materiau === 'ipn' || materiau === 'tous') {
      html += `<div style="font-size:12px;font-weight:700;color:#0d9488;margin:12px 0 8px">⚙️ Profilés IPN acier</div>`;
      if (solutionsIPN.length > 0) {
        solutionsIPN.forEach((l, i) => {
          const qm = getQmax(l, portee);
          html += `
          <div class="lt-solution-card ok">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-weight:700;font-size:14px">${l.ref} ${i===0?'⭐ Recommandé':''}</div>
                <div style="font-size:11px;color:var(--text-tertiary)">
                  h=${l.h}mm — Q max à ${portee}m = ${qm} kN/m
                </div>
              </div>
              <div style="text-align:right;font-size:20px;font-weight:800;color:#0d9488">✅</div>
            </div>
          </div>`;
        });
      } else {
        html += `<div style="color:#ef4444;font-size:12px;margin-bottom:12px">❌ Portée hors plage IPN standard</div>`;
      }
    }

    if (materiau === 'bois' || materiau === 'tous') {
      html += `
        <div style="font-size:12px;font-weight:700;color:#0d9488;margin:12px 0 8px">🪵 Bois LVL (Kerto/Sylvatis)</div>
        <div class="lt-solution-card warn">
          <div style="font-weight:700">LVL ${bLVL}×${hLVL} mm</div>
          <div style="font-size:11px;color:var(--text-tertiary)">
            Section indicative — vérification bureau d'études recommandée
          </div>
        </div>`;
    }

    document.getElementById('lt-resultats').innerHTML = html;
    this._lastResult = { portee, appui, ltotal, g, q, qELS, qELU, MElu, fAdm,
      solutionsBeton, solutionsIPN, hLVL, bLVL, verdictTxt, verdictCls };
    document.getElementById('lt-actions').style.display = 'block';
  },

  exportPDF() {
    const r = this._lastResult;
    if (!r) return;
    const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    const entreprise = config.nom || 'AATB';
    const date = new Date().toLocaleDateString('fr-FR');
    const verdictColor = r.verdictCls === 'ok' ? '#0d9488' : '#ef4444';

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Rapport Linteau — ${entreprise}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;margin:0;padding:30px}
      .header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #0d9488;margin-bottom:24px}
      .header-title{font-size:22px;font-weight:800;color:#0d9488}
      .verdict{border-radius:8px;padding:14px 20px;margin-bottom:20px;border:2px solid ${verdictColor};background:${verdictColor}15}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th{background:#0d9488;color:#fff;padding:8px 10px;text-align:left;font-size:12px}
      td{padding:8px 10px;border-bottom:1px solid #eee;font-size:12px}
      tr:nth-child(even) td{background:#f0fdfa}
      .section-title{font-size:13px;font-weight:700;color:#0d9488;text-transform:uppercase;
        letter-spacing:.05em;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #0d9488}
      .footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#888;display:flex;justify-content:space-between}
      .warn-box{background:#fffbeb;border-left:4px solid #f59e0b;padding:10px 14px;border-radius:0 6px 6px 0;font-size:12px;margin-top:16px}
      @media print{body{padding:15px}}
    </style></head><body>
    <div class="header">
      <div><div class="header-title">🏗️ Rapport Dimensionnement Linteau</div>
        <div style="font-size:12px;color:#666;margin-top:4px">Calcul portée & charge — Eurocode 2</div></div>
      <div style="text-align:right;font-size:12px;color:#666"><b>${entreprise}</b><br>Date : ${date}</div>
    </div>
    <div class="verdict">
      <div style="font-size:15px;font-weight:700;color:${verdictColor}">${r.verdictTxt}</div>
    </div>
    <div class="section-title">Paramètres</div>
    <table><tbody>
      <tr><td>Portée libre</td><td><b>${r.portee} m</b></td></tr>
      <tr><td>Appui chaque côté</td><td><b>${r.appui} m</b></td></tr>
      <tr><td>Longueur totale linteau</td><td><b>${r.ltotal.toFixed(2)} m</b></td></tr>
      <tr><td>Charge permanente G</td><td><b>${r.g} kN/m</b></td></tr>
      <tr><td>Charge variable Q</td><td><b>${r.q} kN/m</b></td></tr>
      <tr><td>Charge ELS (G+Q)</td><td><b>${r.qELS.toFixed(1)} kN/m</b></td></tr>
      <tr><td>Charge ELU (1.35G+1.5Q)</td><td><b>${r.qELU.toFixed(1)} kN/m</b></td></tr>
      <tr><td>Moment fléchissant ELU</td><td><b>${r.MElu.toFixed(2)} kN·m</b></td></tr>
      <tr><td>Flèche admissible (L/500)</td><td><b>${r.fAdm.toFixed(1)} mm</b></td></tr>
    </tbody></table>
    ${r.solutionsBeton.length > 0 ? `
    <div class="section-title">Solutions béton préfabriqué</div>
    <table><thead><tr><th>Référence</th><th>Longueur</th><th>h×b (mm)</th><th>Q max</th><th>Poids</th></tr></thead>
    <tbody>${r.solutionsBeton.map((l,i) => `
      <tr ${i===0?'style="background:#f0fdfa"':''}>
        <td><b>${l.ref}</b>${i===0?' ⭐':''}</td>
        <td>${l.l} m</td><td>${l.h}×${l.b}</td>
        <td>${l.q_max} kN/m</td><td>${l.poids} kg/ml</td></tr>
    `).join('')}</tbody></table>` : ''}
    ${r.solutionsIPN.length > 0 ? `
    <div class="section-title">Solutions IPN acier</div>
    <table><thead><tr><th>Référence</th><th>Hauteur</th><th>Q max à ${r.portee}m</th></tr></thead>
    <tbody>${r.solutionsIPN.map((l,i) => {
      const qm = r.portee<=3?l.q_max_3m:r.portee<=4?l.q_max_4m:l.q_max_5m;
      return '<tr ' + (i===0?'style="background:#f0fdfa"':'') + '><td><b>' + l.ref + '</b>' + (i===0?' ⭐':'') + '</td><td>' + l.h + ' mm</td><td>' + qm + ' kN/m</td></tr>';
    }).join('')}</tbody></table>` : ''}
    <div class="warn-box">⚠️ Ces calculs sont indicatifs. Pour tout ouvrage porteur, une vérification par un bureau d'études structure est recommandée.</div>
    <div class="footer">
      <span>PlaqPro+ — ${entreprise}</span>
      <span>Référence : Eurocode 2 — NF EN 1992</span>
    </div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
};
