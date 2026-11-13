import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {shareServices} from '../assets/share-services.mjs';
import {safePublicUrl,shareComposer,copyPayload} from '../assets/share-core.mjs';
import {verifyShareIcons} from '../scripts/share-icon-assets.mjs';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const sprite=await fs.readFile(new URL('../assets/share-icons.svg',import.meta.url),'utf8');
const symbols=new Map([...sprite.matchAll(/<symbol\b([^>]*)>([\s\S]*?)<\/symbol>/g)].map(match=>[
  /\bid="([^"]+)"/.exec(match[1])?.[1],{attributes:match[1],body:match[2]}
]));
const attribute=(text,name)=>new RegExp(`\\b${name}="([^"]*)"`).exec(text)?.[1];
const pathData=text=>[...text.matchAll(/<path\b([^>]*)>/g)].map(match=>attribute(match[1],'d'));

test('Every sharing destination has one real, self-contained vector symbol',async()=>{
  assert.equal(shareServices.length,55);
  assert.equal(new Set(shareServices.map(service=>service.id)).size,55);
  assert.equal(symbols.size,55);
  assert.deepEqual(await verifyShareIcons(ROOT),{services:55,symbols:55});
  for(const service of shareServices){
    const symbol=symbols.get('s-'+service.id);
    assert.ok(symbol,service.name+' must resolve by its stable service ID');
    const viewBox=attribute(symbol.attributes,'viewBox')?.trim().split(/\s+/).map(Number);
    assert.equal(viewBox?.length,4,service.name+' viewBox');
    assert.ok(viewBox.every(Number.isFinite)&&viewBox[2]>0&&viewBox[3]>0,service.name+' drawable canvas');
    assert.match(symbol.body,/<(?:path|rect|circle|ellipse|polygon|polyline|line)\b/,service.name+' geometry');
    assert.doesNotMatch(symbol.body,/<(?:text|image|script|foreignObject)\b/i,service.name+' cannot be a letter or bitmap placeholder');
  }
  const ids=[...sprite.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,'Gradient, clip and symbol IDs must be unique throughout the sprite');
  for(const match of sprite.matchAll(/(?:\b(?:xlink:)?href="#([^"\s]+)"|url\(#([^\s)]+)\))/g)){
    assert.ok(ids.includes(match[1]||match[2]),'Unresolved SVG reference '+(match[1]||match[2]));
  }
});

test('Replaced brand symbols retain the reviewed source viewBoxes and original path geometry',async()=>{
  const records=(await Promise.all(['share-root-brands','share-other-brands','share-microsoft-brands','calendar-service-brands'].map(async name=>
    JSON.parse(await fs.readFile(new URL(`../data/${name}.json`,import.meta.url),'utf8'))
  ))).flat();
  const names=['linkedin','qq','slack','teams','outlook','yahoo','raindrop','onenote','band'];
  for(const id of names){
    const record=records.find(item=>item.id===id);
    assert.ok(record,'Reviewed source record for '+id);
    assert.match(record.source,/^https:\/\//,id+' primary reference');
    const local=record.src||(id==='outlook'?'/assets/brands/outlook.svg':`/assets/share-brands/${id}.svg`);
    const bytes=await fs.readFile(path.join(ROOT,local));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256,id+' source checksum');
    const source=bytes.toString('utf8');
    const sourceAttributes=/<svg\b([^>]*)>/.exec(source)?.[1];
    assert.ok(sourceAttributes,id+' original SVG');
    const symbol=symbols.get('s-'+id);
    assert.equal(attribute(symbol.attributes,'viewBox'),attribute(sourceAttributes,'viewBox'),id+' canvas');
    const originalPaths=pathData(source);
    assert.ok(originalPaths.length>0,id+' must have actual logo geometry');
    assert.deepEqual(pathData(symbol.body),originalPaths,id+' paths must not become initials or another service logo');
  }
  assert.notDeepEqual(pathData(symbols.get('s-band').body),pathData(symbols.get('s-naver').body),'BAND and Naver Blog are distinct brand marks');
});

test('The build gate rejects broken destination IDs, duplicate IDs, dangling paint references and letter placeholders',async t=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'kalenteri-share-icons-'));
  t.after(()=>fs.rm(temp,{recursive:true,force:true}));
  await fs.mkdir(path.join(temp,'assets'));
  const file=path.join(temp,'assets/share-icons.svg');
  for(const [name,broken,message]of [
    ['missing destination',sprite.replace('id="s-outlook"','id="s-outlook-removed"'),/Missing or empty.*outlook/],
    ['duplicate symbol',sprite.replace('id="s-outlook"','id="s-teams"'),/Duplicate/],
    ['dangling paint',sprite.replace('</symbol>','<path d="M0 0h1v1z" fill="url(#missing-gradient)"/></symbol>'),/Unresolved/],
    ['letter placeholder',sprite.replace('</symbol>','<text x="12" y="12">O</text></symbol>'),/real vector geometry/]
  ]){
    await t.test(name,async()=>{
      await fs.writeFile(file,broken);
      await assert.rejects(()=>verifyShareIcons(temp),message);
    });
  }
});

test('Outlook and Hacker News composers carry the selected public page and Finnish title exactly',()=>{
  const context={title:'Täysikuu & juhlapäivät 2028',url:safePublicUrl('/kuukalenteri/2028/?city=helsinki&private-note=secret'),image:'https://kalenteri365.fi/assets/social/test.jpg'};
  assert.equal(context.url,'https://kalenteri365.fi/kuukalenteri/2028/?city=helsinki');
  const outlook=new URL(shareComposer(shareServices.find(service=>service.id==='outlook'),context));
  assert.equal(outlook.origin,'https://outlook.live.com');
  assert.equal(outlook.pathname,'/mail/0/deeplink/compose');
  assert.equal(outlook.searchParams.get('subject'),context.title);
  assert.equal(outlook.searchParams.get('body'),context.title+'\n'+context.url);
  const hackernews=new URL(shareComposer(shareServices.find(service=>service.id==='hackernews'),context));
  assert.equal(hackernews.origin,'https://news.ycombinator.com');
  assert.equal(hackernews.pathname,'/submitlink');
  assert.equal(hackernews.searchParams.get('t'),context.title);
  assert.equal(hackernews.searchParams.get('u'),context.url);
});

test('Manual platforms remain copy-and-paste handoffs rather than fabricated publishing endpoints',()=>{
  const context={title:'Suomen juhlapäivät',url:'https://kalenteri365.fi/juhlapyhat/',image:'https://kalenteri365.fi/assets/social/test.jpg'};
  const manual=shareServices.filter(service=>service.method==='manual');
  assert.ok(manual.some(service=>service.id==='ok'));
  assert.ok(manual.some(service=>service.id==='weibo'));
  assert.ok(manual.some(service=>service.id==='onenote'));
  for(const service of manual){
    assert.equal(new URL(service.website).protocol,'https:',service.name+' public website');
    assert.equal(shareComposer(service,context),null,service.name+' has no direct publishing promise');
  }
  assert.equal(copyPayload('copy-text',context),'Suomen juhlapäivät\nhttps://kalenteri365.fi/juhlapyhat/');
});
