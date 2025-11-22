import type { Database } from '~/types/database.types';

export type PublicGearInfo = {
  id: string;
  name: string;
  totalAmount: number;
  availableAmount: number;
  depositFee: number;
};

class GearService {
  private readonly supabase = useSupabaseClient<Database>();

  public async getPublicGearInfo(): Promise<PublicGearInfo[]> {
    const { data: gear, error } = await this.supabase.from('GearItems').select(
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
    console.log('getGear', gear);
    console.log('error', error);
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
}

let gearServiceInstance: GearService | undefined = undefined;
export function gearService(): GearService {
  if (gearServiceInstance === undefined)
    gearServiceInstance = new GearService();
  return gearServiceInstance;
}
