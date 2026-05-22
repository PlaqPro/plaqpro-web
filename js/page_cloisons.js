/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Page Cloisons (saisie détaillée par chantier)
//  page_cloison.js
// ============================================================

Pages.cloisons = function(params) {
  params = params || {};
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="flex justify-between items-center mb-16" style="flex-wrap:wrap;gap:12px">
      <select class="form-control" id="sel-ch-cloison" style="width:300px"
        onchange="PageCloison.charger(this.value)">
        <option value="">— Sélectionner un chantier —</option>
        ${DB.chantiers.map(c => {
          const cl = DB.getClient(c.clientId);
          return '<option value="' + c.id + '"' + (params.chantierId == c.id ? ' selected':'') + '>'
            + c.nom + (cl ? ' · ' + cl.nom : '') + '</option>';
        }).join('')}
      </select>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" onclick="App.navigate('metrages',{chantierId:parseInt(document.getElementById('sel-ch-cloison').value)||0})">📐 Voir métrés</button>
        <button class="btn btn-primary"   onclick="PageCloison.modalAjouter()">+ Nouvelle cloison</button>
      </div>
    </div>

    <!-- Résumé chantier -->
    <div id="cloison-resume" style="display:none" class="mb-16"></div>

    <!-- Liste des cloisons -->
    <div id="cloison-list"></div>

    <!-- Totaux -->
    <div id="cloison-totaux" style="display:none" class="mt-16"></div>
  `;

  if (params.chantierId) setTimeout(() => PageCloison.charger(params.chantierId), 60);

  return div;
};

const PageCloison = {

  _chantierId: null,

  fmt(n,d)  { return new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d||2,maximumFractionDigits:d||2}).format(n||0); },

  charger(id) {
    this._chantierId = parseInt(id);
    if (!id) return;
    const cloisons = DB.getCloisionsByChantier(this._chantierId);
    const chantier = DB.getChantier(this._chantierId);
    const metrages = DB.getMetragesByChantier(this._chantierId);

    // Résumé métrés
    const resume = document.getElementById('cloison-resume');
    if (resume && metrages.length) {
      const totalMurs = metrages.reduce((s,m) => s + 2*(m.longueur+m.largeur)*m.hauteur, 0);
      resume.style.display = 'block';
      resume.innerHTML = `
        <div class="card">
          <div class="card-body" style="display:flex;gap:20px;flex-wrap:wrap">
            <div class="stat-card" style="flex:1;min-width:140px;padding:12px 16px">
              <div class="stat-label">Pièces saisies</div>
              <div class="stat-value" style="font-size:22px">${metrages.length}</div>
            </div>
            <div class="stat-card" style="flex:1;min-width:140px;padding:12px 16px">
              <div class="stat-label">Surface murs totale</div>
              <div class="stat-value" style="font-size:22px">${this.fmt(totalMurs,1)} m²</div>
            </div>
            <div class="stat-card" style="flex:1;min-width:140px;padding:12px 16px">
              <div class="stat-label">Cloisons saisies</div>
              <div class="stat-value" style="font-size:22px">${cloisons.length}</div>
            </div>
            <div style="display:flex;align-items:center">
              <button class="btn btn-ghost btn-sm" onclick="App.navigate('metrages',{chantierId:${this._chantierId}})">
                Modifier les métrés →
              </button>
            </div>
          </div>
        </div>`;
    }

    const list = document.getElementById('cloison-list');
    if (!list) return;

    if (!cloisons.length) {
      list.innerHTML = `<div class="card"><div class="empty-state">
        <div class="empty-state-icon">🧱</div>
        <div class="empty-state-title">Aucune cloison saisie</div>
        <div class="empty-state-text">Ajoutez les cloisons de ce chantier avec leurs dimensions</div>
        <button class="btn btn-primary" onclick="PageCloison.modalAjouter()">+ Nouvelle cloison</button>
      </div></div>`;
      document.getElementById('cloison-totaux').style.display = 'none';
      return;
    }

    // Totaux
    let totRails=0, totMonts=0, totPlaqs=0, totMat=0, totMO=0;

    list.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧱 Cloisons — ${cloisons.length} élément(s)</span>
          <button class="btn btn-primary btn-sm" onclick="PageCloison.modalAjouter()">+ Ajouter</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Désignation</th><th>Type</th><th>Dimensions</th><th>Surface</th>
              <th>Rails</th><th>Montants</th><th>Plaques</th>
              <th style="text-align:right">Coût mat.</th>
              <th style="text-align:right">Coût MO</th>
              <th></th>
            </tr></thead>
            <tbody>
              ${cloisons.map(c => {
                const calc = this.calculer(c);
                totRails += calc.rails;
                totMonts += calc.montants;
                totPlaqs += calc.plaques;
                totMat   += calc.coutMat;
                totMO    += calc.coutMO;
                return `<tr>
                  <td><strong>${c.designation || 'Cloison'}</strong>
                    ${c.options ? '<br><span style="font-size:11px;color:var(--text-tertiary)">' + c.options + '</span>' : ''}
                  </td>
                  <td><span class="badge badge-blue">${c.type || 'M48'}</span></td>
                  <td class="font-mono" style="font-size:12px">
                    ${this.fmt(c.longueur,1)}ml × ${this.fmt(c.hauteur,2)}m
                    ${c.nbPortes > 0 ? '<br><span style="color:var(--text-tertiary)">-' + c.nbPortes + ' porte(s)</span>' : ''}
                  </td>
                  <td class="font-mono">${this.fmt(calc.surface,1)} m²</td>
                  <td class="font-mono">${this.fmt(calc.rails,1)} ml</td>
                  <td class="font-mono">${calc.montants} u</td>
                  <td class="font-mono">${calc.plaques} u</td>
                  <td style="text-align:right;font-weight:600">${this.fmt(calc.coutMat)} €</td>
                  <td style="text-align:right;color:var(--green)">${this.fmt(calc.coutMO)} €</td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="PageCloison.modalEditer(${c.id})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="PageCloison.supprimer(${c.id})">✕</button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="background:var(--glass-bg-md)">
                <td colspan="4"><strong>TOTAUX</strong></td>
                <td class="font-mono"><strong>${this.fmt(totRails,1)} ml</strong></td>
                <td class="font-mono"><strong>${totMonts} u</strong></td>
                <td class="font-mono"><strong>${totPlaqs} u</strong></td>
                <td style="text-align:right"><strong>${this.fmt(totMat)} €</strong></td>
                <td style="text-align:right;color:var(--green)"><strong>${this.fmt(totMO)} €</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`;

    // Bloc totaux
    const totDiv = document.getElementById('cloison-totaux');
    totDiv.style.display = 'block';
    const r = DB.getRatios();
    const mMat = r.MARGE_MATERIAUX || 0.30;
    const mMO  = r.MARGE_MO || 0.20;
    const tva  = r.TVA_TRAVAUX || 0.10;
    const ht   = totMat*(1+mMat) + totMO*(1+mMO);
    totDiv.innerHTML = `
      <div class="card" style="border-color:rgba(79,142,247,.25)">
        <div class="card-body">
          <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end">
            <div style="text-align:center;padding:12px 20px;background:var(--glass-bg);border-radius:var(--r-lg);border:1px solid var(--glass-border)">
              <div class="stat-label">Matériaux HT</div>
              <div class="stat-value" style="font-size:18px">${this.fmt(totMat)} €</div>
            </div>
            <div style="text-align:center;padding:12px 20px;background:var(--green-dim);border-radius:var(--r-lg);border:1px solid rgba(45,212,160,.2)">
              <div class="stat-label">Main d'œuvre HT</div>
              <div class="stat-value" style="font-size:18px;color:var(--green)">${this.fmt(totMO)} €</div>
            </div>
            <div class="total-row" style="margin:0;flex:0 0 auto">
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

  calculer(c) {
    const r = DB.getRatios();
    const coeff = c.doublePlaquage ? 2 : 1;
    const surfPortes = (c.nbPortes || 0) * 2.1;
    const surface = Math.max(0, c.longueur * c.hauteur - surfPortes);
    const rails    = c.longueur * 2;
    const entreaxe = c.entreaxe === '40' ? 0.40 : 0.60;
    const montants = Math.ceil(c.longueur / entreaxe) + 2 + (c.nbPortes||0)*2;
    const plaques  = Math.ceil(surface / 2.7 * 2 * coeff * (r.COEFF_PERTE_PLAQUE||1.10)) + 2;
    const pRail = DB.getPrixByRef('PARF' + (c.type||'48').replace('M','')) || 1.65;
    const pMont = DB.getPrixByRef('PAMON' + (c.type||'48').replace('M','')) || 2.45;
    const pPlaq = DB.getPrixByRef('BA13' + (c.plaque||'S')) || 8.50;
    const vis   = Math.ceil(plaques * 13 / 500);
    const pVis  = DB.getPrixByRef('VIS_TF35') || 6.90;
    let coutMat = rails*pRail + montants*pMont + plaques*pPlaq + vis*pVis;
    if (c.avecIso) coutMat += surface * (DB.getPrixByRef('LV45')||3.80);
    const hMO = surface * 0.5 * coeff;
    const coutMO = hMO * (r.TAUX_HORAIRE_MO||35);
    return { surface, rails, montants, plaques, coutMat, coutMO };
  },

  modalAjouter(existant) {
    const d = document.createElement('div');
    const e = existant || {};
    d.innerHTML = `
      <div class="form-row mb-12">
        <div class="form-group">
          <label class="form-label">Désignation</label>
          <input class="form-control" id="cl-desig" value="${e.designation||''}" placeholder="Ex: Cloison couloir, Séparation bureau...">
        </div>
        <div class="form-group">
          <label class="form-label">Chantier</label>
          <select class="form-control" id="cl-ch">
            ${DB.chantiers.map(c => '<option value="'+c.id+'"'+(c.id===this._chantierId?' selected':'')+'>'+c.nom+'</option>').join('')}
          </select>
        </div>
      </div>
      <div class="form-row mb-12">
        <div class="form-group">
          <label class="form-label">Type de montant</label>
          <select class="form-control" id="cl-type">
            ${['48','70','98','120'].map(t => '<option value="'+t+'"'+(e.type===t?' selected':'')+'>M'+t+(t==='48'?' — Standard':t==='70'?' — Acoustique':t==='98'?' — Haute perf.':' — Grande hauteur')+'</option>').join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Plaque</label>
          <select class="form-control" id="cl-plaque">
            <option value="S" ${e.plaque==='S'||!e.plaque?'selected':''}>BA13S — Standard</option>
            <option value="H" ${e.plaque==='H'?'selected':''}>BA13H — Hydrofuge</option>
            <option value="F" ${e.plaque==='F'?'selected':''}>BA13F — Feu</option>
            <option value="PHF" ${e.plaque==='PHF'?'selected':''}>BA13PHF — Phonique HD</option>
          </select>
        </div>
      </div>
      <div class="form-row mb-12">
        <div class="form-group">
          <label class="form-label">Longueur (ml)</label>
          <div style="display:flex;align-items:center;border:1px solid var(--glass-border-md);border-radius:var(--r-md);overflow:hidden">
            <input type="number" class="form-control" id="cl-long" value="${e.longueur||''}" step="0.1" placeholder="0.0" style="border:none;box-shadow:none" oninput="PageCloison.previewCalc()">
            <span style="padding:0 10px;color:var(--text-tertiary);font-size:12px;background:var(--glass-bg);border-left:1px solid var(--glass-border)">ml</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Hauteur (m)</label>
          <div style="display:flex;align-items:center;border:1px solid var(--glass-border-md);border-radius:var(--r-md);overflow:hidden">
            <input type="number" class="form-control" id="cl-haut" value="${e.hauteur||2.60}" step="0.05" style="border:none;box-shadow:none" oninput="PageCloison.previewCalc()">
            <span style="padding:0 10px;color:var(--text-tertiary);font-size:12px;background:var(--glass-bg);border-left:1px solid var(--glass-border)">m</span>
          </div>
        </div>
      </div>
      <div class="form-row mb-12">
        <div class="form-group">
          <label class="form-label">Entreaxe montants</label>
          <select class="form-control" id="cl-ea" onchange="PageCloison.previewCalc()">
            <option value="60" ${e.entreaxe!=='40'?'selected':''}>60 cm — Standard</option>
            <option value="40" ${e.entreaxe==='40'?'selected':''}>40 cm — Phonique / grande hauteur</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nb portes / passages</label>
          <input type="number" class="form-control" id="cl-portes" value="${e.nbPortes||0}" min="0" max="10" oninput="PageCloison.previewCalc()">
        </div>
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
          <input type="checkbox" id="cl-iso" ${e.avecIso?'checked':''} onchange="PageCloison.previewCalc()" style="accent-color:var(--accent);width:15px;height:15px">
          Avec isolation laine de verre
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
          <input type="checkbox" id="cl-double" ${e.doublePlaquage?'checked':''} onchange="PageCloison.previewCalc()" style="accent-color:var(--accent);width:15px;height:15px">
          Double plaquage (phonique)
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
          <input type="checkbox" id="cl-joint" ${e.avecJoint!==false?'checked':''} onchange="PageCloison.previewCalc()" style="accent-color:var(--accent);width:15px;height:15px">
          Inclure jointage
        </label>
      </div>
      <!-- Preview calcul -->
      <div id="cl-preview" style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-md);padding:12px 14px;font-size:12px;display:none">
        <div style="font-weight:600;color:var(--text-secondary);margin-bottom:8px">Estimation automatique :</div>
        <div id="cl-preview-content"></div>
      </div>
    `;

    App.openModal(existant ? 'Modifier la cloison' : 'Nouvelle cloison', d, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="PageCloison.sauvegarder(${e.id||''})">
        ${existant ? 'Enregistrer' : 'Ajouter'}
      </button>
    `);

    setTimeout(() => PageCloison.previewCalc(), 100);
  },

  previewCalc() {
    const long  = parseFloat(document.getElementById('cl-long')?.value) || 0;
    const haut  = parseFloat(document.getElementById('cl-haut')?.value) || 0;
    if (!long || !haut) return;

    const type  = document.getElementById('cl-type')?.value || '48';
    const ea    = document.getElementById('cl-ea')?.value || '60';
    const portes = parseInt(document.getElementById('cl-portes')?.value) || 0;
    const double = document.getElementById('cl-double')?.checked;

    const calc = this.calculer({ longueur:long, hauteur:haut, type, entreaxe:ea, nbPortes:portes, doublePlaquage:double });

    const prev = document.getElementById('cl-preview');
    const cont = document.getElementById('cl-preview-content');
    if (!prev || !cont) return;
    prev.style.display = 'block';
    cont.innerHTML = `
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        <span>Surface : <strong>${this.fmt(calc.surface,1)} m²</strong></span>
        <span>Rails : <strong>${this.fmt(calc.rails,1)} ml</strong></span>
        <span>Montants : <strong>${calc.montants} u</strong></span>
        <span>Plaques : <strong>${calc.plaques} u</strong></span>
        <span style="color:var(--accent)">Mat. : <strong>${this.fmt(calc.coutMat)} €</strong></span>
        <span style="color:var(--green)">MO : <strong>${this.fmt(calc.coutMO)} €</strong></span>
      </div>`;
  },

  sauvegarder(id) {
    const long  = parseFloat(document.getElementById('cl-long')?.value);
    const haut  = parseFloat(document.getElementById('cl-haut')?.value);
    const chId  = parseInt(document.getElementById('cl-ch')?.value);
    if (!long || !haut || !chId) { App.toast('Longueur, hauteur et chantier obligatoires','error'); return; }

    const data = {
      chantierId:    chId,
      designation:   document.getElementById('cl-desig')?.value || 'Cloison',
      type:          document.getElementById('cl-type')?.value || '48',
      plaque:        document.getElementById('cl-plaque')?.value || 'S',
      longueur:      long,
      hauteur:       haut,
      entreaxe:      document.getElementById('cl-ea')?.value || '60',
      nbPortes:      parseInt(document.getElementById('cl-portes')?.value)||0,
      avecIso:       document.getElementById('cl-iso')?.checked || false,
      doublePlaquage:document.getElementById('cl-double')?.checked || false,
      avecJoint:     document.getElementById('cl-joint')?.checked !== false,
    };

    if (id) DB.update(DB.KEYS.cloisons, id, data);
    else DB.add(DB.KEYS.cloisons, data);

    App.closeModal();
    App.toast(id ? 'Cloison modifiée !' : 'Cloison ajoutée !');
    this.charger(chId);
  },

  modalEditer(id) {
    const c = DB.getById(DB.KEYS.cloisons, id);
    if (c) this.modalAjouter(c);
  },

  supprimer(id) {
    if (!confirm('Supprimer cette cloison ?')) return;
    DB.delete(DB.KEYS.cloisons, id);
    App.toast('Cloison supprimée');
    this.charger(this._chantierId);
  },
};
