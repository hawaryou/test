(()=>{'use strict';
const P=window.ShinyPlus,D=window.DexCore,S=D.state,E=P.esc,F=P.fmt;
const rate=(n,tries)=>100*(1-Math.pow(1-1/n,tries));
function groupByMeta(key){const map=new Map();for(const c of S.captures){const m=D.getMeta(c.id),v=String(m[key]||'').trim();if(!v)continue;map.set(v,(map.get(v)||0)+(Number(c.qty)||1))}return [...map].sort((a,b)=>b[1]-a[1])}
function bar(title,rows){const top=Math.max(1,...rows.map(x=>x[1]));return P.card(title,rows.length?'<div class="chart-bars">'+rows.slice(0,17).map(([name,v])=>'<div class="bar-row"><span>'+E(name)+'</span><div class="bar-track"><i style="width:'+(100*v/top)+'%"></i></div><b>'+F(v)+'</b></div>').join('')+'</div>':'<p class="tiny">Données non renseignées : complète les détails avancés de tes captures.</p>')}
function results(){
const data=[];for(const c of S.captures){const m=D.getMeta(c.id),odds=Number(m.odds),attempts=Number(c.attempts);
if(!(odds>=2)||c.attempts===""||c.attempts==null||!(attempts>=0)||Number(c.qty)!==1)continue;
data.push({c,m,odds,attempts,percent:rate(odds,attempts)})}return data}
function pace(){const sessions=P.get('sessions',{}),res=new Map();for(const [id,s] of Object.entries(sessions)){const h=S.hunts.find(x=>x.id===id);if(!h)continue;const duration=(Number(s.elapsedMs)||0)+(s.running&&s.startedAt?Date.now()-new Date(s.startedAt).getTime():0),attempts=Number(s.trackedAttempts)||0;if(duration<=0)continue;const group=res.get(h.method)||{method:h.method,hours:0,attempts:0,success:0};group.hours+=duration/3600000;group.attempts+=attempts;if(h.status==="Réussie")group.success++;res.set(h.method,group)}return [...res.values()].sort((a,b)=>b.attempts-a.attempts)}
P.register('expertstats',()=>{
const a=D.aggregate(),luck=results(),full=S.captures.filter(c=>String(D.getMeta(c.id).fullOdds)==='Oui'),fullCounts=full.filter(c=>c.attempts!==""&&c.attempts!=null),fullAttempts=fullCounts.reduce((n,c)=>n+Number(c.attempts),0);
const lucky=[...luck].sort((a,b)=>a.percent-b.percent).slice(0,10),long=[...luck].sort((a,b)=>b.percent-a.percent).slice(0,10);
const ranks=rows=>rows.length?rows.map(x=>'<div class="goal-card"><div class="grow"><b>'+E(D.speciesName(x.c.dex))+'</b><p>'+E(x.c.game)+' · '+F(x.attempts)+' tentatives · taux 1/'+F(x.odds)+'</p></div><span class="pill">'+x.percent.toFixed(1).replace(".",",")+' %</span></div>').join(''):'<p class="tiny">Ajoute le taux théorique utilisé dans les détails avancés des captures. Aucun taux ne sera deviné à partir de la seule méthode.</p>';
const speeds=pace().filter(x=>x.hours>0);
return P.head('Statistiques expertes','Full Odds, rareté statistique, Poké Balls, consoles et rendement des sessions chronométrées.')+
'<div class="stat-grid">'+[['Full Odds renseignés',full.length],['Tentatives Full Odds',F(fullAttempts)],['Chasses avec taux fiable',luck.length],['Méthodes chronométrées',speeds.length]].map(([l,v])=>'<div class="stat-card"><div class="stat-top">'+E(l)+'</div><div class="stat-value">'+E(v)+'</div></div>').join('')+'</div>'+
'<div class="split">'+P.card('🍀 Les 10 trouvailles les plus rapides relativement à leur taux',ranks(lucky))+P.card('⌛ Les 10 plus longues attentes relativement à leur taux',ranks(long))+'</div>'+
'<div class="split mt-18">'+bar('⚪ Répartition des Poké Balls',groupByMeta('ball'))+bar('🎮 Collection par console',groupByMeta('console'))+'</div>'+
P.card('⏱️ Rendement documenté par méthode',speeds.length?'<div class="table-scroller"><table class="data-table"><thead><tr><th>Méthode</th><th>Heures</th><th>Tentatives suivies</th><th>Tentatives/h</th><th>Chasses abouties</th></tr></thead><tbody>'+speeds.map(x=>'<tr><td>'+E(x.method)+'</td><td>'+x.hours.toFixed(1)+'</td><td>'+F(x.attempts)+'</td><td>'+F(x.attempts/x.hours)+'</td><td>'+x.success+'</td></tr>').join('')+'</tbody></table></div>':'<p class="tiny">Commence des sessions chronométrées pour comparer les méthodes sans mélanger heures récentes et tentatives historiques.</p>')+
'<div class="helper mt-18">Classement de chance : percentile du nombre de tentatives nécessaire pour obtenir au moins un shiny, avec un taux 1/N explicitement renseigné. Les multi-captures et les chasses sans taux ne sont pas comparées. Ce classement ne prédit pas ta prochaine rencontre.</div>';
});
})();