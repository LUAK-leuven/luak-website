export default function () {
  const supabaseUrl = process.env.SUPABASE_URL ?? '';
  if (supabaseUrl.includes('supabase.co')) {
    console.error(
      '\n❌  E2E tests cannot run against the production Supabase database.\n',
    );
    process.exit(1);
  }
}
