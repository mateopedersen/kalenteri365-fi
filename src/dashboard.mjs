import {holidays, parse} from './calendar.mjs';
import {art, icon, esc, link, button} from './ui.mjs';

export const CALENDAR_LAYERS = [
  ['holiday', 'Suomen pyhäpäivät ja aatot', 'Pyhät', 'celebrations'],
  ['flag', 'Liputus- ja merkkipäivät', 'Merkkipäivät', 'flag'],
  ['personal', 'Omat tapahtumat', 'Omat', 'dayplan'],
  ['work', 'Työ', 'Työ', 'briefcase'],
  ['family', 'Perhe', 'Perhe', 'family'],
  ['school', 'Opiskelu', 'Opiskelu', 'study'],
];

export function calendarFilterIds(saved) {
  return Array.isArray(saved) ? saved.filter(id => CALENDAR_LAYERS.some(layer => layer[0] === id)) : CALENDAR_LAYERS.map(layer => layer[0]);
}

export function upcomingDates(today, onlyHolidays = false, limit = 3) {
  const year = Number(today.slice(0, 4));
  return [...holidays(year), ...holidays(year + 1)]
    .filter(item => item.date >= today && (!onlyHolidays || item.type === 'holiday'))
    .slice(0, limit);
}

export function upcomingItems(today, onlyHolidays = false) {
  return upcomingDates(today, onlyHolidays).map(item => {
    const date = parse(item.date);
    const distance = Math.round((date - parse(today)) / 86400000);
    const type = {holiday: 'Pyhäpäivä', flag: 'Liputuspäivä', eve: 'Aatto', observance: 'Merkkipäivä'}[item.type];
    return link('/juhlapyhat/' + item.slug + '/', `<time datetime="${item.date}">${date.getUTCDate()}.${date.getUTCMonth() + 1}.</time><span class="upcoming-copy"><strong>${esc(item.name)}</strong><span class="upcoming-meta"><span class="upcoming-type ${item.type}">${type}</span><small>${distance === 0 ? 'Tänään' : distance === 1 ? 'Huomenna' : distance + ' pv'}</small></span></span>${icon('chevron')}`, 'upcoming-item');
  }).join('');
}

export function upcomingPanel(today, { overviewLink = true } = {}) {
  return `<section class="panel upcoming-panel"><div class="dashboard-panel-heading">${art('calendar')}<h2>Seuraavat juhlat</h2></div><div class="upcoming-tabs" role="group" aria-label="Tulevien päivien rajaus"><button type="button" data-upcoming="all" aria-pressed="true">Kaikki päivät</button><button type="button" data-upcoming="holidays" aria-pressed="false">Vain pyhät</button></div><div id="upcoming">${upcomingItems(today)}</div>${overviewLink ? link('/juhlapyhat/', 'Juhlat ja niiden taustat ' + icon('arrow'), 'dashboard-more') : ''}</section>`;
}

export function calendarFilters() {
  return `<section class="panel filter-list calendar-layers"><div class="dashboard-panel-heading">${art('grid')}<h2>Omat kalenterit</h2></div><p class="layers-intro">Valitse kalenterissa näkyvät merkinnät.</p><div class="layer-options">${CALENDAR_LAYERS.map(([id, label, , illustration]) => `<label class="calendar-layer layer-${id}"><input type="checkbox" data-filter="${id}" checked>${art(illustration)}<span>${label}</span><span class="layer-count" data-layer-count="${id}" aria-label="Merkintöjä tässä kuussa">0</span></label>`).join('')}</div><button class="layers-reset" type="button" data-action="all-calendars">${icon('check')} Näytä kaikki</button></section>`;
}

export function calendarChips() {
  return `<div class="calendar-chipbar" role="group" aria-label="Näytä vain valitun kalenterin merkinnät"><button type="button" data-focus-layer="all" aria-pressed="true">${icon('grid')} Kaikki</button>${CALENDAR_LAYERS.map(([id, , short, illustration]) => `<button type="button" class="layer-${id}" data-focus-layer="${id}" aria-pressed="false">${art(illustration)}${short}</button>`).join('')}</div>`;
}

export function planningPanels(selectedDate) {
  return `<aside class="right-rail planning-rail" aria-label="Oma päivä ja merkinnät">
    <section class="panel planning-panel day-panel"><div class="dashboard-panel-heading">${art('dayplan')}<h2>Minun päiväni</h2></div><p class="selected-date" id="selected-date">${selectedDate}</p><ul id="day-events" class="event-list"><li class="empty">Lisää meno tai muistutus tälle päivälle.</li></ul>${button(icon('plus') + ' Lisää tapahtuma', 'new-event', 'day-add')}</section>
    <section class="panel planning-panel notes-panel"><div class="dashboard-panel-heading">${art('edit')}<h2>Muistiinpanot</h2></div><label for="day-notes" class="sr-only">Valitun päivän muistiinpanot</label><textarea class="note-area" id="day-notes" rows="4" placeholder="Mitä haluat muistaa tänään?"></textarea><div class="notes-footer"><span id="notes-status">Tallentuu kirjoittaessasi</span>${button(icon('check') + ' Tallenna', 'save-notes', 'notes-save')}</div></section>
    <section class="panel planning-panel tasks-panel"><div class="dashboard-panel-heading">${art('tasks')}<h2>Tehtävät</h2><span id="task-count" class="task-count">0/0</span></div><form class="task-form" id="task-form"><label for="task-title" class="sr-only">Uusi tehtävä</label><input id="task-title" required maxlength="200" placeholder="Lisää päivän tehtävä…"><button aria-label="Lisää tehtävä">${icon('plus')}</button></form><ul id="tasks" class="task-list"></ul><p class="task-empty" id="task-empty">Kirjaa yksi tehtävä ja aloita siitä.</p></section>
    <section class="panel planning-panel backup-panel"><div class="dashboard-panel-heading">${art('privacy')}<h2>Kalenteri talteen</h2></div><p>Vie tapahtumat tai säilytä koko suunnitelmasi varmuuskopiona.</p><div class="data-actions"><label class="upload-label">${art('ics')}<span>Tuo ICS</span>${icon('plus')}<input id="import-ics" type="file" accept=".ics,text/calendar"></label>${button(art('download') + '<span>Vie ICS</span>' + icon('download'), 'export-ics')}${button(art('blank') + '<span>Varmuuskopio</span>' + icon('download'), 'backup')}<label class="upload-label">${art('tools')}<span>Palauta kopio</span>${icon('arrow')}<input id="restore-json" type="file" accept=".json,application/json"></label></div><span class="backup-note">${icon('check')} Omat tiedot tallentuvat tähän selaimeen.</span></section>
  </aside>`;
}
