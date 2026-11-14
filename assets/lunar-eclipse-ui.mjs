import {lunarCards,filteredLunarEvents} from './lunar-eclipse-core.mjs';
const root=document.querySelector('[data-lunar-eclipses]');
if(root){
 const data=JSON.parse(root.querySelector('[data-lunar-data]').textContent),place=root.querySelector('[data-lunar-place]'),year=root.querySelector('[data-lunar-year]'),visibility=root.querySelector('[data-lunar-visibility]');
 function update(){const city=data.find(c=>c.slug===place.value),events=filteredLunarEvents(city,year.value,visibility.value);root.querySelector('[data-lunar-results]').innerHTML=lunarCards(city,year.value,visibility.value);root.querySelector('[data-lunar-status]').textContent=`${city.name}: ${events.length} ${events.length===1?'pimennys':'pimennystä'} · ${year.value==='all'?'2027–2030':year.value} · ${visibility.value==='all'?'kaikki huippuhetket':'huippu horisontin yllä'}`;}
 for(const el of [place,year,visibility])el.addEventListener('change',update);
}
