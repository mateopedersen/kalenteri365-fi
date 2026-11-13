import {PDFDocument,rgb,pushGraphicsState,popGraphicsState,rectangle,clip,endPath} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import {MONTHS,cap,monthGrid,week,holidays,iso,day} from './calendar.mjs';
import {printArtwork} from './print-art.mjs';

const config=(orientation,layout,theme)=>({orientation,layout,theme,paper:'A4'});
// The original four identifiers are stable download URLs. The fifth tuple item
// is public presentation metadata used by previews, audits and print controls.
export const STYLES=[
 ['suomi','Sinivalkoinen Suomi','Valkoinen arkki, siniristilippu ja selkeä kalenterinäkymä.','#002F6C',config('landscape','flag','flag')],
 ['metsä','Metsä ja järvi','Metsäinen sivupalsta, järven sävyt ja rauhallinen kalenteriruudukko.','#28594E',config('landscape','sidebar','forest')],
 ['musta','Puhdas muste','Pelkistetty mustavalkoinen kalenteri, joka säästää värimustetta.','#202B33',config('landscape','minimal','minimal')],
 ['muistiinpanot','Muistiinpanot','Pystyarkki ja oma viivoitettu tila tärkeille muistiinpanoille.','#002F6C',config('portrait','notes','birch')],
 ['helsinki','Helsingin siluetti','Helsingin tuomiokirkon ja rantakaupungin oma vektorimaisema.','#002F6C',config('portrait','top-art','helsinki')],
 ['jarvimaisema','Tuhansien järvien maa','Leveä järvimaisema, purjevene ja väljät kalenteripäivät.','#1E5878',config('landscape','panorama','lake')],
 ['revontulet','Revontulten yö','Tumma revontulitaivas ja vaalea, hyvin erottuva kalenteri.','#193A66',config('portrait','night-header','aurora')],
 ['suomen-kartta','Suomi kartalla','Pelkistetty Suomen kartta, sinivalkoiset pinnat ja vahva vuosiluku.','#002F6C',config('portrait','map','map')],
 ['koivikko','Koivikon valo','Vaalea koivumaisema, hienot viivat ja ilmava vaakasivu.','#3E6758',config('landscape','split','birch')],
 ['kaamos','Pohjoinen talvi','Lumiset kuuset ja kerroksellinen pohjoinen talvimaisema.','#325C7C',config('portrait','top-art','winter')],
 ['saunaranta','Saunarannan rauha','Puusauna ja laituri järven rannalla, oma kalenteripalsta vieressä.','#795443',config('landscape','sidebar','sauna')],
 ['juhannus','Keskikesän valo','Juhannuskokko, koivut ja keskikesän valoisa järvenranta.','#426B5D',config('portrait','bottom-art','midsummer')],
 ['saaristo','Saariston majakka','Majakka, sileät rantakalliot ja sininen saaristomeri.','#2B5B83',config('landscape','island','archipelago')],
 ['kesaniitty','Kesäniityn kukat','Päivänkakkarat, niityn värit ja selkeä kokonainen kalenteri.','#5B704A',config('landscape','bottom-band','meadow')],
 ['pohjantahti','Pohjantähden alla','Tähtitaivas kehystää valkoista kalenteria tummalla pystyarkilla.','#123A68',config('portrait','star-frame','stars')],
];
const regular=await fs.readFile(new URL('../assets/fonts/Lato-Regular.ttf',import.meta.url));
const bold=await fs.readFile(new URL('../assets/fonts/Lato-Bold.ttf',import.meta.url));
const outlines=[fontkit.create(regular),fontkit.create(bold)];
const color=s=>rgb(...s.replace('#','').match(/../g).map(v=>parseInt(v,16)/255));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const A4={landscape:[841.889764,595.275591],portrait:[595.275591,841.889764]};
const artCache=new Map();

export async function exportCalendar(out,y,m,style,styleSlug=style,moonPhases=[]){
 if(!Number.isInteger(y)||y<1900||y>2100||!Number.isInteger(m)||m<0||m>12)throw Error('Invalid calendar period');
 const entry=STYLES.find(s=>s[0]===styleSlug);if(!entry)throw Error('Unknown calendar design: '+styleSlug);
 const [,label,,accent,meta]=entry,[W,H]=A4[meta.orientation],portrait=meta.orientation==='portrait';
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
 pdf.setTitle(`${m?cap(MONTHS[m-1]):'Vuosikalenteri'} ${y} | ${label} | Kalenteri365`);
 pdf.setAuthor('Kalenteri365.fi');pdf.setSubject('Suomi, pyhäpäivät, ISO-viikot ja omat suunnitelmat');pdf.setLanguage('fi-FI');
 const page=pdf.addPage([W,H]),fonts=[await pdf.embedFont(regular,{subset:true}),await pdf.embedFont(bold,{subset:true})],svg=[],textBounds=[];
 const ink='#172F46',muted='#647585',lineColor='#D7E1E9',soft='#F0F5FA';
 const rect=(x,top,w,h,fill='#FFFFFF',stroke=null,opacity=1)=>{page.drawRectangle({x,y:H-top-h,width:w,height:h,color:color(fill),opacity,...(stroke?{borderColor:color(stroke),borderWidth:.45}:{})});svg.push(`<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${fill}" opacity="${opacity}"${stroke?` stroke="${stroke}" stroke-width=".45"`:''}/>`);};
 const ellipse=(x,top,rx,ry,fill,opacity=1)=>{page.drawEllipse({x,y:H-top,xScale:rx,yScale:ry,color:color(fill),opacity});svg.push(`<ellipse cx="${x}" cy="${top}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}"/>`);};
 const line=(x1,y1,x2,y2,c=lineColor,width=.6)=>{page.drawLine({start:{x:x1,y:H-y1},end:{x:x2,y:H-y2},color:color(c),thickness:width});svg.push(`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${c}" stroke-width="${width}"/>`);};
 const widthOf=(s,size,b=false)=>fonts[b?1:0].widthOfTextAtSize(String(s),size);
 const fit=(s,max,size,min=5)=>{while(size>min&&widthOf(s,size,true)>max)size-=.25;return size;};
 const text=(value,x,top,size=10,c=ink,b=false)=>{
  const s=String(value),font=fonts[b?1:0],f=outlines[b?1:0];page.drawText(s,{x,y:H-top-size,size,font,color:color(c)});
  let cursor=0;const run=f.layout(s),d=run.glyphs.map((g,i)=>{const p=run.positions[i],node=`<path d="${g.path.toSVG()}" transform="translate(${cursor+p.xOffset} ${p.yOffset})"/>`;cursor+=p.xAdvance;return node;}).join('');svg.push(`<g fill="${c}" transform="translate(${x} ${top+size}) scale(${size/f.unitsPerEm} ${-size/f.unitsPerEm})">${d}</g>`);
  textBounds.push({text:s,x,top,right:x+widthOf(s,size,b),bottom:top+size});
 };
 const center=(s,x,top,w,size=10,c=ink,b=false)=>text(s,x+(w-widthOf(s,size,b))/2,top,size,c,b);
 const wrap=(value,maxWidth,size,b=false)=>{
  const lines=[];let current='';for(const word of String(value).split(/\s+/)){
   if(widthOf(word,size,b)>maxWidth){if(current){lines.push(current);current='';}let fragment='';for(const ch of word){if(fragment&&widthOf(fragment+ch,size,b)>maxWidth){lines.push(fragment);fragment=ch;}else fragment+=ch;}current=fragment;continue;}
   const next=current?current+' '+word:word;if(current&&widthOf(next,size,b)>maxWidth){lines.push(current);current=word;}else current=next;
  }if(current)lines.push(current);return lines;
 };
 let artId=0;
 function illustration(theme,x,top,w,h){
  const key=theme+':'+(w/h).toFixed(8);let scene=artCache.get(key);if(!scene){scene=printArtwork(theme,w/h);artCache.set(key,scene);}const scale=w/scene.width,id='art-clip-'+artId++;
  page.pushOperators(pushGraphicsState(),rectangle(x,H-top-h,w,h),clip(),endPath());svg.push(`<defs><clipPath id="${id}"><rect x="${x}" y="${top}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})"><g transform="translate(${x} ${top}) scale(${scale})">`);
  for(const s of scene.shapes){
   if(s.type==='rect'){page.drawRectangle({x:x+s.x*scale,y:H-top-(s.y+s.h)*scale,width:s.w*scale,height:s.h*scale,color:color(s.fill),opacity:s.opacity});svg.push(`<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${s.fill}" opacity="${s.opacity}"/>`);}
   else if(s.type==='ellipse'){page.drawEllipse({x:x+s.x*scale,y:H-top-s.y*scale,xScale:s.rx*scale,yScale:s.ry*scale,color:color(s.fill),opacity:s.opacity});svg.push(`<ellipse cx="${s.x}" cy="${s.y}" rx="${s.rx}" ry="${s.ry}" fill="${s.fill}" opacity="${s.opacity}"/>`);}
   else{page.drawSvgPath(s.d,{x,y:H-top,scale,...(s.fill?{color:color(s.fill)}:{}),...(s.stroke?{borderColor:color(s.stroke),borderWidth:s.strokeWidth*scale}:{}),opacity:s.opacity,borderOpacity:s.opacity});svg.push(`<path d="${escape(s.d)}" fill="${s.fill||'none'}"${s.stroke?` stroke="${s.stroke}" stroke-width="${s.strokeWidth}"`:''} opacity="${s.opacity}"/>`);}
  }svg.push('</g></g>');page.pushOperators(popGraphicsState());
 }
 let gx=32,gy=142,gw=W-64,gh=H-210,cols=portrait?3:4,notes=null;
 const name=m?cap(MONTHS[m-1]):'Vuosikalenteri';
 function heading(x,top,w,{large=40,white=false,stack=false}={}){
  const c=white?'#FFFFFF':accent;let yy=top;text('KALENTERI365',x,yy,8,c,true);yy+=20;
  if(stack){text(String(y),x,yy,fit(y,w,large),c,true);yy+=large+10;text(name,x,yy,fit(name,w,m?26:15),c,true);}
  else{const title=m?`${name} ${y}`:String(y);text(title,x,yy,fit(title,w,m?31:large),c,true);yy+=(m?31:large)+8;text(m?'Suomen pyhäpäivät ja omat suunnitelmat':'Vuosi yhdellä silmäyksellä',x,yy,9,white?'#CBDCEB':muted);}
 }
 rect(0,0,W,H);
 switch(meta.layout){
  case'flag':illustration('flag',W-355,12,330,103);heading(32,22,W-405,{large:48});line(32,124,W-32,124,accent,1.6);gy=150;gh=H-222;notes={x:32,y:H-66,w:W-64,lines:1};break;
  case'sidebar':{
   const sw=styleSlug==='saunaranta'?232:210;rect(0,0,sw,H,styleSlug==='saunaranta'?'#F2ECE4':'#EAF0EA');illustration(meta.theme,14,16,sw-28,portrait?150:178);heading(23,219,sw-46,{large:50,stack:true});text('SUOMI',23,H-114,9,accent,true);text('Maanantaista sunnuntaihin',23,H-97,8,muted);line(23,H-76,sw-23,H-76,'#BECDC8');gx=sw+25;gw=W-gx-28;gy=57;gh=H-121;cols=3;break;
  }
  case'minimal':heading(32,22,W-64,{large:52});line(32,115,W-32,115,accent,1.2);gy=146;gh=H-213;notes={x:32,y:H-65,w:W-64,lines:1};break;
  case'notes':heading(32,22,W-64,{large:47});line(32,113,W-32,113,accent,1.2);gy=148;gh=m?344:H-308;notes={x:32,y:m?525:H-128,w:W-64,lines:m?9:3};break;
  case'top-art':illustration(meta.theme,0,0,W,164);heading(32,184,W-64,{large:42});gy=278;gh=H-(m?366:341);if(m)notes={x:32,y:H-67,w:W-64,lines:1};break;
  case'panorama':illustration(meta.theme,0,0,W,149);heading(32,164,W-64,{large:37});gy=273;gh=H-338;break;
  case'night-header':illustration('aurora',0,0,W,202);heading(32,22,W-64,{large:56,white:true});gy=238;gh=H-300;break;
  case'map':illustration('map',W-245,11,228,178);heading(32,26,W-282,{large:54,stack:true});line(32,212,W-32,212,accent,1.3);gy=244;gh=H-307;break;
  case'split':illustration('birch',W*.51,0,W*.49,128);heading(32,20,W*.46,{large:46});gy=160;gh=H-225;break;
  case'bottom-art':heading(32,24,W-64,{large:48});gy=155;gh=m?426:427;illustration('midsummer',0,H-211,W,157);break;
  case'island':illustration('archipelago',0,0,W*.36,160);heading(W*.39,22,W*.56,{large:45});gy=191;gh=H-254;break;
  case'bottom-band':heading(32,22,W-64,{large:45});gy=148;gh=H-285;illustration('meadow',0,H-118,W,69);break;
  case'star-frame':rect(0,0,W,H,'#102B4C');illustration('stars',0,0,W,200);heading(32,24,W-64,{large:56,white:true});rect(22,222,W-44,H-277,'#FFFFFF');gx=35;gw=W-70;gy=250;gh=H-318;cols=m?3:2;break;
 }
 const hs=holidays(y),holidayMap=new Map();for(const h of hs){if(!holidayMap.has(h.date))holidayMap.set(h.date,[]);holidayMap.get(h.date).push(h);}
 let overflowCount=0,cellMinimumFont=99;
 function drawMonth(mm,x,top,w,h,mini=false){
  const rows=monthGrid(y,mm),numberW=mini?13:22,cellW=(w-numberW)/7,titleH=mini?22:0,head=mini?15:25,cellH=(h-titleH-head)/rows.length,gridTop=top+titleH;
  if(mini){text(String(mm).padStart(2,'0'),x,top+2,7,muted,true);text(cap(MONTHS[mm-1]),x+19,top,Math.min(11.3,w*.075),accent,true);line(x,top+17,x+w,top+17,accent,.8);}
  const flat=styleSlug==='musta'||mini,headerFill=flat?'#FFFFFF':accent;
  rect(x,gridTop,w,head,headerFill);['Vk','Ma','Ti','Ke','To','Pe','La','Su'].forEach((d,i)=>center(d,x+(i?numberW+(i-1)*cellW:0),gridTop+(mini?3.2:7),i?cellW:numberW,mini?5.8:8,flat?muted:'#FFFFFF',true));
  if(flat)line(x,gridTop+head,x+w,gridTop+head,lineColor,.45);
  rows.forEach((row,ri)=>{
   const tt=gridTop+head+ri*cellH;center(week(row[0]).number,x,tt+(mini?4:7),numberW,mini?5.5:7,muted);
   row.forEach((d,j)=>{
    const xx=x+numberW+j*cellW,own=d.getUTCMonth()+1===mm,events=own?(holidayMap.get(iso(d))||[]):[],publicH=events.some(e=>e.type==='holiday'),sunday=j===6;
    const fill=styleSlug==='musta'?'#FFFFFF':publicH?'#FBEFF0':j>4?'#F0F5FA':'#FFFFFF';
    rect(xx,tt,cellW,cellH,fill,mini?null:lineColor);
    if(mini&&ri<rows.length-1)line(xx,tt+cellH,xx+cellW,tt+cellH,'#E7EDF2',.25);
    const dateSize=mini?7.3:13,dateColor=!own?'#A5AFB8':publicH||sunday?styleSlug==='musta'?ink:'#9C3045':ink;
    if(mini)center(d.getUTCDate()+(publicH&&styleSlug==='musta'?'*':''),xx,tt+4,cellW,dateSize,dateColor,own);
    else text(d.getUTCDate()+(publicH&&styleSlug==='musta'?'*':''),xx+5,tt+5,dateSize,dateColor,true);
    if(!mini&&own){
     let size=7,lines=[];const titles=events.map(e=>e.name);const phase=moonPhases.find(p=>p.date.slice(0,10)===iso(d));if(phase)titles.push(phase.name);
     const available=cellH-26;while(true){lines=titles.flatMap(t=>wrap(t,cellW-10,size));if(lines.length*size*1.18<=available||size<=4.7)break;size-=.2;}
     cellMinimumFont=Math.min(cellMinimumFont,size);if(lines.length*size*1.18>available+.05)overflowCount++;
     lines.forEach((s,i)=>text(s,xx+5,tt+24+i*size*1.18,size,publicH?'#8D3242':accent));
    }
   });
  });
 }
 if(m)drawMonth(m,gx,gy,gw,gh);
 else{const rowCount=Math.ceil(12/cols),gapX=17,gapY=16,monthW=(gw-gapX*(cols-1))/cols,monthH=(gh-gapY*(rowCount-1))/rowCount;for(let mm=1;mm<=12;mm++)drawMonth(mm,gx+(mm-1)%cols*(monthW+gapX),gy+Math.floor((mm-1)/cols)*(monthH+gapY),monthW,monthH,true);}
 if(notes){text('MUISTIINPANOT',notes.x,notes.y,7.3,accent,true);for(let i=0;i<notes.lines;i++)line(notes.x,notes.y+(notes.lines===1?12:21)+i*22,notes.x+notes.w,notes.y+(notes.lines===1?12:21)+i*22);}
 // Footer is intentionally small and separate from the calendar. The wordmark is
 // a brand treatment, not a claim that a registered trademark exists.
 const footerTop=H-40,dark=meta.layout==='star-frame';line(32,footerTop-9,W-32,footerTop-9,dark?'#3D5877':lineColor,.6);
 rect(32,footerTop,19,22,'#FFFFFF',dark?'#AFC8DD':'#9FB7CE');rect(32,footerTop,19,5,accent);rect(36,footerTop-3,1.4,6,'#92A4B2');rect(45,footerTop-3,1.4,6,'#92A4B2');for(let row=0;row<2;row++)for(let col=0;col<3;col++)rect(35+col*4.4,footerTop+9+row*4.5,2.8,2.8,row===0&&col===1?accent:'#C1D2E1');
 text('Kalenteri365™',59,footerTop-1,11.5,dark?'#FFFFFF':accent,true);text('kalenteri365.fi',59,footerTop+15,7,dark?'#C9D8E7':muted);
 const footer='Suomi · ISO-viikot · Pyhäpäivät merkitty';text(footer,W-32-widthOf(footer,6.7),footerTop+9,6.7,dark?'#C9D8E7':muted);
 const invalid=textBounds.filter(t=>t.x<20||t.right>W-20||t.top<0||t.bottom>H-12);if(invalid.length)throw Error('Print text outside page: '+JSON.stringify(invalid.slice(0,3)));
 if(overflowCount)throw Error(`Calendar holiday text overflow: ${y}/${m}/${styleSlug}: ${overflowCount} cells`);
 const stem=`kalenteri-${y}${m?'-'+String(m).padStart(2,'0'):''}-${styleSlug}${moonPhases.length?'-kuu':''}`;
 await fs.mkdir(out,{recursive:true});await fs.writeFile(`${out}/${stem}.pdf`,await pdf.save());
 // Every letter is outlined in the SVG used for the raster, so Finnish glyphs
 // never depend on the machine rendering the downloadable image.
 const xml=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg.join('')}</svg>`;
 await sharp(Buffer.from(xml),{density:600}).flatten({background:"#FFFFFF"}).webp({quality:87,effort:2}).withMetadata({density:600}).toFile(`${out}/${stem}.webp`);
 await sharp(Buffer.from(xml),{density:130}).flatten({background:"#FFFFFF"}).resize({width:1000}).webp({quality:84}).toFile(`${out}/${stem}-preview.webp`);
 return {stem,year:y,month:m,style:styleSlug,width:Math.round(W/72*600),height:Math.round(H/72*600),dpi:600,paper:'A4',orientation:meta.orientation,layout:meta.layout,minimumHolidayFont:cellMinimumFont===99?null:Math.round(cellMinimumFont*100)/100};
}
