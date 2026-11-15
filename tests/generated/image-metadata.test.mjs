import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import pages from '../../reports/pages.json' with {type:'json'};
import photos from '../../data/photo-credits.json' with {type:'json'};

function images(value){
  if(!value||typeof value!=='object')return [];
  return [...(value['@type']==='ImageObject'?[value]:[]),...Object.values(value).flatMap(images)];
}

test('all generated image metadata carries source-specific rights without invented anonymous authors',async()=>{
  const anonymous=new Set(photos.filter(photo=>!photo.author?.trim()).map(photo=>'https://kalenteri365.fi'+photo.src));
  let checked=0;
  for(const page of pages){
    const html=await fs.readFile(new URL('../../dist/'+page.path.replace(/^\//,'')+'index.html',import.meta.url),'utf8');
    for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
      for(const image of images(JSON.parse(match[1]))){
        const label=page.path+' '+image.contentUrl;
        for(const key of ['contentUrl','license','acquireLicensePage'])assert.match(image[key]||'',/^https:\/\//,label+' '+key);
        for(const key of ['creditText','copyrightNotice'])assert.ok(image[key]?.trim(),label+' '+key);
        if(!anonymous.has(image.contentUrl))assert.ok(image.creator?.name?.trim(),label+' creator');
        else assert.equal(image.creator,undefined,label+' anonymous original');
        checked++;
      }
    }
  }
  assert.ok(checked>=pages.length,'Every page must retain its primary social image');
});
