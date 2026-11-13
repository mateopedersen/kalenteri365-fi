import {civilDate} from './date-math.mjs';
import {add,iso,holidays,week} from './calendar.mjs';

export function calculateWorkdays(options){
  const start=civilDate(options.start),end=civilDate(options.end);
  if(end<start)throw Error('Loppupäivä on ennen alkupäivää.');
  if(start.getUTCFullYear()<2026||end.getUTCFullYear()>2030)throw Error('Suomen pyhäpäivät huomioiva laskenta tukee vuosia 2026–2030.');
  const weekdays=[...new Set(options.weekdays??[1,2,3,4,5])];
  if(!weekdays.length||weekdays.some(n=>!Number.isInteger(n)||n<0||n>6))throw Error('Valitse vähintään yksi työviikon päivä.');
  const hours=Number(options.hours??7.5);
  if(!Number.isFinite(hours)||hours<=0||hours>24)throw Error('Anna päivän työtunnit väliltä 0–24, nollaa suurempana.');
  const excluded=new Set();
  for(const period of options.exclusions??[]){
    const a=civilDate(period.start),b=civilDate(period.end);
    if(b<a)throw Error('Poissaolon loppupäivä on ennen alkupäivää.');
    for(let d=new Date(Math.max(+a,+start));d<=end&&d<=b;d=add(d,1))excluded.add(iso(d));
  }
  const holidayMap=new Map();
  for(let y=start.getUTCFullYear();y<=end.getUTCFullYear();y++)for(const h of holidays(y)){
    if(!holidayMap.has(h.date))holidayMap.set(h.date,[]);holidayMap.get(h.date).push(h);
  }
  const result={days:[],months:[],calendarDays:0,scheduled:0,weekRest:0,publicHolidays:0,eves:0,absences:0,workDays:0,hours:0,dailyHours:hours};
  const months=new Map();
  for(let d=start;d<=end;d=add(d,1)){
    if((iso(d)===options.start&&options.includeStart===false)||(iso(d)===options.end&&options.includeEnd===false))continue;
    const ds=iso(d),events=holidayMap.get(ds)||[];let reason='work';
    if(!weekdays.includes(d.getUTCDay()))reason='weekRest';
    else if(options.holidays!==false&&events.some(h=>h.type==='holiday'))reason='publicHolidays';
    else if(options.eves&&events.some(h=>h.type==='eve'))reason='eves';
    else if(excluded.has(ds))reason='absences';
    const record={date:ds,reason,hours:reason==='work'?hours:0,events:events.filter(h=>['holiday','eve'].includes(h.type)).map(h=>({name:h.name,slug:h.slug})),week:week(d)};
    result.days.push(record);result.calendarDays++;
    if(reason!=='weekRest')result.scheduled++;
    if(reason==='work')result.workDays++;else result[reason]++;
    const month=ds.slice(0,7);if(!months.has(month))months.set(month,{month,workDays:0,hours:0,excluded:0});const m=months.get(month);
    if(reason==='work')m.workDays++;else m.excluded++;
  }
  result.hours=Math.round(result.workDays*hours*100)/100;
  result.months=[...months.values()].map(m=>({...m,hours:Math.round(m.workDays*hours*100)/100}));
  return result;
}
export const WORKDAY_REASONS={work:'Työpäivä',weekRest:'Viikkovapaa',publicHolidays:'Pyhäpäivä',eves:'Vapaa aatto',absences:'Oma poissaolo'};
export function workdayCSV(result){
  const quote=s=>'"'+String(s).replace(/"/g,'""')+'"';
  return '\ufeff'+[['Päivämäärä','Tyyppi','Työtunnit','Kalenterimerkintä'],...result.days.map(d=>[d.date,WORKDAY_REASONS[d.reason],String(d.hours).replace('.',','),d.events.map(h=>h.name).join(', ')])].map(row=>row.map(quote).join(';')).join('\r\n');
}
