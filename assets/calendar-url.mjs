const SLUGS = ['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesakuu','heinakuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'];
const YEARS = [2027,2028,2029,2030];
const VIEWS = new Set(['month','week','day','list','year']);
const PARAMETERS = ['year','month','date','view'];
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10) === value;

// The page path identifies the month. Optional day/view state belongs in a
// fragment, so opening or navigating a month never creates a query-string URL.
export function calendarView(url, year, month) {
  const source = new URL(url);
  const fragment = new URLSearchParams(source.hash.slice(1));
  const params = fragment.has('date') || fragment.has('view') ? fragment : source.searchParams;
  return {
    date: validDate(params.get('date')) ? params.get('date') : `${year}-${String(month).padStart(2, '0')}-01`,
    view: VIEWS.has(params.get('view')) ? params.get('view') : 'month',
  };
}

export function calendarViewURL(input, { year, month, date, view = 'month' }) {
  const url = new URL(input);
  PARAMETERS.forEach(key => url.searchParams.delete(key));
  if (YEARS.includes(year) && Number.isInteger(month) && month >= 1 && month <= 12)
    url.pathname = `/kalenteri/${year}/${SLUGS[month - 1]}/`;
  const fragment = new URLSearchParams(url.hash.slice(1));
  if (fragment.has('date') || fragment.has('view')) url.hash = '';
  const first = `${year}-${String(month).padStart(2, '0')}-01`;
  if (validDate(date) && (date !== first || view !== 'month')) {
    const state = new URLSearchParams({ date });
    if (VIEWS.has(view) && view !== 'month') state.set('view', view);
    url.hash = state.toString();
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

