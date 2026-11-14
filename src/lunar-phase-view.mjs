import {illuminatedPath} from './lunar.mjs';
import {fi,parse} from './calendar.mjs';
import {time} from './astronomy.mjs';

const descriptions=[
  'Kuun näkyvä puoli on pimeä.',
  'Oikea puolisko on valaistuna.',
  'Koko Kuun kiekko on valaistuna.',
  'Vasen puolisko on valaistuna.',
];

export function phaseDisc(quarter,id){
  return `<svg class="phase-moon" viewBox="0 0 120 120" role="img" aria-label="${descriptions[quarter]}">
    <defs>
      <clipPath id="${id}-disc"><circle cx="60" cy="60" r="48"/></clipPath>
      <clipPath id="${id}-light"><path d="${illuminatedPath(quarter*90)}" transform="translate(10 10)"/></clipPath>
      <radialGradient id="${id}-limb" cx="42%" cy="38%" r="66%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#01060d" stop-opacity=".45"/></radialGradient>
    </defs>
    <circle cx="60" cy="60" r="48" fill="#040910"/>
    <image href="/assets/photos/moon-phase-texture.webp" x="12" y="12" width="96" height="96" clip-path="url(#${id}-disc)" opacity=".13"/>
    <image href="/assets/photos/moon-phase-texture.webp" x="12" y="12" width="96" height="96" clip-path="url(#${id}-light)"/>
    <circle cx="60" cy="60" r="48" fill="url(#${id}-limb)"/>
    <circle cx="60" cy="60" r="48.4" fill="none" stroke="#d5e4ee" stroke-opacity=".26" stroke-width=".6"/>
  </svg>`;
}

export function lunarPhaseList(phases,{title='Kuun päävaiheet',id='lunar-phases',caption=true}={}){
  return `<section class="lunar-phase-section" aria-labelledby="${id}-title">
    <header class="lunar-phase-heading"><div><p>KUUN VAIHEIDEN AJANKOHDAT</p><h2 id="${id}-title">${title}</h2></div><span>Ajat Suomessa</span></header>
    <div class="lunar-phase-table-wrap"><table class="lunar-phase-table"><thead><tr><th scope="col">Kuun vaihe</th><th scope="col">Päivämäärä</th><th scope="col">Kellonaika</th></tr></thead><tbody>
    ${phases.map(p=>{
      const key=`${id}-${p.utc.replace(/[^0-9]/g,'')}`;
      return `<tr data-phase-quarter="${p.quarter}" data-phase-utc="${p.utc}"><th scope="row"><div class="lunar-phase-identity"><div class="lunar-phase-visual">${phaseDisc(p.quarter,key)}</div><div><strong>${p.name}</strong><span>${descriptions[p.quarter]}</span></div></div></th><td data-label="Päivämäärä"><time datetime="${p.date.slice(0,10)}">${fi(parse(p.date.slice(0,10)))}</time></td><td data-label="Suomen aika"><time datetime="${p.utc}">${time(p.utc)}</time></td></tr>`;
    }).join('')}</tbody></table></div>
    ${caption?'<p class="lunar-phase-caption">Kuvat havainnollistavat päävaiheiden valaistusta oikean Kuun pintakuvan avulla.</p>':''}
  </section>`;
}
