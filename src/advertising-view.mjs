import config from '../data/advertising.json' with {type:'json'};
const errors=new Set(['/404/','/500/','/404.html','/500.html']);
const nonPagePrefixes=['/assets/','/lataukset/','/downloads/','/api/','/reports/','/preview/','/_'];
export function advertisingEligible(path){
 return config.enabled===true&&config.mode==='sponsored-link'&&/^https:\/\/asiafilm\.org\/4\/[a-f0-9]{32}$/.test(config.directLink)&&typeof path==='string'&&path.startsWith('/')&&path.endsWith('/')&&!/[?#]/.test(path)&&!errors.has(path)&&!nonPagePrefixes.some(prefix=>path.startsWith(prefix));
}
export function advertisingSlot(){return `<section class="ad-placement no-print" data-advertising-slot data-advertising-mode="sponsored-link" aria-label="Mainos"><span class="ad-placement-label">Mainos</span>
  <a class="sponsored-banner" data-sponsored-link href="${config.directLink}" rel="sponsored external noopener noreferrer" referrerpolicy="no-referrer" target="_blank">
    <span class="sponsored-banner__art" aria-hidden="true"><svg viewBox="0 0 96 96" fill="none"><rect x="13" y="20" width="58" height="64" rx="10" fill="currentColor" opacity=".12" transform="rotate(-9 13 20)"/><rect x="25" y="12" width="58" height="70" rx="10" fill="var(--sponsor-paper,#fff)" stroke="currentColor" stroke-width="2"/><path d="M38 32h32M38 43h22M38 54h27" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="69" cy="70" r="17" fill="currentColor"/><path d="M62 70h14m-7-7v14" stroke="var(--sponsor-paper,#fff)" stroke-width="2.5" stroke-linecap="round"/></svg></span>
    <span class="sponsored-banner__copy"><strong>Tutustu mainostajien tarjontaan</strong><span>Ulkoinen mainoslinkki</span></span>
    <span class="sponsored-banner__cta">Katso tarjoukset<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 5h5v5m0-5-9 9M10 5H5v14h14v-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
  </a>
</section>`;}
export function advertisingConfigMarkup(){return `<script type="application/json" id="advertising-config">${JSON.stringify(config).replaceAll('<','\\u003c')}</script>`;}
