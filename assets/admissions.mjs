import './calendar-downloads.js';
import {quantity} from './fi-language.mjs';
import {ADMISSIONS_REMINDERS,routeState,routeEvents,selectedAdmissionEvents,personalAdmissionEvent,admissionsCalendar} from './admissions-core.mjs';
import {esc,icon} from './ui.mjs';
const root=document.querySelector('[data-admissions-workspace]');
if(root){
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)],data=JSON.parse($('#admissions-records').textContent);
 const key='kalenteri365-admissions-v1';let route=data.routes[0].id,selected=new Set(),custom=[],checks={},reminder='1';
 const status=$('#ad-storage-status'),all=()=>[...data.events,...custom],dateText=d=>new Intl.DateTimeFormat('fi-FI',{timeZone:'UTC',day:'numeric',month:'numeric',year:'numeric'}).format(new Date(d+'T12:00Z'));
 function save(){try{localStorage.setItem(key,JSON.stringify({route,selected:[...selected],custom,checks,reminder}));status.textContent='Valinnat tallennettu tähän selaimeen.';}catch{status.textContent='Selaimeen tallentaminen ei onnistunut. Lataa päivät kalenteritiedostona talteen.';}}
 try{
  const saved=JSON.parse(localStorage.getItem(key)||'null');
  if(saved){
   if(data.routes.some(r=>r.id===saved.route))route=saved.route;
   if(Array.isArray(saved.custom))for(const e of saved.custom.slice(0,50)){try{const clean=personalAdmissionEvent(e);if(clean.id===e.id&&!custom.some(c=>c.id===clean.id))custom.push(clean);}catch{}}
   const known=new Set(all().map(e=>e.id));if(Array.isArray(saved.selected))selected=new Set(saved.selected.filter(id=>known.has(id)));
   if(ADMISSIONS_REMINDERS.some(([id])=>id===saved.reminder))reminder=saved.reminder;
   for(const r of data.routes)checks[r.id]=Array.isArray(saved.checks?.[r.id])?[...new Set(saved.checks[r.id].filter(i=>Number.isInteger(i)&&i>=0&&i<3))]:[];
  }
 }catch{status.textContent='Aiemman listan lukeminen ei onnistunut. Voit tehdä valinnat uudelleen.';}
 const initial=data.routes.find(r=>'#admission-'+r.id===location.hash);if(initial)route=initial.id;
 $('#ad-reminder').value=reminder;
 function renderChecklist(){
  const completed=checks[route]||[];
  $$('[data-ad-check]').forEach(c=>c.checked=completed.includes(Number(c.dataset.adCheck)));
  $('[data-ad-check-count]').textContent=completed.length+' / 3 tehty';$('[data-ad-check-route]').textContent=data.routes.find(r=>r.id===route).short;
  $('.ad-checklist progress').value=completed.length;
 }
 function renderRoute(){
  for(const a of $$('[data-ad-route-choice]')){if(a.dataset.adRouteChoice===route)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');}
  for(const panel of $$('[data-ad-route]'))panel.hidden=panel.dataset.adRoute!==route;
  for(const r of data.routes){const el=$(`[data-ad-state="${r.id}"]`),state=routeState(r);el.dataset.status=state.kind;el.textContent=state.label;}
  renderChecklist();
 }
 function renderSelected(){
  const items=selectedAdmissionEvents(selected,custom);$('#ad-own-count').textContent=items.length;
  $('#ad-selected-list').innerHTML=items.length?items.map(e=>`<li><time datetime="${e.date}">${dateText(e.date).replace('.2027','.')}</time><span>${esc(e.name)}<small>${esc(e.routeName)}${e.time?' · klo '+e.time.replace(':','.'):''}</small></span><button type="button" class="ad-remove" data-ad-remove="${e.id}" aria-label="Poista ${esc(e.name)}, ${dateText(e.date)}">${icon('close')}</button></li>`).join(''):'<li class="ad-empty">Valitse ensimmäinen päivä haun aikajanalta.</li>';
  for(const check of $$('[data-ad-pick]')){check.checked=selected.has(check.value);check.closest('.ad-event').classList.toggle('is-selected',check.checked);}
  $('[data-ad-export]').disabled=!items.length;$('[data-ad-clear]').disabled=!items.length;
  for(const b of $$('[data-ad-add-route]')){const complete=routeEvents(b.dataset.adAddRoute).every(e=>selected.has(e.id));b.querySelector('span').textContent=complete?'Haun päivät valittu':'Valitse haun päivät';}
 }
 function activate(id,{scroll=false}={}){if(!data.routes.some(r=>r.id===id))return;route=id;renderRoute();save();if(scroll){const p=$(`[data-ad-route="${id}"]`),h=p.querySelector('h2');h.tabIndex=-1;h.focus({preventScroll:true});p.scrollIntoView({block:'start',behavior:'instant'});}}
 function download(events){
  try{globalThis.Calendar365Downloads.save(admissionsCalendar(events,reminder),events.length===1?'hakumuistutus-'+events[0].date+'.ics':'omat-hakumuistutukset.ics','text/calendar;charset=utf-8');$('#ad-action-status').textContent=quantity(events.length,'päivä','päivää')+' ladattu kalenteritiedostoon.';}
  catch(error){status.textContent=error.message;}
 }
 root.addEventListener('click',e=>{
  const routeLink=e.target.closest('[data-ad-route-choice]');if(routeLink){e.preventDefault();const id=routeLink.dataset.adRouteChoice;history.replaceState(null,'','#admission-'+id);activate(id,{scroll:true});return;}
  const add=e.target.closest('[data-ad-add-route]');if(add){for(const event of routeEvents(add.dataset.adAddRoute))selected.add(event.id);renderSelected();save();$('#ad-action-status').textContent='Haun päivät lisätty omaan listaan.';return;}
  const remove=e.target.closest('[data-ad-remove]');if(remove){const id=remove.dataset.adRemove;selected.delete(id);custom=custom.filter(e=>e.id!==id);renderSelected();save();const next=$('#ad-selected-list button')||$('[data-ad-add-route="'+route+'"]');next.focus({preventScroll:true});return;}
  const single=e.target.closest('[data-ad-single]');if(single){e.preventDefault();download([data.events.find(e=>e.id===single.dataset.adSingle)]);return;}
  if(e.target.closest('[data-ad-export]'))download(selectedAdmissionEvents(selected,custom));
  if(e.target.closest('[data-ad-clear]')){selected.clear();custom=[];renderSelected();save();}
  if(e.target.closest('[data-ad-print]')){
   $('.ad-print-sheet')?.remove();const chosen=selectedAdmissionEvents(selected,custom),items=chosen.length?chosen:routeEvents(route),sheet=document.createElement('section');sheet.className='ad-print-sheet';sheet.innerHTML=`<h1>Hakumuistutukseni</h1><p>${chosen.length?'Omat valitut päivät':esc(data.routes.find(r=>r.id===route).name)} · Suomen aikaa</p><table><thead><tr><th>Päivämäärä</th><th>Muistettava asia</th></tr></thead><tbody>${items.map(e=>`<tr><td>${dateText(e.date)}${e.time?'<br>klo '+e.time.replace(':','.'):''}</td><td><strong>${esc(e.name)}</strong><small>${esc(e.routeName)} · ${esc(e.step==='opens'?'Alkaa':e.qualifier)}${e.route==='own'&&e.applies?'<br>'+esc(e.applies):''}</small></td></tr>`).join('')}</tbody></table><footer>Kalenteri365.fi | Hakukalenteri · Yleiset yhteishakuajat tarkistettu 14.11.2026. Tarkista oman hakukohteen ohje ja vastaanottoaika.</footer>`;root.append(sheet);window.print();
  }
 });
 root.addEventListener('change',e=>{
  if(e.target.matches('[data-ad-pick]')){e.target.checked?selected.add(e.target.value):selected.delete(e.target.value);renderSelected();save();}
  if(e.target.id==='ad-reminder'){reminder=e.target.value;save();}
  if(e.target.matches('[data-ad-check]')){checks[route]=$$('[data-ad-check]:checked').map(c=>Number(c.dataset.adCheck));renderChecklist();save();}
 });
 $('#ad-custom-form').addEventListener('submit',e=>{
  e.preventDefault();const form=e.currentTarget,msg=form.querySelector('[role=status]');
  try{if(custom.length>=50)throw Error('Omassa listassa voi olla enintään 50 itse lisättyä muistutusta.');const event=personalAdmissionEvent(Object.fromEntries(new FormData(form)));if(!custom.some(x=>x.id===event.id))custom.push(event);selected.add(event.id);renderSelected();save();msg.textContent='Oma muistutus lisätty listaan.';form.reset();}catch(error){msg.textContent=error.message;}
 });
 addEventListener('hashchange',()=>{const r=data.routes.find(r=>'#admission-'+r.id===location.hash);if(r)activate(r.id);});
 addEventListener('afterprint',()=>$('.ad-print-sheet')?.remove());
 renderRoute();renderSelected();root.dataset.ready='true';
}
