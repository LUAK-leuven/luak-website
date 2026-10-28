import {
  string as zodString,
  type infer as ZodInfer,
  literal as zodLiteral,
  union as zodUnion,
} from 'zod';

import type { EntityId } from '#shared/types/ddd';
import { dateSchema } from '#shared/types/common';
import type { RentalId } from '#shared/types/rental';
import type { InventoryItemEvent } from './inventory';

export type GearItemId = EntityId<'gearItem'>;
export type GearInventoryId = EntityId<'gearInventory'>;

export type GearInventorySummary = {
  id: GearItemId;
  name: GearName;
  totalAmount: number;
  availableAmount: number;
  earliestRetirementDate: RetirementDate;
  depositFee: number;
};

export type GearInventoryDetails = {
  id: GearItemId;
  name: GearName;
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

declare const gearNameBrand: unique symbol;
const gearNameSchema = zodString().nonempty().brand(gearNameBrand);
export type GearName = ZodInfer<typeof gearNameSchema>;
export const createGearName = (value: string): GearName =>
  gearNameSchema.parse(value);

declare const retirementDateBrand: unique symbol;
const retirementDateSchema = zodUnion([
  dateSchema,
  zodLiteral('missing info'),
  zodLiteral('infinite'),
]).brand(retirementDateBrand);
export type RetirementDate = ZodInfer<typeof retirementDateSchema>;
export const createRetirementDate = (value: string): RetirementDate =>
  retirementDateSchema.parse(value);
