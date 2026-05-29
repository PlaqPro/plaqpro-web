/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Gestion de session et protection
//  auth.js — À charger EN PREMIER dans index.html
// ============================================================

const Session = {

  KEY: 'plaqpro_session',

  // Vérifier si une session valide existe
  verifier() {
    try {
      const data = sessionStorage.getItem(this.KEY);
      if (!data) return null;
      const session = JSON.parse(data);
      // Vérifier expiration
      if (new Date() > new Date(session.expiresAt)) {
        this.detruire();
        return null;
      }
      return session;
    } catch { return null; }
  },

  // Détruire la session
  detruire() {
    sessionStorage.removeItem(this.KEY);
  },

  // Déconnexion
  deconnecter() {
    App.modalConfirmDanger({
      titre: 'Se déconnecter ?',
      message: 'Vous allez être déconnecté de PlaqPro+.',
      motConfirm: 'OK',
      onConfirm: () => {
        Auth.detruire();
        window.location.href = 'login.html';
      }
    });
  },

  // Obtenir l'utilisateur courant
  utilisateur() {
    const s = this.verifier();
    return s ? { nom: s.nom, role: s.role, user: s.user } : null;
  },

  // Est-il admin ?
  estAdmin() {
    const s = this.verifier();
    return s?.role === 'admin';
  },
};

// ── Protection : rediriger vers login si pas connecté ────────
(function() {
  const session = Session.verifier();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  // Injection du bandeau utilisateur dans le topbar
  document.addEventListener('DOMContentLoaded', () => {
    const topbarActions = document.querySelector('.topbar-actions');
    if (!topbarActions) return;

    const userBadge = document.createElement('div');
    userBadge.style.cssText = `
      display: flex; align-items: center; gap: 8px;
      padding: 5px 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 9999px;
      font-size: 13px;
      color: var(--text-secondary);
      margin-left: 8px;
    `;
    userBadge.innerHTML = `
      <span style="font-size:16px">${session.role === 'admin' ? '👑' : '👤'}</span>
      <span style="font-weight:600;color:var(--text-primary)">${session.nom}</span>
      <button onclick="Session.deconnecter()" style="
        background:none;border:none;cursor:pointer;
        color:var(--text-tertiary);font-size:13px;
        padding:2px 6px;border-radius:6px;
        transition:color .12s;font-family:var(--font);
      " title="Se déconnecter" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--text-tertiary)'">
        Déconnexion
      </button>
    `;
    topbarActions.appendChild(userBadge);
  });
})();
