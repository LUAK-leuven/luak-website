import type { ItemEvent } from '~/model/gear';
import type { EntityId } from './ddd';
import type { RentalId } from './rental';

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

export type GearInventoryDetails = {
  id: GearItemId;
  name: string;
  lifespan: number;
  depositFee: number;
  totalAmount: number;
  availableAmount: number;
  inventory: {
    id: GearInventoryId;
    productionDate: string | undefined;
    purchaseDate: string | undefined;
    retirementDate: string | undefined;
    details: string;
    totalAmount: number;
    status: 'available' | 'archived';
    events: (ItemEvent & { occuredOn: string })[];
  }[];
  rentals: {
    id: RentalId;
    rentedAmount: number;
    memberName: string;
  }[];
};
