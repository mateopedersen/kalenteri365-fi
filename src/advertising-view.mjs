import config from '../data/advertising.json' with {type:'json'};
const errors=new Set(['/404/','/500/','/404.html','/500.html']);
const nonPagePrefixes=['/assets/','/lataukset/','/downloads/','/api/','/reports/','/preview/','/_'];
export function advertisingEligible(path){
 return config.enabled===true&&config.mode==='display-banner'&&typeof path==='string'&&path.startsWith('/')&&path.endsWith('/')&&!/[?#]/.test(path)&&!errors.has(path)&&!nonPagePrefixes.some(prefix=>path.startsWith(prefix));
}
export function advertisingSlot(){return `<section class="ad-placement no-print" data-advertising-slot data-advertising-mode="display-banner" aria-label="Mainos"><span class="ad-placement-label">Mainos</span><div class="ad-placement-stage" data-advertising-stage></div></section>`;}
export function advertisingConfigMarkup(){if(!config.enabled)return '';return `<script type="application/json" id="advertising-config">${JSON.stringify(config).replaceAll('<','\\u003c')}</script>`;}
