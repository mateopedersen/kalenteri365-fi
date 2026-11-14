import {YEARS, MONTHS, SLUGS, cap, daysInMonth} from './calendar.mjs';
import {calendarStyles} from './calendar-package-catalog.mjs';
import {art, icon, link, esc} from './ui.mjs';

const monthRoute = (year, month) => `/kuukausikalenteri/${year}/${SLUGS[month-1]}/`;
const weekdays = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
const seasons = ['talvi','talvi','kevät','kevät','kevät','kesä','kesä','kesä','syksy','syksy','syksy','talvi'];

function yearDirectory(year) {
  return `<section class="monthly-year" id="kuukaudet-${year}" aria-labelledby="monthly-title-${year}">
    <header class="monthly-year-head"><div><span class="monthly-year-label">KUUKAUSIKALENTERIT</span><h2 id="monthly-title-${year}">${year}</h2></div><div class="monthly-year-note"><strong>12 kuukautta</strong><span>15 ulkoasua / kuukausi</span></div></header>
    <nav class="monthly-months" aria-label="Vuoden ${year} kuukausikalenterit">${MONTHS.map((month, i) => {
      const number=i+1, starts=weekdays[new Date(Date.UTC(year,i,1)).getUTCDay()];
      return link(monthRoute(year,number),`<span class="monthly-number">${String(number).padStart(2,'0')}</span><span class="monthly-month-copy"><strong>${cap(month)}</strong><small>${daysInMonth(year,number)} päivää <span aria-hidden="true">·</span> alkaa ${starts}</small></span>${icon('chevron')}`,`monthly-month monthly-${seasons[i]}`);
    }).join('')}</nav>
    <footer class="monthly-year-footer">${link(`/kuukausikalenteri/${year}/`,`Vuoden ${year} kaikki kuukaudet ${icon('arrow')}`)}</footer>
  </section>`;
}

export function monthlyDirectory() {
  const example=calendarStyles(2027,1).find(style=>style.id==='suomi')||calendarStyles(2027,1)[0];
  return `<div class="monthly-directory">
    <section class="monthly-hero" aria-labelledby="monthly-heading">
      <div class="monthly-hero-copy"><p class="monthly-kicker"><span></span> SUOMEN KALENTERIT · 2027–2030</p><h1 id="monthly-heading">Kuukausi kerrallaan.<br><span>Tilaa omille menoille.</span></h1><p>Valitse vuosi ja kuukausi. Löydät samalta sivulta 15 tulostettavaa kalenteripohjaa sekä kuukauden verkkokalenterin.</p><a class="monthly-primary" href="#valitse-kuukausi">Valitse kuukausi ${icon('arrow')}</a><ul class="monthly-features"><li>${icon('check')} PDF ja korkealaatuinen kuva</li><li>${icon('check')} Suomen pyhäpäivät</li><li>${icon('check')} Viikko alkaa maanantaina</li></ul></div>
      <figure class="monthly-hero-preview"><div class="monthly-preview-paper"><img src="/lataukset/kalenteri-2027-01-${esc(example.id)}-preview.webp" width="1000" height="${example.orientation==='portrait'?1414:707}" alt="Tammikuun 2027 kuukausikalenterin esikatselu, ${esc(example.name)}" fetchpriority="high" decoding="async"></div><figcaption><span class="monthly-preview-icon">${art('image')}</span><span><strong>Valmiina tulostettavaksi</strong><small>Esimerkki: tammikuu 2027</small></span><span class="monthly-quality">600<span>dpi</span></span></figcaption></figure>
    </section>
    <section class="monthly-selection" id="valitse-kuukausi" aria-labelledby="monthly-selection-title"><div class="monthly-selection-heading"><div><p class="monthly-kicker">48 KUUKAUTTA</p><h2 id="monthly-selection-title">Minkä kuukauden tarvitset?</h2><p>Avaa kuukausi suoraan alta tai siirry haluamaasi vuoteen.</p></div><nav class="monthly-year-jumps" aria-label="Siirry vuoden kuukausiin">${YEARS.map(year=>link(`#kuukaudet-${year}`,`${year} ${icon('chevron')}`)).join('')}</nav></div><div class="monthly-years">${YEARS.map(yearDirectory).join('')}</div></section>
    <section class="monthly-how" aria-labelledby="monthly-how-title"><div class="monthly-how-intro"><p class="monthly-kicker">PAPERILLE TAI OMAAN SUUNNITELMAAN</p><h2 id="monthly-how-title">Valitse, lataa ja ota käyttöön.</h2><p>Kuukauden sivulla voit verrata pohjia ennen lataamista. Alkuperäiset tiedostot avautuvat ilman rekisteröitymistä.</p></div><ol><li><span>01</span><div><h3>Avaa oikea kuukausi</h3><p>Valitse myös oikea vuosi. Päivämäärien ja viikonpäivien paikat vaihtuvat vuosittain.</p></div></li><li><span>02</span><div><h3>Valitse sopiva pohja</h3><p>Katso esikatselusta arkin suunta ja muistiinpanotila. Lataa tulostamista varten PDF tai 600 dpi:n kuva.</p></div></li><li><span>03</span><div><h3>Tulosta tai lisää omat menot</h3><p>Sovita tuloste paperille tulostusasetuksissa. Jos haluat lisätä tapahtumia tai oman kuvan, avaa ${link('/luo-kalenteri/','kalenterin luontityökalu')}.</p></div></li></ol></section>
    <aside class="monthly-week-tip">${art('week')}<div><h2>Suunnitteletko viikko kerrallaan?</h2><p>Viikkopohjassa tapaamisille ja tehtäville jää oma tila.</p></div>${link('/viikkokalenteri/',`Tutustu viikkokalenteriin ${icon('arrow')}`,'monthly-secondary')}</aside>
  </div>`;
}
