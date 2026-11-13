import holidayStories from '../data/holiday-stories.json' with {type:'json'};
// Only literal, reviewed topic names in explanatory paragraphs become links.
// Navigation, controls, existing anchors and stored personal text are untouched.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topics = [
  ['viikkonumerot', ['viikkonumerotaulukko','viikkonumeron','viikkonumerot','ISO-viikkonumero']],
  ['viikkokalenteri', ['viikkosuunnitelmassa','viikkosuunnitelma','viikkokalenterin','viikkokalenteri']],
  ['perhekalenteri', ['perhekalenteriin','perhekalenterissa','perhekalenterin','perhekalenteri']],
  ['koulujen-lomat', ['koulujen loma-ajat','koulujen lomat','koululomat']],
  ['yliopistojen-kalenterit', ['yliopistojen opetusperiodit','yliopistojen kalenterit']],
  ['lukujarjestys', ['lukujärjestykseen','lukujärjestyksessä','lukujärjestyksen','lukujärjestys']],
  ['opiskelukalenteri', ['opiskelukalenteriin','opiskelukalenteri']],
  ['paivasuunnittelija', ['päiväsuunnittelijassa','päiväsuunnittelija']],
  ['tyopaivalaskuri', ['työpäivälaskurissa','työpäivälaskuri','työpäivälaskuria']],
  ['tyovuorosuunnittelija', ['työvuorosuunnittelijassa','työvuorosuunnittelija','vuorosuunnittelijassa']],
  ['paivamaaralaskuri', ['päivämäärälaskurilla','päivämäärälaskuri']],
  ['lomasuunnittelija', ['lomasuunnittelijassa','lomasuunnittelija']],
  ['pitkat-viikonloput', ['pitkien viikonloppujen','pitkät viikonloput']],
  ['luo-kalenteri', ['oman kalenterin muokkaimessa','oman kalenterin muokkain','kalenterin muokkaimessa']],
  ['pdf-kalenteri', ['tulostettavat kalenterit','tulostettavat pohjat','PDF-pohjat']],
  ['tyhja-kalenteri', ['tyhjä kalenteripohja','tyhjät kalenterit']],
  ['kuukalenteri', ['kuukalenterissa','kuukalenterin','kuukalenteri']],
  ['kuun-vaiheet', ['Kuun neljä päävaihetta','Kuun päävaiheet','Kuun vaiheet']],
  ['kuun-nousu-ja-lasku', ['Kuun nousu- ja laskuajat','Kuun nousu- ja laskuaikoja']],
  ['auringonnousu-ja-lasku', ['auringonnousua ja -laskua','auringonnousun ja -laskun','auringonnousu ja -lasku']],
  ['paivan-pituus', ['päivän pituuden laskuri','päivän pituutta','päivän pituus']],
  ['vuodenajat', ['tähtitieteelliset vuodenajat','termiset vuodenajat']],
  ['kellonsiirto', ['kesä- ja normaaliaikaan','kellonsiirron','kellonsiirto']],
  ['liputuspaivat', ['viralliset liputuspäivät','liputuspäivien','liputuspäivät']],
  ['juhlapyhat', ['Suomen pyhäpäivät','Suomen juhlapäivät','yleiset pyhäpäivät']],
  ['kylvokalenteri', ['kylvövälin laskuria','kylvökalenterissa','kylvökalenteri']],
  ['horoskooppi', ['päivän horoskooppi','nousevan merkin laskuri']],
  ['horoskooppimerkki', ['merkkilaskuri','horoskooppimerkkisi']],
  ['tietosuoja', ['paikallisten tietojen hallinta','tietosuojaseloste']],
];
const official = [
  ['https://almanakka.helsinki.fi/', ['Helsingin yliopiston almanakkatoimisto']],
  ['https://intermin.fi/suomen-lippu/liputuspaivat', ['Sisäministeriön liputusohje']],
  ['https://www.ilmatieteenlaitos.fi/termiset-vuodenajat', ['Ilmatieteen laitoksen termiset vuodenajat']],
  ['https://github.com/cosinekitty/astronomy', ['Astronomy Engine 2.1.19','Astronomy Engine']],
  ['https://www.met.no/', ['MET Norway']],
];
const educationBases = new Set(['koulujen-lomat','koulukalenteri','opiskelukalenteri','lukujarjestys','hakukalenteri','yliopistojen-kalenterit','ylioppilaskirjoitukset']);
function officialRules(path) {
  const [base, topic] = path.split('/').filter(Boolean);
  const rules = official.map(([href, phrases]) => {
    if (href === 'https://almanakka.helsinki.fi/' && ['nimipaivat','usein-kysyttya'].includes(base)) href = 'https://almanakka.helsinki.fi/fi/nimipaivat';
    if (href === 'https://www.met.no/' && base === 'lahteet') href = 'https://api.met.no/weatherapi/locationforecast/2.0/documentation';
    return [href, phrases];
  });
  const topicSource = base === 'juhlapyhat' ? holidayStories[topic]?.sources.find(source => source.url.startsWith('https://www.oph.fi/'))?.url : null;
  const educationSource = educationBases.has(base) ? 'https://www.oph.fi/fi/koulutus-ja-tutkinnot/tyoajat' : null;
  if (topicSource || educationSource) rules.push([topicSource || educationSource, ['Opetushallitus','Opetushallituksen']]);
  return rules;
}
const periodBases=new Set(['kalenteri','kuukausikalenteri','pdf-kalenteri','kuukalenteri','juhlapyhat','liputuspaivat','tyopaivat']);
const cityBases=new Set(['auringonnousu-ja-lasku','kuun-nousu-ja-lasku','paivan-pituus']);
const skippedBases=new Set(['blogi','tietosuoja','evasteet','kayttoehdot','valokuvat-ja-lisenssit','sivukartta','haku']);

export function contextualTarget(base, currentPath){
  const parts=currentPath.split('/').filter(Boolean);
  if(cityBases.has(parts[0])&&cityBases.has(base)&&parts[1])return '/'+[base,...parts.slice(1)].join('/')+'/';
  if(periodBases.has(base)&&/^20(?:27|28|29|30)$/.test(parts[1]||'')){
    const month=parts[2]&&!parts[2].startsWith('viikko-')?parts[2]:null;
    return '/'+[base,parts[1],...(month?[month]:[])].join('/')+'/';
  }
  return '/'+base+'/';
}
export const editorialAnchor=(href,text)=>`<a class="editorial-link" data-editorial-link href="${escape(href)}">${escape(text)}</a>`;
const normalPath=value=>value.split(/[?#]/)[0];
const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

export function linkEditorialParagraphs(html,{path,locale='fi'}={}){
  if(locale!=='fi'||path==='/'||skippedBases.has(path?.split('/')[1]))return html;
  let stack=[],paragraph=null,internal=0,external=0;
  const used=new Set();
  const rules=[...topics.flatMap(([base,phrases])=>phrases.map(text=>({text,href:contextualTarget(base,path),external:false}))),...officialRules(path).flatMap(([href,phrases])=>phrases.map(text=>({text,href,external:true})))];
  const tokens=html.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g)||[];
  return tokens.map(token=>{
    if(token.startsWith('<')){
      const closing=token.match(/^<\/([\w-]+)/),opening=token.match(/^<([\w-]+)/);
      if(closing){const i=stack.findLastIndex(n=>n.tag===closing[1].toLowerCase());if(i>=0)stack.length=i;if(closing[1].toLowerCase()==='p')paragraph=null;}
      else if(opening){
        const tag=opening[1].toLowerCase();
        if(tag==='p')paragraph={linked:false,eligible:!/(?:class="[^"]*\b(?:small|eyebrow|tag|article-meta)\b|role="status")/.test(token)};
        if(tag==='a'&&paragraph){paragraph.linked=true;const href=token.match(/\bhref="([^"]*)"/)?.[1];if(href)used.add(href);if(/data-editorial-link/.test(token))href?.startsWith('http')?external++:internal++;}
        if(!voids.has(tag)&&!token.endsWith('/>'))stack.push({tag,skip:/data-editorial-skip/.test(token)});
      }
      return token;
    }
    if(!paragraph?.eligible||paragraph.linked||stack.some(n=>n.skip||['a','button','form','nav','script','style','figure','summary','label','option'].includes(n.tag))||token.trim().length<35)return token;
    const lower=token.toLocaleLowerCase('fi');
    const options=[];
    for(const r of rules){
      if(used.has(r.href)||normalPath(r.href)===path||(r.external?external>=2:internal>=4))continue;
      const phrase=r.text.toLocaleLowerCase('fi');let at=lower.indexOf(phrase);
      while(at>=0){const before=token[at-1]||'',after=token[at+phrase.length]||'';if(!/[\p{L}\p{N}]/u.test(before)&&!/[\p{L}\p{N}]/u.test(after)){options.push({...r,at,length:phrase.length});break;}at=lower.indexOf(phrase,at+1);}
    }
    options.sort((a,b)=>a.at-b.at||b.length-a.length);const match=options[0];if(!match)return token;
    used.add(match.href);paragraph.linked=true;match.external?external++:internal++;
    // Text nodes are already escaped; preserve their exact original visible copy.
    return token.slice(0,match.at)+`<a class="editorial-link" data-editorial-link href="${escape(match.href)}">`+token.slice(match.at,match.at+match.length)+'</a>'+token.slice(match.at+match.length);
  }).join('');
}

export function annotatedParagraph(text,links=[]){
  let cursor=0,result='';
  const positioned=links.map(l=>({...l,at:text.indexOf(l.text)})).sort((a,b)=>a.at-b.at);
  for(const l of positioned){if(l.at<cursor||l.at<0)throw Error('Editorial anchor does not match its paragraph: '+l.text);result+=escape(text.slice(cursor,l.at))+editorialAnchor(l.href,l.text);cursor=l.at+l.text.length;}
  return result+escape(text.slice(cursor));
}
