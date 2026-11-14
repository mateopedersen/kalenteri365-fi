import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pageURL, pageSitemap, discoverImages, writeSitemaps} from '../scripts/sitemaps.mjs';

test('only canonical indexable pages enter the XML, with escaped URLs and no fabricated dates', () => {
  const {urls, xml} = pageSitemap([
    {path:'/kalenteri/2028/', indexable:true}, {path:'/', indexable:true},
    {path:'/a&b/', indexable:true}, {path:'/valokuvat-ja-lisenssit/', indexable:false},
    {path:'/404/', indexable:false},
  ]);
  assert.equal(urls.length, 3);
  assert.equal(urls[0], 'https://kalenteri365.fi/');
  assert.match(xml, /a&amp;b/);
  assert.doesNotMatch(xml, /valokuvat|404|lastmod|priority|changefreq/);
  for (const route of ['//other.example/','/a/?year=2028','/a/#section','/a/../b/','/%2e%2e/','/a%2fb/','/a\\b/','/a b/','/missing-slash']) {
    assert.throws(() => pageURL(route), undefined, route);
  }
  assert.throws(() => pageSitemap([{path:'/',indexable:true},{path:'/',indexable:true}]), /Duplicate/);
  assert.throws(() => pageSitemap([]), /1–50,000/);
  assert.throws(() => pageSitemap(Array.from({length:50001}, (_, i) => ({path:`/page-${i}/`,indexable:true}))), /1–50,000/);
});

test('image discovery resolves responsive crops to originals, deduplicates and retains download versioning', () => {
  const photos = [{src:'/assets/photos/helsinki.webp',kind:'city'}, {src:'/assets/photos/helsinki-night.webp',kind:'city-night'}];
  const html = '<img alt="Helsinki" src="/assets/photos/helsinki-320.webp"><img src="/assets/photos/helsinki-640.webp" alt="Helsinki">' +
    '<img alt="Vuodenaika" src="/assets/seasons/spring-720.avif"><img src="/lataukset/calendar-preview.webp?v=old" alt="Kalenteri">' +
    '<img src="/assets/art/logo.svg" alt="Logo"><img src="/assets/photos/decorative.webp" alt="">';
  assert.deepEqual(discoverImages(html, {path:'/',social:{src:'/assets/social/home.jpg'}}, photos, 'new'), [
    '/assets/photos/helsinki-night.webp','/assets/photos/helsinki.webp','/assets/seasons/spring-1200.webp',
    '/assets/social/home.jpg','/lataukset/calendar.webp?v=new',
  ]);
});

test('the build fails before replacing sitemaps when an included page or image cannot be indexed', async t => {
  const out = await fs.mkdtemp(path.join(os.tmpdir(),'kalenteri-sitemaps-'));
  t.after(() => fs.rm(out,{recursive:true,force:true}));
  const pages = [{path:'/',indexable:true,social:{src:'/assets/social/home.jpg'}}, {path:'/private/',indexable:false}];
  await fs.mkdir(path.join(out,'assets/social'),{recursive:true});
  await fs.writeFile(path.join(out,'assets/social/home.jpg'),'image fixture');
  await fs.mkdir(path.join(out,'lataukset'));
  await fs.writeFile(path.join(out,'lataukset/metsä.webp'),'image fixture');
  const valid = '<link href="https://kalenteri365.fi/" rel="canonical"><meta name="robots" content="index,follow">';
  await fs.writeFile(path.join(out,'index.html'),valid);
  const result = await writeSitemaps({out,pages});
  assert.deepEqual(result, {pages:1,imagePages:1,images:1,uniqueImages:1});
  const xml = await fs.readFile(path.join(out,'sitemap.xml'),'utf8');
  const index = await fs.readFile(path.join(out,'sitemap-index.xml'),'utf8');
  assert.match(index, /sitemapindex/);
  assert.match(index, /sitemap-images\.xml/);
  assert.match(await fs.readFile(path.join(out,'robots.txt'),'utf8'), /Sitemap: https:\/\/kalenteri365.fi\/sitemap-index\.xml/);
  await fs.writeFile(path.join(out,'index.html'), valid + '<img src="/lataukset/metsä-preview.webp" alt="Metsäkalenteri">');
  await writeSitemaps({out,pages,downloadVersion:'new'});
  assert.match(await fs.readFile(path.join(out,'sitemap-images.xml'),'utf8'), /mets%C3%A4\.webp\?v=new/);
  await fs.writeFile(path.join(out,'index.html'),valid.replace('index,follow','noindex,follow'));
  await assert.rejects(writeSitemaps({out,pages}), /Noindex/);
  assert.equal(await fs.readFile(path.join(out,'sitemap.xml'),'utf8'),xml);
  await fs.writeFile(path.join(out,'index.html'),valid.replace('https://kalenteri365.fi/','https://kalenteri365.fi/other/'));
  await assert.rejects(writeSitemaps({out,pages}), /canonical mismatch/);
  await fs.writeFile(path.join(out,'index.html'),valid);
  await fs.unlink(path.join(out,'assets/social/home.jpg'));
  await assert.rejects(writeSitemaps({out,pages}), /ENOENT/);
});
