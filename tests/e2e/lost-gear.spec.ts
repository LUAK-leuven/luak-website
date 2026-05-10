import { expect, test } from '@playwright/test';
import { LostGearPage } from './pages/lost-gear.page';
import { login, testUsers } from './fixtures';

test.describe('lost gear form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.boardMember);

    const lostGearPage = new LostGearPage(page);
    await lostGearPage.navigate();
  });

  test('invalid UUID values show UUID format errors', async ({ page }) => {
    const lostGearPage = new LostGearPage(page);

    await lostGearPage.rentalId.fill('not-a-uuid');
    await lostGearPage.gearItemId.fill('not-a-uuid');
    await lostGearPage.inventoryId.fill('not-a-uuid');
    await lostGearPage.submitButton.click();

    await expect(lostGearPage.errorMessage('rental-id')).toBeVisible();
    await expect(lostGearPage.errorMessage('gear-item-id')).toBeVisible();
    await expect(lostGearPage.errorMessage('inventory-id')).toBeVisible();
  });
});
