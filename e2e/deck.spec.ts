import { expect, test } from '@playwright/test';

test('deck renders and navigates with keyboard and hash', async ({ page }) => {
  await page.goto('./deck.html');

  await expect(page.getByRole('heading', { name: /Stepan Nikulenko/ })).toBeVisible();
  await expect(page.getByText('1 / 16')).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('2 / 16')).toBeVisible();
  expect(page.url()).toContain('#2');

  await page.goto('./deck.html#16');
  await expect(page.getByText('16 / 16')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Let's build/ })).toBeVisible();
});

test('every slide fits inside the 1920×1080 stage', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  for (let n = 1; n <= 16; n++) {
    await page.goto(`./deck.html#${n}`);
    await expect(page.getByText(`${n} / 16`)).toBeVisible();
    const overflowing = await page.evaluate(() => {
      const stage = document.querySelector('[class*="stage"]')!.getBoundingClientRect();
      return Array.from(document.querySelectorAll('[class*="stage"] *'))
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width > 0 &&
            (r.top < stage.top - 1 ||
              r.left < stage.left - 1 ||
              r.bottom > stage.bottom + 1 ||
              r.right > stage.right + 1)
          );
        })
        .map((el) => `${el.tagName}.${el.className}`);
    });
    expect(overflowing, `slide ${n}`).toEqual([]);
  }
});
