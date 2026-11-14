import {holidays,date,iso,add,easter,YEARS} from './calendar.mjs';
import {eventCalendar,googleCalendarURL} from '../assets/calendar-event-core.mjs';

export const FLAG_SOURCES={rules:'https://intermin.fi/suomen-lippu/liputuspaivat',almanac:'https://almanakka.helsinki.fi/fi/liputus-ja-juhlapaivat/liputuspaivat-2027/',regional:'https://almanakka.helsinki.fi/en/flag-days-and-holidays/flag-days-in-finland/',elections:'https://vaalit.fi/alue-ja-kuntavaalit'};
export const FLAG_CLASSES={official:'Virallinen',established:'Vakiintunut',aland:'Ahvenanmaan lippu',sami:'Saamen lippu'};
export const FLAG_CHECKED='2026-11-14';
const FLAG_INTROS={
 'runebergin-paiva':'Kansallisrunoilija J. L. Runebergin päivä 5. helmikuuta.',
 'kalevalan-paiva':'Kalevalan ja suomalaisen kulttuurin päivä.',
 'minna-canthin-paiva':'Minna Canthin ja tasa-arvon päivä.',
 'agricolan-paiva':'Mikael Agricolan ja suomen kielen päivä.',
 'veteraanipaiva':'Veteraaneja muistetaan ja kiitetään 27. huhtikuuta.',
 'eurooppa-paiva':'Eurooppa-päivää vietetään 9. toukokuuta.',
 'snellmanin-paiva':'J. V. Snellmanin ja suomalaisuuden päivä.',
 'lippujuhlan-paiva':'Puolustusvoimain lippujuhlaa vietetään 4. kesäkuuta.',
 'eino-leinon-paiva':'Eino Leinon sekä runon ja suven päivä.',
 'miina-sillanpaan-paiva':'Miina Sillanpään ja kansalaisvaikuttamisen päivä.',
 'aleksis-kiven-paiva':'Aleksis Kiven ja suomalaisen kirjallisuuden päivä.',
 'ykn-paiva':'Yhdistyneiden kansakuntien päivä 24. lokakuuta.',
 'ruotsalaisuuden-paiva':'Ruotsalaisuuden päivä ja Suomen ruotsinkielisen kulttuurin juhla.',
 'lapsen-oikeuksien-paiva':'Lapsen oikeuksien sopimuksen vuosipäivä 20. marraskuuta.',
 'sibeliuksen-paiva':'Jean Sibeliuksen ja suomalaisen musiikin päivä.',
 'vappu':'Suomalaisen työn päivä ja kevään juhla.',
 'aitienpaiva':'Äitejä juhlitaan toukokuun toisena sunnuntaina.',
 'isanpaiva':'Isiä juhlitaan marraskuun toisena sunnuntaina.',
 'kaatuneitten-muistopaiva':'Kaatuneita muistetaan toukokuun kolmantena sunnuntaina.',
 'juhannuspaiva':'Suomen lipun päivä: lippu jää salkoon myös juhannusyöksi.',
 'suomen-luonnon-paiva':'Suomen luonnon juhlapäivä elokuun viimeisenä lauantaina.',
 'itsenaisyyspaiva':'Itsenäistä Suomea juhlistetaan 6. joulukuuta.',
 'eduskuntavaalit':'Vuoden 2027 eduskuntavaalien äänestyspäivä 18. huhtikuuta.'
};

const validDate=s=>{const d=new Date(s+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(+d)||iso(d)!==s)throw Error('Tarkista päivämäärä.');return d;};
export const finnishToday=(now=new Date())=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export const flagDate=s=>new Intl.DateTimeFormat('fi-FI',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(validDate(s));
export function flagDays(year){
 if(!YEARS.includes(Number(year)))throw Error('Valitse vuosi 2027–2030.');
 const y=Number(year),national=holidays(y).filter(e=>e.isFlagDay).map(e=>({...e,id:e.slug,scope:'finland',description:FLAG_INTROS[e.slug]||e.description,classification:e.flagClass,source:FLAG_SOURCES.rules,url:'https://kalenteri365.fi/juhlapyhat/'+e.slug+'/',href:'/juhlapyhat/'+e.slug+'/'}));
 // Only a confirmed election date is added; other future elections are not guessed.
 if(y===2029)national.push({id:'alue-ja-kuntavaalit',slug:'alue-ja-kuntavaalit',date:'2029-04-15',name:'Alue- ja kuntavaalit',scope:'finland',classification:'official',source:FLAG_SOURCES.elections,url:FLAG_SOURCES.elections,href:FLAG_SOURCES.elections,description:'Alue- ja kuntavaalien vahvistettu vaalipäivä. Vaalipäivä on virallinen liputuspäivä.'});
 const mid=national.find(e=>e.slug==='juhannuspaiva').date;
 let annunciation=date(y,3,22);annunciation=add(annunciation,(7-annunciation.getUTCDay())%7);
 const pascha=easter(y);if(+annunciation===+pascha||+annunciation===+add(pascha,-7))annunciation=add(pascha,-14);
 let alandFlag=date(y,5,0);alandFlag=add(alandFlag,-alandFlag.getUTCDay());
 const regional=[
  ['aland','demilitarisointi',`${y}-03-30`,'Ahvenanmaan demilitarisoinnin päivä'],
  ['aland','lipun-paiva',iso(alandFlag),'Ahvenanmaan lipun päivä'],
  ['aland','itsehallinto',`${y}-06-09`,'Ahvenanmaan itsehallintopäivä'],
  ['sami','kansallispaiva',`${y}-02-06`,'Saamelaisten kansallispäivä'],
  ['sami','suomen-karajat',`${y}-03-02`,'Suomen saamelaiskäräjien perustamispäivä'],
  ['sami','ilmestyspaiva',iso(annunciation),'Marian ilmestyspäivä'],
  ['sami','juhannus',mid,'Juhannuspäivä'],
  ['sami','alkuperaiskansat',`${y}-08-09`,'Kansainvälinen alkuperäiskansojen päivä'],
  ['sami','lippu',`${y}-08-15`,'Saamen lipun hyväksymispäivä'],
  ['sami','neuvosto',`${y}-08-18`,'Saamelaisneuvoston perustamispäivä'],
  ['sami','ruotsin-karajat',`${y}-08-26`,'Ruotsin saamelaiskäräjien perustamispäivä'],
  ['sami','norjan-karajat',`${y}-10-09`,'Norjan saamelaiskäräjien perustamispäivä'],
  ['sami','valtuuskunta',`${y}-11-09`,'Saamelaisvaltuuskunnan perustamispäivä'],
  ['sami','isak-saba',`${y}-11-15`,'Isak Saban syntymäpäivä'],
  ['sami','elsa-laula',`${y}-11-29`,'Elsa Laula Renbergin syntymäpäivä'],
 ].map(([scope,id,ds,name])=>({scope,id:scope+'-'+id,slug:scope+'-'+id,date:ds,name,classification:scope,source:FLAG_SOURCES.regional,url:FLAG_SOURCES.regional,href:FLAG_SOURCES.regional,description:'',calculated:y!==2027}));
 return [...national,...regional].sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name,'fi'));
}
export const normalizeFlagSearch=s=>String(s||'').normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('fi').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function filterFlagDays(records,{scope='finland',month='',classification='',query=''}={}){
 const words=normalizeFlagSearch(query).split(' ').filter(Boolean);
 return records.filter(e=>(scope==='all'||e.scope===scope)&&(!month||Number(e.date.slice(5,7))===Number(month))&&(!classification||e.classification===classification)&&words.every(w=>normalizeFlagSearch(e.name+' '+flagDate(e.date)+' '+FLAG_CLASSES[e.classification]+' '+e.date).includes(w)));
}
export function groupFlagDays(records){const groups=new Map();for(const e of records){if(!groups.has(e.date))groups.set(e.date,[]);groups.get(e.date).push(e);}return [...groups].sort(([a],[b])=>a.localeCompare(b));}
export function flagWindow(ds,records,solar={}){
 const d=validDate(ds),year=d.getUTCFullYear(),mid=records.find(e=>e.scope==='finland'&&e.slug==='juhannuspaiva')?.date;
 const common={startDate:ds,endDate:ds,start:'08.00',end:null,rule:'ordinary'};
 if(mid&&(ds===mid||ds===iso(add(validDate(mid),-1))))return {...common,startDate:iso(add(validDate(mid),-1)),endDate:mid,start:'18.00',end:'21.00',rule:'midsummer',reason:'Juhannusliputus jatkuu juhannusaattoillasta yhtäjaksoisesti seuraavaan iltaan.'};
 if(ds===`${year}-12-06`)return {...common,end:'20.00',rule:'independence',reason:'Itsenäisyyspäivänä lippu lasketaan klo 20.'};
 let sunset=null;if(solar.set){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Helsinki',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(solar.set));const p=Object.fromEntries(parts.map(p=>[p.type,p.value]));sunset=Number(p.hour)*60+Number(p.minute);}
 const election=records.some(e=>e.scope==='finland'&&e.date===ds&&['eduskuntavaalit','alue-ja-kuntavaalit'].includes(e.slug));
 if(election&&(solar.polar==='down'||sunset!==null&&sunset<1200))return {...common,end:'20.00',rule:'election',reason:'Äänestys päättyy auringonlaskun jälkeen: vaalipäivän liputus jatkuu klo 20 asti.'};
 if(solar.polar==='down')return {...common,end:'16.00',rule:'polar-night',reason:'Kaamosalueella Sisäministeriö suosittelee liputusta klo 8–16.'};
 if(solar.polar==='up'||!solar.set&&solar.rise)return {...common,end:'21.00',rule:'midnight-sun',reason:'Aurinko ei laske tänä päivänä. Lippu lasketaan viimeistään klo 21.'};
 if(sunset===null)return {...common,rule:'unavailable',reason:'Paikallista auringonlaskua ei voitu laskea. Tarkista liputusaika Sisäministeriön ohjeesta.'};
 const end=Math.min(sunset,1260),clock=String(Math.floor(end/60)).padStart(2,'0')+'.'+String(end%60).padStart(2,'0');
 return {...common,end:clock,reason:sunset>1260?'Aurinko laskee klo 21 jälkeen. Lippu lasketaan viimeistään klo 21.':election?'Auringonlasku on äänestyksen päättymisen jälkeen. Tavallinen liputusaika jatkuu auringonlaskuun.':'Lippu lasketaan paikallisen auringonlaskun aikaan, viimeistään klo 21.'};
}
export function flagCalendar(records,reminder='none',now=new Date()){
 const unique=[...new Map(records.map(e=>[e.date+'-'+e.id,e])).values()];if(!unique.length)throw Error('Valitse vähintään yksi liputuspäivä.');
 const events=unique.map(e=>eventCalendar({...e,slug:e.id,url:e.url,description:FLAG_CLASSES[e.classification]+'. '+e.description},String(reminder),now).match(/BEGIN:VEVENT\r\n[\s\S]*?END:VEVENT/)[0]);
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365.fi//Liputuspaivat//FI','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Kalenteri365 | Liputuspäivät','X-WR-TIMEZONE:Europe/Helsinki',...events,'END:VCALENDAR',''].join('\r\n');
}
export const flagGoogleURL=e=>googleCalendarURL({...e,url:e.url,description:FLAG_CLASSES[e.classification]+'. '+e.description});
