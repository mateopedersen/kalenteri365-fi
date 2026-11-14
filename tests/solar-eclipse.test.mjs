import test from 'node:test';
import assert from 'node:assert/strict';
import {solarEclipseData} from '../src/solar-eclipse-view.mjs';
import {eclipseCards} from '../assets/solar-eclipse-core.mjs';
import {CITIES} from '../src/calendar.mjs';

const cities=solarEclipseData();

test('Helsinki 2027 contacts agree with Ursa to within 15 seconds',()=>{
  // https://www.ursa.fi/vuosikirja/lisamateriaali2027/auringonpimennys-020827.html
  // Ursa gives Finnish summer time, UTC+3, and magnitude by diameter.
  // The app deliberately gives obscuration by area instead.
  const eclipse=cities.find(c=>c.slug==='helsinki').events.find(e=>e.peak.startsWith('2027-08-02'));
  for(const [key,value] of Object.entries({begin:'08:48:52',peak:'09:25:22',end:'10:02:08'})){
    assert.ok(Math.abs(Date.parse(eclipse[key])-Date.parse(`2027-08-02T${value}Z`))<15000,key);
  }
  assert.equal(eclipse.kind,'partial');
  assert.ok(eclipse.obscuration>.080&&eclipse.obscuration<.083,'Area obscuration is approximately 8.1%, not the 16.8% diameter magnitude');
  const html=eclipseCards(cities[0],'2027');
  assert.match(html,/11\.49/); // 11:48:57 is rounded, not truncated.
  assert.match(html,/12\.25/);
  assert.match(html,/13\.02/);
});

test('the 2027 northern visibility boundary is respected',()=>{
  assert.ok(cities.find(c=>c.slug==='rovaniemi').events.some(e=>e.peak.startsWith('2027-08-02')));
  const north=cities.find(c=>c.slug==='utsjoki');
  assert.equal(north.events.some(e=>e.peak.startsWith('2027')),false);
  assert.match(eclipseCards(north,'2027'),/Ei näkyviä auringonpimennyksiä/);
});

test('all supported places retain ordered contacts, valid area fractions and bounded years',()=>{
  assert.deepEqual(cities.map(c=>c.slug),CITIES.map(c=>c[0]));
  for(const city of cities){
    let last=Date.parse('2027-01-01T00:00:00Z');
    for(const e of city.events){
      const begin=Date.parse(e.begin),peak=Date.parse(e.peak),end=Date.parse(e.end);
      assert.ok(last<peak&&begin<peak&&peak<end,city.slug);
      assert.ok(peak<Date.parse('2031-01-01T00:00:00Z'));
      assert.ok(e.obscuration>0&&e.obscuration<=1);
      assert.ok(Number.isFinite(e.altitude)&&e.altitude>=-1&&e.altitude<=90);
      last=peak;
    }
  }
  assert.equal(cities.some(c=>c.events.some(e=>e.peak.startsWith('2028'))),false);
});
