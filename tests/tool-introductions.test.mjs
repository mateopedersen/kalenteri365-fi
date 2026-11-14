import test from 'node:test';
import assert from 'node:assert/strict';
import {tools} from '../src/ui.mjs';
import {introduceTool,toolIntroduction,TOOL_INTRODUCTIONS} from '../src/tool-introductions.mjs';
import {planSheet} from '../src/plan-sheet.mjs';

test('Every menu tool has distinct Finnish entry guidance and a practical example',()=>{
  assert.equal(tools.length,49);
  assert.equal(new Set(Object.values(TOOL_INTRODUCTIONS).map(([,text])=>text)).size,49);
  for(const [slug] of tools){
    const html=toolIntroduction(`/${slug}/`);
    assert.match(html,/class="tool-introduction-purpose"/);
    assert.match(html,/class="tool-introduction-example"/);
    assert.ok(!/undefined|lorem ipsum|AdSense/i.test(html),slug);
  }
  assert.equal(toolIntroduction('/kuukausikalenteri/2028/tammikuu/'),'');
});

test('Custom heroes keep their H1 before guidance and their controls after it',()=>{
  for(const tag of ['header','section']){
    const body=`<div><${tag}><div><h1>Oma työkalu</h1><p>Johdanto</p></div></${tag}><form id="tyokalu"></form></div>`;
    const html=introduceTool('/paivasuunnittelija/',body,{customHeader:true});
    assert.ok(html.indexOf('<h1>')<html.indexOf('data-tool-introduction'));
    assert.ok(html.indexOf('data-tool-introduction')<html.indexOf('<form'));
    assert.match(html,new RegExp(`</${tag}><section class="tool-introduction"`));
  }
  assert.throws(()=>introduceTool('/paivasuunnittelija/','<div>No heading</div>',{customHeader:true}));
});

test('Daily planner describes a day rather than a week and keeps its date controls',()=>{
  const html=planSheet('paivasuunnittelija','Päiväsuunnittelija',['7.00','8.00']);
  assert.match(html,/Tilaa päivän tärkeille asioille/);
  assert.ok(!html.includes('Tilaa viikon tärkeille asioille'));
  assert.match(html,/Edellinen päivä/);
  assert.match(html,/Seuraava päivä/);
});
