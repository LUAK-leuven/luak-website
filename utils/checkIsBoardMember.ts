import type { Database } from '~/types/database.types';

// Check if user is a board member
export default async function (): Promise<
  | {
      isBoardMember: true;
      memberInfo: { id: string; name: string };
    }
  | {
      isBoardMember: false;
      error: string;
      memberInfo?: undefined;
    }
> {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  if (!user.value) {
    return {
      isBoardMember: false,
      error: 'You must be logged in to view this page.',
    };
  }

  const { data, error } = await supabase
    .from('Users')
    .select('first_name, last_name, BoardMembers (user_id)')
    .eq('id', user.value.id)
    .single();

  if (error || !data.BoardMembers) {
    return {
      isBoardMember: false,
      error: 'You do not have permission to view this page.',
    };
  }

  return {
    isBoardMember: true,
    memberInfo: {
      id: data.BoardMembers.user_id,
      name: data.first_name + ' ' + data.last_name,
    },
  };
}
