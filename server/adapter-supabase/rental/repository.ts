import type { SupabaseClient } from '@supabase/supabase-js';
import type { GearItemId } from '#shared/api/rest/gear';
import type { TopoId } from '#shared/api/rest/topo';
import type { RentalId } from '#shared/types/rental';
import type { Database } from '#shared/types/database.types';
import type { RentalRepository } from '#server/domain/rental/repository';
import type {
  RentedGearAmount,
  RentedTopoAmount,
  RentalForItem,
} from '#server/domain/rental/rental';

export class SupabaseRentalRepository implements RentalRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getRentedGearAmounts(): Promise<RentedGearAmount[]> {
    const { data } = await this.supabaseClient
      .from('RentedGear')
      .select('gear_item_id, rented_amount, returned_amount, lost_amount')
      .throwOnError();

    return data.map((x) => ({
      gearItemId: x.gear_item_id as GearItemId,
      rentedAmount: x.rented_amount - x.returned_amount - x.lost_amount,
    }));
  }

  async getRentedTopoAmounts(): Promise<RentedTopoAmount[]> {
    const { data } = await this.supabaseClient
      .from('RentedTopos')
      .select('topo_id, rented_amount, returned_amount, lost_amount')
      .throwOnError();

    return data.map((x) => ({
      topoId: x.topo_id as TopoId,
      rentedAmount: x.rented_amount - x.returned_amount - x.lost_amount,
    }));
  }

  async getRentalsFor(gearItemId: GearItemId): Promise<RentalForItem[]> {
    const { data } = await this.supabaseClient
      .from('RentedGear')
      .select(
        'rented_amount, returned_amount, lost_amount, Rentals(id, member:Users!member_id(first_name, last_name), contact_info)',
      )
      .eq('gear_item_id', gearItemId)
      .throwOnError();

    return data.map(mapRental).filter((rental) => rental.rentedAmount > 0);
  }

  async getRentalsForTopo(topoId: TopoId): Promise<RentalForItem[]> {
    const { data } = await this.supabaseClient
      .from('RentedTopos')
      .select(
        'rented_amount, returned_amount, lost_amount, Rentals(id, member:Users!member_id(first_name, last_name), contact_info)',
      )
      .eq('topo_id', topoId)
      .throwOnError();

    return data.map(mapRental).filter((rental) => rental.rentedAmount > 0);
  }
}

const mapRental = (rental: {
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
  id: rental.Rentals.id as RentalId,
  rentedAmount:
    rental.rented_amount - rental.returned_amount - rental.lost_amount,
  memberName: getMemberName(rental.Rentals),
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
      const contact = JSON.parse(rental.contact_info) as { fullName?: string };
      if (contact.fullName) return contact.fullName;
    } catch {
      // Preserve the previous fallback for malformed historical contact data.
    }
  }

  return 'Failed to get contact info';
};
