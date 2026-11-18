import type {
  GearInventoryRecord,
  GearInventorySummaryRecord,
  GearItemRecord,
  InventoryItemId,
} from '#server/domain/inventory/InventoryItem';
import type { GearInventoryId, GearItemId } from '#shared/api/rest/gear';
import type { InventoryItemEvent } from '#shared/api/rest/inventory';

export interface InventoryRepository {
  getInventorySummary(): Promise<GearInventorySummaryRecord[]>;
  getInventoryDetails(id: GearItemId): Promise<GearInventoryRecord[]>;
  getAllGearItems(): Promise<GearItemRecord[]>;
  getGearItem(id: GearItemId): Promise<GearItemRecord>;
  getInventoryItemEvents(
    inventoryItemId: InventoryItemId,
  ): Promise<InventoryItemEvent[]>;
  getAllGearInventoryItemEvents(): Promise<
    (InventoryItemEvent & { gearInventoryId: GearInventoryId })[]
  >;
}
