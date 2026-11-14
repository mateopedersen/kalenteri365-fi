import {art, icon} from './ui.mjs';

// Add a shortcut only when the actual download gallery follows other content.
export function templateGuidance(body) {
  const gallery=/<section\b[^>]*class="([^"]*\b(?:planner-downloads|lunar-downloads|calendar-downloads)\b[^"]*)"[^>]*>/.exec(body);
  if(!gallery || !body.slice(0,gallery.index).trim())return body;
  const target=/\bid="([^"]+)"/.exec(gallery[0])?.[1];
  if(!target)throw new Error('Template gallery needs a stable anchor');
  const lunar=gallery[1].split(/\s+/).includes('lunar-downloads')&&!gallery[1].split(/\s+/).includes('planner-downloads');
  const subject=lunar?'Tulostettavat kuukalenteripohjat':'Tulostettavat kalenteripohjat';
  return `<aside class="template-guidance no-print" aria-label="Tulostettavat pohjat">${art('pdf')}<p><strong>${subject} löytyvät alempaa tältä sivulta.</strong><span>Katso esikatselut ja lataa sopiva pohja PDF:nä tai kuvana.</span></p><a href="#${target}">Siirry tulostuspohjiin ${icon('chevron')}</a></aside>`+body;
}
