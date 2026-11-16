/* ShinyDex v10 — global search, saved filters, rapid capture, guided tutorial and dashboard layout */
(()=>{'use strict';const P=window.ShinyPlus,D=window.DexCore,S=D.state,E=P.esc,F=P.fmt,$=x=>document.querySelector(x);
let query='',game='all',method='all',scope='all',tour=0;
const SEARCH_SECTIONS=[['captures','Captures'],['pokemon','Pokédex'],['hunts','Chasses'],['boxes','Boîtes HOME']];
const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const pinned=()=>new Set(P.get('pinnedCaptures',[]));
function results(){
 const q=normalize(query),rs={captures:[],pokemon:[],hunts:[],boxes:[]};if(!q)return rs;
 for(const c of S.captures){const m=D.getMeta(c.id);if(game!=='all'&&c.game!==game||method!=='all'&&c.method!==method)continue;
 const values=[D.speciesName(c.dex),String(c.dex),c.game,c.method,c.notes,m.nickname,m.ball,m.tags,m.homeBox,m.location,m.marks];
 if(values.some(v=>normalize(v).includes(q)))rs.captures.push(c);
 if(m.homeBox&&normalize(m.homeBox).includes(q))rs.boxes.push({c,position:m.homeBox});}
 for(const p of D.species)if(normalize(p.name).includes(q)||String(p.id)===q)rs.pokemon.push(p);
 for(const h of S.hunts)if([D.speciesName(h.dex),h.game,h.method,String(h.count),h.notes].some(v=>normalize(v).includes(q)))rs.hunts.push(h);
 return rs;
}
P.register('searchhub',()=>{
 const rs=results(),total=Object.values(rs).reduce((n,v)=>n+v.length,0),presets=P.get('savedFilters',[]);
 const nav=SEARCH_SECTIONS.map(([key,name])=>'<span class="pill">'+name+' : '+rs[key].length+'</span>').join(' ');
 const cap=rs.captures.slice(0,25).map(c=>'<button class="v10-search-result" data-action="xp-search-capture" data-id="'+E(c.id)+'">'+P.sprite(c.dex)+'<span><b>'+E(D.speciesName(c.dex))+'</b><small>'+E(c.game)+' · '+E(c.method)+'</small></span><small>Voir →</small></button>').join('');
 const pok=rs.pokemon.slice(0,20).map(p=>'<button class="v10-search-result" data-action="xp-search-pokemon" data-dex="'+p.id+'">'+P.sprite(p.id)+'<span><b>'+E(p.name)+'</b><small>#'+p.id+' · G'+p.gen+'</small></span><small>Pokédex →</small></button>').join('');
 const hun=rs.hunts.slice(0,15).map(h=>'<button class="v10-search-result" data-action="xp-search-hunt"><span class="v10-result-icon">◎</span><span><b>'+E(D.speciesName(h.dex))+'</b><small>'+E(h.method)+' · '+F(h.count)+' tentatives</small></span></button>').join('');
 const boxes=rs.boxes.slice(0,10).map(({c,position})=>'<button class="v10-search-result" data-action="xp-search-box"><span class="v10-result-icon">▦</span><span><b>'+E(D.speciesName(c.dex))+'</b><small>'+E(position)+'</small></span></button>').join('');
 return P.head('Recherche universelle','Recherche dans les Pokémon, tes captures, chasses, notes et emplacements HOME.')+
 P.card('⌕ Rechercher partout','<input id="v10-global-search" type="search" value="'+E(query)+'" autocomplete="off" placeholder="Pokémon, #025, jeu, méthode ou boîte...">'+
 '<div class="toolbar mt-12"><select id="v10-search-game">'+P.opts([['all','Tous les jeux'],...new Set(S.captures.map(x=>x.game))].map(x=>Array.isArray(x)?x:[x,x]),game)+'</select><select id="v10-search-method">'+P.opts([['all','Toutes méthodes'],...new Set(S.captures.map(x=>x.method))].map(x=>Array.isArray(x)?x:[x,x]),method)+'</select>'+
 P.btn('☆ Enregistrer le filtre','search-save','','btn-secondary')+'</div><div class="chip-row">'+presets.map(p=>'<button class="chip" data-action="xp-search-preset" data-id="'+E(p.id)+'">'+E(p.name)+'</button>').join('')+'</div><div class="chip-row mt-12">'+nav+'</div>')+
 (query.trim()?'<div class="v10-search-results"><div class="subheading"><h2>'+total+' résultat(s)</h2></div>'+[["Captures",cap,rs.captures.length],["Pokédex",pok,rs.pokemon.length],["Chasses",hun,rs.hunts.length],["Boîtes HOME",boxes,rs.boxes.length]].filter(x=>x[2]).map(([name,html,count])=>P.card(name+' · '+count,html)).join('')+'</div>':'<div class="v10-search-prompt">⌕ <b>Commence à saisir un nom, un jeu ou une méthode.</b><p>Les données restent sur ton appareil ; aucune recherche n’est envoyée à un service externe.</p></div>');
});
P.inputs.searchhub=e=>{if(e.target.id!=='v10-global-search')return false;query=e.target.value;P.render();const el=$('#v10-global-search');el?.focus();el?.setSelectionRange(query.length,query.length);return true};
P.changes.searchhub=e=>{if(e.target.id==='v10-search-game'){game=e.target.value;P.render();return true}if(e.target.id==='v10-search-method'){method=e.target.value;P.render();return true}return false};
P.actions['search-capture']=e=>window.ShinyDexUI?.captureForm(0,S.captures.find(c=>c.id===e.dataset.id));
P.actions['search-pokemon']=e=>window.ShinyDexUI?.speciesDetail?.(Number(e.dataset.dex));
P.actions['search-hunt']=()=>P.goto('hunts');
P.actions['search-box']=()=>P.goto('boxes');
P.actions['search-save']=()=>{const name=prompt('Nom de ce filtre',query||'Mon filtre');if(!name)return;const presets=P.get('savedFilters',[]);P.save('savedFilters',[...presets,{id:D.uid('flt'),name:name.slice(0,40),query,game,method}].slice(-18));P.toast('Filtre enregistré.')};
P.actions['search-preset']=e=>{const p=P.get('savedFilters',[]).find(x=>x.id===e.dataset.id);if(!p)return;query=p.query;game=p.game;method=p.method;P.render()};
P.register('quickcapture',()=>{
 const defaultGame=S.settings.currentGame||S.captures[0]?.game||'',defaultMethod=S.settings.currentMethod||'Rencontres libres';
 return P.head('Ajouter un shiny rapidement','Une saisie à une main avec les champs essentiels. Les informations avancées restent éditables ensuite.')+
 P.card('✦ Nouvelle capture','<form id="v10-quick-form"><div class="v10-fast-preview"><div class="v10-fast-sprite" id="v10-fast-sprite">✦</div><div><strong id="v10-fast-name">Choisis un Pokémon</strong><p class="tiny">Enregistrement local immédiat, puis envoi à Google Sheets quand disponible.</p></div></div>'+
 '<label>Pokémon *</label><select id="v10-fast-dex" required>'+P.opts([['','Sélectionner...'],...D.species.map(x=>[x.id,'#'+String(x.id).padStart(4,'0')+' · '+x.name])])+'</select>'+
 '<div class="form-grid mt-12"><div><label>Jeu *</label><select id="v10-fast-game">'+P.opts([['','Choisir...'],...D.games.map(x=>[x.name,x.name])],defaultGame)+'</select></div><div><label>Méthode *</label><select id="v10-fast-method">'+P.opts(D.METHODS,defaultMethod)+'</select></div>'+
 '<div><label>Tentatives</label><input id="v10-fast-attempts" inputmode="numeric" type="number" min="0" placeholder="Non comptées"></div><div><label>Date</label><input id="v10-fast-date" type="date" value="'+D.today()+'"></div></div>'+
 '<div class="v10-fast-actions"><button type="button" class="btn btn-secondary" data-action="xp-fast-details">Saisie complète</button><button type="button" class="btn btn-primary" data-action="xp-fast-save">✦ Enregistrer le shiny</button></div></form>')+
 '<div class="helper mt-18">Aucun envoi externe n’est déclenché sans la configuration Apps Script. Tu retrouveras la capture dans ton journal.</div>';
});
P.changes.fast=e=>{if(e.target.id!=='v10-fast-dex')return false;const n=Number(e.target.value),image=$('#v10-fast-sprite'),name=$('#v10-fast-name');if(image)image.innerHTML=n?P.sprite(n):'✦';if(name)name.textContent=n?D.speciesName(n):'Choisis un Pokémon';return true};
P.actions['fast-details']=()=>window.ShinyDexUI?.captureForm(Number($('#v10-fast-dex')?.value)||0);
P.actions['fast-save']=()=>{
 const dex=Number($('#v10-fast-dex')?.value),game=$('#v10-fast-game')?.value||'',method=$('#v10-fast-method')?.value||'',text=$('#v10-fast-attempts')?.value??'',date=$('#v10-fast-date')?.value||D.today();
 if(!D.speciesById.has(dex)||!game||!method)return P.toast('Pokémon, jeu et méthode sont obligatoires.',true);
 if(text!==''&&(!Number.isInteger(Number(text))||Number(text)<0))return P.toast('Compteur invalide.',true);
 const recent=S.captures.find(c=>Number(c.dex)===dex&&c.game===game&&c.method===method&&c.date===date&&String(c.attempts)===text);
 if(recent&&!confirm('Une capture très similaire est déjà enregistrée. Ajouter quand même un autre exemplaire ?'))return;
 D.saveCapture({dex,game,method,attempts:text,qty:1,date,form:'Standard',charm:'Inconnu'});
 P.toast('✨ '+D.speciesName(dex)+' enregistré dans ton journal.');P.goto('captures');
};
const steps=[
 {title:'Bienvenue dans ShinyDex',icon:'✦',desc:'Ce guide t’aide à retrouver rapidement les informations essentielles sans modifier ton journal.',view:'dashboard'},
 {title:'Ta collection Pokémon',icon:'◈',desc:'Le Pokédex distingue les espèces obtenues, manquantes et leurs doublons. Une espèce possédée est comptée une seule fois dans le National Dex.',view:'pokedex'},
 {title:'Saisir une capture',icon:'＋',desc:'Le formulaire rapide conserve le jeu, la méthode, les tentatives et la date. Les détails supplémentaires restent accessibles depuis le journal.',view:'quickcapture'},
 {title:'Continuer une chasse',icon:'◎',desc:'Les compteurs se mettent à jour localement et sont envoyés en file d’attente lorsque Google Sheets est disponible.',view:'hunts'},
 {title:'Retrouver les outils',icon:'✧',desc:'Les boîtes HOME, le Living Form Dex, le musée, le Bingo et les statistiques se trouvent dans Plus.',view:'plus'},
 {title:'Protéger tes données',icon:'☁',desc:'Vérifie les opérations en attente dans le centre de synchronisation avant de vider le stockage de ton navigateur.',view:'sync'}
];
P.register('tutorial',()=>{
 const s=steps[tour];return P.head('Premiers pas dans ShinyDex','Un tutoriel interactif de six étapes, disponible à tout moment.')+
 P.card('Étape '+(tour+1)+' / '+steps.length,'<div class="v10-tour"><div class="v10-tour-icon">'+s.icon+'</div><h2>'+E(s.title)+'</h2><p>'+E(s.desc)+'</p><div class="v10-tour-dots">'+steps.map((_,i)=>'<span class="'+(i===tour?'active':'')+'"></span>').join('')+'</div><div class="chip-row">'+P.btn('‹ Précédent','tour-prev',tour===0?'disabled':'','btn-secondary')+P.btn(tour===steps.length-1?'✓ Terminer':'Suivant ›','tour-next','','btn-primary')+P.btn('Voir cette page','tour-open','','btn-secondary')+'</div></div>');
});
P.actions['tour-prev']=()=>{tour=Math.max(0,tour-1);P.render()};
P.actions['tour-next']=()=>{if(tour>=steps.length-1){P.save('tutorialDone',true);P.toast('Tutoriel terminé.');P.goto('dashboard')}else{tour++;P.render()}};
P.actions['tour-open']=()=>P.goto(steps[tour].view);
let lastPinnedShown=0;
P.decorators.push((view,root)=>{
 if(view!=='dashboard')return;
 const ids=[...pinned()],captures=ids.map(id=>S.captures.find(c=>c.id===id)).filter(Boolean);
 if(!captures.length)return;
 const block=document.createElement('section');block.className='panel v10-pin-panel';block.innerHTML='<div class="panel-title"><h3>★ Mes shinies épinglés</h3>'+P.btn('Galerie','showroom','','btn-small btn-secondary')+'</div><div class="v10-pin-row">'+captures.slice(0,8).map(c=>'<button class="v10-pin-poke" data-action="xp-pin-open" data-id="'+E(c.id)+'">'+P.sprite(c.dex)+'<small>'+E(D.speciesName(c.dex))+'</small></button>').join('')+'</div>';
 const dash=root.querySelector('.stat-grid');if(dash)dash.insertAdjacentElement('afterend',block);
});
P.actions['pin-open']=e=>window.ShinyDexUI?.captureForm(0,S.captures.find(c=>c.id===e.dataset.id));
const layoutDefault=['progress','methods','recent'];
const layout=()=>P.get('dashLayout',{order:layoutDefault,width:{progress:'wide',methods:'wide',recent:'wide'}});
P.register('dashboardlayout',()=>{
const cfg=layout();const titles={progress:'Progression et Living Dex',methods:'Méthodes et chasses',recent:'Dernières captures'};
return P.head('Personnaliser mon accueil','Change l’ordre et la densité des sections. Sur téléphone, utilise les flèches pour déplacer les blocs.')+
P.card('Disposition du tableau de bord',cfg.order.map((id,i)=>'<div class="v10-layout-row"><div><b>'+titles[id]+'</b><small>Position '+(i+1)+'</small></div><div class="chip-row">'+P.btn('↑','dash-up','data-id="'+id+'"','btn-small')+P.btn('↓','dash-down','data-id="'+id+'"','btn-small')+'<select data-v10-width="'+id+'" aria-label="Largeur de '+titles[id]+'">'+P.opts([['wide','Pleine largeur'],['narrow','Carte compacte']],cfg.width?.[id]||'wide')+'</select></div></div>').join('')+P.btn('Rétablir la disposition','dash-reset'));
});
P.actions['dash-up']=e=>move(e.dataset.id,-1);
P.actions['dash-down']=e=>move(e.dataset.id,1);
P.actions['dash-reset']=()=>P.save('dashLayout',{order:layoutDefault,width:{progress:'wide',methods:'wide',recent:'wide'}});
function move(id,delta){const cfg=layout(),order=[...cfg.order],i=order.indexOf(id);if(i<0)return;const to=Math.max(0,Math.min(order.length-1,i+delta));order.splice(i,1);order.splice(to,0,id);P.save('dashLayout',{...cfg,order})}
P.changes.dash=e=>{const id=e.target.dataset.v10Width;if(!id)return false;P.save('dashLayout',{...layout(),width:{...layout().width,[id]:e.target.value}});return true};
P.decorators.push((view,root)=>{
 if(view!=='dashboard')return;
 const blocks=[...root.children].filter(x=>x.classList.contains('split'));const cfg=layout();
 if(blocks.length<2)return;
 root.classList.add('v10-dashboard');
 let progress=blocks[0],methods=blocks[1];
 const heading=[...root.children].find(x=>x.classList.contains('subheading')&&/Derniers shinies/i.test(x.textContent));
 const recent=heading?.nextElementSibling;
 const wrap=(key,nodes)=>{
 const element=document.createElement('section');element.className='v10-dashboard-block v10-width-'+(cfg.width?.[key]||'wide');element.dataset.section=key;
 const first=nodes[0];root.insertBefore(element,first);
 for(const node of nodes)element.appendChild(node);
 const order=Math.max(0,cfg.order.indexOf(key));
 element.style.order=String(20+order);
 return element;
 };
 wrap('progress',[progress]);wrap('methods',[methods]);if(heading&&recent&&recent.classList.contains('pokemon-grid'))wrap('recent',[heading,recent]);
 root.insertAdjacentHTML('afterbegin','<div class="v10-layout-link">'+P.btn('⊞ Personnaliser les sections','dashboardlayout','','btn-small btn-secondary')+'</div>');
});
})();