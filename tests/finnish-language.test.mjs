import test from 'node:test';
import assert from 'node:assert/strict';
import {countForm,quantity} from '../assets/fi-language.mjs';
import {labResult} from '../src/calendar-lab-view.mjs';
import {periodGuide} from '../src/period-guide.mjs';
import {MONTHS,SLUGS,YEARS,cap} from '../src/calendar.mjs';

test('Finnish cardinal phrases distinguish one from zero, decimals and numbers ending in one',()=>{
 for(const n of [1,-1])assert.equal(countForm(n,'päivä','päivää'),'päivä');
 for(const n of [0,2,11,21,101,1.5,-21])assert.equal(countForm(n,'päivä','päivää'),'päivää');
 assert.equal(quantity(1,'merkintä','merkintää'),'1 merkintä');
 assert.equal(quantity(21,'merkintä','merkintää'),'21 merkintää');
 assert.equal(quantity(1.5,'tunti','tuntia'),'1,5 tuntia');
 assert.equal(quantity(1,'vuoden','vuotta'),'1 vuoden');
});

test('year progress describes the selected date and inflects the one remaining day',()=>{
 assert.match(labResult('vuoden-paiva','2027-12-30'),/>Päivä valitun päivän jälkeen</);
 assert.match(labResult('vuoden-paiva','2027-12-29'),/>Päivää valitun päivän jälkeen</);
 assert.match(labResult('vuoden-paiva','2027-12-31'),/>Päivää valitun päivän jälkeen</);
 assert.doesNotMatch(labResult('vuoden-paiva','2027-12-30'),/tämän päivän jälkeen/);
});

test('all 48 month guides use the Finnish month inessive and the correct year',()=>{
 for(const y of YEARS)for(let m=1;m<=12;m++)for(const base of ['kalenteri','kuukalenteri']){
  const html=periodGuide(`/${base}/${y}/${SLUGS[m-1]}/`);
  assert.ok(html.includes(`${cap(MONTHS[m-1])}ssa ${y} on`),`${base}: ${m}/${y}`);
 }
});
