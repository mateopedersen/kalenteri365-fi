// Published 2027 tables, checked against each institution on 13 November 2026.
const firstBankDay=['01-04','02-01','03-01','04-01','05-03','06-01','07-01','08-02','09-01','10-01','11-01','12-01'];
const plan=(id,institution,name,days,source,note,kind='pension')=>({id,institution,name,dates:days.map(d=>'2027-'+d),source,note,kind,checked:'2026-11-13'});
const keva='https://www.keva.fi/uutiset-ja-artikkelit/elakkeen-maksupaivat-vuonna-2027/';
export const PAYMENT_PLANS=[
 plan('kela-lapsilisa','Kela','Lapsilisä',['01-26','02-26','03-25','04-23','05-26','06-25','07-23','08-26','09-24','10-26','11-26','12-23'],'https://www.kela.fi/lapsilisa','Julkaistut lapsilisän maksupäivät. OmaKelan päätös kertoo henkilökohtaisen oikeuden ja maksun.','benefit'),
 plan('keva-kunta','Keva','Kunta-alan ja hyvinvointialueiden eläkkeet',['01-04','02-03','03-03','04-02','05-03','06-03','07-02','08-03','09-03','10-01','11-03','12-03'],keva,'Kunnan tai hyvinvointialueen palvelukseen perustuva eläke. Ensimmäinen eläke-erä ilmoitetaan erikseen.'),
 plan('keva-valtio','Keva','Valtion eläkkeet',['01-20','02-19','03-19','04-20','05-20','06-18','07-20','08-20','09-20','10-20','11-19','12-20'],keva,'Valtion palvelukseen perustuva eläke. Ensimmäisen eläke-erän päivä voi poiketa tästä kalenterista.'),
 plan('keva-muut','Keva','Kirkon, Suomen Pankin, Kelan ja Ahvenanmaan henkilöstön eläkkeet',firstBankDay,keva,'Kelan toimisuhde-eläke tarkoittaa Kelan henkilöstön eläkettä. Se ei tarkoita Kelan etuuksia tai kaikkia Kelan maksamia eläkkeitä.'),
 plan('ilmarinen','Ilmarinen','Ilmarisen työeläkkeet',firstBankDay,'https://www.ilmarinen.fi/henkiloasiakas/elakkeella/elakkeen-maksaminen-ja-maksupaivat/','Julkaistu säännöllisen eläkkeen maksukalenteri. Oman eläke-erän tiedot ja ensimmäinen maksupäivä tarkistetaan OmaEläkkeestä.'),
];
export const paymentEvents = p => p.dates.map(date=>({id:p.id+'-'+date,date,name:p.institution+': '+p.name,applies:p.note,source:p.source,checked:p.checked,period:'Maksukalenteri 2027'}));
