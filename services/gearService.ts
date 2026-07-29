import type { Database } from '~/types/database.types';
import type { GearItemId, TopoId } from '~/types/gear';
import type { SupabaseClient } from '@supabase/supabase-js';

export class GearService {
  constructor(
    private readonly supabase: SupabaseClient<Database> = useSupabaseClient(),
  ) {}

  readonly getAllGearItems = async () => {
    const { data: gear, error } = await this.supabase
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
      .eq('GearInventory.status', 'available')
      .order('name');

    if (error) {
      throw new Error('getAllGearItems:', { cause: error });
    }

    return gear.map((gearItem) => {
      const totalAmount = sumOf(gearItem.GearInventory, 'amount');
      const rentedAmount = sumBy(
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
    const { data: topos, error } = await this.supabase
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
      .order('title');

    if (topos === null) {
      throw new Error('getAllTopos', { cause: error });
    }

    return topos.map((topo) => ({
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
    const { data, error } = await this.supabase
      .from('CompositeGearItems')
      .select(
        `
          name,
          CompositeGearItems_GearItems (
            gear_item_id,
            amount
          )
        `,
      );
    if (error) {
      throw new Error('getCompositeGearItems', { cause: error });
    }

    return data.map((it) => ({
      name: it.name,
      gearItemIds: it.CompositeGearItems_GearItems.map((it) => ({
        id: it.gear_item_id as GearItemId,
        amount: it.amount,
      })),
    }));
  };

  readonly getTopoLibrary = async () => {
    const { data: topos, error } = await this.supabase
      .from('Topos')
      .select(
        'id, authors, condition, countries, place_in_library, tags, title, types_of_climbing, year_published',
      );

    if (topos === null) {
      throw new Error('getTopoLibrary', { cause: error });
    }

    return topos.map((topo) => ({
      authors: topo.authors,
      countries: topo.countries,
      id: topo.id as TopoId,
      placeInLibrary: topo.place_in_library,
      tags: topo.tags.map((it) => it.trimStart()),
      title: topo.title,
      typesOfClimbing: topo.types_of_climbing,
      yearPublished: topo.year_published,
    }));
  };
}
