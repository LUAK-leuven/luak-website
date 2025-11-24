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
  status: Enums<'rental_status'>;
};

export type RentalDetails = {
  id: string;
  memberName: string;
  boardMember: string;
  dateBorrow: string;
  dateReturn: string;
  gear: {
    name: string;
    amount: number;
    returnedAmount: number;
  }[];
  depositFee: number;
  paymentMethod: Enums<'payment_method'>;
  status: Enums<'rental_status'>;
};

class GearService {
  private readonly supabase = useSupabaseClient<Database>();

  public async getPublicGearInfo(): Promise<PublicGearInfo[]> {
    const { data: gear } = await this.supabase.from('GearItems').select(
      `
      id,
      name,
      GearCategories (
        deposit_fee
      ),
      GearInventory (
        amount,
        status
      ),
      RentedGear (
        amount
      )
    `,
    );
    if (gear === null) return [];

    function getTotalAmount(gearItem: DropNull<typeof gear>[number]) {
      return sum(
        gearItem.GearInventory.filter(
          (item) => item.status === 'available',
        ).map((item) => item.amount),
      );
    }

    return gear.map((gearItem) => ({
      id: gearItem.id,
      name: gearItem.name,
      totalAmount: getTotalAmount(gearItem),
      availableAmount:
        getTotalAmount(gearItem) -
        sum(gearItem.RentedGear.map((item) => item.amount)),
      depositFee: gearItem.GearCategories?.deposit_fee ?? -1,
    }));
  }

  public async saveRental(
    rental: UnsavedRental,
  ): Promise<{ error: string | undefined }> {
    const { data, error } = await this.supabase
      .from('Rentals')
      .insert({
        board_member: rental.boardMemberId,
        member_id: rental.memberId,
        date_borrow: rental.dateBorrow,
        date_return: rental.dateReturn,
        deposit: rental.depositFee,
        payment_method: rental.paymentMethod,
      })
      .select('id')
      .single();

    if (error || !data) return { error: error.message };

    const { data: data2, error: error2 } = await this.supabase
      .from('RentedGear')
      .insert(
        rental.gear.map((gearItem) => ({
          gear_item_id: gearItem.gearItemId,
          rental_id: data.id,
          amount: gearItem.amount,
        })),
      )
      .select();

    if (error2 || !data2) {
      const { data: data3 } = await this.supabase
        .from('Rentals')
        .delete()
        .eq('id', data.id)
        .select('*');
      if (data3 === null || data3.length === 0)
        console.error('Failed to rollback');
      return { error: error2.message };
    }

    return { error: undefined };
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
        board_member:Users!Rentals_board_member_fkey(
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
          GearItems(
            name
          ),
          amount,
          returned_amount
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
        name: gearItem.GearItems!.name,
        amount: gearItem.amount,
        returnedAmount: gearItem.returned_amount,
      })),
      paymentMethod: rental.payment_method,
      status: rental.status,
    };
  }
}

let gearServiceInstance: GearService | undefined = undefined;
export function gearService(): GearService {
  if (gearServiceInstance === undefined)
    gearServiceInstance = new GearService();
  return gearServiceInstance;
}
