(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state,E=P.esc,F=P.fmt;
let year=new Date().getFullYear();
const dated=()=>S.captures.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.date||''));
P.register('timeline',()=>{
const data=dated().sort((a,b)=>a.date.localeCompare(b.date)),years=[...new Set(data.map(c=>c.date.slice(0,4)))].sort();
const parts=years.map(y=>{const group=data.filter(c=>c.date.startsWith(y));return'<div class="timeline-year"><h2>'+y+' — '+group.length+' captures</h2><div class="pokemon-grid">'+group.slice(0,60).map(c=>'<button class="pokemon-card owned" data-action="xp-timeline-capture" data-id="'+E(c.id)+'"><div class="sprite-wrap">'+P.sprite(c.dex)+'</div><strong>'+E(D.speciesName(c.dex))+'</strong><div class="foot">'+E(c.date)+'</div></button>').join('')+'</div></div>'}).join('');
return [P.head('Frise chronologique','Revivez les moments importants de ta collection à partir des dates réellement renseignées.'),P.card('📆 Depuis mes premiers shinies',parts||'<p class="tiny">Aucune capture datée.</p>'),'<div class="helper mt-18">Les captures sans date ne sont pas datées automatiquement : elles restent visibles dans le journal habituel.</div>'].join('')
});
P.actions['timeline-capture']=el=>window.ShinyDexUI?.captureForm(0,S.captures.find(x=>x.id===el.dataset.id));
P.register('yearreview',()=>{
const years=[...new Set(dated().map(c=>Number(c.date.slice(0,4))))].sort((a,b)=>b-a);
if(!years.includes(year))year=years[0]||new Date().getFullYear();
const rows=dated().filter(c=>c.date.startsWith(String(year))),total=rows.reduce((n,c)=>n+Number(c.qty||1),0),attempts=rows.reduce((n,c)=>n+(c.attempts===''?0:Number(c.attempts)||0),0);
const methods=new Map(),months=new Map();for(const c of rows){methods.set(c.method,(methods.get(c.method)||0)+1);const m=c.date.slice(5,7);months.set(m,(months.get(m)||0)+Number(c.qty||1))}
const record=rows.filter(c=>c.attempts!==''&&Number.isFinite(Number(c.attempts))).sort((a,b)=>Number(b.attempts)-Number(a.attempts))[0];
const methodHtml=[...methods].sort((a,b)=>b[1]-a[1]).map(([m,n])=>'<div class="goal-card"><b>'+E(m)+'</b><span class="pill">'+n+'</span></div>').join('')||'<p class="tiny">Aucune capture cette année.</p>';
const monthHtml=[...months].sort((a,b)=>a[0].localeCompare(b[0])).map(([m,n])=>'<span class="pill">'+m+' : '+n+'</span>').join(' ')||'<p class="tiny">Aucune date connue.</p>';
return [P.head('Rétrospective annuelle','Bilan de tes captures, de tes méthodes et de tes records, année par année.'),'<div class="toolbar"><select id="xp-recap-year">'+P.opts(years.map(y=>[y,String(y)]),year)+'</select></div>',
'<div class="hero"><div><div class="eyebrow">✦ ANNÉE CHROMATIQUE</div><h1>'+year+'</h1><p>'+rows.length+' captures enregistrées · '+total+' exemplaires</p></div><div class="hero-art">✨</div></div>',
'<div class="stat-grid">'+[['Captures',rows.length],['Exemplaires',total],['Tentatives',F(attempts)],['Méthodes',methods.size]].map(([l,v])=>'<div class="stat-card"><div class="stat-top">'+l+'</div><div class="stat-value">'+v+'</div></div>').join('')+'</div>',
'<div class="split">',P.card('🎯 Méthodes de l’année',methodHtml),P.card('🏆 Plus longue chasse',record?'<div class="collection-hero">'+P.sprite(record.dex)+'<div><h2>'+E(D.speciesName(record.dex))+'</h2><p>'+F(record.attempts)+' tentatives</p></div></div>':'<p class="tiny">Aucun compteur daté.</p>'),'</div>',P.card('📅 Shinies par mois',monthHtml)].join('')
});
P.changes.recap=e=>{if(e.target.id==='xp-recap-year'){year=Number(e.target.value);P.render();return true}return false};
})();