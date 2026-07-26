/// <reference lib="webworker" />

declare const __PRECACHE_MANIFEST__: string[];
declare const __CACHE_VERSION__: string;

const cacheName = `rootstock-${__CACHE_VERSION__}`;
const worker = globalThis as unknown as ServiceWorkerGlobalScope;
const installConcurrency = 12;

async function precacheAssets(cache: Cache): Promise<void> {
  let cursor = 0;
  const cacheNext = async (): Promise<void> => {
    while (cursor < __PRECACHE_MANIFEST__.length) {
      const url = __PRECACHE_MANIFEST__[cursor];
      cursor += 1;
      if (!url) continue;
      try {
        await cache.add(url);
      } catch {
        // A single optional audio clip must not invalidate the whole app install.
      }
    }
  };
  await Promise.all(
    Array.from(
      { length: Math.min(installConcurrency, __PRECACHE_MANIFEST__.length) },
      cacheNext
    )
  );
}

worker.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(cacheName)
      .then(precacheAssets)
      .then(() => worker.skipWaiting())
  );
});

worker.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))))
      .then(() => worker.clients.claim())
  );
});

worker.addEventListener("fetch", (event: FetchEvent) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && new URL(event.request.url).origin === worker.location.origin) {
          const copy = response.clone();
          event.waitUntil(caches.open(cacheName).then((cache) => cache.put(event.request, copy)));
        }
        return response;
      }).catch(async () => {
        const fallback = await caches.match("./index.html");
        return fallback ?? Response.error();
      });
    })
  );
});
