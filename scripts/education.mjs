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
  `<p class="small">${link(sources[id].url, sources[id].publisher + " · " + sources[id].title_fi)} · Tarkistettu ${fi(parse(data.checkedAt))}</p>`;
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
  const cities = [...new Set(data.schoolCalendars.map((c) => c.municipality))],
    institutions = [
      ...new Set(data.universityCalendars.map((c) => c.institution)),
    ];
  const schoolPeriods = (r) =>
    [
      ["Syysloma", r.autumnBreak],
      ["Joululoma", r.christmasBreak],
      ["Talviloma", r.winterBreak],
    ]
      .filter(([, d]) => d?.length === 2)
      .map(([label, d]) => ({ label, start: d[0], end: d[1] }));
  const row = (r) =>
    `<article class="school-year panel" data-school-year="${r.academicYear}"><p class="eyebrow">LUKUVUOSI ${r.academicYear.replace("/", "–")}</p><h3>${r.municipality}</h3>${table(["Loma tai koulupäivä", "Ajankohta"], [["Koulu alkaa", fi(parse(r.autumnStart))], ...schoolPeriods(r).map((p) => [p.label, range([p.start, p.end])]), ["Kevätlukukausi alkaa", fi(parse(r.springStart))], ["Lukuvuosi päättyy", fi(parse(r.lastSchoolDay))]])}<p>${esc(r.notes_fi || "")}</p><div class="actions">${link("/lataukset/koululomat-" + slug(r.municipality) + "-" + r.academicYear.replace("/", "-") + ".ics", art("ics") + " Lisää lomakalenteri " + icon("download"), "btn secondary")}</div>${source(r.sourceId)}</article>`;
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
        `<div class="education-photo">${photo(id) || art("school")}</div><div class="education-card-copy"><h3>${name}</h3><p>Julkaistut loma-ajat 2026–2028</p></div>`,
        "tool-card",
      );
    })
    .join("");
  await page(
    "/koulujen-lomat/",
    "Koulujen lomat Suomessa",
    "Paikkakuntakohtaiset syys-, joulu- ja talvilomat sekä lukuvuoden aloitus ja päättyminen.",
    `<div class="education-intro"><p>${data.copy_fi.schoolIntro}</p><div class="actions">${link("#koululomat", "Koulujen lomat " + icon("chevron"), "btn")}${link("/yliopistojen-kalenterit/", "Yliopistojen kalenterit " + icon("arrow"), "btn secondary")}</div></div><section id="koululomat"><h2>Valitse paikkakunta</h2><div class="cards education-cards">${cards}</div></section><section class="panel topic-guide"><h2>Jokaisella koululla on oma aikataulunsa</h2><p>Alla olevat tiedot koskevat nimettyjen kuntien suomenkielistä perusopetusta. Lukioiden, esiopetuksen ja ammatillisen koulutuksen ajat voivat poiketa. Myöhempien lukuvuosien tietoja ei johdeta aiemmista vuosista.</p><p>Tarkista koulukohtaiset poikkeukset opetuksen järjestäjältä. Yliopistojen opetusperiodit ja tenttiviikot löytyvät omasta korkeakoulukalenteristaan.</p></section><section class="content-section"><h2>Yliopistojen opetusperiodit</h2><p>${data.copy_fi.universityIntro}</p><div class="cards education-cards">${institutions.map(universityCard).join("")}</div>${link("/yliopistojen-kalenterit/", "Vertaa korkeakouluja " + icon("arrow"), "btn")}</section>`,
  );
  for (const name of cities) {
    const id = CITIES.find((c) => c[1] === name)?.[0] || slug(name),
      records = data.schoolCalendars.filter((c) => c.municipality === name);
    await page(
      "/koulujen-lomat/" + id + "/",
      name + " | Koulujen lomat",
      {
        Helsinki: "Helsingin",
        Espoo: "Espoon",
        Vantaa: "Vantaan",
        Tampere: "Tampereen",
        Oulu: "Oulun",
        Tuusula: "Tuusulan",
      }[name] +
        " julkaistut koulujen loma-ajat lukuvuosina 2026–2027 ja 2027–2028.",
      `${placeCover(id, name)}<div class="cards school-records">${records.map(row).join("")}</div>`,
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
        row(r),
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
      name + " | Opetusperiodit",
      name +
        ": julkaistut opetusperiodit ja opetustauot. Tarkista oman koulutusohjelmasi mahdolliset poikkeukset.",
      `${placeCover(id, name)}<div class="stack">${records.map(universityRow).join("")}</div>`,
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
        name +
          " " +
          r.academicYear.replace("/", "–") +
          ": opetusperiodit ja alkuperäinen julkaisu.",
        placeCover(id, name) + universityRow(r),
      );
    }
  }
}
