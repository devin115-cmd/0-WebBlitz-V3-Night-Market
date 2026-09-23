import { expect, test, type Page } from '@playwright/test';
import { demos } from '../src/data/demos';

const homes = [
  { path: '/', lang: 'si-LK' },
  { path: '/en/', lang: 'en-LK' },
  { path: '/ta/', lang: 'ta-LK' },
];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  return errors;
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

for (const home of homes) {
  test(`${home.lang} home renders facts, contact links and alternates`, async ({ page }) => {
    const errors = watchErrors(page);
    const response = await page.goto(home.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', home.lang);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(4);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('.ticket__price')).toContainText('22,000', { timeout: 15_000 });
    const whatsapp = await page.locator('a[href*="wa.me"]').evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
    expect(whatsapp.length).toBeGreaterThan(5);
    for (const href of whatsapp) expect(href.startsWith('https://wa.me/94777192825?text=')).toBe(true);
    await expect(page.locator('body')).not.toContainText(/9,990|S3rendib/);
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 390, 430, 768, 1024, 1440]) {
  test(`no horizontal overflow at ${width}px in every locale`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/en/', '/ta/', '/designs/', '/ta/designs/']) {
      await page.goto(path);
      await page.waitForTimeout(300);
      expect(await horizontalOverflow(page), `${path} at ${width}px`).toBeLessThanOrEqual(1);
    }
  });
}

test('hero headline finishes its entrance and scroll effects run', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveClass(/motion-ready/);
  await expect.poll(() => page.locator('.hero__title .w > span').first().evaluate((span) => {
    const word = span.parentElement!.getBoundingClientRect();
    const box = span.getBoundingClientRect();
    return Math.abs(box.top - word.top) < 2;
  }), { timeout: 5_000 }).toBe(true);
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'night');
  await page.locator('#process').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 600);
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'cream');
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-section-link="faq"]')).toHaveAttribute('aria-current', 'location');
});

test('the motion control pauses and resumes decorative motion', async ({ page }) => {
  await page.goto('/en/');
  const toggle = page.locator('[data-motion-toggle]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toHaveAttribute('aria-label', 'Resume decorative motion and automatic scene changes');
  await expect(page.locator('html')).toHaveClass(/motion-paused/);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('html')).not.toHaveClass(/motion-paused/);
});

test('reduced motion keeps content in place and disables the toggle', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/');
  await expect(page.locator('[data-motion-toggle]')).toBeDisabled();
  const offset = await page.locator('.hero__title .w > span').first().evaluate((span) => span.getBoundingClientRect().top - span.parentElement!.getBoundingClientRect().top);
  expect(Math.abs(offset)).toBeLessThan(2);
  await page.locator('#included').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-tile]').first()).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-motion-toggle]')).toBeEnabled();
});

test('catalogue lists all 40 designs with exact demo links and filters them', async ({ page }) => {
  await page.goto('/en/designs/');
  const cards = page.locator('[data-grid] [data-card]');
  await expect(cards).toHaveCount(40);
  const hrefs = await page.locator('[data-grid] .card__media').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(new Set(hrefs)).toEqual(new Set(demos.map((demo) => demo.url)));
  const food = demos.filter((demo) => demo.category === 'food').length;
  await page.getByRole('button', { name: 'Food and drink', exact: true }).click();
  await expect(page.locator('[data-grid] [data-card]:visible')).toHaveCount(food);
  await expect(page.locator('[data-results]')).toHaveText(`${food} designs found`);
  await expect(page).toHaveURL(/type=food/);
  await page.getByRole('button', { name: 'All designs', exact: true }).click();
  await page.getByRole('searchbox').fill('kottu');
  await expect(page.locator('[data-results]')).toHaveText('1 design found');
  await page.getByRole('searchbox').fill('zzzz');
  await expect(page.locator('[data-empty]')).toBeVisible();
  await expect(page.locator('[data-results]')).toHaveText('No designs found');
  await page.locator('[data-empty] [data-clear]').click();
  await expect(cards.filter({ visible: true })).toHaveCount(40);
});

test('design enquiries carry the demo name, ID and URL', async ({ page }) => {
  await page.goto('/en/designs/');
  const link = page.locator('[data-card]', { hasText: 'Kottu FM' }).locator('a.wa');
  const href = decodeURIComponent((await link.getAttribute('href')) || '');
  expect(href).toContain('Kottu FM concept (LKWB-002): https://web-blitz.rajantha-rc.workers.dev/kottu-fm/');
});

test('language switcher keeps the equivalent page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/designs/');
  await page.locator('.nav__bar > .lang a[hreflang="ta"]').click();
  await expect(page).toHaveURL(/\/ta\/designs\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta-LK');
});

test('mobile menu opens, closes with Escape and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  const summary = page.locator('[data-menu] > summary');
  await summary.click();
  await expect(page.locator('[data-menu]')).toHaveAttribute('open', '');
  await expect(summary).toHaveAttribute('aria-label', 'Close menu');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-menu]')).not.toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('content, all designs and contact links stay available', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.ticket__price')).toContainText('22,000');
    await expect(page.locator('[data-motion-toggle]')).toBeHidden();
    await expect(page.locator('a[href^="https://wa.me/94777192825"]').first()).toBeVisible();
    await page.goto('/designs/');
    await expect(page.locator('[data-grid] [data-card]')).toHaveCount(40);
    await expect(page.locator('[data-filters]')).toBeHidden();
  });
});
