import type { Database, Enums } from '~/types/database.types';

export type PublicGearInfo = {
  id: string;
  name: string;
  totalAmount: number;
  availableAmount: number;
  depositFee: number;
};

export type UnsavedRental = {
  memberId: string;
  boardMemberId: string;
  dateBorrow: string;
  dateReturn: string;
  gear: {
    gearItemId: string;
    amount: number;
  }[];
  depositFee: number;
  paymentMethod: Enums<'payment_method'>;
};

export type RentalSummary = {
  id: string;
  memberName: string;
  dateReturn: string;
  dateBorrow: string;
  status: Enums<'rental_status'>;
};

export type RentalDetails = {
  id: string;
  memberName: string;
  boardMember: string;
  dateBorrow: string;
  dateReturn: string;
  gear: {
    id: string;
    name: string;
    rentedAmount: number;
    actualAmount: number;
  }[];
  depositFee: number;
  paymentMethod: Enums<'payment_method'>;
  status: Enums<'rental_status'>;
};

export type RentalUpdate = {
  id: string;
  dateReturn: string;
  gear: {
    id: string;
    actualAmount: number;
  }[];
  depositFee: number;
  status: Enums<'rental_status'>;
};

class GearService {
  private readonly supabase = useSupabaseClient<Database>();

  public async getPublicGearInfo(): Promise<PublicGearInfo[]> {
    const { data: gear } = await this.supabase
      .from('GearItems')
      .select(
        `
      id,
      name,
      GearCategories (
        deposit_fee
      ),
      GearInventory (
        amount
      ),
      RentedGear (
        actual_amount
      )
    `,
      )
      .gt('RentedGear.actual_amount', 0)
      .eq('GearInventory.status', 'available');
    if (gear === null) return [];

    return gear.map((gearItem) => {
      const totalAmount = sumOf(gearItem.GearInventory, 'amount');
      return {
        id: gearItem.id,
        name: gearItem.name,
        totalAmount: totalAmount,
        availableAmount:
          totalAmount - sumOf(gearItem.RentedGear, 'actual_amount'),
        depositFee: gearItem.GearCategories!.deposit_fee,
      };
    });
  }

  public async saveRental(
    rental: UnsavedRental,
  ): Promise<{ id: string | undefined; error: string | undefined }> {
    const { error, data } = await this.supabase.rpc('create_rental', {
      p_board_member_id: rental.boardMemberId,
      p_member_id: rental.memberId,
      p_date_borrow: rental.dateBorrow,
      p_date_return: rental.dateReturn,
      p_deposit: rental.depositFee,
      p_status: 'not_returned',
      p_gear: rental.gear.map((gearItem) => ({
        gear_item_id: gearItem.gearItemId,
        rented_amount: gearItem.amount,
      })),
      p_payment_method: rental.paymentMethod,
    });

    return { id: data ?? undefined, error: error?.message };
  }

  public async getRentals(): Promise<RentalSummary[]> {
    const { data, error } = await this.supabase.from('Rentals').select(
      `
      id,
      member:Users!Rentals_member_id_fkey (
        first_name,
        last_name
      ),
      date_return,
      date_borrow,
      status
      `,
    );

    if (error || data === null) {
      console.warn('failed to load rentals', error);
      return [];
    }

    return data.map((rental) => ({
      id: rental.id,
      memberName: getFullName(rental.member!),
      dateReturn: rental.date_return,
      dateBorrow: rental.date_borrow,
      status: rental.status,
    }));
  }

  public async getRental(
    rental_id: string,
  ): Promise<RentalDetails | undefined> {
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
          last_name
        ),
        date_borrow,
        date_return,
        deposit,
        payment_method,
        RentedGear(
          id,
          GearItems(
            name
          ),
          rented_amount,
          actual_amount
        ),
        status
        `,
      )
      .eq('id', rental_id)
      .single();

    if (error || rental === null) {
      console.warn('failed to load rentals', error);
      return undefined;
    }

    return {
      id: rental.id,
      memberName: getFullName(rental.member!),
      boardMember: getFullName(rental.board_member!),
      dateBorrow: rental.date_borrow,
      dateReturn: rental.date_return,
      depositFee: rental.deposit,
      gear: rental.RentedGear.map((gearItem) => ({
        id: gearItem.id,
        name: gearItem.GearItems!.name,
        rentedAmount: gearItem.rented_amount,
        actualAmount: gearItem.actual_amount,
      })),
      paymentMethod: rental.payment_method,
      status: rental.status,
    };
  }

  public async updateRental(rentalUpdate: RentalUpdate): Promise<boolean> {
    console.log('saving:', rentalUpdate);
    const { error } = await this.supabase.rpc('update_rental', {
      p_rental_id: rentalUpdate.id,
      p_date_return: rentalUpdate.dateReturn,
      p_deposit_fee: rentalUpdate.depositFee,
      p_status: rentalUpdate.status,
      p_gear: rentalUpdate.gear,
    });
    console.log('updateRental: ', error);
    return error === null;
  }
}

let gearServiceInstance: GearService | undefined = undefined;
export function gearService(): GearService {
  if (gearServiceInstance === undefined)
    gearServiceInstance = new GearService();
  return gearServiceInstance;
}
