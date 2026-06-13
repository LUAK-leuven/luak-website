import { expect, test, type Page } from '@playwright/test';
import { authStateFile } from '~/tests/e2e/fixtures';

type Access = 'allow' | 'abort' | 'redirect' | 'page not found';

const allUsers = [
  'unauthenticated',
  'nonMember',
  'unpaidMembership',
  'paidLastYear',
  'paidMembership',
  'boardMember',
] as const;

const accessGraph: {
  rule: string;
  paths: string[];
  users: Record<(typeof allUsers)[number], Access | 'skip'>;
}[] = [
  {
    rule: 'board section',
    paths: ['/board/rentals', '/board/subscriptions-overview'],
    users: {
      unauthenticated: 'redirect',
      nonMember: 'abort',
      unpaidMembership: 'skip',
      paidLastYear: 'skip',
      paidMembership: 'abort',
      boardMember: 'allow',
    },
  },
  {
    rule: 'member section',
    paths: ['/topos/library', '/stories/'],
    users: {
      unauthenticated: 'redirect',
      nonMember: 'abort',
      unpaidMembership: 'allow', // TODO: This should not be allowed.
      paidLastYear: 'allow', // TODO: I guess we want to allow this.
      paidMembership: 'allow',
      boardMember: 'allow',
    },
  },
  {
    rule: 'public section',
    paths: ['/pages/christmas-bets/'], // TODO: 'pages/christmas-bets/' should be in member section.
    users: {
      unauthenticated: 'allow',
      nonMember: 'allow',
      unpaidMembership: 'skip',
      paidLastYear: 'skip',
      paidMembership: 'allow',
      boardMember: 'allow',
    },
  },
  {
    rule: 'authenticated - non-member',
    paths: ['/profile/overview'],
    users: {
      unauthenticated: 'skip', // Supabase redirect doesn't use the redirect query param, so we can't test this.
      nonMember: 'allow',
      unpaidMembership: 'skip',
      paidLastYear: 'skip',
      paidMembership: 'allow',
      boardMember: 'allow',
    },
  },
  {
    rule: 'non-existing pages',
    paths: ['pages/profile/'],
    users: {
      unauthenticated: 'page not found',
      nonMember: 'skip',
      unpaidMembership: 'skip',
      paidLastYear: 'skip',
      paidMembership: 'page not found',
      boardMember: 'page not found',
    },
  },
];

allUsers.forEach((testUser) => {
  test.describe(testUser, () => {
    if (testUser !== 'unauthenticated') {
      test.use({ storageState: authStateFile(testUser) });
    }
    accessGraph.forEach(({ rule, paths, users: { [testUser]: access } }) => {
      if (access !== 'skip') {
        test.describe(rule, () => {
          paths.forEach((path) => {
            test(`${testUser} - ${path} - ${access}`, async ({ page }) => {
              await testAccess(path, access, page);
            });
          });
        });
      }
    });
  });
});

async function testAccess(path: string, access: Access, page: Page) {
  switch (access) {
    case 'allow':
      await assertHasAccess(path, page);
      break;
    case 'redirect':
      await assertIsRedirectedToLogin(path, page);
      break;
    case 'abort':
      await assertHasNoAccess(path, page);
      break;
    case 'page not found':
      await assertPageNotFound(path, page);
      break;
    default:
      throw new Error(`Access type ${access} not implemented yet`);
  }
}

async function assertHasAccess(path: string, page: Page) {
  const response = await page.goto(path);
  expect(response?.ok()).toBe(true);
  expect(response?.url().endsWith(path)).toBe(true);
}

async function assertIsRedirectedToLogin(path: string, page: Page) {
  const response = await page.goto(path);
  expect(response?.ok()).toBe(true);
  expect(response?.url()).toContain('/login?redirect=' + path);
}

async function assertHasNoAccess(path: string, page: Page) {
  const response = await page.goto(path);
  expect(response?.status()).toBe(403);
}

async function assertPageNotFound(path: string, page: Page) {
  const response = await page.goto(path);
  expect(response?.status()).toBe(404);
}
