import {familyICS,normalizeFamily} from './family-calendar.mjs';
import {CITIES,DAYS,parse,iso,add,day,fi,cap} from './calendar.mjs';
import {esc,icon} from './ui.mjs';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const norm=s=>s.toLocaleLowerCase('fi').normalize('NFD').replace(/\p{Diacritic}/gu,'');
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(+parse(s))&&iso(parse(s))===s;
function download(bytes,name,type){const u=URL.createObjectURL(new Blob([bytes],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
export function connectEdition({state,persist}){
 if($('#blog-search')){let category='';const filter=()=>{const q=norm($('#blog-search').value.trim());let n=0;$$('.blog-card').forEach(card=>{card.hidden=Boolean(category&&card.dataset.blogCategory!==category)||!norm(card.dataset.blogText).includes(q);if(!card.hidden)n++;});$('#blog-count').textContent=n+' artikkelia';$('#blog-empty').hidden=n>0;};$$('[data-blog-filter]').forEach(b=>b.onclick=()=>{category=b.dataset.blogFilter;$$('[data-blog-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filter();});$('#blog-search').addEventListener('input',filter);}
 if($('#tool-filter')){state.plans.toolFavourites=Array.isArray(state.plans.toolFavourites)?state.plans.toolFavourites:[];const saved=new Set(state.plans.toolFavourites);let only=false;const filter=()=>{const q=norm($('#tool-filter').value),category=$('#tool-category').value;let n=0;$$('[data-tool-id]').forEach(card=>{card.hidden=!norm(card.textContent).includes(q)||(category&&card.dataset.toolCategory!==category)||(only&&!saved.has(card.dataset.toolId));if(!card.hidden)n++;});$$('[data-tool-group]').forEach(g=>g.hidden=!$('[data-tool-id]:not([hidden])',g));$('#tool-count').textContent=n+' työkalua';$('#tool-empty').hidden=n>0;};$$('[data-tool-save]').forEach(b=>{b.setAttribute('aria-pressed',String(saved.has(b.dataset.toolSave)));b.onclick=()=>{saved.has(b.dataset.toolSave)?saved.delete(b.dataset.toolSave):saved.add(b.dataset.toolSave);b.setAttribute('aria-pressed',String(saved.has(b.dataset.toolSave)));state.plans.toolFavourites=[...saved];persist();filter();};});$('#tool-favourites').onclick=()=>{only=!only;$('#tool-favourites').setAttribute('aria-pressed',String(only));filter();};$('#tool-filter').addEventListener('input',filter);$('#tool-category').onchange=filter;filter();}
 if($('[data-family-planner]')){
  const colors=['#0046a8','#33795b','#9b5a2e','#7955a4','#a23c5d','#367b8d'],data=normalizeFamily(state.plans.familyWorkspace);
  window.addEventListener('community:updated',()=>{Object.assign(data,normalizeFamily(state.plans.familyWorkspace));$('#family-week').value=data.week;render();});
  $('#family-week').value=data.week;const save=()=>{state.plans.familyWorkspace=data;persist();$('#family-status').textContent='Tallennettu tähän selaimeen.';};
  function render(){
   const ds=data.week,end=iso(add(parse(ds),6));$('#family-week-title').textContent=fi(parse(ds))+' – '+fi(parse(end));
   $('#family-members').innerHTML=data.members.map(m=>`<span class="family-member" style="--member-color:${m.color}"><i></i>${esc(m.name)}${m.id!=='shared'?`<button type="button" data-remove-member="${m.id}" aria-label="Poista ${esc(m.name)}">×</button>`:''}</span>`).join('');
   $('#family-person').innerHTML=data.members.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
   $('#family-week-grid').innerHTML=Array.from({length:7},(_,i)=>{const date=iso(add(parse(ds),i));return `<article class="family-day"><h3>${cap(DAYS[i])}<time datetime="${date}">${fi(parse(date))}</time></h3><div class="family-day-events">${data.events.filter(e=>e.date===date).sort((a,b)=>(a.time||'').localeCompare(b.time||'')).map(e=>{const member=data.members.find(m=>m.id===e.person)||data.members[0];return `<div class="family-event" style="--member-color:${member.color}"><small>${esc(member.name)} ${esc(e.time||'')}</small><strong>${esc(e.title)}</strong><button type="button" data-remove-family-event="${e.id}" aria-label="Poista ${esc(e.title)}">×</button></div>`;}).join('')}</div><label class="family-meal">Päivän ruoka<input data-family-meal="${date}" value="${esc(data.meals[date]||'')}" maxlength="120" placeholder="Suunnittele ateria…"></label></article>`;}).join('');
   $('#family-shopping').value=data.shopping[ds]||'';
  }
  $('#family-member-form').onsubmit=e=>{e.preventDefault();const name=$('#family-member-name').value.trim();if(!name)return;if(data.members.length>=12){$('#family-status').textContent='Enintään 12 henkilöä.';return;}data.members.push({id:crypto.randomUUID(),name,color:colors[data.members.length%colors.length]});$('#family-member-name').value='';save();render();};
  $('#family-event-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),title=String(f.get('title')||'').trim();if(!title)return;data.events.push({id:crypto.randomUUID(),person:f.get('person'),date:iso(add(parse(data.week),Number(f.get('weekday')))),time:String(f.get('time')||''),title});e.target.elements.title.value='';save();render();};
  $('[data-family-planner]').addEventListener('click',e=>{const remove=e.target.closest('[data-remove-family-event]'),member=e.target.closest('[data-remove-member]');if(remove){data.events=data.events.filter(x=>x.id!==remove.dataset.removeFamilyEvent);save();render();}if(member){const id=member.dataset.removeMember;data.members=data.members.filter(x=>x.id!==id);data.events.forEach(x=>{if(x.person===id)x.person='shared';});save();render();}});
  $('[data-family-planner]').addEventListener('input',e=>{if(e.target.dataset.familyMeal){data.meals[e.target.dataset.familyMeal]=e.target.value;save();}});
  $('#family-shopping').oninput=e=>{data.shopping[data.week]=e.target.value;save();};
  $('#family-week').onchange=e=>{if(!validDate(e.target.value)){e.target.value=data.week;return;}data.week=iso(add(parse(e.target.value),-day(parse(e.target.value))));e.target.value=data.week;save();render();};
  for(const[id,step]of[['family-prev',-7],['family-next',7]])$('#'+id).onclick=()=>{data.week=iso(add(parse(data.week),step));$('#family-week').value=data.week;save();render();};
  $('#family-print').onclick=()=>window.print();$('#family-ics').onclick=()=>{try{const end=iso(add(parse(data.week),6)),events=data.events.filter(e=>e.date>=data.week&&e.date<=end);if(!events.length){$('#family-status').textContent='Lisää ensin tapahtuma tähän viikkoon.';return;}download(familyICS(events,data.members),'kalenteri365-perhe-'+data.week+'.ics','text/calendar;charset=utf-8');$('#family-status').textContent=events.length+' tapahtumaa vietiin ICS-tiedostoon.';}catch(e){$('#family-status').textContent=e.message;}};
  render();
 }
 if ($('#local-sun')) {
  let sequence = 0, library;
  async function refresh() {
   const seq = ++sequence;
   try {
    library ??= Promise.all([import('./vendor/astronomy-engine.mjs'), import('./solar-day.mjs'), import('./lunar.mjs')]);
    const [A, {dayEvents}, {moonSVG}] = await library;
    if (seq !== sequence) return;
    const city = CITIES.find(c => c[0] === state.city) || CITIES[0];
    const now = new Date(), ds = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Helsinki'}).format(now);
    const sun = dayEvents(A, city, ds);
    const observer = new A.Observer(city[2], city[3], 0);
    const position = A.Equator('Sun', now, observer, true, true);
    const altitude = A.Horizon(now, observer, position.ra, position.dec).altitude;
    window.dispatchEvent(new CustomEvent('fi-local-sky', {detail: {city: city[0], altitude, period: altitude >= -.833 ? 'day' : altitude >= -6 ? 'twilight' : 'night'}}));
    const fmt = value => value ? new Intl.DateTimeFormat('fi-FI', {timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit'}).format(value) : '—';
    const progress = sun.polar === 'up' ? 50 : sun.rise && sun.set ? Math.max(0, Math.min(100, (now - sun.rise) / (sun.set - sun.rise) * 100)) : 0;
    $('#local-sun').style.setProperty('--day-progress', progress + '%');
    $('#local-rise').textContent = fmt(sun.rise);
    $('#local-set').textContent = fmt(sun.set);
    $('#local-daylength').textContent = sun.polar === 'up' ? 'Yötön yö: Aurinko ei laske.' : sun.polar === 'down' ? 'Kaamos: Aurinko ei nouse.' : `Päivän pituus ${Math.floor(sun.duration / 60)} h ${sun.duration % 60} min`;
    $('#local-sun-link').href = '/auringonnousu-ja-lasku/' + city[0] + '/';
    const angle = A.MoonPhase(now), fraction = A.Illumination('Moon', now).phase_fraction;
    const phaseNames = ['Uusikuu', 'Kasvava sirppi', 'Ensimmäinen neljännes', 'Kasvava kupera kuu', 'Täysikuu', 'Vähenevä kupera kuu', 'Viimeinen neljännes', 'Vähenevä sirppi'];
    $('#local-moon-disc').innerHTML = moonSVG(angle, 'home-moon');
    $('#local-moon-phase').textContent = phaseNames[Math.floor((angle + 22.5) / 45) % 8];
    $('#local-moon-light').textContent = (fraction * 100).toLocaleString('fi-FI', {maximumFractionDigits: 0}) + ' % valaistuna';
   } catch {
    $('#local-daylength').textContent = 'Avaa paikkakunnan laskuri tarkempia aikoja varten.';
   }
  }
  window.addEventListener('fi-city-change', refresh);
  if ('IntersectionObserver' in window) {
   const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); refresh(); }
   }, {rootMargin: '180px'});
   observer.observe($('#weather-stage') || $('#local-sun'));
  } else if ('requestIdleCallback' in window) requestIdleCallback(refresh, {timeout: 2500});
  else setTimeout(refresh, 500);
  setInterval(() => { if (library && document.visibilityState === 'visible') refresh(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (library && !document.hidden) refresh(); });
 }
}
