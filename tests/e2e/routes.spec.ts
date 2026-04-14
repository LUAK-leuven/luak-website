import { expect, test } from '@playwright/test';
import { LoginPage } from '~/tests/e2e/pages/login.page';
import { testUsers } from '~/tests/e2e/fixtures';

['/board/rentals', '/board/subscriptions-overview'].forEach((path) => {
  test.describe(`board section: ${path}`, async () => {
    test('board member has access', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.loginAsserted(testUsers.boardMember);

      const response = await page.goto(path);
      expect(response?.ok()).toBe(true);
      expect(response?.url().endsWith(path)).toBe(true);
    });

    test('unauthenticated user is redirected to login page', async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page).toHaveURL((url) => {
        return (
          url.pathname === '/login' && url.searchParams.has('redirect', path)
        );
      });
    });

    [testUsers.paidMembership, testUsers.nonMember].forEach((user) => {
      test(`non-board member ${user} is unauthorized`, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.loginAsserted(user);

        const response = await page.goto(path);
        expect(response?.status()).toBe(403);
      });
    });
  });
});

// TODO: add middleware for 'pages/christmas-bets/'
['/topos/library', '/stories/'].forEach((path) => {
  test.describe(`member section - ${path}`, async () => {
    test('active member has access', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.loginAsserted(testUsers.paidMembership);

      const response = await page.goto(path);
      expect(response?.ok()).toBe(true);
    });

    test('unauthenticated user is redirected to login page', async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page).toHaveURL((url) => {
        if (url.searchParams.get('redirect') !== path)
          console.log(url.searchParams, path);
        return (
          url.pathname === '/login' && url.searchParams.has('redirect', path)
        );
      });
    });

    [testUsers.paidLastYear, testUsers.unpaidMembership].forEach((user) => {
      test.fail(
        `non-board member ${user} is unauthorized`,
        async ({ page }) => {
          const loginPage = new LoginPage(page);
          await loginPage.loginAsserted(user);

          const response = await page.goto(path);
          expect(response?.status()).toBe(403);
        },
      );
    });
  });
});
