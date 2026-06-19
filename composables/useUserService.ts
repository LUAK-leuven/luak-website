import { LuakUser } from '~/model/LuakUser';
import { luakUserFromDb, UserService } from '~/services/userService';
import type { UserId } from '~/types/user';

export function useUserService() {
  const user = useSupabaseUser();
  const supabaseClient = useSupabaseClient();
  const userService = new UserService(supabaseClient);

  const getAllUsers = async () =>
    await useLazyAsyncData(
      'getAllUsers',
      async () => await userService.getAllUsers(),
    );

  const getMembershipInfo = async (args?: { authRequired?: boolean }) => {
    const { data, error } = await useAsyncData(
      `getMembershipInfo-${user.value?.sub ?? 'null'}`,
      async () => {
        if (user.value === null)
          if (args?.authRequired) throw new Error('User not logged in');
          else return 'unauthenticated';
        return await userService.getLuakUser(user.value.sub as UserId);
      },
      { watch: [user], lazy: false },
    );
    watch(error, (value) => {
      if (value) throw showError(value);
    });
    return computed(() => {
      if (data.value === null || data.value === 'unauthenticated')
        return LuakUser.UnauthenticatedUser();
      return luakUserFromDb(data.value);
    });
  };

  // TODO fix usafe !
  const getUserInfo = async (userId: UserId = user.value!.sub as UserId) => {
    const { data, error } = await useAsyncData(
      `getUserInfo-${userId}`,
      async () => await userService.getUserInfo(userId),
    );
    return computed(() => {
      if (error.value) throw showError(error.value);
      return data.value!;
    });
  };

  return {
    getMembershipInfo,
    getAllUsers,
    saveMembership: userService.saveMembership,
    getUserInfo,
  };
}
