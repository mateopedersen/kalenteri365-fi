const root=document.querySelector('[data-horoscope-sign]'),dateNode=document.querySelector('[data-collection-date] time');
let date=root?.querySelector('time')?.dateTime||dateNode?.dateTime,requestedDate=date,sequence=0,controller,manualDate=false;
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const fields=['overview','relationships','work','ownTime'];
const formatDate=(ds,style='full')=>new Intl.DateTimeFormat('fi-FI',{dateStyle:style,timeZone:'Europe/Helsinki'}).format(new Date(ds+'T12:00:00Z'));
function navigation(ds){for(const b of document.querySelectorAll('[data-horoscope-step]'))b.disabled=Number(b.dataset.horoscopeStep)>0?ds>=today():Date.parse(today())-Date.parse(ds)>=7*86400000;}
function paragraphs(node,text){node.replaceChildren(...text.split(/\n\n+/).map(value=>{const p=document.createElement('p');p.textContent=value;return p;}));}
async function update(ds=today()){
 const id=++sequence;controller?.abort();controller=new AbortController();requestedDate=ds;navigation(ds);root?.setAttribute('aria-busy','true');
 try{
  const url=new URL('/api/horoscope',location.origin);url.searchParams.set('date',ds);if(root)url.searchParams.set('sign',root.dataset.horoscopeSign);
  const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('Päivitys ei ole saatavilla.');
  const payload=await response.json();if(id!==sequence)return;
  if(payload.date!==ds||!payload.entries)throw Error('Julkaisun päivämäärä ei vastaa valintaa.');
  if(root){
   const e=payload.entries[root.dataset.horoscopeSign];if(!e||e.date!==ds||fields.some(key=>typeof e[key]!=='string')||!payload.sky?.moon)throw Error('Julkaisu on puutteellinen.');
   root.querySelector('time').dateTime=ds;root.querySelector('time').textContent=formatDate(ds);
   root.querySelector('.horoscope-updated strong').textContent=ds===today()?'Päivitetty tänään':'Päivän julkaisu';
   root.querySelector('.horoscope-daily-head h2').textContent=e.title;root.querySelector('[data-daily-intro]').textContent=e.intro;
   for(const key of fields)paragraphs(root.querySelector(`[data-daily-section="${key}"] .horoscope-paragraphs`),e[key]);
   root.querySelector('[data-daily-moon]').textContent='Kuu '+payload.sky.positions.Moon.locative;
   root.querySelector('[data-daily-phase]').textContent=payload.sky.moon.phase+' · '+(payload.sky.moon.illumination*100).toLocaleString('fi-FI',{maximumFractionDigits:1})+' % valaistuna';
   root.querySelector('[data-daily-aspect]').textContent=e.aspectFact;root.querySelector('.horoscope-disclosure').textContent=payload.method;
  }else if(dateNode){
   const entries=Object.values(payload.entries);if(entries.length!==12)throw Error('Kaikkia merkkejä ei saatu ladattua.');
   dateNode.dateTime=ds;dateNode.textContent=formatDate(ds,'long');
   for(const e of entries){const heading=document.querySelector(`[data-daily-title="${e.slug}"]`),text=document.querySelector(`[data-daily-text="${e.slug}"]`);if(heading)heading.textContent=e.title;if(text)text.textContent=e.summary;}
  }
  date=ds;document.querySelector('[data-horoscope-error]')?.remove();navigation(date);
 }catch(error){
  if(error.name==='AbortError'||id!==sequence)return;requestedDate=date;navigation(date);
  document.querySelector('[data-horoscope-error]')?.remove();const status=document.createElement('p');status.className='small';status.setAttribute('role','status');status.textContent='Päivän päivitystä ei saatu ladattua. Näkyvissä on yllä päivätty julkaisu.';status.dataset.horoscopeError='';(root||dateNode?.parentElement)?.append(status);
 }finally{if(id===sequence)root?.removeAttribute('aria-busy');}
}
document.querySelectorAll('[data-horoscope-step]').forEach(b=>b.addEventListener('click',()=>{manualDate=true;const ds=new Date(Date.parse(requestedDate||date)+Number(b.dataset.horoscopeStep)*86400000).toISOString().slice(0,10);update(ds);}));
const rollover=()=>{if(!document.hidden&&!manualDate&&date!==today())update();};
document.addEventListener('visibilitychange',rollover);setInterval(rollover,60000);update();
