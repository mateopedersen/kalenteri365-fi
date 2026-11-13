import test from 'node:test';
import assert from 'node:assert/strict';
import {cropTasks,matchesCrop,sowingWindow} from '../assets/garden-model.mjs';
import data from '../data/finland.json' with {type:'json'};
test('Garden filters use only sourced month fields, preserving unknown schedules',()=>{
 const unknown={name:'Peruna',minimumSoilC:8};
 assert.deepEqual(cropTasks(unknown,5),[]);
 assert.equal(matchesCrop(unknown),true);
 assert.equal(matchesCrop(unknown,{month:5}),false);
 assert.deepEqual(cropTasks({indoorMonths:[3],withGrowLightMonths:[2,3],outdoorMonths:[6]},3),['light']);
 assert.equal(matchesCrop({name:'Yrtti',withGrowLightMonths:[3]},{month:3,stage:'indoor'}),true);
 for(const c of data.crops)for(let m=1;m<=12;m++) assert.equal(matchesCrop(c,{month:m}),cropTasks(c,m).length>0,c.slug);
});
test('Garden name search supports Finnish accents, short queries and empty results',()=>{
 assert.equal(matchesCrop({name:'Kesäkurpitsa'},{query:'kesakur'}),true);
 assert.equal(matchesCrop({name:'Kesäkurpitsa'},{query:'  KESÄ  '}),true);
 assert.equal(matchesCrop({name:'Tomaatti'},{query:'sipuli'}),false);
});
test('Sowing windows count real calendar weeks across leap day and year boundaries',()=>{
 assert.deepEqual(sowingWindow('2028-03-14',1,3),{start:'2028-02-22',end:'2028-03-07',planting:'2028-03-14'});
 assert.deepEqual(sowingWindow('2027-01-08',1,2),{start:'2026-12-25',end:'2027-01-01',planting:'2027-01-08'});
 assert.throws(()=>sowingWindow('2027-02-29',1,2));
 assert.throws(()=>sowingWindow('2027-06-01',8,5));
 assert.throws(()=>sowingWindow('2027-06-01',1.5,5));
});
