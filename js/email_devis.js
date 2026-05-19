// ============================================================
//  PLAQPRO WEB — Module Email Devis / Factures (EmailJS)
//  js/email_devis.js
// ============================================================

var EmailDevis = {

  // ── Config depuis localStorage ───────────────────────────
  _cfg() {
    return {
      serviceId:  localStorage.getItem('plaqpro_emailjs_service')  || '',
      templateId: localStorage.getItem('plaqpro_emailjs_template') || '',
      publicKey:  localStorage.getItem('plaqpro_emailjs_key')      || '',
    };
  },

  _ready() {
    const c = this._cfg();
    return !!(c.serviceId && c.templateId && c.publicKey && typeof emailjs !== 'undefined');
  },

  _init() {
    const c = this._cfg();
    if (c.publicKey && typeof emailjs !== 'undefined') {
      try { emailjs.init(c.publicKey); } catch(e) {}
    }
  },

  // ── Résumé HTML envoyé dans le corps de l'email ──────────
  _resume(doc, chantier, client, config, isFacture) {
    const type = isFacture ? 'Facture' : 'Devis';
    const lignes = doc.lignes || [];
    const totalHT  = doc.totalHT  || (doc.totaux && doc.totaux.totalHT)  || 0;
    const totalTTC = doc.totalTTC || (doc.totaux && doc.totaux.totalTTC) || 0;
    const tva      = doc.tva      || (doc.totaux && doc.totaux.tva)      || 0.1;
    const fmt = function(v) {
      return (typeof Calculs !== 'undefined' ? Calculs.fmt(v) : parseFloat(v).toFixed(2) + ' €');
    };
    const dateStr = doc.date ? new Date(doc.date).toLocaleDateString('fr-FR') : '—';
    const lignesHtml = lignes.map(function(l) {
      return '<tr>'
        + '<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">' + (l.poste || l.designation || '') + '</td>'
        + '<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right">' + fmt(l.totalClient || l.totalHT || 0) + '</td>'
        + '</tr>';
    }).join('');

    return '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">'
      + '<style>'
      + 'body{font-family:Arial,sans-serif;color:#1f2937;background:#f9fafb;margin:0;padding:20px}'
      + '.card{background:#fff;border-radius:8px;padding:32px;max-width:640px;margin:0 auto;box-shadow:0 1px 4px rgba(0,0,0,.12)}'
      + 'h1{color:#111827;font-size:22px;margin:0 0 4px}'
      + '.meta{color:#6b7280;font-size:14px;margin-bottom:24px}'
      + '.parties{display:flex;gap:32px;margin-bottom:24px}'
      + '.partie h3{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;margin:0 0 6px}'
      + '.partie p{margin:2px 0;font-size:14px}'
      + 'table{width:100%;border-collapse:collapse;margin-bottom:20px}'
      + 'th{background:#f3f4f6;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:.04em}'
      + '.totaux{max-width:280px;margin-left:auto}'
      + '.totaux div{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e5e7eb;font-size:14px}'
      + '.ttc{font-weight:700;font-size:17px;color:#1d4ed8;border-bottom:none!important}'
      + '.footer{margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}'
      + '.badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;background:#dbeafe;color:#1d4ed8}'
      + '</style></head><body>'
      + '<div class="card">'
      + '<h1>' + type + ' ' + (doc.numero || '') + ' <span class="badge">' + (doc.statut || '') + '</span></h1>'
      + '<div class="meta">Date : ' + dateStr + ' · Chantier : ' + (chantier ? chantier.nom : '—') + '</div>'
      + '<div class="parties">'
      + '<div class="partie"><h3>De</h3>'
      + '<p><strong>' + (config.nomEntreprise || '') + '</strong></p>'
      + '<p>' + (config.adresse || '') + '</p>'
      + (config.telephone ? '<p>' + config.telephone + '</p>' : '')
      + (config.email ? '<p>' + config.email + '</p>' : '')
      + (config.siret ? '<p>SIRET : ' + config.siret + '</p>' : '')
      + '</div>'
      + '<div class="partie"><h3>Pour</h3>'
      + '<p><strong>' + (client ? client.nom : '—') + '</strong></p>'
      + (client ? '<p>' + (client.adresse || '') + ' ' + (client.cp || '') + ' ' + (client.ville || '') + '</p>' : '')
      + (client && client.email ? '<p>' + client.email + '</p>' : '')
      + '</div></div>'
      + (lignes.length ? '<table><thead><tr><th>Prestation</th><th style="text-align:right">Montant HT</th></tr></thead><tbody>' + lignesHtml + '</tbody></table>' : '')
      + '<div class="totaux">'
      + '<div><span>Total HT</span><span>' + fmt(totalHT) + '</span></div>'
      + '<div><span>TVA ' + Math.round(tva * 100) + '%</span><span>' + fmt(totalHT * tva) + '</span></div>'
      + '<div class="ttc"><span>TOTAL TTC</span><span>' + fmt(totalTTC) + '</span></div>'
      + '</div>'
      + '<div class="footer">'
      + (isFacture && doc.dateEcheance ? 'Échéance : ' + new Date(doc.dateEcheance).toLocaleDateString('fr-FR') + '<br>' : '')
      + (config.conditionsPaiement ? config.conditionsPaiement + '<br>' : '')
      + (!isFacture && config.piedPageDevis ? config.piedPageDevis : '')
      + (isFacture && config.piedPageFacture ? config.piedPageFacture : '')
      + '</div></div></body></html>';
  },

  // ── Envoi devis ──────────────────────────────────────────
  async envoyerDevis(devisId) {
    const devis = DB.getById(DB.KEYS.devis, devisId);
    if (!devis) { App.toast('Devis introuvable', 'error'); return; }
    const chantier = DB.getChantier(devis.chantierId);
    const client   = chantier ? DB.getClient(chantier.clientId) : null;
    if (!client || !client.email) {
      App.toast('Aucun email renseigné pour ce client', 'error');
      return;
    }
    await EmailDevis._envoyer(devis, chantier, client, DB.getConfig(), false);
  },

  // ── Envoi facture ────────────────────────────────────────
  async envoyerFacture(factureId) {
    const facture = DB.getById(DB.KEYS.factures, factureId);
    if (!facture) { App.toast('Facture introuvable', 'error'); return; }
    const chantier = DB.getChantier(facture.chantierId);
    const client   = chantier ? DB.getClient(chantier.clientId) : null;
    if (!client || !client.email) {
      App.toast('Aucun email renseigné pour ce client', 'error');
      return;
    }
    await EmailDevis._envoyer(facture, chantier, client, DB.getConfig(), true);
  },

  // ── Envoi générique ──────────────────────────────────────
  async _envoyer(doc, chantier, client, config, isFacture) {
    if (!EmailDevis._ready()) {
      App.toast('EmailJS non configuré — allez dans Configuration > Email', 'error');
      return;
    }
    EmailDevis._init();
    const type  = isFacture ? 'Facture' : 'Devis';
    const sujet = type + ' ' + (doc.numero || '') + ' — ' + (config.nomEntreprise || 'PlaqPro+');
    const cfg   = EmailDevis._cfg();

    // Générer lien de signature pour les devis
    var lienSig = '';
    if (!isFacture && doc.id && typeof Signature !== 'undefined') {
      var sigToken = Signature.genererToken(doc.id);
      lienSig = Signature.lienSignature(doc.id, doc.numero || '', sigToken);
    }

    var resume = EmailDevis._resume(doc, chantier, client, config, isFacture);
    if (lienSig) {
      var sigBlock = '<div style="margin-top:28px;padding:20px;background:#eff6ff;border-radius:10px;text-align:center">'
        + '<p style="font-size:15px;color:#1e40af;font-weight:700;margin:0 0 12px">✍️ Signez votre devis en ligne</p>'
        + '<a href="' + lienSig + '" style="display:inline-block;padding:13px 32px;background:#1d4ed8;color:#fff;'
        + 'border-radius:9px;text-decoration:none;font-weight:700;font-size:15px">Signer mon devis</a>'
        + '<p style="font-size:11px;color:#6b7280;margin:10px 0 0">Lien valable 30 jours · Aucun compte requis</p>'
        + '</div>';
      resume = resume.replace('</div></body></html>', sigBlock + '</div></body></html>');
    }

    App.toast('Envoi en cours…', 'info');
    try {
      await emailjs.send(cfg.serviceId, cfg.templateId, {
        to_email:       client.email,
        to_name:        client.nom || '',
        from_name:      config.nomEntreprise || 'PlaqPro+',
        subject:        sujet,
        doc_type:       type,
        doc_numero:     doc.numero || '',
        chantier_nom:   chantier ? chantier.nom : '',
        total_ht:       parseFloat(doc.totalHT || 0).toFixed(2) + ' €',
        total_ttc:      parseFloat(doc.totalTTC || 0).toFixed(2) + ' €',
        lien_signature: lienSig,
        message:        resume,
      });
      if (!isFacture && doc.statut === 'Brouillon') DB.updateDevis(doc.id, { statut: 'Envoyé' });
      if (isFacture  && doc.statut === 'Brouillon') DB.updateFacture(doc.id, { statut: 'Envoyée' });
      App.toast('📧 ' + type + ' ' + (doc.numero || '') + ' envoyé' + (isFacture ? 'e' : '') + ' à ' + client.email + ' !');
    } catch (err) {
      console.error('EmailJS:', err);
      App.toast('Erreur : ' + (err.text || err.message || 'vérifiez votre config EmailJS'), 'error');
    }
  },

  // ── Test depuis la Configuration ─────────────────────────
  async tester() {
    const get = function(id) { return (document.getElementById(id) || {}).value || ''; };
    const serviceId  = get('cfg-ejs-service').trim();
    const templateId = get('cfg-ejs-template').trim();
    const publicKey  = get('cfg-ejs-key').trim();
    const testEmail  = get('cfg-ejs-test-email').trim();
    const res        = document.getElementById('ejs-test-result');

    function setRes(cls, txt) {
      if (!res) return;
      res.style.display = 'block';
      res.className = 'ejs-result ejs-' + cls;
      res.textContent = txt;
    }

    if (!serviceId || !templateId || !publicKey) { setRes('error', 'Remplissez Service ID, Template ID et Public Key.'); return; }
    if (!testEmail) { setRes('error', 'Saisissez un email de test.'); return; }
    if (typeof emailjs === 'undefined') { setRes('error', 'EmailJS CDN non chargé — rechargez la page.'); return; }

    setRes('info', 'Envoi en cours…');
    try {
      emailjs.init(publicKey);
      const config = DB.getConfig();
      await emailjs.send(serviceId, templateId, {
        to_email:     testEmail,
        to_name:      'Test',
        from_name:    config.nomEntreprise || 'PlaqPro+',
        subject:      'Test EmailJS — PlaqPro+',
        doc_type:     'Test',
        doc_numero:   'TEST-001',
        chantier_nom: 'Chantier test',
        total_ht:     '0,00 €',
        total_ttc:    '0,00 €',
        message:      '<p>Email de test PlaqPro+. Si vous recevez ceci, EmailJS est correctement configuré.</p>',
      });
      setRes('ok', '✅ Email envoyé ! Vérifiez ' + testEmail);
      localStorage.setItem('plaqpro_emailjs_service',  serviceId);
      localStorage.setItem('plaqpro_emailjs_template', templateId);
      localStorage.setItem('plaqpro_emailjs_key',      publicKey);
    } catch (err) {
      setRes('error', '❌ ' + (err.text || err.message || JSON.stringify(err)));
    }
  },

  // ── Sauvegarde config email ──────────────────────────────
  sauvegarderConfig() {
    const get = function(id) { return ((document.getElementById(id) || {}).value || '').trim(); };
    localStorage.setItem('plaqpro_emailjs_service',  get('cfg-ejs-service'));
    localStorage.setItem('plaqpro_emailjs_template', get('cfg-ejs-template'));
    localStorage.setItem('plaqpro_emailjs_key',      get('cfg-ejs-key'));
    EmailDevis._init();
    App.toast('Config email enregistrée !');
  },
};

document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('plaqpro_emailjs_key') && typeof emailjs !== 'undefined') {
    EmailDevis._init();
  }
});
