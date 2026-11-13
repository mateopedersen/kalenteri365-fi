import test from 'node:test';
import assert from 'node:assert/strict';
import * as A from 'astronomy-engine';
import {localDayBounds,dayEvents} from '../src/solar-day.mjs';
import {solarSnapshot} from '../src/solar-scene-model.mjs';
import {panoramaView,projectPanorama} from '../assets/solar-panorama-core.mjs';
import {atmosphere} from '../assets/sun-scene-core.mjs';

const helsinki=['helsinki','Helsinki',60.1699,24.9384];
const utsjoki=['utsjoki','Utsjoki',69.909,27.027];
const clock=d=>new Intl.DateTimeFormat('fi-FI',{timeZone:'Europe/Helsinki',hour:'2-digit',minute:'2-digit',hour12:false}).format(d).replace('.',':');

test('Solar slider spans the whole Finnish local day across daylight saving changes',()=>{
  for(const [date,minutes] of [['2027-03-28',1380],['2027-10-31',1500],['2028-02-29',1440]]){
    const start=solarSnapshot(A,helsinki,date,0),end=solarSnapshot(A,helsinki,date,99999);
    assert.equal(start.max,minutes-1);
    assert.equal(clock(start.instant),'00:00');
    assert.equal(clock(end.instant),'23:59');
    assert.equal(end.minute,minutes-1);
  }
});

test('Finnish autumn clock change retains both occurrences of the repeated hour',()=>{
  const a=solarSnapshot(A,helsinki,'2027-10-31',210),b=solarSnapshot(A,helsinki,'2027-10-31',270);
  assert.equal(clock(a.instant),'03:30');assert.equal(clock(b.instant),'03:30');
  assert.equal(+b.instant-+a.instant,3600000);
  assert.notEqual(a.position.azimuth,b.position.azimuth);
});

test('Sun disc meets the horizon at the calculated rise and set instants',()=>{
  for(const city of [helsinki,utsjoki])for(const date of ['2027-04-15','2028-09-12']){
    const events=dayEvents(A,city,date),start=localDayBounds(date).start;
    for(const key of ['rise','set']){
      const snapshot=solarSnapshot(A,city,date,(events[key]-start)/60000);
      assert.ok(Math.abs(snapshot.position.renderAltitude+.2666)<.012,`${city[1]} ${date} ${key}: ${snapshot.position.renderAltitude}`);
      const before=solarSnapshot(A,city,date,(events[key]-start)/60000-10).position.renderAltitude;
      const after=solarSnapshot(A,city,date,(events[key]-start)/60000+10).position.renderAltitude;
      assert.ok(key==='rise'?before<after:before>after);
    }
  }
});

test('The camera follows the computed Sun within the stage on phone and desktop',()=>{
  for(const date of ['2027-01-01','2027-06-21'])for(const minute of [360,600,720,900,1200]){
    const snapshot=solarSnapshot(A,helsinki,date,minute),view=panoramaView(snapshot);
    assert.equal(view.altitude,snapshot.position.renderAltitude);
    if(view.altitude<0)continue;
    for(const [width,height] of [[360,250],[1200,324]]){
      const point=projectPanorama(view.altitude,snapshot.position.azimuth,view,width,height);
      assert.ok(point.visible,JSON.stringify({date,minute,width,height,point}));
    }
  }
});

test('City coordinates alter the scene and polar days do not invent sunrise events',()=>{
  const south=solarSnapshot(A,helsinki,'2027-06-21',720),north=solarSnapshot(A,utsjoki,'2027-06-21',720);
  assert.notEqual(south.position.altitude,north.position.altitude);
  for(const [date,polar] of [['2027-06-21','up'],['2027-12-21','down']]){
    const e=dayEvents(A,utsjoki,date);assert.equal(e.polar,polar);assert.equal(e.rise,null);assert.equal(e.set,null);
  }
});

test('Twilight labels use the original geometric coordinates without a second refraction correction',()=>{
  assert.equal(atmosphere(-17.8,-18.1).label,'Yö');
  assert.equal(atmosphere(-11.8,-12.1).label,'Astronominen hämärä');
  assert.equal(atmosphere(-5.8,-6.1).label,'Nauttinen hämärä');
  assert.equal(atmosphere(.3,-.2).label,'Porvarillinen hämärä');
});

test('Moon phase shading matches the calculated illuminated fraction',()=>{
  for(const date of ['2027-01-07','2027-01-15','2027-01-22','2027-01-29']){
    const s=solarSnapshot(A,helsinki,date,720,'Moon');
    const fractionFromDisc=(1-Math.cos(s.moon.angle*Math.PI/180))/2;
    assert.ok(Math.abs(fractionFromDisc-s.moon.fraction)<1e-12);
    assert.ok(s.moon.fraction>=0&&s.moon.fraction<=1);
    assert.ok(Number.isFinite(s.position.azimuth));
  }
});

test('Moonrise and moonset change the actual local Moon altitude',()=>{
  const date='2027-01-15',e=dayEvents(A,helsinki,date,'Moon'),start=localDayBounds(date).start;
  assert.ok(e.noon instanceof Date);
  for(const key of ['rise','set']){
    assert.ok(e[key] instanceof Date);
    const minute=(e[key]-start)/60000;
    const before=solarSnapshot(A,helsinki,date,minute-15,'Moon'),after=solarSnapshot(A,helsinki,date,minute+15,'Moon');
    assert.ok(key==='rise'?before.position.altitude<after.position.altitude:before.position.altitude>after.position.altitude);
  }
});

test('The lunar view follows the Moon but keeps illumination tied to the Sun',()=>{
  const s=solarSnapshot(A,helsinki,'2027-01-22',1080,'Moon'),v=panoramaView(s);
  assert.ok(Math.abs(v.bearing-s.position.azimuth)<1e-10);
  assert.equal(v.altitude,s.solarPosition.renderAltitude);
  assert.equal(v.geometricAltitude,s.solarPosition.geometricAltitude);
  assert.notEqual(v.bearing,s.solarPosition.azimuth);
});
