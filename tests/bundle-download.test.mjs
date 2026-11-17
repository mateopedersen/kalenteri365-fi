import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {downloadBundle} from '../scripts/bundle-download.mjs';

async function fixture(t,mode='ranges'){
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'fi-bundle-transfer-')),body=Buffer.from('verified original calendar bytes '.repeat(1000));
 let active=0,peak=0,requests=0;
 const server=createServer(async(req,res)=>{
  requests++;const [,from,to]=/^bytes=(\d+)-(\d+)$/.exec(req.headers.range||'')||[];
  if(mode==='full'){res.writeHead(200);res.end(body);return;}
  const start=Number(from),end=Number(to);active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,10));
  res.writeHead(206,{'Content-Range':`bytes ${mode==='wrong-range'||(mode==='later-wrong-range'&&start>0)?start+1:start}-${end}/${body.length}`});
  const part=body.subarray(start,end+1);res.end(mode==='truncated'?part.subarray(0,part.length-1):mode==='oversized'?Buffer.concat([part,Buffer.from('x')]):part);active--;
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));await fs.rm(directory,{recursive:true,force:true});});
 return {directory,body,bundle:{url:`http://127.0.0.1:${server.address().port}/immutable`,bytes:body.length},stats:()=>({peak,requests})};
}
test('four exact ranges reconstruct the archive byte for byte with bounded overlap',async t=>{
 const f=await fixture(t),dest=path.join(f.directory,'archive');await downloadBundle(f.bundle,dest);assert.deepEqual(await fs.readFile(dest),f.body);assert(f.stats().peak>1&&f.stats().peak<=4);assert.equal(f.stats().requests,4);assert.deepEqual(await fs.readdir(f.directory),['archive']);
});
test('an origin without Range support uses one complete transfer with identical bytes',async t=>{
 const f=await fixture(t,'full'),dest=path.join(f.directory,'archive');await downloadBundle(f.bundle,dest);assert.deepEqual(await fs.readFile(dest),f.body);assert.equal(f.stats().requests,1);
});
for(const mode of ['wrong-range','later-wrong-range','truncated','oversized'])test('invalid '+mode+' never exposes an archive or leaves temporary parts',async t=>{
 const f=await fixture(t,mode),dest=path.join(f.directory,'archive');await assert.rejects(downloadBundle(f.bundle,dest));assert.deepEqual(await fs.readdir(f.directory),[]);
});
test('existing archives and invalid byte counts are preserved before any network access',async t=>{
 const f=await fixture(t),dest=path.join(f.directory,'archive');await fs.writeFile(dest,'keep original');await assert.rejects(downloadBundle(f.bundle,dest),{code:'EEXIST'});assert.equal(await fs.readFile(dest,'utf8'),'keep original');assert.equal(f.stats().requests,0);for(const bytes of [0,-1,Infinity,1.5])await assert.rejects(downloadBundle({...f.bundle,bytes},dest));assert.equal(f.stats().requests,0);
});
