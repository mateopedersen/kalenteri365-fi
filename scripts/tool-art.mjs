import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

// Original object illustrations. Each tool has its own composition; shared
// materials keep the collection coherent without reusing one icon as a badge.
const materials = `<defs>
 <linearGradient id="paper" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#fffef9"/><stop offset=".55" stop-color="#fcfaf2"/><stop offset="1" stop-color="#ced9de"/></linearGradient>
 <linearGradient id="edge" x2="1" y2="1"><stop stop-color="#f4f5ed"/><stop offset=".4" stop-color="#a2b4be"/><stop offset="1" stop-color="#4e697a"/></linearGradient>
 <linearGradient id="blue" x1=".05" y1="0" x2=".85" y2="1"><stop stop-color="#6099b9"/><stop offset=".15" stop-color="#3275a5"/><stop offset=".55" stop-color="#144c7b"/><stop offset="1" stop-color="#082c51"/></linearGradient>
 <linearGradient id="navy" x2=".7" y2="1"><stop stop-color="#355773"/><stop offset=".45" stop-color="#1b354c"/><stop offset="1" stop-color="#081e31"/></linearGradient>
 <linearGradient id="teal" x2=".7" y2="1"><stop stop-color="#a2dad2"/><stop offset=".23" stop-color="#579f9f"/><stop offset=".8" stop-color="#276b74"/><stop offset="1" stop-color="#15424f"/></linearGradient>
 <linearGradient id="metal" x2="1" y2=".35"><stop stop-color="#456073"/><stop offset=".18" stop-color="#acbdc7"/><stop offset=".3" stop-color="#fff"/><stop offset=".46" stop-color="#d6e2e7"/><stop offset=".68" stop-color="#778d9d"/><stop offset=".86" stop-color="#e4edf1"/><stop offset="1" stop-color="#536c7b"/></linearGradient>
 <linearGradient id="gold" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#9c712d"/><stop offset=".2" stop-color="#edce80"/><stop offset=".38" stop-color="#fff0b4"/><stop offset=".62" stop-color="#cfa452"/><stop offset="1" stop-color="#805723"/></linearGradient>
 <linearGradient id="wood" x2=".8" y2="1"><stop stop-color="#deb788"/><stop offset=".42" stop-color="#b98653"/><stop offset="1" stop-color="#754a32"/></linearGradient>
 <linearGradient id="rose" x2=".75" y2="1"><stop stop-color="#f8c2bf"/><stop offset=".42" stop-color="#ce7789"/><stop offset="1" stop-color="#793f67"/></linearGradient>
 <linearGradient id="green" x2=".6" y2="1"><stop stop-color="#b5d898"/><stop offset=".35" stop-color="#65976d"/><stop offset="1" stop-color="#28534c"/></linearGradient>
 <linearGradient id="orange" x2=".7" y2="1"><stop stop-color="#ffd49a"/><stop offset=".4" stop-color="#db954f"/><stop offset="1" stop-color="#a45331"/></linearGradient>
 <radialGradient id="pearl" cx=".32" cy=".24" r=".78"><stop stop-color="#fffef2"/><stop offset=".45" stop-color="#e6e8df"/><stop offset=".8" stop-color="#a5b5bd"/><stop offset="1" stop-color="#4e6b7b"/></radialGradient>
 <radialGradient id="moon" cx=".3" cy=".22" r=".8"><stop stop-color="#e5e8e3"/><stop offset=".4" stop-color="#b8c3c4"/><stop offset=".76" stop-color="#728795"/><stop offset="1" stop-color="#2d465d"/></radialGradient>
 <radialGradient id="copper" cx=".28" cy=".2" r=".8"><stop stop-color="#f5be94"/><stop offset=".35" stop-color="#bb795c"/><stop offset=".8" stop-color="#75464a"/><stop offset="1" stop-color="#2b253b"/></radialGradient>
 <radialGradient id="sun" cx=".36" cy=".27"><stop stop-color="#fffde4"/><stop offset=".35" stop-color="#ffe095"/><stop offset=".75" stop-color="#edb35a"/><stop offset="1" stop-color="#be7831"/></radialGradient>
 <radialGradient id="dark" cx=".3" cy=".24" r=".8"><stop stop-color="#3e5a71"/><stop offset=".6" stop-color="#172e45"/><stop offset="1" stop-color="#051a30"/></radialGradient>
 <radialGradient id="glass" cx=".3" cy=".2"><stop stop-color="#e7ffff" stop-opacity=".9"/><stop offset=".5" stop-color="#a1d6e2" stop-opacity=".3"/><stop offset="1" stop-color="#458ba6" stop-opacity=".7"/></radialGradient>
 <filter id="shadow" x="-35%" y="-35%" width="180%" height="200%"><feDropShadow dx="1" dy="7" stdDeviation="5" flood-color="#132b44" flood-opacity=".21"/></filter>
 <filter id="ground" x="-30%" y="-160%" width="160%" height="420%"><feGaussianBlur stdDeviation="5"/></filter>
 <clipPath id="moonclip"><circle r="73"/></clipPath>
</defs>`;
const g=(body,transform='')=>`<g${transform?` transform="${transform}"`:''}>${body}</g>`;
const stroke=(d,color='#476983',width=2,extra='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect=(x,y,w,h,fill,rx=0,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const text=(value,x,y,size=20,color='#204567',extra='')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${color}" font-weight="700" ${extra}>${value}</text>`;
const circle=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const number=(n,x,y,size=30)=>text(n,x,y,size,'#17456b','text-anchor="middle"');
const tinygrid=(cols,rows,x,y,w,h,selected=-1)=>Array.from({length:cols*rows},(_,i)=>rect(x+(i%cols)*w/cols+2,y+Math.floor(i/cols)*h/rows+2,w/cols-5,h/rows-5,i===selected?'url(#blue)':i%cols>=cols-2?'#b9d5df':'#d1d8d4',1.5)).join('');
function page({x=72,y=40,w=170,h=194,color='blue',title='',grid=true}={}){
 let out=`<path d="M${x+4} ${y+6}h${w}v${h}h-${w}Z" fill="#607d91"/>`;
 for(let i=3;i>=0;i--)out+=rect(x+i,y+i*2,w,h,'url(#edge)',6);
 out+=rect(x,y,w,h,'url(#paper)',6,`stroke="#bdc9cd" stroke-width="1"`);
 out+=`<path d="M${x+6} ${y}h${w-12}q6 0 6 6v42h-${w}V${y+6}q0-6 6-6Z" fill="url(#${color})"/>`;
 out+=stroke(`M${x+7} ${y+3}h${w-14}`,'#fff',1,'opacity=".35"');
 for(const q of [x+35,x+w-35])out+=circle(q,y+15,5,'#142f45')+`<path d="M${q-3} ${y+14}v-20q0-8 5-8t5 8v20" fill="none" stroke="url(#metal)" stroke-width="5"/>`;
 if(title)out+=text(title,x+w/2,y+36,19,'#fff','text-anchor="middle"');
 out+=grid?tinygrid(7,5,x+12,y+61,w-24,h-81,16):'';
 return out+stroke(`M${x+10} ${y+h-6}h${w-20}`,'#fff',1,'opacity=".9"');
}
function notebook({x=58,y=38,w=175,h=195,color='blue',lines=true}={}){
 let out=rect(x+6,y+5,w,h,'#293d50',10)+rect(x+1,y,w,h,'url(#edge)',9)+rect(x,y-3,w-6,h-4,'url(#'+color+')',9);
 out+=rect(x+13,y-3,8,h-4,'#fff',0,'opacity=".13"')+rect(x+w-29,y-3,7,h-4,'#0a2038',0,'opacity=".45"');
 out+=stroke(`M${x+9} ${y+9}h${w-29}v${h-32}h-${w-29}Z`,'#b8d3dd',1,'opacity=".45" stroke-dasharray="2 3"');
 if(lines)out+=Array.from({length:6},(_,i)=>stroke(`M${x+36} ${y+55+i*18}h${w-80}`,'#b7d7de',1,'opacity=".6"')).join('');
 return out+`<path d="M${x+w-45} ${y+h-4}v18l-8-7-8 6v-17" fill="url(#gold)"/>`;
}
function pen(x=235,y=77,angle=17,fill='blue'){
 return g(`<path d="M-6 0Q0-5 6 0v119l-6 24-6-24Z" fill="url(#${fill})" stroke="#214053"/><path d="M-6 119h12l-6 24Z" fill="url(#wood)"/><path d="m-2 135 2 8 2-8" fill="#24313d"/>${rect(-6,9,12,6,'url(#metal)')}${stroke('M-2 18v94','#fff',1.4,'opacity=".5"')}${stroke('M4 3h4v43','url(#metal)',2.5)}`,`translate(${x} ${y}) rotate(${angle})`);
}
function clock(x=166,y=134,r=85,variant='classic'){
 let out=circle(x+3,y+6,r,'#203d52')+circle(x,y,r,'url(#metal)')+circle(x,y,r-5,'url(#blue)')+circle(x,y,r-10,'url(#paper)');
 for(let i=0;i<60;i++){const a=i*Math.PI/30,q=r-15,z=i%5?3:8;out+=stroke(`M${x+Math.sin(a)*q} ${y-Math.cos(a)*q}l${-Math.sin(a)*z} ${Math.cos(a)*z}`,i%5?'#9aafb9':'#355773',i%5?1:2.6);}
 out+=stroke(`M${x} ${y}l-${r*.24} -${r*.35}`,'#284859',5)+stroke(`M${x} ${y}l${r*.44} -${r*.39}`,'#284859',3)+stroke(`M${x-r*.3} ${y+r*.25}l${r*.76} -${r*.64}`,'#b77a49',1.6)+circle(x,y,5,'url(#gold)');
 return out;
}
function moon(x=161,y=128,r=82,phase='full',warm=false){
 let out=circle(x,y,r,'url(#'+(warm?'copper':'moon')+')',`stroke="#d1dcdf" stroke-width=".8"`);
 const craters=[[12,-33,18],[-33,-9,13],[29,23,23],[-18,37,11],[-49,-40,8],[51,-12,7],[0,8,6],[-11,-61,8],[47,49,6],[-48,38,5],[12,62,6],[49,-45,5]];
 out+=g(craters.map(([cx,cy,rr],i)=>circle(cx,cy,rr,'#344d62',`opacity="${i%2?.13:.2}"`)+`<path d="M${cx-rr} ${cy}a${rr} ${rr} 0 0 1 ${rr*1.75} ${-rr*.5}" fill="none" stroke="#edf1eb" stroke-width="1.3" opacity=".25"/>`).join(''),`translate(${x} ${y}) scale(${r/82})`);
 if(phase==='new')out+=circle(x-2,y-1,r-1,'url(#dark)');
 if(phase==='right')out+=`<path d="M${x} ${y-r}a${r} ${r} 0 0 0 0 ${2*r}Z" fill="#09243c" opacity=".92"/>`;
 if(phase==='crescent'){
  const id=`phase-${x}-${y}-${r}`;
  out+=`<clipPath id="${id}">${circle(x,y,r,'#fff')}</clipPath><g clip-path="url(#${id})">${circle(x-r*.38,y-r*.13,r*.99,'url(#dark)')}</g>`;
 }
 return out;
}
function sun(x=164,y=121,r=63,rays=true){
 let out='';if(rays)for(let i=0;i<16;i++){const a=i*Math.PI/8;out+=stroke(`M${x+Math.sin(a)*(r+11)} ${y+Math.cos(a)*(r+11)}l${Math.sin(a)*13} ${Math.cos(a)*13}`,'#d6a455',i%2?2:3);}
 return out+circle(x,y,r+5,'#efd18c','opacity=".17"')+circle(x,y,r,'url(#sun)')+`<path d="M${x-r*.7} ${y-r*.3}a${r*.78} ${r*.78} 0 0 1 ${r*.9} -${r*.47}" fill="none" stroke="#fffce3" stroke-width="3" opacity=".5"/>`;
}
function leaf(x,y,angle=0,scale=1,color='green'){
 return g(`<path d="M0 0C-40-42-30-82 4-104C34-83 41-42 0 0Z" fill="url(#${color})"/>${stroke('M0-5 4-91M1-22-17-44M2-39 21-62M3-59-11-75','#e6eac0',1.5,'opacity=".6"')}`,`translate(${x} ${y}) rotate(${angle}) scale(${scale})`);
}
function star(x,y,r=12,color='gold'){return `<path d="M${Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,d=i%2?r*.45:r;return `${x+Math.cos(a)*d},${y+Math.sin(a)*d}`}).join('L')}Z" fill="url(#${color})"/>`;}
function flower(x=155,y=130,scale=1,color='paper'){
 return g(stroke('M0 65Q12 28 0 0','#5c7f59',4)+leaf(3,39,55,.32)+leaf(5,55,-55,.3)+Array.from({length:5},(_,i)=>`<ellipse cx="0" cy="-15" rx="10" ry="19" fill="url(#${color})" transform="rotate(${i*72})"/>`).join('')+circle(0,0,8,'url(#gold)'),`translate(${x} ${y}) scale(${scale})`);
}
function coin(x=160,y=188,r=30){return circle(x+3,y+3,r,'#936926')+circle(x,y,r,'url(#gold)',`stroke="#c0a063" stroke-width="1.5"`)+circle(x,y,r-5,'none',`stroke="#9b742f" stroke-width="1"`)+text('€',x,y+r*.39,r*1.12,'#88602e','text-anchor="middle"');}
function suitcase(x=84,y=68,w=146,h=158,color='blue'){
 return `${stroke(`M${x+w*.34} ${y}v-29q0-7 7-7h${w*.22}q7 0 7 7v29`,'url(#metal)',8)}${rect(x+5,y+4,w,h,'#17374d',16)}${rect(x,y,w,h,'url(#'+color+')',16)}${rect(x+8,y+7,w-16,h-15,'none',11,'stroke="#d0e5e9" stroke-opacity=".4"')}${[.23,.46,.7].map(t=>stroke(`M${x+w*t} ${y+15}v${h-32}`,'#fff',2,'opacity=".16"')).join('')}${rect(x+w-36,y+58,20,35,'url(#paper)',3)}${stroke(`M${x+w-32} ${y+66}h12m-12 5h12m-12 5h8`,'#738d9c',1)}${circle(x+22,y+h+5,7,'#173449')}${circle(x+w-19,y+h+5,7,'#173449')}`;
}
function cap(x=166,y=83,s=1){return g(`<path d="M-69 4-7-28 65-2-2 30Z" fill="url(#navy)" stroke="#5a7489"/><path d="M-38 20v26q35 23 75-4V14l-39 16Z" fill="url(#blue)"/>${stroke('M-3-2 57 10v59','url(#gold)',2.5)}${circle(-3,-2,4,'url(#gold)')}<path d="M53 65h8l4 23h-16Z" fill="url(#gold)"/>`,`translate(${x} ${y}) scale(${s})`);}
function laptop(x=60,y=54,w=180,h=120,inside=''){
 return `${rect(x+3,y+3,w,h,'#243c50',8)}${rect(x,y,w,h,'url(#metal)',8)}${rect(x+7,y+7,w-14,h-14,'url(#navy)',4)}${inside}<path d="M${x} ${y+h}l-27 43h${w+53}l-26-43Z" fill="url(#metal)" stroke="#859ba9"/><path d="M${x-27} ${y+h+43}q0 8 12 8h${w+30}q12 0 12-8" fill="#526f82"/><path d="M${x+60} ${y+h+11}h60l10 22h-80Z" fill="#a3b6c1"/>${Array.from({length:3},(_,i)=>stroke(`M${x+10-i*6} ${y+h+5+i*7}h${w-20+i*12}`,'#7c92a1',2)).join('')}`;
}
function openBook(x=161,y=139){return g(`<path d="M-108-78Q-48-94 0-68Q48-94 108-78v145Q44 50 0 76Q-44 50-108 67Z" fill="#17344c"/><path d="M-102-84Q-46-94 0-67Q49-92 103-83v143Q44 45 0 71Q-43 46-102 61Z" fill="url(#edge)"/><path d="M-96-91Q-40-97-2-72v137Q-41 40-96 53Z" fill="url(#paper)"/><path d="M2-72q42-24 96-17V54Q43 42 2 65Z" fill="url(#paper)"/>${Array.from({length:7},(_,i)=>stroke(`M-80 ${-65+i*15}Q-37 ${-72+i*15}-17 ${-55+i*15}`,'#bec9c8',1.3)+stroke(`M17 ${-55+i*15}Q45 ${-70+i*15}82 ${-65+i*15}`,'#bec9c8',1.3)).join('')}${stroke('M0-71V67','#6c8996',2)}<path d="M59-87v104l-9-9-8 10V-84Z" fill="url(#blue)"/>`,`translate(${x} ${y})`);}
function gift(){return `<path d="M65 113 159 144 259 110v113l-101 34-93-31Z" fill="url(#blue)"/><path d="M158 143 259 110v113l-101 34Z" fill="url(#navy)"/><path d="M59 88 159 60 266 86l-107 39Z" fill="url(#paper)"/><path d="M59 88v30l100 31v-24Z" fill="url(#edge)"/><path d="M159 125 266 86v30l-107 33Z" fill="url(#metal)"/><path d="m106 130 23 7v111l-23-7Zm95 2 23-8v110l-23 9Z" fill="url(#gold)"/><path d="M107 75 131 68l103 28-25 9Z" fill="url(#gold)"/><path d="M192 68 214 74l-103 30-23-7Z" fill="url(#gold)"/><path d="M158 76C82 79 84 15 124 32Q146 46 158 76ZM161 76C236 63 224 13 192 33Q171 47 161 76Z" fill="none" stroke="url(#gold)" stroke-width="13"/><path d="M157 77C116 102 129 108 109 123l2-32M164 78q11 18 44 32l-5-26" fill="url(#gold)"/>${circle(160,75,12,'url(#gold)')}`;}
function candle(){return `${flower(219,161,.62,'paper')}${rect(96,119,88,105,'url(#glass)',12,'stroke="#a2c0ce" stroke-width="2"')}<ellipse cx="140" cy="121" rx="43" ry="12" fill="#b9d7df" opacity=".65"/>${rect(113,91,53,123,'url(#paper)',5)}<ellipse cx="139" cy="92" rx="26" ry="7" fill="#f4e9d1"/>${stroke('M140 92v-16','#49413c',2)}<path d="M140 80C119 63 137 42 142 29C145 49 164 60 140 80Z" fill="url(#sun)"/>${stroke('M105 138v59','#fff',4,'opacity=".7"')}`;}
function hourglass(){return `<ellipse cx="157" cy="53" rx="76" ry="17" fill="url(#metal)"/><path d="M98 61C97 111 142 113 142 135S98 165 98 211H218C218 167 173 158 173 135s43-25 43-74Z" fill="url(#glass)" stroke="#8aabbc" stroke-width="2"/><path d="M111 78h92q-8 36-44 46-36-11-48-46ZM111 208q11-35 46-48 37 15 49 48Z" fill="url(#gold)"/><path d="M157 122v49" stroke="#d9ac5b" stroke-width="2"/><path d="M88 64v147m139-147v147" stroke="url(#metal)" stroke-width="9"/><ellipse cx="157" cy="214" rx="76" ry="17" fill="url(#metal)"/>${stroke('M106 81q-1 27 18 42','#fff',3,'opacity=".7"')}`;}
function calculator(){return `${rect(87,41,150,198,'#17384f',17)}${rect(82,33,150,198,'url(#blue)',17)}${rect(91,42,132,46,'#0c283c',8)}${rect(97,47,119,35,'#b9cfbf',4)}${text('365',206,75,26,'#304d4d','text-anchor="end"')}${Array.from({length:20},(_,i)=>{const x=94+(i%4)*30,y=105+Math.floor(i/4)*23;return rect(x+1,y+2,22,16,'#0c2a42',4)+rect(x,y,22,16,i===19?'url(#orange)':i%4===3?'url(#teal)':'url(#paper)',4)+stroke(`M${x+8} ${y+7}h6`,'#446076',1);}).join('')}${stroke('M91 36h111','#bbd9e5',1.5,'opacity=".6"')}`;}
function wallet(){return `${rect(64,93,191,129,'#253846',16)}${rect(58,84,190,128,'url(#wood)',16)}${rect(62,92,176,112,'none',11,'stroke="#f1d4aa" stroke-width="1.3" stroke-dasharray="2 3"')}<path d="M202 114h48v67h-48q-24-34 0-67" fill="#8f623f" stroke="#d4af7c"/>${circle(224,148,6,'url(#metal)')}`;}
function constellation(x=161,y=136,r=90){return `${circle(x+3,y+5,r,'#18384c')}${circle(x,y,r,'url(#metal)')}${circle(x,y,r-5,'url(#navy)')}${circle(x,y,r-12,'none','stroke="#87acbc" stroke-width=".8"')}${Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return stroke(`M${x+Math.sin(a)*(r-8)} ${y+Math.cos(a)*(r-8)}l${Math.sin(a)*-4} ${Math.cos(a)*-4}`,'#dfcc9b',1.3)}).join('')}${stroke(`M${x-52} ${y+25}l23-61 54 14 29 54-69 21-37-28`,'#9ac5d6',1.4)}${[[-52,25],[-29,-36],[25,-22],[54,32],[-15,53]].map(([a,b])=>star(x+a,y+b,6)).join('')}`;}
const makers={
 kalenteri:()=>g(`<path d="M80 236 109 44h109l40 192Z" fill="url(#navy)"/>${page({x:66,y:43,w:163,h:181,title:'VUOSI'})}${stroke('M78 233h176','url(#metal)',4)}`,'rotate(-7 160 140)'),
 'pdf-kalenteri':()=>`${rect(81,49,157,139,'url(#edge)',9)}${rect(100,26,121,125,'url(#paper)',3)}${tinygrid(7,5,108,50,104,75,10)}${rect(45,124,231,100,'url(#blue)',17)}${rect(54,131,212,31,'url(#metal)',9)}${rect(86,181,151,26,'#15394e',4)}<path d="M97 185h127l-4 60H82Z" fill="url(#paper)"/>${stroke('M101 202h106m-109 9h105m-107 9h83','#b3c2c8',2)}${circle(246,177,4,'#b8ddb8')}${text('PDF',159,155,20,'#173c61','text-anchor="middle"')}`,
 kuukausikalenteri:()=>g(page({x:71,y:39,w:180,h:193,title:'MARRASKUU'})+`<path d="M189 211h60l-58 24Z" fill="url(#edge)"/><path d="M189 211q6 28-7 30h60l9-28Z" fill="url(#paper)"/>`,'rotate(5 160 140)'),
 viikkokalenteri:()=>g(page({x:32,y:64,w:253,h:155,title:'VIIKKO',grid:false})+tinygrid(7,1,43,129,231,56,3)+Array.from({length:7},(_,i)=>number(i+1,60+i*33,124,11)).join(''),'rotate(-7 160 140)'),
 'tyhja-kalenteri':()=>`${g(page({x:63,y:43,w:175,h:187,title:'',grid:false})+Array.from({length:6},(_,i)=>stroke(`M83 ${114+i*18}h133`,'#c6d1d0',1)).join(''),'rotate(-8 160 140)')}${pen(242,82,19,'teal')}`,
 'luo-kalenteri':()=>`${g(page({x:65,y:40,w:166,h:177,title:'OMA'}) ,'rotate(-8 160 140)')}${pen(245,89,20,'orange')}<ellipse cx="234" cy="204" rx="39" ry="27" fill="url(#wood)" transform="rotate(-18 234 204)"/>${circle(224,203,8,'#eff3ed')}${circle(246,188,6,'url(#blue)')}${circle(259,202,6,'url(#rose)')}${circle(245,217,6,'url(#green)')}`,
 juhlapyhat:gift,
 liputuspaivat:()=>`${stroke('M72 244V31','url(#metal)',9)}${circle(72,28,7,'url(#gold)')}<path d="M79 46C128 25 166 66 231 39v129C169 196 128 153 79 176Z" fill="url(#paper)" stroke="#b2c5d0"/><path d="M118 39q15 1 32 6v130q-19-4-32-5Z" fill="url(#blue)"/><path d="M79 98c58-20 94 23 152-4v35c-63 25-102-18-152 2Z" fill="url(#blue)"/>${stroke('M84 51q39-17 66-2m10 4q38 10 65-6','#fff',2,'opacity=".65"')}${stroke('M50 245h44','url(#metal)',9)}`,
 merkkipaivat:candle,
 'koulujen-lomat':()=>`${sun(233,71,27)}${suitcase(74,72,138,151,'teal')}${rect(97,115,90,51,'url(#paper)',6)}${tinygrid(5,2,104,122,78,34,8)}`,
 koulukalenteri:()=>`${g(notebook({x:55,y:45,w:159,h:190,lines:false}),'rotate(-9 160 140)')}${g(page({x:156,y:109,w:113,h:125,title:'SYKSY'}),'rotate(8 215 170)')}`,
 lukujarjestys:()=>`${rect(39,52,244,179,'#2c485d',8)}${rect(32,43,244,179,'url(#metal)',8)}${rect(44,54,219,156,'url(#paper)',3)}${tinygrid(5,5,58,83,189,111,17)}${stroke('M60 71h184','#6d96aa',5)}${pen(273,75,13,'orange')}`,
 'yliopistojen-kalenterit':()=>`<path d="M52 122 163 85l106 36v14H52Z" fill="url(#metal)"/>${rect(65,132,191,84,'url(#edge)',2)}${[80,120,160,200,240].map(x=>rect(x-6,137,13,72,'url(#paper)',3)).join('')}${rect(53,208,215,12,'url(#metal)',2)}${rect(42,222,237,12,'url(#edge)',2)}${cap(163,61,.8)}`,
 ylioppilaskirjoitukset:()=>`${g(page({x:68,y:51,w:169,h:182,title:'KOE',grid:false})+Array.from({length:4},(_,i)=>rect(86,120+i*22,10,10,'#e1e9e9',2)+stroke(`M105 ${124+i*22}h105`,'#aebfc4',2)).join(''),'rotate(-7 160 140)')}${pen(243,87,19,'blue')}${circle(233,205,32,'url(#gold)')}${stroke('M217 204l12 12 23-29','#3b6765',5)}`,
 opiskelukalenteri:()=>`${g(openBook(156,139),'scale(.93) translate(7 14)')}${pen(247,93,16,'orange')}${cap(238,60,.55)}`,
 tyopaivat:()=>`${stroke('M128 74V54q0-10 10-10h44q10 0 10 10v20','url(#metal)',9)}${rect(44,75,227,157,'#19344a',14)}${rect(38,66,227,157,'url(#blue)',14)}${stroke('M48 83h207v128H48Z','#b6d0dc',1,'stroke-dasharray="3 3" opacity=".5"')}<path d="M39 82v64q110 28 225-2V82Z" fill="url(#blue)" stroke="#84aabf" stroke-opacity=".6"/>${rect(141,135,28,29,'url(#metal)',5)}${g(page({x:205,y:152,w:78,h:84,grid:true}),'rotate(8 244 190)')}`,
 tyopaivalaskuri:()=>`${g(calculator(),'translate(-27 0)')}${clock(241,199,46)}`,
 paivamaaralaskuri:()=>`${g(page({x:40,y:43,w:127,h:150,grid:false})+number('12',103,151,60),'rotate(-10 105 130)')}${g(page({x:162,y:79,w:123,h:154,grid:false,color:'teal'})+number('30',224,192,57),'rotate(8 224 155)')}${circle(161,195,30,'url(#gold)')}${stroke('M145 195h32m-16-16v32','#71572c',4)}`,
 paivalaskuri:hourglass,
 viikkonumerot:()=>`${g(page({x:52,y:47,w:222,h:185,title:'VIIKKO 46',grid:false})+tinygrid(7,4,63,120,195,83,10),'rotate(-5 160 140)')}${rect(61,107,24,100,'url(#teal)',4)}${[44,45,46,47].map((n,i)=>text(n,73,124+i*24,11,'white','text-anchor="middle"')).join('')}`,
 'vuoden-paiva':()=>g(page({x:69,y:47,w:180,h:181,title:'MARRASKUU',grid:false})+number('317',159,167,62)+text('365',158,199,18,'#52718a','text-anchor="middle"'),'rotate(-7 160 140)'),
 karkausvuosi:()=>g(page({x:64,y:42,w:182,h:193,color:'teal',title:'HELMIKUU',grid:false})+number('29',156,172,78)+stroke('M99 201h114','#b1c8c9',2),'rotate(7 160 140)'),
 lomasuunnittelija:()=>`${suitcase(69,68,153,162,'teal')}${leaf(248,224,-11,.7)}${sun(251,59,21,false)}${rect(107,105,55,29,'url(#paper)',3)}${stroke('M119 116h30m-29 8h18','#547786',1.4)}`,
 'pitkat-viikonloput':()=>`${g(page({x:42,y:53,w:181,h:176,title:'PE · LA · SU'}),'rotate(-6 160 140)')}<ellipse cx="242" cy="214" rx="38" ry="13" fill="url(#metal)"/><path d="M217 166h49v40q-24 27-49 0Z" fill="url(#paper)"/><ellipse cx="241" cy="166" rx="24" ry="8" fill="#77563a"/>${stroke('M269 173q28 0 0 26','url(#edge)',7)}${stroke('M237 148q-8-9 1-17m12 16q-7-8 0-14','#a0b8c5',2)}`,
 tyovuorosuunnittelija:()=>`${clock(143,132,89)}${g(stroke('M205 50q65 30 52 103','url(#teal)',10)+`<path d="m238 135 18 26 14-33" fill="url(#teal)"/>`)}${moon(250,195,31,'crescent')}${sun(69,218,22,false)}`,
 perhekalenteri:()=>`${g(notebook({x:71,y:47,w:179,h:183,color:'teal',lines:false}),'rotate(-5 160 140)')}${[[-47,115,'blue'],[43,115,'rose'],[0,164,'gold']].map(([x,y,c],i)=>g(`${circle(0,0,i===2?19:24,'url(#wood)')}<path d="M-${i===2?31:38} 60V35q5-23 ${i===2?31:38}-23t${i===2?31:38} 23v25Z" fill="url(#${c})"/>`,`translate(${160+x} ${y})`)).join('')}`,
 paivasuunnittelija:()=>`${g(notebook({x:55,y:38,w:180,h:198,color:'teal',lines:false})+Array.from({length:5},(_,i)=>stroke(`M91 ${94+i*23}l5 6 10-13`,'#d4e8d3',2)+stroke(`M116 ${93+i*23}h68`,'#c0dcdb',1.4)).join(''),'rotate(-6 160 140)')}${pen(248,81,16)}`,
 syntymapaivakalenteri:()=>`<ellipse cx="158" cy="231" rx="110" ry="22" fill="url(#metal)"/><path d="M62 151h192v69q-91 42-192 0Z" fill="url(#rose)"/><ellipse cx="158" cy="150" rx="96" ry="29" fill="url(#paper)"/><path d="M62 150q13 9 23 3v24q5 11 13 0v-16q12 6 24 1v24q9 13 15 0v-20q21 4 35 0v13q8 13 16 0v-17q18 0 28-9v14q8 9 15-2v-16l23-9" fill="url(#paper)"/>${[112,156,200].map((x,i)=>rect(x-4,92-i%2*10,8,59,'url(#teal)',2)+stroke(`M${x-3} 113l6-5m-6 16 6-5m-6 16 6-5`,'#e3f1e9',1)+`<path d="M${x} ${86-i%2*10}q-13-15 0-29 14 15 0 29" fill="url(#sun)"/>`).join('')}`,
 nimipaivat:()=>`${flower(120,93,1.05,'paper')}${flower(194,112,.85,'rose')}${flower(154,150,.95,'paper')}<path d="m98 178 94 5-25 57-36-1Z" fill="url(#paper)" stroke="#c1caca"/>${stroke('M107 181l29 48m42-43-22 43','#9eb4b8',1)}${g(rect(191,180,78,47,'url(#paper)',4)+stroke('M203 195h52m-52 10h38','#7a94a1',1.4)+circle(199,187,2,'#708c9a'),'rotate(16 220 202)')}`,
 kuukalenteri:()=>`${g(page({x:55,y:41,w:210,h:191,title:'KUU',grid:false}),'rotate(-5 160 140)')}${moon(158,143,55)}${[0,1,2,3,4].map((n)=>moon(88+n*35,214,11,n%2?'right':'full')).join('')}`,
 'kuun-vaiheet':()=>`${moon(157,116,70)}${moon(58,193,29,'new')}${moon(117,221,24,'right')}${moon(212,209,30,'crescent')}${moon(265,164,23,'right')}${stroke('M61 97q43-79 129-63M237 65q42 27 48 65','#9aadb8',1.3,'stroke-dasharray="3 6"')}`,
 taysikuu:()=>`${moon(162,132,101)}${star(42,61,8,'metal')}${star(274,204,6,'metal')}`,
 uusikuu:()=>`${moon(162,136,95,'new')}${stroke('M193 51q93 41 53 132','#95b0bc',2,'opacity=".6"')}${star(49,72,7)}${star(260,48,5)}${star(261,222,7)}`,
 'auringonnousu-ja-lasku':()=>`${sun(160,128,74)}<path d="M34 174 160 206 287 173l-125-23Z" fill="url(#glass)" stroke="#bdd2d7"/><path d="M34 174v14l126 32 127-34v-13l-125 33Z" fill="url(#teal)"/>${[0,1,2,3].map(i=>stroke(`M${65+i*8} ${177+i*9}q57 20 113 0`,'#ecf6e9',2,'opacity=".8"')).join('')}`,
 'kuun-nousu-ja-lasku':()=>`${moon(166,99,73,'crescent')}<path d="M35 202 104 117 142 170 182 143 284 215 160 245Z" fill="url(#navy)"/><path d="m68 169 36-52 26 38-19-6-12 18-11-7Z" fill="url(#paper)"/>${stroke('M135 225h72m-55 10h31','#a9ccd2',2)}`,
 'paivan-pituus':()=>`<ellipse cx="161" cy="220" rx="115" ry="32" fill="#34516b"/><ellipse cx="161" cy="210" rx="115" ry="32" fill="url(#metal)"/><ellipse cx="161" cy="205" rx="99" ry="26" fill="url(#paper)"/><path d="M122 204 190 88l-7 117Z" fill="url(#blue)"/><path d="m122 204 61 1-24 18Z" fill="#20384b" opacity=".3"/>${sun(79,69,31,false)}${[0,1,2,3,4,5,6].map(i=>{let a=Math.PI+i*Math.PI/6;return stroke(`M${161+Math.cos(a)*90} ${209+Math.sin(a)*23}l${-Math.cos(a)*10} ${-Math.sin(a)*4}`,'#607a8a',1.5)}).join('')}`,
 vuodenajat:()=>`${leaf(97,145,-35,.84)}${sun(230,86,41)}${leaf(145,235,-78,.8,'orange')}${g(Array.from({length:6},(_,i)=>stroke('M0 0v-39m0 11-10-10m10 10 10-10','#a4c7d8',3)).map((s,i)=>g(s,`rotate(${i*60})`)).join(''),`translate(220 203)`)}${flower(78,107,.52,'paper')}`,
 kellonsiirto:()=>`${clock(161,133,87)}${stroke('M57 139q-7-81 84-109','url(#gold)',9)}<path d="m127 13 24 14-27 16Z" fill="url(#gold)"/>${stroke('M264 128q6 81-82 110','url(#teal)',9)}<path d="m193 251-23-13 25-19Z" fill="url(#teal)"/>`,
 auringonpimennys:()=>`${sun(160,131,85)}${circle(171,125,82,'url(#dark)')}${stroke('M111 53q48-25 91 9','#fff4c4',3)}${star(47,57,5,'metal')}${star(275,199,6,'metal')}`,
 kuunpimennys:()=>`${moon(160,131,99,'full',true)}<path d="M160 32a99 99 0 0 1 0 198q74-103 0-198Z" fill="#182238" opacity=".44"/>${star(35,109,7,'metal')}${star(267,46,5,'metal')}`,
 perseidit:()=>`${circle(160,133,101,'url(#navy)')}${Array.from({length:18},(_,i)=>circle(76+(i*47)%172,48+(i*31)%165,i%3?1:2,'#c4dae6')).join('')}${[[-24,0],[20,54],[7,-53]].map(([x,y],i)=>`${stroke(`M${100+x} ${155+y}l${111-i*18} -${78-i*13}`,'#6799bb',9-i*2,'opacity=".2"')}${stroke(`M${100+x} ${155+y}l${90-i*12} -${64-i*8}`,'#e1eefa',2)}${star(100+x,155+y,7-i,'paper')}`).join('')}`,
 kylvokalenteri:()=>`${leaf(142,174,-35,.75)}${leaf(147,165,42,.65)}<path d="M96 167h106l-13 70q-39 21-79-1Z" fill="url(#orange)"/>${rect(88,159,122,24,'url(#orange)',7)}<ellipse cx="149" cy="160" rx="52" ry="9" fill="#695544"/>${stroke('M145 171v-72','#629569',5)}${g(`<path d="M-12 0h24l8 73-20 33-20-33Z" fill="url(#metal)"/>${rect(-8,-54,16,60,'url(#wood)',7)}`,`translate(239 116) rotate(17)`)}${stroke('M120 193l7 35','#f6c99b',2,'opacity=".5"')}`,
 'elakkeiden-maksupaivat':()=>`${wallet()}${coin(250,205,32)}${coin(227,239,25)}${g(page({x:75,y:41,w:99,h:109,title:'01',grid:false})+number('€',123,119,37),'rotate(-8 115 100)')}`,
 'etuuksien-maksupaivat':()=>`${g(page({x:59,y:37,w:171,h:181,title:'TUKI',grid:false})+stroke('M84 115h119m-119 22h92m-92 22h113m-113 22h75','#91abbc',3),'rotate(-7 140 135)')}${coin(235,204,37)}${stroke('M176 210l12 12 24-29','#589077',6)}`,
 horoskooppi:()=>`${constellation()}<ellipse cx="161" cy="134" rx="117" ry="34" fill="none" stroke="url(#gold)" stroke-width="5" transform="rotate(-38 161 134)"/>${star(222,49,15,'gold')}`,
 horoskooppimerkki:()=>`${g(constellation(123,123,82),'rotate(-12 123 123)')}${g(calculator(),'translate(156 95) scale(.48)')}${star(154,119,23,'paper')}`,
 verokalenteri:()=>`${g(notebook({x:61,y:45,w:154,h:185,color:'navy',lines:false}),'rotate(-8 130 150)')}${g(page({x:139,y:83,w:120,h:150,title:'VERO',grid:false})+stroke('M159 155h77m-77 15h64m-64 16h79','#99b1bd',2),'rotate(8 190 160)')}${coin(228,220,28)}${pen(269,74,16,'teal')}`,
 hakukalenteri:()=>`<path d="M49 103 161 42 274 105v125H49Z" fill="url(#edge)"/>${rect(76,77,171,127,'url(#paper)',4)}${stroke('M100 111h95m-95 20h122m-122 20h89','#94a9b4',3)}<path d="m49 104 110 74 115-73v125H49Z" fill="url(#blue)"/><path d="m49 230 94-64q17-13 33 0l98 64Z" fill="url(#teal)"/>${cap(232,55,.58)}`,
 kausimuistutukset:()=>`${g(notebook({x:73,y:43,w:173,h:192,color:'teal',lines:false}),'rotate(-6 160 140)')}${leaf(107,185,-27,.72,'orange')}${sun(206,111,29,false)}${g(Array.from({length:6},(_,i)=>g(stroke('M0 0v-24m0 9-6-6m6 6 6-6','#c5e1e9',2),`rotate(${i*60})`)).join(''),'translate(198 188)')}${flower(146,104,.5,'paper')}`,
};

export async function makeToolArt(dir, tools){
 const slugs=tools.map(t=>t[0]);
 if(new Set(slugs).size!==slugs.length)throw Error('Duplicate tool illustration mapping');
 if(slugs.some(slug=>!makers[slug]))throw Error('Missing original tool illustration: '+slugs.filter(s=>!makers[s]).join(', '));
 const records=[];
 for(const [slug,title] of tools){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 280" width="320" height="280"><title>${title.replaceAll('&','&amp;')}</title>${materials}<ellipse cx="160" cy="251" rx="91" ry="9" fill="#16344e" opacity=".16" filter="url(#ground)"/><g filter="url(#shadow)">${makers[slug]()}</g></svg>`;
  await fs.writeFile(path.join(dir,`tool-${slug}.svg`),svg);
  records.push({slug,title,filename:`tool-${slug}.svg`,sha256:createHash('sha256').update(svg).digest('hex'),bytes:Buffer.byteLength(svg)});
 }
 return records;
}
