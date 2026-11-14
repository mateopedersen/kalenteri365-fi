import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4186';
if(!['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname))throw Error('Use a local preview.');
const records=JSON.parse(await fs.readFile(path.join(root,'reports/pages.json'))),results=[];let next=0,done=0;
async function worker(){
 let browser,context,page,errors=[],assets=[],api=[];
 try{
  for(let index=next++;index<records.length;index=next++){
   if(!browser||done%30===0){await browser?.close();browser=await chromium.launch({channel:'chrome',headless:true});context=await browser.newContext({viewport:{width:390,height:844},locale:'fi-FI'});await context.addInitScript(()=>localStorage.setItem('fi-storage-notice-until','9999999999999'));page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{const u=new URL(r.url());if(u.origin===new URL(base).origin&&r.status()>=400){(u.pathname.startsWith('/api/')?api:assets).push({path:u.pathname,status:r.status()});}});}
   errors=[];assets=[];api=[];const record=records[index];
   try{
    await page.goto(base+record.path,{waitUntil:'load',timeout:20000});await page.waitForTimeout(120);
    const state=await page.evaluate(()=>({h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth+2,canonical:document.querySelector('link[rel=canonical]')?.href}));
    if(state.h1!==1)errors.push('Expected one H1');if(state.overflow)errors.push('Page overflows viewport');if(state.canonical!=='https://kalenteri365.fi'+record.path)errors.push('Canonical changed after initialization');
    results.push({path:record.path,errors,assets,api});
   }catch(error){results.push({path:record.path,errors:[...errors,error.message],assets,api});}
   done++;if(done%100===0)console.log(`${done}/${records.length}`);
  }
 }finally{await browser?.close();}
}
await Promise.all(Array.from({length:3},worker));
results.sort((a,b)=>a.path.localeCompare(b.path));const affected=results.filter(r=>r.errors.length||r.assets.length);
const report={pages:results.length,affectedPages:affected.length,apiWarnings:results.filter(r=>r.api.length),results};
await fs.writeFile(path.join(root,'reports/browser-runtime-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pages:results.length,affectedPages:affected.length,apiWarnings:report.apiWarnings.length,issues:affected}));if(affected.length)process.exitCode=1;
