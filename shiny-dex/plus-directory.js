/* ShinyDex v9 — discoverable, categorized tools directory */
(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore;
P.labels.plus='Tous les outils avancés';
const groups=[
{icon:'🎯',title:'Mes chasses',sub:'Compteurs, méthodes et expérimentations',tools:[
['gameguides','🎮','Assistants par jeu','Z-A, Violet, Poké Radar, Safari, SOS et Dynamax'],
['huntlab','◉','Laboratoire de chasse','Compteurs, phases, chaînes et sandwichs'],
['video','📹','Atelier vidéo','Caméra locale et comptage manuel expérimental']
]},
{icon:'💎',title:'Ma collection',sub:'Classer, vérifier et mettre en valeur',tools:[
['livingforms','🧬','Living Form Dex','Formes conservables et sexes différents'],
['boxes','▦','Boîtes Pokémon HOME','30 emplacements par boîte'],
['regions','🗺️','Régions & DLC','Progression par région et extension'],
['collectionplus','✦','Collection enrichie','Barons shiny, rubans, photos et transferts'],
['museum','🏛️','Musée des shinies','La vitrine de tes favoris'],
['consistency','✓','Vérifier mes captures','Alertes sur les jeux, formes et méthodes']
]},
{icon:'📊',title:'Mes statistiques',sub:'Comprendre et revivre tes chasses',tools:[
['expertstats','◈','Statistiques expertes','Full Odds, Poké Balls et taux théoriques'],
['insights','▥','Analyses approfondies','Heatmap, types et données manquantes'],
['yearreview','🏆','Rétrospective annuelle','Une année chromatique en images'],
['timeline','🕰️','Chronologie','Toute ton histoire de collection']
]},
{icon:'🎲',title:'Mes défis',sub:'Progresser autrement chaque semaine',tools:[
['quests','⚑','Défis & niveaux','Cible du jour, missions et XP'],
['bingo','▦','Bingo shiny','Grilles de 3 × 3 ou 5 × 5']
]},
{icon:'⚙️',title:'Mes outils',sub:'Personnaliser et protéger les données',tools:[
['studio','📕','Studio & partage','Livre PDF et cartes Story'],
['sync','☁','Centre de synchronisation','Opérations Google Sheets en attente'],
['restore','↺','Sauvegardes & versions','Historique local et exports'],
['personalize','🎨','Design & accessibilité','Couleurs, lisibilité et préférences']
]}
];
P.register('plus',()=>{
const groupHtml=groups.map(g=>'<section class="v9-tool-group"><div class="v9-group-head"><h2>'+g.icon+' '+P.esc(g.title)+'</h2><small>'+P.esc(g.sub)+'</small></div><div class="plus-launch-grid">'+g.tools.map(([view,icon,title,desc])=>'<button type="button" class="plus-launch" data-action="'+view+'" data-search="'+P.esc([title,desc,view].join(' '))+'"><span class="launch-icon">'+icon+'</span><strong>'+P.esc(title)+'</strong><small>'+P.esc(desc)+'</small><span class="launch-go">Ouvrir l’outil ↗</span></button>').join('')+'</div></section>').join('');
return P.head('Explore ShinyDex','Retrouve rapidement tes outils favoris, classés par thème.',P.btn('✦ Ajouter un shiny','quick-add','','btn-primary'))+
'<label class="v9-tool-search"><span aria-hidden="true">⌕</span><input id="v9-tools-search" type="search" autocomplete="off" placeholder="Chercher un outil, une fonction, une méthode..." aria-label="Rechercher un outil"></label>'+
'<div class="v9-tools-groups">'+groupHtml+'</div><p id="v9-tool-empty" class="v9-tool-empty" hidden>Aucun outil trouvé. Essaie un autre terme.</p>'+
'<div class="helper mt-24">Ton journal Google Sheets reste la source centrale après installation du nouveau script. Les changements réalisés avant la connexion restent enregistrés sur cet appareil.</div>';
});
P.actions['quick-add']=()=>window.ShinyDexUI?.captureForm();
})();