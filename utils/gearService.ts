import type { Database, Enums } from '~/types/database.types';

export type PublicGearInfo = {
  id: string;
  name: string;
  totalAmount: number;
  availableAmount: number;
  depositFee: number;
};

export type UnsavedRental = {
  memberId?: string;
  boardMemberId: string;
  dateBorrow: string;
  dateReturn: string;
  gear: Record<string, number>;
  topos: Record<string, number>;
  depositFee: number;
  paymentMethod: Enums<'payment_method'>;
  contactInfo?: ContactInfo;
};

type ContactInfo = {
  fullName: string;
  email?: string;
  phoneNumber?: string;
};

export type RentalSummary = {
  id: string;
  memberName: string;
  dateReturn: string;
  dateBorrow: string;
  status: Enums<'rental_status'>;
};

export type TopoSumary = {
  id: string;
  title: string;
  totalAmount: number;
  availableAmount: number;
};

export type RentalDetails = {
  id: string;
  member: ContactInfo;
  boardMember: string;
  dateBorrow: string;
  dateReturn: string;
  gear: {
    id: string;
    name: string;
    rentedAmount: number;
    actualAmount: number;
  }[];
  topos: {
    rentedToposId: string;
    title: string;
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
  gear: Record<string, number>;
  topos: Record<string, number>;
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

    return gear
      .map((gearItem) => {
        const totalAmount = sumOf(gearItem.GearInventory, 'amount');
        return {
          id: gearItem.id,
          name: gearItem.name,
          totalAmount: totalAmount,
          availableAmount:
            totalAmount - sumOf(gearItem.RentedGear, 'actual_amount'),
          depositFee: gearItem.GearCategories!.deposit_fee,
        };
      })
      .filter((gearItem) => gearItem.totalAmount > 0);
  }

  public async getAllTopos(): Promise<TopoSumary[]> {
    const { data: topos, error } = await this.supabase
      .from('Topos')
      .select(
        `
      id,
      title,
      amount,
      RentedTopos (
        actual_amount
      )
      `,
      )
      .gt('RentedTopos.actual_amount', 0);

    if (topos === null) {
      console.warn('getAllTopos', error);
      return [];
    }

    return topos.map((topo) => ({
      id: topo.id,
      title: topo.title,
      totalAmount: topo.amount,
      availableAmount: topo.amount - sumOf(topo.RentedTopos, 'actual_amount'),
    }));
  }

  public async saveRental(
    rental: UnsavedRental,
  ): Promise<{ id: string | undefined; error: string | undefined }> {
    const { error, data } = await this.supabase.rpc('create_rental', {
      p_board_member_id: rental.boardMemberId,
      p_member_id: rental.memberId ?? null,
      p_date_borrow: rental.dateBorrow,
      p_date_return: rental.dateReturn,
      p_deposit: rental.depositFee,
      p_status: 'not_returned',
      p_gear: Object.entries(rental.gear).map(([id, amount]) => ({
        gear_item_id: id,
        rented_amount: amount,
      })),
      p_topos: Object.entries(rental.topos).map(([id, amount]) => ({
        topo_id: id,
        rented_amount: amount,
      })),
      p_payment_method: rental.paymentMethod,
      p_contact_info: rental.contactInfo
        ? JSON.stringify(rental.contactInfo)
        : null,
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
        id: rental.id,
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
          last_name,
          email,
          phone_number
        ),
        date_borrow,
        date_return,
        deposit,
        payment_method,
        status,
        RentedGear(
          id,
          GearItems(
            name
          ),
          rented_amount,
          actual_amount
        ),
        RentedTopos(
          id,
          Topos(
            id,
            title
          ),
          rented_amount,
          actual_amount
        ),
        contact_info
        `,
      )
      .eq('id', rental_id)
      .single();

    if (error || rental === null) {
      console.warn('failed to load rentals', error);
      return undefined;
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
      id: rental.id,
      member: contactInfo,
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
      topos: rental.RentedTopos.map((topo) => ({
        rentedToposId: topo.id,
        title: topo.Topos!.title,
        rentedAmount: topo.rented_amount,
        actualAmount: topo.actual_amount,
      })),
      paymentMethod: rental.payment_method,
      status: rental.status,
    };
  }

  public async updateRental(rentalUpdate: RentalUpdate): Promise<boolean> {
    const { error } = await this.supabase.rpc('update_rental', {
      p_rental_id: rentalUpdate.id,
      p_date_return: rentalUpdate.dateReturn,
      p_deposit_fee: rentalUpdate.depositFee,
      p_status: rentalUpdate.status,
      p_gear: Object.entries(rentalUpdate.gear).map(([id, amount]) => ({
        id: id,
        actualAmount: amount,
      })),
      p_topos: Object.entries(rentalUpdate.topos).map(([id, amount]) => ({
        id: id,
        actualAmount: amount,
      })),
    });
    if (error) console.warn('updateRental: ', error);
    return error === null;
  }
}

let gearServiceInstance: GearService | undefined = undefined;
export function gearService(): GearService {
  if (gearServiceInstance === undefined)
    gearServiceInstance = new GearService();
  return gearServiceInstance;
}
