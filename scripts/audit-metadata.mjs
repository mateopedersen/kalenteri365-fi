import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import overrides from '../data/seo-pages.json' with {type:'json'};
import {pageMetadata,brandedTitle} from '../src/metadata.mjs';
import {parseHead} from './audit-social.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
export async function auditMetadata(directory=root){
  const pages=JSON.parse(await fs.readFile(path.join(directory,'reports/pages.json'),'utf8'));
  const expected=[...pages,{path:'/404/',title:'Sivua ei löytynyt',description:'Etsimääsi osoitetta ei löytynyt.',locale:'fi'}];
  const titles=new Map(),descriptions=new Map(),failures=[],results=[];
  let checks=0;
  const check=(pass,route,name)=>{checks++;if(!pass)failures.push({route,check:name});};
  for(const p of expected){
    const html=await fs.readFile(path.join(directory,'dist',p.path==='/404/'?'404.html':p.path+'/index.html'),'utf8');
    const head=parseHead(html),meta=pageMetadata(p.path,p.title,p.displayDescription||p.description,p);
    const title=brandedTitle(meta.title),description=meta.description;
    check(Boolean(head),p.path,'HTML head exists');
    if(!head)continue;
    check((html.match(/<head\b/gi)||[]).length===1,p.path,'One HTML head');
    check((html.split('</head>')[0].match(/<title\b/gi)||[]).length===1,p.path,'One HTML title');
    check(head.title===title,p.path,'Page-specific SEO title');
    check((head.title.match(/\|\s*Kalenteri365(?:\.fi)?/g)||[]).length===1&&head.title.endsWith(' | Kalenteri365'),p.path,'Single pipe brand suffix');
    check(!/\s[–—-]\s/.test(head.title),p.path,'No dash separators');
    for(const value of [head.title,description]){
      check(!/[\u0000-\u001f\u007f\ufffd]/u.test(value),p.path,'Clean metadata encoding');
      check(!/\b(?:undefined|null|NaN|TODO|lorem ipsum)\b/i.test(value),p.path,'No placeholder metadata');
      check(value===value.normalize('NFC').replace(/\s+/gu,' ').trim(),p.path,'Normalized metadata spacing');
      check(!/\d{1,2}\.\d{1,2}\.\./.test(value),p.path,'Date has one sentence-ending dot');
    }
    for(const [key,value]of [['description',description],['og:title',title],['og:description',description],['twitter:title',title],['twitter:description',description]]){
      const values=head.meta.get(key)||[];
      check(values.length===1&&values[0]===value,p.path,key+' matches page metadata');
    }
    for(const [label,value,seen]of [['title',head.title,titles],['description',description,descriptions]]){
      const normalized=value.normalize('NFC').replace(/\s+/gu,' ').trim().toLocaleLowerCase('fi-FI');
      check(Boolean(normalized),p.path,label+' is present');
      check(!seen.has(normalized),p.path,label+' is unique');
      seen.set(normalized,p.path);
    }
    check(head.links.filter(l=>l.rel==='canonical'&&l.href==='https://kalenteri365.fi'+p.path).length===1,p.path,'Self canonical');
    for(const json of head.json){
      const schema=JSON.parse(json);
      if(schema['@type']==='WebPage'||schema['@type']==='WebSite'||schema['@type']==='CollectionPage'){
        check(schema.name===title&&schema.description===description,p.path,'Structured page metadata matches');
      }
    }
    results.push({path:p.path,locale:p.locale||'fi',title,description,titleLength:title.length,descriptionLength:description.length});
  }
  const paths=new Set(pages.map(p=>p.path));
  for(const route of Object.keys(overrides))check(paths.has(route),route,'Override points to generated page');
  const report={pages:results.length,indexable:pages.filter(p=>p.indexable).length,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,checks,failures,results};
  await fs.writeFile(path.join(directory,'reports/metadata-audit.json'),JSON.stringify(report,null,2)+'\n');
  return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const {results,...summary}=await auditMetadata();
  console.log(JSON.stringify({...summary,failures:summary.failures.length,report:'reports/metadata-audit.json'},null,2));
  if(summary.failures.length)process.exitCode=1;
}
