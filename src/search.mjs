import {CITIES,SLUGS} from './calendar.mjs';
export const normalize=value=>String(value||'').toLocaleLowerCase('fi').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/['’]/g,'').replace(/(\p{L})(\d)/gu,'$1 $2').replace(/(\d)(\p{L})/gu,'$1 $2').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const families={
 kalenteri:'kalenteri kalenterit kalenterin kalenteria kalenteriin kalenterista calendar calendars',
 luo:'luo luoda tee teen tehda muokkaa rakentaa create maker customize',
 oma:'oma oman omat omaa omia own personal',
 kuukausi:'kuukausi kuukauden kuukaudet kuukautta kuukausikalenteri kuukausittainen monthly',
 viikko:'viikko viikon viikot viikkoa viikoittain viikkokalenteri weekly week',
 koulu:'koulu koulut koulujen koulun kouluissa koululoma koululomat koululomia school',
 loma:'loma lomat lomaa loman lomaajat lomapaiva lomapaivat holidays holiday vacation',
 yliopisto:'yliopisto yliopistot yliopiston yliopistojen korkeakoulu korkeakoulut university universities',
 pyha:'pyha pyhat pyhia pyhien pyhapaiva pyhapaivat juhlapyha juhlapyhat arkipyha arkipyhat juhlat',
 tyopaiva:'tyopaiva tyopaivat tyopaivaa tyopaivia tyopaivan tyopaivien working workdays',
 tyotunti:'tyotunti tyotunnit tyotuntia tyotuntien tunnit tuntia hours',
 paivamaara:'paivamaara paivamaaran paivamaarat paivamaaria date dates',
 laskuri:'laskuri laskurit laskurilla laskea laskeminen laske calculate calculator counter',
 tulosta:'tulosta tulostaa tulostus tulostettava tulostettavat print printable pdf',
 kuu:'kuu kuun kuuta kuulle moon lunar',
 kuuvaihe:'kuuvaihe kuunvaihe kuunvaiheet vaiheet vaihetta phase phases',
 horoskooppi:'horoskooppi horoskoopit horoskoopin horoscope horoscopes zodiac',
 aurinko:'aurinko auringon aurinkoa sun',
 auringonnousu:'auringonnousu auringonnousun sunrise',
 auringonlasku:'auringonlasku auringonlaskun sunset',
 joululoma:'joululoma joululomat joululoman joululomaa',
 talviloma:'talviloma talvilomat talviloman talvilomaa hiihtoloma hiihtolomat',
 syysloma:'syysloma syyslomat syysloman syyslomaa',
 juhannus:'juhannus juhannuksena juhannuksen juhannuspaiva midsummer',
 joulu:'joulu jouluna joulun christmas',
 paasiainen:'paasiainen paasiaisena paasiaisen easter',
 syntymapaiva:'syntymapaiva syntymapaivani syntymapaivan birthday',
 nimipaiva:'nimipaiva nimipaivat nimipaivan name',
 tyovuoro:'tyovuoro tyovuorot tyovuoron tyovuorojen tyovuorosuunnittelija tyovuorokalenteri vuorot shift',
 perhe:'perhe perheen perhekalenteri family',
 tyhja:'tyhja tyhjat blank empty',
 kylvo:'kylvo kylvoa kylvot kylvokalenteri planting sowing',
 taimi:'taimi taimet taimia seedlings',
 istutus:'istutus istuttaa istutetaan istutusaika',
 kevat:'kevat kevaan kevaalla spring',
 kesa:'kesa kesalla kesan summer',
 syksy:'syksy syksyn syksylla autumn fall',
 talvi:'talvi talven talvella winter',
 elake:'elake elakkeen elakkeet elakkeiden pension',
 maksu:'maksu maksut maksetaan maksaminen maksupaivat payments',
 vero:'vero verot veron verokalenteri tax taxes',
 tietosuoja:'tietosuoja tietosuojan privacy',
 evaste:'evaste evasteet evasteen cookie cookies',
 yhteys:'yhteystiedot yhteydenotto palaute contact',
 paiva:'paiva paivaa paivien days day',
 vuosi:'vuosi vuoden vuotta vuosien year yearly years',
};
const forms={helsingin:'helsinki',helsingissa:'helsinki',espoon:'espoo',espoossa:'espoo',tampereen:'tampere',tampereella:'tampere',turun:'turku',turussa:'turku',oulun:'oulu',oulussa:'oulu',vantaan:'vantaa',vantaalla:'vantaa',jyvaskylan:'jyvaskyla',jyvaskylassa:'jyvaskyla',kuopion:'kuopio',kuopiossa:'kuopio',lahden:'lahti',lahdessa:'lahti',porin:'pori',porissa:'pori',rovaniemen:'rovaniemi',rovaniemella:'rovaniemi',joensuun:'joensuu',joensuussa:'joensuu',vaasan:'vaasa',vaasassa:'vaasa',lappeenrannan:'lappeenranta',utsjoen:'utsjoki',utsjoella:'utsjoki',inarin:'inari',inarissa:'inari',tammikuun:'tammikuu',tammikuussa:'tammikuu',helmikuun:'helmikuu',helmikuussa:'helmikuu',maaliskuun:'maaliskuu',maaliskuussa:'maaliskuu',huhtikuun:'huhtikuu',huhtikuussa:'huhtikuu',toukokuun:'toukokuu',toukokuussa:'toukokuu',kesakuun:'kesakuu',kesakuussa:'kesakuu',heinakuun:'heinakuu',heinakuussa:'heinakuu',elokuun:'elokuu',elokuussa:'elokuu',syyskuun:'syyskuu',syyskuussa:'syyskuu',lokakuun:'lokakuu',lokakuussa:'lokakuu',marraskuun:'marraskuu',marraskuussa:'marraskuu',joulukuun:'joulukuu',joulukuussa:'joulukuu'};
const canonicalMap=new Map(Object.entries(families).flatMap(([k,v])=>v.split(' ').map(w=>[w,k])));
const extraForms={nousee:'nousu',laskee:'lasku',nousuaika:'nousu',laskuaika:'lasku',ravun:'rapu',haran:'harka',oinaan:'oinas',kaksosten:'kaksoset',leijonan:'leijona',neitsyen:'neitsyt',vaaan:'vaaka',skorpionin:'skorpioni',jousimiehen:'jousimies',kauriin:'kauris',vesimiehen:'vesimies',kalojen:'kalat',aries:'oinas',taurus:'harka',gemini:'kaksoset',cancer:'rapu',leo:'leijona',virgo:'neitsyt',libra:'vaaka',scorpio:'skorpioni',sagittarius:'jousimies',capricorn:'kauris',aquarius:'vesimies',pisces:'kalat',merkkini:'merkki'};
const canon=w=>forms[w]||extraForms[w]||canonicalMap.get(w)||w;
const cities=new Set(CITIES.map(c=>normalize(c[1])));
const stop=new Set('milloin on ovat mika mita miten voin haluan haluaisin etsin suomessa suomen seuraava seuraavat tanaan today saada loytaa tieda tietaa nayta kerro minulle minua mulle olisi ovatko onko ja tai kun jos jossa minun sinun montako kuinka paljon the a an of in for with when how is are please could i find show me'.split(' '));
const groupWords={
 kalenteri:'kalenteri vuosikalenteri vuosi',kuukausikalenteri:'kalenteri kuukausi',viikkokalenteri:'kalenteri viikko',
 'pdf-kalenteri':'pdf tulosta ladattava kuva kalenteri','luo-kalenteri':'luo muokkaa suunnittele oma kalenteri valokuva kuva emoji',
 'koulujen-lomat':'koulu koululoma school loma lukuvuosi','yliopistojen-kalenterit':'yliopisto university opiskelu lukuvuosi',
 juhlapyhat:'pyha juhlapyha juhla',liputuspaivat:'liputus lippu liputuspaiva',merkkipaivat:'merkkipaiva merkkipaivat',
 tyopaivat:'tyopaiva tyotunti',tyopaivalaskuri:'tyopaiva laske laskuri kaksi paivamaara',paivamaaralaskuri:'paivamaara laskuri laske erotus valilla',
 kuukalenteri:'kuu kuuvaihe kalenteri','kuun-vaiheet':'kuu kuuvaihe','auringonnousu-ja-lasku':'aurinko auringonnousu auringonlasku nousu lasku sunrise sunset','kuun-nousu-ja-lasku':'kuu nousu lasku moonrise moonset',
 kylvokalenteri:'kylvo istutus puutarha kasvatus taimi kasvi',tyovuorosuunnittelija:'tyovuoro kierto tyo suunnitelma',
 horoskooppi:'horoskooppi tahtimerkki paivan ennuste',horoskooppimerkki:'nouseva askendentti syntymaaika horoskooppi laskuri',
 perhekalenteri:'perhe kalenteri suunnitelma','tyhja-kalenteri':'tyhja kalenteri tulosta',lomasuunnittelija:'loma suunnitelma vapaa',
 vuodenajat:'vuodenaika kevat kesa syksy talvi','elakkeiden-maksupaivat':'elake maksu','etuuksien-maksupaivat':'etuus kela maksu',
 verokalenteri:'vero maksu erapaiva',nimipaivat:'nimipaiva nimi',yhteystiedot:'yhteys palaute sahkoposti',
};
export const POPULAR_SEARCHES=[
 {path:'/kalenteri/2027/',title:'Kalenteri 2027',query:'kalenteri 2027'},
 {path:'/pdf-kalenteri/',title:'Tulostettavat kalenterit',query:'pdf kalenteri'},
 {path:'/koulujen-lomat/',title:'Koulujen lomat',query:'koulujen lomat'},
 {path:'/juhlapyhat/',title:'Suomen juhlapyhät',query:'juhlapyhät'},
 {path:'/paivamaaralaskuri/',title:'Päivämäärälaskuri',query:'päivämäärälaskuri'},
 {path:'/horoskooppi/',title:'Päivän horoskooppi',query:'horoskooppi'},
];
const prepared=new WeakMap();
const words=s=>[...new Set(normalize(s).split(' ').filter(Boolean).map(canon))];
function doc(p){let d=prepared.get(p);if(d)return d;const group=p.group||p.path.split('/')[1];d={title:normalize(p.title),path:normalize(p.path),group,depth:p.path.split('/').filter(Boolean).length,fields:[words(p.title),words(p.path),words(groupWords[group]||''),words(p.description),words(p.keywords)],years:p.path.match(/\b20\d{2}\b/g)||[]};prepared.set(p,d);return d;}
function distance(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;let prev=Array.from({length:b.length+1},(_,i)=>i),before;for(let i=1;i<=a.length;i++){const row=[i];let best=i;for(let j=1;j<=b.length;j++){row[j]=Math.min(prev[j]+1,row[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));if(before&&i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])row[j]=Math.min(row[j],before[j-2]+1);best=Math.min(best,row[j]);}if(best>max)return max+1;before=prev;prev=row;}return prev[b.length];}
function matchTerm(term,list,fuzzy){if(list.includes(term))return 1;if(term.length>=2&&list.some(w=>w.startsWith(term)))return .7;if(term.length>=5&&list.some(w=>term.startsWith(w)&&w.length>=5))return .62;if(fuzzy&&term.length>=4&&!/^\d+$/.test(term)){const max=term.length>8?2:1;if(list.some(w=>w.length>=4&&distance(term,w,max)<=max))return .4;}return 0;}
function intent(tokens){if(tokens.includes('luo')&&!tokens.includes('tyovuoro'))return ['luo-kalenteri'];if(tokens.includes('tulosta'))return ['pdf-kalenteri','tyhja-kalenteri'];if(tokens.includes('tyovuoro'))return ['tyovuorosuunnittelija'];if(tokens.includes('perhe'))return ['perhekalenteri'];if(tokens.includes('laskuri')&&tokens.includes('tyopaiva'))return ['tyopaivalaskuri'];if(tokens.includes('tyopaiva')||tokens.includes('tyotunti'))return ['tyopaivat'];if(tokens.includes('koulu')||tokens.some(t=>['koululoma','talviloma','syysloma','joululoma'].includes(t)))return ['koulujen-lomat'];if(tokens.includes('yliopisto'))return ['yliopistojen-kalenterit'];if(tokens.some(t=>['juhannus','joulu','jouluaatto','joulupaiva','paasiainen','loppiainen','vappu','itsenaisyyspaiva','pyha'].includes(t)))return ['juhlapyhat'];if(tokens.includes('kylvo')||tokens.includes('istutus')||tokens.includes('taimi'))return ['kylvokalenteri'];if(tokens.some(t=>['aurinko','auringonnousu','auringonlasku'].includes(t)))return ['auringonnousu-ja-lasku'];if(tokens.includes('horoskooppi'))return ['horoskooppi'];if(tokens.includes('kuu')||tokens.includes('kuuvaihe'))return ['kuukalenteri','kuun-vaiheet'];if(tokens.includes('laskuri')||tokens.includes('paivamaara'))return ['paivamaaralaskuri'];if(tokens.includes('kalenteri'))return ['kalenteri','kuukausikalenteri'];return [];}
function dateResult(query){const iso=String(query).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);if(iso)query=iso[3]+'.'+iso[2]+'.'+iso[1];const match=String(query).match(/^\s*(\d{1,2})[./](\d{1,2})[./](\d{4})\.?\s*$/);if(!match)return null;const [,ds,ms,ys]=match,[y,m,d]=[Number(ys),Number(ms),Number(ds)],dt=new Date(Date.UTC(y,m-1,d));if(y<1900||y>2100||dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)return false;const date=dt.toISOString().slice(0,10);return {path:'/?year='+y+'&month='+m+'&date='+date+'&view=day',title:new Intl.DateTimeFormat('fi-FI',{dateStyle:'long',timeZone:'UTC'}).format(dt),description:'Avaa päivä omassa kalenterissa. Voit katsoa päivän merkinnät tai lisätä oman tapahtuman.',group:'kalenteri',searchKind:'date'};}
export function searchCatalog(pages,query,{limit=8}={}){
 const raw=String(query||'').slice(0,300),q=normalize(raw),date=dateResult(raw);
 if(date===false)return {items:[],total:0,invalidDate:true,relaxed:false};
 if(date)return {items:[date],total:1,relaxed:false};
 if(/^\p{L}$/u.test(q)){const candidates=pages.filter(p=>p.searchable!==false&&p.path.split('/').filter(Boolean).length===1&&!['haku','sivukartta'].includes(p.group)&&normalize(p.title).split(' ').some(t=>t.startsWith(q))).sort((a,b)=>Number(POPULAR_SEARCHES.some(s=>s.path===b.path))-Number(POPULAR_SEARCHES.some(s=>s.path===a.path))||a.title.localeCompare(b.title,'fi'));return{items:candidates.slice(0,limit),total:candidates.length,shortQuery:true,relaxed:false};}
 const tokens=[...new Set(q.split(' ').filter(t=>t&&!stop.has(t)).map(canon))].slice(0,18);
 if(!tokens.length)return {items:[],total:0,relaxed:false};
 const years=tokens.filter(t=>/^20\d{2}$/.test(t)),months=tokens.filter(t=>SLUGS.includes(t)),places=tokens.filter(t=>cities.has(t)),groups=intent(tokens),scores=[],weights=[72,46,22,13,2];
 for(const p of pages){if(p.searchable===false||['sivukartta','haku'].includes(p.group))continue;const d=doc(p);if(years.length&&d.years.length&&!years.every(y=>d.years.includes(y)))continue;
 const focused=['koulujen-lomat','yliopistojen-kalenterit','auringonnousu-ja-lasku','tyovuorosuunnittelija','perhekalenteri'];
 if(focused.includes(groups[0])&&!groups.includes(d.group)&&q!==d.title){const article=['blogi','oppaat'].includes(d.group)&&tokens.filter(t=>!/^\d+$/.test(t)).some(t=>d.fields[0].includes(t));if(!article)continue;}
 if(months.length&&d.path.split(' ').some(t=>SLUGS.includes(t))&&!months.some(t=>d.fields[1].includes(t)))continue;
 if(places.length&&d.depth>=2&&['koulujen-lomat','auringonnousu-ja-lasku','kuun-nousu-ja-lasku','paivan-pituus'].includes(d.group)&&!places.every(t=>d.fields[0].includes(t)||d.fields[1].includes(t)))continue;
 let score=0,matched=0,primary=0,fuzzy=false;
 for(const term of tokens){let value=0,strong=0,wasFuzzy=false;for(let i=0;i<d.fields.length;i++){const m=matchTerm(term,d.fields[i],i<2);if(m*weights[i]>value){value=m*weights[i];strong=i<3?1:0;wasFuzzy=m===.4;}}if(value){matched++;primary+=strong;score+=value;fuzzy||=wasFuzzy;}}
 const coverage=matched/tokens.length;if(coverage<1&&(tokens.length<5||coverage<.8||primary<2))continue;if(!matched)continue;
 const subject=tokens.filter(t=>!/^\d+$/.test(t));if(subject.length&&subject.every(t=>matchTerm(t,d.fields[0],false)>0))score+=110;
 if(q===d.title)score+=600;else if(d.title.startsWith(q))score+=160;else if(d.title.includes(q))score+=120;
 if(groups.includes(d.group))score+=170;else if(groups.length)score-=35;
 score+=primary*12;score-=d.depth*6;if(d.depth===1)score+=15;if(years.length&&d.years.length)score+=30;
 if(tokens.length===1&&years.length&&p.path==='/kalenteri/'+years[0]+'/')score+=300;
 if(tokens.length===1&&tokens[0].length<=3&&POPULAR_SEARCHES.some(s=>s.path===p.path))score+=200;
 if(p.locale==='sv'&&!/\b(svenska|swedish)\b/.test(q))score-=45;
 if(coverage<1)score-=80;if(fuzzy)score-=20;scores.push({p,score,relaxed:coverage<1,fuzzy});
 }
 scores.sort((a,b)=>b.score-a.score||a.p.path.localeCompare(b.p.path,'fi'));
 const seen=new Set(),unique=scores.filter(s=>{if(seen.has(s.p.path))return false;seen.add(s.p.path);return true;});
 return {items:unique.slice(0,Math.max(1,Math.min(1500,limit))).map(s=>s.p),total:unique.length,relaxed:unique[0]?.relaxed||false,fuzzy:unique[0]?.fuzzy||false};
}
export function searchPages(pages,query,limit=8){return searchCatalog(pages,query,{limit}).items;}
