/* ShinyDex: cache only public same-origin application assets; never cache authenticated API responses. */
const CACHE='hawaryou-shinydex-v8';
const ASSETS=['./','./index.html','./styles.css?v=8','./catalog.js?v=8','./snapshot.js?v=8','./core.js?v=8','./plus-core.js?v=8','./plus-home.js?v=8','./plus-hunt.js?v=8','./plus-insights.js?v=8','./plus-design.js?v=8','./plus-studio.js?v=8','./plus-backup.js?v=8','./plus-directory.js?v=8','./plus-games.js?v=8','./plus-forms.js?v=8','./plus-audit.js?v=8','./plus-expert.js?v=8','./plus-challenges.js?v=8','./plus-recap.js?v=8','./plus-sync.js?v=8','./plus-widget.js?v=8','./plus-video.js?v=8','./app.js?v=8','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  if(url.pathname.includes('/api/')||url.searchParams.has('token'))return;
  if(req.mode==='navigate'){event.respondWith(fetch(req).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return resp}).catch(()=>caches.match(req)));return}
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(resp=>{if(resp.ok&&resp.type==='basic'){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return resp})));
});