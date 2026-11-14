import {countForm,quantity} from './fi-language.mjs';
import {targetInstants,countdownParts,finnishParts} from './countdown-core.mjs';
import {countdownSuggestions,countdownEventSelection} from './countdown-events.mjs';
const root=document.querySelector('[data-countdown]'),form=root.querySelector('form'),fields=form.elements,storageKey='kalenteri365-countdown-v1';
const error=root.querySelector('#countdown-error'),status=root.querySelector('#countdown-status'),occurrence=root.querySelector('#countdown-occurrence');
const nodes=Object.fromEntries([...root.querySelectorAll('[data-countdown-unit]')].map(el=>[el.dataset.countdownUnit,el]));
const unitNames={days:['Päivä','Päivää'],hours:['Tunti','Tuntia'],minutes:['Minuutti','Minuuttia'],seconds:['Sekunti','Sekuntia']};
let active=null,timer=null,previousElapsed=null;
const picker=root.querySelector('.countdown-picker'),suggestions=root.querySelector('#countdown-suggestions'),eventList=root.querySelector('#countdown-event-list');
const suggestionYear=root.querySelector('#countdown-suggestion-year'),showEvents=root.querySelector('#countdown-show-events'),moreEvents=root.querySelector('#countdown-more-events');
const eventRecords=JSON.parse(root.querySelector('[data-countdown-events]').textContent);
let suggestionQuery='',suggestionLimit=8,visibleEvents=[],activeSuggestion=-1;
const suggestionDate=new Intl.DateTimeFormat('fi-FI',{timeZone:'UTC',day:'numeric',month:'numeric',year:'numeric'});
const eventType=event=>event.type==='holiday'?'Pyhäpäivä':event.type==='eve'?'Aatto':event.isFlagDay?'Liputuspäivä':'Merkkipäivä';
function closeSuggestions(){
 suggestions.hidden=true;fields.title.setAttribute('aria-expanded','false');showEvents.setAttribute('aria-expanded','false');fields.title.removeAttribute('aria-activedescendant');activeSuggestion=-1;
}
function highlightSuggestion(index){
 activeSuggestion=index;
 for(const [i,option]of [...eventList.children].entries())option.setAttribute('aria-selected',String(i===index));
 if(index>=0){const option=eventList.children[index];fields.title.setAttribute('aria-activedescendant',option.id);option.scrollIntoView({block:'nearest'});}
 else fields.title.removeAttribute('aria-activedescendant');
}
function renderSuggestions(){
 const p=finnishParts(),today=`${p.year}-${String(p.month).padStart(2,'0')}-${String(p.day).padStart(2,'0')}`;
 const matches=countdownSuggestions(eventRecords,{query:suggestionQuery,year:suggestionYear.value,today});
 visibleEvents=matches.slice(0,suggestionLimit);activeSuggestion=-1;fields.title.removeAttribute('aria-activedescendant');eventList.replaceChildren();
 for(const [i,event]of visibleEvents.entries()){
  const option=document.createElement('li');option.id=`countdown-event-${i}`;option.role='option';option.setAttribute('aria-selected','false');option.dataset.index=String(i);
  const copy=document.createElement('span'),name=document.createElement('strong'),type=document.createElement('small'),date=document.createElement('time');
  name.textContent=event.name;type.textContent=eventType(event);copy.append(name,type);date.dateTime=event.date;date.textContent=suggestionDate.format(new Date(event.date+'T12:00:00Z'));option.append(copy,date);eventList.append(option);
 }
 root.querySelector('#countdown-suggestion-count').textContent=matches.length?`${matches.length} ehdotusta${matches.length>visibleEvents.length?` · näytetään ${visibleEvents.length}`:''}`:'Ei vastaavaa päivää. Voit kirjoittaa oman tapahtuman ja valita päivämäärän.';
 moreEvents.hidden=matches.length<=visibleEvents.length;
 moreEvents.textContent=`Näytä kaikki ${matches.length} ehdotusta`;
 suggestions.hidden=false;fields.title.setAttribute('aria-expanded','true');showEvents.setAttribute('aria-expanded','true');
}
function chooseSuggestion(index){
 const event=visibleEvents[index];if(!event)return;
 const selection=countdownEventSelection(event);
 fields.title.value=selection.title;fields.target.value=selection.date;fields.time.value=selection.time;fields.occurrence.value=selection.occurrence;
 closeSuggestions();occurrence.hidden=true;
 if(activate())status.textContent=`${event.name}: ${suggestionDate.format(new Date(event.date+'T12:00:00Z'))} klo 00.00. Voit muuttaa kellonaikaa.`;
}
fields.title.addEventListener('focus',()=>{suggestionQuery=fields.title.value===active?.title||fields.title.value==='Oma tärkeä päivä'?'':fields.title.value;suggestionLimit=8;renderSuggestions();});
fields.title.addEventListener('input',()=>{suggestionQuery=fields.title.value;suggestionLimit=8;renderSuggestions();});
fields.title.addEventListener('keydown',event=>{
 if(event.key==='Escape'){closeSuggestions();return;}
 if(event.key==='ArrowDown'||event.key==='ArrowUp'){
  event.preventDefault();if(suggestions.hidden)renderSuggestions();if(!visibleEvents.length)return;
  const next=activeSuggestion<0?(event.key==='ArrowDown'?0:visibleEvents.length-1):(activeSuggestion+(event.key==='ArrowDown'?1:-1)+visibleEvents.length)%visibleEvents.length;
  highlightSuggestion(next);
 }else if(event.key==='Enter'&&!suggestions.hidden&&visibleEvents.length){event.preventDefault();chooseSuggestion(Math.max(0,activeSuggestion));}
});
eventList.addEventListener('pointerdown',event=>event.preventDefault());
eventList.addEventListener('click',event=>{const option=event.target.closest('[data-index]');if(option)chooseSuggestion(Number(option.dataset.index));});
showEvents.addEventListener('click',()=>{if(!suggestions.hidden){closeSuggestions();return;}suggestionQuery='';suggestionLimit=8;renderSuggestions();});
suggestionYear.addEventListener('change',()=>{suggestionLimit=8;renderSuggestions();});
moreEvents.addEventListener('click',()=>{suggestionLimit=eventRecords.length;renderSuggestions();});
picker.addEventListener('focusout',event=>{if(!picker.contains(event.relatedTarget))closeSuggestions();});
document.addEventListener('click',event=>{if(!picker.contains(event.target))closeSuggestions();});
const formatDate=new Intl.DateTimeFormat('fi-FI',{timeZone:'Europe/Helsinki',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
function tick(){
 if(!active)return;
 const parts=countdownParts(active.instant);
 for(const [unit,el]of Object.entries(nodes)){const value=String(parts[unit]).padStart(2,'0');el.parentElement.querySelector('.countdown-unit-label').textContent=countForm(parts[unit],...unitNames[unit]);if(el.firstElementChild.textContent!==value){el.firstElementChild.textContent=value;el.dataset.length=String(value.length);el.classList.remove('is-ticking');void el.offsetWidth;el.classList.add('is-ticking');}}
 root.querySelector('#countdown-direction').textContent=parts.reached?'HETKI ON NYT':parts.elapsed?'AIKAA KULUNUT':'AIKAA JÄLJELLÄ';
 root.querySelector('[role="timer"]').setAttribute('aria-label',`${parts.elapsed?'Kulunut':'Jäljellä'} ${quantity(parts.days,'päivä','päivää')}, ${quantity(parts.hours,'tunti','tuntia')}, ${quantity(parts.minutes,'minuutti','minuuttia')} ja ${quantity(parts.seconds,'sekunti','sekuntia')}`);
 root.classList.toggle('is-elapsed',parts.elapsed);
 if(previousElapsed===false&&parts.elapsed)status.textContent='Valittu hetki on saavutettu. Laskuri näyttää nyt kulunutta aikaa.';
 previousElapsed=parts.elapsed;
}
function run(){clearTimeout(timer);tick();if(!document.hidden)timer=setTimeout(run,1000-Date.now()%1000+15);}
function activate(save=true,announce=true){
 error.hidden=true;
 try{
  const candidates=targetInstants(fields.target.value,fields.time.value);
  occurrence.hidden=candidates.length!==2;
  if(!candidates.length)throw Error('Tätä kellonaikaa ei ole kevään kellonsiirtopäivänä. Valitse toinen aika.');
  if(candidates.length===2&&fields.occurrence.value==='')throw Error('Kellonaika esiintyy kahdesti. Valitse ensimmäinen tai jälkimmäinen kerta.');
  const title=fields.title.value.trim();if(!title)throw Error('Anna tapahtumalle nimi.');
  active={title,date:fields.target.value,time:fields.time.value,occurrence:fields.occurrence.value,instant:candidates.length===2?candidates[Number(fields.occurrence.value)]:candidates[0]};
  root.querySelector('#countdown-heading').textContent=title;root.querySelector('#countdown-target-label').textContent=formatDate.format(active.instant);
  previousElapsed=null;run();if(announce)status.textContent='Lähtölaskenta päivitetty.';
  if(save){try{localStorage.setItem(storageKey,JSON.stringify(active));}catch{status.textContent='Laskuri toimii, mutta valintaa ei voitu tallentaa selaimeen.';}}
 }catch(e){error.textContent=e.message;error.hidden=false;return false;}return true;
}
form.addEventListener('submit',e=>{e.preventDefault();activate();});
for(const name of['target','time'])fields[name].addEventListener('input',()=>{fields.occurrence.value='';occurrence.hidden=true;error.hidden=true;});
root.querySelectorAll('[data-countdown-preset]').forEach(button=>button.addEventListener('click',()=>{
 const p=finnishParts(),d=new Date(Date.UTC(p.year,p.month-1,p.day));
 if(button.dataset.countdownPreset==='year'){d.setUTCFullYear(p.year+1,0,1);fields.title.value='Uusivuosi '+(p.year+1);fields.time.value='00:00';}
 else{d.setUTCDate(d.getUTCDate()+Number(button.dataset.countdownPreset));fields.time.value=String(p.hour).padStart(2,'0')+':'+String(p.minute).padStart(2,'0');fields.title.value='Oma tärkeä päivä';}
 fields.target.value=d.toISOString().slice(0,10);fields.occurrence.value='';activate();
}));
root.querySelector('#countdown-clear').addEventListener('click',()=>{
 try{localStorage.removeItem(storageKey);}catch{}
 status.textContent='Tallennettu valinta poistettu. Nykyinen laskuri toimii, kunnes suljet sivun.';
});
document.addEventListener('visibilitychange',run);window.addEventListener('pageshow',run);window.addEventListener('pagehide',()=>clearTimeout(timer));
try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved&&typeof saved.title==='string'&&saved.title.length<=100&&['','0','1'].includes(saved.occurrence)){fields.title.value=saved.title;fields.target.value=saved.date;fields.time.value=saved.time;fields.occurrence.value=saved.occurrence;}}catch{}
if(!activate(false,false)){form.reset();error.hidden=true;activate(false,false);}
