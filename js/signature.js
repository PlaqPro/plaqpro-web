/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Module Signature Électronique
//  js/signature.js
// ============================================================

var Signature = {

  KEY_TOKENS:     'plaqpro_tokens',
  KEY_SIGNATURES: 'plaqpro_signatures',

  // ── Générer un token pour un devis ───────────────────────
  genererToken(devisId) {
    var rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    var token = 'SIG' + Date.now().toString(36).toUpperCase() + rand;
    var tokens = this._getTokens();
    tokens[token] = { devisId: devisId, createdAt: new Date().toISOString(), signed: false };
    localStorage.setItem(this.KEY_TOKENS, JSON.stringify(tokens));
    return token;
  },

  // ── Lien de signature ─────────────────────────────────────
  lienSignature(devisId, devisNumero, token) {
    var base = window.location.origin;
    return base + '/signature.html?devis=' + encodeURIComponent(devisNumero)
      + '&id=' + devisId + '&token=' + token;
  },

  // ── Accesseurs localStorage ───────────────────────────────
  _getTokens() {
    try { return JSON.parse(localStorage.getItem(this.KEY_TOKENS) || '{}'); } catch(e) { return {}; }
  },

  _getSignatures() {
    try { return JSON.parse(localStorage.getItem(this.KEY_SIGNATURES) || '{}'); } catch(e) { return {}; }
  },

  // ── Vérifier si un devis est signé ───────────────────────
  estSigne(devisId) {
    var sigs = this._getSignatures();
    var devis = (typeof DB !== 'undefined') ? DB.getById(DB.KEYS.devis, devisId) : null;
    return Object.values(sigs).find(function(s) {
      return s.signedAt && (s.devisId === devisId || (devis && s.devisNumero === devis.numero));
    }) || null;
  },

  getSignedAt(devisId) {
    var sig = this.estSigne(devisId);
    return sig ? sig.signedAt : null;
  },

  getSignatureImg(devisId) {
    var sig = this.estSigne(devisId);
    return sig ? sig.signatureImg : null;
  },

  // ── Badge HTML ────────────────────────────────────────────
  badgeHtml(devisId) {
    var signedAt = this.getSignedAt(devisId);
    if (!signedAt) return '';
    var d = new Date(signedAt);
    var str = d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;'
      + 'background:rgba(45,212,160,0.15);border:1px solid rgba(45,212,160,0.4);'
      + 'border-radius:999px;font-size:11px;color:#2DD4A0;font-weight:600;white-space:nowrap">'
      + '✍️ Signé le ' + str + '</span>';
  },

  // ── Vérifier nouvelles signatures (polling) ───────────────
  verifierNouvellesSignatures() {
    if (typeof DB === 'undefined' || typeof App === 'undefined') return;
    var sigs = this._getSignatures();
    var changed = false;
    Object.entries(sigs).forEach(function(entry) {
      var token = entry[0], s = entry[1];
      if (!s.signedAt || s.notified) return;
      var devisId = s.devisId;
      if (!devisId) {
        var devis = DB.devis.find(function(d) { return d.numero === s.devisNumero; });
        if (devis) devisId = devis.id;
      }
      if (!devisId) return;
      var devis = DB.getById(DB.KEYS.devis, devisId);
      if (devis && devis.statut !== 'Accepté') {
        DB.updateDevis(devisId, { statut: 'Accepté', signatureToken: token, signedAt: s.signedAt });
        var chantier = DB.getChantier(devis.chantierId);
        var client   = chantier ? DB.getClient(chantier.clientId) : null;
        App.toast('🎉 ' + (client ? client.nom : 'Le client') + ' a signé le devis ' + (devis.numero || '') + ' !');
      }
      sigs[token].notified = true;
      changed = true;
    });
    if (changed) {
      localStorage.setItem(Signature.KEY_SIGNATURES, JSON.stringify(sigs));
      Signature.updateBadgeSidebar();
    }
  },

  // ── Badge rouge sidebar ───────────────────────────────────
  updateBadgeSidebar() {
    var sigs   = this._getSignatures();
    var count  = Object.values(sigs).filter(function(s) { return s.signedAt && !s.notified; }).length;
    var badge  = document.getElementById('sig-sidebar-badge');
    if (!badge) return;
    badge.style.display  = count > 0 ? 'inline-flex' : 'none';
    badge.textContent    = count;
  },

  // ── Demander signature (génère lien + modal) ──────────────
  demanderSignature(devisId) {
    var devis = DB.getById(DB.KEYS.devis, devisId);
    if (!devis) { App.toast('Devis introuvable', 'error'); return; }
    var token = Signature.genererToken(devisId);
    var lien  = Signature.lienSignature(devisId, devis.numero || '', token);

    var d = document.createElement('div');
    d.innerHTML = '<div class="form-group">'
      + '<label class="form-label">Lien de signature pour le client</label>'
      + '<div style="display:flex;gap:8px">'
      + '<input class="form-control" id="sig-link-input" value="' + lien + '" readonly '
      + 'style="font-size:12px;font-family:var(--font-mono);flex:1">'
      + '<button class="btn btn-primary" onclick="Signature._copierLien()">📋 Copier</button>'
      + '</div>'
      + '</div>'
      + '<div style="padding:10px 14px;background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.2);'
      + 'border-radius:var(--radius-md);font-size:12px;color:var(--text-secondary);margin-top:12px">'
      + '💡 Envoyez ce lien à votre client par email ou SMS. Il pourra signer '
      + 'sans créer de compte. La signature sera automatiquement enregistrée '
      + 'et le devis passera en "Accepté".'
      + '</div>'
      + '<div style="margin-top:14px;font-size:12px;color:var(--text-tertiary)">'
      + 'Code de confirmation : <strong style="font-family:var(--font-mono);color:var(--accent)">'
      + Signature._codeDisplay(token) + '</strong>'
      + '</div>';
    App.openModal('✍️ Demander la signature — ' + (devis.numero || ''), d, '');
  },

  _codeDisplay(token) {
    return token.slice(-8).toUpperCase().replace(/(.{4})(.{4})/, '$1-$2');
  },

  _copierLien() {
    var inp = document.getElementById('sig-link-input');
    if (!inp) return;
    inp.select();
    try {
      navigator.clipboard.writeText(inp.value).then(function() {
        App.toast('Lien copié !');
      });
    } catch(e) {
      document.execCommand('copy');
      App.toast('Lien copié !');
    }
  },

  // ── Voir signature ────────────────────────────────────────
  voirSignature(devisId) {
    var sig = Signature.estSigne(devisId);
    if (!sig) { App.toast('Aucune signature trouvée', 'error'); return; }
    var d   = new Date(sig.signedAt);
    var str = d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    var div = document.createElement('div');
    div.innerHTML = '<div style="text-align:center">'
      + '<div style="color:#2DD4A0;font-size:14px;font-weight:600;margin-bottom:12px">✅ Signé le ' + str + '</div>'
      + (sig.signatureImg
        ? '<img src="' + sig.signatureImg + '" style="max-width:100%;border:1px solid var(--border);'
          + 'border-radius:var(--radius-md);background:#fff;padding:8px">'
        : '<div class="text-secondary">Image non disponible</div>')
      + '</div>';
    App.openModal('✍️ Signature électronique', div, '');
  },
};

// ── Polling toutes les 10 s ───────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() { Signature.verifierNouvellesSignatures(); }, 1500);
  setInterval(function() { Signature.verifierNouvellesSignatures(); }, 10000);
});
