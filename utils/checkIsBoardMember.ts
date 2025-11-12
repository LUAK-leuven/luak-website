// Check if user is a board member
export default async function (): Promise<{
  boardMember: boolean;
  error?: string;
}> {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  if (!user.value) {
    return {
      boardMember: false,
      error: 'You must be logged in to view this page.',
    };
  }

  const { data, error: boardError } = await supabase
    .from('BoardMembers')
    .select('*')
    .eq('user_id', user.value.id)
    .single();

  if (boardError || !data) {
    return {
      boardMember: false,
      error: 'You do not have permission to view this page.',
    };
  }

  return { boardMember: true };
}
