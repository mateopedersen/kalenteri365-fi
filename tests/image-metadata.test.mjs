import test from 'node:test';
import assert from 'node:assert/strict';
import photos from '../data/photo-credits.json' with {type:'json'};
import {photoImageSchema,socialImageSchema,illustrationImageSchema} from '../src/image-metadata.mjs';

test('photographs retain their documented author, licence and original source',()=>{
  for(const photo of photos){
    const image=photoImageSchema(photo);
    assert.equal(image.contentUrl,'https://kalenteri365.fi'+photo.src);
    assert.equal(image.creator?.name,photo.author?.trim()||undefined);
    assert.equal(image.isBasedOn,photo.source);
    assert.equal(image.acquireLicensePage,photo.source);
    assert.ok(image.copyrightNotice.includes(photo.license));
    assert.ok(image.creditText.trim());
    assert.match(image.license,/^https:\/\//);
    if(photo.license==='Public domain')assert.doesNotMatch(image.copyrightNotice,/©|CC0/);
    if(!photo.author)assert.equal(image.creator,undefined,'Do not invent the author of an anonymous original');
  }
});

test('social composition and original photo rights stay separate',()=>{
  const source=photos.find(p=>p.id==='moon-full');
  const image=socialImageSchema({src:'/assets/social/moon.jpg',alt:'Kuu',sources:[source]});
  assert.equal(image.creator.name,'Kalenteri365');
  assert.equal(image.isBasedOn[0].creator.name,'Gregory H. Revera');
  assert.equal(image.isBasedOn[0].license,source.licenseUrl);
  assert.match(image.copyrightNotice,/CC BY-SA 3.0/);
  assert.match(image.license,/#jakokuvat$/);
  assert.equal(socialImageSchema({}),null);
});

test('featured Kalevala photograph credits its photographer separately from the original artist',()=>{
  const photo=photos.find(p=>p.applicableSlugs?.includes('kalevalan-paiva'));
  const image=photoImageSchema(photo);
  assert.equal(image.creator.name,'Jukka Paavola');
  assert.equal(image.license,'https://creativecommons.org/licenses/by-sa/4.0/');
  assert.match(image.creditText,/Akseli Gallen-Kallela/);
  assert.match(image.creditText,/Gallen-Kallelan museo/);
  assert.match(image.isBasedOn,/Koru-Kalevala_Sampolaiva/);
  const archive=photos.find(p=>p.src==='/assets/photos/holiday-kalevala.webp');
  assert.equal(archive.retiredFromFeaturedUse,true);
  assert.equal(photoImageSchema(archive).creator,undefined);
  assert.equal(archive.applicableSlugs,undefined);
});

test('an individual photographer stays a person when their credit also names an agency',()=>{
  assert.equal(photoImageSchema(photos.find(photo=>photo.author==='Stephen Ausmus, USDA ARS')).creator['@type'],'Person');
  assert.equal(photoImageSchema(photos.find(photo=>photo.author==='NASA · Apollo 17')).creator['@type'],'Organization');
});

test('digital illustration metadata describes the project and its actual terms',()=>{
  const image=illustrationImageSchema({src:'/assets/seasons/kesa-2027-1200.webp',alt:'Kesä'});
  assert.equal(image.creator.name,'Kalenteri365');
  assert.match(image.license,/#vuodenaikojen-kuvitus$/);
  assert.match(image.creditText,/tekoälyavusteinen/);
  assert.ok(image.copyrightNotice);
});
