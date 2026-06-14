import { test } from '@playwright/test';
import { authStateFile, login } from '../fixtures';
import { testServiceBuilder } from '../testUtils/testServices';
import { testUsers } from '../testUtils/TestUser';

test('clean db', async () => {
  const { testDao, userTestService } = testServiceBuilder();
  await testDao().cleanInventoryEvents();
  await testDao().clearRentals();
  await userTestService().resetTestMemberships();
});

Object.entries(testUsers).forEach(([userKey, testUser]) => {
  test(`login test users - ${userKey}`, async ({ page, context }) => {
    await login(page, testUser);

    await context.storageState({
      path: authStateFile(userKey as keyof typeof testUsers),
    });
  });
});
