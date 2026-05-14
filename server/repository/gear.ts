import type { Database, Json } from '~/types/database.types';
import type { GearInventoryId, ItemEvent, TopoId } from '~/types/gear';
import type { RentalId } from '~/types/rental';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { H3Event } from '#build/types/nitro-imports';
import { serverSupabaseClient } from '#supabase/server';
import z from 'zod';

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
      event: ItemEvent;
    },
  ) {
    const { error } = await this.supabaseClient
      .from('InventoryItemEvents')
      .insert({
        item_type: args.itemType,
        item_id: args.itemId,
        event: args.event,
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
    const { data, error } = await useSupabaseClient()
      .from('InventoryItemEvents')
      .select('*')
      .eq('item_type', args.itemType)
      .eq('item_id', args.itemId);
    if (error) {
      throw new Error('Failed to fetch inventory events', { cause: error });
    }

    return data.map((it) => {
      const parsedEvent = this.parseEvent(it.event);
      return {
        ocurredOn: it.occured_on,
        ...parsedEvent,
      };
    });
  }

  private readonly itemLostEventSchema = z.object({
    eventName: z.literal('ItemLostEvent'),
    rentalId: z.uuid() as unknown as z.ZodType<RentalId>,
    lostAmount: z.number().min(1),
  });

  private readonly itemEventSchema = z.discriminatedUnion('eventName', [
    this.itemLostEventSchema,
  ]);

  private parseEvent = (jsonEvent: Json): ItemEvent => {
    return this.itemEventSchema.parse(jsonEvent);
  };
}

export const gearDao = async (event: H3Event) => {
  const supabaseClient = await serverSupabaseClient<Database>(event);
  return new GearDao(supabaseClient);
};
