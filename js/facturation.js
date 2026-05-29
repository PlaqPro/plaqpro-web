/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Module Facturation
//  facturation.js
// ============================================================

Object.assign(Pages, {

  // ── Liste des factures ────────────────────────────────────
  factures() {
    const factures = DB.factures;
    const div = document.createElement('div');

    const counts = {
      brouillon: factures.filter(f => f.statut === 'Brouillon').length,
      envoyee:   factures.filter(f => f.statut === 'Envoyée').length,
      payee:     factures.filter(f => f.statut === 'Payée').length,
      annulee:   factures.filter(f => f.statut === 'Annulée').length,
    };

    div.innerHTML = `
      <div class="flex justify-between items-center mb-16">
        <div class="nav-tabs" id="fac-tabs">
          <button class="nav-tab active" onclick="Pages.filtrerFactures('', this)">Toutes (${factures.length})</button>
          <button class="nav-tab" onclick="Pages.filtrerFactures('Brouillon', this)">Brouillon (${counts.brouillon})</button>
          <button class="nav-tab" onclick="Pages.filtrerFactures('Envoyée', this)">Envoyées (${counts.envoyee})</button>
          <button class="nav-tab" onclick="Pages.filtrerFactures('Payée', this)">Payées (${counts.payee})</button>
          <button class="nav-tab" onclick="Pages.filtrerFactures('Annulée', this)">Annulées (${counts.annulee})</button>
        </div>
      </div>

      ${factures.length === 0 ? `
        <div class="card">
          <div class="empty-state">
            <div class="empty-state-icon">🧾</div>
            <div class="empty-state-title">Aucune facture</div>
            <div class="empty-state-sub">Convertissez un devis accepté en facture depuis la page Devis</div>
            <button class="btn btn-primary" onclick="App.navigate('devis')">Aller aux devis</button>
          </div>
        </div>
      ` : `
        <div class="card">
          <div class="table-wrap">
            <table id="factures-table">
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Devis lié</th>
                  <th>Client</th>
                  <th>Chantier</th>
                  <th>Date</th>
                  <th>Échéance</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="factures-body">
                ${Pages._renderLignesFactures(factures)}
              </tbody>
            </table>
          </div>
        </div>
      `}
    `;
    return div;
  },

  _renderLignesFactures(factures) {
    return factures.map(f => {
      const chantier = DB.getChantier(f.chantierId);
      const client   = chantier ? DB.getClient(chantier.clientId) : null;
      const enRetard = f.statut !== 'Payée' && f.statut !== 'Annulée'
                    && f.dateEcheance && new Date(f.dateEcheance) < new Date();
      return `
        <tr>
          <td class="font-mono"><strong>${f.numero}</strong></td>
          <td class="font-mono text-sm text-secondary">${f.devisNumero || '—'}</td>
          <td>${client?.nom || '—'}</td>
          <td class="text-secondary text-sm">${chantier?.nom || '—'}</td>
          <td>${App.formatDate(f.date)}</td>
          <td class="${enRetard ? 'text-danger' : ''}">${App.formatDate(f.dateEcheance)}${enRetard ? ' ⚠' : ''}</td>
          <td><strong class="font-mono" ${f.type === 'avoir' ? 'style="color:#ef4444"' : ''}>${f.type === 'avoir' ? '−' : ''}${Calculs.fmt(Math.abs(f.totalTTC))}</strong></td>
          <td>${Pages._badgeFacture(f.statut)}</td>
          <td>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-secondary btn-sm" onclick="Pages.voirFacture(${f.id})">👁 Voir</button>
              ${f.statut !== 'Payée' && f.statut !== 'Annulée'
                ? `<button class="btn btn-primary btn-sm" onclick="Pages.marquerPayee(${f.id})">✅ Payée</button>` : ''}
              <button class="btn btn-secondary btn-sm" onclick="EmailDevis.envoyerFacture(${f.id})">📧</button>
              <button class="btn btn-secondary btn-sm" onclick="DocPrint.apercu('facture',${f.id})">🖨</button>
              <button class="btn btn-secondary btn-sm" onclick="ExcelExport.exporterFacture(${f.id})">📊</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  _badgeFacture(statut) {
    const map = {
      'Brouillon': 'badge-gray',
      'Envoyée':   'badge-blue',
      'Payée':     'badge-green',
      'Annulée':   'badge-red',
      'Avoir':     'badge-red',
    };
    return `<span class="badge ${map[statut] || 'badge-gray'}">${statut}</span>`;
  },

  filtrerFactures(statut, btn) {
    document.querySelectorAll('#fac-tabs .nav-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const list = statut ? DB.factures.filter(f => f.statut === statut) : DB.factures;
    const body = document.getElementById('factures-body');
    if (body) body.innerHTML = Pages._renderLignesFactures(list);
  },

  // ── Logique de création facture (partagée) ────────────────
  _executerCreationFacture(devisId, devis) {
    const date = new Date().toISOString().split('T')[0];
    const ech  = new Date(); ech.setDate(ech.getDate() + 30);
    const facture = DB.addFacture({
      devisId:      devis.id,
      devisNumero:  devis.numero || '',
      chantierId:   devis.chantierId,
      date,
      dateEcheance: ech.toISOString().split('T')[0],
      statut:       'Brouillon',
      lignes:       devis.lignes || [],
      totalHT:      devis.totalHT    || 0,
      totalTTC:     devis.totalTTC   || 0,
      montantTVA:   devis.montantTVA || 0,
      tva:          devis.tva        || 0.1,
      datePaiement: null,
    });
    App.toast(`Facture ${facture.numero} créée !`);
    const devisRef = DB.getById(DB.KEYS.devis, devisId);
    if (devisRef) { devisRef.facture = facture.numero; DB.save(DB.KEYS.devis, DB.devis); }
    App.navigate('factures');
    setTimeout(() => Pages.voirFacture(facture.id), 150);
  },

  // ── Convertir un devis en facture ─────────────────────────
  convertirEnFacture(devisId) {
    const devis = DB.getById(DB.KEYS.devis, devisId);
    if (!devis) { App.toast('Devis introuvable', 'error'); return; }
    if (devis.statut !== 'Accepté') { App.toast('Seuls les devis Acceptés peuvent être facturés', 'error'); return; }

    const existing = DB.factures.find(f => f.devisId === devisId);
    if (existing) {
      App.modalConfirmDanger({
        titre: '⚠️ Facture existante',
        message: `Une facture <strong>${existing.numero}</strong> existe déjà pour ce devis.<br>Créer une nouvelle facture quand même ?`,
        motConfirm: 'CRÉER',
        onConfirm: () => { Pages._executerCreationFacture(devisId, devis); }
      });
      return;
    }

    this._executerCreationFacture(devisId, devis);
  },

  // ── Afficher le détail d'une facture ──────────────────────
  voirFacture(factureId) {
    const facture = DB.getById(DB.KEYS.factures, factureId);
    if (!facture) return;
    const chantier = DB.getChantier(facture.chantierId);
    const client   = chantier ? DB.getClient(chantier.clientId) : null;
    const config   = DB.getConfig();

    App.openModal(
      `Facture ${facture.numero}`,
      Pages._detailFacture(facture, chantier, client, config),
      `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <select class="form-control" style="width:140px"
          onchange="Pages._changerStatutFacture(${factureId}, this.value)">
          ${['Brouillon','Envoyée','Payée','Annulée','Avoir']
            .map(s => `<option ${facture.statut === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        ${facture.statut !== 'Payée' && facture.statut !== 'Annulée' && facture.statut !== 'Avoir'
          ? `<button class="btn btn-primary" onclick="Pages.marquerPayee(${factureId})">✅ Marquer payée</button>` : ''}
        ${facture.statut === 'Avoir'
          ? `<button class="btn btn-secondary" style="color:#ef4444;border-color:rgba(239,68,68,0.3)" onclick="Pages.genererAvoir(${factureId})">📄 Générer l'avoir</button>` : ''}
        <button class="btn btn-primary" onclick="EmailDevis.envoyerFacture(${factureId})">📧 Envoyer au client</button>
        <button class="btn btn-secondary" onclick="DocPrint.apercu('facture',${factureId})">🖨 Imprimer / PDF</button>
        <button class="btn btn-secondary" onclick="ExcelExport.exporterFacture(${factureId})">📊 Excel</button>
        <button class="btn btn-secondary" onclick="Pages.telechargerXMLFacturX(${factureId})" title="Télécharger le fichier XML">🇪🇺 Export XML</button>
        <button class="btn btn-secondary" onclick="Pages.genererAcompte(${factureId})" title="Générer un acompte 30%">💰 Acompte 30%</button>
        <button class="btn btn-secondary" onclick="App.closeModal()">Fermer</button>
      </div>`
    );
  },

  // ── Factur-X 2026 — génération XML ZUGFeRD/EN16931 ────────
  _genererXMLFacturX(facture, client, chantier, config) {
    const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const fmtDate = d => (d || '').replace(/-/g, '');
    const fmtAmt  = n => parseFloat(n || 0).toFixed(2);
    const now     = fmtDate(new Date().toISOString().slice(0, 10));
    const echeance= fmtDate(facture.dateEcheance || '');
    const tvaRate = Math.round((facture.tva || 0.1) * 100);
    const totalHT = parseFloat(facture.totalHT  || 0);
    const montantTVA = parseFloat(facture.montantTVA || totalHT * (facture.tva || 0.1));
    const totalTTC= parseFloat(facture.totalTTC || 0);
    const siretVendeur  = esc(config.siret  || '');
    const siretAcheteur = esc(client?.siret || '');

    const lignesXML = (facture.lignes || []).map((l, i) => `
      <ram:IncludedSupplyChainTradeLineItem>
        <ram:AssociatedDocumentLineDocument>
          <ram:LineID>${i + 1}</ram:LineID>
        </ram:AssociatedDocumentLineDocument>
        <ram:SpecifiedTradeProduct>
          <ram:Name>${esc(l.poste || l.designation || l.nom || 'Prestation')}</ram:Name>
        </ram:SpecifiedTradeProduct>
        <ram:SpecifiedLineTradeAgreement>
          <ram:NetPriceProductTradePrice>
            <ram:ChargeAmount>${fmtAmt(l.baseHT || l.prixHT || l.prixUnitaire || 0)}</ram:ChargeAmount>
          </ram:NetPriceProductTradePrice>
        </ram:SpecifiedLineTradeAgreement>
        <ram:SpecifiedLineTradeDelivery>
          <ram:BilledQuantity unitCode="C62">${parseFloat(l.quantite || 1).toFixed(4)}</ram:BilledQuantity>
        </ram:SpecifiedLineTradeDelivery>
        <ram:SpecifiedLineTradeSettlement>
          <ram:ApplicableTradeTax>
            <ram:TypeCode>VAT</ram:TypeCode>
            <ram:CategoryCode>S</ram:CategoryCode>
            <ram:RateApplicablePercent>${tvaRate}</ram:RateApplicablePercent>
          </ram:ApplicableTradeTax>
          <ram:SpecifiedTradeSettlementLineMonetarySummation>
            <ram:LineTotalAmount>${fmtAmt(l.totalClient || l.totalHT || l.prixUnitaire || 0)}</ram:LineTotalAmount>
          </ram:SpecifiedTradeSettlementLineMonetarySummation>
        </ram:SpecifiedLineTradeSettlement>
      </ram:IncludedSupplyChainTradeLineItem>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice
  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:factur-x.eu:1p0:en16931</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${esc(facture.numero)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${now}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    ${lignesXML}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${esc(config.nomEntreprise || 'Entreprise')}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:LineOne>${esc(config.adresse || '')}</ram:LineOne>
          <ram:CountryID>FR</ram:CountryID>
        </ram:PostalTradeAddress>
        ${config.email ? `<ram:URIUniversalCommunication><ram:URIID schemeID="EM">${esc(config.email)}</ram:URIID></ram:URIUniversalCommunication>` : ''}
        ${siretVendeur ? `<ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${siretVendeur}</ram:ID></ram:SpecifiedLegalOrganization>` : ''}
        ${config.tvaIntra ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${esc(config.tvaIntra)}</ram:ID></ram:SpecifiedTaxRegistration>` : ''}
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${esc(client?.nom || 'Client')}</ram:Name>
        ${client?.adresse ? `<ram:PostalTradeAddress><ram:LineOne>${esc(client.adresse)}</ram:LineOne><ram:CountryID>FR</ram:CountryID></ram:PostalTradeAddress>` : ''}
        ${client?.email ? `<ram:URIUniversalCommunication><ram:URIID schemeID="EM">${esc(client.email)}</ram:URIID></ram:URIUniversalCommunication>` : ''}
        ${siretAcheteur ? `<ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${siretAcheteur}</ram:ID></ram:SpecifiedLegalOrganization>` : ''}
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery/>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradePaymentTerms>
        ${echeance ? `<ram:DueDateDateTime><udt:DateTimeString format="102">${echeance}</udt:DateTimeString></ram:DueDateDateTime>` : ''}
        <ram:Description>${esc(config.conditionsPaiement || 'Paiement à 30 jours')}</ram:Description>
      </ram:SpecifiedTradePaymentTerms>
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${fmtAmt(montantTVA)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${fmtAmt(totalHT)}</ram:BasisAmount>
        <ram:CategoryCode>S</ram:CategoryCode>
        <ram:RateApplicablePercent>${tvaRate}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${fmtAmt(totalHT)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${fmtAmt(totalHT)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">${fmtAmt(montantTVA)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${fmtAmt(totalTTC)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${fmtAmt(facture.statut === 'Payée' ? 0 : totalTTC)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
  },

  telechargerXMLFacturX(factureId) {
    const facture  = DB.getById(DB.KEYS.factures, factureId);
    if (!facture) return;
    const chantier = DB.getChantier(facture.chantierId);
    const client   = chantier ? DB.getClient(chantier.clientId) : null;
    const config   = DB.getConfig();
    const xml      = this._genererXMLFacturX(facture, client, chantier, config);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'facturx_' + facture.numero.replace(/[^a-z0-9]/gi, '_') + '.xml';
    a.click();
    URL.revokeObjectURL(a.href);
    App.toast('Fichier XML téléchargé', 'success');
  },

  _detailFacture(facture, chantier, client, config) {
    const lignes   = facture.lignes  || [];
    const totalHT  = facture.totalHT  || 0;
    const tva      = facture.tva      || 0.1;
    const enRetard = facture.statut !== 'Payée' && facture.statut !== 'Annulée'
                  && facture.dateEcheance && new Date(facture.dateEcheance) < new Date();

    const d = document.createElement('div');
    d.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <div class="text-xs text-tertiary mb-4">ENTREPRISE</div>
          <strong>${config.nomEntreprise}</strong><br>
          <span class="text-secondary text-sm">${config.adresse}</span><br>
          <span class="text-secondary text-sm">${config.telephone} · ${config.email}</span>
          ${config.siret ? `<br><span class="text-secondary text-sm">SIRET : ${config.siret}</span>` : ''}
        </div>
        <div>
          <div class="text-xs text-tertiary mb-4">CLIENT</div>
          <strong>${client?.nom || '—'}</strong><br>
          <span class="text-secondary text-sm">${client?.adresse || ''} ${client?.cp || ''} ${client?.ville || ''}</span>
          ${client?.email ? `<br><span class="text-secondary text-sm">${client.email}</span>` : ''}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;
           background:var(--bg-tertiary);border-radius:var(--radius-md);padding:12px">
        <div><div class="text-xs text-tertiary mb-2">DATE</div><strong>${App.formatDate(facture.date)}</strong></div>
        <div><div class="text-xs text-tertiary mb-2">ÉCHÉANCE</div>
          <strong class="${enRetard ? 'text-danger' : ''}">${App.formatDate(facture.dateEcheance)}${enRetard ? ' ⚠' : ''}</strong>
        </div>
        <div><div class="text-xs text-tertiary mb-2">CHANTIER</div><strong>${chantier?.nom || '—'}</strong></div>
        <div><div class="text-xs text-tertiary mb-2">DEVIS LIÉ</div><strong class="font-mono">${facture.devisNumero || '—'}</strong></div>
      </div>

      ${facture.datePaiement
        ? `<div style="padding:10px 14px;background:rgba(45,212,160,0.1);border:1px solid rgba(45,212,160,0.3);
               border-radius:var(--radius-md);margin-bottom:12px;font-size:13px;color:#2DD4A0">
             ✅ Payée le ${App.formatDate(facture.datePaiement)}</div>`
        : ''}

      <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
        <thead>
          <tr style="background:var(--bg-tertiary)">
            <th style="padding:9px 12px;text-align:left;font-size:11px;color:var(--text-tertiary);text-transform:uppercase">Prestation</th>
            <th style="padding:9px 12px;text-align:right;font-size:11px;color:var(--text-tertiary);text-transform:uppercase">Base HT</th>
            <th style="padding:9px 12px;text-align:right;font-size:11px;color:var(--text-tertiary);text-transform:uppercase">Marge</th>
            <th style="padding:9px 12px;text-align:right;font-size:11px;color:var(--text-tertiary);text-transform:uppercase">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${lignes.map(l => `
            <tr style="border-bottom:0.5px solid var(--border)">
              <td style="padding:9px 12px">${(l.poste || l.designation || '')}</td>
              <td style="padding:9px 12px;text-align:right;font-family:var(--font-mono)">${Calculs.fmt((l.baseHT || l.prixHT || 0))}</td>
              <td style="padding:9px 12px;text-align:right;font-family:var(--font-mono)">${Math.round((l.marge||0)*100)} %</td>
              <td style="padding:9px 12px;text-align:right;font-family:var(--font-mono);font-weight:600;color:var(--accent)">${Calculs.fmt((l.totalClient || l.totalHT || 0))}</td>
            </tr>`).join('')}
        </tbody>
      </table>

      <div style="max-width:360px;margin-left:auto">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border)">
          <span class="text-secondary">Total HT</span>
          <span class="font-mono">${Calculs.fmt(totalHT)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border)">
          ${tva === 0 ? '' : `<span class="text-secondary">TVA ${Math.round(tva*100)}%</span>
          <span class="font-mono">${Calculs.fmt(facture.montantTVA || 0)}</span>`}
        </div>
        <div class="total-row mt-8">
          <span class="total-label">${tva === 0 ? 'NET À PAYER' : 'TOTAL TTC'}</span>
          <span class="total-value">${Calculs.fmt(tva === 0 ? (facture.totalHT || 0) : (facture.totalTTC || 0))}</span>
        </div>
      </div>

    `;
    return d;
  },

  _changerStatutFacture(factureId, statut) {
    const updates = { statut };
    if (statut === 'Payée') {
      const f = DB.getById(DB.KEYS.factures, factureId);
      if (!f?.datePaiement) updates.datePaiement = new Date().toISOString().split('T')[0];
    }
    DB.updateFacture(factureId, updates);
    App.toast(`Statut : ${statut}`);
    App.navigate('factures');
    App.closeModal();
  },

    genererAcompte(factureId) {
      const facture = DB.getById(DB.KEYS.factures, factureId);
      if (!facture) return;
      const chantier = DB.getChantier(facture.chantierId);
      const client   = chantier ? DB.getClient(chantier.clientId) : null;
      const config   = DB.getConfig();
      const montant  = parseFloat(facture.totalHT || 0) * 0.30;
      const montantTTC = montant * (1 + (facture.tva || 0.1));
      const date     = new Date().toLocaleDateString('fr-FR');

      const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
      <title>Acompte — ${facture.numero}</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;margin:0;padding:30px}
        .header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #4F8EF7;margin-bottom:24px}
        .header-title{font-size:22px;font-weight:800;color:#4F8EF7}
        .acompte-box{background:#f0f9ff;border:2px solid #4F8EF7;border-radius:8px;padding:20px;text-align:center;margin:20px 0}
        .acompte-montant{font-size:42px;font-weight:900;color:#4F8EF7}
        table{width:100%;border-collapse:collapse;margin:12px 0}
        td{padding:8px 10px;border-bottom:1px solid #eee;font-size:12px}
        .footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#888}
        @media print{body{padding:15px}}
      </style></head><body>
      <div class="header">
        <div>
          <div class="header-title">💰 Appel d'Acompte — 30%</div>
          <div style="font-size:12px;color:#666">Facture référence : ${facture.numero}</div>
        </div>
        <div style="text-align:right;font-size:12px;color:#666">
          <b>${config.nomEntreprise || ''}</b><br>${config.adresse || ''}<br>
          SIRET : ${config.siret || ''}<br>Date : ${date}
        </div>
      </div>
      <div style="margin-bottom:16px;font-size:13px">
        <b>Client :</b> ${client ? (client.nom || client.societe || '') : ''}<br>
        ${chantier ? '<b>Chantier :</b> ' + chantier.nom : ''}
      </div>
      <div class="acompte-box">
        <div style="font-size:14px;color:#666;margin-bottom:8px">Acompte à la commande (30%)</div>
        <div class="acompte-montant">${montantTTC.toFixed(2)} €</div>
        <div style="font-size:13px;color:#666;margin-top:8px">
          HT : ${montant.toFixed(2)} € — TVA ${Math.round((facture.tva||0.1)*100)}% : ${(montantTTC-montant).toFixed(2)} €
        </div>
      </div>
      <table><tbody>
        <tr><td>Montant total chantier HT</td><td style="text-align:right"><b>${parseFloat(facture.totalHT).toFixed(2)} €</b></td></tr>
        <tr><td>Acompte 30% HT</td><td style="text-align:right"><b>${montant.toFixed(2)} €</b></td></tr>
        <tr><td>TVA ${Math.round((facture.tva||0.1)*100)}%</td><td style="text-align:right">${(montantTTC-montant).toFixed(2)} €</td></tr>
        <tr style="background:#f0f9ff"><td><b>Acompte TTC à régler</b></td><td style="text-align:right"><b>${montantTTC.toFixed(2)} €</b></td></tr>
      </tbody></table>
      <div style="margin-top:16px;font-size:12px;color:#666">
        <b>Règlement :</b> ${config.iban ? 'Virement IBAN : ' + config.iban : 'Chèque à l\'ordre de ' + (config.nomEntreprise||'')}
      </div>
      <div class="footer">
        ${config.nomEntreprise||''} — SIRET ${config.siret||''} — ${config.rcs||''}<br>
        ${config.piedPageFacture||''}
      </div>
      </body></html>`;

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    },

  marquerPayee(factureId) {
    DB.updateFacture(factureId, {
      statut: 'Payée',
      datePaiement: new Date().toISOString().split('T')[0],
    });
    App.toast('Facture marquée comme payée !');
    App.navigate('factures');
    App.closeModal();
  },

  genererAvoir(factureId) {
    const facture = DB.getById(DB.KEYS.factures, factureId);
    if (!facture) { App.toast('Facture introuvable', 'error'); return; }
    const chantier = DB.getChantier(facture.chantierId);
    const client   = chantier ? DB.getClient(chantier.clientId) : null;
    const config   = DB.getConfig();

    const date       = new Date().toISOString().split('T')[0];
    const numeroAvoir = 'AV-' + facture.numero;
    const totalHT    = -(Math.abs(parseFloat(facture.totalHT    || 0)));
    const montantTVA = -(Math.abs(parseFloat(facture.montantTVA || 0)));
    const totalTTC   = -(Math.abs(parseFloat(facture.totalTTC   || 0)));

    const lignesAvoir = (facture.lignes || []).map(l => ({
      ...l,
      baseHT:      -(Math.abs(parseFloat(l.baseHT      || l.prixHT     || 0))),
      totalClient: -(Math.abs(parseFloat(l.totalClient  || l.totalHT   || 0))),
      prixHT:      -(Math.abs(parseFloat(l.prixHT      || l.baseHT     || 0))),
      totalHT:     -(Math.abs(parseFloat(l.totalHT     || l.totalClient || 0))),
    }));

    const existing = DB.factures.find(f => f.type === 'avoir' && f.factureOriginId === factureId);
    if (existing) {
      App.toast('Un avoir existe déjà pour cette facture (' + existing.numero + ')', 'warning');
      this._imprimerAvoir(facture, chantier, client, config, numeroAvoir, totalHT, montantTVA, totalTTC, date, lignesAvoir);
      return;
    }

    const avoir = DB.addFacture({
      devisId:          facture.devisId,
      devisNumero:      facture.devisNumero,
      chantierId:       facture.chantierId,
      date,
      dateEcheance:     date,
      statut:           'Avoir',
      type:             'avoir',
      factureOriginId:  factureId,
      factureOriginNum: facture.numero,
      mention:          'Avoir sur facture N° ' + facture.numero,
      lignes:           lignesAvoir,
      totalHT, montantTVA, totalTTC,
      tva: facture.tva || 0.1,
      datePaiement: null,
    });
    DB.updateFacture(avoir.id, { numero: numeroAvoir });

    this._imprimerAvoir(facture, chantier, client, config, numeroAvoir, totalHT, montantTVA, totalTTC, date, lignesAvoir);
    App.toast('Avoir ' + numeroAvoir + ' créé ✅', 'success');
    App.closeModal();
    App.navigate('factures');
  },

  _imprimerAvoir(facture, chantier, client, config, numeroAvoir, totalHT, montantTVA, totalTTC, date, lignes) {
    const tva = facture.tva || 0.1;
    const dateFmt = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Avoir — ${numeroAvoir}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:13px;background:#0d0f14;color:#f0f2f8;padding:30px}
  @media print{body{background:#0d0f14!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}}
  .header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #ef4444;margin-bottom:20px}
  .header-title{font-size:22px;font-weight:800;color:#ef4444}
  .mention{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px 14px;font-size:13px;color:#ef4444;margin-bottom:18px;font-weight:600}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}
  .partie{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:14px}
  .partie-title{font-size:10px;font-weight:700;text-transform:uppercase;color:#8892AA;margin-bottom:6px;letter-spacing:.06em}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:rgba(239,68,68,.12);color:#ef4444;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em}
  td{padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px;color:#f0f2f8}
  .totaux{max-width:360px;margin-left:auto}
  .t-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px;color:#8892AA}
  .t-final{display:flex;justify-content:space-between;padding:12px 0;font-size:18px;font-weight:800;color:#ef4444}
  .footer-doc{margin-top:28px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08);font-size:10px;color:#4E5770;text-align:center}
  .no-print{margin-top:24px;display:flex;gap:12px}
  .btn-print{padding:12px 24px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:700}
  .btn-close{padding:12px 24px;background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:8px;font-size:14px;cursor:pointer}
</style></head><body>
<div class="header">
  <div><div class="header-title">📄 AVOIR</div><div style="font-size:11px;color:#8892AA;margin-top:4px">N° ${numeroAvoir}</div></div>
  <div style="text-align:right;font-size:11px;color:#8892AA">
    <b style="color:#f0f2f8">${config.nomEntreprise || ''}</b><br>${config.adresse || ''}<br>
    SIRET : ${config.siret || ''}<br>Date : ${dateFmt(date)}
  </div>
</div>
<div class="mention">📌 Avoir sur facture N° ${facture.numero} du ${dateFmt(facture.date)}</div>
<div class="parties">
  <div class="partie"><div class="partie-title">Émetteur</div>
    <b style="color:#f0f2f8">${config.nomEntreprise || ''}</b><br>
    <span style="color:#8892AA">${config.adresse || ''}</span><br>
    ${config.email || ''} · ${config.telephone || ''}</div>
  <div class="partie"><div class="partie-title">Client</div>
    <b style="color:#f0f2f8">${client?.nom || '—'}</b><br>
    <span style="color:#8892AA">${(client?.adresse || '') + ' ' + (client?.cp || '') + ' ' + (client?.ville || '')}</span><br>
    ${client?.email || ''}</div>
</div>
<table>
  <thead><tr><th>Prestation</th><th style="text-align:right">Base HT</th><th style="text-align:right">Marge</th><th style="text-align:right">Montant HT</th></tr></thead>
  <tbody>
    ${(lignes || []).map(l => `<tr>
      <td>${l.poste || l.designation || '—'}</td>
      <td style="text-align:right;font-family:monospace;color:#ef4444">−${Math.abs(l.baseHT || 0).toFixed(2)} €</td>
      <td style="text-align:right;font-family:monospace">${Math.round((l.marge||0)*100)} %</td>
      <td style="text-align:right;font-family:monospace;color:#ef4444;font-weight:700">−${Math.abs(l.totalClient || 0).toFixed(2)} €</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="totaux">
  <div class="t-row"><span>Total HT</span><span style="color:#ef4444">−${Math.abs(totalHT).toFixed(2)} €</span></div>
  ${tva > 0 ? `<div class="t-row"><span>TVA ${Math.round(tva*100)}%</span><span style="color:#ef4444">−${Math.abs(montantTVA).toFixed(2)} €</span></div>` : ''}
  <div class="t-final"><span>TOTAL AVOIR TTC</span><span>−${Math.abs(totalTTC).toFixed(2)} €</span></div>
</div>
<div class="footer-doc">
  ${config.nomEntreprise||''} — SIRET ${config.siret||''} — ${config.rcs||''}<br>
  ${config.piedPageFacture||'Avoir émis conformément à la facturation — PlaqPro+ 2026'}
</div>
<div class="no-print">
  <button class="btn-print" onclick="window.print()">🖨 Imprimer / Enregistrer PDF</button>
  <button class="btn-close" onclick="window.close()">✕ Fermer</button>
</div>
</body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  },

  rapportMensuel() {
    const aujourd_hui = new Date();
    const moisCourant = aujourd_hui.getMonth();
    const anneeCourante = aujourd_hui.getFullYear();
    const nomMois = aujourd_hui.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    const factures = DB.factures || [];
    const devis = DB.devis || [];

    const factureMois = factures.filter(f => {
      if (!f.date) return false;
      const d = new Date(f.date);
      return d.getMonth() === moisCourant && d.getFullYear() === anneeCourante;
    });
    const devisMois = devis.filter(d => {
      if (!d.date) return false;
      const dd = new Date(d.date);
      return dd.getMonth() === moisCourant && dd.getFullYear() === anneeCourante;
    });

    const caMois = factureMois.reduce((s, f) => s + (parseFloat(f.totalHT) || 0), 0);
    const caDevisMois = devisMois.reduce((s, d) => s + (parseFloat(d.totalHT) || 0), 0);
    const facPayees = factureMois.filter(f => f.statut === 'Payée');
    const facImpayes = factures.filter(f => {
      if (f.statut === 'Payée' || f.statut === 'Annulée') return false;
      return new Date(f.dateEcheance) < aujourd_hui;
    });
    const montantImpayes = facImpayes.reduce((s, f) => s + (parseFloat(f.totalHT) || 0), 0);
    const relances = devis.filter(d => {
      if (d.statut !== 'Envoyé') return false;
      const diff = (aujourd_hui - new Date(d.date)) / (1000 * 60 * 60 * 24);
      return diff >= 7;
    });

    const lignesFactures = factureMois.map(f => {
      const chantierF = DB.getChantier(f.chantierId);
      const client = chantierF ? DB.getClient(chantierF.clientId) : null;
      const nomClient = client ? client.nom : '—';
      return `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${f.numero || f.id}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${nomClient}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:right">${(parseFloat(f.totalHT) || 0).toFixed(2)} €</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center">
          <span style="padding:2px 8px;border-radius:99px;font-size:11px;background:${f.statut === 'Payée' ? '#d1fae5;color:#065f46' : f.statut === 'En attente' ? '#fef3c7;color:#92400e' : '#fee2e2;color:#991b1b'}">${f.statut || '—'}</span>
        </td>
      </tr>`;
    }).join('');

    const lignesDevis = devisMois.map(d => {
      const chantierD = DB.getChantier(d.chantierId);
      const client = chantierD ? DB.getClient(chantierD.clientId) : null;
      const nomClient = client ? client.nom : '—';
      return `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${d.numero || d.id}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${nomClient}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:right">${(parseFloat(d.totalHT) || 0).toFixed(2)} €</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center">
          <span style="padding:2px 8px;border-radius:99px;font-size:11px;background:${d.statut === 'Accepté' ? '#d1fae5;color:#065f46' : d.statut === 'Envoyé' ? '#dbeafe;color:#1e40af' : '#f3f4f6;color:#374151'}">${d.statut || '—'}</span>
        </td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Rapport mensuel — ${nomMois}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 13px; color: #111; margin: 0; padding: 24px; }
      h1 { font-size: 20px; margin-bottom: 4px; }
      .subtitle { color: #6b7280; font-size: 12px; margin-bottom: 24px; }
      .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
      .kpi { background: #f9fafb; border-radius: 8px; padding: 14px 18px; border-left: 4px solid #6366f1; }
      .kpi .val { font-size: 22px; font-weight: 700; }
      .kpi .lbl { font-size: 11px; color: #6b7280; margin-top: 2px; }
      .kpi.red { border-left-color: #ef4444; }
      .kpi.green { border-left-color: #10b981; }
      .kpi.amber { border-left-color: #f59e0b; }
      h2 { font-size: 14px; margin: 24px 0 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
      table { width: 100%; border-collapse: collapse; }
      th { padding: 8px 10px; background: #f3f4f6; text-align: left; font-size: 12px; color: #374151; }
      .footer { margin-top: 32px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <h1>Rapport mensuel — ${nomMois}</h1>
    <div class="subtitle">Généré le ${aujourd_hui.toLocaleDateString('fr-FR')} · PlaqPro+</div>

    <div class="kpi-grid">
      <div class="kpi green"><div class="val">${caMois.toFixed(0)} €</div><div class="lbl">CA facturé HT</div></div>
      <div class="kpi"><div class="val">${caDevisMois.toFixed(0)} €</div><div class="lbl">Devis émis HT</div></div>
      <div class="kpi red"><div class="val">${montantImpayes.toFixed(0)} €</div><div class="lbl">Impayés en cours</div></div>
      <div class="kpi amber"><div class="val">${relances.length}</div><div class="lbl">Devis à relancer</div></div>
    </div>

    <h2>Factures du mois (${factureMois.length}) — ${facPayees.length} payée(s)</h2>
    ${factureMois.length ? `<table><thead><tr><th>N°</th><th>Client</th><th style="text-align:right">Total HT</th><th style="text-align:center">Statut</th></tr></thead><tbody>${lignesFactures}</tbody></table>` : '<p style="color:#9ca3af;font-style:italic">Aucune facture ce mois.</p>'}

    <h2>Devis du mois (${devisMois.length})</h2>
    ${devisMois.length ? `<table><thead><tr><th>N°</th><th>Client</th><th style="text-align:right">Total HT</th><th style="text-align:center">Statut</th></tr></thead><tbody>${lignesDevis}</tbody></table>` : '<p style="color:#9ca3af;font-style:italic">Aucun devis ce mois.</p>'}

    <div class="footer">PlaqPro+ · © 2026 Gabriel Khamassi — Rapport généré automatiquement · Ne constitue pas un document comptable officiel.</div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  },
});
