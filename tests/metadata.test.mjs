import test from 'node:test';
import assert from 'node:assert/strict';
import pages from '../reports/pages.json' with {type:'json'};
import overrides from '../data/seo-pages.json' with {type:'json'};
import {pageMetadata,brandedTitle,assertUniqueMetadata} from '../src/metadata.mjs';
import {layout} from '../src/ui.mjs';
import {swedishLayout} from '../src/swedish.mjs';
import {parseHead} from '../scripts/audit-social.mjs';
import {PAYMENT_PLANS} from '../assets/payment-data.mjs';

test('SEO branding replaces separators, preserves Finnish hyphens and is idempotent',()=>{
  for(const raw of ['Auringonnousu ja -lasku – Helsinki','Kalenteri 2027–2030','Kesä- ja normaaliaika: kellonsiirto','PDF-kalenteri 2028']){
    const full=brandedTitle(raw);
    assert.ok(full.endsWith(' | Kalenteri365'));
    assert.equal(brandedTitle(full),full);
    assert.doesNotMatch(full,/\s[–—-]\s/);
  }
  assert.equal(brandedTitle('  Kalenteri 2028 - Kalenteri365 | Kalenteri365  '),'Kalenteri 2028 | Kalenteri365');
  assert.equal(brandedTitle('Auringonnousu ja -lasku – Helsinki'),'Auringonnousu ja -lasku | Helsinki | Kalenteri365');
  assert.equal(brandedTitle('Kalenteri 2027–2030'),'Kalenteri 2027–2030 | Kalenteri365');
  assert.throws(()=>brandedTitle('  '),/required/);
});

test('every generated page has distinct SEO text and every override targets a real page',()=>{
  const inventory={title:new Map(),description:new Map()},paths=new Set(pages.map(p=>p.path));
  for(const p of pages){
    const m=pageMetadata(p.path,p.title,p.displayDescription||p.description,p);
    assertUniqueMetadata({title:brandedTitle(m.title),description:m.description},p.path,inventory);
  }
  for(const path of Object.keys(overrides))assert.ok(paths.has(path),'Unknown metadata route '+path);
  assert.equal(inventory.title.size,pages.length);
  assert.equal(inventory.description.size,pages.length);
});

test('calendar intent, leap-year data and neighbouring page types stay distinct',()=>{
  const calendar=pageMetadata('/kalenteri/2028/helmikuu/','Helmikuu 2028','old');
  assert.match(calendar.title,/Helmikuun 2028 kalenteri/);
  assert.match(calendar.description,/29 päivää/);
  const annual=pageMetadata('/kalenteri/2028/','Kalenteri 2028','old');
  assert.match(annual.description,/366 päivää/);
  const printable=pageMetadata('/kuukausikalenteri/2028/helmikuu/','Helmikuu 2028 – kuukausikalenteri','print');
  const pdf=pageMetadata('/pdf-kalenteri/2028/helmikuu/','Helmikuun 2028 PDF-kalenteri','old');
  assert.equal(new Set([calendar.title,printable.title,pdf.title]).size,3);
  assert.match(pdf.description,/15 ulkoasusta/);
  assert.match(pdf.description,/600 dpi/);
  assert.match(pageMetadata('/viikkokalenteri/2028/viikko-2/','Viikko 2, 2028','week').title,/Viikkokalenteri 2028 \| Viikko 2/);
});

test('event summaries state empty months and keep real entries instead of invented holidays',()=>{
  const empty=pageMetadata('/juhlapyhat/2028/helmikuu/','Helmikuu 2028','unused');
  assert.match(empty.description,/ei ole tämän kuukauden pyhäpäiviä tai aattoja/);
  const flags=pageMetadata('/liputuspaivat/2028/tammikuu/','Tammikuu 2028','unused');
  assert.match(flags.description,/ei ole tämän kuukauden liputuspäiviä/);
  const january=pageMetadata('/juhlapyhat/2027/tammikuu/','Tammikuu 2027','unused');
  assert.match(january.description,/2 merkintää/);
  assert.match(january.description,/Uudenvuodenpäivä 1\.1\./);
  assert.doesNotMatch(january.description,/1\.1\.\./);
});

test('monthly work-hour metadata explicitly gives both working-week and daily-hours assumptions',()=>{
  const {description}=pageMetadata('/tyopaivat/2027/tammikuu/','Tammikuu 2027','unused');
  assert.match(description,/19 työpäivää ja 142,5 tuntia/);
  assert.match(description,/ma–pe ja 7,5 h\/päivä/);
  assert.match(description,/aattojen käsittelyä/);
});

test('lunar summaries include both new moons or full moons and use Finland civil dates at UTC boundaries',()=>{
  const july=pageMetadata('/kuukalenteri/2030/heinakuu/','Heinäkuu 2030','unused').description;
  assert.match(july,/Uusikuut 1\.7\. ja 30\.7\./);
  assert.doesNotMatch(july,/30\.6\./);
  const august=pageMetadata('/kuukalenteri/2027/elokuu/','Elokuu 2027','unused').description;
  assert.match(august,/Uusikuut 2\.8\. ja 31\.8\./);
  const december=pageMetadata('/kuukalenteri/2028/joulukuu/','Joulukuu 2028','unused').description;
  assert.match(december,/Täysikuut 2\.12\. ja 31\.12\./);
  for(const value of [july,august,december]){
    assert.doesNotMatch(value,/\.\./);
    assert.match(value,/Suomen aikaa/);
  }
});

test('payment metadata names the actual providers, benefit and year present in the calendar',()=>{
  const benefits=PAYMENT_PLANS.filter(p=>p.kind==='benefit');
  assert.deepEqual([...new Set(benefits.map(p=>p.name))],['Lapsilisä']);
  assert.deepEqual([...new Set(PAYMENT_PLANS.filter(p=>p.kind==='pension').map(p=>p.institution))],['Keva','Ilmarinen']);
  assert.deepEqual([...new Set(PAYMENT_PLANS.flatMap(p=>p.dates.map(d=>d.slice(0,4))))],['2027']);
  assert.match(overrides['/elakkeiden-maksupaivat/'].description,/Kevan ja Ilmarisen/);
  assert.doesNotMatch(overrides['/elakkeiden-maksupaivat/'].description,/Kelan/);
  assert.equal(overrides['/etuuksien-maksupaivat/'].title,'Lapsilisän maksupäivät 2027');
});

test('metadata distinguishes institution scope and calculated versus published periods',()=>{
  assert.match(overrides['/koulujen-lomat/helsinki/2026-2027/'].description,/suomenkielisen perusopetuksen/);
  assert.match(overrides['/yliopistojen-kalenterit/maanpuolustuskorkeakoulu/'].description,/ei ole vahvistettu/);
  assert.match(overrides['/yliopistojen-kalenterit/abo-akademi/2029-2030/'].description,/ISO-viikkorajoista laskettuina/);
  assert.match(overrides['/auringonpimennys/'].title,/Helsinki/);
  assert.match(overrides['/kuunpimennys/'].description,/Helsingissä/);
});

test('plant and holiday descriptions identify their actual topic',()=>{
  assert.match(overrides['/kylvokalenteri/tomaatti/'].description,/Tomaatti.*esikasvatus/);
  assert.match(overrides['/juhlapyhat/jouluaatto/'].description,/Jouluaatto 24\.12\./);
  assert.match(overrides['/juhlapyhat/joulupaiva/'].description,/Joulupäivä 25\.12\./);
  assert.notEqual(overrides['/juhlapyhat/jouluaatto/'].description,overrides['/juhlapyhat/joulupaiva/'].description);
});

test('duplicate or missing metadata stops generation with both routes identified',()=>{
  const inventory={title:new Map(),description:new Map()};
  assertUniqueMetadata({title:'A | Kalenteri365',description:'First'},'/first/',inventory);
  assert.throws(()=>assertUniqueMetadata({title:'a | Kalenteri365',description:'Second'},'/second/',inventory),/\/second\/ and \/first\//);
  assert.throws(()=>assertUniqueMetadata({title:'B | Kalenteri365',description:''},'/missing/',inventory),/Missing SEO description/);
});

test('Swedish pages retain their own language and local astronomy retains city and year',()=>{
  assert.deepEqual(pageMetadata('/sv/','Finlands kalender på svenska','Årskalendrar.',{locale:'sv'}),{title:'Finlands kalender på svenska',description:'Årskalendrar.'});
  const title='Auringonnousu ja -lasku 2029 – Utsjoki';
  assert.equal(brandedTitle(pageMetadata('/auringonnousu-ja-lasku/utsjoki/2029/',title,'Local').title),'Auringonnousu ja -lasku 2029 | Utsjoki | Kalenteri365');
});

test('SEO and social metadata can change without replacing the visible page heading or introduction',()=>{
  for(const [render,path,title,intro]of [[layout,'/kalenteri/2028/','Kalenteri 2028','Näkyvä johdanto.'],[swedishLayout,'/sv/','Kalender på svenska','Synlig inledning.']]){
    const html=render({path,title,description:intro,body:'<p>Content</p>',social:{src:'/assets/example.jpg'},seoTitle:'Unique title | Kalenteri365',seoDescription:'Specific description.'});
    const head=parseHead(html);
    assert.equal(head.title,'Unique title | Kalenteri365');
    for(const key of ['og:title','twitter:title'])assert.deepEqual(head.meta.get(key),['Unique title | Kalenteri365']);
    for(const key of ['description','og:description','twitter:description'])assert.deepEqual(head.meta.get(key),['Specific description.']);
    const schema=JSON.parse(head.json[0]);
    assert.equal(schema.name,'Unique title | Kalenteri365');
    assert.equal(schema.description,'Specific description.');
    assert.ok(html.includes('<h1>'+title+'</h1>'));
    assert.ok(html.includes('<p>'+intro+'</p>'));
  }
});
