/**
 * PlaqPro+ — Module Devis Intelligent
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits réservés
 */

Pages.devisIntelligent = function(params = {}) {
  const div = document.createElement('div');

  if (!document.getElementById('style-devis-int')) {
    const s = document.createElement('style');
    s.id = 'style-devis-int';
    s.textContent = `
      .di-hero { background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px; }
      .di-hero h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
      .di-hero p { font-size: 13px; color: var(--text-tertiary); }
      .di-steps { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
      .di-step { display: flex; align-items: center; gap: 6px; padding: 6px 14px;
        border-radius: 980px; font-size: 12px; font-weight: 600;
        background: var(--bg-secondary); border: 1px solid var(--border);
        color: var(--text-tertiary); }
      .di-step.active { background: var(--accent); color: #fff; border-color: var(--accent); }
      .di-step.done { background: rgba(16,185,129,0.1); color: #10b981; border-color: rgba(16,185,129,0.3); }
      .di-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 16px; }
      .di-panel-title { font-size: 14px; font-weight: 700; margin-bottom: 16px;
        color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
      .di-piece-card { background: var(--bg-primary); border: 1px solid var(--border);
        border-radius: var(--radius-md); margin-bottom: 12px; overflow: hidden; }
      .di-piece-header { padding: 12px 16px; display: flex; align-items: center;
        justify-content: space-between; background: rgba(79,142,247,0.06);
        border-bottom: 1px solid var(--border); }
      .di-piece-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
      .di-piece-meta { font-size: 11px; color: var(--text-tertiary); }
      .di-ligne { display: grid; grid-template-columns: 1fr 80px 100px 100px 32px;
        gap: 8px; padding: 8px 16px; align-items: center; border-bottom: 1px solid var(--border); }
      .di-ligne:last-child { border: none; }
      .di-ligne-header { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .06em; color: var(--text-tertiary); padding: 6px 16px;
        background: rgba(255,255,255,0.02); }
      .di-input-sm { padding: 4px 8px; background: var(--bg-secondary);
        border: 1px solid var(--border); border-radius: var(--radius-sm);
        color: var(--text-primary); font-size: 12px; width: 100%; text-align: right; }
      .di-input-sm:focus { outline: none; border-color: var(--accent); }
      .di-btn-add { display: flex; align-items: center; gap: 6px; padding: 8px 16px;
        background: none; border: 1px dashed var(--border); border-radius: var(--radius-sm);
        color: var(--accent); font-size: 12px; font-weight: 600; cursor: pointer;
        width: 100%; margin: 4px 0; transition: all .15s; }
      .di-btn-add:hover { background: rgba(79,142,247,0.06); border-color: var(--accent); }
      .di-totaux { background: rgba(79,142,247,0.06); border: 1px solid rgba(79,142,247,0.2);
        border-radius: var(--radius-lg); padding: 20px; }
      .di-total-row { display: flex; justify-content: space-between; align-items: center;
        padding: 6px 0; font-size: 13px; border-bottom: 1px solid var(--border); }
      .di-total-row:last-child { border: none; font-size: 16px; font-weight: 800;
        color: var(--accent); padding-top: 12px; }
      .di-empty { text-align: center; padding: 48px; color: var(--text-tertiary); }
      .di-ia-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px;
        background: linear-gradient(135deg, #7c3aed, #4F8EF7); color: #fff;
        border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 600;
        cursor: pointer; transition: opacity .15s; }
      .di-ia-btn:hover { opacity: .85; }
    `;
    document.head.appendChild(s);
  }

  // État du devis en cours
  let state = {
    chantierId: params.chantierId || null,
    chantier: null,
    client: null,
    pieces: [], // [{ nom, surfMurs, surfPlafond, lignes: [{desc, qte, pu, unite, total}] }]
    tva: 0.20,
    statut: 'Brouillon',
    numero: '',
    date: new Date().toISOString().split('T')[0],
  };

  function fmt(n) { return new Intl.NumberFormat('fr-FR', {minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0); }

  function calculerTotaux() {
    let totalHT = 0;
    state.pieces.forEach(p => {
      p.lignes.forEach(l => {
        l.total = (l.qte||0) * (l.pu||0);
        totalHT += l.total;
      });
    });
    const tva = totalHT * state.tva;
    return { totalHT, tva, totalTTC: totalHT + tva };
  }

  function getPrixProduit(desc) {
    const overrides = JSON.parse(localStorage.getItem('plaqpro_prix_overrides') || '{}');
    const prod = CATALOGUE?.find(p => p.nom.toLowerCase().includes(desc.toLowerCase()) ||
      p.tags?.some(t => desc.toLowerCase().includes(t)));
    if (!prod) return 0;
    return overrides[prod.ref]?.prix || prod.prix || 0;
  }

  function getChargesConfig() {
    const cfg = DB.getConfig();
    return { tarifH: cfg.tarifHoraire || 45, coeffMat: cfg.coeffMateriaux || 1.20 };
  }

  function genererLignesDepuisMetrages(chantier) {
    const metrages = DB.getMetragesByChantier(chantier.id);
    if (!metrages.length) return [];
    const ch = getChargesConfig();
    const isExt = chantier.typeChantier === 'exterieur';
    const pieces = [];

    metrages.forEach(m => {
      const lignes = [];
      if (isExt) {
        const surf = m.surfaceExt || (m.longueur * m.largeur) || 0;
        const lin  = m.lineaire || 0;
        if (surf > 0) {
          lignes.push({ desc: 'Main d\'œuvre', qte: Math.ceil(surf / 10), pu: ch.tarifH * 8, unite: 'j', total: 0 });
        }
        if (lin > 0) {
          lignes.push({ desc: 'Main d\'œuvre linéaire', qte: Math.ceil(lin / 20), pu: ch.tarifH * 8, unite: 'j', total: 0 });
        }
      } else {
        const c = Calculs.metrage(m.longueur, m.largeur, m.hauteur);
        const nbPlaques = Math.ceil(c.surfMurs / 2.7 * 2);
        const prixPlaque = getPrixProduit('BA13') * ch.coeffMat || 8.50 * ch.coeffMat;
        const nbRail = Math.ceil(c.perimetre * 2);
        const prixRail = getPrixProduit('Rail') * ch.coeffMat || 1.65 * ch.coeffMat;
        const nbMontant = Math.ceil(c.surfMurs / 0.6 * 2.8);
        const prixMontant = 2.45 * ch.coeffMat;
        const hMO = Math.ceil(c.surfMurs / 5);
        lignes.push({ desc: 'Plaques BA13 Standard', qte: nbPlaques, pu: parseFloat(prixPlaque.toFixed(2)), unite: 'u', total: 0 });
        lignes.push({ desc: 'Rails R48', qte: nbRail, pu: parseFloat(prixRail.toFixed(2)), unite: 'ml', total: 0 });
        lignes.push({ desc: 'Montants M48', qte: nbMontant, pu: parseFloat(prixMontant.toFixed(2)), unite: 'u', total: 0 });
        lignes.push({ desc: 'Vis TF 3.5×35 (boîte 1000)', qte: Math.ceil(nbPlaques * 0.015), pu: 8.50, unite: 'bte', total: 0 });
        lignes.push({ desc: 'Enduit de lissage 15kg', qte: Math.ceil(c.surfMurs / 15), pu: 14.50 * ch.coeffMat, unite: 'seau', total: 0 });
        lignes.push({ desc: 'Main d\'œuvre', qte: hMO, pu: ch.tarifH, unite: 'h', total: 0 });
      }
      const surfInfo = isExt
        ? (m.surfaceExt ? m.surfaceExt.toFixed(1) + 'm²' : (m.lineaire ? m.lineaire.toFixed(1) + 'ml' : ''))
        : (() => { const c = Calculs.metrage(m.longueur, m.largeur, m.hauteur); return c.surfMurs.toFixed(1) + 'm² murs'; })();
      pieces.push({ nom: m.piece, meta: surfInfo, lignes });
    });
    return pieces;
  }

  function render() {
    const t = calculerTotaux();
    div.innerHTML = `
      <div class="di-hero">
        <h1>📄 Nouveau Devis</h1>
        <p>Chantier → Métrés → Produits → PDF</p>
      </div>

      <!-- SÉLECTION CHANTIER -->
      <div class="di-panel">
        <div class="di-panel-title">🏗 Chantier & Client</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <label style="font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:6px">Chantier</label>
            <select class="form-control" id="di-chantier" onchange="DI.choisirChantier(this.value)">
              <option value="">— Sélectionner un chantier —</option>
              ${DB.chantiers.map(c => {
                const cl = DB.getClient(c.clientId);
                return '<option value="' + c.id + '" ' + (state.chantierId == c.id ? 'selected' : '') + '>' +
                  c.nom + (cl ? ' (' + cl.nom + ')' : '') + '</option>';
              }).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:6px">Date</label>
            <input type="date" class="form-control" id="di-date" value="${state.date}" onchange="DI.majDate(this.value)">
          </div>
        </div>
        ${state.chantier ? `
          <div style="margin-top:12px;padding:12px;background:rgba(79,142,247,0.06);border-radius:var(--radius-md);font-size:13px;display:flex;gap:20px;flex-wrap:wrap">
            <span>🏗 <strong>${state.chantier.nom}</strong></span>
            <span>👤 <strong>${state.client?.nom || '—'}</strong></span>
            <span>📍 ${state.chantier.adresse || '—'}</span>
            <span>🏠 ${state.chantier.typeChantier === 'exterieur' ? '🌿 Extérieur' : '🏠 Intérieur'}</span>
          </div>
        ` : ''}
      </div>

      <!-- LIGNES DEVIS PAR PIÈCE -->
      ${state.pieces.length === 0 ? `
        <div class="di-panel">
          <div class="di-empty">
            <div style="font-size:48px;margin-bottom:16px">📐</div>
            <div style="font-size:15px;font-weight:700;margin-bottom:8px">
              ${state.chantierId ? 'Aucun métré saisi pour ce chantier' : 'Sélectionnez un chantier pour commencer'}
            </div>
            ${state.chantierId ? `
              <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">
                <button class="btn btn-secondary" onclick="App.navigate('metrages', {chantierId:${state.chantierId}})">
                  📐 Saisir les métrés
                </button>
                <button class="di-ia-btn" onclick="DI.genererAvecIA()">
                  🤖 Générer avec l'IA
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      ` : `
        <div class="di-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
            <div class="di-panel-title" style="margin:0">📋 Lignes du devis</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="di-ia-btn" onclick="DI.genererAvecIA()">🤖 Enrichir avec l'IA</button>
              <button class="btn btn-secondary" onclick="DI.ajouterPiece()">+ Ajouter une pièce</button>
            </div>
          </div>

          ${state.pieces.map((piece, pi) => `
            <div class="di-piece-card">
              <div class="di-piece-header">
                <div>
                  <span class="di-piece-title">${piece.nom}</span>
                  ${piece.meta ? `<span class="di-piece-meta"> — ${piece.meta}</span>` : ''}
                </div>
                <div style="display:flex;gap:6px">
                  <button onclick="DI.ajouterLigne(${pi})" class="btn btn-secondary btn-sm">+ Produit</button>
                  <button onclick="DI.supprimerPiece(${pi})" class="btn btn-danger btn-sm">✕</button>
                </div>
              </div>
              <div class="di-ligne-header" style="display:grid;grid-template-columns:1fr 80px 100px 100px 32px;gap:8px">
                <span>Désignation</span><span style="text-align:right">Qté</span>
                <span style="text-align:right">P.U. HT</span><span style="text-align:right">Total HT</span><span></span>
              </div>
              ${piece.lignes.map((l, li) => `
                <div class="di-ligne">
                  <input class="di-input-sm" style="text-align:left" value="${l.desc}"
                    onchange="DI.majLigne(${pi},${li},'desc',this.value)" placeholder="Désignation...">
                  <div style="display:flex;align-items:center;gap:3px">
                    <input type="number" class="di-input-sm" value="${l.qte}" min="0" step="0.01"
                      onchange="DI.majLigne(${pi},${li},'qte',parseFloat(this.value)||0)">
                    <span style="font-size:10px;color:var(--text-tertiary)">${l.unite||'u'}</span>
                  </div>
                  <input type="number" class="di-input-sm" value="${l.pu}" min="0" step="0.01"
                    onchange="DI.majLigne(${pi},${li},'pu',parseFloat(this.value)||0)">
                  <div style="text-align:right;font-size:13px;font-weight:600;color:var(--text-primary)">
                    ${fmt((l.qte||0)*(l.pu||0))} €
                  </div>
                  <button onclick="DI.supprimerLigne(${pi},${li})"
                    style="background:none;border:none;color:var(--text-tertiary);cursor:pointer;font-size:16px;padding:0">✕</button>
                </div>
              `).join('')}
              <button class="di-btn-add" onclick="DI.ajouterLigne(${pi})">
                ＋ Ajouter un produit / prestation
              </button>
            </div>
          `).join('')}
        </div>
      `}

      <!-- TVA + TOTAUX -->
      ${state.pieces.length > 0 ? `
        <div class="di-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div class="di-panel-title" style="margin:0">💰 Totaux</div>
            <div style="display:flex;align-items:center;gap:8px;font-size:13px">
              <span style="color:var(--text-tertiary)">TVA</span>
              <select class="form-control" style="width:100px" onchange="DI.majTVA(parseFloat(this.value))">
                <option value="0.20" ${state.tva===0.20?'selected':''}>20%</option>
                <option value="0.10" ${state.tva===0.10?'selected':''}>10%</option>
                <option value="0.055" ${state.tva===0.055?'selected':''}>5.5%</option>
                <option value="0" ${state.tva===0?'selected':''}>0%</option>
              </select>
            </div>
          </div>
          <div class="di-totaux">
            <div class="di-total-row"><span>Total HT</span><span>${fmt(t.totalHT)} €</span></div>
            <div class="di-total-row"><span>TVA ${Math.round(state.tva*100)}%</span><span>${fmt(t.tva)} €</span></div>
            <div class="di-total-row"><span>TOTAL TTC</span><span>${fmt(t.totalTTC)} €</span></div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px">
          <button class="btn btn-primary" onclick="DI.sauvegarder()" style="font-size:14px;padding:12px 24px">
            💾 Enregistrer le devis
          </button>
          <button class="btn btn-secondary" onclick="DI.imprimerPDF()">
            🖨 Aperçu / Imprimer
          </button>
          <button class="btn btn-secondary" onclick="DI.ajouterPiece()">
            + Pièce
          </button>
        </div>
      ` : ''}
    `;
  }

  window.DI = {
    choisirChantier(id) {
      if (!id) { state.chantierId = null; state.chantier = null; state.client = null; state.pieces = []; render(); return; }
      state.chantierId = parseInt(id);
      state.chantier = DB.getChantier(state.chantierId);
      state.client = state.chantier ? DB.getClient(state.chantier.clientId) : null;
      const metrages = DB.getMetragesByChantier(state.chantierId);
      if (metrages.length) {
        state.pieces = genererLignesDepuisMetrages(state.chantier);
        App.toast('✅ ' + state.pieces.length + ' pièces chargées depuis les métrés', 'success');
      } else {
        state.pieces = [];
      }
      const config = DB.getConfig();
      state.numero = (config.prefixeDevis || 'DEV-') + String(Date.now()).slice(-4);
      render();
    },
    majDate(v) { state.date = v; },
    majTVA(v) { state.tva = v; render(); },
    majLigne(pi, li, field, val) {
      state.pieces[pi].lignes[li][field] = val;
      render();
    },
    supprimerLigne(pi, li) {
      state.pieces[pi].lignes.splice(li, 1);
      render();
    },
    ajouterLigne(pi) {
      const ch = getChargesConfig();
      App.openModal('➕ Ajouter un produit', (() => {
        const d = document.createElement('div');
        d.innerHTML = `
          <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
            <div>
              <label style="font-size:12px;color:var(--text-tertiary)">Désignation *</label>
              <input class="form-control" id="di-add-desc" placeholder="Ex: Peinture acrylique mat 10L" style="margin-top:4px">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
              <div>
                <label style="font-size:12px;color:var(--text-tertiary)">Quantité</label>
                <input type="number" class="form-control" id="di-add-qte" value="1" min="0" step="0.01" style="margin-top:4px">
              </div>
              <div>
                <label style="font-size:12px;color:var(--text-tertiary)">P.U. HT (€)</label>
                <input type="number" class="form-control" id="di-add-pu" value="0" min="0" step="0.01" style="margin-top:4px">
              </div>
              <div>
                <label style="font-size:12px;color:var(--text-tertiary)">Unité</label>
                <select class="form-control" id="di-add-unite" style="margin-top:4px">
                  <option>u</option><option>h</option><option>j</option>
                  <option>m²</option><option>ml</option><option>m³</option>
                  <option>sac</option><option>seau</option><option>roul</option><option>bte</option>
                </select>
              </div>
            </div>
            <div style="background:rgba(79,142,247,0.06);border-radius:var(--radius-sm);padding:10px;font-size:12px;color:var(--text-tertiary)">
              💡 Ou choisir depuis la base produits :
              <select class="form-control" id="di-add-prod" style="margin-top:6px" onchange="DI._remplirDepuisProduit(this.value)">
                <option value="">— Choisir un produit —</option>
                ${(typeof CATALOGUE !== 'undefined' ? CATALOGUE : []).map(p =>
                  '<option value="' + p.ref + '">' + p.nom + ' (' + p.prix + '€/' + p.unite + ')</option>'
                ).join('')}
              </select>
            </div>
          </div>
        `;
        return d;
      })(),
        '<button class="btn btn-primary" onclick="DI._confirmerAjoutLigne(' + pi + ')">Ajouter</button>' +
        '<button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>'
      );
    },
    _remplirDepuisProduit(ref) {
      if (!ref) return;
      const overrides = JSON.parse(localStorage.getItem('plaqpro_prix_overrides') || '{}');
      const prod = (typeof CATALOGUE !== 'undefined' ? CATALOGUE : []).find(p => p.ref === ref);
      if (!prod) return;
      const prix = overrides[ref]?.prix || prod.prix;
      const ch = getChargesConfig();
      document.getElementById('di-add-desc').value = prod.nom;
      document.getElementById('di-add-pu').value = (prix * ch.coeffMat).toFixed(2);
      document.getElementById('di-add-unite').value = prod.unite;
    },
    _confirmerAjoutLigne(pi) {
      const desc = document.getElementById('di-add-desc')?.value.trim();
      const qte  = parseFloat(document.getElementById('di-add-qte')?.value) || 1;
      const pu   = parseFloat(document.getElementById('di-add-pu')?.value) || 0;
      const unite = document.getElementById('di-add-unite')?.value || 'u';
      if (!desc) { App.toast('Désignation obligatoire', 'error'); return; }
      state.pieces[pi].lignes.push({ desc, qte, pu, unite, total: qte*pu });
      App.closeModal();
      render();
      App.toast('Produit ajouté ✅', 'success');
    },
    ajouterPiece() {
      App.openModal('➕ Ajouter une pièce / zone', (() => {
        const d = document.createElement('div');
        d.innerHTML = `
          <div style="padding:16px">
            <label style="font-size:12px;color:var(--text-tertiary)">Nom de la pièce *</label>
            <input class="form-control" id="di-new-piece" placeholder="Salon, Cuisine, Terrasse..." style="margin-top:4px">
          </div>
        `;
        return d;
      })(),
        '<button class="btn btn-primary" onclick="DI._confirmerAjoutPiece()">Ajouter</button>' +
        '<button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>'
      );
    },
    _confirmerAjoutPiece() {
      const nom = document.getElementById('di-new-piece')?.value.trim();
      if (!nom) { App.toast('Nom obligatoire', 'error'); return; }
      state.pieces.push({ nom, meta: '', lignes: [] });
      App.closeModal();
      render();
    },
    supprimerPiece(pi) {
      App.modalConfirm({ message: 'Supprimer cette pièce et ses lignes ?', onConfirm: () => {
        state.pieces.splice(pi, 1);
        render();
      }});
    },
    async genererAvecIA() {
      const groqKey = localStorage.getItem('plaqpro_groq_key') || localStorage.getItem('groq_api_key') || '';
      if (!groqKey?.startsWith('gsk_')) { App.toast('Clé IA manquante — configurez-la dans Mon Compte', 'error'); return; }
      if (!state.chantier) { App.toast('Sélectionnez un chantier', 'error'); return; }
      App.toast('🤖 Génération IA en cours...', 'success');
      const metrages = DB.getMetragesByChantier(state.chantierId);
      const ch = getChargesConfig();
      const prompt = `Tu es un expert en BTP France 2026.
Génère des lignes de devis pour ce chantier :
Chantier : ${state.chantier.nom}
Type : ${state.chantier.typeChantier || 'interieur'}
Métrés : ${JSON.stringify(metrages.map(m => ({ piece: m.piece, L: m.longueur, l: m.largeur, H: m.hauteur, surfExt: m.surfaceExt, lin: m.lineaire })))}
Tarif horaire : ${ch.tarifH}€/h
Coefficient matériaux : ${ch.coeffMat}

Réponds UNIQUEMENT en JSON valide sans backticks :
{"pieces":[{"nom":"NomPièce","lignes":[{"desc":"Désignation produit","qte":X,"pu":X.XX,"unite":"u/h/m²/ml"}]}]}
Sois précis et réaliste. Inclus matériaux ET main d'œuvre. Max 6 lignes par pièce.`;

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + groqKey },
          body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 2000 })
        });
        const data = await res.json();
        const txt = data.choices?.[0]?.message?.content || '';
        const clean = txt.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (parsed.pieces?.length) {
          state.pieces = parsed.pieces.map(p => ({
            ...p,
            meta: 'IA',
            lignes: p.lignes.map(l => ({ ...l, total: (l.qte||0)*(l.pu||0) }))
          }));
          render();
          App.toast('✅ ' + state.pieces.length + ' pièces générées par l\'IA !', 'success');
        }
      } catch(e) {
        App.toast('Erreur IA : ' + e.message, 'error');
      }
    },
    sauvegarder() {
      if (!state.chantierId) { App.toast('Sélectionnez un chantier', 'error'); return; }
      if (!state.pieces.length) { App.toast('Ajoutez au moins une pièce', 'error'); return; }
      const t = calculerTotaux();
      const devis = {
        chantierId: state.chantierId,
        numero: state.numero,
        date: state.date,
        statut: state.statut,
        pieces: state.pieces,
        lignes: state.pieces.flatMap(p => p.lignes.map(l => ({ ...l, piece: p.nom }))),
        totalHT: t.totalHT,
        montantTVA: t.tva,
        totalTTC: t.totalTTC,
        tva: state.tva,
        totaux: t,
      };
      DB.addDevis(devis);
      App.toast('✅ Devis ' + state.numero + ' enregistré !', 'success');
      App.navigate('devis');
    },
    imprimerPDF() {
      if (!state.pieces.length) { App.toast('Aucune ligne à imprimer', 'error'); return; }
      window.print();
    },
  };

  render();
  if (params.chantierId) setTimeout(() => DI.choisirChantier(params.chantierId), 50);
  return div;
};
