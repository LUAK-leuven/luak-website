import type { GearInventoryDetails, GearItemId } from '#shared/api/rest/gear';
import type { RentalItemWithAvailability } from '#shared/api/rest/rental/availability';

export interface InventoryService {
  getInventorySummary(): Promise<RentalItemWithAvailability[]>;
  getDetails(id: GearItemId): Promise<GearInventoryDetails>;
}
