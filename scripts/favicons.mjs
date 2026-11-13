import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {ICO_SIZES, PNG_SIZES} from '../src/site-icons.mjs';

// Separate from the social renderer: favicon changes must not invalidate OG images.
export async function favicons(out) {
  const svg = await fs.readFile(new URL('../assets/favicon.svg', import.meta.url));
  await fs.mkdir(out, {recursive:true});
  await fs.writeFile(path.join(out, 'icon.svg'), svg);
  const raster = size => sharp(svg, {density:192}).resize(size, size).png().toBuffer();
  for (const size of PNG_SIZES) await fs.writeFile(path.join(out, `icon-${size}.png`), await raster(size));

  const images = await Promise.all(ICO_SIZES.map(raster));
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((bytes, i) => {
    const entry = 6 + i * 16, size = ICO_SIZES[i];
    header[entry] = size === 256 ? 0 : size;
    header[entry + 1] = header[entry];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(bytes.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += bytes.length;
  });
  await fs.writeFile(path.join(out, '../favicon.ico'), Buffer.concat([header, ...images]));
  await fs.writeFile(path.join(out, '../site.webmanifest'), JSON.stringify({
    id:'/', name:'Kalenteri365', short_name:'Kalenteri365', lang:'fi-FI',
    start_url:'/', scope:'/', display:'browser',
    background_color:'#ffffff', theme_color:'#002f6c',
    icons:[192,512].map(size=>({src:`/assets/icon-${size}.png`,sizes:`${size}x${size}`,type:'image/png',purpose:'any'}))
  }, null, 2) + '\n');
}
