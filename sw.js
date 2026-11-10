const CACHE = 'entreno-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const save = res => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; };
  if (url.origin === location.origin) {
    // Primero la red (para recibir actualizaciones); sin conexión, la copia guardada.
    e.respondWith(fetch(e.request).then(save).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
  } else {
    // Tipografías y otros recursos externos: primero la copia guardada.
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(save)));
  }
});
