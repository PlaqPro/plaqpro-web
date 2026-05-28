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
};
