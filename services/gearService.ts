import type { Database } from '~/types/database.types';
import type { GearItemId, TopoId } from '~/types/gear';
import type { SupabaseClient } from '@supabase/supabase-js';

export class GearService {
  constructor(
    private readonly supabase: SupabaseClient<Database> = useSupabaseClient(),
  ) {}

  readonly getAllGearItems = async () => {
    const { data } = await this.supabase
      .from('GearItems')
      .select(
        `
          id,
          name,
          deposit_fee,
          GearInventory (
            amount
          ),
          RentedGear (
            rented_amount,
            returned_amount
          )
        `,
      )
      .order('name')
      .throwOnError();

    // TODO: filter out unavailable items

    return data.map((gearItem) => {
      const totalAmount = sumOf(gearItem.GearInventory, 'amount');
      const rentedAmount = sumBy(
        // TODO: do a correct computation based on itemEvents
        gearItem.RentedGear,
        ({ rented_amount, returned_amount }) => rented_amount - returned_amount,
      );
      return {
        id: gearItem.id as GearItemId,
        name: gearItem.name,
        totalAmount: totalAmount,
        availableAmount: totalAmount - rentedAmount,
        depositFee: gearItem.deposit_fee,
      };
    });
  };

  readonly getAllTopos = async () => {
    const { data } = await this.supabase
      .from('Topos')
      .select(
        `
          id,
          title,
          amount,
          RentedTopos (
            rented_amount,
            returned_amount
          )
        `,
      )
      .order('title')
      .throwOnError();

    return data.map((topo) => ({
      id: topo.id as TopoId,
      title: topo.title,
      totalAmount: topo.amount,
      availableAmount:
        topo.amount -
        sumBy(
          topo.RentedTopos,
          ({ rented_amount, returned_amount }) =>
            rented_amount - returned_amount,
        ),
    }));
  };

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
        id: it.gear_item_id as GearItemId,
        amount: it.amount,
      })),
    }));
  };
}
