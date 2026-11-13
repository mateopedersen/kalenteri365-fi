import {holidays,iso,add,date,week} from './calendar.mjs';
export function civilDate(value){const d=new Date(value+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(+d)||iso(d)!==value||d.getUTCFullYear()<1900||d.getUTCFullYear()>2100)throw Error('Valitse kelvollinen päivämäärä vuosilta 1900–2100.');return d;}
const holidayCache=new Map();
function flags(d){const y=d.getUTCFullYear();if(!holidayCache.has(y))holidayCache.set(y,holidays(y));return holidayCache.get(y).filter(h=>h.date===iso(d));}
export function workingDate(d,{sixDays=false,eves=false}={}){
 const y=d.getUTCFullYear();if(y<2026||y>2030)throw Error('Suomen pyhäpäiviä käyttävä laskenta tukee vuosia 2026–2030.');
 const dow=d.getUTCDay();if(dow===0||(!sixDays&&dow===6))return false;
 return !flags(d).some(h=>h.type==='holiday'||(eves&&h.type==='eve'));
}
export function countInterval({start,end,includeStart=false,includeEnd=true,sixDays=false,eves=false}){
 const a=civilDate(start),b=civilDate(end),difference=Math.round((b-a)/86400000);
 if(difference<0)throw Error('Loppupäivä on ennen alkupäivää. Vaihda päivämäärien järjestys.');
 if(difference>36600)throw Error('Valitse enintään 100 vuoden ajanjakso.');
 const calendarDays=Math.max(0,difference===0?(includeStart&&includeEnd?1:0):difference-1+Number(includeStart)+Number(includeEnd));
 const supported=a.getUTCFullYear()>=2026&&b.getUTCFullYear()<=2030;
 let workDays=0,weekends=0,publicHolidays=0,freeEves=0;
 if(supported)for(let d=add(a,includeStart?0:1);d<=add(b,includeEnd?0:-1);d=add(d,1)){
  if(d.getUTCDay()===0||(!sixDays&&d.getUTCDay()===6)){weekends++;continue;}
  const hs=flags(d);if(hs.some(h=>h.type==='holiday')){publicHolidays++;continue;}
  if(eves&&hs.some(h=>h.type==='eve')){freeEves++;continue;}workDays++;
 }
 return {start,end,difference,calendarDays,weeks:Math.floor(calendarDays/7),remainingDays:calendarDays%7,workDays:supported?workDays:null,weekends:supported?weekends:null,publicHolidays:supported?publicHolidays:null,freeEves:supported?freeEves:null,startWeek:week(a),endWeek:week(b)};
}
export function shiftDate({start,amount,unit='days',sixDays=false,eves=false}){
 const a=civilDate(start),n=Number(amount);if(!Number.isInteger(n)||Math.abs(n)>36600)throw Error('Anna kokonaisluku väliltä −36600 ja 36600.');
 if(!['days','weeks','months','years','working'].includes(unit))throw Error('Valitse laskennan yksikkö.');
 let result,clamped=false;
 if(unit==='working'){
  workingDate(a,{sixDays,eves});result=a;let left=Math.abs(n);const step=Math.sign(n);
  while(left){result=add(result,step);if(workingDate(result,{sixDays,eves}))left--;}
 }else if(unit==='days'||unit==='weeks')result=add(a,n*(unit==='weeks'?7:1));
 else{const y=a.getUTCFullYear()+(unit==='years'?n:0),m=a.getUTCMonth()+(unit==='months'?n:0);const last=new Date(Date.UTC(y,m+1,0)).getUTCDate(),day=Math.min(a.getUTCDate(),last);clamped=day!==a.getUTCDate();result=new Date(Date.UTC(y,m,day));}
 const output=iso(result);civilDate(output);return {date:output,clamped,week:week(result),weekday:result.getUTCDay(),elapsedDays:Math.round((result-a)/86400000)};
}
