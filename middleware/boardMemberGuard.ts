export default defineNuxtRouteMiddleware(async (to, from) => {
  const boardMember = await useLuakMember();
  if (!boardMember.isBoard) {
    return abortNavigation(`Unauthorized`);
  }
  return;
});
