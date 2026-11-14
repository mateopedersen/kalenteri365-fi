import {educationRecordHTML} from './education-levels-core.mjs';
import {slug} from './community-core.mjs';
const root=document.querySelector('[data-education-hub]');
if(root){
 const records=JSON.parse(document.querySelector('#education-level-records').textContent);
 const panes=[...root.querySelectorAll('[data-education-pane]')],buttons=[...root.querySelectorAll('[data-education-level]')];
 const selectLevel=id=>{
  if(!panes.some(p=>p.dataset.educationPane===id))id='alakoulu';
  for(const p of panes)p.hidden=p.dataset.educationPane!==id;
  for(const a of buttons)a.setAttribute('aria-current',String(a.dataset.educationLevel===id));
  root.querySelector('[data-education-current]').textContent=buttons.find(a=>a.dataset.educationLevel===id).querySelector('strong').textContent;
 };
 const perus=root.querySelector('[data-education-pane="alakoulu"]'),secondary=root.querySelector('[data-education-pane="ylakoulu"]'),shared=perus.querySelector('[data-education-shared]');
 const moveShared=()=>{const selected=buttons.find(a=>a.getAttribute('aria-current')==='true')?.dataset.educationLevel;const target=selected==='ylakoulu'?secondary.querySelector('[data-education-shared-target]'):perus;target.append(shared);};
 const setURL=(level,record)=>{const url=new URL(location.href);if(record){url.searchParams.set('oppilaitos',slug(record.institution));url.searchParams.set('lukuvuosi',record.academicYear.replace('/','-'));}else{url.searchParams.delete('oppilaitos');url.searchParams.delete('lukuvuosi');}url.hash='oppiaste-'+level;history.replaceState(null,'',url);};
 for(const a of buttons)a.addEventListener('click',e=>{e.preventDefault();const id=a.dataset.educationLevel;selectLevel(id);moveShared();setURL(id);});
 const providers=[];
 for(const form of root.querySelectorAll('[data-education-provider]')){
  const level=form.dataset.educationProvider,institution=form.querySelector('[name=institution]'),year=form.querySelector('[name=academicYear]'),workspace=form.closest('.education-provider'),result=workspace.querySelector('[data-education-record]'),items=records.filter(r=>r.level===level);
  const render=(keep=true,updateURL=false)=>{
   const available=items.filter(r=>r.institution===institution.value),wanted=keep?year.value:'';
   year.replaceChildren(...available.map(r=>new Option(r.academicYear.replace('/','–'),r.academicYear)));
   if(available.some(r=>r.academicYear===wanted))year.value=wanted;
   const record=available.find(r=>r.academicYear===year.value);
   if(!record)return;
   result.innerHTML=educationRecordHTML(record);
   for(const a of workspace.querySelectorAll('[data-education-institution]'))a.setAttribute('aria-current',String(a.dataset.educationInstitution===record.institution));
   if(updateURL)setURL(level,record);
  };
  const restore=()=>{const url=new URL(location.href),wanted=items.find(r=>slug(r.institution)===url.searchParams.get('oppilaitos')&&r.academicYear.replace('/','-')===url.searchParams.get('lukuvuosi'))||items.find(r=>slug(r.institution)===url.searchParams.get('oppilaitos'));if(wanted){institution.value=wanted.institution;year.replaceChildren(new Option(wanted.academicYear,wanted.academicYear));}render();};
  institution.addEventListener('change',()=>render(false,true));year.addEventListener('change',()=>render(true,true));
  form.addEventListener('submit',e=>{e.preventDefault();render(true,true)});
  workspace.querySelectorAll('[data-education-institution]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();institution.value=a.dataset.educationInstitution;render(true,true);if(matchMedia('(max-width:750px)').matches)form.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}));
  providers.push(restore);restore();
 }
 const restoreLevel=()=>{selectLevel(location.hash.startsWith('#oppiaste-')?location.hash.replace('#oppiaste-',''):'alakoulu');moveShared();};
 window.addEventListener('hashchange',restoreLevel);window.addEventListener('popstate',()=>{restoreLevel();providers.forEach(fn=>fn());});
 restoreLevel();
}
