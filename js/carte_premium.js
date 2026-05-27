/**
 * PlaqPro+ — Carte Premium Adherent avec QR Code
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 */

window.CartePremium = {

  genererIdMembre() {
    const existing = localStorage.getItem('plaqpro_membre_id');
    if (existing) return existing;
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    const id = 'PP+' + num;
    localStorage.setItem('plaqpro_membre_id', id);
    return id;
  },

  genererHash(id, nom, annee) {
    const str = id + '|' + nom + '|' + annee + '|PlaqPro2026';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36).toUpperCase().substring(0, 8);
  },

  getVerifyUrl(id, nom, annee) {
    const hash = this.genererHash(id, nom, annee);
    return 'https://plaqpro.github.io/plaqpro-web/verify.html?id=' + encodeURIComponent(id) + '&h=' + hash + '&a=' + annee;
  },

  async afficherDansMonCompte(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const config = (typeof DB !== 'undefined') ? DB.getConfig() : {};
    const user = JSON.parse(sessionStorage.getItem('plaqpro_session') || '{}');
    const nom = config.nomEntreprise || config.nom || config.prenom || user.username || user.nom || 'Mon Entreprise';
    const annee = new Date().getFullYear();
    const id = this.genererIdMembre();
    const plan = localStorage.getItem('plaqpro_plan') || 'Pro';
    const verifyUrl = this.getVerifyUrl(id, nom, annee);
    const proExpire = localStorage.getItem('plaqpro_pro_expire');
    const joursRestants = proExpire ? Math.max(0, Math.ceil((new Date(proExpire) - Date.now()) / 86400000)) : null;

    container.innerHTML = '<div style="margin-bottom:20px">'
      + '<div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">🎫 Ma Carte Adherent PlaqPro+</div>'
      + '<div id="carte-premium-render" style="width:380px;max-width:100%;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:16px;padding:24px;position:relative;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5);font-family:system-ui,-apple-system,sans-serif;border:1px solid rgba(255,255,255,0.1)">'
      + '<div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(79,142,247,0.15);pointer-events:none"></div>'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">'
      + '<img src="assets/Logo Plaqpro+.png" alt="PlaqPro+" style="height:40px;object-fit:contain" onerror="this.style.display=\'none\'">'
      + '<div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:6px 12px;text-align:center">'
      + '<div style="font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:.1em">ADHERENT</div>'
      + '<div style="font-size:13px;font-weight:800;color:#f59e0b">' + plan.toUpperCase() + '</div>'
      + '</div></div>'
      + '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px">Carte PlaqPro+ ' + plan + '</div>'
      + '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:20px">Avantages negocies • Tarifs partenaires • Offres fournisseurs BTP</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px">'
      + '<div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px"><div style="font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:.1em;margin-bottom:4px">ADHERENT</div><div style="font-size:11px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + nom + '</div></div>'
      + '<div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px"><div style="font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:.1em;margin-bottom:4px">STATUT</div><div style="font-size:11px;font-weight:700;color:#10b981">Actif ' + annee + '</div></div>'
      + '<div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px"><div style="font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:.1em;margin-bottom:4px">ID MEMBRE</div><div style="font-size:11px;font-weight:700;color:#f59e0b">' + id + '</div></div>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-end">'
      + '<div style="background:rgba(255,255,255,0.95);border-radius:8px;padding:6px;text-align:center">'
      + '<canvas id="carte-qr-canvas" width="72" height="72"></canvas>'
      + '<div style="font-size:8px;color:#333;margin-top:2px">Scanner pour verifier</div>'
      + '</div>'
      + '<div style="text-align:right">'
      + '<div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:4px">QR unique • Valide jusqu\'au</div>'
      + '<div style="font-size:22px;font-weight:900;color:#f59e0b">31/12/' + annee + '</div>'
      + (joursRestants !== null ? '<div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:4px">Pro : ' + joursRestants + 'j restants</div>' : '')
      + '</div></div></div>'
      + '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">'
      + '<button class="btn btn-primary" onclick="CartePremium.telechargerPDF()">📥 Telecharger PDF</button>'
      + '<button class="btn btn-secondary" onclick="CartePremium.partagerCarte()">📤 Partager</button>'
      + '<button class="btn btn-secondary" onclick="CartePremium.voirVerification()">🔍 Verification</button>'
      + '</div>'
      + '<div style="margin-top:10px;padding:10px 14px;background:rgba(79,142,247,0.06);border-radius:var(--radius-sm);font-size:11px;color:var(--text-tertiary);line-height:1.6">'
      + '💡 Presentez cette carte chez nos partenaires fournisseurs pour beneficier de tarifs negocies.<br>'
      + 'Contact partenariat : <a href="mailto:partenaire@aa-tb.fr" style="color:var(--accent)">partenaire@aa-tb.fr</a>'
      + '</div></div>';

    this._carteData = { id, nom, plan, annee, verifyUrl };
    await this._genererQR(verifyUrl);
  },

  async _genererQR(url) {
    const canvas = document.getElementById('carte-qr-canvas');
    if (!canvas) return;
    if (typeof QRCode === 'undefined') {
      await new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
        s.crossOrigin = 'anonymous';
        s.onload = resolve;
        s.onerror = resolve;
        document.head.appendChild(s);
      });
    }
    try {
      if (typeof QRCode !== 'undefined') {
        await QRCode.toCanvas(canvas, url, { width: 72, margin: 0, color: { dark: '#000000', light: '#ffffff' } });
      }
    } catch(e) {
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.fillStyle = '#333'; ctx.fillRect(0,0,72,72); ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.fillText('QR', 28, 40); }
    }
  },

  telechargerPDF() {
    const carte = document.getElementById('carte-premium-render');
    if (!carte) return;
    const win = window.open('', '_blank');
    win.document.write('<!DOCTYPE html><html><head><title>Carte PlaqPro+</title><style>*{margin:0;padding:0}body{background:#1a1a2e;display:flex;justify-content:center;padding:20px}@media print{.np{display:none}}</style></head><body>' + carte.outerHTML + '<div class="np" style="margin-top:16px;text-align:center"><button onclick="window.print()" style="padding:10px 24px;background:#4F8EF7;color:#fff;border:none;border-radius:8px;cursor:pointer">🖨 Imprimer</button></div></body></html>');
    win.document.close();
  },

  partagerCarte() {
    const data = this._carteData;
    if (!data) return;
    if (navigator.share) {
      navigator.share({ title: 'Carte PlaqPro+', url: data.verifyUrl });
    } else {
      navigator.clipboard?.writeText(data.verifyUrl).then(() => App.toast('Lien copie ✅', 'success'));
    }
  },

  voirVerification() {
    const data = this._carteData;
    if (!data) return;
    const d = document.createElement('div');
    d.innerHTML = '<div style="padding:16px"><p style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">Lien de verification fournisseurs :</p>'
      + '<div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:6px;padding:10px;font-family:monospace;font-size:11px;word-break:break-all;color:var(--accent)">' + data.verifyUrl + '</div>'
      + '<p style="margin-top:8px;font-size:11px;color:var(--text-tertiary)">🔒 Expire le 31/12/' + data.annee + '</p></div>';
    App.openModal('🔍 Lien de verification', d,
      '<button class="btn btn-primary" onclick="navigator.clipboard.writeText(\'' + data.verifyUrl.replace(/'/g,"\\'") + '\').then(()=>App.toast(\'Copie!\',\'success\'))">📋 Copier</button>'
      + '<button class="btn btn-secondary" onclick="App.closeModal()">Fermer</button>'
    );
  },

  _carteData: null
};

