import {CITIES} from '../src/calendar.mjs';
const store=new Map(),pending=new Map();
const labels={clearsky:'Selkeää',fair:'Melko selkeää',partlycloudy:'Puolipilvistä',cloudy:'Pilvistä',fog:'Sumua',lightrain:'Heikkoa sadetta',rain:'Vesisadetta',heavyrain:'Voimakasta sadetta',lightsnow:'Heikkoa lumisadetta',snow:'Lumisadetta',heavysnow:'Runsasta lumisadetta',lightsleet:'Heikkoa räntäsadetta',sleet:'Räntäsadetta',heavysleet:'Voimakasta räntäsadetta'};
export function summarizeForecast(data,now=Date.now()){
 const series=data?.properties?.timeseries;if(!Array.isArray(series)||!series.length)throw Error('Ennustetiedot puuttuvat.');
 const usable=series.filter(p=>Number.isFinite(Date.parse(p.time))),entry=usable.filter(p=>Date.parse(p.time)<=now).at(-1)||usable[0];if(Math.abs(Date.parse(entry.time)-now)>4*3600000)throw Error('Ennuste ei kata nykyistä ajankohtaa.');
 const details=entry.data.instant.details,symbol=entry.data.next_1_hours?.summary?.symbol_code||entry.data.next_6_hours?.summary?.symbol_code||'cloudy',base=symbol.replace(/_(day|night|polartwilight)$/,'');
 const name=base.includes('thunder')?'Ukkosta':labels[base]|| (base.includes('snow')?'Lumikuuroja':base.includes('sleet')?'Räntäkuuroja':base.includes('rain')?'Sadekuuroja':'Vaihtelevaa pilvisyyttä');
 const icon=base.includes('thunder')?'storm':base.includes('snow')?'snow':base.includes('sleet')||base.includes('rain')?'rain':base==='clearsky'||base==='fair'?(symbol.endsWith('_night')?'moon':'sun'):'cloud';
 if(!Number.isFinite(details.air_temperature))throw Error('Lämpötila puuttuu.');
 return {time:entry.time,temperature:details.air_temperature,wind:details.wind_speed,humidity:details.relative_humidity,symbol,name,icon,modelUpdatedAt:data.properties.meta.updated_at};
}
export async function getWeather(id,{fetchImpl=fetch,now=Date.now()}={}){
 const city=CITIES.find(c=>c[0]===id);if(!city)throw Object.assign(Error('Paikkakuntaa ei löydy.'),{status:404});
 const cached=store.get(id);if(cached&&cached.expires>now)return cached;
 if(pending.has(id))return pending.get(id);
 const promise=(async()=>{const url=new URL('https://api.met.no/weatherapi/locationforecast/2.0/compact');url.searchParams.set('lat',city[2].toFixed(4));url.searchParams.set('lon',city[3].toFixed(4));const headers={'User-Agent':'Kalenteri365.fi/1.0 https://kalenteri365.fi/yhteystiedot/ https://github.com/mateopedersen/kalenteri365-fi','Accept':'application/json'};if(cached?.lastModified)headers['If-Modified-Since']=cached.lastModified;
 const response=await fetchImpl(url,{headers,signal:AbortSignal.timeout(12000)});
 if(!response.ok&&response.status!==304)throw Object.assign(Error('MET Norway -ennustetta ei voida juuri nyt hakea.'),{status:503});
 const expires=Math.max(now+60000,Date.parse(response.headers.get('Expires'))||now+600000),data=response.status===304?cached?.data:await response.json();if(!data)throw Error('Ennustetiedot puuttuvat.');
 const result={data,expires,lastModified:response.headers.get('Last-Modified')||cached?.lastModified,value:{city:id,placeName:city[1],...summarizeForecast(data,now),fetchedAt:new Date(now).toISOString(),expiresAt:new Date(expires).toISOString(),source:{name:'MET Norway',url:'https://www.met.no/',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',description:'Paikkakunnan keskustan ennuste, ei asemamittaus'}}};store.set(id,result);return result;})().finally(()=>pending.delete(id));pending.set(id,promise);return promise;
}
export async function weatherResponse(request,options={}){try{const id=new URL(request.url).searchParams.get('place')||'helsinki',entry=await getWeather(id,options),ttl=Math.max(0,Math.floor((entry.expires-Date.now())/1000));return Response.json(entry.value,{headers:{'Cache-Control':`public, max-age=${Math.min(60,ttl)}, s-maxage=${ttl}`,'X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'}});}catch(e){return Response.json({error:e.message},{status:e.status||503,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});}}
