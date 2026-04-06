import { expect, test } from '@playwright/test';

test('homepage is visible', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('luak-logo')).toBeVisible();

  await expect(
    page.getByRole('link', { name: /check our activities/i }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: /become a member/i }).first(),
  ).toBeVisible();
});
