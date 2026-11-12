import test from 'node:test';
import assert from 'node:assert/strict';
import { homeView, cleanHomeURL } from '../src/home-view.mjs';

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
