export const STAGES = {
  indoor: 'Esikasvatus', light: 'Esikasvatus lisävalolla',
  direct: 'Suorakylvö', planting: 'Istutus',
};
export function cropTasks(crop, month) {
  const has = key => (crop[key] || []).includes(Number(month));
  const result = [];
  if (has('withGrowLightMonths')) result.push('light');
  else if (has('indoorMonths')) result.push('indoor');
  if (has('directMonths') || has('containerDirectMonths')) result.push('direct');
  if (has('outdoorMonths')) result.push('planting');
  return result;
}
const fold = value => String(value || '').toLocaleLowerCase('fi').normalize('NFD').replace(/\p{M}/gu, '');
export function matchesCrop(crop, {month='', stage='', query=''}={}) {
  const tasks = month ? cropTasks(crop, month) : Array.from({length:12},(_,i)=>cropTasks(crop,i+1)).flat();
  return (!month || tasks.length>0) && (!stage || tasks.includes(stage) || stage==='indoor' && tasks.includes('light')) && (!query.trim() || fold(crop.name).includes(fold(query.trim())));
}
export function sowingWindow(value, minWeeks, maxWeeks) {
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  const date = parsed && new Date(Date.UTC(Number(parsed[1]),Number(parsed[2])-1,Number(parsed[3])));
  if (!date || date.toISOString().slice(0,10)!==value) throw Error('Valitse kelvollinen istutuspäivä.');
  const min=Number(minWeeks), max=Number(maxWeeks);
  if (![min,max].every(n=>Number.isInteger(n)&&n>=1&&n<=30)) throw Error('Anna esikasvatuksen kesto kokonaisina viikkoina, 1–30.');
  if (min>max) throw Error('Lyhin kasvatusaika ei voi olla pisintä suurempi.');
  const before = weeks => {const d=new Date(date);d.setUTCDate(d.getUTCDate()-weeks*7);return d.toISOString().slice(0,10);};
  return {start:before(max),end:before(min),planting:value};
}
