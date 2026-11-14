import test from 'node:test';
import assert from 'node:assert/strict';
import {ADMISSIONS_ROUTES,ADMISSIONS_EVENTS,routeEvents,routeState,selectedAdmissionEvents,personalAdmissionEvent,admissionsCalendar,admissionGoogleURL} from '../assets/admissions-core.mjs';
test('four published admission routes stay separate from exam results and preserve study-start years',()=>{
 assert.equal(ADMISSIONS_ROUTES.length,4);assert.equal(ADMISSIONS_EVENTS.length,21);
 assert.ok(ADMISSIONS_EVENTS.every(e=>!e.id.startsWith('exam-results')));
 assert.equal(new Set(ADMISSIONS_EVENTS.map(e=>e.id)).size,21);
 assert.deepEqual(ADMISSIONS_ROUTES.map(r=>r.id),['higher-first','secondary','higher-second','higher-autumn']);
 assert.equal(ADMISSIONS_ROUTES.at(-1).start,'Tammikuu 2028');
 assert.equal(routeEvents('secondary').find(e=>e.step==='results').qualifier,'Aikaisintaan');
 assert.equal(routeEvents('higher-second').find(e=>e.step==='certificate').date,'2027-05-28');
 assert.ok(ADMISSIONS_EVENTS.every(e=>e.source.startsWith('https://opintopolku.fi/')&&e.checked==='2026-11-14'));
});
test('application state switches at exact Finnish opening and closing instants',()=>{
 const spring=ADMISSIONS_ROUTES.find(r=>r.id==='higher-second');
 assert.equal(routeState(spring,new Date('2027-03-09T05:59:59Z')).kind,'upcoming');
 assert.equal(routeState(spring,new Date('2027-03-09T06:00:00Z')).kind,'open');
 assert.equal(routeState(spring,new Date('2027-03-23T12:59:59Z')).kind,'open');
 assert.equal(routeState(spring,new Date('2027-03-23T13:00:00Z')).kind,'closed');
 const autumn=ADMISSIONS_ROUTES.at(-1);assert.equal(routeState(autumn,new Date('2027-08-30T05:00:00Z')).kind,'open');
});
test('personal deadlines validate dates and links, retain notes on reload, and use stable IDs',()=>{
 const e=personalAdmissionEvent({name:'Portfolion palautus',date:'2027-03-31',time:'15:00',notes:'Aineisto ja liitteet',source:'https://example.fi/ohje'});
 assert.deepEqual(personalAdmissionEvent(e),e);
 assert.equal(personalAdmissionEvent({...e,name:'  Portfolion palautus  '}).id,e.id);
 for(const values of [{date:'2027-02-29'},{date:'2031-01-01'},{time:'25:30'},{name:'x'},{source:'javascript:alert(1)'},{source:'http://example.fi/'},{source:'https://user:pass@example.fi/'},{notes:'x'.repeat(601)}])assert.throws(()=>personalAdmissionEvent({...e,...values}));
});
test('mixed-route selections are chronological and export individual deadlines with correct DST and alarms',()=>{
 const jan=routeEvents('higher-first').find(e=>e.step==='closes'),jul=routeEvents('higher-second').find(e=>e.step==='accept'),result=routeEvents('secondary').find(e=>e.step==='results');
 const custom=personalAdmissionEvent({name:'Oma valintakoe',date:'2027-06-01',time:'09:00',notes:'Ääkköset, piste; rivinvaihto\ntoinen rivi'});
 const chosen=selectedAdmissionEvents([jul.id,custom.id,jan.id,result.id,'missing'],[custom]);
 assert.deepEqual(chosen.map(e=>e.id),[jan.id,custom.id,result.id,jul.id]);
 const text=admissionsCalendar([...chosen,jan],'1',new Date('2026-11-14T12:00Z'));
 assert.equal((text.match(/BEGIN:VEVENT/g)||[]).length,4);assert.equal((text.match(/BEGIN:VALARM/g)||[]).length,4);
 assert.match(text,/DTSTART:20270121T130000Z/);assert.match(text,/DTSTART:20270713T120000Z/);assert.match(text,/DTSTART:20270601T060000Z/);
 assert.match(text,/TRIGGER;VALUE=DATE-TIME:20270712T060000Z/);
 assert.match(text,/DTSTART;VALUE=DATE:20270617/);assert.match(text,/DTEND;VALUE=DATE:20270618/);
 assert.doesNotMatch(text,/DTEND:2027/);assert.ok(text.endsWith('END:VCALENDAR\r\n'));
 assert.match(text.replace(/\r\n /g,''),/Ääkköset\\, piste\\; rivinvaihto\\ntoinen rivi/);
 for(const line of text.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
 assert.doesNotMatch(admissionsCalendar(chosen,'none'),/BEGIN:VALARM/);
 assert.throws(()=>admissionsCalendar([]));assert.throws(()=>admissionsCalendar(chosen,'bogus'));
 const url=new URL(admissionGoogleURL(jul));assert.equal(url.hostname,'calendar.google.com');assert.equal(url.searchParams.get('dates'),'20270713T120000Z/20270713T121500Z');assert.ok(url.searchParams.get('details').includes('https://opintopolku.fi/'));
});
