/* ShinyDex Plus — printable book, story card, shareable profile */
(()=>{'use strict';const P=window.ShinyPlus,D=window.DexCore,S=D.state,$=P.$,esc=P.esc;
const privacy=()=>P.get("public",{name:true,progress:true,attempts:false,games:false,methods:false,dates:false});
P.register("studio",a=>{
const fields=[["name","Pseudo"],["progress","Espèces et progression"],["attempts","Tentatives"],["games","Jeux"],["methods","Méthodes"],["dates","Dates des captures"]],pub=privacy();
const options=fields.map(([key,label])=>'<label class="mt-12"><input type="checkbox" data-xp-public="'+key+'" '+(pub[key]?"checked":"")+'/> '+label+'</label>').join("");
const choices=S.captures.map(c=>[c.id,D.speciesName(c.dex)+" · "+c.game]);
return P.head("Studio & partage","Crée un livre PDF illustré, une Story verticale ou une fiche de collection choisissant les informations à montrer.")+
'<div class="plus-grid">'+
P.card("📕 Livre de ma collection",'<p class="tiny">Tu peux l’enregistrer en PDF depuis le dialogue d’impression de Safari ou de ton navigateur.</p><label>Génération</label><select id="xp-book-region">'+P.opts([["0","Toutes"],...D.GEN_NAMES.slice(1).map((name,i)=>[i+1,"G"+(i+1)+" · "+name])],0)+'</select><div class="mt-18">'+P.btn("Générer mon livre","book-print","","btn-primary btn-block")+'</div>')+
P.card("📱 Carte Story 1080 × 1920",'<p class="tiny">Pokémon, jeu, méthode, nombre de tentatives et date.</p><label>Choisir une capture</label><select id="xp-story-id">'+P.opts(choices)+'</select><div class="mt-18">'+P.btn("Créer la Story PNG","story-export","","btn-primary btn-block")+'</div>')+
P.card("🔏 Profil public personnalisé",'<p class="tiny">Fichier HTML exporté localement, sans publication automatique.</p>'+options+'<div class="mt-18">'+P.btn("Exporter mon profil","profile-export","","btn-primary btn-block")+'</div>')+
P.card("🖼️ Galerie de photos",'<p class="tiny">Ajoute l’URL de tes photos depuis une fiche shiny. L’hébergement des images reste externe.</p>'+P.btn("Voir les cartes","album-open","","btn-secondary btn-block")+'</div>')+'</div>';
});
P.actions["album-open"]=()=>P.goto("collectionplus");
function blobSave(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
P.actions["book-print"]=()=>{
const a=D.aggregate(),gen=Number($("#xp-book-region")?.value)||0,list=D.species.filter(p=>(!gen||p.gen===gen)&&a.by.get(p.id)?.count);
if(!list.length)return P.toast("Aucun shiny à imprimer.",true);
const div=document.createElement("section");div.id="sdx-book";
const tiles=list.map(p=>'<div class="book-card">'+P.sprite(p.id)+'<strong>'+esc(p.name)+'</strong><small>#'+String(p.id).padStart(4,"0")+' • G'+p.gen+'</small></div>').join("");
div.innerHTML='<div class="book-cover"><h1>✨ SHINY LIVING DEX</h1><h2>HAWARYOU</h2><p>'+list.length+' espèces obtenues</p><p>'+D.today()+'</p></div><div class="book-grid">'+tiles+'</div>';
document.body.appendChild(div);document.body.classList.add("sdx-printing");
const images=[...div.querySelectorAll("img")];Promise.race([Promise.all(images.map(img=>img.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,3500))]).then(()=>{window.print();setTimeout(()=>{div.remove();document.body.classList.remove("sdx-printing")},1500)});
};
P.actions["story-export"]=()=>{
const c=P.capture($("#xp-story-id")?.value);if(!c)return;
const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1920;const g=canvas.getContext("2d"),gradient=g.createLinearGradient(0,0,1080,1920);
gradient.addColorStop(0,"#102b37");gradient.addColorStop(.5,"#293b65");gradient.addColorStop(1,"#0d1627");g.fillStyle=gradient;g.fillRect(0,0,1080,1920);
g.fillStyle="#71e4c5";g.font="bold 59px Arial";g.fillText("✨ SHINYDEX HAWARYOU",55,140);
g.fillStyle="#fff";g.font="bold 81px Arial";g.fillText(D.speciesName(c.dex).slice(0,21),55,1155);
g.fillStyle="#8de7d0";g.font="43px Arial";g.fillText("#"+String(c.dex).padStart(4,"0"),55,1230);
g.fillStyle="#c8d9e9";g.font="38px Arial";[c.game,c.method,c.attempts===""?"Sans compteur":D.fmt(c.attempts)+" tentatives",c.date||"Date non précisée"].forEach((text,i)=>g.fillText(String(text).slice(0,37),55,1380+i*98));
g.fillStyle="#a5d6d4";g.font="29px Arial";g.fillText("hawaryou.github.io/test/shiny-dex",55,1845);
const finish=()=>{try{canvas.toBlob(b=>b&&blobSave(b,"ShinyDex-Story-"+c.dex+".png"),"image/png")}catch(e){P.toast("Photo distante incompatible avec le PNG.",true)}};
const image=new Image();image.crossOrigin="anonymous";image.onload=()=>{g.drawImage(image,120,260,840,840);finish()};image.onerror=finish;image.src=D.sprite(c.dex,true);
};
P.actions["profile-export"]=()=>{
const a=D.aggregate(),p=privacy(),user=p.name?esc(S.settings.username):"Collection chromatique";
const fields=[];if(p.progress)fields.push("<p>"+a.obtained+" / "+a.total+" espèces ("+(a.percentage*100).toFixed(1)+" %)</p>");
if(p.attempts)fields.push("<p>"+D.fmt(a.attempts)+" tentatives</p>");
if(p.games)fields.push("<p>Jeux : "+a.game.map(x=>esc(x.label)).join(", ")+"</p>");
if(p.methods)fields.push("<p>Méthodes : "+a.method.map(x=>esc(x.label)).join(", ")+"</p>");
if(p.dates)fields.push("<p>Dates : "+S.captures.filter(x=>x.date).map(x=>x.date).slice(0,50).join(", ")+"</p>");
const doc='<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>'+user+'</title><style>body{background:#102039;color:#edf7ff;text-align:center;font:18px system-ui;padding:45px 20px}main{max-width:750px;margin:auto;background:#243a51;border-radius:25px;padding:40px}h1{color:#70e1c4}</style><main><h1>✨ '+user+'</h1>'+fields.join("")+'<footer>ShinyDex Hawaryou</footer></main></html>';
D.download("ShinyDex-profil-partage.html",doc,"text/html;charset=utf-8");
};
})();