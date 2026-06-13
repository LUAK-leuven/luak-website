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
