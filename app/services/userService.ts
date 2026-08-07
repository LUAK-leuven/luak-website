import type { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { LuakUser } from '~/model/LuakUser';
import {
  getCurrentMembershipYear,
  getMembershipStatus,
  Membership,
} from '~/model/Membership';

export class UserService {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  readonly getAllUsers = async () => {
    const currentMembershipYear = getCurrentMembershipYear();

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
            created_at,
            year,
            Payments (
              approved
            )
          )
        `,
      )
      .in('Memberships.year', [
        currentMembershipYear,
        currentMembershipYear - 1,
      ])
      .eq('Memberships.Payments.approved', true)
      .throwOnError();

    return data.map((user) => {
      const memberships = user.Memberships.map((membership) =>
        membershipFromDb(membership),
      );
      const activeMembership = memberships.find(
        (membership) => membership?.isActive() ?? false,
      );
      return {
        id: user.id as UserId,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number ?? undefined,
        membershipStatus: getMembershipStatus(activeMembership),
      };
    });
  };

  readonly getLuakUser = async (userId: UserId) => {
    const { data } = await this.supabaseClient
      .from('Users')
      .select(
        `
          Memberships(
            created_at,
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
  const memberships = args.Memberships.map((x) => membershipFromDb(x)).filter(
    (x) => x !== undefined,
  );

  return new LuakUser({
    memberships,
    isBoard: args.BoardMembers !== null,
    authenticated: true,
  });
};

export const membershipFromDb = (
  args: LuakUserVo['Memberships'][number],
): Membership | undefined => {
  if (args.Payments.some(({ approved }) => approved)) {
    return new Membership({
      membershipYear: args.year,
      createdOn: dayjs(args.created_at),
    });
  } else {
    return undefined;
  }
};
