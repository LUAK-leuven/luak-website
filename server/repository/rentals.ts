import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import type { GearItemId } from '~/types/gear';
import { sumBy } from '~/utils/utils';
import type { RentalId } from '~/types/rental';
import { getFullName } from '~/utils/userService';
import { parseContactInfo } from '~/model/rental';

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

    return data
      .map((x) => ({
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
      }))
      .filter((x) => x.rentedAmount > 0);
  }
}
