import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {lettering,measure,wrapLabel} from './social-type.mjs';
import {toolScene} from './social-scenes.mjs';
import {MONTHS,CITIES,date,add,day,iso,monthGrid,weekStart,holidays,cap} from '../src/calendar.mjs';
import {moonMonth,riseSet} from '../src/astronomy.mjs';
import {illuminatedPath} from '../src/lunar.mjs';

const ROOT=new URL('../',import.meta.url),buffers=new Map(),uris=new Map(),moonCache=new Map(),dayCache=new Map();
export async function sourceBytes(src){if(!buffers.has(src))buffers.set(src,fs.readFile(new URL(src.replace(/^\//,''),ROOT)));return buffers.get(src);}
async function picture(photo,maxWidth=1100,maxHeight=520){const key=photo.src+'|'+maxWidth+'|'+maxHeight;if(!uris.has(key))uris.set(key,(async()=>{const data=await sharp(await sourceBytes(photo.src)).rotate().resize({width:maxWidth,height:maxHeight,fit:'inside',withoutEnlargement:true}).png().toBuffer();const meta=await sharp(data).metadata();return {uri:'data:image/png;base64,'+data.toString('base64'),width:meta.width,height:meta.height};})());return uris.get(key);}
function image(pic,x,y,w,h){return `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" href="${pic.uri}"/>`;}
function paper(x,y,w,h,angle=0,body=''){return `<g transform="rotate(${angle} ${x+w/2} ${y+h/2})"><rect x="${x+4}" y="${y+10}" width="${w}" height="${h}" rx="13" fill="#b8c8d4" opacity=".32"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="url(#paper)" stroke="#cedbe4" stroke-width="1.3" filter="url(#shadow)"/>${body}</g>`;}
function background(dark=false){return `<rect width="1200" height="630" fill="${dark?'#081c32':'#e9f0f6'}"/><ellipse cx="930" cy="90" rx="650" ry="410" fill="${dark?'#123953':'#f8fbfe'}"/><path d="M0 448Q380 330 760 480T1200 380V630H0Z" fill="${dark?'#102a42':'#d6e4ee'}"/><path d="M0 470Q490 440 760 570" fill="none" stroke="${dark?'#527b8b':'#adc8d9'}" stroke-width="1" opacity=".5"/>`;}
function binder(x,y,w){return `<rect x="${x}" y="${y}" width="${w}" height="48" rx="13" fill="#0d4679"/>${[.13,.36,.64,.87].map(n=>`<rect x="${x+w*n-5}" y="${y-8}" width="10" height="24" rx="5" fill="url(#metal)" stroke="#9db6c8"/>`).join('')}`;}
function calendarGrid(year,month,x,y,w,h,mode='all',compact=false){
 const rows=monthGrid(year,month),cw=w/7,header=compact?14:30,rh=(h-header)/rows.length,font=compact?Math.min(8.5,rh*.72):22;
 const hs=new Map(holidays(year).map(a=>[a.date,a]));
 return ['Ma','Ti','Ke','To','Pe','La','Su'].map((d,i)=>lettering(d,x+cw*(i+.5),y+14,compact?8:15,i>4?'#8d4c57':'#546a7b',true,'middle')).join('')+rows.map((week,r)=>week.map((d,c)=>{const other=d.getUTCMonth()+1!==month,hday=hs.get(iso(d)),hi=hday&&(mode==='all'||mode==='work'?hday.type==='holiday':mode==='flag'?hday.type==='flag':true);const px=x+c*cw,py=y+(compact?14:26)+r*rh;return `<rect x="${px+2}" y="${py+1}" width="${cw-4}" height="${rh-3}" rx="${compact?3:7}" fill="${other?'#f2f5f7':hi?'#ebd8df':c>4?'#eef3f7':mode==='work'?'#e0eee8':'#fff'}"/>`+lettering(d.getUTCDate(),px+cw/2,py+rh*.62,font,other?'#91a0ab':hi?'#912d49':'#24465e',!other,'middle');}).join('')).join('');
}
function annual(year,x,y,w,h,mode='all'){
 const cols=4,cw=w/cols,ch=h/3;
 return MONTHS.map((name,i)=>{const px=x+(i%cols)*cw,py=y+Math.floor(i/cols)*ch;return lettering(cap(name),px+6,py+13,12,'#285673')+calendarGrid(year,i+1,px,py+18,cw-14,ch-28,mode,true);}).join('');
}
function pen(x,y,angle=-20){return `<g transform="translate(${x} ${y}) rotate(${angle})"><rect width="14" height="214" rx="7" fill="url(#pen)" filter="url(#smallshadow)"/><path d="M1 205h12l-6 25Z" fill="#c1ccd1"/><path d="m7 230-2-8h4Z" fill="#29495c"/><rect x="2" y="15" width="10" height="4" rx="2" fill="#dce6ea"/></g>`;}
function calendarScene(m){
 const year=m.year||2027,month=m.month,mode=m.base==='tyopaivat'?'work':m.base==='liputuspaivat'?'flag':m.base==='merkkipaivat'?'observance':'all';
 if(!m.year){
  const cards=[2027,2028,2029,2030].map((y,i)=>{const x=55+i*290,top=115+(i%2)*18;return paper(x,top,267,340,i%2?3:-3,binder(x,top,267)+lettering(y,x+18,top+87,36,'#194c73')+calendarGrid(y,month||1,x+13,top+107,241,215,mode,false));}).join('');
  return background()+cards;
 }
 const bar=month?`${cap(MONTHS[month-1])} ${year}`:String(year);
 let body;
 if(month)body=binder(245,95,660)+lettering(bar,273,172,29,'#173e60')+calendarGrid(year,month,270,191,610,250,mode,false);
 else body=binder(180,75,820)+lettering(bar,206,153,31,'#174666')+annual(year,206,170,772,288,mode);
 return background()+paper(month?245:180,month?95:75,month?660:820,month?380:418,month?-3:1.5,body)+pen(1033,153,17)+`<ellipse cx="118" cy="245" rx="62" ry="61" fill="#beccce" opacity=".3"/><circle cx="110" cy="230" r="53" fill="#f9fbfb" stroke="#d6e1e5" stroke-width="9"/><circle cx="110" cy="230" r="39" fill="#a77f57"/><circle cx="110" cy="230" r="35" fill="#634c37"/>`;
}
function weeklyScene(m){
 const year=m.year||2027,w=m.week||1,start=weekStart(year,w),hday=new Set([year-1,year,year+1].flatMap(y=>holidays(y)).filter(h=>h.type==='holiday').map(h=>h.date));
 let body=binder(133,83,938)+lettering('VIIKKO',163,165,16,'#6a8091')+lettering(w,163,217,48,'#0e497b')+lettering(year,1036,164,26,'#315b7a',true,'end');
 for(let i=0;i<7;i++){const d=add(start,i),x=265+i*107;body+=`<rect x="${x}" y="187" width="99" height="262" rx="7" fill="${hday.has(iso(d))?'#f0dfe5':i>4?'#eef3f8':'#fafcfd'}"/>`+lettering(['Ma','Ti','Ke','To','Pe','La','Su'][i],x+14,216,16,'#45627b')+lettering(d.getUTCDate(),x+14,257,29,hday.has(iso(d))?'#8f3e51':'#123c60')+[0,1,2,3,4,5].map(l=>`<path d="M${x+12} ${284+l*27}h75" stroke="#d9e2e7"/>`).join('');}
 return background()+paper(133,83,938,397,-1.5,body)+pen(92,224,-14);
}
async function printScene(m,out){
 const year=m.year||2027,prefix=`kalenteri-${year}${m.month?'-'+String(m.month).padStart(2,'0'):''}`;
 const names=['helsinki','jarvimaisema','suomen-kartta'];let cards='';
 for(let i=0;i<3;i++){const file=path.join(out,'..','lataukset',prefix+'-'+names[i]+'-preview.webp');try{const b=await fs.readFile(file);(m.renderAssets??=[]).push({file,role:'print-preview'});const p=await sharp(b).resize(620,480,{fit:'inside'}).png().toBuffer(),meta=await sharp(p).metadata();const x=[122,410,735][i],y=[110,68,111][i],w=meta.width,h=meta.height,scale=Math.min(380/w,410/h);cards+=paper(x,y,380,410,[-8,0,8][i],image({uri:'data:image/png;base64,'+p.toString('base64')},x+12,y+12,356,386));}catch{throw Error('Missing exact print preview: '+file);}}
 return background()+cards;
}
async function photoPanel(photo,x,y,w,h,angle=0){
 const p=await picture(photo,w-24,h-24);return paper(x,y,w,h,angle,image(p,x+12,y+12,w-24,h-24));
}
async function getMoon(out){
 const key=out;if(!uris.has(key))uris.set(key,(async()=>{const b=await fs.readFile(path.join(out,'photos/moon-surface.jpg'));return 'data:image/jpeg;base64,'+b.toString('base64');})());return uris.get(key);
}
function moonDisc(uri,angle,x,y,size,id){return `<g transform="translate(${x} ${y}) scale(${size/100})"><defs><clipPath id="${id}-rim"><circle cx="50" cy="50" r="48"/></clipPath><clipPath id="${id}-light"><path d="${illuminatedPath(angle)}"/></clipPath></defs><circle cx="50" cy="50" r="48" fill="#020911"/><image href="${uri}" x="2" y="2" width="96" height="96" clip-path="url(#${id}-rim)" opacity=".12"/><image href="${uri}" x="2" y="2" width="96" height="96" clip-path="url(#${id}-light)"/><circle cx="50" cy="50" r="48" fill="url(#moon-shade)"/><circle cx="50" cy="50" r="48" fill="none" stroke="#b8c9d7" stroke-opacity=".4" stroke-width=".5"/></g>`;}
async function lunarScene(m,out){
 (m.renderAssets??=[]).push({file:path.join(out,'photos/moon-surface.jpg'),role:'moon-texture'});const uri=await getMoon(out),year=m.year||2027;
 let scene=background(true)+Array.from({length:40},(_,i)=>`<circle cx="${45+(i*127.73+m.seed%31)%1110}" cy="${70+(i*57.31)%405}" r="${i%7===0?1.8:.7}" fill="#bddeef" opacity="${i%3===0?.65:.25}"/>`).join('');
 if(m.month){
  const key=year+'-'+m.month;if(!moonCache.has(key))moonCache.set(key,moonMonth(year,m.month));const values=moonCache.get(key);
  const focus=values[Math.min(14,values.length-1)];
  scene+=moonDisc(uri,focus.angle,75,97,350,'main')+lettering(`15.${m.month}.${year} · ${Math.round(focus.illumination*100)} %`,252,476,20,'#deebf1',true,'middle');
  scene+=`<rect x="505" y="82" width="635" height="408" rx="19" fill="#102f49" stroke="#315167"/>`;
  const offset=day(date(year,m.month,1));for(const [i,value] of values.entries()){const p=offset+i,c=p%7,r=Math.floor(p/7),x=524+c*86,y=101+r*66;scene+=lettering(i+1,x+39,y+10,11,'#a3c2d3',true,'middle')+moonDisc(uri,value.angle,x+14,y+16,52,'m'+i);}
 }else if(m.year&&m.photos[0]){
  const p=await picture(m.photos[0],760,430);scene+=image(p,70,66,690,435);[0,90,180,270].forEach((angle,i)=>{scene+=moonDisc(uri,angle,843,65+i*104,93,'q'+i);});
 }else if(['taysikuu','uusikuu','kuunpimennys'].includes(m.base)){
  const angle=m.base==='uusikuu'?0:180;scene+=moonDisc(uri,angle,400,75,440,'large');if(m.base==='kuunpimennys')scene+=`<circle cx="620" cy="295" r="211" fill="#ae4937" opacity=".45"/>`;
 }else{[0,90,180,270].forEach((angle,i)=>{scene+=moonDisc(uri,angle,70+i*289,172,205,'q'+i);});}
 return scene;
}
async function solarScene(m,out){
 const lunar=m.family==='moonrise',p=m.photos[0],city=m.city||CITIES[0],year=m.year||2027;
 let scene=background(lunar)+await photoPanel(p,45,80,625,406,-2);
 const x=697,y=84,w=460,h=398;
 scene+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${lunar?'#0d2a42':'#fff9ea'}" stroke="${lunar?'#49637b':'#e9dcb9'}"/>`;
 if(m.family==='daylength'){
  const values=[];for(let month=1;month<=12;month++){const key=city[0]+'|'+year+'|'+month;if(!dayCache.has(key)){const v=riseSet(city,date(year,month,15));dayCache.set(key,v.duration/60);}values.push(dayCache.get(key));}
  // Rise/set duration is in minutes, including polar-day and polar-night values.
  const normalized=values.map(v=>Math.max(0,Math.min(24,Number(v)||0)));
  scene+=lettering(year,x+24,y+49,30,'#2a566e');
  normalized.forEach((v,i)=>{const bx=x+29+i*34,bh=Math.max(4,v/24*231);scene+=`<rect x="${bx+3}" y="${y+303-bh+6}" width="19" height="${bh}" rx="4" fill="#b2bdb7" opacity=".6"/><rect x="${bx}" y="${y+303-bh}" width="19" height="${bh}" rx="4" fill="url(#sunbar)"/>`+lettering(i+1,bx+9,y+330,10,'#536675',false,'middle');});
 }else{
  scene+=`<path d="M${x+42} ${y+286}Q${x+w/2} ${y-10} ${x+w-42} ${y+286}" fill="none" stroke="${lunar?'#527a96':'#e2be75'}" stroke-dasharray="6 10" stroke-width="2"/><path d="M${x+27} ${y+290}h406" stroke="${lunar?'#355673':'#b9cbd4'}" stroke-width="2"/><path d="M${x+30} ${y+306}q80 11 154 0t245 0" fill="none" stroke="${lunar?'#254b6b':'#b1ccd0'}" stroke-width="3"/>`;
  if(lunar){(m.renderAssets??=[]).push({file:path.join(out,'photos/moon-surface.jpg'),role:'moon-texture'});scene+=moonDisc(await getMoon(out),115,x+133,y+79,200,'city-moon');}
  else scene+=`<circle cx="${x+w/2}" cy="${y+123}" r="89" fill="url(#sun-halo)"/><circle cx="${x+w/2}" cy="${y+123}" r="43" fill="url(#sunball)"/>`;
  scene+=lettering(city[1],x+w/2,y+352,24,lunar?'#c6dce8':'#265571',true,'middle');
 }
 return scene;
}
async function featurePhoto(m){
 let scene=background(),photo=m.photos[0];if(!photo)return background()+toolScene({base:m.base,seed:m.seed});
 const tall=photo.height/photo.width>1.1;
 if(m.photos.length>1&&m.family==='university'){
  for(let i=0;i<Math.min(3,m.photos.length);i++)scene+=await photoPanel(m.photos[i],80+i*355,105+i%2*-27,332,365,i-1);
 }else if(tall){
  scene+=await photoPanel(photo,182,78,390,419,-3);
  const year=m.year||2027,found=holidays(year).find(h=>m.route.includes('/'+h.slug+'/'));
  if(found){const d=new Date(found.date+'T12:00Z');scene+=paper(657,149,326,286,5,binder(657,149,326)+lettering(d.getUTCDate(),820,324,107,'#16466c',true,'middle')+lettering(cap(MONTHS[d.getUTCMonth()]),820,385,26,'#4b687e',true,'middle'));}
  else scene+=`<g transform="translate(588 84) scale(.46)">${toolScene({base:m.base,seed:m.seed})}</g>`;
 }else{
  scene+=await photoPanel(photo,96,75,1008,420,-.6);
 }
 return scene;
}
async function homeScene(m){return background()+await photoPanel(m.photos[0],498,84,655,407,2)+paper(75,94,416,376,-5,binder(75,94,416)+lettering('2027',105,187,39,'#14466e')+calendarGrid(2027,1,96,210,373,221));}
async function seasonScene(out,m){let scene=background();for(let i=0;i<4;i++){const names=['kevat','kesa','syksy','talvi'],src=path.join(out,'seasons','2027-'+names[i]+'-1200.webp');const data=await sharp(await fs.readFile(src)).resize({width:560}).png().toBuffer(),uri='data:image/png;base64,'+data.toString('base64');(m.renderAssets??=[]).push({file:src,role:'season-illustration'});scene+=`<image x="${31+i*289}" y="88" width="272" height="392" href="${uri}" preserveAspectRatio="xMidYMid slice"/>`;}return scene;}
const zodiacPaths={
 oinas:'M50 88V35C50 0 8 5 12 36C14 48 24 50 30 42M50 35C50 0 92 5 88 36C86 48 76 50 70 42',
 harka:'M18 8C18 48 82 48 82 8M50 42a23 23 0 1 0 0 46a23 23 0 1 0 0-46',
 kaksoset:'M20 13Q50 24 80 13M20 87Q50 76 80 87M33 18V83M67 18V83',
 rapu:'M18 41C26 13 68 12 83 26M18 41a13 13 0 1 0 26 0a13 13 0 1 0-26 0M82 59C74 87 32 88 17 74M82 59a13 13 0 1 0-26 0a13 13 0 1 0 26 0',
 leijona:'M34 58a16 16 0 1 0 0 1M34 57C5 15 62 2 67 32C71 58 52 71 64 82C73 89 88 83 90 73',
 neitsyt:'M13 78V25Q25 10 32 25V73M32 27Q46 9 52 28V74M52 28Q65 9 71 29V68C71 97 96 84 90 61C85 44 66 59 75 70L92 88',
 vaaka:'M13 80H87M14 61H33C13 20 86 20 67 61H87',
 skorpioni:'M11 80V25Q25 10 32 25V78M32 27Q46 9 52 28V78M52 28Q65 9 71 29V66Q71 88 90 79M80 69L92 79L80 90',
 jousimies:'M19 82L82 19M49 18H83V52M20 48L51 80',
 kauris:'M10 25L26 18L43 76L61 25C78 10 98 38 79 57C52 82 44 88 34 84M61 56C71 37 92 65 79 79C67 92 53 78 61 56',
 vesimies:'M10 35L27 21L45 36L63 21L82 35L92 27M10 73L27 59L45 74L63 59L82 73L92 65',
 kalat:'M26 12C58 41 57 60 25 88M75 12C43 41 43 60 75 88M12 50H89',
};
function zodiacScene(m){
 let scene=background(true);const sign=m.route.split('/').filter(Boolean)[1];
 function emblem(key,x,y,size){const d=zodiacPaths[key];return `<g transform="translate(${x} ${y})"><circle cx="${size/2}" cy="${size/2}" r="${size*.48}" fill="#102c44" stroke="url(#metal)" stroke-width="${size*.025}"/><circle cx="${size/2}" cy="${size/2}" r="${size*.41}" fill="#173951" stroke="#c1a16c" stroke-opacity=".65"/><g transform="translate(${size*.19} ${size*.19}) scale(${size*.0062})"><path d="${d}" fill="none" stroke="#061824" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" transform="translate(1 3)"/><path d="${d}" fill="none" stroke="url(#gold)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff2c9" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1 -1)"/></g></g>`;}
 scene+='<defs><linearGradient id="gold" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#fff0c4"/><stop offset=".4" stop-color="#dbb46b"/><stop offset=".65" stop-color="#fff0ce"/><stop offset="1" stop-color="#a87938"/></linearGradient></defs>';
 if(zodiacPaths[sign]){scene+=emblem(sign,392,72,426);Object.keys(zodiacPaths).filter(s=>s!==sign).slice(0,8).forEach((s,i)=>{scene+=emblem(s,i<4?165:916,83+(i%4)*98,78);});}
 else Object.keys(zodiacPaths).forEach((s,i)=>{scene+=emblem(s,65+(i%6)*180,81+Math.floor(i/6)*210,166);});
 return scene;
}
function skyScene(m){let scene=background(true);for(let i=0;i<70;i++)scene+=`<circle cx="${30+(i*139.73+m.seed%97)%1140}" cy="${63+(i*63.71)%408}" r="${i%9===0?2:1}" fill="#d2e5ee" opacity="${i%3===0?.75:.3}"/>`;if(m.base==='auringonpimennys')scene+='<circle cx="600" cy="282" r="172" fill="url(#sun-halo)"/><circle cx="600" cy="282" r="133" fill="#f4dca5"/><circle cx="593" cy="278" r="132" fill="#07101b" stroke="#a0b7bc" stroke-width=".8"/>';else for(let i=0;i<7;i++){const x=205+i*131,y=89+(i%4)*78;scene+=`<path d="M${x} ${y}l-115 74" stroke="#92cfdf" stroke-opacity=".3" stroke-width="4"/><path d="M${x} ${y}l-92 59" stroke="#e8f7ff" stroke-width="1.4"/>`;}return scene;}

function clockScene(){
 let face='';for(let i=0;i<60;i++){const a=i*Math.PI/30;face+=`<path d="M${600+Math.sin(a)*161} ${282-Math.cos(a)*161}L${600+Math.sin(a)*(i%5?154:142)} ${282-Math.cos(a)*(i%5?154:142)}" stroke="#405f73" stroke-width="${i%5?1.5:4}"/>`;}
 return background()+`<ellipse cx="609" cy="478" rx="171" ry="19" fill="#8ea5b4" opacity=".3"/><circle cx="607" cy="293" r="192" fill="#698493"/><circle cx="600" cy="280" r="192" fill="url(#metal)" stroke="#a0b6c4" stroke-width="3" filter="url(#shadow)"/><circle cx="600" cy="280" r="174" fill="url(#paper)" stroke="#e2e9ed" stroke-width="5"/>${face}<path d="M600 280L533 210M600 280L680 231" stroke="#1c435d" stroke-linecap="round" stroke-width="14"/><path d="M600 280L630 398" stroke="#b06647" stroke-width="3"/><circle cx="600" cy="280" r="12" fill="url(#metal)"/><path d="M361 195C292 300 326 398 406 444M411 410L406 444L371 438M827 144C911 188 915 288 873 367M870 329L873 367L909 351" fill="none" stroke="#598391" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>`;
}
function electionScene(){return background()+`<g transform="rotate(-3 580 340)"><path d="M355 247L685 219L838 273L506 310Z" fill="url(#metal)" stroke="#8eabbc" stroke-width="2"/><path d="M355 247L506 310V474L355 406Z" fill="#b8ccd9"/><path d="M506 310L838 273V435L506 474Z" fill="url(#paper)"/><path d="M448 260L685 242" stroke="#133e61" stroke-width="10" stroke-linecap="round"/><path d="M473 245L463 103L617 92L627 234Z" fill="url(#paper)" stroke="#d2dfe6" stroke-width="2" filter="url(#shadow)"/><rect x="497" y="133" width="90" height="58" rx="5" fill="#e9f1f5"/><path d="M518 160l15 14 32-31" stroke="#397976" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;}

export async function renderSocial(m,out){
 let scene;
 if(m.family==='calendar')scene=calendarScene(m);
 else if(m.family==='weekly')scene=weeklyScene(m);
 else if(m.family==='print')scene=await printScene(m,out);
 else if(m.family==='lunar')scene=await lunarScene(m,out);
 else if(['solar','moonrise','daylength'].includes(m.family))scene=await solarScene(m,out);
 else if(m.family==='home')scene=await homeScene(m);
 else if(m.family==='zodiac'){
  const sign=m.route.split('/').filter(Boolean)[1];
  if(zodiacPaths[sign]){
   const file=path.join(out,'art',`zodiac-${sign}.svg`);
   const bytes=await sharp(await fs.readFile(file)).resize(650,650,{fit:'inside'}).png().toBuffer();
   (m.renderAssets??=[]).push({file,role:'zodiac-illustration'});
   scene=background(true)+`<image href="data:image/png;base64,${bytes.toString('base64')}" x="335" y="30" width="540" height="490" preserveAspectRatio="xMidYMid meet"/>`;
  }else scene=zodiacScene(m);
 }
 else if(m.family==='sky')scene=skyScene(m);
 else if(m.family==='seasons')scene=await seasonScene(out,m);
 else if(m.base==='eduskuntavaalit'||m.route.includes('/eduskuntavaalit/'))scene=electionScene();
 else if(m.base==='kellonsiirto')scene=clockScene();
 else if(m.photos.length)scene=await featurePhoto(m);
 else scene=background()+toolScene({base:m.base,seed:m.seed});
 const dark=['lunar','moonrise','zodiac','sky'].includes(m.family);
 const ink=dark?'#f5f9ff':'#102f50',muted=dark?'#bfd3e6':'#47617a';
 const accent=dark?'#e6c893':'#176d83';
 const label=wrapLabel(m.title,474,48,3),lineHeight=label.size*1.16;
 const titleY=218;
 const summary=String(m.description||'').replace(/\s+/g,' ').trim();
 const description=summary?wrapLabel(summary,466,19,3):null;
 const summaryY=titleY+(label.lines.length-1)*lineHeight+42;
 const credit=m.photos.map(p=>[p.author,p.license].filter(Boolean).join(' · ')).join(' / ');
 const creditFit=credit?wrapLabel(credit,575,10,2):null;
 const titleMarkup=label.lines.map((line,i)=>lettering(line,50,titleY+i*lineHeight,label.size,ink)).join('');
 const isSign=m.family==='zodiac'&&Boolean(zodiacPaths[m.route.split('/').filter(Boolean)[1]]);
 const sceneView=m.base==='kellonsiirto'?'280 60 660 460':isSign?'290 10 620 530':
  m.family==='tool'?'140 65 920 430':
  ['taysikuu','uusikuu','kuunpimennys'].includes(m.base)?'340 40 560 460':
  m.family==='calendar'&&m.year?'150 65 900 440':'0 40 1200 470';
 const body=`<rect width="1200" height="630" fill="${dark?'#071d35':'#f3f7fc'}"/>
 <path d="M574 0h626v630H574Z" fill="${dark?'#0c2b47':'#e2edf7'}"/>
 <circle cx="1140" cy="75" r="270" fill="${dark?'#123a56':'#f9fcff'}" opacity=".7"/>
 <rect x="50" y="41" width="38" height="24" rx="3" fill="#fff" stroke="${dark?'#90b4d2':'#c2d3e3'}"/>
 <path d="M61 41h7v24h-7zM50 49h38v7H50z" fill="#003580"/>
 ${lettering('Kalenteri365',102,63,26,ink)}
 ${lettering('SUOMI',1150,59,13,muted,true,'end')}
 <path d="M50 98h1100" stroke="${dark?'#38516b':'#cfdeeb'}"/>
 <rect x="50" y="130" width="35" height="4" rx="2" fill="${accent}"/>
 ${lettering(m.category.toLocaleUpperCase('fi-FI'),50,165,14,accent)}
 ${titleMarkup}
 ${description?description.lines.map((line,i)=>lettering(line,50,summaryY+i*27,description.size,muted,false)).join(''):''}
 <defs><clipPath id="og-scene-clip"><rect x="574" y="126" width="576" height="405" rx="24"/></clipPath></defs>
 <rect x="578" y="138" width="576" height="405" rx="24" fill="#052b4d" opacity=".12"/>
 <g clip-path="url(#og-scene-clip)"><rect x="574" y="126" width="576" height="405" fill="${dark?'#102a42':'#e9f0f6'}"/><svg x="574" y="126" width="576" height="405" viewBox="${sceneView}" preserveAspectRatio="xMidYMid meet">${scene}</svg></g>
 <rect x="574" y="126" width="576" height="405" rx="24" fill="none" stroke="${dark?'#51718b':'#b8cede'}"/>
 ${creditFit?creditFit.lines.map((line,i)=>lettering(line,580,553+i*12,creditFit.size,muted,false)).join(''):''}
 <path d="M50 581h1100" stroke="${dark?'#38516b':'#cfdeeb'}"/>
 ${lettering('KALENTERIT · PYHÄT · ARJEN TYÖKALUT',50,608,12,muted)}
 ${lettering('kalenteri365.fi',1150,610,19,ink,true,'end')}`;
 return {svg:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="paper" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#eef3f5"/></linearGradient><linearGradient id="metal"><stop stop-color="#7e9aaf"/><stop offset=".4" stop-color="#fff"/><stop offset=".7" stop-color="#d6e1e5"/><stop offset="1" stop-color="#7895aa"/></linearGradient><linearGradient id="pen"><stop stop-color="#113b65"/><stop offset=".4" stop-color="#5781a0"/><stop offset=".6" stop-color="#17436d"/><stop offset="1" stop-color="#07243c"/></linearGradient><linearGradient id="sunbar" x1="0" y1="1" x2=".5" y2="0"><stop stop-color="#b68539"/><stop offset="1" stop-color="#edcc85"/></linearGradient><radialGradient id="sunball" cx="35%" cy="25%"><stop stop-color="#fff9cc"/><stop offset=".5" stop-color="#f4ce73"/><stop offset="1" stop-color="#c48c38"/></radialGradient><radialGradient id="sun-halo"><stop stop-color="#f2cb71" stop-opacity=".5"/><stop offset="1" stop-color="#f2cb71" stop-opacity="0"/></radialGradient><radialGradient id="moon-shade" cx="38%" cy="32%" r="65%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient><filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#0b2b46" flood-opacity=".18"/></filter><filter id="smallshadow" x="-50%" y="-30%" width="210%" height="180%"><feDropShadow dx="3" dy="5" stdDeviation="3" flood-color="#123853" flood-opacity=".22"/></filter></defs>${body}</svg>`,textLayout:{lines:label.lines,size:label.size,area:{x:50,y:174,width:474,height:206}},family:m.family};
}
