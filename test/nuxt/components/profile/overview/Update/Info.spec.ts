import { beforeEach, expect, test, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import Info from '~/components/profile/overview/Update/Info.vue';

const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please log in again.';

const { authUser, navigateToMock, updateMock, route, signOut } = vi.hoisted(
  () => ({
    authUser: { value: null as { sub: string } | null },
    navigateToMock: vi.fn(),
    updateMock: vi.fn(),
    route: { fullPath: '/profile/settings' },
    signOut: vi.fn(),
  }),
);

const userRow = {
  first_name: 'Generated',
  last_name: 'User',
  has_newsletter: false,
  has_whatsapp: false,
  phone_number: null,
};

const supabaseClient = {
  auth: { signOut },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => ({
          throwOnError: () => Promise.resolve({ data: userRow }),
        }),
      }),
    }),
    update: (values: unknown) => {
      updateMock(values);
      return { eq: () => Promise.resolve({ error: null }) };
    },
  }),
};

mockNuxtImport('useSupabaseUser', () => () => authUser);
mockNuxtImport('useSupabaseClient', () => () => supabaseClient);
mockNuxtImport('useRoute', () => () => route);
mockNuxtImport('navigateTo', () => navigateToMock);

beforeEach(() => {
  clearNuxtState('luak.toast', { reset: true });
  vi.clearAllMocks();
  signOut.mockResolvedValue({ error: null });
  navigateToMock.mockResolvedValue(undefined);
  authUser.value = { sub: 'user-id' };
});

test('Info form shows session expired toast and redirects to login with the current page when there is no user at submit', async () => {
  const wrapper = await mountSuspended(Info);
  authUser.value = null;

  await wrapper.find('form').trigger('submit');

  await vi.waitFor(() => {
    expect(navigateToMock).toHaveBeenCalledExactlyOnceWith({
      name: 'login',
      query: { redirect: route.fullPath },
    });
  });
  const { toasts } = useToast();
  expect(toasts.value).toHaveLength(1);
  expect(toasts.value[0]?.message).toBe(SESSION_EXPIRED_MESSAGE);
  expect(updateMock).not.toHaveBeenCalled();
});
