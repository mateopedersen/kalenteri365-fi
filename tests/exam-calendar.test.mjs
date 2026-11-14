import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/exams.json' with {type:'json'};
import {examRecords,filterExams,examStart,examCalendarFile} from '../assets/exam-core.mjs';
const records=examRecords(data);

test('2027 sessions retain all published dates and correctly separate exam components',()=>{
 assert.deepEqual(records.filter(e=>e.season==='kevaan').map(e=>e.date),['2027-03-16','2027-03-18','2027-03-19','2027-03-22','2027-03-24','2027-03-30','2027-03-31','2027-04-02','2027-04-05']);
 assert.deepEqual(records.filter(e=>e.season==='syksyn').map(e=>e.date),['2027-09-20','2027-09-22','2027-09-24','2027-09-27','2027-09-28','2027-09-30','2027-10-01','2027-10-04','2027-10-06']);
 assert.equal(new Set(records.map(e=>e.id)).size,18);
 const reading=records[0];assert.equal(reading.details.length,2);assert.match(reading.details[0],/lukutaidon koe/);assert.match(reading.details[1],/kuullun ymmärtämisen/);
 assert.equal(records.find(e=>e.date==='2027-04-05').title,'Saamen äidinkieli ja kirjallisuus');
});

test('subject search combines words, accents, session and family without dropping valid matching days',()=>{
 assert.equal(filterExams(records).length,18);
 assert.deepEqual(filterExams(records,{query:'PITKA ENGLANTI'}).map(e=>e.date),['2027-03-22','2027-09-24']);
 assert.deepEqual(filterExams(records,{query:'fysiikka',season:'syksyn',family:'real'}).map(e=>e.date),['2027-09-22']);
 assert.equal(filterExams(records,{query:'s2'}).length,4);
 assert.equal(filterExams(records,{query:'äidinkieli',family:'mother'}).length,6);
 assert.equal(filterExams(records,{query:'matematiikka',family:'language'}).length,0);
 assert.equal(filterExams(records,{query:'no such subject'}).length,0);
});

test('Helsinki 09.00 is correct on both sides of the spring DST boundary',()=>{
 assert.equal(examStart('2027-03-24'),'20270324T070000Z');
 assert.equal(examStart('2027-03-30'),'20270330T060000Z');
 assert.equal(examStart('2027-09-30'),'20270930T060000Z');
 assert.throws(()=>examStart('2027-02-30'));
});

test('selected ICS contains only selected days, stable identities and valid UTF-8 folded lines',()=>{
 const chosen=[records[0],records[4],records[0]],file=examCalendarFile(chosen),unfold=file.replace(/\r\n /g,'');
 assert.equal((file.match(/BEGIN:VEVENT/g)||[]).length,2);
 assert.match(file,/DTSTART:20270316T070000Z/);assert.match(file,/DTSTART:20270324T070000Z/);
 assert.doesNotMatch(file,/DTSTART:20270318|VALARM|DTEND/);
 assert.match(unfold,/UID:yo-2027-03-16@kalenteri365.fi/);
 assert.match(unfold,/Suomi toisena kielenä ja kirjallisuus/);
 assert.match(unfold,/DESCRIPTION:.*\\nAlkaa klo 9.00/);
 for(const line of file.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75,'Unfolded UTF-8 line exceeds 75 octets');
 assert.ok(file.endsWith('END:VCALENDAR\r\n'));
});

test('optional reminders are relative to a timed exam, without inventing an exam finish time',()=>{
 for(const [reminder,trigger] of [['previous-evening','-PT15H'],['hour','-PT1H']]){
 const file=examCalendarFile([records[0]],{reminder});assert.match(file,/BEGIN:VALARM/);assert.ok(file.includes('TRIGGER:'+trigger+'\r\n'));assert.doesNotMatch(file,/DTEND/);
 }
 assert.throws(()=>examCalendarFile(records,{reminder:'unexpected'}));
});
