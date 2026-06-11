import { TestDao } from '~/tests/e2e/global-setup-and-teardown/testDao';
import { test } from '@playwright/test';
import { getSupabaseClientForTests } from './validateSupabaseUrl';

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
