import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {HOLIDAY_READING} from '../../src/holiday-reading.mjs';
import stories from '../../data/holiday-stories.json' with {type:'json'};

test('published special-day articles retain all contextual destinations and visible sources',async()=>{
  for(const [slug,item]of Object.entries(HOLIDAY_READING)){
    const html=await readFile(new URL(`../../dist/juhlapyhat/${slug}/index.html`,import.meta.url),'utf8');
    assert(html.includes(`data-holiday-reading="${slug}"`),slug);
    const article=html.match(/<div class="holiday-reading"[\s\S]*?<\/div>/)?.[0];
    for(const [target]of item.related){
      assert(article.includes(`href="/juhlapyhat/${target}/"`),`${slug} → ${target}`);
      await readFile(new URL(`../../dist/juhlapyhat/${target}/index.html`,import.meta.url));
    }
    const source=stories[slug].sources[item.sourceIndex].url.replaceAll('&','&amp;');
    const visible=html.replace(/<details\b[\s\S]*?<\/details>/g,'');
    assert(visible.includes(`href="${source}"`),`${slug}: source must be visible without expanding details`);
  }
});
