import {localDayBounds} from './solar-day.mjs';

// SearchRiseSet uses standard 34 arcminute horizon refraction. Match that
// model near the horizon instead of correcting an apparent altitude twice.
export function solarVisualAltitude(geometric,apparent){
  const weight=Math.max(0,Math.min(1,(3-Math.abs(geometric))/2));
  return apparent+(geometric+34/60-apparent)*weight;
}

export function createSolarSampler(A,city,date,body='Sun'){
  const context={bounds:localDayBounds(date),observer:new A.Observer(city[2],city[3],0)};
  return minute=>solarSnapshot(A,city,date,minute,body,context);
}

export function solarSnapshot(A,city,date,minute,body='Sun',context){
  const bounds=context?.bounds||localDayBounds(date);
  const max=Math.round((bounds.end-bounds.start)/60000)-1;
  const elapsed=Math.max(0,Math.min(max,Number(minute)||0));
  const instant=new Date(+bounds.start+elapsed*60000);
  const observer=context?.observer||new A.Observer(city[2],city[3],0);
  const equatorial=A.Equator(body,instant,observer,true,true);
  const geometric=A.Horizon(instant,observer,equatorial.ra,equatorial.dec);
  const apparent=A.Horizon(instant,observer,equatorial.ra,equatorial.dec,'normal');
  const snapshot={body,position:{...apparent,geometricAltitude:geometric.altitude,renderAltitude:body==='Sun'?solarVisualAltitude(geometric.altitude,apparent.altitude):apparent.altitude},instant,city:{lat:city[2],lon:city[3],name:city[1]},minute:elapsed,max};
  if(body==='Moon'){
    const solarEquatorial=A.Equator('Sun',instant,observer,true,true);
    const solarGeometric=A.Horizon(instant,observer,solarEquatorial.ra,solarEquatorial.dec);
    const solarApparent=A.Horizon(instant,observer,solarEquatorial.ra,solarEquatorial.dec,'normal');
    snapshot.solarPosition={...solarApparent,geometricAltitude:solarGeometric.altitude,renderAltitude:solarVisualAltitude(solarGeometric.altitude,solarApparent.altitude)};
    const illumination=A.Illumination('Moon',instant),elongation=A.MoonPhase(instant);
    snapshot.moon={fraction:illumination.phase_fraction,angle:elongation<180?180-illumination.phase_angle:180+illumination.phase_angle,waxing:elongation<180};
  }
  return snapshot;
}
