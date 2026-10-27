import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
const config = JSON.parse(await readFile(new URL('../../public/config.json', import.meta.url)));
const frameMock = '<!doctype html><html lang="en"><meta charset="utf-8"><title>Simulated attendee frame</title><body><p>TEST ONLY — simulated Wordly response.</p><button>Enable audio (simulation)</button></body></html>';
test.beforeEach(async ({ page }) => {
  // Never contact real event sessions during automated tests.
  await page.route('https://attend.wordly.ai/**', route => route.fulfill({ contentType: 'text/html', body: frameMock }));
});
const hall = (page, index = 0) => page.locator(`[data-hall="${config.halls[index].id}"]`);

test('landing has two hall choices without duplicate exit links or external requests', async ({ page }) => {
  let requests = 0;
  page.on('request', r => { if (r.url().startsWith('https://attend.wordly.ai')) requests++; });
  await page.goto('/');
  await expect(hall(page)).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.hall-card a')).toHaveCount(0);
  await expect(hall(page, 1)).toBeVisible();
  expect(requests).toBe(0);
});

test('switching halls removes old context; rejoin uses only new session and language', async ({ page }) => {
  await page.goto('/');
  await hall(page).click();
  await page.locator('#language').selectOption('ja');
  await page.locator('#join').click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('iframe')).toHaveAttribute('src', /UAFJ-4373\?.*lang=ja/);
  await page.evaluate(() => {
    window.maxFrames = document.querySelectorAll('iframe').length;
    window.frameObserver = new MutationObserver(() => window.maxFrames = Math.max(window.maxFrames, document.querySelectorAll('iframe').length));
    window.frameObserver.observe(document.body, { childList: true, subtree: true });
  });
  await page.locator('#change-hall').click();
  await expect(page.locator('#session')).toBeHidden();
  await hall(page, 1).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.locator('#join').click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /XVCS-9354\?.*lang=ja/);
  await page.locator('#session-help summary').click();
  await page.locator('#reload').click();
  await expect(page.locator('iframe')).toHaveCount(1);
  expect(await page.evaluate(() => window.maxFrames)).toBe(1);
  await page.locator('#session-help summary').click();
  await page.locator('#leave').click();
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('all five choices, changing language disconnects, no automatic playback', async ({ page }) => {
  await page.goto('/?hall=a');
  for (const code of ['vi', 'th', 'zh-CN', 'ko', 'ja']) {
    await page.locator('#language').selectOption(code);
    await expect(page.locator('#native-help')).toHaveAttribute('lang', code);
    await expect(page.locator('#native-help')).toContainText('Start listening');
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.locator('#join').click();
    await expect(page.locator('iframe')).toHaveAttribute('src', new RegExp(`lang=${code}`));
    await expect(page.locator('iframe')).toHaveAttribute('allow', 'autoplay');
    await expect(page.locator('#embed-controls')).toBeHidden();
    await page.locator('#session-help summary').click();
    await page.locator('#leave').click();
  }
});

test('network loss disconnects and return requires a new gesture', async ({ page, context }) => {
  await page.goto('/?hall=a');
  await page.locator('#join').click();
  await context.setOffline(true);
  await expect(page.locator('#network-note')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('#join')).toBeDisabled();
  await context.setOffline(false);
  await expect(page.locator('#join')).toBeEnabled();
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('link-only switch never creates frames and direct links stay intact', async ({ page }) => {
  await page.route('**/config.json', route => route.fulfill({ json: { ...config, mode: 'links' } }));
  await page.goto('/');
  await hall(page).click();
  await expect(page.locator('#embed-controls')).toBeHidden();
  await expect(page.locator('#direct-start')).toBeVisible();
  await expect(page.locator('#direct-start')).toHaveAttribute('href', config.halls[0].attendeeUrl);
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('failed or malformed configuration fails visibly without sessions', async ({ page }) => {
  await page.route('**/config.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/');
  await expect(page.locator('#config-notice')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.route('**/config.json', route => route.fulfill({ body: 'not json' }));
  await page.reload();
  await expect(page.locator('#config-notice')).toBeVisible();
});

test('blank configuration displays honest missing-link guidance', async ({ page }) => {
  await page.route('**/config.json', route => route.fulfill({ json: { ...config, halls: config.halls.map(h => ({ ...h, attendeeUrl: '', embedUrl: '' })) } }));
  await page.goto('/');
  await hall(page).click();
  await expect(page.locator('#session-message')).toContainText('not available yet');
  await expect(page.locator('#session-fallback')).toBeHidden();
  await expect(page.locator('#embed-controls')).toBeHidden();
});

test('blocked iframe offers Help recovery without inventing session health', async ({ page }) => {
  await page.route('https://attend.wordly.ai/**', route => route.abort('blockedbyclient'));
  await page.clock.install();
  await page.goto('/?hall=a');
  await page.locator('#join').click();
  await page.clock.fastForward(13000);
  await expect(page.locator('#session-message')).not.toContainText('Live');
  await page.locator('#session-help').evaluate(el => el.open = true);
  await expect(page.locator('#session-fallback')).toBeVisible();
  await expect(page.locator('#session-fallback')).toHaveAttribute('href', config.halls[0].attendeeUrl);
});

test('QR parameters only select known hall/language; never accept a URL override', async ({ page }) => {
  await page.goto('/?hall=b&lang=ko&url=https://evil.test');
  await expect(hall(page, 1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#language')).toHaveValue('ko');
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.goto('/?hall=unknown&lang=unknown');
  await expect(page.locator('#session')).toBeHidden();
});

test('direct fallback navigates same tab and leaves no persistent session selection', async ({ page }) => {
  await page.goto('/?hall=a');
  await page.locator('#join').click();
  await page.locator('#session-help summary').click();
  const link = page.locator('#session-fallback');
  expect(await link.getAttribute('target')).toBeNull();
  await link.click();
  await expect(page).toHaveURL(config.halls[0].attendeeUrl);
  await page.goto('/');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('#session')).toBeHidden();
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('mobile/desktop layout and shell accessibility', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/?hall=a');
    await expect(page.locator('#session-title')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#join').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const result = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(hall(page)).toBeVisible();
  await page.screenshot({ path: 'docs/mobile-preview.png', fullPage: true, scale: 'css' });
});

test('keyboard reaches hall controls and can select without touch', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to interpretation' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(hall(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(hall(page)).toHaveAttribute('aria-pressed', 'true');
});

test('programme shows current and next by Vietnam time without reloading active audio', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-28T11:44:30+07:00') });
  await page.goto('/?hall=a');
  await expect(page.locator('[data-schedule-hall="a"]')).toContainText('AI for brewery marketing');
  await expect(page.locator('[data-schedule-hall="b"]')).toContainText('Inside Czech lager brewing');
  await page.locator('#join').click();
  await page.locator('iframe').evaluate(frame => frame.dataset.identity = 'keep-this-frame');
  await page.clock.fastForward(60000);
  await expect(page.locator('[data-schedule-hall="a"]')).toContainText('No hall session scheduled now');
  await expect(page.locator('[data-schedule-hall="a"]')).toContainText('Hop aroma: field to glass');
  await expect(page.locator('iframe')).toHaveAttribute('data-identity', 'keep-this-frame');
  await expect(page.locator('iframe')).toHaveCount(1);
});

test('agenda dates, hall filters, workshop notes and choosing a room are usable', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-28T11:10:00+07:00') });
  await page.goto('/');
  await page.locator('#programme summary').click();
  await expect(page.locator('#programme-list')).toContainText('Saori Ushimi');
  await page.locator('[data-day="2026-10-29"]').click();
  await page.locator('#programme-hall').selectOption('a');
  await expect(page.locator('#programme-list')).toContainText('Register at the Lallemand booth');
  await expect(page.locator('#programme-list')).not.toContainText('URBREW');
  await page.getByRole('button', { name: /Choose Barth Haas Hall for Off-flavours/ }).click();
  await expect(hall(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#join')).toBeFocused();
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('schedule failure leaves listening controls and direct fallback usable', async ({ page }) => {
  await page.route('**/schedule.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/?hall=a');
  await expect(page.locator('[data-schedule-hall="a"]')).toContainText('Programme unavailable');
  await page.locator('#join').click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await page.locator('#session-help summary').click();
  await expect(page.locator('#session-fallback')).toBeVisible();
});

test('attendee shell omits vendor names and expanded programme remains accessible', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-28T11:10:00+07:00') });
  await page.goto('/?hall=a');
  await expect(page.locator('[data-schedule-hall="a"]')).toContainText('Scheduled now');
  expect(await page.locator('body').innerText()).not.toMatch(/wordly/i);
  await page.locator('#programme summary').click();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.locator('#programme summary').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('[data-schedule-hall="a"]')).toContainText('Scheduled now');
  await page.screenshot({ path: 'docs/schedule-preview.png', fullPage: true, scale: 'css' });
});

test('GitHub Pages-style project subdirectory loads local branding, schedule and sessions', async ({ page }) => {
  const failures = [];
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  await page.goto('http://127.0.0.1:4174/brew-asia-test/?hall=b&lang=ja');
  await expect(hall(page, 1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-schedule-hall="b"]')).not.toContainText('Checking');
  await expect(page.locator('[data-schedule-hall="b"]')).not.toContainText('unavailable');
  expect(await page.locator('.event-logo').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#join').click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /XVCS-9354\?.*lang=ja/);
  await expect(page.locator('iframe')).toHaveCount(1);
  expect(failures).toEqual([]);
});


test('active phone view puts the complete frame before help and schedule', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?hall=a&lang=ja');
  await expect(page.locator('.chooser')).toBeHidden();
  await page.locator('#join').click();
  await expect(page.locator('#embed-controls')).toBeHidden();
  await expect(page.locator('#session-fallback')).toBeHidden();
  await expect(page.locator('#selected-programme')).toBeHidden();
  for (const width of [320, 390]) {
    for (const room of ['a', 'b']) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/?hall=${room}&lang=ja`);
      await page.locator('#join').click();
      const rect = await page.locator('iframe').boundingBox();
      expect(rect.y).toBeLessThan(220);
      expect(rect.y + rect.height).toBeLessThanOrEqual(844);
    }
  }
  await page.clock.install();
  await page.clock.fastForward(20000);
  await expect(page.locator('#session-message')).toBeEmpty();
  await page.screenshot({ path: 'docs/listening-preview.png', fullPage: false, scale: 'css' });
  await page.locator('#change-hall').click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(hall(page)).toBeVisible();
  await expect(hall(page, 1)).toBeVisible();
  await expect(page.locator('#hall-heading')).toBeFocused();
});
