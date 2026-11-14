import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceSolarMinute,createSolarQuality} from '../assets/solar-playback.mjs';

test('Playback covers equal simulated time at 30, 60 and 120 frames per second',()=>{
  for(const fps of [30,60,120]){
    let minute=360;
    for(let i=0;i<fps*3;i++)minute=advanceSolarMinute(minute,1000/fps,1439);
    assert.ok(Math.abs(minute-480)<1e-9);
  }
});
test('Playback stays inside the Finnish civil day including DST and suspended frames',()=>{
  for(const max of [1379,1439,1499])assert.equal(advanceSolarMinute(max-1,100,max),max);
  assert.equal(advanceSolarMinute(100,5000,1439),104);
  assert.equal(advanceSolarMinute(100,-20,1439),100);
});
test('Render quality ignores isolated stalls and adapts only to sustained slow drawing',()=>{
  const q=createSolarQuality();
  q.observe(110);for(let i=0;i<50;i++)q.observe(16.67);
  assert.equal(q.scale,1);
  for(let i=0;i<150;i++)q.observe(40);
  assert.ok(q.scale>=.55&&q.scale<1);
  const scale=q.scale;
  for(let i=0;i<400;i++)q.observe(16.67);
  assert.ok(q.scale>scale&&q.scale<=1);
});
test('Playback quality reset preserves the learned pixel density while clearing stale timings',()=>{
  const q=createSolarQuality();for(let i=0;i<48;i++)q.observe(40);
  const scale=q.scale;q.reset();assert.equal(q.scale,scale);
  q.observe(1000);q.observe(0);q.observe(-10);assert.equal(q.scale,scale);
});
