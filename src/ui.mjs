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
  share: "M12 16V3m-5 5 5-5 5 5M4 14v7h16v-7",
  calendar: "M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16 M8 14h2 M14 14h2 M8 18h2",
  cloud: "M7 18H5a4 4 0 0 1-1-8 7 7 0 0 1 13-3 5 5 0 1 1 2 11H7",
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
    "Muokattava viikko lukuaineille ja harrastuksille.",
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
    "Kuukausien ja vuosien työpäivälaskelmat.",
    "briefcase",
    "Työ ja vapaa",
  ],
  [
    "tyopaivalaskuri",
    "Työpäivälaskuri",
    "Laske työpäivät kahden päivämäärän väliltä.",
    "briefcase",
    "Työ ja vapaa",
  ],
  [
    "paivamaaralaskuri",
    "Päivämäärälaskuri",
    "Päivien erotus sekä päivien lisäys ja vähennys.",
    "calendar",
    "Laskurit",
  ],
  [
    "paivalaskuri",
    "Päiviä päivämäärään",
    "Seuraa aikaa tärkeään tapahtumaan.",
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
    "Rakenna toistuva työ- ja vapaavuorojen kierto.",
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
    "Suomenkielisen nimipäiväkalenterin virallinen lähde.",
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
    "Uusikuu, neljännekset ja täysikuu Suomen ajassa.",
    "moon",
    "Luonto ja taivas",
  ],
  [
    "taysikuu",
    "Täysikuu",
    "Täysikuiden päivämäärät ja kellonajat.",
    "moon",
    "Luonto ja taivas",
  ],
  [
    "uusikuu",
    "Uusikuu",
    "Uusikuiden ajankohdat ja kalenterivienti.",
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
    "Kelan ja työeläkelaitosten alkuperäiset tiedot.",
    "briefcase",
    "Suomi",
  ],
  [
    "etuuksien-maksupaivat",
    "Etuuksien maksupäivät",
    "Etuuskohtaiset maksupäivät suoraan Kelasta.",
    "briefcase",
    "Suomi",
  ],
  [
    "horoskooppi",
    "Horoskooppi",
    "Horoskooppimerkit ja pohdintahetki viihteenä.",
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
];
export const TOOL_ART = {
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
  "paivan-pituus": "daylight",
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
};
export const toolCards = (list = tools) =>
  `<div class="cards">${list.map(([s, t, d, i]) => link(`/${s}/`, `<span class="tile-icon">${art(TOOL_ART[s] || i)}</span><div class="tool-copy"><h3>${t}</h3><p>${d}</p></div><span class="card-arrow">${icon("arrow")}</span>`, "tool-card")).join("")}</div>`;
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
export const skyline = `<svg class="skyline" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 220" role="img" aria-label="Helsingin rantakaupungin kuvitus"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#dcecf5"/><stop offset="1" stop-color="#f3f8fa"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h600v220H0z"/><circle fill="#fff6d6" cx="471" cy="47" r="26"/><path fill="#bfd3df" d="m0 136 40-12 30 8 50-19 40 17 35-9 40 19 49-18 40 4 45-12 35 18 56-12 65 18v82H0z"/><g fill="#e8f0f3" stroke="#8ca6b6" stroke-width="2"><path d="M28 124h58v65H28z M20 124l37-25 37 25z M103 134h47v55h-47z M159 118h42v71h-42z M401 128h52v61h-52z M463 119h43v70h-43z M517 136h55v53h-55z"/><path fill="#f9fcfd" d="M226 119h148v70H226z M215 121l85-31 85 31z M282 74h36v26h-36z"/><path fill="#7899a3" d="M278 74q22-43 44 0z"/><path d="M300 35v14 M294 41h12 M251 132v46 M274 132v46 M298 132v46 M322 132v46 M345 132v46"/></g><g fill="#8ca6b6"><path d="M39 140h8v10h-8z M65 140h8v10h-8z M39 161h8v10h-8z M65 161h8v10h-8z M115 148h7v10h-7z M133 148h7v10h-7z M414 142h9v10h-9z M435 142h9v10h-9z M477 132h9v10h-9z M535 151h9v10h-9z M555 151h9v10h-9z"/></g><path fill="#8db3c3" d="M0 185h600v35H0z"/><path fill="none" stroke="#d5e8ed" stroke-width="2" d="M0 199h80m30 0h150m25 0h100m35 0h150M35 211h145m40 0h170m30 0h130"/><path fill="#274958" d="m75 182 12 12h58l14-12z"/><path fill="#fff" d="M115 126v54H88z"/></svg>`;
export function relatedTopics(path) {
  if (path === "/" || path === "/sivukartta/" || path === "/haku/") return "";
  const bits = path.split("/").filter(Boolean),
    base = bits[0],
    group = tools.find((t) => t[0] === base)?.[4];
  const preferred =
    base === "kuukalenteri" || base.includes("kuun")
      ? [
          "kuun-vaiheet",
          "kuun-nousu-ja-lasku",
          "auringonnousu-ja-lasku",
          "tahtitieteellinen-kalenteri",
        ]
      : group === "Opiskelu"
        ? [
            "koulujen-lomat",
            "lukujarjestys",
            "opiskelukalenteri",
            "paivalaskuri",
          ]
        : group === "Työ ja vapaa"
          ? [
              "tyopaivalaskuri",
              "lomasuunnittelija",
              "tyovuorosuunnittelija",
              "juhlapyhat",
            ]
          : base === "horoskooppi" || base === "horoskooppimerkki"
            ? [
                "horoskooppi",
                "horoskooppimerkki",
                "paivasuunnittelija",
                "syntymapaivakalenteri",
              ]
            : group === "Luonto ja taivas"
              ? [
                  "auringonnousu-ja-lasku",
                  "kuukalenteri",
                  "vuodenajat",
                  "kylvokalenteri",
                ]
              : [
                  "kalenteri",
                  "juhlapyhat",
                  "viikkokalenteri",
                  "paivamaaralaskuri",
                ];
  const related = preferred
    .filter((k) => k !== base)
    .map((k) => tools.find((t) => t[0] === k))
    .filter(Boolean)
    .slice(0, 3);
  return `<section class="related-content"><div class="section-heading"><h2>Jatka suunnittelua</h2><span>Sinulle hyödyllistä</span></div>${toolCards(related)}</section>`;
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
  const titleText = title.replace(/\s[–—-]\s|:\s+/g, " | ") + " | Kalenteri365";
  const schema = {
    "@context": "https://schema.org",
    "@type": path === "/" ? "WebSite" : "WebPage",
    name: titleText,
    description,
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
  if(structuredImages.length)schema.image=structuredImages;
  if(kind==='article'&&extra.article){schema.mainEntity={'@type':'BlogPosting',headline:title,description,inLanguage:'fi',mainEntityOfPage:'https://kalenteri365.fi'+path,author:{'@type':'Organization',name:'Kalenteri365',url:'https://kalenteri365.fi/tietoa/'},publisher:{'@type':'Organization',name:'Kalenteri365',url:'https://kalenteri365.fi/'},...extra.article,image:structuredImages[0]?.contentUrl};}
  if(path==='/blogi/')schema['@type']='CollectionPage';
  return `<!doctype html><html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titleText)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="https://kalenteri365.fi${path}">${path==="/valokuvat-ja-lisenssit/"?'<meta name="robots" content="noindex,follow">':""}<meta name="theme-color" content="#002F6C"><meta property="og:type" content="${kind==='article'?'article':'website'}"><meta property="og:locale" content="fi_FI"><meta property="og:title" content="${esc(titleText)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="https://kalenteri365.fi${path}"><meta property="og:site_name" content="Kalenteri365"><meta property="og:image" content="https://kalenteri365.fi${social.src || "/assets/og.png"}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:alt" content="${esc(social.alt || title)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(titleText)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="https://kalenteri365.fi${social.src || "/assets/og.png"}"><link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48 96x96"><link rel="icon" href="/assets/icon-96.png" type="image/png" sizes="96x96"><link rel="icon" href="/assets/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/icon-180.png" sizes="180x180"><link rel="preload" href="/assets/fonts/lato-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/lato-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/finland.css"><link rel="stylesheet" href="/assets/edition.css"><script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script></head><body data-kind="${kind}" data-year="${year}" data-month="${month}"><a class="skip" href="#sisalto">Siirry sisältöön</a><header class="site-header"><div class="topbar wrap">${link("/", logo, "brand")}<nav class="primary" aria-label="Päänavigaatio">${link("/kalenteri/", art("calendar")+"<span>Kalenterit</span>")}${link("/juhlapyhat/", art("celebrations")+"<span>Juhlapyhät</span>")}${link("/koulujen-lomat/", art("school")+"<span>Koulujen lomat</span>")}${link("/horoskooppi/", art("star")+"<span>Horoskooppi</span>")}</nav><div class="search-wrap"><form role="search" action="/haku/"><label class="sr-only" for="site-search">Hae sivustolta</label><input id="site-search" name="q" placeholder="Hae kalenteria, päivää tai työkalua…" autocomplete="off"><button aria-label="Hae">${icon("search")}</button></form><div id="search-results" hidden></div></div><span class="country"><svg width="27" height="17" viewBox="0 0 18 11" aria-hidden="true"><path fill="#fff" d="M0 0h18v11H0z"/><path fill="#002F6C" d="M5 0h3v11H5z M0 4h18v3H0z"/></svg> Suomi</span><button class="mobile-menu" aria-label="Avaa valikko" aria-expanded="false" data-action="menu">${icon("menu")}</button></div><div class="subbar"><nav class="wrap subnav" aria-label="Kalenterit ja työkalut"><div class="subyears"><span>Kalenterit</span>${YEARS.map((y) => link("/kalenteri/" + y + "/", y, year === y ? "active" : "")).join("")}</div>${link("/pdf-kalenteri/", art("download") + "<span>PDF-kalenterit</span>")}${link("/tyopaivat/", art("briefcase") + "<span>Työpäivät</span>")}${link("/paivamaaralaskuri/", art("calculator") + "<span>Päivämäärälaskuri</span>")}<details class="tools-menu"><summary>${art("tools")}<span>Lisää työkaluja</span><span aria-hidden="true">⌄</span></summary><div class="mega-menu">${[
    ...new Set(tools.map((t) => t[4])),
  ]
    .map(
      (group) =>
        `<section><h2>${group}</h2>${tools
          .filter((t) => t[4] === group)
          .map((t) =>
            link("/" + t[0] + "/", art(TOOL_ART[t[0]] || t[3]) + t[1]),
          )
          .join("")}</section>`,
    )
    .join(
      "",
    )}</div></details></nav></div></header><main id="sisalto" class="wrap">${path !== "/" ? `<nav class="breadcrumb" aria-label="Murupolku">${link("/", "Etusivu")}<span>/</span>${path.split("/").filter(Boolean).length > 1 ? link("/" + path.split("/")[1] + "/", tools.find((t) => t[0] === path.split("/")[1])?.[1] || ({blogi:"Blogi",oppaat:"Oppaat"})[path.split("/")[1]] || "Kalenteri") + "<span>/</span>" : ""}<span>${esc(title)}</span></nav><div class="page-heading">${pageArt}<div><p class="eyebrow">SUOMI · KALENTERI365</p><h1>${esc(title)}</h1><p>${esc(description)}</p></div><div class="heading-tools no-print">${button(icon("print") + " Tulosta", "print", "btn secondary")}${!['tietoa','lahteet','tietosuoja','evasteet','kayttoehdot','saavutettavuus','yhteystiedot','toimitusperiaatteet','valokuvat-ja-lisenssit','haku','sivukartta','tyokalut','404'].includes(path.split('/')[1])?'<button type="button" class="btn secondary" data-share-open>'+icon('share')+' Jaa sivu</button>':''}</div></div>` : ""}${body}${relatedTopics(path)}</main><footer class="site-footer"><div class="footer-topline wrap"><span>Vähän enemmän tilaa tärkeille asioille.</span>${link("/tyokalut/", "Löydä oma työkalusi " + icon("arrow"))}</div><div class="wrap footer-grid"><div>${link("/", logo, "brand")}<p>Suomen päivät, sinun suunnitelmasi.</p><p>Kalenterit, juhlat ja käytännön työkalut selkeämpään arkeen.</p><span class="small">Ajat: Europe/Helsinki · Viikot: ISO 8601</span></div><div><h2>Kalenterit</h2>${link("/kalenteri/", "Vuosikalenterit")}${link("/pdf-kalenteri/", "Tulostettavat kalenterit")}${link("/juhlapyhat/", "Juhlapyhät")}${link("/kuukalenteri/", "Kuukalenteri")}</div><div><h2>Suunnittelu</h2>${link("/luo-kalenteri/", "Luo oma kalenteri")}${link("/tyokalut/", "Kaikki työkalut")}${link("/koulujen-lomat/", "Koulujen lomat")}${link("/lomasuunnittelija/", "Lomasuunnittelija")}</div><div><h2>Tietoa</h2>${link("/tietoa/", "Tietoa sivustosta")}${link("/lahteet/", "Lähteet ja laskentatavat")}${link("/tietosuoja/", "Tietosuoja")}${link("/saavutettavuus/", "Saavutettavuus")}${link("/blogi/", "Blogi ja oppaat")}${link("/usein-kysyttya/", "Usein kysyttyä")}${link("/valokuvat-ja-lisenssit/", "Valokuvat ja lisenssit")}${link("/yhteystiedot/", "Yhteystiedot")}</div></div><div class="wrap footer-bottom"><div class="footer-signature"><small>© ${new Date().getUTCFullYear()} Kalenteri365</small></div><div>${link("/kayttoehdot/", "Käyttöehdot")}${link("/evasteet/", "Evästeet")}${link("/blogi/", "Blogi ja oppaat")}${link("/sivukartta/", "Sivukartta")}</div></div></footer><dialog id="event-dialog"><form id="event-form"><div class="dialog-head"><h2>Tapahtuma</h2><button type="button" data-action="close-dialog" aria-label="Sulje">${icon("close")}</button></div><input name="id" type="hidden"><label>Otsikko<input name="title" required maxlength="160"></label><div class="form-row"><label>Päivämäärä<input name="date" type="date" required></label><label>Kellonaika<input name="time" type="time"></label></div><label>Kalenteri<select name="category"><option value="personal">Oma</option><option value="work">Työ</option><option value="family">Perhe</option><option value="school">Opiskelu</option></select></label><label>Toistuvuus<select name="repeat"><option value="none">Ei toistoa</option><option value="weekly">Joka viikko</option><option value="monthly">Joka kuukausi</option><option value="yearly">Joka vuosi</option></select></label><label>Muistiinpano<textarea name="note" rows="3" maxlength="2000"></textarea></label><div class="actions"><button class="btn" type="submit">Tallenna tapahtuma</button><button class="btn danger" type="button" data-action="delete-event" hidden>Poista</button></div><p class="small">Tallennetaan tämän selaimen muistiin.</p></form></dialog><section class="storage-notice no-print" id="storage-notice" aria-labelledby="storage-title" hidden><div class="storage-mark">${art("privacy")}</div><div class="storage-copy"><h2 id="storage-title">Omat suunnitelmat. Oma selain.</h2><p>Tapahtumat ja asetukset tallentuvat tälle laitteelle. Emme käytä mainos- tai analytiikkaevästeitä.</p></div><div class="storage-actions">${link("/evasteet/","Tietoa tallennuksesta","btn secondary")}<button type="button" class="btn" id="storage-dismiss">${icon("check")} Selvä</button></div></section><div id="toast" hidden role="status" aria-live="polite"></div><script id="page-config" type="application/json">${JSON.stringify({ kind, year, month, ...extra }).replaceAll("<", "\\u003c")}</script><script type="module" src="/assets/app.mjs"></script></body></html>`;
}
