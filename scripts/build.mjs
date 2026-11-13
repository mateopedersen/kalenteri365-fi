import {printCatalogPage} from '../src/print-catalog-view.mjs';
import {workdayTool} from '../src/workday-view.mjs';
import {workOverviewPage} from '../src/work-overview-view.mjs';
import {dateTools} from '../src/date-tools-view.mjs';
import {personalStart,schoolIntegration,paymentWorkspace,nameDayPanel,writeCommunityCalendars} from '../src/community-view.mjs';
import {taxPage,admissionsPage,flagTool,electionPage,seasonalPage,northernLightTool,ALL_SERVICE_EVENTS} from '../src/services-view.mjs';
import {serviceCalendar} from '../assets/finland-services-core.mjs';
import {swedishPages,swedishLayout,swedishCounterpart} from '../src/swedish.mjs';
import {holidayCalendarPanel} from '../src/holiday-actions.mjs';
import {REMINDERS,eventCalendar,eventDownloadPath} from '../assets/calendar-event-core.mjs';
import {studioBuilder} from '../src/studio-view.mjs';
import {upcomingPanel,calendarFilters,calendarChips,planningPanels} from '../src/dashboard.mjs';
import {localDashboard} from '../src/local-dashboard.mjs';
import {daylightChart} from '../src/daylight-chart.mjs';
import {contentGuide,aboutPage} from '../src/edition-content.mjs';
import {LEGAL_PAGES} from '../src/legal-pages.mjs';
import {homeSections,homeDownloads,blogCards,toolDirectory,calendarDownloads,calendarNavigator,familyPlanner} from '../src/edition-view.mjs';
import blog from '../data/blog.json' with {type:'json'};
import holidayStories from '../data/holiday-stories.json' with {type:'json'};
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
import { fileURLToPath, pathToFileURL } from "node:url";
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
  riseSet as calculateRiseSet,
  localEclipses,
  time,
  moonMonth,
} from "../src/astronomy.mjs";
import { STYLES, exportCalendar } from "../src/exports.mjs";
const riseCache=new Map();
const riseSet=(city,d,body)=>{const key=[city[0],iso(d),body].join('|');if(!riseCache.has(key))riseCache.set(key,calculateRiseSet(city,d,body));return riseCache.get(key);};
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
const cityCards=new Map();
for(const p of PHOTO_CREDITS.filter(p=>['city','city-night'].includes(p.kind))){
  const original=await fs.readFile(path.join(ROOT,p.src.slice(1))),key=createHash('sha256').update('city-card-avif-768-q50-e6-v2').update(original).digest('hex').slice(0,12),src=`/assets/photos/${p.id}-card-${key}.avif`;
  try{await fs.access(path.join(OUT,src));}catch{await sharp(original).resize({width:768,withoutEnlargement:true}).avif({quality:50,effort:6}).toFile(path.join(OUT,src));}
  cityCards.set(p.id,src);
}
for (const p of PHOTO_CREDITS.filter((p) => p.src.endsWith(".webp"))) {
  for (const width of [320, 640])
    await sharp(path.join(ROOT, p.src.slice(1)))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(ASSET, "photos", path.basename(p.src,'.webp') + "-" + width + ".webp"));
}
await fs.writeFile(
  path.join(ASSET, "photo-index.json"),
  JSON.stringify(
    PHOTO_CREDITS.filter((p) => ["city", "municipality"].includes(p.kind)).map(
      ({ id, src, alt, name }) => {
        const night=PHOTO_CREDITS.find(p=>p.kind==='city-night'&&p.cityId===id);
        if(!night&&CITIES.some(city=>city[0]===id))throw Error('Missing licensed night photograph: '+id);
        return {id,src,alt,name,cardSrc:cityCards.get(id)||null,...(night?{night:{id:night.id,src:night.src,alt:night.alt,cardSrc:cityCards.get(night.id)}}:{})};
      },
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
await fs.copyFile(path.join(ROOT,"src/date-math.mjs"),path.join(ASSET,"date-math.mjs"));
await fs.copyFile(path.join(ROOT,"src/workday-math.mjs"),path.join(ASSET,"workday-math.mjs"));
await fs.copyFile(path.join(ROOT,"src/work-overview.mjs"),path.join(ASSET,"work-overview.mjs"));
await fs.copyFile(path.join(ROOT,"src/work-overview-view.mjs"),path.join(ASSET,"work-overview-view.mjs"));
await fs.copyFile(path.join(ROOT, "src/dashboard.mjs"), path.join(ASSET, "dashboard.mjs"));
await fs.copyFile(path.join(ROOT, "src/city-light.mjs"), path.join(ASSET, "city-light.mjs"));
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
await fs.copyFile(path.join(ROOT,"src/daylight-chart.mjs"),path.join(ASSET,"daylight-chart.mjs"));
await fs.copyFile(path.join(ROOT,"src/family-calendar.mjs"),path.join(ASSET,"family-calendar.mjs"));
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
        [2026,...YEARS,2031].map((y) => [
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
const studioEngine=await import(pathToFileURL(path.join(ASSET,'studio/engine.mjs')).href);
await fs.mkdir(path.join(ASSET,'studio/templates'),{recursive:true});
for(const starter of studioEngine.STARTERS)await fs.writeFile(path.join(ASSET,'studio/templates',starter.id+'.svg'),studioEngine.renderCalendar(studioEngine.starterState(starter.id)));
const searchText=new Map();
const downloadHash=createHash('sha256');
for(const source of ['src/exports.mjs','src/print-art.mjs','src/calendar.mjs','src/lunar-exports.mjs','src/astronomy.mjs','src/lunar.mjs','src/planner-exports.mjs','assets/photos/moon-full.jpg','assets/fonts/Lato-Regular.ttf','assets/fonts/Lato-Bold.ttf',...['school','week','family','shift'].map(name=>'assets/planner-art/'+name+'.svg')])downloadHash.update(await fs.readFile(path.join(ROOT,source)));
const downloadVersion=downloadHash.digest('hex').slice(0,16);
const pages = [],
  exportIndex = [];
async function page(p, title, desc, body, kind = "page", extra = {}) {
  const social = await cover(ASSET, p, title, desc);
  if (pages.some((x) => x.path === p)) throw Error("Duplicate page " + p);
  const group=p.split('/')[1],plannerFamily={'viikkokalenteri':'week','perhekalenteri':'family','lukujarjestys':'school','koulukalenteri':'school','tyovuorosuunnittelija':'shift'}[group];
  if(plannerFamily&&p.split('/').filter(Boolean).length===1)body+=plannerCards(plannerFamily);
  if(group==='juhlapyhat'&&p==='/juhlapyhat/')body+=holidayDirectory();
  const period=p.match(/^\/(kalenteri|kuukausikalenteri|pdf-kalenteri)\/(202[7-9]|2030)\/(?:([a-z]+)\/)?$/);
  if(period&&period[1]!=='pdf-kalenteri')body=`<div class="calendar-workspace">${calendarNavigator(Number(period[2]),SLUGS.indexOf(period[3])+1)}<div class="calendar-content">${body}</div></div>`;
  const richCopy=p.split("/").filter(Boolean).length===1&&!["paivamaaralaskuri","tyopaivalaskuri","tyovuorosuunnittelija","tyopaivat","koulujen-lomat","pdf-kalenteri"].includes(group)?contentGuide(group):"";
  body+=richCopy;
  const copy = richCopy||["paivamaaralaskuri","tyopaivalaskuri","tyovuorosuunnittelija","tyopaivat","koulujen-lomat","pdf-kalenteri"].includes(group)?null:TOPIC_COPY[group];
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
    (extra.locale==='sv'?swedishLayout:layout)({ path: p, title, description: desc, body, kind, social, alternate:swedishCounterpart(p), structuredImages:PHOTO_CREDITS.filter(image=>(p==='/'&&['city','city-night','municipality'].includes(image.kind))||body.includes(image.src)||body.includes(image.src.replace('.webp','-640.webp'))||body.includes(image.src.replace('.webp','-320.webp'))||(image.id==='moon-full'&&body.includes('moon-surface.jpg'))).map(image=>({'@type':'ImageObject',contentUrl:'https://kalenteri365.fi'+image.src,caption:image.alt,creditText:image.author+' · '+image.license,license:image.licenseUrl||image.source,acquireLicensePage:image.source})), ...extra }),
  );
  searchText.set(p,[...new Set(body.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<(select|nav)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').toLocaleLowerCase('fi').split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>1))].join(' '));
  pages.push({
    path: p,
    title,
    description: desc,
    group: p.split("/")[1] || "etusivu",
    indexable: p !== "/valokuvat-ja-lisenssit/",
    locale: extra.locale || "fi",
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
  `<div class="cards">${MONTHS.map((m, i) => link(`/${base}/${y}/${SLUGS[i]}/`, `${art("month-"+(i+1))}<div><h3>${cap(m)}</h3><p>${y} ${icon("arrow")}</p></div>`, "tool-card")).join("")}</div>`;
const monthNav = (base, y, m) =>
  `<nav class="month-nav" aria-label="Kuukaudet">${m > 1 ? link(`/${base}/${y}/${SLUGS[m - 2]}/`, "← " + cap(MONTHS[m - 2])) : y > 2027 ? link(`/${base}/${y - 1}/joulukuu/`, "← Joulukuu " + (y - 1)) : "<span></span>"}${link("/" + base + "/" + y + "/", y)}${m < 12 ? link(`/${base}/${y}/${SLUGS[m]}/`, cap(MONTHS[m]) + " →") : y < 2030 ? link(`/${base}/${y + 1}/tammikuu/`, "Tammikuu " + (y + 1) + " →") : "<span></span>"}</nav>`;
function downloadCards(y, m, moon = false) {
  return `<div class="download-grid">${(moon ? STYLES.slice(0, 1) : STYLES)
    .map(([s, n, d]) => {
      let stem = `kalenteri-${y}${m ? "-" + String(m).padStart(2, "0") : ""}-${s}${moon ? "-kuu" : ""}`;
      return `<article class="download-card"><a class="preview-pad" href="/lataukset/${stem}.pdf" target="_blank" rel="noopener"><img src="/lataukset/${stem}-preview.webp" width="1000" height="${(STYLES.find(v=>v[0]===s)?.[4]?.orientation==='portrait'||s==='muistiinpanot') ? 1414 : 707}" loading="lazy" alt="${esc(n + " " + (m ? MONTHS[m - 1] + " " : "") + y + " kalenteri, Suomi")}"></a><div class="download-info"><h3>${n} ${m ? cap(MONTHS[m - 1]) : y}</h3><p>${d} · A4 · PDF / kuva 600 dpi</p><div class="actions">${link("/lataukset/" + stem + ".pdf", art("pdf") + " PDF " + icon("download"), "btn")}${link("/lataukset/" + stem + ".webp", art("image") + " Kuva " + icon("download"), "btn secondary")}${link(`/luo-kalenteri/?year=${y}&month=${m || 1}`, "Muokkaa", "btn secondary")}</div></div></article>`;
    })
    .join("")}</div>`;
}
function dashboard(y = 2027, m = 1, home = false) {
  const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Helsinki'}).format(new Date());
  return `<div class="dashboard"><aside class="left-rail" aria-label="Paikalliset tiedot ja juhlapäivät">${localDashboard(cityCards.get('helsinki'))}${upcomingPanel(today)}${calendarFilters()}${home?nameDayPanel():""}</aside><div class="dashboard-workspace"><div class="dashboard-top"><div class="calendar-main"><div class="statbar"><div>${art("calendar")}<div><strong id="stat-week">${week(date(y, m, 1)).number}</strong><span>ISO-viikko</span></div></div><div>${art("flag")}<div><strong id="stat-day">1</strong><span>Vuoden päivä</span></div></div><div>${art("clock")}<div><strong id="stat-month">${daysInMonth(y, m)}</strong><span>Päiviä kuukaudessa</span></div></div></div><section class="calendar-panel" data-print-title="${cap(MONTHS[m - 1])} ${y}"><div class="calendar-toolbar"><button class="iconbtn prev" data-action="prev-month" aria-label="Edellinen jakso">${icon("chevron")}</button><h2 id="calendar-title">${cap(MONTHS[m - 1])} ${y}</h2><button class="iconbtn" data-action="next-month" aria-label="Seuraava jakso">${icon("chevron")}</button><button class="plainbtn" data-action="today">Tänään</button>${button(icon("plus") + " Lisää tapahtuma", "new-event", "btn")}</div><div class="viewbar"><div class="tabs" role="group" aria-label="Kalenterin näkymä">${[
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
    )}</div><div class="jump"><select id="jump-year" aria-label="Vuosi">${[2026, ...YEARS, 2031].map((yy) => `<option ${yy === y ? "selected" : ""}>${yy}</option>`).join("")}</select><select id="jump-month" aria-label="Kuukausi">${MONTHS.map((mm, i) => `<option value="${i + 1}" ${i + 1 === m ? "selected" : ""}>${cap(mm)}</option>`).join("")}</select></div></div>${calendarChips()}<div id="calendar-view">${calTable(y, m)}</div><noscript><p class="noscript">Kalenteri on luettavissa ilman JavaScriptiä. Omat merkinnät ja näkymän vaihto tarvitsevat JavaScriptin. ${link("/kalenteri/", "Selaa vuosia ja kuukausia →")}</p></noscript><div class="calendar-footer"><div class="legend"><span><i class="dot today"></i> Tänään</span><span><i class="dot"></i> Pyhäpäivä</span></div><div class="actions">${button(icon("print") + " Tulosta", "print", "btn secondary")}${link(YEARS.includes(y) ? `/pdf-kalenteri/${y}/${SLUGS[m - 1]}/` : "/pdf-kalenteri/", icon("download") + " Lataa", "btn secondary")}${link(`/luo-kalenteri/?year=${y}&month=${m}`, "Muokkaa", "btn secondary")}</div></div></section></div>${planningPanels(fi(date(y,m,1)))}</div>${home ? homeSections() : ''}</div></div>`;
}
await page(
  "/",
  "Suomalainen kalenteri 2027–2030",
  "Kalenterit, Suomen juhlapyhät ja omat suunnitelmat yhdessä paikassa.",
  `<section class="home-heading"><div><p class="eyebrow">SUOMI · 2027–2030</p><h1>Suomen kalenteri, sinun suunnitelmasi.</h1><p>Pyhäpäivät, omat menot ja hyödylliset työkalut samaan arkeen.</p></div>${link("/luo-kalenteri/", art("create") + "<span><strong>Luo oma kalenteri</strong><small>Omat kuvat. Omat tärkeät päivät.</small></span>" + icon("arrow"), "create-cta")}</section>${dashboard(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, true)}${homeDownloads()}<section class="home-blog">${blogCards(['auringon-ajat','pitkan-vapaan-suunnittelu','kalenterin-varmuuskopio'].map(slug=>blog.find(article=>article.slug===slug)),{heading:true})}</section>`,
  "home",
);
await page(
  "/oma-arki/",
  "Oma arki",
  "Koululomat, hakuajat, maksupäivät ja omat merkinnät yhdessä näkymässä. Valitse sinulle tärkeät aiheet.",
  `<div class="personal-workspace">${personalStart()}<aside class="personal-shortcuts" aria-label="Oman arjen työkalut"><p class="eyebrow">JATKA SUUNNITTELUA</p><h2>Seuraava askel</h2>${[['/','calendar','Avaa oma kalenteri','Omat tapahtumat ja päivän suunnitelma.'],['/perhekalenteri/','family','Perheen yhteiset menot','Yhteinen viikko ja muistettavat asiat.'],['/lomasuunnittelija/','vacation','Suunnittele vapaat','Sovita koululomat ja oma loma yhteen.']].map(([url,a,title,description])=>link(url,art(a)+`<span><strong>${title}</strong><small>${description}</small></span>`+icon('arrow'))).join('')}</aside></div>`,
  "personal",
);
await page(
  "/tyokalut/",
  "Kalenterit ja suunnittelutyökalut",
  "Valitse työkalu arkeen, työhön, opiskeluun tai luonnon seuraamiseen.",
  toolDirectory(),
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
  if(base==='pdf-kalenteri'){
    await page('/pdf-kalenteri/','PDF-kalenterit 2027–2030','Tulostettavat kalenterit vuosittain. Valitse 2027, 2028, 2029 tai 2030 ja avaa vuosipohjat tai kuukausikalenterit PDF- ja kuvamuodossa.',printCatalogPage());
    continue;
  }
  if(base==='tyopaivat'){
    await page('/tyopaivat/',`${title} 2027–2030`,description,workOverviewPage());
    continue;
  }
  await page(
    "/" + base + "/",
    `${title} 2027–2030`,
    description,
    (base === "liputuspaivat" ? flagTool() : "") + yearLinks(base) +
      (base === "kalenteri"
        ? `<section class="year-picker-grid">${YEARS.map((y,i) => `<article class="year-picker"><a class="year-picker-cover" href="/kalenteri/${y}/"><img src="/lataukset/kalenteri-${y}-${['suomi','metsä','helsinki','revontulet'][i]}-preview.webp" width="1000" height="707" alt="Vuoden ${y} Suomen kalenterin tulostuspohja" loading="lazy"></a><div><p class="eyebrow">SUOMEN KALENTERI</p><h2>${link("/kalenteri/"+y+"/",y+' '+icon('arrow'))}</h2><p>${leap(y)?366:365} päivää · ${weeksInYear(y)} ISO-viikkoa</p><div class="actions">${link('/kalenteri/'+y+'/','Avaa vuosi','btn')}${link('/pdf-kalenteri/'+y+'/','15 tulostuspohjaa','btn secondary')}</div></div></article>`).join('')}</section>`
        : base === "pdf-kalenteri"
          ? downloadCards(2027, 0)
          : base === "kuukalenteri"
            ? `<div class="astro-sky"><img class="moon-photo" src="/assets/photos/moon-surface.jpg" width="800" height="800" alt="Täysikuun pinta Gregory H. Reveran valokuvassa"><div><p class="eyebrow">TAIVAS SUOMEN AJASSA</p><h2>Kuu, päivä päivältä.</h2><p>Valitse vuosi ja kuukausi. Tutki päivän valaistusta ja tarkkoja vaihehetkiä tai lataa oma kuukalenteri.</p></div></div><div class="moon-directory">${YEARS.map(y=>`<section class="moon-directory-year"><div><p class="eyebrow">KUUN VUOSI</p><h2>${y}</h2>${link('/kuukalenteri/'+y+'/','Vuoden vaiheet '+icon('arrow'),'topic-open')}</div><nav aria-label="Kuukaudet ${y}">${MONTHS.map((mm,i)=>link('/kuukalenteri/'+y+'/'+SLUGS[i]+'/',`<span>${String(i+1).padStart(2,'0')}</span>${cap(mm)}`)).join('')}</nav></section>`).join('')}</div>`
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
                    : base === "viikkokalenteri"
                      ? notice(
                          "ISO-viikko alkaa maanantaina. Vuoden ensimmäiseen viikkoon kuuluu 4. tammikuuta. Vuoden lopussa viikkovuosi voi poiketa kalenterivuodesta.",
                        ) +
                        planSheet("viikkokalenteri","Oma viikkoni",["Tapahtumat ja menot","Tärkeimmät tehtävät","Muistettavaa"])+toolCards(
                          tools.filter((t) =>
                            ["paivasuunnittelija", "perhekalenteri"].includes(
                              t[0],
                            ),
                          ),
                        )
                      : base === "pitkat-viikonloput" ? `<div class="long-weekend-start"><h2>Yksi lomapäivä voi tehdä eron</h2><p>Valitse vuosi ja katso pyhien ympärille muodostuvat jaksot. Oman lomabudjetin ja aattojen vertailu onnistuu lomasuunnittelijassa.</p><div class="cards">${YEARS.map(y=>`<a href="/pitkat-viikonloput/${y}/" class="tool-card">${art('vacation')}<h3>Pitkät viikonloput ${y}</h3><p>Pyhät, viikonloput ja haettavat työpäivät samassa vertailussa.</p><span class="topic-open">Katso vaihtoehdot ${icon('arrow')}</span></a>`).join('')}</div><div class="actions form-actions">${link('/lomasuunnittelija/','Vertaa omalla lomabudjetilla '+icon('arrow'),'btn')}</div></div>` : ""),
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
    calendarDownloads(y,0,downloadCards(y,0))+yearLinks() +
      `<div class="actions content-section">${link("/pdf-kalenteri/" + y + "/", icon("download") + " Lataa vuosikalenteri", "btn")}${link("/lataukset/suomen-juhlapyhat-" + y + ".ics", "Pyhäpäivät omaan kalenteriin", "btn secondary")}</div><div class="year-grid">${MONTHS.map((m, i) => `<article class="month-card"><h2>${link(`/kalenteri/${y}/${SLUGS[i]}/`, cap(m))}${link(`/kalenteri/${y}/${SLUGS[i]}/`, icon("arrow"))}</h2>${calTable(y, i + 1, { mini: true })}</article>`).join("")}</div>`,
    "year",
    { year: y },
  );
  for (const b of ["kuukausikalenteri", "pdf-kalenteri", "kuukalenteri"])
    await page(
      `/${b}/${y}/`,
      `${tools.find((t) => t[0] === b)[1]} ${y}`,
      b === "pdf-kalenteri"
        ? `Vuoden ${y} tulostettavat kalenterit: 15 ulkoasua, PDF ja 600 ppi kuva.`
        : `Valitse kuukausi vuoden ${y} kalenterista.`,
      b==='pdf-kalenteri'?printCatalogPage({year:y}):(      yearLinks(b) +
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
          : "")),
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
  const yearWorkdays=stats.reduce((n,m)=>n+m.workdays,0);
  await page(`/tyopaivat/${y}/`,`Työpäivät ${y} ja työtunnit`,
    `${y}: ${yearWorkdays} työpäivää ma–pe-oletuksella. Tarkista kuukausien tunnit, valitse aattojen käsittely ja vertaa vuosia.`,
    workOverviewPage({year:y,scope:'year'}),'page',{year:y});
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
      calendarDownloads(y,m,downloadCards(y,m))+monthNav("kalenteri", y, m) +
        dashboard(y, m) +
        `<section class="content-section" style="margin-top:30px"><h2>Kuukauden tärkeät päivät</h2>${hm.length ? hTable(hm) : "<p>Tässä kuukaudessa ei ole kalenteriin merkittyjä juhlapäiviä.</p>"}</section><div class="stats">${stat(s.days, "päivää")}${stat(s.workdays, "työpäivää ma–pe")}${stat(s.holidays, "arkipyhää ma–pe")}${stat(pm.length, "Kuun päävaihetta")}</div>${toolCards(tools.filter((t) => ["pdf-kalenteri", "tyopaivat", "kuukalenteri"].includes(t[0])))}`,
      "calendar",
      { year: y, month: m },
    );
    await page(
      `/kuukausikalenteri/${y}/${SLUGS[m - 1]}/`,
      `${cap(MONTHS[m - 1])} ${y} – kuukausikalenteri`,
      desc,
      monthNav("kuukausikalenteri", y, m) + calendarDownloads(y,m,downloadCards(y,m)),
      "page",
      { year: y, month: m },
    );
    await page(
      `/pdf-kalenteri/${y}/${SLUGS[m - 1]}/`,
      `${cap(MONTHS[m - 1])} ${y} PDF-kalenteri`,
      `15 tulostettavaa ${MONTHS[m - 1]}n ${y} kalenteria. Vektori-PDF ja 600 ppi kuva.`,
      printCatalogPage({year:y,month:m}),
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
    await page(`/tyopaivat/${y}/${SLUGS[m - 1]}/`,`${cap(MONTHS[m-1])} ${y} työpäivät ja tunnit`,
      `${cap(MONTHS[m-1])} ${y}: ${s.workdays} työpäivää ja ${s.hours.toLocaleString('fi-FI')} tuntia ma–pe-oletuksella. Valitse oma tuntimäärä ja aattojen käsittely.`,
      workOverviewPage({year:y,month:m,scope:'month'}),'page',{year:y,month:m});
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
  const story=holidayStories[h.slug];
  for(const year of YEARS){
    const event={...holidays(year).find(event=>event.slug===h.slug),url:'https://kalenteri365.fi/juhlapyhat/'+h.slug+'/'};
    for(const [reminder] of REMINDERS){const target=path.join(OUT,eventDownloadPath(h.slug,year,reminder));await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,eventCalendar(event,reminder));}
  }
  await page(
    "/juhlapyhat/" + h.slug + "/",
    h.name,
    `${h.name}: Suomen päivämäärät 2027–2030, viikonpäivät ja päivän merkitys kalenterissasi.`,
    `${image?`<figure class="holiday-cover ${image.width<image.height?'portrait':''}">${photo(image.id,{lazy:false,sizes:"(max-width:700px) 100vw, 1100px"})}<figcaption>${esc(image.caption)}</figcaption></figure>`:""}<div class="two-columns holiday-details">${section(
      h.name,
      `<p class="holiday-lead">${h.description}</p><p>${tag(h)}</p>` +
        (story ? `<div class="holiday-story"><h3>${esc(story.heading)}</h3>${story.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<div class="article-inline-links">${story.links.map(l=>link(l.href,esc(l.label)+' '+icon('arrow'))).join('')}</div><details class="holiday-story-sources"><summary>Taustatiedot ja lähteet</summary><ul>${story.sources.map(s=>`<li>${link(s.url,esc(s.label))}</li>`).join('')}</ul></details></div>` : '') +
        '<h3>Ajankohdat 2027–2030</h3>' +
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
    )}${holidayCalendarPanel(h)}</div>`,
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
    case "verokalenteri":body=taxPage();break;
    case "hakukalenteri":body=admissionsPage();break;
    case "kausimuistutukset":body=seasonalPage();break;
    case "paivamaaralaskuri":
      body = dateTools();
      break;
    case "tyopaivalaskuri":body=workdayTool();break;
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
      body = schoolIntegration()+
        section(
          "Vertaa lomavaihtoehtoja",
          `<form id="vacation-form"><label class="community-check"><input type="checkbox" name="schoolOnly"> Etsi vapaat vain valitun koulun lomajaksoista</label><div class="form-grid"><label>Vuosi<select name="year">${YEARS.map((y) => `<option>${y}</option>`).join("")}</select></label><label>Käytettävissä olevat lomapäivät<input name="budget" type="number" value="4" min="0" max="20" required></label><label>Loman enimmäispituus<input name="length" type="number" value="12" min="3" max="31" required></label><label><span><input name="eves" type="checkbox"> Jouluaatto ja juhannusaatto ovat vapaita</span></label></div><button class="btn" style="margin-top:18px">Etsi parhaat vapaat</button><div id="vacation-result" style="margin-top:20px" aria-live="polite"></div></form>`,
        ) +
        yearLinks("pitkat-viikonloput") +
        notice(
          "Vertailu olettaa ma–pe-työviikon. Se laskee poissa tarvittavat työpäivät, ei vuosilomalain mukaista lomapäivien kulumista. Lauantait ja työehtosopimus voivat muuttaa vuosilomapäivien määrää. Tarvittavat työpäivät listataan erikseen. Päivämäärät eivät ole työnantajan myöntämiä lomia.",
        );
      break;
    case "tyovuorosuunnittelija":body=shiftPlanner();break;
    case "luo-kalenteri":
    case "tyhja-kalenteri":
      body = studioBuilder({blank:base==='tyhja-kalenteri',preview:studioEngine.renderCalendar(studioEngine.starterState(base==='tyhja-kalenteri'?'blank-grid':'month-finland'))});
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
      body = base === "perhekalenteri" ? schoolIntegration()+familyPlanner() : planSheet(base,title,rows);
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
      body = nameDayPanel()+`<section class="service-notes"><h2>Oma nimipäivämuistutus</h2><p>Suomen- ja ruotsinkielistä nimipäiväkalenteria ylläpitää Helsingin yliopiston almanakkatoimisto. Tarkista nimi ja päivämäärä alkuperäisestä kalenterista ennen muistutuksen lisäämistä.</p>${button(art("calendar-add")+" Lisää oma muistutus", "new-event", "btn secondary")}<p>Vuoden 2025 nimilistat ovat voimassa vuoden 2029 loppuun. Vuoden 2030 nimiä ei siirretä kalenteriin ilman vahvistettua aineistoa.</p></section>`;
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
        astroForm(base) + (base==="paivan-pituus"?northernLightTool():"") +
        `<div class="cards" style="margin-top:25px">${CITIES.map((c) => link(`/${base}/${c[0]}/`, `<span class="astro-city-photo">${photo(c[0],{sizes:"(max-width:600px) 45vw, 160px"})}</span><div><h3>${c[1]}</h3><p>Paikalliset ajat ja vuosikalenterit →</p></div>`, "tool-card")).join("")}</div>`;
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
      body = paymentWorkspace(base === "elakkeiden-maksupaivat" ? 'pension' : 'benefit');
      break;
    case "horoskooppi": {
      const daily=edition();body=`<!-- COLLECTION:START --><div class="horoscope-updated" data-collection-date><span class="status-dot"></span><strong>Päivitetty tänään</strong><time datetime="${daily.date}">${fi(parse(daily.date))}</time></div><div class="cards horoscope-grid">${PROFILES.map(([slug,name,range,element])=>{const entry=daily.entries[slug];return link('/horoskooppi/'+slug+'/',`<span class="sign-sculpture">${art('zodiac-'+slug)}</span><div class="sign-copy"><p class="eyebrow">${element} · ${range}</p><h2>${name}</h2><h3 data-daily-title="${slug}">${entry.title}</h3><p data-daily-text="${slug}">${entry.summary}</p><span class="card-open">Lue päivän horoskooppi ${icon('arrow')}</span></div>`,'horoscope-card')}).join('')}</div><p class="small">${daily.method} ${link("/lahteet/#horoskoopit", "Näin päivän tulkinta muodostuu")}</p><!-- COLLECTION:END -->${ascendantForm()}`;break;}
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
    (base === "kuun-nousu-ja-lasku" ? "" : sunStage()+`<section class="panel daylight-overview"><div class="section-heading"><div><p class="eyebrow">VALO VUODEN AIKANA</p><h2 id="daylight-title">Päivän pituus: ${CITIES.find(c=>c[0]===city)?.[1]} ${y}</h2></div></div><div id="daylight-chart">${daylightChart(CITIES.find(c=>c[0]===city),y,Array.from({length:12},(_,i)=>{const r=riseSet(CITIES.find(c=>c[0]===city),date(y,i+1,15),'Sun');return {date:iso(date(y,i+1,15)),rise:r.riseTime,set:r.setTime,duration:r.duration??(r.polar==='up'?1440:0)}}))}</div></section>`) +
    notice(
      "Ajat ovat Suomen paikallista aikaa, kesäaika huomioiden. Horisontti oletetaan esteettömäksi. Viiva tarkoittaa, ettei tapahtumaa ole kyseisenä paikallisena päivänä. Napaseudulla Aurinko tai Kuu voi olla jatkuvasti horisontin ylä- tai alapuolella.",
    )
  );
}
for(const [slug,name,range] of SIGNS){const entry=edition().entries[slug];await page(`/horoskooppi/${slug}/`,`${name} | Päivän horoskooppi`,`${name}: päivän ajatus, ihmissuhteet ja oma aika. Lue tämän päivän pohdinta ja laske nouseva merkkisi.`, `<article class="panel horoscope-daily" data-horoscope-sign="${slug}"><!-- DAILY:START -->${dailyMarkup(entry)}<!-- DAILY:END --><div class="horoscope-day-nav"><button class="btn secondary" data-horoscope-step="-1">← Edellinen päivä</button><button class="btn secondary" data-horoscope-step="1" disabled>Seuraava päivä →</button></div><p class="small horoscope-disclosure">${esc(edition().method)}</p><p class="small"><a href="/lahteet/#horoskoopit">Näin päivän tulkinta muodostuu</a></p></article>${ascendantForm()}<nav class="other-signs" aria-label="Muut horoskooppimerkit">${SIGNS.filter(([id])=>id!==slug).map(([id,n])=>link('/horoskooppi/'+id+'/',art('zodiac-'+id)+'<span>'+n+'</span>')).join('')}</nav>`,'horoscope',{extra:{sign:slug}});}
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
    `<h2>Suomen juhlapäivät</h2><p>Lähteet: ${link(SOURCES.holidays, "Helsingin yliopiston almanakkatoimisto")} ja ${link(SOURCES.flags, "Sisäministeriön liputuspäivät")}. Pääsiäinen lasketaan gregoriaanisella pääsiäisalgoritmilla. Juhannus on 20.–26.6. osuva lauantai ja pyhäinpäivä 31.10.–6.11. osuva lauantai. Pyhäpäivä ei tarkoita jokaisessa työssä automaattisesti työstä vapaata päivää.</p><h2>Viikot ja työpäivät</h2><p>Viikot ovat ISO 8601 -viikkoja, maanantaista sunnuntaihin. Työpäivälaskelma käyttää ma–pe-päiviä ja vähentää niille osuvat yleiset pyhäpäivät. Aattojen vähennys on erillinen valinta. Tuntien oletus on 7,5 tuntia päivässä.</p><h2>Aurinko, Kuu ja vuodenajat</h2><p>Laskentakirjasto: ${link(SOURCES.astro, "Astronomy Engine 2.1.19, Don Cross, MIT-lisenssi")}. Ajat muunnetaan aikavyöhykkeelle Europe/Helsinki. Nousu- ja laskuajat lasketaan paikkakunnan koordinaateille ja esteettömälle horisontille. Maaston, havaitsijan korkeuden ja sään vaikutuksia ei mallinneta.</p><h2>Koulujen lomat</h2><p>${link(SOURCES.school, "Helsingin kaupungin julkaistut työ- ja loma-ajat")} koskevat nimettyjä lukuvuosia ja koulumuotoja. ${link(SOURCES.education, "Opetushallituksen mukaan")} opetuksen järjestäjät päättävät paikallisista ajoista. Vahvistamattomia aikoja ei esitetä kansallisena lomakalenterina.</p><h2>Maksupäivät ja kokeet</h2><p>${link(SOURCES.kela, "Kelan maksupäivät")} ja ${link(SOURCES.exams, "Ylioppilastutkintolautakunnan koepäivät")} tarkistetaan alkuperäisestä lähteestä. Henkilökohtaiset päätökset ja maksajat voivat muuttaa maksupäiviä.</p><h2>Sää</h2><p>Sääennuste: ${link("https://www.met.no/", "MET Norway")}, ${link("https://creativecommons.org/licenses/by/4.0/", "CC BY 4.0")}. Ennuste noudetaan palvelumme välityksellä valitun paikkakunnan keskusta vastaaville koordinaateille. Se on malliennuste, ei sääaseman havainto. Valokuva ei ole sääkamerakuva.</p><h2 id="horoskoopit">Päivän horoskoopit</h2><p>Päivittäinen rajapinta laskee Auringon, Kuun, Merkuriuksen, Venuksen, Marsin, Jupiterin ja Saturnuksen geosentriset sijainnit Astronomy Engine 2.1.19 -kirjastolla. Vertailuhetki on valitun päivän klo 12.00 aikavyöhykkeellä Europe/Helsinki. Kuun vaihe, valaistus ja mahdollinen merkinvaihto koskevat kyseistä päivää. Trooppiset eläinradan merkit eivät tarkoita samannimisten tähdistöjen rajoja.</p><p>Tulkinta on Kalenteri365:n omaa suomenkielistä viihdesisältöä. Se käyttää aurinkomerkkiä ensimmäisen symbolisen huoneen lähtökohtana ja suhteuttaa muut merkit siihen. Syntymäaikaa tai henkilökohtaista syntymäkarttaa ei käytetä päivän tekstissä. Pääkulmat ovat 0°, 60°, 90°, 120° ja 180°; niiden tarkastelurajat ovat vastaavasti 6°, 4°, 5°, 5° ja 6°. Merkin perinteiseen hallitsijaan liittyvä lähin kulma asetetaan etusijalle. Lasketut sijainnit ovat tähtitieteellisiä tietoja, mutta niistä kirjoitettu tulkinta ei ole tieteellinen ennuste. Julkaisu vaihtuu Suomen vuorokauden mukaan, ja seitsemän edellistä päivää voi lukea erikseen.</p><h2>Ulkoasu ja lisenssit</h2><p>Typografia: Lato (SIL Open Font License). Kalenterikuvitus kuuluu sivustoperheen omaan vektorikuvitukseen. Paikkakuntien, yliopistojen, juhlapäivien ja Kuun valokuvien kuvaajat sekä lisenssit on eritelty valokuvasivulla. Sivulla käytetään lisäksi PDF-Lib-, fontkit- ja Sharp-kirjastoja niiden omien lisenssien mukaan.</p><p>Tietojen tarkistuspäivä: 12.11.2026.</p>`,
  ],
  tietosuoja: [LEGAL_PAGES.tietosuoja.title, LEGAL_PAGES.tietosuoja.render()],
  evasteet: [LEGAL_PAGES.evasteet.title, LEGAL_PAGES.evasteet.render()],
  kayttoehdot: [LEGAL_PAGES.kayttoehdot.title, LEGAL_PAGES.kayttoehdot.render()],
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
const infoDescriptions={
  tietoa:'Tutustu Kalenteri365-palveluun, Suomen kalentereihin ja arjen suunnittelutyökaluihin. Omat merkinnät säilyvät käyttämässäsi selaimessa.',
  lahteet:'Kalenteri365:n lähteet Suomen pyhäpäiville, koulujen loma-ajoille, säälle ja tähtitieteellisille laskelmille. Lue myös laskentatapojen rajaukset.',
  tietosuoja:'Lue, miten Kalenteri365 käsittelee selaimeen tallennettuja suunnitelmia, sijaintivalintaa ja teknisiä tietoja sekä miten poistat omat merkintäsi.',
  evasteet:'Mitä Kalenteri365 tallentaa selaimeesi? Lue paikallisesta tallennuksesta, välttämättömistä teknisistä toiminnoista ja tietojen poistamisesta.',
  kayttoehdot:'Kalenteri365:n käyttöehdot: kalentereiden käyttäminen, laskelmien perusteet, tärkeiden päivämäärien tarkistaminen ja omien tietojen varmuuskopiointi.',
  saavutettavuus:'Tietoa Kalenteri365:n näppäimistökäytöstä, kalenterin listanäkymästä ja liikkeen vähentämisestä. Katso käyttövinkit ja kerro saavutettavuusongelmasta.',
  yhteystiedot:'Ota yhteyttä Kalenteri365:n ylläpitoon osoitteessa kalendars365@gmail.com. Lähetä kysymys, palaute tai korjauspyyntö ja liitä mukaan sivun osoite.',
  toimitusperiaatteet:'Näin Kalenteri365 tarkistaa päivämäärät, nimeää paikalliset koulujen loma-ajat ja erottaa laskennalliset arviot vahvistetuista tiedoista.',
};
for (const [s, [t, b]] of Object.entries(info))
  await page(
    "/" + s + "/",
    t,
    LEGAL_PAGES[s]?.description || infoDescriptions[s],
    s === "tietoa" ? aboutPage() : LEGAL_PAGES[s] ? b : `<article class="long-text">${b}</article>`,
  );
await page(
  "/juhlapyhat/eduskuntavaalit/",
  "Eduskuntavaalit 2027",
  "Eduskuntavaalien vaalipäivä 18.4.2027 ja virallinen tietolähde.",
  electionPage(),
);
await gardenDetails(page);
await extraPages({ page, section, table, notice, toolCards, link, art });
await swedishPages(page);
await fs.mkdir(path.join(OUT,"kalenteriin/palvelut"),{recursive:true});
await writeCommunityCalendars(OUT,fs,path);
for(const e of ALL_SERVICE_EVENTS)await fs.writeFile(path.join(OUT,"kalenteriin/palvelut",e.id+".ics"),serviceCalendar(e));
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
  `<article class="long-text"><h2>Kalenteriperheen vektorikuvitus</h2><p>Kalenteri-, työkalu- ja horoskooppikuvitus on sivustoperheen omaa vektorigrafiikkaa. Suomen version kuvituksessa käytetään sinisiä, valkoisia ja luonnon sävyjä. Vuodenaikojen maisemat ovat kuvitusta, eivät valokuvia tietystä paikasta.</p><h2>Paikkakunnat ja yliopistot</h2><p>Kuvat ovat kyseisissä paikoissa otettuja valokuvia. Etusivun paikkakuntavalitsimen jokaisella 25 paikkakunnalla on erillinen päiväkuva ja yökuva. Kuvan vaihto perustuu paikkakunnan koordinaateista laskettuun Auringon korkeuteen: päiväkuva näkyy Auringon ollessa horisontin yläpuolella ja yökuva sen laskettua. Myös kaamos ja yötön yö huomioidaan. Valokuvat ovat arkistokuvia eivätkä reaaliaikaisia sääkameroita. Kuvausajankohdan vuodenaika ja sää voivat poiketa tämänhetkisistä oloista. Kuvaajien nimet, alkuperäiset julkaisut ja lisenssit on lueteltu kuvakohtaisesti. Kuvat säilyttävät alla mainitun lisenssinsä.</p><div class="photo-license-grid">${PHOTO_CREDITS.filter(
    (p) => p.kind,
  )
    .map(
      (p) =>
        `<article class="photo-credit"><img src="${p.src.replace(".webp", "-320.webp")}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy"><h3>${esc(p.name)}</h3><p>${esc(p.author)} · ${link(p.licenseUrl || p.source, p.license)}</p><p>${esc(p.changes)} ${link(p.source, "Alkuperäinen kuva")}</p></article>`,
    )
    .join(
      "",
    )}</div><h2>Kuun valokuva</h2><p>Gregory H. Revera: ${link("https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg", "FullMoon2010")}, ${link("https://creativecommons.org/licenses/by-sa/3.0/", "CC BY-SA 3.0")}. Kuva on pienennetty ja rajattu. Kuukalenterissa sen päällä käytetään laskettua valaistusmaskia. Se ei ole tiettynä tulevana päivänä otettu valokuva.</p><h2>Omat kuvitukset ja karttapohja</h2><p>Sinivalkoiset käyttöliittymäikonit ja kalenterien maisemakuvitukset on toteutettu tämän palvelun vektorigrafiikkana. Suomen karttapohjan ulkoreuna perustuu Natural Earth 1:110m -aineistoon, joka on public domain -aineistoa. <a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earthin käyttöehdot</a>. Sivuston karttakuvitus on yleistetty eikä sovellu navigointiin tai tarkkaan rajojen tulkintaan.</p><h2>Kirjasimet ja ohjelmistot</h2><p>Lato-kirjasin on käytössä SIL Open Font License -lisenssillä. Tähtitieteelliset laskelmat tehdään Astronomy Engine -kirjastolla (MIT). PDF-tiedostot tuotetaan PDF-Lib-kirjastolla (MIT).</p><p>Valokuvien lähteet lisätään tähän luetteloon kuvakohtaisesti. Kuvia ei esitetä ajantasaisina sää- tai havaintokuvina.</p></article>`,
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
await fs.writeFile(path.join(ASSET, "search.json"), JSON.stringify(pages.map(p=>({...p,searchable:true,keywords:searchText.get(p.path)}))));
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
 if(p.path==='/')for(const photo of PHOTO_CREDITS.filter(photo=>['city','city-night','municipality'].includes(photo.kind)))if(!images.some(image=>image.src===photo.src))images.push({src:photo.src,alt:photo.alt});
 if(images.length)imageEntries.push(`<url><loc>https://kalenteri365.fi${esc(p.path)}</loc>${images.map(i=>`<image:image><image:loc>https://kalenteri365.fi${esc(i.src)}</image:loc></image:image>`).join('')}</url>`);
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
  `/*\n  Cache-Control: public, max-age=0, must-revalidate, no-transform\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: SAMEORIGIN\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'\n/assets/runtime/*\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/assets/fonts/*\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/assets/site-runtime.*.css\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/assets/art/*\n  ! Cache-Control\n  Cache-Control: public, max-age=86400\n/assets/art-*\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/assets/photos/*\n  ! Cache-Control\n  Cache-Control: public, max-age=604800\n/assets/social/*\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/assets/*.json\n  ! Cache-Control\n  Cache-Control: public, max-age=60\n/lataukset/*\n  ! Cache-Control\n  Cache-Control: public, max-age=86400\n/kalenteriin/*\n  Content-Type: text/calendar; charset=utf-8\n  Content-Disposition: attachment\n  X-Robots-Tag: noindex\n  ! Cache-Control\n  Cache-Control: public, max-age=86400\n`,
);
const aliases = {
  "pdf-kalenterit": "pdf-kalenteri",
  pyhapaivat: "juhlapyhat",
  "oma-kalenteri": "luo-kalenteri",
  palaute: "yhteystiedot",
};
await fs.writeFile(
  path.join(OUT, "_redirects"),
  blog.map(g=>`/oppaat/${g.slug}/ /blogi/${g.slug}/ 301`).join('\n')+'\n'+Object.entries(aliases)
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
    release: "finland-redesign-20261113",
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
    .update(await fs.readFile(path.join(ROOT, "src/print-art.mjs")))
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
          const orientation=STYLES.find(s=>s[0]===slug)?.[4]?.orientation||"landscape";
          exportIndex.push({ stem, year: y, month: m, style: slug, orientation, width:orientation==="portrait"?4961:7016,height:orientation==="portrait"?7016:4961,dpi:600 });
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
