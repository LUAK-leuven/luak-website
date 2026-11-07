import {
  string as zodString,
  number as zodNumber,
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
  DepositFee,
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
  depositFee: DepositFee;
};

export type GearInventoryDetails = {
  id: GearItemId;
  name: GearName;
  lifespan: LifeSpanInYears;
  depositFee: DepositFee;
  totalAmount: RentalItemTotalAmount;
  availableAmount: AvailableAmount;
  inventory: {
    id: GearInventoryId;
    productionDate: ProductionDate | undefined;
    purchaseDate: PurchaseDate | undefined;
    retirementDate: RetirementDate;
    details: Details;
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

declare const _gearDetailsBrand: unique symbol;
const detailsSchema = zodString().brand<typeof _gearDetailsBrand>();
export type Details = ZodInfer<typeof detailsSchema>;
export const createDetails = (value: string): Details =>
  detailsSchema.parse(value);

declare const _lifeSpanInYearsBrand: unique symbol;
const lifeSpanInYearsSchema = zodUnion([
  zodNumber().int().positive(),
  zodLiteral('infinite'),
]).brand<typeof _lifeSpanInYearsBrand>();
export type LifeSpanInYears = ZodInfer<typeof lifeSpanInYearsSchema>;
export const createLifeSpanInYears = (
  value: number | 'infinite',
): LifeSpanInYears => lifeSpanInYearsSchema.parse(value);

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

declare const _productionDateBrand: unique symbol;
const productionDateSchema = dateSchema.brand<typeof _productionDateBrand>();
export type ProductionDate = ZodInfer<typeof productionDateSchema>;
export const createProductionDate = (value: string): ProductionDate =>
  productionDateSchema.parse(value);

declare const _purchaseDateBrand: unique symbol;
const purchaseDateSchema = dateSchema.brand<typeof _purchaseDateBrand>();
export type PurchaseDate = ZodInfer<typeof purchaseDateSchema>;
export const createPurchaseDate = (value: string): PurchaseDate =>
  purchaseDateSchema.parse(value);
