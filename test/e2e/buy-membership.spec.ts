import { expect } from '@playwright/test';
import { authStateFile, login, test } from '#test/e2e/fixtures';
import { ProfileOverviewPage } from '#test/e2e/pages/profile-overview.page';
import { testServiceBuilder } from '#test/e2e/testUtils/testServices';
import { testUsers } from './testUtils/TestUser';
import { getCurrentMembershipYear } from '~/app/model/Membership';
import dayjs from 'dayjs';

(
  [
    { user: 'unpaidMembership', membershipPrice: 15 },
    { user: 'nonMember', membershipPrice: 15 },
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
        .getMemberships(testUsers[user].email, getCurrentMembershipYear());

      // testUser unpaidMembership has already a membership, so here we also test that the membership is updated and not a new one created. But it should be made more explicit.
      expect(memberships).toHaveLength(1);
      expect(memberships[0]?.year).toBe(getCurrentMembershipYear());
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

test.describe('paidLastYear', () => {
  const user = 'paidLastYear';
  // test.use({ storageState: authStateFile(user) });

  const currentMembershipYear = getCurrentMembershipYear();
  const endOfPreviousMembershipYear = dayjs(
    `${(currentMembershipYear + 1).toFixed()}-08-31`,
  );
  const startOfNextMembershipYear = dayjs(
    `${(currentMembershipYear + 1).toFixed()}-07-01`,
  );

  test.afterEach(async () => {
    await testServiceBuilder().userTestService().resetTestMemberships();
  });

  test('after end of membership year, user has no membership and can buy a new one', async ({
    page,
  }) => {
    await page.clock.install({
      time: endOfPreviousMembershipYear
        .add(1, 'day')
        .subtract(1, 'minute')
        .toDate(),
    });

    const profilePage = await login(page, testUsers[user]);

    await page.clock.pauseAt(
      endOfPreviousMembershipYear.add(1, 'day').toDate(),
    );

    await expect(profilePage.buyMembershipButton).toBeVisible();

    const membershipModal = await profilePage.buyMembership();
    await membershipModal.expectPrice(20);

    await membershipModal.fillForm();
    await membershipModal.buyMembership();

    const memberships = await testServiceBuilder()
      .userTestService()
      .getMemberships(testUsers[user].email, getCurrentMembershipYear());

    // testUser unpaidMembership has already a membership, so here we also test that the membership is updated and not a new one created. But it should be made more explicit.
    expect(memberships).toHaveLength(1);
    expect(memberships[0]?.year).toBe(getCurrentMembershipYear());
  });

  test('after start of new membership year, user still has active membership and can renew it', async ({
    page,
  }) => {
    await page.clock.setFixedTime(startOfNextMembershipYear.toDate());
  });
});
