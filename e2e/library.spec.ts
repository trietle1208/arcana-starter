import { expect, test } from '@playwright/test';

test('flow 1: search, filter, open a card, turn it over', async ({ page }) => {
  await page.goto('/library');
  await expect(page.getByRole('heading', { level: 1, name: 'Card library' })).toBeVisible();
  await expect(page.getByText('Showing 78 of 78')).toBeVisible();

  await page.getByLabel('Search cards').fill('hermit');
  await expect(page.getByText('Showing 1 of 78')).toBeVisible();
  await expect(page).toHaveURL(/\?q=hermit$/);

  await page.getByRole('button', { name: 'Major arcana' }).click();
  await expect(page.getByRole('button', { name: 'Major arcana' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page).toHaveURL(/q=hermit&arcana=major$/);
  await expect(page.getByText('Showing 1 of 78')).toBeVisible();

  await page.getByRole('link', { name: /The Hermit/ }).click();
  await expect(page).toHaveURL('/library/the-hermit');
  await expect(page.getByRole('heading', { level: 1, name: 'The Hermit' })).toBeVisible();
  await expect(page.getByText('Major arcana · IX')).toBeVisible();
  await expect(page.getByRole('img', { name: 'The Hermit', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Upright' })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  await page.getByRole('radio', { name: 'Reversed' }).click();
  await expect(page.getByRole('radio', { name: 'Reversed' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByRole('img', { name: 'The Hermit (reversed)' })).toBeVisible();

  await page.getByRole('link', { name: 'Card library', exact: true }).first().click();
  await expect(page).toHaveURL(/\/library/);
});

test('the filters and the sort live in the URL and survive a reload', async ({ page }) => {
  await page.goto('/library?suit=cups&sort=name');
  await expect(page.getByText('Showing 14 of 78')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cups' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('radio', { name: 'Name' })).toHaveAttribute('aria-checked', 'true');
  const tiles = page.locator('a[href^="/library/cups-"]');
  await expect(tiles.first()).toContainText('Ace of Cups');

  await page.getByRole('radio', { name: 'Number' }).click();
  await expect(page).toHaveURL(/\/library\?suit=cups$/);
  await page.reload();
  await expect(page.getByText('Showing 14 of 78')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cups' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'All cards' }).click();
  await expect(page.getByText('Showing 78 of 78')).toBeVisible();
  await expect(page).toHaveURL(/\/library$/);
});

test('searching without accents finds the Vietnamese name, and an empty result can be cleared', async ({
  page,
}) => {
  await page.goto('/library');
  await page.getByLabel('Search cards').fill('an si');
  await expect(page.getByText('Showing 1 of 78')).toBeVisible();
  await expect(page.locator('a[href="/library/the-hermit"]')).toBeVisible();

  await page.getByLabel('Search cards').fill('zzzz');
  await expect(page.getByText('No cards match your search.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByText('Showing 78 of 78')).toBeVisible();
  await expect(page.getByLabel('Search cards')).toHaveValue('');
});

test('all 78 cards are listed and each has a statically generated page', async ({
  page,
  request,
}) => {
  await page.goto('/library');
  await expect(page.getByText('Showing 78 of 78')).toBeVisible();
  const hrefs = await page
    .locator('a[href^="/library/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toHaveLength(78);
  expect(new Set(hrefs).size).toBe(78);
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
  expect((await request.get('/library/not-a-card')).status()).toBe(404);
  expect((await request.get('/library/cups-3')).status()).toBe(404);
});

test('a card that is still being written shows a quiet note instead of "TODO"', async ({
  page,
}) => {
  await page.goto('/library/cups-03');
  await expect(page.getByRole('heading', { level: 1, name: 'Three of Cups' })).toBeVisible();
  await expect(
    page.getByText('This part of the card is still being written.').first(),
  ).toBeVisible();
  await expect(page.getByText('TODO')).toHaveCount(0);
});

test('the reflection panel cannot save yet and says why', async ({ page }) => {
  await page.goto('/library/the-hermit');
  await expect(page.getByRole('heading', { level: 2, name: 'Reflect' })).toBeVisible();
  await expect(page.getByText('When did time alone last give you an answer?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save to journal' })).toBeDisabled();
  await expect(page.getByText('Saving to the journal is not available yet.')).toBeVisible();
  await page.getByLabel('Your notes').fill('Quiet mornings help.');
  await expect(page.getByLabel('Your notes')).toHaveValue('Quiet mornings help.');
});

test('the temporary language toggle shows Vietnamese names and labels', async ({ page }) => {
  await page.goto('/library');
  await page
    .getByRole('radiogroup', { name: 'Language' })
    .getByRole('radio', { name: 'VI' })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: 'Thư viện bài' })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Chính' }).getByRole('link', { name: 'Thư viện bài' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.getByLabel('Tìm lá bài')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');

  await page.getByLabel('Tìm lá bài').fill('an si');
  await expect(page.getByText('Hiển thị 1 trên 78')).toBeVisible();
  await page.getByRole('link', { name: /Ẩn Sĩ/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Ẩn Sĩ' })).toBeVisible();
  await expect(page.getByText('Bộ Ẩn Chính · IX')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Xuôi' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Ẩn Sĩ' })).toBeVisible();
});

test('the library and a card page load without console errors', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));

  await page.goto('/library');
  await expect(page.getByText('Showing 78 of 78')).toBeVisible();
  await page.getByLabel('Search cards').fill('moon');
  await page.getByRole('link', { name: /The Moon/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'The Moon' })).toBeVisible();
  await page.getByRole('radio', { name: 'Reversed' }).click();
  await page.waitForLoadState('networkidle');
  expect(problems).toEqual([]);
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the grid has two columns and nothing scrolls sideways', async ({ page }) => {
    await page.goto('/library');
    await expect(page.getByText('Showing 78 of 78')).toBeVisible();
    const boxes = await page.locator('a[href^="/library/"]').evaluateAll((links) =>
      links.slice(0, 3).map((link) => {
        const { x, y, width } = link.getBoundingClientRect();
        return { x, y, width };
      }),
    );
    expect(boxes[1].y).toBe(boxes[0].y);
    expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
    expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('the detail page stacks the card above the text', async ({ page }) => {
    await page.goto('/library/the-hermit');
    const card = await page.getByRole('img', { name: 'The Hermit', exact: true }).boundingBox();
    const title = await page.getByRole('heading', { level: 1, name: 'The Hermit' }).boundingBox();
    expect(card && title && card.y + card.height <= title.y).toBe(true);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test('captures screenshots for the visual check', async ({ page }) => {
  for (const [name, width, height] of [
    ['desktop', 1280, 1092],
    ['phone', 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/library');
    await expect(page.getByText('Showing 78 of 78')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `test-results/screenshots/library-${name}.png` });
    await page.goto('/library/the-hermit');
    await expect(page.getByRole('heading', { level: 1, name: 'The Hermit' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `test-results/screenshots/card-detail-${name}.png`,
      fullPage: true,
    });
  }
});
