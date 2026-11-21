import type { GearInventoryDetails, GearItemId } from '#shared/api/rest/gear';

export interface InventoryService {
  getDetails(id: GearItemId): Promise<GearInventoryDetails>;
}
