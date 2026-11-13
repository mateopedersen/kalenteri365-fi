import * as A from 'astronomy-engine';

export const SKY_SIGNS=['Oinas','Härkä','Kaksoset','Rapu','Leijona','Neitsyt','Vaaka','Skorpioni','Jousimies','Kauris','Vesimies','Kalat'];
export const SKY_LOCATIVE=['Oinaassa','Härässä','Kaksosissa','Ravussa','Leijonassa','Neitsyessä','Vaa’assa','Skorpionissa','Jousimiehessä','Kauriissa','Vesimiehessä','Kaloissa'];
export const PHASES=['Uusikuu','Kasvava sirppi','Ensimmäinen neljännes','Kasvava kupera kuu','Täysikuu','Vähenevä kupera kuu','Viimeinen neljännes','Vähenevä sirppi'];
const bodies=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
const labels=['Aurinko','Kuu','Merkurius','Venus','Mars','Jupiter','Saturnus'];
const genitives=['Auringon','Kuun','Merkuriuksen','Venuksen','Marsin','Jupiterin','Saturnuksen'];
const aspects=[{angle:0,name:'yhtymä',type:'focus',orb:6},{angle:60,name:'sekstiili',type:'flow',orb:4},{angle:90,name:'neliö',type:'tension',orb:5},{angle:120,name:'kolmio',type:'flow',orb:5},{angle:180,name:'oppositio',type:'balance',orb:6}];
const DAY=86400000,cache=new Map(),mod=n=>(n%360+360)%360;
const signed=n=>mod(n+180)-180;
const degree=(body,instant)=>mod(A.Ecliptic(A.GeoVector(body,instant,true)).elon);
const separation=(a,b)=>Math.abs(signed(a-b));
const localParts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
export function finnishInstant(date,hour=12){
 const desired=Date.parse(date+'T'+String(hour).padStart(2,'0')+':00:00Z');let stamp=desired;
 for(let i=0;i<4;i++){
  const p=Object.fromEntries(localParts.formatToParts(new Date(stamp)).map(p=>[p.type,p.value]));
  const displayed=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);
  const correction=desired-displayed;stamp+=correction;if(!correction)break;
 }
 return new Date(stamp);
}
export function dailySky(date){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T00:00Z').toISOString().slice(0,10)!==date)throw RangeError('Virheellinen päivä.');
 if(cache.has(date))return cache.get(date);
 const time=finnishInstant(date),tomorrow=new Date(Date.parse(date+'T00:00Z')+DAY).toISOString().slice(0,10),start=finnishInstant(date,0),end=finnishInstant(tomorrow,0);
 const positions=Object.fromEntries(bodies.map((body,i)=>{
  const longitude=degree(body,time),signIndex=Math.floor(longitude/30),before=degree(body,new Date(+time-43200000)),after=degree(body,new Date(+time+43200000));
  const speedDegreesPerDay=signed(after-before),stationary=!['Sun','Moon'].includes(body)&&Math.abs(speedDegreesPerDay)<.02;
  return [body,{body,name:labels[i],genitive:genitives[i],longitude,signIndex,sign:SKY_SIGNS[signIndex],locative:SKY_LOCATIVE[signIndex],signDegree:longitude%30,speedDegreesPerDay,stationary,retrograde:!['Sun','Moon'].includes(body)&&speedDegreesPerDay<-.02}];
 }));
 const found=[];
 for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
  const a=positions[bodies[i]],b=positions[bodies[j]],distance=separation(a.longitude,b.longitude);
  for(const aspect of aspects){const orb=Math.abs(distance-aspect.angle);if(orb>aspect.orb)continue;
   const at=delta=>Math.abs(separation(degree(a.body,new Date(+time+delta)),degree(b.body,new Date(+time+delta)))-aspect.angle);
   found.push({a:a.body,b:b.body,aGenitive:a.genitive,bGenitive:b.genitive,...aspect,orb,distance,applying:at(21600000)<at(-21600000)});
  }
 }
 found.sort((a,b)=>a.orb-b.orb);
 const phaseAngle=A.MoonPhase(time),phaseIndex=Math.floor((phaseAngle+22.5)/45)%8,illumination=A.Illumination('Moon',time).phase_fraction;
 let ingress=null;
 const startSign=Math.floor(degree('Moon',start)/30),endSign=Math.floor(degree('Moon',new Date(+end-1))/30);
 if(startSign!==endSign){let lo=+start,hi=+end;while(hi-lo>1000){const mid=(lo+hi)/2;if(Math.floor(degree('Moon',new Date(mid))/30)===startSign)lo=mid;else hi=mid;}
  ingress={at:new Date(hi).toISOString(),from:SKY_SIGNS[startSign],to:SKY_SIGNS[endSign],toLocative:SKY_LOCATIVE[endSign]};
 }
 const result={date,timeZone:'Europe/Helsinki',calculatedFor:time.toISOString(),localHour:12,dayStart:start.toISOString(),dayEnd:end.toISOString(),positions,aspects:found,moon:{phaseAngle,phaseIndex,phase:PHASES[phaseIndex],illumination,ingress},source:{name:'Astronomy Engine',version:'2.1.19',url:'https://github.com/cosinekitty/astronomy',coordinateSystem:'Geocentric tropical ecliptic of date'}};
 if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(date,result);return result;
}
