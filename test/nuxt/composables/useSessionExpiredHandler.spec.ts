import {
  AuthApiError,
  AuthSessionMissingError,
  AuthWeakPasswordError,
  type AuthError,
} from '@supabase/supabase-js';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useSessionExpiredHandler } from '~/composables/useSessionExpiredHandler';

const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please log in again.';
const RAW_SUPABASE_MESSAGE = 'Auth session missing!';

const SESSION_GONE_CODES = [
  'session_expired',
  'refresh_token_not_found',
  'refresh_token_already_used',
] as const;

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

const apiErrorWithCode = (code: (typeof SESSION_GONE_CODES)[number]) =>
  new AuthApiError(RAW_SUPABASE_MESSAGE, 403, code);

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

test.each(SESSION_GONE_CODES)(
  'useSessionExpiredHandler reports a %s error as handled',
  async (code) => {
    const { handle } = useSessionExpiredHandler();

    await expect(handle(apiErrorWithCode(code))).resolves.toBe(true);
  },
);

test.each(SESSION_GONE_CODES)(
  'useSessionExpiredHandler redirects to login with the current full path on %s',
  async (code) => {
    const { handle } = useSessionExpiredHandler();

    await handle(apiErrorWithCode(code));

    expect(navigateToMock).toHaveBeenCalledExactlyOnceWith({
      name: 'login',
      query: { redirect: route.fullPath },
    });
  },
);

test.each(SESSION_GONE_CODES)(
  'useSessionExpiredHandler shows exactly one session expired error toast on %s',
  async (code) => {
    const { handle } = useSessionExpiredHandler();
    const { toasts } = useToast();

    await handle(apiErrorWithCode(code));

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0]).toMatchObject({
      type: 'error',
      message: SESSION_EXPIRED_MESSAGE,
    });
  },
);

test('useSessionExpiredHandler reports an AuthSessionMissingError as handled', async () => {
  const { handle } = useSessionExpiredHandler();
  const error: AuthError = new AuthSessionMissingError();

  await expect(handle(error)).resolves.toBe(true);
});

const unrelatedErrors: [string, () => AuthError][] = [
  [
    'a weak_password error',
    () =>
      new AuthWeakPasswordError(
        'Password should be at least 6 characters.',
        422,
        ['length'],
      ),
  ],
  [
    'an AuthApiError with an unfamiliar code',
    () => new AuthApiError('Something new happened', 400, 'some_future_code'),
  ],
];

test.each(unrelatedErrors)(
  'useSessionExpiredHandler reports %s as not handled',
  async (_name, createError) => {
    const { handle } = useSessionExpiredHandler();

    await expect(handle(createError())).resolves.toBe(false);
  },
);

test.each(unrelatedErrors)(
  'useSessionExpiredHandler does not sign out on %s',
  async (_name, createError) => {
    const { handle } = useSessionExpiredHandler();

    await handle(createError());

    expect(signOut).not.toHaveBeenCalled();
  },
);

test.each(unrelatedErrors)(
  'useSessionExpiredHandler does not navigate on %s',
  async (_name, createError) => {
    const { handle } = useSessionExpiredHandler();

    await handle(createError());

    expect(navigateToMock).not.toHaveBeenCalled();
  },
);

test.each(unrelatedErrors)(
  'useSessionExpiredHandler shows no toast on %s',
  async (_name, createError) => {
    const { handle } = useSessionExpiredHandler();
    const { toasts } = useToast();

    await handle(createError());

    expect(toasts.value).toHaveLength(0);
  },
);

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

    await handle(sessionNotFoundError());

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

    await handle(sessionNotFoundError());

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0]).toMatchObject({
      type: 'error',
      message: SESSION_EXPIRED_MESSAGE,
    });
  },
);

test.each(localSignOutFailures)(
  'useSessionExpiredHandler still reports handled and does not reject when local sign-out fails with %s',
  async (_name, failSignOut) => {
    failSignOut();
    const { handle } = useSessionExpiredHandler();

    await expect(handle(sessionNotFoundError())).resolves.toBe(true);
  },
);

test('useSessionExpiredHandler reports a null error as not handled', async () => {
  const { handle } = useSessionExpiredHandler();

  await expect(handle(null)).resolves.toBe(false);
});

test('useSessionExpiredHandler does not sign out on a null error', async () => {
  const { handle } = useSessionExpiredHandler();

  await handle(null);

  expect(signOut).not.toHaveBeenCalled();
});

test('useSessionExpiredHandler does not navigate on a null error', async () => {
  const { handle } = useSessionExpiredHandler();

  await handle(null);

  expect(navigateToMock).not.toHaveBeenCalled();
});

test('useSessionExpiredHandler shows no toast on a null error', async () => {
  const { handle } = useSessionExpiredHandler();
  const { toasts } = useToast();

  await handle(null);

  expect(toasts.value).toHaveLength(0);
});
