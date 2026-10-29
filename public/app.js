import { startProgramme, setProgrammeHall } from './schedule-view.js';
import { LANGUAGES, normalizeConfig, initialLanguage, embedSource } from './config-core.js?v=20261029-languages';

const $ = id => document.getElementById(id);
let config, selected;
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
const otherLanguage = document.createElement('option');
otherLanguage.value = 'other';
otherLanguage.textContent = 'Other languages…';
language.append(otherLanguage);
language.value = preferred === 'other' || LANGUAGES.some(item => item.code === preferred) ? preferred : initialLanguage(navigator.languages);
const quickStart = {
  vi: 'Đeo tai nghe, chạm “Start listening”, rồi bật âm thanh trong khung bên dưới.',
  th: 'ใส่หูฟัง แตะ “Start listening” แล้วเปิดเสียงในแผงด้านล่าง',
  'zh-CN': '戴上耳机，点击“Start listening”，然后在下方的面板中开启音频。',
  ko: '이어폰을 연결하고 “Start listening”을 누른 다음, 아래 패널에서 음성을 켜세요.',
  ja: 'イヤホンを接続し、「Start listening」をタップしてから、下のパネルで音声をオンにしてください。',
  other: 'Tap “Start listening”, then choose your language from the menu at the bottom of the captions panel.',
};
function updateQuickStart() {
  $('native-help').textContent = quickStart[language.value];
  $('native-help').lang = language.value === 'other' ? 'en' : language.value;
}
updateQuickStart();

function disconnect(message = '') {
  // Remove the browsing context before making any new one; never hide old frames.
  $('frame-container').replaceChildren();
  $('leave').hidden = true;
  document.body.classList.remove('is-listening');
  $('audio-hint').hidden = true;
  $('session-help').open = false;
  $('session-message').textContent = message;
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
  document.body.classList.add('has-hall');
  document.querySelector('.intro').hidden = true;
  document.querySelector('.audio-note').hidden = true;
  document.querySelector('.chooser').hidden = true;
  $('general-help').hidden = true;
  $('programme').open = false;
  $('selected-programme').dataset.hall = hall.id;
  $('session-title').textContent = hall.name;
  setProgrammeHall(hall.id);
  const canEmbed = config.mode === 'embed' && !!hall.embedUrl;
  $('embed-controls').hidden = !canEmbed;
  $('session-fallback').hidden = !hall.attendeeUrl;
  $('session-fallback').href = hall.attendeeUrl || '#';
  $('session-fallback').setAttribute('aria-label', `Try the direct connection for ${hall.name}`);
  $('direct-start').href = hall.attendeeUrl || '#';
  $('direct-start').hidden = canEmbed || !hall.attendeeUrl;
  $('reload').hidden = !canEmbed;
  $('session-help').hidden = !hall.attendeeUrl;
  $('session-message').textContent = !hall.attendeeUrl
    ? 'This hall’s link is not available yet. Use the original interpretation QR code or ask the event team.'
    : canEmbed ? ''
      : 'Choose your language and enable audio on the next page.';
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
  document.body.classList.add('is-listening');
  $('audio-hint').textContent = language.value === 'other'
    ? 'Choose your language at the bottom of the panel. Use headphones and tap the audio control to listen.'
    : 'Use headphones. Tap the audio control below to listen.';
  $('audio-hint').hidden = false;
  $('leave').hidden = false;
  // Cross-origin content cannot report caption/audio health to the portal.
  // Do not display a timeout warning while a working session may be playing.
  frame.addEventListener('error', () => {
    $('session-message').textContent = 'The captions panel could not open. Try the direct connection in Help.';
    $('session-help').open = true;
  });
  $('frame-container').append(frame);
  $('session-title').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function updateNetwork() {
  $('network-note').hidden = navigator.onLine;
  $('network-note').textContent = 'Your phone reports that it is offline. Reconnect to the internet, then tap Start listening again. Captions and audio need internet access.';
  $('join').disabled = !navigator.onLine;
  if (!navigator.onLine) disconnect('Disconnected while offline. Reconnect, then tap Start listening again.');
}

$('join').addEventListener('click', join);
$('reload').addEventListener('click', join);
$('leave').addEventListener('click', () => {
  disconnect();
  $('join').focus();
});
language.addEventListener('change', () => {
  disconnect();
  updateQuickStart();
});
$('change-hall').addEventListener('click', () => {
  disconnect();
  selected = undefined;
  $('session').hidden = true;
  document.body.classList.remove('has-hall');
  for (const selector of ['.intro', '.audio-note', '.chooser', '#general-help']) document.querySelector(selector).hidden = false;
  document.querySelectorAll('.hall-choice').forEach(button => {
    button.setAttribute('aria-pressed', 'false');
    button.closest('.hall-card').classList.remove('selected');
    button.querySelector('.indicator').textContent = '→';
  });
  $('hall-heading').scrollIntoView({ block: 'start' });
  $('hall-heading').focus({ preventScroll: true });
});
for (const id of ['session-fallback', 'direct-start']) {
  $(id).addEventListener('click', () => disconnect());
}
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
    if (!hall.attendeeUrl) {
      const text = document.createElement('p');
      text.className = 'unavailable';
      text.textContent = 'Link awaiting event team';
      article.append(text);
    }
    // Entrance order: Joe White on the left, Barth Haas on the right.
    if (hall.id === 'b') $('hall-list').prepend(article);
    else $('hall-list').append(article);
  }
  startProgramme(config.halls, hall => {
    selectHall(hall);
    $('session').scrollIntoView({ block: 'start' });
    ($('embed-controls').hidden ? $('direct-start') : $('join')).focus({ preventScroll: true });
  });
  const requested = config.halls.find(hall => hall.id === query.get('hall'));
  if (requested) selectHall(requested); // QR deep links select only; never auto-join.
} catch {
  $('hall-list').textContent = 'Hall links are temporarily unavailable.';
  $('config-notice').hidden = false;
  $('config-notice').textContent = 'We could not load the hall links. Reload when connected, use the original interpretation QR code, or ask the event team.';
  $('programme-list').textContent = 'Please use the official programme link below.';
}
