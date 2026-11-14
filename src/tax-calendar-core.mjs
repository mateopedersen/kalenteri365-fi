import {holidays} from './calendar.mjs';
import {serviceCalendar} from '../assets/finland-services-core.mjs';
export const TAX_CHECKED='2026-11-14';
export const TAX_SOURCES={business:'https://www.vero.fi/yritykset-ja-yhteisot/yritys_ja_yhteisoasiakkaiden_tarkeat_paivamaarat/',personal:'https://www.vero.fi/henkiloasiakkaat/henkiloasiakkaan_tarkeat_paivamaarat/',vat:'https://www.vero.fi/yritykset-ja-yhteisot/verot-ja-maksut/arvonlisaverotus/arvonlisaveron-maksuohjeet/',employer:'https://www.vero.fi/yritykset-ja-yhteisot/verot-ja-maksut/yritys_tyonantajana/nain-ilmoitat-palkat-ja-tyonantajasuoritukset/',payment:'https://www.vero.fi/yritykset-ja-yhteisot/verot-ja-maksut/omaaloitteiset-verot/maksuohjeet/'};
const validDate=s=>{const d=new Date(s+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(+d)||d.toISOString().slice(0,10)!==s)throw Error('Tarkista päivämäärä.');return d;};
export function nextTaxWorkday(ds){const base=validDate(ds);while([0,6].includes(base.getUTCDay())||holidays(base.getUTCFullYear()).some(h=>h.type==='holiday'&&h.date===base.toISOString().slice(0,10)))base.setUTCDate(base.getUTCDate()+1);return base.toISOString().slice(0,10);}
export function calculateTaxDue({kind='vat',period='monthly',year=2027,index=1}={}){
 year=Number(year);index=Number(index);
 if(!Number.isInteger(year)||year<2026||year>2030||!['vat','employer'].includes(kind)||!['monthly','quarterly','annual'].includes(period)||kind==='employer'&&period==='annual')throw Error('Valitse tuettu verolaji ja verokausi.');
 const max=period==='monthly'?12:period==='quarterly'?4:1;if(!Number.isInteger(index)||index<1||index>max)throw Error('Tarkista verokausi.');
 // Recurring rules are planning dates; Finland's public holidays also move the due date.
 let base=period==='annual'?new Date(Date.UTC(year+1,2,0,12)):new Date(Date.UTC(year,(period==='quarterly'?index*3:index)+(period==='monthly'&&kind==='employer'?0:1),12,12));
 const original=base.toISOString().slice(0,10);
 const ds=nextTaxWorkday(original),periodLabel=period==='annual'?'Vuosi '+year:period==='quarterly'?index+'. neljännes '+year:index+'/'+year;
 return {id:`laskettu-${kind}-${period}-${year}-${index}`,date:ds,original,shifted:ds!==original,name:kind==='vat'?'Arvonlisävero: ilmoitus ja maksu':'Työnantajasuoritusten maksu',period:periodLabel,qualifier:'Nykyohjeesta laskettu suunnittelupäivä',applies:periodLabel+'. Tarkista oma verokausi ja velvoite OmaVerosta. Laskuri ei laske palkkatietoilmoituksen määräaikaa eikä huomioi tulevia sääntömuutoksia.',source:TAX_SOURCES[kind],checked:TAX_CHECKED};
}
export function filterTaxEvents(events,{audience='personal',year='2026',month='all',topic='all',scope='all',query=''}={},today='2026-01-01'){
 const norm=s=>String(s).toLocaleLowerCase('fi').normalize('NFD').replace(/[\u0300-\u036f]/g,'');const words=norm(query).trim().split(/\s+/).filter(Boolean);
 return events.filter(e=>(audience==='business'?e.type==='business':e.type!=='business')&&e.date.startsWith(String(year)+'-')&&(month==='all'||Number(e.date.slice(5,7))===Number(month))&&(topic==='all'||(e.type==='business'?e.taxKind===topic:e.type===topic))&&(scope!=='future'||e.date>=today)&&words.every(w=>norm([e.name,e.applies,e.period,e.date].join(' ')).includes(w))).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
export function taxCalendarFile(events,reminder='1',now=new Date()){
 if(!events.length)throw Error('Valitse ensin vähintään yksi päivämäärä.');
 const parts=events.map(e=>serviceCalendar(e,reminder,now));const bodies=parts.map(s=>s.slice(s.indexOf('BEGIN:VEVENT'),s.lastIndexOf('END:VCALENDAR')));
 return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Kalenteri365.fi//Verokalenteri//FI\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:Kalenteri365 veropäivät\r\nX-WR-TIMEZONE:Europe/Helsinki\r\n'+bodies.join('')+'END:VCALENDAR\r\n';
}
export function taxCSV(events){const cell=s=>'"'+String(/^[=+@-]/.test(String(s??''))?"'"+s:s??'').replaceAll('"','""')+'"';return '\uFEFF'+[['Päivämäärä','Tapahtuma','Verokausi','Ketä koskee','Ohje'],...events.map(e=>[e.date,e.name,e.period,e.applies,e.source])].map(row=>row.map(cell).join(';')).join('\r\n');}
export function validateTaxReminder(value){
 const name=String(value.name||'').trim(),date=String(value.date||''),reminder=String(value.reminder||'1');validDate(date);
 if(!name||name.length>100||!['0','1','7','none'].includes(reminder)||date<'2020-01-01'||date>'2100-12-31')throw Error('Anna nimi, päivämäärä vuosilta 2020–2100 ja muistutus.');
 return {name,date,reminder};
}
