import {dayEvents, localDate, localDayBounds} from './solar-day.mjs';

// Share the exact rise/set calculations used in the daylight panel. A local
// clock-hour heuristic would fail in northern Finland and at DST boundaries.
const days=new Map();
export function cityPhotoState(A, city, instant = new Date()) {
  if (!Number.isFinite(+instant)) throw new TypeError('Invalid photo time');
  const ds=localDate(instant), key=[city[0],city[2],city[3],ds].join('|');
  if(!days.has(key)){
    if(days.size>=256)days.delete(days.keys().next().value);
    days.set(key,dayEvents(A,city,ds));
  }
  const {rise,set,polar}=days.get(key);
  let day;
  if(rise&&set) day=rise<set?instant>=rise&&instant<set:instant<set||instant>=rise;
  else if(rise) day=instant>=rise;
  else if(set) day=instant<set;
  else day=polar==='up';
  const transitions=[rise,set,localDayBounds(ds).end].filter(value=>value&&value>instant).sort((a,b)=>a-b);
  return {period:day?'day':'night',nextChange:transitions[0]};
}

export const cityPhotoPeriod=(A,city,instant)=>cityPhotoState(A,city,instant).period;
export function cityPhotoVariant(entry, period) {
  return period === 'night' ? entry.night || null : entry;
}
