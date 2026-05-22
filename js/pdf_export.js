/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Export PDF & Impression
//  pdf_export.js
// ============================================================

const PDF = {

  // ── Styles CSS pour l'impression ──────────────────────────
  injecterStylesImpression() {
    if (document.getElementById('print-styles')) return;
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.textContent = `
      @media print {
        /* Masquer tout l'UI */
        .sidebar, .topbar, .btn, .nav-tabs,
        .prod-familles, #prod-search, .tarif-badge,
        #btn-achat-print, #btn-achat-copy, #btn-achat-devis,
        select, input[type="text"], input[type="number"],
        .modal-overlay { display: none !important; }

        /* Réinitialiser le layout */
        body {
          background: white !important;
          color: black !important;
          font-family: 'Arial', sans-serif !important;
          font-size: 11pt !important;
          overflow: visible !important;
          display: block !important;
        }

        .main {
          margin-left: 0 !important;
          overflow: visible !important;
        }

        .content {
          height: auto !important;
          overflow: visible !important;
          padding: 0 !important;
        }

        /* Cards propres */
        .card {
          background: white !important;
          border: 1px solid #ddd !important;
          box-shadow: none !important;
          border-radius: 4px !important;
          backdrop-filter: none !important;
          break-inside: avoid;
          margin-bottom: 12pt !important;
        }

        .card-header {
          background: #f5f5f5 !important;
          border-bottom: 1px solid #ddd !important;
          padding: 8pt 12pt !important;
        }

        .card-title {
          color: black !important;
          font-size: 12pt !important;
          font-weight: bold !important;
        }

        .card-body { padding: 10pt 12pt !important; }

        /* Tableaux */
        table { font-size: 9pt !important; }
        thead th {
          background: #1F3864 !important;
          color: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          padding: 6pt 8pt !important;
          border: none !important;
        }
        tbody td {
          padding: 5pt 8pt !important;
          border-bottom: 0.5px solid #e0e0e0 !important;
          color: black !important;
        }
        tbody tr:nth-child(even) td {
          background: #f9f9f9 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Textes */
        .text-primary, .text-secondary, .text-tertiary { color: black !important; }
        .font-mono { font-family: 'Courier New', monospace !important; }

        /* Total */
        .total-row {
          background: #E8F1FC !important;
          border: 1px solid #1F3864 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          padding: 10pt 14pt !important;
        }
        .total-label { color: #1F3864 !important; }
        .total-value { color: black !important; font-size: 16pt !important; }

        /* Masquer les éléments décoratifs */
        .card::before { display: none !important; }

        /* En-tête d'impression */
        .print-header { display: block !important; }

        /* Sauts de page */
        .page-break { page-break-before: always; }
      }

      /* En-tête masqué hors impression */
      .print-header { display: none; }
    `;
    document.head.appendChild(style);
  },

  // ── Préparer et imprimer ──────────────────────────────────
  imprimer(titre, contenuId) {
    this.injecterStylesImpression();

    const config = DB.getConfig();

    // Créer l'en-tête d'impression
    let header = document.getElementById('print-header-block');
    if (header) header.remove();

    header = document.createElement('div');
    header.id = 'print-header-block';
    header.className = 'print-header';
    header.style.cssText = 'margin-bottom:20pt;padding-bottom:12pt;border-bottom:2px solid #1F3864';
    const isFacture = titre.toLowerCase().includes('facture') || titre.toLowerCase().includes('fac-');
    header.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-size:20pt;font-weight:900;color:#1F3864;letter-spacing:-0.5px">🏗 PlaqPro</div>
          <div style="font-size:14pt;font-weight:700;color:#1F3864;margin-top:4pt">${config.nomEntreprise || 'MON ENTREPRISE'}</div>
          <div style="font-size:9pt;color:#666;margin-top:2pt">${config.adresse || ''}</div>
          <div style="font-size:9pt;color:#666">${config.telephone || ''} · ${config.email || ''}</div>
          ${config.siret ? '<div style="font-size:9pt;color:#666">SIRET : ' + config.siret + '</div>' : ''}
          ${config.tvaIntra ? '<div style="font-size:9pt;color:#666">TVA intra : ' + config.tvaIntra + '</div>' : ''}
        </div>
        <div style="text-align:right">
          <div style="font-size:16pt;font-weight:800;color:#1F3864">${titre}</div>
          <div style="font-size:9pt;color:#666;margin-top:4pt">
            Édité le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
          </div>
          ${isFacture ? '<div style="margin-top:6pt;font-size:8pt;color:#2a7a5a;border:1px solid #2a7a5a;border-radius:3pt;padding:2pt 6pt;display:inline-block">🇪🇺 Facture conforme Factur-X 2026 · EN16931</div>' : ''}
        </div>
      </div>
    `;

    // Insérer avant le contenu
    const content = document.getElementById('content');
    if (content) content.insertBefore(header, content.firstChild);

    window.print();

    // Nettoyer après impression
    setTimeout(() => { if (header.parentNode) header.remove(); }, 1000);
  },

  // ── Export PDF via impression navigateur ──────────────────
  exporterPDF(titre) {
    App.toast('💡 Dans la boîte d\'impression → choisissez "Enregistrer en PDF"', 'info');
    setTimeout(() => this.imprimer(titre), 800);
  },

  // ── Générer HTML autonome téléchargeable ─────────────────
  genererHTML(titre, contenu) {
    const config = DB.getConfig();
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${titre} — PlaqPro</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #1D1D1F; max-width: 900px; margin: 0 auto; padding: 20pt; }
    h1 { color: #1F3864; font-size: 18pt; margin-bottom: 4pt; }
    .entete { display: flex; justify-content: space-between; margin-bottom: 20pt; padding-bottom: 10pt; border-bottom: 2px solid #1F3864; }
    .section { margin-bottom: 16pt; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
    .section-titre { background: #1F3864; color: white; padding: 8pt 12pt; font-weight: bold; font-size: 11pt; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    thead th { background: #2E5FA3; color: white; padding: 6pt 8pt; text-align: left; }
    tbody td { padding: 5pt 8pt; border-bottom: 0.5px solid #e0e0e0; }
    tbody tr:nth-child(even) { background: #f9f9f9; }
    .total-bloc { background: #E8F1FC; border: 2px solid #1F3864; border-radius: 4px; padding: 12pt 16pt; margin-top: 16pt; display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 12pt; font-weight: bold; color: #1F3864; }
    .total-value { font-size: 20pt; font-weight: 900; color: #1F3864; }
    .footer { margin-top: 24pt; padding-top: 8pt; border-top: 1px solid #ddd; font-size: 8pt; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="entete">
    <div>
      <h1>🏗 ${config.nomEntreprise || 'PlaqPro'}</h1>
      <div>${config.adresse || ''}</div>
      <div>${config.telephone || ''} · ${config.email || ''}</div>
      ${config.siret ? '<div>SIRET : ' + config.siret + '</div>' : ''}
    </div>
    <div style="text-align:right">
      <div style="font-size:16pt;font-weight:bold;color:#1F3864">${titre}</div>
      <div style="color:#888;font-size:9pt">Édité le ${new Date().toLocaleDateString('fr-FR')}</div>
    </div>
  </div>
  ${contenu}
  <div class="footer">Document généré par PlaqPro Web · ${new Date().toLocaleDateString('fr-FR')}</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = titre.replace(/[^a-zA-Z0-9]/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.html';
    a.click();
    URL.revokeObjectURL(url);
    App.toast('Document HTML téléchargé — ouvrez-le et faites Ctrl+P pour PDF');
  },

  // ── Export liste d'achat en HTML ─────────────────────────
  exporterListeAchat(chantier, lignes, totaux) {
    if (!lignes?.length) { App.toast('Aucune donnée à exporter', 'error'); return; }

    let corps = '';
    lignes.forEach(g => {
      const total = g.items.reduce((s,i) => s + i.total, 0);
      corps += `
      <div class="section">
        <div class="section-titre">${g.fam} — ${new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2}).format(total)} €</div>
        <table>
          <thead><tr><th>Réf.</th><th>Désignation</th><th>Quantité</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total HT</th></tr></thead>
          <tbody>
            ${g.items.map(i => `
            <tr>
              <td style="font-family:monospace;font-size:9pt;color:#888">${i.ref}</td>
              <td>${i.nom}</td>
              <td style="font-family:monospace">${i.detail}</td>
              <td style="text-align:right;font-family:monospace">${i.prixU ? new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2}).format(i.prixU)+' €' : '—'}</td>
              <td style="text-align:right;font-family:monospace;font-weight:bold">${new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2}).format(i.total)} €</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    });

    if (totaux) {
      const fmt = n => new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2}).format(n);
      corps += `
      <div class="section">
        <div class="section-titre">💶 Récapitulatif financier</div>
        <table>
          <tbody>
            <tr><td>Matériaux HT (achat)</td><td style="text-align:right;font-family:monospace">${fmt(totaux.totalMat)} €</td></tr>
            <tr><td>Main d'œuvre HT</td><td style="text-align:right;font-family:monospace">${fmt(totaux.totalMOval)} €</td></tr>
            <tr><td>Matériaux facturés (+${Math.round(totaux.margeMat*100)}%)</td><td style="text-align:right;font-family:monospace">${fmt(totaux.htMat)} €</td></tr>
            <tr><td>MO facturée (+${Math.round(totaux.margeMO*100)}%)</td><td style="text-align:right;font-family:monospace">${fmt(totaux.htMO)} €</td></tr>
            ${totaux.tva === 0 ? '' : `<tr><td>TVA ${Math.round(totaux.tva*100)}%</td><td style="text-align:right;font-family:monospace">${fmt(totaux.totalHT*totaux.tva)} €</td></tr>`}
          </tbody>
        </table>
        <div class="total-bloc">
          <span class="total-label">${totaux.tva === 0 ? 'NET À PAYER' : 'TOTAL TTC'}</span>
          <span class="total-value">${fmt(totaux.tva === 0 ? totaux.totalHT : totaux.totalTTC)} €</span>
        </div>
      </div>`;
    }

    const titre = 'Liste d\'achat — ' + (chantier?.nom || '');
    this.genererHTML(titre, corps);
  },
};

// ── Initialiser les styles au chargement ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  PDF.injecterStylesImpression();
});
