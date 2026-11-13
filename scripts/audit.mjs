import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {PDFDocument} from 'pdf-lib';import sharp from 'sharp';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),OUT=path.join(ROOT,'dist'),pages=JSON.parse(await fs.readFile(path.join(ROOT,'reports/pages.json'),'utf8'));let failures=[],titles=new Set(),fullTitles=new Set(),checks=0;
const exists=async p=>{try{await fs.access(p);return true;}catch{return false;}};
function exifDpi(meta){if(meta.density)return meta.density;let b=meta.exif;if(!b)return null;let start=b.subarray(0,6).toString()==='Exif\0\0'?6:0,le=b.subarray(start,start+2).toString()==='II',u16=p=>le?b.readUInt16LE(p):b.readUInt16BE(p),u32=p=>le?b.readUInt32LE(p):b.readUInt32BE(p),ifd=start+u32(start+4),n=u16(ifd);for(let i=0;i<n;i++){let p=ifd+2+i*12;if(u16(p)===0x11a){let at=start+u32(p+8);return u32(at)/u32(at+4);}}return null;}
for(let p of pages){let f=path.join(OUT,p.path,'index.html'),s=await fs.readFile(f,'utf8');checks++;if(!s.includes('<html lang="'+(p.locale||'fi')+'">'))failures.push([p.path,'language']);if((s.match(/<h1[ >]/g)||[]).length!==1)failures.push([p.path,'one h1']);if(!s.includes(`href="https://kalenteri365.fi${p.path}"`))failures.push([p.path,'canonical']);if(titles.has(p.title))failures.push([p.path,'duplicate title']);titles.add(p.title);for(let match of s.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){let target=decodeURI(match[1].split('?')[0]),file=path.join(OUT,target);if(target.endsWith('/'))file=path.join(file,'index.html');if(!await exists(file))failures.push([p.path,'missing '+target]);}for(let match of s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){try{JSON.parse(match[1]);}catch{failures.push([p.path,'invalid structured data']);}}}
const exports=JSON.parse(await fs.readFile(path.join(ROOT,'reports/exports.json'),'utf8'));for(let e of exports){let base=path.join(OUT,'lataukset',e.stem),pdf=await PDFDocument.load(await fs.readFile(base+'.pdf'));checks++;if(pdf.getPageCount()!==1)failures.push([e.stem,'PDF page count']);let meta=await sharp(base+'.webp').metadata();if(Math.abs(exifDpi(meta)-600)>.01||!exifDpi(meta))failures.push([e.stem,'600 ppi']);const size=pdf.getPages()[0].getSize();if(Math.abs(meta.width/size.width*72-600)>1||Math.abs(meta.height/size.height*72-600)>1)failures.push([e.stem,`physical 600 dpi dimensions ${meta.width}x${meta.height}`]);if(!await exists(base+'-preview.webp'))failures.push([e.stem,'preview missing']);}
let extraExports=[];
for(const file of ['lunar-exports.json','planner-exports.json']){
 const records=JSON.parse(await fs.readFile(path.join(ROOT,'reports',file),'utf8'));
 for(const e of records){
  const base=path.join(OUT,'lataukset',e.stem),bytes=await fs.readFile(base+'.pdf'),pdf=await PDFDocument.load(bytes),meta=await sharp(base+'.webp').metadata();checks++;
  if(pdf.getPageCount()!==1)failures.push([e.stem,'PDF must be a single page']);
  if(meta.width!==e.width||meta.height!==e.height)failures.push([e.stem,'raster dimensions']);
  if(Math.abs(exifDpi(meta)-600)>.01||!exifDpi(meta))failures.push([e.stem,'600 dpi metadata']);
  const size=pdf.getPages()[0].getSize();
  if(Math.abs(meta.width/size.width*72-600)>1||Math.abs(meta.height/size.height*72-600)>1)failures.push([e.stem,'pixel size does not match 600 dpi paper size']);
  if(!await exists(base+'-preview.webp'))failures.push([e.stem,'missing preview']);
  if(bytes.length>25*1024*1024||(await fs.stat(base+'.webp')).size>25*1024*1024)failures.push([e.stem,'file exceeds hosting limit']);
 }
 extraExports.push(...records);
}
for(const p of pages){
 const html=await fs.readFile(path.join(OUT,p.path,'index.html'),'utf8');
 const fullTitle=html.match(/<title>([^<]*)<\/title>/)?.[1];if(fullTitles.has(fullTitle))failures.push([p.path,'duplicate full SEO title']);fullTitles.add(fullTitle);
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];if(canonical!=='https://kalenteri365.fi'+p.path)failures.push([p.path,'incorrect canonical target']);
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
  let data;try{data=JSON.parse(match[1]);}catch{continue;}
  for(const item of data.breadcrumb?.itemListElement||[]){const u=new URL(item.item);if(u.origin!=='https://kalenteri365.fi'||!pages.some(page=>page.path===u.pathname))failures.push([p.path,'breadcrumb target '+item.item]);}
  for(const image of data.image||[]){if(image['@type']!=='ImageObject'||!image.contentUrl||!image.creditText||!image.license)failures.push([p.path,'incomplete licensed image metadata']);else if(!await exists(path.join(OUT,new URL(image.contentUrl).pathname)))failures.push([p.path,'image schema target missing']);}
 }
 if(!/<title>[^<]+ \| Kalenteri365<\/title>/.test(html))failures.push([p.path,'branded title']);
 if(p.indexable&&/<meta name="robots" content="[^"]*noindex/.test(html))failures.push([p.path,'unexpected noindex']);
 if(!p.indexable&&!/<meta name="robots" content="noindex,follow"/.test(html))failures.push([p.path,'license noindex missing']);
 for(const img of html.matchAll(/<img\b[^>]*>/g))if(!/\balt="[^"]*"/.test(img[0]))failures.push([p.path,'image missing alt']);
 const og=html.match(/property="og:image" content="https:\/\/kalenteri365.fi([^"]+)"/);if(!og)failures.push([p.path,'OG missing']);else{const m=await sharp(path.join(OUT,og[1])).metadata();if(m.width!==1200||m.height!==630)failures.push([p.path,'OG dimensions']);}
}
const sitemap=await fs.readFile(path.join(OUT,'sitemap.xml'),'utf8');if((sitemap.match(/<loc>/g)||[]).length!==pages.filter(p=>p.indexable).length)failures.push(['sitemap','page count']);const report={at:new Date().toISOString(),pages:pages.length,pdf:exports.length+extraExports.length,webp:exports.length+extraExports.length,checks,failures};await fs.writeFile(path.join(ROOT,'reports/audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
