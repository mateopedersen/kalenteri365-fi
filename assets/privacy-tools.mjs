import {localInventory,exportLocalData,removeLocalData} from './privacy-storage-core.mjs';
const root=document.querySelector('[data-privacy-tools]');
if(root){
  let local,session;try{local=window.localStorage;session=window.sessionStorage;}catch{}
  const status=root.querySelector('[role="status"]'),dialog=root.querySelector('dialog'),list=root.querySelector('[data-storage-list]');
  function refresh(){const inventory=localInventory(local,session);list.replaceChildren();for(const row of inventory.rows){const item=document.createElement('li'),name=document.createElement('strong'),detail=document.createElement('span');name.textContent=row.name;detail.textContent=row.detail+' · '+Math.max(1,Math.ceil(row.bytes/1024)).toLocaleString('fi-FI')+' kt';item.append(name,detail);list.append(item);}if(!inventory.rows.length){const item=document.createElement('li');item.textContent=local?'Tähän selaimeen ei ole tallennettu luettelossa mainittuja tietoja.':'Selain ei salli paikallisen tallennustilan lukemista.';list.append(item);}}
  root.querySelector('[data-storage-refresh]').onclick=()=>{refresh();status.textContent='Tallennusluettelo päivitetty.';};
  root.querySelector('[data-storage-export]').onclick=()=>{try{if(!local)throw Error('Selain ei salli tallennustilan lukemista.');const data=exportLocalData(local,session),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='kalenteri365-omat-tiedot.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Paikallinen tietokopio ladattu. Säilytä tiedosto turvallisesti.';}catch(e){status.textContent=e.message;}};
  root.querySelector('[data-storage-delete]').onclick=()=>{dialog.querySelectorAll('input').forEach(i=>i.checked=false);dialog.querySelector('[data-delete-confirm]').disabled=true;dialog.showModal();};
  dialog.querySelector('[data-delete-cancel]').onclick=()=>dialog.close();
  dialog.addEventListener('change',()=>dialog.querySelector('[data-delete-confirm]').disabled=!dialog.querySelector('input:checked'));
  dialog.querySelector('[data-delete-confirm]').onclick=()=>{try{const groups=[...dialog.querySelectorAll('input:checked')].map(i=>i.value);const count=removeLocalData(local,session,groups);dialog.close();refresh();status.textContent=count+(count===1?' paikallinen tallenne':' paikallista tallennetta')+' poistettu. Muissa avoimissa Kalenteri365-välilehdissä voi olla tallentamattomia muutoksia. Sulje ne ennen käytön jatkamista.';}catch{status.textContent='Poistaminen ei onnistunut. Voit poistaa sivuston tiedot selaimesi asetuksista.';}};
  refresh();
}
