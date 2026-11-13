import test from 'node:test';
import assert from 'node:assert/strict';
import {holidays,YEARS} from '../src/calendar.mjs';
import {REMINDERS,reminderInstant,eventCalendar,eventDownloadPath,googleCalendarURL} from '../assets/calendar-event-core.mjs';
const utcDate=s=>new Date(s+'T00:00:00Z');
const unfold=s=>s.replace(/\r\n /g,'');
const key=s=>s.replaceAll('-','');
test('every holiday in 2027–2030 exports the exact single all-day date with an exclusive next-day end',()=>{
 let count=0;
 for(const year of YEARS)for(const h of holidays(year).filter(h=>h.slug!=='eduskuntavaalit')){
  const event={...h,url:'https://kalenteri365.fi/juhlapyhat/'+h.slug+'/'};
  for(const [reminder] of REMINDERS){
   const raw=eventCalendar(event,reminder,new Date('2026-11-13T12:00Z')),ics=unfold(raw),end=new Date(+utcDate(h.date)+86400000).toISOString().slice(0,10);
   assert(ics.includes('DTSTART;VALUE=DATE:'+key(h.date)+'\r\n'));
   assert(ics.includes('DTEND;VALUE=DATE:'+key(end)+'\r\n'));
   assert(ics.includes('SUMMARY:'+h.name+'\r\n'));
   assert(!ics.includes('RRULE:'));assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,1);
   assert.equal((ics.match(/BEGIN:VALARM/g)||[]).length,reminder==='none'?0:1);
   assert(raw.endsWith('END:VCALENDAR\r\n'));
   for(const line of raw.split('\r\n'))assert(Buffer.byteLength(line,'utf8')<=75);
   assert.equal(eventDownloadPath(h.slug,year,reminder),`/kalenteriin/${h.slug}/${year}-${reminder}.ics`);count++;
  }
 }
 assert.equal(count,736);
});
test('09:00 reminders use Finnish civil time across DST and year boundaries',()=>{
 for(const [date,days,expected] of [
  ['2027-03-28','1','2027-03-27T07:00:00.000Z'],
  ['2027-03-29','1','2027-03-28T06:00:00.000Z'],
  ['2027-10-31','1','2027-10-30T06:00:00.000Z'],
  ['2027-11-01','1','2027-10-31T07:00:00.000Z'],
  ['2027-01-01','7','2026-12-25T07:00:00.000Z'],
  ['2028-02-29','0','2028-02-29T07:00:00.000Z']
 ])assert.equal(reminderInstant(date,days).toISOString(),expected);
 assert.equal(reminderInstant('2027-01-01','none'),null);
 for(const date of ['2027-02-29','bad','2027-11-31'])assert.throws(()=>reminderInstant(date,'1'));
 assert.throws(()=>reminderInstant('2027-01-01','-7'));
});
test('Google event links retain Finnish titles and the selected movable holiday date',()=>{
 const h=holidays(2028).find(h=>h.slug==='paasiaispaiva'),url=new URL(googleCalendarURL({...h,url:'https://kalenteri365.fi/juhlapyhat/paasiaispaiva/'}));
 assert.equal(url.hostname,'calendar.google.com');assert.equal(url.searchParams.get('action'),'TEMPLATE');
 assert.equal(url.searchParams.get('text'),'Pääsiäispäivä');assert.equal(url.searchParams.get('dates'),'20280416/20280417');
 assert.equal(url.searchParams.get('stz'),'Europe/Helsinki');assert(url.searchParams.get('details').includes('https://kalenteri365.fi/juhlapyhat/paasiaispaiva/'));
});
test('calendar text escapes punctuation and newlines without inserting new properties',()=>{
 const ics=unfold(eventCalendar({slug:'example',name:'Oma, päivä; uusi',date:'2027-01-01',description:'Rivi 1\nATTENDEE:ei kutsua',url:'https://kalenteri365.fi/'},'none'));
 assert(ics.includes('SUMMARY:Oma\\, päivä\\; uusi\r\n'));
 assert(ics.includes('Rivi 1\\nATTENDEE:ei kutsua'));assert(!ics.includes('\r\nATTENDEE:'));
 assert.throws(()=>eventDownloadPath('../escape',2027));
});
