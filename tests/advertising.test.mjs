import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {consentRecord,validConsent,validUnit,unitForWidth} from '../assets/ad-policy.mjs';
import {advertisingEligible,advertisingSlot} from '../src/advertising-view.mjs';
import {advertisingResponse} from '../src/advertising-csp.mjs';
const productionConfig=JSON.parse(fs.readFileSync(new URL('../data/advertising.json',import.meta.url),'utf8')),config=productionConfig;
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('legacy advertising records reject expired, forged, analytics-only and necessary-only choices',()=>{
 const now=Date.now();assert(validConsent(consentRecord(false,now),now));assert(validConsent(consentRecord(true,now),now));
 for(const record of [null,{version:1,analytics:true,expiresAt:now+1000},{version:1,advertising:'true',expiresAt:now+1000},{version:1,advertising:true,expiresAt:now},{version:1,advertising:true,expiresAt:now+181*86400000}])assert.equal(validConsent(record,now),false);
});
test('retained legacy unit identifiers: only the exact official host, key and supported size can become a tag',()=>{
 for(const unit of [config.desktop,config.mobile])assert(validUnit(unit,config.scriptHosts));
 assert.equal(validUnit({...config.mobile,src:'https://example.com/22/'+config.mobile.key},config.scriptHosts),false);
 assert.equal(validUnit({...config.mobile,src:config.mobile.src+'?private=data'},config.scriptHosts),false);
 assert.equal(validUnit({...config.mobile,width:299},config.scriptHosts),false);
 assert.equal(unitForWidth(728,config),config.desktop);assert.equal(unitForWidth(727,config),config.mobile);assert.equal(unitForWidth(299,config),null);
});

test('the public slot renders a genuine Banner stage rather than an intermediary offer',()=>{const html=advertisingSlot();assert.equal(config.mode,'display-banner');assert.match(html,/data-advertising-stage/);assert.doesNotMatch(html,/data-sponsored-link|sponsored-banner|asiafilm|<a /);});
test('canonical public route classes receive static placement without private query data',()=>{
 for(const path of ['/','/tyokalut/','/musta-perjantai/','/kybermaanantai/','/juhlapyhat/joulu/','/horoskooppi/','/tietosuoja/','/yhteystiedot/','/paivasuunnittelija/','/luo-kalenteri/','/kalenteri/2027/tammikuu/'])assert(advertisingEligible(path),path);
 for(const path of ['/404/','/500/','/assets/test/','/api/x/','/preview/foo/','/tyokalut/?draft=secret','/tyokalut/#draft'])assert.equal(advertisingEligible(path),false,path);
});
test('storage information opens and restores focus without reading storage or requesting an ad',()=>{
 let click,focus=0,requests=0;const nodes=[];
 const element=()=>({append(){},setAttribute(){},addEventListener(type,fn){this[type]=fn;},showModal(){this.open=true;},close(){this.open=false;this.closeEvent?.();},focus(){focus++;},isConnected:true});
 const document={getElementById(){return null;},createElement(tag){const e=element();nodes.push([tag,e]);return e;},body:{append(){}},addEventListener(type,fn){if(type==='click')click=fn;}};
 const context={document,fetch(){requests++;throw Error('No network allowed');},localStorage:{getItem(){throw Error('Do not read legacy consent');}},window:{location:{reload(){throw Error('Do not reload drafts');}}}};
 vm.runInNewContext(read('assets/advertising.mjs').replace(/^import.*$/gm,''),context);const opener=element();click({target:{closest:()=>opener},preventDefault(){}});assert(nodes.find(([t])=>t==='dialog')[1].open);assert(focus>0);assert.equal(requests,0);assert.equal(nodes.some(([t])=>['iframe','script','img'].includes(t)),false);
});
test('provider permissions are scoped to actual public Banner responses and advertising stays out of print',async()=>{assert.doesNotMatch(read('scripts/build.mjs'),/bauval\.org|nresystems\.com|storageimagedisplay\.com/);const css=read('assets/advertising.css');assert.match(css,/@media print/);assert.match(css,/min-height:250px/);assert.match(css,/min-height:90px/);for(const [path,allowed]of [['/',true],['/?private=draft',false]]){const response=await advertisingResponse({request:new Request('https://kalenteri365.fi'+path),next:async()=>new Response(advertisingSlot(),{headers:{'Content-Type':'text/html','Content-Security-Policy':"default-src 'self'; script-src 'self'"}})},new Set(['/']),['kalenteri365.fi']);assert.equal(response.headers.get('Content-Security-Policy').includes('https://bauval.org'),allowed);}});
