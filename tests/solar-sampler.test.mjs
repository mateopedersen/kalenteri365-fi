import test from 'node:test';
import assert from 'node:assert/strict';
import * as A from 'astronomy-engine';
import {solarSnapshot,createSolarSampler} from '../src/solar-scene-model.mjs';

test('Prepared scene sampling preserves exact positions and Finnish DST day bounds',()=>{
 for(const city of [['helsinki','Helsinki',60.1699,24.9384],['utsjoki','Utsjoki',69.909,27.027]])
 for(const date of ['2027-03-28','2027-10-31','2028-06-21'])
 for(const body of ['Sun','Moon']){
  const sample=createSolarSampler(A,city,date,body);
  for(const minute of [0,210.5,720,1499])assert.deepEqual(sample(minute),solarSnapshot(A,city,date,minute,body));
 }
});
test('Observer preparation is reused across playback frames and isolated between selections',()=>{
 let observers=0;
 const engine={...A,Observer:class extends A.Observer{constructor(...args){super(...args);observers++;}}};
 const city=['helsinki','Helsinki',60.1699,24.9384];
 const sample=createSolarSampler(engine,city,'2027-01-01');
 for(let i=0;i<60;i++)sample(i*2.5);
 assert.equal(observers,1);
 const other=createSolarSampler(engine,['oulu','Oulu',65.0121,25.4651],'2027-06-21');
 assert.equal(observers,2);assert.notEqual(other(720).position.altitude,sample(720).position.altitude);
});
