import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {pathToFileURL} from 'node:url';
import {holidays} from '../src/calendar.mjs';
const dir=await mkdtemp(join(tmpdir(),'fi-studio-'));after(()=>rm(dir,{recursive:true,force:true}));
for(const f of ['engine.mjs','templates.mjs','office-exports.mjs','binary-exports.mjs','export-pipeline.mjs'])await writeFile(join(dir,f),await readFile(new URL('../assets/studio/'+f,import.meta.url)));
await writeFile(join(dir,'finland-data.mjs'),'export const STUDIO_PHOTOS=[];export const FINLAND_HOLIDAYS='+JSON.stringify(Object.fromEntries([2026,2027,2028,2029,2030,2031].map(y=>[y,holidays(y).filter(h=>h.type==='holiday').map(h=>({date:h.date,title:h.name,holiday:true}))])))+';');
const {initialState,normalize,updatePeriod,starterState,STARTERS,renderCalendar,eventsFor,weekDates,exportPages}=await import(pathToFileURL(join(dir,'engine.mjs')));
const {createXlsx}=await import(pathToFileURL(join(dir,'office-exports.mjs')));
const {exportName}=await import(pathToFileURL(join(dir,'export-pipeline.mjs')));
const image={bytes:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aPioAAAAASUVORK5CYII=', 'base64'),width:1,height:1};
test('weekly dates include the correct Monday and Sunday across New Year',()=>{const s=normalize({...initialState(),view:'week',weekDate:'2027-01-01'});assert.deepEqual(weekDates(s).map(d=>d.date),['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']);assert(eventsFor(s).some(e=>e.date==='2027-01-01'));assert(!eventsFor(s).some(e=>e.date==='2027-01-06'));});
test('weekly recurring events work when a week extends to the following year',()=>{const s=normalize({...initialState(2030),view:'week',weekDate:'2030-12-31',events:[{id:'birthday',date:'2028-01-01',title:'Syntymäpäivä',annual:true},{date:'2030-12-20',title:'Ei tällä viikolla'}]});assert(eventsFor(s).some(e=>e.date==='2031-01-01'&&e.title==='Syntymäpäivä'));assert(eventsFor(s).some(e=>e.date==='2031-01-01'&&e.holiday));assert(!eventsFor(s).some(e=>e.title==='Ei tällä viikolla'));});
test('sixteen starter designs cover all four views and preserve personal events',()=>{assert.equal(STARTERS.length,16);assert.equal(new Set(STARTERS.map(x=>x.id)).size,16);assert.deepEqual(new Set(STARTERS.map(x=>x.view)),new Set(['month','year','week','blank']));for(const x of STARTERS){const s=starterState(x.id,{...initialState(2028),events:[{id:'own',date:'2028-02-29',title:'Oma päivä'}]});assert.equal(s.events.length,1);const svg=renderCalendar(s,{editing:true});assert(!svg.includes('NaN'));assert(svg.includes('Kalenteri365'));assert(svg.includes('kalenteri365.fi'));}});
test('blank templates show no dates or holiday events and weekly preview has seven actionable days',()=>{const blank=renderCalendar(starterState('blank-grid'),{editing:true});assert(!blank.includes('data-calendar-date='));assert.equal(eventsFor(starterState('blank-grid')).length,0);const week=renderCalendar(starterState('week-work'),{editing:true});assert.equal((week.match(/data-calendar-date=/g)||[]).length,7);});
test('the free blank page does not contain weekday headings or a hidden year calendar',()=>{
  const svg=renderCalendar(starterState('blank-page'));
  for(const word of ['Ma','Ti','Ke','To','Pe','La','Su','TAMMIKUU'])assert(!svg.includes('>'+word+'</text>'));
});
test('decorations retain their proportions when the paper changes orientation or size',()=>{
  const base=starterState('month-finland');
  for(const paper of ['a4','a3'])for(const orientation of ['landscape','portrait']){
    const s=normalize({...base,paper,orientation,layers:[{id:'decoration',type:'sticker',symbol:'heart',width:10,height:14.14,x:5,y:60}]});
    const layer=renderCalendar(s,{editing:true}).split('data-layer="decoration"')[1];
    const [,x,y]=layer.match(/scale\(([\d.]+) ([\d.]+)\)/);
    assert.equal(Number(x),Number(y),'A paper change must not stretch a sticker');
  }
});
test('untrusted imported text is escaped and sticker identifiers are constrained',()=>{const s=normalize({...initialState(),layers:[{id:'x',type:'sticker',symbol:'<script>',width:10,height:10},{id:'y',type:'text',text:'<script>alert(1)</script>'}]});const svg=renderCalendar(s);assert.equal(s.layers[0].symbol,'star');assert(!svg.includes('<script>'));assert(svg.includes('&lt;script&gt;'));});
test('weekly and blank Excel files export appropriate editable sheets and dates',()=>{for(const id of ['week-work','blank-grid']){const s=starterState(id);const bytes=createXlsx(s,[image]);const text=new TextDecoder().decode(bytes);assert(text.includes(id==='week-work'?'Viikkosuunnitelma':'Tyhjä pohja'));assert(!text.includes('name="Tammikuu"'));assert(text.includes('Tulostusasu'));assert(text.includes('horizontalDpi="600"'));}});
test('weekly names and output scope do not silently become monthly exports',()=>{const s=starterState('week-work');assert(exportName(s).includes('viikko-2027-01-04'));assert.equal(exportPages(s,'all').length,1);assert(exportName(starterState('blank-grid')).endsWith('-pohja'));});
test('switching calendar scope updates the starter heading and preserves personal content',()=>{
  const s=starterState('month-finland',{...initialState(),events:[{id:'own',date:'2027-05-01',title:'Oma meno'}]});
  const year=updatePeriod(s,{view:'year'});
  assert.equal(year.title,'Oma vuoteni');assert.equal(year.events[0].title,'Oma meno');assert.deepEqual(year.colors,s.colors);
  assert.equal(updatePeriod(year,{view:'week'}).title,'Viikkosuunnitelma');
  assert.match(updatePeriod(updatePeriod(year,{year:2028}),{view:'week'}).weekDate,/^2028-/);
  assert.equal(updatePeriod({...s,title:'Ainon suunnitelmat'},{view:'year'}).title,'Ainon suunnitelmat');
});
test('weekly year changes keep a real date, including leap-day clamping',()=>{
  const s={...starterState('week-work'),year:2028,weekDate:'2028-02-29'};
  const next=updatePeriod(s,{year:2029});assert.equal(next.weekDate,'2029-02-28');assert.equal(next.year,2029);
  assert(weekDates(next).some(d=>d.date==='2029-02-28'));
  const chosen=updatePeriod(next,{weekDate:'2030-12-30'});assert.equal(chosen.year,2030);assert.equal(chosen.month,12);assert.equal(chosen.weekDate,'2030-12-30');
  assert.equal(updatePeriod(next,{weekDate:'2029-02-29'}).weekDate,'2029-02-28');
  assert.equal(updatePeriod(next,{year:2100}).year,2029);
});
test('choosing a weekly starter keeps the selected year in its dates and exports',()=>{
  const current={...starterState('month-finland'),year:2029};
  for(const preset of STARTERS.filter(p=>p.view==='week')){
    const chosen=starterState(preset.id,current);
    assert.equal(chosen.year,2029);
    assert.match(chosen.weekDate,/^2029-/);
    assert(weekDates(chosen).every(day=>day.year===2029));
    assert.match(exportName(chosen),/2029/);
  }
});
