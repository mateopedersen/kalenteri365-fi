import test from 'node:test';
import assert from 'node:assert/strict';
import * as A from 'astronomy-engine';
import {dayEvents} from '../src/solar-day.mjs';
import {daylightSegments,daylengthMetrics,durationLabel} from '../src/daylength-metrics.mjs';
import {daylightChart} from '../src/daylight-chart.mjs';

const helsinki=['helsinki','Helsinki',60.1699,24.9384],utsjoki=['utsjoki','Utsjoki',69.909,27.027];
const add=(ds,n)=>new Date(+new Date(ds+'T12:00Z')+n*86400000).toISOString().slice(0,10);

test('Daylight and below-horizon time cover Finnish DST days without assuming 24 hours',()=>{
 for(const [date,total] of [['2027-03-28',1380],['2027-10-31',1500]]){
  const events=dayEvents(A,helsinki,date),m=daylengthMetrics(date,events,dayEvents(A,helsinki,add(date,-1)),dayEvents(A,helsinki,add(date,7)));
  assert.equal(m.total,total);assert.equal(m.daylight+m.below,total);
  assert.ok(Math.abs(m.segments.reduce((sum,[a,b])=>sum+b-a,0)-m.daylight)<1);
 }
});

test('Daylight segments correctly represent polar day, polar night and single-event days',()=>{
 for(const [date,minutes] of [['2027-06-21',1440],['2027-12-21',0]]){
  const {segments}=daylightSegments(date,dayEvents(A,utsjoki,date));
  assert.equal(segments.reduce((sum,[a,b])=>sum+b-a,0),minutes);
 }
 let single=0;
 for(let day=1;day<=31;day++){
  const date=`2027-05-${String(day).padStart(2,'0')}`,e=dayEvents(A,utsjoki,date);
  if(Boolean(e.rise)===Boolean(e.set))continue;
  const result=daylightSegments(date,e);assert.equal(result.segments.length,1);single++;
  assert.ok(Math.abs(result.segments[0][1]-result.segments[0][0]-e.duration)<1);
 }
 assert.ok(single>0);
});

test('Changes compare actual daylight durations with the previous day and following week',()=>{
 const date='2027-04-15',e=dayEvents(A,helsinki,date),prev=dayEvents(A,helsinki,add(date,-1)),next=dayEvents(A,helsinki,add(date,7)),m=daylengthMetrics(date,e,prev,next);
 assert.equal(m.delta,e.duration-prev.duration);assert.equal(m.weekDelta,next.duration-e.duration);assert.ok(m.delta>0&&m.weekDelta>0);
 assert.equal(durationLabel(0),'0 h 0 min');assert.equal(durationLabel(1440),'24 h 0 min');
});

test('All twelve month controls expose their measured day length and selected month',()=>{
 const rows=Array.from({length:12},(_,i)=>({date:`2027-${String(i+1).padStart(2,'0')}-15`,rise:'08:00',set:'17:00',duration:(i+1)*60}));
 const html=daylightChart(helsinki,2027,rows,5);
 assert.equal((html.match(/data-daylight-index=/g)||[]).length,12);
 assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
 assert.ok(html.includes('data-daylight-index="5" aria-pressed="true"'));
 assert.ok(html.includes('data-daylight-open="2027-06-15"'));
 assert.ok(html.includes('Kesäkuu: 6 h 0 min'));
});
