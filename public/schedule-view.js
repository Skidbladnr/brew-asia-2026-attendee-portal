import { normalizeSchedule, hallSchedule, eventDay, eventTime, defaultDay, dayLabel } from './schedule-core.js';
const $ = id => document.getElementById(id);
let schedule, halls = [], chosenHall, choose, selectedDay = defaultDay(), agendaSignature = '';
function text(tag, content, className = '') {
  const element = document.createElement(tag);
  element.textContent = content;
  element.className = className;
  return element;
}
function timeRange(item, now, includeDay = false) {
  const date = item.start.slice(0, 10);
  return `${includeDay || date !== eventDay(now) ? dayLabel(date) + ' · ' : ''}${eventTime(item.start)}–${eventTime(item.end)}`;
}
function summary(hall, now) {
  const { current, next, shared, ended } = hallSchedule(schedule, hall, now);
  const group = document.createElement('div');
  if (current) {
    group.append(text('p', `Scheduled now · ${timeRange(current, now)}`, 'schedule-label'));
    group.append(text('p', current.title, 'schedule-title'));
    if (current.speaker) group.append(text('p', current.speaker, 'schedule-speaker'));
    if (next) group.append(text('p', `Next · ${timeRange(next, now)} · ${next.title}`, 'schedule-next'));
    else group.append(text('p', 'Last scheduled session in this hall.', 'schedule-next'));
  } else {
    group.append(text('p', shared ? `${shared.title}${shared.location ? ' · ' + shared.location : ''}` : ended ? 'Hall programme complete' : 'No hall session scheduled now', 'schedule-label quiet'));
    if (next) {
      group.append(text('p', `Next · ${timeRange(next, now)}`, 'schedule-next-time'));
      group.append(text('p', next.title, 'schedule-title'));
      if (next.speaker) group.append(text('p', next.speaker, 'schedule-speaker'));
    } else group.append(text('p', 'See the full programme for shared activities.', 'schedule-speaker'));
  }
  return group;
}
function replaceIfChanged(target, content) {
  if (target.textContent !== content.textContent) target.replaceChildren(content);
}
function renderAgenda(now) {
  const filter = $('programme-hall').value;
  // Only rebuild at an entry boundary or when filters change; preserve keyboard focus.
  const active = schedule.sessions.filter(s => Date.parse(s.start) <= +now && +now < Date.parse(s.end)).map(s => s.id).join(',');
  const signature = `${selectedDay}/${filter}/${active}`;
  if (agendaSignature === signature) return;
  if ($('programme-list').contains(document.activeElement)) return;
  agendaSignature = signature;
  const list = document.createElement('ol');
  list.className = 'agenda-list';
  const entries = schedule.sessions.filter(s => s.start.startsWith(selectedDay) && (filter === 'all' || s.hall === filter || s.hall === null));
  for (const item of entries) {
    const row = document.createElement('li');
    row.className = item.hall === null ? 'agenda-entry shared-entry' : `agenda-entry hall-${item.hall}`;
    const isCurrent = Date.parse(item.start) <= +now && +now < Date.parse(item.end);
    if (isCurrent) row.classList.add('scheduled-current');
    row.append(text('p', `${eventTime(item.start)}–${eventTime(item.end)}${isCurrent ? ' · Scheduled now' : ''}`, 'agenda-time'));
    const location = item.hall === null ? item.location || 'Shared programme' : halls.find(h => h.id === item.hall).name;
    row.append(text('p', `${location}${item.kind ? ' · ' + item.kind : ''}`, 'agenda-location'));
    row.append(text('h3', item.title));
    if (item.speaker) row.append(text('p', item.speaker, 'schedule-speaker'));
    if (item.note) row.append(text('p', item.note, 'agenda-note'));
    if (item.hall !== null) {
      const button = text('button', 'Choose this hall →', 'agenda-choose');
      button.type = 'button';
      button.setAttribute('aria-label', `Choose ${location} for ${item.title}`);
      button.addEventListener('click', () => choose(halls.find(h => h.id === item.hall)));
      row.append(button);
    }
    list.append(row);
  }
  $('programme-list').replaceChildren(list);
}
function refresh() {
  const now = new Date();
  $('programme-clock').textContent = `${dayLabel(eventDay(now))} · ${eventTime(now)} in Ho Chi Minh City`;
  if (!schedule) return;
  for (const hall of halls) {
    const target = document.querySelector(`[data-schedule-hall="${hall.id}"]`);
    if (target) replaceIfChanged(target, summary(hall.id, now));
  }
  if (chosenHall) replaceIfChanged($('selected-programme'), summary(chosenHall, now));
  renderAgenda(now);
}
export function setProgrammeHall(id) { chosenHall = id; refresh(); }
export async function startProgramme(configuredHalls, onChoose) {
  halls = configuredHalls;
  choose = onChoose;
  for (const hall of halls) {
    const option = text('option', hall.name);
    option.value = hall.id;
    $('programme-hall').append(option);
  }
  for (const button of document.querySelectorAll('[data-day]')) {
    button.setAttribute('aria-pressed', String(button.dataset.day === selectedDay));
    button.addEventListener('click', () => {
      selectedDay = button.dataset.day;
      document.querySelectorAll('[data-day]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      refresh();
    });
  }
  $('programme-hall').addEventListener('change', refresh);
  refresh();
  try {
    const response = await fetch('./schedule.json', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Programme unavailable');
    schedule = normalizeSchedule(await response.json());
    refresh();
    setInterval(refresh, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    window.addEventListener('pageshow', refresh);
  } catch {
    document.querySelectorAll('[data-schedule-hall]').forEach(node => { node.textContent = 'Programme unavailable. You can still choose this hall to listen.'; });
    $('programme-list').replaceChildren(text('p', 'The timetable could not load. Check the official programme below or ask the event team.', 'notice'));
  }
}
