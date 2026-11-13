import {matchesCrop} from './garden-model.mjs';
export function initGardenPlanner({onAddEvent}) {
  const config=document.querySelector('#garden-config');
  if (!config) return;
  const crops=JSON.parse(config.textContent), form=document.querySelector('#garden-filters');
  const update=()=>{
    const values=Object.fromEntries(new FormData(form)), visible=new Set(crops.filter(c=>matchesCrop(c,values)).map(c=>c.slug));
    document.querySelectorAll('[data-garden-crop]').forEach(el=>el.hidden=!visible.has(el.dataset.gardenCrop));
    document.querySelector('#garden-count').textContent=visible.size+(visible.size===1?' kasvi':' kasvia');
    document.querySelector('#garden-empty').hidden=visible.size!==0;
  };
  form.addEventListener('input',update);
  form.addEventListener('change',update);
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('reset',()=>requestAnimationFrame(update));
  document.querySelectorAll('[data-garden-view]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-garden-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.querySelector('#garden-cards').hidden=button.dataset.gardenView!=='cards';
    document.querySelector('#garden-matrix').hidden=button.dataset.gardenView!=='year';
  }));
  const taskForm=document.querySelector('#garden-task-form');
  taskForm.addEventListener('submit',event=>{
    event.preventDefault();if(!taskForm.reportValidity())return;
    const values=Object.fromEntries(new FormData(taskForm));
    onAddEvent({date:values.date,title:values.crop+': '+values.activity,description:values.note||''});
  });
  document.querySelectorAll('[data-plan-crop]').forEach(button=>button.addEventListener('click',()=>{
    taskForm.elements.crop.value=button.dataset.planCrop;
    taskForm.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
    taskForm.elements.date.focus({preventScroll:true});
  }));
  update();
}
