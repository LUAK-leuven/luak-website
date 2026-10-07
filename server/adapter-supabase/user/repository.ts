import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserRepository } from '#server/domain/user/repository';
import type { Database } from '#shared/types/database.types';

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async isBoardMember(userId: string): Promise<boolean> {
    const { data } = await this.supabaseClient
      .from('BoardMembers')
      .select('user_id')
      .eq('user_id', userId)
      .throwOnError();

    return data.length > 0;
  }
}
