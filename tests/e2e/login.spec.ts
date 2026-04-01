import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('Login — happy path', async ({ page }) => {
  await page.goto('/login');
  await page
    .getByTestId('login.email')
    .getByRole('textbox')
    .fill('paid_this_year@test.com');
  await page
    .getByTestId('login.password')
    .getByRole('textbox')
    .fill('123456789');

  await page.getByTestId('login.submit').click();

  await expect(page).toHaveURL('/profile/overview', { timeout: 5_000 });
});
