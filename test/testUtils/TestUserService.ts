import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/shared/types/database.types';
import { testUsers, type TestUserKey } from '#test/TestUser';
import dayjs from 'dayjs';
import { getCurrentMembershipYear } from '~/app/model/Membership';

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
    const { error: e1 } = await this.supabase
      .from('Memberships')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (e1) throw new Error(`Error deleting Memberships table:`, { cause: e1 });

    for (const testUser of Object.keys(testUsers) as TestUserKey[]) {
      await this.createMemberships(testUser);
    }
  };

  readonly getUserInfo = async (testUser: TestUserKey) => {
    const { data } = await this.supabase
      .from('Users')
      .select('*')
      .eq('email', testUsers[testUser].email)
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

  readonly resetTestUser = async (testUser: TestUserKey) => {
    const { email, firstName, lastName, password } = testUsers[testUser];
    const { data } = await this.supabase
      .from('Users')
      .update({
        email: email,
        first_name: firstName,
        last_name: lastName,
      })
      .eq('email', email)
      .select('id')
      .single()
      .throwOnError();

    // This will reset the auth session and breaks everything.
    // await this.supabase.auth.admin.updateUserById(data.id, {
    //   password: password,
    // });
  };

  readonly getTestUserSession = async (testUser: TestUserKey) => {
    const { email, password } = testUsers[testUser];

    const { data: user } = await this.supabase
      .from('Users')
      .select('id')
      .eq('email', email)
      .maybeSingle()
      .throwOnError();
    console.log(`user - ${testUser} - ${email}`, user);
    if (user === null) {
      await this.createTestUser(testUser);
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error)
      throw new Error(`Error signing in user ${email}:`, { cause: error });
    const { error: err } = await this.supabase.auth.signOut();
    if (err)
      throw new Error(`Error signing out user ${email}:`, { cause: err });

    return data.session;
  };

  private readonly createMemberships = async (testUser: TestUserKey) => {
    const userId = await this.getTestUserId(testUser);

    for (const { year, paid, createdOn } of testUserConfig[testUser]) {
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

  private readonly getTestUserId = async (testUser: TestUserKey) => {
    const { data } = await this.supabase
      .from('Users')
      .select('id')
      .eq('email', testUsers[testUser].email)
      .maybeSingle()
      .throwOnError();

    if (data === null) {
      return await this.createTestUser(testUser);
    } else {
      return data.id;
    }
  };

  private readonly createTestUser = async (testUser: TestUserKey) => {
    const { email, password, firstName, lastName } = testUsers[testUser];

    const { error, data } = await this.supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });
    if (error)
      throw new Error(`Error creating user with email ${email}:`, {
        cause: error,
      });

    const userId = data.user.id;

    await this.supabase
      .from('Users')
      .insert({
        id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName,
      })
      .throwOnError();

    if (testUser === 'boardMember') {
      await this.supabase
        .from('BoardMembers')
        .insert({
          user_id: userId,
        })
        .throwOnError();
    }

    return userId;
  };
}

const currentMembershipYear = getCurrentMembershipYear();
const now = dayjs();

const testUserConfig: Record<
  keyof typeof testUsers,
  { year: number; paid: boolean; createdOn: string }[]
> = {
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
