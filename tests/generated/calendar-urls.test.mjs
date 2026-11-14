import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {YEARS,SLUGS} from '../../src/calendar.mjs';

const pages=JSON.parse(readFileSync(new URL('../../reports/pages.json',import.meta.url),'utf8'));
test('Every month has one clean canonical address in both sitemaps and internal links',()=>{
  const xml=readFileSync(new URL('../../dist/sitemap.xml',import.meta.url),'utf8');
  const images=readFileSync(new URL('../../dist/sitemap-images.xml',import.meta.url),'utf8');
  for(const year of YEARS)for(const slug of SLUGS){
    const route=`/kalenteri/${year}/${slug}/`,url='https://kalenteri365.fi'+route;
    assert.equal(pages.filter(page=>page.path===route).length,1,route);
    assert.equal(xml.split(`<loc>${url}</loc>`).length-1,1,route);
    assert.equal(images.split(`<loc>${url}</loc>`).length-1,1,route);
    const html=readFileSync(new URL('../../dist'+route+'index.html',import.meta.url),'utf8');
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`),route);
  }
  for(const page of pages){
    const html=readFileSync(new URL('../../dist'+page.path+'index.html',import.meta.url),'utf8');
    assert.doesNotMatch(html,/href="(?:https:\/\/kalenteri365\.fi)?\/kalenteri\/(?:202[7-9]|2030)\/[a-z]+\/\?[^"#]*(?:date|view|year|month)=/,page.path);
  }
});
