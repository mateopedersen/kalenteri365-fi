import {educationRecordHTML} from './education-levels-core.mjs';
const root=document.querySelector('[data-education-hub]');
if(root){const records=JSON.parse(document.querySelector('#education-level-records').textContent);const panes=[...root.querySelectorAll('[data-education-pane]')],buttons=[...root.querySelectorAll('[data-education-level]')];
 const selectLevel=id=>{if(!panes.some(p=>p.dataset.educationPane===id))id='alakoulu';for(const p of panes)p.hidden=p.dataset.educationPane!==id;for(const a of buttons){const current=a.dataset.educationLevel===id;a.setAttribute('aria-current',current?'true':'false');}root.querySelector('[data-education-current]').textContent=buttons.find(a=>a.dataset.educationLevel===id).querySelector('strong').textContent;};
 for(const a of buttons)a.addEventListener('click',e=>{e.preventDefault();const id=a.dataset.educationLevel;selectLevel(id);history.replaceState(null,'','#oppiaste-'+id);});
 // Alakoulu and yläkoulu intentionally share the municipality's perusopetus record.
 const perus=root.querySelector('[data-education-pane="alakoulu"]');const secondary=root.querySelector('[data-education-pane="ylakoulu"]');
 const shared=perus.querySelector('[data-education-shared]');
 const moveShared=()=>{const selected=buttons.find(a=>a.getAttribute('aria-current')==='true')?.dataset.educationLevel;const target=selected==='ylakoulu'?secondary.querySelector('[data-education-shared-target]'):perus;target.append(shared);};
 buttons.forEach(a=>a.addEventListener('click',moveShared));window.addEventListener('hashchange',()=>{selectLevel(location.hash.replace('#oppiaste-',''));moveShared()});
 for(const form of root.querySelectorAll('[data-education-provider]')){const level=form.dataset.educationProvider,institution=form.querySelector('[name=institution]'),year=form.querySelector('[name=academicYear]'),result=form.parentElement.querySelector('[data-education-record]'),items=records.filter(r=>r.level===level);
  const render=(keep=true)=>{const available=items.filter(r=>r.institution===institution.value),wanted=keep?year.value:'';year.replaceChildren(...available.map(r=>new Option(r.academicYear.replace('/','–'),r.academicYear)));if(available.some(r=>r.academicYear===wanted))year.value=wanted;const r=available.find(r=>r.academicYear===year.value);if(r)result.innerHTML=educationRecordHTML(r);};institution.addEventListener('change',()=>render(false));year.addEventListener('change',()=>render());form.addEventListener('submit',e=>{e.preventDefault();render()});render();}
 selectLevel(location.hash.startsWith('#oppiaste-')?location.hash.replace('#oppiaste-',''):'alakoulu');moveShared();
}
