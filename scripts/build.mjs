import {vacationPlanner} from '../src/vacation-planner.mjs';
import {relatedTopics} from '../src/related-view.mjs';
import {lunarPhaseList} from '../src/lunar-phase-view.mjs';
import {printCatalogPage} from '../src/print-catalog-view.mjs';
import {workdayTool} from '../src/workday-view.mjs';
import {workOverviewPage} from '../src/work-overview-view.mjs';
import {dateTools} from '../src/date-tools-view.mjs';
import {schoolIntegration,paymentWorkspace,nameDayPanel,writeCommunityCalendars} from '../src/community-view.mjs';
import {personalWorkspace} from '../src/personal-view.mjs';
import {lunarDirectory} from '../src/lunar-directory.mjs';
import {notFoundPage} from '../src/not-found-view.mjs';
import {seasonPage,seasonCredits,seasonImageSchema} from '../src/season-view.mjs';
import {prepareSeasonAssets} from './season-assets.mjs';
import {taxPage,admissionsPage,flagTool,electionPage,seasonalPage,northernLightTool,ALL_SERVICE_EVENTS} from '../src/services-view.mjs';
import {serviceCalendar} from '../assets/finland-services-core.mjs';
import {swedishPages,swedishLayout,swedishCounterpart} from '../src/swedish.mjs';
import {holidayCalendarPanel} from '../src/holiday-actions.mjs';
import {REMINDERS,eventCalendar,eventDownloadPath} from '../assets/calendar-event-core.mjs';
import {studioBuilder} from '../src/studio-view.mjs';
import {upcomingPanel,calendarFilters,calendarChips,planningPanels} from '../src/dashboard.mjs';
import {localDashboard} from '../src/local-dashboard.mjs';
import {daylightChart} from '../src/daylight-chart.mjs';
import {daylengthMetrics,daylengthSummary} from '../src/daylength-metrics.mjs';
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
import { cover, writeSocialManifest } from "./social.mjs";
import {favicons} from "./favicons.mjs";
import {verifyShareIcons} from "./share-icon-assets.mjs";
import { moonSVG } from "../src/lunar.mjs";
import { TOPIC_COPY, FAQ, EDITORIAL_POLICY, METHODOLOGY_NOTE } from "../src/editorial.mjs";
import {linkEditorialParagraphs} from '../src/editorial-links.mjs';
import {periodGuide,cityGuide,periodDescription} from '../src/period-guide.mjs';
import {pageMetadata,brandedTitle,assertUniqueMetadata} from '../src/metadata.mjs';
import {toolGuide} from '../src/tool-guides.mjs';
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
import { makeToolArt } from "./tool-art.mjs";
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
await verifyShareIcons(ROOT);
await fs.cp(path.join(ROOT, "assets"), ASSET, { recursive: true });
await makeArt(path.join(ASSET, "art"));
await makeToolArt(path.join(ASSET, "art"), tools);
await prepareSeasonAssets(ROOT,OUT);
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
for (const p of PHOTO_CREDITS.filter(p => p.kind === 'moon')) {
  for (const width of [320, 640, p.width]) {
    const suffix = width === p.width ? '' : '-' + width;
    await sharp(path.join(ROOT, p.src.slice(1)))
      .resize({width, withoutEnlargement: true})
      .avif({quality: 55, effort: 5})
      .toFile(path.join(ASSET, 'photos', path.basename(p.src, '.webp') + suffix + '.avif'));
  }
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
await fs.copyFile(path.join(ROOT, "src/site-icons.mjs"), path.join(ASSET, "site-icons.mjs"));
await fs.copyFile(path.join(ROOT, "src/seo-title.mjs"), path.join(ASSET, "seo-title.mjs"));
await fs.copyFile(path.join(ROOT, "src/storage-notice-view.mjs"), path.join(ASSET, "storage-notice-view.mjs"));
await fs.copyFile(path.join(ROOT, "src/lunar-header.mjs"), path.join(ASSET, "lunar-header.mjs"));
await fs.copyFile(path.join(ROOT, "src/solar-scene-model.mjs"), path.join(ASSET, "solar-scene-model.mjs"));
await fs.copyFile(path.join(ROOT,"src/date-math.mjs"),path.join(ASSET,"date-math.mjs"));
await fs.copyFile(path.join(ROOT,"src/workday-math.mjs"),path.join(ASSET,"workday-math.mjs"));
await fs.copyFile(path.join(ROOT,"src/vacation-core.mjs"),path.join(ASSET,"vacation-core.mjs"));
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
await fs.copyFile(path.join(ROOT,"src/daylength-metrics.mjs"),path.join(ASSET,"daylength-metrics.mjs"));
await fs.copyFile(path.join(ROOT,"src/family-calendar.mjs"),path.join(ASSET,"family-calendar.mjs"));
await fs.copyFile(path.join(ROOT,"src/personal-planner-core.mjs"),path.join(ASSET,"personal-planner-core.mjs"));
await fs.copyFile(
  path.join(ROOT, "src/solar-day.mjs"),
  path.join(ASSET, "solar-day.mjs"),
);
await sharp(path.join(ROOT, "assets/photos/moon-full.jpg"))
  .extract({ left: 80, top: 64, width: 800, height: 800 })
  .resize(800)
  .jpeg({ quality: 90 })
  .toFile(path.join(ASSET, "photos/moon-surface.jpg"));
await sharp(path.join(ASSET, "photos/moon-surface.jpg")).resize(400).webp({quality:87}).toFile(path.join(ASSET, "photos/moon-heading.webp"));
await sharp(path.join(ASSET, "photos/moon-surface.jpg")).resize(320).webp({quality:90}).toFile(path.join(ASSET, "photos/moon-phase-texture.webp"));
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
const metadataInventory = {title:new Map(),description:new Map()};
async function page(p, title, desc, body, kind = "page", extra = {}) {
  if(extra.locale!=='sv')desc=periodDescription(p,desc);
  const metadata=pageMetadata(p,title,desc,extra),seoTitle=brandedTitle(metadata.title);
  assertUniqueMetadata({title:seoTitle,description:metadata.description},p,metadataInventory);
  const social = await cover(ASSET, p, metadata.title, metadata.description, {kind, ...extra, body});
  if (pages.some((x) => x.path === p)) throw Error("Duplicate page " + p);
  const group=p.split('/')[1],plannerFamily={'viikkokalenteri':'week','perhekalenteri':'family','lukujarjestys':'school','koulukalenteri':'school','tyovuorosuunnittelija':'shift'}[group];
  if(plannerFamily&&p.split('/').filter(Boolean).length===1)body+=plannerCards(plannerFamily);
  if(group==='juhlapyhat'&&p==='/juhlapyhat/')body+=holidayDirectory();
  body+=periodGuide(p)+cityGuide(p);
  const period=p.match(/^\/(kalenteri|kuukausikalenteri|pdf-kalenteri)\/(202[7-9]|2030)\/(?:([a-z]+)\/)?$/);
  if(period&&period[1]!=='pdf-kalenteri')body=`<div class="calendar-workspace">${calendarNavigator(Number(period[2]),SLUGS.indexOf(period[3])+1)}<div class="calendar-content">${body}</div></div>`;
  const richCopy=p.split("/").filter(Boolean).length===1&&!["paivamaaralaskuri","tyopaivalaskuri","tyovuorosuunnittelija","tyopaivat","koulujen-lomat","pdf-kalenteri"].includes(group)?contentGuide(group):"";
  body+=richCopy;
  const practicalGuide=p.split('/').filter(Boolean).length===1?toolGuide(group):'';
  body+=practicalGuide;
  const copy = richCopy||practicalGuide||["paivamaaralaskuri","tyopaivalaskuri","tyovuorosuunnittelija","tyopaivat","koulujen-lomat","pdf-kalenteri"].includes(group)?null:TOPIC_COPY[group];
  if (copy && p.split("/").filter(Boolean).length === 1)
    body += section(
      copy[0],
      copy
        .slice(1)
        .map((t) => `<p>${esc(t)}</p>`)
        .join(""),
      "topic-guide",
    );
  body=linkEditorialParagraphs(body,{path:p,locale:extra.locale||'fi'});
  body=body.replace(/((?:href|src)=")(\/lataukset\/[^"?]+\.(?:pdf|webp))"/g,(_,attribute,url)=>attribute+url+'?v='+downloadVersion+'"');
  let folder = path.join(OUT, p);
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(
    path.join(folder, "index.html"),
    (extra.locale==='sv'?swedishLayout:layout)({ relatedContent: relatedTopics(p), path: p, title, description: desc, body, kind, social, alternate:swedishCounterpart(p), structuredImages:[...PHOTO_CREDITS.filter(image=>(p==='/'&&['city','city-night','municipality'].includes(image.kind))||body.includes(image.src)||body.includes(image.src.replace('.webp','-640.webp'))||body.includes(image.src.replace('.webp','-320.webp'))||(image.id==='moon-full'&&(body.includes('moon-surface.jpg')||body.includes('moon-phase-texture.webp')))).map(image=>({'@type':'ImageObject',contentUrl:'https://kalenteri365.fi'+image.src,caption:image.alt,creditText:image.author+' · '+image.license,license:image.licenseUrl||image.source,acquireLicensePage:image.source})), ...(group==='vuodenajat'?seasonImageSchema:[])], ...extra, seoTitle, seoDescription:metadata.description }),
  );
  searchText.set(p,[...new Set(body.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<(select|nav)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').toLocaleLowerCase('fi').split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>1))].join(' '));
  pages.push({
    path: p,
    title,
    description: metadata.description,
    displayDescription: desc,
    seoTitle,
    group: p.split("/")[1] || "etusivu",
    indexable: p !== "/valokuvat-ja-lisenssit/",
    locale: extra.locale || "fi",
    social: {src:social.src,alt:social.alt,width:social.width,height:social.height,type:social.type,sha256:social.sha256,family:social.family},
  });
}
const notice = (txt) =>
  `<div class="notice" role="note">${icon("info")}<p>${txt}</p></div>`;
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
  `<p class="small">Lue lisää: ${link(SOURCES[key], ({holidays:'Almanakkatoimiston juhlapäivät',flags:'Sisäministeriön liputusohjeet',astro:'Astronomy Enginen laskennan dokumentaatio'})[key]||'Aiheen alkuperäinen julkaisu')} · Tarkistettu 12.11.2026. ${link("/lahteet/", "Laskentatavat ja rajaukset")}</p>`;
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
      return `<article class="download-card"><a class="preview-pad" href="/lataukset/${stem}.pdf" target="_blank" rel="noopener"><img src="/lataukset/${stem}-preview.webp" width="1000" height="${(STYLES.find(v=>v[0]===s)?.[4]?.orientation==='portrait'||s==='muistiinpanot') ? 1414 : 707}" loading="lazy" alt="${esc(n + ", " + (m ? MONTHS[m - 1] + "n " + y : "vuoden " + y) + " kalenteri")}"></a><div class="download-info"><h3>${n} · ${m ? cap(MONTHS[m - 1])+" "+y : y}</h3><p>${d} · A4 · PDF / kuva 600 dpi</p><div class="actions">${link("/lataukset/" + stem + ".pdf", art("pdf") + " PDF " + icon("download"), "btn")}${link("/lataukset/" + stem + ".webp", art("image") + " Kuva " + icon("download"), "btn secondary")}${link(`/luo-kalenteri/?year=${y}&month=${m || 1}`, "Muokkaa", "btn secondary download-edit")}</div></div></article>`;
    })
    .join("")}</div>`;
}
function dashboard(y = 2027, m = 1, home = false) {
  const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Helsinki'}).format(new Date());
  return `<div class="dashboard"><aside class="left-rail" aria-label="Paikalliset tiedot ja juhlapäivät">${localDashboard(cityCards.get('helsinki'))}${home?'':upcomingPanel(today)+calendarFilters()}</aside><div class="dashboard-workspace"><div class="dashboard-top"><div class="calendar-main"><div class="statbar" aria-label="Valitun päivän tiedot"><div>${art("weeknumber")}<div><strong id="stat-week">${week(date(y, m, 1)).number}</strong><span>ISO-viikko</span></div></div><div>${art("dayofyear")}<div><strong id="stat-day">1</strong><span>Vuoden päivä</span></div></div><div>${art("month")}<div><strong id="stat-month">${daysInMonth(y, m)}</strong><span>Päiviä kuukaudessa</span></div></div></div><section class="calendar-panel" data-print-title="${cap(MONTHS[m - 1])} ${y}"><div class="calendar-toolbar"><div class="calendar-title-group"><span class="calendar-eyebrow">Oma kalenteri</span><h2 id="calendar-title">${cap(MONTHS[m - 1])} ${y}</h2></div><div class="calendar-nav" role="group" aria-label="Siirry kalenterissa"><button type="button" class="iconbtn prev" data-action="prev-month" aria-label="Edellinen jakso">${icon("chevron")}</button><button type="button" class="plainbtn" data-action="today">Tänään</button><button type="button" class="iconbtn" data-action="next-month" aria-label="Seuraava jakso">${icon("chevron")}</button></div>${button(icon("plus") + "<span>Lisää tapahtuma</span>", "new-event", "btn")}</div><div class="viewbar"><div class="tabs" role="group" aria-label="Kalenterin näkymä">${[
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
    )}</div><div class="jump"><select id="jump-year" aria-label="Vuosi">${[2026, ...YEARS, 2031].map((yy) => `<option ${yy === y ? "selected" : ""}>${yy}</option>`).join("")}</select><select id="jump-month" aria-label="Kuukausi">${MONTHS.map((mm, i) => `<option value="${i + 1}" ${i + 1 === m ? "selected" : ""}>${cap(mm)}</option>`).join("")}</select></div></div>${calendarChips()}<div id="calendar-view">${calTable(y, m)}</div><noscript><p class="noscript">Kalenteri on luettavissa ilman JavaScriptiä. Omat merkinnät ja näkymän vaihto tarvitsevat JavaScriptin. ${link("/kalenteri/", "Selaa vuosia ja kuukausia →")}</p></noscript><div class="calendar-footer"><div class="legend"><span><i class="dot today"></i> Tänään</span><span><i class="dot selected"></i> Valittu päivä</span><span><i class="dot"></i> Pyhäpäivä</span></div><div class="actions">${button(icon("print") + " Tulosta", "print", "btn secondary")}${link(YEARS.includes(y) ? `/pdf-kalenteri/${y}/${SLUGS[m - 1]}/` : "/pdf-kalenteri/", icon("download") + " Lataa", "btn secondary")}${link(`/luo-kalenteri/?year=${y}&month=${m}`, icon("edit") + " Muokkaa", "btn secondary")}</div></div></section></div>${planningPanels(fi(date(y,m,1)))}</div></div></div>${home ? `<section class="home-support-panels" aria-label="Kalenterin tapahtumat ja näkymät">${upcomingPanel(today, {overviewLink:false})}${calendarFilters()}${nameDayPanel()}</section>${homeSections()}` : ''}`;
}
await page(
  "/",
  "Suomalainen kalenteri 2027–2030",
  "Kalenterit, Suomen juhlapyhät ja omat suunnitelmat yhdessä paikassa.",
  `<section class="home-heading"><div><p class="eyebrow">SUOMI · 2027–2030</p><h1>Suomen pyhät ja omat menot.</h1><p>Tarkista päivän tiedot, suunnittele viikko tai tulosta koko vuoden kalenteri.</p></div>${link("/luo-kalenteri/", art("create") + "<span><strong>Luo oma kalenteri</strong><small>Omat kuvat. Omat tärkeät päivät.</small></span>" + icon("arrow"), "create-cta")}</section>${dashboard(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, true)}${homeDownloads()}<section class="home-blog">${blogCards(['auringon-ajat','pitkan-vapaan-suunnittelu','kalenterin-varmuuskopio'].map(slug=>blog.find(article=>article.slug===slug)),{heading:true})}</section>`,
  "home",
);
await page(
  "/oma-arki/",
  "Oma arki",
  "Suunnittele viikko, järjestä tehtävät ja tallenna päivän muistiinpanot. Seuraa lisäksi oman kuntasi koululomia ja julkaistuja maksupäiviä.",
  personalWorkspace(),
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
            ? lunarDirectory()
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
      `<div class="actions content-section">${link("/pdf-kalenteri/" + y + "/", icon("download") + " Lataa vuosikalenteri", "btn")}${link("/lataukset/suomen-juhlapyhat-" + y + ".ics", "Pyhäpäivät omaan kalenteriin", "btn secondary")}</div><div class="year-grid">${MONTHS.map((m, i) => `<article class="month-card"><h2>${link(`/kalenteri/${y}/${SLUGS[i]}/`, cap(m) + icon("arrow"), "month-card-link")}</h2>${calTable(y, i + 1, { mini: true })}</article>`).join("")}</div>`,
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
          ? lunarCards(y,0)+lunarPhaseList(ps,{title:`Vuoden ${y} Kuun päävaiheet`,id:`lunar-phases-${y}`})
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
      `${cap(MONTHS[m - 1])}n ${y} PDF-kalenteri`,
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
        lunarPhaseList(pm,{title:"Kuukauden päävaiheet",id:`lunar-phases-${y}-${m}`}) +
        `<div class="actions content-section">${link(`/lataukset/kuun-vaiheet-${y}.ics`, art("ics") + " Kuun vaiheet kalenteriin " + icon("download"), "btn")}</div>`+lunarCards(y,m),
      "page",
      { year: y, month: m },
    );
    await page(`/tyopaivat/${y}/${SLUGS[m - 1]}/`,`${cap(MONTHS[m-1])} ${y} työpäivät ja tunnit`,
      `${cap(MONTHS[m-1])} ${y}: ${s.workdays} työpäivää ja ${s.hours.toLocaleString('fi-FI')} tuntia oletuksilla ma–pe ja 7,5 h/päivä. Valitse oma tuntimäärä ja aattojen käsittely.`,
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
        );
      break;
    case "lomasuunnittelija":body=vacationPlanner();break;
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
            `<section class="content-section"><div class="actions content-section">${link(`/lataukset/kuun-vaiheet-${y}.ics`, art("ics")+" Kuun vaiheet kalenteriin", "btn secondary")}</div>${lunarPhaseList(data.phases[y].filter(p=>base==='taysikuu'?p.quarter===2:base==='uusikuu'?p.quarter===0:true),{title:`${y} · ${base==='taysikuu'?'Täysikuun ajankohdat':base==='uusikuu'?'Uusikuun ajankohdat':'Kuun päävaiheet'}`,id:`${base}-${y}`})}</section>`,
        ).join("") + sourceNote("astro");
      break;
    case "auringonnousu-ja-lasku":
    case "kuun-nousu-ja-lasku":
    case "paivan-pituus":
      body =
        astroForm(base) +
        `<div class="cards" style="margin-top:25px">${CITIES.map((c) => link(`/${base}/${c[0]}/`, `<span class="astro-city-photo">${photo(c[0],{sizes:"(max-width:600px) 45vw, 160px"})}</span><div><h3>${c[1]}</h3><p>Paikalliset ajat ja vuosikalenterit →</p></div>`, "tool-card")).join("")}</div>`;
      kind = "astro";
      extra = { body: base === "kuun-nousu-ja-lasku" ? "Moon" : "Sun" };
      break;
    case "vuodenajat":
      body = seasonPage(data.seasons) + sourceNote("astro");
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
  const selectedCity=CITIES.find(c=>c[0]===city),solar=base!=="kuun-nousu-ja-lasku",lengthPage=base==='paivan-pituus';
  const form=`<form id="astro-form" class="solar-settings"><div class="form-grid"><label>Paikkakunta<select name="city">${CITIES.map(c=>`<option value="${c[0]}" ${c[0]===city?'selected':''}>${c[1]}</option>`).join('')}</select></label><label>Päivämäärä<input name="date" type="date" value="${y}-01-01" min="2027-01-01" max="2030-12-31" required></label></div><button type="submit" class="btn" aria-label="Päivitä paikalliset ajat">${icon('refresh')}<span>Päivitä</span></button></form>`;
  const initial=riseSet(selectedCity,date(y,1,1),solar?'Sun':'Moon');
  return `<div class="solar-workspace${solar?'':' lunar-workspace'}${lengthPage?' daylength-workspace':''}">${form}${sunStage({cityName:selectedCity[1],rise:initial.riseTime,noon:time(initial.noon),set:initial.setTime,body:solar?'Sun':'Moon',duration:solar?'Päivän pituus '+Math.floor(initial.duration/60)+' h '+initial.duration%60+' min':'',lengthPage})}<div id="astro-result" class="solar-result" role="status" aria-live="polite"></div></div>`+
    (lengthPage?`<section class="daylength-summary" id="daylength-summary" aria-label="Valitun vuorokauden valo">${daylengthSummary(daylengthMetrics(iso(date(y,1,1)),initial,riseSet(selectedCity,add(date(y,1,1),-1),'Sun'),riseSet(selectedCity,add(date(y,1,1),7),'Sun')))}</section>`:'')+
    (solar?`<section class="panel daylight-overview"><div class="section-heading"><div><p class="eyebrow">VALO VUODEN AIKANA</p><h2 id="daylight-title">Päivän pituus: ${selectedCity[1]} ${y}</h2></div></div><div id="daylight-chart">${daylightChart(selectedCity,y,Array.from({length:12},(_,i)=>{const r=riseSet(selectedCity,date(y,i+1,15),'Sun');return {date:iso(date(y,i+1,15)),rise:r.riseTime,set:r.setTime,duration:r.duration??(r.polar==='up'?1440:0)}}))}</div></section>`:'')+
    (lengthPage?northernLightTool({linked:true,city,day:`${y}-01-01`}):'')+
    notice("Ajat ovat Suomen paikallista aikaa, kesäaika huomioiden. Horisontti oletetaan esteettömäksi. Viiva tarkoittaa, ettei tapahtumaa ole kyseisenä paikallisena päivänä. Napaseudulla Aurinko tai Kuu voi olla jatkuvasti horisontin ylä- tai alapuolella.");
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
    `<h2>Suomen juhlapäivät</h2><p>Lähteet: ${link(SOURCES.holidays, "Helsingin yliopiston almanakkatoimisto")} ja ${link(SOURCES.flags, "Sisäministeriön liputuspäivät")}. Pääsiäinen lasketaan gregoriaanisella pääsiäisalgoritmilla. Juhannus on 20.–26.6. osuva lauantai ja pyhäinpäivä 31.10.–6.11. osuva lauantai. Pyhäpäivä ei tarkoita jokaisessa työssä automaattisesti työstä vapaata päivää.</p><h2>Viikot ja työpäivät</h2><p>Viikot ovat ISO 8601 -viikkoja, maanantaista sunnuntaihin. Työpäivälaskelma käyttää ma–pe-päiviä ja vähentää niille osuvat yleiset pyhäpäivät. Aattojen vähennys on erillinen valinta. Tuntien oletus on 7,5 tuntia päivässä.</p><h2>Aurinko, Kuu ja vuodenajat</h2><p>Laskentakirjasto: ${link(SOURCES.astro, "Astronomy Engine 2.1.19, Don Cross, MIT-lisenssi")}. Ajat muunnetaan aikavyöhykkeelle Europe/Helsinki. Nousu- ja laskuajat lasketaan paikkakunnan koordinaateille ja esteettömälle horisontille. Maaston, havaitsijan korkeuden ja sään vaikutuksia ei mallinneta.</p><h2>Koulujen lomat</h2><p>${link(SOURCES.school, "Helsingin kaupungin julkaistut työ- ja loma-ajat")} koskevat nimettyjä lukuvuosia ja koulumuotoja. ${link(SOURCES.education, "Opetushallituksen mukaan")} opetuksen järjestäjät päättävät paikallisista ajoista. Vahvistamattomia aikoja ei esitetä kansallisena lomakalenterina.</p><h2>Maksupäivät ja kokeet</h2><p>${link(SOURCES.kela, "Kelan maksupäivät")} ja ${link(SOURCES.exams, "Ylioppilastutkintolautakunnan koepäivät")} tarkistetaan alkuperäisestä lähteestä. Henkilökohtaiset päätökset ja maksajat voivat muuttaa maksupäiviä.</p><h2>Sää</h2><p>Sääennuste: ${link("https://api.met.no/weatherapi/locationforecast/2.0/documentation", "MET Norway: Locationforecast")}, ${link("https://creativecommons.org/licenses/by/4.0/", "CC BY 4.0")}. Ennuste noudetaan palvelumme välityksellä valitun paikkakunnan keskusta vastaaville koordinaateille. Se on malliennuste, ei sääaseman havainto. Valokuva ei ole sääkamerakuva.</p><h2 id="horoskoopit">Päivän horoskoopit</h2><p>Päivittäinen rajapinta laskee Auringon, Kuun, Merkuriuksen, Venuksen, Marsin, Jupiterin ja Saturnuksen geosentriset sijainnit Astronomy Engine 2.1.19 -kirjastolla. Vertailuhetki on valitun päivän klo 12.00 aikavyöhykkeellä Europe/Helsinki. Kuun vaihe, valaistus ja mahdollinen merkinvaihto koskevat kyseistä päivää. Trooppiset eläinradan merkit eivät tarkoita samannimisten tähdistöjen rajoja.</p><p>Tulkinta on Kalenteri365:n omaa suomenkielistä viihdesisältöä. Se käyttää aurinkomerkkiä ensimmäisen symbolisen huoneen lähtökohtana ja suhteuttaa muut merkit siihen. Syntymäaikaa tai henkilökohtaista syntymäkarttaa ei käytetä päivän tekstissä. Pääkulmat ovat 0°, 60°, 90°, 120° ja 180°; niiden tarkastelurajat ovat vastaavasti 6°, 4°, 5°, 5° ja 6°. Merkin perinteiseen hallitsijaan liittyvä lähin kulma asetetaan etusijalle. Lasketut sijainnit ovat tähtitieteellisiä tietoja, mutta niistä kirjoitettu tulkinta ei ole tieteellinen ennuste. Julkaisu vaihtuu Suomen vuorokauden mukaan, ja seitsemän edellistä päivää voi lukea erikseen.</p><h2>Ulkoasu ja lisenssit</h2><p>Typografia: Lato (SIL Open Font License). Kalenterikuvitus kuuluu sivustoperheen omaan vektorikuvitukseen. Paikkakuntien, yliopistojen, juhlapäivien ja Kuun valokuvien kuvaajat sekä lisenssit on eritelty valokuvasivulla. Sivulla käytetään lisäksi PDF-Lib-, fontkit- ja Sharp-kirjastoja niiden omien lisenssien mukaan.</p><p>Menetelmäkuvaus päivitetty 13.11.2026. Tämä päiväys ei tarkoita kaikkien ulkoisten aikataulujen tarkistuspäivää; julkaiseva taho ja lähteen ajanjakso on tarkistettava kyseisen tiedon yhteydestä.</p>`,
  ],
  tietosuoja: [LEGAL_PAGES.tietosuoja.title, LEGAL_PAGES.tietosuoja.render()],
  evasteet: [LEGAL_PAGES.evasteet.title, LEGAL_PAGES.evasteet.render()],
  kayttoehdot: [LEGAL_PAGES.kayttoehdot.title, LEGAL_PAGES.kayttoehdot.render()],
  saavutettavuus: [
    "Saavutettavuus",
    "<h2>Suunnittelu kaikille</h2><p>Sivuston kieleksi on merkitty suomi. Navigaatio, lomakkeet ja kalenterin päivät on nimetty. Näppäimistökohdistus näkyy ja liikkeen vähentämisen järjestelmäasetus huomioidaan.</p><h2>Käyttövinkit</h2><p>Etusivun kalenterista voit valita listanäkymän, jos kuukausiruudukko on hankala hahmottaa. Valitse päivän painike tarkastellaksesi tapahtumia. Pienellä näytöllä leveitä tietotaulukoita voi vierittää sivusuunnassa.</p><h2>Havaitut ongelmat</h2><p>Tämä ei ole ulkopuolisen tahon tekemä saavutettavuussertifiointi. Jos et saa työkalua käytettyä, <a href=\"/yhteystiedot/\">ilmoita saavutettavuusongelmasta</a>. Kerro sivun osoite, laite tai selain, käyttämäsi apuväline sekä se, missä vaiheessa käyttö estyi. Älä sisällytä ilmoitukseen omia kalenteritietojasi.</p>",
  ],
  yhteystiedot: [
    "Yhteystiedot ja palaute",
    `<div class="contact-lead">${art('names')}<div><p class="eyebrow">KALENTERIPERHEEN YLLÄPITO</p><h2>Kerro, miten voimme auttaa.</h2><p>Kysymys kalenterista, puuttuva lähde tai havaittu virhe? Lähetä viesti, niin asia voidaan tarkistaa.</p></div></div><section class="contact-address"><span>Sähköposti</span><a href="mailto:kalendars365@gmail.com">kalendars365@gmail.com</a>${link('mailto:kalendars365@gmail.com','Kirjoita viesti '+icon('arrow'),'btn')}</section><div class="two-columns"><section class="panel"><h3>Kun ilmoitat virheestä</h3><p>Liitä viestiin sivun osoite, kyseinen päivämäärä ja tarvittaessa virallinen lähde. Kerro myös, käytätkö puhelinta vai tietokonetta.</p></section><section class="panel"><h3>Omat tiedot pysyvät ominasi</h3><p>Älä lähetä henkilötunnusta, terveystietoja tai koko henkilökohtaista kalenteriasi. Sähköpostiosoitetta ja viestin sisältöä käytetään yhteydenoton käsittelyyn.</p></section></div><p class="small">Viestipainike avaa sähköpostiohjelmasi. ${link('/tietosuoja/','Lue tietosuojasta')}</p>`,
  ],
  toimitusperiaatteet: [
    "Toimitusperiaatteet",
    EDITORIAL_POLICY,
  ],
};
info.lahteet[1]=METHODOLOGY_NOTE+info.lahteet[1];
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
    "page", {customHeader:["tietoa","tietosuoja","evasteet"].includes(s)},
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
  `<article class="long-text"><h2>Kalenteriperheen vektorikuvitus</h2><p>Kalenteri-, työkalu- ja horoskooppikuvitus on sivustoperheen omaa vektorigrafiikkaa. Suomen version kuvituksessa käytetään sinisiä, valkoisia ja luonnon sävyjä. Vuodenaikojen maisemat ovat kuvitusta, eivät valokuvia tietystä paikasta.</p>${seasonCredits()}<h2>Paikkakunnat ja yliopistot</h2><p>Kuvat ovat kyseisissä paikoissa otettuja valokuvia. Etusivun paikkakuntavalitsimen jokaisella 25 paikkakunnalla on erillinen päiväkuva ja yökuva. Kuvan vaihto perustuu paikkakunnan koordinaateista laskettuun Auringon korkeuteen: päiväkuva näkyy Auringon ollessa horisontin yläpuolella ja yökuva sen laskettua. Myös kaamos ja yötön yö huomioidaan. Valokuvat ovat arkistokuvia eivätkä reaaliaikaisia sääkameroita. Kuvausajankohdan vuodenaika ja sää voivat poiketa tämänhetkisistä oloista. Kuvaajien nimet, alkuperäiset julkaisut ja lisenssit on lueteltu kuvakohtaisesti. Kuvat säilyttävät alla mainitun lisenssinsä.</p><div class="photo-license-grid">${PHOTO_CREDITS.filter(
    (p) => p.kind,
  )
    .map(
      (p) =>
        `<article class="photo-credit"><img src="${p.src.replace(".webp", "-320.webp")}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy"><h3>${esc(p.name)}</h3><p>${esc(p.author)} · ${p.licenseUrl && p.licenseUrl !== p.source ? link(p.licenseUrl, esc(p.license)) : esc(p.license)}</p><p>${esc(p.changes)} ${link(p.source, "Alkuperäinen kuva")}</p></article>`,
    )
    .join(
      "",
    )}</div><h2>Kuun valokuvat</h2><p>Vuosikorttien valokuvat ovat NASA:n Apollo 10-, Apollo 13-, Apollo 17- ja Artemis I -lennoilta. Ne ovat historiallisia valokuvia, eivät vuosina 2027–2030 otettuja kuvia. Kuvakohtaiset lähteet ja NASA:n käyttöohjeet löytyvät yllä olevista korteista.</p><p>Gregory H. Revera: ${link("https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg", "FullMoon2010")}, ${link("https://creativecommons.org/licenses/by-sa/3.0/", "CC BY-SA 3.0")}. Kuva on pienennetty ja rajattu. Kuukalenterissa sen päällä käytetään laskettua valaistusmaskia. Se ei ole tiettynä tulevana päivänä otettu valokuva.</p><h2>Omat kuvitukset ja karttapohja</h2><p>Sinivalkoiset käyttöliittymäikonit ja kalenterien maisemakuvitukset on toteutettu tämän palvelun vektorigrafiikkana. Suomen karttapohjan ulkoreuna perustuu Natural Earth 1:110m -aineistoon, joka on public domain -aineistoa. <a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth -aineiston käyttöehdot</a>. Sivuston karttakuvitus on yleistetty eikä sovellu navigointiin tai tarkkaan rajojen tulkintaan.</p><h2>Kalenteripalveluiden tunnukset</h2><p>Google Kalenterin, Applen ja Microsoft Outlookin tunnukset yksilöivät palvelut, joihin tapahtuman voi siirtää. Tunnukset kuuluvat omistajilleen. Niiden käyttö ei tarkoita kumppanuutta tai suositusta. Lähteet: <a href="https://workspace.google.com/products/calendar/">Google Kalenteri</a>, <a href="https://www.apple.com/">Apple</a> ja <a href="https://www.microsoft.com/en-us/microsoft-365/outlook/email-and-calendar-software-microsoft-outlook">Microsoft Outlook</a>.</p><h2>Jakamispalvelujen tunnukset</h2><p>Jakamispainikkeiden logot yksilöivät valitsemasi palvelun. Tunnukset ja tavaramerkit kuuluvat omistajilleen. Käyttö ei tarkoita kumppanuutta tai suositusta. Uusien tunnusten viralliset lähteet: <a href="https://promotion.band.us/newband25">BAND</a>, <a href="https://brand.linkedin.com/in-logo">LinkedIn</a>, <a href="https://www.microsoft.com/en-us/microsoft-365/onenote/digital-note-taking-app">OneNote</a>, <a href="https://www.microsoft.com/en-us/microsoft-365/outlook/email-and-calendar-software-microsoft-outlook">Outlook</a>, <a href="https://im.qq.com/index/">QQ</a>, <a href="https://raindrop.io/">Raindrop.io</a>, <a href="https://slack.com/media-kit">Slack</a>, <a href="https://www.microsoft.com/en-us/microsoft-teams/group-chat-software">Microsoft Teams</a>, <a href="https://www.yahooinc.com/">Yahoo</a>.</p><p>Osa yksivärisistä palvelutunnuksista perustuu <a href="https://simpleicons.org/">Simple Icons</a> -kokoelmaan. Kokoelman <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0-lisenssi</a> ei siirrä tavaramerkkioikeuksia. Sähköpostin, kopioinnin ja muiden yleisten toimintojen kuvat ovat käyttöliittymän symboleja.</p><h2>Kirjasimet ja ohjelmistot</h2><p>Lato-kirjasin on käytössä SIL Open Font License -lisenssillä. Tähtitieteelliset laskelmat tehdään Astronomy Engine -kirjastolla (MIT). PDF-tiedostot tuotetaan PDF-Lib-kirjastolla (MIT).</p><p>Valokuvien lähteet lisätään tähän luetteloon kuvakohtaisesti. Kuvia ei esitetä ajantasaisina sää- tai havaintokuvina.</p></article>`,
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
        `<section><h2>${({etusivu:'Etusivu',sv:'På svenska'})[g] || tools.find((t) => t[0] === g)?.[1] || pages.find((p)=>p.path===`/${g}/`)?.title || cap(g)}</h2>${pages
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
await fs.writeFile(path.join(ASSET, "search.json"), JSON.stringify(pages.map(({social,...p})=>({...p,searchable:true,keywords:searchText.get(p.path)}))));
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
 const html=await fs.readFile(path.join(OUT,p.path,'index.html'),'utf8'),images=p.social?[{src:p.social.src,alt:p.social.alt}]:[];
 for(const m of html.matchAll(/<img\b[^>]*>/g)){const src=m[0].match(/src="([^"?]+)(?:[^"\s]*)?"/),alt=m[0].match(/alt="([^"]+)"/);if(src&&alt&&(/\/assets\/(?:photos|seasons)\//.test(src[1])||/\/lataukset\//.test(src[1]))){const original=PHOTO_CREDITS.find(p=>[p.src,p.src.replace('.webp','-320.webp'),p.src.replace('.webp','-640.webp')].includes(src[1]))?.src||(src[1].startsWith('/assets/seasons/')?src[1].replace(/-(360|720)\.(webp|avif)$/,'-1200.webp'):src[1].replace('-preview.webp','.webp'));const current=original.startsWith('/lataukset/')?original+'?v='+downloadVersion:original;if(!images.some(x=>x.src===current))images.push({src:current,alt:alt[1]});}}
 if(p.path==='/')for(const photo of PHOTO_CREDITS.filter(photo=>['city','city-night','municipality'].includes(photo.kind)))if(!images.some(image=>image.src===photo.src))images.push({src:photo.src,alt:photo.alt});
 if(images.length)imageEntries.push(`<url><loc>https://kalenteri365.fi${esc(p.path)}</loc>${images.map(i=>`<image:image><image:loc>https://kalenteri365.fi${esc(i.src)}</image:loc></image:image>`).join('')}</url>`);
}
await fs.writeFile(path.join(OUT,'sitemap-images.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+imageEntries.join('')+'</urlset>');
await fs.writeFile(
  path.join(OUT, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: https://kalenteri365.fi/sitemap.xml\nSitemap: https://kalenteri365.fi/sitemap-images.xml\n",
);
const notFoundSocial=await cover(ASSET,"/404/","Sivua ei löytynyt","Etsimääsi osoitetta ei löytynyt.",{kind:"not-found"});
await fs.writeFile(
  path.join(OUT, "404.html"),
  layout({
    path: "/404/",
    title: "Sivua ei löytynyt",
    description: "Etsimääsi osoitetta ei löytynyt.",
    kind: 'not-found',
    social: notFoundSocial,
    body: notFoundPage(),
  }),
);
await writeSocialManifest(ASSET);
await fs.writeFile(
  path.join(OUT, "_headers"),
  `/*\n  Cache-Control: public, max-age=0, must-revalidate, no-transform\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: SAMEORIGIN\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'\n/favicon.ico\n  Content-Type: image/x-icon\n/assets/icon-*.png\n  Content-Type: image/png\n/assets/icon.svg\n  Content-Type: image/svg+xml\n/site.webmanifest\n  Content-Type: application/manifest+json; charset=utf-8\n/assets/runtime/*\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/assets/fonts/*\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/assets/site-runtime.*.css\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/assets/art/*\n  ! Cache-Control\n  Cache-Control: public, max-age=86400\n/assets/art-*\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/assets/photos/*\n  ! Cache-Control\n  Cache-Control: public, max-age=604800\n/assets/social/*\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/assets/*.json\n  ! Cache-Control\n  Cache-Control: public, max-age=60\n/lataukset/*\n  ! Cache-Control\n  Cache-Control: public, max-age=86400\n/kalenteriin/*\n  Content-Type: text/calendar; charset=utf-8\n  Content-Disposition: attachment\n  X-Robots-Tag: noindex\n  ! Cache-Control\n  Cache-Control: public, max-age=86400\n`,
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
await favicons(ASSET);
await sharp(path.join(OUT,pages.find(p=>p.path==='/').social.src)).png().toFile(path.join(ASSET,'og.png'));
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
