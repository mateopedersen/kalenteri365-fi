import {quantity} from './fi-language.mjs';
import {weekendResults} from './long-weekend-view.mjs';
const root=document.querySelector('[data-weekend-workspace]');
if(root){
 let year=Number(root.dataset.year);
 const fixed=Boolean(root.dataset.fixedYear);
 const render=()=>{
  const budget=Number(root.querySelector('[name="weekend-budget"]:checked').value),result=weekendResults(year,budget);
  root.querySelector('[data-weekend-results]').innerHTML=result.html;
  root.querySelector('[data-weekend-empty]').hidden=result.count>0;
  root.querySelector('[data-weekend-status]').textContent=`${quantity(result.count,'vaihtoehto','vaihtoehtoa')} vuodelle ${year} · ${budget===0?'ilman haettavia työpäiviä':'enintään '+budget+' haettava'+(budget===1?' työpäivä':'a työpäivää')}`;
  root.querySelectorAll('[data-weekend-year]').forEach(a=>{if(Number(a.dataset.weekendYear)===year)a.setAttribute('aria-current',fixed?'page':'true');else a.removeAttribute('aria-current');});
  if(!fixed){const link=root.querySelector('[data-weekend-year-link]');link.href='/pitkat-viikonloput/'+year+'/';link.firstChild.textContent='Avaa vuoden '+year+' oma sivu ';}
 };
 root.querySelectorAll('[name="weekend-budget"]').forEach(input=>input.addEventListener('change',render));
 root.querySelectorAll('[data-weekend-year]').forEach(a=>a.addEventListener('click',event=>{
  if(fixed||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();year=Number(a.dataset.weekendYear);render();
 }));
}
