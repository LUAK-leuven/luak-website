import type { EntityId } from './ddd';

export type GearItemId = EntityId<'gearItem'>;
export type GearInventoryId = EntityId<'gearInventory'>;
export type TopoId = EntityId<'topo'>;

export type GearInventorySummary = {
  id: GearItemId;
  name: string;
  totalAmount: number;
  availableAmount: number;
  earliestRetirementDate: string | undefined;
};
