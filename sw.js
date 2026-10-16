const C = 'ledger-v1';
const ASSETS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate: open instantly from cache, refresh in the background.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(C).then(cache =>
      cache.match(e.request).then(hit => {
        const net = fetch(e.request).then(res => {
          if (res && res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
