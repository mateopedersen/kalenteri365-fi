import test from 'node:test';
import assert from 'node:assert/strict';
import {contentDestinations,deduplicateEditorialLinks} from '../src/content-dedup.mjs';
import {relatedTopics} from '../src/related-view.mjs';
import {periodGuide} from '../src/period-guide.mjs';
test('Prose links occur once per destination; independent controls and text survive',()=>{
 const input='<a class="btn" href="/foo/">Avaa</a><p><a data-editorial-link href="/foo/">Ohje</a> sekä <a data-editorial-link href="/bar/">Bar</a>.</p><p><a data-editorial-link href="/bar/">Sama kohde</a></p><a href="/foo/">Valikon kohde</a>';
 assert.equal(deduplicateEditorialLinks(input,'/current/'),'<a class="btn" href="/foo/">Avaa</a><p><a data-editorial-link href="/foo/">Ohje</a> sekä <a data-editorial-link href="/bar/">Bar</a>.</p><p>Sama kohde</p><a href="/foo/">Valikon kohde</a>');
});
test('Parameters and separate external source documents are preserved',()=>{
 const html='<p><a data-editorial-link href="/calc/?start=1&amp;end=2">A</a><a data-editorial-link href="/calc/?start=3">B</a><a data-editorial-link href="https://a.test/source">C</a></p>';
 assert.equal(deduplicateEditorialLinks(html,'/calc/'),html);
 assert.ok(contentDestinations(html).has('/calc/?start=1&end=2'));
});
test('Recommendations omit destinations already offered in page content',()=>{
 const html=relatedTopics('/kalenteri/2028/helmikuu/',{exclude:new Set(['/pdf-kalenteri/2028/helmikuu/','/juhlapyhat/2028/helmikuu/'])});
 assert.doesNotMatch(html,/href="\/pdf-kalenteri/);
 assert.match(html,/href="\/viikkokalenteri\/2028\//);
 assert.equal(relatedTopics('/kalenteri/2028/helmikuu/',{exclude:new Set(['/pdf-kalenteri/2028/helmikuu/','/juhlapyhat/2028/helmikuu/','/viikkokalenteri/2028/'])}),'');
});
test('Week prose links calculator to the actual week rather than generic hub',()=>{
 assert.match(periodGuide('/viikkokalenteri/2028/viikko-10/'),/start=2028-03-06&amp;end=2028-03-10/);
});

test('Flag-day cards describe their subject rather than repeating the classification badge',async()=>{
 const {holidaySummary}=await import('../src/holiday-summaries.mjs');
 const summaries=['kalevalan-paiva','minna-canthin-paiva','agricolan-paiva','veteraanipaiva','eurooppa-paiva','snellmanin-paiva','lippujuhlan-paiva','eino-leinon-paiva','miina-sillanpaan-paiva','aleksis-kiven-paiva','ykn-paiva','ruotsalaisuuden-paiva','lapsen-oikeuksien-paiva','sibeliuksen-paiva'].map(slug=>holidaySummary({slug}));
 assert.equal(new Set(summaries).size,14);
 for(const summary of summaries){assert.ok(summary.length>65);assert.doesNotMatch(summary,/on suomalaisen kalenterin liputuspäivä/);}
});
