import {countForm,quantity} from './fi-language.mjs';
import {targetInstants,countdownParts,finnishParts} from './countdown-core.mjs';
const root=document.querySelector('[data-countdown]'),form=root.querySelector('form'),fields=form.elements,storageKey='kalenteri365-countdown-v1';
const error=root.querySelector('#countdown-error'),status=root.querySelector('#countdown-status'),occurrence=root.querySelector('#countdown-occurrence');
const nodes=Object.fromEntries([...root.querySelectorAll('[data-countdown-unit]')].map(el=>[el.dataset.countdownUnit,el]));
const unitNames={days:['Päivä','Päivää'],hours:['Tunti','Tuntia'],minutes:['Minuutti','Minuuttia'],seconds:['Sekunti','Sekuntia']};
let active=null,timer=null,previousElapsed=null;
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
