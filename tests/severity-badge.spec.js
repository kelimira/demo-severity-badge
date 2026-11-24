import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const TOKENS = '/node_modules/@elastio/pursuit-ui/tokens.css';
const ORIGIN = 'http://app.test';
const BG = { critical: 'rgb(254, 226, 226)', high: 'rgb(255, 237, 213)', medium: 'rgb(254, 249, 195)', low: 'rgb(220, 252, 231)', info: 'rgb(219, 234, 254)' };

let blocked;
test.beforeEach(async ({ page }) => {
  blocked = 0;
  await page.route('**/*', (route) => {
    const u = new URL(route.request().url());
    const abort = () => { blocked++; return route.abort(); };
    if (u.origin !== ORIGIN) return abort();
    if (u.pathname === '/') return route.fulfill({ path: path.join(root, 'index.html') });
    if (u.pathname === TOKENS) return route.fulfill({ path: path.join(root, 'tests/fixtures/tokens.fixture.css') });
    if (u.pathname.startsWith('/src/')) {
      const file = path.resolve(root, '.' + u.pathname);
      if (file.startsWith(path.join(root, 'src') + path.sep) && fs.existsSync(file)) return route.fulfill({ path: file });
    }
    return abort();
  });
});

test('tone mapping', async ({ page }) => {
  await page.goto(ORIGIN + '/');
  const r = await page.evaluate(async () => {
    const { severityTone } = await import('/src/severity-badge.js');
    return [' CRITICAL ', 'High', 'medium', 'low', 'info', null, undefined, 5, {}, '', 'bogus'].map(severityTone);
  });
  expect(r).toEqual(['critical', 'high', 'medium', 'low', 'info', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown']);
});

test('xss text', async ({ page }) => {
  await page.goto(ORIGIN + '/');
  const r = await page.evaluate(async () => {
    const { renderSeverityBadge } = await import('/src/severity-badge.js');
    const el = renderSeverityBadge('<img src=x onerror=alert(1)>');
    return { imgs: el.querySelectorAll('img').length, text: el.textContent };
  });
  expect(r.imgs).toBe(0);
  expect(r.text).toBe('Unknown');
  const lit = await page.evaluate(async () => {
    const { renderSeverityBadge } = await import('/src/severity-badge.js');
    const el = renderSeverityBadge(' High <b>x</b>');
    return el.querySelectorAll('b').length;
  });
  expect(lit).toBe(0);
});

test('renders and screenshots', async ({ page }) => {
  await page.goto(ORIGIN + '/');
  const pills = page.locator('#badges .pill');
  await expect(pills).toHaveCount(6);
  const tones = await pills.evaluateAll((els) => els.map((e) => e.dataset.tone));
  expect(tones).toEqual(['critical', 'high', 'medium', 'low', 'info', 'unknown']);
  const bgs = await pills.evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
  tones.slice(0, 5).forEach((t, i) => expect(bgs[i]).toBe(BG[t]));
  expect(new Set(bgs.slice(0, 5)).size).toBe(5);
  expect(blocked).toBe(0);

  const out = path.join(root, 'qa/screenshots/severity-badge.png');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.locator('#badges').screenshot({ path: out });
  expect(fs.statSync(out).size).toBeGreaterThan(0);
});

test('no color literals', () => {
  for (const f of ['src/severity-badge.css', 'index.html']) {
    const s = fs.readFileSync(path.join(root, f), 'utf8');
    expect(s, f).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|box-shadow/i);
  }
});
