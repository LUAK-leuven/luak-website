import { configDotenv } from 'dotenv';

import { testServiceBuilder } from '#test/testServices';

configDotenv({ path: '.env.local', quiet: true });

export default async function globalSetup() {
  const { testDao, userTestService } = testServiceBuilder();
  await testDao().clearRentals();
  await testDao().cleanInventoryEvents();
  await userTestService().resetTestUsers();
}
