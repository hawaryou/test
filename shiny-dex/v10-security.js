/* ShinyDex v10 — safe import review, per-field reconciliation, diagnostics, Drive backup controls, active-page notifications */
(()=>{'use strict';const P=window.ShinyPlus,D=window.DexCore,S=D.state,E=P.esc,F=P.fmt,$=x=>document.querySelector(x);
let staged=[],filename='',importErrors=[],pendingConflicts=[],serverChecked='',notifying=false;
const normalize=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function fingerprint(c){return [Number(c.dex),normalize(c.game),normalize(c.method),String(c.date||''),String(c.attempts??''),String(c.form||'Standard')].join('|')}
const localFps=()=>new Set(S.captures.map(fingerprint));
function csvRows(text){
 const first=text.split(/\r?\n/,1)[0]||'';const separator=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
 const rows=[];let current=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}
 else if(c===separator&&!quoted){current.push(field);field=''}
 else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;current.push(field);if(current.some(x=>x.trim()))rows.push(current);current=[];field=''}
 else field+=c;}
 current.push(field);if(current.some(x=>x.trim()))rows.push(current);
 if(quoted)throw Error('CSV non fermé : guillemet manquant');
 return rows;
}
function normalizeRows(rows){
 let data;if(Array.isArray(rows))data=rows;else if(Array.isArray(rows?.captures))data=rows.captures;else throw Error('Format invalide : tableau de captures attendu.');
 return data.slice(0,1000).map((raw,i)=>{
 const dex=Number(raw.dex??raw.numero??raw['n° dex']??raw['n° national']??raw.idNational),game=String(raw.game??raw.jeu??''),method=String(raw.method??raw.methode??raw['méthode']??'');
 const attempt=raw.attempts??raw.rencontres??raw.tentatives??'',qty=Number(raw.qty??raw.quantite??raw['quantité']??1),date=String(raw.date??raw['date capture']??''),form=String(raw.form??raw.forme??'Standard');
 const record={dex,game,method,attempts:attempt===''?'':Number(attempt),qty,date:date||D.today(),form,charm:String(raw.charm??'Inconnu'),notes:String(raw.notes??'').slice(0,2000)};
 const reasons=[];if(!D.speciesById.has(dex))reasons.push('Pokémon inconnu');if(!game.trim())reasons.push('Jeu manquant');if(!method.trim())reasons.push('Méthode manquante');if(!Number.isInteger(qty)||qty<1||qty>99)reasons.push('Quantité invalide');if(attempt!==''&&(!Number.isInteger(Number(attempt))||Number(attempt)<0))reasons.push('Tentatives invalides');if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))reasons.push('Date invalide');
 return {record,valid:reasons.length===0,reasons,row:i+2};
 });
}
function csvToObjects(rows){
 if(rows.length<2)throw Error('Fichier CSV sans données.');
 const keys=rows[0].map(normalize);
 return rows.slice(1).map(row=>Object.fromEntries(keys.map((k,i)=>[k,row[i]??''])));
}
P.register('importreview',()=>{
 const current=localFps(),valid=staged.filter(x=>x.valid),dupe=valid.filter(x=>current.has(fingerprint(x.record))),newOnes=valid.filter(x=>!current.has(fingerprint(x.record)));
 const preview=staged.slice(0,40).map(x=>'<div class="v10-import-row"><div><b>'+E(x.valid?D.speciesName(x.record.dex):'Ligne '+x.row)+'</b><small>'+E(x.record.game||'Jeu manquant')+' · '+E(x.record.method||'Méthode manquante')+'</small></div><span class="pill '+(!x.valid?'danger':current.has(fingerprint(x.record))?'warn':'good')+'">'+(!x.valid?E(x.reasons.join('; ')):current.has(fingerprint(x.record))?'Doublon probable':'Nouveau')+'</span></div>').join('');
 return P.head('Assistant d’importation sécurisé','Prévisualise les lignes et repère les doublons avant toute écriture. Aucune donnée existante n’est supprimée.')+
 P.card('1 · Choisir un export','<input type="file" id="v10-import-file" accept=".json,.csv,text/csv,application/json"><p class="tiny mt-12">CSV avec colonnes « dex », « jeu », « méthode », « tentatives », « quantité », « date », ou JSON contenant un tableau de captures. Taille maximale : 2 Mo.</p>')+
 (filename?P.card('2 · Vérifier '+E(filename),'<div class="stat-grid">'+[["Lignes",staged.length],["Importables",newOnes.length],["Doublons potentiels",dupe.length],["Erreurs",staged.length-valid.length]].map(([k,v])=>'<div class="stat-card"><div class="stat-top">'+k+'</div><div class="stat-value">'+v+'</div></div>').join('')+'</div>'+preview+'<div class="helper mt-18">Les doublons probables sont ignorés. Cette comparaison par champs peut aussi repérer deux vraies captures identiques ; vérifie l’aperçu avant de continuer.</div><label class="mt-18"><input type="checkbox" id="v10-import-accept"> J’ai vérifié les lignes et j’autorise la création des captures nouvelles.</label><div class="mt-18">'+P.btn('Importer 25 nouvelles captures au maximum','import-approve','','btn-primary')+'</div>'):'')+
 (importErrors.length?P.card('⚠️ Contrôle du fichier','<p>'+E(importErrors.join(' · '))+'</p>'):'');
});
P.changes['safe-import']=async e=>{
 if(e.target.id!=='v10-import-file')return false;
 const file=e.target.files?.[0];if(!file)return true;
 staged=[];importErrors=[];filename=file.name;
 if(file.size>2e6){importErrors=['Fichier trop volumineux (2 Mo maximum).'];P.render();return true}
 try{const text=await file.text();const raw=/\.json$/i.test(file.name)?JSON.parse(text):csvToObjects(csvRows(text));staged=normalizeRows(raw);if(!staged.length)throw Error('Aucune entrée détectée.')}catch(err){staged=[];importErrors=[err.message]}
 P.render();return true;
};
P.actions['import-approve']=()=>{
 if(!$('#v10-import-accept')?.checked)return P.toast('Valide la vérification avant l’import.',true);
 const existing=localFps(),batch=[],seen=new Set();
 for(const item of staged){if(!item.valid)continue;const sig=fingerprint(item.record);if(existing.has(sig)||seen.has(sig))continue;batch.push(item);seen.add(sig);if(batch.length>=25)break}
 if(!batch.length)return P.toast('Aucune capture nouvelle à importer.',true);
 if(!confirm('Créer '+batch.length+' captures dans le journal local ? Elles seront mises en file pour Google Sheets. Les lignes existantes resteront intactes.'))return;
 D.createBackup('Avant import '+D.today());for(const x of batch)D.saveCapture({...x.record,id:D.uid('IMP')});
 staged=staged.filter(x=>!seen.has(fingerprint(x.record)));P.toast(batch.length+' captures ajoutées au journal.');P.goto('captures');
};
const FIELDS=[['game','Jeu'],['method','Méthode'],['attempts','Tentatives'],['qty','Exemplaires'],['date','Date'],['form','Forme'],['notes','Notes'],['charm','Charme Chroma']];
P.register('conflicts',()=>{
 const list=pendingConflicts.filter(x=>x.local&&x.remote);
 return P.head('Conflits de synchronisation','Comparer les versions locales et celles de Google Sheets champ par champ. Aucune réconciliation n’est appliquée sans validation.')+
 P.card('Vérification serveur','<p>La comparaison est disponible uniquement lorsque ton Apps Script est déployé et connecté.</p>'+P.btn('Comparer avec Google Sheets','conflicts-check','','btn-primary')+(serverChecked?'<p class="tiny mt-12">'+E(serverChecked)+'</p>':''))+
 list.map(x=>P.card('Capture '+E(D.speciesName(x.local.dex))+' · '+E(x.id),FIELDS.filter(([k])=>String(x.local[k]??'')!==String(x.remote[k]??'')).map(([key,title])=>'<div class="v10-conflict-field"><div><b>'+title+'</b><small>Sur cet appareil : '+E(x.local[key]??'—')+'</small><small>Dans Google Sheets : '+E(x.remote[key]??'—')+'</small></div><select data-v10-conflict-field="'+E(x.id)+'" data-field="'+key+'"><option value="server">Conserver Google Sheets</option><option value="local">Utiliser la valeur locale</option></select></div>').join('')+'<div class="mt-18">'+P.btn('Valider ces choix','conflicts-apply','data-id="'+E(x.id)+'"','btn-primary')+'</div>')).join('')+
 '<div class="helper warning mt-18">La résolution par champ compare des instantanés. Si un autre appareil modifie encore la capture avant l’envoi, une nouvelle vérification est nécessaire. Les conflits complexes ne peuvent pas être totalement évités sans versions serveur pour chaque capture.</div>';
});
P.actions['conflicts-check']=async()=>{
 if(!S.settings.token){serverChecked='Connexion Apps Script non activée.';P.render();return}
 try{
 const remote=D.inGoogle()?null:await D.jsonp('bootstrap');if(!remote){serverChecked='Dans Apps Script : utilise la synchronisation puis réessaie depuis la PWA.';P.render();return}
 const byId=new Map((remote.captures||[]).map(c=>[c.id,c])),todo=[...new Set(S.queue.filter(x=>x.type==='capture').map(x=>x.data.id))];
 pendingConflicts=todo.map(id=>({id,local:S.captures.find(x=>x.id===id),remote:byId.get(id)})).filter(x=>x.local&&x.remote&&FIELDS.some(([key])=>String(x.local[key]??'')!==String(x.remote[key]??'')));
 serverChecked=new Date().toLocaleString('fr-FR')+' · '+pendingConflicts.length+' capture(s) à réconcilier.';P.render();
 }catch(err){serverChecked='Vérification impossible : '+err.message;P.render()}
};
P.actions['conflicts-apply']=e=>{
 const c=pendingConflicts.find(x=>x.id===e.dataset.id);if(!c)return;
 const selects=[...document.querySelectorAll('[data-v10-conflict-field]')].filter(x=>x.dataset.v10ConflictField===c.id);
 const chosen={...c.remote};for(const el of selects){if(el.value==='local')chosen[el.dataset.field]=c.local[el.dataset.field]}
 if(!confirm('Appliquer les choix sur cette capture ? Les opérations locales en attente pour ce même identifiant seront remplacées.'))return;
 const fresh={...chosen,id:c.id,dex:Number(c.remote.dex)};
 S.queue=S.queue.filter(op=>!(op.type==='capture'&&op.data.id===c.id));D.persist();
 if(selects.some(el=>el.value==='local'))D.saveCapture(fresh);else{const i=S.captures.findIndex(x=>x.id===c.id);if(i>=0)S.captures[i]=fresh;D.persist()}
 pendingConflicts=pendingConflicts.filter(x=>x.id!==c.id);P.toast('Choix enregistrés. Contrôle la synchronisation.');P.render();
};
P.register('syncdiagnostics',()=>{
 const q=S.queue||[],details=q.slice(0,50).map(op=>'<div class="v10-diagnostic-row"><div><b>'+E(op.type)+' · '+E(op.actionId)+'</b><small>Créée le '+new Date(op.created).toLocaleString('fr-FR')+'</small><small>Tentatives : '+F(op.attempted||0)+'</small></div>'+P.btn('Vérifier côté serveur','diagnostic-status','data-id="'+E(op.actionId)+'"','btn-small')+'</div>').join('');
 const date=S.lastSync||'',source=S.origin||'',error=S.lastError||'';
 return P.head('Diagnostic de synchronisation','Contrôle détaillé des opérations locales et des confirmations Apps Script.')+
 '<div class="stat-grid">'+[["État",S.connected?'Connecté':'Déconnecté'],["En attente",q.length],["Source",source||'Local'],["Dernière erreur",error?'Présente':'Aucune']].map(([k,v])=>'<div class="stat-card"><div class="stat-top">'+E(k)+'</div><div class="stat-value" style="font-size:15px;overflow-wrap:anywhere">'+E(v)+'</div></div>').join('')+'</div>'+
 P.card('Dernière erreur',error?'<p>'+E(error)+'</p>':'<p>Aucune erreur récente signalée.</p>')+
 P.card('File détaillée',details||'<div class="helper">La file locale est vide.</div>')+
 '<div class="chip-row mt-18">'+P.btn('Relancer les opérations','diagnostic-retry','','btn-primary')+P.btn('Exporter un rapport local','diagnostic-export','','btn-secondary')+P.btn('Comparer les captures','conflicts','','btn-secondary')+'</div>'+
 '<div class="helper mt-18">Les opérations sans confirmation restent en file, même après une tentative réseau. Le rapport JSON exporté peut contenir des métadonnées personnelles : conserve-le de manière privée.</div>';
});
P.actions['diagnostic-retry']=()=>D.flushQueue().then(()=>P.toast(S.queue.length+' opération(s) toujours en attente.'));
P.actions['diagnostic-export']=()=>D.download('ShinyDex-diagnostic-'+D.today()+'.json',JSON.stringify({date:new Date().toISOString(),connected:S.connected,lastError:S.lastError,queue:S.queue,lastSync:S.lastSync,origin:S.origin},null,2),'application/json');
P.actions['diagnostic-status']=async e=>{if(!S.settings.token)return P.toast('Connexion Apps Script nécessaire.',true);try{const data=await D.jsonp('status',{id:e.dataset.id});P.toast('État serveur : '+String(data.state||data.status||'inconnu'))}catch(err){P.toast('Vérification impossible : '+err.message,true)}};
P.register('drivebackups',()=>{
 return P.head('Sauvegardes automatiques Google Drive','Préparer la copie quotidienne du classeur entier : journal, métadonnées, chasses et paramètres.')+
 P.card('☁️ Sauvegarde quotidienne','<div class="v10-backup-info"><span>📅</span><div><h3>Copie Google Sheets dans Drive</h3><p>Une copie datée du classeur original peut être créée chaque jour par un déclencheur Apps Script.</p></div></div>'+
 '<div class="helper warning">Cette fonction ne peut pas être activée depuis GitHub Pages seul. Il faut d’abord installer le ShinyDexAPI.gs actuel, accorder les autorisations Drive et exécuter une fois <code>installerSauvegardesShinyDex</code> dans l’éditeur Apps Script.</div>'+
 '<div class="mt-18">'+P.btn('Voir les sauvegardes locales','restore','','btn-secondary')+P.btn('Exporter une copie JSON','drive-local-export','','btn-secondary')+'</div>')+
 P.card('Rétention et sécurité','<p>Le script est prévu pour conserver les 30 copies les plus récentes, uniquement dans un dossier Drive dédié et appartenant au propriétaire du script. Aucune sauvegarde n’est créée automatiquement tant que le déclencheur n’est pas installé.</p>');
});
P.actions['drive-local-export']=()=>D.download('ShinyDex-sauvegarde-'+D.today()+'.json',JSON.stringify(D.rawBackup(),null,2),'application/json');
let remindersTimer=null;
const reminders=()=>P.get('activeReminders',[]);
function clearTimers(){if(remindersTimer){clearInterval(remindersTimer);remindersTimer=null}}
async function notify(title,text){
 if(typeof Notification==='undefined'||Notification.permission!=='granted'){P.toast(title+' — '+text);return;}
 try{const reg=await navigator.serviceWorker?.ready;if(reg?.showNotification)await reg.showNotification(title,{body:text,tag:'shinydex-active-reminder',icon:'./icon.svg'});else if(typeof Notification==='function')new Notification(title,{body:text})}catch(e){console.warn('Reminder unavailable',e);P.toast(title+' — '+text)}
}
function checkReminders(){
 const all=reminders(),now=Date.now();let changed=false;
 for(const r of all){if(!r.done&&Number(r.due)<=now){r.done=true;changed=true;notify('ShinyDex · rappel de chasse',r.text)}}
 if(changed)P.save('activeReminders',all);
}
P.register('reminders',()=>{
 const r=reminders();
 return P.head('Rappels de chasse','Alertes locales lorsque ShinyDex est ouvert et actif. Les notifications en arrière-plan exigent un service Web Push.')+
 P.card('🔔 Programmer un rappel','<div class="form-grid"><div><label>Dans combien de minutes ?</label><input id="v10-reminder-minutes" type="number" min="1" max="240" value="30"></div><div><label>Message</label><input id="v10-reminder-text" value="Fin de ma session de shiny hunting" maxlength="150"></div></div>'+
 '<div class="chip-row mt-18">'+P.btn('Autoriser les notifications','reminder-permission','','btn-secondary')+P.btn('Créer un rappel','reminder-add','','btn-primary')+'</div>'+
 '<p class="tiny mt-12">État permission : '+E(typeof Notification!=='undefined'?Notification.permission:'non compatible')+'</p>')+
 P.card('Mes rappels',r.length?r.slice().reverse().map(item=>'<div class="goal-card"><div class="grow"><b>'+E(item.text)+'</b><p>'+new Date(item.due).toLocaleString('fr-FR')+' · '+(item.done?'Terminé':'En attente')+'</p></div></div>').join(''):'<p class="tiny">Aucun rappel programmé.</p>')+
 '<div class="helper warning mt-18">Sur iPhone, Web Push est possible pour certaines applications ajoutées à l’écran d’accueil, mais il faut un serveur Push et une permission obtenue par un geste utilisateur. Cette version ne prétend pas envoyer des notifications lorsque l’app est fermée.</div>';
});
P.actions['reminder-permission']=async()=>{if(!('Notification'in window))return P.toast('Notifications non disponibles.',true);try{const p=await Notification.requestPermission();P.toast(p==='granted'?'Notifications autorisées.':'Notifications non autorisées.');P.render()}catch(e){P.toast('Permission impossible : '+e.message,true)}};
P.actions['reminder-add']=()=>{const min=Number($('#v10-reminder-minutes')?.value),msg=String($('#v10-reminder-text')?.value||'').trim();if(!Number.isInteger(min)||min<1||min>240||!msg)return P.toast('Durée entre 1 et 240 minutes et message requis.',true);P.save('activeReminders',[...reminders().slice(-29),{id:D.uid('remind'),text:msg.slice(0,150),created:Date.now(),due:Date.now()+min*60000,done:false}]);P.toast('Rappel ajouté. Garde l’application ouverte pour le recevoir.')};
if(typeof document!=='undefined'){remindersTimer=setInterval(()=>{if(document.visibilityState==='visible')checkReminders()},15000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkReminders()})}
})();