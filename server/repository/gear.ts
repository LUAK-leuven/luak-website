import type { Database } from '~/types/database.types';
import type { GearInventoryId, TopoId } from '~/types/gear';
import type { RentalId } from '~/types/rental';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { H3Event } from '#build/types/nitro-imports';
import { serverSupabaseClient } from '#supabase/server';
import { parseEvent } from '~/model/gear';
import type { ItemEvent } from '~/model/gear';

class GearDao {
  private readonly supabaseClient;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabaseClient = supabaseClient;
  }

  public async saveInventoryItemEvent(
    args: (
      | {
          itemType: 'topo';
          itemId: TopoId;
        }
      | {
          itemType: 'gear';
          itemId: GearInventoryId;
        }
    ) & {
      rentalId: RentalId | undefined;
      event: ItemEvent;
    },
  ) {
    const { error } = await this.supabaseClient
      .from('InventoryItemEvents')
      .insert({
        item_type: args.itemType,
        item_id: args.itemId,
        event: args.event,
        rental_id: args.rentalId,
      });
    if (error) {
      throw new Error('Failed to save changes', { cause: error });
    }
  }

  public async getInventoryItemEvents(
    args:
      | {
          itemType: 'topo';
          itemId: TopoId;
        }
      | {
          itemType: 'gear';
          itemId: GearInventoryId;
        },
  ): Promise<(ItemEvent & { ocurredOn: string })[]> {
    const { data, error } = await this.supabaseClient
      .from('InventoryItemEvents')
      .select('*')
      .eq('item_type', args.itemType)
      .eq('item_id', args.itemId);
    if (error) {
      throw new Error('Failed to fetch inventory events', { cause: error });
    }

    return data.map((it) => {
      const parsedEvent = parseEvent(it.event);
      return {
        ocurredOn: it.occured_on,
        ...parsedEvent,
      };
    });
  }
}

export const gearDao = async (event: H3Event) => {
  const supabaseClient = await serverSupabaseClient<Database>(event);
  return new GearDao(supabaseClient);
};
