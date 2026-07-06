import { expect, test } from '@playwright/test';

test('deck renders and navigates with keyboard and hash', async ({ page }) => {
  await page.goto('./deck.html');

  await expect(page.getByRole('heading', { name: /Stepan Nikulenko/ })).toBeVisible();
  await expect(page.getByText('1 / 15')).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('2 / 15')).toBeVisible();
  expect(page.url()).toContain('#2');

  await page.goto('./deck.html#15');
  await expect(page.getByText('15 / 15')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Let's build/ })).toBeVisible();
});
