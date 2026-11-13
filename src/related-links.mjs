// Related reading follows the visitor's subject, place and period. Each slot is
// one useful next step; its later entries are fallbacks when a route is absent.
// Keep this module independent of rendering so every target can be audited.
const MONTHS = ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesakuu', 'heinakuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'];
const route = (...parts) => '/' + parts.filter(Boolean).join('/') + '/';
const hub = base => [route(base)];
const guide = slug => hub('blogi/' + slug);
const period = (base, year, month) => [...(year && month ? [route(base, year, month)] : []), ...(year ? [route(base, year)] : []), route(base)];
const place = (base, city, year) => [...(city && year ? [route(base, city, year)] : []), ...(city ? [route(base, city)] : []), route(base)];
const skyPlaces = new Set(['auringonnousu-ja-lasku', 'kuun-nousu-ja-lasku', 'paivan-pituus']);
const calendarFamilies = new Set(['kalenteri', 'kuukausikalenteri', 'pdf-kalenteri']);
const publicDays = new Set(['juhlapyhat', 'liputuspaivat', 'merkkipaivat']);

const BLOG_RELATED = {
  'viikkonumerot': ['viikkonumerot', 'viikkokalenteri', 'kalenteri'],
  'juhannus-suomessa': ['juhlapyhat/juhannuspaiva', 'pitkat-viikonloput', 'lomasuunnittelija'],
  'perheen-viikko': ['perhekalenteri', 'viikkokalenteri', 'koulujen-lomat'],
  'tyopaivat-ja-aatot': ['tyopaivalaskuri', 'tyopaivat', 'juhlapyhat'],
  'koulujen-lomat': ['koulujen-lomat', 'koulukalenteri', 'perhekalenteri'],
  'auringon-ajat': ['auringonnousu-ja-lasku', 'paivan-pituus', 'vuodenajat'],
  'kuun-vaiheet': ['kuukalenteri', 'kuun-vaiheet', 'kuun-nousu-ja-lasku'],
  'kalenterin-tulostus': ['pdf-kalenteri', 'kuukausikalenteri', 'luo-kalenteri'],
  'kalenterin-varmuuskopio': ['oma-arki', 'tietosuoja', 'usein-kysyttya'],
  'syksyn-suunnittelu': ['perhekalenteri', 'koulujen-lomat', 'opiskelukalenteri'],
  'karkausvuosi-2028': ['karkausvuosi', 'kalenteri/2028/helmikuu', 'paivamaaralaskuri'],
  'kesaaika-ja-talviaika': ['kellonsiirto', 'tyovuorosuunnittelija', 'paivamaaralaskuri'],
  'paasiaisen-paivamaara': ['juhlapyhat/paasiaispaiva', 'juhlapyhat', 'lomasuunnittelija'],
  'liputuspaiva-vai-pyhapaiva': ['liputuspaivat', 'juhlapyhat', 'merkkipaivat'],
  'oman-kalenterin-suunnittelu': ['luo-kalenteri', 'tyhja-kalenteri', 'pdf-kalenteri'],
  'kylvot-suomen-kevaassa': ['kylvokalenteri', 'vuodenajat', 'paivan-pituus'],
  'nousevan-merkin-syntymaaika': ['horoskooppi', 'horoskooppimerkki', 'tietosuoja'],
  'opintoperiodit-ja-tentit': ['yliopistojen-kalenterit', 'opiskelukalenteri', 'lukujarjestys'],
  'yovuoron-kalenteri': ['tyovuorosuunnittelija', 'kellonsiirto', 'tyopaivalaskuri'],
  'pitkan-vapaan-suunnittelu': ['lomasuunnittelija', 'pitkat-viikonloput', 'koulujen-lomat'],
};

const TOPIC_RELATED = {
  'oma-arki': ['viikkokalenteri', 'perhekalenteri', 'paivasuunnittelija'],
  'tyokalut': ['kalenteri', 'oma-arki', 'tahtitieteellinen-kalenteri'],
  'luo-kalenteri': ['tyhja-kalenteri', 'pdf-kalenteri', 'blogi/oman-kalenterin-suunnittelu'],
  'tyhja-kalenteri': ['luo-kalenteri', 'kuukausikalenteri', 'blogi/kalenterin-tulostus'],
  'perhekalenteri': ['viikkokalenteri', 'koulujen-lomat', 'blogi/perheen-viikko'],
  'paivasuunnittelija': ['viikkokalenteri', 'oma-arki', 'opiskelukalenteri'],
  'syntymapaivakalenteri': ['nimipaivat', 'oma-arki', 'paivalaskuri'],
  'nimipaivat': ['syntymapaivakalenteri', 'merkkipaivat', 'oma-arki'],
  'lukujarjestys': ['koulukalenteri', 'opiskelukalenteri', 'koulujen-lomat'],
  'koulukalenteri': ['koulujen-lomat', 'lukujarjestys', 'perhekalenteri'],
  'opiskelukalenteri': ['yliopistojen-kalenterit', 'lukujarjestys', 'blogi/opintoperiodit-ja-tentit'],
  'ylioppilaskirjoitukset': ['opiskelukalenteri', 'hakukalenteri', 'paivalaskuri'],
  'hakukalenteri': ['ylioppilaskirjoitukset', 'opiskelukalenteri', 'yliopistojen-kalenterit'],
  'paivamaaralaskuri': ['tyopaivalaskuri', 'paivalaskuri', 'vuoden-paiva'],
  'paivalaskuri': ['paivamaaralaskuri', 'tyopaivalaskuri', 'oma-arki'],
  'tyopaivalaskuri': ['tyopaivat', 'paivamaaralaskuri', 'lomasuunnittelija'],
  'viikkonumerot': ['viikkokalenteri', 'kalenteri', 'blogi/viikkonumerot'],
  'vuoden-paiva': ['paivamaaralaskuri', 'karkausvuosi', 'kalenteri'],
  'karkausvuosi': ['kalenteri/2028/helmikuu', 'paivamaaralaskuri', 'blogi/karkausvuosi-2028'],
  'lomasuunnittelija': ['pitkat-viikonloput', 'tyopaivalaskuri', 'koulujen-lomat'],
  'tyovuorosuunnittelija': ['tyopaivalaskuri', 'kellonsiirto', 'blogi/yovuoron-kalenteri'],
  'elakkeiden-maksupaivat': ['etuuksien-maksupaivat', 'oma-arki', 'paivalaskuri'],
  'etuuksien-maksupaivat': ['elakkeiden-maksupaivat', 'oma-arki', 'paivalaskuri'],
  'verokalenteri': ['tyopaivalaskuri', 'paivamaaralaskuri', 'oma-arki'],
  'kausimuistutukset': ['vuodenajat', 'oma-arki', 'paivalaskuri'],
  'kuun-vaiheet': ['kuukalenteri', 'taysikuu', 'uusikuu'],
  'taysikuu': ['kuukalenteri', 'kuun-nousu-ja-lasku', 'kuunpimennys'],
  'uusikuu': ['kuukalenteri', 'kuun-nousu-ja-lasku', 'kuun-vaiheet'],
  'vuodenajat': ['paivan-pituus', 'kellonsiirto', 'kylvokalenteri'],
  'kellonsiirto': ['tyovuorosuunnittelija', 'paivan-pituus', 'blogi/kesaaika-ja-talviaika'],
  'auringonpimennys': ['auringonnousu-ja-lasku', 'kuunpimennys', 'tahtitieteellinen-kalenteri'],
  'kuunpimennys': ['kuun-nousu-ja-lasku', 'taysikuu', 'auringonpimennys'],
  'perseidit': ['auringonnousu-ja-lasku', 'kuukalenteri', 'tahtitieteellinen-kalenteri'],
  'tahtitieteellinen-kalenteri': ['kuukalenteri', 'auringonnousu-ja-lasku', 'perseidit'],
  'horoskooppimerkki': ['horoskooppi', 'blogi/nousevan-merkin-syntymaaika', 'syntymapaivakalenteri'],
  'tietoa': ['toimitusperiaatteet', 'lahteet', 'yhteystiedot'],
  'lahteet': ['toimitusperiaatteet', 'yhteystiedot', 'tietoa'],
  'toimitusperiaatteet': ['lahteet', 'yhteystiedot', 'tietoa'],
  'yhteystiedot': ['usein-kysyttya', 'saavutettavuus', 'toimitusperiaatteet'],
  'tietosuoja': ['evasteet', 'kayttoehdot', 'yhteystiedot'],
  'evasteet': ['tietosuoja', 'kayttoehdot', 'yhteystiedot'],
  'kayttoehdot': ['tietosuoja', 'valokuvat-ja-lisenssit', 'yhteystiedot'],
  'saavutettavuus': ['yhteystiedot', 'usein-kysyttya', 'toimitusperiaatteet'],
  'valokuvat-ja-lisenssit': ['kayttoehdot', 'lahteet', 'yhteystiedot'],
  'usein-kysyttya': ['oma-arki', 'lahteet', 'yhteystiedot'],
  'oppaat': ['blogi', 'tyokalut', 'usein-kysyttya'],
  'blogi': ['oppaat', 'tyokalut', 'lahteet'],
};

const RELATED_CROP = {
  tomaatti: 'paprika', paprika: 'tomaatti', kurkku: 'avomaankurkku', avomaankurkku: 'kurkku',
  herne: 'porkkana', peruna: 'sipuli', porkkana: 'retiisi', basilika: 'persilja', persilja: 'basilika',
  salaatti: 'retiisi', retiisi: 'salaatti', kesakurpitsa: 'avomaankurkku', sipuli: 'porkkana',
};

function weekMonth(year, week) {
  if (!year || !/^viikko-\d+$/.test(week || '')) return null;
  const fourth = new Date(Date.UTC(Number(year), 0, 4));
  fourth.setUTCDate(fourth.getUTCDate() - (fourth.getUTCDay() + 6) % 7 + (Number(week.slice(7)) - 1) * 7);
  // January's ISO week may begin in the preceding unsupported calendar year.
  return fourth.getUTCFullYear() === Number(year) ? MONTHS[fourth.getUTCMonth()] : null;
}

function slotsFor(bits) {
  const [base, second, third] = bits;
  const year = /^20(?:27|28|29|30)$/.test(second || '') ? second : null;
  const month = MONTHS.includes(third) ? third : null;
  if (calendarFamilies.has(base)) {
    if (base === 'pdf-kalenteri') return [period('kalenteri', year, month), period('kuukausikalenteri', year, month), hub('luo-kalenteri')];
    if (base === 'kuukausikalenteri') return [period('kalenteri', year, month), period('pdf-kalenteri', year, month), hub('luo-kalenteri')];
    return [period('pdf-kalenteri', year, month), period('juhlapyhat', year, month), period('viikkokalenteri', year)];
  }
  if (base === 'viikkokalenteri') {
    const week = weekMonth(year, third);
    return [period('kalenteri', year, week), hub('perhekalenteri'), third ? period('tyopaivat', year, week) : hub('viikkonumerot')];
  }
  if (base === 'tyopaivat') return [hub('tyopaivalaskuri'), period('juhlapyhat', year, month), period('kalenteri', year, month)];
  if (base === 'pitkat-viikonloput') return [hub('lomasuunnittelija'), period('juhlapyhat', year), guide('pitkan-vapaan-suunnittelu')];
  if (publicDays.has(base)) {
    if (base === 'juhlapyhat' && second && !year) {
      const article = /paasiai|pitkaperjantai|helatorstai|helluntai/.test(second) ? 'paasiaisen-paivamaara' : /juhannus/.test(second) ? 'juhannus-suomessa' : 'liputuspaiva-vai-pyhapaiva';
      return [hub('juhlapyhat'), guide(article), hub('merkkipaivat')];
    }
    if (base === 'juhlapyhat') return [period('kalenteri', year, month), period('liputuspaivat', year, month), hub('lomasuunnittelija')];
    if (base === 'liputuspaivat') return [period('merkkipaivat', year, month), period('juhlapyhat', year, month), guide('liputuspaiva-vai-pyhapaiva')];
    return [period('juhlapyhat', year, month), period('liputuspaivat', year, month), guide('liputuspaiva-vai-pyhapaiva')];
  }
  if (skyPlaces.has(base)) {
    const city = second || null, localYear = /^20(?:27|28|29|30)$/.test(third || '') ? third : null;
    if (base === 'kuun-nousu-ja-lasku') return [place('auringonnousu-ja-lasku', city, localYear), place('paivan-pituus', city, localYear), period('kuukalenteri', localYear)];
    return [place(base === 'paivan-pituus' ? 'auringonnousu-ja-lasku' : 'paivan-pituus', city, localYear), place('kuun-nousu-ja-lasku', city, localYear), guide('auringon-ajat')];
  }
  if (base === 'kuukalenteri') return [hub('kuun-vaiheet'), hub('kuun-nousu-ja-lasku'), guide('kuun-vaiheet')];
  if (base === 'koulujen-lomat') return [hub('koulukalenteri'), hub('perhekalenteri'), guide('koulujen-lomat')];
  if (base === 'yliopistojen-kalenterit') return [hub('opiskelukalenteri'), hub('lukujarjestys'), guide('opintoperiodit-ja-tentit')];
  if (base === 'kylvokalenteri') return second
    ? [hub('kylvokalenteri'), ...(RELATED_CROP[second] ? [hub('kylvokalenteri/' + RELATED_CROP[second])] : []), guide('kylvot-suomen-kevaassa')]
    : [guide('kylvot-suomen-kevaassa'), hub('vuodenajat'), hub('paivan-pituus')];
  if (base === 'horoskooppi') return [hub('horoskooppimerkki'), guide('nousevan-merkin-syntymaaika'), hub(second ? 'horoskooppi' : 'syntymapaivakalenteri')];
  if (base === 'blogi' && second && BLOG_RELATED[second]) return BLOG_RELATED[second].map(hub);
  if (TOPIC_RELATED[base]) return TOPIC_RELATED[base].map(hub);
  return [hub('kalenteri'), hub('tyokalut'), hub('usein-kysyttya')];
}

/** Return at most three distinct related page routes, optionally checked against a catalog. */
export function relatedRoutes(currentPath, { catalog } = {}) {
  const path = '/' + String(currentPath || '').split(/[?#]/)[0].split('/').filter(Boolean).join('/') + '/';
  const normalizedPath = path === '//' ? '/' : path;
  const bits = normalizedPath.split('/').filter(Boolean);
  if (!bits.length || ['404', 'haku', 'sivukartta', 'sv'].includes(bits[0])) return [];
  const available = catalog == null ? null : catalog instanceof Set ? catalog : new Set(Array.from(catalog, item => typeof item === 'string' ? item : item.path));
  const selected = [];
  for (const choices of slotsFor(bits)) {
    const target = choices.find(href => href !== normalizedPath && !selected.includes(href) && (!available || available.has(href)));
    if (target) selected.push(target);
    if (selected.length === 3) break;
  }
  return selected;
}
