import {localDayBounds} from './solar-day.mjs';
import {createSolarSampler} from './solar-scene-model.mjs';
import {createSolarPanorama} from './solar-panorama.mjs';
import {panoramaView,projectPanorama} from './solar-panorama-core.mjs';
import {atmosphere} from './sun-scene-core.mjs';
import {CITIES} from './calendar.mjs';
import {connectLunarDisc} from './lunar-scene-disc.mjs';
import {advanceSolarMinute,createSolarQuality} from './solar-playback.mjs';

export function connectSolar(A,form,events={}){
  const canvas=document.querySelector('#solar-canvas');
  if(!canvas)return;
  if(window.fiSolar?.canvas===canvas){window.fiSolar.update(A,form,events);return;}
  window.fiSolar?.destroy?.();
  const player=document.querySelector('#solar-player'),range=document.querySelector('#solar-minute');
  const landscape=document.querySelector('#solar-landscape'),play=document.querySelector('#solar-play');
  const speed=document.querySelector('#solar-speed');
  const expand=document.querySelector('#solar-expand'),status=document.querySelector('#solar-render-status');
  const body=player.dataset.body||'Sun',isMoon=body==='Moon';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const clock=new Intl.DateTimeFormat('fi-FI',{timeZone:'Europe/Helsinki',hour:'2-digit',minute:'2-digit',hour12:false});
  const percentage=new Intl.NumberFormat('fi-FI',{maximumFractionDigits:1});
  let painter;
  try{painter=createSolarPanorama(canvas);}catch{
    status.textContent='Simulaatio ei avaudu tässä selaimessa. Lasketut ajat näkyvät alla.';
    player.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);
    return;
  }
  let selection,minute=Number(range.value),playing=false,frame=0,last=null,destroyed=false,dialog,placeholder;
  let pendingFrame=0,lastUI=-Infinity,sceneTime=0;
  const quality=createSolarQuality();
  const elements=Object.fromEntries(['solar-time-label','solar-clock','solar-light','solar-duration','solar-coordinates','lunar-detail-disc','lunar-sky-disc','lunar-detail-percent'].map(id=>[id,document.getElementById(id)]));
  const lunarDiscs=isMoon?[connectLunarDisc(elements['lunar-detail-disc'],'lunar-scene'),connectLunarDisc(elements['lunar-sky-disc'],'lunar-sky')]:[];
  const setText=(id,value)=>{const el=elements[id];if(el&&el.textContent!==value)el.textContent=value;};
  const labels=isMoon?{rise:'Kuun nousu',noon:'Kuun yläkulminaatio',set:'Kuun lasku'}:{rise:'Auringonnousu',noon:'Aurinkokeskipäivä',set:'Auringonlasku'};
  const format=date=>clock.format(new Date(date)).replace('.',':');
  function stop(){playing=false;cancelAnimationFrame(frame);cancelAnimationFrame(pendingFrame);frame=0;pendingFrame=0;last=null;play.setAttribute('aria-pressed','false');play.querySelector('svg path').setAttribute('d','m8 4 12 8-12 8Z');play.querySelector('span').textContent=reduced.matches?'Seuraava tunti':'Toista päivä';}
  function reveal(){const rect=player.getBoundingClientRect();if(rect.top<0||rect.bottom>innerHeight)player.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});}
  function draw(now=performance.now(),forceUI=true){
    if(destroyed||!selection)return;
    const snapshot=selection.sample(minute);
    minute=snapshot.minute;
    const view=panoramaView(snapshot,{follow:true,landscape:landscape.value});
    const drawn=painter.draw(view,sceneTime,playing?quality.scale:1);
    if(!drawn){
      stop();status.hidden=false;status.textContent='Näkymä palautetaan. Lasketut ajat ovat edelleen käytettävissä.';
      return;
    }
    if(isMoon){
      const size=painter.size,point=projectPanorama(snapshot.position.renderAltitude,snapshot.position.azimuth,view,size.width,size.height);
      const skyDisc=elements['lunar-sky-disc'];skyDisc.hidden=!point.visible;
      skyDisc.style.transform='translate3d('+point.x.toFixed(2)+'px,'+point.y.toFixed(2)+'px,0) translate(-50%,-50%)';
    }
    // The scene moves on every animation frame. Text and accessibility values
    // update separately, so layout and lunar SVG creation do not block the GPU.
    if(forceUI||now-lastUI>=100){
      lastUI=now;
      const label=format(snapshot.instant);
      setText('solar-time-label',label);setText('solar-clock',label);
      elements['solar-clock'].dateTime=snapshot.instant.toISOString();
      setText('solar-light',isMoon?(snapshot.position.altitude>.5?'Kuu horisontin yläpuolella':snapshot.position.altitude<-.5?'Kuu horisontin alapuolella':'Kuu horisontissa'):atmosphere(snapshot.position.altitude,snapshot.position.geometricAltitude).label);
      if(isMoon){
        const percent=percentage.format(snapshot.moon.fraction*100);
        lunarDiscs.forEach(disc=>disc.update(snapshot.moon.angle,forceUI));
        setText('lunar-detail-percent',percent+' % valaistunut');
        setText('solar-duration',snapshot.moon.waxing?'Kasvava kuu':'Vähenevä kuu');
        setText('solar-coordinates','Korkeus '+snapshot.position.altitude.toFixed(1).replace('.',',')+'°\nSuunta '+Math.round(snapshot.position.azimuth)+'°');
      }
      range.value=String(Math.round(minute));
      range.setAttribute('aria-valuetext',label+' Suomen aikaa');
      Object.assign(painter.canvas.dataset,{city:selection.city[0],date:selection.date,minute:String(minute),altitude:String(snapshot.position.renderAltitude),azimuth:String(snapshot.position.azimuth)});
    }
    status.hidden=true;
  }
  function scheduleDraw(){
    if(pendingFrame||destroyed)return;
    pendingFrame=requestAnimationFrame(now=>{pendingFrame=0;draw(now);});
  }
  function update(nextA,nextForm,nextEvents){
    stop();
    const first=!selection,city=CITIES.find(c=>c[0]===nextForm.elements.city.value)||CITIES[0];
    selection={city,date:nextForm.elements.date.value,events:{...nextEvents},sample:createSolarSampler(nextA,city,nextForm.elements.date.value,body)};
    const bounds=localDayBounds(selection.date);range.max=String(Math.round((bounds.end-bounds.start)/60000)-1);
    if(first&&isMoon){const focus=nextEvents.noon||nextEvents.rise;if(focus)minute=(new Date(focus)-bounds.start)/60000+(nextEvents.noon?0:30);}
    minute=Math.min(minute,Number(range.max));range.value=String(Math.round(minute));
    document.querySelector('#solar-place').textContent=city[1];
    document.querySelector('#solar-coordinates').textContent=city[2].toFixed(3)+'° N · '+city[3].toFixed(3)+'° E';
    for(const button of player.querySelectorAll('[data-solar-jump]')){
      const key=button.dataset.solarJump,event=selection.events[key];button.disabled=!event;
      button.querySelector('strong').textContent=event?format(event):key==='rise'?'Ei nousua':key==='set'?'Ei laskua':'Ei tänään';
      button.setAttribute('aria-label',labels[key]+': '+button.querySelector('strong').textContent);
    }
    const duration=nextEvents.duration;document.querySelector('#solar-duration').textContent=duration==null?'':'Päivän pituus '+Math.floor(duration/60)+' h '+duration%60+' min';
    const subject=isMoon?'Kuu':'Aurinko';
    const polar=document.querySelector('#solar-polar-message');polar.hidden=!nextEvents.polar;polar.textContent=nextEvents.polar==='up'?subject+' pysyy horisontin yläpuolella koko vuorokauden.':nextEvents.polar==='down'?subject+' pysyy horisontin alapuolella koko vuorokauden.':'';
    draw();
  }
  function tick(now){
    if(!playing||destroyed)return;
    const elapsed=last===null?0:now-last;last=now;
    quality.observe(elapsed);
    minute=advanceSolarMinute(minute,elapsed,Number(range.max),Number(speed?.value)||40);
    sceneTime+=Math.min(100,elapsed)/1000;
    draw(now,false);
    if(!playing)return;
    if(minute>=Number(range.max)){stop();draw(now);return;}
    frame=requestAnimationFrame(tick);
  }
  range.oninput=()=>{stop();minute=Number(range.value);scheduleDraw();};
  landscape.onchange=scheduleDraw;
  play.onclick=()=>{if(playing){stop();draw();return;}reveal();if(reduced.matches){minute=(minute+60)%(Number(range.max)+1);range.value=String(Math.round(minute));draw();return;}if(minute>=Number(range.max))minute=0;playing=true;last=null;quality.reset();play.setAttribute('aria-pressed','true');play.querySelector('svg path').setAttribute('d','M6 4h4v16H6zM14 4h4v16h-4z');play.querySelector('span').textContent='Pysäytä';frame=requestAnimationFrame(tick);};
  for(const button of player.querySelectorAll('[data-solar-jump]'))button.onclick=()=>{const event=selection.events[button.dataset.solarJump];if(!event)return;stop();minute=(new Date(event)-localDayBounds(selection.date).start)/60000;range.value=String(Math.round(minute));draw();reveal();};
  expand.onclick=()=>{
    if(dialog?.open){dialog.close();return;}
    stop();
    dialog??=Object.assign(document.createElement('dialog'),{className:'solar-fullscreen-dialog'});
    if(!dialog.isConnected)document.body.append(dialog);
    placeholder=document.createComment('solar-player-position');player.replaceWith(placeholder);dialog.append(player);
    dialog.setAttribute('aria-label',(isMoon?'Kuun':'Auringon')+' kulun suuri näkymä');
    dialog.onclose=()=>{placeholder?.replaceWith(player);expand.setAttribute('aria-label','Suurenna simulaatio');expand.focus({preventScroll:true});painter.resize();draw();};
    expand.setAttribute('aria-label','Sulje suuri näkymä');dialog.showModal();expand.focus();painter.resize();draw();
  };
  const visibility=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',visibility);
  const motion=()=>{stop();draw();};reduced.addEventListener('change',motion);
  painter.canvas.addEventListener('solarcontextrestored',scheduleDraw);
  const resize=new ResizeObserver(()=>{painter.resize();scheduleDraw();});resize.observe(painter.canvas);
  window.fiSolar={canvas:painter.canvas,update,getState:()=>({city:selection.city[0],date:selection.date,minute,playing}),destroy(){stop();if(dialog?.open)dialog.close();destroyed=true;cancelAnimationFrame(pendingFrame);resize.disconnect();painter.canvas.removeEventListener('solarcontextrestored',scheduleDraw);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',motion);dialog?.remove();painter.destroy();}};
  update(A,form,events);
}
