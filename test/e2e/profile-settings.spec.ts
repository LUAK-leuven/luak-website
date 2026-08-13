import { expect } from '@playwright/test';
import { TestUser, testUsers, type TestUserKey } from '#test/TestUser';
import {
  authStateFile,
  login,
  navigateTo,
  randomUserTest,
  test,
} from '#test/e2e/fixtures';
import { ProfileSettingsPage } from '#test/e2e/pages/profile/settings.page';
import { testServiceBuilder } from '#test/testServices';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';
import { ForgotPasswordPage } from './pages/forgot-password.page';
import { findBy, sleep } from '~/shared/utils/utils';
import dayjs, { type Dayjs } from 'dayjs';
import { ResetPasswordPage } from './pages/reset-password.page';

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

  const userInfo = await testUserService.getUserInfo(user);
  expect(userInfo.firstName).toBe('NewFirstName');
  expect(userInfo.lastName).toBe('NewLastName');
  expect(userInfo.phoneNumber).toBe('+1234567890');
  expect(userInfo.whatsApp).toBe(true);
  expect(userInfo.newsletter).toBe(true);

  await testUserService.resetTestUser(user);
});

randomUserTest(
  'Can change password via settings',
  async ({ page, context, user }) => {
    const profileSettingsPage = await ProfileSettingsPage.navigate(page);

    await profileSettingsPage.newPasswordInput.fill('NewPassword123!');
    await profileSettingsPage.confirmPasswordInput.fill('NewPassword123!');

    await profileSettingsPage.changePasswordButton.click();

    await expect(profileSettingsPage.changePasswordButton).toHaveText('check');

    const profilePage = await ProfileOverviewPage.navigate(page);
    await profilePage.logout();

    await login(
      page,
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      new TestUser({ ...testUsers[user], password: 'NewPassword123!' }),
    );

    // Reset auth storage state because changing the passord resets the aut session and hence breaks the auth state for all tests that use the same user.
    await profilePage.logout();
    await testUserService.resetTestUserPassword(user);
    await login(page, testUsers[user]);
    await context.storageState({
      path: authStateFile(user),
    });
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

      const email = await waitForEmail(user, start);

      const message = await testServiceBuilder()
        .mailpitService()
        .getMessage(email.ID);

      const passwordResetLink = extractPasswordResetLink(message.Text);

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

const waitForEmail = async (
  user: TestUserKey,
  start: Dayjs,
  timeout: number = 5_000,
) => {
  const mailpitService = testServiceBuilder().mailpitService();

  const deadline = dayjs().add(timeout, 'millisecond');
  while (dayjs().isBefore(deadline)) {
    const messages = await mailpitService.getAllMessages();
    const filteredMessages = messages.filter((message) => {
      if (message.Read) return false;
      if (message.Subject !== 'Reset your password') return false;
      if (findBy(message.To, 'Address', testUsers[user].email) === undefined)
        return false;
      if (dayjs(message.Created).isBefore(start)) return false;
      return true;
    });

    if (filteredMessages.length > 1)
      throw new Error('More than one email found');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (filteredMessages.length === 1) return filteredMessages[0]!;

    await sleep(200);
  }
  throw new Error('Timeout waiting for email');
};

const extractPasswordResetLink = (html: string) => {
  const match = html.match(/(?<=Reset password \( ).+(?= \))/);
  if (match === null)
    throw new Error('Could not extract reset link from email.');
  return match[0];
};
