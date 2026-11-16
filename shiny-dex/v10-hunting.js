/* ShinyDex v10 — four hunt counters, wake lock, session journal and visual statistics */
(()=>{'use strict';const P=window.ShinyPlus,D=window.DexCore,S=D.state,E=P.esc,F=P.fmt,$=x=>document.querySelector(x);
let selectedHunters=[],activeWake=null,wantWake=false,year='all',metric='progress',rate=4096,tries=1000;
const timers=new Map();
const hunts=()=>S.hunts.filter(h=>h.status==='En cours');
const activeIds=()=>{const used=new Set();return [...selectedHunters,...hunts().map(h=>h.id)].filter(id=>!used.has(id)&&used.add(id)).slice(0,4)};
const odds=(n,p)=>100*(-Math.expm1(n*Math.log1p(-1/Math.max(2,p))));
const safeDate=x=>/^\d{4}-\d{2}-\d{2}$/.test(String(x||''))?String(x):'';
function count(id,step){
 const h=S.hunts.find(h=>h.id===id);if(!h)return;
 const before=Math.max(0,Number(h.count)||0);h.count=Math.max(0,before+step);
 P.trackCounter?.(h,before,h.count);
 D.persist();
 if(timers.has(id))clearTimeout(timers.get(id));
 timers.set(id,setTimeout(()=>{timers.delete(id);D.saveHunt(h)},1100));
}
function card(h,i){
 if(!h)return'<div class="v10-hunt-empty"><span>◎</span><b>Compteur '+(i+1)+'</b><p>Aucune chasse assignée.</p>'+P.btn('Créer une chasse','multi-new','','btn-secondary')+'</div>';
 const p=D.speciesById.get(Number(h.dex)),options=hunts().map(x=>[x.id,D.speciesName(x.dex)+' · '+x.game]);
 return'<section class="v10-hunt-tile" style="--v10-color:'+(['#75dcc2','#a8a5f1','#f0c98b','#8bbbea'][i])+'"><div class="v10-hunt-head"><select data-v10-hunt-slot="'+i+'" aria-label="Chasse du compteur '+(i+1)+'">'+P.opts(options,h.id)+'</select><span>G'+(p?.gen||'?')+'</span></div><div class="v10-hunt-img">'+P.sprite(h.dex)+'</div><h3>'+E(D.speciesName(h.dex))+'</h3><p>'+E(h.game)+' · '+E(h.method)+'</p><div class="v10-big-counter">'+F(h.count)+'</div><div class="v10-counter-buttons">'+[-1,1,5,10].map(x=>'<button data-action="xp-multi-count" data-id="'+E(h.id)+'" data-step="'+x+'">'+(x>0?'+':'')+x+'</button>').join('')+'</div><div class="v10-hunt-actions">'+P.btn('↶ Annuler','multi-undo','data-id="'+E(h.id)+'"','btn-small')+P.btn('✦ Capture !','multi-finish','data-id="'+E(h.id)+'"','btn-small btn-primary')+'</div></section>';
}
P.register('multihunt',()=>{
const ids=activeIds(),chosen=ids.map(id=>S.hunts.find(x=>x.id===id)).filter(Boolean);
return P.head('Tableau multi-chasse','Jusqu’à quatre compteurs en parallèle, avec grandes touches pour iPhone.',P.btn('＋ Nouvelle chasse','multi-new','','btn-primary'))+
'<div class="v10-hunt-headline"><span>◎ '+chosen.length+' chasse(s) affichée(s)</span><span>'+F(chosen.reduce((n,h)=>n+(Number(h.count)||0),0))+' tentatives cumulées sur ces compteurs</span></div>'+
'<div class="v10-wake-bar"><div><b>☀ Écran toujours actif</b><small>Empêche la mise en veille pendant l’utilisation, si ton navigateur l’autorise.</small></div>'+P.btn(wantWake?'Désactiver':'Activer','multi-wake','','btn-secondary')+'</div>'+
'<div class="v10-hunt-grid">'+[0,1,2,3].map((i)=>card(chosen[i],i)).join('')+'</div><div class="helper mt-18">Les compteurs sont sauvegardés localement à chaque appui, puis mis en attente pour Google Sheets. La fonction « Écran toujours actif » se coupe lorsque tu quittes l’application ou que l’appareil refuse la demande.</div>';
});
P.actions['multi-count']=e=>count(e.dataset.id,Number(e.dataset.step)||1);
P.actions['multi-new']=()=>window.ShinyDexUI?.huntForm();
P.actions['multi-undo']=e=>P.actions['undo']?.(e);
P.actions['multi-finish']=e=>{P.goto('hunts');P.toast('Termine la chasse depuis la fiche pour conserver son historique et la capture.')};
P.changes['multi-select']=e=>{const slot=e.target.dataset.v10HuntSlot;if(slot==null)return false;const i=Number(slot),current=activeIds();selectedHunters=current;selectedHunters[i]=e.target.value;selectedHunters=[...new Set(selectedHunters)];P.render();return true};
async function wake(){
 if(!('wakeLock' in navigator))return P.toast('Ton navigateur ne propose pas le verrouillage d’écran actif.',true);
 try{activeWake=await navigator.wakeLock.request('screen');wantWake=true;activeWake.addEventListener('release',()=>{activeWake=null;if(!wantWake)return;const el=$('.v10-wake-bar small');if(el)el.textContent='Veille autorisée par le système ; réactivation au retour dans l’application.'});P.toast('Écran maintenu actif tant que l’application est visible.')}catch(e){wantWake=false;P.toast('Verrouillage impossible : '+e.message,true)}
}
async function release(){wantWake=false;if(activeWake){try{await activeWake.release()}catch(e){}activeWake=null}}
P.actions['multi-wake']=()=>{if(wantWake)release().then(P.render);else wake().then(P.render)};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&wantWake&&!activeWake)wake()});
P.decorators.push((view)=>{if(!['hunts','huntlab','multihunt'].includes(view)&&wantWake)release()});
P.register('sessionjournal',()=>{
 const log=P.get('sessionJournal',[]),current=hunts();
 return P.head('Journal de sessions','Note interruptions, changements de méthode, objectifs et événements particuliers pendant une chasse.')+
 P.card('Ajouter une note de session','<div class="form-grid"><div><label>Chasse</label><select id="v10-journal-hunt">'+P.opts(current.map(h=>[h.id,D.speciesName(h.dex)+' · '+h.method]))+'</select></div><div><label>Événement</label><select id="v10-journal-kind">'+P.opts(['Observation','Pause','Reprise','Changement de méthode','Interruption','Éclosions','Phase','Autre'])+'</select></div></div><label class="mt-12">Note</label><textarea id="v10-journal-note" rows="3" placeholder="Ex. 3 heures de reset, changement de zone, 150 œufs éclos..."></textarea><div class="mt-12">'+P.btn('＋ Ajouter au journal','session-add','','btn-primary')+'</div>')+
 P.card('Historique',log.length?log.slice().reverse().slice(0,100).map(x=>'<div class="goal-card"><div class="grow"><b>'+E(x.kind)+' · '+E(x.pokemon)+'</b><p>'+new Date(x.date).toLocaleString('fr-FR')+' · compteur '+F(x.count)+'</p><p>'+E(x.note)+'</p></div></div>').join(''):'<p class="tiny">Aucune note de session enregistrée.</p>');
});
P.actions['session-add']=()=>{
const id=$('#v10-journal-hunt')?.value,h=S.hunts.find(h=>h.id===id);
if(!h)return P.toast('Commence une chasse pour ajouter une note.',true);
const note=String($('#v10-journal-note')?.value||'').trim(),kind=$('#v10-journal-kind')?.value||'Observation';
if(!note)return P.toast('Ajoute une description.',true);
const list=P.get('sessionJournal',[]);P.save('sessionJournal',[...list,{id:D.uid('entry'),huntId:id,pokemon:D.speciesName(h.dex),kind,note:note.slice(0,2000),date:new Date().toISOString(),count:Number(h.count)||0}].slice(-200));
};
const values=()=>D.aggregate().gen||[];
function seasonal(){
 const map=new Map();
 for(const c of S.captures){if(!safeDate(c.date)||year!=='all'&&c.date.slice(0,4)!==String(year))continue;const y=c.date.slice(0,4),q=Math.ceil(Number(c.date.slice(5,7))/3),key=y+'-T'+q;map.set(key,(map.get(key)||0)+(Number(c.qty)||1))}
 return [...map].sort((a,b)=>a[0].localeCompare(b[0]));
}
function hours(){
 const h=Array(24).fill(0);let known=0;for(const c of S.captures){const text=String(D.getMeta(c.id).captureTime||''),m=text.match(/^(\d{2}):(\d{2})/);if(!m)continue;const n=Number(m[1]);if(n>=0&&n<24){h[n]+=Number(c.qty)||1;known++}}return {h,known};
}
function droughts(){
 const dateList=S.captures.filter(c=>safeDate(c.date)).sort((a,b)=>a.date.localeCompare(b.date)),gaps=[];
 for(let i=1;i<dateList.length;i++){const from=dateList[i-1].date,to=dateList[i].date,days=Math.floor((new Date(to+'T12:00:00Z')-new Date(from+'T12:00:00Z'))/86400000);if(days>0)gaps.push({from,to,days})}
 gaps.sort((a,b)=>b.days-a.days);return gaps;
}
const bars=(items,fmt=x=>x)=>{const max=Math.max(1,...items.map(x=>x[1]));return'<div class="chart-bars">'+items.map(([name,n])=>'<div class="bar-row"><span>'+E(name)+'</span><div class="bar-track"><i style="width:'+(100*n/max)+'%"></i></div><b>'+E(fmt(n))+'</b></div>').join('')+'</div>'};
function chartCurve(){
 const max=Math.max(1,Number(tries)||1),od=Math.max(2,Number(rate)||4096),h=210,w=650,pts=[];
 for(let i=0;i<=100;i++){const n=i*max/100,p=odds(n,od);pts.push((45+i*(w-60)/100).toFixed(1)+','+(h-25-(p/100)*(h-45)).toFixed(1))}
 return'<svg class="v10-probability" viewBox="0 0 650 210" role="img" aria-label="Courbe de probabilité cumulée"><line x1="45" x2="635" y1="185" y2="185" stroke="currentColor" opacity=".35"/><line x1="45" x2="45" y1="20" y2="185" stroke="currentColor" opacity=".35"/><text x="10" y="25" fill="currentColor" font-size="11">100%</text><text x="20" y="186" fill="currentColor" font-size="11">0</text><polyline points="'+pts.join(' ')+'" fill="none" stroke="#5de3c2" stroke-width="4" stroke-linecap="round"/><text x="460" y="205" fill="currentColor" font-size="12">Tentatives : '+F(max)+'</text></svg>';
}
P.register('huntstatistics',()=>{
 const data=values(),hour=hours(),drought=droughts(),season=seasonal(),active=hunts(),years=[...new Set(S.captures.map(c=>safeDate(c.date)?c.date.slice(0,4):'').filter(Boolean))].sort().reverse();
 const genStats=data.map(x=>[x.name||'G'+x.gen,metric==='progress'?Math.round(100*(x.owned||0)/Math.max(1,x.total||1)):(x.owned||0)]);
 const seasons=season.slice(-20);const recentHun=active.slice().sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0)).slice(0,5);
 return P.head('Statistiques avancées de chasse','Courbes probabilistes, générations, heures de capture, longues périodes sans shiny et saisons.')+
 '<div class="v10-stats-tiles">'+[["Générations suivies",data.length],["Captures avec heure",hour.known],["Périodes documentées",drought.length],["Chasses actives",active.length]].map(([label,n])=>'<div class="stat-card"><div class="stat-top">'+label+'</div><div class="stat-value">'+F(n)+'</div></div>').join('')+'</div>'+
 '<div class="split">'+P.card('📊 Générations','<div class="segmented"><button data-action="xp-stats-mode" data-mode="progress" class="'+(metric==='progress'?'active':'')+'">Progression %</button><button data-action="xp-stats-mode" data-mode="count" class="'+(metric==='count'?'active':'')+'">Espèces</button></div><div class="mt-18">'+bars(genStats,x=>metric==='progress'?x+' %':F(x))+'</div>')+
 P.card('📈 Chance cumulée théorique','<div class="form-grid"><div><label>Taux individuel : 1 chance sur</label><input id="v10-odds-rate" type="number" min="2" value="'+rate+'"></div><div><label>Nombre de tentatives</label><input id="v10-odds-count" type="number" min="0" value="'+tries+'"></div></div><div class="v10-big-prob">'+odds(tries,rate).toFixed(2).replace('.',',')+' %</div>'+chartCurve()+P.btn('Actualiser la courbe','stats-calculate','','btn-secondary')+'<p class="tiny mt-12">Essais indépendants et même probabilité à chaque essai. Ne prédit pas la prochaine rencontre.</p>')+'</div>'+
 '<div class="split mt-18">'+P.card('🕰️ Heure des captures','<p class="tiny">'+hour.known+' captures avec une heure renseignée. Les captures sans heure ne sont pas devinées.</p>'+bars(hour.h.map((n,i)=>[String(i).padStart(2,'0')+'h',n]).filter(x=>x[1]).slice(0,24),F))+
 P.card('⌛ Plus longues périodes sans capture datée',drought.slice(0,8).map(x=>'<div class="goal-card"><div class="grow"><b>'+x.days+' jour(s)</b><p>'+x.from+' → '+x.to+'</p></div></div>').join('')||'<p class="tiny">Renseigne les dates pour identifier les périodes sans capture.</p>')+'</div>'+
 '<div class="split mt-18">'+P.card('🌸 Saisons et trimestres','<div class="toolbar"><select id="v10-season-year">'+P.opts([['all','Toutes années'],...years.map(x=>[x,x])],year)+'</select></div>'+bars(seasons,F))+
 P.card('🎯 Chasses en cours les plus longues',recentHun.map(h=>'<div class="goal-card"><div class="grow"><b>'+E(D.speciesName(h.dex))+'</b><p>'+E(h.method)+' · '+E(h.game)+'</p></div><span class="pill">'+F(h.count)+'</span></div>').join('')||'<p class="tiny">Aucune chasse en cours.</p>')+'</div>';
});
P.actions['stats-mode']=e=>{metric=e.dataset.mode==='count'?'count':'progress';P.render()};
P.actions['stats-calculate']=()=>{rate=Math.max(2,Number($('#v10-odds-rate')?.value)||4096);tries=Math.max(0,Number($('#v10-odds-count')?.value)||0);P.render()};
P.changes['stats-year']=e=>{if(e.target.id!=='v10-season-year')return false;year=e.target.value;P.render();return true};
})();