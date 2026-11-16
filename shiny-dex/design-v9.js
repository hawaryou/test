/* ShinyDex v9 — visual enhancements only; no mutation of capture data. */
(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state,esc=P.esc;
function captureHeaders(root){
 const wrap=root.querySelector('.data-table')?.closest('.table-scroller');
 if(!wrap||!wrap.querySelector('thead'))return;
 wrap.classList.add('v9-capture-table');
 const headers=[...wrap.querySelectorAll('thead th')].map(x=>x.textContent.trim());
 for(const tr of wrap.querySelectorAll('tbody tr'))[...tr.children].forEach((td,i)=>{td.dataset.label=headers[i]||''});
}
function addDexSummary(root){
 const heading=root.querySelector('.page-heading');if(!heading||root.querySelector('.v9-pokedex-summary'))return;
 const a=D.aggregate(),pct=(a.percentage*100).toFixed(1).replace('.',',');
 heading.insertAdjacentHTML('afterend','<div class="v9-pokedex-summary" aria-label="Résumé de collection"><span class="v9-data-pill">✦ <strong>'+a.obtained+'</strong> / '+a.total+' espèces</span><span class="v9-data-pill">◈ <strong>'+pct+' %</strong> complété</span><span class="v9-data-pill">◇ <strong>'+a.missing+'</strong> à chercher</span></div>');
}
function enh(view,root){
 document.body.dataset.visualVersion='9';
 if(view==='captures')captureHeaders(root);
 if(view==='pokedex')addDexSummary(root);
}
P.decorators.push(enh);
P.inputs.visualSearch=e=>{
 const input=e.target;if(input.id!=='v9-tools-search')return false;
 const needle=input.value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),groups=[...document.querySelectorAll('.v9-tool-group')];
 let visible=0;for(const group of groups){let inGroup=0;for(const tile of group.querySelectorAll('.plus-launch')){const hay=(tile.dataset.search||tile.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),match=!needle||hay.includes(needle);tile.classList.toggle('is-hidden',!match);if(match){inGroup++;visible++}}group.classList.toggle('is-hidden',!inGroup)}
 const empty=document.querySelector('#v9-tool-empty');if(empty)empty.hidden=visible!==0;
 return true;
};
})();