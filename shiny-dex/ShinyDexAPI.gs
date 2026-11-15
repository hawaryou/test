/**
 * ShinyDex API v1.0 — À AJOUTER dans le projet Apps Script lié au Google Sheets
 * Ne pas supprimer le Code.gs de saisie rapide existant.
 * Installer une fois : exécuter installerShinyDex(), relever le code dans le journal,
 * puis redéployer l'Application Web (/exec).
 *
 * API protégée par code secret conservé uniquement dans ScriptProperties.
 * Le code n'est jamais incorporé aux fichiers publics GitHub.
 */
const SHINY_API = Object.freeze({
  spreadsheetId: '1Ikt96ssgDPlfan7PKh3GQI4rjYpldzXJN_t9grx5L3M',
  journal: '02 Journal de chasse',
  meta: '08 App · Métadonnées',
  hunts: '09 App · Chasses',
  goals: '10 App · Objectifs',
  events: '11 App · Événements',
  ops: '12 App · Opérations',
  wishes: '13 App · Souhaits',
  extras: '14 App · Organisation',
  maxRows: 2500
});
function shinySheet_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  return ss && ss.getId()===SHINY_API.spreadsheetId ? ss : SpreadsheetApp.openById(SHINY_API.spreadsheetId);
}
function installerShinyDex(){
  const p=PropertiesService.getScriptProperties();
  let token=p.getProperty('SHINYDEX_TOKEN');
  if(!token){
    token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');
    p.setProperty('SHINYDEX_TOKEN',token);
  }
  const ss=shinySheet_();
  const heads={
    [SHINY_API.meta]:['ID capture','Surnom','Poké Ball','Sexe','Nature','Lieu','Boîte HOME','État de possession','Photo Drive','Full Odds','Favori','Début chasse','Fin chasse','Tags','Notes complémentaires','Dernière modification','Baron shiny','Marques','Rubans','Taille','Jeu de sauvegarde','Console','Origine','Niveau','Date transfert','Détails complémentaires','Probabilité 1 sur','Source / conditions du taux','Heure de capture','Méthode de chasse précise'],
    [SHINY_API.hunts]:['ID chasse','N° Dex','Jeu','Méthode','Compteur','Multiplicateur','Début','Statut','Notes','Dernière modification','Forme','Résultat','Taux saisi','Chaîne actuelle','Meilleure chaîne','Révision','Partie de jeu'],
    [SHINY_API.goals]:['ID objectif','Titre','Catégorie','Cible','Actuel','Échéance','Statut','Notes','Dernière modification'],
    [SHINY_API.events]:['ID événement','Date','Catégorie','ID référence','Pokémon','Valeur','Description','Jeu','Méthode'],
    [SHINY_API.ops]:['ID opération','Date','Action','Statut','Message','Résultat'],
    [SHINY_API.wishes]:['N° Dex','Priorité','Jeu cible','Méthode envisagée','Notes','Date ajout'],
    [SHINY_API.extras]:['Clé','Contenu JSON','Dernière mise à jour','Révision']
  };
  for(const name of Object.keys(heads)){
    let sh=ss.getSheetByName(name);
    if(!sh){sh=ss.insertSheet(name);sh.getRange(1,1,1,heads[name].length).setValues([heads[name]]);sh.setFrozenRows(1)}
  }
  Logger.log('SHINYDEX TOKEN (à garder privé) : %s', token);
  Logger.log('SHINYDEX SCRIPT ID : %s', ScriptApp.getScriptId());
  return 'Initialisation terminée. Regarde le journal d’exécution pour copier le code secret.';
}
function shinyAuth_(token){
  const own=PropertiesService.getScriptProperties().getProperty('SHINYDEX_TOKEN');
  if(!own)throw new Error('API non initialisée. Exécute installerShinyDex dans Apps Script.');
  if(!token || String(token)!==own)throw new Error('Code ShinyDex incorrect.');
}
function shinyJs_(payload,callback){
  const name=String(callback||'');
  if(!/^[A-Za-z_$][A-Za-z0-9_$]{0,100}$/.test(name))return ContentService.createTextOutput(JSON.stringify({ok:false,error:'Callback invalide'})).setMimeType(ContentService.MimeType.JSON);
  return ContentService.createTextOutput(name+'('+JSON.stringify(payload)+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function doGet(e){
  const p=(e&&e.parameter)||{};
  if(p.api!=='1')return ContentService.createTextOutput('ShinyDex API active. Ouvre https://hawaryou.github.io/test/shiny-dex/').setMimeType(ContentService.MimeType.TEXT);
  try{
    shinyAuth_(p.token);
    if(p.action==='ping')return shinyJs_({ok:true,message:'API active'},p.callback);
    if(p.action==='status')return shinyJs_(shinyStatus_(p.id),p.callback);
    if(p.action==='bootstrap')return shinyJs_(dexBootstrap(p.token),p.callback);
    return shinyJs_({ok:false,error:'Action API inconnue'},p.callback);
  }catch(err){return shinyJs_({ok:false,error:String(err.message||err)},p.callback)}
}
function doPost(e){
  let p;
  try{
    if(e&&e.parameter&&e.parameter.payload)p=JSON.parse(e.parameter.payload);
    else if(e&&e.postData&&e.postData.contents)p=JSON.parse(e.postData.contents);
    else throw new Error('Aucune donnée reçue');
    const result=dexAction(p);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }catch(err){return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err.message||err)})).setMimeType(ContentService.MimeType.JSON)}
}
function shinyDate_(value){
  if(!value)return '';
  if(Object.prototype.toString.call(value)==='[object Date]'&&!isNaN(value.getTime()))
    return Utilities.formatDate(value,'Europe/Paris','yyyy-MM-dd');
  if(/^\d{4}-\d{2}-\d{2}/.test(String(value)))return String(value).slice(0,10);
  return String(value);
}
function shinyRows_(sh,limit=3000){
  if(!sh)return [];
  const last=Math.min(sh.getLastRow(),limit);if(last<2)return [];
  return sh.getRange(2,1,last-1,sh.getLastColumn()).getValues().filter(r=>r[0]!==''&&r[0]!==null);
}
function shinyObjRows_(rows,keys,dates=[]){
  return rows.map(row=>Object.fromEntries(keys.map((k,i)=>[k,dates.includes(k)?shinyDate_(row[i]):(row[i]==null?'':row[i])])));
}
function dexBootstrap(token){
  shinyAuth_(token);
  const ss=shinySheet_();
  const jr=shinyRows_(ss.getSheetByName(SHINY_API.journal),SHINY_API.maxRows);
  const captures=jr.map(r=>({
    id:String(r[0]),dex:Number(r[1]),name:String(r[2]||''),game:String(r[3]||''),
    method:String(r[4]||''),attempts:r[5]===''?'':(Number(r[5])||0),
    qty:Number(r[6])||1,charm:String(r[7]||'Inconnu'),date:shinyDate_(r[8]),
    form:String(r[9]||'Standard'),notes:String(r[10]||'')
  }));
  const meta=shinyObjRows_(shinyRows_(ss.getSheetByName(SHINY_API.meta)),
    ['id','nickname','ball','gender','nature','location','homeBox','ownership','photo','fullOdds','favorite','huntStart','huntEnd','tags','notes','updated','shalpha','marks','ribbons','size','saveFile','console','origin','level','transferred','details','odds','oddsConditions','captureTime','methodDetail'],['huntStart','huntEnd','updated','transferred']);
  const hunts=shinyObjRows_(shinyRows_(ss.getSheetByName(SHINY_API.hunts)),
    ['id','dex','game','method','count','multiplier','started','status','notes','updated','form','result','rate','chain','bestChain','revision','saveFile'],['started','updated']);
  const goals=shinyObjRows_(shinyRows_(ss.getSheetByName(SHINY_API.goals)),
    ['id','title','type','target','current','deadline','status','notes','updated'],['deadline','updated']);
  const events=shinyObjRows_(shinyRows_(ss.getSheetByName(SHINY_API.events),700),
    ['id','date','category','refId','pokemon','value','description','game','method'],['date']);
  const wishlist=shinyObjRows_(shinyRows_(ss.getSheetByName(SHINY_API.wishes)),
    ['dex','priority','game','method','notes','date'],['date']);
  const extras={};for(const row of shinyRows_(ss.getSheetByName(SHINY_API.extras))){try{extras[String(row[0])]=JSON.parse(String(row[1]||'null'))}catch(err){Logger.log('JSON incorrect en données avancées '+row[0])}}
  return {ok:true,captures,meta,hunts,goals,events,wishlist,extras,generated:new Date().toISOString(),source:'Google Sheets'};
}
function shinyStatus_(actionId){
  const id=String(actionId||'');
  if(!id||id.length>150)return {ok:false,error:'ID de requête invalide'};
  const sh=shinySheet_().getSheetByName(SHINY_API.ops);
  if(!sh)return {ok:true,state:'pending'};
  const cell=sh.getRange('A2:A'+Math.max(2,sh.getLastRow())).createTextFinder(id).matchEntireCell(true).findNext();
  if(!cell)return {ok:true,state:'pending'};
  const r=sh.getRange(cell.getRow(),1,1,6).getValues()[0];
  return {ok:r[3]==='ok',state:r[3]==='ok'?'ok':r[3]==='error'?'error':'pending',error:r[3]==='error'?String(r[4]):'',result:String(r[5]||'')};
}
function shinyFirstFree_(sh,col=1){
  const last=Math.max(2,Math.min(SHINY_API.maxRows,sh.getMaxRows()));
  const rows=sh.getRange(2,col,last-1,1).getValues();
  for(let i=0;i<rows.length;i++)if(rows[i][0]===''||rows[i][0]===null)return i+2;
  if(sh.getMaxRows()<=SHINY_API.maxRows)sh.insertRowsAfter(sh.getMaxRows(),200);
  return last+1;
}
function shinyWrite_(sheetName,key,value,rowData){
  const sh=shinySheet_().getSheetByName(sheetName);
  if(!sh)throw new Error('Onglet de stockage manquant : '+sheetName);
  let cell=null;
  if(value!=='')cell=sh.getRange(2,key,Math.max(1,sh.getLastRow()-1),1).createTextFinder(String(value)).matchEntireCell(true).findNext();
  const row=cell?cell.getRow():shinyFirstFree_(sh,key);
  sh.getRange(row,1,1,rowData.length).setValues([rowData]);
  return row;
}
function shinyLog_(id,type,data){
  try{const sh=shinySheet_().getSheetByName(SHINY_API.events);if(!sh)return;
    const row=shinyFirstFree_(sh);sh.getRange(row,1,1,9).setValues([[
      'EV-'+Utilities.getUuid().slice(0,12),new Date(),type,
      data.id||'',data.dex||'',data.count||data.qty||0,
      data.notes||'',data.game||'',data.method||''
    ]]);
  }catch(err){Logger.log('Journal non critique : '+err.message)}
}
function shinyAction_(type,data){
  const ss=shinySheet_();const now=new Date();
  if(!data||typeof data!=='object')throw new Error('Données absentes.');
  if(type==='capture'){
    const dex=Number(data.dex),qty=Number(data.qty);
    if(!Number.isInteger(dex)||dex<1||dex>1025)throw new Error('Numéro Dex invalide.');
    if(!Number.isInteger(qty)||qty<1||qty>999)throw new Error('Quantité invalide.');
    if(!String(data.game||'').trim()||!String(data.method||'').trim())throw new Error('Jeu et méthode requis.');
    const count=data.attempts===''||data.attempts==null?'':Number(data.attempts);
    if(count!==''&&(!Number.isInteger(count)||count<0))throw new Error('Tentatives invalides.');
    const sh=ss.getSheetByName(SHINY_API.journal);
    const row=shinyWrite_(SHINY_API.journal,1,String(data.id),[
      String(data.id),dex,'',String(data.game).slice(0,160),String(data.method).slice(0,120),
      count,qty,String(data.charm||'Inconnu'),data.date?new Date(String(data.date)+'T12:00:00'):now,
      String(data.form||'Standard'),String(data.notes||'').slice(0,1200),'',''
    ]);
    sh.getRange('C2').copyTo(sh.getRange(row,3),SpreadsheetApp.CopyPasteType.PASTE_FORMULA,false);
    sh.getRange(row,9).setNumberFormat('dd/mm/yyyy');
    shinyLog_(String(data.id),'Capture',data);
    return {id:String(data.id),sheetRow:row};
  }
  if(type==='meta'){
    const id=String(data.id||'');if(!id)throw new Error('ID capture requis.');
    const row=shinyWrite_(SHINY_API.meta,1,id,[
      id,String(data.nickname||''),String(data.ball||''),String(data.gender||''),
      String(data.nature||''),String(data.location||''),String(data.homeBox||''),
      String(data.ownership||'Possédé'),String(data.photo||''),String(data.fullOdds||''),
      data.favorite===true||data.favorite==='true',String(data.huntStart||''),String(data.huntEnd||''),
      String(data.tags||''),String(data.notes||''),now,
      data.shalpha===true||data.shalpha==='true',String(data.marks||''),String(data.ribbons||''),String(data.size||''),
      String(data.saveFile||''),String(data.console||''),String(data.origin||''),Number(data.level)||'',
      String(data.transferred||''),String(data.details||'').slice(0,6000),
      Number(data.odds)||'',String(data.oddsConditions||'').slice(0,800),String(data.captureTime||''),String(data.methodDetail||'').slice(0,240)
    ]);
    return {id,sheetRow:row};
  }
  if(type==='hunt'){
    const id=String(data.id||'');if(!id)throw new Error('ID chasse requis.');
    const hunting=ss.getSheetByName(SHINY_API.hunts);
    const found=hunting.getRange(2,1,Math.max(1,hunting.getLastRow()-1),1).createTextFinder(id).matchEntireCell(true).findNext();
    const previousRevision=found?(Number(hunting.getRange(found.getRow(),16).getValue())||0):0;
    const expected=Number(data.revision)||0;
    if(found&&expected!==previousRevision)throw new Error('CONFLIT_VERSIONS: une autre session a modifié cette chasse. Recharge et réconcilie les compteurs.');
    const nextRevision=previousRevision+1;
    const row=shinyWrite_(SHINY_API.hunts,1,id,[
      id,Number(data.dex)||0,String(data.game||''),String(data.method||''),
      Math.max(0,Number(data.count)||0),Math.max(1,Number(data.multiplier)||1),
      data.started?new Date(data.started):now,String(data.status||'En cours'),
      String(data.notes||''),now,String(data.form||'Standard'),
      String(data.result||''),String(data.rate||''),
      Math.max(0,Number(data.chain)||0),Math.max(0,Number(data.bestChain)||0),
      nextRevision,String(data.saveFile||'')
    ]);
    return {id,sheetRow:row,revision:nextRevision};
  }
  if(type==='goal'){
    const id=String(data.id||'');if(!id)throw new Error('ID objectif requis.');
    const row=shinyWrite_(SHINY_API.goals,1,id,[
      id,String(data.title||''),String(data.type||'custom'),
      Math.max(1,Number(data.target)||1),Math.max(0,Number(data.current)||0),
      String(data.deadline||''),String(data.status||'En cours'),String(data.notes||''),now
    ]);
    return {id,sheetRow:row};
  }
  if(type==='wish'){
    const dex=Number(data.dex);if(!dex||dex>1025)throw new Error('Numéro invalide.');
    const row=shinyWrite_(SHINY_API.wishes,1,dex,[dex,String(data.priority||'Normal'),
      String(data.game||''),String(data.method||''),String(data.notes||''),now]);
    return {dex,sheetRow:row};
  }
  if(type==='extra'){
    const key=String(data.key||'');if(!/^[a-zA-Z0-9._:-]{1,100}$/.test(key))throw new Error('Clé avancée invalide');
    const json=JSON.stringify(data.value);
    if(json.length>45000)throw new Error('Données trop volumineuses pour une cellule Sheets (45 000 caractères)');
    const sh=ss.getSheetByName(SHINY_API.extras);
    const row=shinyWrite_(SHINY_API.extras,1,key,[key,json,now,1]);return {key,sheetRow:row};
  }
  if(type==='event'){
    const sh=ss.getSheetByName(SHINY_API.events);const row=shinyFirstFree_(sh);
    sh.getRange(row,1,1,9).setValues([[String(data.id||Utilities.getUuid()),now,
      String(data.category||'Note'),String(data.refId||''),
      String(data.pokemon||''),Number(data.value)||0,
      String(data.description||''),String(data.game||''),String(data.method||'')]]);
    return {id:data.id,sheetRow:row};
  }
  throw new Error('Action inconnue : '+type);
}
function dexAction(payload){
  shinyAuth_(payload&&payload.token);
  const actionId=String(payload.actionId||''),type=String(payload.type||'');
  if(!/^[a-zA-Z0-9_-]{6,120}$/.test(actionId))throw new Error('ID opération invalide.');
  const lock=LockService.getScriptLock();lock.waitLock(25000);
  try{
    const sh=shinySheet_().getSheetByName(SHINY_API.ops);
    if(!sh)throw new Error('Onglet Opérations manquant. Lance installerShinyDex.');
    const existing=sh.getRange(2,1,Math.max(1,sh.getLastRow()-1),1).createTextFinder(actionId).matchEntireCell(true).findNext();
    if(existing){
      const v=sh.getRange(existing.getRow(),1,1,6).getValues()[0];
      return {ok:v[3]==='ok',state:v[3]==='ok'?'ok':v[3]==='error'?'error':'pending',result:v[5],error:v[3]==='error'?v[4]:''};
    }
    const row=shinyFirstFree_(sh);sh.getRange(row,1,1,6).setValues([[actionId,new Date(),type,'processing','','']]);
    SpreadsheetApp.flush();
    try{
      const result=shinyAction_(type,payload.data);
      sh.getRange(row,4,1,3).setValues([['ok','',JSON.stringify(result)]]);
      SpreadsheetApp.flush();return {ok:true,state:'ok',result};
    }catch(err){
      sh.getRange(row,4,1,3).setValues([['error',String(err.message||err),'']]);
      SpreadsheetApp.flush();return {ok:false,state:'error',error:String(err.message||err)};
    }
  }finally{lock.releaseLock()}
}
/** Optionnel : vérifier le fonctionnement en Apps Script, sans modifier les captures. */
function diagnosticShinyDex(){
  const token=PropertiesService.getScriptProperties().getProperty('SHINYDEX_TOKEN');
  const d=dexBootstrap(token);
  Logger.log('ShinyDex OK : '+d.captures.length+' lignes de capture, '+d.hunts.length+' chasses.');
  return {captures:d.captures.length,hunts:d.hunts.length,goals:d.goals.length};
}
