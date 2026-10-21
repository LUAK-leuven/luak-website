import type { Page } from '@playwright/test';
import { LoginPage } from '#test/e2e/pages/login.page';
import { testServiceBuilder } from '#test/testServices';
import { testUsers, TestUser, type TestUserKey } from '#test/TestUser';
import { test as base, expect } from '@playwright/test';
import { randomOf } from '#shared/utils/utils';
import { AppPage } from '#test/e2e/pages/app.page';

export const test = base.extend<{
  luakPage: AppPage;
}>({
  page: async ({ page }, use) => {
    // Block external requests to Google Calendar and Google Fonts because they are not needed for the tests and can cause flakiness.
    await page.route('**://calendar.google.com/**', (route) => route.abort());
    await page.route('**://fonts.googleapis.com/css**', (route) =>
      route.abort(),
    );

    await use(page);
  },
  luakPage: async ({ page }, use) => {
    await use(new AppPage(page));
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

export const generatedUserTest = test.extend<{
  generatedUser: TestUser;
}>({
  // eslint-disable-next-line no-empty-pattern
  generatedUser: async ({}, use) => {
    const userTestService = testServiceBuilder().userTestService();
    const user = new TestUser({
      firstName: 'Generated',
      lastName: 'User',
      email: `generated_${crypto.randomUUID()}@test.com`,
    });

    await userTestService.createUser(user);
    try {
      await use(user);
    } finally {
      await userTestService.deleteUser(user).catch((error: unknown) => {
        console.warn(`Could not delete generated user ${user.email}:`, error);
      });
    }
  },
});

export async function login(page: Page, user: TestUser) {
  const loginPage = await LoginPage.navigate(page);
  const profilePage = await loginPage.loginAsserted(user.email, user.password);
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
