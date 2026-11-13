const SOURCE='https://almanakka.helsinki.fi/fi/nimipaivat/nimipaivarajapinta';
const entries=new Map(),pending=new Map();
const fiDay=now=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki'}).format(new Date(now));
export function normalizeNamedays(data,now=Date.now()){
 const date=data?.date,day=date&&`${date.year}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`;
 if(data?.success!==true||day!==fiDay(now))throw Error('Nimipäiväpalvelun päivämäärä ei vastaa tätä päivää.');
 if(!Array.isArray(data.name_days))throw Error('Nimipäivätiedot puuttuvat.');
 const names=type=>[...new Set(data.name_days.filter(n=>n.type===type&&n.day===date.day&&n.month===date.month&&typeof n.name==='string'&&n.name.length<=100).map(n=>n.name))];
 return {date:day,fi:names('suomi'),sv:names('ruotsi'),source:{name:'Helsingin yliopiston almanakkatoimisto',url:SOURCE}};
}
export async function namedaysResponse({env={},fetchImpl=fetch,now=Date.now()}={}){
 const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'};
 if(env.NAMEDAY_LICENSE_CONFIRMED!=='true'||!/^ndt_\S+$/.test(env.NAMEDAY_API_TOKEN||''))return Response.json({available:false,reason:'not_configured',source:SOURCE},{status:200,headers});
 const token=env.NAMEDAY_API_TOKEN,key=token+':'+fiDay(now),entry=entries.get(key);
 if(entry&&entry.expires>now)return Response.json(entry.value,{headers:{...headers,'Cache-Control':'public, max-age=60, s-maxage=600'}});
 try{
  let operation=pending.get(key);
  if(!operation){operation=(async()=>{
   const response=await fetchImpl('https://nimipaivarajapinta.fi/api/namedays/today',{headers:{Authorization:'Bearer '+token,Accept:'application/json'},signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw Error('Nimipäiväpalvelu ei ole saatavilla.');
   const value=normalizeNamedays(await response.json(),now);entries.clear();entries.set(key,{expires:now+600000,value});return value;
  })().finally(()=>pending.delete(key));pending.set(key,operation);}
  const value=await operation;return Response.json(value,{headers:{...headers,'Cache-Control':'public, max-age=60, s-maxage=600'}});
 }catch{return Response.json({available:false,reason:'temporarily_unavailable',source:SOURCE},{status:503,headers});}
}
