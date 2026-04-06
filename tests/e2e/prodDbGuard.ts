import { request } from '@playwright/test';

export default async function () {
  const ctx = await request.newContext({ baseURL: process.env.BASE_URL });

  let supabaseUrl: string;
  try {
    const res = await ctx.get('/api/_test-guard');
    if (!res.ok()) {
      console.error(
        `\n❌  Safety check failed — /api/_test-guard returned HTTP ${res.status()}.\n` +
          '    Ensure the dev server is running and NODE_ENV is not "production".\n',
      );
      process.exit(1);
    }
    ({ supabaseUrl } = await res.json());
  } catch (err) {
    console.error(
      `\n❌  Safety check failed — could not reach ${process.env.BASE_URL}/api/_test-guard.\n` +
        `    ${err}\n`,
    );
    process.exit(1);
  } finally {
    await ctx.dispose();
  }

  if (supabaseUrl!.includes('supabase.co')) {
    console.error(
      '\n❌  E2E tests cannot run against the production Supabase database.\n' +
        `    The running server is using SUPABASE_URL="${supabaseUrl!}".\n`,
    );
    process.exit(1);
  }
}
