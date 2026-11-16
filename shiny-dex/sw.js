/* ShinyDex: cache only public same-origin application assets; never cache authenticated API responses. */
const CACHE='hawaryou-shinydex-v9';
const ASSETS=['./','./index.html','./styles.css?v=9','./design-v9.css?v=9','./catalog.js?v=9','./snapshot.js?v=9','./core.js?v=9','./plus-core.js?v=9','./plus-home.js?v=9','./plus-hunt.js?v=9','./plus-insights.js?v=9','./plus-design.js?v=9','./plus-studio.js?v=9','./plus-backup.js?v=9','./plus-directory.js?v=9','./plus-games.js?v=9','./plus-forms.js?v=9','./plus-audit.js?v=9','./plus-expert.js?v=9','./plus-challenges.js?v=9','./plus-recap.js?v=9','./plus-sync.js?v=9','./plus-widget.js?v=9','./plus-video.js?v=9','./design-v9.js?v=9','./app.js?v=9','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  if(url.pathname.includes('/api/')||url.searchParams.has('token'))return;
  if(req.mode==='navigate'){event.respondWith(fetch(req).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return resp}).catch(()=>caches.match(req)));return}
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(resp=>{if(resp.ok&&resp.type==='basic'){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return resp})));
});