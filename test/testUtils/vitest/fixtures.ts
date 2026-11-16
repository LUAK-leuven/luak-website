import { test as baseTest } from 'vitest';

import { aRandomTestUser } from '#test/builders/user';
import { testServiceBuilder } from '#test/testServices';

const userService = testServiceBuilder().userTestService();

export const generatedUserTest = baseTest.extend(
  'user',
  async (_, { onCleanup }) => {
    const user = aRandomTestUser();
    await userService.createUser(user);

    onCleanup(async () => {
      await userService.deleteUser(user).catch((error: unknown) => {
        console.warn(`Could not delete generated user ${user.email}:`, error);
      });
    });

    return user;
  },
);
