const CACHE_VERSION = 'lead-finder-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/icon.svg',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // API calls: network-only with offline fallback message
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() => new Response(
        JSON.stringify({ error: 'You appear to be offline. API calls require a network connection.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      ))
    );
    return;
  }

  // Static assets: cache-first, fall back to network, opportunistically cache new responses
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok && (url.origin === self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, clone));
        }
        return res;
      });
    })
  );
});
