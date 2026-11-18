import { type infer as ZodInfer, string as zodString } from 'zod';

import { amountSchema } from '#shared/types/common';
import { entityIdSchema } from '#shared/types/ddd';

declare const _depositFeeBrand: unique symbol;
const depositFeeSchema = amountSchema.brand<typeof _depositFeeBrand>();
export type DepositFee = ZodInfer<typeof depositFeeSchema>;
export const createDepositFee = (n: number): DepositFee =>
  depositFeeSchema.parse(n);

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
