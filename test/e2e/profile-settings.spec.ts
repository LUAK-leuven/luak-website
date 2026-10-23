import { expect } from '@playwright/test';
import { TestUser, testUsers } from '#test/TestUser';
import {
  authStateFile,
  login,
  navigateTo,
  generatedUserTest,
  randomUserTest,
  test,
} from '#test/e2e/fixtures';
import { LoginPage } from '#test/e2e/pages/login.page';
import { ProfileSettingsPage } from '#test/e2e/pages/profile/settings.page';
import { testServiceBuilder } from '#test/testServices';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';
import { ForgotPasswordPage } from '#test/e2e/pages/forgot-password.page';
import { findBy, sleep } from '#shared/utils/utils';
import dayjs from 'dayjs';
import { ResetPasswordPage } from '#test/e2e/pages/reset-password.page';

const testUserService = testServiceBuilder().userTestService();

randomUserTest('Can change user information', async ({ page, user }) => {
  const profileSettingsPage = await ProfileSettingsPage.navigate(page);

  await profileSettingsPage.firstNameInput.fill('NewFirstName');
  await profileSettingsPage.lastNameInput.fill('NewLastName');
  await profileSettingsPage.phoneNumberInput.fill('+1234567890');
  await profileSettingsPage.whatsAppCheckbox.check();
  await profileSettingsPage.newsletterCheckbox.check();

  await profileSettingsPage.changeInfoButton.click();

  await expect(profileSettingsPage.changeInfoButton).toHaveText('check');
  await sleep(200);

  const userInfo = await testUserService.getUserInfo(testUsers[user].email);
  expect(userInfo.firstName).toBe('NewFirstName');
  expect(userInfo.lastName).toBe('NewLastName');
  expect(userInfo.phoneNumber).toBe('+1234567890');
  expect(userInfo.whatsApp).toBe(true);
  expect(userInfo.newsletter).toBe(true);

  await testUserService.resetTestUserInfo(user);
});

generatedUserTest(
  'Can change password via settings',
  async ({ luakPage, generatedUser }) => {
    await luakPage.login(generatedUser);

    const profileSettingsPage = await luakPage.toMySettings();

    await profileSettingsPage.newPasswordInput.fill('NewPassword123!');
    await profileSettingsPage.confirmPasswordInput.fill('NewPassword123!');

    await profileSettingsPage.changePasswordButton.click();

    await expect(luakPage.toastMessage).toHaveText(
      /Password changed successfully\./,
    );
    await expect(profileSettingsPage.changePasswordButton).toHaveText('check');

    const profilePage = await luakPage.toMyProfile();
    await profilePage.logout();

    await luakPage.login(
      new TestUser({
        firstName: generatedUser.firstName,
        lastName: generatedUser.lastName,
        email: generatedUser.email,
        password: 'NewPassword123!',
      }),
    );
  },
);

generatedUserTest(
  'Change password with a revoked session redirects to login and back after logging in again',
  async ({ page, luakPage, generatedUser }) => {
    await luakPage.login(generatedUser);
    const profileSettingsPage = await luakPage.toMySettings();
    await testUserService.revokeAllSessions(generatedUser);

    await profileSettingsPage.newPasswordInput.fill('NewPassword123!');
    await profileSettingsPage.confirmPasswordInput.fill('NewPassword123!');
    await profileSettingsPage.changePasswordButton.click();

    await expect(page).toHaveURL(`/login?redirect=${ProfileSettingsPage.path}`);
    await expect(luakPage.toastMessage).toHaveText(
      /Your session has expired\. Please log in again\./,
    );

    const loginPage = new LoginPage(page);
    await loginPage.login(generatedUser.email, generatedUser.password);
    await page.waitForURL(ProfileSettingsPage.path);
  },
);

generatedUserTest(
  'Change info with a revoked session saves silently and stays on settings',
  async ({ page, luakPage, generatedUser }) => {
    await luakPage.login(generatedUser);
    const profileSettingsPage = await luakPage.toMySettings();
    await testUserService.revokeAllSessions(generatedUser);

    await profileSettingsPage.firstNameInput.fill('NewFirstName');
    await profileSettingsPage.changeInfoButton.click();

    // Not a redirect: the info update only needs a valid, unexpired access token at the database layer, which the revoked session still has locally, so it succeeds without the app noticing the session is gone.
    await expect(page).toHaveURL(ProfileSettingsPage.path);
    await expect(profileSettingsPage.changeInfoButton).toHaveText('check');

    const userInfo = await testUserService.getUserInfo(generatedUser.email);
    expect(userInfo.firstName).toBe('NewFirstName');
  },
);

test.describe('Forgot password', () => {
  test.use({ storageState: undefined });

  randomUserTest(
    'Can reset password via email',
    async ({ page, context, user }) => {
      const start = dayjs();
      const forgotPasswordPage = await ForgotPasswordPage.navigate(page);
      await forgotPasswordPage.emailInput.fill(testUsers[user].email);
      await forgotPasswordPage.emailInput.press('Enter');
      await expect(forgotPasswordPage.submitButton).toHaveText('check');

      const mailpitService = testServiceBuilder().mailpitService();
      const email = await mailpitService.waitForEmail((message) => {
        if (message.Read) return false;
        if (message.Subject !== 'Reset your LUAK password') return false;
        if (findBy(message.To, 'Address', testUsers[user].email) === undefined)
          return false;
        if (dayjs(message.Created).isBefore(start)) return false;
        return true;
      });

      const passwordResetLink = extractPasswordResetLink(email.Text);

      await navigateTo(page, passwordResetLink);
      const resetPasswordPage = new ResetPasswordPage(page);

      await resetPasswordPage.newPasswordInput.fill('my new password :)');
      await resetPasswordPage.changePasswordInput.fill('my new password :)');
      await resetPasswordPage.submitButton.click();

      await page.waitForURL(ProfileOverviewPage.path);
      const profilePage = new ProfileOverviewPage(page);
      await expect(profilePage.hiUserName).toBeVisible();

      await profilePage.logout();

      await login(
        page,
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        new TestUser({ ...testUsers[user], password: 'my new password :)' }),
      );

      await profilePage.logout();
      await testUserService.resetTestUserPassword(user);
      await login(page, testUsers[user]);
      await context.storageState({
        path: authStateFile(user),
      });
    },
  );
});

const extractPasswordResetLink = (text: string) => {
  const match = text.match(/(?<=Reset password \( ).+(?= \))/);
  if (match === null)
    throw new Error('Could not extract reset link from email.');
  return match[0];
};
