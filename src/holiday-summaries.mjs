// Short directory introductions drawn from the existing sourced holiday articles.
// Calendar dates and legal classifications continue to come from calendar.mjs.
const summaries = {
  'kalevalan-paiva': 'Kalevalan ja suomalaisen kulttuurin päivä muistuttaa kansalliseepoksesta ja sen taustalla olevasta runonlauluperinteestä.',
  'minna-canthin-paiva': 'Minna Canthin ja tasa-arvon päivä yhdistää kirjallisuuden, koulutuksen ja yhteiskunnallisen vaikuttamisen.',
  'agricolan-paiva': 'Suomen kielen päivänä muistetaan Mikael Agricolaa ja suomen kirjakielen kehitystä. Päivä on myös Elias Lönnrotin syntymäpäivä.',
  'veteraanipaiva': 'Kansallinen veteraanipäivä kunnioittaa Suomen sotiin osallistuneita veteraaneja ja heidän perintöään.',
  'eurooppa-paiva': 'Eurooppa-päivän taustalla on Schumanin julistus vuodelta 1950. Päivän aiheita ovat rauha ja eurooppalainen yhteistyö.',
  'snellmanin-paiva': 'J. V. Snellmanin ja suomalaisuuden päivä nostaa esiin suomen kielen ja kansallisen sivistyselämän asemaa.',
  'lippujuhlan-paiva': 'Puolustusvoimain lippujuhlan päivä on myös C. G. E. Mannerheimin syntymäpäivä. Se on eri juhla kuin juhannuksen Suomen lipun päivä.',
  'eino-leinon-paiva': 'Runon ja suven päivänä muistetaan Eino Leinoa sekä juhlitaan runoutta ja kesäistä kulttuuria.',
  'miina-sillanpaan-paiva': 'Miina Sillanpään ja kansalaisvaikuttamisen päivä muistuttaa Suomen ensimmäisestä naisministeristä ja yhdessä vaikuttamisesta.',
  'aleksis-kiven-paiva': 'Suomalaisen kirjallisuuden päivää vietetään Aleksis Kiven syntymäpäivänä. Kirjailija tunnetaan muun muassa Seitsemästä veljeksestä.',
  'ykn-paiva': 'YK:n päivä muistuttaa järjestön peruskirjan voimaantulosta vuonna 1945. Teemoina ovat rauha, ihmisoikeudet ja kansainvälinen yhteistyö.',
  'ruotsalaisuuden-paiva': 'Svenska dagen juhlistaa ruotsin kieltä ja suomenruotsalaista kulttuuria Suomessa.',
  'lapsen-oikeuksien-paiva': 'Lapsen oikeuksien päivä liittyy YK:n lapsen oikeuksien sopimukseen. Päivä muistuttaa oikeuksista, jotka kuuluvat lapsille joka päivä.',
  'sibeliuksen-paiva': 'Jean Sibeliuksen syntymäpäivänä vietetään suomalaisen musiikin päivää. Säveltäjän elämäntyö avaa näkökulman päivän taustaan.',
};
export const holidaySummary = holiday => summaries[holiday.slug] || holiday.description;
