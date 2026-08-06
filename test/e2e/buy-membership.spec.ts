import { expect, type Page } from '@playwright/test';
import { authStateFile, login, test } from '#test/e2e/fixtures';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';
import { testServiceBuilder } from '#test/e2e/testUtils/testServices';
import { testUsers } from './testUtils/TestUser';
import { getCurrentMembershipYear } from '~/app/model/Membership';
import dayjs, { type Dayjs } from 'dayjs';

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
      await expect(profilePage.buyMembershipCard).toBeVisible();

      const membershipModal = await profilePage.buyMembership();
      await membershipModal.expectPrice(membershipPrice);

      await membershipModal.fillForm();
      await membershipModal.buyMembership();

      const memberships = await testServiceBuilder()
        .userTestService()
        .getMemberships(testUsers[user].email, getCurrentMembershipYear());

      expect(memberships).toHaveLength(1);
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
    await expect(profilePage.hasMembershipCard).toBeVisible();
  });
});

test.describe('paidLastYear', () => {
  const user = 'paidLastYear';

  const currentMembershipYear = getCurrentMembershipYear();
  const endOfPreviousMembershipYear = dayjs(
    `${currentMembershipYear.toFixed()}-08-31`,
  );
  const startOfNextMembershipYear = dayjs(
    `${currentMembershipYear.toFixed()}-07-01`,
  );

  test.afterEach(async () => {
    await testServiceBuilder().userTestService().resetTestMemberships();
  });

  test('after end of membership year, user has no membership and can buy a new one', async ({
    page,
  }) => {
    await setDate(page, endOfPreviousMembershipYear.add(1, 'day'));

    const profilePage = await login(page, testUsers[user]);

    await expect(profilePage.buyMembershipCard).toBeVisible();

    const membershipModal = await profilePage.buyMembership();
    await membershipModal.expectPrice(20);

    await membershipModal.fillForm();
    await membershipModal.buyMembership();

    const memberships = await testServiceBuilder()
      .userTestService()
      .getMemberships(testUsers[user].email, currentMembershipYear);

    expect(memberships).toHaveLength(1);
  });

  test('after start of new membership year, user still has active membership and can renew it', async ({
    page,
  }) => {
    await setDate(page, startOfNextMembershipYear);

    const profilePage = await login(page, testUsers[user]);

    await expect(profilePage.renewMembershipCard).toBeVisible();

    const membershipModal = await profilePage.buyMembership();
    await membershipModal.expectPrice(20);

    await membershipModal.fillForm();
    await membershipModal.buyMembership();

    const memberships = await testServiceBuilder()
      .userTestService()
      .getMemberships(testUsers[user].email, currentMembershipYear);

    expect(memberships).toHaveLength(1);
  });
});

const setDate = async (page: Page, date: Dayjs) => {
  // We need the app's date logic (dayjs()) to see the fake date, but Supabase's
  // getClaims() must NOT see it: it calls validateExp(jwt.exp) using Date.now(),
  // and the real JWT exp is only real_now+3600 — making it appear expired under
  // a faked clock, which sets currentUser to null and breaks the profile page.
  //
  // Solution: patch only `new Date()` (no-arg form, which dayjs() uses),
  // while leaving Date.now() pointing at the real clock (which validateExp uses).
  await page.addInitScript((fakeDateMs: number) => {
    const OriginalDate = Date;
    // @ts-expect-error — overriding globalThis.Date in an init script
    globalThis.Date = class FakeDate extends OriginalDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(fakeDateMs);
        } else {
          // @ts-expect-error — spreading into super()
          super(...args);
        }
      }
      static override now() {
        // Keep real time so Supabase JWT validation (validateExp) is unaffected
        return OriginalDate.now();
      }
    };
  }, date.toDate().getTime());
};
