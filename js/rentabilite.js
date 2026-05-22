/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO+ — Simulateur Marge & Rentabilité Chantier
//  Apprendre à ne pas perdre de l'argent !
// ============================================================

Pages.rentabilite = function() {
  const div = document.createElement('div');

  if (!document.getElementById('style-rentabilite')) {
    const s = document.createElement('style');
    s.id = 'style-rentabilite';
    s.textContent = `
      .rent-hero { background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; color: #fff; }
      .rent-hero h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      .rent-hero p { font-size: 13px; opacity: .8; margin: 0; }
      .rent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media(max-width:768px){ .rent-grid { grid-template-columns: 1fr; } }
      .rent-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 20px; }
      .rent-section { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary); padding-bottom: 8px;
        border-bottom: 1px solid var(--border); margin: 16px 0 12px; }
      .rent-section:first-child { margin-top: 0; }
      .rent-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
      .rent-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
      .rent-input-wrap { position: relative; }
      .rent-input-wrap input { width: 100%; padding: 8px 36px 8px 10px;
        background: var(--bg-primary); border: 1px solid var(--border);
        border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px; }
      .rent-input-wrap .rent-unit { position: absolute; right: 8px; top: 50%;
        transform: translateY(-50%); font-size: 11px; color: var(--text-tertiary); pointer-events: none; }
      .rent-stat { display: flex; justify-content: space-between; align-items: center;
        padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
      .rent-stat:last-child { border: none; }
      .rent-stat-val { font-weight: 700; font-size: 15px; }
      .rent-stat-val.green { color: #10b981; }
      .rent-stat-val.orange { color: #f59e0b; }
      .rent-stat-val.red { color: #ef4444; }
      .rent-gauge-wrap { margin: 10px 0; }
      .rent-gauge-label { display: flex; justify-content: space-between; font-size: 12px;
        color: var(--text-secondary); margin-bottom: 6px; }
      .rent-gauge-bg { height: 14px; background: var(--bg-primary); border-radius: 7px;
        overflow: hidden; border: 1px solid var(--border); }
      .rent-gauge-fill { height: 100%; border-radius: 7px; transition: width .4s, background .4s; }
      .rent-alerte { border-radius: var(--radius-md); padding: 12px 16px;
        font-size: 13px; line-height: 1.6; margin-bottom: 10px; }
      .rent-alerte.ok   { background: rgba(16,185,129,.1);  border-left: 4px solid #10b981; }
      .rent-alerte.warn { background: rgba(245,158,11,.1);  border-left: 4px solid #f59e0b; }
      .rent-alerte.fail { background: rgba(239,68,68,.1);   border-left: 4px solid #ef4444; }
      .rent-big { font-size: 36px; font-weight: 900; text-align: center; margin: 8px 0; }
    `;
    document.head.appendChild(s);
  }

  div.innerHTML = `
    <div class="rent-hero">
      <h1>💰 Simulateur Marge & Rentabilité</h1>
      <p>Calculez votre vraie rentabilité — arrêtez de perdre de l'argent !</p>
    </div>

    <div class="rent-grid">
      <div class="rent-panel">

        <div class="rent-section">📋 Chantier</div>
        <div class="rent-row">
          <div><div class="rent-label">Prix vendu HT</div>
            <div class="rent-input-wrap"><input type="number" id="r-prix-vente" value="15000" min="0" step="100" oninput="Rent.compute()"><span class="rent-unit">€</span></div>
          </div>
          <div><div class="rent-label">Durée chantier</div>
            <div class="rent-input-wrap"><input type="number" id="r-duree" value="5" min="0.5" step="0.5" oninput="Rent.compute()"><span class="rent-unit">j</span></div>
          </div>
        </div>

        <div class="rent-section">🧱 Matériaux</div>
        <div class="rent-row">
          <div><div class="rent-label">Achat matériaux HT</div>
            <div class="rent-input-wrap"><input type="number" id="r-mat" value="3500" min="0" step="100" oninput="Rent.compute()"><span class="rent-unit">€</span></div>
          </div>
          <div><div class="rent-label">Location matériel</div>
            <div class="rent-input-wrap"><input type="number" id="r-loc" value="200" min="0" step="50" oninput="Rent.compute()"><span class="rent-unit">€</span></div>
          </div>
        </div>

        <div class="rent-section">👷 Main d'œuvre</div>
        <div class="rent-row">
          <div><div class="rent-label">Nb compagnons</div>
            <div class="rent-input-wrap"><input type="number" id="r-nb-comp" value="2" min="1" max="20" oninput="Rent.compute()"><span class="rent-unit">pers</span></div>
          </div>
          <div><div class="rent-label">Coût chargé / jour</div>
            <div class="rent-input-wrap"><input type="number" id="r-cout-comp" value="350" min="100" step="10" oninput="Rent.compute()"><span class="rent-unit">€/j</span></div>
          </div>
        </div>
        <div class="rent-row">
          <div><div class="rent-label">Jours chef chantier</div>
            <div class="rent-input-wrap"><input type="number" id="r-nb-chef" value="1" min="0" step="0.5" oninput="Rent.compute()"><span class="rent-unit">j</span></div>
          </div>
          <div><div class="rent-label">Coût chargé chef / j</div>
            <div class="rent-input-wrap"><input type="number" id="r-cout-chef" value="450" min="100" step="10" oninput="Rent.compute()"><span class="rent-unit">€/j</span></div>
          </div>
        </div>

        <div class="rent-section">🚗 Frais annexes</div>
        <div class="rent-row">
          <div><div class="rent-label">Transport</div>
            <div class="rent-input-wrap"><input type="number" id="r-transport" value="150" min="0" step="10" oninput="Rent.compute()"><span class="rent-unit">€</span></div>
          </div>
          <div><div class="rent-label">Benne / évacuation</div>
            <div class="rent-input-wrap"><input type="number" id="r-benne" value="0" min="0" step="50" oninput="Rent.compute()"><span class="rent-unit">€</span></div>
          </div>
        </div>
        <div class="rent-row">
          <div><div class="rent-label">Sous-traitance</div>
            <div class="rent-input-wrap"><input type="number" id="r-st" value="0" min="0" step="100" oninput="Rent.compute()"><span class="rent-unit">€</span></div>
          </div>
          <div><div class="rent-label">Frais divers</div>
            <div class="rent-input-wrap"><input type="number" id="r-divers" value="100" min="0" step="50" oninput="Rent.compute()"><span class="rent-unit">€</span></div>
          </div>
        </div>

        <div class="rent-section">⚙️ Paramètres financiers</div>
        <div class="rent-row">
          <div><div class="rent-label">Taux frais généraux</div>
            <div class="rent-input-wrap"><input type="number" id="r-fg" value="12" min="0" max="50" step="1" oninput="Rent.compute()"><span class="rent-unit">%</span></div>
          </div>
          <div><div class="rent-label">Objectif marge nette</div>
            <div class="rent-input-wrap"><input type="number" id="r-objectif" value="15" min="0" max="100" step="1" oninput="Rent.compute()"><span class="rent-unit">%</span></div>
          </div>
        </div>

      </div>

      <div class="rent-panel">
        <div class="rent-section">📊 Résultats</div>
        <div id="rent-verdict"></div>
        <div id="rent-details" style="display:none">
          <div class="rent-section">🔢 Décomposition</div>
          <div id="rent-stats"></div>
          <div class="rent-section" style="margin-top:16px">📈 Jauges</div>
          <div id="rent-jauges"></div>
          <div class="rent-section" style="margin-top:16px">⚠️ Alertes</div>
          <div id="rent-alertes"></div>
          <div style="margin-top:20px;display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-primary" onclick="Rent.exportPDF()">📄 Exporter rapport PDF</button>
            <button class="btn btn-secondary" onclick="Rent.reset()">🔄 Réinitialiser</button>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => Rent.compute(), 50);
  return div;
};

const Rent = {
  _last: null,

  compute() {
    const v = id => parseFloat(document.getElementById(id)?.value) || 0;
    const prixVente = v('r-prix-vente');
    const duree     = v('r-duree');
    const mat       = v('r-mat');
    const loc       = v('r-loc');
    const nbComp    = v('r-nb-comp');
    const coutComp  = v('r-cout-comp');
    const nbChef    = v('r-nb-chef');
    const coutChef  = v('r-cout-chef');
    const transport = v('r-transport');
    const benne     = v('r-benne');
    const st        = v('r-st');
    const divers    = v('r-divers');
    const tauxFG    = v('r-fg') / 100;
    const objectif  = v('r-objectif') / 100;

    if (prixVente <= 0) return;

    const coutMO      = (nbComp * coutComp * duree) + (nbChef * coutChef * duree);
    const coutDirect  = mat + loc + coutMO + transport + benne + st + divers;
    const fraisGen    = coutDirect * tauxFG;
    const coutTotal   = coutDirect + fraisGen;
    const margeEuros  = prixVente - coutTotal;
    const margePct    = (margeEuros / prixVente) * 100;
    const caJour      = duree > 0 ? prixVente / duree : 0;
    const coutJour    = duree > 0 ? coutTotal / duree : 0;
    const prixMinVente = coutTotal / (1 - objectif);
    const tauxMat     = (mat / prixVente) * 100;
    const tauxMO      = (coutMO / prixVente) * 100;

    let verdictClass, verdictIcon, verdictTitre, verdictSub;
    if (margePct >= objectif * 100) {
      verdictClass = 'ok';   verdictIcon = '✅';
      verdictTitre = 'Chantier rentable';
      verdictSub   = `Marge ${margePct.toFixed(1)}% — objectif ${(objectif*100).toFixed(0)}% atteint`;
    } else if (margePct >= 5) {
      verdictClass = 'warn'; verdictIcon = '⚠️';
      verdictTitre = 'Marge insuffisante';
      verdictSub   = `Marge ${margePct.toFixed(1)}% — sous l'objectif de ${(objectif*100).toFixed(0)}%`;
    } else if (margePct >= 0) {
      verdictClass = 'fail'; verdictIcon = '🚨';
      verdictTitre = 'Chantier à risque';
      verdictSub   = `Marge ${margePct.toFixed(1)}% — le moindre aléa = perte`;
    } else {
      verdictClass = 'fail'; verdictIcon = '❌';
      verdictTitre = 'Chantier déficitaire !';
      verdictSub   = `Perte de ${Math.abs(margeEuros).toFixed(0)} € — vous travaillez à perte`;
    }

    const gaugeColor = margePct >= objectif*100 ? '#10b981' : margePct >= 5 ? '#f59e0b' : '#ef4444';

    const alertes = [];
    if (tauxMat > 40) alertes.push({ cls:'warn', msg:`⚠️ Matériaux = ${tauxMat.toFixed(0)}% du CA — vérifiez vos prix fournisseurs.` });
    if (tauxMO  > 50) alertes.push({ cls:'warn', msg:`⚠️ Main d'œuvre = ${tauxMO.toFixed(0)}% du CA — chantier très labor-intensif.` });
    if (st > prixVente * 0.3) alertes.push({ cls:'warn', msg:`⚠️ Sous-traitance = ${(st/prixVente*100).toFixed(0)}% du CA — valeur ajoutée faible.` });
    if (margePct < 0) alertes.push({ cls:'fail', msg:`❌ Prix minimum pour ${(objectif*100).toFixed(0)}% de marge : ${prixMinVente.toFixed(0)} € HT.` });
    else if (margePct < objectif*100) alertes.push({ cls:'warn', msg:`💡 Pour atteindre votre objectif : ${prixMinVente.toFixed(0)} € HT (+ ${(prixMinVente-prixVente).toFixed(0)} €).` });
    if (alertes.length === 0) alertes.push({ cls:'ok', msg:`✅ Tous les ratios sont dans les normes. Bon chantier !` });

    this._last = { prixVente, duree, mat, loc, coutMO, transport, benne, st, divers,
      coutDirect, fraisGen, coutTotal, margeEuros, margePct, caJour, coutJour,
      prixMinVente, tauxMat, tauxMO, objectif, verdictTitre, verdictSub,
      verdictClass, verdictIcon, gaugeColor, alertes };

    this._render();
  },

  _render() {
    const r   = this._last;
    const fmt = n => n.toLocaleString('fr-FR', {maximumFractionDigits:0}) + ' €';
    const pct = n => n.toFixed(1) + '%';

    document.getElementById('rent-verdict').innerHTML = `
      <div class="rent-alerte ${r.verdictClass}" style="text-align:center;padding:20px">
        <div style="font-size:36px">${r.verdictIcon}</div>
        <div style="font-size:20px;font-weight:800;margin:8px 0">${r.verdictTitre}</div>
        <div style="font-size:13px;opacity:.8">${r.verdictSub}</div>
        <div class="rent-big" style="color:${r.gaugeColor}">${pct(r.margePct)}</div>
        <div style="font-size:14px">Marge nette : <b>${fmt(r.margeEuros)}</b></div>
      </div>`;

    document.getElementById('rent-stats').innerHTML = `
      <div class="rent-stat"><span>Prix vendu HT</span><span class="rent-stat-val">${fmt(r.prixVente)}</span></div>
      <div class="rent-stat"><span>— Matériaux + location</span><span class="rent-stat-val red">− ${fmt(r.mat+r.loc)}</span></div>
      <div class="rent-stat"><span>— Main d'œuvre chargée</span><span class="rent-stat-val red">− ${fmt(r.coutMO)}</span></div>
      <div class="rent-stat"><span>— Transport + benne + divers</span><span class="rent-stat-val red">− ${fmt(r.transport+r.benne+r.divers)}</span></div>
      <div class="rent-stat"><span>— Sous-traitance</span><span class="rent-stat-val red">− ${fmt(r.st)}</span></div>
      <div class="rent-stat"><span>— Frais généraux</span><span class="rent-stat-val red">− ${fmt(r.fraisGen)}</span></div>
      <div class="rent-stat" style="font-weight:700"><span>= Marge nette</span>
        <span class="rent-stat-val ${r.margeEuros>=0?'green':'red'}">${fmt(r.margeEuros)}</span></div>
      <div class="rent-stat"><span>Coût de revient total</span><span class="rent-stat-val">${fmt(r.coutTotal)}</span></div>
      <div class="rent-stat"><span>CA par jour</span><span class="rent-stat-val">${fmt(r.caJour)}</span></div>
      <div class="rent-stat"><span>Coût par jour</span><span class="rent-stat-val">${fmt(r.coutJour)}</span></div>
      <div class="rent-stat"><span>Prix mini (objectif ${pct(r.objectif*100)})</span>
        <span class="rent-stat-val orange">${fmt(r.prixMinVente)}</span></div>`;

    const gPct = Math.min(Math.max(r.margePct, 0), 50);
    document.getElementById('rent-jauges').innerHTML = `
      <div class="rent-gauge-wrap">
        <div class="rent-gauge-label"><span>Marge nette</span><span>${pct(r.margePct)}</span></div>
        <div class="rent-gauge-bg"><div class="rent-gauge-fill" style="width:${gPct*2}%;background:${r.gaugeColor}"></div></div>
      </div>
      <div class="rent-gauge-wrap">
        <div class="rent-gauge-label"><span>Part matériaux / CA</span><span>${pct(r.tauxMat)}</span></div>
        <div class="rent-gauge-bg"><div class="rent-gauge-fill" style="width:${Math.min(r.tauxMat,100)}%;background:${r.tauxMat>40?'#f59e0b':'#10b981'}"></div></div>
      </div>
      <div class="rent-gauge-wrap">
        <div class="rent-gauge-label"><span>Part main d'œuvre / CA</span><span>${pct(r.tauxMO)}</span></div>
        <div class="rent-gauge-bg"><div class="rent-gauge-fill" style="width:${Math.min(r.tauxMO,100)}%;background:${r.tauxMO>50?'#f59e0b':'#4F8EF7'}"></div></div>
      </div>`;

    document.getElementById('rent-alertes').innerHTML = r.alertes.map(a =>
      `<div class="rent-alerte ${a.cls}">${a.msg}</div>`).join('');

    document.getElementById('rent-details').style.display = 'block';
  },

  exportPDF() {
    const r = this._last;
    if (!r) return;
    const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    const entreprise = config.nom || 'AATB';
    const date = new Date().toLocaleDateString('fr-FR');
    const fmt = n => n.toLocaleString('fr-FR', {maximumFractionDigits:2, minimumFractionDigits:2}) + ' €';
    const pct = n => n.toFixed(1) + '%';
    const verdictColor = r.verdictClass === 'ok' ? '#10b981' : r.verdictClass === 'warn' ? '#f59e0b' : '#ef4444';

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Rapport Rentabilité — ${entreprise}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;margin:0;padding:30px}
      .header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #10b981;margin-bottom:24px}
      .header-title{font-size:22px;font-weight:800;color:#10b981}
      .verdict{border-radius:8px;padding:20px;margin:16px 0;text-align:center;border:2px solid ${verdictColor};background:${verdictColor}18}
      .verdict-marge{font-size:40px;font-weight:900;color:${verdictColor}}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th{background:#10b981;color:#fff;padding:8px 10px;text-align:left;font-size:12px}
      td{padding:8px 10px;border-bottom:1px solid #eee;font-size:12px}
      tr:nth-child(even) td{background:#f0fdf4}
      .section-title{font-size:13px;font-weight:700;color:#10b981;text-transform:uppercase;
        letter-spacing:.05em;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #10b981}
      .alerte{border-radius:6px;padding:10px 14px;margin-bottom:8px;font-size:12px}
      .alerte.ok{background:#f0fdf4;border-left:4px solid #10b981}
      .alerte.warn{background:#fffbeb;border-left:4px solid #f59e0b}
      .alerte.fail{background:#fef2f2;border-left:4px solid #ef4444}
      .footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#888;display:flex;justify-content:space-between}
      @media print{body{padding:15px}}
    </style></head><body>
    <div class="header">
      <div><div class="header-title">💰 Rapport Marge & Rentabilité</div>
        <div style="font-size:12px;color:#666;margin-top:4px">Analyse financière chantier</div></div>
      <div style="text-align:right;font-size:12px;color:#666"><b>${entreprise}</b><br>Date : ${date}</div>
    </div>
    <div class="verdict">
      <div style="font-size:36px">${r.verdictIcon}</div>
      <div style="font-size:20px;font-weight:800;color:${verdictColor};margin:8px 0">${r.verdictTitre}</div>
      <div class="verdict-marge">${pct(r.margePct)}</div>
      <div style="font-size:14px;color:#444;margin-top:4px">Marge nette : <b>${fmt(r.margeEuros)}</b></div>
    </div>
    <div class="section-title">Décomposition financière</div>
    <table><tbody>
      <tr><td>Prix vendu HT</td><td style="text-align:right"><b>${fmt(r.prixVente)}</b></td><td></td></tr>
      <tr><td>Matériaux + location</td><td style="text-align:right">− ${fmt(r.mat+r.loc)}</td><td style="color:#888">${pct((r.mat+r.loc)/r.prixVente*100)} du CA</td></tr>
      <tr><td>Main d'œuvre chargée</td><td style="text-align:right">− ${fmt(r.coutMO)}</td><td style="color:#888">${pct(r.tauxMO)} du CA</td></tr>
      <tr><td>Transport + benne + divers</td><td style="text-align:right">− ${fmt(r.transport+r.benne+r.divers)}</td><td></td></tr>
      <tr><td>Sous-traitance</td><td style="text-align:right">− ${fmt(r.st)}</td><td></td></tr>
      <tr><td>Frais généraux</td><td style="text-align:right">− ${fmt(r.fraisGen)}</td><td></td></tr>
      <tr style="background:#f0fdf4"><td><b>Marge nette</b></td><td style="text-align:right"><b>${fmt(r.margeEuros)}</b></td><td><b>${pct(r.margePct)}</b></td></tr>
    </tbody></table>
    <div class="section-title">Indicateurs clés</div>
    <table><tbody>
      <tr><td>Coût de revient total</td><td><b>${fmt(r.coutTotal)}</b></td></tr>
      <tr><td>CA par jour travaillé</td><td><b>${fmt(r.caJour)}</b></td></tr>
      <tr><td>Coût par jour travaillé</td><td><b>${fmt(r.coutJour)}</b></td></tr>
      <tr><td>Prix minimum (objectif ${pct(r.objectif*100)})</td><td><b>${fmt(r.prixMinVente)}</b></td></tr>
    </tbody></table>
    <div class="section-title">Alertes & Recommandations</div>
    ${r.alertes.map(a => `<div class="alerte ${a.cls}">${a.msg}</div>`).join('')}
    <div class="footer">
      <span>PlaqPro+ — ${entreprise}</span>
      <span>Document confidentiel — usage interne</span>
    </div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  },

  reset() {
    document.getElementById('rent-details').style.display = 'none';
    document.getElementById('rent-verdict').innerHTML = '';
  }
};
