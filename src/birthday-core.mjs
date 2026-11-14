import {validDay,occurs} from './personal-planner-core.mjs';
export const BIRTHDAY_GROUPS={family:'Perhe',friends:'Ystävät',work:'Työkaverit',other:'Muut'};
export const BIRTHDAY_REMINDERS={none:'Ei muistutusta','0':'Samana päivänä','1':'Päivää ennen','7':'Viikkoa ennen'};
const SUFFIX=' · syntymäpäivä';
export const birthdayName=e=>String(e.title||'').endsWith(SUFFIX)?e.title.slice(0,-SUFFIX.length):String(e.title||'');
export function birthdayMeta(e){
 const b=e?.birthday;
 if(!b||b.version!==1||e.repeat!=='yearly'||!validDay(e.date)||!Object.hasOwn(BIRTHDAY_GROUPS,b.group)||!Object.hasOwn(BIRTHDAY_REMINDERS,String(b.reminder)))return null;
 const birthYear=Number.isInteger(b.birthYear)&&b.birthYear>=1900&&b.birthYear===Number(e.date.slice(0,4))?b.birthYear:null;
 return {version:1,birthYear,group:b.group,reminder:String(b.reminder)};
}
export function makeBirthday(input,{id,previous={},today}={}){
 if(!validDay(today))throw Error('Päivämäärää ei voitu tarkistaa.');
 const name=String(input.name||'').trim(),day=Number(input.day),month=Number(input.month),rawYear=String(input.year??'').trim(),birthYear=rawYear===''?null:Number(rawYear);
 if(!name||name.length>100)throw Error('Kirjoita nimi, jossa on 1–100 merkkiä.');
 if(birthYear!==null&&(!Number.isInteger(birthYear)||birthYear<1900||birthYear>Number(today.slice(0,4))))throw Error('Tarkista syntymävuosi. Voit myös jättää vuoden tyhjäksi.');
 const ds=String(birthYear??2000).padStart(4,'0')+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');
 if(!Number.isInteger(month)||!Number.isInteger(day)||!validDay(ds))throw Error('Valitse olemassa oleva päivä. Helmikuun 29. päivä edellyttää karkausvuotta, jos ilmoitat vuoden.');
 if(birthYear!==null&&ds>today)throw Error('Syntymäpäivä ei voi olla tulevaisuudessa.');
 const group=String(input.group),reminder=String(input.reminder);
 if(!Object.hasOwn(BIRTHDAY_GROUPS,group)||!Object.hasOwn(BIRTHDAY_REMINDERS,reminder))throw Error('Tarkista ryhmä ja muistutus.');
 return {...previous,id:id||previous.id,date:ds,title:name+SUFFIX,time:'',category:group==='family'?'family':group==='work'?'work':'personal',repeat:'yearly',interval:Math.max(1,Math.min(366,Number(previous.interval)||1)),until:validDay(previous.until)?previous.until:null,exdates:Array.isArray(previous.exdates)?previous.exdates.filter(validDay):[],note:String(input.note||'').slice(0,2000),birthday:{version:1,birthYear,group,reminder}};
}
export function nextBirthday(event,today){
 if(!birthdayMeta(event)||!validDay(today))return null;
 const base=Number(event.date.slice(0,4)),interval=Math.max(1,Math.min(366,Number(event.interval)||1)),start=base+Math.ceil((Math.max(Number(today.slice(0,4)),base)-base)/interval)*interval;
 for(let year=start;year<=9999;year+=interval){
  const ds=year+event.date.slice(4);
  if(event.until&&ds>event.until)return null;
  if(ds>=today&&validDay(ds)&&occurs(event,ds))return ds;
 }
 return null;
}
export function birthdayReport(event,today){
 const meta=birthdayMeta(event);if(!meta)return null;
 const next=nextBirthday(event,today),days=next?Math.round((Date.parse(next+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000):null;
 const age=next&&meta.birthYear!==null?Number(next.slice(0,4))-meta.birthYear:null;
 return {event,meta,next,days,age,name:birthdayName(event),milestone:age!==null&&age>0&&age%5===0};
}
const esc=value=>String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,c=>'\\'+c).replace(/\r/g,'');
function fold(line){let result='',bytes=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(bytes+n>75){result+='\r\n ';bytes=1;}result+=c;bytes+=n;}return result;}
export function birthdayICS(events,today,now=new Date()){
 const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365.fi//Syntymapaivat//FI','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Syntymäpäivät'];
 for(const event of events){const r=birthdayReport(event,today);if(!r?.next)continue;
 const end=new Date(Date.parse(r.next+'T00:00:00Z')+86400000).toISOString().slice(0,10);
 lines.push('BEGIN:VEVENT','UID:'+esc(String(event.id).replace(/[\r\n]/g,''))+'@kalenteri365.fi','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+r.next.replaceAll('-',''),'DTEND;VALUE=DATE:'+end.replaceAll('-',''),'RRULE:FREQ=YEARLY;INTERVAL='+Math.max(1,Math.min(366,Number(event.interval)||1))+(event.until&&validDay(event.until)?';UNTIL='+event.until.replaceAll('-',''):''),'SUMMARY:'+esc(event.title),'TRANSP:TRANSPARENT');
 if(event.exdates?.filter(validDay).length)lines.push('EXDATE;VALUE=DATE:'+event.exdates.filter(validDay).map(d=>d.replaceAll('-','')).join(','));
 if(r.meta.reminder!=='none')lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+esc(event.title),'TRIGGER:'+(r.meta.reminder==='0'?'P0D':'-P'+r.meta.reminder+'D'),'END:VALARM');
 lines.push('END:VEVENT');}
 lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
export function birthdayCSV(events){
 const cell=value=>'"'+String(value??'').replace(/^(?=\s*[=+@\-])|^(?=[\t\r\n])/,"'").replaceAll('"','""')+'"';
 return '\uFEFF'+[['Nimi','Päivä','Kuukausi','Syntymävuosi','Ryhmä'],...events.filter(birthdayMeta).map(e=>[birthdayName(e),Number(e.date.slice(8)),Number(e.date.slice(5,7)),birthdayMeta(e).birthYear??'',BIRTHDAY_GROUPS[birthdayMeta(e).group]])].map(row=>row.map(cell).join(';')).join('\r\n')+'\r\n';
}
