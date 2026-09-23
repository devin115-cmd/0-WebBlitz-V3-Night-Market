// Captures the first viewport of each live demo and writes 1280/640/320px WebP previews.
// Usage: node scripts/capture-previews.mjs [slug ...]
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const source = await readFile(new URL('../src/data/demos.ts', import.meta.url), 'utf8');
const all = [...source.matchAll(/slug: "([^"]+)"[^}]*url: "([^"]+)"/g)].map(([, slug, url]) => ({ slug, url }));
const only = process.argv.slice(2);
const targets = only.length ? all.filter((demo) => only.includes(demo.slug)) : all;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const log = [];
for (const demo of targets) {
  const page = await context.newPage();
  const response = await page.goto(demo.url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3500);
  const shot = await page.screenshot({ type: 'png' });
  for (const width of [1280, 640, 320]) {
    await sharp(shot).resize(width, Math.round(width * 0.625)).webp({ quality: width === 1280 ? 72 : 76 }).toFile(`public/previews/${demo.slug}-${width}.webp`);
  }
  log.push({ slug: demo.slug, url: demo.url, status: response?.status() ?? null, title: await page.title() });
  await page.close();
}
await browser.close();
await writeFile('public/previews/capture-log.json', `${JSON.stringify({ capturedAt: new Date().toISOString(), viewport: '1280x800', browser: 'Chromium (Playwright 1.61.1)', reducedMotion: true, demos: log }, null, 2)}\n`);
console.log(`captured ${log.length}`);
