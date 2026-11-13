import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {parseHead} from './audit-social.mjs';
import {ICO_SIZES, PNG_SIZES} from '../src/site-icons.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PNG_SIGNATURE = Buffer.from([137,80,78,71,13,10,26,10]);
const EXPECTED_LINKS = [
  {rel:'icon',href:'/favicon.ico',type:'image/x-icon',sizes:ICO_SIZES.map(n=>`${n}x${n}`).join(' ')},
  {rel:'icon',href:'/assets/icon-96.png',type:'image/png',sizes:'96x96'},
  {rel:'icon',href:'/assets/icon.svg',type:'image/svg+xml',sizes:'any'},
  {rel:'apple-touch-icon',href:'/assets/icon-180.png',sizes:'180x180'},
  {rel:'manifest',href:'/site.webmanifest'}
];

// Decode the actual container, including the ICO convention that zero means 256 px.
export async function inspectICO(bytes) {
  if(bytes.length<6||bytes.readUInt16LE(0)!==0||bytes.readUInt16LE(2)!==1)throw Error('Invalid ICO header');
  const count=bytes.readUInt16LE(4),directoryEnd=6+16*count;
  if(!count||bytes.length<directoryEnd)throw Error('Incomplete ICO directory');
  let offset=directoryEnd;
  const entries=[];
  for(let i=0;i<count;i++){
    const at=6+i*16,width=bytes[at]||256,height=bytes[at+1]||256;
    const length=bytes.readUInt32LE(at+8),start=bytes.readUInt32LE(at+12);
    if(start!==offset||!length||start+length>bytes.length)throw Error('Invalid ICO image range');
    if(bytes[at+3]!==0||bytes.readUInt16LE(at+4)!==1||bytes.readUInt16LE(at+6)!==32)throw Error('Invalid ICO image format');
    const image=bytes.subarray(start,start+length);
    if(!image.subarray(0,8).equals(PNG_SIGNATURE))throw Error('ICO entry is not a PNG');
    const meta=await sharp(image).metadata();
    if(meta.format!=='png'||meta.width!==width||meta.height!==height||width!==height)throw Error('ICO directory differs from image dimensions');
    entries.push({width,height,bytes:length,offset:start});
    offset=start+length;
  }
  if(offset!==bytes.length)throw Error('Unexpected trailing ICO bytes');
  return entries;
}

function globMatch(pattern,value){
  const anchored=pattern.endsWith('$'),body=anchored?pattern.slice(0,-1):pattern;
  const expression=body.split('*').map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*');
  return new RegExp('^'+expression+(anchored?'$':'')).test(value);
}

export function crawlerAllowed(robots,url,agent){
  const groups=[];let group=null,hasRules=false;
  for(const raw of robots.split(/\r?\n/)){
    const line=raw.replace(/#.*/,'').trim(),match=line.match(/^([^:]+):\s*(.*)$/);
    if(!match)continue;
    const key=match[1].trim().toLowerCase(),value=match[2].trim();
    if(key==='user-agent'){
      if(!group||hasRules){group={agents:[],rules:[]};groups.push(group);hasRules=false;}
      group.agents.push(value.toLowerCase());
    }else if(group&&(key==='allow'||key==='disallow')){
      group.rules.push({allow:key==='allow',value});hasRules=true;
    }
  }
  const agentName=agent.toLowerCase();
  const score=group=>Math.max(-1,...group.agents.map(name=>name==='*'?0:agentName.includes(name)?name.length:-1));
  const best=Math.max(-1,...groups.map(score));
  if(best<0)return true;
  const rules=groups.filter(group=>score(group)===best).flatMap(group=>group.rules).filter(rule=>rule.value&&globMatch(rule.value,url));
  rules.sort((a,b)=>b.value.length-a.value.length||Number(b.allow)-Number(a.allow));
  return rules[0]?.allow??true;
}

function iconNoindexRules(headers,url){
  let pattern='';const matches=[];
  for(const line of headers.split(/\r?\n/)){
    if(/^\S/.test(line)&&!line.startsWith('#'))pattern=line.trim();
    else if(pattern&&line.trim()&&globMatch(pattern+'$',url)){
      const field=line.trim();
      if(/^x-robots-tag\s*:/i.test(field)&&/\b(?:noindex|none)\b/i.test(field))matches.push({pattern,value:field});
    }
  }
  return matches;
}

export async function auditFavicons(root=ROOT){
  const out=path.join(root,'dist'),failures=[],assets=[],pages=JSON.parse(await fs.readFile(path.join(root,'reports/pages.json'),'utf8'));
  let checks=0;
  const check=(pass,route,name,details)=>{checks++;if(!pass)failures.push({route,check:name,...(details===undefined?{}:{details})});return Boolean(pass);};
  const read=async url=>{
    try{return await fs.readFile(path.join(out,url));}
    catch(error){check(false,url,'Asset exists',error.code);return null;}
  };
  const expectedPages=[...pages,{path:'/404/'}];
  for(const page of expectedPages){
    const html=await fs.readFile(path.join(out,page.path==='/404/'?'404.html':page.path+'/index.html'),'utf8'),head=parseHead(html);
    if(!check(Boolean(head),page.path,'HTML head exists'))continue;
    const icons=head.links.filter(link=>link.rel==='icon');
    check(icons.length===3,page.path,'Three explicit favicon formats');
    check(head.links.filter(link=>link.rel==='apple-touch-icon').length===1,page.path,'One Apple touch icon');
    check(head.links.filter(link=>link.rel==='manifest').length===1,page.path,'One application manifest');
    for(const expected of EXPECTED_LINKS){
      const links=head.links.filter(link=>link.rel===expected.rel&&link.href===expected.href);
      check(links.length===1&&Object.entries(expected).every(([key,value])=>links[0]?.[key]===value),page.path,'Correct '+expected.href+' declaration');
    }
  }
  for(const size of PNG_SIZES){
    const url=`/assets/icon-${size}.png`,bytes=await read(url);if(!bytes)continue;
    try{
      const meta=await sharp(bytes).metadata();
      check(bytes.subarray(0,8).equals(PNG_SIGNATURE)&&meta.format==='png'&&meta.width===size&&meta.height===size,url,'Square PNG with declared dimensions');
      assets.push({url,width:meta.width,height:meta.height,bytes:bytes.length,type:'image/png'});
    }catch(error){check(false,url,'Decodable PNG',error.message);}
  }
  const svg=await read('/assets/icon.svg');
  if(svg){
    const text=svg.toString('utf8');
    check(/<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(text),'/assets/icon.svg','SVG namespace');
    check(!/<(?:image|script|foreignObject)\b|(?:href|src)\s*=|@import|url\(https?:/i.test(text),'/assets/icon.svg','Self-contained vector');
    try{const meta=await sharp(svg).metadata();check(meta.width===meta.height&&meta.width>=96,'/assets/icon.svg','Square scalable SVG');assets.push({url:'/assets/icon.svg',width:meta.width,height:meta.height,bytes:svg.length,type:'image/svg+xml'});}catch(error){check(false,'/assets/icon.svg','Decodable SVG',error.message);}
  }
  const ico=await read('/favicon.ico');
  if(ico)try{
    const entries=await inspectICO(ico);
    check(JSON.stringify(entries.map(entry=>entry.width))===JSON.stringify(ICO_SIZES),'/favicon.ico','Complete ICO resolution set');
    assets.push({url:'/favicon.ico',bytes:ico.length,type:'image/x-icon',entries});
  }catch(error){check(false,'/favicon.ico','Valid ICO container',error.message);}
  const manifestBytes=await read('/site.webmanifest');
  if(manifestBytes)try{
    const manifest=JSON.parse(manifestBytes.toString('utf8'));
    check(manifest.id==='/'&&manifest.start_url==='/'&&manifest.scope==='/'&&manifest.name==='Kalenteri365'&&manifest.short_name==='Kalenteri365'&&manifest.lang==='fi-FI','/site.webmanifest','Correct site identity and scope');
    check(manifest.display==='browser'&&manifest.theme_color==='#002f6c'&&manifest.background_color==='#ffffff','/site.webmanifest','Browser presentation and Finnish theme');
    check(Array.isArray(manifest.icons)&&manifest.icons.length===2,'/site.webmanifest','Two application icon sizes');
    for(const size of [192,512]){
      const entries=manifest.icons?.filter(icon=>icon.sizes===`${size}x${size}`)||[];
      check(entries.length===1&&entries[0].src===`/assets/icon-${size}.png`&&entries[0].type==='image/png'&&entries[0].purpose==='any','/site.webmanifest','Valid '+size+'px application icon');
    }
  }catch(error){check(false,'/site.webmanifest','Valid JSON manifest',error.message);}
  const robots=(await read('/robots.txt'))?.toString('utf8')||'',headers=(await read('/_headers'))?.toString('utf8')||'';
  for(const url of ['/',...EXPECTED_LINKS.map(link=>link.href),...PNG_SIZES.map(size=>`/assets/icon-${size}.png`)]){
    for(const agent of ['Googlebot','Googlebot-Image','bingbot'])check(crawlerAllowed(robots,url,agent),url,'Crawlable by '+agent);
    check(iconNoindexRules(headers,url).length===0,url,'No applicable noindex response header');
  }
  const report={pages:expectedPages.length,assets,checks,failures};
  await fs.writeFile(path.join(root,'reports/favicon-audit.json'),JSON.stringify(report,null,2)+'\n');
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const {assets,...summary}=await auditFavicons();
  console.log(JSON.stringify({...summary,assets:assets.length,report:'reports/favicon-audit.json'},null,2));
  if(summary.failures.length)process.exitCode=1;
}
