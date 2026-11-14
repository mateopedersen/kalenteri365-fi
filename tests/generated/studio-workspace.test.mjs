import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('calendar maker and blank maker have one heading and complete template previews',async()=>{
  for(const route of ['luo-kalenteri','tyhja-kalenteri']){
    const html=await readFile(new URL(`../../dist/${route}/index.html`,import.meta.url),'utf8');
    assert.equal((html.match(/<h1\b/g)||[]).length,1,route+' must have one main heading');
    const sources=[...html.matchAll(/src="(\/assets\/studio\/templates\/[^"?]+\.svg)"/g)].map(m=>m[1]);
    assert.equal(new Set(sources).size,16);
    for(const source of sources){
      const svg=await readFile(new URL('../../dist'+source,import.meta.url),'utf8');
      assert.match(svg,/<svg\b/);
      assert.match(svg,/Kalenteri365/);
      assert.doesNotMatch(svg,/NaN|undefined/);
    }
  }
});
