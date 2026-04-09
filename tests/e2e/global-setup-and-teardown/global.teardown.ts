import { testDao } from '~/tests/e2e/global-setup-and-teardown/testDao';
import { test } from '@playwright/test';

test('clean db', async () => {
  await testDao().clearRentals();
});
