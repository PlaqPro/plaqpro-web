// ============================================================
//  PLAQPRO+ — Section Câble NF C15-100
//  Calcul section, intensité, chute de tension
// ============================================================

Pages.sectionCable = function() {
  const div = document.createElement('div');

  if (!document.getElementById('style-cable')) {
    const s = document.createElement('style');
    s.id = 'style-cable';
    s.textContent = `
      .cab-hero { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; color: #fff; }
      .cab-hero h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      .cab-hero p  { font-size: 13px; opacity: .8; margin: 0; }
      .cab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media(max-width:768px){ .cab-grid { grid-template-columns: 1fr; } }
      .cab-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 20px; }
      .cab-section { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary); padding-bottom: 8px;
        border-bottom: 1px solid var(--border); margin: 16px 0 12px; }
      .cab-section:first-child { margin-top: 0; }
      .cab-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
      .cab-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
      .cab-input-wrap { position: relative; margin-bottom: 4px; }
      .cab-input-wrap input, .cab-input-wrap select {
        width: 100%; padding: 8px 40px 8px 10px;
        background: var(--bg-primary); border: 1px solid var(--border);
        border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px; }
      .cab-input-wrap .cab-unit { position: absolute; right: 8px; top: 50%;
        transform: translateY(-50%); font-size: 11px; color: var(--text-tertiary); pointer-events: none; }
      .cab-stat { display: flex; justify-content: space-between; align-items: center;
        padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
      .cab-stat:last-child { border: none; }
      .cab-stat-val { font-weight: 700; font-size: 15px; }
      .cab-stat-val.ok   { color: #10b981; }
      .cab-stat-val.warn { color: #f59e0b; }
      .cab-stat-val.fail { color: #ef4444; }
      .cab-result-box { border-radius: var(--radius-lg); padding: 20px; margin-bottom: 16px; text-align: center; }
      .cab-result-box.ok   { background: rgba(16,185,129,.1);  border: 2px solid #10b981; }
      .cab-result-box.warn { background: rgba(245,158,11,.1);  border: 2px solid #f59e0b; }
      .cab-result-box.fail { background: rgba(239,68,68,.1);   border: 2px solid #ef4444; }
      .cab-section-btn { padding: 10px; border: 2px solid var(--border);
        border-radius: var(--radius-md); background: var(--bg-primary); cursor: pointer;
        text-align: center; font-size: 12px; transition: all .2s; width: 100%; margin-bottom: 6px; }
      .cab-section-btn.active { border-color: #f59e0b; background: rgba(245,158,11,.1);
        color: #d97706; font-weight: 600; }
      .cab-section-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 12px; }
      .cab-norm-box { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.3);
        border-radius: var(--radius-md); padding: 10px 14px; font-size: 12px; line-height: 1.6;
        color: var(--text-secondary); margin-top: 12px; }
    `;
    document.head.appendChild(s);
  }

  // Sections câbles normalisées (mm²) et intensités admissibles (A) — NF C15-100
  // Pose encastrée / sous conduit
  const SECTIONS = [
    { s:1.5,   iz_mono:15,  iz_tri:13  },
    { s:2.5,   iz_mono:20,  iz_tri:18  },
    { s:4,     iz_mono:27,  iz_tri:24  },
    { s:6,     iz_mono:34,  iz_tri:31  },
    { s:10,    iz_mono:46,  iz_tri:41  },
    { s:16,    iz_mono:61,  iz_tri:54  },
    { s:25,    iz_mono:80,  iz_tri:70  },
    { s:35,    iz_mono:99,  iz_tri:86  },
    { s:50,    iz_mono:119, iz_tri:103 },
    { s:70,    iz_mono:151, iz_tri:130 },
  ];

  div.innerHTML = `
    <div class="cab-hero">
      <h1>💡 Section Câble — NF C15-100</h1>
      <p>Calcul section, intensité admissible, chute de tension — Installation électrique</p>
    </div>

    <div class="cab-grid">
      <div class="cab-panel">

        <div class="cab-section">⚡ Circuit électrique</div>
        <div class="cab-row">
          <div>
            <div class="cab-label">Type de réseau</div>
            <div class="cab-input-wrap">
              <select id="cab-reseau" onchange="Cable.compute()">
                <option value="mono">Monophasé 230V</option>
                <option value="tri">Triphasé 400V</option>
              </select>
            </div>
          </div>
          <div>
            <div class="cab-label">Mode de pose</div>
            <div class="cab-input-wrap">
              <select id="cab-pose" onchange="Cable.compute()">
                <option value="encastre">Encastré / Sous conduit</option>
                <option value="apparent">Apparent / Chemin de câble</option>
                <option value="terre">Enterré</option>
              </select>
            </div>
          </div>
        </div>

        <div class="cab-section">🔌 Charge et distance</div>
        <div class="cab-row">
          <div>
            <div class="cab-label">Puissance totale</div>
            <div class="cab-input-wrap">
              <input type="number" id="cab-puissance" value="3000" min="100" step="100" oninput="Cable.compute()">
              <span class="cab-unit">W</span>
            </div>
          </div>
          <div>
            <div class="cab-label">Facteur de puissance cos φ</div>
            <div class="cab-input-wrap">
              <input type="number" id="cab-cosphi" value="1" min="0.5" max="1" step="0.05" oninput="Cable.compute()">
              <span class="cab-unit">—</span>
            </div>
          </div>
        </div>
        <div class="cab-row">
          <div>
            <div class="cab-label">Longueur câble aller-retour</div>
            <div class="cab-input-wrap">
              <input type="number" id="cab-longueur" value="20" min="1" step="1" oninput="Cable.compute()">
              <span class="cab-unit">m</span>
            </div>
          </div>
          <div>
            <div class="cab-label">Chute de tension max</div>
            <div class="cab-input-wrap">
              <select id="cab-dv-max" onchange="Cable.compute()">
                <option value="3">3% — Éclairage (NF C15-100)</option>
                <option value="5" selected>5% — Force motrice</option>
                <option value="8">8% — Tolérance élargie</option>
              </select>
            </div>
          </div>
        </div>

        <div class="cab-section">🌡️ Conditions de pose</div>
        <div class="cab-row">
          <div>
            <div class="cab-label">Température ambiante</div>
            <div class="cab-input-wrap">
              <select id="cab-temp" onchange="Cable.compute()">
                <option value="1">≤ 25°C (coeff. 1.0)</option>
                <option value="0.94" selected>30°C (coeff. 0.94)</option>
                <option value="0.87">35°C (coeff. 0.87)</option>
                <option value="0.79">40°C (coeff. 0.79)</option>
                <option value="0.71">45°C (coeff. 0.71)</option>
              </select>
            </div>
          </div>
          <div>
            <div class="cab-label">Nb circuits groupés</div>
            <div class="cab-input-wrap">
              <select id="cab-groupes" onchange="Cable.compute()">
                <option value="1">1 circuit (coeff. 1.0)</option>
                <option value="0.8" selected>2-3 circuits (coeff. 0.8)</option>
                <option value="0.7">4-5 circuits (coeff. 0.7)</option>
                <option value="0.6">6-8 circuits (coeff. 0.6)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="cab-norm-box" id="cab-norme-info">
          📋 <b>NF C15-100</b> — Installations électriques à basse tension.<br>
          Chute de tension max : 3% éclairage / 5% force motrice depuis l'origine.
        </div>

      </div>

      <div class="cab-panel">
        <div class="cab-section">📊 Résultats</div>
        <div id="cab-resultats">
          <div style="text-align:center;color:var(--text-tertiary);padding:40px 0;font-size:13px">
            Renseignez les paramètres pour voir les résultats
          </div>
        </div>
        <div id="cab-actions" style="display:none;margin-top:16px">
          <button class="btn btn-primary" style="width:100%;margin-bottom:8px" onclick="Cable.exportPDF()">
            📄 Exporter rapport PDF
          </button>
        </div>
      </div>
    </div>
  `;

  window.Cable._sections = SECTIONS;
  setTimeout(() => Cable.compute(), 50);
  return div;
};

const Cable = {
  _sections: [],
  _last: null,

  compute() {
    const reseau   = document.getElementById('cab-reseau')?.value || 'mono';
    const puissance = parseFloat(document.getElementById('cab-puissance')?.value) || 0;
    const cosPhi   = parseFloat(document.getElementById('cab-cosphi')?.value) || 1;
    const longueur = parseFloat(document.getElementById('cab-longueur')?.value) || 0;
    const dvMax    = parseFloat(document.getElementById('cab-dv-max')?.value) || 5;
    const kTemp    = parseFloat(document.getElementById('cab-temp')?.value) || 0.94;
    const kGroupe  = parseFloat(document.getElementById('cab-groupes')?.value) || 0.8;

    if (puissance <= 0 || longueur <= 0) return;

    const tension = reseau === 'mono' ? 230 : 400;
    const sqrt3   = reseau === 'tri'  ? Math.sqrt(3) : 1;

    // Intensité de calcul
    const intensite = reseau === 'mono'
      ? puissance / (tension * cosPhi)
      : puissance / (sqrt3 * tension * cosPhi);

    // Intensité corrigée (coefficients)
    const kTotal = kTemp * kGroupe;
    const intensiteCorrigee = intensite / kTotal;

    // Résistivité cuivre (Ω·mm²/m)
    const rho = 0.01786;

    // Section minimale par chute de tension
    const dvMaxV  = (dvMax / 100) * tension;
    const sMin_dv = reseau === 'mono'
      ? (2 * rho * longueur * intensite) / dvMaxV
      : (sqrt3 * rho * longueur * intensite) / dvMaxV;

    // Section recommandée (la plus petite section normalisée ≥ aux deux critères)
    const sections = this._sections;
    const sectionChoisie = sections.find(s => {
      const iz = reseau === 'mono' ? s.iz_mono : s.iz_tri;
      const izCorrigee = iz * kTotal;
      return izCorrigee >= intensiteCorrigee && s.s >= sMin_dv;
    }) || sections[sections.length - 1];

    // Chute de tension avec la section choisie
    const dvReel = reseau === 'mono'
      ? (2 * rho * longueur * intensite / sectionChoisie.s) / tension * 100
      : (sqrt3 * rho * longueur * intensite / sectionChoisie.s) / tension * 100;

    const dvOk = dvReel <= dvMax;
    const iz = reseau === 'mono' ? sectionChoisie.iz_mono : sectionChoisie.iz_tri;
    const izCorrigee = iz * kTotal;
    const chargeOk = intensiteCorrigee <= izCorrigee;

    const cls = dvOk && chargeOk ? 'ok' : !chargeOk ? 'fail' : 'warn';
    const icon = cls === 'ok' ? '✅' : cls === 'warn' ? '⚠️' : '❌';

    // Disjoncteur recommandé
    const discj = [6,10,16,20,25,32,40,50,63].find(d => d >= intensite) || 63;

    document.getElementById('cab-resultats').innerHTML = `
      <div class="cab-result-box ${cls}">
        <div style="font-size:36px">${icon}</div>
        <div style="font-size:28px;font-weight:900;color:${cls==='ok'?'#10b981':cls==='warn'?'#f59e0b':'#ef4444'}">
          ${sectionChoisie.s} mm²
        </div>
        <div style="font-size:14px;font-weight:600;margin-top:4px">Section recommandée</div>
        <div style="font-size:12px;opacity:.8;margin-top:4px">
          ${dvOk && chargeOk ? 'Conforme NF C15-100' : !chargeOk ? 'Attention : intensité limite dépassée' : 'Chute de tension limite'}
        </div>
      </div>

      <div class="cab-stat"><span>Intensité de calcul</span>
        <span class="cab-stat-val">${intensite.toFixed(2)} A</span></div>
      <div class="cab-stat"><span>Intensité corrigée (coeff. ${kTotal.toFixed(2)})</span>
        <span class="cab-stat-val">${intensiteCorrigee.toFixed(2)} A</span></div>
      <div class="cab-stat"><span>Iz admissible (section ${sectionChoisie.s} mm²)</span>
        <span class="cab-stat-val ${chargeOk?'ok':'fail'}">${izCorrigee.toFixed(1)} A ${chargeOk?'✅':'❌'}</span></div>
      <div class="cab-stat"><span>Section min. par chute tension</span>
        <span class="cab-stat-val">${sMin_dv.toFixed(2)} mm²</span></div>
      <div class="cab-stat"><span>Chute de tension réelle</span>
        <span class="cab-stat-val ${dvOk?'ok':'fail'}">${dvReel.toFixed(2)}% ${dvOk?'✅':'❌'} (max ${dvMax}%)</span></div>
      <div class="cab-stat"><span>Disjoncteur recommandé</span>
        <span class="cab-stat-val">${discj} A</span></div>
      <div class="cab-stat"><span>Tension réseau</span>
        <span class="cab-stat-val">${tension} V ${reseau==='mono'?'monophasé':'triphasé'}</span></div>

      <div style="margin-top:14px;background:var(--bg-primary);border-radius:var(--radius-md);padding:12px;font-size:12px">
        <div style="font-weight:600;margin-bottom:8px;color:var(--text-secondary)">📋 Toutes les sections</div>
        ${sections.map(s => {
          const iz2 = reseau === 'mono' ? s.iz_mono : s.iz_tri;
          const izC = iz2 * kTotal;
          const dv2 = reseau === 'mono'
            ? (2 * rho * longueur * intensite / s.s) / tension * 100
            : (sqrt3 * rho * longueur * intensite / s.s) / tension * 100;
          const ok2 = izC >= intensiteCorrigee && dv2 <= dvMax;
          const sel = s.s === sectionChoisie.s;
          return `<div style="display:flex;justify-content:space-between;padding:4px 0;
            border-bottom:1px solid var(--border);${sel?'font-weight:700;color:var(--accent)':''}">
            <span>${s.s} mm²</span>
            <span>Iz=${izC.toFixed(0)}A</span>
            <span>ΔU=${dv2.toFixed(1)}%</span>
            <span>${ok2?'✅':'❌'}${sel?' ←':''}</span>
          </div>`;
        }).join('')}
      </div>
    `;

    this._last = { reseau, puissance, cosPhi, longueur, dvMax, kTemp, kGroupe,
      tension, intensite, intensiteCorrigee, kTotal, sectionChoisie, dvReel,
      dvOk, chargeOk, cls, icon, discj, sMin_dv, izCorrigee };

    document.getElementById('cab-actions').style.display = 'block';
  },

  exportPDF() {
    const r = this._last;
    if (!r) return;
    const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    const entreprise = config.nom || 'AATB';
    const date = new Date().toLocaleDateString('fr-FR');
    const verdictColor = r.cls === 'ok' ? '#10b981' : r.cls === 'warn' ? '#f59e0b' : '#ef4444';

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Rapport Section Câble — ${entreprise}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;margin:0;padding:30px}
      .header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #f59e0b;margin-bottom:24px}
      .header-title{font-size:22px;font-weight:800;color:#f59e0b}
      .result-box{border-radius:8px;padding:20px;text-align:center;margin-bottom:20px;
        border:2px solid ${verdictColor};background:${verdictColor}15}
      .result-section{font-size:40px;font-weight:900;color:${verdictColor}}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th{background:#f59e0b;color:#fff;padding:8px 10px;text-align:left;font-size:12px}
      td{padding:8px 10px;border-bottom:1px solid #eee;font-size:12px}
      tr:nth-child(even) td{background:#fffbeb}
      .section-title{font-size:13px;font-weight:700;color:#f59e0b;text-transform:uppercase;
        letter-spacing:.05em;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #f59e0b}
      .footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#888;display:flex;justify-content:space-between}
      @media print{body{padding:15px}}
    </style></head><body>
    <div class="header">
      <div><div class="header-title">💡 Rapport Section Câble</div>
        <div style="font-size:12px;color:#666;margin-top:4px">Calcul NF C15-100 — Installation BT</div></div>
      <div style="text-align:right;font-size:12px;color:#666"><b>${entreprise}</b><br>Date : ${date}</div>
    </div>
    <div class="result-box">
      <div style="font-size:24px">${r.icon}</div>
      <div style="font-size:14px;color:#444;margin-bottom:8px">Section recommandée</div>
      <div class="result-section">${r.sectionChoisie.s} mm²</div>
      <div style="font-size:13px;color:#444;margin-top:8px">
        Disjoncteur : <b>${r.discj} A</b> — Chute tension : <b>${r.dvReel.toFixed(2)}%</b>
      </div>
    </div>
    <div class="section-title">Paramètres du circuit</div>
    <table><tbody>
      <tr><td>Type de réseau</td><td><b>${r.tension}V ${r.reseau==='mono'?'Monophasé':'Triphasé'}</b></td></tr>
      <tr><td>Puissance</td><td><b>${r.puissance} W</b></td></tr>
      <tr><td>cos φ</td><td><b>${r.cosPhi}</b></td></tr>
      <tr><td>Longueur câble</td><td><b>${r.longueur} m</b></td></tr>
      <tr><td>Chute de tension max</td><td><b>${r.dvMax}%</b></td></tr>
      <tr><td>Coefficient température</td><td><b>${r.kTemp}</b></td></tr>
      <tr><td>Coefficient groupement</td><td><b>${r.kGroupe}</b></td></tr>
      <tr><td>Coefficient global</td><td><b>${r.kTotal.toFixed(2)}</b></td></tr>
    </tbody></table>
    <div class="section-title">Résultats de calcul</div>
    <table><tbody>
      <tr><td>Intensité de calcul</td><td><b>${r.intensite.toFixed(2)} A</b></td></tr>
      <tr><td>Intensité corrigée</td><td><b>${r.intensiteCorrigee.toFixed(2)} A</b></td></tr>
      <tr><td>Section min. chute tension</td><td><b>${r.sMin_dv.toFixed(2)} mm²</b></td></tr>
      <tr style="background:#fffbeb"><td><b>Section retenue</b></td><td><b>${r.sectionChoisie.s} mm²</b></td></tr>
      <tr><td>Iz admissible corrigée</td><td><b>${r.izCorrigee.toFixed(1)} A ${r.chargeOk?'✅':'❌'}</b></td></tr>
      <tr><td>Chute de tension réelle</td><td><b>${r.dvReel.toFixed(2)}% ${r.dvOk?'✅':'❌'}</b></td></tr>
      <tr><td>Disjoncteur recommandé</td><td><b>${r.discj} A</b></td></tr>
    </tbody></table>
    <div class="footer">
      <span>PlaqPro+ — ${entreprise}</span>
      <span>Référence : NF C15-100 — Installations électriques BT</span>
    </div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
};
