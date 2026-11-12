import test from 'node:test';import assert from 'node:assert/strict';
import {getWeather,summarizeForecast,weatherResponse} from '../lib/met-forecast.mjs';
import {edition,horoscopeResponse,todayFi} from '../lib/horoscope.mjs';
const t=Date.parse('2026-11-12T12:00:00Z');
const forecast={properties:{meta:{updated_at:'2026-11-12T11:30:00Z'},timeseries:[{time:'2026-11-12T12:00:00Z',data:{instant:{details:{air_temperature:4.5,wind_speed:2.5,relative_humidity:80}},next_1_hours:{summary:{symbol_code:'lightsnowshowers_night'}}}}]}};
test('MET Norway forecasts preserve source time, select night/snow correctly and reject stale model coverage',()=>{const value=summarizeForecast(forecast,t);assert.equal(value.temperature,4.5);assert.equal(value.icon,'snow');assert.equal(value.time,'2026-11-12T12:00:00Z');assert.throws(()=>summarizeForecast(forecast,t+5*3600000));});
test('MET Norway uses identifying UA, four-decimal city coordinates, shared requests and upstream expiry',async()=>{let calls=0;const mock=async(url,options)=>{calls++;assert.match(options.headers['User-Agent'],/Kalenteri365.fi/);assert.match(new URL(url).searchParams.get('lat'),/^\d+\.\d{4}$/);return Response.json(forecast,{headers:{Expires:new Date(t+600000).toUTCString(),'Last-Modified':new Date(t-600000).toUTCString()}})};const [a,b]=await Promise.all([getWeather('tampere',{fetchImpl:mock,now:t}),getWeather('tampere',{fetchImpl:mock,now:t})]);assert.equal(calls,1);assert.equal(a.value.city,'tampere');assert.equal(a.value.placeName,'Tampere');assert.equal(b.expires,t+600000);await getWeather('tampere',{fetchImpl:mock,now:t+500000});assert.equal(calls,1);const conditional=async(url,options)=>{calls++;assert.equal(options.headers['If-Modified-Since'],new Date(t-600000).toUTCString());return new Response(null,{status:304,headers:{Expires:new Date(t+1200000).toUTCString()}})};assert.equal((await getWeather('tampere',{fetchImpl:conditional,now:t+610000})).value.temperature,4.5);assert.equal(calls,2);assert.equal((await weatherResponse(new Request('https://kalenteri365.fi/api/weather?place=not-a-city'))).status,404);});
test('all 12 Finnish horoscope editions advance at Helsinki midnight, vary by sign/day and reject future/unavailable dates',async()=>{const now=new Date('2026-11-12T22:01:00Z');assert.equal(todayFi(now),'2026-11-13');const a=edition('2026-11-12',now),b=edition('2026-11-13',now);assert.equal(Object.keys(a.entries).length,12);assert.equal(new Set(Object.values(a.entries).map(x=>x.title)).size,12);for(const key of Object.keys(a.entries)){assert.notEqual(a.entries[key].overview,b.entries[key].overview);assert.equal(b.entries[key].date,'2026-11-13');}for(const ds of ['2026-11-14','2026-11-01','2026-02-30',''])assert.throws(()=>edition(ds,now));assert.equal(horoscopeResponse(new Request('https://kalenteri365.fi/api/horoscope?sign=rapu'),now).status,200);assert.equal(horoscopeResponse(new Request('https://kalenteri365.fi/api/horoscope?sign=cancer'),now).status,404);});

test('collection and detail HTML refresh from the same Finnish day edition without JavaScript',async()=>{
 const{refreshHoroscopeHTML,edition}=await import('../lib/horoscope.mjs');const now=new Date('2026-11-12T12:00:00Z'),e=edition('2026-11-12',now);
 const html='<!-- COLLECTION:START --><time datetime="2020-01-01">vanha</time><h3 data-daily-title="rapu">vanha</h3><p data-daily-text="rapu">vanha</p><!-- COLLECTION:END -->';
 const updated=refreshHoroscopeHTML(html,'/horoskooppi/',now);assert(updated.includes(e.entries.rapu.title));assert(updated.includes(e.entries.rapu.overview));assert(updated.includes('datetime="2026-11-12"'));assert(!updated.includes('vanha'));
 const detail=refreshHoroscopeHTML('<!-- DAILY:START -->old<!-- DAILY:END -->','/horoskooppi/rapu/',now);assert(detail.includes(e.entries.rapu.title));
});

test('daily horoscope middleware bypasses static validators and removes stale body headers',async()=>{
 const {onRequest}=await import('../functions/horoskooppi/_middleware.js');
 let received;
 const request=new Request('https://kalenteri365.fi/horoskooppi/rapu/',{headers:{'If-None-Match':'"yesterday"','If-Modified-Since':'Wed, 11 Nov 2026 12:00:00 GMT','Accept-Language':'fi'}});
 const result=await onRequest({request,next:async incoming=>{
  received=incoming;
  return new Response('<!-- DAILY:START -->vanha<!-- DAILY:END -->',{headers:{'Content-Type':'text/html; charset=utf-8','Content-Encoding':'gzip','Content-Length':'42',ETag:'"static"','Last-Modified':'Wed, 11 Nov 2026 12:00:00 GMT'}});
 }});
 assert.equal(received.headers.get('If-None-Match'),null);assert.equal(received.headers.get('If-Modified-Since'),null);assert.equal(received.headers.get('Accept-Language'),'fi');
 for(const name of ['Content-Encoding','Content-Length','ETag','Last-Modified'])assert.equal(result.headers.get(name),null);
 assert.match(result.headers.get('Cache-Control'),/s-maxage=60/);assert(!((await result.text()).includes('vanha')));
});
