/* ShinyDex: cache only public same-origin application assets; never cache authenticated API responses. */
const CACHE='hawaryou-shinydex-v10';
const ASSETS=['./','./index.html','./styles.css?v=10','./design-v9.css?v=10','./v10.css?v=10','./catalog.js?v=10','./snapshot.js?v=10','./core.js?v=10','./plus-core.js?v=10','./plus-home.js?v=10','./plus-hunt.js?v=10','./plus-insights.js?v=10','./plus-design.js?v=10','./plus-studio.js?v=10','./plus-backup.js?v=10','./plus-directory.js?v=10','./plus-games.js?v=10','./plus-forms.js?v=10','./plus-audit.js?v=10','./plus-expert.js?v=10','./plus-challenges.js?v=10','./plus-recap.js?v=10','./plus-sync.js?v=10','./plus-widget.js?v=10','./plus-video.js?v=10','./design-v9.js?v=10','./v10-collection.js?v=10','./v10-productivity.js?v=10','./v10-hunting.js?v=10','./v10-security.js?v=10','./v10-bootstrap.js?v=10','./app.js?v=10','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  if(url.pathname.includes('/api/')||url.searchParams.has('token'))return;
  if(req.mode==='navigate'){event.respondWith(fetch(req).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return resp}).catch(()=>caches.match(req)));return}
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(resp=>{if(resp.ok&&resp.type==='basic'){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return resp})));
});