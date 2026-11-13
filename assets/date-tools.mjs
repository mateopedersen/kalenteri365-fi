import {countInterval,shiftDate} from './date-math.mjs';
import {serviceCalendar} from './finland-services-core.mjs';
const root=document.querySelector('[data-date-workspace]');
if(root){
 const $=s=>root.querySelector(s),diff=$('#date-diff'),adder=$('#date-add');
 const dateLabel=d=>new Intl.DateTimeFormat('fi-FI',{timeZone:'UTC',dateStyle:'long'}).format(new Date(d+'T12:00Z'));
 const weekday=d=>new Intl.DateTimeFormat('fi-FI',{timeZone:'UTC',weekday:'long'}).format(new Date(d+'T12:00Z'));
 let lastResult,lastDate,lastSettings;
 const setting=()=>({start:diff.elements.start.value,end:diff.elements.end.value,includeStart:diff.elements.includeStart.checked,includeEnd:diff.elements.includeEnd.checked,sixDays:diff.elements.sixDays.value==='1',eves:diff.elements.eves.checked});
 const run=()=>{
  try{const values=setting(),r=countInterval(values);lastResult=r;lastSettings=values;
   $('#calc-result').classList.remove('date-error');$('#calc-result').innerHTML=`<div class="date-result-title"><span>Valittu ajanjakso</span><strong>${dateLabel(r.start)} – ${dateLabel(r.end)}</strong></div><div class="date-result-grid"><div><span>Kalenteripäiviä</span><strong>${r.calendarDays.toLocaleString('fi-FI')}</strong><small>${r.weeks} viikkoa ja ${r.remainingDays} päivää</small></div><div><span>Työpäiviä</span><strong>${r.workDays===null?'—':r.workDays}</strong><small>${r.workDays===null?'Tuetut vuodet 2026–2030':values.sixDays?'Maanantai–lauantai':'Maanantai–perjantai'}</small></div></div><p>${values.includeStart?'Alkupäivä mukana.':'Alkupäivää ei lasketa.'} ${values.includeEnd?'Loppupäivä mukana.':'Loppupäivää ei lasketa.'}</p>${r.workDays===null?'<p>Kalenteripäivät on laskettu. Tälle ajanjaksolle ei näytetä Suomen pyhistä riippuvaa työpäivälukua.</p>':`<div class="date-breakdown"><span>${r.weekends} vapaata viikonloppupäivää</span><span>${r.publicHolidays} arkipyhää</span>${values.eves?`<span>${r.freeEves} vapaata aattoa</span>`:''}</div>`}<p class="date-iso">Alku: ${weekday(r.start)}, ISO-viikko ${r.startWeek.number}/${r.startWeek.year}. Loppu: ${weekday(r.end)}, ISO-viikko ${r.endWeek.number}/${r.endWeek.year}.</p>`;
   $('.date-result-actions').hidden=false;$('[data-date-status]').textContent='';
  }catch(e){lastResult=null;$('#calc-result').classList.add('date-error');$('#calc-result').textContent=e.message;$('.date-result-actions').hidden=true;}
 };
 const shift=()=>{
  try{const f=adder.elements,result=shiftDate({start:f.start.value,amount:Number(f.amount.value)*Number(f.direction.value),unit:f.unit.value,sixDays:f.sixDays.value==='1',eves:f.eves.checked});lastDate=result.date;
   $('#add-result').classList.remove('date-error');$('#add-result').innerHTML=`<div class="date-result-title"><span>Tulospäivä</span><strong>${dateLabel(result.date)}</strong></div><p>${weekday(result.date)} · ISO-viikko ${result.week.number}/${result.week.year}</p><p>${Math.abs(result.elapsedDays)} kalenteripäivää ${result.elapsedDays<0?'taaksepäin':'eteenpäin'} lähtöpäivästä.</p>${result.clamped?'<p>Kohdekuukaudessa ei ole samaa kuukaudenpäivää, joten käytössä on sen viimeinen päivä.</p>':''}${f.unit.value==='working'?'<p>Lähtöpäivää ei lasketa mukaan siirrettävien työpäivien määrään.</p>':''}`;
   $('[data-date-calendar]').hidden=false;$('[data-add-status]').textContent='';
  }catch(e){lastDate=null;$('#add-result').classList.add('date-error');$('#add-result').textContent=e.message;$('[data-date-calendar]').hidden=true;}
 };
 diff.addEventListener('submit',e=>{e.preventDefault();run();});adder.addEventListener('submit',e=>{e.preventDefault();shift();});
 $('[data-swap-dates]').addEventListener('click',()=>{const a=diff.elements.start.value;diff.elements.start.value=diff.elements.end.value;diff.elements.end.value=a;run();});
 root.querySelectorAll('[data-date-preset]').forEach(b=>b.addEventListener('click',()=>{const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki'}).format(new Date());diff.elements.start.value=today;diff.elements.end.value=b.dataset.datePreset==='today'?today:b.dataset.datePreset==='year'?today.slice(0,4)+'-12-31':shiftDate({start:today,amount:30}).date;run();}));
 const copy=async(value,status)=>{try{await navigator.clipboard.writeText(value);status.textContent='Kopioitu.';}catch{status.textContent='Kopiointi ei onnistunut. Voit valita ja kopioida tulostekstin.';}};
 $('[data-copy-date-result]').addEventListener('click',()=>lastResult&&copy($('#calc-result').innerText,$('[data-date-status]')));
 $('[data-copy-date-link]').addEventListener('click',()=>{const s=lastSettings||setting(),u=new URL(location.href);u.search='';for(const [k,v]of Object.entries(s))u.searchParams.set(k,String(v));copy(u.href,$('[data-date-status]'));});
 $('[data-date-calendar]').addEventListener('click',event=>{if(!lastDate)return;const file=serviceCalendar({id:'oma-paivamaara',date:lastDate,name:'Oma päivämäärä',applies:'Päivämäärälaskurilla valittu päivä.',source:'https://kalenteri365.fi/paivamaaralaskuri/'},'1'),u=URL.createObjectURL(new Blob([file],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='kalenteri365-'+lastDate+'.ics';a.click();const button=event.currentTarget;setTimeout(()=>button.focus({preventScroll:true}),0);setTimeout(()=>URL.revokeObjectURL(u),2000);$('[data-add-status]').textContent='ICS-tiedosto ladattu. Avaa se omassa kalenterisovelluksessasi.';});
 const q=new URL(location.href).searchParams;for(const key of ['start','end'])if(q.has(key))diff.elements[key].value=q.get(key);for(const key of ['includeStart','includeEnd','eves'])if(q.has(key))diff.elements[key].checked=q.get(key)==='true';if(q.has('sixDays'))diff.elements.sixDays.value=q.get('sixDays')==='true'?'1':'0';
 const options=adder.querySelector(".date-work-options");const showWork=()=>{options.hidden=adder.elements.unit.value!=="working";};adder.elements.unit.addEventListener("change",showWork);showWork();
 run();shift();
}
