// Renders the social-sharing image for each locale from the built hero. Requires `npm run preview` on BASE_URL.
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:4400';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const [locale, path] of [['si', '/'], ['en', '/en/'], ['ta', '/ta/']]) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '.nav, .motion-toggle, .scroll-cue, .grain, .hero__facts, .hero__actions { display: none !important; } .hero { min-height: 630px !important; padding: 40px 0 !important; }' });
  await page.waitForTimeout(3200);
  await page.screenshot({ path: `public/og-${locale}.jpg`, type: 'jpeg', quality: 82 });
}
await browser.close();
