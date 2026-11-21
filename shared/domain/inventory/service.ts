import type { GearInventoryDetails, GearItemId } from '#shared/api/rest/gear';
import type { RentalItemWithAvailability } from '#shared/api/rest/rental/availability';
import type { RentalItemType } from '#shared/api/rest/rental/rentalItem';

export interface InventoryService {
  getInventorySummary(): Promise<RentalItemWithAvailability[]>;
  getDetails(id: GearItemId): Promise<GearInventoryDetails>;

  getRentalItemsWithAvailability(
    itemType: RentalItemType,
  ): Promise<RentalItemWithAvailability[]>;
}
