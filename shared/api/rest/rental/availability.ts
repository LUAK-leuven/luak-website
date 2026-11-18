import { type infer as ZodInfer, number as zodNumber } from 'zod';

import type { DepositFee } from '#shared/api/rest/rental';
import type {
  RentalItemId,
  RentalItemName,
  TotalAmount,
} from '#shared/api/rest/rental/rentalItem';

declare const _availableAmountBrand: unique symbol;
const availableAmountSchema = zodNumber()
  .int()
  .brand<typeof _availableAmountBrand>();
export type AvailableAmount = ZodInfer<typeof availableAmountSchema>;
export const createAvailableAmount = (n: number): AvailableAmount =>
  availableAmountSchema.parse(n);

export type RentalItemWithAvailability = {
  id: RentalItemId;
  name: RentalItemName;
  depositFee: DepositFee;
  availableAmount: AvailableAmount;
  totalAmount: TotalAmount;
};
