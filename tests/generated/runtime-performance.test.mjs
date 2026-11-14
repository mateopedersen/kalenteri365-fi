import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import pages from '../../reports/pages.json' with {type:'json'};

const root=new URL('../../',import.meta.url);
const read=p=>fs.readFile(new URL(p,root),'utf8');
test('Every generated page loads an existing reduced, content-versioned stylesheet and application',async()=>{
  const manifest=JSON.parse(await read('reports/runtime-manifest.json'));
  const styles=new Map(manifest.pageStyles.map(s=>[s.src,s]));
  for(const p of [...pages,{path:'/404/'}]){
    const file=p.path==='/404/'?'dist/404.html':path.join('dist',p.path,'index.html');
    const html=await read(file);
    const css=html.match(/<link rel="stylesheet" href="([^"]+)"/g)||[];
    assert.equal(css.length,1,p.path);
    const src=css[0].match(/href="([^"]+)"/)[1];
    const selected=styles.get(src);
    assert.ok(selected,p.path+' has an unknown stylesheet');
    assert.ok(selected.bytes<manifest.stylesheet.after*.5,p.path+' loads unrelated page styles');
    assert.ok(html.includes(`<link rel="modulepreload" href="${manifest.script}">`),p.path);
    assert.ok(html.includes(`<script type="module" src="${manifest.script}">`),p.path);
    if(html.includes('id="astro-form"'))assert.ok(html.includes('href="/assets/astronomy.min.js" as="script"'),p.path);
  }
  for(const style of styles.values())assert.equal((await fs.stat(new URL('dist'+style.src,root))).size,style.bytes);
});

test('Home Moon thumbnail uses its small texture while large lunar and print assets remain available',async()=>{
  const manifest=JSON.parse(await read('reports/runtime-manifest.json'));
  const edition=Object.keys(manifest.outputs).find(k=>manifest.outputs[k].entry==='edition-ui.mjs');
  assert.ok(edition);
  const script=await read('dist/assets/'+edition);
  assert.ok(script.includes('/assets/photos/moon-phase-texture.webp'));
  const small=(await fs.stat(new URL('dist/assets/photos/moon-phase-texture.webp',root))).size;
  const original=(await fs.stat(new URL('dist/assets/photos/moon-surface.jpg',root))).size;
  assert.ok(small<original*.2);
});
