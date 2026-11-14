import './calendar-downloads.js';
import {CITIES,add,parse,iso} from './calendar.mjs';
import {dayEvents} from './solar-day.mjs';
import {serviceCalendar,flagHours,daylightDifference} from './finland-services-core.mjs';
import {ADMISSION_ROUTES} from './finland-services-data.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const records=JSON.parse($('#service-records')?.textContent||'[]');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const download=(name,text)=>globalThis.Calendar365Downloads.save(text,name,'text/calendar;charset=utf-8');
function filter(){
 const kind=$('[data-services]')?.dataset.services;
 let count=0;
 for(const card of $$('[data-service-event]')){
  const e=records.find(r=>r.id===card.dataset.serviceEvent);if(!e)continue;
  let visible=true;
  if(kind==='tax')visible=$('#tax-audience').value==='personal'?e.type!=='business'&&($('#tax-type').value==='all'||e.type===$('#tax-type').value):e.type==='business'&&e.period.startsWith('Verokausi '+$('#tax-period').value);
  if(kind==='admissions')visible=e.route===$('#admission-route').value||e.route==='exam-results';
  if(kind==='flags')visible=$$('[data-services="flags"] input[type="checkbox"]:checked').some(c=>c.value===e.region);
  card.hidden=!visible;if(visible)count++;
 }
 if($('[data-service-count]'))$('[data-service-count]').textContent=count+(count===1?' päivämäärä':' päivämäärää')+' valinnallasi';
 if(kind==='tax'){$('#tax-period').closest('label').hidden=$('#tax-audience').value!=='business';$('#tax-type').closest('label').hidden=$('#tax-audience').value!=='personal';}
 if(kind==='admissions')$('[data-start-term]').textContent='Opinnot: '+ADMISSION_ROUTES.find(r=>r.id===$('#admission-route').value).start.toLocaleLowerCase('fi');
}
$$('.service-filter select,.service-regions input').forEach(e=>e.addEventListener('change',filter));filter();
$$('[data-service-event] a[download]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();const e=records.find(r=>r.id===a.closest('[data-service-event]').dataset.serviceEvent);download('kalenteri365-'+e.id+'.ics',serviceCalendar(e));}));
for(const form of $$('[data-services] form,#personal-tax-form'))form.addEventListener('submit',event=>{
 event.preventDefault();const status=form.querySelector('[data-personal-status]');
 try{const f=new FormData(form),name=String(f.get('name')||'').trim();if(!name)throw Error('Kirjoita muistutuksen nimi.');const e={id:'oma-muistutus',date:String(f.get('date')),name,applies:'Itse asettamasi henkilökohtainen muistutus.',source:location.origin+location.pathname};download('kalenteri365-oma-muistutus.ics',serviceCalendar(e,String(f.get('reminder'))));if(status)status.textContent='Muistutus ladattu. Avaa tiedosto omassa kalenterisovelluksessasi.';}catch(e){if(status)status.textContent=e.message;}
});
let astro;
const astronomy=()=>astro??=import('./vendor/astronomy-engine.mjs');
let flagSequence=0;
async function updateFlag(){if(!$('#flag-date'))return;const seq=++flagSequence,out=$('#flag-result'),ds=$('#flag-date').value,city=CITIES.find(c=>c[0]===$('#flag-city').value);if(!/^2027-\d{2}-\d{2}$/.test(ds)){out.textContent='Valitse päivämäärä vuodelta 2027.';return;}
 try{const A=await astronomy(),r=dayEvents(A,city,ds),events=records.filter(e=>e.date===ds&&e.region==='finland'),midsummer=events.some(e=>e.slug==='juhannuspaiva'),election=events.some(e=>e.slug==='eduskuntavaalit'),hours=flagHours(ds,{sunset:r.set,polar:r.polar,midsummer,election});if(seq!==flagSequence)return;
 out.innerHTML=`<div><p class="eyebrow">${escape(city[1])} · ${escape(new Intl.DateTimeFormat('fi-FI',{dateStyle:'long'}).format(new Date(ds+'T12:00Z')))}</p><h3>${events.length?events.map(e=>escape(e.name)).join(' &amp; '):'Ei valtakunnallista liputuspäivää'}</h3><p>${events.length?events.map(e=>e.flagClass==='official'?'Virallinen liputuspäivä':'Vakiintunut liputuspäivä').join(' · '):'Lipun saa nostaa myös omana juhlapäivänä. Alla on tavallisen liputuksen aikaväli.'}</p></div><dl><div><dt>Lippu ylös</dt><dd>${hours.start}</dd></div><div><dt>Lippu alas</dt><dd>${hours.end}</dd></div></dl><p>${hours.reason}</p>`;
 }catch(e){out.textContent='Laskenta ei onnistunut. Yritä uudelleen.';}
}
$('#flag-city')?.addEventListener('change',updateFlag);$('#flag-date')?.addEventListener('change',updateFlag);updateFlag();
const human=n=>`${Math.floor(Math.abs(n)/60)} h ${Math.abs(n)%60} min`;
const polarCache=new Map();let polarSequence=0;
async function updateLight(){if(!$('#light-date'))return;const request=++polarSequence;const polarButton=$('#polar-periods');if(polarButton)polarButton.disabled=false;const out=$('#light-result'),ds=$('#light-date').value,city=CITIES.find(c=>c[0]===$('#light-city').value);try{const A=await astronomy();if(request!==polarSequence)return;const r=dayEvents(A,city,ds),prev=dayEvents(A,city,iso(add(parse(ds),-1))),delta=daylightDifference(r.duration,prev.duration);out.innerHTML=`<article><span>Päivän pituus</span><strong>${human(r.duration)}</strong></article><article><span>Ero eiliseen</span><strong>${delta>0?'+':delta<0?'−':''}${human(delta)}</strong><small>${delta>0?'Päivä pitenee':delta<0?'Päivä lyhenee':'Sama pituus minuutin tarkkuudella'}</small></article><article><span>Aurinko</span><strong>${r.polar==='up'?'Yötön yö':r.polar==='down'?'Kaamos':'Nousee ja laskee'}</strong><small>${escape(city[1])}</small></article>`;$('#polar-result').textContent='';}catch(e){if(request===polarSequence)out.textContent='Tarkista päivämäärä.';}}
$('#light-city')?.addEventListener('change',updateLight);$('#light-date')?.addEventListener('change',updateLight);updateLight();
$('#polar-periods')?.addEventListener('click',async()=>{
 const seq=++polarSequence,button=$('#polar-periods'),out=$('#polar-result'),city=CITIES.find(c=>c[0]===$('#light-city').value),year=Number($('#light-date').value.slice(0,4)),key=city[0]+year;button.disabled=true;out.textContent='Lasketaan paikallisen horisontin mukaan…';
 try{const A=await astronomy();let periods=polarCache.get(key);if(!periods){periods=[];let active=null;for(let d=new Date(Date.UTC(year,0,1)),i=0;d.getUTCFullYear()===year;d=new Date(+d+86400000),i++){const ds=iso(d),r=dayEvents(A,city,ds);if(r.polar){if(active?.kind===r.polar)active.end=ds;else {active={kind:r.polar,start:ds,end:ds};periods.push(active);}}else active=null;if(seq!==polarSequence)return;if(i%24===0)await new Promise(resolve=>setTimeout(resolve,0));}polarCache.set(key,periods);}if(seq!==polarSequence)return;const fmt=s=>new Intl.DateTimeFormat('fi-FI',{dateStyle:'medium'}).format(new Date(s+'T12:00Z'));out.innerHTML=periods.length?`<h3>${escape(city[1])} ${year}</h3><ul>${periods.map(p=>`<li><strong>${p.kind==='up'?'Yötön yö':'Kaamos'}</strong>: ${fmt(p.start)} – ${fmt(p.end)}</li>`).join('')}</ul>`:`<p>${escape(city[1])}: vuonna ${year} ei ole kokonaisia paikallisia vuorokausia, jolloin Aurinko pysyy jatkuvasti horisontin ylä- tai alapuolella.</p>`;}catch(e){if(seq===polarSequence)out.textContent='Laskentaa ei voitu tehdä. Yritä uudelleen.';}finally{if(seq===polarSequence)button.disabled=false;}
});
