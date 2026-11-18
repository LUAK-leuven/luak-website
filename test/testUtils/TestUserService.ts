import type { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

import { createUserId, type UserId } from '#shared/api/rest/user';
import type { Database } from '#shared/types/database.types';
import {
  type TestUser,
  type TestUserKey,
  testUserKeys,
  testUsers,
} from '#test/TestUser';
import { getCurrentMembershipYear } from '~/model/Membership';

export class TestUserService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  readonly getMemberships = async (email: string, year: number) => {
    const { data } = await this.supabase
      .from('Users')
      .select(
        `
          Memberships(
            year,
            student,
            sportscard,
            kbf_uiaa_member
          )
        `,
      )
      .eq('email', email)
      .eq('Memberships.year', year)
      .single()
      .throwOnError();
    return data.Memberships;
  };

  readonly resetTestMemberships = async () => {
    await this.supabase
      .from('Memberships')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .throwOnError();

    for (const testUser of testUserKeys) {
      const userId = await this.getUserId(testUser);
      await this.createMemberships(userId, testUserConfig[testUser]);
    }
  };

  readonly resetTestUsers = async () => {
    await this.deleteAllUsers();
    await this.provisionTestUsers();
  };

  private readonly provisionTestUsers = async () => {
    for (const testUser of testUserKeys) {
      if ((await this.findUserId(testUsers[testUser].email)) !== null) continue;
      await this.createFullUser(
        testUsers[testUser],
        testUserConfig[testUser],
        testUser === 'boardMember',
      );
    }
  };

  private readonly createFullUser = async (
    testUser: TestUser,
    memberships: MembershipSetup[],
    isBoardMember = false,
  ) => {
    const userId = await this.createUser(testUser);

    if (isBoardMember) {
      await this.supabase
        .from('BoardMembers')
        .insert({
          user_id: userId,
        })
        .throwOnError();
    }

    await this.createMemberships(userId, memberships);
  };

  readonly getUserId = async (
    testUser: TestUser | TestUserKey,
  ): Promise<UserId> => {
    if (typeof testUser === 'string') {
      return this._getUserId(testUsers[testUser]);
    }
    return this._getUserId(testUser);
  };

  private readonly _getUserId = async (testUser: TestUser): Promise<UserId> => {
    const userId = await this.findUserId(testUser.email);
    if (userId === null)
      throw new Error(
        `Test user ${testUser.email} does not exist; test users are provisioned by the integration global setup`,
      );
    return userId;
  };

  readonly getUserInfo = async (email: string) => {
    const { data } = await this.supabase
      .from('Users')
      .select('*')
      .eq('email', email)
      .single()
      .throwOnError();

    return {
      firstName: data.first_name,
      lastName: data.last_name,
      phoneNumber: data.phone_number,
      whatsApp: data.has_whatsapp,
      newsletter: data.has_newsletter,
    };
  };

  readonly getTestUserSession = async (testUser: TestUserKey) => {
    const { email, password } = testUsers[testUser];

    const { data: user } = await this.supabase
      .from('Users')
      .select('id')
      .eq('email', email)
      .single()
      .throwOnError();
    console.log(`user - ${testUser} - ${email}`, user);

    const { data, error: signInError } =
      await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
    if (signInError)
      throw new Error(`Error signing in user ${email}:`, {
        cause: signInError,
      });
    const { error: signOutError } = await this.supabase.auth.signOut({
      scope: 'local',
    });
    if (signOutError)
      throw new Error(`Error signing out user ${email}:`, {
        cause: signOutError,
      });

    return data.session;
  };

  readonly revokeAllSessions = async (testUser: TestUser) => {
    const { error: signInError } = await this.supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });
    if (signInError)
      throw new Error(`Error signing in user ${testUser.email}:`, {
        cause: signInError,
      });

    const { error } = await this.supabase.auth.signOut({ scope: 'global' });
    if (error)
      throw new Error(`Error revoking sessions of user ${testUser.email}:`, {
        cause: error,
      });
  };

  private readonly createMemberships = async (
    userId: UserId,
    memberships: MembershipSetup[],
  ) => {
    for (const { year, paid, createdOn } of memberships) {
      const { data: membership } = await this.supabase
        .from('Memberships')
        .insert({
          created_at: createdOn,
          user_id: userId,
          year: year,
          kbf_uiaa_member: 'kbf_luak',
          sportscard: false,
          student: 'not_student',
        })
        .select('id')
        .single()
        .throwOnError();

      if (paid) {
        await this.supabase
          .from('Payments')
          .insert({
            id: crypto.randomUUID(),
            membership_id: membership.id,
            amount: 20,
            approved: true,
          })
          .throwOnError();
      }
    }
  };

  private readonly findUserId = async (
    email: string,
  ): Promise<UserId | null> => {
    const { data } = await this.supabase
      .from('Users')
      .select('id')
      .eq('email', email)
      .maybeSingle()
      .throwOnError();
    return data === null ? null : createUserId(data.id);
  };

  readonly createUser = async (testUser: TestUser) => {
    const { email, password, firstName, lastName } = testUser;

    const { error, data } = await this.supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });
    if (error)
      throw new Error(`Error creating user with email ${email}:`, {
        cause: error,
      });

    const userId = createUserId(data.user.id);

    await this.supabase
      .from('Users')
      .insert({
        id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName,
      })
      .throwOnError();

    return userId;
  };

  readonly deleteUser = async (testUser: TestUser) => {
    const { data } = await this.supabase
      .from('Users')
      .select('id')
      .eq('email', testUser.email)
      .single()
      .throwOnError();

    await this.supabase.from('Users').delete().eq('id', data.id).throwOnError();

    const { error } = await this.supabase.auth.admin.deleteUser(data.id);
    if (error)
      throw new Error(`Error deleting user with email ${testUser.email}:`, {
        cause: error,
      });
  };

  private readonly deleteAllUsers = async () => {
    await this.supabase
      .from('Users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .throwOnError();

    const { data, error } = await this.supabase.auth.admin.listUsers();
    if (error) throw new Error('Failed to list users', { cause: error });
    for (const user of data.users) {
      await this.supabase.auth.admin.deleteUser(user.id);
    }
  };
}

const currentMembershipYear = getCurrentMembershipYear();
const now = dayjs();

export type MembershipSetup = {
  year: number;
  paid: boolean;
  createdOn: string;
};

const testUserConfig: Record<keyof typeof testUsers, MembershipSetup[]> = {
  nonMember: [],
  unpaidMembership: [
    {
      year: currentMembershipYear,
      createdOn: now.toISOString(),
      paid: false,
    },
  ],
  paidLastYear: [
    {
      year: currentMembershipYear - 1,
      createdOn: now.subtract(1, 'year').toISOString(),
      paid: true,
    },
  ],
  paidMembership: [
    {
      year: currentMembershipYear,
      createdOn: now.toISOString(),
      paid: true,
    },
    {
      year: currentMembershipYear - 1,
      createdOn: now.subtract(1, 'year').toISOString(),
      paid: true,
    },
  ],
  boardMember: [
    {
      year: currentMembershipYear,
      createdOn: now.toISOString(),
      paid: true,
    },
  ],
};
