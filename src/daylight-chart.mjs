import {MONTHS,cap,fi,parse} from './calendar.mjs';
import {esc,icon} from './ui.mjs';
import {durationLabel} from './daylength-metrics.mjs';

export function daylightSelection(row){
 return `<div><span class="daylight-selected-date">${fi(parse(row.date))}</span><strong>${durationLabel(row.duration)}</strong></div><dl><div><dt>Auringonnousu</dt><dd>${esc(row.rise)}</dd></div><div><dt>Auringonlasku</dt><dd>${esc(row.set)}</dd></div></dl><button type="button" class="daylight-open" data-daylight-open="${row.date}">Näytä simulaatiossa ${icon('arrow')}</button>`;
}

export function daylightChart(city,year,rows,selectedMonth=0){
 const selected=Math.max(0,Math.min(11,selectedMonth));
 return `<div class="daylight-annual-bars" role="group" aria-label="${esc(city[1])}: päivän pituus kuukausittain ${year}">${rows.map((r,i)=>`<button type="button" class="daylight-month-bar" data-daylight-index="${i}" aria-pressed="${i===selected}" aria-label="${cap(MONTHS[i])}: ${durationLabel(r.duration)}"><span class="daylight-month-name">${cap(MONTHS[i]).slice(0,3)}</span><span class="daylight-bar-well" aria-hidden="true"><i style="--daylight-height:${Math.max(.8,r.duration/1440*100)}%"></i></span><strong>${Math.floor(r.duration/60)}<small>h</small> ${r.duration%60}<small>min</small></strong></button>`).join('')}</div><div class="daylight-selection" id="daylight-selection" aria-live="polite">${daylightSelection(rows[selected])}</div><p class="daylight-chart-note">Vertailupäivä on kunkin kuukauden 15. päivä. Valitse kuukausi nähdäksesi nousu- ja laskuajat tai avaa sama päivä simulaatiossa.</p>`;
}
