import type { Database } from '~/types/database.types';

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/board')) {
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
      .eq('user_id', user.value.sub);

    if (data === null || data.length === 0) {
      return abortNavigation(
        createError({
          statusCode: 403,
          statusMessage: 'Unauthorized',
        }),
      );
    }
  }
});
