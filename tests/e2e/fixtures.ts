import type { Page } from '@playwright/test';
import { LoginPage } from '~/tests/e2e/pages/login.page';
import { TestDao } from './global-setup-and-teardown/testDao';
import { getSupabaseClientForTests } from './global-setup-and-teardown/validateSupabaseUrl';

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

export async function cleanDatabase() {
  const supabaseClient = getSupabaseClientForTests();
  if (supabaseClient) {
    const testDao = new TestDao(supabaseClient);
    await testDao.cleanInventoryEvents();
    await testDao.clearRentals();
  } else {
    console.warn('Supabase client not available, skipping database cleanup');
  }
}
