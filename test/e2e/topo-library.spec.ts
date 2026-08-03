import test, { expect } from '@playwright/test';
import { TopoLibraryPage } from './pages/topos/library.page';
import { authStateFile, navigateTo } from './fixtures';

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
