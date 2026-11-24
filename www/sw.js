// Offline support for the installed web app (GitHub Pages).
// Bump VERSION whenever you change files in www/ so phones pick up the update.
const VERSION = 'jatah-v4';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: serve the cached copy, refresh it in the background.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(VERSION).then(async cache => {
        const hit = await cache.match(req);
        const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Pages: try the network first so updates show up, fall back to the cached app offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => { caches.open(VERSION).then(c => c.put('./index.html', res.clone())); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Everything else: cache first.
  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) caches.open(VERSION).then(c => c.put(req, res.clone()));
      return res;
    }))
  );
});
