const CACHE = 'rootstock-v4-dragon-codex';
const PRECACHE = [
  './',
  'index.html',
  'depth.js',
  'drill.js',
  'rootdeep.js',
  'pronunciations.js',
  'ipa.js'
];
const DRAGON_CODEX_ASSETS = [
  'assets/themes/dragon-codex/frame-mobile.webp',
  'assets/themes/dragon-codex/frame-wide.webp',
  'assets/themes/dragon-codex/dashboard-vignette.webp',
  'assets/themes/dragon-codex/interior-marginalia.webp',
  'assets/themes/dragon-codex/dragon-crest.webp'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  const urls = PRECACHE.map(path => new URL(path, self.registration.scope).href);
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(urls)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'PRECACHE_DRAGON_CODEX') return;
  const urls = DRAGON_CODEX_ASSETS.map(path => new URL(path, self.registration.scope).href);
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(urls)));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(hit => hit || caches.match(self.registration.scope)))
  );
});
