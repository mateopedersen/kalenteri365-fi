import {weatherResponse} from '../../lib/met-forecast.mjs';
export async function onRequestGet({request,waitUntil}){
 const cache=globalThis.caches?.default;if(cache){const hit=await cache.match(request);if(hit)return hit;}
 const response=await weatherResponse(request);if(cache&&response.ok)waitUntil(cache.put(request,response.clone()));return response;
}
