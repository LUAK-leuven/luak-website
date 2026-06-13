import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { authStateFile, testUsers } from '../fixtures';
import { testServiceBuilder } from '../testUtils/testServices';

test('clean db', async () => {
  const { testDao } = testServiceBuilder();
  await testDao().cleanInventoryEvents();
  await testDao().clearRentals();
});

Object.entries(testUsers).forEach(([userKey, userEmail]) => {
  test(`login test users - ${userKey}`, async ({ page, context }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsserted(userEmail);

    await context.storageState({
      path: authStateFile(userKey as keyof typeof testUsers),
    });
  });
});
