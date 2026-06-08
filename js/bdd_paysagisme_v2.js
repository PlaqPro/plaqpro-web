/**
 * PlaqPro+ â€” Base mÃ©tier Paysagisme V2
 * Standalone, sans import : expose uniquement window.BddPaysagismeV2.
 */
(function() {
  'use strict';

  const Q = {
    surface: 'surface',
    longueur: 'longueur',
    perimetre: 'perimetre',
    unite: 'unite',
    forfait: 'forfait',
    volume: 'volume',
    nb_plants: 'nb_plants',
  };

  const line = (tache, unite, prixUnit, quantiteMode) => ({ tache, unite, prixUnit, quantiteMode });
  const opt = (tache, unite, prixUnit) => ({ tache, unite, prixUnit });
  const pkg = (lignesAuto, options) => ({ lignesAuto, options: options || [] });
  const p = (id, section, libelle, unite, cout_mat, cout_mo, pack) => ({
    id, section, libelle, unite, cout_mat, cout_mo, package: pack
  });

  const autoSelf = (libelle, unite, prixUnit, quantiteMode, options) =>
    pkg([line(libelle, unite, prixUnit, quantiteMode)], options || []);

  const pkgPreparationSimple = libelle =>
    autoSelf(libelle, 'mÂ²', libelle.includes('DÃ©capage') ? 5 : libelle.includes('DÃ©compactage') ? 8 : 7, Q.surface, [
      opt('Nivellement laser', 'mÂ²', 6),
    ]);

  const pkgHaie = libelle => pkg([
    line('Terrassement tranchÃ©e haie', 'ml', 10, Q.longueur),
    line('Amendement terre haie', 'ml', 7, Q.longueur),
    line(libelle, 'u', 81, Q.nb_plants),
    line('Paillage haie', 'ml', 6, Q.longueur),
    line('Arrosage mise en place haie', 'forfait', 80, Q.forfait),
  ], [
    opt('Tuteurage', 'u', 7),
    opt('Protection hiver', 'forfait', 45),
  ]);

  const pkgArbre = libelle => pkg([
    line('Fosse plantation', 'u', 35, Q.unite),
    line('Amendement', 'u', 15, Q.unite),
    line(libelle, 'u', 1, Q.unite),
    line('Tuteurage', 'u', 12, Q.unite),
    line('Arrosage mise en place', 'u', 25, Q.unite),
  ], [
    opt('Paillage pied', 'u', 8),
    opt('Protection hiver', 'u', 18),
  ]);

  const pkgPelouse = (poseTache, posePrix) => pkg([
    line('DÃ©capage / terrassement', 'mÂ²', 7, Q.surface),
    line('Retournement et amendement', 'mÂ²', 6, Q.surface),
    line(poseTache, 'mÂ²', posePrix, Q.surface),
    line('Arrosage mise en place', 'forfait', 85, Q.forfait),
  ], [
    opt('Arrosage automatique', 'forfait', 450),
    opt('Engrais starter', 'mÂ²', 2),
  ]);

  const pkgMassif = () => pkg([
    line('DÃ©capage', 'mÂ²', 7, Q.surface),
    line('Amendement', 'mÂ²', 6, Q.surface),
    line('Plantation massif', 'mÂ²', 15, Q.surface),
    line('Pose paillage', 'mÂ²', 5, Q.surface),
    line('Arrosage', 'forfait', 60, Q.forfait),
  ], [
    opt('GÃ©otextile anti-herbes', 'mÂ²', 3),
    opt('Bordure contention', 'ml', 12),
  ]);

  const pkgAllee = (revetementTache, revetementPrix) => pkg([
    line('Terrassement', 'mÂ²', 8, Q.surface),
    line('Pose gÃ©otextile', 'mÂ²', 4, Q.surface),
    line(revetementTache, 'mÂ²', revetementPrix, Q.surface),
    line('Finitions bords', 'ml', 9, Q.perimetre),
  ], [
    opt('Bordure contention', 'ml', 12),
    opt('Ã‰clairage solaire', 'u', 45),
  ]);

  const pkgParking = (revetementTache, revetementPrix) => pkg([
    line('Terrassement', 'mÂ²', 10, Q.surface),
    line('Pose gÃ©otextile', 'mÂ²', 4, Q.surface),
    line('Pose grave compactÃ©e', 'mÂ²', 18, Q.surface),
    line('Pose stabilisateur', 'mÂ²', 15, Q.surface),
    line(revetementTache, 'mÂ²', revetementPrix, Q.surface),
  ], [
    opt('Bordure contention', 'ml', 12),
    opt('Ã‰clairage solaire', 'u', 85),
    opt('Marquage au sol', 'forfait', 180),
  ]);

  const pkgBassin = (poseTache, posePrix) => pkg([
    line('Terrassement', 'mÂ³', 90, Q.volume),
    line(poseTache, 'u', posePrix, Q.unite),
    line('Raccordement eau', 'forfait', 250, Q.forfait),
    line('Ã‰tanchÃ©itÃ© bords', 'ml', 35, Q.perimetre),
  ], [
    opt('Pompe filtration', 'u', 180),
    opt('Ã‰clairage submersible', 'u', 120),
    opt('Plantes aquatiques', 'u', 25),
    opt('Filtration UV', 'u', 220),
  ]);

  const pkgTerrasse = (revetementTache, revetementPrix) => pkg([
    line('Terrassement', 'mÂ²', 10, Q.surface),
    line('Pose structure / lambourdes', 'mÂ²', 15, Q.surface),
    line(revetementTache, 'mÂ²', revetementPrix, Q.surface),
    line('Finitions bords', 'ml', 12, Q.perimetre),
  ], [
    opt('Ã‰clairage intÃ©grÃ©', 'forfait', 380),
    opt('Garde-corps', 'ml', 85),
  ]);

  const pkgStructure = (poseTache, unite, posePrix) => pkg([
    line('PrÃ©paration emplacement', 'mÂ²', 8, Q.surface),
    line(poseTache, unite, posePrix, unite === 'u' ? Q.unite : Q.surface),
    line('Finitions / traitement', 'forfait', Math.round(posePrix * 0.1), Q.forfait),
  ], [
    opt('Ã‰clairage intÃ©grÃ©', 'forfait', 250),
    opt('Store / voile', 'u', 280),
  ]);

  const pkgCloture = (poseTache, posePrix, options) => pkg([
    line('Terrassement implantation', 'ml', 12, Q.longueur),
    line('Pose poteaux + fondations bÃ©ton', 'ml', 34, Q.longueur),
    line(poseTache, 'ml', posePrix, Q.longueur),
  ], options || [
    opt('Portail battant', 'u', 1030),
    opt('Portillon', 'u', 415),
    opt('Traitement / lasure bois', 'ml', 8),
  ]);

  const optsClotureSouple = [
    opt('Portail battant grillage', 'u', 650),
    opt('Portillon grillage', 'u', 280),
    opt('Tendeur de grillage', 'u', 25),
  ];
  const optsClotureRigide = [
    opt('Portail battant', 'u', 750),
    opt('Portillon', 'u', 300),
    opt('Lames occultantes', 'ml', 18),
  ];
  const optsClotureMetal = [
    opt('Portail battant motorisÃ©', 'u', 1800),
    opt('Portail battant manuel', 'u', 950),
    opt('Portillon', 'u', 380),
    opt('Peinture anticorrosion', 'ml', 12),
  ];
  const optsClotureBois = [
    opt('Portail bois battant', 'u', 750),
    opt('Portillon bois', 'u', 290),
    opt('Traitement lasure', 'ml', 8),
    opt('Teinture bois', 'ml', 6),
  ];
  const optsClotureCompositePvc = [
    opt('Portail composite/PVC', 'u', 820),
    opt('Portillon composite/PVC', 'u', 310),
  ];
  const optsClotureMur = [
    opt('Portail battant motorisÃ©', 'u', 1800),
    opt('Portail battant manuel', 'u', 950),
    opt('Portillon', 'u', 380),
    opt('Enduit finition', 'mÂ²', 18),
    opt('Chaperon mur', 'ml', 25),
  ];
  const optsClotureElectrique = [
    opt('Energiseur solaire', 'u', 180),
    opt('Energiseur secteur', 'u', 120),
    opt('Isolateurs supplÃ©mentaires', 'u', 3),
  ];
  const optsCloturePiscine = [
    opt('Portillon sÃ©curitÃ© normÃ©', 'u', 450),
    opt('Alarme piscine NF P90-307', 'u', 280),
  ];
  const optsPortailSeul = [
    opt('Motorisation portail', 'u', 650),
    opt('Interphone', 'u', 180),
    opt('Digidigicode', 'u', 120),
  ];

  const pkgArrosage = (poseTache, posePrix) => pkg([
    line('CrÃ©ation tranchÃ©es', 'ml', 12, Q.longueur),
    line(poseTache, 'ml', posePrix, Q.longueur),
    line('Raccordement eau', 'forfait', 85, Q.forfait),
    line('Pose programmateur', 'u', 85, Q.unite),
  ], [
    opt('Capteur de pluie', 'u', 45),
    opt('Sonde humiditÃ©', 'u', 65),
  ]);

  const pkgAireJeux = (surfaceTache, surfacePrix) => pkg([
    line('Terrassement', 'mÂ²', 7, Q.surface),
    line('Pose gÃ©otextile', 'mÂ²', 4, Q.surface),
    line(surfaceTache, 'mÂ²', surfacePrix, Q.surface),
    line('Bordure contention', 'ml', 12, Q.perimetre),
  ], [
    opt('Recharge annuelle', 'forfait', 180),
  ]);

  const pkgPotagerSerre = (poseTache, posePrix) => pkg([
    line('PrÃ©paration emplacement', 'u', 45, Q.unite),
    line(poseTache, 'u', posePrix, Q.unite),
    line('Remplissage terre vÃ©gÃ©tale', 'u', 60, Q.unite),
  ], [
    opt('Arrosage goutte-Ã -goutte', 'u', 95),
    opt('Composteur', 'u', 85),
  ]);

  window.BddPaysagismeV2 = {
    sections: [
      { id: 1, libelle: 'PrÃ©paration & Terrassement', icone: 'ðŸŒ±' },
      { id: 2, libelle: 'VÃ©gÃ©talisation', icone: 'ðŸŒ¿' },
      { id: 3, libelle: 'AllÃ©es & Circulations', icone: 'ðŸ§±' },
      { id: 4, libelle: "Bassins & PiÃ¨ces d'eau", icone: 'ðŸ’§' },
      { id: 5, libelle: 'Terrasses & Structures', icone: 'ðŸªµ' },
      { id: 6, libelle: 'ClÃ´tures', icone: 'ðŸ”’' },
      { id: 7, libelle: 'Arrosage & Ã‰clairage', icone: 'ðŸ’¡' },
      { id: 8, libelle: 'Aires de jeux & Zones fonctionnelles', icone: 'ðŸ§©' },
      { id: 9, libelle: 'Entretien & Finitions', icone: 'ðŸ§¼' },
    ],

    prestations: [
      p('PAYS_S1_001', 1, 'DÃ©capage terre vÃ©gÃ©tale', 'mÂ²', 0, 5, pkgPreparationSimple('DÃ©capage terre vÃ©gÃ©tale')),
      p('PAYS_S1_002', 1, 'DÃ©compactage / reprise du sol', 'mÂ²', 2, 6, pkgPreparationSimple('DÃ©compactage / reprise du sol')),
      p('PAYS_S1_003', 1, 'Nivellement / rÃ©glage des pentes', 'mÂ²', 0, 7, pkgPreparationSimple('Nivellement / rÃ©glage des pentes')),
      p('PAYS_S1_004', 1, 'Apport de terre vÃ©gÃ©tale', 'mÂ³', 35, 15, pkg([
        line('DÃ©capage', 'mÂ²', 5, Q.surface),
        line('Apport terre vÃ©gÃ©tale', 'mÂ³', 50, Q.volume),
      ], [opt('Amendement', 'mÂ²', 4)])),
      p('PAYS_S1_005', 1, 'Ã‰vacuation des terres', 'mÂ³', 0, 35, pkg([
        line('Chargement', 'mÂ³', 15, Q.volume),
        line('Ã‰vacuation des terres', 'mÂ³', 35, Q.volume),
      ])),
      p('PAYS_S1_006', 1, 'Pose gÃ©otextile anti-repousse', 'mÂ²', 2, 3, autoSelf('Pose gÃ©otextile anti-repousse', 'mÂ²', 5, Q.surface, [opt('Agrafes fixation', 'u', 0.5)])),
      p('PAYS_S1_007', 1, 'CrÃ©ation tranchÃ©e technique (arrosage/Ã©lec/drainage)', 'ml', 5, 12, pkg([
        line('Terrassement tranchÃ©e', 'ml', 12, Q.longueur),
        line('Remblai', 'ml', 6, Q.longueur),
      ], [opt('Grillage avertisseur', 'ml', 2)])),

      p('PAYS_S2_001', 2, 'CrÃ©ation pelouse semis', 'mÂ²', 3, 8, pkgPelouse('Semis', 3)),
      p('PAYS_S2_002', 2, 'Pose gazon rouleau', 'mÂ²', 12, 8, pkgPelouse('Pose rouleau', 12)),
      p('PAYS_S2_003', 2, 'Gazon synthÃ©tique', 'mÂ²', 35, 12, pkgPelouse('Pose synthÃ©tique', 35)),
      p('PAYS_S2_004', 2, 'Plantation haie persistante', 'ml', 25, 15, pkgHaie('Plantation haie persistante')),
      p('PAYS_S2_005', 2, 'Plantation haie caduque', 'ml', 18, 15, pkgHaie('Plantation haie caduque')),
      p('PAYS_S2_006', 2, 'Plantation haie fleurie', 'ml', 22, 15, pkgHaie('Plantation haie fleurie')),
      p('PAYS_S2_007', 2, 'Plantation haie dÃ©fensive', 'ml', 20, 15, pkgHaie('Plantation haie dÃ©fensive')),
      p('PAYS_S2_008', 2, 'Plantation haie libre/champÃªtre', 'ml', 15, 15, pkgHaie('Plantation haie libre/champÃªtre')),
      p('PAYS_S2_009', 2, 'Plantation haie taillÃ©e (if, troÃ¨ne)', 'ml', 28, 15, pkgHaie('Plantation haie taillÃ©e')),
      p('PAYS_S2_010', 2, 'Plantation arbre petit sujet (< 2m)', 'u', 45, 35, pkgArbre('Plantation arbre petit sujet')),
      p('PAYS_S2_011', 2, 'Plantation arbre moyen sujet (2-4m)', 'u', 120, 55, pkgArbre('Plantation arbre moyen sujet')),
      p('PAYS_S2_012', 2, 'Plantation arbre grand sujet (> 4m)', 'u', 350, 120, pkgArbre('Plantation arbre grand sujet')),
      p('PAYS_S2_013', 2, 'Plantation arbustes et vivaces', 'u', 25, 20, pkgArbre('Plantation arbustes et vivaces')),
      p('PAYS_S2_014', 2, 'CrÃ©ation massif dÃ©coratif', 'mÂ²', 18, 12, pkgMassif()),
      p('PAYS_S2_015', 2, 'Paillage minÃ©ral (graviers, pouzzolane)', 'mÂ²', 8, 4, autoSelf('Paillage minÃ©ral', 'mÂ²', 12, Q.surface)),
      p('PAYS_S2_016', 2, 'Paillage organique (copeaux, Ã©corces)', 'mÂ²', 5, 4, autoSelf('Paillage organique', 'mÂ²', 9, Q.surface)),
      p('PAYS_S2_017', 2, 'Engazonnement renforcÃ© (dalles engazonnÃ©es)', 'mÂ²', 22, 10, pkgPelouse('Pose dalles engazonnÃ©es', 22)),

      p('PAYS_S3_001', 3, 'AllÃ©e graviers stabilisÃ©s', 'mÂ²', 18, 10, pkgAllee('Pose graviers stabilisÃ©s', 28)),
      p('PAYS_S3_002', 3, 'AllÃ©e dallage bÃ©ton', 'mÂ²', 35, 18, pkgAllee('Pose dallage bÃ©ton', 53)),
      p('PAYS_S3_003', 3, 'AllÃ©e pavÃ©s pierre naturelle', 'mÂ²', 65, 25, pkgAllee('Pose pavÃ©s pierre naturelle', 90)),
      p('PAYS_S3_004', 3, 'AllÃ©e pavÃ©s bÃ©ton', 'mÂ²', 28, 18, pkgAllee('Pose pavÃ©s bÃ©ton', 46)),
      p('PAYS_S3_005', 3, 'AllÃ©e pas japonais', 'u', 25, 15, pkg([line('Pose pas japonais', 'u', 40, Q.unite)], [opt('Ã‰clairage solaire', 'u', 45)])),
      p('PAYS_S3_006', 3, 'AllÃ©e bÃ©ton dÃ©sactivÃ©', 'mÂ²', 45, 20, pkgAllee('Pose bÃ©ton dÃ©sactivÃ©', 65)),
      p('PAYS_S3_007', 3, 'AllÃ©e bÃ©ton classique', 'mÂ²', 35, 18, pkgAllee('Pose bÃ©ton classique', 53)),
      p('PAYS_S3_008', 3, 'AllÃ©e enrobÃ©', 'mÂ²', 25, 15, pkgAllee('Pose enrobÃ©', 40)),
      p('PAYS_S3_009', 3, 'AllÃ©e stabilisÃ© (sable + liant)', 'mÂ²', 12, 10, pkgAllee('Pose stabilisÃ© sable + liant', 22)),
      p('PAYS_S3_010', 3, 'AllÃ©e traverses paysagÃ¨res bois', 'mÂ²', 38, 18, pkgAllee('Pose traverses paysagÃ¨res bois', 56)),
      p('PAYS_S3_011', 3, 'AllÃ©e rÃ©sine drainante', 'mÂ²', 55, 20, pkgAllee('Pose rÃ©sine drainante', 75)),
      p('PAYS_S3_012', 3, 'AllÃ©e dalles alvÃ©olaires', 'mÂ²', 22, 12, pkgAllee('Pose dalles alvÃ©olaires', 34)),
      p('PAYS_S3_013', 3, 'Bordure bÃ©ton', 'ml', 8, 8, autoSelf('Pose bordure bÃ©ton', 'ml', 16, Q.longueur)),
      p('PAYS_S3_014', 3, 'Bordure acier cor-ten', 'ml', 22, 8, autoSelf('Pose bordure acier cor-ten', 'ml', 30, Q.longueur)),
      p('PAYS_S3_015', 3, 'Bordure pierre naturelle', 'ml', 35, 10, autoSelf('Pose bordure pierre naturelle', 'ml', 45, Q.longueur)),
      p('PAYS_S3_016', 3, 'Bordure bois', 'ml', 12, 8, autoSelf('Pose bordure bois', 'ml', 20, Q.longueur)),
      p('PAYS_S3_017', 3, 'Parking stabilisÃ© gravier', 'mÂ²', 45, 22, pkgParking('Pose gravier de finition', 12)),
      p('PAYS_S3_018', 3, 'Parking bÃ©ton / enrobÃ©', 'mÂ²', 55, 25, pkgParking('Pose bÃ©ton / enrobÃ©', 80)),
      p('PAYS_S3_019', 3, "Rampe d'accÃ¨s PMR", 'mÂ²', 40, 25, pkgAllee("CrÃ©ation rampe d'accÃ¨s PMR", 65)),

      p('PAYS_S4_001', 4, 'Bassin dÃ©coratif / ornemental', 'u', 180, 120, pkgBassin('Pose bassin dÃ©coratif / ornemental', 300)),
      p('PAYS_S4_002', 4, 'Bassin naturel / mare paysagÃ¨re', 'mÂ²', 25, 35, pkgBassin('Pose bassin naturel / mare paysagÃ¨re', 60)),
      p('PAYS_S4_003', 4, 'Bassin Ã  carpes KoÃ¯', 'mÂ²', 85, 65, pkgBassin('Pose bassin Ã  carpes KoÃ¯', 150)),
      p('PAYS_S4_004', 4, 'Bassin prÃ©formÃ©', 'u', 250, 180, pkgBassin('Pose bassin prÃ©formÃ©', 430)),
      p('PAYS_S4_005', 4, 'Bassin bÃ¢che EPDM sur mesure', 'mÂ²', 35, 45, pkgBassin('Pose bÃ¢che EPDM sur mesure', 80)),
      p('PAYS_S4_006', 4, 'Fontaine / cascade / ruisseau', 'u', 350, 200, autoSelf('Pose fontaine / cascade / ruisseau', 'u', 550, Q.unite)),
      p('PAYS_S4_007', 4, 'Pompe filtration bassin', 'u', 180, 45, autoSelf('Pose pompe filtration bassin', 'u', 225, Q.unite)),
      p('PAYS_S4_008', 4, 'Filtration UV bassin', 'u', 220, 45, autoSelf('Pose filtration UV bassin', 'u', 265, Q.unite)),
      p('PAYS_S4_009', 4, 'Ã‰clairage submersible', 'u', 120, 35, autoSelf('Pose Ã©clairage submersible', 'u', 155, Q.unite)),

      p('PAYS_S5_001', 5, 'Terrasse bois', 'mÂ²', 55, 25, pkgTerrasse('Pose terrasse bois', 80)),
      p('PAYS_S5_002', 5, 'Terrasse composite', 'mÂ²', 75, 25, pkgTerrasse('Pose terrasse composite', 100)),
      p('PAYS_S5_003', 5, 'Terrasse carrelage extÃ©rieur', 'mÂ²', 45, 30, pkgTerrasse('Pose terrasse carrelage extÃ©rieur', 75)),
      p('PAYS_S5_004', 5, 'Terrasse bÃ©ton dÃ©sactivÃ©', 'mÂ²', 45, 22, pkgTerrasse('Pose terrasse bÃ©ton dÃ©sactivÃ©', 67)),
      p('PAYS_S5_005', 5, 'Pergola bois', 'mÂ²', 180, 80, pkgStructure('Pose pergola bois', 'mÂ²', 260)),
      p('PAYS_S5_006', 5, 'Pergola aluminium', 'mÂ²', 250, 80, pkgStructure('Pose pergola aluminium', 'mÂ²', 330)),
      p('PAYS_S5_007', 5, 'Pergola bioclimatique', 'mÂ²', 450, 120, pkgStructure('Pose pergola bioclimatique', 'mÂ²', 570)),
      p('PAYS_S5_008', 5, "Tonnelle / voile d'ombrage", 'u', 350, 120, pkgStructure("Pose tonnelle / voile d'ombrage", 'u', 470)),
      p('PAYS_S5_009', 5, 'Abri de jardin / local technique', 'u', 800, 300, pkgStructure('Pose abri de jardin / local technique', 'u', 1100)),
      p('PAYS_S5_010', 5, 'Claustra / brise-vue bois', 'mÂ²', 55, 25, pkgStructure('Pose claustra / brise-vue bois', 'mÂ²', 80)),
      p('PAYS_S5_011', 5, 'Claustra / brise-vue aluminium', 'mÂ²', 85, 25, pkgStructure('Pose claustra / brise-vue aluminium', 'mÂ²', 110)),
      p('PAYS_S5_012', 5, 'Muret dÃ©coratif parpaings', 'ml', 45, 35, pkgStructure('Pose muret dÃ©coratif parpaings', 'mÂ²', 80)),
      p('PAYS_S5_013', 5, 'Muret pierre naturelle', 'ml', 95, 55, pkgStructure('Pose muret pierre naturelle', 'mÂ²', 150)),
      p('PAYS_S5_014', 5, 'Muret gabions', 'ml', 75, 45, pkgStructure('Pose muret gabions', 'mÂ²', 120)),

      p('PAYS_S6_001', 6, 'ClÃ´ture grillage souple', 'ml', 12, 18, pkgCloture('Pose clÃ´ture grillage souple', 30, optsClotureSouple)),
      p('PAYS_S6_002', 6, 'ClÃ´ture grillage rigide panneaux', 'ml', 22, 18, pkgCloture('Pose clÃ´ture grillage rigide panneaux', 40, optsClotureRigide)),
      p('PAYS_S6_003', 6, 'ClÃ´ture barreaudage acier', 'ml', 45, 25, pkgCloture('Pose clÃ´ture barreaudage acier', 70, optsClotureMetal)),
      p('PAYS_S6_004', 6, 'ClÃ´ture fer forgÃ©', 'ml', 85, 35, pkgCloture('Pose clÃ´ture fer forgÃ©', 120, optsClotureMetal)),
      p('PAYS_S6_005', 6, 'ClÃ´ture aluminium barreaudÃ©e', 'ml', 65, 25, pkgCloture('Pose clÃ´ture aluminium barreaudÃ©e', 90, optsClotureMetal)),
      p('PAYS_S6_006', 6, 'Palissade bois pleine', 'ml', 35, 22, pkgCloture('Pose palissade bois pleine', 57, optsClotureBois)),
      p('PAYS_S6_007', 6, 'ClÃ´ture bois ajourÃ©e / lames', 'ml', 42, 22, pkgCloture('Pose clÃ´ture bois ajourÃ©e / lames', 64, optsClotureBois)),
      p('PAYS_S6_008', 6, 'Claustra bois dÃ©coratif', 'ml', 55, 25, pkgCloture('Pose claustra bois dÃ©coratif', 80, optsClotureBois)),
      p('PAYS_S6_009', 6, 'Traverses paysagÃ¨res', 'ml', 28, 20, pkgCloture('Pose traverses paysagÃ¨res', 48, optsClotureBois)),
      p('PAYS_S6_010', 6, 'ClÃ´ture composite', 'ml', 58, 22, pkgCloture('Pose clÃ´ture composite', 80, optsClotureCompositePvc)),
      p('PAYS_S6_011', 6, 'ClÃ´ture PVC pleine', 'ml', 38, 20, pkgCloture('Pose clÃ´ture PVC pleine', 58, optsClotureCompositePvc)),
      p('PAYS_S6_012', 6, 'ClÃ´ture PVC ajourÃ©e', 'ml', 32, 20, pkgCloture('Pose clÃ´ture PVC ajourÃ©e', 52, optsClotureCompositePvc)),
      p('PAYS_S6_013', 6, 'Mur clÃ´ture parpaings', 'ml', 55, 45, pkgCloture('Pose mur clÃ´ture parpaings', 100, optsClotureMur)),
      p('PAYS_S6_014', 6, 'Mur clÃ´ture pierre', 'ml', 120, 65, pkgCloture('Pose mur clÃ´ture pierre', 185, optsClotureMur)),
      p('PAYS_S6_015', 6, 'ClÃ´ture gabions', 'ml', 85, 45, pkgCloture('Pose clÃ´ture gabions', 130, optsClotureMur)),
      p('PAYS_S6_016', 6, 'Muret + panneaux', 'ml', 75, 45, pkgCloture('Pose muret + panneaux', 120, optsClotureMur)),
      p('PAYS_S6_017', 6, 'Panneaux occultants bois', 'ml', 48, 22, pkgCloture('Pose panneaux occultants bois', 70)),
      p('PAYS_S6_018', 6, 'Panneaux occultants composite', 'ml', 62, 22, pkgCloture('Pose panneaux occultants composite', 84)),
      p('PAYS_S6_019', 6, 'ClÃ´ture Ã©lectrique', 'ml', 8, 12, pkgCloture('Pose clÃ´ture Ã©lectrique', 20, optsClotureElectrique)),
      p('PAYS_S6_020', 6, 'ClÃ´ture de piscine normÃ©e', 'ml', 95, 45, pkgCloture('Pose clÃ´ture de piscine normÃ©e', 140, optsCloturePiscine)),
      p('PAYS_S6_021', 6, 'Portail battant (fourni + posÃ©)', 'u', 850, 180, autoSelf('Pose portail battant', 'u', 1030, Q.unite, optsPortailSeul)),
      p('PAYS_S6_022', 6, 'Portail coulissant (fourni + posÃ©)', 'u', 1200, 220, autoSelf('Pose portail coulissant', 'u', 1420, Q.unite, optsPortailSeul)),
      p('PAYS_S6_023', 6, 'Portillon (fourni + posÃ©)', 'u', 320, 95, autoSelf('Pose portillon', 'u', 415, Q.unite, optsPortailSeul)),

      p('PAYS_S7_001', 7, 'Arrosage automatique turbines', 'forfait', 350, 180, pkgArrosage('Pose rÃ©seau arrosage automatique turbines', 20)),
      p('PAYS_S7_002', 7, 'RÃ©seau arrosage enterrÃ©', 'ml', 8, 12, pkgArrosage('Pose rÃ©seau arrosage enterrÃ©', 20)),
      p('PAYS_S7_003', 7, 'Arrosage goutte-Ã -goutte', 'ml', 5, 8, pkgArrosage('Pose arrosage goutte-Ã -goutte', 13)),
      p('PAYS_S7_004', 7, 'Programmateur arrosage', 'u', 85, 35, autoSelf('Pose programmateur arrosage', 'u', 120, Q.unite)),
      p('PAYS_S7_005', 7, 'Ã‰clairage extÃ©rieur spots', 'u', 45, 35, autoSelf('Pose Ã©clairage extÃ©rieur spots', 'u', 80, Q.unite)),
      p('PAYS_S7_006', 7, 'Ã‰clairage bornes LED', 'u', 65, 35, autoSelf('Pose Ã©clairage bornes LED', 'u', 100, Q.unite)),
      p('PAYS_S7_007', 7, 'Ã‰clairage submersible', 'u', 120, 35, autoSelf('Pose Ã©clairage submersible', 'u', 155, Q.unite)),
      p('PAYS_S7_008', 7, 'Uplight arbre (mise en valeur)', 'u', 55, 30, autoSelf('Pose uplight arbre', 'u', 85, Q.unite)),
      p('PAYS_S7_009', 7, 'RÃ©seau Ã©lectrique extÃ©rieur', 'ml', 12, 15, autoSelf('Pose rÃ©seau Ã©lectrique extÃ©rieur', 'ml', 27, Q.longueur)),

      p('PAYS_S8_001', 8, 'Surface amortissante copeaux', 'mÂ²', 12, 10, pkgAireJeux('Pose surface amortissante copeaux', 22)),
      p('PAYS_S8_002', 8, 'Surface amortissante sable', 'mÂ²', 8, 8, pkgAireJeux('Pose surface amortissante sable', 16)),
      p('PAYS_S8_003', 8, 'Dalle EPDM amortissante', 'mÂ²', 65, 25, pkgAireJeux('Pose dalle EPDM amortissante', 90)),
      p('PAYS_S8_004', 8, 'Dalles caoutchouc', 'mÂ²', 45, 20, pkgAireJeux('Pose dalles caoutchouc', 65)),
      p('PAYS_S8_005', 8, 'CarrÃ© potager bois', 'u', 85, 60, pkgPotagerSerre('Pose carrÃ© potager bois', 145)),
      p('PAYS_S8_006', 8, 'Serre de jardin', 'u', 450, 180, pkgPotagerSerre('Pose serre de jardin', 630)),
      p('PAYS_S8_007', 8, 'Composteur', 'u', 85, 25, autoSelf('Pose composteur', 'u', 110, Q.unite)),
      p('PAYS_S8_008', 8, 'Zone dÃ©tente (brasero, coin feu)', 'forfait', 350, 120, autoSelf('CrÃ©ation zone dÃ©tente', 'forfait', 470, Q.forfait)),
      p('PAYS_S8_009', 8, 'Bac / jardiniÃ¨re plantÃ©e', 'u', 65, 35, autoSelf('Pose bac / jardiniÃ¨re plantÃ©e', 'u', 100, Q.unite)),

      p('PAYS_S9_001', 9, 'DÃ©sherbage initial', 'mÂ²', 0, 4, autoSelf('DÃ©sherbage initial', 'mÂ²', 4, Q.surface)),
      p('PAYS_S9_002', 9, 'Taille de formation', 'u', 0, 45, autoSelf('Taille de formation', 'u', 45, Q.unite)),
      p('PAYS_S9_003', 9, 'Apport engrais / amendements', 'mÂ²', 3, 3, autoSelf('Apport engrais / amendements', 'mÂ²', 6, Q.surface)),
      p('PAYS_S9_004', 9, 'Nettoyage fin de chantier intÃ©rieur', 'forfait', 0, 85, autoSelf('Nettoyage fin de chantier intÃ©rieur', 'forfait', 85, Q.forfait)),
      p('PAYS_S9_005', 9, 'Nettoyage fin de chantier extÃ©rieur', 'forfait', 0, 120, autoSelf('Nettoyage fin de chantier extÃ©rieur', 'forfait', 120, Q.forfait)),
      p('PAYS_S9_006', 9, 'Mise en service bassin', 'forfait', 25, 65, autoSelf('Mise en service bassin', 'forfait', 90, Q.forfait)),
      p('PAYS_S9_007', 9, 'Mise en service arrosage', 'forfait', 15, 45, autoSelf('Mise en service arrosage', 'forfait', 60, Q.forfait)),
      p('PAYS_S9_008', 9, 'Ã‰vacuation vÃ©gÃ©taux / dÃ©chets verts', 'mÂ³', 0, 45, autoSelf('Ã‰vacuation vÃ©gÃ©taux / dÃ©chets verts', 'mÂ³', 45, Q.volume)),
      p('PAYS_S9_009', 9, 'Arrachage végétaux / arbustes', 'u', 0, 45, pkg([
        line('Arrachage et extraction', 'u', 45, Q.unite),
        line('Évacuation végétaux', 'u', 25, Q.unite),
      ], [
        opt('Dessouchage', 'u', 85),
        opt('Rebouchage fosse', 'u', 35),
      ])),
      p('PAYS_S9_010', 9, 'Suppression haie', 'ml', 0, 35, pkg([
        line('Arrachage haie', 'ml', 18, Q.longueur),
        line('Dessouchage haie', 'ml', 22, Q.longueur),
        line('Évacuation déchets verts', 'm³', 45, Q.volume),
      ], [
        opt('Remise en état sol', 'm²', 8),
        opt('Nouvelle plantation après suppression', 'ml', 15),
      ])),
      p('PAYS_S9_011', 9, 'Remplacement végétaux', 'u', 35, 35, pkg([
        line('Arrachage ancien végétal', 'u', 35, Q.unite),
        line('Préparation fosse', 'u', 25, Q.unite),
        line('Plantation nouveau végétal', 'u', 45, Q.unite),
        line('Arrosage mise en place', 'forfait', 25, Q.forfait),
      ], [
        opt('Tuteurage', 'u', 12),
        opt('Paillage pied', 'u', 8),
      ])),
      p('PAYS_S9_012', 9, 'Taille / recépage arbres', 'u', 0, 85, pkg([
        line('Taille de formation ou recépage', 'u', 85, Q.unite),
        line('Évacuation branchages', 'forfait', 45, Q.forfait),
      ], [
        opt('Broyage sur place', 'forfait', 85),
        opt('Traitement cicatrisant', 'u', 15),
      ])),
      p('PAYS_S9_013', 9, 'Taille haie entretien', 'ml', 0, 8, pkg([
        line('Taille haie', 'ml', 8, Q.longueur),
        line('Ramassage et évacuation', 'forfait', 35, Q.forfait),
      ], [
        opt('Taille double face', 'ml', 4),
      ])),
    ],

    getSection(sectionId) {
      return this.sections.find(s => s.id === sectionId);
    },

    getPrestationsBySection(sectionId) {
      return this.prestations.filter(p => p.section === sectionId);
    },

    getPrestation(id) {
      return this.prestations.find(p => p.id === id);
    },

    getPrix(id) {
      const prestation = this.getPrestation(id);
      if (!prestation) return null;
      return {
        mat: prestation.cout_mat,
        mo: prestation.cout_mo,
        total: prestation.cout_mat + prestation.cout_mo,
      };
    },
  };
})();
