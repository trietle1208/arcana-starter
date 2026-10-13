import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startAppServer, type AppServer } from './support/appServer';
import { e2eDataDir } from './support/paths';
import { drawAndReveal, tableOf, watchProblems } from './support/reading';

// Flows 2–5 of docs/TECH_DESIGN.md §10, and the backup. They change what is saved (entries, the
// language, the motion mode) and one of them restarts the server, so they run one after another
// against a server of their own on its own database, never the shared one the other specs use.
// Reduced motion is the operating-system setting here to keep the ritual quick; the tests of the
// Reduce motion *setting* turn it back off.
const PORT = 3001;
test.use({ baseURL: `http://localhost:${PORT}`, reducedMotion: 'reduce' });
test.describe.configure({ mode: 'serial' });

let server: AppServer;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  server = await startAppServer({
    port: PORT,
    dbPath: join(e2eDataDir(), 'stateful', 'arcana.db'),
  });
});
test.afterAll(async () => {
  await server?.stop();
});

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

/** Runs `change` (a click on a setting) and waits until the server has answered it. */
async function changeSetting(page: Page, change: () => Promise<void>) {
  const saved = page.waitForResponse(
    (response) => response.request().method() === 'POST' && response.url().endsWith('/settings'),
  );
  await change();
  await saved;
}

async function openSettings(page: Page) {
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
}

/** Writes a free reflection through /journal/new and returns the id of its entry. */
async function writeEntry(page: Page, title: string, body: string, tags = ''): Promise<string> {
  await page.goto('/journal/new');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox', { name: 'Title' }).fill(title);
  await page.getByRole('textbox', { name: 'Your notes' }).fill(body);
  if (tags) await page.getByRole('textbox', { name: 'Tags' }).fill(tags);
  await page.getByRole('button', { name: 'Save entry' }).click();
  await expect(page).toHaveURL(new RegExp(`/journal/${UUID}$`));
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  return new URL(page.url()).pathname.split('/').pop()!;
}

const entryLink = (page: Page, title: string) =>
  page.getByRole('link', { name: new RegExp(title) });

test('the journal starts empty and says what to do', async ({ page }) => {
  await page.goto('/journal');
  await expect(page.getByRole('heading', { level: 1, name: 'Journal' })).toBeVisible();
  await expect(page.getByText('Nothing here yet')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your journal is empty.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to the Reading room' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'New entry' }).first()).toBeVisible();
});

test('flow 2: draw three cards, turn them over, save with a note, find it in the journal', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const problems = watchProblems(page);
  await page.goto('/reading');
  await page.waitForLoadState('networkidle');
  await drawAndReveal(page, 3);

  // Before saving, saving is on offer and nothing has been written.
  await expect(page.getByText('Save the reading to keep it in your journal.')).toBeVisible();
  const firstCard = (
    await page.locator('[data-position="1"]').getByRole('heading', { level: 3 }).innerText()
  )
    .split('\n')[0]
    .trim();

  await page.getByRole('button', { name: 'Save reading' }).click();
  const title = page.getByRole('textbox', { name: 'Title' });
  await expect(title).toBeFocused();
  await expect(title).toHaveValue(firstCard); // prefilled with the first card

  // An empty title is refused, with a way forward.
  await title.fill('   ');
  await page.getByRole('button', { name: 'Save to journal' }).click();
  await expect(page.getByText('Add a title before saving.')).toBeVisible();

  await title.fill('Quiet week');
  await page.getByRole('textbox', { name: 'Your notes' }).fill('The middle card surprised me.');
  await page.getByRole('textbox', { name: 'Tags' }).fill('Work, Calm, work');
  await page.getByRole('button', { name: 'Save to journal' }).click();

  await expect(page.getByText('Reading saved to your journal.')).toBeVisible();
  await expect(page.getByText('Add notes to it any time.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open' })).toHaveAttribute(
    'href',
    new RegExp(`^/journal/${UUID}$`),
  );
  await expect(page.getByRole('button', { name: 'Save reading' })).toBeDisabled();
  await expect(page.getByRole('textbox', { name: 'Title' })).toHaveCount(0);

  // It is in the journal: the card, the title, the note, the tags once each.
  await page.goto('/journal');
  await expect(page.getByText('1 reading or reflection')).toBeVisible();
  const entry = entryLink(page, 'Quiet week');
  await expect(entry).toHaveCount(1);
  await expect(entry).toContainText('Three cards');
  await expect(entry).toContainText('The middle card surprised me.');
  await expect(entry).toContainText('Work');
  await expect(entry).toContainText('Calm');
  await expect(entry.locator('img')).toHaveCount(3);

  // A fresh Reading room has nothing to save until a reading is done.
  await page.goto('/reading');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Save reading' })).toHaveCount(0);

  expect(problems).toEqual([]);
});

test('flow 3: open the entry, edit the note, reload, delete with undo', async ({ page }) => {
  const problems = watchProblems(page);
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');
  await entryLink(page, 'Quiet week').click();
  await expect(page).toHaveURL(new RegExp(`/journal/${UUID}$`));
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { level: 1, name: 'Quiet week' })).toBeVisible();

  // The spread is reopened: three cards face up, each with what it says in its position.
  await expect(page.getByText(/^Three cards · /)).toBeVisible();
  await expect(page.locator('[data-position]')).toHaveCount(3);
  await expect(page.getByRole('textbox', { name: 'Your notes' })).toHaveValue(
    'The middle card surprised me.',
  );
  await expect(page.getByRole('textbox', { name: 'Tags' })).toHaveValue('Work, Calm');

  // Edit and save.
  await page
    .getByRole('textbox', { name: 'Your notes' })
    .fill('Changed my mind about the middle card.');
  await page.getByRole('textbox', { name: 'Title' }).fill('A quieter week');
  await page.getByRole('textbox', { name: 'Tags' }).fill('Calm');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Changes saved.')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'A quieter week' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Your notes' })).toHaveValue(
    'Changed my mind about the middle card.',
  );
  await expect(page.getByRole('textbox', { name: 'Tags' })).toHaveValue('Calm');

  // An empty title is refused and nothing changes.
  await page.getByRole('textbox', { name: 'Title' }).fill('');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Add a title before saving.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'A quieter week' })).toBeVisible();

  // Delete, change your mind, delete for good.
  const address = page.url();
  await page.getByRole('button', { name: 'Delete entry' }).click();
  await expect(page.getByText('Entry deleted.')).toBeVisible();
  await expect(page.getByText('You can undo this for a few seconds.')).toBeVisible();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'A quieter week' })).toBeVisible();
  await expect(page.locator('[data-position]')).toHaveCount(3);
  expect((await page.request.get(address)).status()).toBe(200);

  await page.getByRole('button', { name: 'Delete entry' }).click();
  await expect(page.getByText('Entry deleted.')).toBeVisible();
  // The Undo offer lapses on its own.
  await expect(page.getByRole('button', { name: 'Undo' })).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByText('It is gone from your journal.')).toBeVisible();
  await page.getByRole('link', { name: 'Back to journal' }).click();
  await expect(page).toHaveURL('/journal');
  await expect(page.getByRole('heading', { name: 'Your journal is empty.' })).toBeVisible();
  expect((await page.request.get(address)).status()).toBe(404);

  expect(problems).toEqual([]);
});

test('a free reflection can be written, filtered and deleted without touching readings', async ({
  page,
}) => {
  const id = await writeEntry(page, 'On stillness', 'Mornings are the quiet part.', 'Calm');
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');
  const entry = entryLink(page, 'On stillness');
  await expect(entry).toContainText('Reflection');
  await expect(page.getByRole('button', { name: 'Readings' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );

  await page.getByRole('button', { name: 'Readings' }).click();
  await expect(page).toHaveURL(/\?type=readings$/);
  await expect(entry).toHaveCount(0);
  await expect(page.getByText('No entries match these filters.')).toBeVisible();

  await page.getByRole('button', { name: 'Reflections' }).click();
  await expect(page).toHaveURL(/\?type=reflections$/);
  await expect(entry).toHaveCount(1);

  await page.getByRole('button', { name: 'Calm' }).click();
  await expect(page).toHaveURL(/type=reflections&tag=Calm$/);
  await expect(entry).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Calm' })).toHaveAttribute('aria-pressed', 'true');
  await expect(entry).toHaveCount(1);

  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('button', { name: 'Calm' }).click(); // off again
  await expect(page).toHaveURL('/journal');

  await page.goto(`/journal/${id}`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Delete entry' }).click();
  await expect(page.getByText('Entry deleted.')).toBeVisible();
  expect((await page.request.get(`/journal/${id}`)).status()).toBe(404);
});

test('flow 4: entries and settings survive a server restart', async ({ page }) => {
  test.setTimeout(120_000);
  await openSettings(page);
  await changeSetting(page, () => page.getByRole('radio', { name: 'Celtic Cross' }).click());
  const id = await writeEntry(page, 'Before the restart', 'Still here afterwards.', 'Friends');

  await server.restart();

  await page.goto('/journal');
  const entry = entryLink(page, 'Before the restart');
  await expect(entry).toHaveCount(1);
  await expect(entry).toContainText('Still here afterwards.');
  await entry.click();
  await expect(page).toHaveURL(`/journal/${id}`);
  await expect(page.getByRole('textbox', { name: 'Your notes' })).toHaveValue(
    'Still here afterwards.',
  );
  await expect(page.getByRole('textbox', { name: 'Tags' })).toHaveValue('Friends');

  // The saved setting is in force on first paint, not only after a click.
  await page.goto('/reading');
  await expect(page.getByRole('radio', { name: 'Celtic Cross' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(tableOf(page).locator('[data-slot]')).toHaveCount(10);

  // Put the default back for the tests after this one.
  await openSettings(page);
  await expect(page.getByRole('radio', { name: 'Celtic Cross' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await changeSetting(page, () => page.getByRole('radio', { name: 'Three cards' }).click());
});

test('flow 5a: switching to Vietnamese changes the nav, the labels and the card names on first paint', async ({
  page,
  request,
}) => {
  await openSettings(page);
  await changeSetting(page, () => page.getByRole('radio', { name: 'Tiếng Việt' }).click());
  await expect(page.getByRole('heading', { level: 1, name: 'Cài đặt' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(
    page.getByRole('navigation', { name: 'Chính' }).getByRole('link', { name: 'Thư viện bài' }),
  ).toBeVisible();

  // First paint: the HTML the server sends, before any script runs, is already Vietnamese.
  const library = await (await request.get('/library')).text();
  expect(library).toContain('lang="vi"');
  expect(library).toMatch(/<h1[^>]*>Thư viện bài<\/h1>/);
  expect(library).toMatch(/<a[^>]*href="\/library"[^>]*>.*?Thư viện bài/);
  expect(library).toContain('Hiển thị 78 trên 78');
  const card = await (await request.get('/library/the-hermit')).text();
  expect(card).toMatch(/<h1[^>]*>Ẩn Sĩ<\/h1>/);
  expect(card).toContain('Xuôi');

  await page.goto('/library');
  await expect(page.getByRole('heading', { level: 1, name: 'Thư viện bài' })).toBeVisible();
  await page.getByLabel('Tìm lá bài').fill('an si');
  await expect(page.getByText('Hiển thị 1 trên 78')).toBeVisible();

  // The reading room too: its labels, its positions, its buttons.
  await page.goto('/reading');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Ngồi lại với một câu hỏi' }),
  ).toBeVisible();
  const table = page.getByRole('region', { name: 'Bàn trải bài' });
  await expect(table.getByText('Hãy giữ câu hỏi trong tâm trí, rồi xáo bộ bài.')).toBeVisible();
  await expect(table.getByText('Quá khứ', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xáo bài' })).toBeVisible();

  // The journal, with the entry flow 4 left in it.
  await page.goto('/journal');
  await expect(page.getByRole('heading', { level: 1, name: 'Nhật ký' })).toBeVisible();
  await expect(page.getByText('1 lần trải bài hoặc suy ngẫm')).toBeVisible();
  await expect(entryLink(page, 'Before the restart')).toContainText('Suy ngẫm');
  await expect(page.getByRole('button', { name: 'Trải bài' })).toBeVisible();

  // And back.
  await openSettings(page);
  await changeSetting(page, () => page.getByRole('radio', { name: 'English' }).click());
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('flow 5b: with reversed cards off, no card is drawn reversed', async ({ page }) => {
  test.setTimeout(120_000);
  await openSettings(page);
  const reversed = page.getByRole('switch', { name: 'Include reversed cards' });
  await expect(reversed).toHaveAttribute('aria-checked', 'true');
  await changeSetting(page, () => reversed.click());
  await expect(reversed).toHaveAttribute('aria-checked', 'false');

  // Three draws of three cards: at 50% each, an unfixed setting would show a reversed one at once.
  for (let round = 0; round < 3; round++) {
    await page.goto('/reading');
    await page.waitForLoadState('networkidle');
    await drawAndReveal(page, 3);
    const slots = tableOf(page).locator('[data-slot]');
    await expect(slots).toHaveCount(3);
    for (const slot of await slots.all()) {
      expect((await slot.innerText()).toLowerCase()).not.toContain('reversed');
    }
    await expect(page.getByText('Reversed', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Upright', { exact: true })).toHaveCount(3);
  }

  await openSettings(page);
  await changeSetting(page, () =>
    page.getByRole('switch', { name: 'Include reversed cards' }).click(),
  );
  await expect(page.getByRole('switch', { name: 'Include reversed cards' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

test.describe('the Reduce motion and reveal settings', () => {
  // The operating system asks for nothing here, so only the setting can make the ritual instant.
  test.use({ reducedMotion: 'no-preference' });

  test('flow 5c: Reduce motion "On" makes the ritual instant, "Off" plays it in full', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await openSettings(page);
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'system');
    await changeSetting(page, () =>
      page
        .getByRole('radiogroup', { name: 'Reduce motion' })
        .getByRole('radio', { name: 'On' })
        .click(),
    );
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');

    await page.goto('/reading');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
    const table = tableOf(page);

    // The shuffle takes 2.7s when it plays; here the cut is on the table within a second.
    await page.getByRole('button', { name: 'Shuffle the deck' }).click();
    await expect(table.getByText('Cut the deck: choose one of the three piles.')).toBeVisible({
      timeout: 1000,
    });
    await page.getByRole('button', { name: 'Pile 2' }).click();
    await expect(table.getByText('Choose 3 cards from the fan · 0 of 3 chosen')).toBeVisible({
      timeout: 1000,
    });
    for (let chosen = 1; chosen <= 3; chosen++) {
      await page.keyboard.press('Enter');
      if (chosen < 3)
        await expect(table.getByText(`${chosen} of 3 chosen`)).toBeVisible({ timeout: 1000 });
    }
    // No card is still in the air, and nothing on the table is animating.
    await expect(table.getByText('Turn each card over when you are ready.')).toBeVisible({
      timeout: 1000,
    });
    await expect(table.locator('[data-state="down"]')).toHaveCount(3);
    const animated = await page.evaluate(() => {
      const root = document.querySelector('[aria-label="Reading table"]');
      return Array.from(root?.querySelectorAll('*') ?? [])
        .filter((element) => {
          const style = getComputedStyle(element);
          return style.animationName !== 'none' && parseFloat(style.animationDuration) > 0.01;
        })
        .map((element) => element.className.toString());
    });
    expect(animated).toEqual([]);

    // "Off" plays the ritual in full even though nothing else asks for it: the shuffle is back.
    await openSettings(page);
    await changeSetting(page, () =>
      page
        .getByRole('radiogroup', { name: 'Reduce motion' })
        .getByRole('radio', { name: 'Off' })
        .click(),
    );
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    await page.goto('/reading');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Shuffle the deck' }).click();
    await expect(page.getByText('Shuffling the deck…')).toBeVisible();
    await page.waitForTimeout(600);
    await expect(table.getByText('Shuffling the deck…')).toBeVisible();
    await expect(page.getByRole('group', { name: 'Choose a pile' })).toBeVisible({ timeout: 6000 });

    await openSettings(page);
    await changeSetting(page, () =>
      page
        .getByRole('radiogroup', { name: 'Reduce motion' })
        .getByRole('radio', { name: 'System' })
        .click(),
    );
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'system');
  });
});

test('flow 5d: "Reveal cards one at a time" off turns the cards over by themselves', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await openSettings(page);
  const reveal = page.getByRole('switch', { name: 'Reveal cards one at a time' });
  await changeSetting(page, () => reveal.click());
  await expect(reveal).toHaveAttribute('aria-checked', 'false');

  await page.goto('/reading');
  await page.waitForLoadState('networkidle');
  await drawAndReveal(page, 3, { oneByOne: false });
  // Nobody pressed anything to turn a card, and all three meanings are there.
  await expect(page.locator('[data-position]')).toHaveCount(3);
  await expect(page.getByRole('button', { name: /select to turn over/ })).toHaveCount(0);
  await expect(tableOf(page).getByText('All 3 cards are revealed.')).toBeVisible();

  await openSettings(page);
  await changeSetting(page, () =>
    page.getByRole('switch', { name: 'Reveal cards one at a time' }).click(),
  );
  await expect(page.getByRole('switch', { name: 'Reveal cards one at a time' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

test('flow 5e: "Full" interpretation detail adds the symbolism and a question to each card', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await openSettings(page);
  await changeSetting(page, () =>
    page
      .getByRole('radiogroup', { name: 'Interpretation detail' })
      .getByRole('radio', { name: 'Full' })
      .click(),
  );
  await page.goto('/reading');
  await page.waitForLoadState('networkidle');
  await drawAndReveal(page, 3);
  await expect(page.getByText('Symbolism', { exact: true })).toHaveCount(3);
  await expect(page.getByText('To ask yourself', { exact: true })).toHaveCount(3);

  await openSettings(page);
  await changeSetting(page, () =>
    page
      .getByRole('radiogroup', { name: 'Interpretation detail' })
      .getByRole('radio', { name: 'Brief' })
      .click(),
  );
  await page.goto('/reading');
  await page.waitForLoadState('networkidle');
  await drawAndReveal(page, 3);
  await expect(page.getByText('Symbolism', { exact: true })).toHaveCount(0);
});

test('the journal can be exported and read back in', async ({ page }) => {
  await writeEntry(page, 'Worth keeping', 'A line to export.', 'Calm');
  await openSettings(page);

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export journal' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^arcana-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await file.path();
  const backup = JSON.parse(readFileSync(path, 'utf8')) as {
    version: number;
    journalEntries: { id: string; title: string }[];
    settings: { locale: string } | null;
  };
  expect(backup.version).toBe(1);
  const mine = backup.journalEntries.find((entry) => entry.title === 'Worth keeping');
  expect(mine).toBeDefined();
  expect(backup.settings?.locale).toBe('en');

  // Importing a file whose entries are all here adds nothing and says so.
  await page.locator('#backup-file').setInputFiles(path);
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByText('Backup imported.')).toBeVisible();
  await expect(page.getByText(/Entries added: 0\. Already here: \d+\./)).toBeVisible();

  // Delete the entry, then import: it comes back, with its note.
  await page.goto(`/journal/${mine!.id}`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Delete entry' }).click();
  await expect(page.getByText('Entry deleted.')).toBeVisible();
  await openSettings(page);
  await page.locator('#backup-file').setInputFiles(path);
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByText(/Entries added: 1\. Already here: \d+\./)).toBeVisible();
  await page.goto(`/journal/${mine!.id}`);
  await expect(page.getByRole('textbox', { name: 'Your notes' })).toHaveValue('A line to export.');

  // Nonsense is refused, and says so.
  await openSettings(page);
  await page.locator('#backup-file').setInputFiles({
    name: 'not-a-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"hello": "world"}'),
  });
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(
    page.getByText('This does not look like an Arcana backup, so nothing was imported.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByText('Choose a backup file first.')).toBeVisible();
});

test('a reflection saved from a card page opens in the journal about that card', async ({
  page,
}) => {
  await page.goto('/library/the-hermit');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Save to journal' }).click();
  await expect(page.getByText('Write a line or two first, then save.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Your notes' }).fill('Quiet mornings help.');
  await page.getByRole('button', { name: 'Save to journal' }).click();
  await expect(page.getByText('Reflection saved to your journal.')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Your notes' })).toHaveValue('');
  await page.getByRole('link', { name: 'Open' }).click();
  await expect(page).toHaveURL(new RegExp(`/journal/${UUID}$`));
  await expect(page.getByRole('heading', { level: 1, name: 'The Hermit' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Your notes' })).toHaveValue(
    'Quiet mornings help.',
  );
  await expect(page.getByText('When did time alone last give you an answer?')).toBeVisible();
  await expect(page.getByRole('link', { name: 'About The Hermit' })).toHaveAttribute(
    'href',
    '/library/the-hermit',
  );
});
