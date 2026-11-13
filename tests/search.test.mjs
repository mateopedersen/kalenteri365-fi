import test from 'node:test';import assert from 'node:assert/strict';import {searchPages,searchCatalog,POPULAR_SEARCHES}from'../src/search.mjs';
const pages=[{path:'/juhlapyhat/juhannuspaiva/',title:'Juhannuspäivä',description:'Juhannus ja Suomen lipun päivä',keywords:'2027 2028 2029 2030 kesäkuu lauantai'},{path:'/koulujen-lomat/helsinki/',title:'Helsinki | Koulujen lomat',description:'Perusopetuksen ajat',keywords:'2027 talviloma helmikuu'},{path:'/tyokalut/',title:'Suunnittelutyökalut',description:'Arjen työkalut'}];
test('Finnish search finds short prefixes, inflected long questions and body-only years',()=>{assert.equal(searchPages(pages,'juh').at(0).path,pages[0].path);assert.equal(searchPages(pages,'Milloin on juhannus Suomessa 2028?').at(0).path,pages[0].path);assert.equal(searchPages(pages,'Milloin on juhannuksena 2028').at(0).path,pages[0].path);assert.equal(searchPages(pages,'Helsingin koulujen talviloma 2027').at(0)?.path,pages[1].path);assert.deepEqual(searchPages(pages,'zzzqx'),[]);});
test('Search ranks the requested month/year above incidental shared navigation words',()=>{
 const sample=[{path:'/pdf-kalenteri/2028/helmikuu/',title:'Helmikuu 2028 PDF-kalenteri',description:'Tulostettava helmikuun kalenteri',group:'pdf-kalenteri'},
 {path:'/pdf-kalenteri/2028/joulukuu/',title:'Joulukuu 2028 PDF-kalenteri',keywords:'helmikuu',group:'pdf-kalenteri'},
 {path:'/pdf-kalenteri/2029/helmikuu/',title:'Helmikuu 2029 PDF-kalenteri',keywords:'2028',group:'pdf-kalenteri'}];
 const result=searchCatalog(sample,'helmikuu2028 PDF');assert.equal(result.total,1);assert.equal(result.items[0].path,sample[0].path);
});
test('Search handles short forms, typos, diacritics and an omitted apostrophe without executing query HTML',()=>{
 const sample=[{path:'/horoskooppi/vaaka/',title:'Vaaka | Päivän horoskooppi',group:'horoskooppi'}, {path:'/kalenteri/2028/',title:'Kalenteri 2028',group:'kalenteri'}];
 assert.equal(searchPages(sample,'vaa’an horoskooppi')[0].path,sample[0].path);assert.equal(searchPages(sample,'kalneteri 2028')[0].path,sample[1].path);
 assert.deepEqual(searchPages(sample,'zzzzxqww'),[]);assert.deepEqual(searchPages(sample,'<script>alert(document.cookie)</script>'),[]);
});
test('Date search validates leap days and sends readers to the actual selected day',()=>{
 const result=searchCatalog([], '29.02.2028');assert.equal(result.items[0].path,'/?year=2028&month=2&date=2028-02-29&view=day');
 assert.equal(searchCatalog([],'2028-02-29').items[0].path,result.items[0].path);assert.equal(searchCatalog([],'29.2.2027').invalidDate,true);assert.equal(searchCatalog([],'31.11.2027').total,0);
});
test('Search offers all matching pages progressively and keeps public noindex reference pages findable internally',()=>{
 const sample=Array.from({length:20},(_,i)=>({path:'/guide/'+i+'/',title:'Testiaihe '+i}));
 assert.equal(searchCatalog(sample,'Testiaihe',{limit:8}).items.length,8);assert.equal(searchCatalog(sample,'Testiaihe',{limit:8}).total,20);assert.equal(searchCatalog(sample,'Testiaihe',{limit:20}).items.length,20);
 assert.equal(searchPages([{path:'/valokuvat-ja-lisenssit/',title:'Valokuvat ja lisenssit',indexable:false}],'lisenssit').length,1);
 assert.equal(new Set(POPULAR_SEARCHES.map(p=>p.path)).size,POPULAR_SEARCHES.length);
});
test('A short topic prefix gives useful categories, and a named school query excludes unrelated print layouts',()=>{
 const sample=[{path:'/koulujen-lomat/',title:'Koulujen lomat',group:'koulujen-lomat'},
 {path:'/koulujen-lomat/helsinki/',title:'Helsinki | Koulujen lomat',keywords:'talviloma 2027',group:'koulujen-lomat'},
 {path:'/pdf-kalenteri/',title:'PDF-kalenterit',keywords:'helsinki koulu talviloma 2027',group:'pdf-kalenteri'}];
 assert.equal(searchCatalog(sample,'k').shortQuery,true);assert.equal(searchPages(sample,'Helsinki koulu talviloma 2027').length,1);
 assert.equal(searchPages(sample,'Helsinki koulu talviloma 2027')[0].path,'/koulujen-lomat/helsinki/');
});
