import { expect, test } from '@playwright/test';
import { TestUser, testUsers, type TestUserKey } from '#test/TestUser';
import { randomOf } from '~/shared/utils/utils';
import { authStateFile, login } from '#test/e2e/fixtures';
import { ProfileSettingsPage } from '#test/e2e/pages/profile/settings.page';
import { testServiceBuilder } from '#test/testServices';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';

const user = randomOf(Object.keys(testUsers)) as TestUserKey;
// const user: TestUserKey = 'boardMember';

const testUserService = testServiceBuilder().userTestService();

test.use({ storageState: authStateFile(user) });

test('Can change user information', async ({ page }) => {
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

test.describe(`Password change - ${user}`, () => {
  test('Can change password via settings', async ({ page, context }) => {
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
    await testUserService.resetTestUserPassword(user);
    await context.storageState({
      path: authStateFile(user),
    });
  });

  // TODO: Test the actual password reset with the email reset link etc.
  // -> I don't know how to do this on a local environment because atm no mail is sent and the password is immediately reset.
});
