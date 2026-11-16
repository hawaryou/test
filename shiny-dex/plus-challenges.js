(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state,E=P.esc,F=P.fmt;
const today=()=>new Date().toISOString().slice(0,10);
const week=()=>{const d=new Date();d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10)};
const own=()=>new Set(S.captures.map(c=>Number(c.dex)));
function target(){const old=P.get('dailyTargets',{})[today()];if(old)return old;const miss=D.species.filter(p=>!own().has(p.id));if(!miss.length)return null;const dex=miss[[...today()].reduce((n,c)=>n+c.charCodeAt(0),0)%miss.length].id;P.local('dailyTargets',{...P.get('dailyTargets',{}),[today()]:dex});return dex}
function quests(){return [
 {title:'Obtenir un shiny cette semaine',id:'captures',value:S.captures.filter(c=>c.date>=week()).length,target:1},
 {title:'Enregistrer 30 rencontres cette semaine',id:'attempts',value:Object.values(P.get('counterHistory',{})).flat().filter(x=>new Date(x.date).toISOString().slice(0,10)>=week()).reduce((n,x)=>n+Math.max(0,Number(x.after)-Number(x.before)),0),target:30},
 {title:'Ajouter un Pokémon à ta wishlist cette semaine',id:'wish',value:S.wishlist.filter(x=>x.date>=week()).length,target:1},
 {title:'Terminer une chasse cette semaine',id:'hunt',value:S.events.filter(x=>x.category==='Shiny obtenu'&&String(x.date).slice(0,10)>=week()).length,target:1}
]}
P.register('quests',()=>{
const a=D.aggregate(),xp=a.stock*15+a.obtained*8+S.goals.filter(g=>g.status==='Terminée').length*120,level=Math.floor(Math.sqrt(xp/80))+1,dex=target();
const rows=quests().map(q=>'<div class="goal-card"><div class="grow"><b>'+E(q.title)+'</b><p>'+Math.min(q.value,q.target)+' / '+q.target+'</p><div class="progress"><span style="width:'+Math.min(100,q.value/q.target*100)+'%"></span></div></div><span class="pill '+(q.value>=q.target?'good':'')+'">'+(q.value>=q.target?'✓':'En cours')+'</span></div>').join('');
return [P.head('Défis & niveaux','Objectifs quotidiens et progression virtuelle. Les points sont ludiques et ne modifient pas les données officielles.'),
'<div class="stat-grid"><div class="stat-card"><div class="stat-top">Niveau</div><div class="stat-value">'+level+'</div></div><div class="stat-card"><div class="stat-top">XP virtuelle</div><div class="stat-value">'+F(xp)+'</div></div><div class="stat-card"><div class="stat-top">Défis</div><div class="stat-value">'+quests().filter(q=>q.value>=q.target).length+' / 4</div></div></div>',
'<div class="split">',P.card('🎲 Pokémon du jour',dex?'<div class="collection-hero">'+P.sprite(dex,false)+'<div><h2>'+E(D.speciesName(dex))+'</h2><p>Une espèce encore manquante</p>'+P.btn('Fiche Pokémon','challenge-detail','data-dex="'+dex+'"','btn-primary')+'</div></div>'+P.btn('Choisir une autre cible','challenge-reroll'):'<p>Toutes les espèces sont obtenues !</p>'),P.card('🎖️ Défis de la semaine',rows),'</div>'].join('')
});
P.actions['challenge-detail']=el=>window.ShinyDexUI?.speciesDetail?.(Number(el.dataset.dex));
P.actions['challenge-reroll']=()=>{const miss=D.species.filter(p=>!own().has(p.id)),chosen=miss[Math.floor(Math.random()*miss.length)];if(chosen)P.save('dailyTargets',{...P.get('dailyTargets',{}),[today()]:chosen.id})};
P.register('museum',()=>{
const ids=P.get('museum',[]).filter(id=>S.captures.some(c=>c.id===id));
const art=ids.map(id=>{const c=S.captures.find(x=>x.id===id);return'<button class="pokemon-card owned" data-action="xp-museum-remove" data-id="'+E(id)+'"><div class="sprite-wrap">'+P.sprite(c.dex)+'</div><strong>'+E(D.getMeta(id).nickname||D.speciesName(c.dex))+'</strong><div class="foot">'+E(c.game)+' • Retirer</div></button>'}).join('');
return [P.head('Musée de mes shinies','Expose les Pokémon les plus marquants de ta collection.'),P.card('🏛️ Galerie personnelle','<div class="pokemon-grid">'+art+'</div>'+(ids.length?'':'<p class="tiny">Aucun Pokémon exposé.</p>')),P.card('Ajouter un shiny','<div class="toolbar"><select id="xp-museum-select">'+P.opts(S.captures.map(c=>[c.id,D.speciesName(c.dex)+' — '+c.game]))+'</select>'+P.btn('Exposer','museum-add','','btn-primary')+'</div>')].join('')
});
P.actions['museum-add']=()=>{const id=document.querySelector('#xp-museum-select')?.value;if(id&&!P.get('museum',[]).includes(id))P.save('museum',[...P.get('museum',[]),id])};
P.actions['museum-remove']=el=>{if(confirm('Retirer ce shiny de la vitrine ?'))P.save('museum',P.get('museum',[]).filter(x=>x!==el.dataset.id))};
let size=3;
function draw(){const missing=D.species.filter(p=>!own().has(p.id));for(let i=missing.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[missing[i],missing[j]]=[missing[j],missing[i]]}return {size,dex:missing.slice(0,size*size).map(x=>x.id),date:today()}}
P.register('bingo',()=>{
const b=P.get('bingo',null),have=own(),cells=b?.dex.map(id=>'<button class="bingo-cell '+(have.has(Number(id))?'complete':'')+'" data-action="xp-bingo-detail" data-dex="'+id+'">'+P.sprite(id,have.has(Number(id)))+'<strong>'+E(D.speciesName(id))+'</strong><small>#'+id+' '+(have.has(Number(id))?'✓':'○')+'</small></button>').join('')||'';
return [P.head('Bingo Shiny','Grille aléatoire à compléter automatiquement avec les espèces possédées.'),P.card('Format','<div class="segmented">'+[3,5].map(n=>'<button data-action="xp-bingo-size" data-n="'+n+'" class="'+(size===n?'active':'')+'">'+n+' × '+n+'</button>').join('')+'</div><div class="mt-18">'+P.btn('Nouvelle grille','bingo-new','','btn-primary')+'</div>'),b?P.card('Ma grille '+b.size+' × '+b.size,'<div class="bingo-grid" style="--bingo-columns:'+b.size+'">'+cells+'</div>'):''].join('')
});
P.actions['bingo-size']=el=>{size=Number(el.dataset.n);P.render()};
P.actions['bingo-new']=()=>{if(confirm('Remplacer la grille actuelle ?'))P.save('bingo',draw())};
P.actions['bingo-detail']=el=>window.ShinyDexUI?.speciesDetail?.(Number(el.dataset.dex));
})();