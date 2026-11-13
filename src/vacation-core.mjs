import {calculateWorkdays} from './workday-math.mjs';
import {civilDate} from './date-math.mjs';
import {add, iso} from './calendar.mjs';
import {serviceCalendar, serviceGoogleURL} from '../assets/finland-services-core.mjs';

const SITE = 'https://kalenteri365.fi/lomasuunnittelija/';
const dayLabel = date => new Intl.DateTimeFormat('fi-FI', {dateStyle:'short', timeZone:'UTC'}).format(civilDate(date));
const integer = (value, min, max, label) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw Error(`${label}: anna kokonaisluku väliltä ${min}–${max}.`);
  return n;
};
function fromDays(settings, days) {
  const leaveDates = days.filter(day => day.reason === 'work').map(day => day.date);
  return {start:days[0].date, end:days.at(-1).date, weekdays:[...settings.weekdays], eves:settings.eves,
    days, calendarDays:days.length, leaveDays:leaveDates.length, freeDays:days.length-leaveDates.length, leaveDates};
}

/** A plan uses the same inclusive civil-date classification as the workday tool. */
export function buildVacationPlan({start, end, weekdays = [1,2,3,4,5], eves = false} = {}) {
  const settings = {start, end, weekdays:[...weekdays], eves:Boolean(eves)};
  const result = calculateWorkdays({...settings, holidays:true, includeStart:true, includeEnd:true});
  return fromDays(settings, result.days);
}

export function findVacationOptions({start, end, weekdays = [1,2,3,4,5], eves = false,
  budget = 4, minLength = 3, maxLength = 14, limit = 6, allowedPeriods = []} = {}) {
  budget = integer(budget, 0, 90, 'Vapaaksi pyydettävien työpäivien määrä');
  minLength = integer(minLength, 1, 90, 'Lyhin jakso');
  maxLength = integer(maxLength, minLength, 90, 'Pisin jakso');
  limit = integer(limit, 1, 12, 'Vaihtoehtojen määrä');
  const base = buildVacationPlan({start, end, weekdays, eves});
  const periods = allowedPeriods.map(p => {
    if (civilDate(p.end) < civilDate(p.start)) throw Error('Koululoman loppu on ennen alkua.');
    return {start:p.start, end:p.end};
  });
  const candidates = [];
  for (let begin = 0; begin < base.days.length; begin++) {
    let needed = 0;
    for (let finish = begin; finish < base.days.length && finish < begin+maxLength; finish++) {
      if (base.days[finish].reason === 'work') needed++;
      if (needed > budget) break;
      const length = finish-begin+1;
      if (length < minLength) continue;
      const a = base.days[begin].date, b = base.days[finish].date;
      if (periods.length && !periods.some(p => a >= p.start && b <= p.end)) continue;
      candidates.push({begin, finish, length, needed, start:a, end:b});
    }
  }
  candidates.sort((a,b) => b.length-a.length || a.needed-b.needed || a.start.localeCompare(b.start));
  const selected = [];
  for (const candidate of candidates) {
    if (selected.some(p => !(candidate.end < p.start || candidate.start > p.end))) continue;
    selected.push(candidate);
    if (selected.length === limit) break;
  }
  return selected.map(p => fromDays(base, base.days.slice(p.begin, p.finish+1)));
}

const escape = value => String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[,;]/g, c => '\\'+c);
function fold(line) {
  let output = '', size = 0;
  for (const char of line) {
    const bytes = new TextEncoder().encode(char).length;
    if (size+bytes > 75) { output += '\r\n '; size = 1; }
    output += char; size += bytes;
  }
  return output;
}
const hash = value => {
  let n = 2166136261;
  for (const char of value) n = Math.imul(n ^ char.charCodeAt(0), 16777619);
  return (n >>> 0).toString(16);
};
function exportData(plan, options = {}) {
  const checked = buildVacationPlan(plan);
  const title = String(options.title || 'Oma lomasuunnitelma');
  if (title.length > 2000) throw Error('Suunnitelman nimi on liian pitkä.');
  const mode = options.mode ?? 'leave';
  if (!['leave', 'span'].includes(mode)) throw Error('Valitse haettavat työpäivät tai koko vapaa.');
  const summary = `Lomasuunnitelma ${dayLabel(checked.start)}–${dayLabel(checked.end)}. ${checked.calendarDays} kalenteripäivää, ${checked.leaveDays} vapaaksi pyydettävää työpäivää. Suunnitelma ei ole vahvistettu loma.`;
  const applies = summary + (checked.leaveDates.length ? '\nHaettavat työpäivät: '+checked.leaveDates.map(dayLabel).join(', ')+'.' : '\nJakso ei vaadi valitun työviikon työpäiviä.') +
    '\nTyöviikon päivät (ma=1, su=0): '+checked.weekdays.join(', ')+'. Juhannusaatto ja jouluaatto '+(checked.eves?'lasketaan vapaiksi.':'lasketaan työviikon mukaisesti.');
  return {plan:checked, title, mode, applies, reminder:options.reminder ?? 'none'};
}

/** Export individual requested workdays, or explicitly export one whole vacation span. */
export function vacationCalendar(plan, options = {}, now = new Date()) {
  const data = exportData(plan, options);
  const dates = data.mode === 'span' ? [data.plan.start] : data.plan.leaveDates;
  if (!dates.length) throw Error('Jaksolla ei ole haettavia työpäiviä. Valitse vienniksi koko vapaa.');
  const id = hash([data.plan.start, data.plan.end, data.plan.weekdays.join(','), data.plan.eves, data.mode].join('|'));
  const events = dates.map(date => {
    const event = {id:`vacation-${id}-${date}`, date,
      endDate:iso(add(civilDate(data.mode === 'span' ? data.plan.end : date),1)),
      name:data.title, applies:data.applies, source:SITE, tentative:true};
    return serviceCalendar(event, data.reminder, now).match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/)[0];
  });
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365.fi//Lomasuunnitelma//FI','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    fold('X-WR-CALNAME:'+escape(data.title)), 'X-WR-TIMEZONE:Europe/Helsinki', ...events, 'END:VCALENDAR',''].join('\r\n');
}

/** Google prefill is always one inclusive span; opening it does not save an event. */
export function vacationGoogleURL(plan, options = {}) {
  const data = exportData(plan, options);
  return serviceGoogleURL({id:'vacation-plan', date:data.plan.start, endDate:iso(add(civilDate(data.plan.end),1)),
    name:data.title, applies:data.applies, source:SITE, tentative:true});
}
