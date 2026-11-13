import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet} from '../functions/api/place.js';
import {CITIES} from '../src/calendar.mjs';

const locate = async cf => {
  const request = new Request('https://kalenteri365.fi/api/place');
  Object.defineProperty(request, 'cf', {value: cf});
  const response = onRequestGet({request});
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  return response.json();
};

test('Finnish IP coordinates resolve every supported city, with accented city names preserved', async () => {
  for (const [id, name, latitude, longitude] of CITIES) {
    const result = await locate({country: 'FI', latitude: String(latitude), longitude: String(longitude)});
    assert.equal(result.id, id);
    assert.equal(result.name, name);
    assert.equal(result.detected, true);
  }
  assert.equal((await locate({country: 'FI', city: 'JYVASKYLA'})).id, 'jyvaskyla');
});

test('all foreign countries and unavailable IP information default to Helsinki', async () => {
  for (const country of ['TR', 'US', 'LV', 'SE', 'DE', '', undefined]) {
    const result = await locate({country, city: 'Joensuu', latitude: '62.601', longitude: '29.7636'});
    assert.equal(result.id, 'helsinki');
    assert.equal(result.source, 'default');
  }
  for (const latitude of [undefined, null, '', 'invalid', '100']) {
    const result = await locate({country: 'FI', latitude, longitude: '25'});
    assert.equal(result.id, 'helsinki');
    assert.equal(result.detected, false);
  }
});

test('a nearby Finnish location maps to the nearest supported city', async () => {
  assert.equal((await locate({country: 'FI', latitude: '62.62', longitude: '29.79'})).id, 'joensuu');
});
