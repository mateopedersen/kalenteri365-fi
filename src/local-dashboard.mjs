import {CITIES} from './calendar.mjs';
import {art, icon} from './ui.mjs';

function weatherLandscape() {
  return `<svg class="weather-landscape" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="weather-water" x2="0" y2="1"><stop stop-color="#72a9c3"/><stop offset="1" stop-color="#164b72"/></linearGradient>
      <linearGradient id="weather-island" x2="0" y2="1"><stop stop-color="#264f64"/><stop offset="1" stop-color="#102b49"/></linearGradient>
      <radialGradient id="weather-sun"><stop stop-color="#fffbed"/><stop offset=".55" stop-color="#ffe9ad"/><stop offset="1" stop-color="#e9b75a"/></radialGradient>
      <radialGradient id="weather-halo"><stop stop-color="#fff0bc" stop-opacity=".35"/><stop offset="1" stop-color="#fff0bc" stop-opacity="0"/></radialGradient>
      <linearGradient id="weather-cloud" x2=".4" y2="1"><stop stop-color="#fff"/><stop offset=".55" stop-color="#e5edf4"/><stop offset="1" stop-color="#9bafc7"/></linearGradient>
      <linearGradient id="weather-cloud-back" x2="0" y2="1"><stop stop-color="#c6d6e7"/><stop offset="1" stop-color="#839ab5"/></linearGradient>
      <linearGradient id="weather-reflection" x2="0" y2="1"><stop stop-color="#ffedbe" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <g class="weather-stars" fill="#fff7db"><circle cx="58" cy="57" r="1.2"/><circle cx="151" cy="30" r="1"/><circle cx="211" cy="67" r="1.2"/><circle cx="304" cy="39" r="1.4"/><circle cx="323" cy="100" r=".9"/><circle cx="88" cy="107" r=".8"/><circle cx="181" cy="102" r=".7"/></g>
    <g class="weather-orb"><g class="weather-sun-glow"><circle cx="265" cy="73" r="82" fill="url(#weather-halo)"/></g><g class="weather-sun-disc"><circle cx="265" cy="73" r="29" fill="url(#weather-sun)"/><path d="M247 57a23 23 0 0 1 30-4" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/></g></g>
    <g class="weather-moon"><circle cx="272" cy="61" r="25" fill="#dce9f1"/><circle cx="282" cy="51" r="25" fill="#173653"/><circle cx="255" cy="67" r="3" fill="#9db4c7" opacity=".5"/><circle cx="262" cy="78" r="2" fill="#9db4c7" opacity=".45"/></g>
    <path d="M0 164c43-14 71-6 111-16 36-9 77-6 106 2 44 12 84-6 143 0v110H0Z" fill="#8baabd" opacity=".3"/>
    <path d="M0 181c66-14 97 5 151-9 67-16 109-11 209-4v92H0Z" fill="url(#weather-water)"/>
    <g class="weather-reflection" fill="url(#weather-reflection)"><path d="m251 172 26 0 7 5h-40Zm-12 10h50l10 5h-68Zm-11 12h72l10 5h-89Z"/></g>
    <path d="M0 167c31-1 44-4 67-1 20 3 32 7 57 10-39 10-79 10-124 8Z" fill="url(#weather-island)"/>
    <g class="weather-pines" fill="#183d50"><path d="m14 112-11 24h6L0 150h10l-10 15h29l-8-15h8l-9-14h6Z"/><path d="m45 128-9 20h5l-8 12h7l-8 13h26l-8-13h7l-8-12h5Z"/><path d="m74 141-6 13h4l-6 10h5l-5 9h18l-5-9h5l-6-10h3Z"/></g>
    <path d="M360 177c-25-9-49-10-79-5l-30 7c38 5 75 6 109 5Z" fill="url(#weather-island)"/>
    <g class="weather-pines" fill="#1e4355"><path d="m331 123-10 23h6l-9 13h8l-9 17h29l-9-17h9l-10-13h6Z"/><path d="m302 141-7 15h4l-6 10h5l-6 10h21l-6-10h6l-7-10h4Z"/></g>
    <g class="weather-ripples" stroke="#c4e0eb" stroke-linecap="round"><path d="M112 183h38m-62 12h25m64-10h40m-51 18h49m-77 13h29m77-12h29m-64 20h72m-159 11h45m38 9h79" opacity=".2"/><path d="M22 192h20m243 0h42m-75 23h32m-250 4h27" opacity=".15"/></g>
    <g class="weather-clouds-back"><path d="M70 66c-2-15 9-27 25-27 11-23 45-22 58 2 24-5 42 10 39 27 15 10 10 28-9 28H76c-23 0-29-23-6-30Z" fill="url(#weather-cloud-back)" opacity=".72"/></g>
    <g class="weather-clouds-front"><path d="M168 83c-3-18 10-33 28-33 13-31 57-32 72-2 22-4 42 9 43 28 21 1 31 32 10 43-7 4-17 4-24 4H173c-25 0-29-30-5-40Z" fill="url(#weather-cloud)"/><path d="M175 88c-1-17 12-27 28-26 10-26 46-29 61-4" stroke="#fff" stroke-opacity=".46" stroke-width="2.5" stroke-linecap="round"/></g>
    <g class="weather-fog" stroke="#e9f1f9" stroke-linecap="round"><path d="M56 88h183m-135 18h195m-227 19h160m-93 19h167" stroke-width="7" opacity=".34"/></g>
  </svg>`;
}

export function localDashboard(helsinkiImage) {
  return `<section class="panel city-panel local-dashboard" aria-label="Paikallinen aika ja sää">
    <h2 class="sr-only">Paikallinen aika ja sää</h2>
    <figure class="local-place-view"><picture id="city-picture"><source srcset="${helsinkiImage}" type="image/avif"><img id="city-photo" src="/assets/photos/helsinki-640.webp" width="1200" height="675" alt="Suomenlinnan rantamuurit Helsingissä" fetchpriority="high"></picture><figcaption><span class="local-photo-place"><strong id="city-photo-name">Helsinki</strong><span id="city-photo-period">Päiväkuva</span></span>    <div class="local-clock">
      <div class="local-clock-heading"><span><i></i> Suomen aika</span><span id="clock-zone">EET</span></div>
      <div class="local-clock-time"><time id="helsinki-clock" aria-label="Suomen kellonaika"><span>—:—</span><sup>—</sup></time></div>
      <time class="local-date" id="today-date">Tänään Suomessa</time>
    </div>
</figcaption></figure>
    <div class="local-place">
      <button type="button" class="local-place-trigger" id="city-trigger" aria-haspopup="dialog" aria-expanded="false" aria-controls="city-picker">
        <span class="local-place-pin">${art('location')}</span>
        <span class="local-place-name"><span>Paikkakunta</span><strong id="city-caption">Helsinki</strong></span>
        <span class="local-place-chevron">${icon('chevron')}</span>
      </button>
      <select id="city-select" hidden aria-label="Valitse paikkakunta">${CITIES.map(c => `<option value="${c[0]}">${c[1]}</option>`).join('')}</select>
      <div class="local-place-picker" id="city-picker" role="dialog" aria-label="Valitse paikkakunta" hidden>
        <div class="local-picker-top"><label for="city-search">Etsi paikkakunta</label><button type="button" id="city-picker-close" aria-label="Sulje paikkakuntavalikko">×</button></div>
        <div class="local-place-search">${icon('search')}<input id="city-search" type="search" placeholder="Esimerkiksi Joensuu" autocomplete="off" spellcheck="false" aria-controls="city-options"></div>
        <div class="local-city-options" id="city-options">${CITIES.map(c => `<button type="button" data-city-option="${c[0]}" aria-pressed="${c[0] === 'helsinki'}"><span>${c[1]}</span><svg class="local-city-check" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 10 4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`).join('')}</div>
        <p id="city-empty" hidden>Paikkakuntaa ei löytynyt. Kokeile toista nimeä.</p>
      </div>
    </div>
    <p class="local-place-note" id="place-choice-note">Paikalliset tiedot Suomesta</p>
    <div class="weather-stage" id="weather-stage" data-weather="loading" data-state="loading" data-period="day" aria-busy="true">
      ${weatherLandscape()}
      <canvas id="weather-particles" aria-hidden="true"></canvas>
      <div class="weather-stage-top"><span class="weather-badge" id="weather-badge">Helsinki</span></div>
      <div id="weather" class="weather-readout"><span class="weather-loading-mark" aria-hidden="true"></span><span class="weather-message"><strong>Haetaan säätä</strong><span>Paikallinen ennuste latautuu…</span></span></div>
    </div>
    <noscript><p class="local-place-note">Sääennusteen näyttäminen edellyttää JavaScriptiä.</p></noscript>
    <p id="weather-status" class="sr-only" role="status"></p>
    <div class="local-weather-details" id="weather-metrics" hidden><div><span>${icon('wind')} Tuuli</span><strong id="weather-wind"></strong></div><div><span>${icon('rain')} Sade 1 h</span><strong id="weather-rain"></strong></div></div>
    <div class="local-weather-source"><div id="weather-note">Ennuste · MET Norway</div><button type="button" id="weather-refresh" aria-label="Päivitä sääennuste"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16 7a6.5 6.5 0 1 0 .2 5M16 3v4h-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
    <section class="local-daylight" id="local-sun"><h3>Päivän valo</h3><div class="local-sun-times"><div>${art('sunrise')}<span>Auringonnousu</span><strong id="local-rise">—</strong></div><div>${art('sun')}<span>Auringonlasku</span><strong id="local-set">—</strong></div></div><div class="local-day-track" aria-hidden="true"><i></i></div><p id="local-daylength">Lasketaan päivän pituutta…</p><a id="local-sun-link" href="/auringonnousu-ja-lasku/">Auringon kulku ${icon('arrow')}</a></section>
    <a class="local-moon-link" href="/kuukalenteri/"><span id="local-moon-disc">${art('moon')}</span><span><strong id="local-moon-phase">Kuu tänään</strong><small id="local-moon-light">Päivän valaistus</small></span>${icon('arrow')}</a>
  </section>`;
}
