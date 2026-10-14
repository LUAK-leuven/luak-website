import type {
  InventoryItemId,
  InventoryItemEventWithDate,
  GearInventoryRecord,
  GearInventorySummaryRecord,
  GearItemRecord,
} from '#server/domain/inventory/InventoryItem';
import type { GearItemId } from '#shared/api/rest/gear';

export interface InventoryRepository {
  getInventorySummary(): Promise<GearInventorySummaryRecord[]>;
  getInventoryDetails(id: GearItemId): Promise<GearInventoryRecord[]>;
  getAllGearItems(): Promise<GearItemRecord[]>;
  getGearItem(id: GearItemId): Promise<GearItemRecord>;
  getInventoryItemEvents(
    args: InventoryItemId,
  ): Promise<InventoryItemEventWithDate[]>;
  getAllGearInventoryItemEvents(): Promise<
    (InventoryItemEventWithDate & { gearInventoryId: string })[]
  >;
}
