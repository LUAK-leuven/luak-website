import {
  type $brand as ZodBrand,
  enum as zodEnum,
  type infer as ZodInfer,
  string as zodString,
} from 'zod';

import { amountSchema } from '#shared/types/common';
import { entityIdSchema } from '#shared/types/ddd';

declare const _rentalItemIdBrand: unique symbol;
export const rentalItemIdSchema = entityIdSchema<typeof _rentalItemIdBrand>();
export type RentalItemId = ZodInfer<typeof rentalItemIdSchema>;
export const createRentalItemId = (value: string) =>
  rentalItemIdSchema.parse(value);

declare const _rentalItemTypeBrand: unique symbol;
export const rentalItemTypeSchema = zodEnum(['gear', 'topo']).brand<
  typeof _rentalItemTypeBrand
>();
export type RentalItemType = ZodInfer<typeof rentalItemTypeSchema>;
export const createRentalItemType = (value: string): RentalItemType =>
  rentalItemTypeSchema.parse(value);
// TODO: Find better solution
export const RentalItemType = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  gear: 'gear' as 'gear' & ZodBrand<typeof _rentalItemTypeBrand>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  topo: 'topo' as 'topo' & ZodBrand<typeof _rentalItemTypeBrand>,
} as const;

declare const _rentalItemNameBrand: unique symbol;
const rentalItemNameSchema = zodString()
  .nonempty()
  .brand<typeof _rentalItemNameBrand>();
export type RentalItemName = ZodInfer<typeof rentalItemNameSchema>;
export const createRentalItemName = (value: string): RentalItemName =>
  rentalItemNameSchema.parse(value);

declare const _outstandingAmountBrand: unique symbol;
const outstandingAmountSchema =
  amountSchema.brand<typeof _outstandingAmountBrand>();
export type OutstandingAmount = ZodInfer<typeof outstandingAmountSchema>;
export const createOutstandingAmount = (n: number): OutstandingAmount =>
  outstandingAmountSchema.parse(n);

declare const _totalAmountBrand: unique symbol;
const totalAmountSchema = amountSchema.brand<typeof _totalAmountBrand>();
export type TotalAmount = ZodInfer<typeof totalAmountSchema>;
export const createTotalAmount = (n: number): TotalAmount =>
  totalAmountSchema.parse(n);
