import {illuminatedPath} from './lunar.mjs';

export function lunarSceneDisc(angle,id='lunar-scene'){
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="${id}-rim"><circle cx="50" cy="50" r="48"/></clipPath><clipPath id="${id}-light"><path d="${illuminatedPath(angle)}"/></clipPath><radialGradient id="${id}-shade" cx="40%" cy="36%" r="67%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#010813" stop-opacity=".45"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="#020710"/><image href="/assets/photos/moon-phase-texture.webp" x="2" y="2" width="96" height="96" clip-path="url(#${id}-rim)" opacity=".12"/><image href="/assets/photos/moon-phase-texture.webp" x="2" y="2" width="96" height="96" clip-path="url(#${id}-light)"/><circle cx="50" cy="50" r="48" fill="url(#${id}-shade)"/><circle cx="50" cy="50" r="48" fill="none" stroke="#c4d7e9" stroke-opacity=".2" stroke-width=".45"/></svg>`;
}
