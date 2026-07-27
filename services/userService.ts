import type { Database, Enums } from '~/types/database.types';
import type { UserId } from '~/types/user';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LuakUser } from '~/model/LuakUser';

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

  readonly getLuakUser = async (userId: UserId) => {
    const { data } = await this.supabaseClient
      .from('Users')
      .select(
        `
          Memberships(
            year,
            Payments(approved)
          ),
          BoardMembers(user_id)
        `,
      )
      .eq('id', userId)
      .eq('Memberships.Payments.approved', true)
      .single()
      .throwOnError();

    return data;
  };

  readonly getUserInfo = async (userId: UserId) => {
    const { data } = await this.supabaseClient
      .from('Users')
      .select('id, first_name, last_name, email, phone_number')
      .eq('id', userId)
      .single()
      .throwOnError();

    return {
      id: data.id as UserId,
      firstName: data.first_name,
      lastName: data.last_name,
      fullName: data.first_name + ' ' + data.last_name,
      email: data.email,
      phoneNumber: data.phone_number ?? undefined,
    };
  };

  readonly saveMembership = async (args: {
    luakYear: number;
    kbfUiaaMember: Enums<'kbf_uiaa'>;
    sportscard: boolean;
    student: Enums<'student'>;
  }) => {
    const { data: membershipId } = await this.supabaseClient
      .rpc('save_membership', {
        p_year: args.luakYear,
        p_kbf_uiaa_member: args.kbfUiaaMember,
        p_sportscard: args.sportscard,
        p_student: args.student,
      })
      .throwOnError();
    return membershipId;
  };
}

export function getFullName(user: { first_name: string; last_name: string }) {
  return user.first_name + ' ' + user.last_name;
}

type LuakUserVo = Awaited<ReturnType<UserService['getLuakUser']>>;

export const luakUserFromDb = (args: LuakUserVo): LuakUser => {
  const memberships = args.Memberships.map((x) => ({
    membershipYear: x.year,
    paid: x.Payments.some(({ approved }) => approved),
  }));
  return new LuakUser({
    memberships,
    isBoard: args.BoardMembers !== null,
    authenticated: true,
  });
};
