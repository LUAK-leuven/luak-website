import { expect } from '@playwright/test';

import { authStateFile, navigateTo, test } from '#test/e2e/fixtures';

const detailPages = [
  {
    collection: 'news',
    from: '/news/upcoming',
    fromTitle: 'Summermeet location & upcoming activities',
  },
  {
    collection: 'activities',
    from: '/activities/summermeet',
    fromTitle: 'Summermeet: Ailefroide',
  },
  {
    collection: 'info',
    from: '/info/climbing-in-leuven',
    fromTitle: 'Climbing in Leuven',
  },
  { collection: 'pages', from: '/pages/about', fromTitle: 'About us' },
] as const;

for (const { collection, from, fromTitle } of detailPages) {
  test(`${collection}: client-side navigation to a missing document shows the 404 page`, async ({
    page,
  }) => {
    await navigateTo(page, from);
    await expect(
      page.getByRole('heading', { name: fromTitle, exact: true }),
    ).toBeVisible();

    await navigateTo(page, `/${collection}/missing-document`);

    await expect(page.getByText('404', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: fromTitle, exact: true }),
    ).toBeHidden();
  });
}

test.describe('stories: client-side navigation to a missing document', () => {
  test.use({ storageState: authStateFile('paidMembership') });

  test('shows the 404 page', async ({ page }) => {
    await navigateTo(page, '/stories/sialouze');
    await expect(
      page.getByRole('heading', {
        name: 'Unexpected adventures on the Sialouze',
        exact: true,
      }),
    ).toBeVisible();

    await navigateTo(page, '/stories/missing-story');

    await expect(page.getByText('404', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'Unexpected adventures on the Sialouze',
        exact: true,
      }),
    ).toBeHidden();
  });
});
