import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchWeather, usableWeather} from '../assets/weather-client.mjs';

const now = Date.parse('2026-11-13T14:00:00Z');
const sample = {city:'helsinki', time:'2026-11-13T14:00:00Z', temperature:3, symbol:'rain_day'};

test('weather validation rejects another city, missing conditions and old forecasts', () => {
  assert(usableWeather(sample, 'helsinki', now));
  assert(!usableWeather(sample, 'tampere', now));
  assert(!usableWeather({...sample, temperature:null}, 'helsinki', now));
  assert(!usableWeather({...sample, symbol:''}, 'helsinki', now));
  assert(!usableWeather(sample, 'helsinki', now + 5 * 3600000));
});

test('a transient provider failure retries once and returns the actual city forecast', async () => {
  let calls = 0;
  const data = await fetchWeather('helsinki', {now:()=>now, retryDelayMs:1, fetchImpl:async url => {
    assert.equal(url, '/api/weather?place=helsinki');
    return ++calls === 1 ? new Response('', {status:503}) : Response.json(sample);
  }});
  assert.equal(calls, 2);
  assert.deepEqual(data, sample);
});

test('invalid forecasts and unknown cities are not retried or shown as current weather', async () => {
  for (const response of [new Response('', {status:404}), Response.json({...sample, city:'oulu'}), Response.json({...sample, time:'2026-11-01T14:00:00Z'})]) {
    let calls = 0;
    await assert.rejects(fetchWeather('helsinki', {now:()=>now, retryDelayMs:1, fetchImpl:async()=>{calls++;return response;}}));
    assert.equal(calls, 1);
  }
});

test('slow weather requests time out and retries are bounded', async () => {
  let calls = 0;
  await assert.rejects(fetchWeather('helsinki', {timeoutMs:8, retryDelayMs:1, fetchImpl:async (url,{signal}) => {
    calls++;
    return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));
  }}));
  assert.equal(calls, 2);
});

test('changing city aborts the old request and cancels its retry', async () => {
  const controller = new AbortController();
  let calls = 0;
  const pending = fetchWeather('helsinki', {signal:controller.signal, retryDelayMs:100, fetchImpl:async()=>{
    calls++;
    queueMicrotask(()=>controller.abort());
    return new Response('', {status:503});
  }});
  await assert.rejects(pending);
  assert.equal(calls, 1);
});
