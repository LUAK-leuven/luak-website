import type {
  InventoryItemId,
  GearInventoryRecord,
  GearInventorySummaryRecord,
  GearItemRecord,
} from '#server/domain/inventory/InventoryItem';
import type { GearItemId } from '#shared/api/rest/gear';
import type { InventoryItemEvent } from '#shared/api/rest/inventory';

export interface InventoryRepository {
  getInventorySummary(): Promise<GearInventorySummaryRecord[]>;
  getInventoryDetails(id: GearItemId): Promise<GearInventoryRecord[]>;
  getAllGearItems(): Promise<GearItemRecord[]>;
  getGearItem(id: GearItemId): Promise<GearItemRecord>;
  getInventoryItemEvents(args: InventoryItemId): Promise<InventoryItemEvent[]>;
  getAllGearInventoryItemEvents(): Promise<
    (InventoryItemEvent & { gearInventoryId: string })[]
  >;
}
