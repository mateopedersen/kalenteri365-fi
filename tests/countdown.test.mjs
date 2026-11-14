import test from 'node:test';
import assert from 'node:assert/strict';
import {targetInstants,countdownParts} from '../assets/countdown-core.mjs';
test('Helsinki winter and summer targets are independent of browser zone',()=>{
 assert.deepEqual(targetInstants('2027-01-01','00:00'),[Date.parse('2026-12-31T22:00:00Z')]);
 assert.deepEqual(targetInstants('2027-07-01','12:30'),[Date.parse('2027-07-01T09:30:00Z')]);
});
test('spring gap is rejected and autumn fold has two distinct instants',()=>{
 assert.deepEqual(targetInstants('2027-03-28','03:30'),[]);
 assert.deepEqual(targetInstants('2027-10-31','03:30'),[Date.parse('2027-10-31T00:30:00Z'),Date.parse('2027-10-31T01:30:00Z')]);
});
test('actual elapsed time crosses the short daylight saving day',()=>{
 const from=targetInstants('2027-03-28','00:00')[0],to=targetInstants('2027-03-29','00:00')[0];
 assert.deepEqual(countdownParts(to,from),{days:0,hours:23,minutes:0,seconds:0,elapsed:false,reached:false});
});
test('countdown carries and elapsed count stay correct at boundaries',()=>{
 const target=1000000000;
 assert.deepEqual(countdownParts(target,target-90061000),{days:1,hours:1,minutes:1,seconds:1,elapsed:false,reached:false});
 assert.equal(countdownParts(target,target-1000).seconds,1);
 assert.equal(countdownParts(target,target).reached,true);
 assert.equal(countdownParts(target,target+1000).elapsed,true);
 assert.equal(countdownParts(target,target+1000).seconds,1);
});
test('invalid dates, times and unsupported years are not silently normalized',()=>{
 for(const [d,t]of[['2027-02-29','12:00'],['2027-13-01','12:00'],['2027-01-01','24:00'],['2027-01-01','12:60'],['1899-01-01','12:00']])assert.throws(()=>targetInstants(d,t));
 assert.equal(targetInstants('2028-02-29','12:00').length,1);
});
