const CACHE='tdc-pos-pro-v3-2-syncfix-1';
const STATIC_ASSETS=['./manifest.json','./logo.png'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);

  // Always prefer the network for POS HTML so GitHub/Vercel updates are not hidden by an old cache.
  if(request.mode==='navigate' || url.pathname.endsWith('/pos/') || url.pathname.endsWith('/pos/index.html')){
    event.respondWith(
      fetch(request)
        .then(response=>response)
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached || fetch(request).then(response=>{
      if(response.ok && url.origin===self.location.origin){
        const clone=response.clone();
        caches.open(CACHE).then(cache=>cache.put(request,clone));
      }
      return response;
    }))
  );
});
