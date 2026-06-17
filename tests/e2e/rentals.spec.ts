import { expect } from '@playwright/test';
import { RentalFormPage } from './pages/rental/form.page';
import {
  authStateFile,
  cleanDatabase,
  navigateTo,
  test,
} from '~/tests/e2e/fixtures';
import dayjs from 'dayjs';
import { RentalDetailsPage } from '~/tests/e2e/pages/rental/details.page';
import { RentalsOverviewPage } from '~/tests/e2e/pages/rentals-overview.page';
import { uuidRegex, sleep } from '~/utils/utils';
import { RentalReturnPage } from './pages/rental/return.page';
import { testUsers } from './testUtils/TestUser';

test.use({ storageState: authStateFile('boardMember') });

test.describe('create a new rental', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/board/rentals/form');
  });

  test.beforeAll(async () => {
    await cleanDatabase();
  });

  test('create - defaults should be filled in', async ({ page }) => {
    const rentalFormPage = new RentalFormPage(page);

    await expect(rentalFormPage.boardMember).toBeDisabled();
    await expect(rentalFormPage.boardMember).toHaveValue(
      testUsers.boardMember.fullName,
    );
    await expect(rentalFormPage.dateBorrow).toHaveValue(
      dayjs().format('YYYY-MM-DD'),
    );
    await expect(rentalFormPage.dateReturn).toHaveValue(
      dayjs().add(3, 'w').format('YYYY-MM-DD'),
    );
  });

  test('create, edit & return - a minimal rental', async ({ page }) => {
    // --- Submit a rental ---
    const rentalFormPage = new RentalFormPage(page);
    const member = testUsers.paidMembership;
    await rentalFormPage.fillForm({
      memberName: member.fullName,
      paymentMethod: 'cash',
    });
    await rentalFormPage.submit();

    await expect(page).toHaveURL(/\/board\/rentals\/[d-]*/);

    const rentalDetailsPage = new RentalDetailsPage(page);
    const rentalId = await rentalDetailsPage.expectToHave({
      memberEmail: member.email,
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
    await sleep(200);
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
      memberEmail: member.email,
      dateBorrow: dayjs(),
      dateReturn: dayjs().add(3, 'w'),
      depositFee: 20,
      paymentMethod: 'cash',
      status: 'Not returned',
      comments: '',
      numberOfItems: 1,
    });
    await rentalDetailsPage.expectItem({ name: 'BD C4 .4', rentedAmount: 1 });

    // --- return the rental ---
    await rentalDetailsPage.returnButton.click();
    const rentalReturnPage = new RentalReturnPage(page);

    await rentalReturnPage.rentedItem('BD C4 .4').quickReturn.click();
    await rentalReturnPage.depositReturned.check();

    await rentalReturnPage.saveButton.click();
    await expect(page).toHaveURL(rentalDetailsPage.urlRegex);

    await rentalDetailsPage.expectToHave({
      status: 'Returned',
      numberOfItems: 1,
    });
    await rentalDetailsPage.expectItem({
      name: 'BD C4 .4',
      rentedAmount: 1,
      returnedAmount: 1,
    });
  });

  test('create & partial return - a full rental', async ({ page }) => {
    // --- create a new rental ---
    const rentalFormPage = new RentalFormPage(page);
    const testUser = testUsers.paidMembership;
    const formValues = {
      memberName: testUser.fullName,
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
      memberEmail: testUser.email,
      status: 'Not returned',
      numberOfItems: 3,
    });
    await rentalDetailsPage.expectItem({ name: 'quickdraw', rentedAmount: 14 });
    await rentalDetailsPage.expectItem({
      name: 'single rope 000',
      rentedAmount: 1,
    });
    await rentalDetailsPage.expectItem({ name: 'Ailefriode', rentedAmount: 1 });

    const rentalsOverviewPage = new RentalsOverviewPage(page);
    await navigateTo(page, rentalsOverviewPage.path);

    await expect(rentalsOverviewPage.rentalSummary(rentalId)).toBeVisible();

    // --- return a rental ---
    await rentalsOverviewPage.rentalSummary(rentalId).click();
    await expect(page).toHaveURL(`/board/rentals/${rentalId}`);

    await rentalDetailsPage.returnButton.click();
    const rentalReturnPage = new RentalReturnPage(page);
    await rentalReturnPage.comments.fill('a test comment');
    await rentalReturnPage
      .rentedItem('quickdraw')
      .returnedAmountInput.fill('10');
    await rentalReturnPage.rentedItem('single rope 000').quickReturn.click();
    await expect(
      rentalReturnPage.rentedItem('single rope 000').returnedAmountInput,
    ).toHaveValue('1');

    await rentalReturnPage.saveButton.click();

    await rentalDetailsPage.expectToHave({
      comments: 'a test comment',
      status: 'Partially returned',
      numberOfItems: 3,
    });
    await rentalDetailsPage.expectItem({
      name: 'quickdraw',
      rentedAmount: 14,
      returnedAmount: 10,
    });
    await rentalDetailsPage.expectItem({
      name: 'single rope 000',
      rentedAmount: 1,
      returnedAmount: 1,
    });
    await rentalDetailsPage.expectItem({
      name: 'Ailefriode',
      rentedAmount: 1,
      returnedAmount: 0,
    });
  });

  test('create & edit - a rental for non-member', async ({ page }) => {
    // --- create a new rental ---
    const rentalFormPage = new RentalFormPage(page);
    const formValues = {
      memberName: 'non-member',
      paymentMethod: 'cash' as const,
    };
    const contactInfo = {
      name: 'Not a member',
      email: 'not-a-member@test.com',
      phone: '+32 412 34 56 78',
    };
    await rentalFormPage.fillForm(formValues);
    await rentalFormPage.contactFullName.fill(contactInfo.name);
    await rentalFormPage.contactEmail.fill(contactInfo.email);
    await rentalFormPage.contactPhoneNumber.fill(contactInfo.phone);
    await rentalFormPage.submit();

    await expect(page).toHaveURL(new RegExp(`board\\/rentals\\/${uuidRegex}`));

    const rentalDetailsPage = new RentalDetailsPage(page);
    const rentalId = await rentalDetailsPage.expectToHave({
      ...formValues,
      memberName: contactInfo.name,
      memberEmail: contactInfo.email,
      memberPhone: contactInfo.phone,
      status: 'Not returned',
      numberOfItems: 0,
    });

    const rentalsOverviewPage = new RentalsOverviewPage(page);
    await navigateTo(page, rentalsOverviewPage.path);

    await expect(rentalsOverviewPage.rentalSummary(rentalId)).toBeVisible();

    // --- Edit the rental ---
    await rentalsOverviewPage.rentalSummary(rentalId).click();
    await expect(page).toHaveURL(`/board/rentals/${rentalId}`);
    await sleep(200);
    await rentalDetailsPage.editButton.click();
    await expect(page).toHaveURL(`/board/rentals/${rentalId}/edit`);

    await expect(rentalFormPage.contactFullName).toHaveValue(contactInfo.name);
    await expect(rentalFormPage.contactEmail).toHaveValue(contactInfo.email);
    await expect(rentalFormPage.contactPhoneNumber).toHaveValue(
      contactInfo.phone,
    );
  });
});
