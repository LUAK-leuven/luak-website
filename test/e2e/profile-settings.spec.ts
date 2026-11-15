import { expect } from '@playwright/test';
import dayjs from 'dayjs';

import { findBy, sleep } from '#shared/utils/utils';
import { generatedUserTest, navigateTo } from '#test/e2e/fixtures';
import { LoginPage } from '#test/e2e/pages/login.page';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';
import { ProfileSettingsPage } from '#test/e2e/pages/profile/settings.page';
import { ResetPasswordPage } from '#test/e2e/pages/reset-password.page';
import { testServiceBuilder } from '#test/testServices';
import { TestUser } from '#test/TestUser';

const testUserService = testServiceBuilder().userTestService();

generatedUserTest('Can change user information', async ({ luakPage, user }) => {
  await luakPage.login(user);
  const profileSettingsPage = await luakPage.toMySettings();

  await profileSettingsPage.firstNameInput.fill('NewFirstName');
  await profileSettingsPage.lastNameInput.fill('NewLastName');
  await profileSettingsPage.phoneNumberInput.fill('+1234567890');
  await profileSettingsPage.whatsAppCheckbox.check();
  await profileSettingsPage.newsletterCheckbox.check();

  await profileSettingsPage.changeInfoButton.click();

  await expect(profileSettingsPage.changeInfoButton).toHaveText('check');
  await sleep(200);

  const userInfo = await testUserService.getUserInfo(user.email);
  expect(userInfo.firstName).toBe('NewFirstName');
  expect(userInfo.lastName).toBe('NewLastName');
  expect(userInfo.phoneNumber).toBe('+1234567890');
  expect(userInfo.whatsApp).toBe(true);
  expect(userInfo.newsletter).toBe(true);
});

generatedUserTest(
  'Can change password via settings',
  async ({ luakPage, user }) => {
    await luakPage.login(user);
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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: 'NewPassword123!',
      }),
    );
  },
);

generatedUserTest(
  'Change password with a revoked session redirects to login and back after logging in again',
  async ({ page, luakPage, user }) => {
    await luakPage.login(user);
    const profileSettingsPage = await luakPage.toMySettings();
    await testUserService.revokeAllSessions(user);

    await profileSettingsPage.newPasswordInput.fill('NewPassword123!');
    await profileSettingsPage.confirmPasswordInput.fill('NewPassword123!');
    await profileSettingsPage.changePasswordButton.click();

    await expect(page).toHaveURL(`/login?redirect=${ProfileSettingsPage.path}`);
    await expect(luakPage.toastMessage).toHaveText(
      /Your session has expired\. Please log in again\./,
    );

    const loginPage = new LoginPage(page);
    await loginPage.login(user.email, user.password);
    await page.waitForURL(ProfileSettingsPage.path);
  },
);

generatedUserTest(
  'Change info with a revoked session saves silently and stays on settings',
  async ({ page, luakPage, user }) => {
    await luakPage.login(user);
    const profileSettingsPage = await luakPage.toMySettings();
    await testUserService.revokeAllSessions(user);

    await profileSettingsPage.firstNameInput.fill('NewFirstName');
    await profileSettingsPage.changeInfoButton.click();

    // Not a redirect: the info update only needs a valid, unexpired access token at the database layer, which the revoked session still has locally, so it succeeds without the app noticing the session is gone.
    await expect(page).toHaveURL(ProfileSettingsPage.path);
    await expect(profileSettingsPage.changeInfoButton).toHaveText('check');

    const userInfo = await testUserService.getUserInfo(user.email);
    expect(userInfo.firstName).toBe('NewFirstName');
  },
);

generatedUserTest(
  'Forgot password - can reset password via email',
  async ({ page, luakPage, user }) => {
    const start = dayjs();
    const forgotPasswordPage = await luakPage.toForgotPasswordPage();
    await forgotPasswordPage.emailInput.fill(user.email);
    await forgotPasswordPage.emailInput.press('Enter');
    await expect(forgotPasswordPage.submitButton).toHaveText('check');

    const mailpitService = testServiceBuilder().mailpitService();
    const email = await mailpitService.waitForEmail((message) => {
      if (message.Read) return false;
      if (message.Subject !== 'Reset your LUAK password') return false;
      if (findBy(message.To, 'Address', user.email) === undefined) return false;
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

    await luakPage.login(user.copy({ password: 'my new password :)' }));
  },
);

const extractPasswordResetLink = (text: string) => {
  const match = text.match(/(?<=Reset password \( ).+(?= \))/);
  if (match === null)
    throw new Error('Could not extract reset link from email.');
  return match[0];
};
