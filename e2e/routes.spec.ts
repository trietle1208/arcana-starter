import { expect, test } from '@playwright/test';

const ROUTES = [
  { path: '/', title: 'Home', nav: 'Home' },
  { path: '/library', title: 'Card library', nav: 'Card library' },
  { path: '/reading', title: 'Sit with a question', nav: 'Reading room' },
  { path: '/study', title: 'Study', nav: 'Study' },
  { path: '/journal', title: 'Journal', nav: 'Journal' },
  { path: '/settings', title: 'Settings', nav: 'Settings' },
];

for (const route of ROUTES) {
  test(`${route.path} renders its title and marks its nav item`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: route.title })).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: route.nav }),
    ).toHaveAttribute('aria-current', 'page');
  });
}

test('navigation moves between the routes', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  for (const route of ROUTES.slice(1)) {
    await nav.getByRole('link', { name: route.nav }).click();
    await expect(page).toHaveURL(route.path);
    await expect(page.getByRole('heading', { level: 1, name: route.title })).toBeVisible();
  }
});

test('desktop shows the side nav, no bottom bar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Reading room' })).toBeVisible();
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows a bottom bar with five items and Settings in the top bar', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav).toHaveCount(1);
    await expect(nav.getByRole('link')).toHaveCount(5);
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

test('the design tokens and fonts are applied', async ({ page }) => {
  await page.goto('/');
  const styles = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    return { background: body.backgroundColor, font: body.fontFamily };
  });
  expect(styles.background).toBe('rgb(246, 241, 232)');
  expect(styles.font).toMatch(/DM Sans/i);
});

test('captures screenshots for the visual check', async ({ page }) => {
  for (const [name, width, height] of [
    ['desktop', 1280, 900],
    ['phone', 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.screenshot({ path: `test-results/screenshots/home-${name}.png` });
  }
});
