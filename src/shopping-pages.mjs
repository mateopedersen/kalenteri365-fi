import config from '../data/shopping-guides.json' with {type:'json'};
import {render,discovery} from '../scripts/shopping-guides/render.mjs';
export const shoppingStylesheet=config.css;
export const shoppingHub=()=>discovery(config);
export async function shoppingPages(page){for(let i=0;i<config.pages.length;i++){const p=config.pages[i];await page(config.paths[i],p.title,p.description,render(config,p),'page',{customGuide:true,customHeader:true,relatedContent:'',shoppingGuide:true,shoppingStylesheet:config.css});}}
