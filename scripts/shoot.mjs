// Development helper: captures viewport screenshots at scroll positions for visual review.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4400';
const out = process.env.OUT || 'artifacts/shots';
const [path = '/en/', width = '1440', height = '900', ...stops] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
await page.goto(base + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(2600);
const name = path.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'si';
const positions = stops.length ? stops.map(Number) : [0];
for (const y of positions) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${out}/${name}-${width}-${y}.png` });
}
console.log(JSON.stringify({ height: await page.evaluate(() => document.documentElement.scrollHeight), errors }));
await browser.close();
