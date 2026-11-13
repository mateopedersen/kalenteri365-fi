import test from 'node:test';
import assert from 'node:assert/strict';
import {countInterval,shiftDate} from '../src/date-math.mjs';
test('Calendar intervals handle leap days and both endpoint decisions',()=>{
 assert.equal(countInterval({start:'2028-02-28',end:'2028-03-01'}).calendarDays,2);
 assert.equal(countInterval({start:'2028-02-28',end:'2028-03-01',includeStart:true}).calendarDays,3);
 for(const [a,b,n]of [[false,false,0],[false,true,0],[true,false,0],[true,true,1]])assert.equal(countInterval({start:'2027-01-01',end:'2027-01-01',includeStart:a,includeEnd:b}).calendarDays,n);
 assert.throws(()=>countInterval({start:'2027-02-29',end:'2027-03-01'}));
 assert.throws(()=>countInterval({start:'2027-03-01',end:'2027-01-01'}));
});
test('Workday breakdown partitions the same interval without double counting',()=>{
 const r=countInterval({start:'2027-01-01',end:'2027-01-31',includeStart:true});
 assert.equal(r.calendarDays,31);assert.equal(r.publicHolidays,2);assert.equal(r.weekends,10);assert.equal(r.workDays,19);
 assert.equal(r.calendarDays,r.publicHolidays+r.weekends+r.freeEves+r.workDays);
 assert.equal(countInterval({start:'2027-12-24',end:'2027-12-24',includeStart:true,eves:true}).workDays,0);
 assert.equal(countInterval({start:'2027-12-24',end:'2027-12-24',includeStart:true}).workDays,1);
 assert.equal(countInterval({start:'2025-12-24',end:'2026-01-02'}).workDays,null);
});
test('Working-day shifts cross Easter and year changes correctly in both directions',()=>{
 assert.equal(shiftDate({start:'2027-03-25',amount:1,unit:'working'}).date,'2027-03-30');
 assert.equal(shiftDate({start:'2027-03-30',amount:-1,unit:'working'}).date,'2027-03-25');
 assert.equal(shiftDate({start:'2027-12-31',amount:1,unit:'working'}).date,'2028-01-03');
 assert.equal(shiftDate({start:'2027-01-02',amount:0,unit:'working'}).date,'2027-01-02');
 assert.throws(()=>shiftDate({start:'2030-12-31',amount:1,unit:'working'}));
});
test('Month and year shifts clamp to a real date and preserve ISO week-year',()=>{
 assert.deepEqual(shiftDate({start:'2027-01-31',amount:1,unit:'months'}).date,'2027-02-28');
 assert.equal(shiftDate({start:'2028-02-29',amount:1,unit:'years'}).date,'2029-02-28');
 assert.equal(shiftDate({start:'2027-01-01',amount:-1,unit:'months'}).date,'2026-12-01');
 assert.deepEqual(shiftDate({start:'2027-01-01',amount:0}).week,{year:2026,number:53});
 assert.equal(countInterval({start:'2027-03-27',end:'2027-03-29'}).calendarDays,2);
});
