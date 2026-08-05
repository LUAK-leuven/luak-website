import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/shared/types/database.types';
import getLuakYear from '~/shared/utils/getLuakYear';
import { testUsers, type TestUserKey } from './TestUser';
import dayjs from 'dayjs';

export class TestUserService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  readonly getMemberships = async (
    email: string,
    year: number = getLuakYear(),
  ) => {
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

    await this.createMemberships();
  };

  private readonly createMemberships = async () => {
    for (const testUser of Object.keys(testUsers) as TestUserKey[]) {
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

const luakYear = getLuakYear();
const now = dayjs();

const testUserConfig: Record<
  keyof typeof testUsers,
  { year: number; paid: boolean; createdOn: string }[]
> = {
  nonMember: [],
  unpaidMembership: [
    {
      year: luakYear,
      createdOn: now.toISOString(),
      paid: false,
    },
  ],
  paidLastYear: [
    {
      year: luakYear - 1,
      createdOn: now.subtract(1, 'year').toISOString(),
      paid: true,
    },
  ],
  paidMembership: [
    {
      year: luakYear,
      createdOn: now.toISOString(),
      paid: true,
    },
    {
      year: luakYear - 1,
      createdOn: now.subtract(1, 'year').toISOString(),
      paid: true,
    },
  ],
  boardMember: [
    {
      year: luakYear,
      createdOn: now.toISOString(),
      paid: true,
    },
  ],
};
