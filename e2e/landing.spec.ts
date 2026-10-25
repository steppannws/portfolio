import { expect, test } from '@playwright/test';

test('landing renders hero and sections in dark mode', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('heading', { name: /Stepan Nikulenko/ })).toBeVisible();
  await expect(page.locator('#work')).toBeVisible();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Light' })).toHaveCount(0);

  const workCards = page.locator('#work h3');
  await expect(workCards).toHaveCount(10);
});

test('tapping the face drops the climber onto the surname and the arrows drive it', async ({
  page,
}) => {
  await page.goto('./');
  // the loader keeps swallowing clicks until its fade-out finishes
  await expect(page.locator('#boot-loader')).toBeHidden();

  const portrait = page.getByAltText('Stepan Nikulenko');
  const nose = await portrait.evaluate((el) => {
    const img = el as HTMLImageElement;
    const r = img.getBoundingClientRect();
    const s = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
    return { x: r.left + 290 * s, y: r.top + (r.height - img.naturalHeight * s) + 160 * s };
  });
  await page.mouse.click(nose.x, nose.y);

  const canvas = page.locator('canvas[data-climber]');
  await expect(canvas).toBeVisible();

  // settles with its feet on the glyph relief of "Nikulenko" (below the raw CSS box top)
  const surname = page
    .getByRole('heading', { name: /Stepan Nikulenko/ })
    .locator('span', { hasText: /^Nikulenko$/ });
  await expect
    .poll(
      async () => {
        const feet = Number(await canvas.getAttribute('data-feet'));
        const box = await surname.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
        });
        return feet >= box.top && feet < box.top + (box.bottom - box.top) * 0.45;
      },
      { timeout: 4000 }
    )
    .toBe(true);

  const landedFeet = Number(await canvas.getAttribute('data-feet'));
  const before = Number(await canvas.getAttribute('data-x'));
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(300);
  await page.keyboard.up('ArrowRight');
  expect(Number(await canvas.getAttribute('data-x'))).toBeGreaterThan(before + 20);

  // rapid double-press of ArrowUp triggers a second jump in a row
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(60);
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(180);
  const doubleJumpFeet = Number(await canvas.getAttribute('data-feet'));
  expect(doubleJumpFeet).toBeLessThan(landedFeet - 80);

  await page.keyboard.press('Escape');
  await expect(canvas).toHaveCount(0);
});
