import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const {AxeBuilder}=await import(process.env.AXE_MODULE||'@axe-core/playwright');
const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4186';
if(!['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname))throw Error('Use the local preview for this audit.');
const pages=JSON.parse(await fs.readFile(path.join(root,'reports/pages.json')));
const paths=[...new Set([...pages.filter(p=>p.path.split('/').filter(Boolean).length<=1).map(p=>p.path),'/horoskooppi/rapu/','/kalenteri/2028/helmikuu/','/kuukalenteri/2028/helmikuu/','/404.html'])];
const results=[];
for(const width of [390,1440]){
 let browser,page,errors=[];
 try{
  for(let i=0;i<paths.length;i++){
   if(i%20===0){
    await browser?.close();browser=await chromium.launch({channel:process.env.CHROME_CHANNEL||'chrome',headless:true});
    const context=await browser.newContext({viewport:{width,height:900},locale:'fi-FI'});page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>localStorage.setItem('fi-storage-notice-until','9999999999999'));
   }
   errors=[];
   await page.goto(base+paths[i],{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
   const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   results.push({path:paths[i],width,violations:scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),errors});
   if(i%20===0)console.log(`${width}: ${i}/${paths.length}`);
  }
 }finally{await browser?.close();}
}
const failures=results.filter(r=>r.violations.length||r.errors.length);
await fs.writeFile(path.join(root,'reports/accessibility-audit.json'),JSON.stringify({views:results.length,affectedViews:failures.length,results},null,2)+'\n');
console.log(JSON.stringify({views:results.length,affectedViews:failures.length}));
if(failures.length)process.exitCode=1;
