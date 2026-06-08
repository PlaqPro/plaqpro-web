const CACHE_NAME = 'plaqpro-v20260608c';

const FICHIERS_CACHE = [
  '/plaqpro-web/login.html',
  '/plaqpro-web/index.html',
  '/plaqpro-web/signature.html',
  '/plaqpro-web/verify.html',
  '/plaqpro-web/css/style.css',
  '/plaqpro-web/js/auth.js',
  '/plaqpro-web/js/db.js',
  '/plaqpro-web/js/calculs.js',
  '/plaqpro-web/js/app.js',
  '/plaqpro-web/js/alertes.js',
  '/plaqpro-web/js/calculateur.js',
  '/plaqpro-web/js/liste_achat.js',
  '/plaqpro-web/js/page_cloisons.js',
  '/plaqpro-web/js/page_peinture.js',
  '/plaqpro-web/js/tarifs.js',
  '/plaqpro-web/js/memo_oublis.js',
  '/plaqpro-web/js/pdf_export.js',
  '/plaqpro-web/js/excel_export.js',
  '/plaqpro-web/js/produits_complet.js',
  '/plaqpro-web/js/produits_web.js',
  '/plaqpro-web/js/assistant_ia.js',
  '/plaqpro-web/js/facturation.js',
  '/plaqpro-web/js/document_print.js',
  '/plaqpro-web/js/quiz_plaquiste.js',
  '/plaqpro-web/js/calculatrice.js',
  '/plaqpro-web/js/meteo.js',
  '/plaqpro-web/js/graphiques.js',
  '/plaqpro-web/js/calendrier.js',
  '/plaqpro-web/js/prospection.js',
  '/plaqpro-web/js/pack_maconnerie.js',
  '/plaqpro-web/js/pack_electricite.js',
  '/plaqpro-web/js/pack_plomberie.js',
  '/plaqpro-web/js/pack_exterieur.js',
  '/plaqpro-web/js/pack_paysagisme.js',
  '/plaqpro-web/js/polygone_metrage.js',
  '/plaqpro-web/js/devis_paysagisme.js',
  '/plaqpro-web/js/diagnostic_chantier.js',
  '/plaqpro-web/js/catalogue_paysagisme.js',
  '/plaqpro-web/js/chantier_paysagisme.js',
  '/plaqpro-web/js/rapport_paysagisme.js',
  '/plaqpro-web/js/template_csv_paysagisme.js',
  '/plaqpro-web/js/checklist_paysagisme.js',
  '/plaqpro-web/js/metrage_paysagisme.js',
  '/plaqpro-web/js/materiel_paysagisme.js',
  '/plaqpro-web/js/equipe_paysagisme.js',
  '/plaqpro-web/js/analyse_photo.js',
  '/plaqpro-web/js/pause_cafe.js',
  '/plaqpro-web/js/dpgf.js',
  '/plaqpro-web/js/aide.js',
  '/plaqpro-web/js/mode_chantier.js',
  '/plaqpro-web/js/projets_types.js',
  '/plaqpro-web/js/devis_multi.js',
  '/plaqpro-web/js/email_devis.js',
  '/plaqpro-web/js/signature.js',
  '/plaqpro-web/js/acoustique.js',
  '/plaqpro-web/js/thermique.js',
  '/plaqpro-web/js/section_cable.js',
  '/plaqpro-web/js/temps_chantier.js',
  '/plaqpro-web/js/rentabilite.js',
  '/plaqpro-web/js/resistance_feu.js',
  '/plaqpro-web/js/linteau.js',
  '/plaqpro-web/js/regles.js',
  '/plaqpro-web/js/sous_traitants.js',
  '/plaqpro-web/js/mon_compte.js',
  '/plaqpro-web/js/inscription.js',
  '/plaqpro-web/js/legal.js',
  '/plaqpro-web/js/catalogue_fournisseurs.js',
  '/plaqpro-web/js/quiz_metiers.js',
  '/plaqpro-web/js/charges.js',
  '/plaqpro-web/js/devis_intelligent.js',
  '/plaqpro-web/js/import_catalogue.js',
  '/plaqpro-web/js/carte_premium.js',
  '/plaqpro-web/js/bdd_v2.js',
  '/plaqpro-web/js/bdd_paysagisme_v2.js',
  '/plaqpro-web/js/calcul_express_v2.js',
  '/plaqpro-web/assets/logo_plaqpro.png',
  '/plaqpro-web/assets/catalogue_paysagisme_base_prix_2026.csv',
  '/plaqpro-web/install.html',
  '/plaqpro-web/landing.html',
  '/plaqpro-web/assets/icon-192.png',
  '/plaqpro-web/assets/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(
        FICHIERS_CACHE.map(f => cache.add(f).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});























