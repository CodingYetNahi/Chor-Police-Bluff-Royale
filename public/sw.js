const CACHE = 'chor-police-v2';
const STATIC = ['/', '/index.html', '/offline.html', '/favicon.svg', '/manifest.json'];
self.addEventListener('install', (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC))),
);
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const active =
    url.pathname.startsWith('/match/') ||
    url.pathname.startsWith('/lobby/') ||
    url.hostname.includes('firestore') ||
    url.pathname.includes('functions');
  if (active) {
    event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html')));
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((hit) => hit || caches.match('/offline.html'))),
  );
});
