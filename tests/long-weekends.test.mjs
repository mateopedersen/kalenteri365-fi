import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {weekendOptions,WEEKEND_TOPICS} from '../src/long-weekend-core.mjs';
import {holidays,parse,YEARS} from '../src/calendar.mjs';
import {longWeekendPage} from '../src/long-weekend-view.mjs';

// Independent enumeration checks every possible 3–9-day period around each
// anchor, rather than checking a result against the function that made it.
for(const year of YEARS)for(const budget of [0,1,2,4])test(`${year}: anchored periods with budget ${budget}`,()=>{
 const result=weekendOptions(year,budget),publicDates=new Set(holidays(year).filter(h=>h.type==='holiday').map(h=>h.date));
 for(const [slug] of WEEKEND_TOPICS){
  const anchor=holidays(year).find(h=>h.slug===slug).date,candidates=[];
  for(let delta=-8;delta<=0;delta++)for(let length=3;length<=9;length++){
   const start=new Date(+parse(anchor)+delta*86400000),end=new Date(+start+(length-1)*86400000);
   const a=start.toISOString().slice(0,10),b=end.toISOString().slice(0,10);
   if(a<year+'-01-01'||b>year+'-12-31'||b<anchor)continue;
   const leave=[];
   for(let n=0;n<length;n++){const d=new Date(+start+n*86400000),s=d.toISOString().slice(0,10);if(d.getUTCDay()>0&&d.getUTCDay()<6&&!publicDates.has(s))leave.push(s);}
   if(leave.length<=budget)candidates.push({a,b,length,leave});
  }
  candidates.sort((a,b)=>b.length-a.length||a.leave.length-b.leave.length||a.a.localeCompare(b.a));
  const p=result.find(p=>p.slug===slug);
  if(!candidates.length){assert.equal(p,undefined);continue;}
  const expected=candidates[0];assert.ok(p);assert.equal(p.start,expected.a);assert.equal(p.end,expected.b);assert.equal(p.calendarDays,expected.length);assert.deepEqual(p.leaveDates,expected.leave);
 }
});
test('Easter 2027 is four days without leave, and Midsummer eve is not assumed free',()=>{
 const easter=weekendOptions(2027,0).find(p=>p.slug==='paasiaispaiva');assert.equal(easter.start,'2027-03-26');assert.equal(easter.end,'2027-03-29');assert.equal(easter.leaveDays,0);
 const midsummer=weekendOptions(2027,1).find(p=>p.slug==='juhannuspaiva');assert.deepEqual(midsummer.leaveDates,['2027-06-25']);assert.equal(midsummer.calendarDays,3);
});
test('All periods have topic-specific artwork; year pages have one matching h1',async()=>{
 const hashes=new Set();for(const scene of [...WEEKEND_TOPICS.map(t=>t[2]),'lakeside']){const bytes=await fs.readFile(new URL(`../assets/weekend-art/${scene}.svg`,import.meta.url));assert.match(bytes.toString(),/viewBox="0 0 480 280"/);hashes.add(createHash('sha256').update(bytes).digest('hex'));}assert.equal(hashes.size,9);
 for(const year of YEARS){const html=longWeekendPage(year);assert.equal((html.match(/<h1>/g)||[]).length,1);assert.ok(html.includes(`<h1>Pitkät viikonloput ${year}</h1>`));assert.ok(html.includes('data-fixed-year="'+year+'"'));}
});
test('Unsupported settings are rejected',()=>{assert.throws(()=>weekendOptions(2026,1));assert.throws(()=>weekendOptions(2027,3));});
