// ============================================================
//  PLAQPRO WEB — Module DPGF / Appels d'offres
//  dpgf.js
// ============================================================

Pages.dpgf = function () {
  DPGF._injectStyles();
  const div = document.createElement('div');
  div.innerHTML = DPGF._buildPage();
  setTimeout(() => DPGF._bindEvents(div), 0);
  return div;
};

var DPGF = {

  _lignes:    [],   // [{numero_lot, designation, unite, quantite, prix_unitaire, total, cctp_reference, lot, _prix_saisi, _marge}]
  _fileName:  '',
  _rawText:   '',
  _isAOS:        false,
  _infosAffaire: {},
  _cctpTexte:    '',

  PRIX_MARCHE_DEFAUT: {
    'cloison 72':          { pu: 68 },
    'cloison 98':          { pu: 92 },
    'cloison 100':         { pu: 88 },
    'doublage':            { pu: 55 },
    'plafond ba13':        { pu: 52 },
    'plafond acoustique':  { pu: 92 },
    'peinture mur':        { pu: 17 },
    'peinture plafond':    { pu: 16 },
    'peinture menuiserie': { pu: 24 },
    'porte ei30':          { pu: 1200 },
    'porte ei60 simple':   { pu: 1850 },
    'porte ei60 double':   { pu: 3200 },
    'trappe':              { pu: 105 },
    'plinthe bois':        { pu: 28 },
    'depose plafond':      { pu: 22 },
    'depose moquette':     { pu: 18 },
    'nez de marche':       { pu: 16 },
    'marquage podotactile':{ pu: 52 },
    'main courante':       { pu: 42 },
    'lessivage':           { pu: 7.5 },
    'pictogramme':         { pu: 14 },
    'peinture anti':       { pu: 15 },
  },

  getPrixMarche() {
    return Object.entries(this.PRIX_MARCHE_DEFAUT).map(([k, v]) => ({ designation: k, pu: v.pu }));
  },

  matcherPrixMarche(designation) {
    const d = (designation || '').toLowerCase();
    let best = null, bestScore = 0;
    Object.entries(this.PRIX_MARCHE_DEFAUT).forEach(([k, v]) => {
      const words = k.split(' ');
      let score = 0;
      words.forEach(w => { if (d.includes(w)) score++; });
      if (score > bestScore) { bestScore = score; best = { key: k, pu: v.pu }; }
    });
    return bestScore >= 1 ? best : null;
  },

  // ── Page HTML ─────────────────────────────────────────────
  _buildPage() {
    return `
      <div style="max-width:1100px;margin:0 auto;padding:0 4px">

        <!-- Hero -->
        <div style="background:linear-gradient(135deg,rgba(79,142,247,0.12),rgba(45,212,160,0.08));border:1px solid rgba(79,142,247,0.2);border-radius:16px;padding:28px 32px;margin-bottom:20px;display:flex;align-items:center;gap:20px">
          <div style="font-size:48px;flex-shrink:0">🏛</div>
          <div>
            <div style="font-size:20px;font-weight:800;color:var(--text-primary);margin-bottom:6px">Répondez automatiquement aux appels d'offres</div>
            <div style="font-size:14px;color:var(--text-secondary);line-height:1.6">Uploadez votre DPGF → PlaqPro+ le complète avec vos prix en quelques minutes !<br>Formats acceptés : <strong style="color:var(--text-primary)">.xlsx / .xls / .csv / .pdf</strong></div>
          </div>
        </div>

        <!-- Triple zone upload -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:20px">

          <!-- Zone CCTP seul -->
          <div id="cctp-upload-zone" style="border:2px dashed rgba(247,166,79,0.4);border-radius:14px;padding:24px 12px;text-align:center;cursor:pointer;transition:all .25s;background:rgba(247,166,79,0.03)">
            <div style="font-size:32px;margin-bottom:8px">📄</div>
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:3px">CCTP seul</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:10px">Cahier des charges PDF</div>
            <input type="file" id="cctp-file-input" accept=".pdf" style="display:none">
            <button class="btn btn-secondary" onclick="document.getElementById('cctp-file-input').click()" style="font-size:11px">📁 Charger</button>
            <div id="cctp-status" style="margin-top:8px;font-size:11px;color:var(--text-tertiary)">Optionnel — enrichit le rapport</div>
          </div>

          <!-- Zone DPGF seul -->
          <div id="dpgf-upload-zone" style="border:2px dashed rgba(79,142,247,0.4);border-radius:14px;padding:24px 12px;text-align:center;cursor:pointer;transition:all .25s;background:rgba(79,142,247,0.03)">
            <div style="font-size:32px;margin-bottom:8px">📊</div>
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:3px">DPGF seul</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:10px">Bordereau Excel (.xlsx)</div>
            <input type="file" id="dpgf-file-input" accept=".xlsx,.xls,.csv,.pdf" style="display:none">
            <button class="btn btn-primary" onclick="document.getElementById('dpgf-file-input').click()" style="font-size:11px">📁 Charger</button>
            <div id="dpgf-status" style="margin-top:8px;font-size:11px;color:var(--text-tertiary)">Obligatoire</div>
          </div>

          <!-- Zone CCTP+DPGF tout-en-un -->
          <div id="combo-upload-zone" style="border:2px dashed rgba(167,139,250,0.4);border-radius:14px;padding:24px 12px;text-align:center;cursor:pointer;transition:all .25s;background:rgba(167,139,250,0.03)">
            <div style="font-size:32px;margin-bottom:8px">📋</div>
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:3px">CCTP + DPGF</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:10px">Document unique PDF</div>
            <input type="file" id="combo-file-input" accept=".pdf" style="display:none">
            <button class="btn" onclick="document.getElementById('combo-file-input').click()" style="font-size:11px;background:rgba(167,139,250,0.15);color:#A78BFA;border:1px solid rgba(167,139,250,0.3)">📁 Charger</button>
            <div id="combo-status" style="margin-top:8px;font-size:11px;color:var(--text-tertiary)">Tout-en-un — scénario mairie</div>
          </div>

        </div>

        <!-- État chargement -->
        <div id="dpgf-loading" style="display:none;text-align:center;padding:32px">
          <div class="dpgf-spinner"></div>
          <div id="dpgf-loading-msg" style="margin-top:14px;font-size:14px;color:var(--text-secondary)">Lecture du fichier…</div>
        </div>

        <!-- Tableau de correspondance -->
        <div id="dpgf-table-zone" style="display:none">

          <!-- Toolbar -->
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">
            <div style="font-size:16px;font-weight:800;color:var(--text-primary)">
              📋 Tableau de correspondance — <span id="dpgf-file-name" style="color:var(--accent);font-weight:600"></span>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-secondary" onclick="DPGF._verifierCCTP()" style="font-size:12px">🔍 Vérification CCTP</button>
              <button class="btn btn-secondary" onclick="DPGF._exporterExcel()" style="font-size:12px">📥 DPGF complétée</button>
              <button class="btn btn-secondary" onclick="DPGF._exporterRapportSynthese()" style="font-size:12px">📊 Rapport synthèse</button>
              <button class="btn btn-primary"   onclick="DPGF._genererDevis()"  style="font-size:12px">📄 Générer devis PlaqPro+</button>
            </div>
          </div>

          <!-- Filtre lots -->
          <div id="dpgf-lots-btns" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px"></div>

          <!-- Table -->
          <div style="overflow-x:auto;border-radius:12px;border:1px solid var(--border)">
            <table id="dpgf-table" style="width:100%;border-collapse:collapse;font-size:13px">
              <thead>
                <tr style="background:var(--bg-tertiary)">
                  <th class="dpgf-th" style="width:38px">#</th>
                  <th class="dpgf-th">Désignation DPGF</th>
                  <th class="dpgf-th" style="width:55px">Lot</th>
                  <th class="dpgf-th" style="width:55px">Unité</th>
                  <th class="dpgf-th" style="width:65px">Qté</th>
                  <th class="dpgf-th" style="width:80px">P.U. base</th>
                  <th class="dpgf-th" style="width:68px">Marge %</th>
                  <th class="dpgf-th" style="width:90px">P.U. final</th>
                  <th class="dpgf-th" style="width:95px">Total HT</th>
                  <th class="dpgf-th" style="width:95px">Actions</th>
                </tr>
              </thead>
              <tbody id="dpgf-tbody"></tbody>
            </table>
          </div>

          <!-- Récap par lot -->
          <div id="dpgf-recap" style="margin-top:20px"></div>

          <!-- Alerte CCTP -->
          <div id="dpgf-cctp-alert" style="display:none;margin-top:14px"></div>
        </div>

      </div>`;
  },

  // ── Bind events ───────────────────────────────────────────
  _bindEvents(root) {
    const zone  = root.querySelector('#dpgf-upload-zone');
    const input = root.querySelector('#dpgf-file-input');

    if (zone) {
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--accent)'; zone.style.background = 'rgba(79,142,247,0.07)'; });
      zone.addEventListener('dragleave', () => { zone.style.borderColor = 'rgba(79,142,247,0.4)'; zone.style.background = 'rgba(79,142,247,0.03)'; });
      zone.addEventListener('drop', e => { e.preventDefault(); zone.style.borderColor = 'rgba(79,142,247,0.4)'; zone.style.background = 'rgba(79,142,247,0.03)'; if (e.dataTransfer.files[0]) DPGF._handleFile(e.dataTransfer.files[0]); });
      zone.addEventListener('click', e => { if (e.target === zone || e.target.tagName === 'DIV') input && input.click(); });
    }
    if (input) {
      input.addEventListener('change', e => { if (e.target.files[0]) DPGF._handleFile(e.target.files[0]); });
    }

    // Binding CCTP
    const cctpInput = root.querySelector('#cctp-file-input');
    const cctpZone  = root.querySelector('#cctp-upload-zone');
    if (cctpZone) {
      cctpZone.addEventListener('dragover', e => { e.preventDefault(); cctpZone.style.borderColor = '#F7A64F'; });
      cctpZone.addEventListener('dragleave', () => { cctpZone.style.borderColor = 'rgba(247,166,79,0.4)'; });
      cctpZone.addEventListener('drop', e => { e.preventDefault(); cctpZone.style.borderColor = 'rgba(247,166,79,0.4)'; if (e.dataTransfer.files[0]) DPGF._handleCCTP(e.dataTransfer.files[0]); });
      cctpZone.addEventListener('click', e => { if (e.target === cctpZone || e.target.tagName === 'DIV') cctpInput && cctpInput.click(); });
    }
    if (cctpInput) {
      cctpInput.addEventListener('change', e => { if (e.target.files[0]) DPGF._handleCCTP(e.target.files[0]); });
    }

      // Binding CCTP+DPGF combo
      const comboInput = root.querySelector('#combo-file-input');
      const comboZone  = root.querySelector('#combo-upload-zone');
      if (comboZone) {
        comboZone.addEventListener('dragover', e => { e.preventDefault(); comboZone.style.borderColor = '#A78BFA'; });
        comboZone.addEventListener('dragleave', () => { comboZone.style.borderColor = 'rgba(167,139,250,0.4)'; });
        comboZone.addEventListener('drop', e => { e.preventDefault(); comboZone.style.borderColor = 'rgba(167,139,250,0.4)'; if (e.dataTransfer.files[0]) DPGF._handleCombo(e.dataTransfer.files[0]); });
        comboZone.addEventListener('click', e => { if (e.target === comboZone || e.target.tagName === 'DIV') comboInput && comboInput.click(); });
      }
      if (comboInput) {
        comboInput.addEventListener('change', e => { if (e.target.files[0]) DPGF._handleCombo(e.target.files[0]); });
      }
    },

  // ── Traitement CCTP PDF ───────────────────────────────────
  async _handleCCTP(file) {
    const statusEl = document.getElementById('cctp-status');
    const zoneEl   = document.getElementById('cctp-upload-zone');
    if (statusEl) statusEl.textContent = '⏳ Lecture du CCTP…';

    const text = await this._readPDF(file);
    this._cctpTexte = text;

    if (statusEl) statusEl.textContent = '🤖 Analyse IA en cours…';

    try {
      const gc = groqConfig();
      if (!gc) throw new Error('Clé Groq requise');

      const prompt = `Tu es expert en marchés publics BTP français.
Analyse ce document (CCTP et/ou DPGF) et extrais en JSON strict :
{
  "affaire": {
    "nom": "nom de l'opération / bâtiment",
    "adresse": "adresse complète",
    "reference": "numéro d'affaire ou de marché",
    "moa": "maître d'ouvrage",
    "moe": "maître d'œuvre / architecte",
    "economiste": "économiste ou BET",
    "lot": "numéro et intitulé du lot",
    "date_dce": "date du DCE si mentionnée"
  },
  "exigences": [
    {
      "article": "référence article ex: 2.1",
      "designation": "désignation du poste",
      "classement": "EI30/EI60/CF1h/Rw39/Rw47/Rw65/etc si mentionné",
      "certification": "ACERMI/EUCEB/DAS/DTU/CSTB/etc si mentionné",
      "marque_imposee": "marque ou gamme imposée ex: PLACO/ISOVER/ECOPHON",
      "remarque": "exigence technique particulière ex: BA13 hydrofuge, laine minérale 45mm"
    }
  ],
  "lignes_dpgf": [
    {
      "article": "référence ex: 1.1",
      "designation": "désignation complète du poste",
      "unite": "M2 ou ML ou U ou forfait",
      "quantite": nombre ou null
    }
  ]
}
IMPORTANT : lignes_dpgf ne doit contenir que les lignes avec une quantité chiffrée (ignorer les titres de section).
Retourne UNIQUEMENT le JSON valide, sans markdown, sans commentaire.
Document — En-tête et prescriptions (début) :
${text.slice(0, 4000)}

--- DPGF — Lignes de prix (fin du document) ---
${text.slice(-4000)}`;

      const resp = await fetch(gc.url, {
        method: 'POST',
        headers: gc.headers,
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 3000,
          temperature: 0.1,
        }),
      });

      const data = await resp.json();
      const raw  = (data.choices[0]?.message?.content || '').trim();
      // Nettoyer markdown éventuel
      const clean = raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      const jm    = clean.match(/\{[\s\S]*\}/);
      if (!jm) throw new Error('Réponse Groq non JSON : ' + clean.slice(0,200));
      const parsed = JSON.parse(jm[0]);

      this._infosAffaire  = parsed.affaire   || {};
      this._exigencesCCTP = parsed.exigences || [];

      // Si DPGF intégré dans le PDF — peupler _lignes automatiquement
      const lignesPDF = parsed.lignes_dpgf || [];
      if (lignesPDF.length > 0) {
        this._lignes = lignesPDF.map((l, i) => {
          const matchPM = this.matcherPrixMarche(l.designation || '');
          const puAATB  = matchPM ? matchPM.pu : 0;
          return {
            id:            i,
            numero_lot:    l.article || '',
            designation:   l.designation || '',
            lot:           this._categoriser(l.designation || ''),
            unite:         l.unite || 'm²',
            quantite:      parseFloat(l.quantite) || 0,
            prix_unitaire: puAATB || 0,
            _prix_base:    0,
            _prix_aatb:    puAATB,
            _marge:        0,
            _source:       puAATB ? 'aatb' : '',
            _match_pm:     matchPM ? matchPM.libelle : '',
            _ecart_pct:    0,
            cctp_reference: '',
          };
        });
        this._isAOS    = false;
        this._fileName = file.name.replace('.pdf','');
        this._rapprocher();
        // Afficher le tableau
        this._showLoading(false);
        this._afficherTableau();
        const dpgfStatus = document.getElementById('dpgf-status');
        if (dpgfStatus) dpgfStatus.innerHTML = `✅ <strong>${lignesPDF.length} lignes DPGF</strong> extraites du PDF`;
        const dpgfZone = document.getElementById('dpgf-upload-zone');
        if (dpgfZone) dpgfZone.style.borderColor = '#2DD4A0';
      }

      const nom = this._infosAffaire.nom || file.name;
      const msgDPGF = lignesPDF.length > 0 ? ` + ${lignesPDF.length} lignes DPGF` : '';
      if (statusEl) statusEl.innerHTML = `✅ <strong>${nom}</strong><br><span style="color:var(--text-tertiary)">${this._exigencesCCTP.length} exigences${msgDPGF}</span>`;
      if (zoneEl) zoneEl.style.borderColor = '#2DD4A0';
      App.toast(`✅ PDF analysé — ${this._exigencesCCTP.length} exigences + ${lignesPDF.length} lignes DPGF`, 'success');

    } catch (err) {
      if (statusEl) statusEl.textContent = '⚠️ Analyse partielle — ' + err.message;
      App.toast('CCTP chargé sans analyse IA : ' + err.message, 'warning');
    }
  },

  // ── Rapprochement CCTP ↔ DPGF ────────────────────────────
  _rapprocher() {
    if (!this._exigencesCCTP || !this._exigencesCCTP.length) return;
    this._lignes.forEach(l => {
      const d = l.designation.toLowerCase();
      // Chercher par numéro d'article d'abord
      let match = this._exigencesCCTP.find(e => e.article && l.numero_lot && l.numero_lot.includes(e.article));
      // Sinon par mots-clés désignation
      if (!match) {
        match = this._exigencesCCTP.find(e => {
          const ed = (e.designation || '').toLowerCase();
          const mots = ed.split(/\s+/).filter(m => m.length > 4);
          return mots.some(m => d.includes(m));
        });
      }
      if (match) {
        l._cctp_article     = match.article     || '';
        l._cctp_classement  = match.classement  || '';
        l._cctp_certif      = match.certification || '';
        l._cctp_marque      = match.marque_imposee || '';
        l._cctp_remarque    = match.remarque    || '';
        // Enrichir justification alerte
        if (match.classement && !l._justif_cctp) {
          l._justif_cctp = 'CCTP exige ' + match.classement +
            (match.certification ? ' + ' + match.certification : '') +
            (match.remarque ? ' — ' + match.remarque : '');
        }
      }
    });
  },

  // ── Traitement CCTP+DPGF combo (document unique) ─────────
  async _handleCombo(file) {
    const statusEl = document.getElementById('combo-status');
    const zoneEl   = document.getElementById('combo-upload-zone');
    if (statusEl) statusEl.textContent = '⏳ Lecture du document…';

    try {
      const text = await this._readPDF(file);
      if (!text || text.length < 100) throw new Error('PDF illisible — vérifiez le fichier');
      this._cctpTexte = text;
      this._fileName  = file.name.replace('.pdf','').replace(/-/g,' ');
      const len = text.length;

      const gc = groqConfig();
      if (!gc) throw new Error('Clé Groq requise');

      // ── Passe 1 : infos affaire (début) ──
      if (statusEl) statusEl.textContent = '🤖 Passe 1/3 — Infos affaire…';
      const r1 = await fetch(gc.url, {
        method: 'POST', headers: gc.headers,
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: `Extrais les infos administratives de ce document BTP en JSON strict :
{"nom":"opération","adresse":"adresse","reference":"ref","moa":"MOA","moe":"MOE","economiste":"économiste","lot":"lot","date_dce":"date"}
Retourne UNIQUEMENT le JSON valide sans markdown.
---
${text.slice(0, 4000)}` }],
          max_tokens: 500, temperature: 0.1,
        }),
      });
      const d1  = await r1.json();
      const raw1 = (d1.choices[0]?.message?.content || '').trim().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      try { this._infosAffaire = JSON.parse(raw1.match(/\{[\s\S]*\}/)?.[0] || '{}'); } catch { this._infosAffaire = {}; }

      await new Promise(r => setTimeout(r, 1000));
      // ── Passe 2 : exigences CCTP (milieu) ──
      if (statusEl) statusEl.textContent = '🤖 Passe 2/3 — Exigences CCTP…';
      const mid = Math.floor(len / 2);
      const r2 = await fetch(gc.url, {
        method: 'POST', headers: gc.headers,
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: `Extrais les exigences techniques BTP de ce CCTP en JSON strict :
{"exigences":[{"article":"","designation":"","classement":"EI/CF/Rw...","certification":"ACERMI/EUCEB...","marque_imposee":"","remarque":""}]}
Retourne UNIQUEMENT le JSON valide sans markdown.
---
${text.slice(0, 3000)}
---
${text.slice(mid - 2000, mid + 2000)}` }],
          max_tokens: 1500, temperature: 0.1,
        }),
      });
      const d2  = await r2.json();
      const raw2 = (d2.choices[0]?.message?.content || '').trim().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      try { this._exigencesCCTP = JSON.parse(raw2.match(/\{[\s\S]*\}/)?.[0] || '{}').exigences || []; } catch { this._exigencesCCTP = []; }

      await new Promise(r => setTimeout(r, 2000));
      // ── Passe 3 : lignes DPGF — extrait ciblé 60% du document ──
      if (statusEl) statusEl.textContent = '🤖 Passe 3/3 — Lignes DPGF…';
      // Les lignes DPGF sont typiquement dans les 40 derniers % du document
      // DPGF typiquement dans les 25 derniers % du document
      // Heuristique : chercher le début réel du DPGF par mots-clés
      let dpgfStart = Math.floor(len * 0.70);
      const keywords = ['3.1\n', '3.2\n', '3.3\n', 'Chapitre 3', 'CHAPITRE 3', '3 -\n', '3 -  '];
      for (const kw of keywords) {
        const pos = text.indexOf(kw, Math.floor(len * 0.40));
        if (pos > 0 && pos < dpgfStart) { dpgfStart = pos; break; }
      }
      const dpgfExtrait = text.slice(dpgfStart);
      // Prendre jusqu'à 8000 chars de la zone DPGF
      const dpgfSlice = dpgfExtrait.slice(0, 8000);

      const r3 = await fetch(gc.url, {
        method: 'POST', headers: gc.headers,
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: `Extrais TOUTES les lignes de travaux quantifiées de ce DPGF en JSON strict :
{"lignes":[{"article":"3.3.1","designation":"désignation complète","unite":"M2/ML/U/FT","quantite":12.60}]}
IMPORTANT : inclure UNIQUEMENT les lignes avec une quantité numérique (ex: 12.60, 87.00, 2, 6).
Ignorer les titres de sections, descriptions sans quantité, et lignes de calcul vides.
Retourne UNIQUEMENT le JSON valide sans markdown.
---
${dpgfSlice}` }],
          max_tokens: 2000, temperature: 0.1,
        }),
      });
      const d3   = await r3.json();
      const raw3 = (d3.choices[0]?.message?.content || '').trim().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      let lignesPDF = [];
      try { lignesPDF = JSON.parse(raw3.match(/\{[\s\S]*\}/)?.[0] || '{}').lignes || []; } catch { lignesPDF = []; }

      // ── Peuplement tableau ──
      if (lignesPDF.length > 0) {
        this._lignes = lignesPDF.map((l, i) => {
          const matchPM = this.matcherPrixMarche(l.designation || '');
          const puAATB  = matchPM ? matchPM.pu : 0;
          return {
            id:             i,
            numero_lot:     l.article    || '',
            designation:    l.designation || '',
            lot:            this._categoriser(l.designation || ''),
            unite:          l.unite      || 'm²',
            quantite:       parseFloat(l.quantite) || 0,
            prix_unitaire:  puAATB || 0,
            _prix_base:     0,
            _prix_aatb:     puAATB,
            _marge:         0,
            _source:        puAATB ? 'aatb' : '',
            _match_pm:      matchPM ? matchPM.libelle : '',
            _ecart_pct:     0,
            cctp_reference: '',
          };
        });
        this._rapprocher();
        this._afficherTableau();
      }

      const nom    = this._infosAffaire.nom || file.name;
      const nbLig  = lignesPDF.length;
      const nbExig = this._exigencesCCTP.length;
      if (statusEl) statusEl.innerHTML = `✅ <strong>${nom}</strong><br><span style="color:var(--text-tertiary)">${nbExig} exigences + ${nbLig} lignes DPGF</span>`;
      if (zoneEl) zoneEl.style.borderColor = '#A78BFA';
      App.toast(`✅ Analyse complète — ${nbExig} exigences CCTP + ${nbLig} lignes DPGF`, 'success');

    } catch(err) {
      if (statusEl) statusEl.textContent = '⚠️ Erreur : ' + err.message;
      App.toast('Erreur analyse : ' + err.message, 'error');
    }
  },

  // ── Traitement fichier ────────────────────────────────────
  async _handleFile(file) {
    this._fileName = file.name;
    this._lignes   = [];
    this._showLoading(true, 'Lecture du fichier…');

    const ext = file.name.split('.').pop().toLowerCase();
    let text = '';

    try {
      if (ext === 'pdf') {
        text = await this._readPDF(file);
      } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
        text = await this._readExcel(file);
      } else {
        throw new Error('Format non supporté');
      }
    } catch (err) {
      this._showLoading(false);
      App.toast('Erreur lecture fichier : ' + err.message, 'error');
      return;
    }

    this._rawText = text;

    if (text === '__AOS_PARSED__') {
      App.toast('✅ Format AOS détecté — ' + this._lignes.length + ' lignes analysées', 'success');
    } else {
      this._showLoading(true, 'Analyse IA en cours…');
      try {
        await this._analyserAvecGroq(text);
      } catch (err) {
        this._showLoading(false);
        App.toast('Erreur analyse IA : ' + err.message, 'error');
        return;
      }
    }

    this._showLoading(false);
    this._afficherTableau();
  },

  // ── Lecture Excel/CSV ─────────────────────────────────────
  async _readExcel(file) {
    return new Promise((resolve, reject) => {
      if (typeof XLSX === 'undefined') { reject(new Error('SheetJS non disponible')); return; }
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'binary' });
          const ws0 = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws0, { header: 1, defval: '' });

          // Détection AOS : cherche ligne header avec désignation + unité + qté
          let headerRow = -1;
          for (let i = 0; i < Math.min(rows.length, 20); i++) {
            const cells = rows[i].map(c => String(c).toLowerCase());
            const hasDesig = cells.some(c => c.includes('désignation') || c.includes('designation'));
            const hasUnite = cells.some(c => c.includes('unité') || c.includes('unite'));
            const hasQte   = cells.some(c => c.includes('qté') || c.includes('qte') || c.includes('quantité'));
            if (hasDesig && hasUnite && hasQte) { headerRow = i; break; }
          }

          if (headerRow >= 0) {
            DPGF._isAOS = true;
            DPGF._parseAOS(rows, headerRow);
            DPGF._rapprocher();
            resolve('__AOS_PARSED__');
            return;
          }

          // Fallback CSV texte
          let text = '';
          wb.SheetNames.forEach(name => {
            const ws = wb.Sheets[name];
            text += '\n--- Feuille: ' + name + ' ---\n';
            text += XLSX.utils.sheet_to_csv(ws, { FS: '\t' });
          });
          resolve(text);
        } catch (err) { reject(err); }
      };
      reader.onerror = () => reject(new Error('Lecture impossible'));
      reader.readAsBinaryString(file);
    });
  },

  // ── Lecture PDF via PDF.js ────────────────────────────
  async _readPDF(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
            let text = '';
            const maxPages = Math.min(pdf.numPages, 20);
            for (let i = 1; i <= maxPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const pageText = content.items.map(item => item.str).join(' ');
              text += pageText + '\n';
            }
            resolve(text.slice(0, 60000));
          } else {
            // Fallback si PDF.js non disponible
            const arr = new Uint8Array(e.target.result);
            const str = new TextDecoder('latin1').decode(arr);
            const matches = str.match(/\(([^\)]{2,200})\)/g) || [];
            const words = matches
              .map(m => m.slice(1,-1).replace(/\\n/g,'\n').replace(/\\\(/g,'(').replace(/\\\)/g,')'))
              .filter(w => /[a-zA-ZÀ-ÿ0-9]/.test(w));
            resolve(words.join(' ').slice(0, 60000));
          }
        } catch(err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  },

  // ── Analyse Groq ──────────────────────────────────────────
  async _analyserAvecGroq(text) {
    const prompt = `Tu es expert en marchés publics BTP français.
Analyse ce DPGF/CCTP et extrais TOUTES les lignes de travaux liées à : plâtrerie, cloisons, plafonds, peinture, revêtements sols, isolation.
Pour chaque ligne retourne un objet JSON strict :
{
  "numero_lot": "ex: 10.1",
  "designation": "description complète",
  "lot": "Plâtrerie|Cloisons|Plafonds|Peinture|Revêtements|Isolation|Autre",
  "unite": "m²|ml|u|forfait|m3",
  "quantite": nombre ou null,
  "prix_unitaire": nombre ou null,
  "cctp_reference": "référence article CCTP si mentionné"
}
Retourne UNIQUEMENT un tableau JSON valide, sans commentaire, sans markdown.
Voici le contenu DPGF (max 12000 caractères) :
${text.slice(0, 12000)}`;

    const _gcDpgf = groqConfig();
    if (!_gcDpgf) throw new Error('Clé Groq requise en local — configurez-la dans Paramètres');
    const resp = await fetch(_gcDpgf.url, {
      method: 'POST',
      headers: _gcDpgf.headers,
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.1,
      }),
    });

    if (!resp.ok) throw new Error('Groq ' + resp.status);
    const data = await resp.json();
    const raw  = (data.choices[0]?.message?.content || '').trim();

    let parsed;
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      throw new Error('Réponse IA non parseable');
    }

    this._lignes = parsed.map((l, i) => ({
      id:            i,
      numero_lot:    l.numero_lot    || '',
      designation:   l.designation   || '',
      lot:           l.lot           || 'Autre',
      unite:         l.unite         || 'u',
      quantite:      parseFloat(l.quantite)     || 0,
      prix_unitaire: parseFloat(l.prix_unitaire) || 0,
      cctp_reference: l.cctp_reference || '',
      _prix_base:    parseFloat(l.prix_unitaire) || 0,
      _marge:        0,
      _source:       'dpgf',
    }));

    // Enrichissement depuis la base produits
    this._lignes.forEach(l => this._matcherProduit(l));
    // Rapprochement CCTP si déjà chargé
    this._rapprocher();
  },

  // ── Matcher produit base PlaqPro+ ─────────────────────────
  _matcherProduit(ligne) {
    const catalog = (typeof ProdMoteur !== 'undefined' && ProdMoteur.PRODUITS)
      ? ProdMoteur.PRODUITS : [];
    const userProds = DB.produits || [];
    const all = [...catalog, ...userProds];

    const words = ligne.designation.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    let best = null, bestScore = 0;

    all.forEach(p => {
      const pname = (p.nom || p.designation || '').toLowerCase();
      let score = 0;
      words.forEach(w => { if (pname.includes(w)) score++; });
      if (score > bestScore) { bestScore = score; best = p; }
    });

    if (best && bestScore >= 2) {
      if (!ligne._prix_base || ligne._prix_base === 0) {
        ligne._prix_base = parseFloat(best.prix || best.prix_ht || 0);
        ligne.prix_unitaire = ligne._prix_base;
        ligne._source = 'base';
      }
      ligne._produit_match = best.nom || best.designation || '';
    }
  },

  // ── Parse AOS (Acte on Site) ─────────────────────────────
  _parseAOS(rows, headerRow) {
    const headers = rows[headerRow].map(c => String(c).toLowerCase());
    const iDesig  = headers.findIndex(c => c.includes('désignation') || c.includes('designation'));
    const iUnite  = headers.findIndex(c => c.includes('unité') || c.includes('unite'));
    const iQteDO  = headers.findIndex(c => (c.includes('qté') || c.includes('qte') || c.includes('quantité')) && (c.includes('do') || c.includes('maître') || c.includes('maitre')));
    const iQteENT = headers.findIndex(c => (c.includes('qté') || c.includes('qte') || c.includes('quantité')) && (c.includes('ent') || c.includes('entreprise')));
    const iQte    = iQteDO >= 0 ? iQteDO : (iQteENT >= 0 ? iQteENT : headers.findIndex(c => c.includes('qté') || c.includes('qte') || c.includes('quantité')));
    const iPU     = headers.findIndex(c => c.includes('p.u') || c.includes('pu') || c.includes('prix unit') || c.includes('prix u'));
    const iIdx    = headers.findIndex(c => c === '#' || c === 'n°' || c === 'no' || c === 'num');

    this._lignes = [];
    let idx = 0;
    for (let i = headerRow + 1; i < rows.length; i++) {
      const row   = rows[i];
      const desig = String(row[iDesig] || '').trim();
      if (!desig) continue;
      const qte = parseFloat(row[iQte]) || 0;
      const pu  = parseFloat(row[iPU])  || 0;
      // Filtrer : lignes sans quantité ET tout en majuscules = section titre
      const isTitre = desig === desig.toUpperCase() && desig.length > 4;
      const isSection = isTitre && !qte;
      if (isSection) continue;
      // Filtrer : montants de sous-totaux (désignation très courte ou contient uniquement chiffres)
      if (/^\d+[\.,]\d+$/.test(desig)) continue;

      const pm    = this.matcherPrixMarche(desig);
      const puAAT = pm ? pm.pu : 0;
      const ecart = (pu > 0 && puAAT > 0) ? ((pu - puAAT) / puAAT * 100) : 0;

      this._lignes.push({
        id:            idx++,
        numero_lot:    String(row[iIdx] || ''),
        designation:   desig,
        lot:           this._categoriser(desig),
        unite:         String(row[iUnite] || 'm²').trim(),
        quantite:      qte,
        prix_unitaire: puAAT || pu,
        cctp_reference:'',
        _prix_base:    pu,
        _marge:        0,
        _source:       puAAT ? 'aatb' : 'dpgf',
        _prix_aatb:    puAAT,
        _ecart_pct:    ecart,
        _match_pm:     pm ? pm.key : '',
      });
    }
  },

  _categoriser(desig) {
    const d = (desig || '').toLowerCase();
    if (/cloison|montant|rail|plaque|ba\d/.test(d))              return 'Cloisons';
    if (/plafond|dalle|faux.plafond|suspente/.test(d))            return 'Plafonds';
    if (/peinture|lasure|vernis|lessivage|enduit/.test(d))        return 'Peinture';
    if (/isolation|laine|roche|verre|ouate/.test(d))              return 'Isolation';
    if (/revêtement|moquette|parquet|carrel|sol|plinthe/.test(d)) return 'Revêtements';
    if (/porte|bloc.porte|huisserie|menuiserie|fenêtre/.test(d))  return 'Menuiserie';
    if (/pmr|accessib|rampe|main.cour|podotactile/.test(d))       return 'PMR';
    return 'Autre';
  },

  _exporterRapportSynthese() {
    if (typeof XLSX === 'undefined') { App.toast('SheetJS non disponible', 'error'); return; }
    if (!this._lignes.length) { App.toast('Aucune donnée à exporter', 'error'); return; }
    this._genererRapport(this._infosAffaire || {});
  },

  _exporterAvecInfos() {
    ['dpgf-aff-nom','dpgf-aff-ref','dpgf-aff-dce','dpgf-aff-moa','dpgf-aff-moe','dpgf-aff-eco','dpgf-aff-lot'].forEach(id => {
      const el = document.getElementById(id);
      if (el) localStorage.setItem(id, el.value);
    });
    const infos = {
      nom: document.getElementById('dpgf-aff-nom')?.value || '',
      ref: document.getElementById('dpgf-aff-ref')?.value || '',
      dce: document.getElementById('dpgf-aff-dce')?.value || '',
      moa: document.getElementById('dpgf-aff-moa')?.value || '',
      moe: document.getElementById('dpgf-aff-moe')?.value || '',
      eco: document.getElementById('dpgf-aff-eco')?.value || '',
      lot: document.getElementById('dpgf-aff-lot')?.value || '',
    };
    App.closeModal();
    this._genererRapport(infos);
  },

  _genererRapport(infos) {
    if (typeof XLSX === 'undefined') { App.toast('SheetJS non disponible', 'error'); return; }
    if (!this._lignes.length) { App.toast('Aucune donnée à exporter', 'error'); return; }

    const wb     = XLSX.utils.book_new();
    const config = DB.getConfig ? DB.getConfig() : {};
    const profil = DB.getProfil ? DB.getProfil() : {};
    const tva    = profil.tvaPro ? profil.tvaPro / 100 : 0.20;
    const tvaLbl = Math.round(tva * 100) + '%';
    const today  = new Date().toLocaleDateString('fr-FR');
    const nomAff = infos.nom || this._fileName;
    const refAff = infos.ref ? 'Affaire ' + infos.ref : '';
    const dceAff = infos.dce ? '— DCE ' + infos.dce : '';
    const moaAff = infos.moa ? 'MOA : ' + infos.moa : '';
    const moeAff = infos.moe ? 'MOE : ' + infos.moe : '';
    const ecoAff = infos.eco ? 'Économiste : ' + infos.eco : '';
    const lotAff = infos.lot || 'Lot travaux';

    const BL = '1F3864', BM = '2E5FA3', BC = 'DCE6F1', OR = 'E67E22', OC = 'FEF0E6', GR = '27AE60', GC = 'E8F5EF', GS = 'F2F2F2', WH = 'FFFFFF';
    const mkFont  = (bold, color, sz) => ({ bold: !!bold, color: { rgb: color || '000000' }, sz: sz || 10, name: 'Arial' });
    const mkFill  = (color) => ({ patternType: 'solid', fgColor: { rgb: color }, bgColor: { rgb: color } });
    const mkAlign = (h, wrap) => ({ horizontal: h || 'left', vertical: 'center', wrapText: !!wrap });
    const bd      = { style: 'thin', color: { rgb: 'CCCCCC' } };
    const mkBd    = () => ({ top: bd, bottom: bd, left: bd, right: bd });
    const sCell   = (ws, ref, bold, fc, bg, ah, wrap, fmt) => {
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };
      ws[ref].s = { font: mkFont(bold, fc), fill: mkFill(bg || WH), alignment: mkAlign(ah, wrap), border: mkBd() };
      if (fmt) ws[ref].z = fmt;
    };

    // ── Onglet 1 : Synthèse avec formules ──────────────────
    const aoa1 = [];
    aoa1.push(['🏗 ' + (config.nomEntreprise || 'MON ENTREPRISE') + ' — RAPPORT DE SYNTHÈSE DPGF', '', '', '', '', '', '', '', '']);
    aoa1.push([nomAff, '', '', '', [refAff, dceAff].filter(Boolean).join(' '), '', '', '', '']);
    aoa1.push([[moaAff, moeAff, ecoAff].filter(Boolean).join(' — '), '', '', '', 'Généré le ' + today, '', '', lotAff, '']);
    aoa1.push(['⚠️ Prix AATB à titre indicatif — modifiez la colonne G, les totaux se recalculent automatiquement', '', '', '', '', '', '', '', '']);
    aoa1.push([]);
    aoa1.push(['Index', 'Désignation', 'Unité', 'Qté DO', 'PU Estimateur (€)', 'Montant DO (€)', 'PU AATB (€) ← modifiable', 'Montant AATB (€)', 'Alerte']);

    const dataStart = 7;
    let rn = dataStart;
    this._lignes.forEach(l => {
      const puDO   = l._prix_base || 0;
      const puAATB = l._prix_aatb || 0;
      const qte    = l.quantite   || 0;
      let alerte = '';
      if (puDO > 0 && puAATB > puDO * 1.40) alerte = '⚠️ Très sous-estimé — vérifier CCTP';
      else if (puDO > 0 && puAATB > puDO * 1.15) alerte = '⚠️ Insuffisant — négocier MOE';
      else if (l._match_pm) alerte = '✅ Réf. : ' + l._match_pm;
      else if (!puAATB) alerte = '❓ Prix à saisir manuellement';
      aoa1.push([
        l.numero_lot || '',
        l.designation,
        l.unite || 'u',
        qte || '',
        puDO   || '',
        (puDO && qte)   ? { t:'n', v: puDO*qte,   f: 'D'+rn+'*E'+rn }   : '',
        puAATB || '',
        (puAATB && qte) ? { t:'n', v: puAATB*qte, f: 'D'+rn+'*G'+rn }   : '',
        alerte,
      ]);
      rn++;
    });

    const lastData   = rn - 1;
    const totalDO    = this._lignes.reduce((s, l) => s + ((l._prix_base || 0) * (l.quantite || 0)), 0);
    const totalAATB  = this._lignes.reduce((s, l) => s + ((l._prix_aatb || l.prix_unitaire || 0) * (l.quantite || 0)), 0);
    const tvaAATB    = totalAATB * tva;
    const tvaDO      = totalDO * tva;
    const ttcDO      = totalDO + tvaDO;
    const ttcAATB    = totalAATB + tvaAATB;
    aoa1.push([]);
    const tRow1 = rn + 1;
    aoa1.push(['', '', '', '', 'Total HT estimateur', { t:'n', v:totalDO,   f:'SUM(F'+dataStart+':F'+lastData+')' }, 'Total HT AATB', { t:'n', v:totalAATB,  f:'SUM(H'+dataStart+':H'+lastData+')' }, '']);
    const tRow2 = tRow1 + 1;
    aoa1.push(['', '', '', '', 'TVA ' + tvaLbl, { t:'n', v:tvaDO,   f:'F'+tRow1+'*'+tva }, 'TVA ' + tvaLbl, { t:'n', v:tvaAATB,  f:'H'+tRow1+'*'+tva }, '']);
    aoa1.push(['', '', '', '', 'TOTAL TTC',     { t:'n', v:ttcDO,   f:'F'+tRow1+'+F'+tRow2 }, 'TOTAL TTC',  { t:'n', v:ttcAATB,  f:'H'+tRow1+'+H'+tRow2 }, '']);

    const ws1 = XLSX.utils.aoa_to_sheet(aoa1);
    ws1['!cols'] = [8, 44, 8, 10, 16, 16, 18, 16, 32].map(w => ({ wch: w }));
    ws1['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
      { s: { r: 1, c: 4 }, e: { r: 1, c: 8 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
      { s: { r: 2, c: 4 }, e: { r: 2, c: 6 } },
      { s: { r: 2, c: 7 }, e: { r: 2, c: 8 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } },
    ];

    // Styles onglet 1
    if (ws1['A1']) ws1['A1'].s = { font: mkFont(true, WH, 13), fill: mkFill(BL), alignment: mkAlign('left') };
    if (ws1['A2']) ws1['A2'].s = { font: mkFont(false, WH, 11), fill: mkFill(BM), alignment: mkAlign('left') };
    if (ws1['E2']) ws1['E2'].s = { font: mkFont(false, WH, 10), fill: mkFill(BM), alignment: mkAlign('right') };
    if (ws1['A3']) ws1['A3'].s = { font: mkFont(false, WH, 10), fill: mkFill(BM), alignment: mkAlign('left') };
    if (ws1['E3']) ws1['E3'].s = { font: mkFont(false, WH, 10), fill: mkFill(BM), alignment: mkAlign('center') };
    if (ws1['H3']) ws1['H3'].s = { font: mkFont(true, WH, 10), fill: mkFill(BM), alignment: mkAlign('center') };
    if (ws1['A4']) ws1['A4'].s = { font: mkFont(false, OR, 10), fill: mkFill(OC), alignment: mkAlign('left', true) };
    const cols = ['A','B','C','D','E','F','G','H','I'];
    cols.forEach(c => {
      const ref = c + '6';
      if (!ws1[ref]) ws1[ref] = { t:'s', v:'' };
      if (typeof ws1[ref].v === 'undefined') ws1[ref].v = '';
      ws1[ref].t = 's';
      ws1[ref].s = { font: mkFont(true, WH, 10), fill: mkFill(BM), alignment: mkAlign('center'), border: mkBd() };
    });
    for (let r = dataStart; r <= lastData; r++) {
      const bg = r % 2 === 0 ? GS : WH;
      cols.forEach(c => {
        const ref = c + r;
        const isAATB = c === 'G' || c === 'H';
        const isNum  = 'DEFGH'.includes(c);
        if (!ws1[ref]) ws1[ref] = { t:'s', v:'' };
        ws1[ref].s = {
          font:      mkFont(isAATB, isAATB ? BL : '1D1D1F'),
          fill:      mkFill(isAATB ? BC : bg),
          alignment: mkAlign(isNum ? 'right' : 'left'),
          border:    mkBd(),
        };
        if ('EFGH'.includes(c)) ws1[ref].z = '#,##0.00 €';
      });
    }
    for (let tr = tRow1; tr <= tRow1 + 2; tr++) {
      const isTTC = tr === tRow1 + 2;
      const bg    = isTTC ? BC : GS;
      cols.forEach(c => {
        const ref = c + tr;
        if (!ws1[ref]) ws1[ref] = { t:'s', v:'' };
        ws1[ref].s = {
          font:      mkFont(isTTC, isTTC ? BL : '1D1D1F', isTTC ? 11 : 10),
          fill:      mkFill(bg),
          alignment: mkAlign('right'),
          border:    mkBd(),
        };
        if ('FH'.includes(c)) ws1[ref].z = '#,##0.00 €';
      });
    }
    ws1['!rows'] = [];
    ws1['!rows'][0] = { hpt: 24 };
    ws1['!rows'][1] = { hpt: 18 };
    ws1['!rows'][2] = { hpt: 18 };
    ws1['!rows'][5] = { hpt: 22 };
    for (let r = dataStart; r <= lastData; r++) ws1['!rows'][r-1] = { hpt: 16 };
    ws1['!rows'][tRow1-1] = { hpt: 18 };
    ws1['!rows'][tRow1]   = { hpt: 18 };
    ws1['!rows'][tRow1+1] = { hpt: 22 };

    // ── Bloc commentaires détaillés sous totaux ──
    let cr = tRow1 + 5;
    // Titre bloc
    ws1['A'+cr] = { t:'s', v:'📋 NOTES DÉTAILLÉES — JUSTIFICATIONS ET RECOMMANDATIONS PAR POSTE' };
    ws1['A'+cr].s = { font: mkFont(true, WH, 11), fill: mkFill(OR), alignment: mkAlign('left'), border: mkBd() };
    ws1['!merges'].push({ s:{r:cr-1,c:0}, e:{r:cr-1,c:8} });
    ws1['!rows'][cr-1] = { hpt: 22 };
    cr++;

    // Sous-titre colonnes
    ['Poste','Désignation','PU DO','PU AATB','Écart','Niveau','Justification technique','Recommandation','Action'].forEach((h,i) => {
      const ref = cols[i] + cr;
      ws1[ref] = { t:'s', v:h };
      ws1[ref].s = { font: mkFont(true, WH, 9), fill: mkFill(BM), alignment: mkAlign('center'), border: mkBd() };
    });
    ws1['!rows'][cr-1] = { hpt: 18 };
    cr++;

    // Lignes commentaires pour chaque poste avec écart
    const postesAvecEcart = this._lignes.filter(l => l._prix_base > 0 && (l._prix_aatb || 0) > 0);
    postesAvecEcart.forEach((l, i) => {
      const puDO   = l._prix_base || 0;
      const puAATB = l._prix_aatb || 0;
      const ecart  = puDO > 0 && puAATB > 0 ? ((puAATB - puDO) / puDO * 100).toFixed(0) : 0;
      const niveau = ecart > 40 ? '🔴 Critique' : ecart > 20 ? '🟠 Important' : ecart > 10 ? '🟡 Modéré' : '✅ OK';
      const bg     = i % 2 === 0 ? GS : WH;

      let justif = '';
      let reco   = '';
      const d = l.designation.toLowerCase();
      // Priorité : justification depuis CCTP
      if (l._justif_cctp) {
        justif = '📋 ' + l._justif_cctp;
      }
      if (d.includes('porte') && (d.includes('ei') || d.includes('das'))) {
        if (!justif) justif = 'Bloc-porte DAS avec ferme-porte, ventouses électromagnétiques et sélecteur — PV DAS obligatoire';
        reco   = 'Demander PV DAS existants au MOE — vérifier angle ouverture et charge admissible';
      } else if (d.includes('acoustique') || d.includes('phonique')) {
        justif = 'Plafond acoustique nécessite BA13 perforé + laine minérale 60mm certifiée ACERMI + ossature renforcée';
        reco   = 'Exiger fiche ACERMI du fabricant — prévoir indice Rw et absorption αw dans le devis';
      } else if (d.includes('cloison') && (d.includes('ei') || d.includes('98'))) {
        justif = 'Cloison EI60 Rw49dB : 2×BA13 feu + LV45mm ACERMI + ossature 48/70 — BA13 standard insuffisant';
        reco   = 'Joindre fiche technique PLACOSTIL/PREGYMETAL + attestation ACERMI au dossier';
      } else if (d.includes('nez de marche')) {
        justif = 'Grand linéaire (803ml) — profil aluminium + bande PVC antidérapante vissée — norme P98-351';
        reco   = 'Visite de site mensuration obligatoire avant dépôt — prévoir coupes spéciales paliers';
      } else if (d.includes('peinture')) {
        justif = 'Impression + 2 couches aqueuse — étiquette A+ obligatoire — directive COV 2010/75/UE';
        reco   = 'Joindre FDS peinture — vérifier compatibilité support (béton/plâtre/bois)';
      } else if (d.includes('lessivage')) {
        justif = 'Préparation support : lessivage + enduit garnissant + ponçage — état réel à vérifier sur site';
        reco   = 'Visite de site obligatoire — état des supports peut nécessiter traitement anti-humidité';
      } else if (l._match_pm) {
        justif = 'Prix de référence marché : ' + l._match_pm;
        reco   = 'Prix conforme — vérifier conditions chantier (accès, protection, site occupé)';
      } else {
        justif = 'Prix à confirmer selon conditions chantier et fournisseur';
        reco   = 'Demander devis fournisseur avant dépôt';
      }

      const vals = [l.numero_lot||'', l.designation.slice(0,45), puDO ? puDO+'€' : '—', puAATB ? puAATB+'€' : '—', ecart > 0 ? '+'+ecart+'%' : '=', niveau, justif, reco, ecart > 15 ? '⚠️ À négocier' : '✅ Conforme'];
      vals.forEach((v, ci) => {
        const ref = cols[ci] + cr;
        ws1[ref] = { t:'s', v: String(v) };
        ws1[ref].s = {
          font:      mkFont(false, '1D1D1F', 9),
          fill:      mkFill(bg),
          alignment: mkAlign(ci > 1 ? 'center' : 'left', ci > 5),
          border:    mkBd(),
        };
      });
      ws1['!rows'][cr-1] = { hpt: i > 4 ? 32 : 16 };
      cr++;
    });

    // Note finale
    cr++;
    ws1['A'+cr] = { t:'s', v:'💡 Majoration site occupé recommandée : +8% MO — Prévoir installation chantier/nettoyage : 3 à 5% du total HT — Visite de site OBLIGATOIRE avant dépôt' };
    ws1['A'+cr].s = { font: mkFont(false, OR, 9), fill: mkFill(OC), alignment: mkAlign('left', true), border: mkBd() };
    ws1['!merges'].push({ s:{r:cr-1,c:0}, e:{r:cr-1,c:8} });
    ws1['!rows'][cr-1] = { hpt: 28 };

    // ── Bloc alertes & recommandations intégré dans onglet 1 ──
    cr += 2;
    ws1['A'+cr] = { t:'s', v:'⚠️ ANALYSE DES ÉCARTS — POSTES À NÉGOCIER AVEC LE MAÎTRE D\'ŒUVRE' };
    ws1['A'+cr].s = { font: mkFont(true, WH, 11), fill: mkFill(OR), alignment: mkAlign('left'), border: mkBd() };
    ws1['!merges'].push({ s:{r:cr-1,c:0}, e:{r:cr-1,c:8} });
    ws1['!rows'][cr-1] = { hpt: 22 };
    cr++;

    ['Index','Désignation','PU Estimateur','PU AATB','Écart %','Niveau','Recommandation','',''].forEach((h,i) => {
      const ref = cols[i] + cr;
      ws1[ref] = { t:'s', v:h };
      ws1[ref].s = { font: mkFont(true, WH, 9), fill: mkFill(BM), alignment: mkAlign('center'), border: mkBd() };
    });
    ws1['!rows'][cr-1] = { hpt: 18 };
    cr++;

    const alertes2 = this._lignes.filter(l => l._prix_base > 0 && (l._prix_aatb || 0) > l._prix_base * 1.10);
    if (!alertes2.length) {
      ws1['A'+cr] = { t:'s', v:'✅ Aucune alerte — tous les prix sont cohérents avec la base marché' };
      ws1['A'+cr].s = { font: mkFont(false, GR, 10), fill: mkFill(GC), alignment: mkAlign('left'), border: mkBd() };
      ws1['!merges'].push({ s:{r:cr-1,c:0}, e:{r:cr-1,c:8} });
      cr++;
    } else {
      alertes2.forEach((l, i) => {
        const e   = ((l._prix_aatb - l._prix_base) / l._prix_base * 100).toFixed(0);
        const niv = e > 40 ? '🔴 Critique' : e > 20 ? '🟠 Important' : '🟡 Modéré';
        let rec   = 'Négocier bordereau avec MOE';
        const d   = l.designation.toLowerCase();
        if (l._justif_cctp)                                            rec = l._justif_cctp;
        else if (d.includes('porte'))                                  rec = 'Demander PV DAS — vérifier SSI existant';
        else if (d.includes('acoustique') || d.includes('phonique'))  rec = 'Exiger ACERMI — matériaux spécifiques';
        else if (d.includes('nez de marche'))                         rec = 'Visite mensuration obligatoire';
        else if (d.includes('cloison'))                               rec = 'Vérifier classement EI/Rw — BA13 std ≠ EI60';
        const bg = i % 2 === 0 ? GS : WH;
        const vals = [l.numero_lot||'', l.designation.slice(0,45), l._prix_base+'€', l._prix_aatb+'€', '+'+e+'%', niv, rec, '', ''];
        vals.forEach((v, ci) => {
          const ref = cols[ci] + cr;
          ws1[ref] = { t:'s', v:String(v) };
          ws1[ref].s = { font: mkFont(ci===5, ci===4?'C0392B':'1D1D1F', 9), fill: mkFill(bg), alignment: mkAlign(ci>1?'center':'left'), border: mkBd() };
        });
        ws1['!rows'][cr-1] = { hpt: 16 };
        cr++;
      });
    }

    // Conseils généraux AO
    cr++;
    ws1['A'+cr] = { t:'s', v:'📋 CONSEILS GÉNÉRAUX POUR LA RÉPONSE AO' };
    ws1['A'+cr].s = { font: mkFont(true, WH, 10), fill: mkFill(BM), alignment: mkAlign('left'), border: mkBd() };
    ws1['!merges'].push({ s:{r:cr-1,c:0}, e:{r:cr-1,c:8} });
    ws1['!rows'][cr-1] = { hpt: 20 };
    cr++;

    ['• Visite de site OBLIGATOIRE avant dépôt — état réel des supports et SSI',
     '• Majoration site occupé : +8% MO (bureaux en activité)',
     '• Joindre fiches techniques produits + certifications ACERMI/EUCEB',
     '• Portes DAS : PV en cours de validité + vérifier angle ouverture/charge',
     '• Peintures : phase aqueuse obligatoire — étiquette A+ — directive COV 2010',
     '• Installation chantier / nettoyage final : prévoir 3 à 5% du total HT',
    ].forEach(conseil => {
      ws1['A'+cr] = { t:'s', v:conseil };
      ws1['A'+cr].s = { font: mkFont(false, '1D1D1F', 9), fill: mkFill(cr%2===0?GS:WH), alignment: mkAlign('left'), border: mkBd() };
      ws1['!merges'].push({ s:{r:cr-1,c:0}, e:{r:cr-1,c:8} });
      ws1['!rows'][cr-1] = { hpt: 16 };
      cr++;
    });

    // Forcer le !ref pour inclure toutes les lignes générées
    ws1['!ref'] = 'A1:I' + (cr + 5);

    XLSX.utils.book_append_sheet(wb, ws1, 'Synthèse (modifiable)');

    // ── Onglet 3 : Base prix marché ─────────────────────────
    const pm   = this.getPrixMarche();
    const aoa3 = [];
    aoa3.push(['BASE PRIX DE MARCHÉ — À TITRE INDICATIF', '', '']);
    aoa3.push(['Ces prix sont des références. Personnalisez-les dans Paramètres > Base prix.', '', '']);
    aoa3.push([]);
    aoa3.push(['Poste type', 'PU HT (€)', 'Libellé référence']);
    pm.forEach(p => aoa3.push([p.designation, p.pu, p.libelle || p.designation]));

    const ws3 = XLSX.utils.aoa_to_sheet(aoa3);
    ws3['!cols'] = [25, 14, 40].map(w => ({ wch: w }));
    ws3['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    ];
    if (ws3['A1']) ws3['A1'].s = { font: mkFont(true, WH, 12), fill: mkFill(GR), alignment: mkAlign('left') };
    if (ws3['A2']) ws3['A2'].s = { font: mkFont(false, '555555', 9), fill: mkFill(GC), alignment: mkAlign('left') };
    if (ws3['A4']) ['A','B','C'].forEach(c => { if (ws3[c+'4']) ws3[c+'4'].s = { font: mkFont(true, WH, 10), fill: mkFill(BM), alignment: mkAlign('center'), border: mkBd() }; });
    for (let r = 5; r <= pm.length + 4; r++) {
      const bg = r % 2 === 0 ? GS : WH;
      ['A','B','C'].forEach(c => { if (ws3[c+r]) { ws3[c+r].s = { font: mkFont(false, '333333'), fill: mkFill(bg), alignment: mkAlign(c === 'B' ? 'right' : 'left'), border: mkBd() }; if (c === 'B') ws3[c+r].z = '#,##0.00 €'; } });
    }
    XLSX.utils.book_append_sheet(wb, ws3, 'Base prix marché');

    XLSX.writeFile(wb, 'Synthese_DPGF_' + new Date().toISOString().split('T')[0] + '.xlsx');
    App.toast('📊 Rapport synthèse exporté — 2 onglets', 'success');
  },

  // ── P.U. final avec marge ─────────────────────────────────
  _puFinal(ligne) {
    const base = parseFloat(ligne.prix_unitaire) || 0;
    const m    = parseFloat(ligne._marge) || 0;
    return base * (1 + m / 100);
  },

  _totalLigne(ligne) {
    return this._puFinal(ligne) * (parseFloat(ligne.quantite) || 0);
  },

  // ── Affichage tableau ─────────────────────────────────────
  _afficherTableau(filtreLot) {
    const zone  = document.getElementById('dpgf-table-zone');
    const tbody = document.getElementById('dpgf-tbody');
    const fname = document.getElementById('dpgf-file-name');
    const lotsDiv = document.getElementById('dpgf-lots-btns');
    if (!zone || !tbody) return;

    if (fname) fname.textContent = this._fileName;
    zone.style.display = '';

    // Filtres lots
    const lots = [...new Set(this._lignes.map(l => l.lot))];
    if (lotsDiv) {
      lotsDiv.innerHTML = `<button class="dpgf-lot-btn${!filtreLot ? ' active' : ''}" onclick="DPGF._afficherTableau()">Tous (${this._lignes.length})</button>` +
        lots.map(lot => {
          const n = this._lignes.filter(l => l.lot === lot).length;
          return `<button class="dpgf-lot-btn${filtreLot === lot ? ' active' : ''}" onclick="DPGF._afficherTableau('${lot}')">${lot} (${n})</button>`;
        }).join('');
    }

    const visible = filtreLot ? this._lignes.filter(l => l.lot === filtreLot) : this._lignes;

    tbody.innerHTML = visible.map(l => {
      const puFinal   = this._puFinal(l);
      const total     = this._totalLigne(l);
      const sourceBadge = l._source === 'base'
        ? `<span style="font-size:10px;background:rgba(45,212,160,0.15);color:#2DD4A0;border-radius:4px;padding:1px 5px;margin-left:4px" title="${l._produit_match || ''}">✓ base</span>`
        : l._source === 'aatb'
        ? `<span style="font-size:10px;background:rgba(79,142,247,0.15);color:#4F8EF7;border-radius:4px;padding:1px 5px;margin-left:4px">✓ aatb</span>`
        : '';
      const alerteBadge = (l._ecart_pct || 0) > 15
        ? `<span style="font-size:10px;background:rgba(239,68,68,0.15);color:#EF4444;border-radius:4px;padding:1px 5px;margin-left:4px" title="Écart prix marché : +${Math.round(l._ecart_pct)}%">⚠️ +${Math.round(l._ecart_pct)}%</span>`
        : '';

      return `<tr id="dpgf-row-${l.id}" style="border-bottom:1px solid var(--border)">
        <td class="dpgf-td" style="color:var(--text-tertiary);font-size:11px">${l.numero_lot || l.id + 1}</td>
        <td class="dpgf-td">
          <div style="font-weight:600;color:var(--text-primary)">${this._esc(l.designation)}${sourceBadge}${alerteBadge}</div>
          ${l.cctp_reference ? `<div style="font-size:11px;color:var(--text-tertiary)">${this._esc(l.cctp_reference)}</div>` : ''}
        </td>
        <td class="dpgf-td"><span class="dpgf-lot-tag" style="background:${this._lotColor(l.lot)}20;color:${this._lotColor(l.lot)}">${l.lot}</span></td>
        <td class="dpgf-td" style="text-align:center">${this._esc(l.unite)}</td>
        <td class="dpgf-td" style="text-align:right">${this._fmt(l.quantite)}</td>
        <td class="dpgf-td" style="text-align:right;color:var(--text-secondary)">${l._prix_base ? this._fmtE(l._prix_base) : '—'}</td>
        <td class="dpgf-td">
          <div style="display:flex;align-items:center;gap:4px">
            <input type="number" class="dpgf-input" style="width:48px;text-align:right" value="${l._marge || 0}"
              onchange="DPGF._updateMarge(${l.id}, this.value)" min="-50" max="200" step="1">
            <span style="font-size:11px;color:var(--text-tertiary)">%</span>
          </div>
        </td>
        <td class="dpgf-td">
          <input type="number" class="dpgf-input" style="width:74px;text-align:right" value="${puFinal ? puFinal.toFixed(2) : ''}"
            placeholder="0.00" onchange="DPGF._updatePrix(${l.id}, this.value)">
        </td>
        <td class="dpgf-td" style="text-align:right;font-weight:700;color:var(--text-primary)">${total ? this._fmtE(total) : '—'}</td>
        <td class="dpgf-td">
          <div style="display:flex;flex-direction:column;gap:3px">
            <button class="dpgf-action-btn" onclick="DPGF._rechercherBase(${l.id})" title="Trouver dans ma base">🔍</button>
            <button class="dpgf-action-btn" onclick="DPGF._saisirPrixManuel(${l.id})" title="Saisir prix manuellement">✏️</button>
            <button class="dpgf-action-btn" onclick="DPGF._suggererIA(${l.id})" title="Suggérer prix via IA">✨</button>
          </div>
        </td>
      </tr>`;
    }).join('');

    this._renderRecap();
  },

  // ── Mise à jour prix/marge ────────────────────────────────
  _updateMarge(id, val) {
    const l = this._lignes.find(x => x.id === id);
    if (!l) return;
    l._marge = parseFloat(val) || 0;
    this._refreshRow(l);
    this._renderRecap();
  },

  _updatePrix(id, val) {
    const l = this._lignes.find(x => x.id === id);
    if (!l) return;
    l.prix_unitaire = parseFloat(val) || 0;
    l._marge = 0;
    this._refreshRow(l);
    this._renderRecap();
  },

  _refreshRow(l) {
    const row = document.getElementById('dpgf-row-' + l.id);
    if (!row) return;
    const puFinal = this._puFinal(l);
    const total   = this._totalLigne(l);
    const cells   = row.querySelectorAll('td');
    // PU input (index 7) + total (index 8)
    if (cells[7]) cells[7].querySelector('input').value = puFinal ? puFinal.toFixed(2) : '';
    if (cells[8]) cells[8].textContent = total ? this._fmtE(total) : '—';
  },

  // ── Boutons action ────────────────────────────────────────
  _rechercherBase(id) {
    const l = this._lignes.find(x => x.id === id);
    if (!l) return;
    const catalog    = (typeof ProdMoteur !== 'undefined' && ProdMoteur.PRODUITS) ? ProdMoteur.PRODUITS : [];
    const userProds  = DB.produits || [];
    const all        = [...catalog, ...userProds].slice(0, 80);
    const words      = l.designation.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const results    = all
      .map(p => {
        const pname = (p.nom || p.designation || '').toLowerCase();
        let score = 0;
        words.forEach(w => { if (pname.includes(w)) score++; });
        return { p, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(x => x.p);

    const body = document.createElement('div');
    body.style.cssText = 'display:flex;flex-direction:column;gap:6px;max-height:340px;overflow-y:auto';

    if (!results.length) {
      body.innerHTML = '<div style="color:var(--text-tertiary);font-size:13px;padding:12px 0">Aucun produit correspondant trouvé.</div>';
    } else {
      results.forEach(p => {
        const prix = parseFloat(p.prix || p.prix_ht || 0);
        const btn  = document.createElement('button');
        btn.className = 'dpgf-result-item';
        btn.innerHTML = `<span style="flex:1;font-size:13px">${this._esc(p.nom || p.designation || '')}</span><span style="font-size:12px;font-weight:700;color:var(--accent)">${this._fmtE(prix)}</span>`;
        btn.onclick = () => {
          l.prix_unitaire = prix; l._prix_base = prix; l._source = 'base'; l._produit_match = p.nom || p.designation || '';
          this._refreshRow(l); this._renderRecap();
          App.closeModal();
          App.toast('Prix appliqué depuis la base', 'success');
        };
        body.appendChild(btn);
      });
    }
    App.openModal('🔍 Trouver dans la base — ' + l.designation.slice(0, 40), body, '');
  },

  _saisirPrixManuel(id) {
    const l = this._lignes.find(x => x.id === id);
    if (!l) return;
    const body = document.createElement('div');
    body.innerHTML = `
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">${this._esc(l.designation)}</div>
      <div style="display:flex;gap:10px;align-items:center">
        <label style="font-size:13px;color:var(--text-secondary)">Prix unitaire HT (€)</label>
        <input type="number" id="dpgf-manual-prix" class="dpgf-input" style="width:110px" value="${l.prix_unitaire || ''}" placeholder="0.00" step="0.01">
      </div>`;
    const footer = `<button class="btn btn-primary" onclick="
      const v = parseFloat(document.getElementById('dpgf-manual-prix').value);
      if (!isNaN(v)) { DPGF._updatePrix(${id}, v); DPGF._renderRecap(); App.closeModal(); App.toast('Prix mis à jour','success'); }
    ">Appliquer</button>`;
    App.openModal('✏️ Saisie manuelle', body, footer);
  },

  async _suggererIA(id) {
    const l = this._lignes.find(x => x.id === id);
    if (!l) return;
    App.toast('IA analyse le prix…', 'info');
    const prompt = `Estime un prix unitaire HT raisonnable en France pour cette prestation BTP plaquiste :
"${l.designation}" (unité: ${l.unite})
Réponds UNIQUEMENT avec un nombre décimal (ex: 45.50), sans unité ni texte.`;

    try {
      const _gcSug = groqConfig();
      if (!_gcSug) { App.toast('Clé Groq requise en local', 'error'); return; }
      const resp = await fetch(_gcSug.url, {
        method: 'POST',
        headers: _gcSug.headers,
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 20, temperature: 0.2,
        }),
      });
      const data = await resp.json();
      const raw  = (data.choices[0]?.message?.content || '').replace(',', '.').replace(/[^\d.]/g, '');
      const prix = parseFloat(raw);
      if (isNaN(prix) || prix <= 0) throw new Error('Prix non valide');
      l.prix_unitaire = prix; l._prix_base = prix; l._source = 'ia';
      this._refreshRow(l); this._renderRecap();
      App.toast(`Prix IA : ${this._fmtE(prix)} appliqué`, 'success');
    } catch (err) {
      App.toast('Erreur IA : ' + err.message, 'error');
    }
  },

  // ── Récap par lot ─────────────────────────────────────────
  _renderRecap() {
    const zone = document.getElementById('dpgf-recap');
    if (!zone) return;

    const lots   = [...new Set(this._lignes.map(l => l.lot))];
    const tva    = 0.10;
    let totalHT  = 0;

    const rows = lots.map(lot => {
      const lignesLot = this._lignes.filter(l => l.lot === lot);
      const tot = lignesLot.reduce((s, l) => s + this._totalLigne(l), 0);
      totalHT += tot;
      return `<div style="display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:${this._lotColor(lot)};display:inline-block;flex-shrink:0"></span>
          <span style="font-size:13px;font-weight:600;color:var(--text-primary)">${lot}</span>
          <span style="font-size:11px;color:var(--text-tertiary)">${lignesLot.length} ligne${lignesLot.length > 1 ? 's' : ''}</span>
        </div>
        <span style="font-weight:700;color:var(--text-primary)">${this._fmtE(tot)}</span>
      </div>`;
    }).join('');

    const tvaMt  = totalHT * tva;
    const ttc    = totalHT + tvaMt;
    const lignesRemplies = this._lignes.filter(l => l.prix_unitaire > 0).length;
    const pct = this._lignes.length ? Math.round(lignesRemplies / this._lignes.length * 100) : 0;

    zone.innerHTML = `
      <div class="card" style="border:1px solid var(--border)">
        <div class="card-header">
          <span class="card-title">📊 Récapitulatif par lot</span>
          <span style="font-size:12px;color:${pct < 50 ? '#F7A64F' : pct < 100 ? '#4F8EF7' : '#2DD4A0'}">${pct}% des lignes renseignées</span>
        </div>
        <div class="card-body" style="padding:0">
          ${rows || '<div style="padding:16px;color:var(--text-tertiary);font-size:13px">Aucune ligne analysée</div>'}
          <div style="padding:12px 16px;background:var(--bg-tertiary)">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:13px;color:var(--text-secondary)">Total HT</span>
              <span style="font-weight:700;font-size:15px;color:var(--text-primary)">${this._fmtE(totalHT)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:13px;color:var(--text-secondary)">TVA 10%</span>
              <span style="font-size:14px;color:var(--text-secondary)">${this._fmtE(tvaMt)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid var(--border)">
              <span style="font-size:14px;font-weight:700;color:var(--text-primary)">Total TTC</span>
              <span style="font-size:18px;font-weight:900;color:var(--accent)">${this._fmtE(ttc)}</span>
            </div>
          </div>
        </div>
      </div>`;
  },

  // ── Vérification CCTP ─────────────────────────────────────
  async _verifierCCTP() {
    App.toast('Vérification CCTP en cours…', 'info');
    const lignesRemplies = this._lignes.filter(l => l.prix_unitaire > 0);
    if (!lignesRemplies.length) { App.toast('Renseignez d\'abord les prix', 'error'); return; }

    const resume = lignesRemplies.slice(0, 30).map(l =>
      `${l.designation} | ${l.unite} | qté ${l.quantite} | PU ${l.prix_unitaire}€ | total ${this._totalLigne(l).toFixed(0)}€`
    ).join('\n');

    const prompt = `Expert BTP, vérifie ces lignes DPGF pour incohérences :
${resume}

Signale : prix aberrants, unités suspectes, totaux incohérents, prestations hors lot plaquiste.
Réponds en JSON strict : { "alertes": [{"ligne":"...", "probleme":"...","niveau":"warning|error"}], "ok": true|false }`;

    try {
      const _gcCctp = groqConfig();
      if (!_gcCctp) { App.toast('Clé Groq requise en local', 'error'); return; }
      const resp = await fetch(_gcCctp.url, {
        method: 'POST',
        headers: _gcCctp.headers,
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024, temperature: 0.1,
        }),
      });
      const data = await resp.json();
      const raw  = (data.choices[0]?.message?.content || '').trim();
      const jm   = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jm ? jm[0] : raw);
      this._afficherAlerteCCTP(parsed);
    } catch (err) {
      App.toast('Erreur vérification : ' + err.message, 'error');
    }
  },

  _afficherAlerteCCTP(data) {
    const zone = document.getElementById('dpgf-cctp-alert');
    if (!zone) return;

    if (data.ok && (!data.alertes || !data.alertes.length)) {
      zone.style.display = '';
      zone.innerHTML = `<div style="background:rgba(45,212,160,0.1);border:1px solid rgba(45,212,160,0.3);border-radius:10px;padding:14px 18px;color:#2DD4A0;font-size:13px">✅ Vérification CCTP : aucune anomalie détectée</div>`;
      return;
    }

    const alertes = (data.alertes || []).map(a => `
      <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:16px;flex-shrink:0">${a.niveau === 'error' ? '❌' : '⚠️'}</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${this._esc(a.ligne)}</div>
          <div style="font-size:12px;color:var(--text-secondary)">${this._esc(a.probleme)}</div>
        </div>
      </div>`).join('');

    zone.style.display = '';
    zone.innerHTML = `
      <div style="background:rgba(247,166,79,0.08);border:1px solid rgba(247,166,79,0.3);border-radius:10px;padding:16px">
        <div style="font-size:14px;font-weight:700;color:#F7A64F;margin-bottom:10px">⚠️ ${data.alertes.length} anomalie${data.alertes.length > 1 ? 's' : ''} CCTP détectée${data.alertes.length > 1 ? 's' : ''}</div>
        ${alertes}
      </div>`;
  },

  // ── Export Excel ──────────────────────────────────────────
  _exporterExcel() {
    if (typeof XLSX === 'undefined') { App.toast('SheetJS non disponible', 'error'); return; }
    const rows = [['N°', 'Désignation', 'Lot', 'Unité', 'Quantité', 'PU HT (€)', 'Total HT (€)', 'Réf. CCTP']];
    this._lignes.forEach(l => {
      rows.push([
        l.numero_lot || l.id + 1,
        l.designation,
        l.lot,
        l.unite,
        l.quantite,
        this._puFinal(l).toFixed(2),
        this._totalLigne(l).toFixed(2),
        l.cctp_reference || '',
      ]);
    });

    const totalHT = this._lignes.reduce((s, l) => s + this._totalLigne(l), 0);
    rows.push([]);
    rows.push(['', '', '', '', '', 'TOTAL HT', totalHT.toFixed(2), '']);
    rows.push(['', '', '', '', '', 'TVA 10%', (totalHT * 0.10).toFixed(2), '']);
    rows.push(['', '', '', '', '', 'TOTAL TTC', (totalHT * 1.10).toFixed(2), '']);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [8,40,12,8,10,12,14,16].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DPGF complété');
    XLSX.writeFile(wb, 'DPGF_complete_' + Date.now() + '.xlsx');
    App.toast('Export Excel généré', 'success');
  },

  // ── Générer devis PlaqPro+ ────────────────────────────────
  _genererDevis() {
    const lignesOk = this._lignes.filter(l => l.prix_unitaire > 0);
    if (!lignesOk.length) { App.toast('Renseignez d\'abord les prix', 'error'); return; }

    const chantiers = DB.chantiers || [];
    const opts = chantiers.map(c =>
      `<option value="${c.id}">${this._esc(c.nom || c.adresse || c.id)}</option>`
    ).join('');

    const body = document.createElement('div');
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="font-size:13px;color:var(--text-secondary);display:block;margin-bottom:4px">Chantier associé</label>
          <select id="dpgf-chantier-sel" style="width:100%;padding:8px;background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border);border-radius:8px">
            <option value="">— Aucun chantier —</option>${opts}
          </select>
        </div>
        <div style="background:var(--bg-tertiary);border-radius:8px;padding:12px;font-size:13px">
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:6px">${lignesOk.length} prestation${lignesOk.length > 1 ? 's' : ''} — Récap :</div>
          ${[...new Set(lignesOk.map(l => l.lot))].map(lot => {
            const t = lignesOk.filter(l => l.lot === lot).reduce((s, l) => s + this._totalLigne(l), 0);
            return `<div style="display:flex;justify-content:space-between;color:var(--text-secondary)"><span>${lot}</span><span style="font-weight:700;color:var(--text-primary)">${this._fmtE(t)}</span></div>`;
          }).join('')}
          <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
            <span style="font-weight:700">Total HT</span>
            <span style="font-weight:900;color:var(--accent)">${this._fmtE(lignesOk.reduce((s, l) => s + this._totalLigne(l), 0))}</span>
          </div>
        </div>
      </div>`;

    const footer = `<button class="btn btn-primary" onclick="DPGF._confirmerGenererDevis()">📄 Créer le devis</button>`;
    App.openModal('📄 Générer devis PlaqPro+', body, footer);
  },

  _confirmerGenererDevis() {
    const chantierId = document.getElementById('dpgf-chantier-sel')?.value || '';
    const lignesOk   = this._lignes.filter(l => l.prix_unitaire > 0);

    const lignes = lignesOk.map(l => ({
      designation: l.designation,
      quantite:    l.quantite || 1,
      unite:       l.unite || 'u',
      prixUnitaire: this._puFinal(l),
      tva:         10,
    }));

    const totalHT = lignes.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0);

    const devis = {
      chantierId: chantierId || null,
      lignes,
      totalHT,
      totalTVA:  totalHT * 0.10,
      totalTTC:  totalHT * 1.10,
      statut:    'En attente',
      source:    'DPGF — ' + this._fileName,
      date:      new Date().toISOString(),
    };

    DB.addDevis(devis);
    App.closeModal();
    App.toast('Devis créé avec succès', 'success');
    setTimeout(() => App.navigate('devis'), 600);
  },

  // ── Utilitaires ───────────────────────────────────────────
  _showLoading(show, msg) {
    const el  = document.getElementById('dpgf-loading');
    const msg_el = document.getElementById('dpgf-loading-msg');
    if (el) el.style.display = show ? '' : 'none';
    if (msg_el && msg) msg_el.textContent = msg;
  },

  _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  _fmt(n) {
    const v = parseFloat(n);
    return isNaN(v) ? '—' : v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  },

  _fmtE(n) {
    const v = parseFloat(n);
    return isNaN(v) || v === 0 ? '—' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(v);
  },

  _lotColor(lot) {
    const MAP = {
      'Plâtrerie': '#4F8EF7', 'Cloisons': '#A78BFA', 'Plafonds': '#2DD4A0',
      'Peinture': '#F7A64F', 'Revêtements': '#F472B6', 'Isolation': '#34D399', 'Autre': '#6B7280',
    };
    return MAP[lot] || '#6B7280';
  },

  // ── Styles ────────────────────────────────────────────────
  _injectStyles() {
    if (document.getElementById('dpgf-styles')) return;
    const s = document.createElement('style');
    s.id = 'dpgf-styles';
    s.textContent = `
      .dpgf-th { padding:10px 12px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-tertiary); white-space:nowrap; }
      .dpgf-td { padding:9px 12px; vertical-align:middle; }
      #dpgf-tbody tr:hover { background:rgba(255,255,255,0.02); }
      .dpgf-input { background:var(--bg-tertiary); color:var(--text-primary); border:1px solid var(--border); border-radius:6px; padding:4px 6px; font-size:12px; outline:none; transition:border-color .2s; }
      .dpgf-input:focus { border-color:var(--accent); }
      .dpgf-action-btn { background:transparent; border:1px solid var(--border); border-radius:5px; padding:3px 6px; cursor:pointer; font-size:13px; transition:all .2s; color:var(--text-secondary); }
      .dpgf-action-btn:hover { border-color:var(--accent); background:rgba(79,142,247,0.1); }
      .dpgf-lot-btn { padding:5px 12px; border-radius:20px; border:1px solid var(--border); background:transparent; color:var(--text-secondary); font-size:12px; cursor:pointer; transition:all .2s; }
      .dpgf-lot-btn:hover, .dpgf-lot-btn.active { background:var(--accent); color:#fff; border-color:var(--accent); }
      .dpgf-lot-tag { padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; white-space:nowrap; }
      .dpgf-result-item { display:flex; align-items:center; gap:8px; padding:10px 14px; border:1px solid var(--border); border-radius:8px; background:transparent; cursor:pointer; text-align:left; color:var(--text-primary); transition:all .2s; width:100%; }
      .dpgf-result-item:hover { background:rgba(79,142,247,0.08); border-color:var(--accent); }
      .dpgf-spinner { width:36px; height:36px; border:3px solid rgba(79,142,247,0.2); border-top-color:var(--accent); border-radius:50%; animation:spin .8s linear infinite; margin:0 auto; }
      @keyframes spin { to { transform:rotate(360deg); } }
    `;
    document.head.appendChild(s);
  },
};
