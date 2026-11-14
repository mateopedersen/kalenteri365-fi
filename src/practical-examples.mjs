import {editorialAnchor as a} from './editorial-links.mjs';
import {esc} from './ui.mjs';

// These examples explain actual controls and results. Period-specific guidance
// belongs to period-guide.mjs, so a generic example is never copied to every year.
export const PRACTICAL_EXAMPLES = {
  kalenteri: ['Vuosikalenteri vai yhden kuukauden suunnitelma?', [
    'Jos suunnittelet koko vuoden projektia, avaa vuosinäkymä ja etsi ensin aloitus- sekä päättymiskuukausi. Siirry sitten kyseisen kuukauden sivulle tarkistamaan viikonpäivät. Näin pitkä ajanjakso ja yksittäinen tapaaminen eivät sekoitu samaan tarkkuustasoon.',
    `Sovittu päivämäärä kannattaa siirtää ${a('/oma-arki/','oman arjen kalenteriin')} kellonaikoineen. Vuosiruudukko auttaa löytämään päivän, mutta se ei vielä luo henkilökohtaista tapahtumaa. Jos tarvitset seinälle koko vuoden, valitse ${a('/pdf-kalenteri/','tulostettava vuosikalenteri')}.`,
  ]],
  'pdf-kalenteri': ['Tarkista tiedosto ennen koko erän tulostamista', [
    'Valitse ensin oikea vuosi ja kuukausi, sitten arkin suunta. Avaa yhden mallin esikatselu ja tarkista, jääkö kirjoittamiselle riittävästi tilaa. Värillinen seinäkalenteri ja mustavalkoinen työpöytäpohja voivat palvella eri tarkoituksia, vaikka päivämäärät ovat samat.',
    `Lataa lopullinen PDF tai kuva esikatselun sijasta. Tulosta aluksi yksi arkki ja tarkista reunat sekä tekstin luettavuus. ${a('/blogi/kalenterin-tulostus/','Tulostusoppaassa')} selitetään sovituksen ja todellisen koon ero. Omien tapahtumien lisäämiseen sopii ${a('/luo-kalenteri/','kalenterin luontityökalu')}.`,
  ]],
  kuukausikalenteri: ['Kuukausipohja yhteen selkeään tarkoitukseen', [
    'Kuukausikalenteri sopii esimerkiksi kuukauden menoihin, projektin välitavoitteisiin tai yhteisiin varauksiin. Päätä ensin, mitä haluat nähdä yhdellä silmäyksellä. Lyhyt otsikko ja muutama tärkeä merkintä pysyvät luettavampina kuin koko tehtävälistan mahduttaminen jokaiseen päivään.',
    `Tarkista vuosiluku ennen lataamista, sillä sama kuukausi alkaa eri vuosina eri viikonpäivänä. Jos tarvitset tuntikohtaisen suunnitelman, jatka ${a('/paivasuunnittelija/','päiväsuunnittelijaan')}. Useita kuukausia koskevan kokonaisuuden näet helpommin ${a('/kalenteri/','vuosikalenterissa')}.`,
  ]],
  viikkokalenteri: ['Suunnittele ensin kiinteät menot', [
    'Kirjoita viikkopohjaan ensin sovitut tapaamiset, opetustunnit ja muut menot, joiden aikaa et voi siirtää. Lisää vasta niiden väliin itsenäiset tehtävät. Esimerkiksi keskiviikon palautukselle voi varata maanantaina luonnoksen ja tiistaina tarkistuksen, jolloin määräpäivä ei jää ainoaksi merkinnäksi.',
    `Anna merkinnälle toiminnallinen nimi, kuten ”tarkista esitys”, ja jätä varaa siirtymille. ${a('/opiskelukalenteri/','Opiskelukalenteri')} erottaa palautukset muista menoista. ${a('/viikkonumerot/','Viikkonumerolaskurilla')} voit varmistaa oikean viikon, jos kutsussa mainitaan vain viikon numero.`,
  ]],
  'tyhja-kalenteri': ['Tee uudelleen käytettävä pohja', [
    'Päiväämätön pohja sopii esimerkiksi viikoittaiseen ruokalistaan, harjoittelun seurantaan tai toistuviin kotitöihin. Käytä otsikoita, jotka kertovat suoraan mitä kuhunkin kohtaan kirjoitetaan. Jätä tyhjiin kenttiin riittävästi tilaa, jos täytät kalenterin myöhemmin käsin.',
    `Tallenna muokattava projekti ennen seuraavan version tekemistä. Ladattu kuva tai PDF säilyttää valmiin ulkoasun, mutta ei korvaa projektitiedostoa. Jos haluat tarkat päivämäärät ja pyhät valmiiksi, valitse ${a('/luo-kalenteri/','luontityökalussa')} päivätty näkymä.`,
  ]],
  'luo-kalenteri': ['Oma kuva ja tapahtumat samaan kalenteriin', [
    'Aloita valmiista pohjasta ja valitse oikea ajanjakso ennen koristelua. Kuukausimalli sopii tapaamisiin, vuosimalli pitkään aikaväliin ja viikkomalli arjen toistuvaan rytmiin. Lisää ensin tärkeimmät päivät ja otsikko. Sovita kuva tämän jälkeen niin, etteivät kasvot tai muut olennaiset yksityiskohdat leikkaudu pois.',
    'Tarkista esikatselusta myös pisin tapahtumanimi ja viimeinen kalenteririvi. PDF on valmis tulostettava asettelu; PNG ja JPG ovat kuvia, ja Word- sekä Excel-tiedostot sopivat jatkokäsittelyyn omissa ohjelmissaan. Säilytä lisäksi projektitiedosto, jotta voit palata samaan kuvaan, teksteihin ja asetuksiin.',
  ]],
  juhlapyhat: ['Mitä kannattaa tarkistaa ennen vapaan sopimista?', [
    'Etsi juhlan nimi ja avaa sen oma sivu. Tarkista vuosi, päivämäärä ja viikonpäivä yhdessä. Pääsiäisen kaltaiset liikkuvat juhlat eivät pysy samassa kohdassa vuodesta toiseen. Aatto, yleinen pyhäpäivä ja muu merkkipäivä on siksi hyvä lukea eri merkintöinä.',
    `Jos suunnittelet matkaa, vertaa päivää ${a('/koulujen-lomat/','oman koulun loma-aikoihin')} ja omiin työvuoroihin. ${a('/pitkat-viikonloput/','Pitkien viikonloppujen vertailu')} auttaa hahmottamaan yhtenäisen vapaan. Päivän tallentaminen kalenteriin on muistutus, ei vahvistus työstä tai koulusta vapaalle.`,
  ]],
  liputuspaivat: ['Liputusaika ja päivän merkitys erikseen', [
    'Liputuspäivän nimi kertoo, mitä tai ketä päivänä muistetaan. Nosto- ja laskuaika vastaavat toiseen kysymykseen: milloin lippu pidetään salossa valitussa paikassa. Tarkista molemmat, jos vastaat esimerkiksi taloyhtiön tai yhdistyksen liputuksesta.',
    `Kalenteriin voi merkitä itse päivän ja erillisen käytännön tehtävän. Päivän luokitus ei yksin tarkoita vapaapäivää. ${a('/merkkipaivat/','Merkkipäivien hakemistosta')} löydät päivän taustan, ja ${a('/kausimuistutukset/','omista muistutuksista')} voit tehdä tehtävän lipun ja välineiden tarkistamiseen.`,
  ]],
  merkkipaivat: ['Löydä sekä ajankohta että syy muistaa päivä', [
    'Merkkipäivän sivu auttaa, kun haluat tietää muutakin kuin päivämäärän. Avaa päivän nimi ja lue sen tausta ennen oman ohjelman suunnittelua. Kulttuurinen juhla, henkilön muistopäivä ja yleinen pyhä eivät kuvaa samaa asiaa, vaikka ne näkyisivät samassa kuukausikoosteessa.',
    `Valitse oma vuosiluku erityisesti liikkuvan juhlan kohdalla. Voit tallentaa kiinnostavan päivän muistutukseksi tai tarkistaa sen paikan ${a('/kuukausikalenteri/','kuukausikalenterista')}. Työstä vapaan suunnittelua varten käytä lisäksi ${a('/juhlapyhat/','pyhäpäivien luetteloa')}.`,
  ]],
  'koulujen-lomat': ['Kun perheen jäsenillä on eri koulukalenterit', [
    'Valitse jokaiselle oppilaalle oikea paikkakunta, koulumuoto ja lukuvuosi. Samanniminen talviloma ei välttämättä osu kaikilla samaan viikkoon. Korkeakoulun periodit puolestaan kuvaavat opetuksen jaksoja, eivät perusopetuksen lomaluetteloa.',
    `Vertaa vahvistettuja päivämääriä ennen yhteisen matkan tai hoitojärjestelyn sopimista. ${a('/perhekalenteri/','Perhekalenteriin')} voit merkitä erikseen kunkin lapsen loman ja yhteiset menot. Koulun ilmoittama yksittäinen työpäivän muutos tarkistetaan omasta koulusta, vaikka kunnan yleinen lukuvuosikalenteri olisi jo julkaistu.`,
  ]],
  koulukalenteri: ['Kokeelle myös valmistautumispäivät', [
    'Pelkkä koepäivän merkitseminen kertoo, milloin koe on, mutta ei sitä, milloin siihen luetaan. Lisää ennen koetta pienempiä tehtäviä: kertaa yksi aihe, tee harjoitukset ja tarkista vaikeat kohdat. Näin saman viikon muut koulutehtävät ja harrastukset näkyvät ajoissa.',
    `Pidä koulun ilmoittamat ajat erillään itse varaamastasi opiskeluajasta. ${a('/lukujarjestys/','Lukujärjestykseen')} sopivat toistuvat tunnit ja tilat. ${a('/koulujen-lomat/','Paikallisesta lomakalenterista')} näet julkaistut opetustauot; ne eivät korvaa opettajan tehtävä- tai koeohjeita.`,
  ]],
  lukujarjestys: ['Oppitunnin nimi ei aina riitä', [
    'Kirjoita tunnin yhteyteen myös tila tai etäyhteyden tunniste, jos se auttaa löytämään oikeaan paikkaan. Erota itse opetusaika matkaan ja valmisteluun tarvitsemastasi ajasta. Viikkoon voi merkitä myös harrastukset, jotta peräkkäisten menojen väliin jää todellinen siirtymä.',
    `Kun jakso vaihtuu, tarkista viikon aloituspäivä ja käy kaikki toistuvat tunnit läpi. Tuloste on kopio senhetkisestä suunnitelmasta, joten myöhempi muutos pitää tehdä myös yhteiseen paperiversioon. Tentit ja pitkien tehtävien palautukset voi koota ${a('/opiskelukalenteri/','opiskelukalenteriin')}.`,
  ]],
  'yliopistojen-kalenterit': ['Lukuvuosi ja kurssin toteutus täydentävät toisiaan', [
    'Etsi ensin oma yliopisto ja valitse lukuvuosi, joka kattaa tarvitsemasi syksyn ja kevään. Lue periodien yhteydessä olevat huomautukset. Tentti- tai intensiiviviikko voi sisältää opiskelua, vaikka tavallinen luento-ohjelma olisi tauolla.',
    `Lisää yleisen lukuvuoden rinnalle kurssin omat luennot, tentit ja palautukset. ${a('/opiskelukalenteri/','Opiskelukalenteri')} sopii määräaikojen kokoamiseen, kun taas ${a('/lukujarjestys/','lukujärjestys')} näyttää viikon tunnit. Jos lähteessä ei ole julkaistu yhteistä lomaa, periodien väliä ei pidä tulkita vahvistetuksi vapaaksi.`,
  ]],
  ylioppilaskirjoitukset: ['Yksi muistutus koepäivälle, toinen valmistautumiselle', [
    'Valitse oikea tutkintokerta ja tarkista jokainen kirjoittamasi aine erikseen. Tallenna koepäivä, mutta varaa myös aikaa lukion ilmoittamiin valmisteluihin. Saapumisohje, ilmoittautumisen määräaika ja varsinainen koe ovat eri asioita, eikä kalenterivienti hoida ilmoittautumista.',
    `Tee valmistautumisesta useampi vaihe ${a('/opiskelukalenteri/','opiskelukalenteriin')}: harjoituskokeet, kertaaminen ja välineiden tarkistus ennen koepäivää. Jos haet jatko-opintoihin, vertaa erikseen ${a('/hakukalenteri/','hakuaikoja')}. Tutkinnon tulosten valmistuminen ei korvaa hakemuksen jättämistä tai paikan vastaanottoa.`,
  ]],
  opiskelukalenteri: ['Palautuspäivästä omaan työjärjestykseen', [
    'Valitse suunniteltava viikko ja merkitse ensin tentit sekä palautukset. Jaa sen jälkeen suuret tehtävät pieniin, nimettyihin työvaiheisiin. ”Etsi kolme lähdettä” tai ”tarkista laskutehtävät” kertoo seuraavan tekemisen paremmin kuin pelkkä kurssin nimi.',
    `Vertaa suunnitelmaa kurssin todellisiin määräaikoihin ja ${a('/yliopistojen-kalenterit/','yliopiston periodikalenteriin')}. Yleinen periodiraja ei siirrä kurssin palautusta automaattisesti. Tarkka kellonaika ja kalenterisovelluksen muistutus kannattaa tallentaa erilliseksi tapahtumaksi ${a('/oma-arki/','omaan kalenteriin')}.`,
  ]],
  tyopaivat: ['Miksi kuukausissa voi olla eri määrä työtunteja?', [
    'Sama päivittäinen työaika tuottaa eri kuukausina eri tuntisumman, koska viikonpäivien paikat ja arkipyhät vaihtelevat. Vertaa taulukosta ensin työpäiviä ja vasta sitten tunteja. Tuntisumma on laskennallinen: kuukausipalkka tai toteutunut työaika ei määräydy tästä taulukosta.',
    `Jos teet muuta kuin taulukon oletuksen mukaista viikkoa, avaa ${a('/tyopaivalaskuri/','työpäivälaskuri')} ja valitse omat viikonpäiväsi sekä poissaolot. Vaihtuvia vuoroja varten sopii ${a('/tyovuorosuunnittelija/','työvuorosuunnittelija')}. Pidä omat asetukset samoina, kun vertailet kahta ajanjaksoa.`,
  ]],
  tyopaivalaskuri: ['Vertaa kahta jaksoa samoilla asetuksilla', [
    'Kun vertailet esimerkiksi kahta työkuukautta, käytä molemmissa samaa työviikkoa, päivittäistä tuntimäärää ja aattojen käsittelyä. Muuten tulosten ero voi johtua asetuksista eikä kalenterista. Tarkista myös, ovatko jakson ensimmäinen ja viimeinen päivä mukana.',
    `Lisää omat poissaolot vasta laskentamallin valinnan jälkeen. Tarkastele päivien määrää ja tuntisummaa erillisinä tuloksina. Vuosilomasaldon kuluminen on eri kysymys kuin poissaolo säännöllisiltä työpäiviltä; oman sopimuksen mukainen laskenta tarkistetaan työnantajalta. Yleiset kuukausiluvut löytyvät ${a('/tyopaivat/','työpäivätaulukoista')}.`,
  ]],
  paivamaaralaskuri: ['Miksi samalle välille voi saada kaksi eri lukua?', [
    'Esimerkiksi 1.–3.1.2027 sisältää kolme päivämäärää, mutta ensimmäisestä päivästä viimeiseen on kaksi päivää. Molemmat vastaukset voivat olla oikein eri kysymykseen. Valitse siksi alku- ja loppupäivän sisällyttäminen ennen kuin käytät lukua varauksessa tai suunnitelmassa.',
    `Kun lisäät aikaa, tarkista lisäksi yksikkö: kalenterikuukausi ei ole sama asia kuin 30 päivää. Tarkkaile laskurin huomautusta, jos lähtöpäivän numeroa ei ole kohdekuukaudessa. ${a('/tyopaivalaskuri/','Työpäivälaskuri')} soveltuu oman työviikon päiviin, ja ${a('/paivalaskuri/','lähtölaskenta')} näyttää aikaa nykyhetkestä tapahtumaan.`,
  ]],
  paivalaskuri: ['Määräpäivä tarvitsee myös kellonajan', [
    'Nimeä tapahtuma niin, että tiedät mitä laskenta odottaa. Jos kyse on esimerkiksi junan lähdöstä tai hakemuksen määräajasta, käytä vahvistettua päivämäärää ja kellonaikaa. Samalle päivälle asetettu keskiyö ja iltapäivän lähtö ovat eri tavoitehetkiä.',
    `Laskurin päivät ovat jäljellä olevia täysiä 24 tunnin jaksoja. Kalenterissa laskettava päivämäärien erotus voi siksi näyttää eri lukua. Suomen kellonsiirtokin vaikuttaa kuluneisiin tunteihin. Vertaa tarvittaessa ${a('/paivamaaralaskuri/','päivämäärien väliä')} ja lisää oikea tapahtuma ${a('/oma-arki/','omaan kalenteriisi')}.`,
  ]],
  viikkonumerot: ['Tarkista vuodenvaihteen viikko molemmista suunnista', [
    'Kokeile päivämäärää 1.1.2027. Tulos on vuoden 2026 viikko 53, jonka maanantai on 28.12.2026 ja sunnuntai 3.1.2027. Päivämäärän vuosiluku ja ISO-viikon vuosiluku kuvaavat tässä eri asioita, eikä kalenterissa ole ylimääräistä viikkoa.',
    `Jos tiedät vain viikon numeron, avaa käänteinen haku ja anna myös viikkovuosi. Tarkista tuloksesta koko maanantain ja sunnuntain väli ennen varaamista. Valmiit päiväkohtaiset kentät löydät ${a('/viikkokalenteri/','viikkosuunnitelmasta')}.`,
  ]],
  'vuoden-paiva': ['Monesko päivä on 1. maaliskuuta?', [
    'Tavallisena vuonna 1. maaliskuuta on vuoden 60. päivä, mutta karkausvuonna se on 61. päivä. Ero syntyy helmikuun lisäpäivästä. Sama kuukauden ja päivän numero ei siten aina tarkoita samaa järjestysnumeroa.',
    `Käänteisessä haussa voit antaa vuosiluvun ja järjestysnumeron saadaksesi päivämäärän. Tarkista tuloksen yhteydessä, lasketaanko valittu päivä mukaan vuoden edistymiseen. ${a('/karkausvuosi/','Karkausvuosilaskuri')} selittää vuoden pituuden, ja ${a('/paivamaaralaskuri/','päivämäärälaskuri')} auttaa vertaamaan kahta rajapäivää.`,
  ]],
  karkausvuosi: ['Vertaa vuosia 2028 ja 2100', [
    'Vuosi 2028 on jaollinen neljällä eikä ole tasasatavuosi, joten helmikuussa on 29 päivää. Vuosi 2100 on jaollinen sadalla mutta ei neljälläsadalla, joten se on tavallinen vuosi. Laskurin sääntövaiheet näyttävät eron ennen seuraavan karkausvuoden valintaa.',
    `Lisäpäivä vaikuttaa maaliskuusta alkaen ${a('/vuoden-paiva/','päivän järjestysnumeroon')}. Toistuvan 29. helmikuuta olevan syntymäpäivän kohdalla pitää erikseen päättää, miten se muistetaan tavallisena vuonna. ${a('/syntymapaivakalenteri/','Syntymäpäiväkalenterissa')} tämä ei jää pelkän päivälaskun varaan.`,
  ]],
  lomasuunnittelija: ['Koko vapaa ja haettavat päivät eri riveille', [
    'Vertaa ehdotuksesta kahta lukua: koko vapaan pituutta ja niitä työpäiviä, joille tarvitset poissaolon. Viikonloppu tai oman työviikkosi ulkopuolinen päivä voi pidentää yhtenäistä vapaata kasvattamatta haettavien työpäivien määrää.',
    `Käy päivämääräluettelo läpi ennen kalenteriin vientiä ja varmista loman hyväksyntä erikseen. Jos perheessä on koululaisia, vertaa jaksoa ${a('/koulujen-lomat/','paikallisiin koululomiin')}. Muuttuvat työvuorot tarvitsevat ${a('/tyovuorosuunnittelija/','vuorokohtaisen tarkistuksen')}; säännöllinen työviikko ei kuvaa niitä automaattisesti.`,
  ]],
  'pitkat-viikonloput': ['Sopiva viikonloppu löytyy päivämääristä', [
    'Pitkä viikonloppu voi tarkoittaa valmista kolmen päivän vapaata tai jaksoa, joka tarvitsee väliin yhden tai useamman haettavan työpäivän. Katso ehdotuksen päivämäärät ja vapaan alku sekä loppu yhdessä. Pelkkä juhlan nimi ei kerro koko jaksoa.',
    `Vertaa vaihtoehtoja samalla työviikolla ja tarkista aattojen asema omassa työssäsi. Jos haluat enemmän vaikutusmahdollisuuksia jakson pituuteen, jatka ${a('/lomasuunnittelija/','lomasuunnittelijaan')}. Koko vuoden yleiset pyhät löytyvät ${a('/juhlapyhat/','juhlapäivien kalenterista')}.`,
  ]],
  tyovuorosuunnittelija: ['Kierron aloituspäivä ankkuroi koko kuukauden', [
    'Kahden työpäivän ja kahden vapaan kierrossa ensimmäinen päivä tarkoittaa juuri kierron ensimmäistä työpäivää. Jos ankkuri siirtyy yhdellä päivällä, koko tuleva vuororytmi siirtyy mukana. Tarkista siksi ensin tunnettu toteutunut päivä ja vertaa sitä kalenterin tulokseen.',
    `Tee yksittäinen vuoronvaihto päivän poikkeuksena, jos peruskierto jatkuu muuten ennallaan. Tarkista yövuorossa myös päättymispäivä ja palkaton tauko. ${a('/tyopaivalaskuri/','Työpäivälaskurin')} tavallinen viikkorytmi ei korvaa tätä kiertoa. Kalenterivienti auttaa muistamaan suunnitelman, mutta työnantajan vahvistama luettelo ratkaisee sovitut vuorot.`,
  ]],
  perhekalenteri: ['Yhteinen meno tarvitsee yhteisen lähtöajan', [
    'Jos harrastus alkaa kello 18, kalenteriin voi olla hyödyllisempää kirjoittaa myös kello 17.30 oleva lähtö. Valitse henkilö tai yhteinen merkintä sen mukaan, ketä meno koskee. Näin sama tapahtuma ei näytä virheellisesti koko perheen vapaalta ajalta.',
    `Sovita illan ruoka menojen ympärille ja kokoa tarvikkeet viikon ostoslistaan. Tarkista vielä eri koulujen lomat sekä työvuorot. Selaimessa tehty muutos ei ilmesty automaattisesti muiden puhelimiin; jaa valmis viikko tai siirrä tapahtumat yhteiseen kalenterisovellukseen. ${a('/blogi/perheen-viikko/','Perheen viikon opas')} antaa lisää suunnitteluesimerkkejä.`,
  ]],
  paivasuunnittelija: ['Kolme tärkeää tehtävää ennen pitkää listaa', [
    'Valitse päivälle muutama tehtävä, joiden valmistuminen auttaisi eniten. Aseta ne todellisiin vapaisiin kohtiin sovittujen menojen väliin. Suuri tehtävä kannattaa nimetä seuraavan työvaiheen mukaan, esimerkiksi ”kirjoita johdannon luonnos”, jotta tiedät mistä aloittaa.',
    `Jätä myös tauot ja siirtymät näkyviin. Päiväsuunnitelman tekstikenttä ei itsessään anna hälytystä; kellonaikaan sidotun muistutuksen voit tehdä ${a('/oma-arki/','kalenteritapahtumana')}. Viikon kokonaisuutta varten avaa ${a('/viikkokalenteri/','viikkosuunnitelma')}.`,
  ]],
  syntymapaivakalenteri: ['Syntymävuosi on vapaaehtoinen tieto', [
    'Nimi, kuukausi ja päivä riittävät vuotuisen syntymäpäivän muistamiseen. Lisää syntymävuosi vain, jos haluat myös ikätiedon. Tarkista 29. helmikuuta olevan merkkipäivän toistotapa erikseen, koska tavallisessa vuodessa tätä päivämäärää ei ole.',
    `Tallenna muistutus riittävän aikaiseksi, jos haluat varata aikaa lahjalle tai yhteydenotolle. Kalenterisovellus päättää, miten tuodun tapahtuman ilmoitus näytetään. ${a('/blogi/kalenterin-varmuuskopio/','Varmuuskopiointiopas')} auttaa säilyttämään oman listan myös selaimen tai laitteen vaihtuessa.`,
  ]],
  nimipaivat: ['Sama kutsumanimi ei takaa samaa nimipäivää', [
    'Tarkista nimi sen oikeassa kirjoitusasussa virallisesta nimipäiväkalenterista. Suomen- ja ruotsinkielinen luettelo ovat eri aineistoja, eikä samankaltaiselta kuulostavan nimen päivästä voi päätellä toisen nimen nimipäivää. Sivuston oma muistutuslista sisältää itse lisäämäsi päivät.',
    `Kun olet varmistanut päivämäärän, nimeä muistutus niin, että tiedät ketä se koskee. Voit pitää syntymäpäivät erillään ${a('/syntymapaivakalenteri/','syntymäpäiväkalenterissa')}. Nimipäivämerkintä ei muuta alkuperäistä nimipäiväluetteloa eikä sivusto päättele nimeä tai henkilöllisyyttä kävijästä.`,
  ]],
  kuukalenteri: ['Päivittäinen kuukuva ja vaihehetki eivät ole sama tieto', [
    'Valitse oikea vuosi ja kuukausi, avaa päivä ja vertaa kuvaa viereisiin päiviin. Kuvat näyttävät valaistuksen sovittuna vertailuaikana. Päävaiheiden taulukon kellonaika puolestaan kertoo yhden täsmällisen uudenkuun, täysikuun tai neljännesvaiheen hetken.',
    `Jos haluat nähdä Kuun ulkona, tarkista lisäksi ${a('/kuun-nousu-ja-lasku/','nousu ja lasku havaintopaikallasi')}. Hyväkään vaihe ei takaa Kuun olevan näkyvissä juuri illalla. ${a('/blogi/kuun-vaiheet/','Kuun vaiheiden oppaassa')} selitetään valaistuksen, vaiheen ja paikallisen näkyvyyden ero.`,
  ]],
  'kuun-vaiheet': ['Neljännesvaiheessa näkyy puolikas kiekko', [
    'Ensimmäinen ja viimeinen neljännes kuvaavat Kuun kierron kohtaa. Ne eivät tarkoita, että näkyvästä kiekosta olisi valaistuna vain neljännes. Neljännesvaiheen aikaan valaistu ja varjossa oleva puoli jakavat näkyvän pinnan suunnilleen kahtia.',
    `Vertaa neljää päävaihetta ${a('/kuukalenteri/','päivittäisiin kuviin')}, jotta huomaat jatkuvan muutoksen vaihehetkien välillä. Päävaiheen ajankohta ei yksin kerro Kuun korkeutta. Havaintoillan valinnassa tarvitaan myös ${a('/kuun-nousu-ja-lasku/','paikalliset nousu- ja laskuajat')}.`,
  ]],
  taysikuu: ['Valitse havaintoilta, älä vain tarkkaa minuuttia', [
    'Täysikuun taulukko auttaa löytämään oikean yön, vaikka tarkka vaihehetki olisi Suomessa päiväsaikaan. Kuu näyttää lähes pyöreältä myös lähellä olevina öinä. Havaintoa tai valokuvaa varten tärkeää on lisäksi, missä suunnassa ja kuinka korkealla Kuu on.',
    `Valitse päivä ${a('/kuun-nousu-ja-lasku/','Kuun paikallisesta laskurista')} ja tarkista avoin näkymä sekä sää. Jos tarvitset päivän kuvan tulosteeseen, löydät valaistuksen ${a('/kuukalenteri/','kuukalenterista')}. Taulukon täysikuu on laskennallinen vaihehetki, ei sääennuste tai takuu näkyvästä Kuusta.`,
  ]],
  uusikuu: ['Tumma kuukuva kuuluu uudenkuun esitykseen', [
    'Uudenkuun kuvassa näkyvä pinta on lähes kokonaan varjossa. Se ei tarkoita, että kuvatiedosto puuttuisi. Vaiheessa Kuun valaistu puoli on pääosin poispäin Maasta, joten uuttakuuta ei yleensä eroteta taivaalta samalla tavoin kuin täysikuuta.',
    `Seuraa seuraavien päivien sirppiä ${a('/kuukalenteri/','kuukalenterissa')}. Sirpin havaintoa varten vertaa ${a('/auringonnousu-ja-lasku/','Auringon laskua')} Kuun paikalliseen laskuaikaan. Uudenkuun päivämäärä kertoo kierron alusta, mutta ei yksin sitä, milloin ensimmäinen sirppi näkyy omalla taivaallasi.`,
  ]],
  'auringonnousu-ja-lasku': ['Sama päivä näyttää erilaiselta eri puolilla Suomea', [
    'Valitse ensin paikkakunta ja vasta sitten päivämäärä. Vertaa auringonnousua, laskua ja keskipäivän korkeutta. Simulaation ajansäätimellä voit etsiä, missä suunnassa Aurinko on suunnitellun ulkoilun tai kuvauksen aikaan. Maaston ja rakennusten peittämää horisonttia havainne ei kuitenkaan tunne.',
    `Jos haet nimenomaan valoisan ajan kestoa, avaa ${a('/paivan-pituus/','päivän pituuden vertailu')}. Hämärän aika ja auringonnousun sekä laskun välinen aika ovat eri mittareita. Pohjoisessa tapahtuman puuttuminen voi liittyä yöttömään yöhön tai kaamokseen, ei laskurin toimintahäiriöön.`,
  ]],
  'kuun-nousu-ja-lasku': ['Lasku voi olla päivän taulukossa ennen nousua', [
    'Nousu ja lasku ilmoitetaan valitun paikallisen kalenteripäivän tapahtumina. Kuu voi laskea aamulla ja nousta uudelleen vasta illalla. Siksi taulukon laskuaika voi olla kellonaikana nousua aiempi ilman, että ajat olisivat väärässä järjestyksessä.',
    `Seuraa simulaation korkeutta eri kellonaikoina ja tarkista myös havaintopaikan esteet. Valaistun pinnan osuutta varten käytä ${a('/kuukalenteri/','kuukalenteria')}. Kuun vaihe ja näkyminen horisontin yläpuolella ovat erillisiä asioita; täysikuukaan ei näy kaikkialla samana paikallisena kellonaikana.`,
  ]],
  'paivan-pituus': ['Valoisa aika ei sisällä kaikkea ulkona näkyvää valoa', [
    'Päivän pituus tarkoittaa tässä auringonnousun ja auringonlaskun välistä aikaa. Ennen nousua ja laskun jälkeen voi silti olla hämärää. Jos suunnittelet ulkoilua, vertaa molempia: päivän pituus kertoo kalenterin valoisan jakson, hämärä puolestaan sen ympärillä olevan siirtymän.',
    `Vaihda päivämäärää nähdäksesi muutoksen valitulla paikkakunnalla. Kuun valo ja pilvisyys eivät sisälly päivän pituuden lukuun. ${a('/auringonnousu-ja-lasku/','Auringon kulun simulaatio')} auttaa ajoittamaan tekemisen, ja ${a('/vuodenajat/','vuodenaikojen vertailu')} antaa muutokselle vuotuisen kehyksen.`,
  ]],
  vuodenajat: ['Kevätpäiväntasaus ei ole sama kuin kevätsää', [
    'Tähtitieteellisen kevään alun voi laskea etukäteen. Lumen sulaminen ja kasvukauden alku taas riippuvat paikallisesta säästä. Samalle päivälle voi siten kuulua tähtitieteellinen kevät ja talvinen maisema ilman ristiriitaa.',
    `Vertaa haluamaasi vuotta ja tarkista kellonaika Suomen ajassa. Luonnossa tehtäviä töitä varten käytä lisäksi paikallista säätä sekä kasvin ohjetta ${a('/kylvokalenteri/','kylvökalenterissa')}. ${a('/paivan-pituus/','Päivän pituus')} auttaa seuraamaan valon muutosta, mutta ei kerro maan lämpötilaa.`,
  ]],
  kellonsiirto: ['Sovi siirtymäyön tapahtuma yksiselitteisesti', [
    'Kevään siirrossa yksi paikallinen tunti jää välistä, ja syksyllä yksi tunti esiintyy kahdesti. Jos tapahtuma osuu siirtymäyöhön, pelkkä kellonaika voi olla puutteellinen tieto. Varmista päivämäärä ja käytetty aikavyöhyke esimerkiksi matkalipusta tai tapahtuman järjestäjältä.',
    `Kahden kalenteripäivän erotus ei muutu tunnin siirtymän vuoksi, mutta tuntien todellinen kesto voi muuttua. Vertaa tätä ${a('/paivamaaralaskuri/','päivämäärälaskuriin')} ja yövuoron suunnittelua ${a('/tyovuorosuunnittelija/','vuorosuunnittelijaan')}. Laitteen automaattinen ajanvaihto kannattaa tarkistaa sen omista asetuksista.`,
  ]],
  auringonpimennys: ['Näkyvä pimennys tarvitsee oikean paikan ja turvallisen katselutavan', [
    'Pimennyksen maailmanlaajuinen ajankohta ei yksin kerro, näkyykö se Suomessa. Tarkista sivun havaintopaikka, paikallisen vaiheen kellonaika ja Auringon korkeus. Matalalla oleva Aurinko voi jäädä metsän tai rakennusten taakse, vaikka laskennallinen näkyvyys olisi mahdollinen.',
    `Tutustu sivun linkitettyyn turvallisuusohjeeseen ennen havaintoa. Tavalliset aurinkolasit eivät ole pimennyksen katseluun sopiva suoja. ${a('/auringonnousu-ja-lasku/','Auringon paikallinen suunta')} auttaa paikan suunnittelussa, mutta simulaatio tai kalenterimerkintä ei varmista katseluvälineen turvallisuutta.`,
  ]],
  kuunpimennys: ['Huippuhetki ei kuvaa koko pimennystä', [
    'Taulukon huippu on ilmiön yksi hetki. Pimennyksen alku, loppu ja eri vaiheet voivat ulottua sen molemmille puolille. Tarkista paikallinen Kuun korkeus, sillä havaintoikkuna voi jäädä lyhyeksi Kuun noustessa tai laskiessa kesken tapahtuman.',
    `Tarkista ${a('/kuun-nousu-ja-lasku/','illan Kuun nousu- ja laskuajat')} ja tutustu sivun lähteissä pimennyksen koko kulkuun. Puolivarjopimennys voi olla paljon hienovaraisempi kuin täydellinen pimennys. Pilvet ja maasto vaikuttavat siihen, mitä omasta havaintopaikasta todella näkee.`,
  ]],
  perseidit: ['Varaa havaintoaikaa yksittäisen minuutin sijasta', [
    'Meteorien katsominen on odottamista laajan taivaan alla. Huipun arvioitu ajankohta ei tarkoita, että näkyvä meteori ilmestyisi juuri sillä minuutilla. Valitse turvallinen ja mahdollisimman pimeä paikka, jätä kirkkaat valot pois näkökentästä ja varaudu olemaan paikalla pidempään.',
    `Vertaa havaintoillan hämärää, Kuun vaihetta ja säätä. ${a('/kuun-nousu-ja-lasku/','Kuun paikallinen näkyvyys')} auttaa arvioimaan sen valon vaikutusta. Vuotuinen meteorimäärä riippuu havainto-oloista, joten laskurin valitsema hyvä aika on suunnittelun apu eikä lupaus tietystä määrästä tähdenlentoja.`,
  ]],
  kylvokalenteri: ['Istutuspäivästä taaksepäin kylvöön', [
    'Jos siemenpussissa annetaan esikasvatuksen kesto viikkoina, arvioi ensin omaan kasvupaikkaasi sopiva istutuspäivä. Laske vasta sitten kylvöväli taaksepäin. Laskurin viikkomäärä on oma valintasi, eikä se korvaa lajikkeen tai kasvatusmenetelmän ohjetta.',
    `Erota kasvihuone, parveke ja avomaa toisistaan. Kirjaa suunnitelmaan kasvin lisäksi lajike ja toteutuneet työpäivät, jotta voit verrata niitä ensi keväänä. ${a('/kylvokalenteri/tomaatti/','Tomaatin esikasvatus')} ja ${a('/kylvokalenteri/peruna/','perunan istutus')} näyttävät, miksi kaikille kasveille ei käytetä samaa kylvökuukautta.`,
  ]],
  'elakkeiden-maksupaivat': ['Valitse oma maksajasi ennen kalenterin tilaamista', [
    'Sama henkilö voi saada eläkettä useammalta maksajalta, eikä yhdellä taulukolla kuvata kaikkia maksuja. Valitse oma maksajasi ja tarkista, mitä eläkettä kyseinen kalenteri koskee. Henkilökohtainen päätös ja maksajan asiointipalvelu ratkaisevat oman maksusi tiedot.',
    'Yksittäinen ICS-lataus on kopio valituista päivistä. Kalenteritilaus käyttää pysyvää osoitetta ja hakee muutokset sovelluksen omalla aikataululla. Muistutuksen lisääminen auttaa huomaamaan päivän, mutta ei muuta maksua, pankkikäsittelyä tai oikeutta eläkkeeseen. Vältä henkilötunnuksen tai päätöksen sisällön kirjoittamista jaettavaan kalenteriin.',
  ]],
  'etuuksien-maksupaivat': ['Yleinen maksupäivä ja oma päätös ovat eri tietoja', [
    'Valitse etuus ja tarkista, onko kyse yleisestä maksukalenterista vai itse lisäämästäsi päivästä. Kaikilla etuuksilla ei ole koko vuoden yhteistä maksupäivää. Omaan hakemukseen, päätökseen tai ilmoitusjaksoon liittyvä ajankohta varmistetaan maksajan asiointipalvelusta.',
    'Nimeä oma muistutus lyhyesti ilman arkaluonteisia tietoja. Tarkista päivämäärä ja ilmoituksen ajoitus ennen vientiä puhelimen kalenteriin. Kalenterimerkintä ei jätä hakemusta, vahvista etuuden määrää tai käynnistä maksua; se auttaa muistamaan itse varmistamasi tapahtuman.',
  ]],
  horoskooppi: ['Aurinkomerkki, nouseva merkki ja päivän tulkinta', [
    'Aurinkomerkki viittaa astrologiassa Auringon paikkaan trooppisessa eläinradassa syntymähetkellä. Nouseva merkki perustuu lisäksi syntymäpaikan horisonttiin ja tarkkaan kellonaikaan. Päivän horoskooppiteksti on näistä erillinen, merkkikohtainen viihteellinen tulkinta, ei henkilökohtainen syntymäkartta.',
    `Avaa ensin oma merkkisi ja tarkista tulkinnan päiväys. Jos syntymäaika on epävarma, nousevan merkin tuloksen epävarmuus kuuluu mukaan tulkintaan. ${a('/horoskooppimerkki/','Syntymäpäivään perustuva merkkilaskuri')} antaa tavanomaisen päivämääräluokan; rajapäivän tarkka aurinkomerkki voi vaatia enemmän tietoja.`,
  ]],
  horoskooppimerkki: ['Merkin nimi ei ole persoonallisuustesti', [
    'Päivämäärälaskuri auttaa löytämään tavanomaisen astrologisen merkin ja tutustumaan sen perinteiseen symboliikkaan. Se ei mittaa ominaisuuksiasi, soveltuvuuttasi tai yhteensopivuuttasi toisen ihmisen kanssa. Päivämäärärajan lähellä syntymävuosi ja tarkka kellonaika voivat vaikuttaa aurinkomerkkiin.',
    `Jos haluat tutkia nousevaa merkkiä, käytä ${a('/horoskooppi/#nouseva-merkki','erillistä syntymäajan ja -paikan laskuria')}. Merkin ${a('/horoskooppi/','päivittäinen tulkinta')} on tarkoitettu viihteeksi ja pohdinnan virikkeeksi. Se ei ole peruste terveyttä, rahaa tai muita merkittäviä päätöksiä koskeville ratkaisuille.`,
  ]],
  verokalenteri: ['Veron eräpäivä vai oma valmistelutehtävä?', [
    'Erota kalenterissasi varsinainen eräpäivä ja sitä ennen tehtävä valmistelu. Esimerkiksi tietojen kokoamiselle tai ilmoituksen tarkistamiselle voi varata oman muistutuksen. Valitse verolaji ja ajanjakso huolellisesti, jotta yleinen määräpäivä ei sekoitu henkilökohtaisessa päätöksessä olevaan päivään.',
    'Tarkista oma maksu ja ilmoitus OmaVerosta ennen niiden tallentamista. Kalenteriin lisääminen ei lähetä veroilmoitusta eikä maksa veroa. Yleinen verokalenteri auttaa hahmottamaan julkaistut päivät, mutta se ei päättele yrityksesi verokautta, henkilökohtaista eräpäivää tai veron määrää puolestasi.',
  ]],
  hakukalenteri: ['Hakuaika, liitteet ja paikan vastaanotto omiksi tapahtumiksi', [
    'Aloita hakukohteen omasta ohjeesta ja tarkista, mitkä yhteiset aikataulut sitä koskevat. Hakemuksen jättämisen lisäksi liitteillä, valintakokeella ja opiskelupaikan vastaanotolla voi olla omat määräaikansa. Yhden muistutuksen tekeminen hakuajan loppuun ei kata näitä kaikkia.',
    `Varaa valmisteluun aikaa ennen viimeistä päivää ${a('/opiskelukalenteri/','opiskelukalenterissa')}. Kun paikka varmistuu, tarkista oppilaitoksen aloitusohjeet ja ${a('/yliopistojen-kalenterit/','lukuvuoden aikataulu')}. Kalenterivienti on suunnittelun apu; se ei lähetä hakemusta tai kuittaa tarjottua opiskelupaikkaa vastaanotetuksi.`,
  ]],
  kausimuistutukset: ['Muistuta tarkistamisesta, älä oleta säätilaa', [
    'Kausitehtävän päivämäärä voi olla hyvä hetki tarkistaa tilanne, vaikka itse työ riippuisi säästä. Esimerkiksi kasvupaikan valmistelu, välineiden huolto ja tulevan kauden hankinnat ovat eri tehtäviä. Nimeä muistutus sen mukaan, mitä juuri silloin aiot tehdä.',
    `Jos tehtävä liittyy puutarhaan, vertaa ajankohtaa ${a('/kylvokalenteri/','kasvikohtaiseen kylvöohjeeseen')}. ${a('/vuodenajat/','Tähtitieteellinen vuodenajan alku')} ei määritä paikallista lämpötilaa. Omien muistutusten päivämäärät eivät ole viranomaisen määräaikoja, ja ne kannattaa päivittää omien olosuhteiden muuttuessa.`,
  ]],
  'tahtitieteellinen-kalenteri': ['Ilmiön päivämäärästä omalle havaintopaikalle', [
    'Valitse ensin ilmiö, jota haluat seurata. Kuun päävaihe kuvaa koko Maalle yhteistä geometriaa, kun taas nousu, lasku ja korkeus lasketaan havaintopaikalle. Pimennyksessä pitää tarkistaa myös paikallinen näkyvyys. Yhden kalenteripäivän nimi ei siten vielä ratkaise havaintoiltaa.',
    `Aloita ${a('/kuun-vaiheet/','Kuun päävaiheista')} tai ${a('/vuodenajat/','päiväntasauksista ja päivänseisauksista')}. Siirry sitten oman paikan laskuriin ja tarkista valo, horisontti sekä sää. Näin tapahtuman ajankohta ja käytännön havainto-olot pysyvät erillisinä tietoina.`,
  ]],
  'oma-arki': ['Tapahtuma, muistiinpano vai tehtävä?', [
    'Tapahtuma kuuluu tietylle päivälle ja voi sisältää kellonajan. Muistiinpano sopii päivän taustatiedolle, ja tehtävä kertoo mitä aiot tehdä. Esimerkiksi vastaanottoaika on tapahtuma, mukaan otettavat paperit muistiinpano ja niiden kokoaminen tehtävä. Valitse ensin oikea päivä, jotta merkinnät löytyvät myöhemmin oikeasta kohdasta.',
    `Omat tiedot tallentuvat tähän selaimeen. ICS-vienti siirtää tapahtumia kalenteriohjelmaan, kun taas JSON-varmuuskopio säilyttää myös paikallisia suunnitelmatietoja. Lue ${a('/blogi/kalenterin-varmuuskopio/','varmuuskopioinnin ohje')} ennen selaimen vaihtamista. Pelkkä sivun osoitteen jakaminen ei jaa omia merkintöjäsi toiselle henkilölle.`,
  ]],
  tyokalut: ['Valitse työkalu kysymyksesi mukaan', [
    `Jos kysyt ”milloin”, aloita ${a('/kalenteri/','kalenterista')} tai kyseisen aiheen päivämääräluettelosta. Jos kysyt ”kuinka monta”, tarvitset laskurin: kalenteripäivät, oman työviikon päivät ja jäljellä olevat tunnit ovat eri tuloksia. Jos taas haluat kirjata tekemistä, valitse päivän, viikon tai perheen suunnittelija.`,
    'Työkalun nimessä oleva aihe kertoo käyttötarkoituksen, mutta tuloksen asetukset ratkaisevat sen merkityksen. Tarkista etenkin vuosiluku, paikkakunta ja alku- sekä loppupäivän sisällyttäminen. Suunnitelman tulostaminen, yksittäisen tapahtuman siirto ja kaikkien omien tietojen varmuuskopiointi ovat eri toimintoja.',
  ]],
  yhteystiedot: ['Näillä tiedoilla virhe löytyy helpommin', [
    'Liitä viestiin sivun osoite ja kuvaa kohta, jossa ongelma näkyy. Laskurista tarvitaan päivämäärät, paikkakunta ja käyttämäsi asetukset sekä tieto siitä, mitä odotit tulokseksi. Näyttökuva auttaa ulkoasuvirheen toistamisessa, mutta rajaa henkilökohtaiset kalenteritiedot siitä pois.',
    `Jos ilmoitat muuttuneesta koululomasta, maksupäivästä tai muusta aikataulusta, lisää linkki julkaisevan tahon ohjeeseen. Omia tapahtumiasi ei voi palauttaa ylläpidon palvelimelta, sillä ne tallentuvat selaimeesi. ${a('/usein-kysyttya/','Usein kysytyissä kysymyksissä')} on ohjeita tallennukseen, vientiin ja tulostamiseen.`,
  ]],
  saavutettavuus: ['Käytä työkalua omaan tapaasi', [
    'Sivua voi suurentaa selaimen zoomauksella. Näppäimistöllä liikuttaessa sarkain siirtää kohdistusta linkkeihin ja kenttiin, ja painikkeen voi käynnistää näppäimistöltä. Avaa valintakentän omat vaihtoehdot sen normaalilla näppäinkomennolla; pelkkä osoittimen vieminen kohdan päälle ei saa olla ainoa tapa löytää tärkeää tietoa.',
    `Jos jokin toiminto ei onnistu, kerro ${a('/yhteystiedot/','palautteessa')} sivun osoite, laite ja käytetty selain tai apuväline. Kuvaa myös, mihin kohtaan eteneminen pysähtyy. Tämä sivu kertoo käytöstä ja palautekanavasta; se ei ole ulkopuolisen tekemä saavutettavuussertifikaatti.`,
  ]],
};

export function practicalExample(path, {omitFirst=false}={}) {
  const bits=path.split('/').filter(Boolean);
  if(bits.length!==1)return '';
  const record=PRACTICAL_EXAMPLES[bits[0]];
  if(!record)return '';
  const paragraphs=omitFirst?record[1].slice(1):record[1];
  return `<section class="reading-example panel${omitFirst?' reading-example-followup':''}" data-page-explanation="${esc(bits[0])}" data-editorial-skip><p class="eyebrow">${omitFirst?'JATKA SUUNNITELMAA':'KÄYTÄNNÖN ESIMERKKI'}</p><h2>${esc(record[0])}</h2><div class="reading-example-copy">${paragraphs.map(p=>`<p>${p}</p>`).join('')}</div></section>`;
}
