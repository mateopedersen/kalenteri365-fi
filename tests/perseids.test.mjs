import test from 'node:test';
import assert from 'node:assert/strict';
import {perseidData} from '../src/perseids-view.mjs';
import {perseidICS,skyLabel} from '../assets/perseids-core.mjs';
const cities=perseidData();
test('observation dates cross Finnish midnight correctly in summer time',()=>{
 assert.equal(cities.length,25);
 const format=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'});
 for(const city of cities)for(const [year,nights] of Object.entries(city.years)){
  assert.equal(nights.length,5);
  for(const n of nights){assert.equal(n.start,`${n.date}T20:00:00.000Z`);assert.equal(n.end,`${n.date}T23:00:00.000Z`);for(const s of n.samples){const value=format.format(new Date(s.time));assert.match(value,new RegExp(`${year}-08-${Number(n.date.slice(-2))+1} ${String(s.hour).padStart(2,'0')}`));assert.ok(s.illumination>=0&&s.illumination<=1);assert.ok(s.sun>=-90&&s.sun<=90&&s.moon>=-90&&s.moon<=90);}}
 }
});
test('summer twilight is brighter in northern Finland and is not confused with a meteor forecast',()=>{
 const south=cities[0].years[2027][1].samples[1],north=cities.find(c=>c.slug==='utsjoki').years[2027][1].samples[1];assert.ok(north.sun>south.sun);
 assert.equal(skyLabel(-18),'Pimeä');assert.equal(skyLabel(-15),'Tähtitieteellinen hämärä');assert.equal(skyLabel(-8),'Nauttinen hämärä');assert.equal(skyLabel(2),'Valoisa taivas');
});
test('calendar file preserves actual UTC interval, UTF-8 folding and explicit plan wording',()=>{
 const city=cities.find(c=>c.slug==='hameenlinna'),night=city.years[2028][0],ics=perseidICS(city,night),unfold=ics.replace(/\r\n /g,'');
 assert.match(unfold,/BEGIN:VCALENDAR/);assert.match(unfold,/DTSTART:20280811T200000Z/);assert.match(unfold,/DTEND:20280811T230000Z/);assert.match(unfold,/LOCATION:Hämeenlinna/);assert.match(unfold,/Ei meteoriparven vahvistettu huippuennuste/);
 for(const line of ics.split('\r\n'))assert.ok(new TextEncoder().encode(line).length<=75);
});
