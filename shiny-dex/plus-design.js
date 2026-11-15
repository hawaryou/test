/* Plus — themes, accessibility and customizable dashboard */
(()=>{'use strict';const P=window.ShinyPlus;
const COLORS=[["#45dbba","Menthe"],["#8a8cf6","Galaxie"],["#efbd76","Or"],["#e982b9","Rose"],["#6ab3ee","Océan"],["#8fd76c","Feuille"]];
const defaults={color:"#45dbba",cardSize:"normal",highContrast:false,largeFont:false,noMotion:false,sound:false,vibration:false,hiddenWidgets:[],widgetOrder:[0,1,2,3]};
const pref=()=>({...defaults,...P.get("display",{})});
const save=(k,v)=>P.save("display",{...pref(),[k]:v});
P.register("personalize",()=>{
const x=pref(),titles=["Espèces","Exemplaires","Tentatives","Progression"];
const colors=COLORS.map(([c,n])=>'<button title="'+P.esc(n)+'" class="accent-choice" style="background:'+c+';outline:'+(x.color===c?'3px solid var(--text)':'none')+'" data-action="xp-design-color" data-value="'+c+'"></button>').join("");
const sizes=[["compact","Compact"],["normal","Normal"],["large","Grandes cartes"]].map(([key,n])=>'<button class="'+(x.cardSize===key?'active':'')+'" data-action="xp-design-size" data-value="'+key+'">'+n+'</button>').join("");
const accessibility=[["highContrast","Contraste fort"],["largeFont","Textes agrandis"],["noMotion","Animations réduites"]].map(([key,n])=>'<label class="mt-12"><input type="checkbox" data-xp-setting="'+key+'" '+(x[key]?'checked':'')+'/> '+n+'</label>').join("");
const widgets=x.widgetOrder.map(n=>'<div class="goal-card"><b>'+titles[n]+'</b><div class="chip-row">'+P.btn("↑","design-up",'data-n="'+n+'"',"btn-small")+P.btn("↓","design-down",'data-n="'+n+'"',"btn-small")+'<label><input type="checkbox" data-xp-widget="'+n+'" '+(x.hiddenWidgets.includes(n)?'':'checked')+'/> Afficher</label></div></div>').join("");
return P.head("Design & accessibilité","Personnalise le thème, les fiches, les statistiques d'accueil et la lisibilité.")+
'<div class="plus-grid">'+P.card("🎨 Couleur d’accent",'<div class="chip-row">'+colors+'</div>')+P.card("🖼️ Taille des cartes",'<div class="segmented">'+sizes+'</div>')+P.card("♿ Accessibilité",accessibility)+P.card("📊 Personnaliser l’accueil",widgets+P.btn("Rétablir","design-reset"))+'</div>';
});
P.actions["design-color"]=e=>save("color",e.dataset.value);
P.actions["design-size"]=e=>save("cardSize",e.dataset.value);
function move(n,delta){const x=pref(),o=[...x.widgetOrder],i=o.indexOf(Number(n));if(i<0)return;const j=Math.max(0,Math.min(3,i+delta));o.splice(i,1);o.splice(j,0,Number(n));save("widgetOrder",o)}
P.actions["design-up"]=e=>move(e.dataset.n,-1);
P.actions["design-down"]=e=>move(e.dataset.n,1);
P.actions["design-reset"]=()=>P.save("display",{...pref(),widgetOrder:[0,1,2,3],hiddenWidgets:[]});
P.changes.design=e=>{if(e.target.dataset.xpWidget===undefined)return false;const n=Number(e.target.dataset.xpWidget),x=pref(),hidden=new Set(x.hiddenWidgets);e.target.checked?hidden.delete(n):hidden.add(n);save("hiddenWidgets",[...hidden]);return true};
P.decorators.push((view,root)=>{if(view!=="dashboard")return;const x=pref(),grid=root.querySelector(".stat-grid");if(grid)[...grid.children].forEach((el,i)=>{el.style.order=String(x.widgetOrder.indexOf(i));el.style.display=x.hiddenWidgets.includes(i)?"none":""});const buttons=root.querySelector(".hero-actions");if(buttons&&!buttons.querySelector('[data-action="xp-design-open"]'))buttons.insertAdjacentHTML("beforeend",P.btn("🎨 Personnaliser","design-open"))});
P.actions["design-open"]=()=>P.goto("personalize");
})();