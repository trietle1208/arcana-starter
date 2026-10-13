import { expect, test, type Page } from '@playwright/test';

// The Reading Room ritual, end to end. Everything is reached by role and name, with the keyboard
// where a reader would use it: the fan overlaps itself, so a click at the middle of a card can
// land on its neighbour.

/** Console errors and uncaught exceptions of the page, collected as the test runs. */
function watchProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

const tableOf = (page: Page) => page.getByRole('region', { name: 'Reading table' });

/** Presses "Shuffle the deck" until the ritual reacts, in case the click lands before hydration. */
async function shuffle(page: Page, nextText: string | RegExp) {
  await expect(async () => {
    await page.getByRole('button', { name: 'Shuffle the deck' }).click({ timeout: 1000 });
    await expect(tableOf(page).getByText(nextText)).toBeVisible({ timeout: 1500 });
  }).toPass();
}

async function heightOf(page: Page): Promise<number> {
  const box = await tableOf(page).boundingBox();
  if (!box) throw new Error('The reading table is not on the page');
  return box.height;
}

test('walks the three-card ritual from the shuffle to the meanings', async ({ page }) => {
  test.setTimeout(90_000);
  const problems = watchProblems(page);
  const table = tableOf(page);
  const heights: number[] = [];

  await page.goto('/reading');
  await expect(page.getByRole('heading', { level: 1, name: 'Sit with a question' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Three cards' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(table.getByText('Hold your question in mind, then shuffle the deck.')).toBeVisible();
  await expect(table.locator('[data-slot]')).toHaveCount(3);
  heights.push(await heightOf(page));

  // Shuffle: the deck riffles for 2.7s, then the cut begins.
  await shuffle(page, 'Shuffling the deck…');
  heights.push(await heightOf(page));
  await expect(table.getByText('Cut the deck: choose one of the three piles.')).toBeVisible();
  heights.push(await heightOf(page));

  // Cut: three piles, each a button.
  await expect(page.getByRole('group', { name: 'Choose a pile' }).getByRole('button')).toHaveCount(
    3,
  );
  await page.getByRole('button', { name: 'Pile 2' }).click();

  // Fan: 21 cards, and the keyboard lands on the first one.
  await expect(table.getByText('Choose 3 cards from the fan · 0 of 3 chosen')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Choose from the fanned deck' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Choose card \d+ of 21$/ })).toHaveCount(21);
  await expect(page.getByRole('button', { name: 'Choose card 1 of 21' })).toBeFocused();
  heights.push(await heightOf(page));

  // Choose: card 17, then, with the keyboard only, 16 and 18. The fan index decides nothing
  // about which card arrives; the reading was drawn when the fan opened.
  await page.getByRole('button', { name: 'Choose card 17 of 21' }).focus();
  await page.keyboard.press('Enter');
  await expect(table.getByText('Choose 3 cards from the fan · 1 of 3 chosen')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose card 17 of 21' })).toBeHidden();
  heights.push(await heightOf(page));
  // The card flies for 0.75s; then focus moves on to the next card that is left.
  await expect(page.getByRole('button', { name: 'Choose card 18 of 21' })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('button', { name: 'Choose card 16 of 21' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(table.getByText('Choose 3 cards from the fan · 2 of 3 chosen')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose card 18 of 21' })).toBeFocused();
  await page.keyboard.press('Enter');

  // Reveal: all three cards sit face down and the first one is ready to turn.
  await expect(table.getByText('Turn each card over when you are ready.')).toBeVisible();
  heights.push(await heightOf(page));
  await expect(page.getByText('3 cards drawn')).toBeVisible();
  await expect(page.getByRole('button', { name: /select to turn over/ })).toHaveCount(3);
  await expect(page.getByRole('button', { name: /^Position 1, Past/ })).toBeFocused();
  await expect(page.locator('[data-position]')).toHaveCount(0);

  // Turn the cards one at a time; each one adds its meaning below the table.
  for (const [n, position] of [
    [1, 'Past'],
    [2, 'Present'],
    [3, 'Future'],
  ] as const) {
    await expect(
      page.getByRole('button', { name: new RegExp(`^Position ${n}, ${position}`) }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator(`[data-position="${n}"]`)).toBeVisible();
    await expect(page.locator('[data-position]')).toHaveCount(n);
    heights.push(await heightOf(page));
  }

  // Done: every card is named, Save is off for now (with a reason), Shuffle again is ready.
  await expect(table.getByText('All 3 cards are revealed.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Shuffle again' })).toBeFocused();
  const save = page.getByRole('button', { name: 'Save reading' });
  await expect(save).toBeDisabled();
  await expect(save).toHaveAccessibleDescription('Saving to the journal is not available yet.');
  heights.push(await heightOf(page));

  // What the table says and what the meanings say is the same card on the same side.
  for (const [n, position] of [
    [1, 'Past'],
    [2, 'Present'],
    [3, 'Future'],
  ] as const) {
    const meaning = page.locator(`[data-position="${n}"]`);
    await expect(meaning.getByText(position, { exact: false }).first()).toBeVisible();
    const title = (await meaning.getByRole('heading', { level: 3 }).innerText()).split('\n');
    const cardName = title[0].trim().replace(/\s+(Upright|Reversed)$/, '');
    const side = /Reversed$/.test(title.join(' ').trim()) ? 'reversed' : 'upright';
    const slot = await table.locator(`[data-slot="${n}"]`).innerText();
    expect(slot).toContain(cardName);
    expect(/reversed/i.test(slot)).toBe(side === 'reversed');
  }

  // No layout shift: the table is as tall at the end as it was at the start.
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);

  // Shuffle again starts over: the old meanings go, the positions are empty, the deck riffles.
  await page.getByRole('button', { name: 'Shuffle again' }).click();
  await expect(table.getByText('Shuffling the deck…')).toBeVisible();
  await expect(page.locator('[data-position]')).toHaveCount(0);
  await expect(table.locator('[data-state="empty"]')).toHaveCount(3);
  await expect(table.getByText('Cut the deck: choose one of the three piles.')).toBeVisible();

  expect(problems).toEqual([]);
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('every step still happens, at once: the Celtic Cross, ten cards', async ({ page }) => {
    const problems = watchProblems(page);
    const table = tableOf(page);
    await page.goto('/reading');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sit with a question' }),
    ).toBeVisible();
    await page.getByRole('radio', { name: 'Celtic Cross' }).click();
    await expect(table.locator('[data-slot]')).toHaveCount(10);
    const before = await heightOf(page);

    // The shuffle would take 2.7s and the cut 0.75s; both are over at once.
    await shuffle(page, 'Cut the deck: choose one of the three piles.');
    await page.getByRole('button', { name: 'Pile 1' }).click();
    await expect(table.getByText('Choose 10 cards from the fan · 0 of 10 chosen')).toBeVisible({
      timeout: 1000,
    });

    // Ten cards, chosen with Enter alone: focus moves on to the next card each time, and there
    // is no flight to wait for.
    await expect(page.getByRole('button', { name: 'Choose card 1 of 21' })).toBeFocused();
    for (let chosen = 1; chosen <= 10; chosen++) {
      await page.keyboard.press('Enter');
      if (chosen < 10) {
        await expect(table.getByText(`${chosen} of 10 chosen`)).toBeVisible({ timeout: 1000 });
        await expect(
          page.getByRole('button', { name: `Choose card ${chosen + 1} of 21` }),
        ).toBeFocused();
      }
    }
    await expect(table.getByText('Turn each card over when you are ready.')).toBeVisible({
      timeout: 1000,
    });
    await expect(page.locator('[class*="flight"]')).toHaveCount(0);
    await expect(table.locator('[data-state="down"]')).toHaveCount(10);

    // Turn them all, the same way.
    for (let n = 1; n <= 10; n++) {
      await expect(page.getByRole('button', { name: new RegExp(`^Position ${n},`) })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-position]')).toHaveCount(n);
    }
    await expect(table.getByText('All 10 cards are revealed.')).toBeVisible({ timeout: 1500 });
    await expect(table.locator('[data-state="up"]')).toHaveCount(10);

    // The legend now names the cards instead of asking the questions.
    const legend = table.getByRole('list', { name: 'Positions' }).getByRole('listitem');
    await expect(legend).toHaveCount(10);
    await expect(table.getByText('The heart of the matter')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Save reading' })).toBeDisabled();
    expect(Math.abs((await heightOf(page)) - before)).toBeLessThanOrEqual(1);

    expect(problems).toEqual([]);
  });

  test('the stars hold still and nothing animates on the table', async ({ page }) => {
    await page.goto('/reading');
    const animated = await page.evaluate(() => {
      const table = document.querySelector('[aria-label="Reading table"]');
      if (!table) return ['no table'];
      return Array.from(table.querySelectorAll('*'))
        .filter((element) => {
          const style = getComputedStyle(element);
          return style.animationName !== 'none' && parseFloat(style.animationDuration) > 0.01;
        })
        .map((element) => element.className.toString());
    });
    expect(animated).toEqual([]);
  });
});

test('each spread lays out its own positions, and changing it starts the ritual over', async ({
  page,
}) => {
  const table = tableOf(page);
  await page.goto('/reading');
  await expect(page.getByRole('heading', { level: 1, name: 'Sit with a question' })).toBeVisible();

  for (const [name, positions] of [
    ['One card', 1],
    ['Three cards', 3],
    ['Celtic Cross', 10],
  ] as const) {
    await page.getByRole('radio', { name }).click();
    await expect(page.getByRole('radio', { name })).toHaveAttribute('aria-checked', 'true');
    await expect(table.locator('[data-slot]')).toHaveCount(positions);
    await expect(table.locator('[data-state="empty"]')).toHaveCount(positions);
    await expect(
      table.getByText('Hold your question in mind, then shuffle the deck.'),
    ).toBeVisible();
  }
  // Only the Celtic Cross has a legend.
  await expect(table.getByRole('list', { name: 'Positions' })).toBeVisible();
  await page.getByRole('radio', { name: 'Three cards' }).click();
  await expect(table.getByRole('list', { name: 'Positions' })).toHaveCount(0);
  await expect(table.getByText('Past', { exact: true })).toBeVisible();
  await expect(table.getByText('Present', { exact: true })).toBeVisible();
  await expect(table.getByText('Future', { exact: true })).toBeVisible();

  // Half way through a ritual, changing the spread puts the deck back on the table.
  await shuffle(page, 'Shuffling the deck…');
  await page.getByRole('radio', { name: 'One card' }).click();
  await expect(table.getByText('Hold your question in mind, then shuffle the deck.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Shuffle the deck' })).toBeVisible();
  await expect(table.locator('[data-slot]')).toHaveCount(1);
  // The timer of the old ritual must not carry it on to a cut.
  await page.waitForTimeout(3200);
  await expect(page.getByRole('group', { name: 'Choose a pile' })).toHaveCount(0);
  await expect(table.getByText('Hold your question in mind, then shuffle the deck.')).toBeVisible();
});

test('the room speaks Vietnamese when asked', async ({ page }) => {
  await page.goto('/reading');
  await expect(page.getByRole('heading', { level: 1, name: 'Sit with a question' })).toBeVisible();
  await expect(async () => {
    await page.getByRole('radio', { name: 'VI' }).click({ timeout: 1000 });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Ngồi lại với một câu hỏi' }),
    ).toBeVisible({ timeout: 1500 });
  }).toPass();
  const table = page.getByRole('region', { name: 'Bàn trải bài' });
  await expect(table.getByText('Hãy giữ câu hỏi trong tâm trí, rồi xáo bộ bài.')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Ba lá' })).toHaveAttribute('aria-checked', 'true');
  await expect(table.getByText('Quá khứ', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xáo bài' })).toBeVisible();
});
