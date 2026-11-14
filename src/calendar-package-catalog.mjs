import manifest from '../data/calendar-packages.json' with {type:'json'};
// Legacy identifiers keep existing download links working. Presentation is bound
// to the actual supplied file for each year and month, including page orientation.
export const packageManifest=manifest;
export function calendarStyles(year=2027,month=0){
 const items=manifest.calendars.filter(item=>item.year===year&&item.month===month);
 if(items.length!==15)throw Error(`Calendar collection missing: ${year}/${month}`);
 return items.map(item=>({id:item.style,name:item.name,description:item.description,orientation:item.orientation,theme:item.monochrome?'minimal':'colour',width:item.width,height:item.height}));
}
export function calendarStyleTuples(year,month){return calendarStyles(year,month).map(s=>[s.id,s.name,s.description,'#002F6C',s]);}
