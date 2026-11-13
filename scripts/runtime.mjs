import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {transform} from 'lightningcss';

export async function runtimeAssets(ROOT,ASSET,OUT,pages){
  const shareSprite=await fs.readFile(path.join(ASSET,'share-icons.svg'));
  const shareSpriteName='share-icons.'+createHash('sha256').update(shareSprite).digest('hex').slice(0,16)+'.svg';
  const shareSpritePath='/assets/'+shareSpriteName;
  await fs.writeFile(path.join(ASSET,shareSpriteName),shareSprite);
  const artHash=createHash('sha256'),artFiles=(await fs.readdir(path.join(ASSET,'art'))).filter(name=>name.endsWith('.svg')).sort();
  for(const name of artFiles)artHash.update(name).update(await fs.readFile(path.join(ASSET,'art',name)));
  const artPrefix='/assets/art-'+artHash.digest('hex').slice(0,16)+'/',artFolder=path.join(OUT,artPrefix);
  await fs.mkdir(artFolder,{recursive:true});for(const name of artFiles)await fs.copyFile(path.join(ASSET,'art',name),path.join(artFolder,name));
  const css=Buffer.concat(await Promise.all(['site.css','finland.css','edition.css','local-weather.css','home-dashboard.css','studio-workspace.css','tools-menu.css','holiday-calendar.css','finland-services.css','community.css','personal-planner.css','storage-notice.css','date-tools.css','work-tools.css','work-overview.css','education-hub.css','print-catalog.css','legal-pages.css','site-search.css','calendar-workspace.css','lunar-directory.css','lunar-header.css','lunar-phases.css','solar-workspace.css','daylength.css','not-found.css','seasons.css','download-controls.css','footer.css','document-pages.css','editorial.css','garden-planner.css','vacation-planner.css'].map(async name=>Buffer.from((await fs.readFile(path.join(ASSET,name),'utf8')).replaceAll('/assets/art/',artPrefix)+'\n'))));
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
    plugins:[{name:'source-versioned-art',setup(builder){builder.onLoad({filter:/\.m?js$/},async args=>{if(!args.path.startsWith(ASSET+path.sep))return;return{contents:(await fs.readFile(args.path,'utf8')).replaceAll('/assets/art/',artPrefix).replaceAll('/assets/share-icons.svg',shareSpritePath),loader:'js',resolveDir:path.dirname(args.path)};});}}],
  });
  const entry=Object.entries(compiled.metafile.outputs).find(([,value])=>value.entryPoint=== 'app.mjs'||value.entryPoint?.endsWith('/app.mjs'));
  if(!entry)throw Error('Compiled application entry was not generated.');
  const script='/assets/runtime/'+path.basename(entry[0]);
  for(const p of [...pages,{path:'/404/'}]){
    const file=p.path==='/404/'?path.join(OUT,'404.html'):path.join(OUT,p.path,'index.html');
    let html=await fs.readFile(file,'utf8');
    html=html.replace('/assets/site.css','/assets/'+styleName)
      .replace('<link rel="stylesheet" href="/assets/finland.css">','').replace('<link rel="stylesheet" href="/assets/edition.css">','')
      .replace('/assets/app.mjs',script).replaceAll('/assets/art/',artPrefix);
    await fs.writeFile(file,html);
  }
  await fs.writeFile(path.join(ROOT,'reports/runtime-manifest.json'),JSON.stringify({
    stylesheet:{src:'/assets/'+styleName,before:css.length,after:packed.length},
    artwork:{prefix:artPrefix,files:artFiles.length},
    shareIcons:{src:shareSpritePath,bytes:shareSprite.length},
    script,outputs:Object.fromEntries(Object.entries(compiled.metafile.outputs).map(([name,value])=>[name,{bytes:value.bytes,entry:value.entryPoint||null}]))
  },null,2));
}
