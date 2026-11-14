import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tools} from '../../src/ui.mjs';
import {PRACTICAL_EXAMPLES} from '../../src/practical-examples.mjs';

test('All 49 generated tool pages show guidance after the H1 without repeating the example',()=>{
  for(const [slug] of tools){
    const html=readFileSync(new URL(`../../dist/${slug}/index.html`,import.meta.url),'utf8');
    const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
    const marker=`data-tool-introduction="${slug}"`;
    assert.equal(main.split(marker).length-1,1,slug);
    assert.ok(main.indexOf('<h1')<main.indexOf(marker),slug+' guidance precedes H1');
    const text=PRACTICAL_EXAMPLES[slug][1][0];
    assert.equal(main.split(text).length-1,1,slug+' repeats its example');
    assert.ok(!main.includes('lorem ipsum'),slug);
  }
});
