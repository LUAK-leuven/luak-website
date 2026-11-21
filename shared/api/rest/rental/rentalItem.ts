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

const itemTypeValues = ['gear', 'topo'] as const;
type ItemTypeValues = (typeof itemTypeValues)[number];
declare const _rentalItemTypeBrand: unique symbol;
export const rentalItemTypeSchema =
  zodEnum(itemTypeValues).brand<typeof _rentalItemTypeBrand>();
export type RentalItemType = ZodInfer<typeof rentalItemTypeSchema>;

const asRentalItemType = <T extends ItemTypeValues>(
  value: T,
): T & ZodBrand<typeof _rentalItemTypeBrand> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  rentalItemTypeSchema.parse(value) as T &
    ZodBrand<typeof _rentalItemTypeBrand>;

export const RentalItemType = {
  gear: asRentalItemType('gear'),
  topo: asRentalItemType('topo'),
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
