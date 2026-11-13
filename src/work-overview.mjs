import {calculateWorkdays} from './workday-math.mjs';
import {YEARS,MONTHS,SLUGS,cap,date,iso,daysInMonth,holidays} from './calendar.mjs';
export function overviewSettings(input={}){
 const year=Number(input.year??2027),hours=Number(input.hours??7.5);
 if(!YEARS.includes(year))throw Error('Valitse vuosi 2027–2030.');
 if(!Number.isFinite(hours)||hours<0.01||hours>24)throw Error('Anna päivän työtunnit väliltä 0,01–24.');
 if(Math.abs(hours*100-Math.round(hours*100))>1e-7)throw Error('Käytä tuntimäärässä enintään kahta desimaalia.');
 return {year,hours,eves:input.eves===true,sixDays:input.sixDays===true};
}
export function yearOverview(input={}){
 const settings=overviewSettings(input),{year,hours,eves,sixDays}=settings;
 const options={hours,eves,weekdays:sixDays?[1,2,3,4,5,6]:[1,2,3,4,5]};
 const all=calculateWorkdays({start:year+'-01-01',end:year+'-12-31',...options});
 const months=MONTHS.map((name,i)=>{
  const n=i+1,result=calculateWorkdays({start:iso(date(year,n,1)),end:iso(date(year,n,daysInMonth(year,n))),...options});
  return {month:n,name:cap(name),slug:SLUGS[i],days:result.calendarDays,scheduled:result.scheduled,weekRest:result.weekRest,holidays:result.publicHolidays,eves:result.eves,workdays:result.workDays,hours:result.hours};
 });
 const events=holidays(year).filter(h=>['holiday','eve'].includes(h.type)).map(h=>{
  const r=all.days.find(d=>d.date===h.date);return {...h,deducted:r.reason==='publicHolidays'||r.reason==='eves',reason:r.reason};
 });
 return {settings,...all,months,events};
}
export function overviewComparison(settings){return YEARS.map(year=>yearOverview({...settings,year}));}
export function overviewCSV(report,month=0){
 const quote=s=>'"'+String(s).replace(/"/g,'""')+'"';
 const label=report.settings.sixDays?'Ma–la':'Ma–pe';
 return '\ufeff'+[
 ['Vuosi','Kuukausi','Kalenteripäiviä',label+'-päiviä','Vähennettyjä pyhiä','Vähennettyjä aattoja','Työpäiviä','Tuntia päivässä','Työtunteja'],
 ...report.months.filter(m=>!month||m.month===month).map(m=>[report.settings.year,m.name,m.days,m.scheduled,m.holidays,m.eves,m.workdays,String(report.dailyHours).replace('.',','),String(m.hours).replace('.',',')]),
 ['Laskentaperuste',label+'; Suomen nimetyt pyhäpäivät vähennetty; aatot '+(report.settings.eves?'vapaita':'mukana työpäivissä')],
 ['Lähde','Kalenteri365.fi; https://almanakka.helsinki.fi/ajankohtaista/arkivapaat-2027']
 ].map(row=>row.map(quote).join(';')).join('\r\n');
}
