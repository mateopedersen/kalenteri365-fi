import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash}from'node:crypto';
import {createReadStream,createWriteStream}from'node:fs';
import {pipeline}from'node:stream/promises';
import {Readable}from'node:stream';
import {spawnSync}from'node:child_process';
import manifest from '../data/download-cache.json' with {type:'json'};
const root=path.resolve(import.meta.dirname,'..');
if(process.env.CI||process.env.CF_PAGES){
 let ready=true;for(const f of manifest.files){try{const bytes=await fs.readFile(path.join(root,f.path));if(bytes.length!==f.bytes||createHash('sha256').update(bytes).digest('hex')!==f.sha256){ready=false;break;}}catch{ready=false;break;}}
 if(!ready){
  const archive=path.join(root,'.download-cache.tar.gz');
  try{
   console.log('Downloading checksum-verified 600 dpi template cache.');
   const response=await fetch(manifest.url,{signal:AbortSignal.timeout(300000)});if(!response.ok)throw Error('Cache response '+response.status);
   await pipeline(Readable.fromWeb(response.body),createWriteStream(archive));
   const sha=createHash('sha256');await pipeline(createReadStream(archive),sha);if(sha.digest('hex')!==manifest.sha256)throw Error('Template archive checksum differs');
   const listing=spawnSync('tar',['-tzf',archive],{encoding:'utf8'});if(listing.status!==0)throw Error('Cannot inspect archive');
   const allowed=new Set([...manifest.files.map(f=>f.path),'reports/export-cache.json','reports/lunar-cache.json','reports/planner-cache.json']);
   if(listing.stdout.trim().split('\n').some(p=>!allowed.has(p.normalize('NFC'))))throw Error('Unexpected archive path');
   const extraction=spawnSync('tar',['-xzf',archive,'-C',root],{stdio:'inherit'});if(extraction.status!==0)throw Error('Cannot unpack template cache');
   for(const f of manifest.files){const b=await fs.readFile(path.join(root,f.path));if(b.length!==f.bytes||createHash('sha256').update(b).digest('hex')!==f.sha256)throw Error('Template integrity: '+f.path);}
   console.log('Verified all '+manifest.files.length+' template files; source hashes are checked again by each renderer.');
  }finally{await fs.rm(archive,{force:true});}
 }
}
