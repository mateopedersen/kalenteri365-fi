import test from 'node:test';
import assert from 'node:assert/strict';
import * as A from 'astronomy-engine';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CITIES} from '../src/calendar.mjs';
import {dayEvents} from '../src/solar-day.mjs';
import {cityPhotoState, cityPhotoPeriod, cityPhotoVariant} from '../src/city-light.mjs';

test('all selector locations use daytime and nighttime solar geometry independently of the visitor timezone', () => {
  for (const city of CITIES) {
    assert.equal(cityPhotoPeriod(A, city, new Date('2027-03-21T12:00:00+02:00')), 'day', city[1]);
    assert.equal(cityPhotoPeriod(A, city, new Date('2027-03-22T00:00:00+02:00')), 'night', city[1]);
  }
  assert.throws(() => cityPhotoPeriod(A, CITIES[0], new Date('invalid')), /Invalid photo time/);
});

test('polar night and midnight sun override ordinary clock-hour assumptions', () => {
  const north = CITIES.find(c => c[0] === 'utsjoki');
  assert.equal(cityPhotoPeriod(A, north, new Date('2027-06-21T00:00:00+03:00')), 'day');
  assert.equal(cityPhotoPeriod(A, north, new Date('2027-12-21T12:00:00+02:00')), 'night');
  assert.equal(cityPhotoPeriod(A, CITIES[0], new Date('2027-06-21T00:00:00+03:00')), 'night');
  assert.equal(cityPhotoPeriod(A, CITIES[0], new Date('2027-12-21T12:00:00+02:00')), 'day');
});

test('photo mode changes across computed sunrise and sunset, including DST transition dates', () => {
  for (const id of ['helsinki','tampere','utsjoki']) for (const date of ['2027-03-28','2027-10-31']) {
    const city=CITIES.find(c=>c[0]===id), sun=dayEvents(A,city,date);
    assert.equal(cityPhotoPeriod(A,city,new Date(+sun.rise-1)),'night');
    assert.equal(cityPhotoPeriod(A,city,sun.rise),'day');
    assert.equal(cityPhotoPeriod(A,city,new Date(+sun.set-1)),'day');
    assert.equal(cityPhotoPeriod(A,city,sun.set),'night');
    assert.equal(+cityPhotoState(A,city,new Date(+sun.rise-1)).nextChange,+sun.rise);
  }
});

test('every supported location has a distinct licensed and checksum-verified night photograph', () => {
  const credits=JSON.parse(readFileSync(new URL('../data/photo-credits.json',import.meta.url))), sources=new Set();
  for(const city of CITIES){
    const day=credits.find(p=>p.id===city[0]), matches=credits.filter(p=>p.kind==='city-night'&&p.cityId===city[0]);
    assert.equal(matches.length,1,city[1]);const night=matches[0];
    assert.match(night.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File/);
    assert.ok(night.author&&night.license&&night.licenseUrl&&night.alt.length>20&&night.reviewedAt);
    assert.ok(night.width>=900&&night.height>=500);
    assert.notEqual(night.source,day.source);assert.equal(sources.has(night.source),false);sources.add(night.source);
    const bytes=readFileSync(new URL('..'+night.src,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),night.sha256);
    const entry={...day,night};assert.equal(cityPhotoVariant(entry,'night'),night);assert.equal(cityPhotoVariant(entry,'day'),entry);
  }
  assert.equal(cityPhotoVariant({id:'missing'},'night'),null);
});
