import type { InventoryItemId } from '#server/domain/inventory/InventoryItem';
import type { RentalId } from '#shared/api/rest/rental';
import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';
import { GearService } from '~/services/gearService';

const GEAR = 'gear';

export function useGearService() {
  const gearService = new GearService(useSupabaseClient());

  const getCompositeGearItems = async () => {
    const { data, error, status } = await useLazyAsyncData(
      `${GEAR}-getCompositeGearItems`,
      async () => await gearService.getCompositeGearItems(),
    );
    if (error.value) console.error('getCompositeGearItems', error.value);
    return {
      data,
      status,
      error,
    };
  };

  const markAsLost = async (args: {
    rentalItemId: RentalItemId;
    rentalId: RentalId;
    inventoryItemId: InventoryItemId;
    lostAmount: number;
  }) => {
    const { error } = await gearService.markAsLost(args);
    if (error) console.error('markAsLost', error);
    return {
      error,
    };
  };

  return {
    getCompositeGearItems,
    markAsLost,
  };
}
