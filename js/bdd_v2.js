/**
 * PlaqPro+ — BDD V2 : MASTER_MATERIAUX, OUVRAGES_TYPES, OUVRAGES_COMPOSITION
 * Chargement depuis données statiques (issues du fichier Excel valide 02/06/2026)
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 */

/* global DB */

const BddV2 = {

  // ── Vérifier si la BDD V2 est chargée ────────────────────
  estChargee() {
    return DB.getAll(DB.KEYS.ouvragesTypes).length > 0;
  },

  // ── Charger toutes les tables V2 en localStorage ─────────
  charger() {
    if (this.estChargee()) return;
    DB.save(DB.KEYS.masterMateriaux,     MASTER_MATERIAUX_DATA);
    DB.save(DB.KEYS.ouvragesTypes,       OUVRAGES_TYPES_DATA);
    DB.save(DB.KEYS.ouvragesComposition, OUVRAGES_COMPOSITION_DATA);
    console.log('[BddV2] Tables V2 chargees :', {
      materiaux:    MASTER_MATERIAUX_DATA.length,
      ouvrages:     OUVRAGES_TYPES_DATA.length,
      composition:  OUVRAGES_COMPOSITION_DATA.length,
    });
  },

  // ── Accès ─────────────────────────────────────────────────
  getMateriau(code) {
    return DB.getAll(DB.KEYS.masterMateriaux).find(m => m.code === code) || null;
  },

  getOuvrage(code) {
    return DB.getAll(DB.KEYS.ouvragesTypes).find(o => o.code === code)
      || OUVRAGES_TYPES_DATA.find(o => o.code === code)
      || null;
  },

  getComposition(codeOuvrage) {
    return DB.getAll(DB.KEYS.ouvragesComposition).filter(c => c.code_ouvrage === codeOuvrage);
  },

  getOuvragesParCorps(corps) {
    return DB.getAll(DB.KEYS.ouvragesTypes).filter(o => o.corps_metier === corps && o.actif);
  },

  getOuvragesParLot(lot) {
    return DB.getAll(DB.KEYS.ouvragesTypes).filter(o => o.lot_devis === lot && o.actif);
  },

  // ── Calcul coût matière d un ouvrage pour 1 unité ────────
  calcCoutMatiere(codeOuvrage) {
    const compo = this.getComposition(codeOuvrage);
    const ouv = this.getOuvrage(codeOuvrage);
    if (!compo.length && ouv && Number.isFinite(ouv.cout_mat)) return ouv.cout_mat;
    return compo.reduce((total, ligne) => {
      const qte   = ligne.quantite_unitaire || 0;
      const perte = ligne.perte || 0;
      const pu    = ligne.pu_ht || 0;
      return total + qte * (1 + perte) * pu;
    }, 0);
  },

  // ── Calcul coût MO d un ouvrage pour 1 unité ─────────────
  calcCoutMO(codeOuvrage) {
    const ouv = this.getOuvrage(codeOuvrage);
    if (!ouv) return 0;
    if (Number.isFinite(ouv.cout_mo)) return ouv.cout_mo;
    return (ouv.temps_mo_unitaire_h || 0) * (ouv.taux_horaire_ht || 0);
  },

  // ── Calcul prix de vente HT pour quantité donnée ─────────
  calcPrixVente(codeOuvrage, quantite) {
    const ouv = this.getOuvrage(codeOuvrage);
    if (!ouv || !quantite) return { coutMat: 0, coutMO: 0, prixVente: 0, gain: 0 };
    const coutMat  = this.calcCoutMatiere(codeOuvrage) * quantite;
    const coutMO   = this.calcCoutMO(codeOuvrage) * quantite;
    const margeMat = Number.isFinite(ouv.marge_materiaux) ? ouv.marge_materiaux : (Number.isFinite(ouv.marge_mat) ? ouv.marge_mat - 1 : 0.3);
    const margeMO  = Number.isFinite(ouv.marge_mo) ? ouv.marge_mo : 0.35;
    const prixVente = coutMat * (1 + margeMat) + coutMO * (1 + margeMO);
    const gain      = prixVente - coutMat - coutMO;
    return { coutMat, coutMO, prixVente, gain };
  },

};

window.BddV2 = BddV2;

// ── Données OUVRAGES_TYPES ────────────────────────────────
const OUVRAGES_TYPES_DATA = [
  { code:'OUV_PARQUET_MASSIF',         corps_metier:'Revetement',   lot_devis:'Lot 07 - Revetement de sol', famille:'Sol',      designation:'Parquet massif pose cloue',             unite:'m²', cout_mat:45, cout_mo:25, marge_materiaux:0.30, marge_mo:0.40, tva:0.10, actif:true },
  { code:'OUV_PARQUET_CONTRECOLLE',    corps_metier:'Revetement',   lot_devis:'Lot 07 - Revetement de sol', famille:'Sol',      designation:'Parquet contrecolle',                   unite:'m²', cout_mat:35, cout_mo:20, marge_materiaux:0.30, marge_mo:0.40, tva:0.10, actif:true },
  { code:'OUV_STRATIFIE',              corps_metier:'Revetement',   lot_devis:'Lot 07 - Revetement de sol', famille:'Sol',      designation:'Sol stratifie pose flottant',           unite:'m²', cout_mat:18, cout_mo:12, marge_materiaux:0.30, marge_mo:0.40, tva:0.10, actif:true },
  { code:'OUV_VINYLE_LVT',             corps_metier:'Revetement',   lot_devis:'Lot 07 - Revetement de sol', famille:'Sol',      designation:'Sol vinyle LVT clipse',                 unite:'m²', cout_mat:22, cout_mo:12, marge_materiaux:0.30, marge_mo:0.40, tva:0.10, actif:true },
  { code:'OUV_CARRELAGE_SOL',          corps_metier:'Revetement',   lot_devis:'Lot 07 - Revetement de sol', famille:'Sol',      designation:'Carrelage sol pose jointoye',           unite:'m²', cout_mat:28, cout_mo:22, marge_materiaux:0.30, marge_mo:0.40, tva:0.10, actif:true },
  { code:'OUV_CARRELAGE_GRAND_FORMAT', corps_metier:'Revetement',   lot_devis:'Lot 07 - Revetement de sol', famille:'Sol',      designation:'Carrelage grand format (> 60cm)',       unite:'m²', cout_mat:38, cout_mo:28, marge_materiaux:0.30, marge_mo:0.40, tva:0.10, actif:true },
  { code:'OUV_BETON_CIRE',             corps_metier:'Revetement',   lot_devis:'Lot 07 - Revetement de sol', famille:'Sol',      designation:'Beton cire sol',                        unite:'m²', cout_mat:55, cout_mo:35, marge_materiaux:0.30, marge_mo:0.40, tva:0.10, actif:true },
  { code:'OUV_MOQUETTE',               corps_metier:'Revetement',   lot_devis:'Lot 07 - Revetement de sol', famille:'Sol',      designation:'Moquette posee',                        unite:'m²', cout_mat:15, cout_mo:10, marge_materiaux:0.30, marge_mo:0.40, tva:0.10, actif:true },
  { code:'OUV_RESINE_SOL',             corps_metier:'Revetement',   lot_devis:'Lot 07 - Revetement de sol', famille:'Sol',      designation:'Resine epoxy sol',                      unite:'m²', cout_mat:45, cout_mo:30, marge_materiaux:0.30, marge_mo:0.40, tva:0.10, actif:true },
  { code:'OUV_PLINTHE_POSE',           corps_metier:'Revetement',   lot_devis:'Lot 07 - Revetement de sol', famille:'Plinthes', designation:'Plinthes posees',                       unite:'ml',  cout_mat:8,  cout_mo:6,  marge_materiaux:0.30, marge_mo:0.40, tva:0.10, actif:true },
  { code:'OUV_CLOISON_BA13_M48',       corps_metier:'Plâtrerie', lot_devis:'Lot 01 - Plâtrerie', famille:'Cloisons',    designation:'Cloison BA13 sur ossature M48',        unite:'m²', temps_mo_unitaire_h:0.65, taux_horaire_ht:45, marge_materiaux:0.30, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_CLOISON_BA13_HYDRO_M48', corps_metier:'Plâtrerie', lot_devis:'Lot 01 - Plâtrerie', famille:'Cloisons',    designation:'Cloison BA13 hydro piece humide M48',  unite:'m²', temps_mo_unitaire_h:0.72, taux_horaire_ht:45, marge_materiaux:0.30, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_DOUBLAGE_LAINE_BA13',    corps_metier:'Plâtrerie', lot_devis:'Lot 01 - Plâtrerie', famille:'Doublage',    designation:'Doublage BA13 + laine minerale',        unite:'m²', temps_mo_unitaire_h:0.58, taux_horaire_ht:45, marge_materiaux:0.30, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_PLAFOND_BA13_SUSPENDU',  corps_metier:'Plâtrerie', lot_devis:'Lot 01 - Plâtrerie', famille:'Plafonds',    designation:'Plafond suspendu BA13',                 unite:'m²', temps_mo_unitaire_h:0.75, taux_horaire_ht:45, marge_materiaux:0.30, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_JOINTS_PLACO',           corps_metier:'Plâtrerie', lot_devis:'Lot 01 - Plâtrerie', famille:'Joints',      designation:'Joints plaques de platre',              unite:'m²', temps_mo_unitaire_h:0.22, taux_horaire_ht:45, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_PEINTURE_IMPRESSION',    corps_metier:'Peinture',     lot_devis:'Lot 02 - Peinture',     famille:'Preparation', designation:'Impression support plaques de platre',  unite:'m²', temps_mo_unitaire_h:0.06, taux_horaire_ht:42, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_PEINTURE_MURS_2_COUCHES',corps_metier:'Peinture',     lot_devis:'Lot 02 - Peinture',     famille:'Murs',        designation:'Peinture murs 2 couches',               unite:'m²', temps_mo_unitaire_h:0.16, taux_horaire_ht:42, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_PEINTURE_PLAFOND_2C',    corps_metier:'Peinture',     lot_devis:'Lot 02 - Peinture',     famille:'Plafonds',    designation:'Peinture plafond 2 couches',            unite:'m²', temps_mo_unitaire_h:0.18, taux_horaire_ht:42, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_ENDUIT_LISSAGE',         corps_metier:'Peinture',     lot_devis:'Lot 02 - Peinture',     famille:'Preparation', designation:'Enduit de lissage murs',                unite:'m²', temps_mo_unitaire_h:0.18, taux_horaire_ht:42, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_PRISE_16A',              corps_metier:'Electricite',  lot_devis:'Lot 03 - Electricite',  famille:'Appareillage',designation:'Prise 16A encastree complete',          unite:'u',  temps_mo_unitaire_h:0.55, taux_horaire_ht:52, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_POINT_LUMINEUX_DCL',     corps_metier:'Electricite',  lot_devis:'Lot 03 - Electricite',  famille:'Eclairage',   designation:'Point lumineux DCL complet',            unite:'u',  temps_mo_unitaire_h:0.65, taux_horaire_ht:52, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_INTERRUPTEUR_SIMPLE',    corps_metier:'Electricite',  lot_devis:'Lot 03 - Electricite',  famille:'Commande',    designation:'Interrupteur simple complet',           unite:'u',  temps_mo_unitaire_h:0.45, taux_horaire_ht:52, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_TABLEAU_13M',            corps_metier:'Electricite',  lot_devis:'Lot 03 - Electricite',  famille:'Tableau',     designation:'Tableau electrique 13 modules',         unite:'u',  temps_mo_unitaire_h:3.50, taux_horaire_ht:52, marge_materiaux:0.22, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_ALIM_PER_16',            corps_metier:'Plomberie',    lot_devis:'Lot 04 - Plomberie',    famille:'Alimentation',designation:'Alimentation PER 16',                  unite:'ml', temps_mo_unitaire_h:0.20, taux_horaire_ht:50, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_EVAC_PVC_40',            corps_metier:'Plomberie',    lot_devis:'Lot 04 - Plomberie',    famille:'Evacuation',  designation:'Evacuation PVC 40',                    unite:'ml', temps_mo_unitaire_h:0.22, taux_horaire_ht:50, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_WC_STANDARD',            corps_metier:'Plomberie',    lot_devis:'Lot 04 - Plomberie',    famille:'Sanitaire',   designation:'Pose WC standard',                     unite:'u',  temps_mo_unitaire_h:2.20, taux_horaire_ht:50, marge_materiaux:0.22, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_RECEVEUR_DOUCHE',        corps_metier:'Plomberie',    lot_devis:'Lot 04 - Plomberie',    famille:'Sanitaire',   designation:'Pose receveur douche extra-plat',       unite:'u',  temps_mo_unitaire_h:3.20, taux_horaire_ht:50, marge_materiaux:0.22, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_MUR_PARPAING_20',        corps_metier:'Maconnerie',   lot_devis:'Lot 05 - Maconnerie',   famille:'Elevation',   designation:'Mur parpaing 20 cm',                   unite:'m²', temps_mo_unitaire_h:0.85, taux_horaire_ht:48, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_DALLE_BETON_12CM',       corps_metier:'Maconnerie',   lot_devis:'Lot 05 - Maconnerie',   famille:'Dalle',       designation:'Dalle beton arme 12 cm',               unite:'m²', temps_mo_unitaire_h:0.45, taux_horaire_ht:48, marge_materiaux:0.22, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_ENDUIT_MONOCOUCHE',      corps_metier:'Maconnerie',   lot_devis:'Lot 05 - Maconnerie',   famille:'Enduit',      designation:'Enduit monocouche facade',              unite:'m²', temps_mo_unitaire_h:0.35, taux_horaire_ht:48, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_CARRELAGE_SOL_60x60',    corps_metier:'Carrelage',    lot_devis:'Lot 06 - Carrelage',    famille:'Sol',         designation:'Carrelage sol 60x60 colle',             unite:'m²', temps_mo_unitaire_h:0.55, taux_horaire_ht:46, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_CARRELAGE_MURAL',        corps_metier:'Carrelage',    lot_devis:'Lot 06 - Carrelage',    famille:'Mur',         designation:'Faience murale collee',                 unite:'m²', temps_mo_unitaire_h:0.65, taux_horaire_ht:46, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_TERRASSE_BETON_DESACTIVE',corps_metier:'Paysagisme',  lot_devis:'Lot 09 - Paysagisme',   famille:'Terrasses',   designation:'Terrasse beton desactive 12 cm',        unite:'m²', temps_mo_unitaire_h:0.55, taux_horaire_ht:48, marge_materiaux:0.22, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_GAZON_ROULEAU',          corps_metier:'Paysagisme',   lot_devis:'Lot 09 - Paysagisme',   famille:'Vegetal',     designation:'Gazon en rouleau pose',                 unite:'m²', temps_mo_unitaire_h:0.14, taux_horaire_ht:42, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_MASSIF_PAILLAGE',        corps_metier:'Paysagisme',   lot_devis:'Lot 09 - Paysagisme',   famille:'Massifs',     designation:'Massif plante avec paillage',           unite:'m²', temps_mo_unitaire_h:0.35, taux_horaire_ht:42, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_BORDURE_JARDIN',         corps_metier:'Paysagisme',   lot_devis:'Lot 09 - Paysagisme',   famille:'Bordures',    designation:'Bordure de jardin posee',               unite:'ml', temps_mo_unitaire_h:0.18, taux_horaire_ht:42, marge_materiaux:0.25, marge_mo:0.35, tva:0.10, actif:true },
  { code:'OUV_CLOTURE_BETON',          designation:'Clôture béton + grillage',       corps_metier:'Paysagisme', unite:'ml', cout_mat:45,  cout_mo:35,  marge_mat:1.3, marge_mo:1.4, actif:true },
  { code:'OUV_CLOTURE_BOIS',           designation:'Clôture bois panneaux',          corps_metier:'Paysagisme', unite:'ml', cout_mat:55,  cout_mo:30,  marge_mat:1.3, marge_mo:1.4, actif:true },
  { code:'OUV_HAIE_PLANTATION',        designation:'Plantation haie arbustive',      corps_metier:'Paysagisme', unite:'ml', cout_mat:25,  cout_mo:20,  marge_mat:1.3, marge_mo:1.4, actif:true },
  { code:'OUV_ALLEE_GRAVIERS',         designation:'Allée graviers sur géotextile',  corps_metier:'Paysagisme', unite:'m²', cout_mat:18,  cout_mo:15,  marge_mat:1.3, marge_mo:1.4, actif:true },
  { code:'OUV_ALLEE_DALLAGE',          designation:'Allée dallage béton',            corps_metier:'Paysagisme', unite:'m²', cout_mat:45,  cout_mo:35,  marge_mat:1.3, marge_mo:1.4, actif:true },
  { code:'OUV_TALUS_ENGAZONNEMENT',    designation:'Talus engazonnement fixation',   corps_metier:'Paysagisme', unite:'m²', cout_mat:12,  cout_mo:18,  marge_mat:1.3, marge_mo:1.4, actif:true },
  { code:'OUV_BASSIN_PREFAB',          designation:'Bassin préfabriqué posé',        corps_metier:'Paysagisme', unite:'u',  cout_mat:380, cout_mo:180, marge_mat:1.3, marge_mo:1.4, actif:true },
  { code:'OUV_POTAGER_CARRE',          designation:'Carré potager bois + terre',     corps_metier:'Paysagisme', unite:'u',  cout_mat:120, cout_mo:80,  marge_mat:1.3, marge_mo:1.4, actif:true },
  { code:'OUV_AIRE_JEUX_SOL',          designation:'Sol aire de jeux copeaux',       corps_metier:'Paysagisme', unite:'m²', cout_mat:22,  cout_mo:15,  marge_mat:1.3, marge_mo:1.4, actif:true },
  { code:'OUV_PARKING_STABILISE',      designation:'Parking stabilisé gravier',      corps_metier:'Paysagisme', unite:'m²', cout_mat:28,  cout_mo:20,  marge_mat:1.3, marge_mo:1.4, actif:true },
  { code:'OUV_TERRASSEMENT_PREP',      designation:'Terrassement préparation sol',   corps_metier:'Paysagisme', unite:'m²', cout_mat:8,   cout_mo:22,  marge_mat:1.3, marge_mo:1.4, actif:true },
];

// ── Données OUVRAGES_COMPOSITION (recettes) ───────────────
const OUVRAGES_COMPOSITION_DATA = [
  { code_ouvrage:'OUV_CLOISON_BA13_M48', code_materiau:'CLO_PLAQUE_BA13_STD',  designation:'Plaque BA13 standard',  quantite_unitaire:0.70, unite:'u/m²',    perte:0.05, pu_ht:6.80 },
  { code_ouvrage:'OUV_CLOISON_BA13_M48', code_materiau:'CLO_RAIL_48',          designation:'Rail 48mm',             quantite_unitaire:0.90, unite:'ml/m²',   perte:0.05, pu_ht:1.20 },
  { code_ouvrage:'OUV_CLOISON_BA13_M48', code_materiau:'CLO_MONTANT_48',       designation:'Montant 48mm',          quantite_unitaire:2.10, unite:'ml/m²',   perte:0.05, pu_ht:1.40 },
  { code_ouvrage:'OUV_CLOISON_BA13_M48', code_materiau:'CLO_VIS_PLACO_25',     designation:'Vis placo 25mm',        quantite_unitaire:0.04, unite:'boite/m²',perte:0.05, pu_ht:4.80 },
  { code_ouvrage:'OUV_CLOISON_BA13_M48', code_materiau:'CLO_ENDUIT_25KG',      designation:'Enduit joint 25kg',     quantite_unitaire:0.014,unite:'sac/m²',  perte:0.05, pu_ht:18.80 },
  { code_ouvrage:'OUV_CLOISON_BA13_HYDRO_M48', code_materiau:'CLO_PLAQUE_BA13_HYDRO', designation:'Plaque BA13 hydro', quantite_unitaire:0.70, unite:'u/m²', perte:0.05, pu_ht:9.20 },
  { code_ouvrage:'OUV_CLOISON_BA13_HYDRO_M48', code_materiau:'CLO_RAIL_48',   designation:'Rail 48mm',             quantite_unitaire:0.90, unite:'ml/m²',   perte:0.05, pu_ht:1.20 },
  { code_ouvrage:'OUV_CLOISON_BA13_HYDRO_M48', code_materiau:'CLO_MONTANT_48',designation:'Montant 48mm',          quantite_unitaire:2.10, unite:'ml/m²',   perte:0.05, pu_ht:1.40 },
  { code_ouvrage:'OUV_DOUBLAGE_LAINE_BA13', code_materiau:'CLO_PLAQUE_BA13_STD', designation:'Plaque BA13',        quantite_unitaire:0.35, unite:'u/m²',    perte:0.05, pu_ht:6.80 },
  { code_ouvrage:'OUV_DOUBLAGE_LAINE_BA13', code_materiau:'CLO_LAINE_100',    designation:'Laine minerale 100mm', quantite_unitaire:1.00, unite:'u/m²',    perte:0.05, pu_ht:8.80 },
  { code_ouvrage:'OUV_DOUBLAGE_LAINE_BA13', code_materiau:'CLO_RAIL_48',      designation:'Rail 48mm',            quantite_unitaire:0.45, unite:'ml/m²',   perte:0.05, pu_ht:1.20 },
  { code_ouvrage:'OUV_DOUBLAGE_LAINE_BA13', code_materiau:'CLO_MONTANT_48',   designation:'Montant 48mm',         quantite_unitaire:1.10, unite:'ml/m²',   perte:0.05, pu_ht:1.40 },
  { code_ouvrage:'OUV_PLAFOND_BA13_SUSPENDU', code_materiau:'CLO_PLAQUE_BA13_STD', designation:'Plaque BA13',     quantite_unitaire:0.35, unite:'u/m²',    perte:0.05, pu_ht:6.80 },
  { code_ouvrage:'OUV_PLAFOND_BA13_SUSPENDU', code_materiau:'CLO_SUSPENTE',   designation:'Suspente metallique', quantite_unitaire:1.20, unite:'u/m²',    perte:0.05, pu_ht:0.45 },
  { code_ouvrage:'OUV_PEINTURE_MURS_2_COUCHES', code_materiau:'PEI_PEINTURE_SATIN_BLANC_10L', designation:'Peinture satin blanc 10L', quantite_unitaire:0.018, unite:'pot/m²', perte:0.03, pu_ht:46.80 },
  { code_ouvrage:'OUV_PEINTURE_PLAFOND_2C', code_materiau:'PEI_PEINTURE_PLAFOND_MAT_10L', designation:'Peinture plafond mat 10L', quantite_unitaire:0.018, unite:'pot/m²', perte:0.03, pu_ht:38.80 },
];

// ── Données MASTER_MATERIAUX (extrait principal) ──────────
const MASTER_MATERIAUX_DATA = [
  { code:'CLO_PLAQUE_BA13_STD',     famille:'Cloisons',   sous_famille:'Plaques',    designation:'Plaque BA13 standard 250x120',       unite:'u',    pu_ht:6.80,  coef_usage:1,    usage:'Cloisons' },
  { code:'CLO_PLAQUE_BA13_HYDRO',   famille:'Cloisons',   sous_famille:'Plaques',    designation:'Plaque BA13 hydro 250x120',           unite:'u',    pu_ht:9.20,  coef_usage:1,    usage:'Salles d eau' },
  { code:'CLO_RAIL_48',             famille:'Cloisons',   sous_famille:'Ossature',   designation:'Rail 48mm',                           unite:'ml',   pu_ht:1.20,  coef_usage:1,    usage:'Ossature cloison' },
  { code:'CLO_MONTANT_48',          famille:'Cloisons',   sous_famille:'Ossature',   designation:'Montant 48mm',                        unite:'ml',   pu_ht:1.40,  coef_usage:1,    usage:'Ossature cloison' },
  { code:'CLO_RAIL_70',             famille:'Cloisons',   sous_famille:'Ossature',   designation:'Rail 70mm',                           unite:'ml',   pu_ht:1.60,  coef_usage:1,    usage:'Cloison acoustique' },
  { code:'CLO_MONTANT_70',          famille:'Cloisons',   sous_famille:'Ossature',   designation:'Montant 70mm',                        unite:'ml',   pu_ht:1.80,  coef_usage:1,    usage:'Cloison acoustique' },
  { code:'CLO_LAINE_45',            famille:'Cloisons',   sous_famille:'Isolation',  designation:'Laine minerale 45mm',                 unite:'u',    pu_ht:4.80,  coef_usage:1,    usage:'Cloisons 48' },
  { code:'CLO_LAINE_70',            famille:'Cloisons',   sous_famille:'Isolation',  designation:'Laine minerale 70mm',                 unite:'u',    pu_ht:6.80,  coef_usage:1,    usage:'Cloisons 70' },
  { code:'CLO_LAINE_100',           famille:'Cloisons',   sous_famille:'Isolation',  designation:'Laine minerale 100mm',                unite:'u',    pu_ht:8.80,  coef_usage:1,    usage:'Cloisons 90' },
  { code:'CLO_VIS_PLACO_25',        famille:'Cloisons',   sous_famille:'Fixations',  designation:'Vis placo 25mm',                      unite:'boite',pu_ht:4.80,  coef_usage:0.02, usage:'Fixation' },
  { code:'CLO_ENDUIT_25KG',         famille:'Cloisons',   sous_famille:'Enduits',    designation:'Enduit a joint 25kg',                 unite:'sac',  pu_ht:18.80, coef_usage:0.05, usage:'Joints' },
  { code:'CLO_SUSPENTE',            famille:'Cloisons',   sous_famille:'Plafonds',   designation:'Suspente metallique',                 unite:'u',    pu_ht:0.45,  coef_usage:4,    usage:'Plafond' },
  { code:'PEI_SOUS_COUCHE_PLAQUE',  famille:'Peinture',   sous_famille:'Preparation',designation:'Sous-couche plaques de platre 10L',   unite:'pot',  pu_ht:29.80, coef_usage:0.05, usage:'Placo' },
  { code:'PEI_PEINTURE_SATIN_BLANC_10L', famille:'Peinture', sous_famille:'Murs',   designation:'Peinture satin blanc 10L',            unite:'pot',  pu_ht:46.80, coef_usage:0.10, usage:'Interieur' },
  { code:'PEI_PEINTURE_PLAFOND_MAT_10L', famille:'Peinture', sous_famille:'Plafonds',designation:'Peinture plafond mat 10L',           unite:'pot',  pu_ht:38.80, coef_usage:0.10, usage:'Plafonds' },
  { code:'MAC_BLC_20',              famille:'Maconnerie', sous_famille:'Blocs beton',designation:'Bloc beton creux 20x20x50',           unite:'u',    pu_ht:1.45,  coef_usage:10,   usage:'Elevation murs' },
  { code:'MAC_CIMENT_35',           famille:'Maconnerie', sous_famille:'Liants',     designation:'Ciment CEM II 35kg',                  unite:'sac',  pu_ht:7.80,  coef_usage:0.02, usage:'Beton' },
  { code:'CAR_CARRELAGE_SOL_INT_60x60', famille:'Carrelage', sous_famille:'Sol interieur', designation:'Carrelage gres cerame 60x60',  unite:'u',    pu_ht:28.80, coef_usage:1,    usage:'Pieces de vie' },
  { code:'CAR_COLLE_CARRELAGE_C2',  famille:'Carrelage',  sous_famille:'Colles',     designation:'Colle carrelage C2 25kg',             unite:'sac',  pu_ht:14.80, coef_usage:0.03, usage:'Haute performance' },
];
