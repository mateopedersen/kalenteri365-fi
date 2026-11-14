import {PROFILES} from '../lib/horoscope.mjs';
import {MONTHS,cap} from './calendar.mjs';
import {esc,icon,link} from './ui.mjs';

const guides = {
  oinas: {
    genitive: 'Oinaan', themes: ['Aloitteellisuus', 'Rohkeus', 'Suoruus'],
    meaning: 'Oinas on länsimaisen trooppisen eläinradan ensimmäinen merkki. Sen tavanomainen ajanjakso alkaa maaliskuussa ja jatkuu huhtikuulle. Oinaan vertauskuva on pässi, ja astrologisessa perinteessä merkki yhdistetään aloittamiseen, omaan tahtoon ja haluun kokeilla. Tulielementti kuvaa tässä innostusta ja liikkeelle lähtemistä, ei ihmisen todellista luonnetta mittaavaa ominaisuutta.',
    traits: 'Oinaaseen liitetään usein rohkeus sanoa oma mielipiteensä ja tarttua toimeen ennen kuin kaikkea on suunniteltu valmiiksi. Tämän kuvauksen vahvuus on aloitteellisuus. Sen kääntöpuolena pidetään kärsimättömyyttä: ensimmäinen sysäys voi tuntua kiinnostavammalta kuin työn loppuun saattaminen. Kaikki Oinaan aikaan syntyneet eivät kuitenkaan ajattele tai toimi samalla tavalla.',
    everyday: 'Oinaan teemoja voi käyttää oman toiminnan pohtimiseen. Mikä asia tarvitsee ensimmäisen askeleen, ja missä kannattaa kuunnella toista ennen päätöstä? Uuden harrastuksen tai oman projektin alussa innostukselle voi antaa tilaa ja samalla sopia itselleen pienen, loppuun vietävän tehtävän. Päivän tulkintaa kannattaa lukea ajatuksen herättäjänä, ei ohjeena ottaa tarpeettomia riskejä.',
  },
  harka: {
    genitive: 'Härän', themes: ['Vakaus', 'Kärsivällisyys', 'Aistillisuus'],
    meaning: 'Härän tavanomainen ajanjakso alkaa huhtikuun lopulla ja päättyy toukokuussa. Sen vertauskuva on härkä ja elementti maa. Astrologisessa perinteessä Härkä kuvaa pysyvyyttä, omaa tahtia ja sitä, mikä tuntuu konkreettisesti hyvältä: rauhallista kotia, luontoa, ruokaa tai huolellisesti tehtyä työtä. Kyse on symbolisesta kuvauksesta, ei syntymäpäivästä pääteltävästä persoonallisuustestistä.',
    traits: 'Härän perinteisiin vahvuuksiin kuuluvat pitkäjänteisyys ja kyky pitää huolta jo rakennetusta. Luottamus syntyy tässä kuvauksessa vähitellen ja näkyy käytännön tekoina. Vakauden kaipuu voi toisaalta tehdä muutoksen aloittamisesta hankalaa, vaikka vanha tapa ei enää palvelisi tarkoitustaan. Härän rauhallisuutta ei siksi kannata sekoittaa siihen, ettei ihmisellä olisi vahvoja toiveita.',
    everyday: 'Härän teemoissa hyödyllinen kysymys on, mikä arjessa tuo todellista turvaa ja mistä pidät kiinni pelkän tottumuksen vuoksi. Omasta ajasta, levosta ja kohtuullisesta työmäärästä huolehtiminen sopii tähän näkökulmaan. Jos päivän horoskooppi ehdottaa muutosta, voit pohtia pientä kokeilua sen sijaan, että tulkitsisit tekstin kehotukseksi mullistaa koko elämä.',
  },
  kaksoset: {
    genitive: 'Kaksosten', themes: ['Uteliaisuus', 'Viestintä', 'Monipuolisuus'],
    meaning: 'Kaksosten tavanomainen ajanjakso alkaa toukokuussa ja päättyy kesäkuussa. Merkkiä edustavat kaksoset, ja se kuuluu ilmaelementtiin. Astrologiassa sen keskeisiä aiheita ovat kieli, oppiminen, tiedon vaihtaminen ja saman asian tarkastelu eri suunnista. Kahden hahmon vertauskuva kuvaa näkökulmien runsautta; se ei tarkoita, että merkin aikaan syntyneellä olisi kaksi persoonallisuutta.',
    traits: 'Kaksosiin yhdistetään nopea oivallus, keskustelunhalu ja taito löytää yhteys erilaisten ihmisten tai ajatusten välille. Uuden oppiminen voi tuntua palkitsevalta jo itsessään. Tämän kuvauksen haaste on huomion hajaantuminen: kiinnostavia alkuja syntyy helposti enemmän kuin niille on aikaa. Uteliaisuus ja keskittymisen harjoittelu voivat silti kulkea hyvin rinnakkain.',
    everyday: 'Kaksosten teemoja voi soveltaa kysymällä, mitä haluat oikeasti ymmärtää ja keneltä voisit kysyä lisää. Keskustelussa kannattaa erottaa kuuleminen siitä, että valmistelee jo omaa vastaustaan. Oppimiseen tai kirjoittamiseen liittyvä päivän tulkinta voi antaa aiheen kokeilulle, mutta tärkeät tiedot on aina tarkistettava niiden alkuperäisestä lähteestä.',
  },
  rapu: {
    genitive: 'Ravun', themes: ['Huolenpito', 'Herkkyys', 'Turvallisuus'],
    meaning: 'Ravun tavallinen ajanjakso ulottuu kesäkuun lopulta heinäkuulle. Sen vertauskuva on rapu ja elementti vesi. Astrologisessa perinteessä merkki liittyy kotiin, muistoihin, läheisiin suhteisiin ja turvallisuuden kokemukseen. Ravun kuori kuvaa usein omien rajojen suojaamista: läheisyyden tarve ja halu vetäytyä omaan rauhaan voivat esiintyä samassa symbolisessa tarinassa.',
    traits: 'Rapuun liitetään huomaavaisuus, tunnelmien aistiminen ja halu pitää huolta tärkeistä ihmisistä. Muistot ja tutut tavat voivat saada tässä kuvauksessa suuren merkityksen. Huolenpito voi kuitenkin muuttua kuormittavaksi, jos omat tarpeet jäävät jatkuvasti muiden toiveiden alle. Herkkyys ei tarkoita heikkoutta eikä varovaisuus sitä, ettei ihminen osaisi tehdä rohkeita päätöksiä.',
    everyday: 'Ravun teemoja lukiessa voi pysähtyä kysymään, missä tunnet olosi levolliseksi ja mitä tarvitset voidaksesi sanoa toiveesi ääneen. Yhteinen ateria, sovittu puhelu tai oma rauhallinen hetki ovat konkreettisia tapoja vaalia läheisyyttä. Päivän horoskooppi ei kuitenkaan kerro toisen ihmisen tunteita puolestasi; niistä saa selvää keskustelemalla.',
  },
  leijona: {
    genitive: 'Leijonan', themes: ['Luovuus', 'Lämpö', 'Itseilmaisu'],
    meaning: 'Leijonan tavanomainen ajanjakso alkaa heinäkuussa ja jatkuu elokuulle. Sen vertauskuva on leijona ja elementti tuli. Astrologiassa Leijona kuvaa oman äänen löytämistä, luovuutta ja iloa siitä, että saa tehdä jotakin itselleen merkityksellistä. Näkyminen ei tässä tarkoita vain esiintymistä, vaan myös uskallusta tuoda oma panos yhteiseen tekemiseen.',
    traits: 'Leijonaan yhdistetään usein lämpö, anteliaisuus ja kyky rohkaista muita. Arvostuksen saaminen ja antaminen ovat tämän perinteisen kuvauksen tärkeitä aiheita. Haasteeksi voi nousta se, jos oma onnistumisen tunne riippuu kokonaan ulkopuolisesta huomiosta. Leijonan symboliikkaan sopii siksi myös kysymys siitä, mistä tekemisestä nauttii silloin, kun kukaan ei katso.',
    everyday: 'Leijonan teemat voivat kannustaa varaamaan aikaa luovalle harrastukselle, ilmaisemaan kiitoksen tai ottamaan vastuuta yhteisestä hetkestä. Oman idean rinnalle kannattaa jättää tilaa muiden ehdotuksille. Päivän tulkinnassa mainittu näkyvyys voi tarkoittaa vaikka sitä, että kertoo työryhmälle ajatuksensa selkeästi; se ei lupaa huomiota, suosiota tai tiettyä lopputulosta.',
  },
  neitsyt: {
    genitive: 'Neitsyen', themes: ['Huolellisuus', 'Harkinta', 'Käytännöllisyys'],
    meaning: 'Neitsyen tavanomainen ajanjakso alkaa elokuun lopulla ja päättyy syyskuussa. Merkki kuuluu maaelementtiin, ja sen perinteinen hahmo kuvataan usein viljantähkän kanssa. Astrologiassa Neitsyt liittyy erottelukykyyn, taitojen kehittämiseen ja siihen, miten jokin saadaan toimimaan arjessa paremmin. Merkin nimi on perinteinen vertauskuva eikä väite ihmisen seksuaalisuudesta tai elämäntavasta.',
    traits: 'Neitsyeen liitetään yksityiskohtien huomaaminen, vastuullinen valmistautuminen ja halu olla käytännössä avuksi. Ongelmaa lähestytään tässä kuvauksessa usein selvittämällä ensin, mistä se koostuu. Huolellisuuden varjopuolena pidetään liiallista itsekritiikkiä tai viimeistelyn jatkamista silloinkin, kun työ olisi jo riittävän hyvä. Tarkkuutta voi käyttää myös omien voimavarojen suojelemiseen.',
    everyday: 'Neitsyen teemoista voi poimia kysymyksen: mikä pieni korjaus helpottaisi tätä päivää eniten? Selkeä muistilista tai yhden hankalan asian jakaminen vaiheisiin voi auttaa enemmän kuin koko arjen järjestäminen kerralla. Kaikkea ei tarvitse viimeistellä yhtä huolellisesti. Toimiva rutiini jättää tilaa myös levolle eikä vaadi kaiken jatkuvaa parantamista.',
  },
  vaaka: {
    genitive: 'Vaa’an', themes: ['Tasapaino', 'Yhteistyö', 'Oikeudenmukaisuus'],
    meaning: 'Vaa’an tavanomainen ajanjakso alkaa syyskuussa ja jatkuu lokakuulle. Sen vertauskuva on vaaka, jonka kupit kuvaavat vaihtoehtojen punnitsemista. Merkki kuuluu ilmaelementtiin, ja astrologisessa perinteessä se liittyy vuorovaikutukseen, oikeudenmukaisuuteen ja kauneuden tajuun. Tasapaino tarkoittaa tässä liikkuvaa neuvottelua eri tarpeiden välillä, ei sitä, että elämä olisi aina sopusoinnussa.',
    traits: 'Vaakaan yhdistetään kyky nähdä toisen näkökulma, neuvotella ja rakentaa yhteistyötä. Eri vaihtoehtojen hyvät puolet voivat hahmottua nopeasti, mutta päätöksen tekeminen ei silti aina ole helppoa. Tämän kuvauksen haaste on omien tarpeiden sivuuttaminen sovun säilyttämiseksi. Reilu ratkaisu ottaa huomioon myös sen ihmisen, joka yrittää sovitella muiden toiveita.',
    everyday: 'Vaa’an teemat voivat auttaa sanoittamaan, mitä pidät kohtuullisena yhteisessä arjessa. Sopikaa esimerkiksi tehtävien jaosta riittävän konkreettisesti, jotta kumpikin tietää, mitä sovittiin. Päivän horoskoopin ihmissuhdeaihetta voi käyttää keskustelun avaamiseen, mutta yhteensopivuutta tai suhteen tulevaisuutta ei voi päätellä yksin kummankaan horoskooppimerkistä.',
  },
  skorpioni: {
    genitive: 'Skorpionin', themes: ['Syvyys', 'Luottamus', 'Sinnikkyys'],
    meaning: 'Skorpionin tavallinen ajanjakso ulottuu lokakuun lopulta marraskuulle. Sen vertauskuva on skorpioni ja elementti vesi. Astrologiassa merkki liittyy syviin tunteisiin, luottamukseen ja muutoksiin, joissa jokin vanha tapa saa väistyä. Skorpionin symboliikka korostaa pintaa syvemmälle katsomista; se ei anna ihmiselle erityistä kykyä tietää toisten salaisuuksia tai ajatuksia.',
    traits: 'Skorpioniin liitetään keskittymiskyky, uskollisuus tärkeille asioille ja halu ymmärtää, mistä tunne tai tilanne todella syntyy. Luottamuksen rakentumista pidetään tässä kuvauksessa merkityksellisenä. Sen haasteita voivat olla epäluulo tai vaikeus päästää irti jo päättyneestä asiasta. Voimakas tunne ei kuitenkaan itsessään ole todiste siitä, että oma tulkinta tilanteesta olisi oikea.',
    everyday: 'Skorpionin teemoja voi tarkastella kysymällä, mikä ansaitsee syvemmän keskustelun ja minkä voisi jättää rauhaan. Omista rajoista voi kertoa ilman, että toisen motiiveja tarvitsee arvailla. Päivän tulkinnan muutosaihe voi tarkoittaa pienen, kuluttavan tavan tunnistamista. Se ei ennusta kriisiä eikä velvoita tekemään suurta ratkaisua juuri tänään.',
  },
  jousimies: {
    genitive: 'Jousimiehen', themes: ['Uteliaisuus', 'Vapaus', 'Laaja näkökulma'],
    meaning: 'Jousimiehen tavanomainen ajanjakso alkaa marraskuussa ja päättyy joulukuussa. Merkkiä kuvaa jousella tähtäävä hahmo, usein kentauri, ja sen elementti on tuli. Astrologisessa perinteessä Jousimies etsii uusia näkökulmia, kokemuksia ja merkityksiä. Matka voi olla konkreettinen retki, mutta yhtä hyvin kirjan, opiskelun tai keskustelun avaama ajatus.',
    traits: 'Jousimieheen yhdistetään toiveikkuus, suorasukaisuus ja halu nähdä yksittäistä tilannetta laajempi kokonaisuus. Uuteen tarttumista voi helpottaa luottamus siihen, että matkan varrella oppii. Tämän kuvauksen kääntöpuolena on toisinaan lupausten paisuminen tai käytännön yksityiskohtien unohtuminen. Suuri suunnitelma hyötyykin siitä, että sen rinnalle mahtuu myös realistinen aikataulu.',
    everyday: 'Jousimiehen teemat sopivat pohdintaan siitä, mitä haluaisit oppia ja millainen kokeilu veisi sinua sitä kohti. Vapauden rinnalla voi kysyä, mihin on jo sitoutunut ja keihin omat valinnat vaikuttavat. Horoskoopin matkailuun tai uuteen mahdollisuuteen liittyvä teksti ei takaa onnistumista; päätös kannattaa tehdä tiedon, ajan ja omien mahdollisuuksien perusteella.',
  },
  kauris: {
    genitive: 'Kauriin', themes: ['Pitkäjänteisyys', 'Vastuu', 'Tavoitteellisuus'],
    meaning: 'Kauriin ajanjakso alkaa joulukuussa ja jatkuu seuraavan vuoden tammikuuhun. Sen perinteinen vertauskuva on merivuohi, jolla on vuohen eturuumis ja kalan pyrstö, ja elementti on maa. Astrologiassa Kauris liittyy aikaan, vastuuseen ja vähitellen rakennettavaan osaamiseen. Vuoden vaihtuminen kesken ajanjakson ei siis tarkoita, että merkki vaihtuisi uudenvuodenpäivänä.',
    traits: 'Kauriiseen liitetään kärsivällisyys, sitoutuminen ja kyky jatkaa työtä silloinkin, kun tuloksia ei vielä näy. Vastuun kantaminen voi olla tässä kuvauksessa tärkeä tapa osoittaa välittämistä. Haasteeksi voi tulla se, että oma arvo alkaa tuntua riippuvaiselta suorituksista tai velvollisuuksista. Pitkäjänteiseen tekemiseen kuuluvat kuitenkin myös lepo, avun vastaanottaminen ja suunnitelman muuttaminen.',
    everyday: 'Kauriin teemoissa voi kysyä, mikä tavoite on todella oma ja mikä on jäänyt kannettavaksi muiden odotuksista. Suuren kokonaisuuden jakaminen pieniin vaiheisiin tekee etenemisestä näkyvää. Päivän horoskoopin työaihetta kannattaa lukea oman tilanteen pohdintana. Teksti ei arvioi ammatillisia kykyjäsi eikä lupaa ylennystä, taloudellista hyötyä tai muuta tiettyä tulosta.',
  },
  vesimies: {
    genitive: 'Vesimiehen', themes: ['Itsenäisyys', 'Uudet ajatukset', 'Yhteisöllisyys'],
    meaning: 'Vesimiehen tavallinen ajanjakso alkaa tammikuussa ja päättyy helmikuussa. Sen vertauskuva on vettä kantava tai kaatava hahmo. Nimestään huolimatta Vesimies kuuluu astrologiassa ilmaelementtiin, ei vesimerkkeihin. Merkin perinteisiä aiheita ovat itsenäinen ajattelu, ystävyys, yhteisöt ja mahdollisuus tarkastella tuttuja järjestelyjä uudesta suunnasta.',
    traits: 'Vesimieheen liitetään omaperäisyys, kiinnostus uudistamiseen ja halu toimia jonkin itseä laajemman asian hyväksi. Etäisyyden ottaminen voi tässä kuvauksessa auttaa näkemään kokonaisuuden. Samalla on hyvä huomata, ettei toimiva idea korvaa läsnäoloa tai toisen kokemuksen kuuntelemista. Itsenäisyys ja yhteenkuuluminen voivat tukea toisiaan, vaikka niiden välillä olisi ajoittain jännitettä.',
    everyday: 'Vesimiehen teemoja voi kokeilla kysymällä, mitä yhteisessä tekemisessä voisi järjestää selkeämmin ja ketä uuden idean pitäisi palvella. Ajatuksen jakaminen ystävän tai työryhmän kanssa voi paljastaa sekä sen hyvät puolet että korjattavat kohdat. Päivän tulkinnan uudistusaihe on näkökulma, ei todiste siitä, että uusi ratkaisu olisi aina vanhaa parempi.',
  },
  kalat: {
    genitive: 'Kalojen', themes: ['Mielikuvitus', 'Myötätunto', 'Herkkyys'],
    meaning: 'Kalojen tavanomainen ajanjakso alkaa helmikuussa ja jatkuu maaliskuulle. Kalat on trooppisen eläinradan kahdestoista merkki, ja sen vertauskuvana on kaksi eri suuntiin uivaa kalaa. Vesielementtiin kuuluva merkki liittyy astrologisessa perinteessä mielikuvitukseen, myötätuntoon ja herkkyyteen. Kahden kalan kuva kertoo vastakkaisten virtausten vertauskuvasta, ei ihmisen kyvyttömyydestä tehdä päätöksiä.',
    traits: 'Kaloihin yhdistetään kyky eläytyä, huomata tunnelmia ja antaa muotoa vaikeasti sanoitettaville kokemuksille esimerkiksi musiikin tai kuvien avulla. Tämän kuvauksen haasteena pidetään omien rajojen hämärtymistä, jos muiden tunteet tai odotukset täyttävät kaiken tilan. Myötätunto ei silti edellytä, että ottaa vastuun kaikesta, eikä mielikuvitus sulje pois käytännöllisyyttä.',
    everyday: 'Kalojen teemoja lukiessa voi kysyä, mikä antaa ajatuksille tilaa ja mikä auttaa palaamaan takaisin käsillä olevaan tehtävään. Luova hetki ja selkeä päivärytmi voivat sopia samaan päivään. Horoskoopin vaistoihin viittaava kohta kannattaa nähdä kutsuna huomata oma tunne, ei varmana tietona siitä, mitä seuraavaksi tapahtuu tai mitä toinen ihminen ajattelee.',
  },
};

export function horoscopeGuide(slug) {
  const profile = PROFILES.find(([id]) => id === slug), guide = guides[slug];
  if (!profile || !guide) throw new Error('Missing Finnish zodiac guide: '+slug);
  const [,name,range,element] = profile;
  const [,startDay,startMonth,endDay,endMonth] = range.match(/^(\d+)\.(\d+)\.–(\d+)\.(\d+)\.$/);
  const format = (day,month) => new Intl.DateTimeFormat('fi-FI',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2000,Number(month)-1,Number(day))));
  const dateRange = format(startDay,startMonth)+' – '+format(endDay,endMonth);
  const months = cap(MONTHS[Number(startMonth)-1])+' ja '+MONTHS[Number(endMonth)-1];
  return `<section class="zodiac-guide" id="merkin-opas" aria-labelledby="merkin-opas-title" data-sign-guide="${esc(slug)}">
    <header class="zodiac-guide-heading"><p class="eyebrow">OPAS HOROSKOOPPIMERKKIIN</p><h2 id="merkin-opas-title">${esc(name)}: päivämäärät ja merkin merkitys</h2></header>
    <div class="zodiac-guide-layout">
      <aside class="zodiac-guide-facts" aria-label="${esc(guide.genitive)} ajanjakso ja teemat"><p class="zodiac-guide-date-label">${icon('calendar')}<span>Tavanomainen ajanjakso</span></p><p class="zodiac-guide-range">${esc(range)}</p><p class="zodiac-guide-written-date">${esc(dateRange)}</p><dl><div><dt>Kuukaudet</dt><dd>${esc(months)}</dd></div><div><dt>Elementti astrologiassa</dt><dd>${esc(element)}</dd></div></dl><p class="zodiac-guide-theme-label">Merkin teemoja</p><ul>${guide.themes.map(theme=>`<li>${esc(theme)}</li>`).join('')}</ul></aside>
      <div class="zodiac-guide-copy"><section><h3>${esc(guide.genitive)} merkitys</h3><p>${esc(guide.meaning)}</p></section><section><h3>Perinteiset piirteet</h3><p>${esc(guide.traits)}</p></section><section><h3>Merkin teemat arjessa</h3><p>${esc(guide.everyday)}</p></section></div>
    </div>
    <div class="zodiac-guide-boundary"><h3>Entä jos syntymäpäivä osuu merkin rajalle?</h3><p>Päivämäärät ovat suuntaa antavia trooppisten aurinkomerkkien rajoja. Rajapäivänä merkki riippuu Auringon tarkasta sijainnista syntymähetkellä, joten syntymävuosi, kellonaika ja aikavyöhyke voivat vaikuttaa tulokseen. Päivämäärälista ei yksin ratkaise rajatapausta.</p></div>
    <div class="zodiac-guide-next"><p><strong>Aurinkomerkki ja nouseva merkki ovat eri asioita.</strong> Aurinkomerkki määräytyy Auringon sijainnista. Nouseva merkki kertoo, mikä eläinradan merkki nousee itäisessä horisontissa syntymähetkelläsi. Sen laskemiseen tarvitaan syntymäaika ja -paikka.</p>${link('#nouseva-merkki','Laske nouseva merkkisi'+icon('arrow'),'zodiac-guide-link')}</div>
  </section>`;
}
