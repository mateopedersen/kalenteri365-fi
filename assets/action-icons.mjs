// Small, stroke-aligned action marks shared by built pages and interactive tools.
const paths = {
  next:'m9 5 7 7-7 7',
  back:'m15 5-7 7 7 7',
  up:'M12 19V7m-5 5 5-5 5 5M5 4h14',
  down:'M12 5v12m-5-5 5 5 5-5M5 20h14',
  external:'M14 4h6v6m0-6L10 14M10 4H4v16h16v-6',
  download:'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
  expand:'M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5',
  calendar:'M4 6h16v14H4ZM8 3v6m8-6v6M4 11h16m-11 4h2m3 0h2',
  select:'m4 3 5 17 3-7 7-3Z',
  close:'m6 6 12 12M6 18 18 6',
};
export function actionIcon(name) {
  if(!paths[name]) throw new Error('Unknown action icon: '+name);
  return `<svg class="action-icon" data-action-icon="${name}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[name]}"/></svg>`;
}
export function actionLabel(href,label) {
  const text=String(label),match=/\s*([↗→←↑↓])\s*$/.exec(text);
  if(!match) return null;
  const name=match[1]==='↗' ? (/^https?:\/\//.test(href)?'external':'next') : ({'→':'next','←':'back','↑':'up','↓':'download'})[match[1]];
  return `<span class="action-label">${text.slice(0,match.index)}</span>${actionIcon(name)}`;
}
