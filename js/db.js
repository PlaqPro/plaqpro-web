/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Base de données (localStorage)
//  db.js
// ============================================================

const DB = {

  // ── Clés de stockage ──────────────────────────────────────
  KEYS: {
    clients:   'plaqpro_clients',
    chantiers: 'plaqpro_chantiers',
    metrages:  'plaqpro_metrages',
    cloisons:  'plaqpro_cloisons',
    peintures: 'plaqpro_peintures',
    devis:     'plaqpro_devis',
    factures:  'plaqpro_factures',
    produits:   'plaqpro_produits',
    ratios:     'plaqpro_ratios',
    config:     'plaqpro_config',
    prospects:  'plaqpro_prospects',
    sousTraitants:        'plaqpro_sous_traitants',
    masterMateriaux:      'plaqpro_master_materiaux',
    ouvragesTypes:        'plaqpro_ouvrages_types',
    ouvragesComposition:  'plaqpro_ouvrages_composition',
    chiffrages:           'plaqpro_chiffrages',
    scannedDocuments:     'plaqpro_scanned_documents',
    measuredPhotoZones:   'plaqpro_zones_mesurees',
  },

  // Données paysagisme
  PAYSAGISME_KEYS: [
    'plaqpro_catalogue_paysagisme',
    'plaqpro_chantiers_paysagisme',
    'plaqpro_diagnostic_chantier_courant',
    'plaqpro_equipe_paysagisme',
    'plaqpro_materiel_paysagisme',
    'plaqpro_checklists_paysagisme',
  ],

  // ── CRUD générique ────────────────────────────────────────
  getAll(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  },

  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  nextId(key) {
    const items = this.getAll(key);
    if (!items.length) return 1;
    return Math.max(...items.map(i => i.id || 0)) + 1;
  },

  add(key, item) {
    const items = this.getAll(key);
    item.id = this.nextId(key);
    item.createdAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    items.push(item);
    this.save(key, items);
    return item;
  },

  update(key, id, updates) {
    const items = this.getAll(key);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(key, items);
    return items[idx];
  },

  delete(key, id) {
    const items = this.getAll(key).filter(i => i.id !== id);
    this.save(key, items);
  },

  softDelete(key, id) {
    return this.update(key, id, { actif: false });
  },

  getById(key, id) {
    return this.getAll(key).find(i => i.id === id) || null;
  },

  getActive(key) {
    return this.getAll(key).filter(i => i.actif !== false);
  },

  // ── Clients ───────────────────────────────────────────────
  get clients()   { return this.getActive(this.KEYS.clients); },
  addClient(c)    { return this.add(this.KEYS.clients, { ...c, actif: true }); },
  updateClient(id, u) { return this.update(this.KEYS.clients, id, u); },
  deleteClient(id)    { return this.softDelete(this.KEYS.clients, id); },
  getClient(id)       { return this.getById(this.KEYS.clients, id); },

  // ── Chantiers ─────────────────────────────────────────────
  get chantiers() { return this.getActive(this.KEYS.chantiers); },
  addChantier(c)  { return this.add(this.KEYS.chantiers, { ...c, actif: true }); },
  updateChantier(id, u) { return this.update(this.KEYS.chantiers, id, u); },
  deleteChantier(id)    { return this.softDelete(this.KEYS.chantiers, id); },
  getChantier(id)       { return this.getById(this.KEYS.chantiers, id); },
  getChantiersByClient(clientId) {
    return this.chantiers.filter(c => c.clientId === clientId);
  },

  // ── Zones mesurées depuis photo ───────────────────────────
  getMeasuredPhotoZones() {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEYS.measuredPhotoZones) || '{}');
      const zones = Array.isArray(data) ? data : (Array.isArray(data.zones) ? data.zones : []);
      const normalizedZones = zones.map(zone => ({
        name: zone.nomZone || zone.name || 'Zone',
        surface: Number(zone.surfaceM2 ?? zone.surface ?? 0),
        shapeType: zone.typeForme || zone.shapeType || 'Polygone',
        points: Array.isArray(zone.points) ? zone.points : [],
      })).filter(zone => zone.surface > 0);

      return {
        zones: normalizedZones,
        totalSurfaces: Number(data.totalSurfaces ?? normalizedZones.reduce((sum, zone) => sum + zone.surface, 0)),
        dateExport: data.dateExport || null,
      };
    } catch(e) {
      return { zones: [], totalSurfaces: 0, dateExport: null };
    }
  },

  // ── Documents scannés ────────────────────────────────────
  getScannedDocuments() {
    return this.getAll(this.KEYS.scannedDocuments);
  },

  saveScannedDocument(document) {
    const items = this.getScannedDocuments();
    const now = new Date().toISOString();
    const doc = {
      id: document.id || Date.now(),
      date: document.date || now,
      type: document.type || 'document',
      title: document.title || 'Document scanné',
      clientId: document.clientId || null,
      chantierId: document.chantierId || null,
      source: document.source || null,
      ...document,
      updatedAt: now,
    };
    const idx = items.findIndex(item => String(item.id) === String(doc.id));
    if (idx >= 0) items[idx] = { ...items[idx], ...doc };
    else items.push({ ...doc, createdAt: doc.createdAt || now });
    this.save(this.KEYS.scannedDocuments, items);
    return doc;
  },

  removeScannedDocument(id) {
    const items = this.getScannedDocuments().filter(item => String(item.id) !== String(id));
    this.save(this.KEYS.scannedDocuments, items);
  },

  // ── Métrages ──────────────────────────────────────────────
  get metrages()  { return this.getAll(this.KEYS.metrages); },
  addMetrage(m)   { return this.add(this.KEYS.metrages, m); },
  addSousTraitant(st) { return this.add(this.KEYS.sousTraitants, st); },
  getSousTraitants()  { return JSON.parse(localStorage.getItem(this.KEYS.sousTraitants) || '[]'); },
  updateSousTraitant(id, data) { return this.update(this.KEYS.sousTraitants, id, data); },
  deleteSousTraitant(id) { return this.delete(this.KEYS.sousTraitants, id); },
  getSousTraitantById(id) { return this.getById(this.KEYS.sousTraitants, id); },
  updateMetrage(id, u) { return this.update(this.KEYS.metrages, id, u); },
  deleteMetrage(id)    { this.delete(this.KEYS.metrages, id); },
  getMetragesByChantier(chantierId) {
    return this.metrages.filter(m => m.chantierId === chantierId);
  },

  // ── Cloisons ──────────────────────────────────────────────
  get cloisons()  { return this.getAll(this.KEYS.cloisons); },
  addCloison(c)   { return this.add(this.KEYS.cloisons, c); },
  getCloisionsByChantier(chantierId) {
    return this.cloisons.filter(c => c.chantierId === chantierId);
  },

  // ── Peintures ─────────────────────────────────────────────
  get peintures() { return this.getAll(this.KEYS.peintures); },
  addPeinture(p)  { return this.add(this.KEYS.peintures, p); },
  getPeinturesByChantier(chantierId) {
    return this.peintures.filter(p => p.chantierId === chantierId);
  },

  // ── Devis ─────────────────────────────────────────────────
  get devis()     { return this.getAll(this.KEYS.devis); },
  addDevis(d)     { return this.add(this.KEYS.devis, d); },
  updateDevis(id, u) { return this.update(this.KEYS.devis, id, u); },
  getDevisByChantier(chantierId) {
    return this.devis.filter(d => d.chantierId === chantierId);
  },

  // ── Factures ──────────────────────────────────────────────
  get factures() { return this.getAll(this.KEYS.factures); },

  nextNumeroFacture() {
    const year = new Date().getFullYear();
    const all = this.factures.filter(f => f.numero && f.numero.startsWith(`FAC-${year}-`));
    if (!all.length) return `FAC-${year}-0001`;
    const nums = all.map(f => parseInt(f.numero.split('-')[2]) || 0);
    return `FAC-${year}-${String(Math.max(...nums) + 1).padStart(4, '0')}`;
  },

  addFacture(f) {
    f.numero = this.nextNumeroFacture();
    return this.add(this.KEYS.factures, f);
  },

  updateFacture(id, u) { return this.update(this.KEYS.factures, id, u); },

  getFacturesByChantier(chantierId) {
    return this.factures.filter(f => f.chantierId === chantierId);
  },

  // ── Produits (base tarifaire) ─────────────────────────────
  get produits()  { return this.getActive(this.KEYS.produits); },
  addProduit(p)   { return this.add(this.KEYS.produits, { ...p, actif: true }); },
  updateProduit(id, u) { return this.update(this.KEYS.produits, id, u); },
  getProduitByRef(ref) {
    return this.produits.find(p => p.reference === ref) || null;
  },
  getPrixByRef(ref) {
    const p = this.getProduitByRef(ref);
    return p ? p.prixHT : 0;
  },

  // ── Ratios ────────────────────────────────────────────────
  getRatios() {
    const saved = localStorage.getItem(this.KEYS.ratios);
    if (saved) return JSON.parse(saved);
    return this.defaultRatios();
  },
  saveRatios(r) { localStorage.setItem(this.KEYS.ratios, JSON.stringify(r)); },
  getRatio(key) { return this.getRatios()[key] || 0; },

  defaultRatios() {
    return {
      RAILS_ML_PAR_ML_CLOISON: 2,
      MONTANTS_PAR_ML: 1.67,
      PLAQUES_PAR_M2: 0.74,
      VIS_PAR_PLAQUE: 25,
      BANDES_PAR_M2_JOINT: 1.1,
      ENDUIT_KG_PAR_M2: 0.35,
      HEURES_JOINT_PAR_M2_Q2: 0.2,
      HEURES_JOINT_PAR_M2_Q3: 0.3,
      TAUX_HORAIRE_MO: 35,
      MARGE_MATERIAUX: 0.30,
      MARGE_MO: 0.20,
      TVA_TRAVAUX: 0.10,
      TVA_NEUF: 0.20,
      PEINTURE_RENDEMENT_DEFAUT: 10,
      HEURES_PEINTURE_PAR_M2: 0.18,
      COEFF_PERTE_PLAQUE: 1.10,
    };
  },

  // ── Config ────────────────────────────────────────────────
  getConfig() {
    const saved = localStorage.getItem(this.KEYS.config);
    if (saved) return JSON.parse(saved);
    return {
      nomEntreprise: 'MON ENTREPRISE PLAQPRO',
      adresse: '1 rue du Bâtiment, 69000 Lyon',
      telephone: '04 XX XX XX XX',
      email: 'contact@monentreprise.fr',
      siret: '000 000 000 00000',
      prefixeDevis: 'DEV-',
      formeJuridique: '',
      rcs: '',
      tvaIntra: '',
      iban: '',
      bic: '',
      banque: '',
      ville: 'Lyon',
      conditionsPaiement: 'Paiement par virement bancaire à réception de facture.',
      mentionsLegales: '',
      piedPageDevis: 'Devis valable 30 jours à compter de sa date d\'émission.',
      piedPageFacture: 'Facture payable à 30 jours. En cas de retard, pénalités de 3× le taux légal + indemnité forfaitaire de 40 € (art. L441-10 C.com).',
    };
  },
  saveConfig(c) {
    const config = { ...(c || {}) };
    const groqKey = typeof getGroqKey === 'function' ? getGroqKey() : '';
    if (groqKey) {
      config.groqApiKey = groqKey;
      config.groqKey = groqKey;
      config.apiKeyGroq = groqKey;
    }
    localStorage.setItem(this.KEYS.config, JSON.stringify(config));
  },

  getProfil() {
    const saved = localStorage.getItem('plaqpro_profil');
    if (saved) return JSON.parse(saved);
    return {
      mixPro: 70, typeInterv: 'multi',
      tauxHorairePro: 42, tauxHoraireParticulier: 38,
      margeMatPro: 0.22, margeMatParticulier: 0.32,
      margeMO: 0.20, tvaPro: 20, tvaParticulier: 10,
    };
  },
  saveProfil(p) { localStorage.setItem('plaqpro_profil', JSON.stringify(p)); },

  // ── Init données de démonstration ────────────────────────
  initDemo() {
    if (this.clients.length > 0) return; // déjà initialisé

    // Clients
    this.addClient({ nom: 'Dupont Construction', adresse: '12 rue des Lilas', cp: '69001', ville: 'Lyon', telephone: '04 72 00 00 01', email: 'dupont@example.fr' });
    this.addClient({ nom: 'Maison Martin', adresse: '8 avenue Foch', cp: '69003', ville: 'Lyon', telephone: '04 72 00 00 02', email: 'martin@example.fr' });
    this.addClient({ nom: 'SCI Bellevue', adresse: '45 bd des Alpes', cp: '38000', ville: 'Grenoble', telephone: '04 76 00 00 03', email: 'bellevue@example.fr' });

    // Chantiers
    this.addChantier({ clientId: 1, nom: 'Rénovation Bureau Lyon', adresse: '12 rue des Lilas 69001', dateDebut: '2025-03-01', dateFin: '2025-04-30', statut: 'En cours', notes: 'Plateau de 200m²' });
    this.addChantier({ clientId: 2, nom: 'Extension Maison Martin', adresse: '8 avenue Foch 69003', dateDebut: '2025-04-15', dateFin: '2025-06-30', statut: 'En attente', notes: 'Garage converti' });
    this.addChantier({ clientId: 3, nom: 'Appartement Bellevue', adresse: '45 bd des Alpes 38000', dateDebut: '2025-02-01', dateFin: '2025-03-31', statut: 'Terminé', notes: 'T4 complet' });

    // Métrages
    this.addMetrage({ chantierId: 1, piece: 'Séjour', longueur: 8.5, largeur: 5.2, hauteur: 2.6 });
    this.addMetrage({ chantierId: 1, piece: 'Chambre 1', longueur: 4, largeur: 3.5, hauteur: 2.6 });
    this.addMetrage({ chantierId: 2, piece: 'Bureau', longueur: 5, largeur: 4, hauteur: 2.5 });

    // Produits tarifaire
    const produits = [
      { categorie: 'Cloison', reference: 'PARF48', designation: 'Rail Stil R48 barre 3m', unite: 'ml', prixHT: 1.65, rendement: '-' },
      { categorie: 'Cloison', reference: 'PAMON48', designation: 'Montant Stil M48 barre 2.8m', unite: 'u', prixHT: 2.45, rendement: '-' },
      { categorie: 'Plaque', reference: 'BA13S', designation: 'Plaque BA13 Standard 260x120cm', unite: 'u', prixHT: 8.50, rendement: 2.70 },
      { categorie: 'Plaque', reference: 'BA13H', designation: 'Plaque BA13 Hydro 260x120cm', unite: 'u', prixHT: 11.20, rendement: 2.70 },
      { categorie: 'Fixation', reference: 'VIS_TF35', designation: 'Vis TF 3.5×35 boite 500u', unite: 'boite', prixHT: 6.90, rendement: 500 },
      { categorie: 'Joint', reference: 'BANDE_PLA', designation: 'Bande à plâtre 50mm rouleau 50ml', unite: 'rl', prixHT: 4.20, rendement: 50 },
      { categorie: 'Joint', reference: 'ENDUIT_F', designation: 'Enduit de finition Toupret 25kg', unite: 'sac', prixHT: 18.50, rendement: 25 },
      { categorie: 'Peinture', reference: 'DULUX_BM15', designation: 'DULUX Blanc Mat bidon 15L', unite: 'L', prixHT: 2.80, rendement: 12 },
      { categorie: 'Peinture', reference: 'PLC_BMAT', designation: 'Peinture plafond blanc mat 15L', unite: 'L', prixHT: 2.20, rendement: 13 },
      { categorie: 'Isolation', reference: 'LV45', designation: 'Laine de verre Isover 45mm 12m²', unite: 'm2', prixHT: 3.80, rendement: '-' },
    ];
    produits.forEach(p => this.addProduit(p));

  },

  // ── Export / Import ───────────────────────────────────────
  exportAll() {
    const data = {};
    Object.entries(this.KEYS).forEach(([k, v]) => {
      data[k] = this.getAll(v);
    });
    this.PAYSAGISME_KEYS.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try { data[key] = JSON.parse(raw); }
        catch { data[key] = raw; }
      }
    });
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('plaqpro_checklist_') || key.startsWith('plaqpro_checklists_')) {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          try { data[key] = JSON.parse(raw); }
          catch { data[key] = raw; }
        }
      }
    });
    return JSON.stringify(data, null, 2);
  },

  importAll(jsonStr) {
    const data = JSON.parse(jsonStr);
    Object.entries(this.KEYS).forEach(([k, v]) => {
      if (Object.prototype.hasOwnProperty.call(data, k)) this.save(v, data[k]);
    });
    this.PAYSAGISME_KEYS.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    });
    Object.keys(data).forEach(key => {
      if (key.startsWith('plaqpro_checklist_') || key.startsWith('plaqpro_checklists_')) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    });
  },

  // ── Stats pour dashboard ──────────────────────────────────
  getDashboardStats() {
    const chantiers = this.chantiers;
    const devis = this.devis;
    return {
      nbClients:    this.clients.length,
      nbChantiers:  chantiers.length,
      nbEnCours:    chantiers.filter(c => c.statut === 'En cours').length,
      nbDevis:      devis.length,
      totalDevisHT: devis.reduce((s, d) => s + (d.totalHT || 0), 0),
      margeMoyenne: 30,
    };
  },
};

// Initialiser les données de démo au premier chargement
document.addEventListener('DOMContentLoaded', () => DB.initDemo());

// Migration douce : clients et chantiers historiques sans type → particulier par défaut
document.addEventListener('DOMContentLoaded', () => {
  DB.getAll(DB.KEYS.clients).forEach(c => {
    if (!c.type) DB.update(DB.KEYS.clients, c.id, { type: 'particulier' });
  });
  DB.getAll(DB.KEYS.chantiers).forEach(c => {
    if (!c.type) DB.update(DB.KEYS.chantiers, c.id, { type: 'particulier' });
  });
});

// ── Helper Groq : clé persistante depuis localStorage ─────────
const GROQ_STORAGE_KEYS = ['plaqpro_groq_key', 'groq_api_key', 'plaqpro_groq'];

function getGroqKey() {
  let key = '';
  for (const storageKey of GROQ_STORAGE_KEYS) {
    key = localStorage.getItem(storageKey) || '';
    if (key) break;
  }
  if (!key) {
    try {
      const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
      key = config.groqApiKey || config.groqKey || config.apiKeyGroq || '';
    } catch(e) {}
  }
  if (!key) {
    for (const storageKey of GROQ_STORAGE_KEYS) {
      key = sessionStorage.getItem(storageKey) || '';
      if (key) break;
    }
  }
  if (key) saveGroqKey(key);
  return key;
}

function saveGroqKey(key) {
  const clean = (key || '').trim();
  if (!clean) return;
  GROQ_STORAGE_KEYS.forEach(storageKey => localStorage.setItem(storageKey, clean));
  let config = {};
  try { config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}'); } catch(e) {}
  config.groqApiKey = clean;
  config.groqKey = clean;
  config.apiKeyGroq = clean;
  localStorage.setItem('plaqpro_config', JSON.stringify(config));
}

function removeGroqKey() {
  GROQ_STORAGE_KEYS.forEach(storageKey => {
    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(storageKey);
  });
  try {
    const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    delete config.groqApiKey;
    delete config.groqKey;
    delete config.apiKeyGroq;
    localStorage.setItem('plaqpro_config', JSON.stringify(config));
  } catch(e) {}
}

// Retourne { url, headers } ou null si aucune clé configurée
function groqConfig() {
  const key = getGroqKey();
  if (!key) return null;
  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
  };
}
