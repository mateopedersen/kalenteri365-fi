import {art,icon,link} from './ui.mjs';
import {personalStart} from './community-view.mjs';

export function personalWorkspace() {
  return `<div class="personal-hub" data-personal-planner>
    <section class="personal-command" aria-label="Oman viikon yhteenveto">
      <div class="personal-command-copy"><span class="personal-command-art">${art('dayplan')}</span><div><p class="eyebrow">OMA VIIKKO, OMA TAHTI</p><h2>Tilaa sille, mikä on tärkeää.</h2><p>Menot, tehtävät ja muistiinpanot pysyvät samassa suunnitelmassa.</p></div></div>
      <button class="btn" type="button" data-personal-add-event>${icon('plus')} Lisää tapahtuma</button>
    </section>
    <div class="personal-metrics" aria-label="Valitun viikon luvut">
      <div>${art('calendar')}<span><strong data-personal-events-count>0</strong><small>Viikon tapahtumat</small></span></div>
      <div>${art('tasks')}<span><strong data-personal-tasks-count>0</strong><small>Viikon avoimet tehtävät</small></span></div>
      <div>${icon('check')}<span><strong data-personal-done-count>0</strong><small>Viikon valmiit tehtävät</small></span></div>
    </div>
    <div class="personal-columns">
      <div class="personal-main-stack">
        <section class="personal-card personal-week" aria-labelledby="personal-week-heading">
          <header class="personal-card-heading"><div><p class="eyebrow" data-personal-week-number>VIIKKOSUUNNITELMA</p><h2 id="personal-week-heading">Viikkosi yhdellä silmäyksellä</h2><p data-personal-week-range></p></div><button type="button" class="btn secondary" data-personal-today>Tänään</button></header>
          <div class="personal-week-toolbar"><button class="personal-icon-button" type="button" data-personal-week-step="-1" aria-label="Edellinen viikko">${icon('chevron','prev')}</button><label for="personal-date">Valitse päivä<input type="date" id="personal-date" required min="1900-01-01" max="2100-12-31"></label><button class="personal-icon-button" type="button" data-personal-week-step="1" aria-label="Seuraava viikko">${icon('chevron')}</button></div>
          <div class="personal-week-days" data-personal-week role="group" aria-label="Viikon päivät"></div>
          <div class="personal-agenda-heading"><h3 data-personal-selected-heading>Päivän menot</h3><button type="button" class="personal-text-button" data-personal-add-event>${icon('plus')} Lisää tähän päivään</button></div>
          <ul class="personal-agenda" data-personal-agenda></ul>
          <p class="personal-inline-note">Kellonajat ovat Suomen aikaa. Avaa merkintä muokataksesi sitä.</p>
        </section>
        <section class="personal-card personal-tasks" id="omat-tehtavat" aria-labelledby="personal-tasks-heading">
          <header class="personal-card-heading"><div><p class="eyebrow">ASIA KERRALLAAN</p><h2 id="personal-tasks-heading">Mistä aloitat?</h2><p>Anna tehtävälle päivä ja valitse, mikä on tärkeintä.</p></div>${art('tasks')}</header>
          <form data-personal-task-form class="personal-task-form">
            <label class="personal-task-title">Tehtävä<input name="title" placeholder="Esimerkiksi varaa aika tai maksa lasku" maxlength="160" required></label>
            <label>Päivä<input name="date" type="date" min="1900-01-01" max="2100-12-31" required></label>
            <label>Tärkeys<select name="priority"><option value="normal">Tavallinen</option><option value="high">Tärkeä</option><option value="low">Kun ehdit</option></select></label>
            <button class="btn" type="submit" data-personal-task-submit>${icon('plus')} Lisää tehtävä</button>
            <button class="personal-text-button" type="button" data-personal-task-cancel hidden>Peruuta muokkaus</button>
          </form>
          <div class="personal-task-filters" role="group" aria-label="Näytettävät tehtävät"><button type="button" data-personal-task-filter="open" aria-pressed="true">Kesken</button><button type="button" data-personal-task-filter="week" aria-pressed="false">Tämä viikko</button><button type="button" data-personal-task-filter="done" aria-pressed="false">Valmiit</button></div>
          <ul class="personal-task-list" data-personal-tasks></ul>
          <div class="personal-feedback"><p role="status" data-personal-task-status></p><button type="button" class="personal-text-button" data-personal-task-undo hidden>Kumoa poisto</button></div>
        </section>
      </div>
      <aside class="personal-side-stack">
        <section class="personal-card personal-notes" aria-labelledby="personal-notes-heading"><header class="personal-card-heading"><div><p class="eyebrow">MUISTIIN VALITULLE PÄIVÄLLE</p><h2 id="personal-notes-heading">Hyvä pitää mielessä</h2></div>${art('edit')}</header><label for="personal-note" data-personal-note-label>Päivän muistiinpano</label><textarea id="personal-note" rows="6" maxlength="4000" placeholder="Kirjoita tähän päivän muistettavat asiat…"></textarea><p role="status" class="personal-note-status" data-personal-note-status>Tallennetaan tähän selaimeen.</p></section>
        <section class="personal-card personal-takeaway" aria-labelledby="personal-takeaway-heading"><header class="personal-card-heading"><div><p class="eyebrow">SUUNNITELMA MUKAAN</p><h2 id="personal-takeaway-heading">Oma viikko talteen</h2></div></header>
          <button class="btn secondary" type="button" data-personal-export>${art('ics')} Lataa viikon tapahtumat ${icon('download')}</button>
          <button class="btn secondary" type="button" data-personal-print>${icon('print')} Tulosta viikkosuunnitelma</button>
          <button class="personal-text-button" type="button" data-action="backup">${icon('download')} Tallenna koko kalenterin varmuuskopio</button>
          <p class="personal-inline-note">ICS-tiedosto sopii esimerkiksi Apple- ja Google-kalenteriin. Muistutukset voit asettaa kalenterisovelluksessasi.</p><p role="status" data-personal-export-status></p>
        </section>
        <section class="personal-card personal-links"><h2>Jatka omalla tavallasi</h2>${[['/','calendar','Oma kalenteri','Kaikki merkinnät samassa näkymässä.'],['/perhekalenteri/','family','Perheen yhteinen viikko','Menot, ruoat ja ostoslista.'],['/tyovuorosuunnittelija/','shift','Työvuorot','Rytmi ja vapaat suunnittelun tueksi.']].map(([url,a,title,description])=>link(url,art(a)+`<span><strong>${title}</strong><small>${description}</small></span>`+icon('arrow'))).join('')}</section>
      </aside>
    </div>
    <section class="personal-context" aria-label="Sinulle tärkeät julkaistut päivämäärät">${personalStart()}</section>
    <section class="personal-guide"><div><p class="eyebrow">PIENI SUUNNITELMA RIITTÄÄ</p><h2>Tee viikosta oman näköisesi</h2><p>Kirjaa ensin sovitut menot. Valitse sitten tärkeimmät tehtävät ja varaa myös aikaa siirtymille, tauoille ja itsellesi mieluisalle tekemiselle. Kaikkia päiviä ei tarvitse täyttää.</p></div><div><p>Katso viikon lopussa, mikä toteutui ja mikä tarvitsee uuden ajan. Tehtävää voi muokata tai sen voi merkitä tapahtumaksi kalenteriin. Merkinnät tallentuvat vain tähän selaimeen; ota varmuuskopio ennen laitteen vaihtoa.</p><p class="personal-guide-sources">Vinkkejä suunnitteluun: ${link('https://www.oph.fi/fi/oppimateriaali/mun-elama/arjen-taidot/ajankaytto/suunnittelen-oman-viikkoni','Opetushallitus')} · ${link('https://www.mielenterveystalo.fi/fi/omahoito/keskittymisvaikeuksien-omahoito-ohjelma/4-ennakoi-ja-suunnittele','Mielenterveystalo')}</p></div></section>
    <section class="personal-print-week" data-personal-print-week aria-label="Tulostettava viikkosuunnitelma"></section>
    <noscript><p class="personal-card">Oman viikkosuunnitelman muokkaamiseen tarvitaan JavaScript. Voit silti avata valmiit ${link('/pdf-kalenteri/','tulostettavat kalenterit')}.</p></noscript>
  </div>`;
}
