// ============================================================
//  PLAQPRO WEB — Export Excel (SheetJS)
//  excel_export.js
//  Dépendance : SheetJS CDN (ajouté dynamiquement)
// ============================================================

const ExcelExport = {

  // ── Couleurs PlaqPro ──────────────────────────────────────
  COLORS: {
    bleuFonce:  '1F3864',
    bleuMoyen:  '2E5FA3',
    bleuClair:  'E8F1FC',
    vert:       '2a7a5a',
    vertClair:  'E8F5EF',
    gris:       'F5F5F5',
    grisBord:   'DDDDDD',
    blanc:      'FFFFFF',
    texte:      '1D1D1F',
    orange:     'E67E22',
    orangeClair:'FEF0E6',
  },

  // ── Chargement SheetJS ────────────────────────────────────
  async _chargerSheetJS() {
    if (window.XLSX) return window.XLSX;
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload  = () => resolve(window.XLSX);
      s.onerror = () => reject(new Error('Impossible de charger SheetJS'));
      document.head.appendChild(s);
    });
  },

  // ── Téléchargement ────────────────────────────────────────
  _telecharger(wb, nomFichier) {
    const XLSX = window.XLSX;
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${nomFichier}_${date}.xlsx`);
  },

  // ── Style cellule header ──────────────────────────────────
  _styleHeader(couleurFond, couleurTexte, gras, taille, alignH) {
    return {
      font:      { bold: gras !== false, color: { rgb: couleurTexte || this.COLORS.blanc }, sz: taille || 11 },
      fill:      { fgColor: { rgb: couleurFond || this.COLORS.bleuFonce } },
      alignment: { horizontal: alignH || 'center', vertical: 'center', wrapText: true },
      border:    this._border(),
    };
  },

  _styleCell(gras, alignH, couleurFond, couleurTexte, format) {
    return {
      font:      { bold: !!gras, color: { rgb: couleurTexte || this.COLORS.texte }, sz: 10 },
      fill:      couleurFond ? { fgColor: { rgb: couleurFond } } : undefined,
      alignment: { horizontal: alignH || 'left', vertical: 'center', wrapText: false },
      border:    this._border(),
      numFmt:    format || undefined,
    };
  },

  _border() {
    const b = { style: 'thin', color: { rgb: this.COLORS.grisBord } };
    return { top: b, bottom: b, left: b, right: b };
  },

  // ── Ligne vide ────────────────────────────────────────────
  _ligneVide(nbCols) {
    return Array(nbCols).fill({ v: '', t: 's' });
  },

  // ── Entête document (logo texte + infos entreprise) ───────
  _enteteDocument(ws, config, titre, soustitre, startRow) {
    const row = startRow || 0;
    // Ligne logo
    ws[`A${row+1}`] = { v: '🏗 PlaqPro+', t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 16, 'left') };
    ws[`B${row+1}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
    ws[`C${row+1}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
    ws[`D${row+1}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
    ws[`E${row+1}`] = { v: titre, t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 14, 'right') };
    ws[`F${row+1}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };

    // Infos entreprise
    ws[`A${row+2}`] = { v: config.nomEntreprise || 'MON ENTREPRISE', t: 's', s: this._styleCell(true, 'left', this.COLORS.bleuClair, this.COLORS.bleuFonce) };
    ws[`B${row+2}`] = { v: config.adresse || '', t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
    ws[`C${row+2}`] = { v: (config.telephone || '') + '  ' + (config.email || ''), t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
    ws[`D${row+2}`] = { v: config.siret ? 'SIRET : ' + config.siret : '', t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
    ws[`E${row+2}`] = { v: soustitre || '', t: 's', s: this._styleCell(false, 'right', this.COLORS.bleuClair, this.COLORS.bleuFonce) };
    ws[`F${row+2}`] = { v: 'Édité le ' + new Date().toLocaleDateString('fr-FR'), t: 's', s: this._styleCell(false, 'right', this.COLORS.bleuClair) };

    return row + 3;
  },

  // ── Formater nombre FR ────────────────────────────────────
  _fmt(n) { return typeof n === 'number' ? Math.round(n * 100) / 100 : (parseFloat(n) || 0); },

  // ═══════════════════════════════════════════════════════════
  //  1. EXPORT DEVIS
  // ═══════════════════════════════════════════════════════════
  async exporterDevis(devisId) {
    try {
      const XLSX = await this._chargerSheetJS();
      const devis = DB.devis.find(d => d.id === devisId);
      if (!devis) { App.toast('Devis introuvable', 'error'); return; }

      const chantier = DB.getChantier(devis.chantierId);
      const client   = chantier ? DB.getClient(chantier.clientId) : null;
      const config   = DB.getConfig();

      const wb = XLSX.utils.book_new();
      const wsData = [];

      // Entête
      const titre    = 'DEVIS ' + (devis.numero || '#' + devis.id);
      const soustitre = 'Chantier : ' + (chantier?.nom || '') + ' · Client : ' + (client?.nom || '');

      // On construit la feuille manuellement pour le style
      const ws = {};
      let r = 1;

      // Ligne titre
      ws[`A${r}`] = { v: '🏗 PlaqPro+', t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 14, 'left') };
      ws[`B${r}`] = ws[`C${r}`] = ws[`D${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
      ws[`E${r}`] = { v: titre, t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 13, 'right') };
      ws[`F${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
      r++;

      // Infos
      ws[`A${r}`] = { v: config.nomEntreprise || 'MON ENTREPRISE', t: 's', s: this._styleCell(true, 'left', this.COLORS.bleuClair, this.COLORS.bleuFonce) };
      ws[`B${r}`] = { v: config.adresse || '', t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
      ws[`C${r}`] = { v: config.telephone || '', t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
      ws[`D${r}`] = { v: 'SIRET : ' + (config.siret || ''), t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
      ws[`E${r}`] = { v: 'Client : ' + (client?.nom || ''), t: 's', s: this._styleCell(true, 'right', this.COLORS.bleuClair, this.COLORS.bleuFonce) };
      ws[`F${r}`] = { v: 'Édité le ' + new Date().toLocaleDateString('fr-FR'), t: 's', s: this._styleCell(false, 'right', this.COLORS.bleuClair) };
      r++;

      // Ligne vide
      r++;

      // Headers colonnes — structure PlaqPro : poste / totalClient
      const headers = ['Poste', 'Détail', 'Base HT', 'Marge', 'Total HT client'];
      ['A','B','C','D','E'].forEach((c, i) => {
        ws[`${c}${r}`] = { v: headers[i], t: 's', s: this._styleHeader(this.COLORS.bleuMoyen, this.COLORS.blanc, true, 10) };
      });
      r++;

      // Lignes devis — champs réels : poste, baseHT, marge, totalClient
      const lignes = devis.lignes || [];
      let totalHT  = devis.totalHT || 0;

      if (lignes.length) {
        totalHT = 0;
        lignes.forEach((l, idx) => {
          const fond = idx % 2 === 0 ? this.COLORS.blanc : this.COLORS.gris;
          ws[`A${r}`] = { v: l.poste || l.designation || '', t: 's', s: this._styleCell(true, 'left', fond) };
          ws[`B${r}`] = { v: l.description || '', t: 's', s: this._styleCell(false, 'left', fond) };
          ws[`C${r}`] = { v: this._fmt(l.baseHT || 0), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00 €' };
          ws[`D${r}`] = { v: l.marge ? '+' + Math.round(l.marge * 100) + '%' : '', t: 's', s: this._styleCell(false, 'center', fond) };
          ws[`E${r}`] = { v: this._fmt(l.totalClient || 0), t: 'n', s: this._styleCell(true, 'right', fond), z: '#,##0.00 €' };
          totalHT += this._fmt(l.totalClient || 0);
          r++;
        });
      }

      // Ligne vide
      r++;

      // Totaux
      const totaux   = devis.totaux || {};
      const _tht     = totaux.totalHT    || devis.totalHT    || totalHT;
      const _ttc     = totaux.totalTTC   || devis.totalTTC   || (_tht * (1 + (totaux.tva || devis.tva || 0.1)));
      const _tva_val = totaux.montantTVA || devis.montantTVA || (_tht * (totaux.tva || devis.tva || 0.1));
      const tva      = totaux.tva || devis.tva || 0.10;
      const totalTTC = _ttc;
      const totalTVA = _tva_val;
      totalHT        = _tht;

      const ligTotaux = [
        ['', '', '', '', 'Total HT', totalHT, this.COLORS.blanc],
        ['', '', '', '', `TVA ${Math.round(tva*100)}%`, totalTVA, this.COLORS.gris],
        ['', '', '', '', 'TOTAL TTC', totalTTC, this.COLORS.bleuClair],
      ];

      ligTotaux.forEach(([_a,_b,_c,_d,label,val,fond]) => {
        ws[`A${r}`] = ws[`B${r}`] = ws[`C${r}`] = ws[`D${r}`] = { v: '', t: 's' };
        ws[`E${r}`] = { v: label, t: 's', s: this._styleCell(true, 'right', fond, label === 'TOTAL TTC' ? this.COLORS.bleuFonce : this.COLORS.texte) };
        ws[`F${r}`] = { v: this._fmt(val), t: 'n', s: this._styleCell(true, 'right', fond, label === 'TOTAL TTC' ? this.COLORS.bleuFonce : this.COLORS.texte), z: '#,##0.00 €' };
        r++;
      });

      // Pied de page
      r++;
      ws[`A${r}`] = { v: config.piedPageDevis || 'Devis valable 30 jours.', t: 's', s: this._styleCell(false, 'left', this.COLORS.gris) };

      // Dimensions colonnes
      ws['!ref'] = `A1:E${r}`;
      ws['!cols'] = [{ wch: 22 }, { wch: 30 }, { wch: 14 }, { wch: 10 }, { wch: 16 }];
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 0, c: 4 }, e: { r: 0, c: 4 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        { s: { r: r-1, c: 0 }, e: { r: r-1, c: 4 } },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Devis');
      this._telecharger(wb, 'Devis_' + (devis.numero || devis.id));
      App.toast('✅ Devis exporté en Excel', 'success');

    } catch (e) {
      console.error(e);
      App.toast('Erreur export Excel : ' + e.message, 'error');
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  2. EXPORT FACTURE
  // ═══════════════════════════════════════════════════════════
  async exporterFacture(factureId) {
    try {
      const XLSX = await this._chargerSheetJS();
      const facture  = DB.factures.find(f => f.id === factureId);
      if (!facture) { App.toast('Facture introuvable', 'error'); return; }

      const chantier = DB.getChantier(facture.chantierId);
      const client   = chantier ? DB.getClient(chantier.clientId) : null;
      const config   = DB.getConfig();

      const wb = XLSX.utils.book_new();
      const ws = {};
      let r = 1;

      // Entête
      ws[`A${r}`] = { v: '🏗 PlaqPro+', t: 's', s: this._styleHeader(this.COLORS.vert, this.COLORS.blanc, true, 14, 'left') };
      ws[`B${r}`] = ws[`C${r}`] = ws[`D${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.vert) };
      ws[`E${r}`] = { v: 'FACTURE ' + (facture.numero || '#' + facture.id), t: 's', s: this._styleHeader(this.COLORS.vert, this.COLORS.blanc, true, 13, 'right') };
      ws[`F${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.vert) };
      r++;

      ws[`A${r}`] = { v: config.nomEntreprise || 'MON ENTREPRISE', t: 's', s: this._styleCell(true, 'left', this.COLORS.vertClair, this.COLORS.vert) };
      ws[`B${r}`] = { v: config.adresse || '', t: 's', s: this._styleCell(false, 'left', this.COLORS.vertClair) };
      ws[`C${r}`] = { v: config.telephone || '', t: 's', s: this._styleCell(false, 'left', this.COLORS.vertClair) };
      ws[`D${r}`] = { v: 'SIRET : ' + (config.siret || ''), t: 's', s: this._styleCell(false, 'left', this.COLORS.vertClair) };
      ws[`E${r}`] = { v: 'Client : ' + (client?.nom || ''), t: 's', s: this._styleCell(true, 'right', this.COLORS.vertClair, this.COLORS.vert) };
      ws[`F${r}`] = { v: 'Émise le ' + new Date(facture.createdAt || Date.now()).toLocaleDateString('fr-FR'), t: 's', s: this._styleCell(false, 'right', this.COLORS.vertClair) };
      r++;

      // Statut paiement
      r++;
      const statut = facture.statut || 'En attente';
      const coulStatut = statut === 'Payée' ? this.COLORS.vert : this.COLORS.orange;
      ws[`A${r}`] = { v: 'Statut : ' + statut.toUpperCase(), t: 's', s: this._styleCell(true, 'left', statut === 'Payée' ? this.COLORS.vertClair : this.COLORS.orangeClair, coulStatut) };
      ws[`B${r}`] = ws[`C${r}`] = ws[`D${r}`] = ws[`E${r}`] = ws[`F${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', statut === 'Payée' ? this.COLORS.vertClair : this.COLORS.orangeClair) };
      r++;
      r++;

      // Colonnes
      const headers = ['Réf.', 'Désignation', 'Unité', 'Quantité', 'Prix Unit. HT', 'Total HT'];
      headers.forEach((h, i) => {
        ws[String.fromCharCode(65+i) + r] = { v: h, t: 's', s: this._styleHeader(this.COLORS.vert, this.COLORS.blanc, true, 10) };
      });
      r++;

      const lignes = facture.lignes || [];
      let totalHT = 0;
      lignes.forEach((l, idx) => {
        const fond = idx % 2 === 0 ? this.COLORS.blanc : this.COLORS.gris;
        const total = this._fmt((l.quantite || l.qte || 0) * (l.prixUnitaire || l.prixU || 0));
        ws[`A${r}`] = { v: l.reference || '', t: 's', s: this._styleCell(false, 'left', fond) };
        ws[`B${r}`] = { v: l.designation || l.description || '', t: 's', s: this._styleCell(false, 'left', fond) };
        ws[`C${r}`] = { v: l.unite || 'u', t: 's', s: this._styleCell(false, 'center', fond) };
        ws[`D${r}`] = { v: this._fmt(l.quantite || l.qte || 0), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00' };
        ws[`E${r}`] = { v: this._fmt(l.prixUnitaire || l.prixU || 0), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00 €' };
        ws[`F${r}`] = { v: total, t: 'n', s: this._styleCell(true, 'right', fond), z: '#,##0.00 €' };
        totalHT += total;
        r++;
      });

      if (!lignes.length) totalHT = facture.totalHT || 0;

      r++;
      const tva      = facture.tva || 0.10;
      const totalTTC = totalHT * (1 + tva);

      [
        ['Total HT', totalHT, this.COLORS.blanc],
        [`TVA ${Math.round(tva*100)}%`, totalHT * tva, this.COLORS.gris],
        ['TOTAL TTC', totalTTC, this.COLORS.vertClair],
      ].forEach(([label, val, fond]) => {
        ws[`A${r}`] = ws[`B${r}`] = ws[`C${r}`] = ws[`D${r}`] = { v: '', t: 's' };
        ws[`E${r}`] = { v: label, t: 's', s: this._styleCell(true, 'right', fond, label === 'TOTAL TTC' ? this.COLORS.vert : this.COLORS.texte) };
        ws[`F${r}`] = { v: this._fmt(val), t: 'n', s: this._styleCell(true, 'right', fond, label === 'TOTAL TTC' ? this.COLORS.vert : this.COLORS.texte), z: '#,##0.00 €' };
        r++;
      });

      // Mentions légales
      r++;
      ws[`A${r}`] = { v: config.piedPageFacture || 'Facture payable à 30 jours.', t: 's', s: this._styleCell(false, 'left', this.COLORS.gris) };
      r++;
      if (config.iban) {
        ws[`A${r}`] = { v: 'IBAN : ' + config.iban + (config.bic ? '  ·  BIC : ' + config.bic : '') + (config.banque ? '  ·  ' + config.banque : ''), t: 's', s: this._styleCell(false, 'left', this.COLORS.gris) };
        r++;
      }

      ws['!ref']  = `A1:F${r}`;
      ws['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 16 }];
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 0, c: 4 }, e: { r: 0, c: 5 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Facture');
      this._telecharger(wb, 'Facture_' + (facture.numero || facture.id));
      App.toast('✅ Facture exportée en Excel', 'success');

    } catch (e) {
      console.error(e);
      App.toast('Erreur export Excel : ' + e.message, 'error');
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  3. EXPORT LISTE D'ACHAT
  // ═══════════════════════════════════════════════════════════
  async exporterListeAchat(chantier, lignes, totaux) {
    try {
      if (!lignes?.length) { App.toast('Aucune donnée à exporter', 'error'); return; }
      const XLSX  = await this._chargerSheetJS();
      const config = DB.getConfig();
      const client = chantier ? DB.getClient(chantier.clientId) : null;

      const wb = XLSX.utils.book_new();
      const ws = {};
      let r = 1;

      // Entête
      ws[`A${r}`] = { v: '🏗 PlaqPro+', t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 14, 'left') };
      ws[`B${r}`] = ws[`C${r}`] = ws[`D${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
      ws[`E${r}`] = { v: "LISTE D'ACHAT", t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 13, 'right') };
      ws[`F${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
      r++;

      ws[`A${r}`] = { v: config.nomEntreprise || 'MON ENTREPRISE', t: 's', s: this._styleCell(true, 'left', this.COLORS.bleuClair, this.COLORS.bleuFonce) };
      ws[`B${r}`] = { v: 'Chantier : ' + (chantier?.nom || ''), t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
      ws[`C${r}`] = { v: 'Client : ' + (client?.nom || ''), t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
      ws[`D${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
      ws[`E${r}`] = { v: '', t: 's', s: this._styleCell(false, 'right', this.COLORS.bleuClair) };
      ws[`F${r}`] = { v: 'Édité le ' + new Date().toLocaleDateString('fr-FR'), t: 's', s: this._styleCell(false, 'right', this.COLORS.bleuClair) };
      r++;
      r++;

      // Pour chaque famille
      lignes.forEach(groupe => {
        // Titre famille
        ws[`A${r}`] = { v: groupe.fam, t: 's', s: this._styleHeader(this.COLORS.bleuMoyen, this.COLORS.blanc, true, 10, 'left') };
        ws[`B${r}`] = ws[`C${r}`] = ws[`D${r}`] = ws[`E${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuMoyen) };
        const totalFam = groupe.items.reduce((s, i) => s + (i.total || 0), 0);
        ws[`F${r}`] = { v: this._fmt(totalFam), t: 'n', s: this._styleHeader(this.COLORS.bleuMoyen, this.COLORS.blanc, true, 10, 'right'), z: '#,##0.00 €' };
        r++;

        // Headers
        ['Réf.', 'Désignation', 'Détail', 'Qté', 'Prix unit.', 'Total HT'].forEach((h, i) => {
          ws[String.fromCharCode(65+i) + r] = { v: h, t: 's', s: this._styleCell(true, i >= 3 ? 'right' : 'left', this.COLORS.gris) };
        });
        r++;

        // Items
        groupe.items.forEach((item, idx) => {
          const fond = idx % 2 === 0 ? this.COLORS.blanc : this.COLORS.gris;
          ws[`A${r}`] = { v: item.ref || '', t: 's', s: this._styleCell(false, 'left', fond) };
          ws[`B${r}`] = { v: item.nom || '', t: 's', s: this._styleCell(false, 'left', fond) };
          ws[`C${r}`] = { v: item.detail || '', t: 's', s: this._styleCell(false, 'left', fond) };
          ws[`D${r}`] = { v: this._fmt(item.qte || 0), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00' };
          ws[`E${r}`] = { v: this._fmt(item.prixU || 0), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00 €' };
          ws[`F${r}`] = { v: this._fmt(item.total || 0), t: 'n', s: this._styleCell(true, 'right', fond), z: '#,##0.00 €' };
          r++;
        });
        r++;
      });

      // Récapitulatif financier
      if (totaux) {
        ws[`A${r}`] = { v: '💶 RÉCAPITULATIF FINANCIER', t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 11, 'left') };
        ws[`B${r}`] = ws[`C${r}`] = ws[`D${r}`] = ws[`E${r}`] = ws[`F${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
        r++;

        const recap = [
          ["Matériaux HT (coût d'achat)", totaux.totalMat],
          ["Main d'œuvre HT (estimée)", totaux.totalMOval],
          [`Matériaux facturés (+${Math.round((totaux.margeMat||0.3)*100)}% marge)`, totaux.htMat],
          [`MO facturée (+${Math.round((totaux.margeMO||0.2)*100)}% marge)`, totaux.htMO],
          ['Total HT facturé', totaux.totalHT],
          [`TVA ${Math.round((totaux.tva||0.1)*100)}%`, totaux.totalHT * (totaux.tva || 0.1)],
          ['TOTAL TTC', totaux.totalTTC],
        ];

        recap.forEach(([label, val]) => {
          const isTTC = label === 'TOTAL TTC';
          const fond  = isTTC ? this.COLORS.bleuClair : this.COLORS.blanc;
          ws[`A${r}`] = { v: label, t: 's', s: this._styleCell(isTTC, 'left', fond, isTTC ? this.COLORS.bleuFonce : this.COLORS.texte) };
          ws[`B${r}`] = ws[`C${r}`] = ws[`D${r}`] = ws[`E${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', fond) };
          ws[`F${r}`] = { v: this._fmt(val), t: 'n', s: this._styleCell(isTTC, 'right', fond, isTTC ? this.COLORS.bleuFonce : this.COLORS.texte), z: '#,##0.00 €' };
          r++;
        });
      }

      ws['!ref']  = `A1:F${r}`;
      ws['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 14 }];
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 0, c: 4 }, e: { r: 0, c: 5 } },
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Liste d'achat");
      this._telecharger(wb, "ListeAchat_" + (chantier?.nom || '').replace(/\s/g, '_'));
      App.toast("✅ Liste d'achat exportée en Excel", 'success');

    } catch (e) {
      console.error(e);
      App.toast('Erreur export Excel : ' + e.message, 'error');
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  4. EXPORT MÉTRÉS / CALCULS
  // ═══════════════════════════════════════════════════════════
  async exporterMetrages(chantierId) {
    try {
      const XLSX   = await this._chargerSheetJS();
      const chantier = DB.getChantier(parseInt(chantierId));
      if (!chantier) { App.toast('Chantier introuvable', 'error'); return; }

      const metrages = DB.getMetragesByChantier(chantier.id);
      if (!metrages.length) { App.toast('Aucun métrage pour ce chantier', 'error'); return; }

      const client  = DB.getClient(chantier.clientId);
      const config  = DB.getConfig();
      const r_      = DB.getRatios();

      const wb = XLSX.utils.book_new();

      // ── Feuille 1 : Métrages pièce par pièce ─────────────
      const ws1 = {};
      let r = 1;

      ws1[`A${r}`] = { v: '🏗 PlaqPro+', t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 14, 'left') };
      ws1[`B${r}`] = ws1[`C${r}`] = ws1[`D${r}`] = ws1[`E${r}`] = ws1[`F${r}`] = ws1[`G${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
      ws1[`H${r}`] = { v: 'MÉTRAGES — ' + chantier.nom, t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 12, 'right') };
      r++;

      ws1[`A${r}`] = { v: config.nomEntreprise || '', t: 's', s: this._styleCell(true, 'left', this.COLORS.bleuClair, this.COLORS.bleuFonce) };
      ws1[`B${r}`] = { v: 'Chantier : ' + chantier.nom, t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
      ws1[`C${r}`] = ws1[`D${r}`] = ws1[`E${r}`] = ws1[`F${r}`] = ws1[`G${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
      ws1[`H${r}`] = { v: 'Édité le ' + new Date().toLocaleDateString('fr-FR'), t: 's', s: this._styleCell(false, 'right', this.COLORS.bleuClair) };
      r++;
      r++;

      // Headers métrages
      ['Pièce', 'Long. (m)', 'Larg. (m)', 'Haut. (m)', 'Périmètre (m)', 'Surf. Murs (m²)', 'Surf. Plafond (m²)', 'Notes'].forEach((h, i) => {
        ws1[String.fromCharCode(65+i) + r] = { v: h, t: 's', s: this._styleHeader(this.COLORS.bleuMoyen, this.COLORS.blanc, true, 10) };
      });
      r++;

      let totMurs = 0, totPlaf = 0, totPerim = 0;
      metrages.forEach((m, idx) => {
        const perim = 2 * (m.longueur + m.largeur);
        const murs  = perim * m.hauteur;
        const plaf  = m.longueur * m.largeur;
        totMurs  += murs;
        totPlaf  += plaf;
        totPerim += perim;

        const fond = idx % 2 === 0 ? this.COLORS.blanc : this.COLORS.gris;
        ws1[`A${r}`] = { v: m.piece || 'Pièce ' + (idx+1), t: 's', s: this._styleCell(false, 'left', fond) };
        ws1[`B${r}`] = { v: this._fmt(m.longueur), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00' };
        ws1[`C${r}`] = { v: this._fmt(m.largeur),  t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00' };
        ws1[`D${r}`] = { v: this._fmt(m.hauteur),  t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00' };
        ws1[`E${r}`] = { v: this._fmt(perim), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00' };
        ws1[`F${r}`] = { v: this._fmt(murs),  t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00' };
        ws1[`G${r}`] = { v: this._fmt(plaf),  t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00' };
        ws1[`H${r}`] = { v: m.notes || '', t: 's', s: this._styleCell(false, 'left', fond) };
        r++;
      });

      // Totaux métrages
      r++;
      ['TOTAL', '', '', '', this._fmt(totPerim), this._fmt(totMurs), this._fmt(totPlaf), ''].forEach((v, i) => {
        ws1[String.fromCharCode(65+i) + r] = {
          v: typeof v === 'string' ? v : v,
          t: i === 0 ? 's' : (v === '' ? 's' : 'n'),
          s: this._styleCell(true, i >= 4 ? 'right' : 'left', this.COLORS.bleuClair, this.COLORS.bleuFonce),
          z: i >= 4 ? '#,##0.00' : undefined,
        };
      });
      r++;

      ws1['!ref']  = `A1:H${r}`;
      ws1['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 20 }];
      ws1['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      ];
      XLSX.utils.book_append_sheet(wb, ws1, 'Métrages');

      // ── Feuille 2 : Calculs matériaux ─────────────────────
      const ws2    = {};
      const besoins = Calculs.genererBesoins(chantier.id);
      r = 1;

      ws2[`A${r}`] = { v: 'CALCULS MATÉRIAUX — ' + chantier.nom, t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 13, 'left') };
      ws2[`B${r}`] = ws2[`C${r}`] = ws2[`D${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
      r++;
      r++;

      if (besoins) {
        const sections = [
          {
            titre: '🧱 Cloisons',
            lignes: [
              ['Surface cloisons', besoins.surfaces.murs * 0.4, 'm²'],
              ['Rails ML', besoins.cloison.rails, 'ml'],
              ['Montants', besoins.cloison.montants, 'u'],
              ['Plaques BA13', besoins.cloison.plaques, 'u'],
              ['Vis TF', besoins.cloison.vis, 'u'],
              ['Coût matériaux', besoins.cloison.coutMat, '€'],
              ['Heures MO', besoins.cloison.coutMO / (r_.TAUX_HORAIRE_MO || 35), 'h'],
            ]
          },
          {
            titre: '🪣 Joints & finition',
            lignes: [
              ['Surface à jointer', besoins.surfaces.murs * 0.4 * 2, 'm²'],
              ['Bandes à plâtre', besoins.joints.bandes, 'ml'],
              ['Enduit finition', besoins.joints.enduit, 'kg'],
              ['Heures jointage', besoins.joints.heures, 'h'],
              ['Coût matériaux', besoins.joints.coutMat, '€'],
            ]
          },
          {
            titre: '🎨 Peinture',
            lignes: [
              ['Surface murs', besoins.surfaces.murs, 'm²'],
              ['Surface plafond', besoins.surfaces.plafond, 'm²'],
              ['Litres peinture', besoins.peinture.litres, 'L'],
              ['Heures peinture', besoins.peinture.heures, 'h'],
              ['Coût matériaux', besoins.peinture.coutMat, '€'],
            ]
          },
        ];

        sections.forEach(sec => {
          ws2[`A${r}`] = { v: sec.titre, t: 's', s: this._styleHeader(this.COLORS.bleuMoyen, this.COLORS.blanc, true, 11, 'left') };
          ws2[`B${r}`] = ws2[`C${r}`] = ws2[`D${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuMoyen) };
          r++;

          ['Poste', 'Valeur', 'Unité', ''].forEach((h, i) => {
            ws2[String.fromCharCode(65+i) + r] = { v: h, t: 's', s: this._styleCell(true, 'left', this.COLORS.gris) };
          });
          r++;

          sec.lignes.forEach(([label, val, unite], idx) => {
            const fond = idx % 2 === 0 ? this.COLORS.blanc : this.COLORS.gris;
            ws2[`A${r}`] = { v: label, t: 's', s: this._styleCell(false, 'left', fond) };
            ws2[`B${r}`] = { v: this._fmt(val), t: 'n', s: this._styleCell(false, 'right', fond), z: unite === '€' ? '#,##0.00' : '#,##0.00' };
            ws2[`C${r}`] = { v: unite, t: 's', s: this._styleCell(false, 'left', fond) };
            ws2[`D${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', fond) };
            r++;
          });
          r++;
        });

        // Récap global
        const calc = Calculs.calculerDevis(chantier.id);
        if (calc) {
          ws2[`A${r}`] = { v: '💶 RÉCAPITULATIF DEVIS ESTIMÉ', t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 11, 'left') };
          ws2[`B${r}`] = ws2[`C${r}`] = ws2[`D${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) };
          r++;

          calc.lignes.forEach((l, idx) => {
            const fond = idx % 2 === 0 ? this.COLORS.blanc : this.COLORS.gris;
            ws2[`A${r}`] = { v: l.poste, t: 's', s: this._styleCell(false, 'left', fond) };
            ws2[`B${r}`] = { v: this._fmt(l.totalClient), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00 €' };
            ws2[`C${r}`] = { v: `marge +${Math.round(l.marge*100)}%`, t: 's', s: this._styleCell(false, 'left', fond) };
            ws2[`D${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', fond) };
            r++;
          });

          r++;
          [
            ['Total HT',  calc.totaux.totalHT],
            [`TVA ${Math.round(calc.totaux.tva*100)}%`, calc.totaux.montantTVA],
            ['TOTAL TTC', calc.totaux.totalTTC],
          ].forEach(([label, val]) => {
            const isTTC = label === 'TOTAL TTC';
            ws2[`A${r}`] = { v: label, t: 's', s: this._styleCell(isTTC, 'left', isTTC ? this.COLORS.bleuClair : this.COLORS.blanc, isTTC ? this.COLORS.bleuFonce : this.COLORS.texte) };
            ws2[`B${r}`] = { v: this._fmt(val), t: 'n', s: this._styleCell(isTTC, 'right', isTTC ? this.COLORS.bleuClair : this.COLORS.blanc, isTTC ? this.COLORS.bleuFonce : this.COLORS.texte), z: '#,##0.00 €' };
            ws2[`C${r}`] = ws2[`D${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', isTTC ? this.COLORS.bleuClair : this.COLORS.blanc) };
            r++;
          });
        }
      }

      ws2['!ref']  = `A1:D${r}`;
      ws2['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 10 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Calculs');

      this._telecharger(wb, 'Metrages_' + chantier.nom.replace(/\s/g, '_'));
      App.toast('✅ Métrages exportés en Excel (2 feuilles)', 'success');

    } catch (e) {
      console.error(e);
      App.toast('Erreur export Excel : ' + e.message, 'error');
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  5. EXPORT GLOBAL — Tous les devis + factures (récap)
  // ═══════════════════════════════════════════════════════════
  async exporterRecapGlobal() {
    try {
      const XLSX  = await this._chargerSheetJS();
      const config = DB.getConfig();
      const wb    = XLSX.utils.book_new();

      // Feuille devis
      const devis = DB.devis;
      const ws1   = {};
      let r = 1;

      ws1[`A${r}`] = { v: '🏗 PlaqPro+ — RÉCAPITULATIF DEVIS', t: 's', s: this._styleHeader(this.COLORS.bleuFonce, this.COLORS.blanc, true, 13, 'left') };
      ['B','C','D','E','F','G'].forEach(c => { ws1[`${c}${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.bleuFonce) }; });
      r++;
      r++;

      ['N° Devis', 'Chantier', 'Client', 'Date', 'Total HT', 'TVA', 'Total TTC', 'Statut'].forEach((h, i) => {
        ws1[String.fromCharCode(65+i) + r] = { v: h, t: 's', s: this._styleHeader(this.COLORS.bleuMoyen, this.COLORS.blanc, true, 10) };
      });
      r++;

      let grandTotalHT = 0, grandTotalTTC = 0;
      devis.forEach((d, idx) => {
        const ch   = DB.getChantier(d.chantierId);
        const cl   = ch ? DB.getClient(ch.clientId) : null;
        const tva  = (d.totalHT || 0) * (d.tva || 0.1);
        const ttc  = (d.totalHT || 0) + tva;
        const fond = idx % 2 === 0 ? this.COLORS.blanc : this.COLORS.gris;
        grandTotalHT  += d.totalHT || 0;
        grandTotalTTC += ttc;

        ws1[`A${r}`] = { v: d.numero || '#' + d.id, t: 's', s: this._styleCell(false, 'left', fond) };
        ws1[`B${r}`] = { v: ch?.nom || '', t: 's', s: this._styleCell(false, 'left', fond) };
        ws1[`C${r}`] = { v: cl?.nom || '', t: 's', s: this._styleCell(false, 'left', fond) };
        ws1[`D${r}`] = { v: new Date(d.createdAt || Date.now()).toLocaleDateString('fr-FR'), t: 's', s: this._styleCell(false, 'center', fond) };
        ws1[`E${r}`] = { v: this._fmt(d.totalHT || 0), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00 €' };
        ws1[`F${r}`] = { v: this._fmt(tva), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00 €' };
        ws1[`G${r}`] = { v: this._fmt(ttc), t: 'n', s: this._styleCell(true, 'right', fond), z: '#,##0.00 €' };
        ws1[`H${r}`] = { v: d.statut || 'En cours', t: 's', s: this._styleCell(false, 'center', fond) };
        r++;
      });

      r++;
      ws1[`A${r}`] = { v: 'TOTAL', t: 's', s: this._styleCell(true, 'left', this.COLORS.bleuClair, this.COLORS.bleuFonce) };
      ['B','C','D'].forEach(c => { ws1[`${c}${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) }; });
      ws1[`E${r}`] = { v: this._fmt(grandTotalHT), t: 'n', s: this._styleCell(true, 'right', this.COLORS.bleuClair, this.COLORS.bleuFonce), z: '#,##0.00 €' };
      ws1[`F${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', this.COLORS.bleuClair) };
      ws1[`G${r}`] = { v: this._fmt(grandTotalTTC), t: 'n', s: this._styleCell(true, 'right', this.COLORS.bleuClair, this.COLORS.bleuFonce), z: '#,##0.00 €' };
      ws1[`H${r}`] = { v: devis.length + ' devis', t: 's', s: this._styleCell(false, 'center', this.COLORS.bleuClair) };
      r++;

      ws1['!ref']  = `A1:H${r}`;
      ws1['!cols'] = [{ wch: 14 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }];
      ws1['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Devis');

      // Feuille factures
      const factures = DB.factures;
      const ws2 = {};
      r = 1;

      ws2[`A${r}`] = { v: '🏗 PlaqPro+ — RÉCAPITULATIF FACTURES', t: 's', s: this._styleHeader(this.COLORS.vert, this.COLORS.blanc, true, 13, 'left') };
      ['B','C','D','E','F','G','H'].forEach(c => { ws2[`${c}${r}`] = { v: '', t: 's', s: this._styleHeader(this.COLORS.vert) }; });
      r++;
      r++;

      ['N° Facture', 'Chantier', 'Client', 'Date émission', 'Total HT', 'TVA', 'Total TTC', 'Statut'].forEach((h, i) => {
        ws2[String.fromCharCode(65+i) + r] = { v: h, t: 's', s: this._styleHeader(this.COLORS.vert, this.COLORS.blanc, true, 10) };
      });
      r++;

      let gtHT = 0, gtTTC = 0, gtPayee = 0;
      factures.forEach((f, idx) => {
        const ch   = DB.getChantier(f.chantierId);
        const cl   = ch ? DB.getClient(ch.clientId) : null;
        const tva  = (f.totalHT || 0) * (f.tva || 0.1);
        const ttc  = (f.totalHT || 0) + tva;
        const fond = idx % 2 === 0 ? this.COLORS.blanc : this.COLORS.gris;
        gtHT  += f.totalHT || 0;
        gtTTC += ttc;
        if (f.statut === 'Payée') gtPayee += ttc;

        ws2[`A${r}`] = { v: f.numero || '#' + f.id, t: 's', s: this._styleCell(false, 'left', fond) };
        ws2[`B${r}`] = { v: ch?.nom || '', t: 's', s: this._styleCell(false, 'left', fond) };
        ws2[`C${r}`] = { v: cl?.nom || '', t: 's', s: this._styleCell(false, 'left', fond) };
        ws2[`D${r}`] = { v: new Date(f.createdAt || Date.now()).toLocaleDateString('fr-FR'), t: 's', s: this._styleCell(false, 'center', fond) };
        ws2[`E${r}`] = { v: this._fmt(f.totalHT || 0), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00 €' };
        ws2[`F${r}`] = { v: this._fmt(tva), t: 'n', s: this._styleCell(false, 'right', fond), z: '#,##0.00 €' };
        ws2[`G${r}`] = { v: this._fmt(ttc), t: 'n', s: this._styleCell(true, 'right', fond), z: '#,##0.00 €' };
        ws2[`H${r}`] = { v: f.statut || 'En attente', t: 's', s: this._styleCell(false, 'center', fond, f.statut === 'Payée' ? this.COLORS.vert : this.COLORS.orange) };
        r++;
      });

      r++;
      ws2[`A${r}`] = { v: 'TOTAL FACTURÉ', t: 's', s: this._styleCell(true, 'left', this.COLORS.vertClair, this.COLORS.vert) };
      ['B','C','D'].forEach(c => { ws2[`${c}${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', this.COLORS.vertClair) }; });
      ws2[`E${r}`] = { v: this._fmt(gtHT), t: 'n', s: this._styleCell(true, 'right', this.COLORS.vertClair, this.COLORS.vert), z: '#,##0.00 €' };
      ws2[`F${r}`] = { v: '', t: 's', s: this._styleCell(false, 'left', this.COLORS.vertClair) };
      ws2[`G${r}`] = { v: this._fmt(gtTTC), t: 'n', s: this._styleCell(true, 'right', this.COLORS.vertClair, this.COLORS.vert), z: '#,##0.00 €' };
      ws2[`H${r}`] = { v: `Encaissé : ${this._fmt(gtPayee)} €`, t: 's', s: this._styleCell(true, 'center', this.COLORS.vertClair, this.COLORS.vert) };
      r++;

      ws2['!ref']  = `A1:H${r}`;
      ws2['!cols'] = [{ wch: 14 }, { wch: 25 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];
      ws2['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Factures');

      this._telecharger(wb, 'RecapGlobal_PlaqPro');
      App.toast('✅ Récap global exporté (Devis + Factures)', 'success');

    } catch (e) {
      console.error(e);
      App.toast('Erreur export Excel : ' + e.message, 'error');
    }
  },
};
