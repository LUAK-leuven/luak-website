import { testDao } from '~/tests/e2e/testDao';
import { test } from '@playwright/test';

test('clean db', async () => {
  await testDao().clearRentals();
});
