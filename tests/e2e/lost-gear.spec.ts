import { expect, test } from '@playwright/test';
import { LostGearPage } from './pages/lost-gear.page';
import { authStateFile, cleanDatabase } from './fixtures';
import { RentalFormPage } from './pages/rental/form.page';
import { RentalDetailsPage } from './pages/rental/details.page';
import { RentalReturnPage } from './pages/rental/return.page';
import { TopoLibraryPage } from './pages/topos/library.page';
import { GearInventoryPage } from './pages/gear/inventory.page';
import { testUsers } from './testUtils/TestUser';

test.use({ storageState: authStateFile('boardMember') });

test.describe('lost gear form', () => {
  test.beforeEach(async () => {
    await cleanDatabase();
  });

  test('can mark a topo as lost', async ({ page }) => {
    const rentalFormPage = await RentalFormPage.navigate(page);
    const topoName = 'Topo Flone';

    // Create a rental
    await rentalFormPage.fillForm({
      memberName: testUsers.paidMembership.fullName,
      paymentMethod: 'cash',
    });
    await rentalFormPage.addItem('topos', 'flone', 2);
    const rentalDetailsPage = await rentalFormPage.submit();
    await expect(page).toHaveURL(rentalDetailsPage.urlRegex);

    const rentalId = await rentalDetailsPage.getRentalId();

    await rentalDetailsPage.returnButton.click();

    const rentalReturnPage = new RentalReturnPage(page);
    const topoFlone = rentalReturnPage.rentedItem(topoName);

    // Return 1 item
    await topoFlone.returnedAmountInput.fill('1');
    await rentalReturnPage.depositReturned.check(); // return deposit so that we can make a 'returned' rental later on
    await rentalReturnPage.saveButton.click();

    // Mark as lost
    await rentalDetailsPage.returnButton.click();
    const lostGearPage = await rentalReturnPage.markItemAsLost(topoName);

    await expect(lostGearPage.title).toHaveText('Lost Gear');
    await lostGearPage.expectToHave({
      rental: {
        member: testUsers.paidMembership.fullName,
        depositFee: 20,
        paymentMethod: 'cash',
      },
      topo: {
        title: 'Topo Flone',
        year: 2019,
        rentedAmount: 2,
        unreturnedAmount: 1,
        lostAmount: 1,
      },
    });

    await lostGearPage.lostAmount.fill('0');
    await expect(lostGearPage.lostAmountError).toBeVisible();

    await lostGearPage.lostAmount.fill('1');
    await expect(lostGearPage.lostAmountError).toBeHidden();

    await lostGearPage.saveButton.click();
    await expect(page).toHaveURL(/\/board\/rentals\/[d-]*/);

    await rentalDetailsPage.expectToHave({
      status: 'Returned',
    });

    await rentalDetailsPage.expectItem({
      name: topoName,
      rentedAmount: 2,
      returnedAmount: 1,
      lostAmount: 1,
    });

    const topoLibraryPage = await TopoLibraryPage.navigate(page);
    const topoDetailsPage = await topoLibraryPage.navigateToDetails(topoName);

    await expect(topoDetailsPage.amount).toHaveText('1');

    await rentalFormPage.navigate();
    await rentalFormPage.selectSearchBar('topos');
    const { option } = rentalFormPage.selectComponent('topos');
    await expect(
      (await option('Topo Flone')).getByTestId('search.availableAmount'),
    ).toHaveText('1');

    // --- Cannot mark it as lost again ---
    await rentalReturnPage.navigate(rentalId);
    await rentalReturnPage.markItemAsLost(topoName);

    await lostGearPage.expectToHave({
      topo: {
        title: 'Topo Flone',
        rentedAmount: 2,
        unreturnedAmount: 0,
        lostAmount: 1,
      },
    });

    // await lostGearPage.saveButton.click();
  });

  test('can mark a gear item as lost', async ({ page }) => {
    const rentalFormPage = await RentalFormPage.navigate(page);

    // Create a rental
    await rentalFormPage.fillForm({
      memberName: testUsers.paidMembership.fullName,
      paymentMethod: 'cash',
    });

    const gearItemName = 'BD C4 .5';
    await rentalFormPage.addItem('gear', gearItemName, 2);
    await rentalFormPage.submit();
    await expect(page).toHaveURL(/\/board\/rentals\/[d-]*/);

    const rentalDetailsPage = new RentalDetailsPage(page);
    await rentalDetailsPage.returnButton.click();

    const rentalReturnPage = new RentalReturnPage(page);
    const gearItem = rentalReturnPage.rentedItem(gearItemName);

    // Return 1 item
    await gearItem.returnedAmountInput.fill('1');
    await rentalReturnPage.depositReturned.check(); // return deposit so that we can make a 'returned' rental later on
    await rentalReturnPage.saveButton.click();

    // Mark as lost
    await rentalDetailsPage.returnButton.click();
    await gearItem.more.menuButton.click();
    await gearItem.more.markAsLost.click();

    const lostGearPage = new LostGearPage(page);
    await expect(lostGearPage.title).toHaveText('Lost Gear');
    await lostGearPage.expectToHave({
      rental: {
        member: testUsers.paidMembership.fullName,
        depositFee: 20,
        paymentMethod: 'cash',
      },
      gear: {
        name: gearItemName,
        rentedAmount: 2,
        unreturnedAmount: 1,
        lostAmount: 1,
      },
    });

    await lostGearPage.lostAmount.fill('1');
    await expect(lostGearPage.lostAmountError).toBeHidden();

    await lostGearPage.inventorySelection.getByRole('radio').first().click();

    await lostGearPage.saveButton.click();
    await expect(page).toHaveURL(/\/board\/rentals\/[d-]*/);

    await rentalDetailsPage.expectToHave({
      status: 'Returned',
    });

    await rentalDetailsPage.expectItem({
      name: gearItemName,
      rentedAmount: 2,
      returnedAmount: 1,
      lostAmount: 1,
    });

    const gearInventoryPage = new GearInventoryPage(page);
    await gearInventoryPage.navigate();
    const gearItemRow = gearInventoryPage.gearItem(gearItemName);
    await expect(gearItemRow.availableAmount).toHaveText('1');
    await expect(gearItemRow.totalAmount).toHaveText('1');

    const gearDetailsPage = await gearItemRow.navigateToDetails();

    await expect(gearDetailsPage.gearItemAmount).toContainText('1 / 1');
    await expect(gearDetailsPage.amount).toHaveText('1');

    await rentalFormPage.navigate();
    await rentalFormPage.selectSearchBar('gear');
    const { option } = rentalFormPage.selectComponent('gear');
    await expect(
      (await option(gearItemName)).getByTestId('search.availableAmount'),
    ).toHaveText('1');
  });
});
