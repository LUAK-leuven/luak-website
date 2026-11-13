import { createClient } from '@supabase/supabase-js';

import { serviceBuilder } from '#server/serviceBuilder';
import type { Database } from '#shared/types/database.types';
import { ServerTestService } from '#test/fetch';
import { MailpitService } from '#test/MailpitService';
import { RentalTestRepository } from '#test/rental/getSeededData';
import { TestDao } from '#test/testDao';
import { TestUserService } from '#test/TestUserService';
import { validateSupabaseUrl } from '#test/validateSupabaseUrl';

export const createSupabaseClientForTests = () => {
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
};

const useSingleton = <T>(create: () => T) => {
  let instance: T | undefined = undefined;
  return () => {
    if (instance === undefined) instance = create();
    return instance;
  };
};

export const testServiceBuilder = useSingleton(() => {
  const supabase = useSingleton(() => createSupabaseClientForTests());

  const testDao = useSingleton(() => new TestDao(supabase()));
  const prodServiceBuilder = serviceBuilder(supabase());
  const rentalTestRepository = useSingleton(
    () => new RentalTestRepository(prodServiceBuilder.rentalItemRepo()),
  );
  const userTestService = useSingleton(() => new TestUserService(supabase()));

  const serverTestService = useSingleton(
    () => new ServerTestService(userTestService()),
  );
  const mailpitService = useSingleton(
    () => new MailpitService('http://localhost:54324'),
  );
  return {
    supabase,
    testDao,
    userTestService,
    rentalTestRepository,
    serverTestService,
    mailpitService,
  };
});
