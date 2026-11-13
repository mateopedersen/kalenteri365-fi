import fs from 'node:fs/promises';
import path from 'node:path';
import {shareServices} from '../assets/share-services.mjs';

export async function verifyShareIcons(root) {
  const sprite = await fs.readFile(path.join(root, 'assets/share-icons.svg'), 'utf8');
  const symbols = [...sprite.matchAll(/<symbol\b([^>]*)>([\s\S]*?)<\/symbol>/g)];
  const ids = [...sprite.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  if (new Set(ids).size !== ids.length) throw Error('Duplicate sharing icon identifier');
  if (symbols.length !== shareServices.length) throw Error('Sharing icon count differs from service catalogue');
  if (/<(?:text|image|script|foreignObject)\b/i.test(sprite)) throw Error('Sharing icons must use real vector geometry');
  for (const service of shareServices) {
    const symbol = symbols.find(match=>new RegExp(`\\bid="s-${service.id}"`).test(match[1]));
    if (!symbol || !/\bviewBox="[^"]+"/.test(symbol[1]) || !/<(?:path|circle|rect|ellipse|polygon|polyline|line)\b/.test(symbol[2])) {
      throw Error('Missing or empty sharing icon: ' + service.id);
    }
  }
  for (const reference of sprite.matchAll(/(?:\b(?:xlink:)?href="#([^"\s]+)"|url\(#([^\s)]+)\))/g)) {
    if (!ids.includes(reference[1] || reference[2])) throw Error('Unresolved sharing icon reference: ' + (reference[1] || reference[2]));
  }
  return {services:shareServices.length, symbols:symbols.length};
}
