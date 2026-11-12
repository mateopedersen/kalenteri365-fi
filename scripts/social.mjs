import fs from 'node:fs/promises';
import photos from '../data/photo-credits.json' with {type:'json'};
import guides from '../data/guides.json' with {type:'json'};
const ROOT=new URL('../',import.meta.url);
const RENDERER_HASH=createHash('sha256').update(await fs.readFile(new URL(import.meta.url))).digest('hex');
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import fontkit from '@pdf-lib/fontkit';
import {TOOL_ART,tools} from '../src/ui.mjs';
import {SLUGS} from '../src/calendar.mjs';
const font=fontkit.create(await fs.readFile(new URL('../assets/fonts/Lato-Bold.ttf',import.meta.url)));
const normal=fontkit.create(await fs.readFile(new URL('../assets/fonts/Lato-Regular.ttf',import.meta.url)));
function width(text,size,bold=true){const f=bold?font:normal;return f.layout(text).glyphs.reduce((a,g)=>a+g.advanceWidth,0)*size/f.unitsPerEm;}
function text(s,x,y,size,color,bold=true){const f=bold?font:normal,run=f.layout(s);let at=0,p=[];for(let i=0;i<run.glyphs.length;i++){const pos=run.positions[i];p.push(`<path d="${run.glyphs[i].path.toSVG()}" transform="translate(${at+pos.xOffset} ${pos.yOffset})"/>`);at+=pos.xAdvance;}return `<g fill="${color}" transform="translate(${x} ${y}) scale(${size/f.unitsPerEm} ${-size/f.unitsPerEm})">${p.join('')}</g>`;}
function lines(s,size,max,limit=4){let out=[],line='';for(const word of s.split(/\s+/)){const next=(line?line+' ':'')+word;if(width(next,size)>max&&line){out.push(line);line=word;}else line=next;}if(line)out.push(line);if(out.length>limit)return lines(s,size-3,max,limit);return {lines:out,size};}
function outlineLabels(svg){
 const result=svg.replace(/<text\b([^>]*)>([^<]*)<\/text>/g,(_,attributes,label)=>{
  const a=Object.fromEntries([...attributes.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
  label=label.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&apos;',"'");
  const bold=a['font-weight']==='bold'||Number(a['font-weight'])>=600,f=bold?font:normal,size=parseFloat(a['font-size']||16);
  for(const char of label)if(!f.hasGlyphForCodePoint(char.codePointAt(0)))throw Error('Missing social icon glyph: '+char);
  let x=parseFloat(a.x||0),y=parseFloat(a.y||0),w=width(label,size,bold);
  if(a['text-anchor']==='middle')x-=w/2;else if(a['text-anchor']==='end')x-=w;
  if(a['dominant-baseline']==='middle')y+=(f.xHeight||f.ascent*.5)/f.unitsPerEm*size/2;
  const extra=['opacity','filter','clip-path','stroke','stroke-width'].filter(k=>a[k]).map(k=>` ${k}="${a[k]}"`).join('');
  return `<g${a.transform?' transform="'+a.transform+'"':''}${extra}>${text(label,x,y,size,a.fill||'#000',bold)}</g>`;
 });
 if(/<text\b/.test(result))throw Error('Unoutlined nested text in social artwork');
 return result;
}
export async function cover(out,route,title,desc){
 const parts=route.split('/').filter(Boolean),base=parts[0],m=SLUGS.indexOf(parts[2]),name=base==='horoskooppi'&&parts[1]?'zodiac-'+parts[1]:m>=0?'month-'+(m+1):TOOL_ART[base]||'calendar',svg=outlineLabels(await fs.readFile(out+'/art/'+name+'.svg','utf8'));
 const photoId=base==='juhlapyhat'?photos.find(p=>p.applicableSlugs?.includes(parts[1]))?.id:base==='yliopistojen-kalenterit'?parts[1]:['auringonnousu-ja-lasku','kuun-nousu-ja-lasku','paivan-pituus','koulujen-lomat'].includes(base)?parts[1]:base==='kylvokalenteri'&&parts[1]?'crop-'+(parts[1]==='avomaankurkku'?'kurkku':parts[1]):base==='oppaat'?guides.find(g=>g.slug===parts[1])?.photo:base==='kuukalenteri'?'moon-full':null;
 const photo=photos.find(p=>p.id===photoId),photoBytes=photo?await fs.readFile(new URL(photo.src.slice(1),ROOT)):null;
 const hash=createHash('sha256').update(RENDERER_HASH).update(route+title+desc+svg).update(photoBytes||'').update(photo?JSON.stringify({author:photo.author,license:photo.license,source:photo.source}):'').digest('hex').slice(0,20),src='/assets/social/'+hash+'.jpg',file=out+'/social/'+hash+'.jpg';
 await fs.mkdir(out+'/social',{recursive:true});try{await fs.access(file);return {src,alt:title+' | Kalenteri365',width:1200,height:630};}catch{}
 const headline=lines(route==='/'?'Suomen päivät. Sinun suunnitelmasi.':title,54,690,4),group=tools.find(t=>t[0]===base)?.[4]||'Suomen kalenteri';
 const rendered=await sharp(photoBytes||Buffer.from(svg)).resize(350,285,{fit:'contain',background:'#e5efef00'}).png().toBuffer();
 const credit=photo?lines(photo.author+' · '+photo.license,12,335,3):null;
 const art=`<image x="790" y="180" width="350" height="285" href="data:image/png;base64,${rendered.toString('base64')}"/>`+(credit?credit.lines.map((s,i)=>text(s,795,488+i*15,credit.size,'#466d7b',false)).join(''):'');

 const content=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#f7fbfa"/><stop offset="1" stop-color="#e5efef"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><path d="M820 0h380v630H975Q745 450 820 0Z" fill="#dae9e9"/><path d="M0 0h1200v11H0Z" fill="#164a66"/><path d="M1025 0v115M965 62h235" stroke="#164a66" stroke-width="24" opacity=".14"/>${text('Kalenteri365',62,83,34,'#184c68')}${text('SUOMI',1035,83,19,'#184c68')}${text(group.toLocaleUpperCase('fi'),65,173,17,'#477883')}${headline.lines.map((t,i)=>text(t,62,252+i*(headline.size+12),headline.size,'#173e55')).join('')}${art}<path d="M62 533h1074" stroke="#c6d9de"/>${text('Kalenterit, juhlapäivät ja oman arjen työkalut',65,578,21,'#466d7b',false)}${text('kalenteri365.fi',949,578,21,'#184c68')}</svg>`;
 await sharp(Buffer.from(content)).jpeg({quality:85,mozjpeg:true}).toFile(file);
 return {src,alt:title+' | Kalenteri365',width:1200,height:630};
}
export async function favicons(out){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="23" fill="#164966"/><rect x="18" y="26" width="60" height="54" rx="7" fill="#f2f7f4"/><path d="M18 42h60" stroke="#9cc5d5" stroke-width="4"/><path d="M33 18v15m30-15v15" stroke="#f5fbff" stroke-width="7" stroke-linecap="round"/><path d="M42 49v24M30 61h37" stroke="#216a95" stroke-width="8"/></svg>`;await fs.writeFile(out+'/icon.svg',svg);const sizes=[32,48,96,180,192,512];for(const size of sizes)await sharp(Buffer.from(svg)).resize(size,size).png().toFile(out+'/icon-'+size+'.png');const images=await Promise.all([16,32,48,96].map(n=>sharp(Buffer.from(svg)).resize(n,n).png().toBuffer())),head=Buffer.alloc(6+16*images.length);head.writeUInt16LE(1,2);head.writeUInt16LE(images.length,4);let offset=head.length;images.forEach((b,i)=>{let k=6+i*16;head[k]=[16,32,48,96][i];head[k+1]=head[k];head.writeUInt16LE(1,k+4);head.writeUInt16LE(32,k+6);head.writeUInt32LE(b.length,k+8);head.writeUInt32LE(offset,k+12);offset+=b.length;});await fs.writeFile(out+'/../favicon.ico',Buffer.concat([head,...images]));}
