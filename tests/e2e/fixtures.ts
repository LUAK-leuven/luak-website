import type { Page } from '@playwright/test';
import { LoginPage } from '~/tests/e2e/pages/login.page';
import { testServiceBuilder } from './testUtils/testServices';
import type { TestUser, TestUserKey } from './testUtils/TestUser';

export async function login(page: Page, user: TestUser) {
  const loginPage = new LoginPage(page);
  await loginPage.loginAsserted(user.email, user.password);
}

export function authStateFile(user: TestUserKey) {
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
