import {onRequestGet as placeResponse} from '../functions/api/place.js';
import {horoscopeResponse} from '../lib/horoscope.mjs';
import {weatherResponse} from '../lib/met-forecast.mjs';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzip} from 'node:zlib';
import {promisify} from 'node:util';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist'),port=Number(process.env.PORT)||4173;
const compress=promisify(gzip),cache=new Map();
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.pdf':'application/pdf','.ics':'text/calendar; charset=utf-8','.woff2':'font/woff2','.xml':'application/xml'};
const security={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
async function staticResponse(req,res,file,status=200){
 const st=await fs.stat(file),ext=path.extname(file),etag='"'+st.size+'-'+Math.floor(st.mtimeMs)+'"';
 const lifetime=file.includes('/runtime/')||file.includes('/fonts/')||/\/assets\/art-[0-9a-f]{16}\//.test(file)||/site-runtime\..+\.css$/.test(file)?'public, max-age=31536000, immutable':ext==='.html'?'public, max-age=0, must-revalidate':file.includes('/assets/photos/')?'public, max-age=604800':file.includes('/assets/')?'public, max-age=86400':'public, max-age=86400';
 const headers={...security,'Content-Type':types[ext]||'application/octet-stream','Cache-Control':lifetime,'ETag':etag,'Vary':'Accept-Encoding'};
 if(req.headers['if-none-match']===etag){res.writeHead(304,headers);res.end();return;}
 let bytes=await fs.readFile(file);const accepted=/(?:^|,)\s*gzip(?:\s*;\s*q=([\d.]+))?(?:,|$)/.exec(req.headers['accept-encoding']||'');
 if(accepted&&Number(accepted[1]??1)>0&&/\.(?:html|css|m?js|json|svg|xml)$/.test(file)&&bytes.length>600){
  const key=file+etag;let encoded=cache.get(key);if(!encoded){encoded=await compress(bytes);if(cache.size>250)cache.clear();cache.set(key,encoded);}bytes=encoded;headers['Content-Encoding']='gzip';
 }
 headers['Content-Length']=String(bytes.length);res.writeHead(status,headers);res.end(req.method==='HEAD'?undefined:bytes);
}
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');let result;
  if(url.pathname==='/api/place')result=placeResponse({request:new Request(url)});
  if(url.pathname==='/api/horoscope')result=horoscopeResponse(new Request(url));
  if(url.pathname==='/api/weather')result=await weatherResponse(new Request(url));
  if(result){res.writeHead(result.status,{...security,...Object.fromEntries(result.headers)});res.end(await result.text());return;}
  const p=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!p.startsWith(root+path.sep)&&p!==root){res.writeHead(403,security);res.end();return;}
  const st=await fs.stat(p);await staticResponse(req,res,st.isDirectory()?path.join(p,'index.html'):p);
 }catch{try{await staticResponse(req,res,path.join(root,'404.html'),404);}catch{res.writeHead(500,security);res.end('Local preview unavailable.');}}
}).listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+port));
