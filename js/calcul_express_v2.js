/**
 * PlaqPro+ — Calcul Express V2
 * Flux : chantier + client → profil → sous-traitants → corps métiers → pièces → Métrage → résultat
 * Architecture validée 02/06/2026
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 */
/* global App, DB, BddV2 */

const CalcExpressV2 = {

  // ── État ──────────────────────────────────────────────────
  _containerId:   null,
  _container:     null,
  _etape:         null,
  _chantier:      { nom: '', clientId: null, adresse: '', ville: '', codePostal: '' },
  _profil:        null,
  _sousTraitants: [],
  _corpsActifs:   [],
  _pieces:        [],
  _resultats:     {},
  _surfacesMemorisees: {},
  _bindController: null,
  _modeModif: false,

  // ── Corps disponibles ─────────────────────────────────────
  CORPS: [
    { id: 'plaquisterie', label: 'Plâtrerie', icone: '🧱' },
    { id: 'peinture',     label: 'Peinture',     icone: '🎨' },
    { id: 'electricite',  label: 'Électricité',  icone: '⚡' },
    { id: 'plomberie',    label: 'Plomberie',    icone: '🔧' },
    { id: 'maconnerie',   label: 'Maçonnerie',   icone: '🏗' },
    { id: 'revetement',   label: 'Revêtement de sol', icone: '🪵', couleur: '#8B4513' },
    { id: 'paysagisme',   label: 'Paysagisme',   icone: '🌿' },
  ],

  // ── Pièces par profil ─────────────────────────────────────
  PIECES_PROFIL: {
    particulier: ['Buanderie', 'Cave', 'Chambre 1', 'Chambre 2', 'Chambre 3',
                  'Couloir', 'Cuisine', 'Entrée', 'Garage', 'Salon',
                  'Salle de bain', 'Séjour', 'WC'],
    pro: [
      'Accueil',
      'Bureau',
      'Couloir',
      'Dépôt',
      'Espace commun',
      'Espace pause',
      'Hall',
      'Local informatique',
      'Local technique',
      'Salle de conférence',
      'Salle de réunion',
      'Sanitaires',
      'Show-room',
    ],
    ao:          [],
  },

  // ── Appareillage par corps (électricité + plomberie) ─────
  APPAREILLAGE: {
    electricite: [
      { id:'prise_simple',    label:'Prise simple',            icone:'🔌', cat:'Prises' },
      { id:'prise_double',    label:'Prise double',            icone:'🔌', cat:'Prises' },
      { id:'prise_double_usb',label:'Prise double + USB',      icone:'🔌', cat:'Prises' },
      { id:'prise_20a',       label:'Prise 20A (cuisine)',     icone:'🔌', cat:'Prises' },
      { id:'prise_etanche',   label:'Prise étanche ext.',      icone:'🔌', cat:'Prises' },
      { id:'prise_rj45',      label:'Prise RJ45',              icone:'🌐', cat:'Prises' },
      { id:'inter_simple',    label:'Interrupteur simple',     icone:'💡', cat:'Commandes' },
      { id:'inter_vv',        label:'Va-et-vient',             icone:'💡', cat:'Commandes' },
      { id:'inter_double',    label:'Interrupteur double',     icone:'💡', cat:'Commandes' },
      { id:'variateur',       label:'Variateur',               icone:'💡', cat:'Commandes' },
      { id:'inter_etanche',   label:'Interrupteur étanche',    icone:'💡', cat:'Commandes' },
      { id:'point_dcl',       label:'Point lumineux DCL',      icone:'🔆', cat:'Éclairage' },
      { id:'spot_encastre',   label:'Spot encastré',           icone:'🔆', cat:'Éclairage' },
      { id:'applique',        label:'Applique murale',         icone:'🔆', cat:'Éclairage' },
      { id:'hublot_ext',      label:'Hublot extérieur',        icone:'🔆', cat:'Éclairage' },
      { id:'tableau_13m',     label:'Tableau 13 modules',      icone:'⚡', cat:'Tableau' },
      { id:'tableau_26m',     label:'Tableau 26 modules',      icone:'⚡', cat:'Tableau' },
      { id:'disjoncteur',     label:'Disjoncteur différentiel',icone:'⚡', cat:'Tableau' },
      { id:'vmc',             label:'VMC simple flux',         icone:'💨', cat:'Divers' },
      { id:'chauffe_eau',     label:'Chauffe-eau électrique',  icone:'🌡', cat:'Divers' },
    ],
    plomberie: [
      { id:'wc_standard',     label:'WC standard',             icone:'🚽', cat:'Sanitaires' },
      { id:'wc_suspendu',     label:'WC suspendu',             icone:'🚽', cat:'Sanitaires' },
      { id:'lavabo',          label:'Lavabo',                  icone:'🚿', cat:'Sanitaires' },
      { id:'evier_1bac',      label:'Évier 1 bac',             icone:'🚿', cat:'Sanitaires' },
      { id:'evier_2bacs',     label:'Évier 2 bacs',            icone:'🚿', cat:'Sanitaires' },
      { id:'douche_receveur', label:'Receveur douche',         icone:'🚿', cat:'Sanitaires' },
      { id:'douche_italienne',label:"Douche à l'italienne",    icone:'🚿', cat:'Sanitaires' },
      { id:'baignoire',       label:'Baignoire',               icone:'🛁', cat:'Sanitaires' },
      { id:'baignoire_balneo',label:'Baignoire balnéo',        icone:'🛁', cat:'Sanitaires' },
      { id:'lave_linge',      label:'Arrivée lave-linge',      icone:'🔧', cat:'Raccordements' },
      { id:'lave_vaisselle',  label:'Arrivée lave-vaisselle',  icone:'🔧', cat:'Raccordements' },
      { id:'robinet_ext',     label:'Robinet extérieur',       icone:'🔧', cat:'Raccordements' },
      { id:'mitigeur_lavabo', label:'Mitigeur lavabo',         icone:'🔧', cat:'Robinetterie' },
      { id:'mitigeur_douche', label:'Mitigeur douche',         icone:'🔧', cat:'Robinetterie' },
      { id:'mitigeur_evier',  label:'Mitigeur évier',          icone:'🔧', cat:'Robinetterie' },
      { id:'vasque',          label:'Vasque',                  icone:'🚿', cat:'Sanitaires' },
      { id:'robinetterie_cuisine', label:'Robinetterie cuisine', icone:'🔧', cat:'Robinetterie' },
      { id:'robinetterie_sdb', label:'Robinetterie SDB',       icone:'🔧', cat:'Robinetterie' },
      { id:'robinetterie_wc', label:'Robinetterie WC',         icone:'🔧', cat:'Robinetterie' },
      { id:'cumulus',         label:'Cumulus',                  icone:'🌡', cat:'Divers' },
      { id:'vmc',             label:'VMC',                      icone:'💨', cat:'Divers' },
      { id:'seche_serviette', label:'Sèche-serviette',          icone:'🌡', cat:'Divers' },
      { id:'arrivee_eau',     label:"Arrivée d'eau",           icone:'🔧', cat:'Extérieur' },
      { id:'evacuation_ep',   label:'Évacuation EP',            icone:'🔧', cat:'Extérieur' },
      { id:'regard',          label:'Regard',                   icone:'🔧', cat:'Extérieur' },
      { id:'pompe_arrosage',  label:'Pompe arrosage',           icone:'🔧', cat:'Extérieur' },
      { id:'robinet',         label:'Robinet',                  icone:'🔧', cat:'Raccordements' },
      { id:'evacuation',      label:'Évacuation',               icone:'🔧', cat:'Raccordements' },
      { id:'arrosage',        label:'Arrosage',                 icone:'💧', cat:'Extérieur' },
      { id:'lave_mains',      label:'Lave-mains',               icone:'🚿', cat:'Sanitaires' },
      { id:'adoucisseur',     label:'Adoucisseur',              icone:'💧', cat:'Divers' },
      { id:'pompe_relevage',  label:'Pompe de relevage',        icone:'🔧', cat:'Divers' },
      { id:'radiateur_eau',   label:'Radiateur eau',            icone:'🌡', cat:'Chauffage' },
      { id:'nourrice',        label:'Nourrice distribution',   icone:'🔧', cat:'Divers' },
      { id:'vanne_arret',     label:"Vanne d'arrêt",           icone:'🔧', cat:'Divers' },
    ],
  },

  // ── Linéaires neuf par corps ──────────────────────────────
  LINEAIRES: {
    electricite: [
      { id:'cable_15',  label:'Câble 1.5mm² (éclairage)', unite:'ml', placeholder:'ex: 80' },
      { id:'cable_25',  label:'Câble 2.5mm² (prises)',    unite:'ml', placeholder:'ex: 120' },
      { id:'gaine_irl', label:'Gaine IRL (optionnel)',    unite:'ml', placeholder:'ex: 60' },
    ],
    plomberie: [
      { id:'per_16',    label:'Alimentation PER 16',      unite:'ml', placeholder:'ex: 25' },
      { id:'per_20',    label:'Alimentation PER 20',      unite:'ml', placeholder:'ex: 15' },
      { id:'pvc_40',    label:'Évacuation PVC 40',        unite:'ml', placeholder:'ex: 12' },
      { id:'pvc_100',   label:'Évacuation PVC 100',       unite:'ml', placeholder:'ex: 8' },
    ],
  },

  REVETEMENT_OUVRAGES: [
    'OUV_PARQUET_MASSIF',
    'OUV_PARQUET_CONTRECOLLE',
    'OUV_STRATIFIE',
    'OUV_VINYLE_LVT',
    'OUV_CARRELAGE_SOL',
    'OUV_CARRELAGE_GRAND_FORMAT',
    'OUV_BETON_CIRE',
    'OUV_MOQUETTE',
    'OUV_RESINE_SOL',
  ],

  // ── Lieux par corps de métier (prioritaire sur profil) ────
  LIEUX_CORPS: {
    paysagisme:  ['Aire de jeux', 'Jardin', 'Allée', 'Bassin / pièce d\'eau',
                  'Clôture', 'Haie', 'Massif fleuri', 'Parking', 'Potager',
                  'Talus', 'Terrasse', 'Zone boisée'],
    maconnerie_int: {
      pieces: ['Chambre', 'Couloir', 'Cuisine', 'Entrée', 'Salle de bain', 'Salon', 'Séjour'],
      prestations: ['Cloison briques', 'Cloison brique de verre', 'Mur porteur', 'Doublage'],
    },
    maconnerie_ext: {
      zones: ['Façade', 'Mur de clôture', 'Mur pignon', 'Soubassement', 'Terrasse béton'],
      prestations: ['Enduit façade', 'Ravalement', 'Parpaing', 'Brique de parement'],
    },
    electricite: ['Cave', 'Chambre 1', 'Chambre 2', 'Cuisine', 'Extérieur',
                  'Garage', 'Salle de bain', 'Salon', 'Séjour', 'Tableau principal',
                  'Tableau secondaire'],
    plomberie:   ['Buanderie', 'Cave', 'Chaufferie', 'Cuisine', 'Extérieur',
                  'Garage', 'Salle de bain 1', 'Salle de bain 2', 'WC'],
    revetement:  null,
  },

  SECTIONS_PAR_ZONE: {
    'Aire de jeux':       [1, 8, 9],
    'Allée':              [1, 3, 7, 9],
    "Bassin / pièce d'eau": [1, 4, 7, 9],
    'Clôture':            [6],
    'Haie':               [1, 2, 9],
    'Massif fleuri':      [1, 2, 9],
    'Parking':            [1, 3, 9],
    'Potager':            [1, 8, 9],
    'Talus':              [1, 2, 9],
    'Terrasse':           [1, 5, 7, 9],
    'Zone boisée':        [1, 2, 9],
    'Gazon':              [1, 2, 7, 9],
    'Massif':             [1, 2, 9],
    'Bordure':            [1, 3, 9],
    'Haie / Clôture':     [1, 2, 6, 9],
    'Chemin':             [1, 3, 9],
    'Pièce d\'eau':       [1, 4, 7, 9],
    'Jardin':             [1, 2, 3, 4, 5, 7, 9],
    'Extérieur':          [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },

  PRESTATIONS_PAYSAGISME: {
    'Aire de jeux':         ['OUV_AIRE_JEUX_SOL','OUV_GAZON_ROULEAU','OUV_TERRASSEMENT_PREP'],
    'Allée':                ['OUV_ALLEE_GRAVIERS','OUV_ALLEE_DALLAGE','OUV_BORDURE_JARDIN'],
    "Bassin / pièce d'eau": ['OUV_BASSIN_PREFAB','OUV_TERRASSEMENT_PREP'],
    'Clôture':              ['OUV_CLOTURE_BETON','OUV_CLOTURE_BOIS','OUV_HAIE_PLANTATION'],
    'Haie':                 ['OUV_HAIE_PLANTATION','OUV_TERRASSEMENT_PREP'],
    'Jardin arrière':       ['OUV_GAZON_ROULEAU','OUV_MASSIF_PAILLAGE','OUV_TERRASSEMENT_PREP','OUV_BORDURE_JARDIN'],
    'Jardin avant':         ['OUV_GAZON_ROULEAU','OUV_MASSIF_PAILLAGE','OUV_TERRASSEMENT_PREP','OUV_BORDURE_JARDIN'],
    'Massif fleuri':        ['OUV_MASSIF_PAILLAGE','OUV_BORDURE_JARDIN','OUV_TERRASSEMENT_PREP'],
    'Parking':              ['OUV_PARKING_STABILISE','OUV_ALLEE_DALLAGE','OUV_TERRASSE_BETON_DESACTIVE'],
    'Pelouse':              ['OUV_GAZON_ROULEAU','OUV_TERRASSEMENT_PREP','OUV_TALUS_ENGAZONNEMENT'],
    'Potager':              ['OUV_POTAGER_CARRE','OUV_TERRASSEMENT_PREP','OUV_BORDURE_JARDIN'],
    'Talus':                ['OUV_TALUS_ENGAZONNEMENT','OUV_HAIE_PLANTATION','OUV_TERRASSEMENT_PREP'],
    'Terrasse':             ['OUV_TERRASSE_BETON_DESACTIVE','OUV_ALLEE_DALLAGE','OUV_BORDURE_JARDIN'],
    'Zone boisée':          ['OUV_HAIE_PLANTATION','OUV_TERRASSEMENT_PREP','OUV_MASSIF_PAILLAGE'],
    'Terrasse extérieure':      ['OUV_TERRASSE_BETON_DESACTIVE','OUV_ALLEE_DALLAGE','OUV_BORDURE_JARDIN'],
    'Aire de stationnement':    ['OUV_PARKING_STABILISE','OUV_ALLEE_DALLAGE','OUV_TERRASSEMENT_PREP'],
    'Clôture périmétrique':     ['OUV_CLOTURE_BETON','OUV_CLOTURE_BOIS','OUV_HAIE_PLANTATION'],
    'Espace vert commun':       ['OUV_GAZON_ROULEAU','OUV_MASSIF_PAILLAGE','OUV_TERRASSEMENT_PREP'],
    'Façade végétalisée':       ['OUV_HAIE_PLANTATION','OUV_MASSIF_PAILLAGE','OUV_TERRASSEMENT_PREP'],
    'Accès principal':          ['OUV_ALLEE_GRAVIERS','OUV_ALLEE_DALLAGE','OUV_BORDURE_JARDIN'],
    'Zone de livraison':        ['OUV_PARKING_STABILISE','OUV_ALLEE_DALLAGE','OUV_TERRASSEMENT_PREP'],
    'Zone de stockage extérieur':['OUV_DALLE_BETON_12CM','OUV_TERRASSEMENT_PREP','OUV_PARKING_STABILISE'],
  },

  PACKAGES_PAYSAGISME: {
    OUV_GAZON_ROULEAU: {
      lignesAuto: [
        { tache:'Décapage / terrassement', unite:'m²', prixUnit:7 },
        { tache:'Retournement et amendement terre', unite:'m²', prixUnit:6 },
        { tache:'Pose gazon rouleau', unite:'m²', prixUnit:12 },
        { tache:'Arrosage mise en place', unite:'forfait', prixUnit:85 },
      ],
      options: [{ tache:'Arrosage automatique', unite:'forfait', prixUnit:450 }],
    },
    OUV_TALUS_ENGAZONNEMENT: {
      lignesAuto: [
        { tache:'Préparation talus', unite:'m²', prixUnit:8 },
        { tache:'Amendement + semis fixation', unite:'m²', prixUnit:9 },
        { tache:'Arrosage mise en place', unite:'forfait', prixUnit:85 },
      ],
      options: [{ tache:'Filet anti-érosion', unite:'m²', prixUnit:4 }],
    },
    OUV_MASSIF_PAILLAGE: {
      lignesAuto: [
        { tache:'Décapage et préparation sol', unite:'m²', prixUnit:7 },
        { tache:'Amendement terre', unite:'m²', prixUnit:6 },
        { tache:'Plantation massif', unite:'m²', prixUnit:15 },
        { tache:'Pose paillage', unite:'m²', prixUnit:5 },
        { tache:'Arrosage mise en place', unite:'forfait', prixUnit:60 },
      ],
      options: [{ tache:'Géotextile anti-herbes', unite:'m²', prixUnit:3 }],
    },
    OUV_BORDURE_JARDIN: {
      lignesAuto: [
        { tache:'Terrassement bordure', unite:'ml', prixUnit:9 },
        { tache:'Pose bordure', unite:'ml', prixUnit:10 },
        { tache:'Jointoiement / finition bordure', unite:'ml', prixUnit:8 },
      ],
      options: [
        { tache:'Bordure pierre naturelle', unite:'ml', prixUnit:38 },
        { tache:'Bordure acier cor-ten', unite:'ml', prixUnit:28 },
        { tache:'Bordure béton', unite:'ml', prixUnit:12 },
      ],
    },
    OUV_CLOTURE_BETON: {
      lignesAuto: [
        { tache:'Terrassement implantation clôture', unite:'ml', prixUnit:12 },
        { tache:'Pose poteaux + fondations béton', unite:'ml', prixUnit:34 },
        { tache:'Pose clôture béton + grillage', unite:'ml', prixUnit:81 },
      ],
      options: [
        { tache:'Portail battant', unite:'u', prixUnit:850 },
        { tache:'Portillon', unite:'u', prixUnit:320 },
      ],
    },
    OUV_CLOTURE_BOIS: {
      lignesAuto: [
        { tache:'Terrassement implantation clôture', unite:'ml', prixUnit:12 },
        { tache:'Pose poteaux + fondations béton', unite:'ml', prixUnit:34 },
        { tache:'Pose clôture bois panneaux', unite:'ml', prixUnit:65 },
      ],
      options: [
        { tache:'Traitement lasure bois', unite:'ml', prixUnit:8 },
        { tache:'Portail bois battant', unite:'u', prixUnit:750 },
        { tache:'Portillon bois', unite:'u', prixUnit:290 },
      ],
    },
    OUV_HAIE_PLANTATION: {
      lignesAuto: [
        { tache:'Terrassement tranchée haie', unite:'ml', prixUnit:10 },
        { tache:'Amendement terre haie', unite:'ml', prixUnit:7 },
        { tache:'Plantation haie', unite:'u', prixUnit:81 },
        { tache:'Paillage haie', unite:'ml', prixUnit:6 },
        { tache:'Arrosage mise en place haie', unite:'forfait', prixUnit:80 },
      ],
      options: [{ tache:'Tuteurage', unite:'u', prixUnit:7 }],
    },
    OUV_ALLEE_GRAVIERS: {
      lignesAuto: [
        { tache:'Terrassement allée', unite:'m²', prixUnit:8 },
        { tache:'Pose géotextile', unite:'m²', prixUnit:4 },
        { tache:'Pose graviers', unite:'m²', prixUnit:18 },
        { tache:'Finitions bords', unite:'ml', prixUnit:9 },
      ],
      options: [{ tache:'Bordure de contention', unite:'ml', prixUnit:12 }],
    },
    OUV_ALLEE_DALLAGE: {
      lignesAuto: [
        { tache:'Terrassement allée', unite:'m²', prixUnit:8 },
        { tache:'Pose géotextile', unite:'m²', prixUnit:4 },
        { tache:'Pose dallage béton', unite:'m²', prixUnit:45 },
        { tache:'Jointoiement dallage', unite:'m²', prixUnit:8 },
        { tache:'Finitions bords', unite:'ml', prixUnit:9 },
      ],
      options: [{ tache:'Éclairage solaire intégré', unite:'u', prixUnit:45 }],
    },
    OUV_TERRASSE_BETON_DESACTIVE: {
      lignesAuto: [
        { tache:'Terrassement terrasse', unite:'m²', prixUnit:10 },
        { tache:'Pose forme béton', unite:'m²', prixUnit:35 },
        { tache:'Désactivation surface', unite:'m²', prixUnit:18 },
        { tache:'Joints de dilatation', unite:'ml', prixUnit:12 },
      ],
      options: [{ tache:'Éclairage extérieur intégré', unite:'forfait', prixUnit:380 }],
    },
    OUV_BASSIN_PREFAB: {
      lignesAuto: [
        { tache:'Terrassement bassin', unite:'m³', prixUnit:90 },
        { tache:'Pose bassin préfabriqué', unite:'u', prixUnit:8 },
        { tache:'Raccordement eau bassin', unite:'forfait', prixUnit:250 },
        { tache:'Étanchéité des bords', unite:'ml', prixUnit:35 },
      ],
      options: [
        { tache:'Éclairage subaquatique', unite:'u', prixUnit:120 },
        { tache:'Pompe filtration', unite:'u', prixUnit:180 },
        { tache:'Plantes aquatiques', unite:'u', prixUnit:25 },
      ],
    },
    OUV_POTAGER_CARRE: {
      lignesAuto: [
        { tache:'Préparation emplacement potager', unite:'u', prixUnit:45 },
        { tache:'Pose carré potager bois', unite:'u', prixUnit:85 },
        { tache:'Remplissage terre végétale', unite:'u', prixUnit:60 },
      ],
      options: [{ tache:'Système arrosage goutte-à-goutte', unite:'u', prixUnit:95 }],
    },
    OUV_AIRE_JEUX_SOL: {
      lignesAuto: [
        { tache:'Terrassement aire de jeux', unite:'m²', prixUnit:7 },
        { tache:'Pose géotextile', unite:'m²', prixUnit:4 },
        { tache:'Pose copeaux de bois', unite:'m²', prixUnit:22 },
        { tache:'Bordure de contention', unite:'ml', prixUnit:12 },
      ],
      options: [{ tache:'Recharge copeaux annuelle', unite:'forfait', prixUnit:180 }],
    },
    OUV_PARKING_STABILISE: {
      lignesAuto: [
        { tache:'Terrassement parking', unite:'m²', prixUnit:10 },
        { tache:'Pose géotextile', unite:'m²', prixUnit:4 },
        { tache:'Pose grave compactée', unite:'m²', prixUnit:18 },
        { tache:'Pose stabilisateur gravier', unite:'m²', prixUnit:15 },
        { tache:'Pose gravier de finition', unite:'m²', prixUnit:12 },
      ],
      options: [
        { tache:'Bordure de contention', unite:'ml', prixUnit:12 },
        { tache:'Éclairage solaire parking', unite:'u', prixUnit:85 },
      ],
    },
    OUV_TERRASSEMENT_PREP: {
      lignesAuto: [
        { tache:'Décapage végétation existante', unite:'m²', prixUnit:5 },
        { tache:'Terrassement général', unite:'m²', prixUnit:8 },
        { tache:'Évacuation terres', unite:'m³', prixUnit:35 },
      ],
      options: [{ tache:'Nivellement laser', unite:'m²', prixUnit:6 }],
    },
  },

  // ── Obtenir la liste de lieux pour un corps + profil ──────
  _getLieux(corpsId, profil) {
    if (corpsId === 'maconnerie') {
      const key = (this._corpsConfig[corpsId] || {}).lieuxKey || 'maconnerie_ext';
      if (key === 'maconnerie_int') {
        const piecesChantier = this._dedupeBy(
          (this._pieces || [])
            .filter(p => p && p.nom && p.corps !== 'maconnerie')
            .map(p => p.nom),
          nom => String(nom || '').trim().toLowerCase()
        );
        const piecesChantierFiltrees = this._filtrerPiecesPourCorps(corpsId, piecesChantier);
        const prestations = (this.LIEUX_CORPS.maconnerie_int || {}).prestations || [];
        if (piecesChantierFiltrees.length) return { pieces: piecesChantierFiltrees, prestations };
      }
      if (profil === 'pro') {
        return key === 'maconnerie_int'
          ? {
              pieces: this._filtrerPiecesPourCorps(corpsId, ['Cage d\'escalier', 'Cloison de séparation', 'Couloir', 'Hall d\'entrée',
                       'Local technique', 'Mur coupe-feu', 'Mur porteur', 'Sas d\'entrée']),
              prestations: ['Cloison briques', 'Cloison brique de verre', 'Mur porteur', 'Doublage'],
            }
          : {
              zones: ['Bardage façade', 'Clôture périmétrique', 'Dalle extérieure',
                      'Façade principale', 'Mur de soutènement', 'Portail entrée',
                      'Quai de chargement', 'Voirie interne'],
              prestations: ['Enduit façade', 'Ravalement', 'Parpaing', 'Brique de parement'],
            };
      }
      return this._filtrerPiecesPourCorps(corpsId, this.LIEUX_CORPS[key] || []);
    }
    if (corpsId === 'electricite' || corpsId === 'revetement') {
      const piecesChantier = this._dedupeBy(
        (this._pieces || [])
          .filter(p => p && p.nom && p.corps !== corpsId)
          .map(p => p.nom),
        nom => String(nom || '').trim().toLowerCase()
      );
      const piecesChantierFiltrees = this._filtrerPiecesPourCorps(corpsId, piecesChantier);
      if (piecesChantierFiltrees.length) return piecesChantierFiltrees;
      return this._filtrerPiecesPourCorps(corpsId, this._dedupeBy(this.PIECES_PROFIL[profil] || this.PIECES_PROFIL.particulier, nom => String(nom || '').trim().toLowerCase()));
    }
    if (corpsId === 'plomberie') {
      return profil === 'pro'
        ? this._filtrerPiecesPourCorps(corpsId, ['Espace pause', 'Local technique', 'Sanitaires hommes',
           'Sanitaires femmes', 'Sanitaires PMR', 'Salle de pause',
           'Cuisine professionnelle', 'Buanderie', 'Local nettoyage'])
        : this._filtrerPiecesPourCorps(corpsId, this.LIEUX_CORPS.plomberie);
    }
    if (corpsId === 'paysagisme') {
      return profil === 'pro'
        ? ['Accès principal', 'Aire de stationnement', 'Clôture périmétrique',
           'Espace vert commun', 'Façade végétalisée', 'Parking',
           'Terrasse extérieure', 'Zone de livraison', 'Zone de stockage extérieur']
        : this.LIEUX_CORPS.paysagisme;
    }
    if (this.LIEUX_CORPS[corpsId]) return this._filtrerPiecesPourCorps(corpsId, this.LIEUX_CORPS[corpsId]);
    return this._filtrerPiecesPourCorps(corpsId, this.PIECES_PROFIL[profil] || this.PIECES_PROFIL.particulier);
  },

  _getOuvragePrestation(prestation) {
    const map = {
      'Cloison briques': 'OUV_MUR_PARPAING_20',
      'Cloison brique de verre': 'OUV_MUR_PARPAING_20',
      'Mur porteur': 'OUV_MUR_PARPAING_20',
      'Doublage': 'OUV_MUR_PARPAING_20',
      'Soubassement': 'OUV_MUR_PARPAING_20',
      'Enduit façade': 'OUV_ENDUIT_MONOCOUCHE',
      'Ravalement': 'OUV_ENDUIT_MONOCOUCHE',
      'Parpaing': 'OUV_MUR_PARPAING_20',
      'Brique de parement': 'OUV_MUR_PARPAING_20',
      'Béton banché': 'OUV_MUR_PARPAING_20',
      'Terrasse béton': 'OUV_DALLE_BETON_12CM',
    };
    return map[prestation] || null;
  },

  _getOuvragesRevetement() {
    return (this.REVETEMENT_OUVRAGES || []).map(code => {
      const ouv = (typeof BddV2 !== 'undefined' && BddV2.getOuvrage) ? BddV2.getOuvrage(code) : null;
      return ouv || { code, designation: code, unite: 'm²' };
    });
  },

  _getOuvrageRevetement(piece) {
    const code = (piece && (piece.ouvrageRevetement || piece.ouvrageId || piece.ouvrage)) || 'OUV_STRATIFIE';
    if (typeof BddV2 !== 'undefined' && BddV2.getOuvrage) {
      return BddV2.getOuvrage(code) || { code, designation: code, unite: 'm²' };
    }
    return { code, designation: code, unite: 'm²' };
  },

  // ── Entrée ────────────────────────────────────────────────
  init(containerId) {
    this._containerId = containerId;
    this._container   = document.getElementById(containerId);
    if (!this._container) return;
    if (this._chiffrageCharge) {
      if (this._bindController) this._bindController.abort();
      this._bindController = null;
      this._renderEtape('resume');
      this._chiffrageCharge = false;
      return;
    }
    this._chantier      = { nom: '', clientId: null, adresse: '', ville: '', codePostal: '' };
    this._profil        = null;
    this._sousTraitants = [];
    this._corpsActifs   = [];
    this._pieces        = [];
    this._resultats     = {};
    this._surfacesMemorisees = {};
    if (this._bindController) this._bindController.abort();
    this._bindController = null;
    this._corpsEnCours  = 0;
    this._pieceEnCours  = null;
    this._corpsConfig   = {};
    this._chiffrageEnModification = false;
    this._modeModif = false;
    this._renderEtape('chantier');
  },

  chargerChiffrage(chiffrageId) {
    const liste = JSON.parse(localStorage.getItem('plaqpro_chiffrages') || '[]');
    const c = chiffrageId
      ? liste.find(x => x.id === chiffrageId)
      : liste[0];
    if (!c) return false;
    // Restaurer l'état complet
    this._chantier    = c.chantier    || { nom:'', clientId:null, adresse:'', ville:'', codePostal:'' };
    this._chantier.clientId = this._normalizeId(this._chantier.clientId || c.clientId);
    if (!this._chantier.clientId && this._chantier.chantierId && typeof DB !== 'undefined' && DB.getChantier) {
      const ch = DB.getChantier(this._normalizeId(this._chantier.chantierId));
      if (ch && ch.clientId) this._chantier.clientId = this._normalizeId(ch.clientId);
    }
    this._corpsActifs = c.corpsActifs || [];
    this._pieces      = (c.pieces     || []).map(p => {
      const piece = {
        ...p,
        quantites: p.quantites || {},
      };
      if (piece.corps === 'paysagisme') {
        piece.tachesPaysagisme = Array.isArray(piece.tachesPaysagisme)
          ? piece.tachesPaysagisme.filter(Boolean)
          : (piece.tachePaysagisme ? [piece.tachePaysagisme] : []);
        piece.tachePaysagisme = piece.tachesPaysagisme[0] || piece.tachePaysagisme || '';
      }
      if ((piece.corps === 'electricite' || piece.corps === 'plomberie') &&
          parseFloat(piece.surface) > 0 &&
          (!piece.quantites || !Object.keys(piece.quantites).length)) {
        piece.quantites = { _total: piece.surface };
        piece.nbPoints = piece.surface;
      }
      return piece;
    });
    this._surfacesMemorisees = c.surfacesMemorisees || {};
    if (!Object.keys(this._surfacesMemorisees).length) {
      this._pieces.forEach(p => {
        const surface = parseFloat(p.surface_sol || p.surface) || 0;
        if (p.nom && surface > 0 && !this._surfacesMemorisees[p.nom]) this._surfacesMemorisees[p.nom] = surface;
      });
    }
    this._lastResume  = c.resume      || {};
    if (c.devisId && !this._lastResume.devisId) this._lastResume.devisId = c.devisId;
    this._profil      = c.profil      || 'particulier';
    this._corpsConfig = c.corpsConfig || {};
    // Démarrer à l'étape résumé pour review
    this._corpsEnCours = 0;
    this._pieceEnCours = null;
    this._etapeEnCours = 'resume';
    this._chiffrageCharge = true;
    this._chiffrageEnModification = true;
    this._modeModif = true;
    return true;
  },

  // ── Dispatcher étapes ─────────────────────────────────────
  _renderEtape(etape) {
    if (etape === 'corps') {
      this._pieceEnCours = null;
      this._corpsEnCours = Math.max(0, Math.min(this._corpsEnCours || 0, Math.max(0, (this._corpsActifs || []).length - 1)));
    }
    if (etape === 'pieces') {
      this._pieceEnCours = null;
      this._corpsEnCours = Math.max(0, Math.min(this._corpsEnCours || 0, Math.max(0, (this._corpsActifs || []).length - 1)));
    }
    this._etape = etape;
    if (!this._container) return;
    const renders = {
      chantier:      () => this._renderChantier(),
      profil:        () => this._renderProfil(),
      sousTraitants: () => this._renderSousTraitants(),
      corps:         () => this._renderCorps(),
      pieces:        () => this._renderPieces(),
      typeCorps:     () => this._renderTypeCorps(),
      appareillage:  () => this._renderAppareillage(),
      metrage:       () => this._renderMetrage(),
      resume:        () => this._renderResume(),
    };
    if (renders[etape]) renders[etape]();
  },

  // ── Helpers UI ────────────────────────────────────────────
  _html(h) { this._container.innerHTML = h; },

  _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  _normalizeId(value) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  },

  _getClientIdChantier() {
    return this._normalizeId(this._chantier && this._chantier.clientId);
  },

  _getClientAdresseParts(client) {
    if (!client) return { adresse: '', ville: '', codePostal: '' };
    return {
      adresse: client.adresse || '',
      ville: client.ville || '',
      codePostal: client.codePostal || client.cp || '',
    };
  },

  _remplirAdresseClientSiVide(clientId) {
    const client = clientId && typeof DB !== 'undefined' && DB.getClient ? DB.getClient(this._normalizeId(clientId)) : null;
    const adr = this._getClientAdresseParts(client);
    if (!adr.adresse && !adr.ville && !adr.codePostal) return;
    const adresseInput = this._container.querySelector('#cex-adresse');
    const villeInput = this._container.querySelector('#cex-ville');
    const cpInput = this._container.querySelector('#cex-code-postal');
    if (adresseInput && !adresseInput.dataset.userEdited && !adresseInput.value.trim()) adresseInput.value = adr.adresse;
    if (villeInput && !villeInput.dataset.userEdited && !villeInput.value.trim()) villeInput.value = adr.ville;
    if (cpInput && !cpInput.dataset.userEdited && !cpInput.value.trim()) cpInput.value = adr.codePostal;
  },

  _bindCodePostalVille(cpSelector, villeSelector) {
    const cpInput = this._container ? this._container.querySelector(cpSelector) : null;
    const villeInput = this._container ? this._container.querySelector(villeSelector) : null;
    if (!cpInput || !villeInput) return;
    const listId = cpInput.id + '-villes';
    let datalist = this._container.querySelector('#' + listId);
    if (!datalist) {
      datalist = document.createElement('datalist');
      datalist.id = listId;
      this._container.appendChild(datalist);
      villeInput.setAttribute('list', listId);
    }
    cpInput.addEventListener('input', () => {
      cpInput.dataset.userEdited = '1';
      const cp = cpInput.value.replace(/\D/g, '').slice(0, 5);
      if (cpInput.value !== cp) cpInput.value = cp;
      if (cp.length !== 5 || typeof fetch === 'undefined') return;
      fetch('https://geo.api.gouv.fr/communes?codePostal=' + cp + '&fields=nom&limit=5')
        .then(r => r.ok ? r.json() : [])
        .then(villes => {
          const noms = (Array.isArray(villes) ? villes : []).map(v => v.nom).filter(Boolean);
          datalist.innerHTML = noms.map(n => '<option value="' + this._esc(n) + '"></option>').join('');
          if (noms.length === 1 && !villeInput.dataset.userEdited) villeInput.value = noms[0];
        })
        .catch(() => {});
    });
    villeInput.addEventListener('input', () => { villeInput.dataset.userEdited = '1'; });
  },

  _dedupeBy(items, keyFn) {
    const seen = new Set();
    return (items || []).filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  _memoriserSurfacePiece(piece) {
    if (!piece || !piece.nom) return;
    const surface = parseFloat(piece.surface_sol || piece.surface) || 0;
    if (surface > 0) this._surfacesMemorisees[piece.nom] = surface;
  },

  _getZonesPaysagismeSet() {
    return new Set(this.LIEUX_CORPS.paysagisme || []);
  },

  _estZonePaysagisme(item) {
    const nom = String((item && item.nom) || item || '').trim();
    return this._getZonesPaysagismeSet().has(nom);
  },

  _filtrerPiecesPourCorps(corpsId, pieces) {
    if (corpsId === 'paysagisme') return pieces || [];
    if (['plaquisterie','peinture','electricite','plomberie','maconnerie','revetement'].includes(corpsId)) {
      return (pieces || []).filter(p => !this._estZonePaysagisme(p));
    }
    return pieces || [];
  },

  _getPaysagismeIds(piece) {
    if (!piece) return [];
    const ids = Array.isArray(piece.tachesPaysagisme) && piece.tachesPaysagisme.length
      ? piece.tachesPaysagisme
      : (piece.tachePaysagisme ? [piece.tachePaysagisme] : []);
    return this._dedupeBy(ids.filter(Boolean), id => String(id));
  },

  _getPaysagismePrimaryId(piece, code) {
    return String(code || this._getPaysagismeIds(piece)[0] || '');
  },

  _getPaysagismeLabel(code) {
    const id = String(code || '');
    if (id.startsWith('PAYS_') && typeof BddPaysagismeV2 !== 'undefined') {
      return (BddPaysagismeV2.getPrestation(id) || {}).libelle || id;
    }
    if (typeof BddV2 !== 'undefined' && BddV2.getOuvrage) {
      return (BddV2.getOuvrage(id) || { designation: id }).designation;
    }
    return id;
  },

  _isOuvrageLineaire(corpsId, piece, code) {
    const testPiece = Object.assign({}, piece || {});
    if (code) {
      testPiece.tachePaysagisme = code;
      testPiece.tachesPaysagisme = [code];
    }
    return this._getUniteOuvrage(corpsId, testPiece) === 'ml';
  },

  _getAppareillagePourPiece(corpsId, nomPiece) {
    const liste = this.APPAREILLAGE[corpsId] || [];
    if (corpsId !== 'plomberie') return this._dedupeBy(liste, a => a.id);
    const nom = String(nomPiece || '').toLowerCase();
        const mappings = [
          { match: n => n.includes('cuisine'), ids: ['evier_1bac','evier_2bacs','robinetterie_cuisine','lave_vaisselle','cumulus','vmc'] },
          { match: n => n.includes('salle de bain') || n.includes('sanitaire'), ids: ['baignoire','douche_italienne','douche_receveur','vasque','robinetterie_sdb','cumulus','vmc','seche_serviette'] },
          { match: n => n.includes('wc'), ids: ['wc_standard','wc_suspendu','robinetterie_wc'] },
          { match: n => n.includes('buanderie'), ids: ['lave_linge','evier_1bac','robinetterie_cuisine','cumulus'] },
          { match: n => n.includes('garage') || n.includes('local technique'), ids: ['robinet_ext','arrivee_eau','evacuation_ep','lave_mains','cumulus','adoucisseur'] },
          { match: n => n.includes('cave') || n.includes('sous-sol') || n.includes('sous sol'), ids: ['robinet','evacuation','pompe_relevage','cumulus'] },
          { match: n => n.includes('jardin') || n.includes('extérieur') || n.includes('exterieur'), ids: ['robinet_ext','arrosage','evacuation_ep','regard'] },
          { match: n => n.includes('bureau') || n.includes('chambre'), ids: ['lave_mains','radiateur_eau'] },
          { match: n => n.includes('couloir') || n.includes('entrée') || n.includes('entree'), ids: ['lave_mains','radiateur_eau'] },
        ];
        const mapping = mappings.find(m => m.match(nom));
        const ids = mapping ? mapping.ids : ['robinet','evacuation','cumulus'];
        const allowed = new Set(ids);
        return this._dedupeBy(liste.filter(a => allowed.has(a.id)), a => a.id);
      },

  _isOuvrageHaiePlantation(piece, code) {
    const id = this._getPaysagismePrimaryId(piece, code);
    if (id.startsWith('PAYS_') && typeof BddPaysagismeV2 !== 'undefined') {
      const prestation = BddPaysagismeV2.getPrestation(id);
      if (prestation) return (prestation.package.lignesAuto || []).some(l => l.quantiteMode === 'nb_plants');
    }
    return id.toUpperCase().includes('HAIE') || id.toUpperCase().includes('PLANTATION');
  },

  _getEssencesHaie() {
    return [
      { id:'cypres_leyland', label:'Cyprès de Leyland', espacement:0.6 },
      { id:'thuya', label:'Thuya', espacement:0.5 },
      { id:'laurier_palme', label:'Laurier palme', espacement:0.8 },
      { id:'photinia', label:'Photinia', espacement:0.7 },
      { id:'bambou', label:'Bambou', espacement:0.5 },
      { id:'autre', label:'Autre', espacement:0.6 },
    ];
  },

  _getEssenceHaie(id) {
    return this._getEssencesHaie().find(e => e.id === id) || this._getEssencesHaie().find(e => e.id === 'autre');
  },

  _getTypeMetragePaysagisme(piece, code) {
    if (this._isOuvrageHaiePlantation(piece, code)) return 'haie';
    const testPiece = Object.assign({}, piece || {});
    if (code) {
      testPiece.tachePaysagisme = code;
      testPiece.tachesPaysagisme = [code];
    }
    const unite = String(this._getUniteOuvrage('paysagisme', testPiece) || '').toLowerCase();
    if (unite === 'ml') return 'ml';
    if (unite === 'u') return 'u';
    if (unite === 'm3' || unite === 'm³' || unite.includes('³')) return 'm3';
    return 'm2';
  },

  _getPackageTypePaysagisme(piece, code) {
    const ouvrageId = this._getPaysagismePrimaryId(piece, code).toUpperCase();
    return this.PACKAGES_PAYSAGISME[ouvrageId] ? ouvrageId : '';
  },

  _getPackagePaysagisme(piece, code) {
    const id = this._getPaysagismePrimaryId(piece, code);
    if (id.startsWith('PAYS_') && typeof BddPaysagismeV2 !== 'undefined') {
      const prestation = BddPaysagismeV2.getPrestation(id);
      if (prestation && prestation.package) return prestation.package;
    }
    const ouvrageId = this._getPackageTypePaysagisme(piece, code);
    return ouvrageId ? this.PACKAGES_PAYSAGISME[ouvrageId] : null;
  },

  _idOptionPaysagisme(opt) {
    return String(opt.id || opt.tache || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  },

  _getOptionsPackagePaysagisme(piece, code) {
    const pkg = this._getPackagePaysagisme(piece, code);
    return (pkg && pkg.options ? pkg.options : []).map(opt =>
      Object.assign({}, opt, { id: this._idOptionPaysagisme(opt), label: opt.tache, prix: opt.prixUnit })
    );
  },

  _getSectionsForZonePaysagisme(nomZone) {
    const all = (typeof BddPaysagismeV2 !== 'undefined')
      ? BddPaysagismeV2.sections.map(s => s.id)
      : [];
    if (!nomZone) return all;
    if (this.SECTIONS_PAR_ZONE[nomZone]) return this.SECTIONS_PAR_ZONE[nomZone];
    const lower = String(nomZone).toLowerCase();
    for (const [key, ids] of Object.entries(this.SECTIONS_PAR_ZONE)) {
      if (lower.includes(key.toLowerCase())) return ids;
    }
    return all;
  },

  _renderAccordeonPaysagisme(sections, currentIds) {
    let html = '';
    const esc = s => this._esc(s);
    const ids = Array.isArray(currentIds) ? currentIds : (currentIds ? [currentIds] : []);
    const firstId = sections.length ? sections[0].id : null;
    html += '<div data-cex-pays-accordion="1" style="max-height:55vh;overflow-y:auto;overflow-x:hidden;padding-right:4px;min-width:0;width:100%;max-width:100%;box-sizing:border-box">';
    for (const sec of sections) {
      const prests = BddPaysagismeV2.getPrestationsBySection(sec.id);
      const hasSelected = prests.some(pr => ids.includes(pr.id));
      const isOpen = hasSelected || (sec.id === firstId && !ids.length);
      html += '<div data-accord-wrap="paysagisme" data-section-idx="' + esc(sec.id) + '" style="border:1px solid rgba(79,142,247,.3);border-radius:8px;margin-bottom:6px;overflow:hidden;max-width:100%;min-width:0">';
      html += '<button type="button" data-accord-toggle="paysagisme" data-section-idx="' + esc(sec.id) + '" style="width:100%;cursor:pointer;padding:10px 14px;font-weight:600;';
      html += 'color:var(--text,#fff);background:transparent;border:0;display:flex;align-items:center;gap:8px;text-align:left;min-width:0">';
      html += '<span style="flex-shrink:0">' + esc(sec.icone) + '</span>';
      html += '<span style="flex:1;min-width:0;white-space:normal;overflow-wrap:normal;word-break:normal">' + esc(sec.libelle) + '</span>';
      html += '<span data-chevron="paysagisme" style="flex-shrink:0;opacity:.65">' + (isOpen ? '▼' : '▶') + '</span>';
      html += '</button>';
      html += '<div data-accord-body="paysagisme" style="display:' + (isOpen ? 'block' : 'none') + ';padding:6px 10px;min-width:0;max-width:100%;overflow:hidden;box-sizing:border-box;width:100%">';
      for (const pr of prests) {
        const checked = ids.includes(pr.id) ? ' checked' : '';
        const bg = ids.includes(pr.id) ? 'background:rgba(79,142,247,.18);font-weight:600;' : '';
        html += '<label style="display:grid;grid-template-columns:20px 1fr auto;align-items:center;gap:8px;padding:6px 8px;';
        html += 'border-radius:6px;cursor:pointer;width:100%;box-sizing:border-box;' + bg + '">';
        html += '<input type="checkbox" name="cex-pays-check" value="' + esc(pr.id) + '"';
        html += checked + ' style="accent-color:var(--accent,#4f8ef7)">';
        html += '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text,#fff);font-size:.85rem">' + esc(pr.libelle) + '</span>';
        html += '<span style="opacity:.6;font-size:.75rem;white-space:nowrap">' + esc(pr.unite || '') + '</span>';
        html += '</label>';
      }
      html += '</div></div>';
    }
    html += '</div>';
    return html;
  },

  _progressBar(etapeActive) {
    const etapes = ['chantier','profil','sousTraitants','corps','pieces','metrage'];
    const labels = ['Chantier','Profil','Sous-traitants','Travaux','Pièces','Métrage'];
    const idx    = etapes.indexOf(etapeActive);
    const steps  = labels.map((l, i) => {
      const done   = i < idx;
      const active = i === idx;
      const color  = done || active ? 'var(--accent,#2563eb)' : 'var(--border,#ddd)';
      const fw     = active ? '700' : done ? '600' : '400';
      const op     = done || active ? '1' : '0.45';
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;opacity:${op}">
        <div style="width:28px;height:28px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700">${done ? '✓' : i+1}</div>
        <span style="font-size:11px;font-weight:${fw};color:var(--text-secondary,#666)">${l}</span>
      </div>
      ${i < labels.length-1 ? `<div style="flex:1;height:2px;background:${done ? 'var(--accent,#2563eb)' : 'var(--border,#ddd)'};margin-top:14px"></div>` : ''}`;
    }).join('');
    return `<div style="display:flex;align-items:flex-start;gap:0;margin-bottom:24px;padding:16px;background:var(--bg-card,#1e2530);border:1px solid var(--border,#2a3240);border-radius:10px">${steps}</div>`;
  },

  _card(content) {
    return `<div style="background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:24px;margin-bottom:16px;overflow:hidden;overflow-y:hidden">${content}</div>`;
  },

  _btn(label, action, style) {
    const s = style || 'primary';
    const bg    = s === 'primary' ? 'var(--accent,#2563eb)' : 'rgba(255,255,255,.12)';
    const color = s === 'primary' ? '#fff' : '#fff';
    const border= s === 'primary' ? 'none' : '1px solid rgba(255,255,255,.35)';
    return `<button type="button" data-cex-action="${action}" style="padding:10px 22px;border-radius:8px;border:${border};background:${bg};color:${color};font-weight:600;cursor:pointer;font-size:.9rem">${label}</button>`;
  },

  // ── Étape 1 : Chantier + Client ───────────────────────────
  _renderChantier() {
    const clients    = (typeof DB.getClients === 'function' ? DB.getClients() : DB.getAll(DB.KEYS.clients)).filter(c => c.actif !== false);
    const chantiers  = DB.getAll(DB.KEYS.chantiers).filter(c => c.actif !== false);
    const chantierId = this._chantier.chantierId;
    const clientIdActuel = this._getClientIdChantier();

    const optChantier = chantiers.map(c =>
      `<option value="${c.id}" ${c.id == chantierId ? 'selected' : ''}>${this._esc(c.nom || c.libelle || '')}</option>`
    ).join('');
    const optClient = clients.map(c =>
      `<option value="${c.id}" ${c.id == clientIdActuel ? 'selected' : ''}>${this._esc(c.nom || c.raisonSociale || '')}</option>`
    ).join('');

    const inputStyle = 'width:100%;padding:11px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;font-size:.95rem;box-sizing:border-box;outline:none';
    const row = (label, field) => `
      <div style="display:grid;grid-template-columns:minmax(130px,30%) 1fr;gap:16px;align-items:center">
        <label style="font-size:.9rem;font-weight:650;color:#fff">${label}</label>
        <div>${field}</div>
      </div>`;

    this._html(`
      <div style="background:var(--bg,#0f0f1a);padding:24px;border-radius:0;color:#fff">
        <h2 style="margin:0 0 22px;font-size:1.15rem;font-weight:750;color:#fff">Nouveau chiffrage</h2>
        <div style="display:flex;flex-direction:column;gap:16px">
          ${row('Chantier existant', `
            <div style="display:flex;gap:12px;align-items:center">
            <select id="cex-chantier-id"
              style="${inputStyle}">
              <option value="">-- Nouveau chantier --</option>
              ${optChantier}
            </select>
              <button type="button" data-cex-action="nouveau-chantier" style="white-space:nowrap;font-size:.85rem;color:var(--accent,#22d3ee);background:none;border:none;cursor:pointer;padding:0">+ Créer un chantier</button>
            </div>
          `)}
          ${row('Client *', `
            <div style="display:flex;gap:12px;align-items:center">
              <select id="cex-client-select" style="${inputStyle}">
                <option value="">-- Sélectionner un client --</option>
                ${optClient}
              </select>
              <button type="button" data-cex-action="nouveau-client" style="white-space:nowrap;font-size:.85rem;color:var(--accent,#22d3ee);background:none;border:none;cursor:pointer;padding:0">+ Nouveau client</button>
            </div>
          `)}
          ${row('Nom du chantier *', `
            <input id="cex-nom-chantier" type="text" placeholder="ex : Rénovation villa Martin" value="${this._esc(this._chantier.nom)}" style="${inputStyle}">
          `)}
          ${row('Adresse', `
            <input id="cex-adresse" type="text" placeholder="ex : 12 rue des Acacias, Lyon" value="${this._esc(this._chantier.adresse)}" style="${inputStyle}">
          `)}
          ${row('Code postal', `
            <input id="cex-code-postal" type="text" inputmode="numeric" maxlength="5" placeholder="ex : 69003" value="${this._esc(this._chantier.codePostal || this._chantier.cp || '')}" style="${inputStyle}">
          `)}
          ${row('Ville', `
            <input id="cex-ville" type="text" placeholder="ex : Lyon" value="${this._esc(this._chantier.ville || '')}" style="${inputStyle}">
          `)}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:24px">
          ${this._btn('✕ Annuler', 'chantier-annuler', 'secondary')}
          ${this._btn('Suivant →', 'chantier-suivant')}
        </div>
      </div>
    `);

    const sel = this._container.querySelector('#cex-chantier-id');
    if (sel) {
      sel.addEventListener('change', () => {
        const id = sel.value;
        const ch = id ? DB.getChantier(parseInt(id)) : null;
        this._chantier.chantierId = id || null;
        if (ch) {
          this._chantier.nom      = ch.nom || ch.libelle || '';
          this._chantier.clientId = this._normalizeId(ch.clientId);
          this._chantier.adresse  = ch.adresse || ch.ville || '';
          this._chantier.ville = ch.ville || '';
          this._chantier.codePostal = ch.codePostal || ch.cp || '';
          const clientSelect = document.getElementById('cex-client-select');
          const nomInput     = document.getElementById('cex-nom-chantier');
          const adresseInput = document.getElementById('cex-adresse');
          const villeInput = document.getElementById('cex-ville');
          const cpInput = document.getElementById('cex-code-postal');
          if (clientSelect) clientSelect.value = this._chantier.clientId || '';
          if (nomInput) nomInput.value = ch.nom || ch.libelle || '';
          if (adresseInput) adresseInput.value = ch.adresse || ch.ville || '';
          if (villeInput) villeInput.value = this._chantier.ville || '';
          if (cpInput) cpInput.value = this._chantier.codePostal || '';
          const cli = DB.getClient(parseInt(ch.clientId));
          if (cli && cli.type) {
            this._profil = cli.type === 'particulier' ? 'particulier' : 'pro';
          } else {
            this._profil = null;
          }
        } else {
          this._chantier.chantierId = null;
        }
      });
    }
    const clientSelect = this._container.querySelector('#cex-client-select');
    const adresseInput = this._container.querySelector('#cex-adresse');
    const villeInput = this._container.querySelector('#cex-ville');
    if (adresseInput) adresseInput.addEventListener('input', () => { adresseInput.dataset.userEdited = '1'; });
    if (villeInput) villeInput.addEventListener('input', () => { villeInput.dataset.userEdited = '1'; });
    if (clientSelect) {
      clientSelect.addEventListener('change', () => {
        this._chantier.clientId = this._normalizeId(clientSelect.value);
        this._remplirAdresseClientSiVide(clientSelect.value);
      });
    }
    this._bindCodePostalVille('#cex-code-postal', '#cex-ville');
    this._bind();
  },

  // ── Étape 2 : Profil ──────────────────────────────────────
  _renderProfil() {
    const profils = [
      { id: 'particulier', label: 'Particulier',      icone: '🏠', desc: 'Maison, appartement, villa' },
      { id: 'pro',         label: 'Pro / Entreprise',  icone: '🏢', desc: 'Bureaux, dépôts, locaux' },
      { id: 'ao',          label: "Appel d'offres",    icone: '📋', desc: 'DPGF, marchés publics' },
    ];
    const cards = profils.map(p => {
      const sel = this._profil === p.id;
      return `<div data-cex-profil="${p.id}" style="flex:1;min-width:140px;padding:18px;border-radius:10px;border:2px solid ${sel ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'};background:${sel ? 'rgba(37,99,235,.06)' : 'var(--bg-card,#fff)'};cursor:pointer;text-align:center;transition:border .15s">
        <div style="font-size:2rem;margin-bottom:8px">${p.icone}</div>
        <div style="font-weight:700;margin-bottom:4px">${p.label}</div>
        <div style="font-size:.8rem;color:var(--text-secondary,#666)">${p.desc}</div>
      </div>`;
    }).join('');

    this._html(`
      ${this._progressBar('profil')}
      ${this._card(`
        <h2 style="margin:0 0 6px;font-size:1.1rem;font-weight:700">Type de chantier</h2>
        <p style="margin:0 0 8px;font-size:.85rem;color:var(--text-secondary,#666)">Chantier : <strong>${this._esc(this._chantier.nom)}</strong></p>
        ${this._profil && this._chantier.chantierId ? `<div style="font-size:.8rem;color:#16a34a;margin-bottom:12px">✓ Type détecté depuis le client — vous pouvez modifier si besoin</div>` : ''}
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          ${cards}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:20px">
          ${this._btn('← Retour', 'profil-retour', 'secondary')}
          ${this._btn('Suivant →', 'profil-suivant')}
        </div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 3 : Sous-traitants ──────────────────────────────
  _renderSousTraitants() {
    const sts = DB.getAll(DB.KEYS.sousTraitants).filter(s => s.actif !== false);

    const listeST = sts.map(s => {
      const sel   = this._sousTraitants.includes(s.id);
      const alert = !s.rcPro || !s.decennale;
      return `<label style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;border:1px solid var(--border,#e2e8f0);cursor:pointer;background:var(--bg-card,#fff)">
        <input type="checkbox" data-cex-st="${s.id}" ${sel ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer">
        <span style="flex:1;font-size:.9rem;font-weight:500">${this._esc(s.nom || s.raisonSociale || '')}</span>
        ${alert ? '<span style="font-size:.75rem;color:#ef4444;font-weight:600">⚠️ RC/décennale manquante</span>' : '<span style="font-size:.75rem;color:#16a34a">✓ Assurances OK</span>'}
        ${s.margePercent ? `<span style="font-size:.75rem;color:var(--text-secondary,#666)">${s.margePercent}% marge</span>` : ''}
      </label>`;
    }).join('');

    this._html(`
      ${this._progressBar('sousTraitants')}
      ${this._card(`
        <h2 style="margin:0 0 6px;font-size:1.1rem;font-weight:700">Sous-traitants</h2>
        <p style="margin:0 0 16px;font-size:.85rem;color:var(--text-secondary,#666)">Faites-vous appel à des sous-traitants sur ce chantier ?</p>
        ${sts.length === 0
          ? '<p style="color:var(--text-secondary,#666);font-size:.9rem;margin:0 0 12px">Aucun sous-traitant enregistré.</p>'
          : `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${listeST}</div>`
        }
        <button type="button" data-cex-action="creer-st" style="font-size:.85rem;color:var(--accent,#2563eb);background:none;border:1px solid var(--accent,#2563eb);border-radius:6px;cursor:pointer;padding:6px 14px">+ Créer un sous-traitant</button>
        <div style="display:flex;justify-content:space-between;margin-top:20px">
          ${this._btn('← Retour', 'st-retour', 'secondary')}
          ${this._btn('Suivant →', 'st-suivant')}
        </div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 4 : Corps de métiers ────────────────────────────
  _renderCorps() {
    const traites = this._corpsActifs.filter(id =>
      this._pieces.some(p => p.corps === id && p.surface)
    );
    const cards = this.CORPS.map(c => {
      const traite = traites.includes(c.id);
      return `<div data-cex-corps="${c.id}" style="flex:1;min-width:130px;padding:16px;border-radius:10px;border:2px solid ${traite ? '#16a34a' : 'var(--border,#e2e8f0)'};background:${traite ? 'rgba(22,163,74,.06)' : 'var(--bg-card,#1e2530)'};cursor:pointer;text-align:center;position:relative">
        ${traite ? '<div style="position:absolute;top:8px;right:8px;color:#16a34a;font-size:1rem">✓</div>' : ''}
        <div style="font-size:1.8rem;margin-bottom:6px">${c.icone}</div>
        <div style="font-weight:600;font-size:.9rem">${c.label}</div>
        <div style="font-size:.75rem;margin-top:4px;color:${traite ? '#16a34a' : 'var(--text-secondary,#666)'}">${traite ? 'Traité — cliquer pour modifier' : 'Cliquer pour chiffrer'}</div>
      </div>`;
    }).join('');

    const nbTraites = traites.length;
    const btnTerminer = nbTraites > 0 ? this._btn('Terminer le devis →', 'corps-terminer') : '';

    this._html(`
      ${this._progressBar('corps')}
      ${this._card(`
        <h2 style="margin:0 0 6px;font-size:1.1rem;font-weight:700">Corps de métiers</h2>
        <p style="margin:0 0 16px;font-size:.85rem;color:var(--text-secondary,#666)">Cliquez sur un corps pour saisir les Métrage — revenez ici pour en chiffrer un autre</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
          ${cards}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          ${this._btn('← Retour', 'corps-retour', 'secondary')}
          <div style="display:flex;gap:8px;align-items:center">
            ${nbTraites > 0 ? `<span style="font-size:.85rem;color:#16a34a">${nbTraites} corps traité${nbTraites>1?'s':''}</span>` : ''}
            ${btnTerminer}
          </div>
        </div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 5 : Pièces par corps de métier ─────────────────
  _renderPieces() {
    const corps = this.CORPS.find(c => c.id === this._corpsActifs[this._corpsEnCours]);
    if (!corps) return;
    const lieuxConfig = this._getLieux(corps ? corps.id : '', this._profil);
    const listePieces = this._dedupeBy(
      Array.isArray(lieuxConfig) ? lieuxConfig : (lieuxConfig.pieces || lieuxConfig.zones || []),
      nom => String(nom || '').trim().toLowerCase()
    );
    const prestationsMaconnerie = this._dedupeBy(
      (!Array.isArray(lieuxConfig) && lieuxConfig.prestations) ? lieuxConfig.prestations : [],
      prestation => String(prestation || '').trim().toLowerCase()
    );
    const piecesExistantes = this._filtrerPiecesPourCorps(corps.id, this._pieces.filter(p => p.corps === corps.id));

    const piecesPlaco = corps.id === 'peinture'
      ? this._filtrerPiecesPourCorps('plaquisterie', this._pieces.filter(p => p.corps === 'plaquisterie' && (p.surface_sol || p.surface)))
      : [];

    const corpsId = corps.id;
    if (corpsId === 'revetement') {
      const piecesPlaco = this._filtrerPiecesPourCorps('plaquisterie', this._pieces
        .filter(p => (p.corps === 'plaquisterie' || p.corps === 'platrerie') && (p.surface_sol || p.surface))
        .map(p => ({ nom: p.nom, surface: p.surface_sol || p.surface || 0 })));
      const source = piecesPlaco.length > 0
        ? piecesPlaco
        : this._filtrerPiecesPourCorps('revetement', (listePieces || []).map(nom => ({ nom, surface: 0 })));
      const sourceDedup = this._dedupeBy(source, p => String((p && p.nom) || '').trim().toLowerCase());
      const rows = sourceDedup.map(src => {
        const exist = piecesExistantes.find(p => p.nom === src.nom);
        const surface = exist ? (exist.surface || src.surface || '') : (src.surface || '');
        const checked = (exist || piecesPlaco.length > 0) ? 'checked' : '';
        return `<div style="display:grid;grid-template-columns:24px minmax(120px,1fr) 120px auto;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg-card,#1e2530)">
          <input type="checkbox" data-cex-revetement-check="${this._esc(src.nom)}" ${checked} style="accent-color:var(--accent,#4f8ef7)">
          <span style="font-weight:600">${this._esc(src.nom)}</span>
          <input type="number" min="0" step="0.1" data-cex-revetement-surface="${this._esc(src.nom)}" value="${this._esc(surface)}" style="width:100%;padding:8px;border-radius:7px;border:1px solid var(--border,#e2e8f0);background:rgba(255,255,255,.06);color:#fff">
          <button type="button" data-cex-revetement-open="${this._esc(src.nom)}" style="padding:7px 10px;border-radius:7px;border:1px solid var(--accent,#4f8ef7);background:transparent;color:#fff;cursor:pointer">Ouvrage</button>
        </div>`;
      }).join('');
      const progress = `${this._corpsEnCours + 1} / ${this._corpsActifs.length}`;
      this._html(`
        ${this._progressBar('pieces')}
        ${this._card(`
          <div style="position:sticky;top:0;z-index:10;background:var(--bg,#0f0f1a);padding:12px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.1));display:flex;align-items:center;gap:10px;margin:-16px -16px 16px">
            <span style="font-size:1.5rem">${corps.icone}</span>
            <h2 style="margin:0;font-size:1.1rem;font-weight:700">${corps.label} — Pièces à chiffrer</h2>
            <span style="margin-left:auto;font-size:.8rem;color:var(--text-secondary,#666);background:var(--bg-secondary,#f8f9fa);padding:4px 10px;border-radius:20px">${progress}</span>
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
              ${this._btn('← Retour', 'pieces-retour', 'secondary')}
              ${this._btn('← Modifier les corps de métier', 'modifier-corps-metiers')}
            </div>
          </div>
          <p style="margin:0 0 16px;font-size:.85rem;color:var(--text-secondary,#666)">Cochez les pièces à traiter. Les surfaces Plâtrerie sont reprises automatiquement si disponibles.</p>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${rows || '<p style="color:var(--text-secondary,#666);font-size:.85rem">Aucune pièce disponible</p>'}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            ${this._btn('Valider les pièces revêtement', 'revetement-pieces-valider')}
            <div style="display:flex;gap:8px">
              ${this._corpsEnCours > 0 ? this._btn('← Corps précédent', 'corps-precedent', 'secondary') : ''}
              ${this._corpsEnCours < this._corpsActifs.length - 1 ? this._btn('Corps suivant →', 'corps-suivant-pieces') : this._btn('Voir le résumé →', 'pieces-terminer')}
            </div>
          </div>
        `)}
      `);
      this._bind();
      return;
    }
    const isUnite = ['electricite','plomberie'].includes(corpsId);
    const isMaconnerie = corps.id === 'maconnerie';
    const items = listePieces.map(nom => {
      const sel  = piecesExistantes.find(p => p.nom === nom);
      const p = sel || {};
      const estElecPlomb = (corpsId === 'electricite' || corpsId === 'plomberie');
      const nbPts = estElecPlomb
        ? Object.values(p.quantites || {}).reduce((s,v) => s + (parseInt(v) || 0), 0)
        : 0;
      const dejaFait = (parseFloat(p.surface) || 0) > 0 || (parseFloat(p.nbPoints) || 0) > 0 || nbPts > 0;
      const valeurPaysage = corpsId === 'paysagisme' && sel
        ? this._getQuantiteDevis(corpsId, p)
        : 0;
      const unitePaysage = corpsId === 'paysagisme' && sel
        ? this._getUniteOuvrage(corpsId, p)
        : 'm²';
      const valeurAffichee = estElecPlomb
        ? (nbPts > 0 ? nbPts + ' pts' : '')
        : (corpsId === 'paysagisme'
            ? (valeurPaysage > 0 ? valeurPaysage + ' ' + unitePaysage : '')
            : ((parseFloat(p.surface) || 0) > 0 ? p.surface + ' m²' : ''));
      const badge = valeurAffichee
        ? `<span style="background:var(--success,#22c55e);color:#fff;border-radius:12px;padding:2px 8px;font-size:11px;margin-left:8px">✅ ${valeurAffichee}</span>`
        : '';
      const prestBadge = p.prestation
        ? `<span style="background:var(--accent,#4f8ef7);color:#fff;border-radius:12px;padding:2px 8px;font-size:11px;margin-left:4px">${this._esc(p.prestation)}</span>`
        : '';
      const tacheIds = this._getPaysagismeIds(p);
      const tacheBadge = tacheIds.length
        ? (() => {
            const labels = tacheIds.map(code => this._getPaysagismeLabel(code));
            const label = labels.length > 1 ? labels.length + ' tâches' : labels[0];
            return `<span style="background:var(--accent,#4f8ef7);color:#fff;border-radius:12px;padding:2px 8px;font-size:11px;margin-left:4px">${this._esc(label)}</span>`;
          })()
        : '';
      const badges = badge + prestBadge + tacheBadge;
      if (isMaconnerie) {
        const ouvert = this._pieceMaconnerieSelection === nom;
        const selectPrestation = ouvert ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">
            <select id="cex-maconnerie-prestation" data-cex-prestation-piece="${this._esc(nom)}" style="flex:1;min-width:220px;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.9rem;box-sizing:border-box">
              <option value="">-- Prestation à chiffrer --</option>
              ${prestationsMaconnerie.map(prestation => '<option value="' + this._esc(prestation) + '" ' + (sel && sel.prestation === prestation ? 'selected' : '') + '>' + prestation + '</option>').join('')}
            </select>
            ${this._btn('Chiffrer', 'maconnerie-prestation-valider')}
          </div>` : '';
        return `<div style="padding:12px 16px;border-radius:8px;border:2px solid ${sel ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'};background:${sel ? 'rgba(37,99,235,.06)' : 'var(--bg-card,#1e2530)'}">
          <div data-cex-piece="${this._esc(nom)}" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between">
            <span style="font-weight:500;font-size:.9rem;display:flex;align-items:center;flex-wrap:wrap">${nom}${badges}</span>
            ${sel || dejaFait ? '<span style="font-size:.8rem;color:var(--accent,#2563eb)">✓</span>' : '<span style="font-size:.8rem;color:var(--text-secondary,#666)">Choisir prestation</span>'}
          </div>
          ${selectPrestation}
        </div>`;
      }
      return `<div data-cex-piece="${this._esc(nom)}" style="padding:12px 16px;border-radius:8px;border:2px solid ${sel ? 'var(--accent,#2563eb)' : 'var(--border,#e2e8f0)'};background:${sel ? 'rgba(37,99,235,.06)' : 'var(--bg-card,#1e2530)'};cursor:pointer;display:flex;align-items:center;justify-content:space-between">
        <span style="font-weight:500;font-size:.9rem;display:flex;align-items:center;flex-wrap:wrap">${nom}${badges}</span>
        ${sel || dejaFait ? '<span style="font-size:.8rem;color:var(--accent,#2563eb)">✓</span>' : ''}
      </div>`;
    }).join('');

    const progress = `${this._corpsEnCours + 1} / ${this._corpsActifs.length}`;
    const isLast   = this._corpsEnCours === this._corpsActifs.length - 1;

    this._html(`
      ${this._progressBar('pieces')}
      ${this._card(`
        <div style="position:sticky;top:0;z-index:10;background:var(--bg,#0f0f1a);padding:12px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.1));display:flex;align-items:center;gap:10px;margin:-16px -16px 16px">
          <span style="font-size:1.5rem">${corps.icone}</span>
          <h2 style="margin:0;font-size:1.1rem;font-weight:700">${corps.label} — ${corps.id === 'paysagisme' ? 'Zones à chiffrer' : 'Pièces à chiffrer'}</h2>
          <span style="margin-left:auto;font-size:.8rem;color:var(--text-secondary,#666);background:var(--bg-secondary,#f8f9fa);padding:4px 10px;border-radius:20px">${progress}</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
            ${this._btn('← Retour', 'pieces-retour', 'secondary')}
            ${this._btn('← Modifier les corps de métier', 'modifier-corps-metiers')}
          </div>
        </div>
        <p style="margin:0 0 16px;font-size:.85rem;color:var(--text-secondary,#666)">Sélectionnez les pièces à traiter — cliquez pour les Métrage</p>
        ${piecesPlaco.length > 0 ? `
        <div style="background:rgba(37,99,235,.08);border:1px solid var(--accent,#2563eb);border-radius:8px;padding:12px 16px;margin-bottom:12px">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">
            <div>
              <div style="font-size:.85rem;font-weight:600;color:var(--accent,#2563eb)">📐 Surfaces Plâtrerie disponibles</div>
              <div style="font-size:.8rem;color:var(--text-secondary,#666)">${piecesPlaco.length} pièce${piecesPlaco.length>1?'s':''} avec Métrage</div>
            </div>
            <button type="button" data-cex-action="import-placo" style="padding:7px 14px;border-radius:7px;border:none;background:var(--accent,#2563eb);color:#fff;font-size:.8rem;font-weight:600;cursor:pointer">Importer</button>
          </div>
          <div style="font-size:.8rem;font-weight:600;color:var(--text-secondary,#666);margin-bottom:6px">Que peindre ?</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${['murs','plafond','murs_et_plafond'].map(opt => {
              const labels = {murs:'Murs uniquement',plafond:'Plafond uniquement',murs_et_plafond:'Murs + Plafond'};
              const sel = (this._corpsConfig['peinture']||{}).zone === opt;
              return '<button type="button" data-cex-peinture-zone="' + opt + '" style="padding:6px 12px;border-radius:6px;border:2px solid ' + (sel?'var(--accent,#2563eb)':'var(--border,#e2e8f0)') + ';background:' + (sel?'rgba(37,99,235,.1)':'transparent') + ';color:#fff;font-size:.8rem;cursor:pointer">' + labels[opt] + '</button>';
            }).join('')}
          </div>
        </div>` : ''}
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
          ${items}
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
          <input id="cex-piece-libre" type="text" placeholder="Autre pièce / lieu..." style="flex:1;padding:9px 14px;border-radius:8px;border:1px solid var(--border,#e2e8f0);font-size:.9rem;background:var(--bg-card,#1e2530);color:var(--text-main,#fff)">
          <button type="button" data-cex-action="piece-libre-add" style="padding:9px 16px;border-radius:8px;border:none;background:var(--accent,#2563eb);color:#fff;font-weight:600;cursor:pointer">+ Ajouter</button>
        </div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 5b : Type chantier corps (Réno/Neuf) + linéaires ─
  _renderTypeCorps() {
    const corpsId = this._corpsActifs[this._corpsEnCours];
    const corps   = this.CORPS.find(c => c.id === corpsId);
    if (!['electricite','plomberie','maconnerie'].includes(corpsId)) {
      this._renderEtape('pieces');
      return;
    }
    const typeActuel     = (this._corpsConfig[corpsId] || {}).type || null;
    const lineaires      = this.LINEAIRES[corpsId] || [];
    const configActuelle = this._corpsConfig[corpsId] || {};

    const btnType = (id, label, icone, desc) =>
      `<div data-cex-type-corps="${id}" style="flex:1;min-width:160px;padding:16px;border-radius:10px;border:2px solid ${typeActuel===id?'var(--accent,#2563eb)':'var(--border,#e2e8f0)'};background:${typeActuel===id?'rgba(37,99,235,.06)':'var(--bg-card,#1e2530)'};cursor:pointer;text-align:center">
        <div style="font-size:1.6rem;margin-bottom:6px">${icone}</div>
        <div style="font-weight:700;margin-bottom:4px">${label}</div>
        <div style="font-size:.8rem;color:var(--text-secondary,#666)">${desc}</div>
      </div>`;

    const choixMaconnerie = corpsId === 'maconnerie';
    const titreType = choixMaconnerie ? 'Maçonnerie — Type' : corps ? corps.label + ' — Type de travaux' : 'Type de travaux';
    const champsLineaires = typeActuel === 'neuf' ? `
      <div style="margin-top:16px">
        <div style="font-size:.85rem;font-weight:600;color:var(--text-secondary,#666);margin-bottom:10px">Linéaires (depuis votre relevé sur place)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          ${lineaires.map(l => `
            <div>
              <label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">${l.label} (${l.unite})</label>
              <input id="cex-lin-${l.id}" type="number" min="0" step="1" value="${configActuelle[l.id]||''}" placeholder="${l.placeholder}"
                style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.9rem;box-sizing:border-box">
            </div>`).join('')}
        </div>
      </div>` : '';

    this._html(`
      ${this._progressBar('pieces')}
      ${this._card(`
        <div style="position:sticky;top:0;z-index:10;background:var(--bg,#0f0f1a);padding:12px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.1));display:flex;align-items:center;gap:10px;margin:-16px -16px 16px">
          <span style="font-size:1.4rem">${corps ? corps.icone : ''}</span>
          <h2 style="margin:0;font-size:1.1rem;font-weight:700">${corps ? corps.label : ''} — Type de travaux</h2>
          <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
            ${this._btn('← Retour', 'type-corps-retour', 'secondary')}
            ${typeActuel ? this._btn('Suivant — Sélectionner les pièces →', 'type-corps-suivant') : '<span style="font-size:.85rem;color:var(--text-secondary,#666);align-self:center">Choisissez un type pour continuer</span>'}
          </div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:4px">
          ${choixMaconnerie
            ? btnType('int', 'Intérieure', '🏠', 'Cloisons, enduits, dalles, linteaux') + btnType('ext', 'Extérieure', '🏗', 'Façades, murs, clôtures, fondations')
            : btnType('reno', 'Rénovation', '🔄', 'Remplacement appareillage existant') + btnType('neuf', 'Neuf / Création', '🆕', 'Câblage complet + appareillage')}
        </div>
        ${champsLineaires}
      `)}
    `);
    this._bind();
  },

  // ── Étape 6b : Appareillage par pièce (élec/plomberie) ───
  _renderAppareillage() {
    const p = this._pieceEnCours;
    if (!p) { this._renderEtape('pieces'); return; }
    const corps     = this.CORPS.find(c => c.id === p.corps);
    const liste     = this._getAppareillagePourPiece(p.corps, p.nom);
    const quantites = p.quantites || {};
    const cats      = [...new Set(liste.map(a => a.cat))];

    const sections = cats.map(cat => {
      const items = liste.filter(a => a.cat === cat).map(a => {
        const q = parseInt(quantites[a.id]) || 0;
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border,rgba(255,255,255,.08))">
          <span style="font-size:1.1rem;width:24px">${a.icone}</span>
          <span style="flex:1;font-size:.9rem">${a.label}</span>
          <div style="display:flex;align-items:center;gap:6px">
            <button type="button" data-cex-app-moins="${a.id}" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--border,#e2e8f0);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:1rem;line-height:1">−</button>
            <span id="cex-app-q-${a.id}" style="min-width:28px;text-align:center;font-weight:700;font-size:.95rem;color:${q>0?'#16a34a':'#fff'}">${q}</span>
            <button type="button" data-cex-app-plus="${a.id}" style="width:28px;height:28px;border-radius:6px;border:none;background:var(--accent,#2563eb);color:#fff;cursor:pointer;font-size:1rem;line-height:1">+</button>
          </div>
        </div>`;
      }).join('');
      return `<div style="margin-bottom:16px">
        <div style="font-size:.8rem;font-weight:700;color:var(--text-secondary,#666);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${cat}</div>
        ${items}
      </div>`;
    }).join('');

    const total = Object.values(quantites).reduce((s, v) => s + v, 0);

    this._html(`
      ${this._progressBar('metrage')}
      ${this._card(`
        <div style="position:sticky;top:0;z-index:10;background:var(--bg,#0f0f1a);padding:12px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.1));display:flex;align-items:center;gap:10px;margin:-16px -16px 16px">
          <span style="font-size:1.4rem">${corps ? corps.icone : ''}</span>
          <div>
            <h2 style="margin:0;font-size:1rem;font-weight:700">${this._esc(p.nom)}</h2>
            <div style="font-size:.8rem;color:var(--text-secondary,#666)">${corps ? corps.label : ''}${p.prestation ? ' · ' + this._esc(p.prestation) : ''}</div>
          </div>
          ${total > 0 ? `<span style="margin-left:auto;font-size:.9rem;color:#16a34a;font-weight:700">${total} point${total>1?'s':''}</span>` : ''}
          <div style="${total > 0 ? '' : 'margin-left:auto;'}display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
            ${this._btn('← Retour', 'app-retour', 'secondary')}
            ${this._btn('✓ Valider', 'app-valider')}
          </div>
        </div>
        <div style="background:var(--accent,#4f8ef7);border-radius:10px;padding:12px;margin-bottom:16px">
          <p style="color:#fff;margin:0;font-size:14px">
            ⚡ Saisissez le nombre de points par type. Le total sera calculé automatiquement.
          </p>
        </div>
        <div style="overflow-y:hidden">${sections}</div>
      `)}
    `);
    this._bind();
  },

  // ── Étape 6 : Métrage par pièce ──────────────────────────
  _renderMetrage() {
    const p = this._pieceEnCours;
    if (!p) { this._renderEtape('pieces'); return; }
    const surfaceMemorisee = this._surfacesMemorisees[p.nom];
    if (surfaceMemorisee && !(parseFloat(p.surface) > 0)) {
      p.surface = surfaceMemorisee;
    }
    if (p.corps !== 'paysagisme' && this._estZonePaysagisme(p)) {
      this._pieceEnCours = null;
      this._renderEtape('pieces');
      return;
    }
    const corps = this.CORPS.find(c => c.id === p.corps);
    const mode  = p.mode || 'rectangle';
    const metrageHeaderQte = p.corps === 'paysagisme' ? this._getQuantiteDevis('paysagisme', p) : parseFloat(p.surface) || 0;
    const metrageHeaderUnite = p.corps === 'paysagisme' ? this._getUniteOuvrage('paysagisme', p) : 'm²';

    const btnMode = (id, label, icone) =>
      `<button type="button" data-cex-mode="${id}" style="flex:1;padding:10px;border-radius:8px;border:2px solid ${mode===id?'var(--accent,#2563eb)':'var(--border,#e2e8f0)'};background:${mode===id?'rgba(37,99,235,.06)':'var(--bg-card,#1e2530)'};cursor:pointer;color:#fff;font-size:.85rem;font-weight:${mode===id?'700':'400'}">
        <div style="font-size:1.3rem;margin-bottom:4px">${icone}</div>${label}
      </button>`;

    const isPlaco   = p.corps === 'plaquisterie';
    const isRevetement = p.corps === 'revetement';
    const needsHSP  = isPlaco || (p.corps === 'maconnerie' && (this._corpsConfig['maconnerie'] || {}).lieuxKey === 'maconnerie_int');
    const paysIdsActuels = this._getPaysagismeIds(p);
    const paysCodeActuel = this._getPaysagismePrimaryId(p);
    const typePaysActuel = p.corps === 'paysagisme' ? this._getTypeMetragePaysagisme(p, paysCodeActuel) : 'm2';
    const fieldWrap = (id, label, inputHtml, visible) => `
        <div id="${id}" style="flex:1;min-width:120px;display:${visible ? 'block' : 'none'}">
          <label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">${label}</label>
          ${inputHtml}
        </div>`;
    const inputStyle = 'width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box';
    const essencesOptions = this._getEssencesHaie().map(e =>
      `<option value="${e.id}" ${(p.essenceHaie || 'autre') === e.id ? 'selected' : ''}>${this._esc(e.label)} — ${e.espacement}m</option>`
    ).join('');
    const champRect = `
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px">
        ${fieldWrap('cex-m-l-wrap', 'Longueur (m)', `<input id="cex-m-l" type="number" min="0" step="0.1" value="${p.longueur||''}" placeholder="ex: 5.5" style="${inputStyle}">`, p.corps !== 'paysagisme' || !['u'].includes(typePaysActuel))}
        ${fieldWrap('cex-m-w-wrap', 'Largeur (m)', `<input id="cex-m-w" type="number" min="0" step="0.1" value="${p.largeur||''}" placeholder="ex: 3.8" style="${inputStyle}">`, p.corps !== 'paysagisme' || ['m2','m3'].includes(typePaysActuel))}
        ${fieldWrap('cex-pays-hauteur-wrap', 'Hauteur (m)', `<input id="cex-pays-hauteur" type="number" min="0" step="0.1" value="${p.hauteurPaysage||''}" placeholder="ex: 1.8" style="${inputStyle}">`, p.corps === 'paysagisme' && typePaysActuel === 'ml')}
        ${fieldWrap('cex-pays-essence-wrap', 'Essence', `<select id="cex-pays-essence" style="${inputStyle}">${essencesOptions}</select>`, p.corps === 'paysagisme' && typePaysActuel === 'haie')}
        ${fieldWrap('cex-pays-quantite-wrap', 'Quantité', `<input id="cex-pays-quantite" type="number" min="0" step="1" value="${p.quantite||p.nbPoints||''}" placeholder="ex: 1" style="${inputStyle}">`, p.corps === 'paysagisme' && typePaysActuel === 'u')}
        ${fieldWrap('cex-pays-profondeur-wrap', 'Profondeur (m)', `<input id="cex-pays-profondeur" type="number" min="0" step="0.1" value="${p.profondeur||''}" placeholder="ex: 0.3" style="${inputStyle}">`, p.corps === 'paysagisme' && typePaysActuel === 'm3')}
        ${fieldWrap('cex-placo-epaisseur-wrap', 'Épaisseur cloison', `<select id="cex-placo-epaisseur" style="${inputStyle}">
          <option value="48" ${(p.epaisseurCloison || p.epaisseur || 72) == 48 ? 'selected' : ''}>48 mm (cloison légère)</option>
          <option value="72" ${(p.epaisseurCloison || p.epaisseur || 72) == 72 ? 'selected' : ''}>72 mm (standard)</option>
          <option value="98" ${(p.epaisseurCloison || p.epaisseur || 72) == 98 ? 'selected' : ''}>98 mm (avec isolation)</option>
          <option value="120" ${(p.epaisseurCloison || p.epaisseur || 72) == 120 ? 'selected' : ''}>120 mm (grande hauteur)</option>
          <option value="150" ${(p.epaisseurCloison || p.epaisseur || 72) == 150 ? 'selected' : ''}>150 mm (acoustique renforcé)</option>
        </select>`, isPlaco)}
        ${fieldWrap('cex-placo-isolant-wrap', 'Isolant', `<select id="cex-placo-isolant" style="${inputStyle}">
          <option value="aucun" ${(p.isolant || 'ldv') === 'aucun' ? 'selected' : ''}>Sans isolant</option>
          <option value="ldv" ${(p.isolant || 'ldv') === 'ldv' ? 'selected' : ''}>Laine de verre</option>
          <option value="ldr" ${p.isolant === 'ldr' ? 'selected' : ''}>Laine de roche</option>
          <option value="ldv-acoustique" ${p.isolant === 'ldv-acoustique' ? 'selected' : ''}>Laine de verre acoustique</option>
          <option value="polyurethane" ${p.isolant === 'polyurethane' ? 'selected' : ''}>Polyuréthane</option>
        </select>`, isPlaco && parseInt(p.epaisseurCloison || p.epaisseur || 72, 10) >= 72)}
        ${needsHSP ? `
        <div style="flex:1;min-width:120px">
          <label style="font-size:.8rem;color:#f59e0b;font-weight:700;display:block;margin-bottom:4px">Hauteur sous plafond (m) *</label>
          <input id="cex-m-hsp" type="number" min="1.5" max="6" step="0.05" value="${p.hsp||''}" placeholder="ex: 2.50"
            style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid #f59e0b;background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box">
        </div>` : ''}
      </div>
      <div id="cex-m-preview" style="font-size:.9rem;color:var(--accent,#2563eb);font-weight:600;min-height:22px"></div>`;

    const revetementOptions = this._getOuvragesRevetement().map(ouv => {
      const code = ouv.code || ouv.id;
      const selected = ((p.ouvrageRevetement || 'OUV_STRATIFIE') === code) ? 'selected' : '';
      return `<option value="${this._esc(code)}" ${selected}>${this._esc(ouv.designation || code)}</option>`;
    }).join('');
    const champRevetement = `
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px">
        ${fieldWrap('cex-revetement-surface-wrap', 'Surface (m²)', `<input id="cex-revetement-surface" type="number" min="0" step="0.1" value="${p.surface||''}" placeholder="ex: 20" style="${inputStyle}">`, true)}
        ${fieldWrap('cex-revetement-ouvrage-wrap', 'Ouvrage', `<select id="cex-revetement-ouvrage" style="${inputStyle}">${revetementOptions}</select>`, true)}
      </div>
      <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:.9rem;color:var(--text-secondary,#ddd);cursor:pointer">
        <input id="cex-revetement-plinthes" type="checkbox" ${p.plinthes ? 'checked' : ''} style="accent-color:var(--accent,#4f8ef7)">
        <span>Inclure les plinthes</span>
      </label>
      <div id="cex-m-preview" style="font-size:.9rem;color:var(--accent,#2563eb);font-weight:600;min-height:22px"></div>`;

    const champL = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
        <div><label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">Longueur 1 (m)</label>
          <input id="cex-m-l1" type="number" min="0" step="0.1" value="${p.l1||''}" placeholder="ex: 6" style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box"></div>
        <div><label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">Largeur 1 (m)</label>
          <input id="cex-m-w1" type="number" min="0" step="0.1" value="${p.w1||''}" placeholder="ex: 4" style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box"></div>
        <div><label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">Longueur 2 (m)</label>
          <input id="cex-m-l2" type="number" min="0" step="0.1" value="${p.l2||''}" placeholder="ex: 3" style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box"></div>
        <div><label style="font-size:.8rem;color:var(--text-secondary,#666);display:block;margin-bottom:4px">Largeur 2 (m)</label>
          <input id="cex-m-w2" type="number" min="0" step="0.1" value="${p.w2||''}" placeholder="ex: 2" style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg-card,#1e2530);color:#fff;font-size:.95rem;box-sizing:border-box"></div>
      </div>
      <div id="cex-m-preview" style="font-size:.9rem;color:var(--accent,#2563eb);font-weight:600;min-height:22px"></div>`;

    const champLibre = mode === 'libre' ? `
      <div style="margin-top:12px">
        <p style="font-size:13px;color:var(--text-muted,#888);margin-bottom:8px">
          Cliquez pour poser des points. Double-clic pour fermer la forme.
        </p>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
          <label style="font-size:12px;color:var(--text-muted,#888)">Zone réelle :</label>
          <select id="cex-canvas-zone"
            style="padding:4px 8px;border-radius:6px;background:var(--card-bg,#1e1e2e);color:var(--text,#fff);border:1px solid var(--border,rgba(255,255,255,.15));font-size:12px">
            <option value="3">3m × 2m</option>
            <option value="5">5m × 3m</option>
            <option value="8">8m × 5m</option>
            <option value="12">12m × 7m</option>
            <option value="20">20m × 12m</option>
            <option value="22" selected>22m × 10m</option>
            <option value="30">30m × 20m</option>
          </select>
          <span style="font-size:11px;color:var(--text-muted,#666)">1 carreau = 10cm · snap 1cm</span>
        </div>
        <canvas id="cex-canvas-libre" width="680" height="400"
          style="width:100%;max-width:680px;height:400px;border:2px solid var(--accent,#4f8ef7);border-radius:8px;background:var(--card-bg,#1e1e2e);cursor:crosshair;touch-action:none">
        </canvas>
        <div id="cex-canvas-mesure"
          style="font-size:12px;color:var(--accent,#4f8ef7);margin-top:6px;min-height:18px;text-align:right">
        </div>
        <p style="font-size:13px;margin-top:8px">
          Surface calculée : <strong id="cex-canvas-surface">${p.surface && p.mode === 'libre' ? (Math.round(p.surface * 100) / 100).toFixed(2) + ' m²' : '0.00 m²'}</strong>
        </p>
        <button type="button" id="cex-canvas-reset"
          style="margin-top:8px;padding:4px 10px;border-radius:6px;background:transparent;border:1px solid var(--border,rgba(255,255,255,.2));color:var(--text-muted,#888);cursor:pointer;font-size:12px">
            Effacer
        </button>
        <input type="hidden" id="cex-surface-libre" value="${p.surface && p.mode === 'libre' ? p.surface : 0}">
      </div>` : '';
    const champs = isRevetement ? champRevetement : (mode === 'forme-l' ? champL : champRect);
    const champPaysagisme = p.corps === 'paysagisme' ? (() => {
      if (typeof BddPaysagismeV2 === 'undefined') {
        const codes = this._dedupeBy(this.PRESTATIONS_PAYSAGISME[p.nom] || ['OUV_GAZON_ROULEAU'], c => c);
        const opts = codes.map(code => {
          const ouv = typeof BddV2 !== 'undefined' ? BddV2.getOuvrage(code) : null;
          const sel = paysIdsActuels.includes(code) ? 'selected' : '';
          return `<option value="${code}" ${sel}>${this._esc(ouv ? ouv.designation : code)}</option>`;
        }).join('');
        return `<div style="background:var(--card-bg,#1e1e2e);border:1px solid var(--accent,#4f8ef7);border-radius:10px;padding:14px;margin-bottom:16px;overflow:hidden;max-width:100%;box-sizing:border-box;width:100%">
          <p style="font-weight:700;color:var(--accent,#4f8ef7);margin:0 0 10px 0">🌿 Prestation sur ${this._esc(p.nom)}</p>
          <select id="cex-pays-tache" style="width:100%;padding:10px;border-radius:8px;background:#fff;color:#222;border:none;font-size:15px">
            <option value="">-- Choisir --</option>${opts}
          </select></div>`;
      }
      const currentIds = this._getPaysagismeIds(p);
      let sectionsIds = this._getSectionsForZonePaysagisme(p.nom);
      currentIds.forEach(currentId => {
        const selectedSection = BddPaysagismeV2.sections.find(sec =>
          BddPaysagismeV2.getPrestationsBySection(sec.id).some(pr => pr.id === currentId)
        );
        if (selectedSection && !sectionsIds.includes(selectedSection.id)) {
          sectionsIds = sectionsIds.concat(selectedSection.id);
        }
      });
      const sectionsAccordeon = BddPaysagismeV2.sections.filter(sec => sectionsIds.includes(sec.id));
      const accordion = this._renderAccordeonPaysagisme(sectionsAccordeon, currentIds);
      return `<div style="background:var(--card-bg,#1e1e2e);border:1px solid var(--accent,#4f8ef7);border-radius:10px;padding:14px;margin-bottom:16px;overflow:hidden;max-width:100%;box-sizing:border-box;width:100%">
        <p style="font-weight:700;color:var(--accent,#4f8ef7);margin:0 0 10px 0">🌿 Prestation sur ${this._esc(p.nom)}</p>
        ${accordion}
      </div>`;
    })() : '';
    const optionsPackagePays = p.corps === 'paysagisme'
      ? this._dedupeBy(this._getPaysagismeIds(p).flatMap(code => this._getOptionsPackagePaysagisme(p, code)), opt => opt.id)
      : [];
    const optionsPaysagisme = optionsPackagePays.length ? `
      <div style="background:rgba(79,142,247,.08);border:1px solid rgba(79,142,247,.35);border-radius:10px;padding:14px;margin-bottom:16px">
        <p style="font-weight:700;color:var(--accent,#4f8ef7);margin:0 0 10px 0">Options du package</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px">
          ${optionsPackagePays.map(opt => `
            <label style="display:flex;gap:8px;align-items:center;font-size:.85rem;color:var(--text-secondary,#ddd);cursor:pointer">
              <input type="checkbox" data-cex-pays-option="${opt.id}" ${(p.optionsPaysagisme || []).includes(opt.id) ? 'checked' : ''}>
              <span>${this._esc(opt.label)} <small style="opacity:.7">(${opt.unite})</small></span>
            </label>
          `).join('')}
        </div>
      </div>` : '';

    this._html(`
      ${this._progressBar('metrage')}
      ${this._card(`
        <div style="position:sticky;top:0;z-index:10;background:var(--bg,#0f0f1a);padding:12px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.1));display:flex;align-items:center;gap:10px;margin:-16px -16px 16px">
          <span style="font-size:1.4rem">${corps ? corps.icone : ''}</span>
          <div>
            <h2 style="margin:0;font-size:1rem;font-weight:700">${this._esc(p.nom)}</h2>
            <div style="font-size:.8rem;color:var(--text-secondary,#666)">${corps ? corps.label : ''}</div>
          </div>
          ${metrageHeaderQte ? `<span style="margin-left:auto;font-size:.9rem;color:#16a34a;font-weight:700">${metrageHeaderQte} ${metrageHeaderUnite}</span>` : ''}
          <div style="${metrageHeaderQte ? '' : 'margin-left:auto;'}display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
            ${this._btn('← Retour', 'metrage-retour', 'secondary')}
            ${this._btn('✓ Valider la surface', 'metrage-valider').replace('<button ', '<button id="cex-metrage-valider" ')}
          </div>
        </div>
        ${champPaysagisme}
        ${optionsPaysagisme}
        <div style="display:${isRevetement ? 'none' : 'flex'};gap:8px;margin-bottom:16px">
          ${btnMode('rectangle','Rectangle','▬')}
          ${btnMode('forme-l','Forme en L','⌐')}
          ${btnMode('libre','Dessin libre','✏️')}
        </div>
        ${mode === 'libre' ? champLibre : champs}
      `)}
    `);

    const preview = () => {
      const el = this._container.querySelector('#cex-m-preview');
      if (!el) return;
      let s = 0;
      if (p.corps === 'revetement') {
        s = parseFloat((this._container.querySelector('#cex-revetement-surface') || {}).value) || 0;
        const plinthes = this._container.querySelector('#cex-revetement-plinthes');
        const perimetre = s > 0 ? Math.round(Math.sqrt(s) * 4 * 100) / 100 : 0;
        el.textContent = s > 0
          ? '→ Surface : ' + s + ' m²' + (plinthes && plinthes.checked ? ' · Plinthes estimées : ' + perimetre + ' ml' : '')
          : '';
        return;
      }
      if (mode === 'rectangle') {
        const l   = parseFloat((this._container.querySelector('#cex-m-l') || {}).value) || 0;
        const w   = parseFloat((this._container.querySelector('#cex-m-w') || {}).value) || 0;
        const hp  = parseFloat((this._container.querySelector('#cex-pays-hauteur') || {}).value) || 0;
        const qte = parseFloat((this._container.querySelector('#cex-pays-quantite') || {}).value) || 0;
        const prof = parseFloat((this._container.querySelector('#cex-pays-profondeur') || {}).value) || 0;
        const hsp = parseFloat((this._container.querySelector('#cex-m-hsp') || {}).value) || 0;
        const selPays = this._container.querySelector('#cex-pays-tache');
        const typePays = p.corps === 'paysagisme' ? this._getTypeMetragePaysagisme(p, selPays ? selPays.value : '') : 'm2';
        if (p.corps === 'paysagisme' && typePays === 'haie') {
          const essence = this._getEssenceHaie((this._container.querySelector('#cex-pays-essence') || {}).value || 'autre');
          s = l > 0 ? Math.ceil(l / essence.espacement) : 0;
          el.textContent = s > 0 ? '→ ' + s + ' plant' + (s > 1 ? 's' : '') + ' (' + essence.label + ', ' + essence.espacement + 'm)' : '';
          return;
        }
        if (p.corps === 'paysagisme' && typePays === 'ml') {
          s = Math.round(l * (hp || 1) * 100) / 100;
          el.textContent = l > 0 ? '→ Linéaire : ' + l + ' ml' + (hp > 0 ? ' × hauteur ' + hp + ' m = ' + s + ' ml' : '') : '';
          return;
        }
        if (p.corps === 'paysagisme' && typePays === 'u') {
          s = qte;
          el.textContent = s > 0 ? '→ Quantité : ' + s + ' u' : '';
          return;
        }
        if (p.corps === 'paysagisme' && typePays === 'm3') {
          s = Math.round(l * w * prof * 100) / 100;
          el.textContent = s > 0 ? '→ Volume : ' + s + ' m³' : '';
          return;
        }
        s = Math.round(l * w * 100) / 100;
        if (hsp && l && w && el) {
          const murs = Math.round((2*l + 2*w) * hsp * 100) / 100;
          el.innerHTML = `→ Sol : ${s} m² · Murs : ${murs} m² · Plafond : ${s} m²`;
          return;
        }
      } else if (mode === 'forme-l') {
        const l1 = parseFloat((this._container.querySelector('#cex-m-l1') || {}).value) || 0;
        const w1 = parseFloat((this._container.querySelector('#cex-m-w1') || {}).value) || 0;
        const l2 = parseFloat((this._container.querySelector('#cex-m-l2') || {}).value) || 0;
        const w2 = parseFloat((this._container.querySelector('#cex-m-w2') || {}).value) || 0;
        s = Math.round((l1 * w1 + l2 * w2) * 100) / 100;
      }
      el.textContent = s > 0 ? '→ Surface : ' + s + ' m²' : '';
    };
    this._container.querySelectorAll('input[type="number"]').forEach(i => i.addEventListener('input', preview));
    this._container.querySelectorAll('select').forEach(i => i.addEventListener('change', preview));
    this._container.querySelectorAll('input[type="checkbox"]').forEach(i => i.addEventListener('change', preview));
    const placoEpaisseur = this._container.querySelector('#cex-placo-epaisseur');
    const placoIsolantWrap = this._container.querySelector('#cex-placo-isolant-wrap');
    if (placoEpaisseur && placoIsolantWrap) {
      placoEpaisseur.addEventListener('change', () => {
        placoIsolantWrap.style.display = parseInt(placoEpaisseur.value, 10) >= 72 ? 'block' : 'none';
      });
    }
    preview();
    this._bind();
    const canvas = this._container.querySelector('#cex-canvas-libre');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let points = [];
      let closed = false;
      let mousePos = null;
      const zoneSelect = this._container.querySelector('#cex-canvas-zone');
      let ZONE_M = zoneSelect ? parseFloat(zoneSelect.value) : 22;
      const mToP = () => canvas.width / ZONE_M;
      const pToM = () => ZONE_M / canvas.width;

      const drawGrid = () => {
        const step10cm = canvas.width / ZONE_M / 10;
        const step1m = canvas.width / ZONE_M;
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= canvas.width; x += step10cm) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += step10cm) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += step1m) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += step1m) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '9px sans-serif';
        for (let i = 1; i <= Math.floor(ZONE_M); i++) {
          ctx.fillText(i + 'm', i * step1m + 2, 10);
        }
        for (let i = 1; i <= Math.floor(canvas.height / step1m); i++) {
          ctx.fillText(i + 'm', 2, i * step1m - 2);
        }
      };

      const fmtDist = metres => {
        if (metres < 0.995) return Math.round(metres * 100) + ' cm';
        return metres.toFixed(2) + ' m';
      };

      const drawSegmentLabel = (a, b) => {
        const scale = pToM();
        const dx = (b.x - a.x) * scale;
        const dy = (b.y - a.y) * scale;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - 8;
        ctx.font = '10px sans-serif';
        const label = fmtDist(dist);
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(mx - tw / 2 - 3, my - 12, tw + 6, 16);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.textAlign = 'center';
        ctx.fillText(label, mx, my);
        ctx.textAlign = 'left';
      };

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        if (points.length) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          points.forEach(pt => ctx.lineTo(pt.x, pt.y));
          if (closed) ctx.closePath();
          ctx.strokeStyle = '#4f8ef7';
          ctx.lineWidth = 2;
          ctx.stroke();
          if (closed) {
            ctx.fillStyle = 'rgba(79,142,247,0.15)';
            ctx.fill();
          }
          points.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#4f8ef7';
            ctx.fill();
          });
          for (let i = 0; i < points.length - 1; i++) {
            drawSegmentLabel(points[i], points[i + 1]);
          }
          if (closed && points.length > 1) {
            drawSegmentLabel(points[points.length - 1], points[0]);
          }
        }

        if (!closed && mousePos && points.length > 0) {
          const last = points[points.length - 1];
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.strokeStyle = 'rgba(79,142,247,0.5)';
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.setLineDash([]);

          const scale = pToM();
          const dx = (mousePos.x - last.x) * scale;
          const dy = (mousePos.y - last.y) * scale;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.05) {
            const dxp = mousePos.x - last.x;
            const dyp = mousePos.y - last.y;
            const len = Math.sqrt(dxp * dxp + dyp * dyp) || 1;
            const nx = -dyp / len;
            const ny = dxp / len;
            const mx = (last.x + mousePos.x) / 2 + nx * 20;
            const my = (last.y + mousePos.y) / 2 + ny * 20 - 8;
            const label = fmtDist(dist);
            ctx.font = 'bold 11px sans-serif';
            const tw = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(mx - tw / 2 - 4, my - 14, tw + 8, 18);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(label, mx, my - 2);
            ctx.textAlign = 'left';
          }
          if (mousePos.snapFirst) {
            ctx.beginPath();
            ctx.arc(points[0].x, points[0].y, 10, 0, Math.PI * 2);
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      };

      const fermerForme = () => {
        closed = true;
        mousePos = null;
        const surf = (Math.round(calcSurface() * 100) / 100).toFixed(2);
        draw();
        const el = this._container.querySelector('#cex-canvas-surface');
        if (el) el.textContent = surf + ' m²';
        const inp = this._container.querySelector('#cex-surface-libre');
        if (inp) inp.value = surf;
        if (this._pieceEnCours) this._pieceEnCours.surface = parseFloat(surf);
      };

      const calcSurface = () => {
        if (points.length < 3) return 0;
        const scale = pToM();
        let area = 0;
        for (let i = 0; i < points.length; i++) {
          const j = (i + 1) % points.length;
          area += points[i].x * points[j].y;
          area -= points[j].x * points[i].y;
        }
        return Math.round(Math.abs(area / 2) * scale * scale * 100) / 100;
      };

      const getPos = e => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      };

      const snap = pos => {
        const SNAP_5CM = mToP() / 20;
        const SNAP_1CM = mToP() / 100;
        let gx = Math.round(pos.x / SNAP_5CM) * SNAP_5CM;
        let gy = Math.round(pos.y / SNAP_5CM) * SNAP_5CM;
        const SNAP_10CM = mToP() / 10;
        const rx = Math.round(pos.x / SNAP_10CM) * SNAP_10CM;
        const ry = Math.round(pos.y / SNAP_10CM) * SNAP_10CM;
        if (Math.abs(pos.x - rx) < SNAP_1CM * 3) gx = rx;
        if (Math.abs(pos.y - ry) < SNAP_1CM * 3) gy = ry;
        const SNAP_1M = mToP();
        const mx1 = Math.round(pos.x / SNAP_1M) * SNAP_1M;
        const my1 = Math.round(pos.y / SNAP_1M) * SNAP_1M;
        if (Math.abs(pos.x - mx1) < SNAP_1CM * 5) gx = mx1;
        if (Math.abs(pos.y - my1) < SNAP_1CM * 5) gy = my1;
        if (points.length >= 3) {
          const distFirst = Math.sqrt(Math.pow(pos.x - points[0].x, 2) + Math.pow(pos.y - points[0].y, 2));
          if (distFirst < SNAP_1CM * 8) return { x: points[0].x, y: points[0].y, snapFirst: true };
        }
        return { x: gx, y: gy };
      };

      const listenerOpts = this._bindController ? { signal: this._bindController.signal } : undefined;
      const touchOpts = this._bindController ? { passive: false, signal: this._bindController.signal } : { passive: false };

      canvas.addEventListener('click', e => {
        if (closed) return;
        const raw = getPos(e);
        const pos = snap(raw);
        if (pos.snapFirst && points.length >= 3) {
          fermerForme();
          return;
        }
        points.push({ x: pos.x, y: pos.y });
        draw();
      }, listenerOpts);

      canvas.addEventListener('dblclick', () => {
        if (points.length < 3) return;
        fermerForme();
      }, listenerOpts);

      canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        if (closed) return;
        const raw = getPos(e);
        const pos = snap(raw);
        if (pos.snapFirst && points.length >= 3) {
          fermerForme();
          return;
        }
        points.push({ x: pos.x, y: pos.y });
        draw();
      }, touchOpts);

      canvas.addEventListener('mousemove', e => {
        if (closed) return;
        const raw = getPos(e);
        mousePos = snap(raw);
        draw();
        const mesure = this._container.querySelector('#cex-canvas-mesure');
        if (mesure) {
          const scale = pToM();
          mesure.textContent = fmtDist(mousePos.x * scale) + ' × ' + fmtDist(mousePos.y * scale);
        }
      }, listenerOpts);

      if (zoneSelect) {
        zoneSelect.addEventListener('change', () => {
          ZONE_M = parseFloat(zoneSelect.value);
          points = [];
          closed = false;
          mousePos = null;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawGrid();
          const mesure = this._container.querySelector('#cex-canvas-mesure');
          if (mesure) mesure.textContent = '';
          const elSurf = this._container.querySelector('#cex-canvas-surface');
          if (elSurf) elSurf.textContent = '0 m²';
          const inp = this._container.querySelector('#cex-surface-libre');
          if (inp) inp.value = '0';
        }, listenerOpts);
      }

      const resetBtn = this._container.querySelector('#cex-canvas-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          points = [];
          closed = false;
          mousePos = null;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawGrid();
          const el = this._container.querySelector('#cex-canvas-surface');
          if (el) el.textContent = '0.00 m²';
          const inp = this._container.querySelector('#cex-surface-libre');
          if (inp) inp.value = '0';
          const mesure = this._container.querySelector('#cex-canvas-mesure');
          if (mesure) mesure.textContent = '';
          if (this._pieceEnCours) this._pieceEnCours.surface = 0;
        }, listenerOpts);
      }
      drawGrid();
    }
  },

  // ── Mapping corps → BDD V2 ───────────────────────────────
  CORPS_BDD: {
    plaquisterie: { label: 'Plâtrerie', ouvrageDefaut: 'OUV_CLOISON_BA13_M48' },
    peinture:     { label: 'Peinture',     ouvrageDefaut: 'OUV_PEINTURE_MURS_2_COUCHES' },
    electricite:  { label: 'Electricite',  ouvrageDefaut: null },
    plomberie:    { label: 'Plomberie',    ouvrageDefaut: null },
    maconnerie:   { label: 'Maconnerie',   ouvrageDefaut: 'OUV_MUR_PARPAING_20' },
    revetement:   { label: 'Revêtement de sol', bdd: 'BddV2', ouvrageDefaut: 'OUV_STRATIFIE' },
    paysagisme:   { label: 'Paysagisme',   ouvrageDefaut: null },
  },

  _buildDesignationDevis(corpsId, piece, dims) {
    if (corpsId === 'plaquisterie') {
      const surface = parseFloat(piece.surface) || 0;
      const longueur = parseFloat(piece.longueur) || (surface > 0 ? Math.round(Math.sqrt(surface) * 10) / 10 : 0);
      const hauteur = parseFloat(piece.hauteur) || parseFloat(piece.hsp) || 2.5;
      const ouvrageId = piece.ouvrageId || piece.ouvrage || (this.CORPS_BDD.plaquisterie || {}).ouvrageDefaut;
      const ouvrage = (typeof BddV2 !== 'undefined' && BddV2.getOuvrage) ? BddV2.getOuvrage(ouvrageId) : null;
      const epaisseur = piece.epaisseurCloison || piece.epaisseur || (ouvrage && (ouvrage.epaisseur || ouvrage.epaisseur_mm)) || 72;
      const isolants = {
        aucun: '',
        ldv: 'laine de verre',
        ldr: 'laine de roche',
        'ldv-acoustique': 'laine de verre acoustique',
        polyurethane: 'polyuréthane',
      };
      const isolation = isolants[piece.isolant || 'ldv'] || piece.isolation || piece.typeIsolation || '';
      if (longueur && hauteur) {
        return piece.nom + ' — Cloison ' + longueur + '×' + hauteur + 'm — ' + epaisseur + 'mm' + (isolation ? ' + ' + isolation : '');
      }
      return piece.nom + ' — ' + (ouvrage ? ouvrage.designation : 'Cloison ' + epaisseur + 'mm') + (isolation ? ' + ' + isolation : '');
    }
    if (corpsId === 'peinture') {
      const couches = parseInt(piece.nbCouches || piece.couches, 10) || 2;
      const finition = piece.finition || 'satiné';
      const coloris = piece.coloris ? ' ' + piece.coloris : '';
      return piece.nom + ' — Préparation + ' + couches + ' couches ' + finition + coloris;
    }
    if (corpsId === 'revetement') {
      const surface = parseFloat(piece.surface) || 0;
      const ouvrage = this._getOuvrageRevetement(piece);
      return piece.nom + ' — ' + (ouvrage.designation || 'Revêtement de sol') + ' — ' + surface + 'm²';
    }
    return piece.nom + (dims.length ? ' — ' + dims.join(' | ') : '');
  },

  _getSurfaceChantierPiece(piece) {
    if (!piece) return 0;
    const surfaceSol = parseFloat(piece.surface_sol);
    if (surfaceSol > 0) return surfaceSol;
    const longueur = parseFloat(piece.longueur) || 0;
    const largeur = parseFloat(piece.largeur) || 0;
    if (longueur > 0 && largeur > 0) return Math.round(longueur * largeur * 100) / 100;
    const l1 = parseFloat(piece.l1) || 0;
    const w1 = parseFloat(piece.w1) || 0;
    const l2 = parseFloat(piece.l2) || 0;
    const w2 = parseFloat(piece.w2) || 0;
    if ((l1 && w1) || (l2 && w2)) return Math.round((l1 * w1 + l2 * w2) * 100) / 100;
    return parseFloat(piece.surface) || 0;
  },

  _getPiecesSourceForfait() {
    const state = {
      chantier: this._chantier || {},
      etape1: this._etape1 || {},
      lieux: (this._pieces || []).map(p => Object.assign({}, p, {
        surface: this._getSurfaceChantierPiece(p),
      })),
    };
    // Structure réelle observée ici : CalcExpressV2 n'alimente pas
    // state.chantier.pieces/state.etape1.pieces ; les pièces saisies sont dans
    // this._pieces, tableau plat corps×pièce. DevisMulti._state contient les
    // sections/lignes devis et ne doit pas servir au calcul du forfait.
    const piecesChantier = (
      (state.chantier && state.chantier.pieces) ||
      (state.etape1 && state.etape1.pieces) ||
      []
    );
    if (piecesChantier.length > 0) return piecesChantier;
    return Object.values(
      ((state.lieux || []).reduce((acc, p) => {
        const nom = String((p && p.nom) || '').trim();
        if (nom && !acc[nom]) acc[nom] = p;
        return acc;
      }, {}))
    );
  },

  _ajouterForfaitPreparationDevis() {
    if (typeof DevisMulti === 'undefined' || !DevisMulti._state) return;
    const piecesSource = this._getPiecesSourceForfait();
    if (!piecesSource.length) return;
    const zonesPaysagisme = this._getZonesPaysagismeSet();
    const surfaceTotale = Math.round(piecesSource.reduce((s, p) => s + (parseFloat(p.surface) || 0), 0) * 100) / 100;
    const piecesInterieures = piecesSource.filter(p => !zonesPaysagisme.has((p && p.nom) || p));
    const zonesExterieures = piecesSource.filter(p => zonesPaysagisme.has((p && p.nom) || p));
    const nbPieces = piecesInterieures.length;
    const nbZones = zonesExterieures.length;
    const surfacePays = Math.round(zonesExterieures.reduce((s, p) => s + (parseFloat(p.surface) || 0), 0) * 100) / 100;
    const paysOnly = nbZones > 0 && nbPieces === 0;
    const nb = paysOnly ? nbZones : nbPieces;
    const surfaceForfait = paysOnly ? surfacePays : surfaceTotale;
    const prix = paysOnly
      ? Math.min(1200, Math.max(120, Math.round(nbZones * 65 + surfacePays * 0.5)))
      : Math.min(850, Math.max(85, Math.round(nbPieces * 45 + surfaceTotale * 0.8)));
    const designation = paysOnly
      ? 'Préparation chantier extérieur — Balisage, protections, nettoyage fin de chantier (' + nb + ' zone(s), ' + surfaceForfait + 'm²)'
      : 'Protection chantier — Polyane, scotch, protections + installation et repli (' + nb + ' pièce(s), ' + surfaceForfait + 'm²)';
    const sec = {
      key: 'preparation_chantier',
      icon: paysOnly ? '🌿' : '🛡️',
      titre: paysOnly ? 'Préparation chantier extérieur' : 'Protection chantier',
      tva: paysOnly ? 10 : 20,
      lignes: [{
        id: DevisMulti._uid(),
        ref: '',
        designation,
        unite: 'forfait',
        qte: 1,
        prix,
        obligatoire: true,
        option: false,
      }],
      sid: DevisMulti._uid(),
    };
    DevisMulti._state.sections = (DevisMulti._state.sections || []).filter(s => s.key !== sec.key);
    DevisMulti._state.sections.unshift(sec);
  },

  // ── Calcul prix réel via BddV2 (fallback forfait) ────────
  _calcCorps(corpsId, surface, piece) {
    if (corpsId === 'maconnerie' && piece && piece.prestation) {
      const ouvragePrestation = this._getOuvragePrestation(piece.prestation);
      if (ouvragePrestation && typeof BddV2 !== 'undefined' && BddV2.estChargee()) {
        return BddV2.calcPrixVente(ouvragePrestation, surface);
      }
    }
    if (corpsId === 'paysagisme' && piece && this._getPaysagismeIds(piece).length) {
      const code = this._getPaysagismePrimaryId(piece);
      if (code.startsWith('PAYS_') && typeof BddPaysagismeV2 !== 'undefined') {
        const prix = BddPaysagismeV2.getPrix(code);
        if (prix) {
          const q = surface || 1;
          const coutMat = prix.mat * q;
          const coutMO = prix.mo * q;
          const prixVente = coutMat * 1.3 + coutMO * 1.4;
          return { coutMat, coutMO, prixVente, gain: prixVente - coutMat - coutMO };
        }
      }
      if (typeof BddV2 !== 'undefined' && BddV2.estChargee()) {
        return BddV2.calcPrixVente(code, surface);
      }
    }
    if (corpsId === 'revetement') {
      const ouvrage = this._getOuvrageRevetement(piece);
      if (typeof BddV2 !== 'undefined' && BddV2.calcPrixVente) {
        return BddV2.calcPrixVente(ouvrage.code || 'OUV_STRATIFIE', surface);
      }
    }
    const bdd = this.CORPS_BDD[corpsId];
    if (!bdd || !bdd.ouvrageDefaut) {
      const coutMat   = surface * 8;
      const coutMO    = surface * 0.65 * 45;
      const prixVente = (coutMat + coutMO) * 1.30;
      return { coutMat, coutMO, prixVente, gain: prixVente - coutMat - coutMO };
    }
    if (typeof BddV2 === 'undefined' || !BddV2.estChargee()) {
      console.warn('[CalcExpressV2] BddV2 non chargée — forfait pour', bdd.ouvrageDefaut);
      const coutMat   = surface * 8;
      const coutMO    = surface * 0.65 * 45;
      const prixVente = (coutMat + coutMO) * 1.30;
      return { coutMat, coutMO, prixVente, gain: prixVente - coutMat - coutMO };
    }
    return BddV2.calcPrixVente(bdd.ouvrageDefaut, surface);
  },

  _estimerPerimetre(piece) {
    const l = parseFloat(piece.longueur) || 0;
    const w = parseFloat(piece.largeur) || 0;
    const surface = parseFloat(piece.surface) || 0;
    if (l && w) return Math.round((2 * l + 2 * w) * 100) / 100;
    if (parseFloat(piece.perimetre)) return parseFloat(piece.perimetre);
    return surface > 0 ? Math.round(Math.sqrt(surface) * 4 * 100) / 100 : 0;
  },

  _ajouterLigneDevisDirecte(corpsId, corps, qte, unite, designation, prixUnitaire) {
    if (typeof DevisMulti === 'undefined' || !DevisMulti._state) return;
    let sec = DevisMulti._state.sections.find(s => s.key === corpsId);
    if (!sec) {
      sec = {
        key: corpsId,
        icon: (corps && corps.icone) || '🔧',
        titre: (corps && corps.label) || corpsId,
        tva: 10,
        lignes: [],
        sid: DevisMulti._uid(),
      };
      DevisMulti._state.sections.push(sec);
    }
    sec.lignes.push({
      id: DevisMulti._uid(),
      ref: '',
      designation,
      unite,
      qte,
      prix: prixUnitaire || 0,
      obligatoire: true,
      option: false,
    });
  },

  _ajouterPlinthesRevetementDevis(piece, corps) {
    const qte = this._estimerPerimetre(piece);
    if (!qte) return;
    const r = (typeof BddV2 !== 'undefined' && BddV2.calcPrixVente)
      ? BddV2.calcPrixVente('OUV_PLINTHE_POSE', qte)
      : { prixVente: 0 };
    const prixUnitaire = qte > 0 ? Math.round((r.prixVente || 0) / qte) : 0;
    this._ajouterLigneDevisDirecte(
      'revetement',
      corps,
      qte,
      'ml',
      piece.nom + ' — Plinthes posées — ' + qte + 'ml',
      prixUnitaire
    );
  },

  _linePackagePaysagisme(designation, qte, unite, prix, obligatoire, ouvrage) {
    return { designation, qte: Math.max(0, Math.round((qte || 0) * 100) / 100), unite, prix, obligatoire: !!obligatoire, ouvrage: ouvrage || null };
  },

  _quantiteLignePackagePaysagisme(piece, ouvrageId, line, code) {
    const unite = String(line.unite || '').toLowerCase();
    const surface = parseFloat(piece.surface) || 0;
    const longueur = parseFloat(piece.longueur) || parseFloat(piece.perimetre) || 0;
    const largeur = parseFloat(piece.largeur) || 0;
    const perimetre = longueur && largeur ? Math.round(2 * (longueur + largeur)) : this._estimerPerimetre(piece);
    const tache = String(line.tache || '').toUpperCase();
    const pieceCode = code ? Object.assign({}, piece, { tachePaysagisme: code, tachesPaysagisme: [code] }) : piece;
    const ouvrageUnite = String(this._getUniteOuvrage('paysagisme', pieceCode) || '').toLowerCase();

    const mode = line.quantiteMode;
    if (mode) {
      if (mode === 'surface') return surface;
      if (mode === 'longueur') return longueur || perimetre;
      if (mode === 'perimetre') return perimetre || longueur;
      if (mode === 'volume') { const prof = parseFloat(piece.profondeur) || 0; return prof ? surface * prof : surface * 0.5; }
      if (mode === 'nb_plants') { const esp = this._getEssenceHaie(piece.essenceHaie || 'autre').espacement; return longueur > 0 ? Math.ceil(longueur / esp) : 1; }
      if (mode === 'forfait' || mode === 'unite') return 1;
    }

    if (ouvrageId === 'OUV_BASSIN_PREFAB' && tache.includes('TERRASSEMENT')) return surface * 0.6;
    if (ouvrageId === 'OUV_BASSIN_PREFAB' && (tache.includes('ETANCHEITE') || tache.includes('ÉTANCHÉITÉ'))) return Math.round(4 * Math.sqrt(surface || 0));
    if (ouvrageId === 'OUV_HAIE_PLANTATION' && tache.includes('PLANTATION')) return this._getQuantiteDevis('paysagisme', piece);
    if (unite === 'm²' || unite === 'm2') return surface;
    if (unite === 'm³' || unite === 'm3') return surface;
    if (unite === 'ml') {
      if (ouvrageUnite === 'ml' || ouvrageId.includes('CLOTURE') || ouvrageId.includes('BORDURE') || ouvrageId.includes('HAIE')) return longueur || perimetre;
      return perimetre || longueur;
    }
    if (unite === 'u' || unite === 'forfait') return 1;
    return surface || longueur || 1;
  },

  _buildPackagePaysagisme(piece, codeParam) {
    const code = this._getPaysagismePrimaryId(piece, codeParam);
    const ouvrageId = String(code || '').toUpperCase();
    const pkg = this._getPackagePaysagisme(piece, code);
    const opts = new Set(piece.optionsPaysagisme || []);
    const lines = [];
    const tacheLabel = this._getPaysagismeLabel(code);
    const add = (line, obligatoire) => {
      lines.push(this._linePackagePaysagisme(
        tacheLabel + ' — ' + line.tache,
        this._quantiteLignePackagePaysagisme(piece, ouvrageId, line, code),
        line.unite,
        line.prixUnit,
        obligatoire,
        null
      ));
    };

    if (!pkg) {
      const ouvrage = (typeof BddV2 !== 'undefined' && BddV2.getOuvrage) ? BddV2.getOuvrage(code) : null;
      return [this._linePackagePaysagisme(
        ouvrage ? ouvrage.designation : code,
        this._getQuantiteDevis('paysagisme', piece),
        this._getUniteOuvrage('paysagisme', piece),
        0,
        true,
        code
      )].filter(l => l.qte > 0);
    }

    (pkg.lignesAuto || []).forEach(line => add(line, true));
    this._getOptionsPackagePaysagisme(piece, code).forEach(opt => {
      if (opts.has(opt.id)) add(opt, false);
    });
    return lines.filter(l => l.qte > 0);
  },

  _prixUnitairePackagePaysagisme(line) {
    if (line.ouvrage && typeof BddV2 !== 'undefined' && BddV2.estChargee && BddV2.estChargee()) {
      const r = BddV2.calcPrixVente(line.ouvrage, line.qte);
      if (r && line.qte > 0 && r.prixVente > 0) return Math.round(r.prixVente / line.qte);
    }
    return line.prix || 0;
  },

  _ajouterPackagePaysagismeDevis(piece, corps) {
    const sectionKey = 'paysagisme';
    let sec = DevisMulti._state.sections.find(s => s.key === sectionKey);
    if (!sec) {
      sec = { key: sectionKey, icon: corps.icone || '🌿', titre: corps.label || 'Paysagisme', tva: 10, lignes: [], sid: DevisMulti._uid() };
      DevisMulti._state.sections.push(sec);
    }
    const prefix = piece.nom;
    this._getPaysagismeIds(piece).forEach(code => {
      this._buildPackagePaysagisme(piece, code).forEach(line => {
        sec.lignes.push({
          id: DevisMulti._uid(),
          ref: '',
          designation: prefix + ' — ' + line.designation,
          unite: line.unite,
          qte: line.qte,
          prix: this._prixUnitairePackagePaysagisme(line),
          obligatoire: line.obligatoire,
          option: !line.obligatoire,
        });
      });
    });
  },

  _getUniteOuvrage(corpsId, piece) {
    if (corpsId === 'electricite' || corpsId === 'plomberie') return 'u';
    if (corpsId === 'revetement') return (this._getOuvrageRevetement(piece) || {}).unite || 'm²';
    if (corpsId === 'paysagisme' && this._isOuvrageHaiePlantation(piece)) return 'u';
    if (corpsId === 'paysagisme' && piece && this._getPaysagismeIds(piece).length) {
      const code = this._getPaysagismePrimaryId(piece);
      if (code.startsWith('PAYS_') && typeof BddPaysagismeV2 !== 'undefined') {
        const prestation = BddPaysagismeV2.getPrestation(code);
        if (prestation && prestation.unite) return prestation.unite;
      }
      if (typeof BddV2 !== 'undefined') {
        const ouvrage = BddV2.getOuvrage(code);
        if (ouvrage && ouvrage.unite) return ouvrage.unite;
      }
    }
    return 'm²';
  },

  _getQuantiteDevis(corpsId, piece) {
    if (!piece) return 0;
    if (corpsId === 'electricite' || corpsId === 'plomberie') {
      return Object.values(piece.quantites || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    }
    const unite = this._getUniteOuvrage(corpsId, piece);
    if (corpsId === 'paysagisme' && this._isOuvrageHaiePlantation(piece)) {
      const longueur = parseFloat(piece.longueur) || 0;
      const essence = this._getEssenceHaie(piece.essenceHaie || 'autre');
      return longueur > 0 ? Math.ceil(longueur / essence.espacement) : 0;
    }
    if (corpsId === 'paysagisme' && unite === 'ml') {
      const longueur = parseFloat(piece.longueur) || 0;
      const largeur = parseFloat(piece.largeur) || 0;
      const perimetre = parseFloat(piece.perimetre) || 0;
      const hauteur = parseFloat(piece.hauteurPaysage) || 0;
      const base = perimetre || longueur || largeur || parseFloat(piece.surface) || 0;
      return base && hauteur ? Math.round(base * hauteur * 100) / 100 : base;
    }
    if (corpsId === 'paysagisme' && unite === 'u') {
      return parseFloat(piece.nbPoints) || parseFloat(piece.quantite) || 1;
    }
    if (corpsId === 'paysagisme' && (unite === 'm³' || unite === 'm3')) {
      return parseFloat(piece.surface) || 0;
    }
    return parseFloat(piece.surface) || 0;
  },

  // ── Étape 7 : Résumé final ────────────────────────────────
  _renderResume() {
    const fmt = v => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v);
    let gainTotal = 0, coutTotal = 0;

    const lignes = this._corpsActifs.map(corpsId => {
      const corps  = this.CORPS.find(c => c.id === corpsId);
      const pieces = this._filtrerPiecesPourCorps(corpsId, this._pieces.filter(p => p.corps === corpsId && p.surface));
      const config = this._corpsConfig[corpsId] || {};
      let coutCorps = 0, gainCorps = 0, detail = [];

      pieces.forEach(p => {
        const estElecPlomb = (corpsId === 'electricite' || corpsId === 'plomberie');

        // Pour élec/plomberie : utiliser quantites{} directement
        if (estElecPlomb) {
          const quantites = p.quantites || {};
          const nbPoints = Object.values(quantites).reduce((s,v) => s+(parseFloat(v)||0), 0);
          if (!nbPoints) {
            detail.push(p.nom + ' · ⚠️ aucun point saisi');
            return;
          }
          const r = this._calcCorps(corpsId, nbPoints, p);
          coutCorps += r.coutMat + r.coutMO;
          gainCorps += r.gain;
          const uniteAff = ' pts';
          detail.push(p.nom + ' · ' + nbPoints + uniteAff + ' → ' + fmt(r.prixVente));
          return;
        }

        // Autres corps : quantite selon l'unite de l'ouvrage
        const quantite = this._getQuantiteDevis(corpsId, p);
        if (!quantite) return;
        const r = this._calcCorps(corpsId, quantite, p);
        coutCorps += r.coutMat + r.coutMO;
        gainCorps += r.gain;
        const uniteAff = ' ' + this._getUniteOuvrage(corpsId, p);
        detail.push(p.nom + (p.prestation ? ' · ' + p.prestation : '') + ' · ' + quantite + uniteAff + ' → ' + fmt(r.prixVente));
      });

      if (config.type === 'neuf') {
        const PRIX = {cable_15:1.8,cable_25:2.4,gaine_irl:1.2,per_16:3.5,per_20:4.8,pvc_40:6.0,pvc_100:12.0};
        Object.entries(config).forEach(([k,v]) => {
          if (k==='type'||k==='lieuxKey'||!PRIX[k]) return;
          const c = v * PRIX[k], pv = c * 1.35;
          coutCorps += c; gainCorps += pv - c;
          detail.push(k.replace('_',' ') + ' · ' + v + ' ml → ' + fmt(pv));
        });
      }

      gainTotal += gainCorps; coutTotal += coutCorps;
      return { corps, gainCorps, coutCorps, detail };
    }).filter(l => l.gainCorps > 0);

    const pvTotal = coutTotal + gainTotal;
    this._lastResume = { corpsData: lignes, coutTotal, gainTotal, pvTotal };

    // Synthèse automatique pour analyse IA
    const lignesTexte = (lignes || []).map(l => {
      const corpsId = l.corps && l.corps.id ? l.corps.id : '';
      const corpsLabel = l.corps && l.corps.label ? l.corps.label : corpsId;
      return corpsLabel + ' — ' + l.detail.join(', ');
    });
    const profil = this._profil || 'particulier';
    const typeChantier = (this._corpsConfig || {});
    const synthese = [
      'Chiffrage ' + (profil === 'pro' ? 'professionnel' : 'particulier'),
      'Corps de métiers : ' + (this._corpsActifs || []).join(', '),
      ...lignesTexte,
      'Prix vente estimé HT : ' + pvTotal.toFixed(0) + ' €',
      'Gain estimé : ' + gainTotal.toFixed(0) + ' €',
    ].join('. ');
    this._lastResume.synthese = synthese;
    // Stocker pour que l'assistant IA puisse la lire
    try {
      sessionStorage.setItem('plaqpro_synthese_chiffrage', synthese);
    } catch(e) {}

    const lignesHTML = lignes.map(l => `
      <div style="padding:12px 0;border-bottom:1px solid var(--border,rgba(255,255,255,.08))">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-weight:600">${l.corps ? l.corps.icone + ' ' + l.corps.label : ''}</span>
          <span style="color:#16a34a;font-weight:700">+${fmt(l.gainCorps)}</span>
        </div>
        <div style="font-size:.78rem;color:var(--text-secondary,#666)">${l.detail.join(' · ')}</div>
        ${this._chiffrageEnModification && l.corps && l.corps.id ? `<button type="button" data-cex-action="modifier-corps" data-corps="${l.corps.id}" style="font-size:12px;padding:4px 10px;border-radius:6px;background:transparent;border:1px solid var(--border,rgba(255,255,255,.2));color:var(--text-muted,#888);cursor:pointer;margin-top:4px">✏️ Modifier ce corps</button>` : ''}
      </div>`).join('');

    this._html(`
      <div style="padding:4px 0 16px">
        <h1 style="margin:0 0 4px;font-size:1.2rem;font-weight:800">⚡ Résumé du chiffrage</h1>
        <p style="margin:0;font-size:.85rem;color:var(--text-secondary,#666)">Chantier : <strong>${this._esc(this._chantier.nom || '')}</strong></p>
      </div>
      <div style="background:linear-gradient(135deg,rgba(37,99,235,.12),rgba(22,163,74,.08));border:2px solid #16a34a;border-radius:14px;padding:24px;text-align:center;margin-bottom:20px">
        <div style="font-size:.85rem;color:var(--text-secondary,#666);margin-bottom:6px">Votre gain estimé</div>
        <div style="font-size:3rem;font-weight:900;color:#16a34a;line-height:1">${fmt(gainTotal)}</div>
        <div style="font-size:.8rem;color:var(--text-secondary,#666);margin-top:8px">Prix de vente : ${fmt(pvTotal)} HT · Coût direct : ${fmt(coutTotal)}</div>
      </div>
      ${this._card(`
        <h3 style="margin:0 0 12px;font-size:.9rem;font-weight:700">Détail par corps</h3>
        ${lignesHTML || '<p style="color:var(--text-secondary,#666);font-size:.85rem">Aucune surface saisie</p>'}
      `)}
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:space-between;margin-top:16px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${this._btn('← Modifier', 'resume-retour', 'secondary')}
          ${this._btn('← Modifier les corps de métier', 'modifier-corps-metiers', 'secondary')}
        </div>
        <div style="display:flex;gap:8px">
          ${this._btn('💾 Sauvegarder le chiffrage', 'resume-sauver')}
          ${this._btn('📄 Générer et enregistrer le devis', 'resume-devis')}
          ${this._btn("🛒 Liste d'achat", 'resume-achat')}
        </div>
      </div>
      <div id="cex-resume-container" style="margin-top:16px"></div>
    `);
    this._bind();
  },

  // ── Gestion événements ────────────────────────────────────
  _bind() {
    // Annuler le listener précédent s'il existe
    if (this._bindController) this._bindController.abort();
    this._bindController = new AbortController();
    const signal = this._bindController.signal;
    const fmt = v => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v || 0);

    const btnValiderMetrage = this._container.querySelector('#cex-metrage-valider');
    const pieceMetrage = this._pieceEnCours;
    if (btnValiderMetrage && pieceMetrage) {
      if (pieceMetrage.corps === 'paysagisme') {
        btnValiderMetrage.disabled = this._getPaysagismeIds(pieceMetrage).length === 0;
        const checks = this._container.querySelectorAll('[name="cex-pays-check"]');
        checks.forEach(cb => {
          cb.addEventListener('change', () => {
            pieceMetrage.tachesPaysagisme = Array.from(checks)
              .filter(c => c.checked)
              .map(c => c.value);
            pieceMetrage.tachePaysagisme = pieceMetrage.tachesPaysagisme[0] || '';
            btnValiderMetrage.disabled = pieceMetrage.tachesPaysagisme.length === 0;
            this._renderEtape('metrage');
          }, { signal });
        });
        const sel = this._container.querySelector('#cex-pays-tache');
        if (sel) {
          sel.value = this._getPaysagismePrimaryId(pieceMetrage);
          sel.addEventListener('change', () => {
            pieceMetrage.tachePaysagisme = sel.value;
            pieceMetrage.tachesPaysagisme = sel.value ? [sel.value] : [];
            btnValiderMetrage.disabled = !sel.value;
            this._renderEtape('metrage');
          }, { signal });
        }
      } else {
        btnValiderMetrage.disabled = false;
      }
    }

    this._container.querySelectorAll('[data-accord-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('[data-accord-wrap]');
        const body = wrap ? wrap.querySelector('[data-accord-body]') : null;
        const chevron = btn.querySelector('[data-chevron]');
        if (!body) return;
        const isClosed = body.style.display === 'none';
        body.style.display = isClosed ? 'block' : 'none';
        if (chevron) chevron.textContent = isClosed ? '▼' : '▶';
      }, { signal });
    });

    document.addEventListener('click', e => {
      if (!this._container || !this._container.contains(e.target)) return;

      // Actions boutons
      const btn = e.target.closest('[data-cex-action]');
      if (btn) {
        const action = btn.dataset.cexAction;
        if (action === 'chantier-suivant') {
          const chantierId = (this._container.querySelector('#cex-chantier-id') || {}).value;
          const nom     = ((this._container.querySelector('#cex-nom-chantier') || {}).value || '').trim();
          const client  = this._normalizeId((this._container.querySelector('#cex-client-select') || {}).value);
          const adresse = ((this._container.querySelector('#cex-adresse') || {}).value || '').trim();
          const codePostal = ((this._container.querySelector('#cex-code-postal') || {}).value || '').trim();
          const ville = ((this._container.querySelector('#cex-ville') || {}).value || '').trim();
          if (!client) { if (typeof App !== 'undefined' && App.toast) App.toast('Veuillez sélectionner un client avant de continuer', 'warning'); return; }
          if (!nom) { if (typeof App !== 'undefined' && App.toast) App.toast('Saisissez un nom de chantier', 'warning'); return; }
          const cliSelectionne = DB.getClient(client);
          this._profil = cliSelectionne && cliSelectionne.type
            ? (cliSelectionne.type === 'particulier' ? 'particulier' : 'pro')
            : null;
          if (chantierId) {
            this._chantier = { nom, clientId: client, chantierId: this._normalizeId(chantierId), adresse, codePostal, ville };
            if (!this._profil) {
              if (cliSelectionne && !cliSelectionne.type) {
                if (typeof App !== 'undefined' && App.toast) App.toast("⚠️ Ce client n'a pas de type renseigné — veuillez compléter sa fiche", 'warning');
                setTimeout(() => { if (typeof App !== 'undefined') App.navigate('clients'); }, 1800);
                return;
              }
            }
            this._renderEtape('profil');
            return;
          }
          const nouveau = DB.addChantier({ nom, clientId: client, adresse, codePostal, cp: codePostal, ville });
          this._chantier = { nom, clientId: client, chantierId: nouveau ? this._normalizeId(nouveau.id) : null, adresse, codePostal, ville };
          this._renderEtape('profil');
        }
        if (action === 'chantier-annuler') { if (typeof App !== 'undefined') App.navigate('dashboard'); return; }
        if (action === 'profil-retour')  this._renderEtape('chantier');
        if (action === 'profil-suivant') {
          if (!this._profil) { if (typeof App !== 'undefined' && App.toast) App.toast('Choisissez un type de chantier', 'warning'); return; }
          this._renderEtape('sousTraitants');
        }
        if (action === 'st-retour')  this._renderEtape('profil');
        if (action === 'st-suivant') {
          this._sousTraitants = [];
          this._container.querySelectorAll('[data-cex-st]:checked').forEach(cb => {
            this._sousTraitants.push(parseInt(cb.dataset.cexSt));
          });
          this._renderEtape('corps');
        }
        if (action === 'corps-retour')   this._renderEtape('sousTraitants');
        if (action === 'corps-terminer') { this._renderEtape('resume'); return; }
        if (action === 'corps-suivant') {
          if (!this._corpsActifs.length) { if (typeof App !== 'undefined' && App.toast) App.toast('Sélectionnez au moins un corps de métier', 'warning'); return; }
          this._corpsEnCours = 0;
          this._renderEtape('pieces');
        }
        if (action === 'creer-st')       { if (typeof App !== 'undefined') App.navigate('sousTraitants'); }
        if (action === 'nouveau-client')   { if (typeof App !== 'undefined') App.navigate('clients'); }
        if (action === 'nouveau-chantier') { if (typeof App !== 'undefined') App.navigate('chantiers'); }
        if (action === 'app-retour')  { this._renderEtape('pieces'); return; }
        if (action === 'app-valider') {
          const p = this._pieceEnCours;
          if (p) {
            const total = Object.values(p.quantites || {}).reduce((s,v) => s+v, 0);
            p.nbPoints = total;
            p.surface  = total;
            if (p.corps === 'paysagisme') {
              const fallbackPays = (document.getElementById('cex-pays-tache') || {}).value || 'OUV_GAZON_ROULEAU';
              p.tachesPaysagisme = this._getPaysagismeIds(p);
              if (!p.tachesPaysagisme.length) p.tachesPaysagisme = [fallbackPays];
              p.tachePaysagisme = p.tachesPaysagisme[0] || fallbackPays;
            }
          }
          this._renderEtape('pieces');
          return;
        }
        if (action === 'metrage-retour')  { this._renderEtape('pieces'); return; }
        if (action === 'metrage-valider') {
          const p    = this._pieceEnCours;
          const mode = p ? (p.mode || 'rectangle') : 'rectangle';
          let s = 0;
          if (p && p.corps === 'revetement') {
            s = parseFloat((this._container.querySelector('#cex-revetement-surface') || {}).value) || 0;
            p.ouvrageRevetement = (this._container.querySelector('#cex-revetement-ouvrage') || {}).value || 'OUV_STRATIFIE';
            p.plinthes = !!((this._container.querySelector('#cex-revetement-plinthes') || {}).checked);
          } else if (mode === 'rectangle') {
            const l   = parseFloat((this._container.querySelector('#cex-m-l') || {}).value) || 0;
            const w   = parseFloat((this._container.querySelector('#cex-m-w') || {}).value) || 0;
            const hp  = parseFloat((this._container.querySelector('#cex-pays-hauteur') || {}).value) || 0;
            const qte = parseFloat((this._container.querySelector('#cex-pays-quantite') || {}).value) || 0;
            const prof = parseFloat((this._container.querySelector('#cex-pays-profondeur') || {}).value) || 0;
            const hsp = parseFloat((this._container.querySelector('#cex-m-hsp') || {}).value) || 0;
            const epaisseurCloison = parseInt((this._container.querySelector('#cex-placo-epaisseur') || {}).value, 10) || 72;
            const isolant = (this._container.querySelector('#cex-placo-isolant') || {}).value || 'aucun';
            const codePays = (document.getElementById('cex-pays-tache') || {}).value || this._getPaysagismePrimaryId(p);
            const typePays = p && p.corps === 'paysagisme' ? this._getTypeMetragePaysagisme(p, codePays) : 'm2';
            if (p && p.corps === 'paysagisme' && typePays === 'haie') {
              const essenceId = (this._container.querySelector('#cex-pays-essence') || {}).value || 'autre';
              const essence = this._getEssenceHaie(essenceId);
              s = l > 0 ? Math.ceil(l / essence.espacement) : 0;
              p.essenceHaie = essence.id;
              p.nbPlants = s;
            } else if (p && p.corps === 'paysagisme' && typePays === 'ml') {
              s = Math.round(l * (hp || 1) * 100) / 100;
            } else if (p && p.corps === 'paysagisme' && typePays === 'u') {
              s = qte;
            } else if (p && p.corps === 'paysagisme' && typePays === 'm3') {
              s = Math.round(l * w * prof * 100) / 100;
            } else {
              s = Math.round(l * w * 100) / 100;
            }
            if (p) {
              p.longueur = l; p.largeur = w;
              p.hauteurPaysage = typePays === 'ml' ? (hp || null) : null;
              p.quantite = typePays === 'u' ? qte : null;
              p.profondeur = typePays === 'm3' ? prof : null;
              if (p.corps === 'plaquisterie' || p.corps === 'platrerie') {
                p.epaisseurCloison = epaisseurCloison;
                p.epaisseur = epaisseurCloison;
                p.isolant = epaisseurCloison >= 72 ? isolant : 'aucun';
              }
              if (hsp) {
                p.hsp          = hsp;
                p.surface_sol  = s;
                p.surface_murs = Math.round((2 * l + 2 * w) * hsp * 100) / 100;
              }
            }
          } else if (mode === 'forme-l') {
            const l1 = parseFloat((this._container.querySelector('#cex-m-l1') || {}).value) || 0;
            const w1 = parseFloat((this._container.querySelector('#cex-m-w1') || {}).value) || 0;
            const l2 = parseFloat((this._container.querySelector('#cex-m-l2') || {}).value) || 0;
            const w2 = parseFloat((this._container.querySelector('#cex-m-w2') || {}).value) || 0;
            s = Math.round((l1 * w1 + l2 * w2) * 100) / 100;
            if (p) { p.l1=l1; p.w1=w1; p.l2=l2; p.w2=w2; }
          } else if (mode === 'libre') {
            const inp = this._container.querySelector('#cex-surface-libre');
            s = inp && parseFloat(inp.value) > 0 ? parseFloat(inp.value) : 0;
            if (p && s > 0) {
              p.surface = s;
              p.mode = 'libre';
            }
          }
          if (!s) { if (typeof App !== 'undefined' && App.toast) App.toast('Saisissez les dimensions', 'warning'); return; }
          if (p) {
            p.surface = s;
            p.mode = mode;
            this._memoriserSurfacePiece(p);
            if (p.corps === 'paysagisme') {
              const fallbackPays = (document.getElementById('cex-pays-tache') || {}).value;
              p.tachesPaysagisme = this._getPaysagismeIds(p);
              if (!p.tachesPaysagisme.length && fallbackPays) p.tachesPaysagisme = [fallbackPays];
              p.tachePaysagisme = p.tachesPaysagisme[0] || fallbackPays || 'OUV_GAZON_ROULEAU';
              p.optionsPaysagisme = Array.from(this._container.querySelectorAll('[data-cex-pays-option]:checked')).map(cb => cb.dataset.cexPaysOption);
            }
          }
          this._renderEtape('pieces');
          return;
        }
        if (action === 'resume-retour') { this._renderEtape('corps'); return; }
        if (action === 'modifier-corps-metiers') { this._renderEtape('corps'); return; }
        if (action === 'modifier-corps') {
          const corpsId = btn.dataset.corps;
          const idx = this._corpsActifs.indexOf(corpsId);
          if (idx !== -1) {
            this._corpsEnCours = idx;
            this._renderEtape('pieces');
          }
          return;
        }
        if (action === 'resume-sauver') {
          const chiffrage = {
            id:          'chiffrage_' + Date.now(),
            date:        new Date().toISOString(),
            clientId:     this._getClientIdChantier(),
            chantier:    this._chantier    || {},
            corpsActifs: this._corpsActifs || [],
            corpsConfig: this._corpsConfig || {},
            surfacesMemorisees: this._surfacesMemorisees || {},
            profil:      this._profil      || 'particulier',
            pieces:      this._pieces      || [],
            resume:      this._lastResume  || {},
          };
          try {
            const liste = JSON.parse(localStorage.getItem('plaqpro_chiffrages') || '[]');
            liste.unshift(chiffrage);
            localStorage.setItem('plaqpro_chiffrages', JSON.stringify(liste));
            if (typeof App !== 'undefined' && App.toast) App.toast('💾 Chiffrage sauvegardé (pas le devis)', 'success');
          } catch(e) {
            if (typeof App !== 'undefined' && App.toast) App.toast('Erreur sauvegarde', 'error');
          }
          return;
        }
        if (action === 'resume-devis') {
          if (!this._corpsActifs || !this._corpsActifs.length) {
            if (typeof App !== 'undefined' && App.toast) App.toast('Aucun corps actif à devis', 'warning'); return;
          }
          const clientId = this._getClientIdChantier();
          if (!clientId) {
            if (typeof App !== 'undefined' && App.toast) App.toast('Veuillez sélectionner un client avant de continuer', 'warning');
            this._renderEtape('chantier');
            return;
          }
          DevisMulti._state = DevisMulti._newState();
          DevisMulti._state.clientId   = clientId;
          DevisMulti._state.chantierId = this._normalizeId(this._chantier && this._chantier.chantierId) || '';
          DevisMulti._state.objet      = 'Chiffrage ' + ((this._chantier && this._chantier.nom) || 'sans nom');
          this._ajouterForfaitPreparationDevis();
          this._corpsActifs.forEach(corpsId => {
            const corps = this.CORPS.find(c => c.id === corpsId);
            if (!corps) return;
            const pcs = this._filtrerPiecesPourCorps(corpsId, this._pieces || []).filter(p => {
              if (p.corps !== corpsId) return false;
              if (corpsId === 'electricite' || corpsId === 'plomberie') {
                return Object.values(p.quantites || {}).reduce((s,v) => s+(parseFloat(v)||0), 0) > 0;
              }
              if (corpsId === 'paysagisme') {
                return this._getPaysagismeIds(p).length > 0 && this._getQuantiteDevis(corpsId, p) > 0;
              }
              return parseFloat(p.surface) > 0;
            });
            pcs.forEach(p => {
              if (corpsId === 'paysagisme' && this._getPaysagismeIds(p).length) {
                this._ajouterPackagePaysagismeDevis(p, corps);
                return;
              }
              const quantiteDevis = this._getQuantiteDevis(corpsId, p);
              const r    = this._calcCorps(corpsId, quantiteDevis, p);
              const dims = [];
              if (p.longueur && p.largeur) dims.push(p.longueur + 'm × ' + p.largeur + 'm');
              if (p.hsp) dims.push('HSP ' + p.hsp + 'm');
              if (p.prestation) dims.push(p.prestation);
              const codePaysDevis = this._getPaysagismePrimaryId(p);
              if (codePaysDevis && typeof BddV2 !== 'undefined') {
                const ouv = BddV2.getOuvrage(codePaysDevis);
                if (ouv) dims.push(ouv.designation);
              }
              if (r.coutMat > 0 || r.coutMO > 0) {
                dims.push('(Mat+Mo)');
              }
              const estElecPlomb = (corpsId === 'electricite' || corpsId === 'plomberie');
              if (estElecPlomb && p.quantites) {
                const details = Object.entries(p.quantites)
                  .filter(([k,v]) => v > 0)
                  .map(([k,v]) => k.replace(/_/g,' ') + ' ×' + v)
                  .join(', ');
                if (details) dims.push(details);
              }
              const designation = this._buildDesignationDevis(corpsId, p, dims);
              const uniteDevis = this._getUniteOuvrage(corpsId, p);
              if (['plaquisterie','peinture','revetement'].includes(corpsId)) {
                const prixUnitaire = quantiteDevis > 0 ? Math.round(r.prixVente / quantiteDevis) : 0;
                this._ajouterLigneDevisDirecte(corpsId, corps, quantiteDevis, uniteDevis, designation, prixUnitaire);
                if (corpsId === 'revetement' && p.plinthes) {
                  this._ajouterPlinthesRevetementDevis(p, corps);
                }
                return;
              }
              const nbLignesAvant = (() => {
                const s = DevisMulti._state.sections.find(s => s.key === corpsId);
                return s ? s.lignes.length : 0;
              })();
              DevisMulti._ajouterSectionAvecSurface(
                corpsId, corps.icone || '🔧', corps.label,
                quantiteDevis, uniteDevis, designation
              );
              const sec = DevisMulti._state.sections.find(s => s.key === corpsId);
              if (sec && sec.lignes.length > nbLignesAvant) {
                sec.lignes[nbLignesAvant].prix = quantiteDevis > 0 ? Math.round(r.prixVente / quantiteDevis) : 0;
              }
            });
            // Linéaires neuf élec/plomberie
            if (corpsId === 'electricite' || corpsId === 'plomberie') {
              const configLin = this._corpsConfig[corpsId] || {};
              if (configLin.type === 'neuf') {
                const PRIX_ML = {cable_15:1.8,cable_25:2.4,gaine_irl:1.2,per_16:3.5,per_20:4.8,pvc_40:6.0,pvc_100:12.0};
                Object.entries(configLin).forEach(([k, v]) => {
                  if (k === 'type' || k === 'lieuxKey' || !PRIX_ML[k] || !v) return;
                  const qteML = parseFloat(v) || 0;
                  if (!qteML) return;
                  const prixU = Math.round(PRIX_ML[k] * 1.35);
                  const label = k.replace(/_/g, ' ');
                  const nbAvantLin = (() => {
                    const s = DevisMulti._state.sections.find(s => s.key === corpsId);
                    return s ? s.lignes.length : 0;
                  })();
                  DevisMulti._ajouterSectionAvecSurface(
                    corpsId, corps.icone || '🔧', corps.label,
                    qteML, 'ml', label
                  );
                  const sec3 = DevisMulti._state.sections.find(s => s.key === corpsId);
                  if (sec3 && sec3.lignes.length > nbAvantLin) {
                    sec3.lignes[nbAvantLin].prix = prixU;
                  }
                });
              }
            }
          });
          // Enregistrer silencieusement sans reset ni navigation
          const stateAvant = DevisMulti._state;
          if (!stateAvant.clientId) {
            // Tenter de récupérer clientId depuis this._chantier
            if (clientId) {
              DevisMulti._state.clientId   = clientId;
              DevisMulti._state.chantierId = this._normalizeId(this._chantier.id || this._chantier.chantierId) || '';
            }
          }
          const devisIdExistant = this._lastResume && this._lastResume.devisId;
          if (devisIdExistant) {
            if (!confirm('Êtes-vous sûr de remplacer l\'ancien devis ? Cette action est irréversible.')) {
              return;
            }
            // Supprimer l'ancien devis avant d'en créer un nouveau
            const liste = JSON.parse(localStorage.getItem(DB.KEYS.devis) || '[]')
              .filter(d => String(d.id) !== String(devisIdExistant));
            localStorage.setItem(DB.KEYS.devis, JSON.stringify(liste));
          }
          const idDevis = DevisMulti.enregistrerSilencieux();
          if (idDevis) {
            DevisMulti._state._devisId = idDevis;
            this._lastResume = this._lastResume || {};
            this._lastResume.devisId = idDevis;
            const chiffrageSource = {
              id:          'chiffrage_' + Date.now(),
              date:        new Date().toISOString(),
              devisId:     idDevis,
              clientId:     clientId,
              chantier:    this._chantier    || {},
              corpsActifs: this._corpsActifs || [],
              corpsConfig: this._corpsConfig || {},
              surfacesMemorisees: this._surfacesMemorisees || {},
              profil:      this._profil      || 'particulier',
              pieces:      this._pieces      || [],
              resume:      this._lastResume  || {},
            };
            try {
              const liste = JSON.parse(localStorage.getItem('plaqpro_chiffrages') || '[]');
              liste.unshift(chiffrageSource);
              localStorage.setItem('plaqpro_chiffrages', JSON.stringify(liste));
            } catch(e) {}
            if (typeof App !== 'undefined' && App.toast) App.toast('✅ Devis enregistré — visible dans Devis', 'success');
            const box = this._container.querySelector('#cex-resume-container');
            if (box) {
              box.innerHTML = `
                <div style="border:1px solid rgba(22,163,74,.45);background:rgba(22,163,74,.10);border-radius:12px;padding:16px;color:var(--text,#fff)">
                  <div style="font-weight:800;margin-bottom:10px">✅ Devis enregistré avec succès</div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <button type="button" data-cex-action="resume-voir-devis" style="padding:9px 14px;border-radius:8px;border:none;background:var(--accent,#2563eb);color:#fff;font-weight:700;cursor:pointer">Voir le devis</button>
                    <button type="button" data-cex-action="resume-nouveau" style="padding:9px 14px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:transparent;color:var(--text,#fff);font-weight:700;cursor:pointer">Nouveau chiffrage</button>
                  </div>
                </div>`;
            }
          } else {
            // Diagnostic précis
            const s = DevisMulti._state;
            const nbLignes = (s.sections||[]).reduce((t,sec)=>t+(sec.lignes||[]).length,0);
            const msg = !s.clientId ? 'Veuillez sélectionner un client avant de continuer'
                      : !nbLignes   ? '⚠️ Devis vide — aucune ligne'
                      : '⚠️ Erreur enregistrement devis';
            if (typeof App !== 'undefined' && App.toast) App.toast(msg, 'error');
            // Ne pas naviguer si échec
            return;
          }
          if (typeof AssistantIA !== 'undefined' && this._lastResume && this._lastResume.synthese) {
            const syntheseIA = this._lastResume.synthese;
            AssistantIA.setSynthese && AssistantIA.setSynthese(syntheseIA);
            setTimeout(() => {
              const champ = document.getElementById('dm-ia-descriptif') ||
                            document.getElementById('ia-input') ||
                            document.querySelector('[data-ia-description]');
              if (champ && !champ.value) champ.value = syntheseIA;
            }, 120);
          }
          return;
        }
        if (action === 'resume-voir-devis') {
          const id = this._lastResume && this._lastResume.devisId;
          if (id && typeof DocPrint !== 'undefined' && DocPrint.apercu) {
            DocPrint.apercu('devis', id);
          } else if (typeof App !== 'undefined' && App.navigate) {
            App.navigate('devis_complet');
          }
          return;
        }
        if (action === 'resume-nouveau') {
          this._chantier      = { nom: '', clientId: null, adresse: '', ville: '', codePostal: '' };
          this._profil        = null;
          this._sousTraitants = [];
          this._corpsActifs   = [];
          this._pieces        = [];
          this._resultats     = {};
          this._surfacesMemorisees = {};
          this._lastResume    = null;
          this._corpsEnCours  = 0;
          this._pieceEnCours  = null;
          this._corpsConfig   = {};
          this._chiffrageEnModification = false;
          this._modeModif = false;
          this._renderEtape('chantier');
          return;
        }
        if (action === 'resume-achat') {
          if (typeof ListeAchatV2 !== 'undefined') {
            ListeAchatV2.render('cex-resume-container', this._pieces, this._corpsActifs, this._corpsConfig);
          } else {
            if (typeof App !== 'undefined' && App.toast) App.toast('Module liste achat non disponible', 'warning');
          }
          return;
        }
        if (action === 'type-corps-retour') { this._renderEtape('corps'); return; }
        if (action === 'type-corps-suivant') {
          const corpsId = this._corpsActifs[this._corpsEnCours];
          if (!this._corpsConfig[corpsId]) this._corpsConfig[corpsId] = {};
          const lin = this.LINEAIRES[corpsId] || [];
          lin.forEach(l => {
            const val = parseFloat((this._container.querySelector('#cex-lin-' + l.id) || {}).value) || 0;
            if (val) this._corpsConfig[corpsId][l.id] = val;
          });
          if (corpsId === 'maconnerie') {
            const t = this._corpsConfig[corpsId].type;
            this._corpsConfig[corpsId].lieuxKey = t === 'int' ? 'maconnerie_int' : 'maconnerie_ext';
          }
          this._renderEtape('pieces');
          return;
        }
        if (action === 'import-placo') {
          const piecesPlaco = this._filtrerPiecesPourCorps('plaquisterie', this._pieces.filter(p => p.corps === 'plaquisterie' && (p.surface_sol || p.surface)));
          piecesPlaco.forEach(pp => {
            const exist = this._pieces.find(p => p.corps === 'peinture' && p.nom === pp.nom);
            if (!exist) {
              this._pieces.push({
                nom:          pp.nom,
                corps:        'peinture',
                surface:      pp.surface_sol || pp.surface || 0,
                surface_sol:  pp.surface_sol || pp.surface || 0,
                surface_murs: pp.surface_murs || 0,
                hsp:          pp.hsp || 2.50,
                longueur:     pp.longueur,
                largeur:      pp.largeur,
                mode:         'rectangle',
                depuis_placo: true,
              });
            }
          });
          if (typeof App !== 'undefined' && App.toast) App.toast('✅ ' + piecesPlaco.length + ' pièce(s) importée(s) depuis Plâtrerie', 'success');
          this._renderEtape('pieces');
          return;
        }
        if (action === 'revetement-pieces-valider') {
          const corpsId = this._corpsActifs[this._corpsEnCours];
          const checks = Array.from(this._container.querySelectorAll('[data-cex-revetement-check]'));
          checks.forEach(cb => {
            const nom = cb.dataset.cexRevetementCheck;
            const input = Array.from(this._container.querySelectorAll('[data-cex-revetement-surface]'))
              .find(el => el.dataset.cexRevetementSurface === nom);
            const surface = parseFloat((input || {}).value) || 0;
            const idx = this._pieces.findIndex(p => p.nom === nom && p.corps === corpsId);
            if (cb.checked && surface > 0) {
              if (idx >= 0) {
                this._pieces[idx].surface = surface;
                this._memoriserSurfacePiece(this._pieces[idx]);
              } else {
                const pieceRev = { nom, corps: corpsId, surface, mode: 'rectangle', ouvrageRevetement: 'OUV_STRATIFIE', quantites: {} };
                this._pieces.push(pieceRev);
                this._memoriserSurfacePiece(pieceRev);
              }
            } else if (!cb.checked && idx >= 0) {
              this._pieces.splice(idx, 1);
            }
          });
          if (typeof App !== 'undefined' && App.toast) App.toast('Pièces revêtement mises à jour', 'success');
          this._renderEtape('pieces');
          return;
        }
        if (action === 'pieces-retour')        { this._renderEtape('corps'); return; }
        if (action === 'pieces-vers-corps')    { this._renderEtape('corps'); return; }
        if (action === 'corps-precedent')      { this._corpsEnCours--; this._renderEtape('pieces'); }
        if (action === 'corps-suivant-pieces') { this._corpsEnCours++; this._renderEtape('pieces'); }
        if (action === 'pieces-terminer')      { this._renderEtape('resume'); return; }
        if (action === 'maconnerie-prestation-valider') {
          const select = this._container.querySelector('#cex-maconnerie-prestation');
          const prestation = (select ? select.value : '').trim();
          const nom = select ? select.dataset.cexPrestationPiece : '';
          const corpsId = this._corpsActifs[this._corpsEnCours];
          if (!prestation) { if (typeof App !== 'undefined' && App.toast) App.toast('Choisissez une prestation de maçonnerie', 'warning'); return; }
          let pieceMac = this._pieces.find(p => p.nom === nom && p.corps === corpsId);
          if (!pieceMac) {
            pieceMac = { nom, corps: corpsId, surface: null, mode: 'rectangle', quantites: {} };
            this._pieces.push(pieceMac);
          }
          pieceMac.prestation = prestation;
          this._pieceMaconnerieSelection = nom;
          this._pieceEnCours = pieceMac;
          this._renderEtape('metrage');
          return;
        }
        if (action === 'piece-libre-add') {
          const input = this._container.querySelector('#cex-piece-libre');
          const val   = (input ? input.value : '').trim();
          if (!val) return;
          const corpsId = this._corpsActifs[this._corpsEnCours];
          if (!this._pieces.find(p => p.nom === val && p.corps === corpsId)) {
            this._pieces.push({ nom: val, corps: corpsId, surface: null, quantites: {} });
          }
          if (input) input.value = '';
          this._renderEtape('pieces');
        }
        return;
      }

      // Zone peinture (hors bloc btn)
      const zoneBtn = e.target.closest('[data-cex-peinture-zone]');
      if (zoneBtn) {
        if (!this._corpsConfig['peinture']) this._corpsConfig['peinture'] = {};
        this._corpsConfig['peinture'].zone = zoneBtn.dataset.cexPeintureZone;
        this._renderEtape('pieces');
        return;
      }

      // Sélection profil
      const profil = e.target.closest('[data-cex-profil]');
      if (profil) {
        this._profil = profil.dataset.cexProfil;
        this._renderEtape('profil');
        return;
      }

      // Boutons +/- appareillage
      const btnPlus  = e.target.closest('[data-cex-app-plus]');
      const btnMoins = e.target.closest('[data-cex-app-moins]');
      if ((btnPlus || btnMoins) && this._pieceEnCours) {
        const id = btnPlus ? btnPlus.dataset.cexAppPlus : btnMoins.dataset.cexAppMoins;
        if (!this._pieceEnCours.quantites) this._pieceEnCours.quantites = {};
        const q = this._pieceEnCours.quantites[id] || 0;
        this._pieceEnCours.quantites[id] = btnPlus ? q + 1 : Math.max(0, q - 1);
        const el = this._container.querySelector('#cex-app-q-' + id);
        if (el) el.textContent = this._pieceEnCours.quantites[id];
        return;
      }

      // Sélection type corps (réno/neuf)
      const typeCorps = e.target.closest('[data-cex-type-corps]');
      if (typeCorps) {
        const corpsId = this._corpsActifs[this._corpsEnCours];
        if (!this._corpsConfig[corpsId]) this._corpsConfig[corpsId] = {};
        const choix = typeCorps.dataset.cexTypeCorps;
        this._corpsConfig[corpsId].type = choix;
        if (corpsId === 'maconnerie') {
          this._corpsConfig[corpsId].lieuxKey = choix === 'int' ? 'maconnerie_int' : 'maconnerie_ext';
        }
        this._renderEtape('pieces');
        return;
      }

      // Sélection mode métrage
      const modeBtn = e.target.closest('[data-cex-mode]');
      if (modeBtn && this._pieceEnCours) {
        this._pieceEnCours.mode = modeBtn.dataset.cexMode;
        this._renderEtape('metrage');
        return;
      }

      // Clic prestation maçonnerie → sélectionner + ouvrir métrage
      const prestationBtn = e.target.closest('[data-cex-prestation]');
      if (prestationBtn) {
        const nom = prestationBtn.dataset.cexPrestationPiece;
        const prestation = prestationBtn.dataset.cexPrestation;
        const corpsId = this._corpsActifs[this._corpsEnCours];
        let pieceMac = this._pieces.find(p => p.nom === nom && p.corps === corpsId);
        if (!pieceMac) {
          pieceMac = { nom, corps: corpsId, surface: null, mode: 'rectangle', quantites: {} };
          this._pieces.push(pieceMac);
        }
        pieceMac.prestation = prestation;
        this._pieceMaconnerieSelection = nom;
        this._pieceEnCours = pieceMac;
        this._renderEtape('metrage');
        return;
      }

      const revetementOpen = e.target.closest('[data-cex-revetement-open]');
      if (revetementOpen) {
        const nom = revetementOpen.dataset.cexRevetementOpen;
        const corpsId = this._corpsActifs[this._corpsEnCours];
        const input = Array.from(this._container.querySelectorAll('[data-cex-revetement-surface]'))
          .find(el => el.dataset.cexRevetementSurface === nom);
        const surface = parseFloat((input || {}).value) || 0;
        let pieceRev = this._pieces.find(p => p.nom === nom && p.corps === corpsId);
        if (!pieceRev) {
          pieceRev = { nom, corps: corpsId, surface, mode: 'rectangle', ouvrageRevetement: 'OUV_STRATIFIE', quantites: {} };
          this._pieces.push(pieceRev);
        } else if (surface > 0) {
          pieceRev.surface = surface;
        }
        this._pieceEnCours = pieceRev;
        this._renderEtape('metrage');
        return;
      }

      // Clic pièce → sélectionner + ouvrir métrage
      const piece = e.target.closest('[data-cex-piece]');
      if (piece) {
        const nom     = piece.dataset.cexPiece;
        const corpsId = this._corpsActifs[this._corpsEnCours];
        if (corpsId === 'maconnerie') {
          this._pieceMaconnerieSelection = nom;
          this._renderEtape('pieces');
          return;
        }
        const idx     = this._pieces.findIndex(p => p.nom === nom && p.corps === corpsId);
        if (idx >= 0) {
          this._pieceEnCours = this._pieces[idx];
        } else {
          const newPiece = { nom, corps: corpsId, surface: null, mode: 'rectangle', quantites: {} };
          this._pieces.push(newPiece);
          this._pieceEnCours = newPiece;
        }
        if (['electricite','plomberie'].includes(this._pieceEnCours.corps)) {
          this._renderEtape('appareillage');
        } else {
          this._renderEtape('metrage');
        }
        return;
      }

      // Clic corps → typeCorps si élec/plomberie, sinon pièces directement
      const corps = e.target.closest('[data-cex-corps]');
      if (corps) {
        const id = corps.dataset.cexCorps;
        if (!this._corpsActifs.includes(id)) this._corpsActifs.push(id);
        this._corpsEnCours = this._corpsActifs.indexOf(id);
        if (['electricite','plomberie','maconnerie'].includes(id)) {
          this._renderEtape('typeCorps');
        } else {
          this._renderEtape('pieces');
        }
        return;
      }
    }, { signal });
  },

};

window.CalcExpressV2 = CalcExpressV2;
