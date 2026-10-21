import type { AuthError } from '@supabase/supabase-js';
import { isSessionGoneError } from '~/utils/isSessionGoneError';

const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please log in again.';

export function useSessionExpiredHandler() {
  const supabase = useSupabaseClient();
  const route = useRoute();
  const { show } = useToast();

  const handle = async (error: AuthError | null): Promise<boolean> => {
    if (!isSessionGoneError(error)) {
      return false;
    }

    await supabase.auth.signOut({ scope: 'local' });
    show('error', SESSION_EXPIRED_MESSAGE);
    await navigateTo({ name: 'login', query: { redirect: route.fullPath } });

    return true;
  };

  return { handle };
}
