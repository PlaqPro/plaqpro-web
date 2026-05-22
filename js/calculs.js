/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Moteur de calcul métier
//  calculs.js
// ============================================================

const Calculs = {

  // ── Calcul métré d'une pièce ──────────────────────────────
  metrage(longueur, largeur, hauteur) {
    const perimetre  = 2 * (longueur + largeur);
    const surfMurs   = perimetre * hauteur;
    const surfPlafond = longueur * largeur;
    return { perimetre, surfMurs, surfPlafond };
  },

  // ── Calcul besoins cloison ────────────────────────────────
  cloison(hauteur, longueur) {
    const r = DB.getRatios();
    const surface  = hauteur * longueur;
    const rails    = longueur * r.RAILS_ML_PAR_ML_CLOISON;
    const montants = Math.ceil(longueur * r.MONTANTS_PAR_ML) + 1;
    const plaques  = Math.ceil(surface * r.PLAQUES_PAR_M2 * 2 * r.COEFF_PERTE_PLAQUE) + 2;
    const vis      = plaques * r.VIS_PAR_PLAQUE;

    const pRail = DB.getPrixByRef('PARF48') || 1.65;
    const pMont = DB.getPrixByRef('PAMON48') || 2.45;
    const pPlaq = DB.getPrixByRef('BA13S') || 8.50;
    const pVis  = DB.getPrixByRef('VIS_TF35') || 6.90;

    const coutMat = (rails * pRail) + (montants * pMont) + (plaques * pPlaq) + (vis / 500 * pVis);
    const heuresMO = surface * 0.5;
    const coutMO   = heuresMO * r.TAUX_HORAIRE_MO;

    return { surface, rails, montants, plaques, vis, coutMat, coutMO, coutTotal: coutMat + coutMO };
  },

  // ── Calcul besoins joints ─────────────────────────────────
  joints(surfaceM2, finition = 'Q2') {
    const r = DB.getRatios();
    const cle = `HEURES_JOINT_PAR_M2_${finition}`;
    const hParM2 = r[cle] || r.HEURES_JOINT_PAR_M2_Q2 || 0.2;

    const bandes  = surfaceM2 * r.BANDES_PAR_M2_JOINT;
    const enduit  = surfaceM2 * r.ENDUIT_KG_PAR_M2;
    const heures  = surfaceM2 * hParM2;

    const pBande  = DB.getPrixByRef('BANDE_PLA') || 4.20;
    const pEnduit = (DB.getPrixByRef('ENDUIT_F') || 18.50) / 25;

    const coutMat = (bandes * pBande) + (enduit * pEnduit);
    const coutMO  = heures * r.TAUX_HORAIRE_MO;

    return { bandes, enduit, heures, coutMat, coutMO, coutTotal: coutMat + coutMO };
  },

  // ── Calcul peinture ───────────────────────────────────────
  peinture(surfMurs, surfPlafond, nbCouches = 2, refProduit = 'DULUX_BM15') {
    const r = DB.getRatios();
    const produit = DB.getProduitByRef(refProduit);
    const rendement = produit?.rendement || r.PEINTURE_RENDEMENT_DEFAUT || 10;
    const prixL     = produit?.prixHT || DB.getPrixByRef('DULUX_BM15') || 2.80;

    const surfTot = surfMurs + surfPlafond;
    const litres  = (surfTot * nbCouches) / rendement;
    const heures  = surfTot * r.HEURES_PEINTURE_PAR_M2 * nbCouches;

    const coutMat = litres * prixL;
    const coutMO  = heures * r.TAUX_HORAIRE_MO;

    return { litres, heures, coutMat, coutMO, coutTotal: coutMat + coutMO };
  },

  // ── Générer besoins depuis métrages d'un chantier ─────────
  genererBesoins(chantierId) {
    const metrages = DB.getMetragesByChantier(chantierId);
    if (!metrages.length) return null;

    let totalSurfMurs = 0, totalSurfPlaf = 0;

    metrages.forEach(m => {
      const calc = this.metrage(m.longueur, m.largeur, m.hauteur);
      totalSurfMurs  += calc.surfMurs;
      totalSurfPlaf  += calc.surfPlafond;
    });

    // Hypothèse : 40% de la surface murs = cloisons
    const surfCloison = totalSurfMurs * 0.4;
    const longCloison = surfCloison / 2.6; // hauteur moyenne

    const resCloison = this.cloison(2.6, longCloison);
    const resJoints  = this.joints(surfCloison);
    const resPeinture = this.peinture(totalSurfMurs, totalSurfPlaf);

    return {
      surfaces: { murs: totalSurfMurs, plafond: totalSurfPlaf },
      cloison:  resCloison,
      joints:   resJoints,
      peinture: resPeinture,
    };
  },

  // ── Calculer devis complet ────────────────────────────────
  calculerDevis(chantierId, marges = {}) {
    const r = DB.getRatios();
    const mMat = marges.materiaux ?? r.MARGE_MATERIAUX;
    const mMO  = marges.mo       ?? r.MARGE_MO;
    const tva  = marges.tva      ?? r.TVA_TRAVAUX;

    const besoins = this.genererBesoins(chantierId);
    if (!besoins) return null;

    const totMatHT = besoins.cloison.coutMat + besoins.joints.coutMat + besoins.peinture.coutMat;
    const totMOHT  = besoins.cloison.coutMO  + besoins.joints.coutMO  + besoins.peinture.coutMO;

    const totMatFacture = totMatHT * (1 + mMat);
    const totMOFacture  = totMOHT  * (1 + mMO);
    const totalHT       = totMatFacture + totMOFacture;
    const montantTVA    = totalHT * tva;
    const totalTTC      = totalHT + montantTVA;

    return {
      lignes: [
        { poste: 'Cloisons',    baseHT: besoins.cloison.coutMat,  marge: mMat, totalClient: besoins.cloison.coutMat  * (1 + mMat) },
        { poste: 'Joints',      baseHT: besoins.joints.coutMat,   marge: mMat, totalClient: besoins.joints.coutMat   * (1 + mMat) },
        { poste: 'Peinture',    baseHT: besoins.peinture.coutMat, marge: mMat, totalClient: besoins.peinture.coutMat * (1 + mMat) },
        { poste: "Main d'œuvre", baseHT: totMOHT,                 marge: mMO,  totalClient: totMOHT * (1 + mMO) },
      ],
      totaux: { totMatHT, totMOHT, totalHT, montantTVA, totalTTC, tva, mMat, mMO },
      besoins,
    };
  },

  // ── Formatage monétaire ───────────────────────────────────
  fmt(n, decimals = 2) {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n || 0) + ' €';
  },

  fmtN(n, decimals = 2) {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n || 0);
  },
};
