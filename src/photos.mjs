import photos from '../data/photo-credits.json' with {type:'json'};
import {esc} from './ui.mjs';
export const PHOTO_CREDITS=photos;
export function photo(id,{className='',lazy=true,sizes='(max-width: 600px) 100vw, 40vw'}={}){
const p=photos.find(p=>p.id===id);if(!p)return '';
if(!p.src.endsWith('.webp'))return `<img class="${esc(className)}" src="${p.src}" alt="${esc(p.alt)}" width="${p.width||1200}" height="${p.height||1200}" ${lazy?'loading="lazy"':'fetchpriority="high"'} decoding="async">`;
const variants=new Map([[Math.min(320,p.width),p.src.replace('.webp','-320.webp')],[Math.min(640,p.width),p.src.replace('.webp','-640.webp')],[p.width,p.src]]),srcset=[...variants].map(([w,src])=>src+' '+w+'w').join(', ');
return `<img class="${esc(className)}" src="${p.width<640?p.src:p.src.replace('.webp','-640.webp')}" srcset="${srcset}" sizes="${sizes}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" ${lazy?'loading="lazy"':'fetchpriority="high"'} decoding="async">`;
}
export function placeCover(id,name){if(!photos.some(p=>p.id===id))return '';return `<figure class="place-cover">${photo(id,{lazy:false})}<figcaption>${esc(name)}</figcaption></figure>`;}
