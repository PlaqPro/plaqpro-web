/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Base produits exhaustive + Moteur de recherche
//  produits_complet.js
//  Ajouter dans index.html : <script src="js/produits_complet.js"></script>
// ============================================================

// ── Catalogue complet par famille ─────────────────────────────
const CATALOGUE = [

  // ══════════════════════════════════════════════════════════
  //  PLAQUES DE PLÂTRE
  // ══════════════════════════════════════════════════════════
  { ref:'BA13S',    fam:'Plaque plâtre', sfam:'Standard',    nom:'Plaque BA13 Standard 260×120cm',           unite:'u',    prix:8.50,   rend:2.70, tags:['placo','cloison','ba13'] },
  { ref:'BA13H',    fam:'Plaque plâtre', sfam:'Hydrofuge',   nom:'Plaque BA13 Hydro 260×120cm',              unite:'u',    prix:11.20,  rend:2.70, tags:['hydro','humide','sdb'] },
  { ref:'BA13F',    fam:'Plaque plâtre', sfam:'Feu',         nom:'Plaque BA13 Feu 260×120cm',                unite:'u',    prix:13.50,  rend:2.70, tags:['feu','coupe-feu','rf'] },
  { ref:'BA13PHF',  fam:'Plaque plâtre', sfam:'Phonique',    nom:'Plaque BA13 Phonique HD 260×120cm',        unite:'u',    prix:15.80,  rend:2.70, tags:['phonique','acoustique','son'] },
  { ref:'BA15S',    fam:'Plaque plâtre', sfam:'Standard',    nom:'Plaque BA15 Standard 260×120cm',           unite:'u',    prix:12.40,  rend:2.70, tags:['renforcee','ba15'] },
  { ref:'BA18F',    fam:'Plaque plâtre', sfam:'Feu',         nom:'Plaque BA18 Feu 260×120cm',                unite:'u',    prix:18.60,  rend:2.70, tags:['feu','haute resistance'] },
  { ref:'FERMAC13', fam:'Plaque plâtre', sfam:'Fermacell',   nom:'Fermacell 13mm 300×120cm',                 unite:'u',    prix:22.40,  rend:3.60, tags:['fermacell','humide','lourd'] },
  { ref:'FERMAC10', fam:'Plaque plâtre', sfam:'Fermacell',   nom:'Fermacell 10mm 300×120cm',                 unite:'u',    prix:18.90,  rend:3.60, tags:['fermacell'] },
  { ref:'AQUAP13',  fam:'Plaque plâtre', sfam:'Aquapanel',   nom:'Aquapanel Outdoor 12.5mm 120×90cm',        unite:'u',    prix:19.50,  rend:1.08, tags:['aquapanel','exterieur','carrelage'] },

  // ══════════════════════════════════════════════════════════
  //  CARREAUX DE PLÂTRE
  // ══════════════════════════════════════════════════════════
  { ref:'CP70S',    fam:'Carreau plâtre', sfam:'Standard',   nom:'Carreau de plâtre 70mm Standard 66×50cm',  unite:'u',    prix:4.20,   rend:0.33, tags:['carreau','cloison','70mm'] },
  { ref:'CP70H',    fam:'Carreau plâtre', sfam:'Hydrofuge',  nom:'Carreau de plâtre 70mm Hydro 66×50cm',    unite:'u',    prix:5.80,   rend:0.33, tags:['carreau','hydro','70mm'] },
  { ref:'CP100S',   fam:'Carreau plâtre', sfam:'Standard',   nom:'Carreau de plâtre 100mm Standard 66×50cm',unite:'u',    prix:6.40,   rend:0.33, tags:['carreau','100mm','isolation'] },
  { ref:'CP150S',   fam:'Carreau plâtre', sfam:'Standard',   nom:'Carreau de plâtre 150mm Standard 66×50cm',unite:'u',    prix:8.90,   rend:0.33, tags:['carreau','150mm'] },
  { ref:'BVERRE19', fam:'Carreau plâtre', sfam:'Brique',     nom:'Brique de verre 19×19×8cm',               unite:'u',    prix:3.20,   rend:0.0361,tags:['brique verre','lumineux'] },

  // ══════════════════════════════════════════════════════════
  //  RAILS & MONTANTS
  // ══════════════════════════════════════════════════════════
  { ref:'PARF36',   fam:'Ossature métal', sfam:'Rail',       nom:'Rail Stil R36 barre 3m',                  unite:'ml',   prix:1.45,   rend:null, tags:['rail','36mm','leger'] },
  { ref:'PARF48',   fam:'Ossature métal', sfam:'Rail',       nom:'Rail Stil R48 barre 3m',                  unite:'ml',   prix:1.65,   rend:null, tags:['rail','48mm','standard'] },
  { ref:'PARF70',   fam:'Ossature métal', sfam:'Rail',       nom:'Rail Stil R70 barre 3m',                  unite:'ml',   prix:2.10,   rend:null, tags:['rail','70mm'] },
  { ref:'PARF98',   fam:'Ossature métal', sfam:'Rail',       nom:'Rail Stil R98 barre 3m',                  unite:'ml',   prix:2.80,   rend:null, tags:['rail','98mm','grande hauteur'] },
  { ref:'PARF120',  fam:'Ossature métal', sfam:'Rail',       nom:'Rail Stil R120 barre 3m',                 unite:'ml',   prix:3.50,   rend:null, tags:['rail','120mm'] },
  { ref:'PAMON36',  fam:'Ossature métal', sfam:'Montant',    nom:'Montant Stil M36 barre 2.8m',             unite:'u',    prix:2.10,   rend:null, tags:['montant','36mm'] },
  { ref:'PAMON48',  fam:'Ossature métal', sfam:'Montant',    nom:'Montant Stil M48 barre 2.8m',             unite:'u',    prix:2.45,   rend:null, tags:['montant','48mm','standard'] },
  { ref:'PAMON70',  fam:'Ossature métal', sfam:'Montant',    nom:'Montant Stil M70 barre 2.8m',             unite:'u',    prix:3.20,   rend:null, tags:['montant','70mm'] },
  { ref:'PAMON98',  fam:'Ossature métal', sfam:'Montant',    nom:'Montant Stil M98 barre 2.8m',             unite:'u',    prix:4.10,   rend:null, tags:['montant','98mm'] },
  { ref:'PAMON120', fam:'Ossature métal', sfam:'Montant',    nom:'Montant Stil M120 barre 2.8m',            unite:'u',    prix:5.20,   rend:null, tags:['montant','120mm'] },
  { ref:'OSSOSS',   fam:'Ossature métal', sfam:'Plafond',    nom:'Ossature principale F530 3.75m',          unite:'ml',   prix:3.80,   rend:null, tags:['ossature','plafond','f530'] },
  { ref:'OSSF47',   fam:'Ossature métal', sfam:'Plafond',    nom:'Ossature secondaire F47 3m',              unite:'ml',   prix:2.60,   rend:null, tags:['ossature','plafond','f47'] },
  { ref:'SUSPVIS',  fam:'Ossature métal', sfam:'Plafond',    nom:'Suspente à fourche + vis',                unite:'u',    prix:0.85,   rend:null, tags:['suspente','plafond'] },
  { ref:'CORNIERE', fam:'Ossature métal', sfam:'Plafond',    nom:'Cornière périmétrique F530 3m',           unite:'ml',   prix:1.90,   rend:null, tags:['corniere','perimetre'] },

  // ══════════════════════════════════════════════════════════
  //  FIXATIONS & VIS
  // ══════════════════════════════════════════════════════════
  { ref:'VIS_TF25', fam:'Fixation', sfam:'Vis',              nom:'Vis TF 3.5×25 plaquiste boite 500u',      unite:'boite',prix:6.20,   rend:500,  tags:['vis','plaquiste','fixation'] },
  { ref:'VIS_TF35', fam:'Fixation', sfam:'Vis',              nom:'Vis TF 3.5×35 plaquiste boite 500u',      unite:'boite',prix:6.90,   rend:500,  tags:['vis','plaquiste','tf35'] },
  { ref:'VIS_TB35', fam:'Fixation', sfam:'Vis',              nom:'Vis TB 3.5×35 bois-métal boite 500u',     unite:'boite',prix:7.40,   rend:500,  tags:['vis','bois','metal'] },
  { ref:'CHEV6',    fam:'Fixation', sfam:'Cheville',         nom:'Cheville nylon Ø6 boite 100u',            unite:'boite',prix:4.50,   rend:100,  tags:['cheville','fixation','rail'] },
  { ref:'CHEV8',    fam:'Fixation', sfam:'Cheville',         nom:'Cheville nylon Ø8 boite 100u',            unite:'boite',prix:5.20,   rend:100,  tags:['cheville','8mm'] },
  { ref:'CHEV_MET', fam:'Fixation', sfam:'Cheville',         nom:'Cheville métal placo Molly boite 25u',    unite:'boite',prix:8.90,   rend:25,   tags:['cheville','placo','molly','fixation lourde'] },
  { ref:'RONDRON',  fam:'Fixation', sfam:'Anti-bruit',       nom:'Rondelle caoutchouc anti-bruit 100u',     unite:'boite',prix:8.20,   rend:100,  tags:['rondelle','caoutchouc','phonique','antivibration'] },
  { ref:'BAND_ETN', fam:'Fixation', sfam:'Étanchéité',       nom:'Bande étanchéité rail mousse 30m',        unite:'rl',   prix:12.50,  rend:30,   tags:['bande','etancheite','mousse','rail'] },
  { ref:'CORN_ALU', fam:'Fixation', sfam:'Finition',         nom:'Cornière alu protection angle 2.5m',      unite:'u',    prix:2.80,   rend:null, tags:['corniere','angle','protection','alu'] },
  { ref:'CORN_PVC', fam:'Fixation', sfam:'Finition',         nom:'Cornière PVC protection angle 2.5m',      unite:'u',    prix:1.20,   rend:null, tags:['corniere','pvc','angle'] },

  // ══════════════════════════════════════════════════════════
  //  ISOLATION
  // ══════════════════════════════════════════════════════════
  { ref:'LV45',     fam:'Isolation', sfam:'Laine verre',     nom:'Laine de verre Isover 45mm rouleau 12m²', unite:'m2',   prix:3.80,   rend:null, tags:['laine verre','isolation','45mm','thermique'] },
  { ref:'LV100',    fam:'Isolation', sfam:'Laine verre',     nom:'Laine de verre Isover 100mm rouleau 6m²', unite:'m2',   prix:5.60,   rend:null, tags:['laine verre','100mm','combles'] },
  { ref:'LR50',     fam:'Isolation', sfam:'Laine roche',     nom:'Laine roche Rockwool 50mm rouleau 6m²',   unite:'m2',   prix:6.40,   rend:null, tags:['laine roche','rockwool','phonique','50mm'] },
  { ref:'LR80',     fam:'Isolation', sfam:'Laine roche',     nom:'Laine roche Rockwool 80mm rouleau 4m²',   unite:'m2',   prix:8.90,   rend:null, tags:['laine roche','80mm','haute performance'] },
  { ref:'IPN40',    fam:'Isolation', sfam:'Panneau',         nom:'Panneau isolant PSE 40mm 120×60cm',       unite:'u',    prix:4.20,   rend:0.72, tags:['polystyrene','pse','panneau','doublage'] },
  { ref:'IPN80',    fam:'Isolation', sfam:'Panneau',         nom:'Panneau isolant PSE 80mm 120×60cm',       unite:'u',    prix:7.80,   rend:0.72, tags:['polystyrene','80mm'] },
  { ref:'PIR40',    fam:'Isolation', sfam:'Panneau',         nom:'Panneau PIR 40mm 120×60cm',               unite:'u',    prix:12.40,  rend:0.72, tags:['pir','polyurethane','haute performance'] },
  { ref:'MWOOL50',  fam:'Isolation', sfam:'Laine roche',     nom:'Laine roche Rockwool Flexi 50mm 1.2×0.6m',unite:'u',   prix:9.80,   rend:0.72, tags:['rockwool','flexible','cloison'] },

  // ══════════════════════════════════════════════════════════
  //  JOINT & ENDUIT
  // ══════════════════════════════════════════════════════════
  { ref:'BANDE_PLA',fam:'Jointage', sfam:'Bande',            nom:'Bande à plâtre 50mm rouleau 50ml',        unite:'rl',   prix:4.20,   rend:50,   tags:['bande','joint','platre'] },
  { ref:'BANDE_ARM',fam:'Jointage', sfam:'Bande',            nom:'Bande armée fibre de verre 50ml',         unite:'rl',   prix:7.80,   rend:50,   tags:['bande armee','fibre','angles'] },
  { ref:'ENDUIT_F', fam:'Jointage', sfam:'Enduit',           nom:'Enduit finition Toupret 25kg',            unite:'sac',  prix:18.50,  rend:25,   tags:['enduit','finition','toupret','lissage'] },
  { ref:'ENDUIT_PR',fam:'Jointage', sfam:'Enduit',           nom:'Enduit prise plâtre Paris 25kg',          unite:'sac',  prix:12.80,  rend:25,   tags:['enduit','prise','platre'] },
  { ref:'ENDUIT_TP',fam:'Jointage', sfam:'Enduit',           nom:'Enduit tout-en-un Uniflott 25kg',         unite:'sac',  prix:22.40,  rend:25,   tags:['uniflott','tout en un','rapide'] },
  { ref:'ENDUIT_RB',fam:'Jointage', sfam:'Enduit',           nom:'Enduit rebouchage Polyfilla 1.5kg',       unite:'sac',  prix:8.90,   rend:1.5,  tags:['rebouchage','polyfilla','reparation'] },
  { ref:'COLLE_CP', fam:'Jointage', sfam:'Colle',            nom:'Colle carreau de plâtre 25kg',            unite:'sac',  prix:14.20,  rend:25,   tags:['colle','carreau platre'] },
  { ref:'MASTIC_A', fam:'Jointage', sfam:'Mastic',           nom:'Mastic acrylique blanc cartouche 310ml',  unite:'u',    prix:2.80,   rend:null, tags:['mastic','acrylique','joint','perimetre'] },
  { ref:'MASTIC_S', fam:'Jointage', sfam:'Mastic',           nom:'Mastic silicone blanc cartouche 310ml',   unite:'u',    prix:4.50,   rend:null, tags:['mastic','silicone','etancheite','salle de bain'] },
  { ref:'MASTIC_SF',fam:'Jointage', sfam:'Mastic',           nom:'Mastic silicone sanitaire blanc 310ml',   unite:'u',    prix:5.20,   rend:null, tags:['silicone','sanitaire','sdb','cuisine'] },

  // ══════════════════════════════════════════════════════════
  //  PEINTURE INTÉRIEURE
  // ══════════════════════════════════════════════════════════
  { ref:'DULUX_BM15',fam:'Peinture', sfam:'Murs',            nom:'DULUX Blanc Mat bidon 15L',               unite:'L',    prix:2.80,   rend:12,   tags:['dulux','blanc mat','murs'] },
  { ref:'DULUX_SAT', fam:'Peinture', sfam:'Murs',            nom:'DULUX Diamond Satin blanc 5L',            unite:'L',    prix:4.20,   rend:11,   tags:['dulux','satin','finition'] },
  { ref:'DULUX_VOL', fam:'Peinture', sfam:'Murs',            nom:'DULUX Valentine Velours 10L',             unite:'L',    prix:5.10,   rend:10,   tags:['dulux','velours','qualite'] },
  { ref:'SIKK_ALB',  fam:'Peinture', sfam:'Sous-couche',     nom:'SIKKENS Albolin sous-couche 10L',         unite:'L',    prix:4.20,   rend:10,   tags:['sikkens','sous couche','universelle'] },
  { ref:'SOVI_BM',   fam:'Peinture', sfam:'Murs',            nom:'SOVITEC Blanc Mat Pro 15L',               unite:'L',    prix:2.40,   rend:11,   tags:['sovitec','professionnel','economique'] },
  { ref:'ZINS_PR',   fam:'Peinture', sfam:'Sous-couche',     nom:'ZINSSER Bulls Eye 1-2-3 bidon 5L',        unite:'L',    prix:6.80,   rend:9,    tags:['zinsser','bloquant','taches','nicotine'] },
  { ref:'PLC_BMAT',  fam:'Peinture', sfam:'Plafond',         nom:'Peinture plafond blanc mat 15L',          unite:'L',    prix:2.20,   rend:13,   tags:['plafond','blanc mat','couvrant'] },
  { ref:'PLC_PREM',  fam:'Peinture', sfam:'Plafond',         nom:'Peinture plafond Premium 10L',            unite:'L',    prix:3.10,   rend:12,   tags:['plafond','premium','opacite'] },
  { ref:'GLYC_SAT',  fam:'Peinture', sfam:'Boiseries',       nom:'Peinture glycéro satin blanc 5L',         unite:'L',    prix:5.80,   rend:9,    tags:['glycero','satin','boiseries','huisseries'] },
  { ref:'AQUA_SAT',  fam:'Peinture', sfam:'Boiseries',       nom:'Peinture laque aqua satin 2.5L',          unite:'L',    prix:7.20,   rend:8,    tags:['laque','aqua','boiseries','haute qualite'] },
  { ref:'APPR_GYP',  fam:'Peinture', sfam:'Apprêt',          nom:'Apprêt Gyproc Knauf bidon 15L',           unite:'L',    prix:3.20,   rend:10,   tags:['appret','gyproc','placo neuf'] },
  { ref:'APPR_PF',   fam:'Peinture', sfam:'Apprêt',          nom:'Apprêt pénétrant fissures 5L',            unite:'L',    prix:4.50,   rend:8,    tags:['appret','penetrant','fissures','renovation'] },
  { ref:'FOND_PEN',  fam:'Peinture', sfam:'Apprêt',          nom:'Fond pénétrant Promal 10L',               unite:'L',    prix:2.90,   rend:10,   tags:['fond penetrant','poreux','ancien'] },

  // ══════════════════════════════════════════════════════════
  //  ACCESSOIRES PEINTURE
  // ══════════════════════════════════════════════════════════
  { ref:'ROUL18',   fam:'Accessoire peinture', sfam:'Rouleau',nom:'Rouleau laine 18mm Ø60 lot 10',          unite:'lot',  prix:8.90,   rend:null, tags:['rouleau','laine','peinture murs'] },
  { ref:'ROUL10',   fam:'Accessoire peinture', sfam:'Rouleau',nom:'Rouleau mousse 10mm Ø40 lot 10',         unite:'lot',  prix:6.40,   rend:null, tags:['rouleau','mousse','laque','boiseries'] },
  { ref:'BROSSE_6', fam:'Accessoire peinture', sfam:'Brosse', nom:'Brosse Spalter 60mm professionnelle',    unite:'u',    prix:4.20,   rend:null, tags:['brosse','spalter','peinture'] },
  { ref:'BAC_PEI',  fam:'Accessoire peinture', sfam:'Bac',    nom:'Bac à peinture + grille lot 5',          unite:'lot',  prix:9.50,   rend:null, tags:['bac','grille','peinture'] },
  { ref:'SCOTCH_M', fam:'Accessoire peinture', sfam:'Masquage',nom:'Ruban masquage 25mm rouleau 50m',       unite:'u',    prix:2.10,   rend:null, tags:['scotch','masquage','peinture'] },
  { ref:'BACHE_4',  fam:'Accessoire peinture', sfam:'Protection',nom:'Bâche protection 4×5m PE100',         unite:'u',    prix:3.40,   rend:null, tags:['bache','protection','sol'] },
  { ref:'PVERT_80', fam:'Accessoire peinture', sfam:'Ponçage',nom:'Papier de verre grain 80 lot 25',        unite:'lot',  prix:6.80,   rend:null, tags:['papier verre','poncage','80'] },
  { ref:'PVERT_120',fam:'Accessoire peinture', sfam:'Ponçage',nom:'Papier de verre grain 120 lot 25',       unite:'lot',  prix:6.80,   rend:null, tags:['papier verre','poncage','120','finition'] },
  { ref:'CUTTER',   fam:'Accessoire peinture', sfam:'Outillage',nom:'Lames cutter 18mm boite 10u',          unite:'boite',prix:3.20,   rend:null, tags:['cutter','lame','decoupe'] },

  // ══════════════════════════════════════════════════════════
  //  REVÊTEMENTS DE SOL
  // ══════════════════════════════════════════════════════════
  { ref:'VINYL_LE', fam:'Revêtement sol', sfam:'Vinyle',      nom:'Vinyle en lé 2m large (prix/ml)',        unite:'ml',   prix:8.90,   rend:null, tags:['vinyle','lino','sol','pose colle'] },
  { ref:'LVT_CL',   fam:'Revêtement sol', sfam:'LVT',         nom:'LVT click 4mm épaisseur (prix/m²)',      unite:'m2',   prix:18.50,  rend:null, tags:['lvt','click','vinyle','lame'] },
  { ref:'LVT_COL',  fam:'Revêtement sol', sfam:'LVT',         nom:'LVT colle 2.5mm (prix/m²)',              unite:'m2',   prix:12.40,  rend:null, tags:['lvt','colle','professionnel'] },
  { ref:'PAR_MASS', fam:'Revêtement sol', sfam:'Parquet',      nom:'Parquet massif chêne 14mm (prix/m²)',    unite:'m2',   prix:42.00,  rend:null, tags:['parquet','massif','chene','bois'] },
  { ref:'PAR_CONT', fam:'Revêtement sol', sfam:'Parquet',      nom:'Parquet contrecollé 14mm (prix/m²)',     unite:'m2',   prix:28.00,  rend:null, tags:['parquet','contrecolle','stratifie'] },
  { ref:'STRAT_8',  fam:'Revêtement sol', sfam:'Stratifié',    nom:'Stratifié 8mm AC4 (prix/m²)',            unite:'m2',   prix:9.80,   rend:null, tags:['stratifie','lame','click','parquet'] },
  { ref:'SSCOUCHE', fam:'Revêtement sol', sfam:'Accessoire',   nom:'Sous-couche isolante 3mm rouleau 15m²', unite:'u',    prix:18.90,  rend:15,   tags:['sous couche','isolation','parquet','stratifie'] },
  { ref:'COLLE_PAR',fam:'Revêtement sol', sfam:'Accessoire',   nom:'Colle parquet MS polymère 15kg',        unite:'sac',  prix:24.50,  rend:null, tags:['colle','parquet','ms polymere'] },
  { ref:'PROF_JON', fam:'Revêtement sol', sfam:'Accessoire',   nom:'Profilé de jonction alu 90cm',          unite:'u',    prix:4.80,   rend:null, tags:['profile','jonction','finition','seuil'] },
  { ref:'PLINTHE',  fam:'Revêtement sol', sfam:'Accessoire',   nom:'Plinthe MDF blanc 7cm × 2.4m',          unite:'u',    prix:3.20,   rend:null, tags:['plinthe','finition','mdf','blanc'] },
  { ref:'PLINTHE_S',fam:'Revêtement sol', sfam:'Accessoire',   nom:'Quart de rond MDF blanc 1.8cm × 2.4m',  unite:'u',    prix:1.80,   rend:null, tags:['quart de rond','finition'] },

  // ══════════════════════════════════════════════════════════
  //  CARRELAGE & FAÏENCE
  // ══════════════════════════════════════════════════════════
  { ref:'COLLE_FL', fam:'Carrelage', sfam:'Colle',             nom:'Colle carrelage flex grise 25kg',        unite:'sac',  prix:18.50,  rend:null, tags:['colle','carrelage','flex','grise'] },
  { ref:'COLLE_FB', fam:'Carrelage', sfam:'Colle',             nom:'Colle carrelage flex blanche 25kg',      unite:'sac',  prix:21.00,  rend:null, tags:['colle','carrelage','blanche','faience'] },
  { ref:'JOINT_B',  fam:'Carrelage', sfam:'Joint',             nom:'Joint carrelage blanc 5kg',              unite:'sac',  prix:8.90,   rend:null, tags:['joint','carrelage','blanc'] },
  { ref:'JOINT_G',  fam:'Carrelage', sfam:'Joint',             nom:'Joint carrelage gris 5kg',               unite:'sac',  prix:8.90,   rend:null, tags:['joint','carrelage','gris'] },
  { ref:'JOINT_EP', fam:'Carrelage', sfam:'Joint',             nom:'Joint époxy carrelage 2kg',              unite:'sac',  prix:24.50,  rend:null, tags:['joint','epoxy','resistant','chimique'] },
  { ref:'SPEC_IMP', fam:'Carrelage', sfam:'Étanchéité',        nom:'Imperméabilisant SPEC sol-mur 15kg',     unite:'sac',  prix:42.00,  rend:null, tags:['spec','etancheite','douche','sdb'] },
  { ref:'BAND_SPEC',fam:'Carrelage', sfam:'Étanchéité',        nom:'Bande SPEC tissu étanchéité 10ml',       unite:'rl',   prix:12.80,  rend:null, tags:['bande','spec','etancheite'] },
  { ref:'PROF_CAR', fam:'Carrelage', sfam:'Profilé',           nom:'Profilé carrelage alu 8mm 2.5m',         unite:'u',    prix:5.40,   rend:null, tags:['profile','alu','carrelage','finition'] },
  { ref:'CROIS_2',  fam:'Carrelage', sfam:'Accessoire',        nom:'Croisillons 2mm boite 500u',             unite:'boite',prix:4.20,   rend:null, tags:['croisillons','joint','pose'] },
  { ref:'NIVELEUR', fam:'Carrelage', sfam:'Accessoire',        nom:'Système niveleur boite 100u + 200 clips',unite:'lot',  prix:18.90,  rend:null, tags:['niveleur','nivelement','grand format'] },
  { ref:'DECO_SOL', fam:'Carrelage', sfam:'Désolidarisation',  nom:'Natte désolidarisation 1×10m',           unite:'u',    prix:28.00,  rend:10,   tags:['natte','desolidarisation','chauffage sol'] },

  // ══════════════════════════════════════════════════════════
  //  PORTES INTÉRIEURES
  // ══════════════════════════════════════════════════════════
  { ref:'BP_STD',   fam:'Porte intérieure', sfam:'Bloc-porte',nom:'Bloc-porte standard HU 204×83cm',        unite:'u',    prix:145.00, rend:null, tags:['bloc porte','porte','interieure','standard'] },
  { ref:'BP_ISO',   fam:'Porte intérieure', sfam:'Bloc-porte',nom:'Bloc-porte isolant phonique HU 204×83',  unite:'u',    prix:220.00, rend:null, tags:['bloc porte','phonique','isolation'] },
  { ref:'BP_CF30',  fam:'Porte intérieure', sfam:'Coupe-feu',  nom:'Bloc-porte coupe-feu CF30 204×83cm',    unite:'u',    prix:380.00, rend:null, tags:['coupe feu','cf30','securite','feu'] },
  { ref:'BP_CF60',  fam:'Porte intérieure', sfam:'Coupe-feu',  nom:'Bloc-porte coupe-feu CF60 204×83cm',    unite:'u',    prix:520.00, rend:null, tags:['coupe feu','cf60','erp','securite'] },
  { ref:'BP_CF90',  fam:'Porte intérieure', sfam:'Coupe-feu',  nom:'Bloc-porte coupe-feu CF90 204×83cm',    unite:'u',    prix:680.00, rend:null, tags:['coupe feu','cf90','erp'] },
  { ref:'HUIS_MET', fam:'Porte intérieure', sfam:'Huisserie',  nom:'Huisserie métallique réglable 72/100',  unite:'u',    prix:38.00,  rend:null, tags:['huisserie','metal','reglable'] },
  { ref:'HUIS_BOI', fam:'Porte intérieure', sfam:'Huisserie',  nom:'Huisserie bois MDF blanc 204×83cm',     unite:'u',    prix:28.00,  rend:null, tags:['huisserie','bois','mdf'] },
  { ref:'SERRURE',  fam:'Porte intérieure', sfam:'Quincaillerie',nom:'Serrure encastrée + poignée chrome',  unite:'u',    prix:24.50,  rend:null, tags:['serrure','poignee','quincaillerie'] },
  { ref:'PAUMELLE', fam:'Porte intérieure', sfam:'Quincaillerie',nom:'Paumelles alu 3 pièces par porte',    unite:'lot',  prix:8.90,   rend:null, tags:['paumelles','charnieres','porte'] },
  { ref:'FERME_P',  fam:'Porte intérieure', sfam:'Ferme-porte',nom:'Ferme-porte hydraulique EN3',           unite:'u',    prix:42.00,  rend:null, tags:['ferme porte','hydraulique','coupe feu'] },
  { ref:'PORTE_COU',fam:'Porte intérieure', sfam:'Coulissante',nom:'Porte coulissante galandage 204×83',    unite:'u',    prix:185.00, rend:null, tags:['coulissante','galandage','espace'] },
  { ref:'SEUIL',    fam:'Porte intérieure', sfam:'Accessoire', nom:'Seuil de porte alu 83cm',               unite:'u',    prix:12.80,  rend:null, tags:['seuil','porte','finition'] },

  // ══════════════════════════════════════════════════════════
  //  FENÊTRES & MENUISERIES EXT.
  // ══════════════════════════════════════════════════════════
  { ref:'FEN_PVC',  fam:'Menuiserie ext.', sfam:'Fenêtre',    nom:'Fenêtre PVC 2 vantaux 120×115cm DV',    unite:'u',    prix:320.00, rend:null, tags:['fenetre','pvc','double vitrage'] },
  { ref:'FEN_ALU',  fam:'Menuiserie ext.', sfam:'Fenêtre',    nom:'Fenêtre alu 2 vantaux 120×115cm TV',    unite:'u',    prix:580.00, rend:null, tags:['fenetre','alu','triple vitrage'] },
  { ref:'FEN_TOIT', fam:'Menuiserie ext.', sfam:'Velux',      nom:'Fenêtre de toit Velux 78×98cm',         unite:'u',    prix:420.00, rend:null, tags:['velux','toit','fenetre de toit'] },
  { ref:'PF_PVC',   fam:'Menuiserie ext.', sfam:'Porte-fenêtre',nom:'Porte-fenêtre PVC 2 vantaux 215×120', unite:'u',    prix:480.00, rend:null, tags:['porte fenetre','pvc','terrasse'] },
  { ref:'MOUSSE_EX',fam:'Menuiserie ext.', sfam:'Accessoire', nom:'Mousse expansive cartouche 750ml',      unite:'u',    prix:8.90,   rend:null, tags:['mousse','expansive','fixation','calfeutrement'] },
  { ref:'JOINT_FAC',fam:'Menuiserie ext.', sfam:'Accessoire', nom:'Mastic facade gris cartouche 310ml',    unite:'u',    prix:6.40,   rend:null, tags:['mastic','facade','gris','etancheite'] },

  // ══════════════════════════════════════════════════════════
  //  MAIN D'ŒUVRE
  // ══════════════════════════════════════════════════════════
  { ref:'MO_PLAQ',  fam:"Main d'oeuvre", sfam:'Plaquiste',   nom:"Pose plaquiste cloison",                unite:'h',    prix:38.00,  rend:null, tags:['mo','main oeuvre','plaquiste','pose'] },
  { ref:'MO_JOINT', fam:"Main d'oeuvre", sfam:'Jointage',    nom:"Jointage / finition placo",             unite:'h',    prix:35.00,  rend:null, tags:['mo','jointage','finition'] },
  { ref:'MO_PEIN',  fam:"Main d'oeuvre", sfam:'Peinture',    nom:"Peinture intérieure",                   unite:'h',    prix:32.00,  rend:null, tags:['mo','peinture'] },
  { ref:'MO_ISOL',  fam:"Main d'oeuvre", sfam:'Isolation',   nom:"Pose isolation",                        unite:'h',    prix:30.00,  rend:null, tags:['mo','isolation','pose'] },
  { ref:'MO_SOL',   fam:"Main d'oeuvre", sfam:'Sol',         nom:"Pose revêtement sol",                   unite:'h',    prix:35.00,  rend:null, tags:['mo','sol','carrelage','parquet'] },
  { ref:'MO_CARR',  fam:"Main d'oeuvre", sfam:'Carrelage',   nom:"Pose carrelage / faïence",              unite:'h',    prix:40.00,  rend:null, tags:['mo','carrelage','faience'] },
  { ref:'MO_PORTE', fam:"Main d'oeuvre", sfam:'Menuiserie',  nom:"Pose bloc-porte",                       unite:'h',    prix:45.00,  rend:null, tags:['mo','porte','bloc porte'] },
  { ref:'MO_FEN',   fam:"Main d'oeuvre", sfam:'Menuiserie',  nom:"Pose fenêtre / porte-fenêtre",          unite:'h',    prix:50.00,  rend:null, tags:['mo','fenetre','menuiserie'] },
  { ref:'MO_PLAF',  fam:"Main d'oeuvre", sfam:'Plafond',     nom:"Pose plafond suspendu",                 unite:'h',    prix:38.00,  rend:null, tags:['mo','plafond','suspendu'] },

  // ══════════════════════════════════════════════════════════
  //  ÉLECTRICITÉ — NF C 15-100
  // ══════════════════════════════════════════════════════════
  // Câbles
  { ref:'CAB_15',    fam:'Électricité', sfam:'Câble',        nom:'Câble H07V-U 1.5mm² (éclairage) au ml',  unite:'ml',   prix:0.85,   rend:null, tags:['cable','1.5mm','eclairage','h07v'] },
  { ref:'CAB_25',    fam:'Électricité', sfam:'Câble',        nom:'Câble H07V-U 2.5mm² (prises) au ml',     unite:'ml',   prix:1.20,   rend:null, tags:['cable','2.5mm','prises','h07v'] },
  { ref:'CAB_4',     fam:'Électricité', sfam:'Câble',        nom:'Câble H07V-U 4mm² (lave-linge) au ml',   unite:'ml',   prix:1.80,   rend:null, tags:['cable','4mm','lave-linge','h07v'] },
  { ref:'CAB_6',     fam:'Électricité', sfam:'Câble',        nom:'Câble H07V-U 6mm² (four/induction) au ml',unite:'ml',  prix:2.50,   rend:null, tags:['cable','6mm','four','induction','h07v'] },
  { ref:'CAB_10',    fam:'Électricité', sfam:'Câble',        nom:'Câble H07V-U 10mm² (sortie compteur) au ml',unite:'ml',prix:3.80,   rend:null, tags:['cable','10mm','compteur','h07v'] },
  // Gaines
  { ref:'ICTA16',    fam:'Électricité', sfam:'Gaine',        nom:'Gaine ICTA 16mm (courante) au ml',        unite:'ml',   prix:0.45,   rend:null, tags:['gaine','icta','16mm','annelée'] },
  { ref:'ICTA20',    fam:'Électricité', sfam:'Gaine',        nom:'Gaine ICTA 20mm (passage câbles ép.) au ml',unite:'ml', prix:0.60,   rend:null, tags:['gaine','icta','20mm','annelée'] },
  // Disjoncteurs & protection
  { ref:'DISJ16',    fam:'Électricité', sfam:'Protection',   nom:'Disjoncteur modulaire 16A phase-neutre',  unite:'u',    prix:8.50,   rend:null, tags:['disjoncteur','16a','modulaire','tableau'] },
  { ref:'DISJ20',    fam:'Électricité', sfam:'Protection',   nom:'Disjoncteur modulaire 20A phase-neutre',  unite:'u',    prix:9.50,   rend:null, tags:['disjoncteur','20a','modulaire','cuisine'] },
  { ref:'DISJ32',    fam:'Électricité', sfam:'Protection',   nom:'Disjoncteur modulaire 32A phase-neutre',  unite:'u',    prix:12.00,  rend:null, tags:['disjoncteur','32a','four','induction','modulaire'] },
  { ref:'DIFF30MA',  fam:'Électricité', sfam:'Protection',   nom:'Différentiel 30mA type A 40A 2P',         unite:'u',    prix:25.00,  rend:null, tags:['differentiel','30ma','type a','protection','nfc15100'] },
  // Tableaux
  { ref:'TAB13',     fam:'Électricité', sfam:'Tableau',      nom:'Tableau électrique 13 modules encastré',  unite:'u',    prix:35.00,  rend:null, tags:['tableau','13 modules','coffret','electrique'] },
  { ref:'TAB26',     fam:'Électricité', sfam:'Tableau',      nom:'Tableau électrique 26 modules encastré',  unite:'u',    prix:55.00,  rend:null, tags:['tableau','26 modules','coffret','electrique'] },
  // Appareillage
  { ref:'PRISE2PT',  fam:'Électricité', sfam:'Appareillage', nom:'Prise de courant 2P+T 16A avec terre',    unite:'u',    prix:4.50,   rend:null, tags:['prise','2p+t','courant','16a','appareillage'] },
  { ref:'BLOC_PRISE',fam:'Électricité', sfam:'Appareillage', nom:'Bloc prise double 2×2P+T 16A',             unite:'u',    prix:7.80,   rend:null, tags:['prise','bloc prise','double','2p+t','courant','16a'] },
  { ref:'INTER_S',   fam:'Électricité', sfam:'Appareillage', nom:'Interrupteur simple unipolaire',           unite:'u',    prix:3.50,   rend:null, tags:['interrupteur','simple','commande','eclairage'] },
  { ref:'VA_VT',     fam:'Électricité', sfam:'Appareillage', nom:'Va-et-vient (double commande) paire',     unite:'u',    prix:5.50,   rend:null, tags:['va-et-vient','double','commande','vavt'] },
  { ref:'SPOT_LED',  fam:'Électricité', sfam:'Éclairage',    nom:'Spot LED encastré 10W 800lm 3000K',       unite:'u',    prix:12.00,  rend:null, tags:['spot','led','10w','800lm','encastre','eclairage'] },
  { ref:'BOITE_DER', fam:'Électricité', sfam:'Appareillage', nom:'Boîte de dérivation Ø60 IP40',            unite:'u',    prix:2.80,   rend:null, tags:['boite derivation','connexion','derivation'] },
  // MO
  { ref:'MO_ELEC',   fam:"Main d'oeuvre", sfam:'Électricité',nom:"Pose électricité / câblage",              unite:'h',    prix:45.00,  rend:null, tags:['mo','electricite','cablage','pose'] },

  // ══════════════════════════════════════════════════════════
  //  SANITAIRE
  // ══════════════════════════════════════════════════════════
  { ref:'RECV_8080',  fam:'Sanitaire', sfam:'Receveur',    nom:'Receveur de douche 80×80 extra-plat',       unite:'u',    prix:145.00, rend:null, tags:['receveur','douche','80x80','sdb'] },
  { ref:'DOUCHE_80',  fam:'Sanitaire', sfam:'Receveur',    nom:'Receveur douche standard 80×80 acrylique',  unite:'u',    prix:95.00,  rend:null, tags:['receveur','douche','80x80','sdb','acrylique','standard'] },
  { ref:'RECV_ITA',   fam:'Sanitaire', sfam:'Receveur',    nom:'Receveur douche italienne carrelable',       unite:'u',    prix:89.00,  rend:null, tags:['receveur','italienne','carrelable','sdb'] },
  { ref:'MITIG_THE',  fam:'Sanitaire', sfam:'Mitigeur',    nom:'Mitigeur thermostatique douche encastré',    unite:'u',    prix:185.00, rend:null, tags:['mitigeur','thermostatique','douche','encastre'] },
  { ref:'MITIG_LAV',  fam:'Sanitaire', sfam:'Mitigeur',    nom:'Mitigeur lavabo monocommande chromé',        unite:'u',    prix:45.00,  rend:null, tags:['mitigeur','lavabo','monocommande','chrome','salle de bain'] },
  { ref:'TUY_PER16',  fam:'Sanitaire', sfam:'Plomberie',   nom:'Tube PER barrier 16mm rouleau 50ml',        unite:'ml',   prix:0.95,   rend:null, tags:['per','tube','16mm','alimentation','eau','plomberie'] },
  { ref:'MEUB_VAS80', fam:'Sanitaire', sfam:'Meuble',      nom:'Meuble vasque suspendu 80cm + lavabo',       unite:'u',    prix:320.00, rend:null, tags:['meuble','vasque','80cm','salle de bain'] },
  { ref:'MIR_LED80',  fam:'Sanitaire', sfam:'Miroir',      nom:'Miroir LED 80×60cm anti-buée',               unite:'u',    prix:195.00, rend:null, tags:['miroir','led','anti-buee','sdb'] },
  { ref:'WC_SUS',     fam:'Sanitaire', sfam:'WC',          nom:'WC suspendu avec bâti-support et plaque',    unite:'u',    prix:280.00, rend:null, tags:['wc','suspendu','bati-support','sdb'] },
  { ref:'SECH_SER',   fam:'Sanitaire', sfam:'Chauffage',   nom:'Sèche-serviette électrique à inertie',       unite:'u',    prix:145.00, rend:null, tags:['seche-serviette','electrique','sdb','chauffage'] },
  { ref:'VMC_SF',     fam:'Sanitaire', sfam:'Ventilation', nom:'VMC simple flux hygroréglable type B',        unite:'u',    prix:185.00, rend:null, tags:['vmc','simple flux','hygro','ventilation','sdb'] },
  { ref:'PAROI_VER',  fam:'Sanitaire', sfam:'Paroi',       nom:'Paroi de douche pivotante 90cm verre 8mm',   unite:'u',    prix:245.00, rend:null, tags:['paroi','douche','verre','pivotante','sdb'] },

  // ══════════════════════════════════════════════════════════
  //  CLOISON SPÉCIALE
  // ══════════════════════════════════════════════════════════
  { ref:'OSS_ALU',    fam:'Cloison spéciale', sfam:'Ossature', nom:'Ossature aluminium cloison vitrée au ml', unite:'ml',   prix:45.00,  rend:null, tags:['ossature','aluminium','vitree','cloison'] },
  { ref:'VITR_10',    fam:'Cloison spéciale', sfam:'Vitrage',  nom:'Vitrage feuilleté sécurité 10mm',          unite:'m2',   prix:85.00,  rend:null, tags:['vitrage','feuillete','securite','10mm','cloison'] },
  { ref:'STORE_EL',   fam:'Cloison spéciale', sfam:'Store',    nom:'Store occultant motorisé intégré au m²',   unite:'m2',   prix:120.00, rend:null, tags:['store','occultant','motorise','vitree'] },
  { ref:'MOTEUR_ST',  fam:'Cloison spéciale', sfam:'Store',    nom:'Moteur store télécommandé 240V',           unite:'u',    prix:185.00, rend:null, tags:['moteur','store','telecommande','occultant'] },
  { ref:'JOINT_SIL',  fam:'Cloison spéciale', sfam:'Joint',    nom:'Joint silicone transparent vitré au ml',   unite:'ml',   prix:3.50,   rend:null, tags:['joint','silicone','vitree','etancheite'] },

  // ══════════════════════════════════════════════════════════
  //  MATÉRIAUX SPÉCIAUX
  // ══════════════════════════════════════════════════════════
  { ref:'POLYCARB_ALV', fam:'Matériaux spéciaux', sfam:'Polycarbonate', nom:'Polycarbonate alvéolaire 16mm (m²)',          unite:'m2',  prix:28.00,  rend:null, tags:['polycarbonate','alvéolaire','toiture','claustra'] },
  { ref:'PROF_ALU_U',   fam:'Matériaux spéciaux', sfam:'Profilé alu',   nom:'Profilé aluminium U 3m',                      unite:'u',   prix:12.00,  rend:null, tags:['profilé','alu','u','aluminium','fixation'] },
  { ref:'PROF_ALU_H',   fam:'Matériaux spéciaux', sfam:'Profilé alu',   nom:'Profilé aluminium H jonction 3m',             unite:'u',   prix:8.00,   rend:null, tags:['profilé','alu','h','jonction','aluminium'] },
  { ref:'RAIL_COUL',    fam:'Matériaux spéciaux', sfam:'Coulissant',    nom:'Rail coulissant aluminium 3m',                unite:'u',   prix:45.00,  rend:null, tags:['rail','coulissant','alu','porte','galandage'] },
  { ref:'ROULE_COUL',   fam:'Matériaux spéciaux', sfam:'Coulissant',    nom:'Roulette coulissante (u)',                    unite:'u',   prix:18.00,  rend:null, tags:['roulette','coulissant','porte','sliding'] },
  { ref:'STOP_PORTE',   fam:'Matériaux spéciaux', sfam:'Coulissant',    nom:'Stop porte coulissante (u)',                  unite:'u',   prix:8.00,   rend:null, tags:['stop','porte','coulissant','butée'] },
  { ref:'VERRE_TEMP',   fam:'Matériaux spéciaux', sfam:'Verre',         nom:'Verre trempé 8mm (m²)',                       unite:'m2',  prix:95.00,  rend:null, tags:['verre','trempé','8mm','securite','cloison'] },
  { ref:'GRILLAGE_S',   fam:'Matériaux spéciaux', sfam:'Clôture',       nom:'Grillage soudé galvanisé (m²)',               unite:'m2',  prix:12.00,  rend:null, tags:['grillage','soudé','galvanisé','clôture','extérieur'] },
  { ref:'BRISE_VUE',    fam:'Matériaux spéciaux', sfam:'Clôture',       nom:'Brise-vue PVC (m²)',                          unite:'m2',  prix:8.00,   rend:null, tags:['brise-vue','pvc','intimite','extérieur','clôture'] },
  { ref:'POTEAU_ALU',   fam:'Matériaux spéciaux', sfam:'Clôture',       nom:'Poteau aluminium 60×60 3m (u)',               unite:'u',   prix:45.00,  rend:null, tags:['poteau','alu','aluminium','60x60','clôture','extérieur'] },

  // ══════════════════════════════════════════════════════════
  //  EXTÉRIEUR & PAYSAGISME
  // ══════════════════════════════════════════════════════════
  { ref:'GRAVE_031',    fam:'Extérieur', sfam:'Terrassement',  nom:'Grave 0/31.5 big bag 1 m³',                  unite:'u',   prix:45.00,  rend:null, tags:['grave','remblai','big bag','terrassement'] },
  { ref:'GEOTEX',       fam:'Extérieur', sfam:'Terrassement',  nom:'Géotextile 2 m large (ml)',                  unite:'ml',  prix:1.80,   rend:null, tags:['géotextile','terrassement','filtrant','drainage'] },
  { ref:'BETON_DES',    fam:'Extérieur', sfam:'Maçonnerie',    nom:'Béton désactivé (m²)',                       unite:'m2',  prix:45.00,  rend:null, tags:['béton','désactivé','extérieur','allée','terrasse'] },
  { ref:'DALLE_BET',    fam:'Extérieur', sfam:'Revêtement',    nom:'Dalle béton 40×40 (u)',                      unite:'u',   prix:3.20,   rend:0.16, tags:['dalle','béton','40x40','dallage','extérieur'] },
  { ref:'DALLE_PIE',    fam:'Extérieur', sfam:'Revêtement',    nom:'Dalle pierre naturelle (m²)',                unite:'m2',  prix:65.00,  rend:null, tags:['pierre','naturelle','dallage','extérieur','terrasse'] },
  { ref:'TERR_BOI',     fam:'Extérieur', sfam:'Terrasse',      nom:'Terrasse bois pin traité (m²)',              unite:'m2',  prix:35.00,  rend:null, tags:['terrasse','bois','pin','traité','extérieur'] },
  { ref:'TERR_COMP',    fam:'Extérieur', sfam:'Terrasse',      nom:'Terrasse composite (m²)',                    unite:'m2',  prix:55.00,  rend:null, tags:['terrasse','composite','extérieur','entretien faible'] },
  { ref:'GRAVIER_D',    fam:'Extérieur', sfam:'Revêtement',    nom:'Gravier décoratif 8/16 (sac 25 kg)',         unite:'sac', prix:8.50,   rend:null, tags:['gravier','décoratif','allée','extérieur','8-16'] },
  { ref:'BORDURE_B',    fam:'Extérieur', sfam:'Revêtement',    nom:'Bordure béton T2 (u)',                       unite:'u',   prix:3.80,   rend:null, tags:['bordure','béton','t2','allée','jardin'] },
  { ref:'POTEAU_CLO',   fam:'Extérieur', sfam:'Clôture',       nom:'Poteau clôture 60×60 H2m (u)',               unite:'u',   prix:18.00,  rend:null, tags:['poteau','clôture','alu','aluminium','60x60'] },
  { ref:'GRILLAGE',     fam:'Extérieur', sfam:'Clôture',       nom:'Grillage soudé 1.5m (ml)',                   unite:'ml',  prix:8.50,   rend:null, tags:['grillage','soudé','clôture','extérieur','galvanisé'] },
  { ref:'PANNEAU_RIG',  fam:'Extérieur', sfam:'Clôture',       nom:'Panneau rigide gris 2m (u)',                 unite:'u',   prix:28.00,  rend:null, tags:['panneau','rigide','gris','clôture','rigide'] },
  { ref:'PORTAIL_ALU',  fam:'Extérieur', sfam:'Portail',       nom:'Portail alu battant 3m (u)',                 unite:'u',   prix:450.00, rend:null, tags:['portail','alu','aluminium','battant','3m'] },
  { ref:'GAZON_GR',     fam:'Extérieur', sfam:'Paysagisme',    nom:'Gazon graines 1 kg (u)',                     unite:'u',   prix:12.00,  rend:null, tags:['gazon','graines','semis','pelouse','paysagisme'] },
  { ref:'PAILLAGE',     fam:'Extérieur', sfam:'Paysagisme',    nom:'Paillage végétal 70 L (sac)',                unite:'sac', prix:8.90,   rend:null, tags:['paillage','végétal','70L','jardin','paysagisme'] },
  { ref:'PLANT_HAIE',   fam:'Extérieur', sfam:'Paysagisme',    nom:'Plant de haie (u)',                          unite:'u',   prix:4.50,   rend:null, tags:['plant','haie','paysagisme','arbuste','jardin'] },
  { ref:'TERRE_VEG',    fam:'Extérieur', sfam:'Paysagisme',    nom:'Terre végétale 40 L (sac)',                  unite:'sac', prix:5.20,   rend:null, tags:['terre','végétale','40L','plantation','paysagisme'] },

  // ══════════════════════════════════════════════════════════
  //  PRESTATIONS PLAQUISTERIE (Pareto — ce que l'artisan facture)
  // ══════════════════════════════════════════════════════════
  { ref:'MO_CLOIS',    fam:'Prestations Plaquisterie', sfam:'Cloison',   nom:'Pose cloison M48 BA13 (au ml)',          unite:'ml',   prix:35.00,  rend:null, tags:['prestation','cloison','plaquiste','pose','m48','ba13'] },
  { ref:'PREST_PLAF',  fam:'Prestations Plaquisterie', sfam:'Plafond',   nom:'Pose plafond suspendu (au m²)',          unite:'m2',   prix:28.00,  rend:null, tags:['prestation','plafond','suspendu','faux plafond','pose'] },
  { ref:'MO_DOUB',     fam:'Prestations Plaquisterie', sfam:'Doublage',  nom:'Pose doublage (au m²)',                  unite:'m2',   prix:22.00,  rend:null, tags:['prestation','doublage','isolation','plaquiste','pose'] },
  { ref:'PREST_JOINT', fam:'Prestations Plaquisterie', sfam:'Jointage',  nom:'Jointage + finition placo (au m²)',     unite:'m2',   prix:18.00,  rend:null, tags:['prestation','jointage','finition','placo','bande','enduit'] },
  { ref:'MO_DEMO',     fam:'Prestations Plaquisterie', sfam:'Démolition',nom:'Démolition cloison (au m²)',             unite:'m2',   prix:15.00,  rend:null, tags:['prestation','demolition','cloison','depose'] },

  // ══════════════════════════════════════════════════════════
  //  PRESTATIONS PEINTURE
  // ══════════════════════════════════════════════════════════
  { ref:'MO_PEIN_MUR',  fam:'Prestations Peinture', sfam:'Murs',      nom:'Peinture murs 2 couches (au m²)',         unite:'m2',   prix:12.00,  rend:null, tags:['prestation','peinture','murs','2 couches','pose'] },
  { ref:'MO_PEIN_PLAF', fam:'Prestations Peinture', sfam:'Plafond',   nom:'Peinture plafond 2 couches (au m²)',      unite:'m2',   prix:15.00,  rend:null, tags:['prestation','peinture','plafond','2 couches'] },
  { ref:'MO_APPRET',    fam:'Prestations Peinture', sfam:'Apprêt',    nom:'Apprêt + rebouchage (au m²)',             unite:'m2',   prix:8.00,   rend:null, tags:['prestation','appret','rebouchage','preparation','peinture'] },
  { ref:'MO_PEIN_BOIS', fam:'Prestations Peinture', sfam:'Boiseries', nom:'Peinture boiseries (au ml)',              unite:'ml',   prix:8.00,   rend:null, tags:['prestation','peinture','boiseries','huisseries','ml'] },

  // ══════════════════════════════════════════════════════════
  //  PRESTATIONS ÉLECTRICITÉ
  // ══════════════════════════════════════════════════════════
  { ref:'MO_TABLEAU',   fam:'Prestations Électricité', sfam:'Tableau',   nom:'Pose tableau électrique (u)',           unite:'u',    prix:250.00, rend:null, tags:['prestation','tableau','electrique','coffret','pose','nfc15100'] },
  { ref:'MO_CIRCUIT',   fam:'Prestations Électricité', sfam:'Câblage',   nom:'Câblage circuit (au ml)',               unite:'ml',   prix:8.00,   rend:null, tags:['prestation','cable','circuit','cablage','electricite'] },
  { ref:'MO_PRISE',     fam:'Prestations Électricité', sfam:'Appareillage',nom:'Pose prise/interrupteur (u)',         unite:'u',    prix:25.00,  rend:null, tags:['prestation','prise','interrupteur','appareillage','pose','electricite'] },
  { ref:'MO_SPOT',      fam:'Prestations Électricité', sfam:'Éclairage', nom:'Pose spot encastrable (u)',             unite:'u',    prix:35.00,  rend:null, tags:['prestation','spot','led','encastre','eclairage','pose'] },
  { ref:'MO_BAND_LED',  fam:'Prestations Électricité', sfam:'Éclairage', nom:'Pose bande LED (au ml)',                unite:'ml',   prix:15.00,  rend:null, tags:['prestation','bande led','led','eclairage','pose','ml'] },

  // ══════════════════════════════════════════════════════════
  //  PRESTATIONS PLOMBERIE
  // ══════════════════════════════════════════════════════════
  { ref:'MO_ALIM',      fam:'Prestations Plomberie', sfam:'Alimentation',nom:'Alimentation eau (au ml)',              unite:'ml',   prix:25.00,  rend:null, tags:['prestation','alimentation','eau','per','plomberie'] },
  { ref:'MO_EVAC',      fam:'Prestations Plomberie', sfam:'Évacuation',  nom:'Évacuation (au ml)',                    unite:'ml',   prix:20.00,  rend:null, tags:['prestation','evacuation','eaux usees','plomberie','pvc'] },
  { ref:'MO_SANIT',     fam:'Prestations Plomberie', sfam:'Sanitaire',   nom:'Pose sanitaire (u)',                    unite:'u',    prix:85.00,  rend:null, tags:['prestation','sanitaire','wc','lavabo','pose','plomberie'] },
  { ref:'MO_DOUCHE',    fam:'Prestations Plomberie', sfam:'Douche',      nom:'Pose douche complète (u)',              unite:'u',    prix:350.00, rend:null, tags:['prestation','douche','receveur','paroi','plomberie','pose'] },
  { ref:'MO_CHAUFFE',   fam:'Prestations Plomberie', sfam:'Chauffage',   nom:'Pose chauffe-eau (u)',                  unite:'u',    prix:185.00, rend:null, tags:['prestation','chauffe-eau','ballon','pose','plomberie'] },

  // ══════════════════════════════════════════════════════════
  //  PRESTATIONS MAÇONNERIE
  // ══════════════════════════════════════════════════════════
  { ref:'MO_MURET',     fam:'Prestations Maçonnerie', sfam:'Montage',    nom:'Montage parpaings (au m²)',             unite:'m2',   prix:45.00,  rend:null, tags:['prestation','maçonnerie','parpaings','montage','mur'] },
  { ref:'MO_CHAPE',     fam:'Prestations Maçonnerie', sfam:'Chape',      nom:'Chape (au m²)',                         unite:'m2',   prix:18.00,  rend:null, tags:['prestation','chape','beton','sol','maçonnerie'] },
  { ref:'MO_ENDUIT',    fam:'Prestations Maçonnerie', sfam:'Enduit',     nom:'Enduit façade (au m²)',                 unite:'m2',   prix:25.00,  rend:null, tags:['prestation','enduit','facade','maçonnerie','ravalement'] },
  { ref:'MO_DEMO_MUR',  fam:'Prestations Maçonnerie', sfam:'Démolition', nom:'Démolition mur (au m²)',               unite:'m2',   prix:35.00,  rend:null, tags:['prestation','demolition','mur','maçonnerie','casse'] },
  { ref:'MO_TERR',      fam:'Prestations Maçonnerie', sfam:'Terrassement',nom:'Terrassement manuel (au m³)',          unite:'m3',   prix:45.00,  rend:null, tags:['prestation','terrassement','fouille','maçonnerie','manuel'] },

  // ══════════════════════════════════════════════════════════
  //  PRESTATIONS CARRELAGE
  // ══════════════════════════════════════════════════════════
  { ref:'MO_CARR_SOL',  fam:'Prestations Carrelage', sfam:'Sol',         nom:'Pose carrelage sol (au m²)',            unite:'m2',   prix:35.00,  rend:null, tags:['prestation','carrelage','sol','pose','colle'] },
  { ref:'MO_CARR_MUR',  fam:'Prestations Carrelage', sfam:'Mur',         nom:'Pose faïence mur (au m²)',             unite:'m2',   prix:38.00,  rend:null, tags:['prestation','faience','mur','carrelage','pose','sdb'] },
  { ref:'MO_DEPOSE',    fam:'Prestations Carrelage', sfam:'Démolition',  nom:'Dépose ancien carrelage (au m²)',       unite:'m2',   prix:15.00,  rend:null, tags:['prestation','depose','carrelage','demolition','ancien'] },
  { ref:'MO_JOINT_C',   fam:'Prestations Carrelage', sfam:'Jointoiement',nom:'Rejointoiement (au m²)',               unite:'m2',   prix:12.00,  rend:null, tags:['prestation','rejointoiement','joint','carrelage','finition'] },

  // ══════════════════════════════════════════════════════════
  //  PRESTATIONS SOL
  // ══════════════════════════════════════════════════════════
  { ref:'MO_LVT',       fam:'Prestations Sol', sfam:'LVT',              nom:'Pose LVT click (au m²)',                 unite:'m2',   prix:12.00,  rend:null, tags:['prestation','lvt','vinyle','click','sol','pose'] },
  { ref:'MO_PARQUET',   fam:'Prestations Sol', sfam:'Parquet',          nom:'Pose parquet (au m²)',                   unite:'m2',   prix:18.00,  rend:null, tags:['prestation','parquet','bois','stratifie','sol','pose'] },
  { ref:'MO_PLINTHE',   fam:'Prestations Sol', sfam:'Plinthes',         nom:'Pose plinthes (au ml)',                  unite:'ml',   prix:5.00,   rend:null, tags:['prestation','plinthes','finition','sol','ml'] },
  { ref:'MO_RAGREAGE',  fam:'Prestations Sol', sfam:'Préparation',      nom:'Ragréage (au m²)',                       unite:'m2',   prix:8.00,   rend:null, tags:['prestation','ragreage','preparation','sol','beton'] },

  // ══════════════════════════════════════════════════════════
  //  PRESTATIONS EXTÉRIEUR
  // ══════════════════════════════════════════════════════════
  { ref:'MO_TERR_EXT',  fam:'Prestations Extérieur', sfam:'Terrassement',nom:'Terrassement engin (au m³)',             unite:'m3',   prix:25.00,  rend:null, tags:['prestation','terrassement','engin','exterieur','fouille'] },
  { ref:'MO_CLOTURE',   fam:'Prestations Extérieur', sfam:'Clôture',    nom:'Pose clôture (au ml)',                   unite:'ml',   prix:35.00,  rend:null, tags:['prestation','cloture','pose','grillage','exterieur'] },
  { ref:'MO_DALLE',     fam:'Prestations Extérieur', sfam:'Dallage',    nom:'Pose dallage (au m²)',                   unite:'m2',   prix:45.00,  rend:null, tags:['prestation','dalle','dallage','exterieur','terrasse','pose'] },
  { ref:'MO_TERR_BOI',  fam:'Prestations Extérieur', sfam:'Terrasse',   nom:'Pose terrasse bois (au m²)',             unite:'m2',   prix:55.00,  rend:null, tags:['prestation','terrasse','bois','composite','exterieur','pose'] },
  { ref:'MO_GAZON',     fam:'Prestations Extérieur', sfam:'Paysagisme', nom:'Engazonnement (au m²)',                  unite:'m2',   prix:4.00,   rend:null, tags:['prestation','gazon','pelouse','engazonnement','paysagisme'] },
  { ref:'MO_HAIE',      fam:'Prestations Extérieur', sfam:'Paysagisme', nom:'Plantation haie (au ml)',                unite:'ml',   prix:12.00,  rend:null, tags:['prestation','haie','plantation','arbuste','paysagisme'] },
  { ref:'MO_TONTE',     fam:'Prestations Extérieur', sfam:'Entretien',  nom:'Tonte pelouse (au m²)',                  unite:'m2',   prix:0.80,   rend:null, tags:['prestation','tonte','pelouse','gazon','entretien','paysagisme'] },
  { ref:'MO_TAILLE',    fam:'Prestations Extérieur', sfam:'Entretien',  nom:'Taillage haie (au ml)',                  unite:'ml',   prix:3.50,   rend:null, tags:['prestation','taille','haie','entretien','paysagisme'] },
  { ref:'MO_ELAG',      fam:'Prestations Extérieur', sfam:'Élagage',    nom:'Élagage arbre (u)',                      unite:'u',    prix:120.00, rend:null, tags:['prestation','elagage','arbre','abattage','paysagisme'] },

  // ══════════════════════════════════════════════════════════
  //  PRESTATIONS DÉMOLITION / LOGISTIQUE CHANTIER
  // ══════════════════════════════════════════════════════════
  { ref:'MO_GRAV',      fam:'Prestations Démolition', sfam:'Évacuation', nom:'Évacuation gravats (au m³)',            unite:'m3',   prix:45.00,  rend:null, tags:['prestation','gravats','evacuation','demolition','chantier'] },
  { ref:'MO_BENNE',     fam:'Prestations Démolition', sfam:'Location',   nom:'Location benne 7m³ (j)',               unite:'j',    prix:180.00, rend:null, tags:['prestation','benne','location','gravats','chantier'] },
  { ref:'MO_PROTECT',   fam:'Prestations Démolition', sfam:'Protection', nom:'Protection chantier (forfait)',         unite:'forfait',prix:150.00,rend:null, tags:['prestation','protection','chantier','plastique','bache'] },

  // ══════════════════════════════════════════════════════════
  //  PEINTURE & APPRÊTS (20/80 Peintre)
  // ══════════════════════════════════════════════════════════
  { ref:'PEINBL10', fam:'Peinture', sfam:'Blanc mat', nom:'Peinture acrylique blanc mat 10L', unite:'seau', prix:42.00, rend:10, tags:['peinture','blanc','mat','interieur'] },
  { ref:'PEINBL5',  fam:'Peinture', sfam:'Blanc mat', nom:'Peinture acrylique blanc mat 5L',  unite:'seau', prix:24.00, rend:5,  tags:['peinture','blanc','mat'] },
  { ref:'PEINSAT10',fam:'Peinture', sfam:'Satinée',   nom:'Peinture satinée blanc 10L',       unite:'seau', prix:52.00, rend:10, tags:['peinture','satin','lessivable'] },
  { ref:'APPRMUR',  fam:'Peinture', sfam:'Apprêt',    nom:'Apprêt fixateur murs 10L',         unite:'seau', prix:28.00, rend:10, tags:['appret','fixateur','mur'] },
  { ref:'SOUSCOUCHE',fam:'Peinture',sfam:'Apprêt',    nom:'Sous-couche universelle 5L',       unite:'seau', prix:22.00, rend:6,  tags:['sous-couche','appret'] },
  { ref:'TOILVERRE',fam:'Peinture', sfam:'Toile',     nom:'Toile de verre 25m² rouleau',      unite:'roul', prix:18.50, rend:25, tags:['toile','verre','renfort'] },
  { ref:'ENDUPRO',  fam:'Peinture', sfam:'Enduit',    nom:'Enduit de lissage pâte 15kg',      unite:'seau', prix:14.50, rend:15, tags:['enduit','lissage','finition'] },
  { ref:'ENDUFIB',  fam:'Peinture', sfam:'Enduit',    nom:'Enduit fibre 25kg',                unite:'sac',  prix:12.80, rend:20, tags:['enduit','fibre','plafond'] },
  { ref:'PEINEXT5', fam:'Peinture', sfam:'Façade',    nom:'Peinture façade acrylique 5L',     unite:'seau', prix:38.00, rend:6,  tags:['facade','exterieur','peinture'] },
  { ref:'BCHROULE', fam:'Peinture', sfam:'Outil',     nom:'Rouleau laine 180mm + cage',       unite:'u',    prix:4.20,  rend:null, tags:['rouleau','outil','peinture'] },

  // ══════════════════════════════════════════════════════════
  //  MAÇONNERIE (20/80 Maçon)
  // ══════════════════════════════════════════════════════════
  { ref:'PARPA20',  fam:'Maçonnerie', sfam:'Parpaing', nom:'Parpaing creux 20×20×50cm',       unite:'u',    prix:1.85,  rend:null, tags:['parpaing','20cm','mur'] },
  { ref:'PARPA15',  fam:'Maçonnerie', sfam:'Parpaing', nom:'Parpaing creux 15×20×50cm',       unite:'u',    prix:1.45,  rend:null, tags:['parpaing','15cm'] },
  { ref:'MORTJOINT',fam:'Maçonnerie', sfam:'Mortier',  nom:'Mortier joint parpaing 35kg',     unite:'sac',  prix:8.50,  rend:null, tags:['mortier','joint','maconnerie'] },
  { ref:'BETPRET',  fam:'Maçonnerie', sfam:'Béton',    nom:'Béton prêt à l\'emploi 35kg',     unite:'sac',  prix:6.80,  rend:null, tags:['beton','dalle','fondation'] },
  { ref:'CIMENT',   fam:'Maçonnerie', sfam:'Liant',    nom:'Ciment gris CEM II 35kg',         unite:'sac',  prix:7.20,  rend:null, tags:['ciment','liant'] },
  { ref:'CHAUX',    fam:'Maçonnerie', sfam:'Liant',    nom:'Chaux hydraulique NHL3.5 35kg',   unite:'sac',  prix:12.40, rend:null, tags:['chaux','enduit','facade'] },
  { ref:'GRAVELON', fam:'Maçonnerie', sfam:'Granulat', nom:'Gravillons 6/14 big bag 1T',      unite:'bb',   prix:85.00, rend:null, tags:['gravillon','granulat','drainage'] },
  { ref:'SABLE',    fam:'Maçonnerie', sfam:'Granulat', nom:'Sable de rivière big bag 1T',     unite:'bb',   prix:65.00, rend:null, tags:['sable','granulat'] },
  { ref:'BRIQUE22', fam:'Maçonnerie', sfam:'Brique',   nom:'Brique monomur 22cm Porotherm',   unite:'u',    prix:2.80,  rend:null, tags:['brique','monomur','isolation'] },
  { ref:'ENDUFAC',  fam:'Maçonnerie', sfam:'Enduit',   nom:'Enduit de façade gris 25kg',      unite:'sac',  prix:14.20, rend:null, tags:['enduit','facade','gros-oeuvre'] },
  { ref:'RAGREA',   fam:'Maçonnerie', sfam:'Sol',      nom:'Ragréage autonivelant 25kg',      unite:'sac',  prix:18.50, rend:null, tags:['ragreage','sol','nivelage'] },

  // ══════════════════════════════════════════════════════════
  //  ÉLECTRICITÉ (20/80 Électricien) NF C15-100
  // ══════════════════════════════════════════════════════════
  { ref:'CAB15100', fam:'Électricité', sfam:'Câble',   nom:'Câble R2V 3G1.5mm² 100m',        unite:'roul', prix:48.00, rend:null, tags:['cable','1.5mm','eclairage','nf c15-100'] },
  { ref:'CAB25100', fam:'Électricité', sfam:'Câble',   nom:'Câble R2V 3G2.5mm² 100m',        unite:'roul', prix:72.00, rend:null, tags:['cable','2.5mm','prise','nf c15-100'] },
  { ref:'CAB6100',  fam:'Électricité', sfam:'Câble',   nom:'Câble R2V 3G6mm² 100m',          unite:'roul', prix:145.00,rend:null, tags:['cable','6mm','four','machine'] },
  { ref:'GAINGRAY', fam:'Électricité', sfam:'Gaine',   nom:'Gaine ICT grise D20 100m',       unite:'roul', prix:28.00, rend:null, tags:['gaine','ict','d20','encastre'] },
  { ref:'GAINFILM', fam:'Électricité', sfam:'Gaine',   nom:'Film renforcé ICD gris D20 50m',  unite:'roul', prix:18.00, rend:null, tags:['gaine','icd','film','cloison'] },
  { ref:'BOITAPP',  fam:'Électricité', sfam:'Boîte',   nom:'Boîte d\'appareillage D67 x10',  unite:'lot',  prix:8.50,  rend:null, tags:['boite','appareillage','cloison'] },
  { ref:'BOITDER',  fam:'Électricité', sfam:'Boîte',   nom:'Boîte de dérivation 80×80 x10',  unite:'lot',  prix:12.80, rend:null, tags:['boite','derivation'] },
  { ref:'DISJ16',   fam:'Électricité', sfam:'Tableau', nom:'Disjoncteur 16A courbe C',        unite:'u',    prix:8.20,  rend:null, tags:['disjoncteur','16a','tableau'] },
  { ref:'DISJ20',   fam:'Électricité', sfam:'Tableau', nom:'Disjoncteur 20A courbe C',        unite:'u',    prix:8.80,  rend:null, tags:['disjoncteur','20a','tableau'] },
  { ref:'TABLMOD',  fam:'Électricité', sfam:'Tableau', nom:'Tableau électrique 13 modules',   unite:'u',    prix:28.00, rend:null, tags:['tableau','13modules','encastre'] },

  // ══════════════════════════════════════════════════════════
  //  PLOMBERIE (20/80 Plombier) DTU 60.1
  // ══════════════════════════════════════════════════════════
  { ref:'TUBCUIV12',fam:'Plomberie', sfam:'Tube',      nom:'Tube cuivre écroui D12 barre 4m', unite:'ml',   prix:6.80,  rend:null, tags:['cuivre','d12','eau','dtu60'] },
  { ref:'TUBCUIV16',fam:'Plomberie', sfam:'Tube',      nom:'Tube cuivre écroui D16 barre 4m', unite:'ml',   prix:9.20,  rend:null, tags:['cuivre','d16','eau'] },
  { ref:'TUBPEX16', fam:'Plomberie', sfam:'Tube',      nom:'Tube PER/PEX D16 couronne 50m',   unite:'roul', prix:38.00, rend:null, tags:['pex','per','d16','plancher'] },
  { ref:'TUBPVC100',fam:'Plomberie', sfam:'Évacuation',nom:'Tube PVC évac D100 barre 4m',     unite:'u',    prix:18.50, rend:null, tags:['pvc','d100','evacuation','dtu64'] },
  { ref:'TUBPVC50', fam:'Plomberie', sfam:'Évacuation',nom:'Tube PVC évac D50 barre 4m',      unite:'u',    prix:8.20,  rend:null, tags:['pvc','d50','evacuation'] },
  { ref:'COUPLAGE', fam:'Plomberie', sfam:'Raccord',   nom:'Coude cuivre 90° D16 x10',        unite:'lot',  prix:12.50, rend:null, tags:['coude','raccord','cuivre'] },
  { ref:'ROBINET',  fam:'Plomberie', sfam:'Robinetterie',nom:'Robinet d\'arrêt quart de tour D16',unite:'u',prix:8.80, rend:null, tags:['robinet','arret','d16'] },
  { ref:'WC',       fam:'Plomberie', sfam:'Sanitaire', nom:'WC suspendu complet avec bâti',   unite:'u',    prix:185.00,rend:null, tags:['wc','suspendu','sanitaire'] },
  { ref:'LAVABO',   fam:'Plomberie', sfam:'Sanitaire', nom:'Lavabo céramique 60cm + robinet',  unite:'u',    prix:95.00, rend:null, tags:['lavabo','ceramique','sdb'] },

  // ══════════════════════════════════════════════════════════
  //  CARRELAGE (20/80 Carreleur)
  // ══════════════════════════════════════════════════════════
  { ref:'CARRE60',  fam:'Carrelage', sfam:'Sol',       nom:'Carrelage grès cérame 60×60cm gris',unite:'m²', prix:18.50, rend:1,    tags:['carrelage','60x60','sol','gres'] },
  { ref:'CARRE30',  fam:'Carrelage', sfam:'Mur',       nom:'Carrelage faïence mur 30×60cm blanc',unite:'m²',prix:12.80, rend:1,   tags:['faience','30x60','mur','sdb'] },
  { ref:'COLLEMAN', fam:'Carrelage', sfam:'Colle',     nom:'Colle carrelage C2TE Mapei 25kg',  unite:'sac', prix:18.50, rend:5,    tags:['colle','c2te','mapei','carrelage'] },
  { ref:'JOINTCAR', fam:'Carrelage', sfam:'Joint',     nom:'Joint carrelage Mapei Ultracolor 5kg',unite:'sac',prix:14.80,rend:null,tags:['joint','carrelage','mapei'] },
  { ref:'RAGRECAR', fam:'Carrelage', sfam:'Préparation',nom:'Ragréage fibré 25kg',             unite:'sac', prix:16.80, rend:6,    tags:['ragreage','sol','preparation'] },
  { ref:'CROIXESC', fam:'Carrelage', sfam:'Outil',     nom:'Croix d\'espacement 3mm x500',    unite:'lot',  prix:3.20,  rend:null, tags:['croix','espacement','pose'] },
  { ref:'IMPERCAR', fam:'Carrelage', sfam:'Étanchéité',nom:'Étanchéité sous carrelage 15kg',  unite:'seau', prix:28.00, rend:8,    tags:['etancheite','dtu52','sdb','douche'] },

  // ══════════════════════════════════════════════════════════
  //  MENUISERIE (20/80 Menuisier)
  // ══════════════════════════════════════════════════════════
  { ref:'PORTINT',  fam:'Menuiserie', sfam:'Porte',    nom:'Bloc porte intérieur 83×204cm isoplane',unite:'u',prix:85.00,rend:null,tags:['porte','interieur','isoplane'] },
  { ref:'PORTBLOC', fam:'Menuiserie', sfam:'Porte',    nom:'Bloc porte huisserie 83×204cm prépeint',unite:'u',prix:145.00,rend:null,tags:['porte','huisserie','prepeint'] },
  { ref:'RODAPIED', fam:'Menuiserie', sfam:'Plinthe',  nom:'Plinthe MDF peinte blanche 70mm 2.4m',unite:'ml',prix:4.20,rend:null,tags:['plinthe','mdf','blanc'] },
  { ref:'PARQUET',  fam:'Menuiserie', sfam:'Sol',      nom:'Parquet stratifié 8mm AC4 1.2m²/paq',unite:'m²',prix:14.50,rend:1,   tags:['parquet','stratifie','sol','ac4'] },
  { ref:'MOULURE',  fam:'Menuiserie', sfam:'Finition', nom:'Moulure cache-fil MDF 25×15mm 2.4m',unite:'ml', prix:2.80,  rend:null, tags:['moulure','cache-fil','finition'] },
  { ref:'CHEVRON',  fam:'Menuiserie', sfam:'Bois',     nom:'Chevron sapin 63×75mm 5m',          unite:'u',  prix:12.50, rend:null, tags:['chevron','charpente','sapin'] },

  // ══════════════════════════════════════════════════════════
  //  ISOLATION THERMIQUE & ACOUSTIQUE
  // ══════════════════════════════════════════════════════════
  { ref:'LV45',     fam:'Isolation', sfam:'Laine verre',nom:'Laine de verre Isover 45mm 14.4m²', unite:'roul',prix:28.50,rend:14.4,tags:['laine','verre','45mm','acoustique'] },
  { ref:'LV100',    fam:'Isolation', sfam:'Laine verre',nom:'Laine de verre Isover 100mm 6m²',  unite:'roul', prix:24.00, rend:6,   tags:['laine','verre','100mm','thermique'] },
  { ref:'LR60',     fam:'Isolation', sfam:'Laine roche',nom:'Laine de roche Rockwool 60mm 4m²', unite:'paq',  prix:22.50, rend:4,   tags:['laine','roche','60mm','feu'] },
  { ref:'PANRIG',   fam:'Isolation', sfam:'Rigide',     nom:'Panneau polystyrène expansé 100mm 1.2×0.6m',unite:'u',prix:8.80,rend:0.72,tags:['polystyrene','eps','thermique'] },
  { ref:'ITEXI',    fam:'Isolation', sfam:'Extérieur',  nom:'Panneau ITE laine roche façade 100mm',unite:'m²',prix:28.00,rend:1,   tags:['ite','facade','isolation','exterieur'] },
  { ref:'VAPEBARR', fam:'Isolation', sfam:'Pare-vapeur',nom:'Pare-vapeur polyéthylène 50m²',    unite:'roul', prix:42.00, rend:50,  tags:['pare-vapeur','etancheite','air'] },

  // ══════════════════════════════════════════════════════════
  //  FIXATIONS & VISSERIE (universel)
  // ══════════════════════════════════════════════════════════
  { ref:'VISPLAQ',  fam:'Fixation', sfam:'Vis plaque',  nom:'Vis plaque TF 3.5×35mm boite 1000',unite:'bte', prix:8.50,  rend:null, tags:['vis','plaque','tf','35mm'] },
  { ref:'VISPLAQ55',fam:'Fixation', sfam:'Vis plaque',  nom:'Vis plaque TF 3.5×55mm boite 500', unite:'bte', prix:7.20,  rend:null, tags:['vis','plaque','tf','55mm','double'] },
  { ref:'CHEVBETON',fam:'Fixation', sfam:'Cheville',    nom:'Cheville béton Fischer 8×50 x100',  unite:'bte', prix:18.50, rend:null, tags:['cheville','beton','fischer','8mm'] },
  { ref:'CHEVMOL',  fam:'Fixation', sfam:'Cheville',    nom:'Cheville molly M5×65 x50',          unite:'bte', prix:12.80, rend:null, tags:['cheville','molly','plaque','creux'] },
  { ref:'BOULONHM', fam:'Fixation', sfam:'Boulon',      nom:'Boulon HM M8×50 + écrou x25',       unite:'bte', prix:8.90,  rend:null, tags:['boulon','hm','m8','metal'] },
  { ref:'RONDELLE', fam:'Fixation', sfam:'Rondelle',    nom:'Rondelle large M8 zinguée x100',    unite:'bte', prix:4.20,  rend:null, tags:['rondelle','m8','zingue'] },
  { ref:'AGRAFES',  fam:'Fixation', sfam:'Agrafes',     nom:'Agrafes galvanisées 6mm boite 1000',unite:'bte', prix:6.80,  rend:null, tags:['agrafes','isolant','fixation'] },

  // ══════════════════════════════════════════════════════════
  //  PAYSAGISME / EXTÉRIEUR (20/80 Paysagiste)
  // ══════════════════════════════════════════════════════════
  { ref:'DALLBETO', fam:'Paysagisme', sfam:'Dalle',     nom:'Dalle béton grise 40×40×4cm',      unite:'u',   prix:3.20,  rend:0.16, tags:['dalle','beton','terrasse','exterieur'] },
  { ref:'GRAVIER',  fam:'Paysagisme', sfam:'Minéral',   nom:'Gravier décoratif blanc 20kg',     unite:'sac', prix:6.50,  rend:null, tags:['gravier','decoratif','blanc'] },
  { ref:'BORD_ALU', fam:'Paysagisme', sfam:'Bordure',   nom:'Bordure aluminium flexible 3m',    unite:'u',   prix:12.80, rend:null, tags:['bordure','alu','flexible','jardin'] },
  { ref:'GEOTEXTIL',fam:'Paysagisme', sfam:'Géotextile',nom:'Géotextile 100g/m² 2×25m',        unite:'roul',prix:28.00, rend:50,   tags:['geotextile','desherbage','drainage'] },
  { ref:'TERRASSE', fam:'Paysagisme', sfam:'Terrasse',  nom:'Lame terrasse composite 145×21mm 4m',unite:'ml',prix:18.50,rend:null, tags:['lame','composite','terrasse','bois'] },
  { ref:'GAZON_SEM',fam:'Paysagisme', sfam:'Végétal',   nom:'Semence gazon résistant 1kg 50m²', unite:'sac', prix:14.50, rend:50,   tags:['gazon','semence','pelouse'] },
];

// ── Familles pour les filtres ──────────────────────────────────
const FAMILLES = [...new Set(CATALOGUE.map(p => p.fam))];

// ── Enseignes valides par famille de produit ───────────────────
// Règle métier : montrer uniquement les distributeurs pertinents
const ENSEIGNES_PAR_FAMILLE = {
  // Plâtrerie / plaquisterie
  'Plaque plâtre':      ['LM','PDB','BD','BM','GED','CHAU','BCO','PRO','GIR','LPI','PP','BGM','TF','RP','SGD','PLA','KNF','SIN','ISV'],
  'Carreau plâtre':     ['LM','PDB','BD','BM','GED','CHAU','BCO','PRO','GIR','LPI','PP','BGM','TF','SGD','PLA','KNF','SIN'],
  'Ossature métal':     ['LM','PDB','BD','BM','GED','CHAU','BCO','PRO','GIR','LPI','PP','BGM','TF','LEG','DC','SGD'],
  'Jointage':           ['LM','PDB','BD','BM','GED','CHAU','BCO','PRO','GIR','LPI','PP','BGM','TF','SGD','PLA','KNF','SIN','MAP','SIK'],
  'Isolation':          ['LM','PDB','BD','BM','GED','CHAU','BCO','PRO','GIR','LPI','PP','BGM','TF','SGD','ISV','KNF','PLA','SIN','RKW'],
  'Cloison spéciale':   ['LM','PDB','BD','BM','GED','CHAU','BCO','PRO','GIR','LPI','PP','BGM','TF','SGD','PLA','KNF','SIN'],
  // Électricité
  'Électricité':        ['REX','SON','WUR','LM','BD','LEG','DC','SOC'],
  // Plomberie / sanitaire / chauffage
  'Sanitaire':          ['PP','CHAU','BCO','REX','SON','LM','BD','LAR','SOC'],
  // Peinture / enduit
  'Peinture':           ['LM','BD','BM','PP','GED','GIR','BCO','BGM','WEB','PAR','MAP','SIK'],
  'Accessoire peinture':['LM','BD','BM','PP','GED','GIR','BCO','BGM','WEB'],
  // Revêtements sol / carrelage
  'Revêtement sol':     ['LM','PDB','BD','BM','GED','PP','BCO','BGM','MAP','SIK'],
  'Carrelage':          ['LM','PDB','BD','BM','GED','PP','BCO','BGM','MAP','SIK','LAF'],
  // Outillage / fixation / visserie
  'Fixation':           ['LM','BD','WUR','MAN','BM','QA','LEG','DC','CDF'],
  // Extérieur / paysagisme
  'Extérieur':          ['LM','BD','BM','PP','GED','BCO','BGM','TF'],
  'Matériaux spéciaux': ['LM','PDB','BD','BM','PP','GED','BCO','PRO','BGM','SGD','KNF','PLA','SIN','ISV','RKW','WEB','PAR','MAP','SIK','USG','LAF'],
  // Cuisine / sanitaire / meuble / menuiserie
  'Porte intérieure':   ['LM','BD','BM','BCO','BGM'],
  'Menuiserie ext.':    ['LM','BD','BM','BCO','BGM'],
  // Main d'œuvre : pas d'enseigne fournisseur
  "Main d'oeuvre":      [],
  // Prestations (même logique que la famille matériaux correspondante)
  'Prestations Plaquisterie': ['LM','PDB','BD','BM','GED','CHAU','BCO','PRO','GIR','LPI','PP','BGM','TF','SGD'],
  'Prestations Peinture':     ['LM','BD','BM','PP','GED','GIR','BCO','BGM'],
  'Prestations Électricité':  ['REX','SON','WUR','LM','BD','LEG','DC'],
  'Prestations Plomberie':    ['PP','CHAU','BCO','REX','SON','LM','BD','LAR'],
  'Prestations Maçonnerie':   ['LM','PDB','BD','BM','GED','CHAU','BCO','BGM','LAF'],
  'Prestations Carrelage':    ['LM','PDB','BD','BM','GED','PP','BCO','BGM'],
  'Prestations Sol':          ['LM','PDB','BD','BM','GED','PP','BCO','BGM'],
  'Prestations Extérieur':    ['LM','BD','BM','PP','GED','BCO','BGM'],
  'Prestations Démolition':   ['LM','BD','BM','BCO'],
};

// ── Initialiser la base produits depuis le catalogue ──────────
function initCatalogue() {
  const existants = DB.getAll(DB.KEYS.produits).map(p => p.reference);
  let ajouts = 0;
  CATALOGUE.forEach(p => {
    if (!existants.includes(p.ref)) {
      DB.add(DB.KEYS.produits, {
        categorie:   p.fam,
        reference:   p.ref,
        designation: p.nom,
        unite:       p.unite,
        prixHT:      p.prix,
        rendement:   p.rend || '-',
        tags:        p.tags || [],
        actif:       true,
      });
      ajouts++;
    }
  });
  if (ajouts > 0) console.log(`PlaqPro — ${ajouts} produits ajoutés au catalogue`);
}

// ── Page Base Produits enrichie avec moteur de recherche ──────
Pages.produits = function() {
  // Initialiser le catalogue complet
  initCatalogue();

  const div = document.createElement('div');
  div.innerHTML = `
    <!-- En-tête Catalogue -->
    <div style="margin-bottom:12px;padding:12px 0 8px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
      <div>
        <h2 style="margin:0;font-size:18px;font-weight:700">🏪 Catalogue Fournisseurs</h2>
        <p style="margin:4px 0 0;font-size:12px;color:var(--text-tertiary)">Prix d'achat — Bricoman · Point.P · Prolians · Legallais · BigMat · Autres</p>
      </div>
      <button onclick="PROD.actualiserPrix()" style="display:flex;align-items:center;gap:8px;padding:10px 18px;background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;border:none;border-radius:var(--radius-md);font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
        🔄 Actualiser les prix IA
      </button>
    </div>
    <!-- Barre de recherche principale -->
    <div class="prod-search-bar">
      <div class="prod-search-wrap">
        <span class="prod-search-icon">🔍</span>
        <input
          type="text"
          id="prod-search"
          class="prod-search-input"
          placeholder="Rechercher par nom, référence, usage... (ex: ba13, vinyl, coupe-feu, parquet...)"
          oninput="ProdMoteur.rechercher(this.value)"
          autocomplete="off"
        >
        <button class="prod-search-clear" id="prod-clear" onclick="ProdMoteur.vider()" style="display:none">✕</button>
      </div>
      <button class="btn btn-primary" onclick="Pages.modalNouveauProduit()">+ Nouveau</button>
    </div>

    <!-- Filtres familles -->
    <div class="prod-familles" id="prod-familles">
      <button class="prod-fam-btn active" data-fam="" onclick="ProdMoteur.filtrerFam('', this)">
        Tout <span class="prod-fam-count">${DB.produits.length}</span>
      </button>
      ${FAMILLES.map(f => `
        <button class="prod-fam-btn" data-fam="${f}" onclick="ProdMoteur.filtrerFam(this.dataset.fam, this)">
          ${ProdMoteur.iconFam(f)} ${f}
          <span class="prod-fam-count">${DB.produits.filter(p=>p.categorie===f).length}</span>
        </button>
      `).join('')}
    </div>

    <!-- Résultats -->
    <div id="prod-results"></div>

    <!-- Stats -->
    <div class="prod-stats" id="prod-stats"></div>
  `;

  // CSS spécifique
  if (!document.getElementById('prod-styles')) {
    const style = document.createElement('style');
    style.id = 'prod-styles';
    style.textContent = `
      .prod-search-bar {
        display: flex; gap: 12px; align-items: center; margin-bottom: 16px;
      }
      .prod-search-wrap {
        flex: 1; display: flex; align-items: center; gap: 10px;
        background: var(--glass-bg-md);
        border: 1px solid var(--glass-border-md);
        border-radius: var(--r-full);
        padding: 0 16px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .prod-search-wrap:focus-within {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(79,142,247,0.2), 0 2px 12px rgba(0,0,0,0.3);
      }
      .prod-search-icon { font-size: 18px; flex-shrink: 0; opacity: 0.6; }
      .prod-search-input {
        flex: 1; height: 44px; background: none; border: none; outline: none;
        font-family: var(--font); font-size: 15px; color: var(--text-primary);
      }
      .prod-search-input::placeholder { color: var(--text-tertiary); }
      .prod-search-clear {
        background: none; border: none; cursor: pointer;
        color: var(--text-tertiary); font-size: 16px; padding: 4px;
        border-radius: var(--r-full); transition: all 0.12s;
      }
      .prod-search-clear:hover { background: var(--red-dim); color: var(--red); }

      .prod-familles {
        display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;
      }
      .prod-fam-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 14px; border-radius: var(--r-full);
        font-family: var(--font); font-size: 13px; font-weight: 500;
        color: var(--text-secondary); background: var(--glass-bg);
        border: 1px solid var(--glass-border); cursor: pointer;
        transition: all 0.15s; white-space: nowrap;
      }
      .prod-fam-btn:hover { border-color: var(--glass-border-md); color: var(--text-primary); }
      .prod-fam-btn.active {
        background: var(--accent-dim); color: var(--accent);
        border-color: rgba(79,142,247,0.3); font-weight: 600;
      }
      .prod-fam-count {
        background: var(--glass-bg-strong); color: var(--text-tertiary);
        font-size: 11px; font-weight: 700; padding: 1px 6px;
        border-radius: var(--r-full); min-width: 20px; text-align: center;
      }
      .prod-fam-btn.active .prod-fam-count { background: rgba(79,142,247,0.2); color: var(--accent); }

      /* Grille produits */
      .prod-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 10px;
        margin-bottom: 16px;
      }

      .prod-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--r-lg);
        padding: 14px 16px;
        cursor: pointer;
        transition: all 0.15s;
        position: relative;
        overflow: hidden;
      }
      .prod-card::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 2px;
        background: var(--prod-color, var(--accent));
        opacity: 0;
        transition: opacity 0.15s;
      }
      .prod-card:hover {
        border-color: var(--glass-border-md);
        box-shadow: var(--shadow-md);
        transform: translateY(-1px);
      }
      .prod-card:hover::before { opacity: 1; }

      .prod-card-header {
        display: flex; align-items: flex-start;
        justify-content: space-between; gap: 8px; margin-bottom: 8px;
      }
      .prod-card-ref {
        font-family: var(--font-mono); font-size: 11px; font-weight: 600;
        color: var(--text-tertiary); background: var(--glass-bg-md);
        padding: 2px 8px; border-radius: var(--r-full);
        border: 1px solid var(--glass-border);
      }
      .prod-card-prix {
        font-family: var(--font-mono); font-size: 15px; font-weight: 700;
        color: var(--accent);
      }
      .prod-card-nom {
        font-size: 13px; font-weight: 500; color: var(--text-primary);
        margin-bottom: 6px; line-height: 1.4;
      }
      .prod-card-meta {
        display: flex; gap: 6px; flex-wrap: wrap; align-items: center;
      }
      .prod-card-fam {
        font-size: 11px; color: var(--text-tertiary);
        background: var(--glass-bg); border: 1px solid var(--glass-border);
        padding: 2px 8px; border-radius: var(--r-full);
      }
      .prod-card-unite {
        font-size: 11px; color: var(--text-secondary); font-weight: 600;
      }

      /* Tag de surbrillance de recherche */
      mark {
        background: rgba(79,142,247,0.3); color: var(--accent);
        border-radius: 2px; padding: 0 1px;
      }

      /* Empty search */
      .prod-empty {
        text-align: center; padding: 48px; color: var(--text-tertiary);
      }
      .prod-empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }

      /* Stats */
      .prod-stats {
        font-size: 12px; color: var(--text-tertiary);
        text-align: center; padding: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => ProdMoteur.init(), 50);
  return div;
};

// ── Moteur de recherche produits ──────────────────────────────
const ProdMoteur = {

  famActive: '',
  searchActive: '',

  iconFam(fam) {
    const icons = {
      'Plaque plâtre': '🟫', 'Carreau plâtre': '🧱', 'Ossature métal': '🔩',
      'Fixation': '🔧', 'Isolation': '🌀', 'Jointage': '🪣',
      'Peinture': '🎨', 'Accessoire peinture': '🖌', 'Revêtement sol': '🪵',
      'Carrelage': '🔲', 'Porte intérieure': '🚪', 'Menuiserie ext.': '🪟',
      "Main d'oeuvre": '👷',
      'Prestations Plaquisterie': '💼', 'Prestations Peinture': '💼',
      'Prestations Électricité': '💼', 'Prestations Plomberie': '💼',
      'Prestations Maçonnerie': '💼', 'Prestations Carrelage': '💼',
      'Prestations Sol': '💼', 'Prestations Extérieur': '💼',
      'Prestations Démolition': '💼',
    };
    return icons[fam] || '📦';
  },

  famColor(fam) {
    const colors = {
      'Plaque plâtre': '#4F8EF7', 'Carreau plâtre': '#6BA3FF',
      'Ossature métal': '#8892AA', 'Fixation': '#F7A64F',
      'Isolation': '#2DD4A0', 'Jointage': '#A78BFA',
      'Peinture': '#F75B5B', 'Accessoire peinture': '#FF9F7F',
      'Revêtement sol': '#C4A45A', 'Carrelage': '#5AC4C4',
      'Porte intérieure': '#C4845A', 'Menuiserie ext.': '#5AC48C',
      "Main d'oeuvre": '#A0A0F7',
      'Prestations Plaquisterie': '#2DD4A0', 'Prestations Peinture': '#2DD4A0',
      'Prestations Électricité': '#2DD4A0', 'Prestations Plomberie': '#2DD4A0',
      'Prestations Maçonnerie': '#2DD4A0', 'Prestations Carrelage': '#2DD4A0',
      'Prestations Sol': '#2DD4A0', 'Prestations Extérieur': '#2DD4A0',
      'Prestations Démolition': '#2DD4A0',
    };
    return colors[fam] || '#4F8EF7';
  },

  init() {
    this.render(DB.produits);
  },

  rechercher(query) {
    this.searchActive = query.trim().toLowerCase();
    const clearBtn = document.getElementById('prod-clear');
    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';
    this.renderFiltre();
  },

  filtrerFam(fam, btn) {
    this.famActive = fam;
    document.querySelectorAll('.prod-fam-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderFiltre();
  },

  vider() {
    this.searchActive = '';
    const inp = document.getElementById('prod-search');
    if (inp) inp.value = '';
    const clearBtn = document.getElementById('prod-clear');
    if (clearBtn) clearBtn.style.display = 'none';
    this.renderFiltre();
  },

  renderFiltre() {
    let produits = DB.produits;

    // Filtre famille
    if (this.famActive) {
      produits = produits.filter(p => p.categorie === this.famActive);
    }

    // Filtre recherche
    if (this.searchActive) {
      const q = this.searchActive;
      produits = produits.filter(p => {
        const nom  = (p.designation || '').toLowerCase();
        const ref  = (p.reference || '').toLowerCase();
        const tags = (p.tags || []).join(' ').toLowerCase();
        const fam  = (p.categorie || '').toLowerCase();
        return nom.includes(q) || ref.includes(q) || tags.includes(q) || fam.includes(q);
      });
    }

    // Tri Pareto : Prestations → Main d'œuvre → Matériaux → Accessoires
    produits = [...produits].sort((a, b) => {
      const rang = p => {
        const cat = p.categorie || '';
        if (cat.startsWith('Prestat')) return 0;
        if (cat === "Main d'oeuvre") return 1;
        return 2;
      };
      return rang(a) - rang(b);
    });

    this.render(produits, this.searchActive);
  },

  highlight(text, query) {
    if (!query || query.length < 2) return text;
    const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  render(produits, query = '') {
    const container = document.getElementById('prod-results');
    const stats = document.getElementById('prod-stats');
    if (!container) return;

    if (!produits.length) {
      const hasGroq = !!localStorage.getItem('plaqpro_groq_key');
      const qEsc = query ? query.replace(/"/g, '&quot;') : '';
      const webBtn = hasGroq
        ? `<button class="btn btn-secondary" style="margin-top:8px"
             onclick="ProduitsWeb.rechercher(${JSON.stringify(query || '')})">
             🔍 Rechercher "${qEsc}" sur le web
           </button>`
        : `<div style="font-size:12px;color:var(--text-tertiary);margin-top:12px">
             Configurez votre clé Groq dans Paramètres pour activer la recherche web.
           </div>`;
      container.innerHTML = `
        <div class="prod-empty">
          <div class="prod-empty-icon">🔍</div>
          <div style="font-size:16px;font-weight:600;color:var(--text-secondary);margin-bottom:8px">
            Aucun produit trouvé
          </div>
          <div style="font-size:14px;margin-bottom:12px">
            Essayez un autre terme, créez ce produit, ou recherchez via l'IA.
          </div>
          <button class="btn btn-primary" onclick="Pages.modalNouveauProduit()">+ Créer ce produit</button>
          ${webBtn}
        </div>`;
      if (stats) stats.textContent = '';
      return;
    }

    if (produits.length < 3 && query && query.length >= 2) {
      const hasGroq = !!localStorage.getItem('plaqpro_groq_key');
      if (hasGroq) {
        const banner = document.createElement('div');
        banner.id = 'pweb-suggest';
        banner.style.cssText = 'margin-bottom:12px;padding:10px 14px;background:rgba(255,155,50,0.08);' +
          'border:1px solid rgba(255,155,50,0.25);border-radius:var(--radius-md);font-size:13px;' +
          'color:var(--text-secondary);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap';
        banner.innerHTML = `<span>Peu de résultats pour "${query.replace(/"/g,'&quot;')}" — chercher d'autres produits via l'IA ?</span>
          <button class="btn btn-secondary" style="font-size:12px;padding:5px 10px;white-space:nowrap"
            onclick="ProduitsWeb.rechercher(${JSON.stringify(query)})">✨ Recherche IA</button>`;
        container.parentNode.insertBefore(banner, container);
      }
    }

    container.innerHTML = `<div class="prod-grid">${
      produits.map(p => {
        const color = this.famColor(p.categorie);
        const nom   = this.highlight(p.designation || '', query);
        const ref   = this.highlight(p.reference || '', query);
        return `
        <div class="prod-card" style="--prod-color:${color}" onclick="Pages.modalEditProduit(${p.id})">
          <div class="prod-card-header">
            <span class="prod-card-ref">${ref}</span>
            <span class="prod-card-prix">${new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2}).format(p.prixHT || 0)} €/${p.unite}</span>
            <button onclick="event.stopPropagation();PROD.majPrix(${JSON.stringify(p.reference)})" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:2px 6px" title="Mettre à jour le prix">✏️</button>
            <button onclick="event.stopPropagation();PROD.chercherFournisseur(${JSON.stringify(p.reference)}, ${JSON.stringify(p.designation)})" style="background:none;border:none;color:#0d9488;font-size:11px;cursor:pointer;padding:2px 6px" title="Chercher chez un fournisseur">🔍</button>
          </div>
          <div class="prod-card-nom">${nom}</div>
          <div class="prod-card-meta">
            <span class="prod-card-fam">${this.iconFam(p.categorie)} ${p.categorie}</span>
            ${p.rendement && p.rendement !== '-' ? `<span class="prod-card-unite">Rend: ${p.rendement} ${p.unite}</span>` : ''}
          </div>
        </div>`;
      }).join('')
    }</div>`;

    if (stats) {
      stats.textContent = produits.length + ' produit' + (produits.length > 1 ? 's' : '') +
        (query ? ` pour "${query}"` : '') +
        (this.famActive ? ` dans "${this.famActive}"` : '');
    }
  },
};

// Initialiser le catalogue au chargement
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initCatalogue, 500);
});

window.PROD = window.PROD || {};
Object.assign(window.PROD, {
  majPrix(ref) {
    const overrides = JSON.parse(localStorage.getItem('plaqpro_prix_overrides') || '{}');
    const current = overrides[ref]?.prix || CATALOGUE.find(p => p.ref === ref)?.prix || 0;
    App.openModal('Mettre à jour le prix — ' + ref,
      `<div style="padding:16px">
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
          Prix actuel : <strong>${current} €</strong>
        </div>
        <label style="font-size:12px;color:var(--text-secondary)">Nouveau prix HT (€)</label>
        <input type="number" class="form-control" id="prod-new-prix" value="${current}" step="0.01" style="margin-top:4px;margin-bottom:8px">
        <label style="font-size:12px;color:var(--text-secondary)">Source (fournisseur)</label>
        <input class="form-control" id="prod-new-source" placeholder="Point.P, Bricoman..." style="margin-top:4px">
      </div>`,
      `<button class="btn btn-primary" onclick="PROD._savePrix('${ref}')">💾 Sauvegarder</button>
       <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>`
    );
  },
  _savePrix(ref) {
    const newPrix = parseFloat(document.getElementById('prod-new-prix')?.value);
    const source = document.getElementById('prod-new-source')?.value.trim();
    if (!newPrix || newPrix <= 0) { App.toast('Prix invalide', 'error'); return; }
    const overrides = JSON.parse(localStorage.getItem('plaqpro_prix_overrides') || '{}');
    overrides[ref] = { prix: newPrix, source, date: new Date().toLocaleDateString('fr-FR') };
    localStorage.setItem('plaqpro_prix_overrides', JSON.stringify(overrides));
    App.closeModal();
    App.toast('Prix mis à jour ✅', 'success');
    App.navigate('produits');
  },
  chercherFournisseur(ref, nom) {
    const q = encodeURIComponent(nom);
    App.openModal('Chercher ce produit chez un fournisseur',
      `<div style="padding:16px;display:flex;flex-direction:column;gap:10px">
        <div style="font-size:13px;font-weight:600;margin-bottom:4px">${nom}</div>
        <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:10px">Cliquez sur un fournisseur pour rechercher ce produit sur son site :</div>
        ${[
          { nom:'Point.P', url:'https://www.pointp.fr/recherche?q=', color:'#e63946' },
          { nom:'Bricoman', url:'https://www.bricoman.fr/catalogsearch/result/?q=', color:'#0077b6' },
          { nom:'Leroy Merlin Pro', url:'https://www.leroymerlin.fr/recherche=', color:'#67a617' },
          { nom:'Würth', url:'https://www.wurth.fr/recherche?searchTerm=', color:'#cc0000' },
          { nom:'Legallais', url:'https://www.legallais.com/recherche?q=', color:'#003366' },
          { nom:'Knauf', url:'https://www.knauf.fr/recherche?q=', color:'#ffcc00' },
          { nom:'Placo', url:'https://www.placo.fr/recherche?q=', color:'#0072ce' },
          { nom:'Plateforme BTP', url:'https://www.laplateformebatiment.fr/search?q=', color:'#e63946' },
        ].map(f => `
          <a href="${f.url}${q}" target="_blank"
            style="display:flex;align-items:center;gap:10px;padding:10px 14px;
            background:var(--bg-primary);border:1px solid var(--border);
            border-radius:var(--radius-sm);text-decoration:none;color:var(--text-primary);
            font-size:13px;font-weight:500;transition:border-color .15s"
            onmouseover="this.style.borderColor='${f.color}'"
            onmouseout="this.style.borderColor='rgba(255,255,255,0.07)'">
            <span style="width:10px;height:10px;border-radius:50%;background:${f.color};flex-shrink:0"></span>
            ${f.nom}
            <span style="margin-left:auto;font-size:11px;color:var(--text-tertiary)">→ Rechercher</span>
          </a>
        `).join('')}
        <div style="margin-top:8px;padding:10px;background:rgba(13,148,136,0.08);border-radius:var(--radius-sm);font-size:11px;color:#0d9488">
          💡 Après avoir trouvé le prix, revenez mettre à jour avec le bouton ✏️
        </div>
      </div>`,
      `<button class="btn btn-secondary" onclick="App.closeModal()">Fermer</button>`
    );
  },

  actualiserPrix() {
    const groqKey = localStorage.getItem('plaqpro_groq_key') || localStorage.getItem('groq_api_key') || '';
    if (!groqKey || !groqKey.startsWith('gsk_')) {
      App.toast('Clé IA manquante — configurez-la dans Mon Compte', 'error');
      return;
    }
    const overrides = JSON.parse(localStorage.getItem('plaqpro_prix_overrides') || '{}');
    const echantillon = CATALOGUE.slice(0, 20).map(p => ({
      ref: p.ref, nom: p.nom, unite: p.unite, prixActuel: overrides[p.ref]?.prix || p.prix
    }));

    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = `
      <div style="padding:20px;text-align:center">
        <div style="font-size:48px;margin-bottom:16px">🤖</div>
        <div style="font-size:15px;font-weight:700;margin-bottom:8px">Analyse des prix en cours...</div>
        <div style="font-size:13px;color:var(--text-tertiary);margin-bottom:20px">
          L'IA analyse les prix du marché BTP français pour ${echantillon.length} produits
        </div>
        <div id="prix-progress" style="background:var(--bg-primary);border-radius:var(--radius-md);padding:14px;font-size:12px;color:var(--text-tertiary);text-align:left;max-height:200px;overflow-y:auto">
          Connexion à l'assistant IA...
        </div>
      </div>
    `;
    App.openModal('🔄 Actualisation des prix IA', modalDiv, '');

    const prompt = `Tu es un expert en pricing matériaux BTP France 2026.
Voici une liste de produits avec leurs prix actuels dans une base PlaqPro+.
Donne une estimation réaliste des prix du marché français en 2026 pour chaque produit.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans backticks.
Format exact : {"updates":[{"ref":"REF","prixSuggere":X.XX,"variation":"hausse/baisse/stable","note":"courte note"}]}

Produits à analyser :
${JSON.stringify(echantillon, null, 2)}

Règles :
- Prix HT en euros, réalistes pour un artisan achetant en négoce BTP
- Variation = "hausse" si +5% ou plus, "baisse" si -5% ou moins, "stable" sinon
- Note courte (max 8 mots) expliquant la variation
- Intègre l'inflation matériaux BTP 2024-2026`;

    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + groqKey },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2000
      })
    })
    .then(r => r.json())
    .then(data => {
      const txt = data.choices?.[0]?.message?.content || '';
      let updates;
      try {
        const clean = txt.replace(/```json|```/g, '').trim();
        updates = JSON.parse(clean).updates;
      } catch(e) {
        document.getElementById('prix-progress').innerHTML = '❌ Erreur parsing IA — ' + txt.substring(0,100);
        return;
      }

      App.closeModal();

      const hausse = updates.filter(u => u.variation === 'hausse');
      const baisse = updates.filter(u => u.variation === 'baisse');
      const stable = updates.filter(u => u.variation === 'stable');

      const modalDiv2 = document.createElement('div');
      modalDiv2.innerHTML = `
        <div style="padding:16px">
          <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
            <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px 16px;text-align:center;flex:1">
              <div style="font-size:22px;font-weight:800;color:#ef4444">${hausse.length}</div>
              <div style="font-size:11px;color:var(--text-tertiary)">Hausses détectées</div>
            </div>
            <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:10px 16px;text-align:center;flex:1">
              <div style="font-size:22px;font-weight:800;color:#10b981">${baisse.length}</div>
              <div style="font-size:11px;color:var(--text-tertiary)">Baisses détectées</div>
            </div>
            <div style="background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:8px;padding:10px 16px;text-align:center;flex:1">
              <div style="font-size:22px;font-weight:800">${stable.length}</div>
              <div style="font-size:11px;color:var(--text-tertiary)">Stables</div>
            </div>
          </div>
          <div style="max-height:350px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
            ${updates.map(u => {
              const prod = echantillon.find(p => p.ref === u.ref);
              const diff = prod ? ((u.prixSuggere - prod.prixActuel) / prod.prixActuel * 100).toFixed(1) : 0;
              const color = u.variation === 'hausse' ? '#ef4444' : u.variation === 'baisse' ? '#10b981' : 'var(--text-tertiary)';
              const icon = u.variation === 'hausse' ? '📈' : u.variation === 'baisse' ? '📉' : '➡️';
              return `
                <div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:12px;display:flex;align-items:center;gap:12px">
                  <div style="font-size:20px">${icon}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary)">${prod?.nom || u.ref}</div>
                    <div style="font-size:11px;color:var(--text-tertiary)">${u.note}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-size:13px;font-weight:700;color:${color}">${u.prixSuggere} €</div>
                    <div style="font-size:10px;color:${color}">${diff > 0 ? '+' : ''}${diff}%</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="margin-top:12px;padding:10px;background:rgba(245,158,11,0.08);border-radius:8px;font-size:11px;color:#f59e0b;font-style:italic">
            ⚠️ Prix estimés par IA — à titre indicatif. Vérifiez auprès de vos fournisseurs avant de valider.
          </div>
        </div>
      `;
      window._pendingPrixUpdates = updates;
      App.openModal('🔄 Suggestions de mise à jour prix', modalDiv2,
        '<button class="btn btn-primary" onclick="PROD._appliquerUpdates()">✅ Appliquer toutes les mises à jour</button>' +
        '<button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>'
      );
    })
    .catch(err => {
      App.closeModal();
      App.toast('Erreur connexion IA : ' + err.message, 'error');
    });
  },

  _appliquerUpdates() {
    const updates = window._pendingPrixUpdates || [];
    const overrides = JSON.parse(localStorage.getItem('plaqpro_prix_overrides') || '{}');
    const date = new Date().toLocaleDateString('fr-FR');
    updates.forEach(u => {
      overrides[u.ref] = {
        prix: u.prixSuggere,
        source: 'IA PlaqPro+ — Estimation marché BTP 2026',
        date,
        variation: u.variation,
        note: u.note
      };
    });
    localStorage.setItem('plaqpro_prix_overrides', JSON.stringify(overrides));
    App.closeModal();
    App.toast('✅ ' + updates.length + ' prix mis à jour !', 'success');
    App.navigate('produits');
  }
});
