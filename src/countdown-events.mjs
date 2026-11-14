import {holidays, YEARS} from './calendar.mjs';
export const COUNTDOWN_YEARS = [2026, ...YEARS];
export const countdownEvents = () => COUNTDOWN_YEARS.flatMap(year => holidays(year).map(({name, date, slug, type, isFlagDay}) => ({name, date, slug, type, isFlagDay: !!isFlagDay})));
