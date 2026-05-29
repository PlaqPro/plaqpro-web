const CACHE_NAME = 'plaqpro-v20260529';

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
  '/plaqpro-web/js/calculateur.js',
  '/plaqpro-web/js/liste_achat.js',
  '/plaqpro-web/js/page_cloisons.js',
  '/plaqpro-web/js/page_peinture.js',
  '/plaqpro-web/js/produits_complet.js',
  '/plaqpro-web/js/tarifs.js',
  '/plaqpro-web/js/pdf_export.js',
  '/plaqpro-web/js/memo_oublis.js',
  '/plaqpro-web/js/alertes.js',
  '/plaqpro-web/js/signature.js',
  '/plaqpro-web/js/email_devis.js',
  '/plaqpro-web/assets/logo_plaqpro.png',
  '/plaqpro-web/assets/icon-192.png',
  '/plaqpro-web/assets/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FICHIERS_CACHE))
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
