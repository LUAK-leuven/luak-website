import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import type { GearItemId, TopoId } from '~/types/gear';
import type { GearDao } from './gear';
import { sumBy } from '~/utils/utils';
import type { RentalId } from '~/types/rental';
import { getFullName } from '~/utils/userService';
import { parseContactInfo } from '~/model/rental';

export class RentalDao {
  constructor(
    private readonly supabaseClient: SupabaseClient<Database>,
    private readonly gearRepository: GearDao,
  ) {}

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

  async getRentalsFor(gearItemId: GearItemId): Promise<
    {
      id: RentalId;
      rentedAmount: number;
      memberName: string;
    }[]
  > {
    const { data } = await this.supabaseClient
      .from('Rentals')
      .select(
        `
          id,
          RentedGear(
            gear_item_id,
            rented_amount,
            returned_amount,
            lost_amount
          ),
          Users!member_id(
            first_name,
            last_name
          ),
          contact_info
        `,
      )
      .eq('RentedGear.gear_item_id', gearItemId)
      .throwOnError();

    return data.map((x) => ({
      id: x.id as RentalId,
      rentedAmount: sumBy(
        x.RentedGear,
        (x) => x.rented_amount - x.returned_amount - x.lost_amount,
      ),
      memberName: x.Users
        ? getFullName(x.Users)
        : x.contact_info
          ? parseContactInfo(JSON.parse(x.contact_info)).fullName
          : 'Failed to get name',
    }));
  }

  async incrementLostAmount(
    args: {
      rentalId: RentalId;
      lostAmount: number;
    } & (
      | {
          itemId: GearItemId;
          itemType: 'gear';
        }
      | {
          itemId: TopoId;
          itemType: 'topo';
        }
    ),
  ) {
    switch (args.itemType) {
      case 'gear':
        await this.incrementLostGearAmount(args);
        break;
      case 'topo':
        await this.incrementLostTopoAmount(args);
        break;
    }
  }

  private async incrementLostTopoAmount(args: {
    rentalId: RentalId;
    lostAmount: number;
    itemId: TopoId;
  }) {
    const { data } = await this.supabaseClient
      .from('RentedTopos')
      .select('lost_amount')
      .eq('rental_id', args.rentalId)
      .eq('topo_id', args.itemId)
      .single()
      .throwOnError();

    await this.supabaseClient
      .from('RentedTopos')
      .update({
        lost_amount: data.lost_amount + args.lostAmount,
      })
      .eq('rental_id', args.rentalId)
      .eq('topo_id', args.itemId)
      .throwOnError();
  }

  private async incrementLostGearAmount(args: {
    rentalId: RentalId;
    lostAmount: number;
    itemId: GearItemId;
  }) {
    const { data } = await this.supabaseClient
      .from('RentedGear')
      .select('lost_amount')
      .eq('rental_id', args.rentalId)
      .eq('gear_item_id', args.itemId)
      .single()
      .throwOnError();

    await this.supabaseClient
      .from('RentedGear')
      .update({
        lost_amount: data.lost_amount + args.lostAmount,
      })
      .eq('rental_id', args.rentalId)
      .eq('gear_item_id', args.itemId)
      .throwOnError();
  }
}
