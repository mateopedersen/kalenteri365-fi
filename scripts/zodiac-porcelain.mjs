// Original vector sculptures for the Finnish edition. Curved silhouettes,
// separate depth planes and material lighting remain resolution independent.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const names={oinas:'Oinas',harka:'Härkä',kaksoset:'Kaksoset',rapu:'Rapu',leijona:'Leijona',neitsyt:'Neitsyt',vaaka:'Vaaka',skorpioni:'Skorpioni',jousimies:'Jousimies',kauris:'Kauris',vesimies:'Vesimies',kalat:'Kalat'};
let id;
const url=name=>`url(#${id}-${name})`;
const path=(d,fill='ice',extra='')=>`<path d="${d}" fill="${fill.startsWith('#')||fill==='none'?fill:url(fill)}" ${extra}/>`;
const line=(d,color='#537d9a',width=1.2,extra='')=>path(d,'none',`stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}`);
const solid=(d,fill='ice',depth=3)=>`<g>${path(d,'edge',`transform="translate(1.8 ${depth})"`)}${path(d,fill,`stroke="#a8c6dc" stroke-opacity=".45" stroke-width=".6"`)}</g>`;
const circle=(x,y,r,fill='ice',extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill.startsWith('#')?fill:url(fill)}" ${extra}/>`;
const eye=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="3.5" fill="#102e49"/>${circle(x-1,y-1,1.35,'#fff')}`;
const mirror=body=>`<g>${body}</g><g transform="translate(360 0) scale(-1 1)">${body}</g>`;
const art={};

art.oinas=()=>{
 const horn=solid('M142 107C138 52 96 31 62 53 32 74 37 123 62 142c24 18 53 8 54-17 1-20-17-32-29-23-10 7-7 19 1 22-18 3-28-20-15-34 15-18 38-5 42 21l18 20Z','silver',5)
 +[0,1,2,3,4,5].map(i=>line(`M${54+i*11} ${66-i*2}q-11 28 3 47`,'#627f95',1.2,'opacity=".52"')).join('');
 return mirror(horn)+mirror(solid('M134 127q-27-27-52-8 8 23 41 26Z','blue'))
 +solid('M126 108q14-27 54-28 41 1 55 28l-8 72-23 58q-24 22-48 0l-24-58Z','ice',5)
 +path('M180 91q25 5 33 25l-11 67-12 37-10 8Z','frost')
 +Array.from({length:9},(_,i)=>solid(`M${129+i*8} ${107+(i%2)*5}q5-16 16-11 10 7 1 18-10 5-17-7Z`,'ice',1)).join('')
 +line('M149 133q-9 24-6 40m68-40q10 24 7 40','#86a5ba',1.8)+eye(150,161)+eye(210,161)
 +solid('M154 207q26-17 52 0l-3 27q-23 21-46 0Z','silver')+path('M168 216q12-9 24 0l-12 12Z','navy')
 +line('M180 228v11m-11 2q11 5 22 0','#31536b',1.5);
};
art.harka=()=>mirror(solid('M139 102C100 100 61 80 57 40c-13 39 6 76 41 91l40 4Z','silver',5)+solid('M137 134q-40-32-61-7 15 23 56 22Z','blue'))
 +solid('M124 112q57-37 113 2l-10 76-27 46h-47l-23-45Z','navy',5)
 +solid('M135 111q43-20 86 1l-12 50-30 20-30-20Z','ice')
 +path('M179 112q25-2 33 10l-13 39-20 18Z','frost')
 +solid('M130 152q25-12 39 4l-3 12-34 3Z','blue',2)+solid('M229 152q-25-12-39 4l3 12 34 3Z','blue',2)
 +eye(149,173)+eye(210,173)+solid('M169 174q10-6 21 0l15 37-48 3Z','silver')
 +solid('M142 216q36-25 76-2l-5 31q-34 21-67-1Z','ice',5)
 +path('M153 226q-8-1-10 7 10 6 17-2m42-6q8-1 10 7-10 6-17-2','navy')
 +line('M162 247q20 6 37-1','#607f96',1.5)+line('M146 119q29-11 60 1','#fff',1.6);

function profile(x,reverse=false,maiden=false){
 return `<g transform="translate(${x} 0)${reverse?' translate(120 0) scale(-1 1)':''}">`
 +solid('M38 237q9-28 30-36l3-28h35l-1 29q27 12 38 35l-2 20H30Z',maiden?'blue':'ice',5)
 +solid('M71 172v31q14 20 32 0v-38Z','silver',2)
 +solid('M60 92q25-25 51-3 12 13 10 37l15 18-16 5-4 22q-12 20-32 6l-19-20-7-35Z','ice',3)
 +path('M100 91q17 6 14 37l-6 9 11 11-5 20q-10 11-19 4l4-23-2-32Z','frost')
 +solid('M56 133q-22-30-4-58 18-26 48-19 29 6 29 30-30-13-45 8l-3 34-8 17-8 2Z','navy',4)
 +[0,1,2,3,4,5].map(i=>line(`M${57+i*5} 95q3-28 33-28`,'#739ebc',1.4,'opacity=".65"')).join('')
 +line('M103 121l10 2m-6 27 12-2m-15 14 10-1','#375e7d',1.3)+circle(109,126,1.6,'#13364f')
 +line('M58 216l29 19 28-20m-28 20-2 19','#668ca6',1.2)
 +(maiden?solid('M54 102q-5 53 6 79l-8 55q-29-32-20-74-14-53 12-79Z','navy',3)+[0,1,2,3].map(i=>line(`M${40+i*4} 112q-9 38 6 67l-1 33`,'#8eacc0',1,'opacity=".7"')).join(''):'')+'</g>';
}
art.kaksoset=()=>profile(43,false)+profile(214,true)+line('M145 221q37 12 74-1','#3d779e',2)+line('M58 190q-16-69 26-112m219 112q17-65-25-111','#9abbd2',1.4);
art.neitsyt=()=>profile(88,false,true)
 +solid('M214 245q-18-9-12-19l10-8 20 7-1 20Z','ice',2)
 +line('M215 251l30-110m-19 91 38-70m-29 46 1-71','#548093',2.5)
 +[[244,141],[241,158],[236,176],[232,194],[262,163],[254,180],[246,198],[237,216]].map(([x,y])=>solid(`M${x} ${y}q-14-6-11-20 14 1 13 15Z`,'silver',1)).join('')
 +line('M154 83q19-8 39 1','#b6d8e9',2);

art.rapu=()=>{
 let legs='';for(let i=0;i<4;i++){const y=159+i*17;legs+=solid(`M130 ${y}l-42 ${6+i*4} -33 ${20+i*3} 18-26 39-16Z`,'silver',2);}
 const claw=solid('M136 147q-22-11-28-32l-16-9 10-18 21 16q6 17 26 24Z','blue',4)
 +solid('M101 110C69 118 45 100 49 76c2-18 15-30 34-34l-6 30 23 19 6-33c30 16 27 44-5 52Z','ice',5)
 +path('M55 74q9-15 23-18l-3 16 17 19-22-4Z','silver')+line('M56 91q13 11 32 8','#fff',1.8);
 return mirror(legs+claw)+solid('M108 156q9-40 72-40 62 0 73 40l-14 48q-57 35-116 0Z','navy',5)
 +solid('M121 149q17-29 59-29 43 1 59 29l-9 34q-50 25-99 0Z','ice',3)
 +path('M181 124q38 3 50 27l-7 25q-22 11-43 14Z','frost')
 +line('M144 149l36 15 37-15m-37 15v28','#729bb6',1.4)
 +mirror(solid('M152 125l-6-20 8-2 7 22Z','silver',1)+circle(149,103,6,'navy')+circle(147.5,101.5,1.8,'#fff'))
 +line('M135 197q44 16 88-1','#b9d8e9',1.6);
};
art.leijona=()=>{
 let mane='';for(let i=0;i<19;i++){const a=(i*360/19-90)*Math.PI/180,p=(rx,ry,b)=>`${(180+rx*Math.cos(b)).toFixed(1)} ${(146+ry*Math.sin(b)).toFixed(1)}`;mane+=solid(`M${p(49,57,a-.22)}Q${p(86,98,a-.16)} ${p(94+(i%3)*4,107+(i%3)*3,a)}Q${p(83,101,a+.30)} ${p(51,61,a+.28)}Z`,i%4?'navy':'blue',3)+line(`M${p(55,64,a)}Q${p(74,86,a+.09)} ${p(86,97,a+.02)}`,'#a8cfe0',.8,'opacity=".35"');}
 return mane+mirror(solid('M142 103q-12-27-28-18-14 11 2 30l24 5Z','silver',2))
 +solid('M132 112q47-36 96 0l-6 66-24 43h-36l-24-43Z','ice',5)
 +path('M181 105q30 1 39 15l-5 49-22 39-12 4Z','frost')
 +solid('M137 140q17-13 33 0l-6 13-25-1Z','blue',1)+solid('M222 140q-17-13-33 0l6 13 25-1Z','blue',1)
 +eye(152,156)+eye(207,156)+solid('M174 155l-14 30 20 16 21-16-14-30Z','silver',2)
 +solid('M151 188q15-8 29 5 16-14 30-5 15 26-30 36-44-9-29-36Z','ice',3)
 +path('M166 184q14-10 28 0l-14 13Z','navy')+line('M180 197v15m-11-1q11 6 22 0','#183d5c',1.6)
 +mirror(line('M163 204l-29-6m29 12-33 2m35 5-27 10','#779ab3',1));
};
art.vaaka=()=>{
 let chains='';for(const x of [87,272]){chains+=line(`M${x} 102l-27 86m27-86 27 86`,'#577b9c',2)+line(`M${x+2} 106l-23 78m24-78 25 78`,'#d7edf7',.8)
 +solid(`M${x-40} 184q40 12 80 0-4 39-40 40-36-1-40-40Z`,'silver',5)
 +`<ellipse cx="${x}" cy="185" rx="40" ry="8" fill="${url('ice')}" stroke="#aac6d9"/>`
 +path(`M${x-27} 189q27 5 54 0-5 19-27 21-20 0-27-21Z`,'blue');}
 return solid('M143 247q36-15 75 0l17 12q-55 17-109 0Z','navy',5)
 +solid('M170 91h20l6 154q-15 10-30 0Z','silver',4)
 +solid('M56 98q124-37 248 0l-5 13q-118-23-237 0Z','ice',4)+path('M65 102q113-25 229 1l-3 5q-112-20-225 0Z','blue')
 +chains+circle(180,88,14,'navy')+circle(177,84,6,'silver')
 +line('M179 121v107','#effaff',2)+line('M150 254q31 8 62 0','#7da1ba',1.5);
};
art.skorpioni=()=>{
 let body='';for(let i=0;i<6;i++)body+=solid(`M${143+i} ${135+i*13}q26-13 ${53-i*2} 0l3 12q-29 18-${60-i*2} 0Z`,i%2?'blue':'ice',3);
 let legs='';for(let i=0;i<4;i++){const y=139+i*15;legs+=solid(`M147 ${y}l-36 ${4+i*4}-25 ${21+i} 11-24 35-14Z`,'silver',2);}
 const claws=solid('M150 143l-27-34-17-3-15-20 12-14 18 22 40 33Z','blue',2)
 +solid('M108 106q-35 9-47-13-10-19 8-35l6 24 18 6 2-29q27 13 26 31Z','ice',4);
 return mirror(legs+claws)
 +path('M166 202C162 258 228 267 264 230c25-26 14-63-13-82','none',`stroke="${url('edge')}" stroke-width="26" stroke-linecap="round"`)
 +path('M166 202C162 254 227 261 260 226c20-24 10-56-10-72','none',`stroke="${url('silver')}" stroke-width="20" stroke-linecap="round"`)
 +[[168,224],[180,242],[205,249],[231,242],[253,227],[264,204],[261,180],[252,161]].map(([x,y])=>line(`M${x-7} ${y-6}l12 12`,'#567b97',2.2)).join('')
 +solid('M253 157q-24-2-32-30 28-1 37 22l-3 12Z','navy',3)
 +body+solid('M146 128q24-19 48 0l4 17-55 1Z','silver',3)+eye(158,131)+eye(184,131);
};
art.jousimies=()=>
 solid('M120 190l-23 65 15 2 27-51m65-17 17 65h16l-12-62Z','navy',4)
 +solid('M105 171q47-25 96 2l28 25-18 25-53-4-30-10-23 32-16-7 17-35Z','ice',5)
 +path('M143 178q27-2 51 7l22 14-12 15-56-6Z','blue')
 +solid('M119 211l-33 47H72l30-56m51 11-8 44h15l18-43Z','silver',3)
 +line('M210 178q28-12 39 12l6 25','#315f80',7)
 +solid('M123 180q-13-35-1-68l24-5 20 35 26 17-9 16-40-14-3 28Z','navy',4)
 +solid('M134 120l-4-25 23-8 7 18-9 17Z','silver',3)
 +solid('M132 70q22-9 31 10l-1 15 10 12-13 3-5 17q-13 9-26-7l-6-18Z','ice',3)
 +solid('M124 97q-15-30 7-43 26-10 40 11l-14 8q-21-9-25 17l-2 9Z','blue',3)
 +line('M153 94l8 1m-10 21 8-1','#36617e',1.2)+circle(157,98,1.4,'#153953')
 +solid('M140 123l35-14 53-25 5 12-49 33-38 11Z','ice',3)
 +solid('M132 134l-31-23 13-31 13 4-8 23 27 14Z','silver',3)
 +line('M232 42q49 58 1 123','#234e72',5)+line('M232 42q42 58 1 123','#d7eaf5',2)
 +line('M231 43l-15 59 17 61','#2d6487',1.6)
 +line('M113 91l149 2','#143b5a',3)+solid('M263 93l-20-9 5 9-5 9Z','silver',1)
 +line('M113 91l-12-7m12 7-12 6','#a7ccdf',2)+circle(152,91,1.6,'#133853');

art.kauris=()=>
 solid('M201 196C243 177 270 202 269 227c-2 25-36 31-46 11-6-14 5-25 16-19-8-20-33-12-33 7 1 34 47 45 75 17 34-38-6-95-51-72Z','blue',5)
 +path('M274 233l27-16-10 29-18 3Z','silver')
 +mirror(solid('M146 111C139 77 120 55 105 36c-12-16-24-13-27-4 23 17 35 44 39 85Z','silver',5)
 +[0,1,2,3,4].map(i=>line(`M${91+i*7} ${41+i*11}l14-4`,'#60849d',1.5)).join('')
 +solid('M139 133q-27-23-47-10 11 23 43 25Z','blue',3))
 +solid('M137 112q43-32 85 0l-9 77-25 47-9 22-15-23-19-46Z','ice',5)
 +path('M182 105q25 4 30 17l-9 65-18 41-3 19Z','frost')
 +eye(151,156)+eye(206,156)+solid('M160 202q20-15 41 0l-6 25-15 9-16-9Z','silver',3)
 +path('M171 209q9-7 18 0l-9 11Z','navy')+line('M180 227v13m-6-3 6 20 6-20','#47708e',2);

art.vesimies=()=>
 solid('M233 228q44-9 67 12-43 24-111 8l-9-11Z','blue',4)
 +`<g transform="rotate(-27 170 145)">`
 +solid('M105 92q-28-25-38-7-19 30 22 52l12-18q-27-13-21-25 5-9 17 6Z','silver',4)
 +solid('M205 91q29-25 39-7 19 30-22 52l-13-18q27-13 22-25-5-9-17 6Z','silver',4)
 +solid('M115 79h84l-6 35q38 26 31 72-8 43-68 49-57-4-66-49-7-44 31-72Z','navy',6)
 +path('M128 106q-36 37-24 75 9 24 39 32l-8-63Z','blue')
 +solid('M108 68q49-18 98 0v17q-48 19-98 0Z','silver',4)
 +`<ellipse cx="157" cy="68" rx="49" ry="12" fill="${url('ice')}"/><ellipse cx="157" cy="68" rx="37" ry="6.5" fill="#133858"/>`
 +line('M110 167q47 30 102 0m-100 7q46 26 97 0','#a7cbdc',1.3)
 +line('M121 119q-24 34-10 64','#fff',2,'opacity=".68"')+'</g>'
 +path('M204 73q28 6 32 37 0 30 21 58 17 24 22 54l-10 4q-7-31-27-53-21-24-20-60 0-26-18-31Z','water')
 +path('M211 79q30 24 17 54-8 24 9 49 14 20 12 45l-10 2q3-25-12-43-22-27-11-55 9-29-10-47Z','ice')
 +line('M217 86q19 27 10 46','#f4fcff',1.5)+circle(285,236,5,'water')+circle(257,242,3,'ice');

function fish(y,flip=false){
 return `<g transform="translate(0 ${y})${flip?' translate(360 0) scale(-1 1)':''}">`
 +solid('M106 141q-30-32-51-24l14 30-13 29q27 3 50-22Z','silver',4)
 +solid('M93 146q56-55 117-30 31 10 49 31-26 31-64 36-53 4-102-37Z','blue',5)
 +path('M104 143q48-43 94-27l37 17q-56 28-131 10Z','ice')
 +solid('M196 118q34 5 60 29-21 25-53 32l13-29Z','silver',3)
 +solid('M126 119q16-24 45-28l-5 21-8 8Z','blue',2)
 +solid('M143 174l20 23 18-22Z','silver',2)
 +[0,1,2,3,4].flatMap(a=>[0,1].map(b=>line(`M${116+a*17} ${135+b*14}q10 7 1 14`,'#407b9e',1,'opacity=".6"'))).join('')
 +eye(231,142)+line('M249 154l-9-1m-33-24q-9 18-1 33','#3a6989',1.3)
 +line('M73 132l18 13-18 15m73-47 10-13m-6 79 14 12','#d8edf7',1)+'</g>';
}
art.kalat=()=>line('M99 67q-54 57-20 130m182-131q54 57 20 131','#b4d2e3',1.3)+fish(-49)+fish(56,true);

const defs=()=>`<defs>
<linearGradient id="${id}-ice" x1="12%" y1="4%" x2="86%" y2="92%"><stop stop-color="#ffffff"/><stop offset=".28" stop-color="#eff8fc"/><stop offset=".56" stop-color="#c3dce9"/><stop offset=".82" stop-color="#7ca6c2"/><stop offset="1" stop-color="#365d7a"/></linearGradient>
<linearGradient id="${id}-silver" x1="3%" y1="14%" x2="92%" y2="82%"><stop stop-color="#f6fcff"/><stop offset=".19" stop-color="#a6bdcc"/><stop offset=".39" stop-color="#f3fbff"/><stop offset=".60" stop-color="#98b5ca"/><stop offset=".86" stop-color="#446b87"/><stop offset="1" stop-color="#a8c9dc"/></linearGradient>
<linearGradient id="${id}-navy" x1="8%" y1="5%" x2="91%" y2="94%"><stop stop-color="#6d9ebc"/><stop offset=".27" stop-color="#2d6e9b"/><stop offset=".59" stop-color="#124e7f"/><stop offset=".87" stop-color="#0a3056"/><stop offset="1" stop-color="#071f39"/></linearGradient>
<linearGradient id="${id}-blue" x1="8%" y1="0" x2="90%" y2="94%"><stop stop-color="#bdedf6"/><stop offset=".30" stop-color="#78b8d7"/><stop offset=".65" stop-color="#2b719e"/><stop offset="1" stop-color="#153d60"/></linearGradient>
<linearGradient id="${id}-water" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d7f7ff"/><stop offset=".42" stop-color="#8ccce5"/><stop offset="1" stop-color="#216ba0"/></linearGradient>
<linearGradient id="${id}-frost"><stop stop-color="#a5c6d9" stop-opacity="0"/><stop offset="1" stop-color="#446e8d" stop-opacity=".50"/></linearGradient>
<linearGradient id="${id}-edge" x2=".8" y2="1"><stop stop-color="#63879f"/><stop offset="1" stop-color="#173e60"/></linearGradient>
<filter id="${id}-shadow" x="-35%" y="-50%" width="180%" height="230%"><feGaussianBlur stdDeviation="5"/></filter>
</defs>`;
await fs.mkdir('assets/art-source',{recursive:true});
const reviews={version:'fi-porcelain-1',scope:'Original resolution-independent vector illustrations with layered modeled depth and material lighting. No raster or icon-font substitution.',artifacts:{}};
for(const [slug,name]of Object.entries(names)){
 id='fi-'+slug;
 const body=art[slug]();
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 300" data-zodiac="${slug}" data-art-version="fi-porcelain-1"><title>${name}: kolmiulotteinen horoskooppikuvitus</title>${defs()}<ellipse cx="183" cy="272" rx="89" ry="9" fill="#254e72" opacity=".18" filter="url(#${id}-shadow)"/><g>${body}</g></svg>`;
 const filename='assets/art-source/zodiac-'+slug+'.svg';await fs.writeFile(filename,svg);
 reviews.artifacts[slug]={name,filename,sha256:createHash('sha256').update(svg).digest('hex'),bytes:Buffer.byteLength(svg)};
}
await fs.writeFile('data/zodiac-art.json',JSON.stringify(reviews,null,2)+'\n');
console.log('Wrote',Object.keys(reviews.artifacts).length,'distinct Finnish zodiac vector illustrations.');
