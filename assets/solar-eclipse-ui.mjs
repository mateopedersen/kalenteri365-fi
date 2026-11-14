import {eclipseCards,eclipseCount} from './solar-eclipse-core.mjs';
const root=document.querySelector('[data-eclipse-workspace]');
if(root){const data=JSON.parse(root.querySelector('[data-eclipse-data]').textContent),place=root.querySelector('[data-eclipse-place]'),year=root.querySelector('[data-eclipse-year]');
 const update=()=>{const city=data.find(c=>c.slug===place.value),events=city.events.filter(e=>year.value==='all'||e.peak.startsWith(year.value));root.querySelector('[data-eclipse-results]').innerHTML=eclipseCards(city,year.value);root.querySelector('[data-eclipse-status]').textContent=city.name+': '+eclipseCount(events.length)+' '+(year.value==='all'?'vuosina 2027–2030':'vuonna '+year.value);};
 place.addEventListener('change',update);year.addEventListener('change',update);
}
