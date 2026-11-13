import {fi,parse,iso,add} from './calendar.mjs';
export function normalizeFamily(value){
 const source=value&&typeof value==='object'?value:{},validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(+parse(s))&&iso(parse(s))===s;
 const members=[{id:'shared',name:'Yhteinen',color:'#0046a8'}],ids=new Set(['shared']);
 for(const [i,m]of(Array.isArray(source.members)?source.members:[]).slice(0,12).entries()){
  if(!m||typeof m.name!=='string'||!m.name.trim()||m.id==='shared')continue;
  const id=typeof m.id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(m.id)?m.id:'member-'+i;
  if(ids.has(id)||members.length>=12)continue;ids.add(id);members.push({id,name:m.name.slice(0,40),color:/^#[0-9a-f]{6}$/i.test(m.color)?m.color:'#0046a8'});
 }
 const eventIds=new Set(),events=[];
 for(const [i,e]of(Array.isArray(source.events)?source.events:[]).slice(0,5000).entries()){
  if(!e||!validDate(e.date)||typeof e.title!=='string'||!e.title.trim())continue;
  const id=typeof e.id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(e.id)?e.id:'event-'+i;if(eventIds.has(id))continue;eventIds.add(id);
  events.push({id,date:e.date,person:ids.has(e.person)?e.person:'shared',time:/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(e.time)?e.time:'',title:e.title.slice(0,120)});
 }
 const entries=(v,max)=>Object.fromEntries(Object.entries(v&&typeof v==='object'?v:{}).filter(([k,t])=>validDate(k)&&typeof t==='string').slice(0,5000).map(([k,t])=>[k,t.slice(0,max)]));
 let week=validDate(source.week)?source.week:'2027-01-04';const d=parse(week);week=iso(add(d,-(d.getUTCDay()+6)%7));
 return {version:1,members,events,meals:entries(source.meals,120),shopping:entries(source.shopping,4000),week};
}
export function familyICS(events,members,{name='Perheen viikko'}={}){
 const clean=s=>String(s).replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/[,;]/g,c=>'\\'+c);
 const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z/,'Z');
 const timed=(ds,time)=>{const target=ds+'T'+time,probe=Date.parse(target+':00Z'),matches=[];for(const offset of[2,3]){const value=probe-offset*3600000;if(new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',dateStyle:'short',timeStyle:'short'}).format(new Date(value)).replace(' ','T')===target)matches.push(value);}if(matches.length!==1)throw Error(`${fi(parse(ds))} klo ${time}: aika ${matches.length?'toistuu kellonsiirrossa':'ei ole olemassa kellonsiirrossa'}. Muuta tapahtuman aikaa ennen vientiä.`);return new Date(matches[0]).toISOString().replace(/[-:]/g,'').replace('.000','');};
 const rows=['BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','PRODID:-//Kalenteri365.fi//Perhe//FI','X-WR-CALNAME:'+clean(name),...events.flatMap(e=>['BEGIN:VEVENT','UID:'+e.id+'@kalenteri365.fi','DTSTAMP:'+stamp,...(e.time?['DTSTART:'+timed(e.date,e.time)]:['DTSTART;VALUE=DATE:'+e.date.replaceAll('-',''),'DTEND;VALUE=DATE:'+iso(add(parse(e.date),1)).replaceAll('-','')]),'SUMMARY:'+clean(e.title),'DESCRIPTION:'+clean((members.find(m=>m.id===e.person)?.name||'Yhteinen')+' · Kalenteri365.fi'),'END:VEVENT']),'END:VCALENDAR'];
 return rows.map(row=>{let out='',n=0;for(const c of row){const bytes=new TextEncoder().encode(c).length;if(n+bytes>74){out+='\r\n ';n=1;}out+=c;n+=bytes;}return out;}).join('\r\n')+'\r\n';
}
