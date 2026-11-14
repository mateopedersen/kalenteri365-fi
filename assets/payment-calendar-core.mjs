import {paymentEvents} from './payment-data.mjs';
import {civil,nextPayment} from './community-core.mjs';
import {serviceCalendar,serviceGoogleURL} from './finland-services-core.mjs';
import {REMINDERS} from './calendar-event-core.mjs';
export {REMINDERS};
export function createPaymentCore(plans){
const validPlan=p=>{const plan=plans.find(x=>x.id===p?.id);if(!plan)throw Error('Valitse maksukalenteri.');return plan;};
function paymentDates(plan,{today,month='all',scope='all'}={}){
 plan=validPlan(plan);civil(today);if(!['all','future'].includes(scope)||!(month==='all'||/^([1-9]|1[0-2])$/.test(String(month))))throw Error('Tarkista kalenterin rajaus.');
 return plan.dates.filter(d=>(scope==='all'||d>=today)&&(month==='all'||Number(d.slice(5,7))===Number(month)));
}
function pensionReport(plan,today){plan=validPlan(plan);civil(today);const next=nextPayment(plan,today),year=Number(plan.dates[0].slice(0,4));return{next,year,remaining:plan.dates.filter(d=>d>=today).length,days:next?Math.round((+civil(next)-civil(today))/86400000):null,beforeYear:Number(today.slice(0,4))<year,ended:!next};}
function paymentPath(plan,reminder='none',date){plan=validPlan(plan);if(!REMINDERS.some(([v])=>v===String(reminder)))throw Error('Tarkista muistutus.');if(date&&!plan.dates.includes(date))throw Error('Maksupäivää ei ole julkaistussa kalenterissa.');return '/kalenterit/maksut-'+plan.id+(date?'-'+date+'-'+reminder:reminder==='none'?'':'-'+reminder)+'.ics';}
function fold(line){let out='',bytes=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(bytes+n>75){out+='\r\n ';bytes=1;}out+=c;bytes+=n;}return out;}
const escape=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,c=>'\\'+c);
function pensionICS(plan,{dates=plan.dates,reminder='none'}={}){
 plan=validPlan(plan);paymentPath(plan,reminder);if(dates.some(d=>!plan.dates.includes(d)))throw Error('Vienti sisältää vahvistamattoman päivän.');
 const selected=new Set(dates),events=paymentEvents(plan).filter(e=>selected.has(e.date));
 const bodies=events.map(e=>serviceCalendar(e,reminder,new Date(plan.checked+'T00:00:00Z')).match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/)[0].replace(/\r\n[ \t]/g,''));
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365.fi//Maksupaivat//FI','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+escape(plan.institution+' · '+plan.name),'REFRESH-INTERVAL;VALUE=DURATION:P1D','X-PUBLISHED-TTL:P1D',...bodies.flatMap(b=>b.split('\r\n')),'END:VCALENDAR',''].map(fold).join('\r\n');
}
function paymentGoogleURL(plan,date){plan=validPlan(plan);if(!plan.dates.includes(date))throw Error('Tarkista maksupäivä.');return serviceGoogleURL(paymentEvents(plan).find(e=>e.date===date));}
function paymentCSV(plan,dates=plan.dates){plan=validPlan(plan);if(dates.some(d=>!plan.dates.includes(d)))throw Error('Tarkista maksupäivät.');const cell=s=>'"'+String(s).replaceAll('"','""')+'"';return '\uFEFF'+[['Maksaja',plan.kind==='benefit'?'Etuus':'Eläkelaji','Maksupäivä'],...dates.map(d=>[plan.institution,plan.name,d])].map(row=>row.map(cell).join(';')).join('\r\n')+'\r\n';}
function localPaymentEvents(plan,dates){plan=validPlan(plan);if(dates.some(d=>!plan.dates.includes(d)))throw Error('Tarkista maksupäivät.');return paymentEvents(plan).filter(e=>dates.includes(e.date)).map(e=>({id:e.id+'-'+e.date,date:e.date,title:e.name,time:'',category:'personal',note:e.applies+'\n'+e.source,repeat:'none',interval:1,until:'',exdates:[]}));}

return {paymentDates,pensionReport,paymentPath,pensionICS,paymentCSV,paymentGoogleURL,localPaymentEvents};
}
