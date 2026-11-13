import test from 'node:test';
import assert from 'node:assert/strict';
import {occurs,orderedTasks,personalWeekICS,validDay,validateTask,weekDays,weekPlan} from '../src/personal-planner-core.mjs';
import {personalWorkspace} from '../src/personal-view.mjs';

test('Personal week uses Monday through Sunday across New Year and leap day',()=>{
 assert.deepEqual(weekDays('2027-01-01'),['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']);
 assert.ok(weekDays('2028-02-29').includes('2028-02-29'));
 assert.equal(validDay('2027-02-29'),false);
 assert.throws(()=>weekDays('bad'));
});

test('Shared recurring events honour exclusions, interval, until and actual calendar dates',()=>{
 const weekly={date:'2027-01-04',repeat:'weekly',interval:2,until:'2027-02-01',exdates:['2027-01-18']};
 assert.equal(occurs(weekly,'2027-01-04'),true);
 assert.equal(occurs(weekly,'2027-01-11'),false);
 assert.equal(occurs(weekly,'2027-01-18'),false);
 assert.equal(occurs(weekly,'2027-02-01'),true);
 assert.equal(occurs(weekly,'2027-02-15'),false);
 assert.equal(occurs({date:'2027-01-31',repeat:'monthly'},'2027-02-28'),false);
 assert.equal(occurs({date:'2027-01-31',repeat:'monthly'},'2027-03-31'),true);
 assert.equal(occurs({date:'2028-02-29',repeat:'yearly'},'2029-03-01'),false);
 assert.equal(occurs({date:'2028-02-29',repeat:'yearly'},'2032-02-29'),true);
 assert.equal(occurs({date:'2027-02-30'},'2027-03-02'),false);
});

test('Week combines real shared events, notes, tasks and Finnish holidays without mutating them',()=>{
 const state={events:[{id:'a',title:'Myöhempi',date:'2027-01-04',time:'15:00'},{id:'b',title:'Aikaisempi',date:'2027-01-04',time:'09:00'}],tasks:[{date:'2027-01-04',title:'Tehtävä',done:false}],notes:{'2027-01-04':'Oma muistio'}};
 const original=structuredClone(state),plan=weekPlan(state,'2027-01-04');
 assert.deepEqual(plan[0].events.map(x=>x.id),['b','a']);
 assert.equal(plan[0].note,'Oma muistio');
 assert.equal(plan[0].tasks.length,1);
 assert.ok(plan[2].holidays.some(h=>h.name==='Loppiainen'));
 assert.deepEqual(state,original);
});

test('Task views preserve completed work, prioritise overdue work and validate user dates',()=>{
 const tasks=[{id:'later',title:'Myöhemmin',date:'2027-02-01',priority:'high',done:false},{id:'done',title:'Valmis',date:'2027-01-04',done:true},{id:'past',title:'Aiempi',date:'2027-01-01',priority:'normal',done:false},{id:'today',title:'Tänään',date:'2027-01-04',priority:'high',done:false}];
 assert.deepEqual(orderedTasks(tasks,{anchor:'2027-01-04',today:'2027-01-04'}).map(t=>t.id),['past','today','later']);
 assert.deepEqual(orderedTasks(tasks,{anchor:'2027-01-04',filter:'week'}).map(t=>t.id),['today']);
 assert.deepEqual(orderedTasks(tasks,{anchor:'2027-01-04',filter:'done'}).map(t=>t.id),['done']);
 assert.throws(()=>validateTask({title:' ',date:'2027-01-04'}));
 assert.throws(()=>validateTask({title:'Oma tehtävä',date:'2027-02-29'}));
 assert.deepEqual(validateTask({title:'  Oma tehtävä  ',date:'2028-02-29',priority:'invalid'}),{title:'Oma tehtävä',date:'2028-02-29',priority:'normal'});
 assert.equal(tasks.length,4);
});

test('Week export contains each occurrence exactly once, uses Helsinki summer time and safe folded text',()=>{
 const state={events:[{id:'weekly',title:'Viikkotapaaminen, ääkköset',date:'2027-01-04',repeat:'weekly',time:'12:30'},{id:'other',title:'Toinen viikko',date:'2027-07-12'}],tasks:[],notes:{}};
 const result=personalWeekICS(state,'2027-07-05');
 assert.match(result,/X-WR-CALNAME:Oma viikko 5.7.2027–11.7.2027/);
 assert.match(result,/DTSTART:20270705T093000Z/);
 assert.match(result,/SUMMARY:Viikkotapaaminen\\, ääkköset/);
 assert.equal((result.match(/BEGIN:VEVENT/g)||[]).length,1);
 assert.doesNotMatch(result,/RRULE|Toinen viikko/);
 assert.throws(()=>personalWeekICS({events:[]},'2027-07-05'),/Lisää viikolle/);
 assert.throws(()=>personalWeekICS({events:[{id:'dst',title:'Aika',date:'2027-03-28',time:'03:30'}]},'2027-03-28'),/ei ole olemassa/);
 const safe=personalWeekICS({events:[{id:'unsafe\r\nBEGIN:VEVENT',title:'Oma\r\nBEGIN:VEVENT',date:'2027-01-04'}]},'2027-01-04');
 assert.equal((safe.match(/(?:^|\r\n)BEGIN:VEVENT/g)||[]).length,1);
 for(const line of safe.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
});

test('Personal workspace has actual planning controls and stays Finnish before JavaScript runs',()=>{
 const html=personalWorkspace();
 assert.match(html,/data-personal-task-form/);
 assert.match(html,/data-personal-week/);
 assert.match(html,/data-personal-export/);
 assert.match(html,/id="personal-takeaway-heading"/);
 assert.doesNotMatch(html,/checklist\.svg/);
 assert.match(html,/Opetushallitus/);
});
