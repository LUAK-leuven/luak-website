import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  RentalForItem,
  RentedTopoAmount,
} from '#server/domain/rental/rental';
import type { RentalRepository } from '#server/domain/rental/repository';
import { createGearItemId, type GearItemId } from '#shared/api/rest/gear';
import {
  createRentalId,
  createRentalMemberName,
} from '#shared/api/rest/rental';
import {
  createOutstandingAmount,
  createRentalItemId,
  type RentalItemId,
} from '#shared/api/rest/rental/rentalItem';
import { createTopoId, type TopoId } from '#shared/api/rest/topo';
import type { Database } from '#shared/types/database.types';
import { objectFrom, single } from '#shared/utils/utils';

export class SupabaseRentalRepository implements RentalRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getRentedGearAmounts(): Promise<Partial<Record<GearItemId, number[]>>> {
    const { data } = await this.supabaseClient
      .from('RentalItems')
      .select(
        'id, RentedItems(rental_item_id, rented_amount, returned_amount, lost_amount)',
      )
      .eq('item_type', 'gear')
      .throwOnError();

    return objectFrom(
      data.map((x) => [
        createGearItemId(x.id),
        x.RentedItems.map((y) =>
          createOutstandingAmount(
            y.rented_amount - y.returned_amount - y.lost_amount,
          ),
        ),
      ]),
    );
  }

  async getRentedTopoAmounts(): Promise<RentedTopoAmount[]> {
    const { data } = await this.supabaseClient
      .from('RentedItems')
      .select(
        'RentalItems!inner(id, Inventory(id)), rented_amount, returned_amount, lost_amount',
      )
      .eq('RentalItems.item_type', 'topo')
      .throwOnError();

    return data.map((x) => ({
      topoId: createTopoId(single(x.RentalItems.Inventory).id),
      rentalItemId: createRentalItemId(x.RentalItems.id),
      rentedAmount: createOutstandingAmount(
        x.rented_amount - x.returned_amount - x.lost_amount,
      ),
    }));
  }

  async getRentalsFor(rentalItemId: RentalItemId): Promise<RentalForItem[]> {
    const { data } = await this.supabaseClient
      .from('RentedItems')
      .select(
        'rented_amount, returned_amount, lost_amount, Rentals(id, member:Users!member_id(first_name, last_name), contact_info)',
      )
      .eq('rental_item_id', rentalItemId)
      .throwOnError();

    return data.map(mapRental).filter((rental) => rental.rentedAmount > 0);
  }

  async getRentalsForTopo(topoId: TopoId): Promise<RentalForItem[]> {
    const { data } = await this.supabaseClient
      .from('Inventory')
      .select(
        `
          RentalItems(
            RentedItems(
              rented_amount, returned_amount, lost_amount, Rentals(id, member:Users!member_id(first_name, last_name), contact_info)
            )
          )
        `,
      )
      .eq('id', topoId)
      .single()
      .throwOnError();

    if (data.RentalItems === null)
      throw new Error('No rental item found for this topo');

    return data.RentalItems.RentedItems.map(mapRental).filter(
      (rental) => rental.rentedAmount > 0,
    );
  }
}

export const mapRental = (rental: {
  rented_amount: number;
  returned_amount: number;
  lost_amount: number;
  Rentals: {
    id: string;
    member: {
      first_name: string;
      last_name: string;
    } | null;
    contact_info: string | null;
  };
}): RentalForItem => ({
  id: createRentalId(rental.Rentals.id),
  rentedAmount: createOutstandingAmount(
    rental.rented_amount - rental.returned_amount - rental.lost_amount,
  ),
  memberName: createRentalMemberName(getMemberName(rental.Rentals)),
});

const getMemberName = (rental: {
  member: { first_name: string; last_name: string } | null;
  contact_info: string | null;
}): string => {
  if (rental.member) {
    return `${rental.member.first_name} ${rental.member.last_name}`;
  }

  if (rental.contact_info) {
    try {
      // TODO: Use proper schema validation for contact info.
      const contact: unknown = JSON.parse(rental.contact_info);
      if (
        typeof contact === 'object' &&
        contact !== null &&
        'fullName' in contact &&
        typeof contact.fullName === 'string' &&
        contact.fullName
      ) {
        return contact.fullName;
      }
    } catch (e) {
      console.error('Failed to parse contact info:', e);
    }
  }

  return 'Failed to get contact info';
};
