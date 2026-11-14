import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/finland.json' with {type:'json'};
import {universityProfile,universityMetadata,universityOverviewIntro,universityYearIntro,universityPlanningGuide,universityYearLinks,universityHubIntro,universityHubGuide,universityPath} from '../src/university-content.mjs';
import {pageMetadata,brandedTitle,assertUniqueMetadata} from '../src/metadata.mjs';
const names=[...new Set(data.universityCalendars.map(r=>r.institution))];
const sources=Object.fromEntries(data.sources.map(s=>[s.id,s]));
test('Every university has specific Finnish copy and source-backed planning guidance',()=>{
 const lead=new Set(),advice=new Set();
 for(const name of names){const rs=data.universityCalendars.filter(r=>r.institution===name),p=universityProfile(name);assert(!lead.has(p.lead));lead.add(p.lead);assert(!advice.has(p.planning));advice.add(p.planning);
 const introduction=universityOverviewIntro(name,rs);for(const r of rs)assert(introduction.includes(universityPath(name,r.academicYear)));assert(introduction.includes(p.lead));
 const guide=universityPlanningGuide(name,rs,sources[rs[0].sourceId]);assert(guide.includes(sources[rs[0].sourceId].url));assert(guide.includes('/opiskelukalenteri/'));assert(guide.includes('/lukujarjestys/'));assert(!guide.includes('undefined'));}
 assert.equal(lead.size,14);assert.equal(advice.size,14);assert.throws(()=>universityProfile('Unknown institution'));
});
test('Overview and academic-year SEO stay distinct even for institutions with a single publication',()=>{
 const seen={title:new Map(),description:new Map()};let count=0;
 for(const name of names){const rs=data.universityCalendars.filter(r=>r.institution===name);
 const cases=[{records:rs,path:universityPath(name),yearPage:false},...rs.map(r=>({records:[r],path:universityPath(name,r.academicYear),yearPage:true}))];
 for(const entry of cases){const raw=universityMetadata(name,entry.records,{yearPage:entry.yearPage});const m=pageMetadata(entry.path,raw.title,raw.description);assertUniqueMetadata({title:brandedTitle(m.title),description:m.description},entry.path,seen);assert(m.title.startsWith(universityProfile(name).genitive));if(entry.yearPage)assert(m.title.includes(entry.records[0].academicYear.replace('/','–')));assert(!brandedTitle(m.title).includes(' - Kalenteri365'));count++;}}
 assert.equal(count,names.length+data.universityCalendars.length);
});
test('Year introductions describe published periods and never fabricate holidays for missing or derived calendars',()=>{
 for(const r of data.universityCalendars){const text=universityYearIntro(r.institution,r);assert(text.includes(r.academicYear.replace('/','–')));assert(!text.includes('undefined'));const others=data.universityCalendars.filter(i=>i.institution===r.institution);const links=universityYearLinks(r.institution,r,others);assert(!links.includes('href="'+universityPath(r.institution,r.academicYear)+'"'));}
 const mpkk=data.universityCalendars.find(r=>r.institution==='Maanpuolustuskorkeakoulu');assert(universityYearIntro(mpkk.institution,mpkk).includes('ei ole vahvistettu'));assert(!universityPlanningGuide(mpkk.institution,[mpkk],sources[mpkk.sourceId]).includes('ICS-tiedoston'));
 const abo=data.universityCalendars.find(r=>r.institution==='Åbo Akademi');assert(universityYearIntro(abo.institution,abo).includes('viikkorajoista laskettua'));
 const noBreak=data.universityCalendars.find(r=>r.institution==='Oulun yliopisto');assert(universityYearIntro(noBreak.institution,noBreak).includes('ei siksi merkitä lomiksi'));
});
test('Directory introduction and guide connect real university, school and study intents',()=>{
 const intro=universityHubIntro(data.universityCalendars),guide=universityHubGuide();assert(intro.includes('14 suomalaisen yliopiston'));assert(intro.includes('/koulujen-lomat/'));assert(guide.includes('https://studies.helsinki.fi/ohjeet/artikkeli/lukuvuosi-ja-opetusperiodit'));assert(guide.includes('/blogi/opintoperiodit-ja-tentit/'));assert(guide.includes('#oppiaste-amk'));assert(guide.includes('#oppiaste-lukio'));
});
