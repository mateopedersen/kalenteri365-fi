import test from 'node:test';
import assert from 'node:assert/strict';
import {countdownEvents, COUNTDOWN_YEARS} from '../src/countdown-events.mjs';
import {countdownSuggestions, countdownEventSelection} from '../assets/countdown-events.mjs';
import {holidays} from '../src/calendar.mjs';
import {targetInstants} from '../assets/countdown-core.mjs';
const events=countdownEvents();
test('suggestions include every calendar holiday and observance for every offered year',()=>{
  for(const year of COUNTDOWN_YEARS){
    const list=countdownSuggestions(events,{year,today:'2026-11-14'});
    assert.equal(list.length,holidays(year).length);
    for(const holiday of holidays(year))assert(list.some(e=>e.slug===holiday.slug&&e.date===holiday.date&&e.name===holiday.name));
  }
  assert.equal(new Set(events.map(e=>`${e.slug}:${e.date}`)).size,events.length);
});
test('upcoming choices omit past occurrences and show the next date of each event once',()=>{
  const list=countdownSuggestions(events,{today:'2026-11-14'});
  assert(list.every(e=>e.date>='2026-11-14'));
  assert.equal(list.length,new Set(list.map(e=>e.slug)).size);
  assert.equal(list.find(e=>e.slug==='juhannuspaiva').date,'2027-06-26');
  assert.equal(list.find(e=>e.slug==='itsenaisyyspaiva').date,'2026-12-06');
});
test('Finnish terms, accentless input, aliases, year and exact dates match',()=>{
  const search=query=>countdownSuggestions(events,{query,today:'2026-11-14'});
  assert.equal(search('itsenai')[0].slug,'itsenaisyyspaiva');
  assert.equal(search('juhannus 2028').find(e=>e.slug==='juhannuspaiva').date,'2028-06-24');
  assert(search('pääsiäinen 2027').some(e=>e.date==='2027-03-28'));
  assert(search('joulu 2029').some(e=>e.slug==='tapaninpaiva'));
  assert(search('6.12.2027').some(e=>e.slug==='itsenaisyyspaiva'));
  assert(search('2026 pääsiäinen').every(e=>e.date.startsWith('2026-')));
  assert.deepEqual(search('oma tuntematon tapahtuma'),[]);
});
test('picking an event fills its actual civil date at Helsinki midnight',()=>{
  const event=events.find(e=>e.slug==='juhannuspaiva'&&e.date.startsWith('2030'));
  const result=countdownEventSelection(event);
  assert.deepEqual(result,{title:'Juhannuspäivä',date:'2030-06-22',time:'00:00',occurrence:''});
  assert.deepEqual(targetInstants(result.date,result.time),[Date.parse('2030-06-21T21:00:00Z')]);
});
