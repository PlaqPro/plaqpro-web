// ============================================================
//  PLAQPRO+ — Service Worker
//  sw.js — Cache pour fonctionnement hors ligne
// ============================================================

const CACHE_NAME = 'plaqpro-v4';

const FICHIERS_CACHE = [
  '/',
  '/login.html',
  '/index.html',
  '/css/style.css',
  '/js/auth.js',
  '/js/db.js',
  '/js/calculs.js',
  '/js/app.js',
  '/js/calculateur.js',
  '/js/liste_achat.js',
  '/js/page_cloison.js',
  '/js/page_peinture.js',
  '/js/produits_complet.js',
  '/js/tarifs.js',
  '/js/pdf_export.js',
  '/js/memo_oublis.js',
  '/js/alertes.js',
  '/signature.html',
  '/js/signature.js',
  '/js/email_devis.js',
  '/assets/logo_plaqpro.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
];

// Installation — mise en cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FICHIERS_CACHE.filter(f => !f.includes('screenshot'))))
      .then(() => self.skipWaiting())
  );
});

// Activation — nettoyage anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache first, réseau en fallback
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
