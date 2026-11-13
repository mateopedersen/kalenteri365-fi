import {eventDownloadPath,googleCalendarURL} from './calendar-event-core.mjs';
const root=document.querySelector('[data-holiday-calendar]');
if(root){
 const entries=JSON.parse(root.querySelector('[data-holiday-entries]').textContent),year=root.querySelector('#holiday-year'),reminder=root.querySelector('#holiday-reminder');
 const format=new Intl.DateTimeFormat('fi-FI',{day:'numeric',month:'numeric',year:'numeric',timeZone:'UTC'}),capitalize=s=>s.charAt(0).toLocaleUpperCase('fi')+s.slice(1);
 function update(){
  const entry=entries.find(e=>e.date.startsWith(year.value+'-'));if(!entry)return;
  const date=new Date(entry.date+'T12:00Z');
  root.querySelector('[data-holiday-month]').textContent=capitalize(new Intl.DateTimeFormat('fi-FI',{month:'long',timeZone:'UTC'}).format(date));
  root.querySelector('[data-holiday-day]').textContent=date.getUTCDate();
  root.querySelector('[data-holiday-weekday]').textContent=capitalize(new Intl.DateTimeFormat('fi-FI',{weekday:'long',timeZone:'UTC'}).format(date));
  const time=root.querySelector('[data-holiday-date]');time.dateTime=entry.date;time.textContent=format.format(date);
  root.querySelector('[data-holiday-google]').href=googleCalendarURL(entry);
  root.querySelector('[data-holiday-ics]').href=eventDownloadPath(entry.slug,year.value,reminder.value);
  root.querySelector('[data-holiday-local]').dataset.addDate=entry.date;
  root.querySelector('[data-holiday-status]').textContent='';
 }
 year.addEventListener('change',update);reminder.addEventListener('change',update);
 root.querySelector('[data-holiday-ics]').addEventListener('click',()=>{root.querySelector('[data-holiday-status]').textContent='Avaa tiedosto omassa kalenterisovelluksessasi ja vahvista tuonti. Ilmoitukset vaativat sovelluksen ilmoitusluvan.';});
 root.querySelector('[data-holiday-google]').addEventListener('click',()=>{root.querySelector('[data-holiday-status]').textContent='Tarkista muistutus ja tallenna tapahtuma Google Kalenterissa.';});
 update();
}
