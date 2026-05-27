/**
 * PlaqPro+ — Module Carte Premium Adhérent
 * Génère et affiche la carte membre PlaqPro+ PRO
 */

window.CartePremium = (() => {

  const KEY_ID = 'plaqpro_membre_id';

  // ── Génère (ou récupère) l'ID membre unique ───────────────────
  function genererIdMembre() {
    let id = localStorage.getItem(KEY_ID);
    if (id) return id;
    const an = new Date().getFullYear().toString().slice(-2);
    const rand = Math.floor(10000 + Math.random() * 89999);
    id = 'PP+' + an + '-' + rand;
    localStorage.setItem(KEY_ID, id);
    return id;
  }

  // ── Affiche la carte dans Mon Compte ─────────────────────────
  function afficherDansMonCompte(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const config = (typeof DB !== 'undefined') ? DB.getConfig() : {};
    const user = JSON.parse(sessionStorage.getItem('plaqpro_session') || '{}');
    const nom = config.nom || user.username || 'Adhérent';
    const id = genererIdMembre();
    const annee = new Date().getFullYear();
    const proExpire = localStorage.getItem('plaqpro_pro_expire');
    const joursRestants = proExpire
      ? Math.max(0, Math.ceil((new Date(proExpire) - Date.now()) / 86400000))
      : null;

    container.innerHTML = `
      <div style="background:linear-gradient(135deg,#1a1a2e 0%,#0f3460 60%,#1a1a4e 100%);
        border-radius:16px;padding:20px 24px;border:1px solid rgba(255,255,255,0.12);
        box-shadow:0 8px 32px rgba(0,0,0,0.3);position:relative;overflow:hidden">

        <!-- Motif décoratif -->
        <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;
          border-radius:50%;background:rgba(79,142,247,0.08);pointer-events:none"></div>
        <div style="position:absolute;bottom:-20px;left:40px;width:80px;height:80px;
          border-radius:50%;background:rgba(245,158,11,0.06);pointer-events:none"></div>

        <!-- Header carte -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
          <div>
            <div style="font-size:10px;font-weight:700;color:#f59e0b;letter-spacing:.12em;margin-bottom:4px">
              🎫 CARTE ADHÉRENT
            </div>
            <div style="font-size:22px;font-weight:900;line-height:1">
              <span style="color:#fff">Pla</span><span style="color:#4F8EF7">Q</span><span style="color:#fff">Pro</span><span style="color:#ef4444">+</span>
              <span style="color:#f59e0b;font-size:13px;font-weight:700;margin-left:6px;
                background:rgba(245,158,11,0.15);padding:2px 8px;border-radius:20px;
                border:1px solid rgba(245,158,11,0.3)">PRO</span>
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:3px">
              Avantages négociés · Tarifs partenaires BTP
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px">VALIDITÉ</div>
            <div style="font-size:13px;font-weight:700;color:#10b981">${annee}</div>
            ${joursRestants !== null ? `
            <div style="font-size:10px;color:${joursRestants > 3 ? '#10b981' : '#ef4444'};margin-top:2px">
              ${joursRestants} jour${joursRestants > 1 ? 's' : ''} restant${joursRestants > 1 ? 's' : ''}
            </div>` : ''}
          </div>
        </div>

        <!-- Infos membre -->
        <div style="background:rgba(255,255,255,0.06);border-radius:10px;padding:12px 16px;
          display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:3px;letter-spacing:.06em">ADHÉRENT</div>
            <div style="font-size:15px;font-weight:800;color:#fff">${nom}</div>
            ${config.metier ? `<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px">${config.metier}</div>` : ''}
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:3px;letter-spacing:.06em">ID MEMBRE</div>
            <div style="font-size:14px;font-weight:800;color:#f59e0b;letter-spacing:.04em">${id}</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:11px;color:rgba(255,255,255,0.3)">
            Carte envoyée par courrier sous quinzaine
          </div>
          <a href="mailto:partenaire@aa-tb.fr"
            style="font-size:11px;color:#4F8EF7;text-decoration:none">
            partenaire@aa-tb.fr
          </a>
        </div>
      </div>
    `;
  }

  return { genererIdMembre, afficherDansMonCompte };
})();
