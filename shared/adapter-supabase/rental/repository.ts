import type { SupabaseClient } from '@supabase/supabase-js';

import { outstandingAmountOf } from '#shared/adapter-supabase/rental/outstandingAmount';
import * as RentedItems from '#shared/adapter-supabase/rental/RentedItemsTable';
import {
  createRentalId,
  createRentalMemberName,
} from '#shared/api/rest/rental';
import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';
import type { RentalForItem } from '#shared/domain/rental/rental';
import type { RentalRepository } from '#shared/domain/rental/repository';
import type { Database } from '#shared/types/database.types';

export class SupabaseRentalRepository implements RentalRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getRentalsFor(rentalItemId: RentalItemId): Promise<RentalForItem[]> {
    const { data } = await this.supabaseClient
      .from(RentedItems.table)
      .select(
        `
          ${RentedItems.availabilityColumns},
          Rentals(id, member:Users!member_id(first_name, last_name), contact_info)
        `,
      )
      .eq('rental_item_id', rentalItemId)
      .throwOnError();

    return data.map(mapRental).filter((rental) => rental.rentedAmount > 0);
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
  rentedAmount: outstandingAmountOf(rental),
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
