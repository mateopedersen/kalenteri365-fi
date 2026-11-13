import test from 'node:test';
import assert from 'node:assert/strict';
import {localInventory,exportLocalData,removeLocalData} from '../assets/privacy-storage-core.mjs';
import {LEGAL_PAGES} from '../src/legal-pages.mjs';
const storage=values=>{const map=new Map(Object.entries(values));return {get length(){return map.size;},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}};
test('Privacy inventory isolates this site and does not render private record content',()=>{
 const local=storage({'kalenteri365-fi-v1':'private note','other-app':'leave alone','kalenteri365-print-favs-v1':'["helsinki"]'}),session=storage({'fi-met-weather-v2-helsinki':'forecast','other-session':'leave alone'});
 const {rows}=localInventory(local,session);assert.equal(rows.length,3);assert(!JSON.stringify(rows).includes('private note'));
 const data=exportLocalData(local,session,new Date('2026-11-13T12:00Z'));assert.equal(data.records.length,3);assert.equal(data.records.find(r=>r.key==='kalenteri365-fi-v1').value,'private note');assert(!data.records.some(r=>r.key==='other-app'));
 assert.equal(removeLocalData(local,session,['preferences']),1);assert.equal(local.getItem('kalenteri365-fi-v1'),'private note');assert.equal(local.getItem('other-app'),'leave alone');
 assert.equal(removeLocalData(local,session,['plans','cache']),2);assert.equal(session.getItem('other-session'),'leave alone');assert.equal(local.getItem('kalenteri365-fi-v1'),null);
});
test('Privacy tools tolerate blocked storage and only erase selected groups',()=>{
 const blocked={getItem(){throw Error('blocked')}};assert.equal(localInventory(blocked,null).unavailable,true);
 const l=storage({'kalenteri365-shifts-fi-v1':'{}','fi-storage-notice-until':'17811'});assert.equal(removeLocalData(l,null,[]),0);assert.equal(removeLocalData(l,null,['unrecognised']),0);assert.equal(l.length,2);
});
test('An explicitly saved vacation can be exported and deleted with personal plans',()=>{
 const local=storage({'kalenteri365-vacation-plan-v1':'{"title":"Kesäloma"}','other-app':'keep'});
 assert.equal(localInventory(local,null).rows[0].name,'Lomasuunnitelma');
 assert.equal(exportLocalData(local,null).records[0].value,'{"title":"Kesäloma"}');
 assert.equal(removeLocalData(local,null,['preferences']),0);
 assert.equal(removeLocalData(local,null,['plans']),1);
 assert.equal(local.getItem('other-app'),'keep');
 assert(LEGAL_PAGES.evasteet.render().includes('kalenteri365-vacation-plan-v1'));
});
test('Legal pages preserve material distinctions rather than claiming universal consent or compliance',()=>{
 for(const record of Object.values(LEGAL_PAGES)){const html=record.render();assert(!html.includes('undefined'));assert(!html.includes('>null<'));assert(!html.includes('100 %'));}
 const privacy=LEGAL_PAGES.tietosuoja.render(),cookies=LEGAL_PAGES.evasteet.render(),terms=LEGAL_PAGES.kayttoehdot.render();
 assert(privacy.includes('kalendars365@gmail.com'));assert(privacy.includes('ETA-alueen ulkopuolella'));assert(privacy.includes('syntymätietojasi'));assert(privacy.includes('tietosuojavaltuutetun'));assert(privacy.includes('13 vuoden'));
 assert(cookies.includes('180 päivää'));assert(cookies.includes('sessionStorage'));assert(cookies.includes('KHO:2026:64'));assert(cookies.includes('KHO:2026:65'));assert(cookies.includes('ei ole suostumus'));assert(terms.includes('pakottavaan lainsäädäntöön'));
 assert(privacy.includes('data-delete-confirm disabled'));assert(cookies.includes('data-privacy-tools'));
});
