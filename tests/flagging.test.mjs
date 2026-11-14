import test from 'node:test';
import assert from 'node:assert/strict';
import {flagDays,filterFlagDays,groupFlagDays,flagWindow,flagCalendar,flagGoogleURL} from '../src/flagging-core.mjs';
import {riseSet} from '../src/astronomy.mjs';
import {CITIES,parse} from '../src/calendar.mjs';

test('2027 published national list distinguishes two occasions on one date',()=>{
 const all=flagDays(2027),fi=filterFlagDays(all);
 assert.equal(new Set(fi.map(e=>e.description)).size,23);assert.equal(fi.length,23);assert.equal(groupFlagDays(fi).length,22);
 assert.equal(fi.filter(e=>e.classification==='official').length,8);
 assert.deepEqual(fi.filter(e=>e.date==='2027-05-09').map(e=>e.slug).sort(),['aitienpaiva','eurooppa-paiva']);
 assert.equal(all.filter(e=>e.scope==='aland').length,3);assert.equal(all.filter(e=>e.scope==='sami').length,12);
});
test('moving dates and verified 2029 election stay year-specific',()=>{
 const expected={2027:['05-09','06-26','11-14','03-14'],2028:['05-14','06-24','11-12','03-26'],2029:['05-13','06-23','11-11','03-18'],2030:['05-12','06-22','11-10','03-24']};
 for(const [y,dates] of Object.entries(expected)){
  const rows=flagDays(+y);
  ['aitienpaiva','juhannuspaiva','isanpaiva','sami-ilmestyspaiva'].forEach((id,i)=>assert.equal(rows.find(e=>e.id===id).date,`${y}-${dates[i]}`));
  assert.equal(rows.filter(e=>e.id==='eduskuntavaalit').length,+y===2027?1:0);
 }
 assert.equal(flagDays(2029).find(e=>e.id==='alue-ja-kuntavaalit').date,'2029-04-15');
 assert.equal(filterFlagDays(flagDays(2030)).length,22);assert.equal(groupFlagDays(filterFlagDays(flagDays(2030))).length,21);
 assert.throws(()=>flagDays(2026));
});
test('filters support accents, multiword queries, month, class and separate flags',()=>{
 const rows=flagDays(2027);
 assert.equal(filterFlagDays(rows,{query:'aitien paiva'}).length,1);
 assert.equal(filterFlagDays(rows,{query:'J. L. Runebergin'}).length,1);
 assert.equal(filterFlagDays(rows,{month:'5',classification:'official'}).length,2);
 assert.equal(filterFlagDays(rows,{scope:'aland'}).length,3);
 assert.equal(filterFlagDays(rows,{query:'sellaista ei ole'}).length,0);
});
test('flag times cover midsummer eve, overnight interval and polar cases',()=>{
 const rows=flagDays(2027);
 for(const ds of ['2027-06-25','2027-06-26'])assert.deepEqual(flagWindow(ds,rows).startDate,'2027-06-25');
 assert.equal(flagWindow('2027-06-25',rows).endDate,'2027-06-26');
 assert.equal(flagWindow('2027-06-26',rows).end,'21.00');
 assert.equal(flagWindow('2027-12-06',rows).end,'20.00');
 assert.equal(flagWindow('2027-12-08',rows,{polar:'down'}).end,'16.00');
 assert.equal(flagWindow('2027-07-06',rows,{polar:'up'}).end,'21.00');
 assert.equal(flagWindow('2027-05-17',rows,{rise:'2027-05-17T00:00:00Z',set:null}).end,'21.00');
 assert.equal(flagWindow('2027-05-01',rows,{set:'2027-05-01T20:00:00Z'}).end,'21.00');
 assert.equal(flagWindow('2027-02-05',rows).end,null);
 assert.throws(()=>flagWindow('2027-02-30',rows));
});
test('election exception only extends flagging when polls close after sunset',()=>{
 const rows=flagDays(2027),west=riseSet(CITIES.find(c=>c[0]==='helsinki'),parse('2027-04-18')),east=riseSet(CITIES.find(c=>c[0]==='joensuu'),parse('2027-04-18'));
 assert.equal(flagWindow('2027-04-18',rows,west).rule,'ordinary');
 assert.equal(flagWindow('2027-04-18',rows,{set:'2027-04-18T16:30:00Z'}).end,'20.00');
 assert.notEqual(flagWindow('2027-04-18',rows,west).end,'20.00');
 assert.ok(east.set);assert.equal(flagWindow('2027-04-18',rows,{polar:'down'}).rule,'election');
});
test('calendar exports contain only selected flag records, stable UIDs and Helsinki alarms',()=>{
 const rows=filterFlagDays(flagDays(2027),{month:'5'}),ics=flagCalendar(rows,'1',new Date('2026-11-14T00:00:00Z'));
 assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,rows.length);
 assert.ok(ics.includes('UID:2027-05-09-aitienpaiva@kalenteri365.fi'));
 assert.ok(ics.includes('DTSTART;VALUE=DATE:20270509\r\nDTEND;VALUE=DATE:20270510'));
 assert.ok(ics.includes('TRIGGER;VALUE=DATE-TIME:20270508T060000Z'));
 assert.ok(!ics.includes('joulupaiva'));assert.ok(!flagCalendar(rows).includes('BEGIN:VALARM'));
 assert.ok(ics.endsWith('\r\n'));for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75,line);
 assert.throws(()=>flagCalendar([]));assert.throws(()=>flagCalendar(rows,'bogus'));
 const link=new URL(flagGoogleURL(rows.find(e=>e.slug==='aitienpaiva')));assert.equal(link.searchParams.get('dates'),'20270509/20270510');assert.equal(link.searchParams.get('text'),'Äitienpäivä');
});
