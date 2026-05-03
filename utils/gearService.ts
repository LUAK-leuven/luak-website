import type { ContactInfo, RentalId } from '~/types/rental';
import type { GearInventoryId, GearItemId, TopoId } from '~/types/gear';

class GearService {
  private readonly supabase = useSupabaseClient();

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

        if (error) {
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
        if (error) {
          console.warn('getCompositeGearItems: ', error);
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
      'topoLibrary',
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

  public async getTopoDetails(topoId: TopoId) {
    return useAsyncData(
      `topo-${topoId}`,
      async () => {
        const { data: topo, error } = await this.supabase
          .from('Topos')
          .select(
            `
            *,
            RentedTopos(
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
            )`,
          )
          .eq('id', topoId)
          .single();

        if (error) {
          console.warn(`getTopo(${topoId})`, error);
          return undefined;
        }

        const rentedAmount = sumBy(
          topo.RentedTopos,
          (rt) => rt.rented_amount - rt.returned_amount,
        );

        return {
          totalAmount: topo.amount,
          availableAmount: topo.amount - rentedAmount,
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
          rentals: topo.RentedTopos.filter(
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

  public async getGearInventory() {
    return useAsyncData(
      'gearInventory',
      async () => {
        const { data: gear, error } = await this.supabase
          .from('GearItems')
          .select(
            `
            id,
            name,
            lifespan,
            GearInventory (
              id,
              details,
              production_date,
              purchase_date,
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

        if (error) {
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
            lifespan: gearItem.lifespan,
            inventory: gearItem.GearInventory.map((i) => ({
              id: i.id as GearInventoryId,
              details: i.details,
              productionDate: i.production_date,
              purchaseDate: i.purchase_date,
            })),
          };
        });
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
