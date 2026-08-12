import type { SupabaseClient } from '@supabase/supabase-js';
import { contactInfoFromDb } from '~/services/rentalService';

export class RentalDao {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getRentedGearAmounts() {
    const { data } = await this.supabaseClient
      .from('RentedGear')
      .select('gear_item_id, rented_amount, returned_amount, lost_amount')
      .throwOnError();

    return data.map((x) => {
      return {
        gearItemId: x.gear_item_id as GearItemId,
        rentedAmount: x.rented_amount - x.returned_amount - x.lost_amount,
      };
    });
  }

  async getRentedTopoAmounts() {
    const { data } = await this.supabaseClient
      .from('RentedTopos')
      .select('topo_id, rented_amount, returned_amount, lost_amount')
      .throwOnError();

    return data.map((x) => {
      return {
        topoId: x.topo_id as TopoId,
        rentedAmount: x.rented_amount - x.returned_amount - x.lost_amount,
      };
    });
  }

  async getRentalsFor(gearItemId: GearItemId): Promise<
    {
      id: RentalId;
      rentedAmount: number;
      memberName: string;
    }[]
  > {
    const { data } = await this.supabaseClient
      .from('RentedGear')
      .select(
        `
          rented_amount,
          returned_amount,
          lost_amount,
          Rentals(
            id,
            member:Users!member_id(
              first_name,
              last_name
            ),
            contact_info
          )
        `,
      )
      .eq('gear_item_id', gearItemId)
      .throwOnError();

    return data
      .map((x) => ({
        id: x.Rentals.id as RentalId,
        rentedAmount: x.rented_amount - x.returned_amount - x.lost_amount,
        memberName: contactInfoFromDb(x.Rentals).fullName,
      }))
      .filter((x) => x.rentedAmount > 0);
  }

  async getRentalsForTopo(topoId: TopoId): Promise<
    {
      id: RentalId;
      rentedAmount: number;
      memberName: string;
    }[]
  > {
    const { data } = await this.supabaseClient
      .from('RentedTopos')
      .select(
        `
          rented_amount,
          returned_amount,
          lost_amount,
          Rentals(
            id,
            member:Users!member_id(
              first_name,
              last_name
            ),
            contact_info
          )
        `,
      )
      .eq('topo_id', topoId)
      .throwOnError();

    return data
      .map((x) => ({
        id: x.Rentals.id as RentalId,
        rentedAmount: x.rented_amount - x.returned_amount - x.lost_amount,
        memberName: contactInfoFromDb(x.Rentals).fullName,
      }))
      .filter((x) => x.rentedAmount > 0);
  }
}
