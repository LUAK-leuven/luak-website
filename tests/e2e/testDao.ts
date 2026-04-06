import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';

class TestDao {
  private readonly supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // IMPORTANT: service role
  );

  async clearRentals() {
    const { error } = await this.supabase
      .from('Rentals')
      .delete()
      .neq('deposit', -1);
    if (error) console.warn(`Failed to clear rentals;\nerror: ${error}`);
  }
}

let instance: TestDao | undefined;

export const testDao = () => {
  if (instance === undefined) instance = new TestDao();
  return instance;
};
