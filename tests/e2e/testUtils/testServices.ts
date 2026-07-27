import { validateSupabaseUrl } from '../global-setup-and-teardown/validateSupabaseUrl';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import { TestDao } from './testDao';
import { TestUserService } from './TestUserService';

function getSupabaseClientForTests() {
  if (
    !process.env.NUXT_PUBLIC_SUPABASE_URL ||
    !process.env.NUXT_SUPABASE_SECRET_KEY
  ) {
    throw new Error(
      'Supabase environment variables are not set. Please set NUXT_PUBLIC_SUPABASE_URL and NUXT_SUPABASE_SECRET_KEY.',
    );
  }
  validateSupabaseUrl(process.env.NUXT_PUBLIC_SUPABASE_URL);
  const supabase = createClient<Database>(
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    process.env.NUXT_SUPABASE_SECRET_KEY, // IMPORTANT: secret key in order to bypass RLS
  );
  return supabase;
}

const useSingleton = <T>(create: () => T) => {
  let instance: T | undefined = undefined;
  return () => {
    if (instance === undefined) instance = create();
    return instance;
  };
};

export const testServiceBuilder = useSingleton(() => {
  const supabase = useSingleton(() => getSupabaseClientForTests());

  const testDao = useSingleton(() => new TestDao(supabase()));
  const userTestService = useSingleton(() => new TestUserService(supabase()));
  return { testDao, userTestService };
});
