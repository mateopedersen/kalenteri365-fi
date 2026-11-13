import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {transform} from 'lightningcss';

export async function runtimeAssets(ROOT,ASSET,OUT,pages){
  const css=Buffer.concat(await Promise.all(['site.css','finland.css','edition.css'].map(async name=>Buffer.concat([await fs.readFile(path.join(ASSET,name)),Buffer.from('\n')]))));
  const packed=transform({filename:'site-runtime.css',code:css,minify:true}).code;
  const styleName='site-runtime.'+createHash('sha256').update(packed).digest('hex').slice(0,16)+'.css';
  await fs.writeFile(path.join(ASSET,styleName),packed);
  const compiled=await build({
    absWorkingDir:ASSET,
    entryPoints:{app:path.join(ASSET,'app.mjs')},
    outdir:path.join(ASSET,'runtime'),
    entryNames:'[name]-[hash]',chunkNames:'chunk-[hash]',
    bundle:true,splitting:true,format:'esm',platform:'browser',
    target:['safari17','chrome120','firefox120'],
    minify:true,charset:'utf8',legalComments:'linked',metafile:true,
  });
  const entry=Object.entries(compiled.metafile.outputs).find(([,value])=>value.entryPoint=== 'app.mjs'||value.entryPoint?.endsWith('/app.mjs'));
  if(!entry)throw Error('Compiled application entry was not generated.');
  const script='/assets/runtime/'+path.basename(entry[0]);
  for(const p of [...pages,{path:'/404/'}]){
    const file=p.path==='/404/'?path.join(OUT,'404.html'):path.join(OUT,p.path,'index.html');
    let html=await fs.readFile(file,'utf8');
    html=html.replace('/assets/site.css','/assets/'+styleName)
      .replace('<link rel="stylesheet" href="/assets/finland.css">','').replace('<link rel="stylesheet" href="/assets/edition.css">','')
      .replace('/assets/app.mjs',script);
    await fs.writeFile(file,html);
  }
  await fs.writeFile(path.join(ROOT,'reports/runtime-manifest.json'),JSON.stringify({
    stylesheet:{src:'/assets/'+styleName,before:css.length,after:packed.length},
    script,outputs:Object.fromEntries(Object.entries(compiled.metafile.outputs).map(([name,value])=>[name,{bytes:value.bytes,entry:value.entryPoint||null}]))
  },null,2));
}
