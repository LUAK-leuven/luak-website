import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import dayjs from 'dayjs';

export class TestDao {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

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
