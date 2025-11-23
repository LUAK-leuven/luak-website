import type { Database } from '~/types/database.types';

export type PublicGearInfo = {
  id: string;
  name: string;
  totalAmount: number;
  availableAmount: number;
  depositFee: number;
};

export type Rental = {
  member: string;
  boardMember: string;
  date_borrow: string;
  date_return: string;
  gear: {
    id: string;
    amount: number;
  }[];
  deposit_fee: number;
};

export type RentalDetails = {
  id: string;
  memberName: string;
  boardMember: string;
  date_borrow: string;
  date_return: string;
  gear: {
    name: string;
    amount: number;
  }[];
  deposit_fee: number;
  payment_method: 'cash' | 'transfer';
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
    rental: Rental,
  ): Promise<{ error: string | undefined }> {
    const { data, error } = await this.supabase
      .from('Rentals')
      .insert({
        board_member: rental.boardMember,
        member_id: rental.member,
        date_borrow: rental.date_borrow,
        date_return: rental.date_return,
        deposit: rental.deposit_fee,
        payment_method: 'transfer',
      })
      .select('id')
      .single();

    if (error || !data) return { error: error.message };

    const { data: data2, error: error2 } = await this.supabase
      .from('RentedGear')
      .insert(
        rental.gear.map((gearItem) => ({
          gear_item_id: gearItem.id,
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

  public async getRentals(): Promise<RentalDetails[]> {
    const { data, error } = await this.supabase.from('Rentals').select(
      `id,
        BoardMembers(
          Users(
            first_name,
            last_name
          )
        ),
        Users(
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
          amount
        )
        `,
    );

    if (error || data === null) {
      console.warn('failed to load rentals', error);
      return [];
    }

    return data.map((rental) => ({
      id: rental.id,
      memberName: getFullName(rental.Users!),
      boardMember: getFullName(rental.BoardMembers!.Users!),
      date_borrow: rental.date_borrow,
      date_return: rental.date_return,
      deposit_fee: rental.deposit,
      gear: rental.RentedGear.map((gearItem) => ({
        name: gearItem.GearItems!.name,
        amount: gearItem.amount,
      })),
      payment_method: rental.payment_method,
    }));
  }

  public async getRental(
    rental_id: string,
  ): Promise<RentalDetails | undefined> {
    const { data: rental, error } = await this.supabase
      .from('Rentals')
      .select(
        `id,
        BoardMembers(
          Users(
            first_name,
            last_name
          )
        ),
        Users(
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
          amount
        )
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
      memberName: getFullName(rental.Users!),
      boardMember: getFullName(rental.BoardMembers!.Users!),
      date_borrow: rental.date_borrow,
      date_return: rental.date_return,
      deposit_fee: rental.deposit,
      gear: rental.RentedGear.map((gearItem) => ({
        name: gearItem.GearItems!.name,
        amount: gearItem.amount,
      })),
      payment_method: rental.payment_method,
    };
  }
}

let gearServiceInstance: GearService | undefined = undefined;
export function gearService(): GearService {
  if (gearServiceInstance === undefined)
    gearServiceInstance = new GearService();
  return gearServiceInstance;
}
