import type { Page } from '@playwright/test';
import { LoginPage } from '#test/e2e/pages/login.page';
import { testServiceBuilder } from '#test/testServices';
import { testUsers, type TestUser, type TestUserKey } from '#test/TestUser';
import { test as base, expect } from '@playwright/test';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';
import { randomOf } from '~/shared/utils/utils';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Block external requests to Google Calendar and Google Fonts because they are not needed for the tests and can cause flakiness.
    await page.route('**://calendar.google.com/**', (route) => route.abort());
    await page.route('**://fonts.googleapis.com/css**', (route) =>
      route.abort(),
    );

    await use(page);
  },
});

export const randomUserTest = test.extend<{
  user: TestUserKey;
}>({
  // eslint-disable-next-line no-empty-pattern
  user: async ({}, use) => {
    const user = randomOf(Object.keys(testUsers)) as TestUserKey;
    await use(user);
  },
  storageState: async ({ user }, use) => {
    await use(authStateFile(user));
  },
});

export async function login(page: Page, user: TestUser) {
  const loginPage = new LoginPage(page);
  await loginPage.loginAsserted(user.email, user.password);
  const profilePage = new ProfileOverviewPage(page);
  await expect(profilePage.hiUserName).toBeVisible();
  return profilePage;
}

export function authStateFile(user: TestUserKey) {
  return `./test/e2e/.auth/${user}.json`;
}

export async function navigateTo(page: Page, url: string) {
  await page.goto(url);
}

export async function cleanDatabase() {
  const testDao = testServiceBuilder().testDao();

  await testDao.cleanInventoryEvents();
  await testDao.clearRentals();
}
