/* ShinyDex v10 — routes, navigation labels and helpful dashboard shortcuts */
(()=>{'use strict';const P=window.ShinyPlus;
Object.assign(P.labels,{
showroom:'Galerie & comparateur',
regionatlas:'Atlas des régions',
gamethemes:'Thèmes par jeu',
posters:'Posters collector',
searchhub:'Recherche universelle',
quickcapture:'Saisie rapide',
tutorial:'Tutoriel interactif',
dashboardlayout:'Organisation de l’accueil',
multihunt:'Tableau multi-chasse',
sessionjournal:'Journal de session',
huntstatistics:'Statistiques de chasse',
importreview:'Importer en sécurité',
conflicts:'Conflits par champ',
syncdiagnostics:'Diagnostics de synchronisation',
drivebackups:'Sauvegardes Drive',
reminders:'Rappels de chasse'
});
P.actions['quick-add']=()=>P.goto('quickcapture');
P.decorators.push((view,root)=>{
 if(view!=='dashboard')return;
 const hero=root.querySelector('.hero-actions');
 if(hero&&!hero.querySelector('[data-action="searchhub"]'))hero.insertAdjacentHTML('beforeend',P.btn('⌕ Recherche universelle','searchhub','','btn-secondary'));
 const last=root.querySelector('.v10-layout-link');
 if(last&&!last.querySelector('[data-action="tutorial"]'))last.insertAdjacentHTML('beforeend',P.btn('❔ Guide','tutorial','','btn-small btn-secondary'));
});
})();