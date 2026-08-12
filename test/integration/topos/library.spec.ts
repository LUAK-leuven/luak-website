import { test } from 'vitest';
import { $fetch, setup } from '@nuxt/test-utils/e2e';
import { testServiceBuilder } from '#test/testServices';
import { configDotenv } from 'dotenv';
import { testUsers, type TestUserKey } from '~/test/testUtils/TestUser';

configDotenv({ path: '.env.local', quiet: true });

await setup({ host: 'http://localhost:3000' });

test('Does not return topos with total amount 0 for non-board members', async () => {
  const headers = await getTestUserAuthHeaders('paidMembership');

  const library = await $fetch('/api/topos/library', { headers });
  console.log('library', library);
});

const getTestUserAuthHeaders = async (testUser: TestUserKey) => {
  const supabase = testServiceBuilder().supabase();

  const { email, password } = testUsers[testUser];
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error)
    throw new Error(`Error signing in user ${email}:`, { cause: error });

  const cookie = `sb-127-auth-token=base64-${btoa(JSON.stringify(data.session))}`;
  console.log('cookie', cookie);

  return { Cookie: cookie };
};
