import { configDotenv } from 'dotenv';

import { testServiceBuilder } from '#test/testServices';

configDotenv({ path: '.env.local', quiet: true });

export default async function globalSetup() {
  const { testDao } = testServiceBuilder();
  await testDao().clearRentals();
  await testDao().cleanInventoryEvents();
}
