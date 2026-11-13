import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {EDUCATION_LEVELS,EXTRA_EDUCATION_RECORDS,VOCATIONAL_INDIVIDUAL} from '../assets/education-levels-data.mjs';
import {educationEvents,educationFeed} from '../assets/education-levels-core.mjs';
import {EDUCATION_RECORDS,writeEducationFeeds,educationHub} from '../src/education-hub.mjs';
import {civil} from '../assets/community-core.mjs';
test('School levels keep provider calendars separate and never invent national vocational holidays',()=>{
 assert.equal(EDUCATION_LEVELS.length,6);assert.equal(new Set(EDUCATION_LEVELS.map(l=>l.id)).size,6);
 assert.equal(EXTRA_EDUCATION_RECORDS.filter(r=>r.level==='lukio').length,2);
 assert(EXTRA_EDUCATION_RECORDS.every(r=>r.academicYear==='2026/2027'||r.level==='lukio'&&r.academicYear==='2027/2028'));
 assert(VOCATIONAL_INDIVIDUAL.note.includes('HOKS'));
 const hh=EXTRA_EDUCATION_RECORDS.find(r=>r.level==='amk');assert.equal(hh.breaks.some(p=>p.label.includes('Talviloma')),false);assert.equal(hh.periods.length,5);
 const hel=EXTRA_EDUCATION_RECORDS.find(r=>r.level==='lukio'&&r.academicYear==='2027/2028');assert.equal(hel.breaks.find(p=>p.label==='Talviloma').start,'2028-02-21');
 for(const r of EDUCATION_RECORDS){assert(r.source.startsWith('https://'));civil(r.checked);for(const p of [...r.periods,...r.breaks]){civil(p.start);civil(p.end);assert(p.end>=p.start)}}
});
test('Education exports preserve inclusive published dates as exclusive ICS ends with provider-specific identities',async()=>{
 const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'fi-education-'));try{
 await writeEducationFeeds(temporary,fs,path);let count=0;
 for(const r of EDUCATION_RECORDS)for(const kind of ['tauot','jaksot']){
 const events=educationEvents(r,kind);if(!events.length)continue;count++;
 const content=await fs.readFile(path.join(temporary,educationFeed(r,kind)),'utf8');
 assert(content.includes('PRODID:-//Kalenteri365//Education//FI'));assert.equal((content.match(/BEGIN:VEVENT/g)||[]).length,events.length);
 for(const e of events)assert(e.endDate>e.date);
 }
 assert(count>40);
 const h=EXTRA_EDUCATION_RECORDS.find(r=>r.id==='helsingin-lukiot-2027-2028');const text=await fs.readFile(path.join(temporary,educationFeed(h,'tauot')),'utf8');assert(text.includes('DTEND;VALUE=DATE:20280226'));assert(!text.includes('DTEND;VALUE=DATE:20280225'));
 }finally{await fs.rm(temporary,{recursive:true,force:true})}
});
test('School hub renders every level, substantive Finnish guidance and provider sources without JavaScript',()=>{
 const html=educationHub();for(const l of EDUCATION_LEVELS)assert(html.includes('id="oppiaste-'+l.id+'"'));
 assert(html.includes('Omnia'));assert(html.includes('Haaga-Helia'));assert(html.includes('HOKS'));assert(html.includes('Opetushallitus'));assert(!html.includes('undefined'));
});
