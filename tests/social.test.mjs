import test from 'node:test';
import assert from 'node:assert/strict';
const routes=['/merkkipaivat/helmikuu/','/kuukausikalenteri/2028/helmikuu/','/viikkokalenteri/2030/viikko-52/','/kuun-nousu-ja-lasku/tampere/2029/','/auringonnousu-ja-lasku/helsinki/2028/','/koulujen-lomat/tuusula/','/yliopistojen-kalenterit/aalto-yliopisto/','/juhlapyhat/jouluaatto/','/blogi/auringon-ajat/','/juhlapyhat/eduskuntavaalit/','/kylvokalenteri/avomaankurkku/'];
const pages=routes.map(path=>({path,title:'Kalenteri: '+path,description:'Testikuvaus'}));
import {socialModel} from '../scripts/social-model.mjs';
import {wrapLabel,measure} from '../scripts/social-type.mjs';
import {layout} from '../src/ui.mjs';
import {renderSocial} from '../scripts/social-render.mjs';
import fs from 'node:fs/promises';
import fontkit from '@pdf-lib/fontkit';

const model=route=>{const p=pages.find(p=>p.path===route);assert.ok(p,route);return socialModel(route,p.title,p.description,p);};
test('Route variants have a deliberate social family, valid period and fitting title',()=>{
 for(const p of pages){const m=socialModel(p.path,p.title,p.description,p),fit=wrapLabel(m.title);assert.ok(m.family);assert.ok(m.month===null||m.month>=1&&m.month<=12);assert.ok(fit.lines.length<=2,p.path);assert.ok(fit.lines.every(line=>measure(line,fit.size)<=1058),p.path);}
});
test('Month-only, month-year, leap-year and ISO week routes preserve their period',()=>{
 assert.equal(model('/merkkipaivat/helmikuu/').month,2);
 assert.equal(model('/merkkipaivat/helmikuu/').year,null);
 assert.equal(model('/kuukausikalenteri/2028/helmikuu/').year,2028);
 assert.equal(model('/viikkokalenteri/2030/viikko-52/').week,52);
});
test('City, school and institution covers use the actual mapped place',()=>{
 assert.equal(model('/kuun-nousu-ja-lasku/tampere/2029/').primaryId,'tampere-night');
 assert.equal(model('/auringonnousu-ja-lasku/helsinki/2028/').primaryId,'helsinki');
 assert.equal(model('/koulujen-lomat/tuusula/').primaryId,'tuusula');
 assert.equal(model('/yliopistojen-kalenterit/aalto-yliopisto/').primaryId,'aalto-yliopisto');
});
test('Holiday photos and article hero photos cannot be replaced by related-card photos',()=>{
 assert.equal(model('/juhlapyhat/jouluaatto/').primaryId,'holiday-topic-jouluaatto');
 assert.equal(model('/blogi/auringon-ajat/').primaryId,'rovaniemi');
 assert.equal(model('/juhlapyhat/eduskuntavaalit/').primaryId,null);
 assert.equal(model('/kylvokalenteri/avomaankurkku/').primaryId,'crop-kurkku');
});
test('Finnish social metadata contain matching image dimensions, alt and preview permissions',()=>{
 const social={src:'/assets/social/example.jpg',alt:'Kalenterin valokuva ja helmikuun päivät.',width:1200,height:630,type:'image/jpeg'};
 for(const html of [layout({title:'Kalenteri',description:'Kalenteri Suomessa',path:'/kalenteri/',body:'',social})]){
  for(const key of ['og:image','og:image:secure_url','og:image:width','og:image:height','og:image:type','og:image:alt','twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt'])assert.match(html,new RegExp('(?:property|name)="'+key+'"'));
  assert.match(html,/max-image-preview:large/);assert.match(html,/primaryImageOfPage/);
 }
 const article=layout({title:'Opas',description:'Tietoa kalenterista.',path:'/blogi/opas/',body:'',kind:'article',extra:{article:{}},structuredImages:[{'@type':'ImageObject',contentUrl:'https://kalenteri365.fi/unrelated.jpg'}],social});
 const schema=JSON.parse(article.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(schema.mainEntity.image.contentUrl,'https://kalenteri365.fi/assets/social/example.jpg');
 assert.match(layout({title:'Lisenssit',description:'Kuvat',path:'/valokuvat-ja-lisenssit/',body:'',social}),/content="noindex,nofollow,max-image-preview:large"/);
});

test('Annual cover date rows leave visible space between actual glyph lines',async()=>{
 const font=fontkit.create(await fs.readFile(new URL('../assets/fonts/Lato-Bold.ttf',import.meta.url)));
 for(const year of [2027,2028,2029,2030]){
  const route=`/kalenteri/${year}/`;
  const {svg}=await renderSocial(socialModel(route,'Kalenteri '+year,''),'/unused');
  const numbers=[...svg.matchAll(/<g fill="(?:#24465e|#912d49|#91a0ab)" transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+) -[\d.]+\)">/g)].map(m=>({x:+m[1],y:+m[2],size:+m[3]*font.unitsPerEm}));
  assert.ok(numbers.length>=365,'Annual cover must contain date glyphs');
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){
   const cell=numbers.filter(p=>p.x>=206+col*193-1&&p.x<206+(col+1)*193-1&&p.y>=170+row*96&&p.y<170+(row+1)*96);
   assert.ok(cell.length>=28,`${route}, month ${row*4+col+1}`);
   const baselines=[...new Set(cell.map(p=>Math.round(p.y*1000)/1000))].sort((a,b)=>a-b),size=Math.max(...cell.map(p=>p.size));
   for(let i=1;i<baselines.length;i++)assert.ok(baselines[i]-baselines[i-1]>=size*.8+1,`Colliding date rows: ${route}, month ${row*4+col+1}`);
  }
 }
});

test('Weekly covers mark next-year New Year as a holiday',async()=>{const {svg}=await renderSocial(socialModel('/viikkokalenteri/2027/viikko-52/','Viikko 52, 2027'),'/unused');assert.match(svg,/fill="#f0dfe5"/);});
test('Monthly lunar covers credit only the lunar texture they display',()=>{const m=socialModel('/kuukalenteri/2028/marraskuu/','Marraskuu 2028');assert.deepEqual(m.photos.map(p=>p.id),['moon-full']);});
