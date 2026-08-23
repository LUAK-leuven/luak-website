import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import {
  AUTH_USER_WAIT_TIMEOUT,
  useWaitForAuthUser,
} from '~/composables/useWaitForAuthUser';

const authUser = ref<{ id: string } | null>(null);

mockNuxtImport('useSupabaseUser', () => () => authUser);

beforeEach(() => {
  vi.useFakeTimers();
  authUser.value = null;
});

afterEach(() => {
  vi.useRealTimers();
});

test('useWaitForAuthUser resolves immediately when a user already exists', async () => {
  authUser.value = { id: 'user-id' };

  const waitForAuthUser = useWaitForAuthUser();

  await expect(waitForAuthUser).resolves.toBeUndefined();
});

test('useWaitForAuthUser resolves when the user becomes available', async () => {
  const waitForAuthUser = useWaitForAuthUser();

  authUser.value = { id: 'user-id' };
  await nextTick();

  await expect(waitForAuthUser).resolves.toBeUndefined();
});

test('useWaitForAuthUser resolves after the timeout without a user', async () => {
  const waitForAuthUser = useWaitForAuthUser();

  await vi.advanceTimersByTimeAsync(AUTH_USER_WAIT_TIMEOUT);

  await expect(waitForAuthUser).resolves.toBeUndefined();
});
