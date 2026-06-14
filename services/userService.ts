import type { Database } from '~/types/database.types';
import type { UserId } from '~/types/user';
import type { SupabaseClient } from '@supabase/supabase-js';

export class UserService {
  constructor(
    private readonly supabaseClient: SupabaseClient<Database> = useSupabaseClient(),
  ) {}

  readonly getAllUsers = async () => {
    const { data } = await this.supabaseClient
      .from('Users')
      .select(
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
      )
      .throwOnError();

    return data.map((user) => ({
      id: user.id as UserId,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number ?? undefined,
      paid_membership:
        user.Memberships.filter(
          (membership) =>
            membership.year === getLuakYear() &&
            membership.Payments.filter((payment) => payment.approved).length >
              0,
        ).length > 0,
    }));
  };

  readonly getMembershipYears = async (userId: UserId) => {
    const { data } = await this.supabaseClient
      .from('Memberships')
      .select('year, Payments(approved)')
      .eq('user_id', userId)
      .eq('Payments.approved', true)
      .throwOnError();

    const membershipYears = data.map((x) => ({
      membershipYear: x.year,
      paid: x.Payments.some(({ approved }) => approved),
    }));

    return membershipYears;
  };
}

export function getFullName(user: { first_name: string; last_name: string }) {
  return user.first_name + ' ' + user.last_name;
}
