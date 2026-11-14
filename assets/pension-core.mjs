import {PAYMENT_PLANS} from './payment-data.mjs';
import {createPaymentCore} from './payment-calendar-core.mjs';
export {REMINDERS} from './calendar-event-core.mjs';
export const PENSION_PLANS=PAYMENT_PLANS.filter(p=>p.kind==='pension');
export const {paymentDates,pensionReport,paymentPath,pensionICS,paymentCSV,paymentGoogleURL,localPaymentEvents}=createPaymentCore(PENSION_PLANS);
