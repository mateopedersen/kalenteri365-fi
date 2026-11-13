import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import {favicons} from '../scripts/favicons.mjs';
import {siteIconLinks,ICO_SIZES,PNG_SIZES} from '../src/site-icons.mjs';
import {inspectICO,crawlerAllowed,auditFavicons} from '../scripts/audit-favicons.mjs';

test('Generated favicon files decode at their declared sizes, including 256px ICO entry',async t=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'kalenteri-favicons-'));
  t.after(()=>fs.rm(temp,{recursive:true,force:true}));
  const out=path.join(temp,'assets');await favicons(out);
  for(const size of PNG_SIZES){
    const bytes=await fs.readFile(path.join(out,`icon-${size}.png`)),meta=await sharp(bytes).metadata();
    assert.equal(meta.format,'png');assert.equal(meta.width,size);assert.equal(meta.height,size);
    assert.ok(meta.hasAlpha,'Rounded icon must preserve transparent corners');
  }
  const ico=await fs.readFile(path.join(temp,'favicon.ico')),entries=await inspectICO(ico);
  assert.deepEqual(entries.map(entry=>entry.width),ICO_SIZES);
  assert.equal(ico[6+16*4],0,'ICO uses a zero width byte for 256 pixels');
  assert.equal(ico[6+16*4+1],0,'ICO uses a zero height byte for 256 pixels');
  assert.equal(entries.at(-1).offset+entries.at(-1).bytes,ico.length);
  const source=await fs.readFile(new URL('../assets/favicon.svg',import.meta.url));
  assert.deepEqual(await fs.readFile(path.join(out,'icon.svg')),source);
  const manifest=JSON.parse(await fs.readFile(path.join(temp,'site.webmanifest'),'utf8'));
  assert.equal(manifest.name,'Kalenteri365');assert.equal(manifest.lang,'fi-FI');
  assert.equal(manifest.start_url,'/');assert.equal(manifest.scope,'/');
  assert.deepEqual(manifest.icons.map(icon=>icon.sizes),['192x192','512x512']);
  for(const icon of manifest.icons){
    assert.equal(icon.purpose,'any','Do not label the rounded illustration maskable');
    assert.equal(icon.type,'image/png');
    await fs.access(path.join(temp,icon.src.replace(/^\/assets\//,'assets/')));
  }
  const wrongOffset=Buffer.from(ico);wrongOffset.writeUInt32LE(0,18);
  await assert.rejects(()=>inspectICO(wrongOffset),/range/);
  const wrongDimensions=Buffer.from(ico);wrongDimensions[6]=24;
  await assert.rejects(()=>inspectICO(wrongDimensions),/dimensions/);
  await assert.rejects(()=>inspectICO(ico.subarray(0,ico.length-1)),/range/);
});

test('One stable head declaration serves browser, crawler and Apple icon discovery',()=>{
  const links=siteIconLinks();
  assert.equal((links.match(/rel="icon"/g)||[]).length,3);
  for(const href of ['/favicon.ico','/assets/icon-96.png','/assets/icon.svg','/assets/icon-180.png','/site.webmanifest'])assert.equal(links.split(`href="${href}"`).length,2,href);
  assert.match(links,/type="image\/png" sizes="96x96"/);
  assert.match(links,/type="image\/svg\+xml" sizes="any"/);
  assert.match(links,/rel="apple-touch-icon"[^>]*sizes="180x180"/);
});

test('Crawler checks detect specific bot blocks and honor narrower allow rules',()=>{
  const robots='User-agent: *\nDisallow: /assets/\nAllow: /assets/icon-\nUser-agent: bingbot\nDisallow: /favicon.ico\n';
  assert.equal(crawlerAllowed(robots,'/assets/icon-96.png','Googlebot-Image'),true);
  assert.equal(crawlerAllowed(robots,'/assets/photo.png','Googlebot-Image'),false);
  assert.equal(crawlerAllowed(robots,'/favicon.ico','bingbot'),false);
  assert.equal(crawlerAllowed(robots,'/favicon.ico','Googlebot'),true);
  assert.equal(crawlerAllowed('User-agent: other-bot\nDisallow: /\n','/favicon.ico','Googlebot'),true);
});

test('Audit finds missing page declarations and a favicon-only noindex response',async t=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'kalenteri-favicon-audit-'));
  t.after(()=>fs.rm(temp,{recursive:true,force:true}));
  await fs.mkdir(path.join(temp,'reports'),{recursive:true});
  await fs.mkdir(path.join(temp,'dist'),{recursive:true});
  await favicons(path.join(temp,'dist/assets'));
  await fs.writeFile(path.join(temp,'reports/pages.json'),JSON.stringify([{path:'/'}]));
  const html=`<!doctype html><html><head>${siteIconLinks()}</head><body></body></html>`;
  await fs.writeFile(path.join(temp,'dist/index.html'),html);
  await fs.writeFile(path.join(temp,'dist/404.html'),html);
  await fs.writeFile(path.join(temp,'dist/robots.txt'),'User-agent: *\nAllow: /\n');
  await fs.writeFile(path.join(temp,'dist/_headers'),'/kalenteriin/*\n  X-Robots-Tag: noindex\n');
  assert.deepEqual((await auditFavicons(temp)).failures,[]);
  await fs.writeFile(path.join(temp,'dist/404.html'),html.replace(/<link rel="manifest"[^>]*>/,''));
  await fs.appendFile(path.join(temp,'dist/_headers'),'/assets/icon-*\n  X-Robots-Tag: noindex\n');
  const broken=await auditFavicons(temp);
  assert.ok(broken.failures.some(failure=>failure.route==='/404/'&&failure.check.includes('site.webmanifest')));
  assert.ok(broken.failures.some(failure=>failure.route==='/assets/icon-96.png'&&failure.check==='No applicable noindex response header'));
});
