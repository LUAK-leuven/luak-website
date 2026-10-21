import { AuthApiError } from '@supabase/supabase-js';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useSessionExpiredHandler } from '~/composables/useSessionExpiredHandler';

const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please log in again.';
const RAW_SUPABASE_MESSAGE = 'Auth session missing!';

const { signOut, navigateToMock, route } = vi.hoisted(() => ({
  signOut: vi.fn(),
  navigateToMock: vi.fn(),
  route: { fullPath: '/board/rentals?status=open&page=2' },
}));

mockNuxtImport('useSupabaseClient', () => () => ({ auth: { signOut } }));
mockNuxtImport('useRoute', () => () => route);
mockNuxtImport('navigateTo', () => navigateToMock);

const sessionNotFoundError = () =>
  new AuthApiError(RAW_SUPABASE_MESSAGE, 403, 'session_not_found');

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

test('useSessionExpiredHandler reports a session_not_found error as handled', async () => {
  const { handle } = useSessionExpiredHandler();

  await expect(handle(sessionNotFoundError())).resolves.toBe(true);
});

test('useSessionExpiredHandler signs out with local scope on session_not_found', async () => {
  const { handle } = useSessionExpiredHandler();

  await handle(sessionNotFoundError());

  expect(signOut).toHaveBeenCalledExactlyOnceWith({ scope: 'local' });
});

test('useSessionExpiredHandler redirects to login with the current full path on session_not_found', async () => {
  const { handle } = useSessionExpiredHandler();

  await handle(sessionNotFoundError());

  expect(navigateToMock).toHaveBeenCalledExactlyOnceWith({
    name: 'login',
    query: { redirect: route.fullPath },
  });
});

test('useSessionExpiredHandler shows exactly one error toast on session_not_found', async () => {
  const { handle } = useSessionExpiredHandler();
  const { toasts } = useToast();

  await handle(sessionNotFoundError());

  expect(toasts.value).toHaveLength(1);
  expect(toasts.value[0]?.type).toBe('error');
});

test('useSessionExpiredHandler shows the session expired message instead of the Supabase message', async () => {
  const { handle } = useSessionExpiredHandler();
  const { toasts } = useToast();

  await handle(sessionNotFoundError());

  expect(toasts.value[0]?.message).toBe(SESSION_EXPIRED_MESSAGE);
});
