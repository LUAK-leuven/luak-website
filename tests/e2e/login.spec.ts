import { expect, test } from '@playwright/test';

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

test('Login — wrong email shows "invalid login credentials" on password field', async ({
  page,
}) => {
  await page.goto('/login');
  await page
    .getByTestId('login.email')
    .getByRole('textbox')
    .fill('not_an_existing_account@test.com');
  await page
    .getByTestId('login.password')
    .getByRole('textbox')
    .fill('123456789');

  await page.getByTestId('login.submit').click();

  await expect(page.getByTestId('login.password')).toContainText(
    'Invalid login credentials',
  );
});

test('Login — wrong password shows "invalid login credentials" on password field', async ({
  page,
}) => {
  await page.goto('/login');
  await page
    .getByTestId('login.email')
    .getByRole('textbox')
    .fill('paid_this_year@test.com');
  await page
    .getByTestId('login.password')
    .getByRole('textbox')
    .fill('wronggggg');

  await page.getByTestId('login.submit').click();

  await expect(page.getByTestId('login.password')).toContainText(
    'Invalid login credentials',
  );
});
