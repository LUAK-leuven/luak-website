import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';

export function getSupabaseClientForTests() {
  if (
    !process.env.NUXT_PUBLIC_SUPABASE_URL ||
    !process.env.NUXT_SUPABASE_SECRET_KEY
  ) {
    return null;
  }
  validateSupabaseUrl(process.env.NUXT_PUBLIC_SUPABASE_URL);
  const supabase = createClient<Database>(
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    process.env.NUXT_SUPABASE_SECRET_KEY, // IMPORTANT: secret key in order to bypass RLS
  );
  return supabase;
}

export function validateSupabaseUrl(supabaseUrl: string) {
  if (supabaseUrl.includes('supabase.co')) {
    console.error(
      '\n❌  E2E tests cannot run against the production Supabase database.\n' +
        `    The running server is using SUPABASE_URL="${supabaseUrl}".\n`,
    );
    process.exit(1);
  }
  if (supabaseUrl.includes('http://127.0.0.1')) {
    return;
  } else {
    console.warn(
      `\n⚠️  Unknown Supabase URL.\n` +
        `    The running server is using SUPABASE_URL="${supabaseUrl}".\n`,
    );
    process.exit(1);
  }
}
