import {PAYMENT_PLANS} from './payment-data.mjs';
import {createPaymentCore} from './payment-calendar-core.mjs';
import {serviceCalendar,serviceGoogleURL} from './finland-services-core.mjs';
import {civil} from './community-core.mjs';
export {REMINDERS} from './calendar-event-core.mjs';
export const BENEFIT_PLANS=PAYMENT_PLANS.filter(p=>p.kind==='benefit');
export const {paymentDates,pensionReport:benefitReport,paymentPath, pensionICS:benefitICS,paymentCSV,paymentGoogleURL,localPaymentEvents}=createPaymentCore(BENEFIT_PLANS);
export const BENEFIT_GUIDES=[
 {id:'lapsilisa',name:'Lapsilisä',group:'Perhe',schedule:'Julkaistu kuukausitaulukko',text:'Vuoden 2027 päivät näet tämän sivun kalenterista. Tarkista oma oikeutesi ja maksun määrä päätöksestä.',source:'https://www.kela.fi/lapsilisa'},
 {id:'asumistuki',name:'Yleinen asumistuki',group:'Asuminen',schedule:'Kuukauden ensimmäinen pankkipäivä',text:'Ensimmäisen maksun ja mahdollisen takautuvan erän päivämäärä kannattaa tarkistaa erikseen OmaKelasta.',source:'https://www.kela.fi/maksupaivat'},
 {id:'opintotuki',name:'Opintoraha ja asumislisä',group:'Opiskelu',schedule:'Kuukauden 1. päivä tai seuraava pankkipäivä',text:'Maksu koskee myönnettyjä tukikuukausia. Kesäkuukausille ei pidä lisätä maksua automaattisesti.',source:'https://www.kela.fi/opintotuki-asumislisa'},
 {id:'elatustuki',name:'Elatustuki',group:'Perhe',schedule:'Kuukauden 10. päivä',text:'Pyhäpäivälle tai lauantaille osuva maksu siirtyy Kelan ohjeen mukaan edeltävälle pankkipäivälle. Perityn elatusavun aikataulu on eri.',source:'https://www.kela.fi/maksupaivat'},
 {id:'hoitoraha',name:'Joustava ja osittainen hoitoraha',group:'Perhe',schedule:'Kuukauden viimeinen pankkipäivä',text:'Päätöksen ajankohta voi vaikuttaa ensimmäiseen maksuun. Käytä muistutuksessa OmaKelassa näkyvää päivää.',source:'https://www.kela.fi/maksupaivat'},
 {id:'toimeentulotuki',name:'Toimeentulotuki',group:'Arki',schedule:'Säännöllinen maksu kuukauden ensimmäisenä pankkipäivänä',text:'Jos päätös ei ehdi säännölliseen maksuun, maksupäivä poikkeaa kuukausirytmistä. Tarkista oma päätös ennen muistutuksen lisäämistä.',source:'https://www.kela.fi/maksupaivat'},
 {id:'yleistuki',name:'Yleistuki',group:'Työttömyys',schedule:'Jälkikäteen omassa maksujaksossa',text:'Maksu perustuu työttömyysajan ilmoitukseen. Kaikille yhteistä kuukauden maksupäivää ei ole.',source:'https://www.kela.fi/maksupaivat'},
 {id:'paivaraha',name:'Sairauspäiväraha ja vanhempainpäivärahat',group:'Terveys ja perhe',schedule:'Henkilökohtaiset maksuerät',text:'Näitä maksuja ei voi päätellä lapsilisän kalenterista. Ota tarkka päivämäärä OmaKelasta ja lisää se omaksi muistutukseksi.',source:'https://www.kela.fi/maksupaivat'},
];
export function normalBenefitEntry(value){
 const type=BENEFIT_GUIDES.find(t=>t.id===value?.type);if(!type)throw Error('Valitse etuus.');
 const d=civil(value.date);if(d.getUTCFullYear()<2000||d.getUTCFullYear()>2100)throw Error('Valitse päivämäärä vuosilta 2000–2100.');
 return {id:'oma-etuus-'+type.id+'-'+value.date,type:type.id,name:type.name,date:value.date};
}
export function normalBenefitEntries(values){return [...new Map((Array.isArray(values)?values:[]).slice(0,240).flatMap(v=>{try{const e=normalBenefitEntry(v);return [[e.id,e]];}catch{return [];}})).values()].sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name,'fi'));}
const ownEvent=e=>{const item=normalBenefitEntry(e);return {id:item.id,date:item.date,name:'Kela: '+item.name,applies:'OmaKelasta itse tarkistamani maksupäivä. Oma kalenterimerkintä, ei Kelan vahvistus tai yhteys OmaKelaan.',source:'https://oma.kela.fi/',period:'Oma maksupäivä'};};
export function ownGoogleURL(e){return serviceGoogleURL(ownEvent(e));}
export function ownBenefitICS(entries,reminder='1',now=new Date()){
 const list=normalBenefitEntries(entries);if(list.length!==(Array.isArray(entries)?entries.length:0))throw Error('Tarkista omien maksujen tiedot.');
 const bodies=list.map(e=>serviceCalendar(ownEvent(e),reminder,now).match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/)[0]);
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365.fi//Omat etuusmuistutukset//FI','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Omat etuusmuistutukset',...bodies,'END:VCALENDAR',''].join('\r\n');
}
export function ownLocalEvent(e){const v=ownEvent(e);return {id:v.id,date:v.date,title:v.name,time:'',category:'personal',note:v.applies,repeat:'none',interval:1,until:'',exdates:[]};}
