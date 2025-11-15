import type { Database } from '~/types/database.types';

export type UserInfo = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  paid_membership: boolean;
};

export async function getUserInfo(): Promise<UserInfo[]> {
  const supabase = useSupabaseClient<Database>();
  const { data: users } = await supabase.from('Users').select(
    `
    id,
    email,
    first_name,
    last_name,
    phone_number,
    Memberships (
      year,
      Payments (
        approved
      )
    )
    `,
  );

  if (users === null) return [];
  return users.map((user) => ({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number ?? undefined,
    paid_membership:
      user.Memberships.filter(
        (membership) =>
          membership.year === getLuakYear() &&
          membership.Payments.filter((payment) => payment.approved).length > 0,
      ).length > 0,
  }));
}
