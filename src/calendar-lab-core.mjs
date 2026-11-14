import {date,parse,iso,add,day,week,weekStart,weeksInYear,leap} from './calendar.mjs';
import {ZODIAC_SIGNS} from './zodiac-signs.mjs';
export {ZODIAC_SIGNS};
export function validDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('Anna kelvollinen päivämäärä.');
 const d=parse(value);if(!Number.isFinite(+d)||iso(d)!==value||d.getUTCFullYear()<1900||d.getUTCFullYear()>2100)throw Error('Valitse päivämäärä vuosilta 1900–2100.');return d;
}
export function weekReport(value){
 const selected=validDate(value),w=week(selected),start=weekStart(w.year,w.number);
 return {...w,selected:value,start:iso(start),end:iso(add(start,6)),days:Array.from({length:7},(_,i)=>iso(add(start,i))),weeks:weeksInYear(w.year)};
}
export function weekDate(year,number){
 year=Number(year);number=Number(number);
 if(!Number.isInteger(year)||year<1900||year>2100||!Number.isInteger(number)||number<1||number>weeksInYear(year))throw Error('Tarkista vuosi ja viikkonumero. Vuodessa voi olla 52 tai 53 ISO-viikkoa.');
 const value=iso(weekStart(year,number));validDate(value);return value;
}
export function ordinalReport(value){
 const d=validDate(value),year=d.getUTCFullYear(),total=leap(year)?366:365,number=Math.round((d-date(year,1,1))/86400000)+1;
 return {selected:value,year,number,total,remaining:total-number,percent:Math.round(number/total*1000)/10,month:d.getUTCMonth()+1};
}
export function ordinalDate(year,number){
 year=Number(year);number=Number(number);
 if(!Number.isInteger(year)||year<1900||year>2100||!Number.isInteger(number)||number<1||number>(leap(year)?366:365))throw Error('Anna järjestysnumero väliltä 1–365 tai karkausvuonna 1–366.');
 return iso(add(date(year,1,1),number-1));
}
export function leapReport(input){
 const year=Number(input);if(!Number.isInteger(year)||year<1583||year>9999)throw Error('Anna kokonainen vuosi väliltä 1583–9999.');
 let previous=year-1,next=year+1;while(!leap(previous))previous--;while(!leap(next))next++;
 return {year,leap:leap(year),days:leap(year)?366:365,february:leap(year)?29:28,previous,next,by4:year%4===0,by100:year%100===0,by400:year%400===0,comparison:[year-1,year,year+1,year+2].filter(y=>y>=1583&&y<=9999)};
}
export function signForDate(value){
 const d=validDate(value),key=(d.getUTCMonth()+1)*100+d.getUTCDate();
 const profile=ZODIAC_SIGNS.find(([,name,range])=>{const nums=range.match(/\d+/g).map(Number),start=nums[1]*100+nums[0],end=nums[3]*100+nums[2];return start>end?key>=start||key<=end:key>=start&&key<=end;});
 const [slug,name,range,element]=profile;
 return {slug,name,range,element,selected:value};
}
export function todayFinland(now=new Date()) {return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
