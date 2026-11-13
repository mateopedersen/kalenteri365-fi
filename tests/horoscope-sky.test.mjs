import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dailySky,finnishInstant} from '../lib/horoscope-sky.mjs';
import {edition,horoscopeResponse,dailyMarkup,PROFILES} from '../lib/horoscope.mjs';

test('Finnish noon and civil day bounds retain winter/summer offsets and both DST transitions',()=>{
 assert.equal(finnishInstant('2026-11-13').toISOString(),'2026-11-13T10:00:00.000Z');
 assert.equal(finnishInstant('2026-06-13').toISOString(),'2026-06-13T09:00:00.000Z');
 for(const [date,hours] of [['2026-03-29',23],['2026-10-25',25]]){const s=dailySky(date);assert.equal((Date.parse(s.dayEnd)-Date.parse(s.dayStart))/3600000,hours);}
});
test('November 2026 sky retains actual distinct tropical positions, illumination and angular relationships',()=>{
 const s=dailySky('2026-11-13');
 assert.equal(s.positions.Moon.sign,'Kauris');assert.equal(s.positions.Sun.sign,'Skorpioni');
 assert.equal(s.moon.phase,'Kasvava sirppi');assert(s.moon.illumination>.14&&s.moon.illumination<.16);
 assert(Math.abs(s.positions.Moon.longitude-276.6868)<.02);assert(Math.abs(s.positions.Sun.longitude-231.0363)<.02);
 const conjunction=s.aspects.find(a=>a.a==='Mars'&&a.b==='Jupiter');assert.equal(conjunction.angle,0);assert(conjunction.distance>1&&conjunction.distance<1.1);
 assert.equal(s.positions.Mercury.retrograde,true);
 const prior=dailySky('2026-11-12');assert.notEqual(prior.positions.Moon.longitude,s.positions.Moon.longitude);
 for(const date of ['2026-02-30','invalid'])assert.throws(()=>dailySky(date));
});
test('all 12 original daily interpretations are substantial, source-bound and distinct for every available day',()=>{
 const now=new Date('2026-11-13T15:00Z');
 for(let i=0;i<8;i++){
  const date=new Date(Date.parse('2026-11-13T00:00Z')-i*86400000).toISOString().slice(0,10),e=edition(date,now);
  assert.equal(Object.keys(e.entries).length,12);assert.equal(new Set(Object.values(e.entries).map(x=>x.title)).size,12);
  for(const entry of Object.values(e.entries)){
   const text=['overview','relationships','work','ownTime'].map(k=>entry[k]).join(' ');
   assert(text.split(/\s+/).length>=250);assert(text.split(/\s+/).length<700);
   assert(entry.overview.includes(e.sky.positions.Moon.locative));assert(entry.relationships.includes(e.sky.positions.Venus.locative));assert(entry.work.includes(e.sky.positions.Mercury.locative));assert(entry.ownTime.includes(e.sky.positions.Mars.locative));
   for(const key of ['overview','relationships','work','ownTime'])assert.equal(entry[key].split('\n\n').length,2);
   const html=dailyMarkup(entry,date);assert.equal((html.match(/class="horoscope-paragraphs"/g)||[]).length,4);assert(html.includes('Päivitetty tänään'));assert(html.includes('data-daily-phase'));
  }
 }
});
test('edge API does not cache an old day over Finnish midnight and archive limits remain enforced',async()=>{
 for(const instant of ['2026-11-13T21:59:59Z','2026-06-13T20:59:59Z']){
  const r=horoscopeResponse(new Request('https://kalenteri365.fi/api/horoscope'),new Date(instant));assert.match(r.headers.get('cache-control'),/s-maxage=1,/);
 }
 const now=new Date('2026-11-13T22:00:00Z'),r=horoscopeResponse(new Request('https://kalenteri365.fi/api/horoscope?sign=rapu'),now),e=await r.json();assert.equal(e.date,'2026-11-14');assert.deepEqual(Object.keys(e.entries),['rapu']);
 assert.equal(horoscopeResponse(new Request('https://kalenteri365.fi/api/horoscope?date=2026-11-06'),now).status,400);
 assert.equal(horoscopeResponse(new Request('https://kalenteri365.fi/api/horoscope?sign=unknown'),now).status,404);
});
test('every Finnish sign maps to its own checksum-verified native vector without embedded raster or font glyphs',async()=>{
 const manifest=JSON.parse(await fs.readFile(new URL('../data/zodiac-art.json',import.meta.url))),hashes=new Set();
 assert.equal(Object.keys(manifest.artifacts).length,12);
 for(const [slug,name] of PROFILES){const record=manifest.artifacts[slug],bytes=await fs.readFile(new URL('../'+record.filename,import.meta.url)),svg=bytes.toString();assert.equal(record.name,name);assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);assert(!/<image\b|<text\b|data:image|https?:\/\/(?!www.w3.org)/.test(svg));assert(svg.includes('<svg'));hashes.add(record.sha256);}
 assert.equal(hashes.size,12);
});
