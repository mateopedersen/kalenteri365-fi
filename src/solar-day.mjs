export const localDate=value=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit'}).format(value);
export function localDayBounds(ds){const startProbe=new Date(ds+'T00:00:00Z'),endProbe=new Date(+startProbe+86400000),offset=probe=>Number(new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Helsinki',timeZoneName:'shortOffset'}).formatToParts(probe).find(p=>p.type==='timeZoneName').value.replace('GMT+',''))*3600000;return {start:new Date(+startProbe-offset(startProbe)),end:new Date(+endProbe-offset(endProbe))};}
export function dayEvents(A,city,ds,body='Sun'){
 const {start,end}=localDayBounds(ds),observer=new A.Observer(city[2],city[3],0),event=direction=>{const t=A.SearchRiseSet(body,observer,direction,start,(end-start)/86400000+.00001);return t&&t.date>=start&&t.date<end&&localDate(t.date)===ds?t.date:null;},rise=event(1),set=event(-1),eq=A.Equator(body,start,observer,true,true),altitude=A.Horizon(start,observer,eq.ra,eq.dec,'normal').altitude,up=altitude>-.2666;
 let duration=null;if(body==='Sun'){let milliseconds=0;if(rise&&set)milliseconds=rise<set?set-rise:(set-start)+(end-rise);else if(rise)milliseconds=end-rise;else if(set)milliseconds=set-start;else milliseconds=up?end-start:0;duration=Math.max(0,Math.round(milliseconds/60000));}
 const transit=A.SearchHourAngle(body,observer,0,start).time.date;
 return {rise,set,noon:transit&&transit<end?transit:null,duration,altitude,polar:!rise&&!set?(up?'up':'down'):null};
}
