import test from 'node:test';
import assert from 'node:assert/strict';
import {buildVacationPlan, findVacationOptions, vacationCalendar, vacationGoogleURL} from '../src/vacation-core.mjs';
import {calculateWorkdays} from '../src/workday-math.mjs';

const fixedNow = new Date('2026-11-13T12:00:00Z');
const unfold = text => text.replace(/\r\n[ \t]/g, '');
const events = text => [...unfold(text).matchAll(/BEGIN:VEVENT\r\n([\s\S]*?)END:VEVENT/g)].map(match => match[1]);
const property = (event, name) => event.split('\r\n').find(line => line.startsWith(name + ':'))?.slice(name.length + 1);
const dateKey = value => value.replaceAll('-', '');
const nextDate = value => new Date(Date.parse(value + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10);

test('vacation dates reuse the Finnish workday classification, including Easter and personal workweeks', () => {
  for (const settings of [
    {start:'2028-04-12', end:'2028-04-19'},
    {start:'2028-04-12', end:'2028-04-19', weekdays:[1, 3, 5]},
    {start:'2027-06-24', end:'2027-06-28', eves:true},
    {start:'2027-12-23', end:'2027-12-27', weekdays:[0, 1, 2, 3, 4, 5, 6]},
  ]) {
    const plan = buildVacationPlan(settings);
    const work = calculateWorkdays(settings);
    assert.deepEqual(plan.leaveDates, work.days.filter(day => day.reason === 'work').map(day => day.date));
    assert.deepEqual(plan.days.map(day => [day.date, day.reason]), work.days.map(day => [day.date, day.reason]));
    assert.equal(plan.leaveDays, work.workDays);
    assert.equal(plan.calendarDays, work.calendarDays);
    assert.equal(plan.freeDays + plan.leaveDays, plan.calendarDays);
  }
  const easter = buildVacationPlan({start:'2028-04-13', end:'2028-04-18'});
  assert.deepEqual(easter.leaveDates, ['2028-04-13', '2028-04-18']);
  assert.equal(easter.days.find(day => day.date === '2028-04-14').reason, 'publicHolidays');
  assert.equal(easter.days.find(day => day.date === '2028-04-17').reason, 'publicHolidays');
});

test('eves are a separate opt-in and new year eve stays an ordinary selected weekday', () => {
  const midsummer = {start:'2027-06-25', end:'2027-06-28'};
  assert.deepEqual(buildVacationPlan(midsummer).leaveDates, ['2027-06-25', '2027-06-28']);
  assert.deepEqual(buildVacationPlan({...midsummer, eves:true}).leaveDates, ['2027-06-28']);
  const christmas = {start:'2027-12-24', end:'2027-12-27'};
  assert.equal(buildVacationPlan(christmas).leaveDays, 2);
  assert.equal(buildVacationPlan({...christmas, eves:true}).leaveDays, 1);
  assert.deepEqual(buildVacationPlan({start:'2027-12-31', end:'2028-01-03', eves:true}).leaveDates, ['2027-12-31', '2028-01-03']);
});

test('calendar days are inclusive across both DST transitions, leap day and new year', () => {
  const spring = buildVacationPlan({start:'2027-03-27', end:'2027-03-31'});
  assert.equal(spring.calendarDays, 5);
  assert.deepEqual(spring.leaveDates, ['2027-03-30', '2027-03-31']);
  const autumn = buildVacationPlan({start:'2027-10-30', end:'2027-11-01'});
  assert.equal(autumn.calendarDays, 3);
  assert.deepEqual(autumn.leaveDates, ['2027-11-01']);
  const leap = buildVacationPlan({start:'2028-02-28', end:'2028-03-01'});
  assert.equal(leap.calendarDays, 3);
  assert.deepEqual(leap.leaveDates, ['2028-02-28', '2028-02-29', '2028-03-01']);
  const year = buildVacationPlan({start:'2027-12-30', end:'2028-01-03'});
  assert.equal(year.calendarDays, 5);
  assert.deepEqual(year.leaveDates, ['2027-12-30', '2027-12-31', '2028-01-03']);
});

test('suggestions stay within the requested date window, length and leave budget', () => {
  const settings = {start:'2027-06-01', end:'2027-07-10', budget:2, minLength:3, maxLength:7, weekdays:[1, 3, 5], eves:true, limit:6};
  const options = findVacationOptions(settings);
  assert.ok(options.length > 0);
  assert.ok(options.length <= settings.limit);
  assert.equal(new Set(options.map(plan => plan.start + '/' + plan.end)).size, options.length);
  for (const plan of options) {
    assert.ok(plan.start >= settings.start && plan.end <= settings.end);
    assert.ok(plan.calendarDays >= settings.minLength && plan.calendarDays <= settings.maxLength);
    assert.ok(plan.leaveDays <= settings.budget);
    const expected = buildVacationPlan({...settings, start:plan.start, end:plan.end});
    assert.deepEqual(plan.leaveDates, expected.leaveDates);
  }
  const freeOnly = findVacationOptions({start:'2027-06-24', end:'2027-06-28', budget:0, minLength:3, maxLength:4, eves:true});
  assert.ok(freeOnly.some(plan => plan.start === '2027-06-25' && plan.end === '2027-06-27' && plan.leaveDays === 0));
});

test('school restrictions keep each suggestion inside one published period', () => {
  const allowedPeriods = [{start:'2027-02-22', end:'2027-02-28'}, {start:'2027-04-02', end:'2027-04-05'}];
  const options = findVacationOptions({start:'2027-01-01', end:'2027-06-30', budget:2, minLength:3, maxLength:10, allowedPeriods});
  assert.ok(options.length > 0);
  for (const plan of options) assert.ok(allowedPeriods.some(period => plan.start >= period.start && plan.end <= period.end));
  assert.throws(() => findVacationOptions({start:'2027-01-01', end:'2027-06-30', allowedPeriods:[{start:'2027-02-28', end:'2027-02-22'}]}));
});

test('leave export writes actual individual leave dates with exclusive next-day ends', () => {
  const plan = buildVacationPlan({start:'2028-04-13', end:'2028-04-18'});
  const raw = vacationCalendar(plan, {title:'Kevään vapaa', mode:'leave', reminder:'none'}, fixedNow);
  const items = events(raw);
  assert.equal(items.length, 2);
  assert.deepEqual(items.map(item => property(item, 'DTSTART;VALUE=DATE')), plan.leaveDates.map(dateKey));
  assert.deepEqual(items.map(item => property(item, 'DTEND;VALUE=DATE')), plan.leaveDates.map(date => dateKey(nextDate(date))));
  assert.equal(new Set(items.map(item => property(item, 'UID'))).size, items.length);
  assert.ok(raw.endsWith('END:VCALENDAR\r\n'));
  assert.ok(!unfold(raw).includes('BEGIN:VALARM'));
  assert.ok(!unfold(raw).includes('RRULE:'));
});

test('span export and Google prefill use the inclusive chosen span, not the leave-day subset', () => {
  const plan = buildVacationPlan({start:'2027-12-24', end:'2028-01-03', eves:true});
  const items = events(vacationCalendar(plan, {title:'Joulun vapaa', mode:'span', reminder:'none'}, fixedNow));
  assert.equal(items.length, 1);
  assert.equal(property(items[0], 'DTSTART;VALUE=DATE'), '20271224');
  assert.equal(property(items[0], 'DTEND;VALUE=DATE'), '20280104');
  for (const mode of ['span', 'leave']) {
    const url = new URL(vacationGoogleURL(plan, {title:'Joulun vapaa', mode}));
    assert.equal(url.hostname, 'calendar.google.com');
    assert.equal(url.searchParams.get('action'), 'TEMPLATE');
    assert.equal(url.searchParams.get('text'), 'Joulun vapaa');
    assert.equal(url.searchParams.get('dates'), '20271224/20280104');
    for (const name of ['add', 'attendees', 'guests', 'emails']) assert.equal(url.searchParams.has(name), false);
  }
});

test('optional reminders retain 09:00 Finnish civil time over DST', () => {
  for (const [start, end, expected] of [
    ['2027-03-30', '2027-03-30', '20270329T060000Z'],
    ['2027-11-01', '2027-11-01', '20271031T070000Z'],
    ['2028-02-29', '2028-02-29', '20280228T070000Z'],
  ]) {
    const plan = buildVacationPlan({start, end});
    const ics = unfold(vacationCalendar(plan, {reminder:'1'}, fixedNow));
    assert.ok(ics.includes('TRIGGER;VALUE=DATE-TIME:' + expected + '\r\n'));
    assert.equal((ics.match(/BEGIN:VALARM/g) || []).length, plan.leaveDays);
  }
});

test('calendar text escapes injection and folds Unicode lines by octet length', () => {
  const title = 'Äiti, kesä; ' + 'ääkkösiä '.repeat(20) + '\r\nATTENDEE:mailto:someone@example.com';
  const plan = buildVacationPlan({start:'2028-02-29', end:'2028-02-29'});
  const raw = vacationCalendar(plan, {title, reminder:'none'}, fixedNow);
  const ics = unfold(raw);
  assert.equal(events(raw).length, 1);
  assert.ok(ics.includes('SUMMARY:Äiti\\, kesä\\; '));
  assert.ok(ics.includes('\\nATTENDEE:mailto:someone@example.com'));
  assert.ok(!ics.includes('\r\nATTENDEE:'));
  assert.ok(!ics.includes('\r\nORGANIZER:'));
  for (const line of raw.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75, line);
});

test('invalid dates, reversed windows and invalid workweek settings are rejected', () => {
  for (const settings of [
    {start:'2027-02-29', end:'2027-03-01'},
    {start:'bad', end:'2027-03-01'},
    {start:'2027-05-02', end:'2027-05-01'},
    {start:'2025-12-31', end:'2026-01-01'},
    {start:'2030-12-31', end:'2031-01-01'},
    {start:'2027-05-01', end:'2027-05-03', weekdays:[]},
    {start:'2027-05-01', end:'2027-05-03', weekdays:[7]},
    {start:'2027-05-01', end:'2027-05-03', weekdays:[1.5]},
  ]) assert.throws(() => buildVacationPlan(settings));
  const settings = {start:'2027-05-01', end:'2027-06-01'};
  assert.throws(() => findVacationOptions({...settings, budget:-1}));
  assert.throws(() => findVacationOptions({...settings, minLength:8, maxLength:3}));
});
