import { authStateFile, cleanDatabase, test } from 'fixtures';
import { testServiceBuilder } from './testUtils/testServices';
import { itemArchivedEvent } from '~~/model/inventory/ItemEvent';
// import type { GearInventoryId, TopoId } from '~/types/gear';
import { GearInventoryPage } from './pages/gear/inventory.page';
import { expect } from '@playwright/test';
import { RentalFormPage } from './pages/rental/form.page';
import { TopoDetailsPage } from './pages/topos/details.page';

test.use({ storageState: authStateFile('boardMember') });

test.describe('lost gear form', () => {
  test.beforeEach(async () => {
    await cleanDatabase();
  });

  test('gear - amounts are correct', async ({ page }) => {
    const gearInventoryPage = await GearInventoryPage.navigate(page);
    const gearItem = gearInventoryPage.gearItem('quickdraw');
    await expect(gearItem.totalAmount).toHaveText('38');

    // Archive some stuff
    const testDao = testServiceBuilder().testDao();
    await testDao.addInventoryItemEvent({
      itemId: {
        // TODO: find a better solution iso reusing the hardcoded ID from seed.sql
        itemId: '3d7a2a9a-8a8a-456c-997e-8533427f6ed1' as GearInventoryId,
        itemType: 'gear',
      },
      event: itemArchivedEvent(4),
    });
    await testDao.addInventoryItemEvent({
      itemId: {
        itemId: '49f1b67b-5289-4056-a43a-c9ad248ad883' as GearInventoryId,
        itemType: 'gear',
      },
      event: itemArchivedEvent(2),
    });

    // Inventory
    await gearInventoryPage.navigate();
    await expect(gearItem.totalAmount).toHaveText('32');

    // Gear details
    const gearDetailsPage = await gearItem.navigateToDetails();
    await expect(gearDetailsPage.gearItemAmount).toContainText('32 / 32');

    // Rental form
    const rentalFormPage = await RentalFormPage.navigate(page);

    await rentalFormPage.selectSearchBar('gear');
    const item = await rentalFormPage
      .selectComponent('gear')
      .option('quickdraw');
    await expect(item).toContainText('32');
  });

  test('topo - amounts are correct', async ({ page }) => {
    const topoId = '539bca6e-417e-44b3-8e6a-fecf223b49a2' as TopoId;
    const topoDetailsPage = await TopoDetailsPage.navigate(page, topoId);
    await expect(topoDetailsPage.amount).toHaveText('2');

    // Archive a topo
    const testDao = testServiceBuilder().testDao();
    await testDao.addInventoryItemEvent({
      itemId: {
        itemId: topoId,
        itemType: 'topo',
      },
      event: itemArchivedEvent(1),
    });

    // Topo details
    await topoDetailsPage.navigate(topoId);
    await expect(topoDetailsPage.amount).toHaveText('1');

    // Rental form
    const rentalFormPage = await RentalFormPage.navigate(page);

    await rentalFormPage.selectSearchBar('topos');
    const item = await rentalFormPage.selectComponent('topos').option('flone');
    await expect(item).toContainText('1');
  });
});
