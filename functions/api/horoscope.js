import {horoscopeResponse} from '../../lib/horoscope.mjs';
export function onRequestGet({request}){return horoscopeResponse(request);}
