(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state;
let stream=null,watcher=null,previous=null,delayed=null;
const $=x=>document.querySelector(x);
const active=()=>S.hunts.filter(h=>h.status==='En cours');
function stop(){if(watcher)clearInterval(watcher);watcher=null;previous=null;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}const video=$('#xp-video-player');if(video)video.srcObject=null}
P.register('video',()=>{
const options=active().map(x=>[x.id,D.speciesName(x.dex)+' · '+x.method]);
return P.head('Atelier vidéo expérimental','Caméra locale sur ordinateur ou téléphone, images ponctuelles et surveillance de changements visuels. Aucun modèle ne détecte actuellement les shinies de façon fiable.')+
P.card('📹 Source vidéo locale','<video id="xp-video-player" autoplay playsinline muted style="width:100%;max-height:440px;object-fit:contain;background:#050c16;border-radius:17px"></video>'+
'<div class="chip-row mt-18">'+P.btn('Activer la caméra','video-start','','btn-primary')+P.btn('Arrêter','video-stop')+P.btn('Enregistrer une image','video-shot')+P.btn('Analyser les mouvements','video-motion')+'</div>'+
'<p class="tiny mt-18" id="xp-video-status">Aucune source vidéo activée.</p>')+
P.card('🎯 Compteur manuel relié à une chasse','<div class="toolbar"><select id="xp-video-hunt">'+P.opts(options)+'</select>'+P.btn('＋1 rencontre vérifiée','video-plus','','btn-primary')+'</div>'+
'<div class="helper warning">Le détecteur compare simplement des changements de pixels. Il ne peut pas identifier une couleur shiny de façon fiable et n’ajoute donc jamais de rencontre automatiquement. Sur console, il faut filmer l’écran ou disposer d’une carte de capture reconnue comme webcam.</div>');
});
P.actions['video-start']=async()=>{
if(!navigator.mediaDevices?.getUserMedia)return P.toast('Caméra non prise en charge ou accès HTTPS requis.',true);
stop();try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false});const v=$('#xp-video-player');if(v){v.srcObject=stream;await v.play()}const status=$('#xp-video-status');if(status)status.textContent='Flux actif : aucune image transmise au serveur.'}catch(e){stop();P.toast('Accès caméra impossible : '+e.message,true)}
};
P.actions['video-stop']=()=>{stop();const s=$('#xp-video-status');if(s)s.textContent='Caméra arrêtée.'};
P.actions['video-shot']=()=>{const v=$('#xp-video-player');if(!v||v.readyState<2)return P.toast('Active la caméra.',true);const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0,c.width,c.height);c.toBlob(b=>{if(!b)return;const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='ShinyDex-image-'+Date.now()+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)},'image/png')};
P.actions['video-motion']=()=>{if(!stream)return P.toast('Active la caméra.',true);if(watcher){clearInterval(watcher);watcher=null;const s=$('#xp-video-status');if(s)s.textContent='Détection de changements arrêtée.';return}
const canvas=document.createElement('canvas');canvas.width=64;canvas.height=36;const ctx=canvas.getContext('2d',{willReadFrequently:true});
watcher=setInterval(()=>{const v=$('#xp-video-player');if(!v||v.readyState<2)return;ctx.drawImage(v,0,0,64,36);const data=ctx.getImageData(0,0,64,36).data,next=new Uint8Array(64*36);for(let i=0;i<next.length;i++)next[i]=(data[i*4]+data[i*4+1]+data[i*4+2])/3;
if(previous){let diff=0;for(let i=0;i<next.length;i++)diff+=Math.abs(next[i]-previous[i]);const percent=Math.round(diff/next.length/255*100);const s=$('#xp-video-status');if(s)s.textContent='Changement visuel : '+percent+' % — '+(percent>=12?'mouvement important (pas nécessairement shiny)':'image relativement stable')}
previous=next},1700)
};
P.actions['video-plus']=()=>{const h=S.hunts.find(x=>x.id===$('#xp-video-hunt')?.value);if(!h)return P.toast('Sélectionne une chasse.',true);const before=Number(h.count)||0;h.count=before+1;P.trackCounter?.(h,before,h.count);D.saveHunt(h)};
P.decorators.push((view)=>{if(view!=='video'&&stream)stop();if(view==='video'&&stream){const v=$('#xp-video-player');if(v&&v.srcObject!==stream){v.srcObject=stream;v.play().catch(()=>{})}}});
})();