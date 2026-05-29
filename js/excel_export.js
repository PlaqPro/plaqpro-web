/**
 * PlaqPro+ -- Export Excel factures via SheetJS
 */

const ExcelExport = {

  exporterFacture(factureId) {
    const facture = DB.getById(DB.KEYS.factures, factureId);
    if (!facture) { App.toast('Facture introuvable', 'error'); return; }

    if (typeof XLSX === 'undefined') { App.toast('Module Excel non charge -- rechargez la page', 'error'); return; }

    const chantier = DB.getChantier(facture.chantierId);
    const client   = chantier ? DB.getClient(chantier.clientId) : null;

    // Feuille 1 -- Resume
    const resume = [
      ['Champ',        'Valeur'],
      ['N Facture',    facture.numero        || '--'],
      ['Date',         facture.date          || '--'],
      ['Echeance',     facture.dateEcheance  || '--'],
      ['Client',       client  ? client.nom  : '--'],
      ['Chantier',     chantier ? chantier.nom : '--'],
      ['Devis lie',    facture.devisNumero   || '--'],
      ['Statut',       facture.statut        || '--'],
      [],
      ['Total HT',     parseFloat(facture.totalHT    || 0)],
      ['TVA',          parseFloat(facture.montantTVA || 0)],
      ['Total TTC',    parseFloat(facture.totalTTC   || 0)],
    ];

    // Feuille 2 -- Lignes de facturation
    const lignesHeader = ['Poste / Prestation', 'Base HT (EUR)', 'Marge (%)', 'Total HT (EUR)'];
    const lignesRows = (facture.lignes || []).map(function(l) {
      return [
        l.poste || l.designation || l.nom || '',
        parseFloat(l.baseHT     || 0),
        Math.round((l.marge     || 0) * 100),
        parseFloat(l.totalClient || l.prixUnitaire || 0),
      ];
    });

    const wb = XLSX.utils.book_new();

    const wsResume = XLSX.utils.aoa_to_sheet(resume);
    wsResume['!cols'] = [{ wch: 20 }, { wch: 32 }];
    XLSX.utils.book_append_sheet(wb, wsResume, 'Resume');

    const wsLignes = XLSX.utils.aoa_to_sheet([lignesHeader].concat(lignesRows));
    wsLignes['!cols'] = [{ wch: 42 }, { wch: 14 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsLignes, 'Lignes');

    const filename = 'facture_' + (facture.numero || factureId).replace(/[^a-z0-9]/gi, '_') + '.xlsx';
    XLSX.writeFile(wb, filename);
    App.toast('Export Excel telecharge', 'success');
  },

  exporterDevis(devisId) {
    const devis = DB.getById(DB.KEYS.devis, devisId);
    if (!devis) { App.toast('Devis introuvable', 'error'); return; }
    if (typeof XLSX === 'undefined') { App.toast('Module Excel non charge -- rechargez la page', 'error'); return; }

    const client   = devis.clientId   ? DB.getClient(devis.clientId)     : null;
    const chantier = devis.chantierId ? DB.getChantier(devis.chantierId) : null;

    const resume = [
      ['Champ',      'Valeur'],
      ['N Devis',    devis.numero       || '--'],
      ['Date',       devis.date         || '--'],
      ['Validite',   devis.validite     || '--'],
      ['Client',     client  ? client.nom   : '--'],
      ['Chantier',   chantier ? chantier.nom : '--'],
      ['Objet',      devis.objet        || '--'],
      ['Statut',     devis.statut       || '--'],
      [],
      ['Total HT',   parseFloat(devis.totalHT  || 0)],
      ['TVA',        parseFloat(devis.tva       || 0)],
      ['Total TTC',  parseFloat(devis.totalTTC  || 0)],
    ];

    const header = ['Ref', 'Designation', 'Unite', 'Qte', 'Prix HT', 'Total HT'];
    const rows = (devis.lignes || []).filter(l => !l._header).map(function(l) {
      return [
        l.ref         || '',
        l.designation || l.poste || '',
        l.unite       || 'u',
        parseFloat(l.quantite || l.qte  || 0),
        parseFloat(l.prixHT   || l.baseHT || 0),
        parseFloat(l.totalHT  || l.totalClient || 0),
      ];
    });

    const wb = XLSX.utils.book_new();
    const wsR = XLSX.utils.aoa_to_sheet(resume);
    wsR['!cols'] = [{ wch: 20 }, { wch: 32 }];
    XLSX.utils.book_append_sheet(wb, wsR, 'Resume');

    const wsL = XLSX.utils.aoa_to_sheet([header].concat(rows));
    wsL['!cols'] = [{ wch: 10 }, { wch: 42 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsL, 'Lignes');

    const filename = 'devis_' + (devis.numero || devisId).replace(/[^a-z0-9]/gi, '_') + '.xlsx';
    XLSX.writeFile(wb, filename);
    App.toast('Export Excel telecharge', 'success');
  },

  exporterListeAchat(listeId) {
    const liste = DB.getById(DB.KEYS.listesAchat, listeId);
    if (!liste) { App.toast('Liste introuvable', 'error'); return; }
    if (typeof XLSX === 'undefined') { App.toast('Module Excel non charge -- rechargez la page', 'error'); return; }

    const header = ['Ref', 'Designation', 'Fournisseur', 'Unite', 'Qte', 'Prix U HT', 'Total HT'];
    const rows = (liste.lignes || []).map(function(l) {
      return [
        l.ref          || '',
        l.designation  || l.nom || '',
        l.fournisseur  || '',
        l.unite        || 'u',
        parseFloat(l.quantite || l.qte || 0),
        parseFloat(l.prixHT   || l.prixUnitaire || 0),
        parseFloat(l.totalHT  || 0),
      ];
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header].concat(rows));
    ws['!cols'] = [{ wch: 10 }, { wch: 38 }, { wch: 20 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Liste achat');

    const filename = 'liste_achat_' + (liste.numero || listeId).replace(/[^a-z0-9]/gi, '_') + '.xlsx';
    XLSX.writeFile(wb, filename);
    App.toast('Export Excel telecharge', 'success');
  },
};
