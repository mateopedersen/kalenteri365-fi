import {photo} from './photos.mjs';
import {relatedRoutes} from './related-links.mjs';
import {tools, toolCards} from './ui.mjs';
import {MONTHS, SLUGS, CITIES, cap} from './calendar.mjs';
import finlandData from '../data/finland.json' with {type:'json'};
import blogArticles from '../data/blog.json' with {type:'json'};
import holidayStories from '../data/holiday-stories.json' with {type:'json'};
const relatedInfo = {
  "oma-arki": ["Oma arki", "Kokoa omat tapahtumat, muistiinpanot ja muistettavat päivät.", "dayplan"],
  "tahtitieteellinen-kalenteri": ["Tähtitieteellinen kalenteri", "Kuun vaiheet, pimennykset ja muut taivaan tapahtumat Suomen ajassa.", "astronomy"],
  tietoa: ["Tietoa Kalenteri365:stä", "Tutustu sivuston tarkoitukseen ja ylläpitoon.", "calendar"],
  lahteet: ["Lähteet ja laskentatavat", "Tarkista tietojen alkuperä ja laskelmien rajaukset.", "edit"],
  toimitusperiaatteet: ["Toimitusperiaatteet", "Näin sisältöä tarkistetaan ja korjataan.", "edit"],
  yhteystiedot: ["Ota yhteyttä", "Lähetä palaute tai kerro havaitsemastasi virheestä.", "contact"],
  tietosuoja: ["Tietosuoja", "Tutustu henkilötietojen käsittelyyn ja omiin oikeuksiisi.", "edit"],
  evasteet: ["Evästeet ja tallennus", "Tarkista, mitä tietoja selaimeen tallennetaan.", "edit"],
  kayttoehdot: ["Käyttöehdot", "Lue palvelun ja aineistojen käyttöä koskevat ehdot.", "edit"],
  saavutettavuus: ["Saavutettavuus", "Tietoa näppäimistökäytöstä ja palautteen antamisesta.", "edit"],
  "valokuvat-ja-lisenssit": ["Valokuvat ja lisenssit", "Kuvien tekijät, alkuperä ja käyttöehdot.", "image"],
  "usein-kysyttya": ["Usein kysyttyä", "Vastauksia kalenterien ja työkalujen käyttöön.", "tools"],
  oppaat: ["Oppaat", "Käytännön ohjeita päivämäärien ja suunnitelmien käsittelyyn.", "edit"],
  blogi: ["Blogi ja oppaat", "Lue lisää kalentereista, ajankohdista ja suunnittelusta.", "edit"],
};
const shortIntro = text => text.match(/^.*?(?:(?<!\d)\.|[!?])(?:\s|$)/u)?.[0].trim() || text;
export function relatedCard(href) {
  const [base, second, third] = href.split("/").filter(Boolean);
  const tool = tools.find(t => t[0] === base);
  let [title, description, illustration] = tool ? tool.slice(1, 4) : relatedInfo[base] || ["Kalenterit ja työkalut", "Löydä suunnitelmaasi sopiva näkymä.", "calendar"];
  const year = /^20(?:27|28|29|30)$/.test(second || "") ? second : null;
  if (base === "blogi" && second) {
    const article = blogArticles.find(article => article.slug === second);
    if (article) { title = article.title; description = shortIntro(article.intro); illustration = ({gift:"celebrations", seedling:"garden", zodiac:"star", suitcase:"vacation"})[article.art] || article.art; }
  } else if (base === "kylvokalenteri" && second) {
    const crop = finlandData.crops.find(crop => crop.slug === second);
    if (crop) return [base + "/" + second, crop.name, shortIntro(crop.outdoorRule_fi || crop.window_fi), "garden", "", href, photo("crop-" + second, {className:"art", sizes:"64px"})];
  } else if (base === "juhlapyhat" && second && !year) {
    const story = holidayStories[second];
    if (story) { title = story.heading; description = shortIntro(story.paragraphs[0]); illustration = "celebrations"; }
  } else if (["auringonnousu-ja-lasku", "kuun-nousu-ja-lasku", "paivan-pituus"].includes(base) && second) {
    const city = CITIES.find(c => c[0] === second)?.[1];
    if (city) {
      title = `${city}: ${title.toLocaleLowerCase("fi")}${third ? " " + third : ""}`;
      const localSubject = {"auringonnousu-ja-lasku":"Auringonnousu, auringonlasku ja hämärän ajat", "kuun-nousu-ja-lasku":"Kuun nousu, lasku ja korkein kohta taivaalla", "paivan-pituus":"Valoisan ajan pituus ja sen vaihtelu vuoden aikana"}[base];
      description = `${localSubject}. ${city}${third ? " " + third : ""}: ajat Suomen aikavyöhykkeellä.`;
    }
  } else if (year) {
    const month = SLUGS.indexOf(third);
    title = month >= 0 ? `${cap(MONTHS[month])} ${year}: ${title.toLocaleLowerCase("fi")}` : `${title} ${year}`;
    const period = month >= 0 ? `${cap(MONTHS[month])} ${year}` : `Vuosi ${year}`;
    const subjects = {
      kalenteri: "Päivät, viikkonumerot ja Suomen pyhät yhdessä näkymässä.",
      kuukausikalenteri: "Kuukausinäkymä menojen ja omien suunnitelmien järjestämiseen.",
      "pdf-kalenteri": "Valitse ulkoasu ja lataa tulostettava PDF tai kuva.",
      juhlapyhat: "Tarkista pyhäpäivät, aatot ja niiden merkitys kalenterissa.",
      liputuspaivat: "Katso liputuspäivät ja tutustu niiden taustoihin.",
      merkkipaivat: "Muistettavat päivät ja niiden aiheisiin liittyvät artikkelit.",
      tyopaivat: "Vertaile työpäivien ja laskennallisten työtuntien määriä.",
      viikkokalenteri: "Valitse ISO-viikko ja järjestä viikon suunnitelmat.",
      kuukalenteri: "Päivittäinen Kuun valaistus ja tarkat vaihehetket.",
    };
    description = `${period}. ${subjects[base] || description}`;
  }
  return [base, title, description, illustration, "", href];
}
export function relatedTopics(path, {exclude = new Set()} = {}) {
  const related = relatedRoutes(path).filter(target => !exclude.has(target)).map(relatedCard);
  if (!related.length) return "";
  return `<section class="related-content" aria-labelledby="related-content-title"><div class="section-heading"><h2 id="related-content-title">Jatka tästä</h2><span>Aiheeseen liittyvää</span></div>${toolCards(related)}</section>`;
}
