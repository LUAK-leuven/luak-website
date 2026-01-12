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
  status: Enums<'rental_status'>;
  comments?: string;
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

export type PublicRentalDetails = {
  id: string;
  dateBorrow: string;
  dateReturn: string;
  gear: {
    gearItemId: string;
    name: string;
    rentedAmount: number;
    actualAmount: number;
  }[];
  topos: {
    topoId: string;
    title: string;
    rentedAmount: number;
    actualAmount: number;
  }[];
  depositFee: number;
  depositReturned: boolean;
  paymentMethod: Enums<'payment_method'>;
};

export type RentalDetails = PublicRentalDetails & {
  member: ContactInfo & { id?: string };
  boardMember: string;
  status: Enums<'rental_status'>;
  comments: string | undefined;
};

export type RentalUpdate = {
  id: string;
  dateReturn: string;
  gear: Record<string, number>;
  topos: Record<string, number>;
  depositReturned: boolean;
  status: Enums<'rental_status'>;
  comments: string | undefined;
};

export type GearDetails = {
  lifespan: number;
  name: string;
  totalAmount: number;
  availableAmount: number;
  gearInventory: {
    id: string;
    details: string;
    purchaseDate: string | undefined;
    productionDate: string | undefined;
    amount: number;
  }[];
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

  public async getGearInventory(): Promise<GearDetails[]> {
    const { data: gear, error } = await this.supabase
      .from('GearCategories')
      .select(
        `
      name,
      lifespan,
      GearItems (
        name,
        GearInventory (
          id,
          details,
          purchase_date,
          production_date,
          amount
        ),
        RentedGear (
          actual_amount
        )
      )
    `,
      )
      .eq('GearItems.GearInventory.status', 'available');
    if (gear === null) {
      console.warn(error);
      return [];
    }

    return gear.flatMap((gearCategory) =>
      gearCategory.GearItems.map((gearItem) => ({
        lifespan: gearCategory.lifespan,
        name: gearItem.name,
        totalAmount: sumOf(gearItem.GearInventory, 'amount'),
        availableAmount:
          sumOf(gearItem.GearInventory, 'amount') -
          sumOf(gearItem.RentedGear, 'actual_amount'),
        gearInventory: gearItem.GearInventory.map((x) => ({
          id: x.id,
          details: x.details,
          purchaseDate: x.purchase_date ?? undefined,
          productionDate: x.production_date ?? undefined,
          amount: x.amount,
        })),
      })),
    );
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
    console.log(rental);
    const { error, data } = await this.supabase.rpc('create_rental', {
      p_board_member_id: rental.boardMemberId,
      p_member_id: rental.memberId ?? null,
      p_date_borrow: rental.dateBorrow,
      p_date_return: rental.dateReturn,
      p_deposit: rental.depositFee,
      p_status: rental.status,
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
      p_comments: rental.comments ?? null,
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
          actual_amount
        ),
        RentedTopos(
          Topos(
            id,
            title
          ),
          rented_amount,
          actual_amount
        ),
        contact_info,
        comments
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
          id: rental.member.id,
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
      depositReturned: rental.deposit_returned,
      gear: rental.RentedGear.map((gearItem) => ({
        gearItemId: gearItem.GearItems!.id,
        name: gearItem.GearItems!.name,
        rentedAmount: gearItem.rented_amount,
        actualAmount: gearItem.actual_amount,
      })),
      topos: rental.RentedTopos.map((topo) => ({
        topoId: topo.Topos!.id,
        title: topo.Topos!.title,
        rentedAmount: topo.rented_amount,
        actualAmount: topo.actual_amount,
      })),
      paymentMethod: rental.payment_method,
      status: rental.status,
      comments: rental.comments ?? undefined,
    };
  }

  public async updateRental(rentalUpdate: RentalUpdate): Promise<boolean> {
    const { error } = await this.supabase.rpc('update_rental', {
      p_rental_id: rentalUpdate.id,
      p_date_return: rentalUpdate.dateReturn,
      p_deposit_returned: rentalUpdate.depositReturned,
      p_status: rentalUpdate.status,
      p_gear: Object.entries(rentalUpdate.gear).map(([id, amount]) => ({
        id: id,
        actualAmount: amount,
      })),
      p_topos: Object.entries(rentalUpdate.topos).map(([id, amount]) => ({
        id: id,
        actualAmount: amount,
      })),
      p_comments: rentalUpdate.comments ?? null,
    });
    if (error) console.warn('updateRental: ', error);
    return error === null;
  }

  public async editRental(rental: UnsavedRental & { id: string }) {
    const { error } = await this.supabase.rpc('edit_rental', {
      p_rental_id: rental.id,
      // p_member_id: rental.memberId ?? null,
      p_contact_info: rental.contactInfo
        ? JSON.stringify(rental.contactInfo)
        : null,
      p_date_borrow: rental.dateBorrow,
      p_date_return: rental.dateReturn,
      p_deposit: rental.depositFee,
      p_gear: Object.entries(rental.gear).map(([id, amount]) => ({
        gear_item_id: id,
        rented_amount: amount,
      })),
      p_topos: Object.entries(rental.topos).map(([id, amount]) => ({
        topo_id: id,
        rented_amount: amount,
      })),
      p_payment_method: rental.paymentMethod,
      p_status: rental.status,
      p_comments: null,
    });
    if (error) console.warn('editRental: ', error);
    return error === null;
  }

  public async getActiveRentalsForUser(
    userId: string,
  ): Promise<PublicRentalDetails[] | undefined> {
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
        RentedGear(
          GearItems(
            id,
            name
          ),
          rented_amount,
          actual_amount
        ),
        RentedTopos(
          Topos(
            id,
            title
          ),
          rented_amount,
          actual_amount
        )
        `,
      )
      .eq('member_id', userId)
      .neq('status', 'returned');

    if (error || rentals === null) {
      console.warn('failed to load rentals', error);
      return undefined;
    }

    return rentals.map((rental) => ({
      id: rental.id,
      dateBorrow: rental.date_borrow,
      dateReturn: rental.date_return,
      depositFee: rental.deposit,
      depositReturned: rental.deposit_returned,
      gear: rental.RentedGear.map((gearItem) => ({
        gearItemId: gearItem.GearItems!.id,
        name: gearItem.GearItems!.name,
        rentedAmount: gearItem.rented_amount,
        actualAmount: gearItem.actual_amount,
      })),
      topos: rental.RentedTopos.map((topo) => ({
        topoId: topo.Topos!.id,
        title: topo.Topos!.title,
        rentedAmount: topo.rented_amount,
        actualAmount: topo.actual_amount,
      })),
      paymentMethod: rental.payment_method,
    }));
  }

  public async getReturnedRentalsForUser(
    userId: string,
  ): Promise<PublicRentalDetails[] | undefined> {
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
        RentedGear(
          GearItems(
            id,
            name
          ),
          rented_amount,
          actual_amount
        ),
        RentedTopos(
          Topos(
            id,
            title
          ),
          rented_amount,
          actual_amount
        )
        `,
      )
      .eq('member_id', userId)
      .eq('status', 'returned');

    if (error || rentals === null) {
      console.warn('failed to load rentals', error);
      return undefined;
    }

    return rentals.map((rental) => ({
      id: rental.id,
      dateBorrow: rental.date_borrow,
      dateReturn: rental.date_return,
      depositFee: rental.deposit,
      depositReturned: rental.deposit_returned,
      gear: rental.RentedGear.map((gearItem) => ({
        gearItemId: gearItem.GearItems!.id,
        name: gearItem.GearItems!.name,
        rentedAmount: gearItem.rented_amount,
        actualAmount: gearItem.actual_amount,
      })),
      topos: rental.RentedTopos.map((topo) => ({
        topoId: topo.Topos!.id,
        title: topo.Topos!.title,
        rentedAmount: topo.rented_amount,
        actualAmount: topo.actual_amount,
      })),
      paymentMethod: rental.payment_method,
    }));
  }
}

let gearServiceInstance: GearService | undefined = undefined;
export function gearService(): GearService {
  if (gearServiceInstance === undefined)
    gearServiceInstance = new GearService();
  return gearServiceInstance;
}
