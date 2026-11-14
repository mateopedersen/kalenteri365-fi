import overrides from '../data/seo-pages.json' with {type: 'json'};
import {flagDays} from './flagging-core.mjs';
import {MONTHS, SLUGS, YEARS, cap, daysInMonth, leap, weeksInYear, holidays, workStats} from './calendar.mjs';
import {phases} from './astronomy.mjs';
export {brandedTitle} from './seo-title.mjs';

const compact = value => String(value ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim();
const shortDate = value => new Intl.DateTimeFormat('fi-FI', {day:'numeric',month:'numeric',timeZone:'Europe/Helsinki'}).format(new Date(value));
const phaseCache = new Map();

function holidayDescription(base,year,month) {
  const entries=(base==='liputuspaivat'?flagDays(year).filter(h=>h.scope==='finland').map(h=>({...h,isFlagDay:true})):holidays(year)).filter(h=>(!month||Number(h.date.slice(5,7))===month)&&(
    base==='juhlapyhat'?['holiday','eve'].includes(h.type):base==='liputuspaivat'?h.type==='flag'||h.isFlagDay:h.type!=='holiday'
  ));
  const topic={juhlapyhat:'juhlapyhät ja aatot',liputuspaivat:'liputuspäivät',merkkipaivat:'merkkipäivät'}[base];
  const lead=month?`${cap(MONTHS[month-1])}n ${year} ${topic}`:`Suomen ${topic} ${year}`;
  const action={juhlapyhat:'Tarkista päivämäärät ja erota pyhäpäivä aatosta.',liputuspaivat:'Tarkista päivän luokitus ja liputusohjeet.',merkkipaivat:'Tutustu päivien taustoihin ja omiin muistutuksiin.'}[base];
  if(!month)return `${lead}: ${entries.length} merkintää. ${base==='liputuspaivat'?'Katso viralliset ja vakiintuneet liputuspäivät sekä niiden ajankohdat.':'Selaa päivämääriä ja viikonpäiviä, avaa päivän tausta ja lisää tärkeä päivä kalenteriin.'}`;
  if(!entries.length)return `${lead}. Kalenterissa ei ole tämän kuukauden ${base==='juhlapyhat'?'pyhäpäiviä tai aattoja':base==='liputuspaivat'?'liputuspäiviä':'merkkipäiviä'}. Vertaa muita kuukausia ja koko vuoden luetteloa.`;
  const count=`${entries.length} ${entries.length===1?'merkintä':'merkintää'}`;
  // Use complete names that fit a concise summary; never truncate an event name.
  const first=entries[0],example=`${first.name} ${shortDate(first.date+'T12:00:00Z')}`;
  const prefix=`${lead}: ${count}.`;
  return compact(`${prefix} ${prefix.length+example.length+action.length<175?example+' ':''}${action}`);
}

function lunarDescription(year,month) {
  if(!phaseCache.has(year))phaseCache.set(year,phases(year));
  const selected=phaseCache.get(year).filter(p=>Number(p.date.slice(5,7))===month);
  const dates=quarter=>selected.filter(p=>p.quarter===quarter).map(p=>shortDate(p.utc));
  const fresh=dates(0),full=dates(2),events=[];
  if(fresh.length)events.push(`${fresh.length===1?'Uusikuu':'Uusikuut'} ${fresh.join(' ja ')}`);
  if(full.length)events.push(`${full.length===1?'Täysikuu':'Täysikuut'} ${full.join(' ja ')}`);
  return `${cap(MONTHS[month-1])}n ${year} kuukalenteri. ${events.join(' ')} Päivän valaistus klo 12 Suomen aikaa sekä PDF- ja 600 dpi:n kuvapohjat.`;
}

export function pageMetadata(path, title, description) {
  let result = {title: compact(title), description: compact(description)};

  const [base, period, monthSlug] = path.split('/').filter(Boolean);
  const year = Number(period), month = SLUGS.indexOf(monthSlug) + 1;
  if (YEARS.includes(year)) {
    const label = month ? cap(MONTHS[month - 1]) + ' ' + year : String(year);
    if (base === 'kalenteri') {
      result.title = month ? cap(MONTHS[month-1])+'n '+year+' kalenteri' : 'Kalenteri ' + year + ' ja Suomen pyhät';
      result.description = month
        ? `${cap(MONTHS[month - 1])}n ${year} kalenteri: ${daysInMonth(year, month)} päivää, Suomen pyhät ja ISO-viikkonumerot. Avaa päivän tiedot tai valitse tulostettava pohja.`
        : `Vuoden ${year} kalenteri sisältää ${leap(year) ? 366 : 365} päivää ja ${weeksInYear(year)} ISO-viikkoa. Tarkista Suomen pyhät, selaa kuukausia ja valitse tulostettava kalenteri.`;
    }
    if (base === 'kuukausikalenteri') {
      result.title = month ? cap(MONTHS[month-1])+'n '+year+' tulostettava kalenteri' : 'Kuukausikalenterit ' + year + ' tulostettavaksi';
    }
    if (base === 'pdf-kalenteri') {
      result.title = month ? cap(MONTHS[month - 1]) + 'n ' + year + ' PDF-kalenterit' : 'PDF-kalenterit ' + year + ' | Vuosi ja kuukaudet';
      result.description = month
        ? `Valitse ${MONTHS[month - 1]}n ${year} kalenteri 15 ulkoasusta. Lataa vektori-PDF tai 600 dpi:n kuva ja tarkista kuukauden päivät esikatselusta.`
        : `Tulosta vuoden ${year} kalenteri: 15 vuosipohjaa sekä jokaisen kuukauden omat mallit. Lataa vektori-PDF tai 600 dpi:n kuva.`;
    }
    if (['juhlapyhat', 'liputuspaivat', 'merkkipaivat'].includes(base)) {
      if(month)result.title = label + ' | ' + {juhlapyhat: 'Suomen pyhät ja aatot', liputuspaivat: 'Suomen liputuspäivät', merkkipaivat: 'Juhlat ja merkkipäivät'}[base];
      result.description=holidayDescription(base,year,month);
    }
    if(base==='tyopaivat'&&month){
      const stats=workStats(year,month);
      result.description=`${label}: ${stats.workdays} työpäivää ja ${stats.hours.toLocaleString('fi-FI')} tuntia oletuksilla ma–pe ja 7,5 h/päivä. Pyhät vähennetään; muuta aattojen käsittelyä laskurissa.`;
    }
    if(base==='kuukalenteri'&&month){
      result.description=lunarDescription(year,month);
    }
    if (base === 'viikkokalenteri' && /^viikko-\d+$/.test(monthSlug || '')) {
      result.title = `Viikkokalenteri ${year} | Viikko ${Number(monthSlug.slice(7))}`;
    }
  }

  result={...result,...overrides[path]};
  return {title:compact(result.title),description:compact(result.description)};
}

export function assertUniqueMetadata(metadata, path, inventory) {
  for (const key of ['title', 'description']) {
    const value = compact(metadata[key]).toLocaleLowerCase('fi-FI');
    if (!value) throw new Error(`Missing SEO ${key}: ${path}`);
    const other = inventory[key].get(value);
    if (other) throw new Error(`Duplicate SEO ${key}: ${path} and ${other}`);
    inventory[key].set(value, path);
  }
}
