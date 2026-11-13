import {blogPages} from './blog.mjs';
import {
  MONTHS,
  SLUGS,
  YEARS,
  holidays,
  parse,
  fi,
  cap,
  SOURCES,
} from "../src/calendar.mjs";
import {photo} from '../src/photos.mjs';
import {esc} from '../src/ui.mjs';
export async function extraPages({
  page,
  section,
  table,
  notice,
  toolCards,
  link,
  art,
}) {
  await page(
    "/tahtitieteellinen-kalenteri/",
    "Tähtitieteellinen kalenteri Suomessa",
    "Aurinko, Kuu, vuodenajat ja pimennykset Suomen ajassa.",
    `<div class="feature-banner">${art("moon")}<div><h2>Taivas kuuluu jokaiseen vuodenaikaan.</h2><p>Valitse ilmiö ja paikkakunta. Erota laskettu ajankohta paikallisesta näkyvyydestä.</p></div></div>` +
      toolCards(
        (await import("../src/ui.mjs")).tools.filter(
          (t) => t[4] === "Luonto ja taivas" && t[0] !== "kylvokalenteri",
        ),
      ),
  );
  await blogPages(page);
  for (let m = 1; m <= 12; m++)
    await page(
      "/merkkipaivat/" + SLUGS[m - 1] + "/",
      cap(MONTHS[m - 1]) + " – Suomen juhlat ja merkkipäivät",
      `Katso ${MONTHS[m - 1]}n pyhäpäivät, liputuspäivät ja muut muistettavat päivät vuosina 2027–2030.`,
      YEARS.map((y) =>
        section(
          cap(MONTHS[m - 1]) + " " + y,
          table(
            ["Päivä", "Juhla", "Tyyppi"],
            holidays(y)
              .filter((h) => +h.date.slice(5, 7) === m)
              .map((h) => [
                fi(parse(h.date)),
                link("/juhlapyhat/" + h.slug + "/", h.name),
                {
                  flag: "Liputuspäivä",
                  holiday: "Pyhäpäivä",
                  eve: "Aatto",
                  observance: "Merkkipäivä",
                }[h.type],
              ]),
          ),
        ),
      ).join(""),
    );
}
