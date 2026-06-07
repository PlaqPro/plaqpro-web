/**
 * PlaqPro+ — Base métier Paysagisme V2
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
    autoSelf(libelle, 'm²', libelle.includes('Décapage') ? 5 : libelle.includes('Décompactage') ? 8 : 7, Q.surface, [
      opt('Nivellement laser', 'm²', 6),
    ]);

  const pkgHaie = libelle => pkg([
    line('Terrassement tranchée haie', 'ml', 10, Q.longueur),
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
    line('Décapage / terrassement', 'm²', 7, Q.surface),
    line('Retournement et amendement', 'm²', 6, Q.surface),
    line(poseTache, 'm²', posePrix, Q.surface),
    line('Arrosage mise en place', 'forfait', 85, Q.forfait),
  ], [
    opt('Arrosage automatique', 'forfait', 450),
    opt('Engrais starter', 'm²', 2),
  ]);

  const pkgMassif = () => pkg([
    line('Décapage', 'm²', 7, Q.surface),
    line('Amendement', 'm²', 6, Q.surface),
    line('Plantation massif', 'm²', 15, Q.surface),
    line('Pose paillage', 'm²', 5, Q.surface),
    line('Arrosage', 'forfait', 60, Q.forfait),
  ], [
    opt('Géotextile anti-herbes', 'm²', 3),
    opt('Bordure contention', 'ml', 12),
  ]);

  const pkgAllee = (revetementTache, revetementPrix) => pkg([
    line('Terrassement', 'm²', 8, Q.surface),
    line('Pose géotextile', 'm²', 4, Q.surface),
    line(revetementTache, 'm²', revetementPrix, Q.surface),
    line('Finitions bords', 'ml', 9, Q.perimetre),
  ], [
    opt('Bordure contention', 'ml', 12),
    opt('Éclairage solaire', 'u', 45),
  ]);

  const pkgParking = (revetementTache, revetementPrix) => pkg([
    line('Terrassement', 'm²', 10, Q.surface),
    line('Pose géotextile', 'm²', 4, Q.surface),
    line('Pose grave compactée', 'm²', 18, Q.surface),
    line('Pose stabilisateur', 'm²', 15, Q.surface),
    line(revetementTache, 'm²', revetementPrix, Q.surface),
  ], [
    opt('Bordure contention', 'ml', 12),
    opt('Éclairage solaire', 'u', 85),
    opt('Marquage au sol', 'forfait', 180),
  ]);

  const pkgBassin = (poseTache, posePrix) => pkg([
    line('Terrassement', 'm³', 90, Q.volume),
    line(poseTache, 'u', posePrix, Q.unite),
    line('Raccordement eau', 'forfait', 250, Q.forfait),
    line('Étanchéité bords', 'ml', 35, Q.perimetre),
  ], [
    opt('Pompe filtration', 'u', 180),
    opt('Éclairage submersible', 'u', 120),
    opt('Plantes aquatiques', 'u', 25),
    opt('Filtration UV', 'u', 220),
  ]);

  const pkgTerrasse = (revetementTache, revetementPrix) => pkg([
    line('Terrassement', 'm²', 10, Q.surface),
    line('Pose structure / lambourdes', 'm²', 15, Q.surface),
    line(revetementTache, 'm²', revetementPrix, Q.surface),
    line('Finitions bords', 'ml', 12, Q.perimetre),
  ], [
    opt('Éclairage intégré', 'forfait', 380),
    opt('Garde-corps', 'ml', 85),
  ]);

  const pkgStructure = (poseTache, unite, posePrix) => pkg([
    line('Préparation emplacement', 'm²', 8, Q.surface),
    line(poseTache, unite, posePrix, unite === 'u' ? Q.unite : Q.surface),
    line('Finitions / traitement', 'forfait', Math.round(posePrix * 0.1), Q.forfait),
  ], [
    opt('Éclairage intégré', 'forfait', 250),
    opt('Store / voile', 'u', 280),
  ]);

  const pkgCloture = (poseTache, posePrix) => pkg([
    line('Terrassement implantation', 'ml', 12, Q.longueur),
    line('Pose poteaux + fondations béton', 'ml', 34, Q.longueur),
    line(poseTache, 'ml', posePrix, Q.longueur),
  ], [
    opt('Portail battant', 'u', 1030),
    opt('Portillon', 'u', 415),
    opt('Traitement / lasure bois', 'ml', 8),
  ]);

  const pkgArrosage = (poseTache, posePrix) => pkg([
    line('Création tranchées', 'ml', 12, Q.longueur),
    line(poseTache, 'ml', posePrix, Q.longueur),
    line('Raccordement eau', 'forfait', 85, Q.forfait),
    line('Pose programmateur', 'u', 85, Q.unite),
  ], [
    opt('Capteur de pluie', 'u', 45),
    opt('Sonde humidité', 'u', 65),
  ]);

  const pkgAireJeux = (surfaceTache, surfacePrix) => pkg([
    line('Terrassement', 'm²', 7, Q.surface),
    line('Pose géotextile', 'm²', 4, Q.surface),
    line(surfaceTache, 'm²', surfacePrix, Q.surface),
    line('Bordure contention', 'ml', 12, Q.perimetre),
  ], [
    opt('Recharge annuelle', 'forfait', 180),
  ]);

  const pkgPotagerSerre = (poseTache, posePrix) => pkg([
    line('Préparation emplacement', 'u', 45, Q.unite),
    line(poseTache, 'u', posePrix, Q.unite),
    line('Remplissage terre végétale', 'u', 60, Q.unite),
  ], [
    opt('Arrosage goutte-à-goutte', 'u', 95),
    opt('Composteur', 'u', 85),
  ]);

  window.BddPaysagismeV2 = {
    sections: [
      { id: 1, libelle: 'Préparation & Terrassement', icone: '🌱' },
      { id: 2, libelle: 'Végétalisation', icone: '🌿' },
      { id: 3, libelle: 'Allées & Circulations', icone: '🧱' },
      { id: 4, libelle: "Bassins & Pièces d'eau", icone: '💧' },
      { id: 5, libelle: 'Terrasses & Structures', icone: '🪵' },
      { id: 6, libelle: 'Clôtures', icone: '🔒' },
      { id: 7, libelle: 'Arrosage & Éclairage', icone: '💡' },
      { id: 8, libelle: 'Aires de jeux & Zones fonctionnelles', icone: '🧩' },
      { id: 9, libelle: 'Entretien & Finitions', icone: '🧼' },
    ],

    prestations: [
      p('PAYS_S1_001', 1, 'Décapage terre végétale', 'm²', 0, 5, pkgPreparationSimple('Décapage terre végétale')),
      p('PAYS_S1_002', 1, 'Décompactage / reprise du sol', 'm²', 2, 6, pkgPreparationSimple('Décompactage / reprise du sol')),
      p('PAYS_S1_003', 1, 'Nivellement / réglage des pentes', 'm²', 0, 7, pkgPreparationSimple('Nivellement / réglage des pentes')),
      p('PAYS_S1_004', 1, 'Apport de terre végétale', 'm³', 35, 15, pkg([
        line('Décapage', 'm²', 5, Q.surface),
        line('Apport terre végétale', 'm³', 50, Q.volume),
      ], [opt('Amendement', 'm²', 4)])),
      p('PAYS_S1_005', 1, 'Évacuation des terres', 'm³', 0, 35, pkg([
        line('Chargement', 'm³', 15, Q.volume),
        line('Évacuation des terres', 'm³', 35, Q.volume),
      ])),
      p('PAYS_S1_006', 1, 'Pose géotextile anti-repousse', 'm²', 2, 3, autoSelf('Pose géotextile anti-repousse', 'm²', 5, Q.surface, [opt('Agrafes fixation', 'u', 0.5)])),
      p('PAYS_S1_007', 1, 'Création tranchée technique (arrosage/élec/drainage)', 'ml', 5, 12, pkg([
        line('Terrassement tranchée', 'ml', 12, Q.longueur),
        line('Remblai', 'ml', 6, Q.longueur),
      ], [opt('Grillage avertisseur', 'ml', 2)])),

      p('PAYS_S2_001', 2, 'Création pelouse semis', 'm²', 3, 8, pkgPelouse('Semis', 3)),
      p('PAYS_S2_002', 2, 'Pose gazon rouleau', 'm²', 12, 8, pkgPelouse('Pose rouleau', 12)),
      p('PAYS_S2_003', 2, 'Gazon synthétique', 'm²', 35, 12, pkgPelouse('Pose synthétique', 35)),
      p('PAYS_S2_004', 2, 'Plantation haie persistante', 'ml', 25, 15, pkgHaie('Plantation haie persistante')),
      p('PAYS_S2_005', 2, 'Plantation haie caduque', 'ml', 18, 15, pkgHaie('Plantation haie caduque')),
      p('PAYS_S2_006', 2, 'Plantation haie fleurie', 'ml', 22, 15, pkgHaie('Plantation haie fleurie')),
      p('PAYS_S2_007', 2, 'Plantation haie défensive', 'ml', 20, 15, pkgHaie('Plantation haie défensive')),
      p('PAYS_S2_008', 2, 'Plantation haie libre/champêtre', 'ml', 15, 15, pkgHaie('Plantation haie libre/champêtre')),
      p('PAYS_S2_009', 2, 'Plantation haie taillée (if, troène)', 'ml', 28, 15, pkgHaie('Plantation haie taillée')),
      p('PAYS_S2_010', 2, 'Plantation arbre petit sujet (< 2m)', 'u', 45, 35, pkgArbre('Plantation arbre petit sujet')),
      p('PAYS_S2_011', 2, 'Plantation arbre moyen sujet (2-4m)', 'u', 120, 55, pkgArbre('Plantation arbre moyen sujet')),
      p('PAYS_S2_012', 2, 'Plantation arbre grand sujet (> 4m)', 'u', 350, 120, pkgArbre('Plantation arbre grand sujet')),
      p('PAYS_S2_013', 2, 'Plantation arbustes et vivaces', 'u', 25, 20, pkgArbre('Plantation arbustes et vivaces')),
      p('PAYS_S2_014', 2, 'Création massif décoratif', 'm²', 18, 12, pkgMassif()),
      p('PAYS_S2_015', 2, 'Paillage minéral (graviers, pouzzolane)', 'm²', 8, 4, autoSelf('Paillage minéral', 'm²', 12, Q.surface)),
      p('PAYS_S2_016', 2, 'Paillage organique (copeaux, écorces)', 'm²', 5, 4, autoSelf('Paillage organique', 'm²', 9, Q.surface)),
      p('PAYS_S2_017', 2, 'Engazonnement renforcé (dalles engazonnées)', 'm²', 22, 10, pkgPelouse('Pose dalles engazonnées', 22)),

      p('PAYS_S3_001', 3, 'Allée graviers stabilisés', 'm²', 18, 10, pkgAllee('Pose graviers stabilisés', 28)),
      p('PAYS_S3_002', 3, 'Allée dallage béton', 'm²', 35, 18, pkgAllee('Pose dallage béton', 53)),
      p('PAYS_S3_003', 3, 'Allée pavés pierre naturelle', 'm²', 65, 25, pkgAllee('Pose pavés pierre naturelle', 90)),
      p('PAYS_S3_004', 3, 'Allée pavés béton', 'm²', 28, 18, pkgAllee('Pose pavés béton', 46)),
      p('PAYS_S3_005', 3, 'Allée pas japonais', 'u', 25, 15, pkg([line('Pose pas japonais', 'u', 40, Q.unite)], [opt('Éclairage solaire', 'u', 45)])),
      p('PAYS_S3_006', 3, 'Allée béton désactivé', 'm²', 45, 20, pkgAllee('Pose béton désactivé', 65)),
      p('PAYS_S3_007', 3, 'Allée béton classique', 'm²', 35, 18, pkgAllee('Pose béton classique', 53)),
      p('PAYS_S3_008', 3, 'Allée enrobé', 'm²', 25, 15, pkgAllee('Pose enrobé', 40)),
      p('PAYS_S3_009', 3, 'Allée stabilisé (sable + liant)', 'm²', 12, 10, pkgAllee('Pose stabilisé sable + liant', 22)),
      p('PAYS_S3_010', 3, 'Allée traverses paysagères bois', 'm²', 38, 18, pkgAllee('Pose traverses paysagères bois', 56)),
      p('PAYS_S3_011', 3, 'Allée résine drainante', 'm²', 55, 20, pkgAllee('Pose résine drainante', 75)),
      p('PAYS_S3_012', 3, 'Allée dalles alvéolaires', 'm²', 22, 12, pkgAllee('Pose dalles alvéolaires', 34)),
      p('PAYS_S3_013', 3, 'Bordure béton', 'ml', 8, 8, autoSelf('Pose bordure béton', 'ml', 16, Q.longueur)),
      p('PAYS_S3_014', 3, 'Bordure acier cor-ten', 'ml', 22, 8, autoSelf('Pose bordure acier cor-ten', 'ml', 30, Q.longueur)),
      p('PAYS_S3_015', 3, 'Bordure pierre naturelle', 'ml', 35, 10, autoSelf('Pose bordure pierre naturelle', 'ml', 45, Q.longueur)),
      p('PAYS_S3_016', 3, 'Bordure bois', 'ml', 12, 8, autoSelf('Pose bordure bois', 'ml', 20, Q.longueur)),
      p('PAYS_S3_017', 3, 'Parking stabilisé gravier', 'm²', 45, 22, pkgParking('Pose gravier de finition', 12)),
      p('PAYS_S3_018', 3, 'Parking béton / enrobé', 'm²', 55, 25, pkgParking('Pose béton / enrobé', 80)),
      p('PAYS_S3_019', 3, "Rampe d'accès PMR", 'm²', 40, 25, pkgAllee("Création rampe d'accès PMR", 65)),

      p('PAYS_S4_001', 4, 'Bassin décoratif / ornemental', 'u', 180, 120, pkgBassin('Pose bassin décoratif / ornemental', 300)),
      p('PAYS_S4_002', 4, 'Bassin naturel / mare paysagère', 'm²', 25, 35, pkgBassin('Pose bassin naturel / mare paysagère', 60)),
      p('PAYS_S4_003', 4, 'Bassin à carpes Koï', 'm²', 85, 65, pkgBassin('Pose bassin à carpes Koï', 150)),
      p('PAYS_S4_004', 4, 'Bassin préformé', 'u', 250, 180, pkgBassin('Pose bassin préformé', 430)),
      p('PAYS_S4_005', 4, 'Bassin bâche EPDM sur mesure', 'm²', 35, 45, pkgBassin('Pose bâche EPDM sur mesure', 80)),
      p('PAYS_S4_006', 4, 'Fontaine / cascade / ruisseau', 'u', 350, 200, autoSelf('Pose fontaine / cascade / ruisseau', 'u', 550, Q.unite)),
      p('PAYS_S4_007', 4, 'Pompe filtration bassin', 'u', 180, 45, autoSelf('Pose pompe filtration bassin', 'u', 225, Q.unite)),
      p('PAYS_S4_008', 4, 'Filtration UV bassin', 'u', 220, 45, autoSelf('Pose filtration UV bassin', 'u', 265, Q.unite)),
      p('PAYS_S4_009', 4, 'Éclairage submersible', 'u', 120, 35, autoSelf('Pose éclairage submersible', 'u', 155, Q.unite)),

      p('PAYS_S5_001', 5, 'Terrasse bois', 'm²', 55, 25, pkgTerrasse('Pose terrasse bois', 80)),
      p('PAYS_S5_002', 5, 'Terrasse composite', 'm²', 75, 25, pkgTerrasse('Pose terrasse composite', 100)),
      p('PAYS_S5_003', 5, 'Terrasse carrelage extérieur', 'm²', 45, 30, pkgTerrasse('Pose terrasse carrelage extérieur', 75)),
      p('PAYS_S5_004', 5, 'Terrasse béton désactivé', 'm²', 45, 22, pkgTerrasse('Pose terrasse béton désactivé', 67)),
      p('PAYS_S5_005', 5, 'Pergola bois', 'm²', 180, 80, pkgStructure('Pose pergola bois', 'm²', 260)),
      p('PAYS_S5_006', 5, 'Pergola aluminium', 'm²', 250, 80, pkgStructure('Pose pergola aluminium', 'm²', 330)),
      p('PAYS_S5_007', 5, 'Pergola bioclimatique', 'm²', 450, 120, pkgStructure('Pose pergola bioclimatique', 'm²', 570)),
      p('PAYS_S5_008', 5, "Tonnelle / voile d'ombrage", 'u', 350, 120, pkgStructure("Pose tonnelle / voile d'ombrage", 'u', 470)),
      p('PAYS_S5_009', 5, 'Abri de jardin / local technique', 'u', 800, 300, pkgStructure('Pose abri de jardin / local technique', 'u', 1100)),
      p('PAYS_S5_010', 5, 'Claustra / brise-vue bois', 'm²', 55, 25, pkgStructure('Pose claustra / brise-vue bois', 'm²', 80)),
      p('PAYS_S5_011', 5, 'Claustra / brise-vue aluminium', 'm²', 85, 25, pkgStructure('Pose claustra / brise-vue aluminium', 'm²', 110)),
      p('PAYS_S5_012', 5, 'Muret décoratif parpaings', 'ml', 45, 35, pkgStructure('Pose muret décoratif parpaings', 'm²', 80)),
      p('PAYS_S5_013', 5, 'Muret pierre naturelle', 'ml', 95, 55, pkgStructure('Pose muret pierre naturelle', 'm²', 150)),
      p('PAYS_S5_014', 5, 'Muret gabions', 'ml', 75, 45, pkgStructure('Pose muret gabions', 'm²', 120)),

      p('PAYS_S6_001', 6, 'Clôture grillage souple', 'ml', 12, 18, pkgCloture('Pose clôture grillage souple', 30)),
      p('PAYS_S6_002', 6, 'Clôture grillage rigide panneaux', 'ml', 22, 18, pkgCloture('Pose clôture grillage rigide panneaux', 40)),
      p('PAYS_S6_003', 6, 'Clôture barreaudage acier', 'ml', 45, 25, pkgCloture('Pose clôture barreaudage acier', 70)),
      p('PAYS_S6_004', 6, 'Clôture fer forgé', 'ml', 85, 35, pkgCloture('Pose clôture fer forgé', 120)),
      p('PAYS_S6_005', 6, 'Clôture aluminium barreaudée', 'ml', 65, 25, pkgCloture('Pose clôture aluminium barreaudée', 90)),
      p('PAYS_S6_006', 6, 'Palissade bois pleine', 'ml', 35, 22, pkgCloture('Pose palissade bois pleine', 57)),
      p('PAYS_S6_007', 6, 'Clôture bois ajourée / lames', 'ml', 42, 22, pkgCloture('Pose clôture bois ajourée / lames', 64)),
      p('PAYS_S6_008', 6, 'Claustra bois décoratif', 'ml', 55, 25, pkgCloture('Pose claustra bois décoratif', 80)),
      p('PAYS_S6_009', 6, 'Traverses paysagères', 'ml', 28, 20, pkgCloture('Pose traverses paysagères', 48)),
      p('PAYS_S6_010', 6, 'Clôture composite', 'ml', 58, 22, pkgCloture('Pose clôture composite', 80)),
      p('PAYS_S6_011', 6, 'Clôture PVC pleine', 'ml', 38, 20, pkgCloture('Pose clôture PVC pleine', 58)),
      p('PAYS_S6_012', 6, 'Clôture PVC ajourée', 'ml', 32, 20, pkgCloture('Pose clôture PVC ajourée', 52)),
      p('PAYS_S6_013', 6, 'Mur clôture parpaings', 'ml', 55, 45, pkgCloture('Pose mur clôture parpaings', 100)),
      p('PAYS_S6_014', 6, 'Mur clôture pierre', 'ml', 120, 65, pkgCloture('Pose mur clôture pierre', 185)),
      p('PAYS_S6_015', 6, 'Clôture gabions', 'ml', 85, 45, pkgCloture('Pose clôture gabions', 130)),
      p('PAYS_S6_016', 6, 'Muret + panneaux', 'ml', 75, 45, pkgCloture('Pose muret + panneaux', 120)),
      p('PAYS_S6_017', 6, 'Panneaux occultants bois', 'ml', 48, 22, pkgCloture('Pose panneaux occultants bois', 70)),
      p('PAYS_S6_018', 6, 'Panneaux occultants composite', 'ml', 62, 22, pkgCloture('Pose panneaux occultants composite', 84)),
      p('PAYS_S6_019', 6, 'Clôture électrique', 'ml', 8, 12, pkgCloture('Pose clôture électrique', 20)),
      p('PAYS_S6_020', 6, 'Clôture de piscine normée', 'ml', 95, 45, pkgCloture('Pose clôture de piscine normée', 140)),
      p('PAYS_S6_021', 6, 'Portail battant (fourni + posé)', 'u', 850, 180, autoSelf('Pose portail battant', 'u', 1030, Q.unite)),
      p('PAYS_S6_022', 6, 'Portail coulissant (fourni + posé)', 'u', 1200, 220, autoSelf('Pose portail coulissant', 'u', 1420, Q.unite)),
      p('PAYS_S6_023', 6, 'Portillon (fourni + posé)', 'u', 320, 95, autoSelf('Pose portillon', 'u', 415, Q.unite)),

      p('PAYS_S7_001', 7, 'Arrosage automatique turbines', 'forfait', 350, 180, pkgArrosage('Pose réseau arrosage automatique turbines', 20)),
      p('PAYS_S7_002', 7, 'Réseau arrosage enterré', 'ml', 8, 12, pkgArrosage('Pose réseau arrosage enterré', 20)),
      p('PAYS_S7_003', 7, 'Arrosage goutte-à-goutte', 'ml', 5, 8, pkgArrosage('Pose arrosage goutte-à-goutte', 13)),
      p('PAYS_S7_004', 7, 'Programmateur arrosage', 'u', 85, 35, autoSelf('Pose programmateur arrosage', 'u', 120, Q.unite)),
      p('PAYS_S7_005', 7, 'Éclairage extérieur spots', 'u', 45, 35, autoSelf('Pose éclairage extérieur spots', 'u', 80, Q.unite)),
      p('PAYS_S7_006', 7, 'Éclairage bornes LED', 'u', 65, 35, autoSelf('Pose éclairage bornes LED', 'u', 100, Q.unite)),
      p('PAYS_S7_007', 7, 'Éclairage submersible', 'u', 120, 35, autoSelf('Pose éclairage submersible', 'u', 155, Q.unite)),
      p('PAYS_S7_008', 7, 'Uplight arbre (mise en valeur)', 'u', 55, 30, autoSelf('Pose uplight arbre', 'u', 85, Q.unite)),
      p('PAYS_S7_009', 7, 'Réseau électrique extérieur', 'ml', 12, 15, autoSelf('Pose réseau électrique extérieur', 'ml', 27, Q.longueur)),

      p('PAYS_S8_001', 8, 'Surface amortissante copeaux', 'm²', 12, 10, pkgAireJeux('Pose surface amortissante copeaux', 22)),
      p('PAYS_S8_002', 8, 'Surface amortissante sable', 'm²', 8, 8, pkgAireJeux('Pose surface amortissante sable', 16)),
      p('PAYS_S8_003', 8, 'Dalle EPDM amortissante', 'm²', 65, 25, pkgAireJeux('Pose dalle EPDM amortissante', 90)),
      p('PAYS_S8_004', 8, 'Dalles caoutchouc', 'm²', 45, 20, pkgAireJeux('Pose dalles caoutchouc', 65)),
      p('PAYS_S8_005', 8, 'Carré potager bois', 'u', 85, 60, pkgPotagerSerre('Pose carré potager bois', 145)),
      p('PAYS_S8_006', 8, 'Serre de jardin', 'u', 450, 180, pkgPotagerSerre('Pose serre de jardin', 630)),
      p('PAYS_S8_007', 8, 'Composteur', 'u', 85, 25, autoSelf('Pose composteur', 'u', 110, Q.unite)),
      p('PAYS_S8_008', 8, 'Zone détente (brasero, coin feu)', 'forfait', 350, 120, autoSelf('Création zone détente', 'forfait', 470, Q.forfait)),
      p('PAYS_S8_009', 8, 'Bac / jardinière plantée', 'u', 65, 35, autoSelf('Pose bac / jardinière plantée', 'u', 100, Q.unite)),

      p('PAYS_S9_001', 9, 'Désherbage initial', 'm²', 0, 4, autoSelf('Désherbage initial', 'm²', 4, Q.surface)),
      p('PAYS_S9_002', 9, 'Taille de formation', 'u', 0, 45, autoSelf('Taille de formation', 'u', 45, Q.unite)),
      p('PAYS_S9_003', 9, 'Apport engrais / amendements', 'm²', 3, 3, autoSelf('Apport engrais / amendements', 'm²', 6, Q.surface)),
      p('PAYS_S9_004', 9, 'Nettoyage fin de chantier intérieur', 'forfait', 0, 85, autoSelf('Nettoyage fin de chantier intérieur', 'forfait', 85, Q.forfait)),
      p('PAYS_S9_005', 9, 'Nettoyage fin de chantier extérieur', 'forfait', 0, 120, autoSelf('Nettoyage fin de chantier extérieur', 'forfait', 120, Q.forfait)),
      p('PAYS_S9_006', 9, 'Mise en service bassin', 'forfait', 25, 65, autoSelf('Mise en service bassin', 'forfait', 90, Q.forfait)),
      p('PAYS_S9_007', 9, 'Mise en service arrosage', 'forfait', 15, 45, autoSelf('Mise en service arrosage', 'forfait', 60, Q.forfait)),
      p('PAYS_S9_008', 9, 'Évacuation végétaux / déchets verts', 'm³', 0, 45, autoSelf('Évacuation végétaux / déchets verts', 'm³', 45, Q.volume)),
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
