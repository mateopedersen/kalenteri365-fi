// Only this site's documented records are included. Never clear an origin wholesale.
export const LOCAL_RECORDS = [
  {key:'kalenteri365-fi-v1', name:'Oma kalenteri', detail:'Tapahtumat, tehtävät, muistiinpanot, suunnitelmat ja käyttövalinnat', group:'plans'},
  {key:'kalenteri365-v1', name:'Aiemman version kalenteri', detail:'Mahdollinen vanha paikallinen kalenteritallennus', group:'plans'},
  {key:'kalenteri365-studio-project-v1', name:'Kalenterin muokkain', detail:'Projektin asetukset, tekstit, kuvat ja omat tapahtumat', group:'plans'},
  {key:'kalenteri365-shifts-fi-v1', name:'Työvuorosuunnitelma', detail:'Vuorokierto, poikkeukset ja muistiinpanot', group:'plans'},
  {key:'kalenteri365-vacation-plan-v1', name:'Lomasuunnitelma', detail:'Itse tallennettu vapaa, työviikon valinnat ja vientiasetukset', group:'plans'},
  {key:'kalenteri365-print-favs-v1', name:'Suosikkipohjat', detail:'Itse suosikeiksi merkityt tulostuspohjat', group:'preferences'},
  {key:'fi-storage-notice-until', name:'Tallennusilmoituksen kuittaus', detail:'Ajankohta, johon asti ilmoitus pidetään suljettuna', group:'preferences'},
];
const WEATHER_KEY=/^fi-met-weather-v2-[a-z0-9-]+$/;
export function localInventory(storage,session){
  const rows=[];let unavailable=false;
  for(const record of LOCAL_RECORDS){try{const value=storage?.getItem(record.key);if(value!=null)rows.push({...record,area:'local',bytes:new TextEncoder().encode(value).length});}catch{unavailable=true;}}
  try{for(let i=0;i<(session?.length||0);i++){const key=session.key(i);if(WEATHER_KEY.test(key)){const value=session.getItem(key);rows.push({key,name:'Sääennusteen välimuisti',detail:'Paikkakunta '+key.replace('fi-met-weather-v2-',''),group:'cache',area:'session',bytes:new TextEncoder().encode(value||'').length});}}}catch{unavailable=true;}
  return {rows,unavailable};
}
export function exportLocalData(storage,session,now=new Date()){
  const {rows}=localInventory(storage,session);
  return {format:'kalenteri365-local-data',version:1,createdAt:now.toISOString(),records:rows.map(r=>({key:r.key,area:r.area,value:(r.area==='local'?storage:session).getItem(r.key)}))};
}
export function removeLocalData(storage,session,groups){
  const chosen=new Set(groups),{rows}=localInventory(storage,session);let removed=0;
  for(const row of rows)if(chosen.has(row.group)){(row.area==='local'?storage:session).removeItem(row.key);removed++;}
  return removed;
}
