import test from 'node:test';import assert from 'node:assert/strict';import {familyICS,normalizeFamily}from'../src/family-calendar.mjs';
const members=[{id:'aino',name:'Aino'}];
test('Family ICS retains Finnish titles, a real Helsinki instant, and date-only day boundaries',()=>{
 const out=familyICS([{id:'one',person:'aino',date:'2027-01-04',time:'12:30',title:'Musiikki; Aino, äiti'},{id:'two',person:'aino',date:'2027-06-26',time:'',title:'Juhannus'}],members);
 assert.match(out,/DTSTART:20270104T103000Z/);assert.match(out,/DTSTART;VALUE=DATE:20270626/);assert.match(out,/DTEND;VALUE=DATE:20270627/);assert.match(out,/SUMMARY:Musiikki\\; Aino\\, äiti/);assert.match(out,/DESCRIPTION:Aino/);assert.equal((out.match(/BEGIN:VEVENT/g)||[]).length,2);
});
test('Family timed export respects summer time instead of retaining the winter offset',()=>assert.match(familyICS([{id:'summer',date:'2027-07-01',time:'12:30',title:'Retki'}],[]),/DTSTART:20270701T093000Z/));
test('A family appointment during a nonexistent or repeated Helsinki local time cannot silently move',()=>{
 assert.throws(()=>familyICS([{id:'gap',date:'2027-03-28',time:'03:30',title:'Meno'}],[]),/ei ole olemassa/);
 assert.throws(()=>familyICS([{id:'fold',date:'2027-10-31',time:'03:30',title:'Meno'}],[]),/toistuu/);
});
test('Long Finnish family calendar titles are folded at 75 UTF-8 octets',()=>{
 const text='Äidin ja Väinön yhteinen kävely '.repeat(10),out=familyICS([{id:'long',date:'2027-01-04',title:text}],[]);
 for(const line of out.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75,Buffer.byteLength(line));
 assert.ok(out.replace(/\r\n /g,'').includes('SUMMARY:'+text));
});

test('Family backup data cannot inject identifiers or styles and invalid dates are rejected',()=>{
 const d=normalizeFamily({members:[{id:'bad id"',name:'Aino',color:'red" onclick="alert(1)'}],events:[{id:'x"',person:'missing',date:'2027-02-30',title:'Bad'},{id:'ok',person:'missing',date:'2027-01-07',time:'29:90',title:'Oma meno'}],meals:{'2027-02-30':'Bad','2027-01-07':'Keitto'},week:'2027-01-07'});
 assert.equal(d.week,'2027-01-04');assert.equal(d.events.length,1);assert.equal(d.events[0].person,'shared');assert.equal(d.events[0].time,'');assert.equal(d.members[1].id,'member-0');assert.equal(d.members[1].color,'#0046a8');assert.deepEqual(d.meals,{'2027-01-07':'Keitto'});assert.equal(normalizeFamily('corrupt').members.length,1);
});
