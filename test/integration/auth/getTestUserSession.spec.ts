import { beforeAll, expect, test } from 'vitest';
import { testServiceBuilder } from '#test/testServices';
import { testUsers } from '#test/TestUser';

beforeAll(async () => {
  await testServiceBuilder()
    .userTestService()
    .getTestUserSession('paidMembership');
});

test('getTestUserSession keeps another session of the same user valid', async () => {
  const { supabase, userTestService } = testServiceBuilder();
  const { email, password } = testUsers.paidMembership;
  const { data, error } = await supabase().auth.signInWithPassword({
    email,
    password,
  });
  expect(error).toBeNull();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error(`No session returned for ${email}`);

  await userTestService().getTestUserSession('paidMembership');

  const { error: userError } = await supabase().auth.getUser(accessToken);
  expect(userError).toBeNull();
});
