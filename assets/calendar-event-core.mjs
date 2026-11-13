const ZONE='Europe/Helsinki';
export const REMINDERS=[['1','Edellisenä päivänä klo 9'],['7','Viikkoa ennen klo 9'],['0','Samana päivänä klo 9'],['none','Ei muistutusta']];
const dateOnly=value=>{const d=new Date(value+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(+d)||d.toISOString().slice(0,10)!==value)throw Error('Virheellinen päivämäärä.');return d;};
const compact=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const escape=value=>String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,c=>'\\'+c);
function fold(line){let result='',bytes=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(bytes+n>75){result+='\r\n ';bytes=1;}result+=c;bytes+=n;}return result;}
export function reminderInstant(date,reminder){
 if(reminder==='none')return null;
 if(!REMINDERS.some(([id])=>id===String(reminder)))throw Error('Virheellinen muistutus.');
 const day=dateOnly(date);day.setUTCDate(day.getUTCDate()-Number(reminder));
 const desired=+day+9*3600000;
 let instant=desired;
 const format=new Intl.DateTimeFormat('sv-SE',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<3;i++){
  const p=Object.fromEntries(format.formatToParts(instant).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  const displayed=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);
  instant+=desired-displayed;
 }
 return new Date(instant);
}
export function eventDownloadPath(slug,year,reminder='1'){
 if(!/^[a-z0-9-]+$/.test(slug)||![2027,2028,2029,2030].includes(Number(year))||!REMINDERS.some(([id])=>id===String(reminder)))throw Error('Virheellinen kalenterivalinta.');
 return `/kalenteriin/${slug}/${year}-${reminder}.ics`;
}
export function googleCalendarURL(event){
 const start=dateOnly(event.date),end=new Date(+start+86400000),url=new URL('https://calendar.google.com/calendar/r/eventedit');
 url.search=new URLSearchParams({action:'TEMPLATE',text:event.name,dates:compact(start).slice(0,8)+'/'+compact(end).slice(0,8),stz:ZONE,etz:ZONE,details:[event.description,event.url].filter(Boolean).join('\n\n')}).toString();
 return url.href;
}
export function eventCalendar(event,reminder='1',now=new Date()){
 const start=dateOnly(event.date),end=new Date(+start+86400000),alarm=reminderInstant(event.date,String(reminder));
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365.fi//Juhlapaivat//FI','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+escape(event.name),'X-WR-TIMEZONE:'+ZONE,'BEGIN:VEVENT',`UID:${event.date}-${event.slug}@kalenteri365.fi`,'DTSTAMP:'+compact(now),'DTSTART;VALUE=DATE:'+compact(start).slice(0,8),'DTEND;VALUE=DATE:'+compact(end).slice(0,8),'SUMMARY:'+escape(event.name),'DESCRIPTION:'+escape([event.description,event.url].filter(Boolean).join('\n\n')),'URL:'+event.url,'TRANSP:TRANSPARENT','STATUS:CONFIRMED'];
 if(alarm)lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escape(event.name),'TRIGGER;VALUE=DATE-TIME:'+compact(alarm),'END:VALARM');
 lines.push('END:VEVENT','END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
