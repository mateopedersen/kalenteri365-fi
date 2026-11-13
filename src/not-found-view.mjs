import {YEARS} from './calendar.mjs';
import {art, icon, link} from './ui.mjs';

const routes = [
  ['kalenteri', 'Vuosikalenterit', 'Vuoden päivät, viikot ja tärkeät merkinnät.', 'calendar'],
  ['juhlapyhat', 'Suomen juhlapyhät', 'Pyhäpäivät, aatot ja juhlien taustat.', 'celebrations'],
  ['koulujen-lomat', 'Koulujen lomat', 'Loma-ajat ja lukuvuoden suunnittelu.', 'school'],
  ['tyokalut', 'Arjen työkalut', 'Laskurit ja suunnittelijat samassa paikassa.', 'tools'],
];

export function notFoundPage() {
  return `<div class="recovery-page">
    <section class="recovery-hero" aria-labelledby="recovery-title">
      <div class="recovery-copy" data-search-scope>
        <p class="recovery-kicker"><span>404</span> SIVUA EI LÖYTYNYT</p>
        <h1 id="recovery-title">Löydetään sinulle <em>oikea sivu.</em></h1>
        <p class="recovery-intro">Tämä osoite ei johtanut perille. Etsi tarvitsemasi kalenteri, juhlapäivä tai työkalu ja jatka suunnittelua.</p>
        <form id="page-search-form" class="recovery-search" action="/haku/" method="get" role="search">
          <label for="page-search">Mitä haluat löytää?</label>
          <div class="recovery-search-field">${icon('search')}<input id="page-search" name="q" type="search" placeholder="Kalenteri, juhlapäivä tai työkalu" autocomplete="off" maxlength="300" data-result-limit="6" data-suggest-on-focus="false" required><button type="submit">Hae ${icon('arrow')}</button></div>
        </form>
        <div class="recovery-quick" aria-label="Kokeile näitä hakuja"><span>Kokeile:</span>${['Kalenteri 2027','Koululomat','Työpäivälaskuri','Kuun vaiheet'].map(query=>`<button type="button" data-search-query="${query}">${query}</button>`).join('')}</div>
        <div id="page-search-results" class="search-page-results" aria-live="polite" hidden></div>
        <div class="recovery-actions">${link('/',icon('arrow','recovery-back')+'<span>Takaisin etusivulle</span>','recovery-home')}${link('/luo-kalenteri/','Luo oma kalenteri '+icon('chevron'),'recovery-create')}</div>
      </div>
      <figure class="recovery-art"><img src="/assets/not-found-scene.svg" alt="Kalenterisivu, jossa on numero 404, ja oikean suunnan näyttävä kompassi" width="640" height="540" fetchpriority="high" decoding="async"><figcaption>Seuraava suunnitelma on vain haun päässä.</figcaption></figure>
    </section>
    <section class="recovery-routes" aria-labelledby="recovery-routes-title">
      <div class="recovery-section-heading"><div><p class="recovery-section-kicker">JATKA TÄSTÄ</p><h2 id="recovery-routes-title">Mihin haluaisit seuraavaksi?</h2></div><p>Suorat reitit suosituimpiin aiheisiin.</p></div>
      <div class="recovery-route-grid">${routes.map(([path,title,description,image])=>link(`/${path}/`,`<span class="recovery-route-art">${art(image)}</span><strong>${title}</strong><span class="recovery-route-copy">${description}</span><span class="recovery-route-arrow">${icon('arrow')}</span>`,'recovery-route')).join('')}</div>
    </section>
    <nav class="recovery-years" aria-label="Avaa vuosikalenteri"><div>${icon('calendar')}<span>Valitse kalenterivuosi</span></div><div>${YEARS.map(year=>link(`/kalenteri/${year}/`,`${year} ${icon('chevron')}`)).join('')}</div></nav>
    <p class="recovery-support">Löysitkö rikkinäisen linkin? ${link('/yhteystiedot/','Kerro meille '+icon('arrow'))}</p>
  </div>`;
}
