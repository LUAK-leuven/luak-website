import { chromium, type Page } from '@playwright/test';

const warmUpRoutes = ['/', '/login', '/board/rentals/form'];
const quietPeriodMs = 500;
const pageTimeoutMs = 30_000;
const maxReloadsPerPage = 5;

async function loadUntilStable(page: Page, route: string) {
  let loads = 0;
  page.on('load', () => loads++);

  await page.goto(route, { timeout: pageTimeoutMs });
  // A Vite "new dependencies optimized" reload shows up as another load event.
  for (let attempt = 0; attempt <= maxReloadsPerPage; attempt++) {
    const loadsBefore = loads;
    await page.waitForLoadState('networkidle', { timeout: pageTimeoutMs });
    await page.waitForTimeout(quietPeriodMs);
    if (loads === loadsBefore) return;
  }
  throw new Error(
    `${route} kept reloading after ${maxReloadsPerPage.toFixed()} attempts`,
  );
}

export async function warmUpDevServer(baseURL: string) {
  console.log('Starting dev server warm-up...');
  const browser = await chromium.launch();
  try {
    for (const route of warmUpRoutes) {
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();
      try {
        await loadUntilStable(page, route);
      } catch (err) {
        console.warn(
          `\n⚠️  Dev server warm-up failed for ${route}: ${err instanceof Error ? err.message : String(err)}\n`,
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log('Dev server warm-up complete.');
}
