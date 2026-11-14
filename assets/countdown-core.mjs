const ZONE='Europe/Helsinki';
const formatter=new Intl.DateTimeFormat('sv-SE',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
export function finnishParts(instant=Date.now()){
 return Object.fromEntries(formatter.formatToParts(instant).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
}
export function targetInstants(day,time){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!/^\d{2}:\d{2}$/.test(time))throw Error('Anna päivämäärä ja kellonaika.');
 const [y,m,d]=day.split('-').map(Number),[h,min]=time.split(':').map(Number),wall=Date.UTC(y,m-1,d,h,min),check=new Date(wall);
 if(y<1900||y>2100||m!==check.getUTCMonth()+1||d!==check.getUTCDate()||h>23||min>59)throw Error('Valitse kelvollinen päivämäärä vuosilta 1900–2100.');
 const offsets=new Set();
 for(const shift of[-36,0,36]){const t=wall+shift*3600000,p=finnishParts(t);offsets.add(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-t);}
 return [...offsets].map(offset=>wall-offset).filter(t=>{const p=finnishParts(t);return p.year===y&&p.month===m&&p.day===d&&p.hour===h&&p.minute===min;}).sort((a,b)=>a-b);
}
export function countdownParts(target,now=Date.now()){
 const remaining=target-now,seconds=Math.floor(Math.abs(remaining)/1000);
 return {days:Math.floor(seconds/86400),hours:Math.floor(seconds/3600)%24,minutes:Math.floor(seconds/60)%60,seconds:seconds%60,elapsed:remaining<0,reached:Math.abs(remaining)<1000};
}
