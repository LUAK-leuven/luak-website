import type { AsyncData } from '#app';
import type { Database } from '~/types/database.types';
import type { UserId } from '~/types/user';

type UserInfo = {
  id: UserId;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
};

export function useLuakMember(): AsyncData<
  {
    userInfo: UserInfo | undefined;
    isBoard: boolean;
    hasActiveMembership: boolean;
    isMember: boolean;
  },
  unknown
> {
  return useAsyncData(
    'useLuakMember',
    async () => {
      const user = useSupabaseUser();

      if (!user.value) {
        return {
          isBoard: false,
          isMember: false,
          hasActiveMembership: false,
          userInfo: undefined,
        };
      }

      const { data, error } = await useSupabaseClient<Database>()
        .from('Users')
        .select(
          'id, first_name, last_name, email, BoardMembers (user_id), Memberships (year, Payments( approved )) ',
        )
        .eq('id', user.value.sub)
        .eq('Memberships.year', getLuakYear())
        .single();

      if (error || !data) {
        if (error) console.error(error);
        return {
          isBoard: false,
          isMember: false,
          hasActiveMembership: false,
          userInfo: undefined,
        };
      }
      const userInfo: UserInfo = {
        id: data.id as UserId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      };

      const isBoard = data.BoardMembers !== null;
      const membership = single(data.Memberships);

      if (membership === undefined)
        return {
          userInfo,
          isBoard,
          isMember: isBoard,
          hasActiveMembership: false,
        };
      if (
        membership.Payments.filter((payment) => payment.approved).length === 0
      )
        return {
          userInfo,
          isBoard,
          isMember: true,
          hasActiveMembership: false,
        };

      return {
        userInfo,
        isBoard,
        isMember: true,
        hasActiveMembership: true,
      };
    },
    { lazy: false },
  );
}
