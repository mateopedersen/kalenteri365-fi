import {educationHub,writeEducationFeeds} from '../src/education-hub.mjs';
import {editorialAnchor as a} from '../src/editorial-links.mjs';
import {schoolPeriods} from '../assets/community-core.mjs';
import {schoolWorkspace} from '../src/community-view.mjs';
import { photo, placeCover } from "../src/photos.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import data from "../data/finland.json" with { type: "json" };
import { CITIES, parse, fi, add, iso } from "../src/calendar.mjs";
import { esc, link, art, icon, section, table } from "../src/ui.mjs";
const sources = Object.fromEntries(data.sources.map((s) => [s.id, s]));
const slug = (value) =>
  value
    .toLocaleLowerCase("fi")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const range = (dates) => dates.map((d) => fi(parse(d))).join("–");
const source = (id) =>
  `<p class="small">${link(sources[id].url, sources[id].publisher + " · " + sources[id].title_fi)} · Tarkistettu ${fi(parse(sources[id].checkedAt || data.checkedAt))}</p>`;
function schoolGuide(name,records){
 const years=records.map(r=>r.academicYear.replace('/','–')).join(', '),first=records[0];
 return `<section class="period-guide panel" data-editorial-skip><h2>${esc(name)}: oman koulun viikko ja lomat</h2><p>Tämän näkymän tiedot koskevat suomenkielistä perusopetusta ja ${records.length===1?'lukuvuotta':'lukuvuosia'} ${years}. ${a(sources[first.sourceId].url,sources[first.sourceId].publisher+' julkaisee alkuperäiset työ- ja loma-ajat')}. Lukion, ammatillisen oppilaitoksen ja yksittäisen koulun poikkeukset on tarkistettava niiden omista tiedotteista.</p><p>Siirrä vahvistettu lomajakso kalenteriin ja suunnittele muu arki sen ympärille. ${a('/perhekalenteri/','Perhekalenterissa')} voit yhdistää eri lasten menot ja kuljetukset. Säännöllisiä oppitunteja varten avaa ${a('/lukujarjestys/','lukujärjestys')}; loma-ajan ICS-tiedosto ei sisällä oppituntien aikataulua.</p></section>`;
}
function universityGuide(name,records){
 const years=records.map(r=>r.academicYear.replace('/','–')).join(', '),first=records[0],hasPeriods=records.some(r=>r.periods.length);
 return `<section class="period-guide panel" data-editorial-skip><h2>${esc(name)}: periodi ja oma opiskelusuunnitelma</h2><p>Näkymä koskee ${records.length===1?'lukuvuotta':'lukuvuosia'} ${years}. ${hasPeriods?'Taulukon opetusperiodi kertoo opetuksen yleisen jakson, ei jokaisen kurssin tenttipäivää.':'Yhteistä periodi- tai lomataulukkoa ei ole vahvistettu tämän näkymän lähteissä.'} Tarkista kurssien palautukset, tentit ja koulutusohjelman poikkeukset ${a(sources[first.sourceId].url,'oppilaitoksen omasta julkaisusta')}.</p><p>${a('/opiskelukalenteri/','Opiskelukalenterissa')} voit jakaa kurssityön omille päiville. ${a('/blogi/opintoperiodit-ja-tentit/','Opintoperiodien ja tenttien opas')} auttaa erottamaan yhteisen opetustauon omasta määräajasta. Kalenteriin vietävä periodi ei muuta oppilaitoksen ilmoittamia kurssiaikoja.</p></section>`;
}
function periodICS(periods, title) {
  const x = (s) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/[,;]/g, (c) => "\\" + c);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kalenteri365//FI",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:" + x(title),
    ...periods.flatMap((p, i) => [
      "BEGIN:VEVENT",
      "UID:" + p.start + "-" + i + "-" + slug(title) + "@kalenteri365.fi",
      "DTSTAMP:20261112T000000Z",
      "DTSTART;VALUE=DATE:" + p.start.replaceAll("-", ""),
      "DTEND;VALUE=DATE:" + iso(add(parse(p.end), 1)).replaceAll("-", ""),
      "SUMMARY:" + x(p.label),
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return (
    lines
      .map((line) => {
        let result = "",
          count = 0;
        for (const c of line) {
          const n = new TextEncoder().encode(c).length;
          if (count + n > 74) {
            result += "\r\n ";
            count = 1;
          }
          result += c;
          count += n;
        }
        return result;
      })
      .join("\r\n") + "\r\n"
  );
}
export async function educationPages({ page, OUT }) {
  await writeEducationFeeds(OUT,fs,path);
  const cities = [...new Set(data.schoolCalendars.map((c) => c.municipality))],
    institutions = [
      ...new Set(data.universityCalendars.map((c) => c.institution)),
    ];
  const row = (r) =>
    `<article class="school-year panel" data-school-year="${r.academicYear}"><p class="eyebrow">LUKUVUOSI ${r.academicYear.replace("/", "–")}</p><h3>${r.municipality}</h3><p class="community-scope">Kunnan suomenkielinen perusopetus</p>${table(["Loma tai koulupäivä", "Ajankohta"], [["Koulu alkaa", fi(parse(r.autumnStart))], ...schoolPeriods(r).map((p) => [p.label, range([p.start, p.end])]), ["Kevätlukukausi alkaa", fi(parse(r.springStart))], ["Lukuvuosi päättyy", fi(parse(r.lastSchoolDay))]])}<p>${esc(r.notes_fi || "")}</p><div class="actions">${link("/lataukset/koululomat-" + slug(r.municipality) + "-" + r.academicYear.replace("/", "-") + ".ics", art("ics") + " Lisää lomakalenteri " + icon("download"), "btn secondary")}</div>${source(r.sourceId)}</article>`;
  function universityCard(name) {
    const records = data.universityCalendars.filter(
      (r) => r.institution === name,
    );
    return link(
      "/yliopistojen-kalenterit/" + slug(name) + "/",
      `<div class="education-photo">${photo(slug(name))}</div><div class="education-card-copy"><h3>${name}</h3><p>${records.map((r) => r.academicYear.replace("/", "–")).join(", ")}</p></div>`,
      "tool-card",
    );
  }
  const cards = cities
    .map((name) => {
      const id = CITIES.find((c) => c[1] === name)?.[0] || slug(name);
      return link(
        "/koulujen-lomat/" + id + "/",
        `<div class="education-photo">${photo(id) || art("school")}</div><div class="education-card-copy"><h3>${name}</h3><p>${data.schoolCalendars.filter(r=>r.municipality===name).map(r=>r.academicYear.replace("/","–")).join(", ")}</p></div>`,
        "tool-card",
      );
    })
    .join("");
  await page(
    "/koulujen-lomat/",
    "Koulujen lomat Suomessa",
    "Alakoulu, yläkoulu, lukio, ammatillinen koulutus ja korkeakoulut. Vertaa julkaistuja loma-aikoja ja opetusperiodeja sekä lisää valitut päivät kalenteriin.",
    educationHub({cityCards:cards}),
  );
  for (const name of cities) {
    const id = CITIES.find((c) => c[1] === name)?.[0] || slug(name),
      records = data.schoolCalendars.filter((c) => c.municipality === name);
    await page(
      "/koulujen-lomat/" + id + "/",
      name + " | Koulujen lomat",
      `${name}: suomenkielisen perusopetuksen vahvistetut syyslomat, talvilomat ja joululomat. Vertaa paikkakuntia ja tallenna kalenteri.`,
      `${placeCover(id, name)}${schoolWorkspace(name)}<div class="cards school-records">${records.map(row).join("")}</div>${schoolGuide(name,records)}`,
    );
    for (const r of records) {
      const file =
        "koululomat-" +
        slug(name) +
        "-" +
        r.academicYear.replace("/", "-") +
        ".ics";
      await fs.writeFile(
        path.join(OUT, "lataukset", file),
        periodICS(schoolPeriods(r), name + " koululomat " + r.academicYear),
      );
      await page(
        "/koulujen-lomat/" + id + "/" + r.academicYear.replace("/", "-") + "/",
        name + " | Koulujen lomat " + r.academicYear.replace("/", "–"),
        "Koulun aloitus, päättäjäiset ja julkaistut loma-ajat: " +
          name +
          " " +
          r.academicYear.replace("/", "–") +
          ".",
        schoolWorkspace(name)+row(r)+schoolGuide(name,[r]),
      );
    }
  }
  await page(
    "/yliopistojen-kalenterit/",
    "Yliopistojen kalenterit",
    "Suomalaisten yliopistojen julkaistut opetusperiodit ja opetustauot lukuvuosina 2026–2030.",
    `<p class="education-intro">${data.copy_fi.universityIntro}</p><div class="cards education-cards">${institutions.map(universityCard).join("")}</div>`,
  );
  for (const name of institutions) {
    const id = slug(name),
      records = data.universityCalendars.filter((r) => r.institution === name);
    const universityRow = (r) =>
      `<section class="panel school-year"><p class="eyebrow">LUKUVUOSI ${r.academicYear.replace("/", "–")}</p><h2>${name}</h2>${r.periods.length ? table(
        ["Opetusperiodi", "Alkaa", "Päättyy"],
        r.periods.map((p) => [
          esc(p.label),
          fi(parse(p.start)),
          fi(parse(p.end)),
        ]),
      ) : '<p class="status-note">Yhteistä loma-aikataulua ei ole julkaistu tarkistetuissa lähteissä.</p>'}${
        r.teachingBreaks.length
          ? section(
              "Julkaistut opetustauot",
              table(
                ["Tauko", "Alkaa", "Päättyy"],
                r.teachingBreaks.map((p) => [
                  esc(p.label),
                  fi(parse(p.start)),
                  fi(parse(p.end)),
                ]),
              ),
            )
          : ""
      }<p class="university-note">${esc(r.notes_fi)}</p><div class="actions">${r.periods.length ? link("/lataukset/yliopisto-" + id + "-" + r.academicYear.replace("/", "-") + ".ics", art("ics") + " Opetusperiodit kalenteriin " + icon("download"), "btn secondary") : link(sources[r.sourceId].url, "Korkeakoulun opiskelijasivut " + icon("external"), "btn secondary")}</div>${source(r.sourceId)}</section>`;
    await page(
      "/yliopistojen-kalenterit/" + id + "/",
      name + (records.some(r=>r.periods.length)?" | Opetusperiodit":" | Opintojen aikataulut"),
      !records.some(r=>r.periods.length)
        ? name + ": yhteistä periodi- tai lomataulukkoa ei ole vahvistettu tämän näkymän lähteissä. Tarkista oman opintosuuntasi aikataulu korkeakoululta."
        : id==='abo-akademi'
          ? name + ": opetusperiodien päivämäärät on laskettu yliopiston julkaisemista ISO-viikkorajoista. Tarkista kurssikohtaiset poikkeukset."
          : name + ": julkaistut opetusperiodit ja opetustauot. Tarkista oman koulutusohjelmasi mahdolliset poikkeukset.",
      `${placeCover(id, name)}<div class="stack">${records.map(universityRow).join("")}</div>${universityGuide(name,records)}`,
    );
    for (const r of records) {
      await fs.writeFile(
        path.join(
          OUT,
          "lataukset",
          "yliopisto-" + id + "-" + r.academicYear.replace("/", "-") + ".ics",
        ),
        periodICS(r.periods, name + " " + r.academicYear),
      );
      await page(
        "/yliopistojen-kalenterit/" +
          id +
          "/" +
          r.academicYear.replace("/", "-") +
          "/",
        name + " | Lukuvuosi " + r.academicYear.replace("/", "–"),
        name + " " + r.academicYear.replace("/", "–") +
          (!r.periods.length
            ? ": yhteistä periodi- tai lomataulukkoa ei ole vahvistettu tämän näkymän lähteissä. Tarkista oman opintosuuntasi aikataulu korkeakoululta."
            : id==='abo-akademi'
              ? ": opetusperiodien päivämäärät yliopiston julkaisemista ISO-viikkorajoista laskettuina. Tarkista oman kurssisi poikkeukset."
              : ": opetusperiodit ja alkuperäinen julkaisu."),
        placeCover(id, name) + universityRow(r) + universityGuide(name,[r]),
      );
    }
  }
}
