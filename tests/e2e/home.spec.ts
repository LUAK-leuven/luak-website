import { expect, test } from '@nuxt/test-utils/playwright';

test('homepage is visible', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' });

  await expect(page.getByRole('img', { name: /luak/i })).toBeVisible();

  await expect(
    page.getByRole('link', { name: /check our activities/i }),
  ).toBeVisible();
});
