const VIEWS = new Set(['month', 'week', 'day', 'list', 'year']);
const PARAMETERS = ['year', 'month', 'date', 'view'];

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(+parsed) && parsed.toISOString().slice(0, 10) === value;
}

// Old shared links still open the requested day. The homepage itself stays clean.
export function homeView(url, saved, today) {
  const query = new URL(url).searchParams;
  const linked = PARAMETERS.some(key => query.has(key));
  const source = linked ? Object.fromEntries(query) : (saved || {});
  const year = Number(source.year);
  const month = Number(source.month);
  const selected = validDate(source.date) ? source.date : today;
  const resolvedYear = Number.isInteger(year) && year >= 1900 && year <= 2100
    ? year : Number(selected.slice(0, 4));
  const resolvedMonth = Number.isInteger(month) && month >= 1 && month <= 12
    ? month : Number(selected.slice(5, 7));
  return {
    year: resolvedYear,
    month: resolvedMonth,
    date: selected.slice(0, 7) === `${resolvedYear}-${String(resolvedMonth).padStart(2, '0')}`
      ? selected : `${resolvedYear}-${String(resolvedMonth).padStart(2, '0')}-01`,
    view: VIEWS.has(source.view) ? source.view : 'month',
  };
}

export function cleanHomeURL(url) {
  const clean = new URL(url);
  PARAMETERS.forEach(key => clean.searchParams.delete(key));
  return `${clean.pathname}${clean.search}${clean.hash}`;
}

export function loadCalendarState(storage,cities){
 const key='kalenteri365-fi-v1';let saved=null;
 try{saved=JSON.parse(storage.getItem(key)||'null');if(!saved){const old=JSON.parse(storage.getItem('kalenteri365-v1')||'null');if(old){saved={version:1,events:(old.events||[]).map(e=>({...e,title:e.name,category:'personal',repeat:'none'})),tasks:(old.tasks||[]).map(t=>({...t,title:t.name})),notes:old.notes||{},plans:{},city:cities.find(c=>c[1]===old.city)?.[0]||'helsinki'};storage.setItem(key,JSON.stringify(saved));}}}catch{}
 const state={version:1,events:[],notes:{},tasks:[],plans:{},city:'helsinki',...(saved?.version===1?saved:{})};
 if(state.city==='mariehamn')state.city='maarianhamina';return state;
}
