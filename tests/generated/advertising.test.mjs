import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {advertisingEligible} from '../../src/advertising-view.mjs';

test('every built page has one public information slot or no private-page slot and no eager vendor tag',()=>{
 const pages=JSON.parse(readFileSync(new URL('../../reports/pages.json',import.meta.url),'utf8'));
 let eligible=0,excluded=0;
 for(const page of pages){
  const html=readFileSync(new URL('../../dist'+page.path+'index.html',import.meta.url),'utf8');
  const expected=advertisingEligible(page.path)?1:0;
  assert.equal((html.match(/data-advertising-slot\b/g)||[]).length,expected,page.path);
  assert.equal((html.match(/id="advertising-config"/g)||[]).length,1,page.path+' configuration');
  const config=JSON.parse(html.match(/id="advertising-config"[^>]*>([^<]*)<\/script>/)[1]);
  assert.equal(config.enabled,true,page.path+' approved active configuration');
  assert(!/<script\b[^>]*src=["'][^"']*bauval\.org/i.test(html),page.path+' eager vendor');
  if(expected)eligible++;else excluded++;
 }
 assert(eligible>400);assert(excluded>800);
});
