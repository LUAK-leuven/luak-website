import { request } from '@playwright/test';
import { validateSupabaseUrl } from '~/tests/e2e/global-setup-and-teardown/validateSupabaseUrl';

export default async function () {
  const ctx = await request.newContext({ baseURL: process.env.BASE_URL });

  let supabaseUrl: string;
  try {
    const res = await ctx.get('/api/_test-guard');
    if (!res.ok()) {
      console.error(
        `\n❌  Safety check failed — /api/_test-guard returned HTTP ${res.status().toFixed()}.\n` +
          '    Ensure the dev server is running and NODE_ENV is not "production".\n',
      );
      process.exit(1);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

  validateSupabaseUrl(supabaseUrl);
}
