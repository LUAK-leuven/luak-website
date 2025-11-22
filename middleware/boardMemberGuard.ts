export default defineNuxtRouteMiddleware(async (to, from) => {
  const boardMember = await checkIsBoardMember();
  if (!boardMember.isBoardMember) {
    return abortNavigation(`Unauthorized: ${boardMember.error}`);
  }
  return;
});
