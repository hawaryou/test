/* ShinyDex Plus — foundations for modular advanced features. */
(()=>{'use strict';
const D=window.DexCore,S=D.state,E=D.esc,F=D.fmt;
const P={
 labels:{boxes:"Boîtes Pokémon HOME",regions:"Régions & DLC",huntlab:"Laboratoire de chasse",collectionplus:"Collection enrichie",insights:"Analyses approfondies",studio:"Studio & partage",restore:"Sauvegardes & versions",personalize:"Design & accessibilité"},
 views:{},actions:{},changes:{},inputs:{},decorators:[],events:[],
 $:selector=>document.querySelector(selector),
 esc:v=>E(v==null?"":v),
 fmt:v=>F(Number(v)||0),
 sprite:(n,shiny=true)=>'<img loading="lazy" decoding="async" src="'+D.sprite(n,shiny)+'" alt="'+E(D.speciesName(n))+'" onerror="DexCore.imageFallback(this,'+Number(n)+','+shiny+')">',
 head:(title,sub,btn="")=>'<div class="page-heading"><div><div class="eyebrow">✦ SHINYDEX / MODULE AVANCÉ</div><h1>'+title+'</h1><p>'+sub+'</p></div>'+btn+'</div>',
 card:(title,body)=>'<section class="panel"><div class="panel-title"><h3>'+title+'</h3></div>'+body+'</section>',
 btn:(label,action,attrs="",variant="btn-secondary")=>'<button type="button" class="btn '+variant+'" data-action="xp-'+action+'" '+attrs+'>'+label+'</button>',
 opts:(arr,selected="")=>arr.map(it=>{const [id,label]=Array.isArray(it)?it:[it,it];return'<option value="'+E(id)+'"'+(String(id)===String(selected)?" selected":"")+'>'+E(label)+'</option>'}).join(""),
 get:(key,fallback)=>S.extras?.[key]??fallback,
 save:(key,val)=>D.saveExtra(key,val),
 local:(key,val)=>D.setExtraLocal(key,val),
 capture:id=>S.captures.find(x=>String(x.id)===String(id)),
 change(e){const t=e.target;if(t.dataset.xpSetting){const obj={...P.get("display",{}),[t.dataset.xpSetting]:!!t.checked};P.save("display",obj);return true}if(t.dataset.xpPublic){P.save("public",{...P.get("public",{}),[t.dataset.xpPublic]:!!t.checked});return true}for(const fn of Object.values(P.changes)){if(fn(e))return true}return false},
 input(e){for(const fn of Object.values(P.inputs)){if(fn(e))return true}return false},
 action(name,el){const action=name.replace(/^xp-/,"");const fn=P.actions[action];if(fn){fn(el);return true}if(P.views[action]){P.goto(action);return true}return false},
 enhance(view,root){P.applyPrefs();for(const fn of P.decorators)try{fn(view,root)}catch(e){console.error("ShinyDex Plus",e)}},
 applyPrefs(){const p=P.get("display",{});const b=document.body;b.style.setProperty("--accent",p.color||"#45dbba");b.classList.toggle("sdx-high-contrast",!!p.highContrast);b.classList.toggle("sdx-large-text",!!p.largeFont);b.classList.toggle("sdx-no-motion",!!p.noMotion);b.dataset.cardSize=p.cardSize||"normal"},
 toast:(txt,bad=false)=>{if(window.ShinyDexUI?.toast)window.ShinyDexUI.toast(txt,bad);else alert(txt)},
 goto:view=>window.ShinyDexUI?.go(view),
 render:()=>window.ShinyDexUI?.render(),
 modalClose:()=>window.ShinyDexUI?.modalClose(),
 register(view,fn){P.views[view]=fn},
 currentYear:new Date().getFullYear()
};
window.ShinyPlus=P;
})();