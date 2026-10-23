import { afterEach, expect, test } from 'vitest';
import type { AuthError, Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#shared/types/database.types';
import {
  createSupabaseClientForTests,
  testServiceBuilder,
} from '#test/testServices';
import { TestUser } from '#test/TestUser';
import { isSessionGoneError } from '~/utils/isSessionGoneError';

const NEW_PASSWORD = 'NewPassword123!';
const WEAK_PASSWORD = '123';

const createdUsers: TestUser[] = [];

const createGeneratedUser = async () => {
  const user = new TestUser({
    firstName: 'Session',
    lastName: 'Gone',
    email: `session_gone_${crypto.randomUUID()}@test.com`,
  });
  createdUsers.push(user);
  await testServiceBuilder().userTestService().createUser(user);
  return user;
};

const signIn = async (
  client: SupabaseClient<Database>,
  user: TestUser,
): Promise<Session> => {
  const { data, error } = await client.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  expect(error).toBeNull();
  if (data.session === null) throw new Error(`No session for ${user.email}`);
  return data.session;
};

const expectSessionGone = (error: AuthError | null) => {
  if (error === null) throw new Error('Expected an error, got success');
  expect(isSessionGoneError(error)).toBe(true);
};

const expectNotSessionGone = (error: AuthError | null) => {
  if (error === null) throw new Error('Expected an error, got success');
  expect(isSessionGoneError(error)).toBe(false);
};

afterEach(async () => {
  const userTestService = testServiceBuilder().userTestService();
  for (const user of createdUsers.splice(0)) {
    await userTestService.deleteUser(user).catch((error: unknown) => {
      console.warn(`Could not delete generated user ${user.email}:`, error);
    });
  }
});

test('isSessionGoneError classifies the error of a session revoked by a global sign-out', async () => {
  const user = await createGeneratedUser();

  const revokingClient = createSupabaseClientForTests();
  const revokedClient = createSupabaseClientForTests();
  await signIn(revokingClient, user);
  await signIn(revokedClient, user);

  const { error: signOutError } = await revokingClient.auth.signOut({
    scope: 'global',
  });
  expect(signOutError).toBeNull();

  const { error } = await revokedClient.auth.updateUser({
    password: NEW_PASSWORD,
  });

  expectSessionGone(error);
});

test('isSessionGoneError classifies the error of a refresh token revoked by a global sign-out', async () => {
  const user = await createGeneratedUser();

  const client = createSupabaseClientForTests();
  const { refresh_token: revokedRefreshToken } = await signIn(client, user);

  const revokingClient = createSupabaseClientForTests();
  await signIn(revokingClient, user);
  const { error: signOutError } = await revokingClient.auth.signOut({
    scope: 'global',
  });
  expect(signOutError).toBeNull();

  const refreshingClient = createSupabaseClientForTests();
  const { error } = await refreshingClient.auth.refreshSession({
    refresh_token: revokedRefreshToken,
  });

  expectSessionGone(error);
});

test('isSessionGoneError does not classify a weak password error as session gone', async () => {
  const user = await createGeneratedUser();
  const client = createSupabaseClientForTests();
  await signIn(client, user);

  const { error } = await client.auth.updateUser({ password: WEAK_PASSWORD });

  expectNotSessionGone(error);
});

test('isSessionGoneError classifies the error of an authenticated request without a session', async () => {
  const clientWithoutSession = createSupabaseClientForTests();

  const { error } = await clientWithoutSession.auth.updateUser({
    password: NEW_PASSWORD,
  });

  expectSessionGone(error);
});
