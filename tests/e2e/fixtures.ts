import type { Page } from '@playwright/test';
import { LoginPage } from '~/tests/e2e/pages/login.page';

export const testUsers = {
  nonMember: 'non_member@test.com',
  unpaidMembership: 'unpaid_membership@test.com',
  paidLastYear: 'paid_last_year@test.com',
  paidMembership: 'paid_this_year@test.com',
  boardMember: 'board_member@test.com',
};

export async function login(page: Page, user: string) {
  const loginPage = new LoginPage(page);
  await loginPage.loginAsserted(user);
}

export async function navigateTo(page: Page, url: string) {
  await page.goto(url);
}
