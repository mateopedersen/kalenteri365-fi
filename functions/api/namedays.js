import {namedaysResponse} from '../../lib/namedays.mjs';
export async function onRequestGet({env}) {return namedaysResponse({env});}
