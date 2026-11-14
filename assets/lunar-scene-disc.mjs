import {illuminatedPath} from './lunar.mjs';

// The phase mask follows the calculated angle. Surface detail is a single
// historical photograph, with lunar north up; it is not a future photograph.
import {lunarLightStops} from './lunar-disc-core.mjs';

export function lunarSceneDisc(angle,id='lunar-scene'){
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="${id}-rim"><circle cx="50" cy="50" r="48"/></clipPath><clipPath id="${id}-light"><path data-lunar-phase d="${illuminatedPath(angle)}"/></clipPath><linearGradient id="${id}-lightfall" x1="0%" x2="100%" y1="0%" y2="0%">${lunarLightStops(angle).map(s=>`<stop offset="${s.offset}" stop-color="#01050a" stop-opacity="${s.opacity.toFixed(4)}"/>`).join('')}</linearGradient><radialGradient id="${id}-shade" cx="50%" cy="50%" r="50%"><stop offset="65%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#010813" stop-opacity=".42"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="#020710"/><image href="/assets/photos/moon-heading.webp" x="2" y="2" width="96" height="96" clip-path="url(#${id}-rim)" opacity=".045"/><g clip-path="url(#${id}-light)"><image href="/assets/photos/moon-heading.webp" x="2" y="2" width="96" height="96"/><circle cx="50" cy="50" r="48" fill="url(#${id}-lightfall)"/></g><circle cx="50" cy="50" r="48" fill="url(#${id}-shade)"/><circle cx="50" cy="50" r="48" fill="none" stroke="#c4d7e9" stroke-opacity=".16" stroke-width=".35"/></svg>`;
}

export function connectLunarDisc(element,id) {
  // Keep image, clipping and gradient nodes alive during the whole playback.
  element.innerHTML=lunarSceneDisc(0,id);
  const path=element.querySelector('[data-lunar-phase]');
  const stops=[...element.querySelectorAll('linearGradient stop')];
  let previous=NaN;
  return {
    update(angle,force=false){
      if(!Number.isFinite(angle)||(!force&&Math.abs(angle-previous)<.04))return;
      previous=angle;
      path.setAttribute('d',illuminatedPath(angle));
      lunarLightStops(angle).forEach((s,i)=>stops[i].setAttribute('stop-opacity',s.opacity.toFixed(4)));
      element.dataset.phaseAngle=String(angle);
    }
  };
}
