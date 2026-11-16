/* ShinyDex: offline app assets plus a bounded cache of public PokéAPI sprites; never cache authenticated API responses. */
const CACHE='hawaryou-shinydex-v11';
const SPRITES='hawaryou-shinydex-sprites-v1';
const SPRITE_MAX=180;
const ASSETS=['./','./index.html','./styles.css?v=11','./design-v9.css?v=11','./v10.css?v=11','./catalog.js?v=11','./snapshot.js?v=11','./core.js?v=11','./plus-core.js?v=11','./plus-home.js?v=11','./plus-hunt.js?v=11','./plus-insights.js?v=11','./plus-design.js?v=11','./plus-studio.js?v=11','./plus-backup.js?v=11','./plus-directory.js?v=11','./plus-games.js?v=11','./plus-forms.js?v=11','./plus-audit.js?v=11','./plus-expert.js?v=11','./plus-challenges.js?v=11','./plus-recap.js?v=11','./plus-sync.js?v=11','./plus-widget.js?v=11','./plus-video.js?v=11','./design-v9.js?v=11','./v10-collection.js?v=11','./v10-productivity.js?v=11','./v10-hunting.js?v=11','./v10-security.js?v=11','./v10-bootstrap.js?v=11','./app.js?v=11','./manifest.webmanifest','./icon.svg'];
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