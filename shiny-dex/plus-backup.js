/* ShinyDex Plus — local version snapshots, manual restore and JSON export */
(()=>{'use strict';const P=window.ShinyPlus,D=window.DexCore,S=D.state;
P.register("restore",a=>{
const list=D.listBackups();
const rows=list.map(x=>'<div class="goal-card"><div class="grow"><b>'+P.esc(x.label)+'</b><p>'+new Date(x.date).toLocaleString("fr-FR")+' · '+x.captureCount+' captures</p></div>'+P.btn("Télécharger","restore-export",'data-id="'+P.esc(x.id)+'"',"btn-small")+P.btn("Restaurer","restore-do",'data-id="'+P.esc(x.id)+'"',"btn-small btn-danger")+'</div>').join("");
return P.head("Sauvegardes & versions","Conserve des instantanés de ta collection, télécharge-les et restaure un état antérieur sur cet appareil.",P.btn("＋ Nouvelle version","restore-create","","btn-primary"))+
'<div class="helper">La restauration ne modifie pas directement Google Sheets. Fais toujours un export JSON avant toute restauration et la restauration est bloquée tant que la file contient des opérations en attente. Exporte toujours tes données avant de restaurer.</div>'+
'<div class="stat-grid">'+[['Versions locales',list.length],['Captures',S.captures.length],['Actions en attente',S.queue.length],['Espèces',a.obtained]].map(([title,n])=>'<div class="stat-card"><div class="stat-top">'+title+'</div><div class="stat-value">'+n+'</div></div>').join("")+'</div>'+
P.card("🕒 Historique des versions",rows||'<p class="tiny">Tu n’as pas encore créé de version locale.</p>')+'<div class="mt-18">'+P.btn("⬇ Exporter toute ma collection maintenant","restore-current")+'</div>';
});
P.actions["restore-create"]=()=>{const name=prompt("Nom de la sauvegarde","Avant modifications");if(!name)return;D.createBackup(name);P.toast("Sauvegarde locale créée.");P.render()};
P.actions["restore-export"]=el=>{const b=D.listBackups().find(x=>x.id===el.dataset.id);if(b)D.download("ShinyDex-"+b.date.slice(0,10)+".json",JSON.stringify(b.data,null,2),"application/json")};
P.actions["restore-current"]=()=>D.download("ShinyDex-"+D.today()+"-complete.json",JSON.stringify(D.rawBackup(),null,2),"application/json");
P.actions["restore-do"]=el=>{if(!confirm("Restaurer cette version LOCALEMENT ? Le contenu du Google Sheets restera inchangé, et la restauration sera refusée si une opération est encore en attente. Pense à exporter l'état actuel."))return;try{D.restoreBackup(el.dataset.id);P.toast("Version restaurée sur cet appareil.");P.render()}catch(err){P.toast(err.message||"Restauration impossible.",true)}};
})();