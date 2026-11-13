// Civil dates are compared in UTC; no browser-local DST arithmetic.
export const civil = value => {
  const d = new Date(value + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(+d) || d.toISOString().slice(0,10) !== value) throw Error('Virheellinen päivämäärä');
  return d;
};
const iso = d => d.toISOString().slice(0,10);
const move = (value,n) => iso(new Date(+civil(value) + n*86400000));
export const slug = value => value.toLocaleLowerCase('fi').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const schoolKey = r => [slug(r.municipality),r.language||'fi',r.academicYear.replace('/','-')].join('-');
export function schoolPeriods(record, weekends=false) {
  const periods = [['Syysloma',record.autumnBreak],['Joululoma',record.christmasBreak],['Talviloma',record.winterBreak]]
    .filter(([,d]) => d?.length === 2).map(([label,[start,end]]) => ({label,start,end}));
  for (const p of record.additionalBreaks||[]) periods.push({...p});
  return periods.map(p => {
    civil(p.start); civil(p.end);
    if (p.end < p.start) throw Error('Loman loppu ennen alkua');
    if (!weekends) return {...p};
    let start=p.start,end=p.end;
    while ([0,6].includes(civil(move(start,-1)).getUTCDay())) start=move(start,-1);
    while ([0,6].includes(civil(move(end,1)).getUTCDay())) end=move(end,1);
    return {...p,officialStart:p.start,officialEnd:p.end,start,end};
  }).sort((a,b)=>a.start.localeCompare(b.start));
}
export function compareSchools(a,b,weekends=false) {
  return schoolPeriods(a,weekends).flatMap(x=>schoolPeriods(b,weekends).flatMap(y=>{
    const start=x.start>y.start?x.start:y.start,end=x.end<y.end?x.end:y.end;
    return start<=end?[{start,end,days:Math.round((civil(end)-civil(start))/86400000)+1,labels:[x.label,y.label]}]:[];
  }));
}
export const schoolEvents = record => schoolPeriods(record).map(p=>({
  id:'school-'+schoolKey(record)+'-'+slug(p.label),date:p.start,endDate:move(p.end,1),
  name:record.municipality+': '+p.label,
  applies:'Kunnan '+(record.language==='sv'?'ruotsinkielinen':'suomenkielinen')+' perusopetus. '+(record.notes_fi||''),
  period:'Lukuvuosi '+record.academicYear,source:record.source,checked:record.checked,
}));
export function nextSchoolBreak(records, today) {
  civil(today);
  return records.flatMap(r=>schoolPeriods(r,true).map(p=>({...p,record:r}))).filter(p=>p.end>=today).sort((a,b)=>a.start.localeCompare(b.start))[0]||null;
}
export function nextPayment(plan,today){civil(today);return plan?.dates.find(d=>d>=today)||null;}
export function normalPreferences(value={}) {
  return {
    municipality:typeof value.municipality==='string'?value.municipality:'Helsinki',
    language:value.language==='sv'?'sv':'fi',
    academicYear:/^20\d\d\/20\d\d$/.test(value.academicYear||'')?value.academicYear:'2026/2027',
    interests:[...new Set((Array.isArray(value.interests)?value.interests:[]).filter(x=>['school','admissions','payments'].includes(x)))],
    paymentPlan:typeof value.paymentPlan==='string'?value.paymentPlan:'',
  };
}
