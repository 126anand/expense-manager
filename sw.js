/* v1780303212 - Life Expense Manager */
const CACHE = 'lem-v1780303212';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/expense-manager/','/expense-manager/index.html','/expense-manager/manifest.json','/expense-manager/icon.png'])
      .catch(()=>{})
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r=>{
        if(r&&r.status===200){
          caches.open(CACHE).then(cache=>cache.put(e.request,r.clone()));
        }
        return r;
      })
      .catch(()=>caches.match(e.request))
  );
});
