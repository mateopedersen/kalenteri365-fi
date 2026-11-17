import {mountDisplayBanner} from './display-runtime.mjs';
const node=document.getElementById('advertising-config');
let bannerConfig;try{bannerConfig=JSON.parse(node?.textContent||'null');}catch{}
if(bannerConfig)mountDisplayBanner(bannerConfig);

const dialog=document.createElement('dialog');dialog.className='advertising-dialog';dialog.setAttribute('aria-labelledby','storage-info-title');
const heading=document.createElement('h2');heading.id='storage-info-title';heading.textContent='Evästeet ja tallennus';
const description=document.createElement('p');description.textContent='Omat kalenterimerkinnät ja asetukset säilyvät tässä selaimessa, kun käytät tallentavaa toimintoa. Sivustolla ei ole erillistä käyttäjäanalytiikkaa. Adsterra näyttää mainosbannereita ja voi käyttää mainosevästeitä. Voit hallita mainoksia evästesivulla.';
const policy=document.createElement('a');policy.href='/evasteet/';policy.textContent='Lue evästeistä ja hallitse omia tallennuksiasi';
const close=document.createElement('button');close.type='button';close.textContent='Sulje';close.className='btn secondary';const actions=document.createElement('div');actions.className='advertising-choice-actions';actions.append(close);dialog.append(heading,description,policy,actions);document.body.append(dialog);
let opener;document.addEventListener('click',event=>{const button=event.target.closest?.('[data-cookie-preferences],[data-advertising-open]');if(!button)return;event.preventDefault();opener=button;if(!dialog.open)dialog.showModal();close.focus({preventScroll:true});});close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
