import type { Page } from '@playwright/test';
import { LoginPage } from '~/tests/e2e/pages/login.page';
import { testServiceBuilder } from './testUtils/testServices';

export const testUsers = {
  nonMember: 'non_member@test.com',
  unpaidMembership: 'unpaid_membership@test.com',
  paidLastYear: 'paid_last_year@test.com',
  paidMembership: 'paid_this_year@test.com',
  boardMember: 'board_member@test.com',
} as const;

export async function login(page: Page, user: string) {
  const loginPage = new LoginPage(page);
  await loginPage.loginAsserted(user);
}

export function authStateFile(user: keyof typeof testUsers) {
  return `./tests/e2e/.auth/${user}.json`;
}

export async function navigateTo(page: Page, url: string) {
  await page.goto(url);
}

export async function cleanDatabase() {
  const testDao = testServiceBuilder().testDao();

  await testDao.cleanInventoryEvents();
  await testDao.clearRentals();
}
