import { expect, test } from '@playwright/test';
import { LoginPage } from './login.page';

test('Login & logout — happy path', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('unpaid_membership@test.com');
  await Promise.all([
    expect(page).toHaveURL('/profile/overview'),
    expect(page.getByTestId('nav.profile').first()).toBeVisible(),
  ]);

  await loginPage.logout();
  await expect(page.getByTestId('nav.login').first()).toBeVisible();
});

test('Login — wrong email shows "invalid login credentials" on password field', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('not_an_existing_account@test.com');

  await expect(page.getByTestId('login.password')).toContainText(
    'Invalid login credentials',
  );
});

test('Login — wrong password shows "invalid login credentials" on password field', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('paid_this_year@test.com', 'wrong_password');

  await expect(page.getByTestId('login.password')).toContainText(
    'Invalid login credentials',
  );
});
