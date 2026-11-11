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
    const { data, error } = await useAsyncData(
      `getMembershipInfo-${userId.value ?? 'null'}`,
      async () => {
        if (userId.value === undefined)
          if (args?.authRequired) throw new Error('User not logged in');
          else return 'unauthenticated';
        const userData = await userService.getLuakUser(userId.value);
        if (userData === null) return 'unauthenticated';
        return userData;
      },
      { watch: [userId], lazy: false },
    );
    watch(error, async (value) => {
      if (value) await useNuxtApp().runWithContext(() => showError(value));
    });
    return computed(() => {
      if (data.value === undefined || data.value === 'unauthenticated')
        return LuakUser.UnauthenticatedUser();
      return luakUserFromDb(data.value);
    });
  };

  const getUserInfo = async () => {
    const { data, error } = await useAsyncData(
      `getUserInfo-${userId.value ?? 'null'}`,
      async () => {
        if (userId.value === undefined) throw new Error('User not logged in');
        return await userService.getUserInfo(userId.value);
      },
      { watch: [userId] },
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
