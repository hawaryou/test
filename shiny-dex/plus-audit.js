(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state;
const rules=[
[/Safari des Amis/i,/Pokémon X|Pokémon Y/i,"Safari des Amis : uniquement X/Y."],
[/\bSOS\b/i,/Soleil|Lune/i,"Chaînes SOS : jeux d'Alola."],
[/Expéditions Dynamax/i,/Épée|Bouclier/i,"Expéditions Dynamax : Épée/Bouclier."],
[/Raids Téracristal/i,/Écarlate|Violet/i,"Raids Téracristal : Écarlate/Violet."],
[/Poké Radar/i,/Diamant|Perle|Platine|Pokémon X|Pokémon Y/i,"Vérifie le jeu utilisé pour Poké Radar."]
];
function audit(c){
const result=[],p=D.speciesById.get(Number(c.dex)),g=D.games.find(x=>x.name===c.game);
if(!p)return ['Numéro national inconnu.'];
const gen=g?Number(String(g.gen).match(/\d+/)?.[0]):0;
if(gen&&p.gen>gen)result.push("Espèce apparue après la génération du jeu déclaré : vérifier s'il s'agit d'un transfert.");
for(const [pattern,allowed,desc] of rules)if(pattern.test(c.method||'')&&!allowed.test(c.game||''))result.push(desc);
if(c.attempts!==''&&c.attempts!=null&&Number(c.attempts)<0)result.push('Nombre de tentatives négatif.');
if(!(Number(c.qty)>0))result.push('Quantité invalide.');
const form=String(c.form||'Standard');
if(!['Standard','Mâle','Femelle','Autre'].includes(form)&&!D.forms.some(f=>Number(f.id)===Number(c.dex)&&String(f.form).toLowerCase()===form.toLowerCase()))result.push('Forme non référencée : à vérifier.');
return result
}
P.auditCapture=audit;
P.register('consistency',()=>{
const bad=S.captures.map(c=>({c,issues:audit(c)})).filter(x=>x.issues.length);
const rows=bad.slice(0,120).map(x=>'<div class="goal-card"><div class="grow"><b>'+P.esc(D.speciesName(x.c.dex))+'</b><p>'+P.esc(x.c.game)+' · '+P.esc(x.c.method)+'</p><p>'+x.issues.map(P.esc).join('; ')+'</p></div>'+P.btn('Éditer','audit-edit','data-id="'+P.esc(x.c.id)+'"','btn-small')+'</div>').join('');
return P.head('Détection des incohérences','Vérification prudente des jeux, méthodes et formes. Une alerte n’est pas une preuve d’erreur.')+
'<div class="stat-grid"><div class="stat-card"><div class="stat-top">Captures vérifiées</div><div class="stat-value">'+S.captures.length+'</div></div><div class="stat-card"><div class="stat-top">À revoir</div><div class="stat-value">'+bad.length+'</div></div></div>'+
P.card('⚠️ Vérifications recommandées',rows||'<div class="helper">Aucune incohérence signalée avec les règles disponibles.</div>')+
'<div class="helper warning mt-18">Les transferts, distributions événementielles et mises à jour peuvent rendre une capture valide malgré un avertissement. Aucune ligne n’est supprimée automatiquement.</div>'
});
P.actions['audit-edit']=e=>window.ShinyDexUI?.captureForm(0,S.captures.find(x=>x.id===e.dataset.id));
})();