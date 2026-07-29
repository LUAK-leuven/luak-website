import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import dayjs from 'dayjs';
import type { InventoryItemId } from '~/model/inventory/InventoryItem';
import type { ItemEvent } from '~/model/inventory/ItemEvent';

export class TestDao {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  readonly cleanInventoryEvents = async () => {
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
  };

  readonly clearRentals = async () => {
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
  };

  readonly addInventoryItemEvent = async (args: {
    itemId: InventoryItemId;
    event: ItemEvent;
  }) => {
    await this.supabase.from('InventoryItemEvents').insert({
      item_id: args.itemId.itemId,
      item_type: args.itemId.itemType,
      event: args.event,
    });
  };
}
