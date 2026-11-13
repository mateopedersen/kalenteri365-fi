import {dailySky,finnishInstant} from './horoscope-sky.mjs';
import {interpretDay} from './horoscope-writing.mjs';
export const PROFILES=[
 ['oinas','Oinas','21.3.–19.4.','Tuli','Aloitteellisuus saa tänään tuekseen harkinnan.'],['harka','Härkä','20.4.–20.5.','Maa','Rauhallinen eteneminen auttaa huomaamaan, mikä jo toimii.'],['kaksoset','Kaksoset','21.5.–20.6.','Ilma','Uteliaisuus voi avata keskustelun, jota et osannut odottaa.'],['rapu','Rapu','21.6.–22.7.','Vesi','Anna tilaa läheisyydelle ja myös omalle rauhallesi.'],['leijona','Leijona','23.7.–22.8.','Tuli','Lämmin huomio tekee yhteisestä hetkestä merkityksellisen.'],['neitsyt','Neitsyt','23.8.–22.9.','Maa','Yksi selkeä käytännön ratkaisu voi keventää koko päivää.'],['vaaka','Vaaka','23.9.–22.10.','Ilma','Tasapaino alkaa siitä, että tunnistat myös oman toiveesi.'],['skorpioni','Skorpioni','23.10.–21.11.','Vesi','Pysähdy sen äärelle, mikä tuntuu sinusta tärkeältä.'],['jousimies','Jousimies','22.11.–21.12.','Tuli','Uusi näkökulma löytyy joskus aivan tavallisesta paikasta.'],['kauris','Kauris','22.12.–19.1.','Maa','Pitkän suunnitelman rinnalle mahtuu pieni, valmis askel.'],['vesimies','Vesimies','20.1.–18.2.','Ilma','Omaperäinen ajatus voi saada muodon, kun jaat sen jonkun kanssa.'],['kalat','Kalat','19.2.–20.3.','Vesi','Mielikuvitus ja selkeä päivärytmi voivat tukea toisiaan.']
];
export const todayFi=(now=new Date())=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function horoscopeCacheControl(now=new Date()){
 const nextDate=new Date(Date.parse(todayFi(now)+'T00:00Z')+86400000).toISOString().slice(0,10);
 const ttl=Math.max(0,Math.min(60,Math.floor((finnishInstant(nextDate,0)-now)/1000)));
 return `public, max-age=0, s-maxage=${ttl}, must-revalidate`;
}
export function edition(date=todayFi(),now=new Date()){
 const current=todayFi(now),dt=Date.parse(date+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(dt)||new Date(dt).toISOString().slice(0,10)!==date||date>current||dt<Date.parse(current+'T00:00:00Z')-7*86400000)throw Object.assign(Error('Valitse tänään tai jokin seitsemästä edellisestä päivästä.'),{status:400});
 const sky=dailySky(date),entries=Object.fromEntries(PROFILES.map(([slug,name,range,element],i)=>[slug,{slug,name,range,element,date,...interpretDay(i,sky)}]));
 return {date,timeZone:'Europe/Helsinki',sky,entries,method:'Päivän laskettuihin taivaankappaleiden sijainteihin perustuva symbolinen aurinkomerkkitulkinta. Viihdettä, ei henkilökohtainen tai tieteellinen ennuste.'};
}
export function horoscopeResponse(request,now=new Date()){
 try{
  const url=new URL(request.url),e=edition(url.searchParams.get('date')||todayFi(now),now),sign=url.searchParams.get('sign');
  if(sign&&!e.entries[sign])return Response.json({error:'Horoskooppimerkkiä ei löydy.'},{status:404,headers:{'Cache-Control':'no-store'}});
  return Response.json({...e,entries:sign?{[sign]:e.entries[sign]}:e.entries},{headers:{'Cache-Control':horoscopeCacheControl(now),'X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'}});
 }catch(e){return Response.json({error:e.message},{status:e.status||400,headers:{'Cache-Control':'no-store'}});}
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs=text=>String(text).split(/\n\n+/).map(part=>'<p>'+escape(part)+'</p>').join('');
export function dailyMarkup(e,referenceDate=todayFi(),artworkPrefix='/assets/art/'){
 const sky=dailySky(e.date),phase=sky.moon.phase+' · '+(sky.moon.illumination*100).toLocaleString('fi-FI',{maximumFractionDigits:1})+' % valaistuna';
 return `<div class="horoscope-updated"><span class="status-dot"></span><strong>${e.date===referenceDate?'Päivitetty tänään':'Päivän julkaisu'}</strong><time datetime="${e.date}">${new Intl.DateTimeFormat('fi-FI',{dateStyle:'full',timeZone:'Europe/Helsinki'}).format(new Date(e.date+'T12:00:00Z'))}</time></div><div class="horoscope-daily-head"><img src="${artworkPrefix}zodiac-${e.slug}.svg" alt="" aria-hidden="true" width="180" height="150"><div><p class="eyebrow">${escape(e.element)} · ${escape(e.name)}</p><h2>${escape(e.title)}</h2><p data-daily-intro>${escape(e.intro)}</p></div></div><div class="horoscope-sky"><div class="horoscope-sky-chips"><span data-daily-moon>Kuu ${escape(sky.positions.Moon.locative)}</span><span data-daily-phase>${escape(phase)}</span></div><p data-daily-aspect>${escape(e.aspectFact)}</p><small>Taivastilanne klo 12.00 Suomen aikaa · Trooppinen eläinrata</small></div><div class="horoscope-daily-sections">${[['Päivän ajatus','overview'],['Ihmissuhteet','relationships'],['Työ ja suunnitelmat','work'],['Oma aika','ownTime']].map(([label,key])=>`<section data-daily-section="${key}"><h3>${label}</h3><div class="horoscope-paragraphs">${paragraphs(e[key])}</div></section>`).join('')}</div>`;
}

export function refreshHoroscopeHTML(html,pathname,now=new Date()) {
 const e=edition(todayFi(now),now),slug=pathname.split('/')[2];
 // Keep the current release artwork when refreshing daily content at the edge.
 // The unversioned path may still contain a browser-cached illustration.
 const artworkPrefix=html.match(/(?:src|href)="(\/assets\/art-[a-f0-9]{16}\/)/)?.[1]||'/assets/art/';
 if(slug){const entry=e.entries[slug];return entry?html.replace(/<!-- DAILY:START -->[\s\S]*?<!-- DAILY:END -->/,'<!-- DAILY:START -->'+dailyMarkup(entry,todayFi(now),artworkPrefix)+'<!-- DAILY:END -->'):html;}
 return html.replace(/<!-- COLLECTION:START -->[\s\S]*?<!-- COLLECTION:END -->/,part=>{
  let result=part.replace(/(<time datetime=")[^"]+("[^>]*>)[^<]+(<\/time>)/,(_,a,b,c)=>a+e.date+b+new Intl.DateTimeFormat('fi-FI',{dateStyle:'long',timeZone:'Europe/Helsinki'}).format(new Date(e.date+'T12:00:00Z'))+c);
  for(const entry of Object.values(e.entries))for(const [field,value]of [['title',entry.title],['text',entry.summary]])result=result.replace(new RegExp('(<(?:h3|p) data-daily-'+field+'="'+entry.slug+'">)[^<]*(<\\/(?:h3|p)>)'),(_,a,b)=>a+escape(value)+b);
  return result;
 });
}
