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
import guides from '../data/guides.json' with {type:'json'};
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
  await page('/oppaat/','Kalenterioppaat arjen suunnitteluun','20 käytännön opasta Suomen kalenteriin, juhlapäiviin, työvuoroihin ja oman ajan suunnitteluun.',
    `<p class="education-intro">Selkeät vastaukset kalenterin tavallisiin kysymyksiin. Jokaisessa oppaassa on käytännön esimerkkejä ja sopivat työkalut jatkoon.</p><div class="cards guide-directory">${guides.map(g=>link('/oppaat/'+g.slug+'/',`<div class="guide-cover">${photo(g.photo,{sizes:'(max-width:600px) 95vw, 30vw'})}</div><div class="education-card-copy"><h2>${esc(g.title)}</h2><p>${esc(g.intro)}</p><span class="topic-open">Lue opas →</span></div>`,'tool-card')).join('')}</div>`);
  for(const g of guides)await page('/oppaat/'+g.slug+'/',g.title,g.intro,
    `<article class="long-text original-guide"><figure class="guide-lead">${photo(g.photo,{lazy:false,sizes:'(max-width:800px) 95vw, 780px'})}</figure><p class="guide-intro">${esc(g.intro)}</p>${g.sections.map(s=>`<section><h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('')}<section class="guide-tools"><h2>Kokeile omilla tiedoillasi</h2><div class="actions">${g.links.map((url,i)=>link(url,['Avaa aiheeseen liittyvä työkalu','Katso myös','Jatka suunnittelua'][i],'btn '+(i?'secondary':''))).join('')}</div></section><section class="guide-references"><h2>Lisätietoa alkuperäisistä lähteistä</h2><ul>${g.sources.map(([u,t])=>`<li>${link(u,esc(t))}</li>`).join('')}</ul></section></article>`);
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
