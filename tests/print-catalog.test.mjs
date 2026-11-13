import test from 'node:test';import assert from 'node:assert/strict';
import {printCatalogFilter,printStem,printCard} from '../assets/print-catalog-core.mjs';
import {PRINT_STYLES,printCatalogPage} from '../src/print-catalog-view.mjs';
test('Print catalog keeps the real 15 design identities and year/month file names',()=>{
 assert.equal(PRINT_STYLES.length,15);assert.equal(new Set(PRINT_STYLES.map(s=>s.id)).size,15);
 assert.equal(printStem(2028,0,'metsä'),'kalenteri-2028-metsä');assert.equal(printStem(2028,2,'suomi'),'kalenteri-2028-02-suomi');
 for(const s of PRINT_STYLES){const html=printCard(s,{year:2028,month:2,monthName:'Helmikuu'});assert(html.includes(printStem(2028,2,s.id)+'.pdf'));assert(html.includes(printStem(2028,2,s.id)+'.webp'));assert(html.includes('download'));assert(html.includes('alt='));}
});
test('Print filters combine text, orientation, ink and saved styles correctly',()=>{
 assert(printCatalogFilter(PRINT_STYLES,{query:'metsa'}).some(s=>s.id==='metsä'));
 assert.equal(printCatalogFilter(PRINT_STYLES,{kind:'ink'}).length,1);
 assert.equal(printCatalogFilter(PRINT_STYLES,{kind:'ink',orientation:'portrait'}).length,0);
 assert.equal(printCatalogFilter(PRINT_STYLES,{savedOnly:true,saved:['helsinki']})[0].id,'helsinki');
 assert.equal(printCatalogFilter(PRINT_STYLES,{query:'NO SUCH STYLE'}).length,0);
});
test('Print hub groups all four years before individual templates and retains useful direct month links',()=>{
 const html=printCatalogPage();assert.equal((html.match(/class="print-year-category"/g)||[]).length,4);assert.equal((html.match(/class="print-design"/g)||[]).length,0);
 for(const year of [2027,2028,2029,2030])assert(html.includes(`/pdf-kalenteri/${year}/joulukuu/`));
 const yearly=printCatalogPage({year:2029});assert.equal((yearly.match(/class="print-design"/g)||[]).length,15);assert(!yearly.includes('undefined'));assert(yearly.includes('Kalenteri365™'));assert(yearly.includes('data-preview-pdf href="/lataukset/kalenteri-2029-suomi.pdf"'));
 const monthly=printCatalogPage({year:2030,month:12});assert(monthly.includes('Joulukuu 2030'));assert(monthly.includes('kalenteri-2030-12-suomi.pdf'));
});
