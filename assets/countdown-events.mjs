const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fi-FI').trim();
const aliases = {
  uudenvuodenpaiva: 'uusivuosi uusi vuosi', uudenvuodenaatto: 'uusivuosi uusi vuosi',
  pitkaperjantai: 'pääsiäinen pääsiäispyhät', paasiaispaiva: 'pääsiäinen pääsiäispyhät',
  'toinen-paasiaispaiva': 'pääsiäinen pääsiäismaanantai',
  jouluaatto: 'joulu', joulupaiva: 'joulu', tapaninpaiva: 'joulu toinen joulupäivä',
  juhannusaatto: 'juhannus', juhannuspaiva: 'juhannus Suomen lipun päivä',
};
export function countdownSuggestions(events, {query = '', year = 'next', today} = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const explicitYear = terms.some(term => /^20\d{2}$/.test(term));
  const matches = events.filter(event => {
    if (year !== 'next' && !event.date.startsWith(String(year) + '-')) return false;
    if (year === 'next' && !explicitYear && event.date < today) return false;
    const [y, m, d] = event.date.split('-');
    const haystack = normalize(`${event.name} ${aliases[event.slug] || ''} ${event.date} ${Number(d)}.${Number(m)}.${y}`);
    return terms.every(term => haystack.includes(term));
  }).sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name, 'fi'));
  if (year !== 'next' || explicitYear) return matches;
  const seen = new Set();
  return matches.filter(event => !seen.has(event.slug) && seen.add(event.slug));
}
export function countdownEventSelection(event) {
  return {title: event.name, date: event.date, time: '00:00', occurrence: ''};
}
