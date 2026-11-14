import './calendar-downloads.js';
import {quantity} from './fi-language.mjs';
import {PENSION_PLANS,REMINDERS,paymentDates,pensionReport,paymentPath,pensionICS,paymentCSV,localPaymentEvents} from './pension-core.mjs';
import {pensionNext,pensionDateCards,pensionSubscription,pensionComparison} from './pension-view.mjs';
import {esc,icon} from './ui.mjs';
const todayFi=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const format=d=>new Intl.DateTimeFormat('fi-FI',{day:'numeric',month:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
export function connectPension({state,persist,onUpdate}){
 const root=document.querySelector('[data-pension-workspace]');if(!root)return;const $=s=>root.querySelector(s),saved=state.plans?.pensionWorkspace||{};let current=PENSION_PLANS.find(p=>p.id===(saved.plan||state.plans?.community?.paymentPlan))||PENSION_PLANS[0],view=saved.view==='table'?'table':'cards',today=todayFi(),selection=[],objectURL=null,lastTrigger=null;
 const institution=$('#pension-institution'),plan=$('#pension-plan'),month=$('#pension-month'),scope=$('#pension-scope'),reminder=$('#pension-reminder'),dialog=$('#pension-google-dialog');
 institution.value=current.institution;const planOptions=()=>{plan.innerHTML=PENSION_PLANS.filter(p=>p.institution===institution.value).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');};planOptions();plan.value=current.id;
 month.value=saved.month==='all'||/^([1-9]|1[0-2])$/.test(saved.month||'')?saved.month:'all';scope.value=saved.scope==='future'?'future':'all';reminder.value=REMINDERS.some(([v])=>v===saved.reminder)?saved.reminder:'1';
 const status=text=>{$('#pension-status').textContent=text;};
 const savePrefs=()=>{state.plans??={};const old=state.plans.pensionWorkspace;state.plans.pensionWorkspace={version:1,plan:current.id,view,month:month.value,scope:scope.value,reminder:reminder.value};if(!persist()){if(old===undefined)delete state.plans.pensionWorkspace;else state.plans.pensionWorkspace=old;status('Valinta toimii tässä näkymässä, mutta sen tallennus selaimeen ei onnistunut.');return false;}return true;};
 function render(save=false){
  current=PENSION_PLANS.find(p=>p.id===plan.value)||PENSION_PLANS[0];selection=paymentDates(current,{today,month:month.value,scope:scope.value});
  $('#pension-next').innerHTML=pensionNext(current,today);$('#pension-plan-note').innerHTML=`<strong>${esc(current.name)}</strong><p>${esc(current.note)}</p>`;
  $('#pension-source').innerHTML=`<a href="${esc(current.source)}" target="_blank" rel="noopener noreferrer">Lue maksajan ohje ${icon('arrow')}</a><span>Tarkistettu ${format(current.checked)}</span>`;
  $('#pension-print-label').textContent=current.institution+': '+current.name;
  $('#pension-dates').innerHTML=pensionDateCards(current,selection,{today,reminder:reminder.value,view});$('#pension-result-count').textContent=`${selection.length} / ${current.dates.length} maksupäivää · ${current.institution}`;
  root.querySelectorAll('[data-pension-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pensionView===view)));
  $('#pension-export-summary').textContent=selection.length?`Valittuna ${quantity(selection.length,'maksupäivä','maksupäivää')}: ${current.institution}, ${current.name}. Muistutus: ${REMINDERS.find(([v])=>v===reminder.value)[1].toLocaleLowerCase('fi-FI')}.`:'Rajauksessa ei ole maksupäiviä. Vaihda rajaus ennen vientiä.';
  if(objectURL){globalThis.Calendar365Downloads.release(objectURL);objectURL=null;}
  let href=paymentPath(current,reminder.value);if(selection.length!==current.dates.length){objectURL=URL.createObjectURL(new Blob([pensionICS(current,{dates:selection,reminder:reminder.value})],{type:'text/calendar;charset=utf-8'}));href=objectURL;}
  for(const id of ['pension-apple-file','pension-outlook-file','pension-google-file']){const a=$('#'+id);a.href=href;a.setAttribute('aria-disabled',String(!selection.length));if(id!=='pension-apple-file')a.download=`kalenteri365-${current.id}-2027.ics`;}
  for(const action of ['csv','add','google-help'])$(`[data-pension-action="${action}"]`).disabled=!selection.length;
  $('#pension-subscribe').innerHTML=pensionSubscription(current,reminder.value);
  if(save){if(!savePrefs())return false;status('Valinnat päivitetty.');}return true;
 }
 institution.addEventListener('change',()=>{planOptions();if(render(true)!==false)status(`Valittu ${current.institution}: ${current.name}.`);});plan.addEventListener('change',()=>{if(render(true)!==false)status(`Maksukalenteri vaihdettu: ${current.name}.`);});for(const el of [month,scope,reminder])el.addEventListener('change',()=>render(true));
 $('#pension-compare-month').addEventListener('change',e=>{$('#pension-comparison').innerHTML=pensionComparison(e.target.value);});
 root.addEventListener('click',async e=>{
  const link=e.target.closest('a[aria-disabled="true"]');if(link){e.preventDefault();return;}
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.pensionView){view=button.dataset.pensionView;render(true);return;}
  switch(button.dataset.pensionAction){
   case 'reset':month.value='all';scope.value='all';render(true);$('#pension-month').focus();break;
   case 'copy':{const field=$('#pension-feed-url');try{await navigator.clipboard.writeText(field.value);status('Kalenterin tilausosoite kopioitiin.');button.querySelector('span').textContent='Kopioitu';}catch{field.focus();field.select();status('Automaattinen kopiointi ei onnistunut. Osoite on valittu kopiointia varten.');}break;}
   case 'csv':{const url=URL.createObjectURL(new Blob([paymentCSV(current,selection)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`kalenteri365-${current.id}-2027.csv`;a.click();setTimeout(()=>globalThis.Calendar365Downloads.release(url),1000);status('Valitut maksupäivät ladattiin taulukkona.');break;}
   case 'add':{const existing=new Set(state.events.map(e=>e.id)),added=localPaymentEvents(current,selection).filter(e=>!existing.has(e.id));if(!added.length){status('Valitut maksupäivät ovat jo omassa kalenterissasi.');break;}const before=state.events;state.events=[...before,...added];if(!persist()){state.events=before;status('Maksupäiviä ei tallennettu. Tarkista selaimen tallennustila ja yritä uudelleen.');break;}onUpdate();status(`${added.length} ${added.length===1?'maksupäivä lisättiin':'maksupäivää lisättiin'} omaan kalenteriisi. Merkinnät näkyvät etusivulla ja Oma arki -näkymässä.`);break;}
   case 'google-help':lastTrigger=button;dialog.showModal();dialog.querySelector('button').focus();break;
   case 'close':dialog.close();break;
   case 'print':window.print();break;
  }
 });
 dialog.addEventListener('close',()=>lastTrigger?.isConnected&&lastTrigger.focus());document.body.dataset.pensionPage='true';render();
 const comparisonMonth=Number(pensionReport(current,today).next?.slice(5,7)||1);$('#pension-compare-month').value=String(comparisonMonth);$('#pension-comparison').innerHTML=pensionComparison(comparisonMonth);
 setInterval(()=>{const now=todayFi();if(now!==today){today=now;render();}},60000);
 window.addEventListener('pageshow',e=>{if(e.persisted)render();});
 window.addEventListener('pagehide',()=>{if(objectURL)globalThis.Calendar365Downloads.release(objectURL);});
}
