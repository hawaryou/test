(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state;
P.register('sync',()=>{
const q=S.queue||[],status=S.connected?'Connecté':'Non connecté';
const list=q.map(x=>'<div class="goal-card"><div class="grow"><b>'+P.esc(x.type)+' · '+P.esc(x.actionId)+'</b><p>'+new Date(x.created).toLocaleString('fr-FR')+'</p></div><span class="pill warn">En attente</span></div>').join('');
const controls=P.btn('Réessayer','sync-retry','','btn-primary')+P.btn('Relire Google Sheets','sync-refresh')+P.btn('Exporter la file','sync-export');
return P.head('Centre de synchronisation','Statut des envois, erreurs et changements en attente.')+
'<div class="stat-grid"><div class="stat-card"><div class="stat-top">Google Sheets</div><div class="stat-value" style="font-size:17px">'+status+'</div></div><div class="stat-card"><div class="stat-top">En attente</div><div class="stat-value">'+q.length+'</div></div></div>'+
P.card('☁️ Opérations en attente',list||'<div class="helper">Aucune opération locale en attente.</div>')+
'<div class="chip-row mt-18">'+controls+'</div>'+
(S.lastError?P.card('⚠️ Dernière erreur','<p>'+P.esc(S.lastError)+'</p>'):'')+
'<div class="helper warning mt-18">Ne vide pas le stockage du navigateur avant confirmation de toutes les transmissions. La connexion ne sera disponible qu’après installation du script.</div>';
});
P.actions['sync-retry']=()=>D.flushQueue().then(()=>P.toast(S.queue.length?'Des écritures restent en attente.':'File traitée.'));
P.actions['sync-refresh']=()=>D.refresh(true).then(()=>P.toast(S.connected?'Classeur actualisé.':'Connexion indisponible.',!S.connected));
P.actions['sync-export']=()=>D.download('ShinyDex-en-attente.json',JSON.stringify({queue:S.queue,date:new Date().toISOString()},null,2),'application/json');
})();