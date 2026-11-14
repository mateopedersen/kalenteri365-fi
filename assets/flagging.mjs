import {CITIES,MONTHS,cap,parse} from './calendar.mjs';
import {icon} from './ui.mjs';
import {flagDate,flagWindow,filterFlagDays,groupFlagDays,finnishToday,FLAG_CLASSES,flagCalendar,flagGoogleURL} from './flagging-core.mjs';
import {dayEvents} from './solar-day.mjs';
const root=document.querySelector('[data-flagging-workspace]');
if(root){
 const {year,records}=JSON.parse(root.querySelector('#fg-data').textContent),q=s=>root.querySelector(s),byId=new Map(records.map(e=>[e.id,e])),dialog=q('#fg-calendar-dialog');
 let visible=filterFlagDays(records,{month:q('#fg-month').value}),selection=[],astronomy,calculation=0;const cache=new Map();
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tinyFlag='<svg class="fg-flag-icon" viewBox="0 0 18 11" aria-hidden="true"><path fill="#fff" d="M0 0h18v11H0z"/><path fill="#003580" d="M5 0h3v11H5zM0 4h18v3H0z"/></svg>';
 function updateNext(){
  const groups=groupFlagDays(visible),today=finnishToday(),next=groups.find(([ds])=>ds>=today),entry=next||groups[0],card=q('.fg-next');
  card.hidden=!entry;if(!entry)return;
  card.querySelector('.fg-kicker').textContent=next?'Seuraava päivä tässä näkymässä':'Ensimmäinen päivä tässä näkymässä';
  card.querySelector('time').dateTime=entry[0];card.querySelector('time').textContent=`${Number(entry[0].slice(8))}.${Number(entry[0].slice(5,7))}.`;
  card.querySelector('h3').textContent=entry[1].map(e=>e.name).join(' ja ');card.querySelector('[data-fg-jump]').dataset.fgJump=entry[0];
 }
 function render(){
  const scope=q('[name="fg-scope"]:checked').value;q('#fg-class').disabled=scope!=='finland';if(scope!=='finland')q('#fg-class').value='';
  visible=filterFlagDays(records,{scope,month:q('#fg-month').value,classification:q('#fg-class').value,query:q('#fg-search').value});const groups=groupFlagDays(visible);
  updateNext();q('#fg-count').textContent=`${groups.length} ${groups.length===1?'päivämäärä':'päivämäärää'} · ${visible.length} ${visible.length===1?'merkintä':'merkintää'}`;q('#fg-region-note').hidden=scope==='finland';q('[data-fg-export]').disabled=!visible.length;
  q('#fg-results').innerHTML=MONTHS.map((m,i)=>{const months=groups.filter(([ds])=>Number(ds.slice(5,7))===i+1);if(!months.length)return '';return `<section class="fg-month"><h3 class="fg-month-label"><span>${String(i+1).padStart(2,'0')}</span>${cap(m)}</h3>${months.map(([ds,events])=>`<article class="fg-day" data-fg-day="${ds}"><time class="fg-date" datetime="${ds}"><strong>${Number(ds.slice(8))}.</strong><span>${new Intl.DateTimeFormat('fi-FI',{weekday:'short',timeZone:'UTC'}).format(parse(ds))}</span></time><div class="fg-day-content">${events.map(e=>`<div class="fg-occasion"><div><span class="fg-badge fg-${e.classification}">${e.scope==='finland'?tinyFlag:''}${esc(FLAG_CLASSES[e.classification])}</span><h3><a href="${esc(e.href)}"${e.href.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':''}>${esc(e.name)}</a></h3><p>${esc(e.description.replace(/Päivä on (virallinen|vakiintunut) liputuspäivä\.?/g,''))}</p></div><button type="button" class="fg-mini" data-fg-calendar="${e.id}" aria-label="Lisää ${esc(e.name)} kalenteriin">${icon('calendar')}<span>Kalenteriin</span></button></div>`).join('')}${scope==='finland'?`<button class="fg-time-link" type="button" data-fg-date="${ds}">${icon('clock')}Katso tämän päivän liputusaika${icon('arrow')}</button>`:''}</div></article>`).join('')}</section>`;}).join('')||`<div class="fg-empty">${icon('search')}<h3>Näillä valinnoilla ei löytynyt päiviä</h3><p>Kokeile toista hakusanaa tai näytä koko vuoden liputuspäivät.</p><button type="button" class="fg-button fg-outline" data-fg-reset>Näytä koko vuosi</button></div>`;
 }
 for(const s of ['#fg-search','#fg-month','#fg-class'])q(s).addEventListener(s==='#fg-search'?'input':'change',render);
 root.querySelectorAll('[name="fg-scope"]').forEach(e=>e.addEventListener('change',render));
 updateNext();
 const reset=()=>{q('#fg-search').value='';q('#fg-month').value='';q('#fg-class').value='';q('[name="fg-scope"][value="finland"]').checked=true;render();};
 const showCalendar=events=>{selection=events;q('#fg-dialog-title').textContent=events.length===1?events[0].name:`${events.length} liputuspäivän merkintää`;q('#fg-dialog-description').textContent=events.length===1?flagDate(events[0].date):`Valitsemasi vuoden ${year} päivät. Vienti sisältää vain luettelossa nyt näkyvät merkinnät.`;q('#fg-google').hidden=events.length!==1;q('#fg-own').hidden=events.length!==1;if(events.length===1){q('#fg-google').href=flagGoogleURL(events[0]);q('#fg-own').dataset.addDate=events[0].date;q('#fg-own').dataset.addTitle=events[0].name;}q('#fg-dialog-status').textContent='';dialog.showModal();};
 async function calculate(){
  if(!q('#fg-hours-form').reportValidity())return;const seq=++calculation,ds=q('#fg-date').value,city=CITIES.find(c=>c[0]===q('#fg-city').value)||CITIES[0],key=ds+city[0];
  const result=q('#fg-hours-result');result.setAttribute('aria-busy','true');
  try{let solar=cache.get(key);if(!solar){astronomy??=import('./vendor/astronomy-engine.mjs');const A=await astronomy;solar=dayEvents(A,city,ds);cache.set(key,solar);}if(seq!==calculation)return;
   const h=flagWindow(ds,records,solar),names=records.filter(e=>e.scope==='finland'&&e.date===ds).map(e=>e.name);
   result.innerHTML=`<p class="fg-hours-date">${esc(city[1])} · ${esc(flagDate(ds))}</p><div class="fg-time-pair"><div><span>Lippu ylös</span><strong>${esc(h.start)}</strong></div><span class="fg-time-connector" aria-hidden="true"></span><div><span>Lippu alas</span><strong>${esc(h.end||'Tarkista')}</strong></div></div>${h.startDate!==h.endDate?`<p class="fg-overnight">${esc(flagDate(h.startDate))} → ${esc(flagDate(h.endDate))}<br>Liputus jatkuu yön yli.</p>`:''}<p class="fg-hours-reason">${esc(h.reason)}</p>${names.length?`<p class="fg-selected-name">${esc(names.join(' · '))}</p>`:`<p class="fg-selected-name">Tälle päivälle ei ole luettelossa Suomen lipun liputuspäivää. Voit liputtaa oman juhlan kunniaksi.</p>`}`;
  }catch{if(seq!==calculation)return;result.innerHTML='<p class="fg-hours-error">Liputusaikaa ei voitu laskea. Valitse päivä uudelleen tai tarkista aika alla olevasta liputusohjeesta.</p>';}finally{if(seq===calculation)result.removeAttribute('aria-busy');}
 }
 const currentNext=groupFlagDays(visible).find(([ds])=>ds>=finnishToday())?.[0];
 if(currentNext&&currentNext!==q('#fg-date').value){q('#fg-date').value=currentNext;calculate();}
 q('#fg-hours-form').addEventListener('submit',e=>{e.preventDefault();calculate();});q('#fg-city').addEventListener('change',calculate);q('#fg-date').addEventListener('change',calculate);
 root.addEventListener('click',e=>{const target=e.target.closest('button');if(!target)return;
  if(target.hasAttribute('data-fg-reset'))reset();
  if(target.dataset.fgCalendar)showCalendar([byId.get(target.dataset.fgCalendar)]);
  if(target.hasAttribute('data-fg-export'))showCalendar(visible);
  if(target.hasAttribute('data-fg-close'))dialog.close();
  if(target.dataset.fgDate){q('#fg-date').value=target.dataset.fgDate;calculate();q('#liputusajat').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});q('#fg-hours-title').setAttribute('tabindex','-1');q('#fg-hours-title').focus({preventScroll:true});}
  if(target.dataset.fgJump){const row=q(`[data-fg-day="${target.dataset.fgJump}"]`);row?.scrollIntoView({block:'center',behavior:'smooth'});row?.classList.add('fg-highlight');setTimeout(()=>row?.classList.remove('fg-highlight'),2000);}
  if(target.id==='fg-own')dialog.close();
 });
 q('#fg-ics').addEventListener('click',()=>{try{const text=flagCalendar(selection,q('#fg-reminder').value),blob=new Blob([text],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`kalenteri365-liputuspaivat-${year}${selection.length===1?'-'+selection[0].id:''}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);q('#fg-dialog-status').textContent='Kalenteritiedosto ladattu. Avaa se kalenterisovelluksessasi.';}catch(error){q('#fg-dialog-status').textContent=error.message;}});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
}
