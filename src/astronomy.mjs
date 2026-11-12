import * as A from 'astronomy-engine';
import {date,iso,CITIES} from './calendar.mjs';
export const phaseNames=['Uusikuu','Ensimmäinen neljännes','Täysikuu','Viimeinen neljännes'];
export const phaseSymbols=['●','◐','○','◑'];
export const localDate=d=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
export const time=d=>d?new Intl.DateTimeFormat('fi-FI',{timeZone:'Europe/Helsinki',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(d)).replace('.',':'):'—';
export function phases(y){let q=A.SearchMoonQuarter(new Date(`${y}-01-01T00:00:00+02:00`)),out=[];while(q.time.date<date(y+1,1,1)){if(localDate(q.time.date).startsWith(String(y)))out.push({date:localDate(q.time.date)+'T'+time(q.time.date),utc:q.time.date.toISOString(),quarter:q.quarter,name:phaseNames[q.quarter],symbol:phaseSymbols[q.quarter]});q=A.NextMoonQuarter(q);}return out;}
export function seasons(y){let s=A.Seasons(y);return [['Kevätpäiväntasaus',s.mar_equinox],['Kesäpäivänseisaus',s.jun_solstice],['Syyspäiväntasaus',s.sep_equinox],['Talvipäivänseisaus',s.dec_solstice]].map(([name,t])=>({name,utc:t.date.toISOString(),date:localDate(t.date),time:time(t.date)}));}
export function riseSet(city,day,body='Sun'){
 let probe=new Date(iso(day)+'T00:00:00Z');let offset=Number(new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Helsinki',timeZoneName:'shortOffset'}).formatToParts(new Date(+probe-7200000)).find(p=>p.type==='timeZoneName').value.replace('GMT+',''));let start=new Date(+probe-offset*3600000);
 let obs=new A.Observer(city[2],city[3],0),get=dir=>{let t=A.SearchRiseSet(body,obs,dir,start,1);return t&&localDate(t.date)===iso(day)?t.date:null;},rise=get(1),set=get(-1);let up=A.Equator(body,start,obs,true,true);let alt=A.Horizon(start,obs,up.ra,up.dec,'normal').altitude;
 let duration=null;if(body==='Sun'){if(rise&&set)duration=Math.round((+set-+rise)/60000);else if(!rise&&!set)duration=alt>0?1440:0;}
 return {rise:rise?.toISOString()||null,set:set?.toISOString()||null,riseTime:time(rise),setTime:time(set),duration,polar:!rise&&!set?(alt>0?'up':'down'):null};
}
export function localEclipses(city,startYear,endYear){let obs=new A.Observer(city[2],city[3],0),sun=[],moon=[];let s=A.SearchLocalSolarEclipse(date(startYear,1,1),obs);while(s.peak.time.date<date(endYear+1,1,1)){sun.push({kind:s.kind,peak:s.peak.time.date.toISOString(),altitude:s.peak.altitude,obscuration:s.obscuration});s=A.NextLocalSolarEclipse(s.peak.time,obs);}let l=A.SearchLunarEclipse(date(startYear,1,1));while(l.peak.date<date(endYear+1,1,1)){let eq=A.Equator('Moon',l.peak,obs,true,true),alt=A.Horizon(l.peak,obs,eq.ra,eq.dec,'normal').altitude;moon.push({kind:l.kind,peak:l.peak.date.toISOString(),altitude:alt,obscuration:l.obscuration});l=A.NextLunarEclipse(l.peak);}return {sun,moon};}
