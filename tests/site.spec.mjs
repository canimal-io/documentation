import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = { home: '/', datasheet: '/products/can_to_usb/can_to_usb_specs/', guide: '/products/can_to_usb/can_to_usb_guide/' };
for (const theme of ['light', 'dark']) {
  for (const [name, route] of Object.entries(routes)) {
    test(`${name} ${theme}: desktop accessibility and rendering`, async ({ page }, info) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      await info.attach('axe', { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
      expect(result.violations).toEqual([]);
      await page.screenshot({ path: info.outputPath(`${name}-${theme}.png`), fullPage: true });
      await info.attach(`${name}-${theme}`, { path: info.outputPath(`${name}-${theme}.png`), contentType: 'image/png' });
    });
  }
}
test('keyboard skip link, focus, search results and escape', async ({ page }, info) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByText('Skip to content', { exact: true })).toBeFocused();
  const outline = await page.locator(':focus').evaluate(e => getComputedStyle(e).outlineStyle);
  expect(outline).not.toBe('none');
  await page.keyboard.press('Enter');
  const focusBeforeSearch = await page.evaluate(() => document.activeElement.tagName + '#' + document.activeElement.id);
  await page.keyboard.press('Control+k');
  const input = page.getByRole('textbox', { name: 'Search', exact: true });
  await expect(input).toBeFocused();
  await input.fill('termination');
  await expect(page.locator('.pagefind-ui__result').first()).toBeVisible();
  await page.screenshot({ path: info.outputPath('search.png') });
  await info.attach('search', { path: info.outputPath('search.png'), contentType: 'image/png' });
  await page.keyboard.press('Escape');
  await expect(input).not.toBeVisible();
  expect(await page.evaluate(() => document.activeElement.tagName + '#' + document.activeElement.id)).toBe(focusBeforeSearch);
  await page.keyboard.press('Control+k');
  await input.fill('termination');
  await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
  for (let step = 0; step < 15; step++) {
    await page.keyboard.press('Tab');
    if (await page.locator('.pagefind-ui__result-link:focus').count()) break;
  }
  await expect(page.locator('.pagefind-ui__result-link:focus')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/127\.0\.0\.1:4321\/products\/can_to_usb\//);
});
test('mobile navigation, image, no horizontal page overflow and 404', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('link', { name: 'Datasheet', exact: true }).click();
  await expect(page).toHaveURL(/can_to_usb_specs\/$/);
  await expect(page.locator('main img')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('mobile.png'), fullPage: true });
  await info.attach('mobile', { path: info.outputPath('mobile.png'), contentType: 'image/png' });
  const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'documentation overview', exact: true }).click();
  await expect(page).toHaveURL('/');
});

test('synthetic Markdown table uses the installed renderer and mobile theme styles', async ({ page }) => {
  // Existing pages have no tables; do not add synthetic content to the published site.
  const { createSatteriMarkdownProcessor } = await import('@astrojs/markdown-satteri');
  const renderer = await createSatteriMarkdownProcessor();
  const { code } = await renderer.render('| Field | Example |\n| --- | --- |\n| Name | Synthetic test value |');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.sl-markdown-content').evaluate((e, html) => { e.innerHTML = html; }, code);
  await expect(page.getByRole('columnheader', { name: 'Field' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Synthetic test value' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('theme selection persists and the page/search load without third-party requests', async ({ page }) => {
  const external = [];
  page.on('request', r => { if (!new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/)) external.push(r.url()); });
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Select theme' }).selectOption('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill('termination');
  await expect(page.locator('.pagefind-ui__result').first()).toBeVisible();
  expect(external).toEqual([]);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});


test('long code remains readable without horizontal scrolling at narrow widths', async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(routes.guide);
    for (const pre of await page.locator('main pre').all()) {
      expect(await pre.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
