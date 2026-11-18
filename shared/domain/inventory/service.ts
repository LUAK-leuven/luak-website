import type {
  GearInventoryDetails,
  GearInventorySummary,
  GearItemId,
} from '#shared/api/rest/gear';

export interface InventoryService {
  getInventorySummary(): Promise<GearInventorySummary[]>;
  getDetails(id: GearItemId): Promise<GearInventoryDetails>;
}
