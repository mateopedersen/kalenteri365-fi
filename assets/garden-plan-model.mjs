export const GARDEN_ACTIVITIES=['Kylvö','Istutus','Kastelu','Lannoitus','Sadonkorjuu','Kasvatusmuistio'];
export function validGardenDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||'')||value<'1900-01-01'||value>'2100-12-31')return false;
 const d=new Date(value+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value;
}
export function validateGardenPlan(value,cropNames){
 const entries=Array.isArray(value)?value:value?.type==='kalenteri365-garden'&&value.version===1?value.tasks:null;
 if(!Array.isArray(entries)||entries.length>500)throw Error('Valitse Kalenteri365:n suunnitelmatiedosto, jossa on enintään 500 työtä.');
 const tasks=entries.map((task,index)=>{
  if(!task||!cropNames.includes(task.crop)||!GARDEN_ACTIVITIES.includes(task.activity)||!validGardenDate(task.date)||typeof task.note!=='string'||task.note.length>1000||typeof task.done!=='boolean')throw Error('Tiedoston työn '+(index+1)+' tiedot eivät ole kelvollisia.');
  return {id:typeof task.id==='string'&&/^[\w-]{1,80}$/.test(task.id)?task.id:'import-'+index,crop:task.crop,activity:task.activity,date:task.date,note:task.note,done:task.done};
 });
 if(new Set(tasks.map(t=>t.id)).size!==tasks.length)throw Error('Suunnitelmassa on kaksi työtä samalla tunnisteella.');
 return tasks;
}
export function mergeGardenPlans(current,incoming,newId=()=>crypto.randomUUID()){
 const merged=[...current],sign=t=>JSON.stringify([t.crop,t.activity,t.date,t.note]);
 for(const task of incoming){
  const collision=merged.find(t=>t.id===task.id);
  if(collision&&(sign(collision)===sign(task)||merged.some(t=>sign(t)===sign(task))))continue;
  let id=task.id;while(merged.some(t=>t.id===id))id=newId();
  merged.push({...task,id});
 }
 if(merged.length>500)throw Error('Yhdistettyyn suunnitelmaan tulisi yli 500 työtä.');
 return {tasks:merged,count:merged.length-current.length};
}
const escapeICS=s=>String(s).replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const foldLine=line=>{let out='',size=0;for(const ch of line){const bytes=new TextEncoder().encode(ch).length;if(size+bytes>75){out+='\r\n ';size=1;}out+=ch;size+=bytes;}return out;};
export function gardenPlanICS(tasks,{reminder=false,now=new Date()}={}){
 const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kalenteri365//Kylvösuunnitelma//FI','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 for(const task of tasks){
  if(!validGardenDate(task.date))throw Error('Virheellinen päivämäärä.');
  const next=new Date(task.date+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);
  lines.push('BEGIN:VEVENT','UID:'+task.id+'@garden.kalenteri365.fi','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+task.date.replaceAll('-',''),'DTEND;VALUE=DATE:'+next.toISOString().slice(0,10).replaceAll('-',''),'SUMMARY:'+escapeICS(task.crop+': '+task.activity),'DESCRIPTION:'+escapeICS([task.note,'Oma puutarhasuunnitelma · Kalenteri365'].filter(Boolean).join('\n')),'TRANSP:TRANSPARENT');
  if(reminder&&!task.done)lines.push('BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:-P1D','DESCRIPTION:'+escapeICS(task.crop+': '+task.activity),'END:VALARM');
  lines.push('END:VEVENT');
 }
 lines.push('END:VCALENDAR');return lines.map(foldLine).join('\r\n')+'\r\n';
}
