import {PDFDocument,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import {MONTHS,cap,monthGrid,week,holidays,iso,day,daysInMonth} from './calendar.mjs';
import {esc} from './ui.mjs';
export const STYLES=[['suomi','Suomi','Sinivalkoinen, selkeä vaakakalenteri.','#174a78'],['metsä','Metsä','Vihreä sävy ja rauhallinen typografia.','#306958'],['musta','Muste','Mustavalkoinen ja vähän mustetta kuluttava.','#222222'],['muistiinpanot','Muistiinpanot','Pystyarkki, kalenteri ja viivoitettu muistiinpanotila.','#3d5c75']];
const reg=await fs.readFile(new URL('../assets/fonts/Lato-Regular.ttf',import.meta.url));
const bold=await fs.readFile(new URL('../assets/fonts/Lato-Bold.ttf',import.meta.url));
const regOutline=fontkit.create(reg),boldOutline=fontkit.create(bold);
const hex=s=>rgb(...s.match(/\w\w/g).map(v=>parseInt(v,16)/255));
export async function exportCalendar(out,y,m,style,styleSlug,moonPhases=[]){
 const portrait=styleSlug==='muistiinpanot',W=portrait?595.28:841.89,H=portrait?841.89:595.28,accent=STYLES.find(s=>s[0]===styleSlug)?.[3]||'#174a78';
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);doc.setTitle(`${m?cap(MONTHS[m-1]):'Vuosikalenteri'} ${y} – Kalenteri365.fi`);doc.setAuthor('Kalenteri365.fi');doc.setSubject('Suomi, ISO-viikot, maanantai–sunnuntai');doc.setLanguage('fi-FI');
 const page=doc.addPage([W,H]),fr=await doc.embedFont(reg,{subset:true}),fb=await doc.embedFont(bold,{subset:true});let svg=[];
 const rect=(x,top,w,h,fill='#ffffff',stroke=null)=>{page.drawRectangle({x,y:H-top-h,width:w,height:h,color:hex(fill),...(stroke?{borderColor:hex(stroke),borderWidth:.5}:{})});svg.push(`<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width=".5"`:''}/>`);};
 const text=(s,x,top,size=10,color='#203344',b=false)=>{s=String(s);page.drawText(s,{x,y:H-top-size,font:b?fb:fr,size,color:hex(color)});const font=b?boldOutline:regOutline,run=font.layout(s),scale=size/font.unitsPerEm;let cursor=0,paths=[];for(let i=0;i<run.glyphs.length;i++){let p=run.positions[i];paths.push(`<path d="${run.glyphs[i].path.toSVG()}" transform="translate(${cursor+p.xOffset} ${p.yOffset})"/>`);cursor+=p.xAdvance;}svg.push(`<g fill="${color}" transform="translate(${x} ${top+size}) scale(${scale} ${-scale})">${paths.join('')}</g>`);};
 const line=(x1,y1,x2,y2,color='#d6dfe4')=>{page.drawLine({start:{x:x1,y:H-y1},end:{x:x2,y:H-y2},thickness:.5,color:hex(color)});svg.push(`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width=".5"/>`);};
 rect(0,0,W,H);rect(0,0,W,9,accent);text('KALENTERI365.FI',30,25,10,accent,true);text('SUOMI  /  MA–SU  /  ISO-VIIKOT',W-210,27,8,'#687985');
 text(m?`${cap(MONTHS[m-1])} ${y}`:`${y}`,30,52,m?32:46,accent,true);
 text(m?'Omat suunnitelmat. Tärkeät päivät.':'Vuosikalenteri · Suomen juhlapyhät',30,m?94:106,11,'#687985');
 const drawMonth=(mm,x,top,w,h,mini=false)=>{
  let grid=monthGrid(y,mm),hs=holidays(y),wkW=mini?14:22,cw=(w-wkW)/7,head=mini?18:25,rh=(h-head)/grid.length;
  if(mini)text(cap(MONTHS[mm-1]),x,top-20,13,accent,true);
  rect(x,top,w,head,styleSlug==='musta'?'#f4f4f4':accent);
  ['Vk','Ma','Ti','Ke','To','Pe','La','Su'].forEach((d,i)=>text(d,x+(i===0?3:wkW+(i-1)*cw+5),top+6,mini?6:9,styleSlug==='musta'?'#222222':'#ffffff',true));
  grid.forEach((row,ri)=>{text(week(row[0]).number,x+3,top+head+ri*rh+7,mini?6:8,'#8b969e');row.forEach((d,j)=>{
   const xx=x+wkW+j*cw,tt=top+head+ri*rh,own=d.getUTCMonth()+1===mm,ev=hs.filter(h=>h.date===iso(d)),publicH=ev.some(h=>h.type==='holiday');
   rect(xx,tt,cw,rh,publicH&&styleSlug!=='musta'?'#fbf0f1':day(d)>4?'#f6f8f9':'#ffffff','#dfe6eb');
   text(d.getUTCDate()+(publicH&&styleSlug==='musta'?'*':''),xx+5,tt+5,mini?8:12,!own?'#b8c1c7':publicH&&styleSlug!=='musta'?'#a23c4b':accent,true);
   if(!mini&&own){let yy=tt+24;for(let evh of ev){let words=evh.name.split(' '),ll='';for(let word of words){let next=ll?ll+' '+word:word;if(next.length>Math.floor(cw/3.25)&&ll){text(ll,xx+4,yy,7,accent);yy+=8;ll=word;}else ll=next;}if(ll){text(ll,xx+4,yy,7,accent);yy+=8;}}
    const phase=moonPhases.find(p=>p.date.slice(0,10)===iso(d));if(phase&&yy+8<tt+rh)text(phase.name,xx+4,yy,6,accent);
   }
  });});
 };
 if(m){const top=127,h=portrait?360:365;drawMonth(m,30,top,W-60,h);if(portrait){text('MUISTIINPANOT',30,515,10,accent,true);for(let n=0;n<9;n++)line(30,550+n*23,W-30,550+n*23);}else{text('MUISTIINPANOT',30,510,7,'#687985',true);line(122,520,W-30,520);line(30,540,W-30,540);}}
 else {let x0=30,y0=157,gap=16,cols=portrait?3:4,rows=12/cols,w=(W-60-(cols-1)*gap)/cols,h=(H-y0-43-(rows-1)*34)/rows;for(let mm=1;mm<=12;mm++)drawMonth(mm,x0+(mm-1)%cols*(w+gap),y0+Math.floor((mm-1)/cols)*(h+34),w,h,true);}
 text('www.Kalenteri365.fi',30,H-24,8,accent,true);text('Pyhäpäivät on merkitty. Aattojen vapaa riippuu työehtosopimuksesta.',W-330,H-23,6.5,'#687985');
 const stem=`kalenteri-${y}${m?'-'+String(m).padStart(2,'0'):''}-${styleSlug}${moonPhases.length?'-kuu':''}`;
 await fs.mkdir(out,{recursive:true});await fs.writeFile(`${out}/${stem}.pdf`,await doc.save());
 // Vector PDF is resolution independent. Raster download is rendered at 600 pixels/inch.
 const xml=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg.join('')}</svg>`;
 await sharp(Buffer.from(xml),{density:600}).webp({quality:83,effort:2}).withMetadata({density:600}).toFile(`${out}/${stem}.webp`);
 await sharp(Buffer.from(xml),{density:130}).resize({width:1000}).webp({quality:80}).toFile(`${out}/${stem}-preview.webp`);
 return {stem,year:y,month:m,style:styleSlug,width:Math.round(W/72*600),height:Math.round(H/72*600)};
}
