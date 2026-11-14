import {actionLabel} from './action-icons.mjs';
import {siteIconLinks} from './site-icons.mjs';
import {brandedTitle} from './seo-title.mjs';
import {lunarPageHeader} from './lunar-header.mjs';
import {storageNoticeMarkup} from './storage-notice-view.mjs';
import {
  MONTHS,
  SLUGS,
  YEARS,
  DAYS,
  date,
  fi,
  iso,
  day,
  week,
  monthGrid,
  holidays,
  cap,
} from "./calendar.mjs";
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const paths = {
  copy: "M9 9h12v12H9z M15 9V3H3v12h6",
  refresh: "M20 7v5h-5 M4 17v-5h5 M6 7a7 7 0 0 1 12-2l2 3 M18 17a7 7 0 0 1-12 2l-2-3",
  expand: "M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5",
  share: "M12 16V3m-5 5 5-5 5 5M4 14v7h16v-7",
  calendar: "M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16 M8 14h2 M14 14h2 M8 18h2",
  cloud: "M7 18H5a4 4 0 0 1-1-8 7 7 0 0 1 13-3 5 5 0 1 1 2 11H7",
  wind: "M3 8h12a3 3 0 1 0-3-3 M2 12h17a3 3 0 1 1-3 3 M5 16h5a3 3 0 1 1-3 3",
  rain: "M7 16H5a4 4 0 0 1-1-8 7 7 0 0 1 13-3 5 5 0 1 1 2 11 M7 19l-1 3 M13 19l-1 3 M19 19l-1 3",
  snow: "M12 2v20 M3 7l18 10 M3 17 21 7 M9 4l3 3 3-3 M9 20l3-3 3 3",
  storm:
    "M5 15a4 4 0 0 1-1-8 7 7 0 0 1 13-3 5 5 0 0 1 2 11 M13 12l-5 6h5l-2 6 7-9h-5Z",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 1v3 M12 20v3 M1 12h3 M20 12h3 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2",
  moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6l4 2",
  arrow: "M4 12h16 M14 6l6 6-6 6",
  download: "M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5",
  print: "M7 8V3h10v5 M7 16H3V8h18v8h-4 M7 13h10v8H7z",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6",
  plus: "M12 4v16 M4 12h16",
  check: "M5 12l4 4L20 5",
  flag: "M5 22V3 M5 3h14l-3 4 3 4H5",
  briefcase: "M3 7h18v14H3z M8 7V3h8v4 M3 12h18 M10 12v3h4v-3",
  school: "M2 9l10-6 10 6-10 6z M6 12v6c4 3 8 3 12 0v-6",
  leaf: "M20 3C7 1 0 12 8 17 15 22 22 14 20 3 M5 21 17 7",
  heart: "M12 21S0 13 3 6c2-4 7-3 9 0 2-3 7-4 9 0 3 7-9 15-9 15",
  edit: "M4 16 17 3l4 4L8 20l-5 1z M14 6l4 4",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  close: "M5 5l14 14 M5 19 19 5",
  chevron: "M9 5l7 7-7 7",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 11v6 M12 7v1",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  family:
    "M7 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M17 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M1 21v-6c0-5 12-5 12 0v6 M13 21v-5c4-3 10-1 10 3v2",
  star: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
};
export const icon = (n, cls = "") =>
  `<svg class="icon ${cls}" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n] || paths.calendar}"/></svg>`;
export const link = (href,label,cls='')=>{
 const decorated=actionLabel(href,label);if(decorated){label=decorated;cls=(cls+' action-link').trim();}
 if(cls.split(' ').includes('btn')&&!/<(?:img|svg)\b/.test(String(label))){const ext=String(href).split('?')[0].match(/\.(pdf|webp|png|jpg|xlsx|docx|ics)$/i)?.[1];if(ext)label=art(({pdf:'pdf',xlsx:'excel',docx:'word',ics:'ics'})[ext]||'image')+'<span>'+label+'</span>'+icon('download');}
 return `<a href="${href}"${cls?` class="${cls}"`:''}>${label}</a>`;
};
export const button=(label,action,cls='')=>{if(!/<(?:img|svg)\b/.test(String(label))&&['backup','export-ics','print'].includes(action))label=art(action==='print'?'download':action==='export-ics'?'ics':'edit')+'<span>'+label+'</span>'+(action==='print'?'':icon('download'));return `<button type="button" class="${cls}" data-action="${action}">${label}</button>`;};
export const yearLinks = (base = "kalenteri") =>
  `<div class="yearlinks" aria-label="Valitse vuosi">${YEARS.map((y) => link(`/${base}/${y}/`, y)).join("")}</div>`;
export const section = (title, body, cls = "") =>
  `<section class="panel ${cls}"><h2>${title}</h2>${body}</section>`;
export const table = (headers, rows) =>
  `<div class="table-scroll" tabindex="0" role="group" aria-label="Tietotaulukko"><table class="data-table"><thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
export const tools = [
  [
    "kalenteri",
    "Kalenterit",
    "Vuosi ja kuukausi, viikkonumerot ja Suomen pyhät.",
    "calendar",
    "Kalenterit",
  ],
  [
    "pdf-kalenteri",
    "Tulostettavat kalenterit",
    "Valitse ulkoasu. Lataa PDF tai korkealaatuinen kuva.",
    "download",
    "Kalenterit",
  ],
  [
    "kuukausikalenteri",
    "Kuukausikalenteri",
    "Koko kuukausi ja reilusti tilaa suunnitelmille.",
    "calendar",
    "Kalenterit",
  ],
  [
    "viikkokalenteri",
    "Viikkokalenteri",
    "Viikon päivät, tärkeät tehtävät ja muistiinpanot.",
    "grid",
    "Kalenterit",
  ],
  [
    "tyhja-kalenteri",
    "Tyhjä kalenteri",
    "Ajaton pohja, jonka voit täyttää itse.",
    "edit",
    "Kalenterit",
  ],
  [
    "luo-kalenteri",
    "Luo oma kalenteri",
    "Oma otsikko, väri, kuva ja tärkeät päivät.",
    "plus",
    "Kalenterit",
  ],
  [
    "juhlapyhat",
    "Juhlapyhät",
    "Suomen pyhät ja aattopäivät 2027–2030.",
    "flag",
    "Suomi",
  ],
  [
    "liputuspaivat",
    "Liputuspäivät",
    "Viralliset ja vakiintuneet liputuspäivät.",
    "flag",
    "Suomi",
  ],
  [
    "merkkipaivat",
    "Merkkipäivät",
    "Vuoden juhlat, perinteet ja muistettavat päivät.",
    "star",
    "Suomi",
  ],
  [
    "koulujen-lomat",
    "Koulujen lomat",
    "Paikalliset loma-ajat ja alkuperäiset lähteet.",
    "school",
    "Opiskelu",
  ],
  [
    "koulukalenteri",
    "Koulukalenteri",
    "Kokoa lukuvuoden tärkeät päivät yhteen.",
    "school",
    "Opiskelu",
  ],
  [
    "lukujarjestys",
    "Lukujärjestys",
    "Muokattava viikko oppiaineille ja harrastuksille.",
    "grid",
    "Opiskelu",
  ],
  [
    "yliopistojen-kalenterit",
    "Yliopistojen kalenterit",
    "Opetusperiodit, julkaistut tauot ja kurssien suunnittelu.",
    "study",
    "Opiskelu",
  ],
  [
    "ylioppilaskirjoitukset",
    "Ylioppilaskirjoitukset",
    "Viralliset koepäivät ja oma lukusuunnitelma.",
    "school",
    "Opiskelu",
  ],
  [
    "opiskelukalenteri",
    "Opiskelukalenteri",
    "Opintojaksot, palautukset ja tentit.",
    "school",
    "Opiskelu",
  ],
  [
    "tyopaivat",
    "Työpäivät ja työtunnit",
    "Työpäivät ja työtunnit Suomessa 2027–2030. Vertaa kuukausia ja vuosia, valitse työviikko sekä aattojen käsittely ja lataa taulukko.",
    "briefcase",
    "Työ ja vapaa",
  ],
  [
    "tyopaivalaskuri",
    "Työpäivälaskuri",
    "Laske työpäivät ja tunnit omalla viikkorytmilläsi. Huomioi Suomen pyhät, aatot ja omat poissaolot. Lataa tulokset taulukkona.",
    "briefcase",
    "Työ ja vapaa",
  ],
  [
    "paivamaaralaskuri",
    "Päivämäärälaskuri",
    "Laske päivien tai työpäivien määrä päivämäärien välillä. Lisää tai vähennä päiviä, viikkoja ja kuukausia, valitse rajapäivät ja tallenna tulospäivä kalenteriin.",
    "calendar",
    "Laskurit",
  ],
  [
    "paivalaskuri",
    "Päiviä päivämäärään",
    "Laske aika tärkeään tapahtumaan päivinä, tunteina, minuutteina ja sekunteina. Aseta oma lähtölaskenta Suomen ajassa.",
    "clock",
    "Laskurit",
  ],
  [
    "viikkonumerot",
    "Viikkonumerot",
    "ISO-viikot ja niiden alkamis- ja päättymispäivät.",
    "grid",
    "Laskurit",
  ],
  [
    "vuoden-paiva",
    "Vuoden päivä",
    "Järjestysnumero, jäljellä olevat päivät ja karkausvuosi.",
    "calendar",
    "Laskurit",
  ],
  [
    "karkausvuosi",
    "Karkausvuosilaskuri",
    "Tarkista vuodet gregoriaanisen kalenterin säännöllä.",
    "calendar",
    "Laskurit",
  ],
  [
    "lomasuunnittelija",
    "Lomasuunnittelija",
    "Yhdistä lomapäivät ja pyhät pidemmäksi vapaaksi.",
    "sun",
    "Työ ja vapaa",
  ],
  [
    "pitkat-viikonloput",
    "Pitkät viikonloput",
    "Vertaa vuoden lomamahdollisuuksia.",
    "sun",
    "Työ ja vapaa",
  ],
  [
    "tyovuorosuunnittelija",
    "Työvuorosuunnittelija",
    "Suunnittele toistuva vuorokierto, muokkaa yksittäisiä työpäiviä ja tallenna vuorot kalenteriin. Tarkista tunnit, tauot ja vuorovälit.",
    "clock",
    "Työ ja vapaa",
  ],
  [
    "perhekalenteri",
    "Perhekalenteri",
    "Yhteiset tapahtumat, ruuat ja ostokset.",
    "family",
    "Oma arki",
  ],
  [
    "paivasuunnittelija",
    "Päiväsuunnittelija",
    "Tavoitteet, kellonajat ja päivän tehtävät.",
    "check",
    "Oma arki",
  ],
  [
    "syntymapaivakalenteri",
    "Syntymäpäiväkalenteri",
    "Tärkeät syntymäpäivät vuodesta toiseen.",
    "heart",
    "Oma arki",
  ],
  [
    "nimipaivat",
    "Nimipäivät",
    "Nimipäivähaku ja omat vuosittaiset muistutukset.",
    "heart",
    "Suomi",
  ],
  [
    "kuukalenteri",
    "Kuukalenteri",
    "Kuun vaiheet jokaiselle kuukaudelle.",
    "moon",
    "Luonto ja taivas",
  ],
  [
    "kuun-vaiheet",
    "Kuun vaiheet",
    "Kuun päävaiheet 2027–2030: uusikuu, neljännekset ja täysikuu Suomen ajassa.",
    "moon",
    "Luonto ja taivas",
  ],
  [
    "taysikuu",
    "Täysikuu",
    "Täysikuu 2027–2030: päivämäärät, kellonajat ja vinkit Kuun katseluun.",
    "moon",
    "Luonto ja taivas",
  ],
  [
    "uusikuu",
    "Uusikuu",
    "Uusikuu 2027–2030: päivämäärät, kellonajat ja Kuun uuden kierron alku.",
    "moon",
    "Luonto ja taivas",
  ],
  [
    "auringonnousu-ja-lasku",
    "Auringonnousu ja -lasku",
    "Paikkakuntakohtaiset ajat ja päivän pituus.",
    "sun",
    "Luonto ja taivas",
  ],
  [
    "kuun-nousu-ja-lasku",
    "Kuun nousu ja lasku",
    "Havaintopaikan mukaiset Kuun ajat.",
    "moon",
    "Luonto ja taivas",
  ],
  [
    "paivan-pituus",
    "Päivän pituus",
    "Vertaa valoisaa aikaa Suomen eri kaupungeissa.",
    "sun",
    "Luonto ja taivas",
  ],
  [
    "vuodenajat",
    "Vuodenajat",
    "Päiväntasaukset ja -seisaukset Suomen ajassa.",
    "leaf",
    "Luonto ja taivas",
  ],
  [
    "kellonsiirto",
    "Kellonsiirto",
    "Kesä- ja normaaliajan siirtymät.",
    "clock",
    "Luonto ja taivas",
  ],
  [
    "auringonpimennys",
    "Auringonpimennykset",
    "Paikallisesti näkyvät pimennykset ja havaintoajat.",
    "sun",
    "Luonto ja taivas",
  ],
  [
    "kuunpimennys",
    "Kuunpimennykset",
    "Pimennykset, vaiheet ja paikallinen näkyvyys.",
    "moon",
    "Luonto ja taivas",
  ],
  [
    "perseidit",
    "Perseidit",
    "Vinkit meteoriparven seuraamiseen Suomessa.",
    "star",
    "Luonto ja taivas",
  ],
  [
    "kylvokalenteri",
    "Kylvökalenteri",
    "Kasvien omat kylvö- ja istutusmuistutukset.",
    "leaf",
    "Luonto ja taivas",
  ],
  [
    "elakkeiden-maksupaivat",
    "Eläkkeiden maksupäivät",
    "Kevan ja Ilmarisen julkaistut maksupäivät vuodelle 2027.",
    "briefcase",
    "Suomi",
  ],
  [
    "etuuksien-maksupaivat",
    "Etuuksien maksupäivät",
    "Kelan lapsilisän maksupäivät vuodelle 2027.",
    "briefcase",
    "Suomi",
  ],
  [
    "horoskooppi",
    "Horoskooppi",
    "Päivän horoskooppi suomeksi kaikille 12 horoskooppimerkille.",
    "star",
    "Oma arki",
  ],
  [
    "horoskooppimerkki",
    "Horoskooppimerkkilaskuri",
    "Etsi syntymäpäivän mukainen länsimainen horoskooppimerkki.",
    "star",
    "Laskurit",
  ],
  ["verokalenteri","Verokalenteri","Vahvistetut määräpäivät ja omat veromuistutukset.","briefcase","Työ ja vapaa"],
  ["hakukalenteri","Hakukalenteri","Hakuaika, valintatulokset ja opiskelupaikan vastaanotto.","school","Opiskelu"],
  ["kausimuistutukset","Kausimuistutukset","Omat muistutukset vuodenaikojen vaihtumiseen.","season-winter","Luonto ja taivas"],
];
export const TOOL_ART = {
  "oma-arki": "dayplan",
  tietosuoja:'privacy',
  evasteet:'storage-notice',
  kayttoehdot:'edit',
  yhteystiedot:'contact',
  kalenteri: "calendar",
  "pdf-kalenteri": "download",
  kuukausikalenteri: "month",
  viikkokalenteri: "week",
  "tyhja-kalenteri": "blank",
  "luo-kalenteri": "create",
  juhlapyhat: "celebrations",
  liputuspaivat: "flag",
  merkkipaivat: "memorial",
  "koulujen-lomat": "school",
  koulukalenteri: "term",
  lukujarjestys: "timetable",
  ylioppilaskirjoitukset: "exams",
  opiskelukalenteri: "study",
  tyopaivat: "workdays",
  tyopaivalaskuri: "workcalc",
  paivamaaralaskuri: "calculator",
  paivalaskuri: "countdown",
  viikkonumerot: "weeknumber",
  "vuoden-paiva": "dayofyear",
  karkausvuosi: "leap",
  lomasuunnittelija: "vacation",
  "pitkat-viikonloput": "weekend",
  tyovuorosuunnittelija: "shift",
  perhekalenteri: "family",
  paivasuunnittelija: "dayplan",
  syntymapaivakalenteri: "birthday",
  nimipaivat: "names",
  kuukalenteri: "moon",
  "kuun-vaiheet": "phases",
  taysikuu: "fullmoon",
  uusikuu: "newmoon",
  "auringonnousu-ja-lasku": "sunrise",
  "kuun-nousu-ja-lasku": "moonrise",
  "paivan-pituus": "sun",
  vuodenajat: "seasons",
  kellonsiirto: "clock",
  auringonpimennys: "sun-eclipse",
  kuunpimennys: "moon-eclipse",
  perseidit: "perseid",
  kylvokalenteri: "garden",
  "elakkeiden-maksupaivat": "pension",
  "etuuksien-maksupaivat": "benefits",
  horoskooppi: "star",
  horoskooppimerkki: "signcalculator",
  tyokalut: "tools",
  "yliopistojen-kalenterit": "study",
  "tahtitieteellinen-kalenteri": "astronomy",
  ...Object.fromEntries(tools.map(([slug]) => [slug, "tool-" + slug])),
};
export const toolCards = (list = tools) =>
  `<div class="cards">${list.map(([s, t, d, i, _group, href, visual]) => link(href || `/${s}/`, `<span class="tile-icon">${visual || art(TOOL_ART[s] || i)}</span><div class="tool-copy"><h3>${t}</h3><p>${d}</p></div><span class="card-arrow">${icon("arrow")}</span>`, "tool-card")).join("")}</div>`;
export function calTable(
  y,
  m,
  { mini = false, moon = false, phases = [] } = {},
) {
  let hs = holidays(y);
  return `<table class="calendar-table ${mini ? "mini" : ""}"><caption class="sr-only">${cap(MONTHS[m - 1])} ${y}</caption><thead><tr><th scope="col" class="weekno">Vk</th>${["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"].map((d) => `<th scope="col">${d}</th>`).join("")}</tr></thead><tbody>${monthGrid(
    y,
    m,
  )
    .map(
      (row) =>
        `<tr><th scope="row" class="weekno">${week(row[0]).number}</th>${row
          .map((d) => {
            let outside = d.getUTCMonth() + 1 !== m,
              ev = hs.filter((h) => h.date === iso(d)),
              phase = phases.find((p) => p.date.slice(0, 10) === iso(d));
            return `<td class="${outside ? "outside " : ""}${day(d) > 4 ? "weekend " : ""}${ev.some((h) => h.type === "holiday") ? "holiday " : ""}" data-date="${iso(d)}"><button class="date-num" data-select-date="${iso(d)}" aria-label="${esc(DAYS[day(d)] + " " + fi(d))}">${d.getUTCDate()}</button>${!mini ? ev.map((h) => link("/juhlapyhat/" + h.slug + "/", esc(h.name), `cal-event ${h.type}`)).join("") : ev.some((h) => h.type === "holiday") ? '<span class="dot"></span>' : ""}${moon && phase ? `<span class="moon-label">${phase.symbol} ${phase.name}</span>` : ""}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("")}</tbody></table>`;
}
export const art = (name, cls = "") =>
  `<img class="art ${cls}" src="/assets/art/${/^[a-z0-9-]+$/.test(name) ? name : "calendar"}.svg" width="80" height="65" alt="" aria-hidden="true" loading="${cls==='page-art'?'eager':'lazy'}" decoding="async">`;
export const logo = `<span class="brand-mark">${art("calendar")}</span><span>Kalenteri<span class="brand-number">365</span></span>`;
function siteFooter(path) {
  const groups = [
    ["Kalenterit", "calendar", [
      ["/kalenteri/", "Vuosikalenterit"],
      ["/pdf-kalenteri/", "Tulostettavat kalenterit"],
      ["/juhlapyhat/", "Juhlapyhät"],
      ["/kuukalenteri/", "Kuukalenteri"],
    ]],
    ["Suunnittelu", "edit", [
      ["/luo-kalenteri/", "Luo oma kalenteri"],
      ["/tyokalut/", "Kaikki työkalut"],
      ["/koulujen-lomat/", "Koulujen lomat"],
      ["/lomasuunnittelija/", "Lomasuunnittelija"],
    ]],
    ["Tutustu", "info", [
      ["/tietoa/", "Tietoa sivustosta"],
      ["/blogi/", "Blogi ja oppaat"],
      ["/usein-kysyttya/", "Usein kysyttyä"],
      ["/lahteet/", "Lähteet ja laskentatavat"],
    ]],
    ["Sivuston tiedot", "check", [
      ["/tietosuoja/", "Tietosuoja"],
      ["/saavutettavuus/", "Saavutettavuus"],
      ["/valokuvat-ja-lisenssit/", "Valokuvat ja lisenssit"],
      ["/kayttoehdot/", "Käyttöehdot"],
    ]],
  ];
  return `<footer class="site-footer site-footer-redesign" aria-label="Sivuston alatunniste">
    <div class="wrap footer-shell">
      <div class="footer-intro">
        <div class="footer-identity">
          <p class="footer-intro-label">KALENTERISTA KÄYTÄNTÖÖN</p>
          <h2>Tarkista päivät.<br>Suunnittele viikko.</h2>
          <p>Pyhät, vapaat ja omat menot samassa paikassa.</p>
        </div>
        <a class="footer-contact-card" href="/yhteystiedot/">
          <span class="footer-contact-art">${art("contact")}</span>
          <span class="footer-contact-copy"><strong>Kysymys tai idea?</strong><span>Kerro palautteesi tai ehdota parannusta.</span><b>Ota yhteyttä</b></span>
          ${icon("arrow")}
        </a>
      </div>
      <div class="footer-directory">
        ${groups.map(([title, symbol, links], index) => `<nav class="footer-link-group" aria-labelledby="footer-group-${index}">
          <h2 id="footer-group-${index}">${icon(symbol)}<span>${title}</span></h2>
          <ul>${links.map(([href, label]) => `<li><a href="${href}"${path === href ? ' aria-current="page"' : ''}>${label}</a></li>`).join("")}</ul>
        </nav>`).join("")}
      </div>
      <div class="footer-signoff">
        <div class="footer-signoff-brand">
          <span class="footer-signoff-wordmark">Kalenteri<span>365</span><span class="footer-signoff-domain">.fi</span></span>
          <small>© ${new Date().getUTCFullYear()} Kalenteri365</small>
        </div>
        <div class="footer-signoff-country">
          <svg class="footer-finland-flag" viewBox="0 0 18 11" aria-hidden="true"><rect width="18" height="11" rx=".7" fill="#fff"/><path fill="#003580" d="M5 0h3v11H5z"/><path fill="#003580" d="M0 4h18v3H0z"/></svg>
          <span><strong>Tehty rakkaudella</strong><span><svg class="footer-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-9-5.7-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.3-9 12-9 12Z" fill="currentColor"/></svg> Helsingissä</span></span>
        </div>
        <a class="footer-back-top" href="#sisalto" aria-label="Takaisin ylös"><span>Takaisin ylös</span><span class="footer-back-top-icon">${icon("arrow")}</span></a>
      </div>
    </div>
  </footer>`;
}
export const skyline = `<svg class="skyline" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 220" role="img" aria-label="Helsingin rantakaupungin kuvitus"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#dcecf5"/><stop offset="1" stop-color="#f3f8fa"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h600v220H0z"/><circle fill="#fff6d6" cx="471" cy="47" r="26"/><path fill="#bfd3df" d="m0 136 40-12 30 8 50-19 40 17 35-9 40 19 49-18 40 4 45-12 35 18 56-12 65 18v82H0z"/><g fill="#e8f0f3" stroke="#8ca6b6" stroke-width="2"><path d="M28 124h58v65H28z M20 124l37-25 37 25z M103 134h47v55h-47z M159 118h42v71h-42z M401 128h52v61h-52z M463 119h43v70h-43z M517 136h55v53h-55z"/><path fill="#f9fcfd" d="M226 119h148v70H226z M215 121l85-31 85 31z M282 74h36v26h-36z"/><path fill="#7899a3" d="M278 74q22-43 44 0z"/><path d="M300 35v14 M294 41h12 M251 132v46 M274 132v46 M298 132v46 M322 132v46 M345 132v46"/></g><g fill="#8ca6b6"><path d="M39 140h8v10h-8z M65 140h8v10h-8z M39 161h8v10h-8z M65 161h8v10h-8z M115 148h7v10h-7z M133 148h7v10h-7z M414 142h9v10h-9z M435 142h9v10h-9z M477 132h9v10h-9z M535 151h9v10h-9z M555 151h9v10h-9z"/></g><path fill="#8db3c3" d="M0 185h600v35H0z"/><path fill="none" stroke="#d5e8ed" stroke-width="2" d="M0 199h80m30 0h150m25 0h100m35 0h150M35 211h145m40 0h170m30 0h130"/><path fill="#274958" d="m75 182 12 12h58l14-12z"/><path fill="#fff" d="M115 126v54H88z"/></svg>`;
function toolsMenuMarkup(currentPath){
  const definitions=[
    ['calendars','Kalenterit','tool-kalenteri',t=>t[4]==='Kalenterit'],
    ['celebrations','Juhlat ja merkkipäivät','tool-juhlapyhat',t=>['juhlapyhat','liputuspaivat','merkkipaivat','nimipaivat'].includes(t[0])],
    ['education','Koulu ja opiskelu','tool-opiskelukalenteri',t=>t[4]==='Opiskelu'],
    ['work','Työ ja vapaa-aika','tool-tyopaivat',t=>t[4]==='Työ ja vapaa'],
    ['everyday','Arki ja etuudet','tool-perhekalenteri',t=>t[4]==='Oma arki'||['elakkeiden-maksupaivat','etuuksien-maksupaivat'].includes(t[0])],
    ['calculators','Laskurit','tool-paivamaaralaskuri',t=>t[4]==='Laskurit'],
    ['sky','Aurinko ja Kuu','tool-kuukalenteri',t=>['kuukalenteri','kuun-vaiheet','taysikuu','uusikuu','auringonnousu-ja-lasku','kuun-nousu-ja-lasku','paivan-pituus'].includes(t[0])],
    ['nature','Luonto ja vuodenkierto','tool-vuodenajat',t=>t[4]==='Luonto ja taivas'&&!['kuukalenteri','kuun-vaiheet','taysikuu','uusikuu','auringonnousu-ja-lasku','kuun-nousu-ja-lasku','paivan-pituus'].includes(t[0])]
  ];
  const groups=definitions.map(([id,label,illustration,match])=>({id,label,illustration,items:tools.filter(match)}));
  const active=groups.find(g=>g.items.some(t=>currentPath.startsWith('/'+t[0]+'/')))?.id||'calendars';
  return `<div class="tools-menu-backdrop" aria-hidden="true"></div><div class="mega-menu tools-selector" role="dialog" aria-modal="true" aria-labelledby="tools-menu-title"><div class="tools-selector-header"><div><p>TYÖKALUT YHDESSÄ PAIKASSA</p><h2 id="tools-menu-title">Mitä haluat suunnitella?</h2></div><button type="button" data-tools-close aria-label="Sulje työkalut">${icon('close')}</button><div class="tools-selector-search">${icon('search')}<label class="sr-only" for="tools-menu-search">Etsi työkalu</label><input id="tools-menu-search" type="search" placeholder="Etsi kalenteria, lomaa tai laskuria…" autocomplete="off"></div></div><div class="tools-selector-body"><label class="tools-mobile-category">Valitse aihe<select id="tools-mobile-category" aria-label="Työkalujen aihe">${groups.map(g=>`<option value="${g.id}" ${g.id===active?'selected':''}>${g.label} (${g.items.length})</option>`).join('')}</select></label><div class="tools-selector-tabs" role="tablist" aria-label="Työkalujen aiheet">${groups.map(g=>`<button type="button" role="tab" id="tools-tab-${g.id}" aria-controls="tools-panel-${g.id}" aria-selected="${g.id===active}" tabindex="${g.id===active?0:-1}" data-tools-category="${g.id}">${art(g.illustration)}<span>${g.label}</span><small>${g.items.length}</small></button>`).join('')}</div><div class="tools-selector-results">${groups.map(g=>`<section role="tabpanel" tabindex="0" id="tools-panel-${g.id}" aria-labelledby="tools-tab-${g.id}" ${g.id===active?'':'hidden'}><h3>${g.label}</h3><div class="tools-selector-links">${g.items.map(t=>link('/'+t[0]+'/',`${art(TOOL_ART[t[0]]||t[3])}<span><strong>${esc(t[1])}</strong><small>${esc(t[2])}</small></span>${icon('chevron')}`)).join('')}</div></section>`).join('')}<p id="tools-menu-empty" hidden>Työkalua ei löytynyt. Kokeile esimerkiksi sanaa kalenteri, loma tai Kuu.</p></div></div><div class="tools-selector-footer"><span id="tools-menu-count" role="status">${tools.length} työkalua</span><span>Valitse aihe tai hae nimellä.</span></div></div>`;
}
export function layout({
  title,
  description,
  path = "/",
  body,
  kind = "page",
  year = 2027,
  month = 1,
  extra = {},
  social = {},
  structuredImages = [],
  customHeader = false,
  relatedContent = "",
  seoTitle = null,
  seoDescription = null,
}) {
  const monthArtIndex=SLUGS.indexOf(path.split("/")[3]);
  const pageArt = art(
    (monthArtIndex>=0?"month-"+(monthArtIndex+1):"") ||
    (path.startsWith("/horoskooppi/") && path.split("/")[2] ? "zodiac-"+path.split("/")[2] : "") ||
    TOOL_ART[path.split("/")[1]] ||
      tools.find((t) => t[0] === path.split("/")[1])?.[3] ||
      "calendar",
    "page-art",
  );
  const lunarMonth=/^\/kuukalenteri\/(202[7-9]|2030)\/([a-z]+)\/$/.exec(path);
  const lunarRise=path.startsWith("/kuun-nousu-ja-lasku/");
  const horoscopeHub=path==='/horoskooppi/';
  const headingCopy=horoscopeHub
    ? `<div class="horoscope-heading-copy"><p><strong>${esc(description)}</strong> Valitse oma merkkisi ja tutustu tämän päivän tulkintaan ihmissuhteista, työstä ja omasta ajasta.</p><p>Jokaisen merkin sivulta löydät myös päivämäärät ja oppaan merkin piirteisiin. Tarkista ${link('/horoskooppimerkki/','horoskooppimerkkisi syntymäpäivästä')} tai ${link('#nouseva-merkki','laske nouseva merkkisi')} syntymäajalla ja -paikalla. Tulkinnat on tarkoitettu viihteeksi.</p></div>`
    : `<p>${esc(description)}</p>`;
  const pageHeader=customHeader ? "" : lunarMonth ? lunarPageHeader({year:Number(lunarMonth[1]),month:monthArtIndex+1,monthName:cap(MONTHS[monthArtIndex]),icon}) : `<div class="page-heading${horoscopeHub?" horoscope-hub-heading":""}${path.startsWith("/auringonnousu-ja-lasku/")||path.startsWith("/paivan-pituus/")||lunarRise?" solar-page-heading"+(lunarRise?" lunar-page-heading":"")+(path.startsWith("/paivan-pituus/")?" daylength-page-heading":""):""}">${lunarRise?'<img class="page-art" src="/assets/photos/moon-heading.webp" width="72" height="72" alt="" decoding="async">':pageArt}<div><p class="eyebrow">SUOMI · KALENTERI365</p><h1>${esc(title)}</h1>${headingCopy}</div><div class="heading-tools no-print">${body.includes("data-holiday-calendar")?link("#lisaa-kalenteriin",art("calendar-add")+"<span>Lisää kalenteriin</span>","btn secondary"):""}${button(art("download") + "<span>Tulosta</span>", "print", "btn secondary")}${!['tietoa','lahteet','tietosuoja','evasteet','kayttoehdot','saavutettavuus','yhteystiedot','toimitusperiaatteet','valokuvat-ja-lisenssit','haku','sivukartta','tyokalut','oma-arki','404'].includes(path.split('/')[1])?'<button type="button" class="btn secondary" data-share-open>'+art('share')+'<span>Jaa sivu</span></button>':''}</div></div>`;
  const titleText = seoTitle || brandedTitle(title);
  const summary = seoDescription ?? description;
  const schema = {
    "@context": "https://schema.org",
    "@type": path === "/" ? "WebSite" : "WebPage",
    name: titleText,
    description:summary,
    url: "https://kalenteri365.fi" + path,
    inLanguage: "fi",
    isPartOf: {
      "@type": "WebSite",
      name: "Kalenteri365",
      alternateName: ["Kalenteri365.fi", "kalenteri365.fi"],
      url: "https://kalenteri365.fi/",
    },
  };
  if(path!=='/'&&path!=='/404/'){
    const parts=path.split('/').filter(Boolean),items=[{name:'Etusivu',url:'https://kalenteri365.fi/'}];
    for(let i=0;i<parts.length;i++){const prefix='/'+parts.slice(0,i+1).join('/')+'/';items.push({name:i===parts.length-1?title:(i===0?tools.find(t=>t[0]===parts[0])?.[1]||({blogi:"Blogi",oppaat:"Oppaat"})[parts[0]]:null)||cap(parts[i].replaceAll('-',' ')),url:'https://kalenteri365.fi'+prefix});}
    schema.breadcrumb={'@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:item.url}))};
  }
  const socialImage=social.src?{"@type":"ImageObject",url:"https://kalenteri365.fi"+social.src,contentUrl:"https://kalenteri365.fi"+social.src,caption:social.alt,width:social.width||1200,height:social.height||630,encodingFormat:social.type||"image/jpeg",creditText:social.creditText||"Kalenteri365",acquireLicensePage:"https://kalenteri365.fi/valokuvat-ja-lisenssit/"}:null;
  if(socialImage){if(path==="/")schema.mainEntity={"@type":"WebPage","@id":"https://kalenteri365.fi/",primaryImageOfPage:socialImage};else schema.primaryImageOfPage=socialImage;}
  if(structuredImages.length)schema.image=structuredImages;
  if(kind==='article'&&extra.article){schema.mainEntity={'@type':'BlogPosting',headline:title,description:summary,inLanguage:'fi',mainEntityOfPage:'https://kalenteri365.fi'+path,author:{'@type':'Organization',name:'Kalenteri365',url:'https://kalenteri365.fi/tietoa/'},publisher:{'@type':'Organization',name:'Kalenteri365',url:'https://kalenteri365.fi/'},...extra.article,image:socialImage||structuredImages[0]?.contentUrl};}
  if(path==='/blogi/')schema['@type']='CollectionPage';
  return `<!doctype html><html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titleText)}</title><meta name="description" content="${esc(summary)}"><link rel="canonical" href="https://kalenteri365.fi${path}"><meta name="robots" content="${path==="/valokuvat-ja-lisenssit/"?"noindex,nofollow":path==="/404/"?"noindex,follow":"index,follow"},max-image-preview:large"><meta name="theme-color" content="#002F6C"><meta property="og:type" content="${kind==='article'?'article':'website'}"><meta property="og:locale" content="fi_FI"><meta property="og:title" content="${esc(titleText)}"><meta property="og:description" content="${esc(summary)}"><meta property="og:url" content="https://kalenteri365.fi${path}"><meta property="og:site_name" content="Kalenteri365"><meta property="og:image" content="https://kalenteri365.fi${social.src || "/assets/og.png"}"><meta property="og:image:secure_url" content="https://kalenteri365.fi${social.src || "/assets/og.png"}"><meta property="og:image:width" content="${social.width||1200}"><meta property="og:image:height" content="${social.height||630}"><meta property="og:image:type" content="${social.type||"image/png"}"><meta property="og:image:alt" content="${esc(social.alt || title)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(titleText)}"><meta name="twitter:description" content="${esc(summary)}"><meta name="twitter:image" content="https://kalenteri365.fi${social.src || "/assets/og.png"}"><meta name="twitter:image:alt" content="${esc(social.alt||title)}">${siteIconLinks()}<link rel="preload" href="/assets/fonts/lato-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/lato-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/finland.css"><link rel="stylesheet" href="/assets/edition.css"><script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script></head><body data-kind="${kind}" data-year="${year}" data-month="${month}"><a class="skip" href="#sisalto">Siirry sisältöön</a><header class="site-header"><div class="topbar wrap">${link("/", logo, "brand")}<nav class="primary" aria-label="Päänavigaatio">${link("/kalenteri/", art("calendar")+"<span>Kalenterit</span>")}${link("/juhlapyhat/", art("celebrations")+"<span>Juhlapyhät</span>")}${link("/koulujen-lomat/", art("school")+"<span>Koulujen lomat</span>")}${link("/horoskooppi/", art("star")+"<span>Horoskooppi</span>")}</nav><div class="header-tools">${link("/oma-arki/", '<img class="header-personal-icon" src="/assets/header-personal.svg" width="32" height="32" alt="" decoding="async"><span>Oma arki</span>',"header-personal")}<div class="search-wrap"><form role="search" action="/haku/"><label class="sr-only" for="site-search">Hae sivustolta</label><input id="site-search" name="q" placeholder="Hae kalenteria, päivää tai työkalua…" autocomplete="off"><button aria-label="Hae">${icon("search")}</button></form><div id="search-results" hidden></div></div></div><span class="country"><svg width="27" height="17" viewBox="0 0 18 11" aria-hidden="true"><path fill="#fff" d="M0 0h18v11H0z"/><path fill="#002F6C" d="M5 0h3v11H5z M0 4h18v3H0z"/></svg> Suomi</span><button class="mobile-menu" aria-label="Avaa valikko" aria-expanded="false" data-action="menu">${icon("menu")}</button></div><div class="subbar"><nav class="wrap subnav" aria-label="Kalenterit ja työkalut"><div class="subyears"><span>Kalenterit</span>${YEARS.map((y) => link("/kalenteri/" + y + "/", y, year === y ? "active" : "")).join("")}</div>${link("/pdf-kalenteri/", art("download") + "<span>PDF-kalenterit</span>")}${link("/tyopaivat/", art("briefcase") + "<span>Työpäivät</span>")}${link("/paivamaaralaskuri/", art("calculator") + "<span>Päivämäärälaskuri</span>")}<details class="tools-menu"><summary>${art("tools")}<span>Lisää työkaluja</span><span aria-hidden="true">⌄</span></summary>${toolsMenuMarkup(path)}</details></nav></div></header><main id="sisalto" class="wrap">${path !== "/" && path !== "/404/" ? `<nav class="breadcrumb" aria-label="Murupolku">${link("/", "Etusivu")}<span>/</span>${path.split("/").filter(Boolean).length > 1 ? link("/" + path.split("/")[1] + "/", tools.find((t) => t[0] === path.split("/")[1])?.[1] || ({blogi:"Blogi",oppaat:"Oppaat"})[path.split("/")[1]] || "Kalenteri") + "<span>/</span>" : ""}<span>${esc(title)}</span></nav>${pageHeader}` : ""}${body}${relatedContent}</main>${siteFooter(path)}<dialog id="event-dialog"><form id="event-form"><div class="dialog-head"><h2>Tapahtuma</h2><button type="button" data-action="close-dialog" aria-label="Sulje">${icon("close")}</button></div><input name="id" type="hidden"><label>Otsikko<input name="title" required maxlength="160"></label><div class="form-row"><label>Päivämäärä<input name="date" type="date" required></label><label>Kellonaika<input name="time" type="time"></label></div><label>Kalenteri<select name="category"><option value="personal">Oma</option><option value="work">Työ</option><option value="family">Perhe</option><option value="school">Opiskelu</option></select></label><label>Toistuvuus<select name="repeat"><option value="none">Ei toistoa</option><option value="weekly">Joka viikko</option><option value="monthly">Joka kuukausi</option><option value="yearly">Joka vuosi</option></select></label><label>Muistiinpano<textarea name="note" rows="3" maxlength="2000"></textarea></label><div class="actions"><button class="btn" type="submit">Tallenna tapahtuma</button><button class="btn danger" type="button" data-action="delete-event" hidden>Poista</button></div><p class="small">Tallennetaan tämän selaimen muistiin.</p></form></dialog>${storageNoticeMarkup({icon,link})}<div id="toast" hidden role="status" aria-live="polite"></div><script id="page-config" type="application/json">${JSON.stringify({ kind, year, month, ...extra }).replaceAll("<", "\\u003c")}</script><script type="module" src="/assets/app.mjs"></script></body></html>`;
}
