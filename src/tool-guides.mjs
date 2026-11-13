import {editorialAnchor as a} from './editorial-links.mjs';
import {SOURCES} from './calendar.mjs';
const guides={
 'viikkokalenteri':['Viikon rungosta päivän tehtäviin',[
  `Jos yksi tehtävä vaatii useita työvaiheita, jaa ne eri päiville ja tarkenna seuraava vaihe ${a('/paivasuunnittelija/','päiväsuunnittelijassa')}. Usean ihmisen aikataulut voit sovittaa yhteen ${a('/perhekalenteri/','perhekalenterissa')}. ${a('/blogi/viikkonumerot/','Viikkonumeroiden opas')} auttaa, kun sovittu viikko osuu vuodenvaihteeseen tai meno toistuu joka toinen viikko.`,
 ]],
 'perhekalenteri':['Sovi myös menojen väliin jäävä aika',[
  `Jos saman illan harrastukset osuvat päällekkäin, sopikaa myös kuljetukset ja lähtöajat. Vertaa yhteisiä menoja ${a('/tyovuorosuunnittelija/','työvuoroihin')} ja ${a('/koulujen-lomat/','oman koulun loma-aikoihin')}. ${a('/blogi/perheen-viikko/','Perheen viikon suunnitteluoppaassa')} on esimerkkejä ruoan, ostosten ja yhteisten tehtävien sovittamisesta arkeen.`,
 ]],
 'lukujarjestys':['Sovita viikon tunnit lukukauden rytmiin',[
  `Kun viikon ohjelma vaihtuu, nimeä suunnitelma niin, että tunnistat oikean jakson. Vertaa sitä ${a('/koulujen-lomat/','oman koulun loma-aikoihin')} tai ${a('/yliopistojen-kalenterit/','yliopiston opetusperiodeihin')}. Pidemmän tehtävän välitavoitteet voit koota ${a('/opiskelukalenteri/','opiskelukalenteriin')}, jotta viikon tunnit ja koko opintojakson työmäärä löytyvät omista näkymistään.`,
 ]],
 'hakukalenteri':['Varaa aikaa myös hakemuksen valmisteluun',[
  `Kokoa hakukohteet ja niiden vaatimat tehtävät omaan listaan ennen hakuajan päättymistä. Varaa ${a('/opiskelukalenteri/','opiskelukalenteriin')} aikaa esimerkiksi liitteiden kokoamiseen ja hakemuksen tarkistamiseen. ${a('/paivalaskuri/','Päivälaskurilla')} näet, paljonko valitsemaasi päivään on aikaa; käytä päivämääränä hakukohteen vahvistettua määräpäivää.`,
  `Kun opiskelupaikka on varmistunut, seuraava suunnitelma koskee opintojen alkua. Tutustu ${a('/yliopistojen-kalenterit/','yliopiston julkaistuun lukuvuoteen')} ja rakenna oma viikko ${a('/lukujarjestys/','lukujärjestykseen')}. Muun oppilaitoksen aloitusohjeet tarkistat suoraan siltä oppilaitokselta.`,
 ]],
 'kylvokalenteri':['Tee kasvatussuunnitelmasta oma havaintokalenteri',[
  `Avaa ensin kasvatettavan kasvin ohje: esimerkiksi ${a('/kylvokalenteri/tomaatti/','tomaatin esikasvatus')} ja ${a('/kylvokalenteri/peruna/','perunan istutus')} ovat eri työvaiheita. Kirjaa lajike, toteutunut kylvöpäivä ja ensimmäiset taimet ${a('/oma-arki/','omaan kalenteriisi')}. Näin voit myöhemmin verrata ohjeellista ajankohtaa siihen, mitä omassa kasvupaikassasi tapahtui.`,
  `${a('/blogi/kylvot-suomen-kevaassa/','Suomen kevään kylvöopas')} auttaa suhteuttamaan kuukausiohjeen paikallisiin oloihin. ${a('/paivan-pituus/','Päivän pituuden laskurista')} voit verrata valoisan ajan muutosta, mutta maan lämpö ja hallanvaara tarkistetaan kasvupaikalla erikseen.`,
 ]],
 'kuukausikalenteri':['Valitse ensin vuosi, sitten kuukausi',[
  `Kuukauden päivien paikat vaihtuvat vuosittain. Valitse oikea vuosiluku ennen pohjan lataamista: sama tammikuun malli ei sovi eri vuosille sellaisenaan. Kuukausisivun tulosteet sopivat yhden jakson suunnitteluun, kun taas ${a('/kalenteri/','vuosikalenteri')} auttaa vertaamaan kuukausia rinnakkain.`,
  `Jos haluat mukaan omat menot ja kuvan, käytä ${a('/luo-kalenteri/','oman kalenterin muokkainta')}. ${a('/blogi/oman-kalenterin-suunnittelu/','Oman kalenterin suunnitteluopas')} auttaa valitsemaan kuukausi-, viikko- ja vuosinäkymän välillä. Valmiin tiedoston paperikoko ja suunta kannattaa aina tarkistaa ennen tulostamista.`,
 ]],
 'merkkipaivat':['Mitä merkkipäivän merkintä tarkoittaa?',[
  `Merkkipäivä kertoo muistettavasta aiheesta, henkilöstä tai tapahtumasta. Se ei yksin määritä työstä tai koulusta vapaata päivää. ${a('/juhlapyhat/','Pyhäpäivät ja aatot')} sekä ${a('/liputuspaivat/','liputuspäivät')} on erotettu omiin luetteloihinsa, jotta päivän tarkoitus ei sekoitu vapaan suunnitteluun.`,
  `Valitse vuosi ja tarvittaessa kuukausi. Päivän nimestä pääset sen taustaan ja vuosien 2027–2030 ajankohtiin. ${a(SOURCES.holidays,'Helsingin yliopiston almanakkatoimiston juhlapäivätiedot')} ja ${a('/blogi/liputuspaiva-vai-pyhapaiva/','opas päivän luokituksen lukemiseen')} auttavat tarkistamaan, millaisesta kalenterimerkinnästä on kyse.`,
 ]],
 'pitkat-viikonloput':['Yhtenäinen vapaa ja haettavat lomapäivät erikseen',[
  `Viikonloppuun liittyvä arkipyhä voi pidentää vapaata, mutta väliin jäävät tavalliset työpäivät tarvitsevat erillisen suunnitelman. Vuositaulukon ehdotukset käyttävät maanantaista perjantaihin jatkuvaa työviikkoa. Ne eivät kerro oman työsopimuksesi mukaista lomapäivien kulumista tai vahvistettua työvuoroa.`,
  `${a('/lomasuunnittelija/','Lomasuunnittelijassa')} voit valita omalle vertailullesi lomapäivien määrän ja aattojen käsittelyn. Tarkista perheen menot myös ${a('/koulujen-lomat/','oman paikkakunnan koululomista')}. ${a('/blogi/pitkan-vapaan-suunnittelu/','Pitkän vapaan suunnitteluopas')} auttaa vertaamaan kokonaisen vapaan pituutta niihin päiviin, joille lomaa haetaan.`,
 ]],
 'kellonsiirto':['Kellonaika ja kalenteripäivä ovat eri asioita',[
  `Taulukko näyttää Suomen kesä- ja normaaliajan siirtymät. Keväällä kelloa siirretään tunnilla eteenpäin ja syksyllä tunnilla taaksepäin. Siirtymäyön kulunut aika voi siksi poiketa kellotaulusta luetusta erotuksesta. Kahden päivämäärän välinen ero kalenteripäivinä ei muutu tunnin vuoksi.`,
  `Lue siirtymätunnin esimerkit ${a('/blogi/kesaaika-ja-talviaika/','kesä- ja normaaliajan oppaasta')}. ${a('/tyovuorosuunnittelija/','Työvuorosuunnittelijassa')} on tärkeää käyttää vuoron todellisia päivämääriä ja aikoja. Ajantasainen kansallinen tiedotus löytyy ${a('https://valtioneuvosto.fi/-/1410829/kellot-talviaikaan-ensi-sunnuntaina-25.-lokakuuta-','liikenne- ja viestintäministeriön kellonsiirto-ohjeesta')}; tulevien vuosien sääntöjä on hyvä seurata, jos suunnitelma ulottuu pitkälle.`,
 ]],
 'opiskelukalenteri':['Jaa opintojakso toteutettaviksi päiviksi',[
  `Kirjoita palautukset ja tentit niiden todellisille päiville. Varaa valmistautumiselle oma aika ennen määräpäivää: tiedonhaku, luonnos, harjoittelu ja viimeinen tarkistus ovat eri tehtäviä. ${a('/yliopistojen-kalenterit/','Yliopistojen kalentereista')} voit tarkistaa julkaistut opetusperiodit; kurssin oma ilmoitus ratkaisee silti tentin ja palautuksen ajankohdan.`,
  `Viikon kentät ovat oma suunnitelmasi, eivät oppilaitoksen lukujärjestys. Kun tarvitset toistuvat oppitunnit kellonaikoineen, käytä ${a('/lukujarjestys/','lukujärjestystä')}. ${a('/blogi/opintoperiodit-ja-tentit/','Opintoperiodien ja tenttien suunnitteluopas')} näyttää, miten periodiraja ja oma työmäärä kannattaa erottaa toisistaan.`,
 ]],
 'koulukalenteri':['Oman koulun aikataulu ensin',[
  `Tee viikkoon tilaa oppitunneille, kokeille, tehtäville ja vapaa-ajalle. Merkitse myös lähtöaika, jos koulumatka vaikuttaa päivän muihin menoihin. ${a('/koulujen-lomat/','Koulujen lomat')} tarkistetaan paikkakunnan ja koulumuodon mukaan; yhden kaupungin kalenteria ei pidä käyttää koko Suomen yhteisenä aikatauluna.`,
  `${a(SOURCES.education,'Opetushallitus')} kertoo koulujen työaikojen perusteista. Oman koulun tiedote on tärkeä etenkin poikkeuspäivinä. Perheen yhteiset kuljetukset ja harrastukset voit koota ${a('/perhekalenteri/','perhekalenteriin')}, jotta sama meno ei jää vain yhden henkilön suunnitelmaan.`,
 ]],
 'syntymapaivakalenteri':['Muista päivä myös seuraavana vuonna',[
  `Lisää syntymäpäivän otsikko ja päivämäärä. Vuosittainen toisto säilyttää saman kuukauden ja päivän seuraaville vuosille. Merkitse syntymävuosi vain, jos tarvitset sitä itse; muistamiseen riittävät usein nimi ja päivä. ${a('/nimipaivat/','Nimipäivämuistutus')} on eri tapahtuma, eikä sitä päätellä syntymäpäivästä.`,
  `Merkintä tallentuu omaan selaimeesi. ICS-vienti auttaa siirtämään tapahtumat puhelimen tai muun kalenteriohjelman käyttöön, jossa voit asettaa oman ilmoituksen. ${a('/blogi/kalenterin-varmuuskopio/','Varmuuskopiointiopas')} selittää ICS-tiedoston ja kaikkia paikallisia tietoja säilyttävän JSON-kopion eron.`,
 ]],
 'viikkonumerot':['Viikkovuosi voi vaihtua eri päivänä kuin kalenterivuosi',[
  `ISO-viikko alkaa maanantaina ja päättyy sunnuntaina. Viikko 1 on viikko, johon kuuluu tammikuun neljäs päivä. Esimerkiksi 1.1.2027 kuuluu vuoden 2026 viikkoon 53, ja vuoden 2027 viikko 1 alkaa 4.1.2027. ${a('https://almanakka.helsinki.fi/fi/usein-kysytty%C3%A4','Almanakkatoimiston viikkonumeroinnin ohje')} kertoo säännöstä tarkemmin.`,
  `Kirjoita yhteiseen varaukseen viikon numeron lisäksi päivämäärät. ${a('/viikkokalenteri/','Viikkokalenterissa')} voit suunnitella koko jakson; ${a('/blogi/viikkonumerot/','ISO-viikkojen oppaassa')} on esimerkkejä vuodenvaihteesta ja joka toinen viikko toistuvista menoista.`,
 ]],
 'vuoden-paiva':['Järjestysnumero ja jäljellä olevat päivät',[
  `Vuoden ensimmäinen päivä on numero 1. Tavallisessa vuodessa viimeinen numero on 365 ja karkausvuodessa 366. Järjestysnumero laskee mukaan valitun päivän: 1. tammikuuta on aina vuoden päivä 1, vaikka vuoden alusta laskettu päivämääräerotus olisi nolla.`,
  `Helmikuun lisäpäivä siirtää maaliskuusta alkaen päivän järjestysnumeroa yhdellä. Tarkista tarvittaessa ${a('/karkausvuosi/','onko vuosi karkausvuosi')}. Kahden eri päivämäärän välin saat ${a('/paivamaaralaskuri/','päivämäärälaskurilla')}, jossa voit valita myös laskettavan jakson rajapäivät.`,
 ]],
 'karkausvuosi':['Miksi vuosi 2028 on karkausvuosi mutta 2100 ei?',[
  `Gregoriaanisen kalenterin sääntö tarkastetaan kolmessa osassa. Neljällä jaollinen vuosi on tavallisesti karkausvuosi. Sadalla jaollinen vuosi on poikkeus, mutta neljälläsadalla jaollinen vuosi on jälleen karkausvuosi. Siksi 2000 oli karkausvuosi ja 2100 ei ole. ${a('https://aa.usno.navy.mil/faq/leap_years','Yhdysvaltain laivaston observatorio')} selittää säännön ja sen kalenteritaustan.`,
  `${a('/kalenteri/2028/helmikuu/','Helmikuussa 2028')} on 29 päivää. Jos lisäät kalenterivuoden 29. helmikuuta alkavaan tapahtumaan, seuraavan vuoden päivämäärä ei ratkea pelkällä 365 päivän lisäyksellä. ${a('/blogi/karkausvuosi-2028/','Karkausvuoden oppaassa')} käsitellään tämän vaikutusta suunnitelmiin ja toistuviin päiviin.`,
 ]],
 'paivalaskuri':['Mitä lähtölaskenta laskee?',[
  `Anna tapahtumalle tunnistettava nimi ja valitse sen päivämäärä. Laskenta vertaa valittua päivää Suomen tämän päivän päivämäärään. Se kertoo kalenteripäivien määrän, ei tarkkaa tuntien tai työpäivien määrää. Saman päivän erotus on nolla.`,
  `Kun tarvitset kahden vapaasti valittavan päivän välisen ajan, avaa ${a('/paivamaaralaskuri/','päivämäärälaskuri')}. Jos määräaikaan lasketaan vain oman työviikon päivät, käytä ${a('/tyopaivalaskuri/','työpäivälaskuria')} ja tarkista sen rajapäivä- sekä pyhäpäivävalinnat.`,
 ]],
 'horoskooppimerkki':['Päivämääräraja on karkea lähtökohta',[
  `Tämä laskuri käyttää tavallisia länsimaisen trooppisen horoskoopin päivämäärärajoja. Merkin vaihtumisen lähellä syntymäpäivä yksin ei ratkaise tarkkaa aurinkomerkkiä, sillä vaihtumisen hetki riippuu vuodesta ja kellonajasta. Merkin nimi ei myöskään tarkoita samannimisen tähtikuvion astronomisia rajoja.`,
  `${a('/horoskooppi/#nouseva-merkki','Nousevan merkin laskuri')} tarvitsee lisäksi syntymäajan ja -paikan. ${a('/blogi/nousevan-merkin-syntymaaika/','Syntymäajan tarkkuuden opas')} kertoo epävarmuuden vaikutuksesta. ${a('/horoskooppi/','Päivän horoskoopit')} ovat viihteellisiä tulkintoja, eivät tieteellisiä ennusteita.`,
 ]],
 'kuun-vaiheet':['Päävaihe on hetki, valaistus muuttuu jatkuvasti',[
  `Uusikuu, ensimmäinen neljännes, täysikuu ja viimeinen neljännes ovat Kuun neljä päävaihetta. Taulukko näyttää niiden täsmälliset hetket Suomen ajassa. Neljännes ei tarkoita neljännestä näkyvästä kiekosta: neljännesvaiheessa noin puolet näkyvästä pinnasta on valaistuna. ${a('https://aa.usno.navy.mil/faq/moon_phases','USNO:n Kuun vaiheiden selitys')} havainnollistaa geometriaa.`,
  `${a('/kuukalenteri/','Päivittäinen kuukalenteri')} näyttää valaistuksen myös päävaiheiden välillä. Tarkista erikseen ${a('/kuun-nousu-ja-lasku/','paikalliset Kuun nousu- ja laskuajat')}, sillä vaihe ei kerro, onko Kuu juuri silloin havaintopaikan horisontin yläpuolella.`,
 ]],
 'taysikuu':['Täysikuun päivämäärä ja havaintoilta',[
  `Täysikuu tarkoittaa laskettua hetkeä, jolloin Kuun ja Auringon suuntien ero on 180 astetta Maasta katsottuna. Kuu näyttää silmälle lähes täydeltä myös hetkeä ympäröivinä öinä. Taulukon kellonaika on Suomen aikaa ja huomioi kesäajan. ${a('https://aa.usno.navy.mil/faq/moon_phases','USNO:n vaiheopas')} selittää täysikuun ja muiden vaiheiden eron.`,
  `Valitse kuvausilta ${a('/kuukalenteri/','kuukalenterista')} ja vertaa sitä ${a('/kuun-nousu-ja-lasku/','Kuun nousu- ja laskuaikoihin')}. Pilvisyys, maasto ja rakennukset voivat estää havainnon, vaikka täysikuu osuu samalle päivälle.`,
 ]],
 'uusikuu':['Uusikuu ei tavallisesti näy kirkkaana kiekkona',[
  `Uusikuun aikaan Kuu on suunnilleen Auringon suunnassa ja sen valaistu puoli on pääosin poispäin Maasta. Taulukon hetki kuvaa vaihetta, ei lupausta näkyvästä kuunsirpistä. Ensimmäisen sirpin havaittavuuteen vaikuttavat muun muassa Kuun korkeus, Auringon läheisyys ja sää. ${a('https://aa.usno.navy.mil/faq/moon_phases','USNO:n Kuun vaiheiden kuvaus')} auttaa tulkitsemaan tilannetta.`,
  `Seuraa sirpin kasvua ${a('/kuukalenteri/','päivittäisessä kuukalenterissa')}. Havaintoillan ajoittamiseen tarvitset myös ${a('/auringonnousu-ja-lasku/','Auringon laskuajan')} sekä ${a('/kuun-nousu-ja-lasku/','Kuun paikalliset ajat')}. Pelkkä uusikuun päivämäärä ei määritä sopivaa kuvaushetkeä.`,
 ]],
 'luo-kalenteri':['Pohjasta valmiiksi kalenteriksi',[
  `Valitse ensin kuukausi, vuosi, viikko tai tyhjä pohja. Tarkista sitten vuosi, paperikoko ja suunta Aika ja asettelu -kohdasta. Lisää otsikko ja omat tapahtumat vasta tähän rakenteeseen. Kun napsautat päivää esikatselussa, voit merkitä tapahtuman juuri oikealle päivämäärälle. Symbolit ja erilliset kuvat ovat siirrettäviä koristeita; ne eivät itsessään luo kalenteritapahtumaa.`,
  `Koko kuva -sovitus säilyttää valokuvan kokonaan. Täytä alue voi rajata kuvan reunoja, joten tarkista tärkeiden yksityiskohtien näkyminen esikatselusta. PDF sopii valmiin asettelun tulostamiseen ja JPG tai PNG kuvan jatkokäyttöön. Tallenna lisäksi projekti, jos haluat jatkaa muokkaamista myöhemmin. Pelkkä PDF ei säilytä muokkaimen asetuksia. ${a('/blogi/oman-kalenterin-suunnittelu/','Kalenterin suunnitteluoppaassa')} on lisää vinkkejä rakenteen ja kuvan yhdistämiseen.`,
 ]],
 'tyhja-kalenteri':['Ajaton pohja vai päivätty suunnitelma?',[
  `Tyhjä pohja sopii toistuvaan viikkorytmiin tai käsin täytettävään suunnitelmaan. Siinä ei ole valmiita päivämääriä. Jos tarvitset oikean kuukauden viikonpäivät ja Suomen pyhät, vaihda näkymäksi Kuukausi tai avaa ${a('/kuukausikalenteri/','päivätty kuukausikalenteri')}. Tyhjää viiden viikon ruudukkoa ei pidä tulkita minkään tietyn kuukauden kalenteriksi.`,
  `Kokeile muistiinpanoaluetta ja kirjoita lyhyt otsikko, joka kertoo pohjan käyttötarkoituksen. Vapaa sivu sopii esimerkiksi yhteisen viikon tavoitteille, ruokalistalle tai projektin vaiheille. Tarkista paperin suunta ennen PDF-latausta ja tallenna projekti erikseen, jos aiot muuttaa samaa pohjaa myöhemmin. ${a('/luo-kalenteri/','Kalenterin muokkaimessa')} voit myös lisätä kuvan, symbolin tai oman tekstin.`,
 ]],
 'paivasuunnittelija':['Jaa tehtävä ajaksi kalenterissa',[
  `Valitse suunniteltava päivä ennen kirjoittamista. Kirjaa sovitut tapaamiset ensin ja varaa tehtäville realistinen aika niiden väliin. Yhden kentän merkintä voi olla esimerkiksi ”10.00: valmistele huomisen tapaaminen”. Muista myös siirtymät ja tauot. Edellinen päivä ja Seuraava päivä vaihtavat päivämäärää; eri päivien tekstit säilyvät erillisinä tässä selaimessa.`,
  `Tulosta / PDF avaa tämän suunnitelman tulostusnäkymän. Kenttiin kirjoittaminen ei kuitenkaan luo hälytyksiä tai siirrä tekstiä puhelimesi kalenteriin. Kun tarvitset tapahtumalle kellonajan ja siirrettävän kalenterimerkinnän, lisää se ${a('/oma-arki/','Oman arjen tapahtumiin')}. Laajemman viikon tavoitteet voit koota ${a('/viikkokalenteri/','viikkosuunnitelmaan')}.`,
 ]],
 'kuun-nousu-ja-lasku':['Milloin Kuu on omalla taivaallasi?',[
  `Valitse havaintopaikka ja päivämäärä. Nousu kertoo, milloin Kuu tulee laskennallisen horisontin yläpuolelle, ja lasku, milloin se painuu sen alle. Yläkulminaatio tarkoittaa Kuun meridiaanin ylitystä, ei Kuun vaihetta tai täysikuun hetkeä. Simulaation aikasäätimellä voit verrata Kuun suuntaa ja korkeutta eri kellonaikoina.`,
  `Pelkkä tyhjä nousu- tai laskuaika ei tarkoita virhettä: kyseinen tapahtuma voi jäädä paikallisen vuorokauden ulkopuolelle. Kuun vaihetta varten avaa ${a('/kuukalenteri/','päivittäinen kuukalenteri')}. Havaintopaikan puut, rakennukset ja sää voivat peittää laskennallisesti horisontin yläpuolella olevan Kuun. ${a('https://aa.usno.navy.mil/faq/RST_defs','USNO:n nousu- ja laskuaikojen määritelmät')} selittävät, mitä horisonttirajalla tarkoitetaan.`,
 ]],
 'tahtitieteellinen-kalenteri':['Etsi ajankohta ja tarkista paikallinen näkyvyys',[
  `Aloita kysymyksestä, jonka haluat selvittää. Kuun vaiheet kertovat valaistuksen rytmistä, nousu- ja laskuajat havaintopaikan taivaasta ja vuodenajat Maan vuotuisesta kierrosta. Saman ilmiön valtakunnallinen päivämäärä ei aina kerro, voiko sen nähdä omalta paikkakunnalta. Valitse paikallisessa laskurissa kaupunki ennen havaintoillan sopimista.`,
  `Vertaa ${a('/kuun-nousu-ja-lasku/','Kuun paikallista korkeutta ja aikoja')} sekä ${a('/auringonnousu-ja-lasku/','Auringon laskua ja hämärää')}. Tarkista lisäksi sää ja avoin näkymä havaintopaikalla. ${a('https://www.ursa.fi/taivaalla.html','Ursan Taivaalla-palvelu')} auttaa tutustumaan ajankohtaisiin ilmiöihin. Kalenterin havainnekuvat helpottavat suunnittelua, mutta ne eivät ole reaaliaikaisia havaintoja.`,
 ]],
 'auringonpimennys':['Näkyvyys koskee taulukon havaintopaikkaa',[
  `Taulukon ajat ja huippukorkeus on laskettu Helsingille. Huippu tarkoittaa pimennyksen suurinta vaihetta kyseisestä havaintopaikasta katsottuna. Positiivinen korkeus kertoo Auringon olevan silloin laskennallisen horisontin yläpuolella; se ei takaa pilvetöntä tai esteetöntä näkymää. Toisen paikkakunnan tarkat olosuhteet on tarkistettava erikseen.`,
  `Tutustu ${a('https://science.nasa.gov/eclipses/safety/','NASA:n pimennyksen turvallisen katselun ohjeeseen')} ennen havaintoa. Tavalliset aurinkolasit eivät riitä suojaksi. Myös kameran, kiikarin tai kaukoputken käyttö edellyttää tarkoitukseen sopivaa aurinkosuodatusta laitteen etupuolella. ${a('/auringonnousu-ja-lasku/','Auringon kulun laskuri')} auttaa hahmottamaan suuntaa, mutta se ei varmista havaintovälineen turvallisuutta.`,
 ]],
 'kuunpimennys':['Pimennyksen tyyppi ja Kuun korkeus yhdessä',[
  `Täydellinen, osittainen ja puolivarjopimennys kuvaavat sitä, miten Kuu kulkee Maan varjon läpi. Taulukko näyttää Helsingistä horisontin yläpuolelle osuvat huippuhetket Suomen ajassa. Havainto voi jäädä matalalle, joten tarkista sarake Korkeus huipulla ennen havaintopaikan valintaa.`,
  `Katso samalle päivälle ${a('/kuun-nousu-ja-lasku/','Kuun nousu ja lasku omalla paikkakunnallasi')}. Pimennyksen huippuhetki ja havaittavan vaiheen alku eivät ole sama kellonaika. Pilvisyys ja lähellä oleva maasto voivat rajoittaa näkymää. ${a('https://science.nasa.gov/moon/eclipses/','NASA:n kuunpimennysten opas')} selittää pimennysten eri vaiheet ja varjon muodostumisen.`,
 ]],
 'perseidit':['Suunnittele havaintoilta valon mukaan',[
  `Perseidien katselussa tarvitset laajan näkymän taivaalle, et yhtä tarkkaa katselusuuntaa. Valitse turvallinen paikka etäällä kirkkaista valoista ja varaa aikaa paikalla olemiseen. Pohjoisen kesäyön valoisuus ja Kuun valaistus voivat heikentää himmeiden meteorien erottumista, vaikka meteoriparvi olisi aktiivinen.`,
  `Vertaa havaintopäivän ${a('/auringonnousu-ja-lasku/','hämärän ja Auringon ajat')} sekä ${a('/kuukalenteri/','Kuun vaihe')}. Tarkista vuoden huippua koskeva ennuste ${a('https://www.ursa.fi/taivaalla.html','Ursan ajankohtaisista havaintotiedoista')}; tämän sivun yleinen havaintovinkki ei ole lupaus tietystä meteorimäärästä. Kirjaa oma havaintoilta ja sää ${a('/paivasuunnittelija/','päiväsuunnitelmaan')}, jos haluat palata kokemukseen myöhemmin.`,
 ]],
 'nimipaivat':['Tarkista nimi ennen muistutuksen tallentamista',[
  `Suomen- ja ruotsinkieliset nimipäiväkalenterit ovat eri luetteloita. Avaa nimipäiväkalenteri ja tarkista juuri haluamasi nimen kirjoitusasu, kieli ja päivämäärä. Samankaltaista nimeä ei kannata korvata toisella nimellä tai päätellä juhlapäivää syntymäpäivästä.`,
  `Kun oikea päivä on tiedossa, lisää oma muistutus. Vuosittainen toisto sopii saman kuukauden ja päivän muistamiseen. Selaimeen tallennettu tapahtuma ei itsessään anna puhelimen ilmoitusta: vie tapahtuma ICS-tiedostona omaan kalenterisovellukseesi ja aseta ilmoitus siellä. ${a('/syntymapaivakalenteri/','Syntymäpäiväkalenteri')} on erillinen näkymä läheisten syntymäpäiville.`,
 ]],
 'ylioppilaskirjoitukset':['Koepäivä on yksi osa valmistautumista',[
  `Tarkista ensin tutkintokerta ja oppiaine. Koepäivä, ilmoittautumisen määräaika ja tulosten julkaisu ovat eri tapahtumia. Noudata oman lukiosi käytännön ohjeita saapumisesta ja valmisteluista sekä Ylioppilastutkintolautakunnan ajantasaista koekohtaista ohjetta. Kalenterimerkintä ei ilmoita sinua kokeeseen.`,
  `Varaa lukemiselle pienempiä jaksoja ennen varsinaista koepäivää ${a('/opiskelukalenteri/','opiskelukalenterissa')}. Jos haet jatko-opintoihin, tarkista myös ${a('/hakukalenteri/','hakukalenterin erilliset määräajat')}: kokeen suorittaminen tai arvosanan valmistuminen ei lähetä hakemusta. Tulostettava suunnitelma auttaa yhdistämään oman valmistautumisen ja viralliset koepäivät.`,
 ]],
};
export function toolGuide(base){
 const record=guides[base];return record?`<section class="period-guide panel" data-editorial-skip><h2>${record[0]}</h2>${record[1].map(p=>'<p>'+p+'</p>').join('')}</section>`:'';
}
