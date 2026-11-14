import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {EDUCATION_RECORDS} from '../src/education-hub.mjs';
import {INSTITUTION_LOGOS,institutionIdentity} from '../src/institution-identity.mjs';
import {educationLogo,educationRecordHTML} from '../assets/education-levels-core.mjs';
test('Every listed institution has an exact source-bound authentic logo with current bytes',async()=>{
 const names=[...new Set(EDUCATION_RECORDS.map(r=>r.institution))];
 assert.equal(names.length,17);assert.equal(INSTITUTION_LOGOS.length,names.length);
 for(const name of names){const identity=institutionIdentity(name);assert(identity,name);const bytes=await fs.readFile(new URL('..'+identity.src,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),identity.sha256,name);assert(identity.source.startsWith('https://'));assert(identity.assetSource.startsWith('https://'));assert(identity.rights);}
 assert.equal(institutionIdentity('Unlisted school'),null);
 const t=institutionIdentity('Tampereen yliopisto');assert.equal(t.id,'tampere');assert(!t.src.includes('tamk'));
 const oulu=await fs.readFile(new URL('..'+institutionIdentity('Oulun yliopisto').src,import.meta.url),'utf8');assert.match(oulu,/viewBox="0 0 207 18"/);
 for(const id of ['hanken','lut','uniarts']){const identity=INSTITUTION_LOGOS.find(l=>l.id===id);assert.match(educationLogo({identity,institution:identity.name}),/education-logo-dark/);}
});
test('Verified publications preserve campus exceptions and distinguish breaks from study periods',()=>{
 const record=(name,year)=>EDUCATION_RECORDS.find(r=>r.institution===name&&r.academicYear===year);
 assert.deepEqual(record('Helsingin yliopisto','2027/2028').breaks,[{label:'Pääsiäistauko',start:'2028-04-13',end:'2028-04-19'}]);
 assert.equal(record('Oulun yliopisto','2026/2027').periods.length,6);
 assert.equal(record('Tampereen yliopisto','2026/2027').breaks.find(b=>b.label==='Pääsiäistauko').end,'2027-03-30');
 assert.equal(record('Turun yliopisto','2029/2030').periods.at(-1).end,'2030-07-31');
 const hh=record('Haaga-Helia ammattikorkeakoulu','2027/2028');assert(hh.note.includes('17.30'));assert(!hh.breaks.some(b=>b.start==='2028-04-13'));assert(!hh.breaks.some(b=>b.label==='Talviloma'));assert(hh.breaks.some(b=>b.start==='2028-01-03'&&b.end==='2028-01-07'));
 assert.equal(record('Maanpuolustuskorkeakoulu','2026/2027').periods.length,0);
 assert.equal(record('Vaasan yliopisto','2026/2027').periods.some(p=>/^4[. ]/.test(p.label)),false);
 assert.equal(record('Helsingin yliopisto','2029/2030'),undefined);
 assert.match(educationRecordHTML(record('Åbo Akademi','2027/2028')),/viikkorajoista laskettu/);
 assert.match(educationRecordHTML(hh),/1 kalenteripäivä</);
});
