import { expect, test } from '@playwright/test';
import { LostGearPage } from './pages/lost-gear.page';
import { login, testUsers } from './fixtures';

test.describe('lost gear form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.boardMember);

    const lostGearPage = new LostGearPage(page);
    await lostGearPage.navigate();
  });

  test('dummy test', async ({ page }) => {
    await expect(page).toHaveURL(LostGearPage.path);
  });
});
