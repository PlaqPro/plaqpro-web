(function () {
  'use strict';

  const CORPS_META = {
    platrerie: { label: 'Plâtrerie', ouvrageCode: 'OUV_CLOISON_BA13_M48', unite: 'm²' },
    plaquisterie: { label: 'Plâtrerie', ouvrageCode: 'OUV_CLOISON_BA13_M48', unite: 'm²' },
    peinture: { label: 'Peinture', ouvrageCode: 'OUV_PEINTURE_MURS_2_COUCHES', unite: 'm²' },
    maconnerie: { label: 'Maçonnerie', ouvrageCode: 'OUV_MUR_PARPAING_20', unite: 'm²' },
    paysagisme: { label: 'Paysagisme', ouvrageCode: 'OUV_GAZON_ROULEAU', unite: 'm²' },
    electricite: { label: 'Électricité', ouvrageCode: null, unite: 'u' },
    plomberie: { label: 'Plomberie', ouvrageCode: null, unite: 'u' },
  };

  const QUANTITES_OUV = {
    prises: 'OUV_PRISE_16A',
    prise: 'OUV_PRISE_16A',
    prises_16a: 'OUV_PRISE_16A',
    points_lumineux: 'OUV_POINT_LUMINEUX_DCL',
    point_lumineux: 'OUV_POINT_LUMINEUX_DCL',
    dcl: 'OUV_POINT_LUMINEUX_DCL',
    interrupteurs: 'OUV_INTERRUPTEUR_SIMPLE',
    interrupteur: 'OUV_INTERRUPTEUR_SIMPLE',
    tableaux: 'OUV_TABLEAU_13M',
    tableau: 'OUV_TABLEAU_13M',
    alim_per_16: 'OUV_ALIM_PER_16',
    alimentations_per: 'OUV_ALIM_PER_16',
    evacuation_pvc_40: 'OUV_EVAC_PVC_40',
    evacuations_pvc_40: 'OUV_EVAC_PVC_40',
    wc: 'OUV_WC_STANDARD',
    douche: 'OUV_RECEVEUR_DOUCHE',
    receveur_douche: 'OUV_RECEVEUR_DOUCHE',
  };

  const LINEAIRES_NEUF = {
    cable_15: { designation: 'Câble 1.5 mm²', unite: 'ml', prixAchat: 1.8 },
    cable_25: { designation: 'Câble 2.5 mm²', unite: 'ml', prixAchat: 2.4 },
    cable_6: { designation: 'Câble 6 mm²', unite: 'ml', prixAchat: 1.2 },
    gaine_irl: { designation: 'Gaine IRL', unite: 'ml', prixAchat: 1.2 },
    gaine_icta: { designation: 'Gaine ICTA', unite: 'ml', prixAchat: 0.9 },
    per_16: { designation: 'Tube PER 16', unite: 'ml', prixAchat: 3.5 },
    per_20: { designation: 'Tube PER 20', unite: 'ml', prixAchat: 4.2 },
    per_25: { designation: 'Tube PER 25', unite: 'ml', prixAchat: 5.5 },
    pvc_40: { designation: 'Tube PVC 40', unite: 'ml', prixAchat: 2.8 },
    pvc_100: { designation: 'Tube PVC 100', unite: 'ml', prixAchat: 5.5 },
    pvc_125: { designation: 'Tube PVC 125', unite: 'ml', prixAchat: 7.2 },
  };

  function bddDisponible() {
    return typeof BddV2 !== 'undefined' &&
      typeof BddV2.estChargee === 'function' &&
      BddV2.estChargee();
  }

  function nombre(valeur) {
    const n = parseFloat(valeur);
    return Number.isFinite(n) ? n : 0;
  }

  function labelCorps(corps) {
    return (CORPS_META[corps] && CORPS_META[corps].label) || corps;
  }

  function designationDepuisCode(code) {
    if (!code) return '';
    return code
      .replace(/^OUV_/, '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, function (lettre) { return lettre.toUpperCase(); });
  }

  function lireOuvrage(ouvrageCode) {
    if (!ouvrageCode || typeof BddV2.getOuvrage !== 'function') return null;
    return BddV2.getOuvrage(ouvrageCode) || null;
  }

  function lireComposition(ouvrageCode, qteMetier, coutMat, corpsLabel) {
    if (!ouvrageCode || typeof BddV2.getComposition !== 'function') return [];

    const composition = BddV2.getComposition(ouvrageCode) || [];
    if (!composition.length) {
      const coutForfait = nombre(coutMat);
      if (coutForfait <= 0) return [];
      return [{
        codeMat: 'FORFAIT_' + ouvrageCode,
        designation: 'Fournitures ' + (corpsLabel || designationDepuisCode(ouvrageCode)),
        qte: 1,
        unite: 'forfait',
        prixAchat: Math.round(coutForfait),
        totalAchat: Math.round(coutForfait),
      }];
    }

    return composition.map(function (item) {
      const codeMat = item.codeMat || item.code_materiau || item.code || '';
      const materiau = codeMat && typeof BddV2.getMateriau === 'function'
        ? (BddV2.getMateriau(codeMat) || {})
        : {};
      const qteParUnite = nombre(item.qteParUnite || item.qte_par_unite || item.quantite_unitaire || item.qte || 1);
      const perte = nombre(item.perte || 0);
      const qte = qteParUnite * qteMetier * (1 + perte);
      const prixAchat = nombre(materiau.prixAchat || materiau.pu_ht || item.prixAchat || item.pu_ht || 0);

      return {
        codeMat: codeMat,
        designation: materiau.designation || item.designation || codeMat,
        qte: qte,
        unite: materiau.unite || item.unite || '',
        prixAchat: prixAchat,
        totalAchat: qte * prixAchat,
      };
    });
  }

  function calculerOuvrage(corps, pieceNom, ouvrageCode, qte, uniteFallback) {
    const ouvrage = lireOuvrage(ouvrageCode) || {};
    const calc = typeof BddV2.calcPrixVente === 'function'
      ? (BddV2.calcPrixVente(ouvrageCode, qte) || {})
      : {};
    const corpsLabel = labelCorps(corps);
    const coutMat = nombre(calc.coutMat);

    return {
      corps: corps,
      corpsLabel: corpsLabel,
      piece: pieceNom || '',
      ouvrageCode: ouvrageCode,
      designation: ouvrage.designation || designationDepuisCode(ouvrageCode),
      qte: qte,
      unite: ouvrage.unite || uniteFallback || 'u',
      coutMat: coutMat,
      coutMO: nombre(calc.coutMO),
      prixVente: nombre(calc.prixVente),
      gain: nombre(calc.gain),
      materiaux: lireComposition(ouvrageCode, qte, coutMat, corpsLabel),
    };
  }

  function ligneLineaire(corps, cle, qte) {
    const meta = LINEAIRES_NEUF[cle];
    const coutMat = qte * meta.prixAchat;
    const prixVente = coutMat * 1.35;

    return {
      corps: corps,
      corpsLabel: labelCorps(corps),
      piece: 'Linéaires neuf',
      ouvrageCode: cle,
      designation: meta.designation,
      qte: qte,
      unite: meta.unite,
      coutMat: coutMat,
      coutMO: 0,
      prixVente: prixVente,
      gain: prixVente - coutMat,
      materiaux: [{
        codeMat: cle,
        designation: meta.designation,
        qte: qte,
        unite: meta.unite,
        prixAchat: meta.prixAchat,
        totalAchat: coutMat,
      }],
    };
  }

  function piecesDuCorps(pieces, corps) {
    return (pieces || []).filter(function (piece) {
      return piece && piece.corps === corps;
    });
  }

  function ajouterLignesSurface(lignes, pieces, corps) {
    const meta = CORPS_META[corps];
    if (!meta || !meta.ouvrageCode) return;

    piecesDuCorps(pieces, corps).forEach(function (piece) {
      const qte = nombre(piece.surface);
      if (qte <= 0) return;
      lignes.push(calculerOuvrage(corps, piece.nom, meta.ouvrageCode, qte, meta.unite));
    });
  }

  function ajouterLignesQuantites(lignes, pieces, corps) {
    if (corps !== 'electricite' && corps !== 'plomberie') return;

    piecesDuCorps(pieces, corps).forEach(function (piece) {
      const quantites = piece.quantites || {};
      Object.keys(quantites).forEach(function (cle) {
        const qte = nombre(quantites[cle]);
        const ouvrageCode = QUANTITES_OUV[cle];
        if (qte <= 0 || !ouvrageCode) return;
        lignes.push(calculerOuvrage(corps, piece.nom, ouvrageCode, qte, 'u'));
      });
    });
  }

  function ajouterLignesLineaires(lignes, corps, corpsConfig) {
    if (corps !== 'electricite' && corps !== 'plomberie') return;

    const config = (corpsConfig && corpsConfig[corps]) || {};
    if (config.type !== 'neuf') return;

    Object.keys(config).forEach(function (cle) {
      if (cle === 'type' || cle === 'lieuxKey' || !LINEAIRES_NEUF[cle]) return;
      const qte = nombre(config[cle]);
      if (qte <= 0) return;
      lignes.push(ligneLineaire(corps, cle, qte));
    });
  }

  function buildLignes(pieces, corpsActifs, corpsConfig) {
    if (!bddDisponible()) return [];

    const lignes = [];
    (corpsActifs || []).forEach(function (corps) {
      ajouterLignesSurface(lignes, pieces, corps);
      ajouterLignesQuantites(lignes, pieces, corps);
      ajouterLignesLineaires(lignes, corps, corpsConfig);
    });

    return lignes;
  }

  function totaux(lignes) {
    return (lignes || []).reduce(function (acc, ligne) {
      acc.coutMat += nombre(ligne && ligne.coutMat);
      acc.coutMO += nombre(ligne && ligne.coutMO);
      acc.prixVente += nombre(ligne && ligne.prixVente);
      acc.gain += nombre(ligne && ligne.gain);
      return acc;
    }, { coutMat: 0, coutMO: 0, prixVente: 0, gain: 0 });
  }

  window.CalcExpressStructure = {
    buildLignes: buildLignes,
    totaux: totaux,
  };
})();
