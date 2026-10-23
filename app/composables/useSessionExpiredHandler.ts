const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please log in again.';

export function useSessionExpiredHandler() {
  const supabase = useSupabaseClient();
  const route = useRoute();
  const { show } = useToast();

  const handle = async (): Promise<void> => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // A failed local sign-out must not block the redirect and toast.
    }

    show('error', SESSION_EXPIRED_MESSAGE);
    await navigateTo({ name: 'login', query: { redirect: route.fullPath } });
  };

  return { handle };
}
