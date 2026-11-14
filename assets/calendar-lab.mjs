import {quantity} from './fi-language.mjs';
import {labResult,labSecondary} from './calendar-lab-view.mjs';
import {weekDate,ordinalDate,todayFinland,validDate,weekReport,ordinalReport,leapReport,signForDate} from './calendar-lab-core.mjs';
import {add,iso,fi,parse} from './calendar.mjs';
const root=document.querySelector('[data-calendar-lab]'),kind=root.dataset.calendarLab,form=root.querySelector('#lab-form'),input=form.elements.value,error=root.querySelector('#lab-error'),status=root.querySelector('#lab-status'),visual=root.querySelector('#lab-result'),secondary=root.querySelector('#lab-secondary');
let value=input.value;
function update(next,announce=true){
 try{
  let summary;
  if(kind==='viikkonumerot'){const r=weekReport(next);summary=`Viikko ${r.number}, viikkovuosi ${r.year}. ${fi(parse(r.start))}–${fi(parse(r.end))}.`;}
  else if(kind==='vuoden-paiva'){const r=ordinalReport(next);summary=`Vuoden päivä ${r.number}. Päivän jälkeen jäljellä ${quantity(r.remaining,'päivä','päivää')}.`;}
  else if(kind==='karkausvuosi'){const r=leapReport(next);summary=`${r.year}: ${r.leap?'karkausvuosi':'tavallinen vuosi'}, ${r.days} päivää.`;}
  else{const r=signForDate(next);summary=`${r.name}, tavanomainen ajanjakso ${r.range}`;}
  const result=labResult(kind,next),extra=labSecondary(kind,next);
  value=String(next);input.value=value;error.hidden=true;
  visual.innerHTML=result;secondary.innerHTML=extra;
  visual.classList.remove('lab-updated');void visual.offsetWidth;visual.classList.add('lab-updated');
  if(announce)status.textContent=summary;
  root.querySelectorAll('[data-lab-shift]').forEach(button=>{try{validDate(iso(add(parse(value),Number(button.dataset.labShift))));button.disabled=false;}catch{button.disabled=true;}});
 }catch(e){error.textContent=e.message;error.hidden=false;return false;}return true;
}
function reveal(){if(matchMedia('(max-width:760px)').matches)visual.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
form.addEventListener('submit',event=>{event.preventDefault();if(update(input.value))reveal();});
input.addEventListener('change',()=>{if(input.checkValidity())update(input.value);});
root.querySelector('#lab-reverse-form')?.addEventListener('submit',event=>{
 event.preventDefault();const f=event.currentTarget.elements;
 try{if(update(kind==='viikkonumerot'?weekDate(f.year.value,f.number.value):ordinalDate(f.year.value,f.number.value)))reveal();}catch(e){error.textContent=e.message;error.hidden=false;}
});
root.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-lab-date')){const chosen=button.dataset.labDate;if(update(chosen)){root.querySelector(`[data-lab-date="${chosen}"]`)?.focus({preventScroll:true});}}
 else if(button.hasAttribute('data-lab-year')){const chosen=button.dataset.labYear;if(update(chosen))root.querySelector(`[data-lab-year="${chosen}"]`)?.focus({preventScroll:true});}
 else if(button.hasAttribute('data-lab-today'))update(todayFinland());
 else if(button.hasAttribute('data-lab-shift'))update(iso(add(parse(value),Number(button.dataset.labShift))));
});
if(['viikkonumerot','vuoden-paiva'].includes(kind))value=todayFinland();
update(value,false);
