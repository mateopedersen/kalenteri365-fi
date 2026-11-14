import test from 'node:test';
import assert from 'node:assert/strict';
import {holidays} from '../src/calendar.mjs';
import stories from '../data/holiday-stories.json' with {type:'json'};
import {HOLIDAY_READING,holidayReading,remainingHolidaySources} from '../src/holiday-reading.mjs';

test('every special day has distinct, reachable contextual reading and a topic source',()=>{
  const slugs=new Set(holidays(2027).map(day=>day.slug));
  assert.deepEqual(new Set(Object.keys(HOLIDAY_READING)),slugs);
  const copy=new Set();
  const incoming=new Set();
  for(const slug of slugs){
    const item=HOLIDAY_READING[slug];
    assert(!copy.has(item.text),slug+' repeats another day');copy.add(item.text);
    assert.equal(item.related.length,2,slug);
    const targets=item.related.map(([target])=>target);
    assert.equal(new Set(targets).size,targets.length,slug);
    for(const target of targets){assert(slugs.has(target),target);assert.notEqual(target,slug);incoming.add(target);}
    const html=holidayReading(slug);
    assert.equal((html.match(/<a /g)||[]).length,3,slug);
    assert(!/<a\b[^>]*>[^<]*<a\b/.test(html),slug);
    assert(html.includes(stories[slug].sources[item.sourceIndex].url.replaceAll('&','&amp;')),slug);
    assert(remainingHolidaySources(slug).every(source=>source!==stories[slug].sources[item.sourceIndex]),slug);
  }
  assert.deepEqual(incoming,slugs,'every special day must also be discoverable from another day');
});
