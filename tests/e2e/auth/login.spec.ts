import { expect, test } from '@playwright/test';
import { testUser } from '../fixtures';

test('Login & logout — happy path', async ({ page }) => {
  await testUser.login('unpaid_membership@test.com', page);

  expect(page).toHaveURL('/profile/overview');
  expect(page.getByTestId('nav.profile').first()).toBeVisible();

  await page
    .getByTestId('profile.logout')
    .click();
  await expect(page).toHaveURL('/login');
  await expect(page.getByTestId('nav.login').first()).toBeVisible();
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
