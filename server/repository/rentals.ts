import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import type { GearInventoryId, GearItemId } from '~/types/gear';
import type { GearDao } from './gear';
import { sumBy } from '~/utils/utils';

export class RentalDao {
  constructor(
    private readonly supabaseClient: SupabaseClient<Database>,
    private readonly gearRepository: GearDao,
  ) {}

  async getRentedGearAmounts() {
    const { data } = await this.supabaseClient
      .from('RentedGear')
      .select(
        'gear_item_id, rented_amount, returned_amount, GearItems(GearInventory(id))',
      )
      .throwOnError();

    const lostAmounts = await this.gearRepository.getLostAmounts();

    return data.map((x) => {
      return {
        gearItemId: x.gear_item_id as GearItemId,
        rentedAmount:
          x.rented_amount -
          x.returned_amount -
          sumBy(
            x.GearItems.GearInventory,
            ({ id: gearInventoryId }) =>
              lostAmounts[gearInventoryId as GearInventoryId] ?? 0,
          ),
      };
    });
  }
}
