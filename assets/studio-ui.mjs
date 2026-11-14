import {actionIcon} from './action-icons.mjs';
import {starterState,renderCalendar,normalize,updatePeriod,clone,uid,validDate,parseEvents,eventsICS,STICKERS,dimensions,STARTERS} from './studio/engine.mjs';
import {VIEW_NAMES} from './studio/templates.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const root=$('[data-studio]'),preview=$('#editor-preview'),storageKey='kalenteri365-studio-project-v1';
const query=new URL(location.href).searchParams,past=[],future=[];
let state=starterState(root.dataset.initialBlank==='true'?'blank-grid':'month-finland'),selected=null,drag=null;
let renderFrame=0,saveTimer=0,fitFrame=0,exportController=null,lastGroup='',lastCheckpoint=0,suppressClickUntil=0;
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved){state=normalize(saved);if(root.dataset.initialBlank==='true'&&state.view!=='blank')state=starterState('blank-grid',state);}}catch{}
const periodQuery={};
if(+query.get('year')>=2027&&+query.get('year')<=2030)periodQuery.year=+query.get('year');
if(+query.get('month')>=1&&+query.get('month')<=12){periodQuery.month=+query.get('month');periodQuery.view='month';}
state=updatePeriod(state,periodQuery);
if(STARTERS.some(s=>s.id===query.get('template')))state=starterState(query.get('template'),state);
let templateFilter=state.view;
const controls={'editor-year':'year','editor-month':'month','editor-view':'view','editor-week-date':'weekDate','editor-title':'title','editor-subtitle':'subtitle','editor-font':'font','editor-motif':'motif','editor-paper':'paper','editor-orientation':'orientation','editor-footer':'footer','editor-quality':'quality','editor-note-text':'notes','editor-photo-placement':'photoPlacement','editor-photo-fit':'photoFit'};
const checks={'editor-holidays':'showHolidays','editor-weeks':'showWeekNumbers','editor-grid':'showGrid','editor-notes':'showNotes','editor-agenda':'includeAgenda'};
const colors={'editor-color':'accent','editor-ink':'ink','editor-paper-color':'paper'};
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function status(message,error=false){$('#studio-status').textContent=message;$('#studio-status').classList.toggle('is-error',error);}
function checkpoint(group=''){
 const now=Date.now();if(!group||group!==lastGroup||now-lastCheckpoint>650){past.push(clone(state));if(past.length>30)past.shift();}
 lastGroup=group;lastCheckpoint=now;future.length=0;
}
function persist(){clearTimeout(saveTimer);try{localStorage.setItem(storageKey,JSON.stringify(state));$('#studio-save-state').textContent='Tallennettu tähän selaimeen';}catch{$('#studio-save-state').textContent='Tallenna työ projektitiedostona';}}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(persist,180);}
addEventListener('pagehide',persist);
function showTemplates(){
 let count=0;for(const b of $$('[data-starter]')){b.hidden=templateFilter!=='all'&&b.dataset.starterView!==templateFilter;if(!b.hidden)count++;b.setAttribute('aria-pressed',String(b.dataset.starter===state.starterId));}
 for(const b of $$('[data-template-filter]'))b.setAttribute('aria-pressed',String(b.dataset.templateFilter===templateFilter));
 $('#studio-template-count').textContent=count+' pohjaa';
}
function sync(){
 for(const[id,key]of Object.entries(controls)){const value=String(state[key]);if($('#'+id).value!==value)$('#'+id).value=value;}
 for(const[id,key]of Object.entries(checks))$('#'+id).checked=state[key];
 for(const[id,key]of Object.entries(colors))$('#'+id).value=state.colors[key];
 $('#editor-month').closest('label').hidden=state.view!=='month';
 $('#editor-week-date').closest('label').hidden=state.view!=='week';
 $('#editor-year').closest('label').hidden=state.view==='blank';
 $('#editor-holidays').disabled=state.view==='blank';$('#editor-weeks').disabled=['week','blank'].includes(state.view);
 $('#editor-scope').closest('label').hidden=state.view!=='month';
 $('#editor-agenda').disabled=!state.events.length||state.view==='blank';
 $('[data-studio-action="export-events"]').disabled=!state.events.length;
 $('[data-studio-action="remove-photo"]').disabled=!state.photo;
 $('#studio-paper-label').textContent=state.paper.toUpperCase()+' · '+(state.orientation==='portrait'?'Pysty':'Vaaka');
 $('#studio-preview-hint').textContent=state.view==='blank'?'Lisää pohjalle kuvia, tekstiä ja koristeita.':state.view==='year'?'Lisää omat päivät Tapahtumat-kohdasta.':'Napsauta päivää ja lisää oma merkintä.';
 $('#studio-export-hint').textContent=state.view==='month'?'JPG- ja PNG-kuvissa koko vuoden sivut pakataan ZIP-tiedostoon. SVG sisältää esikatselun nykyisen sivun.':'Kuvat ja SVG sisältävät esikatselun nykyisen sivun.';
 $('[data-studio-action="undo"]').disabled=!past.length;$('[data-studio-action="redo"]').disabled=!future.length;
 const current=STARTERS.find(s=>s.id===state.starterId),events=state.events.length;
 $('#studio-document-summary').textContent=[current?.name||VIEW_NAMES[state.view],state.view==='blank'?null:state.year,state.paper.toUpperCase(),events?events+' '+(events===1?'oma tapahtuma':'omaa tapahtumaa'):null].filter(Boolean).join(' · ');
 showTemplates();
}
function fitPreview(){
 const stage=$('.studio-preview-stage');if(!stage)return;
 const css=getComputedStyle(stage),available=stage.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight),d=dimensions(state);
 const maxHeight=Math.max(230,Math.min(760,innerHeight-(innerWidth<=800?285:235)));
 preview.style.setProperty('--studio-preview-width',Math.max(0,Math.min(available,maxHeight*d.width/d.height)).toFixed(2)+'px');
}
function requestFit(){cancelAnimationFrame(fitFrame);fitFrame=requestAnimationFrame(()=>{fitPreview();if($('#studio-full-preview')?.open)fitFullPreview();});}
new ResizeObserver(requestFit).observe($('.studio-preview-stage'));addEventListener('resize',requestFit);
function render(){
 if(renderFrame){cancelAnimationFrame(renderFrame);renderFrame=0;}
 state=normalize(state);preview.innerHTML=renderCalendar(state,{editing:true,selected});sync();renderLists();scheduleSave();requestFit();
 let style=$('#studio-print-style');if(!style){style=document.createElement('style');style.id='studio-print-style';document.head.append(style);}
 const d=dimensions(state);style.textContent=`@media print{@page{size:${d.mmWidth}mm ${d.mmHeight}mm;margin:0}body[data-kind=editor] main{padding:0!important;width:100%;max-width:none}body[data-kind=editor] main>*:not(.calendar-studio){display:none!important}body[data-kind=editor] .editor-preview>svg{width:${d.mmWidth}mm;height:${d.mmHeight}mm;max-height:none}}`;
}
function requestRender(){if(!renderFrame)renderFrame=requestAnimationFrame(()=>{renderFrame=0;render();});}
function renderLists(){
 const chosen=state.layers.find(l=>l.id===selected);$('#studio-layer-controls').hidden=!chosen;
 if(chosen){$('#studio-layer-size').max=chosen.type==='text'?'100':'65';$('#studio-layer-size').min=chosen.type==='text'?'8':'3';$('#studio-layer-size').value=chosen.type==='text'?chosen.size:chosen.width;$('#studio-layer-rotation').value=chosen.rotation;$('#studio-layer-opacity').value=chosen.opacity;$('#studio-layer-color').value=chosen.color;}
 $('#studio-event-list').innerHTML=state.events.map(e=>`<div class="studio-item"><span><time>${escape(e.date.split('-').reverse().join('.'))}${e.annual?' · Vuosittain':''}</time>${escape(e.title)}</span><button type="button" data-edit-event="${e.id}" aria-label="Muokkaa tapahtumaa ${escape(e.title)}"><svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m4 16 12-12 4 4-12 12-5 1Z M13 7l4 4"/></svg></button><button type="button" data-delete-event="${e.id}" aria-label="Poista tapahtuma ${escape(e.title)}">${actionIcon('close')}</button></div>`).join('');
 $('#studio-layer-list').innerHTML=state.layers.map(l=>`<div class="studio-item"><span>${escape(l.type==='text'?l.text:l.type==='sticker'?STICKERS[l.symbol]:'Oma kuva')}</span><button type="button" data-select-layer="${l.id}" aria-label="Valitse kohde">${actionIcon('select')}</button><button type="button" data-delete-layer="${l.id}" aria-label="Poista kohde">${actionIcon('close')}</button></div>`).join('');
}
function jump(target){const node=$('#studio-'+target);node?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
function openPanel(name){
 const details=$(`[data-panel="${name}"]`);details.open=true;
 if(innerWidth<=800)jump('controls');
 else{const box=$('.studio-controls');box.scrollTop=details.offsetTop-box.offsetTop;}
}
for(const[id,key]of Object.entries(controls))$('#'+id).addEventListener('input',()=>{
 checkpoint(id);const value=['year','month','quality'].includes(key)?Number($('#'+id).value):$('#'+id).value;
 if(['view','year','month','weekDate'].includes(key))state=updatePeriod(state,{[key]:value});else state[key]=value;
 if(key==='view'){templateFilter=state.view;cancelEventEdit();}
 requestRender();
});
for(const[id,key]of Object.entries(checks))$('#'+id).addEventListener('change',()=>{checkpoint();state[key]=$('#'+id).checked;render();});
for(const[id,key]of Object.entries(colors))$('#'+id).addEventListener('input',()=>{checkpoint(id);state.colors[key]=$('#'+id).value;requestRender();});
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function addLayer(layer){
 if(state.layers.length>=16){status('Voit lisätä enintään 16 kohdetta. Poista ensin jokin aiemmista.',true);return;}
 checkpoint();const id=uid(),slot=state.layers.length;
 state.layers.push({id,type:'text',text:'',x:8+(slot%3)*30,y:66+Math.floor(slot/3)*5,width:28,height:16,size:28,color:state.colors.accent,font:state.font,align:'start',bold:false,rotation:0,opacity:100,...layer});selected=id;render();status('Kohde lisätty. Voit siirtää sitä esikatselussa.');
}
function mergeEvents(rows){
 const known=new Set(state.events.map(e=>e.date+'|'+e.title)),add=[];
 for(const e of rows){if(state.events.length+add.length>=500)break;if(validDate(e.date)&&String(e.title||'').trim()&&!known.has(e.date+'|'+e.title)){add.push(e);known.add(e.date+'|'+e.title);}}
 if(!add.length){status(state.events.length>=500?'Kalenterissa on jo 500 tapahtumaa. Poista ensin jokin merkintä.':'Uusia tapahtumia ei löytynyt.');return;}
 checkpoint();state.events.push(...add);render();status(add.length+' '+(add.length===1?'tapahtuma lisätty.':'tapahtumaa lisätty.'));
}
function importPersonal(){let data;try{data=JSON.parse(localStorage.getItem('kalenteri365-fi-v1')||'null');}catch{}mergeEvents((data?.events||[]).map(e=>({id:e.id||uid(),date:e.date,title:e.title,color:e.color||state.colors.accent,annual:e.repeat==='yearly'})));}
function cancelEventEdit(){delete $('#studio-event-form').dataset.editing;$('#studio-event-title').value='';$('#studio-event-submit span').textContent='Lisää tapahtuma';$('[data-studio-action="cancel-event"]').hidden=true;}
$('#studio-event-form').addEventListener('submit',e=>{
 e.preventDefault();const form=e.currentTarget,id=form.dataset.editing||uid(),date=$('#studio-event-date').value,title=$('#studio-event-title').value.trim();
 if(!form.reportValidity()||!validDate(date)||+date.slice(0,4)<2027||+date.slice(0,4)>2030||!title)return;
 if(state.events.length>=500&&!form.dataset.editing){status('Kalenterissa voi olla enintään 500 tapahtumaa.',true);return;}
 checkpoint();const editing=!!form.dataset.editing,entry={id,date,title,color:$('#studio-event-color').value,annual:$('#studio-event-annual').checked};
 state.events=state.events.filter(e=>e.id!==id);state.events.push(entry);cancelEventEdit();render();status(editing?'Tapahtuma päivitetty.':'Tapahtuma lisätty kalenteriin.');
});
async function readPhoto(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Valitse JPG-, PNG- tai WebP-kuva.');
 if(file.size>8e6)throw Error('Valitse enintään 8 Mt:n kokoinen kuva.');
 const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Kuvaa ei voitu lukea.'));reader.readAsDataURL(file);});
 const img=new Image();img.src=src;try{await img.decode();}catch{throw Error('Kuvaa ei voitu avata. Valitse kelvollinen JPG-, PNG- tai WebP-kuva.');}
 if(!img.naturalWidth||!img.naturalHeight)throw Error('Kuvatiedosto ei ole kelvollinen.');return{src,ratio:img.naturalWidth/img.naturalHeight};
}
$('#editor-photo').addEventListener('change',async e=>{try{const image=await readPhoto(e.target.files[0]);checkpoint();state.photo=image.src;state.photoRatio=image.ratio;state.photoFit='contain';render();status('Oma valokuva lisätty.');}catch(error){status(error.message,true);}e.target.value='';});
$('#studio-layer-photo').addEventListener('change',async e=>{try{const image=await readPhoto(e.target.files[0]),d=dimensions(state);addLayer({type:'image',src:image.src,width:25,height:25*d.width/d.height/image.ratio});}catch(error){status(error.message,true);}e.target.value='';});
for(const[id,key]of [['studio-layer-rotation','rotation'],['studio-layer-opacity','opacity'],['studio-layer-color','color'],['studio-layer-size','size']])$('#'+id).addEventListener('input',()=>{
 const layer=state.layers.find(l=>l.id===selected);if(!layer)return;checkpoint(id);const value=key==='color'?$('#'+id).value:Number($('#'+id).value);
 if(key==='size'&&layer.type!=='text'){layer.height*=value/layer.width;layer.width=value;}else layer[key]=value;requestRender();
});
$('#studio-project-file').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>40e6)throw Error('Projektitiedosto on liian suuri.');const next=normalize(JSON.parse(await file.text()));checkpoint();state=next;templateFilter=state.view;selected=null;cancelEventEdit();render();status('Projekti avattu.');}catch(error){status(error instanceof SyntaxError?'Projektia ei voitu avata. Valitse kelvollinen JSON-projektitiedosto.':'Projektia ei voitu avata: '+error.message,true);}e.target.value='';});
$('#studio-import-events').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2e6)throw Error('Valitse enintään 2 Mt:n kokoinen tapahtumatiedosto.');mergeEvents(parseEvents(await file.text(),file.name.toLowerCase().endsWith('.ics')?'ics':'csv'));}catch(error){status(error.message,true);}e.target.value='';});
async function exportDocument(format){
 if(exportController)return;render();persist();exportController=new AbortController();const buttons=$$('[data-studio-format]'),scope=state.view==='month'?$('#editor-scope').value:'current';
 buttons.forEach(b=>b.disabled=true);$('.studio-downloads').setAttribute('aria-busy','true');$('.studio-progress').hidden=false;$('#studio-export-progress').value=0;$('#editor-export-status').textContent='Valmistellaan kalenteria…';
 try{const{makeExport}=await import('./studio/export-pipeline.mjs');const result=await makeExport(state,format,{scope,signal:exportController.signal,onProgress:p=>{$('#studio-export-progress').value=p.percent;$('#editor-export-status').textContent=p.message;}});download(result.blob,result.name);$('#editor-export-status').textContent=`Valmis: ${result.name}${result.dpi?' · '+result.dpi+' dpi':''}`;status('Kalenteri on valmis ladattavaksi.');}
 catch(error){const message=error.name==='AbortError'?'Latauksen valmistelu peruutettu.':error.message;$('#editor-export-status').textContent=message;status(message,error.name!=='AbortError');}
 finally{exportController=null;buttons.forEach(b=>b.disabled=false);$('.studio-downloads').removeAttribute('aria-busy');$('.studio-progress').hidden=true;}
}
root.addEventListener('click',async e=>{
 // Studio event editing must not also open the site's personal-event dialog.
 if(!e.target.closest('[data-action="print"]'))e.stopPropagation();
 const target=e.target.closest('[data-studio-jump]');if(target){jump(target.dataset.studioJump);return;}
 const starter=e.target.closest('[data-starter]');if(starter){checkpoint();state=starterState(starter.dataset.starter,state);selected=null;cancelEventEdit();render();status(starter.querySelector('strong').textContent+' valittu. Omat tapahtumat ja lisätyt kohteet säilyvät.');if(innerWidth<=800)$('.studio-template-library').open=false;jump('preview');return;}
 const filter=e.target.closest('[data-template-filter]');if(filter){templateFilter=filter.dataset.templateFilter;showTemplates();return;}
 const sticker=e.target.closest('[data-sticker]');if(sticker){addLayer({type:'sticker',symbol:sticker.dataset.sticker,width:9,height:9*dimensions(state).width/dimensions(state).height});return;}
 const emoji=e.target.closest('[data-emoji]');if(emoji){addLayer({type:'text',text:emoji.dataset.emoji,size:38});return;}
 const remove=e.target.closest('[data-delete-layer]');if(remove){checkpoint();state.layers=state.layers.filter(l=>l.id!==remove.dataset.deleteLayer);selected=null;render();return;}
 const choose=e.target.closest('[data-select-layer]');if(choose){selected=choose.dataset.selectLayer;render();preview.querySelector(`[data-layer="${selected}"]`)?.focus({preventScroll:true});return;}
 const del=e.target.closest('[data-delete-event]');if(del){checkpoint();state.events=state.events.filter(x=>x.id!==del.dataset.deleteEvent);if($('#studio-event-form').dataset.editing===del.dataset.deleteEvent)cancelEventEdit();render();return;}
 const edit=e.target.closest('[data-edit-event]');if(edit){const item=state.events.find(x=>x.id===edit.dataset.editEvent);if(!item)return;$('#studio-event-form').dataset.editing=item.id;$('#studio-event-date').value=item.date;$('#studio-event-title').value=item.title;$('#studio-event-color').value=item.color;$('#studio-event-annual').checked=item.annual;$('#studio-event-submit span').textContent='Tallenna muutos';$('[data-studio-action="cancel-event"]').hidden=false;openPanel('events');$('#studio-event-title').focus({preventScroll:true});return;}
 const date=e.target.closest('[data-calendar-date]');if(date){e.stopPropagation();if(!drag&&Date.now()>suppressClickUntil){cancelEventEdit();$('#studio-event-date').value=date.dataset.calendarDate;openPanel('events');$('#studio-event-title').focus({preventScroll:true});}return;}
 const button=e.target.closest('[data-studio-action]');if(button){const action=button.dataset.studioAction;
  if(action==='undo'&&past.length){future.push(clone(state));state=past.pop();selected=null;lastGroup='';cancelEventEdit();templateFilter=state.view;render();}
  else if(action==='redo'&&future.length){past.push(clone(state));state=future.pop();selected=null;lastGroup='';cancelEventEdit();templateFilter=state.view;render();}
  else if(action==='add-text'&&$('#studio-custom-text').value.trim()){addLayer({text:$('#studio-custom-text').value.trim()});$('#studio-custom-text').value='';}
  else if(action==='remove-photo'){checkpoint();state.photo='';render();status('Valokuva poistettu.');}
  else if(action==='save-project'){render();persist();download(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),`kalenteri365-projekti-${state.year}.json`);status('Projekti tallennettu. Voit jatkaa muokkaamista avaamalla tiedoston.');}
  else if(action==='import-personal')importPersonal();
  else if(action==='export-events'&&state.events.length)download(new Blob([eventsICS(state)],{type:'text/calendar;charset=utf-8'}),'kalenteri365-tapahtumat.ics');
  else if(action==='cancel-event')cancelEventEdit();
  else if(action==='cancel-export')exportController?.abort();
  else if(action==='preview-focus')openPreview();return;
 }
 const format=e.target.closest('[data-studio-format]');if(format)await exportDocument(format.dataset.studioFormat);
});
preview.addEventListener('keydown',e=>{
 const date=e.target.closest('[data-calendar-date]');if(date&&['Enter',' '].includes(e.key)){e.preventDefault();date.dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}
 const layer=state.layers.find(l=>l.id===e.target.closest('[data-layer]')?.dataset.layer);if(!layer)return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();checkpoint('keyboard-layer');layer.x+=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;layer.y+=e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0;selected=layer.id;render();preview.querySelector(`[data-layer="${selected}"]`)?.focus({preventScroll:true});}
 else if(['Delete','Backspace'].includes(e.key)){e.preventDefault();checkpoint();state.layers=state.layers.filter(x=>x.id!==layer.id);selected=null;render();}
});
preview.addEventListener('pointerdown',e=>{
 const node=e.target.closest('[data-layer]');if(!node)return;e.preventDefault();selected=node.dataset.layer;
 const layer=state.layers.find(l=>l.id===selected),rect=preview.querySelector('svg').getBoundingClientRect();checkpoint();drag={id:selected,startX:e.clientX,startY:e.clientY,x:layer.x,y:layer.y,width:rect.width,height:rect.height,moved:false};preview.setPointerCapture(e.pointerId);render();
});
let dragFrame=0;
preview.addEventListener('pointermove',e=>{
 if(!drag)return;const l=state.layers.find(x=>x.id===drag.id);if(!l)return;
 drag.moved ||= Math.abs(e.clientX-drag.startX)+Math.abs(e.clientY-drag.startY)>4;
 l.x=Math.max(0,Math.min(100,drag.x+(e.clientX-drag.startX)/drag.width*100));l.y=Math.max(0,Math.min(100,drag.y+(e.clientY-drag.startY)/drag.height*100));
 if(!dragFrame)dragFrame=requestAnimationFrame(()=>{dragFrame=0;if(drag)preview.innerHTML=renderCalendar(state,{editing:true,selected});});
});
function endDrag(){if(drag?.moved)suppressClickUntil=Date.now()+350;drag=null;if(dragFrame)cancelAnimationFrame(dragFrame);dragFrame=0;render();}
preview.addEventListener('pointerup',()=>{if(drag)endDrag();});preview.addEventListener('pointercancel',()=>{if(drag)endDrag();});
function openPreview(){
 let dialog=$('#studio-full-preview');if(!dialog){dialog=document.createElement('dialog');dialog.id='studio-full-preview';dialog.className='studio-full-preview no-print';dialog.setAttribute('aria-labelledby','studio-full-preview-title');dialog.innerHTML='<header><strong id="studio-full-preview-title">Kalenterin esikatselu</strong><button type="button">Sulje '+actionIcon('close')+'</button></header><div></div>';dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});document.body.append(dialog);}
 dialog.querySelector('div').innerHTML=renderCalendar(state);fitFullPreview();dialog.showModal();
}
function fitFullPreview(){
 const dialog=$('#studio-full-preview');if(!dialog)return;
 const d=dimensions(state),width=Math.min(1250,innerWidth*.96)-32,height=Math.min(940,innerHeight*.95)-94;
 const canvasWidth=Math.min(width,height*d.width/d.height);
 dialog.style.width=(canvasWidth+32)+'px';dialog.style.height=(canvasWidth*d.height/d.width+94)+'px';
}
$('#studio-event-date').value=`${state.year}-${String(state.month).padStart(2,'0')}-01`;
render();root.dataset.studioReady='true';
