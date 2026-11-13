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
function occurs(e, ds) {
  if (e.date > ds || e.exdates?.includes(ds)) return false;
  if (!e.repeat || e.repeat === "none") return e.date === ds;
  let a = parse(e.date),
    b = parse(ds),
    gap = Math.round((b - a) / 86400000),
    interval = e.interval || 1;
  if (e.until && ds > e.until) return false;
  return e.repeat === "daily"
    ? gap % interval === 0
    : e.repeat === "weekly"
      ? gap % (7 * interval) === 0
      : e.repeat === "monthly"
        ? b.getUTCDate() === a.getUTCDate() &&
          ((b.getUTCFullYear() - a.getUTCFullYear()) * 12 +
            b.getUTCMonth() -
            a.getUTCMonth()) %
            interval ===
            0
        : e.repeat === "yearly"
          ? b.getUTCMonth() === a.getUTCMonth() &&
            b.getUTCDate() === a.getUTCDate() &&
            (b.getUTCFullYear() - a.getUTCFullYear()) % interval === 0
          : false;
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
    });
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
    `Tuotu ${count} tapahtumaa.${skipped ? " " + skipped + " tapahtumaa ohitettiin: tukematon toistosääntö tai aikavyöhyke." : ""}`,
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
    case "export-shifts":
      if (!shiftEvents.length) {
        toast("Luo ensin vuoroluettelo.");
        return;
      }
      download("tyovuorot.ics", simpleICS(shiftEvents), "text/calendar");
      break;
    case "editor-webp":
      editorWebP();
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
    toast(err.message);
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
  if ($("#birthdays"))
    $("#birthdays").innerHTML =
      state.events
        .filter((e) => e.repeat === "yearly")
        .sort((a, b) => a.date.slice(5).localeCompare(b.date.slice(5)))
        .map(
          (e) =>
            `<button class="agenda-item" data-edit-event="${esc(e.id)}">${esc(e.date.slice(8) + "." + e.date.slice(5, 7) + ".")} · ${esc(e.title)}</button>`,
        )
        .join("") || '<p class="empty">Ei vielä vuosittaisia muistutuksia.</p>';
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
    inc = f.get("inclusive");
  result(
    `<strong>${Math.abs(diff) + (inc ? 1 : 0)} päivää</strong><p>${diff < 0 ? "Loppupäivä on ennen alkupäivää. " : ""}${inc ? "Molemmat rajapäivät mukana." : "Loppupäivä ei sisälly määrään."}</p>`,
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
    `<strong>${n} työpäivää</strong><p>${(n * +f.get("hours")).toLocaleString("fi-FI")} tuntia · ${w} ma–pe-päivää − ${p} valittua pyhä- tai aattopäivää. Rajapäivät mukana.</p>`,
  );
});
bindForm("#week-calc", (f) => {
  let w = week(parse(f.get("date")));
  result(
    `<strong>Viikko ${w.number} / ${w.year}</strong><p>${fi(weekStart(w.year, w.number))}–${fi(add(weekStart(w.year, w.number), 6))}</p>`,
  );
});
bindForm("#day-calc", (f) => {
  let d = parse(f.get("date")),
    n = Math.round((d - date(d.getUTCFullYear(), 1, 1)) / 86400000) + 1;
  result(
    `<strong>Vuoden ${n}. päivä</strong><p>Vuodessa on ${leap(d.getUTCFullYear()) ? 366 : 365} päivää. Päivän jälkeen jäljellä ${(leap(d.getUTCFullYear()) ? 366 : 365) - n} päivää.</p>`,
  );
});
bindForm("#leap-calc", (f) =>
  result(
    `<strong>${f.get("year")}: ${leap(+f.get("year")) ? "karkausvuosi" : "tavallinen vuosi"}</strong><p>${leap(+f.get("year")) ? "366 päivää · Helmikuussa 29 päivää." : "365 päivää · Helmikuussa 28 päivää."}</p>`,
  ),
);
bindForm("#countdown-form", (f) => {
  let n = Math.round((parse(f.get("target")) - parse(today)) / 86400000);
  result(
    `<strong>${Math.abs(n)} päivää ${n < 0 ? "sitten" : "jäljellä"}</strong><p>${esc(f.get("title"))} · ${fi(parse(f.get("target")))}</p>`,
    "#countdown-result",
  );
});
bindForm("#vacation-form", (f) => {
  let yy = +f.get("year"),
    budget = +f.get("budget"),
    max = +f.get("length"),
    hs = holidays(yy),
    free = (d) =>
      day(d) > 4 ||
      hs.some(
        (h) =>
          h.date === iso(d) &&
          (h.type === "holiday" || (f.get("eves") && h.type === "eve")),
      ),
    found = [];
  for (let a = date(yy, 1, 1); a <= date(yy, 12, 31); a = add(a, 1)) {
    if (!free(a)) continue;
    let needed = [];
    for (let l = 1; l <= max; l++) {
      let b = add(a, l - 1);
      if (b.getUTCFullYear() !== yy) break;
      if (!free(b)) needed.push(iso(b));
      if (needed.length > budget) break;
      if (l >= 3 && free(b))
        found.push({ a: iso(a), b: iso(b), n: l, needed: [...needed] });
    }
  }
  if(f.get("schoolOnly")){
    const periods=state.plans?.schoolHolidayPeriods||[];
    const matching=found.filter(o=>periods.some(p=>o.a>=p.start&&o.b<=p.end));
    found.splice(0,found.length,...matching);
  }
  found.sort(
    (a, b) =>
      b.n - a.n || a.needed.length - b.needed.length || a.a.localeCompare(b.a),
  );
  let selectedOptions = [];
  for (let o of found) {
    if (selectedOptions.some((p) => !(o.b < p.a || o.a > p.b))) continue;
    selectedOptions.push(o);
    if (selectedOptions.length >= 10) break;
  }
  $("#vacation-result").innerHTML = selectedOptions.length
    ? table(
        ["Vapaa", "Päiviä", "Lomapäiviä", "Haettavat päivät"],
        selectedOptions.map((o) => [
          `${fi(parse(o.a))}–${fi(parse(o.b))}`,
          o.n,
          o.needed.length,
          o.needed.map((d) => fi(parse(d))).join(", ") || "Ei tarvita",
        ]),
      )
    : "<p>Näillä valinnoilla ei löytynyt vähintään kolmen päivän vapaata.</p>";
});
let shiftEvents = [];
bindForm("#shift-form", (f) => {
  let cycle = f
    .get("cycle")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!cycle.length || cycle.length > 50) throw Error("Anna 1–50 vuoroa.");
  shiftEvents = Array.from({ length: +f.get("count") }, (_, i) => ({
    date: iso(add(parse(f.get("start")), i)),
    name: cycle[i % cycle.length],
    slug: "shift-" + i,
  }));
  $("#shift-result").innerHTML = table(
    ["Päivämäärä", "Päivä", "Vuoro"],
    shiftEvents.map((e) => [
      fi(parse(e.date)),
      cap(DAYS[day(parse(e.date))]),
      esc(e.name),
    ]),
  );
});
function simpleICS(es) {
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Kalenteri365.fi//FI",
      ...es.flatMap((e, i) => [
        "BEGIN:VEVENT",
        `UID:${e.date}-${i}@kalenteri365.fi`,
        "DTSTAMP:20261112T000000Z",
        "DTSTART;VALUE=DATE:" + e.date.replaceAll("-", ""),
        "DTEND;VALUE=DATE:" + iso(add(parse(e.date), 1)).replaceAll("-", ""),
        "SUMMARY:" + e.name.replace(/[;,]/g, (c) => "\\" + c),
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ].join("\r\n") + "\r\n"
  );
}
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
let photoData = "";
function renderEditor() {
  if (!$("#editor-preview")) return;
  let yy = +$("#editor-year").value,
    mm = +$("#editor-month").value,
    blank = $("#editor-blank").checked,
    title =
      $("#editor-title").value ||
      (blank ? "Oma kuukausi" : cap(MONTHS[mm - 1]) + " " + yy),
    color = $("#editor-color").value;
  $("#editor-preview").style.setProperty("--accent", color);
  $("#editor-preview").innerHTML =
    `<h2 class="editor-title" style="color:${esc(color)}">${esc(title)}</h2>${photoData ? '<img class="editor-photo" src="' + photoData + '" alt="Oma kalenterikuva">' : ""}${calTable(yy, mm)}<footer>www.Kalenteri365.fi</footer>`;
  if (blank) {
    $$(".date-num,#editor-preview .weekno", $("#editor-preview")).forEach(
      (el) => (el.textContent = ""),
    );
    $$(".cal-event", $("#editor-preview")).forEach((el) => el.remove());
  } else {
    if (!$("#editor-holidays").checked)
      $$(".cal-event", $("#editor-preview")).forEach((el) => el.remove());
    $$("td[data-date]", $("#editor-preview")).forEach((td) => {
      for (let e of eventAt(td.dataset.date)) {
        let s = document.createElement("span");
        s.className = "cal-event personal";
        s.textContent = e.title;
        td.append(s);
      }
    });
  }
}
if ($("#editor-year") && !$("[data-studio]")) {
  const q = new URL(location.href).searchParams;
  if (YEARS.includes(+q.get("year"))) $("#editor-year").value = q.get("year");
  if (+q.get("month") >= 1 && +q.get("month") <= 12)
    $("#editor-month").value = q.get("month");
  for (let id of [
    "editor-year",
    "editor-month",
    "editor-title",
    "editor-color",
    "editor-holidays",
    "editor-blank",
  ])
    $("#" + id).addEventListener("input", renderEditor);
  $("#editor-photo").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10e6) {
      toast("Valitse enintään 10 Mt kuva.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      photoData = reader.result;
      renderEditor();
    };
    reader.readAsDataURL(file);
  });
  renderEditor();
}
async function editorWebP() {
  await document.fonts.ready;
  const root = $("#editor-preview");
  if (!root) return;
  const W = 2400,
    H = photoData ? 2200 : 1700,
    c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d"),
    color = $("#editor-color").value;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = color;
  ctx.font = "700 70px Lato";
  ctx.fillText($(".editor-title", root).textContent, 80, 120, W - 160);
  let top = 190;
  if (photoData) {
    let img = new Image();
    img.src = photoData;
    await img.decode();
    const scale = Math.min((W - 160) / img.width, 450 / img.height),
      iw = img.width * scale,
      ih = img.height * scale;
    ctx.drawImage(img, (W - iw) / 2, top, iw, ih);
    top += 490;
  }
  let rows = $$("tbody tr", root),
    cw = (W - 160) / 8,
    rh = (H - top - 170) / (rows.length + 1);
  ctx.font = "700 28px Lato";
  $$("thead th", root).forEach((th, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(80 + i * cw, top, cw, rh);
    ctx.fillStyle = "white";
    ctx.fillText(th.textContent, 100 + i * cw, top + 40);
  });
  top += rh;
  rows.forEach((tr, ri) => {
    [...tr.children].forEach((td, i) => {
      const xx = 80 + i * cw,
        tt = top + ri * rh;
      ctx.strokeStyle = "#d6dfe4";
      ctx.strokeRect(xx, tt, cw, rh);
      ctx.fillStyle = color;
      ctx.font = "700 29px Lato";
      ctx.fillText(
        $(".date-num", td)?.textContent || td.textContent.trim().slice(0, 3),
        xx + 13,
        tt + 38,
      );
      ctx.font = "400 17px Lato";
      $$(".cal-event", td).forEach((e, j) => {
        let words = e.textContent.split(" "),
          line = "",
          yy = tt + 65 + j * 27;
        for (let w of words) {
          let n = line ? line + " " + w : w;
          if (ctx.measureText(n).width > cw - 24 && line) {
            ctx.fillText(line, xx + 12, yy);
            yy += 21;
            line = w;
          } else line = n;
        }
        ctx.fillText(line, xx + 12, yy);
      });
    });
  });
  ctx.fillStyle = "#687985";
  ctx.font = "24px Lato";
  ctx.fillText("www.Kalenteri365.fi", 80, H - 55);
  c.toBlob(
    (b) => {
      if (b) download("oma-kalenteri.webp", b, "image/webp");
    },
    "image/webp",
    0.92,
  );
}
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
bindForm("#astro-form", async (f) => {
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
    $("#astro-result").innerHTML =
      `<strong>${city[1]} · ${fi(parse(ds))}</strong><p>Nousu: ${r.rise ? fmt(r.rise) : "—"} · Lasku: ${r.set ? fmt(r.set) : "—"}${r.duration !== null ? ` · Päivän pituus: ${Math.floor(r.duration / 60)} h ${r.duration % 60} min` : ""}</p>${r.polar ? `<p>${body === "Sun" ? "Aurinko" : "Kuu"} on koko paikallisen päivän horisontin ${r.polar === "up" ? "yläpuolella" : "alapuolella"}.</p>` : ""}`;
    if (body === "Sun") {
      const scene = await import("./solar-fi.mjs");
      scene.connectSolar(A, $("#astro-form"), r);
      const chart=await import('./daylight-chart.mjs'),year=Number(ds.slice(0,4)),rows=Array.from({length:12},(_,i)=>{const day=dayEvents(A,city,`${year}-${String(i+1).padStart(2,'0')}-15`);return {date:`${year}-${String(i+1).padStart(2,'0')}-15`,rise:day.rise?fmt(day.rise):'—',set:day.set?fmt(day.set):'—',duration:day.duration};});
      $('#daylight-title').textContent='Päivän pituus: '+city[1]+' '+year;
      $('#daylight-chart').innerHTML=chart.daylightChart(city,year,rows);
      $('#daylight-chart').onclick=e=>{const b=e.target.closest('[data-daylight-index]');if(!b)return;const row=rows[Number(b.dataset.daylightIndex)];$$('[data-daylight-index]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#daylight-selection').textContent=fi(parse(row.date))+': nousu '+row.rise+' · lasku '+row.set+' · päivän pituus '+Math.floor(row.duration/60)+' h '+row.duration%60+' min';};
    }
  } catch (err) {
    toast(err.message);
  }
});
if ($("#astro-form")) {
  const form = $("#astro-form");
  if (config.city) form.elements.city.value = config.city;
  form.requestSubmit();
}
const signNames = [
  "Kauris",
  "Vesimies",
  "Kalat",
  "Oinas",
  "Härkä",
  "Kaksoset",
  "Rapu",
  "Leijona",
  "Neitsyt",
  "Vaaka",
  "Skorpioni",
  "Jousimies",
];
bindForm("#zodiac-form", (f) => {
  let d = parse(f.get("date")),
    mo = d.getUTCMonth(),
    cut = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22][mo],
    idx = (mo + (d.getUTCDate() >= cut ? 1 : 0)) % 12;
  result(
    `<strong>${signNames[idx]}</strong><p>Tavanomainen länsimainen horoskooppimerkki.</p>`,
  );
});
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
    $("#city-caption").textContent = entry.name;
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



$('#garden-month')?.addEventListener('change',e=>{let count=0;document.querySelectorAll('[data-crop-months]').forEach(card=>{card.hidden=Boolean(e.target.value)&&!card.dataset.cropMonths.split(',').includes(e.target.value);if(!card.hidden)count++;});$('#garden-count').textContent=count+' kasvia';});
bindForm('#sowing-form',f=>{const from=Number(f.get('minWeeks')),to=Number(f.get('maxWeeks'));if(from>to)throw Error('Lyhin kasvatusaika ei voi olla pisintä suurempi.');const d=parse(f.get('planting'));$('#sowing-result').innerHTML='<strong>'+fi(add(d,-to*7))+'–'+fi(add(d,-from*7))+'</strong><p>Esikasvatuksen aloitus annetulla '+from+'–'+to+' viikon kestolla. Istutuspäivä '+fi(d)+' on oma suunnitelmasi, ei paikallinen hallattomuusennuste.</p>';});

const storageNotice=$('#storage-notice');if(storageNotice){let acknowledged=false;try{acknowledged=Number(localStorage.getItem('fi-storage-notice-until'))>Date.now();}catch{}if(!acknowledged)storageNotice.hidden=false;$('#storage-dismiss').onclick=()=>{try{localStorage.setItem('fi-storage-notice-until',String(Date.now()+180*86400000));}catch{}storageNotice.hidden=true;};}

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
 try{const {openShare}=await import('./share-fi.mjs');openShare({url:document.querySelector('link[rel=canonical]')?.href||location.href,title:document.querySelector('h1')?.textContent||document.title,image:document.querySelector('meta[property="og:image"]')?.content});}
 catch{toast('Jakamista ei voitu avata. Yritä uudelleen.');}
 finally{button.disabled=false;}
});

$('#exam-filter')?.addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase('fi').trim();let n=0;$$('[data-exam-subject]').forEach(row=>{row.hidden=!row.dataset.examSubject.includes(q);if(!row.hidden)n++;});$('#exam-filter-status').textContent=n+' koepäivää';});

if(document.querySelector("#blog-search,#tool-filter,[data-family-planner],#local-sun"))import("./edition-ui.mjs").then(({connectEdition})=>connectEdition({state,persist}));

import './tools-menu.mjs';

if(document.querySelector('[data-holiday-calendar]'))import('./holiday-calendar.mjs');

if(document.querySelector('[data-services],#personal-tax-form'))import('./finland-services.mjs');

if(document.querySelector('[data-community]'))import('./community.mjs').then(({connectCommunity})=>connectCommunity({state,persist,onUpdate(){renderCalendar();window.dispatchEvent(new Event('community:updated'));}}));

if(document.querySelector("[data-date-workspace]"))import("./date-tools.mjs");

if(document.querySelector("[data-workday-workspace]"))import("./workday-tools.mjs");

if(document.querySelector("[data-work-overview]"))import("./work-overview-ui.mjs");

if(document.querySelector('[data-education-hub]'))import('./education-levels.mjs');

if(document.querySelector('[data-print-catalog]'))import('./print-catalog-ui.mjs');

if(document.querySelector("[data-privacy-tools]"))import("./privacy-tools.mjs");
