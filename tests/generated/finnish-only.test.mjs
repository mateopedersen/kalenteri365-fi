import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access,readdir} from 'node:fs/promises';

const out=new URL('../../dist/',import.meta.url);
const json=async file=>JSON.parse(await readFile(new URL(file,out),'utf8'));
const retiredURL=/^(?:https?:\/\/kalenteri365\.fi)?\/sv(?:\/|$)/i;

test('the Finnish catalog, search and discovery files contain no retired language pages',async()=>{
  const pages=JSON.parse(await readFile(new URL('../../reports/pages.json',import.meta.url),'utf8'));
  const search=await json('assets/search.json'),social=await json('assets/social/manifest.json');
  assert.ok(pages.length>=1200,'audit the complete generated catalog');
  for(const page of pages){assert.equal(page.locale,'fi',page.path);assert.ok(!retiredURL.test(page.path),page.path);}
  for(const page of search)assert.ok(!retiredURL.test(page.path),page.path);
  for(const image of social.images){assert.equal(image.locale,'fi',image.route);assert.ok(!retiredURL.test(image.route),image.route);}
  for(const file of ['sitemap.xml','sitemap-images.xml']){
    const text=await readFile(new URL(file,out),'utf8');
    assert.doesNotMatch(text,/https:\/\/kalenteri365\.fi\/sv(?:\/|<)/i,file);
  }
  await assert.rejects(access(new URL('sv/',out)),{code:'ENOENT'});
  await assert.rejects(access(new URL('assets/sv-core.mjs',out)),{code:'ENOENT'});
  assert.ok(!(await readdir(new URL('assets/social/',out))).some(file=>/^sv-.*\.jpg$/.test(file)));
});

test('all rendered pages and the 404 omit the Swedish switcher and language alternatives',async()=>{
  const pages=JSON.parse(await readFile(new URL('../../reports/pages.json',import.meta.url),'utf8'));
  for(const file of [...pages.map(p=>p.path.slice(1)+'index.html'),'404.html']){
    const html=await readFile(new URL(file,out),'utf8');
    assert.match(html,/<html lang="fi">/,file);
    assert.doesNotMatch(html,/hreflang="sv(?:-FI)?"|lang="sv"|På svenska/i,file);
    for(const match of html.matchAll(/(?:href|src)="([^"#?]+)/g))assert.ok(!retiredURL.test(match[1]),file+' → '+match[1]);
  }
});
