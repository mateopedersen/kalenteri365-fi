import {refreshHoroscopeHTML} from '../../lib/horoscope.mjs';
export async function onRequest({request,next}){
 const requestHeaders=new Headers(request.headers);
 requestHeaders.delete('If-None-Match');requestHeaders.delete('If-Modified-Since');
 const response=await next(new Request(request,{headers:requestHeaders}));if(!response.headers.get('content-type')?.includes('text/html'))return response;
 const html=await response.text(),updated=refreshHoroscopeHTML(html,new URL(request.url).pathname);
 const headers=new Headers(response.headers);headers.set('Cache-Control','public, max-age=0, s-maxage=60, must-revalidate');headers.set('X-Content-Type-Options','nosniff');
 for(const name of ['Content-Length','Content-Encoding','ETag','Last-Modified'])headers.delete(name);
 return new Response(updated,{status:response.status,headers});
}
