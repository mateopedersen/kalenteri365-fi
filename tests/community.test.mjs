import test from 'node:test';
import assert from 'node:assert/strict';
import {SCHOOL_RECORDS} from '../src/community-view.mjs';
import {schoolPeriods,schoolEvents,compareSchools,normalPreferences,nextPayment} from '../assets/community-core.mjs';
import {PAYMENT_PLANS} from '../assets/payment-data.mjs';
import {serviceCalendar} from '../assets/finland-services-core.mjs';
import {normalizeNamedays,namedaysResponse} from '../lib/namedays.mjs';
const get=(city,year='2026/2027',language='fi')=>SCHOOL_RECORDS.find(r=>r.municipality===city&&r.academicYear===year&&r.language===language);
test('School comparisons retain municipality, language and published year boundaries',()=>{
 assert.equal(new Set(SCHOOL_RECORDS.map(r=>r.municipality)).size,13);
 assert.equal(get('Tampere','2027/2028').autumnStart,'2027-08-11');
 assert.equal(get('Vaasa').springStart,'2027-01-07');
 assert.ok(get('Vaasa','2026/2027','sv'));
 assert.equal(get('Vaasa','2029/2030'),undefined);
 assert.equal(compareSchools(get('Helsinki'),get('Oulu')).some(p=>p.labels.includes('Talviloma')),false);
 const holiday=schoolPeriods(get('Tampere'),true).find(p=>p.label==='Talviloma');
 assert.equal(holiday.start,'2027-02-27');assert.equal(holiday.end,'2027-03-07');
 assert.equal(schoolPeriods(get('Tampere')).find(p=>p.label==='Talviloma').end,'2027-03-05');
});
test('School export ends exclusively and retains verified source and additional school breaks',()=>{
 const events=schoolEvents({...get('Kuopio'),source:'https://www.kuopio.fi/'});
 const event=events.find(e=>e.name.endsWith('Helatorstain jälkeinen vapaapäivä')||e.date==='2027-05-07');assert.ok(event);
 assert.equal(event.endDate,'2027-05-08');
 const ics=serviceCalendar(event,'none',new Date('2026-11-13T00:00Z'));
 assert.match(ics,/DTEND;VALUE=DATE:20270508/);assert.match(ics,/https:\/\/www.kuopio.fi/);
});
test('Payment categories use published tables, never a common inferred payday',()=>{
 assert.equal(PAYMENT_PLANS.length,5);
 for(const p of PAYMENT_PLANS){assert.equal(p.dates.length,12);assert.equal(new Set(p.dates).size,12);}
 assert.equal(PAYMENT_PLANS[0].dates[5],'2027-06-25');
 assert.equal(PAYMENT_PLANS.find(p=>p.id==='keva-valtio').dates[5],'2027-06-18');
 assert.equal(PAYMENT_PLANS.find(p=>p.id==='keva-kunta').dates[5],'2027-06-03');
 assert.equal(nextPayment(PAYMENT_PLANS[0],'2027-12-24'),null);
 assert.deepEqual(normalPreferences({interests:['school','school','unknown'],language:'de'}).interests,['school']);
});
test('Nameday connection remains inactive without both a token and confirmed rights',async()=>{
 let calls=0;const response=await namedaysResponse({env:{NAMEDAY_API_TOKEN:'ndt_test'},fetchImpl:()=>{calls++;}});
 assert.equal(response.status,200);assert.equal(calls,0);assert.equal((await response.json()).reason,'not_configured');
});
test('Nameday adapter rejects stale days, strips private metadata and caches only current-day results',async()=>{
 const now=Date.parse('2026-11-13T12:00Z');
 const data={success:true,date:{year:2026,month:11,day:13},name_days:[{name:'Testi',type:'suomi',day:13,month:11},{name:'Test',type:'ruotsi',day:13,month:11}],_meta:{organization:'private'}};
 assert.throws(()=>normalizeNamedays(data,now+86400000));
 let calls=0;const options={env:{NAMEDAY_API_TOKEN:'ndt_fake_for_unit_test',NAMEDAY_LICENSE_CONFIRMED:'true'},now,fetchImpl:async(url,init)=>{calls++;assert.equal(init.headers.Authorization,'Bearer ndt_fake_for_unit_test');return Response.json(data);}};
 const first=await namedaysResponse(options),second=await namedaysResponse(options);
 assert.equal(first.status,200);assert.equal(calls,1);
 const text=await second.text();assert.ok(!text.includes('private'));assert.ok(!text.includes('ndt_'));assert.match(text,/Testi/);
});
