/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Impression / PDF A4 professionnel
//  document_print.js
// ============================================================

const DocPrint = {

  async apercu(type, documentId) {
    let doc, isFacture;

    if (type === 'facture') {
      doc = DB.getById(DB.KEYS.factures, documentId);
      isFacture = true;
    } else {
      doc = DB.getById(DB.KEYS.devis, documentId);
      isFacture = false;
    }

    if (!doc) { App.toast('Document introuvable', 'error'); return; }

    const chantier  = DB.getChantier(doc.chantierId);
    const client    = chantier ? DB.getClient(chantier.clientId) : null;
    const config    = DB.getConfig();
    const logoB64   = localStorage.getItem('plaqpro_logo_entreprise') || null;
    const qrContent = DocPrint._qrContent(doc, config, isFacture);
    const qrDataUrl = await DocPrint._generateQR(qrContent);

    const html = DocPrint._html(doc, chantier, client, config, isFacture, logoB64, qrDataUrl, qrContent);
    const win  = window.open('', '_blank', 'width=1000,height=800,resizable=yes,scrollbars=yes');
    if (!win) { App.toast('Autorisez les popups pour imprimer', 'error'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
  },

  // ── Contenu du QR code (vCard entreprise + document) ─────
  _qrContent(doc, config, isFacture) {
    const typeDoc = isFacture ? 'FACTURE' : 'DEVIS';
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${config.nomEntreprise || 'PlaqPro+'}`,
      `ORG:${config.nomEntreprise || 'PlaqPro+'}`,
      config.telephone ? `TEL:${config.telephone}`  : '',
      config.email     ? `EMAIL:${config.email}`     : '',
      `NOTE:${typeDoc} ${doc.numero} - ${DocPrint._n(doc.totalTTC || 0)} EUR TTC`,
      'END:VCARD',
    ].filter(Boolean).join('\n');
  },

  // ── Génération QR → dataURL (via qrcode CDN) ─────────────
  async _generateQR(text) {
    if (typeof QRCode === 'undefined') return null;
    try {
      return await QRCode.toDataURL(text, {
        width: 80,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#111827', light: '#ffffff' },
      });
    } catch (e) {
      console.warn('[DocPrint] QR échoué :', e);
      return null;
    }
  },

  // ── HTML complet ──────────────────────────────────────────
  _html(doc, chantier, client, config, isFacture, logoB64, qrDataUrl = null, qrContent = '') {
    const lignes     = (doc.lignes || []).filter(l => !DocPrint._isHeaderLine(l) && !DocPrint._isZeroNoiseLine(l));
    const totalHT    = doc.totalHT    || 0;
    const montantTVA = doc.montantTVA || 0;
    const totalTTC   = doc.totalTTC   || 0;
    const tva        = doc.tva        || 0;
    const tauxTVA    = tva > 1 ? Math.round(tva) : Math.round(tva * 100);
    const typeDoc    = isFacture ? 'FACTURE' : 'DEVIS';

    const accentColor  = isFacture ? '#2563EB' : '#4F8EF7';
    const accentLight  = isFacture ? '#EFF6FF' : '#F0F4FF';
    const accentBorder = isFacture ? '#BFDBFE' : '#C7D9FD';

    const mentionTVA = tauxTVA === 10
      ? `TVA à 10 % applicable — Travaux de rénovation, d'amélioration ou d'entretien de locaux d'habitation achevés depuis plus de 2 ans (art. 279-0 bis du CGI).`
      : tauxTVA === 20
        ? `TVA à 20 % applicable — Travaux sur constructions neuves ou locaux non destinés à l'habitation.`
        : `TVA à ${tauxTVA} %.`;

    const piedPage   = isFacture
      ? (config.piedPageFacture || 'Facture payable à 30 jours. En cas de retard, pénalités de 3× le taux légal + indemnité forfaitaire de 40 € (art. L441-10 C.com).')
      : (config.piedPageDevis   || 'Devis valable 30 jours à compter de sa date d\'émission.');
    const conditions = config.conditionsPaiement || 'Paiement par virement bancaire.';
    const mentions   = config.mentionsLegales    || '';

    const logoTag = logoB64
      ? `<img src="${logoB64}" class="logo-img" alt="Logo">`
      : `<div class="logo-txt">${DocPrint._esc(config.nomEntreprise || 'Entreprise')}</div>`;

    const statutColors = {
      'Brouillon': ['#6B7280','#F3F4F6'],
      'Envoyé':    [accentColor, accentLight],
      'Envoyée':   [accentColor, accentLight],
      'Accepté':   ['#059669','#ECFDF5'],
      'Refusé':    ['#DC2626','#FEF2F2'],
      'Payée':     ['#059669','#ECFDF5'],
      'Annulée':   ['#DC2626','#FEF2F2'],
      'Avoir':     ['#D97706','#FFFBEB'],
    };
    const [sc, sb] = statutColors[doc.statut] || ['#6B7280','#F3F4F6'];

    const lignesHTML = lignes.length
      ? lignes.map((l, i) => {
        const qte = parseFloat(l.quantite || l.qte || 1) || 1;
        const unite = l.unite || (l.quantite || l.qte ? '' : 'Forfait');
        const total = parseFloat(l.totalClient || l.totalHT || 0);
        const prixUnit = parseFloat(l.prixHT || l.prixUnitaire || l.prix || (qte ? total / qte : total)) || 0;
        return `
        <tr class="${i % 2 === 1 ? 'tr-even' : ''}">
          <td class="td-des">${DocPrint._esc(l.poste || l.designation || '')}</td>
          <td class="td-c">${DocPrint._n(qte)}&nbsp;${DocPrint._esc(unite)}</td>
          <td class="td-r">${DocPrint._n(prixUnit)}&nbsp;€</td>
          <td class="td-r td-bold">${DocPrint._n(total)}&nbsp;€</td>
        </tr>`;
      }).join('')
      : `<tr><td colspan="4" style="text-align:center;padding:18pt;color:#9CA3AF;font-style:italic">Aucune prestation</td></tr>`;

    // Script inline copie contact dans la popup
    const copyScript = qrDataUrl ? `
<script>
function copyContact() {
  var text = ${JSON.stringify(qrContent)};
  var btn  = document.getElementById('copy-btn');
  var copy = function() {
    if (btn) { var o = btn.textContent; btn.textContent = '✓ Copié !'; setTimeout(function() { btn.textContent = o; }, 2200); }
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(copy).catch(function() {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); copy();
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta); copy();
  }
}
<\/script>` : '';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${typeDoc} ${DocPrint._esc(doc.numero)}</title>
<style>
/* ── Page A4 ─────────────────────────────────────────────── */
@page {
  size: A4;
  margin: 15mm 15mm 22mm 15mm;
}

*{margin:0;padding:0;box-sizing:border-box}

body{
  font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
  font-size:10pt;
  color:#111827;
  background:#f9fafb;
}

/* ── Filigrane ───────────────────────────────────────────── */
.watermark{
  position:fixed;
  top:50%;left:50%;
  transform:translate(-50%,-50%) rotate(-42deg);
  font-size:88pt;
  font-weight:900;
  letter-spacing:14px;
  color:rgba(79,142,247,0.055);
  text-transform:uppercase;
  white-space:nowrap;
  pointer-events:none;
  z-index:0;
  user-select:none;
}

/* ── Barre d'actions (masquée à l'impression) ────────────── */
.no-print{
  position:fixed;top:0;left:0;right:0;
  background:#1E293B;
  padding:8px 16px;
  display:flex;align-items:center;gap:8px;
  z-index:999;
  box-shadow:0 2px 8px rgba(0,0,0,0.3);
}
.no-print .doc-label{
  flex:1;font-size:13px;font-weight:600;color:#94A3B8;
  font-family:'Courier New',monospace;letter-spacing:1px;
}
.btn-imp{
  background:${accentColor};color:#fff;border:none;
  padding:9px 22px;border-radius:6px;cursor:pointer;
  font-size:13px;font-weight:700;letter-spacing:.3px;
}
.btn-imp:hover{opacity:.9}
.btn-cls{
  background:#374151;color:#E5E7EB;border:none;
  padding:9px 16px;border-radius:6px;cursor:pointer;font-size:13px;
}
.btn-qr-copy{
  background:#374151;color:#E5E7EB;border:none;
  padding:7px 14px;border-radius:6px;cursor:pointer;font-size:12px;
  display:flex;align-items:center;gap:6px;
  transition:background .15s;
}
.btn-qr-copy:hover{background:#4B5563}
.qr-topbar-wrap{display:flex;align-items:center;gap:8px;border-left:1px solid #374151;padding-left:10px;margin-left:4px}

/* ── Page principale ─────────────────────────────────────── */
.page{
  width:210mm;
  min-height:297mm;
  margin:0 auto;
  background:#fff;
  padding:0;
  position:relative;
  z-index:1;
}
body > .page{ margin-top:56px; }

/* ── En-tête ─────────────────────────────────────────────── */
.hdr{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  padding:14pt 18pt 12pt;
  border-bottom:2.5pt solid ${accentColor};
}
.logo-img{max-width:200px;max-height:80px;object-fit:contain;display:block}
.logo-txt{font-size:16pt;font-weight:800;color:${accentColor};letter-spacing:-.5px}
.hdr-cie{
  text-align:right;
  font-size:8.5pt;
  line-height:1.65;
  color:#6B7280;
  max-width:220pt;
}
.hdr-cie strong{font-size:11pt;color:#111827;display:block;margin-bottom:3pt}

/* ── Bandeau numéro / date / statut ─────────────────────── */
.bandeau{
  background:${accentColor};
  color:#fff;
  padding:10pt 18pt;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12pt;
}
.bandeau-type{font-size:17pt;font-weight:800;letter-spacing:2px;text-transform:uppercase;opacity:.95}
.bandeau-meta{display:flex;gap:20pt;align-items:center}
.bandeau-item{text-align:right}
.bandeau-item .bl{font-size:7pt;text-transform:uppercase;letter-spacing:.08em;opacity:.75;margin-bottom:2pt}
.bandeau-item .bv{font-size:10pt;font-weight:700}
.statut-pill{
  background:${sb};color:${sc};
  border:1pt solid ${sc};
  border-radius:20pt;
  padding:3pt 10pt;
  font-size:8.5pt;font-weight:700;
  white-space:nowrap;
}

/* ── Parties ─────────────────────────────────────────────── */
.parties{display:grid;grid-template-columns:1fr 1fr;gap:10pt;padding:12pt 18pt 10pt}
.partie{padding:10pt 12pt;background:${accentLight};border:0.5pt solid ${accentBorder};border-radius:5pt}
.partie-lbl{font-size:7pt;text-transform:uppercase;letter-spacing:.1em;color:${accentColor};font-weight:700;margin-bottom:5pt}
.partie-nom{font-size:11pt;font-weight:700;margin-bottom:3pt;color:#111827}
.partie-info{font-size:8.5pt;color:#6B7280;line-height:1.6}

/* ── Bande chantier ──────────────────────────────────────── */
.chantier-band{
  display:flex;margin:0 18pt 12pt;
  background:#F8FAFC;border:0.5pt solid #E2E8F0;border-radius:5pt;overflow:hidden;font-size:9pt;
}
.ch-item{flex:1;padding:8pt 12pt;border-right:0.5pt solid #E2E8F0}
.ch-item:last-child{border-right:none}
.ch-lbl{font-size:7pt;text-transform:uppercase;color:#94A3B8;font-weight:700;margin-bottom:2pt}
.ch-val{font-weight:600;color:#374151}

${isFacture && doc.datePaiement ? `
.paid-banner{margin:0 18pt 10pt;background:#ECFDF5;border:1pt solid #6EE7B7;border-radius:5pt;padding:8pt 14pt;font-size:9.5pt;font-weight:700;color:#065F46}
` : ''}

/* ── Tableau des prestations ─────────────────────────────── */
.tbl-wrap{padding:0 18pt;margin-bottom:12pt}
table{width:100%;border-collapse:collapse;font-size:10pt}
thead tr{background:${accentColor};color:#fff}
thead th{padding:8pt 10pt;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
thead th:first-child{text-align:left;width:48%}
thead th.th-c{text-align:center;width:12%}
thead th.th-r{text-align:right;width:20%}
tbody tr{border-bottom:.5pt solid #E5E7EB}
.tr-even{background:#F8FAFC}
.td-des{padding:9pt 10pt;vertical-align:top;line-height:1.4}
.td-c{padding:9pt 10pt;text-align:center;color:#6B7280;font-size:9pt}
.td-r{padding:9pt 10pt;text-align:right;font-family:'Courier New',monospace}
.td-bold{font-weight:700;color:#1E3A8A}

/* ── Zone totaux ─────────────────────────────────────────── */
.totaux-wrap{display:flex;justify-content:flex-end;padding:0 18pt 14pt}
.totaux{width:260pt;border:0.5pt solid ${accentBorder};border-radius:5pt;overflow:hidden}
.tot-row{display:flex;justify-content:space-between;padding:7pt 12pt;border-bottom:.5pt solid ${accentBorder};font-size:9.5pt}
.tot-row:last-child{border-bottom:none}
.tot-row .tl{color:#6B7280}
.tot-row .tv{font-family:'Courier New',monospace;font-weight:600}
.tot-ttc{background:${accentColor};color:#fff}
.tot-ttc .tl{color:rgba(255,255,255,.85);font-size:10pt;font-weight:700}
.tot-ttc .tv{font-size:13pt;font-weight:800;color:#fff}

/* ── Mention TVA ─────────────────────────────────────────── */
.tva-mention{
  margin:0 18pt 10pt;padding:7pt 12pt;
  background:#FEFCE8;border:.5pt solid #FDE68A;border-radius:4pt;
  font-size:8pt;color:#92400E;line-height:1.5;
}

/* ── Pied de page fixe ───────────────────────────────────── */
.footer{
  position:fixed;bottom:0;left:0;right:0;
  border-top:1.5pt solid ${accentColor};
  background:#fff;
  padding:5pt 18pt 4pt;
  font-size:7.5pt;color:#9CA3AF;line-height:1.5;
  z-index:10;
}
.footer-grid{display:flex;gap:16pt;align-items:flex-start}
.footer-main{flex:1}
.footer-iban{text-align:right;font-size:7.5pt}
.footer-iban code{font-family:'Courier New',monospace;letter-spacing:.5px;color:#374151;font-size:8pt}
.footer-qr{flex-shrink:0;text-align:center}
.footer-qr img{display:block;border:0.5pt solid #E5E7EB;border-radius:3pt}
.qr-legend{font-size:6pt;color:#9CA3AF;margin-top:2pt;line-height:1.35;text-align:center}

/* ── Espace pour footer ──────────────────────────────────── */
.footer-spacer{height:${qrDataUrl ? '50pt' : '32pt'}}

/* ── Règles d'impression ─────────────────────────────────── */
@media print{
  body{background:#fff;margin-top:0 !important}
  .no-print{display:none !important}
  .page{margin-top:0 !important;box-shadow:none}
  body > .page{margin-top:0}
  .watermark{position:fixed}
  .footer{position:fixed}
  table{page-break-inside:auto}
  tr{page-break-inside:avoid}
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
</style>
</head>
<body>

<!-- Filigrane diagonal -->
<div class="watermark" aria-hidden="true">${typeDoc}</div>

<!-- Barre d'actions (masquée à l'impression) -->
<div class="no-print">
  <div class="doc-label">${typeDoc} &mdash; ${DocPrint._esc(doc.numero)}</div>
  <button class="btn-imp" onclick="window.print()">🖨&nbsp;&nbsp;Imprimer / Exporter PDF</button>
  ${qrDataUrl ? `
  <div class="qr-topbar-wrap">
    <img src="${qrDataUrl}" width="36" height="36"
         style="border-radius:4px;background:#fff;padding:2px;flex-shrink:0" alt="QR contact">
    <button class="btn-qr-copy" id="copy-btn" onclick="copyContact()">
      📋 Copier le lien
    </button>
  </div>` : ''}
  <button class="btn-cls" onclick="window.close()">✕ Fermer</button>
</div>

<div class="page">

  <!-- En-tête : logo + infos entreprise -->
  <div class="hdr">
    <div class="hdr-logo">${logoTag}</div>
    <div class="hdr-cie">
      <strong>${DocPrint._esc(config.nomEntreprise)}</strong>
      ${DocPrint._esc(config.adresse)}<br>
      ${DocPrint._esc(config.telephone)}${config.email ? ' &middot; ' + DocPrint._esc(config.email) : ''}<br>
      ${config.siret          ? 'SIRET : '    + DocPrint._esc(config.siret)       + '<br>' : ''}
      ${config.formeJuridique ? DocPrint._esc(config.formeJuridique)              + '<br>' : ''}
      ${config.rcs            ? 'RCS '        + DocPrint._esc(config.rcs)         + '<br>' : ''}
      ${config.tvaIntra       ? 'TVA intra : '+ DocPrint._esc(config.tvaIntra)             : ''}
    </div>
  </div>

  <!-- Bandeau coloré : type / numéro / date / statut -->
  <div class="bandeau">
    <div class="bandeau-type">${typeDoc}</div>
    <div class="bandeau-meta">
      <div class="bandeau-item">
        <div class="bl">Numéro</div>
        <div class="bv">${DocPrint._esc(doc.numero)}</div>
      </div>
      <div class="bandeau-item">
        <div class="bl">Date</div>
        <div class="bv">${DocPrint._d(doc.date)}</div>
      </div>
      ${isFacture && doc.dateEcheance ? `
      <div class="bandeau-item">
        <div class="bl">Échéance</div>
        <div class="bv">${DocPrint._d(doc.dateEcheance)}</div>
      </div>` : ''}
      <div class="bandeau-item">
        <div class="bl">Statut</div>
        <div class="bv"><span class="statut-pill">${DocPrint._esc(doc.statut || '—')}</span></div>
      </div>
    </div>
  </div>

  <!-- Parties : émetteur + client -->
  <div class="parties">
    <div class="partie">
      <div class="partie-lbl">Émetteur</div>
      <div class="partie-nom">${DocPrint._esc(config.nomEntreprise)}</div>
      <div class="partie-info">
        ${DocPrint._esc(config.adresse)}<br>
        ${DocPrint._esc(config.telephone)}
        ${config.email ? '<br>' + DocPrint._esc(config.email) : ''}
        ${config.siret ? '<br>SIRET : ' + DocPrint._esc(config.siret) : ''}
      </div>
    </div>
    <div class="partie">
      <div class="partie-lbl">Client</div>
      <div class="partie-nom">${DocPrint._esc(client?.nom || '—')}</div>
      <div class="partie-info">
        ${DocPrint._esc([(client?.adresse||''), (client?.cp||''), (client?.ville||'')].filter(Boolean).join(' '))}<br>
        ${client?.telephone ? DocPrint._esc(client.telephone) + '<br>' : ''}
        ${DocPrint._esc(client?.email || '')}
      </div>
    </div>
  </div>

  <!-- Bande infos chantier -->
  <div class="chantier-band">
    <div class="ch-item">
      <div class="ch-lbl">Chantier</div>
      <div class="ch-val">${DocPrint._esc(chantier?.nom || '—')}</div>
    </div>
    <div class="ch-item">
      <div class="ch-lbl">Adresse travaux</div>
      <div class="ch-val">${DocPrint._esc(chantier?.adresse || '—')}</div>
    </div>
    ${isFacture && doc.devisNumero ? `
    <div class="ch-item">
      <div class="ch-lbl">Devis de référence</div>
      <div class="ch-val">${DocPrint._esc(doc.devisNumero)}</div>
    </div>` : ''}
  </div>

  ${isFacture && doc.datePaiement ? `<div class="paid-banner">✅ Payée le ${DocPrint._d(doc.datePaiement)}</div>` : ''}

  <!-- Tableau des prestations -->
  <div class="tbl-wrap">
    <table>
      <thead>
        <tr>
          <th>Désignation / Prestation</th>
          <th class="th-c">Qté</th>
          <th class="th-r">Prix unit. HT</th>
          <th class="th-r">Total HT</th>
        </tr>
      </thead>
      <tbody>${lignesHTML}</tbody>
    </table>
  </div>

  <!-- Zone totaux (alignée à droite) -->
  <div class="totaux-wrap">
    <div class="totaux">
      <div class="tot-row">
        <span class="tl">Total HT</span>
        <span class="tv">${DocPrint._n(totalHT)}&nbsp;€</span>
      </div>
      <div class="tot-row">
        <span class="tl">TVA ${tauxTVA}&nbsp;%</span>
        <span class="tv">${DocPrint._n(montantTVA)}&nbsp;€</span>
      </div>
      <div class="tot-row tot-ttc">
        <span class="tl">TOTAL TTC</span>
        <span class="tv">${DocPrint._n(totalTTC)}&nbsp;€</span>
      </div>
    </div>
  </div>

  <!-- Mention TVA légale -->
  <div class="tva-mention">&#9432;&nbsp; ${mentionTVA}</div>

  <!-- Espace pour le footer fixe -->
  <div class="footer-spacer"></div>

</div><!-- /page -->

<!-- Pied de page fixe -->
<div class="footer">
  <div class="footer-grid">
    <div class="footer-main">
      <strong>${DocPrint._esc(piedPage)}</strong><br>
      ${conditions ? DocPrint._esc(conditions) + '<br>' : ''}
      ${mentions   ? DocPrint._esc(mentions)            : ''}
    </div>
    ${config.iban || config.bic ? `
    <div class="footer-iban">
      ${config.iban   ? '<strong>IBAN :</strong> <code>' + DocPrint._esc(config.iban) + '</code><br>' : ''}
      ${config.bic    ? '<strong>BIC :</strong> <code>'  + DocPrint._esc(config.bic)  + '</code>'     : ''}
      ${config.banque ? '<br>' + DocPrint._esc(config.banque) : ''}
    </div>` : ''}
    ${qrDataUrl ? `
    <div class="footer-qr">
      <img src="${qrDataUrl}" width="70" height="70" alt="QR Code contact">
      <div class="qr-legend">Scannez pour<br>nous contacter</div>
    </div>` : ''}
  </div>
</div>

${copyScript}
</body>
</html>`;
  },

  // ── Helpers ───────────────────────────────────────────────
  _d(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  _n(val) {
    return (val || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  _norm(str) {
    return String(str || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w]+/g, ' ')
      .trim()
      .toLowerCase();
  },

  _isHeaderLine(l) {
    return !!(l && (l._header || l.isHeader || l.type === 'header'));
  },

  _isZeroNoiseLine(l) {
    if (!l) return false;
    const total = parseFloat(l.totalClient || l.totalHT || 0);
    const prix = parseFloat(l.prixHT || l.prixUnitaire || l.prix || 0);
    if (total > 0 || prix > 0) return false;
    const designation = DocPrint._norm(l.poste || l.designation || '');
    const unite = DocPrint._norm(l.unite || '');
    if (designation === 'paysagisme') return true;
    if (designation.indexOf('protection chantier') !== -1) return true;
    if (designation.indexOf('preparation chantier exterieur') !== -1) return true;
    return unite === 'forfait' && designation.indexOf(' ') === -1;
  },

  _esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  },
};
