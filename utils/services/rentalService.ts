import type { Database } from '~/types/database.types';
import type {
  ContactInfo,
  RentalId,
  RentalUpdate,
  UnsavedRental,
  RentalDetails,
} from '~/types/rental';
import type { GearItemId, TopoId } from '~/types/gear';
import type { UserId } from '~/types/user';

class RentalService {
  private readonly supabase = useSupabaseClient<Database>();

  public async saveRental(
    rental: UnsavedRental,
  ): Promise<{ id: RentalId | undefined; error: string | undefined }> {
    const { error, data } = await this.supabase.rpc('create_rental', {
      p_board_member_id: rental.boardMemberId,
      p_member_id: rental.memberId ?? null,
      p_date_borrow: rental.dateBorrow,
      p_date_return: rental.dateReturn,
      p_deposit: rental.depositFee,
      p_status: rental.status,
      p_gear: Object.entries(rental.gear)
        .filter(([_, amount]) => amount !== undefined)
        .map(([id, amount]) => ({
          gear_item_id: id,
          rented_amount: amount,
        })),
      p_topos: Object.entries(rental.topos)
        .filter(([_, amount]) => amount !== undefined)
        .map(([id, amount]) => ({
          topo_id: id,
          rented_amount: amount,
        })),
      p_payment_method: rental.paymentMethod,
      p_contact_info: rental.contactInfo
        ? JSON.stringify(rental.contactInfo)
        : null,
      p_comments: rental.comments ?? null,
    });

    return { id: (data as RentalId) ?? undefined, error: error?.message };
  }

  public async getRentals() {
    const { data, error } = await this.supabase.from('Rentals').select(
      `
          id,
          member:Users!Rentals_member_id_fkey (
            first_name,
            last_name
          ),
          date_return,
          date_borrow,
          status,
          contact_info
          `,
    );

    if (error || data === null) {
      console.warn('failed to load rentals', error);
      return [];
    }

    return data.map((rental) => {
      const contactInfo: ContactInfo = rental.contact_info
        ? JSON.parse(rental.contact_info)
        : undefined;
      return {
        id: rental.id as RentalId,
        memberName: rental.member
          ? getFullName(rental.member)
          : contactInfo
            ? contactInfo.fullName
            : 'Failed to load name',
        dateReturn: rental.date_return,
        dateBorrow: rental.date_borrow,
        status: rental.status,
      };
    });
  }

  public async getRental(rentalId: RentalId): Promise<RentalDetails | null> {
    const { data: rental, error } = await this.supabase
      .from('Rentals')
      .select(
        `
          id,
          board_member:Users!Rentals_board_member_id_fkey(
            first_name,
            last_name
          ),
          member:Users!Rentals_member_id_fkey(
            first_name,
            last_name,
            email,
            phone_number,
            id
          ),
          date_borrow,
          date_return,
          deposit,
          deposit_returned,
          payment_method,
          status,
          RentedGear(
            GearItems(
              id,
              name
            ),
            rented_amount,
            returned_amount
          ),
          RentedTopos(
            Topos(
              id,
              title
            ),
            rented_amount,
            returned_amount
          ),
          contact_info,
          comments
          `,
      )
      .eq('id', rentalId)
      .single();

    if (error || rental === null) {
      console.warn(`failed to load rental ${rentalId}`, error);
      console.info('rental:', rental);
      return null;
    }

    const contactInfo: ContactInfo = rental.member
      ? {
          fullName: getFullName(rental.member),
          email: rental.member.email,
          phoneNumber: rental.member.phone_number,
        }
      : rental.contact_info
        ? JSON.parse(rental.contact_info)
        : { fullName: 'Failed to load name' };

    return {
      id: rental.id as RentalId,
      member: contactInfo,
      memberId: rental.member?.id as UserId | undefined,
      boardMember: getFullName(rental.board_member),
      dateBorrow: rental.date_borrow,
      dateReturn: rental.date_return,
      depositFee: rental.deposit,
      depositReturned: rental.deposit_returned,
      gear: sortBy(
        rental.RentedGear.map((gearItem) => ({
          id: gearItem.GearItems.id as GearItemId,
          name: gearItem.GearItems.name,
          rentedAmount: gearItem.rented_amount,
          returnedAmount: gearItem.returned_amount,
        })),
        'name',
      ),
      topos: sortBy(
        rental.RentedTopos.map((topo) => ({
          id: topo.Topos.id as TopoId,
          title: topo.Topos.title,
          rentedAmount: topo.rented_amount,
          returnedAmount: topo.returned_amount,
        })),
        'title',
      ),
      paymentMethod: rental.payment_method,
      status: rental.status,
      comments: rental.comments ?? undefined,
    };
  }

  public async updateRental(id: RentalId, rentalUpdate: Omit<RentalUpdate, 'id'>) {
    const { error } = await this.supabase.rpc('update_rental', {
      p_rental_id: id,
      p_date_return: rentalUpdate.dateReturn,
      p_deposit_returned: rentalUpdate.depositReturned,
      p_status: rentalUpdate.status,
      p_gear: rentalUpdate.gear,
      p_topos: rentalUpdate.topos,
      p_comments: rentalUpdate.comments ?? null,
    });
    if (error) console.warn('updateRental: ', error);
    return { error: error?.message };
  }

  public async editRental(
    id: RentalId,
    rental: Omit<Omit<UnsavedRental, 'memberId'>, 'boardMemberId'>,
  ) {
    const { error } = await this.supabase.rpc('edit_rental', {
      p_rental_id: id,
      p_contact_info: rental.contactInfo
        ? JSON.stringify(rental.contactInfo)
        : null,
      p_date_borrow: rental.dateBorrow,
      p_date_return: rental.dateReturn,
      p_deposit: rental.depositFee,
      p_gear: Object.entries(rental.gear)
        .filter(([_, amount]) => amount !== undefined)
        .map(([id, amount]) => ({
          gear_item_id: id,
          rented_amount: amount,
        })),
      p_topos: Object.entries(rental.topos)
        .filter(([_, amount]) => amount !== undefined)
        .map(([id, amount]) => ({
          topo_id: id,
          rented_amount: amount,
        })),
      p_payment_method: rental.paymentMethod,
      p_status: rental.status,
      p_comments: rental.comments ?? null,
    });
    if (error) console.warn('editRental: ', error);
    return { error: error?.message };
  }

  public async getRentalsForUser(userId: UserId) {
    const { data: rentals, error } = await this.supabase
      .from('Rentals')
      .select(
        `
          id,
          date_borrow,
          date_return,
          deposit,
          deposit_returned,
          payment_method,
          status,
          RentedGear(
            GearItems(
              id,
              name
            ),
            rented_amount,
            returned_amount
          ),
          RentedTopos(
            Topos(
              id,
              title
            ),
            rented_amount,
            returned_amount
          )
          `,
      )
      .eq('member_id', userId);

    if (error || rentals === null) {
      console.warn('failed to load rentals', error);
      return null;
    }

    return rentals.map((rental) => ({
      id: rental.id as RentalId,
      dateBorrow: rental.date_borrow,
      dateReturn: rental.date_return,
      depositFee: rental.deposit,
      depositReturned: rental.deposit_returned,
      status: rental.status,
      gear: sortBy(
        rental.RentedGear.map((gearItem) => ({
          gearItemId: gearItem.GearItems.id as GearItemId,
          name: gearItem.GearItems.name,
          rentedAmount: gearItem.rented_amount,
          returnedAmount: gearItem.returned_amount,
        })),
        'name',
      ),
      topos: sortBy(
        rental.RentedTopos.map((topo) => ({
          topoId: topo.Topos.id as TopoId,
          title: topo.Topos.title,
          rentedAmount: topo.rented_amount,
          returnedAmount: topo.returned_amount,
        })),
        'title',
      ),
      paymentMethod: rental.payment_method,
    }));
  }
}

let instance: RentalService | undefined = undefined;
export function rentalService(): RentalService {
  if (instance === undefined) instance = new RentalService();
  return instance;
}

export type { RentalService };
