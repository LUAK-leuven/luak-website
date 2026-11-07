import { authStateFile, login, test } from '#test/e2e/fixtures';
import { testServiceBuilder } from '#test/testServices';
import { testUserKeys, testUsers } from '#test/TestUser';

test('clean db', async () => {
  const { testDao, userTestService } = testServiceBuilder();
  await testDao().cleanInventoryEvents();
  await testDao().clearRentals();
  await userTestService().resetTestUsers();
});

if (process.env.SKIP_LOGIN_SETUP !== 'true') {
  testUserKeys.forEach((userKey) => {
    test(`login test users - ${userKey}`, async ({ page, context }) => {
      await login(page, testUsers[userKey]);

      await context.storageState({
        path: authStateFile(userKey),
      });
    });
  });
}
