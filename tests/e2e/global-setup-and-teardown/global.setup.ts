import { authStateFile, login, test } from '../fixtures';
import { testServiceBuilder } from '../testUtils/testServices';
import { testUsers } from '../testUtils/TestUser';

test('clean db', async () => {
  const { testDao, userTestService } = testServiceBuilder();
  await testDao().cleanInventoryEvents();
  await testDao().clearRentals();
  await userTestService().resetTestMemberships();
});

test('wait for nuxt server to be ready', async () => {
  const routes = ['/', '/login', '/profile'];
  await Promise.all(routes.map((r) => fetch(new URL(r, process.env.BASE_URL))));
});

if (process.env.SKIP_LOGIN_SETUP !== 'true') {
  Object.entries(testUsers).forEach(([userKey, testUser]) => {
    test(`login test users - ${userKey}`, async ({ page, context }) => {
      await login(page, testUser);

      await context.storageState({
        path: authStateFile(userKey as keyof typeof testUsers),
      });
    });
  });
}
