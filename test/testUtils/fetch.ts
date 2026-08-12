import { testUsers, type TestUserKey } from '#test/TestUser';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/shared/types/database.types';
import { $fetch } from '@nuxt/test-utils/e2e';

export class ServerTestService {
  private cookies: Partial<Record<TestUserKey, string>> = {};

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  readonly fetch = async (url: string, testUser: TestUserKey) => {
    if (this.cookies[testUser] === undefined) {
      this.cookies[testUser] = await this.getTestUserAuthHeaders(testUser);
    }

    return await $fetch(url, {
      headers: {
        Cookie: `sb-127-auth-token=base64-${this.cookies[testUser]}`,
      },
    });
  };

  private readonly getTestUserAuthHeaders = async (testUser: TestUserKey) => {
    const { email, password } = testUsers[testUser];
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error)
      throw new Error(`Error signing in user ${email}:`, { cause: error });

    return btoa(JSON.stringify(data.session));
  };
}
