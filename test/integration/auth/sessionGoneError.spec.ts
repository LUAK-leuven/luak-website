import { afterAll, expect, test } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#shared/types/database.types';
import {
  createSupabaseClientForTests,
  testServiceBuilder,
} from '#test/testServices';
import { TestUser } from '#test/TestUser';
import { isSessionGoneError } from '~/utils/isSessionGoneError';

const NEW_PASSWORD = 'NewPassword123!';

const signIn = async (client: SupabaseClient<Database>, user: TestUser) => {
  const { error } = await client.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  expect(error).toBeNull();
};

const generatedUser = new TestUser({
  firstName: 'Session',
  lastName: 'Gone',
  email: `session_gone_${crypto.randomUUID()}@test.com`,
});

afterAll(async () => {
  await testServiceBuilder()
    .userTestService()
    .deleteUser(generatedUser)
    .catch((error: unknown) => {
      console.warn(
        `Could not delete generated user ${generatedUser.email}:`,
        error,
      );
    });
});

test('isSessionGoneError classifies the error of a session revoked by a global sign-out', async () => {
  const userTestService = testServiceBuilder().userTestService();
  await userTestService.createUser(generatedUser);

  const revokingClient = createSupabaseClientForTests();
  const revokedClient = createSupabaseClientForTests();
  await signIn(revokingClient, generatedUser);
  await signIn(revokedClient, generatedUser);

  const { error: signOutError } = await revokingClient.auth.signOut({
    scope: 'global',
  });
  expect(signOutError).toBeNull();

  const { error } = await revokedClient.auth.updateUser({
    password: NEW_PASSWORD,
  });

  expect(error).not.toBeNull();
  expect(isSessionGoneError(error)).toBe(true);
});
