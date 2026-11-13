import {eventCalendar,googleCalendarURL} from './calendar-event-core.mjs';
const dateValue=value=>{const d=new Date(value+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(+d)||d.toISOString().slice(0,10)!==value)throw Error('Tarkista päivämäärä.');return d;};
const compact=value=>value.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
export function helsinkiInstant(ds,clock){
 dateValue(ds);if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(clock))throw Error('Tarkista kellonaika.');
 const [h,m]=clock.split(':').map(Number),desired=+dateValue(ds)+(h*60+m)*60000;
 let instant=desired;const f=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<3;i++){const p=Object.fromEntries(f.formatToParts(instant).map(p=>[p.type,p.value]));instant+=desired-Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);}
 const result=new Date(instant);if(f.format(result).slice(0,10)!==ds)throw Error('Tarkista paikallinen aika.');return result;
}
export function serviceEvent(e){return {...e,slug:e.id,description:[e.applies,e.period,e.qualifier&&e.qualifier!=='Määräpäivä'?e.qualifier:null,e.time?'Suomen aika, Europe/Helsinki.':null,e.checked?'Tarkistettu '+e.checked:null].filter(Boolean).join(' '),url:e.source||'https://kalenteri365.fi/'};}
export function serviceCalendar(e,reminder='1',now=new Date()){
 const event=serviceEvent(e);let result=eventCalendar(event,reminder,now);
 if(e.endDate){if(dateValue(e.endDate)<=dateValue(e.date))throw Error('Loppupäivän tulee olla alun jälkeen.');result=result.replace(/DTEND;VALUE=DATE:[^\r]+/,'DTEND;VALUE=DATE:'+e.endDate.replaceAll('-',''));}
 if(e.time){const start=helsinkiInstant(e.date,e.time),end=new Date(+start+15*60000);result=result.replace(/DTSTART;VALUE=DATE:[^\r]+/,'DTSTART:'+compact(start)).replace(/DTEND;VALUE=DATE:[^\r]+/,'DTEND:'+compact(end));}
 if(e.tentative)result=result.replace('STATUS:CONFIRMED','STATUS:TENTATIVE');
 return result;
}
export function serviceGoogleURL(e){const url=new URL(googleCalendarURL(serviceEvent(e)));if(e.endDate)url.searchParams.set('dates',e.date.replaceAll('-','')+'/'+e.endDate.replaceAll('-',''));if(e.time){const start=helsinkiInstant(e.date,e.time);url.searchParams.set('dates',compact(start)+'/'+compact(new Date(+start+15*60000)));}return url.href;}
export function flagHours(ds,{sunset,polar,midsummer=false,election=false}={}){
 dateValue(ds);
 if(midsummer)return {start:'18.00 edellisenä päivänä',end:'21.00',reason:'Suomen lipun päivä: yhtäjaksoinen juhannusliputus.'};
 if(ds.endsWith('-12-06')||election)return {start:'08.00',end:'20.00',reason:'Itsenäisyyspäivän tai vaalipäivän erityisaika.'};
 if(polar==='down')return {start:'08.00',end:'16.00',reason:'Sisäministeriön suositus kaamosalueelle.'};
 if(polar==='up')return {start:'08.00',end:'21.00',reason:'Aurinko ei laske: kesän viimeinen liputushetki on klo 21.'};
 if(!sunset)return {start:'08.00',end:'Tarkista paikallinen auringonlasku',reason:'Paikallista laskuaikaa ei ole saatavilla.'};
 const clock=new Intl.DateTimeFormat('fi-FI',{timeZone:'Europe/Helsinki',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(sunset)).replace(':','.');
 const [h,m]=clock.split('.').map(Number);return {start:'08.00',end:h*60+m>1260?'21.00':clock,reason:'Auringonlaskuun, kuitenkin viimeistään klo 21.'};
}
export function daylightDifference(today,yesterday){if(!Number.isFinite(today)||!Number.isFinite(yesterday))return null;return today-yesterday;}
