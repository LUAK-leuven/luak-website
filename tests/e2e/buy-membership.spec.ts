import { expect, test } from '@playwright/test';
import { authStateFile } from '~/tests/e2e/fixtures';
import { ProfileOverviewPage } from '~/tests/e2e/pages/profile-overview.page';
import { testServiceBuilder } from './testUtils/testServices';
import getLuakYear from '~/utils/getLuakYear';
import { testUsers } from './testUtils/TestUser';

(
  [
    { user: 'unpaidMembership', membershipPrice: 15 },
    { user: 'nonMember', membershipPrice: 15 },
    { user: 'paidLastYear', membershipPrice: 20 },
  ] as const
).forEach(({ user, membershipPrice }) => {
  test.describe(user, () => {
    test.use({ storageState: authStateFile(user) });

    test.afterAll(async () => {
      await testServiceBuilder().userTestService().resetTestMemberships();
    });

    test(`can buy a membership`, async ({ page }) => {
      const profilePage = await ProfileOverviewPage.navigate(page);

      await expect(profilePage.hiUserName).toHaveText(
        `Hi ${testUsers[user].firstName} 👋`,
      );
      await expect(profilePage.buyMembershipButton).toBeVisible();

      const membershipModal = await profilePage.buyMembership();
      await membershipModal.expectPrice(membershipPrice);

      await membershipModal.fillForm();
      await membershipModal.buyMembership();

      const memberships = await testServiceBuilder()
        .userTestService()
        .getMemberships(testUsers[user].email);

      // testUser unpaidMembership has already a membership, so here we also test that the membership is updated and not a new one created. But it should be made more explicit.
      expect(memberships).toHaveLength(1);
      expect(memberships[0]?.year).toBe(getLuakYear());
    });
  });
});

test.describe('paidMembership', () => {
  test.use({ storageState: authStateFile('paidMembership') });

  test('buyMembership - card is hidden and membership card is visible', async ({
    page,
  }) => {
    const profilePage = await ProfileOverviewPage.navigate(page);

    await expect(profilePage.hiUserName).toHaveText(
      `Hi ${testUsers.paidMembership.firstName} 👋`,
    );
    await expect(profilePage.buyMembershipButton).toBeHidden();
  });
});
