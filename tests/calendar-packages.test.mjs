import test from 'node:test';import assert from 'node:assert/strict';
import {packageManifest as manifest,calendarStyles} from '../src/calendar-package-catalog.mjs';
import {printCatalogFilter,printCard} from '../assets/print-catalog-core.mjs';
import {printCatalogPage} from '../src/print-catalog-view.mjs';
test('All 52 supplied collections contain exactly 15 correctly sized source-bound file pairs',()=>{
 assert.equal(manifest.packages.length,17);assert.equal(manifest.calendars.length,780);
 assert.equal(new Set(manifest.calendars.map(c=>c.stem)).size,780);
 assert.equal(new Set(manifest.calendars.map(c=>c.pdf.sha256)).size,780);
 assert.equal(new Set(manifest.calendars.map(c=>c.image.sha256)).size,780);
 for(const year of [2027,2028,2029,2030])for(let month=0;month<=12;month++){
  const styles=calendarStyles(year,month);assert.equal(styles.length,15);assert.equal(new Set(styles.map(s=>s.id)).size,15);
  for(const s of styles){assert.deepEqual([s.width,s.height],s.orientation==='landscape'?[7016,4961]:[4961,7016]);}
 }
 for(const c of manifest.calendars){assert.match(c.pdf.sha256,/^[a-f0-9]{64}$/);assert.match(c.image.sha256,/^[a-f0-9]{64}$/);assert.equal(c.dpi,600);assert(c.pdf.entry.endsWith('.pdf'));assert(c.image.entry.endsWith('.webp'));}
});
test('Yearly and monthly cards describe the actual supplied designs and orientation',()=>{
 assert.equal(calendarStyles(2028,0)[0].name,'Sinivalkoinen vuosi');
 assert.equal(calendarStyles(2028,2)[0].name,'Suuri kuukausi');
 assert.equal(calendarStyles(2028,0)[3].name,'Revontulet');
 assert.equal(calendarStyles(2028,2)[3].name,'Päiväkirja');
 assert.equal(printCatalogFilter(calendarStyles(2028,2),{kind:'ink'}).length,0);
 const page=printCatalogPage({year:2028,month:2});assert(page.includes('Perheen kalenteri'));assert(!page.includes('Helsingin siluetti'));assert(!page.includes('<option value="ink">'));
});
test('Dynamic previews and downloads retain a package version after filtering',()=>{
 const s=calendarStyles(2030,12)[0],html=printCard(s,{year:2030,month:12,monthName:'Joulukuu',version:manifest.version});
 for(const extension of ['.pdf','.webp','-preview.webp'])assert(html.includes(extension+'?v='+manifest.version));
 assert(printCatalogPage({year:2030,month:12}).includes('"version":"'+manifest.version+'"'));
});
