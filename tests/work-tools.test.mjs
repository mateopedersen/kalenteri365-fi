import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateWorkdays,workdayCSV} from '../src/workday-math.mjs';
import {SHIFT_PRESETS,shiftMonth,shiftReview,shiftCSV,validateShiftPlan,checkedShift} from '../src/shifts.mjs';
const input={start:'2027-01-01',end:'2027-01-31',hours:7.5};
test('Personal work weeks and overlapping absences partition calendar days once',()=>{
 let r=calculateWorkdays(input);assert.equal(r.workDays,19);assert.equal(r.hours,142.5);assert.equal(r.calendarDays,31);
 assert.equal(r.workDays+r.publicHolidays+r.eves+r.weekRest+r.absences,r.calendarDays);
 r=calculateWorkdays({...input,exclusions:[{start:'2027-01-01',end:'2027-01-10'},{start:'2027-01-06',end:'2027-01-08'}]});
 assert.equal(r.absences,4);assert.equal(r.workDays,15);assert.equal(r.hours,112.5);
 r=calculateWorkdays({...input,weekdays:[1,3,5]});assert.equal(r.workDays,11);
 assert.equal(calculateWorkdays({...input,holidays:false}).workDays,21);
});
test('Workdays support endpoint choices, leap days and distinct eve policy',()=>{
 assert.equal(calculateWorkdays({start:'2028-02-28',end:'2028-03-01'}).calendarDays,3);
 assert.equal(calculateWorkdays({start:'2027-12-24',end:'2027-12-24',eves:true}).workDays,0);
 assert.equal(calculateWorkdays({start:'2027-12-24',end:'2027-12-24'}).workDays,1);
 assert.equal(calculateWorkdays({...input,includeStart:false,includeEnd:false}).calendarDays,29);
 assert.throws(()=>calculateWorkdays({...input,weekdays:[]}));
 assert.throws(()=>calculateWorkdays({...input,start:'2025-12-31'}));
 assert.throws(()=>calculateWorkdays({...input,hours:0}));
 const r=calculateWorkdays({start:'2027-12-01',end:'2028-02-29'});
 assert.equal(r.months.reduce((n,m)=>n+m.workDays,0),r.workDays);assert(workdayCSV(r).startsWith('\ufeff"Päivämäärä";'));
});
test('Shift review detects overlap, short rest and real daylight-saving elapsed duration',()=>{
 const work=(date,start,end)=>({...checkedShift({type:'work',start,end,break:0}),date});
 assert(shiftReview([work('2027-01-01','23:00','07:00'),work('2027-01-02','06:00','14:00')]).some(n=>n.type==='overlap'));
 assert(shiftReview([work('2027-01-01','15:00','23:00'),work('2027-01-02','07:00','15:00')],11).some(n=>n.type==='rest'));
 assert.equal(shiftReview([work('2027-01-01','15:00','23:00'),work('2027-01-02','07:00','15:00')],8).length,0);
 assert(shiftReview([work('2027-03-27','23:00','07:00')]).some(n=>n.type==='clock-change'&&n.message.includes('7 h')));
 assert(shiftReview([work('2027-03-28','03:30','07:00')]).some(n=>n.type==='invalid-time'));
});
test('Shift backup validation preserves personal exceptions and rejects corrupt imports',()=>{
 const s=validateShiftPlan({start:'2027-01-01',year:2027,month:1,rows:SHIFT_PRESETS.two,overrides:{'2027-01-01':{type:'off',name:'Loma',note:'Oma vapaa'}}});
 const rows=shiftMonth(s.rows,s.start,s.year,s.month,s.overrides);assert.equal(rows[0].name,'Loma');assert.equal(rows[0].note,'Oma vapaa');
 assert.throws(()=>validateShiftPlan({...s,rows:[]}));assert.throws(()=>validateShiftPlan({...s,month:13}));assert.throws(()=>validateShiftPlan({...s,overrides:{'2027-02-31':{type:'off'}}}));
 assert.throws(()=>checkedShift({type:'work',start:'08:00',end:'16:00',break:480}));
 const csv=shiftCSV([{...rows[0],note:'=HYPERLINK("bad")'}]);assert(csv.includes("'=HYPERLINK"));
});
