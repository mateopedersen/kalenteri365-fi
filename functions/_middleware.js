import paths from './advertising-routes.js';
import {advertisingResponse} from '../src/advertising-csp.mjs';
const publicPaths=new Set(paths);
export const onRequest=context=>advertisingResponse(context,publicPaths,['kalenteri365.fi','www.kalenteri365.fi']);
