import { startProgramme, setProgrammeHall } from './schedule-view.js';
import { LANGUAGES, normalizeConfig, initialLanguage, embedSource } from './config-core.js';

const $ = id => document.getElementById(id);
let config, selected, waitTimer;
const query = new URLSearchParams(location.search);
const preferred = query.get('lang');
const language = $('language');
for (const item of LANGUAGES) {
  const option = document.createElement('option');
  option.value = item.code;
  option.textContent = `${item.name} · ${item.english}`;
  option.lang = item.code;
  language.append(option);
}
language.value = LANGUAGES.some(item => item.code === preferred) ? preferred : initialLanguage(navigator.languages);
const quickStart = {
  vi: 'Đeo tai nghe, chạm “Start listening”, rồi bật âm thanh trong khung bên dưới.',
  th: 'ใส่หูฟัง แตะ “Start listening” แล้วเปิดเสียงในแผงด้านล่าง',
  'zh-CN': '戴上耳机，点击“Start listening”，然后在下方的面板中开启音频。',
  ko: '이어폰을 연결하고 “Start listening”을 누른 다음, 아래 패널에서 음성을 켜세요.',
  ja: 'イヤホンを接続し、「Start listening」をタップしてから、下のパネルで音声をオンにしてください。',
};
function updateQuickStart() {
  $('native-help').textContent = quickStart[language.value];
  $('native-help').lang = language.value;
}
updateQuickStart();

function disconnect(message = '') {
  clearTimeout(waitTimer);
  // Remove the browsing context before making any new one; never hide old frames.
  $('frame-container').replaceChildren();
  $('leave').hidden = true;
  $('frame-help').hidden = true;
  $('join').textContent = 'Start listening ↗';
  $('session-message').textContent = message;
}

function directLink(anchor, hall) {
  anchor.href = hall.attendeeUrl;
  // Same-tab navigation avoids leaving an embedded session playing behind a new tab.
  anchor.addEventListener('click', () => disconnect('Interpretation closed here.'));
}

function selectHall(hall) {
  disconnect();
  selected = hall;
  for (const button of document.querySelectorAll('.hall-choice')) {
    const active = button.dataset.hall === hall.id;
    button.setAttribute('aria-pressed', String(active));
    button.closest('.hall-card').classList.toggle('selected', active);
    button.querySelector('.indicator').textContent = active ? '✓' : '→';
  }
  $('session').hidden = false;
  $('selected-hall').textContent = hall.name;
  setProgrammeHall(hall.id);
  const canEmbed = config.mode === 'embed' && !!hall.embedUrl;
  $('embed-controls').hidden = !canEmbed;
  $('session-fallback').hidden = !hall.attendeeUrl;
  $('session-fallback').href = hall.attendeeUrl || '#';
  $('session-fallback').setAttribute('aria-label', `Open listening page for ${hall.name}`);
  $('session-message').textContent = !hall.attendeeUrl
    ? 'This hall’s link is not available yet. Use the original interpretation QR code or ask the event team.'
    : canEmbed ? 'Ready when you are. Tap Start listening, then enable audio.'
      : 'Open the listening page to choose your language and listen.';
}

function join() {
  if (!selected?.embedUrl || config.mode !== 'embed' || !navigator.onLine) return;
  disconnect();
  const frame = document.createElement('iframe');
  frame.className = 'wordly-frame';
  frame.title = `Interpretation — ${selected.name}`;
  frame.referrerPolicy = 'no-referrer';
  // Delegates playback permission, but does not start playback or bypass user gestures.
  frame.allow = 'autoplay';
  frame.src = embedSource(selected, language.value);
  $('session-message').textContent = 'Opening your listening panel. Tap its audio control to listen.';
  $('frame-help').hidden = false;
  $('leave').hidden = false;
  $('join').textContent = 'Reload listening panel ↻';
  // Cross-origin load/error events cannot establish session health. Keep fallback visible.
  waitTimer = setTimeout(() => {
    $('session-message').textContent = 'If captions or audio have not appeared, try Open listening page below, or ask the event team for help.';
  }, 12000);
  frame.addEventListener('error', () => {
    clearTimeout(waitTimer);
    $('session-message').textContent = 'The panel could not open. Try the listening page link below.';
  });
  $('frame-container').append(frame);
  frame.scrollIntoView({ block: 'nearest', behavior: 'auto' });
}

function updateNetwork() {
  $('network-note').hidden = navigator.onLine;
  $('network-note').textContent = 'Your phone reports that it is offline. Reconnect to the internet, then tap Start listening again. Captions and audio need internet access.';
  $('join').disabled = !navigator.onLine;
  if (!navigator.onLine) disconnect('Disconnected while offline. Reconnect, then tap Start listening again.');
}

$('join').addEventListener('click', join);
$('leave').addEventListener('click', () => disconnect('You have left interpretation. Tap Start listening to return.'));
language.addEventListener('change', () => {
  disconnect('Language changed. Tap Start listening again, then enable audio.');
  updateQuickStart();
});
$('change-hall').addEventListener('click', () => {
  disconnect('Choose your next hall above.');
  $('hall-heading').scrollIntoView({ block: 'start' });
  $('hall-heading').focus({ preventScroll: true });
});
$('session-fallback').addEventListener('click', () => disconnect('Interpretation closed here.'));
window.addEventListener('offline', updateNetwork);
window.addEventListener('online', updateNetwork);
window.addEventListener('pagehide', () => disconnect());
window.addEventListener('pageshow', event => {
  if (event.persisted) disconnect('Welcome back. Tap Start listening again to resume interpretation.');
  updateNetwork();
});
updateNetwork();

try {
  const response = await fetch('./config.json', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Configuration unavailable');
  config = normalizeConfig(await response.json());
  $('hall-list').replaceChildren();
  for (const hall of config.halls) {
    const article = document.createElement('article');
    article.className = `hall-card hall-${hall.id}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hall-choice';
    button.dataset.hall = hall.id;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-controls', 'session');
    const name = document.createElement('span');
    name.textContent = hall.name;
    const indicator = document.createElement('span');
    indicator.className = 'indicator';
    indicator.textContent = '→';
    indicator.setAttribute('aria-hidden', 'true');
    const logo = document.createElement('img');
    logo.src = hall.id === 'a' ? './assets/barth-haas.jpg' : './assets/joe-white.png';
    logo.alt = '';
    logo.className = 'hall-logo';
    logo.width = 64;
    logo.height = 64;
    button.append(logo, name, indicator);
    button.addEventListener('click', () => {
      selectHall(hall);
      $('session').scrollIntoView({ block: 'start' });
      $('session-title').focus({ preventScroll: true });
    });
    article.append(button);
    const programme = document.createElement('div');
    programme.className = 'hall-programme';
    programme.dataset.scheduleHall = hall.id;
    programme.textContent = 'Checking the programme…';
    article.append(programme);
    if (hall.attendeeUrl) {
      const anchor = document.createElement('a');
      anchor.className = 'fallback';
      anchor.textContent = 'Open listening page ↗';
      anchor.setAttribute('aria-label', `Open listening page for ${hall.name}`);
      directLink(anchor, hall);
      article.append(anchor);
    } else {
      const text = document.createElement('p');
      text.className = 'unavailable';
      text.textContent = 'Link awaiting event team';
      article.append(text);
    }
    $('hall-list').append(article);
  }
  startProgramme(config.halls, hall => {
    selectHall(hall);
    $('session').scrollIntoView({ block: 'start' });
    ($('embed-controls').hidden ? $('session-fallback') : $('join')).focus({ preventScroll: true });
  });
  const requested = config.halls.find(hall => hall.id === query.get('hall'));
  if (requested) selectHall(requested); // QR deep links select only; never auto-join.
} catch {
  $('hall-list').textContent = 'Hall links are temporarily unavailable.';
  $('config-notice').hidden = false;
  $('config-notice').textContent = 'We could not load the hall links. Reload when connected, use the original interpretation QR code, or ask the event team.';
  $('programme-list').textContent = 'Please use the official programme link below.';
}
