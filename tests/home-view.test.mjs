import test from 'node:test';
import assert from 'node:assert/strict';
import { homeView, cleanHomeURL, calendarView, calendarViewURL } from '../src/home-view.mjs';
import { SLUGS, YEARS } from '../src/calendar.mjs';
import {safePublicUrl} from '../assets/share-core.mjs';

test('A bare homepage uses the local date without adding calendar query parameters', () => {
  assert.deepEqual(homeView('https://kalenteri365.fi/', null, '2026-11-12'), {
    year: 2026, month: 11, date: '2026-11-12', view: 'month',
  });
  assert.equal(cleanHomeURL('https://kalenteri365.fi/'), '/');
});

test('Legacy shared days override the saved view and keep unrelated parameters and anchors', () => {
  const url = 'https://kalenteri365.fi/?year=2028&month=2&date=2028-02-29&view=day&utm_source=test#sisalto';
  assert.deepEqual(homeView(url, { year: 2027, month: 1, date: '2027-01-04', view: 'week' }, '2026-11-12'), {
    year: 2028, month: 2, date: '2028-02-29', view: 'day',
  });
  assert.equal(cleanHomeURL(url), '/?utm_source=test#sisalto');
});

test('Saved calendar selections survive a reload; impossible dates do not roll into another month', () => {
  assert.equal(homeView('https://kalenteri365.fi/', { year: 2030, month: 6, date: '2030-06-18', view: 'week' }, '2026-11-12').date, '2030-06-18');
  assert.deepEqual(homeView('https://kalenteri365.fi/?year=2027&month=2&date=2027-02-29&view=broken', null, '2026-11-12'), {
    year: 2027, month: 2, date: '2027-02-01', view: 'month',
  });
});

test('All 48 monthly pages open and share with a clean path, including old default-state links', () => {
  for (const year of YEARS) for (const [index, slug] of SLUGS.entries()) {
    const month = index + 1, date = `${year}-${String(month).padStart(2, '0')}-01`;
    const path = `/kalenteri/${year}/${slug}/`, url = 'https://kalenteri365.fi' + path;
    const initial = calendarView(url, year, month);
    assert.deepEqual(initial, {date, view:'month'});
    assert.equal(calendarViewURL(url, {year, month, ...initial}), path);
    const old = url + `?year=${year}&month=${month}&date=${date}&view=month`;
    assert.equal(calendarViewURL(old, {year, month, ...calendarView(old, year, month)}), path);
    assert.equal(safePublicUrl(old), url);
    assert.equal(safePublicUrl(url.slice(0,-1)), url);
  }
});

test('Dated links and non-default views survive a reload without query-string calendar variants', () => {
  const url = 'https://kalenteri365.fi/kalenteri/2028/helmikuu/';
  for (const view of ['month','day','week','list','year']) {
    const state = {date:'2028-02-29', view};
    const result = calendarViewURL(url + `?date=2028-02-29&view=${view}`, {year:2028, month:2, ...state});
    assert.ok(!result.includes('?'));
    assert.deepEqual(calendarView(new URL(result, url), 2028, 2), state);
    assert.equal(safePublicUrl(new URL(result, url).href), new URL(result, url).href);
  }
  assert.deepEqual(calendarView(url + '?date=2027-02-29&view=broken', 2028, 2), {date:'2028-02-01',view:'month'});
  assert.equal(calendarView(url + '?date=2028-02-03#date=2028-02-29&view=day', 2028, 2).date, '2028-02-29');
  assert.equal(calendarViewURL(url + '?date=2028-02-01&view=month&utm_source=test#sisalto', {year:2028,month:2,date:'2028-02-01'}), '/kalenteri/2028/helmikuu/?utm_source=test#sisalto');
  assert.equal(calendarViewURL(url + '#date=2028-02-29&view=day', {year:2028,month:2,date:'2028-02-01'}), '/kalenteri/2028/helmikuu/');
});
