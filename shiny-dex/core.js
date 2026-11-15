/* ShinyDex Core — models, local cache, Google Apps Script bridge */
(()=>{'use strict';
const BASE=window.DEX_BASE||{species:[],forms:[],games:[]};
const SCRIPT_URL="https://script.google.com/macros/s/AKfycbw3Fr5gPtSplDg8FKNBndSy2cJiCa1uyw62lIuW-j9nRCWTLj88mx4on9nGmLAi-YzMlg/exec";
const KEY="hawaryou.shinydex.v1";
const GEN_NAMES=["","Kanto","Johto","Hoenn","Sinnoh","Unys","Kalos","Alola","Galar · Hisui","Paldea"];
const METHODS=["Rencontres libres","Masuda","Hordes","SOS","Safari des Amis","Expéditions Dynamax","Reset","Hasard","Chaîne de pêche","Poké Radar","Navidex","Raids Dynamax","Raids Téracristal","Apparitions massives","Méthode du sandwich","Œufs","Pokémon GO","Échange","Évolution","Autre"];
const POKEBALLS=["Poké Ball","Super Ball","Hyper Ball","Master Ball","Honor Ball","Luxe Ball","Sombre Ball","Filet Ball","Scuba Ball","Rapide Ball","Mémoire Ball","Safari Ball","Compét' Ball","Love Ball","Lune Ball","Rêve Ball","Masse Ball","Appât Ball","Niveau Ball","Copain Ball","Soin Ball","Faiblo Ball","Speed Ball","Chrono Ball","Bis Ball","Ultra Ball","Autre"];
const NATURES=["","Hardi","Solo","Brave","Rigide","Mauvais","Assuré","Docile","Relax","Malin","Lâche","Timide","Pressé","Sérieux","Jovial","Naïf","Modeste","Doux","Discret","Foufou","Pudique","Calme","Gentil","Malpoli","Prudent","Bizarre"];
const defaultSettings={theme:"dark",spriteStyle:"official",animated:false,showMissing:true,dexLayout:"grid",pageSize:72,currentGame:"",currentMethod:"",hordeFactor:5,scriptUrl:SCRIPT_URL,token:"",username:"hawaryou",shareCounts:true,starredOnly:false};
const species=BASE.species.map(([id,name,gen,region])=>({id:Number(id),name:String(name),gen:Number(gen),region:String(region)}));
const speciesById=new Map(species.map(p=>[p.id,p]));
const forms=BASE.forms.map(([id,name,form,family,nature,notes],i)=>({id:Number(id),name,form,family,nature,notes,key:`${id}-${String(form).toLowerCase()}`,index:i}));
const games=BASE.games.map(([name,gen,year,category,availability])=>({name,gen,year,category,availability}));
const blank=()=>({captures:[],hunts:[],goals:[],events:[],meta:[],wishlist:[],settings:{...defaultSettings},queue:[],connected:false,lastSync:"",lastError:"",origin:"local"});
let state=blank();try{const raw=JSON.parse(localStorage.getItem(KEY)||"null");if(raw&&typeof raw==="object"){state={...state,...raw,settings:{...defaultSettings,...(raw.settings||{})}}}}catch(e){}
const listeners=new Set(),bus={};let inflight=false,lastFetch=0;
function emit(topic="update"){for(const fn of listeners){try{fn(topic,state)}catch(e){console.error(e)}}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({...state,connected:false}))}catch(e){console.warn("Local storage full",e)}emit()}
function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
function uid(prefix="sh"){return prefix+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9)}
function safeStr(v){return v==null?"":String(v)}
function esc(v){return safeStr(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dateOnly(v){if(!v)return"";try{const d=new Date(v);return isNaN(d)?"":new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}catch(e){return""}}
function today(){return dateOnly(new Date())}
function fmt(n,digits=0){return new Intl.NumberFormat("fr-FR",{maximumFractionDigits:digits}).format(Number(n)||0)}
function pct(n){return Math.max(0,Math.min(100,n))*100?Math.round(Math.max(0,Math.min(1,n))*1000)/10:0}
function speciesName(id){return speciesById.get(Number(id))?.name||("Pokémon #"+id)}
function generation(id){return speciesById.get(Number(id))?.gen||0}
function sprite(id,shiny=false,animated=false){id=Number(id);if(!Number.isInteger(id)||id<1)return"";const root="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";if(animated)return root+"other/showdown/"+(shiny?"shiny/":"")+id+".gif";if(state.settings.spriteStyle==="pixel")return root+(shiny?"shiny/":"")+id+".png";return root+"other/home/"+(shiny?"shiny/":"")+id+".png"}
function imageFallback(el,id,shiny){if(el.dataset.fallback)return;el.dataset.fallback="1";el.src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"+(shiny?"shiny/":"")+Number(id)+".png"}
function captureMap(){const m=new Map();for(const c of state.captures){const n=Number(c.dex);if(!Number.isInteger(n)||n<1)continue;let old=m.get(n);if(!old){old={count:0,owned:0,list:[]};m.set(n,old)}old.count+=Math.max(0,Number(c.qty)||0);let meta=state.meta.find(x=>x.id===c.id);if(!meta||!["Échangé","Perdu"].includes(meta.ownership))old.owned+=Math.max(0,Number(c.qty)||0);old.list.push(c)}return m}
function aggregate(){const by=captureMap(),total=species.length||1025;let obtained=0,possessed=0,stock=0,duplicated=0,hasAttempts=0,attempts=0;
for(const [k,v] of by){if(v.count>0)obtained++;if(v.owned>0)possessed++;stock+=v.count;duplicated+=Math.max(0,v.owned-1)}
const method=new Map(),game=new Map(),year=new Map(),gen=Array.from({length:9},(_,i)=>({gen:i+1,name:GEN_NAMES[i+1],total:species.filter(p=>p.gen===i+1).length,owned:0,attempts:0,captures:0}));
for(const [id,v] of by){let p=speciesById.get(id);if(p&&v.count>0)gen[p.gen-1].owned++}
let record=null;
for(const c of state.captures){let q=Math.max(1,Number(c.qty)||1),value=Number(c.attempts),valid=c.attempts!==""&&c.attempts!=null&&Number.isFinite(value),m=c.method||"Non précisée",g=c.game||"Non précisé";
for(const [map,key] of [[method,m],[game,g]]){let a=map.get(key)||{label:key,catches:0,qty:0,attempts:0,withCount:0,values:[]};a.catches++;a.qty+=q;if(valid){a.attempts+=value;a.withCount++;a.values.push(value)}map.set(key,a)}
if(valid){hasAttempts++;attempts+=value;if(!record||value>record.attempts)record={...c,attempts:value}}
if(Number(c.dex)){let index=generation(c.dex)-1;if(index>=0&&index<9){gen[index].captures++;if(valid)gen[index].attempts+=value}}
let y=(c.date||"").slice(0,4);if(/^\d{4}$/.test(y)){let d=year.get(y)||{year:y,catches:0,qty:0,attempts:0};d.catches++;d.qty+=q;if(valid)d.attempts+=value;year.set(y,d)}}
function finish(m){return Array.from(m.values()).map(v=>{const sorted=[...v.values].sort((a,b)=>a-b);const med=sorted.length?(sorted.length%2?sorted[(sorted.length-1)/2]:(sorted[sorted.length/2-1]+sorted[sorted.length/2])/2):null;return {...v,avg:v.withCount?v.attempts/v.withCount:null,median:med,max:sorted.length?sorted.at(-1):null}}).sort((a,b)=>b.catches-a.catches)}
return {total,obtained,possessed,stock,duplicated,missing:total-obtained,percentage:obtained/total,attempts,hasAttempts,missingAttempts:state.captures.length-hasAttempts,average:hasAttempts?attempts/hasAttempts:null,record,by,method:finish(method),game:finish(game),year:Array.from(year.values()).sort((a,b)=>a.year.localeCompare(b.year)),gen}};
}
function getMeta(id){return state.meta.find(x=>String(x.id)===String(id))||{}}
function isConnected(){return !!state.connected}
function settings(patch){state.settings={...state.settings,...patch};persist()}
function setLocal(part,data){state[part]=data;persist()}
function listFromServer(data){if(!data||!Array.isArray(data.captures))throw Error("Réponse Google Sheets invalide.");
const pending=state.queue.filter(x=>x.type==="capture").map(x=>x.data);
const remote= data.captures.map(x=>({...x,qty:Number(x.qty)||1,dex:Number(x.dex)||0}));
state.captures=remote;
for(const p of pending){if(!state.captures.find(c=>c.id===p.id))state.captures.push(p)}
for(const part of ["hunts","goals","events","meta","wishlist"]){if(Array.isArray(data[part]))state[part]=data[part]}
state.connected=true;state.origin="Google Sheets";state.lastSync=new Date().toISOString();state.lastError="";persist()}
function jsonp(action,params={}){return new Promise((resolve,reject)=>{const cb="__sdx_"+uid("cb").replace(/-/g,"_");const script=document.createElement("script");const timer=setTimeout(()=>finish(Error("Google Apps Script n’a pas répondu.")),17000);function finish(err,data){clearTimeout(timer);script.remove();delete window[cb];err?reject(err):resolve(data)}window[cb]=data=>{if(data&&data.ok===false)finish(Error(data.error||"Accès refusé."));else finish(null,data)};script.onerror=()=>finish(Error("Impossible de joindre le déploiement Apps Script."));script.referrerPolicy="no-referrer";const url=state.settings.scriptUrl||SCRIPT_URL;script.src=url+(url.includes("?")?"&":"?")+new URLSearchParams({api:"1",action,callback:cb,token:state.settings.token,...params});document.head.appendChild(script)})}
function inGoogle(){return typeof google!=="undefined"&&google.script&&google.script.run}
function gasRun(functionName,...params){return new Promise((resolve,reject)=>{google.script.run.withSuccessHandler(resolve).withFailureHandler(err=>reject(Error(err?.message||String(err))))[functionName](...params)})}
async function connect(){if(!state.settings.token){state.connected=false;state.lastError="Code d’accès requis.";persist();return false}
try{const data=inGoogle()?await gasRun("dexBootstrap",state.settings.token):await jsonp("bootstrap");listFromServer(data);await flushQueue();return true}catch(e){state.connected=false;state.lastError=e.message;persist();return false}}
async function refresh(force=false){if(!force&&Date.now()-lastFetch<25000)return;lastFetch=Date.now();return connect()}
function recordLocal(type,data){const action={actionId:uid("op"),type,data,created:Date.now(),attempted:0};state.queue.push(action);
if(type==="capture"){const index=state.captures.findIndex(x=>x.id===data.id);if(index<0)state.captures.unshift({...data,unsynced:true});else state.captures[index]={...state.captures[index],...data,unsynced:true}}
else if(type==="meta"){const i=state.meta.findIndex(x=>x.id===data.id);i>=0?state.meta[i]={...state.meta[i],...data}:state.meta.push(data)}
else if(type==="hunt"){const i=state.hunts.findIndex(x=>x.id===data.id);i>=0?state.hunts[i]={...state.hunts[i],...data}:state.hunts.push(data)}
else if(type==="goal"){const i=state.goals.findIndex(x=>x.id===data.id);i>=0?state.goals[i]={...state.goals[i],...data}:state.goals.push(data)}
else if(type==="wish"){const i=state.wishlist.findIndex(x=>Number(x.dex)===Number(data.dex));i>=0?state.wishlist[i]={...state.wishlist[i],...data}:state.wishlist.push(data)}
else if(type==="event")state.events.unshift(data);
persist();if(state.settings.token&&navigator.onLine)flushQueue();return action.actionId}
function postForm(action){return new Promise(resolve=>{const iframe=document.createElement("iframe");iframe.style.display="none";iframe.name="shiny_post_"+uid();const form=document.createElement("form");form.method="POST";form.target=iframe.name;form.action=state.settings.scriptUrl||SCRIPT_URL;form.style.display="none";const f=document.createElement("input");f.name="payload";f.value=JSON.stringify({...action,token:state.settings.token});form.appendChild(f);document.body.append(iframe,form);form.submit();setTimeout(()=>{iframe.remove();form.remove();resolve()},1400)})}
async function send(action){if(inGoogle())return gasRun("dexAction",{...action,token:state.settings.token});
await postForm(action);for(let i=0;i<7;i++){await new Promise(r=>setTimeout(r,1050+i*320));try{const v=await jsonp("status",{id:action.actionId});if(v.state==="ok")return v;if(v.state==="error")throw Error(v.error||"Opération refusée.")}catch(e){if(/refus|invalide|interdit|non autoris/.test(e.message.toLowerCase()))throw e}}
throw Error("Transmission non confirmée : l’opération reste en attente.")}
async function flushQueue(){if(inflight||!state.settings.token||!navigator.onLine||!state.queue.length)return;inflight=true;emit("sync");
try{while(state.queue.length){const op=state.queue[0];try{const res=await send(op);if(res?.ok===false||res?.state==="error")throw Error(res.error||"Erreur Apps Script");state.queue.shift();if(op.type==="capture"){const x=state.captures.find(c=>c.id===op.data.id);if(x)delete x.unsynced}state.lastSync=new Date().toISOString();state.connected=true;state.lastError="";persist()}catch(e){state.lastError=e.message;persist();break}}}finally{inflight=false;emit("sync")}}
function latestCounter(id){return state.hunts.find(h=>h.id===id)}
function saveCapture(data){const id=data.id||uid("SH");const x={id,dex:Number(data.dex),name:speciesName(data.dex),game:safeStr(data.game),method:safeStr(data.method),attempts:data.attempts===""||data.attempts==null?"":Number(data.attempts),qty:Math.max(1,Number(data.qty)||1),charm:data.charm||"Inconnu",date:data.date||today(),form:data.form||"Standard",notes:data.notes||""};recordLocal("capture",x);
if(data.meta){const extra={id,...data.meta,updated:today()};recordLocal("meta",extra)}
return x}
function saveHunt(hunt){const h={id:hunt.id||uid("hunt"),dex:Number(hunt.dex),game:hunt.game||"",method:hunt.method||"Rencontres libres",count:Math.max(0,Number(hunt.count)||0),multiplier:Math.max(1,Number(hunt.multiplier)||1),started:hunt.started||new Date().toISOString(),status:hunt.status||"En cours",notes:hunt.notes||"",form:hunt.form||"Standard",rate:hunt.rate||"",updated:new Date().toISOString()};recordLocal("hunt",h);return h}
function saveGoal(x){const g={id:x.id||uid("goal"),title:x.title||"Objectif",type:x.type||"custom",target:Math.max(1,Number(x.target)||1),current:Math.max(0,Number(x.current)||0),deadline:x.deadline||"",status:x.status||"En cours",notes:x.notes||"",updated:new Date().toISOString()};recordLocal("goal",g);return g}
function saveWish(x){recordLocal("wish",{dex:Number(x.dex),priority:x.priority||"Normal",game:x.game||"",method:x.method||"",notes:x.notes||"",date:today()})}
function logEvent(category,detail={}){recordLocal("event",{id:uid("event"),date:new Date().toISOString(),category,...detail})}
function randMissing(genFilter=0){const owned=aggregate().by;const choices=species.filter(p=>(!genFilter||p.gen===Number(genFilter))&&!owned.has(p.id));return choices[Math.floor(Math.random()*choices.length)]||null}
function achievements(){const a=aggregate();const items=[["✨","Premier éclat","Capturer un shiny",a.obtained>=1],["💎","Collectionneur","100 espèces shiny",a.obtained>=100],["👑","Légende chromatique","250 espèces shiny",a.obtained>=250],["🌈","Maître chromatique","500 espèces shiny",a.obtained>=500],["🏆","Living Dex ultime","1025 espèces",a.obtained>=1025],["🛡️","Patience infinie","10 000 tentatives sur une chasse",(a.record?.attempts||0)>=10000],["🎮","Explorateur","5 jeux représentés",a.game.length>=5],["🧬","Amoureux des formes","10 formes spéciales",state.captures.filter(c=>c.form&&c.form!=="Standard").length>=10],["⚡","Chasseur acharné","100 000 tentatives enregistrées",a.attempts>=100000],["🪩","Doublons","20 exemplaires en plus",a.duplicated>=20]];for(const g of a.gen)items.push(["🗺️",g.name+" complet","Terminer la génération "+g.gen,g.owned>=g.total]);return items.map(([icon,title,desc,done])=>({icon,title,desc,done}))}
function csvEsc(x){const s=safeStr(x);return /[;,"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}
function csv(rows){return "\ufeff"+rows.map(row=>row.map(csvEsc).join(";")).join("\r\n")}
function exportCaptureCSV(){const rows=[["ID","N° Dex","Pokémon","Jeu","Méthode","Tentatives","Quantité","Charme","Date","Forme","Notes","Surnom","Poké Ball","Sexe","Nature","Lieu","HOME","Possession"]];for(const c of state.captures){const m=getMeta(c.id);rows.push([c.id,c.dex,c.name||speciesName(c.dex),c.game,c.method,c.attempts,c.qty,c.charm,c.date,c.form,c.notes,m.nickname,m.ball,m.gender,m.nature,m.location,m.homeBox,m.ownership])}return csv(rows)}
function exportElementCSV(){const rows=[["N° Dex","Pokémon","Jeu","Méthode","Rencontres / Reset / Œufs","Date","Forme","Quantité","Publication Element SH"]];for(const c of state.captures)rows.push([c.dex,c.name||speciesName(c.dex),c.game,c.method,c.attempts,c.date,c.form,c.qty,"À publier manuellement"]);return csv(rows)}
function parseCSV(text){const first=text.replace(/^\ufeff/,"").split(/\r?\n/,1)[0]||"";const delimiter=first.includes(";")?";":",";const out=[];let r=[],field="",quoted=false;for(let i=0;i<text.length;i++){const ch=text[i];if(quoted){if(ch==='"'&&text[i+1]==='"'){field+='"';i++}else if(ch==='"')quoted=false;else field+=ch}else if(ch==='"')quoted=true;else if(ch===delimiter){r.push(field);field=""}else if(ch==="\n"){r.push(field.replace(/\r$/,""));out.push(r);r=[];field=""}else field+=ch}if(field||r.length){r.push(field);out.push(r)}return out}
function importFile(text){let items=[];if(text.trim().startsWith("{")||text.trim().startsWith("[")){const v=JSON.parse(text);items=Array.isArray(v)?v:(v.captures||[])}else{const rows=parseCSV(text);const keys=rows[0]?.map(x=>x.toLowerCase().trim())||[];function field(r,names){for(const n of names){let i=keys.findIndex(k=>k.includes(n));if(i>=0)return r[i]||""}return""}
for(const r of rows.slice(1)){const dex=Number(field(r,["n° dex","num dex","dex","numéro"]));if(!dex||!speciesById.has(dex))continue;items.push({id:uid("IMP"),dex,name:speciesName(dex),game:field(r,["jeu"]),method:field(r,["méthode","methode"]),attempts:field(r,["tentative","rencontre","reset"]),qty:Number(field(r,["quantité","quantite","nombre"]))||1,charm:field(r,["charme"])||"Inconnu",date:field(r,["date"]),form:field(r,["forme"])||"Standard",notes:field(r,["note"])})}}
const existing=new Set(state.captures.map(x=>x.id));let added=0;for(const x of items){if(!speciesById.has(Number(x.dex)))continue;let id=String(x.id||uid("IMP"));if(existing.has(id))continue;existing.add(id);state.captures.push({...x,id,unsynced:true});added++}
state.origin="Import local";persist();return added}
function download(name,text,type="text/plain"){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
window.addEventListener("online",()=>{emit("online");if(state.settings.token)connect()});
window.DexCore={state,species,speciesById,forms,games,GEN_NAMES,METHODS,POKEBALLS,NATURES,saveCapture,saveHunt,saveGoal,saveWish,logEvent,settings,setLocal,subscribe,emit,persist,connect,refresh,flushQueue,aggregate,getMeta,achievements,randMissing,speciesName,generation,sprite,imageFallback,fmt,pct,today,dateOnly,esc,uid,exportCaptureCSV,exportElementCSV,importFile,download,KEY,SCRIPT_URL,jsonp,inGoogle};
})();
