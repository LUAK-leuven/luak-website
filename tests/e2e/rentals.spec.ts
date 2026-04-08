import { expect, test } from '@playwright/test';
import { RentalFormPage } from './pages/rental-form.page';
import { LoginPage } from './pages/login.page';
import { testUsers } from './fixtures';
import dayjs from 'dayjs';
import { RentalDetailsPage } from '~/tests/e2e/pages/rental-details.page';
import { RentalsOverviewPage } from '~/tests/e2e/pages/rentals-overview.page';

test.describe('create a new rental', async () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsserted(testUsers.boardMember);
    await page.goto('/board/rentals/form');
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

  test('create - can submit a minimal rental', async ({ page }) => {
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
      items: [],
    });

    const rentalsOverviewPage = new RentalsOverviewPage(page);
    await page.goto(rentalsOverviewPage.path);

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
      items: [['BD C4 .4', 1]],
    });
  });

  test('create - can submit a full rental', async ({ page }) => {
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

    await expect(page).toHaveURL(/\/board\/rentals\/[d-]*/);

    const rentalDetailsPage = new RentalDetailsPage(page);
    const rentalId = await rentalDetailsPage.expectToHave({
      ...formValues,
      memberEmail: formValues.member,
      status: 'Not returned',
      items: [
        ['quickdraw', 14],
        ['single rope 000', 1],
        ['ailefriode', 1],
      ],
    });

    const rentalsOverviewPage = new RentalsOverviewPage(page);
    await page.goto(rentalsOverviewPage.path);

    await expect(rentalsOverviewPage.rentalSummary(rentalId)).toBeVisible();
  });
});
