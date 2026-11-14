import {matchesCrop} from './garden-model.mjs';
import {validateGardenPlan,validGardenDate,gardenPlanICS,mergeGardenPlans} from './garden-plan-model.mjs';
const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const mark=(name)=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="${({plus:'M12 4v16 M4 12h16',edit:'M4 16 17 3l4 4L8 20l-5 1z M14 6l4 4',close:'M5 5l14 14 M5 19 19 5',calendar:'M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16',leaf:'M20 3C7 1 0 12 8 17 15 22 22 14 20 3 M5 21 17 7'})[name]}"/></svg>`;
export function initGardenPlanner({onAddEvent}) {
 const config=document.querySelector('#garden-config');if(!config)return;
 const crops=JSON.parse(config.textContent),form=document.querySelector('#garden-filters'),taskForm=document.querySelector('#garden-task-form'),status=document.querySelector('#garden-plan-status'),names=crops.map(c=>c.name),key='kalenteri365-garden-plan-v1';
 let tasks=[],editing=null,expanded=new Set();
 const say=message=>status.textContent=message;
 try{const saved=localStorage.getItem(key);if(saved)tasks=validateGardenPlan(JSON.parse(saved),names);}catch{say('Tallennettua suunnitelmaa ei voitu avata. Voit tuoda aiemmin tallentamasi tiedostokopion.');}
 const update=()=>{
  const values=Object.fromEntries(new FormData(form)),visible=new Set(crops.filter(c=>matchesCrop(c,values)).map(c=>c.slug));
  document.querySelectorAll('[data-garden-crop]').forEach(el=>el.hidden=!visible.has(el.dataset.gardenCrop));
  document.querySelectorAll('[data-garden-detail]').forEach(el=>el.hidden=!visible.has(el.dataset.gardenDetail)||!expanded.has(el.dataset.gardenDetail));
  document.querySelector('#garden-count').textContent=visible.size+(visible.size===1?' kasvi':' kasvia');document.querySelector('#garden-empty').hidden=visible.size!==0;
 };
 form.addEventListener('input',update);form.addEventListener('change',update);form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('reset',()=>requestAnimationFrame(update));
 document.querySelector('[data-garden-current]').addEventListener('click',()=>{form.elements.month.value=new Intl.DateTimeFormat('en',{timeZone:'Europe/Helsinki',month:'numeric'}).format(new Date());update();});
 document.querySelectorAll('[data-garden-view]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-garden-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelector('#garden-cards').hidden=button.dataset.gardenView!=='cards';document.querySelector('#garden-matrix').hidden=button.dataset.gardenView!=='year';
 }));
 document.querySelectorAll('[data-crop-expand]').forEach(button=>button.addEventListener('click',()=>{const slug=button.dataset.cropExpand;if(expanded.has(slug))expanded.delete(slug);else {expanded.add(slug);document.querySelector('#garden-matrix .table-scroll').scrollLeft=0;}button.setAttribute('aria-expanded',String(expanded.has(slug)));update();}));
 const save=()=>{try{localStorage.setItem(key,JSON.stringify({type:'kalenteri365-garden',version:1,tasks}));return true;}catch{say('Selaintallennus ei ole käytettävissä. Tallenna suunnitelma tiedostoksi ennen sivulta poistumista.');return false;}};
 const dateLabel=value=>new Intl.DateTimeFormat('fi-FI',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
 const render=()=>{
  const items=[...tasks].sort((a,b)=>a.date.localeCompare(b.date)||a.crop.localeCompare(b.crop,'fi'));
  document.querySelector('#garden-plan-count').textContent=tasks.length+(tasks.length===1?' työ':' työtä');
  document.querySelector('#garden-plan-items').innerHTML=tasks.length?`<ul class="garden-task-list">${items.map(t=>`<li data-task-id="${t.id}" class="${t.done?'is-done':''}"><label class="garden-task-done"><input type="checkbox" data-task-done="${t.id}" ${t.done?'checked':''}><span class="sr-only">Merkitse tehtäväksi: ${escape(t.crop+': '+t.activity)}</span></label><div class="garden-task-copy"><time datetime="${t.date}">${dateLabel(t.date)}</time><h4>${escape(t.crop)}<span> · ${escape(t.activity)}</span></h4>${t.note?`<p>${escape(t.note)}</p>`:''}${t.done?'<small>Tehty</small>':''}<div class="garden-task-actions"><button type="button" data-task-edit="${t.id}">${mark('edit')}Muokkaa</button><button type="button" data-task-calendar="${t.id}">${mark('calendar')}Kalenteriin</button><button type="button" data-task-remove="${t.id}" aria-label="Poista ${escape(t.crop+': '+t.activity)}">${mark('close')}Poista</button></div></div></li>`).join('')}</ul>`:`<div class="garden-plan-empty">${mark('leaf')}<h4>Tästä alkaa oma kasvukautesi.</h4><p>Valitse kasvi, työ ja päivä viereisestä lomakkeesta. Työt järjestyvät tähän päivämäärän mukaan.</p></div>`;
  document.querySelectorAll('[data-garden-save],[data-garden-ics],[data-garden-print]').forEach(b=>b.disabled=!tasks.length);
 };
 const resetEdit=()=>{editing=null;taskForm.reset();document.querySelector('#garden-form-title').textContent='Lisää puutarhatyö';taskForm.querySelector('[type=submit]').innerHTML=mark('plus')+'Lisää suunnitelmaan';document.querySelector('[data-garden-cancel]').hidden=true;};
 taskForm.addEventListener('submit',event=>{
  event.preventDefault();if(!taskForm.reportValidity())return;const values=Object.fromEntries(new FormData(taskForm));
  if(!validGardenDate(values.date)){say('Valitse kelvollinen päivä vuosilta 1900–2100.');return;}
  if(!editing&&tasks.length>=500){say('Suunnitelmaan mahtuu enintään 500 työtä.');return;}
  const task={id:editing||crypto.randomUUID(),crop:values.crop,activity:values.activity,date:values.date,note:values.note.trim(),done:editing?tasks.find(t=>t.id===editing).done:false};
  if(editing)tasks=tasks.map(t=>t.id===editing?task:t);else tasks.push(task);
  const wasEditing=!!editing;const stored=save();render();resetEdit();if(stored)say(wasEditing?'Muutokset tallennettu.':'Työ lisätty ja tallennettu tähän selaimeen.');
 });
 document.querySelector('[data-garden-cancel]').addEventListener('click',resetEdit);
 document.querySelectorAll('[data-plan-crop]').forEach(button=>button.addEventListener('click',()=>{resetEdit();taskForm.elements.crop.value=button.dataset.planCrop;taskForm.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});taskForm.elements.date.focus({preventScroll:true});}));
 const sheet=document.querySelector('#garden-plan-items');
 sheet.addEventListener('change',event=>{const id=event.target.dataset.taskDone;if(!id)return;tasks=tasks.map(t=>t.id===id?{...t,done:event.target.checked}:t);save();render();sheet.querySelector(`[data-task-done="${id}"]`)?.focus();});
 sheet.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;const id=button.dataset.taskEdit||button.dataset.taskRemove||button.dataset.taskCalendar,task=tasks.find(t=>t.id===id);if(!task)return;
  if(button.hasAttribute('data-task-remove')){tasks=tasks.filter(t=>t.id!==id);if(editing===id)resetEdit();save();render();say('Työ poistettu suunnitelmasta.');}
  else if(button.hasAttribute('data-task-calendar'))onAddEvent({date:task.date,title:task.crop+': '+task.activity,description:task.note});
  else {editing=id;for(const name of ['crop','activity','date','note'])taskForm.elements[name].value=task[name];document.querySelector('#garden-form-title').textContent='Muokkaa puutarhatyötä';taskForm.querySelector('[type=submit]').innerHTML=mark('edit')+'Tallenna muutokset';document.querySelector('[data-garden-cancel]').hidden=false;taskForm.scrollIntoView({block:'start',behavior:'smooth'});taskForm.elements.crop.focus({preventScroll:true});}
 });
 const download=(name,text,type)=>{const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);};
 document.querySelector('[data-garden-save]').addEventListener('click',()=>download('kalenteri365-kylvosuunnitelma.json',JSON.stringify({type:'kalenteri365-garden',version:1,tasks},null,2),'application/json'));
 document.querySelector('[data-garden-ics]').addEventListener('click',()=>download('kalenteri365-kylvosuunnitelma.ics',gardenPlanICS(tasks,{reminder:document.querySelector('[data-garden-alarm]').checked}),'text/calendar;charset=utf-8'));
 document.querySelector('[data-garden-import]').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{if(file.size>2_000_000)throw Error('Tiedosto on liian suuri. Enimmäiskoko on 2 Mt.');const imported=validateGardenPlan(JSON.parse(await file.text()),names),merged=mergeGardenPlans(tasks,imported),count=merged.count;tasks=merged.tasks;const stored=save();render();if(stored)say(count?count+' työtä tuotu suunnitelmaan. Aiemmat työt säilytettiin.':'Tiedoston työt ovat jo suunnitelmassasi.');
  }catch(error){say(error instanceof SyntaxError?'Tiedostoa ei voi lukea. Valitse tallentamasi suunnitelman JSON-tiedosto.':error.message);}finally{event.target.value='';}
 });
 document.querySelector('[data-garden-print]').addEventListener('click',()=>{document.body.classList.add('garden-print-plan');window.print();});
 window.addEventListener('afterprint',()=>document.body.classList.remove('garden-print-plan'));
 render();update();
}
