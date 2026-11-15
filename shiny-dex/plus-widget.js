(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state;
let timer;
P.decorators.push((view,root)=>{
if(view!=='dashboard')return;
const h=S.hunts.find(x=>x.status==='En cours');
const body=h?'<div class="flex-between wrap">'+P.sprite(h.dex)+'<div><b>'+P.esc(D.speciesName(h.dex))+'</b><p class="tiny">'+P.esc(h.method)+'</p><strong class="accent">'+D.fmt(h.count)+' tentatives</strong></div>'+P.btn('+1','quick-inc','data-id="'+P.esc(h.id)+'"','btn-primary')+P.btn('+5','quick-inc','data-id="'+P.esc(h.id)+'" data-step="5"')+'</div>':'<p class="tiny">Démarre une chasse pour afficher son compteur sur ton tableau de bord.</p>';
const html=P.card('📱 Widget de chasse intégré',body+'<p class="tiny mt-18">Cet encart fonctionne dans la PWA installée sur ton écran d’accueil. Ce n’est pas un widget natif du système iOS.</p>'+P.btn('Centre de synchronisation','quick-sync','','btn-small'));
const anchor=root.querySelector('.stat-grid');if(anchor)anchor.insertAdjacentHTML('afterend',html);
});
P.actions['quick-sync']=()=>P.goto('sync');
P.actions['quick-inc']=e=>{const h=S.hunts.find(x=>x.id===e.dataset.id);if(!h)return;const before=Number(h.count)||0;h.count=before+(Number(e.dataset.step)||1);P.trackCounter?.(h,before,h.count);D.persist();clearTimeout(timer);timer=setTimeout(()=>D.saveHunt(h),1200)};
})();