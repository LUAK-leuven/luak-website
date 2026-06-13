import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import getLuakYear from '~/utils/getLuakYear';

export class UserTestService {
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
}
