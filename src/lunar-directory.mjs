import {PHOTO_CREDITS} from './photos.mjs';
import {YEARS, MONTHS, SLUGS, cap} from './calendar.mjs';
import {esc, icon, link} from './ui.mjs';

const covers = {
  2027: 'moon-apollo17',
  2028: 'moon-keeler',
  2029: 'moon-bruce',
  2030: 'moon-artemis-earthrise',
};

function moonPhoto(id, {priority = false, className = '', sizes} = {}) {
  const photo = PHOTO_CREDITS.find(photo => photo.id === id);
  if (!photo) throw new Error('Missing lunar cover: ' + id);
  const stem = photo.src.slice(0, -5);
  const set = extension => `${stem}-320.${extension} 320w, ${stem}-640.${extension} 640w, ${stem}.${extension} ${photo.width}w`;
  return `<picture class="${className}"><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><img src="${stem}-640.webp" srcset="${set('webp')}" sizes="${sizes}" width="${photo.width}" height="${photo.height}" alt="${esc(photo.alt)}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}

export function lunarDirectory() {
  return `<section class="lunar-photo-intro"><div class="lunar-intro-copy"><p class="eyebrow">TAIVAS SUOMEN AJASSA</p><h2>Kuu, päivä päivältä.</h2><p>Valitse vuosi ja kuukausi. Tutki Kuun valaistusta, tarkista vaiheiden ajankohdat ja lataa oma kuukalenteri.</p></div>${moonPhoto('moon-apollo17', {priority:true, className:'lunar-intro-photo', sizes:'(max-width:600px) 220px, 320px'})}</section><div class="moon-directory">${YEARS.map(year => {
    const id = covers[year], photo = PHOTO_CREDITS.find(photo => photo.id === id);
    return `<section class="moon-directory-year"><a class="moon-year-cover ${id}" href="/kuukalenteri/${year}/" aria-label="Avaa vuoden ${year} kuukalenteri">${moonPhoto(id, {className:'moon-year-photo', sizes:'(max-width:700px) 90vw, (max-width:1600px) 44vw, 680px'})}<div class="moon-year-copy"><p class="eyebrow">KUUN VUOSI</p><h2>${year}</h2><span class="moon-year-open">Vuoden vaiheet ${icon('arrow')}</span></div><span class="moon-photo-credit">${esc(photo.author)}</span></a><nav aria-label="Kuukaudet ${year}">${MONTHS.map((month, i) => link(`/kuukalenteri/${year}/${SLUGS[i]}/`, `<span>${String(i+1).padStart(2,'0')}</span>${cap(month)}`)).join('')}</nav></section>`;
  }).join('')}</div>`;
}
