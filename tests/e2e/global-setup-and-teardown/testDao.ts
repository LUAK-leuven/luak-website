import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import { validateSupabaseUrl } from '~/tests/e2e/global-setup-and-teardown/validateSupabaseUrl';
import dayjs from 'dayjs';

class TestDao {
  private readonly supabase;

  constructor() {
    validateSupabaseUrl(process.env.NUXT_PUBLIC_SUPABASE_URL!);
    this.supabase = createClient<Database>(
      process.env.NUXT_PUBLIC_SUPABASE_URL!,
      process.env.NUXT_SUPABASE_SECRET_KEY!, // IMPORTANT: secret key in order to bypass RLS
    );
  }

  async cleanInventoryEvents() {
    const { error } = await this.supabase
      .from('InventoryItemEvents')
      .delete()
      .neq('occured_on', dayjs().toISOString());
    if (error) {
      console.warn(`
Failed to clear InventoryItemEvents:
  error: ${JSON.stringify(error)}
      `);
    }
  }

  async clearRentals() {
    const { error } = await this.supabase
      .from('Rentals')
      .delete()
      .neq('deposit', -1);
    if (error) {
      console.warn(`
Failed to clear rentals:
  error: ${JSON.stringify(error)}
      `);
    }
  }
}

let instance: TestDao | undefined;

export const testDao = () => {
  if (instance === undefined) instance = new TestDao();
  return instance;
};
