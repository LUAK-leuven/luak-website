import { UserService } from '~/services/userService';
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

  const getMembershipInfo = async () => {
    const { data, error } = await useAsyncData(
      `getMembershipInfo-${user.value?.sub ?? 'null'}`,
      async () => {
        if (user.value === null) throw new Error('User not logged in');
        return await userService.getMembershipYears(user.value.sub as UserId);
      },
      { watch: [user], lazy: false },
    );
    watch(error, (value) => value && showError(value));
    return computed(() => data.value!);
  };

  return { getMembershipInfo, getAllUsers };
}
