import { expect, test, type Page } from '@playwright/test';
import { authStateFile, cleanDatabase } from './fixtures';
import { RentalFormPage } from './pages/rental/form.page';
import { TopoLibraryPage } from './pages/topos/library.page';
import { GearInventoryPage } from './pages/gear/inventory.page';
import { testUsers } from './testUtils/TestUser';
import { RentalDetailsPage } from './pages/rental/details.page';

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

    const rentalReturnPage = await rentalDetailsPage.returnRental();

    const topoFlone = rentalReturnPage.rentedItem(topoName);

    // Return 1 item
    await topoFlone.returnedAmountInput.fill('1');
    await rentalReturnPage.depositReturned.check(); // return deposit so that we can make a 'returned' rental later on
    await rentalReturnPage.saveButton.click();

    // Mark as lost
    await rentalDetailsPage.returnRental();
    const lostGearPage = await rentalReturnPage.markItemAsLost(topoName);

    await expect(lostGearPage.title).toHaveText('Lost Gear');
    await lostGearPage.expectToHave({
      rental: {
        member: testUsers.paidMembership.fullName,
        depositFee: 20,
        paymentMethod: 'cash',
      },
      topo: {
        title: topoName,
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
      (await option(topoName)).getByTestId('search.availableAmount'),
    ).toHaveText('1');

    // --- Cannot mark it as lost again ---
    await rentalReturnPage.navigate(rentalId);
    await rentalReturnPage.markItemAsLost(topoName);

    await lostGearPage.expectToHave({
      topo: {
        title: topoName,
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
    const rentalDetailsPage = await rentalFormPage.submit();
    await expect(page).toHaveURL(rentalDetailsPage.urlRegex);
    const rentalId = await rentalDetailsPage.getRentalId();

    const rentalReturnPage = await rentalDetailsPage.returnRental();
    await rentalReturnPage.depositReturned.check(); // return deposit so that we can make a 'returned' rental later on
    await rentalReturnPage.saveButton.click();
    await rentalDetailsPage.returnRental();

    // Mark as lost
    const lostGearPage = await rentalReturnPage.markItemAsLost(gearItemName);

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
        unreturnedAmount: 2,
        lostAmount: 1,
      },
    });

    await lostGearPage.lostAmount.fill('1');
    await expect(lostGearPage.lostAmountError).toBeHidden();

    await lostGearPage.inventorySelection.first().click();

    await lostGearPage.saveButton.click();
    await expect(page).toHaveURL(rentalDetailsPage.urlRegex);

    await expectCorrectAmounts({
      gearItemName,
      page,
      rental: {
        status: 'Not returned',
        rentedAmount: 2,
        returnedAmount: 0,
        lostAmount: 1,
      },
      inventory: {
        availableAmount: 0,
        totalAmount: 1,
      },
    });

    // --- Mark more as lost ---
    await rentalReturnPage.navigate(rentalId);
    await rentalReturnPage.markItemAsLost(gearItemName);

    await lostGearPage.expectToHave({
      gear: {
        name: gearItemName,
        rentedAmount: 2,
        unreturnedAmount: 1,
        lostAmount: 1,
      },
    });
    await expect(
      lostGearPage.inventorySelection.first().getByTestId('amount'),
    ).toHaveText('1');
    await lostGearPage.inventorySelection.first().click();

    await lostGearPage.saveButton.click();
    await expect(page).toHaveURL(rentalDetailsPage.urlRegex);

    await expectCorrectAmounts({
      gearItemName,
      page,
      rental: {
        status: 'Returned',
        rentedAmount: 2,
        returnedAmount: 0,
        lostAmount: 2,
      },
      inventory: {
        availableAmount: 0,
        totalAmount: 0,
      },
    });
  });
});

async function expectCorrectAmounts(args: {
  gearItemName: string;
  page: Page;
  rental: {
    status: 'Not returned' | 'Partially returned' | 'Returned' | 'Reserved';
    rentedAmount: number;
    returnedAmount: number;
    lostAmount: number;
  };
  inventory: {
    availableAmount: number;
    totalAmount: number;
  };
}) {
  const rentalDetailsPage = new RentalDetailsPage(args.page);
  await rentalDetailsPage.expectToHave({
    status: args.rental.status,
  });

  await rentalDetailsPage.expectItem({
    name: args.gearItemName,
    rentedAmount: args.rental.rentedAmount,
    returnedAmount: args.rental.returnedAmount,
    lostAmount: args.rental.lostAmount,
  });

  const gearInventoryPage = await GearInventoryPage.navigate(args.page);
  const gearItemRow = gearInventoryPage.gearItem(args.gearItemName);
  await expect(gearItemRow.availableAmount).toHaveText(
    args.inventory.availableAmount.toFixed(),
  );
  await expect(gearItemRow.totalAmount).toHaveText(
    args.inventory.totalAmount.toFixed(),
  );

  const gearDetailsPage = await gearItemRow.navigateToDetails();

  await expect(gearDetailsPage.gearItemAmount).toContainText(
    `${args.inventory.availableAmount.toFixed()} / ${args.inventory.totalAmount.toFixed()}`,
  );
  await expect(gearDetailsPage.amount).toHaveText(
    args.inventory.totalAmount.toFixed(),
  );

  const rentalFormPage = await RentalFormPage.navigate(args.page);
  await rentalFormPage.selectSearchBar('gear');
  const { option } = rentalFormPage.selectComponent('gear');
  await expect(
    (await option(args.gearItemName)).getByTestId('search.availableAmount'),
  ).toHaveText(args.inventory.availableAmount.toFixed());
}
