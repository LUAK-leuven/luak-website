import { AuthApiError } from '@supabase/supabase-js';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useSessionExpiredHandler } from '~/composables/useSessionExpiredHandler';

const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please log in again.';

const { signOut, navigateToMock, route } = vi.hoisted(() => ({
  signOut: vi.fn(),
  navigateToMock: vi.fn(),
  route: { fullPath: '/board/rentals?status=open&page=2' },
}));

mockNuxtImport('useSupabaseClient', () => () => ({ auth: { signOut } }));
mockNuxtImport('useRoute', () => () => route);
mockNuxtImport('navigateTo', () => navigateToMock);

beforeEach(() => {
  vi.useFakeTimers();
  clearNuxtState('luak.toast', { reset: true });
  vi.clearAllMocks();
  signOut.mockResolvedValue({ error: null });
  navigateToMock.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

test('useSessionExpiredHandler signs out with local scope once', async () => {
  const { handle } = useSessionExpiredHandler();

  await handle();

  expect(signOut).toHaveBeenCalledExactlyOnceWith({ scope: 'local' });
});

test('useSessionExpiredHandler redirects to login with the current full path', async () => {
  const { handle } = useSessionExpiredHandler();

  await handle();

  expect(navigateToMock).toHaveBeenCalledExactlyOnceWith({
    name: 'login',
    query: { redirect: route.fullPath },
  });
});

test('useSessionExpiredHandler shows exactly one error toast', async () => {
  const { handle } = useSessionExpiredHandler();
  const { toasts } = useToast();

  await handle();

  expect(toasts.value).toHaveLength(1);
  expect(toasts.value[0]?.type).toBe('error');
});

test('useSessionExpiredHandler shows the session expired message', async () => {
  const { handle } = useSessionExpiredHandler();
  const { toasts } = useToast();

  await handle();

  expect(toasts.value[0]?.message).toBe(SESSION_EXPIRED_MESSAGE);
});

const localSignOutFailures: [string, () => void][] = [
  [
    'an error result',
    () =>
      signOut.mockResolvedValue({
        error: new AuthApiError(
          'Something went wrong',
          500,
          'unexpected_failure',
        ),
      }),
  ],
  [
    'a thrown error',
    () =>
      signOut.mockRejectedValue(
        new AuthApiError('Something went wrong', 500, 'unexpected_failure'),
      ),
  ],
];

test.each(localSignOutFailures)(
  'useSessionExpiredHandler still redirects to login when local sign-out fails with %s',
  async (_name, failSignOut) => {
    failSignOut();
    const { handle } = useSessionExpiredHandler();

    await handle();

    expect(navigateToMock).toHaveBeenCalledExactlyOnceWith({
      name: 'login',
      query: { redirect: route.fullPath },
    });
  },
);

test.each(localSignOutFailures)(
  'useSessionExpiredHandler still shows exactly one session expired toast when local sign-out fails with %s',
  async (_name, failSignOut) => {
    failSignOut();
    const { handle } = useSessionExpiredHandler();
    const { toasts } = useToast();

    await handle();

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0]).toMatchObject({
      type: 'error',
      message: SESSION_EXPIRED_MESSAGE,
    });
  },
);
