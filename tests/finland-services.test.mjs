import test from 'node:test';
import assert from 'node:assert/strict';
import {ADMISSION_ROUTES,PERSONAL_TAX_DATES,REGIONAL_FLAGS_2027,ELECTION_EVENTS,EXAM_RESULT_EVENTS} from '../assets/finland-services-data.mjs';
import {serviceCalendar,serviceGoogleURL,helsinkiInstant,flagHours,daylightDifference} from '../assets/finland-services-core.mjs';
import {TAX_EVENTS,businessTaxDates,ALL_SERVICE_EVENTS} from '../src/services-view.mjs';
import {swedishCounterpart,SV_NAMES} from '../src/swedish.mjs';
test('official 2027 admissions preserve school-start year and bounded result dates',()=>{
 assert.equal(ADMISSION_ROUTES.length,4);
 const autumn=ADMISSION_ROUTES.find(r=>r.id==='higher-autumn');assert.equal(autumn.applicationYear,2027);assert.equal(autumn.start,'Tammikuu 2028');
 assert.equal(autumn.steps.find(s=>s.id==='closes').date,'2027-09-09');
 assert.equal(ADMISSION_ROUTES.find(r=>r.id==='secondary').steps.find(s=>s.id==='results').qualifier,'Aikaisintaan');
 assert.equal(ADMISSION_ROUTES.find(r=>r.id==='higher-second').steps.find(s=>s.id==='certificate').date,'2027-05-28');
});
test('tax applicability is retained and future personal-tax dates only carry over from 2026',()=>{
 assert.ok(PERSONAL_TAX_DATES.every(e=>e.applies&&e.source&&e.checked));
 const carry=PERSONAL_TAX_DATES.filter(e=>e.date.startsWith('2027'));assert.equal(carry.length,2);assert.ok(carry.every(e=>e.type==='residual'&&e.period==='Verovuosi 2025'));
 assert.equal(PERSONAL_TAX_DATES.find(e=>e.id==='advance-5').date,'2026-05-25');
 assert.equal(PERSONAL_TAX_DATES.find(e=>e.id==='advance-9').date,'2026-09-22');
 const business=businessTaxDates();assert.equal(business.find(e=>e.id==='vat-2026-10').date,'2026-12-14');assert.equal(business.find(e=>e.id==='employer-2026-05').date,'2026-06-12');
 assert.ok(TAX_EVENTS.every(e=>e.applies));
});
test('all source-bound service events generate unique importable calendars',()=>{
 assert.equal(new Set(ALL_SERVICE_EVENTS.map(e=>e.id)).size,ALL_SERVICE_EVENTS.length);
 for(const e of ALL_SERVICE_EVENTS){const s=serviceCalendar(e,'7',new Date('2026-11-13T00:00Z'));assert.ok(s.includes('BEGIN:VEVENT'));assert.ok(s.replace(/\r\n /g,'').includes('URL:'+e.source));assert.ok(s.includes('BEGIN:VALARM'));assert.ok(new URL(serviceGoogleURL(e)).searchParams.get('dates'));}
 const s=serviceCalendar(ELECTION_EVENTS[0]);assert.match(s,/DTSTART;VALUE=DATE:20270407/);assert.match(s,/DTEND;VALUE=DATE:20270414/);
 const timed=serviceCalendar({id:'deadline',date:'2027-07-13',time:'15:00',name:'Paikan vastaanotto',source:'https://opintopolku.fi/'});assert.match(timed,/DTSTART:20270713T120000Z/);
 assert.match(serviceCalendar(EXAM_RESULT_EVENTS[0]),/STATUS:TENTATIVE/);
 assert.equal(helsinkiInstant('2027-01-21','15:00').toISOString(),'2027-01-21T13:00:00.000Z');
});
test('flag hours handle summer, independence, election, polar night and midsummer separately',()=>{
 assert.equal(flagHours('2027-06-26',{midsummer:true}).end,'21.00');assert.equal(flagHours('2027-06-26',{midsummer:true}).start,'18.00 edellisenä päivänä');
 assert.equal(flagHours('2027-12-06').end,'20.00');assert.equal(flagHours('2027-04-18',{election:true}).end,'20.00');
 assert.equal(flagHours('2027-02-06',{polar:'down'}).end,'16.00');assert.equal(flagHours('2027-07-06',{polar:'up'}).end,'21.00');
 assert.equal(flagHours('2027-05-09',{sunset:'2027-05-09T19:00:00Z'}).end,'21.00');assert.equal(REGIONAL_FLAGS_2027.length,15);
 assert.equal(REGIONAL_FLAGS_2027.find(e=>e.name==='Marian ilmestyspäivä').date,'2027-03-14');
});
test('Swedish core points to Finland and correct language alternatives',()=>{
 assert.equal(swedishCounterpart('/kalenteri/2028/'),'/sv/kalender/2028/');assert.equal(swedishCounterpart('/juhlapyhat/2030/'),'/sv/helgdagar/2030/');assert.equal(SV_NAMES.itsenaisyyspaiva,'Självständighetsdagen');assert.equal(daylightDifference(601,600),1);
});
