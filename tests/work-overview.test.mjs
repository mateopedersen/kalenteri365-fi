import test from 'node:test';
import assert from 'node:assert/strict';
import {yearOverview,overviewComparison,overviewCSV,overviewSettings} from '../src/work-overview.mjs';
import {workStats} from '../src/calendar.mjs';
import {overviewURL,workOverviewPage} from '../src/work-overview-view.mjs';
test('The four years reconcile monthly totals with the existing Finnish workday calendar',()=>{
 for(const year of [2027,2028,2029,2030])for(const eves of [false,true]){
  const r=yearOverview({year,eves});
  assert.equal(r.months.reduce((n,m)=>n+m.workdays,0),r.workDays);
  assert.equal(r.months.reduce((n,m)=>n+m.holidays,0),r.publicHolidays);
  assert.equal(r.workDays+r.publicHolidays+r.eves+r.weekRest,r.calendarDays);
  for(const m of r.months)assert.equal(m.workdays,workStats(year,m.month,eves).workdays);
 }
});
test('Official Almanac Office free-weekday totals include only eves that fall in the selected week',()=>{
 for(const [year,total] of [[2027,8],[2028,9],[2029,10],[2030,10]]){
  const r=yearOverview({year,eves:true});assert.equal(r.publicHolidays+r.eves,total);
 }
 const y=yearOverview({year:2028,eves:true});assert.equal(y.eves,1);const christmasEve=y.events.find(h=>h.slug==='jouluaatto');assert.equal(christmasEve.reason,'weekRest');assert.equal(christmasEve.deducted,false);
 const r=yearOverview({year:2027});assert.equal(r.workDays,255);assert.equal(r.hours,1912.5);assert.equal(yearOverview({year:2027,eves:true}).hours,1897.5);
});
test('Saturday work and hour selection flow consistently through comparisons and exports',()=>{
 const weekdays=yearOverview({year:2027}),six=yearOverview({year:2027,sixDays:true,hours:8,eves:true});
 assert(six.workDays>weekdays.workDays);assert(six.publicHolidays>weekdays.publicHolidays);
 assert.equal(six.hours,six.workDays*8);assert.equal(overviewComparison(six.settings).length,4);
 const csv=overviewCSV(six);assert(csv.startsWith('\ufeff'));assert(csv.includes('Ma–la'));assert(csv.includes('Kalenteri365.fi'));assert.equal(csv.split('\r\n').length,15);
 assert.equal(overviewCSV(six,2).split('\r\n').length,4);
 assert.throws(()=>overviewSettings({year:2026}));assert.throws(()=>overviewSettings({hours:NaN}));assert.throws(()=>overviewSettings({hours:7.555}));
 for(const hours of[0.01,7.33,24]){const r=yearOverview({year:2028,hours});assert.equal(Math.round(r.months.reduce((sum,m)=>sum+m.hours,0)*100),Math.round(r.hours*100));}
 assert.equal(overviewURL(2028,2,{hours:8,eves:true,sixDays:true}),'/tyopaivat/2028/helmikuu/?hours=8&eves=1&week=6');
 const html=workOverviewPage({year:2028,month:2,scope:'month'});assert(html.includes('Helmikuu 2028'));assert(html.includes('data-overview-month="2"'));assert(!html.includes('undefined'));
});
