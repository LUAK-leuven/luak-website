import test, { expect } from '@playwright/test';
import { TopoLibraryPage } from '#test/e2e/pages/topos/library.page';
import { authStateFile, navigateTo } from '#test/e2e/fixtures';

test.use({ storageState: authStateFile('paidMembership') });

test('Filter initializes from query params', async ({ page }) => {
  await navigateTo(
    page,
    '/topos/library?search=flone&type=Sport+climbing&country=France&country=Belgium',
  );
  const topoLibraryPage = new TopoLibraryPage(page);

  await expect(topoLibraryPage.searchInput).toHaveValue('flone');
  await expect(topoLibraryPage.typeOfClimbing('Sport climbing')).toBeChecked();
  await expect(topoLibraryPage.country('France')).toBeVisible();
  await expect(topoLibraryPage.country('Belgium')).toBeVisible();
});

test('Changing filter sets query params', async ({ page }) => {
  const topoLibraryPage = await TopoLibraryPage.navigate(page);

  await topoLibraryPage.searchInput.fill('flone');
  await topoLibraryPage.typeOfClimbing('Sport climbing').check();

  await page.waitForURL('/topos/library?search=flone&type=Sport+climbing');
});
