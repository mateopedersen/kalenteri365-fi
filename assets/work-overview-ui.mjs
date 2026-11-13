import {overviewSettings,yearOverview,overviewComparison,overviewCSV} from './work-overview.mjs';
import {overviewURL,overviewSummary,overviewMonthChart,overviewMonthTable,overviewYearCards,overviewCompareTable,overviewHolidays} from './work-overview-view.mjs';
import {MONTHS,cap} from './calendar.mjs';
const root=document.querySelector('[data-work-overview]');
if(root){
 const $=s=>root.querySelector(s),form=$('#work-overview-form'),month=Number(root.dataset.overviewMonth),scope=root.dataset.overviewScope,pathYear=Number(root.dataset.overviewYear),status=$('#work-overview-status');
 let current=null;const query=new URL(location.href).searchParams;
 function readForm(){return overviewSettings({year:Number(form.elements.year.value),hours:Number(form.elements.hours.value),eves:form.elements.eves.checked,sixDays:form.elements.week.value==='6'});}
 function currentURL(settings){if(scope!=='hub')return new URL(overviewURL(settings.year,month,settings),location.origin);const u=new URL(location.origin+'/tyopaivat/');u.searchParams.set('year',settings.year);if(settings.hours!==7.5)u.searchParams.set('hours',settings.hours);if(settings.eves)u.searchParams.set('eves','1');if(settings.sixDays)u.searchParams.set('week','6');return u;}
 function update(quiet=false){try{const settings=readForm();if(scope!=='hub'&&settings.year!==pathYear){location.assign(currentURL(settings).href);return;}const report=yearOverview(settings),reports=overviewComparison(settings);current=report;
  $('#work-overview-title').textContent=(month?cap(MONTHS[month-1])+' ':'')+settings.year;
  $('#work-overview-summary').innerHTML=overviewSummary(report,month);$('#work-overview-chart').innerHTML=overviewMonthChart(report,month);$('#work-overview-month-table').innerHTML=overviewMonthTable(report,month);$('#work-overview-years').innerHTML=overviewYearCards(reports,settings.year,month);$('#work-overview-comparison').innerHTML=overviewCompareTable(reports);$('#work-overview-holidays').innerHTML=overviewHolidays(report,month);
  root.querySelectorAll('[data-overview-csv],[data-overview-copy]').forEach(b=>b.disabled=false);
  status.classList.remove('work-overview-error');if(!quiet)status.textContent='Näkymä päivitetty. Yhteenvedossa, kuukausissa ja vuosivertailussa ovat samat asetukset.';
  if(!quiet)history.replaceState(null,'',currentURL(settings));
 }catch(error){status.classList.add('work-overview-error');status.textContent=error.message+' Näkyvissä on edellinen laskelma.';}}
 form.addEventListener('submit',e=>{e.preventDefault();update();});form.addEventListener('change',()=>update());
 $('[data-overview-csv]').onclick=e=>{if(!current)return;const a=document.createElement('a'),u=URL.createObjectURL(new Blob([overviewCSV(current,month)],{type:'text/csv;charset=utf-8'}));a.href=u;a.download=`kalenteri365-tyopaivat-${current.settings.year}${month?'-'+String(month).padStart(2,'0'):''}.csv`;a.click();status.textContent='Kuukausitaulukko ladattu. CSV-tiedoston voi avata Excelissä tai muussa taulukkolaskentaohjelmassa.';setTimeout(()=>URL.revokeObjectURL(u),2000);const button=e.currentTarget;setTimeout(()=>button.focus({preventScroll:true}),0);};
 $('[data-overview-copy]').onclick=async()=>{if(!current)return;try{await navigator.clipboard.writeText(currentURL(current.settings).href);status.textContent='Laskelman linkki kopioitu. Se sisältää vuoden, tuntimäärän ja laskentavalinnat.';}catch{status.textContent='Kopiointi ei onnistunut. Voit kopioida sivun osoitteen selaimen osoiteriviltä.';}};
 try{const settings=overviewSettings({year:scope==='hub'?(query.get('year')||pathYear):pathYear,hours:query.get('hours')??7.5,eves:query.get('eves')==='1',sixDays:query.get('week')==='6'});form.elements.year.value=settings.year;form.elements.hours.value=settings.hours;form.elements.eves.checked=settings.eves;form.elements.week.value=settings.sixDays?'6':'5';update(true);}catch{update(true);status.textContent='Linkin asetukset eivät olleet kelvolliset. Näytämme ma–pe-viikon ja 7,5 tunnin päivän.';}
}
