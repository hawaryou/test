(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state;
const genders=[25,26,214,449,450,521,592,593,668,678,876,902,916];
let search='',filter='all';
const count=f=>{const key='form:'+f.id+':'+f.form;const linked=P.get('formLinks',{})[key];const c=S.captures.find(x=>x.id===linked);return c?Number(c.qty)||1:S.captures.filter(x=>Number(x.dex)===f.id&&String(x.form).toLowerCase()===String(f.form).toLowerCase()).reduce((n,x)=>n+(Number(x.qty)||1),0)};
const countSex=(dex,sex)=>{const link=P.get('formLinks',{})['sex:'+dex+':'+sex];const c=S.captures.find(x=>x.id===link);return c?Number(c.qty)||1:S.captures.filter(x=>Number(x.dex)===dex&&String(D.getMeta(x.id).gender).toLowerCase()===sex).reduce((n,x)=>n+Number(x.qty||1),0)};
P.register('livingforms',()=>{
 const all=D.forms.filter(x=>/conservable/i.test(String(x.nature||''))),got=all.filter(x=>count(x)>0).length;
 const visible=all.filter(x=>(filter==='all'||(filter==='owned')===(count(x)>0))&&(x.name+' '+x.form).toLowerCase().includes(search.toLowerCase()));
 const cards=visible.map(x=>P.card(P.esc(x.name)+' · '+P.esc(x.form),'<div class="flex-between">'+P.sprite(x.id,count(x)>0)+'<span class="pill '+(count(x)>0?'good':'')+'">'+(count(x)>0?'✓ '+count(x):'À chercher')+'</span>'+P.btn('Lier une capture','form-link','data-dex="'+x.id+'" data-key="'+P.esc('form:'+x.id+':'+x.form)+'"','btn-small')+'</div>')).join('');
 const sexCards=genders.map(id=>P.card(P.esc(D.speciesName(id))+' · #'+id,['mâle','femelle'].map(sex=>P.btn(sex+' '+(countSex(id,sex)||'○'),'form-link','data-dex="'+id+'" data-key="sex:'+id+':'+sex+'"','btn-small')).join(''))).join('');
 return P.head('Shiny Living Form Dex','Suivi individuel des formes conservables et des différences mâle/femelle. Une espèce possédée ne valide pas automatiquement toutes ses formes.')+
 '<div class="stat-grid">'+[['Formes',all.length],['Renseignées',got],['Manquantes',all.length-got],['Sexes différents',genders.length*2]].map(([l,n])=>'<div class="stat-card"><div class="stat-top">'+l+'</div><div class="stat-value">'+n+'</div></div>').join('')+'</div>'+
 '<div class="toolbar"><input id="xp-form-search" value="'+P.esc(search)+'" placeholder="Rechercher une forme"><select id="xp-form-filter">'+P.opts([['all','Toutes'],['owned','Obtenues'],['missing','Manquantes']],filter)+'</select></div>'+
 '<div class="plus-grid">'+cards+'</div><div class="subheading"><h2>♂ ♀ Différences visuelles (sélection)</h2></div><div class="plus-grid">'+sexCards+'</div>'
});
P.actions['form-link']=el=>{const id=Number(el.dataset.dex),key=el.dataset.key,arr=S.captures.filter(x=>Number(x.dex)===id);if(!arr.length)return P.toast('Ajoute d’abord une capture de ce Pokémon.',true);
const options=arr.map((c,i)=>(i+1)+' · '+c.game+' · '+(c.date||'sans date')).join('\n'),raw=prompt('Choisis un numéro de capture (0 retire le lien) :\n'+options,'1');if(raw===null)return;const n=Number(raw),links={...P.get('formLinks',{})};if(n===0)delete links[key];else if(n>0&&n<=arr.length&&Number.isInteger(n))links[key]=arr[n-1].id;else return P.toast('Numéro invalide',true);P.save('formLinks',links)};
P.changes.formsPlus=e=>{if(e.target.id==='xp-form-filter'){filter=e.target.value;P.render();return true}return false};
P.inputs.formsPlus=e=>{if(e.target.id==='xp-form-search'){search=e.target.value;P.render();const el=document.getElementById('xp-form-search');el?.focus();el?.setSelectionRange(search.length,search.length);return true}return false};
})();