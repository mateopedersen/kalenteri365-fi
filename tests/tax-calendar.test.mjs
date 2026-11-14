import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateTaxDue,nextTaxWorkday,filterTaxEvents,taxCalendarFile,taxCSV,validateTaxReminder} from '../assets/tax-calendar-core.mjs';
import {holidays} from '../src/calendar.mjs';
import {TAX_EVENTS} from '../src/services-view.mjs';
import {taxPageView} from '../src/tax-view.mjs';
test('VAT and employer calculations use distinct month and quarter rules',()=>{
 assert.equal(calculateTaxDue({year:2027,index:1}).date,'2027-03-12');
 assert.equal(calculateTaxDue({kind:'employer',year:2027,index:1}).date,'2027-02-12');
 assert.equal(calculateTaxDue({period:'quarterly',year:2027,index:1}).date,'2027-05-12');
 assert.equal(calculateTaxDue({kind:'employer',period:'quarterly',year:2027,index:1}).date,'2027-05-12');
 assert.equal(calculateTaxDue({year:2027,index:12}).date,'2028-02-14');
 assert.equal(calculateTaxDue({kind:'employer',year:2027,index:12}).date,'2028-01-12');
});
test('annual VAT handles leap February and moves weekend dates forward',()=>{
 assert.equal(calculateTaxDue({period:'annual',year:2026}).date,'2027-03-01');
 assert.equal(calculateTaxDue({period:'annual',year:2027}).date,'2028-02-29');
 assert.equal(calculateTaxDue({period:'annual',year:2028}).date,'2029-02-28');
 assert.equal(calculateTaxDue({year:2026,index:10}).original,'2026-12-12');
 assert.equal(calculateTaxDue({year:2026,index:10}).date,'2026-12-14');
});
test('all supported calculated dates are weekdays with at most four days shift',()=>{
 for(let year=2026;year<=2030;year++)for(const kind of ['vat','employer'])for(const period of ['monthly','quarterly','annual']){
  if(kind==='employer'&&period==='annual')continue;
  for(let index=1;index<=(period==='monthly'?12:period==='quarterly'?4:1);index++){
   const r=calculateTaxDue({kind,period,year,index}),date=new Date(r.date),original=new Date(r.original);assert(![0,6].includes(date.getUTCDay()));assert(!holidays(date.getUTCFullYear()).some(h=>h.type==='holiday'&&h.date===r.date));const shift=(date-original)/86400000;assert(shift>=0&&shift<=4);assert.equal(r.shifted,shift!==0);assert(r.qualifier.includes('laskettu'));assert(r.source.startsWith('https://www.vero.fi/'));
  }
 }
});
test('unsupported rules and invalid periods are rejected',()=>{
 for(const value of [{year:2031},{year:2025},{kind:'income'},{period:'annual',kind:'employer'},{period:'monthly',index:13},{period:'quarterly',index:5},{period:'annual',index:2},{index:0},{index:1.5}])assert.throws(()=>calculateTaxDue(value));
});
test('filters distinguish due year from source period and keep personal carryovers scoped',()=>{
 const carry=filterTaxEvents(TAX_EVENTS,{year:'2027',topic:'all'});assert.equal(carry.length,2);assert(carry.every(e=>e.type==='residual'&&e.period==='Verovuosi 2025'));
 const vat=filterTaxEvents(TAX_EVENTS,{audience:'business',year:'2027',topic:'vat'});assert.equal(vat.length,2);assert(vat.every(e=>e.period.startsWith('Verokausi 2026')));
 const results=filterTaxEvents(TAX_EVENTS,{year:'2026',month:'12',scope:'future',query:'veronpalautus'},'2026-11-14');assert.equal(results.length,1);assert.equal(results[0].date,'2026-12-03');
 assert.equal(filterTaxEvents(TAX_EVENTS,{year:'2030'}).length,0);
});
test('bulk ICS contains every event once with individual alarms and unique UIDs',()=>{
 const list=filterTaxEvents(TAX_EVENTS,{year:'2027'}),text=taxCalendarFile(list,'7',new Date('2026-11-14T00:00Z'));
 assert.equal((text.match(/BEGIN:VCALENDAR/g)||[]).length,1);assert.equal((text.match(/END:VCALENDAR/g)||[]).length,1);assert.equal((text.match(/BEGIN:VEVENT/g)||[]).length,2);assert.equal((text.match(/BEGIN:VALARM/g)||[]).length,2);assert.equal(new Set(text.match(/UID:[^\r]+/g)).size,2);assert(text.includes('DTSTART;VALUE=DATE:20270104'));assert(text.includes('DTEND;VALUE=DATE:20270105'));assert.equal((taxCalendarFile(list,'none').match(/BEGIN:VALARM/g)||[]).length,0);assert.throws(()=>taxCalendarFile([]));
});
test('own dates are real, bounded and named; CSV escapes cells',()=>{
 assert.deepEqual(validateTaxReminder({name:' Oma vero ',date:'2028-02-29',reminder:'7'}),{name:'Oma vero',date:'2028-02-29',reminder:'7'});
 for(const x of [{name:' ',date:'2027-01-01'},{name:'Vero',date:'2027-02-29'},{name:'Vero',date:'2019-01-01'},{name:'Vero',date:'2027-01-01',reminder:'500'}])assert.throws(()=>validateTaxReminder(x));
 assert(taxCSV([{name:'Oma "vero"',date:'2027-01-04'}]).includes('"Oma ""vero"""'));
});
test('server-rendered page has source-linked guides, actual dates and one H1',()=>{
 const html=taxPageView(TAX_EVENTS);assert.equal((html.match(/<h1>/g)||[]).length,1);for(const s of ['id="veropaivat"','id="veron-erapaivalaskuri"','id="omat-veropaivat"','Verovuosi','Verohallinnon','Google Kalenteri','/paivamaaralaskuri/'])assert(html.includes(s));assert(!html.includes('KDV'));assert(!html.includes('henkilötunnus<input'));
});

test('working-day roll skips the full Easter closure and crosses year-end safely',()=>{assert.equal(nextTaxWorkday('2027-03-26'),'2027-03-30');assert.equal(nextTaxWorkday('2030-04-19'),'2030-04-23');assert.equal(nextTaxWorkday('2026-12-31'),'2026-12-31');assert.equal(nextTaxWorkday('2027-01-01'),'2027-01-04');});
