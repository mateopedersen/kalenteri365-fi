import test from 'node:test';
import assert from 'node:assert/strict';
import {weekReport,weekDate,ordinalReport,ordinalDate,leapReport,signForDate,todayFinland,validDate,ZODIAC_SIGNS} from '../src/calendar-lab-core.mjs';
import {calendarLabPage} from '../src/calendar-lab-view.mjs';
import {PROFILES} from '../lib/horoscope.mjs';
test('ISO year boundaries and reverse week lookup retain the correct week-year',()=>{
 const r=weekReport('2027-01-01');assert.equal(r.year,2026);assert.equal(r.number,53);assert.equal(r.start,'2026-12-28');assert.equal(r.end,'2027-01-03');assert.equal(r.days[4],'2027-01-01');
 assert.equal(weekReport('2029-12-31').year,2030);assert.equal(weekReport('2029-12-31').number,1);
 assert.equal(weekDate(2027,1),'2027-01-04');assert.equal(weekDate(2026,53),'2026-12-28');assert.throws(()=>weekDate(2027,53));
});
test('ordinal days include the selected day; remaining days exclude it',()=>{
 assert.equal(ordinalReport('2027-01-01').number,1);assert.equal(ordinalReport('2027-12-31').remaining,0);assert.equal(ordinalReport('2027-12-31').percent,100);
 assert.equal(ordinalReport('2028-02-29').number,60);assert.equal(ordinalReport('2028-03-01').number,61);assert.equal(ordinalReport('2027-03-01').number,60);
 assert.equal(ordinalDate(2028,366),'2028-12-31');assert.equal(ordinalDate(2028,60),'2028-02-29');assert.throws(()=>ordinalDate(2027,366));
});
test('leap rules handle century exceptions and four-hundred-year restoration',()=>{
 for(const [year,expected]of[[1900,false],[2000,true],[2027,false],[2028,true],[2100,false],[2400,true]])assert.equal(leapReport(year).leap,expected);
 assert.equal(leapReport(2099).next,2104);assert.equal(leapReport(2101).previous,2096);
 assert.equal(leapReport(9999).comparison.includes(10000),false);assert.equal(leapReport(1583).comparison.includes(1582),false);
 assert.throws(()=>leapReport(2027.5));assert.throws(()=>leapReport(10000));
});
test('all conventional zodiac date boundaries resolve to the correct sign',()=>{
 const cases={'2000-01-19':'kauris','2000-01-20':'vesimies','2000-02-18':'vesimies','2000-02-19':'kalat','2000-02-29':'kalat','2000-03-20':'kalat','2000-03-21':'oinas','2000-04-19':'oinas','2000-04-20':'harka','2000-05-20':'harka','2000-05-21':'kaksoset','2000-06-20':'kaksoset','2000-06-21':'rapu','2000-07-22':'rapu','2000-07-23':'leijona','2000-08-22':'leijona','2000-08-23':'neitsyt','2000-09-22':'neitsyt','2000-09-23':'vaaka','2000-10-22':'vaaka','2000-10-23':'skorpioni','2000-11-21':'skorpioni','2000-11-22':'jousimies','2000-12-21':'jousimies','2000-12-22':'kauris'};
 for(const [value,slug]of Object.entries(cases))assert.equal(signForDate(value).slug,slug,value);
 assert.equal(PROFILES,ZODIAC_SIGNS);
});
test('invalid civil dates and out-of-range input cannot be normalized silently',()=>{
 for(const value of['2027-02-29','2027-04-31','2027-13-01','1899-01-01','2101-01-01','abc'])assert.throws(()=>validDate(value));
 assert.equal(todayFinland(new Date('2026-11-14T23:00:00Z')),'2026-11-15');
});
test('every day across a leap cycle round-trips through the ordinal tool',()=>{
 for(let year=2027;year<=2030;year++){const length=leapReport(year).days;for(let n=1;n<=length;n++){const value=ordinalDate(year,n);assert.equal(ordinalReport(value).number,n);assert.equal(signForDate(value).name.length>0,true);}}
});
test('four standalone workspaces have labeled forms and distinct visual results',()=>{
 for(const kind of['viikkonumerot','vuoden-paiva','karkausvuosi','horoskooppimerkki']){const html=calendarLabPage(kind);assert.ok(html.includes(`data-calendar-lab="${kind}"`));assert.ok(html.includes('id="lab-form"'));assert.ok(html.includes('id="lab-result"'));assert.ok(html.includes('role="status"'));assert.ok(html.includes('lab-guide'));}
});
