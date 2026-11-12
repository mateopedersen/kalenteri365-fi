import {
  initialState,
  applyPreset,
  renderCalendar,
  normalize,
} from "./studio/engine.mjs";
const $ = (s) => document.querySelector(s),
  preview = $("#editor-preview");
let state = {
    ...initialState(),
    view: "month",
    showWeekNumbers: true,
    title: "Oma kalenterini",
  },
  photo = "";
const query = new URL(location.href).searchParams;
if (+query.get("year") >= 2027 && +query.get("year") <= 2030)
  state.year = +query.get("year");
if (+query.get("month") >= 1 && +query.get("month") <= 12)
  state.month = +query.get("month");
$("#editor-year").value = state.year;
$("#editor-month").value = state.month;
let saved;
try {
  saved = JSON.parse(localStorage.getItem("kalenteri365-fi-v1") || "null");
} catch {}
state.events = (saved?.events || []).map((e) => ({
  id: e.id,
  title: e.title,
  date: e.date,
  annual: e.repeat === "yearly",
}));
function collect() {
  return normalize({
    ...state,
    year: Number($("#editor-year").value),
    month: Number($("#editor-month").value),
    view: $("#editor-view").value,
    title: $("#editor-title").value || "Oma kalenterini",
    font: $("#editor-font").value,
    colors: { ...state.colors, accent: $("#editor-color").value },
    paper: $("#editor-paper").value,
    orientation: $("#editor-orientation").value,
    footer: $("#editor-footer").value,
    showHolidays: $("#editor-holidays").checked,
    showWeekNumbers: $("#editor-weeks").checked,
    photo,
    quality: Number($("#editor-quality").value),
  });
}
function render() {
  state = collect();
  preview.innerHTML = renderCalendar(state);
  let style = $("#studio-print-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "studio-print-style";
    document.head.append(style);
  }
  style.textContent = `@media print{@page{size:${state.paper.toUpperCase()} ${state.orientation};margin:0}body[data-kind=editor] #sisalto{padding:0!important}body[data-kind=editor] .editor-preview{margin:0;padding:0;border:0}body[data-kind=editor] .editor-preview>svg{width:100%;height:auto;max-height:100vh}body[data-kind=editor] .page-heading,body[data-kind=editor] .breadcrumb,body[data-kind=editor] .related-content{display:none!important}}`;
}
for (const id of [
  "editor-year",
  "editor-month",
  "editor-view",
  "editor-title",
  "editor-font",
  "editor-color",
  "editor-paper",
  "editor-orientation",
  "editor-footer",
  "editor-holidays",
  "editor-weeks",
])
  $("#" + id).addEventListener("input", render);
$("#editor-preset").onchange = () => {
  state = applyPreset(collect(), $("#editor-preset").value);
  $("#editor-font").value = state.font;
  $("#editor-color").value = state.colors.accent;
  $("#editor-orientation").value = state.orientation;
  $("#editor-view").value = state.view;
  render();
};
$("#editor-photo").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 8e6) {
    $("#editor-export-status").textContent = "Valitse enintään 8 Mt valokuva.";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    photo = reader.result;
    const img = new Image();
    img.onload = () => {
      state.photoRatio = img.naturalWidth / img.naturalHeight;
      render();
    };
    img.src = photo;
  };
  reader.readAsDataURL(file);
};
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-studio-format]");
  if (!b) return;
  const buttons = [...document.querySelectorAll("[data-studio-format]")],
    status = $("#editor-export-status");
  buttons.forEach((b) => (b.disabled = true));
  status.textContent = "Valmistellaan kalenteria…";
  try {
    const { makeExport } = await import("./studio/export-pipeline.mjs");
    const result = await makeExport(collect(), b.dataset.studioFormat, {
      onProgress: (p) => (status.textContent = p.message),
    });
    const url = URL.createObjectURL(result.blob),
      a = document.createElement("a");
    a.href = url;
    a.download = result.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent =
      "Kalenteri on valmis: " + result.name + " · " + result.dpi + " dpi.";
  } catch (err) {
    status.textContent = err.message;
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
});
render();
