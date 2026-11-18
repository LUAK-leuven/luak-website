import type { SupabaseClient } from '@supabase/supabase-js';

import type { InventoryItemId } from '#server/domain/inventory/InventoryItem';
import { createGearItemId } from '#shared/api/rest/gear';
import type { RentalId } from '#shared/api/rest/rental';
import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';

export class GearService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  readonly getCompositeGearItems = async () => {
    const { data } = await this.supabase
      .from('CompositeGearItems')
      .select(
        `
          name,
          CompositeGearItems_GearItems (
            gear_item_id,
            amount
          )
        `,
      )
      .throwOnError();

    return data.map((it) => ({
      name: it.name,
      gearItemIds: it.CompositeGearItems_GearItems.map((it) => ({
        id: createGearItemId(it.gear_item_id),
        amount: it.amount,
      })),
    }));
  };

  readonly markAsLost = async (args: {
    rentalItemId: RentalItemId;
    rentalId: RentalId;
    inventoryItemId: InventoryItemId;
    lostAmount: number;
  }) => {
    const { error } = await this.supabase.rpc('mark_item_as_lost', {
      p_rental_item_id: args.rentalItemId,
      p_rental_id: args.rentalId,
      p_inventory_item_id: args.inventoryItemId,
      p_lost_amount: args.lostAmount,
    });
    return { error };
  };
}
