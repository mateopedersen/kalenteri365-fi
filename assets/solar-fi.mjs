import { localDayBounds } from "./solar-day.mjs";
import { createSolarPanorama } from "./solar-panorama.mjs";
import { panoramaView } from "./solar-panorama-core.mjs";
import { atmosphere } from "./sun-scene-core.mjs";
import { CITIES } from "./calendar.mjs";
const canvas = document.querySelector("#solar-canvas");
export function connectSolar(A, form, events = {}) {
  if (!canvas) return;
  window.fiSolar?.destroy?.();
  let minute = Number(document.querySelector("#solar-minute").value),
    playing = false,
    frame = 0,
    last = 0;
  const painter = createSolarPanorama(canvas),
    range = document.querySelector("#solar-minute"),
    place = document.querySelector("#solar-place"),
    reduced = matchMedia("(prefers-reduced-motion: reduce)"),
    landscape = document.querySelector("#solar-landscape");
  const bounds = () => localDayBounds(form.elements.date.value);
  range.max = Math.round((bounds().end - bounds().start) / 60000) - 1;
  minute = Math.min(minute, Number(range.max));
  function draw() {
    const city =
        CITIES.find((c) => c[0] === form.elements.city.value) || CITIES[0],
      instant = new Date(+bounds().start + minute * 60000),
      observer = new A.Observer(city[2], city[3], 0),
      eq = A.Equator("Sun", instant, observer, true, true),
      position = A.Horizon(instant, observer, eq.ra, eq.dec, "normal"),
      snapshot = {
        position,
        instant,
        city: { lat: city[2], lon: city[3], name: city[1] },
      };
    painter.draw(
      panoramaView(snapshot, { follow: true, landscape: landscape.value }),
      0,
    );
    place.textContent = city[1];
    document.querySelector("#solar-coordinates").textContent =
      city[2].toFixed(3) + "° N · " + city[3].toFixed(3) + "° E";
    document.querySelector("#solar-light").textContent = atmosphere(
      position.altitude,
    ).label;
    const label = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Helsinki",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(instant);
    document.querySelector("#solar-time-label").textContent = label;
    document.querySelector("#solar-clock").textContent = label;
  }
  function tick(now) {
    if (!playing) return;
    if (now - last > 100) {
      minute = (minute + 4) % (Number(range.max) + 1);
      range.value = minute;
      draw();
      last = now;
    }
    frame = requestAnimationFrame(tick);
  }
  range.oninput = () => {
    minute = Number(range.value);
    draw();
  };
  landscape.onchange = draw;
  document.querySelector("#solar-play").onclick = () => {
    playing = !playing;
    document.querySelector("#solar-play").textContent = playing
      ? "Pysäytä"
      : "Toista päivä";
    if (playing) {
      const stage=document.querySelector('.solar-stage'),rect=stage.getBoundingClientRect();
      if(rect.top<0||rect.bottom>innerHeight)stage.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
      if (reduced.matches) {
        minute = (minute + 60) % (Number(range.max) + 1);
        range.value = minute;
        draw();
        playing = false;
        document.querySelector("#solar-play").textContent = "Toista päivä";
      } else tick(0);
    } else cancelAnimationFrame(frame);
  };
  document.querySelectorAll("[data-solar-jump]").forEach((b) => {
    const key = b.dataset.solarJump;
    b.disabled = key !== "noon" && !events[key];
    b.onclick = () => {
      const event=key==='noon'?events.noon:events[key];
      if(!event)return;
      minute=Math.round((new Date(event)-bounds().start)/60000);
      range.value = minute;
      draw();
      const stage = document.querySelector(".solar-stage"),
        stageBounds = stage.getBoundingClientRect();
      if (stageBounds.top < 0 || stageBounds.bottom > innerHeight)
        stage.scrollIntoView({
          behavior: reduced.matches ? "instant" : "smooth",
          block: "start",
        });
    };
  });
  const resize = new ResizeObserver(draw);
  resize.observe(painter.canvas);
  draw();
  window.fiSolar = {
    destroy() {
      playing = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      painter.destroy();
    },
  };
}
