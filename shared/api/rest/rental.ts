import { string as zodString, type infer as ZodInfer } from 'zod';
import { entityIdSchema } from '#shared/types/ddd';
import { amountSchema } from '#shared/types/common';

declare const _rentalMemberNameBrand: unique symbol;
const rentalMemberNameSchema = zodString()
  .nonempty()
  .brand<typeof _rentalMemberNameBrand>();
export type RentalMemberName = ZodInfer<typeof rentalMemberNameSchema>;
export const createRentalMemberName = (value: string): RentalMemberName =>
  rentalMemberNameSchema.parse(value);

declare const _rentalIdBrand: unique symbol;
export const rentalIdSchema = entityIdSchema<typeof _rentalIdBrand>();
export type RentalId = ZodInfer<typeof rentalIdSchema>;
export const createRentalId = (value: string) => rentalIdSchema.parse(value);

declare const _outstandingAmountBrand: unique symbol;
const outstandingAmountSchema =
  amountSchema.brand<typeof _outstandingAmountBrand>();
export type OutstandingAmount = ZodInfer<typeof outstandingAmountSchema>;
export const createOutstandingAmount = (n: number): OutstandingAmount =>
  outstandingAmountSchema.parse(n);
