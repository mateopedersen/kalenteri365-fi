import scenes from '../data/season-scenes.json' with {type:'json'};
import {YEARS,fi,parse} from './calendar.mjs';
import {esc} from './ui.mjs';

const names=['kevat','kesa','syksy','talvi'];
const copy=[
 'Valo lisääntyy ja luonto herää. Lumi sulaa ja kasvukausi käynnistyy eri puolilla Suomea eri aikaan.',
 'Pitkät päivät ja vehreä luonto kuuluvat Suomen kesään. Pohjoisessa Aurinko voi pysyä horisontin yläpuolella läpi yön.',
 'Puut saavat ruskan värit ja päivät lyhenevät. Viilenevät yöt muuttavat maisemaa rannikolta tuntureille.',
 'Lumi, pakkanen ja lyhyet päivät muovaavat maisemaa. Pohjoisessa on kaamos, jonka jälkeen valo alkaa lisääntyä.'
];

export function seasonPicture(scene,lazy=true){
 const base='/assets/seasons/'+scene.id;
 return `<picture class="season-picture"><source type="image/avif" srcset="${base}-360.avif 360w, ${base}-720.avif 720w, ${base}-1200.avif 1200w"><img src="${base}-720.webp" srcset="${base}-360.webp 360w, ${base}-720.webp 720w, ${base}-1200.webp 1200w" sizes="(max-width: 600px) calc(100vw - 44px), (max-width: 1050px) calc(50vw - 48px), (max-width: 1560px) calc(25vw - 38px), 355px" width="1536" height="1024" alt="${esc(scene.alt)}" loading="${lazy?'lazy':'eager'}" decoding="async"></picture>`;
}

export function seasonPage(seasons){
 return `<div class="season-selector no-print"><label for="season-year">Valitse vuosi</label><select id="season-year">${YEARS.map(y=>`<option value="${y}">${y}</option>`).join('')}</select></div>`+
 YEARS.map((year,yi)=>`<section class="content-section season-year" data-season-year="${year}" ${yi?'hidden':''} aria-labelledby="season-heading-${year}"><div class="season-section-heading"><h2 id="season-heading-${year}">Vuodenajat ${year}</h2><span>Suomen aikaa</span></div><div class="season-grid">${seasons[year].map((s,i)=>{
  const scene=scenes.find(x=>x.year===year&&x.season===names[i]);
  if(!scene)throw Error(`Missing seasonal illustration: ${year} ${names[i]}`);
  return `<article class="season season-${scene.season}">${seasonPicture(scene,yi>0)}<div class="season-copy"><p class="eyebrow">${i%2?'PÄIVÄNSEISAUS':'PÄIVÄNTASAUS'}</p><h3>${scene.name}</h3><div class="season-date"><time datetime="${s.date}">${fi(parse(s.date))}</time><strong>${s.time}</strong></div><p class="season-description">${copy[i]}</p></div></article>`;
 }).join('')}</div></section>`).join('')+
 `<p class="season-visual-note">Maisemat ovat vuodenaikoja havainnollistavaa digitaalista 3D-kuvitusta. Päivämäärät kertovat tähtitieteellisen vuodenajan alkamisesta, eivät paikallisen sään muuttumisesta.</p>`;
}

export const seasonImageSchema=scenes.map(scene=>({'@type':'ImageObject',contentUrl:'https://kalenteri365.fi/assets/seasons/'+scene.id+'-1200.webp',caption:scene.alt,creator:{'@type':'Organization',name:'Kalenteri365'},creditText:'Kalenteri365 · tekoälyavusteinen digitaalinen kuvitus',license:'https://kalenteri365.fi/valokuvat-ja-lisenssit/#vuodenaikojen-kuvitus',acquireLicensePage:'https://kalenteri365.fi/valokuvat-ja-lisenssit/#vuodenaikojen-kuvitus'}));

export function seasonCredits(){return `<section id="vuodenaikojen-kuvitus"><h2>Vuodenaikojen 3D-kuvitus</h2><p>Vuosien 2027–2030 vuodenaikakortteihin on tehty 16 erillistä, tekoälyavusteista digitaalista maisemakuvaa. Kuvitukset havainnollistavat Suomen luontoa. Ne eivät ole valokuvia nimetyistä paikoista tai tulevien vuosien säästä. Kuvien käyttöön muualla voi pyytää luvan sivuston ylläpidolta.</p><div class="season-credit-grid">${scenes.map(scene=>`<figure>${seasonPicture(scene)}<figcaption>${scene.name} ${scene.year} · Kalenteri365</figcaption></figure>`).join('')}</div></section>`;}
