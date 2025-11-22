import type { Database } from '~/types/database.types';

type UserInfo = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
};

type MemberType =
  | 'unauthenticated'
  | 'no_membership'
  | 'unpaid_membership'
  | 'paid_membership'
  | 'board_member';

export default async function (): Promise<{
  membershipType: MemberType;
  userInfo: UserInfo | undefined;
  isBoard: boolean;
  isMember: boolean;
}> {
  const isBoard = false;
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  if (!user.value) {
    return {
      membershipType: 'unauthenticated',
      isBoard,
      isMember: false,
      userInfo: undefined,
    };
  }

  const { data, error } = await supabase
    .from('Users')
    .select(
      'id, first_name, last_name, email, BoardMembers (user_id), Memberships (year, Payments( approved )) ',
    )
    .eq('id', user.value.id)
    .single();

  if (error || !data) {
    console.error(error);
    return {
      membershipType: 'unauthenticated',
      isBoard,
      isMember: false,
      userInfo: undefined,
    };
  }
  const userInfo: UserInfo = {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
  };

  if (data.BoardMembers)
    return {
      membershipType: 'board_member',
      userInfo,
      isMember: true,
      isBoard: true,
    };

  const membership = data.Memberships.filter(
    (membership) => membership.year === getLuakYear(),
  );
  if (membership.length === 0)
    return {
      membershipType: 'no_membership',
      userInfo,
      isBoard,
      isMember: false,
    };
  if (membership[0].Payments.filter((payment) => payment.approved).length === 0)
    return {
      membershipType: 'unpaid_membership',
      userInfo,
      isBoard,
      isMember: true,
    };

  return {
    membershipType: 'paid_membership',
    userInfo,
    isBoard,
    isMember: true,
  };
}
