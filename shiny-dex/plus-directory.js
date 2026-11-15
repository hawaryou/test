/* Advanced tools launchpad for iPhone / desktop */
(()=>{'use strict';const P=window.ShinyPlus,D=window.DexCore,S=D.state;
P.labels.plus="Tous les outils avancés";
P.register("plus",a=>{
const items=[
["gameguides","🎮","Assistants par jeu","Z-A, Écarlate/Violet, Poké Radar, Safari, SOS et Dynamax."],
["livingforms","🧬","Shiny Living Form Dex","Variantes conservables, mâles et femelles."],
["consistency","🔎","Contrôle des captures","Avertissements sur jeux, méthodes et formes."],
["expertstats","📊","Statistiques expertes","Full Odds, chance, Poké Balls, consoles et rendement."],
["quests","⚑","Défis & niveaux","Pokémon du jour, missions et expérience virtuelle."],
["museum","🏛️","Musée shiny","Expose tes Pokémon préférés."],
["timeline","🕰️","Chronologie","Revis toutes les captures datées."],
["bingo","▦","Bingo","Crée une grille 3×3 ou 5×5."],
["yearreview","🏆","Rétrospective annuelle","Ton année shiny en statistiques."],
["sync","☁","Synchronisation","Contrôle des envois et modifications en attente."],
["video","📹","Atelier vidéo","Caméra locale et compteur manuel expérimental."],
["boxes","▦","Boîtes Pokémon HOME","Ranger les "+a.stock+" exemplaires, boîte par boîte."],
["regions","🗺️","Régions & DLC","Neuf générations et collections d'extensions."],
["collectionplus","✨","Collection enrichie","Barons shiny, rubans, photos, parties et transferts."],
["huntlab","🎯","Laboratoire de chasse","Sessions, phases, chaînes, œufs et sandwich."],
["insights","📈","Analyses approfondies","Heatmap, records, tendances et qualité des données."],
["studio","📕","Studio & partage","Livre PDF, carte Story et profil partageable."],
["restore","💾","Sauvegardes & versions","Versions locales et restauration contrôlée."],
["personalize","🎨","Design & accessibilité","Personnaliser couleurs, cartes et visibilité."]
];
return P.head("Tous mes outils","Un espace unique pour retrouver toutes les fonctions du Shiny Living Dex.",P.btn("✦ Ajouter un shiny","quick-add","","btn-primary"))+
'<div class="plus-launch-grid">'+items.map(([view,icon,title,desc])=>'<button class="plus-launch" data-action="'+view+'"><span class="launch-icon">'+icon+'</span><strong>'+P.esc(title)+'</strong><small>'+P.esc(desc)+'</small><span class="launch-go">Explorer ↗</span></button>').join("")+'</div><div class="helper mt-24">Google Sheets reste la référence de ta collection. Tant que le script n’est pas activé, tes nouvelles données sont enregistrées sur cet appareil et marquées « en attente ».</div>';
});
P.actions["quick-add"]=()=>window.ShinyDexUI?.captureForm();
})();