import type { AsyncData } from '#app';
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
  const user = useSupabaseUser();

  return useAsyncData(
    'useLuakMember',
    async () => {
      if (!user.value) {
        return {
          isBoard: false,
          isMember: false,
          hasActiveMembership: false,
          userInfo: undefined,
        };
      }

      const { data, error } = await useSupabaseClient()
        .from('Users')
        .select(
          'id, first_name, last_name, email, BoardMembers (user_id), Memberships (created_at, Payments( approved )) ',
        )
        .eq('id', user.value.sub)
        .gte(
          'Memberships.created_at',
          getActiveMembershipValidFromDate().toISOString(),
        )
        .single();

      if (error) {
        console.error(error);
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
      const hasMembershipInValidWindow = data.Memberships.some((membership) =>
        isActiveMembership(membership.created_at),
      );
      const hasApprovedMembership = data.Memberships.some(
        (membership) =>
          isActiveMembership(membership.created_at) &&
          membership.Payments.some((payment) => payment.approved),
      );

      if (!hasMembershipInValidWindow)
        return {
          userInfo,
          isBoard,
          isMember: isBoard,
          hasActiveMembership: false,
        };
      if (!hasApprovedMembership)
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
    { lazy: false, watch: [user] },
  );
}
