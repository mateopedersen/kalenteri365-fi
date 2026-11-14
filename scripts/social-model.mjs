import photos from '../data/photo-credits.json' with {type:'json'};
import articles from '../data/blog.json' with {type:'json'};
import {CITIES,SLUGS,MONTHS,cap} from '../src/calendar.mjs';

const calendarBases=new Set(['kalenteri','kuukausikalenteri','tyopaivat','juhlapyhat','liputuspaivat','merkkipaivat']);
const moonCovers={2027:'moon-apollo17',2028:'moon-keeler',2029:'moon-bruce',2030:'moon-artemis-earthrise'};
const PHOTO_BY_ID=new Map(photos.map(p=>[p.id,p]));
const kindGroups={calendar:'Kalenterit',weekly:'Viikkosuunnittelu',print:'Tulostettavat kalenterit',lunar:'Kuu Suomen ajassa',solar:'Aurinko Suomen ajassa',moonrise:'Kuu ja havaintopaikka',daylength:'Päivän pituus',holiday:'Suomen juhlat',photo:'Suomen arki',school:'Koulu ja opiskelu',university:'Yliopistojen kalenterit',article:'Blogi ja oppaat',seasons:'Suomen vuodenajat',tool:'Arjen työkalut',zodiac:'Tähtimerkit ja horoskoopit',sky:'Taivas Suomen yllä',home:'Suomen kalenteri'};
const PHOTO_ALIAS={'avomaankurkku':'kurkku'};

export function socialModel(route,title,description='',context={}){
 const parts=route.split('/').filter(Boolean),locale='fi',base=parts[0]||'etusivu';
 const yearText=parts.find(p=>/^20\d{2}(?:-20\d{2})?$/.test(p));
 const year=yearText?Number(yearText.slice(0,4)):null;
 const monthIndex=parts.map(p=>SLUGS.indexOf(p)).find(i=>i>=0);
 const month=monthIndex===undefined?null:monthIndex+1;
 const week=Number(parts.find(p=>/^viikko-\d+$/.test(p))?.split('-')[1])||null;
 const city=CITIES.find(c=>parts.includes(c[0]))||null;
 let family='tool',ids=[],primaryId=null;
 const add=(id)=>{if(id&&PHOTO_BY_ID.has(id)&&!ids.includes(id))ids.push(id);};
 if(base==='etusivu'){family='home';add('helsinki');}
 else if(base==='horoskooppi'||base==='horoskooppimerkki')family='zodiac';
 else if(base==='auringonpimennys'||base==='perseidit'||base==='tahtitieteellinen-kalenteri')family='sky';
 else if(base==='pdf-kalenteri')family='print';
 else if(base==='kuukalenteri'){family='lunar';add(year&&!month?moonCovers[year]:'moon-full');}
 else if(base==='viikkokalenteri')family='weekly';
 else if(base==='auringonnousu-ja-lasku'||base==='kuun-nousu-ja-lasku'||base==='paivan-pituus'){
  family=({'auringonnousu-ja-lasku':'solar','kuun-nousu-ja-lasku':'moonrise','paivan-pituus':'daylength'})[base];
  add((city?.[0]||'helsinki')+(family==='moonrise'?'-night':''));
  if(family==='moonrise')add('moon-full');
 }
 else if(['kuun-vaiheet','uusikuu','taysikuu','kuunpimennys'].includes(base)){family='lunar';add('moon-full');}
 else if(base==='juhlapyhat'&&parts[1]&&!/^20\d{2}$/.test(parts[1])){
  family='holiday';add(photos.find(p=>p.applicableSlugs?.includes(parts[1]))?.id);
 }
 else if(calendarBases.has(base))family='calendar';
 else if(base==='koulujen-lomat'){
  family='school';add(city?.[0]||parts[1]);
 }
 else if(base==='yliopistojen-kalenterit'){
  family='university';add(parts[1]);
  if(!ids.length){add('helsingin-yliopisto');add('aalto-yliopisto');add('tampereen-yliopisto');}
 }
 else if(base==='blogi'&&parts[1]){
  family='article';add(articles.find(a=>a.slug===parts[1])?.photo);
 }
 else if(base==='vuodenajat')family='seasons';
 else if(base==='kylvokalenteri'&&parts[1]){family='photo';add('crop-'+(PHOTO_ALIAS[parts[1]]||parts[1]));}
 // Page images may supplement only a matching editorial context, never substitute a random city.
 if(!ids.length&&['school','article','photo'].includes(family)){
  for(const p of photos)if(context.body?.includes(p.src)||context.body?.includes(p.src.replace('.webp','-640.webp'))){add(p.id);break;}
 }
 if(ids.length)primaryId=ids[0];
 const seed=[...route].reduce((a,c)=>(Math.imul(a,31)+c.codePointAt(0))>>>0,2166136261);
 const label=String(title).replace(/\s[–—-]\s/g,' · ').trim();
 const photoRecords=ids.map(id=>PHOTO_BY_ID.get(id));
 let detail=month?`${cap(MONTHS[month-1])}${year?' '+year:''}`:week?`Viikko ${week} · ${year}`:city?city[1]+(year?' · '+year:''):yearText?yearText.replace('-','–'):'';
 let alt;
 if(family==='calendar'||family==='weekly')alt=`${label}: ${family==='weekly'?'viikon päivät':'kalenteriruudukko'} ja Suomen juhlapäivien merkinnät sinivalkoisessa paperikalenterissa.`;
 else if(family==='print')alt=`${label}: esikatselu kolmesta tulostettavasta Kalenteri365-kalenteripohjasta.`;
 else if(family==='lunar')alt=`${label}: Kuun valokuvan pintadetaljit ja ${month?'kuukauden laskettu valaistus':'Kuun vaiheiden havainnekuvat'}.`;
 else if(family==='solar'||family==='daylength')alt=`${label}: ${photoRecords[0]?.alt||'Suomen maisema'} ${family==='daylength'?'Päivän pituuden vuosivaihtelun kaavio.':'Auringon kulun havainnekaari.'}`;
 else if(family==='moonrise')alt=`${label}: ${photoRecords[0]?.alt||'yömaisema'} Kuun nousun ja laskun havainnekuva.`;
 else if(family==='zodiac')alt=`${label}: eläinradan aiheeseen liittyvä kuvitus tummansinisellä taustalla.`;
 else if(family==='seasons')alt=`${label}: kevään, kesän, syksyn ja talven suomalaiset maisemat neljässä digitaalisessa 3D-kuvituksessa.`;
 else if(family==='sky')alt=`${label}: ${base==='auringonpimennys'?'Kuun tumma kiekko peittää Auringon':'kirkkaat tähdet ja meteorien valojuovat'} tähtitaivaan havainnekuvassa.`;
 else if(photoRecords.length)alt=`${label}: ${photoRecords.map(p=>p.alt).join(' ')}`;
 else alt=`${label}: aiheeseen liittyvä sinivalkoinen kolmiulotteinen kuvitus.`;
 if(base==='kellonsiirto')alt=`${label}: selkeä kellotaulu ja kellon siirtoa kuvaavat nuolet.`;
 if(route.includes('/eduskuntavaalit/'))alt=`${label}: vaaliuurna ja äänestyslippu kolmiulotteisessa kuvituksessa.`;
 return {route,title:label,description,base,locale,family,year,yearText,month,week,city,seed,detail,category:kindGroups[family]||'Arjen työkalut',photos:photoRecords,primaryId,alt};
}
