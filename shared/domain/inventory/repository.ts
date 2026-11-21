import type { GearInventoryId, GearItemId } from '#shared/api/rest/gear';
import type { InventoryItemEvent } from '#shared/api/rest/inventory';
import type {
  GearInventoryRecord,
  GearItemRecord,
  InventoryItemId,
} from '#shared/domain/inventory/InventoryItem';

export interface InventoryRepository {
  getInventoryDetails(id: GearItemId): Promise<GearInventoryRecord[]>;
  getGearItem(id: GearItemId): Promise<GearItemRecord>;
  getInventoryItemEvents(
    inventoryItemId: InventoryItemId,
  ): Promise<InventoryItemEvent[]>;
  getAllGearInventoryItemEvents(): Promise<
    (InventoryItemEvent & { gearInventoryId: GearInventoryId })[]
  >;
}
