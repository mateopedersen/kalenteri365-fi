import {add, day, fi, holidays, iso, parse} from './calendar.mjs';
import {familyICS} from './family-calendar.mjs';

export function validDay(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(+parse(value)) && iso(parse(value)) === value;
}

export function occurs(event, date) {
  if (!validDay(event.date) || !validDay(date) || event.date > date || event.exdates?.includes(date)) return false;
  if (!event.repeat || event.repeat === 'none') return event.date === date;
  if (event.until && date > event.until) return false;
  const a = parse(event.date), b = parse(date), interval = event.interval || 1;
  const days = Math.round((b - a) / 86400000);
  if (event.repeat === 'daily') return days % interval === 0;
  if (event.repeat === 'weekly') return days % (7 * interval) === 0;
  if (event.repeat === 'monthly') return b.getUTCDate() === a.getUTCDate()
    && ((b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth()) % interval === 0;
  return event.repeat === 'yearly' && b.getUTCMonth() === a.getUTCMonth()
    && b.getUTCDate() === a.getUTCDate() && (b.getUTCFullYear() - a.getUTCFullYear()) % interval === 0;
}

export function weekDays(anchor) {
  if (!validDay(anchor)) throw Error('Valitse kelvollinen päivämäärä.');
  const start = add(parse(anchor), -day(parse(anchor)));
  return Array.from({length:7}, (_,i) => iso(add(start,i)));
}

export function weekPlan(state, anchor) {
  const holidayCache = new Map();
  return weekDays(anchor).map(date => {
    const year = Number(date.slice(0,4));
    if (!holidayCache.has(year)) holidayCache.set(year, holidays(year));
    return {
      date,
      events: (state.events || []).filter(event => occurs(event,date))
        .sort((a,b) => (a.time || '').localeCompare(b.time || '') || a.title.localeCompare(b.title,'fi')),
      tasks: (state.tasks || []).filter(task => task.date === date),
      note: state.notes?.[date] || '',
      holidays: holidayCache.get(year).filter(item => item.date === date && item.type === 'holiday'),
    };
  });
}

export function orderedTasks(tasks, {anchor, filter='open', today=anchor}={}) {
  const days = new Set(weekDays(anchor));
  const rank = {high:0,normal:1,low:2};
  return tasks.filter(task => filter === 'done' ? task.done
    : !task.done && (filter !== 'week' || days.has(task.date)))
    .slice().sort((a,b) =>
      Number(a.date >= today) - Number(b.date >= today)
      || (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1)
      || String(a.date || '').localeCompare(String(b.date || ''))
      || a.title.localeCompare(b.title,'fi'));
}

export function validateTask(values) {
  const title = String(values.title || '').trim();
  if (!title || title.length > 160) throw Error('Kirjoita tehtävälle nimi, enintään 160 merkkiä.');
  if (!validDay(values.date) || values.date < '1900-01-01' || values.date > '2100-12-31') throw Error('Valitse tehtävälle kelvollinen päivämäärä.');
  return {title,date:values.date,priority:['high','normal','low'].includes(values.priority)?values.priority:'normal'};
}

export function personalWeekICS(state, anchor) {
  const plan = weekPlan(state,anchor);
  const events = plan.flatMap(item => item.events.map(event => ({
    ...event, person:'own', date:item.date,
    id:'own-'+String(event.id).replace(/[^a-zA-Z0-9_-]/g,'')+'-'+item.date,
  })));
  if (!events.length) throw Error('Lisää viikolle tapahtuma ennen kalenterin lataamista.');
  return familyICS(events,[{id:'own',name:'Oma arki'}],{
    name:'Oma viikko '+fi(parse(plan[0].date))+'–'+fi(parse(plan[6].date)),
  });
}
