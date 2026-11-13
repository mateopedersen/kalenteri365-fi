import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import scenes from '../data/season-scenes.json' with {type:'json'};

export async function prepareSeasonAssets(root,out){
 const source=path.join(root,'assets/seasons'),target=path.join(out,'assets/seasons');
 await fs.mkdir(target,{recursive:true});
 const records=[];
 for(const scene of scenes){
  const original=await fs.readFile(path.join(source,scene.id+'.webp'));
  const hash=createHash('sha256').update(original).digest('hex');
  const version='season-assets-v1-'+hash;
  const marker=path.join(target,scene.id+'.version');
  const record={...scene,sha256:hash,bytes:original.length,variants:[]};
  const cached=(await fs.readFile(marker,'utf8').catch(()=>''))===version;
  for(const width of [360,720,1200])for(const format of ['webp','avif']){
   const file=scene.id+'-'+width+'.'+format,dest=path.join(target,file);
   if(!cached||!await fs.stat(dest).catch(()=>null)){
    const image=sharp(original).resize({width,withoutEnlargement:true});
    await (format==='avif'?image.avif({quality:55,effort:5}):image.webp({quality:85,effort:5})).toFile(dest);
   }
   record.variants.push({file,bytes:(await fs.stat(dest)).size});
  }
  await fs.writeFile(marker,version);records.push(record);
 }
 await fs.writeFile(path.join(root,'reports/season-assets.json'),JSON.stringify(records,null,2));
}
