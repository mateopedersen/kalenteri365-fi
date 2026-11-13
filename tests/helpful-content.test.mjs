import test from 'node:test';
import assert from 'node:assert/strict';
import {cityGuide,periodGuide} from '../src/period-guide.mjs';

test('Workday explanation preserves the selected leap-month interval in its calculator link',()=>{
  const text=periodGuide('/tyopaivat/2028/helmikuu/');
  assert.match(text,/29 kalenteripäivää/);
  assert.match(text,/21 työpäivää/);
  assert.match(text,/157,5 tuntia/);
  assert.match(text,/start=2028-02-01&amp;end=2028-02-29/);
  assert.match(text,/\/juhlapyhat\/2028\/helmikuu\//);
  assert.doesNotMatch(text,/NaN|undefined/);
});

test('City explanations distinguish polar day, polar night and ordinary sunrise',()=>{
  const north=cityGuide('/auringonnousu-ja-lasku/utsjoki/2028/');
  assert.match(north,/21\.6\.2028 Aurinko pysyy koko vuorokauden horisontin yläpuolella/);
  assert.match(north,/21\.12\.2028 Aurinko pysyy koko vuorokauden horisontin alapuolella/);
  const south=cityGuide('/auringonnousu-ja-lasku/helsinki/2028/');
  assert.match(south,/21\.6\.2028 auringonnousu on klo \d\d:\d\d/);
  assert.doesNotMatch(south,/koko vuorokauden horisontin (ylä|ala)puolella/);
  assert.match(south,/\/paivan-pituus\/helsinki\/2028\//);
});

test('Day-length guidance describes the actual measure and keeps the observation place',()=>{
  const text=cityGuide('/paivan-pituus/oulu/2030/');
  assert.match(text,/Hämärä ei sisälly lukuun/);
  assert.match(text,/\/auringonnousu-ja-lasku\/oulu\/2030\//);
  assert.doesNotMatch(text,/Simulaation Auringon suunta/);
  assert.equal(cityGuide('/kuun-nousu-ja-lasku/unknown/2028/'),'');
});
