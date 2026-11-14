import {holidays, parse, add, iso, YEARS} from './calendar.mjs';
import {buildVacationPlan} from './vacation-core.mjs';

export const WEEKEND_TOPICS = [
  ['uudenvuodenpaiva','Vuodenvaihde','newyear','Vuoden ensimmäinen hengähdys.'],
  ['loppiainen','Loppiainen','epiphany','Talven keskelle pieni tauko.'],
  ['paasiaispaiva','Pääsiäinen','easter','Kevään pisin pyhäviikonloppu.'],
  ['vappu','Vappu','mayday','Toukokuun alku omassa tahdissa.'],
  ['helatorstai','Helatorstai','ascension','Torstain pyhä ja vapaa perjantai.'],
  ['juhannuspaiva','Juhannus','midsummer','Valoisat illat ja keskikesän päivät.'],
  ['itsenaisyyspaiva','Itsenäisyyspäivä','independence','Joulukuun alkuun hetki vapaata.'],
  ['joulupaiva','Joulu','christmas','Joulun pyhät samassa suunnitelmassa.'],
];

/** One holiday-anchored period per topic, within the selected civil year.
 * The chosen budget may cover a Friday or Monday at either end.
 * Workday classification is shared with the site's vacation planner.
 */
export function weekendOptions(year, budget = 1) {
  if (!YEARS.includes(year) || ![0,1,2,4].includes(budget)) throw Error('Valitse tuettu vuosi ja työpäivien määrä.');
  const events = holidays(year);
  return WEEKEND_TOPICS.flatMap(([slug,name,scene,description]) => {
    const event = events.find(item=>item.slug===slug);
    if (!event) throw Error('Puuttuva juhlapäivä: '+slug);
    const anchor = parse(event.date);
    const start = iso(add(anchor,-8)) < year+'-01-01' ? year+'-01-01' : iso(add(anchor,-8));
    const end = iso(add(anchor,8)) > year+'-12-31' ? year+'-12-31' : iso(add(anchor,8));
    const base = buildVacationPlan({start,end});
    const candidates = [];
    for(let i=0;i<base.days.length;i++) {
      let leaveDays=0;
      for(let j=i;j<Math.min(base.days.length,i+9);j++) {
        if(base.days[j].reason==='work') leaveDays++;
        if(leaveDays>budget) break;
        if(j-i<2 || base.days[i].date>event.date || base.days[j].date<event.date) continue;
        candidates.push({start:base.days[i].date,end:base.days[j].date,length:j-i+1,leaveDays});
      }
    }
    candidates.sort((a,b)=>b.length-a.length || a.leaveDays-b.leaveDays || a.start.localeCompare(b.start));
    if(!candidates.length) return [];
    const best=candidates[0];
    return [{slug,name,scene,description,holidayDate:event.date,...buildVacationPlan(best)}];
  });
}
