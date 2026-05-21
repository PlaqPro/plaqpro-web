// ============================================================
//  PLAQPRO+ — Résistance au Feu EI30 / EI60 / EI90 / EI120
//  Choix cloison/doublage selon exigence réglementaire
// ============================================================

Pages.resistanceFeu = function() {
  const div = document.createElement('div');

  if (!document.getElementById('style-rf')) {
    const s = document.createElement('style');
    s.id = 'style-rf';
    s.textContent = `
      .rf-hero { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; color: #fff; }
      .rf-hero h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      .rf-hero p  { font-size: 13px; opacity: .8; margin: 0; }
      .rf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media(max-width:768px){ .rf-grid { grid-template-columns: 1fr; } }
      .rf-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 20px; }
      .rf-section { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary); padding-bottom: 8px;
        border-bottom: 1px solid var(--border); margin: 16px 0 12px; }
      .rf-section:first-child { margin-top: 0; }
      .rf-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
      .rf-input-wrap { position: relative; margin-bottom: 12px; }
      .rf-input-wrap select { width: 100%; padding: 10px 12px;
        background: var(--bg-primary); border: 1px solid var(--border);
        border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px; }
      .rf-exigence-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
      .rf-exigence-btn { padding: 12px 8px; border: 2px solid var(--border);
        border-radius: var(--radius-md); background: var(--bg-primary); cursor: pointer;
        text-align: center; transition: all .2s; }
      .rf-exigence-btn .rf-ei { font-size: 20px; font-weight: 900; color: var(--text-primary); }
      .rf-exigence-btn .rf-ei-sub { font-size: 10px; color: var(--text-tertiary); margin-top: 2px; }
      .rf-exigence-btn.active { border-color: #dc2626; background: rgba(220,38,38,.1); }
      .rf-exigence-btn.active .rf-ei { color: #dc2626; }
      .rf-card { border: 2px solid var(--border); border-radius: var(--radius-md);
        padding: 14px; margin-bottom: 10px; }
      .rf-card.ok   { border-color: #10b981; background: rgba(16,185,129,.06); }
      .rf-card.warn { border-color: #f59e0b; background: rgba(245,158,11,.06); }
      .rf-card.fail { border-color: #ef4444; background: rgba(239,68,68,.06); }
      .rf-card-name { font-weight: 700; font-size: 14px; }
      .rf-card-ei { font-size: 24px; font-weight: 900; }
      .rf-card-ei.ok   { color: #10b981; }
      .rf-card-ei.warn { color: #f59e0b; }
      .rf-card-ei.fail { color: #ef4444; }
      .rf-card-detail { font-size: 11px; color: var(--text-tertiary); margin-top: 4px; }
      .rf-badge { display:inline-block; padding: 2px 8px; border-radius: 20px;
        font-size: 11px; font-weight: 700; margin-left: 6px; }
      .rf-badge.ok   { background: #10b98120; color: #10b981; }
      .rf-badge.fail { background: #ef444420; color: #ef4444; }
      .rf-info-box { background: rgba(220,38,38,.08); border: 1px solid rgba(220,38,38,.3);
        border-radius: var(--radius-md); padding: 12px 16px; font-size: 12px;
        line-height: 1.7; color: var(--text-secondary); margin-top: 16px; }
    `;
    document.head.appendChild(s);
  }

  const SOLUTIONS = [
    // Cloisons
    { type:'cloison', nom:'M48 — 1×BA13',          ei:'EI30',  min:30,  ep:72,  desc:'Ossature 48mm, 1 plaque chaque face',               ref:'PV CSTB EI30', prix:45 },
    { type:'cloison', nom:'M48 — 2×BA13',          ei:'EI60',  min:60,  ep:98,  desc:'Ossature 48mm, 2 plaques chaque face',               ref:'PV CSTB EI60', prix:62 },
    { type:'cloison', nom:'M70 — 1×BA13',          ei:'EI30',  min:30,  ep:96,  desc:'Ossature 70mm, 1 plaque chaque face',               ref:'PV CSTB EI30', prix:52 },
    { type:'cloison', nom:'M70 — 2×BA13',          ei:'EI60',  min:60,  ep:122, desc:'Ossature 70mm, 2 plaques chaque face',               ref:'PV CSTB EI60', prix:72 },
    { type:'cloison', nom:'M48 — 1×Prégyfeu BA15F',ei:'EI60',  min:60,  ep:78,  desc:'Ossature 48mm + plaque feu Prégyfeu BA15F',          ref:'PV CSTB EI60', prix:75 },
    { type:'cloison', nom:'M70 — 1×Prégyfeu BA15F',ei:'EI90',  min:90,  ep:104, desc:'Ossature 70mm + Prégyfeu BA15F chaque face',         ref:'PV CSTB EI90', prix:88 },
    { type:'cloison', nom:'M70 — 2×Prégyfeu BA15F',ei:'EI120', min:120, ep:130, desc:'Ossature 70mm, 2× Prégyfeu BA15F chaque face',       ref:'PV CSTB EI120',prix:115 },
    { type:'cloison', nom:'Double ossature — Prégyfeu',ei:'EI120',min:120,ep:200,desc:'Double ossature désolidarisée + Prégyfeu + LV',     ref:'PV CSTB EI120',prix:145 },
    // Doublages
    { type:'doublage', nom:'Doublage BA13 collé',    ei:'EI30',  min:30,  ep:28,  desc:'Plaque BA13 collée sur maçonnerie',                 ref:'PV CSTB EI30', prix:35 },
    { type:'doublage', nom:'Doublage Prégyfeu collé',ei:'EI60',  min:60,  ep:30,  desc:'Plaque Prégyfeu BA15F collée sur support',          ref:'PV CSTB EI60', prix:55 },
    { type:'doublage', nom:'Doublage sur ossature M48',ei:'EI60', min:60, ep:62,  desc:'Ossature M48 + BA13 + LV 45mm',                    ref:'PV CSTB EI60', prix:65 },
    { type:'doublage', nom:'Doublage Prégyfeu M48', ei:'EI90',  min:90,  ep:78,  desc:'Ossature M48 + Prégyfeu BA15F',                     ref:'PV CSTB EI90', prix:82 },
    // Plafonds
    { type:'plafond',  nom:'Plafond BA13 — 1 plaque', ei:'EI30', min:30, ep:13,  desc:'Plaque BA13 sur ossature T24',                     ref:'PV CSTB EI30', prix:40 },
    { type:'plafond',  nom:'Plafond 2×BA13',          ei:'EI60', min:60, ep:26,  desc:'2 plaques BA13 superposées sur ossature',           ref:'PV CSTB EI60', prix:58 },
    { type:'plafond',  nom:'Plafond Prégyfeu BA15F',  ei:'EI60', min:60, ep:15,  desc:'Plaque Prégyfeu BA15F sur ossature T24',            ref:'PV CSTB EI60', prix:68 },
    { type:'plafond',  nom:'Plafond 2×Prégyfeu',      ei:'EI120',min:120,ep:30,  desc:'2× Prégyfeu BA15F sur ossature renforcée',         ref:'PV CSTB EI120',prix:95 },
  ];

  const EI_OPTIONS = [
    { val:30,  label:'EI30',  sub:'30 min — Local à faible risque' },
    { val:60,  label:'EI60',  sub:'1h — Usage courant ERP/logement' },
    { val:90,  label:'EI90',  sub:'1h30 — ERP catégorie 1 & 2' },
    { val:120, label:'EI120', sub:'2h — IGH / Bâtiment sensible' },
  ];

  div.innerHTML = `
    <div class="rf-hero">
      <h1>🔥 Résistance au Feu — EI30 à EI120</h1>
      <p>Sélectionnez la bonne solution selon votre exigence réglementaire — PV CSTB / Eurocodes</p>
    </div>

    <div class="rf-grid">
      <div class="rf-panel">

        <div class="rf-section">🎯 Exigence réglementaire</div>
        <div class="rf-exigence-grid">
          ${EI_OPTIONS.map((e,i) => `
            <button class="rf-exigence-btn ${i===1?'active':''}" data-val="${e.val}"
              onclick="RF.selectEI(this)">
              <div class="rf-ei">${e.label}</div>
              <div class="rf-ei-sub">${e.sub}</div>
            </button>
          `).join('')}
        </div>

        <div class="rf-section">🏗 Type d'ouvrage</div>
        <div class="rf-label">Élément à protéger</div>
        <div class="rf-input-wrap">
          <select id="rf-type" onchange="RF.compute()">
            <option value="tous">Tous (cloisons + doublages + plafonds)</option>
            <option value="cloison">Cloisons uniquement</option>
            <option value="doublage">Doublages uniquement</option>
            <option value="plafond">Plafonds uniquement</option>
          </select>
        </div>

        <div class="rf-section">🏢 Type de bâtiment</div>
        <div class="rf-label">Destination</div>
        <div class="rf-input-wrap">
          <select id="rf-batiment" onchange="RF.compute()">
            <option value="logement">Logement collectif</option>
            <option value="erp">ERP (Établissement Recevant du Public)</option>
            <option value="bureau">Bureau / Tertiaire</option>
            <option value="igh">IGH (Immeuble Grande Hauteur)</option>
            <option value="industriel">Bâtiment industriel</option>
          </select>
        </div>

        <div class="rf-info-box" id="rf-reglementation">
          Sélectionnez un type de bâtiment pour voir la réglementation applicable.
        </div>

      </div>

      <div class="rf-panel">
        <div class="rf-section">📋 Solutions conformes</div>
        <div id="rf-resultats">
          <div style="text-align:center;color:var(--text-tertiary);padding:40px 0;font-size:13px">
            Sélectionnez une exigence EI pour voir les solutions
          </div>
        </div>
        <div id="rf-actions" style="display:none;margin-top:16px">
          <button class="btn btn-primary" style="width:100%" onclick="RF.exportPDF()">
            📄 Exporter rapport PDF
          </button>
        </div>
      </div>
    </div>
  `;

  window.RF._solutions = SOLUTIONS;
  setTimeout(() => RF.compute(), 50);
  return div;
};

const RF = {
  _ei: 60,
  _solutions: [],

  selectEI(btn) {
    document.querySelectorAll('.rf-exigence-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this._ei = parseInt(btn.dataset.val);
    this.compute();
  },

  compute() {
    const type     = document.getElementById('rf-type')?.value || 'tous';
    const batiment = document.getElementById('rf-batiment')?.value || 'logement';
    const ei       = this._ei;
    const solutions = this._solutions;
    if (!solutions || solutions.length === 0) return;

    // Réglementation applicable
    const regles = {
      logement:   `🏠 <b>Logement collectif</b> — Arrêté du 31/01/1986 : séparation entre logements EI60 minimum. Cage d'escalier EI120. Sous-sol EI90.`,
      erp:        `🏥 <b>ERP</b> — Règlement de sécurité ERP (Arrêté 25/06/1980) : cloisonnement selon catégorie. ERP cat.1&2 → EI90 min. ERP cat.3&4 → EI60 min.`,
      bureau:     `💼 <b>Bureau / Tertiaire</b> — Code du travail + ERP 4e catégorie : EI60 entre locaux, EI30 pour compartimentage interne.`,
      igh:        `🏙 <b>IGH</b> — Arrêté du 30/12/2011 : compartiments EI120 obligatoires. Escaliers EI120. Couloirs EI90.`,
      industriel: `🏭 <b>Industriel</b> — ICPE / Règle APSAD : selon activité et surface. Compartiments coupe-feu CF2h (= EI120) fréquents.`,
    };
    document.getElementById('rf-reglementation').innerHTML = regles[batiment] || '';

    // Filtrer
    let filtrees = solutions.filter(s => type === 'tous' || s.type === type);
    const conformes = filtrees.filter(s => s.min >= ei).sort((a,b) => a.min - b.min);
    const proches   = filtrees.filter(s => s.min < ei && s.min >= ei - 30).sort((a,b) => b.min - a.min);

    document.getElementById('rf-resultats').innerHTML = `
      <div style="background:rgba(220,38,38,.1);border:1px solid #dc2626;border-radius:var(--radius-md);
        padding:12px;margin-bottom:16px;text-align:center">
        <div style="font-size:12px;color:var(--text-secondary)">Exigence sélectionnée</div>
        <div style="font-size:32px;font-weight:900;color:#dc2626">EI${ei}</div>
        <div style="font-size:11px;color:var(--text-tertiary)">${ei} minutes de résistance au feu</div>
      </div>
      <div style="font-size:12px;font-weight:600;color:#10b981;margin-bottom:10px">
        ✅ ${conformes.length} solution${conformes.length>1?'s':''} conforme${conformes.length>1?'s':''}
      </div>
      ${conformes.map(s => `
        <div class="rf-card ok">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div class="rf-card-name">${s.nom}
                <span class="rf-badge ok">✅ EI${s.min}</span>
              </div>
              <div class="rf-card-detail">${s.desc}</div>
              <div class="rf-card-detail" style="margin-top:2px">
                Ép. : ${s.ep} mm — Réf. : ${s.ref} — ~${s.prix} €/m²
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0;margin-left:12px">
              <div class="rf-card-ei ok">EI${s.min}</div>
            </div>
          </div>
        </div>
      `).join('')}
      ${proches.length > 0 ? `
        <div style="font-size:12px;font-weight:600;color:#f59e0b;margin:12px 0 8px">
          ⚠️ Solutions insuffisantes (proches)
        </div>
        ${proches.map(s => `
          <div class="rf-card fail">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <div class="rf-card-name">${s.nom}
                  <span class="rf-badge fail">❌ EI${s.min}</span>
                </div>
                <div class="rf-card-detail">${s.desc} — manque ${ei - s.min} min</div>
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:12px">
                <div class="rf-card-ei fail">EI${s.min}</div>
              </div>
            </div>
          </div>
        `).join('')}
      ` : ''}
    `;

    this._lastResult = { ei, type, batiment, conformes, proches };
    document.getElementById('rf-actions').style.display = 'block';
  },

  exportPDF() {
    const r = this._lastResult;
    if (!r) return;
    const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    const entreprise = config.nom || 'AATB';
    const date = new Date().toLocaleDateString('fr-FR');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Rapport Résistance au Feu — ${entreprise}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;margin:0;padding:30px}
      .header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #dc2626;margin-bottom:24px}
      .header-title{font-size:22px;font-weight:800;color:#dc2626}
      .ei-box{background:#fef2f2;border:2px solid #dc2626;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px}
      .ei-val{font-size:48px;font-weight:900;color:#dc2626}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th{background:#dc2626;color:#fff;padding:8px 10px;text-align:left;font-size:12px}
      td{padding:8px 10px;border-bottom:1px solid #eee;font-size:12px}
      tr:nth-child(even) td{background:#fef2f2}
      .section-title{font-size:13px;font-weight:700;color:#dc2626;text-transform:uppercase;
        letter-spacing:.05em;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #dc2626}
      .badge-ok{background:#10b98120;color:#10b981;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
      .badge-fail{background:#ef444420;color:#ef4444;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
      .regle{background:#fff8f8;border-left:4px solid #dc2626;padding:10px 14px;border-radius:0 6px 6px 0;font-size:12px;margin-bottom:16px}
      .footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#888;display:flex;justify-content:space-between}
      @media print{body{padding:15px}}
    </style></head><body>
    <div class="header">
      <div><div class="header-title">🔥 Rapport Résistance au Feu</div>
        <div style="font-size:12px;color:#666;margin-top:4px">Choix solution — PV CSTB / Eurocodes</div></div>
      <div style="text-align:right;font-size:12px;color:#666"><b>${entreprise}</b><br>Date : ${date}</div>
    </div>
    <div class="ei-box">
      <div style="font-size:13px;color:#666">Exigence réglementaire</div>
      <div class="ei-val">EI${r.ei}</div>
      <div style="font-size:12px;color:#666">${r.ei} minutes de résistance au feu</div>
    </div>
    <div class="section-title">✅ Solutions conformes (${r.conformes.length})</div>
    <table><thead><tr><th>Solution</th><th>Classement</th><th>Épaisseur</th><th>Référence</th><th>Prix</th></tr></thead>
    <tbody>${r.conformes.map(s => `
      <tr><td><b>${s.nom}</b><br><small style="color:#666">${s.desc}</small></td>
        <td><span class="badge-ok">EI${s.min}</span></td>
        <td>${s.ep} mm</td><td>${s.ref}</td><td>~${s.prix} €/m²</td></tr>
    `).join('')}</tbody></table>
    ${r.proches.length > 0 ? `
    <div class="section-title">❌ Solutions insuffisantes</div>
    <table><thead><tr><th>Solution</th><th>Classement</th><th>Manque</th></tr></thead>
    <tbody>${r.proches.map(s => `
      <tr><td>${s.nom}</td>
        <td><span class="badge-fail">EI${s.min}</span></td>
        <td style="color:#ef4444;font-weight:600">−${r.ei - s.min} min</td></tr>
    `).join('')}</tbody></table>` : ''}
    <div class="footer">
      <span>PlaqPro+ — ${entreprise}</span>
      <span>Référence : PV CSTB — Arrêté 31/01/1986 — Règlement ERP</span>
    </div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
};
