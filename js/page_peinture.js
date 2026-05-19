// ============================================================
//  PLAQPRO WEB — Page Peinture (saisie détaillée par chantier)
//  page_peinture.js
// ============================================================

Pages.peinture = function(params) {
  params = params || {};
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="flex justify-between items-center mb-16" style="flex-wrap:wrap;gap:12px">
      <select class="form-control" id="sel-ch-peinture" style="width:300px"
        onchange="PagePeinture.charger(this.value)">
        <option value="">— Sélectionner un chantier —</option>
        ${DB.chantiers.map(c => {
          const cl = DB.getClient(c.clientId);
          return '<option value="' + c.id + '"' + (params.chantierId == c.id ? ' selected':'') + '>'
            + c.nom + (cl ? ' · ' + cl.nom : '') + '</option>';
        }).join('')}
      </select>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" onclick="App.navigate('metrages',{chantierId:parseInt(document.getElementById('sel-ch-peinture').value)||0})">📐 Voir métrés</button>
        <button class="btn btn-primary" onclick="PagePeinture.modalAjouter()">+ Nouvelle zone</button>
      </div>
    </div>

    <div id="peinture-resume" style="display:none" class="mb-16"></div>
    <div id="peinture-list"></div>
    <div id="peinture-totaux" style="display:none" class="mt-16"></div>
  `;

  if (params.chantierId) setTimeout(() => PagePeinture.charger(params.chantierId), 60);
  return div;
};

const PagePeinture = {

  _chantierId: null,

  fmt(n,d) { return new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d||2,maximumFractionDigits:d||2}).format(n||0); },

  charger(id) {
    this._chantierId = parseInt(id);
    if (!id) return;
    const peintures = DB.getPeinturesByChantier(this._chantierId);
    const metrages  = DB.getMetragesByChantier(this._chantierId);

    // Résumé depuis métrés
    const resume = document.getElementById('peinture-resume');
    if (resume && metrages.length) {
      const totalMurs = metrages.reduce((s,m) => s + 2*(m.longueur+m.largeur)*m.hauteur, 0);
      const totalPlaf = metrages.reduce((s,m) => s + m.longueur*m.largeur, 0);
      resume.style.display = 'block';
      resume.innerHTML = `
        <div class="card">
          <div class="card-header">
            <span class="card-title">📐 Surfaces depuis les métrés</span>
            <button class="btn btn-warning btn-sm" onclick="PagePeinture.genererDepuisMetrages()">⚡ Générer auto depuis métrés</button>
          </div>
          <div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
            <div class="stat-card" style="flex:1;min-width:140px;padding:12px 16px">
              <div class="stat-label">Surface murs</div>
              <div class="stat-value" style="font-size:20px">${this.fmt(totalMurs,1)} m²</div>
            </div>
            <div class="stat-card" style="flex:1;min-width:140px;padding:12px 16px">
              <div class="stat-label">Surface plafond</div>
              <div class="stat-value" style="font-size:20px">${this.fmt(totalPlaf,1)} m²</div>
            </div>
            <div class="stat-card" style="flex:1;min-width:140px;padding:12px 16px">
              <div class="stat-label">Total à peindre</div>
              <div class="stat-value" style="font-size:20px">${this.fmt(totalMurs+totalPlaf,1)} m²</div>
            </div>
          </div>
        </div>`;
    }

    const list = document.getElementById('peinture-list');
    if (!list) return;

    if (!peintures.length) {
      list.innerHTML = `<div class="card"><div class="empty-state">
        <div class="empty-state-icon">🎨</div>
        <div class="empty-state-title">Aucune zone de peinture saisie</div>
        <div class="empty-state-text">Ajoutez les zones à peindre ou générez automatiquement depuis les métrés</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-warning" onclick="PagePeinture.genererDepuisMetrages()">⚡ Générer depuis métrés</button>
          <button class="btn btn-primary" onclick="PagePeinture.modalAjouter()">+ Saisie manuelle</button>
        </div>
      </div></div>`;
      document.getElementById('peinture-totaux').style.display = 'none';
      return;
    }

    let totLitresMurs=0, totLitresPlaf=0, totLitresAppret=0, totMat=0, totMO=0;

    list.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">🎨 Zones de peinture — ${peintures.length} zone(s)</span>
          <button class="btn btn-primary btn-sm" onclick="PagePeinture.modalAjouter()">+ Ajouter</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Zone</th><th>Produit</th><th>Surf. murs</th><th>Surf. plafond</th>
              <th>Couches</th><th>Litres murs</th><th>Litres plaf.</th><th>Apprêt</th>
              <th style="text-align:right">Coût mat.</th>
              <th style="text-align:right">Coût MO</th>
              <th></th>
            </tr></thead>
            <tbody>
              ${peintures.map(p => {
                const calc = this.calculer(p);
                totLitresMurs  += calc.litresMurs;
                totLitresPlaf  += calc.litresPlaf;
                totLitresAppret += calc.litresAppret;
                totMat += calc.coutMat;
                totMO  += calc.coutMO;
                return `<tr>
                  <td><strong>${p.zone || 'Zone'}</strong></td>
                  <td>
                    <span class="badge badge-blue" style="font-size:11px">${p.refProduit || 'DULUX_BM15'}</span>
                    ${p.refProduitPlaf && p.refProduitPlaf !== p.refProduit ?
                      '<br><span class="badge badge-gray" style="font-size:10px">Plaf: '+p.refProduitPlaf+'</span>' : ''}
                  </td>
                  <td class="font-mono">${this.fmt(p.surfMurs||0,1)} m²</td>
                  <td class="font-mono">${this.fmt(p.surfPlafond||0,1)} m²</td>
                  <td style="text-align:center">${p.nbCouches||2}</td>
                  <td class="font-mono">${this.fmt(calc.litresMurs,1)} L</td>
                  <td class="font-mono">${this.fmt(calc.litresPlaf,1)} L</td>
                  <td class="font-mono">${calc.litresAppret > 0 ? this.fmt(calc.litresAppret,1)+' L' : '—'}</td>
                  <td style="text-align:right;font-weight:600">${this.fmt(calc.coutMat)} €</td>
                  <td style="text-align:right;color:var(--green)">${this.fmt(calc.coutMO)} €</td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="PagePeinture.modalEditer(${p.id})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="PagePeinture.supprimer(${p.id})">✕</button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="background:var(--glass-bg-md)">
                <td colspan="5"><strong>TOTAUX</strong></td>
                <td class="font-mono"><strong>${this.fmt(totLitresMurs,1)} L</strong></td>
                <td class="font-mono"><strong>${this.fmt(totLitresPlaf,1)} L</strong></td>
                <td class="font-mono"><strong>${totLitresAppret > 0 ? this.fmt(totLitresAppret,1)+' L' : '—'}</strong></td>
                <td style="text-align:right"><strong>${this.fmt(totMat)} €</strong></td>
                <td style="text-align:right;color:var(--green)"><strong>${this.fmt(totMO)} €</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`;

    // Totaux
    const totDiv = document.getElementById('peinture-totaux');
    totDiv.style.display = 'block';
    const r  = DB.getRatios();
    const mMat = r.MARGE_MATERIAUX||0.30;
    const mMO  = r.MARGE_MO||0.20;
    const tva  = r.TVA_TRAVAUX||0.10;
    const ht   = totMat*(1+mMat) + totMO*(1+mMO);
    totDiv.innerHTML = `
      <div class="card" style="border-color:rgba(247,91,91,.2)">
        <div class="card-body">
          <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:space-between;align-items:center">
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <div style="text-align:center;padding:10px 16px;background:var(--glass-bg);border-radius:var(--r-lg);border:1px solid var(--glass-border)">
                <div class="stat-label">Total litres murs</div>
                <div class="stat-value" style="font-size:16px">${this.fmt(totLitresMurs,1)} L</div>
              </div>
              <div style="text-align:center;padding:10px 16px;background:var(--glass-bg);border-radius:var(--r-lg);border:1px solid var(--glass-border)">
                <div class="stat-label">Total litres plafond</div>
                <div class="stat-value" style="font-size:16px">${this.fmt(totLitresPlaf,1)} L</div>
              </div>
              ${totLitresAppret > 0 ? `<div style="text-align:center;padding:10px 16px;background:var(--glass-bg);border-radius:var(--r-lg);border:1px solid var(--glass-border)">
                <div class="stat-label">Apprêt</div>
                <div class="stat-value" style="font-size:16px">${this.fmt(totLitresAppret,1)} L</div>
              </div>` : ''}
              <div style="text-align:center;padding:10px 16px;background:var(--glass-bg);border-radius:var(--r-lg);border:1px solid var(--glass-border)">
                <div class="stat-label">Mat. HT</div>
                <div class="stat-value" style="font-size:16px">${this.fmt(totMat)} €</div>
              </div>
            </div>
            <div class="total-row" style="margin:0">
              <span class="total-label">TOTAL TTC</span>
              <span class="total-value">${this.fmt(ht*(1+tva))} €</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
            <button class="btn btn-secondary" onclick="App.navigate('liste_achat',{chantierId:${this._chantierId}})">🛒 Liste d'achat</button>
            <button class="btn btn-primary" onclick="App.navigate('devis',{chantierId:${this._chantierId},generer:true})">📄 Générer devis</button>
          </div>
        </div>
      </div>`;
  },

  calculer(p) {
    const r = DB.getRatios();
    const rendMurs = p.rendement || 10;
    const rendPlaf = 13;
    const litresMurs  = p.surfMurs   > 0 ? (p.surfMurs   * (p.nbCouches||2)) / rendMurs : 0;
    const litresPlaf  = p.surfPlafond > 0 ? (p.surfPlafond * (p.nbCouches||2)) / rendPlaf : 0;
    const litresAppret = p.avecAppret ? (p.surfMurs + p.surfPlafond) / (rendMurs * 1.2) : 0;
    const pMurs   = DB.getPrixByRef(p.refProduit  || 'DULUX_BM15') || 2.80;
    const pPlaf   = DB.getPrixByRef(p.refProduitPlaf || 'PLC_BMAT') || 2.20;
    const pAppret = DB.getPrixByRef('APPR_GYP') || 3.20;
    const coutMat = litresMurs*pMurs + litresPlaf*pPlaf + litresAppret*pAppret;
    const hMO = (p.surfMurs + p.surfPlafond) * (r.HEURES_PEINTURE_PAR_M2||0.18) * (p.nbCouches||2);
    const coutMO = hMO * (r.TAUX_HORAIRE_MO||35);
    return { litresMurs, litresPlaf, litresAppret, coutMat, coutMO };
  },

  genererDepuisMetrages() {
    if (!this._chantierId) { App.toast('Sélectionnez un chantier','error'); return; }
    const metrages = DB.getMetragesByChantier(this._chantierId);
    if (!metrages.length) { App.toast('Aucun métré saisi','error'); return; }

    // Supprimer les zones auto existantes
    const existing = DB.getPeinturesByChantier(this._chantierId).filter(p => p.auto);
    existing.forEach(p => DB.delete(DB.KEYS.peintures, p.id));

    // Créer une zone par pièce
    metrages.forEach(m => {
      const perim   = 2 * (m.longueur + m.largeur);
      const surfMurs = perim * m.hauteur;
      const surfPlaf = m.longueur * m.largeur;
      DB.add(DB.KEYS.peintures, {
        chantierId:    this._chantierId,
        zone:          m.piece,
        refProduit:    'DULUX_BM15',
        refProduitPlaf:'PLC_BMAT',
        surfMurs,
        surfPlafond:   surfPlaf,
        nbCouches:     2,
        rendement:     10,
        avecAppret:    true,
        auto:          true,
      });
    });

    App.toast(metrages.length + ' zones générées depuis les métrés !');
    this.charger(this._chantierId);
  },

  modalAjouter(existant) {
    const d = document.createElement('div');
    const e = existant || {};
    const prodPeintures = DB.produits.filter(p => p.categorie === 'Peinture' || p.categorie === 'Preparat.');

    d.innerHTML = `
      <div class="form-row mb-12">
        <div class="form-group">
          <label class="form-label">Zone / pièce</label>
          <input class="form-control" id="pe-zone" value="${e.zone||''}" placeholder="Ex: Séjour, Couloir...">
        </div>
        <div class="form-group">
          <label class="form-label">Chantier</label>
          <select class="form-control" id="pe-ch">
            ${DB.chantiers.map(c => '<option value="'+c.id+'"'+(c.id===this._chantierId?' selected':'')+'>'+c.nom+'</option>').join('')}
          </select>
        </div>
      </div>
      <div class="form-row mb-12">
        <div class="form-group">
          <label class="form-label">Produit murs</label>
          <select class="form-control" id="pe-produit" onchange="PagePeinture.previewCalc()">
            ${prodPeintures.map(p => '<option value="'+p.reference+'"'+(p.reference===(e.refProduit||'DULUX_BM15')?' selected':'')+'>'+p.reference+' — '+p.designation.substring(0,35)+'</option>').join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Produit plafond</label>
          <select class="form-control" id="pe-produit-plaf" onchange="PagePeinture.previewCalc()">
            ${prodPeintures.map(p => '<option value="'+p.reference+'"'+(p.reference===(e.refProduitPlaf||'PLC_BMAT')?' selected':'')+'>'+p.reference+' — '+p.designation.substring(0,35)+'</option>').join('')}
          </select>
        </div>
      </div>
      <div class="form-row mb-12">
        <div class="form-group">
          <label class="form-label">Surface murs (m²)</label>
          <input type="number" class="form-control" id="pe-murs" value="${e.surfMurs||''}" step="0.5" oninput="PagePeinture.previewCalc()">
        </div>
        <div class="form-group">
          <label class="form-label">Surface plafond (m²)</label>
          <input type="number" class="form-control" id="pe-plaf" value="${e.surfPlafond||''}" step="0.5" oninput="PagePeinture.previewCalc()">
        </div>
      </div>
      <div class="form-row mb-12">
        <div class="form-group">
          <label class="form-label">Nombre de couches</label>
          <select class="form-control" id="pe-couches" onchange="PagePeinture.previewCalc()">
            <option value="1" ${e.nbCouches===1?'selected':''}>1 couche</option>
            <option value="2" ${!e.nbCouches||e.nbCouches===2?'selected':''}>2 couches</option>
            <option value="3" ${e.nbCouches===3?'selected':''}>3 couches</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Rendement (m²/L)</label>
          <input type="number" class="form-control" id="pe-rend" value="${e.rendement||10}" step="0.5" oninput="PagePeinture.previewCalc()">
        </div>
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
          <input type="checkbox" id="pe-appret" ${e.avecAppret!==false?'checked':''} onchange="PagePeinture.previewCalc()" style="accent-color:var(--accent);width:15px;height:15px">
          Inclure apprêt Gyproc
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
          <input type="checkbox" id="pe-bois" ${e.avecBoiseries?'checked':''} onchange="PagePeinture.previewCalc()" style="accent-color:var(--accent);width:15px;height:15px">
          Boiseries (+15%)
        </label>
      </div>
      <div id="pe-preview" style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-md);padding:12px 14px;font-size:12px;display:none">
        <div style="font-weight:600;color:var(--text-secondary);margin-bottom:8px">Estimation :</div>
        <div id="pe-preview-content"></div>
      </div>
    `;

    App.openModal(existant ? 'Modifier la zone' : 'Nouvelle zone de peinture', d, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="PagePeinture.sauvegarder(${e.id||''})">
        ${existant ? 'Enregistrer' : 'Ajouter'}
      </button>
    `);

    setTimeout(() => PagePeinture.previewCalc(), 100);
  },

  previewCalc() {
    const surfMurs = parseFloat(document.getElementById('pe-murs')?.value)||0;
    const surfPlaf = parseFloat(document.getElementById('pe-plaf')?.value)||0;
    if (!surfMurs && !surfPlaf) return;

    const p = {
      surfMurs, surfPlafond: surfPlaf,
      nbCouches:    parseInt(document.getElementById('pe-couches')?.value)||2,
      rendement:    parseFloat(document.getElementById('pe-rend')?.value)||10,
      avecAppret:   document.getElementById('pe-appret')?.checked,
      refProduit:   document.getElementById('pe-produit')?.value||'DULUX_BM15',
      refProduitPlaf: document.getElementById('pe-produit-plaf')?.value||'PLC_BMAT',
    };

    const calc = this.calculer(p);
    const prev = document.getElementById('pe-preview');
    const cont = document.getElementById('pe-preview-content');
    if (!prev||!cont) return;
    prev.style.display = 'block';
    cont.innerHTML = `
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        ${calc.litresMurs > 0 ? '<span>Murs : <strong>'+this.fmt(calc.litresMurs,1)+' L</strong></span>' : ''}
        ${calc.litresPlaf > 0 ? '<span>Plafond : <strong>'+this.fmt(calc.litresPlaf,1)+' L</strong></span>' : ''}
        ${calc.litresAppret > 0 ? '<span>Apprêt : <strong>'+this.fmt(calc.litresAppret,1)+' L</strong></span>' : ''}
        <span style="color:var(--accent)">Mat. : <strong>${this.fmt(calc.coutMat)} €</strong></span>
        <span style="color:var(--green)">MO : <strong>${this.fmt(calc.coutMO)} €</strong></span>
      </div>`;
  },

  sauvegarder(id) {
    const chId = parseInt(document.getElementById('pe-ch')?.value);
    const murs = parseFloat(document.getElementById('pe-murs')?.value)||0;
    const plaf = parseFloat(document.getElementById('pe-plaf')?.value)||0;
    if (!chId || (!murs && !plaf)) { App.toast('Chantier et surfaces obligatoires','error'); return; }

    const data = {
      chantierId:     chId,
      zone:           document.getElementById('pe-zone')?.value||'Zone',
      refProduit:     document.getElementById('pe-produit')?.value||'DULUX_BM15',
      refProduitPlaf: document.getElementById('pe-produit-plaf')?.value||'PLC_BMAT',
      surfMurs:       murs,
      surfPlafond:    plaf,
      nbCouches:      parseInt(document.getElementById('pe-couches')?.value)||2,
      rendement:      parseFloat(document.getElementById('pe-rend')?.value)||10,
      avecAppret:     document.getElementById('pe-appret')?.checked||false,
      avecBoiseries:  document.getElementById('pe-bois')?.checked||false,
    };

    if (id) DB.update(DB.KEYS.peintures, id, data);
    else DB.add(DB.KEYS.peintures, data);

    App.closeModal();
    App.toast(id ? 'Zone modifiée !' : 'Zone ajoutée !');
    this.charger(chId);
  },

  modalEditer(id) {
    const p = DB.getById(DB.KEYS.peintures, id);
    if (p) this.modalAjouter(p);
  },

  supprimer(id) {
    if (!confirm('Supprimer cette zone ?')) return;
    DB.delete(DB.KEYS.peintures, id);
    App.toast('Zone supprimée');
    this.charger(this._chantierId);
  },
};
