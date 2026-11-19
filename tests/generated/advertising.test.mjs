import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('every canonical built page is free of Adsterra',()=>{
 const pages=JSON.parse(readFileSync(new URL('../../reports/pages.json',import.meta.url),'utf8'));
 assert(pages.length>1200,'all sitemap sections covered');
 for(const page of pages){
  const html=readFileSync(new URL('../../dist'+page.path+'index.html',import.meta.url),'utf8');
  assert.doesNotMatch(html,/data-advertising-slot|advertising-config|data-sponsored-link|data-banner-choice|bauval\.org|adsterra\.com/i,page.path);
 }
});
