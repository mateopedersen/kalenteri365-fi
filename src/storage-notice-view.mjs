export function storageNoticeMarkup({icon,link}){
  return `<section class="storage-notice no-print" id="storage-notice" aria-labelledby="storage-title" aria-describedby="storage-description" hidden>
    <div class="storage-mark"><img class="storage-art" src="/assets/cookie-privacy.svg" width="96" height="96" alt="" aria-hidden="true"></div>
    <div class="storage-copy"><div class="storage-heading"><span class="storage-kicker">SINUN YKSITYISYYTESI</span><h2 id="storage-title">Vain tarpeellista. Ei seurantaa.</h2></div><p id="storage-description">Kalenterisi merkinnät ja asetukset säilyvät tässä selaimessa. Emme käytä mainos- tai analytiikkaevästeitä.</p></div>
    <div class="storage-actions">${link('/evasteet/','Evästekäytäntö','storage-policy')}<button type="button" class="btn" id="storage-dismiss">${icon('check')}<span>Hyväksy ja jatka</span></button></div>
    <button type="button" class="storage-close" data-storage-close aria-label="Sulje ilmoitus tällä sivulla">${icon('close')}</button>
  </section>`;
}
