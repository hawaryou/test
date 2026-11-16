/* ShinyDex v10 — showroom, comparisons, stylized regional atlas, game skins and collector posters */
(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state,E=P.esc,F=P.fmt;
const $=x=>document.querySelector(x);
const THEMES=[
 {id:"auto",label:"Atmosphère actuelle",icon:"✦",color:"#63dfc1"},
 {id:"emerald",label:"Émeraude",icon:"🌿",color:"#63bb87"},
 {id:"heartgold",label:"HeartGold / SoulSilver",icon:"☀️",color:"#e5bb69"},
 {id:"unova",label:"Noir / Blanc",icon:"◈",color:"#8297c7"},
 {id:"kalos",label:"X / Y",icon:"🔷",color:"#729cdf"},
 {id:"alola",label:"Soleil / Lune",icon:"🌺",color:"#e7a26f"},
 {id:"galar",label:"Épée / Bouclier",icon:"🛡️",color:"#a98dcb"},
 {id:"hisui",label:"Légendes Arceus",icon:"🏔️",color:"#bd9867"},
 {id:"paldea",label:"Écarlate / Violet",icon:"🍇",color:"#a184e8"},
 {id:"lumiose",label:"Légendes Z-A",icon:"🌆",color:"#5dbed4"}
];
let galleryIndex=0,compId=0,compPct=50,onlyFav=false,region=1,posterTitle='Ma collection chromatique',posterIds=[];
const all=()=>S.captures.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
const favIds=()=>new Set(P.get('pinnedCaptures',[]));
function indexOfCapture(id){return all().findIndex(c=>c.id===id)}
function photo(id,shiny=true){return'<img loading="lazy" decoding="async" src="'+D.sprite(id,shiny)+'" alt="'+E(D.speciesName(id))+'" onerror="DexCore.imageFallback(this,'+Number(id)+','+shiny+')">'}
function overlayCard(c){const m=D.getMeta(c.id),p=D.speciesById.get(Number(c.dex));return'<div class="v10-full-card" style="--v10-rarity:'+(['#78e4c6','#c6a1ef','#e7c984'][Number(p?.gen||1)%3])+'"><div class="v10-full-head"><span>#'+String(c.dex).padStart(4,'0')+' · '+E(p?.name||D.speciesName(c.dex))+'</span><span>✧ SHINY</span></div><div class="v10-full-art">'+photo(c.dex)+'</div><strong>'+E(m.nickname||D.speciesName(c.dex))+'</strong><p>'+E(c.game||'Jeu non précisé')+' · '+E(c.method||'Méthode non précisée')+'</p><div class="v10-full-tags"><span>'+E(c.date||'Date inconnue')+'</span><span>'+E(c.attempts===''?'Sans compteur':F(c.attempts)+' rencontres')+'</span></div><div class="v10-full-footer">HAWARYOU · SHINY LIVING DEX</div></div>'}
function renderViewer(){const host=$('#v10-gallery-viewer');if(!host)return;const items=all().filter(c=>!onlyFav||favIds().has(c.id));if(!items.length){host.innerHTML='<p>Cette galerie ne contient aucun Pokémon.</p>';return}galleryIndex=(galleryIndex+items.length)%items.length;const c=items[galleryIndex];host.innerHTML='<div class="v10-viewer-bar"><span>'+Number(galleryIndex+1)+' / '+items.length+'</span><button type="button" data-action="xp-gallery-close" aria-label="Fermer la galerie">✕</button></div><div class="v10-viewer-row"><button type="button" data-action="xp-gallery-prev" aria-label="Précédent">‹</button>'+overlayCard(c)+'<button type="button" data-action="xp-gallery-next" aria-label="Suivant">›</button></div><div class="v10-viewer-actions">'+P.btn('✧ Comparer normal/shiny','gallery-compare','data-id="'+E(c.id)+'"','btn-secondary')+P.btn(favIds().has(c.id)?'★ Désépingler':'☆ Épingler','gallery-pin','data-id="'+E(c.id)+'"','btn-secondary')+'</div>'}
function openViewer(id){galleryIndex=Math.max(0,indexOfCapture(id));if($('#v10-gallery-viewer')){renderViewer();return}const layer=document.createElement('div');layer.id='v10-gallery-viewer';layer.className='v10-viewer';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Galerie immersive des Pokémon shiny');document.body.appendChild(layer);renderViewer();$('#v10-gallery-viewer [data-action="xp-gallery-close"]')?.focus()}
function closeViewer(){$('#v10-gallery-viewer')?.remove()}
const highlight=(p,i)=>'<button class="v10-poke-tile '+(favIds().has(p.id)?'is-pinned':'')+'" data-action="xp-gallery-open" data-id="'+E(p.id)+'" style="--v10-border:'+(['#5adfc7','#bca8fc','#e7c982'][i%3])+'"><span class="v10-poke-num">#'+String(p.dex).padStart(4,'0')+'</span>'+photo(p.dex)+'<strong>'+E(D.getMeta(p.id).nickname||D.speciesName(p.dex))+'</strong><small>'+E(p.game||'')+'</small></button>';
P.register('showroom',()=>{
const catches=all(),set=favIds(),filtered=onlyFav?catches.filter(c=>set.has(c.id)):catches;
const chosen=S.captures.find(c=>Number(c.dex)===compId)||catches[0];const dex=chosen?.dex||25;
return P.head('Galerie immersive','Admire tes Pokémon en grand format, compare leurs couleurs et crée ta vitrine collector.',P.btn('✨ Ouvrir le plein écran','gallery-open','data-id="'+E(filtered[0]?.id||'')+'"','btn-primary'))+
'<div class="v10-showcase-toolbar"><label><input type="checkbox" id="v10-only-pins" '+(onlyFav?'checked':'')+'/> Seulement les captures épinglées</label><span>'+filtered.length+' fiches</span></div><div class="v10-poke-tiles">'+filtered.slice(0,120).map(highlight).join('')+'</div>'+(filtered.length>120?'<p class="tiny mt-18">120 captures affichées ici. La galerie immersive permet de parcourir toute la collection.</p>':'')+
'<div class="subheading"><h2>↔ Comparateur normal / shiny</h2></div>'+
P.card('Glisse le curseur pour comparer les deux versions','<div class="toolbar"><select id="v10-compare-pokemon">'+P.opts(catches.map(c=>[c.id,D.speciesName(c.dex)+' · '+c.game]),chosen?.id||'')+'</select></div>'+
'<div class="v10-compare" id="v10-compare"><div class="v10-compare-bg">'+photo(dex,false)+'</div><div class="v10-compare-shiny" style="clip-path:inset(0 '+(100-compPct)+'% 0 0)">'+photo(dex,true)+'</div><div class="v10-compare-divider" style="left:'+compPct+'%"><span>↔</span></div><span class="v10-compare-label left">NORMAL</span><span class="v10-compare-label right">SHINY ✧</span></div>'+
'<label class="v10-slider-label" for="v10-compare-range">Comparaison : '+compPct+' %</label><input id="v10-compare-range" type="range" min="0" max="100" value="'+compPct+'" aria-label="Faire glisser pour comparer les sprites">')+
'<div class="helper mt-18">Les sprites proviennent de la collection PokéAPI. Certaines formes spéciales peuvent ne pas disposer de tous les visuels.</div>';
});
P.actions['gallery-open']=e=>openViewer(e.dataset.id);
P.actions['gallery-close']=closeViewer;
P.actions['gallery-prev']=()=>{galleryIndex--;renderViewer()};
P.actions['gallery-next']=()=>{galleryIndex++;renderViewer()};
P.actions['gallery-pin']=e=>{const set=favIds();set.has(e.dataset.id)?set.delete(e.dataset.id):set.add(e.dataset.id);P.save('pinnedCaptures',[...set]);renderViewer()};
P.actions['gallery-compare']=e=>{const c=S.captures.find(x=>x.id===e.dataset.id);if(c){compId=c.dex;closeViewer();P.goto('showroom');document.querySelector('#v10-compare')?.scrollIntoView({behavior:'smooth',block:'center'})}};
P.changes['v10-showroom']=e=>{if(e.target.id==='v10-only-pins'){onlyFav=e.target.checked;P.render();return true}if(e.target.id==='v10-compare-pokemon'){compId=Number(S.captures.find(c=>c.id===e.target.value)?.dex)||25;P.render();return true}return false};
P.inputs['v10-showroom']=e=>{if(e.target.id!=='v10-compare-range')return false;compPct=Number(e.target.value);const r=$('#v10-compare .v10-compare-shiny'),divider=$('#v10-compare .v10-compare-divider');if(r)r.style.clipPath='inset(0 '+(100-compPct)+'% 0 0)';if(divider)divider.style.left=compPct+'%';const label=$('.v10-slider-label');if(label)label.textContent='Comparaison : '+compPct+' %';return true};
document.addEventListener('keydown',e=>{if(!$('#v10-gallery-viewer'))return;if(e.key==='Escape')closeViewer();if(e.key==='ArrowLeft'){galleryIndex--;renderViewer()}if(e.key==='ArrowRight'){galleryIndex++;renderViewer()}});
const places=['Kanto','Johto','Hoenn','Sinnoh','Unys','Kalos','Alola','Galar','Paldea'];
const pos=[[10,24],[33,21],[58,17],[77,32],[14,55],[36,62],[59,51],[76,72],[91,57]];
P.register('regionatlas',a=>{
const g=a.gen||[];return P.head('Atlas chromatique','Une carte schématique et interactive des neuf régions, conçue pour naviguer dans le Living Dex.')+
P.card('🗺️ Neuf régions, neuf aventures','<div class="v10-atlas" aria-label="Plan stylisé, non géographique des régions Pokémon"><div class="v10-atlas-path"></div>'+places.map((n,i)=>{const x=g[i]||{owned:0,total:1};return'<button class="v10-atlas-pin '+(region===i+1?'chosen':'')+'" style="left:'+pos[i][0]+'%;top:'+pos[i][1]+'%" data-action="xp-atlas-region" data-n="'+(i+1)+'"><span>G'+(i+1)+'</span><strong>'+n+'</strong><small>'+x.owned+'/'+x.total+'</small></button>'}).join('')+'</div><p class="tiny mt-12">Schéma décoratif de navigation : il ne représente pas les positions géographiques réelles des régions.</p>')+
P.card('Progression de '+places[region-1],'<div class="v10-atlas-detail"><div class="ring" style="--percent:'+(100*(g[region-1]?.owned||0)/Math.max(1,g[region-1]?.total||1))+'%"><strong>'+Math.round(100*(g[region-1]?.owned||0)/Math.max(1,g[region-1]?.total||1))+'%</strong></div><div><h2>'+places[region-1]+'</h2><p>'+F(g[region-1]?.owned||0)+' espèces shiny sur '+F(g[region-1]?.total||0)+'</p>'+P.btn('Explorer cette génération','atlas-open','','btn-primary')+'</div></div>');
});
P.actions['atlas-region']=e=>{region=Math.max(1,Math.min(9,Number(e.dataset.n)||1));P.render()};
P.actions['atlas-open']=()=>window.ShinyDexUI?.setGeneration(region);
const selectedTheme=()=>P.get('gameSkin','auto');
P.register('gamethemes',()=>P.head('Thèmes par jeu','Choisis une ambiance graphique inspirée de tes générations préférées, sans modifier les données ou les couleurs enregistrées des Pokémon.')+
'<div class="v10-theme-grid">'+THEMES.map(x=>'<button class="v10-theme-card '+(selectedTheme()===x.id?'active':'')+'" data-action="xp-game-theme" data-theme="'+x.id+'" style="--theme-swatch:'+x.color+'"><span>'+x.icon+'</span><strong>'+E(x.label)+'</strong><small>'+(selectedTheme()===x.id?'✓ Thème actif':'Appliquer')+'</small></button>').join('')+'</div>');
P.actions['game-theme']=e=>P.save('gameSkin',e.dataset.theme);
P.decorators.push(()=>{document.body.dataset.gameSkin=selectedTheme()});
P.register('posters',()=>{
const chosen=posterIds.length?posterIds:all().slice(0,12).map(c=>c.id);
return P.head('Studio posters collector','Compose une affiche A4 de tes shiny préférés, puis utilise Imprimer → Enregistrer en PDF.',P.btn('🖨️ Générer mon poster','poster-print','','btn-primary'))+
P.card('Sélectionner les shinies','<div class="form-grid"><div><label>Titre du poster</label><input id="v10-poster-title" value="'+E(posterTitle)+'" placeholder="Ma collection chromatique"></div><div><label>Ajouter un Pokémon</label><select id="v10-poster-select">'+P.opts(all().map(c=>[c.id,D.speciesName(c.dex)+' · '+c.game]))+'</select></div></div><div class="chip-row mt-12">'+P.btn('＋ Ajouter','poster-add','','btn-secondary')+P.btn('Les 12 plus récents','poster-recent','','btn-secondary')+P.btn('Vider la sélection','poster-clear','','btn-ghost')+'</div><div class="v10-poster-preview">'+chosen.slice(0,24).map(id=>{const c=S.captures.find(c=>c.id===id);return c?'<div class="v10-poster-mini">'+photo(c.dex)+'<small>'+E(D.speciesName(c.dex))+'</small></div>':''}).join('')+'</div><p class="tiny">Jusqu’à 24 captures sur une affiche, avec sprites chargés depuis PokéAPI.</p>');
});
P.inputs['v10-poster']=e=>{if(e.target.id==='v10-poster-title'){posterTitle=e.target.value.slice(0,80);return true}return false};
P.actions['poster-add']=()=>{const id=$('#v10-poster-select')?.value;if(id&&!posterIds.includes(id)){posterIds.push(id);posterIds=posterIds.slice(0,24);P.render()}};
P.actions['poster-recent']=()=>{posterIds=all().slice(0,12).map(c=>c.id);P.render()};
P.actions['poster-clear']=()=>{posterIds=[];P.render()};
P.actions['poster-print']=()=>{
 const ids=posterIds.length?posterIds:all().slice(0,12).map(c=>c.id);if(!ids.length)return P.toast('Aucun shiny pour composer une affiche.',true);
 const sheet=document.createElement('section');sheet.id='v10-print-poster';sheet.className='v10-print-poster';sheet.innerHTML='<div class="v10-poster-head"><small>✦ HAWARYOU / SHINY LIVING DEX</small><h1>'+E(posterTitle)+'</h1><p>'+ids.length+' shinies choisis</p></div><div class="v10-poster-grid">'+ids.map(id=>{const c=S.captures.find(c=>c.id===id);return c?'<div class="v10-poster-entry">'+photo(c.dex)+'<b>'+E(D.speciesName(c.dex))+'</b><small>#'+c.dex+'</small></div>':''}).join('')+'</div><footer>✦ Collection chromatique · '+D.today()+'</footer>';
 document.body.appendChild(sheet);document.body.classList.add('v10-print-mode');Promise.race([Promise.all([...sheet.querySelectorAll('img')].map(x=>x.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,3000))]).then(()=>{window.print();setTimeout(()=>{sheet.remove();document.body.classList.remove('v10-print-mode')},1800)});
};
P.decorators.push((view,root)=>{if(view==='dashboard'&&!root.querySelector('.v10-showcase-link')){const box=root.querySelector('.hero-actions');if(box)box.insertAdjacentHTML('beforeend',P.btn('◈ Galerie collector','showroom','','btn-secondary')+'<span class="v10-showcase-link" hidden></span>')}});
})();