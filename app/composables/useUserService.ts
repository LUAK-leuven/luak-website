import { createUserId } from '#shared/api/rest/user';
import { LuakUser } from '~/model/LuakUser';
import { luakUserFromDb, UserService } from '~/services/userService';

export function useUserService() {
  const user = useSupabaseUser();
  const supabaseClient = useSupabaseClient();
  const userService = new UserService(supabaseClient);
  const userId = computed(() =>
    user.value === null ? undefined : createUserId(user.value.sub),
  );

  const getAllUsers = async () =>
    await useLazyAsyncData(
      'getAllUsers',
      async () => await userService.getAllUsers(),
    );

  const getMembershipInfo = async (args?: { authRequired?: boolean }) => {
    const membershipInfo = await useRequiredAsyncData(
      `getMembershipInfo-${userId.value ?? 'null'}`,
      async () => {
        if (userId.value === undefined)
          if (args?.authRequired) throw new Error('User not logged in');
          else return 'unauthenticated';
        const userData = await userService.getLuakUser(userId.value);
        if (userData === null) return 'unauthenticated';
        return userData;
      },
      { watch: [userId] },
    );
    return computed(() => {
      if (membershipInfo.value === 'unauthenticated')
        return LuakUser.UnauthenticatedUser();
      return luakUserFromDb(membershipInfo.value);
    });
  };

  const getUserInfo = async () =>
    await useRequiredAsyncData(
      `getUserInfo-${userId.value ?? 'null'}`,
      async () => {
        if (userId.value === undefined) throw new Error('User not logged in');
        return await userService.getUserInfo(userId.value);
      },
      { watch: [userId] },
    );

  return {
    getMembershipInfo,
    getAllUsers,
    saveMembership: userService.saveMembership,
    getUserInfo,
  };
}
