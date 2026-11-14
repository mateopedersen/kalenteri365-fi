import {validDay,occurs} from './personal-planner-core.mjs';
export const NAME_DAY_SEARCH='https://almanakka.helsinki.fi/fi/nimipaivat/nimipaivahaku';
export const NAME_DAY_CALENDARS={fi:'Suomenkielinen',sv:'Ruotsinkielinen',other:'Muu nimipäiväkalenteri'};
export const NAME_DAY_REMINDERS={none:'Ei ilmoitusta','0':'Samana päivänä','1':'Päivää ennen','7':'Viikkoa ennen'};
const SUFFIX=' · nimipäivä';
export const namedayName=e=>String(e?.title||'').endsWith(SUFFIX)?e.title.slice(0,-SUFFIX.length):String(e?.title||'');
export function namedayMeta(e){const n=e?.nameday;return n?.version===1&&e.repeat==='yearly'&&validDay(e.date)&&Object.hasOwn(NAME_DAY_CALENDARS,n.calendar)&&Object.hasOwn(NAME_DAY_REMINDERS,String(n.reminder))?{version:1,calendar:n.calendar,reminder:String(n.reminder)}:null;}
export function makeNameday(input,{id,previous={}}={}){
 const name=String(input.name||'').trim(),month=Number(input.month),day=Number(input.day),calendar=String(input.calendar||''),reminder=String(input.reminder||''),note=String(input.note||'').trim();
 if(!name||name.length>100||/[\u0000-\u001f\u007f]/u.test(name))throw Error('Kirjoita nimi, jossa on 1–100 merkkiä.');
 const date='2000-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');
 if(!Number.isInteger(month)||!Number.isInteger(day)||!validDay(date))throw Error('Tarkista päivä ja kuukausi. Valitun päivän on oltava olemassa.');
 if(!Object.hasOwn(NAME_DAY_CALENDARS,calendar)||!Object.hasOwn(NAME_DAY_REMINDERS,reminder))throw Error('Valitse kalenteri ja ilmoitus.');
 if(note.length>600)throw Error('Muistiinpanoon mahtuu 600 merkkiä.');
 return {...previous,id:id||previous.id,date,title:name+SUFFIX,time:'',category:'family',repeat:'yearly',interval:Math.max(1,Math.min(366,Number(previous.interval)||1)),until:validDay(previous.until)?previous.until:null,exdates:Array.isArray(previous.exdates)?previous.exdates.filter(validDay):[],note,nameday:{version:1,calendar,reminder}};
}
export function namedayReport(e,today){
 const meta=namedayMeta(e);if(!meta||!validDay(today))return null;
 const interval=Math.max(1,Math.min(366,Number(e.interval)||1)),base=Number(e.date.slice(0,4)),start=base+Math.ceil((Math.max(Number(today.slice(0,4)),base)-base)/interval)*interval;let next=null;
 for(let year=start;year<=9999;year+=interval){const ds=year+e.date.slice(4);if(e.until&&ds>e.until)break;if(ds>=today&&validDay(ds)&&occurs(e,ds)){next=ds;break;}}
 return {event:e,meta,name:namedayName(e),next,days:next?Math.round((Date.parse(next+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000):null};
}
export function duplicateNameday(event,events){const meta=namedayMeta(event);return events.some(e=>e.id!==event.id&&namedayMeta(e)?.calendar===meta?.calendar&&e.date.slice(5)===event.date.slice(5)&&namedayName(e).normalize('NFC').toLocaleLowerCase('fi-FI')===namedayName(event).normalize('NFC').toLocaleLowerCase('fi-FI'));}
const escape=value=>String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,c=>'\\'+c).replace(/\r/g,'');
function fold(line){let result='',bytes=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(bytes+n>75){result+='\r\n ';bytes=1;}result+=c;bytes+=n;}return result;}
export function namedaysICS(events,today,now=new Date()){
 const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365.fi//Omat nimipaivat//FI','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Omat nimipäivät'];
 for(const e of events){const r=namedayReport(e,today);if(!r?.next)continue;const end=new Date(Date.parse(r.next+'T00:00:00Z')+86400000).toISOString().slice(0,10);
 lines.push('BEGIN:VEVENT','UID:'+escape(String(e.id).replace(/[\r\n]/g,''))+'@kalenteri365.fi','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+r.next.replaceAll('-',''),'DTEND;VALUE=DATE:'+end.replaceAll('-',''),'RRULE:FREQ=YEARLY;INTERVAL='+Math.max(1,Math.min(366,Number(e.interval)||1))+(e.until&&validDay(e.until)?';UNTIL='+e.until.replaceAll('-',''):''),'SUMMARY:'+escape(e.title),'TRANSP:TRANSPARENT');
 if(e.exdates?.filter(validDay).length)lines.push('EXDATE;VALUE=DATE:'+e.exdates.filter(validDay).map(d=>d.replaceAll('-','')).join(','));
 if(r.meta.reminder!=='none')lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escape(e.title),'TRIGGER:'+(r.meta.reminder==='0'?'P0D':'-P'+r.meta.reminder+'D'),'END:VALARM');lines.push('END:VEVENT');}
 lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
