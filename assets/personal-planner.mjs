import {DAYS,add,cap,fi,iso,parse,week} from './calendar.mjs';
import {esc,icon} from './ui.mjs';
import {orderedTasks,personalWeekICS,validDay,validateTask,weekPlan} from './personal-planner-core.mjs';

export function connectPersonalPlanner({state,persist,openEvent,onUpdate}) {
  const root=document.querySelector('[data-personal-planner]');
  if(!root)return;
  const $=selector=>root.querySelector(selector);
  const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki'}).format(new Date());
  state.plans??={};state.plans.personal??={};
  const initial=new URL(location.href).searchParams.get('date')||state.plans.personal.date;
  let selected=validDay(initial)?initial:today(),filter='open',noteTimer,editingTask=null,removedTask=null,noteLoaded=false;
  const taskForm=$('[data-personal-task-form]'),note=$('#personal-note');
  const dayTitle=date=>cap(DAYS[(parse(date).getUTCDay()+6)%7])+', '+fi(parse(date));
  const taskStatus=text=>{$('[data-personal-task-status]').textContent=text;};
  const commit=(change,message='')=>{
    const previous={tasks:state.tasks.map(item=>({...item})),notes:{...state.notes},personal:{...state.plans.personal}};
    change();
    if(!persist()){
      state.tasks=previous.tasks;state.notes=previous.notes;state.plans.personal=previous.personal;
      render();
      taskStatus('Tallennus ei onnistunut. Tietoja ei muutettu. Vapauta selaimen tallennustilaa ja yritä uudelleen.');
      return false;
    }
    if(message)taskStatus(message);
    render();onUpdate?.();return true;
  };
  function saveNote() {
    clearTimeout(noteTimer);
    if(!noteLoaded)return true;
    const value=note.value;
    if((state.notes[selected]||'')===value){$('[data-personal-note-status]').textContent='Tallennettu tähän selaimeen.';return true;}
    const previous=state.notes[selected];
    state.notes[selected]=value;
    const saved=persist();
    if(!saved){if(previous===undefined)delete state.notes[selected];else state.notes[selected]=previous;}
    $('[data-personal-note-status]').textContent=saved?'Tallennettu tähän selaimeen.':'Tallennus ei onnistunut. Kopioi tekstisi talteen ja yritä uudelleen.';
    renderPrint();
    return saved;
  }
  function select(date) {
    if(!validDay(date)||date<'1900-01-01'||date>'2100-12-31')return;
    if(!saveNote()){$('#personal-date').value=selected;return;}
    selected=date;state.plans.personal.date=date;persist();
    $('#personal-date').value=date;
    $('[data-personal-note-label]').textContent=fi(parse(date))+' · Muistiinpano';
    note.value=state.notes[date]||'';
    noteLoaded=true;
    $('[data-personal-note-status]').textContent=note.value?'Tallennettu tähän selaimeen.':'Tallennetaan tähän selaimeen.';
    if(!editingTask)taskForm.elements.date.value=date;
    render();
  }
  function renderPrint() {
    const plan=weekPlan(state,selected);
    $('[data-personal-print-week]').innerHTML='<header><strong>Kalenteri365</strong><h2>Oma viikkosuunnitelma</h2><p>'+fi(parse(plan[0].date))+'–'+fi(parse(plan[6].date))+'</p></header>'+plan.map(item=>'<section><h3>'+esc(dayTitle(item.date))+'</h3>'+
      item.holidays.map(h=>'<p>'+esc(h.name)+'</p>').join('')+
      (item.events.length?'<ul>'+item.events.map(e=>'<li><strong>'+esc(e.time||'Koko päivä')+'</strong> '+esc(e.title)+'</li>').join('')+'</ul>':'<p>Ei merkittyjä tapahtumia.</p>')+
      (item.tasks.length?'<ul>'+item.tasks.map(t=>'<li>'+ (t.done?'☑':'☐')+' '+esc(t.title)+'</li>').join('')+'</ul>':'')+
      (item.note?'<p class="personal-print-note">'+esc(item.note)+'</p>':'')+'</section>').join('');
  }
  function render() {
    const current=today(),plan=weekPlan(state,selected),active=plan.find(item=>item.date===selected);
    const info=week(parse(selected));
    $('[data-personal-week-number]').textContent='VIIKKO '+info.number+' · '+info.year;
    $('[data-personal-week-range]').textContent=fi(parse(plan[0].date))+'–'+fi(parse(plan[6].date));
    $('[data-personal-events-count]').textContent=plan.reduce((n,item)=>n+item.events.length,0);
    $('[data-personal-tasks-count]').textContent=plan.reduce((n,item)=>n+item.tasks.filter(t=>!t.done).length,0);
    $('[data-personal-done-count]').textContent=plan.reduce((n,item)=>n+item.tasks.filter(t=>t.done).length,0);
    const focusedDate=document.activeElement?.dataset.personalDay;
    $('[data-personal-week]').innerHTML=plan.map((item,i)=>'<button type="button" data-personal-day="'+item.date+'" aria-pressed="'+(item.date===selected)+'"'+(item.date===current?' aria-current="date"':'')+' aria-label="'+esc(dayTitle(item.date)+', '+item.events.length+(item.events.length===1?' tapahtuma, ':' tapahtumaa, ')+item.tasks.filter(t=>!t.done).length+(item.tasks.filter(t=>!t.done).length===1?' avoin tehtävä':' avointa tehtävää'))+'"><span>'+['Ma','Ti','Ke','To','Pe','La','Su'][i]+'</span><strong>'+parse(item.date).getUTCDate()+'</strong><small>'+item.events.length+'<span class="personal-day-word">'+(item.events.length===1?' meno':' menoa')+'</span></small></button>').join('');
    if(focusedDate)$('[data-personal-day="'+focusedDate+'"]')?.focus({preventScroll:true});
    $('[data-personal-selected-heading]').textContent=dayTitle(selected);
    $('[data-personal-agenda]').innerHTML=active.holidays.map(h=>'<li class="personal-holiday"><span>'+icon('flag')+'</span><a href="/juhlapyhat/'+esc(h.slug)+'/">'+esc(h.name)+'</a></li>').join('')+
      (active.events.length?active.events.map(event=>'<li><time>'+esc(event.time||'Koko päivä')+'</time><button type="button" data-personal-edit-event="'+esc(event.id)+'"><span>'+esc(event.title)+'</span><small>'+esc(({personal:'Oma',work:'Työ',family:'Perhe',school:'Opiskelu'})[event.category]||'Oma')+(event.repeat&&event.repeat!=='none'?' · Toistuva':'')+'</small></button>'+icon('edit')+'</li>').join(''):'<li class="personal-empty">Tässä päivässä on vielä tilaa. Lisää meno tai pidä aikaa vapaana.</li>');
    const tasks=orderedTasks(state.tasks,{anchor:selected,filter,today:current});
    for(const button of root.querySelectorAll('[data-personal-task-filter]'))button.setAttribute('aria-pressed',String(button.dataset.personalTaskFilter===filter));
    $('[data-personal-tasks]').innerHTML=tasks.length?tasks.map(task=>{
      const priority=({high:'Tärkeä',normal:'Tavallinen',low:'Kun ehdit'})[task.priority]||'Tavallinen';
      return '<li class="'+(task.done?'is-done':'')+'"><label class="personal-task-check"><input type="checkbox" data-personal-toggle="'+esc(task.id)+'"'+(task.done?' checked':'')+'><span class="sr-only">'+esc((task.done?'Merkitse keskeneräiseksi: ':'Merkitse valmiiksi: ')+task.title)+'</span></label><div class="personal-task-description"><strong>'+esc(task.title)+'</strong><small><time datetime="'+esc(task.date||'')+'">'+(validDay(task.date)?fi(parse(task.date)):'Ei päivämäärää')+'</time><span class="personal-priority" data-priority="'+esc(task.priority||'normal')+'">'+priority+'</span>'+(!task.done&&task.date<current?'<span class="personal-overdue">Aiempi määräpäivä</span>':'')+'</small></div><div class="personal-task-actions"><button type="button" class="personal-icon-button" data-personal-schedule-task="'+esc(task.id)+'" aria-label="'+esc('Varaa kalenterista aika tehtävälle '+task.title)+'">'+icon('calendar')+'</button><button type="button" class="personal-icon-button" data-personal-edit-task="'+esc(task.id)+'" aria-label="'+esc('Muokkaa tehtävää '+task.title)+'">'+icon('edit')+'</button><button type="button" class="personal-icon-button" data-personal-remove-task="'+esc(task.id)+'" aria-label="'+esc('Poista tehtävä '+task.title)+'">'+icon('close')+'</button></div></li>';
    }).join(''):'<li class="personal-empty">'+(filter==='done'?'Valmiit tehtäväsi näkyvät tässä.':filter==='week'?'Valitulle viikolle ei ole avoimia tehtäviä.':'Ei avoimia tehtäviä. Lisää ensimmäinen tehtävä yllä.')+'</li>';
    $('[data-personal-task-undo]').hidden=!removedTask;
    renderPrint();
  }
  function resetTask() {
    editingTask=null;taskForm.reset();taskForm.elements.date.value=selected;
    $('[data-personal-task-submit]').innerHTML=icon('plus')+' Lisää tehtävä';
    $('[data-personal-task-cancel]').hidden=true;
  }
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-personal-day'))select(button.dataset.personalDay);
    if(button.hasAttribute('data-personal-week-step'))select(iso(add(parse(selected),Number(button.dataset.personalWeekStep)*7)));
    if(button.hasAttribute('data-personal-today'))select(today());
    if(button.hasAttribute('data-personal-add-event'))openEvent({date:selected});
    if(button.hasAttribute('data-personal-edit-event'))openEvent({id:button.dataset.personalEditEvent});
    if(button.hasAttribute('data-personal-task-filter')){filter=button.dataset.personalTaskFilter;render();}
    if(button.hasAttribute('data-personal-edit-task')){
      const task=state.tasks.find(t=>t.id===button.dataset.personalEditTask);if(!task)return;
      editingTask=task.id;taskForm.elements.title.value=task.title;
      taskForm.elements.date.value=validDay(task.date)?task.date:selected;
      taskForm.elements.priority.value=task.priority||'normal';
      $('[data-personal-task-submit]').innerHTML=icon('check')+' Tallenna muutokset';
      $('[data-personal-task-cancel]').hidden=false;taskForm.elements.title.focus();
    }
    if(button.hasAttribute('data-personal-task-cancel'))resetTask();
    if(button.hasAttribute('data-personal-remove-task')){
      const task=state.tasks.find(t=>t.id===button.dataset.personalRemoveTask);if(!task)return;
      if(commit(()=>{state.tasks=state.tasks.filter(t=>t.id!==task.id);},'Tehtävä poistettu. Voit kumota poiston.')){
        removedTask=task;render();$('[data-personal-task-undo]').focus();if(editingTask===task.id)resetTask();
      }
    }
    if(button.hasAttribute('data-personal-task-undo')&&removedTask){
      const restore=removedTask;
      if(commit(()=>{if(!state.tasks.some(t=>t.id===restore.id))state.tasks.push(restore);},'Tehtävä palautettu.')){removedTask=null;render();}
    }
    if(button.hasAttribute('data-personal-schedule-task')){
      const task=state.tasks.find(t=>t.id===button.dataset.personalScheduleTask);
      if(task)openEvent({id:'task-'+task.id,date:validDay(task.date)?task.date:selected,title:task.title});
    }
    if(button.hasAttribute('data-personal-export')){
      if(!saveNote())return;try{
        const text=personalWeekICS(state,selected),url=URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'}));
        const a=document.createElement('a');a.href=url;a.download='kalenteri365-oma-viikko-'+weekPlan(state,selected)[0].date+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
        $('[data-personal-export-status]').textContent='Viikon tapahtumat ladattiin. Tehtävät ja muistiinpanot ovat tulostettavassa suunnitelmassa.';
      }catch(error){$('[data-personal-export-status]').textContent=error.message;}
    }
    if(button.hasAttribute('data-personal-print')){if(!saveNote())return;renderPrint();window.print();}
  });
  root.addEventListener('change',event=>{
    const input=event.target;
    if(input.hasAttribute('data-personal-toggle')){
      const taskId=input.dataset.personalToggle;
      const saved=commit(()=>{
        const task=state.tasks.find(t=>t.id===taskId);if(task)task.done=input.checked;
      },input.checked?'Tehtävä merkitty valmiiksi.':'Tehtävä palautettu keskeneräiseksi.');
      if(saved)($('[data-personal-toggle="'+taskId+'"]')||$('[data-personal-task-filter="'+filter+'"]')).focus();
    }
  });
  $('[data-personal-week]').addEventListener('keydown',event=>{
    const button=event.target.closest('[data-personal-day]');if(!button)return;
    const offset=({ArrowLeft:-1,ArrowRight:1})[event.key];
    if(offset){event.preventDefault();const next=iso(add(parse(button.dataset.personalDay),offset));select(next);$('[data-personal-day="'+next+'"]')?.focus();}
  });
  $('#personal-date').addEventListener('change',event=>select(event.target.value));
  taskForm.addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const value=validateTask(Object.fromEntries(new FormData(taskForm)));
      const saved=commit(()=>{
        const task=state.tasks.find(t=>t.id===editingTask);
        if(task)Object.assign(task,value);else state.tasks.push({id:crypto.randomUUID(),...value,done:false});
      },editingTask?'Tehtävä päivitetty.':'Tehtävä lisätty listalle.');
      if(saved){resetTask();taskForm.elements.title.focus();}
    }catch(error){taskStatus(error.message);}
  });
  note.addEventListener('input',()=>{clearTimeout(noteTimer);$('[data-personal-note-status]').textContent='Tallennetaan…';noteTimer=setTimeout(saveNote,300);});
  note.addEventListener('blur',saveNote);
  window.addEventListener('beforeunload',event=>{if(!saveNote()){event.preventDefault();event.returnValue='';}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)saveNote();});
  document.querySelector('#event-dialog').addEventListener('close',render);
  window.addEventListener('community:updated',render);
  select(selected);resetTask();
}
