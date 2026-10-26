import type { EntityId } from '#shared/types/ddd';
import type { Date } from '#shared/types/common';
import type { RentalId } from '#shared/types/rental';
import type { InventoryItemEvent } from './inventory';

export type GearItemId = EntityId<'gearItem'>;
export type GearInventoryId = EntityId<'gearInventory'>;

export type GearInventorySummary = {
  id: GearItemId;
  name: string;
  totalAmount: number;
  availableAmount: number;
  earliestRetirementDate: RetirementDate;
  depositFee: number;
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
    retirementDate: RetirementDate;
    details: string;
    initialAmount: number;
    totalAmount: number;
    events: InventoryItemEvent[];
  }[];
  rentals: {
    id: RentalId;
    rentedAmount: number;
    memberName: string;
  }[];
};

export type RetirementDate = Date | 'missing info' | 'infinite';
