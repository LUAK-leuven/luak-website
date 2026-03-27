import type { Database } from '~/types/database.types';
import type {
  ContactInfo,
  RentalId,
  RentalUpdate,
  UnsavedRental,
} from '~/types/renal';
import type { GearInventoryId, GearItemId, TopoId } from '~/types/gear';
import type { UserId } from '~/types/user';

class GearService {
  private readonly supabase = useSupabaseClient<Database>();

  public async getAllGearItems() {
    return useAsyncData(
      'allGear',
      async () => {
        const { data: gear, error } = await this.supabase
          .from('GearItems')
          .select(
            `
            id,
            name,
            deposit_fee,
            GearInventory (
              amount
            ),
            RentedGear (
              rented_amount,
              returned_amount
            )
          `,
          )
          .eq('GearInventory.status', 'available')
          .order('name');

        if (error || gear === null) {
          console.warn('getAllGearItems:', error);
          return [];
        }

        return gear.map((gearItem) => {
          const totalAmount = sumOf(gearItem.GearInventory, 'amount');
          const rentedAmount = sumBy(
            gearItem.RentedGear,
            ({ rented_amount, returned_amount }) =>
              rented_amount - returned_amount,
          );
          return {
            id: gearItem.id as GearItemId,
            name: gearItem.name,
            totalAmount: totalAmount,
            availableAmount: totalAmount - rentedAmount,
            depositFee: gearItem.deposit_fee,
          };
        });
      },
      { lazy: true },
    );
  }

  public async getAllTopos() {
    return useAsyncData(
      'allTopos',
      async () => {
        const { data: topos, error } = await this.supabase
          .from('Topos')
          .select(
            `
            id,
            title,
            amount,
            RentedTopos (
              rented_amount,
              returned_amount
            )
            `,
          )
          .order('title');

        if (topos === null) {
          console.warn('getAllTopos', error);
          return [];
        }

        return topos.map((topo) => ({
          id: topo.id as TopoId,
          title: topo.title,
          totalAmount: topo.amount,
          availableAmount:
            topo.amount -
            sumBy(
              topo.RentedTopos,
              ({ rented_amount, returned_amount }) =>
                rented_amount - returned_amount,
            ),
        }));
      },
      { lazy: true },
    );
  }

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
    return useAsyncData(
      'rentals',
      async () => {
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
      },
      { lazy: true },
    );
  }

  public async getRental(rentalId: RentalId) {
    return useAsyncData(
      `rental-${rentalId}`,
      async () => {
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
          boardMember: getFullName(rental.board_member!),
          dateBorrow: rental.date_borrow,
          dateReturn: rental.date_return,
          depositFee: rental.deposit,
          depositReturned: rental.deposit_returned,
          gear: sortBy(
            rental.RentedGear.map((gearItem) => ({
              gearItemId: gearItem.GearItems!.id as GearItemId,
              name: gearItem.GearItems!.name,
              rentedAmount: gearItem.rented_amount,
              returnedAmount: gearItem.returned_amount,
            })),
            'name',
          ),
          topos: sortBy(
            rental.RentedTopos.map((topo) => ({
              topoId: topo.Topos!.id as TopoId,
              title: topo.Topos!.title,
              rentedAmount: topo.rented_amount,
              returnedAmount: topo.returned_amount,
            })),
            'title',
          ),
          paymentMethod: rental.payment_method,
          status: rental.status,
          comments: rental.comments ?? undefined,
        };
      },
      { lazy: true },
    );
  }

  public async updateRental(rentalUpdate: RentalUpdate): Promise<boolean> {
    const { error } = await this.supabase.rpc('update_rental', {
      p_rental_id: rentalUpdate.id,
      p_date_return: rentalUpdate.dateReturn,
      p_deposit_returned: rentalUpdate.depositReturned,
      p_status: rentalUpdate.status,
      p_gear: rentalUpdate.gear,
      p_topos: rentalUpdate.topos,
      p_comments: rentalUpdate.comments ?? null,
    });
    if (error) console.warn('updateRental: ', error);
    return error === null;
  }

  public async editRental(
    rental: Omit<Omit<UnsavedRental, 'memberId'>, 'boardMemberId'> & {
      id: RentalId;
    },
  ) {
    const { error } = await this.supabase.rpc('edit_rental', {
      p_rental_id: rental.id,
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
      p_comments: rental.comments ?? null,
    });
    if (error) console.warn('editRental: ', error);
    return error;
  }

  public async getRentalsForUser(userId: UserId) {
    return useAsyncData(
      `rentalsForUser-${userId}`,
      async () => {
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
          return undefined;
        }

        return rentals.map((rental) => ({
          id: rental.id as RentalId,
          dateBorrow: rental.date_borrow,
          dateReturn: rental.date_return,
          depositFee: rental.deposit,
          depositReturned: rental.deposit_returned,
          status: rental.status,
          gear: rental.RentedGear.map((gearItem) => ({
            gearItemId: gearItem.GearItems!.id as GearItemId,
            name: gearItem.GearItems!.name,
            rentedAmount: gearItem.rented_amount,
            returnedAmount: gearItem.returned_amount,
          })),
          topos: rental.RentedTopos.map((topo) => ({
            topoId: topo.Topos!.id as TopoId,
            title: topo.Topos!.title,
            rentedAmount: topo.rented_amount,
            returnedAmount: topo.returned_amount,
          })),
          paymentMethod: rental.payment_method,
        }));
      },
      { lazy: true },
    );
  }

  public async getCompositeGearItems() {
    return useAsyncData(
      'compositeGearItems',
      async () => {
        const { data, error } = await this.supabase
          .from('CompositeGearItems')
          .select(
            `
            name,
            CompositeGearItems_GearItems (
              gear_item_id,
              amount
            )
          `,
          );
        if (data === null) {
          if (error) console.warn('getCompositeGearItems: ', error);
          return [];
        }

        return data.map((it) => ({
          name: it.name,
          gearItemIds: it.CompositeGearItems_GearItems.map((it) => ({
            id: it.gear_item_id as GearItemId,
            amount: it.amount,
          })),
        }));
      },
      { lazy: true },
    );
  }

  public async getTopoLibrary() {
    return useAsyncData(
      'allTopos',
      async () => {
        const { data: topos, error } = await this.supabase
          .from('Topos')
          .select('*');

        if (topos === null) {
          console.warn('getAllTopos', error);
          return [];
        }

        return topos.map((topo) => ({
          amount: topo.amount,
          authors: topo.authors,
          condition: topo.condition,
          countries: topo.countries,
          details: topo.details ?? undefined,
          id: topo.id as TopoId,
          languages: topo.languages,
          place_in_library: topo.place_in_library,
          tags: topo.tags.map((it) => it.trimStart()),
          title: topo.title,
          types_of_climbing: topo.types_of_climbing,
          year_published: topo.year_published,
        }));
      },
      { lazy: true },
    );
  }

  public async getTopo(topoId: TopoId) {
    return useAsyncData(
      `topo-${topoId}`,
      async () => {
        const { data: topo, error } = await this.supabase
          .from('Topos')
          .select('*')
          .eq('id', topoId)
          .single();

        if (topo === null) {
          console.warn(`getTopo(${topoId})`, error);
          return undefined;
        }

        return {
          amount: topo.amount,
          authors: topo.authors,
          condition: topo.condition,
          countries: topo.countries,
          details: topo.details ?? undefined,
          id: topo.id as TopoId,
          languages: topo.languages,
          place_in_library: topo.place_in_library,
          tags: topo.tags.map((it) => it.trimStart()),
          title: topo.title,
          types_of_climbing: topo.types_of_climbing,
          year_published: topo.year_published,
        };
      },
      { lazy: true },
    );
  }

  public getGearItemDetails(gearItemId: GearItemId) {
    return useAsyncData(
      `gearItem-${gearItemId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('GearItems')
          .select(
            `
          id,
          name,
          lifespan,
          deposit_fee,
          GearInventory(
            id,
            details,
            purchase_date,
            production_date,
            amount,
            status
          ),
          RentedGear(
            rental_id,
            rented_amount,
            returned_amount,
            Rentals(
              Users!member_id(
                first_name,
                last_name
              ),
              contact_info
            )
          )
          `,
          )
          .eq('id', gearItemId)
          .single();
        if (data === null) {
          console.warn('gearItem', error);
          return null;
        }

        const totalAmount = sumBy(data.GearInventory, (i) =>
          i.status === 'available' ? i.amount : 0,
        );
        const rentedAmount = sumBy(
          data.RentedGear,
          (rg) => rg.rented_amount - rg.returned_amount,
        );

        return {
          id: data.id as GearItemId,
          name: data.name,
          lifespan: data.lifespan,
          depositFee: data.deposit_fee,
          totalAmount,
          availableAmount: totalAmount - rentedAmount,
          inventory: data.GearInventory.map((i) => {
            return {
              id: i.id as GearInventoryId,
              details: i.details,
              purchaseDate: i.purchase_date ?? undefined,
              productionDate: i.production_date ?? undefined,
              amount: i.amount,
              status: i.status,
            };
          }),
          rentals: data.RentedGear.filter(
            (r) => r.rented_amount !== r.returned_amount,
          ).map((r) => ({
            id: r.rental_id as RentalId,
            amount: r.rented_amount - r.returned_amount,
            memberName: r.Rentals.Users
              ? getFullName(r.Rentals.Users)
              : r.Rentals.contact_info
                ? (JSON.parse(r.Rentals.contact_info) as ContactInfo).fullName
                : 'Failed to get name',
          })),
        };
      },
      { lazy: true },
    );
  }
}

let gearServiceInstance: GearService | undefined = undefined;
export function gearService(): GearService {
  if (gearServiceInstance === undefined)
    gearServiceInstance = new GearService();
  return gearServiceInstance;
}

export type RentalDetails = ReturnType<'getRental'>;
export type PublicRentalDetails = ReturnType<'getRentalsForUser'>;

type ReturnType<K extends keyof GearService> = GearService[K] extends (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...any: any
) => Promise<{ data: { value: infer T | null | undefined } }>
  ? T extends (infer T1)[]
    ? T1
    : T
  : never;
