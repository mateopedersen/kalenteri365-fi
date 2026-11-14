import {esc} from './ui.mjs';
import {MONTHS,cap} from './calendar.mjs';
const dt=d=>new Intl.DateTimeFormat('fi-FI',{day:'numeric',month:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
const weekday=d=>new Intl.DateTimeFormat('fi-FI',{weekday:'long',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
const brand=(id)=>`<img src="/assets/brands/${id}.svg" width="28" height="28" alt="" decoding="async">`;
export function createPaymentCards({report,path,googleURL,prefix='pension'}){
function dateActions(plan,d,reminder){return `<div class="pension-date-actions"><a href="${esc(googleURL(plan,d))}" target="_blank" rel="noopener noreferrer" aria-label="Google Kalenteri: ${dt(d)}">${brand('google-calendar')}<span>Google</span></a><a href="${path(plan,reminder,d)}" aria-label="Apple Kalenteri: ${dt(d)}">${brand('apple')}<span>Apple</span></a><a href="${path(plan,reminder,d)}" download aria-label="Outlook: ${dt(d)}">${brand('outlook')}<span>Outlook</span></a></div>`;}
function dateCards(plan,dates,{today,reminder='1',view='cards'}={}){
 const next=report(plan,today).next;
 if(!dates.length)return `<div class="pension-empty">${''}<h3>Valitulla rajauksella ei ole maksupäiviä.</h3><p>Vaihda kuukautta tai näytä koko vuoden julkaistu kalenteri.</p><button type="button" class="btn secondary" data-${prefix}-action="reset">Näytä koko vuosi ${''}</button></div>`;
 if(view==='table')return `<div class="pension-table-scroll" role="region" aria-label="Maksupäivät" tabindex="0"><table><thead><tr><th scope="col">Kuukausi</th><th scope="col">Maksupäivä</th><th scope="col">Viikonpäivä</th><th scope="col">Lisää kalenteriin</th></tr></thead><tbody>${dates.map(d=>`<tr class="${d===next?'is-next':''}"><th scope="row">${cap(MONTHS[Number(d.slice(5,7))-1])}</th><td><time datetime="${d}">${dt(d)}</time></td><td>${cap(weekday(d))}</td><td>${dateActions(plan,d,reminder)}</td></tr>`).join('')}</tbody></table></div>`;
 return `<div class="pension-date-grid">${dates.map(d=>`<article class="pension-date-card ${d===next?'is-next':''} ${d<today?'is-past':''}"><div class="pension-month-line"><h3>${cap(MONTHS[Number(d.slice(5,7))-1])}</h3>${d===next?'<span>Seuraava</span>':d<today?'<span class="pension-past">Mennyt</span>':''}</div><time datetime="${d}"><strong>${Number(d.slice(8))}.</strong><span>${dt(d)}<small>${cap(weekday(d))}</small></span></time>${dateActions(plan,d,reminder)}</article>`).join('')}</div>`;
}

return dateCards;
}
