import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeConfig, embedSource, initialLanguage, LANGUAGES } from '../public/config-core.js';
const fixture = () => ({ mode: 'embed', halls: [
  { id: 'a', name: 'Test A', attendeeUrl: 'https://attend.wordly.ai/join/TEST-1000', embedUrl: 'https://attend.wordly.ai/frame/TEST-1000' },
  { id: 'b', name: 'Test B', attendeeUrl: 'https://attend.wordly.ai/join/TEST-2000', embedUrl: 'https://attend.wordly.ai/frame/TEST-2000' },
] });
test('supplied live pairs are valid and isolated; no network is used', async () => {
  const raw = JSON.parse(await readFile(new URL('../public/config.json', import.meta.url)));
  const config = normalizeConfig(raw);
  assert.equal(config.halls[0].session, 'UAFJ-4373');
  assert.equal(config.halls[1].session, 'XVCS-9354');
  assert.ok(config.halls.every(hall => !hall.issues.length));
});
test('each of five languages produces documented parameters and preserves passcode', () => {
  const hall = fixture().halls[0];
  hall.embedUrl += '?key=test%2Bcode&hide=vi&show=en&enableTTS=false';
  for (const { code } of LANGUAGES) {
    const url = new URL(embedSource(hall, code));
    assert.equal(url.searchParams.get('lang'), code);
    assert.equal(url.searchParams.get('show'), 'vi,th,zh-CN,ko,ja');
    assert.equal(url.searchParams.get('enableTTS'), 'true');
    assert.equal(url.searchParams.get('key'), 'test+code');
    assert.equal(url.searchParams.get('fgsize'), '22px');
    assert.equal(url.searchParams.get('hide'), null);
  }
  assert.throws(() => embedSource(hall, 'bad'));
});
test('reject presenter, lookalike origin, credentials, HTTP, unsafe paths and unknown embed arguments', () => {
  for (const url of ['https://present.wordly.ai/frame/TEST-1000', 'https://attend.wordly.ai.evil.test/frame/TEST-1000', 'http://attend.wordly.ai/frame/TEST-1000', 'https://user:secret@attend.wordly.ai/frame/TEST-1000', 'https://attend.wordly.ai/present/TEST-1000', 'javascript:alert(1)', 'https://attend.wordly.ai/frame/TEST-1000?undocumented=1']) {
    const raw = fixture(); raw.halls[0].embedUrl = url;
    const hall = normalizeConfig(raw).halls[0];
    assert.equal(hall.embedUrl, '');
    assert.ok(hall.attendeeUrl);
    assert.ok(hall.issues.length);
  }
});
test('mismatched iframe safely downgrades to direct attendee link', () => {
  const raw = fixture(); raw.halls[0].embedUrl = raw.halls[1].embedUrl;
  assert.equal(normalizeConfig(raw).halls[0].embedUrl, '');
});
test('duplicate halls fail closed instead of routing both rooms into one feed', () => {
  const raw = fixture(); Object.assign(raw.halls[1], { attendeeUrl: raw.halls[0].attendeeUrl, embedUrl: raw.halls[0].embedUrl });
  assert.throws(() => normalizeConfig(raw), /different Wordly sessions/);
});
test('blank samples cannot initiate any session', async () => {
  const raw = JSON.parse(await readFile(new URL('../config.example.json', import.meta.url)));
  assert.ok(normalizeConfig(raw).halls.every(h => !h.attendeeUrl && !h.embedUrl));
});
test('links mode, native language matching and explicit defaults', () => {
  const raw = fixture(); raw.mode = 'links';
  assert.equal(normalizeConfig(raw).mode, 'links');
  assert.equal(initialLanguage(['en-US', 'ja-JP']), 'ja');
  assert.equal(initialLanguage(['zh-TW']), 'zh-CN');
  assert.equal(initialLanguage([]), 'vi');
  assert.throws(() => normalizeConfig({ ...raw, mode: 'unknown' }));
});
