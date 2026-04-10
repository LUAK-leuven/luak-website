import { expect, test } from '@playwright/test';
import { login, testUsers } from '~/tests/e2e/fixtures';
import { LoginPage } from '~/tests/e2e/pages/login.page';
import { ProfileOverviewPage } from '~/tests/e2e/pages/profile-overview.page';

Object.entries(testUsers).forEach(async ([testUser, email]) => {
  test(`${testUser} - overview page shows name`, async ({ page }) => {
    await login(page, email);
    const profilePage = new ProfileOverviewPage(page);
    await expect(profilePage.hiUserName).toHaveText(`Hi ${email} 👋`);
  });
});

[
  testUsers.unpaidMembership,
  testUsers.nonMember,
  testUsers.paidLastYear,
].forEach((user) => {
  test.describe(`${user}`, async () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.loginAsserted(testUsers.boardMember);
    });

    test(`buyMembership - card is visible`, async ({ page }) => {
      const profilePage = new ProfileOverviewPage(page);
      console.log(await page.getByTestId('page.title').innerText());
      await expect(profilePage.buyMembershipButton).toBeVisible();

      await profilePage.buyMembershipButton.click();
    });
  });
});

test('buyMembership - card is hidden and membership card is visible', async ({
  page,
}) => {
  await login(page, testUsers.paidMembership);
  const profilePage = new ProfileOverviewPage(page);
  await expect(profilePage.buyMembershipButton).toBeHidden();
});
