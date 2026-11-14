const normalize = value => String(value).normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fi').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const groups = [
  ['lukutaidon', 'mother', 'Äidinkieli ja S2', 'Lukutaito', ['Äidinkieli ja kirjallisuus (suomi ja ruotsi): lukutaidon koe', 'Suomi toisena kielenä ja kirjallisuus: lukutaidon ja kuullun ymmärtämisen osakoe']],
  ['kirjoitustaidon', 'mother', 'Äidinkieli ja S2', 'Kirjoitustaito', ['Äidinkieli ja kirjallisuus (suomi ja ruotsi): kirjoitustaidon koe', 'Suomi toisena kielenä ja kirjallisuus: kirjoitustaidon osakoe']],
  ['vieras kieli, lyhyt', 'language', 'Kielet', 'Vieras kieli, lyhyt oppimäärä', ['Englanti, ranska, espanja, saksa, venäjä, italia, portugali, latina ja saame']],
  ['vieras kieli, pitkä', 'language', 'Kielet', 'Vieras kieli, pitkä oppimäärä', ['Englanti, ranska, espanja, saksa ja venäjä']],
  ['matematiikka', 'math', 'Matematiikka', 'Matematiikka', ['Pitkä ja lyhyt oppimäärä']],
  ['psykologia', 'real', 'Reaaliaineet', 'Reaaliaineiden koepäivä', ['Psykologia, filosofia, historia, fysiikka ja biologia']],
  ['uskonto', 'real', 'Reaaliaineet', 'Reaaliaineiden koepäivä', ['Uskonto, elämänkatsomustieto, yhteiskuntaoppi, kemia, maantiede ja terveystieto']],
  ['toinen kotimainen', 'language', 'Kielet', 'Toinen kotimainen kieli', ['Pitkä ja keskipitkä oppimäärä']],
  ['saamen äidinkieli', 'mother', 'Äidinkieli', 'Saamen äidinkieli ja kirjallisuus', ['Saamen äidinkielen ja kirjallisuuden koe']],
];
export function examRecords(seasons) {
  return seasons.flatMap(season => season.exams.map(exam => {
    const group = groups.find(([match]) => exam.subjects.includes(match));
    if (!group) throw new Error('Tuntematon koetyyppi: ' + exam.subjects);
    return {...exam, id:'yo-'+exam.date, season:season.season, year:season.year, source:season.source,
      family:group[1], category:group[2], title:group[3], details:group[4],
      search:normalize(exam.subjects+' '+group.slice(2).flat().join(' ')+' '+(group[2]==='Äidinkieli ja S2'?'äikkä s2':'')+' '+(exam.subjects.includes('toinen kotimainen')?'ruotsi suomi svenska finska':''))};
  }));
}
export function filterExams(records, {season='all', family='all', query=''}={}) {
  const words=normalize(query).split(' ').filter(Boolean);
  return records.filter(e => (season==='all'||e.season===season)&&(family==='all'||e.family===family)&&words.every(word=>e.search.includes(word)));
}
function escapeICS(value) {return String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
function fold(line) {
  const encoder=new TextEncoder();let current='',size=0,lines=[];
  for(const char of line){const bytes=encoder.encode(char).length;if(size+bytes>75){lines.push(current);current=' ';size=1;}current+=char;size+=bytes;}
  lines.push(current);return lines.join('\r\n');
}
// Absolute instants let calendar applications apply Helsinki's DST correctly.
export function examStart(date) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Virheellinen koepäivä');
  const noon=new Date(date+'T12:00:00Z');
  if(Number.isNaN(noon.valueOf())||noon.toISOString().slice(0,10)!==date)throw new Error('Virheellinen koepäivä');
  const localHour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Helsinki',hour:'2-digit',hourCycle:'h23'}).format(noon));
  return date.replaceAll('-','')+'T'+String(9-(localHour-12)).padStart(2,'0')+'0000Z';
}
export function examCalendarFile(records, {reminder='none'}={}) {
  if(!['none','previous-evening','hour'].includes(reminder))throw new Error('Virheellinen muistutus');
  const events=[...new Map(records.map(e=>[e.id,e])).values()].sort((a,b)=>a.date.localeCompare(b.date));
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365//Ylioppilaskokeet//FI','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Omat ylioppilaskokeet 2027','X-WR-TIMEZONE:Europe/Helsinki'];
  for(const e of events){
    lines.push('BEGIN:VEVENT','UID:'+e.id+'@kalenteri365.fi','DTSTAMP:20261114T000000Z','DTSTART:'+examStart(e.date),'SUMMARY:'+escapeICS('Ylioppilaskoe: '+e.title),'DESCRIPTION:'+escapeICS(e.details.join('\n')+'\nAlkaa klo 9.00 Suomen aikaa. Saavu paikalle oman lukiosi ohjeen mukaan. Valittu koepäivä voi sisältää useita oppiaineita; tarkista oma ilmoittautumisesi.\n'+e.source),'URL:'+e.source);
    if(reminder!=='none')lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escapeICS('Muistutus ylioppilaskokeesta: '+e.title),'TRIGGER:'+(reminder==='hour'?'-PT1H':'-PT15H'),'END:VALARM');
    lines.push('END:VEVENT');
  }
  return lines.concat('END:VCALENDAR').map(fold).join('\r\n')+'\r\n';
}
