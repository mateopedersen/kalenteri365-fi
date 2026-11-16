import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('Finnish shopping URLs replace English canonicals and retain permanent redirects',()=>{
 const root=new URL('../../dist/',import.meta.url);
 const xml=readFileSync(new URL('sitemap.xml',root),'utf8');
 const redirects=readFileSync(new URL('_redirects',root),'utf8');
 for(const [old,local] of [['black-friday','musta-perjantai'],['cyber-monday','kybermaanantai']]){
  const canonical='https://kalenteri365.fi/'+local+'/';
  assert.equal(xml.split('<loc>'+canonical+'</loc>').length-1,1);
  assert.ok(!xml.includes('<loc>https://kalenteri365.fi/'+old+'/</loc>'));
  assert.ok(readFileSync(new URL(local+'/index.html',root),'utf8').includes('<link rel="canonical" href="'+canonical+'">'));
  assert.ok(redirects.includes('/'+old+' /'+local+'/ 301'));
  assert.ok(redirects.includes('/'+old+'/* /'+local+'/:splat 301'));
  assert.ok(redirects.includes('/assets/shopping/'+old+'-* /assets/shopping/'+local+'-:splat 301'));
 }
 const pages=JSON.parse(readFileSync(new URL('../../reports/pages.json',import.meta.url),'utf8'));
 for(const page of pages){
  const html=readFileSync(new URL('.'+page.path+'index.html',root),'utf8');
  assert.doesNotMatch(html,/href="(?:https:\/\/kalenteri365\.fi)?\/(?:black-friday|cyber-monday)(?:\/|")/,page.path);
 }
});
