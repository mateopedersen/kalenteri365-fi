import {refreshHoroscopeHTML,horoscopeCacheControl} from '../../lib/horoscope.mjs';
export async function onRequest({request,next}){
 const requestHeaders=new Headers(request.headers);
 requestHeaders.delete('If-None-Match');requestHeaders.delete('If-Modified-Since');
 const response=await next(new Request(request,{headers:requestHeaders}));if(!response.headers.get('content-type')?.includes('text/html'))return response;
 const html=await response.text(),now=new Date(),updated=refreshHoroscopeHTML(html,new URL(request.url).pathname,now);
 const headers=new Headers(response.headers);headers.set('Cache-Control',horoscopeCacheControl(now)+', no-transform');headers.set('X-Content-Type-Options','nosniff');
 for(const name of ['Content-Length','Content-Encoding','ETag','Last-Modified'])headers.delete(name);
 return new Response(updated,{status:response.status,headers});
}
