import {MONTHS,SLUGS,DAYS,YEARS,CITIES,date,day,fi,add,weekStart,weeksInYear,daysInMonth,leap,cap,holidays,workStats,SOURCES} from './calendar.mjs';
import {phases,riseSet} from './astronomy.mjs';
import {editorialAnchor as a} from './editorial-links.mjs';
const phaseCache=new Map();
const cityExampleCache=new Map();
const monthPath=(base,y,m)=>'/'+base+'/'+y+'/'+(m?SLUGS[m-1]+'/':'');
const shell=(title,paragraphs)=>`<section class="period-guide panel" data-editorial-skip><h2>${title}</h2>${paragraphs.map(p=>'<p>'+p+'</p>').join('')}</section>`;
const properName=/^(?:J\.\s|(?:Mikael|Minna|Kalevalan|Eurooppa|Suomen|Ahvenanmaan|Eino|Tove|Miina|Aleksis|YK|Jean)\b)/;
const labelList=events=>new Intl.ListFormat('fi-FI',{style:'long',type:'conjunction'}).format(events.map(h=>a('/juhlapyhat/'+h.slug+'/',properName.test(h.name)?h.name:h.name.charAt(0).toLocaleLowerCase('fi-FI')+h.name.slice(1))+' ('+fi(new Date(h.date+'T00:00:00Z'))+')'));

export function periodDescription(path,fallback){
  const bits=path.split('/').filter(Boolean),base=bits[0],y=Number(bits[1]),m=SLUGS.indexOf(bits[2])+1;
  const city=CITIES.find(c=>c[0]===bits[1]);
  if(city&&['auringonnousu-ja-lasku','kuun-nousu-ja-lasku','paivan-pituus'].includes(base)){
    const year=bits[2]?' '+bits[2]:'';
    const topic={'auringonnousu-ja-lasku':'Auringon nousu- ja laskuajat sekä valon simulaatio','kuun-nousu-ja-lasku':'Kuun nousu- ja laskuajat sekä paikallisen näkyvyyden laskuri','paivan-pituus':'valoisan ajan kesto, vuosivaihtelu ja päivien vertailu'}[base];
    return `${city[1]}${year}: ${topic}. Valitse päivämäärä ja tarkista tulos Suomen ajassa.`;
  }
  if(!YEARS.includes(y))return fallback;
  const label=m?cap(MONTHS[m-1])+' '+y:String(y);
  if(base==='kuukalenteri'&&!m)return `Kuukalenteri ${y}: Kuun päivittäinen valaistus, uusikuut, täysikuut ja neljännekset Suomen ajassa. Valitse kuukausi tai lataa vuoden pohja.`;
  if(base==='kuukausikalenteri')return m?`${label}: valitse tulostettava kuukausipohja, lataa PDF tai 600 dpi:n kuva ja avaa kuukauden verkkokalenteri omia suunnitelmia varten.`:`Kuukausikalenterit ${y}: valitse kuukausi, vertaile 15 tulostettavaa ulkoasua ja lataa PDF tai korkearesoluutioinen kuva.`;
  if(m&&['juhlapyhat','liputuspaivat','merkkipaivat'].includes(base))return `${label}: `+({'juhlapyhat':'Suomen pyhäpäivät ja aatot. Tarkista päivämäärä, viikonpäivä ja ero työstä vapaaseen päivään.','liputuspaivat':'Suomen liputuspäivät ja niiden luokitus. Avaa päivän tausta, tarkista viikonpäivä ja tutustu liputusohjeisiin.','merkkipaivat':'Suomen muistettavat päivät ja niiden taustat. Tarkista ajankohta ja erota merkkipäivä yleisestä pyhäpäivästä.'})[base];
  return fallback;
}

export function periodGuide(path){
  const bits=path.split('/').filter(Boolean),base=bits[0],y=Number(bits[1]),m=SLUGS.indexOf(bits[2])+1;
  const directoryMonth=SLUGS.indexOf(bits[1])+1;
  if(base==='merkkipaivat'&&directoryMonth)return shell(cap(MONTHS[directoryMonth-1])+': juhlat eri vuosina',[
    `Kooste näyttää ${MONTHS[directoryMonth-1]}n päivät erikseen vuosille 2027, 2028, 2029 ja 2030. Liikkuvan juhlan päivämäärä voi vaihtua, joten valitse aina suunnitelmasi oma vuosiluku. Tämän kuukausikoosteen taulukoissa näkyvät sekä pyhäpäivät että muut kalenteriin merkityt päivät.`,
    `Päivän nimestä pääset sen historiaan, luokitukseen ja kalenterimuistutukseen. ${a('/juhlapyhat/','Pyhäpäivien luettelo')} auttaa vapaan suunnittelussa, kun taas ${a('/liputuspaivat/','liputuspäivien ohje')} kertoo liputuksen ajankohdista. Suomen juhlapäivien taustat voit tarkistaa myös ${a(SOURCES.holidays,'Almanakkatoimiston kalenteritiedoista')}.`,
  ]);
  if(!YEARS.includes(y))return '';
  const hs=holidays(y),period=m?cap(MONTHS[m-1])+' '+y:String(y);
  const selected=hs.filter(h=>!m||Number(h.date.slice(5,7))===m);
  if(base==='pitkat-viikonloput')return shell('Vuoden '+y+' vapaan vertailu',[
    `Taulukko vertailee yhdeksän kalenteripäivän jaksoja, joissa Suomen pyhäpäivä liittyy viikonloppuihin. Haettavat päivät on lueteltu erikseen: kokonainen vapaa ei tarkoita samaa kuin lomaan tarvittavien työpäivien määrä. Tarkista ${a('/juhlapyhat/'+y+'/','vuoden '+y+' pyhäpäivät')} ennen oman jakson valitsemista.`,
    `Jos oma työviikkosi, lomabudjettisi tai koulun aikataulu muuttaa suunnitelmaa, vertaa vaihtoehtoja ${a('/lomasuunnittelija/','lomasuunnittelijassa')}. ${a('/blogi/pitkan-vapaan-suunnittelu/','Pitkän vapaan opas')} auttaa huomioimaan myös lähtö- ja paluupäivän sekä muiden perheenjäsenten menot.`,
  ]);
  if(base==='viikkokalenteri'){
    const w=Number(bits[2]?.replace('viikko-',''));
    if(w>=1&&w<=weeksInYear(y)){
      const start=weekStart(y,w),end=add(start,6),weekHolidays=[...holidays(start.getUTCFullYear()),...(end.getUTCFullYear()!==start.getUTCFullYear()?holidays(end.getUTCFullYear()):[])].filter(h=>new Date(h.date+'T00:00:00Z')>=start&&new Date(h.date+'T00:00:00Z')<=end);
      return shell('Viikon '+w+' suunnittelu',[
        `Vuoden ${y} ISO-viikko ${w} alkaa maanantaina ${fi(start)} ja päättyy sunnuntaina ${fi(end)}. ${weekHolidays.length?(weekHolidays.length===1?'Viikolle osuu ':'Viikolle osuvat ')+labelList(weekHolidays)+'.':'Viikolle ei osu sivuston Suomen kalenteriin merkittyjä juhla- tai merkkipäiviä.'}`,
        `Kirjoita päivien kenttiin omat menot ja jätä siirtymille sekä tauoille aikaa. ${a('/perhekalenteri/','Perhekalenterissa')} voit jakaa menot henkilöittäin. Jos tarvitset viikon työpäivien määrän omilla valinnoillasi, avaa ${a('/tyopaivalaskuri/','työpäivälaskuri')}.`,
      ]);
    }
    return shell('Viikot ja kalenterivuosi '+y,[`Vuodessa ${y} on ${weeksInYear(y)} ISO-viikkoa. Viikko 1 alkaa ${fi(weekStart(y,1))}, ja viimeinen numeroitu viikko päättyy ${fi(add(weekStart(y,weeksInYear(y)),6))}. Kalenterivuoden ensimmäiset tai viimeiset päivät voivat siksi kuulua viereisen vuoden ISO-viikkoon.`,`Tarkista yksittäinen päivä ${a('/viikkonumerot/','viikkonumerolaskurilla')} tai avaa ${a('/kalenteri/'+y+'/','vuoden '+y+' kuukausinäkymät')}, kun haluat nähdä viikon paikan koko vuodessa.`]);
  }
  if(base==='tyopaivat'){
    const months=m?[m]:Array.from({length:12},(_,i)=>i+1);
    const totals=months.map(n=>workStats(y,n)).reduce((sum,row)=>Object.fromEntries(Object.keys(row).map(key=>[key,(sum[key]||0)+row[key]])),{});
    return shell(period+': mistä työpäivien määrä muodostuu?',[
      `${m?'Kuukaudessa':'Vuodessa'} on ${totals.days} kalenteripäivää. Niistä ${totals.weekdays} osuu maanantain ja perjantain välille. Näille arkipäiville osuvia yleisiä pyhäpäiviä on ${totals.holidays}. Kukin niistä vähennetään kerran, joten vertailuluku on ${totals.workdays} työpäivää. Oletuksella 7,5 tuntia päivässä se vastaa ${totals.hours.toLocaleString('fi-FI')} tuntia.`,
      `Taulukon malli ei vähennä henkilökohtaisia poissaoloja eikä erikseen vapaita aattoja. Valitse omat viikonpäivät, päivittäiset tunnit ja poissaolojaksot ${a('/tyopaivalaskuri/?start='+y+'-'+String(m||1).padStart(2,'0')+'-01&end='+y+'-'+String(m||12).padStart(2,'0')+'-'+daysInMonth(y,m||12),'työpäivälaskurissa')}. Pyhien ajankohdat löydät ${a(monthPath('juhlapyhat',y,m),'saman ajanjakson juhlapäivistä')}. Tulosta ei tule käyttää sellaisenaan palkka- tai vuosilomalaskelmana.`,
    ]);
  }
  if(!['kalenteri','kuukausikalenteri','pdf-kalenteri','kuukalenteri','juhlapyhat','liputuspaivat','merkkipaivat'].includes(base))return '';
  if(base==='kuukalenteri'){
    if(!phaseCache.has(y))phaseCache.set(y,phases(y));
    const ps=phaseCache.get(y).filter(p=>!m||Number(p.date.slice(5,7))===m),full=ps.filter(p=>p.quarter===2),fresh=ps.filter(p=>p.quarter===0);
    return shell((m?period:'Vuosi '+period)+' ja Kuun rytmi',[
      `${m?period+' sisältää '+daysInMonth(y,m)+' päivää ja ':`Vuoden ${y} taulukossa on `}${ps.length} Kuun päävaihehetkeä. ${fresh.length?'Uusikuu: '+fresh.map(p=>fi(new Date(p.date.slice(0,10)+'T00:00:00Z'))).join(', ')+'. ':''}${full.length?'Täysikuu: '+full.map(p=>fi(new Date(p.date.slice(0,10)+'T00:00:00Z'))).join(', ')+'.':''} Päävaihe on yksi täsmällinen hetki; päivän kuva näyttää valaistuksen klo 12.00 Suomen aikaa.`,
      `Vaihehetket lasketaan ${a(SOURCES.astro,'Astronomy Engine -kirjastolla')}. Vaiheen ja paikallisen näkyvyyden ero selviää ${a('/blogi/kuun-vaiheet/','Kuun vaiheiden oppaasta')}. Kun suunnittelet havaintoiltaa, tarkista lisäksi ${a('/kuun-nousu-ja-lasku/','Kuun nousu- ja laskuajat')} omalle paikkakunnallesi.`,
    ]);
  }
  if(['juhlapyhat','liputuspaivat','merkkipaivat'].includes(base)){
    const entries=selected.filter(h=>base==='juhlapyhat'?['holiday','eve'].includes(h.type):base==='liputuspaivat'?h.type==='flag'||h.isFlagDay:h.type!=='holiday');
    const type=base==='juhlapyhat'?'pyhien ja aattojen':base==='liputuspaivat'?'liputuspäivien':'merkkipäivien';
    return shell(period+': päivien merkitys',[
      `${m?'Kuukauden':'Vuoden'} ${type} luettelossa on ${entries.length} ${entries.length===1?'merkintä':'merkintää'}. ${m&&entries.length?(entries.length===1?'Päivä on ':'Näihin päiviin kuuluvat ')+labelList(entries.slice(0,3))+'. ':''}Pyhäpäivä, aatto ja liputuspäivä ovat eri luokituksia. Liputus tai merkkipäivä ei yksin tarkoita vapaapäivää.`,
      `Päivämäärät näkyvät myös ${a(monthPath('kalenteri',y,m),m?'saman kuukauden kalenterissa':'vuoden '+y+' kalenterissa')}. ${base==='liputuspaivat'?'Liputuksen käytännöt ja viralliset liputuspäivät löydät '+a(SOURCES.flags,'Sisäministeriön liputusohjeista'):a(SOURCES.holidays,'Helsingin yliopiston almanakkatoimisto')+' kertoo Suomen liputus- ja juhlapäivistä'}. ${a('/blogi/liputuspaiva-vai-pyhapaiva/','Opas päivän luokituksen lukemiseen')} auttaa erottamaan liputuksen ja työstä vapaan päivän.`,
    ]);
  }
  const count=m?daysInMonth(y,m):(leap(y)?366:365),main=monthPath('kalenteri',y,m),print=monthPath('pdf-kalenteri',y,m);
  const p1=m?`${period} sisältää ${count} päivää. Kuukauden ensimmäinen päivä on ${DAYS[day(date(y,m,1))]} ja viimeinen ${DAYS[day(date(y,m,count))]}.`:`Vuosi ${y} sisältää ${count} päivää${leap(y)?', ja helmikuussa on 29 päivää':''}. Tammikuun ensimmäinen päivä on ${DAYS[day(date(y,1,1))]}. Kuukausiruudukot alkavat maanantaista ja käyttävät ISO-viikkonumeroita.`;
  if(base==='pdf-kalenteri')return shell('Valitse '+(m?'kuukauden':'vuoden')+' tuloste käyttötarkoituksen mukaan',[
    p1+` ${a(main,m?'Kuukauden verkkokalenterista':'Vuoden verkkokalenterista')} näet päivien tarkemmat merkinnät ennen lataamista.`,
    `PDF säilyttää viivat ja tekstin vektoreina. Kuva-latauksesta saat pohjan paperikokoa vastaavan kuvatiedoston 600 dpi:n tarkkuudella. Valitse tulostuksessa sama paperikoko ja suunta kuin esikatselussa. ${a('/blogi/kalenterin-tulostus/','Kalenterin tulostusohje')} auttaa koon ja marginaalien valinnassa. Omia tapahtumia varten käytä ${a('/luo-kalenteri/?year='+y+(m?'&month='+m:''),'kalenterin muokkainta')}.`,
  ]);
  const holidayDays=selected.filter(h=>h.type==='holiday');
  return shell((m?period:'Vuosi '+period)+' suunnitelman pohjana',[
    p1+' '+(m?(holidayDays.length?(holidayDays.length===1?'Kuukauden pyhäpäivä on ':'Kuukauden pyhäpäiviä ovat ')+labelList(holidayDays)+'.':'Kuukaudelle ei osu tässä kalenterissa yleisiä pyhäpäiviä.'):`Vuoden liikkuvat pyhät kannattaa tarkistaa ${a('/juhlapyhat/'+y+'/','vuoden '+y+' juhlapäiväluettelosta')}.`),
    base==='kuukausikalenteri'?`Tämän sivun pohjat on tarkoitettu tulostamiseen. Päiväkohtaiset merkinnät ja viikonpäivät löydät ${a(main,m?'saman kuukauden verkkokalenterista':'vuoden verkkokalenterista')}. ${a('/luo-kalenteri/?year='+y+(m?'&month='+m:''),'Oman kalenterin muokkaimessa')} voit lisätä tapahtumia, kuvan ja otsikon.`:`Kun tarvitset paperiversion, valitse ${a(print,m?'tämän kuukauden tulostettavat pohjat':'vuoden '+y+' tulostettavat pohjat')}. Lyhyemmän jakson tekemiset voit jakaa ${a('/viikkokalenteri/'+y+'/','vuoden '+y+' viikkosuunnitelmaan')}.`,
  ]);
}

function cityExample(city,year,body,month,dayOfMonth){
  const key=[city[0],year,body,month,dayOfMonth].join(':');
  if(!cityExampleCache.has(key))cityExampleCache.set(key,riseSet(city,date(year,month,dayOfMonth),body));
  return cityExampleCache.get(key);
}
const duration=minutes=>`${Math.floor(minutes/60)} h ${minutes%60} min`;
const sunExample=(city,year,month)=>{
  const event=cityExample(city,year,'Sun',month,21),label=`21.${month}.${year}`;
  if(event.polar==='up')return `${label} Aurinko pysyy koko vuorokauden horisontin yläpuolella`;
  if(event.polar==='down')return `${label} Aurinko pysyy koko vuorokauden horisontin alapuolella`;
  return `${label} auringonnousu on klo ${event.riseTime}, lasku klo ${event.setTime} ja valoisa aika ${duration(event.duration)}`;
};
export function cityGuide(path){
  const bits=path.split('/').filter(Boolean),base=bits[0],city=CITIES.find(c=>c[0]===bits[1]),year=Number(bits[2])||2027;
  if(!city||!['auringonnousu-ja-lasku','kuun-nousu-ja-lasku','paivan-pituus'].includes(base))return '';
  const suffix='/'+city[0]+'/'+(bits[2]?year+'/':'');
  const coordinates=`Laskennan havaintopaikka on ${city[1]}, ${city[2].toLocaleString('fi-FI')}° pohjoista leveyttä ja ${city[3].toLocaleString('fi-FI')}° itäistä pituutta.`;
  const controls=`Valitse laskurista oma päivämäärä. ${bits[2]?'Vuoden '+year+' kuukausivertailu käyttää kunkin kuukauden 15. päivää. ':''}Kellonajat noudattavat Suomen kesä- ja normaaliaikaa.`;
  if(base==='kuun-nousu-ja-lasku'){
    const example=cityExample(city,year,'Moon',1,1);
    const exampleText=`Esimerkiksi 1.1.${year} `+(example.rise&&example.set?`Kuu nousee klo ${example.riseTime} ja laskee klo ${example.setTime}. Lasku voi olla saman paikallisen päivän aikana ennen nousua.`:example.rise?`Kuu nousee klo ${example.riseTime}, mutta samalle päivälle ei osu laskua.`:example.set?`Kuu laskee klo ${example.setTime}, mutta samalle päivälle ei osu nousua.`:example.polar==='up'?'Kuu pysyy koko paikallisen vuorokauden horisontin yläpuolella.':'Kuu pysyy koko paikallisen vuorokauden horisontin alapuolella.');
    return shell(city[1]+': Kuun näkyvyyden suunnittelu',[
      coordinates+' '+controls,
      exampleText+` Nousu- ja laskuajat eivät kerro valaistun pinnan osuutta. Valitse sopiva vaihe ${a('/kuukalenteri/'+year+'/','vuoden '+year+' kuukalenterista')} ja vertaa sitä ${a('/auringonnousu-ja-lasku'+suffix,'saman paikkakunnan Auringon aikoihin')}.`,
      `Laskenta käyttää ${a(SOURCES.astro,'Astronomy Engine -kirjastoa')} ja esteetöntä horisonttia. Rakennukset, maasto ja pilvet vaikuttavat havaintoon. ${a('/blogi/kuun-vaiheet/','Kuun vaiheiden opas')} auttaa erottamaan päävaiheen, päivittäisen valaistuksen ja paikallisen näkyvyyden.`,
    ]);
  }
  return shell(city[1]+': valo omassa suunnitelmassa',[
    coordinates+' '+controls,
    `${sunExample(city,year,6)}. Vertailuksi ${sunExample(city,year,12)}. Nämä ovat kahden valitun päivän laskennallisia esimerkkejä, eivät sääennusteita.`,
    (base==='paivan-pituus'?'Valoisa aika tarkoittaa tässä auringonnousun ja laskun välistä aikaa. Hämärä ei sisälly lukuun. Päivittäinen muutos ja seitsemän päivän vertailu lasketaan valitsemasi päivämäärän ympäriltä.':'Simulaation Auringon suunta perustuu paikan koordinaatteihin. Maisema havainnollistaa valoa, mutta ei mallinna tontin puita tai rakennuksia.')+` ${a('/'+(base==='paivan-pituus'?'auringonnousu-ja-lasku':'paivan-pituus')+suffix,base==='paivan-pituus'?'Auringon kulun simulaatio':'Päivän pituuden vertailu')} täydentää saman paikkakunnan näkymää. Ajat lasketaan ${a(SOURCES.astro,'Astronomy Engine -kirjastolla')}; ${a('/blogi/auringon-ajat/','Auringon aikojen opas')} selittää hämärän ja auringonnousun eron.`,
  ]);
}
