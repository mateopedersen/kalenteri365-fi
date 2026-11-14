import test from 'node:test';
import assert from 'node:assert/strict';
import {lunarEclipseData} from '../src/lunar-eclipse-view.mjs';
import {filteredLunarEvents} from '../assets/lunar-eclipse-core.mjs';
const cities=lunarEclipseData(),helsinki=cities[0];
test('the December 2028 total eclipse has the expected type and totality window',()=>{
 const e=helsinki.events.find(e=>e.peak.startsWith('2028-12-31'));
 assert.equal(e.kind,'total');assert.equal(e.stages.length,7);
 // NASA/GSFC contact times are UT, not the TD column of the decade table.
 // https://eclipse.gsfc.nasa.gov/LEplot/LEplot2001/LE2028Dec31T.pdf
 const contacts={0:'14:03:49',1:'15:07:35',2:'16:16:19',3:'16:51:58',4:'17:27:40',5:'18:36:24',6:'19:40:02'};
 for(const [i,time] of Object.entries(contacts))assert.ok(Math.abs(Date.parse(e.stages[i].time)-Date.parse(`2028-12-31T${time}Z`))<45000,'NASA contact '+i);

});
test('local visibility changes with place while physical eclipse stages stay simultaneous',()=>{
 assert.equal(cities.length,25);
 for(const city of cities)for(const [i,e] of city.events.entries()){
  assert.deepEqual(e.stages.map(s=>s.time),helsinki.events[i].stages.map(s=>s.time));
  assert.ok(e.stages.every((s,i,a)=>i===0||Date.parse(a[i-1].time)<Date.parse(s.time)));
  assert.ok(e.stages.every(s=>Number.isFinite(s.altitude)&&s.altitude>=-90&&s.altitude<=90));
 }
 assert.notEqual(cities[0].events[0].altitude,cities.at(-1).events[0].altitude);
});
test('peak-only filter explicitly excludes below-horizon peaks without dropping the all-events record',()=>{
 assert.equal(helsinki.events.length,10);
 assert.ok(filteredLunarEvents(helsinki).every(e=>e.altitude>0));
 assert.equal(filteredLunarEvents(helsinki,'all','all').length,10);
 assert.ok(filteredLunarEvents(helsinki,'2028','all').some(e=>e.altitude<0));
 assert.equal(filteredLunarEvents(helsinki,'2027','all').every(e=>e.kind==='penumbral'),true);
});
