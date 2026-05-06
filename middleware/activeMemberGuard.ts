export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo({
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    });
  }

  const currentLuakYear = getLuakYear();
  const { data } = await supabase
    .from('Memberships')
    .select('year,Payments(id)')
    .eq('user_id', user.value.sub)
    .in('year', [currentLuakYear, currentLuakYear - 1])
    .eq('Payments.approved', true);

  if (
    data === null ||
    data.length === 0
    // data.some((it) => it.Payments.length === 0)
  ) {
    // TODO: redirect to 'become a member'
    return abortNavigation(
      createError({
        status: 403,
        message: 'The member section is only for active LUAK members',
      }),
    );
  }
});
