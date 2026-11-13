import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import blog from '../data/blog.json' with {type:'json'};
import annotations from '../data/blog-inline-links.json' with {type:'json'};
import {linkEditorialParagraphs,contextualTarget,annotatedParagraph} from '../src/editorial-links.mjs';
import {periodGuide,cityGuide} from '../src/period-guide.mjs';

test('Context links preserve markup and never link controls, existing anchors or word fragments',()=>{
 const html='<nav><p>Perhekalenteri kokoaa yhteiset menot näkyviin.</p></nav><form><p>Perhekalenteri auttaa kirjaamaan menot.</p></form><p>Perhekalenteriin voi merkitä viikon tärkeät menot.</p><p><a href="/perhekalenteri/">Perhekalenteri</a> kokoaa yhteiset menot.</p><p>Ei työpäivälaskurinkaan sanaosasta tehtyä linkkiä.</p>';
 const out=linkEditorialParagraphs(html,{path:'/paivasuunnittelija/'});
 assert.equal((out.match(/data-editorial-link/g)||[]).length,1);
 assert.ok(out.includes('<a class="editorial-link" data-editorial-link href="/perhekalenteri/">Perhekalenteriin</a>'));
 assert.ok(out.includes('<nav><p>Perhekalenteri'));
 assert.ok(out.includes('<form><p>Perhekalenteri'));
 assert.ok(out.includes('työpäivälaskurinkaan'));
 assert.equal(linkEditorialParagraphs(html,{path:'/',locale:'fi'}),html);
 assert.equal(linkEditorialParagraphs(html,{path:'/sv/kalender/',locale:'sv'}),html);
 assert.equal(linkEditorialParagraphs('<p>Työpäivälaskuri laskee oman jakson päivät.</p>',{path:'/tyopaivalaskuri/'}).includes('data-editorial-link'),false);
});

test('A contextual link keeps its year, month or observing city',()=>{
 assert.equal(contextualTarget('pdf-kalenteri','/kalenteri/2028/helmikuu/'),'/pdf-kalenteri/2028/helmikuu/');
 assert.equal(contextualTarget('kuun-nousu-ja-lasku','/auringonnousu-ja-lasku/oulu/2030/'),'/kuun-nousu-ja-lasku/oulu/2030/');
 assert.equal(contextualTarget('juhlapyhat','/viikkokalenteri/2027/viikko-1/'),'/juhlapyhat/2027/');
});

test('All 20 blog articles have source-bound, literal and distinct inline destinations',()=>{
 assert.equal(annotations.length,blog.length);
 for(const g of blog){
  const links=annotations.find(a=>a.slug===g.slug)?.links;assert.ok(links?.length>=3,g.slug);
  assert.ok(links.some(l=>l.href.startsWith('https://')),g.slug+' external');
  assert.ok(links.some(l=>l.href.startsWith('/')),g.slug+' internal');
  assert.equal(new Set(links.map(l=>l.href)).size,links.length,g.slug+' duplicate');
  for(const l of links){const text=g.sections[l.section].paragraphs[l.paragraph];assert.ok(text.includes(l.text));assert.equal(createHash('sha256').update(text).digest('hex'),l.sha256,g.slug);assert.ok(annotatedParagraph(text,[l]).includes('data-editorial-link'));}
 }
 assert.throws(()=>annotatedParagraph('Erillinen sisältö',[{text:'puuttuva',href:'/'}]));
 assert.equal(annotatedParagraph('Kuva & teksti',[{text:'teksti',href:'/haku/?a=1&b=2'}]),'Kuva &amp; <a class="editorial-link" data-editorial-link href="/haku/?a=1&amp;b=2">teksti</a>');
});

test('Period copy distinguishes leap months and the cross-year ISO week correctly',()=>{
 assert.match(periodGuide('/kalenteri/2028/helmikuu/'),/29 päivää/);
 assert.match(periodGuide('/viikkokalenteri/2027/viikko-52/'),/2\.1\.2028/);
 assert.match(periodGuide('/viikkokalenteri/2027/viikko-52/'),/uudenvuodenpäivä/);
 assert.match(periodGuide('/kuukausikalenteri/2030/tammikuu/'),/href="\/kalenteri\/2030\/tammikuu\/"/);
 assert.match(cityGuide('/kuun-nousu-ja-lasku/rovaniemi/2028/'),/href="\/auringonnousu-ja-lasku\/rovaniemi\/2028\/"/);
 assert.equal(periodGuide('/tietosuoja/'),'');
});


test('Finnish holiday lists use singular and plural forms while preserving proper names',()=>{
 const one=periodGuide('/juhlapyhat/2027/tammikuu/');
 assert.match(one,/2 merkintää/);
 assert.match(periodGuide('/kalenteri/2027/tammikuu/'),/Kuukauden pyhäpäiviä ovat/);
 const june=periodGuide('/kalenteri/2027/kesakuu/');
 assert.match(june,/Kuukauden pyhäpäivä on/);
 assert.match(june,/>juhannuspäivä<\/a>/);
 const july=periodGuide('/liputuspaivat/2027/heinakuu/');
 assert.match(july,/1 merkintä\./);
 assert.match(july,/Päivä on/);
 assert.match(july,/>Eino Leinon päivä<\/a>/);
 const feb=periodGuide('/liputuspaivat/2027/helmikuu/');
 assert.match(feb,/>J\. L\. Runebergin päivä<\/a>/);
 assert.match(feb,/>Kalevalan päivä<\/a>/);
 const noPublicHoliday=periodGuide('/juhlapyhat/2027/heinakuu/');
 assert.match(noPublicHoliday,/0 merkintää/);
 assert.doesNotMatch(noPublicHoliday,/Päivä on|Näihin päiviin kuuluvat/);
});


test('Official publisher links stay on the subject explained in the paragraph', () => {
 const mention='<p>Opetushallituksen aineisto selittää päivän taustan ja antaa vinkkejä sen käsittelyyn koulussa.</p>';
 const holocaust=linkEditorialParagraphs(mention,{path:'/juhlapyhat/holokaustin-uhrien-muistopaiva/'});
 assert.match(holocaust,/href="https:\/\/www.oph.fi\/fi\/koulutus-ja-tutkinnot\/holokaustin-uhrien-muistopaiva-271-viettamisen-tapoja-kouluihin"/);
 assert.doesNotMatch(holocaust,/\/tyoajat/);
 assert.match(linkEditorialParagraphs(mention,{path:'/koulujen-lomat/'}),/\/tyoajat/);
 assert.equal(linkEditorialParagraphs(mention,{path:'/vuodenajat/'}),mention);
 const names=linkEditorialParagraphs('<p>Helsingin yliopiston almanakkatoimisto julkaisee nimipäiväkalentereita eri kielillä.</p>',{path:'/nimipaivat/'});
 assert.match(names,/href="https:\/\/almanakka.helsinki.fi\/fi\/nimipaivat"/);
});
