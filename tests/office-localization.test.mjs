import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

// The normal build supplies the holiday lookup. These package-language tests
// use an isolated empty lookup; calendar arithmetic is tested independently.
const dir = await mkdtemp(join(tmpdir(), 'kalenteri365-office-'));
after(() => rm(dir, {recursive: true, force: true}));
for (const file of ['engine.mjs', 'office-exports.mjs', 'binary-exports.mjs', 'templates.mjs']) {
  await writeFile(join(dir, file), await readFile(new URL('../assets/studio/' + file, import.meta.url)));
}
await writeFile(join(dir, 'finland-data.mjs'), 'export const FINLAND_HOLIDAYS={};export const STUDIO_PHOTOS=[];');
const {initialState, normalize, parseEvents} = await import(pathToFileURL(join(dir, 'engine.mjs')));
const {createDocx, createXlsx} = await import(pathToFileURL(join(dir, 'office-exports.mjs')));

const image = {
  bytes: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aPioAAAAASUVORK5CYII=', 'base64'),
  width: 1,
  height: 1,
};

test('Finnish CSV recurrence flags preserve annual reminders', () => {
  const rows = parseEvents('2028-02-29;Syntymäpäivä;Kyllä\n2028-03-01;Yhteinen ilta;ei\n2028-03-02;Muistutus;kylla');
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map(row => row.annual), [true, false, true]);
});

test('new projects and older projects without a resolution use 600 dpi', () => {
  const state = initialState(2028);
  assert.equal(state.quality, 600);
  delete state.quality;
  assert.equal(normalize(state).quality, 600);
  assert.equal(normalize({...state, quality: 300}).quality, 300);
});

test('Word and Excel metadata, image descriptions and notes use Finnish', () => {
  const state = {...initialState(2028), view: 'month', month: 2,
    title: 'Omat tärkeät päivät', showNotes: true, notes: 'Muista yhteinen ilta.',
    layers: [{type: 'text', text: 'Oma lisäteksti'}], photoCredit: 'Kuva: oma valokuva'};
  const docx = new TextDecoder().decode(createDocx(state, [image]));
  const xlsx = new TextDecoder().decode(createXlsx(state, [image]));
  for (const document of [docx, xlsx]) {
    assert.match(document, /<dc:language>fi-FI<\/dc:language>/);
    assert.match(document, /Luotu kalenteri365\.fi-palvelussa/);
    assert.doesNotMatch(document, /Izveidots|Personīgs|Lauks|Mans ieraksts|Virsraksts|Papildu teksts|\. lapa/);
  }
  assert.match(docx, /sivu 1/);
  for (const label of ['Tieto', 'Oma merkintä', 'Otsikko', 'Lisäteksti 1', 'Valokuvan lähde', 'Luotu palvelussa']) {
    assert.ok(xlsx.includes(label), label);
  }
  assert.match(xlsx, /horizontalDpi="600" verticalDpi="600"/);
});
