import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import photos from '../data/photo-credits.json' with {type:'json'};
import {socialModel} from './social-model.mjs';
import {renderSocial,sourceBytes} from './social-render.mjs';
const RENDERER_HASH=createHash('sha256');
for(const file of ['social.mjs','social-model.mjs','social-render.mjs','social-type.mjs','social-scenes.mjs'])RENDERER_HASH.update(await fs.readFile(new URL(file,import.meta.url)));
const version=RENDERER_HASH.digest('hex'),records=new Map();
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function cover(out,route,title,description,context={}){
 const model=socialModel(route,title,description,context);
 if(['lunar','moonrise'].includes(model.family)&&!model.photos.some(p=>p.id==='moon-full'))model.photos.push(photos.find(p=>p.id==='moon-full'));
 const rendered=await renderSocial(model,out);
 const hash=sha(version+rendered.svg).slice(0,20),slug=route==='/'?'etusivu':route.slice(1,-1).replaceAll('/','-');
 const src='/assets/social/'+slug+'-'+hash+'.jpg',file=path.join(out,'social',path.basename(src));
 await fs.mkdir(path.dirname(file),{recursive:true});
 let bytes;try{bytes=await fs.readFile(file);}catch{bytes=await sharp(Buffer.from(rendered.svg),{density:144,limitInputPixels:24e6}).resize(1200,630).jpeg({quality:88,mozjpeg:true,chromaSubsampling:'4:4:4'}).toBuffer();await fs.writeFile(file,bytes);}
 const sources=[];for(const p of model.photos){const checksum=sha(await sourceBytes(p.src));if(p.sha256&&p.sha256!==checksum)throw Error('Changed OG source needs review: '+p.id);sources.push({id:p.id,src:p.src,alt:p.alt,sha256:checksum,author:p.author,license:p.license,licenseUrl:p.licenseUrl,source:p.source});}
 const renderAssets=[];for(const input of model.renderAssets||[]){const bytes=await fs.readFile(input.file);renderAssets.push({src:path.posix.normalize('/assets/'+path.relative(out,input.file).split(path.sep).join('/')),role:input.role,sha256:sha(bytes)});}
 const record={renderAssets,route,src,alt:model.alt,width:1200,height:630,type:'image/jpeg',bytes:bytes.length,sha256:sha(bytes),family:model.family,base:model.base,locale:model.locale,year:model.year,month:model.month,week:model.week,city:model.city?.[0]||null,sourceIds:sources.map(s=>s.id),sources,textLayout:rendered.textLayout,renderer:version};
 records.set(route,record);
 return {...record,creditText:['Kalenteri365',...sources.map(p=>[p.author,p.license].filter(Boolean).join(' · '))].join('; ')};
}
export async function writeSocialManifest(out){
 const list=[...records.values()];
 await fs.writeFile(path.join(out,'social','manifest.json'),JSON.stringify({version,pages:list.length,images:list},null,2));
 return list;
}
export async function favicons(out){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="23" fill="#002f6c"/><rect x="18" y="26" width="60" height="54" rx="7" fill="#f2f7f4"/><path d="M18 42h60" stroke="#9cc5d5" stroke-width="4"/><path d="M33 18v15m30-15v15" stroke="#f5fbff" stroke-width="7" stroke-linecap="round"/><path d="M42 49v24M30 61h37" stroke="#0046a8" stroke-width="8"/></svg>`;await fs.writeFile(out+'/icon.svg',svg);const sizes=[32,48,96,180,192,512];for(const size of sizes)await sharp(Buffer.from(svg)).resize(size,size).png().toFile(out+'/icon-'+size+'.png');const images=await Promise.all([16,32,48,96].map(n=>sharp(Buffer.from(svg)).resize(n,n).png().toBuffer())),head=Buffer.alloc(6+16*images.length);head.writeUInt16LE(1,2);head.writeUInt16LE(images.length,4);let offset=head.length;images.forEach((b,i)=>{let k=6+i*16;head[k]=[16,32,48,96][i];head[k+1]=head[k];head.writeUInt16LE(1,k+4);head.writeUInt16LE(32,k+6);head.writeUInt32LE(b.length,k+8);head.writeUInt32LE(offset,k+12);offset+=b.length;});await fs.writeFile(out+'/../favicon.ico',Buffer.concat([head,...images]));}
