import test from 'node:test';
import assert from 'node:assert/strict';
import productionAdPaths from '../functions/advertising-routes.js';
import {advertisingEligible} from '../src/advertising-view.mjs';
import {advertisingCandidate,advertisingCsp,advertisingResponse} from '../src/advertising-csp.mjs';
const original="default-src 'self'; script-src 'self' 'sha256-abc' 'nonce-xyz'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src https://docs.google.com; object-src 'none'; form-action 'self'; frame-ancestors 'none'";
const host='kalenteri365.fi',hosts=[host],paths=new Set(['/']);
test('official creative permissions retain base hashes, nonces and blocked event handlers',()=>{
 const p=advertisingCsp(original);assert.match(p,/https:\/\/bauval.org/);assert.match(p,/'nonce-xyz'/);assert.match(p,/'sha256-abc'/);assert.doesNotMatch(p,/(?:^|;)\s*script-src\s[^;]*unsafe-inline|asiafilm/);assert.match(p,/(?:^|;)\s*script-src\s[^;]*'unsafe-eval'/);const elements=p.split(';').find(v=>v.trim().startsWith('script-src-elem '));assert(elements.includes("'unsafe-inline'"));assert(elements.includes('https://bauval.org'));assert.doesNotMatch(elements,/sha256-|nonce-|unsafe-eval/);assert.match(p,/script-src-attr 'none'/);assert.match(p,/object-src 'none'/);assert.equal(advertisingCsp(null),null);
});
test('private/query/preview/method/error/download responses never gain a provider exception or require body buffering',async()=>{
 for(const [url,method,status,type]of [[`https://${host}/?q=private`,'GET',200,'text/html'],[`https://${host}/private/`,'GET',200,'text/html'],['https://preview.pages.dev/','GET',200,'text/html'],[`https://${host}/`,'POST',200,'text/html'],[`https://${host}/`,'GET',404,'text/html'],[`https://${host}/`,'GET',200,'application/pdf']]){
  const response=new Response('body',{status,headers:{'Content-Type':type,'Content-Security-Policy':original}});response.clone=()=>{throw Error('Private body must not be buffered');};
  const result=await advertisingResponse({request:new Request(url,{method}),next:async()=>response},paths,hosts);assert.equal(result,response);assert.equal(result.headers.get('Content-Security-Policy'),original);
 }
});
test('only successful public HTML actually containing the display slot gains the provider exception',async()=>{
 for(const [body,expected]of [['plain content',false],['<section data-advertising-mode="display-banner" data-advertising-slot></section>',true]]){
  const response=new Response(body,{headers:{'Content-Type':'text/html','Content-Security-Policy':original,'Cache-Control':'public,max-age=0'}});
  const result=await advertisingResponse({request:new Request(`https://${host}/`),next:async()=>response},paths,hosts);assert.equal(result.headers.get('Content-Security-Policy').includes('https://bauval.org'),expected);assert.equal(await result.text(),body);assert.equal(result.headers.get('Cache-Control'),'public,max-age=0');
 }
});
test('the generated public placement inventory is unique and excludes queries/preview hosts/writes',()=>{
 const exact=new Set(productionAdPaths);assert.equal(exact.size,productionAdPaths.length);assert.equal(exact.has('/'),advertisingEligible('/'));
 if(!advertisingEligible('/'))assert.equal(exact.size,0,'Disabled advertising cannot retain eligible production routes');
 for(const path of exact)assert(advertisingEligible(path),path);
 assert.equal(advertisingCandidate(new Request(`https://${host}/`),exact,hosts),advertisingEligible('/'));
 assert(advertisingCandidate(new Request(`https://${host}/`),paths,hosts),'The explicit public fixture still exercises enabled candidate handling');
 assert(!advertisingCandidate(new Request(`https://${host}/?private=note`),exact,hosts));assert(!advertisingCandidate(new Request('https://preview.pages.dev/'),exact,hosts));assert(!advertisingCandidate(new Request(`https://${host}/`,{method:'POST'}),exact,hosts));
});
test('conditional public cache validation keeps the display policy, validators and empty body without buffering',async()=>{
 for(const validator of [{'If-None-Match':'"public-page"'},{'If-Modified-Since':'Tue, 17 Nov 2026 12:00:00 GMT'}]){
  for(const etag of [null,'"public-page"']){
   const headers={'Content-Security-Policy':original,'Cache-Control':'public,max-age=0,must-revalidate'};if(etag)headers.ETag=etag;
   const response=new Response(null,{status:304,headers});response.clone=()=>{throw Error('A cache validation has no body to buffer');};
   const result=await advertisingResponse({request:new Request(`https://${host}/`,{headers:validator}),next:async()=>response},paths,hosts);
   assert.equal(result.status,304);assert.equal(result.body,null);assert.equal(result.headers.get('ETag'),etag);assert.equal(result.headers.get('Cache-Control'),headers['Cache-Control']);assert.equal(result.headers.get('Content-Security-Policy'),advertisingCsp(original));
  }
 }
});
test('a 304 never grants an exception without a conditional request for an exact public production page',async()=>{
 for(const [url,method,headers]of [[`https://${host}/`,'GET',{}],[`https://${host}/`,'GET',{'If-None-Match':'  '}],[`https://${host}/?q=private`,'GET',{'If-None-Match':'"public-page"'}],[`https://${host}/private/`,'GET',{'If-None-Match':'"public-page"'}],['https://preview.pages.dev/','GET',{'If-None-Match':'"public-page"'}],[`https://${host}/`,'HEAD',{'If-None-Match':'"public-page"'}]]){
  const response=new Response(null,{status:304,headers:{'Content-Security-Policy':original}});response.clone=()=>{throw Error('A rejected response must not be buffered');};
  const result=await advertisingResponse({request:new Request(url,{method,headers}),next:async()=>response},paths,hosts);assert.equal(result,response);assert.equal(result.headers.get('Content-Security-Policy'),original);
 }
});
