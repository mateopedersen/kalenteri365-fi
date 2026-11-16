import test from 'node:test';
import assert from 'node:assert/strict';

for (const slug of ['black-friday', 'cyber-monday']) {
 test('retired '+slug+' cannot serve an old page or redirect', async () => {
  const {onRequest}=await import('../functions/'+slug+'/[[path]].js');
  for (const suffix of ['', '/', '/?year=2030']) for (const method of ['GET','HEAD']) {
   const response=onRequest({request:new Request('https://kalenteri365.fi/'+slug+suffix,{method})});
   assert.equal(response.status,404);
   assert.equal(response.headers.get('Location'),null);
   assert.equal(response.headers.get('Cache-Control'),'no-store');
   assert.equal(response.headers.get('X-Robots-Tag'),'noindex');
   assert.equal(await response.text(),method==='HEAD'?'':'Sivua ei löytynyt.\n');
  }
 });
}
