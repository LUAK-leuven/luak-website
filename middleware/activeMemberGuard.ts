import type { Database } from '~/types/database.types';

export default defineNuxtRouteMiddleware(async (to) => {
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

  const currentLuakYear = getLuakYear();
  const { data } = await supabase
    .from('Memberships')
    .select('year,Payments(id)')
    .eq('user_id', user.value.id)
    .in('year', [currentLuakYear, currentLuakYear - 1])
    .eq('Payments.approved', true);

  if (data === null || data.length === 0) {
    return navigateTo('/');
  }

  // const isActiveMember = data.some((it) => it.Payments.length > 0);
  // if (!isActiveMember) return navigateTo('/pages/become_a_member');
  return;
});
