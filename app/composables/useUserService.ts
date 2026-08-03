import { LuakUser } from '~/model/LuakUser';
import { luakUserFromDb, UserService } from '~/services/userService';

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
      if (data.value === undefined || data.value === 'unauthenticated')
        return LuakUser.UnauthenticatedUser();
      return luakUserFromDb(data.value);
    });
  };

  const getUserInfo = async () => {
    const { data, error } = await useAsyncData(
      `getUserInfo-${user.value?.sub ?? 'null'}`,
      async () => {
        if (user.value === null) throw new Error('User not logged in');
        return await userService.getUserInfo(user.value.sub as UserId);
      },
      { watch: [user] },
    );
    watch(error, (err) => {
      if (err) console.warn(err);
    });
    return computed(() => {
      return data.value;
    });
  };

  return {
    getMembershipInfo,
    getAllUsers,
    saveMembership: userService.saveMembership,
    getUserInfo,
  };
}
