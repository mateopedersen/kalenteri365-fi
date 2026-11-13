// Reviewed against the linked primary sources on 2026-11-13. No extrapolated annual deadlines.
export const CHECKED='2026-11-13';
export const SERVICE_SOURCES={
 personal:'https://www.vero.fi/henkiloasiakkaat/henkiloasiakkaan_tarkeat_paivamaarat/',
 business:'https://www.vero.fi/yritykset-ja-yhteisot/yritys_ja_yhteisoasiakkaiden_tarkeat_paivamaarat/',
 vat:'https://www.vero.fi/syventavat-vero-ohjeet/ohje-hakusivu/335806/arvonlis%C3%A4verovelvollisen-opas/',
 employer:'https://www.vero.fi/yritykset-ja-yhteisot/verot-ja-maksut/yritys_tyonantajana/nain-ilmoitat-palkat-ja-tyonantajasuoritukset/',
 applications:'https://opintopolku.fi/konfo/fi/sivu/hakuaikataulut',
 applicationGuide:'https://opintopolku.fi/konfo/fi/sivu/nain-haet-yhteishaussa-korkeakouluun',
 autumn2026:'https://www.oph.fi/fi/uutiset/2026/korkeakoulujen-syksyn-yhteishaussa-tarjolla-yli-12-100-opiskelupaikkaa',
 exams:'https://www.ylioppilastutkinto.fi/fi/tutkinnon-suorittaminen/koepaivat/kevaan-2027-koepaivat',
 flags:'https://almanakka.helsinki.fi/fi/liputus-ja-juhlapaivat/liputuspaivat-2027/',
 flagHours:'https://almanakka.helsinki.fi/en/flag-days-and-holidays/flag-days-in-finland/',
 election:'https://www.kuntaliitto.fi/yleiskirjeet/2026/vuoden-2027-eduskuntavaalit',
 tyres:'https://www.traficom.fi/fi/autoilijat/vinkkeja-liikenteeseen/auton-kesa-ja-talvirenkaat',
 schoolsSV:'https://paatokset.hel.fi/sv/arende/hel-2025-016789/abdd01ba-d960-4194-8ee6-330aaedff9db',
};
const personal=(id,date,name,applies,period='Verovuosi 2025',type='personal')=>({id,date,name,applies,period,type,source:SERVICE_SOURCES.personal,checked:CHECKED});
export const PERSONAL_TAX_DATES=[
 personal('forest-return','2026-03-02','Metsätalouden veroilmoitus','Vain metsätaloutta harjoittavat ja metsäyhtymät.'),
 ...[['2026-04-01','Yrittäjät, maataloudenharjoittajat ja puolisot, joiden ilmoituksessa on tämä määräpäivä.'],['2026-04-14','Henkilöt, joiden omassa veroilmoituksessa määräpäivä on 14.4.'],['2026-04-21','Henkilöt, joiden omassa veroilmoituksessa määräpäivä on 21.4.'],['2026-04-28','Henkilöt, joiden omassa veroilmoituksessa määräpäivä on 28.4.']].map(([d,a],i)=>personal('return-'+i,d,'Esitäytetyn veroilmoituksen korjaukset',a)),
 personal('property-return','2026-04-14','Kiinteistöverotuksen tietojen korjaaminen','Henkilöasiakkaat, joiden kiinteistöverotuksen tiedoissa on korjattavaa.','Kiinteistöverotus 2026'),
 ...['2026-01-23','2026-02-23','2026-03-23','2026-04-23','2026-05-25','2026-06-23','2026-07-23','2026-08-24','2026-09-22','2026-10-23','2026-11-23','2026-12-23'].map((d,i)=>personal('advance-'+(i+1),d,'Ennakkoveron maksuerä','Vain jos omassa ennakkoveropäätöksessäsi on erä maksettavana.','Ennakkovero 2026')),
 ...[['05','2026-07-03','2026-07-01','2026-09-01'],['06','2026-08-03','2026-08-03','2026-10-01'],['07','2026-09-03','2026-09-01','2026-11-02'],['08','2026-10-05','2026-10-01','2026-12-01'],['09','2026-11-03','2026-11-02','2027-01-04'],['10','2026-12-03','2026-12-01','2027-02-01']].flatMap(([month,refund,first,second])=>[
  personal('refund-'+month,refund,'Veronpalautuksen maksupäivä',`Vain jos oma verotuksesi päättyy ${month}/2026 ja päätöksessäsi on veronpalautusta. Maksupäivä voi muuttua.`, 'Verovuosi 2025','refund'),
  personal('residual-'+month+'-1',first,'Jäännösveron ensimmäinen erä',`Vain jos oma verotuksesi päättyy ${month}/2026 ja päätöksessäsi on maksettavaa.`, 'Verovuosi 2025','residual'),
  personal('residual-'+month+'-2',second,'Jäännösveron toinen erä',`Vain jos oma verotuksesi päättyy ${month}/2026 ja päätöksessäsi on toinen maksuerä.`, 'Verovuosi 2025','residual'),
 ]),
].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
const step=(id,date,name,time,qualifier='Määräpäivä')=>({id,date,name,time,qualifier});
export const ADMISSION_ROUTES=[
 {id:'higher-first',name:'Korkeakoulujen kevään ensimmäinen yhteishaku',applicationYear:2027,start:'Syksy 2027',audience:'Vieraskieliset koulutukset ja Taideyliopisto',source:SERVICE_SOURCES.applications,steps:[step('opens','2027-01-07','Hakuaika alkaa','08:00'),step('closes','2027-01-21','Hakuaika päättyy','15:00'),step('results','2027-07-06','Valintatulokset viimeistään',null,'Viimeistään'),step('accept','2027-07-13','Ota opiskelupaikka vastaan','15:00'),step('reserve','2027-08-03','Varasijavalinta päättyy','15:00')]},
 {id:'higher-second',name:'Korkeakoulujen kevään toinen yhteishaku',applicationYear:2027,start:'Syksy 2027',audience:'Suomen- ja ruotsinkieliset korkeakoulutukset',source:SERVICE_SOURCES.applications,steps:[step('opens','2027-03-09','Hakuaika alkaa','08:00'),step('closes','2027-03-23','Hakuaika päättyy','15:00'),step('certificate','2027-05-28','Todistusvalinnan tulokset viimeistään',null,'Viimeistään'),step('results','2027-07-06','Kaikki valintatulokset viimeistään',null,'Viimeistään'),step('accept','2027-07-13','Ota opiskelupaikka vastaan','15:00'),step('reserve','2027-08-03','Varasijavalinta päättyy','15:00')]},
 {id:'secondary',name:'Perusopetuksen jälkeisen koulutuksen yhteishaku',applicationYear:2027,start:'Syksy 2027',audience:'Lukiot, ammatilliset perustutkinnot, TUVA ja TELMA',source:SERVICE_SOURCES.applications,steps:[step('opens','2027-02-16','Hakuaika alkaa','08:00'),step('closes','2027-03-16','Hakuaika päättyy','15:00'),step('results','2027-06-17','Valintatulokset aikaisintaan',null,'Aikaisintaan'),step('accept','2027-07-01','Ota opiskelupaikka vastaan',null),step('reserve','2027-08-13','Varasijavalinta päättyy',null)]},
 {id:'higher-autumn',name:'Korkeakoulujen syksyn yhteishaku',applicationYear:2027,start:'Tammikuu 2028',audience:'Tammikuussa alkavat korkeakoulutukset',source:SERVICE_SOURCES.applications,steps:[step('opens','2027-08-30','Hakuaika alkaa','08:00'),step('closes','2027-09-09','Hakuaika päättyy','15:00'),step('results','2027-11-18','Valintatulokset viimeistään',null,'Viimeistään'),step('accept','2027-11-25','Ota opiskelupaikka vastaan','15:00'),step('reserve','2027-12-09','Varasijavalinta päättyy','15:00')]},
];
export const REGIONAL_FLAGS_2027=[
 ...[['03-30','Ahvenanmaan demilitarisoinnin päivä'],['04-25','Ahvenanmaan lipun päivä'],['06-09','Ahvenanmaan itsehallintopäivä']].map(([d,name],i)=>({id:'aland-'+i,date:'2027-'+d,name,region:'aland'})),
 ...[['02-06','Saamelaisten kansallispäivä'],['03-02','Suomen saamelaiskäräjien perustamispäivä'],['03-14','Marian ilmestyspäivä'],['06-26','Juhannuspäivä'],['08-09','Kansainvälinen alkuperäiskansojen päivä'],['08-15','Saamen lipun hyväksymispäivä'],['08-18','Saamelaisneuvoston perustamispäivä'],['08-26','Ruotsin saamelaiskäräjien perustamispäivä'],['10-09','Norjan saamelaiskäräjien perustamispäivä'],['11-09','Saamelaisvaltuuskunnan perustamispäivä'],['11-15','Isak Saban syntymäpäivä'],['11-29','Elsa Laula Renbergin syntymäpäivä']].map(([d,name],i)=>({id:'sami-'+i,date:'2027-'+d,name,region:'sami'})),
].map(e=>({...e,source:SERVICE_SOURCES.flags,checked:CHECKED}));
export const EXAM_RESULT_EVENTS=[
 {id:'exam-results-schools',date:'2027-05-18',name:'Ylioppilastutkinnon tulokset lukioille',applies:'Kevään 2027 tutkinto. Julkaisupäivä on alustava ja voi muuttua. Tämä ei ole korkeakoulujen valintatulos.'},
 {id:'exam-results-students',date:'2027-05-19',name:'Ylioppilastutkinnon tulokset Oma Opintopolussa',applies:'Kevään 2027 tutkinnon kokelaat ja alaikäisten kokelaiden huoltajat. Julkaisupäivä on alustava ja voi muuttua.'},
].map(e=>({...e,route:'exam-results',source:SERVICE_SOURCES.exams,qualifier:'Alustava julkaisupäivä',tentative:true,checked:CHECKED}));
export const ELECTION_EVENTS=[
 {id:'advance-fi',date:'2027-04-07',endDate:'2027-04-14',name:'Eduskuntavaalien ennakkoäänestys Suomessa',applies:'7.–13.4.2027. Tarkista valitsemasi äänestyspaikan aukioloajat.',source:SERVICE_SOURCES.election},
 {id:'advance-abroad',date:'2027-04-07',endDate:'2027-04-11',name:'Eduskuntavaalien ennakkoäänestys ulkomailla',applies:'7.–10.4.2027. Yksittäinen äänestyspaikka ei välttämättä ole avoinna jokaisena päivänä.',source:SERVICE_SOURCES.election},
 {id:'election',date:'2027-04-18',name:'Eduskuntavaalien vaalipäivä',applies:'Äänestä vaalipäivänä oman äänestysalueesi äänestyspaikassa. Tarkista paikkatieto virallisesta palvelusta.',source:SERVICE_SOURCES.election},
];
