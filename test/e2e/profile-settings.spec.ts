import test, { expect } from '@playwright/test';
import {
  TestUser,
  testUsers,
  type TestUserKey,
} from '#test/e2e/testUtils/TestUser';
import { randomOf } from '~/shared/utils/utils';
import { authStateFile, login } from '#test/e2e/fixtures';
import { ProfileSettingsPage } from '#test/e2e/pages/profile/settings.page';
import { testServiceBuilder } from '#test/e2e/testUtils/testServices';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';

const user = randomOf(Object.keys(testUsers)) as TestUserKey;

test.use({ storageState: authStateFile(user) });

test.afterEach(async () => {
  await testServiceBuilder().userTestService().resetTestUser(user);
});

test('Can change user information', async ({ page }) => {
  const profileSettingsPage = await ProfileSettingsPage.navigate(page);

  await profileSettingsPage.firstNameInput.fill('NewFirstName');
  await profileSettingsPage.lastNameInput.fill('NewLastName');
  await profileSettingsPage.phoneNumberInput.fill('+1234567890');
  await profileSettingsPage.whatsAppCheckbox.check();
  await profileSettingsPage.newsletterCheckbox.check();

  await profileSettingsPage.changeInfoButton.click();

  await expect(profileSettingsPage.changeInfoButton).toHaveText('check');

  const userInfo = await testServiceBuilder()
    .userTestService()
    .getUserInfo(user);
  expect(userInfo.firstName).toBe('NewFirstName');
  expect(userInfo.lastName).toBe('NewLastName');
  expect(userInfo.phoneNumber).toBe('+1234567890');
  expect(userInfo.whatsApp).toBe(true);
  expect(userInfo.newsletter).toBe(true);
});

// Changing password resets the auth session hence breaking all logins on the same user because the shared auth state re-uses the session
test.fixme('Can change password', async ({ page }) => {
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

  // TODO: Test the actual password reset with the email reset link etc.
  // -> I don't know how to do this on a local environment because atm no mail is sent and the password is immediately reset.
});
