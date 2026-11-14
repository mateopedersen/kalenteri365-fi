import {quantity} from './fi-language.mjs';
import {BENEFIT_PLANS,REMINDERS,paymentDates,benefitReport,paymentPath,benefitICS,paymentCSV,localPaymentEvents,normalBenefitEntry,normalBenefitEntries,ownBenefitICS,ownLocalEvent} from './benefit-core.mjs';
import {benefitNext,benefitDateCards,benefitSubscription,benefitGuides,ownBenefitCards} from './benefit-view.mjs';
const todayFi=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function connectBenefits({state,persist,onUpdate}){
 const root=document.querySelector('[data-benefit-workspace]');if(!root)return;const $=s=>root.querySelector(s),saved=state.plans?.benefitWorkspace||{},plan=BENEFIT_PLANS[0];let today=todayFi(),view=saved.view==='table'?'table':'cards',entries=normalBenefitEntries(saved.entries),selection=[],publishedURL=null,ownURLs=[],undo=null,lastTrigger=null;
 const month=$('#benefit-month'),scope=$('#benefit-scope'),reminder=$('#benefit-reminder'),ownReminder=$('#benefit-own-reminder'),dialog=$('#benefit-google-dialog');
 month.value=saved.month==='all'||/^([1-9]|1[0-2])$/.test(saved.month||'')?saved.month:'all';scope.value=saved.scope==='future'?'future':'all';reminder.value=REMINDERS.some(([v])=>v===saved.reminder)?saved.reminder:'1';ownReminder.value=REMINDERS.some(([v])=>v===saved.ownReminder)?saved.ownReminder:'1';
 const status=t=>$('#benefit-status').textContent=t,ownStatus=t=>$('#benefit-own-status').textContent=t;
 function write(candidate=entries){state.plans??={};const before=state.plans.benefitWorkspace;state.plans.benefitWorkspace={version:1,view,month:month.value,scope:scope.value,reminder:reminder.value,ownReminder:ownReminder.value,entries:candidate};if(!persist()){if(before===undefined)delete state.plans.benefitWorkspace;else state.plans.benefitWorkspace=before;return false;}entries=candidate;return true;}
 function renderPublished(save=false){selection=paymentDates(plan,{today,month:month.value,scope:scope.value});$('#benefit-next').innerHTML=benefitNext(plan,today);$('#benefit-dates').innerHTML=benefitDateCards(plan,selection,{today,reminder:reminder.value,view});$('#benefit-result-count').textContent=`${selection.length} / 12 julkaistua maksupäivää`;root.querySelectorAll('[data-benefit-view]').forEach(b=>b.setAttribute('aria-pressed',String(view===b.dataset.benefitView)));
  if(publishedURL)URL.revokeObjectURL(publishedURL);publishedURL=null;let href=paymentPath(plan,reminder.value);if(selection.length!==plan.dates.length){publishedURL=URL.createObjectURL(new Blob([benefitICS(plan,{dates:selection,reminder:reminder.value})],{type:'text/calendar;charset=utf-8'}));href=publishedURL;}
  for(const id of ['benefit-apple-file','benefit-outlook-file','benefit-google-file']){const a=$('#'+id);a.href=href;a.setAttribute('aria-disabled',String(!selection.length));if(id!=='benefit-apple-file')a.download='kalenteri365-lapsilisa-2027.ics';}
  for(const a of ['add','csv','google-help'])$(`[data-benefit-action="${a}"]`).disabled=!selection.length;
  $('#benefit-export-summary').textContent=selection.length?`Vientiin tulee ${quantity(selection.length,'maksupäivä','maksupäivää')}. Muistutus: ${REMINDERS.find(([v])=>v===reminder.value)[1].toLocaleLowerCase('fi-FI')}.`:'Valitulla rajauksella ei ole maksupäiviä. Vaihda rajaus ennen vientiä.';
  $('#benefit-subscribe').innerHTML=benefitSubscription(plan,reminder.value);
  if(save)status(write()?'Valinnat päivitetty.':'Valinta toimii tässä näkymässä, mutta sen tallennus selaimeen ei onnistunut.');
 }
 const clearOwnURLs=()=>{ownURLs.forEach(u=>URL.revokeObjectURL(u));ownURLs=[];};
 const ownURL=list=>{const u=URL.createObjectURL(new Blob([ownBenefitICS(list,ownReminder.value)],{type:'text/calendar;charset=utf-8'}));ownURLs.push(u);return u;};
 function renderOwn(){clearOwnURLs();const urls=Object.fromEntries(entries.map(e=>[e.id,ownURL([e])]));$('#benefit-own-list').innerHTML=ownBenefitCards(entries,{today,urls});$('#benefit-own-count').textContent=entries.length;const all=$('#benefit-own-download');all.disabled=!entries.length;$('[data-benefit-action="own-print"]').disabled=!entries.length;$('#benefit-own-undo').hidden=!undo;}
 const dateNote=()=>{$('#benefit-own-date-note').textContent=$('#benefit-own-date').value&&$('#benefit-own-date').value<today?'Valittu päivä on menneisyydessä. Menneestä muistutuksesta ei tule uutta ilmoitusta.':'';};
 $('#benefit-own-date').addEventListener('change',dateNote);
 for(const input of [month,scope,reminder])input.addEventListener('change',()=>renderPublished(true));
 ownReminder.addEventListener('change',()=>{ownStatus(write()?'Omien maksujen muistutusaika päivitettiin.':'Muistutusaika toimii tässä näkymässä, mutta tallennus ei onnistunut.');renderOwn();});
 $('#benefit-guide-group').addEventListener('change',e=>$('#benefit-guide-grid').innerHTML=benefitGuides(e.target.value));
 function addToCalendar(events,target){const ids=new Set(state.events.map(e=>e.id)),added=events.filter(e=>!ids.has(e.id));if(!added.length){target('Nämä maksut ovat jo Kalenteri365-kalenterissasi.');return;}const before=state.events;state.events=[...before,...added];if(!persist()){state.events=before;target('Maksuja ei tallennettu. Tarkista selaimen tallennustila ja yritä uudelleen.');return;}onUpdate?.();target(`${added.length} ${added.length===1?'maksu lisättiin':'maksua lisättiin'} Kalenteri365-kalenteriin. Merkinnät näkyvät etusivulla ja Oma arki -näkymässä.`);}
 $('#benefit-own-form').addEventListener('submit',e=>{e.preventDefault();if(!e.target.reportValidity())return;try{const item=normalBenefitEntry({type:$('#benefit-own-type').value,date:$('#benefit-own-date').value});if(entries.some(e=>e.id===item.id)){ownStatus('Tämä etuus on jo listassa samalle päivälle. Käytä sen kalenteripainikkeita.');return;}if(entries.length>=240){ownStatus('Listassa on jo 240 maksua. Poista vanhoja merkintöjä ennen uuden lisäämistä.');return;}const next=normalBenefitEntries([...entries,item]);if(!write(next)){ownStatus('Maksua ei tallennettu. Tarkista selaimen tallennustila.');return;}undo=null;renderOwn();$('#benefit-own-confirm').checked=false;ownStatus('Maksu tallennettiin. Avaa se nyt haluamassasi kalenterissa ja vahvista tuonti.');$('#benefit-own-list').scrollIntoView({block:'nearest',behavior:'auto'});}catch(err){ownStatus(err.message);}});
 $('#benefit-own-undo').addEventListener('click',()=>{if(!undo)return;if(!write(normalBenefitEntries([...entries,undo]))){ownStatus('Poiston peruminen ei onnistunut. Tarkista tallennustila.');return;}undo=null;renderOwn();ownStatus('Poistettu muistutus palautettiin.');});
 root.addEventListener('click',async e=>{if(e.target.closest('a[aria-disabled="true"]')){e.preventDefault();return;}const b=e.target.closest('button');if(!b)return;
  if(b.dataset.benefitView){view=b.dataset.benefitView;renderPublished(true);return;}
  if(b.dataset.guideType){$('#benefit-own-type').value=b.dataset.guideType;$('#omat-etuusmuistutukset').scrollIntoView({block:'start',behavior:'auto'});$('#benefit-own-date').focus({preventScroll:true});return;}
  if(b.dataset.ownAdd){const item=entries.find(e=>e.id===b.dataset.ownAdd);if(item)addToCalendar([ownLocalEvent(item)],ownStatus);return;}
  if(b.dataset.ownDelete){const item=entries.find(e=>e.id===b.dataset.ownDelete);if(!item)return;if(!write(entries.filter(e=>e.id!==item.id))){ownStatus('Muistutusta ei poistettu. Tallennus ei onnistunut.');return;}undo=item;renderOwn();ownStatus('Muistutus poistettiin tästä listasta. Jo muihin kalentereihin viedyt kopiot säilyvät niissä.');$('#benefit-own-undo').focus();return;}
  switch(b.dataset.benefitAction){
   case 'reset':month.value='all';scope.value='all';renderPublished(true);month.focus();break;
   case 'add':addToCalendar(localPaymentEvents(plan,selection),status);break;
   case 'csv':{const u=URL.createObjectURL(new Blob([paymentCSV(plan,selection)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='kalenteri365-lapsilisa-2027.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);status('Valitut maksupäivät ladattiin taulukkona.');break;}
   case 'copy':{const field=$('#benefit-feed-url');try{await navigator.clipboard.writeText(field.value);status('Lapsilisän tilausosoite kopioitiin.');b.querySelector('span').textContent='Kopioitu';}catch{field.focus();field.select();status('Automaattinen kopiointi ei onnistunut. Osoite on valittu kopiointia varten.');}break;}
   case 'google-help':lastTrigger=b;dialog.showModal();dialog.querySelector('button').focus();break;
   case 'close':dialog.close();break;
   case 'print':document.body.dataset.benefitPrint='published';window.print();break;
   case 'own-download':{if(!entries.length)break;const a=document.createElement('a');a.href=ownURL(entries);a.download='kalenteri365-omat-etuusmuistutukset.ics';a.click();ownStatus('Omat etuusmuistutukset ladattiin kalenteritiedostona.');break;}
   case 'own-print':document.body.dataset.benefitPrint='own';window.print();break;
  }
 });
 dialog.addEventListener('close',()=>lastTrigger?.isConnected&&lastTrigger.focus());document.body.dataset.benefitPage='true';document.body.dataset.benefitPrint='published';window.addEventListener('afterprint',()=>document.body.dataset.benefitPrint='published');
 renderPublished();renderOwn();const timer=setInterval(()=>{const next=todayFi();if(next!==today){today=next;renderPublished();renderOwn();dateNote();}},60000);
 window.addEventListener('pagehide',()=>{if(publishedURL)URL.revokeObjectURL(publishedURL);clearOwnURLs();});window.addEventListener('pageshow',e=>{if(e.persisted){renderPublished();renderOwn();}});
}
