import fs from 'node:fs/promises';
import fontkit from '@pdf-lib/fontkit';
const fonts=await Promise.all(['Lato-Regular.ttf','Lato-Bold.ttf'].map(async name=>fontkit.create(await fs.readFile(new URL('../assets/fonts/'+name,import.meta.url)))));
export function measure(s,size,bold=true){const f=fonts[bold?1:0];return f.layout(String(s)).positions.reduce((n,p)=>n+p.xAdvance,0)*size/f.unitsPerEm;}
export function lettering(s,x,y,size,fill='#163d64',bold=true,align='start'){
 s=String(s);const f=fonts[bold?1:0],run=f.layout(s);let at=0;const pieces=[];
 for(const char of s)if(!f.hasGlyphForCodePoint(char.codePointAt(0)))throw Error('Missing OG glyph: '+char);
 const w=measure(s,size,bold);if(align==='middle')x-=w/2;if(align==='end')x-=w;
 for(let i=0;i<run.glyphs.length;i++){const p=run.positions[i];pieces.push(`<path d="${run.glyphs[i].path.toSVG()}" transform="translate(${at+p.xOffset} ${p.yOffset})"/>`);at+=p.xAdvance;}
 return `<g fill="${fill}" transform="translate(${x} ${y}) scale(${size/f.unitsPerEm} ${-size/f.unitsPerEm})">${pieces.join('')}</g>`;
}
export function wrapLabel(s,maxWidth=1050,initialSize=38,maxLines=2){
 for(let size=initialSize;size>=Math.min(12,initialSize);size--){const lines=[];let current='';for(const word of String(s).split(/\s+/)){const next=current?current+' '+word:word;if(measure(next,size)>maxWidth&&current){lines.push(current);current=word;}else current=next;}if(current)lines.push(current);if(lines.length<=maxLines&&lines.every(line=>measure(line,size)<=maxWidth))return {lines,size};}
 throw Error('OG title cannot fit: '+s);
}
