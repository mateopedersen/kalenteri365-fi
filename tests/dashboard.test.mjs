import test from 'node:test';
import assert from 'node:assert/strict';
import {upcomingDates, upcomingItems, calendarFilterIds, CALENDAR_LAYERS} from '../src/dashboard.mjs';

test('upcoming days include Finnish flag days, while the holiday view selects only public holidays', () => {
  assert.deepEqual(upcomingDates('2026-11-13').map(item => item.slug), ['lapsen-oikeuksien-paiva', 'itsenaisyyspaiva', 'sibeliuksen-paiva']);
  assert.deepEqual(upcomingDates('2026-11-13', true).map(item => item.slug), ['itsenaisyyspaiva', 'joulupaiva', 'tapaninpaiva']);
  assert.match(upcomingItems('2026-12-24'), /Aatto/);
  assert.match(upcomingItems('2026-12-24'), /Tänään/);
});

test('the upcoming list crosses the year boundary and retains exact linked dates', () => {
  const days = upcomingDates('2027-12-31');
  assert.equal(days[0].date, '2027-12-31');
  assert.equal(days[1].date, '2028-01-01');
  assert.match(upcomingItems('2027-12-31'), /datetime="2028-01-01"/);
  assert.match(upcomingItems('2027-12-31'), /Huomenna/);
  assert.equal(new Set(CALENDAR_LAYERS.map(item => item[0])).size, 6);
  assert.equal(calendarFilterIds(undefined).length, 6);
  assert.deepEqual(calendarFilterIds([]), []);
  assert.deepEqual(calendarFilterIds(['work', 'invalid']), ['work']);
});
