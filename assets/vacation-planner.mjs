import './calendar-downloads.js';
import {countForm,quantity} from './fi-language.mjs';
import {buildVacationPlan, findVacationOptions, vacationCalendar, vacationGoogleURL} from './vacation-core.mjs';

const STORAGE = 'kalenteri365-vacation-plan-v1';
const MIN_DATE = '2027-01-01', MAX_DATE = '2030-12-31';
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const label = date => new Intl.DateTimeFormat('fi-FI', {dateStyle:'medium', timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
const short = date => new Intl.DateTimeFormat('fi-FI', {day:'numeric', month:'numeric', timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
const weekday = date => new Intl.DateTimeFormat('fi-FI', {weekday:'short', timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
const REASONS = {work:'Haettava työpäivä', weekRest:'Viikkovapaa', publicHolidays:'Pyhäpäivä', eves:'Vapaa aatto'};

export function initVacationPlanner(root = document.querySelector('[data-vacation-planner]')) {
  if (!root || root.dataset.vacationReady) return;
  root.dataset.vacationReady = 'true';
  const $ = selector => root.querySelector(selector);
  const form = $('[data-vacation-form]');
  const fields = form.elements;
  const schools = JSON.parse($('[data-vacation-schools]').textContent);
  let current = null, options = [], stale = false;

  const exportSettings = () => ({title:$('[data-vacation-title]').value.trim() || 'Oma lomasuunnitelma',
    mode:$('[data-vacation-export-mode]').value, reminder:$('[data-vacation-reminder]').value});
  function syncPrint() {
    $('[data-vacation-print-name]').textContent = exportSettings().title;
    if (!current) return;
    const names = ['su','ma','ti','ke','to','pe','la'];
    $('[data-vacation-print-assumptions]').textContent = 'Valitut työviikon päivät: '+current.weekdays.map(day=>names[day]).join(', ')+'. Suomen pyhäpäivät on laskettu vapaiksi. Juhannusaatto ja jouluaatto '+(current.eves?'on laskettu vapaiksi.':'noudattavat valittua työviikkoa.');
  }
  function syncActions() {
    const ready = Boolean(current && !stale);
    $('[data-vacation-export-hint]').textContent = ready && !current.leaveDays && exportSettings().mode === 'leave' ? 'Haettavia työpäiviä ei ole. Valitse Koko vapaa, jos haluat ladata jakson Apple Kalenteriin tai Outlookiin.' : '';
    root.querySelectorAll('[data-vacation-service]').forEach(button => {
      button.disabled = !ready || (button.dataset.vacationService !== 'google' && exportSettings().mode === 'leave' && !current.leaveDays);
    });
    $('[data-vacation-save]').disabled = !ready;
    $('[data-vacation-print]').disabled = !ready;
  }
  function markStale() {
    if (current) { stale = true; $('[data-vacation-stale]').hidden = false; }
    root.querySelectorAll('[data-vacation-option]').forEach(button => { button.disabled = true; });
    $('[data-vacation-error]').textContent = '';
    $('[data-vacation-export-status]').textContent = '';
    syncPrint();
    syncActions();
  }
  function schoolSettings() {
    const school = schools.find(item => item.id === fields.school.value);
    if (!school) return [];
    const period = fields.schoolPeriod.value;
    return period === '' ? school.periods : [school.periods[Number(period)]].filter(Boolean);
  }
  function updateSchool(setRange = true) {
    const school = schools.find(item => item.id === fields.school.value);
    fields.schoolPeriod.replaceChildren(new Option('Kaikki julkaistut lomajaksot', ''));
    $('[data-vacation-school-period-field]').hidden = !school;
    if (!school) {
      $('[data-vacation-school-note]').textContent = 'Rajaus käyttää kunnan julkaistuja perusopetuksen lomajaksoja. Oman koulusi poikkeukset tarkistetaan erikseen.';
      return;
    }
    school.periods.forEach((period, index) => {
      const option = new Option(`${period.label}: ${label(period.start)}–${label(period.end)}`, String(index));
      option.disabled = period.end < MIN_DATE || period.start > MAX_DATE;
      fields.schoolPeriod.append(option);
    });
    $('[data-vacation-school-note]').innerHTML = `${esc(school.label)}. Rajaus sisältää vain julkaistut lomapäivät. ${school.source ? `<a href="${esc(school.source)}" target="_blank" rel="noopener">Kunnan alkuperäinen julkaisu</a>` : ''}`;
    if (setRange) useSchoolRange();
  }
  function useSchoolRange() {
    const periods = schoolSettings().filter(period => period.end >= MIN_DATE && period.start <= MAX_DATE);
    if (!periods.length) return;
    fields.start.value = periods.reduce((date, period) => date < period.start ? date : period.start, MAX_DATE);
    fields.end.value = periods.reduce((date, period) => date > period.end ? date : period.end, MIN_DATE);
    if (fields.start.value < MIN_DATE) fields.start.value = MIN_DATE;
    if (fields.end.value > MAX_DATE) fields.end.value = MAX_DATE;
  }
  const settings = () => ({start:fields.start.value, end:fields.end.value,
    weekdays:[...form.querySelectorAll('[name="weekday"]:checked')].map(input => Number(input.value)),
    eves:fields.eves.checked, budget:Number(fields.budget.value), minLength:Number(fields.minLength.value),
    maxLength:Number(fields.maxLength.value), allowedPeriods:schoolSettings(), limit:6});

  function renderPlan(plan) {
    current = plan; stale = false;
    $('[data-vacation-selected]').hidden = false;
    $('[data-vacation-stale]').hidden = true;
    $('[data-vacation-range]').innerHTML = `<time datetime="${plan.start}">${esc(label(plan.start))}</time>–<time datetime="${plan.end}">${esc(label(plan.end))}</time>`;
    const rest = plan.days.filter(day => day.reason === 'weekRest').length;
    const holidays = plan.days.filter(day => ['publicHolidays','eves'].includes(day.reason)).length;
    $('[data-vacation-totals]').innerHTML = [[plan.calendarDays,countForm(plan.calendarDays,'Kalenteripäivä vapaalla','Kalenteripäivää vapaalla')],[plan.leaveDays,countForm(plan.leaveDays,'Haettava työpäivä','Haettavaa työpäivää')],[rest,countForm(rest,'Viikkovapaa','Viikkovapaata')],[holidays,countForm(holidays,'Työviikon pyhä tai aatto','Työviikon pyhää tai aattoa')]].map(([count,text]) => `<div><strong>${count}</strong><span>${text}</span></div>`).join('');
    $('[data-vacation-leave-dates]').textContent = plan.leaveDates.length ? plan.leaveDates.map(label).join(' · ') : 'Jakso ei vaadi valitun työviikon työpäiviä.';
    $('[data-vacation-days]').innerHTML = plan.days.map(day => `<div class="vacation-day is-${day.reason}" role="listitem"><span>${esc(weekday(day.date))}</span><time datetime="${day.date}">${esc(short(day.date))}</time><small>${REASONS[day.reason]}${day.events.length ? ' · '+esc(day.events.map(event=>event.name).join(', ')) : ''}</small></div>`).join('');
    root.querySelectorAll('[data-vacation-option]').forEach(button => button.setAttribute('aria-pressed', String(options[Number(button.dataset.vacationOption)] === plan)));
    $('[data-vacation-export-status]').textContent = '';
    syncPrint();
    syncActions();
  }
  function renderOptions() {
    $('[data-vacation-options]').innerHTML = options.map((plan,index) => `<button type="button" class="vacation-option" data-vacation-option="${index}" aria-pressed="false"><span class="vacation-option-days"><strong>${plan.calendarDays}</strong> ${countForm(plan.calendarDays,'päivä','päivää')}</span><span><b>${esc(label(plan.start))}–${esc(label(plan.end))}</b><small>${quantity(plan.leaveDays,'haettava työpäivä','haettavaa työpäivää')} · ${quantity(plan.freeDays,'valmiiksi vapaa päivä','valmiiksi vapaata päivää')}</small></span><span class="vacation-option-select">Valitse <span aria-hidden="true">→</span></span></button>`).join('');
    if (options.length) renderPlan(options[0]);
    else { current = null; $('[data-vacation-selected]').hidden = true; syncActions(); }
  }
  function calculate() {
    try {
      const input = settings();
      if (input.start < MIN_DATE || input.end > MAX_DATE) throw Error('Valitse ajanjakso vuosilta 2027–2030.');
      if (fields.selection.value === 'period') {
        const plan = buildVacationPlan(input);
        if (plan.calendarDays > 366) throw Error('Tarkista kerralla enintään 366 päivän vapaa. Vaihtoehtoja voit etsiä laajemmalta ajalta.');
        if (input.allowedPeriods.length && !input.allowedPeriods.some(period => plan.start >= period.start && plan.end <= period.end)) throw Error('Valittu ajanjakso ei mahdu kokonaan yhteen valitun koulun julkaistuun lomajaksoon.');
        options = [plan];
      } else options = findVacationOptions(input);
      renderOptions();
      $('[data-vacation-error]').textContent = '';
      $('[data-vacation-status]').textContent = options.length ? (fields.selection.value === 'period' ? 'Valitsemasi ajanjakson erittely on valmis.' : `${quantity(options.length,'vaihtoehto','vaihtoehtoa')}. Pisin vapaa ensin, yhtä pitkistä jaksoista vähiten haettavia työpäiviä vaativa ensin.`) : 'Näillä valinnoilla ei löytynyt sopivaa jaksoa. Kokeile lyhyempää vapaata, suurempaa budjettia tai muuta ajanjaksoa.';
    } catch (error) {
      $('[data-vacation-error]').textContent = error.message;
      markStale();
      $('[data-vacation-error]').textContent = error.message;
    }
  }
  function download(service) {
    if (!current || stale) return;
    try {
      const raw = vacationCalendar(current, exportSettings());
      globalThis.Calendar365Downloads.save(raw,'kalenteri365-lomasuunnitelma.ics','text/calendar;charset=utf-8');
      $('[data-vacation-export-status]').textContent = `Avaa lataamasi ICS-tiedosto ${service === 'apple' ? 'Apple Kalenterissa' : 'Outlookissa'} ja tarkista päivät ennen tuontia.`;
    } catch (error) { $('[data-vacation-export-status]').textContent = error.message; }
  }
  form.addEventListener('submit', event => { event.preventDefault(); calculate(); });
  form.addEventListener('input', markStale);
  fields.selection.addEventListener('change', () => {
    const search = fields.selection.value === 'search';
    $('[data-vacation-search-settings]').hidden = !search;
    $('[data-vacation-submit-label]').textContent = search ? 'Etsi lomavaihtoehdot' : 'Tarkista valittu jakso';
  });
  fields.school.addEventListener('change', () => { updateSchool(); markStale(); });
  fields.schoolPeriod.addEventListener('change', () => { useSchoolRange(); markStale(); });
  root.addEventListener('click', event => {
    const option = event.target.closest('[data-vacation-option]');
    if (option) renderPlan(options[Number(option.dataset.vacationOption)]);
    const year = event.target.closest('[data-vacation-year]')?.dataset.vacationYear;
    if (year) { fields.start.value=year+'-01-01'; fields.end.value=year+'-12-31'; markStale(); }
    const service = event.target.closest('[data-vacation-service]')?.dataset.vacationService;
    if (service && current && !stale) {
      if (service === 'google') {
        window.open(vacationGoogleURL(current, exportSettings()), '_blank', 'noopener');
        $('[data-vacation-export-status]').textContent = 'Google Kalenteriin siirtyvät suunnitelman nimi, koko vapaan päivämäärät ja työpäivien erittely. Tarkista tiedot ja valitse muistutus ennen tallentamista.';
      } else download(service);
    }
  });
  $('[data-vacation-export-mode]').addEventListener('change', syncActions);
  $('[data-vacation-title]').addEventListener('input', syncPrint);
  $('[data-vacation-save]').addEventListener('click', () => {
    if (!current || stale) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify({version:1, title:exportSettings().title, start:current.start, end:current.end, weekdays:current.weekdays, eves:current.eves}));
      $('[data-vacation-saved]').hidden = false;
      $('[data-vacation-export-status]').textContent = 'Suunnitelma tallennettiin tähän selaimeen. Voit avata sen myöhemmin tällä sivulla.';
    } catch { $('[data-vacation-export-status]').textContent = 'Selain ei sallinut tallennusta. Voit ladata suunnitelman kalenteritiedostona.'; }
  });
  $('[data-vacation-restore]').addEventListener('click', () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE));
      if (saved?.version !== 1) throw Error('Tallennettu suunnitelma ei ole tuettu.');
      const plan = buildVacationPlan(saved);
      fields.selection.value = 'period'; fields.selection.dispatchEvent(new Event('change'));
      fields.start.value = plan.start; fields.end.value = plan.end; fields.eves.checked = plan.eves;
      fields.school.value = ''; updateSchool(false);
      form.querySelectorAll('[name="weekday"]').forEach(input => { input.checked = plan.weekdays.includes(Number(input.value)); });
      $('[data-vacation-title]').value = String(saved.title || 'Oma lomasuunnitelma').slice(0,140);
      options = [plan]; renderOptions();
      $('[data-vacation-status]').textContent = 'Tallennettu suunnitelma avattiin tästä selaimesta.';
    } catch (error) { $('[data-vacation-error]').textContent = error.message || 'Tallennettua suunnitelmaa ei voitu avata.'; }
  });
  $('[data-vacation-forget]').addEventListener('click', () => {
    try { localStorage.removeItem(STORAGE); $('[data-vacation-saved]').hidden = true; $('[data-vacation-export-status]').textContent='Selaimeen tallennettu suunnitelma poistettiin.'; }
    catch { $('[data-vacation-export-status]').textContent='Selain ei sallinut tallenteen poistamista.'; }
  });
  let printWasOpen = null;
  function preparePrint() {
    syncPrint();
    const details = $('.vacation-day-details');
    if (printWasOpen === null) printWasOpen = details.open;
    details.open = true;
  }
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', () => {
    if (printWasOpen !== null) $('.vacation-day-details').open = printWasOpen;
    printWasOpen = null;
  });
  $('[data-vacation-print]').addEventListener('click', () => { preparePrint(); window.print(); });
  try { $('[data-vacation-saved]').hidden = !localStorage.getItem(STORAGE); } catch {}
  const incoming = new URLSearchParams(location.search);
  const incomingStart = incoming.get('start'), incomingEnd = incoming.get('end');
  if (/^20(?:27|28|29|30)-\d{2}-\d{2}$/.test(incomingStart || '') && /^20(?:27|28|29|30)-\d{2}-\d{2}$/.test(incomingEnd || '')) {
    try {
      const plan = buildVacationPlan({start:incomingStart,end:incomingEnd});
      if (plan.calendarDays <= 366) {
        fields.selection.value = 'period'; fields.selection.dispatchEvent(new Event('change'));
        fields.start.value = incomingStart; fields.end.value = incomingEnd;
      }
    } catch { /* Invalid URL dates leave the default form intact. */ }
  }
  calculate();
  return {calculate, getPlan:() => current};
}

if (typeof document !== 'undefined') initVacationPlanner();
