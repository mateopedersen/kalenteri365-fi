import test from 'node:test';
import assert from 'node:assert/strict';
import {lunarLightStops} from '../assets/lunar-disc-core.mjs';

test('Lunar lighting puts the lit hemisphere on the correct side for each quarter',()=>{
  const first=lunarLightStops(90),last=lunarLightStops(270);
  assert.ok(first[12].opacity<first[4].opacity);
  assert.ok(last[4].opacity<last[12].opacity);
  assert.ok(Math.abs(first[12].opacity-last[4].opacity)<1e-12);
});
test('Full Moon has a symmetric rounded surface while new Moon remains dark',()=>{
  const full=lunarLightStops(180),dark=lunarLightStops(0);
  assert.equal(full[8].opacity,0);
  assert.ok(full[0].opacity>.9);
  for(let i=0;i<17;i++){
    assert.ok(Math.abs(full[i].opacity-full[16-i].opacity)<1e-8);
    assert.ok(dark[i].opacity>.95);
  }
});
test('Lunar lighting stays bounded and continuous across a complete phase cycle',()=>{
  for(let angle=0;angle<=360;angle+=2.5){
    const stops=lunarLightStops(angle);
    assert.equal(stops[0].offset,0);assert.equal(stops.at(-1).offset,1);
    for(const s of stops)assert.ok(s.opacity>=0&&s.opacity<=1);
  }
  for(let i=0;i<17;i++)assert.ok(Math.abs(lunarLightStops(0)[i].opacity-lunarLightStops(360)[i].opacity)<1e-7);
});
