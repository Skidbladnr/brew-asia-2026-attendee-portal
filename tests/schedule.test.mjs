import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeSchedule, hallSchedule, eventDay, eventTime, defaultDay } from '../public/schedule-core.js';
const raw = JSON.parse(await readFile(new URL('../public/schedule.json', import.meta.url)));
const schedule = normalizeSchedule(raw);
const at = time => new Date(time);

test('published timetable has 24 hall entries and 10 shared activities, no overlaps', () => {
  assert.equal(schedule.sessions.filter(s => s.hall !== null).length, 24);
  assert.equal(schedule.sessions.filter(s => s.hall === null).length, 10);
  assert.equal(schedule.sessions.filter(s => s.hall === 'a').length, 9);
});
test('opening and keynote belong to Joe White; Barth Haas begins at 11:00', () => {
  const now = at('2026-10-28T09:50:00+07:00');
  assert.equal(hallSchedule(schedule, 'b', now).current.id, 'd1-keynote');
  assert.equal(hallSchedule(schedule, 'a', now).current, null);
  assert.equal(hallSchedule(schedule, 'a', now).next.start, '2026-10-28T11:00:00+07:00');
});
test('start inclusive, end exclusive; gaps never claim a session is playing', () => {
  assert.equal(hallSchedule(schedule, 'a', at('2026-10-28T11:00:00+07:00')).current.id, 'd1-a1');
  assert.equal(hallSchedule(schedule, 'a', at('2026-10-28T11:45:00+07:00')).current, null);
  assert.equal(hallSchedule(schedule, 'a', at('2026-10-28T11:45:00+07:00')).next.id, 'd1-a2');
});
test('shared lunch, innovation zone and awards never inherit a hall feed', () => {
  assert.equal(hallSchedule(schedule, 'a', at('2026-10-28T13:00:00+07:00')).shared.id, 'd1-lunch');
  const innovation = hallSchedule(schedule, 'b', at('2026-10-28T14:50:00+07:00'));
  assert.equal(innovation.current, null);
  assert.equal(innovation.shared.id, 'd1-innovation');
  assert.equal(hallSchedule(schedule, 'a', at('2026-10-28T14:50:00+07:00')).current.id, 'd1-a4');
  const awards = hallSchedule(schedule, 'b', at('2026-10-29T16:30:00+07:00'));
  assert.equal(awards.current, null);
  assert.equal(awards.shared.id, 'd2-awards');
});
test('next day and finished conference behave honestly', () => {
  assert.equal(hallSchedule(schedule, 'b', at('2026-10-28T18:00:00+07:00')).next.id, 'd2-opening');
  const finished = hallSchedule(schedule, 'a', at('2026-10-30T00:00:00+07:00'));
  assert.equal(finished.ended, true);
  assert.equal(finished.current, null);
  assert.equal(finished.next, null);
});
test('Vietnam time and date are independent of execution timezone', () => {
  assert.equal(eventDay(at('2026-10-28T18:00:00Z')), '2026-10-29');
  assert.equal(eventTime('2026-10-28T04:00:00Z'), '11:00');
  assert.equal(defaultDay(at('2026-10-27T12:00:00Z')), '2026-10-28');
  assert.equal(defaultDay(at('2026-10-29T04:00:00Z')), '2026-10-29');
});
test('invalid timestamps, duplicate IDs and overlapping slots reject a release', () => {
  const edit = callback => { const input = structuredClone(raw); callback(input); return input; };
  assert.throws(() => normalizeSchedule(edit(d => { d.sessions[0].start = '2026-10-28T09:00:00'; })));
  assert.throws(() => normalizeSchedule(edit(d => { d.sessions[1].id = d.sessions[0].id; })));
  assert.throws(() => normalizeSchedule(edit(d => { d.sessions.find(s => s.id === 'd1-keynote').start = '2026-10-28T09:40:00+07:00'; })));
});
