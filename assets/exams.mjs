import './calendar-downloads.js';
import {filterExams,examCalendarFile} from './exam-core.mjs';
import {esc,icon} from './ui.mjs';
const root=document.querySelector('[data-exam-workspace]');
if(root){
  const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
  const records=JSON.parse($('#exam-records').textContent), byId=new Map(records.map(e=>[e.id,e]));
  const form=$('#exam-filters'), fields={query:$('#exam-query'),season:$('#exam-season'),family:$('#exam-family')};
  const storageKey='kalenteri365-exam-plan-v1';let selected=new Set(),visible=records;
  const shortDate=date=>new Intl.DateTimeFormat('fi-FI',{timeZone:'UTC',day:'numeric',month:'numeric'}).format(new Date(date+'T12:00Z'));
  const status=$('#exam-own-status');
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify({ids:[...selected],reminder:$('#exam-reminder').value}));status.textContent='Valinnat tallennettu tähän selaimeen.';}catch{status.textContent='Valinta toimii tällä sivulla. Selaimeen tallentaminen ei onnistunut; lataa kalenteritiedosto talteen.';}}
  function renderSelection(){
    $('#exam-selected-count').textContent=selected.size;
    $('[data-exam-toggle] span').textContent=(root.querySelector('.matric-own').classList.contains('is-open')?'Sulje oma koekalenteri':'Avaa oma koekalenteri')+(selected.size?' ('+selected.size+')':'');
    $('#exam-selected').innerHTML=selected.size?records.filter(e=>selected.has(e.id)).map(e=>`<li><time datetime="${e.date}">${shortDate(e.date)}</time><span>${esc(e.title)}<small>${e.season==='kevaan'?'Kevät':'Syksy'} 2027</small></span><button type="button" data-exam-remove="${e.id}" aria-label="Poista ${esc(e.title)}, ${shortDate(e.date)}">${icon('close')}</button></li>`).join(''):'<li class="matric-own-empty">Omat päivät tulevat tähän.<br>Valitse ensimmäinen koepäivä listasta.</li>';
    for(const check of $$('[data-exam-pick]')){const chosen=selected.has(check.value);check.checked=chosen;check.closest('.matric-day').classList.toggle('is-selected',chosen);check.closest('label').querySelector('[data-pick-label]').textContent=chosen?'Valittu':'Valitse päivä';}
    $('[data-exam-download]').disabled=!selected.size;$('[data-exam-clear]').disabled=!selected.size;
    $('[data-exam-print]').disabled=!selected.size&&!visible.length;
  }
  function renderFilter(){
    visible=filterExams(records,Object.fromEntries(Object.entries(fields).map(([k,e])=>[k,e.value])));
    const ids=new Set(visible.map(e=>e.id));
    for(const row of $$('[data-exam-id]'))row.hidden=!ids.has(row.dataset.examId);
    for(const section of $$('[data-exam-section]')){const count=visible.filter(e=>e.season===section.dataset.examSection).length;section.hidden=!count;section.querySelector('[data-exam-season-count]').textContent=count+' / '+records.filter(e=>e.season===section.dataset.examSection).length+' koepäivää';}
    $('#exam-filter-status').textContent=visible.length+(visible.length===1?' koepäivä':' koepäivää')+' / '+records.length;
    $('[data-exam-empty]').hidden=!!visible.length;$('[data-exam-select-visible]').disabled=!visible.length;
    $('[data-exam-print]').disabled=!selected.size&&!visible.length;
  }
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&Array.isArray(saved.ids))selected=new Set(saved.ids.filter(id=>byId.has(id)));if(['none','previous-evening','hour'].includes(saved?.reminder))$('#exam-reminder').value=saved.reminder;}catch{status.textContent='Aiemman valinnan lukeminen ei onnistunut. Voit valita koepäivät uudelleen.';}
  form.addEventListener('submit',e=>e.preventDefault());
  for(const field of Object.values(fields))field.addEventListener(field.type==='search'?'input':'change',renderFilter);
  form.addEventListener('reset',e=>{e.preventDefault();fields.query.value='';fields.season.value='all';fields.family.value='all';renderFilter();});
  root.addEventListener('change',e=>{if(e.target.matches('[data-exam-pick]')){if(e.target.checked)selected.add(e.target.value);else selected.delete(e.target.value);renderSelection();persist();}if(e.target.id==='exam-reminder')persist();});
  root.addEventListener('click',e=>{
    const toggle=e.target.closest('[data-exam-toggle]');
    if(toggle){const open=root.querySelector('.matric-own').classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.querySelector('span').textContent=open?'Sulje oma koekalenteri':'Avaa oma koekalenteri';}
    const remove=e.target.closest('[data-exam-remove]');
    if(remove){selected.delete(remove.dataset.examRemove);renderSelection();persist();$('#exam-own-heading').tabIndex=-1;$('#exam-own-heading').focus({preventScroll:true});}
    const jump=e.target.closest('[data-exam-jump]');
    if(jump){form.reset();fields.season.value=jump.dataset.examJump;renderFilter();}
    if(e.target.closest('[data-exam-select-visible]')){visible.forEach(e=>selected.add(e.id));renderSelection();persist();}
    if(e.target.closest('[data-exam-clear]')){selected.clear();renderSelection();persist();}
    if(e.target.closest('[data-exam-download]')){
      const content=examCalendarFile(records.filter(e=>selected.has(e.id)),{reminder:$('#exam-reminder').value});
      globalThis.Calendar365Downloads.save(content,'kalenteri365-omat-ylioppilaskokeet-2027.ics','text/calendar;charset=utf-8');
      status.textContent=selected.size+' koepäivän tiedosto ladattu. Avaa tai tuo se omaan kalenterisovellukseesi.';
    }
    if(e.target.closest('[data-exam-print]')){preparePrint();window.print();}
  });
  const sheet=document.createElement('section');sheet.className='matric-print-sheet';sheet.setAttribute('aria-label','Tulostettava koekalenteri');root.append(sheet);
  function preparePrint(){
    const chosen=selected.size?records.filter(e=>selected.has(e.id)):visible;
    sheet.innerHTML=`<h1>${selected.size?'Omat ylioppilaskokeet':'Ylioppilaskirjoitukset'} 2027</h1><p>Kokeet alkavat klo 9.00 Suomen aikaa. Saavu oman lukiosi ohjeen mukaan.</p><table><thead><tr><th scope="col">Koepäivä</th><th scope="col">Koe ja oppiaineet</th></tr></thead><tbody>${chosen.map(e=>`<tr><td>${new Intl.DateTimeFormat('fi-FI',{timeZone:'UTC',weekday:'short',day:'numeric',month:'numeric',year:'numeric'}).format(new Date(e.date+'T12:00Z'))}<br>klo 9.00</td><td><strong>${esc(e.title)}</strong><p>${e.details.map(esc).join('<br>')}</p></td></tr>`).join('')}</tbody></table><footer>Kalenteri365 · kalenteri365.fi/ylioppilaskirjoitukset/<br>Koepäivät: Ylioppilastutkintolautakunta · Tarkistettu 14.11.2026.<br>Valinta ei korvaa ilmoittautumista. Tarkista oma oppiaineesi ja oppimääräsi.</footer>`;
  }
  window.addEventListener('beforeprint',preparePrint);
  renderFilter();renderSelection();
}
