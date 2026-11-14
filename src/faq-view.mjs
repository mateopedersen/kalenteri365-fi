import {FAQ} from './editorial.mjs';
import {art,esc,icon,link} from './ui.mjs';

const groups = [
  {id:'omat-merkinnat',name:'Omat merkinnät',description:'Tapahtumat, tallennus ja siirtäminen',art:'edit',questions:[0,1,6,9]},
  {id:'tulostaminen',name:'Tulostaminen',description:'Kalenteri paperille tai tiedostoksi',art:'download',questions:[2]},
  {id:'suomen-kalenteri',name:'Suomen kalenteri',description:'Pyhät, koululomat ja paikalliset ajat',art:'flag',questions:[3,4,5,10]},
  {id:'tiedot-ja-palaute',name:'Tiedot ja palaute',description:'Lähteet, laskentatavat ja korjaukset',art:'contact',questions:[7,8]},
];
const destinations = [
  ['/', 'Avaa oma kalenteri'],
  ['/tietosuoja/', 'Lue tietojen tallentamisesta'],
  ['/pdf-kalenteri/', 'Valitse tulostettava kalenteri'],
  ['/tyopaivalaskuri/', 'Tarkista työpäivät laskurilla'],
  ['/koulujen-lomat/', 'Etsi oman koulun loma-ajat'],
  ['/auringonnousu-ja-lasku/', 'Katso paikkakunnan Auringon ajat'],
  ['/oma-arki/', 'Avaa omat suunnitelmat'],
  ['/lahteet/', 'Tutustu lähteisiin ja laskentatapoihin'],
  ['/yhteystiedot/', 'Ilmoita virheestä'],
  ['/kayttoehdot/', 'Lue palvelun käytöstä'],
  ['/nimipaivat/', 'Avaa nimipäiväsivu'],
];

export function faqPage() {
  const covered=groups.flatMap(group=>group.questions);
  if(covered.length!==FAQ.length||new Set(covered).size!==FAQ.length)throw Error('FAQ categories must include every question exactly once.');
  return `<article class="help-page">
    <header class="help-hero"><div><p class="eyebrow">KALENTERI365 · KÄYTTÖOHJEET</p><h1>Usein kysyttyä</h1><p class="help-lead">Miten kalenteri tulostetaan? Missä omat merkinnät säilyvät? Tästä löydät vastaukset kalenterin käyttöön ja Suomen päivämääriin liittyviin kysymyksiin.</p><a class="help-hero-link" href="#kysymykset">Etsi vastaus aiheittain ${icon('arrow')}</a></div><div class="help-illustration" aria-hidden="true"><div class="help-paper"><span>KALENTERI365</span>${art('calendar')}<strong>Hyvä kysymys.</strong><span>Vastaus löytyy alta.</span><i></i><i></i></div><span class="help-question">?</span><span class="help-check">${icon('check')}</span></div></header>
    <nav class="help-topics" aria-label="Kysymysten aiheet">${groups.map(group=>`<a href="#${group.id}">${art(group.art)}<span><strong>${group.name}</strong><small>${group.questions.length} ${group.questions.length===1?'kysymys':'kysymystä'}</small></span>${icon('chevron')}</a>`).join('')}</nav>
    <div class="help-layout" id="kysymykset"><aside class="help-sidebar"><p class="eyebrow">APUA ARKEEN</p><h2>Etkö löytänyt vastausta?</h2><p>Kerro, millä sivulla tarvitset apua ja mitä yritit tehdä. Laskurista on hyödyllistä kertoa myös käytetyt päivämäärät ja valinnat.</p>${link('/yhteystiedot/','Ota yhteyttä'+icon('arrow'),'help-contact-link')}<p class="help-privacy">Älä lähetä henkilökohtaista kalenteriasi tai muita tarpeettomia henkilötietoja.</p></aside>
      <div class="help-groups">${groups.map(group=>`<section class="help-group" id="${group.id}" aria-labelledby="${group.id}-title"><header>${art(group.art)}<div><h2 id="${group.id}-title">${group.name}</h2><p>${group.description}</p></div></header><div class="help-questions">${group.questions.map(index=>{const [question,answer]=FAQ[index],[url,label]=destinations[index];return `<details class="help-question-item"><summary><span>${esc(question)}</span><span class="help-toggle" aria-hidden="true">${icon('plus')}</span></summary><div class="help-answer"><p>${esc(answer)}</p>${link(url,esc(label)+icon('arrow'),'help-answer-link')}</div></details>`;}).join('')}</div></section>`).join('')}</div>
    </div>
  </article>`;
}
