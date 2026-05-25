/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Moteur d'alertes contextuelles intelligentes
//  alertes.js
// ============================================================

// ── Règles métier ─────────────────────────────────────────────
const REGLES = [

  // ══ CLOISONS ══════════════════════════════════════════════

  {
    id: 'cl_iso_joint',
    declencheur: (ctx) => ctx.type === 'cloison' && ctx.avecIso,
    titre: '🌀 Isolation détectée',
    message: 'Cloison avec isolation → n\'oubliez pas la bande d\'étanchéité mousse sous les rails pour éviter les ponts acoustiques.',
    refs: ['BAND_ETN'],
    priorite: 'warning',
  },
  {
    id: 'cl_phonique_rondelle',
    declencheur: (ctx) => ctx.type === 'cloison' && (ctx.avecIso || ctx.doublePlaquage),
    titre: '🔵 Cloison phonique',
    message: 'Double plaquage ou isolation → rondelles caoutchouc anti-vibration sous les rails recommandées.',
    refs: ['RONDRON'],
    priorite: 'info',
  },
  {
    id: 'cl_double_vis',
    declencheur: (ctx) => ctx.type === 'cloison' && ctx.doublePlaquage,
    titre: '🔧 Double plaquage',
    message: 'Double plaquage → prévoir des vis TF 3.5×45 pour fixer la 2ème plaque sur la 1ère (pas de TF35).',
    refs: ['VIS_TF35'],
    priorite: 'warning',
  },
  {
    id: 'cl_hauteur_grande',
    declencheur: (ctx) => ctx.type === 'cloison' && ctx.hauteur > 3.0,
    titre: '📏 Grande hauteur détectée (> 3m)',
    message: `Hauteur ${ctx => ctx.hauteur}m → passez au montant M70 ou M98 + entreaxe 40cm obligatoire. Prévoir montants renforcés en tête et pied.`,
    refs: ['PAMON70', 'PAMON98'],
    priorite: 'danger',
    detail: (ctx) => `Hauteur : ${ctx.hauteur}m → montant M${ctx.hauteur > 4 ? '98' : '70'} recommandé`,
  },
  {
    id: 'cl_porte_rail_renfort',
    declencheur: (ctx) => ctx.type === 'cloison' && ctx.nbPortes > 0,
    titre: '🚪 Passage de porte détecté',
    message: 'Porte dans la cloison → rails et montants de renfort autour de l\'huisserie. Prévoir huisserie métallique réglable.',
    refs: ['HUIS_MET', 'PARF48'],
    priorite: 'info',
  },
  {
    id: 'cl_joint_toujours',
    declencheur: (ctx) => ctx.type === 'cloison' && ctx.avecJoint,
    titre: '🪣 Jointage prévu',
    message: 'N\'oubliez pas : enduit de prise en 1ère passe sur les têtes de vis, enduit de finition en 2ème passe. Prévoir papier de verre grain 80 puis 120.',
    refs: ['ENDUIT_PR', 'ENDUIT_F', 'PVERT_80', 'PVERT_120'],
    priorite: 'info',
  },
  {
    id: 'cl_ba13h_humide',
    declencheur: (ctx) => ctx.type === 'cloison' && ctx.plaque === 'H',
    titre: '💧 Plaque hydrofuge BA13H',
    message: 'Plaque hydrofuge → pensez au mastic silicone sanitaire en pied de cloison si zone humide.',
    refs: ['MASTIC_SF'],
    priorite: 'info',
  },
  {
    id: 'cl_corniere_angles',
    declencheur: (ctx) => ctx.type === 'cloison',
    titre: '📐 Ne pas oublier',
    message: 'Angles saillants de cloison → cornières alu de protection. Mastic acrylique en périphérie (sol, mur, plafond).',
    refs: ['CORN_ALU', 'MASTIC_A'],
    priorite: 'memo',
  },

  // ══ PEINTURE ══════════════════════════════════════════════

  {
    id: 'pe_placo_neuf_appret',
    declencheur: (ctx) => ctx.type === 'peinture' && ctx.surPlaconeuf,
    titre: '🎨 Placo neuf détecté',
    message: 'Placo neuf → apprêt Gyproc OBLIGATOIRE avant peinture. Sans apprêt, la peinture ne tient pas et les joints ressortent.',
    refs: ['APPR_GYP'],
    priorite: 'danger',
  },
  {
    id: 'pe_scotch_protection',
    declencheur: (ctx) => ctx.type === 'peinture',
    titre: '🟡 Protection avant peinture',
    message: 'Pensez au ruban de masquage (interrupteurs, plinthes, fenêtres) et aux bâches de protection pour le sol et les meubles.',
    refs: ['SCOTCH_M', 'BACHE_4'],
    priorite: 'memo',
  },
  {
    id: 'pe_sechage_inter_couches',
    declencheur: (ctx) => ctx.type === 'peinture' && ctx.nbCouches >= 2,
    titre: '⏱ Délai séchage entre couches',
    message: `${ctx => ctx.nbCouches} couches prévues → minimum 4h entre chaque couche (12h pour plafond). Prévoir le planning en conséquence.`,
    refs: [],
    priorite: 'warning',
    detail: (ctx) => `${ctx.nbCouches} couches → ${(ctx.nbCouches-1)*4}h minimum de séchage total`,
  },
  {
    id: 'pe_ventilation',
    declencheur: (ctx) => ctx.type === 'peinture',
    titre: '💨 Ventilation obligatoire',
    message: 'Émanations peinture en espace clos → ouvrir les fenêtres pendant et après application. Masque FFP2 si espace confiné.',
    refs: [],
    priorite: 'warning',
  },
  {
    id: 'pe_boiseries_glycero',
    declencheur: (ctx) => ctx.type === 'peinture' && ctx.avecBoiseries,
    titre: '🪵 Boiseries détectées',
    message: 'Boiseries → peinture glycéro ou laque aqua (différente de la peinture murs). Ne pas oublier la sous-couche bois.',
    refs: ['GLYC_SAT', 'AQUA_SAT'],
    priorite: 'info',
  },

  // ══ SOLS ═════════════════════════════════════════════════

  {
    id: 'so_sscouche_parquet',
    declencheur: (ctx) => ctx.type === 'sol' && (ctx.produit === 'parquet' || ctx.produit === 'stratifie'),
    titre: '🪵 Parquet / stratifié',
    message: 'Pose flottante → sous-couche isolante OBLIGATOIRE. Sans elle, bruits de pas amplifiés et garantie fabricant annulée.',
    refs: ['SSCOUCHE'],
    priorite: 'danger',
  },
  {
    id: 'so_plinthe_jonction',
    declencheur: (ctx) => ctx.type === 'sol',
    titre: '📐 Finitions sol',
    message: 'N\'oubliez pas : plinthes (périmètre ÷ 2.4m), profilés de jonction aux passages de portes, quart de rond si sol souple.',
    refs: ['PLINTHE', 'PROF_JON', 'PLINTHE_S'],
    priorite: 'memo',
  },
  {
    id: 'so_ragreage',
    declencheur: (ctx) => ctx.type === 'sol' && ctx.irregulier,
    titre: '📏 Sol irrégulier détecté',
    message: 'Différence de niveau > 3mm → ragréage OBLIGATOIRE avant pose. La pose directe sur sol irrégulier casse les lames.',
    refs: [],
    priorite: 'danger',
  },

  // ══ PORTES ═══════════════════════════════════════════════

  {
    id: 'po_cf_ferme_porte',
    declencheur: (ctx) => ctx.type === 'porte' && ctx.coupeFeu,
    titre: '🔥 Porte coupe-feu',
    message: 'Porte CF → ferme-porte hydraulique OBLIGATOIRE réglementairement. Sans lui, la certification CF est annulée.',
    refs: ['FERME_P'],
    priorite: 'danger',
  },
  {
    id: 'po_cf_3paumelles',
    declencheur: (ctx) => ctx.type === 'porte' && ctx.coupeFeu,
    titre: '🔩 Porte coupe-feu — 3 paumelles',
    message: '3 paumelles OBLIGATOIRES sur porte CF (norme EN 1935). 2 paumelles = non conforme = responsabilité engagée.',
    refs: ['PAUMELLE'],
    priorite: 'danger',
  },
  {
    id: 'po_mousse_calfeutrement',
    declencheur: (ctx) => ctx.type === 'porte',
    titre: '🌀 Calfeutrement huisserie',
    message: 'Tour de l\'huisserie → mousse expansive pour l\'étanchéité air/son. Sur porte CF : joint intumescent obligatoire.',
    refs: ['MOUSSE_EX'],
    priorite: 'info',
  },
  {
    id: 'po_seuil_oublie',
    declencheur: (ctx) => ctx.type === 'porte' && ctx.deuxRevetements,
    titre: '📏 Seuil de porte',
    message: 'Deux revêtements différents de chaque côté → seuil de porte indispensable pour la finition.',
    refs: ['SEUIL'],
    priorite: 'warning',
  },

  // ══ GLOBAL ═══════════════════════════════════════════════

  {
    id: 'gl_epi_toujours',
    declencheur: (ctx) => ctx.type === 'global',
    titre: '🦺 EPI',
    message: 'Casque, gants, lunettes, genouillères — obligatoires sur chantier professionnel. Contrôle possible.',
    refs: [],
    priorite: 'warning',
  },
  {
    id: 'gl_photos',
    declencheur: (ctx) => ctx.type === 'global',
    titre: '📸 Photos avant/après',
    message: 'Photographiez l\'état initial, les saignées, les réseaux cachés, et l\'état final. Indispensable en cas de litige.',
    refs: [],
    priorite: 'memo',
  },
];

// ── Moteur d'alertes ──────────────────────────────────────────
const Alertes = {

  // Évaluer les règles pour un contexte donné
  evaluer(contexte) {
    return REGLES.filter(r => {
      try { return r.declencheur(contexte); }
      catch { return false; }
    }).map(r => ({
      ...r,
      detailCalc: r.detail ? r.detail(contexte) : null,
    }));
  },

  // Afficher les alertes dans un conteneur
  afficher(containerId, contexte, options = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const alertes = this.evaluer(contexte);
    if (!alertes.length) { el.innerHTML = ''; return; }

    // Filtrer par priorité si demandé
    const filtrees = options.priorites
      ? alertes.filter(a => options.priorites.includes(a.priorite))
      : alertes;

    if (!filtrees.length) { el.innerHTML = ''; return; }

    const couleurs = {
      danger:  { bg: 'rgba(247,91,91,0.12)',   border: 'rgba(247,91,91,0.3)',   icon: '🚨', label: 'Obligatoire' },
      warning: { bg: 'rgba(247,166,79,0.12)',  border: 'rgba(247,166,79,0.3)',  icon: '⚠️', label: 'Important' },
      info:    { bg: 'rgba(79,142,247,0.10)',   border: 'rgba(79,142,247,0.25)', icon: '💡', label: 'Info' },
      memo:    { bg: 'rgba(45,212,160,0.08)',   border: 'rgba(45,212,160,0.2)',  icon: '✅', label: 'Ne pas oublier' },
    };

    el.innerHTML = `
      <div style="margin-top:12px">
        <div style="font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">
          ⚡ Alertes automatiques (${filtrees.length})
        </div>
        ${filtrees.map(a => {
          const c = couleurs[a.priorite] || couleurs.info;
          return `
          <div style="display:flex;gap:10px;padding:10px 14px;border-radius:var(--r-md);background:${c.bg};border:1px solid ${c.border};margin-bottom:6px">
            <div style="font-size:18px;flex-shrink:0">${c.icon}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:3px">${a.titre}</div>
              <div style="font-size:12px;color:var(--text-secondary);line-height:1.4">${a.message}</div>
              ${a.detailCalc ? '<div style="font-size:11px;color:var(--accent);margin-top:4px;font-family:var(--font-mono)">→ ' + a.detailCalc + '</div>' : ''}
              ${a.refs.length ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">
                ${a.refs.map(ref => '<span style="font-size:10px;font-family:var(--font-mono);color:var(--accent);background:var(--accent-dim);padding:1px 7px;border-radius:20px;border:1px solid rgba(79,142,247,0.2)">'+ref+'</span>').join('')}
              </div>` : ''}
            </div>
            <span style="flex-shrink:0;font-size:10px;font-weight:700;color:var(--text-tertiary);background:var(--glass-bg);padding:2px 8px;border-radius:20px;border:1px solid var(--glass-border);align-self:flex-start;white-space:nowrap">${c.label}</span>
          </div>`;
        }).join('')}
      </div>`;
  },

  // Toast alerte rapide
  toast(contexte) {
    const alertes = this.evaluer(contexte).filter(a => a.priorite === 'danger' || a.priorite === 'warning');
    if (!alertes.length) return;

    alertes.slice(0, 2).forEach((a, i) => {
      setTimeout(() => {
        const toast = document.createElement('div');
        toast.style.cssText = `
          position: fixed; bottom: ${24 + i * 70}px; right: 24px; z-index: 9999;
          background: ${a.priorite === 'danger' ? 'var(--red)' : 'var(--orange)'};
          color: white; padding: 12px 18px; border-radius: var(--r-lg);
          font-size: 13px; font-weight: 500; box-shadow: var(--shadow-lg);
          max-width: 340px; line-height: 1.4; cursor: pointer;
          animation: fadeInUp 0.3s ease;
        `;
        toast.innerHTML = `<strong>${a.titre}</strong><br><span style="font-size:12px;opacity:.9">${a.message.substring(0, 100)}${a.message.length > 100 ? '…' : ''}</span>`;
        toast.onclick = () => toast.remove();
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '0', 5000);
        setTimeout(() => toast.remove(), 5500);
      }, i * 800);
    });
  },
};

// ── Intégration dans les modales existantes ───────────────────
// Patch PageCloison pour afficher les alertes en temps réel
const _origCloisonPreview = PageCloison?.previewCalc;
if (typeof PageCloison !== 'undefined') {
  PageCloison.previewCalcAvecAlertes = function() {
    if (_origCloisonPreview) _origCloisonPreview.call(this);

    const type    = document.getElementById('cl-type')?.value || '48';
    const hauteur = parseFloat(document.getElementById('cl-haut')?.value) || 0;
    const nbPortes = parseInt(document.getElementById('cl-portes')?.value) || 0;
    const avecIso  = document.getElementById('cl-iso')?.checked || false;
    const doublePlaq = document.getElementById('cl-double')?.checked || false;
    const plaque   = document.getElementById('cl-plaque')?.value || 'S';
    const avecJoint = document.getElementById('cl-joint')?.checked !== false;

    const ctx = {
      type: 'cloison',
      montant: type, hauteur, nbPortes,
      avecIso, doublePlaquage: doublePlaq,
      plaque, avecJoint,
    };

    // Créer le conteneur d'alertes si absent
    let alertContainer = document.getElementById('cl-alertes');
    if (!alertContainer) {
      const prev = document.getElementById('cl-preview');
      if (prev) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'cl-alertes';
        prev.parentNode.insertBefore(alertContainer, prev.nextSibling);
      }
    }

    if (alertContainer) Alertes.afficher('cl-alertes', ctx);
  };

  // Remplacer la méthode
  const _origModal = PageCloison.modalAjouter;
  PageCloison.modalAjouter = function(existant) {
    _origModal.call(this, existant);
    // Patcher les inputs après ouverture modale
    setTimeout(() => {
      ['cl-type','cl-haut','cl-portes','cl-plaque','cl-ea'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => PageCloison.previewCalcAvecAlertes());
      });
      ['cl-iso','cl-double','cl-joint'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => PageCloison.previewCalcAvecAlertes());
      });
      const longEl = document.getElementById('cl-long');
      const hautEl = document.getElementById('cl-haut');
      if (longEl) longEl.addEventListener('input', () => PageCloison.previewCalcAvecAlertes());
      if (hautEl) hautEl.addEventListener('input', () => PageCloison.previewCalcAvecAlertes());
    }, 200);
  };
}

// Patch PagePeinture
const _origPeinturePreview = PagePeinture?.previewCalc;
if (typeof PagePeinture !== 'undefined') {
  PagePeinture.previewCalcAvecAlertes = function() {
    if (_origPeinturePreview) _origPeinturePreview.call(this);

    const surfMurs = parseFloat(document.getElementById('pe-murs')?.value) || 0;
    const nbCouches = parseInt(document.getElementById('pe-couches')?.value) || 2;
    const avecBoiseries = document.getElementById('pe-bois')?.checked || false;

    const ctx = {
      type: 'peinture',
      surfMurs, nbCouches, avecBoiseries,
      surPlaconeuf: true, // par défaut on assume placo neuf
    };

    let alertContainer = document.getElementById('pe-alertes');
    if (!alertContainer) {
      const prev = document.getElementById('pe-preview');
      if (prev) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'pe-alertes';
        prev.parentNode.insertBefore(alertContainer, prev.nextSibling);
      }
    }

    if (alertContainer) Alertes.afficher('pe-alertes', ctx, { priorites: ['danger', 'warning'] });
  };

  const _origModalPeinture = PagePeinture.modalAjouter;
  PagePeinture.modalAjouter = function(existant) {
    _origModalPeinture.call(this, existant);
    setTimeout(() => {
      ['pe-murs','pe-plaf','pe-couches','pe-rend'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => PagePeinture.previewCalcAvecAlertes());
      });
      ['pe-appret','pe-bois'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => PagePeinture.previewCalcAvecAlertes());
      });
    }, 200);
  };
}

// Patch Calcul Express
const _origCalcCompute = Calc?.compute;
if (typeof Calc !== 'undefined' && _origCalcCompute) {
  Calc.computeAvecAlertes = function() {
    _origCalcCompute.call(this);

    const tab = this.currentTab;
    let ctx = { type: tab };

    if (tab === 'cloison') {
      ctx.hauteur    = this.v('cl-hauteur', 2.60);
      ctx.avecIso    = this.checked('cl-iso');
      ctx.doublePlaquage = this.checked('cl-double');
      ctx.avecJoint  = this.checked('cl-joint');
      ctx.nbPortes   = 0;
      ctx.plaque     = 'S';
    } else if (tab === 'peinture') {
      ctx.nbCouches  = this.v('pe-couches', 2);
      ctx.surfMurs   = this.v('pe-murs', 0);
      ctx.avecBoiseries = this.checked('pe-boiseries');
      ctx.surPlaconeuf = true;
    }

    // Conteneur alertes dans le panneau résultats
    let alertContainer = document.getElementById('calc-alertes');
    if (!alertContainer) {
      const resBody = document.getElementById('calc-results-body');
      if (resBody) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'calc-alertes';
        resBody.appendChild(alertContainer);
      }
    }

    if (alertContainer) {
      Alertes.afficher('calc-alertes', ctx, { priorites: ['danger', 'warning'] });
    }
  };

  // Remplacer compute
  Calc.compute = Calc.computeAvecAlertes;
}
