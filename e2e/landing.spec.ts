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
