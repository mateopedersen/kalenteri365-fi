import {ADMISSION_ROUTES,SERVICE_SOURCES} from './finland-services-data.mjs';
import {serviceCalendar,serviceGoogleURL,helsinkiInstant} from './finland-services-core.mjs';

export const ADMISSIONS_CHECKED='2026-11-14';
export const ADMISSIONS_TIMETABLE='https://wiki.eduuni.fi/spaces/ophPPK/pages/208242608/Korkeakoulujen%2Byhteishakujen%2Baikataulut';
export const ADMISSIONS_REMINDERS=[['1','Edellisenä päivänä klo 9'],['7','Viikkoa ennen klo 9'],['none','Ei muistutusta']];
export const ROUTE_LABELS={
 'higher-first':{short:'Kevään ensimmäinen',category:'Korkeakoulut',art:'school',note:'Vieraskieliset koulutukset ja Taideyliopisto.'},
 'secondary':{short:'Perusopetuksen jälkeen',category:'Toisen asteen haku',art:'study',note:'Lukio, ammatillinen koulutus ja valmentavat koulutukset.'},
 'higher-second':{short:'Kevään toinen',category:'Korkeakoulut',art:'exams',note:'Suomen- ja ruotsinkieliset korkeakoulutukset.'},
 'higher-autumn':{short:'Syksyn yhteishaku',category:'Korkeakoulut',art:'calendar',note:'Keväällä 2028 alkavat korkeakouluopinnot.'}
};
export const ADMISSIONS_ROUTES=ADMISSION_ROUTES.map(r=>({...r,...ROUTE_LABELS[r.id]})).sort((a,b)=>a.steps[0].date.localeCompare(b.steps[0].date));
const descriptions={
 opens:'Hakemuksen voi täyttää ja lähettää Opintopolussa hakuajan alettua. Tarkista ensin hakukohteesi valintaperusteet.',
 closes:'Lähetä hakemus ajoissa. Liitteillä ja ennakkotehtävillä voi olla eri määräaika, joka näkyy hakukohteen omissa ohjeissa.',
 certificate:'Todistusvalinnan tuloksille ilmoitettu takaraja. Hakukohteesi tulos voi valmistua jo aiemmin.',
 results:'Tarkista valintatilanteesi Oma Opintopolusta ja lue saamasi päätös.',
 accept:'Noudata hyväksymisviestissä annettua vastaanottoaikaa. Varasijalta myöhemmin hyväksytyn hakijan määräaika voi olla eri.',
 reserve:'Ilmoitettu yhteisen varasijavalinnan päättymispäivä. Tarkista oma valintatilanteesi ja oppilaitoksen viestit.'
};
export const ADMISSIONS_EVENTS=ADMISSIONS_ROUTES.flatMap(r=>r.steps.map(s=>({...s,id:r.id+'-'+s.id,step:s.id,route:r.id,routeName:r.name,checked:ADMISSIONS_CHECKED,source:r.source,applies:descriptions[s.id]+(s.id==='results'&&s.qualifier==='Aikaisintaan'?' Tuloksia voidaan julkaista tästä päivästä alkaen, ei välttämättä kaikille samana päivänä.':''),period:'Hakuvuosi 2027. Opintojen alku: '+r.start.toLocaleLowerCase('fi')+'.'})));
export function routeEvents(id){return ADMISSIONS_EVENTS.filter(e=>e.route===id);}
export function routeState(route,now=new Date()){
 const opens=route.steps.find(s=>s.id==='opens'),closes=route.steps.find(s=>s.id==='closes');
 const start=helsinkiInstant(opens.date,opens.time),end=helsinkiInstant(closes.date,closes.time);
 if(+now<+start)return {kind:'upcoming',label:'Haku tulossa'};
 if(+now<+end)return {kind:'open',label:'Haku käynnissä'};
 return {kind:'closed',label:'Hakuaika päättynyt'};
}
export function selectedAdmissionEvents(ids,custom=[]){
 const wanted=new Set(ids);
 return [...ADMISSIONS_EVENTS,...custom].filter(e=>wanted.has(e.id)).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'').localeCompare(b.time||'')||a.id.localeCompare(b.id));
}
function cleanDate(value){const d=new Date(value+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(+d)||d.toISOString().slice(0,10)!==value)throw Error('Valitse kelvollinen päivämäärä.');return value;}
export function personalAdmissionEvent(values){
 const name=String(values.name||'').trim(),date=cleanDate(String(values.date||'')),time=String(values.time||'').trim(),notes=String(values.notes||values.applies||'').trim();
 if(name.length<2||name.length>120)throw Error('Kirjoita muistutukselle 2–120 merkin nimi.');
 if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Tarkista kellonaika.');
 if(date<'2026-01-01'||date>'2030-12-31')throw Error('Valitse päivä vuosilta 2026–2030.');
 if(notes.length>600)throw Error('Muistiinpano voi olla enintään 600 merkkiä.');
 const input=String(values.source||'').trim();let source='https://kalenteri365.fi/hakukalenteri/';
 if(input){try{const url=new URL(input);if(url.protocol!=='https:'||url.username||url.password)throw Error();source=url.href;}catch{throw Error('Ohjeen osoitteen tulee alkaa https://.');}}
 const key=[name,date,time,source].join('|');let hash=2166136261;for(const c of key)hash=Math.imul(hash^c.codePointAt(0),16777619)>>>0;
 return {id:'own-'+hash.toString(36),name,date,time:time||null,applies:notes,source,route:'own',routeName:'Oma hakumuistutus',qualifier:'Oma päivämäärä',period:'Itse lisätty hakumuistutus.'};
}
export function admissionsCalendar(events,reminder='1',now=new Date()){
 if(!events.length)throw Error('Valitse vähintään yksi päivä.');
 if(!ADMISSIONS_REMINDERS.some(([v])=>v===reminder))throw Error('Tarkista muistutusvalinta.');
 const unique=[...new Map(events.map(e=>[e.id,e])).values()];
 const blocks=unique.map(e=>{
   // A timed deadline is a point in time, not an invented 15-minute appointment.
   let text=serviceCalendar(e,reminder,now);
   if(e.time)text=text.replace(/^DTEND:[^\r\n]+\r\n/m,'');
   return text.match(/BEGIN:VEVENT\r\n[\s\S]*?END:VEVENT/)[0];
 });
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365.fi//Hakukalenteri//FI','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Hakumuistutukset | Kalenteri365','X-WR-TIMEZONE:Europe/Helsinki',...blocks,'END:VCALENDAR',''].join('\r\n');
}
export const admissionGoogleURL=e=>{
 const url=new URL(serviceGoogleURL(e));
 if(e.time)url.searchParams.set('details',url.searchParams.get('details')+'\n\nTämä on määräajan muistutus. Muokattavan kalenterimerkinnän 15 minuutin kesto ei ole hakuajan tai valintakokeen kesto.');
 return url.href;
};
export const ADMISSIONS_GUIDE=SERVICE_SOURCES.applicationGuide;
