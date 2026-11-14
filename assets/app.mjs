import {birthdayMeta} from './birthday-core.mjs';
import {namedayMeta} from './namedays-core.mjs';
import {sowingWindow} from './garden-model.mjs';
import {initStorageNotice} from './storage-notice.mjs';
import {occurs} from './personal-planner-core.mjs';
import {CALENDAR_LAYERS, calendarFilterIds, upcomingItems} from './dashboard.mjs';
import {cityPhotoState, cityPhotoPeriod, cityPhotoVariant} from './city-light.mjs';
import { dayEvents } from "./solar-day.mjs";
import { moonSVG } from "./lunar.mjs";
import { homeView, cleanHomeURL, loadCalendarState } from "./home-view.mjs";
import {
  MONTHS,
  SLUGS,
  DAYS,
  YEARS,
  CITIES,
  date,
  parse,
  iso,
  add,
  day,
  fi,
  week,
  weekStart,
  daysInMonth,
  holidays,
  leap,
  cap,
} from "./calendar.mjs";
import { calTable, esc, icon, table, link } from "./ui.mjs";
const $ = (s, root = document) => root.querySelector(s),
  $$ = (s, root = document) => [...root.querySelectorAll(s)];
const config = JSON.parse($("#page-config").textContent),
  KEY = "kalenteri365-fi-v1",
  today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
let state;
try{state=loadCalendarState(localStorage,CITIES);}catch{state=loadCalendarState({getItem:()=>null},CITIES);}
let selected = today,
  y = config.year || 2027,
  m = config.month || 1,
  view = "month",
  filters = new Set(calendarFilterIds(state.plans?.calendarFilters));
let toastTimer;
function toast(s) {
  $("#toast").hidden = false;
  $("#toast").textContent = s;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    $("#toast").classList.remove("visible");
    $("#toast").hidden = true;
  }, 4000);
}
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    toast(
      "Tallennus ei onnistunut. Tarkista selaimen tallennustila ja ota varmuuskopio.",
    );
    return false;
  }
}
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const eventAt = (ds) => state.events.filter((e) => occurs(e, ds));
function listHTML(events, ds) {
  return events
    .map(
      (e) =>
        `<button type="button" class="agenda-item" data-edit-event="${esc(e.id)}">${e.time ? esc(e.time) + " · " : ""}${esc(e.title)}${e.repeat && e.repeat !== "none" ? " ↻" : ""}</button>`,
    )
    .join("");
}
function renderDay() {
  if (!$("#selected-date")) return;
  $("#selected-date").textContent =
    cap(DAYS[day(parse(selected))]) + ", " + fi(parse(selected));
  const items = eventAt(selected),
    hs = holidays(parse(selected).getUTCFullYear()).filter(
      (h) => h.date === selected,
    );
  $("#day-events").innerHTML =
    hs
      .map(
        (h) => `<li>${link("/juhlapyhat/" + h.slug + "/", esc(h.name))}</li>`,
      )
      .join("") +
    (items.length
      ? items
          .map(
            (e) =>
              `<li><button type="button" data-edit-event="${esc(e.id)}">${e.time ? esc(e.time) + " · " : ""}${esc(e.title)}</button></li>`,
          )
          .join("")
      : hs.length
        ? ""
        : '<li class="empty">Tämä päivä on vielä avoin suunnitelmillesi.</li>');
  $("#day-notes").value = state.notes[selected] || "";
  if ($("#notes-status")) $("#notes-status").textContent = state.notes[selected] ? "Tallennettu tähän selaimeen" : "Tallentuu kirjoittaessasi";
  $("#stat-week").textContent = week(parse(selected)).number;
  $("#stat-day").textContent =
    Math.floor(
      (parse(selected) - date(parse(selected).getUTCFullYear(), 1, 1)) /
        86400000,
    ) + 1;
  $("#stat-month").textContent = daysInMonth(y, m);
  renderTasks();
}
function saveNotes() {
  if ($("#day-notes")) {
    state.notes[selected] = $("#day-notes").value;
    const saved = persist();
    if ($("#notes-status")) $("#notes-status").textContent = saved ? "Tallennettu tähän selaimeen" : "Tallennus ei onnistunut";
  }
}
function selectDate(ds) {
  saveNotes();
  selected = ds;
  renderCalendar();
  renderDay();
}
function renderCalendar() {
  if (!$("#calendar-view")) return;
  const root = $("#calendar-view");
  root.dataset.calendarMode = view;
  $("#calendar-title").textContent =
    view === "day"
      ? fi(parse(selected))
      : view === "week"
        ? `Viikko ${week(parse(selected)).number} · ${week(parse(selected)).year}`
        : view === "year"
          ? String(y)
          : cap(MONTHS[m - 1]) + " " + y;
  $("#jump-year").value = y;
  $("#jump-month").value = m;
  const foot = $(".calendar-footer");
  if (foot) {
    const dl = $('a[href^="/pdf-kalenteri/"]', foot),
      ed = $('a[href^="/luo-kalenteri/"]', foot);
    if (dl) {
      dl.hidden = !YEARS.includes(y);
      dl.href = "/pdf-kalenteri/" + y + "/" + SLUGS[m - 1] + "/";
    }
    if (ed) {
      ed.hidden = !YEARS.includes(y);
      ed.href = "/luo-kalenteri/?year=" + y + "&month=" + m;
    }
  }
  $$(".subyears a").forEach((a) =>
    a.classList.toggle("active", Number(a.textContent) === y),
  );
  $$("[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === view);
    b.setAttribute("aria-pressed", String(b.dataset.view === view));
  });
  if (view === "month") {
    root.innerHTML = calTable(y, m);
    $$("td[data-date]", root).forEach((td) => {
      let ds = td.dataset.date;
      td.classList.toggle("is-today", ds === today);
      td.classList.toggle("is-selected", ds === selected);
      const dayButton = td.querySelector("[data-select-date]");
      dayButton.setAttribute("aria-pressed", String(ds === selected));
      if (ds === today) dayButton.setAttribute("aria-current", "date");
      $$(".cal-event", td).forEach((a) => {
        let typ =
          a.classList.contains("holiday") || a.classList.contains("eve")
            ? "holiday"
            : "flag";
        a.hidden = !filters.has(typ);
      });
      for (const e of eventAt(ds).filter((e) =>
        filters.has(e.category || "personal"),
      )) {
        let b = document.createElement("button");
        b.type = "button";
        b.className = "cal-event personal " + (e.category || "personal");
        b.dataset.editEvent = e.id;
        b.textContent = (e.time ? e.time + " " : "") + e.title;
        td.append(b);
      }
      const entries = Array.from(td.querySelectorAll(".cal-event")).filter(entry => !entry.hidden);
      if (entries.length) {
        const marker = document.createElement("span");
        marker.className = "calendar-cell-count";
        marker.setAttribute("aria-hidden", "true");
        marker.textContent = entries.length;
        td.append(marker);
        dayButton.setAttribute("aria-label", dayButton.getAttribute("aria-label") + ", " + entries.length + (entries.length === 1 ? " merkintä" : " merkintää"));
      }
    });
    const monthPrefix = String(y) + "-" + String(m).padStart(2, "0") + "-";
    const groups = Array.from(root.querySelectorAll("td[data-date]")).filter(td => td.dataset.date.startsWith(monthPrefix)).map(td => ({
      date: td.dataset.date,
      entries: Array.from(td.querySelectorAll(".cal-event")).filter(entry => !entry.hidden),
    })).filter(group => group.entries.length);
    if (groups.length) {
      const total = groups.reduce((sum, group) => sum + group.entries.length, 0);
      root.insertAdjacentHTML("beforeend", `<details class="calendar-month-agenda" open><summary>${icon("calendar")}<span>Kuukauden merkinnät</span><span class="calendar-agenda-total">${total}</span>${icon("chevron")}</summary><ul>${groups.map(group => `<li><button type="button" class="calendar-agenda-date" data-select-date="${group.date}" aria-label="Valitse ${esc(fi(parse(group.date)))}" aria-pressed="${group.date === selected}">${Number(group.date.slice(-2))}<small>${m}.</small></button><div>${group.entries.map(entry => entry.outerHTML).join("")}</div></li>`).join("")}</ul></details>`);
    }
  } else if (view === "year") {
    root.innerHTML = `<div class="year-grid">${MONTHS.map((mm, i) => `<article class="month-card"><h3><button class="textbtn" data-goto-month="${i + 1}">${cap(mm)}</button></h3>${calTable(y, i + 1, { mini: true })}</article>`).join("")}</div>`;
    $$(".mini .dot", root).forEach(dot => { dot.hidden = !filters.has("holiday"); });
  } else {
    let ds =
      view === "week"
        ? Array.from({ length: 7 }, (_, i) =>
            iso(add(parse(selected), -day(parse(selected)) + i)),
          )
        : view === "day"
          ? [selected]
          : Array.from({ length: daysInMonth(y, m) }, (_, i) =>
              iso(date(y, m, i + 1)),
            );
    let blocks = ds.map((s) => {
      let hs = holidays(parse(s).getUTCFullYear()).filter(
          (h) =>
            h.date === s &&
            filters.has(
              ["holiday", "eve"].includes(h.type) ? "holiday" : "flag",
            ),
        ),
        es = eventAt(s).filter((e) => filters.has(e.category || "personal"));
      return `<article class="${view === "week" ? "week-day" : "day-agenda-item"}"><strong><button class="textbtn" data-select-date="${s}">${cap(DAYS[day(parse(s))])} ${fi(parse(s))}</button></strong>${hs.map((h) => `<div class="agenda-item">${link("/juhlapyhat/" + h.slug + "/", esc(h.name))}</div>`).join("")}${listHTML(es, s)}${!es.length && !hs.length ? '<p class="small">Ei merkintöjä</p>' : ""}</article>`;
    });
    root.innerHTML = `<div class="${view === "week" ? "week-agenda" : "day-agenda"}">${blocks.join("")}</div>`;
  }
  if (config.kind === "home") {
    state.homeCalendar = { year: y, month: m, date: selected, view };
    persist();
    const clean = cleanHomeURL(location.href);
    if (clean !== location.pathname + location.search + location.hash)
      history.replaceState(null, "", clean);
  } else if (config.kind === "calendar") {
    const u = new URL(location.href);
    u.searchParams.set("date", selected);
    u.searchParams.set("view", view);
    history.replaceState(null, "", u);
  }
  renderDay();
  updateCalendarFilters();
}
function renderTasks() {
  if (!$("#tasks")) return;
  const tasks = state.tasks.filter(t => t.date === selected);
  if ($("#task-count")) $("#task-count").textContent = tasks.filter(t => t.done).length + "/" + tasks.length;
  if ($("#task-empty")) $("#task-empty").hidden = tasks.length > 0;
  $("#tasks").innerHTML = tasks
    .map(
      (t) =>
        `<li><label><input type="checkbox" data-task-toggle="${esc(t.id)}" ${t.done ? "checked" : ""}><span>${esc(t.title)}</span></label><button type="button" data-task-remove="${esc(t.id)}" aria-label="Poista tehtävä ${esc(t.title)}">×</button></li>`,
    )
    .join("");
}
function openEvent(id = null) {
  const form = $("#event-form"),
    e = id ? state.events.find((e) => e.id === id) : null;
  form.reset();
  form.elements.id.value = e?.id || "";
  form.elements.title.value = e?.title || "";
  form.elements.date.value = e?.date || selected;
  form.elements.time.value = e?.time || "";
  form.elements.category.value = e?.category || "personal";
  form.elements.repeat.value = e?.repeat || config.defaultRepeat || "none";
  form.elements.note.value = e?.note || "";
  $('[data-action="delete-event"]').hidden = !e;
  $("#event-dialog").showModal();
  setTimeout(() => form.elements.title.focus(), 0);
}
$("#event-form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const fd = new FormData(ev.currentTarget),
    id = fd.get("id") || crypto.randomUUID(),
    obj = {
      id,
      title: fd.get("title").trim(),
      date: fd.get("date"),
      time: fd.get("time"),
      category: fd.get("category"),
      repeat: fd.get("repeat"),
      note: fd.get("note"),
    };
  if (!obj.title) return;
  const i = state.events.findIndex((e) => e.id === id);
  if (i >= 0) state.events[i] = { ...state.events[i], ...obj };
  else state.events.push(obj);
  persist();
  $("#event-dialog").close();
  renderCalendar();
  renderBirthdays();
  toast("Tapahtuma tallennettu.");
});
function eventICS() {
  const escICS = (s) =>
    String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/[,;]/g, (c) => "\\" + c);
  let lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kalenteri365.fi//Personal//FI",
    "CALSCALE:GREGORIAN",
  ];
  for (let e of state.events) {
    lines.push(
      "BEGIN:VEVENT",
      "UID:" + e.id.replace(/[\r\n]/g, "") + "@kalenteri365.fi",
      "DTSTAMP:" +
        new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d+Z/, "Z"),
    );
    lines.push(
      e.time
        ? "DTSTART;TZID=Europe/Helsinki:" +
            e.date.replaceAll("-", "") +
            "T" +
            e.time.replace(":", "") +
            "00"
        : "DTSTART;VALUE=DATE:" + e.date.replaceAll("-", ""),
    );
    if (!e.time)
      lines.push(
        "DTEND;VALUE=DATE:" + iso(add(parse(e.date), 1)).replaceAll("-", ""),
      );
    lines.push(
      "SUMMARY:" + escICS(e.title),
      "DESCRIPTION:" + escICS(e.note),
      "CATEGORIES:" + escICS(e.category),
    );
    if (e.repeat && e.repeat !== "none")
      lines.push(
        "RRULE:FREQ=" +
          e.repeat.toUpperCase() +
          (e.interval ? " ;INTERVAL=" + e.interval : "").replace(" ;", ";") +
          (e.until ? ";UNTIL=" + e.until.replaceAll("-", "") + "T235959Z" : ""),
      );
    if (e.exdates?.length)
      lines.push(
        "EXDATE;VALUE=DATE:" +
          e.exdates.map((x) => x.replaceAll("-", "")).join(","),
      );
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  const fold = (line) => {
    let o = "",
      n = 0;
    for (let c of line) {
      let b = new TextEncoder().encode(c).length;
      if (n + b > 74) {
        o += "\r\n ";
        n = 1;
      }
      o += c;
      n += b;
    }
    return o;
  };
  return lines.map(fold).join("\r\n") + "\r\n";
}
async function importICS(file) {
  let raw = await file.text();
  if (raw.length > 5e6)
    throw Error("Tiedosto on liian suuri. Enimmäiskoko on 5 Mt.");
  let blocks =
    raw.replace(/\r?\n[ \t]/g, "").match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ||
    [];
  if (!blocks.length) throw Error("Tiedostossa ei ole luettavia tapahtumia.");
  let count = 0,
    skipped = 0;
  const unesc = (s) =>
    (s || "").replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
  for (let b of blocks) {
    let fields = {};
    for (let line of b.split(/\r?\n/)) {
      let i = line.indexOf(":");
      if (i < 0) continue;
      let k = line.slice(0, i),
        v = line.slice(i + 1),
        name = k.split(";")[0];
      fields[name] = { key: k, value: v };
    }
    let dt = fields.DTSTART?.value;
    if (!dt || !/^\d{8}(T\d{6}Z?)?$/.test(dt)) {
      skipped++;
      continue;
    }
    let ds = dt.slice(0, 4) + "-" + dt.slice(4, 6) + "-" + dt.slice(6, 8),
      tm = dt.includes("T") ? dt.slice(9, 11) + ":" + dt.slice(11, 13) : "";
    if (tm && dt.endsWith("Z")) {
      let utc = new Date(ds + "T" + tm + ":" + dt.slice(13, 15) + "Z");
      ds = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Helsinki",
      }).format(utc);
      tm = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Helsinki",
        hour: "2-digit",
        minute: "2-digit",
      }).format(utc);
    } else if (
      tm &&
      fields.DTSTART.key.includes("TZID=") &&
      !fields.DTSTART.key.includes("TZID=Europe/Helsinki")
    ) {
      skipped++;
      continue;
    }
    let rule = fields.RRULE?.value || "",
      opts = Object.fromEntries(
        rule
          .split(";")
          .filter(Boolean)
          .map((x) => x.split("=")),
      );
    if (
      rule &&
      (Object.keys(opts).some(
        (k) => !["FREQ", "INTERVAL", "UNTIL"].includes(k),
      ) ||
        !["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(opts.FREQ))
    ) {
      skipped++;
      continue;
    }
    let uid = fields.UID?.value || crypto.randomUUID(),
      id = uid.endsWith("@kalenteri365.fi")
        ? uid.slice(0, -"@kalenteri365.fi".length)
        : "ics-" + uid;
    if (state.events.some((e) => e.id === id)) continue;
    state.events.push({
      id,
      date: ds,
      time: tm,
      title: unesc(fields.SUMMARY?.value) || "Tuotu tapahtuma",
      note: unesc(fields.DESCRIPTION?.value),
      category: ["personal", "work", "family", "school"].includes(
        fields.CATEGORIES?.value,
      )
        ? fields.CATEGORIES.value
        : "personal",
      repeat: opts.FREQ?.toLowerCase() || "none",
      interval: Math.max(1, Number(opts.INTERVAL) || 1),
      until: opts.UNTIL
        ? opts.UNTIL.slice(0, 4) +
          "-" +
          opts.UNTIL.slice(4, 6) +
          "-" +
          opts.UNTIL.slice(6, 8)
        : null,
      exdates:
        fields.EXDATE?.value
          .split(",")
          .map(
            (v) => v.slice(0, 4) + "-" + v.slice(4, 6) + "-" + v.slice(6, 8),
          ) || [],
    });
    count++;
  }
  persist();
  renderCalendar();
  toast(
    `Tuotu ${count} ${count === 1 ? "tapahtuma" : "tapahtumaa"}.${skipped ? " " + skipped + (skipped === 1 ? " tapahtuma" : " tapahtumaa") + " ohitettiin: tukematon toistosääntö tai aikavyöhyke." : ""}`,
  );
}
document.addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action,
    edit = e.target.closest("[data-edit-event]"),
    ds = e.target.closest("[data-select-date]")?.dataset.selectDate,
    gm = e.target.closest("[data-goto-month]")?.dataset.gotoMonth;
  if (edit) {
    openEvent(edit.dataset.editEvent);
    return;
  }
  if (ds) {
    if ($("#calendar-view")) selectDate(ds);
    else if (!$("#editor-preview"))
      location.href =
        "/?year=" +
        ds.slice(0, 4) +
        "&month=" +
        Number(ds.slice(5, 7)) +
        "&date=" +
        ds +
        "&view=day";
    return;
  }
  if (gm) {
    m = +gm;
    view = "month";
    renderCalendar();
    return;
  }
  if (e.target.closest("[data-view]")) {
    saveNotes();
    view = e.target.closest("[data-view]").dataset.view;
    renderCalendar();
    return;
  }
  if (!action) return;
  switch (action) {
    case "all-calendars":
      setCalendarFilters(CALENDAR_LAYERS.map(layer => layer[0]));
      break;
    case "menu":
      document.body.classList.toggle("menu-open");
      e.target
        .closest("button")
        .setAttribute(
          "aria-expanded",
          String(document.body.classList.contains("menu-open")),
        );
      break;
    case "print":
      saveNotes();
      window.print();
      break;
    case "new-event":
      openEvent();
      break;
    case "close-dialog":
      $("#event-dialog").close();
      break;
    case "delete-event":
      state.events = state.events.filter(
        (e) => e.id !== $("#event-form").elements.id.value,
      );
      persist();
      $("#event-dialog").close();
      renderCalendar();
      renderBirthdays();
      toast("Tapahtuma poistettu.");
      break;
    case "save-notes":
      saveNotes();
      toast("Muistiinpano tallennettu.");
      break;
    case "today":
      saveNotes();
      selected = today;
      y = +today.slice(0, 4);
      m = +today.slice(5, 7);
      renderCalendar();
      break;
    case "prev-month":
    case "next-month": {
      saveNotes();
      const n = action === "next-month" ? 1 : -1;
      if (view === "day" || view === "week") {
        selected = iso(add(parse(selected), n * (view === "week" ? 7 : 1)));
        y = +selected.slice(0, 4);
        m = +selected.slice(5, 7);
      } else if (view === "year") {
        y += n;
        selected = iso(date(y, m, 1));
      } else {
        let d = date(y, m + n, 1);
        y = d.getUTCFullYear();
        m = d.getUTCMonth() + 1;
        selected = iso(d);
      }
      if (config.kind === "calendar" && view === "month" && YEARS.includes(y)) {
        location.href =
          "/kalenteri/" +
          y +
          "/" +
          SLUGS[m - 1] +
          "/?date=" +
          selected +
          "&view=" +
          view;
      } else renderCalendar();
      break;
    }
    case "export-ics":
      download("oma-kalenteri.ics", eventICS(), "text/calendar;charset=utf-8");
      break;
    case "backup":
      saveNotes();
      download(
        "kalenteri365-varmuuskopio.json",
        JSON.stringify(state, null, 2),
        "application/json",
      );
      toast("Varmuuskopio ladattu.");
      break;

  }
});
document.addEventListener("change", async (e) => {
  const t = e.target;
  if (t.matches("[data-filter]")) {
    t.checked
      ? filters.add(t.dataset.filter)
      : filters.delete(t.dataset.filter);
    $$("[data-filter]")
      .filter((x) => x.dataset.filter === t.dataset.filter)
      .forEach((x) => (x.checked = t.checked));
    state.plans.calendarFilters = [...filters];
    persist();
    renderCalendar();
  }
  if (t.id === "jump-year" || t.id === "jump-month") {
    saveNotes();
    y = +$("#jump-year").value;
    m = +$("#jump-month").value;
    selected = iso(date(y, m, 1));
    if (config.kind === "calendar" && YEARS.includes(y))
      location.href = "/kalenteri/" + y + "/" + SLUGS[m - 1] + "/";
    else renderCalendar();
  }
  if (t.matches("[data-task-toggle]")) {
    let task = state.tasks.find((x) => x.id === t.dataset.taskToggle);
    task.done = t.checked;
    persist();
    renderTasks();
  }
  try {
    if (t.id === "import-ics" && t.files[0]) await importICS(t.files[0]);
    if (t.id === "restore-json" && t.files[0]) {
      let raw = await t.files[0].text(),
        obj = JSON.parse(raw);
      if (
        obj.version !== 1 ||
        !Array.isArray(obj.events) ||
        !obj.notes ||
        !Array.isArray(obj.tasks) ||
        !obj.plans || typeof obj.plans !== 'object' || Array.isArray(obj.plans) ||
        obj.events.length > 10000 ||
        obj.events.some(
          (e) =>
            typeof e.title !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(e.date) ||
            typeof e.id !== "string",
        )
      )
        throw Error("Varmuuskopion muotoa ei tunnistettu.");
      obj.events = obj.events.map((e) => ({
        ...(birthdayMeta(e) ? {birthday:birthdayMeta(e)} : {}),
        ...(namedayMeta(e) ? {nameday:namedayMeta(e)} : {}),
        id: e.id.replace(/[\r\n]/g, ""),
        date: e.date,
        title: e.title.slice(0, 160),
        time: /^\d{2}:\d{2}$/.test(e.time || "") ? e.time : "",
        note: typeof e.note === "string" ? e.note.slice(0, 2000) : "",
        category: ["personal", "work", "family", "school"].includes(e.category)
          ? e.category
          : "personal",
        repeat: ["none", "daily", "weekly", "monthly", "yearly"].includes(
          e.repeat,
        )
          ? e.repeat
          : "none",
        interval: Math.max(1, Math.min(366, Number(e.interval) || 1)),
        until: /^\d{4}-\d{2}-\d{2}$/.test(e.until || "") ? e.until : null,
        exdates: Array.isArray(e.exdates)
          ? e.exdates.filter(
              (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d),
            )
          : [],
      }));
      Object.assign(state, obj);
      filters = new Set(calendarFilterIds(state.plans.calendarFilters));
      if (state.city === 'mariehamn') state.city = 'maarianhamina';
      if (!CITIES.some(city => city[0] === state.city)) state.city = 'helsinki';
      if ($('#city-select')) {
        $('#city-select').value = state.city;
        $('#city-select').dispatchEvent(new Event('change', {bubbles: true}));
      }
      persist();
      renderCalendar();
      renderBirthdays();
      toast("Varmuuskopio palautettu.");
    }
  } catch (err) {
    toast(err instanceof SyntaxError ? "Varmuuskopiota ei voitu lukea. Valitse kelvollinen JSON-tiedosto." : err instanceof TypeError ? "Varmuuskopion muotoa ei tunnistettu." : err instanceof DOMException ? "Tiedostoa ei voitu lukea. Valitse tiedosto uudelleen." : err.message);
  }
  if (t.type === "file") t.value = "";
});
document.addEventListener("click", (e) => {
  const id = e.target.closest("[data-task-remove]")?.dataset.taskRemove;
  if (id) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    persist();
    renderTasks();
  }
});
$("#task-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#task-title");
  if (!input.value.trim()) return;
  state.tasks.push({
    id: crypto.randomUUID(),
    date: selected,
    title: input.value.trim(),
    done: false,
  });
  persist();
  input.value = "";
  renderTasks();
});
$("#day-notes")?.addEventListener("blur", saveNotes);
$("#day-notes")?.addEventListener("input", saveNotes);
function renderBirthdays() {
  window.dispatchEvent(new Event('birthdays:updated'));
}
function updateUpcoming() {
  if (!$('#upcoming')) return;
  const current = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Helsinki'}).format(new Date());
  const onlyHolidays = $('[data-upcoming="holidays"]')?.getAttribute('aria-pressed') === 'true';
  $('#upcoming').innerHTML = upcomingItems(current, onlyHolidays);
}
function setCalendarFilters(ids) {
  filters = new Set(ids);
  state.plans.calendarFilters = [...filters];
  persist();
  renderCalendar();
}
function updateCalendarFilters() {
  if (!$('.calendar-chipbar')) return;
  $$('[data-filter]').forEach(input => { input.checked = filters.has(input.dataset.filter); });
  $$('[data-focus-layer]').forEach(control => {
    const active = control.dataset.focusLayer === 'all' ? filters.size === CALENDAR_LAYERS.length : filters.size === 1 && filters.has(control.dataset.focusLayer);
    control.setAttribute('aria-pressed', String(active));
  });
  const counts = Object.fromEntries(CALENDAR_LAYERS.map(layer => [layer[0], 0]));
  const month = String(y) + '-' + String(m).padStart(2, '0');
  for (const item of holidays(y).filter(item => item.date.startsWith(month))) counts[['holiday','eve'].includes(item.type) ? 'holiday' : 'flag']++;
  for (let d = 1; d <= daysInMonth(y,m); d++) for (const event of eventAt(iso(date(y,m,d)))) counts[event.category || 'personal']++;
  $$('[data-layer-count]').forEach(element => { element.textContent = counts[element.dataset.layerCount] || 0; });
}
document.addEventListener('click', event => {
  const upcoming = event.target.closest('[data-upcoming]');
  if (upcoming) {
    $$('[data-upcoming]').forEach(control => control.setAttribute('aria-pressed', String(control === upcoming)));
    updateUpcoming();
  }
  const layer = event.target.closest('[data-focus-layer]');
  if (layer) setCalendarFilters(layer.dataset.focusLayer === 'all' ? CALENDAR_LAYERS.map(item => item[0]) : [layer.dataset.focusLayer]);
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateUpcoming(); });
if ($("#calendar-view")) {
  const q = new URL(location.href).searchParams;
  if (config.kind === "home") {
    const initial = homeView(location.href, state.homeCalendar, today);
    y = initial.year;
    m = initial.month;
    selected = initial.date;
    view = initial.view;
  } else {
    selected = /^\d{4}-\d{2}-\d{2}$/.test(q.get("date") || "")
      ? q.get("date")
      : iso(date(y, m, 1));
    view = ["month", "week", "day", "list", "year"].includes(q.get("view"))
      ? q.get("view")
      : "month";
  }
  renderCalendar();
  updateUpcoming();

}
const bindForm = (id, fn) =>
  $(id)?.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      fn(new FormData(e.currentTarget));
    } catch (err) {
      toast(err.message || "Tarkista annetut tiedot.");
    }
  });
const result = (s, id = "#calc-result") => {
  $(id).innerHTML = s;
};
if(!document.querySelector("[data-date-workspace]"))bindForm("#date-diff", (f) => {
  let diff = Math.round(
      (parse(f.get("end")) - parse(f.get("start"))) / 86400000,
    ),
    inc = f.get("inclusive"),
    total = Math.abs(diff) + (inc ? 1 : 0);
  result(
    `<strong>${total} ${total === 1 ? "päivä" : "päivää"}</strong><p>${diff < 0 ? "Loppupäivä on ennen alkupäivää. " : ""}${inc ? "Molemmat rajapäivät mukana." : "Loppupäivä ei sisälly määrään."}</p>`,
  );
});
if(!document.querySelector("[data-date-workspace]"))bindForm("#date-add", (f) =>
  result(
    `<strong>${fi(add(parse(f.get("start")), +f.get("amount")))}</strong><p>${cap(DAYS[day(add(parse(f.get("start")), +f.get("amount")))])}</p>`,
    "#add-result",
  ),
);
if(!document.querySelector("[data-workday-workspace]"))bindForm("#work-calc", (f) => {
  let a = parse(f.get("start")),
    b = parse(f.get("end"));
  if (b < a) throw Error("Loppupäivän on oltava alkupäivän jälkeen.");
  if (b - a > 86400000 * 366 * 20)
    throw Error("Valitse enintään 20 vuoden ajanjakso.");
  let n = 0,
    p = 0,
    w = 0,
    cache = {};
  for (let d = a; d <= b; d = add(d, 1)) {
    if (day(d) > 4) continue;
    w++;
    let hs = (cache[d.getUTCFullYear()] ??= holidays(d.getUTCFullYear()));
    if (
      hs.some(
        (h) =>
          h.date === iso(d) &&
          (h.type === "holiday" || (f.get("eves") && h.type === "eve")),
      )
    )
      p++;
    else n++;
  }
  result(
    `<strong>${n} ${n === 1 ? "työpäivä" : "työpäivää"}</strong><p>${(n * +f.get("hours")).toLocaleString("fi-FI")} ${n * +f.get("hours") === 1 ? "tunti" : "tuntia"} · ${w} ${w === 1 ? "ma–pe-päivä" : "ma–pe-päivää"} − ${p} ${p === 1 ? "valittu pyhä- tai aattopäivä" : "valittua pyhä- tai aattopäivää"}. Rajapäivät mukana.</p>`,
  );
});
$$("[data-plan]").forEach((el) => {
  let k = el.dataset.plan;
  if (state.plans[k] !== undefined) el.value = state.plans[k];
  el.addEventListener("input", () => {
    state.plans[k] = el.value;
    persist();
  });
});
function sheetLoad() {
  const input = $("#planner-date");
  if(!input) return;
  const root = $(".sheet-workspace"), base = root?.dataset.sheetBase;
  let ds = input.value;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(ds)||Number.isNaN(+parse(ds)))return;
  if(root?.dataset.sheetKind==='week') ds=iso(add(parse(ds),-day(parse(ds))));
  input.value=ds;
  if(base){state.plans[base+'-date']=ds;persist();}
  $$("[data-sheet]").forEach((el) => {
    const key = el.dataset.sheet + "-" + ds;
    el.value = state.plans[key] || "";
    el.oninput = () => {state.plans[key] = el.value;persist();};
  });
  $$("[data-sheet-day]").forEach(el=>{el.textContent=fi(add(parse(ds),Number(el.dataset.sheetDay)));el.dateTime=iso(add(parse(ds),Number(el.dataset.sheetDay)));});
  if ($("#planner-heading")) $("#planner-heading").textContent = ($("#planner-title").value || "Oma suunnitelma") + " · " + fi(parse(ds));
}
if($(".sheet-workspace")){
  const base=$(".sheet-workspace").dataset.sheetBase;
  if(state.plans[base+'-date'])$("#planner-date").value=state.plans[base+'-date'];
  for(const [id,step] of [['sheet-prev',-1],['sheet-next',1]])$('#'+id).onclick=()=>{const d=parse($("#planner-date").value);if(Number.isNaN(+d))return;$("#planner-date").value=iso(add(d,step*($('.sheet-workspace').dataset.sheetKind==='day'?1:7)));sheetLoad();};
}
$("#planner-date")?.addEventListener("change", sheetLoad);
$("#planner-title")?.addEventListener("input", sheetLoad);
sheetLoad();
renderBirthdays();
import("./site-search.mjs").then(({connectSiteSearch})=>connectSiteSearch());
let astronomyPromise;
async function astronomy() {
  if (window.Astronomy) return window.Astronomy;
  if (!astronomyPromise)
    astronomyPromise = new Promise((resolve, reject) => {
      let s = document.createElement("script");
      s.src = "/assets/astronomy.min.js";
      s.onload = () => resolve(window.Astronomy);
      s.onerror = () =>
        reject(Error("Tähtitieteellisen laskennan lataus epäonnistui."));
      document.head.append(s);
    });
  return astronomyPromise;
}
let astroRequest = 0;
bindForm("#astro-form", async (f) => {
  const request = ++astroRequest;
  const workspace = $(".solar-workspace");
  workspace?.setAttribute("aria-busy", "true");
  try {
    const A = await astronomy(),
      city = CITIES.find((c) => c[0] === f.get("city")),
      ds = f.get("date"),
      body = config.body || "Sun",
      r = dayEvents(A, city, ds, body),
      fmt = (d) =>
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Helsinki",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(d);
    if(request !== astroRequest) return;
    $("#astro-result").innerHTML =
      `<strong>${city[1]} · ${fi(parse(ds))}</strong><p>Nousu: ${r.rise ? fmt(r.rise) : "—"} · Lasku: ${r.set ? fmt(r.set) : "—"}${r.duration !== null ? ` · Päivän pituus: ${Math.floor(r.duration / 60)} h ${r.duration % 60} min` : ""}</p>${r.polar ? `<p>${body === "Sun" ? "Aurinko" : "Kuu"} on koko paikallisen päivän horisontin ${r.polar === "up" ? "yläpuolella" : "alapuolella"}.</p>` : ""}`;
    const scene = await import("./solar-fi.mjs");
    if(request !== astroRequest) return;
    scene.connectSolar(A, $("#astro-form"), r);
    if (body === "Sun") {
      const chart=await import('./daylight-chart.mjs');
      if(request !== astroRequest) return;
      if($('#daylength-summary')){
        const metrics=await import('./daylength-metrics.mjs');
        if(request!==astroRequest)return;
        const summary=metrics.daylengthMetrics(ds,r,dayEvents(A,city,iso(add(parse(ds),-1))),dayEvents(A,city,iso(add(parse(ds),7))));
        $('#daylength-summary').innerHTML=metrics.daylengthSummary(summary);
        $('#daylength-scene-value').textContent=metrics.durationLabel(r.duration);
        $('#light-city').value=city[0];$('#light-date').value=ds;
        $('#light-date').dispatchEvent(new Event('change'));
      }
      const year=Number(ds.slice(0,4)),rows=Array.from({length:12},(_,i)=>{const day=dayEvents(A,city,`${year}-${String(i+1).padStart(2,'0')}-15`);return {date:`${year}-${String(i+1).padStart(2,'0')}-15`,rise:day.rise?fmt(day.rise):'—',set:day.set?fmt(day.set):'—',duration:day.duration};});
      $('#daylight-title').textContent='Päivän pituus: '+city[1]+' '+year;
      $('#daylight-chart').innerHTML=chart.daylightChart(city,year,rows,Number(ds.slice(5,7))-1);
      $('#daylight-chart').onclick=e=>{
        const show=e.target.closest('[data-daylight-open]');
        if(show){const form=$('#astro-form');form.elements.date.value=show.dataset.daylightOpen;form.requestSubmit();$('#solar-player').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
        const b=e.target.closest('[data-daylight-index]');if(!b)return;
        const row=rows[Number(b.dataset.daylightIndex)];$$('[data-daylight-index]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#daylight-selection').innerHTML=chart.daylightSelection(row);
      };
    }
  } catch (err) {
    if(request !== astroRequest) return;
    $("#astro-result").textContent = "Aikojen lataus ei onnistunut. Kokeile Päivitä-painiketta uudelleen.";
    const status = $("#solar-render-status");
    if(status){status.hidden=false;status.textContent="Simulaation lataus ei onnistunut. Yritä uudelleen.";}
    astronomyPromise=undefined;
  } finally {
    if(request === astroRequest) workspace?.removeAttribute("aria-busy");
  }
});
if ($("#astro-form")) {
  const form = $("#astro-form");
  if (config.city) form.elements.city.value = config.city;
  form.addEventListener("change", () => {if(form.checkValidity()) form.requestSubmit();});
  form.requestSubmit();
}
$("#season-year")?.addEventListener("change", (e) => {
  $$("[data-season-year]").forEach(
    (s) => (s.hidden = s.dataset.seasonYear !== e.target.value),
  );
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    $$(".tools-menu[open]").forEach((d) => (d.open = false));
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".tools-menu"))
    $$(".tools-menu[open]").forEach((d) => (d.open = false));
});


document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-moon-date]");
  if (!b) return;
  $$("[data-moon-date]").forEach((d) => {
    d.classList.toggle("selected", d === b);
    d.setAttribute("aria-pressed", String(d === b));
  });
  $("#moon-selected-title").textContent = fi(parse(b.dataset.moonDate));
  $("#moon-selected-disc").innerHTML = moonSVG(
    Number(b.dataset.moonAngle),
    "selected-disc",
  );
  $("#moon-selected-light").textContent =
    (100 * Number(b.dataset.moonLight)).toLocaleString("fi-FI", {
      maximumFractionDigits: 1,
    }) + " % valaistuna";
});

if ($("#ascendant-form")) import("./ascendant-fi.mjs");

if ($("[data-studio]")) import("./studio-ui.mjs");

// Keep the last fully decoded photo visible until the next selection is ready.
let photoIndexPromise,
  photoAstronomyPromise,
  displayedPhotoKey,
  photoTransitionTimer,
  photoToken = 0;
const decodedPhotos = new Map();
function photoIndex() {
  return (photoIndexPromise ??= fetch("/assets/photo-index.json").then((r) =>
    r.json(),
  ));
}
function decodeCityPhoto(p) {
  if (decodedPhotos.has(p.id)) return decodedPhotos.get(p.id);
  const image = new Image();
  image.src = p.cardSrc || p.src.replace(".webp", "-640.webp");
  const promise = image
    .decode()
    .then(() => image)
    .catch(async(e) => {
      if(p.cardSrc){image.src=p.src.replace(".webp","-640.webp");try{await image.decode();return image;}catch{}}
      decodedPhotos.delete(p.id);
      throw e;
    });
  decodedPhotos.set(p.id, promise);
  return promise;
}
async function updateCityPhoto(id, notify = true) {
  if (notify) window.dispatchEvent(new CustomEvent('fi-city-change',{detail:{id}}));
  const token = ++photoToken;
  try {
    const [list, A] = await Promise.all([photoIndex(), photoAstronomyPromise ??= import('./vendor/astronomy-engine.mjs')]);
    if (token !== photoToken) return;
    const city = CITIES.find(c => c[0] === id), entry = list.find(p => p.id === id);
    if (!city || !entry) return;
    const light=cityPhotoState(A,city),period=light.period,p=cityPhotoVariant(entry,period);
    clearTimeout(photoTransitionTimer);
    photoTransitionTimer=setTimeout(()=>updateCityPhoto(state.city,false),Math.max(25,+light.nextChange-Date.now()+25));
    if (!p || displayedPhotoKey === p.id) return;
    const image = await decodeCityPhoto(p);
    if (token !== photoToken) return;
    const target = $("#city-photo");
    if (!target) return;
    if(target.currentSrc!==image.src){document.querySelector('#city-picture source')?.remove();target.src=image.src;}
    target.alt = p.alt;
    target.dataset.city = id;
    target.dataset.period = period;
    displayedPhotoKey = p.id;
    if ($("#city-photo-name")) $("#city-photo-name").textContent = entry.name;
    if ($("#city-photo-period")) $("#city-photo-period").textContent = period === 'night' ? 'Yökuva' : 'Päiväkuva';
  } catch {}
}
if ($("#city-photo") && $(".local-dashboard")?.getClientRects().length) {
  // Re-evaluate after sunrise/sunset and after a suspended browser resumes.
  // A clock minute is only a refresh trigger; solar geometry selects the image.
  setInterval(() => {if(!document.hidden) updateCityPhoto(state.city, false);}, 30000);
  document.addEventListener('visibilitychange', () => {if(!document.hidden) updateCityPhoto(state.city, false);});
  import('./local-panel.mjs').then(({connectLocalPanel}) => {
    connectLocalPanel({
      state,
      onCityChange(id, source) {
        state.city = id;
        state.citySource = source;
        if(source === "manual") persist();
        updateCityPhoto(id);
      },
      onOpen() {
        Promise.all([photoIndex(), photoAstronomyPromise ??= import('./vendor/astronomy-engine.mjs')]).then(async ([list, A]) => {
          if(navigator.connection?.saveData) return;
          for (const photo of list) {
            const city=CITIES.find(c=>c[0]===photo.id);
            const variant=city&&cityPhotoVariant(photo,cityPhotoPeriod(A,city));
            if(variant) await decodeCityPhoto(variant).catch(() => {});
          }
        }).catch(() => {});
      },
    });
  });
}

if(document.querySelector("[data-horoscope-sign], [data-collection-date]"))import("./horoscope-fi.mjs");

document.addEventListener('click',e=>{const b=e.target.closest('[data-add-date]');if(!b)return;openEvent();const f=$('#event-form');f.elements.date.value=b.dataset.addDate;f.elements.title.value=b.dataset.addTitle||'';});



if(document.querySelector('#garden-config')) import('./garden-planner.mjs').then(({initGardenPlanner})=>initGardenPlanner({onAddEvent:entry=>{openEvent();const f=$('#event-form');f.elements.date.value=entry.date;f.elements.title.value=entry.title;f.elements.note.value=entry.description;}}));
bindForm('#sowing-form',f=>{let w;try{w=sowingWindow(f.get('planting'),f.get('minWeeks'),f.get('maxWeeks'));}catch(error){$('#sowing-result').replaceChildren();throw error;}$('#sowing-result').innerHTML='<strong>'+fi(parse(w.start))+'–'+fi(parse(w.end))+'</strong><p>Esikasvatuksen aloitus annetulla '+f.get('minWeeks')+'–'+f.get('maxWeeks')+' viikon kestolla. Istutuspäivä '+fi(parse(w.planting))+' on oma suunnitelmasi.</p><div class="actions"><button type="button" class="btn secondary" data-add-date="'+w.start+'" data-add-title="Esikasvatuksen aloitus">Lisää aloitus kalenteriin</button><button type="button" class="btn secondary" data-add-date="'+w.planting+'" data-add-title="Suunniteltu istutuspäivä">Lisää istutuspäivä</button></div>';});

initStorageNotice();

if(document.querySelector('.shift-app'))import('./shift-fi.mjs');

window.addEventListener('beforeprint',()=>{
 const calendarPanel=$('.calendar-panel');if(calendarPanel)calendarPanel.dataset.printTitle=$('#calendar-title')?.textContent||'';
  for(const el of document.querySelectorAll('.sheet-workspace textarea,.weekly-workspace textarea,.family-shopping textarea,.family-meal input')){
    el.parentElement.querySelector('.print-value')?.remove();
    const value=document.createElement('span');value.className='print-value';value.textContent=el.value||' ';value.setAttribute('aria-hidden','true');el.after(value);
  }
});
window.addEventListener('afterprint',()=>document.querySelectorAll('.print-value').forEach(el=>el.remove()));

document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-share-open]');if(!button)return;
 button.disabled=true;
 try{const {openShare}=await import('./share-fi.mjs');openShare({url:document.querySelector('link[rel=canonical]')?.href||location.href,title:document.querySelector('h1')?.textContent||document.title,image:document.querySelector('meta[property="og:image"]')?.content},button);}
 catch{toast('Jakamista ei voitu avata. Yritä uudelleen.');}
 finally{button.disabled=false;}
});

if(document.querySelector('[data-exam-workspace]'))import('./exams.mjs');

if(document.querySelector("#blog-search,#tool-filter,[data-family-planner],#local-sun"))import("./edition-ui.mjs").then(({connectEdition})=>connectEdition({state,persist}));

import './tools-menu.mjs';

if(document.querySelector('[data-holiday-calendar]'))import('./holiday-calendar.mjs');

if(document.querySelector('[data-services],#personal-tax-form'))import('./finland-services.mjs');

if(document.querySelector('[data-community]'))import('./community.mjs').then(({connectCommunity})=>connectCommunity({state,persist,onUpdate(){renderCalendar();window.dispatchEvent(new Event('community:updated'));}}));

if(document.querySelector('[data-personal-planner]'))import('./personal-planner.mjs').then(({connectPersonalPlanner})=>connectPersonalPlanner({
  state,persist,
  openEvent({id,date,title}) {
    const existing=id&&state.events.find(event=>event.id===id);
    openEvent(existing?.id);
    if(!existing){
      const form=$('#event-form');
      form.elements.id.value=id||'';
      form.elements.date.value=date||today;
      form.elements.title.value=title||'';
    }
  },
  onUpdate(){renderCalendar();}
}));

if(document.querySelector("[data-date-workspace]"))import("./date-tools.mjs");

if(document.querySelector("[data-workday-workspace]"))import("./workday-tools.mjs");

if(document.querySelector("[data-work-overview]"))import("./work-overview-ui.mjs");

if(document.querySelector('[data-education-hub]'))import('./education-levels.mjs');

if(document.querySelector('[data-print-catalog]'))import('./print-catalog-ui.mjs');

if(document.querySelector("[data-privacy-tools]"))import("./privacy-tools.mjs");

if(document.querySelector("[data-vacation-planner]"))import("./vacation-planner.mjs");

if(document.querySelector("[data-eclipse-workspace]"))import("./solar-eclipse-ui.mjs");

if(document.querySelector("[data-lunar-eclipses]"))import("./lunar-eclipse-ui.mjs");

if(document.querySelector("[data-perseids]"))import("./perseids-ui.mjs");

if(document.querySelector('.season-reminders'))import('./season-reminders.mjs');

if(document.querySelector('[data-countdown]'))import('./countdown.mjs');

if(document.querySelector('[data-calendar-lab]'))import('./calendar-lab.mjs');

if(document.querySelector('[data-birthday-calendar]'))import('./birthday-calendar.mjs').then(({connectBirthdays})=>connectBirthdays({state,persist,openEvent,onUpdate:()=>renderCalendar()}));

if(document.querySelector('[data-pension-workspace]'))import('./pension-workspace.mjs').then(({connectPension})=>connectPension({state,persist,onUpdate(){renderCalendar();window.dispatchEvent(new Event('community:updated'));}}));

if(document.querySelector('[data-benefit-workspace]'))import('./benefit-workspace.mjs').then(({connectBenefits})=>connectBenefits({state,persist,onUpdate(){renderCalendar();window.dispatchEvent(new Event('community:updated'));}}));

if(document.querySelector('[data-weekend-workspace]'))import('./long-weekends.mjs');

if(document.querySelector('[data-tax-workspace]'))import('./tax-calendar.mjs');

if(document.querySelector('[data-admissions-workspace]'))import('./admissions.mjs');

if(document.querySelector('[data-namedays-workspace]'))import('./namedays.mjs').then(({connectNamedays})=>connectNamedays({state,persist,onUpdate:()=>renderCalendar()}));

if(document.querySelector('[data-flagging-workspace]'))import('./flagging.mjs');
