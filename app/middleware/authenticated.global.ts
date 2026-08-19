export default defineNuxtRouteMiddleware(async (to) => {
  if (isAuthenticatedRoute(to.path)) {
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

const isAuthenticatedRoute = (path: string) => {
  if (path.startsWith('/stories')) return true;
  if (path === '/pages/christmas-bets') return true;
  if (path.startsWith('/profile')) {
    if (path === '/profile/overview') return false;
    else return true;
  }
  return false;
};
