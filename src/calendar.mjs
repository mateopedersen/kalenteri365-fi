// All civil dates are UTC date-only values; display times use Europe/Helsinki.
export const YEARS=[2027,2028,2029,2030];
export const MONTHS=['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'];
export const SLUGS=['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesakuu','heinakuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'];
export const DAYS=['maanantai','tiistai','keskiviikko','torstai','perjantai','lauantai','sunnuntai'];
export const date=(y,m,d)=>new Date(Date.UTC(y,m-1,d));
export const iso=d=>d.toISOString().slice(0,10);
export const parse=s=>new Date(s+'T00:00:00Z');
export const add=(d,n)=>new Date(+d+n*86400000);
export const day=d=>(d.getUTCDay()+6)%7;
export const daysInMonth=(y,m)=>date(y,m+1,0).getUTCDate();
export const leap=y=>y%4===0&&(y%100!==0||y%400===0);
export const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
export const fi=d=>`${d.getUTCDate()}.${d.getUTCMonth()+1}.${d.getUTCFullYear()}`;
export function week(d){const t=add(d,3-day(d));return {year:t.getUTCFullYear(),number:1+Math.round((+t-+add(date(t.getUTCFullYear(),1,4),3-day(date(t.getUTCFullYear(),1,4))))/604800000)};}
export const weekStart=(y,w)=>add(date(y,1,4),-day(date(y,1,4))+(w-1)*7);
export const weeksInYear=y=>week(date(y,12,28)).number;
export function monthGrid(y,m){const start=add(date(y,m,1),-day(date(y,m,1)));return Array.from({length:Math.ceil((day(date(y,m,1))+daysInMonth(y,m))/7)},(_,i)=>Array.from({length:7},(_,j)=>add(start,i*7+j)));}
export function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;return date(y,Math.floor(n/31),n%31+1);}
const nth=(y,m,weekday,n)=>{let d=date(y,m,1);return add(d,(weekday-day(d)+7)%7+(n-1)*7);};
const nextSat=d=>add(d,(5-day(d)+7)%7);
export const SOURCES={holidays:'https://almanakka.helsinki.fi/fi/liputus-ja-juhlapaivat/',flags:'https://intermin.fi/suomen-lippu/liputuspaivat',school:'https://www.hel.fi/fi/kasvatus-ja-koulutus/koulujen-ja-oppilaitosten-tyo-ja-loma-ajat',education:'https://www.oph.fi/fi/koulutus-ja-tutkinnot/tyoajat',kela:'https://www.kela.fi/maksupaivat',exams:'https://www.ylioppilastutkinto.fi/fi/tutkinnon-suorittaminen/koepaivat',astro:'https://github.com/cosinekitty/astronomy',names:'https://almanakka.helsinki.fi/fi/nimipaivat/'};
export function holidays(y){
 const e=easter(y),mid=nextSat(date(y,6,20)),saints=nextSat(date(y,10,31));let out=[];
 const put=(d,name,slug,type,description)=>out.push({date:iso(d),name,slug,type,description});
 const p=(d,n,s,t,desc)=>put(d,n,s,t,desc);
 p(date(y,1,1),'Uudenvuodenpäivä','uudenvuodenpaiva','holiday','Vuoden ensimmäinen päivä on Suomessa kirkollinen juhlapäivä. Uudenvuodenaattoa vietetään edellisenä iltana.');
 p(date(y,1,6),'Loppiainen','loppiainen','holiday','Loppiainen päättää perinteisen joulukauden. Päivä on aina 6. tammikuuta, joten viikonpäivä vaihtuu vuosittain.');
 p(add(e,-2),'Pitkäperjantai','pitkaperjantai','holiday','Pääsiäistä edeltävä perjantai on kirkollinen juhlapäivä. Ajankohta määräytyy pääsiäissunnuntain mukaan.');
 p(e,'Pääsiäispäivä','paasiaispaiva','holiday','Pääsiäissunnuntai on liikkuva kirkollinen juhlapäivä. Kalenterimme käyttää gregoriaanisen kalenterin pääsiäislaskentaa.');
 p(add(e,1),'2. pääsiäispäivä','toinen-paasiaispaiva','holiday','Pääsiäismaanantai seuraa pääsiäissunnuntaita. Se muodostaa pitkäperjantain kanssa pitkän pääsiäisviikonlopun.');
 p(date(y,5,1),'Vappu','vappu','holiday','Vappu on suomalaisen työn päivä ja virallinen liputuspäivä. Päivä on myös kevään ja opiskelijoiden juhla.');
 p(add(e,39),'Helatorstai','helatorstai','holiday','Helatorstai on 39 päivää pääsiäissunnuntain jälkeen. Se osuu aina torstaille.');
 p(add(e,49),'Helluntaipäivä','helluntaipaiva','holiday','Helluntai on seitsemän viikkoa pääsiäisen jälkeen. Se osuu aina sunnuntaille.');
 p(mid,'Juhannuspäivä','juhannuspaiva','holiday','Juhannuspäivä on 20.–26. kesäkuuta osuva lauantai. Samana päivänä vietetään Suomen lipun päivää.');
 p(saints,'Pyhäinpäivä','pyhainpaiva','holiday','Pyhäinpäivää vietetään lauantaina, joka osuu ajalle 31.10.–6.11. Päivänä muistetaan edesmenneitä läheisiä.');
 p(date(y,12,6),'Itsenäisyyspäivä','itsenaisyyspaiva','holiday','Suomen itsenäisyyspäivä on 6. joulukuuta. Se on yleinen juhlapäivä ja virallinen liputuspäivä.');
 p(date(y,12,25),'Joulupäivä','joulupaiva','holiday','Joulupäivää vietetään 25. joulukuuta. Se on kirkollinen juhlapäivä. Jouluaatto on merkitty kalenteriin erikseen.');
 p(date(y,12,26),'Tapaninpäivä','tapaninpaiva','holiday','Tapaninpäivä eli toinen joulupäivä on 26. joulukuuta. Se on kirkollinen juhlapäivä.');
 p(add(mid,-1),'Juhannusaatto','juhannusaatto','eve','Juhannusaatto on juhannuspäivää edeltävä perjantai. Se ei ole kirkollinen juhlapäivä; vapaa määräytyy esimerkiksi työehtosopimuksen perusteella.');
 p(date(y,12,24),'Jouluaatto','jouluaatto','eve','Jouluaatto ei ole kirkollinen juhlapäivä. Se on monissa työehtosopimuksissa vapaapäivä. Tarkista oman työsi järjestelyt.');
 for(const [m,d,n,s] of [[2,5,'J. L. Runebergin päivä','runebergin-paiva'],[2,28,'Kalevalan päivä','kalevalan-paiva'],[3,19,'Minna Canthin päivä','minna-canthin-paiva'],[4,9,'Mikael Agricolan päivä','agricolan-paiva'],[4,27,'Kansallinen veteraanipäivä','veteraanipaiva'],[5,9,'Eurooppa-päivä','eurooppa-paiva'],[5,12,'J. V. Snellmanin päivä','snellmanin-paiva'],[6,4,'Puolustusvoimain lippujuhlan päivä','lippujuhlan-paiva'],[7,6,'Eino Leinon päivä','eino-leinon-paiva'],[10,1,'Miina Sillanpään päivä','miina-sillanpaan-paiva'],[10,10,'Aleksis Kiven päivä','aleksis-kiven-paiva'],[10,24,'YK:n päivä','ykn-paiva'],[11,6,'Ruotsalaisuuden päivä','ruotsalaisuuden-paiva'],[11,20,'Lapsen oikeuksien päivä','lapsen-oikeuksien-paiva'],[12,8,'Jean Sibeliuksen päivä','sibeliuksen-paiva']]) p(date(y,m,d),n,s,'flag',`${n} on suomalaisen kalenterin liputuspäivä. Liputuspäivä ei yksin tarkoita työstä vapaata päivää.`);
 p(nth(y,5,6,2),'Äitienpäivä','aitienpaiva','flag','Äitienpäivä on toukokuun toinen sunnuntai ja virallinen liputuspäivä.');
 p(nth(y,5,6,3),'Kaatuneitten muistopäivä','kaatuneitten-muistopaiva','flag','Kaatuneitten muistopäivä on toukokuun kolmas sunnuntai.');
 p(nth(y,11,6,2),'Isänpäivä','isanpaiva','flag','Isänpäivä on marraskuun toinen sunnuntai ja virallinen liputuspäivä.');
 p(add(date(y,9,1),-1-((day(add(date(y,9,1),-1))-5+7)%7)),'Suomen luonnon päivä','suomen-luonnon-paiva','flag','Suomen luonnon päivää vietetään elokuun viimeisenä lauantaina.');
 for(const [m,d,n,s,desc] of [[2,6,'Saamelaisten kansallispäivä','saamelaisten-kansallispaiva','Saamelaisten kansallispäivää vietetään 6. helmikuuta. Se on saamelaisten yhteinen juhlapäivä.'],[2,14,'Ystävänpäivä','ystavanpaiva','Ystävänpäivä tarjoaa tilaisuuden muistaa ystäviä ja läheisiä. Se ei ole yleinen vapaapäivä.'],[3,8,'Kansainvälinen naistenpäivä','naistenpaiva','Kansainvälistä naistenpäivää vietetään 8. maaliskuuta.'],[6,9,'Ahvenanmaan itsehallintopäivä','ahvenanmaan-itsehallintopaiva','Ahvenanmaan itsehallintopäivä on alueellinen juhla- ja liputuspäivä.'],[10,31,'Halloween','halloween','Halloween on lokakuun viimeinen päivä. Sitä ei pidä sekoittaa liikkuvaan pyhäinpäivään.'],[12,31,'Uudenvuodenaatto','uudenvuodenaatto','Uudenvuodenaatto on vuoden viimeinen päivä. Se ei itsessään ole yleinen juhlapäivä.']])p(date(y,m,d),n,s,'observance',desc);
 p(add(e,-47),'Laskiaistiistai','laskiaistiistai','observance','Laskiaistiistai on 47 päivää ennen pääsiäissunnuntaita. Päivään liittyvät Suomessa ulkoilu ja laskiaispullat.');
 if(y===2027)p(date(y,4,18),'Eduskuntavaalit','eduskuntavaalit','flag','Vuoden 2027 eduskuntavaalien vaalipäivä on 18. huhtikuuta. Päivä on virallinen liputuspäivä. Tarkista mahdolliset muutokset oikeusministeriön vaalipalvelusta.');
 for(const item of out)item.isFlagDay=item.type==='flag'||['vappu','juhannuspaiva','itsenaisyyspaiva'].includes(item.slug);
 return out.sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name,'fi'));
}
export function workStats(y,m,includeEves=false){let ds=Array.from({length:daysInMonth(y,m)},(_,i)=>date(y,m,i+1));const hs=new Set(holidays(y).filter(h=>h.type==='holiday'||includeEves&&h.type==='eve').map(h=>h.date));let weekdays=ds.filter(d=>day(d)<5).length,removed=ds.filter(d=>day(d)<5&&hs.has(iso(d))).length;return {days:ds.length,weekdays,holidays:removed,workdays:weekdays-removed,hours:(weekdays-removed)*7.5};}
export const CITIES=[['helsinki','Helsinki',60.1699,24.9384],['espoo','Espoo',60.2055,24.6559],['tampere','Tampere',61.4978,23.761],['vantaa','Vantaa',60.2934,25.0378],['oulu','Oulu',65.0121,25.4651],['turku','Turku',60.4518,22.2666],['jyvaskyla','Jyväskylä',62.2426,25.7473],['kuopio','Kuopio',62.8924,27.677],['lahti','Lahti',60.9827,25.6615],['pori','Pori',61.4851,21.7974],['kouvola','Kouvola',60.8681,26.7042],['joensuu','Joensuu',62.601,29.7636],['lappeenranta','Lappeenranta',61.0587,28.1887],['hameenlinna','Hämeenlinna',60.9959,24.4643],['vaasa','Vaasa',63.0951,21.6165],['seinajoki','Seinäjoki',62.7903,22.8403],['rovaniemi','Rovaniemi',66.5039,25.7294],['mikkeli','Mikkeli',61.6873,27.2739],['porvoo','Porvoo',60.3928,25.6645],['kotka','Kotka',60.4664,26.9458],['salo','Salo',60.383,23.1338],['kemi','Kemi',65.736,24.5637],['savonlinna','Savonlinna',61.868,28.879],['maarianhamina','Maarianhamina',60.097,19.935],['utsjoki','Utsjoki',69.909,27.027]];
export function ics(events,title='Suomen kalenteri'){const esc=s=>String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,x=>'\\'+x);const fold=line=>{let out='',len=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(len+n>74){out+='\r\n ';len=1;}out+=c;len+=n;}return out;};return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365.fi//FI','CALSCALE:GREGORIAN','X-WR-CALNAME:'+esc(title),...events.flatMap((h,i)=>['BEGIN:VEVENT',`UID:${h.date}-${h.slug||i}@kalenteri365.fi`,'DTSTAMP:20261112T000000Z','DTSTART;VALUE=DATE:'+h.date.replaceAll('-',''),'DTEND;VALUE=DATE:'+iso(add(parse(h.date),1)).replaceAll('-',''),'SUMMARY:'+esc(h.name),'DESCRIPTION:'+esc(h.description||''),'END:VEVENT']),'END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';}
