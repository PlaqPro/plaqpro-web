/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Projets Types
//  js/projets_types.js
// ============================================================

var ProjetsTypes = {

  // ── Données projets ───────────────────────────────────────
  PROJETS_DATA: [
    {
      id: 'sdb',
      icon: '🚿',
      titre: 'Salle de bain complète',
      description: 'Pose BA13H, étanchéité, carrelage, faïence, équipements sanitaires',
      dims: [
        { key: 'surface', label: 'Surface', unite: 'm²', defaut: 6, min: 2, max: 50 }
      ],
      couleur: '#4F8EF7',
      tags: ['Plâtrerie', 'Carrelage', 'Sanitaire'],
      lignes: function(d) {
        var s = d.surface || 6;
        var ht = s * 2.5;
        return [
          { ref:'BA13H',    designation:'Plaque BA13 Hydro',              unite:'u',   qte: Math.ceil(ht / 2.7 * 1.1), prix: DB.getPrixByRef('BA13H')    || 11.20 },
          { ref:'SPEC',     designation:'Membrane étanchéité sous-carrelage (SPEC)', unite:'m2',  qte: Math.ceil(s * 1.2),          prix: 8.50  },
          { ref:'CARRSOL',  designation:'Carrelage sol antidérapant R10',  unite:'m2',  qte: Math.ceil(s * 1.1),           prix: 22.00 },
          { ref:'FAIENCE',  designation:'Faïence murale 20×60 cm',         unite:'m2',  qte: Math.ceil(ht * 0.7),          prix: 18.00 },
          { ref:'RECV_8080',designation:'Receveur douche 80×80 extra-plat',unite:'u',   qte: 1,                            prix: DB.getPrixByRef('RECV_8080') || 145.00 },
          { ref:'MITIG_THE',designation:'Mitigeur thermostatique encastré', unite:'u',   qte: 1,                            prix: DB.getPrixByRef('MITIG_THE') || 185.00 },
          { ref:'MEUB_VAS80',designation:'Meuble vasque 80cm + lavabo',    unite:'u',   qte: 1,                            prix: DB.getPrixByRef('MEUB_VAS80') || 320.00 },
          { ref:'MIR_LED80',designation:'Miroir LED 80×60 anti-buée',      unite:'u',   qte: 1,                            prix: DB.getPrixByRef('MIR_LED80') || 195.00 },
          { ref:'SECH_SER', designation:'Sèche-serviette électrique',       unite:'u',   qte: 1,                            prix: DB.getPrixByRef('SECH_SER')  || 145.00 },
          { ref:'WC_SUS',   designation:'WC suspendu + bâti-support',       unite:'u',   qte: 1,                            prix: DB.getPrixByRef('WC_SUS')    || 280.00 },
          { ref:'VMC_SF',   designation:'VMC simple flux hygro type B',     unite:'u',   qte: 1,                            prix: DB.getPrixByRef('VMC_SF')    || 185.00 },
          { ref:'MO_PLAQ',  designation:"Main d'œuvre pose complète",       unite:'h',   qte: Math.round(s * 5),            prix: DB.getPrixByRef('MO_PLAQ')   || 38.00  },
        ];
      }
    },
    {
      id: 'bureau',
      icon: '🏢',
      titre: 'Bureau — Cloisons',
      description: 'Cloisons BA48, faux-plafond, dalles LED, câblage, sol LVT, peinture',
      dims: [
        { key: 'surface',   label: 'Surface',           unite: 'm²', defaut: 30, min: 10, max: 500 },
        { key: 'cloisons',  label: 'Longueur cloisons', unite: 'ml', defaut: 12, min: 4,  max: 200 }
      ],
      couleur: '#A78BFA',
      tags: ['Plâtrerie', 'Faux-plafond', 'Électricité'],
      lignes: function(d) {
        var s = d.surface || 30;
        var cl = d.cloisons || 12;
        var ht = cl * 2.6;
        return [
          { ref:'PARF48',   designation:'Rail R48',                         unite:'ml',  qte: Math.ceil(cl * 2),            prix: DB.getPrixByRef('PARF48')  || 1.65  },
          { ref:'PAMON48',  designation:'Montant M48',                      unite:'u',   qte: Math.ceil(cl / 0.6),          prix: DB.getPrixByRef('PAMON48') || 2.45  },
          { ref:'BA13S',    designation:'Plaque BA13 Standard (2 faces)',    unite:'u',   qte: Math.ceil(ht * 2 / 2.7 * 1.1),prix: DB.getPrixByRef('BA13S')   || 8.50  },
          { ref:'LV45',     designation:'Laine de verre 45mm en rouleaux',  unite:'m2',  qte: Math.ceil(ht * 0.9),          prix: 4.80 },
          { ref:'OSSOSS',   designation:'Ossature plafond F530',             unite:'ml',  qte: Math.ceil(s / 1.2),           prix: DB.getPrixByRef('OSSOSS')  || 3.80  },
          { ref:'BA13S',    designation:'Plaque BA13 plafond',               unite:'u',   qte: Math.ceil(s / 2.7 * 1.1),    prix: DB.getPrixByRef('BA13S')   || 8.50  },
          { ref:'DALLE_LED',designation:'Dalle LED 60×60 encastrée',         unite:'u',   qte: Math.ceil(s / 9),             prix: 45.00 },
          { ref:'CAB_15',   designation:'Câble H07V-U 1.5mm² éclairage',    unite:'ml',  qte: Math.ceil(s * 2),             prix: DB.getPrixByRef('CAB_15')  || 0.85  },
          { ref:'SOL_LVT',  designation:'Sol LVT 4mm clipsable',             unite:'m2',  qte: Math.ceil(s * 1.08),          prix: 18.00 },
          { ref:'PLINTHE',  designation:'Plinthe PVC assortie 2.4m',         unite:'ml',  qte: Math.ceil(Math.sqrt(s * 4)),  prix: 4.20  },
          { ref:'MO_PLAQ',  designation:"Main d'œuvre pose cloisons/plafond",unite:'h',   qte: Math.round(s * 2 + cl * 3),  prix: DB.getPrixByRef('MO_PLAQ')   || 38.00 },
        ];
      }
    },
    {
      id: 't3',
      icon: '🏠',
      titre: 'Appartement T3',
      description: 'Dépose, cloisons, plafonds, peinture, sol LVT, électricité forfait',
      dims: [
        { key: 'surface',   label: 'Surface totale',    unite: 'm²', defaut: 65, min: 30, max: 250 },
        { key: 'cloisons',  label: 'Longueur cloisons', unite: 'ml', defaut: 20, min: 8,  max: 100 }
      ],
      couleur: '#2DD4A0',
      tags: ['Plâtrerie', 'Peinture', 'Électricité'],
      lignes: function(d) {
        var s = d.surface || 65;
        var cl = d.cloisons || 20;
        var ht = cl * 2.5;
        return [
          { ref:'DEPOSE',   designation:'Dépose cloisons existantes',       unite:'m2',  qte: Math.ceil(ht * 0.5),          prix: 8.00  },
          { ref:'PARF70',   designation:'Rail R70',                         unite:'ml',  qte: Math.ceil(cl * 2),            prix: DB.getPrixByRef('PARF70')  || 2.10  },
          { ref:'PAMON70',  designation:'Montant M70',                      unite:'u',   qte: Math.ceil(cl / 0.6),          prix: DB.getPrixByRef('PAMON70') || 3.20  },
          { ref:'BA13S',    designation:'Plaque BA13 Standard',              unite:'u',   qte: Math.ceil(ht * 2 / 2.7 * 1.1),prix: DB.getPrixByRef('BA13S')   || 8.50  },
          { ref:'OSSOSS',   designation:'Ossature plafond + plaques',        unite:'ml',  qte: Math.ceil(s / 1.2),           prix: DB.getPrixByRef('OSSOSS')  || 3.80  },
          { ref:'BA13S',    designation:'Plaque BA13 plafond',               unite:'u',   qte: Math.ceil(s / 2.7 * 1.1),    prix: DB.getPrixByRef('BA13S')   || 8.50  },
          { ref:'PEINTURE', designation:'Peinture blanche acrylique 10L',    unite:'u',   qte: Math.ceil(s / 50),            prix: 28.00 },
          { ref:'SOL_LVT',  designation:'Sol LVT 4mm clipsable',             unite:'m2',  qte: Math.ceil(s * 1.08),          prix: 18.00 },
          { ref:'PLINTHE',  designation:'Plinthe PVC 2.4m',                  unite:'ml',  qte: Math.ceil(Math.sqrt(s * 4) * 1.5), prix: 4.20 },
          { ref:'FORFAIT_ELEC', designation:'Électricité mise en conformité forfait', unite:'fft', qte: 1,                  prix: Math.round(s * 35) },
          { ref:'MO_PLAQ',  designation:"Main d'œuvre pose complète",        unite:'h',   qte: Math.round(s * 3 + cl * 4),  prix: DB.getPrixByRef('MO_PLAQ') || 38.00 },
        ];
      }
    },
    {
      id: 'cuisine',
      icon: '🍳',
      titre: 'Cuisine',
      description: 'Carrelage sol, crédence, électricité circuits, plomberie évier, hotte, peinture',
      dims: [
        { key: 'surface', label: 'Surface', unite: 'm²', defaut: 12, min: 4, max: 60 }
      ],
      couleur: '#F7A64F',
      tags: ['Carrelage', 'Électricité', 'Plomberie'],
      lignes: function(d) {
        var s = d.surface || 12;
        return [
          { ref:'CARRSOL',  designation:'Carrelage sol cuisine R10',         unite:'m2',  qte: Math.ceil(s * 1.1),           prix: 22.00 },
          { ref:'CREDENCE', designation:'Carrelage crédence 10×30 cm',       unite:'m2',  qte: Math.ceil(s * 0.4),           prix: 28.00 },
          { ref:'JOINT_CR', designation:'Joint carrelage et fugue',           unite:'u',   qte: Math.ceil(s * 0.2),           prix: 6.50  },
          { ref:'DISJ20',   designation:'Disjoncteur 20A cuisine',            unite:'u',   qte: 3,                            prix: DB.getPrixByRef('DISJ20')  || 9.50  },
          { ref:'CAB_6',    designation:'Câble H07V-U 6mm² four/induction',  unite:'ml',  qte: Math.ceil(s * 1.5),           prix: DB.getPrixByRef('CAB_6')   || 2.50  },
          { ref:'PRISE2PT', designation:'Prise 2P+T 16A',                     unite:'u',   qte: 6,                            prix: DB.getPrixByRef('PRISE2PT') || 4.50 },
          { ref:'SIPHON',   designation:'Siphon évier + flexible alimentation',unite:'u',  qte: 1,                            prix: 18.00 },
          { ref:'MITIG_ECO',designation:'Mitigeur évier économiseur',          unite:'u',   qte: 1,                            prix: 65.00 },
          { ref:'PEINTURE', designation:'Peinture cuisine lessivable',         unite:'u',   qte: Math.ceil(s / 50 * 2),       prix: 32.00 },
          { ref:'MO_PLAQ',  designation:"Main d'œuvre pose",                  unite:'h',   qte: Math.round(s * 4),            prix: DB.getPrixByRef('MO_PLAQ') || 38.00 },
        ];
      }
    },
    {
      id: 'local_com',
      icon: '🏗',
      titre: 'Local commercial',
      description: 'Cloisons M70, faux-plafond, dalles LED, sol LVT pro, électricité, peinture',
      dims: [
        { key: 'surface',  label: 'Surface',           unite: 'm²', defaut: 80, min: 20, max: 1000 },
        { key: 'cloisons', label: 'Longueur cloisons', unite: 'ml', defaut: 25, min: 5,  max: 300  }
      ],
      couleur: '#F75B5B',
      tags: ['Plâtrerie', 'Faux-plafond', 'Électricité'],
      lignes: function(d) {
        var s = d.surface || 80;
        var cl = d.cloisons || 25;
        var ht = cl * 2.8;
        return [
          { ref:'PARF70',   designation:'Rail M70',                          unite:'ml',  qte: Math.ceil(cl * 2),            prix: DB.getPrixByRef('PARF70')  || 2.10  },
          { ref:'PAMON70',  designation:'Montant M70',                       unite:'u',   qte: Math.ceil(cl / 0.6),          prix: DB.getPrixByRef('PAMON70') || 3.20  },
          { ref:'BA13S',    designation:'Plaque BA13 Standard (2 faces)',     unite:'u',   qte: Math.ceil(ht * 2 / 2.7 * 1.1),prix: DB.getPrixByRef('BA13S')   || 8.50  },
          { ref:'BA13F',    designation:'Plaque BA13 Feu (couloir dégagement)',unite:'u',  qte: Math.ceil(ht * 0.3 / 2.7),   prix: DB.getPrixByRef('BA13F')   || 13.50 },
          { ref:'OSSOSS',   designation:'Ossature faux-plafond F530',         unite:'ml',  qte: Math.ceil(s / 1.2),           prix: DB.getPrixByRef('OSSOSS')  || 3.80  },
          { ref:'DALLE_LED',designation:'Dalle LED 60×60 encastrée',          unite:'u',   qte: Math.ceil(s / 9),             prix: 45.00 },
          { ref:'SOL_LVT',  designation:'Sol LVT pro 5mm commercial',         unite:'m2',  qte: Math.ceil(s * 1.08),          prix: 22.00 },
          { ref:'PEINTURE', designation:'Peinture professionnelle 10L',        unite:'u',   qte: Math.ceil(s / 35),            prix: 32.00 },
          { ref:'CAB_15',   designation:'Câble H07V-U 1.5mm² éclairage',     unite:'ml',  qte: Math.ceil(s * 2.5),           prix: DB.getPrixByRef('CAB_15')  || 0.85  },
          { ref:'MO_PLAQ',  designation:"Main d'œuvre pose complète",         unite:'h',   qte: Math.round(s * 2.5 + cl * 4), prix: DB.getPrixByRef('MO_PLAQ') || 38.00 },
        ];
      }
    },
    {
      id: 'cloison_vitree',
      icon: '🪟',
      titre: 'Cloison vitrée',
      description: 'Ossature alu, vitrage sécurité 10mm, store motorisé, câblage',
      dims: [
        { key: 'longueur', label: 'Longueur', unite: 'ml', defaut: 4,   min: 1,  max: 30 },
        { key: 'hauteur',  label: 'Hauteur',  unite: 'm',  defaut: 2.5, min: 1.5,max: 4  }
      ],
      couleur: '#60C8FF',
      tags: ['Cloison spéciale', 'Vitrage'],
      lignes: function(d) {
        var l = d.longueur || 4;
        var h = d.hauteur  || 2.5;
        var s = l * h;
        return [
          { ref:'OSS_ALU',  designation:'Ossature aluminium cloison vitrée', unite:'ml',  qte: Math.ceil(l * 2 + h * 2),    prix: DB.getPrixByRef('OSS_ALU')  || 45.00 },
          { ref:'VITR_10',  designation:'Vitrage feuilleté sécurité 10mm',   unite:'m2',  qte: Math.ceil(s * 1.05),          prix: DB.getPrixByRef('VITR_10')  || 85.00 },
          { ref:'STORE_EL', designation:'Store occultant motorisé intégré',   unite:'m2',  qte: Math.ceil(s),                 prix: DB.getPrixByRef('STORE_EL') || 120.00 },
          { ref:'MOTEUR_ST',designation:'Moteur store télécommandé 240V',     unite:'u',   qte: Math.ceil(l / 2),             prix: DB.getPrixByRef('MOTEUR_ST')|| 185.00 },
          { ref:'CAB_15',   designation:'Câble H07V-U 1.5mm² alimentation',  unite:'ml',  qte: Math.ceil(l * 3),             prix: DB.getPrixByRef('CAB_15')   || 0.85  },
          { ref:'JOINT_SIL',designation:'Joint silicone transparent vitré',   unite:'ml',  qte: Math.ceil(l * 4 + h * 4),    prix: DB.getPrixByRef('JOINT_SIL')|| 3.50  },
          { ref:'MO_PLAQ',  designation:"Main d'œuvre pose cloison vitrée",  unite:'h',   qte: Math.round(l * 4),            prix: DB.getPrixByRef('MO_PLAQ')  || 38.00 },
        ];
      }
    },
    {
      id: 'chambre',
      icon: '🛏',
      titre: 'Chambre',
      description: 'Doublage LV45, plafond, peinture, parquet flottant, plinthes',
      dims: [
        { key: 'surface', label: 'Surface', unite: 'm²', defaut: 14, min: 6, max: 100 }
      ],
      couleur: '#F7A64F',
      tags: ['Plâtrerie', 'Peinture', 'Sol'],
      lignes: function(d) {
        var s = d.surface || 14;
        var perim = Math.ceil(Math.sqrt(s) * 4);
        return [
          { ref:'BA13PHF', designation:'Doublage BA13 Phonique',              unite:'u',   qte: Math.ceil(perim * 2.5 / 2.7 * 1.1), prix: DB.getPrixByRef('BA13PHF') || 15.80 },
          { ref:'LAINEVERRE',designation:'Laine de verre 45mm doublage',     unite:'m2',  qte: Math.ceil(perim * 2.5 * 0.9),        prix: 4.80 },
          { ref:'OSSOSS',  designation:'Ossature plafond F530',               unite:'ml',  qte: Math.ceil(s / 1.2),                  prix: DB.getPrixByRef('OSSOSS')  || 3.80 },
          { ref:'BA13S',   designation:'Plaque BA13 plafond',                  unite:'u',   qte: Math.ceil(s / 2.7 * 1.1),           prix: DB.getPrixByRef('BA13S')   || 8.50 },
          { ref:'PEINTURE',designation:'Peinture acrylique blanche 10L',       unite:'u',   qte: Math.ceil(s / 35),                   prix: 28.00 },
          { ref:'PARQUET', designation:'Parquet flottant contrecollé 14mm',    unite:'m2',  qte: Math.ceil(s * 1.08),                 prix: 35.00 },
          { ref:'PLINTHE', designation:'Plinthe MDF 6cm',                       unite:'ml',  qte: Math.ceil(perim),                    prix: 5.50  },
          { ref:'MO_PLAQ', designation:"Main d'œuvre pose",                    unite:'h',   qte: Math.round(s * 2.5),                 prix: DB.getPrixByRef('MO_PLAQ') || 38.00 },
        ];
      }
    },
    {
      id: 'douche_ita',
      icon: '🏊',
      titre: 'Douche italienne',
      description: 'Receveur carrelable, étanchéité, carrelage R11, mitigeur, paroi verre, VMC',
      dims: [
        { key: 'surface', label: 'Surface douche', unite: 'm²', defaut: 1.6, min: 0.8, max: 6 }
      ],
      couleur: '#2DD4A0',
      tags: ['Sanitaire', 'Carrelage'],
      lignes: function(d) {
        var s = d.surface || 1.6;
        var perim = Math.ceil(Math.sqrt(s) * 4);
        return [
          { ref:'RECV_ITA',  designation:'Receveur douche italienne carrelable',unite:'u',  qte: 1,                             prix: DB.getPrixByRef('RECV_ITA')  || 89.00  },
          { ref:'SPEC',      designation:'Étanchéité SPEC sol+murs douche',     unite:'m2', qte: Math.ceil(s + perim * 0.5),    prix: 8.50   },
          { ref:'CARRR11',   designation:'Carrelage antidérapant R11',           unite:'m2', qte: Math.ceil(s * 1.1),            prix: 28.00  },
          { ref:'FAIENCE',   designation:'Faïence murale douche',                unite:'m2', qte: Math.ceil(perim * 2.2 * 0.8), prix: 18.00  },
          { ref:'MITIG_THE', designation:'Mitigeur thermostatique encastré',     unite:'u',  qte: 1,                             prix: DB.getPrixByRef('MITIG_THE') || 185.00 },
          { ref:'PAROI_VER', designation:'Paroi de douche verre pivotante 8mm',  unite:'u',  qte: 1,                             prix: DB.getPrixByRef('PAROI_VER') || 245.00 },
          { ref:'SPOT_LED',  designation:'Spot LED IP65 humide 10W',             unite:'u',  qte: 2,                             prix: DB.getPrixByRef('SPOT_LED')  || 12.00  },
          { ref:'VMC_SF',    designation:'VMC simple flux hygro type B',         unite:'u',  qte: 1,                             prix: DB.getPrixByRef('VMC_SF')    || 185.00 },
          { ref:'MO_PLAQ',   designation:"Main d'œuvre pose douche italienne",   unite:'h',  qte: Math.round(s * 12),            prix: DB.getPrixByRef('MO_PLAQ')   || 38.00  },
        ];
      }
    },
    {
      id: 't2',
      icon: '🏠',
      titre: 'Appartement T2',
      description: 'Cloisons, plafond, peinture, sol stratifié, électricité de base',
      dims: [
        { key: 'surface',  label: 'Surface totale',    unite: 'm²', defaut: 42, min: 20, max: 120 },
        { key: 'cloisons', label: 'Longueur cloisons', unite: 'ml', defaut: 12, min: 4,  max: 60  }
      ],
      couleur: '#60C8FF',
      tags: ['Plâtrerie', 'Peinture', 'Électricité'],
      lignes: function(d) {
        var s = d.surface || 42;
        var cl = d.cloisons || 12;
        var ht = cl * 2.5;
        return [
          { ref:'PARF48',  designation:'Rail R48',                          unite:'ml', qte: Math.ceil(cl*2),             prix: DB.getPrixByRef('PARF48')  ||1.65  },
          { ref:'PAMON48', designation:'Montant M48',                       unite:'u',  qte: Math.ceil(cl/0.6),           prix: DB.getPrixByRef('PAMON48') ||2.45  },
          { ref:'BA13S',   designation:'Plaque BA13 Standard cloisons',     unite:'u',  qte: Math.ceil(ht*2/2.7*1.1),    prix: DB.getPrixByRef('BA13S')   ||8.50  },
          { ref:'OSSOSS',  designation:'Ossature plafond F530',             unite:'ml', qte: Math.ceil(s/1.2),            prix: DB.getPrixByRef('OSSOSS')  ||3.80  },
          { ref:'BA13S',   designation:'Plaque BA13 plafond',               unite:'u',  qte: Math.ceil(s/2.7*1.1),       prix: DB.getPrixByRef('BA13S')   ||8.50  },
          { ref:'BANDE_PLA',designation:'Bande à plâtre jointage',          unite:'rl', qte: Math.ceil((ht*2+s)*1.1/50), prix: DB.getPrixByRef('BANDE_PLA')||4.20 },
          { ref:'ENDUIT_F',designation:'Enduit de finition 25kg',           unite:'sac',qte: Math.ceil((ht*2+s)*0.35/25),prix: DB.getPrixByRef('ENDUIT_F') ||18.50 },
          { ref:'PEINTURE',designation:'Peinture acrylique blanche 10L',    unite:'u',  qte: Math.ceil(s*0.6/35),        prix: 28.00 },
          { ref:'SOL_STR', designation:'Sol stratifié 8mm AC4',             unite:'m2', qte: Math.ceil(s*1.08),          prix: 14.00 },
          { ref:'PLINTHE', designation:'Plinthe MDF 6cm',                   unite:'ml', qte: Math.ceil(Math.sqrt(s*4)*1.5), prix: 5.50 },
          { ref:'PRISE2PT',designation:'Prise 2P+T 16A (lot)',               unite:'u',  qte: Math.ceil(s/8),             prix: DB.getPrixByRef('PRISE2PT')||4.50  },
          { ref:'CAB_15',  designation:'Câble H07V-U 1.5mm²',               unite:'ml', qte: Math.ceil(s*2),             prix: DB.getPrixByRef('CAB_15')  ||0.85  },
          { ref:'MO_PLAQ', designation:"Main d'œuvre pose complète",        unite:'h',  qte: Math.round(s*2.5+cl*3),    prix: DB.getPrixByRef('MO_PLAQ') ||38.00 },
        ];
      }
    },
    {
      id: 'maison',
      icon: '🏘',
      titre: 'Maison individuelle',
      description: 'Rénovation complète : cloisons, isolation, plafonds, peinture, sols, sanitaires, électricité',
      dims: [
        { key: 'surface',  label: 'Surface habitable', unite: 'm²', defaut: 110, min: 50, max: 400 },
        { key: 'cloisons', label: 'Longueur cloisons', unite: 'ml', defaut: 35,  min: 10, max: 150 },
        { key: 'nbSdb',    label: 'Nb salles de bain', unite: 'u',  defaut: 2,   min: 1,  max: 5   }
      ],
      couleur: '#F75B5B',
      tags: ['Plâtrerie', 'Isolation', 'Électricité', 'Plomberie'],
      lignes: function(d) {
        var s = d.surface || 110;
        var cl = d.cloisons || 35;
        var nb = d.nbSdb || 2;
        var ht = cl * 2.5;
        return [
          { ref:'PARF70',   designation:'Rail R70 cloisons',                unite:'ml', qte: Math.ceil(cl*2),            prix: DB.getPrixByRef('PARF70')  ||2.10  },
          { ref:'PAMON70',  designation:'Montant M70',                      unite:'u',  qte: Math.ceil(cl/0.6),          prix: DB.getPrixByRef('PAMON70') ||3.20  },
          { ref:'BA13S',    designation:'Plaque BA13 Standard cloisons',    unite:'u',  qte: Math.ceil(ht*2/2.7*1.1),   prix: DB.getPrixByRef('BA13S')   ||8.50  },
          { ref:'BA13H',    designation:'Plaque BA13 Hydro (SDB)',          unite:'u',  qte: Math.ceil(nb*12),           prix: DB.getPrixByRef('BA13H')   ||11.20 },
          { ref:'LV45',     designation:'Laine de verre isolation 45mm',    unite:'m2', qte: Math.ceil(s*0.4),           prix: 4.80  },
          { ref:'OSSOSS',   designation:'Ossature plafond F530',            unite:'ml', qte: Math.ceil(s/1.2),           prix: DB.getPrixByRef('OSSOSS')  ||3.80  },
          { ref:'BA13S',    designation:'Plaque BA13 plafond',              unite:'u',  qte: Math.ceil(s/2.7*1.1),      prix: DB.getPrixByRef('BA13S')   ||8.50  },
          { ref:'PEINTURE', designation:'Peinture acrylique 10L',           unite:'u',  qte: Math.ceil(s*0.7/35),       prix: 28.00 },
          { ref:'SOL_LVT',  designation:'Sol LVT 4mm clipsable',            unite:'m2', qte: Math.ceil(s*0.7*1.08),     prix: 18.00 },
          { ref:'CARRSOL',  designation:'Carrelage sol SDB/cuisine',        unite:'m2', qte: Math.ceil(nb*8+12),        prix: 22.00 },
          { ref:'FAIENCE',  designation:'Faïence murale SDB',               unite:'m2', qte: Math.ceil(nb*15),          prix: 18.00 },
          { ref:'DISJ20',   designation:'Disjoncteur 20A',                  unite:'u',  qte: Math.ceil(s/20),           prix: DB.getPrixByRef('DISJ20')  ||9.50  },
          { ref:'PRISE2PT', designation:'Prise 2P+T 16A',                   unite:'u',  qte: Math.ceil(s/6),            prix: DB.getPrixByRef('PRISE2PT')||4.50  },
          { ref:'CAB_15',   designation:'Câble H07V-U 1.5mm²',              unite:'ml', qte: Math.ceil(s*3),            prix: DB.getPrixByRef('CAB_15')  ||0.85  },
          { ref:'WC_SUS',   designation:'WC suspendu + bâti-support',       unite:'u',  qte: nb,                        prix: DB.getPrixByRef('WC_SUS')  ||280.00},
          { ref:'MITIG_THE',designation:'Mitigeur thermostatique SDB',      unite:'u',  qte: nb,                        prix: DB.getPrixByRef('MITIG_THE')||185.00},
          { ref:'MO_PLAQ',  designation:"Main d'œuvre pose complète",       unite:'h',  qte: Math.round(s*4+cl*5),     prix: DB.getPrixByRef('MO_PLAQ') ||38.00 },
        ];
      }
    },
    {
      id: 'renov_piece',
      icon: '🔧',
      titre: 'Rénovation 1 pièce',
      description: 'Rénovation légère : doublage, plafond, peinture, sol, électricité de base',
      dims: [
        { key: 'surface', label: 'Surface', unite: 'm²', defaut: 16, min: 6, max: 80 }
      ],
      couleur: '#A78BFA',
      tags: ['Plâtrerie', 'Peinture', 'Sol'],
      lignes: function(d) {
        var s = d.surface || 16;
        var perim = Math.ceil(Math.sqrt(s)*4);
        return [
          { ref:'BA13S',   designation:'Plaque BA13 doublage murs',         unite:'u',  qte: Math.ceil(perim*2.5/2.7*1.1), prix: DB.getPrixByRef('BA13S')   ||8.50  },
          { ref:'LV45',    designation:'Laine de verre 45mm doublage',      unite:'m2', qte: Math.ceil(perim*2.5*0.9),     prix: 4.80  },
          { ref:'OSSOSS',  designation:'Ossature plafond F530',             unite:'ml', qte: Math.ceil(s/1.2),             prix: DB.getPrixByRef('OSSOSS')  ||3.80  },
          { ref:'BA13S',   designation:'Plaque BA13 plafond',               unite:'u',  qte: Math.ceil(s/2.7*1.1),        prix: DB.getPrixByRef('BA13S')   ||8.50  },
          { ref:'BANDE_PLA',designation:'Bande à plâtre',                   unite:'rl', qte: Math.ceil((perim*2.5+s)*1.1/50), prix: DB.getPrixByRef('BANDE_PLA')||4.20 },
          { ref:'ENDUIT_F',designation:'Enduit finition 25kg',              unite:'sac',qte: Math.ceil((perim*2.5+s)*0.35/25), prix: DB.getPrixByRef('ENDUIT_F')||18.50 },
          { ref:'PEINTURE',designation:'Peinture acrylique blanche 10L',    unite:'u',  qte: Math.ceil((perim*2.5+s)/35), prix: 28.00 },
          { ref:'SOL_STR', designation:'Sol stratifié 8mm AC4',             unite:'m2', qte: Math.ceil(s*1.08),           prix: 14.00 },
          { ref:'PLINTHE', designation:'Plinthe MDF 6cm',                   unite:'ml', qte: Math.ceil(perim),            prix: 5.50  },
          { ref:'PRISE2PT',designation:'Prise 2P+T 16A',                    unite:'u',  qte: Math.ceil(s/10),             prix: DB.getPrixByRef('PRISE2PT')||4.50  },
          { ref:'MO_PLAQ', designation:"Main d'œuvre pose",                 unite:'h',  qte: Math.round(s*2),             prix: DB.getPrixByRef('MO_PLAQ') ||38.00 },
        ];
      }
    },
    {
      id: 'local_med',
      icon: '🏥',
      titre: 'Local médical / ERP',
      description: 'Cloisons phoniques BA13PHF, faux-plafond acoustique, sol vinyle, électricité norme ERP',
      dims: [
        { key: 'surface',  label: 'Surface',           unite: 'm²', defaut: 60, min: 20, max: 500 },
        { key: 'cloisons', label: 'Longueur cloisons', unite: 'ml', defaut: 20, min: 5,  max: 150 }
      ],
      couleur: '#2DD4A0',
      tags: ['Plâtrerie', 'Acoustique', 'Électricité'],
      lignes: function(d) {
        var s = d.surface || 60;
        var cl = d.cloisons || 20;
        var ht = cl * 2.8;
        return [
          { ref:'PARF70',   designation:'Rail R70',                          unite:'ml', qte: Math.ceil(cl*2),            prix: DB.getPrixByRef('PARF70')  ||2.10  },
          { ref:'PAMON70',  designation:'Montant M70',                       unite:'u',  qte: Math.ceil(cl/0.6),          prix: DB.getPrixByRef('PAMON70') ||3.20  },
          { ref:'BA13PHF',  designation:'Plaque BA13 Phonique HD',           unite:'u',  qte: Math.ceil(ht*2/2.7*1.1),   prix: DB.getPrixByRef('BA13PHF') ||15.80 },
          { ref:'LR80',     designation:'Laine de roche 80mm phonique',      unite:'m2', qte: Math.ceil(ht*0.9),          prix: DB.getPrixByRef('LR80')    ||8.90  },
          { ref:'OSSOSS',   designation:'Ossature plafond acoustique',       unite:'ml', qte: Math.ceil(s/1.2),           prix: DB.getPrixByRef('OSSOSS')  ||3.80  },
          { ref:'BA13S',    designation:'Plaque BA13 plafond',               unite:'u',  qte: Math.ceil(s/2.7*1.1),      prix: DB.getPrixByRef('BA13S')   ||8.50  },
          { ref:'SOL_LVT',  designation:'Sol vinyle ESD médical 2mm',        unite:'m2', qte: Math.ceil(s*1.08),          prix: 28.00 },
          { ref:'PRISE2PT', designation:'Prise 2P+T 16A norme ERP',         unite:'u',  qte: Math.ceil(s/8),             prix: DB.getPrixByRef('PRISE2PT')||4.50  },
          { ref:'DISJ20',   designation:'Disjoncteur 20A tableau ERP',       unite:'u',  qte: Math.ceil(s/15),            prix: DB.getPrixByRef('DISJ20')  ||9.50  },
          { ref:'CAB_15',   designation:'Câble H07V-U 1.5mm² éclairage',    unite:'ml', qte: Math.ceil(s*2.5),           prix: DB.getPrixByRef('CAB_15')  ||0.85  },
          { ref:'BA13F',    designation:'Plaque BA13 Feu dégagements',       unite:'u',  qte: Math.ceil(ht*0.3/2.7),     prix: DB.getPrixByRef('BA13F')   ||13.50 },
          { ref:'MO_PLAQ',  designation:"Main d'œuvre pose complète",        unite:'h',  qte: Math.round(s*3+cl*4),      prix: DB.getPrixByRef('MO_PLAQ') ||38.00 },
        ];
      }
    },
    {
      id: 'garage',
      icon: '🚗',
      titre: 'Garage aménagé',
      description: 'Isolation périphérique, doublage BA13, plafond, électricité atelier, sol béton ciré',
      dims: [
        { key: 'surface', label: 'Surface', unite: 'm²', defaut: 25, min: 10, max: 100 }
      ],
      couleur: '#F7A64F',
      tags: ['Isolation', 'Plâtrerie', 'Électricité'],
      lignes: function(d) {
        var s = d.surface || 25;
        var perim = Math.ceil(Math.sqrt(s)*4);
        return [
          { ref:'PIR40',   designation:'Panneau isolant PIR 40mm',          unite:'m2', qte: Math.ceil(perim*2.5),       prix: DB.getPrixByRef('PIR40')   ||12.40 },
          { ref:'PARF48',  designation:'Rail R48 ossature doublage',        unite:'ml', qte: Math.ceil(perim*2),         prix: DB.getPrixByRef('PARF48')  ||1.65  },
          { ref:'PAMON48', designation:'Montant M48',                       unite:'u',  qte: Math.ceil(perim/0.6),       prix: DB.getPrixByRef('PAMON48') ||2.45  },
          { ref:'BA13S',   designation:'Plaque BA13 Standard doublage',     unite:'u',  qte: Math.ceil(perim*2.5/2.7*1.1), prix: DB.getPrixByRef('BA13S') ||8.50  },
          { ref:'OSSOSS',  designation:'Ossature plafond F530',             unite:'ml', qte: Math.ceil(s/1.2),           prix: DB.getPrixByRef('OSSOSS')  ||3.80  },
          { ref:'BA13S',   designation:'Plaque BA13 plafond',               unite:'u',  qte: Math.ceil(s/2.7*1.1),      prix: DB.getPrixByRef('BA13S')   ||8.50  },
          { ref:'DISJ20',  designation:'Disjoncteur 20A atelier',           unite:'u',  qte: 2,                          prix: DB.getPrixByRef('DISJ20')  ||9.50  },
          { ref:'PRISE2PT',designation:'Prise 2P+T 16A (lot)',               unite:'u',  qte: Math.ceil(s/5),             prix: DB.getPrixByRef('PRISE2PT')||4.50  },
          { ref:'CAB_15',  designation:'Câble H07V-U 1.5mm²',               unite:'ml', qte: Math.ceil(s*2),             prix: DB.getPrixByRef('CAB_15')  ||0.85  },
          { ref:'PEINTURE',designation:'Peinture sol béton époxy 5L',        unite:'u',  qte: Math.ceil(s/25),            prix: 45.00 },
          { ref:'MO_PLAQ', designation:"Main d'œuvre pose",                  unite:'h',  qte: Math.round(s*3),            prix: DB.getPrixByRef('MO_PLAQ') ||38.00 },
        ];
      }
    },
  ],

  // ── Lignes en cours d'édition par projet ─────────────────
  _lignes: {},
  _lignesLibres: {},

  // ── Entrée principale ─────────────────────────────────────
  render: function() {
    var wrap = document.createElement('div');
    wrap.className = 'pt-wrap';
    ProjetsTypes._injectStyles();

    // Stats
    var stats = ProjetsTypes._buildStats();

    // Grille de cartes
    var grid = '<div class="pt-grid">';
    ProjetsTypes.PROJETS_DATA.forEach(function(p) {
      grid += ProjetsTypes._cardHTML(p);
    });
    grid += '</div>';

    wrap.innerHTML = '<div class="pt-hero">'
      + '<div class="pt-hero-inner">'
      + '<div class="pt-hero-badge">📦 Bibliothèque</div>'
      + '<h1 class="pt-hero-title">Projets Types</h1>'
      + '<p class="pt-hero-sub">Configurez un projet standard, ajustez les quantités et créez votre devis en 2 minutes.</p>'
      + '</div>'
      + '</div>'
      + '<div class="pt-content">'
      + stats
      + grid
      + '</div>';

    return wrap;
  },

  // ── Stats ─────────────────────────────────────────────────
  _buildStats: function() {
    var devis = DB.getAll('devis') || [];
    var now = new Date();
    var devisModeles = devis.filter(function(dv) {
      if (!dv.notes || dv.notes.indexOf('Projets types') === -1) return false;
      var d = new Date(dv.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    var nb = ProjetsTypes.PROJETS_DATA.length;
    var nbDevis = devisModeles.length;
    var tps = nbDevis * 30;
    return '<div class="stats-grid" style="margin-bottom:20px">'
      + '<div class="stat-card"><div class="stat-value">' + nb + '</div><div class="stat-label">Projets types disponibles</div></div>'
      + '<div class="stat-card"><div class="stat-value">' + nbDevis + '</div><div class="stat-label">Devis depuis modèles ce mois</div></div>'
      + '<div class="stat-card"><div class="stat-value">' + tps + ' min</div><div class="stat-label">Temps économisé estimé</div></div>'
      + '</div>';
  },

  // ── Card HTML ─────────────────────────────────────────────
  _cardHTML: function(p) {
    var tags = p.tags.map(function(t) {
      return '<span class="pt-tag">' + t + '</span>';
    }).join('');
    return '<div class="pt-card" onclick="ProjetsTypes.openConfig(\'' + p.id + '\')"'
      + ' style="--pt-color:' + p.couleur + '">'
      + '<div class="pt-card-icon">' + p.icon + '</div>'
      + '<div class="pt-card-body">'
      + '<div class="pt-card-titre">' + p.titre + '</div>'
      + '<div class="pt-card-desc">' + p.description + '</div>'
      + '<div class="pt-card-tags">' + tags + '</div>'
      + '</div>'
      + '<div class="pt-card-arrow">→</div>'
      + '</div>';
  },

  // ── Ouvrir le configurateur ───────────────────────────────
  openConfig: function(id) {
    var p = ProjetsTypes.PROJETS_DATA.find(function(x) { return x.id === id; });
    if (!p) return;

    var dimsHTML = p.dims.map(function(d) {
      return '<div class="pt-dim-row">'
        + '<label class="pt-dim-label">' + d.label + '</label>'
        + '<div class="calc-input-wrap" style="max-width:160px">'
        + '<input type="number" id="pt-dim-' + d.key + '" value="' + d.defaut + '" min="' + d.min + '" max="' + d.max + '" step="0.1"'
        + ' onchange="ProjetsTypes.recalc(\'' + id + '\')" oninput="ProjetsTypes.recalc(\'' + id + '\')">'
        + '<span class="calc-unit">' + d.unite + '</span>'
        + '</div>'
        + '</div>';
    }).join('');

    var body = '<div class="pt-config">'
      + '<div class="pt-config-dims">' + dimsHTML + '</div>'
      + '<div id="pt-table-wrap"></div>'
      + '<div class="pt-article-libre-wrap">'
      + '<div class="pt-section-title">Article libre</div>'
      + '<div id="pt-articles-libres"></div>'
      + '<button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="ProjetsTypes.addArticleLibre(\'' + id + '\')">'
      + '+ Ajouter un article</button>'
      + '</div>'
      + '<div id="pt-totaux" class="pt-totaux"></div>'
      + '</div>';

    var footer = '<button class="btn btn-primary" onclick="ProjetsTypes.modalDevis(\'' + id + '\')">'
      + '📄 Créer ce devis</button>';

    var bodyNode = document.createElement('div');
    bodyNode.innerHTML = body;
    App.openModal(p.icon + ' ' + p.titre, bodyNode, footer);

    setTimeout(function() {
      ProjetsTypes.recalc(id);
    }, 50);
  },

  // ── Recalcul ──────────────────────────────────────────────
  recalc: function(id) {
    var p = ProjetsTypes.PROJETS_DATA.find(function(x) { return x.id === id; });
    if (!p) return;

    var dims = {};
    p.dims.forEach(function(d) {
      var el = document.getElementById('pt-dim-' + d.key);
      dims[d.key] = el ? parseFloat(el.value) || d.defaut : d.defaut;
    });

    var lignes = p.lignes(dims);
    // Dédupliquer par ref+designation (même ref peut apparaître 2 fois)
    var seen = {};
    lignes = lignes.filter(function(l) {
      var k = l.ref + '|' + l.designation;
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    });
    ProjetsTypes._lignes[id] = lignes;

    ProjetsTypes._renderTable(id);
  },

  // ── Rendu tableau ─────────────────────────────────────────
  _renderTable: function(id) {
    var wrap = document.getElementById('pt-table-wrap');
    if (!wrap) return;
    var lignes = ProjetsTypes._lignes[id] || [];

    var rows = lignes.map(function(l, i) {
      return '<tr>'
        + '<td><input class="pt-cell-input" value="' + esc(l.ref || '') + '" onchange="ProjetsTypes._updateLigne(\'' + id + '\',' + i + ',\'ref\',this.value)"></td>'
        + '<td><input class="pt-cell-input pt-cell-wide" value="' + esc(l.designation || '') + '" onchange="ProjetsTypes._updateLigne(\'' + id + '\',' + i + ',\'designation\',this.value)"></td>'
        + '<td><input class="pt-cell-input pt-cell-sm" value="' + esc(l.unite || '') + '" onchange="ProjetsTypes._updateLigne(\'' + id + '\',' + i + ',\'unite\',this.value)"></td>'
        + '<td><input class="pt-cell-input pt-cell-sm" type="number" value="' + l.qte + '" onchange="ProjetsTypes._updateLigne(\'' + id + '\',' + i + ',\'qte\',parseFloat(this.value)||0)"></td>'
        + '<td><input class="pt-cell-input pt-cell-sm" type="number" step="0.01" value="' + l.prix.toFixed(2) + '" onchange="ProjetsTypes._updateLigne(\'' + id + '\',' + i + ',\'prix\',parseFloat(this.value)||0)"></td>'
        + '<td class="pt-cell-total">' + ((l.qte * l.prix) || 0).toFixed(2) + ' €</td>'
        + '<td><button class="pt-del-btn" onclick="ProjetsTypes._delLigne(\'' + id + '\',' + i + ')">✕</button></td>'
        + '</tr>';
    }).join('');

    wrap.innerHTML = '<table class="pt-table">'
      + '<thead><tr><th>Réf.</th><th>Désignation</th><th>Unité</th><th>Qté</th><th>Prix HT</th><th>Total HT</th><th></th></tr></thead>'
      + '<tbody>' + rows + '</tbody>'
      + '</table>';

    ProjetsTypes._updateTotaux(id);
  },

  // ── Mise à jour d'une ligne ───────────────────────────────
  _updateLigne: function(id, i, key, val) {
    if (!ProjetsTypes._lignes[id] || !ProjetsTypes._lignes[id][i]) return;
    ProjetsTypes._lignes[id][i][key] = val;
    ProjetsTypes._updateTotaux(id);
    // Rafraîchir juste le total de la ligne
    var rows = document.querySelectorAll('.pt-table tbody tr');
    if (rows[i]) {
      var l = ProjetsTypes._lignes[id][i];
      var tot = rows[i].querySelector('.pt-cell-total');
      if (tot) tot.textContent = ((l.qte * l.prix) || 0).toFixed(2) + ' €';
    }
  },

  // ── Supprimer une ligne ───────────────────────────────────
  _delLigne: function(id, i) {
    if (!ProjetsTypes._lignes[id]) return;
    ProjetsTypes._lignes[id].splice(i, 1);
    ProjetsTypes._renderTable(id);
  },

  // ── Articles libres ───────────────────────────────────────
  addArticleLibre: function(id) {
    if (!ProjetsTypes._lignesLibres[id]) ProjetsTypes._lignesLibres[id] = [];
    var idx = ProjetsTypes._lignesLibres[id].length;
    ProjetsTypes._lignesLibres[id].push({ ref:'', designation:'', unite:'u', qte:1, prix:0 });
    ProjetsTypes._renderArticlesLibres(id);
  },

  _renderArticlesLibres: function(id) {
    var wrap = document.getElementById('pt-articles-libres');
    if (!wrap) return;
    var items = ProjetsTypes._lignesLibres[id] || [];
    if (!items.length) { wrap.innerHTML = ''; return; }

    wrap.innerHTML = items.map(function(a, i) {
      return '<div class="pt-libre-row">'
        + '<input class="pt-cell-input" placeholder="Réf." value="' + esc(a.ref||'') + '" onchange="ProjetsTypes._updateLibre(\'' + id + '\',' + i + ',\'ref\',this.value)">'
        + '<input class="pt-cell-input pt-cell-wide" placeholder="Désignation" value="' + esc(a.designation||'') + '" onchange="ProjetsTypes._updateLibre(\'' + id + '\',' + i + ',\'designation\',this.value)">'
        + '<input class="pt-cell-input pt-cell-sm" placeholder="Unité" value="' + esc(a.unite||'u') + '" onchange="ProjetsTypes._updateLibre(\'' + id + '\',' + i + ',\'unite\',this.value)">'
        + '<input class="pt-cell-input pt-cell-sm" type="number" placeholder="Qté" value="' + (a.qte||1) + '" onchange="ProjetsTypes._updateLibre(\'' + id + '\',' + i + ',\'qte\',parseFloat(this.value)||0)">'
        + '<input class="pt-cell-input pt-cell-sm" type="number" step="0.01" placeholder="Prix" value="' + (a.prix||0) + '" onchange="ProjetsTypes._updateLibre(\'' + id + '\',' + i + ',\'prix\',parseFloat(this.value)||0)">'
        + '<button class="btn btn-secondary btn-sm" title="Sauvegarder dans la base produits" onclick="ProjetsTypes._saveProduit(\'' + id + '\',' + i + ')">💾</button>'
        + '<button class="pt-del-btn" onclick="ProjetsTypes._delLibre(\'' + id + '\',' + i + ')">✕</button>'
        + '</div>';
    }).join('');
  },

  _updateLibre: function(id, i, key, val) {
    if (!ProjetsTypes._lignesLibres[id] || !ProjetsTypes._lignesLibres[id][i]) return;
    ProjetsTypes._lignesLibres[id][i][key] = val;
    ProjetsTypes._updateTotaux(id);
  },

  _delLibre: function(id, i) {
    if (!ProjetsTypes._lignesLibres[id]) return;
    ProjetsTypes._lignesLibres[id].splice(i, 1);
    ProjetsTypes._renderArticlesLibres(id);
    ProjetsTypes._updateTotaux(id);
  },

  _saveProduit: function(id, i) {
    var a = (ProjetsTypes._lignesLibres[id] || [])[i];
    if (!a || !a.designation) { App.toast('Renseignez au moins la désignation.', 'error'); return; }
    var produit = {
      reference: a.ref || ('LIB_' + Date.now()),
      designation: a.designation,
      unite: a.unite || 'u',
      prixHT: parseFloat(a.prix) || 0,
      categorie: 'Divers',
      rendement: '-',
      tva: 10
    };
    if (typeof DB !== 'undefined' && DB.add) {
      DB.add('produits', produit);
      App.toast('✅ Produit "' + a.designation + '" sauvegardé dans la base tarifaire.', 'success');
    }
  },

  // ── Totaux ────────────────────────────────────────────────
  _updateTotaux: function(id) {
    var wrap = document.getElementById('pt-totaux');
    if (!wrap) return;
    var lignes = (ProjetsTypes._lignes[id] || []).concat(ProjetsTypes._lignesLibres[id] || []);
    var totalHT = lignes.reduce(function(s, l) { return s + (parseFloat(l.qte) || 0) * (parseFloat(l.prix) || 0); }, 0);
    var tva = totalHT * 0.10;
    var ttc = totalHT + tva;

    wrap.innerHTML = '<div class="pt-totaux-inner">'
      + '<div class="pt-tot-row"><span>Total HT</span><span class="pt-tot-val">' + ProjetsTypes._fmt(totalHT) + ' €</span></div>'
      + '<div class="pt-tot-row"><span>TVA 10%</span><span class="pt-tot-val">' + ProjetsTypes._fmt(tva) + ' €</span></div>'
      + '<div class="pt-tot-row pt-tot-ttc"><span>Total TTC</span><span class="pt-tot-val">' + ProjetsTypes._fmt(ttc) + ' €</span></div>'
      + '</div>';
  },

  _fmt: function(n) {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  },

  // ── Modal création devis ──────────────────────────────────
  modalDevis: function(id) {
    var p = ProjetsTypes.PROJETS_DATA.find(function(x) { return x.id === id; });
    if (!p) return;

    var clients = DB.getAll('clients') || [];
    var chantiers = DB.getAll('chantiers') || [];

    var optCli = clients.map(function(c) {
      return '<option value="' + c.id + '">' + (c.nom || c.raisonSociale || 'Client') + '</option>';
    }).join('');
    var optCha = chantiers.map(function(c) {
      return '<option value="' + c.id + '">' + (c.nom || c.adresse || 'Chantier') + '</option>';
    }).join('');

    var body = '<div style="display:flex;flex-direction:column;gap:12px">'
      + '<div><label class="form-label">Client</label>'
      + '<select id="pt-devis-client" class="form-control"><option value="">— Sélectionner —</option>' + optCli + '</select></div>'
      + '<div><label class="form-label">Chantier</label>'
      + '<select id="pt-devis-chantier" class="form-control"><option value="">— Sélectionner —</option>' + optCha + '</select></div>'
      + '<div><label class="form-label">Objet du devis</label>'
      + '<input id="pt-devis-objet" class="form-control" value="' + p.icon + ' ' + p.titre + '"></div>'
      + '</div>';

    var footer = '<button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>'
      + '<button class="btn btn-primary" onclick="ProjetsTypes._creerDevis(\'' + id + '\')">📄 Créer le devis</button>';

    App.openModal('Créer le devis', body, footer);
  },

  _creerDevis: function(id) {
    var p = ProjetsTypes.PROJETS_DATA.find(function(x) { return x.id === id; });
    if (!p) return;

    var clientId  = document.getElementById('pt-devis-client')  ? document.getElementById('pt-devis-client').value  : '';
    var chantierId = document.getElementById('pt-devis-chantier') ? document.getElementById('pt-devis-chantier').value : '';
    var objet      = document.getElementById('pt-devis-objet')    ? document.getElementById('pt-devis-objet').value    : p.titre;

    var lignes = (ProjetsTypes._lignes[id] || []).concat(ProjetsTypes._lignesLibres[id] || []);
    var totalHT = lignes.reduce(function(s, l) { return s + (parseFloat(l.qte)||0) * (parseFloat(l.prix)||0); }, 0);
    var tva     = totalHT * 0.10;
    var ttc     = totalHT + tva;

    var devisLignes = lignes.map(function(l) {
      var baseHT = (parseFloat(l.qte)||0) * (parseFloat(l.prix)||0);
      return {
        poste:       l.designation || l.ref || '',
        baseHT:      baseHT,
        marge:       0.30,
        totalClient: baseHT * 1.30,
        ref:         l.ref || '',
        unite:       l.unite || 'u',
        quantite:    parseFloat(l.qte)  || 0,
        prixHT:      parseFloat(l.prix) || 0,
      };
    });
    var totalHT = devisLignes.reduce(function(s,l){ return s + l.totalClient; }, 0);
    var tva = totalHT * 0.10;
    var ttc = totalHT + tva;

    var today = new Date();
    var dateStr = today.toISOString().split('T')[0];
    var validite = new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0];
    var numero = 'DEV-' + today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(Math.floor(Math.random()*900)+100);

    DB.addDevis({
      numero:    numero,
      objet:     objet,
      clientId:  clientId  || null,
      chantierId: chantierId || null,
      date:      dateStr,
      validite:  validite,
      statut:    'brouillon',
      lignes:    devisLignes,
      totalHT:   totalHT,
      totalTTC:  ttc,
      montantTVA: tva,
      tva:        0.10,
      notes:     'Généré depuis Projets types — ' + p.titre
    });

    App.closeModal();
    App.navigate('devis');
  },

  // ── Injection CSS ─────────────────────────────────────────
  _injectStyles: function() {
    // Inject calc-styles if not already present (shared with calculateur + packs)
    if (!document.getElementById('calc-styles')) {
      var cs = document.createElement('style');
      cs.id = 'calc-styles';
      cs.textContent = `
        .calc-grid{display:grid;grid-template-columns:1fr;gap:16px;align-items:start}
        @media(min-width:1400px){.calc-grid{grid-template-columns:1fr 1fr}}
        .calc-panel{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-xl);overflow:hidden;backdrop-filter:blur(12px)}
        .calc-tabs{display:flex;flex-wrap:wrap;border-bottom:1px solid var(--glass-border);background:rgba(255,255,255,0.02);padding:8px 8px 0;gap:4px}
        .calc-tab{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:var(--r-md) var(--r-md) 0 0;font-size:13px;font-weight:500;color:var(--text-secondary);background:none;border:1px solid transparent;border-bottom:none;cursor:pointer;transition:all 0.15s}
        .calc-tab.active{color:var(--accent);background:var(--glass-bg-strong);border-color:var(--glass-border-md);font-weight:600}
        .calc-tab-content{display:none;padding:20px}
        .calc-tab-content.active{display:block}
        .calc-field{margin-bottom:14px}
        .calc-label{font-size:12px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;display:block}
        .calc-input-wrap{display:flex;align-items:center;background:rgba(255,255,255,0.05);border:1px solid var(--glass-border-md);border-radius:var(--r-md);overflow:hidden}
        .calc-input-wrap input,.calc-input-wrap select{flex:1;height:38px;padding:0 12px;background:none;border:none;outline:none;font-family:var(--font-mono);font-size:16px;font-weight:600;color:var(--text-primary)}
        .calc-unit{padding:0 10px;font-size:12px;font-weight:600;color:var(--text-tertiary);background:rgba(255,255,255,0.04);border-left:1px solid var(--glass-border);height:38px;display:flex;align-items:center;white-space:nowrap}
        .calc-radio-group{display:flex;gap:8px;flex-wrap:wrap}
        .calc-radio{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:var(--r-md);border:1px solid var(--glass-border-md);cursor:pointer;font-size:13px;color:var(--text-secondary);transition:all .15s}
        .calc-radio input{display:none}
        .calc-radio.selected{background:rgba(79,142,247,0.12);border-color:rgba(79,142,247,0.35);color:var(--accent);font-weight:600}
        .calc-check{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:var(--r-md);border:1px solid transparent;cursor:pointer;font-size:13px;color:var(--text-secondary)}
        .calc-check input[type=checkbox]{width:15px;height:15px;accent-color:var(--accent)}
        .calc-results{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-xl);padding:20px;backdrop-filter:blur(12px)}
        .calc-results-title{font-size:13px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px}
        .res-section{margin-bottom:16px}
        .res-section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--glass-border)}
        .res-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:13px;color:var(--text-secondary)}
        .res-row .label{font-weight:500}
        .res-row .value{font-family:var(--font-mono);font-weight:600;color:var(--text-primary)}
        .res-material{background:rgba(45,212,160,0.07);border:1px solid rgba(45,212,160,0.15);border-radius:var(--r-md);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
        .res-financier{background:var(--glass-bg-strong);border:1px solid var(--glass-border-md);border-radius:var(--r-lg);padding:14px}
        .res-fin-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:13px;color:var(--text-secondary);border-bottom:1px solid rgba(255,255,255,0.04)}
        .res-fin-row:last-child{border-bottom:none}
        .res-fin-total{display:flex;justify-content:space-between;align-items:center;padding:12px 0 4px;border-top:1px solid var(--glass-border-md);margin-top:8px}
        .res-fin-total .label{font-size:13px;font-weight:700;color:var(--accent)}
        .res-fin-total .value{font-size:22px;font-weight:800;color:var(--text-primary);font-family:var(--font-mono)}
      `;
      document.head.appendChild(cs);
    }

    if (document.getElementById('pt-styles')) return;
    var s = document.createElement('style');
    s.id = 'pt-styles';
    s.textContent = `
      .pt-wrap { padding: 24px; max-width: 1400px; }

      /* Hero */
      .pt-hero {
        background: linear-gradient(135deg, rgba(79,142,247,0.14) 0%, rgba(45,212,160,0.07) 50%, rgba(167,139,250,0.06) 100%);
        border: 1px solid var(--glass-border-md);
        border-radius: var(--r-xl);
        padding: 32px 36px;
        margin-bottom: 24px;
        position: relative;
        overflow: hidden;
      }
      .pt-hero::before {
        content: '';
        position: absolute;
        top: -40px; right: -40px;
        width: 200px; height: 200px;
        background: radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%);
        pointer-events: none;
      }
      .pt-hero-inner { position: relative; }
      .pt-hero-badge {
        display: inline-block;
        background: rgba(79,142,247,0.15);
        border: 1px solid rgba(79,142,247,0.3);
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 11px;
        font-weight: 700;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: .08em;
        margin-bottom: 12px;
      }
      .pt-hero-title {
        font-size: 28px;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0 0 8px;
        letter-spacing: -0.5px;
      }
      .pt-hero-sub {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
      }

      /* Content */
      .pt-content { }

      /* Grille cartes */
      .pt-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      /* Card */
      .pt-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--r-xl);
        padding: 20px;
        cursor: pointer;
        transition: all 0.18s;
        display: flex;
        align-items: flex-start;
        gap: 16px;
        position: relative;
        overflow: hidden;
      }
      .pt-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: var(--pt-color, var(--accent));
        opacity: 0.6;
        transition: opacity 0.18s;
      }
      .pt-card:hover {
        background: var(--glass-bg-md);
        border-color: var(--glass-border-md);
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      }
      .pt-card:hover::before { opacity: 1; }
      .pt-card-icon {
        font-size: 28px;
        flex-shrink: 0;
        width: 48px; height: 48px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,0.05);
        border-radius: var(--r-lg);
        border: 1px solid var(--glass-border);
      }
      .pt-card-body { flex: 1; min-width: 0; }
      .pt-card-titre {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 4px;
      }
      .pt-card-desc {
        font-size: 12px;
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: 10px;
      }
      .pt-card-tags { display: flex; gap: 6px; flex-wrap: wrap; }
      .pt-tag {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 10px;
        background: rgba(255,255,255,0.07);
        border: 1px solid var(--glass-border);
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: .04em;
      }
      .pt-card-arrow {
        font-size: 18px;
        color: var(--text-tertiary);
        transition: transform 0.18s;
        flex-shrink: 0;
        align-self: center;
      }
      .pt-card:hover .pt-card-arrow { transform: translateX(4px); color: var(--pt-color, var(--accent)); }

      /* Configurateur */
      .pt-config { display: flex; flex-direction: column; gap: 20px; min-width: 680px; }
      .pt-config-dims { display: flex; gap: 16px; flex-wrap: wrap; }
      .pt-dim-row { display: flex; align-items: center; gap: 10px; }
      .pt-dim-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); min-width: 140px; }

      /* Tableau lignes */
      .pt-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .pt-table thead th {
        padding: 8px 10px;
        text-align: left;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: var(--text-tertiary);
        border-bottom: 1px solid var(--glass-border);
      }
      .pt-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); }
      .pt-table tbody tr:hover { background: rgba(255,255,255,0.02); }
      .pt-table td { padding: 5px 4px; vertical-align: middle; }
      .pt-cell-input {
        width: 100%;
        background: rgba(255,255,255,0.04);
        border: 1px solid transparent;
        border-radius: var(--r-sm);
        padding: 4px 8px;
        font-family: var(--font-mono);
        font-size: 12px;
        color: var(--text-primary);
        outline: none;
        transition: border-color .12s;
        min-width: 60px;
      }
      .pt-cell-input:focus { border-color: var(--accent); background: rgba(79,142,247,0.06); }
      .pt-cell-wide { min-width: 200px; }
      .pt-cell-sm { max-width: 80px; }
      .pt-cell-total { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--text-primary); padding: 5px 10px; white-space: nowrap; }
      .pt-del-btn {
        background: none; border: none; cursor: pointer;
        color: var(--text-tertiary); font-size: 12px; padding: 4px 6px;
        border-radius: var(--r-sm); transition: all .12s;
      }
      .pt-del-btn:hover { background: rgba(247,91,91,0.12); color: var(--red, #F75B5B); }

      /* Section title */
      .pt-section-title {
        font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary);
        margin-bottom: 10px; padding-bottom: 4px;
        border-bottom: 1px solid var(--glass-border);
      }

      /* Articles libres */
      .pt-article-libre-wrap { }
      .pt-libre-row {
        display: flex; align-items: center; gap: 6px;
        margin-bottom: 6px; flex-wrap: wrap;
      }

      /* Totaux */
      .pt-totaux { }
      .pt-totaux-inner {
        background: var(--glass-bg-strong);
        border: 1px solid var(--glass-border-md);
        border-radius: var(--r-lg);
        padding: 14px 18px;
      }
      .pt-tot-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 5px 0;
        font-size: 13px;
        color: var(--text-secondary);
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .pt-tot-row:last-child { border-bottom: none; }
      .pt-tot-val { font-family: var(--font-mono); font-weight: 600; color: var(--text-primary); }
      .pt-tot-ttc {
        margin-top: 4px;
        padding-top: 10px;
        border-top: 1px solid var(--glass-border-md);
        border-bottom: none !important;
      }
      .pt-tot-ttc span:first-child { font-weight: 700; font-size: 14px; color: var(--accent); }
      .pt-tot-ttc .pt-tot-val { font-size: 20px; font-weight: 800; color: var(--text-primary); }
    `;
    document.head.appendChild(s);
  },
};

// ── Enregistrement de la page ──────────────────────────────
Pages.projetsTypes = function() {
  return ProjetsTypes.render();
};

