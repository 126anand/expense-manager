/* v1780302754 */
const CACHE = 'expense-v1780302754';
const FILES = [
  '/expense-manager/',
  '/expense-manager/index.html',
  '/expense-manager/manifest.json',
  '/expense-manager/icon.png'
];

// Install - cache all files
self.addEventListener('install', e => {
  console.log('SW installing v1780302754');
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.all(
        FILES.map(url => fetch(url + '?v=1780302754', {cache:'no-store'})
          .then(r => cache.put(url, r))
          .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting(); // Force immediate activation
});

// Activate - delete ALL old caches
self.addEventListener('activate', e => {
  console.log('SW activating v1780302754 - clearing old caches');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => {
          console.log('Deleting cache:', k);
          return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch - network first, then cache (always try network first)
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  // For our app files, always try network first
  const isAppFile = FILES.some(f => e.request.url.includes(f.replace('/expense-manager','')));
  if(isAppFile) {
    e.respondWith(
      fetch(e.request, {cache:'no-store'})
        .then(r => {
          if(r && r.status === 200) {
            const clone = r.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, clone));
          }
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if(cached) return cached;
        return fetch(e.request).catch(() => new Response('Offline'));
      })
    );
  }
});
