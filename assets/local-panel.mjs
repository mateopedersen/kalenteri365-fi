import {CITIES, cap} from './calendar.mjs';
import {esc} from './ui.mjs';
import {connectWeatherScene} from './weather-scene.mjs';
import {fetchWeather, usableWeather} from './weather-client.mjs';

export function connectLocalPanel({state, onCityChange, onOpen}) {
  const $ = selector => document.querySelector(selector);
  const trigger = $('#city-trigger'), picker = $('#city-picker'), search = $('#city-search');
  const options = [...picker.querySelectorAll('[data-city-option]')];
  const stage = $('#weather-stage'), scene = connectWeatherScene(stage);
  const memory = new Map();
  const timeFormat = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
  const dateFormat = new Intl.DateTimeFormat('fi-FI', {timeZone: 'Europe/Helsinki', weekday: 'long', day: 'numeric', month: 'long'});
  const forecastTime = new Intl.DateTimeFormat('fi-FI', {timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit'});
  let sequence = 0, controller, refreshTimer, manualSelection = false;
  let nextRefresh = 0, astronomicalPeriod, requestedCity;
  const normalize = value => value.toLocaleLowerCase('fi').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const city = () => CITIES.find(c => c[0] === state.city) || CITIES[0];
  const number = value => Number.isFinite(value) ? value.toLocaleString('fi-FI', {maximumFractionDigits: 1}) : 'Ei tietoa';

  function clock() {
    if (document.hidden) return;
    const now = new Date(), [hours, minutes, seconds] = timeFormat.format(now).split(':');
    $('#helsinki-clock').innerHTML = `<span>${hours}:${minutes}</span><sup>${seconds}</sup>`;
    $('#helsinki-clock').dateTime = now.toISOString();
    $('#clock-zone').textContent = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/Helsinki', timeZoneName: 'short'}).formatToParts(now).find(p => p.type === 'timeZoneName').value;
    $('#today-date').textContent = cap(dateFormat.format(now));
    $('#today-date').dateTime = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Helsinki'}).format(now);
  }

  function closePicker(restoreFocus = false) {
    picker.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus({preventScroll: true});
  }

  function filterCities() {
    const query = normalize(search.value.trim());
    for (const option of options) option.hidden = !normalize(option.textContent).includes(query);
    $('#city-empty').hidden = options.some(option => !option.hidden);
  }

  function positionPicker() {
    if (picker.hidden) return;
    const bounds = trigger.getBoundingClientRect(), viewport = window.visualViewport;
    const top = viewport?.offsetTop || 0, bottom = top + (viewport?.height || innerHeight);
    const below = bottom - bounds.bottom - 12, above = bounds.top - top - 12;
    const openAbove = below < 240 && above > below;
    picker.style.top = openAbove ? 'auto' : 'calc(100% + 8px)';
    picker.style.bottom = openAbove ? 'calc(100% + 8px)' : 'auto';
    picker.style.maxHeight = Math.max(140, Math.min(370, openAbove ? above : below)) + 'px';
  }

  trigger.addEventListener('click', () => {
    if (!picker.hidden) { closePicker(); return; }
    picker.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    search.value = '';
    filterCities();
    positionPicker();
    search.focus({preventScroll: true});
    onOpen();
  });
  $('#city-picker-close').addEventListener('click', () => closePicker(true));
  search.addEventListener('input', filterCities);
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closePicker(true); return; }
    const visible = options.filter(option => !option.hidden);
    const index = visible.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); visible[Math.min(index + 1, visible.length - 1)]?.focus(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); index <= 0 ? search.focus() : visible[index - 1]?.focus(); }
    if (event.key === 'Enter' && event.target === search && visible.length) { event.preventDefault(); visible[0].click(); }
  });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.local-place')) closePicker(); });
  document.addEventListener('focusin', event => { if (!event.target.closest('.local-place')) closePicker(); });
  window.addEventListener('resize', positionPicker);
  window.visualViewport?.addEventListener('resize', positionPicker);
  window.addEventListener('scroll', positionPicker, {passive: true});
  window.addEventListener('fi-local-sky', event => {
    if (event.detail.city !== state.city) return;
    astronomicalPeriod = event.detail.period;
    scene.setPeriod(astronomicalPeriod);
    scene.setSolar(event.detail.altitude);
  });

  function paint(data, stale = false) {
    const selected = city();
    stage.dataset.state = stale ? 'stale' : 'ready';
    $('#weather-metrics').hidden = false;
    $('#weather-badge').textContent = stale ? 'Aiempi ennuste' : 'Sää nyt';
    $('#weather').innerHTML = `<strong class="weather-temp">${Math.round(data.temperature)}<sup>°C</sup></strong><span class="weather-condition">${esc(data.name)}</span>`;
    $('#weather-wind').textContent = number(data.wind) + (Number.isFinite(data.wind) ? ' m/s' : '');
    $('#weather-rain').textContent = number(data.precipitation) + (Number.isFinite(data.precipitation) ? ' mm' : '');
    $('#weather-note').innerHTML = `${stale ? 'Aiempi ennuste' : 'Ennuste'} klo ${forecastTime.format(new Date(data.time))}<br><a href="https://www.met.no/" target="_blank" rel="noopener">MET Norway</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>`;
    $('#weather-status').textContent = `${selected[1]}: ${data.name}, ${Math.round(data.temperature)} astetta. ${stale ? 'Aiemmin haettu ennuste.' : ''}`;
    stage.setAttribute('aria-busy', 'false');
    scene.set(data.symbol, astronomicalPeriod);
  }

  function waiting(selected) {
    scene.clear();
    stage.dataset.state = 'loading';
    $('#weather-metrics').hidden = true;
    $('#weather-badge').textContent = selected[1];
    $('#weather').innerHTML = '<span class="weather-loading-mark" aria-hidden="true"></span><span class="weather-message"><strong>Haetaan säätä</strong><span>Paikallinen ennuste latautuu…</span></span>';
    $('#weather-note').textContent = 'Sääennuste · MET Norway';
    $('#weather-status').textContent = selected[1] + ': sääennuste latautuu.';
  }

  function schedule(at) {
    clearTimeout(refreshTimer);
    nextRefresh = at;
    refreshTimer = setTimeout(() => { if (!document.hidden) weather(); }, Math.max(60000, at - Date.now()));
  }

  async function weather(force = false) {
    const requestSequence = ++sequence, selected = city();
    requestedCity = selected[0];
    clearTimeout(refreshTimer);
    controller?.abort();
    controller = new AbortController();
    const requestController = controller;
    let cached = memory.get(selected[0]);
    try { cached ??= JSON.parse(sessionStorage.getItem('fi-met-weather-v2-' + selected[0]) || 'null'); } catch {}
    const usable = usableWeather(cached?.data, selected[0]);
    if (!force && usable && Date.parse(cached.data.expiresAt) > Date.now()) {
      $('#weather-refresh').disabled = false;
      paint(cached.data);
      schedule(Date.parse(cached.data.expiresAt));
      return;
    }
    if (usable) paint(cached.data, true);
    else waiting(selected);
    stage.setAttribute('aria-busy', 'true');
    $('#weather-refresh').disabled = true;
    try {
      const data = await fetchWeather(selected[0], {signal: requestController.signal});
      if (requestSequence !== sequence) return;
      const entry = {data};
      memory.set(selected[0], entry);
      try { sessionStorage.setItem('fi-met-weather-v2-' + selected[0], JSON.stringify(entry)); } catch {}
      paint(data);
      schedule(Date.parse(data.expiresAt) || Date.now() + 600000);
    } catch {
      if (requestSequence !== sequence) return;
      if (usableWeather(cached?.data, selected[0])) paint(cached.data, true);
      else {
        scene.clear('unavailable');
        stage.dataset.state = 'unavailable';
        $('#weather-metrics').hidden = true;
        $('#weather-badge').textContent = selected[1];
        $('#weather').innerHTML = '<span class="weather-message"><strong>Ennuste ei latautunut</strong><span>Säätietoja ei saatu tällä kertaa.</span></span><button type="button" class="weather-retry">Yritä uudelleen <span aria-hidden="true">↻</span></button>';
        $('#weather').querySelector('.weather-retry').addEventListener('click', () => weather(true));
        $('#weather-note').textContent = 'Yritämme automaattisesti uudelleen hetken kuluttua.';
        $('#weather-status').textContent = selected[1] + ': sääennuste ei ole saatavilla.';
        stage.setAttribute('aria-busy', 'false');
      }
      schedule(Date.now() + 60000);
    } finally {
      if (requestSequence === sequence) $('#weather-refresh').disabled = false;
    }
  }

  function setCity(id, source = 'manual') {
    if (!CITIES.some(c => c[0] === id)) return;
    if (source === 'manual') manualSelection = true;
    if (state.city !== id) { astronomicalPeriod = undefined; scene.setSolar(null); }
    onCityChange(id, source);
    $('#city-select').value = id;
    $('#city-caption').textContent = city()[1];
    for (const option of options) option.setAttribute('aria-pressed', String(option.dataset.cityOption === id));
    $('#place-choice-note').textContent = source === 'ip' ? 'IP-sijainnin arvio' : source === 'default' ? 'Suomen sää · oletuspaikkakunta' : 'Valitsemasi paikkakunta';
    closePicker(source === 'manual');
    if (requestedCity !== id) weather();
  }

  for (const option of options) option.addEventListener('click', () => setCity(option.dataset.cityOption));
  $('#city-select').addEventListener('change', event => setCity(event.target.value));
  $('#weather-refresh').addEventListener('click', () => weather(true));
  document.addEventListener('visibilitychange', () => { clock(); if (!document.hidden && Date.now() >= nextRefresh) weather(); });
  clock();
  setInterval(clock, 1000);
  setCity('helsinki', 'default');
  fetch('/api/place').then(response => response.ok ? response.json() : null).then(place => {
    if (manualSelection || !place) return;
    setCity(place.id || 'helsinki', place.detected ? 'ip' : 'default');
  }).catch(() => {});
}
