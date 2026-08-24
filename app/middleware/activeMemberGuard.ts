export default defineNuxtRouteMiddleware(async (to) => {
  const luakUser = (await useUserService().getMembershipInfo()).value;
  if (!luakUser.authenticated) {
    return navigateTo({
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    });
  }

  if (!luakUser.permissions.memberSection) {
    // TODO: Make custom error page wit link to 'become a member'
    return abortNavigation(
      createError({
        status: 403,
        message: 'The member section is only for active LUAK members',
      }),
    );
  }
});
