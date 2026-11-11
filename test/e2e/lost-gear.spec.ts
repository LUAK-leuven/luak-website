import { expect, type Page } from '@playwright/test';

import {
  createRentalItemName,
  type RentalItemName,
  RentalItemType,
} from '#shared/api/rest/rental/rentalItem';
import { authStateFile, cleanDatabase, test } from '#test/e2e/fixtures';
import { GearInventoryPage } from '#test/e2e/pages/gear/inventory.page';
import { RentalDetailsPage } from '#test/e2e/pages/rental/details.page';
import {
  RentalFormPage,
  type RentalItem,
} from '#test/e2e/pages/rental/form.page';
import { TopoLibraryPage } from '#test/e2e/pages/topos/library.page';
import { testUsers } from '#test/TestUser';

test.use({ storageState: authStateFile('boardMember') });

test.describe('lost gear form', () => {
  test.beforeEach(async () => {
    await cleanDatabase();
  });

  test('can mark a topo as lost', async ({ page }) => {
    test.slow();

    const rentalFormPage = await RentalFormPage.navigate(page);

    const topoItem: RentalItem = {
      exactItemName: createRentalItemName('Topo Flone (2019)'),
      searchTerm: 'flone',
      itemType: RentalItemType.topo,
    };
    const topoTitle = 'Topo Flone';

    // Create a rental
    await rentalFormPage.fillForm({
      memberName: testUsers.paidMembership.fullName,
      paymentMethod: 'cash',
    });
    await rentalFormPage.addItem(topoItem, 2);
    const rentalDetailsPage = await rentalFormPage.submit();

    const rentalId = await rentalDetailsPage.getRentalId();

    const rentalReturnPage = await rentalDetailsPage.returnRental();

    const topoFlone = rentalReturnPage.rentedItem(topoItem.exactItemName);

    // Return 1 item
    await topoFlone.returnedAmountInput.fill('1');
    await rentalReturnPage.depositReturned.check(); // return deposit so that we can make a 'returned' rental later on
    await rentalReturnPage.submit();

    // Mark as lost
    const lostGearPage = await rentalDetailsPage.markItemAsLost(
      topoItem.exactItemName,
    );

    await expect(lostGearPage.title).toHaveText('Lost Gear');
    await lostGearPage.expectToHave({
      rental: {
        member: testUsers.paidMembership.fullName,
        depositFee: 20,
        paymentMethod: 'cash',
      },
      topo: {
        title: topoTitle,
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

    await lostGearPage.submit();

    await rentalDetailsPage.expectToHave({
      status: 'Returned',
    });

    await rentalDetailsPage.expectItem({
      name: topoItem.exactItemName,
      rentedAmount: 2,
      returnedAmount: 1,
      lostAmount: 1,
    });

    const topoLibraryPage = await TopoLibraryPage.navigate(page);
    const topoDetailsPage = await topoLibraryPage.navigateToDetails(topoTitle);

    await expect(topoDetailsPage.amount).toHaveText('1 / 1');
    await expect(topoDetailsPage.history.itemLostEvents).toContainText(
      '1 item(s) lost',
    );

    await rentalFormPage.navigate();
    await rentalFormPage.selectSearchBar(topoItem.itemType);
    const { option } = rentalFormPage.selectComponent(topoItem.itemType);
    await expect(
      (await option(topoItem.exactItemName)).getByTestId(
        'search.availableAmount',
      ),
    ).toHaveText('1');

    // --- Cannot mark it as lost again ---
    await rentalDetailsPage.navigate(rentalId);
    await rentalDetailsPage.markItemAsLost(topoItem.exactItemName);

    await lostGearPage.expectToHave({
      topo: {
        title: topoTitle,
        rentedAmount: 2,
        unreturnedAmount: 0,
        lostAmount: 1,
      },
    });
  });

  test('can mark a gear item as lost', async ({ page }) => {
    test.slow();

    const rentalFormPage = await RentalFormPage.navigate(page);

    // Create a rental
    await rentalFormPage.fillForm({
      memberName: testUsers.paidMembership.fullName,
      paymentMethod: 'cash',
    });

    const gearItem: RentalItem = {
      exactItemName: createRentalItemName('BD C4 .5'),
      searchTerm: 'BD C4 .5',
      itemType: RentalItemType.gear,
    };

    await rentalFormPage.addItem(gearItem, 2);
    const rentalDetailsPage = await rentalFormPage.submit();
    await expect(page).toHaveURL(RentalDetailsPage.urlRegex);
    const rentalId = await rentalDetailsPage.getRentalId();

    const rentalReturnPage = await rentalDetailsPage.returnRental();
    await rentalReturnPage.depositReturned.check(); // return deposit so that we can make a 'returned' rental later on
    await rentalReturnPage.submit();

    // Mark as lost
    const lostGearPage = await rentalDetailsPage.markItemAsLost(
      gearItem.exactItemName,
    );

    await expect(lostGearPage.title).toHaveText('Lost Gear');
    await lostGearPage.expectToHave({
      rental: {
        member: testUsers.paidMembership.fullName,
        depositFee: 20,
        paymentMethod: 'cash',
      },
      gear: {
        name: gearItem.exactItemName,
        rentedAmount: 2,
        unreturnedAmount: 2,
        lostAmount: 1,
      },
    });

    await lostGearPage.lostAmount.fill('1');
    await expect(lostGearPage.lostAmountError).toBeHidden();

    await lostGearPage.inventorySelection.first().click();

    await lostGearPage.submit();

    await expectCorrectAmounts({
      gearItemName: gearItem.exactItemName,
      page,
      rental: {
        status: 'Partially returned',
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
    await rentalDetailsPage.navigate(rentalId);
    await rentalDetailsPage.markItemAsLost(gearItem.exactItemName);

    await lostGearPage.expectToHave({
      gear: {
        name: gearItem.exactItemName,
        rentedAmount: 2,
        unreturnedAmount: 1,
        lostAmount: 1,
      },
    });
    await expect(
      lostGearPage.inventorySelection.first().getByTestId('amount'),
    ).toHaveText('1');
    await lostGearPage.inventorySelection.first().click();

    await lostGearPage.submit();

    await expectCorrectAmounts({
      gearItemName: gearItem.exactItemName,
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
  gearItemName: RentalItemName;
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
  await rentalFormPage.selectSearchBar(RentalItemType.gear);
  const { option } = rentalFormPage.selectComponent(RentalItemType.gear);
  await expect(
    (await option(args.gearItemName)).getByTestId('search.availableAmount'),
  ).toHaveText(args.inventory.availableAmount.toFixed());
}
