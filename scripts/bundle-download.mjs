import fs from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {Readable,Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {randomUUID} from 'node:crypto';

// Transfer only. The importer still verifies the complete archive SHA-256 and
// every extracted source file before replacing any calendar or preview.
export async function downloadBundle(bundle,destination){
 if(!Number.isSafeInteger(bundle.bytes)||bundle.bytes<1)throw Error('Invalid bundle byte count');
 try{await fs.lstat(destination);throw Object.assign(Error('Bundle destination already exists'),{code:'EEXIST'});}catch(e){if(e.code!=='ENOENT')throw e;}
 const stage=destination+'.download-'+randomUUID(),controller=new AbortController();
 const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(600000)]);
 const handle=await fs.open(stage,'wx');await handle.truncate(bundle.bytes);await handle.close();
 const pieces=Math.min(4,bundle.bytes),size=Math.ceil(bundle.bytes/pieces);
 async function response(start,end){const r=await fetch(bundle.url,{headers:{Range:`bytes=${start}-${end}`},signal});return r;}
 async function write(r,start,length){
  let bytes=0;
  const count=new Transform({transform(chunk,encoding,done){bytes+=chunk.length;done(bytes>length?Error('Bundle response exceeded its exact range'):null,chunk);}});
  await pipeline(Readable.fromWeb(r.body),count,createWriteStream(stage,{flags:'r+',start}));
  if(bytes!==length)throw Error('Bundle range was truncated');
 }
 function range(r,start,end){if(r.status!==206||r.headers.get('content-range')!==`bytes ${start}-${end}/${bundle.bytes}`)throw Error('Bundle range identity differs');}
 try{
  const end=Math.min(size,bundle.bytes)-1,first=await response(0,end);
  if(first.status===200){await write(first,0,bundle.bytes);}
  else{
   range(first,0,end);
   const tasks=[write(first,0,end+1)];
   for(let start=size;start<bundle.bytes;start+=size){const from=start,to=Math.min(start+size,bundle.bytes)-1;tasks.push((async()=>{const r=await response(from,to);range(r,from,to);await write(r,from,to-from+1);})());}
   const results=await Promise.allSettled(tasks.map(task=>task.catch(e=>{controller.abort();throw e;})));
   const failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;
  }
  // An exclusive link publishes the complete transfer without overwriting an
  // archive created by another process. The caller now checks its full checksum.
  await fs.link(stage,destination);
 }finally{controller.abort();await fs.rm(stage,{force:true});}
}
