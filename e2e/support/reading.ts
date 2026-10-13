import { expect, type Page } from '@playwright/test';

/** Console errors and uncaught exceptions of the page, collected as the test runs. */
export function watchProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

export const tableOf = (page: Page) =>
  page.getByRole('region', { name: /^(Reading table|Bàn trải bài)$/ });

/**
 * Walks the ritual for a spread of `count` cards, by keyboard and by role, until every card is
 * turned and "Save reading" is on offer. Works in English; Vietnamese tests drive it by hand.
 *
 * The first click can land before the page has hydrated, so the shuffle is retried until the
 * ritual reacts. `oneByOne` is the "Reveal cards one at a time" setting.
 */
export async function drawAndReveal(
  page: Page,
  count: number,
  { oneByOne = true }: { oneByOne?: boolean } = {},
) {
  const table = tableOf(page);
  await expect(async () => {
    await page.getByRole('button', { name: 'Shuffle the deck' }).click({ timeout: 1000 });
    await expect(page.getByRole('group', { name: 'Choose a pile' })).toBeVisible({ timeout: 6000 });
  }).toPass({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Pile 1' }).click();

  await expect(page.getByRole('button', { name: 'Choose card 1 of 21' })).toBeFocused();
  for (let chosen = 1; chosen <= count; chosen++) {
    await page.keyboard.press('Enter');
    if (chosen < count) {
      await expect(table.getByText(`${chosen} of ${count} chosen`)).toBeVisible();
      await expect(
        page.getByRole('button', { name: `Choose card ${chosen + 1} of 21` }),
      ).toBeFocused();
    }
  }

  if (oneByOne) {
    for (let n = 1; n <= count; n++) {
      await expect(page.getByRole('button', { name: new RegExp(`^Position ${n},`) })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-position]')).toHaveCount(n);
    }
  }
  await expect(page.getByRole('button', { name: 'Save reading' })).toBeVisible();
}
