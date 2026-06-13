import { expect, test } from '@playwright/test';
import { authStateFile, testUsers } from '~/tests/e2e/fixtures';
import { ProfileOverviewPage } from '~/tests/e2e/pages/profile-overview.page';

Object.entries(testUsers).forEach(([testUser, email]) => {
  test.describe(testUser, () => {
    test.use({
      storageState: authStateFile(testUser as keyof typeof testUsers),
    });

    test(`Overview page shows name`, async ({ page }) => {
      const profilePage = await ProfileOverviewPage.navigate(page);
      await expect(profilePage.hiUserName).toHaveText(`Hi ${email} 👋`);
    });
  });
});

(['unpaidMembership', 'nonMember', 'paidLastYear'] as const).forEach((user) => {
  test.describe(user, () => {
    test.use({ storageState: authStateFile(user) });

    test(`buyMembership - card is visible`, async ({ page }) => {
      const profilePage = await ProfileOverviewPage.navigate(page);

      await expect(profilePage.buyMembershipButton).toBeVisible();

      await profilePage.buyMembershipButton.click();
    });
  });
});

test.describe('paidMembership', () => {
  test.use({ storageState: authStateFile('paidMembership') });

  test('buyMembership - card is hidden and membership card is visible', async ({
    page,
  }) => {
    const profilePage = await ProfileOverviewPage.navigate(page);
    await expect(profilePage.buyMembershipButton).toBeHidden();
  });
});
