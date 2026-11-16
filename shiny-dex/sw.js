/* ShinyDex: offline app assets plus a bounded cache of public PokéAPI sprites; never cache authenticated API responses. */
const CACHE='hawaryou-shinydex-v14';
const SPRITES='hawaryou-shinydex-sprites-v1';
const SPRITE_MAX=180;
const ASSETS=['./','./index.html','./styles.css?v=14','./design-v9.css?v=14','./v10.css?v=14','./achievements-v13.css?v=14','./catalog.js?v=14','./snapshot.js?v=14','./core.js?v=14','./plus-core.js?v=14','./plus-achievements.js?v=14','./plus-home.js?v=14','./plus-hunt.js?v=14','./plus-insights.js?v=14','./plus-design.js?v=14','./plus-studio.js?v=14','./plus-backup.js?v=14','./plus-directory.js?v=14','./plus-games.js?v=14','./plus-forms.js?v=14','./plus-audit.js?v=14','./plus-expert.js?v=14','./plus-challenges.js?v=14','./plus-recap.js?v=14','./plus-sync.js?v=14','./plus-widget.js?v=14','./plus-video.js?v=14','./design-v9.js?v=14','./v10-collection.js?v=14','./v10-productivity.js?v=14','./v10-hunting.js?v=14','./v10-security.js?v=14','./v10-bootstrap.js?v=14','./app.js?v=14','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k!==SPRITES).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET')return;
  if(url.hostname==='raw.githubusercontent.com'&&url.pathname.startsWith('/PokeAPI/sprites/master/sprites/pokemon/')){
    event.respondWith(caches.open(SPRITES).then(async cache=>{
      const hit=await cache.match(req);if(hit)return hit;
      try{const response=await fetch(req);
        if(response.ok||response.type==='opaque'){
          const copy=response.clone();cache.put(req,copy).then(async()=>{
            const keys=await cache.keys();for(const old of keys.slice(0,Math.max(0,keys.length-SPRITE_MAX)))await cache.delete(old);
          }).catch(()=>{});
        }
        return response;
      }catch(e){return Response.error()}
    }));return;
  }
  if(url.origin!==self.location.origin)return;
  if(url.pathname.includes('/api/')||url.searchParams.has('token'))return;
  if(req.mode==='navigate'){event.respondWith(fetch(req).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return resp}).catch(()=>caches.match(req)));return}
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(resp=>{if(resp.ok&&resp.type==='basic'){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return resp})));
});