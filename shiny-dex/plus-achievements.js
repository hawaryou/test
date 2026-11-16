/* ShinyDex · Grands Succès & Records (v13)
   Des badges calculés à partir des vraies captures. Aucun badge factice ni date d'obtention inventée. */
(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state,E=P.esc,F=P.fmt;
const CATS=[
 ['collection','💎','Collection'],['generations','🗺️','Générations'],
 ['methods','🎯','Méthodes'],['games','🎮','Jeux'],
 ['records','🏆','Endurance'],['history','📅','Chronologie'],
 ['forms','🧬','Formes'],['details','✨','Personnalisation']];
const TIERS=[['bronze','Bronze',10],['silver','Argent',25],['gold','Or',55],['platinum','Platine',100],['diamond','Diamant',180]];
const roman=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII'];
let category='all',status='all',rarity='all',search='',shown=48,sort='category';
const isDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))&&!Number.isNaN(Date.parse(String(v).slice(0,10)+'T12:00:00Z'));
const clean=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const n=v=>Math.max(0,Number(v)||0);
const bool=v=>v===true||['true','oui','yes','1'].includes(clean(v));
const tier=i=>TIERS[Math.min(i,4)][0];
const points=t=>TIERS.find(x=>x[0]===t)?.[2]||10;
function facts(a){
 const meta=new Map(S.meta.map(x=>[String(x.id),x]));
 const counters={favorite:0,nickname:0,ball:0,homeBox:0,marks:0,ribbons:0,photo:0,console:0,shalpha:0,fullOdds:0,charm:0,odds:0,gender:0,details:0};
 const special=new Set(),day=new Set(),years=new Set(),monthly=new Map(),yearly=new Map(),games=new Map(),methods=new Map(),attemptsCaptured=[];
 let entriesWithAttempts=0,record=0;
 for(const c of S.captures){
  const m=meta.get(String(c.id))||{},mtd=String(c.method||''),game=String(c.game||'');
  if(game.trim())games.set(game,(games.get(game)||0)+1);
  if(mtd.trim())methods.set(mtd,(methods.get(mtd)||0)+1);
  if(c.attempts!==''&&c.attempts!=null&&Number.isFinite(Number(c.attempts))&&Number(c.attempts)>=0){
   const q=Number(c.attempts);entriesWithAttempts++;record=Math.max(record,q);if(q>0)attemptsCaptured.push({...c,attempts:q});
  }
  const form=clean(c.form);
  if(form&&form!=='standard'&&form!=='normal')special.add(form);
  if(isDate(c.date)){
   const dayKey=String(c.date).slice(0,10),y=dayKey.slice(0,4),mon=dayKey.slice(0,7);
   day.add(dayKey);years.add(y);monthly.set(mon,(monthly.get(mon)||0)+1);yearly.set(y,(yearly.get(y)||0)+1);
  }
  if(bool(m.favorite))counters.favorite++;
  if(String(m.nickname||'').trim())counters.nickname++;
  if(String(m.ball||'').trim())counters.ball++;
  if(String(m.homeBox||'').trim())counters.homeBox++;
  if(String(m.marks||'').trim())counters.marks++;
  if(String(m.ribbons||'').trim())counters.ribbons++;
  if(String(m.photo||'').trim())counters.photo++;
  if(String(m.console||'').trim())counters.console++;
  if(bool(m.shalpha))counters.shalpha++;
  if(bool(m.fullOdds))counters.fullOdds++;
  if(bool(c.charm))counters.charm++;
  if(Number(m.odds)>=2)counters.odds++;
  if(String(m.gender||'').trim()&&clean(m.gender)!=='inconnu')counters.gender++;
  if(String(m.details||'').trim())counters.details++;
 }
 const formCaptures=S.captures.filter(c=>{const x=clean(c.form);return x&&x!=='standard'&&x!=='normal'}).length;
 const maxIn=m=>[...m].sort((a,b)=>b[1]-a[1])[0]||['—',0];
 const maxSpecies=[...a.by].sort((x,y)=>y[1].count-x[1].count)[0]||[0,{count:0}];
 const shortest=[...attemptsCaptured].sort((x,y)=>x.attempts-y.attempts)[0]||null;
 const regionBest=[...a.gen].filter(g=>g.total>0).sort((x,y)=>y.owned/y.total-x.owned/x.total)[0]||null;
 return {a,counters,special,day,years,monthly,yearly,games,methods,entriesWithAttempts,record,formCaptures,maxIn,maxSpecies,shortest,regionBest,
  bestYear:maxIn(yearly),bestMonth:maxIn(monthly),bestGame:maxIn(games),bestMethod:maxIn(methods)};
}
function catalogue(f){
 const b=[],a=f.a;
 const add=(id,cat,title,desc,icon,value,target,level=0)=>{
  const val=n(value),max=Math.max(1,Number(target)||1),lvl=tier(level);
  b.push({id,category:cat,title,desc,icon,current:val,target:max,done:val>=max,tier:lvl,points:points(lvl),ratio:Math.min(1,val/max)});
 };
 const ladder=(prefix,cat,label,desc,icon,val,levels)=>{
  levels.forEach((q,i)=>add(prefix+'-'+q,cat,label+' '+(roman[i]||String(i+1)),desc+' · objectif '+F(q),icon,val,q,Math.min(4,Math.floor(i*5/levels.length))));
 };
 ladder('species','collection','Éclats du Living Dex','Espèces shiny uniques enregistrées','💎',a.obtained,[1,5,10,25,50,75,100,150,200,250,300,400,500,750,1025]);
 ladder('stock','collection','Trésor chromatique','Exemplaires de shinies enregistrés','✨',a.stock,[1,10,25,50,100,150,200,300,500,750,1000]);
 ladder('duplicates','collection','Maître des doublons','Exemplaires possédés en supplément des espèces','♊',a.duplicated,[1,5,10,20,35,50,100,200]);
 for(const g of a.gen){
  if(!g.total)continue;
  const reg=['','Kanto','Johto','Hoenn','Sinnoh','Unys','Kalos','Alola','Galar–Hisui','Paldea'][g.gen]||g.name;
  for(const [i,pct] of [0,10,25,50,75,100].entries()){
   const goal=pct?Math.ceil(g.total*pct/100):1;
   add('region-'+g.gen+'-'+pct,'generations',reg+' · '+(pct?String(pct)+' %':'Première étoile'),
    pct?'Atteindre '+pct+' % des espèces de la génération '+g.gen:'Obtenir un premier shiny de la génération '+g.gen,'🗺️',g.owned,goal,i);
  }
 }
 const methodRules=[
  ['hordes','Hordes','👥',/hordes?/i],['sos','Chaînes SOS','📣',/\bsos\b/i],
  ['masuda','Méthode Masuda','🥚',/masuda|œufs|oeufs|egg/i],
  ['safari','Safari des Amis','🦋',/safari/i],['libres','Rencontres libres','🌿',/rencontres? libres?/i],
  ['resets','Soft resets','🔁',/reset/i],['dynamax','Dynamax','⚔️',/dynamax/i],
  ['peche','Pêche','🎣',/p[êe]che/i],['radar','Poké Radar','📡',/radar/i],
  ['hasard','Rencontres au hasard','🎲',/hasard/i]
 ];
 ladder('method-variety','methods','Polyvalence du chasseur','Méthodes distinctes documentées','🧭',f.methods.size,[1,3,5,7,10,15]);
 for(const [key,title,icon,re] of methodRules){
  const v=[...f.methods].filter(([name])=>re.test(name)).reduce((sum,[,count])=>sum+count,0);
  ladder('method-'+key,'methods',title,'Captures enregistrées avec cette méthode',icon,v,[1,5,10,25,50]);
 }
 ladder('game-variety','games','Collectionneur de jeux','Jeux Pokémon distincts représentés','🎮',f.games.size,[1,3,5,7,10,15,20,30]);
 ladder('game-record','games','Fidélité à un jeu','Captures réalisées dans un même jeu','🕹️',f.bestGame[1],[1,5,10,25,50,100]);
 ladder('attempts','records','Compteur légendaire','Tentatives documentées dans la collection','🎯',a.attempts,[1,100,500,1000,2500,5000,10000,25000,50000,100000,125000,250000,500000,1000000]);
 ladder('longest','records','Patience légendaire','Record de tentatives sur une seule capture documentée','🛡️',f.record,[1,100,500,1000,2048,4096,8192,10000,16384,20000]);
 ladder('documented','records','Chasses documentées','Captures avec nombre de tentatives renseigné','📘',f.entriesWithAttempts,[1,5,10,25,50,75,100,150,200,250]);
 ladder('years','history','Chroniqueur du temps','Années différentes avec au moins une capture datée','📅',f.years.size,[1,2,3,5,7,10]);
 ladder('yearly','history','Année éclatante','Captures datées sur une même année','🎊',f.bestYear[1],[1,5,10,20,30,50,75,100]);
 ladder('monthly','history','Mois chromatique','Captures datées pendant un même mois','🌙',f.bestMonth[1],[1,5,10,20,30,50]);
 ladder('days','history','Journal bien rempli','Jours distincts comportant des captures datées','🗓️',f.day.size,[1,10,25,50,100,200]);
 ladder('forms','forms','Au-delà des formes','Captures enregistrées avec une forme non standard','🧬',f.formCaptures,[1,5,10,20,50]);
 ladder('forms-variety','forms','Multiforme','Variantes non standard distinctes représentées','🦎',f.special.size,[1,3,5,7,10]);
 const metaLadders=[
  ['favorite','Étoiles favorites','⭐','Captures marquées comme favorites',[1,5,10,25,50]],
  ['nickname','Créateur de surnoms','✍️','Captures avec surnom renseigné',[1,5,10,25,50]],
  ['ball','Poké Ball de prestige','🔴','Captures avec Poké Ball renseignée',[1,5,10,25,50]],
  ['homeBox','Architecte HOME','📦','Captures rangées dans une boîte HOME',[1,5,10,25,50]],
  ['marks','Collectionneur de marques','🎗️','Captures avec marques renseignées',[1,5,10,25,50]],
  ['ribbons','Rubans précieux','🎀','Captures avec rubans renseignés',[1,5,10,25,50]],
  ['photo','Photographe shiny','📸','Captures avec photo renseignée',[1,5,10,25,50]],
  ['console','Explorateur de consoles','🎮','Captures avec console renseignée',[1,5,10,25,50]],
  ['shalpha','Barons chromatiques','👑','Captures signalées comme barons shiny',[1,3,5,10,25]],
  ['fullOdds','Puriste Full Odds','💫','Captures marquées Full Odds',[1,5,10,25,50]],
  ['charm','Charme Chroma','🍀','Captures documentées avec Charme Chroma',[1,10,25,50,100]],
  ['odds','Maîtrise des taux','📐','Captures avec taux 1/N renseigné',[1,5,10,25,50]],
  ['gender','Diversité des genres','⚤','Captures avec sexe renseigné',[1,10,25,50,100]],
  ['details','Carnet d’explorateur','📒','Captures avec détails complémentaires',[1,5,10,25,50]]
 ];
 for(const [key,title,icon,desc,levels] of metaLadders)
  ladder('meta-'+key,'details',title,desc,icon,f.counters[key],levels);
 return b;
}
function recordList(f){
 const a=f.a,min=f.shortest,record=a.record,best=f.regionBest;
 return [
  {icon:'⏳',label:'Plus longue chasse documentée',value:record?F(record.attempts)+' tentatives':'Non renseigné',foot:record?D.speciesName(record.dex)+' · '+(record.game||'Jeu non indiqué'):'Ajoute des rencontres pour débloquer ce record'},
  {icon:'⚡',label:'Plus courte chasse documentée',value:min?F(min.attempts)+' tentative'+(min.attempts>1?'s':''):'Non renseigné',foot:min?D.speciesName(min.dex)+' · '+(min.method||'Méthode non indiquée'):'Les zéros et compteurs absents ne sont pas pris pour une chasse courte'},
  {icon:'🎮',label:'Jeu le plus représenté',value:f.bestGame[1]?f.bestGame[0]:'Non renseigné',foot:F(f.bestGame[1])+' capture(s)'},
  {icon:'🎯',label:'Méthode la plus utilisée',value:f.bestMethod[1]?f.bestMethod[0]:'Non renseigné',foot:F(f.bestMethod[1])+' capture(s)'},
  {icon:'📅',label:'Année la plus productive',value:f.bestYear[1]?String(f.bestYear[0]):'Non renseigné',foot:F(f.bestYear[1])+' capture(s) datée(s)'},
  {icon:'🌙',label:'Mois record',value:f.bestMonth[1]?String(f.bestMonth[0]):'Non renseigné',foot:F(f.bestMonth[1])+' capture(s) datée(s)'},
  {icon:'🗺️',label:'Génération la plus avancée',value:best?(best.name||'G'+best.gen):'Non renseigné',foot:best?F(best.owned)+' / '+F(best.total)+' espèces':'Aucune génération'},
  {icon:'♊',label:'Plus grand nombre d’une espèce',value:f.maxSpecies[1].count?D.speciesName(f.maxSpecies[0]):'Non renseigné',foot:F(f.maxSpecies[1].count)+' exemplaire(s)'},
  {icon:'🧬',label:'Formes non standard',value:F(f.formCaptures),foot:F(f.special.size)+' variante(s) distincte(s)'},
  {icon:'🥇',label:'Espèces shiny obtenues',value:F(a.obtained)+' / '+F(a.total),foot:(a.percentage*100).toFixed(1).replace('.',',')+' % du Living Dex'}
 ];
}
function graphic(b,small=false){
 return '<span class="sdx-medal '+(b.done?'is-earned':'is-locked')+' medal-'+b.tier+(small?' medal-small':'')+'" aria-hidden="true"><span class="sdx-medal-shine"></span><span class="sdx-medal-center">'+E(b.icon)+'</span><span class="sdx-medal-star">✦</span></span>';
}
function badgeCard(b){
 return '<button class="sdx-badge-card '+(b.done?'earned':'locked')+' tier-'+b.tier+'" data-action="xp-badge-detail" data-id="'+E(b.id)+'" aria-label="'+E(b.title)+' · '+(b.done?'débloqué':'en progression')+'">'+
  '<div class="sdx-badge-top"><span class="sdx-badge-rank">'+E(TIERS.find(t=>t[0]===b.tier)[1])+'</span><span class="sdx-badge-state">'+(b.done?'✓ Obtenu':'🔒 À obtenir')+'</span></div>'+
  graphic(b)+'<strong class="sdx-badge-title">'+E(b.title)+'</strong><span class="sdx-badge-desc">'+E(b.desc)+'</span>'+
  '<div class="sdx-badge-progress"><span style="width:'+(b.ratio*100).toFixed(2)+'%"></span></div>'+
  '<span class="sdx-badge-count">'+F(b.current)+' / '+F(b.target)+' <b>+'+b.points+' pts</b></span></button>';
}
function renderAwards(){
 const f=facts(D.aggregate()),all=catalogue(f),unlocked=all.filter(x=>x.done),earnedPts=unlocked.reduce((s,x)=>s+x.points,0);
 const next=all.filter(x=>!x.done&&x.current>0).sort((x,y)=>y.ratio-x.ratio||x.target-y.target)[0]||all.find(x=>!x.done);
 const highlightId=P.get('badgeSpotlight',''),highlight=all.find(x=>x.id===highlightId&&x.done)||unlocked.slice().sort((x,y)=>y.points-x.points)[0];
 let list=all.filter(b=>(category==='all'||b.category===category)&&(status==='all'||(status==='earned'?b.done:status==='locked'?!b.done:!b.done&&b.ratio>=.5))&&(rarity==='all'||b.tier===rarity)&&(!search||clean(b.title+' '+b.desc+' '+b.category+' '+b.tier).includes(clean(search))));
 if(sort==='progress')list.sort((x,y)=>y.ratio-x.ratio||x.title.localeCompare(y.title,'fr'));
 if(sort==='rarity')list.sort((x,y)=>TIERS.findIndex(t=>t[0]===y.tier)-TIERS.findIndex(t=>t[0]===x.tier)||y.ratio-x.ratio);
 if(sort==='earned')list.sort((x,y)=>Number(y.done)-Number(x.done)||y.ratio-x.ratio);
 if(sort==='category')list.sort((x,y)=>CATS.findIndex(c=>c[0]===x.category)-CATS.findIndex(c=>c[0]===y.category)||Number(y.done)-Number(x.done)||x.title.localeCompare(y.title,'fr'));
 const shownList=list.slice(0,shown),level=Math.floor(Math.sqrt(earnedPts/60))+1;
 const controls='<section class="sdx-award-controls">'+
  '<div class="sdx-award-search"><span aria-hidden="true">⌕</span><input type="search" id="sdx-badge-search" aria-label="Rechercher un badge" placeholder="Rechercher un succès, une génération, une méthode..." value="'+E(search)+'"></div>'+
  '<div class="sdx-award-filters" aria-label="État des badges">'+[['all','Tous'],['earned','Débloqués'],['locked','Verrouillés'],['near','Presque obtenus']].map(([id,label])=>'<button class="sdx-filter '+(status===id?'selected':'')+'" data-action="xp-badge-status" data-id="'+id+'">'+label+'</button>').join('')+'</div>'+
  '<div class="sdx-award-selects"><label>Catégorie<select id="sdx-badge-category">'+P.opts([['all','Toutes les catégories'],...CATS.map(c=>[c[0],c[1]+' '+c[2]])],category)+'</select></label>'+
  '<label>Rareté<select id="sdx-badge-rarity">'+P.opts([['all','Toutes les raretés'],...TIERS.map(t=>[t[0],t[1]])],rarity)+'</select></label>'+
  '<label>Trier par<select id="sdx-badge-sort">'+P.opts([['category','Catégories'],['progress','Progression'],['rarity','Rareté'],['earned','Obtenus en premier']],sort)+'</select></label></div></section>';
 const categoryTiles=CATS.map(([id,emoji,label])=>{const items=all.filter(b=>b.category===id),done=items.filter(b=>b.done).length;return'<button class="sdx-award-category '+(category===id?'active':'')+'" data-action="xp-badge-category" data-id="'+id+'"><span>'+emoji+'</span><strong>'+label+'</strong><small>'+done+' / '+items.length+'</small><i><em style="width:'+(100*done/items.length).toFixed(2)+'%"></em></i></button>'}).join('');
 const records=recordList(f).map(r=>'<div class="sdx-record-tile"><span class="sdx-record-icon">'+r.icon+'</span><div><span class="sdx-record-label">'+E(r.label)+'</span><strong>'+E(r.value)+'</strong><small>'+E(r.foot)+'</small></div></div>').join('');
 return P.head('Succès & records','Collectionne tes médailles, suis ta progression et découvre tes records personnels. Tous les badges sont calculés automatiquement.')+
 '<section class="sdx-awards-hero"><div class="sdx-awards-hero-info"><span class="sdx-awards-kicker">🏅 TON PALMARÈS CHROMATIQUE</span><h2>'+unlocked.length+' <span>/ '+all.length+' badges</span></h2><p>Chaque nouvelle capture, chasse documentée ou fiche enrichie peut débloquer des médailles.</p><div class="sdx-awards-hero-track"><i style="width:'+(100*unlocked.length/all.length).toFixed(2)+'%"></i></div><div class="sdx-awards-hero-numbers"><span>'+((100*unlocked.length/all.length).toFixed(1)).replace('.',',')+' % accomplis</span><span>'+F(earnedPts)+' points · Niveau '+level+'</span></div></div>'+
 '<div class="sdx-awards-hero-spotlight">'+(highlight?graphic(highlight):'<span class="sdx-awards-empty-icon">🏆</span>')+'<strong>'+E(highlight?.title||'Ton premier badge t’attend')+'</strong><small>'+E(highlight?'Médaille à la une':'Débloque ton premier succès')+'</small></div></section>'+
 '<div class="sdx-awards-summary"><div><strong>'+unlocked.length+'</strong><small>Débloqués</small></div><div><strong>'+F(all.length-unlocked.length)+'</strong><small>À conquérir</small></div><div><strong>'+F(earnedPts)+'</strong><small>Points de prestige</small></div><div><strong>'+level+'</strong><small>Niveau collectionneur</small></div></div>'+
 (next?'<div class="sdx-awards-next"><span>🎯</span><div><strong>Prochain badge accessible : '+E(next.title)+'</strong><small>'+F(next.current)+' / '+F(next.target)+' · '+E(next.desc)+'</small><i><em style="width:'+(next.ratio*100)+'%"></em></i></div>'+P.btn('Voir','badge-detail','data-id="'+E(next.id)+'"','btn-small btn-secondary')+'</div>':'')+
 '<div class="sdx-awards-section-title"><h2>🏵️ Mes collections de badges</h2><small>Appuie sur une famille pour la filtrer</small></div>'+
 '<div class="sdx-award-categories">'+categoryTiles+'</div>'+
 '<div class="sdx-awards-section-title"><h2>🏅 Vitrine des médailles</h2><small>'+list.length+' succès dans la sélection</small></div>'+controls+
 '<div class="sdx-badge-gallery">'+shownList.map(badgeCard).join('')+'</div>'+
 (shownList.length<list.length?'<div class="sdx-awards-more">'+P.btn('Afficher '+Math.min(48,list.length-shownList.length)+' badges supplémentaires','badge-more','','btn-primary')+'</div>':'')+
 (list.length===0?'<div class="sdx-badge-empty">🔎 Aucun badge pour ces filtres. Essaie une autre catégorie ou un autre mot.</div>':'')+
 '<div class="sdx-awards-section-title"><h2>📜 Livre des records</h2><small>Records calculés à partir des informations renseignées</small></div>'+
 '<div class="sdx-record-grid">'+records+'</div>'+
 '<p class="sdx-awards-hint">Les succès sont recalculés depuis tes données : aucun badge n’est attribué pour une information absente. Le niveau et les points sont des récompenses virtuelles. Aucune date de déblocage n’est inventée.</p>';
}
P.register('achievements',renderAwards);
P.labels.achievements='Succès & records';
const reset=()=>{shown=48;P.render()};
P.actions['badge-more']=()=>{shown+=48;P.render()};
P.actions['badge-filter-reset']=()=>{category='all';status='all';rarity='all';search='';shown=48;P.render()};
P.actions['badge-status']=el=>{status=el.dataset.id||'all';reset()};
P.actions['badge-category']=el=>{category=category===el.dataset.id?'all':el.dataset.id;reset()};
P.actions['badge-feature']=el=>{const b=catalogue(facts(D.aggregate())).find(x=>x.id===el.dataset.id);if(!b?.done)return P.toast('Ce badge sera disponible une fois débloqué.',true);P.save('badgeSpotlight',b.id);P.toast('Médaille mise à la une !');P.modalClose();P.render()};
P.actions['badge-detail']=el=>{
 const b=catalogue(facts(D.aggregate())).find(x=>x.id===el.dataset.id);if(!b)return;
 const inner='<div class="sdx-badge-modal-preview">'+graphic(b)+'<div><span class="sdx-modal-rank">'+E(TIERS.find(t=>t[0]===b.tier)[1])+' · '+b.points+' points</span><h3>'+E(b.title)+'</h3><p>'+E(b.desc)+'</p><strong>'+(b.done?'✓ Succès débloqué':'🔒 Encore '+F(Math.max(0,b.target-b.current))+' à réaliser')+'</strong></div></div>'+
 '<div class="sdx-badge-modal-stats"><span>Progression <b>'+F(b.current)+' / '+F(b.target)+'</b></span><i><em style="width:'+(100*b.ratio)+'%"></em></i></div>';
 const footer=b.done?P.btn('🌟 Mettre à la une','badge-feature','data-id="'+E(b.id)+'"','btn-primary')+P.btn('⬇ Télécharger le badge','badge-export','data-id="'+E(b.id)+'"','btn-secondary'):'<span class="tiny">Continue tes chasses pour débloquer cette récompense.</span>';
 window.ShinyDexUI?.modalOpen(b.title,inner,footer);
};
P.actions['badge-export']=el=>{
 const b=catalogue(facts(D.aggregate())).find(x=>x.id===el.dataset.id&&x.done);
 if(!b)return P.toast('Le badge doit être débloqué pour être téléchargé.',true);
 const scheme={bronze:['#aa6c46','#f8d6a8'],silver:['#64889d','#f1f9ff'],gold:['#9c7027','#ffe5a0'],platinum:['#347e83','#d5f9f1'],diamond:['#6252af','#e5d9ff']}[b.tier];
 const svg='<?xml version="1.0" encoding="UTF-8"?>'+
 '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900">'+
 '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#12273e"/><stop offset="1" stop-color="#282444"/></linearGradient>'+
 '<linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+scheme[1]+'"/><stop offset="1" stop-color="'+scheme[0]+'"/></linearGradient></defs>'+
 '<rect width="720" height="900" rx="35" fill="url(#bg)"/><rect x="20" y="20" width="680" height="860" rx="27" fill="none" stroke="'+scheme[1]+'" stroke-width="5" opacity=".8"/>'+
 '<text x="360" y="105" font-size="23" letter-spacing="8" fill="#b9f5de" text-anchor="middle" font-weight="700">SHINYDEX</text>'+
 '<text x="360" y="150" font-size="19" fill="#c4d9ea" text-anchor="middle">HAWARYOU · SUCCÈS CHROMATIQUE</text>'+
 '<path d="M360 205 L493 250 L535 390 L490 530 L360 594 L230 530 L185 390 L225 250 Z" fill="url(#m)" stroke="#ffffff" stroke-width="6"/>'+
 '<circle cx="360" cy="397" r="131" fill="'+scheme[0]+'" stroke="#ffffffaa" stroke-width="6"/>'+
 '<text x="360" y="433" font-size="130" text-anchor="middle">'+E(b.icon)+'</text>'+
 '<text x="360" y="663" font-size="24" fill="'+scheme[1]+'" text-anchor="middle" letter-spacing="5">'+E(TIERS.find(x=>x[0]===b.tier)[1].toUpperCase())+'</text>'+
 '<text x="360" y="735" font-size="31" fill="#ffffff" text-anchor="middle" font-weight="800" textLength="600" lengthAdjust="spacingAndGlyphs">'+E(b.title)+'</text>'+
 '<text x="360" y="805" font-size="22" fill="#c3d8e8" text-anchor="middle">BADGE DÉBLOQUÉ · +'+b.points+' POINTS</text>'+
 '<text x="360" y="850" font-size="14" fill="#96b1c1" text-anchor="middle">Trophée virtuel calculé depuis la collection personnelle</text></svg>';
 D.download('ShinyDex-badge-'+b.id+'.svg',svg,'image/svg+xml;charset=utf-8');
};
P.changes['badge-selects']=e=>{
 const id=e.target.id,val=e.target.value;
 if(id==='sdx-badge-category'){category=val;reset();return true}
 if(id==='sdx-badge-rarity'){rarity=val;reset();return true}
 if(id==='sdx-badge-sort'){sort=val;reset();return true}
 return false;
};
P.inputs['badge-search']=e=>{
 if(e.target.id!=='sdx-badge-search')return false;
 search=e.target.value;shown=48;P.render();
 const field=document.querySelector('#sdx-badge-search');
 if(field){field.focus();try{field.setSelectionRange(search.length,search.length)}catch(_){}}
 return true;
};
P.achievementData=()=>{const all=catalogue(facts(D.aggregate()));return {all,earned:all.filter(x=>x.done),records:recordList(facts(D.aggregate()))}};
P.decorators.push((view,root)=>{
 if(view!=='dashboard'||root.querySelector('.sdx-home-awards'))return;
 const anchor=root.querySelector('.stat-grid');if(!anchor)return;
 const all=catalogue(facts(D.aggregate())),won=all.filter(b=>b.done),tops=won.slice().sort((x,y)=>y.points-x.points||y.target-x.target).slice(0,3);
 const section=document.createElement('section');section.className='panel sdx-home-awards';
 section.innerHTML='<div class="sdx-home-awards-head"><div><span class="eyebrow">✦ TON PALMARÈS</span><h3>🏆 Mes badges chromatiques</h3><p>'+won.length+' médailles débloquées sur '+all.length+' succès</p></div>'+P.btn('Voir mes '+all.length+' badges','achievements','','btn-small btn-primary')+'</div>'+
 '<div class="sdx-home-medals">'+tops.map(b=>'<button class="sdx-home-medal" data-action="xp-badge-detail" data-id="'+E(b.id)+'">'+graphic(b,true)+'<strong>'+E(b.title)+'</strong><small>'+E(TIERS.find(x=>x[0]===b.tier)[1])+'</small></button>').join('')+'</div>';
 anchor.insertAdjacentElement('afterend',section);
});

})();