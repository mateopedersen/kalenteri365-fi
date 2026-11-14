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

test('Worked week examples use civil dates even across the calendar-year boundary',()=>{
 const week=periodGuide('/viikkokalenteri/2027/viikko-1/');
 assert.match(week,/keskiviikko on 6\.1\.2027 ja perjantai 8\.1\.2027/);
 const boundary=periodGuide('/viikkokalenteri/2026/viikko-53/');
 // Only published catalog years get explanatory pages.
 assert.equal(boundary,'');
 const end=periodGuide('/viikkokalenteri/2027/viikko-52/');
 assert.match(end,/keskiviikko on 29\.12\.2027 ja perjantai 31\.12\.2027/);
});

test('Calendar-row and alternate-hours explanations reflect the selected month',()=>{
 const four=periodGuide('/kalenteri/2027/helmikuu/');
 assert.match(four,/ruudukko tarvitsee 4 kalenteririviä/);
 const six=periodGuide('/pdf-kalenteri/2027/toukokuu/');
 assert.match(six,/ruudukko tarvitsee 6 kalenteririviä/);
 const work=periodGuide('/tyopaivat/2028/helmikuu/');
 assert.match(work,/samoilla 21 työpäivällä, tuntisumma on 168 tuntia/);
 assert.doesNotMatch(work,/NaN|undefined/);
});
