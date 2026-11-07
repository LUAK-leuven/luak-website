import {
  string as zodString,
  type infer as ZodInfer,
  literal as zodLiteral,
  union as zodUnion,
} from 'zod';

import { dateSchema } from '#shared/types/common';
import type {
  AvailableAmount,
  InitialAmount,
  InventoryItemEvent,
  InventoryItemTotalAmount,
} from '#shared/api/rest/inventory';
import type {
  RentalId,
  OutstandingAmount,
  RentalMemberName,
  RentalItemTotalAmount,
} from '#shared/api/rest/rental';
import { entityIdSchema } from '#shared/types/ddd';

declare const _gearItemIdBrand: unique symbol;
export const gearItemIdSchema = entityIdSchema<typeof _gearItemIdBrand>();
export type GearItemId = ZodInfer<typeof gearItemIdSchema>;
export const createGearItemId = (value: string) =>
  gearItemIdSchema.parse(value);

declare const _gearInventoryIdBrand: unique symbol;
const gearInventoryIdSchema = entityIdSchema<typeof _gearInventoryIdBrand>();
export type GearInventoryId = ZodInfer<typeof gearInventoryIdSchema>;
export const createGearInventoryId = (value: string) =>
  gearInventoryIdSchema.parse(value);

export type GearInventorySummary = {
  id: GearItemId;
  name: GearName;
  totalAmount: RentalItemTotalAmount;
  availableAmount: AvailableAmount;
  earliestRetirementDate: RetirementDate;
  depositFee: number;
};

export type GearInventoryDetails = {
  id: GearItemId;
  name: GearName;
  lifespan: number;
  depositFee: number;
  totalAmount: RentalItemTotalAmount;
  availableAmount: AvailableAmount;
  inventory: {
    id: GearInventoryId;
    productionDate: string | undefined;
    purchaseDate: string | undefined;
    retirementDate: RetirementDate;
    details: string;
    initialAmount: InitialAmount;
    totalAmount: InventoryItemTotalAmount;
    events: InventoryItemEvent[];
  }[];
  rentals: {
    id: RentalId;
    rentedAmount: OutstandingAmount;
    memberName: RentalMemberName;
  }[];
};

declare const _gearNameBrand: unique symbol;
const gearNameSchema = zodString().nonempty().brand<typeof _gearNameBrand>();
export type GearName = ZodInfer<typeof gearNameSchema>;
export const createGearName = (value: string): GearName =>
  gearNameSchema.parse(value);

declare const _retirementDateBrand: unique symbol;
const retirementDateSchema = zodUnion([
  dateSchema,
  zodLiteral('missing info'),
  zodLiteral('infinite'),
]).brand<typeof _retirementDateBrand>();
export type RetirementDate = ZodInfer<typeof retirementDateSchema>;
export const createRetirementDate = (value: string): RetirementDate =>
  retirementDateSchema.parse(value);
