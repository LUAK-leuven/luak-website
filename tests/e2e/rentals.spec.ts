import { expect, test } from '@playwright/test';
import { RentalFormPage } from './pages/rental-form.page';
import { LoginPage } from './pages/login.page';
import { navigateTo, testUsers } from './fixtures';
import dayjs from 'dayjs';
import { RentalDetailsPage } from '~/tests/e2e/pages/rental-details.page';
import { RentalsOverviewPage } from '~/tests/e2e/pages/rentals-overview.page';
import { uuidRegex } from '~/utils/utils';

test.describe('create a new rental', async () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsserted(testUsers.boardMember);
    await navigateTo(page, '/board/rentals/form');
  });

  test('create - defaults should be filled in', async ({ page }) => {
    const rentalFormPage = new RentalFormPage(page);

    await expect(rentalFormPage.boardMember).toBeDisabled();
    await expect(rentalFormPage.boardMember).toHaveValue(
      testUsers.boardMember + ' ',
    );
    await expect(rentalFormPage.dateBorrow).toHaveValue(
      dayjs().format('YYYY-MM-DD'),
    );
    await expect(rentalFormPage.dateReturn).toHaveValue(
      dayjs().add(3, 'w').format('YYYY-MM-DD'),
    );
  });

  test('create - can submit a minimal rental - edit it - and return it', async ({ page }) => {
    // --- Submit a rental ---
    const rentalFormPage = new RentalFormPage(page);
    const member = testUsers.paidMembership;
    await rentalFormPage.fillForm({
      member: member,
      paymentMethod: 'cash',
    });
    await rentalFormPage.submit();

    await expect(page).toHaveURL(/\/board\/rentals\/[d-]*/);

    const rentalDetailsPage = new RentalDetailsPage(page);
    const rentalId = await rentalDetailsPage.expectToHave({
      memberEmail: member,
      dateBorrow: dayjs(),
      dateReturn: dayjs().add(3, 'w'),
      depositFee: 20,
      paymentMethod: 'cash',
      status: 'Not returned',
      comments: '',
    });

    const rentalsOverviewPage = new RentalsOverviewPage(page);
    await navigateTo(page, rentalsOverviewPage.path);

    await expect(rentalsOverviewPage.rentalSummary(rentalId)).toBeVisible();

    // --- Edit the rental ---
    await rentalsOverviewPage.rentalSummary(rentalId).click();
    await expect(page).toHaveURL(`/board/rentals/${rentalId}`);
    await rentalDetailsPage.editButton.click();
    await expect(page).toHaveURL(`/board/rentals/${rentalId}/edit`);

    await rentalFormPage.addItem('gear', 'BD C4 .4');
    await rentalFormPage.addItem('gear', 'BD C4 .5');
    await rentalFormPage
      .selectComponent('gear')
      .listItem('BD C4 .5')
      .remove.click();

    await rentalFormPage.submit();
    await expect(page).toHaveURL(`/board/rentals/${rentalId}`);
    await rentalDetailsPage.expectToHave({
      memberEmail: member,
      dateBorrow: dayjs(),
      dateReturn: dayjs().add(3, 'w'),
      depositFee: 20,
      paymentMethod: 'cash',
      status: 'Not returned',
      comments: '',
      numberOfItems: 1,
    });
    await rentalDetailsPage.expectItem('BD C4 .4', 1);

    // --- return the rental ---
    await rentalDetailsPage.returnButton.click();
    await rentalDetailsPage.rentedItem('BD C4 .4').quickReturn.click();
    await rentalDetailsPage.depositReturned.check();

    await rentalDetailsPage.saveButton.click();
    await expect(rentalDetailsPage.editComments).toBeHidden();

    await rentalDetailsPage.expectToHave({
      status: 'Returned',
      numberOfItems: 1,
    });
    await rentalDetailsPage.expectItem('BD C4 .4', 1, 1);
  });

  test('create - can submit a full rental - and (partially) return the rental', async ({ page }) => {
    // --- create a new rental ---
    const rentalFormPage = new RentalFormPage(page);
    const formValues = {
      member: testUsers.paidMembership,
      dateBorrow: dayjs().subtract(2, 'd'),
      dateReturn: dayjs().subtract(2, 'd').add(4, 'w'),
      comments: 'yeeehaah',
      depositFee: 50,
      paymentMethod: 'cash' as const,
    };

    await rentalFormPage.fillForm(formValues);
    await rentalFormPage.addItem('gear', 'quickdraw', 14);
    await rentalFormPage.addItem('gear', 'single rope 000');
    await rentalFormPage.addItem('gear', 'single rope 001');
    await rentalFormPage
      .selectComponent('gear')
      .listItem('single rope 001')
      .remove.click();
    await rentalFormPage.addItem('topos', 'ailefriode');
    await rentalFormPage.submit();

    await expect(page).toHaveURL(new RegExp(`board\\/rentals\\/${uuidRegex}`));

    const rentalDetailsPage = new RentalDetailsPage(page);
    const rentalId = await rentalDetailsPage.expectToHave({
      ...formValues,
      memberEmail: formValues.member,
      status: 'Not returned',
      numberOfItems: 3,
    });
    await rentalDetailsPage.expectItem('quickdraw', 14);
    await rentalDetailsPage.expectItem('single rope 000', 1);
    await rentalDetailsPage.expectItem('Ailefriode', 1);

    const rentalsOverviewPage = new RentalsOverviewPage(page);
    await navigateTo(page, rentalsOverviewPage.path);

    await expect(rentalsOverviewPage.rentalSummary(rentalId)).toBeVisible();

    // --- return a rental ---
    await rentalsOverviewPage.rentalSummary(rentalId).click();
    await expect(page).toHaveURL(`/board/rentals/${rentalId}`);

    await rentalDetailsPage.returnButton.click();
    await rentalDetailsPage.editComments.fill('a test comment');
    await rentalDetailsPage
      .rentedItem('quickdraw')
      .returnedAmountInput.fill('10');
    await rentalDetailsPage.rentedItem('single rope 000').quickReturn.click();
    await expect(
      rentalDetailsPage.rentedItem('single rope 000').returnedAmountInput,
    ).toHaveValue('1');

    await rentalDetailsPage.saveButton.click();
    await expect(rentalDetailsPage.editComments).toBeHidden();

    await rentalDetailsPage.expectToHave({
      comments: 'a test comment',
      status: 'Partially returned',
      numberOfItems: 3,
    });
    await rentalDetailsPage.expectItem('quickdraw', 14, 10);
    await rentalDetailsPage.expectItem('single rope 000', 1, 1);
    await rentalDetailsPage.expectItem('Ailefriode', 1, 0);
  });
});
