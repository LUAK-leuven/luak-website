export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/stories') || to.path === '/pages/christmas-bets') {
    const user = useSupabaseUser();

    if (!user.value) {
      return navigateTo({
        name: 'login',
        query: {
          redirect: to.fullPath,
        },
      });
    }
  }
});
