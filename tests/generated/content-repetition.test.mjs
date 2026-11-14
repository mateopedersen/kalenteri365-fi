import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../../',import.meta.url);
const records=JSON.parse(readFileSync(new URL('reports/pages.json',root),'utf8'));
const read=path=>readFileSync(new URL('dist'+path+'index.html',root),'utf8');
const hrefs=html=>[...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&').split('#')[0]);

test('All rendered pages avoid repeated editorial links and duplicate recommendation destinations',()=>{
 assert.ok(records.length>1200);
 for(const {path} of records){
  const html=read(path),main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
  const editorial=[...main.matchAll(/<a\b([^>]*data-editorial-link[^>]*)>/g)].map(m=>m[1].match(/href="([^"]+)"/)?.[1]);
  assert.equal(new Set(editorial).size,editorial.length,path+' repeats an editorial target');
  assert.ok(!editorial.includes(path),path+' links its prose to itself');
  const marker='<section class="related-content"';
  if(!main.includes(marker))continue;
  const [before,after]=main.split(marker);
  const already=new Set(hrefs(before.replace(/<nav\b[\s\S]*?<\/nav>/g,'')));
  const targets=hrefs(after);
  for(const target of targets)assert.ok(!already.has(target),path+' repeats recommendation '+target);
 }
});

test('Holiday cards expose a single coherent link and PDF guides are not copied onto every period',()=>{
 const cards=[...read('/juhlapyhat/').matchAll(/<article class="holiday-topic">([\s\S]*?)<\/article>/g)];
 assert.ok(cards.length>40);
 for(const [,card] of cards)assert.equal(hrefs(card).length,1);
 for(const {path} of records.filter(p=>/^\/pdf-kalenteri\/\d{4}\//.test(p.path))){
  assert.ok(!read(path).includes('class="print-catalog-guide"'),path);
  assert.match(read(path),/class="period-guide panel"/);
 }
 assert.match(read('/pdf-kalenteri/'),/class="print-catalog-guide"/);
});

test('Countdown offers calendar dates without repeating its usage guide',()=>{
 const html=read('/paivalaskuri/');
 const events=JSON.parse(html.match(/<script type="application\/json" data-countdown-events>([\s\S]*?)<\/script>/)[1]);
 assert.equal(events.length,231);
 assert.equal(new Set(events.map(e=>`${e.date}:${e.slug}`)).size,events.length);
 assert.match(html,/role="combobox"[^>]*aria-autocomplete="list"/);
 assert.match(html,/Valmiit ehdotukset kattavat/);
 assert.ok(!html.includes('Mitä lähtölaskenta laskee?'));
});
