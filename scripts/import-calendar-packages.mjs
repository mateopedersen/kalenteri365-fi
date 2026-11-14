import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createReadStream,createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import {Readable} from 'node:stream';
import {spawn} from 'node:child_process';
import {createZstdDecompress,constants} from 'node:zlib';
import sharp from 'sharp';
import {packageManifest as manifest} from '../src/calendar-package-catalog.mjs';
const root=path.resolve(import.meta.dirname,'..');
const digest=async filename=>{const hash=createHash('sha256');await pipeline(createReadStream(filename),hash);return hash.digest('hex');};
const matches=async(file,record)=>{try{return (await fs.stat(file)).size===record.bytes&&await digest(file)===record.sha256;}catch{return false;}};
export async function importCalendarPackages(out=path.join(root,'dist')){
 if(manifest.calendars.length!==780||new Set(manifest.calendars.map(c=>c.stem)).size!==780)throw Error('Expected 780 distinct supplied calendars');
 const destination=path.join(out,'lataukset');await fs.mkdir(destination,{recursive:true});
 const files=[];let ready=true;
 for(const c of manifest.calendars)for(const [key,extension] of [['pdf','pdf'],['image','webp']]){
  const filename=c.stem+'.'+extension,record={...c[key],path:'lataukset/'+filename,destination:path.join(destination,filename)};
  files.push(record);if(!await matches(record.destination,record))ready=false;
 }
 if(!ready){
  const work=path.join(root,'work/calendar-package-build');await fs.mkdir(work,{recursive:true});
  let archive=process.env.CALENDAR_PACKAGE_BUNDLE||path.join(root,'work/calendar-packages-20261114',manifest.bundle.name),temporary=false;
  try{await fs.access(archive);}catch{
   archive=path.join(work,manifest.bundle.name);temporary=true;
   const response=await fetch(manifest.bundle.url,{signal:AbortSignal.timeout(600000)});if(!response.ok)throw Error('Calendar bundle response '+response.status);
   await pipeline(Readable.fromWeb(response.body),createWriteStream(archive));
  }
  try{
   if(!await matches(archive,manifest.bundle))throw Error('Calendar bundle SHA-256 mismatch');
   // Extract only the exact 1,560 manifest paths. Each original PDF and image
   // is checked independently before replacing its destination atomically.
   const extractor=`import sys,json,tarfile,hashlib,pathlib,unicodedata\np=json.load(open(sys.argv[1]));allowed={f['path']:f for f in p};seen=set()\nwith tarfile.open(fileobj=sys.stdin.buffer,mode='r|') as tar:\n for item in tar:\n  name=unicodedata.normalize('NFC',item.name)\n  if not item.isfile() or name not in allowed or name in seen: raise ValueError('Unexpected bundle path: '+name)\n  f=allowed[name]\n  if item.size!=f['bytes']: raise ValueError('Bundle file size: '+name)\n  b=tar.extractfile(item).read()\n  if hashlib.sha256(b).hexdigest()!=f['sha256']: raise ValueError('Source checksum mismatch: '+name)\n  dest=pathlib.Path(f['destination']);tmp=dest.with_name(dest.name+'.importing');tmp.write_bytes(b);tmp.replace(dest);seen.add(name)\nif len(seen)!=len(allowed): raise ValueError('Calendar bundle incomplete')\n`;
   const expectedPath=path.join(work,'expected-files.json');await fs.writeFile(expectedPath,JSON.stringify(files));
   const child=spawn(process.env.PYTHON||'python3',['-c',extractor,expectedPath],{stdio:['pipe','inherit','inherit']});
   const completion=new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Calendar bundle extraction failed: '+code)));});
   await Promise.all([pipeline(createReadStream(archive),createZstdDecompress({params:{[constants.ZSTD_d_windowLogMax]:28}}),child.stdin),completion]);
  }finally{if(temporary)await fs.rm(archive,{force:true});}
 }
 console.log('Verified 780 original PDF + 600 dpi image pairs from 17 supplied ZIP packages');
 let cache={};const cachePath=path.join(root,'reports/calendar-package-previews.json');try{cache=JSON.parse(await fs.readFile(cachePath,'utf8'));}catch{}
 const exports=[];
 for(const c of manifest.calendars){
  const base=path.join(destination,c.stem),preview=base+'-preview.webp';
  let previewExists=false;try{previewExists=(await fs.stat(preview)).size>1000;}catch{}
  if(cache[c.stem]!==c.image.sha256||!previewExists){await sharp(base+'.webp').resize({width:1000}).webp({quality:85,effort:4}).toFile(preview+'.tmp');await fs.rename(preview+'.tmp',preview);cache[c.stem]=c.image.sha256;}
  exports.push({stem:c.stem,year:c.year,month:c.month,style:c.style,orientation:c.orientation,width:c.width,height:c.height,dpi:600,sourcePackage:manifest.version,pdfSha256:c.pdf.sha256,imageSha256:c.image.sha256});
 }
 await fs.mkdir(path.join(root,'reports'),{recursive:true});
 await fs.writeFile(cachePath,JSON.stringify(cache));await fs.writeFile(path.join(root,'reports/exports.json'),JSON.stringify(exports,null,2));
 return exports;
}
if(process.argv[1]&&path.resolve(process.argv[1])===import.meta.filename)await importCalendarPackages();
