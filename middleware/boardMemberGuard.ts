import type { Database } from '~/types/database.types';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    });
  }

  const { data } = await supabase
    .from('BoardMembers')
    .select('user_id')
    .eq('user_id', user.value.id)
    .single();

  if (data === null) {
    return navigateTo('/');
  }
  return;
});
