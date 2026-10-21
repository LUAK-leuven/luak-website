import { expect } from '@playwright/test';
import { LoginPage } from '#test/e2e/pages/login.page';
import { generatedUserTest, login, navigateTo, test } from '#test/e2e/fixtures';
import { testUsers } from '#test/TestUser';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';
import { ProfileSettingsPage } from '#test/e2e/pages/profile/settings.page';

generatedUserTest(
  'Login & logout — happy path',
  async ({ page, generatedUser }) => {
    const loginPage = await LoginPage.navigate(page);
    const profilePage = await loginPage.loginAsserted(
      generatedUser.email,
      generatedUser.password,
    );
    await Promise.all([
      expect(page).toHaveURL(ProfileOverviewPage.path),
      expect(page.getByTestId('nav.profile').first()).toBeVisible(),
    ]);

    await profilePage.logout();
    await expect(page.getByTestId('nav.login').first()).toBeVisible();
  },
);

generatedUserTest(
  'Log out — keeps the session of the same user on another device',
  async ({ page, browser, generatedUser }) => {
    const otherDeviceContext = await browser.newContext();
    try {
      const otherDevicePage = await otherDeviceContext.newPage();
      await login(page, generatedUser);
      await login(otherDevicePage, generatedUser);

      const profilePage = new ProfileOverviewPage(page);
      await profilePage.logout();

      await otherDevicePage.goto(ProfileSettingsPage.path);
      await otherDevicePage.waitForLoadState('networkidle');
      await expect(otherDevicePage).toHaveURL(
        new RegExp(`${ProfileSettingsPage.path}$`),
      );

      // A reload only reads the locally stored session. Changing the password is validated by the auth server, so it fails if the session was revoked.
      const otherDeviceSettings = new ProfileSettingsPage(otherDevicePage);
      await otherDeviceSettings.newPasswordInput.fill('NewPassword123!');
      await otherDeviceSettings.confirmPasswordInput.fill('NewPassword123!');
      await otherDeviceSettings.changePasswordButton.click();
      await expect(otherDevicePage.getByTestId('toast').first()).toHaveText(
        /Password changed successfully\./,
      );
    } finally {
      await otherDeviceContext.close();
    }
  },
);

test('Login — wrong email shows "invalid login credentials" on password field', async ({
  page,
}) => {
  const loginPage = await LoginPage.navigate(page);
  await loginPage.login('not_an_existing_account@test.com', 'some_password');

  await expect(loginPage.errorMessage).toHaveText('Invalid login credentials');
});

test('Login — wrong password shows "invalid login credentials" on password field', async ({
  page,
}) => {
  const loginPage = await LoginPage.navigate(page);
  await loginPage.login(testUsers.paidLastYear.email, 'wrong_password');

  await expect(loginPage.errorMessage).toHaveText('Invalid login credentials');
});

test('Login — already logged in redirects to profile', async ({ page }) => {
  const loginPage = await LoginPage.navigate(page);
  await loginPage.loginAsserted(
    testUsers.boardMember.email,
    testUsers.boardMember.password,
  );

  await navigateTo(page, LoginPage.path);
});
