import type { Page } from '@playwright/test';

const _testUsers = [
  'non_member@test.com',
  'unpaid_membership@test.com',
  'paid_last_year@test.com',
  'paid_this_year@test.com',
  'board_member@test.com',
] as const;
type TestUser = (typeof _testUsers)[number];

export const testUser = {
  login: async (user: TestUser, page: Page) => {
    await page.goto('/login');
    await page.getByTestId('login.email').getByRole('textbox').fill(user);
    await page
      .getByTestId('login.password')
      .getByRole('textbox')
      .fill('123456789');

    await page.getByTestId('login.submit').click();

    await page.waitForURL('/profile/overview', { timeout: 2_000 });
  },
};
