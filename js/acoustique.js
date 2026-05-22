/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO+ — Calcul Acoustique Rw
//  Choix cloison selon exigence réglementaire
// ============================================================

Pages.acoustique = function() {
  const div = document.createElement('div');

  if (!document.getElementById('style-acoustique')) {
    const s = document.createElement('style');
    s.id = 'style-acoustique';
    s.textContent = `
      .ac-hero { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; color: #fff; }
      .ac-hero h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      .ac-hero p { font-size: 13px; opacity: .8; margin: 0; }
      .ac-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media(max-width:768px){ .ac-grid { grid-template-columns: 1fr; } }
      .ac-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 20px; }
      .ac-section { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary); padding-bottom: 8px;
        border-bottom: 1px solid var(--border); margin: 16px 0 12px; }
      .ac-section:first-child { margin-top: 0; }
      .ac-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
      .ac-input-wrap { position: relative; margin-bottom: 12px; }
      .ac-input-wrap select, .ac-input-wrap input {
        width: 100%; padding: 10px 36px 10px 12px;
        background: var(--bg-primary); border: 1px solid var(--border);
        border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px; }
      .ac-input-wrap .ac-unit { position: absolute; right: 10px; top: 50%;
        transform: translateY(-50%); font-size: 11px; color: var(--text-tertiary); pointer-events: none; }
      .ac-cloison-card { border: 2px solid var(--border); border-radius: var(--radius-md);
        padding: 14px; margin-bottom: 10px; cursor: pointer; transition: all .2s; }
      .ac-cloison-card:hover { border-color: var(--accent); }
      .ac-cloison-card.ok { border-color: #10b981; background: rgba(16,185,129,.08); }
      .ac-cloison-card.warn { border-color: #f59e0b; background: rgba(245,158,11,.08); }
      .ac-cloison-card.fail { border-color: #ef4444; background: rgba(239,68,68,.08); }
      .ac-cloison-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
      .ac-cloison-rw { font-size: 22px; font-weight: 900; }
      .ac-cloison-rw.ok { color: #10b981; }
      .ac-cloison-rw.warn { color: #f59e0b; }
      .ac-cloison-rw.fail { color: #ef4444; }
      .ac-cloison-detail { font-size: 11px; color: var(--text-tertiary); margin-top: 4px; }
      .ac-badge { display:inline-block; padding: 2px 8px; border-radius: 20px;
        font-size: 11px; font-weight: 700; margin-left: 8px; }
      .ac-badge.ok { background: #10b98120; color: #10b981; }
      .ac-badge.fail { background: #ef444420; color: #ef4444; }
      .ac-exigence-btn { padding: 10px 14px; border: 2px solid var(--border);
        border-radius: var(--radius-md); background: var(--bg-primary); cursor: pointer;
        text-align: center; font-size: 12px; color: var(--text-secondary);
        transition: all .2s; margin-bottom: 8px; width: 100%; }
      .ac-exigence-btn.active { border-color: #7c3aed; background: rgba(124,58,237,.1);
        color: #7c3aed; font-weight: 600; }
      .ac-stat { display: flex; justify-content: space-between; padding: 8px 0;
        border-bottom: 1px solid var(--border); font-size: 13px; }
      .ac-stat:last-child { border: none; }
      .ac-stat-val { font-weight: 700; color: var(--accent); }
    `;
    document.head.appendChild(s);
  }

  // Base de données cloisons acoustiques
  const CLOISONS = [
    { id:'m48-1ba13',    nom:'M48 — 1×BA13',           rw:36, ep:72,  desc:'Ossature 48mm, 1 plaque chaque face',        dtu:'DTU 25.41', prix:45 },
    { id:'m48-2ba13',    nom:'M48 — 2×BA13',           rw:42, ep:98,  desc:'Ossature 48mm, 2 plaques chaque face',       dtu:'DTU 25.41', prix:62 },
    { id:'m70-1ba13',    nom:'M70 — 1×BA13',           rw:40, ep:96,  desc:'Ossature 70mm, 1 plaque chaque face',        dtu:'DTU 25.41', prix:52 },
    { id:'m70-2ba13',    nom:'M70 — 2×BA13',           rw:48, ep:122, desc:'Ossature 70mm, 2 plaques chaque face',       dtu:'DTU 25.41', prix:72 },
    { id:'m70-lv',       nom:'M70 + LV45 — 2×BA13',   rw:52, ep:122, desc:'Ossature 70mm + laine de verre 45mm',        dtu:'DTU 25.41', prix:85 },
    { id:'m48-double',   nom:'Double M48 — 2×BA13',    rw:55, ep:196, desc:'Double ossature 48mm désolidarisée + LV',    dtu:'DTU 25.41', prix:110 },
    { id:'m70-double',   nom:'Double M70 — 2×BA13',    rw:60, ep:240, desc:'Double ossature 70mm + LV + masse lourde',   dtu:'DTU 25.41', prix:140 },
    { id:'pregydB',      nom:'Prégyps DB — M48',       rw:45, ep:82,  desc:'Plaque phonique Prégyps DB 13+10mm',         dtu:'DTU 25.41', prix:78 },
    { id:'pregydB70',    nom:'Prégyps DB — M70',       rw:50, ep:108, desc:'Plaque Prégyps DB + ossature 70mm',          dtu:'DTU 25.41', prix:92 },
    { id:'doublage-lv',  nom:'Doublage LV 45mm',       rw:38, ep:60,  desc:'Contre-cloison plâtre + LV 45mm',           dtu:'DTU 25.41', prix:55 },
  ];

  // Exigences réglementaires
  const EXIGENCES = [
    { id:'nra-log',   label:'🏠 Logement (NRA)',        rw:53, desc:'Entre logements — NRA art. 6' },
    { id:'nra-couloir',label:'🚪 Couloir → Logement',  rw:40, desc:'Circulation → Pièce principale — NRA' },
    { id:'nra-loc',   label:'🏢 Local commercial',      rw:45, desc:'Local commercial → Logement — NRA' },
    { id:'bureau',    label:'💼 Bureau open-space',     rw:42, desc:'Séparation bureaux — recommandation' },
    { id:'erp',       label:'🏥 ERP / Salle réunion',  rw:48, desc:'ERP — recommandation acoustique' },
    { id:'hotel',     label:'🏨 Hôtel (NRA)',           rw:53, desc:'Chambre → Chambre — NRA hôtels' },
    { id:'libre',     label:'✏️ Saisie libre',          rw: 0, desc:'Entrez votre exigence manuellement' },
  ];

  div.innerHTML = `
    <div class="ac-hero">
      <h1>🔊 Calcul Acoustique Rw</h1>
      <p>Choisissez la bonne cloison selon votre exigence réglementaire — NRA / DTU 25.41</p>
    </div>

    <div class="ac-grid">
      <div class="ac-panel">

        <div class="ac-section">🎯 Exigence acoustique</div>
        <div id="ac-exigences">
          ${EXIGENCES.map(e => `
            <button class="ac-exigence-btn ${e.id==='nra-log'?'active':''}"
              data-id="${e.id}" data-rw="${e.rw}" onclick="Acou.selectExigence(this)">
              <div style="font-weight:600">${e.label}</div>
              <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">${e.desc}</div>
              ${e.rw > 0 ? `<div style="font-size:16px;font-weight:800;color:#7c3aed;margin-top:4px">Rw ≥ ${e.rw} dB</div>` : ''}
            </button>
          `).join('')}
        </div>

        <div id="ac-saisie-libre" style="display:none">
          <div class="ac-label">Rw minimum requis</div>
          <div class="ac-input-wrap">
            <input type="number" id="ac-rw-libre" value="45" min="30" max="70" step="1" oninput="Acou.compute()">
            <span class="ac-unit">dB</span>
          </div>
        </div>

        <div class="ac-section" style="margin-top:16px">🔇 Correction chantier</div>
        <div class="ac-label">Correction terrain (flancs, fuites) — généralement -3 à -5 dB</div>
        <div class="ac-input-wrap">
          <input type="number" id="ac-correction" value="-3" min="-10" max="0" step="1" oninput="Acou.compute()">
          <span class="ac-unit">dB</span>
        </div>

        <div class="ac-section">📋 Informations chantier</div>
        <div class="ac-label">Type de local</div>
        <div class="ac-input-wrap">
          <select id="ac-local" onchange="Acou.compute()">
            <option value="logement">Logement</option>
            <option value="bureau">Bureau / Tertiaire</option>
            <option value="erp">ERP</option>
            <option value="hotel">Hôtel</option>
            <option value="industriel">Industriel</option>
          </select>
        </div>

      </div>

      <div class="ac-panel">
        <div class="ac-section">📊 Cloisons compatibles</div>
        <div id="ac-resultats">
          <div style="text-align:center;color:var(--text-tertiary);padding:40px 0;font-size:13px">
            Sélectionnez une exigence pour voir les solutions
          </div>
        </div>
        <div id="ac-actions" style="display:none;margin-top:16px">
          <button class="btn btn-primary" style="width:100%;margin-bottom:8px" onclick="Acou.exportPDF()">
            📄 Exporter rapport PDF
          </button>
        </div>
      </div>
    </div>
  `;

  // Stocker la base dans l'objet
  window.Acou._cloisons  = CLOISONS;
  window.Acou._exigences = EXIGENCES;

  setTimeout(() => Acou.compute(), 50);
  return div;
};

const Acou = {
  _rwRequis: 53,
  _exigenceLabel: 'Logement (NRA)',
  _cloisons: [],
  _exigences: [],

  selectExigence(btn) {
    document.querySelectorAll('.ac-exigence-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const rw = parseInt(btn.dataset.rw) || 0;
    const id = btn.dataset.id;
    this._exigenceLabel = btn.querySelector('div').innerText;
    document.getElementById('ac-saisie-libre').style.display = id === 'libre' ? 'block' : 'none';
    if (id !== 'libre') { this._rwRequis = rw; this.compute(); }
    else { this._rwRequis = parseInt(document.getElementById('ac-rw-libre')?.value) || 45; this.compute(); }
  },

  compute() {
    const rwLibre    = parseInt(document.getElementById('ac-rw-libre')?.value) || 45;
    const correction = parseInt(document.getElementById('ac-correction')?.value) || -3;
    const libreVisible = document.getElementById('ac-saisie-libre')?.style.display !== 'none';
    if (libreVisible) this._rwRequis = rwLibre;

    const rwCible = this._rwRequis - correction; // Rw labo nécessaire
    const cloisons = this._cloisons;
    if (!cloisons || cloisons.length === 0) return;

    // Trier : conformes d'abord (par Rw croissant), puis non conformes
    const conformes  = cloisons.filter(c => c.rw >= rwCible).sort((a,b) => a.rw - b.rw);
    const nonConf    = cloisons.filter(c => c.rw <  rwCible).sort((a,b) => b.rw - a.rw);
    const triees     = [...conformes, ...nonConf];

    document.getElementById('ac-resultats').innerHTML = `
      <div style="background:rgba(124,58,237,.1);border:1px solid #7c3aed;border-radius:var(--radius-md);
        padding:12px;margin-bottom:16px;text-align:center">
        <div style="font-size:12px;color:var(--text-secondary)">Rw terrain requis</div>
        <div style="font-size:28px;font-weight:900;color:#7c3aed">${this._rwRequis} dB</div>
        <div style="font-size:11px;color:var(--text-tertiary)">Rw labo nécessaire : ${rwCible} dB (correction ${correction} dB)</div>
      </div>
      <div style="font-size:12px;font-weight:600;color:#10b981;margin-bottom:8px">
        ✅ ${conformes.length} solution${conformes.length>1?'s':''} conforme${conformes.length>1?'s':''}
      </div>
      ${triees.map(c => {
        const conforme = c.rw >= rwCible;
        const cls = conforme ? 'ok' : 'fail';
        const marge = c.rw - rwCible;
        return `
        <div class="ac-cloison-card ${cls}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div class="ac-cloison-name">${c.nom}
                <span class="ac-badge ${cls}">${conforme ? '✅ Conforme' : '❌ Insuffisant'}</span>
              </div>
              <div class="ac-cloison-detail">${c.desc}</div>
              <div class="ac-cloison-detail" style="margin-top:2px">
                Épaisseur : ${c.ep} mm — ${c.dtu} — ~${c.prix} €/m²
                ${marge >= 0 ? `<span style="color:#10b981;font-weight:600"> — marge +${marge} dB</span>` : `<span style="color:#ef4444;font-weight:600"> — manque ${Math.abs(marge)} dB</span>`}
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0;margin-left:12px">
              <div class="ac-cloison-rw ${cls}">${c.rw}</div>
              <div style="font-size:10px;color:var(--text-tertiary)">dB Rw</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    `;

    this._lastResult = { rwRequis: this._rwRequis, rwCible, correction, conformes, nonConf, triees };
    document.getElementById('ac-actions').style.display = 'block';
  },

  exportPDF() {
    const r = this._lastResult;
    if (!r) return;
    const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    const entreprise = config.nom || 'AATB';
    const date = new Date().toLocaleDateString('fr-FR');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Rapport Acoustique — ${entreprise}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;margin:0;padding:30px}
      .header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #7c3aed;margin-bottom:24px}
      .header-title{font-size:22px;font-weight:800;color:#7c3aed}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th{background:#7c3aed;color:#fff;padding:8px 10px;text-align:left;font-size:12px}
      td{padding:8px 10px;border-bottom:1px solid #eee;font-size:12px}
      tr:nth-child(even) td{background:#f5f3ff}
      .badge-ok{background:#10b98120;color:#10b981;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
      .badge-fail{background:#ef444420;color:#ef4444;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
      .section-title{font-size:13px;font-weight:700;color:#7c3aed;text-transform:uppercase;
        letter-spacing:.05em;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #7c3aed}
      .exigence-box{background:#f5f3ff;border:2px solid #7c3aed;border-radius:8px;
        padding:16px;text-align:center;margin-bottom:20px}
      .footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;
        font-size:11px;color:#888;display:flex;justify-content:space-between}
      @media print{body{padding:15px}}
    </style></head><body>
    <div class="header">
      <div><div class="header-title">🔊 Rapport Acoustique Rw</div>
        <div style="font-size:12px;color:#666;margin-top:4px">Choix cloison — NRA / DTU 25.41</div></div>
      <div style="text-align:right;font-size:12px;color:#666"><b>${entreprise}</b><br>Date : ${date}</div>
    </div>
    <div class="exigence-box">
      <div style="font-size:12px;color:#666">Exigence acoustique terrain</div>
      <div style="font-size:36px;font-weight:900;color:#7c3aed">${r.rwRequis} dB</div>
      <div style="font-size:12px;color:#666">Rw labo nécessaire : <b>${r.rwCible} dB</b> (correction terrain : ${r.correction} dB)</div>
    </div>
    <div class="section-title">✅ Solutions conformes (${r.conformes.length})</div>
    <table><thead><tr><th>Cloison</th><th>Rw (dB)</th><th>Épaisseur</th><th>Prix indicatif</th><th>Marge</th></tr></thead>
    <tbody>${r.conformes.map(c => `
      <tr><td><b>${c.nom}</b><br><small style="color:#666">${c.desc}</small></td>
        <td><b style="color:#10b981;font-size:16px">${c.rw}</b></td>
        <td>${c.ep} mm</td><td>~${c.prix} €/m²</td>
        <td style="color:#10b981;font-weight:600">+${c.rw - r.rwCible} dB</td></tr>
    `).join('')}</tbody></table>
    ${r.nonConf.length > 0 ? `
    <div class="section-title">❌ Solutions insuffisantes (${r.nonConf.length})</div>
    <table><thead><tr><th>Cloison</th><th>Rw (dB)</th><th>Épaisseur</th><th>Manque</th></tr></thead>
    <tbody>${r.nonConf.map(c => `
      <tr><td>${c.nom}</td>
        <td style="color:#ef4444;font-weight:700">${c.rw}</td>
        <td>${c.ep} mm</td>
        <td style="color:#ef4444;font-weight:600">−${r.rwCible - c.rw} dB</td></tr>
    `).join('')}</tbody></table>` : ''}
    <div class="footer">
      <span>PlaqPro+ — ${entreprise}</span>
      <span>Référence : NRA (Nouvelle Réglementation Acoustique) — DTU 25.41</span>
    </div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
};
