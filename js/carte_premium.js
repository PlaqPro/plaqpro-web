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
      + '<div id="carte-premium-render" style="width:380px;height:240px;background:linear-gradient(135deg,#0d0f14 0%,#0f1629 50%,#0d1b40 100%);border-radius:12px;padding:20px;position:relative;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6);font-family:system-ui,-apple-system,sans-serif;border:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:row;justify-content:space-between;align-items:stretch">'
      + '<div style="position:absolute;top:-50px;left:-40px;width:180px;height:180px;border-radius:50%;background:rgba(79,142,247,0.08);pointer-events:none"></div>'
      + '<div style="position:absolute;bottom:-40px;left:80px;width:140px;height:140px;border-radius:50%;background:rgba(79,142,247,0.04);pointer-events:none"></div>'
      + '<div style="display:flex;flex-direction:column;justify-content:space-between;flex:1;min-width:0;margin-right:16px;position:relative">'
      + '<div>'
      + '<img src="assets/Logo Plaqpro+.png" alt="PlaqPro+" style="height:30px;object-fit:contain;display:block" onerror="this.style.display=\'none\'">'
      + '<div style="font-size:8px;font-weight:700;color:#f59e0b;letter-spacing:.12em;text-transform:uppercase;margin-top:5px">' + plan + ' Member</div>'
      + '<div style="width:24px;height:2px;background:linear-gradient(90deg,#4F8EF7,transparent);margin-top:5px;border-radius:1px"></div>'
      + '</div>'
      + '<div style="font-size:14px;font-weight:800;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:8px 0">' + nom + '</div>'
      + '<div style="display:flex;gap:10px;align-items:flex-end">'
      + '<div><div style="font-size:7px;color:rgba(255,255,255,0.4);letter-spacing:.09em;text-transform:uppercase;margin-bottom:3px">Adherent</div><div style="font-size:10px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px">' + nom + '</div></div>'
      + '<div style="width:1px;background:rgba(255,255,255,0.12);height:26px;flex-shrink:0"></div>'
      + '<div><div style="font-size:7px;color:rgba(255,255,255,0.4);letter-spacing:.09em;text-transform:uppercase;margin-bottom:3px">Statut</div><div style="font-size:10px;font-weight:700;color:#10b981">Actif ' + annee + '</div></div>'
      + '<div style="width:1px;background:rgba(255,255,255,0.12);height:26px;flex-shrink:0"></div>'
      + '<div><div style="font-size:7px;color:rgba(255,255,255,0.4);letter-spacing:.09em;text-transform:uppercase;margin-bottom:3px">ID Membre</div><div style="font-size:10px;font-weight:700;color:#f59e0b">' + id + '</div></div>'
      + '</div></div>'
      + '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0">'
      + '<div id="carte-qr-container" style="background:rgba(255,255,255,0.95);border-radius:8px;padding:5px;text-align:center">'
      + '<canvas id="carte-qr-canvas" width="72" height="72"></canvas>'
      + '<div style="font-size:7px;color:#333;margin-top:2px">Scanner pour verifier</div>'
      + '</div>'
      + '<div style="font-size:8px;color:rgba(255,255,255,0.3);margin-top:6px;text-align:center">Valide 31/12/' + annee + '</div>'
      + (joursRestants !== null ? '<div style="font-size:8px;color:rgba(255,255,255,0.3);margin-top:2px">Pro : ' + joursRestants + 'j restants</div>' : '')
      + '</div></div>'
      + '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">'
      + '<button class="btn btn-primary" onclick="CartePremium.telechargerPDF()">📥 Telecharger PDF</button>'
      + '<button class="btn btn-secondary" onclick="CartePremium.partagerCarte()">📤 Partager</button>'
      + '<button class="btn btn-secondary" onclick="CartePremium.voirVerification()">🔍 Verification</button>'
      + '<button onclick="CartePremium.ajouterWallet(\'apple\')" style="display:inline-flex;align-items:center;gap:6px;padding:9px 16px;background:#000;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">🍎 Apple Wallet</button>'
      + '<button onclick="CartePremium.ajouterWallet(\'google\')" style="display:inline-flex;align-items:center;gap:6px;padding:9px 16px;background:#fff;color:#1a73e8;border:1px solid #dadce0;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">🤖 Google Wallet</button>'
      + '</div>'
      + '<div style="margin-top:10px;padding:10px 14px;background:rgba(79,142,247,0.06);border-radius:var(--radius-sm);font-size:11px;color:var(--text-tertiary);line-height:1.6">'
      + '💡 Presentez cette carte chez nos partenaires fournisseurs pour beneficier de tarifs negocies.<br>'
      + 'Contact partenariat : <a href="mailto:partenaire@aa-tb.fr" style="color:var(--accent)">partenaire@aa-tb.fr</a>'
      + '</div></div>';

    this._carteData = { id, nom, plan, annee, verifyUrl };
    await this._genererQR(verifyUrl);
  },

  async _genererQR(url) {
    const container = document.getElementById('carte-qr-container');
    const canvas = document.getElementById('carte-qr-canvas');
    if (!container) return;
    if (typeof QRCode === 'undefined') {
      await new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        s.crossOrigin = 'anonymous';
        s.onload = resolve;
        s.onerror = resolve;
        document.head.appendChild(s);
      });
    }
    try {
      if (typeof QRCode !== 'undefined') {
        if (canvas) canvas.style.display = 'none';
        const qrDiv = document.createElement('div');
        qrDiv.id = 'carte-qr-div';
        container.insertBefore(qrDiv, canvas);
        new QRCode(qrDiv, {
          text: url,
          width: 72,
          height: 72,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    } catch(e) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,72,72); ctx.fillStyle = '#f59e0b'; ctx.font = '8px sans-serif'; ctx.fillText('QR', 28, 40); }
      }
    }
  },

  telechargerPDF() {
    const carte = document.getElementById('carte-premium-render');
    if (!carte) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Carte PlaqPro+ Premium</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0d0f14;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 40px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    @media print {
      body { background: #0d0f14 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  ${carte.outerHTML}
  <div class="no-print" style="margin-top:24px;display:flex;gap:12px">
    <button onclick="window.print()" style="padding:12px 28px;background:#4F8EF7;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;font-weight:600">
      🖨 Imprimer / Enregistrer PDF
    </button>
    <button onclick="window.close()" style="padding:12px 28px;background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;font-size:15px;cursor:pointer">
      ✕ Fermer
    </button>
  </div>
  <div class="no-print" style="margin-top:16px;font-size:11px;color:rgba(255,255,255,0.3);text-align:center">
    Pour enregistrer en PDF : Imprimer → Destination → Enregistrer au format PDF
  </div>
</body>
</html>`);
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

  ajouterWallet(type) {
    const data = this._carteData;
    if (!data) { App.toast('Chargez la carte d\'abord', 'error'); return; }

    if (type === 'apple') {
      const pkpass = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.fr.plaqproplus.membre',
        serialNumber: data.id,
        teamIdentifier: 'PLAQPRO',
        organizationName: 'PlaqPro+',
        description: 'Carte Adherent PlaqPro+',
        logoText: 'PlaqPro+',
        foregroundColor: 'rgb(240,242,248)',
        backgroundColor: 'rgb(13,15,20)',
        labelColor: 'rgb(136,146,170)',
        storeCard: {
          primaryFields:   [{ key: 'membre',  label: 'ADHERENT', value: data.nom }],
          secondaryFields: [
            { key: 'statut', label: 'STATUT',    value: 'Actif ' + data.annee },
            { key: 'id',     label: 'ID MEMBRE', value: data.id },
          ],
          auxiliaryFields: [{ key: 'plan', label: 'PLAN', value: data.plan }],
          backFields:      [{ key: 'verif', label: 'Verification', value: data.verifyUrl }],
        },
      };
      const blob = new Blob([JSON.stringify(pkpass, null, 2)], { type: 'application/vnd.apple.pkpass' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'carte_premium_plaqpro.pkpass';
      a.click();
      URL.revokeObjectURL(a.href);
      App.toast('Fichier .pkpass telecharge — ouvrez-le sur votre iPhone ✅', 'success');
    } else if (type === 'google') {
      App.toast('Google Wallet — integration complete disponible prochainement 🤖', 'info');
    } else {
      App.toast('Fonctionnalite disponible sur iOS et Android', 'info');
    }
  },

  _carteData: null
};

