import { expect, test } from '@playwright/test';
import { LostGearPage } from './pages/lost-gear.page';
import { login, testUsers } from './fixtures';
import { RentalFormPage } from './pages/rental/form.page';
import { RentalDetailsPage } from './pages/rental/details.page';
import { RentalReturnPage } from './pages/rental/return.page';
import dayjs from 'dayjs';

test.describe('lost gear form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.boardMember);
  });

  test('can mark a topo as lost', async ({ page }) => {
    const rentalFormPage = new RentalFormPage(page);
    await rentalFormPage.navigate();

    // Create a rental
    await rentalFormPage.fillForm({
      member: testUsers.paidMembership,
      paymentMethod: 'cash',
    });
    await rentalFormPage.addItem('topos', 'flone', 2);
    await rentalFormPage.submit();
    await expect(page).toHaveURL(/\/board\/rentals\/[d-]*/);

    const rentalDetailsPage = new RentalDetailsPage(page);
    await rentalDetailsPage.returnButton.click();

    const rentalReturnPage = new RentalReturnPage(page);
    const topoFlone = rentalReturnPage.rentedItem('Topo Flone');

    // Return 1 item
    await topoFlone.returnedAmountInput.fill('1');
    await rentalReturnPage.saveButton.click();

    // Mark as lost
    await rentalDetailsPage.returnButton.click();
    await topoFlone.more.menuButton.click();
    await topoFlone.more.markAsLost.click();

    const lostGearPage = new LostGearPage(page);
    await expect(lostGearPage.title).toHaveText('Lost Gear');
    await lostGearPage.expectToHave({
      rental: {
        member: testUsers.paidMembership,
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
      name: 'Topo Flone',
      rentedAmount: 2,
      returnedAmount: 1,
      lostItem: {
        date: dayjs(),
        amount: 1,
      },
    });
  });
});
