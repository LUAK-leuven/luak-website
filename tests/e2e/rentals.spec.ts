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
    await loginPage.login(testUsers.boardMember);
    await page.waitForURL('/profile/overview');
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
    const rentalFormPage = new RentalFormPage(page);
    const member = testUsers.paidMembership;
    await rentalFormPage.submitMinimal({
      member: member,
      paymentMethod: 'cash',
    });

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
    await page.goto(rentalsOverviewPage.path);

    await expect(rentalsOverviewPage.rentalSummary(rentalId)).toBeVisible();
  });
});
