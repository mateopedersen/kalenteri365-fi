import {localDayBounds} from './solar-day.mjs';

export function durationLabel(minutes){
  const n=Math.max(0,Math.round(Number(minutes)||0));
  return `${Math.floor(n/60)} h ${n%60} min`;
}

export function daylightSegments(date,events){
  const {start,end}=localDayBounds(date),total=(end-start)/60000;
  const relative=value=>Math.max(0,Math.min(total,(new Date(value)-start)/60000));
  let segments=[];
  if(events.rise&&events.set){
    const rise=relative(events.rise),set=relative(events.set);
    segments=rise<set?[[rise,set]]:[[0,set],[rise,total]];
  }else if(events.rise)segments=[[relative(events.rise),total]];
  else if(events.set)segments=[[0,relative(events.set)]];
  else if(events.polar==='up')segments=[[0,total]];
  return {total,segments:segments.filter(([from,to])=>to>from)};
}

export function daylengthMetrics(date,events,previous,nextWeek){
  const {total,segments}=daylightSegments(date,events);
  const daylight=Math.max(0,Math.min(total,events.duration));
  return {date,total,daylight,below:total-daylight,segments,
    delta:daylight-previous.duration,weekDelta:nextWeek.duration-daylight,
    share:daylight/total,polar:events.polar};
}

export function daylengthSummary(m){
  const trend=n=>n===0?'Sama pituus':`${n>0?'Pitenee':'Lyhenee'} ${Math.abs(n)<60?Math.abs(n)+' min':durationLabel(Math.abs(n))}`;
  const bars=m.segments.map(([from,to])=>`<i style="left:${from/m.total*100}%;width:${(to-from)/m.total*100}%"></i>`).join('');
  return `<div class="daylength-summary-head"><div><p class="eyebrow">VALO VALITTUNA PÄIVÄNÄ</p><h2>Vuorokauden valo</h2></div><span class="daylength-day-size">Vuorokausi ${durationLabel(m.total)}</span></div>
  <div class="daylength-metrics"><article><span class="daylength-sun-orb" aria-hidden="true"></span><div><h3>Valoisa aika</h3><strong data-daylength-value>${durationLabel(m.daylight)}</strong><span>${Math.round(m.share*100)} % vuorokaudesta</span></div></article><article><span class="daylength-night-orb" aria-hidden="true"></span><div><h3>Horisontin alapuolella</h3><strong data-nightlength-value>${durationLabel(m.below)}</strong><span>Hämärä mukaan lukien</span></div></article></div>
  <div class="daylength-band" role="img" aria-label="${durationLabel(m.daylight)} auringonnousun ja laskun välillä, ${durationLabel(m.below)} horisontin alapuolella.">${bars}</div><div class="daylength-band-labels"><span>00.00</span><span>Suomen aikaa</span><span>24.00</span></div>
  <div class="daylength-trends"><p class="${m.delta>=0?'lengthening':'shortening'}"><span>Edelliseen päivään verrattuna</span><strong>${trend(m.delta)}</strong></p><p class="${m.weekDelta>=0?'lengthening':'shortening'}"><span>Seuraavien 7 päivän aikana</span><strong>${trend(m.weekDelta)}</strong></p></div>`;
}
