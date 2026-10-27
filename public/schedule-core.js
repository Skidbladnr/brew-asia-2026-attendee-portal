export const EVENT_ZONE = 'Asia/Ho_Chi_Minh';
export const EVENT_DAYS = ['2026-10-28', '2026-10-29'];
export const PROGRAMME_URL = 'https://www.brew-asia.com/conference';
const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: EVENT_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFormat = new Intl.DateTimeFormat('en-GB', { timeZone: EVENT_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
export function eventDay(now = new Date()) {
  const parts = Object.fromEntries(dayFormat.formatToParts(now).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export const eventTime = date => timeFormat.format(new Date(date));
export const dayLabel = date => new Intl.DateTimeFormat('en-GB', { timeZone: EVENT_ZONE, day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00+07:00`));
export function defaultDay(now = new Date()) {
  const day = eventDay(now);
  return day <= EVENT_DAYS[0] ? EVENT_DAYS[0] : EVENT_DAYS[1];
}
export function normalizeSchedule(raw) {
  if (!raw || raw.timezone !== EVENT_ZONE || !Array.isArray(raw.sessions) || !raw.sessions.length)
    throw new Error('Invalid programme');
  const ids = new Set();
  const sessions = raw.sessions.map(item => {
    if (!item.id || ids.has(item.id) || !['a', 'b', null].includes(item.hall) || typeof item.title !== 'string' || !item.title.trim())
      throw new Error('Invalid programme entry');
    ids.add(item.id);
    for (const field of ['start', 'end']) {
      if (!/^2026-10-(28|29)T\d{2}:\d{2}:00\+07:00$/.test(item[field]) || !Number.isFinite(Date.parse(item[field])))
        throw new Error('Programme needs explicit Vietnam timestamps');
    }
    if (Date.parse(item.end) <= Date.parse(item.start) || item.start.slice(0, 10) !== item.end.slice(0, 10))
      throw new Error('Invalid programme duration');
    return { ...item };
  }).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  for (const hall of ['a', 'b']) {
    const entries = sessions.filter(s => s.hall === hall);
    for (let i = 1; i < entries.length; i++) {
      if (Date.parse(entries[i].start) < Date.parse(entries[i - 1].end)) throw new Error('Overlapping hall sessions');
    }
  }
  return { ...raw, sessions };
}
export function hallSchedule(schedule, hall, now = new Date()) {
  const at = Number(now);
  const entries = schedule.sessions.filter(item => item.hall === hall);
  const current = entries.find(item => Date.parse(item.start) <= at && at < Date.parse(item.end)) || null;
  const next = entries.find(item => Date.parse(item.start) > at) || null;
  const shared = schedule.sessions.find(item => item.hall === null && Date.parse(item.start) <= at && at < Date.parse(item.end)) || null;
  return { current, next, shared, ended: !current && !next };
}
