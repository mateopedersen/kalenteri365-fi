// Original print illustrations. All geometry is rendered as vectors in the PDF.
// The simplified Finland outline uses Natural Earth 1:110m public-domain geometry:
// https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson
// It is a decorative country outline, not a surveyed map or navigation product.
const mix=(a,b,t)=>'#'+[0,1,2].map(i=>Math.round(parseInt(a.slice(1+2*i,3+2*i),16)*(1-t)+parseInt(b.slice(1+2*i,3+2*i),16)*t).toString(16).padStart(2,'0')).join('');
const PI=Math.PI;
const FINLAND=[[28.59193, 69.064777], [28.445944, 68.364613], [29.977426, 67.698297], [29.054589, 66.944286], [30.21765, 65.80598], [29.54443, 64.948672], [30.444685, 64.204453], [30.035872, 63.552814], [31.516092, 62.867687], [31.139991, 62.357693], [30.211107, 61.780028], [28.07, 60.50352], [28.070002, 60.503519], [28.069998, 60.503517], [26.255173, 60.423961], [24.496624, 60.057316], [22.869695, 59.846373], [22.290764, 60.391921], [21.322244, 60.72017], [21.544866, 61.705329], [21.059211, 62.607393], [21.536029, 63.189735], [22.442744, 63.81781], [24.730512, 64.902344], [25.398068, 65.111427], [25.294043, 65.534346], [23.903379, 66.006927], [23.56588, 66.396051], [23.539473, 67.936009], [21.978535, 68.616846], [20.645593, 69.106247], [21.244936, 69.370443], [22.356238, 68.841741], [23.66205, 68.891247], [24.735679, 68.649557], [25.689213, 69.092114], [26.179622, 69.825299], [27.732292, 70.164193], [29.015573, 69.766491], [28.59193, 69.064777]];
export function printArtwork(theme,aspect=2.7){
 const W=1000,H=W/aspect,shapes=[];
 const rect=(x,y,w,h,fill,opacity=1)=>shapes.push({type:'rect',x,y,w,h,fill,opacity});
 const ellipse=(x,y,rx,ry,fill,opacity=1)=>shapes.push({type:'ellipse',x,y,rx,ry,fill,opacity});
 const path=(d,fill,stroke=null,strokeWidth=1,opacity=1)=>shapes.push({type:'path',d,fill,stroke,strokeWidth,opacity});
 const line=(x1,y1,x2,y2,stroke,width=1,opacity=1)=>path(`M${x1} ${y1}L${x2} ${y2}`,null,stroke,width,opacity);
 const grad=(x,y,w,h,a,b)=>{const n=200;for(let i=0;i<n;i++)rect(x,y+i*h/n,w,h/n+.015,mix(a,b,i/(n-1)));};
 const rand=n=>{const r=Math.sin(n*127.17+theme.length*78.3)*43758.5453;return r-Math.floor(r);};
 function pine(x,y,h,c='#153f45'){
  rect(x-h*.026,y-h*.71,h*.052,h*.71,mix(c,'#544a3f',.35));
  for(let k=0;k<6;k++){const yy=y-h+k*h*.112,ww=h*(.12+k*.035);path(`M${x} ${yy}L${x-ww} ${yy+h*.33}Q${x} ${yy+h*.26} ${x+ww} ${yy+h*.33}Z`,k%2?mix(c,'#86a68e',.12):c);}
 }
 function birch(x,y,h,summer=false){
  path(`M${x-6} ${y}Q${x-12} ${y-h*.52} ${x+3} ${y-h}L${x+12} ${y-h}Q${x+1} ${y-h*.49} ${x+7} ${y}Z`,'#f7f6ed','#9aabac',.5);
  for(let k=0;k<9;k++){const yy=y-h*.08-k*h*.094;line(x-6+(k%2)*5,yy,x+5,yy+2,'#526674',2.5);}
  for(let k=0;k<7;k++){const yy=y-h*(.36+k*.08),dx=(k%2?1:-1)*h*(.20+(k%3)*.034);path(`M${x} ${yy+35}Q${x+dx*.45} ${yy-5} ${x+dx} ${yy-22}`,null,'#7f9693',2.5);if(summer)for(let n=0;n<6;n++)ellipse(x+dx*(.40+n*.12),yy-10+n%2*8,h*.034,h*.024,k%2?'#8caf76':'#abc98c');}
 }
 function water(y,a='#7cb6ce',b='#194d6c'){
  grad(0,y,W,H-y,a,b);
  for(let i=0;i<44;i++){const yy=y+(H-y)*rand(i+40),xx=rand(i+90)*W,ww=15+rand(i+80)*105;line(xx,yy,Math.min(W,xx+ww),yy,mix(a,'#f2f6ee',.7),.4+rand(i+60)*1.3,.25);}
 }
 function treeline(y,c='#254c50',count=40){for(let i=0;i<count;i++){const h=12+rand(i+3)*H*.18;pine(i*W/(count-1),y+rand(i+9)*10,h,c);}}
 function sky(top='#dcebf0',bottom='#faf9ed'){grad(0,0,W,H,top,bottom);}
 function island(d,c){path(d,c);}
 function sun(x,y,r=28){ellipse(x,y,r*1.8,r*1.8,'#fff8df',.15);ellipse(x,y,r*1.3,r*1.3,'#fff7d4',.25);ellipse(x,y,r,r,'#fff4cb');}
 if(theme==='flag'){
  rect(0,0,W,H,'#f4f8fc');for(let i=0;i<14;i++)path(`M${600+i*30} 0Q${430+i*30} ${H*.8} ${770+i*30} ${H}`,null,'#dce7f2',.8);
  // National flag geometry: 18:11 overall, 3-unit cross, 5/10 horizontal
  // white fields and 4/4 vertical white fields. Only the cloth edge is waved.
  const fw=Math.min(550,H*.82*18/11),fh=fw*11/18,fx=(W-fw)/2,fy=(H-fh)/2,a=fh*.035;
  const wave=(yy)=>`M${fx} ${yy}Q${fx+fw*.25} ${yy-a} ${fx+fw*.5} ${yy}T${fx+fw} ${yy}`;
  path(wave(fy)+`V${fy+fh}Q${fx+fw*.75} ${fy+fh-a} ${fx+fw*.5} ${fy+fh}T${fx} ${fy+fh}Z`,'#ffffff','#b4c7db',1);
  const crossX=fx+fw*5/18,crossW=fw*3/18;
  rect(crossX,fy,crossW,fh,'#002F6C');
  path(wave(fy+fh*4/11)+`V${fy+fh*7/11}Q${fx+fw*.75} ${fy+fh*7/11-a} ${fx+fw*.5} ${fy+fh*7/11}T${fx} ${fy+fh*7/11}Z`,'#002F6C');
  path(wave(fy),null,'#ffffff',3);path(wave(fy+fh),null,'#bacbdc',1);
 }else if(theme==='helsinki'){
  sky('#dbe9f2','#f7f8ee');sun(837,H*.23,27);water(H*.81,'#c2d7e6','#6c9db5');
  const base=H*.81;
  for(let i=0;i<16;i++){const xx=36+i*59,hh=H*(.18+rand(i+40)*.19);rect(xx,base-hh,48,hh,i%3?'#e1ded2':'#d3bba5');path(`M${xx-5} ${base-hh}L${xx+24} ${base-hh-15}L${xx+53} ${base-hh}Z`,'#536979');for(let r=0;r<3;r++)for(let c=0;c<3;c++)rect(xx+7+c*13,base-hh+12+r*16,5,8,'#788e9a');}
  const cx=500,cy=base-H*.40;
  rect(cx-145,cy+40,290,H*.40-40,'#f8f9f3');path(`M${cx-160} ${cy+45}L${cx} ${cy-2}L${cx+160} ${cy+45}Z`,'#fcfcf5','#8297a1',1);rect(cx-28,cy-H*.15,56,H*.15,'#edf2ec');const dome=cy-H*.15;path(`M${cx-42} ${dome}Q${cx} ${dome-H*.27} ${cx+42} ${dome}Z`,'#496b75');ellipse(cx,dome-H*.135,6,3,'#b4c8c1');line(cx,dome-H*.23,cx,dome-H*.14,'#8a996d',2);line(cx-7,dome-H*.205,cx+7,dome-H*.205,'#8a996d',2);
  for(let i=-3;i<=3;i++){rect(cx+i*32-5,cy+56,10,50,'#bed0d7');rect(cx+i*32-7,cy+53,14,4,'#f6f8f2');}
  path(`M${cx-160} ${base-8}H${cx+160}L${cx+177} ${base}H${cx-177}Z`,'#aebfc4');
 }else if(['lake','forest','sauna','midsummer','archipelago'].includes(theme)){
  sky(theme==='midsummer'?'#d7c6cf':'#d5e8ef',theme==='midsummer'?'#f7d9ad':'#f8f9e9');sun(theme==='midsummer'?782:812,H*(theme==='midsummer'?.53:.23),theme==='lake'?27:21);water(H*.56,theme==='midsummer'?'#ddbda6':'#a4ccd9',theme==='midsummer'?'#547e91':'#376b83');
  path(`M0 ${H*.56}Q130 ${H*.43} 274 ${H*.53}T620 ${H*.49}T1000 ${H*.52}V${H*.59}H0Z`,theme==='midsummer'?'#687c76':'#6f9694');treeline(H*.56,theme==='midsummer'?'#41676a':'#376764',34);
  if(theme==='forest'){
   path(`M0 ${H*.88}Q230 ${H*.75} 445 ${H*.90}T1000 ${H*.91}V${H}H0Z`,'#608175');for(let i=0;i<11;i++)pine(i*69-13,H*1.02,H*(.42+rand(i)*.24),i%2?'#234b48':'#316258');
   for(let i=0;i<20;i++)ellipse(450+rand(i+13)*540,H*(.88+rand(i+9)*.12),8+rand(i)*12,2+rand(i+21)*4,'#aab4a4');
  }else if(theme==='sauna'){
   const y=H*.63;path(`M0 ${H*.76}Q190 ${H*.60} 444 ${H*.79}L471 ${H}H0Z`,'#55745d');rect(105,y-H*.27,205,H*.31,'#a34a37');for(let k=0;k<11;k++)line(106,y-H*.27+k*H*.028,309,y-H*.27+k*H*.028,'#79463a',1);path(`M86 ${y-H*.25}L206 ${y-H*.45}L330 ${y-H*.25}Z`,'#394954');rect(223,y-H*.17,39,H*.21,'#674b3f');rect(132,y-H*.17,39,H*.10,'#f3dba2');rect(189,y-H*.45,18,H*.12,'#495d65');path(`M193 ${y-H*.47}q-23-22 2-39q21-20-2-42`,null,'#d1d9d3',7,.45);path(`M292 ${y+6}L570 ${H*.88}L561 ${H*.93}L285 ${y+20}Z`,'#b5a18a');for(let k=0;k<13;k++){let t=k/13;line(291+t*271,y+9+t*(H*.88-y-8),286+t*274,y+20+t*(H*.92-y-20),'#7d8279',1);}
   birch(30,H*.87,H*.73,true);
  }else if(theme==='midsummer'){
   path(`M0 ${H*.90}Q225 ${H*.65} 422 ${H*.91}L1000 ${H*.97}V${H}H0Z`,'#425d4b');for(let i=0;i<3;i++)birch(60+i*77,H,H*(.65+rand(i)*.15),true);ellipse(526,H*.88,81,12,'#a29b80');path(`M472 ${H*.90}L571 ${H*.79}M482 ${H*.79}L570 ${H*.91}`,null,'#60473e',15);path(`M486 ${H*.83}Q462 ${H*.68} 500 ${H*.66}Q499 ${H*.53} 529 ${H*.48}Q522 ${H*.63} 552 ${H*.64}Q589 ${H*.75} 552 ${H*.86}Z`,'#d57935');path(`M504 ${H*.85}Q495 ${H*.73} 521 ${H*.64}Q518 ${H*.78} 548 ${H*.82}Z`,'#f3ce75');
  }else if(theme==='archipelago'){
   path(`M0 ${H*.87}Q147 ${H*.73} 316 ${H*.88}T650 ${H*.94}L1000 ${H*.92}V${H}H0Z`,'#7f8f7d');path(`M615 ${H*.73}Q737 ${H*.67} 859 ${H*.73}L843 ${H*.76}H636Z`,'#668773');rect(729,H*.38,35,H*.35,'#f6f6e9');path(`M721 ${H*.38}L747 ${H*.29}L772 ${H*.38}Z`,'#a34439');rect(734,H*.31,25,H*.04,'#324d64');rect(731,H*.53,31,H*.06,'#a34439');line(746,H*.22,746,H*.29,'#68808e',2);for(let i=0;i<7;i++)ellipse(50+i*39,H*.90+rand(i)*H*.06,28,10,'#a8ada0');
  }else{
   path(`M0 ${H*.95}Q135 ${H*.80} 279 ${H*.98}L490 ${H}H0Z`,'#557b69');for(let i=0;i<6;i++)pine(25+i*39,H*1.03,H*(.35+rand(i)*.38),'#2c5f55');
   path(`M620 ${H*.77}L716 ${H*.77}L699 ${H*.82}H637Z`,'#d5b890');line(664,H*.43,664,H*.77,'#647b88',2);path(`M659 ${H*.45}L610 ${H*.73}H659Z`,'#fbfbf0');path(`M669 ${H*.52}L706 ${H*.73}H669Z`,'#d3e1e5');
  }
 }else if(theme==='aurora'||theme==='stars'){
  grad(0,0,W,H,'#071a38',theme==='stars'?'#183a68':'#253e5d');
  for(let i=0;i<65;i++){const x=rand(i+88)*W,y=rand(i+128)*H*.71,r=.55+rand(i+228)*1.45;ellipse(x,y,r,r,'#d9e5ee',.4+rand(i+8)*.6);}
  if(theme==='aurora')for(let k=0;k<28;k++){const yy=H*(.11+k*.005);path(`M-10 ${yy}Q170 ${H*.55-k*2} 357 ${H*.27+k*.3}T705 ${H*.16+k*.7}T1010 ${H*.34+k*.8}`,null,k%2?'#7dc4a9':'#b4cfe8',1.5,.1+k*.006);}
  if(theme==='stars'){const pts=[[388,.30],[452,.45],[535,.39],[603,.53],[714,.37],[775,.55],[858,.48]];for(let i=1;i<pts.length;i++)line(pts[i-1][0],H*pts[i-1][1],pts[i][0],H*pts[i][1],'#bdd3e6',1,.6);for(const[x,y]of pts)ellipse(x,H*y,2.6,2.6,'#f4f0d9');const x=186,y=H*.28;path(`M${x} ${y-20}L${x+3} ${y-3}L${x+20} ${y}L${x+3} ${y+3}L${x} ${y+20}L${x-3} ${y+3}L${x-20} ${y}L${x-3} ${y-3}Z`,'#f2e4b7');}
  treeline(H*.92,'#0e273a',46);path(`M0 ${H*.93}Q180 ${H*.89} 410 ${H*.94}T1000 ${H*.92}V${H}H0Z`,'#cbdce0');
 }else if(theme==='winter'){
  sky('#d7e4ee','#f5f8f6');sun(803,H*.33,24);path(`M0 ${H*.67}Q240 ${H*.37} 476 ${H*.68}T1000 ${H*.59}V${H}H0Z`,'#aec7d8');path(`M0 ${H*.76}Q300 ${H*.51} 586 ${H*.78}T1000 ${H*.68}V${H}H0Z`,'#eef4f4');for(let i=0;i<10;i++){const x=80+i*98,h=H*(.24+rand(i)*.23);pine(x,H*.88,h,'#567e83');for(let k=0;k<4;k++)path(`M${x} ${H*.88-h+k*h*.16}L${x-h*(.09+k*.035)} ${H*.88-h+k*h*.16+h*.22}Q${x} ${H*.88-h+k*h*.16+h*.17} ${x+h*(.09+k*.035)} ${H*.88-h+k*h*.16+h*.22}Z`,'#f8fbf5');}path(`M0 ${H*.95}Q270 ${H*.81} 500 ${H*.94}T1000 ${H*.87}V${H}H0Z`,'#ffffff');
 }else if(theme==='birch'){
  sky('#e9f0eb','#fbfaf1');path(`M0 ${H*.89}Q360 ${H*.69} 1000 ${H*.88}V${H}H0Z`,'#d6e2c5');for(let i=0;i<9;i++)birch(40+i*115,H*(1.02+(i%2)*.07),H*(.79+rand(i)*.2),true);for(let i=0;i<32;i++){const x=rand(i+5)*W,y=H*(.89+rand(i)*.11);line(x,y,x+2,y-5-rand(i+90)*13,'#8baf77',1);}
 }else if(theme==='meadow'){
  sky('#e7f0f5','#fbf7e5');sun(862,H*.23,25);path(`M0 ${H*.80}Q250 ${H*.61} 500 ${H*.77}T1000 ${H*.73}V${H}H0Z`,'#c3d2a3');path(`M0 ${H*.88}Q360 ${H*.70} 1000 ${H*.89}V${H}H0Z`,'#91b27b');for(let i=0;i<26;i++){const x=15+i*39,y=H*(.85+rand(i+7)*.14),h=H*(.12+rand(i+13)*.29);path(`M${x} ${y}q-10 ${-h*.5} 7 ${-h}`,null,'#5c8e65',1.6);for(let k=0;k<5;k++){const a=PI*2*k/5;ellipse(x+7+Math.cos(a)*6,y-h+Math.sin(a)*6,6,3.8,i%4?'#fbfcf0':'#9c9ec8');}ellipse(x+7,y-h,3,3,'#d4ab57');}
 }else if(theme==='map'){
  rect(0,0,W,H,'#e8f0f8');for(let y=0;y<H;y+=28)line(0,y,W,y,'#d4e2ee',.6);for(let x=0;x<W;x+=35)line(x,0,x,H,'#d4e2ee',.6);
  const xs=FINLAND.map(p=>p[0]),ys=FINLAND.map(p=>p[1]),loX=Math.min(...xs),hiX=Math.max(...xs),loY=Math.min(...ys),hiY=Math.max(...ys),mw=(hiX-loX)*.46,mh=hiY-loY,scale=Math.min(W*.55/mw,H*.85/mh),ox=(W-mw*scale)/2,oy=H*.07;
  const p=FINLAND.map(([x,y],i)=>`${i?'L':'M'}${ox+(x-loX)*.46*scale} ${oy+(hiY-y)*scale}`).join('')+'Z';path(p,'#ffffff','#759dbf',1.6);const hx=ox+(24.9384-loX)*.46*scale,hy=oy+(hiY-60.1699)*scale;ellipse(hx,hy,4,4,'#002F6C');ellipse(hx,hy,11,11,'#002F6C',.08);for(let i=0;i<5;i++)path(`M${ox+mw*scale*.26+i*8} ${oy+mh*scale*.58}q20 4 3 17t10 18`,null,'#bfd8e7',2);
 }
 return {width:W,height:H,shapes};
}
