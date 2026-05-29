/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Liste d'achat par chantier
//  liste_achat.js
// ============================================================

Pages.listeAchat = function(params) {
  params = params || {};
  const div = document.createElement('div');

  div.innerHTML = `
    <!-- Sélecteur chantier -->
    <div class="flex justify-between items-center mb-16">
      <select class="form-control" id="sel-ch-achat" style="width:320px"
        onchange="ListeAchat.charger(this.value)">
        <option value="">— Sélectionner un chantier —</option>
        ${DB.chantiers.map(c => {
          const cl = DB.getClient(c.clientId);
          return '<option value="' + c.id + '"' + (params.chantierId == c.id ? ' selected' : '') + '>'
            + c.id + ' — ' + c.nom + (cl ? ' (' + cl.nom + ')' : '') + '</option>';
        }).join('')}
      </select>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" id="btn-achat-print" onclick="ListeAchat.imprimer()" style="display:none">🖨 Imprimer</button>
        <button class="btn btn-secondary" id="btn-achat-excel" onclick="ExcelExport.exporterListeAchat(ListeAchat._chantier,ListeAchat._lignes,ListeAchat._totaux)" style="display:none">📊 Excel</button>
        <button class="btn btn-secondary" id="btn-achat-copy"  onclick="ListeAchat.copier()"   style="display:none">📋 Copier</button>
        <button class="btn btn-primary"   id="btn-achat-devis" onclick="ListeAchat.versDevis()" style="display:none">📄 Créer devis</button>
      </div>
    </div>

    <!-- Contenu liste -->
    <div id="achat-content"></div>
  `;

  if (params.chantierId) {
    setTimeout(() => ListeAchat.charger(params.chantierId), 80);
  }

  return div;
};

// ── Moteur liste d'achat ──────────────────────────────────────
const ListeAchat = {

  _chantier: null,
  _lignes:   [],
  _totaux:   null,

  fmt(n)  { return new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0); },
  fmtN(n,d){ return new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d||1,maximumFractionDigits:d||1}).format(n||0); },

  charger(chantierId) {
    if (!chantierId) return;
    const id = parseInt(chantierId);
    this._chantier = DB.getChantier(id);
    if (!this._chantier) return;

    const client   = DB.getClient(this._chantier.clientId);
    const metrages = DB.getMetragesByChantier(id);
    const r        = DB.getRatios();

    if (!metrages.length) {
      document.getElementById('achat-content').innerHTML = `
        <div class="card"><div class="empty-state">
          <div class="empty-state-icon">📐</div>
          <div class="empty-state-title">Aucun métré saisi pour ce chantier</div>
          <div class="empty-state-text">Commencez par saisir les métrés de chaque pièce</div>
          <button class="btn btn-primary" onclick="App.navigate('metrages',{chantierId:${id}})">
            Saisir les métrés
          </button>
        </div></div>`;
      return;
    }

    // Calcul des surfaces totales
    let totalMurs = 0, totalPlaf = 0;
    const pieces = metrages.map(m => {
      const perim   = 2 * (m.longueur + m.largeur);
      const murs    = perim * m.hauteur;
      const plafond = m.longueur * m.largeur;
      totalMurs  += murs;
      totalPlaf  += plafond;
      return { ...m, perim, murs, plafond };
    });

    // Surfaces cloisons (estimées à 40% des murs)
    const surfClois  = totalMurs * 0.40;
    const longClois  = surfClois / 2.6;
    const coeffPerte = r.COEFF_PERTE_PLAQUE || 1.10;
    const tauxMO     = r.TAUX_HORAIRE_MO || 35;

    // ── Construction des lignes ──────────────────────────────
    const lignes = [];

    // === OSSATURE ===
    const railsML  = longClois * 2;
    const montants = Math.ceil(longClois / 0.60) + 2; // entreaxe 60cm + 2 rives
    lignes.push({
      fam: '🧱 Ossature cloisons',
      items: [
        this._ligne('PARF48', 'Rail Stil R48', this.fmtN(railsML) + ' ml', railsML, 'ml'),
        this._ligne('PAMON48','Montant Stil M48', montants + ' u', montants, 'u'),
      ]
    });

    // === PLAQUES ===
    const plaqClois = Math.ceil(surfClois / 2.7 * 2 * coeffPerte) + 2;
    const plaqPlaf  = Math.ceil(totalPlaf / 2.7 * coeffPerte) + 1;
    lignes.push({
      fam: '🟫 Plaques de plâtre',
      items: [
        this._ligne('BA13S', 'Plaque BA13 Standard (cloisons)',
          plaqClois + ' u — ' + this.fmtN(surfClois) + ' m²', plaqClois, 'u'),
        this._ligne('BA13S', 'Plaque BA13 Standard (plafond)',
          plaqPlaf + ' u — ' + this.fmtN(totalPlaf) + ' m²', plaqPlaf, 'u'),
      ]
    });

    // === FIXATIONS ===
    const totalPlaques = plaqClois + plaqPlaf;
    const vis_TF = Math.ceil(totalPlaques * 13 / 500);   // 13 vis/plaque sur métal
    const vis_TB = Math.ceil(railsML * 2 / 0.60 / 500);  // fixation rail sol/plafond
    const chevilles = Math.ceil(railsML * 2 / 0.60);
    lignes.push({
      fam: '🔧 Fixations',
      items: [
        this._ligne('VIS_TF35', 'Vis TF 3.5×35 (plaque→métal)', vis_TF + ' boites', vis_TF, 'boite'),
        this._ligne('VIS_TB35', 'Vis TB 3.5×35 (rail→bois)', vis_TB + ' boites', vis_TB, 'boite'),
        this._ligne('CHEV6',    'Chevilles Ø6 (rail→béton)', Math.ceil(chevilles/100) + ' boites', Math.ceil(chevilles/100), 'boite'),
        this._ligne('BAND_ETN', 'Bande étanchéité rails', Math.ceil(railsML*2/30) + ' rl', Math.ceil(railsML*2/30), 'rl'),
      ]
    });

    // === JOINTAGE ===
    const surfJoint  = surfClois * 2 + totalPlaf;
    const bandesML   = surfJoint * 1.1;
    const enduitKg   = surfJoint * 0.35;
    const enduitSacs = Math.ceil(enduitKg / 25);
    lignes.push({
      fam: '🪣 Jointage & finition',
      items: [
        this._ligne('BANDE_PLA', 'Bande à plâtre 50mm', this.fmtN(bandesML) + ' ml → ' + Math.ceil(bandesML/50) + ' rl', Math.ceil(bandesML/50), 'rl'),
        this._ligne('BANDE_ARM', 'Bande armée (angles)', Math.ceil(longClois*2) + ' ml → ' + Math.ceil(longClois*2/50) + ' rl', Math.ceil(longClois*2/50), 'rl'),
        this._ligne('ENDUIT_F',  'Enduit finition Toupret', this.fmtN(enduitKg) + ' kg → ' + enduitSacs + ' sacs 25kg', enduitSacs, 'sac'),
        this._ligne('ENDUIT_RB', 'Enduit rebouchage', Math.ceil(totalPlaques/20) + ' u', Math.ceil(totalPlaques/20), 'u'),
      ]
    });

    // === PEINTURE ===
    const litresMurs = Math.ceil(totalMurs * 2 / 10);   // 2 couches, rend 10m²/L
    const litresPlaf = Math.ceil(totalPlaf * 2 / 13);   // 2 couches, rend 13m²/L
    const litresAppret = Math.ceil((totalMurs+totalPlaf) / 12);
    const perimTotal = pieces.reduce((s,p)=>s+p.perim,0);
    const masticCarto = Math.ceil(perimTotal / 8);       // 1 cartouche / 8ml
    const scotchRoul  = Math.ceil(perimTotal * 3 / 50);  // 3 rouleaux 50m / périmètre
    const baches      = Math.ceil(totalPlaf / 20);       // 1 bâche 4×5m / 20m²
    lignes.push({
      fam: '🎨 Peinture',
      items: [
        this._ligne('APPR_GYP',   'Apprêt Gyproc placo neuf', litresAppret + ' L', litresAppret, 'L'),
        this._ligne('DULUX_BM15', 'Peinture murs (2 couches)', litresMurs + ' L', litresMurs, 'L'),
        this._ligne('PLC_BMAT',   'Peinture plafond (2 couches)', litresPlaf + ' L', litresPlaf, 'L'),
        this._ligne('MASTIC_A',   'Mastic acrylique (joints périmètre)', masticCarto + ' cart.', masticCarto, 'u'),
        this._ligne('SCOTCH_M',   'Ruban masquage 25mm', scotchRoul + ' rl × 50m', scotchRoul, 'u'),
        this._ligne('BACHE_4',    'Bâche protection sol 4×5m', baches + ' u', baches, 'u'),
      ]
    });

    // === CONSOMMABLES ===
    lignes.push({
      fam: '🛒 Consommables & outillage',
      items: [
        this._ligne('PVERT_80',  'Papier de verre grain 80', Math.ceil(surfJoint/25) + ' lots', Math.ceil(surfJoint/25), 'lot'),
        this._ligne('PVERT_120', 'Papier de verre grain 120', Math.ceil(surfJoint/25) + ' lots', Math.ceil(surfJoint/25), 'lot'),
        this._ligne('CORN_ALU',  'Cornières alu protection angles', Math.ceil(longClois*2/2.5) + ' u', Math.ceil(longClois*2/2.5), 'u'),
        this._ligne('CUTTER',    'Lames cutter 18mm', Math.ceil(totalPlaques/30) + ' boites', Math.ceil(totalPlaques/30), 'boite'),
      ]
    });

    // === MAIN D'ŒUVRE ===
    const hPlaq  = surfClois * 0.5;
    const hJoint = surfJoint * 0.2;
    const hPein  = (totalMurs + totalPlaf) * 0.18 * 2;
    const hTotal = hPlaq + hJoint + hPein;
    lignes.push({
      fam: "👷 Main d'œuvre estimée",
      mo: true,
      items: [
        { ref:'MO_PLAQ',  nom:"Pose plaquiste cloisons",       detail:this.fmtN(hPlaq)+'h',  qte:hPlaq,  unite:'h', prixU:38, total:hPlaq*38,  isMO:true },
        { ref:'MO_JOINT', nom:"Jointage / finition",           detail:this.fmtN(hJoint)+'h', qte:hJoint, unite:'h', prixU:35, total:hJoint*35, isMO:true },
        { ref:'MO_PEIN',  nom:"Peinture intérieure",           detail:this.fmtN(hPein)+'h',  qte:hPein,  unite:'h', prixU:32, total:hPein*32,  isMO:true },
      ]
    });

    // Calcul totaux
    let totalMat = 0, totalMOval = 0;
    lignes.forEach(g => {
      g.items.forEach(i => {
        if (i.isMO) totalMOval += i.total;
        else        totalMat   += i.total;
      });
    });

    const margeMat = (r.MARGE_MATERIAUX || 0.30);
    const margeMO  = (r.MARGE_MO || 0.20);
    const tva      = (r.TVA_TRAVAUX || 0.10);
    const htMat    = totalMat  * (1 + margeMat);
    const htMO     = totalMOval * (1 + margeMO);
    const totalHT  = htMat + htMO;
    const totalTTC = totalHT * (1 + tva);

    this._lignes = lignes;
    this._totaux = { totalMat, totalMOval, htMat, htMO, totalHT, totalTTC, tva, margeMat, margeMO, hTotal };

    this.render(pieces, lignes, client, id);
  },

  _ligne(ref, nom, detail, qte, unite) {
    const prixU = DB.getPrixByRef(ref) || 0;
    return { ref, nom, detail, qte, unite, prixU, total: qte * prixU };
  },

  render(pieces, lignes, client, chantierId) {
    const ch  = this._chantier;
    const tot = this._totaux;
    const config = DB.getConfig();

    // Afficher les boutons
    ['btn-achat-print','btn-achat-copy','btn-achat-devis','btn-achat-excel'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'inline-flex';
    });

    const couleursFam = {
      '🧱 Ossature cloisons':       'rgba(79,142,247,0.15)',
      '🟫 Plaques de plâtre':       'rgba(139,100,60,0.15)',
      '🔧 Fixations':               'rgba(247,166,79,0.12)',
      '🪣 Jointage & finition':     'rgba(167,139,250,0.12)',
      '🎨 Peinture':                'rgba(247,91,91,0.12)',
      '🛒 Consommables & outillage':'rgba(45,212,160,0.10)',
      "👷 Main d'œuvre estimée":    'rgba(79,247,142,0.10)',
    };

    document.getElementById('achat-content').innerHTML = `

      <!-- En-tête -->
      <div class="la-header card mb-16">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px">
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">
                LISTE D'ACHAT MATÉRIAUX
              </div>
              <div style="font-size:22px;font-weight:800;color:var(--text-primary);letter-spacing:-0.5px">${esc(ch.nom)}</div>
              <div style="font-size:14px;color:var(--text-secondary);margin-top:4px">
                ${client ? esc(client.nom) : '—'} · ${esc(ch.adresse || '')} · Générée le ${new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">TOTAL TTC ESTIMÉ</div>
              <div style="font-size:28px;font-weight:800;color:var(--accent);font-family:var(--font-mono)">${this.fmt(tot.totalTTC)} €</div>
              <div style="font-size:12px;color:var(--text-tertiary)">${this.fmt(tot.totalHT)} € HT</div>
            </div>
          </div>

          <!-- Métrés résumé -->
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid var(--glass-border)">
            ${pieces.map(p => `
              <div style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-md);padding:8px 14px;font-size:12px">
                <strong style="color:var(--text-primary)">${esc(p.piece)}</strong>
                <span style="color:var(--text-tertiary);margin-left:8px">${p.longueur}×${p.largeur}×${p.hauteur}m</span>
                <span style="color:var(--accent);margin-left:8px">${this.fmtN(p.murs)} m² murs</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Lignes par famille -->
      ${lignes.map(g => `
        <div class="card mb-16" style="border-color:var(--glass-border-md)">
          <div class="card-header" style="background:${couleursFam[g.fam]||'var(--glass-bg)'}">
            <span class="card-title">${esc(g.fam)}</span>
            <span style="font-size:13px;font-weight:700;color:var(--text-primary);font-family:var(--font-mono)">
              ${this.fmt(g.items.reduce((s,i)=>s+i.total,0))} €
            </span>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>Référence</th><th>Désignation</th><th>Quantité</th>
                <th style="text-align:right">Prix unit. HT</th>
                <th style="text-align:right">Total HT</th>
              </tr></thead>
              <tbody>
                ${g.items.map(i => `
                  <tr>
                    <td class="font-mono" style="font-size:12px;color:var(--text-tertiary)">${esc(i.ref)}</td>
                    <td style="font-weight:500">${esc(i.nom)}</td>
                    <td style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary)">${esc(i.detail)}</td>
                    <td style="text-align:right;font-family:var(--font-mono);color:var(--text-secondary)">${i.prixU ? this.fmt(i.prixU) + ' €' : '—'}</td>
                    <td style="text-align:right;font-family:var(--font-mono);font-weight:700;color:${i.isMO ? 'var(--green)' : 'var(--text-primary)'}">
                      ${this.fmt(i.total)} €
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `).join('')}

      <!-- Récapitulatif financier -->
      <div class="card" style="border-color:rgba(79,142,247,0.25)">
        <div class="card-header" style="background:linear-gradient(135deg,rgba(79,142,247,0.12),rgba(45,212,160,0.08))">
          <span class="card-title">💶 Récapitulatif financier</span>
        </div>
        <div class="card-body">
          <div style="max-width:480px;margin:0 auto">

            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--glass-border)">
              <span style="color:var(--text-secondary)">Matériaux HT (achat)</span>
              <span style="font-family:var(--font-mono);font-weight:600">${this.fmt(tot.totalMat)} €</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--glass-border)">
              <span style="color:var(--text-secondary)">Main d'œuvre HT (${this.fmtN(tot.hTotal)} h)</span>
              <span style="font-family:var(--font-mono);font-weight:600;color:var(--green)">${this.fmt(tot.totalMOval)} €</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--glass-border)">
              <span style="color:var(--text-secondary)">Matériaux facturés (+${Math.round(tot.margeMat*100)}%)</span>
              <span style="font-family:var(--font-mono);font-weight:600;color:var(--accent)">${this.fmt(tot.htMat)} €</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--glass-border)">
              <span style="color:var(--text-secondary)">MO facturée (+${Math.round(tot.margeMO*100)}%)</span>
              <span style="font-family:var(--font-mono);font-weight:600;color:var(--accent)">${this.fmt(tot.htMO)} €</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--glass-border)">
              <span style="color:var(--text-secondary)">TVA ${Math.round(tot.tva*100)}% (rénovation)</span>
              <span style="font-family:var(--font-mono)">${this.fmt(tot.totalHT * tot.tva)} €</span>
            </div>

            <div class="total-row" style="margin-top:12px">
              <span class="total-label">TOTAL TTC</span>
              <span class="total-value">${this.fmt(tot.totalTTC)} €</span>
            </div>

            <div style="font-size:11px;color:var(--text-tertiary);text-align:center;margin-top:12px">
              Estimation basée sur les métrés saisis · Prix issus de la base tarifaire ·
              TVA ${Math.round(tot.tva*100)}% rénovation (art. 279-0 bis CGI)
            </div>
          </div>
        </div>
      </div>
    `;
  },

  imprimer() { window.print(); },

  copier() {
    if (!this._lignes.length) return;
    let txt = 'LISTE D\'ACHAT — ' + (this._chantier?.nom || '') + '\n';
    txt += '='.repeat(50) + '\n';
    this._lignes.forEach(g => {
      txt += '\n' + g.fam + '\n' + '-'.repeat(40) + '\n';
      g.items.forEach(i => {
        txt += '  ' + i.ref.padEnd(12) + i.nom.padEnd(35) + i.detail.padEnd(15) + this.fmt(i.total) + ' €\n';
      });
    });
    if (this._totaux) {
      const t = this._totaux;
      txt += '\n' + '='.repeat(50) + '\n';
      txt += 'Matériaux HT : ' + this.fmt(t.totalMat) + ' €\n';
      txt += 'Main d\'oeuvre HT : ' + this.fmt(t.totalMOval) + ' €\n';
      txt += 'TOTAL TTC : ' + this.fmt(t.totalTTC) + ' €\n';
    }
    navigator.clipboard.writeText(txt).then(() => App.toast('Liste copiée !'));
  },

  versDevis() {
    if (!this._chantier) return;
    App.navigate('devis', { chantierId: this._chantier.id, generer: true });
  },
};
