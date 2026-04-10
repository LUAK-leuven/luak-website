import { expect, test } from '@playwright/test';
import { navigateTo } from '~/tests/e2e/fixtures';

test('homepage is visible', async ({ page }) => {
  await navigateTo(page, '/');

  await expect(page.getByTestId('luak-logo')).toBeVisible();

  await expect(
    page.getByRole('link', { name: /check our activities/i }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: /become a member/i }).first(),
  ).toBeVisible();
});
