import {examCalendar} from './exams.mjs';
import {runtimeAssets} from './runtime.mjs';
import {planSheet} from '../src/plan-sheet.mjs';
import {plannerCards,generatePlannerSet} from './planner-downloads.mjs';
import {shiftPlanner} from '../src/shift-ui.mjs';
import {lunarCards,generateLunarSet} from './lunar-downloads.mjs';
import {gardenHub,gardenDetails} from './garden.mjs';
import {edition,dailyMarkup,PROFILES} from '../lib/horoscope.mjs';
import { PHOTO_CREDITS, photo } from "../src/photos.mjs";
import { educationPages } from "./education.mjs";
import { ascendantForm, sunStage } from "../src/enhanced-tools.mjs";
import { cover, favicons } from "./social.mjs";
import { moonSVG } from "../src/lunar.mjs";
import { TOPIC_COPY, FAQ } from "../src/editorial.mjs";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  YEARS,
  MONTHS,
  SLUGS,
  DAYS,
  date,
  parse,
  iso,
  add,
  fi,
  day,
  week,
  weekStart,
  weeksInYear,
  holidays,
  workStats,
  leap,
  cap,
  ics,
  CITIES,
  SOURCES,
  daysInMonth,
} from "../src/calendar.mjs";
import {
  layout,
  esc,
  icon,
  link,
  button,
  section,
  table,
  yearLinks,
  toolCards,
  tools,
  calTable,
  skyline,
  art,
} from "../src/ui.mjs";
import { makeArt } from "./art.mjs";
import { extraPages } from "./finland-content.mjs";
import {
  phases,
  seasons,
  riseSet,
  localEclipses,
  time,
  moonMonth,
} from "../src/astronomy.mjs";
import { STYLES, exportCalendar } from "../src/exports.mjs";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  OUT = path.join(ROOT, "dist"),
  ASSET = path.join(OUT, "assets");
await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(ASSET, { recursive: true });
await fs.mkdir(path.join(OUT, "lataukset"), { recursive: true });
const indexnow=JSON.parse(await fs.readFile(path.join(ROOT,'data/indexnow.json'),'utf8'));
if(indexnow.host!=='kalenteri365.fi'||!/^[0-9a-f]{32}$/.test(indexnow.key)||indexnow.keyLocation!==`https://kalenteri365.fi/${indexnow.key}.txt`)throw Error('Invalid IndexNow host/key configuration');
await fs.copyFile(path.join(ROOT,indexnow.key+'.txt'),path.join(OUT,indexnow.key+'.txt'));
await fs.cp(path.join(ROOT, "assets"), ASSET, { recursive: true });
await makeArt(path.join(ASSET, "art"));
for (const p of PHOTO_CREDITS.filter((p) => p.src.endsWith(".webp"))) {
  for (const width of [320, 640])
    await sharp(path.join(ROOT, p.src.slice(1)))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(ASSET, "photos", p.id + "-" + width + ".webp"));
}
await fs.writeFile(
  path.join(ASSET, "photo-index.json"),
  JSON.stringify(
    PHOTO_CREDITS.filter((p) => ["city", "municipality"].includes(p.kind)).map(
      ({ id, src, alt, name }) => ({ id, src, alt, name }),
    ),
  ),
);
for (const weight of [400, 700, 900])
  await fs.copyFile(
    path.join(
      ROOT,
      `node_modules/@fontsource/lato/files/lato-latin-${weight}-normal.woff2`,
    ),
    path.join(ASSET, `fonts/lato-latin-${weight}-normal.woff2`),
  );
await fs.copyFile(
  path.join(ROOT, "node_modules/astronomy-engine/astronomy.browser.min.js"),
  path.join(ASSET, "astronomy.min.js"),
);
await fs.copyFile(
  path.join(ROOT, "src/calendar.mjs"),
  path.join(ASSET, "calendar.mjs"),
);
await fs.copyFile(path.join(ROOT, "src/ui.mjs"), path.join(ASSET, "ui.mjs"));
await fs.copyFile(
  path.join(ROOT, "src/home-view.mjs"),
  path.join(ASSET, "home-view.mjs"),
);
await fs.copyFile(
  path.join(ROOT, "src/search.mjs"),
  path.join(ASSET, "search.mjs"),
);
await fs.copyFile(
  path.join(ROOT, "src/lunar.mjs"),
  path.join(ASSET, "lunar.mjs"),
);
await fs.copyFile(path.join(ROOT,"src/shifts.mjs"),path.join(ASSET,"shifts.mjs"));
await fs.copyFile(
  path.join(ROOT, "src/solar-day.mjs"),
  path.join(ASSET, "solar-day.mjs"),
);
await sharp(path.join(ROOT, "assets/photos/moon-full.jpg"))
  .extract({ left: 80, top: 64, width: 800, height: 800 })
  .resize(800)
  .jpeg({ quality: 90 })
  .toFile(path.join(ASSET, "photos/moon-surface.jpg"));
const data = { holidays: {}, phases: {}, seasons: {}, cities: CITIES };
for (const y of [2026, ...YEARS, 2031]) data.holidays[y] = holidays(y);
for (const y of YEARS) {
  data.phases[y] = phases(y);
  data.seasons[y] = seasons(y);
}
await fs.writeFile(path.join(ASSET, "data.json"), JSON.stringify(data));
await fs.writeFile(
  path.join(ASSET, "studio/finland-data.mjs"),
  "export const FINLAND_HOLIDAYS=" +
    JSON.stringify(
      Object.fromEntries(
        YEARS.map((y) => [
          y,
          holidays(y)
            .filter((h) => h.type === "holiday")
            .map((h) => ({
              date: h.date,
              title: h.name,
              holiday: true,
              source: SOURCES.holidays,
            })),
        ]),
      ),
    ) +
    ";export const STUDIO_PHOTOS=[];",
);
const searchText=new Map();
const downloadHash=createHash('sha256');
for(const source of ['src/exports.mjs','src/calendar.mjs','src/lunar-exports.mjs','src/astronomy.mjs','src/lunar.mjs','src/planner-exports.mjs','assets/photos/moon-full.jpg','assets/fonts/Lato-Regular.ttf','assets/fonts/Lato-Bold.ttf',...['school','week','family','shift'].map(name=>'assets/planner-art/'+name+'.svg')])downloadHash.update(await fs.readFile(path.join(ROOT,source)));
const downloadVersion=downloadHash.digest('hex').slice(0,16);
const pages = [],
  exportIndex = [];
async function page(p, title, desc, body, kind = "page", extra = {}) {
  const social = await cover(ASSET, p, title, desc);
  if (pages.some((x) => x.path === p)) throw Error("Duplicate page " + p);
  const group=p.split('/')[1],plannerFamily={'viikkokalenteri':'week','perhekalenteri':'family','lukujarjestys':'school','koulukalenteri':'school','tyovuorosuunnittelija':'shift'}[group];
  if(plannerFamily&&p.split('/').filter(Boolean).length===1)body+=plannerCards(plannerFamily);
  if(group==='juhlapyhat'&&p==='/juhlapyhat/')body+=holidayDirectory();
  const copy = TOPIC_COPY[group];
  if (copy && p.split("/").filter(Boolean).length === 1)
    body += section(
      copy[0],
      copy
        .slice(1)
        .map((t) => `<p>${esc(t)}</p>`)
        .join(""),
      "topic-guide",
    );
  body=body.replace(/((?:href|src)=")(\/lataukset\/[^"?]+\.(?:pdf|webp))"/g,(_,attribute,url)=>attribute+url+'?v='+downloadVersion+'"');
  let folder = path.join(OUT, p);
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(
    path.join(folder, "index.html"),
    layout({ path: p, title, description: desc, body, kind, social, structuredImages:PHOTO_CREDITS.filter(image=>body.includes(image.src)||body.includes(image.src.replace('.webp','-640.webp'))||body.includes(image.src.replace('.webp','-320.webp'))||(image.id==='moon-full'&&body.includes('moon-surface.jpg'))).map(image=>({'@type':'ImageObject',contentUrl:'https://kalenteri365.fi'+image.src,caption:image.alt,creditText:image.author+' · '+image.license,license:image.licenseUrl||image.source,acquireLicensePage:image.source})), ...extra }),
  );
  searchText.set(p,[...new Set(body.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').toLocaleLowerCase('fi').split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>1))].join(' '));
  pages.push({
    path: p,
    title,
    description: desc,
    group: p.split("/")[1] || "etusivu",
    indexable: p !== "/valokuvat-ja-lisenssit/",
  });
}
const notice = (txt) =>
  `<aside class="notice">${icon("info")}<p>${txt}</p></aside>`;
const tag = (h) =>
  `<span class="tag ${h.type}">${h.type === "flag" ? (h.flagClass === "official" ? "Virallinen liputuspäivä" : "Vakiintunut liputuspäivä") : { holiday: "Pyhäpäivä", flag: "Liputuspäivä", eve: "Aatto", observance: "Merkkipäivä" }[h.type]}</span>`;
const hTable = (hs) =>
  table(
    ["Päivämäärä", "Päivä", "Juhla", "Luokitus"],
    hs.map((h) => [
      fi(parse(h.date)),
      cap(DAYS[day(parse(h.date))]),
      link("/juhlapyhat/" + h.slug + "/", esc(h.name)),
      tag(h),
    ]),
  );
const sourceNote = (key = "holidays") =>
  `<p class="small">Lähde: ${link(SOURCES[key], key === "holidays" ? "Helsingin yliopiston almanakkatoimisto" : "Alkuperäinen lähde")} · Tarkistettu 12.11.2026. ${link("/lahteet/", "Laskentatavat ja rajaukset")}</p>`;
const stat = (n, t) =>
  `<div class="stat"><strong>${n}</strong><span>${t}</span></div>`;
function holidayDirectory(){return `<section class="content-section holiday-directory"><div class="section-heading"><div><p class="eyebrow">SUOMEN VUODENKIERTO</p><h2>Juhlat, tarinat ja merkkipäivät</h2><p>Katso päivän tausta, vuosien 2027–2030 ajankohdat ja omat muistutukset.</p></div></div><div class="holiday-topic-grid">${holidays(2027).filter(h=>h.slug!=='eduskuntavaalit').map(h=>{const p=PHOTO_CREDITS.find(p=>p.applicableSlugs?.includes(h.slug));return `<article class="holiday-topic"><a href="/juhlapyhat/${h.slug}/" class="holiday-topic-cover ${p&&p.width<p.height?'portrait':''}">${p?photo(p.id,{sizes:'(max-width:600px) 90vw, (max-width:1000px) 45vw, 30vw'}):art(h.type==='flag'?'flag':h.type==='holiday'?'celebrations':'memorial')}</a><div><span class="small">${fi(parse(h.date))} · ${h.type==='holiday'?'Pyhäpäivä':h.type==='eve'?'Aatto':h.type==='flag'?'Liputuspäivä':'Merkkipäivä'}</span><h3>${link('/juhlapyhat/'+h.slug+'/',esc(h.name))}</h3><p>${esc(h.description)}</p>${link('/juhlapyhat/'+h.slug+'/','Tutustu päivään '+icon('arrow'),'topic-open')}</div></article>`}).join('')}</div></section>`;}
const monthLinks = (base, y) =>
  `<div class="cards">${MONTHS.map((m, i) => link(`/${base}/${y}/${SLUGS[i]}/`, `<h3>${cap(m)}</h3><p>${y} ${icon("arrow")}</p>`, "tool-card")).join("")}</div>`;
const monthNav = (base, y, m) =>
  `<nav class="month-nav" aria-label="Kuukaudet">${m > 1 ? link(`/${base}/${y}/${SLUGS[m - 2]}/`, "← " + cap(MONTHS[m - 2])) : y > 2027 ? link(`/${base}/${y - 1}/joulukuu/`, "← Joulukuu " + (y - 1)) : "<span></span>"}${link("/" + base + "/" + y + "/", y)}${m < 12 ? link(`/${base}/${y}/${SLUGS[m]}/`, cap(MONTHS[m]) + " →") : y < 2030 ? link(`/${base}/${y + 1}/tammikuu/`, "Tammikuu " + (y + 1) + " →") : "<span></span>"}</nav>`;
function downloadCards(y, m, moon = false) {
  return `<div class="download-grid">${(moon ? STYLES.slice(0, 1) : STYLES)
    .map(([s, n, d]) => {
      let stem = `kalenteri-${y}${m ? "-" + String(m).padStart(2, "0") : ""}-${s}${moon ? "-kuu" : ""}`;
      return `<article class="download-card"><a class="preview-pad" href="/lataukset/${stem}.pdf" target="_blank" rel="noopener"><img src="/lataukset/${stem}-preview.webp" width="1000" height="${s === "muistiinpanot" ? 1414 : 707}" loading="lazy" alt="${esc(n + " " + (m ? MONTHS[m - 1] + " " : "") + y + " kalenteri, Suomi")}"></a><div class="download-info"><h3>${n} ${m ? cap(MONTHS[m - 1]) : y}</h3><p>${!m && s === "muistiinpanot" ? "Pystysuuntainen vuosikalenteri, kaikki 12 kuukautta." : d} · A4 · Vektori-PDF / kuva 600 ppi</p><div class="actions">${link("/lataukset/" + stem + ".pdf", art("pdf") + " PDF " + icon("download"), "btn")}${link("/lataukset/" + stem + ".webp", art("image") + " Kuva " + icon("download"), "btn secondary")}${link(`/luo-kalenteri/?year=${y}&month=${m || 1}`, "Muokkaa", "btn secondary")}</div></div></article>`;
    })
    .join("")}</div>`;
}
function dashboard(y = 2027, m = 1) {
  return `<div class="dashboard"><aside class="left-rail" aria-label="Paikalliset tiedot ja juhlapäivät"><section class="panel city-panel"><div class="city-head"><p class="eyebrow">TÄSSÄ JA NYT</p><h2>${art("flag")} Tänään Suomessa</h2></div><figure class="city-photo-wrap"><img id="city-photo" src="/assets/photos/helsinki-640.webp" width="1200" height="675" alt="Suomenlinnan linnoitussaari ja rantamuurit Helsingissä" fetchpriority="high"><figcaption id="city-caption">Helsinki</figcaption></figure><div class="city-body"><div class="today-date" id="today-date">Suomen paikallinen aika</div><div class="clock-face"><svg class="clock-dial" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="dial-metal" x2="1" y2="1"><stop stop-color="#fff"/><stop offset=".5" stop-color="#9cb4c0"/><stop offset="1" stop-color="#28516a"/></linearGradient><radialGradient id="dial-glass" cx=".32" cy=".23"><stop stop-color="#fff"/><stop offset="1" stop-color="#dcebef"/></radialGradient></defs><circle cx="50" cy="51" r="47" fill="#133e53"/><circle cx="49" cy="48" r="46" fill="url(#dial-metal)"/><circle cx="49" cy="48" r="39" fill="url(#dial-glass)"/>${Array.from({length:12},(_,i)=>`<path d="M49 13v${i%3===0?6:3}" transform="rotate(${i*30} 49 48)" stroke="#69838e" stroke-width="${i%3===0?2.5:1.5}" stroke-linecap="round"/>`).join('')}<g id="clock-hour"><path d="M49 50V28" stroke="#193f53" stroke-width="5" stroke-linecap="round"/></g><g id="clock-minute"><path d="M49 52V19" stroke="#557b8b" stroke-width="3" stroke-linecap="round"/></g><g id="clock-second"><path d="M49 57V17" stroke="#bb7948" stroke-width="1.4" stroke-linecap="round"/></g><circle cx="49" cy="48" r="3.5" fill="#bb7948"/><path d="M21 32a32 32 0 0 1 44-12" fill="none" stroke="#fff" stroke-width="3" opacity=".65"/></svg><div class="clock-content"><span class="clock-label">SUOMEN AIKA</span><div class="clock" id="helsinki-clock">—:—</div><small id="clock-zone">EET · Helsinki</small></div></div><label class="place-label" for="city-select">Paikkakunta</label><div class="place-field">${art("location")}<select id="city-select" aria-label="Valitse paikkakunta">${CITIES.map((c) => `<option value="${c[0]}">${c[1]}</option>`).join("")}</select></div><p class="place-choice-note" id="place-choice-note">Valitse paikkakunta ennustetta varten.</p><div class="weather" id="weather">${icon("sun")}<span>Sääennuste</span><strong>—</strong></div><div class="weather-note" id="weather-note">Sääennuste: MET Norway</div><a class="rail-foot" href="/auringonnousu-ja-lasku/">Auringonnousu ja -lasku →</a><a class="rail-foot" href="/kuukalenteri/">Kuun vaiheet →</a></div></section><section class="panel"><h2>Seuraavat juhlat</h2><div id="upcoming">${holidays(
    2027,
  )
    .filter((h) => h.type === "holiday")
    .slice(0, 3)
    .map((h) =>
      link(
        "/juhlapyhat/" + h.slug + "/",
        `<time>${h.date.slice(8)}.${h.date.slice(5, 7)}.</time><div><strong>${h.name}</strong><span>Pyhäpäivä</span></div>`,
        "upcoming-item",
      ),
    )
    .join(
      "",
    )}</div>${link("/juhlapyhat/", "Kaikki juhlapyhät →", "rail-foot")}</section><section class="panel filter-list"><h2>Omat kalenterit</h2>${[
    ["holiday", "Suomen pyhäpäivät"],
    ["flag", "Liputus- ja merkkipäivät"],
    ["personal", "Oma"],
    ["work", "Työ"],
    ["family", "Perhe"],
    ["school", "Opiskelu"],
  ]
    .map(
      ([v, n]) =>
        `<label><input type="checkbox" data-filter="${v}" checked>${n}</label>`,
    )
    .join(
      "",
    )}<p class="small">Omat merkinnät tallentuvat tähän selaimeen.</p></section></aside><div class="calendar-main"><div class="statbar"><div>${art("calendar")}<div><strong id="stat-week">${week(date(y, m, 1)).number}</strong><span>ISO-viikko</span></div></div><div>${art("flag")}<div><strong id="stat-day">1</strong><span>Vuoden päivä</span></div></div><div>${art("clock")}<div><strong id="stat-month">${daysInMonth(y, m)}</strong><span>Päiviä kuukaudessa</span></div></div></div><section class="calendar-panel" data-print-title="${cap(MONTHS[m - 1])} ${y}"><div class="calendar-toolbar"><button class="iconbtn prev" data-action="prev-month" aria-label="Edellinen jakso">${icon("chevron")}</button><h2 id="calendar-title">${cap(MONTHS[m - 1])} ${y}</h2><button class="iconbtn" data-action="next-month" aria-label="Seuraava jakso">${icon("chevron")}</button><button class="plainbtn" data-action="today">Tänään</button>${button(icon("plus") + " Lisää tapahtuma", "new-event", "btn")}</div><div class="viewbar"><div class="tabs" role="group" aria-label="Kalenterin näkymä">${[
    ["month", "Kuukausi"],
    ["week", "Viikko"],
    ["day", "Päivä"],
    ["list", "Lista"],
    ["year", "Vuosi"],
  ]
    .map(
      ([v, n]) =>
        `<button data-view="${v}" class="${v === "month" ? "active" : ""}">${n}</button>`,
    )
    .join(
      "",
    )}</div><div class="jump"><select id="jump-year" aria-label="Vuosi">${[2026, ...YEARS, 2031].map((yy) => `<option ${yy === y ? "selected" : ""}>${yy}</option>`).join("")}</select><select id="jump-month" aria-label="Kuukausi">${MONTHS.map((mm, i) => `<option value="${i + 1}" ${i + 1 === m ? "selected" : ""}>${cap(mm)}</option>`).join("")}</select></div></div><div id="calendar-view">${calTable(y, m)}</div><noscript><p class="noscript">Kalenteri on luettavissa ilman JavaScriptiä. Omat merkinnät ja näkymän vaihto tarvitsevat JavaScriptin. ${link("/kalenteri/", "Selaa vuosia ja kuukausia →")}</p></noscript><div class="calendar-footer"><div class="legend"><span><i class="dot today"></i> Tänään</span><span><i class="dot"></i> Pyhäpäivä</span></div><div class="actions">${button(icon("print") + " Tulosta", "print", "btn secondary")}${link(YEARS.includes(y) ? `/pdf-kalenteri/${y}/${SLUGS[m - 1]}/` : "/pdf-kalenteri/", icon("download") + " Lataa", "btn secondary")}${link(`/luo-kalenteri/?year=${y}&month=${m}`, "Muokkaa", "btn secondary")}</div></div></section></div><aside class="right-rail" aria-label="Oma päivä ja merkinnät"><section class="panel"><h2>Minun päiväni</h2><p class="selected-date" id="selected-date">${fi(date(y, m, 1))}</p><ul id="day-events" class="event-list"><li class="empty">Tilaa päivän suunnitelmille.</li></ul>${button(icon("plus") + " Lisää tapahtuma", "new-event", "textbtn")}</section><section class="panel"><div class="panel-title"><h2>Muistiinpanot</h2>${button("Tallenna", "save-notes")}</div><label for="day-notes" class="sr-only">Päivän muistiinpanot</label><textarea class="note-area" id="day-notes" placeholder="Mitä haluat muistaa?"></textarea></section><section class="panel"><h2>Tehtävät</h2><form class="task-form" id="task-form"><label for="task-title" class="sr-only">Uusi tehtävä</label><input id="task-title" required maxlength="200" placeholder="Lisää tehtävä…"><button aria-label="Lisää tehtävä">${icon("plus")}</button></form><ul id="tasks" class="task-list"></ul></section><section class="panel"><h2>Oma kalenteri talteen</h2><div class="data-actions"><label class="upload-label">Tuo ICS<input id="import-ics" type="file" accept=".ics,text/calendar"></label>${button("Vie ICS", "export-ics")}${button("Varmuuskopio", "backup")}<label class="upload-label">Palauta kopio<input id="restore-json" type="file" accept=".json,application/json"></label></div><p class="small" style="margin-top:10px">Merkinnät pysyvät tällä laitteella. Ota kopio ennen selaintietojen tyhjentämistä.</p></section></aside></div>`;
}
await page(
  "/",
  "Suomalainen kalenteri 2027–2030",
  "Kalenterit, Suomen juhlapyhät ja omat suunnitelmat yhdessä paikassa.",
  `<section class="home-heading"><div><p class="eyebrow">SUOMALAINEN KALENTERI · 2027–2030</p><h1>Tilaa arjen suunnitelmille.</h1><p>Juhlapyhät, omat tapahtumat ja vuoden kaikki mahdollisuudet.</p></div>${link("/luo-kalenteri/", art("create") + "<span><strong>Luo oma kalenteri</strong><small>Oma tyyli. Omat tärkeät päivät.</small></span>" + icon("arrow"), "create-cta")}</section>${dashboard(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1)}<section class="under-dashboard"><div class="section-heading"><h2>Jokaiselle päivälle jotain hyödyllistä.</h2>${link("/tyokalut/", "Kaikki työkalut " + icon("arrow"))}</div>${toolCards(tools.filter((t) => ["pdf-kalenteri", "lomasuunnittelija", "koulujen-lomat", "kuukalenteri", "perhekalenteri", "auringonnousu-ja-lasku"].includes(t[0])))}<div class="feature-banner"><div><h2>Sinun vuotesi. Valmiina paperille.</h2><p>Suomen pyhäpäivät ja viikkonumerot. Neljä ulkoasua, PDF ja kuva.</p></div>${link("/pdf-kalenteri/", "Valitse kalenteri " + icon("arrow"), "btn")}</div></section>`,
  "home",
);
await page(
  "/tyokalut/",
  "Kalenterit ja suunnittelutyökalut",
  "Valitse työkalu arkeen, työhön, opiskeluun tai luonnon seuraamiseen.",
  `<section class="panel tool-finder no-print"><label for="tool-filter">Mitä haluat suunnitella?</label><input id="tool-filter" type="search" placeholder="Hae esimerkiksi loma, Kuu tai työpäivät"><span id="tool-count" role="status">${tools.length} työkalua</span></section><div class="tool-directory">` +
    [...new Set(tools.map((t) => t[4]))]
      .map(
        (g) =>
          `<section class="content-section" data-tool-group><h2>${g}</h2>${toolCards(tools.filter((t) => t[4] === g))}</section>`,
      )
      .join("") +
    "</div>",
);
for (const base of [
  "kalenteri",
  "kuukausikalenteri",
  "pdf-kalenteri",
  "kuukalenteri",
  "tyopaivat",
  "juhlapyhat",
  "liputuspaivat",
  "merkkipaivat",
  "viikkokalenteri",
  "pitkat-viikonloput",
]) {
  const title = tools.find((t) => t[0] === base)?.[1] || base,
    description = tools.find((t) => t[0] === base)?.[2] || "";
  await page(
    "/" + base + "/",
    `${title} 2027–2030`,
    description,
    yearLinks(base) +
      (base === "kalenteri"
        ? `<section class="year-grid">${YEARS.map((y) => `<article class="month-card"><h2>${link("/kalenteri/" + y + "/", `Kalenteri ${y} ${icon("arrow")}`)}</h2>${calTable(y, 1, { mini: true })}<p>${leap(y) ? "Karkausvuosi · 366 päivää" : "365 päivää"} · ${weeksInYear(y)} ISO-viikkoa</p></article>`).join("")}</section>`
        : base === "pdf-kalenteri"
          ? downloadCards(2027, 0)
          : base === "kuukalenteri"
            ? `<div class="astro-sky"><img class="moon-photo" src="/assets/photos/moon-surface.jpg" width="800" height="800" alt="Täysikuun pinta Gregory H. Reveran valokuvassa"><div><p class="eyebrow">TAIVAS SUOMEN AJASSA</p><h2>Seuraa Kuun rytmiä.</h2><p>Kuun neljä päävaihetta tarkkoine ajankohtineen. Kalenterit 2027–2030.</p></div></div>`
            : base === "juhlapyhat"
              ? hTable(
                  holidays(2027).filter((h) =>
                    ["holiday", "eve"].includes(h.type),
                  ),
                )
              : base === "liputuspaivat"
                ? hTable(
                    holidays(2027).filter(
                      (h) => h.type === "flag" || h.isFlagDay,
                    ),
                  )
                : base === "merkkipaivat"
                  ? hTable(holidays(2027).filter((h) => h.type !== "holiday"))
                  : base === "tyopaivat"
                    ? notice(
                        "Laskenta: maanantai–perjantai miinus arkipäivälle osuvat pyhäpäivät. Aattoja ei vähennetä oletuksena. Työaika ja palkalliset vapaat määräytyvät oman sopimuksesi mukaan.",
                      ) +
                      toolCards(
                        tools.filter((t) =>
                          ["tyopaivalaskuri", "tyovuorosuunnittelija"].includes(
                            t[0],
                          ),
                        ),
                      )
                    : base === "viikkokalenteri"
                      ? notice(
                          "ISO-viikko alkaa maanantaina. Vuoden ensimmäiseen viikkoon kuuluu 4. tammikuuta. Vuoden lopussa viikkovuosi voi poiketa kalenterivuodesta.",
                        ) +
                        "<h2>Suunnittele oma viikkosi</h2>"+toolCards(
                          tools.filter((t) =>
                            ["paivasuunnittelija", "perhekalenteri"].includes(
                              t[0],
                            ),
                          ),
                        )
                      : ""),
  );
}
for (const y of YEARS) {
  console.log("Generating year", y);
  const hs = holidays(y),
    ps = data.phases[y];
  await fs.writeFile(
    path.join(OUT, `lataukset/suomen-juhlapyhat-${y}.ics`),
    ics(
      hs.filter((h) => h.type === "holiday"),
      `Suomen juhlapyhät ${y}`,
    ),
  );
  await fs.writeFile(
    path.join(OUT, `lataukset/suomen-merkkipaivat-${y}.ics`),
    ics(hs, `Suomen juhla- ja merkkipäivät ${y}`),
  );
  await fs.writeFile(
    path.join(OUT, `lataukset/kuun-vaiheet-${y}.ics`),
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Kalenteri365.fi//Moon//FI",
      ...ps.flatMap((p) => [
        "BEGIN:VEVENT",
        `UID:${p.utc}-moon@kalenteri365.fi`,
        "DTSTAMP:20261112T000000Z",
        `DTSTART:${p.utc.replace(/[-:]/g, "").replace(/\.\d+Z/, "Z")}`,
        `SUMMARY:${p.name}`,
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ].join("\r\n") + "\r\n",
  );
  await page(
    `/kalenteri/${y}/`,
    `Kalenteri ${y}`,
    `Vuoden ${y} suomalainen kalenteri: kaikki kuukaudet, pyhäpäivät ja ISO-viikkonumerot.`,
    yearLinks() +
      `<div class="actions content-section">${link("/pdf-kalenteri/" + y + "/", icon("download") + " Lataa vuosikalenteri", "btn")}${link("/lataukset/suomen-juhlapyhat-" + y + ".ics", "Pyhäpäivät omaan kalenteriin", "btn secondary")}</div><div class="year-grid">${MONTHS.map((m, i) => `<article class="month-card"><h2>${link(`/kalenteri/${y}/${SLUGS[i]}/`, cap(m))}${link(`/kalenteri/${y}/${SLUGS[i]}/`, icon("arrow"))}</h2>${calTable(y, i + 1, { mini: true })}</article>`).join("")}</div>`,
    "year",
    { year: y },
  );
  for (const b of ["kuukausikalenteri", "pdf-kalenteri", "kuukalenteri"])
    await page(
      `/${b}/${y}/`,
      `${tools.find((t) => t[0] === b)[1]} ${y}`,
      b === "pdf-kalenteri"
        ? `Vuoden ${y} tulostettavat kalenterit: neljä ulkoasua, PDF ja 600 ppi kuva.`
        : `Valitse kuukausi vuoden ${y} kalenterista.`,
      yearLinks(b) +
        (b === "pdf-kalenteri"
          ? downloadCards(y, 0) +
            '<h2 style="margin-top:30px">Kuukausikalenterit</h2>'
          : "") +
        monthLinks(b, y) +
        (b === "kuukalenteri"
          ? lunarCards(y,0)+table(
              ["Vaihe", "Suomen päivämäärä", "Kellonaika"],
              ps.map((p) => [
                p.name,
                fi(parse(p.date.slice(0, 10))),
                time(p.utc),
              ]),
            )
          : ""),
      "page",
      { year: y },
    );
  for (const b of ["juhlapyhat", "liputuspaivat", "merkkipaivat"]) {
    let list = hs.filter((h) =>
      b === "juhlapyhat"
        ? ["holiday", "eve"].includes(h.type)
        : b === "liputuspaivat"
          ? h.type === "flag" || h.isFlagDay
          : h.type !== "holiday",
    );
    await page(
      `/${b}/${y}/`,
      `${tools.find((t) => t[0] === b)[1]} ${y}`,
      `Suomen ${b === "juhlapyhat" ? "juhlapyhät ja aatot" : b === "liputuspaivat" ? "liputuspäivät" : "merkkipäivät"} ${y}: päivämäärät ja viikonpäivät.`,
      yearLinks(b) +
        hTable(list) +
        notice(
          "Pyhäpäivä, liputuspäivä ja aatto ovat eri asioita. Aaton vapaapäivä ja pyhän työjärjestelyt riippuvat työstä ja sovellettavasta sopimuksesta.",
        ) +
        `<div class="actions">${link(`/lataukset/suomen-${b === "juhlapyhat" ? "juhlapyhat" : "merkkipaivat"}-${y}.ics`, icon("download") + " Lataa ICS", "btn")}</div><h2 style="margin-top:30px">Kuukausittain</h2>` +
        monthLinks(b, y) +
        sourceNote(),
      "page",
      { year: y },
    );
  }
  const stats = MONTHS.map((_, i) => workStats(y, i + 1));
  await page(
    `/tyopaivat/${y}/`,
    `Työpäivät ja työtunnit ${y}`,
    `Työpäivät kuukausittain Suomessa ${y}. Laskentaperusteena ma–pe, pyhäpäivät vähennettyinä.`,
    yearLinks("tyopaivat") +
      `<div class="stats">${stat(
        stats.reduce((a, b) => a + b.workdays, 0),
        "laskennallista työpäivää",
      )}${stat(
        stats.reduce((a, b) => a + b.holidays, 0),
        "arkipyhää ma–pe",
      )}${stat(stats.reduce((a, b) => a + b.workdays, 0) * 7.5, "tuntia, oletus 7,5 h / päivä")}${stat(leap(y) ? 366 : 365, "kalenteripäivää")}</div>` +
      table(
        ["Kuukausi", "Ma–pe", "Arkipyhät", "Työpäivät", "Tunnit, 7,5 h"],
        stats.map((s, i) => [
          link(`/tyopaivat/${y}/${SLUGS[i]}/`, cap(MONTHS[i])),
          s.weekdays,
          s.holidays,
          s.workdays,
          s.hours.toLocaleString("fi-FI"),
        ]),
      ) +
      notice(
        "Laskelma ei ole henkilökohtainen työvuoroluettelo. Jouluaatto ja juhannusaatto sisältyvät ma–pe-päiviin; voit vähentää ne työpäivälaskurissa. Lauantaita, sunnuntaita tai henkilökohtaisia lomia ei lasketa työpäiviksi.",
      ) +
      link("/tyopaivalaskuri/", "Laske oma ajanjakso →", "btn"),
    "page",
    { year: y },
  );
  let weekendRows = [];
  for (
    let start = date(y, 1, 1);
    start <= date(y, 12, 31);
    start = add(start, 1)
  ) {
    let end = add(start, 8),
      ds = Array.from({ length: 9 }, (_, i) => add(start, i)),
      off = ds.filter(
        (d) =>
          day(d) < 5 &&
          !hs.some((h) => h.date === iso(d) && h.type === "holiday"),
      );
    if (
      off.length <= 4 &&
      ds.some((d) =>
        hs.some((h) => h.date === iso(d) && h.type === "holiday"),
      ) &&
      day(start) === 5
    )
      weekendRows.push([
        `${fi(start)}–${fi(end)}`,
        `${off.length} lomapäivää`,
        `${9} vapaapäivää`,
        off.map(fi).join(", "),
      ]);
  }
  await page(
    `/pitkat-viikonloput/${y}/`,
    `Pitkät viikonloput ${y}`,
    `Yhdistä arkipyhät ja lomapäivät pidemmäksi vapaaksi vuonna ${y}.`,
    yearLinks("pitkat-viikonloput") +
      table(
        ["Ajanjakso", "Tarvittava loma", "Vapaa yhteensä", "Haettavat päivät"],
        weekendRows,
      ) +
      notice(
        "Ehdotukset olettavat maanantai–perjantai-työviikon ja vapaana pidettävät pyhäpäivät. Työnantaja hyväksyy lomat erikseen. Aattoja ei lasketa automaattisesti vapaiksi.",
      ) +
      link("/lomasuunnittelija/", "Suunnittele oma loma →", "btn"),
    "page",
    { year: y },
  );
  await page(
    `/viikkokalenteri/${y}/`,
    `Viikkokalenteri ${y}`,
    `Vuoden ${y} ISO-viikot: päivämäärät ja muokattava viikkosuunnitelma.`,
    yearLinks("viikkokalenteri") +
      table(
        ["Viikko", "Maanantai", "Sunnuntai", "Suunnitelma"],
        Array.from({ length: weeksInYear(y) }, (_, i) => {
          const d = weekStart(y, i + 1);
          return [
            i + 1,
            fi(d),
            fi(add(d, 6)),
            link(`/viikkokalenteri/${y}/viikko-${i + 1}/`, "Avaa viikko →"),
          ];
        }),
      ),
    "page",
    { year: y },
  );
  for (let w = 1; w <= weeksInYear(y); w++) {
    let d = weekStart(y, w);
    await page(
      `/viikkokalenteri/${y}/viikko-${w}/`,
      `Viikko ${w}, ${y}`,
      `Viikko ${w}: ${fi(d)}–${fi(add(d, 6))}. Kirjoita suunnitelmat ja tulosta oma viikkokalenteri.`,
      `${link(`/viikkokalenteri/${y}/`, "← Kaikki vuoden viikot")}<div class="actions content-section">${w > 1 ? link(`/viikkokalenteri/${y}/viikko-${w - 1}/`, "← Edellinen viikko", "btn secondary") : ""}${w < weeksInYear(y) ? link(`/viikkokalenteri/${y}/viikko-${w + 1}/`, "Seuraava viikko →", "btn secondary") : ""}</div>${weeklySheet(d)}${notice("Suunnitelmat tallennetaan vain tähän selaimeen. Tulosta sivu tai tallenna selaimen tulostusikkunasta PDF:nä.")}`,
      "planner",
      { year: y, extra: { start: iso(d), planner: "week" } },
    );
  }
  for (let m = 1; m <= 12; m++) {
    const s = workStats(y, m),
      hm = hs.filter((h) => parse(h.date).getUTCMonth() + 1 === m),
      pm = ps.filter((p) => parse(p.date.slice(0, 10)).getUTCMonth() + 1 === m),
      desc = `${cap(MONTHS[m - 1])} ${y}: Suomen pyhät, ISO-viikot ja tulostettava kalenteri.`;
    await page(
      `/kalenteri/${y}/${SLUGS[m - 1]}/`,
      `${cap(MONTHS[m - 1])} ${y}`,
      desc,
      monthNav("kalenteri", y, m) +
        dashboard(y, m) +
        `<section class="content-section" style="margin-top:30px"><h2>Kuukauden tärkeät päivät</h2>${hm.length ? hTable(hm) : "<p>Tässä kuukaudessa ei ole kalenteriin merkittyjä juhlapäiviä.</p>"}</section><div class="stats">${stat(s.days, "päivää")}${stat(s.workdays, "työpäivää ma–pe")}${stat(s.holidays, "arkipyhää ma–pe")}${stat(pm.length, "Kuun päävaihetta")}</div>${toolCards(tools.filter((t) => ["pdf-kalenteri", "tyopaivat", "kuukalenteri"].includes(t[0])))}`,
      "calendar",
      { year: y, month: m },
    );
    await page(
      `/kuukausikalenteri/${y}/${SLUGS[m - 1]}/`,
      `${cap(MONTHS[m - 1])} ${y} – kuukausikalenteri`,
      desc,
      monthNav("kuukausikalenteri", y, m) + downloadCards(y, m),
      "page",
      { year: y, month: m },
    );
    await page(
      `/pdf-kalenteri/${y}/${SLUGS[m - 1]}/`,
      `${cap(MONTHS[m - 1])} ${y} PDF-kalenteri`,
      `Neljä tulostettavaa ${MONTHS[m - 1]}n ${y} kalenteria. Vektori-PDF ja 600 ppi kuva.`,
      monthNav("pdf-kalenteri", y, m) + downloadCards(y, m),
      "page",
      { year: y, month: m },
    );
    const moonDays = moonMonth(y, m),
      firstMoon = moonDays[0];
    await page(
      `/kuukalenteri/${y}/${SLUGS[m - 1]}/`,
      `${cap(MONTHS[m - 1])} ${y} | Kuukalenteri`,
      `Kuun valaistus joka päivä ja päävaiheet Suomen ajassa: ${MONTHS[m - 1]} ${y}.`,
      monthNav("kuukalenteri", y, m) +
        `<div class="lunar-layout"><section class="panel lunar-month"><h2>${cap(MONTHS[m - 1])} ${y}</h2><p class="small">Valitse päivä. Valaistus lasketaan klo 12.00 Suomen aikaa.</p><div class="lunar-weekdays">${DAYS.map((d) => `<span>${cap(d.slice(0, 2))}</span>`).join("")}</div><div class="lunar-grid">${Array.from({ length: day(date(y, m, 1)) }, () => "<span></span>").join("")}${moonDays.map((d, i) => `<button class="lunar-day ${i ? "" : "selected"}" data-moon-date="${d.date}" data-moon-angle="${d.angle}" data-moon-light="${d.illumination}" aria-pressed="${!i}"><span>${i + 1}</span>${moonSVG(d.angle, "moon-" + d.date)}<strong>${(100 * d.illumination).toLocaleString("fi-FI", { maximumFractionDigits: 1 })} %</strong></button>`).join("")}</div></section><aside class="panel lunar-selected"><p class="eyebrow">VALITTU PÄIVÄ</p><h2 id="moon-selected-title">${fi(parse(firstMoon.date))}</h2><div id="moon-selected-disc">${moonSVG(firstMoon.angle, "selected-disc")}</div><strong id="moon-selected-light">${(100 * firstMoon.illumination).toLocaleString("fi-FI", { maximumFractionDigits: 1 })} % valaistuna</strong><p>Päivän valaistus klo 12.00 Suomen aikaa.</p><p class="small">Valokuvapohja: Gregory H. Revera, CC BY-SA 3.0. Vaiheen valaistus on laskettu havainnekuva.</p></aside></div>` +
        section(
          "Kuukauden päävaiheet",
          table(
            ["Vaihe", "Päivä", "Kello Suomessa"],
            pm.map((p) => [
              p.name,
              fi(parse(p.date.slice(0, 10))),
              time(p.utc),
            ]),
          ),
        ) +
        `<div class="actions content-section">${link(`/lataukset/kuun-vaiheet-${y}.ics`, art("ics") + " Kuun vaiheet kalenteriin " + icon("download"), "btn")}</div>`+lunarCards(y,m),
      "page",
      { year: y, month: m },
    );
    await page(
      `/tyopaivat/${y}/${SLUGS[m - 1]}/`,
      `${cap(MONTHS[m - 1])} ${y} – työpäivät`,
      `Laskennalliset työpäivät ja työtunnit Suomessa: ${MONTHS[m - 1]} ${y}.`,
      monthNav("tyopaivat", y, m) +
        `<div class="stats">${stat(s.workdays, "työpäivää")}${stat(s.holidays, "arkipyhää ma–pe")}${stat(s.hours.toLocaleString("fi-FI"), "tuntia, oletus 7,5 h / päivä")}${stat(s.days, "päivää kuukaudessa")}</div><section class="calendar-panel">${calTable(y, m)}</section>` +
        notice(
          "Ma–pe miinus arkipyhät. Juhannusaatto ja jouluaatto eivät vähennä tulosta. Tarkista vapaat ja päivittäinen työaika omasta sopimuksestasi.",
        ) +
        link("/tyopaivalaskuri/", "Muokkaa laskentaa →", "btn"),
      "page",
      { year: y, month: m },
    );
    for (const b of ["juhlapyhat", "liputuspaivat", "merkkipaivat"]) {
      let hh = hm.filter((h) =>
        b === "juhlapyhat"
          ? ["holiday", "eve"].includes(h.type)
          : b === "liputuspaivat"
            ? h.type === "flag" || h.isFlagDay
            : h.type !== "holiday",
      );
      await page(
        `/${b}/${y}/${SLUGS[m - 1]}/`,
        `${cap(MONTHS[m - 1])} ${y} – ${b === "juhlapyhat" ? "juhlapyhät" : b === "liputuspaivat" ? "liputuspäivät" : "merkkipäivät"}`,
        `Kuukauden ${MONTHS[m - 1]} ${y} päivämäärät, viikonpäivät ja päivän luokitus.`,
        monthNav(b, y, m) +
          (hh.length
            ? hTable(hh)
            : section(
                "Kuukauden päivät",
                "<p>Tähän luokkaan ei kuulu merkittyjä päiviä tässä kuukaudessa.</p>",
              )) +
          `<section class="calendar-panel" style="margin-top:25px">${calTable(y, m)}</section>` +
          sourceNote(),
        "page",
        { year: y, month: m },
      );
    }
  }
}
for (const h of holidays(2027).filter((h) => h.slug !== "eduskuntavaalit")){
  const image=PHOTO_CREDITS.find(p=>p.applicableSlugs?.includes(h.slug));
  await page(
    "/juhlapyhat/" + h.slug + "/",
    h.name,
    `${h.name}: Suomen päivämäärät 2027–2030, viikonpäivät ja päivän merkitys kalenterissasi.`,
    `${image?`<figure class="holiday-cover ${image.width<image.height?'portrait':''}">${photo(image.id,{lazy:false,sizes:"(max-width:700px) 100vw, 1100px"})}<figcaption>${esc(image.caption)}</figcaption></figure>`:""}<div class="two-columns holiday-details">${section(
      h.name,
      `<p class="holiday-lead">${h.description}</p><p>${tag(h)}</p>` +
        table(
          ["Vuosi", "Päivämäärä", "Viikonpäivä"],
          YEARS.map((y) => {
            let d = holidays(y).find((x) => x.slug === h.slug);
            return [
              link("/juhlapyhat/" + y + "/", y),
              link("/kalenteri/"+y+"/"+SLUGS[parse(d.date).getUTCMonth()]+"/?date="+d.date,fi(parse(d.date))),
              cap(DAYS[day(parse(d.date))]),
            ];
          }),
        ) + `<p>${h.type==="holiday"?"Kalenteriin merkitty pyhäpäivä auttaa huomaamaan poikkeavan päivän jo suunnitteluvaiheessa. Työvuorot, palveluiden aukiolo ja mahdollinen vapaa kannattaa silti tarkistaa omasta tilanteesta. Juhla ei siirry automaattisesti seuraavalle arkipäivälle, jos se osuu viikonloppuun.":h.type==="eve"?"Aaton ajankohta ja työstä vapaa päivä ovat eri asioita. Jos suunnittelet lomaa aaton ympärille, valitse lomasuunnittelijassa aattojen käsittely omaan työpaikkaasi sopivaksi.":"Merkkipäivä tai liputuspäivä ei automaattisesti ole työstä tai koulusta vapaa. Voit lisätä päivälle oman muistutuksen ja tarkistaa tapahtumapaikan ohjelman järjestäjän tiedoista."}</p>` + sourceNote(h.isFlagDay?"flags":"holidays"),
    )}${section("Suunnittele päivä", `<p>Lisää päivä kalenteriisi tai katso koko vuoden pyhät.</p>${yearLinks("juhlapyhat")}${link("/lomasuunnittelija/", "Lomasuunnittelija →", "btn")}<h3>Oma muistutus</h3><p>Valitse vuosi ja lisää päivälle oma tapahtuma.</p><div class="holiday-reminders">${YEARS.map(y=>{const d=holidays(y).find(x=>x.slug===h.slug);return `<button class="btn secondary" data-add-date="${d.date}" data-add-title="${esc(h.name)}">${art("dayplan")} ${y} ${icon("plus")}</button>`}).join("")}</div>`)}</div>`,
  );
}
function weeklySheet(d) {
  return `<section class="weekly-workspace"><h2>Oma viikkosuunnitelma</h2><div class="plan-days weekly-days" style="--plan-days:7">${Array.from({length:7},(_,i)=>`<article class="plan-day"><h3>${cap(DAYS[i])}<time datetime="${iso(add(d,i))}">${fi(add(d,i))}</time></h3><div>${holidays(add(d,i).getUTCFullYear()).filter(h=>h.date===iso(add(d,i))).map(h=>`<p class="plan-holiday">${esc(h.name)}</p>`).join('')}<label class="plan-field" for="plan-${i}">Päivän suunnitelmat<textarea id="plan-${i}" data-plan="${iso(add(d,i))}" rows="10" maxlength="2400" placeholder="Tapahtumat ja muistettavat asiat…"></textarea></label></div></article>`).join('')}</div><section class="panel week-goals"><h2>Viikon tärkeimmät</h2><label for="week-goals">Tavoitteet ja muistettavaa</label><textarea id="week-goals" data-plan="week-goals-${iso(d)}" rows="3" placeholder="Mikä on tällä viikolla tärkeää?"></textarea></section><div class="sheet-brand"><strong>Kalenteri365™</strong><span>kalenteri365.fi</span></div></section>`;
}
const datesForm = (id, more = "") =>
  `<form id="${id}" class="panel"><div class="form-grid"><label>Alkupäivä<input name="start" type="date" value="2027-01-01" required></label><label>Loppupäivä<input name="end" type="date" value="2027-12-31" required></label>${more}</div><div class="form-actions"><button class="btn">Laske</button></div><div class="result" id="calc-result" aria-live="polite"></div></form>`;
const SIGNS = [
  ["oinas", "Oinas", "21.3.–19.4."],
  ["harka", "Härkä", "20.4.–20.5."],
  ["kaksoset", "Kaksoset", "21.5.–20.6."],
  ["rapu", "Rapu", "21.6.–22.7."],
  ["leijona", "Leijona", "23.7.–22.8."],
  ["neitsyt", "Neitsyt", "23.8.–22.9."],
  ["vaaka", "Vaaka", "23.9.–22.10."],
  ["skorpioni", "Skorpioni", "23.10.–21.11."],
  ["jousimies", "Jousimies", "22.11.–21.12."],
  ["kauris", "Kauris", "22.12.–19.1."],
  ["vesimies", "Vesimies", "20.1.–18.2."],
  ["kalat", "Kalat", "19.2.–20.3."],
];
await educationPages({ page, OUT });
for (const [base, title, desc] of tools) {
  if (pages.some((p) => p.path === `/${base}/`)) continue;
  let body = "",
    kind = "tool",
    extra = {};
  switch (base) {
    case "paivamaaralaskuri":
      body = `<div class="two-columns"><div class="stack">${section("Päivämäärien erotus", datesForm("date-diff", '<label class="wide"><span><input type="checkbox" name="inclusive"> Laske myös loppupäivä mukaan</span></label>'))}${section("Lisää tai vähennä päiviä", `<form id="date-add"><div class="form-grid"><label>Päivämäärä<input name="start" type="date" value="2027-01-01" required></label><label>Päivien määrä<input name="amount" type="number" value="30" min="-100000" max="100000" required></label></div><p class="small">Vähennä päiviä antamalla negatiivinen määrä.</p><button class="btn">Laske päivämäärä</button><div class="result" id="add-result" aria-live="polite"></div></form>`)}</div>${section("Miten laskenta toimii?", "<p>Päivämäärälaskenta käyttää kalenteripäiviä. Kellonsiirto ei muuta päivien lukumäärää.</p><p>Ilman loppupäivän sisällyttämistä saman päivän erotus on 0. Loppupäivä mukaan laskettuna tulos on 1.</p>")}</div>`;
      break;
    case "tyopaivalaskuri":
      body =
        datesForm(
          "work-calc",
          '<label>Tuntia päivässä<input name="hours" type="number" min="0.25" max="24" step="0.25" value="7.5" required></label><label class="wide"><input name="eves" type="checkbox"> Vähennä myös juhannusaatto ja jouluaatto</label>',
        ) +
        notice(
          "Molemmat rajapäivät lasketaan mukaan. Työpäivä on ma–pe, joka ei ole yleinen pyhäpäivä. Henkilökohtaisia lomia tai työpaikan omia vapaita ei huomioida.",
        );
      break;
    case "paivalaskuri":
      body =
        section(
          "Oma lähtölaskenta",
          `<form id="countdown-form"><div class="form-grid"><label>Tapahtuman nimi<input name="title" value="Oma tärkeä päivä" maxlength="100" required></label><label>Päivämäärä<input name="target" type="date" value="2027-01-01" required></label></div><button class="btn" style="margin-top:18px">Näytä lähtölaskenta</button><div id="countdown-result" class="result" aria-live="polite"></div></form>`,
        ) +
        notice(
          "Laskuri näyttää kalenteripäivien erotuksen Suomen tämän päivän päivämäärästä.",
        );
      break;
    case "viikkonumerot":
      body =
        yearLinks("viikkokalenteri") +
        section(
          "Tarkista viikkonumero",
          `<form id="week-calc"><label>Päivämäärä<input name="date" type="date" value="2027-01-01" required></label><button class="btn" style="margin-top:16px">Näytä ISO-viikko</button><div class="result" id="calc-result" aria-live="polite"></div></form>`,
        ) +
        notice(
          "ISO-viikko alkaa maanantaina. Esimerkiksi 1.1.2027 kuuluu viikkoon 53/2026, vaikka kalenterivuosi on 2027.",
        );
      break;
    case "vuoden-paiva":
      body = section(
        "Päivän järjestysnumero",
        `<form id="day-calc"><label>Päivämäärä<input name="date" type="date" value="2027-01-01" required></label><button class="btn" style="margin-top:16px">Laske</button><div class="result" id="calc-result" aria-live="polite"></div></form>`,
      );
      break;
    case "karkausvuosi":
      body =
        section(
          "Tarkista vuosi",
          `<form id="leap-calc"><label>Vuosi<input name="year" type="number" value="2028" min="1583" max="9999" required></label><button class="btn" style="margin-top:16px">Tarkista</button><div class="result" id="calc-result" aria-live="polite"></div></form>`,
        ) +
        table(
          ["Vuosi", "Päiviä", "Karkausvuosi"],
          YEARS.map((y) => [y, leap(y) ? 366 : 365, leap(y) ? "Kyllä" : "Ei"]),
        ) +
        notice(
          "Gregoriaanisessa kalenterissa neljällä jaollinen vuosi on karkausvuosi, paitsi sadalla jaollinen vuosi. Neljälläsadalla jaollinen vuosi on silti karkausvuosi.",
        );
      break;
    case "lomasuunnittelija":
      body =
        section(
          "Vertaa lomavaihtoehtoja",
          `<form id="vacation-form"><div class="form-grid"><label>Vuosi<select name="year">${YEARS.map((y) => `<option>${y}</option>`).join("")}</select></label><label>Käytettävissä olevat lomapäivät<input name="budget" type="number" value="4" min="0" max="20" required></label><label>Loman enimmäispituus<input name="length" type="number" value="12" min="3" max="31" required></label><label><span><input name="eves" type="checkbox"> Jouluaatto ja juhannusaatto ovat vapaita</span></label></div><button class="btn" style="margin-top:18px">Etsi parhaat vapaat</button><div id="vacation-result" style="margin-top:20px" aria-live="polite"></div></form>`,
        ) +
        yearLinks("pitkat-viikonloput") +
        notice(
          "Vertailu olettaa ma–pe-työviikon. Se laskee poissa tarvittavat työpäivät, ei vuosilomalain mukaista lomapäivien kulumista. Lauantait ja työehtosopimus voivat muuttaa vuosilomapäivien määrää. Tarvittavat työpäivät listataan erikseen. Päivämäärät eivät ole työnantajan myöntämiä lomia.",
        );
      break;
    case "tyovuorosuunnittelija":body=shiftPlanner();break;
    case "luo-kalenteri":
    case "tyhja-kalenteri":
      body = `<div class="studio-layout" data-studio><section class="panel form-controls studio-controls"><h2>Suunnittele oma kalenterisi</h2><div class="form-grid"><label>Vuosi<select id="editor-year">${YEARS.map((y) => `<option>${y}</option>`).join("")}</select></label><label>Kuukausi<select id="editor-month">${MONTHS.map((m, i) => `<option value="${i + 1}">${cap(m)}</option>`).join("")}</select></label><label>Näkymä<select id="editor-view"><option value="month">Kuukausi</option><option value="year">Koko vuosi</option></select></label><label>Ulkoasu<select id="editor-preset"><option value="suomi">Sinivalkoinen Suomi</option><option value="editorial">Vuoden tarina</option><option value="photo">Oma valokuva</option><option value="minimal">Puhdas sivu</option><option value="business">Työn rytmi</option><option value="bold">Auringon sävyt</option></select></label><label class="wide">Otsikko<input id="editor-title" maxlength="90" placeholder="Oma kalenterini"></label><label>Kirjasin<select id="editor-font"><option value="sans">Arial</option><option value="editorial">Georgia</option><option value="clean">Verdana</option><option value="rounded">Trebuchet</option><option value="classic">Times</option><option value="mono">Courier</option></select></label><label>Korostusväri<input id="editor-color" type="color" value="#205c7d"></label><label>Paperi<select id="editor-paper"><option value="a4">A4</option><option value="a3">A3</option></select></label><label>Suunta<select id="editor-orientation"><option value="landscape">Vaaka</option><option value="portrait">Pysty</option></select></label><label class="wide">Oma valokuva<input id="editor-photo" type="file" accept="image/jpeg,image/png,image/webp"></label><label class="wide">Alatunniste<input id="editor-footer" value="Oma aikani. Omat suunnitelmani." maxlength="200"></label><label><input id="editor-holidays" type="checkbox" checked> Suomen pyhäpäivät</label><label><input id="editor-weeks" type="checkbox" checked> Viikkonumerot</label></div><p class="small">Omassa selaimessa tallennetut tapahtumat tulevat mukaan kalenteriin. Valokuvaa ei lähetetä palvelimelle.</p></section><div><section id="editor-preview" class="editor-preview"></section><section class="panel studio-downloads no-print"><div class="section-heading"><h2>Lataa oma kalenterisi</h2><label>Laatu<select id="editor-quality"><option value="600">600 dpi</option><option value="300">300 dpi</option><option value="150">150 dpi</option></select></label></div><div class="studio-formats">${[
        ["pdf", "PDF", "pdf"],
        ["docx", "Word", "word"],
        ["xlsx", "Excel", "excel"],
        ["jpg", "JPG-kuva", "image"],
        ["png", "PNG-kuva", "image"],
      ]
        .map(
          ([f, t, i]) =>
            `<button class="btn ${f === "pdf" ? "" : "secondary"}" data-studio-format="${f}">${art(i)}<span>${t}</span>${icon("download")}</button>`,
        )
        .join(
          "",
        )}${button(icon("print") + " Tulosta", "print", "btn secondary")}</div><p id="editor-export-status" role="status" class="small"></p></section></div></div>`;
      kind = "editor";
      extra = { blank: base === "tyhja-kalenteri" };
      break;
    case "perhekalenteri":
    case "lukujarjestys":
    case "paivasuunnittelija":
    case "koulukalenteri":
    case "opiskelukalenteri": {
      let rows =
        base === "perhekalenteri"
          ? ["Tapahtumat", "Ruoka", "Ostokset", "Muistettavaa"]
          : base === "lukujarjestys"
            ? [
                "8.00",
                "9.00",
                "10.00",
                "11.00",
                "12.00",
                "13.00",
                "14.00",
                "15.00",
              ]
            : base === "paivasuunnittelija"
              ? [
                  "7.00",
                  "8.00",
                  "9.00",
                  "10.00",
                  "11.00",
                  "12.00",
                  "13.00",
                  "14.00",
                  "15.00",
                  "16.00",
                  "17.00",
                  "18.00",
                  "19.00",
                  "20.00",
                ]
              : ["Opinnot", "Palautukset", "Kokeet ja tentit", "Vapaa-aika"];
      body = planSheet(base,title,rows);
      kind = "sheet";
      extra = { planner: base };
      break;
    }
    case "syntymapaivakalenteri":
      body = section(
        "Tärkeät syntymäpäivät",
        `<p>Tallenna syntymäpäivä vuosittain toistuvaksi tapahtumaksi. Näet merkinnät myös etusivun omassa kalenterissa.</p>${button(icon("plus") + " Lisää syntymäpäivä", "new-event", "btn")}<div id="birthdays" style="margin-top:18px"></div><div class="actions">${button("Vie ICS", "export-ics", "btn secondary")}${button("Lataa varmuuskopio", "backup", "btn secondary")}</div>`,
      );
      extra = { defaultRepeat: "yearly" };
      break;
    case "nimipaivat":
      body = `<div class="long-text"><h2>Nimipäiväkalenteri Suomessa</h2><p>Suomenkielistä ja ruotsinkielistä nimipäiväkalenteria ylläpitää Helsingin yliopiston almanakkatoimisto. Suomessa on myös erilliset saamenkieliset ja ortodoksiset nimipäiväkalenterit.</p><p>Katso ajantasainen nimi ja päivämäärä ylläpitäjän omasta palvelusta.</p>${link(SOURCES.names, "Avaa virallinen nimipäiväkalenteri →", "btn")}<h2>Oma nimipäivämuistutus</h2><p>Kun olet tarkistanut nimipäivän, voit tallentaa sen omaan kalenteriisi vuosittain toistuvaksi tapahtumaksi.</p>${button("Lisää oma muistutus", "new-event", "btn secondary")}<p class="small" style="margin-top:20px">Nimipäiväluetteloa ei julkaista tässä palvelussa. Almanakkatoimiston nimipäiväaineisto on erikseen lisensoitavaa.</p></div>`;
      break;
    case "ylioppilaskirjoitukset":body=await examCalendar(OUT);break;
    case "kuun-vaiheet":
    case "taysikuu":
    case "uusikuu":
      body =
        YEARS.map(
          (y) =>
            `<section class="content-section"><h2>${y}</h2><div class="actions content-section">${link(`/lataukset/kuun-vaiheet-${y}.ics`, "Lataa Kuun vaiheet ICS", "btn secondary")}</div>${table(
              ["Vaihe", "Päivämäärä", "Kello Suomessa"],
              data.phases[y]
                .filter((p) =>
                  base === "taysikuu"
                    ? p.quarter === 2
                    : base === "uusikuu"
                      ? p.quarter === 0
                      : true,
                )
                .map((p) => [
                  p.symbol + " " + p.name,
                  fi(parse(p.date.slice(0, 10))),
                  time(p.utc),
                ]),
            )}</section>`,
        ).join("") + sourceNote("astro");
      break;
    case "auringonnousu-ja-lasku":
    case "kuun-nousu-ja-lasku":
    case "paivan-pituus":
      body =
        astroForm(base) +
        `<div class="cards" style="margin-top:25px">${CITIES.map((c) => link(`/${base}/${c[0]}/`, `<span class="tile-icon">${icon(base === "kuun-nousu-ja-lasku" ? "moon" : "sun")}</span><h3>${c[1]}</h3><p>Paikalliset ajat ja vuosikalenterit →</p>`, "tool-card")).join("")}</div>`;
      kind = "astro";
      extra = { body: base === "kuun-nousu-ja-lasku" ? "Moon" : "Sun" };
      break;
    case "vuodenajat":
      body =
        `<div class="season-selector no-print"><label for="season-year">Valitse vuosi</label><select id="season-year">${YEARS.map((y) => `<option>${y}</option>`).join("")}</select></div>` +
        YEARS.map(
          (y, yi) =>
            `<section class="content-section season-year" data-season-year="${y}" ${yi ? "hidden" : ""}><h2>Vuodenajat ${y}</h2><div class="season-grid">${data.seasons[y].map((s, i) => `<article class="season"><img src="/assets/art/season-${["spring", "summer", "autumn", "winter"][i]}.svg" width="640" height="420" alt="${["Kevään sulamisvesi ja koivujen silmut", "Kesäinen järvimaisema ja mökkiranta", "Syksyn keltaiset koivut ja sienet", "Talvinen lumimaisema ja revontulet"][i]}"><div class="season-copy"><p class="eyebrow">${["PÄIVÄNTASAUS", "PÄIVÄNSEISAUS", "PÄIVÄNTASAUS", "PÄIVÄNSEISAUS"][i]}</p><h3>${["Kevät", "Kesä", "Syksy", "Talvi"][i]}</h3><strong>${fi(parse(s.date))} · ${s.time}</strong><p>Suomen aikaa</p><p>${["Päivät pitenevät ja valo lisääntyy. Kevään eteneminen luonnossa vaihtelee alueittain.", "Pohjoisen valoisa vuodenaika. Lapissa Aurinko voi pysyä horisontin yläpuolella läpi yön.", "Päivät lyhenevät, luonto vaihtaa väriä ja sadonkorjuu päättää kasvukautta.", "Vuoden pimein aika vaihtuu vähitellen piteneviksi päiviksi. Pohjoisessa on kaamos."][i]}</p></div></article>`).join("")}</div></section>`,
        ).join("") +
        sourceNote("astro");
      break;
    case "kellonsiirto":
      body =
        table(
          ["Vuosi", "Kesäaikaan", "Normaaliaikaan"],
          YEARS.map((y) => {
            let mar = date(y, 4, 0),
              oct = date(y, 11, 0);
            mar = add(mar, -((day(mar) + 1) % 7));
            oct = add(oct, -((day(oct) + 1) % 7));
            return [
              y,
              `${fi(mar)} · 03.00 → 04.00`,
              `${fi(oct)} · 04.00 → 03.00`,
            ];
          }),
        ) +
        notice(
          "Päivämäärät on laskettu nykyisten EU:n kesäaikasääntöjen mukaan: maaliskuun ja lokakuun viimeinen sunnuntai. Mahdolliset tulevat säädösmuutokset voivat muuttaa myöhempien vuosien käytäntöä.",
        ) +
        `<p>Lähde: ${link("https://transport.ec.europa.eu/transport-themes/summertime_en", "Euroopan komissio: kesäaika")}</p>`;
      break;
    case "auringonpimennys":
    case "kuunpimennys": {
      let e = localEclipses(CITIES[0], 2027, 2030),
        list =
          base === "auringonpimennys"
            ? e.sun
            : e.moon.filter((x) => x.altitude > 0);
      body =
        notice(
          "Havaintopaikka: Helsinki. Näkyvyys tarkoittaa, että kohde on horisontin yläpuolella huippuhetkellä; sää ja paikalliset esteet vaikuttavat havaintoon. Muualla Suomessa ajat ja näkyvyys poikkeavat.",
        ) +
        table(
          [
            "Päivä Suomessa",
            "Huippu, Suomen aika",
            "Tyyppi",
            "Korkeus huipulla",
          ],
          list.map((x) => [
            new Intl.DateTimeFormat("fi-FI", {
              timeZone: "Europe/Helsinki",
            }).format(new Date(x.peak)),
            time(x.peak),
            {
              partial: "Osittainen",
              total: "Täydellinen",
              annular: "Rengasmainen",
              penumbral: "Puolivarjopimennys",
            }[x.kind] || x.kind,
            x.altitude.toFixed(1) + "°",
          ]),
        ) +
        (base === "auringonpimennys"
          ? notice(
              "Aurinkoa ei saa katsoa suoraan ilman asianmukaista aurinkosuodatinta. Tavalliset aurinkolasit eivät suojaa silmiä auringonpimennyksen katselussa.",
            )
          : "") +
        sourceNote("astro");
      break;
    }
    case "perseidit":
      body = `<div class="long-text"><h2>Kesäöiden tähdenlennot</h2><p>Perseidit ovat vuosittain heinä–elokuussa näkyvä meteoriparvi. Aktiivisin jakso sijoittuu tavallisesti elokuun puoliväliin. Tarkka vuotuinen huippu kannattaa tarkistaa Ursan havaintotiedoista.</p><h2>Valitse hyvä havaintopaikka</h2><p>Siirry pois kirkkaista kaupunkivaloista, etsi avoin näkymä taivaalle ja anna silmien tottua pimeään. Pohjoisen Suomen vaaleat kesäyöt sekä Kuun valo voivat heikentää havaintoja.</p><div class="actions">${link("https://www.ursa.fi/", "Ursan havaintotiedot →", "btn")}${link("/kuun-vaiheet/", "Tarkista Kuun vaihe", "btn secondary")}</div></div>`;
      break;
    case "kylvokalenteri":body=gardenHub();break;
    case "elakkeiden-maksupaivat":
    case "etuuksien-maksupaivat":
      body = `<div class="long-text"><h2>${base === "elakkeiden-maksupaivat" ? "Eläkelaji ja maksaja ratkaisevat" : "Tarkista oman etuuden maksupäivä"}</h2><p>${base === "elakkeiden-maksupaivat" ? "Kelan eläkkeillä ja työeläkelaitosten eläkkeillä on eri maksuaikataulut. Pelkkä kuukauden päivä ei kerro kaikkien eläkkeiden maksupäivää." : "Kelan etuudet maksetaan etuuskohtaisilla aikatauluilla. Takautuva maksu tai yksilöllinen päätös voi poiketa tavallisesta maksupäivästä."}</p><p>Katso oma päätös ja ajantasaiset maksupäivät Kelan palvelusta tai omalta työeläkelaitokseltasi. Vuosille 2027–2030 ei ole keksitty maksupäiviä tähän kalenteriin.</p>${link(SOURCES.kela, "Kelan maksupäivät →", "btn")}<h2>Lisää vahvistettu päivä omaan kalenteriin</h2><p>Voit tallentaa tarkistamasi maksupäivän henkilökohtaiseksi muistutukseksi.</p>${button("Lisää muistutus", "new-event", "btn secondary")}</div>`;
      break;
    case "horoskooppi": {
      const daily=edition();body=`<!-- COLLECTION:START --><div class="horoscope-updated" data-collection-date><span class="status-dot"></span><strong>Päivitetty tänään</strong><time datetime="${daily.date}">${fi(parse(daily.date))}</time></div><div class="cards horoscope-grid">${PROFILES.map(([slug,name,range,element])=>{const entry=daily.entries[slug];return link('/horoskooppi/'+slug+'/',`<span class="sign-sculpture">${art('zodiac-'+slug)}</span><div class="sign-copy"><p class="eyebrow">${element} · ${range}</p><h2>${name}</h2><h3 data-daily-title="${slug}">${entry.title}</h3><p data-daily-text="${slug}">${entry.overview}</p><span class="card-open">Lue päivän horoskooppi ${icon('arrow')}</span></div>`,'horoscope-card')}).join('')}</div><p class="small">${daily.method}</p><!-- COLLECTION:END -->${ascendantForm()}`;break;}
    case "horoskooppimerkki":
      body =
        section(
          "Löydä horoskooppimerkkisi",
          `<form id="zodiac-form"><label>Syntymäpäivä<input type="date" name="date" value="2000-01-01" required></label><button class="btn" style="margin-top:18px">Näytä merkki</button><div class="result" id="calc-result" aria-live="polite"></div></form>`,
        ) +
        notice(
          "Laskuri käyttää länsimaisen horoskoopin tavanomaisia päivämäärärajoja. Merkin vaihtumisen tarkka hetki riippuu syntymävuodesta ja kellonajasta.",
        );
      break;
    default:
      throw Error("Unimplemented tool " + base);
  }
  await page("/" + base + "/", title, desc, body, kind, { extra });
}
function astroForm(base, city = "helsinki", y = 2027) {
  return (
    `<section class="panel"><form id="astro-form"><div class="form-grid"><label>Paikkakunta<select name="city">${CITIES.map((c) => `<option value="${c[0]}" ${c[0] === city ? "selected" : ""}>${c[1]}</option>`).join("")}</select></label><label>Päivämäärä<input name="date" type="date" value="${y}-01-01" min="2027-01-01" max="2030-12-31" required></label></div><button class="btn" style="margin-top:18px">Laske paikalliset ajat</button><div id="astro-result" class="result" aria-live="polite"></div></form></section>` +
    (base === "kuun-nousu-ja-lasku" ? "" : sunStage()) +
    notice(
      "Ajat ovat Suomen paikallista aikaa, kesäaika huomioiden. Horisontti oletetaan esteettömäksi. Viiva tarkoittaa, ettei tapahtumaa ole kyseisenä paikallisena päivänä. Napaseudulla Aurinko tai Kuu voi olla jatkuvasti horisontin ylä- tai alapuolella.",
    )
  );
}
for(const [slug,name,range] of SIGNS){const entry=edition().entries[slug];await page(`/horoskooppi/${slug}/`,`${name} | Päivän horoskooppi`,`${name}: päivän ajatus, ihmissuhteet ja oma aika. Lue tämän päivän pohdinta ja laske nouseva merkkisi.`, `<article class="panel horoscope-daily" data-horoscope-sign="${slug}"><!-- DAILY:START -->${dailyMarkup(entry)}<!-- DAILY:END --><div class="horoscope-day-nav"><button class="btn secondary" data-horoscope-step="-1">← Edellinen päivä</button><button class="btn secondary" data-horoscope-step="1" disabled>Seuraava päivä →</button></div><p class="small horoscope-disclosure">${esc(edition().method)}</p></article>${ascendantForm()}<nav class="other-signs" aria-label="Muut horoskooppimerkit">${SIGNS.filter(([id])=>id!==slug).map(([id,n])=>link('/horoskooppi/'+id+'/',art('zodiac-'+id)+'<span>'+n+'</span>')).join('')}</nav>`,'horoscope',{extra:{sign:slug}});}
for (const base of [
  "auringonnousu-ja-lasku",
  "kuun-nousu-ja-lasku",
  "paivan-pituus",
])
  for (const city of CITIES) {
    const title = tools.find((t) => t[0] === base)[1],
      body = base === "kuun-nousu-ja-lasku" ? "Moon" : "Sun";
    await page(
      `/${base}/${city[0]}/`,
      `${title} – ${city[1]}`,
      `Paikalliset ajat: ${city[1]}. Koordinaatit ${city[2]}° N, ${city[3]}° E.`,
      astroForm(base, city[0]) +
        `<div class="yearlinks">${YEARS.map((y) => link(`/${base}/${city[0]}/${y}/`, y)).join("")}</div>`,
      "astro",
      { extra: { city: city[0], body } },
    );
    for (const y of YEARS) {
      const rows = [];
      for (let m = 1; m <= 12; m++) {
        let r = riseSet(city, date(y, m, 15), body);
        rows.push([
          fi(date(y, m, 15)),
          r.riseTime,
          r.setTime,
          r.duration === null
            ? r.polar === "up"
              ? "Jatkuvasti ylhäällä"
              : r.polar === "down"
                ? "Jatkuvasti alhaalla"
                : "—"
            : `${Math.floor(r.duration / 60)} h ${r.duration % 60} min`,
        ]);
      }
      await page(
        `/${base}/${city[0]}/${y}/`,
        `${title} ${y} – ${city[1]}`,
        `${city[1]} ${y}: havainnot kuukausien 15. päiviltä ja laskuri mille tahansa päivälle.`,
        astroForm(base, city[0], y) +
          `<h2>Kuukausivertailu · 15. päivä</h2>` +
          table(
            [
              "Päivä",
              "Nousu",
              "Lasku",
              body === "Sun" ? "Valoisaa aikaa" : "Näkyvyystilanne",
            ],
            rows,
          ) +
          sourceNote("astro"),
        "astro",
        { year: y, extra: { city: city[0], body } },
      );
    }
  }
const info = {
  tietoa: [
    "Tietoa Kalenteri365.fi-palvelusta",
    "<h2>Kalenteri Suomen arkeen</h2><p>Kalenteri365.fi kokoaa yhteen vuosien 2027–2030 kalenterit, Suomen juhlapäivät ja oman arjen suunnittelutyökalut. Tavoitteena on tehdä päivistä helpommin hahmotettavia näytöllä ja paperilla.</p><h2>Ilman rekisteröitymistä</h2><p>Oman kalenterin tapahtumat, muistiinpanot ja tehtävät tallentuvat käyttämäsi selaimen paikalliseen muistiin. Niitä ei synkronoida laitteiden välillä. Voit viedä tiedot ICS- tai JSON-tiedostoon.</p><h2>Lähteet esillä</h2><p>Juhlapäivien luokitus, paikallisesti päätettävät koulujen lomat ja tähtitieteelliset laskelmat on erotettu toisistaan. Alkuperäiset lähteet sekä laskentaperusteet ovat luettavissa lähdesivulta.</p>",
  ],
  lahteet: [
    "Lähteet ja laskentatavat",
    `<h2>Suomen juhlapäivät</h2><p>Lähteet: ${link(SOURCES.holidays, "Helsingin yliopiston almanakkatoimisto")} ja ${link(SOURCES.flags, "Sisäministeriön liputuspäivät")}. Pääsiäinen lasketaan gregoriaanisella pääsiäisalgoritmilla. Juhannus on 20.–26.6. osuva lauantai ja pyhäinpäivä 31.10.–6.11. osuva lauantai. Pyhäpäivä ei tarkoita jokaisessa työssä automaattisesti työstä vapaata päivää.</p><h2>Viikot ja työpäivät</h2><p>Viikot ovat ISO 8601 -viikkoja, maanantaista sunnuntaihin. Työpäivälaskelma käyttää ma–pe-päiviä ja vähentää niille osuvat yleiset pyhäpäivät. Aattojen vähennys on erillinen valinta. Tuntien oletus on 7,5 tuntia päivässä.</p><h2>Aurinko, Kuu ja vuodenajat</h2><p>Laskentakirjasto: ${link(SOURCES.astro, "Astronomy Engine 2.1.19, Don Cross, MIT-lisenssi")}. Ajat muunnetaan aikavyöhykkeelle Europe/Helsinki. Nousu- ja laskuajat lasketaan paikkakunnan koordinaateille ja esteettömälle horisontille. Maaston, havaitsijan korkeuden ja sään vaikutuksia ei mallinneta.</p><h2>Koulujen lomat</h2><p>${link(SOURCES.school, "Helsingin kaupungin julkaistut työ- ja loma-ajat")} koskevat nimettyjä lukuvuosia ja koulumuotoja. ${link(SOURCES.education, "Opetushallituksen mukaan")} opetuksen järjestäjät päättävät paikallisista ajoista. Vahvistamattomia aikoja ei esitetä kansallisena lomakalenterina.</p><h2>Maksupäivät ja kokeet</h2><p>${link(SOURCES.kela, "Kelan maksupäivät")} ja ${link(SOURCES.exams, "Ylioppilastutkintolautakunnan koepäivät")} tarkistetaan alkuperäisestä lähteestä. Henkilökohtaiset päätökset ja maksajat voivat muuttaa maksupäiviä.</p><h2>Sää</h2><p>Sääennuste: ${link("https://www.met.no/", "MET Norway")}, ${link("https://creativecommons.org/licenses/by/4.0/", "CC BY 4.0")}. Ennuste noudetaan palvelumme välityksellä valitun paikkakunnan keskusta vastaaville koordinaateille. Se on malliennuste, ei sääaseman havainto. Valokuva ei ole sääkamerakuva.</p><h2>Ulkoasu ja lisenssit</h2><p>Typografia: Lato (SIL Open Font License). Kalenterikuvitus kuuluu sivustoperheen omaan vektorikuvitukseen. Paikkakuntien, yliopistojen, juhlapäivien ja Kuun valokuvien kuvaajat sekä lisenssit on eritelty valokuvasivulla. Sivulla käytetään lisäksi PDF-Lib-, fontkit- ja Sharp-kirjastoja niiden omien lisenssien mukaan.</p><p>Tietojen tarkistuspäivä: 12.11.2026.</p>`,
  ],
  tietosuoja: [
    "Tietosuoja",
    "<h2>Omat merkinnät</h2><p>Tapahtumat, tehtävät, muistiinpanot ja muokattavat suunnitelmat tallennetaan selaimen localStorage-muistiin. Tietoja ei lähetetä tämän palvelun omaan tietokantaan. Valokuvat käsitellään paikallisesti selaimessa.</p><h2>Ulkoiset palvelut</h2><p>MET Norwayn sääennuste haetaan tämän palvelun välityksellä paikkakunnan keskustan koordinaateille. Tarkkaa laitteen sijaintia ei pyydetä eikä selaimen IP-osoitetta välitetä MET Norwaylle sääpyynnössä. Jos paikkakuntaa arvioidaan automaattisesti, Cloudflaren IP-paikkatietoa käytetään lähimmän tuetun Suomen paikkakunnan valintaan. Voit vaihtaa arvion itse. Sivuston jakelusta vastaa Cloudflare, joka käsittelee teknisiä verkkopyyntötietoja oman tietosuojakäytäntönsä mukaisesti. Cloudflare Web Analytics voi mitata koottuja sivulataus- ja suorituskykytietoja ilman analytiikkaevästeitä. Henkilökohtaisia kalenterimerkintöjä tai lomakkeiden sisältöä ei lähetetä mittaukseen. <a href='https://developers.cloudflare.com/web-analytics/about/' rel='noopener'>Cloudflaren kuvaus mittauksesta</a>.</p><h2>Hallinta ja poistaminen</h2><p>Voit viedä omat tiedot varmuuskopioksi tai poistaa tämän sivuston paikalliset tiedot selaimen asetuksista. Selaintietojen tyhjentäminen poistaa myös omat suunnitelmat. Tällä sivustolla ei käytetä mainosseurantaa tai analytiikkaevästeitä.</p>",
  ],
  evasteet: [
    "Evästeet ja paikallinen tallennus",
    "<h2>Mitä selaimeen tallennetaan?</h2><p>Palvelun omat suunnitelmat ja käyttövalinnat tallennetaan localStorageen. Se ei ole eväste eikä tietoja liitetä automaattisesti palvelimelle lähetettäviin pyyntöihin.</p><h2>Tekninen toiminta</h2><p>Palvelun verkkoinfrastruktuuri voi käyttää toiminnan ja turvallisuuden kannalta tarpeellisia teknisiä mekanismeja. Mainonnan seurantatunnisteita ei käytetä. Cloudflaren evästeetön suorituskykymittaus voi olla käytössä; tarkemmat tiedot ovat tietosuojasivulla. Omien merkintöjen käyttö edellyttää selaimen paikallisen tallennuksen sallimista.</p>",
  ],
  kayttoehdot: [
    "Käyttöehdot",
    "<h2>Kalenterin käyttö</h2><p>Voit käyttää sivuston kalentereita omaan suunnitteluusi ja tulostaa niitä. Tarkista työhön, kouluun, etuuksiin ja muihin velvoitteisiin vaikuttavat päivämäärät asianomaiselta taholta.</p><h2>Laskelmien perusteet</h2><p>Työpäivälaskelmat ovat yleisiä laskelmia annetuilla valinnoilla. Tähtitieteelliset ajat ovat laskennallisia arvioita ilmoitettuun havaintopaikkaan. Horoskooppisisältö on viihdettä.</p><h2>Omien tietojen varmuuskopiointi</h2><p>Merkinnät pysyvät käyttämässäsi selaimessa. Ota omista tiedoistasi varmuuskopio ennen selaimen vaihtamista tai sen tietojen poistamista.</p>",
  ],
  saavutettavuus: [
    "Saavutettavuus",
    "<h2>Suunnittelu kaikille</h2><p>Sivuston kieleksi on merkitty suomi. Navigaatio, lomakkeet ja kalenterin päivät on nimetty. Näppäimistökohdistus näkyy ja liikkeen vähentämisen järjestelmäasetus huomioidaan.</p><h2>Käyttövinkit</h2><p>Etusivun kalenterista voit valita listanäkymän, jos kuukausiruudukko on hankala hahmottaa. Valitse päivän painike tarkastellaksesi tapahtumia. Pienellä näytöllä leveitä tietotaulukoita voi vierittää sivusuunnassa.</p><h2>Havaitut ongelmat</h2><p>Tämä ei ole ulkopuolisen tahon tekemä saavutettavuussertifiointi. Palautetta käytetään käyttöliittymän parantamiseen.</p>",
  ],
  yhteystiedot: [
    "Yhteystiedot ja palaute",
    `<div class="contact-lead">${art('names')}<div><p class="eyebrow">KALENTERIPERHEEN YLLÄPITO</p><h2>Kerro, miten voimme auttaa.</h2><p>Kysymys kalenterista, puuttuva lähde tai havaittu virhe? Lähetä viesti, niin asia voidaan tarkistaa.</p></div></div><section class="contact-address"><span>Sähköposti</span><a href="mailto:kalendars365@gmail.com">kalendars365@gmail.com</a>${link('mailto:kalendars365@gmail.com','Kirjoita viesti '+icon('arrow'),'btn')}</section><div class="two-columns"><section class="panel"><h3>Kun ilmoitat virheestä</h3><p>Liitä viestiin sivun osoite, kyseinen päivämäärä ja tarvittaessa virallinen lähde. Kerro myös, käytätkö puhelinta vai tietokonetta.</p></section><section class="panel"><h3>Omat tiedot pysyvät ominasi</h3><p>Älä lähetä henkilötunnusta, terveystietoja tai koko henkilökohtaista kalenteriasi. Sähköpostiosoitetta ja viestin sisältöä käytetään yhteydenoton käsittelyyn.</p></section></div><p class="small">Viestipainike avaa sähköpostiohjelmasi. ${link('/tietosuoja/','Lue tietosuojasta')}</p>`,
  ],
  toimitusperiaatteet: [
    "Toimitusperiaatteet",
    "<h2>Alkuperäiset lähteet ensin</h2><p>Viralliset päivämäärät tarkistetaan julkaisevalta taholta. Paikalliset kouluajat nimetään paikkakunnan ja lukuvuoden mukaan. Puuttuvia julkaisuja ei korvata vahvistetuiksi esitetyillä arvauksilla.</p><h2>Laskelma ja tieto erikseen</h2><p>Astronomiset ajat ja työpäivät lasketaan dokumentoiduilla säännöillä. Horoskoopit erotetaan viihteeksi. Virheistä voi jättää korjauspyynnön sähköpostitse.</p>",
  ],
};
for (const [s, [t, b]] of Object.entries(info))
  await page(
    "/" + s + "/",
    t,
    `${t} – Kalenteri365.fi.`,
    `<article class="long-text">${b}</article>`,
  );
await page(
  "/juhlapyhat/eduskuntavaalit/",
  "Eduskuntavaalit 2027",
  "Eduskuntavaalien vaalipäivä 18.4.2027 ja virallinen tietolähde.",
  section(
    "Vaalipäivä 18. huhtikuuta 2027",
    "<p>Vaalipäivä on sunnuntai 18.4.2027. Päivä on virallinen liputuspäivä. Ennakkoäänestyksen paikat ja ajat tarkistetaan vaalipalvelusta.</p>" +
      link(
        "https://vaalit.fi/eduskuntavaalit",
        "Oikeusministeriön vaalipalvelu →",
        "btn",
      ),
  ),
);
await gardenDetails(page);
await extraPages({ page, section, table, notice, toolCards, link, art });
await page(
  "/usein-kysyttya/",
  "Usein kysyttyä",
  "Vastauksia kalenterin käyttöön, tulostamiseen, omiin merkintöihin ja Suomen juhlapäiviin.",
  `<div class="faq-list">${FAQ.map(([q, a]) => `<details class="panel"><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>`,
);
await page(
  "/valokuvat-ja-lisenssit/",
  "Valokuvat ja lisenssit",
  "Kalenteri365-palvelun valokuvien, kuvituksen ja kirjasinten lähteet.",
  `<article class="long-text"><h2>Kalenteriperheen vektorikuvitus</h2><p>Kalenteri-, työkalu- ja horoskooppikuvitus on sivustoperheen omaa vektorigrafiikkaa. Suomen version kuvituksessa käytetään sinisiä, valkoisia ja luonnon sävyjä. Vuodenaikojen maisemat ovat kuvitusta, eivät valokuvia tietystä paikasta.</p><h2>Paikkakunnat ja yliopistot</h2><p>Kuvat ovat kyseisissä paikoissa otettuja historiallisia valokuvia. Ne eivät ole reaaliaikaisia sääkameroita. Kuvaajien nimet, alkuperäiset julkaisut ja lisenssit on lueteltu kuvakohtaisesti. Kuvat säilyttävät alla mainitun lisenssinsä.</p><div class="photo-license-grid">${PHOTO_CREDITS.filter(
    (p) => p.kind,
  )
    .map(
      (p) =>
        `<article class="photo-credit"><img src="${p.src.replace(".webp", "-320.webp")}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy"><h3>${esc(p.name)}</h3><p>${esc(p.author)} · ${link(p.licenseUrl || p.source, p.license)}</p><p>${esc(p.changes)} ${link(p.source, "Alkuperäinen kuva")}</p></article>`,
    )
    .join(
      "",
    )}</div><h2>Kuun valokuva</h2><p>Gregory H. Revera: ${link("https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg", "FullMoon2010")}, ${link("https://creativecommons.org/licenses/by-sa/3.0/", "CC BY-SA 3.0")}. Kuva on pienennetty ja rajattu. Kuukalenterissa sen päällä käytetään laskettua valaistusmaskia. Se ei ole tiettynä tulevana päivänä otettu valokuva.</p><h2>Kirjasimet ja ohjelmistot</h2><p>Lato-kirjasin on käytössä SIL Open Font License -lisenssillä. Tähtitieteelliset laskelmat tehdään Astronomy Engine -kirjastolla (MIT). PDF-tiedostot tuotetaan PDF-Lib-kirjastolla (MIT).</p><p>Valokuvien lähteet lisätään tähän luetteloon kuvakohtaisesti. Kuvia ei esitetä ajantasaisina sää- tai havaintokuvina.</p></article>`,
);
await page(
  "/haku/",
  "Hae sivustolta",
  "Etsi kalenteria, juhlapäivää, paikkakuntaa tai suunnittelutyökalua.",
  `<form id="page-search-form" class="panel"><label>Hakusana<input id="page-search" name="q" placeholder="Esimerkiksi tammikuu 2028" required></label><button class="btn" style="margin-top:15px">Hae</button></form><div id="page-search-results" class="panel search-page-results" style="margin-top:20px" aria-live="polite"></div>`,
  "search",
);
await page(
  "/sivukartta/",
  "Sivukartta",
  "Kaikki kalenterit ja työkalut aiheittain.",
  `<div class="sitemap-groups">${[...new Set(pages.map((p) => p.group))]
    .map(
      (g) =>
        `<section><h2>${tools.find((t) => t[0] === g)?.[1] || cap(g)}</h2>${pages
          .filter((p) => p.group === g)
          .map((p) => link(p.path, esc(p.title)))
          .join("")}</section>`,
    )
    .join("")}</div>`,
);
// Incremental builds must not retain an obsolete page with an old canonical URL.
const expectedHtml = new Set(
  pages.map((p) => path.join(OUT, p.path, "index.html")),
);
for (const entry of await fs.readdir(OUT, {
  recursive: true,
  withFileTypes: true,
})) {
  if (entry.isFile() && entry.name === "index.html") {
    const file = path.join(entry.parentPath, entry.name);
    if (!expectedHtml.has(file)) await fs.unlink(file);
  }
}
await fs.writeFile(path.join(ASSET, "search.json"), JSON.stringify(pages.filter(p=>p.indexable).map(p=>({...p,keywords:searchText.get(p.path)}))));
await fs.writeFile(
  path.join(OUT, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    pages.filter(p=>p.indexable)
      .map((p) => `<url><loc>https://kalenteri365.fi${esc(p.path)}</loc></url>`)
      .join("") +
    "</urlset>",
);
const imageEntries=[];
for(const p of pages.filter(p=>p.indexable)){
 const html=await fs.readFile(path.join(OUT,p.path,'index.html'),'utf8'),images=[];
 for(const m of html.matchAll(/<img\b[^>]*>/g)){const src=m[0].match(/src="([^"?]+)(?:[^"\s]*)?"/),alt=m[0].match(/alt="([^"]+)"/);if(src&&alt&&(/\/assets\/photos\//.test(src[1])||/\/lataukset\//.test(src[1]))){const original=PHOTO_CREDITS.find(p=>[p.src,p.src.replace('.webp','-320.webp'),p.src.replace('.webp','-640.webp')].includes(src[1]))?.src||src[1].replace('-preview.webp','.webp');const current=original.startsWith('/lataukset/')?original+'?v='+downloadVersion:original;if(!images.some(x=>x.src===current))images.push({src:current,alt:alt[1]});}}
 if(images.length)imageEntries.push(`<url><loc>https://kalenteri365.fi${esc(p.path)}</loc>${images.slice(0,8).map(i=>`<image:image><image:loc>https://kalenteri365.fi${esc(i.src)}</image:loc><image:caption>${i.alt}</image:caption></image:image>`).join('')}</url>`);
}
await fs.writeFile(path.join(OUT,'sitemap-images.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+imageEntries.join('')+'</urlset>');
await fs.writeFile(
  path.join(OUT, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: https://kalenteri365.fi/sitemap.xml\nSitemap: https://kalenteri365.fi/sitemap-images.xml\n",
);
await fs.writeFile(
  path.join(OUT, "404.html"),
  layout({
    path: "/404/",
    title: "Sivua ei löytynyt",
    description: "Etsimääsi osoitetta ei löytynyt.",
    body: `<section class="not-found"><div><p class="eyebrow">404 · SIVUA EI LÖYTYNYT</p><h2>Löydetään oikea sivu.</h2><p>Osoite on voinut muuttua tai siinä voi olla kirjoitusvirhe. Hae kalenteria, juhlapäivää tai työkalua tästä.</p><form id="page-search-form"><label for="page-search">Mitä etsit?</label><div class="not-found-search"><input id="page-search" name="q" placeholder="Esimerkiksi koulujen lomat" required><button class="btn">${icon('search')} Hae</button></div></form><div id="page-search-results" class="search-page-results" aria-live="polite"></div><div class="actions form-actions">${link('/','Etusivulle '+icon('arrow'),'btn secondary')}${link('/tyokalut/','Kaikki työkalut','btn secondary')}</div></div><img src="/assets/art/not-found.svg" width="600" height="460" alt=""></section><section class="content-section"><h2>Näistä pääset alkuun</h2>${toolCards(tools.filter(t=>['kalenteri','juhlapyhat','koulujen-lomat'].includes(t[0])))}</section>`,
  }).replace(
    '<meta name="theme-color"',
    '<meta name="robots" content="noindex"><meta name="theme-color"',
  ),
);
await fs.writeFile(
  path.join(OUT, "_headers"),
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: SAMEORIGIN\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'\n/assets/runtime/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/site-runtime.*.css\n  Cache-Control: public, max-age=31536000, immutable\n/assets/art/*\n  Cache-Control: public, max-age=86400\n/assets/photos/*\n  Cache-Control: public, max-age=604800\n/assets/social/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/*.json\n  Cache-Control: public, max-age=60\n/lataukset/*\n  Cache-Control: public, max-age=86400\n`,
);
const aliases = {
  "pdf-kalenterit": "pdf-kalenteri",
  pyhapaivat: "juhlapyhat",
  "oma-kalenteri": "luo-kalenteri",
  palaute: "yhteystiedot",
};
await fs.writeFile(
  path.join(OUT, "_redirects"),
  Object.entries(aliases)
    .map(([a, b]) => `/${a} /${b}/ 301\n/${a}/* /${b}/:splat 301`)
    .join("\n") +
    "\n" +
    YEARS.map(
      (y) =>
        `/pdf/kalenteri-${y}.pdf /lataukset/kalenteri-${y}-suomi.pdf 301\n` +
        SLUGS.map(
          (m, i) =>
            `/pdf/${m}-${y}.pdf /lataukset/kalenteri-${y}-${String(i + 1).padStart(2, "0")}-suomi.pdf 301`,
        ).join("\n"),
    ).join("\n") +
    "\n",
);
await fs.writeFile(
  path.join(OUT, "release.json"),
  JSON.stringify({
    release: "finland-parity-20261112",
    pages: pages.length,
    commit:
      process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || "local",
    at: new Date().toISOString(),
  }),
);
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#153d65"/><rect x="13" y="16" width="38" height="38" rx="5" fill="#fff"/><path d="M13 29h38M23 11v12M41 11v12" fill="none" stroke="#8cb7d8" stroke-width="5"/><path d="M24 34h6v15h-6z M19 39h23v5H19z" fill="#2866a5"/></svg>`;
await favicons(ASSET);
await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#eef4f7"/><rect width="1200" height="15" fill="#153d65"/><text x="85" y="200" font-family="Arial" font-size="45" font-weight="700" fill="#2866a5">Kalenteri365.fi</text><text x="85" y="315" font-family="Arial" font-size="64" font-weight="700" fill="#203344">Tilaa arjen suunnitelmille.</text><text x="85" y="400" font-family="Arial" font-size="32" fill="#687985">Suomalainen kalenteri · 2027–2030</text><text x="85" y="510" font-family="Arial" font-size="25" fill="#153d65">Kalenterit  /  Juhlapyhät  /  Omat suunnitelmat</text></svg>`,
  ),
)
  .png()
  .toFile(path.join(ASSET, "og.png"));
console.log(`HTML ready: ${pages.length} pages (${pages.filter(p=>p.indexable).length} indexable)`);
await fs.mkdir(path.join(ROOT, "reports"), { recursive: true });
await fs.writeFile(
  path.join(ROOT, "reports/pages.json"),
  JSON.stringify(pages, null, 2),
);
if (!process.argv.includes("--html-only")) {
  const generationHash = createHash("sha256")
    .update(await fs.readFile(path.join(ROOT, "src/exports.mjs")))
    .update(await fs.readFile(path.join(ROOT, "src/calendar.mjs")))
    .digest("hex");
  let cache = {};
  try {
    cache = JSON.parse(
      await fs.readFile(path.join(ROOT, "reports/export-cache.json"), "utf8"),
    );
  } catch {}
  for (const y of YEARS)
    for (let m = 0; m <= 12; m++)
      for (const [slug] of STYLES) {
        let stem = `kalenteri-${y}${m ? "-" + String(m).padStart(2, "0") : ""}-${slug}`;
        try {
          if (cache[stem] !== generationHash)
            throw Error("Changed export source");
          await fs.access(path.join(OUT, "lataukset", stem + ".webp"));
          await fs.access(path.join(OUT, "lataukset", stem + ".pdf"));
          exportIndex.push({ stem, year: y, month: m, style: slug });
        } catch {
          exportIndex.push(
            await exportCalendar(path.join(OUT, "lataukset"), y, m, slug, slug),
          );
        }
        cache[stem] = generationHash;
        await fs.writeFile(
          path.join(ROOT, "reports/export-cache.json"),
          JSON.stringify(cache),
        );
        console.log("Export", stem);
      }
  await fs.writeFile(
    path.join(ROOT, "reports/exports.json"),
    JSON.stringify(exportIndex, null, 2),
  );
}
if(!process.argv.includes("--html-only")){await generateLunarSet(ROOT,OUT);await generatePlannerSet(ROOT,OUT);}
console.log(
  "Build complete:",
  pages.length,
  "pages,",
  exportIndex.length,
  "PDF + WebP pairs",
);

await runtimeAssets(ROOT,ASSET,OUT,pages);
