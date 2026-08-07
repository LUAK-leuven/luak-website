import { expect } from '@playwright/test';
import { LoginPage } from '#test/e2e/pages/login.page';
import { navigateTo, test } from '#test/e2e/fixtures';
import { testUsers } from '#test/e2e/testUtils/TestUser';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';

test('Login & logout — happy path', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const profilePage = await loginPage.loginAsserted(
    testUsers.unpaidMembership.email,
    testUsers.unpaidMembership.password,
  );
  await Promise.all([
    expect(page).toHaveURL(ProfileOverviewPage.path),
    expect(page.getByTestId('nav.profile').first()).toBeVisible(),
  ]);

  await profilePage.logout();
  await expect(page.getByTestId('nav.login').first()).toBeVisible();
});

test('Login — wrong email shows "invalid login credentials" on password field', async ({
  page,
}) => {
  await navigateTo(page, LoginPage.path);
  const loginPage = new LoginPage(page);
  await loginPage.login('not_an_existing_account@test.com', 'some_password');

  await expect(loginPage.errorMessage).toHaveText('Invalid login credentials');
});

test('Login — wrong password shows "invalid login credentials" on password field', async ({
  page,
}) => {
  await navigateTo(page, LoginPage.path);
  const loginPage = new LoginPage(page);
  await loginPage.login(testUsers.paidLastYear.email, 'wrong_password');

  await expect(loginPage.errorMessage).toHaveText('Invalid login credentials');
});

test('Login — already logged in redirects to profile', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginAsserted(
    testUsers.boardMember.email,
    testUsers.boardMember.password,
  );

  await navigateTo(page, LoginPage.path);
});
