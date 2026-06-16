/* Life Expense Manager - Service Worker */
const CACHE = 'lem-v5';
const ASSETS = ['./','./index.html','./manifest.json','./icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

// Network-first for navigation/HTML so updates show immediately when online,
// but ALWAYS fall back to cache when offline (never show a network error page).
self.addEventListener('fetch', e => {
  if(e.request.method!=='GET') return;
  const req = e.request;
  e.respondWith(
    fetch(req).then(r=>{
      if(r && r.status===200){
        const copy = r.clone();
        caches.open(CACHE).then(c=>c.put(req, copy));
      }
      return r;
    }).catch(()=>{
      return caches.match(req).then(cached=>{
        if(cached) return cached;
        // SPA fallback: serve cached index.html for navigation requests
        if(req.mode==='navigate') return caches.match('./index.html');
        return new Response('', {status: 408});
      });
    })
  );
});

self.addEventListener('message', e=>{
  if(e.data==='skipWaiting') self.skipWaiting();
});
