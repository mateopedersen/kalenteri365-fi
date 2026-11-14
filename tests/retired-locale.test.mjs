import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/sv/[[path]].js';

test('retired Swedish addresses point permanently to the Finnish homepage', async () => {
  for (const path of ['/sv/', '/sv/kalender/', '/sv/?year=2027']) {
    for (const method of ['GET', 'HEAD']) {
      const response = onRequest({ request: new Request('https://kalenteri365.fi' + path, { method }) });
      assert.equal(response.status, 301);
      assert.equal(response.headers.get('Location'), 'https://kalenteri365.fi/');
      assert.equal(await response.text(), '');
    }
  }
});

test('retired locale redirects do not copy untrusted host or query parameters', () => {
  const response = onRequest({ request: new Request('https://example.invalid/sv/?next=https://example.invalid/') });
  assert.equal(response.headers.get('Location'), 'https://kalenteri365.fi/');
});
