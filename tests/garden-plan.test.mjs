import test from 'node:test';
import assert from 'node:assert/strict';
import {validateGardenPlan,validGardenDate,gardenPlanICS,mergeGardenPlans} from '../assets/garden-plan-model.mjs';
const task={id:'garden-test',crop:'Tomaatti',activity:'Kylvö',date:'2028-02-29',note:'Lajike, kasvupaikka; havainto\nÄäkköset ja 🌱'.repeat(10),done:false};
test('Garden imports reject invalid dates, unknown crops, oversized and malformed plans atomically',()=>{
 assert.equal(validGardenDate('2028-02-29'),true);assert.equal(validGardenDate('2027-02-29'),false);assert.equal(validGardenDate('2101-01-01'),false);assert.equal(validGardenDate('2027-13-01'),false);
 assert.deepEqual(validateGardenPlan({type:'kalenteri365-garden',version:1,tasks:[task]},['Tomaatti']),[task]);
 for(const bad of [{...task,date:'2027-02-29'},{...task,crop:'Tuntematon'},{...task,activity:'Invalid'},{...task,note:'a'.repeat(1001)},{...task,done:'yes'}])assert.throws(()=>validateGardenPlan([task,bad],['Tomaatti']));
 assert.throws(()=>validateGardenPlan({type:'unknown',tasks:[task]},['Tomaatti']));assert.throws(()=>validateGardenPlan(Array(501).fill(task),['Tomaatti']));
});
test('Garden ICS preserves Finnish content, one full all-day event and optional reminders with stable UID',()=>{
 const ics=gardenPlanICS([task],{reminder:true,now:new Date('2026-11-14T10:00:00Z')}),flat=ics.replace(/\r\n /g,'');
 assert.match(flat,/DTSTART;VALUE=DATE:20280229\r\nDTEND;VALUE=DATE:20280301/);assert.match(flat,/DTSTAMP:20261114T100000Z/);assert.match(flat,/UID:garden-test@garden.kalenteri365.fi/);assert.match(flat,/SUMMARY:Tomaatti: Kylvö/);assert.match(flat,/DESCRIPTION:Lajike\\, kasvupaikka\\; havainto\\nÄäkköset ja 🌱/);assert.match(flat,/TRIGGER:-P1D/);
 for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
 assert.doesNotMatch(gardenPlanICS([task]),/VALARM/);assert.doesNotMatch(gardenPlanICS([{...task,done:true}],{reminder:true}),/VALARM/);
 assert.match(gardenPlanICS([{...task,note:'Yksi\rKaksi'}]),/DESCRIPTION:Yksi\\nKaksi/);
 const yearEnd=gardenPlanICS([{...task,date:'2030-12-31'}]);assert.match(yearEnd,/DTEND;VALUE=DATE:20310101/);
});

test('Backup merge preserves intentional duplicate entries and never silently overwrites a different task',()=>{
 const twin={...task,id:'another-entry'};
 assert.equal(mergeGardenPlans([], [task,twin]).tasks.length,2);
 assert.equal(mergeGardenPlans([task,twin],[task,twin]).count,0);
 const altered={...task,note:'Uusi havainto'};
 const merged=mergeGardenPlans([task],[altered],()=> 'new-entry');
 assert.equal(merged.count,1);assert.equal(merged.tasks[0].note,task.note);assert.equal(merged.tasks[1].note,'Uusi havainto');
 assert.equal(mergeGardenPlans(merged.tasks,[altered]).count,0);
 assert.throws(()=>validateGardenPlan([task,task],['Tomaatti']));
 assert.throws(()=>mergeGardenPlans(Array.from({length:500},(_,i)=>({...task,id:'existing-'+i})),[task]));
});
