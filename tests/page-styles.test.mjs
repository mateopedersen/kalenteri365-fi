import test from 'node:test';
import assert from 'node:assert/strict';
import {pageStyleNames} from '../scripts/page-styles.mjs';

test('Shared chrome is retained and unrelated feature styles are omitted in cascade order',()=>{
  const names=['site.css','community.css','work-tools.css','solar-workspace.css','footer.css'];
  assert.deepEqual(pageStyleNames(names,'<body><section class="solar-workspace"></section></body>'),[
    'site.css','community.css','solar-workspace.css','footer.css'
  ]);
});

test('Related page variants retain the styles used by their shared components',()=>{
  const cases=[
    ['education-hub.css','education-institution-banner'],
    ['education-hub.css','institution-credits'],
    ['garden-planner.css','crop-photo'],
    ['daylength.css','solar-stage'],
    ['zodiac-guide.css','horoscope-grid'],
    ['document-pages.css','legal-intro'],
    ['calendar-workspace.css','calendar-table'],
    ['benefit-workspace.css','pension-workspace'],
    ['pension-workspace.css','benefit-workspace'],
  ];
  for(const [sheet,root] of cases)assert.deepEqual(pageStyleNames([sheet],`<section class="other ${root}"></section>`),[sheet]);
});
