import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { relatedRoutes } from '../../src/related-links.mjs';

const records = JSON.parse(readFileSync(new URL('../../reports/pages.json', import.meta.url), 'utf8'));
const catalog = new Set(records.map(page => page.path));
const related = path => relatedRoutes(path, { catalog });

test('every catalog page recommends only existing, distinct pages other than itself', () => {
  assert.ok(records.length >= 1200, 'the complete catalog must be audited');
  for (const { path } of records) {
    const targets = related(path);
    assert.ok(targets.length <= 3, path);
    assert.equal(new Set(targets).size, targets.length, path);
    for (const target of targets) {
      assert.ok(catalog.has(target), path + ' → ' + target);
      assert.notEqual(target, path);
    }
    if (!['/', '/haku/', '/sivukartta/'].includes(path)) assert.equal(targets.length, 3, path);
    // The build can render cards before its own page inventory is complete.
    for (const target of relatedRoutes(path)) assert.ok(catalog.has(target), 'without catalog: ' + path + ' → ' + target);
  }
});

test('local sky pages keep the same city and year', () => {
  assert.deepEqual(related('/auringonnousu-ja-lasku/utsjoki/2030/'), [
    '/paivan-pituus/utsjoki/2030/', '/kuun-nousu-ja-lasku/utsjoki/2030/', '/blogi/auringon-ajat/',
  ]);
  assert.deepEqual(related('/kuun-nousu-ja-lasku/utsjoki/2030/'), [
    '/auringonnousu-ja-lasku/utsjoki/2030/', '/paivan-pituus/utsjoki/2030/', '/kuukalenteri/2030/',
  ]);
});

test('calendar, print and celebration pages retain year and month', () => {
  assert.deepEqual(related('/kalenteri/2028/helmikuu/'), [
    '/pdf-kalenteri/2028/helmikuu/', '/juhlapyhat/2028/helmikuu/', '/viikkokalenteri/2028/',
  ]);
  assert.deepEqual(related('/pdf-kalenteri/2028/helmikuu/'), [
    '/kalenteri/2028/helmikuu/', '/kuukausikalenteri/2028/helmikuu/', '/luo-kalenteri/',
  ]);
  assert.equal(related('/liputuspaivat/2028/toukokuu/')[0], '/merkkipaivat/2028/toukokuu/');
});

test('ISO week links lead to the calendar month containing its Monday', () => {
  assert.equal(related('/viikkokalenteri/2028/viikko-10/')[0], '/kalenteri/2028/maaliskuu/');
  assert.equal(related('/viikkokalenteri/2027/viikko-1/')[0], '/kalenteri/2027/tammikuu/');
});

test('missing specific targets fall back to the same subject hub', () => {
  const sparse = new Set(['/paivan-pituus/utsjoki/', '/kuun-nousu-ja-lasku/', '/blogi/auringon-ajat/']);
  assert.deepEqual(relatedRoutes('/auringonnousu-ja-lasku/utsjoki/2030/', { catalog: sparse }), [...sparse]);
  assert.deepEqual(relatedRoutes('/kalenteri/2028/helmikuu/', { catalog: ['/pdf-kalenteri/', '/juhlapyhat/'] }), ['/pdf-kalenteri/', '/juhlapyhat/']);
});

test('all published blog articles have topic-specific routes', () => {
  const articles = records.filter(page => /^\/blogi\/.+\/$/.test(page.path));
  assert.equal(articles.length, 20);
  assert.ok(new Set(articles.map(page => related(page.path).join('|'))).size >= 18);
  assert.deepEqual(related('/blogi/kylvot-suomen-kevaassa/'), ['/kylvokalenteri/', '/vuodenajat/', '/paivan-pituus/']);
  assert.deepEqual(related('/blogi/opintoperiodit-ja-tentit/'), ['/yliopistojen-kalenterit/', '/opiskelukalenteri/', '/lukujarjestys/']);
});

test('garden, family and trust topics get relevant next steps', () => {
  assert.deepEqual(related('/kylvokalenteri/tomaatti/'), ['/kylvokalenteri/', '/kylvokalenteri/paprika/', '/blogi/kylvot-suomen-kevaassa/']);
  assert.ok(related('/perhekalenteri/').includes('/blogi/perheen-viikko/'));
  assert.deepEqual(related('/tietosuoja/'), ['/evasteet/', '/kayttoehdot/', '/yhteystiedot/']);
});


test('Rendered recommendation cards keep the real destination and readable specific labels', async () => {
 const {relatedCard,relatedTopics} = await import('../../src/related-view.mjs');
 for(const {path} of records){
  for(const target of relatedRoutes(path)){
   const card=relatedCard(target);
   assert.equal(card[5],target,path);
   assert.ok(typeof card[1]==='string' && card[1].length>2,target+' title');
   assert.ok(typeof card[2]==='string' && card[2].length>2,target+' description');
   assert.doesNotMatch(relatedTopics(path),/undefined|null/,path);
  }
 }
 assert.match(relatedCard('/paivan-pituus/oulu/2030/')[1],/Oulu.*2030/);
 assert.match(relatedCard('/pdf-kalenteri/2028/helmikuu/')[1],/Helmikuu 2028/);
 assert.equal(relatedCard('/kylvokalenteri/paprika/')[1],'Paprika');
 assert.match(relatedTopics('/kalenteri/2028/helmikuu/'),/href="\/pdf-kalenteri\/2028\/helmikuu\/"/);
});


test('Recommendation summaries preserve date ranges and correct selection terminology', async () => {
 const {relatedCard} = await import('../../src/related-view.mjs');
 assert.match(relatedCard('/juhlapyhat/juhannuspaiva/')[2],/26\./);
 assert.match(relatedCard('/viikkokalenteri/2028/')[2],/ISO-viikko/);
 assert.equal(relatedCard('/oma-arki/')[1],'Oma arki');
 assert.equal(relatedCard('/tahtitieteellinen-kalenteri/')[1],'Tähtitieteellinen kalenteri');
});


test('Related cards describe distinct next steps within the same page', async () => {
 const {relatedCard} = await import('../../src/related-view.mjs');
 for(const {path} of records){
  const descriptions=relatedRoutes(path).map(target=>relatedCard(target)[2]);
  assert.equal(new Set(descriptions).size,descriptions.length,path);
 }
});
