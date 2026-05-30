/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Pack Paysagisme / Amenagement exterieur
//  pack_paysagisme.js
// ============================================================

(function() {
  'use strict';

  const PackPaysagisme = {
    CATALOGUE_VEGETAUX: [],

    RATIOS: {
      tauxHoraire: 35,
      coutMiniPelle: 85,
      coutCamion: 65,
      coefMarge: 1.30,
      coefAlea: 0.05,
    },

    getLots() {
      return [
        this.LOTS.DIAGNOSTIC,
        this.LOTS.ABATTAGE_ARBRE,
        this.LOTS.TERRASSEMENT,
        this.LOTS.MACONNERIE_EXT,
        this.LOTS.DALLE_BETON,
        this.LOTS.BETON_DESACTIVE,
        this.LOTS.PAREMENT,
        this.LOTS.EAU_ARROSAGE,
        this.LOTS.ELECTRICITE_EXT,
        this.LOTS.VEGETALISATION,
        this.LOTS.OUVRAGES_SPECIAUX,
        this.LOTS.NETTOYAGE_FINAL,
      ];
    },

    LOTS: {},
  };

  function n(value, def) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : (def || 0);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function bool(value) {
    return value === true || value === 'true' || value === 1 || value === '1';
  }

  function ratios(options) {
    options = options || {};
    return Object.assign({}, PackPaysagisme.RATIOS, options.ratios || {});
  }

  function money(value) {
    if (window.Calculs && typeof window.Calculs.fmt === 'function') {
      return window.Calculs.fmt(value);
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  function prixCatalogue(ref, fallback) {
    const catalogue = window.CataloguePaysagisme;
    if (catalogue && typeof catalogue.getPrix === 'function') {
      const prix = n(catalogue.getPrix(ref), 0);
      if (prix > 0) return prix;
    }
    return fallback;
  }

  function result(prixFournitures, heuresMO, detail, options) {
    const r = ratios(options);
    const prixMOBrut = heuresMO * r.tauxHoraire;
    const alea = (prixFournitures + prixMOBrut) * r.coefAlea;
    const prixMO = prixMOBrut + alea;
    const prixTotal = (prixFournitures + prixMO) * r.coefMarge;

    detail = detail || [];
    detail.push(`Main d'oeuvre : ${heuresMO.toFixed(2)} h x ${money(r.tauxHoraire)}/h = ${money(prixMOBrut)}`);
    if (r.coefAlea > 0) detail.push(`Alea chantier : ${(r.coefAlea * 100).toFixed(1)} % = ${money(alea)}`);
    detail.push(`Majoration appliquee : x ${r.coefMarge.toFixed(2)}`);

    return {
      prixFournitures: round2(prixFournitures),
      prixMO: round2(prixMO),
      prixTotal: round2(prixTotal),
      detail,
    };
  }

  function round2(value) {
    return Math.round((value || 0) * 100) / 100;
  }

  function lot(config) {
    return config;
  }

  PackPaysagisme.LOTS.DIAGNOSTIC = lot({
    code: 'DIAGNOSTIC',
    nom: 'Diagnostic chantier exterieur',
    icone: '🔎',
    unite: 'forfait',
    description: 'Visite, photos, cotes, diagnostic acces, sol et reseaux visibles.',
    calcPrix(quantite, options) {
      options = options || {};
      const qte = Math.max(1, n(quantite, 1));
      const heures = n(options.heures, 2.5) * qte;
      const frais = n(options.fraisDeplacement, 25) * qte;
      return result(frais, heures, [
        `Forfait diagnostic : ${qte} visite(s)`,
        `Frais de deplacement et prise de cotes : ${money(frais)}`,
      ], options);
    },
  });

  PackPaysagisme.LOTS.ABATTAGE_ARBRE = lot({
    code: 'ABATTAGE_ARBRE',
    nom: 'Abattage arbre',
    icone: '🌲',
    unite: 'u',
    description: 'Abattage par sujet avec hauteur, difficulte, dessouchage et evacuation.',
    calcPrix(quantite, options) {
      options = options || {};
      const qte = Math.max(1, n(quantite, 1));
      const hauteur = Math.max(1, n(options.hauteur, 4));
      const difficulte = clamp(n(options.difficulte, 2), 1, 3);
      const dessouchage = bool(options.dessouchage);
      const evacuation = bool(options.evacuation);
      const prixEvacuationForfait = prixCatalogue('EVAC-VEGETAUX-U', 45);
      const prixEvacuationHauteur = prixCatalogue('EVAC-VEGETAUX-ML', 8);

      const hBase = clamp(1.4 + hauteur * 0.45 + (difficulte - 1) * 1.1, 2, 8);
      const hDessouchage = dessouchage ? 1.5 + difficulte * 0.75 : 0;
      const hEvacuation = evacuation ? 0.75 + hauteur * 0.2 : 0;
      const heures = (hBase + hDessouchage + hEvacuation) * qte;
      const fournitures = (evacuation ? prixEvacuationForfait + hauteur * prixEvacuationHauteur : 0) * qte;

      return result(fournitures, heures, [
        `Sujets : ${qte} u`,
        `Hauteur moyenne : ${hauteur} m`,
        `Difficulte : ${difficulte}/3`,
        `Temps abattage estime : ${hBase.toFixed(2)} h/u`,
        dessouchage ? `Dessouchage inclus : ${hDessouchage.toFixed(2)} h/u` : 'Dessouchage non inclus',
        evacuation ? `Evacuation vegetaux : ${money(fournitures)}` : 'Evacuation non incluse',
      ], options);
    },
  });

  PackPaysagisme.LOTS.TERRASSEMENT = lot({
    code: 'TERRASSEMENT',
    nom: 'Terrassement / decaissement',
    icone: '🚜',
    unite: 'm3',
    description: 'Decaissement avec mini-pelle selon volume, type de sol et pente.',
    calcPrix(quantite, options) {
      options = options || {};
      const r = ratios(options);
      const volume = Math.max(0, n(quantite, n(options.volume, 1)));
      const typeSol = options.typeSol || 'meuble';
      const pente = Math.max(0, n(options.pente, 0));
      const hParM3 = { meuble: 0.5, argileux: 1, pierreux: 2 }[typeSol] || 0.75;
      const coefPente = 1 + Math.min(pente, 30) / 100;
      const heures = volume * hParM3 * coefPente;
      const joursMateriel = Math.max(0.5, heures / 7);
      const fournitures = joursMateriel * (r.coutMiniPelle + r.coutCamion);

      return result(fournitures, heures, [
        `Volume decaisse : ${volume.toFixed(2)} m3`,
        `Sol ${typeSol} : ${hParM3.toFixed(2)} h/m3`,
        `Pente : ${pente.toFixed(1)} % (coef ${coefPente.toFixed(2)})`,
        `Mini-pelle + camion : ${joursMateriel.toFixed(2)} j = ${money(fournitures)}`,
      ], options);
    },
  });

  PackPaysagisme.LOTS.MACONNERIE_EXT = lot({
    code: 'MACONNERIE_EXT',
    nom: 'Maconnerie exterieure',
    icone: '🧱',
    unite: 'm2',
    description: 'Murs, murets et bacs avec options enduit et couvertines.',
    calcPrix(quantite, options) {
      options = options || {};
      const surface = Math.max(0, n(quantite, n(options.surface, 1)));
      const type = options.type || 'mur';
      const enduit = bool(options.enduit);
      const couvertine = Math.max(0, n(options.couvertine, 0));
      const hParM2 = type === 'bac' ? 3 : (type === 'muret' ? 1.8 : 1.5);
      const heures = surface * hParM2 + (enduit ? surface * 0.6 : 0) + couvertine * 0.35;
      const prixBaseM2 = type === 'bac' ? prixCatalogue('BAC-MACONNERIE-M2', 78) : (type === 'muret' ? prixCatalogue('MURET-M2', 58) : prixCatalogue('MUR-M2', 52));
      const prixEnduitM2 = prixCatalogue('ENDUIT-EXT-M2', 18);
      const prixCouvertineMl = prixCatalogue('COUVERTINE-ML', 28);
      const fournitures = surface * prixBaseM2 + (enduit ? surface * prixEnduitM2 : 0) + couvertine * prixCouvertineMl;

      return result(fournitures, heures, [
        `Surface : ${surface.toFixed(2)} m2`,
        `Type : ${type} (${hParM2.toFixed(2)} h/m2)`,
        enduit ? `Enduit exterieur : ${surface.toFixed(2)} m2` : 'Enduit non inclus',
        couvertine > 0 ? `Couvertines : ${couvertine.toFixed(2)} ml` : 'Couvertines non incluses',
      ], options);
    },
  });

  PackPaysagisme.LOTS.DALLE_BETON = lot({
    code: 'DALLE_BETON',
    nom: 'Dalle beton',
    icone: '⬜',
    unite: 'm2',
    description: 'Dalle standard, desactivee ou talochee avec epaisseur parametree.',
    calcPrix(quantite, options) {
      options = options || {};
      const surface = Math.max(0, n(quantite, n(options.surface, 1)));
      const epaisseurCm = Math.max(5, n(options.epaisseur, 12));
      const type = options.type || 'standard';
      const volume = surface * (epaisseurCm / 100);
      const hParM2 = type === 'desactive' ? 1.5 : (type === 'taloche' ? 1.15 : 1);
      const heures = surface * hParM2;
      const prixBetonM3 = type === 'desactive' ? prixCatalogue('BETON-DESACTIVE-M3', 185) : prixCatalogue('BETON-STANDARD-M3', 145);
      const prixTreillisM2 = prixCatalogue('TREILLIS-COFFRAGE-M2', 12);
      const finition = type === 'desactive' ? surface * prixCatalogue('DESACTIVANT-M2', 9) : (type === 'taloche' ? surface * prixCatalogue('FINITION-TALOCHE-M2', 4) : 0);
      const fournitures = volume * prixBetonM3 + surface * prixTreillisM2 + finition;

      return result(fournitures, heures, [
        `Surface : ${surface.toFixed(2)} m2`,
        `Epaisseur : ${epaisseurCm.toFixed(1)} cm (${volume.toFixed(2)} m3)`,
        `Type : ${type} (${hParM2.toFixed(2)} h/m2)`,
        `Beton + treillis + coffrage/finition : ${money(fournitures)}`,
      ], options);
    },
  });

  PackPaysagisme.LOTS.BETON_DESACTIVE = lot({
    code: 'BETON_DESACTIVE',
    nom: 'Beton desactive',
    icone: '🟫',
    unite: 'm2',
    description: 'Beton desactive pour allee, terrasse ou descente de garage.',
    calcPrix(quantite, options) {
      options = options || {};
      const surface = Math.max(0, n(quantite, n(options.surface, 1)));
      const epaisseurCm = Math.max(8, n(options.epaisseur, 12));
      const pente = Math.max(0, n(options.pente, 0));
      const risqueMeteo = bool(options.risqueMeteo);
      const volume = surface * (epaisseurCm / 100);
      const coefPente = 1 + Math.min(pente, 25) / 100;
      const heures = surface * 1.5 * coefPente + (risqueMeteo ? surface * 0.15 : 0);
      const fournitures = volume * prixCatalogue('BETON-DESACTIVE-M3', 190) + surface * prixCatalogue('DESACTIVANT-M2', 18) + (risqueMeteo ? surface * prixCatalogue('PROTECTION-METEO-M2', 3.5) : 0);

      return result(fournitures, heures, [
        `Surface : ${surface.toFixed(2)} m2`,
        `Epaisseur : ${epaisseurCm.toFixed(1)} cm (${volume.toFixed(2)} m3)`,
        `Pente : ${pente.toFixed(1)} % (coef ${coefPente.toFixed(2)})`,
        risqueMeteo ? 'Risque meteo inclus : protection / alea lavage' : 'Risque meteo non majore',
      ], options);
    },
  });

  PackPaysagisme.LOTS.PAREMENT = lot({
    code: 'PAREMENT',
    nom: 'Parement exterieur',
    icone: '🪨',
    unite: 'm2',
    description: 'Parement ardoise, pierre ou plaquettes avec angles et chutes.',
    calcPrix(quantite, options) {
      options = options || {};
      const surface = Math.max(0, n(quantite, n(options.surface, 1)));
      const materiau = options.materiau || 'ardoise';
      const angles = Math.max(0, n(options.angles, 0));
      const chutesPct = Math.max(0, n(options.chutes, 10));
      const prixM2 = {
        ardoise: prixCatalogue('ARDOISE-M2', 85),
        pierre: prixCatalogue('PIERRE-RECONST-M2', 45),
        plaquettes: prixCatalogue('PLAQUETTES-M2', 48),
      }[materiau] || prixCatalogue('PAREMENT-M2', 60);
      const hBase = materiau === 'ardoise' ? 3.5 : (materiau === 'pierre' ? 4 : 3);
      const hParM2 = clamp(hBase + angles * 0.15 + chutesPct / 50, 3, 5);
      const heures = surface * hParM2;
      const surfaceAchetee = surface * (1 + chutesPct / 100);
      const fournitures = surfaceAchetee * prixM2 + angles * prixCatalogue('ANGLE-PAREMENT-U', 18) + surface * prixCatalogue('COLLE-PAREMENT-M2', 9);

      return result(fournitures, heures, [
        `Surface posee : ${surface.toFixed(2)} m2`,
        `Materiau : ${materiau} (${money(prixM2)}/m2)`,
        `Angles : ${angles} u`,
        `Chutes : ${chutesPct.toFixed(1)} % soit ${surfaceAchetee.toFixed(2)} m2 achetes`,
        `Temps estime : ${hParM2.toFixed(2)} h/m2`,
      ], options);
    },
  });

  PackPaysagisme.LOTS.EAU_ARROSAGE = lot({
    code: 'EAU_ARROSAGE',
    nom: 'Eau et arrosage',
    icone: '💧',
    unite: 'forfait',
    description: 'Point d eau exterieur et reseau simple avec option programmateur.',
    calcPrix(quantite, options) {
      options = options || {};
      const qte = Math.max(1, n(quantite, 1));
      const longueur = Math.max(0, n(options.longueurReseau, 10));
      const programmateur = bool(options.programmateur);
      const heures = qte * 2.5 + longueur * 0.12 + (programmateur ? 0.6 : 0);
      const fournitures = qte * prixCatalogue('ROBINET-EXT-U', 95) + longueur * prixCatalogue('TUYAU-PE-ML', 4.5) + (programmateur ? prixCatalogue('PROGRAMMATEUR-U', 75) : 0);

      return result(fournitures, heures, [
        `Point(s) d'eau : ${qte}`,
        `Longueur reseau : ${longueur.toFixed(2)} ml`,
        programmateur ? 'Programmateur inclus' : 'Programmateur non inclus',
      ], options);
    },
  });

  PackPaysagisme.LOTS.ELECTRICITE_EXT = lot({
    code: 'ELECTRICITE_EXT',
    nom: 'Electricite exterieure - gaines et attentes',
    icone: '⚡',
    unite: 'forfait',
    description: 'Gaines et attentes uniquement, habilitation electricien sous-traitee.',
    calcPrix(quantite, options) {
      options = options || {};
      const qte = Math.max(1, n(quantite, 1));
      const longueur = Math.max(0, n(options.longueurGaines, 10));
      const sousTraitance = n(options.sousTraitance, 0);
      const heures = qte * 1.2 + longueur * 0.08;
      const fournitures = longueur * prixCatalogue('GAINE-ELEC-ML', 3.8) + qte * prixCatalogue('BOITE-ATTENTE-U', 28) + sousTraitance;

      return result(fournitures, heures, [
        `Forfait attentes : ${qte}`,
        `Longueur gaines : ${longueur.toFixed(2)} ml`,
        `Sous-traitance electricien : ${money(sousTraitance)}`,
        'Note : raccordement et mise en service reserves a un electricien habilite.',
      ], options);
    },
  });

  PackPaysagisme.LOTS.VEGETALISATION = lot({
    code: 'VEGETALISATION',
    nom: 'Vegetalisation et finitions paysageres',
    icone: '🌿',
    unite: 'm2',
    description: 'Terre vegetale, vegetaux, gazon, semis, paillage et galets.',
    calcPrix(quantite, options) {
      options = options || {};
      const surface = Math.max(0, n(quantite, n(options.surface, 1)));
      const typeGazon = options.typeGazon || 'non';
      const nbVegetaux = Math.max(0, n(options.nbVegetaux, 0));
      const paillage = bool(options.paillage);
      const prixVegetalMoyen = n(options.prixVegetalMoyen, prixCatalogue('PLANT-MOY', 18));
      const hGazon = typeGazon === 'rouleau' ? 0.5 : (typeGazon === 'semis' ? 0.3 : 0);
      const hPlantation = nbVegetaux * 0.25;
      const heures = surface * hGazon + hPlantation + (paillage ? surface * 0.12 : 0);
      const prixTerreM2 = prixCatalogue('TERRE-VEG-M2', prixCatalogue('TERRE-VEG-M3', 35) * 0.10);
      const prixGazonM2 = typeGazon === 'rouleau' ? prixCatalogue('GAZON-ROUL-M2', 4.50) : (typeGazon === 'semis' ? prixCatalogue('SEMENCES-GAZON-M2', 1.6) : 0);
      const prixPaillageM2 = prixCatalogue('ECORCE-PIN-M2', prixCatalogue('ECORCE-PIN-M3', 35) * 0.08);
      const fournitures = surface * prixTerreM2 + surface * prixGazonM2 + nbVegetaux * prixVegetalMoyen + (paillage ? surface * prixPaillageM2 : 0);

      return result(fournitures, heures, [
        `Surface : ${surface.toFixed(2)} m2`,
        `Gazon : ${typeGazon} (${hGazon.toFixed(2)} h/m2)`,
        `Vegetaux : ${nbVegetaux} u x ${money(prixVegetalMoyen)}`,
        paillage ? 'Paillage / galets inclus' : 'Paillage non inclus',
        'Catalogue vegetaux pret pour import CSV.',
      ], options);
    },
  });

  PackPaysagisme.LOTS.OUVRAGES_SPECIAUX = lot({
    code: 'OUVRAGES_SPECIAUX',
    nom: 'Ouvrages speciaux',
    icone: '🧰',
    unite: 'forfait',
    description: 'Fermeture sous balcon, polycarbonate, profils aluminium, adaptations.',
    calcPrix(quantite, options) {
      options = options || {};
      const qte = Math.max(1, n(quantite, 1));
      const surface = Math.max(0, n(options.surface, 4));
      const complexite = clamp(n(options.complexite, 2), 1, 3);
      const heures = qte * (surface * (1.2 + complexite * 0.45) + complexite * 2);
      const fournitures = qte * (surface * (prixCatalogue('POLYCARBONATE-M2', 55) + complexite * prixCatalogue('PROFIL-ALU-M2', 18)) + prixCatalogue('QUINCAILLERIE-U', 120));

      return result(fournitures, heures, [
        `Forfait : ${qte}`,
        `Surface : ${surface.toFixed(2)} m2`,
        `Complexite : ${complexite}/3`,
        'Inclut polycarbonate, profils aluminium, quincaillerie et ajustements.',
      ], options);
    },
  });

  PackPaysagisme.LOTS.NETTOYAGE_FINAL = lot({
    code: 'NETTOYAGE_FINAL',
    nom: 'Nettoyage final et reception',
    icone: '🧹',
    unite: 'forfait',
    description: 'Evacuation, nettoyage, photos apres travaux et preparation reception.',
    calcPrix(quantite, options) {
      options = options || {};
      const qte = Math.max(1, n(quantite, 1));
      const niveau = clamp(n(options.niveau, 2), 1, 3);
      const heures = qte * (1.5 + niveau * 0.75);
      const fournitures = qte * (prixCatalogue('NETTOYANT-FACADE-L', 35) + niveau * prixCatalogue('EVAC-DECHETS-U', 20));

      return result(fournitures, heures, [
        `Forfait nettoyage : ${qte}`,
        `Niveau : ${niveau}/3`,
        'Inclut consommables, evacuation legere et photos apres travaux.',
      ], options);
    },
  });

  window.PackPaysagisme = PackPaysagisme;
})();
