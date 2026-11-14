import './calendar-downloads.js';
import {quantity} from './fi-language.mjs';
import {actionIcon} from './action-icons.mjs';
import {SHIFT_PRESETS,cycleRows,shiftAt,shiftMonth,shiftTotals,shiftICS,shiftCSV,shiftReview,validateShiftPlan,checkedShift} from './shifts.mjs';
import {MONTHS,cap,date,day,fi,parse,iso,add,holidays} from './calendar.mjs';
const $=s=>document.querySelector(s),key='kalenteri365-shifts-fi-v1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=validateShiftPlan({start:'2027-01-01',year:2027,month:1,title:'Oma vuorokalenterini',rows:structuredClone(SHIFT_PRESETS.two),overrides:{}}),recovery='';
try{const saved=localStorage.getItem(key);if(saved)state=validateShiftPlan(JSON.parse(saved));}catch{recovery='Tallennettua suunnitelmaa ei voitu avata. Alkuperäinen tallennus säilyy, kunnes tallennat uuden muutoksen.';}
let selected=iso(date(state.year,state.month,1)),entries=[],valid=true,view='calendar',dirty=false;
function save(){if(!dirty)return;try{localStorage.setItem(key,JSON.stringify(state));}catch{$('#shift-status').textContent='Suunnitelmaa ei voitu tallentaa selaimeen. Lataa varmuuskopio.';}}
function hydrate(){$('#shift-start').value=state.start;$('#shift-title').value=state.title;$('#shift-rest').value=state.restTarget;$('#shift-preset').value='custom';rowsUI();render();}
function rowsUI(){
 $('#shift-cycle').innerHTML=state.rows.map((s,i)=>`<fieldset class="cycle-card"><legend><span class="cycle-index">${i+1}</span> Kiertopäivä</legend><div class="cycle-card-head"><label>Vuoron tyyppi<select data-cycle-index="${i}" data-cycle-field="type"><option value="work" ${s.type==='work'?'selected':''}>Työvuoro</option><option value="off" ${s.type==='off'?'selected':''}>Vapaa</option></select></label><button type="button" data-cycle-remove="${i}" class="cycle-remove" aria-label="Poista kiertopäivä ${i+1}" ${state.rows.length===1?'disabled':''}>${actionIcon('close')}</button></div>${s.type==='work'?`<label>Nimi<input data-cycle-index="${i}" data-cycle-field="name" value="${esc(s.name)}" maxlength="40"></label><div class="cycle-times"><label>Alkaa<input type="time" data-cycle-index="${i}" data-cycle-field="start" value="${s.start}" required></label><label>Päättyy<input type="time" data-cycle-index="${i}" data-cycle-field="end" value="${s.end}" required></label></div><label>Palkaton tauko (min)<input type="number" min="0" max="1439" step="1" data-cycle-index="${i}" data-cycle-field="break" value="${s.break||0}"></label>`:''}<div class="cycle-move" role="group" aria-label="Kiertopäivän ${i+1} järjestys"><button type="button" data-cycle-up="${i}" ${i===0?'disabled':''} aria-label="Siirrä kiertopäivä ${i+1} ylemmäs"><span class="move-mark">${actionIcon('up')}</span><span class="move-label">Ylemmäs</span></button><button type="button" data-cycle-down="${i}" ${i===state.rows.length-1?'disabled':''} aria-label="Siirrä kiertopäivä ${i+1} alemmas"><span class="move-mark">${actionIcon('down')}</span><span class="move-label">Alemmas</span></button></div></fieldset>`).join('');
}
function detail(){
 const r=entries.find(e=>e.date===selected);if(!r)return;
 $('#shift-selected-title').textContent=new Intl.DateTimeFormat('fi-FI',{dateStyle:'long',timeZone:'UTC'}).format(parse(selected));
 $('#shift-selected-info').textContent=r.name+(r.type==='work'?' · '+r.start+'–'+r.end+(r.overnight?' (seuraava päivä)':'')+' · '+(r.minutes/60).toLocaleString('fi-FI',{maximumFractionDigits:2})+(r.minutes===60?' suunnittelutunti':' suunnittelutuntia'):'');
 const hs=holidays(state.year).filter(h=>h.date===selected&&['holiday','eve'].includes(h.type));
 $('#shift-selected-holiday').innerHTML=hs.map(h=>`<a class="shift-holiday-link" href="/juhlapyhat/${esc(h.slug)}/">${actionIcon('calendar')}<span>${esc(h.name)}</span>${actionIcon('next')}</a>`).join('');
 const o=state.overrides[selected];$('#shift-override').value=!o?'':o.type==='work'?'work':o.name==='Loma'?'vacation':o.name==='Sairauspoissaolo'?'sick':'off';
 const s=r.type==='work'?r:state.rows.find(e=>e.type==='work')||{name:'Työvuoro',start:'08:00',end:'16:00',break:30};
 for(const f of ['name','start','end','break'])$('#shift-override-'+f).value=s[f];$('#shift-note').value=o?.note||'';$('#shift-custom-fields').hidden=$('#shift-override').value!=='work';
}
function render(){try{
 state=validateShiftPlan(state);valid=true;$('#shift-config-error').textContent='';const first=date(state.year,state.month,1);entries=shiftMonth(state.rows,state.start,state.year,state.month,state.overrides);const sum=shiftTotals(entries);
 $('#shift-plan-name').textContent=state.title;$('#shift-month-title').textContent=cap(MONTHS[state.month-1])+' '+state.year;$('#shift-year').value=state.year;$('#shift-month').value=state.month;$('#shift-prev').disabled=state.year===2027&&state.month===1;$('#shift-next').disabled=state.year===2030&&state.month===12;
 $('#shift-summary').innerHTML=[[sum.shifts,sum.shifts===1?'Työvuoro':'Työvuoroa'],[(sum.minutes/60).toLocaleString('fi-FI',{maximumFractionDigits:2}),sum.minutes===60?'Suunnittelutunti':'Suunnittelutuntia'],[sum.nights,sum.nights===1?'Yöaikaan ulottuva':'Yöaikaan ulottuvaa'],[sum.off,sum.off===1?'Vapaapäivä':'Vapaapäivää']].map(([n,l])=>`<div><strong>${n}</strong><span>${l}</span></div>`).join('');
 const hs=holidays(state.year).filter(h=>h.type==='holiday');
 $('#shift-grid').innerHTML=Array.from({length:day(first)},()=>'<span aria-hidden="true"></span>').join('')+entries.map((s,i)=>{
  const label=s.type==='work'?'Työ':s.type==='off'?(s.name==='Loma'?'Loma':'Vapaa'):'';
  const visibleLabel=`${i+1} ${label}${s.type==='work'?' '+s.start+' '+s.end:''}`.trim();
  return `<button type="button" data-shift-date="${s.date}" class="shift-cell ${s.type} ${s.date===selected?'selected':''} ${hs.some(h=>h.date===s.date)?'shift-holiday':''}" aria-pressed="${s.date===selected}" aria-label="${esc(visibleLabel)}. ${fi(parse(s.date))}, ${esc(s.name)}${s.note?', muistiinpano':''}${s.overridden?', oma poikkeus':''}"><strong>${i+1}</strong> <span>${label}</span> ${s.type==='work'?`<small>${s.start}<br> ${s.end}</small>`:''}${s.overridden?'<i aria-hidden="true">•</i>':''}</button>`;
 }).join('');
 $('#shift-list-view').innerHTML=entries.map(s=>`<button type="button" data-shift-date="${s.date}" class="shift-list-row ${s.type} ${s.date===selected?'selected':''}"><time datetime="${s.date}">${fi(parse(s.date))}</time><span><strong>${esc(s.name)}</strong>${s.type==='work'?`<small>${s.start}–${s.end}${s.overnight?' · seuraava päivä':''}</small>`:''}${s.note?`<small>${esc(s.note)}</small>`:''}</span><b>${s.type==='work'?(s.minutes/60).toLocaleString('fi-FI',{maximumFractionDigits:2})+' h':' '}</b></button>`).join('');
 const boundary=Array.from({length:7},(_,i)=>shiftAt(state.rows,state.start,iso(add(first,i-7)),state.overrides));
 const notices=shiftReview([...boundary,...entries],state.restTarget).filter(n=>n.date.startsWith(`${state.year}-${String(state.month).padStart(2,'0')}`));
 $('#shift-review').innerHTML=notices.length?'<ul>'+notices.map(n=>`<li><strong>${fi(parse(n.date))}</strong> ${esc(n.message)}</li>`).join('')+'</ul>':`<p>Ei päällekkäisiä vuoroja tai omaa ${state.restTarget} tunnin lepotavoitetta lyhyempiä vuorovälejä tällä jaksolla. Tämä tarkistus ei arvioi työehtosopimusta.</p>`;
 $('#shift-calendar-view').hidden=view!=='calendar';$('#shift-list-view').hidden=view!=='list';detail();save();
 }catch(e){valid=false;$('#shift-config-error').textContent=e.message;}
 for(const id of ['shift-export','shift-csv','shift-backup'])$('#'+id).disabled=!valid;
}
$('#shift-cycle').addEventListener('change',e=>{const t=e.target;if(!t.dataset.cycleField)return;const s=state.rows[Number(t.dataset.cycleIndex)],f=t.dataset.cycleField;s[f]=f==='break'?Number(t.value):t.value;if(f==='type'){if(s.type==='work')Object.assign(s,{name:'Työvuoro',start:'08:00',end:'16:00',break:30});rowsUI();}dirty=true;$('#shift-preset').value='custom';render();});
$('#shift-cycle').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 let i,next,action;
 if(b.hasAttribute('data-cycle-remove')){i=+b.dataset.cycleRemove;if(state.rows.length<2)return;state.rows.splice(i,1);next=Math.min(i,state.rows.length-1);}
 else if(b.hasAttribute('data-cycle-up')){i=+b.dataset.cycleUp;if(i<1)return;[state.rows[i-1],state.rows[i]]=[state.rows[i],state.rows[i-1]];next=i-1;action='up';}
 else if(b.hasAttribute('data-cycle-down')){i=+b.dataset.cycleDown;if(i>=state.rows.length-1)return;[state.rows[i+1],state.rows[i]]=[state.rows[i],state.rows[i+1]];next=i+1;action='down';}
 else return;
 dirty=true;rowsUI();render();
 const card=$('#shift-cycle').children[next],same=action&&card.querySelector('[data-cycle-'+action+']');
 const focus=same&&!same.disabled?same:card.querySelector('.cycle-move button:not(:disabled)')||card.querySelector('select');
 focus?.focus({preventScroll:true});
 $('#shift-status').textContent=action?'Kiertopäivä siirretty kohtaan '+(next+1)+'.':'Kiertopäivä poistettu. Kierrossa on '+quantity(state.rows.length,'päivä','päivää')+'.';
});
$('#shift-add-day').onclick=()=>{if(state.rows.length>=50){$('#shift-config-error').textContent='Kierrossa voi olla enintään 50 päivää.';return;}state.rows.push({type:'off',name:'Vapaa'});dirty=true;rowsUI();render();};
$('#shift-preset').onchange=e=>{if(!SHIFT_PRESETS[e.target.value])return;state.rows=structuredClone(SHIFT_PRESETS[e.target.value]);dirty=true;rowsUI();render();};
$('#shift-start').onchange=e=>{state.start=e.target.value;dirty=true;render();};$('#shift-title').onchange=e=>{state.title=e.target.value;dirty=true;render();};$('#shift-rest').onchange=e=>{state.restTarget=Number(e.target.value);dirty=true;render();};
for(const [id,f] of [['shift-year','year'],['shift-month','month']])$('#'+id).onchange=e=>{state[f]=Number(e.target.value);selected=iso(date(state.year,state.month,1));dirty=true;render();};
for(const [id,n] of [['shift-prev',-1],['shift-next',1]])$('#'+id).onclick=()=>{const next=date(state.year,state.month+n,1);if(next.getUTCFullYear()<2027||next.getUTCFullYear()>2030)return;state.year=next.getUTCFullYear();state.month=next.getUTCMonth()+1;selected=iso(next);dirty=true;render();};
for(const id of ['shift-grid','shift-list-view'])$('#'+id).onclick=e=>{const b=e.target.closest('[data-shift-date]');if(!b)return;selected=b.dataset.shiftDate;render();};
$('#shift-override').onchange=e=>{$('#shift-custom-fields').hidden=e.target.value!=='work';};
$('#shift-override-form').onsubmit=e=>{e.preventDefault();if(!valid)return;try{const type=$('#shift-override').value,note=$('#shift-note').value;let row;if(type==='work')row=checkedShift({type:'work',name:$('#shift-override-name').value,start:$('#shift-override-start').value,end:$('#shift-override-end').value,break:$('#shift-override-break').value,note});else if(type)row=checkedShift({type:'off',name:{off:'Vapaa',vacation:'Loma',sick:'Sairauspoissaolo'}[type],note});else if(note){row={...shiftAt(state.rows,state.start,selected,{}),note};if(row.type==='none')row={type:'off',name:'Vapaa',note};}if(row)state.overrides[selected]=row;else delete state.overrides[selected];dirty=true;render();$('#shift-status').textContent='Päivän muutos tallennettu tähän selaimeen.';}catch(error){$('#shift-status').textContent=error.message;}};
document.querySelectorAll('[data-shift-view]').forEach(b=>b.onclick=()=>{view=b.dataset.shiftView;document.querySelectorAll('[data-shift-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});
function download(text,type,name){return globalThis.Calendar365Downloads.save(text,name,type);}
$('#shift-export').onclick=()=>{if(!valid)return;try{download(shiftICS(entries,state.title),'text/calendar;charset=utf-8',`kalenteri365-vuorot-${state.year}-${state.month}.ics`);$('#shift-status').textContent='Työvuorot ladattu. Avaa ICS-tiedosto omassa kalenterissasi.';}catch(e){$('#shift-status').textContent=e.message;}};
$('#shift-csv').onclick=()=>{if(valid){download(shiftCSV(entries),'text/csv;charset=utf-8',`kalenteri365-vuorot-${state.year}-${state.month}.csv`);$('#shift-status').textContent='Kuukauden taulukko ladattu.';}};
$('#shift-backup').onclick=()=>{if(valid){download(JSON.stringify({format:'kalenteri365-shift-plan',...state},null,2),'application/json','kalenteri365-vuorosuunnitelma.json');$('#shift-status').textContent='Varmuuskopio ladattu.';}};
$('#shift-import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>500000)throw Error('Varmuuskopiotiedosto on liian suuri.');const input=JSON.parse(await file.text());if(input.format!=='kalenteri365-shift-plan')throw Error('Valitse Kalenteri365-vuorosuunnitelman JSON-varmuuskopio.');const next=validateShiftPlan(input);state=next;selected=iso(date(state.year,state.month,1));dirty=true;hydrate();$('#shift-status').textContent='Varmuuskopio palautettu ja tallennettu.';}catch(error){$('#shift-status').textContent=error instanceof SyntaxError?'Varmuuskopiota ei voitu lukea. Valitse kelvollinen JSON-tiedosto.':error.message;}e.target.value='';};
hydrate();if(recovery)$('#shift-status').textContent=recovery;
