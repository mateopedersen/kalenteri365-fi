import {schoolKey,schoolPeriods,schoolEvents,compareSchools,normalPreferences,nextSchoolBreak,nextPayment,slug,civil} from './community-core.mjs';
import {paymentEvents} from './payment-data.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dt=d=>new Intl.DateTimeFormat('fi-FI',{timeZone:'UTC',day:'numeric',month:'numeric',year:'numeric'}).format(civil(d));
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki'}).format(new Date());
const range=p=>dt(p.start)+' – '+dt(p.end);
const options=(items,selected)=>items.map(([v,l])=>`<option value="${esc(v)}" ${v===selected?'selected':''}>${esc(l)}</option>`).join('');
function subscription(url){
 const absolute='https://kalenteri365.fi'+url;
 return `<div class="calendar-subscription"><strong>Tilaa päivittyvä kalenteri</strong><p>Kalenterisovellus hakee muutokset tästä pysyvästä osoitteesta omalla päivitysaikataulullaan. Ladattu ICS-tiedosto on kertaluonteinen kopio.</p><label>Kalenterin osoite<input readonly value="${absolute}"></label><div class="community-actions"><button class="btn secondary" type="button" data-copy-feed="${absolute}">Kopioi osoite</button><a class="btn secondary" href="${absolute.replace('https:','webcal:')}">Avaa kalenterisovelluksessa</a><a href="https://support.google.com/calendar/answer/37100?hl=fi" target="_blank" rel="noopener">Google Kalenterin ohje</a></div></div>`;
}
export function connectCommunity({state,persist,onUpdate}){
 const data=JSON.parse(document.querySelector('#community-records')?.textContent||'{"schools":[],"payments":[]}');
 const prefs=normalPreferences(state.plans?.community);state.plans??={};
 const save=()=>{state.plans.community=prefs;return persist();};
 const status=(root,text)=>{const el=root.querySelector('[data-community-status]');if(el)el.textContent=text;};
 const addEvents=(root,events,family=false)=>{
  const before=family?(state.plans.familyWorkspace?.events||[]).length:state.events.length;
  let count=0;
  if(family){
   const f=state.plans.familyWorkspace??={version:1,members:[{id:'shared',name:'Yhteinen',color:'#0046a8'}],events:[],meals:{},shopping:{},week:events[0]?.date||today()};f.events??=[];
   for(const e of events){for(let date=e.date;date<(e.endDate||new Date(+civil(e.date)+86400000).toISOString().slice(0,10));date=new Date(+civil(date)+86400000).toISOString().slice(0,10)){
    const id=e.id+'-'+date;if(f.events.some(x=>x.id===id))continue;f.events.push({id,date,title:e.name,person:'shared',time:''});count++;
   }}
  }else{
   for(const e of events){for(let date=e.date;date<(e.endDate||new Date(+civil(e.date)+86400000).toISOString().slice(0,10));date=new Date(+civil(date)+86400000).toISOString().slice(0,10)){
    const id=e.id+'-'+date;if(state.events.some(x=>x.id===id))continue;state.events.push({id,date,title:e.name,time:'',category:e.id.startsWith('school-')?'school':'personal',note:e.applies||'',repeat:'none',interval:1,until:'',exdates:[]});count++;
   }}
  }
  if(!save()){status(root,'Tallennus ei onnistunut. Tarkista selaimen tallennustila.');return;}
  onUpdate?.();status(root,count?`${count} merkintää lisättiin ${family?'perhekalenteriin':'omaan kalenteriin'}.`:'Nämä merkinnät ovat jo kalenterissa.');
  if(family){const a=document.createElement('a');a.href='/perhekalenteri/';a.textContent='Avaa perhekalenteri';a.className='btn secondary';root.querySelector('[data-community-status]')?.append(' ',a);}
 };
 for(const root of document.querySelectorAll('[data-community]')){
  const $=s=>root.querySelector(s);
  root.addEventListener('click',async e=>{const button=e.target.closest('[data-copy-feed]');if(!button)return;try{await navigator.clipboard.writeText(button.dataset.copyFeed);button.textContent='Osoite kopioitu';}catch{button.closest('.calendar-subscription').querySelector('input')?.select();button.textContent='Valitse ja kopioi osoite';}});
  if($('[data-school-city]')){
   const city=$('[data-school-city]'),language=$('[data-school-language]'),year=$('[data-school-year]');
   let current;
   city.value=root.dataset.initialCity||prefs.municipality;
   if(!city.value)city.value='Helsinki';language.value=prefs.language;
   const update=(keepYear=true)=>{
    const all=data.schools.filter(r=>r.municipality===city.value);
    const langs=[...new Set(all.map(r=>r.language))];
    language.innerHTML=options(langs.map(l=>[l,l==='sv'?'Ruotsi':'Suomi']),langs.includes(language.value)?language.value:'fi');
    const records=all.filter(r=>r.language===language.value),years=records.map(r=>r.academicYear);
    const wanted=keepYear?(year.value||prefs.academicYear):prefs.academicYear;
    year.innerHTML=options(years.map(y=>[y,y.replace('/','–')]),years.includes(wanted)?wanted:years[0]);
    current=records.find(r=>r.academicYear===year.value);
    if(!current){$('[data-school-result]').textContent='Valitulle koululle ei ole julkaistua kalenteria.';return;}
    prefs.municipality=city.value;prefs.language=language.value;prefs.academicYear=year.value;state.plans.schoolHolidayPeriods=schoolPeriods(current,true);save();
    const full=$('[data-school-weekends]')?.checked,periods=schoolPeriods(current,full);
    if(root.dataset.community==='home'){
     const next=nextSchoolBreak(records,today());$('[data-school-result]').innerHTML=next?`<div class="community-next"><small>${next.start<=today()?'Loma on käynnissä':'Seuraava koululoma'}</small><strong>${esc(next.label)}</strong><span>${range(next)}</span></div>`:'<p>Seuraavaa lomaa ei ole vielä julkaistu.</p>';
    }else{
     $('[data-school-result]').innerHTML=`<div class="community-school-meta"><strong>${esc(current.municipality)} · ${esc(current.academicYear.replace('/','–'))}</strong><span>Perusopetus · ${current.language==='sv'?'Ruotsi':'Suomi'}</span></div><div class="community-table-wrap" tabindex="0" role="region" aria-label="Kalenterin päivämäärät"><table class="community-table"><thead><tr><th scope="col">Loma</th><th scope="col">Alkaa</th><th scope="col">Päättyy</th></tr></thead><tbody>${periods.map(p=>`<tr><th scope="row">${esc(p.label)}</th><td>${dt(p.start)}</td><td>${dt(p.end)}</td></tr>`).join('')}</tbody></table></div><p>${esc(current.notes_fi)}</p>${full?'<p class="community-scope">Vieressä olevat lauantait ja sunnuntait on liitetty lomajaksoon. Arkipyhiä tai koulukohtaisia lisävapaita ei oleteta.</p>':''}<p class="community-source"><a href="${esc(current.source)}" target="_blank" rel="noopener">Kunnan alkuperäinen julkaisu</a> · Tarkistettu ${dt(current.checked)}</p>`;
    }
    const sub=$('[data-school-subscription]');if(sub)sub.innerHTML=subscription('/kalenterit/koululomat-'+slug(current.municipality)+'-'+current.language+'.ics');
    compare();
   };
   const compare=()=>{
    const target=$('[data-school-comparison]');if(!target||!current)return;
    const name=$('[data-school-compare]').value,b=data.schools.find(r=>r.municipality===name&&r.academicYear===current.academicYear&&r.language===current.language);
    if(!b){target.innerHTML=`<p>${esc(name)}: valitulle lukuvuodelle ja opetuskielelle ei ole vahvistettua tietoa. Valitse toinen paikkakunta tai vuosi.</p>`;return;}
    const matches=compareSchools(current,b,$('[data-school-weekends]')?.checked);
    target.innerHTML=`<h3>Yhteiset lomapäivät</h3><p>${esc(current.municipality)} ja ${esc(b.municipality)} · ${esc(current.academicYear.replace('/','–'))}</p>${matches.length?'<ul class="community-overlap">'+matches.map(p=>`<li><strong>${esc([...new Set(p.labels)].join(' / '))}</strong><span>${range(p)}</span><span>${p.days} päivää</span></li>`).join('')+'</ul>':'<p>Julkaistut lomajaksot eivät osu päällekkäin.</p>'}<a href="${esc(b.source)}" target="_blank" rel="noopener">${esc(b.municipality)}: alkuperäinen julkaisu</a>`;
   };
   city.addEventListener('change',()=>update(false));language.addEventListener('change',()=>update(false));year.addEventListener('change',()=>update());$('[data-school-weekends]')?.addEventListener('change',()=>update());$('[data-school-compare]')?.addEventListener('change',compare);
   $('[data-school-add]')?.addEventListener('click',()=>current&&addEvents(root,schoolEvents(current)));
   $('[data-school-family]')?.addEventListener('click',()=>current&&addEvents(root,schoolEvents(current),true));
   $('[data-school-vacation]')?.addEventListener('click',()=>{save();location.href='/lomasuunnittelija/#koululoma';});
   update(false);
  }
  if(root.dataset.community==='payments'){
   const institution=$('[data-payment-institution]'),selector=$('[data-payment-plan]'),plans=data.payments.filter(p=>p.kind===root.dataset.paymentKind);let current;
   const update=(reset=false)=>{
    if(reset)selector.innerHTML=options(plans.filter(p=>p.institution===institution.value).map(p=>[p.id,p.name]),'');
    current=plans.find(p=>p.id===selector.value)||plans[0];
    prefs.paymentPlan=current.id;save();const next=nextPayment(current,today());
    $('[data-payment-next]').innerHTML=`<small>${next?'Seuraava julkaistu maksupäivä':'Vuoden kalenteri päättynyt'}</small><strong>${next?dt(next):'2027'}</strong><span>${esc(current.name)}</span>`;
    $('[data-payment-note]').textContent=current.note;
    $('[data-payment-table]').innerHTML=`<div class="community-table-wrap" tabindex="0" role="region" aria-label="Kalenterin päivämäärät"><table class="community-table"><thead><tr><th scope="col">Kuukausi</th><th scope="col">Maksupäivä</th></tr></thead><tbody>${current.dates.map(d=>`<tr ${d===next?'class="next-payment"':''}><th scope="row">${new Intl.DateTimeFormat('fi-FI',{month:'long',timeZone:'UTC'}).format(civil(d))}</th><td><time datetime="${d}">${dt(d)}</time></td></tr>`).join('')}</tbody></table></div>`;
    const url='/kalenterit/maksut-'+current.id+'.ics';$('[data-payment-download]').href=url;$('[data-payment-subscription]').innerHTML=subscription(url);
    $('[data-payment-source]').innerHTML=`<a href="${esc(current.source)}" target="_blank" rel="noopener">Maksajan alkuperäinen taulukko</a> · Tarkistettu ${dt(current.checked)}`;
   };
   const previous=plans.find(p=>p.id===prefs.paymentPlan);if(previous){institution.value=previous.institution;selector.innerHTML=options(plans.filter(p=>p.institution===previous.institution).map(p=>[p.id,p.name]),previous.id);}
   institution.addEventListener('change',()=>update(true));selector.addEventListener('change',()=>update());$('[data-payment-add]').addEventListener('click',()=>addEvents(root,paymentEvents(current)));update();
  }
  if(root.dataset.community==='home'){
   const interests=[...root.querySelectorAll('.community-interests input')];
   const refresh=()=>{for(const id of ['school','admissions','payments'])$('[data-personal-'+id+']').hidden=!prefs.interests.includes(id);};
   for(const input of interests){input.checked=prefs.interests.includes(input.value);input.addEventListener('change',()=>{prefs.interests=interests.filter(i=>i.checked).map(i=>i.value);save();refresh();});}refresh();
   const payment=$('[data-personal-payment]');payment.value=prefs.paymentPlan;
   const pay=()=>{prefs.paymentPlan=payment.value;save();const p=data.payments.find(p=>p.id===payment.value),next=nextPayment(p,today());$('[data-personal-payment-next]').innerHTML=p?`<p><strong>${next?dt(next):'Ei myöhempää julkaistua päivää'}</strong> · ${esc(p.name)}</p><a href="/${p.kind==='benefit'?'etuuksien':'elakkeiden'}-maksupaivat/">Avaa maksukalenteri</a>`:'';};payment.addEventListener('change',pay);if(payment.value)pay();
   const own=state.events.filter(e=>e.date>=today()&&!(e.id||'').startsWith('school-')).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);if(own.length)$('[data-personal-dates]').innerHTML='<h3>Omat seuraavat merkinnät</h3><ul>'+own.map(e=>`<li><time datetime="${esc(e.date)}">${dt(e.date)}</time> ${esc(e.title)}</li>`).join('')+'</ul>';
  }
 }
 for(const el of document.querySelectorAll('[data-name-days]'))fetch('/api/namedays',{credentials:'omit'}).then(async r=>{if(!r.ok)return;const result=await r.json();if(result.date!==today()||!Array.isArray(result.fi)||!Array.isArray(result.sv))return;el.innerHTML=`<p><strong>Suomi:</strong> ${result.fi.map(esc).join(', ')||'Ei nimipäivää'}</p><p><strong>Ruotsi:</strong> ${result.sv.map(esc).join(', ')||'Ei nimipäivää'}</p><small>${dt(result.date)} · Helsingin yliopiston almanakkatoimisto</small>`;}).catch(()=>{});
}
