import { TestDao } from '~/tests/e2e/global-setup-and-teardown/testDao';
import { test } from '@playwright/test';
import { getSupabaseClientForTests } from './validateSupabaseUrl';
import { LoginPage } from '../pages/login.page';
import { authStateFile, testUsers } from '../fixtures';

test('clean db', async () => {
  const supabase = getSupabaseClientForTests();
  if (supabase === null) {
    console.warn(
      'Supabase client is not available. Skipping database cleanup.',
    );
  } else {
    const testDao = new TestDao(supabase);
    await testDao.cleanInventoryEvents();
    await testDao.clearRentals();
  }
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
